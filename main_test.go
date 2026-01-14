package main

import (
	"bytes"
	"context"
	"database/sql"
	"log"
	"os"
	"path/filepath"
	"strings"
	"testing"
	"time"

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

func TestMain(m *testing.M) {
	testutil.SetupEnvironment()
	os.Exit(m.Run())
}

func TestRunServe_GracefulShutdownOrder(t *testing.T) {
	// Setup minimal app dependencies
	db, err := sql.Open("sqlite3", ":memory:")
	if err != nil {
		t.Fatal(err)
	}
	defer db.Close()

	// Apply schema for workers at least
	config := app.LoadConfig()
	schema, err := os.ReadFile(filepath.Join(config.BaseDir, "backend/db/schema/worker.sql"))
	if err != nil {
		t.Fatal(err)
	}
	if _, err := db.Exec(string(schema)); err != nil {
		t.Fatal(err)
	}
	// And entries schema
	entrySchema, err := os.ReadFile(filepath.Join(config.BaseDir, "backend/db/schema/schema.sql"))
	if err != nil {
		t.Fatal(err)
	}
	if _, err := db.Exec(string(entrySchema)); err != nil {
		t.Fatal(err)
	}

	config.Listen = []string{"127.0.0.1:0"} // Random free port
	config.SessionSecret = "test"

	registry := jobqueue.NewRegistry()
	mainDB := model.NewDatabase[maindb.Querier](db, func(tx model.DBTX) maindb.Querier { return maindb.New(tx) })
	tfidfDB := model.NewDatabase[tfidfdb.Querier](db, func(tx model.DBTX) tfidfdb.Querier { return tfidfdb.New(tx) })
	workerDB := model.NewDatabase[workerdb.Querier](db, func(tx model.DBTX) workerdb.Querier { return workerdb.New(tx) })
	imagesDB := model.NewDatabase[imagesdb.Querier](db, func(tx model.DBTX) imagesdb.Querier { return imagesdb.New(tx) })
	worker := jobqueue.NewWorker(db, workerDB.Q, registry)

	// Create minimal App
	// We need to satisfy the App interface. Using app.NewApp with mostly nil/minimal values
	application := app.NewApp(config, mainDB, tfidfDB, workerDB, imagesDB, &tfidf.Calculator{}, &tfidf.SimilarityCalculator{}, &tfidf.Searcher{}, worker)

	// Capture logs
	var logBuf bytes.Buffer
	originalOutput := log.Writer()
	log.SetOutput(&logBuf)
	defer log.SetOutput(originalOutput)

	ctx, cancel := context.WithCancel(context.Background())

	// Run serve in a goroutine
	errCh := make(chan error, 1)
	go func() {
		errCh <- RunServe(ctx, application)
	}()

	// Let it run for a bit
	time.Sleep(200 * time.Millisecond)

	// Trigger shutdown
	cancel()

	// Wait for RunServe to finish
	select {
	case err := <-errCh:
		if err != nil {
			t.Errorf("RunServe returned error: %v", err)
		}
	case <-time.After(5 * time.Second):
		t.Fatal("RunServe did not stop in time")
	}

	// Verify log order
	logs := logBuf.String()
	t.Logf("Captured logs:\n%s", logs)

	// Check for expected sequence of log messages
	// Shutting down gracefully... and workers stopping can happen in interleaved order
	// but workers must finish before server stops.

	idxGraceful := strings.Index(logs, "Shutting down gracefully...")
	idxWaiting := strings.Index(logs, "Waiting for background workers to finish...")
	idxFinished := strings.Index(logs, "All background workers finished.")
	idxStopped := strings.Index(logs, "All servers stopped.")

	if idxGraceful == -1 || idxWaiting == -1 || idxFinished == -1 || idxStopped == -1 {
		t.Fatalf("one or more log messages not found: graceful=%d, waiting=%d, finished=%d, stopped=%d",
			idxGraceful, idxWaiting, idxFinished, idxStopped)
	}

	if idxWaiting < idxGraceful {
		t.Errorf("'Waiting for background workers to finish...' appeared before 'Shutting down gracefully...'")
	}
	if idxFinished < idxWaiting {
		t.Errorf("'All background workers finished.' appeared before 'Waiting for background workers to finish...'")
	}
	if idxStopped < idxFinished {
		t.Errorf("'All servers stopped.' appeared before 'All background workers finished.'")
	}
}

func TestRunServe_MultipleListeners(t *testing.T) {
	// Setup minimal app dependencies
	db, err := sql.Open("sqlite3", ":memory:")
	if err != nil {
		t.Fatal(err)
	}
	defer db.Close()

	// Apply necessary schemas
	config := app.LoadConfig()
	workerSchema, _ := os.ReadFile(filepath.Join(config.BaseDir, "backend/db/schema/worker.sql"))
	db.Exec(string(workerSchema))
	entrySchema, _ := os.ReadFile(filepath.Join(config.BaseDir, "backend/db/schema/schema.sql"))
	db.Exec(string(entrySchema))

	// Prepare UDS path
	tmpSock := filepath.Join(t.TempDir(), "test.sock")

	config.Listen = []string{"127.0.0.1:0", "unix:" + tmpSock}
	config.SessionSecret = "test"

	registry := jobqueue.NewRegistry()
	mainDB := model.NewDatabase[maindb.Querier](db, func(tx model.DBTX) maindb.Querier { return maindb.New(tx) })
	tfidfDB := model.NewDatabase[tfidfdb.Querier](db, func(tx model.DBTX) tfidfdb.Querier { return tfidfdb.New(tx) })
	workerDB := model.NewDatabase[workerdb.Querier](db, func(tx model.DBTX) workerdb.Querier { return workerdb.New(tx) })
	imagesDB := model.NewDatabase[imagesdb.Querier](db, func(tx model.DBTX) imagesdb.Querier { return imagesdb.New(tx) })
	worker := jobqueue.NewWorker(db, workerDB.Q, registry)
	application := app.NewApp(config, mainDB, tfidfDB, workerDB, imagesDB, &tfidf.Calculator{}, &tfidf.SimilarityCalculator{}, &tfidf.Searcher{}, worker)

	ctx, cancel := context.WithCancel(context.Background())
	errCh := make(chan error, 1)
	go func() {
		errCh <- RunServe(ctx, application)
	}()

	// Wait for startup
	time.Sleep(500 * time.Millisecond)

	// Check if UDS file exists
	if _, err := os.Stat(tmpSock); os.IsNotExist(err) {
		t.Errorf("Unix socket file %s was not created", tmpSock)
	}

	// Trigger shutdown
	cancel()

	select {
	case err := <-errCh:
		if err != nil {
			t.Errorf("RunServe returned error: %v", err)
		}
	case <-time.After(5 * time.Second):
		t.Fatal("RunServe did not stop in time")
	}

	// Check if UDS file is cleaned up
	if _, err := os.Stat(tmpSock); err == nil {
		t.Errorf("Unix socket file %s still exists after shutdown", tmpSock)
	}
}
