package app

import (
	"context"
	"database/sql"

	"github.com/cho45/hanrangon/backend/jobqueue"
	"github.com/cho45/hanrangon/backend/model"
	"github.com/cho45/hanrangon/backend/tfidf"
)

// ProgressReporter は進捗状況を報告するためのインターフェース
type ProgressReporter interface {
	Report(message string)
}

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

	// EntryService accessor
	EntryService() *EntryService

	// Postprocess
	Postprocess(ctx context.Context, html string) (string, error)
	PostprocessBatch(ctx context.Context) (*BatchProcessor, error)

	// Utils for Service
	BeginImmediate(ctx context.Context) (*sql.Tx, error)

	EnqueuePublishedEntryJobs(ctx context.Context, entryID int64) error

	GetR2Usage(ctx context.Context) (*R2UsageStats, error)

	InvalidateOGPCache(id int64) error
}
