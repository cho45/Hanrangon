package app

import (
	"bufio"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os/exec"
	"path/filepath"
	"strings"
	"sync"
	"sync/atomic"
	"time"

	"github.com/cho45/hanrangon/backend/jobqueue"
	"github.com/cho45/hanrangon/backend/model"
	"github.com/cho45/hanrangon/backend/model/cachedb"
	"github.com/cho45/hanrangon/backend/model/imagesdb"
	"github.com/cho45/hanrangon/backend/model/maindb"
	"github.com/cho45/hanrangon/backend/model/tfidfdb"
	"github.com/cho45/hanrangon/backend/model/workerdb"
	"github.com/cho45/hanrangon/backend/tfidf"
	"github.com/cho45/hanrangon/backend/view"
	"github.com/google/uuid"
	"github.com/labstack/echo-contrib/session"
	"github.com/labstack/echo/v4"
)

// ProgressSession は進捗追跡用のセッション情報
type ProgressSession struct {
	ID        string
	CreatedAt time.Time
	Messages  chan string // 進捗メッセージチャネル
	Done      chan error  // 完了/エラー通知
}

func (s *ProgressSession) Report(message string) {
	msg := map[string]string{"type": "progress", "message": message}
	msgJSON, _ := json.Marshal(msg)
	select {
	case s.Messages <- string(msgJSON):
	default:
		// バッファがいっぱいの場合はスキップしてブロックを防ぐ
	}
}

// AppImpl は App インターフェースの具象実装
type AppImpl struct {
	mainDB               *model.Database[maindb.Querier]
	tfidfDB              *model.Database[tfidfdb.Querier]
	workerDB             *model.Database[workerdb.Querier]
	cacheDB              *model.Database[cachedb.Querier]
	imagesDB             *model.Database[imagesdb.Querier]
	calculator           *tfidf.Calculator
	similarityCalculator *tfidf.SimilarityCalculator
	searcher             *tfidf.Searcher
	jobQueue             *jobqueue.Worker
	config               *Config
	templates            *Templates
	progressSessions     sync.Map // map[sessionID]*ProgressSession
	storage              StorageClient
	imageProcessor       *ImageProcessor
	entryService         *EntryService
	cacheService         *CacheService
	postprocessProcessor *BatchProcessor
	postprocessMu        sync.Mutex
}

func NewApp(
	config *Config,
	mainDB *model.Database[maindb.Querier],
	tfidfDB *model.Database[tfidfdb.Querier],
	workerDB *model.Database[workerdb.Querier],
	imagesDB *model.Database[imagesdb.Querier],
	cacheDB *model.Database[cachedb.Querier],
	calculator *tfidf.Calculator,
	similarityCalculator *tfidf.SimilarityCalculator,
	searcher *tfidf.Searcher,
	worker *jobqueue.Worker,
) *AppImpl {
	templates, err := InitTemplates(config)
	if err != nil {
		log.Fatalf("failed to load templates: %v", err)
	}

	// ストレージクライアントの初期化
	var storage StorageClient
	// R2設定が完全な場合はR2を使用、そうでなければローカルストレージ
	if config.R2EndpointURL != "" && config.R2AccessKeyID != "" &&
		config.R2SecretAccessKey != "" && config.R2BucketName != "" {
		storage, err = NewR2Storage(
			config.R2EndpointURL,
			config.R2AccessKeyID,
			config.R2SecretAccessKey,
			config.R2BucketName,
			config.R2PublicURL,
		)
		if err != nil {
			log.Printf("Warning: Failed to initialize R2 storage, falling back to local: %v", err)
			storage = NewLocalStorage(config.UploadDir, "/images/entry/")
		} else {
			log.Printf("Using R2 storage: %s", config.R2PublicURL)
		}
	} else {
		log.Printf("Using local storage: %s", config.UploadDir)
		storage = NewLocalStorage(config.UploadDir, "/images/entry/")
	}

	app := &AppImpl{
		mainDB:               mainDB,
		tfidfDB:              tfidfDB,
		workerDB:             workerDB,
		cacheDB:              cacheDB,
		imagesDB:             imagesDB,
		calculator:           calculator,
		similarityCalculator: similarityCalculator,
		searcher:             searcher,
		jobQueue:             worker,
		config:               config,
		templates:            templates,
		storage:              storage,
		imageProcessor:       NewImageProcessor(config),
	}
	app.cacheService = NewCacheService(cacheDB)
	app.entryService = NewEntryService(app)

	// AppHash の変更チェックとキャッシュの整合性確保
	if err := app.cacheService.CheckAndTruncateCache(context.Background(), AppHash); err != nil {
		log.Printf("Warning: Failed to check and truncate cache: %v", err)
	}

	return app
}

