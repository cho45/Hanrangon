package app

import (
	"bytes"
	"compress/gzip"
	"context"
	"log"
	"net/http"
	"net/http/httptest"
	"strings"
	"time"

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

// PageCacheMiddleware はページキャッシュと Gzip 圧縮を処理するミドルウェア
func (app *AppImpl) PageCacheMiddleware() echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			if !app.config.PageCacheEnabled {
				return next(c)
			}

			// GET/HEAD のみキャッシュ対象
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
			baseKey := GenerateCacheKey(c.Request().URL.Path)
			acceptEncoding := c.Request().Header.Get("Accept-Encoding")
			supportsGzip := strings.Contains(acceptEncoding, "gzip")

			// 1. 圧縮済みキャッシュのチェック
			if supportsGzip {
				if content, err := app.CacheService().Get(c.Request().Context(), baseKey+":gzip"); err == nil && content != nil {
					c.Response().Header().Set("Content-Encoding", "gzip")
					c.Response().Header().Set("X-Cache", "HIT-GZ")
					c.Response().Header().Set(echo.HeaderContentType, echo.MIMETextHTMLCharsetUTF8)
					return c.Blob(http.StatusOK, echo.MIMETextHTMLCharsetUTF8, content)
				}
			}

			// 2. 非圧縮キャッシュのチェック
			if content, err := app.CacheService().Get(c.Request().Context(), baseKey+":raw"); err == nil && content != nil {
				c.Response().Header().Set("X-Cache", "HIT-RAW")
				if supportsGzip && len(content) > 1024 {
					// その場で圧縮して返す
					c.Response().Header().Set("Content-Encoding", "gzip")
					return app.serveGzip(c, content)
				}
				return c.HTMLBlob(http.StatusOK, content)
			}

			// 3. キャッシュミス: レスポンスをキャプチャ
			c.Response().Header().Set("X-Cache", "MISS")
			rec := httptest.NewRecorder()
			origWriter := c.Response().Writer
			wrapper := &responseWriterWrapper{ResponseWriter: origWriter, recorder: rec}
			c.Response().Writer = wrapper
			defer func() {
				wrapper.Close()
				c.Response().Writer = origWriter
			}()

			// クライアントが Gzip 対応ならヘッダーをセット (wrapper 内で圧縮がトリガーされる)
			if supportsGzip {
				c.Response().Header().Set("Content-Encoding", "gzip")
			}

			if err := next(c); err != nil {
				return err
			}

			// 成功時のみキャッシュ保存と圧縮処理
			if c.Response().Status == http.StatusOK {
				content := rec.Body.Bytes()

				// 依存関係を取得
				var sourceIDs []string
				if ids := c.Get("cache_source_ids"); ids != nil {
					sourceIDs = ids.([]string)
				}

				if len(sourceIDs) > 0 {
					// 非圧縮版を即時保存
					if err := app.CacheService().Set(c.Request().Context(), baseKey+":raw", content, sourceIDs); err != nil {
						log.Printf("[WARN] Failed to save raw page cache for %s: %v", baseKey, err)
					}

					// 非同期で Gzip 圧縮して保存
					go func() {
						ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
						defer cancel()
						if err := app.CompressGzipAndSave(ctx, baseKey, content, sourceIDs); err != nil {
							log.Printf("[WARN] Failed to compress and save page cache for %s: %v", baseKey, err)
						}
					}()
				}

			}

			return nil
		}
	}
}

// serveGzip はデータを Gzip 圧縮してレスポンスとして返す
func (app *AppImpl) serveGzip(c echo.Context, content []byte) error {
	c.Response().Header().Set("Content-Encoding", "gzip")
	gw := gzip.NewWriter(c.Response().Writer)
	defer gw.Close()
	_, err := gw.Write(content)
	return err
}

// CompressGzipAndSave はデータを Gzip 圧縮してキャッシュに保存する
func (app *AppImpl) CompressGzipAndSave(ctx context.Context, baseKey string, content []byte, sourceIDs []string) error {
	var buf bytes.Buffer
	gw := gzip.NewWriter(&buf)
	if _, err := gw.Write(content); err != nil {
		return err
	}
	if err := gw.Close(); err != nil {
		return err
	}

	return app.CacheService().Set(ctx, baseKey+":gzip", buf.Bytes(), sourceIDs)
}

type responseWriterWrapper struct {
	http.ResponseWriter
	recorder *httptest.ResponseRecorder
	gw       *gzip.Writer
}

func (w *responseWriterWrapper) Write(b []byte) (int, error) {
	w.recorder.Write(b)

	// クライアントが Gzip を要求しており、かつ十分に長いデータであれば圧縮を開始
	if w.Header().Get("Content-Encoding") == "gzip" {
		if w.gw == nil {
			w.gw = gzip.NewWriter(w.ResponseWriter)
		}
		return w.gw.Write(b)
	}

	return w.ResponseWriter.Write(b)
}

func (w *responseWriterWrapper) WriteHeader(statusCode int) {
	w.recorder.WriteHeader(statusCode)
	w.ResponseWriter.WriteHeader(statusCode)
}

func (w *responseWriterWrapper) Close() error {
	if w.gw != nil {
		return w.gw.Close()
	}
	return nil
}
