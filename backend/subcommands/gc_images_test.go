package subcommands

import (
	"context"
	"os"
	"path/filepath"
	"strings"
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

func TestGCImages(t *testing.T) {
	dbs := testutil.SetupAllDBs(t)
	defer dbs.Close()
	db, tfidfDB, workerDB, imagesDB := dbs.Main, dbs.TFIDF, dbs.Worker, dbs.Images

	tmpDir := t.TempDir()
	config := app.LoadConfig()
	config.UploadDir = tmpDir
	config.UploadURLPrefix = "/images/entry/"

	// Setup app
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

	ctx := context.Background()

	// 1. Prepare files in storage
	// valid.jpg (in DB)
	// orphan.jpg (NOT in DB)
	validFile := "valid.jpg"
	orphanFile := "orphan.jpg"
	os.WriteFile(filepath.Join(tmpDir, validFile), []byte("valid content"), 0644)
	os.WriteFile(filepath.Join(tmpDir, orphanFile), []byte("orphan content"), 0644)

	// 2. Insert valid image to DB
	_, err := imagesDB.Exec("INSERT INTO images (uri, entry_id, sig) VALUES (?, ?, ?)", "/images/entry/valid.jpg", 1, []byte{1, 2, 3})
	if err != nil {
		t.Fatal(err)
	}

	// 3. Run Phase 1: List
	err = GCImages(ctx, application, []string{"-list"})
	if err != nil {
		t.Fatalf("Phase 1 failed: %v", err)
	}

	// Find the generated orphans file
	files, _ := os.ReadDir(".")
	var listFile string
	for _, f := range files {
		if strings.HasSuffix(f.Name(), "-orphans.txt") {
			listFile = f.Name()
			break
		}
	}

	if listFile == "" {
		t.Fatal("Orphans list file was not created")
	}
	defer os.Remove(listFile)

	// Check content of list file
	content, err := os.ReadFile(listFile)
	if err != nil {
		t.Fatal(err)
	}
	if !strings.Contains(string(content), orphanFile) {
		t.Errorf("List file should contain orphan file: %s", orphanFile)
	}
	if strings.Contains(string(content), validFile) {
		t.Errorf("List file should NOT contain valid file: %s", validFile)
	}

	// 4. Run Phase 2: Delete (without force)
	err = GCImages(ctx, application, []string{"-delete", "-file", listFile})
	if err != nil {
		t.Fatalf("Phase 2 (dry-run) failed: %v", err)
	}

	// File should still exist
	if _, err := os.Stat(filepath.Join(tmpDir, orphanFile)); os.IsNotExist(err) {
		t.Error("Orphan file was deleted without -force")
	}

	// 5. Run Phase 2: Delete (with force)
	err = GCImages(ctx, application, []string{"-delete", "-file", listFile, "-force"})
	if err != nil {
		t.Fatalf("Phase 2 (force) failed: %v", err)
	}

	// Orphan file should be deleted
	if _, err := os.Stat(filepath.Join(tmpDir, orphanFile)); err == nil {
		t.Error("Orphan file still exists after deletion with -force")
	}

	// Valid file should still exist
	if _, err := os.Stat(filepath.Join(tmpDir, validFile)); os.IsNotExist(err) {
		t.Error("Valid file was accidentally deleted")
	}
}
