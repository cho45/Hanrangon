package app

import (
	"bytes"
	"database/sql"
	"encoding/xml"
	"fmt"
	"html/template"
	"net/http"
	"regexp"
	"strconv"
	"strings"
	"time"

	"github.com/cho45/hanrangon/model"
	"github.com/cho45/hanrangon/view"
	"github.com/labstack/echo/v4"
)

var yearArchiveRegexp = regexp.MustCompile(`^\d{4}$`)

func (app *AppImpl) HandleRootParam(c echo.Context) error {
	param := c.Param("param")
	if yearArchiveRegexp.MatchString(param) {
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

func (app *AppImpl) getSimilarEntriesURL(entries []view.ViewEntry) template.URL {
	if len(entries) == 0 {
		return ""
	}
	var sb strings.Builder
	sb.Grow(len(entries) * 20)
	sb.WriteString("/api/similar?")
	for i, e := range entries {
		if i > 0 {
			sb.WriteByte('&')
		}
		sb.WriteString("id=")
		sb.WriteString(strconv.FormatInt(e.ID, 10))
	}
	return template.URL(sb.String())
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

	entries, err := app.queries.ListEntriesByYearMonthDay(ctx, model.ListEntriesByYearMonthDayParams{
		StartDate: start.Format("2006-01-02"),
		EndDate:   end.Format("2006-01-02"),
	})
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to fetch entries").SetInternal(err)
	}

	if len(entries) > 0 {
		latest := getLatestModTime(entries)
		etag := GenerateListETag(latest, len(entries), yyyy+mm+dd, app.IsAuth(c))
		if app.CheckCache(c, latest, etag) {
			return nil
		}
	}

	var pageTitle string
	if dd != "" {
		pageTitle = fmt.Sprintf("%s年%s月%s日", yyyy, mm, dd)
	} else if mm != "" {
		pageTitle = fmt.Sprintf("%s年%s月", yyyy, mm)
	} else {
		pageTitle = fmt.Sprintf("%s年", yyyy)
	}

	viewEntries := view.NewViewEntries(entries, app.config.BaseURL)
	data := &view.IndexData{
		LayoutData: app.newLayoutData(c, pageTitle),
		Entries:    viewEntries,
		IsDetail:   false,
		OlderPage:  "",
	}
	data.SimilarEntriesURL = app.getSimilarEntriesURL(viewEntries)
	return app.templates.RenderWithLayout(c, "layout.html", "entries.html", data)
}

func (app *AppImpl) HandleArchive(c echo.Context) error {
	ctx := c.Request().Context()

	archives, err := app.queries.ListArchiveMonths(ctx)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to fetch archives").SetInternal(err)
	}

	data := &view.ArchiveData{
		LayoutData: app.newLayoutData(c, "アーカイブ"),
		Archives:   view.ConvertArchives(archives),
	}
	return app.templates.RenderWithLayout(c, "layout.html", "archive.html", data)
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

	var olderPage string
	if len(dates) > limit {
		// 次ページがある場合
		lastDate := dates[len(dates)-1]
		dates = dates[:limit]

		// 次ページのURLを生成
		olderDate := strings.ReplaceAll(lastDate, "-", "")
		olderPage = fmt.Sprintf("/.page/%s/%d", olderDate, limit)
	}

	var pageTitle string
	if dateStr != "" {
		pageTitle = "過去の記事"
	}

	if len(dates) == 0 {
		data := &view.IndexData{
			LayoutData: app.newLayoutData(c, pageTitle),
			Entries:    []view.ViewEntry{},
			IsDetail:   false,
			OlderPage:  "",
		}
		return app.templates.RenderWithLayout(c, "layout.html", "entries.html", data)
	}
	// 2. 取得した日付に含まれる全記事を取得
	entries, err := app.queries.ListEntriesByDates(ctx, dates)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to fetch entries").SetInternal(err)
	}

	if len(entries) > 0 {
		latest := getLatestModTime(entries)
		etag := GenerateListETag(latest, len(entries), dateStr, app.IsAuth(c))
		if app.CheckCache(c, latest, etag) {
			return nil
		}
	}

	// HTMLレンダリング
	viewEntries := view.NewViewEntries(entries, app.config.BaseURL)
	data := &view.IndexData{
		LayoutData: app.newLayoutData(c, pageTitle),
		Entries:    viewEntries,
		IsDetail:   false,
		OlderPage:  olderPage,
	}
	data.SimilarEntriesURL = app.getSimilarEntriesURL(viewEntries)
	return app.templates.RenderWithLayout(c, "layout.html", "entries.html", data)
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

	entries, err := app.queries.ListEntriesByCategory(ctx, model.ListEntriesByCategoryParams{
		Title:      fmt.Sprintf("%%[%s]%%", category),
		TargetDate: targetDate.Format("2006-01-02"),
		Limit:      int64(fetchLimit),
	})
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to fetch entries").SetInternal(err)
	}

	var olderPage string
	if len(entries) > limit {
		lastRow := entries[len(entries)-1]
		entries = entries[:limit]

		olderDate := strings.ReplaceAll(lastRow.Date, "-", "")
		olderPage = fmt.Sprintf("/%s/.page/%s/%d", category, olderDate, limit)
	}

	if len(entries) > 0 {
		latest := getLatestModTime(entries)
		etag := GenerateListETag(latest, len(entries), category+dateStr, app.IsAuth(c))
		if app.CheckCache(c, latest, etag) {
			return nil
		}
	}

	viewEntries := view.NewViewEntries(entries, app.config.BaseURL)
	data := &view.IndexData{
		LayoutData: app.newLayoutData(c, category+" カテゴリ"),
		Entries:    viewEntries,
		IsDetail:   false,
		OlderPage:  olderPage,
	}
	data.SimilarEntriesURL = app.getSimilarEntriesURL(viewEntries)
	return app.templates.RenderWithLayout(c, "layout.html", "entries.html", data)
}

