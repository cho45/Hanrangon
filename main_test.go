package main

import (
	"bytes"
	"context"
	"database/sql"
	"encoding/json"
	"mime/multipart"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"strings"
	"testing"
	"time"

	"github.com/cho45/hanrangon/jobqueue"
	"github.com/cho45/hanrangon/jobs"
	"github.com/cho45/hanrangon/model"
	"github.com/labstack/echo/v4"
	_ "github.com/mattn/go-sqlite3"
)

func setupTestDB(t *testing.T) (*sql.DB, *sql.DB, *sql.DB, *sql.DB) {
	t.Helper()

	// Main DB
	db, err := sql.Open("sqlite3", ":memory:")
	if err != nil {
		t.Fatalf("failed to open memory db: %v", err)
	}
	schema, err := os.ReadFile("db/schema/schema.sql")
	if err != nil {
		t.Fatalf("failed to read schema: %v", err)
	}
	if _, err := db.Exec(string(schema)); err != nil {
		t.Fatalf("failed to apply schema: %v", err)
	}

	// TFIDF DB
	tfidfDB, err := sql.Open("sqlite3_with_math_functions", ":memory:")
	if err != nil {
		t.Fatalf("failed to open memory tfidf db: %v", err)
	}
	tfidfSchema, err := os.ReadFile("db/schema/tfidf.sql")
	if err != nil {
		t.Fatalf("failed to read tfidf schema: %v", err)
	}
	if _, err := tfidfDB.Exec(string(tfidfSchema)); err != nil {
		t.Fatalf("failed to apply tfidf schema: %v", err)
	}

	// Worker DB
	workerDB, err := sql.Open("sqlite3", ":memory:")
	if err != nil {
		t.Fatalf("failed to open memory worker db: %v", err)
	}
	workerSchema, err := os.ReadFile("db/schema/worker.sql")
	if err != nil {
		t.Fatalf("failed to read worker schema: %v", err)
	}
	if _, err := workerDB.Exec(string(workerSchema)); err != nil {
		t.Fatalf("failed to apply worker schema: %v", err)
	}

	// Images DB
	imagesDB, err := sql.Open("sqlite3", ":memory:")
	if err != nil {
		t.Fatalf("failed to open memory images db: %v", err)
	}
	imagesSchema, err := os.ReadFile("db/schema/images.sql")
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
		StaticDir:     "static",
		UploadDir:     tmpDir,
		Username:      "testuser",
		Password:      "testpass",
		SessionSecret: "testsecret",
	}

	// Create job queue for testing
	registry := jobqueue.NewRegistry()
	queue := jobqueue.NewQueue(workerDB, model.New(workerDB), registry)

	e := NewServer(config, db, tfidfDB, workerDB, imagesDB, queue)
	return &testEnv{
		db:        db,
		tfidfDB:   tfidfDB,
		workerDB:  workerDB,
		imagesDB:  imagesDB,
		server:    e,
		uploadDir: tmpDir,
	}
}

type testEnv struct {
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

func TestHandleIndex(t *testing.T) {
	env := setupTest(t)
	defer env.close()

	// Insert test data
	_, err := env.db.Exec(`
		INSERT INTO entries (title, body, formatted_body, path, format, date, created_at, modified_at)
		VALUES 
		('Test Entry 1', 'Body 1', '<p>Formatted Body 1</p>', '2025/01/01/1', 'Markdown', '2025-01-01', '2025-01-01 10:00:00', '2025-01-01 10:00:00'),
		('Test Entry 2', 'Body 2', '<p>Formatted Body 2</p>', '2025/01/01/2', 'Markdown', '2025-01-01', '2025-01-01 12:00:00', '2025-01-01 12:00:00')
	`)
	if err != nil {
		t.Fatalf("failed to insert test data: %v", err)
	}

	req := httptest.NewRequest(http.MethodGet, "/", nil)
	rec := httptest.NewRecorder()

	env.server.ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Errorf("want status 200, got %d", rec.Code)
	}

	body := rec.Body.String()
	if !strings.Contains(body, "Test Entry 1") {
		t.Errorf("body does not contain 'Test Entry 1'")
	}
	if !strings.Contains(body, "<p>Formatted Body 1</p>") {
		t.Errorf("body does not contain formatted body")
	}
}

