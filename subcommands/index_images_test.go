package subcommands

import (
	"context"
	"image"
	"image/color"
	"image/png"
	"os"
	"path/filepath"
	"testing"

	"github.com/cho45/hanrangon/app"
	"github.com/cho45/hanrangon/internal/testutil"
	"github.com/cho45/hanrangon/jobqueue"
	"github.com/cho45/hanrangon/model"
	"github.com/cho45/hanrangon/tfidf"
	_ "github.com/mattn/go-sqlite3"
)

func TestIndexImages_Missing(t *testing.T) {
	dbs := testutil.SetupAllDBs(t)
	defer dbs.Close()
	db, tfidfDB, workerDB, imagesDB := dbs.Main, dbs.TFIDF, dbs.Worker, dbs.Images

	tmpDir := t.TempDir()
	config := app.LoadConfig()
	config.BaseURL = "http://localhost:5555"
	config.UploadURLPrefix = "/images/entry/"
	config.UploadDir = tmpDir

	// Setup app
	tfidfQueries := model.New(tfidfDB)
	dataQueries := model.New(db)
	calc, _ := tfidf.NewCalculator(tfidfDB, tfidfQueries, db, dataQueries)
	sim := tfidf.NewSimilarityCalculator(tfidfDB, tfidfQueries)
	searcher := tfidf.NewSearcher(tfidfDB, tfidfQueries, calc)
	registry := jobqueue.NewRegistry()
	workerQueries := model.New(workerDB)
	worker := jobqueue.NewWorker(workerDB, workerQueries, registry)

	application := app.NewApp(config, db, tfidfDB, workerDB, imagesDB, calc, sim, searcher, worker)

	// Create a test image
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

	// 1. Insert entry 1 with image
	entryID1 := int64(1)
	body1 := `<p><img src="/images/entry/test.png"></p>`
	_, err := db.Exec(`
		INSERT INTO entries (id, title, body, formatted_body, path, format, date, created_at, modified_at)
		VALUES (?, 'Title 1', 'Body 1', ?, 'path1', 'Markdown', '2026-01-01', '2026-01-01 00:00:00', '2026-01-01 00:00:00')
	`, entryID1, body1)
	if err != nil {
		t.Fatal(err)
	}

	// 2. Insert entry 2 with image (which will remain unindexed)
	entryID2 := int64(2)
	body2 := `<p><img src="/images/entry/test.png"></p>`
	_, err = db.Exec(`
		INSERT INTO entries (id, title, body, formatted_body, path, format, date, created_at, modified_at)
		VALUES (?, 'Title 2', 'Body 2', ?, 'path2', 'Markdown', '2026-01-02', '2026-01-01 00:00:00', '2026-01-01 00:00:00')
	`, entryID2, body2)
	if err != nil {
		t.Fatal(err)
	}

	// 3. Manually insert an "unindexed" image record for entry 2
	_, err = imagesDB.Exec(`
		INSERT INTO images (uri, entry_id, sig) VALUES (?, ?, ?)
	`, "/images/entry/test.png", entryID2, []byte{})
	if err != nil {
		t.Fatal(err)
	}

	// 4. Run index-images (default: sync + fill)
	err = IndexImages(ctx, application, []string{"--force"})
	if err != nil {
		t.Fatalf("IndexImages failed: %v", err)
	}

	// Entry 2 should now have a signature
	var sig2 []byte
	err = imagesDB.QueryRow("SELECT sig FROM images WHERE entry_id = ?", entryID2).Scan(&sig2)
	if err != nil {
		t.Fatalf("failed to find image record for entry 2: %v", err)
	}
	if len(sig2) == 0 {
		t.Errorf("entry 2 should have been indexed")
	}

	// Entry 1 should ALSO have a record and signature now (Sync created it, Fill indexed it)
	var sig1 []byte
	err = imagesDB.QueryRow("SELECT sig FROM images WHERE entry_id = ?", entryID1).Scan(&sig1)
	if err != nil {
		t.Fatalf("failed to find image record for entry 1: %v", err)
	}
	if len(sig1) == 0 {
		t.Errorf("entry 1 should have been indexed after sync+fill")
	}
}
