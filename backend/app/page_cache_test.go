package app

import (
	"compress/gzip"
	"context"
	"io"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestPageCacheMiddleware_EndToEnd(t *testing.T) {
	env := setupTest(t)
	defer env.close()

	// ページキャッシュを有効化
	env.app.Config().PageCacheEnabled = true

	// テストデータ挿入
	_, err := env.db.Exec(`
		INSERT INTO entries (title, body, formatted_body, summary, image_url, path, format, date, created_at, modified_at, status)
		VALUES ('Test Entry', 'Body', '<p>Body</p>', 'Summary', '', '2025/01/01/1', 'Markdown', '2025-01-01', '2025-01-01 10:00:00', '2025-01-01 10:00:00', 'public')
	`)
	require.NoError(t, err)

	targetURL := "/2025/01/01/1"

	// 1. 初回リクエスト: MISS
	req1 := httptest.NewRequest(http.MethodGet, targetURL, nil)
	rec1 := httptest.NewRecorder()
	env.server.ServeHTTP(rec1, req1)

	assert.Equal(t, http.StatusOK, rec1.Code)
	assert.Equal(t, "MISS", rec1.Header().Get("X-Cache"))
	assert.NotEmpty(t, rec1.Header().Get("ETag"), "ETag should be returned even on MISS")
	assert.NotEmpty(t, rec1.Header().Get("Last-Modified"))
	assert.Contains(t, rec1.Body.String(), "Test Entry")

	// 2. 2回目リクエスト: HIT
	req2 := httptest.NewRequest(http.MethodGet, targetURL, nil)
	rec2 := httptest.NewRecorder()
	env.server.ServeHTTP(rec2, req2)

	assert.Equal(t, http.StatusOK, rec2.Code)
	assert.Equal(t, "HIT", rec2.Header().Get("X-Cache"), "Should HIT on second request")
	assert.Equal(t, rec1.Body.String(), rec2.Body.String())
	assert.Equal(t, rec1.Header().Get("ETag"), rec2.Header().Get("ETag"), "ETag should match")

	// 2.1 3回目リクエスト: HIT (Consistency check)
	req2_1 := httptest.NewRequest(http.MethodGet, targetURL, nil)
	rec2_1 := httptest.NewRecorder()
	env.server.ServeHTTP(rec2_1, req2_1)
	assert.Equal(t, "HIT", rec2_1.Header().Get("X-Cache"), "Should consistently HIT")

	// 3. ETag で 304 確認
	req304 := httptest.NewRequest(http.MethodGet, targetURL, nil)
	req304.Header.Set("If-None-Match", rec1.Header().Get("ETag"))
	rec304 := httptest.NewRecorder()
	env.server.ServeHTTP(rec304, req304)

	assert.Equal(t, http.StatusNotModified, rec304.Code)
	assert.Empty(t, rec304.Body.String())

	// 4. エントリ更新 (無効化)
	err = env.app.CacheService().InvalidateBySourceID(context.Background(), "entry:1")
	require.NoError(t, err)

	// 5. 3回目リクエスト: MISS (削除されたため)
	req3 := httptest.NewRequest(http.MethodGet, targetURL, nil)
	rec3 := httptest.NewRecorder()
	env.server.ServeHTTP(rec3, req3)

	assert.Equal(t, http.StatusOK, rec3.Code)
	assert.Equal(t, "MISS", rec3.Header().Get("X-Cache"))
}

func TestPageCacheMiddleware_CompressionConsistency(t *testing.T) {
	env := setupTest(t)
	defer env.close()

	env.app.Config().PageCacheEnabled = true

	// 十分に長いテキスト（1KB以上）を挿入してGzipをトリガーする
	longText := "This is a long text that should be compressed by Gzip middleware. "
	for len(longText) < 2000 {
		longText += "More content... "
	}

	_, err := env.db.Exec(`
		INSERT INTO entries (title, body, formatted_body, summary, image_url, path, format, date, created_at, modified_at, status)
		VALUES ('Long Entry', 'Body', ?, 'Summary', '', 'long-path', 'Markdown', '2025-01-01', '2025-01-01 10:00:00', '2025-01-01 10:00:00', 'public')
	`, longText)
	require.NoError(t, err)

	targetURL := "/long-path"

	// 1. Gzipを要求するリクエスト: MISS
	req1 := httptest.NewRequest(http.MethodGet, targetURL, nil)
	req1.Header.Set("Accept-Encoding", "gzip")
	rec1 := httptest.NewRecorder()
	env.server.ServeHTTP(rec1, req1)

	assert.Equal(t, http.StatusOK, rec1.Code)
	assert.Equal(t, "gzip", rec1.Header().Get("Content-Encoding"))
	assert.Equal(t, "MISS", rec1.Header().Get("X-Cache"))

	// 2. Gzipを要求しないリクエスト: HIT
	// 不具合がある場合、ここで gzip 圧縮されたデータがそのまま返ってきてしまう (Content-Encoding なしなのに中身がバイナリ)
	req2 := httptest.NewRequest(http.MethodGet, targetURL, nil)
	rec2 := httptest.NewRecorder()
	env.server.ServeHTTP(rec2, req2)

	assert.Equal(t, http.StatusOK, rec2.Code)
	assert.Contains(t, rec2.Header().Get("X-Cache"), "HIT")
	// Gzip を要求していないので Content-Encoding はなし (HIT-RAW または HIT-GZ を解凍して返却)
	assert.Equal(t, "", rec2.Header().Get("Content-Encoding"))

	// 中身が正しいプレーンテキストであることを検証
	assert.Contains(t, rec2.Body.String(), "Long Entry")
	assert.NotContains(t, rec2.Body.String(), "\x1f\x8b\x08") // Gzip magic number が含まれていないこと

	// 3. 逆に、Gzipを要求するリクエストで HIT した場合
	req3 := httptest.NewRequest(http.MethodGet, targetURL, nil)
	req3.Header.Set("Accept-Encoding", "gzip")
	rec3 := httptest.NewRecorder()
	env.server.ServeHTTP(rec3, req3)

	assert.Equal(t, http.StatusOK, rec3.Code)
	assert.Contains(t, rec3.Header().Get("X-Cache"), "HIT")
	assert.Equal(t, "gzip", rec3.Header().Get("Content-Encoding"))

	// 解凍して中身を検証
	gr, err := gzip.NewReader(rec3.Body)
	require.NoError(t, err)
	decompressed, err := io.ReadAll(gr)
	require.NoError(t, err)
	assert.Contains(t, string(decompressed), "Long Entry")
}

func TestPageCacheMiddleware_InvalidationScenario(t *testing.T) {
	env := setupTest(t)
	defer env.close()

	env.app.Config().PageCacheEnabled = true

	// 1. エントリ作成
	_, err := env.db.Exec(`
		INSERT INTO entries (id, title, body, formatted_body, summary, image_url, path, format, date, created_at, modified_at, status, publish_at)
		VALUES (100, 'Entry 100', 'Body', 'Formatted', 'Summary', '', 'path/100', 'Markdown', '2025-01-01', '2025-01-01 10:00:00', '2025-01-01 10:00:00', 'public', NULL)
	`)
	require.NoError(t, err)

	// 2. Indexページヘアクセスしてキャッシュ
	req1 := httptest.NewRequest(http.MethodGet, "/", nil)
	rec1 := httptest.NewRecorder()
	env.server.ServeHTTP(rec1, req1)
	assert.Equal(t, "MISS", rec1.Header().Get("X-Cache"))

	// 3. ヒット確認
	req2 := httptest.NewRequest(http.MethodGet, "/", nil)
	rec2 := httptest.NewRecorder()
	env.server.ServeHTTP(rec2, req2)
	assert.Contains(t, rec2.Header().Get("X-Cache"), "HIT")

	// 4. エントリ更新 (FinalizeEntry ジョブを模倣)
	err = env.app.CacheService().InvalidateBySourceID(context.Background(), "entry:100")
	require.NoError(t, err)

	// 5. Indexページが MISS になることを確認 (依存関係により削除された)
	req3 := httptest.NewRequest(http.MethodGet, "/", nil)
	rec3 := httptest.NewRecorder()
	env.server.ServeHTTP(rec3, req3)
	assert.Equal(t, "MISS", rec3.Header().Get("X-Cache"))
}

func TestPageCacheMiddleware_AuthUser(t *testing.T) {
	env := setupTest(t)
	defer env.close()

	env.app.Config().PageCacheEnabled = true

	// ログイン状態にする
	loginInfo := env.login(t)

	req := httptest.NewRequest(http.MethodGet, "/", nil)
	req.Header.Set("Cookie", loginInfo.Cookie)
	rec := httptest.NewRecorder()
	env.server.ServeHTTP(rec, req)

	// 認証済みユーザーはキャッシュヘッダーが付与されない
	assert.Equal(t, "", rec.Header().Get("X-Cache"))
}

func TestPageCacheMiddleware_OnTheFlyDecompression(t *testing.T) {
	env := setupTest(t)
	defer env.close()

	env.app.Config().PageCacheEnabled = true

	// Gzip圧縮が必要な長いテキスト
	longText := "This is a long text that should be compressed by Gzip middleware. "
	for len(longText) < 2000 {
		longText += "More content... "
	}

	_, err := env.db.Exec(`
		INSERT INTO entries (title, body, formatted_body, summary, image_url, path, format, date, created_at, modified_at, status)
		VALUES ('Decompress Entry', 'Body', ?, 'Summary', '', 'decompress-path', 'Markdown', '2025-01-01', '2025-01-01 10:00:00', '2025-01-01 10:00:00', 'public')
	`, longText)
	require.NoError(t, err)

	targetURL := "/decompress-path"

	// 1. Gzipリクエスト (MISS -> Sync Gzip Save -> Raw Content Nullified)
	req1 := httptest.NewRequest(http.MethodGet, targetURL, nil)
	req1.Header.Set("Accept-Encoding", "gzip")
	rec1 := httptest.NewRecorder()
	env.server.ServeHTTP(rec1, req1)
	assert.Equal(t, "MISS", rec1.Header().Get("X-Cache"))

	// DBの状態を確認: RawキャッシュのContentがNULLになっているはず
	rawKey := targetURL + ":raw"
	rawCache, err := env.app.CacheService().Get(context.Background(), rawKey)
	require.NoError(t, err)
	assert.Nil(t, rawCache.Content, "Raw cache content should be NULL to save space")

	// 2. 非Gzipリクエスト (HIT -> On-the-fly Decompression)
	req2 := httptest.NewRequest(http.MethodGet, targetURL, nil)
	rec2 := httptest.NewRecorder()
	env.server.ServeHTTP(rec2, req2)

	assert.Equal(t, http.StatusOK, rec2.Code)
	assert.Contains(t, rec2.Header().Get("X-Cache"), "HIT")
	assert.Equal(t, "", rec2.Header().Get("Content-Encoding")) // No Gzip
	assert.Contains(t, rec2.Body.String(), "Decompress Entry")
}

func TestPageCacheMiddleware_Consistency(t *testing.T) {
	env := setupTest(t)
	defer env.close()

	env.app.Config().PageCacheEnabled = true

	_, err := env.db.Exec(`
		INSERT INTO entries (title, body, formatted_body, summary, image_url, path, format, date, created_at, modified_at, status)
		VALUES ('Consistency Entry', 'Body', '<p>Body</p>', 'Summary', '', 'consistency-test', 'Markdown', '2025-01-01', '2025-01-01 10:00:00', '2025-01-01 10:00:00', 'public')
	`)
	require.NoError(t, err)

	targetURL := "/consistency-test"

	// 1. First request: MISS, but MUST have ETag
	req1 := httptest.NewRequest(http.MethodGet, targetURL, nil)
	req1.Header.Set("Accept-Encoding", "gzip")
	rec1 := httptest.NewRecorder()
	env.server.ServeHTTP(rec1, req1)

	assert.Equal(t, "MISS", rec1.Header().Get("X-Cache"))
	etag1 := rec1.Header().Get("ETag")
	assert.NotEmpty(t, etag1, "ETag must be present on first MISS")
	assert.Contains(t, etag1, ":gzip", "ETag must have :gzip suffix when response is gzipped")

	// 2. Second request: MUST be HIT
	req2 := httptest.NewRequest(http.MethodGet, targetURL, nil)
	req2.Header.Set("Accept-Encoding", "gzip")
	rec2 := httptest.NewRecorder()
	env.server.ServeHTTP(rec2, req2)

	assert.Equal(t, "HIT", rec2.Header().Get("X-Cache"), "Second request must be a HIT")
	assert.Equal(t, etag1, rec2.Header().Get("ETag"), "ETag must be consistent")

	// 3. Third request: MUST be HIT
	req3 := httptest.NewRequest(http.MethodGet, targetURL, nil)
	req3.Header.Set("Accept-Encoding", "gzip")
	rec3 := httptest.NewRecorder()
	env.server.ServeHTTP(rec3, req3)

	assert.Equal(t, "HIT", rec3.Header().Get("X-Cache"), "Third request must be a HIT")
}

func TestPageCacheMiddleware_Whitelist(t *testing.T) {
	env := setupTest(t)
	defer env.close()

	env.app.Config().PageCacheEnabled = true

	// テストデータ
	_, err := env.db.Exec(`
		INSERT INTO entries (title, body, formatted_body, summary, image_url, path, format, date, created_at, modified_at, status)
		VALUES ('Test Entry', 'Body', '<p>Body</p>', 'Summary', '', 'test-entry', 'Markdown', '2025-01-01', '2025-01-01 10:00:00', '2025-01-01 10:00:00', 'public')
	`)
	require.NoError(t, err)

	tests := []struct {
		path        string
		shouldCache bool
	}{
		{"/", true},
		{"/archive", true},
		{"/2025/", true},
		{"/2025/01/", true},
		{"/2025/01/01/", true},
		{"/feed", true},
		{"/sitemap.xml", true},
		{"/robots.txt", true},
		{"/test-entry", true}, // matches /*
		{"/search", false},
		{"/.page/2025-01-01/10", false},
		{"/api/search", false},
	}

	for _, tt := range tests {
		t.Run(tt.path, func(t *testing.T) {
			// 1回目
			req1 := httptest.NewRequest(http.MethodGet, tt.path, nil)
			rec1 := httptest.NewRecorder()
			env.server.ServeHTTP(rec1, req1)

			if tt.shouldCache {
				assert.Equal(t, "MISS", rec1.Header().Get("X-Cache"), "Should be MISS for %s", tt.path)

				// 2回目 (HITするはず)
				req2 := httptest.NewRequest(http.MethodGet, tt.path, nil)
				rec2 := httptest.NewRecorder()
				env.server.ServeHTTP(rec2, req2)
				assert.Equal(t, "HIT", rec2.Header().Get("X-Cache"), "Should be HIT for %s", tt.path)
			} else {
				assert.Equal(t, "", rec1.Header().Get("X-Cache"), "Should NOT have X-Cache header for %s", tt.path)

				// 2回目 (やはりキャッシュされないはず)
				req2 := httptest.NewRequest(http.MethodGet, tt.path, nil)
				rec2 := httptest.NewRecorder()
				env.server.ServeHTTP(rec2, req2)
				assert.Equal(t, "", rec2.Header().Get("X-Cache"), "Should NOT have X-Cache header for %s even on second request for %s", tt.path, tt.path)
			}
		})
	}
}
