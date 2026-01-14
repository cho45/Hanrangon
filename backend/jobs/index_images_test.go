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

func createTestImage(t *testing.T, path string, seed int) {
	f, err := os.Create(path)
	if err != nil {
		t.Fatalf("failed to create image file: %v", err)
	}
	defer f.Close()

	img := image.NewRGBA(image.Rect(0, 0, 64, 64))
	// Create several large blocks of different colors based on seed
	colors := []color.RGBA{
		{255, 0, 0, 255},   // Red
		{0, 255, 0, 255},   // Green
		{0, 0, 255, 255},   // Blue
		{255, 255, 0, 255}, // Yellow
	}

	for y := 0; y < 64; y++ {
		for x := 0; x < 64; x++ {
			// Select color based on coordinates and seed
			cIdx := (x/16 + y/16 + seed) % len(colors)
			img.Set(x, y, colors[cIdx])
		}
	}
	if err := png.Encode(f, img); err != nil {
		t.Fatalf("failed to encode image: %v", err)
	}
}

func TestIndexImagesJob_Execute(t *testing.T) {
	// Setup databases
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

	// TF-IDF calculator and similarity calculator
	calc, err := tfidf.NewCalculator(tfidfDB, tfidfDBWrapper.Q, db, mainDBWrapper.Q)
	if err != nil {
		t.Fatalf("failed to create calculator: %v", err)
	}
	sim := tfidf.NewSimilarityCalculator(tfidfDB, tfidfDBWrapper.Q)
	searcher := tfidf.NewSearcher(tfidfDB, tfidfDBWrapper.Q, calc)

	// Create job queue
	registry := jobqueue.NewRegistry()
	worker := jobqueue.NewWorker(workerDB, workerDBWrapper.Q, registry)

	application := app.NewApp(config, mainDBWrapper, tfidfDBWrapper, workerDBWrapper, imagesDBWrapper, calc, sim, searcher, worker)
	job := NewIndexImagesJob(application)

	// Create a dummy image
	imgName := "test.png"
	imgFile := filepath.Join(tmpDir, imgName)
	createTestImage(t, imgFile, 1)

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

	// With the new word calculation (offset << 12 | pattern),
	// each of the 53 sliding window positions produces a unique word
	// regardless of the pattern overlap, because the offset is unique.
	if count != 53 {
		t.Errorf("expected 53 unique ngrams, got %d", count)
	}
}

