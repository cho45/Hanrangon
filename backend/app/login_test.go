package app

import (
	"fmt"
	"net/http"
	"net/http/httptest"
	"regexp"
	"strings"
	"testing"
)

var hiddenSKRegexp = regexp.MustCompile(`name="sk"\s+value="([^"]*)"`)

func extractHiddenSK(html string) (string, bool) {
	m := hiddenSKRegexp.FindStringSubmatch(html)
	if len(m) < 2 {
		return "", false
	}
	return m[1], true
}

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

func TestHandleLogin_CSRFTokenConsistency(t *testing.T) {
	env := setupTest(t)
	defer env.close()

	t.Run("GET /login should embed the same sk as Set-Cookie", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodGet, "/login", nil)
		rec := httptest.NewRecorder()
		env.server.ServeHTTP(rec, req)

		if rec.Code != http.StatusOK {
			t.Fatalf("expected status 200, got %d", rec.Code)
		}

		var cookieSK string
		for _, cookie := range rec.Result().Cookies() {
			if cookie.Name == CSRFCookieName {
				cookieSK = cookie.Value
				break
			}
		}
		if cookieSK == "" {
			t.Fatal("expected CSRF cookie sk to be set")
		}

		formSK, ok := extractHiddenSK(rec.Body.String())
		if !ok {
			t.Fatal("expected hidden sk field in login form")
		}
		if formSK != cookieSK {
			t.Fatalf("hidden sk mismatch: form=%q cookie=%q", formSK, cookieSK)
		}
	})

	t.Run("failed login should re-render form with non-empty sk", func(t *testing.T) {
		// 1) GET /login で CSRF Cookie を取得
		getReq := httptest.NewRequest(http.MethodGet, "/login", nil)
		getRec := httptest.NewRecorder()
		env.server.ServeHTTP(getRec, getReq)
		if getRec.Code != http.StatusOK {
			t.Fatalf("expected status 200, got %d", getRec.Code)
		}

		var cookieSK string
		var cookies []string
		for _, cookie := range getRec.Result().Cookies() {
			if cookie.Name == CSRFCookieName {
				cookieSK = cookie.Value
			}
			cookies = append(cookies, fmt.Sprintf("%s=%s", cookie.Name, cookie.Value))
		}
		if cookieSK == "" {
			t.Fatal("expected CSRF cookie sk to be set")
		}

		// 2) 認証失敗を起こす（CSRF は通す）
		payload := fmt.Sprintf("username=testuser&password=wrongpass&sk=%s", cookieSK)
		postReq := httptest.NewRequest(http.MethodPost, "/login", strings.NewReader(payload))
		postReq.Header.Set("Content-Type", "application/x-www-form-urlencoded")
		postReq.Header.Set("Cookie", strings.Join(cookies, "; "))
		postRec := httptest.NewRecorder()
		env.server.ServeHTTP(postRec, postReq)

		if postRec.Code != http.StatusOK {
			t.Fatalf("expected status 200 on auth failure page, got %d: %s", postRec.Code, postRec.Body.String())
		}

		formSK, ok := extractHiddenSK(postRec.Body.String())
		if !ok {
			t.Fatal("expected hidden sk field in login form after auth failure")
		}
		if formSK != cookieSK {
			t.Fatalf("hidden sk mismatch after auth failure: form=%q cookie=%q", formSK, cookieSK)
		}
	})
}
