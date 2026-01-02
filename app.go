package main

import (
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
	"github.com/labstack/echo-contrib/session"
	"github.com/labstack/echo/v4"
)

type App struct {
	queries       *model.Queries
	db            *sql.DB
	tfidfQueries  *model.Queries
	tfidfDB       *sql.DB
	workerQueries *model.Queries
	workerDB      *sql.DB
	jobQueue      *jobqueue.Queue
	config        *Config
}

func NewApp(config *Config, db *sql.DB, tfidfDB *sql.DB, workerDB *sql.DB, queue *jobqueue.Queue) *App {
	return &App{
		queries:       model.New(db),
		db:            db,
		tfidfQueries:  model.New(tfidfDB),
		tfidfDB:       tfidfDB,
		workerQueries: model.New(workerDB),
		workerDB:      workerDB,
		jobQueue:      queue,
		config:        config,
	}
}

func (app *App) RequireAuth(next echo.HandlerFunc) echo.HandlerFunc {

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

func (app *App) IsAuth(c echo.Context) bool {

	sess, _ := session.Get("session", c)

	auth, ok := sess.Values["auth"].(bool)

	return ok && auth

}

// postprocess はフォーマット済み HTML に対して postprocess を実行する
// MathJax、シンタックスハイライト、画像処理、ウィジェット処理を行う
func (app *App) postprocess(ctx context.Context, html string) (string, error) {
	start := time.Now()
	log.Printf("[postprocess] Starting postprocess (input size: %d bytes)", len(html))

	// タイムアウト設定（30秒）
	ctx, cancel := context.WithTimeout(ctx, 30*time.Second)
	defer cancel()

	// Node.js スクリプトのパス（プロジェクトルートからの相対パス）
	scriptPath := filepath.Join(app.config.StaticDir, "../postprocess/main.js")

	cmd := exec.CommandContext(ctx, "node", scriptPath)
	cmd.Stdin = bytes.NewReader([]byte(html))

	var stdout, stderr bytes.Buffer
	cmd.Stdout = &stdout
	cmd.Stderr = &stderr

	if err := cmd.Run(); err != nil {
		log.Printf("[postprocess] Failed after %v: %v", time.Since(start), err)
		return "", fmt.Errorf("postprocess failed: %w, stderr: %s", err, stderr.String())
	}

	elapsed := time.Since(start)
	log.Printf("[postprocess] Completed successfully in %v (output size: %d bytes)", elapsed, stdout.Len())

	return stdout.String(), nil
}
