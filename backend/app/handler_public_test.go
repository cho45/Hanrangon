package app

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

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
func TestCaching(t *testing.T) {
	env := setupTest(t)
	defer func() {
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
	_ = env.app.CacheService().InvalidateBySourceID(context.Background(), "entry:1") // ID is likely 1 (auto-increment)
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
