package app

import (
	"log"
	"path/filepath"
	"strings"

	"github.com/gorilla/sessions"
	"github.com/labstack/echo-contrib/session"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

func NewServer(app *AppImpl) *echo.Echo {
	config := app.Config()
	e := echo.New()
	e.HideBanner = true

	// Middleware
	e.Use(session.Middleware(sessions.NewCookieStore([]byte(config.SessionSecret))))
	e.Use(middleware.RequestLoggerWithConfig(middleware.RequestLoggerConfig{
		LogStatus:   true,
		LogURI:      true,
		LogMethod:   true,
		LogLatency:  true,
		LogRemoteIP: true,
		LogValuesFunc: func(c echo.Context, v middleware.RequestLoggerValues) error {
			log.Printf("REQUEST: method=%s, uri=%s, status=%d, latency=%v, remote_ip=%s",
				v.Method, v.URI, v.Status, v.Latency, v.RemoteIP)
			return nil
		},
	}))
	e.Use(middleware.Recover())
	e.Use(middleware.Gzip())
	e.Use(func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			c.Response().Before(func() {
				if app.IsAuth(c) {
					h := c.Response().Header()
					cc := h.Get("Cache-Control")
					if cc == "" {
						h.Set("Cache-Control", "private, no-cache")
					} else if !strings.Contains(cc, "private") {
						h.Set("Cache-Control", "private, no-cache, "+cc)
					} else if !strings.Contains(cc, "no-cache") {
						h.Set("Cache-Control", cc+", no-cache")
					}
				}
			})
			return next(c)
		}
	})
	e.Use(app.CSRF)

	// Static files
	e.Static("/css", filepath.Join(config.StaticDir, "css"))
	e.Static("/js", filepath.Join(config.StaticDir, "js"))
	e.Static("/static/admin", filepath.Join(config.StaticDir, "admin"))
	e.Static("/images/entry", config.UploadDir)
	e.Static("/images", filepath.Join(config.StaticDir, "images"))

	// Public Routes
	e.GET("/", app.HandleIndex)
	e.GET("/.page/:date/:limit", app.HandleIndex)
	e.GET("/archive", app.HandleArchive)

	// Date archives (order matters)
	e.GET("/:param/", app.HandleRootParam) // Year archive OR Category
	e.GET("/:yyyy/:mm/", app.HandleDateArchive)
	e.GET("/:yyyy/:mm/:dd/", app.HandleDateArchive)

	e.GET("/:category/.page/:date/:limit", app.HandleCategory)

	e.GET("/feed", app.HandleFeed)
	e.GET("/sitemap.xml", app.HandleSitemap)
	e.GET("/robots.txt", app.HandleRobotsTxt)

	e.GET("/api/similar", app.HandleApiSimilar)

	// Auth
	e.GET("/login", app.HandleLogin)
	// Rate limit login attempts to 1 request per second per IP
	e.POST("/login", app.HandleLoginPost, middleware.RateLimiter(middleware.NewRateLimiterMemoryStore(1)))
	e.GET("/logout", app.HandleLogout)

	// Admin
	e.GET("/admin/", app.HandleAdminIndex, app.RequireAuth)
	e.GET("/admin/edit", app.HandleAdminEdit, app.RequireAuth)
	e.GET("/admin/api/entries", app.HandleAdminApiEntries, app.RequireAuth)
	e.GET("/admin/api/entry/:id", app.HandleAdminApiEntry, app.RequireAuth)
	e.GET("/admin/api/jobs", app.HandleAdminApiJobs, app.RequireAuth)
	e.GET("/admin/api/info", app.HandleAdminApiInfo, app.RequireAuth)
	e.POST("/admin/api/edit", app.HandleAdminApiEdit, app.RequireAuth)
	e.POST("/admin/api/upload/image", app.HandleAdminApiUploadImage, app.RequireAuth)
	e.GET("/admin/api/edit/progress", app.HandleAdminApiEditProgress, app.RequireAuth)

	// Admin SPA catch-all
	e.GET("/admin/*", app.HandleAdminIndex, app.RequireAuth)

	// Catch-all route for entries by path (must be last)
	e.GET("/*", app.HandlePath)

	return e
}
