package tfidf

/*
Hanrangon TF-IDF エンジン詳細概要

記事間の類似度計算用 TF-IDF インデックスを管理。
SQLite 環境でのストレージ効率と計算速度のバランスを考慮し、以下の設計を採用。

1. 基本設計コンセプト
   - 文字 2-gram (Bigram) 方式:
     日本語の辞書依存を排除するため、文字単位の 2 文字連鎖を最小抽出単位として採用。
     専門用語、新語、表記揺れに対応可能なメンテナンスフリーな解析手法。
     英数字については単語単位抽出を併用するハイブリッド方式。
   - DF（出現頻度）に基づく 2 段階フィルタリング:
     インデックスサイズ抑制と計算ノイズ排除のため、物理・論理の 2 レベルで足切りを実施。
   - 整合性管理:
     記事更新時、インデックス未生成（DF=1）の語を含めて正確に DF を減算。
     最新の統計に基づいた再昇格・再計算が可能なデータ整合性を維持。

2. データ構造とカラム利用
   - terms テーブル: 語彙の統計情報を管理
     - term: 抽出されたターム。UNIQUE 制約。
     - df_count: そのタームが出現する総エントリ数。RecalculateTFIDFValues で IDF 計算の基礎として利用。
     - first_entry_id: そのタームが DF=1（最初に出現）だった際のエントリ ID。Promotion 処理での過去記事特定に利用。
   - postings テーブル: エントリごとのターム出現頻度と重みを管理
     - entry_id, term_id: インデックスのキー。
     - term_count: エントリ内での出現回数 (TF)。
     - tfidf: 計算途中の重み。
     - tfidf_n: L2 ノルムで正規化された最終的な重み。類似度計算（similarity パッケージ）で直接利用。

3. 処理フローと関数
   - ステップ 1: ターム抽出 (ExtractTerms)
     - 文字 2-gram 方式によるターム切り出し。記号による境界識別と英数字単語の保持を実施。
   - ステップ 2: インクリメンタル更新 (UpdateTFIDF)
     - 記事保存時に同期または非同期で実行。
     - 旧内容のタームを特定し df_count を減算（DF=1 語を含む）。
     - 新内容のタームで UpsertTerm を実行し df_count を加算。
     - df_count = 1 の場合は postings への挿入をスキップ（物理足切り）。
     - df_count = 2 への遷移時、first_entry_id のエントリを再解析し postings へ追加（Promotion）。
   - ステップ 3: 重み再計算 (RecalculateTFIDFValues)
     - ジョブキュー経由で一括実行。全件の統計に基づき tfidf, tfidf_n を更新。
     - c.DFMaxThresholdRate（デフォルト 10%）を超える高頻度語の重みを 0 に設定（論理足切り）。
     - 完了後に ANALYZE を実行し、SQLite クエリプランナの統計情報を更新。
   - ステップ 4: 類似度計算 (similarity.CalculateSimilarEntries)
     - postings.tfidf_n の内積（コサイン類似度）を計算。
     - MinValidTerms 未満の有効語数しか持たないエントリは計算対象から除外。
*/

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"regexp"
	"strings"
	"unicode"
	"unicode/utf8"

	"github.com/cho45/hanrangon/model"
)

// UpdateEntry は TF-IDF 更新用のエントリデータ
type UpdateEntry struct {
	ID    int64
	Title string
	Body  string
}

// Calculator handles TF-IDF calculations
type Calculator struct {
	tfidfDB            *sql.DB
	tfidfQueries       *model.Queries
	dataDB             *sql.DB
	dataQueries        *model.Queries
	DFMaxThresholdRate float64

	alphanumericPattern *regexp.Regexp
	htmlTagPattern      *regexp.Regexp
}

// NewCalculator creates a new Calculator
func NewCalculator(tfidfDB *sql.DB, tfidfQueries *model.Queries, dataDB *sql.DB, dataQueries *model.Queries) (*Calculator, error) {
	return &Calculator{
		tfidfDB:             tfidfDB,
		tfidfQueries:        tfidfQueries,
		dataDB:              dataDB,
		dataQueries:         dataQueries,
		DFMaxThresholdRate:  0.1, // Default to 10%
		alphanumericPattern: regexp.MustCompile(`[a-z0-9]{2,}`),
		htmlTagPattern:      regexp.MustCompile(`<[^>]*>`),
	}, nil
}

