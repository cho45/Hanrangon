package tfidf

import (
	"context"
	"database/sql"
	"os"
	"testing"

	"github.com/cho45/hanrangon/model"
	_ "github.com/mattn/go-sqlite3"
)

// setupTestDBForSimilarity creates in-memory databases for similarity testing
func setupTestDBForSimilarity(t *testing.T) (*sql.DB, *sql.DB, *Calculator, *SimilarityCalculator) {
	// Data DB
	dataDB, err := sql.Open("sqlite3", ":memory:")
	if err != nil {
		t.Fatalf("failed to open data db: %v", err)
	}
	dataSchema, err := os.ReadFile("../db/schema/schema.sql")
	if err != nil {
		t.Fatalf("failed to read data schema: %v", err)
	}
	if _, err := dataDB.Exec(string(dataSchema)); err != nil {
		t.Fatalf("failed to apply data schema: %v", err)
	}

	// TF-IDF DB
	tfidfDB, err := sql.Open("sqlite3", ":memory:")
	if err != nil {
		t.Fatalf("failed to open tfidf db: %v", err)
	}
	tfidfSchema, err := os.ReadFile("../db/schema/tfidf.sql")
	if err != nil {
		t.Fatalf("failed to read tfidf schema: %v", err)
	}
	if _, err := tfidfDB.Exec(string(tfidfSchema)); err != nil {
		t.Fatalf("failed to apply tfidf schema: %v", err)
	}

	dataQueries := model.New(dataDB)
	tfidfQueries := model.New(tfidfDB)

	calc, err := NewCalculator(tfidfDB, tfidfQueries, dataDB, dataQueries)
	if err != nil {
		t.Fatalf("failed to create calculator: %v", err)
	}

	sim := NewSimilarityCalculator(tfidfDB, tfidfQueries)
	sim.MinValidTerms = 0

	return dataDB, tfidfDB, calc, sim
}

func TestCalculateSimilarEntries(t *testing.T) {
	dataDB, tfidfDB, calc, sim := setupTestDBForSimilarity(t)
	defer dataDB.Close()
	defer tfidfDB.Close()

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
		{6, "JavaScript入門", "JSはウェブ開発に必須です。ReactやVueが人気です。"},
		{7, "Rustの学習", "Rustは安全なメモリ管理が特徴のシステムプログラミング言語です。"},
		{8, "Dockerの使い方", "コンテナ技術はデプロイを容易にします。"},
		{9, "Gitコマンド", "バージョン管理は開発の基本です。"},
		{10, "CSSデザイン", "見た目を整えるためにCSSを使います。"},
	}

	// Update TF-IDF for all entries
	for _, entry := range entries {
		// Insert into data DB for promotion logic
		_, err := dataDB.Exec("INSERT INTO entries (id, title, body, formatted_body, path, format, date, created_at, modified_at, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
			entry.id, entry.title, entry.body, "", "path"+string(rune(entry.id)), "markdown", "2026-01-07", 0, 0, "public")
		if err != nil {
			t.Fatalf("failed to insert entry into data DB: %v", err)
		}

		err = calc.UpdateTFIDF(ctx, entry.id, entry.title, entry.body)
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
	rows, err := tfidfDB.Query("SELECT related_entry_id, score FROM related_entries WHERE entry_id = ? ORDER BY score DESC", 2)
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
	}
}

func TestCalculateSimilarEntriesMultiple(t *testing.T) {
	dataDB, tfidfDB, calc, sim := setupTestDBForSimilarity(t)
	defer dataDB.Close()
	defer tfidfDB.Close()

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
		_, err := dataDB.Exec("INSERT INTO entries (id, title, body, formatted_body, path, format, date, created_at, modified_at, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
			entry.id, entry.title, entry.body, "", "path"+string(rune(entry.id)), "markdown", "2026-01-07", 0, 0, "public")
		if err != nil {
			t.Fatalf("failed to insert entry into data DB: %v", err)
		}

		err = calc.UpdateTFIDF(ctx, entry.id, entry.title, entry.body)
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
		err := tfidfDB.QueryRow("SELECT COUNT(*) FROM related_entries WHERE entry_id = ?", entryID).Scan(&count)
		if err != nil {
			t.Fatalf("failed to count related entries for entry %d: %v", entryID, err)
		}
		t.Logf("Entry %d has %d related entries", entryID, count)
	}
}

func TestCalculateSimilarEntriesNoSimilar(t *testing.T) {
	dataDB, tfidfDB, calc, sim := setupTestDBForSimilarity(t)
	defer dataDB.Close()
	defer tfidfDB.Close()

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
		_, err := dataDB.Exec("INSERT INTO entries (id, title, body, formatted_body, path, format, date, created_at, modified_at, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
			entry.id, entry.title, entry.body, "", "path"+string(rune(entry.id)), "markdown", "2026-01-07", 0, 0, "public")
		if err != nil {
			t.Fatalf("failed to insert entry into data DB: %v", err)
		}

		err = calc.UpdateTFIDF(ctx, entry.id, entry.title, entry.body)
		if err != nil {
			t.Fatalf("failed to update tfidf for entry %d: %v", entry.id, err)
		}
	}

	err := calc.RecalculateTFIDFValues(ctx, []int64{})
	if err != nil {
		t.Fatalf("failed to recalculate tfidf values: %v", err)
	}

	// Calculate similar entries for entry 2
	sim.MinValidTerms = 20
	err = sim.CalculateSimilarEntries(ctx, []int64{2})
	if err != nil {
		t.Fatalf("failed to calculate similar entries: %v", err)
	}

	// Verify that related_entries table was updated
	var count int64
	err = tfidfDB.QueryRow("SELECT COUNT(*) FROM related_entries WHERE entry_id = ?", 2).Scan(&count)
	if err != nil {
		t.Fatalf("failed to count related entries: %v", err)
	}

	t.Logf("Entry 2 has %d related entries", count)
}
