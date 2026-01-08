package app

import (
	"log"
	"net/http"
	"net/http/httputil"
	"net/url"
	"os"
	"path/filepath"
	"strings"

	"github.com/gorilla/sessions"
	"github.com/labstack/echo-contrib/pprof"
	"github.com/labstack/echo-contrib/session"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

func NewServer(app *AppImpl) *echo.Echo {
	config := app.Config()
	e := echo.New()
	e.HideBanner = true
	e.Debug = config.IsDevelopment()

	if os.Getenv("PPROF") == "true" {
		pprof.Register(e)
	}

	// Middleware
	e.Use(session.Middleware(sessions.NewCookieStore([]byte(config.SessionSecret))))
	e.Use(middleware.RequestLoggerWithConfig(middleware.RequestLoggerConfig{
		LogStatus:   true,
		LogURI:      true,
		LogMethod:   true,
		LogLatency:  true,
		LogRemoteIP: true,
		LogError:    true,
		LogValuesFunc: func(c echo.Context, v middleware.RequestLoggerValues) error {
			if v.Error != nil {
				log.Printf("REQUEST ERROR: method=%s, uri=%s, status=%d, latency=%v, remote_ip=%s, error=%v",
					v.Method, v.URI, v.Status, v.Latency, v.RemoteIP, v.Error)
			} else {
				log.Printf("REQUEST: method=%s, uri=%s, status=%d, latency=%v, remote_ip=%s",
					v.Method, v.URI, v.Status, v.Latency, v.RemoteIP)
			}
			return nil
		},
	}))

	// Custom HTTP Error Handler
	e.HTTPErrorHandler = func(err error, c echo.Context) {
		code := http.StatusInternalServerError
		var message interface{} = "Internal Server Error"

		if he, ok := err.(*echo.HTTPError); ok {
			code = he.Code
			message = he.Message
			if he.Internal != nil {
				log.Printf("[ERROR] Internal error: %v", he.Internal)
			}
		}

		log.Printf("[ERROR] HTTP Error: code=%d, message=%v, error=%v", code, message, err)

		if !c.Response().Committed {
			if c.Request().Method == http.MethodHead {
				err = c.NoContent(code)
			} else {
				// In development, return detailed error
				if config.IsDevelopment() {
					err = c.JSON(code, map[string]interface{}{
						"message": message,
						"error":   err.Error(),
					})
				} else {
					err = c.JSON(code, map[string]interface{}{
						"message": message,
					})
				}
			}
			if err != nil {
				log.Printf("[ERROR] Failed to send error response: %v", err)
			}
		}
	}

	e.Use(middleware.Recover())
	e.Use(middleware.GzipWithConfig(middleware.GzipConfig{
		Level: 1, // BestSpeed
		// 1KB未満のレスポンスは、圧縮によるサイズ削減効果よりも
		// Gzipライター確保のメモリ/CPUコストの方が大きいため除外する。
		MinLength: 1024,
	}))
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
	// 本番環境ではフロントエンドの HTTP サーバー (h2o) が直接静的ファイルを配信するため、
	// これらの設定は主に開発環境や、フロントエンドサーバーを介さない直接実行時に利用される。
	e.Static("/css", filepath.Join(config.StaticDir, "css"))
	e.Static("/js", filepath.Join(config.StaticDir, "js"))
	e.Static("/static/admin", filepath.Join(config.StaticDir, "admin"))

	// 開発環境では、ローカルにない画像ファイルを本番環境（lowreal.net）からプロキシする。
	// 本番DBのダンプを開発環境で利用する際、記事中の画像（/images/entry/*）を
	// ローカルにコピーしていなくても本番に近い見た目で確認できるようにするため。
	if config.IsDevelopment() {
		target, _ := url.Parse("https://lowreal.net")
		proxy := httputil.NewSingleHostReverseProxy(target)
		e.GET("/images/entry/*", func(c echo.Context) error {
			path := c.Param("*")
			localPath := filepath.Join(config.UploadDir, path)
			if _, err := os.Stat(localPath); err == nil {
				return c.File(localPath)
			}
			req := c.Request()
			req.URL.Host = target.Host
			req.URL.Scheme = target.Scheme
			req.Header.Set("X-Forwarded-Host", req.Header.Get("Host"))
			req.Host = target.Host
			proxy.ServeHTTP(c.Response(), req)
			return nil
		})
	} else {
		e.Static("/images/entry", config.UploadDir)
	}

	e.Static("/images", filepath.Join(config.StaticDir, "images"))

	// Public Routes
	e.GET("/", app.HandleIndex)
	e.GET("/.page/:date/:limit", app.HandleIndex)
	e.GET("/archive", app.HandleArchive)
	e.GET("/search", app.HandleSearch)

	// Date archives (order matters)
	e.GET("/:param/", app.HandleRootParam) // Year archive OR Category
	e.GET("/:yyyy/:mm/", app.HandleDateArchive)
	e.GET("/:yyyy/:mm/:dd/", app.HandleDateArchive)

	e.GET("/:category/.page/:date/:limit", app.HandleCategory)

	e.GET("/feed", app.HandleFeed)
	e.GET("/sitemap.xml", app.HandleSitemap)
	e.GET("/robots.txt", app.HandleRobotsTxt)

	e.GET("/api/search", app.HandleApiSearch)
	e.GET("/images/ogp/:id", app.HandleOGP)

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
