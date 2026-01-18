package jobs

import (
	"context"
	"encoding/json"
	"image"
	"image/png"
	"os"
	"path/filepath"
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
)

func TestIndexImagesJob_UniqueConstraintError(t *testing.T) {
	dbs := testutil.SetupAllDBs(t)
	defer dbs.Close()
	db, tfidfDB, workerDB, imagesDB := dbs.Main, dbs.TFIDF, dbs.Worker, dbs.Images

	tmpDir, _ := os.MkdirTemp("", "hanrangon-index-test")
	defer os.RemoveAll(tmpDir)

	config := app.LoadConfig()
	config.BaseURL = "http://localhost:5555"
	config.UploadURLPrefix = "/images/entry/"
	config.UploadDir = tmpDir

	// Database wrappers
	mainDBWrapper := model.NewDatabase[maindb.Querier](db, func(tx model.DBTX) maindb.Querier { return maindb.New(tx) })
	tfidfDBWrapper := model.NewDatabase[tfidfdb.Querier](tfidfDB, func(tx model.DBTX) tfidfdb.Querier { return tfidfdb.New(tx) })
	workerDBWrapper := model.NewDatabase[workerdb.Querier](workerDB, func(tx model.DBTX) workerdb.Querier { return workerdb.New(tx) })
	imagesDBWrapper := model.NewDatabase[imagesdb.Querier](imagesDB, func(tx model.DBTX) imagesdb.Querier { return imagesdb.New(tx) })

	calc, err := tfidf.NewCalculator(tfidfDB, tfidfDBWrapper.Q, db, mainDBWrapper.Q)
	if err != nil {
		t.Fatal(err)
	}
	sim := tfidf.NewSimilarityCalculator(tfidfDB, tfidfDBWrapper.Q)
	searcher := tfidf.NewSearcher(tfidfDB, tfidfDBWrapper.Q, calc)

	registry := jobqueue.NewRegistry()
	worker := jobqueue.NewWorker(model.NewDatabase[*workerdb.Queries](workerDB, func(tx model.DBTX) *workerdb.Queries { return workerdb.New(tx.(workerdb.DBTX)) }), workerDBWrapper.Q.(*workerdb.Queries), registry)

	application := app.NewApp(config, mainDBWrapper, tfidfDBWrapper, workerDBWrapper, imagesDBWrapper, calc, sim, searcher, worker)
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
