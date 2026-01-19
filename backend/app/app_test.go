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
	"github.com/cho45/hanrangon/backend/model/maindb"
	"github.com/cho45/hanrangon/backend/model/workerdb"
	"github.com/cho45/hanrangon/backend/tfidf"
	"github.com/cho45/hanrangon/internal/testutil"
	"github.com/labstack/echo/v4"
	_ "github.com/mattn/go-sqlite3"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

// Pre-computed bcrypt hash for "testpass" to avoid expensive hashing in every test
// Generated with: bcrypt.GenerateFromPassword([]byte("testpass"), 4)
const testPasswordHash = "$2a$04$ktO6bm8EWpWv7bUaC.SmlubIT6pATTI/.OEUKTTrQTq7UHNQ3oDyq"

func setupTest(t *testing.T) *testEnv {
	t.Helper()
	testutil.SetupEnvironment() // これを追加

	dbs := testutil.SetupAllDBs(t)

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

	// TF-IDF calculator and similarity calculator
	calc, err := tfidf.NewCalculator(dbs.TFIDFDB.DB, dbs.TFIDFDB.Q, dbs.MainDB.DB, dbs.MainDB.Q)
	if err != nil {
		t.Fatalf("failed to create calculator: %v", err)
	}
	sim := tfidf.NewSimilarityCalculator(dbs.TFIDFDB.DB, dbs.TFIDFDB.Q)
	searcher := tfidf.NewSearcher(dbs.TFIDFDB.DB, dbs.TFIDFDB.Q, calc)

	// Create job queue for testing
	registry := jobqueue.NewRegistry()
	worker := jobqueue.NewWorker(dbs.WorkerDB, dbs.WorkerDB.Q, registry)

	application := NewApp(config, dbs.MainDB, dbs.TFIDFDB, dbs.WorkerDB, dbs.ImagesDB, calc, sim, searcher, worker)
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
		db:        dbs.MainDB.DB,
		tfidfDB:   dbs.TFIDFDB.DB,
		workerDB:  dbs.WorkerDB.DB,
		imagesDB:  dbs.ImagesDB.DB,
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
	// UpdateTrackbacks, IndexImages, RecalculateTFIDF, FinalizeEntry = 4 jobs
	if count != 4 {
		t.Errorf("expected 4 jobs, got %d", count)
	}
}

func TestApp_EnqueuePublishedEntryJobs(t *testing.T) {
	e := setupTest(t)
	defer e.close()
	ctx := context.Background()

	entryID := int64(123)

	err := e.app.EnqueuePublishedEntryJobs(ctx, entryID)
	require.NoError(t, err)

	// ジョブが4つエンキューされていることを確認
	count, err := e.app.WorkerDB().Q.CountJobs(ctx)
	require.NoError(t, err)
	assert.Equal(t, int64(4), count)

	// 各ジョブの内容と依存関係を確認
	jobs, err := e.app.WorkerDB().Q.ListJobs(ctx, workerdb.ListJobsParams{Limit: 10, Offset: 0})
	require.NoError(t, err)

	var finalizeJob *workerdb.ListJobsRow
	var otherJobs []workerdb.ListJobsRow
	jobNames := make(map[string]bool)

	for _, j := range jobs {
		if j.JobTypeName == "FinalizeEntry" {
			j := j
			finalizeJob = &j
		} else {
			otherJobs = append(otherJobs, j)
			jobNames[j.JobTypeName] = true
		}
	}

	// 期待されるジョブが含まれているか
	assert.True(t, jobNames["RecalculateTFIDF"])
	assert.True(t, jobNames["UpdateTrackbacks"])
	assert.True(t, jobNames["IndexImages"])
	require.NotNil(t, finalizeJob)

	// FinalizeEntry の依存関係を確認
	require.True(t, finalizeJob.DependsOn.Valid)
	dependsOn, err := jobqueue.ParseDependsOn(finalizeJob.DependsOn.String)
	require.NoError(t, err)

	assert.Equal(t, jobqueue.StrategyAll, dependsOn.Strategy)
	assert.Len(t, dependsOn.Dependencies, 3)

	// 依存先 ID が他の3つのジョブのいずれかと一致するか
	otherJobIDs := make(map[int64]bool)
	for _, j := range otherJobs {
		otherJobIDs[j.ID] = true
	}

	for _, dep := range dependsOn.Dependencies {
		assert.True(t, otherJobIDs[dep.ID], "Dependency ID %d should match one of the precursor jobs", dep.ID)
		assert.Equal(t, jobqueue.ConditionCompleted, dep.Condition)
	}
}

func TestCleanupProgressSession(t *testing.T) {
	env := setupTest(t)
	defer env.close()

	// Create a progress session
	sessionID := "test-session-123"
	session := &ProgressSession{
		ID:        sessionID,
		CreatedAt: time.Now(),
		Messages:  make(chan string, 10),
		Done:      make(chan error, 1),
	}

	// Store the session
	appImpl := env.app.(*AppImpl)
	appImpl.progressSessions.Store(sessionID, session)

	// Verify session exists
	_, exists := appImpl.progressSessions.Load(sessionID)
	if !exists {
		t.Fatal("Session should exist before cleanup")
	}

	// Test cleanup
	appImpl.cleanupProgressSession(sessionID)

	// Verify session is deleted
	_, exists = appImpl.progressSessions.Load(sessionID)
	if exists {
		t.Error("Session should be deleted after cleanup")
	}

	// Verify Messages channel is closed
	_, ok := <-session.Messages
	if ok {
		t.Error("Messages channel should be closed after cleanup")
	}

	// Test cleanup of non-existent session (should not panic)
	appImpl.cleanupProgressSession("non-existent-session")
}

func TestCleanupProgressSession_NonExistent(t *testing.T) {
	env := setupTest(t)
	defer env.close()

	// Cleanup non-existent session should not panic
	appImpl := env.app.(*AppImpl)
	appImpl.cleanupProgressSession("non-existent-id")
}

func TestAppImpl_AccessorMethods(t *testing.T) {
	env := setupTest(t)
	defer env.close()

	// Test all accessor methods return non-nil values
	if env.app.MainDB() == nil {
		t.Error("MainDB() returned nil")
	}
	if env.app.TFIDFDB() == nil {
		t.Error("TFIDFDB() returned nil")
	}
	if env.app.WorkerDB() == nil {
		t.Error("WorkerDB() returned nil")
	}
	if env.app.ImagesDB() == nil {
		t.Error("ImagesDB() returned nil")
	}
	if env.app.Calculator() == nil {
		t.Error("Calculator() returned nil")
	}
	if env.app.SimilarityCalculator() == nil {
		t.Error("SimilarityCalculator() returned nil")
	}
	if env.app.Searcher() == nil {
		t.Error("Searcher() returned nil")
	}
	if env.app.JobQueue() == nil {
		t.Error("JobQueue() returned nil")
	}
	if env.app.Config() == nil {
		t.Error("Config() returned nil")
	}
	if env.app.EntryService() == nil {
		t.Error("EntryService() returned nil")
	}

	// Test AppImpl-specific methods (not in App interface)
	appImpl := env.app.(*AppImpl)
	if appImpl.Templates() == nil {
		t.Error("Templates() returned nil")
	}
	if appImpl.Storage() == nil {
		t.Error("Storage() returned nil")
	}
}