func (a *AppImpl) MainDB() *model.Database[maindb.Querier]           { return a.mainDB }
func (a *AppImpl) TFIDFDB() *model.Database[tfidfdb.Querier]         { return a.tfidfDB }
func (a *AppImpl) WorkerDB() *model.Database[workerdb.Querier]       { return a.workerDB }
func (a *AppImpl) ImagesDB() *model.Database[imagesdb.Querier]       { return a.imagesDB }
func (a *AppImpl) CacheDB() *model.Database[cachedb.Querier]         { return a.cacheDB }
func (a *AppImpl) Calculator() *tfidf.Calculator                     { return a.calculator }
func (a *AppImpl) SimilarityCalculator() *tfidf.SimilarityCalculator { return a.similarityCalculator }
func (a *AppImpl) Searcher() *tfidf.Searcher                         { return a.searcher }
func (a *AppImpl) JobQueue() *jobqueue.Worker                        { return a.jobQueue }
func (a *AppImpl) Config() *Config                                   { return a.config }
func (a *AppImpl) Templates() *Templates                             { return a.templates }
func (a *AppImpl) EntryService() *EntryService                       { return a.entryService }
func (a *AppImpl) CacheService() *CacheService                       { return a.cacheService }
func (a *AppImpl) Storage() StorageClient                            { return a.storage }

func (a *AppImpl) Close() error {
	a.postprocessMu.Lock()
	defer a.postprocessMu.Unlock()
	if a.postprocessProcessor != nil {
		err := a.postprocessProcessor.Close()
		a.postprocessProcessor = nil
		return err
	}
	return nil
}

func (a *AppImpl) newLayoutData(c echo.Context, pageTitle string) view.LayoutData {
	baseURL := strings.TrimSuffix(a.config.BaseURL, "/")
	return view.LayoutData{
		PageTitle:    pageTitle,
		BaseURL:      baseURL,
		CanonicalURL: baseURL + c.Request().URL.Path,
		Description:  "写真・文章による、ある普通の人間の人生の記録",
		ImageURL:     baseURL + "/images/ogp.png",
		OGType:       "website",
		IsAuth:       a.IsAuth(c),
	}
}

func (app *AppImpl) RequireAuth(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {
		if !app.IsAuth(c) {
			if c.Request().Header.Get("X-Requested-With") == "XMLHttpRequest" ||
				strings.HasPrefix(c.Request().URL.Path, "/api/") {
				return echo.NewHTTPError(http.StatusUnauthorized, "Authentication required")
			}
			return c.Redirect(http.StatusFound, "/login?return="+c.Request().URL.Path)
		}
		return next(c)
	}
}

func (app *AppImpl) IsAuth(c echo.Context) bool {
	sess, _ := session.Get("session", c)
	auth, ok := sess.Values["auth"].(bool)
	return ok && auth
}

func (app *AppImpl) getPostprocessProcessor(ctx context.Context) (*BatchProcessor, error) {
	app.postprocessMu.Lock()
	defer app.postprocessMu.Unlock()

	if app.postprocessProcessor != nil {
		// プロセスの生存を確認（ポータブルな方法）
		if !app.postprocessProcessor.IsAlive() {
			_ = app.postprocessProcessor.Close()
			app.postprocessProcessor = nil
		}
	}

	if app.postprocessProcessor == nil {
		// 常駐プロセスはリクエストの ctx に縛られないように Background を使う
		idleTimeout := time.Duration(app.config.PostprocessIdleTimeout) * time.Second
		p, err := app.PostprocessBatch(context.Background(), idleTimeout)
		if err != nil {
			return nil, err
		}
		app.postprocessProcessor = p
	}

	return app.postprocessProcessor, nil
}

