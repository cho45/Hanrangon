package subcommands

import (
	"context"
	"testing"
	"time"

	"github.com/cho45/hanrangon/backend/app"
	"github.com/cho45/hanrangon/internal/testutil"
)

func TestRecalcMetadata(t *testing.T) {
	dbs := testutil.SetupAllDBs(t)
	defer dbs.Close()

	config := app.LoadConfig()

	application := app.NewApp(config, dbs.MainDB, dbs.TFIDFDB, dbs.WorkerDB, dbs.ImagesDB, dbs.CacheDB, nil, nil, nil, nil)
	ctx := context.Background()

	// テストデータの準備
	now := time.Now().Format("2006-01-02 15:04:05-07:00")
	_, err := dbs.MainDB.Exec(`
		INSERT INTO entries (id, path, title, body, formatted_body, summary, image_url, format, date, created_at, modified_at)
		VALUES
		(1, '/test1', 'Title 1', 'Body 1', '<p>Formatted Body 1 <img src="/img1.png"></p>', '', '', 'html', '2024-01-01', ?, ?),
		(2, '/test2', 'Title 2', 'Body 2', '<p>Formatted Body 2 <img src="/img2.png"></p>', '', '', 'html', '2024-01-02', ?, ?)
	`, now, now, now, now)
	if err != nil {
		t.Fatal(err)
	}

	t.Run("Usage (no args)", func(t *testing.T) {
		err := RecalcMetadata(ctx, application, []string{})
		if err != nil {
			t.Errorf("expected nil error, got %v", err)
		}
	})

	t.Run("Dry-run with -id", func(t *testing.T) {
		err := RecalcMetadata(ctx, application, []string{"-id", "1", "-dry-run"})
		if err != nil {
			t.Errorf("expected nil error, got %v", err)
		}

		var summary, imageURL string
		err = dbs.MainDB.DB.QueryRow("SELECT summary, image_url FROM entries WHERE id = 1").Scan(&summary, &imageURL)
		if err != nil {
			t.Fatal(err)
		}
		if summary != "" || imageURL != "" {
			t.Errorf("expected empty metadata in dry-run, got summary=%q, imageURL=%q", summary, imageURL)
		}
	})

	t.Run("Force with -id", func(t *testing.T) {
		err := RecalcMetadata(ctx, application, []string{"-id", "1", "-force"})
		if err != nil {
			t.Errorf("expected nil error, got %v", err)
		}

		var summary, imageURL string
		err = dbs.MainDB.DB.QueryRow("SELECT summary, image_url FROM entries WHERE id = 1").Scan(&summary, &imageURL)
		if err != nil {
			t.Fatal(err)
		}
		if summary != "Formatted Body 1" {
			t.Errorf("expected summary %q, got %q", "Formatted Body 1", summary)
		}
		if imageURL != "/img1.png" {
			t.Errorf("expected imageURL %q, got %q", "/img1.png", imageURL)
		}

		// ID 2 は更新されていないことを確認
		err = dbs.MainDB.DB.QueryRow("SELECT summary, image_url FROM entries WHERE id = 2").Scan(&summary, &imageURL)
		if err != nil {
			t.Fatal(err)
		}
		if summary != "" || imageURL != "" {
			t.Errorf("expected ID 2 to be empty, got summary=%q, imageURL=%q", summary, imageURL)
		}
	})

	t.Run("Force with -all", func(t *testing.T) {
		err := RecalcMetadata(ctx, application, []string{"-all", "-force"})
		if err != nil {
			t.Errorf("expected nil error, got %v", err)
		}

		var count int
		err = dbs.MainDB.DB.QueryRow("SELECT COUNT(*) FROM entries WHERE summary != '' AND image_url != ''").Scan(&count)
		if err != nil {
			t.Fatal(err)
		}
		if count != 2 {
			t.Errorf("expected 2 updated entries, got %d", count)
		}
	})

	t.Run("Update when content changed", func(t *testing.T) {
		// 画像を削除した状態に更新
		_, err := dbs.MainDB.Exec("UPDATE entries SET formatted_body = '<p>No image here</p>' WHERE id = 1")
		if err != nil {
			t.Fatal(err)
		}

		err = RecalcMetadata(ctx, application, []string{"-id", "1", "-force"})
		if err != nil {
			t.Errorf("expected nil error, got %v", err)
		}

		var summary, imageURL string
		err = dbs.MainDB.DB.QueryRow("SELECT summary, image_url FROM entries WHERE id = 1").Scan(&summary, &imageURL)
		if err != nil {
			t.Fatal(err)
		}

		if summary != "No image here" {
			t.Errorf("expected summary %q, got %q", "No image here", summary)
		}
		if imageURL != "" {
			t.Errorf("expected empty imageURL, got %q", imageURL)
		}
	})
}
