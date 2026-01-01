package main

import (
	"bytes"
	"database/sql"
	"fmt"
	"net/http"
	"regexp"
	"sort"
	"strconv"
	"strings"
	"time"

	"github.com/cho45/hanrangon/model"
	"github.com/cho45/hanrangon/view"
	"github.com/labstack/echo/v4"
)

func (app *App) HandleRootParam(c echo.Context) error {
	param := c.Param("param")
	if regexp.MustCompile(`^\d{4}$`).MatchString(param) {
		// It's a year archive
		c.SetParamNames("yyyy")
		c.SetParamValues(param)
		return app.HandleDateArchive(c)
	}
	// It's a category
	c.SetParamNames("category")
	c.SetParamValues(param)
	return app.HandleCategory(c)
}

func (app *App) HandleDateArchive(c echo.Context) error {
	ctx := c.Request().Context()
	yyyy := c.Param("yyyy")
	mm := c.Param("mm")
	dd := c.Param("dd")

	var start time.Time
	var end time.Time
	var err error

	if dd != "" {
		// Daily
		start, err = time.Parse("20060102", yyyy+mm+dd)
		if err == nil {
			end = start.AddDate(0, 0, 1)
		}
	} else if mm != "" {
		// Monthly
		start, err = time.Parse("200601", yyyy+mm)
		if err == nil {
			end = start.AddDate(0, 1, 0)
		}
	} else {
		// Yearly
		start, err = time.Parse("2006", yyyy)
		if err == nil {
			end = start.AddDate(1, 0, 0)
		}
	}

	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Invalid date format").SetInternal(err)
	}

	rows, err := app.queries.ListEntriesByYearMonthDay(ctx, model.ListEntriesByYearMonthDayParams{
		StartDate: start.Format("2006-01-02"),
		EndDate:   end.Format("2006-01-02"),
	})
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to fetch entries").SetInternal(err)
	}

	entries := make([]model.Entry, len(rows))
	for i, r := range rows {
		entries[i] = model.Entry(r)
	}

	return view.Index(entries, "", app.IsAuth(c)).Render(ctx, c.Response())
}

func (app *App) HandleArchive(c echo.Context) error {
	ctx := c.Request().Context()

	archives, err := app.queries.ListArchiveMonths(ctx)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to fetch archives").SetInternal(err)
	}

	return view.Archive(view.ConvertArchives(archives), app.IsAuth(c)).Render(ctx, c.Response())
}

func (app *App) HandleIndex(c echo.Context) error {
	ctx := c.Request().Context()

	// ページネーションパラメータの取得
	dateStr := c.Param("date")
	limit := 10 // Default limit (days)

	var targetDate string
	if dateStr != "" {
		t, err := time.Parse("20060102", dateStr)
		if err != nil {
			return echo.NewHTTPError(http.StatusBadRequest, "Invalid date format").SetInternal(err)
		}
		targetDate = t.Format("2006-01-02")
	} else {
		targetDate = "9999-99-99"
	}

	// 1. 表示対象となるユニークな日付を取得 (次ページ判定用に +1)
	dates, err := app.queries.ListUniqueDates(ctx, model.ListUniqueDatesParams{
		TargetDate: targetDate,
		Limit:      int64(limit + 1),
	})
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to fetch dates").SetInternal(err)
	}

	var nextPage string
	if len(dates) > limit {
		// 次ページがある場合
		lastDate := dates[len(dates)-1]
		dates = dates[:limit]

		// 次ページのURLを生成
		nextDate := strings.ReplaceAll(lastDate, "-", "")
		nextPage = fmt.Sprintf("/.page/%s/%d", nextDate, limit)
	}

	if len(dates) == 0 {
		return view.Index([]model.Entry{}, "", app.IsAuth(c)).Render(ctx, c.Response())
	}

	// 2. 取得した日付に含まれる全記事を取得
	rows, err := app.queries.ListEntriesByDates(ctx, dates)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to fetch entries").SetInternal(err)
	}

	entries := make([]model.Entry, len(rows))
	for i, r := range rows {
		entries[i] = model.Entry(r)
	}

	// HTMLレンダリング
	return view.Index(entries, nextPage, app.IsAuth(c)).Render(ctx, c.Response())
}

