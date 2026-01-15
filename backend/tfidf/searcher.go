package tfidf

import (
	"context"
	"database/sql"
	"fmt"
	"math"
	"strings"

	"github.com/cho45/hanrangon/backend/model/tfidfdb"
)

type Searcher struct {
	db         *sql.DB
	queries    tfidfdb.Querier
	calculator *Calculator
}

type SearchResult struct {
	EntryID int64
	Score   float64
}

func NewSearcher(db *sql.DB, queries tfidfdb.Querier, calculator *Calculator) *Searcher {
	return &Searcher{
		db:         db,
		queries:    queries,
		calculator: calculator,
	}
}

// Search は TF-IDF インデックスを使用して AND 検索を実行。
// クエリに含まれるすべての 2-gram (Bigram) がエントリ内に存在することを必須条件とする。
// 3文字以上の英数字単語は、インデックスに存在すればスコアの加算（ブースト）に利用されるが、必須条件には含まれない。
func (s *Searcher) Search(ctx context.Context, query string, limit int) ([]SearchResult, error) {
	if query == "" {
		return nil, nil
	}

	if limit <= 0 {
		limit = 50
	}

	// 1. クエリからターム（単語と 2-gram）を抽出
	queryTerms := s.calculator.ExtractTerms("", query)
	if len(queryTerms) == 0 {
		return nil, nil
	}

	// 2. IDF 計算のために総エントリ数を取得
	totalEntries, err := s.calculator.dataQueries.CountAllEntries(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to count total entries: %w", err)
	}
	if totalEntries == 0 {
		return nil, nil
	}

	// 3. AND 条件に必要なタームを特定
	type queryTermInfo struct {
		termID     int64
		weight     float64
		isRequired bool
	}
	var termInfos []queryTermInfo
	var requiredCount int

	for term, count := range queryTerms {
		// マルチバイト文字を正しく扱うために rune を使用。
		// Bigram (長さ2) はインデックスの最小単位であり、AND 検索の必須条件とする。
		isBigram := len([]rune(term)) == 2

		t, err := s.queries.GetTermByTerm(ctx, term)
		if err != nil {
			if err == sql.ErrNoRows {
				if isBigram {
					// 必須条件である Bigram がインデックスに存在しない場合、
					// その AND クエリに一致するドキュメントは存在し得ない。
					return nil, nil
				}
				// 3文字以上の単語などはオプション扱いとし、インデックスになくても検索を続行。
				continue
			}
			return nil, fmt.Errorf("failed to get term: %w", err)
		}

		if t.DfCount <= 0 {
			if isBigram {
				return nil, nil
			}
			continue
		}

		idf := 1.0 + math.Log(float64(totalEntries)/float64(t.DfCount))
		tf := math.Log(float64(count) + 1.0)

		info := queryTermInfo{
			termID:     t.ID,
			weight:     tf * idf,
			isRequired: isBigram,
		}
		if info.isRequired {
			requiredCount++
		}
		termInfos = append(termInfos, info)
	}

	if len(termInfos) == 0 {
		return nil, nil
	}

	// 4. SQL クエリのパラメータを準備
	valueStrings := make([]string, len(termInfos))
	binds := make([]interface{}, len(termInfos)*3)
	for i, info := range termInfos {
		valueStrings[i] = "(?, ?, ?)"
		binds[i*3] = info.termID
		binds[i*3+1] = info.weight
		if info.isRequired {
			binds[i*3+2] = 1
		} else {
			binds[i*3+2] = 0
		}
	}
	binds = append(binds, requiredCount, limit)

	// SQL ロジック:
	// - CTE/VALUES を使用してクエリタームとその属性を提供。
	// - SUM(is_required) で、各エントリに一致する必須タームの数をカウント。
	// - HAVING 句により、すべての必須ターム (すべての Bigram) が含まれるエントリのみを抽出。
	querySQL := fmt.Sprintf(`
		WITH query_terms(term_id, weight, is_required) AS (
			VALUES %s
		)
		SELECT entry_id, SUM(score) AS total_score FROM (
			-- postings テーブルからのマッチ (DF >= 2)
			SELECT p.entry_id, p.term_id, p.tfidf_n * q.weight AS score, q.is_required
			FROM postings p
			JOIN query_terms q ON p.term_id = q.term_id

			UNION ALL

			-- terms テーブルからのマッチ (DF = 1 のレスキューパス)
			-- インデックス（postings）がまだ作られていない出現1回の語も検索可能にする。
			SELECT t.first_entry_id AS entry_id, t.id AS term_id, q.weight * 1.0 AS score, q.is_required
			FROM terms t
			JOIN query_terms q ON t.id = q.term_id
			WHERE t.df_count = 1 AND t.first_entry_id IS NOT NULL
		)
		GROUP BY entry_id
		HAVING SUM(is_required) = ?
		ORDER BY total_score DESC
		LIMIT ?
	`, strings.Join(valueStrings, ","))

	rows, err := s.db.QueryContext(ctx, querySQL, binds...)
	if err != nil {
		return nil, fmt.Errorf("failed to execute search sql: %w", err)
	}
	defer rows.Close()

	var results []SearchResult
	for rows.Next() {
		var r SearchResult
		if err := rows.Scan(&r.EntryID, &r.Score); err != nil {
			return nil, fmt.Errorf("failed to scan search result: %w", err)
		}
		results = append(results, r)
	}

	return results, nil
}
