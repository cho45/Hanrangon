package app

import (
	"context"
	"io"
	"time"

	"github.com/cho45/hanrangon/backend/jobqueue"
	"github.com/cho45/hanrangon/backend/model"
	"github.com/cho45/hanrangon/backend/model/imagesdb"
	"github.com/cho45/hanrangon/backend/model/maindb"
	"github.com/cho45/hanrangon/backend/model/tfidfdb"
	"github.com/cho45/hanrangon/backend/model/workerdb"
	"github.com/cho45/hanrangon/backend/tfidf"
)

// ProgressReporter は進捗状況を報告するためのインターフェース
type ProgressReporter interface {
	Report(message string)
}

// App はアプリケーションの主要なインターフェース
type App interface {
	io.Closer

	// Database accessors
	MainDB() *model.Database[maindb.Querier]
	TFIDFDB() *model.Database[tfidfdb.Querier]
	WorkerDB() *model.Database[workerdb.Querier]
	ImagesDB() *model.Database[imagesdb.Querier]

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
	Postprocess(ctx context.Context, html string, reporter ProgressReporter) (string, error)
	PostprocessBatch(ctx context.Context, idleTimeout time.Duration) (*BatchProcessor, error)

	// Utils for Service
	EnqueuePublishedEntryJobs(ctx context.Context, entryID int64) error

	GetR2Usage(ctx context.Context) (*R2UsageStats, error)

	InvalidateOGPCache(id int64) error
}
