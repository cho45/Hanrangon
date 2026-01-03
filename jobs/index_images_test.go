package jobs

import (
	"context"
	"encoding/json"
	"image"
	"image/color"
	"image/png"
	"os"
	"path/filepath"
	"testing"

	"github.com/cho45/hanrangon/app"
	"github.com/cho45/hanrangon/jobqueue"
	"github.com/cho45/hanrangon/model"
	"github.com/cho45/hanrangon/tfidf"
	_ "github.com/mattn/go-sqlite3"
)

func TestIndexImagesJob_Execute(t *testing.T) {
	// Setup databases
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

	// TF-IDF calculator and similarity calculator
	tfidfQueries := model.New(tfidfDB)
	calc, err := tfidf.NewCalculator(tfidfDB, tfidfQueries)
	if err != nil {
		t.Fatalf("failed to create calculator: %v", err)
	}
	sim := tfidf.NewSimilarityCalculator(tfidfDB, tfidfQueries)

	// Create job queue
	registry := jobqueue.NewRegistry()
	workerQueries := model.New(workerDB)
	worker := jobqueue.NewWorker(workerDB, workerQueries, registry)

	application := app.NewApp(config, db, tfidfDB, workerDB, imagesDB, calc, sim, worker)
	job := NewIndexImagesJob(application)

	// Create a dummy image
	imgName := "test.png"
	imgFile := filepath.Join(tmpDir, imgName)
	f, _ := os.Create(imgFile)
	img := image.NewRGBA(image.Rect(0, 0, 10, 10))
	for x := 0; x < 10; x++ {
		for y := 0; y < 10; y++ {
			img.Set(x, y, color.RGBA{uint8(x * 25), uint8(y * 25), 0, 255})
		}
	}
	png.Encode(f, img)
	f.Close()

	ctx := context.Background()
	entryID := int64(1)
	body := `<p>Look at this: <img src="/images/entry/test.png" alt="test"></p>`
	_, err = db.Exec(`
		INSERT INTO entries (id, title, body, formatted_body, path, format, date, created_at, modified_at)
		VALUES (?, 'Title', 'Body', ?, 'path', 'Markdown', '2026-01-01', '2026-01-01 00:00:00', '2026-01-01 00:00:00')
	`, entryID, body)
	if err != nil {
		t.Fatal(err)
	}

	arg := IndexImagesArg{EntryID: entryID}
	argJSON, _ := json.Marshal(arg)
	if err := job.Execute(ctx, argJSON); err != nil {
		t.Fatalf("Execute failed: %v", err)
	}

	// Verify image records (in imagesDB, not main db)
	var uri string
	var sig []byte
	err = imagesDB.QueryRow("SELECT uri, sig FROM images WHERE entry_id = ?", entryID).Scan(&uri, &sig)
	if err != nil {
		t.Fatalf("failed to find image record: %v", err)
	}
	if uri != "/images/entry/test.png" {
		t.Errorf("unexpected uri: %s", uri)
	}
	if len(sig) != 8 {
		t.Errorf("unexpected signature length: %d", len(sig))
	}

	// Verify ngrams (in imagesDB)
	var count int
	err = imagesDB.QueryRow("SELECT COUNT(*) FROM ngram").Scan(&count)
	if err != nil {
		t.Fatal(err)
	}
	if count != 4 {
		t.Errorf("expected 4 ngrams, got %d", count)
	}
}
