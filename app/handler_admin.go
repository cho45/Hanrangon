package app

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"mime"
	"net/http"
	"path/filepath"
	"runtime"
	"strconv"
	"time"

	"github.com/cho45/hanrangon/formatter"
	"github.com/cho45/hanrangon/model"
	"github.com/cho45/hanrangon/view"
	"github.com/gorilla/sessions"
	"github.com/labstack/echo-contrib/session"
	"github.com/labstack/echo/v4"
	"golang.org/x/crypto/bcrypt"
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
		LayoutData: app.newLayoutData(c, "エントリ編集"),
		SessionKey: sk,
	}
	return app.templates.RenderWithLayout(c, "admin/layout.html", "admin/index.html", data)
}

func (app *AppImpl) HandleAdminIndex(c echo.Context) error {
	cookie, _ := c.Cookie(CSRFCookieName)
	sk := ""
	if cookie != nil {
		sk = cookie.Value
	}

	data := &view.AdminIndexData{
		LayoutData: app.newLayoutData(c, "管理画面"),
		SessionKey: sk,
	}
	return app.templates.RenderWithLayout(c, "admin/layout.html", "admin/index.html", data)
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
		LayoutData: app.newLayoutData(c, "ログイン"),
		ErrorMsg:   "",
		ReturnPath: returnPath,
		SessionKey: sk,
	}
	return app.templates.Render(c, "admin/login.html", data)
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

	if username == app.config.Username && bcrypt.CompareHashAndPassword([]byte(app.config.Password), []byte(password)) == nil {
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
	return app.templates.Render(c, "admin/login.html", data)
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
		summary, imageURL := view.ExtractSummaryAndFirstImage(processedBody, 70)

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
				Summary:       summary,
				ImageUrl:      imageURL,
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

			// OGPキャッシュを破棄
			if err := app.InvalidateOGPCache(row.ID); err != nil {
				log.Printf("Failed to invalidate OGP cache: %v", err)
			}

			// ジョブエンキュー
			if row.Status == "public" {
				if err := app.EnqueuePublishedEntryJobs(ctx, row.ID); err != nil {
					log.Printf("Failed to enqueue jobs: %v", err)
					app.sendProgressMessage(session, fmt.Sprintf("警告: 一部の非同期ジョブの投入に失敗しました: %v", err))
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
				Summary:       summary,
				ImageUrl:      imageURL,
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

			// ジョブエンキュー
			if row.Status == "public" {
				if err := app.EnqueuePublishedEntryJobs(ctx, row.ID); err != nil {
					log.Printf("Failed to enqueue jobs: %v", err)
					app.sendProgressMessage(session, fmt.Sprintf("警告: 一部の非同期ジョブの投入に失敗しました: %v", err))
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
	// Normalize filename to NFC and add timestamp prefix.
	// Use filepath.Base to prevent path traversal.
	filename := fmt.Sprintf("%s-%s", now.Format("20060102150405"), filepath.Base(norm.NFC.String(file.Filename)))

	// Content-Typeの判定
	contentType := file.Header.Get("Content-Type")
	if contentType == "" {
		// MIMEタイプを拡張子から推測
		contentType = mime.TypeByExtension(filepath.Ext(filename))
		if contentType == "" {
			contentType = "application/octet-stream"
		}
	}

	// ストレージクライアントを使ってアップロード
	publicURL, err := app.storage.Upload(c.Request().Context(), filename, src, contentType)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to upload file").SetInternal(err)
	}

	return c.JSON(http.StatusOK, map[string]string{
		"uploaded": publicURL,
	})
}

func (app *AppImpl) HandleAdminApiEntries(c echo.Context) error {
	limit, _ := strconv.Atoi(c.QueryParam("limit"))
	if limit <= 0 {
		limit = 50
	}
	search := c.QueryParam("q")
	cursorIdStr := c.QueryParam("cursor_id")

	var cursorId int64
	if cursorIdStr != "" {
		cursorId, _ = strconv.ParseInt(cursorIdStr, 10, 64)
	}

	var entries []model.Entry
	var err error
	fetchLimit := int64(limit + 1)

	if search != "" {
		q := "%" + search + "%"
		var err error
		entries, err = app.queries.SearchEntriesAdmin(c.Request().Context(), model.SearchEntriesAdminParams{
			Query:    q,
			CursorID: sql.NullInt64{Int64: cursorId, Valid: cursorId != 0},
			Limit:    fetchLimit,
		})
		if err != nil {
			return err
		}
	} else {
		var err error
		entries, err = app.queries.ListEntriesAdmin(c.Request().Context(), model.ListEntriesAdminParams{
			CursorID: sql.NullInt64{Int64: cursorId, Valid: cursorId != 0},
			Limit:    fetchLimit,
		})
		if err != nil {
			return err
		}
	}

	if err != nil {
		return err
	}

	hasMore := false
	if len(entries) > limit {
		hasMore = true
		entries = entries[:limit]
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"entries":  entries,
		"has_more": hasMore,
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

var startTime = time.Now()

func (app *AppImpl) HandleAdminApiInfo(c echo.Context) error {
	var m runtime.MemStats
	runtime.ReadMemStats(&m)

	// Sanitize config
	configMap := map[string]interface{}{
		"data_db_path":      app.config.DataDBPath,
		"images_db_path":    app.config.ImagesDBPath,
		"tfidf_db_path":     app.config.TFIDFDBPath,
		"worker_db_path":    app.config.WorkerDBPath,
		"static_dir":        app.config.StaticDir,
		"username":          app.config.Username,
		"upload_dir":        app.config.UploadDir,
		"upload_url_prefix": app.config.UploadURLPrefix,
		"base_url":          app.config.BaseURL,
		"listen":            app.config.Listen,
		"environment":       app.config.Environment,
		"node_path":         app.config.NodePath,
	}

	tfidfStats, _ := app.tfidfQueries.GetTFIDFStats(c.Request().Context())
	topTerms, _ := app.tfidfQueries.GetTopTermsByDF(c.Request().Context(), 20)
	avgScore, _ := app.tfidfQueries.GetAverageSimilarityScore(c.Request().Context())

	return c.JSON(http.StatusOK, map[string]interface{}{
		"is_development": app.config.IsDevelopment(),
		"app_hash":       AppHash,
		"config":         configMap,
		"tfidf_stats": map[string]interface{}{
			"total_terms":          tfidfStats.TotalTerms,
			"indexed_entries":      tfidfStats.IndexedEntries,
			"total_related_pairs":  tfidfStats.TotalRelatedPairs,
			"entries_with_related": tfidfStats.EntriesWithRelated,
			"top_terms":            topTerms,
			"avg_score":            avgScore,
		},
		"debug_info": map[string]interface{}{
			"go_version":      runtime.Version(),
			"num_goroutine":   runtime.NumGoroutine(),
			"start_time":      startTime.Format(time.RFC3339),
			"uptime":          time.Since(startTime).String(),
			"mem_alloc":       m.Alloc,
			"mem_total_alloc": m.TotalAlloc,
			"mem_sys":         m.Sys,
			"num_gc":          m.NumGC,
		},
	})
}
