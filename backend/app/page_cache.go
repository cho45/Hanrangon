package app

import (
	"bytes"
	"compress/gzip"
	"context"
	"crypto/sha1"
	"fmt"
	"io"
	"net/http"
	"net/http/httptest"
	"strings"
	"time"

	"github.com/cho45/hanrangon/backend/model/cachedb"
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

			baseKey := GenerateCacheKey(c.Request().URL.Path)
			supportsGzip := strings.Contains(c.Request().Header.Get("Accept-Encoding"), "gzip")

			// 1. キャッシュヒット確認
			cache, isGzipped, err := app.getCacheForRequest(c.Request().Context(), baseKey, supportsGzip)
			if err == nil && cache.Content != nil {
				if app.checkNotModified(c, cache.Etag, cache.CreatedAt) {
					return c.NoContent(http.StatusNotModified)
				}
				c.Response().Header().Set("X-Cache", "HIT")
				return app.serveCache(c, cache, isGzipped)
			}

			// 2. キャッシュミス - レスポンスをキャプチャ
			rec := httptest.NewRecorder()
			origWriter := c.Response().Writer
			c.Response().Writer = rec

			if err := next(c); err != nil {
				c.Response().Writer = origWriter
				return err
			}
			c.Response().Writer = origWriter

			if c.Response().Status != http.StatusOK {
				// 成功時以外はキャッシュせず、そのままレスポンスを返す
				for k, v := range rec.Header() {
					c.Response().Header()[k] = v
				}
				c.Response().WriteHeader(rec.Code)
				_, err := c.Response().Write(rec.Body.Bytes())
				return err
			}

			// 3. キャッシュ保存と返却
			content := rec.Body.Bytes()
			contentType := rec.Header().Get(echo.HeaderContentType)
			if contentType == "" {
				contentType = echo.MIMETextHTMLCharsetUTF8
			}

			// ETag 計算 (Raw コンテンツに対して行う)
			hash := sha1.Sum(content)
			rawEtag := fmt.Sprintf(`"%x"`, hash)

			// Gzip 圧縮と ETag 生成
			gzipped, _ := app.compressGzip(content)
			gzipEtag := strings.TrimSuffix(rawEtag, `"`) + `:gzip"`

			// 依存関係があればキャッシュ保存
			sourceIDs, _ := c.Get("cache_source_ids").([]string)
			if len(sourceIDs) > 0 {
				ctx := c.Request().Context()
				// Gzip版を保存
				_ = app.CacheService().Set(ctx, baseKey+":gzip", gzipped, gzipEtag, contentType, sourceIDs)
				// Raw版はコンテンツなしで保存 (ETagのみ。容量節約のため)
				_ = app.CacheService().Set(ctx, baseKey+":raw", nil, rawEtag, contentType, sourceIDs)
			}

			// レスポンス返却
			c.Response().Header().Set("X-Cache", "MISS")
			if supportsGzip {
				return app.serveCache(c, cachedb.Cache{
					Content:     gzipped,
					Etag:        gzipEtag,
					ContentType: contentType,
					CreatedAt:   time.Now(),
				}, true)
			} else {
				return app.serveCache(c, cachedb.Cache{
					Content:     content,
					Etag:        rawEtag,
					ContentType: contentType,
					CreatedAt:   time.Now(),
				}, false)
			}
		}
	}
}

// getCacheForRequest はリクエストに応じた最適なキャッシュを取得する
func (app *AppImpl) getCacheForRequest(ctx context.Context, baseKey string, supportsGzip bool) (cachedb.Cache, bool, error) {
	if supportsGzip {
		// 1. Gzip版を探す
		cache, err := app.CacheService().Get(ctx, baseKey+":gzip")
		if err == nil && cache.Content != nil {
			return cache, true, nil
		}
		// 2. Raw版を探す (フォールバック)
		cache, err = app.CacheService().Get(ctx, baseKey+":raw")
		if err == nil && cache.Content != nil {
			return cache, false, nil
		}
	} else {
		// 1. Raw版を探す
		cache, err := app.CacheService().Get(ctx, baseKey+":raw")
		if err == nil && cache.Content != nil {
			return cache, false, nil
		}
		// 2. Gzip版を探して解凍する (フォールバック)
		cache, err = app.CacheService().Get(ctx, baseKey+":gzip")
		if err == nil && cache.Content != nil {
			decompressed, derr := app.decompressGzip(cache.Content)
			if derr == nil {
				cache.Content = decompressed
				// ETag を Raw 用に復元
				cache.Etag = strings.TrimSuffix(cache.Etag, `:gzip"`) + `"`
				return cache, false, nil
			}
		}
	}
	return cachedb.Cache{}, false, fmt.Errorf("cache not found")
}

// serveCache はキャッシュデータをレスポンスとして返す
func (app *AppImpl) serveCache(c echo.Context, cache cachedb.Cache, isGzipped bool) error {
	res := c.Response()
	res.Header().Set(echo.HeaderContentType, cache.ContentType)
	res.Header().Set("ETag", cache.Etag)
	res.Header().Set("Last-Modified", cache.CreatedAt.UTC().Format(http.TimeFormat))
	res.Header().Set("Vary", "Accept-Encoding")
	if isGzipped {
		res.Header().Set("Content-Encoding", "gzip")
	}
	return c.Blob(http.StatusOK, cache.ContentType, cache.Content)
}

// checkNotModified は If-None-Match / If-Modified-Since を検証する
func (app *AppImpl) checkNotModified(c echo.Context, etag string, createdAt time.Time) bool {
	req := c.Request()

	// 1. If-None-Match (ETag)
	if match := req.Header.Get("If-None-Match"); match != "" {
		if match == "*" || strings.Contains(match, etag) {
			return true
		}
		return false
	}

	// 2. If-Modified-Since (Last-Modified)
	if ifModSince := req.Header.Get("If-Modified-Since"); ifModSince != "" {
		t, err := time.Parse(http.TimeFormat, ifModSince)
		if err == nil {
			if !createdAt.Truncate(time.Second).After(t) {
				return true
			}
		}
	}

	return false
}

// compressGzip はデータを Gzip 圧縮する
func (app *AppImpl) compressGzip(content []byte) ([]byte, error) {
	var buf bytes.Buffer
	gw := gzip.NewWriter(&buf)
	if _, err := gw.Write(content); err != nil {
		return nil, err
	}
	if err := gw.Close(); err != nil {
		return nil, err
	}
	return buf.Bytes(), nil
}

// decompressGzip は Gzip 圧縮されたデータを解凍する
func (app *AppImpl) decompressGzip(data []byte) ([]byte, error) {
	gr, err := gzip.NewReader(bytes.NewReader(data))
	if err != nil {
		return nil, err
	}
	defer func() {
		_ = gr.Close()
	}()
	return io.ReadAll(gr)
}
