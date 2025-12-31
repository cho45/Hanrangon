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
