package testutil

import (
	"database/sql"
	"os"
	"path/filepath"
	"runtime"
	"sync"
	"testing"

	"github.com/cho45/hanrangon/backend/model"
	"github.com/cho45/hanrangon/backend/model/cachedb"
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
	cacheDB  dbType = "cache"
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
	cacheDB:  "backend/db/schema/cache.sql",
}

var (
	schemaCache      = make(map[dbType]string)
	schemaCacheMutex sync.RWMutex
)

// DBs holds all test databases and their query objects
type DBs struct {
	MainDB   *model.Database[maindb.Querier]
	TFIDFDB  *model.Database[tfidfdb.Querier]
	WorkerDB *model.Database[workerdb.Querier]
	ImagesDB *model.Database[imagesdb.Querier]
	CacheDB  *model.Database[cachedb.Querier]
}

// Close closes all databases
func (d *DBs) Close() {
	if d.MainDB != nil {
		d.MainDB.Close()
	}
	if d.TFIDFDB != nil {
		d.TFIDFDB.Close()
	}
	if d.WorkerDB != nil {
		d.WorkerDB.Close()
	}
	if d.ImagesDB != nil {
		d.ImagesDB.Close()
	}
	if d.CacheDB != nil {
		d.CacheDB.Close()
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
	db.SetMaxOpenConns(1)
	db.SetMaxIdleConns(1)

	// Read schema file from cache or disk
	schemaCacheMutex.RLock()
	schema, ok := schemaCache[typ]
	schemaCacheMutex.RUnlock()

	if !ok {
		schemaCacheMutex.Lock()
		// Double-check after acquiring lock
		schema, ok = schemaCache[typ]
		if !ok {
			projectRoot := getProjectRoot()
			schemaPath := filepath.Join(projectRoot, schemaFiles[typ])
			bytes, err := os.ReadFile(schemaPath)
			if err != nil {
				schemaCacheMutex.Unlock()
				t.Fatalf("failed to read %s schema from %s: %v", typ, schemaPath, err)
			}
			schema = string(bytes)
			schemaCache[typ] = schema
		}
		schemaCacheMutex.Unlock()
	}

	// Optimize SQLite for testing (in-memory database)
	// These settings sacrifice durability for speed, which is fine for ephemeral test databases
	// Note: journal_mode=OFF disables rollback, so we use MEMORY instead
	if _, err := db.Exec("PRAGMA journal_mode = MEMORY"); err != nil {
		t.Fatalf("failed to set journal_mode pragma: %v", err)
	}
	if _, err := db.Exec("PRAGMA synchronous = OFF"); err != nil {
		t.Fatalf("failed to set synchronous pragma: %v", err)
	}
	if _, err := db.Exec("PRAGMA cache_size = 10000"); err != nil {
		t.Fatalf("failed to set cache_size pragma: %v", err)
	}
	if _, err := db.Exec("PRAGMA locking_mode = EXCLUSIVE"); err != nil {
		t.Fatalf("failed to set locking_mode pragma: %v", err)
	}
	if _, err := db.Exec("PRAGMA temp_store = MEMORY"); err != nil {
		t.Fatalf("failed to set temp_store pragma: %v", err)
	}

	// Apply schema
	if _, err := db.Exec(schema); err != nil {
		t.Fatalf("failed to apply %s schema: %v", typ, err)
	}

	return db
}

// SetupAllDBs creates all 4 test databases with query objects
func SetupAllDBs(t *testing.T) *DBs {
	t.Helper()

	mainDBConn := newTestDB(t, mainDB)
	tfidfDBConn := newTestDB(t, tfidfDB)
	workerDBConn := newTestDB(t, workerDB)
	imagesDBConn := newTestDB(t, imagesDB)
	cacheDBConn := newTestDB(t, cacheDB)

	return &DBs{
		MainDB:   model.NewDatabase[maindb.Querier](mainDBConn, func(db model.DBTX) maindb.Querier { return maindb.New(db) }),
		TFIDFDB:  model.NewDatabase[tfidfdb.Querier](tfidfDBConn, func(db model.DBTX) tfidfdb.Querier { return tfidfdb.New(db) }),
		WorkerDB: model.NewDatabase[workerdb.Querier](workerDBConn, func(db model.DBTX) workerdb.Querier { return workerdb.New(db) }),
		ImagesDB: model.NewDatabase[imagesdb.Querier](imagesDBConn, func(db model.DBTX) imagesdb.Querier { return imagesdb.New(db) }),
		CacheDB:  model.NewDatabase[cachedb.Querier](cacheDBConn, func(db model.DBTX) cachedb.Querier { return cachedb.New(db) }),
	}
}
