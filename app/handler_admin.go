package app

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"net/url"
	"os"
	"path/filepath"
	"strconv"
	"time"

	"github.com/cho45/hanrangon/formatter"
	"github.com/cho45/hanrangon/model"
	"github.com/cho45/hanrangon/view"
	"github.com/gorilla/sessions"
	"github.com/labstack/echo-contrib/session"
	"github.com/labstack/echo/v4"
	"golang.org/x/text/unicode/norm"
)

type EditRequest struct {
	ID        int64  `json:"id" form:"id"`
	Title     string `json:"title" form:"title"`
	Body      string `json:"body" form:"body"`
	Format    string `json:"format" form:"format"`
	Path      string `json:"path" form:"path"`
	Status    string `json:"status" form:"status"`
	PublishAt string `json:"publish_at" form:"publish_at"`
}

type EditResponse struct {
	SessionID string `json:"session_id"` // session_id のみに簡略化
}

func (app *AppImpl) HandleAdminEdit(c echo.Context) error {
	cookie, _ := c.Cookie(CSRFCookieName)
	sk := ""
	if cookie != nil {
		sk = cookie.Value
	}

	data := &view.AdminIndexData{
		LayoutData: view.LayoutData{
			PageTitle: "エントリ編集",
			IsAuth:    true,
		},
		SessionKey: sk,
	}
	return app.templates.RenderWithLayout(c.Response(), "admin/layout.html", "admin/index.html", data)
}

func (app *AppImpl) HandleAdminIndex(c echo.Context) error {
	cookie, _ := c.Cookie(CSRFCookieName)
	sk := ""
	if cookie != nil {
		sk = cookie.Value
	}

	data := &view.AdminIndexData{
		LayoutData: view.LayoutData{
			PageTitle: "管理画面",
			IsAuth:    true,
		},
		SessionKey: sk,
	}
	return app.templates.RenderWithLayout(c.Response(), "admin/layout.html", "admin/index.html", data)
}

func (app *AppImpl) HandleLogin(c echo.Context) error {
	returnPath := c.QueryParam("return")
	if returnPath == "" {
		returnPath = "/"
	}

	if app.IsAuth(c) {
		if returnPath == "/" {
			returnPath = "/admin/edit"
		}
		return c.Redirect(http.StatusFound, returnPath)
	}

	cookie, _ := c.Cookie(CSRFCookieName)
	sk := ""
	if cookie != nil {
		sk = cookie.Value
	}

	data := &view.LoginData{
		ErrorMsg:   "",
		ReturnPath: returnPath,
		SessionKey: sk,
	}
	return app.templates.Render(c.Response(), "admin/login.html", data)
}

func (app *AppImpl) HandleLoginPost(c echo.Context) error {
	returnPath := c.FormValue("return")
	if returnPath == "" {
		returnPath = "/"
	}

	if app.IsAuth(c) {
		if returnPath == "/" {
			returnPath = "/admin/edit"
		}
		return c.Redirect(http.StatusFound, returnPath)
	}

	username := c.FormValue("username")
	password := c.FormValue("password")

	if username == app.config.Username && password == app.config.Password {
		sess, _ := session.Get("session", c)
		sess.Options = &sessions.Options{
			Path:     "/",
			MaxAge:   86400 * 30,
			HttpOnly: true,
		}
		sess.Values["auth"] = true
		sess.Save(c.Request(), c.Response())

		if returnPath == "/" {
			returnPath = "/admin/edit"
		}
		return c.Redirect(http.StatusFound, returnPath)
	}

	data := &view.LoginData{
		ErrorMsg:   "Invalid Username or Password",
		ReturnPath: returnPath,
	}
	return app.templates.Render(c.Response(), "admin/login.html", data)
}

func (app *AppImpl) HandleLogout(c echo.Context) error {
	sess, _ := session.Get("session", c)
	sess.Options.MaxAge = -1
	sess.Save(c.Request(), c.Response())
	return c.Redirect(http.StatusFound, "/")
}

