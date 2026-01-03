package jobs

import (
	"context"
	"database/sql"
	"encoding/json"
	"os"
	"testing"

	"github.com/cho45/hanrangon/app"
	"github.com/cho45/hanrangon/jobqueue"
	"github.com/cho45/hanrangon/model"
	"github.com/cho45/hanrangon/tfidf"
	_ "github.com/mattn/go-sqlite3"
)

func setupTestDB(t *testing.T) (*sql.DB, *sql.DB, *sql.DB, *sql.DB) {
	t.Helper()

	// Main DB
	db, err := sql.Open("sqlite3", ":memory:")
	if err != nil {
		t.Fatalf("failed to open memory db: %v", err)
	}
	schema, err := os.ReadFile("../db/schema/schema.sql")
	if err != nil {
		t.Fatalf("failed to read schema: %v", err)
	}
	if _, err := db.Exec(string(schema)); err != nil {
		t.Fatalf("failed to apply schema: %v", err)
	}

	// TFIDF DB
	tfidfDB, err := sql.Open("sqlite3_with_math_functions", ":memory:")
	if err != nil {
		t.Fatalf("failed to open memory tfidf db: %v", err)
	}
	tfidfSchema, err := os.ReadFile("../db/schema/tfidf.sql")
	if err != nil {
		t.Fatalf("failed to read tfidf schema: %v", err)
	}
	if _, err := tfidfDB.Exec(string(tfidfSchema)); err != nil {
		t.Fatalf("failed to apply tfidf schema: %v", err)
	}

	// Worker DB
	workerDB, err := sql.Open("sqlite3", ":memory:")
	if err != nil {
		t.Fatalf("failed to open memory worker db: %v", err)
	}
	workerSchema, err := os.ReadFile("../db/schema/worker.sql")
	if err != nil {
		t.Fatalf("failed to read worker schema: %v", err)
	}
	if _, err := workerDB.Exec(string(workerSchema)); err != nil {
		t.Fatalf("failed to apply worker schema: %v", err)
	}

	// Images DB
	imagesDB, err := sql.Open("sqlite3", ":memory:")
	if err != nil {
		t.Fatalf("failed to open memory images db: %v", err)
	}
	imagesSchema, err := os.ReadFile("../db/schema/images.sql")
	if err != nil {
		t.Fatalf("failed to read images schema: %v", err)
	}
	if _, err := imagesDB.Exec(string(imagesSchema)); err != nil {
		t.Fatalf("failed to apply images schema: %v", err)
	}

	return db, tfidfDB, workerDB, imagesDB
}

func setupTestApp(t *testing.T) (app.App, *sql.DB) {
	t.Helper()
	db, tfidfDB, workerDB, imagesDB := setupTestDB(t)

	config := &app.Config{
		BaseURL: "https://example.com",
	}

	// TF-IDF calculator and similarity calculator
	tfidfQueries := model.New(tfidfDB)
	calc, err := tfidf.NewCalculator(tfidfDB, tfidfQueries)
	if err != nil {
		t.Fatalf("failed to create calculator: %v", err)
	}
	sim := tfidf.NewSimilarityCalculator(tfidfDB, tfidfQueries)

	// Create job queue for testing
	registry := jobqueue.NewRegistry()
	workerQueries := model.New(workerDB)
	worker := jobqueue.NewWorker(workerDB, workerQueries, registry)

	application := app.NewApp(config, db, tfidfDB, workerDB, imagesDB, calc, sim, worker)
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
