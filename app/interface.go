package app

import (
	"context"
	"database/sql"
	"time"

	"github.com/cho45/hanrangon/jobqueue"
	"github.com/cho45/hanrangon/model"
	"github.com/cho45/hanrangon/tfidf"
	"github.com/labstack/echo/v4"
)

// App はアプリケーションの主要なインターフェース
type App interface {
	// Database accessors
	Queries() *model.Queries
	DB() *sql.DB
	TFIDFQueries() *model.Queries
	TFIDFDB() *sql.DB
	WorkerQueries() *model.Queries
	WorkerDB() *sql.DB
	ImagesQueries() *model.Queries
	ImagesDB() *sql.DB

	// TF-IDF accessors
	Calculator() *tfidf.Calculator
	SimilarityCalculator() *tfidf.SimilarityCalculator

	// Job queue accessor
	JobQueue() *jobqueue.Worker

	// Config accessor
	Config() *Config

	// Auth methods
	RequireAuth(next echo.HandlerFunc) echo.HandlerFunc
	IsAuth(c echo.Context) bool

	// Cache methods
	CheckCache(c echo.Context, lastMod time.Time, etag string) bool

	// Postprocess
	Postprocess(ctx context.Context, html string) (string, error)

	// Handler methods
	HandleIndex(c echo.Context) error
	HandleEntry(c echo.Context) error
	HandleArchive(c echo.Context) error
	HandleDateArchive(c echo.Context) error
	HandleCategory(c echo.Context) error
	HandleFeed(c echo.Context) error
	HandleSitemap(c echo.Context) error
	HandleRobotsTxt(c echo.Context) error
	HandleApiSimilar(c echo.Context) error
	HandleRootParam(c echo.Context) error

	// Admin handlers
	HandleEdit(c echo.Context) error
	HandleLogin(c echo.Context) error
	HandleLoginPost(c echo.Context) error
	HandleLogout(c echo.Context) error
	HandleApiEdit(c echo.Context) error
	HandleApiUploadImage(c echo.Context) error
	HandleApiEditProgress(c echo.Context) error
}