func (app *AppImpl) JoinBaseURL(path string) string {
	return strings.TrimSuffix(app.config.BaseURL, "/") + "/" + strings.TrimPrefix(path, "/")
}

func (app *AppImpl) HandleFeed(c echo.Context) error {
	ctx := c.Request().Context()

	entries, err := app.queries.ListEntries(ctx, model.ListEntriesParams{
		TargetDate: time.Now().Format("2006-01-02"),
		Limit:      20,
	})
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to fetch entries").SetInternal(err)
	}

	updated := getLatestModTime(entries)
	if updated.IsZero() {
		updated = time.Now()
	}

	atomEntries := make([]view.AtomEntry, len(entries))
	for i, e := range entries {
		atomEntries[i] = view.AtomEntry{
			Title: e.DisplayTitle(),
			Link: view.AtomLink{
				Href: app.JoinBaseURL(e.Path),
			},
			ID:        fmt.Sprintf("tag:lowreal.net,2005:entry:%d", e.ID),
			Updated:   e.ModifiedAt.Format(time.RFC3339),
			Published: e.CreatedAt.Format(time.RFC3339),
			Content: view.AtomContent{
				Type: "html",
				Body: e.FormattedBody,
			},
		}
	}

	feed := view.AtomFeed{
		Title: "氾濫原",
		Link: []view.AtomLink{
			{Href: app.JoinBaseURL("/")},
			{Href: app.JoinBaseURL("/feed"), Rel: "self", Type: "application/atom+xml"},
		},
		Updated: updated.Format(time.RFC3339),
		Author:  view.AtomAuthor{Name: "cho45"},
		ID:      "tag:lowreal.net,2005:feed",
		Entries: atomEntries,
	}

	feed.Entries = atomEntries

	c.Response().Header().Set(echo.HeaderContentType, "application/atom+xml")
	c.Response().WriteHeader(http.StatusOK)
	if _, err := c.Response().Write([]byte(xml.Header)); err != nil {
		return err
	}
	enc := xml.NewEncoder(c.Response().Writer)
	enc.Indent("", "\t")
	return enc.Encode(feed)
}

