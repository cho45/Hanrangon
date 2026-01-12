package app

import (
	"net/http"
	"net/http/httptest"
	"net/url"
	"strings"
	"testing"

	"github.com/labstack/echo/v4"
	"github.com/stretchr/testify/assert"
)

func TestCSRF(t *testing.T) {
	e := echo.New()
	app := &AppImpl{}

	h := app.CSRF(func(c echo.Context) error {
		return c.String(http.StatusOK, "ok")
	})

	t.Run("Allow GET and set cookie", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodGet, "/", nil)
		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)
		assert.NoError(t, h(c))
		assert.Equal(t, http.StatusOK, rec.Code)

		cookie := rec.Result().Cookies()
		assert.NotEmpty(t, cookie)
		assert.Equal(t, CSRFCookieName, cookie[0].Name)
	})

	t.Run("Block POST without protection", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodPost, "/", nil)
		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)

		err := h(c)
		assert.Error(t, err)
		he, ok := err.(*echo.HTTPError)
		assert.True(t, ok)
		assert.Equal(t, http.StatusForbidden, he.Code)
	})

	t.Run("Allow POST with X-Requested-With", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodPost, "/", nil)
		req.Header.Set("X-Requested-With", "fetch")
		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)
		assert.NoError(t, h(c))
		assert.Equal(t, http.StatusOK, rec.Code)
	})

	t.Run("Allow POST with valid sk in form and cookie", func(t *testing.T) {
		sk := "test-token"
		f := make(url.Values)
		f.Set("sk", sk)
		req := httptest.NewRequest(http.MethodPost, "/", strings.NewReader(f.Encode()))
		req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationForm)
		req.AddCookie(&http.Cookie{Name: CSRFCookieName, Value: sk})

		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)

		assert.NoError(t, h(c))
		assert.Equal(t, http.StatusOK, rec.Code)
	})

	t.Run("Block POST with token mismatch", func(t *testing.T) {
		f := make(url.Values)
		f.Set("sk", "wrong-token")
		req := httptest.NewRequest(http.MethodPost, "/", strings.NewReader(f.Encode()))
		req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationForm)
		req.AddCookie(&http.Cookie{Name: CSRFCookieName, Value: "correct-token"})

		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)

		err := h(c)
		assert.Error(t, err)
		he, ok := err.(*echo.HTTPError)
		assert.True(t, ok)
		assert.Equal(t, http.StatusForbidden, he.Code)
	})
}
