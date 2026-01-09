package app

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/labstack/echo/v4"
)

func TestHeadToGetMiddleware(t *testing.T) {
	e := echo.New()
	app := &AppImpl{}

	e.Pre(app.HeadToGetMiddleware)

	e.GET("/test", func(c echo.Context) error {
		c.Response().Header().Set("ETag", `"test-etag"`)
		return c.String(http.StatusOK, "should not be seen in HEAD")
	})

	t.Run("HEAD request returns headers but no body", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodHead, "/test", nil)
		rec := httptest.NewRecorder()
		e.ServeHTTP(rec, req)

		if rec.Code != http.StatusOK {
			t.Errorf("expected status 200, got %d", rec.Code)
		}

		etag := rec.Header().Get("ETag")
		if etag != `"test-etag"` {
			t.Errorf("expected ETag header, got %s", etag)
		}

		if rec.Body.Len() > 0 {
			t.Errorf("expected empty body, got %d bytes: %q", rec.Body.Len(), rec.Body.String())
		}
	})

	t.Run("GET request still returns body", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodGet, "/test", nil)
		rec := httptest.NewRecorder()
		e.ServeHTTP(rec, req)

		if rec.Code != http.StatusOK {
			t.Errorf("expected status 200, got %d", rec.Code)
		}

		expectedBody := "should not be seen in HEAD"
		if rec.Body.String() != expectedBody {
			t.Errorf("expected body %q, got %q", expectedBody, rec.Body.String())
		}
	})
}