func (app *AppImpl) HandleSitemap(c echo.Context) error {
	ctx := c.Request().Context()

	rows, err := app.queries.ListAllEntriesForSitemap(ctx)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to fetch entries for sitemap").SetInternal(err)
	}

	var latestMod string
	if len(rows) > 0 {
		latestMod = rows[0].ModifiedAt.Format(time.RFC3339)
	}

	urls := []view.SitemapURL{
		{Loc: app.JoinBaseURL("/"), LastMod: latestMod},
		{Loc: app.JoinBaseURL("/archive"), LastMod: latestMod},
		{Loc: app.JoinBaseURL("/photo/"), LastMod: latestMod},
	}

	for _, row := range rows {
		urls = append(urls, view.SitemapURL{
			Loc:     app.JoinBaseURL(row.Path),
			LastMod: row.ModifiedAt.Format(time.RFC3339),
		})
	}

	sitemap := view.SitemapXML{
		URLs: urls,
	}

	c.Response().Header().Set(echo.HeaderContentType, echo.MIMEApplicationXMLCharsetUTF8)
	c.Response().WriteHeader(http.StatusOK)
	if _, err := c.Response().Write([]byte(xml.Header)); err != nil {
		return err
	}
	enc := xml.NewEncoder(c.Response().Writer)
	enc.Indent("", "\t")
	return enc.Encode(sitemap)
}

func (app *AppImpl) HandleRobotsTxt(c echo.Context) error {
	// Static content for robots.txt
	content := fmt.Sprintf(`User-agent: *
Disallow: /admin/
Disallow: /login
Sitemap: %s
`, app.JoinBaseURL("/sitemap.xml"))
	return c.String(http.StatusOK, content)
}

func (app *AppImpl) HandleApiSimilar(c echo.Context) error {
	ctx := c.Request().Context()
	idsParam := c.QueryParams()["id"]

	targetIDs := make([]int64, 0, len(idsParam))
	for _, idStr := range idsParam {
		if id, err := strconv.ParseInt(idStr, 10, 64); err == nil {
			targetIDs = append(targetIDs, id)
		}
	}

	result := make(map[string]string)
	if len(targetIDs) == 0 {
		return c.JSON(http.StatusOK, map[string]interface{}{"result": result, "ad": ""})
	}

	// 1. Get related entries from tfidfDB in bulk
	relatedRows, err := app.tfidfQueries.ListRelatedEntriesByEntryIDs(ctx, targetIDs)
	if err == nil && len(relatedRows) > 0 {
		// Group by target entry_id
		relatedMap := make(map[int64][]model.ListRelatedEntriesByEntryIDsRow)
		allRelatedIDsMap := make(map[int64]bool)
		for _, row := range relatedRows {
			relatedMap[row.EntryID] = append(relatedMap[row.EntryID], row)
			allRelatedIDsMap[row.RelatedEntryID] = true
		}

		allRelatedIDs := make([]int64, 0, len(allRelatedIDsMap))
		for id := range allRelatedIDsMap {
			allRelatedIDs = append(allRelatedIDs, id)
		}

		// 2. Get entry details from main DB in bulk
		entryMap := make(map[int64]model.Entry)
		entryRows, err := app.queries.ListEntriesByIds(ctx, allRelatedIDs)
		if err == nil {
			for _, r := range entryRows {
				entryMap[r.ID] = r
			}

			// 3. Render for each target ID
			for targetID, related := range relatedMap {
				similarEntries := make([]view.SimilarEntry, 0, len(related))
				for _, rel := range related {
					if e, ok := entryMap[rel.RelatedEntryID]; ok {
						similarEntries = append(similarEntries, view.SimilarEntry{
							ViewEntry: view.NewViewEntry(e, app.config.BaseURL),
							Score:     rel.Score,
						})
					}
				}

				if len(similarEntries) > 0 {
					var buf bytes.Buffer
					data := &view.SimilarEntriesData{
						Entries: similarEntries,
					}
					if err := app.templates.RenderTo(&buf, "similar-entries.html", data); err == nil {
						result[strconv.FormatInt(targetID, 10)] = buf.String()
					}
				}
			}
		}
	}

	// 4. Fallback for IDs that don't have TF-IDF results yet
	for _, id := range targetIDs {
		idStr := strconv.FormatInt(id, 10)
		if _, ok := result[idStr]; ok {
			continue
		}

		// Similar Images fallback (one by one for now as it's less frequent)
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

		var entryIDs []int64
		entryIDMap := make(map[int64]bool)
		for _, cand := range candidates {
			if !entryIDMap[cand.EntryID] {
				entryIDs = append(entryIDs, cand.EntryID)
				entryIDMap[cand.EntryID] = true
			}
		}

		entries, err := app.queries.ListEntriesByIds(ctx, entryIDs)
		if err != nil {
			continue
		}

		entryMap := make(map[int64]model.Entry)
		for _, e := range entries {
			entryMap[e.ID] = e
		}

		var viewImages []view.SimilarImage
		for _, cand := range candidates {
			if e, ok := entryMap[cand.EntryID]; ok {
				viewImages = append(viewImages, view.SimilarImage{
					URI:       cand.Uri,
					EntryPath: e.Path,
					Score:     cand.Score,
				})
			}
		}

		var buf bytes.Buffer
		data := &view.SimilarImagesData{
			Images: viewImages,
		}
		if err := app.templates.RenderTo(&buf, "similar-images.html", data); err == nil {
			result[idStr] = buf.String()
		}
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"result": result,
		"ad":     "",
	})
}

