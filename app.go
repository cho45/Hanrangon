package main

import (
	"database/sql"

	"github.com/cho45/hanrangon/model"
)

type App struct {
	queries      *model.Queries
	db           *sql.DB
	tfidfQueries *model.Queries
	tfidfDB      *sql.DB
}

func NewApp(db *sql.DB, tfidfDB *sql.DB) *App {
	return &App{
		queries:      model.New(db),
		db:           db,
		tfidfQueries: model.New(tfidfDB),
		tfidfDB:      tfidfDB,
	}
}
