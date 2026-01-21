package app

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"github.com/PuerkitoBio/goquery"
	"github.com/cho45/hanrangon/backend/model/maindb"
	"github.com/labstack/echo/v4"
)

func mustParseHTML(t *testing.T, body string) *goquery.Document {
	t.Helper()
	if !strings.Contains(body, "</html>") {
		t.Errorf("response body does not contain </html> tag (possibly truncated)")
	}
	doc, err := goquery.NewDocumentFromReader(strings.NewReader(body))
	if err != nil {
		t.Fatalf("failed to parse HTML: %v", err)
	}
	return doc
}
func TestDateTimeHandling(t *testing.T) {
	env := setupTest(t)
	defer env.close()

	ctx := context.Background()
	// Fix time to a specific value in JST
	jst := time.FixedZone("Asia/Tokyo", 9*60*60)
	now := time.Date(2026, 1, 3, 15, 4, 5, 0, jst)

	// 1. Create entry via queries
	entry, err := env.app.MainDB().Q.CreateEntry(ctx, maindb.CreateEntryParams{
		Title:         "TZ Test",
		Body:          "Body",
		FormattedBody: "<p>Body</p>",
		Path:          "2026/01/03/tz-test",
		Format:        "Markdown",
		Date:          "2026-01-03",
		CreatedAt:     now,
		ModifiedAt:    now,
		Status:        "public",
	})
	if err != nil {
		t.Fatalf("Failed to create entry: %v", err)
	}

	// 2. Check raw DB value (must be YYYY-MM-DD HH:MM:SS string without TZ)
	var rawCreatedAt string
	err = env.db.QueryRow("SELECT CAST(created_at AS TEXT) FROM entries WHERE id = ?", entry.ID).Scan(&rawCreatedAt)
	if err != nil {
		t.Fatalf("Failed to query raw created_at: %v", err)
	}

	// Now we expect TZ suffix in the raw string as we decided to migrate the DB to include it
	expectedRaw := "2026-01-03 15:04:05+09:00"
	if rawCreatedAt != expectedRaw {
		t.Errorf("Raw DB datetime mismatch. got=%s, want=%s", rawCreatedAt, expectedRaw)
	}

	// 3. Read back and check time.Time Location
	readEntry, err := env.app.MainDB().Q.GetEntryById(ctx, entry.ID)
	if err != nil {
		t.Fatalf("Failed to get entry: %v", err)
	}

	if !readEntry.CreatedAt.Equal(now) {
		t.Errorf("Time equality mismatch. got=%v, want=%v", readEntry.CreatedAt, now)
	}

	_, offset := readEntry.CreatedAt.Zone()
	if offset != 9*60*60 {
		t.Errorf("Timezone offset mismatch. got=%d, want=%d (JST)", offset, 9*60*60)
	}
}
func TestSqlcDateOverride(t *testing.T) {
	env := setupTest(t)
	defer env.close()

	ctx := context.Background()
	now := time.Now()
	expectedDate := "2026-01-07"

	// 1. データを挿入
	_, err := env.db.Exec(`
		INSERT INTO entries (title, body, formatted_body, summary, image_url, path, format, date, created_at, modified_at, status)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
	`, "Test", "Body", "", "", "", "test-path", "Markdown", expectedDate, now, now, "public")
	if err != nil {
		t.Fatalf("Failed to insert test data: %v", err)
	}

	// 2. sqlc の生成したクエリ (ListEntries) で取得
	// CAST(date AS TEXT) が効いていることを確認する
	rows, err := env.app.MainDB().Q.ListEntries(ctx, maindb.ListEntriesParams{
		TargetDate: "9999-12-31",
		Limit:      1,
	})
	if err != nil {
		t.Fatalf("ListEntries failed: %v", err)
	}

	if len(rows) == 0 {
		t.Fatal("No entries returned")
	}

	actualDate := rows[0].Date
	t.Logf("Actual Date from sqlc: %q", actualDate)

	// 3. 形式の検証
	if actualDate != expectedDate {
		t.Errorf("Date mismatch. got=%q, want=%q (Is it converted to time.Time format accidentally?)", actualDate, expectedDate)
	}

	// RFC3339 形式 (2026-01-07T00:00:00Z など) になっていないことを確認
	if strings.Contains(actualDate, "T") || strings.Contains(actualDate, ":") {
		t.Errorf("Date contains time information: %q", actualDate)
	}
}
func TestHTTPErrorHandler(t *testing.T) {
	env := setupTest(t)
	defer env.close()

	// e.HTTPErrorHandler is already set in NewServer,
	// but setupTest might override it for other tests.
	// We need to use the one from NewServer for this test.
	env.server.HTTPErrorHandler = NewServer(env.app.(*AppImpl)).HTTPErrorHandler

	t.Run("404 HTML", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodGet, "/not-found-page", nil)
		req.Header.Set("Accept", "text/html")
		rec := httptest.NewRecorder()
		env.server.ServeHTTP(rec, req)

		if rec.Code != http.StatusNotFound {
			t.Errorf("want 404, got %d", rec.Code)
		}
		if !strings.Contains(rec.Header().Get("Content-Type"), "text/html") {
			t.Errorf("want text/html, got %s", rec.Header().Get("Content-Type"))
		}
		if !strings.Contains(rec.Body.String(), "お探しのページは見つかりませんでした。") {
			t.Errorf("body does not contain error message")
		}
	})

	t.Run("404 HTML Dev Mode", func(t *testing.T) {
		env.app.Config().Environment = "development"
		req := httptest.NewRequest(http.MethodGet, "/not-found-page-dev", nil)
		req.Header.Set("Accept", "text/html")
		rec := httptest.NewRecorder()
		env.server.ServeHTTP(rec, req)

		body := rec.Body.String()
		if !strings.Contains(body, "Error: code=404, message=Entry not found") {
			t.Errorf("body does not contain error detail, got: %s", body)
		}
	})

	t.Run("404 JSON", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodGet, "/not-found-page", nil)
		req.Header.Set("Accept", "application/json")
		rec := httptest.NewRecorder()
		env.server.ServeHTTP(rec, req)

		if rec.Code != http.StatusNotFound {
			t.Errorf("want 404, got %d", rec.Code)
		}
		var resp map[string]string
		if err := json.Unmarshal(rec.Body.Bytes(), &resp); err != nil {
			t.Fatalf("failed to unmarshal JSON: %v", err)
		}
		if resp["message"] != "Entry not found" {
			t.Errorf("want 'Entry not found', got %s", resp["message"])
		}
	})

	t.Run("500 JSON", func(t *testing.T) {
		// Mock a route that returns a 500 error
		env.server.GET("/error-500", func(c echo.Context) error {
			return echo.NewHTTPError(http.StatusInternalServerError, "Internal Error")
		})

		req := httptest.NewRequest(http.MethodGet, "/error-500", nil)
		req.Header.Set("Accept", "application/json")
		rec := httptest.NewRecorder()
		env.server.ServeHTTP(rec, req)

		if rec.Code != http.StatusInternalServerError {
			t.Errorf("want 500, got %d", rec.Code)
		}
		var resp map[string]string
		if err := json.Unmarshal(rec.Body.Bytes(), &resp); err != nil {
			t.Fatalf("failed to unmarshal JSON: %v", err)
		}
		if resp["message"] != "Internal Error" {
			t.Errorf("want 'Internal Error', got %s", resp["message"])
		}
	})

	t.Run("500 JSON Dev Mode", func(t *testing.T) {
		// Set development mode
		env.app.Config().Environment = "development"

		env.server.GET("/error-500-dev", func(c echo.Context) error {
			return echo.NewHTTPError(http.StatusInternalServerError, "Dev Error").SetInternal(fmt.Errorf("root cause"))
		})

		req := httptest.NewRequest(http.MethodGet, "/error-500-dev", nil)
		req.Header.Set("Accept", "application/json")
		rec := httptest.NewRecorder()
		env.server.ServeHTTP(rec, req)

		var resp map[string]interface{}
		json.Unmarshal(rec.Body.Bytes(), &resp)

		if resp["error"] == nil {
			t.Error("expected error detail in dev mode")
		}
		if resp["internal"] != "root cause" {
			t.Errorf("want 'root cause', got %v", resp["internal"])
		}
	})
}