func TestHandleEntry(t *testing.T) {
	env := setupTest(t)
	defer env.close()

	_, err := env.db.Exec(`
		INSERT INTO entries (title, body, formatted_body, path, format, date, created_at, modified_at)
		VALUES 
		('Test Entry 1', 'Body 1', '<p>Formatted Body 1</p>', '2025/01/01/1', 'Markdown', '2025-01-01', '2025-01-01 10:00:00', '2025-01-01 10:00:00'),
		('Test Entry 2', 'Body 2', '<p>Formatted Body 2</p>', '2025/01/01/2', 'Markdown', '2025-01-01', '2025-01-01 12:00:00', '2025-01-01 12:00:00')
	`)
	if err != nil {
		t.Fatalf("failed to insert test data: %v", err)
	}

	t.Run("Existing entry", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodGet, "/2025/01/01/1", nil)
		rec := httptest.NewRecorder()
		env.server.ServeHTTP(rec, req)

		if rec.Code != http.StatusOK {
			t.Errorf("want status 200, got %d", rec.Code)
		}

		body := rec.Body.String()
		if !strings.Contains(body, "Test Entry 1") {
			t.Errorf("body does not contain 'Test Entry 1'")
		}
		// Prev/Next links
		if !strings.Contains(body, "Test Entry 2") {
			t.Errorf("body does not contain next entry link 'Test Entry 2'")
		}
	})

	t.Run("Non-existing entry", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodGet, "/2025/01/01/999", nil)
		rec := httptest.NewRecorder()
		env.server.ServeHTTP(rec, req)

		if rec.Code != http.StatusNotFound {
			t.Errorf("want status 404, got %d", rec.Code)
		}
	})
}

func TestHandleArchive(t *testing.T) {
	env := setupTest(t)
	defer env.close()

	_, err := env.db.Exec(`
		INSERT INTO entries (title, body, formatted_body, path, format, date, created_at, modified_at)
		VALUES 
		('Entry 1', 'Body 1', '', '2025/01/01/1', 'Markdown', '2025-01-01', '2025-01-01 10:00:00', '2025-01-01 10:00:00'),
		('Entry 2', 'Body 2', '', '2025/01/02/1', 'Markdown', '2025-01-02', '2025-01-02 10:00:00', '2025-01-02 10:00:00'),
		('Entry 3', 'Body 3', '', '2024/12/31/1', 'Markdown', '2024-12-31', '2024-12-31 10:00:00', '2024-12-31 10:00:00')
	`)
	if err != nil {
		t.Fatalf("failed to insert test data: %v", err)
	}

	req := httptest.NewRequest(http.MethodGet, "/archive", nil)
	rec := httptest.NewRecorder()
	env.server.ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Errorf("want status 200, got %d", rec.Code)
	}

	body := rec.Body.String()
	// 2025年 (2 entries), 2024年 (1 entry)
	if !strings.Contains(body, "2025年") {
		t.Errorf("body does not contain '2025年'")
	}
	if !strings.Contains(body, "01月") {
		t.Errorf("body does not contain '01月'")
	}
	if !strings.Contains(body, "2024年") {
		t.Errorf("body does not contain '2024年'")
	}
}

