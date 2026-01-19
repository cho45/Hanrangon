package subcommands

import (
	"context"
	"testing"

	"github.com/cho45/hanrangon/backend/app"
	"github.com/cho45/hanrangon/backend/model"
	"github.com/cho45/hanrangon/backend/model/imagesdb"
	"github.com/cho45/hanrangon/backend/model/maindb"
	"github.com/cho45/hanrangon/backend/model/tfidfdb"
	"github.com/cho45/hanrangon/backend/model/workerdb"
	"github.com/cho45/hanrangon/internal/testutil"
)

func TestRecalcMetadata(t *testing.T) {
	dbs := testutil.SetupAllDBs(t)
	defer dbs.Close()

	config := app.LoadConfig()
	mainDBWrapper := model.NewDatabase[maindb.Querier](dbs.Main, func(tx model.DBTX) maindb.Querier { return maindb.New(tx) })
	tfidfDBWrapper := model.NewDatabase[tfidfdb.Querier](dbs.TFIDF, func(tx model.DBTX) tfidfdb.Querier { return tfidfdb.New(tx) })
	workerDBWrapper := model.NewDatabase[workerdb.Querier](dbs.Worker, func(tx model.DBTX) workerdb.Querier { return workerdb.New(tx) })
	imagesDBWrapper := model.NewDatabase[imagesdb.Querier](dbs.Images, func(tx model.DBTX) imagesdb.Querier { return imagesdb.New(tx) })

	application := app.NewApp(config, mainDBWrapper, tfidfDBWrapper, workerDBWrapper, imagesDBWrapper, nil, nil, nil, nil)
	ctx := context.Background()

	// テストデータの準備
	_, err := dbs.Main.Exec(`
		INSERT INTO entries (id, path, title, body, formatted_body, summary, image_url, format, date, created_at, modified_at)
		VALUES
		(1, '/test1', 'Title 1', 'Body 1', '<p>Formatted Body 1 <img src="/img1.png"></p>', '', '', 'html', '2024-01-01', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
		(2, '/test2', 'Title 2', 'Body 2', '<p>Formatted Body 2 <img src="/img2.png"></p>', '', '', 'html', '2024-01-02', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
	`)
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
		err = dbs.Main.QueryRow("SELECT summary, image_url FROM entries WHERE id = 1").Scan(&summary, &imageURL)
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
		err = dbs.Main.QueryRow("SELECT summary, image_url FROM entries WHERE id = 1").Scan(&summary, &imageURL)
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
		err = dbs.Main.QueryRow("SELECT summary, image_url FROM entries WHERE id = 2").Scan(&summary, &imageURL)
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
		err = dbs.Main.QueryRow("SELECT COUNT(*) FROM entries WHERE summary != '' AND image_url != ''").Scan(&count)
		if err != nil {
			t.Fatal(err)
		}
		if count != 2 {
			t.Errorf("expected 2 updated entries, got %d", count)
		}
	})

	t.Run("Update when content changed", func(t *testing.T) {
		// 画像を削除した状態に更新
		_, err := dbs.Main.Exec("UPDATE entries SET formatted_body = '<p>No image here</p>' WHERE id = 1")
		if err != nil {
			t.Fatal(err)
		}

		err = RecalcMetadata(ctx, application, []string{"-id", "1", "-force"})
		if err != nil {
			t.Errorf("expected nil error, got %v", err)
		}

		var summary, imageURL string
		err = dbs.Main.QueryRow("SELECT summary, image_url FROM entries WHERE id = 1").Scan(&summary, &imageURL)
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
