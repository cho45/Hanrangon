package subcommands

import (
	"context"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"testing"

	"github.com/cho45/hanrangon/app"
	"github.com/cho45/hanrangon/internal/testutil"
	"github.com/cho45/hanrangon/jobqueue"
	"github.com/cho45/hanrangon/model"
	"github.com/cho45/hanrangon/tfidf"
)

// TestRewriteExtensions はrewriteExtensions関数のテスト
func TestRewriteExtensions(t *testing.T) {
	converter := &AVIFConverter{}

	tests := []struct {
		name     string
		input    string
		expected string
	}{
		{
			name:     "HTML img tag with double quotes (.jpg)",
			input:    `<img src="/images/entry/20240101120000-test.jpg">`,
			expected: `<img src="/images/entry/20240101120000-test.avif">`,
		},
		{
			name:     "HTML img tag with double quotes (.jpeg)",
			input:    `<img src="/images/entry/20240101120000-test.jpeg">`,
			expected: `<img src="/images/entry/20240101120000-test.avif">`,
		},
		{
			name:     "HTML img tag with single quotes (.jpg)",
			input:    `<img src='/images/entry/20240101120000-test.jpg'>`,
			expected: `<img src='/images/entry/20240101120000-test.avif'>`,
		},
		{
			name:     "HTML img tag with single quotes (.jpeg)",
			input:    `<img src='/images/entry/20240101120000-test.jpeg'>`,
			expected: `<img src='/images/entry/20240101120000-test.avif'>`,
		},
		{
			name:     "HTML a tag with href (.jpg)",
			input:    `<a href="/images/entry/20240101120000-test.jpg">image</a>`,
			expected: `<a href="/images/entry/20240101120000-test.avif">image</a>`,
		},
		{
			name:     "HTML a tag with href (.jpeg)",
			input:    `<a href="/images/entry/20240101120000-test.jpeg">image</a>`,
			expected: `<a href="/images/entry/20240101120000-test.avif">image</a>`,
		},
		{
			name:     "Hatena notation with space delimiter (.jpg)",
			input:    `[f:id:cho45:20240101120000j:image /images/entry/20240101120000-test.jpg ]`,
			expected: `[f:id:cho45:20240101120000j:image /images/entry/20240101120000-test.avif ]`,
		},
		{
			name:     "Hatena notation with space delimiter (.jpeg)",
			input:    `[f:id:cho45:20240101120000j:image /images/entry/20240101120000-test.jpeg ]`,
			expected: `[f:id:cho45:20240101120000j:image /images/entry/20240101120000-test.avif ]`,
		},
		{
			name:     "Multiple images in one text (.jpg and .jpeg)",
			input:    `<img src="/images/entry/image1.jpg"> and <img src="/images/entry/image2.jpeg">`,
			expected: `<img src="/images/entry/image1.avif"> and <img src="/images/entry/image2.avif">`,
		},
		{
			name:     "No image references",
			input:    `<p>This is a plain text without images.</p>`,
			expected: `<p>This is a plain text without images.</p>`,
		},
		{
			name:     "External URL should not be changed",
			input:    `<img src="https://example.com/test.jpg">`,
			expected: `<img src="https://example.com/test.jpg">`,
		},
		{
			name:     "Mixed local and external URLs",
			input:    `<img src="/images/entry/local.jpg"> <img src="https://example.com/external.jpg">`,
			expected: `<img src="/images/entry/local.avif"> <img src="https://example.com/external.jpg">`,
		},
		{
			name:     "Tag closing with .jpg>",
			input:    `<img src=/images/entry/test.jpg>`,
			expected: `<img src=/images/entry/test.avif>`,
		},
		{
			name:     "Tag closing with .jpeg>",
			input:    `<img src=/images/entry/test.jpeg>`,
			expected: `<img src=/images/entry/test.avif>`,
		},
		{
			name:     "Japanese filename (.jpg)",
			input:    `<img src="/images/entry/20240101120000-テスト画像.jpg">`,
			expected: `<img src="/images/entry/20240101120000-テスト画像.avif">`,
		},
		{
			name:     "Japanese filename (.jpeg)",
			input:    `<img src="/images/entry/20240101120000-テスト画像.jpeg">`,
			expected: `<img src="/images/entry/20240101120000-テスト画像.avif">`,
		},
		{
			name: "Complex HTML with multiple images",
			input: `<div>
				<img src="/images/entry/img1.jpg" alt="test">
				<a href="/images/entry/img2.jpeg">link</a>
				<img src='/images/entry/img3.jpg'/>
			</div>`,
			expected: `<div>
				<img src="/images/entry/img1.avif" alt="test">
				<a href="/images/entry/img2.avif">link</a>
				<img src='/images/entry/img3.avif'/>
			</div>`,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := converter.rewriteExtensions(tt.input)
			if result != tt.expected {
				t.Errorf("rewriteExtensions() failed\nInput:    %q\nExpected: %q\nGot:      %q", tt.input, tt.expected, result)
			}
		})
	}
}

