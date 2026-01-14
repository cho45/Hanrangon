package app

import (
	"bufio"
	"bytes"
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os/exec"
	"path/filepath"
	"strconv"
	"strings"
	"sync"
	"time"

	"github.com/cho45/hanrangon/backend/jobqueue"
	"github.com/cho45/hanrangon/backend/model"
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

// AppImpl は App インターフェースの具象実装
type AppImpl struct {
	queries              *model.Queries
	db                   *sql.DB
	tfidfQueries         *model.Queries
	tfidfDB              *sql.DB
	workerQueries        *model.Queries
	workerDB             *sql.DB
	imagesQueries        *model.Queries
	imagesDB             *sql.DB
	calculator           *tfidf.Calculator
	similarityCalculator *tfidf.SimilarityCalculator
	searcher             *tfidf.Searcher
	jobQueue             *jobqueue.Worker
	config               *Config
	templates            *Templates
	progressSessions     sync.Map // map[sessionID]*ProgressSession
	storage              StorageClient
	imageProcessor       *ImageProcessor
}

// NewApp creates a new App instance
func NewApp(
	config *Config,
	db *sql.DB,
	tfidfDB *sql.DB,
	workerDB *sql.DB,
	imagesDB *sql.DB,
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

	return &AppImpl{
		queries:              model.New(db),
		db:                   db,
		tfidfQueries:         model.New(tfidfDB),
		tfidfDB:              tfidfDB,
		workerQueries:        model.New(workerDB),
		workerDB:             workerDB,
		imagesQueries:        model.New(imagesDB),
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
}

// Getter implementations
func (a *AppImpl) Queries() *model.Queries                           { return a.queries }
func (a *AppImpl) DB() *sql.DB                                       { return a.db }
func (a *AppImpl) TFIDFQueries() *model.Queries                      { return a.tfidfQueries }
func (a *AppImpl) TFIDFDB() *sql.DB                                  { return a.tfidfDB }
func (a *AppImpl) WorkerQueries() *model.Queries                     { return a.workerQueries }
func (a *AppImpl) WorkerDB() *sql.DB                                 { return a.workerDB }
func (a *AppImpl) ImagesQueries() *model.Queries                     { return a.imagesQueries }
func (a *AppImpl) ImagesDB() *sql.DB                                 { return a.imagesDB }
func (a *AppImpl) Calculator() *tfidf.Calculator                     { return a.calculator }
func (a *AppImpl) SimilarityCalculator() *tfidf.SimilarityCalculator { return a.similarityCalculator }
func (a *AppImpl) Searcher() *tfidf.Searcher                         { return a.searcher }
func (a *AppImpl) JobQueue() *jobqueue.Worker                        { return a.jobQueue }
func (a *AppImpl) Config() *Config                                   { return a.config }
func (a *AppImpl) Templates() *Templates                             { return a.templates }

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

// Postprocess はフォーマット済み HTML に対して postprocess を実行する
// MathJax、シンタックスハイライト、画像処理、ウィジェット処理を行う
func (app *AppImpl) Postprocess(ctx context.Context, html string) (string, error) {
	start := time.Now()

	nodePath := app.config.NodePath
	if nodePath == "" {
		var err error
		nodePath, err = exec.LookPath("node")
		if err != nil {
			return "", fmt.Errorf("node binary not found in PATH and node_path is not configured: %w", err)
		}
	}
	log.Printf("[postprocess] Starting postprocess using %s (input size: %d bytes)", nodePath, len(html))

	// タイムアウト設定（30秒）
	ctx, cancel := context.WithTimeout(ctx, 30*time.Second)
	defer cancel()

	// Node.js スクリプトのパス（プロジェクトルートからの相対パス）
	// Node.js スクリプトのパス（プロジェクトルートからの相対パス）
	// Node.js スクリプトのパス（プロジェクトルートからの相対パス）
	scriptPath := filepath.Join(app.config.BaseDir, "postprocess", "main.js")

	cmd := exec.CommandContext(ctx, nodePath, scriptPath, "--base-url", app.config.BaseURL)
	cmd.Stdin = bytes.NewReader([]byte(html))

	var stdout bytes.Buffer
	cmd.Stdout = &stdout

	// stderr をリアルタイムでログに出力
	stderrPipe, err := cmd.StderrPipe()
	if err != nil {
		return "", fmt.Errorf("failed to create stderr pipe: %w", err)
	}

	// stderr を行ごとにログ出力する goroutine
	go func() {
		scanner := bufio.NewScanner(stderrPipe)
		for scanner.Scan() {
			log.Printf("[postprocess] %s", scanner.Text())
		}
	}()

	if err := cmd.Run(); err != nil {
		log.Printf("[postprocess] Failed after %v: %v", time.Since(start), err)
		return "", fmt.Errorf("postprocess failed: %w", err)
	}

	elapsed := time.Since(start)
	log.Printf("[postprocess] Completed successfully in %v (output size: %d bytes)", elapsed, stdout.Len())

	return stdout.String(), nil
}

// PostprocessWithProgress は進捗通知付きでpostprocessを実行する
func (app *AppImpl) PostprocessWithProgress(ctx context.Context, html string, session *ProgressSession) (string, error) {
	start := time.Now()

	nodePath := app.config.NodePath
	if nodePath == "" {
		var err error
		nodePath, err = exec.LookPath("node")
		if err != nil {
			return "", fmt.Errorf("node binary not found in PATH and node_path is not configured: %w", err)
		}
	}
	log.Printf("[postprocess] Starting postprocess using %s (input size: %d bytes)", nodePath, len(html))

	// タイムアウト設定（30秒）
	ctx, cancel := context.WithTimeout(ctx, 30*time.Second)
	defer cancel()

	// Node.js スクリプトのパス
	// Node.js スクリプトのパス（プロジェクトルートからの相対パス）
	// Node.js スクリプトのパス（プロジェクトルートからの相対パス）
	scriptPath := filepath.Join(app.config.BaseDir, "postprocess", "main.js")

	cmd := exec.CommandContext(ctx, nodePath, scriptPath, "--base-url", app.config.BaseURL)
	cmd.Stdin = bytes.NewReader([]byte(html))

	var stdout bytes.Buffer
	cmd.Stdout = &stdout

	// stderr をリアルタイムでログに出力し、SSE に送信
	stderrPipe, err := cmd.StderrPipe()
	if err != nil {
		return "", fmt.Errorf("failed to create stderr pipe: %w", err)
	}

	var wg sync.WaitGroup
	wg.Add(1)
	// stderr を行ごとにログ出力＆SSE送信する goroutine
	go func() {
		defer wg.Done()
		scanner := bufio.NewScanner(stderrPipe)
		for scanner.Scan() {
			line := scanner.Text()
			log.Printf("[postprocess] %s", line)

			// JSON形式でSSEに送信（非ブロッキング）
			msg := map[string]string{"type": "progress", "message": line}
			msgJSON, _ := json.Marshal(msg)
			select {
			case session.Messages <- string(msgJSON):
			case <-ctx.Done():
				return
			default:
				// クライアントの読み取りが遅い、またはバッファがいっぱいの場合はスキップ
			}
		}
	}()

	if err := cmd.Run(); err != nil {
		log.Printf("[postprocess] Failed after %v: %v", time.Since(start), err)
		wg.Wait()
		return "", fmt.Errorf("postprocess failed: %w", err)
	}

	wg.Wait()
	elapsed := time.Since(start)
	log.Printf("[postprocess] Completed successfully in %v (output size: %d bytes)", elapsed, stdout.Len())

	return stdout.String(), nil
}

type BatchProcessor struct {
	cmd    *exec.Cmd
	stdin  io.WriteCloser
	stdout *bufio.Scanner
	cancel context.CancelFunc
}

func (p *BatchProcessor) Process(id int64, html string) (string, error) {
	input, _ := json.Marshal(map[string]interface{}{
		"id":   id,
		"html": html,
	})
	if _, err := p.stdin.Write(append(input, '\n')); err != nil {
		return "", err
	}

	if !p.stdout.Scan() {
		return "", fmt.Errorf("batch processor stdout closed unexpectedly")
	}

	var output struct {
		ID    int64  `json:"id"`
		HTML  string `json:"html"`
		Error string `json:"error"`
	}
	if err := json.Unmarshal(p.stdout.Bytes(), &output); err != nil {
		return "", err
	}

	if output.Error != "" {
		return "", fmt.Errorf("node error: %s", output.Error)
	}

	return output.HTML, nil
}

func (p *BatchProcessor) Close() error {
	p.stdin.Close()
	err := p.cmd.Wait()
	p.cancel()
	return err
}

// beginImmediate は SQLite において BEGIN IMMEDIATE を発行し、即座に書き込みロックを取得する。
// 標準の BeginTx では SQLite の BEGIN IMMEDIATE を制御できないため、
// 一旦 Begin してから明示的にコマンドを発行する。
func (app *AppImpl) beginImmediate(ctx context.Context) (*sql.Tx, error) {
	tx, err := app.db.BeginTx(ctx, nil)
	if err != nil {
		return nil, err
	}
	if _, err := tx.ExecContext(ctx, "ROLLBACK; BEGIN IMMEDIATE"); err != nil {
		tx.Rollback()
		return nil, err
	}
	return tx, nil
}

// CalculateNextPath は指定日の既存パスの中から最大の N を探し、N+1 のパスを生成する
func (app *AppImpl) CalculateNextPath(ctx context.Context, qtx *model.Queries, date string) (string, error) {
	paths, err := qtx.ListPathsByDate(ctx, date)
	if err != nil {
		return "", err
	}

	prefix := strings.ReplaceAll(date, "-", "/") + "/"
	maxN := 0

	for _, p := range paths {
		if strings.HasPrefix(p, prefix) {
			nStr := strings.TrimPrefix(p, prefix)
			if n, err := strconv.Atoi(nStr); err == nil {
				if n > maxN {
					maxN = n
				}
			}
		}
	}

	return fmt.Sprintf("%s/%d", strings.ReplaceAll(date, "-", "/"), maxN+1), nil
}

func (app *AppImpl) PostprocessBatch(ctx context.Context) (*BatchProcessor, error) {
	nodePath := app.config.NodePath
	if nodePath == "" {
		var err error
		nodePath, err = exec.LookPath("node")
		if err != nil {
			return nil, fmt.Errorf("node binary not found: %w", err)
		}
	}

	// Node.js スクリプトのパス（プロジェクトルートからの相対パス）
	scriptPath := filepath.Join(app.config.BaseDir, "postprocess", "main.js")
	ctx, cancel := context.WithCancel(ctx)

	cmd := exec.CommandContext(ctx, nodePath, scriptPath, "--base-url", app.config.BaseURL, "--batch")
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

	go func() {
		scanner := bufio.NewScanner(stderrPipe)
		for scanner.Scan() {
			log.Printf("[postprocess-batch] %s", scanner.Text())
		}
	}()

	if err := cmd.Start(); err != nil {
		cancel()
		return nil, err
	}

	return &BatchProcessor{
		cmd:    cmd,
		stdin:  stdin,
		stdout: bufio.NewScanner(stdout),
		cancel: cancel,
	}, nil
}

func (app *AppImpl) PublishScheduledEntries(ctx context.Context) error {
	now := time.Now()
	entries, err := app.queries.FindScheduledEntriesToPublish(ctx, sql.NullTime{Time: now, Valid: true})
	if err != nil {
		return fmt.Errorf("failed to find scheduled entries: %w", err)
	}

	if len(entries) == 0 {
		return nil
	}

	for _, e := range entries {
		err := func() error {
			// SQLite において、読み取りから書き込みまでの間に他者が割り込まないよう
			// トランザクション開始時に即座に書き込みロックを取得する
			tx, err := app.beginImmediate(ctx)
			if err != nil {
				return err
			}
			defer tx.Rollback()

			qtx := app.queries.WithTx(tx)

			// パスが確定していない「予約投稿 (Reserve)」かどうかを判定する
			if e.IsReserved() {
				// 予約投稿 (Reserve):
				// 保存時にパスを空に設定している。
				// 公開タイミングで、公開予定日の記事数に基づき YYYY/MM/DD/N 形式でパスを採番・確定させる。
				date := e.PublishAt.Time.Format("2006-01-02")
				// パスを生成 (最大値+1)
				path, err := app.CalculateNextPath(ctx, qtx, date)
				if err != nil {
					return fmt.Errorf("failed to calculate next path for date %s: %w", date, err)
				}
				err = qtx.PublishEntry(ctx, model.PublishEntryParams{
					ID:         e.ID,
					Path:       path,
					Date:       date,
					ModifiedAt: now,
				})
				if err != nil {
					return fmt.Errorf("failed to update entry path %d: %w", e.ID, err)
				}
				log.Printf("Published reserved entry %d with path %s", e.ID, path)
			} else {
				// 公開を遅延 (PublishLater):
				// 保存時に既にパスが確定している状態 (IsScheduledLater)。
				// 既存のパスと日付をそのまま渡して公開状態にする。
				err = qtx.PublishEntry(ctx, model.PublishEntryParams{
					ID:         e.ID,
					Path:       e.Path,
					Date:       e.Date,
					ModifiedAt: now,
				})
				if err != nil {
					return fmt.Errorf("failed to publish entry %d: %w", e.ID, err)
				}
				log.Printf("Published scheduled entry %d", e.ID)
			}

			return tx.Commit()
		}()

		if err != nil {
			log.Printf("Error publishing entry %d: %v", e.ID, err)
			continue
		}

		if err := app.EnqueuePublishedEntryJobs(ctx, e.ID); err != nil {
			log.Printf("Failed to enqueue jobs for entry %d: %v", e.ID, err)
		}
	}

	return nil
}

func (app *AppImpl) EnqueuePublishedEntryJobs(ctx context.Context, entryID int64) error {
	// TF-IDF再計算ジョブをエンキュー
	err := app.jobQueue.Enqueue(ctx, "RecalculateTFIDF",
		map[string]interface{}{"entry_id": entryID},
		fmt.Sprintf("recalc-tfidf-%d", entryID))
	if err != nil {
		return fmt.Errorf("failed to enqueue TF-IDF job: %w", err)
	}

	// Trackback更新ジョブをエンキュー
	err = app.jobQueue.Enqueue(ctx, "UpdateTrackbacks",
		map[string]interface{}{"entry_id": entryID},
		fmt.Sprintf("update-trackbacks-%d", entryID))
	if err != nil {
		return fmt.Errorf("failed to enqueue Trackback job: %w", err)
	}

	// 画像インデックスジョブをエンキュー
	err = app.jobQueue.Enqueue(ctx, "IndexImages",
		map[string]interface{}{"entry_id": entryID},
		fmt.Sprintf("index-images-%d", entryID))
	if err != nil {
		return fmt.Errorf("failed to enqueue IndexImages job: %w", err)
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

// sendProgressMessage は進捗メッセージをJSON形式で送信する
func (app *AppImpl) sendProgressMessage(session *ProgressSession, message string) {
	msg := map[string]string{"type": "progress", "message": message}
	msgJSON, _ := json.Marshal(msg)
	session.Messages <- string(msgJSON)
}
