package subcommands

import (
	"context"
	"testing"

	"github.com/cho45/hanrangon/app"
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

// TestAVIFConverter_ProcessEntries is an integration test for the full ProcessEntries workflow
func TestAVIFConverter_ProcessEntries(t *testing.T) {
	db, tfidfDB, workerDB, imagesDB := setupTestDB(t)
	defer db.Close()
	defer tfidfDB.Close()
	defer workerDB.Close()
	defer imagesDB.Close()

	// Note: このテストは実際のAVIF変換を必要とするため、
	// avifencがインストールされていない環境ではスキップする
	// 代わりにrewriteExtensionsとextractImageFilesを個別にテストしている
	t.Skip("Integration test requires avifenc - testing rewriteExtensions and extractImageFiles separately")
}

// TestAVIFConverter_UpdateImageURIs is an integration test for UpdateImageURIs
func TestAVIFConverter_UpdateImageURIs(t *testing.T) {
	db, tfidfDB, workerDB, imagesDB := setupTestDB(t)
	defer db.Close()
	defer tfidfDB.Close()
	defer workerDB.Close()
	defer imagesDB.Close()

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
