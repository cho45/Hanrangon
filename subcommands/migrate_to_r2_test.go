package subcommands

import (
	"context"
	"database/sql"
	"os"
	"path/filepath"
	"strings"
	"testing"

	"github.com/cho45/hanrangon/app"
	"github.com/cho45/hanrangon/jobqueue"
	"github.com/cho45/hanrangon/model"
	"github.com/cho45/hanrangon/tfidf"
	_ "github.com/mattn/go-sqlite3"
)

func TestRewriteImageURLs(t *testing.T) {
	tests := []struct {
		name        string
		input       string
		newBaseURL  string
		expected    string
		expectError bool
	}{
		{
			name:       "basic img tag with double quotes",
			input:      `<p>Some text <img src="/images/entry/test.jpg" alt="test"> more text</p>`,
			newBaseURL: "https://assets.lowreal.net",
			expected:   `<p>Some text <img src="https://assets.lowreal.net/entry/test.jpg" alt="test"/> more text</p>`,
		},
		{
			name:       "img tag with single quotes",
			input:      `<p><img src='/images/entry/test.jpg' alt='test'></p>`,
			newBaseURL: "https://assets.lowreal.net",
			expected:   `<p><img src="https://assets.lowreal.net/entry/test.jpg" alt="test"/></p>`,
		},
		{
			name:       "multiple img tags",
			input:      `<p><img src="/images/entry/test1.jpg"><img src="/images/entry/test2.jpg"></p>`,
			newBaseURL: "https://assets.lowreal.net",
			expected:   `<p><img src="https://assets.lowreal.net/entry/test1.jpg"/><img src="https://assets.lowreal.net/entry/test2.jpg"/></p>`,
		},
		{
			name:       "a tag with image href",
			input:      `<p><a href="/images/entry/test.jpg">Image</a></p>`,
			newBaseURL: "https://assets.lowreal.net",
			expected:   `<p><a href="https://assets.lowreal.net/entry/test.jpg">Image</a></p>`,
		},
		{
			name:       "external URL should not be rewritten",
			input:      `<p><img src="https://example.com/image.jpg"></p>`,
			newBaseURL: "https://assets.lowreal.net",
			expected:   `<p><img src="https://example.com/image.jpg"/></p>`,
		},
		{
			name:       "relative URL (non-entry) should not be rewritten",
			input:      `<p><img src="/static/icon.png"></p>`,
			newBaseURL: "https://assets.lowreal.net",
			expected:   `<p><img src="/static/icon.png"/></p>`,
		},
		{
			name:       "HTML comment should not be processed",
			input:      `<p><!-- <img src="/images/entry/test.jpg"> --></p>`,
			newBaseURL: "https://assets.lowreal.net",
			expected:   `<p><!-- <img src="/images/entry/test.jpg"> --></p>`,
		},
		{
			name:       "special characters in filename should be preserved",
			input:      `<p><img src="/images/entry/test file 日本語.jpg"></p>`,
			newBaseURL: "https://assets.lowreal.net",
			expected:   `<p><img src="https://assets.lowreal.net/entry/test file 日本語.jpg"/></p>`,
		},
		{
			name:       "newBaseURL with trailing slash should be trimmed",
			input:      `<p><img src="/images/entry/test.jpg"></p>`,
			newBaseURL: "https://assets.lowreal.net/",
			expected:   `<p><img src="https://assets.lowreal.net/entry/test.jpg"/></p>`,
		},
		{
			name: "complex HTML structure",
			input: `<div class="entry">
				<p>Text before</p>
				<figure>
					<a href="/images/entry/photo.jpg">
						<img src="/images/entry/photo.jpg" alt="Photo">
					</a>
					<figcaption>Caption</figcaption>
				</figure>
				<p>Text after</p>
			</div>`,
			newBaseURL: "https://assets.lowreal.net",
			expected: `<div class="entry">
				<p>Text before</p>
				<figure>
					<a href="https://assets.lowreal.net/entry/photo.jpg">
						<img src="https://assets.lowreal.net/entry/photo.jpg" alt="Photo"/>
					</a>
					<figcaption>Caption</figcaption>
				</figure>
				<p>Text after</p>
			</div>`,
		},
		{
			name:       "already migrated URLs should not be rewritten",
			input:      `<p><img src="https://assets.lowreal.net/entry/test.jpg"></p>`,
			newBaseURL: "https://assets.lowreal.net",
			expected:   `<p><img src="https://assets.lowreal.net/entry/test.jpg"/></p>`,
		},
		{
			name:       "img tag without quotes",
			input:      `<p><img src=/images/entry/test.jpg style=max-width:320px></p>`,
			newBaseURL: "https://assets.lowreal.net",
			expected:   `<p><img src="https://assets.lowreal.net/entry/test.jpg" style="max-width:320px"/></p>`,
		},
		{
			name:       "img tag with itemprop attribute",
			input:      `<span><img alt=photo itemprop=image src=/images/entry/test.jpg></span>`,
			newBaseURL: "https://assets.lowreal.net",
			expected:   `<span><img alt="photo" itemprop="image" src="https://assets.lowreal.net/entry/test.jpg"/></span>`,
		},
		{
			name:       "a tag without quotes",
			input:      `<p><a href=/images/entry/test.jpg>Image</a></p>`,
			newBaseURL: "https://assets.lowreal.net",
			expected:   `<p><a href="https://assets.lowreal.net/entry/test.jpg">Image</a></p>`,
		},
		{
			name:       "clickable image - a href and img src both point to same image",
			input:      `<span><a href=/images/entry/20201221185042-8b27d327f9cbce8c.jpg class=picasa itemprop=url><img alt=photo itemprop=image src=/images/entry/20201221185042-8b27d327f9cbce8c.jpg></a></span>`,
			newBaseURL: "https://assets.lowreal.net",
			expected:   `<span><a href="https://assets.lowreal.net/entry/20201221185042-8b27d327f9cbce8c.jpg" class="picasa" itemprop="url"><img alt="photo" itemprop="image" src="https://assets.lowreal.net/entry/20201221185042-8b27d327f9cbce8c.jpg"/></a></span>`,
		},
		{
			name:       "img tag with empty alt attribute",
			input:      `<p><img alt="" src=/images/entry/calibration.png></p>`,
			newBaseURL: "https://assets.lowreal.net",
			expected:   `<p><img alt="" src="https://assets.lowreal.net/entry/calibration.png"/></p>`,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result, err := RewriteImageURLs(tt.input, tt.newBaseURL)
			if tt.expectError {
				if err == nil {
					t.Errorf("expected error, got nil")
				}
				return
			}
			if err != nil {
				t.Fatalf("unexpected error: %v", err)
			}

			// Normalize whitespace for comparison
			normalizedResult := normalizeWhitespace(result)
			normalizedExpected := normalizeWhitespace(tt.expected)

			if normalizedResult != normalizedExpected {
				t.Errorf("expected:\n%s\n\ngot:\n%s", normalizedExpected, normalizedResult)
			}
		})
	}
}

