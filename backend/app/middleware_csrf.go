package app

import (
	"crypto/rand"
	"encoding/hex"
	"net/http"

	"github.com/labstack/echo/v4"
)

const (
	SessionKeyName  = "sk"
	CSRFHeaderName  = "X-Requested-With"
	CSRFHeaderValue = "fetch"
	CSRFCookieName  = "sk"
)

func GenerateRandomString(n int) (string, error) {
	b := make([]byte, n)
	if _, err := rand.Read(b); err != nil {
		return "", err
	}
	return hex.EncodeToString(b), nil
}

func (app *AppImpl) CSRF(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {
		// Whitelist public GET/HEAD/OPTIONS routes to avoid unnecessary CSRF cookies.
		// Only paths that lead to forms (like /login) or admin actions require a CSRF token.
		if method := c.Request().Method; method == http.MethodGet || method == http.MethodHead || method == http.MethodOptions {
			switch c.Path() {
			case "/", "/archive", "/feed", "/sitemap.xml", "/robots.txt", "/api/similar",
				"/.page/:date/:limit", "/:param/", "/:yyyy/:mm/", "/:yyyy/:mm/:dd/",
				"/:category/.page/:date/:limit", "/*",
				"/css*", "/js*", "/images*", "/images/entry*", "/static/admin*":
				return next(c)
			}
		}

		// Ensure CSRF cookie exists for state-changing requests or login/admin pages
		cookie, err := c.Cookie(CSRFCookieName)
		var sk string
		if err != nil {
			sk, _ = GenerateRandomString(16)
			newCookie := &http.Cookie{
				Name:     CSRFCookieName,
				Value:    sk,
				Path:     "/",
				HttpOnly: true,
				Secure:   c.IsTLS(),
				SameSite: http.SameSiteLaxMode,
			}
			c.SetCookie(newCookie)
		} else {
			sk = cookie.Value
		}

		// Allow safe methods
		switch c.Request().Method {
		case http.MethodGet, http.MethodHead, http.MethodOptions:
			return next(c)
		}

		// 1. Check custom header for AJAX/fetch requests
		// Even with Double Submit Cookie, custom header is a strong proof of origin
		if c.Request().Header.Get(CSRFHeaderName) == CSRFHeaderValue {
			return next(c)
		}

		// 2. Check sk in form or query param against Cookie value
		reqSK := c.FormValue(SessionKeyName)
		if reqSK == "" {
			reqSK = c.QueryParam(SessionKeyName)
		}

		if reqSK == "" || reqSK != sk {
			return echo.NewHTTPError(http.StatusForbidden, "CSRF token mismatch")
		}

		return next(c)
	}
}
