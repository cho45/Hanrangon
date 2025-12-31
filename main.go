package main

import (
	"database/sql"
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

	// Routes
	e.GET("/", app.HandleIndex)

	// Start server
	e.Logger.Fatal(e.Start(":5555"))
}

func (app *App) HandleIndex(c echo.Context) error {
	ctx := c.Request().Context()

	// 最新の記事を取得
	entries, err := app.queries.ListEntries(ctx, model.ListEntriesParams{
		Date:  time.Now(),
		Limit: 10,
	})
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to fetch entries").SetInternal(err)
	}

	// HTMLレンダリング
	return view.Index(entries).Render(ctx, c.Response())
}
