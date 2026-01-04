package app

import (
	"log"
	"path/filepath"

	"github.com/gorilla/sessions"
	"github.com/labstack/echo-contrib/session"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

func NewServer(app App) *echo.Echo {
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
	e.Use(app.CSRF)

	// Static files
	e.Static("/css", filepath.Join(config.StaticDir, "css"))
	e.Static("/js", filepath.Join(config.StaticDir, "js"))
	e.Static("/static/admin", filepath.Join(config.StaticDir, "admin"))
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
	e.POST("/login", app.HandleLoginPost)
	e.GET("/logout", app.HandleLogout)

	// Admin
	e.GET("/admin/", app.HandleAdminIndex, app.RequireAuth)
	e.GET("/admin/edit", app.HandleAdminEdit, app.RequireAuth)
	e.GET("/admin/api/entries", app.HandleAdminApiEntries, app.RequireAuth)
	e.GET("/admin/api/entry/:id", app.HandleAdminApiEntry, app.RequireAuth)
	e.GET("/admin/api/jobs", app.HandleAdminApiJobs, app.RequireAuth)
	e.POST("/admin/api/edit", app.HandleAdminApiEdit, app.RequireAuth)
	e.POST("/admin/api/upload/image", app.HandleAdminApiUploadImage, app.RequireAuth)
	e.GET("/admin/api/edit/progress", app.HandleAdminApiEditProgress, app.RequireAuth)

	// Admin SPA catch-all
	e.GET("/admin/*", app.HandleAdminIndex, app.RequireAuth)

	// Catch-all route for entries by path (must be last)
	e.GET("/*", app.HandlePath)

	return e
}
