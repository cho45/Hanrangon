package testutil

import (
	"database/sql"
	"os"
	"path/filepath"
	"runtime"
	"testing"

	"github.com/cho45/hanrangon/backend/model/imagesdb"
	"github.com/cho45/hanrangon/backend/model/maindb"
	"github.com/cho45/hanrangon/backend/model/tfidfdb"
	"github.com/cho45/hanrangon/backend/model/workerdb"
	_ "github.com/mattn/go-sqlite3"
)

// DBType represents the type of database
type dbType string

const (
	mainDB   dbType = "main"
	tfidfDB  dbType = "tfidf"
	workerDB dbType = "worker"
	imagesDB dbType = "images"
)

// getProjectRoot returns the project root directory
func getProjectRoot() string {
	_, filename, _, _ := runtime.Caller(0)
	// filename is /path/to/project/internal/testutil/db.go
	// so go up 2 directories to get project root
	return filepath.Join(filepath.Dir(filename), "..", "..")
}

// schemaFiles maps DB types to their schema file paths relative to project root
var schemaFiles = map[dbType]string{
	mainDB:   "backend/db/schema/schema.sql",
	tfidfDB:  "backend/db/schema/tfidf.sql",
	workerDB: "backend/db/schema/worker.sql",
	imagesDB: "backend/db/schema/images.sql",
}

// DBs holds all test databases and their query objects
type DBs struct {
	Main          *sql.DB
	MainQueries   maindb.Querier
	TFIDF         *sql.DB
	TFIDFQueries  tfidfdb.Querier
	Worker        *sql.DB
	WorkerQueries workerdb.Querier
	Images        *sql.DB
	ImagesQueries imagesdb.Querier
}

// Close closes all databases
func (d *DBs) Close() {
	if d.Main != nil {
		d.Main.Close()
	}
	if d.TFIDF != nil {
		d.TFIDF.Close()
	}
	if d.Worker != nil {
		d.Worker.Close()
	}
	if d.Images != nil {
		d.Images.Close()
	}
}

// newTestDB creates a single in-memory test database with schema loaded
func newTestDB(t *testing.T, typ dbType) *sql.DB {
	t.Helper()

	// Open in-memory SQLite database with Asia/Tokyo timezone
	db, err := sql.Open("sqlite3", ":memory:?_loc=Asia/Tokyo")
	if err != nil {
		t.Fatalf("failed to open %s db: %v", typ, err)
	}

	// Read schema file from project root
	projectRoot := getProjectRoot()
	schemaPath := filepath.Join(projectRoot, schemaFiles[typ])
	schema, err := os.ReadFile(schemaPath)
	if err != nil {
		t.Fatalf("failed to read %s schema from %s: %v", typ, schemaPath, err)
	}

	// Apply schema
	if _, err := db.Exec(string(schema)); err != nil {
		t.Fatalf("failed to apply %s schema: %v", typ, err)
	}

	return db
}

// SetupAllDBs creates all 4 test databases with query objects
func SetupAllDBs(t *testing.T) *DBs {
	t.Helper()

	mainDB := newTestDB(t, mainDB)
	tfidfDB := newTestDB(t, tfidfDB)
	workerDB := newTestDB(t, workerDB)
	imagesDB := newTestDB(t, imagesDB)

	return &DBs{
		Main:          mainDB,
		MainQueries:   maindb.New(mainDB),
		TFIDF:         tfidfDB,
		TFIDFQueries:  tfidfdb.New(tfidfDB),
		Worker:        workerDB,
		WorkerQueries: workerdb.New(workerDB),
		Images:        imagesDB,
		ImagesQueries: imagesdb.New(imagesDB),
	}
}
