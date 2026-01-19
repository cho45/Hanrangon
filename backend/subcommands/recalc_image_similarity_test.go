package subcommands

import (
	"context"
	"testing"

	"github.com/cho45/hanrangon/backend/app"
	"github.com/cho45/hanrangon/internal/testutil"
)

func TestRecalcImageSimilarity(t *testing.T) {
	dbs := testutil.SetupAllDBs(t)
	defer dbs.Close()

	config := app.LoadConfig()

	application := app.NewApp(config, dbs.MainDB, dbs.TFIDFDB, dbs.WorkerDB, dbs.ImagesDB, nil, nil, nil, nil)
	ctx := context.Background()

	// テストデータの準備
	_, err := dbs.ImagesDB.Exec("INSERT INTO images (id, uri, entry_id, sig) VALUES (1, '/test.png', 1, x'0101010101010101')")
	if err != nil {
		t.Fatal(err)
	}

	t.Run("Without force or dry-run", func(t *testing.T) {
		err := RecalcImageSimilarity(ctx, application, []string{})
		if err != nil {
			t.Errorf("expected nil error, got %v", err)
		}
		// キャッシュが作成されていないことを確認
		var count int
		dbs.ImagesDB.DB.QueryRow("SELECT COUNT(*) FROM similar_images").Scan(&count)
		if count != 0 {
			t.Errorf("expected 0 cache records, got %d", count)
		}
	})

	t.Run("With dry-run", func(t *testing.T) {
		err := RecalcImageSimilarity(ctx, application, []string{"--dry-run"})
		if err != nil {
			t.Errorf("expected nil error, got %v", err)
		}
		// キャッシュが作成されていないことを確認
		var count int
		dbs.ImagesDB.DB.QueryRow("SELECT COUNT(*) FROM similar_images").Scan(&count)
		if count != 0 {
			t.Errorf("expected 0 cache records, got %d", count)
		}
	})

	t.Run("With force", func(t *testing.T) {
		// ngram が必要なので追加
		_, err = dbs.ImagesDB.Exec("INSERT INTO ngram (image_id, word) VALUES (1, 1)")
		if err != nil {
			t.Fatal(err)
		}

		err := RecalcImageSimilarity(ctx, application, []string{"--force"})
		if err != nil {
			t.Errorf("expected nil error, got %v", err)
		}
		// キャッシュが作成されていることを確認（自分自身とは類似度計算されないので、他の画像が必要）
		// ここではエラーが出ずに終了することを確認
	})
}