func (app *AppImpl) Postprocess(ctx context.Context, html string, reporter ProgressReporter) (string, error) {
	return app.postprocessWithRetry(ctx, html, reporter)
}

func (app *AppImpl) postprocessWithRetry(ctx context.Context, html string, reporter ProgressReporter) (string, error) {
	const maxRetries = 1
	var lastErr error

	for i := 0; i <= maxRetries; i++ {
		// コンテキストがキャンセルされている場合はリトライせず終了
		if ctx.Err() != nil {
			return "", ctx.Err()
		}

		p, err := app.getPostprocessProcessor(ctx)
		if err != nil {
			return "", err
		}

		// ロックせずに Process を呼ぶ（並列実行可能に）
		// BatchProcessor は sync.Map で並列リクエストを安全に管理している
		tctx, cancel := context.WithTimeout(ctx, 30*time.Second)
		res, err := p.Process(tctx, html, reporter)
		cancel()
		if err == nil {
			return res, nil
		}

		lastErr = err
		log.Printf("[postprocess] Process error (attempt %d/%d): %v", i+1, maxRetries+1, err)

		// エラー時のみロックして破棄
		app.postprocessMu.Lock()
		_ = p.Close()
		app.postprocessProcessor = nil
		app.postprocessMu.Unlock()
	}

	return "", fmt.Errorf("postprocess failed after %d retries: %w", maxRetries, lastErr)
}

type BatchProcessor struct {
	app      *AppImpl
	cmd      *exec.Cmd
	stdin    io.WriteCloser
	stdout   *bufio.Scanner
	cancel   context.CancelFunc
	idSeq    int64
	sessions sync.Map      // map[int64]*batchSession
	done     chan struct{} // プロセス終了通知
	doneOnce sync.Once     // done チャネルを一度だけ close するため
	closing  atomic.Bool   // Close 処理中フラグ
}

type batchSession struct {
	resCh    chan batchResult
	reporter ProgressReporter
}

type batchResult struct {
	html string
	err  error
}

func (p *BatchProcessor) Process(ctx context.Context, html string, reporter ProgressReporter) (string, error) {
	// Close 処理中は新しいリクエストを受け付けない
	if p.closing.Load() {
		return "", fmt.Errorf("processor is closing")
	}

	id := atomic.AddInt64(&p.idSeq, 1)

	resCh := make(chan batchResult, 1)
	p.sessions.Store(id, &batchSession{
		resCh:    resCh,
		reporter: reporter,
	})
	defer p.sessions.Delete(id)

	// JSON-RPC Request
	input, _ := json.Marshal(map[string]interface{}{
		"jsonrpc": "2.0",
		"id":      id,
		"method":  "process",
		"params": map[string]interface{}{
			"html": html,
		},
	})
	if _, err := p.stdin.Write(append(input, '\n')); err != nil {
		return "", err
	}

	for {
		select {
		case res := <-resCh:
			return res.html, res.err
		case <-ctx.Done():
			return "", ctx.Err()
		case <-p.done:
			return "", fmt.Errorf("postprocess process terminated unexpectedly")
		}
	}
}

func (p *BatchProcessor) IsAlive() bool {
	if p.cmd == nil || p.cmd.Process == nil {
		return false
	}
	// closing フラグがセットされていれば終了中
	if p.closing.Load() {
		return false
	}
	// done チャネルが閉じられていなければ生存している
	select {
	case <-p.done:
		return false
	default:
		return true
	}
}

func (p *BatchProcessor) markDone() {
	p.doneOnce.Do(func() {
		close(p.done)
	})
}