func TestHandleDateArchive(t *testing.T) {
	env := setupTest(t)
	defer env.close()

	_, err := env.db.Exec(`
		INSERT INTO entries (title, body, formatted_body, path, format, date, created_at, modified_at)
		VALUES 
		('Entry 2025-01-01', 'Body', '', '2025/01/01/1', 'Markdown', '2025-01-01', '2025-01-01 10:00:00', '2025-01-01 10:00:00'),
		('Entry 2025-01-02', 'Body', '', '2025/01/02/1', 'Markdown', '2025-01-02', '2025-01-02 10:00:00', '2025-01-02 10:00:00'),
		('Entry 2025-02-01', 'Body', '', '2025/02/01/1', 'Markdown', '2025-02-01', '2025-02-01 10:00:00', '2025-02-01 10:00:00'),
		('Entry 2024-12-31', 'Body', '', '2024/12/31/1', 'Markdown', '2024-12-31', '2024-12-31 10:00:00', '2024-12-31 10:00:00')
	`)
	if err != nil {
		t.Fatalf("failed to insert test data: %v", err)
	}

	tests := []struct {
		path       string
		wantTitles []string
		notTitles  []string
	}{
		{
			path:       "/2025/",
			wantTitles: []string{"Entry 2025-01-01", "Entry 2025-01-02", "Entry 2025-02-01"},
			notTitles:  []string{"Entry 2024-12-31"},
		},
		{
			path:       "/2025/01/",
			wantTitles: []string{"Entry 2025-01-01", "Entry 2025-01-02"},
			notTitles:  []string{"Entry 2025-02-01", "Entry 2024-12-31"},
		},
		{
			path:       "/2025/01/01/",
			wantTitles: []string{"Entry 2025-01-01"},
			notTitles:  []string{"Entry 2025-01-02", "Entry 2025-02-01"},
		},
	}

	for _, tt := range tests {
		t.Run(tt.path, func(t *testing.T) {
			req := httptest.NewRequest(http.MethodGet, tt.path, nil)
			rec := httptest.NewRecorder()

			env.server.ServeHTTP(rec, req)

			if rec.Code != http.StatusOK {
				t.Errorf("want status 200, got %d", rec.Code)
			}

			body := rec.Body.String()
			for _, title := range tt.wantTitles {
				if !strings.Contains(body, title) {
					t.Errorf("path %s: body does not contain '%s'", tt.path, title)
				}
			}
			for _, title := range tt.notTitles {
				if strings.Contains(body, title) {
					t.Errorf("path %s: body SHOULD NOT contain '%s'", tt.path, title)
				}
			}
		})
	}
}

func TestHandleCategory(t *testing.T) {
	env := setupTest(t)
	defer env.close()

	_, err := env.db.Exec(`
		INSERT INTO entries (title, body, formatted_body, path, format, date, created_at, modified_at)
		VALUES 
		('[test] Tagged Entry', 'Body', '', '2025/01/01/1', 'Markdown', '2025-01-01', '2025-01-01 10:00:00', '2025-01-01 10:00:00'),
		('Normal Entry', 'Body', '', '2025/01/02/1', 'Markdown', '2025-01-02', '2025-01-02 10:00:00', '2025-01-02 10:00:00')
	`)
	if err != nil {
		t.Fatalf("failed to insert test data: %v", err)
	}

	req := httptest.NewRequest(http.MethodGet, "/test/", nil)
	rec := httptest.NewRecorder()

	env.server.ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Errorf("want status 200, got %d", rec.Code)
	}

	body := rec.Body.String()
	// ParseTitle separates tags, so we look for the tag link and the clean title
	// Structure: <a href="/test/"><span itemprop="keywords">test</span></a>
	if !strings.Contains(body, "<span itemprop=\"keywords\">test</span></a>") {
		t.Errorf("body does not contain tag link for 'test'")
	}
	if !strings.Contains(body, "Tagged Entry") {
		t.Errorf("body does not contain clean title 'Tagged Entry'")
	}
	if strings.Contains(body, "Normal Entry") {
		t.Errorf("body SHOULD NOT contain normal entry")
	}
}

func TestHandleFeed(t *testing.T) {
	env := setupTest(t)
	defer env.close()

	_, err := env.db.Exec(`
		INSERT INTO entries (title, body, formatted_body, path, format, date, created_at, modified_at)
		VALUES 
		('Feed Entry 1', 'Body', '<p>Body</p>', '2025/01/01/1', 'Markdown', '2025-01-01', '2025-01-01 10:00:00', '2025-01-01 10:00:00')
	`)
	if err != nil {
		t.Fatalf("failed to insert test data: %v", err)
	}

	req := httptest.NewRequest(http.MethodGet, "/feed", nil)
	rec := httptest.NewRecorder()

	env.server.ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Errorf("want status 200, got %d", rec.Code)
	}

	contentType := rec.Header().Get("Content-Type")
	if !strings.Contains(contentType, "application/atom+xml") {
		t.Errorf("want Content-Type application/atom+xml, got %s", contentType)
	}

	body := rec.Body.String()
	if !strings.Contains(body, "<feed xmlns=\"http://www.w3.org/2005/Atom\">") {
		t.Errorf("body does not contain atom feed tag")
	}
	if !strings.Contains(body, "<title>Feed Entry 1</title>") {
		t.Errorf("body does not contain entry title")
	}
}

