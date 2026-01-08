package main

import (
	"bytes"
	"context"
	"database/sql"
	"log"
	"os"
	"strings"
	"testing"
	"time"

	"github.com/cho45/hanrangon/app"
	"github.com/cho45/hanrangon/jobqueue"
	"github.com/cho45/hanrangon/model"
	"github.com/cho45/hanrangon/tfidf"
	_ "github.com/mattn/go-sqlite3"
)

func TestRunServe_GracefulShutdownOrder(t *testing.T) {
	// Setup minimal app dependencies
	db, err := sql.Open("sqlite3", ":memory:")
	if err != nil {
		t.Fatal(err)
	}
	defer db.Close()

	// Apply schema for workers at least
	schema, err := os.ReadFile("db/schema/worker.sql")
	if err != nil {
		t.Fatal(err)
	}
	if _, err := db.Exec(string(schema)); err != nil {
		t.Fatal(err)
	}
	// And entries schema
	entrySchema, err := os.ReadFile("db/schema/schema.sql")
	if err != nil {
		t.Fatal(err)
	}
	if _, err := db.Exec(string(entrySchema)); err != nil {
		t.Fatal(err)
	}

	config := &app.Config{
		Listen:        "127.0.0.1:0", // Random free port
		SessionSecret: "test",
		StaticDir:     "static",
	}

	registry := jobqueue.NewRegistry()
	workerQueries := model.New(db)
	worker := jobqueue.NewWorker(db, workerQueries, registry)

	// Create minimal App
	// We need to satisfy the App interface. Using app.NewApp with mostly nil/minimal values
	application := app.NewApp(config, db, db, db, db, &tfidf.Calculator{}, &tfidf.SimilarityCalculator{}, &tfidf.Searcher{}, worker)

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
	idxStopped := strings.Index(logs, "Server stopped.")

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
		t.Errorf("'Server stopped.' appeared before 'All background workers finished.'")
	}
}