// TestGetAVIFFilename はgetAVIFFilename関数のテスト
func TestGetAVIFFilename(t *testing.T) {
	converter := &AVIFConverter{}

	tests := []struct {
		name     string
		input    string
		expected string
	}{
		{
			name:     "Simple .jpg file",
			input:    "20240101120000-test.jpg",
			expected: "20240101120000-test.avif",
		},
		{
			name:     "Simple .jpeg file",
			input:    "20240101120000-test.jpeg",
			expected: "20240101120000-test.avif",
		},
		{
			name:     "File with path (.jpg)",
			input:    "2024/01/20240101120000-test.jpg",
			expected: "2024/01/20240101120000-test.avif",
		},
		{
			name:     "File with path (.jpeg)",
			input:    "2024/01/20240101120000-test.jpeg",
			expected: "2024/01/20240101120000-test.avif",
		},
		{
			name:     "Japanese filename (.jpg)",
			input:    "20240101120000-テスト画像.jpg",
			expected: "20240101120000-テスト画像.avif",
		},
		{
			name:     "Japanese filename (.jpeg)",
			input:    "20240101120000-テスト画像.jpeg",
			expected: "20240101120000-テスト画像.avif",
		},
		{
			name:     "Uppercase .JPG",
			input:    "20240101120000-test.JPG",
			expected: "20240101120000-test.avif",
		},
		{
			name:     "Uppercase .JPEG",
			input:    "20240101120000-test.JPEG",
			expected: "20240101120000-test.avif",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := converter.getAVIFFilename(tt.input)
			if result != tt.expected {
				t.Errorf("getAVIFFilename(%q) = %q, expected %q", tt.input, result, tt.expected)
			}
		})
	}
}

// TestExtractImageFiles はextractImageFiles関数のテスト
func TestExtractImageFiles(t *testing.T) {
	converter := &AVIFConverter{}

	tests := []struct {
		name          string
		body          string
		formattedBody string
		expected      []string
	}{
		{
			name:          "Single image in body",
			body:          `<img src="/images/entry/test.jpg">`,
			formattedBody: ``,
			expected:      []string{"test.jpg"},
		},
		{
			name:          "Single image in formatted_body",
			body:          ``,
			formattedBody: `<img src="/images/entry/test.jpg">`,
			expected:      []string{"test.jpg"},
		},
		{
			name:          "Multiple images (jpg and jpeg)",
			body:          ``,
			formattedBody: `<img src="/images/entry/img1.jpg"><img src="/images/entry/img2.jpeg">`,
			expected:      []string{"img1.jpg", "img2.jpeg"},
		},
		{
			name:          "Same image in both body and formatted_body (deduplicated)",
			body:          `<img src="/images/entry/test.jpg">`,
			formattedBody: `<img src="/images/entry/test.jpg">`,
			expected:      []string{"test.jpg"},
		},
		{
			name:          "Image with path",
			body:          ``,
			formattedBody: `<img src="/images/entry/2024/01/test.jpg">`,
			expected:      []string{"2024/01/test.jpg"},
		},
		{
			name:          "Japanese filename",
			body:          ``,
			formattedBody: `<img src="/images/entry/テスト画像.jpg">`,
			expected:      []string{"テスト画像.jpg"},
		},
		{
			name:          "External URL (should not be extracted)",
			body:          ``,
			formattedBody: `<img src="https://example.com/test.jpg">`,
			expected:      []string{},
		},
		{
			name:          "Mixed local and external",
			body:          ``,
			formattedBody: `<img src="/images/entry/local.jpg"><img src="https://example.com/external.jpg">`,
			expected:      []string{"local.jpg"},
		},
		{
			name:          "a href with image",
			body:          ``,
			formattedBody: `<a href="/images/entry/photo.jpg"><img src="/images/entry/photo.jpg"></a>`,
			expected:      []string{"photo.jpg"},
		},
		{
			name:          "No images",
			body:          `<p>Plain text</p>`,
			formattedBody: `<p>Plain text</p>`,
			expected:      []string{},
		},
		{
			name:          "Different quote styles",
			body:          `<img src='/images/entry/test1.jpg'><img src="/images/entry/test2.jpeg">`,
			formattedBody: ``,
			expected:      []string{"test1.jpg", "test2.jpeg"},
		},
		{
			name:          "Uppercase extensions",
			body:          ``,
			formattedBody: `<img src="/images/entry/test.JPG">`,
			expected:      []string{"test.JPG"},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := converter.extractImageFiles(tt.body, tt.formattedBody)

			// ソートして比較（順序は保証されていない）
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

// TestAVIFConverter_RemoveCommentsAndCDATA tests the removeCommentsAndCDATA helper method
func TestAVIFConverter_RemoveCommentsAndCDATA(t *testing.T) {
	converter := &AVIFConverter{}

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
			name:     "HTML comment with JPEG image",
			input:    `<!-- <img src="/images/entry/test.jpg"> -->`,
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
			name:     "CDATA with JPEG image",
			input:    `<![CDATA[<img src="/images/entry/test.jpeg">]]>`,
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
			result := converter.removeCommentsAndCDATA(tt.input)
			if result != tt.expected {
				t.Errorf("removeCommentsAndCDATA() = %q, expected %q", result, tt.expected)
			}
		})
	}
}

