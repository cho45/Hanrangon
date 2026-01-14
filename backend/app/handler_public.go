package app

import (
	"context"
	"database/sql"
	"encoding/xml"
	"fmt"
	"net/http"
	"path/filepath"
	"regexp"
	"sort"
	"strings"
	"time"

	"github.com/cho45/hanrangon/backend/model/maindb"
	"github.com/cho45/hanrangon/backend/model/tfidfdb"
	"github.com/cho45/hanrangon/backend/view"
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

	entries, err := app.MainDB().Q.ListEntriesByYearMonthDay(ctx, maindb.ListEntriesByYearMonthDayParams{
		StartDate: start.Format("2006-01-02"),
		EndDate:   end.Format("2006-01-02"),
	})
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to fetch entries").SetInternal(err)
	}

	if len(entries) > 0 {
		latest := getLatestModTime(entries)
		etag := GenerateListETag(latest, len(entries), yyyy+mm+dd, app.IsAuth(c))
		if ok, err := app.CheckCache(c, latest, etag); ok {
			return err
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
	app.populateSimilarEntries(ctx, viewEntries)
	data := &view.IndexData{
		LayoutData: app.newLayoutData(c, pageTitle),
		Entries:    viewEntries,
		IsDetail:   false,
		OlderPage:  "",
	}
	return app.templates.RenderWithLayout(c, "layout.html", "entries.html", data)
}

func (app *AppImpl) HandleArchive(c echo.Context) error {
	ctx := c.Request().Context()

	archives, err := app.MainDB().Q.ListArchiveMonths(ctx)
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
	maxDays := 10
	minDays := 3
	threshold := 10

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
	dates, err := app.MainDB().Q.ListUniqueDates(ctx, maindb.ListUniqueDatesParams{
		TargetDate: targetDate,
		Limit:      int64(maxDays + 1),
	})
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to fetch dates").SetInternal(err)
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
	entries, err := app.MainDB().Q.ListEntriesByDates(ctx, dates)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to fetch entries").SetInternal(err)
	}

	// 3. 表示日数をアダプティブに決定
	// 日付ごとのエントリ数をカウント
	entryCountByDate := make(map[string]int)
	for _, e := range entries {
		entryCountByDate[e.Date]++
	}

	displayDays := len(dates)
	if displayDays > maxDays {
		displayDays = maxDays
	}

	for d := displayDays; d > minDays; d-- {
		totalEntries := 0
		for i := 0; i < d; i++ {
			totalEntries += entryCountByDate[dates[i]]
		}
		if totalEntries <= threshold {
			displayDays = d
			break
		}
		displayDays = d - 1
	}

	var olderPage string
	if len(dates) > displayDays {
		// 次ページがある場合
		nextDate := dates[displayDays]
		// 次ページのURLを生成
		olderDate := strings.ReplaceAll(nextDate, "-", "")
		olderPage = fmt.Sprintf("/.page/%s/%d", olderDate, maxDays)

		// 表示対象の日付のみに絞り込み
		displayDates := dates[:displayDays]
		displayDateMap := make(map[string]bool)
		for _, d := range displayDates {
			displayDateMap[d] = true
		}

		filteredEntries := make([]maindb.Entry, 0)
		for _, e := range entries {
			if displayDateMap[e.Date] {
				filteredEntries = append(filteredEntries, e)
			}
		}
		entries = filteredEntries
	}
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to fetch entries").SetInternal(err)
	}

	if len(entries) > 0 {
		latest := getLatestModTime(entries)
		etag := GenerateListETag(latest, len(entries), dateStr, app.IsAuth(c))
		if ok, err := app.CheckCache(c, latest, etag); ok {
			return err
		}
	}

	// HTMLレンダリング
	viewEntries := view.NewViewEntries(entries, app.config.BaseURL)
	app.populateSimilarEntries(ctx, viewEntries)
	data := &view.IndexData{
		LayoutData: app.newLayoutData(c, pageTitle),
		Entries:    viewEntries,
		IsDetail:   false,
		OlderPage:  olderPage,
	}
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

	entries, err := app.MainDB().Q.ListEntriesByCategory(ctx, maindb.ListEntriesByCategoryParams{
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
		if ok, err := app.CheckCache(c, latest, etag); ok {
			return err
		}
	}

	viewEntries := view.NewViewEntries(entries, app.config.BaseURL)
	app.populateSimilarEntries(ctx, viewEntries)
	data := &view.IndexData{
		LayoutData: app.newLayoutData(c, category+" カテゴリ"),
		Entries:    viewEntries,
		IsDetail:   false,
		OlderPage:  olderPage,
	}
	return app.templates.RenderWithLayout(c, "layout.html", "entries.html", data)
}

