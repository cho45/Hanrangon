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
	"net/url"
	"os"
	"path/filepath"
	"strings"
	"testing"
	"time"

	"github.com/cho45/hanrangon/backend/model/maindb"
	"github.com/labstack/echo/v4"
	"github.com/stretchr/testify/require"
)

func TestHandleApiEdit(t *testing.T) {
	env := setupTest(t)
	defer env.close()

	loginInfo := env.login(t)

	t.Run("Create new entry with auto path", func(t *testing.T) {
		payload := `{"title":"New Entry", "body":"Hello <![CDATA[<b>world</b>]]>", "format":"HTML"}`
		req := httptest.NewRequest(http.MethodPost, "/admin/api/edit", strings.NewReader(payload))
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("X-Requested-With", "fetch")
		req.Header.Set("Cookie", loginInfo.Cookie)
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
			progReq.Header.Set("Cookie", loginInfo.Cookie)
			progRec := httptest.NewRecorder()

			env.server.ServeHTTP(progRec, progReq)

			scanner := bufio.NewScanner(progRec.Body)
			var location string
			var foundNodeLog bool
			for scanner.Scan() {
				line := scanner.Text()
				if strings.HasPrefix(line, "data: ") {
					data := strings.TrimPrefix(line, "data: ")
					var msg map[string]interface{}
					if err := json.Unmarshal([]byte(data), &msg); err == nil {
						if msg["type"] == "progress" {
							message := msg["message"].(string)
							if strings.Contains(message, "processHTML:") {
								foundNodeLog = true
							}
						}
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
			if !foundNodeLog {
				errChan <- fmt.Errorf("did not receive Node.js progress logs via SSE")
				return
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

func TestHandleAdminApiPreview(t *testing.T) {
	env := setupTest(t)
	defer env.close()

	loginInfo := env.login(t)

	form := url.Values{}
	form.Add("title", "Preview Title")
	form.Add("body", "Preview Body content")
	form.Add("format", "Markdown")
	form.Add("sk", loginInfo.SK)

	req := httptest.NewRequest(http.MethodPost, "/admin/api/preview", strings.NewReader(form.Encode()))
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	req.Header.Set("Cookie", loginInfo.Cookie)
	rec := httptest.NewRecorder()

	env.server.ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("want status 200, got %d: %s", rec.Code, rec.Body.String())
	}

	doc := mustParseHTML(t, rec.Body.String())

	if !strings.Contains(doc.Find("h2").Text(), "Preview Title") {
		t.Errorf("h2 tags do not contain preview title")
	}
	if !strings.Contains(doc.Find("article .content").Text(), "Preview Body content") {
		t.Errorf("article content does not contain preview body content")
	}
	// Check if it's using the layout
	if doc.Find("title").Text() != "Preview Title - 氾濫原" {
		t.Errorf("body does not seem to use the layout template correctly: got %v", doc.Find("title").Text())
	}
}

func TestHandleApiEdit_JobFailure(t *testing.T) {
	env := setupTest(t)
	defer env.close()

	loginInfo := env.login(t)

	// 意図的にジョブDBをクローズして投入を失敗させる
	env.workerDB.Close()

	payload := `{"title":"Job Fail Entry", "body":"Hello", "format":"HTML"}`
	req := httptest.NewRequest(http.MethodPost, "/admin/api/edit", strings.NewReader(payload))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-Requested-With", "fetch")
	req.Header.Set("Cookie", loginInfo.Cookie)
	rec := httptest.NewRecorder()

	env.server.ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("want status 200, got %d: %s", rec.Code, rec.Body.String())
	}

	var res EditResponse
	if err := json.Unmarshal(rec.Body.Bytes(), &res); err != nil {
		t.Fatalf("failed to unmarshal response: %v", err)
	}

	// SSEで警告メッセージが届くか確認
	foundWarning := false
	progReq := httptest.NewRequest(http.MethodGet, "/admin/api/edit/progress?sid="+res.SessionID, nil)
	progReq.Header.Set("Cookie", loginInfo.Cookie)
	progRec := httptest.NewRecorder()

	env.server.ServeHTTP(progRec, progReq)

	scanner := bufio.NewScanner(progRec.Body)
	for scanner.Scan() {
		line := scanner.Text()
		if strings.Contains(line, "警告: 一部の非同期ジョブの投入に失敗しました") {
			foundWarning = true
			break
		}
	}

	if !foundWarning {
		t.Error("Did not find job enqueue warning message in SSE stream")
	}
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
		loginInfo := env.login(t)
		req := httptest.NewRequest(http.MethodGet, "/admin/edit", nil)
		req.Header.Set("Cookie", loginInfo.Cookie)
		rec := httptest.NewRecorder()
		env.server.ServeHTTP(rec, req)

		if rec.Code != http.StatusOK {
			t.Errorf("want status 200, got %d", rec.Code)
		}
		doc := mustParseHTML(t, rec.Body.String())
		if doc.Find("#admin-root").Length() == 0 {
			t.Errorf("body does not contain admin-root element")
		}
	})
}

func TestHandleAdminIndex(t *testing.T) {
	env := setupTest(t)
	defer env.close()

	loginInfo := env.login(t)
	req := httptest.NewRequest(http.MethodGet, "/admin/", nil)
	req.Header.Set("Cookie", loginInfo.Cookie)
	rec := httptest.NewRecorder()
	env.server.ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Errorf("want status 200, got %d", rec.Code)
	}
	doc := mustParseHTML(t, rec.Body.String())
	if doc.Find("#admin-root").Length() == 0 {
		t.Errorf("body does not contain admin-root element")
	}
}

func TestHandleLogout(t *testing.T) {
	env := setupTest(t)
	defer env.close()

	loginInfo := env.login(t)
	req := httptest.NewRequest(http.MethodGet, "/logout", nil)
	req.Header.Set("Cookie", loginInfo.Cookie)
	rec := httptest.NewRecorder()
	env.server.ServeHTTP(rec, req)

	if rec.Code != http.StatusFound {
		t.Errorf("want status 302, got %d", rec.Code)
	}
	if rec.Header().Get("Location") != "/" {
		t.Errorf("want redirect to /, got %s", rec.Header().Get("Location"))
	}

	// ログアウト後のセッション確認 (ここでは簡略化のためリダイレクト先のみ確認)
}

func TestHandleApiUploadImage(t *testing.T) {
	env := setupTest(t)
	defer env.close()

	loginInfo := env.login(t)

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
	req.Header.Set("Cookie", loginInfo.Cookie)
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
func TestUpdateModifiedAt(t *testing.T) {
	env := setupTest(t)
	defer env.close()

	ctx := context.Background()
	oldTime := time.Date(2025, 1, 1, 12, 0, 0, 0, time.Local)

	// 1. Create entry
	entry, err := env.app.MainDB().Q.CreateEntry(ctx, maindb.CreateEntryParams{
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

	loginInfo := env.login(t)

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
	req.Header.Set("Cookie", loginInfo.Cookie)
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
	progReq.Header.Set("Cookie", loginInfo.Cookie)
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
	updated, err := env.app.MainDB().Q.GetEntryById(ctx, entry.ID)
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
func TestHandleAdminApiEntries(t *testing.T) {
	env := setupTest(t)
	defer env.close()

	// Insert 10 test entries
	for i := 1; i <= 10; i++ {
		_, err := env.db.Exec(`
			INSERT INTO entries (id, title, body, formatted_body, summary, image_url, path, format, date, created_at, modified_at, status)
			VALUES (?, ?, ?, '', '', '', ?, 'Markdown', '2025-01-01', ?, ?, 'public')
		`, i, fmt.Sprintf("Entry %d", i), fmt.Sprintf("Body %d", i), fmt.Sprintf("path/%d", i),
			time.Date(2025, 1, 1, 10, i, 0, 0, time.UTC), time.Date(2025, 1, 1, 10, i, 0, 0, time.UTC))
		if err != nil {
			t.Fatalf("failed to insert test data: %v", err)
		}
	}

	loginInfo := env.login(t)

	t.Run("List with limit", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodGet, "/admin/api/entries?limit=3", nil)
		req.Header.Set("Cookie", loginInfo.Cookie)
		rec := httptest.NewRecorder()
		env.server.ServeHTTP(rec, req)

		if rec.Code != http.StatusOK {
			t.Fatalf("want status 200, got %d: %s", rec.Code, rec.Body.String())
		}

		var res struct {
			Entries []maindb.Entry `json:"entries"`
			HasMore bool           `json:"has_more"`
		}
		if err := json.NewDecoder(rec.Body).Decode(&res); err != nil {
			t.Fatal(err)
		}

		if len(res.Entries) != 3 {
			t.Errorf("want 3 entries, got %d", len(res.Entries))
		}
		if !res.HasMore {
			t.Error("want has_more to be true")
		}
		// Should be in descending ID order
		if res.Entries[0].ID != 10 || res.Entries[1].ID != 9 || res.Entries[2].ID != 8 {
			t.Errorf("unexpected order or IDs: %d, %d, %d", res.Entries[0].ID, res.Entries[1].ID, res.Entries[2].ID)
		}
	})

	t.Run("Pagination with cursor", func(t *testing.T) {
		// First page
		req1 := httptest.NewRequest(http.MethodGet, "/admin/api/entries?limit=3", nil)
		req1.Header.Set("Cookie", loginInfo.Cookie)
		rec1 := httptest.NewRecorder()
		env.server.ServeHTTP(rec1, req1)

		var res1 struct {
			Entries []maindb.Entry `json:"entries"`
			HasMore bool           `json:"has_more"`
		}
		json.NewDecoder(rec1.Body).Decode(&res1)

		lastID := res1.Entries[len(res1.Entries)-1].ID // Should be 8

		// Second page
		req2 := httptest.NewRequest(http.MethodGet, fmt.Sprintf("/admin/api/entries?limit=3&cursor_id=%d", lastID), nil)
		req2.Header.Set("Cookie", loginInfo.Cookie)
		rec2 := httptest.NewRecorder()
		env.server.ServeHTTP(rec2, req2)

		var res2 struct {
			Entries []maindb.Entry `json:"entries"`
			HasMore bool           `json:"has_more"`
		}
		json.NewDecoder(rec2.Body).Decode(&res2)

		if len(res2.Entries) != 3 {
			t.Errorf("want 3 entries on second page, got %d", len(res2.Entries))
		}
		if res2.Entries[0].ID != 7 {
			t.Errorf("want first entry ID on second page to be 7, got %d", res2.Entries[0].ID)
		}
	})

	t.Run("Search by title", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodGet, "/admin/api/entries?q=Entry+5", nil)
		req.Header.Set("Cookie", loginInfo.Cookie)
		rec := httptest.NewRecorder()
		env.server.ServeHTTP(rec, req)

		var res struct {
			Entries []maindb.Entry `json:"entries"`
			HasMore bool           `json:"has_more"`
		}
		json.NewDecoder(rec.Body).Decode(&res)

		if len(res.Entries) != 1 {
			t.Errorf("want 1 search result, got %d", len(res.Entries))
		}
		if res.Entries[0].Title != "Entry 5" {
			t.Errorf("want 'Entry 5', got '%s'", res.Entries[0].Title)
		}
	})

	t.Run("Search by body", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodGet, "/admin/api/entries?q=Body+3", nil)
		req.Header.Set("Cookie", loginInfo.Cookie)
		rec := httptest.NewRecorder()
		env.server.ServeHTTP(rec, req)

		var res struct {
			Entries []maindb.Entry `json:"entries"`
			HasMore bool           `json:"has_more"`
		}
		json.NewDecoder(rec.Body).Decode(&res)

		if len(res.Entries) != 1 {
			t.Errorf("want 1 search result, got %d", len(res.Entries))
		}
		if res.Entries[0].Body != "Body 3" {
			t.Errorf("want 'Body 3', got '%s'", res.Entries[0].Body)
		}
	})
}
func TestHandleAdminApiEntry(t *testing.T) {
	env := setupTest(t)
	defer env.close()

	_, err := env.db.Exec(`INSERT INTO entries (id, title, body, formatted_body, path, format, date, created_at, modified_at) VALUES (100, 'T', 'B', 'FB', 'p', 'Markdown', '2025-01-01', '2025-01-01 10:00:00', '2025-01-01 10:00:00')`)
	if err != nil {
		t.Fatal(err)
	}

	loginInfo := env.login(t)
	req := httptest.NewRequest(http.MethodGet, "/admin/api/entry/100", nil)
	req.Header.Set("Cookie", loginInfo.Cookie)
	rec := httptest.NewRecorder()
	env.server.ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Errorf("want 200, got %d", rec.Code)
	}
	var entry maindb.Entry
	if err := json.NewDecoder(rec.Body).Decode(&entry); err != nil {
		t.Fatal(err)
	}
	if entry.ID != 100 {
		t.Errorf("want ID 100, got %d", entry.ID)
	}
}
func TestHandleAdminApiJobs(t *testing.T) {
	env := setupTest(t)
	defer env.close()

	loginInfo := env.login(t)
	req := httptest.NewRequest(http.MethodGet, "/admin/api/jobs", nil)
	req.Header.Set("Cookie", loginInfo.Cookie)
	rec := httptest.NewRecorder()
	env.server.ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Errorf("want 200, got %d", rec.Code)
	}
	var res struct {
		Jobs  interface{} `json:"jobs"`
		Total int64       `json:"total"`
	}
	if err := json.NewDecoder(rec.Body).Decode(&res); err != nil {
		t.Fatal(err)
	}
}
func TestHandleAdminApiImages(t *testing.T) {
	env := setupTest(t)
	defer env.close()

	loginInfo := env.login(t)
	req := httptest.NewRequest(http.MethodGet, "/admin/api/images", nil)
	req.Header.Set("Cookie", loginInfo.Cookie)
	rec := httptest.NewRecorder()
	env.server.ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Errorf("want 200, got %d", rec.Code)
	}
	var res struct {
		Images interface{} `json:"images"`
		Total  int64       `json:"total"`
	}
	if err := json.NewDecoder(rec.Body).Decode(&res); err != nil {
		t.Fatal(err)
	}
}
func TestHandleAdminApiR2Usage(t *testing.T) {
	env := setupTest(t)
	defer env.close()

	loginInfo := env.login(t)
	req := httptest.NewRequest(http.MethodGet, "/admin/api/r2/usage", nil)
	req.Header.Set("Cookie", loginInfo.Cookie)
	rec := httptest.NewRecorder()
	env.server.ServeHTTP(rec, req)

	// R2 API calls might fail in test environment, but the handler should be called.
	// We check if it returns 200 or 500 depending on mock/real config.
	if rec.Code != http.StatusOK && rec.Code != http.StatusInternalServerError {
		t.Errorf("unexpected status %d", rec.Code)
	}
}
func TestHandleAdminApiSimilarImages(t *testing.T) {
	env := setupTest(t)
	defer env.close()

	_, err := env.imagesDB.Exec(`INSERT INTO images (id, uri, entry_id, sig) VALUES (300, 'http://e.com/i.jpg', 1, x'0101010101010101')`)
	if err != nil {
		t.Fatal(err)
	}

	loginInfo := env.login(t)
	req := httptest.NewRequest(http.MethodGet, "/admin/api/image/300/similar", nil)
	req.Header.Set("Cookie", loginInfo.Cookie)
	rec := httptest.NewRecorder()
	env.server.ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Errorf("want 200, got %d", rec.Code)
	}
	var res struct {
		Similar interface{} `json:"similar"`
	}
	if err := json.NewDecoder(rec.Body).Decode(&res); err != nil {
		t.Fatal(err)
	}
}
func TestHandleAdminApiInfo(t *testing.T) {
	env := setupTest(t)
	defer env.close()

	loginInfo := env.login(t)
	req := httptest.NewRequest(http.MethodGet, "/admin/api/info", nil)
	req.Header.Set("Cookie", loginInfo.Cookie)
	rec := httptest.NewRecorder()
	env.server.ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Errorf("want 200, got %d", rec.Code)
	}
	var info InfoData
	if err := json.NewDecoder(rec.Body).Decode(&info); err != nil {
		t.Fatal(err)
	}
	if info.Config["username"] != env.app.Config().Username {
		t.Errorf("config mismatch: %v", info.Config["username"])
	}
}
func TestHandleAdminApiCache(t *testing.T) {
	env := setupTest(t)
	defer env.close()

	loginInfo := env.login(t)

	// 1. Insert test cache data
	ctx := context.Background()
	err := env.app.CacheService().Set(ctx, "/test1", []byte("content1"), "etag1", "text/html", []string{"source1"})
	require.NoError(t, err)
	err = env.app.CacheService().Set(ctx, "/test2", []byte("content2-longer"), "etag2", "text/plain", []string{"source2"})
	require.NoError(t, err)

	t.Run("Get Stats", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodGet, "/admin/api/cache/stats", nil)
		req.Header.Set("Cookie", loginInfo.Cookie)
		rec := httptest.NewRecorder()
		env.server.ServeHTTP(rec, req)

		require.Equal(t, http.StatusOK, rec.Code)
		var res map[string]interface{}
		err := json.NewDecoder(rec.Body).Decode(&res)
		require.NoError(t, err)

		stats := res["stats"].(map[string]interface{})
		require.Equal(t, float64(2), stats["total_count"])
		require.NotNil(t, res["metadata"])
		// total_size might be returned as string or number depending on how json.Unmarshal handles interface{}
		// but since we used COALESCE(SUM(LENGTH(content)), 0), it should be a number.
		// However, sqlc generated TotalSize as interface{}.
	})

	t.Run("List Entries", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodGet, "/admin/api/cache/list", nil)
		req.Header.Set("Cookie", loginInfo.Cookie)
		rec := httptest.NewRecorder()
		env.server.ServeHTTP(rec, req)

		require.Equal(t, http.StatusOK, rec.Code)
		var res struct {
			Entries []map[string]interface{} `json:"entries"`
		}
		err := json.NewDecoder(rec.Body).Decode(&res)
		require.NoError(t, err)

		require.Len(t, res.Entries, 2)
	})

	t.Run("Purge Specific Key", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodPost, "/admin/api/cache/purge?key=/test1", nil)
		req.Header.Set("Cookie", loginInfo.Cookie)
		req.Header.Set("X-Requested-With", "fetch")
		rec := httptest.NewRecorder()
		env.server.ServeHTTP(rec, req)

		require.Equal(t, http.StatusOK, rec.Code)

		// Verify deletion
		cache, err := env.app.CacheService().Get(ctx, "/test1")
		require.Error(t, err)
		require.Empty(t, cache.CacheKey)
	})

	t.Run("Purge All", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodPost, "/admin/api/cache/purge", nil)
		req.Header.Set("Cookie", loginInfo.Cookie)
		req.Header.Set("X-Requested-With", "fetch")
		rec := httptest.NewRecorder()
		env.server.ServeHTTP(rec, req)

		require.Equal(t, http.StatusOK, rec.Code)

		// Verify all deleted
		reqStats := httptest.NewRequest(http.MethodGet, "/admin/api/cache/stats", nil)
		reqStats.Header.Set("Cookie", loginInfo.Cookie)
		recStats := httptest.NewRecorder()
		env.server.ServeHTTP(recStats, reqStats)

		var res map[string]interface{}
		json.NewDecoder(recStats.Body).Decode(&res)
		stats := res["stats"].(map[string]interface{})
		require.Equal(t, float64(0), stats["total_count"])
	})
}
