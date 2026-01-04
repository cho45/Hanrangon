package app

import (
	"bufio"
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"mime/multipart"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"strings"
	"testing"
	"time"

	"github.com/cho45/hanrangon/model"
	"github.com/labstack/echo/v4"
)

func TestHandleIndex(t *testing.T) {
	env := setupTest(t)
	defer env.close()

	// Insert test data
	_, err := env.db.Exec(`
		INSERT INTO entries (title, body, formatted_body, path, format, date, created_at, modified_at)
		VALUES
		('Test Entry 1', 'Body 1', '<p>Formatted Body 1</p>', '2025/01/01/1', 'Markdown', '2025-01-01', '2025-01-01 10:00:00', '2025-01-01 10:00:00'),
		('Test Entry 2', 'Body 2', '<p>Formatted Body 2</p>', '2025/01/01/2', 'Markdown', '2025-01-01', '2025-01-01 12:00:00', '2025-01-01 12:00:00')
	`)
	if err != nil {
		t.Fatalf("failed to insert test data: %v", err)
	}

	req := httptest.NewRequest(http.MethodGet, "/", nil)
	rec := httptest.NewRecorder()

	env.server.ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Errorf("want status 200, got %d", rec.Code)
		t.Logf("Response body: %s", rec.Body.String())
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
	env := setupTest(t)
	defer env.close()

	_, err := env.db.Exec(`
		INSERT INTO entries (title, body, formatted_body, path, format, date, created_at, modified_at)
		VALUES
		('Test Entry 1', 'Body 1', '<p>Formatted Body 1</p>', '2025/01/01/1', 'Markdown', '2025-01-01', '2025-01-01 10:00:00', '2025-01-01 10:00:00'),
		('Test Entry 2', 'Body 2', '<p>Formatted Body 2</p>', '2025/01/01/2', 'Markdown', '2025-01-01', '2025-01-01 12:00:00', '2025-01-01 12:00:00')
	`)
	if err != nil {
		t.Fatalf("failed to insert test data: %v", err)
	}

	t.Run("Existing entry", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodGet, "/2025/01/01/1", nil)
		rec := httptest.NewRecorder()
		env.server.ServeHTTP(rec, req)

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
		env.server.ServeHTTP(rec, req)

		if rec.Code != http.StatusNotFound {
			t.Errorf("want status 404, got %d", rec.Code)
		}
	})
}

