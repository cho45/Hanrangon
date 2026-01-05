package app

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/labstack/echo/v4"
)

func TestCacheControlPrivateWhenAuth(t *testing.T) {
	env := setupTest(t)
	defer env.close()

	cookie := env.login(t)

	t.Run("Unauthenticated request", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodGet, "/", nil)
		rec := httptest.NewRecorder()
		env.server.ServeHTTP(rec, req)

		if rec.Code != http.StatusOK {
			t.Fatalf("want status 200, got %d", rec.Code)
		}

		cc := rec.Header().Get("Cache-Control")
		if cc == "private" {
			t.Errorf("Cache-Control should not be private for unauthenticated request")
		}
	})

	t.Run("Authenticated request", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodGet, "/", nil)
		req.Header.Set("Cookie", cookie)
		rec := httptest.NewRecorder()
		env.server.ServeHTTP(rec, req)

		if rec.Code != http.StatusOK {
			t.Fatalf("want status 200, got %d", rec.Code)
		}

		cc := rec.Header().Get("Cache-Control")
		if cc != "private" {
			t.Errorf("want Cache-Control: private for authenticated request, got %q", cc)
		}
	})

	t.Run("Authenticated request with handler-set Cache-Control", func(t *testing.T) {
		// Create a temporary route that sets Cache-Control: no-cache
		env.server.GET("/test-cache-control", func(c echo.Context) error {
			c.Response().Header().Set("Cache-Control", "no-cache")
			return c.String(http.StatusOK, "ok")
		})

		req := httptest.NewRequest(http.MethodGet, "/test-cache-control", nil)
		req.Header.Set("Cookie", cookie)
		rec := httptest.NewRecorder()
		env.server.ServeHTTP(rec, req)

		cc := rec.Header().Get("Cache-Control")
		// Order might be "private, no-cache"
		if cc != "private, no-cache" {
			t.Errorf("want Cache-Control: private, no-cache, got %q", cc)
		}
	})
}
