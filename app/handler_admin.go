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
	ID       int64  `json:"id"`
	Location string `json:"location"`
}

func (app *AppImpl) HandleEdit(c echo.Context) error {
	idStr := c.QueryParam("id")
	var entry model.Entry

	if idStr != "" {
		id, err := strconv.ParseInt(idStr, 10, 64)
		if err != nil {
			return echo.NewHTTPError(http.StatusBadRequest, "Invalid ID")
		}
		row, err := app.queries.GetEntryById(c.Request().Context(), id)
		if err != nil {
			return echo.NewHTTPError(http.StatusNotFound, "Entry not found")
		}
		entry = model.Entry{
			ID:            row.ID,
			Title:         row.Title,
			Body:          row.Body,
			FormattedBody: row.FormattedBody,
			Path:          row.Path,
			Format:        row.Format,
			Date:          row.Date,
			CreatedAt:     row.CreatedAt,
			ModifiedAt:    row.ModifiedAt,
			PublishAt:     row.PublishAt,
			Status:        row.Status,
		}
	}

	entryBytes, err := json.Marshal(entry)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to serialize entry")
	}

	data := &view.EditData{
		EntryJSON: string(entryBytes),
	}
	return app.templates.Render(c.Response(), "edit", data)
}

func (app *AppImpl) HandleLogin(c echo.Context) error {
	returnPath := c.QueryParam("return")
	if returnPath == "" {
		returnPath = "/"
	}
	data := &view.LoginData{
		ErrorMsg:   "",
		ReturnPath: returnPath,
	}
	return app.templates.Render(c.Response(), "login", data)
}

func (app *AppImpl) HandleLoginPost(c echo.Context) error {
	username := c.FormValue("username")
	password := c.FormValue("password")
	returnPath := c.FormValue("return")
	if returnPath == "" {
		returnPath = "/"
	}

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
			returnPath = "/edit"
		}
		return c.Redirect(http.StatusFound, returnPath)
	}

	data := &view.LoginData{
		ErrorMsg:   "Invalid Username or Password",
		ReturnPath: returnPath,
	}
	return app.templates.Render(c.Response(), "login", data)
}

func (app *AppImpl) HandleLogout(c echo.Context) error {
	sess, _ := session.Get("session", c)
	sess.Options.MaxAge = -1
	sess.Save(c.Request(), c.Response())
	return c.Redirect(http.StatusFound, "/")
}

func (app *AppImpl) HandleApiEditProgress(c echo.Context) error {
	// Simple implementation: always return empty progress (means finished)
	return c.JSON(http.StatusOK, map[string]interface{}{
		"progress": "",
	})
}

func (app *AppImpl) HandleApiEdit(c echo.Context) error {
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

	// 1. Format the body
	formattedBody, err := formatter.Format(req.Body, req.Format)
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Formatting failed").SetInternal(err)
	}

	// 2. Postprocess the formatted body (MathJax, syntax highlight, image processing, widgets)
	ctx := c.Request().Context()
	if processedBody, err := app.Postprocess(ctx, formattedBody); err == nil {
		formattedBody = processedBody
	} else {
		log.Printf("Postprocess failed: %v", err)
		// エラーでも処理を続行（postprocess なしの formatted_body を保存）
	}

	now := time.Now()
	date := now.Format("2006-01-02")

	var resEntry model.Entry

	if req.ID != 0 {
		// Update existing entry
		existing, err := app.queries.GetEntryById(ctx, req.ID)
		if err != nil {
			return echo.NewHTTPError(http.StatusNotFound, "Entry not found").SetInternal(err)
		}

		path := req.Path
		if path == "" {
			path = existing.Path
		}

		row, err := app.queries.UpdateEntry(ctx, model.UpdateEntryParams{
			ID:            req.ID,
			Title:         req.Title,
			Body:          req.Body,
			FormattedBody: formattedBody,
			Path:          path,
			Format:        req.Format,
			Date:          existing.Date, // Keep original date string
			ModifiedAt:    now,
			PublishAt:     publishAt,
			Status:        req.Status,
		})
		if err != nil {
			return echo.NewHTTPError(http.StatusInternalServerError, "Failed to update entry").SetInternal(err)
		}
		resEntry = model.Entry(row)
	} else {
		// Create new entry
		count, err := app.queries.CountEntriesByDate(ctx, date)
		if err != nil {
			return echo.NewHTTPError(http.StatusInternalServerError, "Failed to count entries").SetInternal(err)
		}

		path := req.Path
		if path == "" {
			path = fmt.Sprintf("%s/%d", now.Format("2006/01/02"), count+1)
		}

		row, err := app.queries.CreateEntry(ctx, model.CreateEntryParams{
			Title:         req.Title,
			Body:          req.Body,
			FormattedBody: formattedBody,
			Path:          path,
			Format:        req.Format,
			Date:          date, // String YYYY-MM-DD
			CreatedAt:     now,
			ModifiedAt:    now,
			PublishAt:     publishAt,
			Status:        req.Status,
		})
		if err != nil {
			return echo.NewHTTPError(http.StatusInternalServerError, "Failed to create entry").SetInternal(err)
		}
		resEntry = model.Entry(row)
	}

	// TF-IDF再計算ジョブをエンキュー
	err = app.jobQueue.Enqueue(context.Background(), "RecalculateTFIDF",
		map[string]interface{}{"entry_id": resEntry.ID},
		fmt.Sprintf("recalc-tfidf-%d", resEntry.ID))
	if err != nil {
		log.Printf("Failed to enqueue TF-IDF job: %v", err)
	}

	// Trackback更新ジョブをエンキュー
	err = app.jobQueue.Enqueue(context.Background(), "UpdateTrackbacks",
		map[string]interface{}{"entry_id": resEntry.ID},
		fmt.Sprintf("update-trackbacks-%d", resEntry.ID))
	if err != nil {
		log.Printf("Failed to enqueue Trackback job: %v", err)
	}

	// 画像インデックスジョブをエンキュー
	err = app.jobQueue.Enqueue(context.Background(), "IndexImages",
		map[string]interface{}{"entry_id": resEntry.ID},
		fmt.Sprintf("index-images-%d", resEntry.ID))
	if err != nil {
		log.Printf("Failed to enqueue IndexImages job: %v", err)
	}

	return c.JSON(http.StatusOK, EditResponse{
		ID:       resEntry.ID,
		Location: "/" + resEntry.Path,
	})
}

func (app *AppImpl) HandleApiUploadImage(c echo.Context) error {
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
