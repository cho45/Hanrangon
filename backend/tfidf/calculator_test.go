package tfidf

import (
	"context"
	"database/sql"
	"os"
	"testing"

	"github.com/cho45/hanrangon/internal/testutil"
	_ "github.com/mattn/go-sqlite3"
)

func TestExtractTerms(t *testing.T) {
	dbs := testutil.SetupAllDBs(t)
	defer dbs.Close()
	dataDB, dataQueries, tfidfDB, tfidfQueries := dbs.MainDB.DB, dbs.MainDB.Q, dbs.TFIDFDB.DB, dbs.TFIDFDB.Q

	calc, err := NewCalculator(tfidfDB, tfidfQueries, dataDB, dataQueries)
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
			want:  []string{"テス", "スト", "日本", "本語", "解析"},
		},
		{
			name:  "English text",
			title: "Test Title",
			body:  "This is a test body with some English words.",
			want:  []string{"test", "title", "body", "english", "words", "te", "es", "st"},
		},
		{
			name:  "Mixed text",
			title: "混合テスト Mixed Test",
			body:  "日本語とEnglishが混在するテキストです。",
			want:  []string{"混合", "テス", "スト", "mixed", "test", "日本", "本語", "english"},
		},
		{
			name:  "HTML tags",
			title: "HTMLテスト",
			body:  "<p>HTMLタグを<strong>除去</strong>します</p>",
			want:  []string{"html", "テス", "スト", "除去"},
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

			// Check that single character terms are excluded (except for bigrams)
			for term := range terms {
				if len(term) == 1 {
					t.Errorf("single character term %q should be excluded", term)
				}
			}
		})
	}
}

func TestUpdateTFIDF(t *testing.T) {
	dbs := testutil.SetupAllDBs(t)
	defer dbs.Close()
	dataDB, dataQueries, tfidfDB, tfidfQueries := dbs.MainDB.DB, dbs.MainDB.Q, dbs.TFIDFDB.DB, dbs.TFIDFDB.Q

	calc, err := NewCalculator(tfidfDB, tfidfQueries, dataDB, dataQueries)
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

	// Verify that terms are inserted into terms table but NOT into postings (because DF=1)
	var count int
	err = tfidfDB.QueryRow("SELECT COUNT(*) FROM postings WHERE entry_id = ?", entryID).Scan(&count)
	if err != nil {
		t.Fatalf("failed to query postings: %v", err)
	}
	if count != 0 {
		t.Errorf("expected 0 postings for single entry (DF=1 pruning), but got %d", count)
	}

	// Insert another entry with same terms to trigger promotion
	entryID2 := int64(2)
	// We need to insert the entry into data DB because UpdateTFIDF will fetch it
	_, err = dataDB.Exec("INSERT INTO entries (id, title, body, formatted_body, path, format, date, created_at, modified_at, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
		entryID, title, body, "", "path1", "markdown", "2026-01-07", 0, 0, "public")
	if err != nil {
		t.Fatalf("failed to insert test entry 1: %v", err)
	}

	err = calc.UpdateTFIDF(ctx, entryID2, "二番目のタイトル", "テスト本文がここにもあります。")
	if err != nil {
		t.Fatalf("failed to update tfidf for entry 2: %v", err)
	}

	// Now both entries should have postings for common terms like "テス", "スト", "本文"
	err = tfidfDB.QueryRow("SELECT COUNT(*) FROM postings WHERE entry_id = ?", entryID).Scan(&count)
	if err != nil {
		t.Fatalf("failed to query postings for entry 1: %v", err)
	}
	if count == 0 {
		t.Errorf("expected postings for entry 1 after promotion, but got 0")
	}

	err = tfidfDB.QueryRow("SELECT COUNT(*) FROM postings WHERE entry_id = ?", entryID2).Scan(&count)
	if err != nil {
		t.Fatalf("failed to query postings for entry 2: %v", err)
	}
	if count == 0 {
		t.Errorf("expected postings for entry 2, but got 0")
	}
}

