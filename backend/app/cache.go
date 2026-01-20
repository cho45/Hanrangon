package app

import (
	"crypto/sha1"
	"fmt"
	"io"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/labstack/echo/v4"
)

var AppHash string

func init() {
	// Calculate hash of the running binary to invalidate caches on deploy/update
	path, err := os.Executable()
	if err != nil {
		// Fallback if executable path cannot be found
		AppHash = fmt.Sprintf("%d", time.Now().UnixNano())
		return
	}

	f, err := os.Open(path)
	if err != nil {
		AppHash = fmt.Sprintf("%d", time.Now().UnixNano())
		return
	}
	defer f.Close()

	h := sha1.New()
	if _, err := io.Copy(h, f); err != nil {
		AppHash = fmt.Sprintf("%d", time.Now().UnixNano())
		return
	}

	AppHash = fmt.Sprintf("%x", h.Sum(nil))
}

// AppHash はアプリケーションのバージョン識別子であり、セキュリティ用途ではない。
// SHA1 (160 ビット) は識別子として十分な強度を持つ。
// 将来的にセキュリティ用途で使用する場合は sha256 への変更を検討すること。

// CheckCache は HTTP キャッシュヘッダー (ETag, Last-Modified) の処理と検証を行う。
// リクエストが処理された（304 Not Modified を送信した）場合は true を、そうでない場合は false を返す。
func (app *AppImpl) CheckCache(c echo.Context, lastMod time.Time, etag string) (bool, error) {
	req := c.Request()
	res := c.Response()

	// Normalize ETag (ensure quotes)
	if etag != "" && !strings.HasPrefix(etag, `"`) {
		etag = fmt.Sprintf(`"%s"`, etag)
	}

	// Set headers
	res.Header().Set("Cache-Control", "no-cache")
	if !lastMod.IsZero() {
		res.Header().Set("Last-Modified", lastMod.UTC().Format(http.TimeFormat))
	}
	if etag != "" {
		res.Header().Set("ETag", etag)
	}

	// 1. Check If-None-Match (ETag)
	if match := req.Header.Get("If-None-Match"); match != "" {
		if match == "*" {
			err := c.NoContent(http.StatusNotModified)
			return true, err
		}
		for _, tag := range strings.Split(match, ",") {
			if strings.TrimSpace(tag) == etag {
				err := c.NoContent(http.StatusNotModified)
				return true, err
			}
		}
		// If ETag is present but doesn't match, do not check Last-Modified
		return false, nil
	}

	// 2. Check If-Modified-Since (Last-Modified)
	// Only checked if If-None-Match is NOT present
	if ifModSince := req.Header.Get("If-Modified-Since"); ifModSince != "" {
		t, err := time.Parse(http.TimeFormat, ifModSince)
		if err == nil {
			// Truncate to seconds
			if !lastMod.Truncate(time.Second).After(t) {
				err := c.NoContent(http.StatusNotModified)
				return true, err
			}
		}
	}

	return false, nil
}
