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

	"github.com/cho45/hanrangon/backend/jobqueue"
	"github.com/cho45/hanrangon/backend/model"
	"github.com/cho45/hanrangon/backend/model/imagesdb"
	"github.com/cho45/hanrangon/backend/model/maindb"
	"github.com/cho45/hanrangon/backend/model/tfidfdb"
	"github.com/cho45/hanrangon/backend/model/workerdb"
	"github.com/cho45/hanrangon/backend/tfidf"
	"github.com/cho45/hanrangon/internal/testutil"
	"github.com/labstack/echo/v4"
	_ "github.com/mattn/go-sqlite3"
)

// Pre-computed bcrypt hash for "testpass" to avoid expensive hashing in every test
// Generated with: bcrypt.GenerateFromPassword([]byte("testpass"), 4)
const testPasswordHash = "$2a$04$ktO6bm8EWpWv7bUaC.SmlubIT6pATTI/.OEUKTTrQTq7UHNQ3oDyq"

func setupTest(t *testing.T) *testEnv {
	t.Helper()
	testutil.SetupEnvironment() // これを追加

	dbs := testutil.SetupAllDBs(t)
	db, tfidfDB, workerDB, imagesDB := dbs.Main, dbs.TFIDF, dbs.Worker, dbs.Images

	tmpDir, err := os.MkdirTemp("", "hanrangon-upload-test")
	if err != nil {
		t.Fatalf("failed to create temp dir: %v", err)
	}

	// デフォルト設定をロードしてからテスト用にオーバーライド
	config := LoadConfig()
	config.UploadDir = tmpDir
	config.Username = "testuser"
	config.Password = testPasswordHash
	config.SessionSecret = "testsecret"
	config.BaseURL = "http://localhost:5555"

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

	// Create job queue for testing
	registry := jobqueue.NewRegistry()
	worker := jobqueue.NewWorker(model.NewDatabase[*workerdb.Queries](workerDB, func(tx model.DBTX) *workerdb.Queries { return workerdb.New(tx.(workerdb.DBTX)) }), workerDBWrapper.Q.(*workerdb.Queries), registry)

	application := NewApp(config, mainDBWrapper, tfidfDBWrapper, workerDBWrapper, imagesDBWrapper, calc, sim, searcher, worker)
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
	env.app.Close()
	os.RemoveAll(env.uploadDir)
}

type LoginInfo struct {
	Cookie string
	SK     string
}

func (env *testEnv) login(t *testing.T) *LoginInfo {
	t.Helper()

	// 1. Get login page to get CSRF cookie
	getReq := httptest.NewRequest(http.MethodGet, "/login", nil)
	getRec := httptest.NewRecorder()
	env.server.ServeHTTP(getRec, getReq)

	var sk string
	var cookies []string
	for _, cookie := range getRec.Result().Cookies() {
		if cookie.Name == CSRFCookieName {
			sk = cookie.Value
		}
		cookies = append(cookies, fmt.Sprintf("%s=%s", cookie.Name, cookie.Value))
	}

	// 2. POST login with CSRF token
	payload := fmt.Sprintf("username=testuser&password=testpass&sk=%s", sk)
	req := httptest.NewRequest(http.MethodPost, "/login", strings.NewReader(payload))
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	req.Header.Set("Cookie", strings.Join(cookies, "; "))
	rec := httptest.NewRecorder()
	env.server.ServeHTTP(rec, req)

	if rec.Code != http.StatusFound {
		t.Fatalf("login failed with status %d: %s", rec.Code, rec.Body.String())
	}

	var finalCookies []string
	for _, cookie := range rec.Result().Cookies() {
		finalCookies = append(finalCookies, fmt.Sprintf("%s=%s", cookie.Name, cookie.Value))
	}
	// Also include the CSRF cookie from the first request if not present
	foundCSRF := false
	for _, c := range finalCookies {
		if strings.HasPrefix(c, CSRFCookieName+"=") {
			foundCSRF = true
			break
		}
	}
	if !foundCSRF {
		finalCookies = append(finalCookies, CSRFCookieName+"="+sk)
	}

	return &LoginInfo{
		Cookie: strings.Join(finalCookies, "; "),
		SK:     sk,
	}
}

func TestPublishScheduledEntries(t *testing.T) {
	ctx := context.Background()
	env := setupTest(t)
	defer env.close()

	now := time.Now()
	// Past entry (should be published)
	past := now.Add(-1 * time.Hour)
	_, err := env.app.MainDB().Q.CreateEntry(ctx, maindb.CreateEntryParams{
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
	_, err = env.app.MainDB().Q.CreateEntry(ctx, maindb.CreateEntryParams{
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
	if err := env.app.EntryService().PublishScheduledEntries(ctx); err != nil {
		t.Fatalf("PublishScheduledEntries failed: %v", err)
	}

	// Check past entry
	e, err := env.app.MainDB().Q.GetEntryByPath(ctx, "2026/01/01/1")
	if err != nil {
		t.Fatalf("failed to get past entry: %v", err)
	}
	if e.Status != "public" {
		t.Errorf("expected status public, got %s", e.Status)
	}

	// Check future entry
	e, err = env.app.MainDB().Q.GetEntryByPath(ctx, "2026/01/01/2")
	if err != nil {
		t.Fatalf("failed to get future entry: %v", err)
	}
	if e.Status != "scheduled" {
		t.Errorf("expected status scheduled, got %s", e.Status)
	}

	// Check jobs
	count, err := workerdb.New(env.workerDB).CountJobs(ctx)
	if err != nil {
		t.Fatalf("failed to count jobs: %v", err)
	}
	// UpdateTrackbacks, IndexImages, RecalculateTFIDF = 3 jobs
	if count != 3 {
		t.Errorf("expected 3 jobs, got %d", count)
	}
}