func TestRecalculateTFIDFValues(t *testing.T) {
	dbs := testutil.SetupAllDBs(t)
	defer dbs.Close()
	dataDB, dataQueries, tfidfDB, tfidfQueries := dbs.MainDB.DB, dbs.MainDB.Q, dbs.TFIDFDB.DB, dbs.TFIDFDB.Q

	calc, _ := NewCalculator(tfidfDB, tfidfQueries, dataDB, dataQueries)
	calc.DFMaxThresholdRate = 0.8
	ctx := context.Background()

	// Insert some test entries (need to be in both DBs for promotion logic to work if DF=2)
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
		// Insert into data DB
		_, err := dataDB.Exec("INSERT INTO entries (id, title, body, formatted_body, path, format, date, created_at, modified_at, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
			entry.id, entry.title, entry.body, "", "path"+string(rune(entry.id)), "markdown", "2026-01-07", 0, 0, "public")
		if err != nil {
			t.Fatalf("failed to insert entry %d: %v", entry.id, err)
		}

		err = calc.UpdateTFIDF(ctx, entry.id, entry.title, entry.body)
		if err != nil {
			t.Fatalf("failed to update tfidf for entry %d: %v", entry.id, err)
		}
	}

	// Recalculate values
	err := calc.RecalculateTFIDFValues(ctx, []int64{})
	if err != nil {
		t.Fatalf("failed to recalculate tfidf values: %v", err)
	}

	// Verify that tfidf and tfidf_n values are set for entries with common terms
	rows, err := tfidfDB.Query("SELECT p.entry_id, t.term, p.tfidf, p.tfidf_n FROM postings p JOIN terms t ON p.term_id = t.id WHERE p.tfidf > 0 LIMIT 5")
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
	}

	if count == 0 {
		t.Error("expected some tfidf results, got none")
	}
}

func TestTFIDFThresholding(t *testing.T) {
	dbs := testutil.SetupAllDBs(t)
	defer dbs.Close()
	dataDB, dataQueries, tfidfDB, tfidfQueries := dbs.MainDB.DB, dbs.MainDB.Q, dbs.TFIDFDB.DB, dbs.TFIDFDB.Q

	calc, _ := NewCalculator(tfidfDB, tfidfQueries, dataDB, dataQueries)
	calc.DFMaxThresholdRate = 0.8
	ctx := context.Background()

	// common body that appears in all entries (> 80%)
	common := "これは共通の文章です。"
	// semi-common body that appears in some entries (2/5 = 40%, should stay)
	semi := "特定の話題"
	entries := []struct {
		id    int64
		title string
		body  string
	}{
		{1, "記事1", common + semi + "リンゴ"},
		{2, "記事2", common + semi + "リンゴ"},
		{3, "記事3", common + "ラッパ"},
		{4, "記事4", common + "パンツ"},
		{5, "記事5", common + "ツミキ"},
	}

	for _, entry := range entries {
		_, err := dataDB.Exec("INSERT INTO entries (id, title, body, formatted_body, path, format, date, created_at, modified_at, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
			entry.id, entry.title, entry.body, "", "path"+string(rune(entry.id)), "markdown", "2026-01-07", 0, 0, "public")
		if err != nil {
			t.Fatalf("failed to insert entry into data DB: %v", err)
		}
		if err := calc.UpdateTFIDF(ctx, entry.id, entry.title, entry.body); err != nil {
			t.Fatalf("failed to update tfidf: %v", err)
		}
	}

	if err := calc.RecalculateTFIDFValues(ctx, []int64{}); err != nil {
		t.Fatalf("failed to recalculate tfidf: %v", err)
	}

	// Check total postings
	var totalP int
	_ = tfidfDB.QueryRow("SELECT COUNT(*) FROM postings").Scan(&totalP)
	t.Logf("Total postings: %d", totalP)

	// Check that common terms (like "共通") have tfidf_n = 0 because they are in 100% of entries (> 80%)
	var tfidfN float64
	err := tfidfDB.QueryRow("SELECT p.tfidf_n FROM postings p JOIN terms t ON p.term_id = t.id WHERE t.term = ? LIMIT 1", "共通").Scan(&tfidfN)
	if err != nil {
		t.Fatalf("failed to query common term: %v", err)
	}
	if tfidfN != 0 {
		t.Errorf("expected tfidf_n = 0 for 100%% frequent term '共通', got %f", tfidfN)
	}

	// Check that unique terms have tfidf_n > 0
	// "リンゴ" is split into "リン" and "ンゴ"
	err = tfidfDB.QueryRow("SELECT p.tfidf_n FROM postings p JOIN terms t ON p.term_id = t.id WHERE t.term = ? LIMIT 1", "リン").Scan(&tfidfN)
	if err != nil {
		t.Fatalf("failed to query unique term 'リン': %v", err)
	}
	if tfidfN <= 0 {
		t.Errorf("expected tfidf_n > 0 for unique term 'リン', got %f", tfidfN)
	}
}

