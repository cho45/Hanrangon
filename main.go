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
	db, err := sql.Open("sqlite3", config.DataDBPath)
	if err != nil {
		log.Fatalf("failed to open db: %v", err)
	}
	defer db.Close()
	db.SetMaxOpenConns(25)
	db.Exec("PRAGMA journal_mode=WAL")
	db.Exec("PRAGMA synchronous=NORMAL")

	if err := db.Ping(); err != nil {
		log.Fatalf("failed to ping db: %v", err)
	}

	tfidfDB, err := sql.Open("sqlite3_with_math_functions", config.TFIDFDBPath)
	if err != nil {
		log.Fatalf("failed to open tfidf db: %v", err)
	}
	defer tfidfDB.Close()
	tfidfDB.SetMaxOpenConns(25)
	tfidfDB.Exec("PRAGMA journal_mode=WAL")
	tfidfDB.Exec("PRAGMA synchronous=NORMAL")

	workerDB, err := sql.Open("sqlite3", config.WorkerDBPath)
	if err != nil {
		log.Fatalf("failed to open worker db: %v", err)
	}
	defer workerDB.Close()
	workerDB.SetMaxOpenConns(25)
	workerDB.Exec("PRAGMA journal_mode=WAL")
	workerDB.Exec("PRAGMA synchronous=NORMAL")

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

	queue := jobqueue.NewQueue(workerDB, model.New(workerDB), registry)
	queue.Start(context.Background())

	e := NewServer(config, db, tfidfDB, workerDB, queue)

	// Start server
	e.Logger.Fatal(e.Start(":5555"))
}

func NewServer(config *Config, db *sql.DB, tfidfDB *sql.DB, workerDB *sql.DB, queue *jobqueue.Queue) *echo.Echo {
	app := NewApp(config, db, tfidfDB, workerDB, queue)

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

	e.GET("/api/edit/progress", app.HandleApiEditProgress, app.RequireAuth)

	return e

}
