package app

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

func (app *AppImpl) HandleRootParam(c echo.Context) error {
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

func (app *AppImpl) HandleDateArchive(c echo.Context) error {
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

	if len(entries) > 0 {
		latest := getLatestModTime(entries)
		etag := GenerateListETag(latest, len(entries), yyyy+mm+dd, app.IsAuth(c))
		if app.CheckCache(c, latest, etag) {
			return nil
		}
	}

	data := &view.IndexData{
		LayoutData: view.LayoutData{
			Title:  "氾濫原",
			IsAuth: app.IsAuth(c),
		},
		Entries:  entries,
		NextPage: "",
	}
	return app.templates.Render(c.Response(), "index", data)
}

func (app *AppImpl) HandleArchive(c echo.Context) error {
	ctx := c.Request().Context()

	archives, err := app.queries.ListArchiveMonths(ctx)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to fetch archives").SetInternal(err)
	}

	data := &view.ArchiveData{
		LayoutData: view.LayoutData{
			Title:  "アーカイブ - 氾濫原",
			IsAuth: app.IsAuth(c),
		},
		Archives: view.ConvertArchives(archives),
	}
	return app.templates.Render(c.Response(), "archive", data)
}

func (app *AppImpl) HandleIndex(c echo.Context) error {
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
		data := &view.IndexData{
			LayoutData: view.LayoutData{
				Title:  "氾濫原",
				IsAuth: app.IsAuth(c),
			},
			Entries:  []model.Entry{},
			NextPage: "",
		}
		return app.templates.Render(c.Response(), "index", data)
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

	if len(entries) > 0 {
		latest := getLatestModTime(entries)
		etag := GenerateListETag(latest, len(entries), dateStr, app.IsAuth(c))
		if app.CheckCache(c, latest, etag) {
			return nil
		}
	}

	// HTMLレンダリング
	data := &view.IndexData{
		LayoutData: view.LayoutData{
			Title:  "氾濫原",
			IsAuth: app.IsAuth(c),
		},
		Entries:  entries,
		NextPage: nextPage,
	}
	return app.templates.Render(c.Response(), "index", data)
}

func (app *AppImpl) HandleEntry(c echo.Context) error {
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

	etag := GenerateEntryETag(entry.ID, entry.ModifiedAt, app.IsAuth(c))
	if app.CheckCache(c, entry.ModifiedAt, etag) {
		return nil
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

	data := &view.EntryData{
		LayoutData: view.LayoutData{
			Title:  entry.Title + " - 氾濫原",
			IsAuth: app.IsAuth(c),
		},
		Entry:      entry,
		Trackbacks: trackbacks,
		Prev:       prevPtr,
		Next:       nextPtr,
	}
	return app.templates.Render(c.Response(), "entry", data)
}

func (app *AppImpl) HandleCategory(c echo.Context) error {
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

	if len(entries) > 0 {
		latest := getLatestModTime(entries)
		etag := GenerateListETag(latest, len(entries), category+dateStr, app.IsAuth(c))
		if app.CheckCache(c, latest, etag) {
			return nil
		}
	}

	data := &view.IndexData{
		LayoutData: view.LayoutData{
			Title:  "氾濫原",
			IsAuth: app.IsAuth(c),
		},
		Entries:  entries,
		NextPage: nextPage,
	}
	return app.templates.Render(c.Response(), "index", data)
}

func (app *AppImpl) HandleFeed(c echo.Context) error {
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
		updated = getLatestModTime(entries)
		etag := GenerateListETag(updated, len(entries), "feed", app.IsAuth(c))
		if app.CheckCache(c, updated, etag) {
			return nil
		}
	}

	c.Response().Header().Set(echo.HeaderContentType, "application/atom+xml; charset=utf-8")
	data := &view.FeedData{
		Entries: entries,
		Updated: updated.Format(time.RFC3339),
	}
	return app.templates.Render(c.Response(), "feed", data)
}

func (app *AppImpl) HandleSitemap(c echo.Context) error {
	ctx := c.Request().Context()

	entries, err := app.queries.ListAllEntriesForSitemap(ctx)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to fetch entries").SetInternal(err)
	}

	if len(entries) > 0 {
		latest := entries[0].ModifiedAt
		for _, e := range entries {
			if e.ModifiedAt.After(latest) {
				latest = e.ModifiedAt
			}
		}
		etag := GenerateListETag(latest, len(entries), "sitemap", app.IsAuth(c))
		if app.CheckCache(c, latest, etag) {
			return nil
		}
	}

	c.Response().Header().Set(echo.HeaderContentType, "application/xml; charset=utf-8")
	data := &view.SitemapData{
		Entries: entries,
	}
	return app.templates.Render(c.Response(), "sitemap", data)
}

func (app *AppImpl) HandleRobotsTxt(c echo.Context) error {
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

func (app *AppImpl) HandleApiSimilar(c echo.Context) error {
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

		if err == nil && len(relatedRows) > 0 {
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
			data := &view.SimilarEntriesData{
				Entries: similarEntries,
			}
			if err := app.templates.Render(&buf, "similar-entries", data); err != nil {
				continue
			}

			result[idStr] = buf.String()
			continue
		}

		// Fallback: Similar Images
		images, err := app.imagesQueries.ListImagesByEntryID(ctx, id)
		if err != nil || len(images) == 0 {
			continue
		}

		var candidates []model.ListSimilarImagesRow
		for _, img := range images {
			sims, err := app.imagesQueries.ListSimilarImages(ctx, model.ListSimilarImagesParams{
				ImageID: img.ID,
				Limit:   3,
			})
			if err == nil {
				candidates = append(candidates, sims...)
			}
		}

		if len(candidates) == 0 {
			continue
		}

		// Fetch entries
		var entryIDs []int64
		entryIDMap := make(map[int64]bool)
		for _, c := range candidates {
			if !entryIDMap[c.EntryID] {
				entryIDs = append(entryIDs, c.EntryID)
				entryIDMap[c.EntryID] = true
			}
		}

		entries, err := app.queries.ListEntriesByIds(ctx, entryIDs)
		if err != nil {
			continue
		}

		entryMap := make(map[int64]model.Entry)
		for _, e := range entries {
			entryMap[e.ID] = model.Entry(e)
		}

		var viewImages []view.SimilarImage
		for _, c := range candidates {
			if e, ok := entryMap[c.EntryID]; ok {
				viewImages = append(viewImages, view.SimilarImage{
					URI:       c.Uri,
					EntryPath: e.Path,
					Score:     c.Score,
				})
			}
		}

		// Render SimilarImages
		var buf bytes.Buffer
		data := &view.SimilarImagesData{
			Images: viewImages,
		}
		if err := app.templates.Render(&buf, "similar-images", data); err != nil {
			continue
		}
		result[idStr] = buf.String()
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"result": result,
		"ad":     "",
	})
}

func getLatestModTime(entries []model.Entry) time.Time {
	if len(entries) == 0 {
		return time.Time{}
	}
	latest := entries[0].ModifiedAt
	for _, e := range entries {
		if e.ModifiedAt.After(latest) {
			latest = e.ModifiedAt
		}
	}
	return latest
}