func TestExtractTermsEdgeCases(t *testing.T) {
	dbs := testutil.SetupAllDBs(t)
	defer dbs.Close()
	dataDB, dataQueries, tfidfDB, tfidfQueries := dbs.MainDB.DB, dbs.MainDB.Q, dbs.TFIDFDB.DB, dbs.TFIDFDB.Q

	calc, _ := NewCalculator(tfidfDB, tfidfQueries, dataDB, dataQueries)

	tests := []struct {
		name  string
		title string
		body  string
		want  []string
		avoid []string
	}{
		{
			name:  "Empty text",
			title: "",
			body:  "",
			want:  []string{},
		},
		{
			name:  "Too short text",
			title: "あ",
			body:  "い",
			want:  []string{}, // No bigrams, no long alphanumeric
		},
		{
			name:  "HTML tag boundary",
			title: "あ",
			body:  "<b>い</b>う",
			want:  []string{"いう"}, // HTML tags are removed first, so "いう" should be found
		},
		{
			name:  "Symbols and spaces",
			title: "あ い",
			body:  "う!!!え",
			want:  []string{}, // Spaces and symbols break bigrams
			avoid: []string{"あ ", " い", "う!", "!え"},
		},
		{
			name:  "Alphanumeric hybrid",
			title: "Go",
			body:  "Go",
			want:  []string{"go"}, // Alphanumeric word "go" is kept
			avoid: []string{},     // "go" is also a valid bigram, so it shouldn't be avoided
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			terms := calc.ExtractTerms(tt.title, tt.body)
			for _, w := range tt.want {
				if _, ok := terms[w]; !ok {
					t.Errorf("expected term %q not found", w)
				}
			}
			for _, a := range tt.avoid {
				if _, ok := terms[a]; ok {
					t.Errorf("avoided term %q found", a)
				}
			}
		})
	}
}

func TestPromotionEdgeCases(t *testing.T) {
	dbs := testutil.SetupAllDBs(t)
	defer dbs.Close()
	dataDB, dataQueries, tfidfDB, tfidfQueries := dbs.MainDB.DB, dbs.MainDB.Q, dbs.TFIDFDB.DB, dbs.TFIDFDB.Q

	calc, _ := NewCalculator(tfidfDB, tfidfQueries, dataDB, dataQueries)
	ctx := context.Background()

	// 1. Reset promotion: Entry 1 has "東京" -> Update to remove it -> Entry 2 adds it
	_, _ = dataDB.Exec("INSERT INTO entries (id, title, body, formatted_body, path, format, date, created_at, modified_at, status) VALUES (1, 'T1', '東京', '', 'p1', 'm', '2026', 0, 0, 'public')")
	_ = calc.UpdateTFIDF(ctx, 1, "T1", "東京") // DF=1, no posting
	_ = calc.UpdateTFIDF(ctx, 1, "T1", "大阪") // DF=0 for "東京"

	// Entry 2 adds "東京". Since DF was 0, it should become DF=1 and Entry 2 becomes the new first_entry_id.
	_ = calc.UpdateTFIDF(ctx, 2, "T2", "東京")

	var finalDF int
	var firstID sql.NullInt64
	_ = tfidfDB.QueryRow("SELECT df_count, first_entry_id FROM terms WHERE term = '東京'").Scan(&finalDF, &firstID)

	if firstID.Int64 != 2 {
		t.Errorf("expected first_entry_id to be 2, got %v", firstID.Int64)
	}

	// 2. Promotion with multiple terms
	_, _ = dataDB.Exec("INSERT INTO entries (id, title, body, formatted_body, path, format, date, created_at, modified_at, status) VALUES (3, 'T3', '京都 奈良', '', 'p3', 'm', '2026', 0, 0, 'public')")
	_ = calc.UpdateTFIDF(ctx, 3, "T3", "京都 奈良") // DF=1 for both

	_ = calc.UpdateTFIDF(ctx, 4, "T4", "京都 奈良") // Promotion for both

	var count int
	_ = tfidfDB.QueryRow("SELECT COUNT(*) FROM postings WHERE entry_id = 3").Scan(&count)
	if count < 2 {
		t.Errorf("expected at least 2 postings for promoted entry 3, got %d", count)
	}
}

