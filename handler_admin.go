package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"time"

	"github.com/cho45/hanrangon/formatter"
	"github.com/cho45/hanrangon/model"
	"github.com/cho45/hanrangon/view"
	"github.com/gorilla/sessions"
	"github.com/labstack/echo-contrib/session"
	"github.com/labstack/echo/v4"
)

type EditRequest struct {
	ID     int64  `json:"id" form:"id"`
	Title  string `json:"title" form:"title"`
	Body   string `json:"body" form:"body"`
	Format string `json:"format" form:"format"`
	Path   string `json:"path" form:"path"`
}

type EditResponse struct {
	ID       int64  `json:"id"`
	Location string `json:"location"`
}

func (app *App) HandleEdit(c echo.Context) error {
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
		entry = model.Entry(row)
	}

	entryBytes, err := json.Marshal(entry)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to serialize entry")
	}

	return view.Edit(string(entryBytes)).Render(c.Request().Context(), c.Response())
}

func (app *App) HandleLogin(c echo.Context) error {
	returnPath := c.QueryParam("return")
	if returnPath == "" {
		returnPath = "/"
	}
	return view.Login("", returnPath).Render(c.Request().Context(), c.Response())
}

func (app *App) HandleLoginPost(c echo.Context) error {
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

	return view.Login("Invalid Username or Password", returnPath).Render(c.Request().Context(), c.Response())
}

func (app *App) HandleLogout(c echo.Context) error {
	sess, _ := session.Get("session", c)
	sess.Options.MaxAge = -1
	sess.Save(c.Request(), c.Response())
	return c.Redirect(http.StatusFound, "/")
}

func (app *App) HandleApiEditProgress(c echo.Context) error {
	// Simple implementation: always return empty progress (means finished)
	return c.JSON(http.StatusOK, map[string]interface{}{
		"progress": "",
	})
}

func (app *App) HandleApiEdit(c echo.Context) error {
	req := new(EditRequest)
	if err := c.Bind(req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Invalid request payload").SetInternal(err)
	}

	if req.Format == "" {
		req.Format = "HTML" // Default
	}

	// 1. Format the body
	formattedBody, err := formatter.Format(req.Body, req.Format)
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Formatting failed").SetInternal(err)
	}

	now := time.Now()
	date := now.Format("2006-01-02")

	ctx := c.Request().Context()
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
		})
		if err != nil {
			return echo.NewHTTPError(http.StatusInternalServerError, "Failed to create entry").SetInternal(err)
		}
		resEntry = model.Entry(row)
	}

	return c.JSON(http.StatusOK, EditResponse{
		ID:       resEntry.ID,
		Location: "/" + resEntry.Path,
	})
}
