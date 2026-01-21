package tfidf

import (
	"context"
	"testing"
	"time"

	"github.com/cho45/hanrangon/internal/testutil"
)

func TestSearch(t *testing.T) {
	ctx := context.Background()
	dbs := testutil.SetupAllDBs(t)
	defer dbs.Close()
	dataDB, dataQueries, tfidfDB, tfidfQueries := dbs.MainDB.DB, dbs.MainDB.Q, dbs.TFIDFDB.DB, dbs.TFIDFDB.Q

	calc, err := NewCalculator(tfidfDB, tfidfQueries, dataDB, dataQueries)
	if err != nil {
		t.Fatalf("failed to create calculator: %v", err)
	}
	calc.DFMaxThresholdRate = 1.0 // Disable thresholding for small test data

	searcher := NewSearcher(tfidfDB, tfidfQueries, calc)

	// 1. Prepare sample entries
	entries := []struct {
		id    int64
		title string
		body  string
	}{
		{1, "東京タワー", "東京タワーは港区にある電波塔です。"},
		{2, "京都の寺院", "京都にはたくさんの古い寺院があります。"},
		{3, "東京の天気", "今日の東京は晴れです。"},
		{4, "ユニーク単語", "これは珍しい言葉「超絶弩級」を含む記事です。"},
		{10, "JS", "I love javascript"},
	}

	now := time.Now().Format("2006-01-02 15:04:05-07:00")
	for _, e := range entries {
		_, err := dataDB.Exec("INSERT INTO entries (id, title, body, formatted_body, path, format, date, created_at, modified_at, status) VALUES (?, ?, ?, ?, ?, 'Hatena', '2024-01-01', ?, ?, 'public')",
			e.id, e.title, e.body, e.body, e.title, now, now)
		if err != nil {
			t.Fatalf("failed to insert entry %d: %v", e.id, err)
		}
		if err := calc.UpdateTFIDF(ctx, e.id, e.title, e.body); err != nil {
			t.Fatalf("failed to update tfidf for entry %d: %v", e.id, err)
		}
	}

	if err := calc.RecalculateTFIDFValues(ctx, nil); err != nil {
		t.Fatalf("failed to recalculate tfidf values: %v", err)
	}

	t.Run("AND search requirements", func(t *testing.T) {
		// "東京タワー" contains 4 bigrams.
		// Entry 1 has all of them. Entry 3 only has "東京".
		results, err := searcher.Search(ctx, "東京タワー", 10)
		if err != nil {
			t.Fatalf("search failed: %v", err)
		}
		if len(results) != 1 {
			t.Errorf("expected exactly 1 result for '東京タワー' (Entry 1), got %d", len(results))
		}
	})

	t.Run("Partial alphanumeric match (javas -> javascript)", func(t *testing.T) {
		// Searching for "javas" (word javas + bigrams ja, av, va, as)
		// even if the word "javas" is not in the terms table, it should match Entry 10 via bigrams.
		results, err := searcher.Search(ctx, "javas", 10)
		if err != nil {
			t.Fatalf("search failed: %v", err)
		}

		found := false
		for _, r := range results {
			if r.EntryID == 10 {
				found = true
				break
			}
		}
		if !found {
			t.Errorf("expected to find Entry 10 ('javascript') with 'javas' query via bigram matching")
		}
	})

	t.Run("AND search with high-frequency term (score 0)", func(t *testing.T) {
		// Ensure "港区" has DF >= 2 so it exists in postings table
		_ = calc.UpdateTFIDF(ctx, 3, "東京の天気", "港区の天気です")
		_ = calc.RecalculateTFIDFValues(ctx, nil)

		// Simulate high-frequency term by zeroing score
		_, err := tfidfDB.Exec("UPDATE postings SET tfidf = 0, tfidf_n = 0 WHERE term_id IN (SELECT id FROM terms WHERE term = '港区')")
		if err != nil {
			t.Fatalf("failed to zero out term: %v", err)
		}

		// Search for "東京 港区"
		// Entry 1 has both. "港区" has 0 weight but must still be counted for AND.
		results, err := searcher.Search(ctx, "東京 港区", 10)
		if err != nil {
			t.Fatalf("search failed: %v", err)
		}

		found := false
		for _, r := range results {
			if r.EntryID == 1 {
				found = true
				break
			}
		}
		if !found {
			t.Errorf("expected Entry 1 to match even if one required term has 0 weight")
		}
	})

	t.Run("No match for missing required bigrams", func(t *testing.T) {
		results, err := searcher.Search(ctx, "東京 存在しない", 10)
		if err != nil {
			t.Fatalf("search failed: %v", err)
		}
		if len(results) != 0 {
			t.Errorf("expected 0 results for AND search with missing bigram, got %d", len(results))
		}
	})
}
