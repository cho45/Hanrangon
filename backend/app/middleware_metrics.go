package app

import (
	"net/http"

	"github.com/labstack/echo-contrib/echoprometheus"
	"github.com/labstack/echo/v4"
)

func (app *AppImpl) MetricsHandler() echo.HandlerFunc {
	h := echoprometheus.NewHandlerWithConfig(echoprometheus.HandlerConfig{
		Gatherer: app.prometheusRegistry,
	})
	return func(c echo.Context) error {
		ip := c.RealIP()
		if ip != "127.0.0.1" && ip != "::1" {
			return echo.NewHTTPError(http.StatusForbidden, "Forbidden")
		}
		return h(c)
	}
}
