package app

import (
	"fmt"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"testing"
)

func TestHandleOGP(t *testing.T) {
	env := setupTest(t)
	defer env.close()

	// 1. テストデータの挿入
	res, err := env.db.Exec(`
		INSERT INTO entries (title, body, formatted_body, path, format, date, created_at, modified_at)
		VALUES ('[tag1] Test OGP Title', 'Body', '<p>Body</p>', '2026/01/08/1', 'Markdown', '2026-01-08', '2026-01-08 10:00:00', '2026-01-08 10:00:00')
	`)
	if err != nil {
		t.Fatalf("failed to insert test data: %v", err)
	}
	id, _ := res.LastInsertId()

	// 2. OGPリクエスト
	t.Run("Generate OGP", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodGet, fmt.Sprintf("/images/ogp/%d.png", id), nil)
		rec := httptest.NewRecorder()
		env.server.ServeHTTP(rec, req)

		if rec.Code != http.StatusOK {
			t.Errorf("want status 200, got %d: %s", rec.Code, rec.Body.String())
		}

		if rec.Header().Get("Content-Type") != "image/png" {
			t.Errorf("want image/png, got %s", rec.Header().Get("Content-Type"))
		}

		// キャッシュファイルが生成されているか確認
		cachePath := filepath.Join("var", "cache", "ogp", fmt.Sprintf("%d.png", id))
		if _, err := os.Stat(cachePath); os.IsNotExist(err) {
			t.Errorf("cache file was not created at %s", cachePath)
		}
	})

	// 3. キャッシュ破棄のテスト
	t.Run("Invalidate Cache", func(t *testing.T) {
		err := env.app.InvalidateOGPCache(id)
		if err != nil {
			t.Errorf("failed to invalidate cache: %v", err)
		}

		cachePath := filepath.Join("var", "cache", "ogp", fmt.Sprintf("%d.png", id))
		if _, err := os.Stat(cachePath); err == nil {
			t.Errorf("cache file still exists after invalidation")
		}
	})

	// 4. 不正なID
	t.Run("Invalid ID", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodGet, "/images/ogp/invalid.png", nil)
		rec := httptest.NewRecorder()
		env.server.ServeHTTP(rec, req)

		if rec.Code != http.StatusBadRequest {
			t.Errorf("want status 400 for invalid ID, got %d", rec.Code)
		}
	})
}