func TestIndexImagesJob_HandleLoadFailure(t *testing.T) {
	// Setup databases
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

	calc, _ := tfidf.NewCalculator(tfidfDB, tfidfDBWrapper.Q, db, mainDBWrapper.Q)
	sim := tfidf.NewSimilarityCalculator(tfidfDB, tfidfDBWrapper.Q)
	searcher := tfidf.NewSearcher(tfidfDB, tfidfDBWrapper.Q, calc)

	registry := jobqueue.NewRegistry()
	worker := jobqueue.NewWorker(workerDB, workerDBWrapper.Q, registry)

	application := app.NewApp(config, mainDBWrapper, tfidfDBWrapper, workerDBWrapper, imagesDBWrapper, calc, sim, searcher, worker)
	job := NewIndexImagesJob(application)

	ctx := context.Background()
	entryID := int64(1)
	// image that doesn't exist
	body := `<p>Look at this: <img src="/images/entry/nonexistent.png" alt="test"></p>`
	_, err := db.Exec(`
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

	// Verify image record exists with empty sig
	var uri string
	var sig []byte
	err = imagesDB.QueryRow("SELECT uri, sig FROM images WHERE entry_id = ?", entryID).Scan(&uri, &sig)
	if err != nil {
		t.Fatalf("failed to find image record: %v", err)
	}
	if uri != "/images/entry/nonexistent.png" {
		t.Errorf("unexpected uri: %s", uri)
	}
	if len(sig) != 0 {
		t.Errorf("expected empty sig, got length %d", len(sig))
	}
}

func TestIndexImagesJob_TwoPhase(t *testing.T) {
	dbs := testutil.SetupAllDBs(t)
	defer dbs.Close()
	db, tfidfDB, workerDB, imagesDB := dbs.Main, dbs.TFIDF, dbs.Worker, dbs.Images

	tmpDir := t.TempDir()
	config := app.LoadConfig()
	config.BaseURL = "http://localhost:5555"
	config.UploadURLPrefix = "/images/entry/"
	config.UploadDir = tmpDir

	// Database wrappers
	mainDBWrapper := model.NewDatabase[maindb.Querier](db, func(tx model.DBTX) maindb.Querier { return maindb.New(tx) })
	tfidfDBWrapper := model.NewDatabase[tfidfdb.Querier](tfidfDB, func(tx model.DBTX) tfidfdb.Querier { return tfidfdb.New(tx) })
	workerDBWrapper := model.NewDatabase[workerdb.Querier](workerDB, func(tx model.DBTX) workerdb.Querier { return workerdb.New(tx) })
	imagesDBWrapper := model.NewDatabase[imagesdb.Querier](imagesDB, func(tx model.DBTX) imagesdb.Querier { return imagesdb.New(tx) })

	calc, _ := tfidf.NewCalculator(tfidfDB, tfidfDBWrapper.Q, db, mainDBWrapper.Q)
	sim := tfidf.NewSimilarityCalculator(tfidfDB, tfidfDBWrapper.Q)
	searcher := tfidf.NewSearcher(tfidfDB, tfidfDBWrapper.Q, calc)
	registry := jobqueue.NewRegistry()
	worker := jobqueue.NewWorker(workerDB, workerDBWrapper.Q, registry)

	application := app.NewApp(config, mainDBWrapper, tfidfDBWrapper, workerDBWrapper, imagesDBWrapper, calc, sim, searcher, worker)
	job := NewIndexImagesJob(application)

	// Create a dummy image
	imgName := "test.png"
	imgFile := filepath.Join(tmpDir, imgName)
	createTestImage(t, imgFile, 1)

	ctx := context.Background()
	entryID := int64(1)

	// 1. Initial Sync
	body := `<p><img src="/images/entry/test.png"></p>`
	_, err := db.Exec(`INSERT INTO entries (id, title, body, formatted_body, path, format, date, created_at, modified_at)
		VALUES (?, 'Title', 'Body', ?, 'path', 'Markdown', '2026-01-01', '2026-01-01 00:00:00', '2026-01-01 00:00:00')`,
		entryID, body)
	if err != nil {
		t.Fatal(err)
	}

	if err := job.SyncImagesForEntry(ctx, entryID); err != nil {
		t.Fatalf("Sync failed: %v", err)
	}

	// Verify record exists with empty sig
	var id1 int64
	var sig1 []byte
	err = imagesDB.QueryRow("SELECT id, sig FROM images WHERE entry_id = ?", entryID).Scan(&id1, &sig1)
	if err != nil {
		t.Fatal(err)
	}
	if len(sig1) != 0 {
		t.Error("sig should be empty after sync")
	}

	// 2. Initial Fill
	if err := job.FillImagesForEntry(ctx, entryID, false); err != nil {
		t.Fatalf("Fill failed: %v", err)
	}

	// Verify sig is filled
	err = imagesDB.QueryRow("SELECT sig FROM images WHERE id = ?", id1).Scan(&sig1)
	if err != nil {
		t.Fatal(err)
	}
	if len(sig1) == 0 {
		t.Error("sig should be filled after fill")
	}

	// 3. Update entry (add one image, remove one image)
	// Create another image
	imgName2 := "test2.png"
	imgFile2 := filepath.Join(tmpDir, imgName2)
	createTestImage(t, imgFile2, 2)

	newBody := `<p><img src="/images/entry/test2.png"></p>` // test.png is gone
	db.Exec(`UPDATE entries SET formatted_body = ? WHERE id = ?`, newBody, entryID)

	if err := job.SyncImagesForEntry(ctx, entryID); err != nil {
		t.Fatalf("Second sync failed: %v", err)
	}

	// Verify test.png is gone and test2.png is added
	var count int
	imagesDB.QueryRow("SELECT COUNT(*) FROM images WHERE entry_id = ?", entryID).Scan(&count)
	if count != 1 {
		t.Errorf("expected 1 image, got %d", count)
	}

	var uri string
	var sig2 []byte
	err = imagesDB.QueryRow("SELECT uri, sig FROM images WHERE entry_id = ?", entryID).Scan(&uri, &sig2)
	if err != nil {
		t.Fatal(err)
	}
	if uri != "/images/entry/test2.png" {
		t.Errorf("unexpected uri: %s", uri)
	}
	if len(sig2) != 0 {
		t.Error("new image sig should be empty")
	}

	// 4. Final Fill
	if err := job.FillImagesForEntry(ctx, entryID, false); err != nil {
		t.Fatalf("Final fill failed: %v", err)
	}
	err = imagesDB.QueryRow("SELECT sig FROM images WHERE entry_id = ?", entryID).Scan(&sig2)
	if err != nil {
		t.Fatal(err)
	}
	if len(sig2) == 0 {
		t.Error("sig should be filled after final fill")
	}
}

func TestIndexImagesJob_SyncRobustness(t *testing.T) {
	dbs := testutil.SetupAllDBs(t)
	defer dbs.Close()
	db, tfidfDB, workerDB, imagesDB := dbs.Main, dbs.TFIDF, dbs.Worker, dbs.Images

	config := app.LoadConfig()
	// Database wrappers
	mainDBWrapper := model.NewDatabase[maindb.Querier](db, func(tx model.DBTX) maindb.Querier { return maindb.New(tx) })
	tfidfDBWrapper := model.NewDatabase[tfidfdb.Querier](tfidfDB, func(tx model.DBTX) tfidfdb.Querier { return tfidfdb.New(tx) })
	workerDBWrapper := model.NewDatabase[workerdb.Querier](workerDB, func(tx model.DBTX) workerdb.Querier { return workerdb.New(tx) })
	imagesDBWrapper := model.NewDatabase[imagesdb.Querier](imagesDB, func(tx model.DBTX) imagesdb.Querier { return imagesdb.New(tx) })

	application := app.NewApp(config, mainDBWrapper, tfidfDBWrapper, workerDBWrapper, imagesDBWrapper, nil, nil, nil, nil)
	job := NewIndexImagesJob(application)

	ctx := context.Background()
	entryID := int64(100)

	tests := []struct {
		name     string
		html     string
		expected []string
	}{
		{
			name:     "Basic",
			html:     `<img src="/a.png">`,
			expected: []string{"/a.png"},
		},
		{
			name:     "Mixed quotes and no quotes",
			html:     `<img src='/a.png'> <img src="/b.png"> <img src=/c.png>`,
			expected: []string{"/a.png", "/b.png", "/c.png"},
		},
		{
			name:     "Attributes before src",
			html:     `<img alt="foo" src="/a.png">`,
			expected: []string{"/a.png"},
		},
		{
			name:     "src-like string in other attributes",
			html:     `<img alt="my src='/fake.png'" src="/real.png">`,
			expected: []string{"/real.png"},
		},
		{
			name:     "Duplicated URLs",
			html:     `<img src="/a.png"> <img src="/a.png">`,
			expected: []string{"/a.png"},
		},
		{
			name:     "HTML entities in URL",
			html:     `<img src="/path?a=1&amp;b=2">`,
			expected: []string{"/path?a=1&b=2"},
		},
		{
			name:     "Upper case tag and attribute",
			html:     `<IMG SRC="/a.png">`,
			expected: []string{"/a.png"},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// Setup entry
			_, err := db.Exec("DELETE FROM entries WHERE id = ?", entryID)
			if err != nil {
				t.Fatal(err)
			}
			_, err = db.Exec(`INSERT INTO entries (id, title, body, formatted_body, path, format, date, created_at, modified_at)
				VALUES (?, 'T', 'B', ?, 'P', 'M', '2026-01-01', '2026-01-01', '2026-01-01')`,
				entryID, tt.html)
			if err != nil {
				t.Fatal(err)
			}

			// Run Sync
			if err := job.SyncImagesForEntry(ctx, entryID); err != nil {
				t.Fatalf("Sync failed: %v", err)
			}

			// Verify results
			rows, err := imagesDB.Query("SELECT uri FROM images WHERE entry_id = ? ORDER BY uri", entryID)
			if err != nil {
				t.Fatal(err)
			}
			var actual []string
			for rows.Next() {
				var u string
				rows.Scan(&u)
				actual = append(actual, u)
			}
			rows.Close()

			// Simple sort check (expected is not necessarily sorted in the struct, but we want to compare sets)
			if len(actual) != len(tt.expected) {
				t.Errorf("expected %d urls, got %d: %v", len(tt.expected), len(actual), actual)
				return
			}
			for _, exp := range tt.expected {
				found := false
				for _, act := range actual {
					if exp == act {
						found = true
						break
					}
				}
				if !found {
					t.Errorf("expected url %s not found in %v", exp, actual)
				}
			}
		})
	}
}

func TestIndexImagesJob_CorruptImage(t *testing.T) {
	dbs := testutil.SetupAllDBs(t)
	defer dbs.Close()
	db, tfidfDB, workerDB, imagesDB := dbs.Main, dbs.TFIDF, dbs.Worker, dbs.Images

	tmpDir := t.TempDir()
	config := app.LoadConfig()
	config.BaseURL = "http://localhost:5555"
	config.UploadURLPrefix = "/images/entry/"
	config.UploadDir = tmpDir

	// Database wrappers
	mainDBWrapper := model.NewDatabase[maindb.Querier](db, func(tx model.DBTX) maindb.Querier { return maindb.New(tx) })
	tfidfDBWrapper := model.NewDatabase[tfidfdb.Querier](tfidfDB, func(tx model.DBTX) tfidfdb.Querier { return tfidfdb.New(tx) })
	workerDBWrapper := model.NewDatabase[workerdb.Querier](workerDB, func(tx model.DBTX) workerdb.Querier { return workerdb.New(tx) })
	imagesDBWrapper := model.NewDatabase[imagesdb.Querier](imagesDB, func(tx model.DBTX) imagesdb.Querier { return imagesdb.New(tx) })

	application := app.NewApp(config, mainDBWrapper, tfidfDBWrapper, workerDBWrapper, imagesDBWrapper, nil, nil, nil, nil)
	job := NewIndexImagesJob(application)

	// Create a corrupt image file (just some random text)
	imgName := "corrupt.png"
	imgFile := filepath.Join(tmpDir, imgName)
	os.WriteFile(imgFile, []byte("this is not a png file"), 0644)

	ctx := context.Background()
	entryID := int64(1)
	body := `<p><img src="/images/entry/corrupt.png"></p>`
	db.Exec(`INSERT INTO entries (id, title, body, formatted_body, path, format, date, created_at, modified_at)
		VALUES (?, 'T', 'B', ?, 'P', 'M', '2026-01-01', '2026-01-01', '2026-01-01')`,
		entryID, body)

	// Sync should succeed
	if err := job.SyncImagesForEntry(ctx, entryID); err != nil {
		t.Fatal(err)
	}

	// Fill should also "succeed" but set sig to empty
	if err := job.FillImagesForEntry(ctx, entryID, false); err != nil {
		t.Fatalf("Fill failed: %v", err)
	}

	var sig []byte
	err := imagesDB.QueryRow("SELECT sig FROM images WHERE entry_id = ?", entryID).Scan(&sig)
	if err != nil {
		t.Fatal(err)
	}
	if len(sig) != 0 {
		t.Error("corrupt image should have empty sig")
	}
}

func TestIndexImagesJob_Rollback(t *testing.T) {
	dbs := testutil.SetupAllDBs(t)
	defer dbs.Close()
	db, tfidfDB, workerDB, imagesDB := dbs.Main, dbs.TFIDF, dbs.Worker, dbs.Images

	tmpDir := t.TempDir()
	config := app.LoadConfig()
	config.BaseURL = "http://localhost:5555"
	config.UploadURLPrefix = "/images/entry/"
	config.UploadDir = tmpDir

	// Database wrappers
	mainDBWrapper := model.NewDatabase[maindb.Querier](db, func(tx model.DBTX) maindb.Querier { return maindb.New(tx) })
	tfidfDBWrapper := model.NewDatabase[tfidfdb.Querier](tfidfDB, func(tx model.DBTX) tfidfdb.Querier { return tfidfdb.New(tx) })
	workerDBWrapper := model.NewDatabase[workerdb.Querier](workerDB, func(tx model.DBTX) workerdb.Querier { return workerdb.New(tx) })
	imagesDBWrapper := model.NewDatabase[imagesdb.Querier](imagesDB, func(tx model.DBTX) imagesdb.Querier { return imagesdb.New(tx) })

	application := app.NewApp(config, mainDBWrapper, tfidfDBWrapper, workerDBWrapper, imagesDBWrapper, nil, nil, nil, nil)
	job := NewIndexImagesJob(application)

	ctx := context.Background()
	entryID := int64(1)

	// --- 1. Test Sync Rollback ---
	// Initial state: one image
	imagesDB.Exec("INSERT INTO images (uri, entry_id, sig) VALUES ('/old.png', ?, 'sig')", entryID)

	// Setup a trigger to fail when a specific URI is inserted
	imagesDB.Exec(`
		CREATE TRIGGER fail_on_trigger_uri BEFORE INSERT ON images
		BEGIN
			SELECT RAISE(FAIL, 'forced rollback') WHERE NEW.uri = '/fail-me.png';
		END;
	`)

	// New content has one valid new image and one "fail" image
	body := `<p><img src="/new.png"> <img src="/fail-me.png"></p>`
	db.Exec(`INSERT INTO entries (id, title, body, formatted_body, path, format, date, created_at, modified_at)
		VALUES (?, 'T', 'B', ?, 'P', 'M', '2026-01-01', '2026-01-01', '2026-01-01')`,
		entryID, body)

	err := job.SyncImagesForEntry(ctx, entryID)
	if err == nil {
		t.Fatal("Sync should have failed due to trigger")
	}

	// Verify Rollback: /old.png should still exist
	var count int
	imagesDB.QueryRow("SELECT COUNT(*) FROM images WHERE uri = '/old.png' AND entry_id = ?", entryID).Scan(&count)
	if count != 1 {
		t.Errorf("Sync rollback failed: /old.png was deleted and not restored")
	}
	imagesDB.QueryRow("SELECT COUNT(*) FROM images WHERE uri = '/new.png'").Scan(&count)
	if count != 0 {
		t.Errorf("Sync rollback failed: /new.png was partially inserted")
	}

	// --- 2. Test Fill Rollback ---
	// Prepare a clean state with one unindexed image
	imagesDB.Exec("DELETE FROM images")
	imagesDB.Exec("DROP TRIGGER IF EXISTS fail_on_trigger_uri")
	// Use the correct prefix for loadImage to work
	testURI := "/images/entry/test.png"
	imagesDB.Exec("INSERT INTO images (uri, entry_id, sig) VALUES (?, ?, '')", testURI, entryID)

	// Create a dummy image file so it tries to process it
	imgFile := filepath.Join(tmpDir, "test.png")
	createTestImage(t, imgFile, 3)

	// Setup a trigger to fail on ngram insertion
	imagesDB.Exec(`
		CREATE TRIGGER fail_on_ngram BEFORE INSERT ON ngram
		BEGIN
			SELECT RAISE(FAIL, 'forced ngram rollback');
		END;
	`)

	err = job.FillImagesForEntry(ctx, entryID, false)
	if err == nil {
		t.Fatal("Fill should have failed due to ngram trigger")
	}

	// Verify Rollback: sig should still be empty because the whole TX for this image should rollback
	var sig []byte
	err = imagesDB.QueryRow("SELECT sig FROM images WHERE uri = ?", testURI).Scan(&sig)
	if err != nil {
		t.Fatal(err)
	}
	if len(sig) != 0 {
		t.Errorf("Fill rollback failed: sig was updated despite ngram failure. Sig length: %d", len(sig))
	}

	// Verify ngrams: should be empty
	imagesDB.QueryRow("SELECT COUNT(*) FROM ngram").Scan(&count)
	if count != 0 {
		t.Errorf("Fill rollback failed: ngrams were partially inserted")
	}
}

func TestIndexImagesJob_Overwrite(t *testing.T) {
	dbs := testutil.SetupAllDBs(t)
	defer dbs.Close()
	db, tfidfDB, workerDB, imagesDB := dbs.Main, dbs.TFIDF, dbs.Worker, dbs.Images

	tmpDir := t.TempDir()
	config := app.LoadConfig()
	config.BaseURL = "http://localhost:5555"
	config.UploadURLPrefix = "/images/entry/"
	config.UploadDir = tmpDir

	// Database wrappers
	mainDBWrapper := model.NewDatabase[maindb.Querier](db, func(tx model.DBTX) maindb.Querier { return maindb.New(tx) })
	tfidfDBWrapper := model.NewDatabase[tfidfdb.Querier](tfidfDB, func(tx model.DBTX) tfidfdb.Querier { return tfidfdb.New(tx) })
	workerDBWrapper := model.NewDatabase[workerdb.Querier](workerDB, func(tx model.DBTX) workerdb.Querier { return workerdb.New(tx) })
	imagesDBWrapper := model.NewDatabase[imagesdb.Querier](imagesDB, func(tx model.DBTX) imagesdb.Querier { return imagesdb.New(tx) })

	application := app.NewApp(config, mainDBWrapper, tfidfDBWrapper, workerDBWrapper, imagesDBWrapper, nil, nil, nil, nil)
	job := NewIndexImagesJob(application)

	imgName := "test.png"
	imgFile := filepath.Join(tmpDir, imgName)
	createTestImage(t, imgFile, 1)

	ctx := context.Background()
	entryID := int64(1)
	body := "<p><img src=\"/images/entry/test.png\"></p>"
	db.Exec(`INSERT INTO entries (id, title, body, formatted_body, path, format, date, created_at, modified_at)
		VALUES (?, 'T', 'B', ?, 'P', 'M', '2026-01-01', '2026-01-01', '2026-01-01')`,
		entryID, body)

	// 1. Initial indexing
	arg1 := IndexImagesArg{EntryID: entryID, Overwrite: false}
	argJSON1, _ := json.Marshal(arg1)
	if err := job.Execute(ctx, argJSON1); err != nil {
		t.Fatal(err)
	}

	var sig1 []byte
	imagesDB.QueryRow("SELECT sig FROM images WHERE entry_id = ?", entryID).Scan(&sig1)

	// 2. Manually corrupt sig and ngrams
	fakeSig := []byte("corrupt!")
	imagesDB.Exec("UPDATE images SET sig = ?", fakeSig)
	imagesDB.Exec("DELETE FROM ngram")

	// 3. Run with overwrite=false (should NOT update because sig is not empty)
	arg2 := IndexImagesArg{EntryID: entryID, Overwrite: false}
	argJSON2, _ := json.Marshal(arg2)
	if err := job.Execute(ctx, argJSON2); err != nil {
		t.Fatal(err)
	}
	var sig2 []byte
	imagesDB.QueryRow("SELECT sig FROM images WHERE entry_id = ?", entryID).Scan(&sig2)
	if string(sig2) != string(fakeSig) {
		t.Errorf("sig was updated despite overwrite=false. got %s, want %s", sig2, fakeSig)
	}

	// 4. Run with overwrite=true (should update)
	arg3 := IndexImagesArg{EntryID: entryID, Overwrite: true}
	argJSON3, _ := json.Marshal(arg3)
	if err := job.Execute(ctx, argJSON3); err != nil {
		t.Fatal(err)
	}
	var sig3 []byte
	imagesDB.QueryRow("SELECT sig FROM images WHERE entry_id = ?", entryID).Scan(&sig3)
	if string(sig3) != string(sig1) {
		t.Errorf("sig was not restored despite overwrite=true. got %x, want %x", sig3, sig1)
	}

	var ngramCount int
	imagesDB.QueryRow("SELECT COUNT(*) FROM ngram").Scan(&ngramCount)
	if ngramCount == 0 {
		t.Error("ngrams were not recreated")
	}
}

func TestCalculateColorSignature(t *testing.T) {
	job := &IndexImagesJob{}

	tests := []struct {
		name     string
		color    color.RGBA
		expected uint
	}{
		{
			name:     "Pure Red",
			color:    color.RGBA{255, 0, 0, 255},
			expected: (0 << 5) | (1 << 4) | (0 << 3) | (0 << 2) | (0 << 1) | 1, // L=2, H=0, C=1 (17)
		},
		{
			name:     "Pure Green",
			color:    color.RGBA{0, 255, 0, 255},
			expected: (0 << 5) | (1 << 4) | (1 << 3) | (1 << 2) | (1 << 1) | 1, // L=3, H=3, C=1 (31)
		},
		{
			name:     "Pure Blue",
			color:    color.RGBA{0, 0, 255, 255},
			expected: (1 << 5) | (0 << 4) | (0 << 3) | (1 << 2) | (1 << 1) | 1, // L=1, H=5, C=1 (39)
		},
		{
			name:     "White",
			color:    color.RGBA{255, 255, 255, 255},
			expected: (0 << 5) | (1 << 4) | (0 << 3) | (1 << 2) | (0 << 1), // L=3, H=0, C=0 (20)
		},
		{
			name:     "Black",
			color:    color.RGBA{0, 0, 0, 255},
			expected: 0, // L=0, H=0, C=0 (0)
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			img := image.NewRGBA(image.Rect(0, 0, 10, 10))
			for y := 0; y < 10; y++ {
				for x := 0; x < 10; x++ {
					img.Set(x, y, tt.color)
				}
			}

			sig := job.CalculateColorSignatureFromImage(img)
			if sig != (1 << tt.expected) {
				t.Errorf("expected bit %d to be set (sig: %064b), got %064b", tt.expected, 1<<tt.expected, sig)
			}
		})
	}
}
