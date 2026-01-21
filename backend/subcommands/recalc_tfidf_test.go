package subcommands

import (
	"context"
	"testing"
	"time"

	"github.com/cho45/hanrangon/backend/app"
	"github.com/cho45/hanrangon/backend/tfidf"
	"github.com/cho45/hanrangon/internal/testutil"
)

func TestRecalcTFIDF(t *testing.T) {
	dbs := testutil.SetupAllDBs(t)
	defer dbs.Close()

	config := app.LoadConfig()

	// TF-IDF calculators
	calculator, err := tfidf.NewCalculator(dbs.TFIDFDB.DB, dbs.TFIDFDB.Q, dbs.MainDB.DB, dbs.MainDB.Q)
	if err != nil {
		t.Fatal(err)
	}
	// テスト環境ではエントリ数が少ないため、閾値を 100% にして全ての単語を計算対象にする
	calculator.DFMaxThresholdRate = 1.0
	similarityCalculator := tfidf.NewSimilarityCalculator(dbs.TFIDFDB.DB, dbs.TFIDFDB.Q)
	// テスト用に閾値を下げる
	similarityCalculator.MinValidTerms = 2

	application := app.NewApp(config, dbs.MainDB, dbs.TFIDFDB, dbs.WorkerDB, dbs.ImagesDB, dbs.CacheDB, calculator, similarityCalculator, nil, nil)
	ctx := context.Background()

	// テストデータの準備 (DF > 1 にするために同じ単語を含むエントリを複数作成)
	// DF=1 の単語は postings に入らないため、共通の単語を複数含める必要がある
	now := time.Now().Format("2006-01-02 15:04:05-07:00")
	_, err = dbs.MainDB.Exec(`
		INSERT INTO entries (id, path, title, body, formatted_body, format, date, created_at, modified_at)
		VALUES
		(1, '/test1', 'Common Title', 'This is a common programming language. It is very fast and efficient.', '<p>Content 1</p>', 'html', '2024-01-01', ?, ?),
		(2, '/test2', 'Common Title', 'This is another common programming language. It is very popular and easy.', '<p>Content 2</p>', 'html', '2024-01-02', ?, ?),
		(3, '/test3', 'Unique Title', 'This is a unique entry but it also mentions programming and language.', '<p>Content 3</p>', 'html', '2024-01-03', ?, ?)
	`, now, now, now, now, now, now)
	if err != nil {
		t.Fatal(err)
	}

	t.Run("Dry-run", func(t *testing.T) {
		err := RecalcTFIDF(ctx, application, []string{"-dry-run"})
		if err != nil {
			t.Errorf("expected nil error, got %v", err)
		}

		var count int
		err = dbs.TFIDFDB.DB.QueryRow("SELECT COUNT(*) FROM postings").Scan(&count)
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
		err = dbs.TFIDFDB.DB.QueryRow("SELECT COUNT(*) FROM postings WHERE tfidf_n > 0").Scan(&count)
		if err != nil {
			t.Fatal(err)
		}
		if count == 0 {
			t.Error("expected postings to be created and tfidf values calculated")
		}

		// Phase 3: Similarity が計算されているか確認
		// (similarity は postings の tfidf_n を使って計算される)
		err = dbs.TFIDFDB.DB.QueryRow("SELECT COUNT(*) FROM related_entries").Scan(&count)
		if err != nil {
			t.Fatal(err)
		}
		if count == 0 {
			t.Error("expected related entries to be calculated")
		}
	})
}
