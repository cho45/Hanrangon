package main

import (
	"context"
	"database/sql"
	"log"
	"strings"

	"github.com/cho45/hanrangon/app"
	"github.com/cho45/hanrangon/jobqueue"
	"github.com/cho45/hanrangon/jobs"
	"github.com/cho45/hanrangon/model"
	"github.com/cho45/hanrangon/tfidf"
	_ "github.com/mattn/go-sqlite3"
)

func main() {
	// 1. Config読み込み
	config := app.LoadConfig()

	// 2. DB接続 (4つのDB)
	db := mustOpenDB("sqlite3", config.DataDBPath)
	defer db.Close()

	tfidfDB := mustOpenDB("sqlite3_with_math_functions", config.TFIDFDBPath)
	defer tfidfDB.Close()

	workerDB := mustOpenDB("sqlite3", config.WorkerDBPath)
	defer workerDB.Close()

	imagesDB := mustOpenDB("sqlite3", config.ImagesDBPath)
	defer imagesDB.Close()

	// 3. TF-IDF Calculator/Similarity初期化
	// model.New()を一度だけ呼ぶ（重複解消）
	tfidfQueries := model.New(tfidfDB)
	calc, err := tfidf.NewCalculator(tfidfDB, tfidfQueries)
	if err != nil {
		log.Fatalf("failed to create tfidf calculator: %v", err)
	}
	sim := tfidf.NewSimilarityCalculator(tfidfDB, tfidfQueries)

	// 4. Registry作成
	registry := jobqueue.NewRegistry()

	// 5. Queue作成 (まだStartしない)
	workerQueries := model.New(workerDB)
	queue := jobqueue.NewQueue(workerDB, workerQueries, registry)

	// 6. App作成
	application := app.NewApp(config, db, tfidfDB, workerDB, imagesDB, calc, sim, queue)

	// 7. ジョブ登録
	registry.Register(jobs.NewSimpleJob())
	registry.Register(jobs.NewRecalculateTFIDFJob(application))
	registry.Register(jobs.NewUpdateTrackbacksJob(application))
	registry.Register(jobs.NewIndexImagesJob(application))

	// 8. Queue.Start
	queue.Start(context.Background())

	// 9. Server起動
	e := app.NewServer(application)
	e.Logger.Fatal(e.Start(config.Listen))
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