func TestHandleSitemap(t *testing.T) {
	env := setupTest(t)
	defer env.close()

	_, err := env.db.Exec(`
		INSERT INTO entries (title, body, formatted_body, path, format, date, created_at, modified_at)
		VALUES 
		('Sitemap Entry 1', 'Body', '', '2025/01/01/1', 'Markdown', '2025-01-01', '2025-01-01 10:00:00', '2025-01-01 10:00:00')
	`)
	if err != nil {
		t.Fatalf("failed to insert test data: %v", err)
	}

	req := httptest.NewRequest(http.MethodGet, "/sitemap.xml", nil)
	rec := httptest.NewRecorder()

	env.server.ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Errorf("want status 200, got %d", rec.Code)
	}

	contentType := rec.Header().Get("Content-Type")
	if !strings.Contains(contentType, "application/xml") {
		t.Errorf("want Content-Type application/xml, got %s", contentType)
	}

	body := rec.Body.String()
	if !strings.Contains(body, "<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">") {
		t.Errorf("body does not contain urlset tag")
	}
	if !strings.Contains(body, "<loc>https://lowreal.net/2025/01/01/1</loc>") {
		t.Errorf("body does not contain entry location")
	}
}

func TestHandleApiSimilar(t *testing.T) {
	t.Run("TFIDF related", func(t *testing.T) {
		env := setupTest(t)
		defer env.close()

		// Insert entries into main DB
		_, err := env.db.Exec(`
			INSERT INTO entries (id, title, body, formatted_body, path, format, date, created_at, modified_at)
			VALUES 
			(1, 'Target Entry', 'Body 1', '<p>Body 1</p>', '2025/01/01/1', 'Markdown', '2025-01-01', '2025-01-01 10:00:00', '2025-01-01 10:00:00'),
			(2, 'Related Entry', 'Body 2', '<p>Body 2</p>', '2025/01/01/2', 'Markdown', '2025-01-01', '2025-01-01 11:00:00', '2025-01-01 11:00:00')
		`)
		if err != nil {
			t.Fatalf("failed to insert entries: %v", err)
		}

		// Insert relationship into TFIDF DB
		_, err = env.tfidfDB.Exec(`
			INSERT INTO related_entries (entry_id, related_entry_id, score)
			VALUES (1, 2, 0.95)
		`)
		if err != nil {
			t.Fatalf("failed to insert related_entries: %v", err)
		}

		req := httptest.NewRequest(http.MethodGet, "/api/similar?id=1", nil)
		rec := httptest.NewRecorder()
		env.server.ServeHTTP(rec, req)

		if rec.Code != http.StatusOK {
			t.Errorf("want status 200, got %d", rec.Code)
		}

		var res struct {
			Result map[string]string `json:"result"`
			Ad     string            `json:"ad"`
		}
		importJSON := strings.NewReader(rec.Body.String())
		if err := json.NewDecoder(importJSON).Decode(&res); err != nil {
			t.Fatalf("failed to decode response: %v", err)
		}

		html, ok := res.Result["1"]
		if !ok {
			t.Fatalf("result for id=1 not found")
		}

		if !strings.Contains(html, "Related Entry") {
			t.Errorf("rendered HTML does not contain 'Related Entry'")
		}
		if !strings.Contains(html, "data-score=\"0.950000\"") {
			t.Errorf("rendered HTML does not contain correct score")
		}
	})

	t.Run("Image fallback", func(t *testing.T) {
		env := setupTest(t)
		defer env.close()

		// Insert entries
		_, err := env.db.Exec(`
			INSERT INTO entries (id, title, body, formatted_body, path, format, date, created_at, modified_at)
			VALUES 
			(3, 'Target Image Entry', 'Body 3', '', '2025/01/01/3', 'Markdown', '2025-01-01', '2025-01-01 10:00:00', '2025-01-01 10:00:00'),
			(4, 'Related Image Entry', 'Body 4', '', '2025/01/01/4', 'Markdown', '2025-01-01', '2025-01-01 11:00:00', '2025-01-01 11:00:00')
		`)
		if err != nil {
			t.Fatal(err)
		}

		// Insert images
		_, err = env.imagesDB.Exec(`
			INSERT INTO images (id, uri, entry_id, sig) VALUES 
			(1, 'http://example.com/img1.jpg', 3, ''),
			(2, 'http://example.com/img2.jpg', 4, '')
		`)
		if err != nil {
			t.Fatal(err)
		}

		// Insert ngrams (share "test" word)
		_, err = env.imagesDB.Exec(`
			INSERT INTO ngram (image_id, word) VALUES 
			(1, 'test'),
			(2, 'test')
		`)
		if err != nil {
			t.Fatal(err)
		}

		req := httptest.NewRequest(http.MethodGet, "/api/similar?id=3", nil)
		rec := httptest.NewRecorder()
		env.server.ServeHTTP(rec, req)

		if rec.Code != http.StatusOK {
			t.Errorf("want status 200, got %d", rec.Code)
		}

		var res struct {
			Result map[string]string `json:"result"`
		}
		if err := json.NewDecoder(rec.Body).Decode(&res); err != nil {
			t.Fatal(err)
		}

		html, ok := res.Result["3"]
		if !ok {
			t.Fatal("result for id=3 not found")
		}

		// Should verify that html contains the image or link to entry 4
		// view/similar.templ: <a href="/2025/01/01/4"> <img src="http://example.com/img2.jpg" ... />
		if !strings.Contains(html, "/2025/01/01/4") {
			t.Error("rendered HTML does not contain link to related entry")
		}
		if !strings.Contains(html, "http://example.com/img2.jpg") {
			t.Error("rendered HTML does not contain related image URI")
		}
	})
}