// ExtractTerms はタイトルと本文からタームを抽出
// HTMLタグの除去、CJKテキストに対する文字 2-gram の生成、英数字単語の保持を行う
func (c *Calculator) ExtractTerms(title, body string) map[string]int {
	terms := make(map[string]int)

	// Pre-clean the text: remove HTML and lowercase
	// Avoid large intermediate string/rune-slice allocations
	var buf strings.Builder
	buf.Grow(len(title) + len(body) + 1)

	inTag := false
	process := func(s string) {
		for _, r := range s {
			if r == '<' {
				inTag = true
				continue
			}
			if inTag {
				if r == '>' {
					inTag = false
				}
				continue
			}
			buf.WriteRune(unicode.ToLower(r))
		}
	}

	process(title)
	buf.WriteByte(' ')
	process(body)

	cleanStr := buf.String()

	// 1. 英数字単語（英単語、数字）をそのまま抽出
	if c.alphanumericPattern != nil {
		matches := c.alphanumericPattern.FindAllString(cleanStr, -1)
		for _, match := range matches {
			terms[match]++
		}
	}

	// 2. 全テキストに対して文字 2-gram を生成
	var r1, r2 rune
	var b [utf8.UTFMax * 2]byte
	for _, r := range cleanStr {
		if c.isSkipRune(r) {
			r1, r2 = 0, 0
			continue
		}

		r1, r2 = r2, r
		if r1 != 0 && r2 != 0 {
			n := utf8.EncodeRune(b[:], r1)
			n += utf8.EncodeRune(b[n:], r2)
			terms[string(b[:n])]++
		}
	}

	return terms
}

// isSkipRune はルーンが 2-gram の一部としてスキップされるべき場合に true を返す
func (c *Calculator) isSkipRune(r rune) bool {
	if r <= 127 {
		// ASCII 制御文字、空白、記号をスキップ
		return r <= 32 || (r >= 33 && r <= 47) || (r >= 58 && r <= 64) || (r >= 91 && r <= 96) || (r >= 123 && r <= 126)
	}

	// 全角空白や主要な日本語記号をスキップ
	switch r {
	case '\u3000', '、', '。', '！', '？', '（', '）', '［', '］', '｛', '｝', '「', '」', '『', '』', '：', '；', '・':
		return true
	}

	return false
}

// UpdateTFIDF は指定された単一エントリの TF-IDF データを更新
func (c *Calculator) UpdateTFIDF(ctx context.Context, entryID int64, title, body string) error {
	return c.UpdateTFIDFs(ctx, []UpdateEntry{{ID: entryID, Title: title, Body: body}})
}

