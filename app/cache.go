package app

import (
	"crypto/sha1"
	"crypto/sha256"
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

	h := sha256.New()
	if _, err := io.Copy(h, f); err != nil {
		AppHash = fmt.Sprintf("%d", time.Now().UnixNano())
		return
	}

	AppHash = fmt.Sprintf("%x", h.Sum(nil))
}

// CheckCache handles HTTP caching headers (ETag, Last-Modified) and validation.
// Returns true if the request was handled (i.e., 304 Not Modified sent), false otherwise.
func (app *AppImpl) CheckCache(c echo.Context, lastMod time.Time, etag string) bool {
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
			c.NoContent(http.StatusNotModified)
			return true
		}
		for _, tag := range strings.Split(match, ",") {
			if strings.TrimSpace(tag) == etag {
				c.NoContent(http.StatusNotModified)
				return true
			}
		}
		// If ETag is present but doesn't match, do not check Last-Modified
		return false
	}

	// 2. Check If-Modified-Since (Last-Modified)
	// Only checked if If-None-Match is NOT present
	if ifModSince := req.Header.Get("If-Modified-Since"); ifModSince != "" {
		t, err := time.Parse(http.TimeFormat, ifModSince)
		if err == nil {
			// Truncate to seconds
			if !lastMod.Truncate(time.Second).After(t) {
				c.NoContent(http.StatusNotModified)
				return true
			}
		}
	}

	return false
}

// GenerateListETag generates a strong ETag for a list of items, including AppHash and auth status.
func GenerateListETag(latestMod time.Time, count int, extra string, isAuth bool) string {
	authPart := "public"
	if isAuth {
		authPart = "auth"
	}
	s := fmt.Sprintf("%s-%s-%d-%d-%s", AppHash, authPart, latestMod.UnixNano(), count, extra)
	h := sha1.Sum([]byte(s))
	return fmt.Sprintf(`"%x"`, h)
}

// GenerateEntryETag generates a strong ETag for a single entry, including AppHash and auth status.
func GenerateEntryETag(id int64, mod time.Time, isAuth bool) string {
	authPart := "public"
	if isAuth {
		authPart = "auth"
	}
	s := fmt.Sprintf("%s-%s-%d-%d", AppHash, authPart, id, mod.UnixNano())
	h := sha1.Sum([]byte(s))
	return fmt.Sprintf(`"%x"`, h)
}