func (app *AppImpl) HandleAdminApiEditProgress(c echo.Context) error {
	sessionID := c.QueryParam("sid")
	if sessionID == "" {
		return echo.NewHTTPError(http.StatusBadRequest, "session ID required")
	}

	val, ok := app.progressSessions.Load(sessionID)
	if !ok {
		return echo.NewHTTPError(http.StatusNotFound, "session not found")
	}
	session := val.(*ProgressSession)

	// SSEヘッダー設定
	c.Response().Header().Set("Content-Type", "text/event-stream")
	c.Response().Header().Set("Cache-Control", "no-cache")
	c.Response().Header().Set("Connection", "keep-alive")
	c.Response().Header().Set("X-Accel-Buffering", "no") // nginx バッファリング無効化
	c.Response().WriteHeader(http.StatusOK)

	// 初回メッセージ（接続確認）
	connectMsg := map[string]string{"type": "connected"}
	connectJSON, _ := json.Marshal(connectMsg)
	fmt.Fprintf(c.Response().Writer, "data: %s\n\n", connectJSON)
	c.Response().Flush()

	ticker := time.NewTicker(15 * time.Second)
	defer ticker.Stop()

	// 進捗配信ループ
	for {
		select {
		case msg, ok := <-session.Messages:
			if !ok {
				// チャネルクローズ
				return nil
			}
			// すべてのメッセージはすでにJSON形式
			fmt.Fprintf(c.Response().Writer, "data: %s\n\n", msg)
			c.Response().Flush()

		case err := <-session.Done:
			if err != nil {
				// JSON形式でエラーを送信
				errMsg := map[string]string{"type": "error", "message": err.Error()}
				errJSON, _ := json.Marshal(errMsg)
				fmt.Fprintf(c.Response().Writer, "data: %s\n\n", errJSON)
			}
			c.Response().Flush()
			return nil

		case <-ticker.C:
			// Heartbeat（接続維持）
			fmt.Fprintf(c.Response().Writer, ": heartbeat\n\n")
			c.Response().Flush()

		case <-c.Request().Context().Done():
			// クライアント切断
			log.Printf("[SSE] Client disconnected: %s", sessionID)
			return nil
		}
	}
}

func (app *AppImpl) HandleAdminApiEdit(c echo.Context) error {
	// 1. リクエスト検証
	req := new(EditRequest)
	if err := c.Bind(req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Invalid request payload").SetInternal(err)
	}

	if req.Format == "" {
		req.Format = "Hatena" // Default
	}

	if req.Status == "" {
		req.Status = "public"
	}

	var publishAt sql.NullTime
	if req.PublishAt != "" {
		t, err := time.Parse(time.RFC3339, req.PublishAt)
		if err != nil {
			return echo.NewHTTPError(http.StatusBadRequest, "Invalid publish_at format").SetInternal(err)
		}
		publishAt = sql.NullTime{Time: t, Valid: true}
	}

	// 2. ProgressSession作成
	session := app.createProgressSession()

	// 3. goroutineで全処理を非同期実行
	go func() {
		defer app.cleanupProgressSession(session.ID)

		// detached context（HTTPリクエストから独立）
		ctx := context.Background()
		ctx, cancel := context.WithTimeout(ctx, 60*time.Second)
		defer cancel()

		// 3-1. Format
		app.sendProgressMessage(session, "フォーマット処理中...")
		formattedBody, err := formatter.Format(req.Body, req.Format)
		if err != nil {
			app.sendProgressMessage(session, fmt.Sprintf("フォーマットエラー: %v", err))
			session.Done <- err
			return
		}
		app.sendProgressMessage(session, "フォーマット完了")

		// 3-2. Postprocess
		app.sendProgressMessage(session, "postprocess開始")
		processedBody, err := app.PostprocessWithProgress(ctx, formattedBody, session)
		if err != nil {
			log.Printf("Postprocess failed: %v", err)
			app.sendProgressMessage(session, fmt.Sprintf("postprocessエラー: %v（続行）", err))
			// エラーでも続行（現在の挙動を維持）
			processedBody = formattedBody
		} else {
			app.sendProgressMessage(session, "postprocess完了")
		}

		// 3-3. DB保存（完全な状態で保存）
		app.sendProgressMessage(session, "データベース保存中...")
		var location string

		now := time.Now()
		date := now.Format("2006-01-02")

		if req.ID != 0 {
			// 更新
			existing, err := app.queries.GetEntryById(ctx, req.ID)
			if err != nil {
				app.sendProgressMessage(session, fmt.Sprintf("エントリ取得エラー: %v", err))
				session.Done <- err
				return
			}

			path := req.Path
			if path == "" {
				path = existing.Path
			}

			row, err := app.queries.UpdateEntry(ctx, model.UpdateEntryParams{
				ID:            req.ID,
				Title:         req.Title,
				Body:          req.Body,
				FormattedBody: processedBody,
				Path:          path,
				Format:        req.Format,
				Date:          existing.Date,
				ModifiedAt:    now,
				PublishAt:     publishAt,
				Status:        req.Status,
			})
			if err != nil {
				app.sendProgressMessage(session, fmt.Sprintf("更新エラー: %v", err))
				session.Done <- err
				return
			}
			location = "/" + row.Path

			// ジョブエンキュー
			if row.Status == "public" {
				if err := app.EnqueuePublishedEntryJobs(ctx, row.ID); err != nil {
					log.Printf("Failed to enqueue jobs: %v", err)
				}
			}
		} else {
			// 新規作成
			count, err := app.queries.CountEntriesByDate(ctx, date)
			if err != nil {
				app.sendProgressMessage(session, fmt.Sprintf("カウントエラー: %v", err))
				session.Done <- err
				return
			}

			path := req.Path
			if path == "" {
				path = fmt.Sprintf("%s/%d", now.Format("2006/01/02"), count+1)
			}

			row, err := app.queries.CreateEntry(ctx, model.CreateEntryParams{
				Title:         req.Title,
				Body:          req.Body,
				FormattedBody: processedBody,
				Path:          path,
				Format:        req.Format,
				Date:          date,
				CreatedAt:     now,
				ModifiedAt:    now,
				PublishAt:     publishAt,
				Status:        req.Status,
			})
			if err != nil {
				app.sendProgressMessage(session, fmt.Sprintf("作成エラー: %v", err))
				session.Done <- err
				return
			}
			location = "/" + row.Path

			// ジョブエンキュー（進捗通知なし）
			if row.Status == "public" {
				if err := app.EnqueuePublishedEntryJobs(ctx, row.ID); err != nil {
					log.Printf("Failed to enqueue jobs: %v", err)
				}
			}
		}

		app.sendProgressMessage(session, "保存完了")

		// 3-4. 完了（location を含めて送信）
		doneMsg := map[string]interface{}{"type": "done", "location": location}
		doneJSON, _ := json.Marshal(doneMsg)
		session.Messages <- string(doneJSON)
		// Done チャネルはエラー時のみ使用（正常終了時は Messages のみ）
	}()

	// 4. 即座にレスポンス返却（session_id のみ）
	return c.JSON(http.StatusOK, EditResponse{
		SessionID: session.ID,
	})
}

