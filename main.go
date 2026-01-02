package main

import (
	"context"
	"database/sql"
	"log"
	"path/filepath"

	"github.com/cho45/hanrangon/jobqueue"
	"github.com/cho45/hanrangon/jobs"
	"github.com/cho45/hanrangon/model"
	"github.com/cho45/hanrangon/tfidf"
	"github.com/gorilla/sessions"
	"github.com/labstack/echo-contrib/session"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	_ "github.com/mattn/go-sqlite3"
)

func main() {
	config := LoadConfig()

	// データベース接続
	db := mustOpenDB("sqlite3", config.DataDBPath)
	defer db.Close()

	tfidfDB := mustOpenDB("sqlite3_with_math_functions", config.TFIDFDBPath)
	defer tfidfDB.Close()

	workerDB := mustOpenDB("sqlite3", config.WorkerDBPath)
	defer workerDB.Close()

	imagesDB := mustOpenDB("sqlite3", config.ImagesDBPath)
	defer imagesDB.Close()

	// ジョブキュー起動
	registry := jobqueue.NewRegistry()
	registry.Register(jobs.NewSimpleJob())

	// TF-IDF calculator and similarity calculator
	calc, err := tfidf.NewCalculator(tfidfDB, model.New(tfidfDB))
	if err != nil {
		log.Fatalf("failed to create tfidf calculator: %v", err)
	}
	sim := tfidf.NewSimilarityCalculator(tfidfDB, model.New(tfidfDB))
	registry.Register(jobs.NewRecalculateTFIDFJob(model.New(db), calc, sim))
	registry.Register(jobs.NewUpdateTrackbacksJob(model.New(db), config.BaseURL))
	registry.Register(jobs.NewIndexImagesJob(model.New(db), config.UploadDir, config.UploadURLPrefix, config.BaseURL))

	queue := jobqueue.NewQueue(workerDB, model.New(workerDB), registry)
	queue.Start(context.Background())

	e := NewServer(config, db, tfidfDB, workerDB, imagesDB, queue)

	// Start server
	e.Logger.Fatal(e.Start(config.Listen))
}

func NewServer(config *Config, db *sql.DB, tfidfDB *sql.DB, workerDB *sql.DB, imagesDB *sql.DB, queue *jobqueue.Queue) *echo.Echo {
	app := NewApp(config, db, tfidfDB, workerDB, imagesDB, queue)

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

	// Static files
	e.Static("/css", filepath.Join(config.StaticDir, "css"))
	e.Static("/js", filepath.Join(config.StaticDir, "js"))
	e.Static("/images", filepath.Join(config.StaticDir, "images"))

	// Auth
	e.GET("/login", app.HandleLogin)
	e.POST("/login", app.HandleLoginPost)
	e.GET("/logout", app.HandleLogout)

	// Admin
	e.GET("/edit", app.HandleEdit, app.RequireAuth)

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

	// Admin API

	e.POST("/api/edit", app.HandleApiEdit, app.RequireAuth)
	e.POST("/api/upload/image", app.HandleApiUploadImage, app.RequireAuth)

	e.GET("/api/edit/progress", app.HandleApiEditProgress, app.RequireAuth)

	return e
}

func mustOpenDB(driver, path string) *sql.DB {
	db, err := sql.Open(driver, path)
	if err != nil {
		log.Fatalf("failed to open db (%s): %v", path, err)
	}

	db.SetMaxOpenConns(25)
	if _, err := db.Exec("PRAGMA journal_mode=WAL"); err != nil {
		log.Printf("warn: failed to set WAL mode for %s: %v", path, err)
	}
	if _, err := db.Exec("PRAGMA synchronous=NORMAL"); err != nil {
		log.Printf("warn: failed to set synchronous mode for %s: %v", path, err)
	}

	if err := db.Ping(); err != nil {
		log.Fatalf("failed to ping db (%s): %v", path, err)
	}

	return db
}
