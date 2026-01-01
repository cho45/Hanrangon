package main

import (
	"database/sql"
	"log"
	"path/filepath"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	_ "github.com/mattn/go-sqlite3"
)

func main() {
	config := LoadConfig()

	db, err := sql.Open("sqlite3", config.DataDBPath)
	if err != nil {
		log.Fatalf("failed to open db: %v", err)
	}
	defer db.Close()

	if err := db.Ping(); err != nil {
		log.Fatalf("failed to ping db: %v", err)
	}

	tfidfDB, err := sql.Open("sqlite3", config.TFIDFDBPath)
	if err != nil {
		log.Fatalf("failed to open tfidf db: %v", err)
	}
	defer tfidfDB.Close()

	e := NewServer(config, db, tfidfDB)

	// Start server
	e.Logger.Fatal(e.Start(":5555"))
}

func NewServer(config *Config, db *sql.DB, tfidfDB *sql.DB) *echo.Echo {
	app := NewApp(db, tfidfDB)

	e := echo.New()
	e.HideBanner = true

	// Middleware
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

	// Static files
	e.Static("/css", filepath.Join(config.StaticDir, "css"))
	e.Static("/js", filepath.Join(config.StaticDir, "js"))
	e.Static("/images", filepath.Join(config.StaticDir, "images"))

	// Public Routes
	e.GET("/", app.HandleIndex)
	e.GET("/.page/:date/:limit", app.HandleIndex)
	e.GET("/archive", app.HandleArchive)

	// Date archives (order matters vs /:yyyy/:mm/:dd/:n)
	e.GET("/:param/", app.HandleRootParam) // Year archive OR Category
	e.GET("/:yyyy/:mm/", app.HandleDateArchive)
	e.GET("/:yyyy/:mm/:dd/", app.HandleDateArchive)

	e.GET("/:yyyy/:mm/:dd/:n", app.HandleEntry)

	e.GET("/:category/.page/:date/:limit", app.HandleCategory)

	e.GET("/feed", app.HandleFeed)
	e.GET("/sitemap.xml", app.HandleSitemap)
	e.GET("/robots.txt", app.HandleRobotsTxt)

	e.GET("/api/similar", app.HandleApiSimilar)

	return e
}
