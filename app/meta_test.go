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
		INSERT INTO entries (title, body, formatted_body, path, format, date, created_at, modified_at)
		VALUES
		('Test Entry Title', 'Body 1', '<p>Formatted Body 1</p>', '2025/01/01/1', 'Markdown', '2025-01-01', '2025-01-01 10:00:00', '2025-01-01 10:00:00')
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
			})
		
			t.Run("Entry Page Meta Tags", func(t *testing.T) {
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
		
	})
}
