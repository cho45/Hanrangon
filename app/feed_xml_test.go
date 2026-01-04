package app

import (
	"encoding/xml"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

func TestHandleFeed_XMLParsing(t *testing.T) {
	env := setupTest(t)
	defer env.close()

	// Insert test data with some HTML characters to check escaping
	_, err := env.db.Exec(`
		INSERT INTO entries (title, body, formatted_body, path, format, date, created_at, modified_at)
		VALUES
		('Feed Entry <1>', 'Body', '<p>Body & "quote"</p>', '2025/01/01/1', 'Markdown', '2025-01-01', '2025-01-01 10:00:00', '2025-01-01 10:00:00'),
		('', 'Empty title body', '<p>Empty title body</p>', '2025/01/01/2', 'Markdown', '2025-01-01', '2025-01-01 10:01:00', '2025-01-01 10:01:00'),
		('[tag] Title with tag', 'Body', '<p>Body</p>', '2025/01/01/3', 'Markdown', '2025-01-01', '2025-01-01 10:02:00', '2025-01-01 10:02:00')
	`)
	if err != nil {
		t.Fatalf("failed to insert test data: %v", err)
	}

	req := httptest.NewRequest(http.MethodGet, "/feed", nil)
	rec := httptest.NewRecorder()

	env.server.ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("want status 200, got %d", rec.Code)
	}

	body := rec.Body.String()

	// Check XML declaration
	if !strings.HasPrefix(strings.TrimSpace(body), "<?xml") {
		t.Errorf("Response does not start with XML declaration. Got: %s", body[:50])
	}

	// Try to parse as XML
	var feed struct {
		XMLName xml.Name `xml:"feed"`
		Title   string   `xml:"title"`
		Entries []struct {
			Title   string `xml:"title"`
			Content struct {
				Type string `xml:"type,attr"`
				Body string `xml:",innerxml"`
			} `xml:"content"`
		} `xml:"entry"`
	}

	err = xml.Unmarshal(rec.Body.Bytes(), &feed)
	if err != nil {
		t.Fatalf("Failed to parse XML: %v\nOutput: %s", err, body)
	}

	if feed.Title != "氾濫原" {
		t.Errorf("Expected feed title '氾濫原', got '%s'", feed.Title)
	}

	if len(feed.Entries) != 3 {
		t.Fatalf("Expected 3 entries, got %d", len(feed.Entries))
	}

	// ListEntries uses ORDER BY date DESC, created_at ASC
	// All entries have same date.
	// Entry 1: 'Feed Entry <1>', created at 10:00:00
	if feed.Entries[0].Title != "Feed Entry <1>" {
		t.Errorf("Expected entry title 'Feed Entry <1>', got '%s'", feed.Entries[0].Title)
	}

	// Entry 2: '', created at 10:01:00 -> '✖'
	if feed.Entries[1].Title != "✖" {
		t.Errorf("Expected entry title '✖', got '%s'", feed.Entries[1].Title)
	}

	// Entry 3: '[tag] Title with tag', created at 10:02:00 -> 'Title with tag'
	if feed.Entries[2].Title != "Title with tag" {
		t.Errorf("Expected entry title 'Title with tag', got '%s'", feed.Entries[2].Title)
	}
}

func TestHandleSitemap_XMLParsing(t *testing.T) {
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
		t.Fatalf("want status 200, got %d", rec.Code)
	}

	body := rec.Body.String()

	// Check XML declaration
	if !strings.HasPrefix(strings.TrimSpace(body), "<?xml") {
		t.Errorf("Response does not start with XML declaration. Got: %s", body[:50])
	}

	// Try to parse as XML
	var sitemap struct {
		XMLName xml.Name `xml:"urlset"`
	}

	err = xml.Unmarshal(rec.Body.Bytes(), &sitemap)
	if err != nil {
		t.Fatalf("Failed to parse XML: %v\nOutput: %s", err, body)
	}
}
