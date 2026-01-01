package main

import (
	"fmt"
	"net/http"
	"time"

	"github.com/cho45/hanrangon/formatter"
	"github.com/cho45/hanrangon/model"
	"github.com/labstack/echo/v4"
)

type EditRequest struct {
	ID     int64  `json:"id"`
	Title  string `json:"title"`
	Body   string `json:"body"`
	Format string `json:"format"`
	Path   string `json:"path"`
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
	var res model.Entry

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
		res = model.Entry(row)
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
		res = model.Entry(row)
	}

	return c.JSON(http.StatusOK, res)
}
