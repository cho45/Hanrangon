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
	assert.Contains(t, rec1.Body.String(), "Test Entry")

	// 2. 2回目リクエスト: HIT
	req2 := httptest.NewRequest(http.MethodGet, targetURL, nil)
	rec2 := httptest.NewRecorder()
	env.server.ServeHTTP(rec2, req2)

	assert.Equal(t, http.StatusOK, rec2.Code)
	assert.Equal(t, "HIT", rec2.Header().Get("X-Cache"))
	assert.Equal(t, rec1.Body.String(), rec2.Body.String())

	// 3. エントリ更新 (無効化)
	err = env.app.CacheService().InvalidateBySourceID(context.Background(), "entry:1")
	require.NoError(t, err)

	// 4. 3回目リクエスト: MISS (削除されたため)
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
	assert.Equal(t, "HIT", rec2.Header().Get("X-Cache"))
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
	assert.Equal(t, "HIT", rec3.Header().Get("X-Cache"))
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
	assert.Equal(t, "HIT", rec2.Header().Get("X-Cache"))

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