// UpdateTFIDFs は複数のエントリの TF-IDF データを一括で更新
func (c *Calculator) UpdateTFIDFs(ctx context.Context, entries []UpdateEntry) error {
	tx, err := c.tfidfDB.BeginTx(ctx, nil)
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback()

	// 1. 旧タームの DF カウントを一括減算
	entryIDs := make([]interface{}, len(entries))
	placeholders := make([]string, len(entries))
	for i, e := range entries {
		entryIDs[i] = e.ID
		placeholders[i] = "?"
	}
	inClause := strings.Join(placeholders, ",")

	// 減算対象の全ターム ID を収集
	// (postings にあるもの + first_entry_id が対象記事であるもの)
	var uniqueTermIDs []interface{}
	rows, err := tx.QueryContext(ctx, fmt.Sprintf(`
		SELECT term_id FROM postings WHERE entry_id IN (%s)
		UNION
		SELECT id FROM terms WHERE first_entry_id IN (%s)
	`, inClause, inClause), append(entryIDs, entryIDs...)...)
	if err != nil {
		return fmt.Errorf("failed to query old term ids: %w", err)
	}
	for rows.Next() {
		var tid int64
		if err := rows.Scan(&tid); err != nil {
			rows.Close()
			return fmt.Errorf("failed to scan term id: %w", err)
		}
		uniqueTermIDs = append(uniqueTermIDs, tid)
	}
	rows.Close()

	// 一括減算
	if len(uniqueTermIDs) > 0 {
		for i := 0; i < len(uniqueTermIDs); i += 500 {
			end := i + 500
			if end > len(uniqueTermIDs) {
				end = len(uniqueTermIDs)
			}
			chunk := uniqueTermIDs[i:end]
			chunkPlaceholders := make([]string, len(chunk))
			for j := range chunk {
				chunkPlaceholders[j] = "?"
			}

			_, err = tx.ExecContext(ctx, fmt.Sprintf(`
				UPDATE terms SET df_count = df_count - 1 
				WHERE id IN (%s)
			`, strings.Join(chunkPlaceholders, ",")), chunk...)
			if err != nil {
				return fmt.Errorf("failed to bulk decrement df_count: %w", err)
			}
		}
	}

	// c. 古いポスティングを一括削除
	_, err = tx.ExecContext(ctx, fmt.Sprintf(`
		DELETE FROM postings WHERE entry_id IN (%s)
	`, inClause), entryIDs...)
	if err != nil {
		return fmt.Errorf("failed to bulk delete postings: %w", err)
	}

	// 2. ターム統計の更新と新規ポスティングの作成
	inBatch := make(map[int64]bool)
	for _, e := range entries {
		inBatch[e.ID] = true
	}

	allPromotedTerms := make(map[int64][]model.Term)

	for _, e := range entries {
		newTerms := c.ExtractTerms(e.Title, e.Body)
		if len(newTerms) == 0 {
			continue
		}
		// 1エントリ分を 1つのバルク SQL で UPSERT
		// (通常 1記事の単語数は数百件なので、SQLite の上限 32766 にはまず抵触しない)
		termList := make([]string, 0, len(newTerms))
		for term := range newTerms {
			termList = append(termList, term)
		}
		upsertSQL := `
			INSERT INTO terms (term, df_count, first_entry_id) VALUES %s
			ON CONFLICT(term) DO UPDATE SET
				df_count = terms.df_count + 1,
				first_entry_id = CASE WHEN terms.df_count <= 0 THEN excluded.first_entry_id ELSE terms.first_entry_id END
			RETURNING id, term, df_count, first_entry_id`
		valueStrings := make([]string, 0, len(termList))
		valueArgs := make([]interface{}, 0, len(termList)*2)
		for _, term := range termList {
			valueStrings = append(valueStrings, "(?, 1, ?)")
			valueArgs = append(valueArgs, term, e.ID)
		}
		rows, err := tx.QueryContext(ctx, fmt.Sprintf(upsertSQL, strings.Join(valueStrings, ",")), valueArgs...)
		if err != nil {
			return fmt.Errorf("failed to bulk upsert terms for entry %d: %w", e.ID, err)
		}
		var postingArgs []interface{}
		var postingPlaceholders []string
		for rows.Next() {
			var t model.Term
			if err := rows.Scan(&t.ID, &t.Term, &t.DfCount, &t.FirstEntryID); err != nil {
				rows.Close()
				return fmt.Errorf("failed to scan term after bulk upsert: %w", err)
			}
			// 昇格チェック
			if t.DfCount == 2 && t.FirstEntryID.Valid && !inBatch[t.FirstEntryID.Int64] {
				oldEID := t.FirstEntryID.Int64
				allPromotedTerms[oldEID] = append(allPromotedTerms[oldEID], t)
			}
			// ポスティング候補 (DF >= 2)
			if t.DfCount >= 2 {
				count := newTerms[t.Term]
				postingPlaceholders = append(postingPlaceholders, "(?, ?, ?, 0.0, 0.0)")
				postingArgs = append(postingArgs, e.ID, t.ID, count)
			}
		}
		rows.Close()
		// ポスティングの一括挿入
		if len(postingArgs) > 0 {
			insertPostingSQL := fmt.Sprintf(`
				INSERT INTO postings (entry_id, term_id, term_count, tfidf, tfidf_n)
				VALUES %s
				ON CONFLICT(entry_id, term_id) DO UPDATE SET term_count = excluded.term_count`,
				strings.Join(postingPlaceholders, ","))
			_, err = tx.ExecContext(ctx, insertPostingSQL, postingArgs...)
			if err != nil {
				return fmt.Errorf("failed to bulk insert postings for entry %d: %w", e.ID, err)
			}
		}
	}

	// 3. 過去のエントリに対して昇格したタームをインデックスに追加（ここもバルク化可能だが頻度が低いため現状維持）
	for oldEID, terms := range allPromotedTerms {
		entry, err := c.dataQueries.GetEntryById(ctx, oldEID)
		if err != nil {
			log.Printf("Warning: promoted entry %d not found: %v", oldEID, err)
			continue
		}

		oldEntryTerms := c.ExtractTerms(entry.Title, entry.Body)
		var postingArgs []interface{}
		var postingPlaceholders []string
		for _, t := range terms {
			if count, ok := oldEntryTerms[t.Term]; ok {
				postingPlaceholders = append(postingPlaceholders, "(?, ?, ?, 0.0, 0.0)")
				postingArgs = append(postingArgs, oldEID, t.ID, count)
			}
		}
		if len(postingArgs) > 0 {
			insertPostingSQL := fmt.Sprintf(`
				INSERT INTO postings (entry_id, term_id, term_count, tfidf, tfidf_n)
				VALUES %s
				ON CONFLICT(entry_id, term_id) DO UPDATE SET term_count = excluded.term_count`,
				strings.Join(postingPlaceholders, ","))
			_, err = tx.ExecContext(ctx, insertPostingSQL, postingArgs...)
			if err != nil {
				return fmt.Errorf("failed to insert promoted terms for entry %d: %w", oldEID, err)
			}
		}
	}

	if err := tx.Commit(); err != nil {
		return fmt.Errorf("failed to commit transaction: %w", err)
	}

	return nil
}

