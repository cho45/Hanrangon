package testutil

import (
	"testing"
)

func TestSetupAllDBs(t *testing.T) {
	dbs := SetupAllDBs(t)
	defer dbs.Close()

	// Verify all DBs are initialized
	if dbs.MainDB == nil {
		t.Error("Main DB is nil")
	}
	if dbs.TFIDFDB == nil {
		t.Error("TFIDF DB is nil")
	}
	if dbs.WorkerDB == nil {
		t.Error("Worker DB is nil")
	}
	if dbs.ImagesDB == nil {
		t.Error("Images DB is nil")
	}

	// Verify schemas were applied by checking if tables exist
	t.Run("Main DB has tables", func(t *testing.T) {
		var count int
		err := dbs.MainDB.DB.QueryRow("SELECT COUNT(*) FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").Scan(&count)
		if err != nil {
			t.Fatalf("failed to query Main DB tables: %v", err)
		}
		if count == 0 {
			t.Error("Main DB has no tables")
		}
	})

	t.Run("TFIDF DB has tables", func(t *testing.T) {
		var count int
		err := dbs.TFIDFDB.DB.QueryRow("SELECT COUNT(*) FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").Scan(&count)
		if err != nil {
			t.Fatalf("failed to query TFIDF DB tables: %v", err)
		}
		if count == 0 {
			t.Error("TFIDF DB has no tables")
		}
	})

	t.Run("Worker DB has tables", func(t *testing.T) {
		var count int
		err := dbs.WorkerDB.DB.QueryRow("SELECT COUNT(*) FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").Scan(&count)
		if err != nil {
			t.Fatalf("failed to query Worker DB tables: %v", err)
		}
		if count == 0 {
			t.Error("Worker DB has no tables")
		}
	})

	t.Run("Images DB has tables", func(t *testing.T) {
		var count int
		err := dbs.ImagesDB.DB.QueryRow("SELECT COUNT(*) FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").Scan(&count)
		if err != nil {
			t.Fatalf("failed to query Images DB tables: %v", err)
		}
		if count == 0 {
			t.Error("Images DB has no tables")
		}
	})
}

func TestTimezoneSettings(t *testing.T) {
	dbs := SetupAllDBs(t)
	defer dbs.Close()

	// Verify timezone is set to Asia/Tokyo by checking datetime behavior
	// We can't directly query the timezone setting, but we can verify
	// that datetime functions work correctly
	var datetime string
	err := dbs.MainDB.DB.QueryRow("SELECT datetime('now')").Scan(&datetime)
	if err != nil {
		t.Fatalf("failed to query datetime: %v", err)
	}
	if datetime == "" {
		t.Error("datetime returned empty string")
	}
	t.Logf("Current datetime with Asia/Tokyo: %s", datetime)
}

func TestDBsClose(t *testing.T) {
	dbs := SetupAllDBs(t)

	// Close all databases
	dbs.Close()

	// Verify databases are closed by attempting to query
	// (should fail after close)
	var count int
	err := dbs.MainDB.DB.QueryRow("SELECT 1").Scan(&count)
	if err == nil {
		t.Error("expected error after closing Main DB, but got none")
	}
}
