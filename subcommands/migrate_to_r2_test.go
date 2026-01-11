package subcommands

import (
	"context"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"strings"
	"testing"

	"github.com/cho45/hanrangon/app"
	"github.com/cho45/hanrangon/internal/testutil"
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

func TestMigrator_ProcessEntries(t *testing.T) {
	dbs := testutil.SetupAllDBs(t)
	defer dbs.Close()
	db, tfidfDB, workerDB, imagesDB := dbs.Main, dbs.TFIDF, dbs.Worker, dbs.Images

	// Setup test app
	tmpDir := t.TempDir()
	config := &app.Config{
		R2PublicURL: "https://assets.lowreal.net",
		UploadDir:   tmpDir,
	}

	// Create dummy image files
	testFiles := []string{"test1.jpg", "test3.jpg"}
	for _, f := range testFiles {
		if err := os.WriteFile(filepath.Join(tmpDir, f), []byte("test"), 0644); err != nil {
			t.Fatal(err)
		}
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

	// Create mock R2 storage
	mockStorage := &mockR2Storage{
		uploadedFiles: make(map[string]bool),
	}

	// Create migrator
	migrator := &Migrator{
		app:         application,
		r2Storage:   mockStorage,
		r2PublicURL: "https://assets.lowreal.net",
		uploadDir:   tmpDir,
		opts: &MigrateToR2Options{
			DryRun: false,
		},
	}

	// Execute ProcessEntries
	ctx := context.Background()
	if err := migrator.ProcessEntries(ctx); err != nil {
		t.Fatalf("ProcessEntries failed: %v", err)
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

	// Verify files were uploaded
	if !mockStorage.uploadedFiles["test1.jpg"] {
		t.Error("test1.jpg was not uploaded")
	}
	if !mockStorage.uploadedFiles["test3.jpg"] {
		t.Error("test3.jpg was not uploaded")
	}
}

// mockR2Storage is a mock implementation of app.StorageClient for testing
type mockR2Storage struct {
	uploadedFiles map[string]bool
	uploadedData  map[string][]byte // 実際にアップロードされたデータを保存
	failOnKey     string            // このkeyでエラーを返す (エラーケーステスト用)
	failError     error             // 返すエラー
}

func (m *mockR2Storage) Upload(ctx context.Context, key string, body io.Reader, contentType string) (string, error) {
	// 入力検証
	if key == "" {
		return "", fmt.Errorf("key cannot be empty")
	}
	if body == nil {
		return "", fmt.Errorf("body cannot be nil")
	}
	if contentType == "" {
		return "", fmt.Errorf("contentType cannot be empty")
	}

	// エラー注入
	if m.failOnKey != "" && key == m.failOnKey {
		if m.failError != nil {
			return "", m.failError
		}
		return "", fmt.Errorf("simulated upload error for key: %s", key)
	}

	// bodyを実際に読み込む
	data, err := io.ReadAll(body)
	if err != nil {
		return "", fmt.Errorf("failed to read body: %w", err)
	}

	// データを保存
	if m.uploadedData == nil {
		m.uploadedData = make(map[string][]byte)
	}
	m.uploadedData[key] = data
	m.uploadedFiles[key] = true

	return fmt.Sprintf("https://assets.lowreal.net/entry/%s", key), nil
}

func TestRewriteBodyImageURLs(t *testing.T) {
	tests := []struct {
		name     string
		body     string
		expected string
	}{
		{
			name: "Hatena記法でHTMLブロック内のimg",
			body: `>|html|
<img src="/images/entry/test.jpg" alt="test">
||<`,
			expected: `>|html|
<img src="https://assets.lowreal.net/entry/test.jpg" alt="test">
||<`,
		},
		{
			name: "引用符なしのsrc属性",
			body: `>|html|
<img src=/images/entry/test.jpg>
||<`,
			expected: `>|html|
<img src=https://assets.lowreal.net/entry/test.jpg>
||<`,
		},
		{
			name: "aタグとimgタグの組み合わせ",
			body: `>|html|
<a href="/images/entry/test.jpg"><img src="/images/entry/test.jpg"></a>
||<`,
			expected: `>|html|
<a href="https://assets.lowreal.net/entry/test.jpg"><img src="https://assets.lowreal.net/entry/test.jpg"></a>
||<`,
		},
		{
			name:     "シングルクォート",
			body:     `<img src='/images/entry/test.jpg'>`,
			expected: `<img src='https://assets.lowreal.net/entry/test.jpg'>`,
		},
		{
			name:     "既に移行済み",
			body:     `<img src="https://assets.lowreal.net/entry/test.jpg">`,
			expected: `<img src="https://assets.lowreal.net/entry/test.jpg">`,
		},
		{
			name:     "外部URLは変更しない",
			body:     `<img src="https://example.com/images/entry/test.jpg">`,
			expected: `<img src="https://example.com/images/entry/test.jpg">`,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := RewriteBodyImageURLs(tt.body, "https://assets.lowreal.net")
			if result != tt.expected {
				t.Errorf("\nExpected: %q\nGot:      %q", tt.expected, result)
			}
		})
	}
}

func TestMigrator_ProcessEntries_BodyField(t *testing.T) {
	dbs := testutil.SetupAllDBs(t)
	defer dbs.Close()
	db, tfidfDB, workerDB, imagesDB := dbs.Main, dbs.TFIDF, dbs.Worker, dbs.Images

	// Setup test app
	tmpDir := t.TempDir()
	config := &app.Config{
		R2PublicURL: "https://assets.lowreal.net",
		UploadDir:   tmpDir,
	}

	// Create dummy image file
	if err := os.WriteFile(filepath.Join(tmpDir, "test.jpg"), []byte("test"), 0644); err != nil {
		t.Fatal(err)
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

	// Insert test entry with Hatena notation body
	hatenaBody := `>|html|
<img src="/images/entry/test.jpg" alt="test">
||<`

	_, err := db.Exec(`
		INSERT INTO entries (id, path, title, body, formatted_body, format, status, date, created_at, modified_at, publish_at)
		VALUES (1, '/2024/01/test', 'Test', ?, '<p><img src="/images/entry/test.jpg" alt="test"></p>', 'hatena', 'public', '2024-01-01', datetime('now'), datetime('now'), datetime('now'))
	`, hatenaBody)
	if err != nil {
		t.Fatal(err)
	}

	// Create mock R2 storage
	mockStorage := &mockR2Storage{
		uploadedFiles: make(map[string]bool),
	}

	// Create migrator
	migrator := &Migrator{
		app:         application,
		r2Storage:   mockStorage,
		r2PublicURL: "https://assets.lowreal.net",
		uploadDir:   tmpDir,
		opts: &MigrateToR2Options{
			DryRun: false,
		},
	}

	// Execute ProcessEntries
	ctx := context.Background()
	if err := migrator.ProcessEntries(ctx); err != nil {
		t.Fatalf("ProcessEntries failed: %v", err)
	}

	// Verify body field was updated
	var body, formattedBody string
	err = db.QueryRow(`SELECT body, formatted_body FROM entries WHERE id = 1`).Scan(&body, &formattedBody)
	if err != nil {
		t.Fatal(err)
	}

	expectedBody := `>|html|
<img src="https://assets.lowreal.net/entry/test.jpg" alt="test">
||<`

	if body != expectedBody {
		t.Errorf("body field was not rewritten correctly:\nExpected: %q\nGot:      %q", expectedBody, body)
	}

	if !strings.Contains(formattedBody, "https://assets.lowreal.net/entry/test.jpg") {
		t.Errorf("formatted_body was not rewritten correctly: %s", formattedBody)
	}

	// Verify no /images/entry/ remains in either field
	if strings.Contains(body, "/images/entry/") {
		t.Errorf("body still contains /images/entry/: %s", body)
	}
	if strings.Contains(formattedBody, "/images/entry/") {
		t.Errorf("formatted_body still contains /images/entry/: %s", formattedBody)
	}
}

func TestMigrator_UpdateImageURIs(t *testing.T) {
	dbs := testutil.SetupAllDBs(t)
	defer dbs.Close()
	db, tfidfDB, workerDB, imagesDB := dbs.Main, dbs.TFIDF, dbs.Worker, dbs.Images

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
	dbs := testutil.SetupAllDBs(t)
	defer dbs.Close()
	db, tfidfDB, workerDB, imagesDB := dbs.Main, dbs.TFIDF, dbs.Worker, dbs.Images

	// Setup test app
	tmpDir := t.TempDir()
	config := &app.Config{
		R2PublicURL: "https://assets.lowreal.net",
		UploadDir:   tmpDir,
	}

	// Create dummy image file
	if err := os.WriteFile(filepath.Join(tmpDir, "test.jpg"), []byte("test"), 0644); err != nil {
		t.Fatal(err)
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

	// Create mock R2 storage
	mockStorage := &mockR2Storage{
		uploadedFiles: make(map[string]bool),
	}

	// Create migrator
	migrator := &Migrator{
		app:         application,
		r2Storage:   mockStorage,
		r2PublicURL: "https://assets.lowreal.net",
		uploadDir:   tmpDir,
		opts: &MigrateToR2Options{
			DryRun: false,
		},
	}

	ctx := context.Background()

	// First run
	if err := migrator.ProcessEntries(ctx); err != nil {
		t.Fatalf("First ProcessEntries failed: %v", err)
	}

	var formattedBody1 string
	err = db.QueryRow(`SELECT formatted_body FROM entries WHERE id = 1`).Scan(&formattedBody1)
	if err != nil {
		t.Fatal(err)
	}

	// Verify upload happened
	uploadCount1 := len(mockStorage.uploadedFiles)
	if uploadCount1 != 1 {
		t.Errorf("Expected 1 upload after first run, got %d", uploadCount1)
	}
	if !mockStorage.uploadedFiles["test.jpg"] {
		t.Error("test.jpg was not uploaded in first run")
	}

	// Second run (should be idempotent)
	if err := migrator.ProcessEntries(ctx); err != nil {
		t.Fatalf("Second ProcessEntries failed: %v", err)
	}

	var formattedBody2 string
	err = db.QueryRow(`SELECT formatted_body FROM entries WHERE id = 1`).Scan(&formattedBody2)
	if err != nil {
		t.Fatal(err)
	}

	// Verify no duplicate uploads
	uploadCount2 := len(mockStorage.uploadedFiles)
	if uploadCount2 != uploadCount1 {
		t.Errorf("Upload count changed from %d to %d (duplicate upload detected)", uploadCount1, uploadCount2)
	}

	// Third run (should still be idempotent)
	if err := migrator.ProcessEntries(ctx); err != nil {
		t.Fatalf("Third ProcessEntries failed: %v", err)
	}

	var formattedBody3 string
	err = db.QueryRow(`SELECT formatted_body FROM entries WHERE id = 1`).Scan(&formattedBody3)
	if err != nil {
		t.Fatal(err)
	}

	// Verify idempotency across all runs
	if formattedBody1 != formattedBody2 {
		t.Errorf("ProcessEntries is not idempotent (run 1 vs 2):\nFirst:  %s\nSecond: %s", formattedBody1, formattedBody2)
	}
	if formattedBody2 != formattedBody3 {
		t.Errorf("ProcessEntries is not idempotent (run 2 vs 3):\nSecond: %s\nThird:  %s", formattedBody2, formattedBody3)
	}

	// Verify no duplicate uploads after third run
	uploadCount3 := len(mockStorage.uploadedFiles)
	if uploadCount3 != uploadCount1 {
		t.Errorf("Upload count changed from %d to %d after 3 runs (duplicate upload detected)", uploadCount1, uploadCount3)
	}

	// Verify no double rewriting occurred
	if strings.Contains(formattedBody3, "https://assets.lowreal.net/entry/https://assets.lowreal.net") {
		t.Errorf("Double rewriting detected: %s", formattedBody3)
	}
}

// TestMigrator_ProcessEntries_UploadError tests error handling during upload
func TestMigrator_ProcessEntries_UploadError(t *testing.T) {
	dbs := testutil.SetupAllDBs(t)
	defer dbs.Close()
	db, tfidfDB, workerDB, imagesDB := dbs.Main, dbs.TFIDF, dbs.Worker, dbs.Images

	// Setup test app
	tmpDir := t.TempDir()
	config := &app.Config{
		R2PublicURL: "https://assets.lowreal.net",
		UploadDir:   tmpDir,
	}

	// Create dummy image files
	if err := os.WriteFile(filepath.Join(tmpDir, "test1.jpg"), []byte("test1"), 0644); err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(filepath.Join(tmpDir, "test2.jpg"), []byte("test2"), 0644); err != nil {
		t.Fatal(err)
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
			(1, '/2024/01/test1', 'Test1', 'body', '<p><img src="/images/entry/test1.jpg"></p>', 'html', 'public', '2024-01-01', datetime('now'), datetime('now'), datetime('now')),
			(2, '/2024/01/test2', 'Test2', 'body', '<p><img src="/images/entry/test2.jpg"></p>', 'html', 'public', '2024-01-01', datetime('now'), datetime('now'), datetime('now'))
	`)
	if err != nil {
		t.Fatal(err)
	}

	// Create mock R2 storage that fails on test1.jpg
	mockStorage := &mockR2Storage{
		uploadedFiles: make(map[string]bool),
		failOnKey:     "test1.jpg",
		failError:     fmt.Errorf("simulated R2 error"),
	}

	// Create migrator
	migrator := &Migrator{
		app:         application,
		r2Storage:   mockStorage,
		r2PublicURL: "https://assets.lowreal.net",
		uploadDir:   tmpDir,
		opts: &MigrateToR2Options{
			DryRun: false,
		},
	}

	// Execute ProcessEntries (should not fail completely, but continue with other entries)
	ctx := context.Background()
	err = migrator.ProcessEntries(ctx)
	// エラーは返されるが、処理は継続される
	if err != nil {
		t.Logf("ProcessEntries returned error (expected): %v", err)
	}

	// Verify entry 1 was NOT updated (upload failed)
	var formattedBody1 string
	err = db.QueryRow(`SELECT formatted_body FROM entries WHERE id = 1`).Scan(&formattedBody1)
	if err != nil {
		t.Fatal(err)
	}
	if !strings.Contains(formattedBody1, "/images/entry/test1.jpg") {
		t.Errorf("Entry 1 should not be rewritten when upload fails, but was: %s", formattedBody1)
	}

	// Verify test1.jpg was NOT uploaded
	if mockStorage.uploadedFiles["test1.jpg"] {
		t.Error("test1.jpg should not have been uploaded (error injection)")
	}

	// Verify entry 2 was updated (should continue after error)
	var formattedBody2 string
	err = db.QueryRow(`SELECT formatted_body FROM entries WHERE id = 2`).Scan(&formattedBody2)
	if err != nil {
		t.Fatal(err)
	}
	if !strings.Contains(formattedBody2, "https://assets.lowreal.net/entry/test2.jpg") {
		t.Errorf("Entry 2 should be rewritten even if entry 1 failed: %s", formattedBody2)
	}

	// Verify test2.jpg was uploaded
	if !mockStorage.uploadedFiles["test2.jpg"] {
		t.Error("test2.jpg should have been uploaded")
	}
}

// TestMigrator_ExtractImageFiles tests the extractImageFiles method with boundary conditions
func TestMigrator_ExtractImageFiles(t *testing.T) {
	migrator := &Migrator{}

	tests := []struct {
		name          string
		body          string
		formattedBody string
		expected      []string
	}{
		{
			name:          "Basic image extraction",
			body:          `<img src="/images/entry/test.jpg">`,
			formattedBody: ``,
			expected:      []string{"test.jpg"},
		},
		{
			name:          "Multiple images",
			body:          `<img src="/images/entry/img1.jpg"><img src="/images/entry/img2.png">`,
			formattedBody: ``,
			expected:      []string{"img1.jpg", "img2.png"},
		},
		{
			name:          "Deduplication between body and formatted_body",
			body:          `<img src="/images/entry/test.jpg">`,
			formattedBody: `<img src="/images/entry/test.jpg">`,
			expected:      []string{"test.jpg"},
		},
		{
			name:          "Image with subdirectory",
			body:          `<img src="/images/entry/2024/01/test.jpg">`,
			formattedBody: ``,
			expected:      []string{"2024/01/test.jpg"},
		},
		{
			name:          "Single quotes",
			body:          `<img src='/images/entry/test.jpg'>`,
			formattedBody: ``,
			expected:      []string{"test.jpg"},
		},
		{
			name:          "No quotes",
			body:          `<img src=/images/entry/test.jpg>`,
			formattedBody: ``,
			expected:      []string{"test.jpg"},
		},
		{
			name:          "href in anchor tag",
			body:          `<a href="/images/entry/test.jpg">`,
			formattedBody: ``,
			expected:      []string{"test.jpg"},
		},
		{
			name:          "External URL should not be extracted",
			body:          `<img src="https://example.com/test.jpg">`,
			formattedBody: ``,
			expected:      []string{},
		},
		{
			name:          "Mixed local and external",
			body:          `<img src="/images/entry/local.jpg"><img src="https://example.com/external.jpg">`,
			formattedBody: ``,
			expected:      []string{"local.jpg"},
		},
		{
			name:          "HTML comment should not be extracted",
			body:          `<!-- <img src="/images/entry/commented.jpg"> -->`,
			formattedBody: ``,
			expected:      []string{}, // HTMLコメント内の画像は抽出しない
		},
		{
			name:          "CDATA section",
			body:          `<![CDATA[<img src="/images/entry/cdata.jpg">]]>`,
			formattedBody: ``,
			expected:      []string{}, // CDATAセクション内の画像は抽出しない
		},
		{
			name:          "Image with space in path",
			body:          `<img src="/images/entry/test image.jpg">`,
			formattedBody: ``,
			expected:      []string{"test image.jpg"},
		},
		{
			name:          "Image with query parameters",
			body:          `<img src="/images/entry/test.jpg?v=1">`,
			formattedBody: ``,
			expected:      []string{"test.jpg?v=1"},
		},
		{
			name:          "Japanese filename",
			body:          `<img src="/images/entry/テスト.jpg">`,
			formattedBody: ``,
			expected:      []string{"テスト.jpg"},
		},
		{
			name:          "Multiple dots in filename",
			body:          `<img src="/images/entry/test.backup.jpg">`,
			formattedBody: ``,
			expected:      []string{"test.backup.jpg"},
		},
		{
			name:          "Empty result",
			body:          `<p>No images here</p>`,
			formattedBody: ``,
			expected:      []string{},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := migrator.extractImageFiles(tt.body, tt.formattedBody)

			// 結果を検証
			if len(result) != len(tt.expected) {
				t.Errorf("extractImageFiles() returned %d files, expected %d\nGot: %v\nExpected: %v",
					len(result), len(tt.expected), result, tt.expected)
				return
			}

			// すべての期待値が結果に含まれているか確認
			expectedMap := make(map[string]bool)
			for _, exp := range tt.expected {
				expectedMap[exp] = true
			}

			for _, res := range result {
				if !expectedMap[res] {
					t.Errorf("extractImageFiles() returned unexpected file %q", res)
				}
			}

			// すべての結果が期待値に含まれているか確認
			resultMap := make(map[string]bool)
			for _, res := range result {
				resultMap[res] = true
			}

			for _, exp := range tt.expected {
				if !resultMap[exp] {
					t.Errorf("extractImageFiles() did not return expected file %q", exp)
				}
			}
		})
	}
}

// TestMigrator_RemoveCommentsAndCDATA tests the removeCommentsAndCDATA helper method
func TestMigrator_RemoveCommentsAndCDATA(t *testing.T) {
	migrator := &Migrator{}

	tests := []struct {
		name     string
		input    string
		expected string
	}{
		{
			name:     "Simple HTML comment",
			input:    `<div><!-- comment --></div>`,
			expected: `<div></div>`,
		},
		{
			name:     "Multi-line HTML comment",
			input:    `<div><!-- multi\nline\ncomment --></div>`,
			expected: `<div></div>`,
		},
		{
			name:     "Multiple HTML comments",
			input:    `<!-- first --><div><!-- second --></div><!-- third -->`,
			expected: `<div></div>`,
		},
		{
			name:     "HTML comment with special chars",
			input:    `<!-- <img src="/images/entry/test.jpg"> & < > " -->`,
			expected: ``,
		},
		{
			name:     "Simple CDATA section",
			input:    `<![CDATA[data]]>`,
			expected: ``,
		},
		{
			name:     "Multi-line CDATA section",
			input:    `<![CDATA[multi\nline\ndata]]>`,
			expected: ``,
		},
		{
			name:     "CDATA with HTML-like content",
			input:    `<![CDATA[<img src="/images/entry/test.jpg">]]>`,
			expected: ``,
		},
		{
			name:     "Multiple CDATA sections",
			input:    `<![CDATA[first]]><div><![CDATA[second]]></div>`,
			expected: `<div></div>`,
		},
		{
			name:     "Mixed comments and CDATA",
			input:    `<!-- comment --><![CDATA[data]]><div>content</div>`,
			expected: `<div>content</div>`,
		},
		{
			name:     "Nested-like structures",
			input:    `<!-- <!-- nested? --> -->`,
			expected: ` -->`,
		},
		{
			name:     "Empty input",
			input:    ``,
			expected: ``,
		},
		{
			name:     "No comments or CDATA",
			input:    `<div><img src="/images/entry/test.jpg"></div>`,
			expected: `<div><img src="/images/entry/test.jpg"></div>`,
		},
		{
			name:     "Comment at the end",
			input:    `<div>text</div><!-- end comment -->`,
			expected: `<div>text</div>`,
		},
		{
			name:     "CDATA at the beginning",
			input:    `<![CDATA[start]]><div>text</div>`,
			expected: `<div>text</div>`,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := migrator.removeCommentsAndCDATA(tt.input)
			if result != tt.expected {
				t.Errorf("removeCommentsAndCDATA() = %q, expected %q", result, tt.expected)
			}
		})
	}
}

// TestMigrator_ProcessEntriesWithLimit tests that the --limit flag correctly limits the number of entries processed
func TestMigrator_ProcessEntriesWithLimit(t *testing.T) {
	dbs := testutil.SetupAllDBs(t)
	defer dbs.Close()
	db, tfidfDB, workerDB, imagesDB := dbs.Main, dbs.TFIDF, dbs.Worker, dbs.Images

	// Setup test app
	tmpDir := t.TempDir()
	config := &app.Config{
		R2PublicURL: "https://assets.lowreal.net",
		UploadDir:   tmpDir,
		BaseURL:     "http://localhost:5555",
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

	// Insert 20 test entries with images
	for i := 1; i <= 20; i++ {
		// Create dummy image files for first 10 entries
		if i <= 10 {
			if err := os.WriteFile(filepath.Join(tmpDir, fmt.Sprintf("test-%d.jpg", i)), []byte("test"), 0644); err != nil {
				t.Fatal(err)
			}
		}

		_, err := db.Exec(`
			INSERT INTO entries (id, path, title, body, formatted_body, format, status, date, created_at, modified_at, publish_at)
			VALUES (?, ?, ?, ?, ?, 'html', 'public', '2024-01-01', datetime('now'), datetime('now'), datetime('now'))
		`, i, fmt.Sprintf("/2024/01/entry-%d", i), fmt.Sprintf("Entry %d", i), "", fmt.Sprintf(`<p><img src="/images/entry/test-%d.jpg"></p>`, i))
		if err != nil {
			t.Fatal(err)
		}
	}

	// Create mock storage
	mockStorage := &mockR2Storage{
		uploadedFiles: make(map[string]bool),
		uploadedData:  make(map[string][]byte),
	}

	// Create migrator with limit=5
	migrator := &Migrator{
		app:         application,
		r2Storage:   mockStorage,
		r2PublicURL: "https://assets.lowreal.net",
		uploadDir:   tmpDir,
		opts: &MigrateToR2Options{
			DryRun: false,
			Limit:  5, // Only process first 5 entries
		},
	}

	// Execute ProcessEntries with limit
	ctx := context.Background()
	if err := migrator.ProcessEntries(ctx); err != nil {
		t.Fatalf("ProcessEntries failed: %v", err)
	}

	// Verify that exactly 5 entries were processed (IDs 1-5)
	for i := 1; i <= 5; i++ {
		var formattedBody string
		err := db.QueryRow(`SELECT formatted_body FROM entries WHERE id = ?`, i).Scan(&formattedBody)
		if err != nil {
			t.Fatal(err)
		}
		// Should be migrated (contains assets.lowreal.net)
		if !strings.Contains(formattedBody, "assets.lowreal.net") {
			t.Errorf("Entry %d should have been migrated, got: %s", i, formattedBody)
		}
		// Should NOT contain /images/entry/ anymore
		if strings.Contains(formattedBody, "/images/entry/") {
			t.Errorf("Entry %d should not contain /images/entry/, got: %s", i, formattedBody)
		}
	}

	// Verify that entries 6-20 were NOT processed (still contain /images/entry/)
	for i := 6; i <= 20; i++ {
		var formattedBody string
		err := db.QueryRow(`SELECT formatted_body FROM entries WHERE id = ?`, i).Scan(&formattedBody)
		if err != nil {
			t.Fatal(err)
		}
		// Should NOT be migrated (still contains /images/entry/)
		if !strings.Contains(formattedBody, "/images/entry/") {
			t.Errorf("Entry %d should NOT have been migrated, got: %s", i, formattedBody)
		}
		// Should NOT contain assets.lowreal.net
		if strings.Contains(formattedBody, "assets.lowreal.net") {
			t.Errorf("Entry %d should not be migrated yet, got: %s", i, formattedBody)
		}
	}

	// Verify exactly 5 files were uploaded
	if len(mockStorage.uploadedFiles) != 5 {
		t.Errorf("Expected 5 files to be uploaded, got %d: %v", len(mockStorage.uploadedFiles), mockStorage.uploadedFiles)
	}

	// Verify the correct files were uploaded (test-1.jpg through test-5.jpg)
	for i := 1; i <= 5; i++ {
		filename := fmt.Sprintf("test-%d.jpg", i)
		if !mockStorage.uploadedFiles[filename] {
			t.Errorf("Expected %s to be uploaded", filename)
		}
	}

	// Verify files 6-10 were NOT uploaded
	for i := 6; i <= 10; i++ {
		filename := fmt.Sprintf("test-%d.jpg", i)
		if mockStorage.uploadedFiles[filename] {
			t.Errorf("File %s should NOT have been uploaded (beyond limit)", filename)
		}
	}
}

// TestMigrator_ProcessEntries_DryRun tests that dry-run mode doesn't make any actual changes
func TestMigrator_ProcessEntries_DryRun(t *testing.T) {
	dbs := testutil.SetupAllDBs(t)
	defer dbs.Close()
	db, tfidfDB, workerDB, imagesDB := dbs.Main, dbs.TFIDF, dbs.Worker, dbs.Images

	// Setup test app
	tmpDir := t.TempDir()
	config := &app.Config{
		BaseURL:      "http://localhost:5555",
		UploadDir:    tmpDir,
		R2PublicURL:  "https://assets.lowreal.net",
		R2BucketName: "test-bucket",
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

	// Create test files
	for i := 1; i <= 3; i++ {
		filename := fmt.Sprintf("test-%d.jpg", i)
		filepath := filepath.Join(tmpDir, filename)
		if err := os.WriteFile(filepath, []byte("test image data"), 0644); err != nil {
			t.Fatal(err)
		}

		// Insert test entry
		_, err := db.Exec(`
			INSERT INTO entries (id, path, title, body, formatted_body, format, status, date, created_at, modified_at, publish_at)
			VALUES (?, ?, ?, ?, ?, 'html', 'public', '2024-01-01', datetime('now'), datetime('now'), datetime('now'))
		`, i, fmt.Sprintf("/2024/01/entry-%d", i), fmt.Sprintf("Entry %d", i), "", fmt.Sprintf(`<p><img src="/images/entry/test-%d.jpg"></p>`, i))
		if err != nil {
			t.Fatal(err)
		}
	}

	// Store original formatted_body values
	originalBodies := make(map[int]string)
	for i := 1; i <= 3; i++ {
		var body string
		err := db.QueryRow(`SELECT formatted_body FROM entries WHERE id = ?`, i).Scan(&body)
		if err != nil {
			t.Fatal(err)
		}
		originalBodies[i] = body
	}

	// Create mock storage
	mockStorage := &mockR2Storage{
		uploadedFiles: make(map[string]bool),
	}

	// Create migrator with DryRun=true
	migrator := &Migrator{
		app:         application,
		uploadDir:   tmpDir,
		r2PublicURL: config.R2PublicURL,
		r2Storage:   mockStorage,
		opts: &MigrateToR2Options{
			DryRun: true, // DRY RUN MODE
			Limit:  0,
		},
	}

	// Process entries in dry-run mode
	ctx := context.Background()
	err := migrator.ProcessEntries(ctx)
	if err != nil {
		t.Fatalf("ProcessEntries failed: %v", err)
	}

	// Verify NO files were uploaded
	if len(mockStorage.uploadedFiles) != 0 {
		t.Errorf("Expected 0 files to be uploaded in dry-run mode, got %d: %v", len(mockStorage.uploadedFiles), mockStorage.uploadedFiles)
	}

	// Verify database was NOT modified
	for i := 1; i <= 3; i++ {
		var body string
		err := db.QueryRow(`SELECT formatted_body FROM entries WHERE id = ?`, i).Scan(&body)
		if err != nil {
			t.Fatal(err)
		}
		if body != originalBodies[i] {
			t.Errorf("Entry %d formatted_body should not be modified in dry-run mode.\nExpected: %s\nGot: %s", i, originalBodies[i], body)
		}
		// Should still contain /images/entry/
		if !strings.Contains(body, "/images/entry/") {
			t.Errorf("Entry %d should still contain /images/entry/ in dry-run mode, got: %s", i, body)
		}
	}

	// Verify local files still exist
	for i := 1; i <= 3; i++ {
		filename := fmt.Sprintf("test-%d.jpg", i)
		filepath := filepath.Join(tmpDir, filename)
		if _, err := os.Stat(filepath); os.IsNotExist(err) {
			t.Errorf("File %s should still exist in dry-run mode", filename)
		}
	}
}

// TestMigrator_ProcessEntriesWithEntryID tests that --entry-id processes only the specified entry
func TestMigrator_ProcessEntriesWithEntryID(t *testing.T) {
	dbs := testutil.SetupAllDBs(t)
	defer dbs.Close()
	db, tfidfDB, workerDB, imagesDB := dbs.Main, dbs.TFIDF, dbs.Worker, dbs.Images

	// Setup test app
	tmpDir := t.TempDir()
	config := &app.Config{
		R2PublicURL: "https://assets.lowreal.net",
		UploadDir:   tmpDir,
		BaseURL:     "http://localhost:5555",
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

	// Insert 5 test entries with images
	for i := 1; i <= 5; i++ {
		// Create dummy image files
		if err := os.WriteFile(filepath.Join(tmpDir, fmt.Sprintf("test-%d.jpg", i)), []byte("test"), 0644); err != nil {
			t.Fatal(err)
		}

		_, err := db.Exec(`
			INSERT INTO entries (id, path, title, body, formatted_body, format, status, date, created_at, modified_at, publish_at)
			VALUES (?, ?, ?, ?, ?, 'html', 'public', '2024-01-01', datetime('now'), datetime('now'), datetime('now'))
		`, i, fmt.Sprintf("/2024/01/entry-%d", i), fmt.Sprintf("Entry %d", i), "", fmt.Sprintf(`<p><img src="/images/entry/test-%d.jpg"></p>`, i))
		if err != nil {
			t.Fatal(err)
		}
	}

	// Create mock storage
	mockStorage := &mockR2Storage{
		uploadedFiles: make(map[string]bool),
		uploadedData:  make(map[string][]byte),
	}

	// Create migrator with entry-id=3
	migrator := &Migrator{
		app:         application,
		r2Storage:   mockStorage,
		r2PublicURL: "https://assets.lowreal.net",
		uploadDir:   tmpDir,
		opts: &MigrateToR2Options{
			DryRun:  false,
			EntryID: 3, // Only process entry ID 3
		},
	}

	// Execute ProcessEntries with entry-id
	ctx := context.Background()
	if err := migrator.ProcessEntries(ctx); err != nil {
		t.Fatalf("ProcessEntries failed: %v", err)
	}

	// Verify that only entry 3 was processed
	for i := 1; i <= 5; i++ {
		var formattedBody string
		err := db.QueryRow(`SELECT formatted_body FROM entries WHERE id = ?`, i).Scan(&formattedBody)
		if err != nil {
			t.Fatal(err)
		}

		if i == 3 {
			// Entry 3 should be migrated
			if !strings.Contains(formattedBody, "assets.lowreal.net") {
				t.Errorf("Entry 3 should have been migrated, got: %s", formattedBody)
			}
			if strings.Contains(formattedBody, "/images/entry/") {
				t.Errorf("Entry 3 should not contain /images/entry/, got: %s", formattedBody)
			}
		} else {
			// Other entries should NOT be migrated
			if !strings.Contains(formattedBody, "/images/entry/") {
				t.Errorf("Entry %d should NOT have been migrated, got: %s", i, formattedBody)
			}
			if strings.Contains(formattedBody, "assets.lowreal.net") {
				t.Errorf("Entry %d should not be migrated, got: %s", i, formattedBody)
			}
		}
	}

	// Verify exactly 1 file was uploaded (test-3.jpg)
	if len(mockStorage.uploadedFiles) != 1 {
		t.Errorf("Expected 1 file to be uploaded, got %d: %v", len(mockStorage.uploadedFiles), mockStorage.uploadedFiles)
	}

	if !mockStorage.uploadedFiles["test-3.jpg"] {
		t.Error("Expected test-3.jpg to be uploaded")
	}
}

// TestMigrator_UpdateImageURIs_DryRun tests that UpdateImageURIs dry-run mode doesn't modify the database
func TestMigrator_UpdateImageURIs_DryRun(t *testing.T) {
	dbs := testutil.SetupAllDBs(t)
	defer dbs.Close()
	db, tfidfDB, workerDB, imagesDB := dbs.Main, dbs.TFIDF, dbs.Worker, dbs.Images

	// Setup test app
	config := &app.Config{
		R2PublicURL:  "https://assets.lowreal.net",
		R2BucketName: "test-bucket",
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

	// Insert test entries with local image references
	_, err := db.Exec(`
		INSERT INTO entries (id, path, title, body, formatted_body, format, status, date, created_at, modified_at, publish_at)
		VALUES (1, '/2024/01/test1', 'Test 1', '', '<p><img src="/images/entry/test1.jpg"></p>', 'html', 'public', '2024-01-01', datetime('now'), datetime('now'), datetime('now'))
	`)
	if err != nil {
		t.Fatal(err)
	}

	// Store original formatted_body
	var originalBody string
	err = db.QueryRow(`SELECT formatted_body FROM entries WHERE id = 1`).Scan(&originalBody)
	if err != nil {
		t.Fatal(err)
	}

	// Create migrator with DryRun=true
	migrator := &Migrator{
		app:         application,
		r2PublicURL: config.R2PublicURL,
		opts: &MigrateToR2Options{
			DryRun: true, // DRY RUN MODE
		},
	}

	// Run UpdateImageURIs in dry-run mode
	ctx := context.Background()
	err = migrator.UpdateImageURIs(ctx)
	if err != nil {
		t.Fatalf("UpdateImageURIs failed: %v", err)
	}

	// Verify database was NOT modified
	var currentBody string
	err = db.QueryRow(`SELECT formatted_body FROM entries WHERE id = 1`).Scan(&currentBody)
	if err != nil {
		t.Fatal(err)
	}

	if currentBody != originalBody {
		t.Errorf("formatted_body should not be modified in dry-run mode.\nExpected: %s\nGot: %s", originalBody, currentBody)
	}

	// Should still contain local path
	if !strings.Contains(currentBody, "/images/entry/") {
		t.Errorf("Entry should still contain /images/entry/ in dry-run mode, got: %s", currentBody)
	}

	// Should NOT contain R2 URL
	if strings.Contains(currentBody, "assets.lowreal.net") {
		t.Errorf("Entry should not contain R2 URL in dry-run mode, got: %s", currentBody)
	}
}
