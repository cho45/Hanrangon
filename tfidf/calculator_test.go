package tfidf

import (
	"context"
	"database/sql"
	"os"
	"testing"

	"github.com/cho45/hanrangon/model"
	_ "github.com/mattn/go-sqlite3"
)

// setupTestDB creates an in-memory database for testing
func setupTestDB(t *testing.T) (*sql.DB, *model.Queries) {
	db, err := sql.Open("sqlite3", ":memory:")
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

	return db, model.New(db)
}

func TestExtractTerms(t *testing.T) {
	db, queries := setupTestDB(t)
	defer db.Close()

	calc, err := NewCalculator(db, queries)
	if err != nil {
		t.Fatalf("failed to create calculator: %v", err)
	}

	tests := []struct {
		name  string
		title string
		body  string
		want  []string // Expected terms (at least these should be present)
	}{
		{
			name:  "Japanese text",
			title: "テストタイトル",
			body:  "これはテスト本文です。日本語の形態素解析をテストします。",
			want:  []string{"テスト", "タイトル", "本文", "日本語", "形態素", "解析"},
		},
		{
			name:  "English text",
			title: "Test Title",
			body:  "This is a test body with some English words.",
			want:  []string{"test", "title", "body", "english", "words"},
		},
		{
			name:  "Mixed text",
			title: "混合テスト Mixed Test",
			body:  "日本語とEnglishが混在するテキストです。",
			want:  []string{"混合", "テスト", "mixed", "test", "日本語", "english"},
		},
		{
			name:  "HTML tags",
			title: "HTMLテスト",
			body:  "<p>HTMLタグを<strong>除去</strong>します</p>",
			want:  []string{"html", "テスト", "タグ", "除去"},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			terms := calc.ExtractTerms(tt.title, tt.body)

			// Check that expected terms are present
			for _, wantTerm := range tt.want {
				if _, ok := terms[wantTerm]; !ok {
					t.Errorf("expected term %q not found in extracted terms: %v", wantTerm, terms)
				}
			}

			// Check that single character terms are excluded
			for term := range terms {
				if len(term) == 1 {
					t.Errorf("single character term %q should be excluded", term)
				}
			}
		})
	}
}

func TestUpdateTFIDF(t *testing.T) {
	db, queries := setupTestDB(t)
	defer db.Close()

	calc, err := NewCalculator(db, queries)
	if err != nil {
		t.Fatalf("failed to create calculator: %v", err)
	}

	ctx := context.Background()
	entryID := int64(1)
	title := "テストタイトル"
	body := "これはテスト本文です。テストという単語が複数回出現します。"

	// Update TF-IDF for entry
	err = calc.UpdateTFIDF(ctx, entryID, title, body)
	if err != nil {
		t.Fatalf("failed to update tfidf: %v", err)
	}

	// Verify that terms are inserted
	rows, err := db.Query("SELECT t.term, p.term_count FROM postings p JOIN terms t ON p.term_id = t.id WHERE p.entry_id = ? ORDER BY p.term_count DESC", entryID)
	if err != nil {
		t.Fatalf("failed to query postings: %v", err)
	}
	defer rows.Close()

	foundTerms := make(map[string]int)
	for rows.Next() {
		var term string
		var count int
		if err := rows.Scan(&term, &count); err != nil {
			t.Fatalf("failed to scan row: %v", err)
		}
		foundTerms[term] = count
	}

	expectedTerms := []string{"テスト", "本文", "タイトル"}
	for _, term := range expectedTerms {
		if _, ok := foundTerms[term]; !ok {
			t.Errorf("expected term %s not found in postings", term)
		}
	}

	// Update existing entry
	err = calc.UpdateTFIDF(ctx, entryID, "新しいタイトル", "新しい本文")
	if err != nil {
		t.Fatalf("failed to update tfidf second time: %v", err)
	}

	// Verify that old terms are deleted and new ones are inserted
	var count int
	err = db.QueryRow("SELECT COUNT(*) FROM postings p JOIN terms t ON p.term_id = t.id WHERE p.entry_id = ? AND t.term = ?", entryID, "テスト").Scan(&count)
	if err != nil {
		t.Fatalf("failed to query postings count: %v", err)
	}
	if count != 0 {
		t.Errorf("expected term 'テスト' to be deleted, but found %d occurrences", count)
	}
}

func TestRecalculateTFIDFValues(t *testing.T) {
	db, queries := setupTestDB(t)
	defer db.Close()

	calc, _ := NewCalculator(db, queries)
	ctx := context.Background()

	// Insert some test entries
	entries := []struct {
		id    int64
		title string
		body  string
	}{
		{1, "Go言語の学習", "Go言語はシンプルで強力な言語です。並行処理が得意です。"},
		{2, "Pythonでのデータ分析", "Pythonはデータ分析や機械学習に広く使われています。"},
		{3, "プログラミング言語比較", "GoとPythonはどちらも人気のあるプログラミング言語です。"},
	}

	for _, entry := range entries {
		err := calc.UpdateTFIDF(ctx, entry.id, entry.title, entry.body)
		if err != nil {
			t.Fatalf("failed to update tfidf for entry %d: %v", entry.id, err)
		}
	}

	// Recalculate values
	err := calc.RecalculateTFIDFValues(ctx, []int64{})
	if err != nil {
		t.Fatalf("failed to recalculate tfidf values: %v", err)
	}

	// Verify that tfidf and tfidf_n values are set
	rows, err := db.Query("SELECT p.entry_id, t.term, p.tfidf, p.tfidf_n FROM postings p JOIN terms t ON p.term_id = t.id WHERE p.tfidf > 0 LIMIT 5")

	if err != nil {
		t.Fatalf("failed to query postings: %v", err)
	}
	defer rows.Close()

	count := 0
	for rows.Next() {
		count++
		var entryID int64
		var term string
		var tfidf, tfidfN float64
		if err := rows.Scan(&entryID, &term, &tfidf, &tfidfN); err != nil {
			t.Fatalf("failed to scan row: %v", err)
		}

		if tfidf <= 0 {
			t.Errorf("tfidf should be > 0, got %f for entry %d term %s", tfidf, entryID, term)
		}
		if tfidfN <= 0 {
			t.Errorf("tfidf_n should be > 0, got %f for entry %d term %s", tfidfN, entryID, term)
		}
		if tfidfN > 1 {
			t.Errorf("tfidf_n should be <= 1 (normalized), got %f for entry %d term %s", tfidfN, entryID, term)
		}
	}

	if count == 0 {
		t.Error("expected some tfidf results, got none")
	}
}

func TestMain(m *testing.M) {
	// Suppress log output during tests
	// (comment out for debugging)
	// devNull, _ := os.Open(os.DevNull)
	// os.Stderr = devNull
	// defer devNull.Close()

	code := m.Run()
	os.Exit(code)
}
