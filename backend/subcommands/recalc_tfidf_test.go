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
	"github.com/cho45/hanrangon/backend/tfidf"
	"github.com/cho45/hanrangon/internal/testutil"
)

func TestRecalcTFIDF(t *testing.T) {
	dbs := testutil.SetupAllDBs(t)
	defer dbs.Close()

	config := app.LoadConfig()
	mainDBWrapper := model.NewDatabase[maindb.Querier](dbs.Main, func(tx model.DBTX) maindb.Querier { return maindb.New(tx) })
	tfidfDBWrapper := model.NewDatabase[tfidfdb.Querier](dbs.TFIDF, func(tx model.DBTX) tfidfdb.Querier { return tfidfdb.New(tx) })
	workerDBWrapper := model.NewDatabase[workerdb.Querier](dbs.Worker, func(tx model.DBTX) workerdb.Querier { return workerdb.New(tx) })
	imagesDBWrapper := model.NewDatabase[imagesdb.Querier](dbs.Images, func(tx model.DBTX) imagesdb.Querier { return imagesdb.New(tx) })

	// TF-IDF calculators
	calculator, err := tfidf.NewCalculator(dbs.TFIDF, tfidfDBWrapper.Q, dbs.Main, mainDBWrapper.Q)
	if err != nil {
		t.Fatal(err)
	}
	// テスト環境ではエントリ数が少ないため、閾値を 100% にして全ての単語を計算対象にする
	calculator.DFMaxThresholdRate = 1.0
	similarityCalculator := tfidf.NewSimilarityCalculator(dbs.TFIDF, tfidfDBWrapper.Q)
	// テスト用に閾値を下げる
	similarityCalculator.MinValidTerms = 2

	application := app.NewApp(config, mainDBWrapper, tfidfDBWrapper, workerDBWrapper, imagesDBWrapper, calculator, similarityCalculator, nil, nil)
	ctx := context.Background()

	// テストデータの準備 (DF > 1 にするために同じ単語を含むエントリを複数作成)
	// DF=1 の単語は postings に入らないため、共通の単語を複数含める必要がある
	_, err = dbs.Main.Exec(`
		INSERT INTO entries (id, path, title, body, formatted_body, format, date, created_at, modified_at)
		VALUES
		(1, '/test1', 'Common Title', 'This is a common programming language. It is very fast and efficient.', '<p>Content 1</p>', 'html', '2024-01-01', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
		(2, '/test2', 'Common Title', 'This is another common programming language. It is very popular and easy.', '<p>Content 2</p>', 'html', '2024-01-02', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
		(3, '/test3', 'Unique Title', 'This is a unique entry but it also mentions programming and language.', '<p>Content 3</p>', 'html', '2024-01-03', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
	`)
	if err != nil {
		t.Fatal(err)
	}

	t.Run("Dry-run", func(t *testing.T) {
		err := RecalcTFIDF(ctx, application, []string{"-dry-run"})
		if err != nil {
			t.Errorf("expected nil error, got %v", err)
		}

		var count int
		err = dbs.TFIDF.QueryRow("SELECT COUNT(*) FROM postings").Scan(&count)
		if err != nil {
			t.Fatal(err)
		}
		if count != 0 {
			t.Errorf("expected 0 postings in dry-run, got %d", count)
		}
	})

	t.Run("Force", func(t *testing.T) {
		err := RecalcTFIDF(ctx, application, []string{"-force"})
		if err != nil {
			t.Errorf("expected nil error, got %v", err)
		}

		// Phase 1 & 2: Postings が作成されているか確認
		var count int
		err = dbs.TFIDF.QueryRow("SELECT COUNT(*) FROM postings WHERE tfidf_n > 0").Scan(&count)
		if err != nil {
			t.Fatal(err)
		}
		if count == 0 {
			t.Error("expected postings to be created and tfidf values calculated")
		}

		// Phase 3: Similarity が計算されているか確認
		// (similarity は postings の tfidf_n を使って計算される)
		err = dbs.TFIDF.QueryRow("SELECT COUNT(*) FROM related_entries").Scan(&count)
		if err != nil {
			t.Fatal(err)
		}
		if count == 0 {
			t.Error("expected related entries to be calculated")
		}
	})
}
