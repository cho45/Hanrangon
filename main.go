package main

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"net"
	"net/http"
	"os"
	"os/signal"
	"strings"
	"sync"
	"syscall"
	"time"

	"runtime/pprof"

	"github.com/cho45/hanrangon/backend/app"
	"github.com/cho45/hanrangon/backend/jobqueue"
	"github.com/cho45/hanrangon/backend/jobs"
	"github.com/cho45/hanrangon/backend/model"
	"github.com/cho45/hanrangon/backend/model/imagesdb"
	"github.com/cho45/hanrangon/backend/model/maindb"
	"github.com/cho45/hanrangon/backend/model/tfidfdb"
	"github.com/cho45/hanrangon/backend/model/workerdb"
	"github.com/cho45/hanrangon/backend/subcommands"
	"github.com/cho45/hanrangon/backend/tfidf"
	_ "github.com/mattn/go-sqlite3"
)

func main() {
	// 1. Determine subcommand and check for profiling flag
	cmd := "serve"
	var subArgs []string
	cpuprofile := ""

	// Simple global flag parsing before subcommand dispatch
	filteredArgs := []string{}
	for i := 1; i < len(os.Args); i++ {
		arg := os.Args[i]
		if strings.HasPrefix(arg, "--cpuprofile=") {
			cpuprofile = strings.TrimPrefix(arg, "--cpuprofile=")
		} else if arg == "--cpuprofile" && i+1 < len(os.Args) {
			cpuprofile = os.Args[i+1]
			i++
		} else {
			filteredArgs = append(filteredArgs, arg)
		}
	}

	if len(filteredArgs) > 0 && !strings.HasPrefix(filteredArgs[0], "-") {
		cmd = filteredArgs[0]
		subArgs = filteredArgs[1:]
	} else {
		subArgs = filteredArgs
	}

	if cpuprofile != "" {
		f, err := os.Create(cpuprofile)
		if err != nil {
			log.Fatalf("could not create CPU profile: %v", err)
		}
		defer f.Close()
		if err := pprof.StartCPUProfile(f); err != nil {
			log.Fatalf("could not start CPU profile: %v", err)
		}
		defer pprof.StopCPUProfile()
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

	// 4. Database Wrapper初期化
	mainDBWrapper := model.NewDatabase[maindb.Querier](db, func(tx model.DBTX) maindb.Querier { return maindb.New(tx) })
	tfidfDBWrapper := model.NewDatabase[tfidfdb.Querier](tfidfDB, func(tx model.DBTX) tfidfdb.Querier { return tfidfdb.New(tx) })
	workerDBWrapper := model.NewDatabase[workerdb.Querier](workerDB, func(tx model.DBTX) workerdb.Querier { return workerdb.New(tx) })
	imagesDBWrapper := model.NewDatabase[imagesdb.Querier](imagesDB, func(tx model.DBTX) imagesdb.Querier { return imagesdb.New(tx) })

	// 5. TF-IDF Calculator/Similarity初期化
	calc, err := tfidf.NewCalculator(tfidfDB, tfidfDBWrapper.Q, db, mainDBWrapper.Q)
	if err != nil {
		log.Fatalf("failed to create tfidf calculator: %v", err)
	}
	sim := tfidf.NewSimilarityCalculator(tfidfDB, tfidfDBWrapper.Q)
	searcher := tfidf.NewSearcher(tfidfDB, tfidfDBWrapper.Q, calc)

	// 6. Registry作成
	registry := jobqueue.NewRegistry()

	// 7. Worker作成 (まだStartしない)
	worker := jobqueue.NewWorker(model.NewDatabase[*workerdb.Queries](workerDB, func(tx model.DBTX) *workerdb.Queries { return workerdb.New(tx.(workerdb.DBTX)) }), workerDBWrapper.Q.(*workerdb.Queries), registry)

	// 8. App作成
	application := app.NewApp(
		config,
		mainDBWrapper,
		tfidfDBWrapper,
		workerDBWrapper,
		imagesDBWrapper,
		calc,
		sim,
		searcher,
		worker,
	)

	// 8. Execute command
	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()
	defer application.Close()

	// Register serve and help commands
	subcommands.Register(subcommands.Definition{
		Name:        "serve",
		Description: "Start the HTTP server and background workers",
		Run: func(ctx context.Context, application app.App, args []string) error {
			return RunServe(ctx, application.(*app.AppImpl))
		},
	})
	subcommands.Register(subcommands.Definition{
		Name:        "help",
		Description: "Show this help message",
		Run: func(ctx context.Context, application app.App, args []string) error {
			fmt.Println("Usage: hanrangon [subcommand] [flags]")
			fmt.Println("\nAvailable subcommands:")
			for _, sc := range subcommands.Registered {
				fmt.Printf("  %-20s %s\n", sc.Name, sc.Description)
			}
			return nil
		},
	})

	// Dispatch to subcommand
	var found bool
	for _, sc := range subcommands.Registered {
		if sc.Name == cmd {
			if err := sc.Run(ctx, application, subArgs); err != nil {
				log.Fatalf("%s failed: %v", cmd, err)
			}
			found = true
			break
		}
	}

	if !found {
		fmt.Printf("Unknown command: %s\n\n", cmd)
		for _, sc := range subcommands.Registered {
			if sc.Name == "help" {
				_ = sc.Run(ctx, application, nil)
				break
			}
		}
		os.Exit(1)
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

// RunServe は HTTP サーバーを起動し、バックグラウンドワーカーとともに
// コンテキストがキャンセルされるまで（または SIGTERM 等を受けるまで）実行を維持します。
func RunServe(ctx context.Context, application *app.AppImpl) error {
	config := application.Config()
	worker := application.JobQueue()
	registry := worker.Registry()

	// 1. ジョブの登録
	// 各種非同期処理（TF-IDF再計算、トラックバック送信、画像インデックス作成など）を登録します。
	registry.Register(jobs.NewSimpleJob())
	registry.Register(jobs.NewRecalculateTFIDFJob(application))
	registry.Register(jobs.NewUpdateTrackbacksJob(application))
	registry.Register(jobs.NewIndexImagesJob(application))
	registry.Register(jobs.NewFinalizeEntryJob(application))

	// 2. ジョブワーカーの開始
	// SQLite を使用したジョブキューのポーリングを開始します。
	worker.Start(ctx)

	// 3. 定期実行タスクの開始
	// 予約投稿の公開チェック（1分ごと）などを実行する goroutine を起動します。
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
				if err := application.EntryService().PublishScheduledEntries(ctx); err != nil {
					log.Printf("Error publishing scheduled entries: %v", err)
				}
			}
		}
	}()

	// 4. Echo サーバーとリスナーの準備
	// 複数のアドレス (TCP ポートや Unix Domain Socket) で listen できるようにします。
	e := app.NewServer(application)
	var servers []*http.Server
	var listeners []net.Listener

	// 初期化失敗時に既に開いたリスナーを閉じるためのクリーンアップ関数
	cleanupListeners := func() {
		for _, l := range listeners {
			_ = l.Close()
		}
	}

	// 5. 各リスナーの作成と起動
	for _, addr := range config.Listen {
		var l net.Listener
		var err error

		if strings.HasPrefix(addr, "unix:") {
			// Unix Domain Socket の場合
			path := strings.TrimPrefix(addr, "unix:")

			// 既存のソケットファイルがあれば削除（異常終了後の再起動対策）
			if err := os.Remove(path); err != nil && !os.IsNotExist(err) {
				cleanupListeners()
				return fmt.Errorf("failed to remove existing socket: %w", err)
			}

			l, err = net.Listen("unix", path)
			if err != nil {
				cleanupListeners()
				return fmt.Errorf("failed to listen on unix socket %s: %w", path, err)
			}

			// Web サーバー (Nginx等) からアクセスできるようパーミッションを調整
			if err := os.Chmod(path, 0666); err != nil {
				_ = l.Close()
				cleanupListeners()
				return fmt.Errorf("failed to chmod unix socket %s: %w", path, err)
			}

			// 正常終了時、または RunServe 終了時にソケットファイルを削除
			defer os.Remove(path)
		} else {
			// 通常の TCP の場合
			l, err = net.Listen("tcp", addr)
			if err != nil {
				cleanupListeners()
				return fmt.Errorf("failed to listen on tcp address %s: %w", addr, err)
			}
		}

		listeners = append(listeners, l)

		// http.Server をリスナーごとに作成
		srv := &http.Server{
			Addr:    addr,
			Handler: e,
		}
		servers = append(servers, srv)

		// サーバーを並列に開始
		go func(ln net.Listener, srv *http.Server) {
			log.Printf("Server starting on %s", ln.Addr())
			if err := srv.Serve(ln); err != nil && err != http.ErrServerClosed {
				log.Printf("Server error on %s: %v", ln.Addr(), err)
			}
		}(l, srv)
	}

	// 6. 停止シグナルの待機
	// signal.NotifyContext により、SIGINT/SIGTERM を受信すると ctx.Done() が閉じられます。
	<-ctx.Done()
	log.Printf("Shutting down gracefully...")

	// 7. バックグラウンドワーカーの停止待ち
	// サーバーを止める前に、実行中のジョブや定期タスクが安全に終了するのを待ちます。
	log.Printf("Waiting for background workers to finish...")
	wg.Wait()     // 定期タスクの終了待ち
	worker.Wait() // ジョブキューの終了待ち
	log.Printf("All background workers finished.")

	// 8. 全 HTTP サーバーのシャットダウン
	// 10秒のタイムアウト付きで、アクティブなコネクションの終了を待ちます。
	// 親 ctx は既にキャンセル済みなので、独立した shutdown 用 context を作成
	shutdownCtx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var shutdownWg sync.WaitGroup
	for _, s := range servers {
		shutdownWg.Add(1)
		go func(srv *http.Server) {
			defer shutdownWg.Done()
			// Shutdown は内部でリスナーも Close します。
			if err := srv.Shutdown(shutdownCtx); err != nil {
				log.Printf("Server shutdown error: %v", err)
			}
		}(s)
	}
	shutdownWg.Wait()
	log.Printf("All servers stopped.")

	return nil
}
