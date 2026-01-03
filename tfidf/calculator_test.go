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

	// Verify that terms were inserted
	rows, err := db.Query("SELECT term, term_count FROM tfidf WHERE entry_id = ? ORDER BY term_count DESC", entryID)
	if err != nil {
		t.Fatalf("failed to query tfidf: %v", err)
	}
	defer rows.Close()

	termCounts := make(map[string]int64)
	for rows.Next() {
		var term string
		var count int64
		if err := rows.Scan(&term, &count); err != nil {
			t.Fatalf("failed to scan row: %v", err)
		}
		termCounts[term] = count
	}

	// Check that "テスト" appears multiple times
	if count, ok := termCounts["テスト"]; !ok {
		t.Error("expected term 'テスト' not found")
	} else if count < 2 {
		t.Errorf("expected 'テスト' to appear at least 2 times, got %d", count)
	}

	// Update again (should delete old terms and insert new ones)
	err = calc.UpdateTFIDF(ctx, entryID, "新しいタイトル", "新しい本文")
	if err != nil {
		t.Fatalf("failed to update tfidf second time: %v", err)
	}

	// Verify that old terms were deleted
	var count int64
	err = db.QueryRow("SELECT COUNT(*) FROM tfidf WHERE entry_id = ? AND term = ?", entryID, "テスト").Scan(&count)
	if err != nil {
		t.Fatalf("failed to query: %v", err)
	}
	if count > 0 {
		t.Error("old term 'テスト' should have been deleted")
	}
}

func TestRecalculateTFIDFValues(t *testing.T) {
	db, queries := setupTestDB(t)
	defer db.Close()

	calc, err := NewCalculator(db, queries)
	if err != nil {
		t.Fatalf("failed to create calculator: %v", err)
	}

	ctx := context.Background()

	// Create multiple entries with terms
	entries := []struct {
		id    int64
		title string
		body  string
	}{
		{1, "文書1", "これは最初の文書です"},
		{2, "文書2", "これは2番目の文書です"},
		{3, "文書3", "これは3番目の文書です"},
	}

	for _, entry := range entries {
		err := calc.UpdateTFIDF(ctx, entry.id, entry.title, entry.body)
		if err != nil {
			t.Fatalf("failed to update tfidf for entry %d: %v", entry.id, err)
		}
	}

	// Recalculate TF-IDF values
	err = calc.RecalculateTFIDFValues(ctx, []int64{})
	if err != nil {
		t.Fatalf("failed to recalculate tfidf values: %v", err)
	}

	// Verify that tfidf and tfidf_n values are set
	rows, err := db.Query("SELECT entry_id, term, tfidf, tfidf_n FROM tfidf WHERE tfidf > 0 LIMIT 5")
	if err != nil {
		t.Fatalf("failed to query tfidf: %v", err)
	}
	defer rows.Close()

	hasResults := false
	for rows.Next() {
		hasResults = true
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

	if !hasResults {
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