const (
	// DFMaxThresholdRate defines the upper limit for term frequency.
	// Terms appearing in more than 10% of entries are considered noise and ignored.
	DFMaxThresholdRate = 0.1
)

// RecalculateTFIDFValues は全エントリ（または指定されたエントリ）の TF-IDF 値を再計算
// Nogag の SimilarEntry.pm のロジックを移植
func (c *Calculator) RecalculateTFIDFValues(ctx context.Context, entryIDs []int64) error {
	// Data DB から総エントリ数を取得
	totalEntries, err := c.dataQueries.CountAllEntries(ctx)
	if err != nil {
		return fmt.Errorf("failed to count total entries: %w", err)
	}

	tx, err := c.tfidfDB.BeginTx(ctx, nil)
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback()

	// 計算用の一時テーブルを作成
	_, _ = tx.ExecContext(ctx, `DROP TABLE IF EXISTS temp.entry_total`)
	_, _ = tx.ExecContext(ctx, `DROP TABLE IF EXISTS temp.term_counts`)
	_, _ = tx.ExecContext(ctx, `DROP TABLE IF EXISTS temp.entry_term_counts`)
	_, _ = tx.ExecContext(ctx, `DROP TABLE IF EXISTS temp.tfidf_size`)

	// entry_total: 総エントリ数
	_, err = tx.ExecContext(ctx, `
		CREATE TEMPORARY TABLE entry_total AS
			SELECT CAST(? AS REAL) AS value
	`, totalEntries)
	if err != nil {
		return fmt.Errorf("failed to create entry_total table: %w", err)
	}

	// term_counts: 各タームが出現するエントリ数（terms テーブルの df_count を使用）
	_, err = tx.ExecContext(ctx, `
		CREATE TEMPORARY TABLE term_counts AS
			SELECT id AS term_id, CAST(df_count AS REAL) AS cnt FROM terms WHERE df_count >= 2
	`)
	if err != nil {
		return fmt.Errorf("failed to create term_counts table: %w", err)
	}

	_, err = tx.ExecContext(ctx, `CREATE INDEX temp.term_counts_term_id ON term_counts (term_id)`)
	if err != nil {
		return fmt.Errorf("failed to create index on term_counts: %w", err)
	}

	// entry_term_counts: 各エントリ内の全ターム出現数の対数
	_, err = tx.ExecContext(ctx, `
		CREATE TEMPORARY TABLE entry_term_counts AS
			SELECT entry_id, LN(CAST(SUM(term_count) AS REAL)) AS cnt FROM postings GROUP BY entry_id
	`)
	if err != nil {
		return fmt.Errorf("failed to create entry_term_counts table: %w", err)
	}

	_, err = tx.ExecContext(ctx, `CREATE INDEX temp.entry_term_counts_entry_id ON entry_term_counts (entry_id)`)
	if err != nil {
		return fmt.Errorf("failed to create index on entry_term_counts: %w", err)
	}

	// 特定のエントリのみ更新する場合の WHERE 句
	where := ""
	var binds []interface{}
	if len(entryIDs) > 0 {
		placeholders := make([]string, len(entryIDs))
		binds = make([]interface{}, len(entryIDs))
		for i, id := range entryIDs {
			placeholders[i] = "?"
			binds[i] = id
		}
		where = " WHERE entry_id IN (" + strings.Join(placeholders, ",") + ")"
	}

	// TF-IDF 値の計算
	// TF (Harman method): LOG(term_count + 1) / LOG(total_term_count_in_entry)
	// IDF (Sparck Jones method): 1 + LOG(total_entries / entries_with_term)
	// 足切り: 全エントリの c.DFMaxThresholdRate (10%) 以上に出現するタームは重みを 0 にする
	calcTFIDFSQL := fmt.Sprintf(`
		UPDATE postings SET tfidf = IFNULL(
			CASE 
				WHEN (SELECT cnt FROM term_counts WHERE term_counts.term_id = postings.term_id) > (SELECT value * %f FROM entry_total) THEN 0.0
				ELSE (
					(
						LN(CAST(term_count AS REAL) + 1)
						/
						(SELECT cnt FROM entry_term_counts WHERE entry_term_counts.entry_id = postings.entry_id)
					)
					*
					(1 + LN(
						(SELECT value FROM entry_total)
						/
						(SELECT cnt FROM term_counts WHERE term_counts.term_id = postings.term_id)
					))
				)
			END
		, 0.0)
		%s
	`, c.DFMaxThresholdRate, where)

	_, err = tx.ExecContext(ctx, calcTFIDFSQL, binds...)
	if err != nil {
		return fmt.Errorf("failed to calculate tfidf: %w", err)
	}

	// 各エントリのベクトルサイズ（L2ノルム）を計算
	calcTFIDFSizeSQL := fmt.Sprintf(`
		CREATE TEMPORARY TABLE tfidf_size AS
			SELECT entry_id, SQRT(SUM(tfidf * tfidf)) AS size FROM postings
			%s
			GROUP BY entry_id
	`, where)

	_, err = tx.ExecContext(ctx, calcTFIDFSizeSQL, binds...)
	if err != nil {
		return fmt.Errorf("failed to create tfidf_size table: %w", err)
	}

	_, err = tx.ExecContext(ctx, `CREATE INDEX temp.tfidf_size_entry_id ON tfidf_size (entry_id)`)
	if err != nil {
		return fmt.Errorf("failed to create index on tfidf_size: %w", err)
	}

	// TF-IDF 値を正規化
	normalizeTFIDFSQL := fmt.Sprintf(`
		UPDATE postings SET tfidf_n = IFNULL(tfidf / (SELECT size FROM tfidf_size WHERE entry_id = postings.entry_id), 0.0)
		%s
	`, where)

	_, err = tx.ExecContext(ctx, normalizeTFIDFSQL, binds...)
	if err != nil {
		return fmt.Errorf("failed to normalize tfidf: %w", err)
	}

	if err := tx.Commit(); err != nil {
		return fmt.Errorf("failed to commit transaction: %w", err)
	}

	// クエリプランナの最適化のために ANALYZE を実行
	if _, err := c.tfidfDB.ExecContext(ctx, "ANALYZE"); err != nil {
		log.Printf("Warning: failed to run ANALYZE: %v", err)
	}

	log.Printf("Recalculated TF-IDF values for %d entries", len(entryIDs))
	return nil
}