func (app *App) HandleEntry(c echo.Context) error {
	ctx := c.Request().Context()
	yyyy := c.Param("yyyy")
	mm := c.Param("mm")
	dd := c.Param("dd")
	n := c.Param("n")

	path := fmt.Sprintf("%s/%s/%s/%s", yyyy, mm, dd, n)

	row, err := app.queries.GetEntryByPath(ctx, path)
	if err != nil {
		if err == sql.ErrNoRows {
			return echo.NewHTTPError(http.StatusNotFound, "Entry not found")
		}
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to fetch entry").SetInternal(err)
	}

	if row.Status != "public" && !app.IsAuth(c) {
		return echo.NewHTTPError(http.StatusNotFound, "Entry not found")
	}

	if row.PublishAt.Valid && row.PublishAt.Time.After(time.Now()) && !app.IsAuth(c) {
		return echo.NewHTTPError(http.StatusNotFound, "Entry not found")
	}

	entry := model.Entry{
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

	trackbacks, err := app.queries.ListTrackbackEntries(ctx, sql.NullInt64{Int64: entry.ID, Valid: true})
	if err != nil && err != sql.ErrNoRows {
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to fetch trackbacks").SetInternal(err)
	}

	prevRow, err := app.queries.GetPrevEntry(ctx, entry.CreatedAt)
	if err != nil && err != sql.ErrNoRows {
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to fetch prev entry").SetInternal(err)
	}
	var prevPtr *model.Entry
	if err == nil {
		p := model.Entry{
			ID:         prevRow.ID,
			Title:      prevRow.Title,
			CreatedAt:  prevRow.CreatedAt,
			Path:       prevRow.Path,
			Date:       prevRow.Date,
			ModifiedAt: prevRow.ModifiedAt,
			PublishAt:  prevRow.PublishAt,
			Status:     prevRow.Status,
		}
		prevPtr = &p
	}

	nextRow, err := app.queries.GetNextEntry(ctx, entry.CreatedAt)
	if err != nil && err != sql.ErrNoRows {
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to fetch next entry").SetInternal(err)
	}
	var nextPtr *model.Entry
	if err == nil {
		n := model.Entry{
			ID:         nextRow.ID,
			Title:      nextRow.Title,
			CreatedAt:  nextRow.CreatedAt,
			Path:       nextRow.Path,
			Date:       nextRow.Date,
			ModifiedAt: nextRow.ModifiedAt,
			PublishAt:  nextRow.PublishAt,
			Status:     nextRow.Status,
		}
		nextPtr = &n
	}

	return view.Entry(entry, trackbacks, prevPtr, nextPtr, app.IsAuth(c)).Render(ctx, c.Response())
}

func (app *App) HandleCategory(c echo.Context) error {
	ctx := c.Request().Context()
	category := c.Param("category")

	// ページネーションパラメータの取得
	dateStr := c.Param("date")
	limit := 10 // Default limit

	var targetDate time.Time
	if dateStr != "" {
		var err error
		targetDate, err = time.Parse("20060102", dateStr)
		if err != nil {
			return echo.NewHTTPError(http.StatusBadRequest, "Invalid date format").SetInternal(err)
		}
	} else {
		targetDate = time.Now()
	}

	fetchLimit := limit + 1

	rows, err := app.queries.ListEntriesByCategory(ctx, model.ListEntriesByCategoryParams{
		Title:      fmt.Sprintf("%%[%s]%%", category),
		TargetDate: targetDate.Format("2006-01-02"),
		Limit:      int64(fetchLimit),
	})
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to fetch entries").SetInternal(err)
	}

	var nextPage string
	if len(rows) > limit {
		lastRow := rows[len(rows)-1]
		rows = rows[:limit]

		nextDate := strings.ReplaceAll(lastRow.Date, "-", "")
		nextPage = fmt.Sprintf("/%s/.page/%s/%d", category, nextDate, limit)
	}

	entries := make([]model.Entry, len(rows))
	for i, r := range rows {
		entries[i] = model.Entry(r)
	}

	return view.Index(entries, nextPage, app.IsAuth(c)).Render(ctx, c.Response())
}

func (app *App) HandleFeed(c echo.Context) error {
	ctx := c.Request().Context()

	rows, err := app.queries.ListEntries(ctx, model.ListEntriesParams{
		TargetDate: time.Now().Format("2006-01-02"),
		Limit:      20,
	})
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to fetch entries").SetInternal(err)
	}

	entries := make([]model.Entry, len(rows))
	for i, r := range rows {
		entries[i] = model.Entry(r)
	}

	updated := time.Now()
	if len(entries) > 0 {
		updated = entries[0].ModifiedAt
	}

	c.Response().Header().Set(echo.HeaderContentType, "application/atom+xml; charset=utf-8")
	return view.Feed(entries, updated).Render(ctx, c.Response())
}

func (app *App) HandleSitemap(c echo.Context) error {
	ctx := c.Request().Context()

	entries, err := app.queries.ListAllEntriesForSitemap(ctx)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to fetch entries").SetInternal(err)
	}

	c.Response().Header().Set(echo.HeaderContentType, "application/xml; charset=utf-8")
	return view.Sitemap(entries).Render(ctx, c.Response())
}

func (app *App) HandleRobotsTxt(c echo.Context) error {
	// Static content for robots.txt
	content := `User-agent: *
Disallow: /admin/
Disallow: /login
Disallow: /edit
Disallow: /api/
Sitemap: https://lowreal.net/sitemap.xml
`
	return c.String(http.StatusOK, content)
}

func (app *App) HandleApiSimilar(c echo.Context) error {
	ctx := c.Request().Context()
	idsParam := c.QueryParams()["id"]

	result := make(map[string]string)

	for _, idStr := range idsParam {
		id, err := strconv.ParseInt(idStr, 10, 64)
		if err != nil {
			continue
		}

		// 1. Get related entries from tfidfDB
		relatedRows, err := app.tfidfQueries.ListRelatedEntries(ctx, id)
		if err != nil {
			continue
		}

		if len(relatedRows) == 0 {
			continue
		}

		relatedIDs := make([]int64, len(relatedRows))
		scoreMap := make(map[int64]float64)
		for i, r := range relatedRows {
			relatedIDs[i] = r.RelatedEntryID
			scoreMap[r.RelatedEntryID] = r.Score
		}

		// 2. Get entry details from main DB
		rows, err := app.queries.ListEntriesByIds(ctx, relatedIDs)
		if err != nil {
			continue
		}

		// 3. Prepare data for view
		similarEntries := make([]view.SimilarEntry, 0, len(rows))
		for _, r := range rows {
			e := model.Entry(r)
			similarEntries = append(similarEntries, view.SimilarEntry{
				Entry: e,
				Score: scoreMap[e.ID],
			})
		}

		// Sort by score descending
		sort.Slice(similarEntries, func(i, j int) bool {
			return similarEntries[i].Score > similarEntries[j].Score
		})

		// 4. Render to string
		var buf bytes.Buffer
		if err := view.SimilarEntries(similarEntries).Render(ctx, &buf); err != nil {
			continue
		}

		result[idStr] = buf.String()
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"result": result,
		"ad":     "",
	})
}