func TestUpdateDecrementsDF(t *testing.T) {
	dbs := testutil.SetupAllDBs(t)
	defer dbs.Close()
	dataDB, dataQueries, tfidfDB, tfidfQueries := dbs.MainDB.DB, dbs.MainDB.Q, dbs.TFIDFDB.DB, dbs.TFIDFDB.Q

	calc, _ := NewCalculator(tfidfDB, tfidfQueries, dataDB, dataQueries)
	ctx := context.Background()

	// 1. Entry 1 and 2 share "東京"
	_, _ = dataDB.Exec("INSERT INTO entries (id, title, body, formatted_body, path, format, date, created_at, modified_at, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
		1, "A", "東京へ行く", "", "p1", "m", "2026", 0, 0, "public")
	_ = calc.UpdateTFIDF(ctx, 1, "A", "東京へ行く")
	_ = calc.UpdateTFIDF(ctx, 2, "B", "東京に住む")

	// DF should be 2 for "東京"
	var df int
	_ = tfidfDB.QueryRow("SELECT df_count FROM terms WHERE term = '東京'").Scan(&df)
	if df != 2 {
		t.Errorf("expected DF=2 for '東京', got %d", df)
	}

	// 2. Update Entry 1 to remove "東京"
	_ = calc.UpdateTFIDF(ctx, 1, "A", "大阪へ行く")

	// DF should be 1 for "東京"
	_ = tfidfDB.QueryRow("SELECT df_count FROM terms WHERE term = '東京'").Scan(&df)
	if df != 1 {
		t.Errorf("expected DF=1 for '東京' after update, got %d", df)
	}

	// 3. Promotion back to 2
	_ = calc.UpdateTFIDF(ctx, 3, "C", "東京タワー")
	_ = tfidfDB.QueryRow("SELECT df_count FROM terms WHERE term = '東京'").Scan(&df)
	if df != 2 {
		t.Errorf("expected DF=2 for '東京' after third entry, got %d", df)
	}
}

func TestPromotionAfterDemotion(t *testing.T) {
	dbs := testutil.SetupAllDBs(t)
	defer dbs.Close()
	dataDB, dataQueries, tfidfDB, tfidfQueries := dbs.MainDB.DB, dbs.MainDB.Q, dbs.TFIDFDB.DB, dbs.TFIDFDB.Q

	calc, _ := NewCalculator(tfidfDB, tfidfQueries, dataDB, dataQueries)
	ctx := context.Background()

	// 1. Entry 1 adds "東京" (DF=1, no posting)
	_, _ = dataDB.Exec("INSERT INTO entries (id, title, body, formatted_body, path, format, date, created_at, modified_at, status) VALUES (1, 'T1', '東京', '', 'p1', 'm', '2026', 0, 0, 'public')")
	_ = calc.UpdateTFIDF(ctx, 1, "T1", "東京")

	// 2. Entry 2 adds "東京" (DF=2, both get postings)
	_, _ = dataDB.Exec("INSERT INTO entries (id, title, body, formatted_body, path, format, date, created_at, modified_at, status) VALUES (2, 'T2', '東京', '', 'p2', 'm', '2026', 0, 0, 'public')")
	_ = calc.UpdateTFIDF(ctx, 2, "T2", "東京")

	// 3. Entry 2 removes "東京" (DF=1, Entry 1's posting remains physically in DB)
	_ = calc.UpdateTFIDF(ctx, 2, "T2", "大阪")

	// 4. Entry 3 adds "東京" (DF=2, Promotion triggers for Entry 1)
	// If InsertPosting is not using UPSERT, this will FAIL due to UNIQUE constraint.
	_, _ = dataDB.Exec("INSERT INTO entries (id, title, body, formatted_body, path, format, date, created_at, modified_at, status) VALUES (3, 'T3', '東京', '', 'p3', 'm', '2026', 0, 0, 'public')")
	err := calc.UpdateTFIDF(ctx, 3, "T3", "東京")
	if err != nil {
		t.Fatalf("UpdateTFIDF failed during re-promotion: %v", err)
	}

	// Verify Entry 1 still has posting
	var count int
	_ = tfidfDB.QueryRow("SELECT COUNT(*) FROM postings WHERE entry_id = 1").Scan(&count)
	if count == 0 {
		t.Errorf("expected posting for Entry 1 to exist")
	}
}

func TestMain(m *testing.M) {
	code := m.Run()
	os.Exit(code)
}