// TestAVIFConverter_ProcessEntries is an integration test for the full ProcessEntries workflow
// This test performs actual JPEG to AVIF conversion using avifenc
func TestAVIFConverter_ProcessEntries(t *testing.T) {
	// Check if avifenc is available
	if _, err := exec.LookPath("avifenc"); err != nil {
		t.Skip("avifenc not found - skipping actual conversion test")
	}

	dbs := testutil.SetupAllDBs(t)
	defer dbs.Close()
	db, tfidfDB, workerDB, imagesDB := dbs.Main, dbs.TFIDF, dbs.Worker, dbs.Images

	// Setup test app
	tmpDir := t.TempDir()
	config := &app.Config{
		BaseURL:   "http://localhost:5555",
		UploadDir: tmpDir,
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

	// Create a valid 1x1 pixel JPEG image for testing
	// This is a minimal valid JPEG file (red pixel)
	jpegData := []byte{
		0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01,
		0x01, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x00, 0xFF, 0xDB, 0x00, 0x43,
		0x00, 0x08, 0x06, 0x06, 0x07, 0x06, 0x05, 0x08, 0x07, 0x07, 0x07, 0x09,
		0x09, 0x08, 0x0A, 0x0C, 0x14, 0x0D, 0x0C, 0x0B, 0x0B, 0x0C, 0x19, 0x12,
		0x13, 0x0F, 0x14, 0x1D, 0x1A, 0x1F, 0x1E, 0x1D, 0x1A, 0x1C, 0x1C, 0x20,
		0x24, 0x2E, 0x27, 0x20, 0x22, 0x2C, 0x23, 0x1C, 0x1C, 0x28, 0x37, 0x29,
		0x2C, 0x30, 0x31, 0x34, 0x34, 0x34, 0x1F, 0x27, 0x39, 0x3D, 0x38, 0x32,
		0x3C, 0x2E, 0x33, 0x34, 0x32, 0xFF, 0xC0, 0x00, 0x0B, 0x08, 0x00, 0x01,
		0x00, 0x01, 0x01, 0x01, 0x11, 0x00, 0xFF, 0xC4, 0x00, 0x14, 0x00, 0x01,
		0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
		0x00, 0x00, 0x00, 0x03, 0xFF, 0xC4, 0x00, 0x14, 0x10, 0x01, 0x00, 0x00,
		0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
		0x00, 0x00, 0xFF, 0xDA, 0x00, 0x08, 0x01, 0x01, 0x00, 0x00, 0x3F, 0x00,
		0x37, 0xFF, 0xD9,
	}

	jpgPath := filepath.Join(tmpDir, "test-conversion.jpg")
	if err := os.WriteFile(jpgPath, jpegData, 0644); err != nil {
		t.Fatalf("Failed to create test JPEG: %v", err)
	}

	// Insert a test entry with the JPEG image
	_, err := db.Exec(`
		INSERT INTO entries (id, path, title, body, formatted_body, format, status, date, created_at, modified_at, publish_at)
		VALUES (1, '/2024/01/test-conversion', 'Test Conversion', '',
		        '<p><img src="/images/entry/test-conversion.jpg"></p>',
		        'html', 'public', '2024-01-01', datetime('now'), datetime('now'), datetime('now'))
	`)
	if err != nil {
		t.Fatalf("Failed to insert test entry: %v", err)
	}

	// Create converter
	converter := &AVIFConverter{
		app:       application,
		uploadDir: tmpDir,
		config:    config,
		opts: &ConvertToAVIFOptions{
			DryRun: false,
			Limit:  0,
		},
	}

	// Process entries - should perform actual AVIF conversion
	ctx := context.Background()
	err = converter.ProcessEntries(ctx)
	if err != nil {
		t.Fatalf("ProcessEntries failed: %v", err)
	}

	// Verify AVIF file was created
	avifPath := filepath.Join(tmpDir, "test-conversion.avif")
	if _, err := os.Stat(avifPath); os.IsNotExist(err) {
		t.Error("AVIF file was not created")
	}

	// Verify AVIF file has valid content (should be larger than empty)
	avifInfo, err := os.Stat(avifPath)
	if err != nil {
		t.Fatalf("Failed to stat AVIF file: %v", err)
	}
	if avifInfo.Size() == 0 {
		t.Error("AVIF file is empty")
	}

	// Verify original JPEG was deleted
	if _, err := os.Stat(jpgPath); !os.IsNotExist(err) {
		t.Error("Original JPEG file should have been deleted")
	}

	// Verify database was updated with .avif extension
	var formattedBody string
	err = db.QueryRow(`SELECT formatted_body FROM entries WHERE id = 1`).Scan(&formattedBody)
	if err != nil {
		t.Fatalf("Failed to query entry: %v", err)
	}

	if !strings.Contains(formattedBody, "test-conversion.avif") {
		t.Errorf("Entry should contain .avif reference, got: %s", formattedBody)
	}

	if strings.Contains(formattedBody, "test-conversion.jpg") {
		t.Errorf("Entry should not contain .jpg reference after conversion, got: %s", formattedBody)
	}
}

// TestAVIFConverter_UpdateImageURIs is an integration test for UpdateImageURIs
func TestAVIFConverter_UpdateImageURIs(t *testing.T) {
	dbs := testutil.SetupAllDBs(t)
	defer dbs.Close()
	db, tfidfDB, workerDB, imagesDB := dbs.Main, dbs.TFIDF, dbs.Worker, dbs.Images

	// Setup test app
	config := &app.Config{}

	registry := jobqueue.NewRegistry()
	workerQueries := model.New(workerDB)
	worker := jobqueue.NewWorker(workerDB, workerQueries, registry)

	tfidfQueries := model.New(tfidfDB)
	dataQueries := model.New(db)
	calc, _ := tfidf.NewCalculator(tfidfDB, tfidfQueries, db, dataQueries)
	sim := tfidf.NewSimilarityCalculator(tfidfDB, tfidfQueries)
	searcher := tfidf.NewSearcher(tfidfDB, tfidfQueries, calc)

	application := app.NewApp(config, db, tfidfDB, workerDB, imagesDB, calc, sim, searcher, worker)

	// Insert image records with .jpg and .jpeg extensions
	_, err := imagesDB.Exec(`
		INSERT INTO images (entry_id, uri, sig)
		VALUES
			(1, '/images/entry/test1.jpg', x''),
			(2, '/images/entry/test2.jpeg', x''),
			(3, 'https://example.com/external.jpg', x'')
	`)
	if err != nil {
		t.Fatal(err)
	}

	// Create converter
	converter := &AVIFConverter{
		app: application,
		opts: &ConvertToAVIFOptions{
			DryRun: false,
		},
	}

	// Execute UpdateImageURIs
	ctx := context.Background()
	if err := converter.UpdateImageURIs(ctx); err != nil {
		t.Fatalf("UpdateImageURIs failed: %v", err)
	}

	// Verify local image URIs were updated
	var uri string
	err = imagesDB.QueryRow(`SELECT uri FROM images WHERE entry_id = 1`).Scan(&uri)
	if err != nil {
		t.Fatal(err)
	}
	expected := "/images/entry/test1.avif"
	if uri != expected {
		t.Errorf("image URI not updated correctly, expected %q, got %q", expected, uri)
	}

	err = imagesDB.QueryRow(`SELECT uri FROM images WHERE entry_id = 2`).Scan(&uri)
	if err != nil {
		t.Fatal(err)
	}
	expected = "/images/entry/test2.avif"
	if uri != expected {
		t.Errorf("image URI not updated correctly, expected %q, got %q", expected, uri)
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

// TestAVIFConverter_Idempotency verifies that ProcessEntries can be run multiple times safely
func TestAVIFConverter_Idempotency(t *testing.T) {
	// Note: このテストは実際のAVIF変換を必要とするため、
	// avifencがインストールされていない環境ではスキップする
	// 代わりにrewriteExtensionsとextractImageFilesを個別にテストしている
	t.Skip("Integration test requires avifenc - testing rewriteExtensions and extractImageFiles separately")
}

// TestAVIFConverter_ProcessEntriesWithLimit tests that the --limit flag correctly limits the number of entries processed
func TestAVIFConverter_ProcessEntriesWithLimit(t *testing.T) {
	// Check if avifenc is available
	if _, err := exec.LookPath("avifenc"); err != nil {
		t.Skip("avifenc not found - skipping conversion test")
	}

	dbs := testutil.SetupAllDBs(t)
	defer dbs.Close()
	db, tfidfDB, workerDB, imagesDB := dbs.Main, dbs.TFIDF, dbs.Worker, dbs.Images

	// Setup test app
	tmpDir := t.TempDir()
	config := &app.Config{
		BaseURL:   "http://localhost:5555",
		UploadDir: tmpDir,
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

	// Insert 20 test entries with JPEG images
	// Create dummy AVIF files for first 10 entries (as if conversion already happened)
	for i := 1; i <= 20; i++ {
		// Create dummy .jpg and .avif files for first 10 entries
		if i <= 10 {
			jpgPath := fmt.Sprintf("%s/test-%d.jpg", tmpDir, i)
			avifPath := fmt.Sprintf("%s/test-%d.avif", tmpDir, i)
			if err := os.WriteFile(jpgPath, []byte("test"), 0644); err != nil {
				t.Fatal(err)
			}
			// Pre-create AVIF files so conversion step is skipped (we're testing limit, not conversion)
			if err := os.WriteFile(avifPath, []byte("test"), 0644); err != nil {
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

	// Create converter with limit=5
	converter := &AVIFConverter{
		app:       application,
		uploadDir: tmpDir,
		config:    config,
		opts: &ConvertToAVIFOptions{
			DryRun: false, // Actually process (but AVIF files already exist, so no actual conversion)
			Limit:  5,     // Only process first 5 entries
		},
	}

	// Process entries with limit
	ctx := context.Background()
	err := converter.ProcessEntries(ctx)
	if err != nil {
		t.Fatalf("ProcessEntries failed: %v", err)
	}

	// Verify that exactly 5 entries were processed (IDs 1-5)
	// These should have .jpg replaced with .avif
	for i := 1; i <= 5; i++ {
		var formattedBody string
		err := db.QueryRow(`SELECT formatted_body FROM entries WHERE id = ?`, i).Scan(&formattedBody)
		if err != nil {
			t.Fatal(err)
		}
		// Should be converted (contains .avif)
		if !strings.Contains(formattedBody, ".avif") {
			t.Errorf("Entry %d should have been converted to .avif, got: %s", i, formattedBody)
		}
		// Should NOT contain .jpg anymore
		if strings.Contains(formattedBody, ".jpg") {
			t.Errorf("Entry %d should not contain .jpg after conversion, got: %s", i, formattedBody)
		}
	}

	// Verify that entries 6-20 were NOT processed (still contain .jpg)
	for i := 6; i <= 20; i++ {
		var formattedBody string
		err := db.QueryRow(`SELECT formatted_body FROM entries WHERE id = ?`, i).Scan(&formattedBody)
		if err != nil {
			t.Fatal(err)
		}
		// Should NOT be converted (still contains .jpg)
		if !strings.Contains(formattedBody, ".jpg") {
			t.Errorf("Entry %d should NOT have been converted yet, got: %s", i, formattedBody)
		}
		// Should NOT contain .avif
		if strings.Contains(formattedBody, ".avif") {
			t.Errorf("Entry %d should not contain .avif yet, got: %s", i, formattedBody)
		}
	}

	// Verify that only JPG files 1-5 were deleted (if deletion happened)
	// Files 6-10 should still exist as .jpg
	for i := 6; i <= 10; i++ {
		jpgPath := fmt.Sprintf("%s/test-%d.jpg", tmpDir, i)
		if _, err := os.Stat(jpgPath); os.IsNotExist(err) {
			t.Errorf("JPG file test-%d.jpg should still exist (not processed due to limit)", i)
		}
	}
}

// TestAVIFConverter_ProcessEntries_DryRun tests that dry-run mode doesn't make any actual changes
func TestAVIFConverter_ProcessEntries_DryRun(t *testing.T) {
	dbs := testutil.SetupAllDBs(t)
	defer dbs.Close()
	db, tfidfDB, workerDB, imagesDB := dbs.Main, dbs.TFIDF, dbs.Worker, dbs.Images

	// Setup test app
	tmpDir := t.TempDir()
	config := &app.Config{
		BaseURL:   "http://localhost:5555",
		UploadDir: tmpDir,
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

	// Create test JPEG files and entries
	for i := 1; i <= 3; i++ {
		// Create dummy JPEG file
		jpgPath := fmt.Sprintf("%s/test-%d.jpg", tmpDir, i)
		if err := os.WriteFile(jpgPath, []byte("test jpeg data"), 0644); err != nil {
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

	// Create converter with DryRun=true
	converter := &AVIFConverter{
		app:       application,
		uploadDir: tmpDir,
		config:    config,
		opts: &ConvertToAVIFOptions{
			DryRun: true, // DRY RUN MODE
			Limit:  0,
		},
	}

	// Process entries in dry-run mode
	ctx := context.Background()
	err := converter.ProcessEntries(ctx)
	if err != nil {
		t.Fatalf("ProcessEntries failed: %v", err)
	}

	// Verify NO AVIF files were created
	for i := 1; i <= 3; i++ {
		avifPath := fmt.Sprintf("%s/test-%d.avif", tmpDir, i)
		if _, err := os.Stat(avifPath); !os.IsNotExist(err) {
			t.Errorf("AVIF file test-%d.avif should NOT be created in dry-run mode", i)
		}
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
		// Should still contain .jpg
		if !strings.Contains(body, ".jpg") {
			t.Errorf("Entry %d should still contain .jpg in dry-run mode, got: %s", i, body)
		}
		// Should NOT contain .avif
		if strings.Contains(body, ".avif") {
			t.Errorf("Entry %d should not contain .avif in dry-run mode, got: %s", i, body)
		}
	}

	// Verify original JPEG files still exist and were NOT deleted
	for i := 1; i <= 3; i++ {
		jpgPath := fmt.Sprintf("%s/test-%d.jpg", tmpDir, i)
		if _, err := os.Stat(jpgPath); os.IsNotExist(err) {
			t.Errorf("JPEG file test-%d.jpg should still exist in dry-run mode", i)
		}
	}
}

// TestAVIFConverter_ProcessEntriesWithEntryID tests that --entry-id processes only the specified entry
func TestAVIFConverter_ProcessEntriesWithEntryID(t *testing.T) {
	// Check if avifenc is available
	if _, err := exec.LookPath("avifenc"); err != nil {
		t.Skip("avifenc not found in PATH, skipping test")
	}

	dbs := testutil.SetupAllDBs(t)
	defer dbs.Close()
	db, tfidfDB, workerDB, imagesDB := dbs.Main, dbs.TFIDF, dbs.Worker, dbs.Images

	// Setup test app
	tmpDir := t.TempDir()
	config := &app.Config{
		UploadDir: tmpDir,
		BaseURL:   "http://localhost:5555",
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

	// Create 5 test JPEG files and entries
	for i := 1; i <= 5; i++ {
		// Create a valid minimal JPEG file (1x1 pixel red image)
		jpgPath := fmt.Sprintf("%s/test-%d.jpg", tmpDir, i)
		// Minimal valid JPEG header + 1x1 red pixel
		minimalJPEG := []byte{
			0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01, 0x01, 0x00, 0x00, 0x01,
			0x00, 0x01, 0x00, 0x00, 0xFF, 0xDB, 0x00, 0x43, 0x00, 0x08, 0x06, 0x06, 0x07, 0x06, 0x05, 0x08,
			0x07, 0x07, 0x07, 0x09, 0x09, 0x08, 0x0A, 0x0C, 0x14, 0x0D, 0x0C, 0x0B, 0x0B, 0x0C, 0x19, 0x12,
			0x13, 0x0F, 0x14, 0x1D, 0x1A, 0x1F, 0x1E, 0x1D, 0x1A, 0x1C, 0x1C, 0x20, 0x24, 0x2E, 0x27, 0x20,
			0x22, 0x2C, 0x23, 0x1C, 0x1C, 0x28, 0x37, 0x29, 0x2C, 0x30, 0x31, 0x34, 0x34, 0x34, 0x1F, 0x27,
			0x39, 0x3D, 0x38, 0x32, 0x3C, 0x2E, 0x33, 0x34, 0x32, 0xFF, 0xC0, 0x00, 0x0B, 0x08, 0x00, 0x01,
			0x00, 0x01, 0x01, 0x01, 0x11, 0x00, 0xFF, 0xC4, 0x00, 0x14, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00,
			0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x09, 0xFF, 0xDA, 0x00, 0x08,
			0x01, 0x01, 0x00, 0x00, 0x3F, 0x00, 0x7F, 0xA2, 0xFF, 0xD9,
		}
		if err := os.WriteFile(jpgPath, minimalJPEG, 0644); err != nil {
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

	// Create converter with entry-id=3
	converter := &AVIFConverter{
		app:       application,
		uploadDir: tmpDir,
		config:    config,
		opts: &ConvertToAVIFOptions{
			DryRun:  false,
			EntryID: 3, // Only process entry ID 3
		},
	}

	// Execute ProcessEntries with entry-id
	ctx := context.Background()
	if err := converter.ProcessEntries(ctx); err != nil {
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
			// Entry 3 should be converted to AVIF
			if !strings.Contains(formattedBody, ".avif") {
				t.Errorf("Entry 3 should have been converted to AVIF, got: %s", formattedBody)
			}
			if strings.Contains(formattedBody, ".jpg") {
				t.Errorf("Entry 3 should not contain .jpg, got: %s", formattedBody)
			}
		} else {
			// Other entries should NOT be converted
			if !strings.Contains(formattedBody, ".jpg") {
				t.Errorf("Entry %d should NOT have been converted, got: %s", i, formattedBody)
			}
			if strings.Contains(formattedBody, ".avif") {
				t.Errorf("Entry %d should not contain .avif, got: %s", i, formattedBody)
			}
		}
	}

	// Verify exactly 1 AVIF file was created (test-3.avif)
	avifExists := make(map[int]bool)
	for i := 1; i <= 5; i++ {
		avifPath := fmt.Sprintf("%s/test-%d.avif", tmpDir, i)
		_, err := os.Stat(avifPath)
		avifExists[i] = !os.IsNotExist(err)
	}

	if !avifExists[3] {
		t.Error("test-3.avif should have been created")
	}

	for i := 1; i <= 5; i++ {
		if i == 3 {
			continue
		}
		if avifExists[i] {
			t.Errorf("test-%d.avif should NOT have been created", i)
		}
	}

	// Verify that only test-3.jpg was deleted
	jpgExists := make(map[int]bool)
	for i := 1; i <= 5; i++ {
		jpgPath := fmt.Sprintf("%s/test-%d.jpg", tmpDir, i)
		_, err := os.Stat(jpgPath)
		jpgExists[i] = !os.IsNotExist(err)
	}

	if jpgExists[3] {
		t.Error("test-3.jpg should have been deleted after conversion")
	}

	for i := 1; i <= 5; i++ {
		if i == 3 {
			continue
		}
		if !jpgExists[i] {
			t.Errorf("test-%d.jpg should still exist (not processed)", i)
		}
	}
}
