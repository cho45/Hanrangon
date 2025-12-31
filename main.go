package main

import (
	"database/sql"
	"fmt"
	"log"
	"net/http"
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
	// 既存の data.db を参照 (開発用)
	dbPath := "../data.db"

	db, err := sql.Open("sqlite", dbPath)
	if err != nil {
		log.Fatalf("failed to open db: %v", err)
	}
	defer db.Close()

	if err := db.Ping(); err != nil {
		log.Fatalf("failed to ping db: %v", err)
	}

	app := &App{
		queries: model.New(db),
		db:      db,
	}

	e := echo.New()

	// Middleware
	e.Use(middleware.Logger())
	e.Use(middleware.Recover())

	// Static files
	e.Static("/css", "../static/css")
	e.Static("/js", "../static/js")
	e.Static("/images", "../static/images")

	// Routes
	e.GET("/", app.HandleIndex)
	e.GET("/.page/:date/:limit", app.HandleIndex)
	e.GET("/:yyyy/:mm/:dd/:n", app.HandleEntry)
	e.GET("/archive", app.HandleArchive)

	// Start server
	e.Logger.Fatal(e.Start(":5555"))
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
		Date:  targetDate,
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
		nextDate := lastEntry.Date.Format("20060102")
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