func (p *BatchProcessor) Close() error {
	// 1. closing フラグをセット（新しいリクエストを拒否）
	p.closing.Store(true)

	// 2. done チャネルを閉じて待機中のすべての Process 呼び出しに通知
	p.markDone()

	// 3. すべての待機中セッションにエラーを送信
	p.sessions.Range(func(key, value interface{}) bool {
		sess := value.(*batchSession)
		select {
		case sess.resCh <- batchResult{err: fmt.Errorf("processor closing")}:
		default:
			// チャネルがすでに閉じられているか、別の結果が送信済み
		}
		return true
	})

	if p.stdin != nil {
		p.stdin.Close()
	}
	var err error
	if p.cmd != nil && p.cmd.Process != nil {
		if p.cmd.ProcessState == nil {
			_ = p.cmd.Process.Kill()
		}
		err = p.cmd.Wait()
	}
	p.cancel()
	return err
}

func (app *AppImpl) PostprocessBatch(ctx context.Context, idleTimeout time.Duration) (*BatchProcessor, error) {
	nodePath := app.config.NodePath
	if nodePath == "" {
		var err error
		nodePath, err = exec.LookPath("node")
		if err != nil {
			return nil, fmt.Errorf("node binary not found: %w", err)
		}
	}

	scriptPath := filepath.Join(app.config.BaseDir, "postprocess", "main.js")
	ctx, cancel := context.WithCancel(ctx)

	log.Printf("[postprocess] Starting new batch process: %s %s (idle-timeout: %v)", nodePath, scriptPath, idleTimeout)
	cmd := exec.CommandContext(ctx, nodePath, scriptPath,
		"--base-url", app.config.BaseURL,
		"--batch",
		"--idle-timeout", fmt.Sprintf("%d", idleTimeout.Milliseconds()),
	)
	stdin, err := cmd.StdinPipe()
	if err != nil {
		cancel()
		return nil, err
	}

	stdout, err := cmd.StdoutPipe()
	if err != nil {
		cancel()
		return nil, err
	}

	stderrPipe, err := cmd.StderrPipe()
	if err != nil {
		cancel()
		return nil, err
	}

	// JSON-RPC レスポンス用のバッファサイズ
	// 通常のエントリ: 100KB の HTML → JSON レスポンスで約 120KB
	// 大きなエントリ: 500KB の HTML → JSON レスポンスで約 600KB
	// 最大 2MB まで対応（安全マージン込み）
	stdoutScanner := bufio.NewScanner(stdout)
	const maxCapacity = 2 * 1024 * 1024 // 2MB
	stdoutScanner.Buffer(make([]byte, 64*1024), maxCapacity)

	p := &BatchProcessor{
		app:    app,
		cmd:    cmd,
		stdin:  stdin,
		stdout: stdoutScanner,
		cancel: cancel,
		done:   make(chan struct{}),
	}

	// stdout 読み取りループ (JSON-RPC 対応)
	go func() {
		defer p.markDone()
		for p.stdout.Scan() {
			var msg struct {
				JSONRPC string          `json:"jsonrpc"`
				ID      int64           `json:"id"`
				Method  string          `json:"method"`
				Params  json.RawMessage `json:"params"`
				Result  struct {
					HTML string `json:"html"`
				} `json:"result"`
				Error *struct {
					Code    int    `json:"code"`
					Message string `json:"message"`
					Data    struct {
						Stack string `json:"stack"`
					} `json:"data"`
				} `json:"error"`
			}
			if err := json.Unmarshal(p.stdout.Bytes(), &msg); err != nil {
				log.Printf("[postprocess] Failed to unmarshal JSON-RPC: %v (raw: %s)", err, p.stdout.Text())
				continue
			}

			// ID に基づいてセッションを特定
			val, ok := p.sessions.Load(msg.ID)
			if !ok {
				log.Printf("[postprocess] Received response for unknown ID: %d", msg.ID)
				continue
			}
			sess := val.(*batchSession)

			if msg.Method == "progress" {
				var params struct {
					Message string `json:"message"`
				}
				if err := json.Unmarshal(msg.Params, &params); err == nil {
					if sess.reporter != nil {
						sess.reporter.Report(params.Message)
					}
				}
				continue
			}

			if msg.Error != nil {
				errStr := msg.Error.Message
				if msg.Error.Data.Stack != "" {
					errStr += "\n" + msg.Error.Data.Stack
				}
				sess.resCh <- batchResult{err: fmt.Errorf("node error: %s", errStr)}
			} else {
				sess.resCh <- batchResult{html: msg.Result.HTML}
			}
		}
		if err := p.stdout.Err(); err != nil {
			log.Printf("[postprocess] stdout scan error: %v", err)
		}
		log.Printf("[postprocess] stdout read loop terminated")
	}()

	// stderr 読み取りループ (デバッグログ用)
	go func() {
		stderrScanner := bufio.NewScanner(stderrPipe)
		// stderr は通常のログ行なので 64KB で十分
		stderrScanner.Buffer(make([]byte, 4*1024), 64*1024)
		for stderrScanner.Scan() {
			log.Printf("[postprocess-stderr] %s", stderrScanner.Text())
		}
	}()

	if err := cmd.Start(); err != nil {
		cancel()
		return nil, err
	}

	return p, nil
}

