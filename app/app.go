package app

import (
	"bufio"
	"bytes"
	"context"
	"database/sql"
	"fmt"
	"log"
	"net/http"
	"os/exec"
	"path/filepath"
	"strings"
	"time"

	"github.com/cho45/hanrangon/jobqueue"
	"github.com/cho45/hanrangon/model"
	"github.com/cho45/hanrangon/tfidf"
	"github.com/labstack/echo-contrib/session"
	"github.com/labstack/echo/v4"
)

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
	jobQueue             *jobqueue.Queue
	config               *Config
	templates            *Templates
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
	queue *jobqueue.Queue,
) App {
	templates, err := LoadTemplates(config)
	if err != nil {
		log.Fatalf("failed to load templates: %v", err)
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
		jobQueue:             queue,
		config:               config,
		templates:            templates,
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
func (a *AppImpl) JobQueue() *jobqueue.Queue                         { return a.jobQueue }
func (a *AppImpl) Config() *Config                                   { return a.config }
func (a *AppImpl) Templates() *Templates                             { return a.templates }

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
	log.Printf("[postprocess] Starting postprocess (input size: %d bytes)", len(html))

	// タイムアウト設定（30秒）
	ctx, cancel := context.WithTimeout(ctx, 30*time.Second)
	defer cancel()

	// Node.js スクリプトのパス（プロジェクトルートからの相対パス）
	scriptPath := filepath.Join(app.config.StaticDir, "../postprocess/main.js")

	cmd := exec.CommandContext(ctx, "node", scriptPath)
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
