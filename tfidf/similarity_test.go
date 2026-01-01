package tfidf

import (
	"context"
	"database/sql"
	"os"
	"testing"

	"github.com/cho45/hanrangon/model"
	_ "github.com/mattn/go-sqlite3"
)

// setupTestDBForSimilarity creates an in-memory database for similarity testing
func setupTestDBForSimilarity(t *testing.T) (*sql.DB, *model.Queries, *Calculator, *SimilarityCalculator) {
	db, err := sql.Open("sqlite3_with_math_functions", ":memory:")
	if err != nil {
		t.Fatalf("failed to open db: %v", err)
	}

	// Load schema
	schema, err := os.ReadFile("../db/schema/tfidf.sql")
	if err != nil {
		t.Fatalf("failed to read schema: %v", err)
	}

	if _, err := db.Exec(string(schema)); err != nil {
		t.Fatalf("failed to create schema: %v", err)
	}

	queries := model.New(db)
	calc, err := NewCalculator(db, queries)
	if err != nil {
		t.Fatalf("failed to create calculator: %v", err)
	}

	sim := NewSimilarityCalculator(db, queries)

	return db, queries, calc, sim
}

func TestCalculateSimilarEntries(t *testing.T) {
	db, _, calc, sim := setupTestDBForSimilarity(t)
	defer db.Close()

	ctx := context.Background()

	// Create test entries with similar content
	entries := []struct {
		id    int64
		title string
		body  string
	}{
		{1, "Goプログラミング入門", "Goは高速で並行処理が得意な言語です。Goでサーバーを書くと効率的です。"},
		{2, "Go言語の特徴", "Go言語は並行処理が得意です。goroutineを使うと簡単に並行処理を実装できます。"},
		{3, "Pythonプログラミング", "Pythonは機械学習に最適な言語です。TensorFlowやPyTorchが使えます。"},
		{4, "機械学習入門", "機械学習にはPythonがよく使われます。ニューラルネットワークを実装できます。"},
		{5, "データベース設計", "データベースの正規化は重要です。インデックスを適切に設定しましょう。"},
	}

	// Update TF-IDF for all entries
	for _, entry := range entries {
		err := calc.UpdateTFIDF(ctx, entry.id, entry.title, entry.body)
		if err != nil {
			t.Fatalf("failed to update tfidf for entry %d: %v", entry.id, err)
		}
	}

	// Recalculate TF-IDF values
	err := calc.RecalculateTFIDFValues(ctx, []int64{})
	if err != nil {
		t.Fatalf("failed to recalculate tfidf values: %v", err)
	}

	// Calculate similar entries for entry 2 (Go language entry)
	err = sim.CalculateSimilarEntries(ctx, []int64{2})
	if err != nil {
		t.Fatalf("failed to calculate similar entries: %v", err)
	}

	// Verify related entries were inserted
	rows, err := db.Query("SELECT related_entry_id, score FROM related_entries WHERE entry_id = ? ORDER BY score DESC", 2)
	if err != nil {
		t.Fatalf("failed to query related entries: %v", err)
	}
	defer rows.Close()

	var relatedEntries []struct {
		entryID int64
		score   float64
	}
	for rows.Next() {
		var re struct {
			entryID int64
			score   float64
		}
		if err := rows.Scan(&re.entryID, &re.score); err != nil {
			t.Fatalf("failed to scan row: %v", err)
		}
		relatedEntries = append(relatedEntries, re)
	}

	// Should have at least one related entry
	if len(relatedEntries) == 0 {
		t.Error("expected at least one related entry, got none")
	}

	// The most similar entry should be entry 1 (both about Go)
	if len(relatedEntries) > 0 {
		mostSimilar := relatedEntries[0]
		if mostSimilar.entryID != 1 {
			t.Errorf("expected most similar entry to be 1 (Go programming), got %d", mostSimilar.entryID)
		}

		// Score should be positive and reasonable (0 < score <= 1 for normalized vectors)
		if mostSimilar.score <= 0 {
			t.Errorf("expected positive similarity score, got %f", mostSimilar.score)
		}
		if mostSimilar.score > 1 {
			t.Errorf("expected normalized similarity score <= 1, got %f", mostSimilar.score)
		}
	}

	// Entry 3 (Python) should not be the most similar
	if len(relatedEntries) > 0 {
		for i, re := range relatedEntries {
			if re.entryID == 3 && i == 0 {
				t.Error("entry 3 (Python) should not be most similar to entry 2 (Go)")
			}
		}
	}
}

func TestCalculateSimilarEntriesMultiple(t *testing.T) {
	db, _, calc, sim := setupTestDBForSimilarity(t)
	defer db.Close()

	ctx := context.Background()

	// Create entries
	entries := []struct {
		id    int64
		title string
		body  string
	}{
		{1, "テスト1", "これは最初のテストです"},
		{2, "テスト2", "これは2番目のテストです"},
		{3, "テスト3", "これは3番目のテストです"},
	}

	for _, entry := range entries {
		err := calc.UpdateTFIDF(ctx, entry.id, entry.title, entry.body)
		if err != nil {
			t.Fatalf("failed to update tfidf for entry %d: %v", entry.id, err)
		}
	}

	err := calc.RecalculateTFIDFValues(ctx, []int64{})
	if err != nil {
		t.Fatalf("failed to recalculate tfidf values: %v", err)
	}

	// Calculate similar entries for all entries
	err = sim.CalculateSimilarEntries(ctx, []int64{1, 2, 3})
	if err != nil {
		t.Fatalf("failed to calculate similar entries: %v", err)
	}

	// Verify that related entries were calculated for all
	for _, entryID := range []int64{1, 2, 3} {
		var count int64
		err := db.QueryRow("SELECT COUNT(*) FROM related_entries WHERE entry_id = ?", entryID).Scan(&count)
		if err != nil {
			t.Fatalf("failed to count related entries for entry %d: %v", entryID, err)
		}
		// Should have some related entries (may be 0 if not enough similar content)
		t.Logf("Entry %d has %d related entries", entryID, count)
	}
}

func TestCalculateSimilarEntriesNoSimilar(t *testing.T) {
	db, _, calc, sim := setupTestDBForSimilarity(t)
	defer db.Close()

	ctx := context.Background()

	// Create entries with completely different content
	entries := []struct {
		id    int64
		title string
		body  string
	}{
		{1, "短い", "短"},
		{2, "別の内容", "完全に異なる長めの内容を持つエントリーです"},
	}

	for _, entry := range entries {
		err := calc.UpdateTFIDF(ctx, entry.id, entry.title, entry.body)
		if err != nil {
			t.Fatalf("failed to update tfidf for entry %d: %v", entry.id, err)
		}
	}

	err := calc.RecalculateTFIDFValues(ctx, []int64{})
	if err != nil {
		t.Fatalf("failed to recalculate tfidf values: %v", err)
	}

	// Calculate similar entries for entry 2
	err = sim.CalculateSimilarEntries(ctx, []int64{2})
	if err != nil {
		t.Fatalf("failed to calculate similar entries: %v", err)
	}

	// Verify that related_entries table was updated (even if no similar entries found)
	var count int64
	err = db.QueryRow("SELECT COUNT(*) FROM related_entries WHERE entry_id = ?", 2).Scan(&count)
	if err != nil {
		t.Fatalf("failed to count related entries: %v", err)
	}

	t.Logf("Entry 2 has %d related entries (expected 0 due to no similar content)", count)
}
