package main

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"strings"
	"sync"
	"syscall"
	"time"

	"github.com/cho45/hanrangon/app"
	"github.com/cho45/hanrangon/jobqueue"
	"github.com/cho45/hanrangon/jobs"
	"github.com/cho45/hanrangon/model"
	"github.com/cho45/hanrangon/subcommands"
	"github.com/cho45/hanrangon/tfidf"
	_ "github.com/mattn/go-sqlite3"
)

func main() {
	// 1. Determine subcommand
	cmd := "serve"
	subArgs := os.Args[1:]
	if len(os.Args) > 1 && !strings.HasPrefix(os.Args[1], "-") {
		cmd = os.Args[1]
		subArgs = os.Args[2:]
	}

	// 2. Config読み込み
	config := app.LoadConfig()

	// 3. DB接続 (4つのDB)
	db := mustOpenDB("sqlite3", config.DataDBPath)
	defer db.Close()

	tfidfDB := mustOpenDB("sqlite3", config.TFIDFDBPath)
	defer tfidfDB.Close()

	workerDB := mustOpenDB("sqlite3", config.WorkerDBPath)
	defer workerDB.Close()

	imagesDB := mustOpenDB("sqlite3", config.ImagesDBPath)
	defer imagesDB.Close()

	// 4. TF-IDF Calculator/Similarity初期化
	tfidfQueries := model.New(tfidfDB)
	dataQueries := model.New(db)
	calc, err := tfidf.NewCalculator(tfidfDB, tfidfQueries, db, dataQueries)
	if err != nil {
		log.Fatalf("failed to create tfidf calculator: %v", err)
	}
	sim := tfidf.NewSimilarityCalculator(tfidfDB, tfidfQueries)
	searcher := tfidf.NewSearcher(tfidfDB, tfidfQueries, calc)

	// 5. Registry作成
	registry := jobqueue.NewRegistry()

	// 6. Worker作成 (まだStartしない)
	workerQueries := model.New(workerDB)
	worker := jobqueue.NewWorker(workerDB, workerQueries, registry)

	// 7. App作成
	application := app.NewApp(config, db, tfidfDB, workerDB, imagesDB, calc, sim, searcher, worker)

	// 8. Execute command
	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()

	switch cmd {
	case "serve":
		if err := RunServe(ctx, application); err != nil {
			log.Fatalf("serve failed: %v", err)
		}

	case "reformat":
		if err := subcommands.Reformat(ctx, application, subArgs); err != nil {
			log.Fatalf("reformat failed: %v", err)
		}

	case "recalc-tfidf":
		if err := subcommands.RecalcTFIDF(ctx, application, subArgs); err != nil {
			log.Fatalf("recalc-tfidf failed: %v", err)
		}

	case "backup":
		if err := subcommands.Backup(ctx, application, subArgs); err != nil {
			log.Fatalf("backup failed: %v", err)
		}

	case "index-images":
		if err := subcommands.IndexImages(ctx, application, subArgs); err != nil {
			log.Fatalf("index-images failed: %v", err)
		}

	case "update-password":
		if err := subcommands.UpdatePassword(ctx, application, subArgs); err != nil {
			log.Fatalf("update-password failed: %v", err)
		}

	default:
		log.Fatalf("unknown command: %s", cmd)
	}
}

func mustOpenDB(driver, path string) *sql.DB {
	dsn := path
	if !strings.Contains(path, "?") {
		dsn += "?_loc=Asia/Tokyo"
	} else {
		dsn += "&_loc=Asia/Tokyo"
	}
	db, err := sql.Open(driver, dsn)
	if err != nil {
		log.Fatalf("failed to open db (%s): %v", dsn, err)
	}

	// 接続数を制限
	db.SetMaxOpenConns(10)
	db.SetMaxIdleConns(5)
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

func RunServe(ctx context.Context, application *app.AppImpl) error {
	config := application.Config()
	worker := application.JobQueue()
	registry := worker.Registry()

	// ジョブ登録
	registry.Register(jobs.NewSimpleJob())
	registry.Register(jobs.NewRecalculateTFIDFJob(application))
	registry.Register(jobs.NewUpdateTrackbacksJob(application))
	registry.Register(jobs.NewIndexImagesJob(application))

	// Worker.Start
	worker.Start(ctx)

	// Periodic tasks
	var wg sync.WaitGroup
	wg.Add(1)
	go func() {
		defer wg.Done()
		ticker := time.NewTicker(1 * time.Minute)
		defer ticker.Stop()
		for {
			select {
			case <-ctx.Done():
				log.Printf("Periodic task worker stopping...")
				return
			case <-ticker.C:
				if err := application.PublishScheduledEntries(ctx); err != nil {
					log.Printf("Error publishing scheduled entries: %v", err)
				}
			}
		}
	}()

	// Server起動
	e := app.NewServer(application)
	go func() {
		if err := e.Start(config.Listen); err != nil && err != http.ErrServerClosed {
			log.Printf("Server start error: %v", err)
		}
	}()

	// シグナルを待機
	<-ctx.Done()
	log.Printf("Shutting down gracefully...")

	// 定期タスクとジョブワーカーの停止待ちを先に行う
	log.Printf("Waiting for background workers to finish...")
	wg.Wait()     // Periodic tasks
	worker.Wait() // Job queue
	log.Printf("All background workers finished.")

	// 最後にServerの停止
	shutdownCtx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	if err := e.Shutdown(shutdownCtx); err != nil {
		return fmt.Errorf("server shutdown failed: %w", err)
	}
	log.Printf("Server stopped.")

	return nil
}