// normalizeWhitespace normalizes whitespace in HTML for comparison
func normalizeWhitespace(s string) string {
	// Simple implementation: just trim each line and remove empty lines
	// This is sufficient for our test cases
	lines := []string{}
	for _, line := range splitLines(s) {
		trimmed := trimSpace(line)
		if trimmed != "" {
			lines = append(lines, trimmed)
		}
	}
	return joinLines(lines)
}

func splitLines(s string) []string {
	var lines []string
	var current []rune
	for _, r := range s {
		if r == '\n' {
			lines = append(lines, string(current))
			current = nil
		} else {
			current = append(current, r)
		}
	}
	if len(current) > 0 {
		lines = append(lines, string(current))
	}
	return lines
}

func trimSpace(s string) string {
	start := 0
	end := len(s)
	for start < end && isSpace(rune(s[start])) {
		start++
	}
	for end > start && isSpace(rune(s[end-1])) {
		end--
	}
	return s[start:end]
}

func isSpace(r rune) bool {
	return r == ' ' || r == '\t' || r == '\n' || r == '\r'
}

func joinLines(lines []string) string {
	result := ""
	for i, line := range lines {
		if i > 0 {
			result += "\n"
		}
		result += line
	}
	return result
}

// Integration tests

func setupTestDB(t *testing.T) (*sql.DB, *sql.DB, *sql.DB, *sql.DB) {
	t.Helper()

	// Main DB
	db, err := sql.Open("sqlite3", ":memory:")
	if err != nil {
		t.Fatal(err)
	}

	// Load schema
	schema, err := os.ReadFile("../db/schema/schema.sql")
	if err != nil {
		t.Fatal(err)
	}
	if _, err := db.Exec(string(schema)); err != nil {
		t.Fatal(err)
	}

	// TF-IDF DB
	tfidfDB, err := sql.Open("sqlite3", ":memory:")
	if err != nil {
		t.Fatal(err)
	}
	tfidfSchema, err := os.ReadFile("../db/schema/tfidf.sql")
	if err != nil {
		t.Fatal(err)
	}
	if _, err := tfidfDB.Exec(string(tfidfSchema)); err != nil {
		t.Fatal(err)
	}

	// Worker DB
	workerDB, err := sql.Open("sqlite3", ":memory:")
	if err != nil {
		t.Fatal(err)
	}
	workerSchema, err := os.ReadFile("../db/schema/worker.sql")
	if err != nil {
		t.Fatal(err)
	}
	if _, err := workerDB.Exec(string(workerSchema)); err != nil {
		t.Fatal(err)
	}

	// Images DB
	imagesDB, err := sql.Open("sqlite3", ":memory:")
	if err != nil {
		t.Fatal(err)
	}
	imagesSchema, err := os.ReadFile("../db/schema/images.sql")
	if err != nil {
		t.Fatal(err)
	}
	if _, err := imagesDB.Exec(string(imagesSchema)); err != nil {
		t.Fatal(err)
	}

	return db, tfidfDB, workerDB, imagesDB
}