func (app *AppImpl) HandlePath(c echo.Context) error {
	ctx := c.Request().Context()
	// Get the full path from the catch-all parameter
	path := c.Param("*")
	// Remove leading slash
	path = strings.TrimPrefix(path, "/")

	// Empty path should not be handled here
	if path == "" {
		return echo.NewHTTPError(http.StatusNotFound, "Entry not found")
	}

	entry, err := app.queries.GetEntryByPath(ctx, path)
	if err != nil {
		if err == sql.ErrNoRows {
			return echo.NewHTTPError(http.StatusNotFound, "Entry not found")
		}
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to fetch entry").SetInternal(err)
	}

	if entry.Status != "public" && !app.IsAuth(c) {
		return echo.NewHTTPError(http.StatusNotFound, "Entry not found")
	}

	if entry.PublishAt.Valid && entry.PublishAt.Time.After(time.Now()) && !app.IsAuth(c) {
		return echo.NewHTTPError(http.StatusNotFound, "Entry not found")
	}

	etag := GenerateEntryETag(entry.ID, entry.ModifiedAt, app.IsAuth(c))
	if app.CheckCache(c, entry.ModifiedAt, etag) {
		return nil
	}

	rows, err := app.queries.ListTrackbackEntries(ctx, sql.NullInt64{Int64: entry.ID, Valid: true})
	if err != nil && err != sql.ErrNoRows {
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to fetch trackbacks").SetInternal(err)
	}
	trackbacks := view.NewViewTrackbacks(rows)

	olderEntry, err := app.queries.GetOlderEntry(ctx, entry.CreatedAt)
	if err != nil && err != sql.ErrNoRows {
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to fetch older entry").SetInternal(err)
	}
	var olderPtr *view.ViewEntry
	if err == nil {
		v := view.NewViewEntry(olderEntry, app.config.BaseURL)
		olderPtr = &v
	}

	newerEntry, err := app.queries.GetNewerEntry(ctx, entry.CreatedAt)
	if err != nil && err != sql.ErrNoRows {
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to fetch newer entry").SetInternal(err)
	}
	var newerPtr *view.ViewEntry
	if err == nil {
		v := view.NewViewEntry(newerEntry, app.config.BaseURL)
		newerPtr = &v
	}

	viewEntry := view.NewViewEntry(entry, app.config.BaseURL)
	viewEntries := []view.ViewEntry{viewEntry}
	data := &view.IndexData{
		LayoutData: app.newLayoutData(c, entry.DisplayTitle()),
		Entries:    viewEntries,
		IsDetail:   true,
		Trackbacks: trackbacks,
		Older:      olderPtr,
		Newer:      newerPtr,
	}
	data.SimilarEntriesURL = app.getSimilarEntriesURL(viewEntries)

	data.Description = viewEntry.Summary
	data.OGType = "article"
	firstImage := string(viewEntry.FirstImageURL)
	if firstImage != "" {
		if strings.HasPrefix(firstImage, "http") {
			data.ImageURL = firstImage
		} else {
			data.ImageURL = app.JoinBaseURL(firstImage)
		}
	} else {
		data.ImageURL = app.JoinBaseURL(fmt.Sprintf("/images/ogp/%d.png", entry.ID))
	}

	return app.templates.RenderWithLayout(c, "layout.html", "entries.html", data)
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
