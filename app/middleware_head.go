package app

import (
	"net/http"

	"github.com/labstack/echo/v4"
)

type headResponseWriter struct {
	http.ResponseWriter
}

func (w *headResponseWriter) Write(b []byte) (int, error) {
	return len(b), nil
}

func (app *AppImpl) HeadToGetMiddleware(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {
		if c.Request().Method == http.MethodHead {
			originalWriter := c.Response().Writer
			c.Response().Writer = &headResponseWriter{ResponseWriter: originalWriter}
			c.Request().Method = http.MethodGet
			defer func() {
				c.Request().Method = http.MethodHead
				c.Response().Writer = originalWriter
			}()
		}
		return next(c)
	}
}