func TestMigrator_RewriteEntries(t *testing.T) {
	db, tfidfDB, workerDB, imagesDB := setupTestDB(t)
	defer db.Close()
	defer tfidfDB.Close()
	defer workerDB.Close()
	defer imagesDB.Close()

	// Setup test app
	config := &app.Config{
		R2PublicURL: "https://assets.lowreal.net",
	}

	registry := jobqueue.NewRegistry()
	workerQueries := model.New(workerDB)
	worker := jobqueue.NewWorker(workerDB, workerQueries, registry)

	tfidfQueries := model.New(tfidfDB)
	dataQueries := model.New(db)
	calc, _ := tfidf.NewCalculator(tfidfDB, tfidfQueries, db, dataQueries)
	sim := tfidf.NewSimilarityCalculator(tfidfDB, tfidfQueries)
	searcher := tfidf.NewSearcher(tfidfDB, tfidfQueries, calc)

	application := app.NewApp(config, db, tfidfDB, workerDB, imagesDB, calc, sim, searcher, worker)

	// Insert test entries
	_, err := db.Exec(`
		INSERT INTO entries (id, path, title, body, formatted_body, format, status, date, created_at, modified_at, publish_at)
		VALUES
			(1, '/2024/01/test1', 'Test 1', 'body', '<p><img src="/images/entry/test1.jpg"></p>', 'html', 'public', '2024-01-01', datetime('now'), datetime('now'), datetime('now')),
			(2, '/2024/01/test2', 'Test 2', 'body', '<p>Text without images</p>', 'html', 'public', '2024-01-02', datetime('now'), datetime('now'), datetime('now')),
			(3, '/2024/01/test3', 'Test 3', 'body', '<p><a href="/images/entry/test3.jpg"><img src="/images/entry/test3.jpg"></a></p>', 'html', 'public', '2024-01-03', datetime('now'), datetime('now'), datetime('now'))
	`)
	if err != nil {
		t.Fatal(err)
	}

	// Create migrator
	migrator := &Migrator{
		app:         application,
		r2Storage:   nil, // Not needed for RewriteEntries test
		r2PublicURL: "https://assets.lowreal.net",
		uploadDir:   "",
		opts: &MigrateToR2Options{
			DryRun: false,
		},
	}

	// Execute RewriteEntries
	ctx := context.Background()
	if err := migrator.RewriteEntries(ctx); err != nil {
		t.Fatalf("RewriteEntries failed: %v", err)
	}

	// Verify entries were rewritten
	var count int
	err = db.QueryRow(`SELECT COUNT(*) FROM entries WHERE formatted_body LIKE '%/images/entry/%'`).Scan(&count)
	if err != nil {
		t.Fatal(err)
	}
	if count != 0 {
		t.Errorf("expected 0 entries with /images/entry/, got %d", count)
	}

	// Verify specific entries
	var formattedBody string
	err = db.QueryRow(`SELECT formatted_body FROM entries WHERE id = 1`).Scan(&formattedBody)
	if err != nil {
		t.Fatal(err)
	}
	if !strings.Contains(formattedBody, "https://assets.lowreal.net/entry/test1.jpg") {
		t.Errorf("entry 1 was not rewritten correctly: %s", formattedBody)
	}

	err = db.QueryRow(`SELECT formatted_body FROM entries WHERE id = 3`).Scan(&formattedBody)
	if err != nil {
		t.Fatal(err)
	}
	if !strings.Contains(formattedBody, "https://assets.lowreal.net/entry/test3.jpg") {
		t.Errorf("entry 3 was not rewritten correctly: %s", formattedBody)
	}
}

