package app

import (
	"fmt"
	"image"
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

		// Check if cache file exists
		cachePath := filepath.Join(env.app.Config().BaseDir, "var", "cache", "ogp", "1.png")
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

		cachePath := filepath.Join(env.app.Config().BaseDir, "var", "cache", "ogp", fmt.Sprintf("%d.png", id))
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

func TestOpaquePaletted_Opaque(t *testing.T) {
	// Create a simple paletted image
	paletted := image.NewPaletted(image.Rect(0, 0, 10, 10), getOGPPalette())

	// Wrap it with opaquePaletted
	opaqueImg := &opaquePaletted{Paletted: paletted}

	// Test that Opaque() returns true
	if !opaqueImg.Opaque() {
		t.Error("opaquePaletted.Opaque() should return true")
	}

	// Verify it still works as an image.Image
	var _ image.Image = opaqueImg
	bounds := opaqueImg.Bounds()
	if bounds.Dx() != 10 || bounds.Dy() != 10 {
		t.Errorf("Image bounds incorrect: got %v", bounds)
	}
}
