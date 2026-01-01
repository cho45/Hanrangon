package main

import (
	"database/sql"
	"fmt"
	"log"
	"net/http"
	"path/filepath"
	"regexp"
	"strings"
	"time"

	"github.com/cho45/hanrangon/model"
	"github.com/cho45/hanrangon/view"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	_ "modernc.org/sqlite"
)

type App struct {
	queries *model.Queries
	db      *sql.DB
}

func main() {
	config := LoadConfig()

	db, err := sql.Open("sqlite", config.DataDBPath)
	if err != nil {
		log.Fatalf("failed to open db: %v", err)
	}
	defer db.Close()

	if err := db.Ping(); err != nil {
		log.Fatalf("failed to ping db: %v", err)
	}

	e := NewServer(config, db)

	// Start server
	e.Logger.Fatal(e.Start(":5555"))
}

func NewServer(config *Config, db *sql.DB) *echo.Echo {
	app := &App{
		queries: model.New(db),
		db:      db,
	}

	e := echo.New()

	// Middleware
	e.Use(middleware.Logger())
	e.Use(middleware.Recover())

	// Static files
	e.Static("/css", filepath.Join(config.StaticDir, "css"))
	e.Static("/js", filepath.Join(config.StaticDir, "js"))
	e.Static("/images", filepath.Join(config.StaticDir, "images"))

	// Routes
	e.GET("/", app.HandleIndex)
	e.GET("/.page/:date/:limit", app.HandleIndex)
	e.GET("/archive", app.HandleArchive)

	// Date archives (order matters vs /:yyyy/:mm/:dd/:n)
	e.GET("/:param/", app.HandleRootParam) // Year archive OR Category
	e.GET("/:yyyy/:mm/", app.HandleDateArchive)
	e.GET("/:yyyy/:mm/:dd/", app.HandleDateArchive)

	e.GET("/:yyyy/:mm/:dd/:n", app.HandleEntry)

	e.GET("/:category/.page/:date/:limit", app.HandleCategory)

	e.GET("/feed", app.HandleFeed)
	e.GET("/sitemap.xml", app.HandleSitemap)
	e.GET("/robots.txt", app.HandleRobotsTxt)

	return e
}

func (app *App) HandleRootParam(c echo.Context) error {
	param := c.Param("param")
	if regexp.MustCompile(`^\d{4}`).MatchString(param) {
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

func (app *App) HandleFeed(c echo.Context) error {
	ctx := c.Request().Context()

	entries, err := app.queries.ListEntries(ctx, model.ListEntriesParams{
		Date:  time.Now().Format("2006-01-02"),
		Limit: 20,
	})
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to fetch entries").SetInternal(err)
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

	entries, err := app.queries.ListEntriesByCategory(ctx, model.ListEntriesByCategoryParams{
		Title: fmt.Sprintf("%%[%s]%%", category),
		Date:  targetDate.Format("2006-01-02"),
		Limit: int64(fetchLimit),
	})
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to fetch entries").SetInternal(err)
	}

	var nextPage string
	if len(entries) > limit {
		lastEntry := entries[len(entries)-1]
		entries = entries[:limit]

		// Date is already "YYYY-MM-DD" string
		nextDate := strings.ReplaceAll(lastEntry.Date, "-", "")
		nextPage = fmt.Sprintf("/%s/.page/%s/%d", category, nextDate, limit)
	}
	return view.Index(entries, nextPage).Render(ctx, c.Response())
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

	startStr := start.Format("2006-01-02")
	endStr := end.Format("2006-01-02")
	fmt.Printf("HandleDateArchive: start=%s, end=%s\n", startStr, endStr)

	entries, err := app.queries.ListEntriesByYearMonthDay(ctx, model.ListEntriesByYearMonthDayParams{
		Date:   startStr,
		Date_2: endStr,
	})
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to fetch entries").SetInternal(err)
	}

	return view.Index(entries, "").Render(ctx, c.Response())
}

func (app *App) HandleArchive(c echo.Context) error {
	ctx := c.Request().Context()

	archives, err := app.queries.ListArchiveMonths(ctx)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to fetch archives").SetInternal(err)
	}

	return view.Archive(view.ConvertArchives(archives)).Render(ctx, c.Response())
}

func (app *App) HandleIndex(c echo.Context) error {
	ctx := c.Request().Context()

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

	// 次ページ判定のために +1 件取得
	fetchLimit := limit + 1

	// 記事を取得
	entries, err := app.queries.ListEntries(ctx, model.ListEntriesParams{
		Date:  targetDate.Format("2006-01-02"),
		Limit: int64(fetchLimit),
	})
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to fetch entries").SetInternal(err)
	}

	var nextPage string
	if len(entries) > limit {
		// 次ページがある場合
		lastEntry := entries[len(entries)-1]
		// 表示用からは削除
		entries = entries[:limit]

		// 次ページのURLを生成 (例: /.page/20251230/10)
		nextDate := strings.ReplaceAll(lastEntry.Date, "-", "")
		nextPage = fmt.Sprintf("/.page/%s/%d", nextDate, limit)
	}
	// HTMLレンダリング
	return view.Index(entries, nextPage).Render(ctx, c.Response())
}

func (app *App) HandleEntry(c echo.Context) error {
	ctx := c.Request().Context()
	yyyy := c.Param("yyyy")
	mm := c.Param("mm")
	dd := c.Param("dd")
	n := c.Param("n")

	path := fmt.Sprintf("%s/%s/%s/%s", yyyy, mm, dd, n)

	entry, err := app.queries.GetEntryByPath(ctx, path)
	if err != nil {
		if err == sql.ErrNoRows {
			return echo.NewHTTPError(http.StatusNotFound, "Entry not found")
		}
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to fetch entry").SetInternal(err)
	}

	prev, err := app.queries.GetPrevEntry(ctx, entry.CreatedAt)
	if err != nil && err != sql.ErrNoRows {
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to fetch prev entry").SetInternal(err)
	}
	var prevPtr *model.Entry
	if err == nil {
		prevPtr = &prev
	}

	next, err := app.queries.GetNextEntry(ctx, entry.CreatedAt)
	if err != nil && err != sql.ErrNoRows {
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to fetch next entry").SetInternal(err)
	}
	var nextPtr *model.Entry
	if err == nil {
		nextPtr = &next
	}

	return view.Entry(entry, prevPtr, nextPtr).Render(ctx, c.Response())
}