func TestLoadConfig(t *testing.T) {
	// Create a temporary TOML file for testing
	tomlPath := "test_config.toml"
	tomlContent := `
	data_db_path = "from_toml_data"
	static_dir = "from_toml_static"
	`
	if err := os.WriteFile(tomlPath, []byte(tomlContent), 0644); err != nil {
		t.Fatalf("failed to create test toml: %v", err)
	}
	defer os.Remove(tomlPath)

	// Set env var for config path
	os.Setenv("HANRANGON_CONFIG", tomlPath)
	defer os.Unsetenv("HANRANGON_CONFIG")

	// Set env var for override
	os.Setenv("HANRANGON_STATIC_DIR", "from_env_static")
	defer os.Unsetenv("HANRANGON_STATIC_DIR")

	cfg := LoadConfig()

	if cfg.DataDBPath != "from_toml_data" {
		t.Errorf("want from_toml_data, got %s", cfg.DataDBPath)
	}
	if cfg.StaticDir != "from_env_static" {
		t.Errorf("want from_env_static (override), got %s", cfg.StaticDir)
	}
}

func TestHandleApiEdit(t *testing.T) {
	env := setupTest(t)
	defer env.close()

	cookie := env.login(t)

	t.Run("Create new entry with auto path", func(t *testing.T) {
		payload := `{"title":"New Entry", "body":"Hello <![CDATA[<b>world</b>]]>", "format":"HTML"}`
		req := httptest.NewRequest(http.MethodPost, "/api/edit", strings.NewReader(payload))
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("Cookie", cookie)
		rec := httptest.NewRecorder()

		env.server.ServeHTTP(rec, req)

		if rec.Code != http.StatusOK {
			t.Fatalf("want status 200, got %d: %s", rec.Code, rec.Body.String())
		}

		var res EditResponse
		if err := json.Unmarshal(rec.Body.Bytes(), &res); err != nil {
			t.Fatalf("failed to unmarshal response: %v", err)
		}

		if res.ID == 0 {
			t.Fatal("got zero ID")
		}

		// Verify saved data in DB
		row, err := env.db.Query(`SELECT title, formatted_body, path FROM entries WHERE id = ?`, res.ID)
		if err != nil {
			t.Fatalf("failed to query db: %v", err)
		}
		defer row.Close()
		if !row.Next() {
			t.Fatal("entry not found in db")
		}
		var title, formattedBody, path string
		row.Scan(&title, &formattedBody, &path)

		if title != "New Entry" {
			t.Errorf("want New Entry, got %s", title)
		}
		if formattedBody != "Hello &lt;b&gt;world&lt;/b&gt;" {
			t.Errorf("formatted body not escaped: %s", formattedBody)
		}
		// Check path format YYYY/MM/DD/1
		now := time.Now().Format("2006/01/02")
		if !strings.HasPrefix(path, now) || !strings.HasSuffix(path, "/1") {
			t.Errorf("unexpected path format: %s", path)
		}
		if res.Location != "/"+path {
			t.Errorf("want location /%s, got %s", path, res.Location)
		}
	})
}