func (app *AppImpl) JoinBaseURL(path string) string {
	return strings.TrimSuffix(app.config.BaseURL, "/") + "/" + strings.TrimPrefix(path, "/")
}

func (app *AppImpl) HandleFeed(c echo.Context) error {
	ctx := c.Request().Context()

	entries, err := app.MainDB().Q.ListEntries(ctx, maindb.ListEntriesParams{
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

	rows, err := app.MainDB().Q.ListAllEntriesForSitemap(ctx)
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
Disallow: /search
Sitemap: %s
`,
		app.JoinBaseURL("/sitemap.xml"),
	)
	return c.String(http.StatusOK, content)
}

func (app *AppImpl) populateSimilarEntries(ctx context.Context, entries []view.ViewEntry) {
	if len(entries) == 0 {
		return
	}

	targetIDs := make([]int64, len(entries))
	for i, e := range entries {
		targetIDs[i] = e.ID
	}

	// 1. Get related entries from tfidfDB in bulk
	relatedRows, err := app.TFIDFDB().Q.ListRelatedEntriesByEntryIDs(ctx, targetIDs)
	if err == nil && len(relatedRows) > 0 {
		// Group by target entry_id
		relatedMap := make(map[int64][]tfidfdb.ListRelatedEntriesByEntryIDsRow)
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
		entryMap := make(map[int64]maindb.Entry)
		entryRows, err := app.MainDB().Q.ListEntriesByIds(ctx, allRelatedIDs)
		if err == nil {
			for _, r := range entryRows {
				entryMap[r.ID] = r
			}

			// 3. Set for each target ID
			for i := range entries {
				e := &entries[i]
				related := relatedMap[e.ID]
				similarEntries := make([]view.SimilarEntry, 0, len(related))
				for _, rel := range related {
					if re, ok := entryMap[rel.RelatedEntryID]; ok {
						similarEntries = append(similarEntries, view.SimilarEntry{
							ViewEntry: view.NewViewEntry(re, app.config.BaseURL),
							Score:     rel.Score,
						})
					}
				}
				e.SimilarEntries = similarEntries
			}
		}
	}

	// 4. Fallback for IDs that don't have TF-IDF results yet
	var fallbackEntryIDs []int64
	for i := range entries {
		if len(entries[i].SimilarEntries) == 0 {
			fallbackEntryIDs = append(fallbackEntryIDs, entries[i].ID)
		}
	}

	if len(fallbackEntryIDs) > 0 {
		// Bulk fetch images for all fallback entries
		allImages, err := app.ImagesDB().Q.ListImagesByEntryIDs(ctx, fallbackEntryIDs)
		if err == nil && len(allImages) > 0 {
			imageIDs := make([]int64, len(allImages))
			imageToEntryMap := make(map[int64]int64)
			for i, img := range allImages {
				imageIDs[i] = img.ID
				imageToEntryMap[img.ID] = img.EntryID
			}

			// Bulk fetch similar images for all images
			similarMap, err := app.findSimilarImagesBulk(ctx, allImages)
			if err == nil && len(similarMap) > 0 {
				// Group candidates by Entry ID
				candidatesMap := make(map[int64][]ScoredSimilarImage)
				entryIDMap := make(map[int64]bool)
				var entryIDsToFetch []int64

				for _, scoredImages := range similarMap {
					for _, scoredImg := range scoredImages {
						targetEntryID := imageToEntryMap[scoredImg.SearchImageID]
						candidatesMap[targetEntryID] = append(candidatesMap[targetEntryID], scoredImg)
						if !entryIDMap[scoredImg.EntryID] {
							entryIDsToFetch = append(entryIDsToFetch, scoredImg.EntryID)
							entryIDMap[scoredImg.EntryID] = true
						}
					}
				}

				// Bulk fetch entry details for all candidates
				entryRows, err := app.MainDB().Q.ListEntriesByIds(ctx, entryIDsToFetch)
				if err == nil {
					entryMap := make(map[int64]maindb.Entry)
					for _, re := range entryRows {
						entryMap[re.ID] = re
					}

					// Assign to entries
					for i := range entries {
						e := &entries[i]
						if len(e.SimilarEntries) > 0 {
							continue
						}

						candidates := candidatesMap[e.ID]
						if len(candidates) == 0 {
							continue
						}

						// Sort candidates by Jaccard score since they might come from multiple source images
						sort.Slice(candidates, func(i, j int) bool {
							return candidates[i].Jaccard > candidates[j].Jaccard
						})

						var viewImages []view.SimilarImage
						seenImageURI := make(map[string]bool)
						for _, cand := range candidates {
							if re, ok := entryMap[cand.EntryID]; ok {
								if seenImageURI[cand.Uri] {
									continue
								}
								displayTitle, _ := maindb.ParseTitle(re.Title)
								if displayTitle == "" {
									displayTitle = "✖"
								}
								viewImages = append(viewImages, view.SimilarImage{
									URI:        cand.Uri,
									EntryPath:  re.Path,
									EntryTitle: displayTitle,
									Score:      int64(cand.Jaccard * 100),
								})
								seenImageURI[cand.Uri] = true
								if len(viewImages) >= 3 { // Limit per entry
									break
								}
							}
						}
						e.SimilarImages = viewImages
					}
				}
			}
		}
	}
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

	entry, err := app.MainDB().Q.GetEntryByPath(ctx, path)
	if err != nil {
		if err == sql.ErrNoRows {
			return echo.NewHTTPError(http.StatusNotFound, "Entry not found")
		}
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to fetch entry").SetInternal(err)
	}

	if !entry.IsPubliclyVisible() && !app.IsAuth(c) {
		return echo.NewHTTPError(http.StatusNotFound, "Entry not found")
	}

	etag := GenerateEntryETag(entry.ID, entry.ModifiedAt, app.IsAuth(c))
	if ok, err := app.CheckCache(c, entry.ModifiedAt, etag); ok {
		return err
	}

	rows, err := app.MainDB().Q.ListTrackbackEntries(ctx, sql.NullInt64{Int64: entry.ID, Valid: true})
	if err != nil && err != sql.ErrNoRows {
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to fetch trackbacks").SetInternal(err)
	}
	trackbacks := view.NewViewTrackbacks(rows)

	olderEntry, err := app.MainDB().Q.GetOlderEntry(ctx, entry.CreatedAt)
	if err != nil && err != sql.ErrNoRows {
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to fetch older entry").SetInternal(err)
	}
	var olderPtr *view.ViewEntry
	if err == nil {
		v := view.NewViewEntry(olderEntry, app.config.BaseURL)
		olderPtr = &v
	}

	newerEntry, err := app.MainDB().Q.GetNewerEntry(ctx, entry.CreatedAt)
	if err != nil && err != sql.ErrNoRows {
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to fetch newer entry").SetInternal(err)
	}
	var newerPtr *view.ViewEntry
	if err == nil {
		v := view.NewViewEntry(newerEntry, app.config.BaseURL)
		newerPtr = &v
	}

	viewEntry := view.NewViewEntry(entry, app.config.BaseURL)
	viewEntry.IsDateBoundary = true
	viewEntries := []view.ViewEntry{viewEntry}
	app.populateSimilarEntries(ctx, viewEntries)

	// Deduplicate similar entries against trackbacks
	if len(trackbacks) > 0 && len(viewEntries[0].SimilarEntries) > 0 {
		trackbackIDs := make(map[int64]bool)
		for _, tb := range trackbacks {
			trackbackIDs[tb.ID] = true
		}
		filtered := make([]view.SimilarEntry, 0, len(viewEntries[0].SimilarEntries))
		for _, se := range viewEntries[0].SimilarEntries {
			if !trackbackIDs[se.ID] {
				filtered = append(filtered, se)
			}
		}
		viewEntries[0].SimilarEntries = filtered
	}

	data := &view.IndexData{
		LayoutData: app.newLayoutData(c, entry.DisplayTitle()),
		Entries:    viewEntries,
		IsDetail:   true,
		Trackbacks: trackbacks,
		Older:      olderPtr,
		Newer:      newerPtr,
	}

	data.Description = viewEntries[0].Summary
	data.OGType = "article"
	firstImage := string(viewEntry.FirstImageURL)
	isSupportedOGPFormat := false
	if firstImage != "" {
		ext := strings.ToLower(filepath.Ext(firstImage))
		switch ext {
		case ".jpg", ".jpeg", ".png", ".gif":
			isSupportedOGPFormat = true
		}
	}

	if isSupportedOGPFormat {
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
func getLatestModTime(entries []maindb.Entry) time.Time {
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

func (app *AppImpl) HandleSearch(c echo.Context) error {
	data := app.newLayoutData(c, "検索")
	return app.templates.RenderWithLayout(c, "layout.html", "search.html", data)
}

func (app *AppImpl) HandleApiSearch(c echo.Context) error {
	query := c.QueryParam("q")
	if query == "" {
		return c.JSON(http.StatusOK, map[string]interface{}{"results": []interface{}{}})
	}

	ctx := c.Request().Context()

	// 1. tfidf.db からマッチする ID を取得
	searchResults, err := app.Searcher().Search(ctx, query, 50)
	if err != nil {
		return err
	}

	if len(searchResults) == 0 {
		return c.JSON(http.StatusOK, map[string]interface{}{"results": []interface{}{}})
	}

	// 2. data.db から記事情報を取得
	ids := make([]int64, len(searchResults))
	scoreMap := make(map[int64]float64)
	for i, r := range searchResults {
		ids[i] = r.EntryID
		scoreMap[r.EntryID] = r.Score
	}

	entries, err := app.MainDB().Q.ListEntriesByIds(ctx, ids)
	if err != nil {
		return err
	}

	// 3. フィルタリングと並び替え
	type SearchEntryResponse struct {
		ID            int64    `json:"id"`
		Title         string   `json:"title"`
		Tags          []string `json:"tags"`
		Path          string   `json:"path"`
		Date          string   `json:"date"`
		CreatedAt     int64    `json:"created_at"`
		FormattedBody string   `json:"formatted_body"`
		Score         float64  `json:"score"`
	}

	var results []SearchEntryResponse
	now := time.Now()
	for _, e := range entries {
		// public かつ 公開済みかチェック
		if e.IsPubliclyVisible() {
			score := scoreMap[e.ID]
			// タイトルにクエリが含まれていればブースト
			if strings.Contains(strings.ToLower(e.Title), strings.ToLower(query)) {
				score *= 2.0
			}

			// 時間減衰 (Recency Boost)
			// 指数減衰から、より緩やかな減衰に変更: score = score / (1 + days/2000)
			// 2000日（約5.5年）でスコアが半分になる。
			if entryDate, err := time.Parse("2006-01-02", e.Date); err == nil {
				daysOld := now.Sub(entryDate).Hours() / 24
				if daysOld < 0 {
					daysOld = 0
				}
				score *= (1.0 / (1.0 + daysOld/2000.0))
			}

			results = append(results, SearchEntryResponse{
				ID:            e.ID,
				Title:         e.DisplayTitle(),
				Tags:          e.Tags(),
				Path:          e.Path,
				Date:          e.Date,
				CreatedAt:     e.CreatedAt.Unix(),
				FormattedBody: e.FormattedBody,
				Score:         score,
			})
		}
	}

	// 元のスコア順に並び替え
	sort.Slice(results, func(i, j int) bool {
		return results[i].Score > results[j].Score
	})

	// 検索結果の妥当性フィルタリング
	// 1. 最高スコアの 10% 以上のものだけ残す（ノイズを切り捨てつつ、候補は広く取る）
	// 2. 最大 20 件表示
	maxScore := 0.0
	if len(results) > 0 {
		maxScore = results[0].Score
	}

	finalResults := []SearchEntryResponse{}
	for _, r := range results {
		if r.Score >= maxScore*0.1 {
			finalResults = append(finalResults, r)
		}
		if len(finalResults) >= 20 {
			break
		}
	}

	return c.JSON(http.StatusOK, map[string]interface{}{"results": finalResults})
}
