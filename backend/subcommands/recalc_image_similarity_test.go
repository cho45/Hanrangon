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

func TestRecalcImageSimilarity(t *testing.T) {
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
	_, err := dbs.Images.Exec("INSERT INTO images (id, uri, entry_id, sig) VALUES (1, '/test.png', 1, x'0101010101010101')")
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
		dbs.Images.QueryRow("SELECT COUNT(*) FROM similar_images").Scan(&count)
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
		dbs.Images.QueryRow("SELECT COUNT(*) FROM similar_images").Scan(&count)
		if count != 0 {
			t.Errorf("expected 0 cache records, got %d", count)
		}
	})

	t.Run("With force", func(t *testing.T) {
		// ngram が必要なので追加
		_, err = dbs.Images.Exec("INSERT INTO ngram (image_id, word) VALUES (1, 1)")
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
