package main

import (
	"context"
	"database/sql"
	"log"
	"os"
	"strings"

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
	calc, err := tfidf.NewCalculator(tfidfDB, tfidfQueries)
	if err != nil {
		log.Fatalf("failed to create tfidf calculator: %v", err)
	}
	sim := tfidf.NewSimilarityCalculator(tfidfDB, tfidfQueries)

	// 5. Registry作成
	registry := jobqueue.NewRegistry()

	// 6. Worker作成 (まだStartしない)
	workerQueries := model.New(workerDB)
	worker := jobqueue.NewWorker(workerDB, workerQueries, registry)

	// 7. App作成
	application := app.NewApp(config, db, tfidfDB, workerDB, imagesDB, calc, sim, worker)

	// 8. Execute command
	ctx := context.Background()
	switch cmd {
	case "serve":
		// ジョブ登録
		registry.Register(jobs.NewSimpleJob())
		registry.Register(jobs.NewRecalculateTFIDFJob(application))
		registry.Register(jobs.NewUpdateTrackbacksJob(application))
		registry.Register(jobs.NewIndexImagesJob(application))

		// Worker.Start
		worker.Start(ctx)

		// Server起動
		e := app.NewServer(application)
		e.Logger.Fatal(e.Start(config.Listen))

	case "reformat":
		if err := subcommands.Reformat(ctx, application, subArgs); err != nil {
			log.Fatalf("reformat failed: %v", err)
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
