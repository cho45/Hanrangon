package app

import (
	"context"
	"database/sql"
	"time"

	"github.com/cho45/hanrangon/backend/jobqueue"
	"github.com/cho45/hanrangon/backend/model"
	"github.com/cho45/hanrangon/backend/tfidf"
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
	Searcher() *tfidf.Searcher

	// Job queue accessor
	JobQueue() *jobqueue.Worker

	// Config accessor
	Config() *Config

	// Auth methods
	RequireAuth(next echo.HandlerFunc) echo.HandlerFunc
	CSRF(next echo.HandlerFunc) echo.HandlerFunc
	IsAuth(c echo.Context) bool

	// Cache methods
	CheckCache(c echo.Context, lastMod time.Time, etag string) (bool, error)

	// Postprocess
	Postprocess(ctx context.Context, html string) (string, error)
	PostprocessBatch(ctx context.Context) (*BatchProcessor, error)

	PublishScheduledEntries(ctx context.Context) error
	EnqueuePublishedEntryJobs(ctx context.Context, entryID int64) error

	GetR2Usage(ctx context.Context) (*R2UsageStats, error)

	HandleOGP(c echo.Context) error
	InvalidateOGPCache(id int64) error
}
