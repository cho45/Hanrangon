package jobs

import (
	"context"
	"database/sql"
	"encoding/json"
	"testing"

	"github.com/cho45/hanrangon/backend/app"
	"github.com/cho45/hanrangon/backend/jobqueue"
	"github.com/cho45/hanrangon/backend/model"
	"github.com/cho45/hanrangon/backend/model/imagesdb"
	"github.com/cho45/hanrangon/backend/model/maindb"
	"github.com/cho45/hanrangon/backend/model/tfidfdb"
	"github.com/cho45/hanrangon/backend/model/workerdb"
	"github.com/cho45/hanrangon/backend/tfidf"
	"github.com/cho45/hanrangon/internal/testutil"
	_ "github.com/mattn/go-sqlite3"
)

// TestUpdateTrackbacksJob_Name はジョブ名が正しく返されることを検証する
func TestUpdateTrackbacksJob_Name(t *testing.T) {
	application, _ := setupTestApp(t)
	job := NewUpdateTrackbacksJob(application)

	got := job.Name()
	want := "UpdateTrackbacks"

	if got != want {
		t.Errorf("Name() = %q, want %q", got, want)
	}
}

// TestUpdateTrackbacksJob_ImplementsJobHandler はJobHandlerインターフェースを実装していることを検証する
func TestUpdateTrackbacksJob_ImplementsJobHandler(t *testing.T) {
	application, _ := setupTestApp(t)
	//nolint:staticcheck // 明示的にインターフェースの実装を検証するため型を明示
	var _ jobqueue.JobHandler = NewUpdateTrackbacksJob(application)
}

func setupTestApp(t *testing.T) (app.App, *sql.DB) {
	t.Helper()
	dbs := testutil.SetupAllDBs(t)
	db, tfidfDB, workerDB, imagesDB := dbs.Main, dbs.TFIDF, dbs.Worker, dbs.Images

	config := app.LoadConfig()
	config.BaseURL = "https://example.com"

	// Database wrappers
	mainDBWrapper := model.NewDatabase[maindb.Querier](db, func(tx model.DBTX) maindb.Querier { return maindb.New(tx) })
	tfidfDBWrapper := model.NewDatabase[tfidfdb.Querier](tfidfDB, func(tx model.DBTX) tfidfdb.Querier { return tfidfdb.New(tx) })
	workerDBWrapper := model.NewDatabase[workerdb.Querier](workerDB, func(tx model.DBTX) workerdb.Querier { return workerdb.New(tx) })
	imagesDBWrapper := model.NewDatabase[imagesdb.Querier](imagesDB, func(tx model.DBTX) imagesdb.Querier { return imagesdb.New(tx) })

	// TF-IDF calculator and similarity calculator
	calc, err := tfidf.NewCalculator(tfidfDB, tfidfDBWrapper.Q, db, mainDBWrapper.Q)
	if err != nil {
		t.Fatalf("failed to create calculator: %v", err)
	}
	sim := tfidf.NewSimilarityCalculator(tfidfDB, tfidfDBWrapper.Q)
	searcher := tfidf.NewSearcher(tfidfDB, tfidfDBWrapper.Q, calc)

	// Job queue
	registry := jobqueue.NewRegistry()
	worker := jobqueue.NewWorker(workerDBWrapper, workerDBWrapper.Q, registry)

	// App (Use same DB for simplicity if needed, but here we follow main.go pattern)
	application := app.NewApp(config, mainDBWrapper, tfidfDBWrapper, workerDBWrapper, imagesDBWrapper, calc, sim, searcher, worker)
	return application, db
}

func TestUpdateTrackbacksJob_Execute(t *testing.T) {
	application, db := setupTestApp(t)

	job := NewUpdateTrackbacksJob(application)

	ctx := context.Background()

	// 1. ターゲットとなるエントリを作成
	targetID := int64(10)
	_, err := db.Exec(`
		INSERT INTO entries (id, title, body, formatted_body, path, format, date, created_at, modified_at)
		VALUES (?, 'Target', 'Body', 'Formatted', '2026/01/01/1', 'Markdown', '2026-01-01', '2026-01-01 00:00:00', '2026-01-01 00:00:00')
	`, targetID)
	if err != nil {
		t.Fatal(err)
	}

	// 2. 他のエントリへのリンクを含むエントリを作成
	sourceID := int64(20)
	formattedBody := `
		Check this out: <a href="https://example.com/2026/01/01/1">Target Entry</a>.
		And another one (invalid): <a href="https://other.com/2026/01/01/1">Other</a>.
	`
	_, err = db.Exec(`
		INSERT INTO entries (id, title, body, formatted_body, path, format, date, created_at, modified_at)
		VALUES (?, 'Source', 'Body', ?, '2026/01/02/1', 'Markdown', '2026-01-02', '2026-01-02 00:00:00', '2026-01-02 00:00:00')
	`, sourceID, formattedBody)
	if err != nil {
		t.Fatal(err)
	}

	// 3. すでに存在する古いトラックバックを作成（削除されることを確認するため）
	_, err = db.Exec(`
		INSERT INTO trackbacks (entry_id, trackback_entry_id) VALUES (99, ?)
	`, sourceID)
	if err != nil {
		t.Fatal(err)
	}

	// ジョブの実行
	arg := UpdateTrackbacksArg{EntryID: sourceID}
	argJSON, _ := json.Marshal(arg)
	if err := job.Execute(ctx, argJSON); err != nil {
		t.Fatalf("Execute failed: %v", err)
	}

	// 4. 検証：古いトラックバック（ID 99）が消えていること
	var count int
	err = db.QueryRow("SELECT COUNT(*) FROM trackbacks WHERE entry_id = 99").Scan(&count)
	if err != nil {
		t.Fatal(err)
	}
	if count != 0 {
		t.Errorf("old trackback was not deleted")
	}

	// 5. 検証：新しいトラックバックが正しく作成されていること
	var linkedEntryID int64
	err = db.QueryRow("SELECT entry_id FROM trackbacks WHERE trackback_entry_id = ?", sourceID).Scan(&linkedEntryID)
	if err != nil {
		t.Fatalf("failed to find created trackback: %v", err)
	}
	if linkedEntryID != targetID {
		t.Errorf("expected linked entry ID %d, got %d", targetID, linkedEntryID)
	}

	// 6. 検証：重複リンクが1つとして扱われること
	_, err = db.Exec(`UPDATE entries SET formatted_body = ? WHERE id = ?`,
		formattedBody+`<a href="https://example.com/2026/01/01/1">Duplicate</a>`, sourceID)
	if err != nil {
		t.Fatal(err)
	}

	if err := job.Execute(ctx, argJSON); err != nil {
		t.Fatal(err)
	}

	err = db.QueryRow("SELECT COUNT(*) FROM trackbacks WHERE trackback_entry_id = ?", sourceID).Scan(&count)
	if err != nil {
		t.Fatal(err)
	}
	if count != 1 {
		t.Errorf("expected 1 trackback for duplicate links, got %d", count)
	}
}
