package subcommands

import (
	"context"
	"testing"

	"github.com/cho45/hanrangon/backend/app"
	"github.com/cho45/hanrangon/internal/testutil"
)

func TestReformat(t *testing.T) {
	dbs := testutil.SetupAllDBs(t)
	defer dbs.Close()

	config := app.LoadConfig()
	application := app.NewApp(config, dbs.MainDB, dbs.TFIDFDB, dbs.WorkerDB, dbs.ImagesDB, nil, nil, nil, nil)
	ctx := context.Background()

	// テストデータの準備 (古いフォーマット結果を持つエントリ)
	_, err := dbs.MainDB.Exec(`
		INSERT INTO entries (id, path, title, body, formatted_body, format, date, created_at, modified_at)
		VALUES
		(1, '2024/01/01/1', 'Title 1', 'Body 1', 'OLD FORMAT 1', 'Markdown', '2024-01-01', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
		(2, '2024/01/02/1', 'Title 2', 'Body 2', 'OLD FORMAT 2', 'Markdown', '2024-01-02', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
	`)
	if err != nil {
		t.Fatal(err)
	}

	t.Run("Usage (no args)", func(t *testing.T) {
		err := Reformat(ctx, application, []string{})
		if err != nil {
			t.Errorf("expected nil error, got %v", err)
		}
	})

	t.Run("Reformat with -prefix", func(t *testing.T) {
		err := Reformat(ctx, application, []string{"-prefix", "2024/01/01"})
		if err != nil {
			t.Errorf("expected nil error, got %v", err)
		}

		var formattedBody string
		// ID 1 は更新されているはず (Postprocess が走るので単純な文字列一致ではない可能性があるが、OLD ではなくなっているはず)
		err = dbs.MainDB.DB.QueryRow("SELECT formatted_body FROM entries WHERE id = 1").Scan(&formattedBody)
		if err != nil {
			t.Fatal(err)
		}
		if formattedBody == "OLD FORMAT 1" {
			t.Error("expected formatted_body to be updated for ID 1")
		}

		// ID 2 は更新されていないはず
		err = dbs.MainDB.DB.QueryRow("SELECT formatted_body FROM entries WHERE id = 2").Scan(&formattedBody)
		if err != nil {
			t.Fatal(err)
		}
		if formattedBody != "OLD FORMAT 2" {
			t.Errorf("expected formatted_body to remain unchanged for ID 2, got %q", formattedBody)
		}
	})

	t.Run("Reformat with -all", func(t *testing.T) {
		err := Reformat(ctx, application, []string{"-all"})
		if err != nil {
			t.Errorf("expected nil error, got %v", err)
		}

		var count int
		err = dbs.MainDB.DB.QueryRow("SELECT COUNT(*) FROM entries WHERE formatted_body LIKE 'OLD FORMAT%'").Scan(&count)
		if err != nil {
			t.Fatal(err)
		}
		if count != 0 {
			t.Errorf("expected all entries to be reformatted, but %d still have old format", count)
		}
	})
}