func TestMigrator_UpdateImageURIs(t *testing.T) {
	db, tfidfDB, workerDB, imagesDB := setupTestDB(t)
	defer db.Close()
	defer tfidfDB.Close()
	defer workerDB.Close()
	defer imagesDB.Close()

	// Setup test app
	config := &app.Config{
		R2PublicURL: "https://assets.lowreal.net",
	}

	registry := jobqueue.NewRegistry()
	workerQueries := model.New(workerDB)
	worker := jobqueue.NewWorker(workerDB, workerQueries, registry)

	tfidfQueries := model.New(tfidfDB)
	dataQueries := model.New(db)
	calc, _ := tfidf.NewCalculator(tfidfDB, tfidfQueries, db, dataQueries)
	sim := tfidf.NewSimilarityCalculator(tfidfDB, tfidfQueries)
	searcher := tfidf.NewSearcher(tfidfDB, tfidfQueries, calc)

	application := app.NewApp(config, db, tfidfDB, workerDB, imagesDB, calc, sim, searcher, worker)

	// Insert test images
	_, err := imagesDB.Exec(`
		INSERT INTO images (uri, entry_id, sig)
		VALUES
			('/images/entry/test1.jpg', 1, X'0001'),
			('/images/entry/test2.jpg', 2, X'0002'),
			('https://example.com/external.jpg', 3, X'0003')
	`)
	if err != nil {
		t.Fatal(err)
	}

	// Create migrator
	migrator := &Migrator{
		app:         application,
		r2Storage:   nil,
		r2PublicURL: "https://assets.lowreal.net",
		uploadDir:   "",
		opts: &MigrateToR2Options{
			DryRun: false,
		},
	}

	// Execute UpdateImageURIs
	ctx := context.Background()
	if err := migrator.UpdateImageURIs(ctx); err != nil {
		t.Fatalf("UpdateImageURIs failed: %v", err)
	}

	// Verify images were updated
	var count int
	err = imagesDB.QueryRow(`SELECT COUNT(*) FROM images WHERE uri LIKE '/images/entry/%'`).Scan(&count)
	if err != nil {
		t.Fatal(err)
	}
	if count != 0 {
		t.Errorf("expected 0 images with /images/entry/ URI, got %d", count)
	}

	// Verify specific URIs
	var uri string
	err = imagesDB.QueryRow(`SELECT uri FROM images WHERE entry_id = 1`).Scan(&uri)
	if err != nil {
		t.Fatal(err)
	}
	expected := "https://assets.lowreal.net/entry/test1.jpg"
	if uri != expected {
		t.Errorf("expected URI %q, got %q", expected, uri)
	}

	// Verify external URL was not changed
	err = imagesDB.QueryRow(`SELECT uri FROM images WHERE entry_id = 3`).Scan(&uri)
	if err != nil {
		t.Fatal(err)
	}
	expected = "https://example.com/external.jpg"
	if uri != expected {
		t.Errorf("external URL should not be changed, expected %q, got %q", expected, uri)
	}
}