func TestHandleEdit(t *testing.T) {
	env := setupTest(t)
	defer env.close()

	t.Run("Redirect unauthenticated", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodGet, "/edit", nil)
		rec := httptest.NewRecorder()
		env.server.ServeHTTP(rec, req)

		if rec.Code != http.StatusFound {
			t.Errorf("want status 302, got %d", rec.Code)
		}
		if !strings.Contains(rec.Header().Get("Location"), "/login") {
			t.Errorf("expected redirect to /login, got %s", rec.Header().Get("Location"))
		}
	})

	t.Run("Render for authenticated", func(t *testing.T) {
		cookie := env.login(t)
		req := httptest.NewRequest(http.MethodGet, "/edit", nil)
		req.Header.Set("Cookie", cookie)
		rec := httptest.NewRecorder()
		env.server.ServeHTTP(rec, req)

		if rec.Code != http.StatusOK {
			t.Errorf("want status 200, got %d", rec.Code)
		}
		if !strings.Contains(rec.Body.String(), "<app-editor") {
			t.Errorf("body does not contain app-editor element")
		}
	})
}

func TestHandleApiUploadImage(t *testing.T) {
	env := setupTest(t)
	defer env.close()

	cookie := env.login(t)

	// Prepare multipart form file
	body := &bytes.Buffer{}
	writer := multipart.NewWriter(body)
	// Filename with non-ASCII characters to test normalization
	filename := "テスト画像.jpg"
	part, err := writer.CreateFormFile("file", filename)
	if err != nil {
		t.Fatal(err)
	}
	_, _ = part.Write([]byte("fake-image-content"))
	writer.Close()

	req := httptest.NewRequest(http.MethodPost, "/api/upload/image", body)
	req.Header.Set(echo.HeaderContentType, writer.FormDataContentType())
	req.Header.Set("Cookie", cookie)
	rec := httptest.NewRecorder()

	env.server.ServeHTTP(rec, req)

	// Verify status code
	if rec.Code != http.StatusOK {
		t.Fatalf("expected status 200, got %d: %s", rec.Code, rec.Body.String())
	}

	// Verify response JSON
	var res map[string]string
	if err := json.Unmarshal(rec.Body.Bytes(), &res); err != nil {
		t.Fatal(err)
	}

	uploadedURL, ok := res["uploaded"]
	if !ok {
		t.Fatal("response missing 'uploaded' key")
	}

	if !strings.HasPrefix(uploadedURL, "/images/entry/") {
		t.Errorf("unexpected uploaded URL prefix: %s", uploadedURL)
	}

	// Verify file existence on disk
	files, err := os.ReadDir(env.uploadDir)
	if err != nil {
		t.Fatal(err)
	}
	if len(files) != 1 {
		t.Errorf("expected 1 file in upload dir, got %d", len(files))
	}

	// Check if filename contains the original name
	if !strings.Contains(files[0].Name(), filename) {
		t.Errorf("filename %s does not contain expected part %s", files[0].Name(), filename)
	}

	// Verify content
	content, err := os.ReadFile(filepath.Join(env.uploadDir, files[0].Name()))
	if err != nil {
		t.Fatal(err)
	}
	if string(content) != "fake-image-content" {
		t.Errorf("unexpected file content: %s", string(content))
	}
}

