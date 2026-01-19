package app

import (
	"log"
	"net/http"
	"net/http/httptest"
	"strings"

	"github.com/labstack/echo/v4"
)

// GenerateCacheKey はリクエストパスからキャッシュキーを生成する
func GenerateCacheKey(path string) string {
	path = strings.TrimSuffix(path, "/")
	if path == "" {
		return "/"
	}
	return path
}

// PageCacheMiddleware はページキャッシュを処理するミドルウェア
func (app *AppImpl) PageCacheMiddleware() echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			if !app.config.PageCacheEnabled {
				return next(c)
			}

			// GET/HEAD のみキャッシュ
			if c.Request().Method != http.MethodGet && c.Request().Method != http.MethodHead {
				return next(c)
			}

			// 認証済みユーザーはキャッシュしない
			if app.IsAuth(c) {
				return next(c)
			}

			// 管理画面は除外
			if strings.HasPrefix(c.Request().URL.Path, "/admin") {
				return next(c)
			}

			// キャッシュキー生成
			key := GenerateCacheKey(c.Request().URL.Path)

			// キャッシュヒットチェック
			content, err := app.CacheService().Get(c.Request().Context(), key)
			if err == nil && content != nil {
				c.Response().Header().Set("X-Cache", "HIT")
				return c.HTMLBlob(http.StatusOK, content)
			}

			// キャッシュミス: レスポンスをキャプチャ
			rec := httptest.NewRecorder()
			origWriter := c.Response().Writer
			c.Response().Writer = &responseWriterWrapper{ResponseWriter: origWriter, recorder: rec}
			defer func() {
				c.Response().Writer = origWriter
			}()

			if err := next(c); err != nil {
				return err
			}

			// 成功時のみキャッシュ保存
			if c.Response().Status == http.StatusOK {
				c.Response().Header().Set("X-Cache", "MISS")
				content := rec.Body.Bytes()

				// 依存関係を取得
				var sourceIDs []string
				if ids := c.Get("cache_source_ids"); ids != nil {
					sourceIDs = ids.([]string)
				}

				// キャッシュを同期保存
				if len(sourceIDs) > 0 {
					if err := app.CacheService().Set(c.Request().Context(), key, content, sourceIDs); err != nil {
						log.Printf("[WARN] Failed to save page cache for %s: %v", key, err)
					}
				}
			}

			return nil
		}
	}
}

type responseWriterWrapper struct {
	http.ResponseWriter
	recorder *httptest.ResponseRecorder
}

func (w *responseWriterWrapper) Write(b []byte) (int, error) {
	w.recorder.Write(b)
	return w.ResponseWriter.Write(b)
}

func (w *responseWriterWrapper) WriteHeader(statusCode int) {
	w.recorder.WriteHeader(statusCode)
	w.ResponseWriter.WriteHeader(statusCode)
}
