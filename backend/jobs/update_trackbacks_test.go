package jobs

import (
	"context"
	"database/sql"
	"encoding/json"
	"testing"

	"github.com/cho45/hanrangon/backend/app"
	"github.com/cho45/hanrangon/backend/jobqueue"
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
	db, tfidfDB := dbs.MainDB.DB, dbs.TFIDFDB.DB

	config := app.LoadConfig()
	config.BaseURL = "https://example.com"

	// TF-IDF calculator and similarity calculator
	calc, err := tfidf.NewCalculator(tfidfDB, dbs.TFIDFDB.Q, db, dbs.MainDB.Q)
	if err != nil {
		t.Fatalf("failed to create calculator: %v", err)
	}
	sim := tfidf.NewSimilarityCalculator(tfidfDB, dbs.TFIDFDB.Q)
	searcher := tfidf.NewSearcher(tfidfDB, dbs.TFIDFDB.Q, calc)

	// Job queue
	registry := jobqueue.NewRegistry()
	worker := jobqueue.NewWorker(dbs.WorkerDB, dbs.WorkerDB.Q, registry)

	// App (Use same DB for simplicity if needed, but here we follow main.go pattern)
	application := app.NewApp(config, dbs.MainDB, dbs.TFIDFDB, dbs.WorkerDB, dbs.ImagesDB, calc, sim, searcher, worker)
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