func (app *AppImpl) HandleAdminApiUploadImage(c echo.Context) error {
	file, err := c.FormFile("file")
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Missing file").SetInternal(err)
	}

	src, err := file.Open()
	if err != nil {
		return err
	}
	defer src.Close()

	now := time.Now()
	// Normalize filename to NFC and add timestamp prefix
	filename := fmt.Sprintf("%s-%s", now.Format("20060102150405"), norm.NFC.String(file.Filename))

	destPath := filepath.Join(app.config.UploadDir, filename)

	// Ensure directory exists
	if err := os.MkdirAll(filepath.Dir(destPath), 0755); err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to create upload directory").SetInternal(err)
	}

	dst, err := os.Create(destPath)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to create destination file").SetInternal(err)
	}
	defer dst.Close()

	if _, err = io.Copy(dst, src); err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to save file").SetInternal(err)
	}

	// URL-escape the filename for the response
	return c.JSON(http.StatusOK, map[string]string{
		"uploaded": fmt.Sprintf("/images/entry/%s", url.PathEscape(filename)),
	})
}

func (app *AppImpl) HandleAdminApiEntries(c echo.Context) error {
	limit, _ := strconv.Atoi(c.QueryParam("limit"))
	if limit <= 0 {
		limit = 50
	}
	offset, _ := strconv.Atoi(c.QueryParam("offset"))

	entries, err := app.queries.ListEntriesAdmin(c.Request().Context(), model.ListEntriesAdminParams{
		Limit:  int64(limit),
		Offset: int64(offset),
	})
	if err != nil {
		return err
	}

	total, _ := app.queries.CountAllEntries(c.Request().Context())

	return c.JSON(http.StatusOK, map[string]interface{}{
		"entries": entries,
		"total":   total,
	})
}

func (app *AppImpl) HandleAdminApiEntry(c echo.Context) error {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Invalid ID")
	}

	entry, err := app.queries.GetEntryById(c.Request().Context(), id)
	if err != nil {
		if err == sql.ErrNoRows {
			return echo.NewHTTPError(http.StatusNotFound, "Entry not found")
		}
		return err
	}

	return c.JSON(http.StatusOK, entry)
}

func (app *AppImpl) HandleAdminApiJobs(c echo.Context) error {
	limit, _ := strconv.Atoi(c.QueryParam("limit"))
	if limit <= 0 {
		limit = 50
	}
	offset, _ := strconv.Atoi(c.QueryParam("offset"))

	jobs, err := app.workerQueries.ListJobs(c.Request().Context(), model.ListJobsParams{
		Limit:  int64(limit),
		Offset: int64(offset),
	})
	if err != nil {
		return err
	}

	total, _ := app.workerQueries.CountJobs(c.Request().Context())

	return c.JSON(http.StatusOK, map[string]interface{}{
		"jobs":  jobs,
		"total": total,
	})
}
