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

	"github.com/PuerkitoBio/goquery"
	"github.com/cho45/hanrangon/backend/model/maindb"
	"github.com/labstack/echo/v4"
	"github.com/stretchr/testify/require"
)

func TestHandleIndex(t *testing.T) {
	env := setupTest(t)
	defer env.close()

	// Insert test data
	_, err := env.db.Exec(`
		INSERT INTO entries (title, body, formatted_body, summary, image_url, path, format, date, created_at, modified_at)
		VALUES
		('Test Entry 1', 'Body 1', '<p>Formatted Body 1</p>', 'Summary 1', '', '2025/01/01/1', 'Markdown', '2025-01-01', '2025-01-01 10:00:00', '2025-01-01 10:00:00'),
		('Test Entry 2', 'Body 2', '<p>Formatted Body 2</p>', 'Summary 2', '', '2025/01/01/2', 'Markdown', '2025-01-01', '2025-01-01 12:00:00', '2025-01-01 12:00:00')
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

	linkHeader := rec.Header().Get("Link")
	if !strings.Contains(linkHeader, "</css/style.css>; rel=preload; as=style") {
		t.Errorf("Link header does not contain style.css preload, got: %s", linkHeader)
	}

	doc := mustParseHTML(t, rec.Body.String())
	if doc.Find("title").Text() != "氾濫原" {
		t.Errorf("title = %v, want 氾濫原", doc.Find("title").Text())
	}
	if !strings.Contains(doc.Find("h2").Text(), "Test Entry 1") {
		t.Errorf("h2 does not contain 'Test Entry 1'")
	}
	if doc.Find("article .content").First().Text() == "" {
		t.Errorf("body does not contain formatted body")
	}

	t.Run("HEAD request", func(t *testing.T) {
		// Enable page cache to get ETag
		env.app.Config().PageCacheEnabled = true
		defer func() { env.app.Config().PageCacheEnabled = false }()

		req := httptest.NewRequest(http.MethodHead, "/", nil)
		rec := httptest.NewRecorder()
		env.server.ServeHTTP(rec, req)

		if rec.Code != http.StatusOK {
			t.Errorf("want status 200, got %d", rec.Code)
		}

		if rec.Header().Get("ETag") == "" && rec.Header().Get("X-Cache") != "HIT" {
			t.Error("ETag header missing")
		}

		if rec.Body.Len() > 0 {
			t.Errorf("body should be empty, got %d bytes", rec.Body.Len())
		}
	})
}

func TestHandleIndex_SimilarImagesBulkFallback(t *testing.T) {
	env := setupTest(t)
	defer env.close()

	// 1. Create two entries that will appear on the index page
	_, err := env.db.Exec(`
		INSERT INTO entries (id, title, body, formatted_body, summary, image_url, path, format, date, created_at, modified_at)
		VALUES
		(100, '[test] Entry A', 'Body A', '', '', '', '2025/01/01/a', 'Markdown', '2025-01-01', '2025-01-01 10:00:00', '2025-01-01 10:00:00'),
		(101, '[test] Entry B', 'Body B', '', '', '', '2025/01/01/b', 'Markdown', '2025-01-01', '2025-01-01 11:00:00', '2025-01-01 11:00:00')
	`)
	if err != nil {
		t.Fatal(err)
	}

	// 2. Add images that are similar via ngrams
	_, err = env.imagesDB.Exec(`
		INSERT INTO images (id, uri, entry_id, sig) VALUES
		(200, 'http://example.com/imgA.jpg', 100, x'0101010101010101'),
		(201, 'http://example.com/imgB.jpg', 101, x'0101010101010101')
	`)
	if err != nil {
		t.Fatal(err)
	}
	_, err = env.imagesDB.Exec(`
		INSERT INTO ngram (image_id, word) VALUES
		(200, 1),
		(201, 1)
	`)
	if err != nil {
		t.Fatal(err)
	}

	// 2.5 Add cache records (since we now use cache)
	_, err = env.imagesDB.Exec(`
		INSERT INTO similar_images (image_id, similar_image_id, score, jaccard) VALUES
		(200, 201, 1, 1.0),
		(201, 200, 1, 1.0)
	`)
	if err != nil {
		t.Fatal(err)
	}

	// 3. Request index page
	req := httptest.NewRequest(http.MethodGet, "/", nil)
	rec := httptest.NewRecorder()
	env.server.ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("want status 200, got %d", rec.Code)
	}

	doc := mustParseHTML(t, rec.Body.String())

	// 4. Verify that Entry A shows Entry B as similar image, and vice versa
	h2Text := doc.Find("h2").Text()
	if !strings.Contains(h2Text, "Entry A") || !strings.Contains(h2Text, "Entry B") {
		t.Fatal("Entries not found in index h2 tags")
	}

	if doc.Find("img[src='http://example.com/imgB.jpg']").Length() == 0 {
		t.Error("body does not contain similar image B (linked from A)")
	}
	if doc.Find("img[src='http://example.com/imgA.jpg']").Length() == 0 {
		t.Error("body does not contain similar image A (linked from B)")
	}
	if !strings.Contains(doc.Find("h3").Text(), "関連エントリー (画像)") {
		t.Error("h3 tags do not contain '関連エントリー (画像)'")
	}
}

func TestHandleIndex_Adaptive(t *testing.T) {
	env := setupTest(t)
	defer env.close()

	// 1. 11日分の日付を用意し、最初の日(今日)に12件のエントリを入れる
	// これにより、アダプティブロジックは最小日数(3日)まで削減しようとするはず
	now := time.Now()
	for i := 0; i < 12; i++ {
		dateStr := now.Format("2006-01-02")
		path := fmt.Sprintf("entry-%d", i)
		_, err := env.db.Exec(`
			INSERT INTO entries (title, body, formatted_body, summary, image_url, path, format, date, created_at, modified_at, status)
			VALUES (?, ?, '', '', '', ?, 'Markdown', ?, ?, ?, 'public')
		`, fmt.Sprintf("Entry %d", i), "Body", path, dateStr, now.Add(time.Duration(i)*time.Second), now, "public")
		if err != nil {
			t.Fatalf("failed to insert test data: %v", err)
		}
	}

	// 2. さらに10日分、各1件ずつエントリを入れる
	for i := 1; i <= 10; i++ {
		date := now.AddDate(0, 0, -i)
		dateStr := date.Format("2006-01-02")
		path := fmt.Sprintf("old-entry-%d", i)
		_, err := env.db.Exec(`
			INSERT INTO entries (title, body, formatted_body, summary, image_url, path, format, date, created_at, modified_at, status)
			VALUES (?, ?, '', '', '', ?, 'Markdown', ?, ?, ?, 'public')
		`, fmt.Sprintf("Old Entry %d", i), "Body", path, dateStr, date, date, "public")
		if err != nil {
			t.Fatalf("failed to insert test data: %v", err)
		}
	}

	req := httptest.NewRequest(http.MethodGet, "/", nil)
	rec := httptest.NewRecorder()
	env.server.ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("want status 200, got %d", rec.Code)
	}

	doc := mustParseHTML(t, rec.Body.String())

	// しきい値10に対して初日だけで12件あるので、
	// ロジックでは d=10 から減らしていき、totalEntries > 10 なので d は減り続ける。
	// 最終的に minDays = 3 になるはず。

	// 3日分が表示されているか確認
	h2Text := doc.Find("h2").Text()
	if !strings.Contains(h2Text, "Entry 11") {
		t.Error("h2 tags should contain Entry 11 (from the first day)")
	}

	// 4日目のエントリが含まれていないことを確認 (Old Entry 3 は 3日前のデータ)
	if strings.Contains(h2Text, "Old Entry 3") {
		t.Error("h2 tags should NOT contain 'Old Entry 3' due to adaptive reduction")
	}

	// OlderPage リンクが生成されているか確認
	if doc.Find(".pager a[rel='next']").Length() == 0 {
		t.Error("OlderPage link should be generated")
	}
}

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

func TestHandleEntry(t *testing.T) {
	env := setupTest(t)
	defer env.close()

	_, err := env.db.Exec(`
		INSERT INTO entries (title, body, formatted_body, summary, image_url, path, format, date, created_at, modified_at)
		VALUES
		('Test Entry 1', 'Body 1', '<p>Formatted Body 1</p>', 'Summary 1', '', '2025/01/01/1', 'Markdown', '2025-01-01', '2025-01-01 10:00:00', '2025-01-01 10:00:00'),
		('Test Entry 2', 'Body 2', '<p>Formatted Body 2</p>', 'Summary 2', '', '2025/01/01/2', 'Markdown', '2025-01-01', '2025-01-01 12:00:00', '2025-01-01 12:00:00')
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

		doc := mustParseHTML(t, rec.Body.String())
		if doc.Find("title").Text() != "Test Entry 1 - 氾濫原" {
			t.Errorf("title = %v, want 'Test Entry 1 - 氾濫原'", doc.Find("title").Text())
		}
		if !strings.Contains(doc.Find("h2").Text(), "Test Entry 1") {
			t.Errorf("h2 does not contain 'Test Entry 1'")
		}
		// Prev/Next links
		pagerText := doc.Find(".pager").Text()
		if !strings.Contains(pagerText, "Test Entry 2") {
			t.Errorf("pager does not contain next entry link 'Test Entry 2'")
		}

		// Check JSON-LD
		script := doc.Find("script[type='application/ld+json']")
		if script.Length() == 0 {
			t.Errorf("script[type='application/ld+json'] not found in response")
		} else {
			jsonLD := strings.TrimSpace(script.Text())
			var ld map[string]any
			if err := json.Unmarshal([]byte(jsonLD), &ld); err != nil {
				t.Errorf("Failed to unmarshal JSON-LD: %v\nContent: %q", err, jsonLD)
			}
			if ld["headline"] != "Test Entry 1" {
				t.Errorf("JSON-LD headline = %v, want %v", ld["headline"], "Test Entry 1")
			}
			if ld["@type"] != "BlogPosting" {
				t.Errorf("JSON-LD @type = %v, want BlogPosting", ld["@type"])
			}
		}
	})

	t.Run("HEAD request", func(t *testing.T) {
		// Enable page cache to get ETag
		env.app.Config().PageCacheEnabled = true
		defer func() { env.app.Config().PageCacheEnabled = false }()

		req := httptest.NewRequest(http.MethodHead, "/2025/01/01/1", nil)
		rec := httptest.NewRecorder()
		env.server.ServeHTTP(rec, req)

		if rec.Code != http.StatusOK {
			t.Errorf("want status 200, got %d", rec.Code)
		}

		if rec.Header().Get("ETag") == "" && rec.Header().Get("X-Cache") != "HIT" {
			t.Error("ETag header missing")
		}

		if rec.Body.Len() > 0 {
			t.Errorf("body should be empty, got %d bytes", rec.Body.Len())
		}
	})

	t.Run("Entry with similar entries", func(t *testing.T) {
		// Insert another entry and a relationship
		_, err := env.db.Exec(`
			INSERT INTO entries (id, title, body, formatted_body, summary, image_url, path, format, date, created_at, modified_at)
			VALUES (3, 'Similar Entry', 'Body 3', '<p>Body 3</p>', 'Summary 3', '', '2025/01/01/3', 'Markdown', '2025-01-01', '2025-01-01 11:00:00', '2025-01-01 11:00:00')
		`)
		if err != nil {
			t.Fatal(err)
		}
		_, err = env.tfidfDB.Exec(`
			INSERT INTO related_entries (entry_id, related_entry_id, score)
			VALUES (1, 3, 0.9)
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
		if !strings.Contains(body, "<h3>関連エントリー</h3>") {
			t.Errorf("body does not contain '関連エントリー' header")
		}
		if !strings.Contains(body, "Similar Entry") {
			t.Errorf("body does not contain similar entry title 'Similar Entry'")
		}
		if !strings.Contains(body, "data-score=\"0.900000\"") {
			t.Errorf("body does not contain similar entry score")
		}
	})

	t.Run("Entry with similar images fallback", func(t *testing.T) {
		// Entry 4 with an image, and Entry 5 which is similar via image ngram
		_, err := env.db.Exec(`
			INSERT INTO entries (id, title, body, formatted_body, summary, image_url, path, format, date, created_at, modified_at)
			VALUES 
			(4, 'Image Entry 4', 'Body 4', '', '', '', '2025/01/01/4', 'Markdown', '2025-01-01', '2025-01-01 12:00:00', '2025-01-01 12:00:00'),
			(5, 'Image Entry 5', 'Body 5', '', '', '', '2025/01/01/5', 'Markdown', '2025-01-01', '2025-01-01 13:00:00', '2025-01-01 13:00:00')
		`)
		if err != nil {
			t.Fatal(err)
		}
		_, err = env.imagesDB.Exec(`
			INSERT INTO images (id, uri, entry_id, sig) VALUES
			(10, 'http://example.com/img4.jpg', 4, x'0101010101010101'),
			(11, 'http://example.com/img5.jpg', 5, x'0101010101010101')
		`)
		if err != nil {
			t.Fatal(err)
		}
		_, err = env.imagesDB.Exec(`
			INSERT INTO ngram (image_id, word) VALUES
			(10, 1),
			(11, 1)
		`)
		if err != nil {
			t.Fatal(err)
		}

		// 2.5 Add cache records
		_, err = env.imagesDB.Exec(`
			INSERT INTO similar_images (image_id, similar_image_id, score, jaccard) VALUES
			(10, 11, 1, 1.0),
			(11, 10, 1, 1.0)
		`)
		if err != nil {
			t.Fatal(err)
		}

		req := httptest.NewRequest(http.MethodGet, "/2025/01/01/4", nil)
		rec := httptest.NewRecorder()
		env.server.ServeHTTP(rec, req)

		doc := mustParseHTML(t, rec.Body.String())
		if !strings.Contains(doc.Find("h3").Text(), "関連エントリー (画像)") {
			t.Errorf("h3 tags do not contain '関連エントリー (画像)'")
		}
		if doc.Find("img[src='http://example.com/img5.jpg']").Length() == 0 {
			t.Errorf("body does not contain related image URL")
		}
		if doc.Find("a[href='/2025/01/01/5']").Length() == 0 {
			t.Errorf("body does not contain link to related image entry")
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

func TestHandleEntry_DateHeader(t *testing.T) {
	env := setupTest(t)
	defer env.close()

	// テストデータの挿入
	_, err := env.db.Exec(`
		INSERT INTO entries (title, body, formatted_body, summary, image_url, path, format, date, created_at, modified_at)
		VALUES
		('Test Entry Date Header', 'Body', '<p>Formatted Body</p>', 'Summary', '', '2025/01/01/date-header-test', 'Markdown', '2025-01-01', '2025-01-01 10:00:00', '2025-01-01 10:00:00')
	`)
	if err != nil {
		t.Fatalf("failed to insert test data: %v", err)
	}

	req := httptest.NewRequest(http.MethodGet, "/2025/01/01/date-header-test", nil)
	rec := httptest.NewRecorder()
	env.server.ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("want status 200, got %d", rec.Code)
	}

	doc := mustParseHTML(t, rec.Body.String())
	// 日付見出し (class="date") が含まれているか確認
	// view/helper.go の FormatDate("2025-01-01") は "2025年 01月 01日" を返す
	dateHeader := doc.Find(".date a")
	if dateHeader.Length() == 0 {
		t.Errorf("body does not contain date header")
	} else {
		if dateHeader.AttrOr("href", "") != "/2025/01/01/" {
			t.Errorf("date header href = %v, want /2025/01/01/", dateHeader.AttrOr("href", ""))
		}
		if !strings.Contains(dateHeader.Text(), "2025年 01月 01日") {
			t.Errorf("date header text = %v, want contains 2025年 01月 01日", dateHeader.Text())
		}
	}
}

func TestHandleArchive(t *testing.T) {
	env := setupTest(t)
	defer env.close()

	_, err := env.db.Exec(`
		INSERT INTO entries (title, body, formatted_body, summary, image_url, path, format, date, created_at, modified_at)
		VALUES
		('Entry 1', 'Body 1', '', '', '', '2025/01/01/1', 'Markdown', '2025-01-01', '2025-01-01 10:00:00', '2025-01-01 10:00:00'),
		('Entry 2', 'Body 2', '', '', '', '2025/01/02/1', 'Markdown', '2025-01-02', '2025-01-02 10:00:00', '2025-01-02 10:00:00'),
		('Entry 3', 'Body 3', '', '', '', '2024/12/31/1', 'Markdown', '2024-12-31', '2024-12-31 10:00:00', '2024-12-31 10:00:00')
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

	doc := mustParseHTML(t, rec.Body.String())
	if doc.Find("title").Text() != "アーカイブ - 氾濫原" {
		t.Errorf("title = %v, want 'アーカイブ - 氾濫原'", doc.Find("title").Text())
	}
	// 2025年 (2 entries), 2024年 (1 entry)
	yearText := doc.Find("#archive h2").Text()
	if !strings.Contains(yearText, "2025年") {
		t.Errorf("archive years do not contain '2025年'")
	}
	if !strings.Contains(yearText, "2024年") {
		t.Errorf("archive years do not contain '2024年'")
	}
	if !strings.Contains(doc.Find(".month a").Text(), "01月") {
		t.Errorf("archive months do not contain '01月'")
	}
}

func TestHandleDateArchive(t *testing.T) {
	env := setupTest(t)
	defer env.close()

	_, err := env.db.Exec(`
		INSERT INTO entries (title, body, formatted_body, summary, image_url, path, format, date, created_at, modified_at)
		VALUES
		('Entry 2025-01-01', 'Body', '', '', '', '2025/01/01/1', 'Markdown', '2025-01-01', '2025-01-01 10:00:00', '2025-01-01 10:00:00'),
		('Entry 2025-01-02', 'Body', '', '', '', '2025/01/02/1', 'Markdown', '2025-01-02', '2025-01-02 10:00:00', '2025-01-02 10:00:00'),
		('Entry 2025-02-01', 'Body', '', '', '', '2025/02/01/1', 'Markdown', '2025-02-01', '2025-02-01 10:00:00', '2025-02-01 10:00:00'),
		('Entry 2024-12-31', 'Body', '', '', '', '2024/12/31/1', 'Markdown', '2024-12-31', '2024-12-31 10:00:00', '2024-12-31 10:00:00')
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

			doc := mustParseHTML(t, rec.Body.String())
			h2Text := doc.Find("h2").Text()
			for _, title := range tt.wantTitles {
				if !strings.Contains(h2Text, title) {
					t.Errorf("path %s: h2 tags do not contain '%s'", tt.path, title)
				}
			}
			for _, title := range tt.notTitles {
				if strings.Contains(h2Text, title) {
					t.Errorf("path %s: h2 tags SHOULD NOT contain '%s'", tt.path, title)
				}
			}
		})
	}
}

func TestHandleCategory(t *testing.T) {
	env := setupTest(t)
	defer env.close()

	_, err := env.db.Exec(`
		INSERT INTO entries (title, body, formatted_body, summary, image_url, path, format, date, created_at, modified_at)
		VALUES
		('[test] Tagged Entry', 'Body', '', '', '', '2025/01/01/1', 'Markdown', '2025-01-01', '2025-01-01 10:00:00', '2025-01-01 10:00:00'),
		('Normal Entry', 'Body', '', '', '', '2025/01/02/1', 'Markdown', '2025-01-02', '2025-01-02 10:00:00', '2025-01-02 10:00:00')
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

	doc := mustParseHTML(t, rec.Body.String())
	// ParseTitle separates tags, so we look for the tag link and the clean title
	// Structure: <a href="/test/"><span>test</span></a>
	if doc.Find(".metadata .tags span").First().Text() != "test" {
		t.Errorf("body does not contain tag link for 'test': got %v", doc.Find(".metadata .tags span").First().Text())
	}
	if !strings.Contains(doc.Find("h2").Text(), "Tagged Entry") {
		t.Errorf("h2 tags do not contain clean title 'Tagged Entry'")
	}
	if strings.Contains(doc.Find("h2").Text(), "Normal Entry") {
		t.Errorf("h2 tags SHOULD NOT contain normal entry")
	}
}

func TestHandleFeed(t *testing.T) {
	env := setupTest(t)
	defer env.close()

	_, err := env.db.Exec(`
		INSERT INTO entries (title, body, formatted_body, summary, image_url, path, format, date, created_at, modified_at)
		VALUES
		('Feed Entry 1', 'Body', '<p>Body</p>', 'Summary', '', '2025/01/01/1', 'Markdown', '2025-01-01', '2025-01-01 10:00:00', '2025-01-01 10:00:00')
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
		INSERT INTO entries (title, body, formatted_body, summary, image_url, path, format, date, created_at, modified_at)
		VALUES
		('Sitemap Entry 1', 'Body', '', '', '', '2025/01/01/1', 'Markdown', '2025-01-01', '2025-01-01 10:00:00', '2025-01-01 10:00:00')
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
	if !strings.Contains(body, "<loc>http://localhost:5555/2025/01/01/1</loc>") {
		t.Errorf("body does not contain entry location")
	}
}

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

func TestCaching(t *testing.T) {
	env := setupTest(t)
	defer func() {
		env.app.(*AppImpl).cacheWg.Wait()
		env.close()
	}()

	// Enable page cache
	env.app.Config().PageCacheEnabled = true

	// Insert test data with specific modified_at
	modTimeStr := "2025-01-01 12:00:00"
	_, err := env.db.Exec(`
		INSERT INTO entries (title, body, formatted_body, summary, image_url, path, format, date, created_at, modified_at, status)
		VALUES
		('Cache Entry', 'Body', '<p>Body</p>', '', '', '2025/01/01/cache', 'Markdown', '2025-01-01', '2025-01-01 10:00:00', ?, 'public')
	`, modTimeStr)
	if err != nil {
		t.Fatalf("failed to insert test data: %v", err)
	}

	targetURL := "/2025/01/01/cache"

	// 1. First request: Should have ETag and Last-Modified (MISS)
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

	// 2. Second request with If-None-Match (ETag) -> 304 (HIT)
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

	// 3. Third request with If-Modified-Since (Last-Modified) -> 304 (HIT)
	req3 := httptest.NewRequest(http.MethodGet, targetURL, nil)
	req3.Header.Set("If-Modified-Since", lastModified)
	rec3 := httptest.NewRecorder()
	env.server.ServeHTTP(rec3, req3)

	if rec3.Code != http.StatusNotModified {
		t.Errorf("want status 304 for Last-Modified match, got %d", rec3.Code)
	}

	// 4. Update entry (invalidate cache) and request with old ETag -> 200 and new ETag
	// Invalidate cache explicitly (simulating job)
	err = env.app.CacheService().InvalidateBySourceID(context.Background(), "entry:1") // ID is likely 1 (auto-increment)
	// Or we can fetch ID first
	var id int64
	env.db.QueryRow("SELECT id FROM entries WHERE path = '2025/01/01/cache'").Scan(&id)
	err = env.app.CacheService().InvalidateBySourceID(context.Background(), fmt.Sprintf("entry:%d", id))
	require.NoError(t, err)

	// Update content to change ETag
	_, err = env.db.Exec(`UPDATE entries SET formatted_body = '<p>Updated Body</p>' WHERE id = ?`, id)
	require.NoError(t, err)

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

func TestHandleApiSearch(t *testing.T) {
	env := setupTest(t)
	defer env.close()

	// 1. Insert test data with various statuses
	now := time.Now()
	_, err := env.db.Exec(`
		INSERT INTO entries (id, title, body, formatted_body, summary, image_url, path, format, date, created_at, modified_at, status, publish_at)
		VALUES
		(1, 'Public Apple', 'Apple test', '<p>Apple</p>', 'Apple', '', 'p1', 'Markdown', '2025-01-01', '2025-01-01 10:00:00', '2025-01-01 10:00:00', 'public', NULL),
		(2, 'Draft Apple', 'Apple draft', '<p>Apple</p>', 'Apple', '', 'p2', 'Markdown', '2025-01-01', '2025-01-01 11:00:00', '2025-01-01 11:00:00', 'draft', NULL),
		(3, 'Future Apple', 'Apple future', '<p>Apple</p>', 'Apple', '', 'p3', 'Markdown', '2025-01-01', '2025-01-01 12:00:00', '2025-01-01 12:00:00', 'public', ?),
		(4, 'Public Banana', 'Banana test', '<p>Banana</p>', 'Banana', '', 'p4', 'Markdown', '2025-01-01', '2025-01-01 13:00:00', '2025-01-01 13:00:00', 'public', NULL),
		(5, 'Apple and Banana', 'Mixed fruit', '<p>Apple Banana</p>', 'Apple Banana', '', 'p5', 'Markdown', '2025-01-01', '2025-01-01 14:00:00', '2025-01-01 14:00:00', 'public', NULL)
	`, now.Add(24*time.Hour).Format(time.RFC3339))
	if err != nil {
		t.Fatalf("failed to insert test data: %v", err)
	}

	// 2. Update TF-IDF index
	ctx := context.Background()
	calc := env.app.Calculator()
	calc.DFMaxThresholdRate = 1.0
	entryTexts := map[int64][2]string{
		1: {"Public Entry", "Apple"},
		2: {"Draft Entry", "Apple"},
		3: {"Future Entry", "Apple"},
		4: {"Other Entry", "Banana"},
		5: {"Mixed Entry", "Apple Banana"},
	}
	for id, txts := range entryTexts {
		if err := calc.UpdateTFIDF(ctx, id, txts[0], txts[1]); err != nil {
			t.Fatalf("failed to update tfidf %d: %v", id, err)
		}
	}
	if err := calc.RecalculateTFIDFValues(ctx, nil); err != nil {
		t.Fatalf("failed to recalculate tfidf: %v", err)
	}

	t.Run("Filtering and Ranking", func(t *testing.T) {
		// "Apple" should match entries 1, 2, 3, 5 but only 1 and 5 are public and past
		req := httptest.NewRequest(http.MethodGet, "/api/search?q=Apple", nil)
		rec := httptest.NewRecorder()
		env.server.ServeHTTP(rec, req)

		if rec.Code != http.StatusOK {
			t.Fatalf("want status 200, got %d", rec.Code)
		}

		var resp struct {
			Results []struct {
				ID    int64   `json:"id"`
				Title string  `json:"title"`
				Score float64 `json:"score"`
			} `json:"results"`
		}
		if err := json.Unmarshal(rec.Body.Bytes(), &resp); err != nil {
			t.Fatalf("failed to unmarshal: %v", err)
		}

		// Entries 1 and 5 should be returned.
		if len(resp.Results) < 1 {
			t.Errorf("expected at least 1 result, got %d. Results: %+v", len(resp.Results), resp.Results)
		}
	})

	t.Run("Multi-term Ranking (AND search)", func(t *testing.T) {
		// Searching for "Apple Banana" should return only Entry 5
		req := httptest.NewRequest(http.MethodGet, "/api/search?q=Apple+Banana", nil)
		rec := httptest.NewRecorder()
		env.server.ServeHTTP(rec, req)

		var resp struct {
			Results []struct {
				ID int64 `json:"id"`
			} `json:"results"`
		}
		json.Unmarshal(rec.Body.Bytes(), &resp)

		// Only Entry 5 has BOTH "Apple" and "Banana"
		if len(resp.Results) != 1 {
			t.Errorf("expected exactly 1 result (entry 5), got %d", len(resp.Results))
		} else if resp.Results[0].ID != 5 {
			t.Errorf("expected entry 5, got %d", resp.Results[0].ID)
		}
	})
}

func TestHandleRobotsTxt(t *testing.T) {
	env := setupTest(t)
	defer env.close()

	req := httptest.NewRequest(http.MethodGet, "/robots.txt", nil)
	rec := httptest.NewRecorder()
	env.server.ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Errorf("want 200, got %d", rec.Code)
	}
	body := rec.Body.String()
	if !strings.Contains(body, "User-agent: *") {
		t.Errorf("body does not contain User-agent")
	}
	if !strings.Contains(body, "Sitemap:") {
		t.Errorf("body does not contain Sitemap")
	}
}

func TestHandleSearch(t *testing.T) {
	env := setupTest(t)
	defer env.close()

	req := httptest.NewRequest(http.MethodGet, "/search", nil)
	rec := httptest.NewRecorder()
	env.server.ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Errorf("want 200, got %d", rec.Code)
	}
	doc := mustParseHTML(t, rec.Body.String())
	if doc.Find("title").Text() != "検索 - 氾濫原" {
		t.Errorf("title = %v, want '検索 - 氾濫原'", doc.Find("title").Text())
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
