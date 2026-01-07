package jobs

import (
	"context"
	"encoding/json"
	"image"
	"image/png"
	"os"
	"path/filepath"
	"testing"

	"github.com/cho45/hanrangon/app"
	"github.com/cho45/hanrangon/jobqueue"
	"github.com/cho45/hanrangon/model"
	"github.com/cho45/hanrangon/tfidf"
)

func TestIndexImagesJob_UniqueConstraintError(t *testing.T) {
	db, tfidfDB, workerDB, imagesDB := setupTestDB(t)
	defer db.Close()
	defer tfidfDB.Close()
	defer workerDB.Close()
	defer imagesDB.Close()

	tmpDir, _ := os.MkdirTemp("", "hanrangon-index-test")
	defer os.RemoveAll(tmpDir)

	config := &app.Config{
		BaseURL:         "http://localhost:5555",
		UploadURLPrefix: "/images/entry/",
		UploadDir:       tmpDir,
	}

	tfidfQueries := model.New(tfidfDB)
	calc, err := tfidf.NewCalculator(tfidfDB, model.New(tfidfDB), db, model.New(db))
	sim := tfidf.NewSimilarityCalculator(tfidfDB, tfidfQueries)
	registry := jobqueue.NewRegistry()
	workerQueries := model.New(workerDB)
	worker := jobqueue.NewWorker(workerDB, workerQueries, registry)

	application := app.NewApp(config, db, tfidfDB, workerDB, imagesDB, calc, sim, worker)
	job := NewIndexImagesJob(application)

	// Create dummy image
	imgName := "test.png"
	imgFile := filepath.Join(tmpDir, imgName)
	f, _ := os.Create(imgFile)
	img := image.NewRGBA(image.Rect(0, 0, 10, 10))
	png.Encode(f, img)
	f.Close()

	ctx := context.Background()
	entryID := int64(1)
	body := `<p><img src="/images/entry/test.png"></p>`
	db.Exec(`INSERT INTO entries (id, title, body, formatted_body, path, format, date, created_at, modified_at)
		VALUES (?, 'Title', 'Body', ?, 'path', 'Markdown', '2026-01-01', '2026-01-01 00:00:00', '2026-01-01 00:00:00')`,
		entryID, body)

	// 1. Run job normally
	arg := IndexImagesArg{EntryID: entryID}
	argJSON, _ := json.Marshal(arg)
	if err := job.Execute(ctx, argJSON); err != nil {
		t.Fatalf("First execute failed: %v", err)
	}

	// 2. Create an "orphaned" ngram record
	// First, find the image ID
	var imageID int64
	err = imagesDB.QueryRow("SELECT id FROM images WHERE entry_id = ?", entryID).Scan(&imageID)
	if err != nil {
		t.Fatal(err)
	}

	// Delete the image but KEEP the ngrams
	_, err = imagesDB.Exec("DELETE FROM images WHERE id = ?", imageID)
	if err != nil {
		t.Fatal(err)
	}

	// Now we have orphaned ngrams for imageID.
	// Since we deleted the only image, SQLite will likely reuse the same ROWID for the next insert.

	// 3. Run job again
	if err := job.Execute(ctx, argJSON); err != nil {
		t.Fatalf("Second execute failed: %v", err)
	}
}