func (app *AppImpl) EnqueuePublishedEntryJobs(ctx context.Context, entryID int64) error {
	// 1. 先行するジョブをエンキュー
	// TF-IDF再計算ジョブ
	j1, err := app.jobQueue.Enqueue(ctx, "RecalculateTFIDF",
		map[string]interface{}{"entry_id": entryID},
		fmt.Sprintf("recalc-tfidf-%d", entryID))
	if err != nil {
		return fmt.Errorf("failed to enqueue TF-IDF job: %w", err)
	}

	// Trackback更新ジョブ
	j2, err := app.jobQueue.Enqueue(ctx, "UpdateTrackbacks",
		map[string]interface{}{"entry_id": entryID},
		fmt.Sprintf("update-trackbacks-%d", entryID))
	if err != nil {
		return fmt.Errorf("failed to enqueue Trackback job: %w", err)
	}

	// 画像インデックスジョブ
	j3, err := app.jobQueue.Enqueue(ctx, "IndexImages",
		map[string]interface{}{"entry_id": entryID},
		fmt.Sprintf("index-images-%d", entryID))
	if err != nil {
		return fmt.Errorf("failed to enqueue IndexImages job: %w", err)
	}

	// 2. 先行ジョブがすべて成功した後に実行される FinalizeEntry ジョブをエンキュー
	dependsOn := &jobqueue.DependsOn{
		Dependencies: []jobqueue.Dependency{
			{ID: j1.ID, Condition: jobqueue.ConditionCompleted},
			{ID: j2.ID, Condition: jobqueue.ConditionCompleted},
			{ID: j3.ID, Condition: jobqueue.ConditionCompleted},
		},
		Strategy: jobqueue.StrategyAll,
	}

	_, err = app.jobQueue.EnqueueWithDepends(ctx, "FinalizeEntry",
		map[string]interface{}{"entry_id": entryID},
		fmt.Sprintf("finalize-entry-%d", entryID),
		dependsOn)
	if err != nil {
		return fmt.Errorf("failed to enqueue FinalizeEntry job: %w", err)
	}

	return nil
}

// createProgressSession は新しい進捗セッションを作成する
func (app *AppImpl) createProgressSession() *ProgressSession {
	session := &ProgressSession{
		ID:        uuid.New().String(),
		CreatedAt: time.Now(),
		Messages:  make(chan string, 10), // バッファ付き
		Done:      make(chan error, 1),
	}
	app.progressSessions.Store(session.ID, session)

	// 5分後に自動クリーンアップ（念のため）
	time.AfterFunc(5*time.Minute, func() {
		app.cleanupProgressSession(session.ID)
	})

	return session
}

// cleanupProgressSession はセッションをクリーンアップする
func (app *AppImpl) cleanupProgressSession(id string) {
	if val, ok := app.progressSessions.LoadAndDelete(id); ok {
		session := val.(*ProgressSession)
		close(session.Messages)
		// Done チャネルは送信側がクローズする
	}
}