func TestMigrator_Idempotency(t *testing.T) {
	db, tfidfDB, workerDB, imagesDB := setupTestDB(t)
	defer db.Close()
	defer tfidfDB.Close()
	defer workerDB.Close()
	defer imagesDB.Close()

	// Setup test app
	config := &app.Config{
		R2PublicURL: "https://assets.lowreal.net",
	}

	registry := jobqueue.NewRegistry()
	workerQueries := model.New(workerDB)
	worker := jobqueue.NewWorker(workerDB, workerQueries, registry)

	tfidfQueries := model.New(tfidfDB)
	dataQueries := model.New(db)
	calc, _ := tfidf.NewCalculator(tfidfDB, tfidfQueries, db, dataQueries)
	sim := tfidf.NewSimilarityCalculator(tfidfDB, tfidfQueries)
	searcher := tfidf.NewSearcher(tfidfDB, tfidfQueries, calc)

	application := app.NewApp(config, db, tfidfDB, workerDB, imagesDB, calc, sim, searcher, worker)

	// Insert test entry
	_, err := db.Exec(`
		INSERT INTO entries (id, path, title, body, formatted_body, format, status, date, created_at, modified_at, publish_at)
		VALUES (1, '/2024/01/test', 'Test', 'body', '<p><img src="/images/entry/test.jpg"></p>', 'html', 'public', '2024-01-01', datetime('now'), datetime('now'), datetime('now'))
	`)
	if err != nil {
		t.Fatal(err)
	}

	// Create migrator
	migrator := &Migrator{
		app:         application,
		r2Storage:   nil,
		r2PublicURL: "https://assets.lowreal.net",
		uploadDir:   "",
		opts: &MigrateToR2Options{
			DryRun: false,
		},
	}

	ctx := context.Background()

	// First run
	if err := migrator.RewriteEntries(ctx); err != nil {
		t.Fatalf("First RewriteEntries failed: %v", err)
	}

	var formattedBody1 string
	err = db.QueryRow(`SELECT formatted_body FROM entries WHERE id = 1`).Scan(&formattedBody1)
	if err != nil {
		t.Fatal(err)
	}

	// Second run (should be idempotent)
	if err := migrator.RewriteEntries(ctx); err != nil {
		t.Fatalf("Second RewriteEntries failed: %v", err)
	}

	var formattedBody2 string
	err = db.QueryRow(`SELECT formatted_body FROM entries WHERE id = 1`).Scan(&formattedBody2)
	if err != nil {
		t.Fatal(err)
	}

	// Verify idempotency
	if formattedBody1 != formattedBody2 {
		t.Errorf("RewriteEntries is not idempotent:\nFirst:  %s\nSecond: %s", formattedBody1, formattedBody2)
	}

	// Verify no double rewriting occurred
	if strings.Contains(formattedBody2, "https://assets.lowreal.net/entry/https://assets.lowreal.net") {
		t.Errorf("Double rewriting detected: %s", formattedBody2)
	}
}

func TestMigrator_UploadFiles_LocalFileListing(t *testing.T) {
	// Create temporary directory with test files
	tmpDir := t.TempDir()

	testFiles := []string{
		"test1.jpg",
		"test2.png",
		filepath.Join("subdir", "test3.jpg"),
	}

	for _, f := range testFiles {
		fullPath := filepath.Join(tmpDir, f)
		if err := os.MkdirAll(filepath.Dir(fullPath), 0755); err != nil {
			t.Fatal(err)
		}
		if err := os.WriteFile(fullPath, []byte("test content"), 0644); err != nil {
			t.Fatal(err)
		}
	}

	// Create migrator with dry-run mode
	migrator := &Migrator{
		app:         nil,
		r2Storage:   nil,
		r2PublicURL: "https://assets.lowreal.net",
		uploadDir:   tmpDir,
		opts: &MigrateToR2Options{
			DryRun:   true,
			Parallel: 1,
		},
	}

	// List files
	files, err := migrator.listLocalFiles()
	if err != nil {
		t.Fatalf("listLocalFiles failed: %v", err)
	}

	if len(files) != len(testFiles) {
		t.Errorf("expected %d files, got %d", len(testFiles), len(files))
	}

	// Verify file paths
	for _, expected := range testFiles {
		found := false
		for _, actual := range files {
			if actual == expected {
				found = true
				break
			}
		}
		if !found {
			t.Errorf("expected file %q not found in list", expected)
		}
	}
}
