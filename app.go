package main

import (
	"database/sql"
	"net/http"
	"strings"

	"github.com/cho45/hanrangon/jobqueue"
	"github.com/cho45/hanrangon/model"
	"github.com/labstack/echo-contrib/session"
	"github.com/labstack/echo/v4"
)

type App struct {
	queries       *model.Queries
	db            *sql.DB
	tfidfQueries  *model.Queries
	tfidfDB       *sql.DB
	workerQueries *model.Queries
	workerDB      *sql.DB
	jobQueue      *jobqueue.Queue
	config        *Config
}

func NewApp(config *Config, db *sql.DB, tfidfDB *sql.DB, workerDB *sql.DB, queue *jobqueue.Queue) *App {
	return &App{
		queries:       model.New(db),
		db:            db,
		tfidfQueries:  model.New(tfidfDB),
		tfidfDB:       tfidfDB,
		workerQueries: model.New(workerDB),
		workerDB:      workerDB,
		jobQueue:      queue,
		config:        config,
	}
}

func (app *App) RequireAuth(next echo.HandlerFunc) echo.HandlerFunc {

	return func(c echo.Context) error {

		if !app.IsAuth(c) {

			if c.Request().Header.Get("X-Requested-With") == "XMLHttpRequest" ||

				strings.HasPrefix(c.Request().URL.Path, "/api/") {

				return echo.NewHTTPError(http.StatusUnauthorized, "Authentication required")

			}

			return c.Redirect(http.StatusFound, "/login?return="+c.Request().URL.Path)

		}

		return next(c)

	}

}

func (app *App) IsAuth(c echo.Context) bool {

	sess, _ := session.Get("session", c)

	auth, ok := sess.Values["auth"].(bool)

	return ok && auth

}
