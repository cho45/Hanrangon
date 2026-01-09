package app

import (
	"fmt"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

func TestMetaTags(t *testing.T) {
	env := setupTest(t)
	defer env.close()

	// Insert test data
	_, err := env.db.Exec(`
			INSERT INTO entries (title, body, formatted_body, summary, image_url, path, format, date, created_at, modified_at)
			VALUES
			('[test] Test Entry Title', 'Body 1', '<p>Formatted Body 1</p>', '', '', '2025/01/01/1', 'Markdown', '2025-01-01', '2025-01-01 10:00:00', '2025-01-01 10:00:00')
		`)
	if err != nil {
		t.Fatalf("failed to insert test data: %v", err)
	}

	t.Run("Index Page Meta Tags", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodGet, "/", nil)
		rec := httptest.NewRecorder()
		env.server.ServeHTTP(rec, req)

		if rec.Code != http.StatusOK {
			t.Errorf("want status 200, got %d", rec.Code)
		}

		body := rec.Body.String()

		// Index page has no PageTitle by default in HandleIndex
		expectedTitle := "氾濫原"

		itemprop := fmt.Sprintf(`<meta itemprop="name" content="%s"/>`, expectedTitle)
		if !strings.Contains(body, itemprop) {
			t.Errorf("itemprop=\"name\" mismatch. expected to contain %s", itemprop)
		}

		ogTitle := fmt.Sprintf(`<meta property="og:title" content="%s"/>`, expectedTitle)
		if !strings.Contains(body, ogTitle) {
			t.Errorf("og:title mismatch. expected to contain %s", ogTitle)
		}

		expectedURL := "http://localhost:5555/"
		ogURL := fmt.Sprintf(`<meta property="og:url" content="%s"/>`, expectedURL)
		if !strings.Contains(body, ogURL) {
			t.Errorf("og:url mismatch. expected %s", ogURL)
		}

		canonical := fmt.Sprintf(`<link rel="canonical" href="%s"/>`, expectedURL)
		if !strings.Contains(body, canonical) {
			t.Errorf("canonical link mismatch. expected to contain %s", canonical)
		}

		if !strings.Contains(body, `<meta property="og:site_name" content="氾濫原"/>`) {
			t.Errorf("og:site_name mismatch")
		}

		if !strings.Contains(body, `<meta property="og:type" content="website"/>`) {
			t.Errorf("og:type mismatch for index page")
		}

		if !strings.Contains(body, `<meta property="og:locale" content="ja_JP"/>`) {
			t.Errorf("og:locale mismatch")
		}

		if !strings.Contains(body, `<meta name="author" content="cho45"/>`) {
			t.Errorf("author meta tag mismatch on index page")
		}
	})

	t.Run("Entry Page Meta Tags", func(t *testing.T) {
		// Update entry with an image to test og:image
		_, err := env.db.Exec(`
				UPDATE entries SET 
					formatted_body = '<p>This is a test entry summary.</p><img src="/images/entry/test.jpg">',
					summary = 'This is a test entry summary.',
					image_url = '/images/entry/test.jpg'
				WHERE path = '2025/01/01/1'
			`)
		if err != nil {
			t.Fatal(err)
		}
		req := httptest.NewRequest(http.MethodGet, "/2025/01/01/1", nil)
		rec := httptest.NewRecorder()
		env.server.ServeHTTP(rec, req)

		if rec.Code != http.StatusOK {
			t.Errorf("want status 200, got %d", rec.Code)
		}

		body := rec.Body.String()

		expectedTitle := "Test Entry Title - 氾濫原"

		itemprop := fmt.Sprintf(`<meta itemprop="name" content="%s"/>`, expectedTitle)
		if !strings.Contains(body, itemprop) {
			t.Errorf("itemprop=\"name\" mismatch. expected to contain %s", itemprop)
		}

		ogTitle := fmt.Sprintf(`<meta property="og:title" content="%s"/>`, expectedTitle)
		if !strings.Contains(body, ogTitle) {
			t.Errorf("og:title mismatch. expected to contain %s", ogTitle)
		}

		expectedURL := "http://localhost:5555/2025/01/01/1"
		ogURL := fmt.Sprintf(`<meta property="og:url" content="%s"/>`, expectedURL)
		if !strings.Contains(body, ogURL) {
			t.Errorf("og:url mismatch. expected %s", ogURL)
		}

		// New meta tags
		expectedDesc := "This is a test entry summary."
		ogDesc := fmt.Sprintf(`<meta property="og:description" content="%s"/>`, expectedDesc)
		if !strings.Contains(body, ogDesc) {
			t.Errorf("og:description mismatch. expected to contain %s", ogDesc)
		}

		expectedImage := "http://localhost:5555/images/entry/test.jpg"
		ogImage := fmt.Sprintf(`<meta property="og:image" content="%s"/>`, expectedImage)
		if !strings.Contains(body, ogImage) {
			t.Errorf("og:image mismatch. expected to contain %s", ogImage)
		}

		if !strings.Contains(body, `<meta property="og:type" content="article"/>`) {
			t.Errorf("og:type mismatch for entry page")
		}

		if !strings.Contains(body, `<meta name="twitter:creator" content="@cho45"/>`) {
			t.Errorf("twitter:creator mismatch")
		}

		if !strings.Contains(body, `<meta property="article:published_time" content="2025-01-01T10:00:00Z"/>`) {
			t.Errorf("article:published_time mismatch")
		}

		if !strings.Contains(body, `<meta property="article:tag" content="test"/>`) {
			t.Errorf("article:tag mismatch")
		}

		if !strings.Contains(body, `<meta name="author" content="cho45"/>`) {
			t.Errorf("author meta tag mismatch")
		}
	})
}