func TestHandleArchive(t *testing.T) {
	env := setupTest(t)
	defer env.close()

	_, err := env.db.Exec(`
		INSERT INTO entries (title, body, formatted_body, path, format, date, created_at, modified_at)
		VALUES
		('Entry 1', 'Body 1', '', '2025/01/01/1', 'Markdown', '2025-01-01', '2025-01-01 10:00:00', '2025-01-01 10:00:00'),
		('Entry 2', 'Body 2', '', '2025/01/02/1', 'Markdown', '2025-01-02', '2025-01-02 10:00:00', '2025-01-02 10:00:00'),
		('Entry 3', 'Body 3', '', '2024/12/31/1', 'Markdown', '2024-12-31', '2024-12-31 10:00:00', '2024-12-31 10:00:00')
	`)
	if err != nil {
		t.Fatalf("failed to insert test data: %v", err)
	}

	req := httptest.NewRequest(http.MethodGet, "/archive", nil)
	rec := httptest.NewRecorder()
	env.server.ServeHTTP(rec, req)

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
	env := setupTest(t)
	defer env.close()

	_, err := env.db.Exec(`
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

			env.server.ServeHTTP(rec, req)

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
	env := setupTest(t)
	defer env.close()

	_, err := env.db.Exec(`
		INSERT INTO entries (title, body, formatted_body, path, format, date, created_at, modified_at)
		VALUES
		('[test] Tagged Entry', 'Body', '', '2025/01/01/1', 'Markdown', '2025-01-01', '2025-01-01 10:00:00', '2025-01-01 10:00:00'),
		('Normal Entry', 'Body', '', '2025/01/02/1', 'Markdown', '2025-01-02', '2025-01-02 10:00:00', '2025-01-02 10:00:00')
	`)
	if err != nil {
		t.Fatalf("failed to insert test data: %v", err)
	}

	req := httptest.NewRequest(http.MethodGet, "/test/", nil)
	rec := httptest.NewRecorder()

	env.server.ServeHTTP(rec, req)

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
	env := setupTest(t)
	defer env.close()

	_, err := env.db.Exec(`
		INSERT INTO entries (title, body, formatted_body, path, format, date, created_at, modified_at)
		VALUES
		('Feed Entry 1', 'Body', '<p>Body</p>', '2025/01/01/1', 'Markdown', '2025-01-01', '2025-01-01 10:00:00', '2025-01-01 10:00:00')
	`)
	if err != nil {
		t.Fatalf("failed to insert test data: %v", err)
	}

	req := httptest.NewRequest(http.MethodGet, "/feed", nil)
	rec := httptest.NewRecorder()

	env.server.ServeHTTP(rec, req)

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

func TestHandleSitemap(t *testing.T) {
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
		t.Errorf("want status 200, got %d", rec.Code)
	}

	contentType := rec.Header().Get("Content-Type")
	if !strings.Contains(contentType, "application/xml") {
		t.Errorf("want Content-Type application/xml, got %s", contentType)
	}

	body := rec.Body.String()
	if !strings.Contains(body, "<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">") {
		t.Errorf("body does not contain urlset tag")
	}
	if !strings.Contains(body, "<loc>https://lowreal.net/2025/01/01/1</loc>") {
		t.Errorf("body does not contain entry location")
	}
}

func TestHandleApiSimilar(t *testing.T) {
	t.Run("TFIDF related", func(t *testing.T) {
		env := setupTest(t)
		defer env.close()

		// Insert entries into main DB
		_, err := env.db.Exec(`
			INSERT INTO entries (id, title, body, formatted_body, path, format, date, created_at, modified_at)
			VALUES
			(1, 'Target Entry', 'Body 1', '<p>Body 1</p>', '2025/01/01/1', 'Markdown', '2025-01-01', '2025-01-01 10:00:00', '2025-01-01 10:00:00'),
			(2, 'Related Entry', 'Body 2', '<p>Body 2</p>', '2025/01/01/2', 'Markdown', '2025-01-01', '2025-01-01 11:00:00', '2025-01-01 11:00:00')
		`)
		if err != nil {
			t.Fatalf("failed to insert entries: %v", err)
		}

		// Insert relationship into TFIDF DB
		_, err = env.tfidfDB.Exec(`
			INSERT INTO related_entries (entry_id, related_entry_id, score)
			VALUES (1, 2, 0.95)
		`)
		if err != nil {
			t.Fatalf("failed to insert related_entries: %v", err)
		}

		req := httptest.NewRequest(http.MethodGet, "/api/similar?id=1", nil)
		rec := httptest.NewRecorder()
		env.server.ServeHTTP(rec, req)

		if rec.Code != http.StatusOK {
			t.Errorf("want status 200, got %d", rec.Code)
		}

		var res struct {
			Result map[string]string `json:"result"`
			Ad     string            `json:"ad"`
		}
		importJSON := strings.NewReader(rec.Body.String())
		if err := json.NewDecoder(importJSON).Decode(&res); err != nil {
			t.Fatalf("failed to decode response: %v", err)
		}

		html, ok := res.Result["1"]
		if !ok {
			t.Fatalf("result for id=1 not found")
		}

		if !strings.Contains(html, "Related Entry") {
			t.Errorf("rendered HTML does not contain 'Related Entry'")
		}
		if !strings.Contains(html, "data-score=\"0.950000\"") {
			t.Errorf("rendered HTML does not contain correct score")
		}
	})

	t.Run("Image fallback", func(t *testing.T) {
		env := setupTest(t)
		defer env.close()

		// Insert entries
		_, err := env.db.Exec(`
			INSERT INTO entries (id, title, body, formatted_body, path, format, date, created_at, modified_at)
			VALUES
			(3, 'Target Image Entry', 'Body 3', '', '2025/01/01/3', 'Markdown', '2025-01-01', '2025-01-01 10:00:00', '2025-01-01 10:00:00'),
			(4, 'Related Image Entry', 'Body 4', '', '2025/01/01/4', 'Markdown', '2025-01-01', '2025-01-01 11:00:00', '2025-01-01 11:00:00')
		`)
		if err != nil {
			t.Fatal(err)
		}

		// Insert images
		_, err = env.imagesDB.Exec(`
			INSERT INTO images (id, uri, entry_id, sig) VALUES
			(1, 'http://example.com/img1.jpg', 3, ''),
			(2, 'http://example.com/img2.jpg', 4, '')
		`)
		if err != nil {
			t.Fatal(err)
		}

		// Insert ngrams (share "test" word)
		_, err = env.imagesDB.Exec(`
			INSERT INTO ngram (image_id, word) VALUES
			(1, 'test'),
			(2, 'test')
		`)
		if err != nil {
			t.Fatal(err)
		}

		req := httptest.NewRequest(http.MethodGet, "/api/similar?id=3", nil)
		rec := httptest.NewRecorder()
		env.server.ServeHTTP(rec, req)

		if rec.Code != http.StatusOK {
			t.Errorf("want status 200, got %d", rec.Code)
		}

		var res struct {
			Result map[string]string `json:"result"`
		}
		if err := json.NewDecoder(rec.Body).Decode(&res); err != nil {
			t.Fatal(err)
		}

		html, ok := res.Result["3"]
		if !ok {
			t.Fatal("result for id=3 not found")
		}

		// Should verify that html contains the image or link to entry 4
		// view/similar.templ: <a href="/2025/01/01/4"> <img src="http://example.com/img2.jpg" ... />
		if !strings.Contains(html, "/2025/01/01/4") {
			t.Error("rendered HTML does not contain link to related entry")
		}
		if !strings.Contains(html, "http://example.com/img2.jpg") {
			t.Error("rendered HTML does not contain related image URI")
		}
	})
}

func TestHandleApiEdit(t *testing.T) {
	env := setupTest(t)
	defer env.close()

	cookie := env.login(t)

	t.Run("Create new entry with auto path", func(t *testing.T) {
		payload := `{"title":"New Entry", "body":"Hello <![CDATA[<b>world</b>]]>", "format":"HTML"}`
		req := httptest.NewRequest(http.MethodPost, "/admin/api/edit", strings.NewReader(payload))
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("X-Requested-With", "fetch")
		req.Header.Set("Cookie", cookie)
		rec := httptest.NewRecorder()

		env.server.ServeHTTP(rec, req)

		if rec.Code != http.StatusOK {
			t.Fatalf("want status 200, got %d: %s", rec.Code, rec.Body.String())
		}

		var res EditResponse
		if err := json.Unmarshal(rec.Body.Bytes(), &res); err != nil {
			t.Fatalf("failed to unmarshal response: %v", err)
		}

		if res.SessionID == "" {
			t.Fatal("got empty session ID")
		}

		// Wait for completion via SSE
		done := make(chan string, 1)
		errChan := make(chan error, 1)

		go func() {
			progReq := httptest.NewRequest(http.MethodGet, "/admin/api/edit/progress?sid="+res.SessionID, nil)
			progReq.Header.Set("Cookie", cookie)
			progRec := httptest.NewRecorder()

			env.server.ServeHTTP(progRec, progReq)

			scanner := bufio.NewScanner(progRec.Body)
			var location string
			for scanner.Scan() {
				line := scanner.Text()
				if strings.HasPrefix(line, "data: ") {
					data := strings.TrimPrefix(line, "data: ")
					var msg map[string]interface{}
					if err := json.Unmarshal([]byte(data), &msg); err == nil {
						if msg["type"] == "done" {
							location = msg["location"].(string)
							break
						}
						if msg["type"] == "error" {
							errChan <- fmt.Errorf("error from SSE: %v", msg["message"])
							return
						}
					}
				}
			}
			if location != "" {
				done <- location
			} else {
				errChan <- fmt.Errorf("did not get location from SSE")
			}
		}()

		var location string
		select {
		case location = <-done:
		case err := <-errChan:
			t.Fatalf("SSE failed: %v", err)
		case <-time.After(10 * time.Second): // Give it enough time for postprocess (node)
			t.Fatal("timeout waiting for SSE done")
		}

		// Verify saved data in DB
		path := strings.TrimPrefix(location, "/")
		row, err := env.db.Query(`SELECT title, formatted_body FROM entries WHERE path = ?`, path)
		if err != nil {
			t.Fatalf("failed to query db: %v", err)
		}
		defer row.Close()
		if !row.Next() {
			t.Fatal("entry not found in db")
		}
		var title, formattedBody string
		row.Scan(&title, &formattedBody)

		if title != "New Entry" {
			t.Errorf("want New Entry, got %s", title)
		}
		if formattedBody != "Hello &lt;b&gt;world&lt;/b&gt;" {
			t.Errorf("formatted body not escaped: %s", formattedBody)
		}
		// Check path format YYYY/MM/DD/1
		now := time.Now().Format("2006/01/02")
		if !strings.HasPrefix(path, now) || !strings.HasSuffix(path, "/1") {
			t.Errorf("unexpected path format: %s", path)
		}
	})
}

func TestHandleEdit(t *testing.T) {
	env := setupTest(t)
	defer env.close()

	t.Run("Redirect unauthenticated", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodGet, "/admin/edit", nil)
		rec := httptest.NewRecorder()
		env.server.ServeHTTP(rec, req)

		if rec.Code != http.StatusFound {
			t.Errorf("want status 302, got %d", rec.Code)
		}
		if !strings.Contains(rec.Header().Get("Location"), "/login") {
			t.Errorf("expected redirect to /login, got %s", rec.Header().Get("Location"))
		}
	})

	t.Run("Render for authenticated", func(t *testing.T) {
		cookie := env.login(t)
		req := httptest.NewRequest(http.MethodGet, "/admin/edit", nil)
		req.Header.Set("Cookie", cookie)
		rec := httptest.NewRecorder()
		env.server.ServeHTTP(rec, req)

		if rec.Code != http.StatusOK {
			t.Errorf("want status 200, got %d", rec.Code)
		}
		if !strings.Contains(rec.Body.String(), "<app-editor") {
			t.Errorf("body does not contain app-editor element")
		}
	})
}

func TestHandleApiUploadImage(t *testing.T) {
	env := setupTest(t)
	defer env.close()

	cookie := env.login(t)

	// Prepare multipart form file
	body := &bytes.Buffer{}
	writer := multipart.NewWriter(body)
	// Filename with non-ASCII characters to test normalization
	filename := "テスト画像.jpg"
	part, err := writer.CreateFormFile("file", filename)
	if err != nil {
		t.Fatal(err)
	}
	_, _ = part.Write([]byte("fake-image-content"))
	writer.Close()

	req := httptest.NewRequest(http.MethodPost, "/admin/api/upload/image", body)
	req.Header.Set(echo.HeaderContentType, writer.FormDataContentType())
	req.Header.Set("X-Requested-With", "fetch")
	req.Header.Set("Cookie", cookie)
	rec := httptest.NewRecorder()

	env.server.ServeHTTP(rec, req)

	// Verify status code
	if rec.Code != http.StatusOK {
		t.Fatalf("expected status 200, got %d: %s", rec.Code, rec.Body.String())
	}

	// Verify response JSON
	var res map[string]string
	if err := json.Unmarshal(rec.Body.Bytes(), &res); err != nil {
		t.Fatal(err)
	}

	uploadedURL, ok := res["uploaded"]
	if !ok {
		t.Fatal("response missing 'uploaded' key")
	}

	if !strings.HasPrefix(uploadedURL, "/images/entry/") {
		t.Errorf("unexpected uploaded URL prefix: %s", uploadedURL)
	}

	// Verify file existence on disk
	files, err := os.ReadDir(env.uploadDir)
	if err != nil {
		t.Fatal(err)
	}
	if len(files) != 1 {
		t.Errorf("expected 1 file in upload dir, got %d", len(files))
	}

	// Check if filename contains the original name
	if !strings.Contains(files[0].Name(), filename) {
		t.Errorf("filename %s does not contain expected part %s", files[0].Name(), filename)
	}

	// Verify content
	content, err := os.ReadFile(filepath.Join(env.uploadDir, files[0].Name()))
	if err != nil {
		t.Fatal(err)
	}
	if string(content) != "fake-image-content" {
		t.Errorf("unexpected file content: %s", string(content))
	}
}

func TestCaching(t *testing.T) {
	env := setupTest(t)
	defer env.close()

	// Insert test data with specific modified_at
	modTimeStr := "2025-01-01 12:00:00"
	_, err := env.db.Exec(`
		INSERT INTO entries (title, body, formatted_body, path, format, date, created_at, modified_at)
		VALUES
		('Cache Entry', 'Body', '<p>Body</p>', '2025/01/01/cache', 'Markdown', '2025-01-01', '2025-01-01 10:00:00', ?)
	`, modTimeStr)
	if err != nil {
		t.Fatalf("failed to insert test data: %v", err)
	}

	targetURL := "/2025/01/01/cache"

	// 1. First request: Should have ETag and Last-Modified
	req := httptest.NewRequest(http.MethodGet, targetURL, nil)
	rec := httptest.NewRecorder()
	env.server.ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("want status 200, got %d", rec.Code)
	}

	etag := rec.Header().Get("ETag")
	lastModified := rec.Header().Get("Last-Modified")

	if etag == "" {
		t.Error("ETag header missing")
	}
	if lastModified == "" {
		t.Error("Last-Modified header missing")
	}

	// 2. Second request with If-None-Match (ETag) -> 304
	req2 := httptest.NewRequest(http.MethodGet, targetURL, nil)
	req2.Header.Set("If-None-Match", etag)
	rec2 := httptest.NewRecorder()
	env.server.ServeHTTP(rec2, req2)

	if rec2.Code != http.StatusNotModified {
		t.Errorf("want status 304 for ETag match, got %d", rec2.Code)
	}
	if rec2.Body.Len() > 0 {
		t.Error("want empty body for 304, got content")
	}

	// 3. Third request with If-Modified-Since (Last-Modified) -> 304
	req3 := httptest.NewRequest(http.MethodGet, targetURL, nil)
	req3.Header.Set("If-Modified-Since", lastModified)
	rec3 := httptest.NewRecorder()
	env.server.ServeHTTP(rec3, req3)

	if rec3.Code != http.StatusNotModified {
		t.Errorf("want status 304 for Last-Modified match, got %d", rec3.Code)
	}

	// 4. Update entry and request with old ETag -> 200 and new ETag
	newModTimeStr := "2025-01-02 12:00:00"
	_, err = env.db.Exec(`UPDATE entries SET modified_at = ? WHERE path = '2025/01/01/cache'`, newModTimeStr)
	if err != nil {
		t.Fatal(err)
	}

	req4 := httptest.NewRequest(http.MethodGet, targetURL, nil)
	req4.Header.Set("If-None-Match", etag) // Old ETag
	rec4 := httptest.NewRecorder()
	env.server.ServeHTTP(rec4, req4)

	if rec4.Code != http.StatusOK {
		t.Errorf("want status 200 for changed resource, got %d", rec4.Code)
	}

	newEtag := rec4.Header().Get("ETag")
	if newEtag == etag {
		t.Error("ETag should have changed after modification")
	}
}

func TestDateTimeHandling(t *testing.T) {
	env := setupTest(t)
	defer env.close()

	ctx := context.Background()
	// Fix time to a specific value in JST
	jst := time.FixedZone("Asia/Tokyo", 9*60*60)
	now := time.Date(2026, 1, 3, 15, 4, 5, 0, jst)

	// 1. Create entry via queries
	entry, err := env.app.Queries().CreateEntry(ctx, model.CreateEntryParams{
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
	readEntry, err := env.app.Queries().GetEntryById(ctx, entry.ID)
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

func TestUpdateModifiedAt(t *testing.T) {
	env := setupTest(t)
	defer env.close()

	ctx := context.Background()
	oldTime := time.Date(2025, 1, 1, 12, 0, 0, 0, time.Local)

	// 1. Create entry
	entry, err := env.app.Queries().CreateEntry(ctx, model.CreateEntryParams{
		Title:         "Old Title",
		Body:          "Old Body",
		FormattedBody: "<p>Old Body</p>",
		Path:          "2025/01/01/mod-test",
		Format:        "Markdown",
		Date:          "2025-01-01",
		CreatedAt:     oldTime,
		ModifiedAt:    oldTime,
		Status:        "public",
	})
	if err != nil {
		t.Fatal(err)
	}

	cookie := env.login(t)

	// 2. Update via handler
	updateReq := EditRequest{
		ID:     entry.ID,
		Title:  "New Title",
		Body:   "New Body",
		Format: "Markdown",
		Status: "public",
	}
	payload, _ := json.Marshal(updateReq)
	req := httptest.NewRequest(http.MethodPost, "/admin/api/edit", strings.NewReader(string(payload)))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-Requested-With", "fetch")
	req.Header.Set("Cookie", cookie)
	rec := httptest.NewRecorder()
	env.server.ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("want 200, got %d", rec.Code)
	}

	var res EditResponse
	if err := json.Unmarshal(rec.Body.Bytes(), &res); err != nil {
		t.Fatalf("failed to unmarshal response: %v", err)
	}

	// Wait for completion via SSE
	progReq := httptest.NewRequest(http.MethodGet, "/admin/api/edit/progress?sid="+res.SessionID, nil)
	progReq.Header.Set("Cookie", cookie)
	progRec := httptest.NewRecorder()
	env.server.ServeHTTP(progRec, progReq)

	scanner := bufio.NewScanner(progRec.Body)
	done := false
	for scanner.Scan() {
		line := scanner.Text()
		if strings.HasPrefix(line, "data: ") {
			data := strings.TrimPrefix(line, "data: ")
			var msg map[string]interface{}
			if err := json.Unmarshal([]byte(data), &msg); err == nil {
				if msg["type"] == "done" {
					done = true
					break
				}
			}
		}
	}
	if !done {
		t.Fatal("did not get done from SSE")
	}

	// 3. Verify modified_at has changed
	updated, err := env.app.Queries().GetEntryById(ctx, entry.ID)
	if err != nil {
		t.Fatal(err)
	}

	if !updated.ModifiedAt.After(oldTime) {
		t.Errorf("modified_at should be updated. old=%v, new=%v", oldTime, updated.ModifiedAt)
	}

	// CreatedAt should remain same
	if !updated.CreatedAt.Equal(oldTime) {
		t.Errorf("created_at should NOT be updated. old=%v, new=%v", oldTime, updated.CreatedAt)
	}
}
