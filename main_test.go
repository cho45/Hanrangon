package main

import (
	"database/sql"
	"net/http"
	"net/http/httptest"
	"os"
	"strings"
	"testing"

	"github.com/cho45/hanrangon/model"
	"github.com/labstack/echo/v4"
	_ "modernc.org/sqlite"
)

func setupTestDB(t *testing.T) *sql.DB {
	t.Helper()

	db, err := sql.Open("sqlite", ":memory:")
	if err != nil {
		t.Fatalf("failed to open memory db: %v", err)
	}

	// Read schema
	schema, err := os.ReadFile("db/schema/schema.sql")
	if err != nil {
		t.Fatalf("failed to read schema: %v", err)
	}

	// Apply schema
	if _, err := db.Exec(string(schema)); err != nil {
		t.Fatalf("failed to apply schema: %v", err)
	}

	return db
}

func TestHandleIndex(t *testing.T) {
	db := setupTestDB(t)
	defer db.Close()

	// Insert test data
	queries := model.New(db)

	_, err := db.Exec(`
		INSERT INTO entries (title, body, formatted_body, path, format, date, created_at, modified_at)
		VALUES 
		('Test Entry 1', 'Body 1', '<p>Formatted Body 1</p>', '2025/01/01/1', 'Markdown', '2025-01-01', '2025-01-01 10:00:00', '2025-01-01 10:00:00'),
		('Test Entry 2', 'Body 2', '<p>Formatted Body 2</p>', '2025/01/01/2', 'Markdown', '2025-01-01', '2025-01-01 12:00:00', '2025-01-01 12:00:00')
	`)
	if err != nil {
		t.Fatalf("failed to insert test data: %v", err)
	}

	app := &App{
		queries: queries,
		db:      db,
	}

	e := echo.New()
	req := httptest.NewRequest(http.MethodGet, "/", nil)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)

	if err := app.HandleIndex(c); err != nil {
		t.Errorf("HandleIndex returned error: %v", err)
	}

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
	db := setupTestDB(t)
	defer db.Close()

	queries := model.New(db)

	_, err := db.Exec(`
		INSERT INTO entries (title, body, formatted_body, path, format, date, created_at, modified_at)
		VALUES 
		('Test Entry 1', 'Body 1', '<p>Formatted Body 1</p>', '2025/01/01/1', 'Markdown', '2025-01-01', '2025-01-01 10:00:00', '2025-01-01 10:00:00'),
		('Test Entry 2', 'Body 2', '<p>Formatted Body 2</p>', '2025/01/01/2', 'Markdown', '2025-01-01', '2025-01-01 12:00:00', '2025-01-01 12:00:00')
	`)
	if err != nil {
		t.Fatalf("failed to insert test data: %v", err)
	}

	app := &App{
		queries: queries,
		db:      db,
	}

	e := echo.New()

	t.Run("Existing entry", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodGet, "/2025/01/01/1", nil)
		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)
		c.SetPath("/:yyyy/:mm/:dd/:n")
		c.SetParamNames("yyyy", "mm", "dd", "n")
		c.SetParamValues("2025", "01", "01", "1")

		if err := app.HandleEntry(c); err != nil {
			t.Errorf("HandleEntry returned error: %v", err)
		}

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
		c := e.NewContext(req, rec)
		c.SetPath("/:yyyy/:mm/:dd/:n")
		c.SetParamNames("yyyy", "mm", "dd", "n")
		c.SetParamValues("2025", "01", "01", "999")

		err := app.HandleEntry(c)
		if err == nil {
			t.Error("HandleEntry should return error for non-existing entry")
		}

		httpErr, ok := err.(*echo.HTTPError)
		if !ok || httpErr.Code != http.StatusNotFound {
			t.Errorf("want 404 Not Found, got %v", err)
		}
	})
}

func TestHandleArchive(t *testing.T) {
	db := setupTestDB(t)
	defer db.Close()

	queries := model.New(db)

	_, err := db.Exec(`
		INSERT INTO entries (title, body, formatted_body, path, format, date, created_at, modified_at)
		VALUES 
		('Entry 1', 'Body 1', '', '2025/01/01/1', 'Markdown', '2025-01-01', '2025-01-01 10:00:00', '2025-01-01 10:00:00'),
		('Entry 2', 'Body 2', '', '2025/01/02/1', 'Markdown', '2025-01-02', '2025-01-02 10:00:00', '2025-01-02 10:00:00'),
		('Entry 3', 'Body 3', '', '2024/12/31/1', 'Markdown', '2024-12-31', '2024-12-31 10:00:00', '2024-12-31 10:00:00')
	`)
	if err != nil {
		t.Fatalf("failed to insert test data: %v", err)
	}

	app := &App{
		queries: queries,
		db:      db,
	}

	e := echo.New()
	req := httptest.NewRequest(http.MethodGet, "/archive", nil)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)

	if err := app.HandleArchive(c); err != nil {
		t.Errorf("HandleArchive returned error: %v", err)
	}

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
	db := setupTestDB(t)
	defer db.Close()

	queries := model.New(db)

	_, err := db.Exec(`
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

	app := &App{
		queries: queries,
		db:      db,
	}

	e := echo.New()
	// Register routes as in main()
	e.GET("/:yyyy/", app.HandleDateArchive)
	e.GET("/:yyyy/:mm/", app.HandleDateArchive)
	e.GET("/:yyyy/:mm/:dd/", app.HandleDateArchive)

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

			e.ServeHTTP(rec, req)

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

	db := setupTestDB(t)

	defer db.Close()

	_, err := db.Exec(`

	

	

			INSERT INTO entries (title, body, formatted_body, path, format, date, created_at, modified_at)

			VALUES 

			('[test] Tagged Entry', 'Body', '', '2025/01/01/1', 'Markdown', '2025-01-01', '2025-01-01 10:00:00', '2025-01-01 10:00:00'),

			('Normal Entry', 'Body', '', '2025/01/02/1', 'Markdown', '2025-01-02', '2025-01-02 10:00:00', '2025-01-02 10:00:00')

		`)

	if err != nil {

		t.Fatalf("failed to insert test data: %v", err)

	}

	e := NewServer(db)

	req := httptest.NewRequest(http.MethodGet, "/test/", nil)

	rec := httptest.NewRecorder()

	e.ServeHTTP(rec, req)

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

	db := setupTestDB(t)

	defer db.Close()

	_, err := db.Exec(`

				INSERT INTO entries (title, body, formatted_body, path, format, date, created_at, modified_at)

				VALUES 

				('Feed Entry 1', 'Body', '<p>Body</p>', '2025/01/01/1', 'Markdown', '2025-01-01', '2025-01-01 10:00:00', '2025-01-01 10:00:00')

			`)

	if err != nil {

		t.Fatalf("failed to insert test data: %v", err)

	}

	e := NewServer(db)

	req := httptest.NewRequest(http.MethodGet, "/feed", nil)

	rec := httptest.NewRecorder()

	e.ServeHTTP(rec, req)

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
