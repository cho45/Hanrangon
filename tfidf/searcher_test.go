package tfidf

import (
	"context"
	"testing"
)

func TestSearch(t *testing.T) {
	ctx := context.Background()
	dataDB, dataQueries, tfidfDB, tfidfQueries := setupTestDBs(t)
	defer dataDB.Close()
	defer tfidfDB.Close()

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
	}

	for _, e := range entries {
		// formatted_body is NOT NULL in schema
		_, err := dataDB.Exec("INSERT INTO entries (id, title, body, formatted_body, path, format, date, created_at, modified_at, status) VALUES (?, ?, ?, ?, ?, 'Hatena', '2024-01-01', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'public')",
			e.id, e.title, e.body, e.body, e.title)
		if err != nil {
			t.Fatalf("failed to insert entry %d: %v", e.id, err)
		}
		if err := calc.UpdateTFIDF(ctx, e.id, e.title, e.body); err != nil {
			t.Fatalf("failed to update tfidf for entry %d: %v", e.id, err)
		}
	}

	// Recalculate values to populate postings.tfidf_n
	if err := calc.RecalculateTFIDFValues(ctx, nil); err != nil {
		t.Fatalf("failed to recalculate tfidf values: %v", err)
	}

	t.Run("Ranking by TF (Term Frequency)", func(t *testing.T) {
		// Entry 1 has "東京タワー" (multiple mentions of related bigrams implicitly)
		// Entry 3 has "東京" once.
		results, err := searcher.Search(ctx, "東京タワー", 10)
		if err != nil {
			t.Fatalf("search failed: %v", err)
		}
		if len(results) < 2 {
			t.Fatalf("expected results, got %d", len(results))
		}
		if results[0].EntryID != 1 {
			t.Errorf("expected Entry 1 (exact match) to be first, got %d", results[0].EntryID)
		}
	})

	t.Run("Ranking by IDF (Rare vs Common)", func(t *testing.T) {
		// "晴れ" is common (if we had more entries)
		// "超絶弩級" is very rare (DF=1)
		// Querying both should prioritize the one with the rare term if scores are calculated correctly
		results, err := searcher.Search(ctx, "東京 晴れ 超絶弩級", 10)
		if err != nil {
			t.Fatalf("search failed: %v", err)
		}
		// Entry 4 has "超絶弩級", Entry 3 has "東京" and "晴れ"
		// Since "超絶弩級" is DF=1, its IDF is much higher.
		if len(results) > 0 && results[0].EntryID != 4 {
			t.Errorf("expected Entry 4 (with rare term) to be top, got %d", results[0].EntryID)
		}
	})

	t.Run("Limit constraint", func(t *testing.T) {
		results, err := searcher.Search(ctx, "の", 2)
		if err != nil {
			t.Fatalf("search failed: %v", err)
		}
		if len(results) > 2 {
			t.Errorf("expected at most 2 results, got %d", len(results))
		}
	})

	t.Run("Mixed existent and non-existent terms", func(t *testing.T) {
		results, err := searcher.Search(ctx, "東京 魔法の呪文アブラカダブラ", 10)
		if err != nil {
			t.Fatalf("search failed: %v", err)
		}
		// Should still find "東京" entries
		found := false
		for _, r := range results {
			if r.EntryID == 1 || r.EntryID == 3 {
				found = true
				break
			}
		}
		if !found {
			t.Error("expected to find entries with '東京' even if other terms don't exist")
		}
	})

	t.Run("Empty query", func(t *testing.T) {
		results, err := searcher.Search(ctx, "", 10)
		if err != nil {
			t.Fatalf("search failed: %v", err)
		}
		if results != nil {
			t.Error("expected nil for empty query")
		}
	})
}
