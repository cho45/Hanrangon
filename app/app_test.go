package app

import (
	"context"
	"database/sql"
	"fmt"
	"net/http"
	"net/http/httptest"
	"os"
	"strings"
	"testing"
	"time"

	"github.com/cho45/hanrangon/jobqueue"
	"github.com/cho45/hanrangon/model"
	"github.com/cho45/hanrangon/tfidf"
	"github.com/labstack/echo/v4"
	_ "github.com/mattn/go-sqlite3"
)

func setupTestDB(t *testing.T) (*sql.DB, *sql.DB, *sql.DB, *sql.DB) {
	t.Helper()

	// Main DB
	db, err := sql.Open("sqlite3", ":memory:?_loc=Asia/Tokyo")
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
	tfidfDB, err := sql.Open("sqlite3", ":memory:?_loc=Asia/Tokyo")
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
	workerDB, err := sql.Open("sqlite3", ":memory:?_loc=Asia/Tokyo")
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
	imagesDB, err := sql.Open("sqlite3", ":memory:?_loc=Asia/Tokyo")
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

func setupTest(t *testing.T) *testEnv {
	t.Helper()
	db, tfidfDB, workerDB, imagesDB := setupTestDB(t)

	tmpDir, err := os.MkdirTemp("", "hanrangon-upload-test")
	if err != nil {
		t.Fatalf("failed to create temp dir: %v", err)
	}

	config := &Config{
		StaticDir:     "../static",
		UploadDir:     tmpDir,
		Username:      "testuser",
		Password:      "testpass",
		SessionSecret: "testsecret",
		BaseURL:       "http://localhost:5555",
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

	application := NewApp(config, db, tfidfDB, workerDB, imagesDB, calc, sim, worker)
	e := NewServer(application)

	// テスト用のエラーハンドラーを設定（詳細なエラーメッセージを出力）
	e.HTTPErrorHandler = func(err error, c echo.Context) {
		code := http.StatusInternalServerError
		message := err.Error()
		if he, ok := err.(*echo.HTTPError); ok {
			code = he.Code
			message = fmt.Sprintf("%v", he.Message)
			if he.Internal != nil {
				message = fmt.Sprintf("%v (internal: %v)", he.Message, he.Internal)
			}
		}
		if !c.Response().Committed {
			if c.Request().Method == http.MethodHead {
				c.NoContent(code)
			} else {
				c.JSON(code, map[string]string{"message": message, "error": err.Error()})
			}
		}
	}

	return &testEnv{
		app:       application,
		db:        db,
		tfidfDB:   tfidfDB,
		workerDB:  workerDB,
		imagesDB:  imagesDB,
		server:    e,
		uploadDir: tmpDir,
	}
}

type testEnv struct {
	app       App
	db        *sql.DB
	tfidfDB   *sql.DB
	workerDB  *sql.DB
	imagesDB  *sql.DB
	server    *echo.Echo
	uploadDir string
}

func (env *testEnv) close() {
	env.db.Close()
	env.tfidfDB.Close()
	env.workerDB.Close()
	env.imagesDB.Close()
	os.RemoveAll(env.uploadDir)
}

func (env *testEnv) login(t *testing.T) string {
	t.Helper()
	req := httptest.NewRequest(http.MethodPost, "/login", strings.NewReader("username=testuser&password=testpass"))
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	rec := httptest.NewRecorder()
	env.server.ServeHTTP(rec, req)

	cookie := rec.Header().Get("Set-Cookie")
	if cookie == "" {
		t.Fatal("failed to get session cookie")
	}
	// Extract the actual cookie value (e.g. "session=...")
	return strings.Split(cookie, ";")[0]
}

func TestPublishScheduledEntries(t *testing.T) {
	ctx := context.Background()
	env := setupTest(t)
	defer env.close()

	now := time.Now()
	// Past entry (should be published)
	past := now.Add(-1 * time.Hour)
	_, err := env.app.Queries().CreateEntry(ctx, model.CreateEntryParams{
		Title:         "Scheduled Past",
		Body:          "Body",
		FormattedBody: "Body",
		Path:          "2026/01/01/1",
		Format:        "Hatena",
		Date:          "2026-01-01",
		CreatedAt:     past,
		ModifiedAt:    past,
		PublishAt:     sql.NullTime{Time: past, Valid: true},
		Status:        "scheduled",
	})
	if err != nil {
		t.Fatalf("failed to create past entry: %v", err)
	}

	// Future entry (should NOT be published)
	future := now.Add(1 * time.Hour)
	_, err = env.app.Queries().CreateEntry(ctx, model.CreateEntryParams{
		Title:         "Scheduled Future",
		Body:          "Body",
		FormattedBody: "Body",
		Path:          "2026/01/01/2",
		Format:        "Hatena",
		Date:          "2026-01-01",
		CreatedAt:     now,
		ModifiedAt:    now,
		PublishAt:     sql.NullTime{Time: future, Valid: true},
		Status:        "scheduled",
	})
	if err != nil {
		t.Fatalf("failed to create future entry: %v", err)
	}

	// Run publisher
	if err := env.app.PublishScheduledEntries(ctx); err != nil {
		t.Fatalf("PublishScheduledEntries failed: %v", err)
	}

	// Check past entry
	e, err := env.app.Queries().GetEntryByPath(ctx, "2026/01/01/1")
	if err != nil {
		t.Fatalf("failed to get past entry: %v", err)
	}
	if e.Status != "public" {
		t.Errorf("expected status public, got %s", e.Status)
	}

	// Check future entry
	e, err = env.app.Queries().GetEntryByPath(ctx, "2026/01/01/2")
	if err != nil {
		t.Fatalf("failed to get future entry: %v", err)
	}
	if e.Status != "scheduled" {
		t.Errorf("expected status scheduled, got %s", e.Status)
	}

	// Check jobs
	count, err := model.New(env.workerDB).CountJobs(ctx)
	if err != nil {
		t.Fatalf("failed to count jobs: %v", err)
	}
	// UpdateTrackbacks, IndexImages, RecalculateTFIDF = 3 jobs
	if count != 3 {
		t.Errorf("expected 3 jobs, got %d", count)
	}
}
