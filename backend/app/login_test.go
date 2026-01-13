package app

import (
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestHandleLogin_RedirectIfAuthenticated(t *testing.T) {
	env := setupTest(t)
	defer env.close()

	loginInfo := env.login(t)

	t.Run("Redirect to /admin/edit if authenticated and no return path", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodGet, "/login", nil)
		req.Header.Set("Cookie", loginInfo.Cookie)
		rec := httptest.NewRecorder()

		env.server.ServeHTTP(rec, req)

		if rec.Code != http.StatusFound {
			t.Errorf("expected status 302, got %d", rec.Code)
		}
		location := rec.Header().Get("Location")
		if location != "/admin/edit" {
			t.Errorf("expected redirect to /admin/edit, got %s", location)
		}
	})

	t.Run("Redirect to return path if authenticated", func(t *testing.T) {
		returnPath := "/admin/edit"
		req := httptest.NewRequest(http.MethodGet, fmt.Sprintf("/login?return=%s", returnPath), nil)
		req.Header.Set("Cookie", loginInfo.Cookie)
		rec := httptest.NewRecorder()

		env.server.ServeHTTP(rec, req)

		if rec.Code != http.StatusFound {
			t.Errorf("expected status 302, got %d", rec.Code)
		}
		location := rec.Header().Get("Location")
		if location != returnPath {
			t.Errorf("expected redirect to %s, got %s", returnPath, location)
		}
	})

	t.Run("Show login form if not authenticated", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodGet, "/login", nil)
		rec := httptest.NewRecorder()

		env.server.ServeHTTP(rec, req)

		if rec.Code != http.StatusOK {
			t.Errorf("expected status 200, got %d", rec.Code)
		}
	})
}