func TestCaching(t *testing.T) {
	env := setupTest(t)
	defer env.close()

	// Insert test data with specific modified_at
	modTimeStr := "2025-01-01 12:00:00"
	_, err := env.db.Exec(`
		INSERT INTO entries (title, body, formatted_body, path, format, date, created_at, modified_at)
		VALUES 
		('Cache Entry', 'Body', '<p>Body</p>', '2025/01/01/cache', 'Markdown', '2025-01-01', '2025-01-01 10:00:00', ?)
	`, modTimeStr)
	if err != nil {
		t.Fatalf("failed to insert test data: %v", err)
	}

	targetURL := "/2025/01/01/cache"

	// 1. First request: Should have ETag and Last-Modified
	req := httptest.NewRequest(http.MethodGet, targetURL, nil)
	rec := httptest.NewRecorder()
	env.server.ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("want status 200, got %d", rec.Code)
	}

	etag := rec.Header().Get("ETag")
	lastModified := rec.Header().Get("Last-Modified")

	if etag == "" {
		t.Error("ETag header missing")
	}
	if lastModified == "" {
		t.Error("Last-Modified header missing")
	}

	// 2. Second request with If-None-Match (ETag) -> 304
	req2 := httptest.NewRequest(http.MethodGet, targetURL, nil)
	req2.Header.Set("If-None-Match", etag)
	rec2 := httptest.NewRecorder()
	env.server.ServeHTTP(rec2, req2)

	if rec2.Code != http.StatusNotModified {
		t.Errorf("want status 304 for ETag match, got %d", rec2.Code)
	}
	if rec2.Body.Len() > 0 {
		t.Error("want empty body for 304, got content")
	}

	// 3. Third request with If-Modified-Since (Last-Modified) -> 304
	req3 := httptest.NewRequest(http.MethodGet, targetURL, nil)
	req3.Header.Set("If-Modified-Since", lastModified)
	rec3 := httptest.NewRecorder()
	env.server.ServeHTTP(rec3, req3)

	if rec3.Code != http.StatusNotModified {
		t.Errorf("want status 304 for Last-Modified match, got %d", rec3.Code)
	}

	// 4. Update entry and request with old ETag -> 200 and new ETag
	newModTimeStr := "2025-01-02 12:00:00"
	_, err = env.db.Exec(`UPDATE entries SET modified_at = ? WHERE path = '2025/01/01/cache'`, newModTimeStr)
	if err != nil {
		t.Fatal(err)
	}

	req4 := httptest.NewRequest(http.MethodGet, targetURL, nil)
	req4.Header.Set("If-None-Match", etag) // Old ETag
	rec4 := httptest.NewRecorder()
	env.server.ServeHTTP(rec4, req4)

	if rec4.Code != http.StatusOK {
		t.Errorf("want status 200 for changed resource, got %d", rec4.Code)
	}

	newEtag := rec4.Header().Get("ETag")
	if newEtag == etag {
		t.Error("ETag should have changed after modification")
	}
}

func TestUpdateTrackbacksJob(t *testing.T) {
	env := setupTest(t)
	defer env.close()

	// 1. Create target entry
	_, err := env.db.Exec(`
		INSERT INTO entries (id, title, body, formatted_body, path, format, date, created_at, modified_at, status)
		VALUES (100, 'Target', 'Body', 'Formatted', '2026/01/01/1', 'Markdown', '2026-01-01', '2026-01-01 10:00:00', '2026-01-01 10:00:00', 'public')
	`)
	if err != nil {
		t.Fatal(err)
	}

	// 2. Create source entry that links to target
	// Use the default BaseURL: http://localhost:5555
	link := "http://localhost:5555/2026/01/01/1"
	_, err = env.db.Exec(`
		INSERT INTO entries (id, title, body, formatted_body, path, format, date, created_at, modified_at, status)
		VALUES (101, 'Source', 'Links to Target', 'Links to <a href="` + link + `">Target</a>', '2026/01/02/1', 'Markdown', '2026-01-02', '2026-01-02 10:00:00', '2026-01-02 10:00:00', 'public')
	`)
	if err != nil {
		t.Fatal(err)
	}

	job := jobs.NewUpdateTrackbacksJob(model.New(env.db), "http://localhost:5555")
	arg, _ := json.Marshal(jobs.UpdateTrackbacksArg{EntryID: 101})

	if err := job.Execute(context.Background(), arg); err != nil {
		t.Fatalf("job execution failed: %v", err)
	}

	// 3. Verify trackback was created
	rows, err := env.db.Query("SELECT entry_id, trackback_entry_id FROM trackbacks")
	if err != nil {
		t.Fatal(err)
	}
	defer rows.Close()
	if !rows.Next() {
		t.Fatal("no trackback record found")
	}
	var entryID, trackbackEntryID int64
	rows.Scan(&entryID, &trackbackEntryID)

	if entryID != 100 {
		t.Errorf("expected entry_id 100, got %d", entryID)
	}
	if trackbackEntryID != 101 {
		t.Errorf("expected trackback_entry_id 101, got %d", trackbackEntryID)
	}
}
