package app

import (
	"context"
	"database/sql"
	"encoding/binary"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"mime"
	"net/http"
	"os"
	"path/filepath"
	"runtime"
	"strconv"
	"time"

	"github.com/cho45/hanrangon/backend/formatter"
	"github.com/cho45/hanrangon/backend/model"
	"github.com/cho45/hanrangon/backend/view"
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

type InfoData struct {
	IsDevelopment bool                   `json:"is_development"`
	AppHash       string                 `json:"app_hash"`
	Config        map[string]interface{} `json:"config"`
	TFIDFStats    TFIDFStats             `json:"tfidf_stats"`
	ImageStats    ImageStats             `json:"image_stats"`
	DebugInfo     DebugInfo              `json:"debug_info"`
}

type TFIDFStats struct {
	TotalTerms         int64                      `json:"total_terms"`
	IndexedEntries     int64                      `json:"indexed_entries"`
	TotalRelatedPairs  int64                      `json:"total_related_pairs"`
	EntriesWithRelated int64                      `json:"entries_with_related"`
	TopTerms           []model.GetTopTermsByDFRow `json:"top_terms"`
	AvgScore           float64                    `json:"avg_score"`
}

type ImageStats struct {
	TotalImages     int64 `json:"total_images"`
	UnindexedImages int64 `json:"unindexed_images"`
}

type DebugInfo struct {
	GoVersion     string `json:"go_version"`
	NumGoroutine  int    `json:"num_goroutine"`
	StartTime     string `json:"start_time"`
	Uptime        string `json:"uptime"`
	MemAlloc      uint64 `json:"mem_alloc"`
	MemTotalAlloc uint64 `json:"mem_total_alloc"`
	MemSys        uint64 `json:"mem_sys"`
	NumGC         uint32 `json:"num_gc"`
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
		if err := sess.Save(c.Request(), c.Response()); err != nil {
			return err
		}

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
	if err := sess.Save(c.Request(), c.Response()); err != nil {
		return err
	}
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
	// NOTE: エントリ編集時（保存時）の状態遷移（status, date, path の相関関係）の
	// 詳細な仕様およびテストは backend/app/edit_test.go に集約されています。
	// 修正時は必ずそちらのテストをパスすることを確認してください。

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

	// ステータスのバリデーション
	status := req.Status
	now := time.Now()
	if status == string(model.StatusScheduled) || status == string(model.StatusReserved) {
		if !publishAt.Valid || !publishAt.Time.After(now) {
			msg := "Scheduled status requires a future publish_at"
			if status == string(model.StatusReserved) {
				msg = "Reserved status requires a future publish_at"
			}
			return echo.NewHTTPError(http.StatusBadRequest, msg)
		}
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

		// 3-3. DB保存
		app.sendProgressMessage(session, "データベース保存中...")

		tx, err := app.beginImmediate(ctx)
		if err != nil {
			app.sendProgressMessage(session, fmt.Sprintf("トランザクション（排他）開始エラー: %v", err))
			session.Done <- err
			return
		}
		defer tx.Rollback()

		qtx := app.queries.WithTx(tx)

		summary, imageURL := view.ExtractSummaryAndFirstImage(processedBody, 70)

		// 保存用パラメータの決定
		var date string
		var path string
		var existing model.Entry
		if req.ID != 0 {
			var err error
			existing, err = qtx.GetEntryById(ctx, req.ID)
			if err != nil {
				app.sendProgressMessage(session, fmt.Sprintf("エントリ取得エラー: %v", err))
				session.Done <- err
				return
			}
			date = existing.Date
			path = existing.Path

			// パスが未確定の状態で public/scheduled になる場合は、date を「今」にする
			if path == "" && (status == "public" || status == "scheduled") {
				date = now.Format("2006-01-02")
			}

			// reserved への変更時は、既存の date/path を維持する（公開時に CalculateNextPath されるため）
			if status == string(model.StatusReserved) {
				// 何もしない（既存の date, path を維持）
			} else if existing.Status == string(model.StatusReserved) {
				// reserved から public/scheduled になった場合は新規採番対象
				path = ""
				if status == string(model.StatusScheduled) || !publishAt.Valid {
					date = now.Format("2006-01-02")
				} else {
					date = publishAt.Time.Format("2006-01-02")
				}
			}
		} else {
			path = ""
			if status == string(model.StatusReserved) && publishAt.Valid {
				date = publishAt.Time.Format("2006-01-02")
			} else if status == string(model.StatusPublic) && publishAt.Valid {
				date = publishAt.Time.Format("2006-01-02")
			} else {
				date = now.Format("2006-01-02")
			}
		}

		// 公開時、または公開予定パス確定時の自動生成:
		// 公開状態 (public) または 公開遅延状態 (scheduled) かつパスが未確定 (empty) の場合、
		// その日の既存パスの最大値に基づき採番する。
		if path == "" && (status == "public" || status == "scheduled") {
			path, err = app.CalculateNextPath(ctx, qtx, date)
			if err != nil {
				app.sendProgressMessage(session, fmt.Sprintf("パス採番エラー: %v", err))
				session.Done <- err
				return
			}
		}

		var row model.Entry
		if req.ID != 0 {
			row, err = qtx.UpdateEntry(ctx, model.UpdateEntryParams{
				ID:            req.ID,
				Title:         req.Title,
				Body:          req.Body,
				FormattedBody: processedBody,
				Summary:       summary,
				ImageUrl:      imageURL,
				Path:          path,
				Format:        req.Format,
				Date:          date,
				ModifiedAt:    now,
				PublishAt:     publishAt,
				Status:        status,
			})
		} else {
			row, err = qtx.CreateEntry(ctx, model.CreateEntryParams{
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
				Status:        status,
			})
		}

		if err == nil {
			err = tx.Commit()
		}

		if err != nil {
			app.sendProgressMessage(session, fmt.Sprintf("保存エラー: %v", err))
			session.Done <- err
			return
		}

		// 保存後の共通処理
		if req.ID != 0 {
			if err := app.InvalidateOGPCache(row.ID); err != nil {
				log.Printf("Failed to invalidate OGP cache: %v", err)
			}
		}

		if row.Status == "public" {
			if err := app.EnqueuePublishedEntryJobs(ctx, row.ID); err != nil {
				log.Printf("Failed to enqueue jobs: %v", err)
				app.sendProgressMessage(session, fmt.Sprintf("警告: 一部の非同期ジョブの投入に失敗しました: %v", err))
			}
		}

		app.sendProgressMessage(session, "保存完了")

		// 3-4. 完了通知
		location := "/" + row.Path
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

func (app *AppImpl) HandleAdminApiPreview(c echo.Context) error {
	req := new(EditRequest)
	if err := c.Bind(req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Invalid request payload").SetInternal(err)
	}

	if req.Format == "" {
		req.Format = "Hatena"
	}

	ctx := c.Request().Context()

	// 1. Format
	formattedBody, err := formatter.Format(req.Body, req.Format)
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, fmt.Sprintf("Format error: %v", err)).SetInternal(err)
	}

	// 2. Postprocess
	processedBody, err := app.Postprocess(ctx, formattedBody)
	if err != nil {
		// Postprocess failed, but we can still show the formatted body
		processedBody = formattedBody
	}

	// 3. Render using public templates
	summary, imageURL := view.ExtractSummaryAndFirstImage(processedBody, 70)
	now := time.Now()
	entry := model.Entry{
		ID:            0,
		Title:         req.Title,
		Body:          req.Body,
		FormattedBody: processedBody,
		Summary:       summary,
		ImageUrl:      imageURL,
		Path:          "preview",
		Format:        req.Format,
		Date:          now.Format("2006-01-02"),
		CreatedAt:     now,
		ModifiedAt:    now,
		Status:        "public",
	}

	viewEntry := view.NewViewEntry(entry, app.config.BaseURL)
	data := &view.IndexData{
		LayoutData: app.newLayoutData(c, entry.DisplayTitle()),
		Entries:    []view.ViewEntry{viewEntry},
		IsDetail:   true,
	}
	data.Description = viewEntry.Summary
	data.OGType = "article"

	return app.templates.RenderWithLayout(c, "layout.html", "entries.html", data)
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

	// 一時ファイルに保存
	tmpFile, err := os.CreateTemp("", "upload-*"+filepath.Ext(filename))
	if err != nil {
		return err
	}
	tmpPath := tmpFile.Name()
	defer os.Remove(tmpPath)

	if _, err := io.Copy(tmpFile, src); err != nil {
		tmpFile.Close()
		return err
	}
	tmpFile.Close()

	// 画像の最適化処理（ファイルベース）
	processedPath, processedFilename, processedContentType, err := app.imageProcessor.ProcessFile(c.Request().Context(), tmpPath, filename, contentType)
	if err != nil {
		// 致命的なエラーでない限り、オリジナルデータ（tmpPath）で続行する
		log.Printf("[WARN] image processing failed, using original: %v", err)
		processedPath = tmpPath
		processedFilename = filename
		processedContentType = contentType
	}
	if processedPath != tmpPath {
		// AVIF変換などで別ファイルになった場合は、新しいファイルも削除するように設定
		defer os.Remove(processedPath)
	}

	// 最適化済みのファイルを読み直してアップロード
	finalFile, err := os.Open(processedPath)
	if err != nil {
		return err
	}
	defer finalFile.Close()

	// ストレージクライアントを使ってアップロード
	publicURL, err := app.storage.Upload(c.Request().Context(), processedFilename, finalFile, processedContentType)
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

	if entries == nil {
		entries = []model.Entry{}
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

func (app *AppImpl) HandleAdminApiImages(c echo.Context) error {
	limit, _ := strconv.Atoi(c.QueryParam("limit"))
	if limit <= 0 {
		limit = 20
	}
	offset, _ := strconv.Atoi(c.QueryParam("offset"))

	images, err := app.imagesQueries.ListImages(c.Request().Context(), model.ListImagesParams{
		Limit:  int64(limit),
		Offset: int64(offset),
	})
	if err != nil {
		return err
	}

	if images == nil {
		images = []model.Image{}
	}

	total, _ := app.imagesQueries.CountImages(c.Request().Context())

	return c.JSON(http.StatusOK, map[string]interface{}{
		"images": images,
		"total":  total,
	})
}

func (app *AppImpl) HandleAdminApiR2Usage(c echo.Context) error {
	stats, err := app.GetR2Usage(c.Request().Context())
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to fetch R2 usage").SetInternal(err)
	}
	return c.JSON(http.StatusOK, stats)
}

func (app *AppImpl) HandleAdminApiSimilarImages(c echo.Context) error {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Invalid ID")
	}

	ctx := c.Request().Context()
	targetImg, err := app.imagesQueries.GetImage(ctx, id)
	if err != nil {
		if err == sql.ErrNoRows {
			return echo.NewHTTPError(http.StatusNotFound, "Image not found")
		}
		return err
	}

	if len(targetImg.Sig) != 8 {
		return c.JSON(http.StatusOK, map[string]interface{}{
			"similar": []interface{}{},
		})
	}

	targetSig := binary.BigEndian.Uint64(targetImg.Sig)
	_ = targetSig

	similarMap, err := app.findSimilarImagesBulk(ctx, []model.Image{targetImg})
	if err != nil {
		return err
	}

	results := similarMap[id]
	if results == nil {
		results = []ScoredSimilarImage{}
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"similar": results,
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

	totalImages, _ := app.imagesQueries.CountImages(c.Request().Context())
	unindexedImages, _ := app.imagesQueries.CountUnindexedImages(c.Request().Context())

	return c.JSON(http.StatusOK, InfoData{
		IsDevelopment: app.config.IsDevelopment(),
		AppHash:       AppHash,
		Config:        configMap,
		TFIDFStats: TFIDFStats{
			TotalTerms:         tfidfStats.TotalTerms,
			IndexedEntries:     tfidfStats.IndexedEntries,
			TotalRelatedPairs:  tfidfStats.TotalRelatedPairs,
			EntriesWithRelated: tfidfStats.EntriesWithRelated,
			TopTerms:           topTerms,
			AvgScore:           avgScore,
		},
		ImageStats: ImageStats{
			TotalImages:     totalImages,
			UnindexedImages: unindexedImages,
		},
		DebugInfo: DebugInfo{
			GoVersion:     runtime.Version(),
			NumGoroutine:  runtime.NumGoroutine(),
			StartTime:     startTime.Format(time.RFC3339),
			Uptime:        time.Since(startTime).String(),
			MemAlloc:      m.Alloc,
			MemTotalAlloc: m.TotalAlloc,
			MemSys:        m.Sys,
			NumGC:         m.NumGC,
		},
	})
}
