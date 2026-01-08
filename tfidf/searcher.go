package tfidf

import (
	"context"
	"database/sql"
	"fmt"
	"math"
	"strings"

	"github.com/cho45/hanrangon/model"
)

// Searcher handles searching using the TF-IDF index
type Searcher struct {
	db         *sql.DB
	queries    *model.Queries
	calculator *Calculator
}

// SearchResult represents a single entry in search results
type SearchResult struct {
	EntryID int64
	Score   float64
}

// NewSearcher creates a new Searcher
func NewSearcher(db *sql.DB, queries *model.Queries, calculator *Calculator) *Searcher {
	return &Searcher{
		db:         db,
		queries:    queries,
		calculator: calculator,
	}
}

// Search executes a search using the TF-IDF index.
// It matches terms from both the postings table (DF >= 2) and terms table (DF = 1).
func (s *Searcher) Search(ctx context.Context, query string, limit int) ([]SearchResult, error) {
	if query == "" {
		return nil, nil
	}

	if limit <= 0 {
		limit = 50
	}

	// 1. Extract terms from query
	queryTerms := s.calculator.ExtractTerms("", query)
	if len(queryTerms) == 0 {
		return nil, nil
	}

	// 2. Get total entries for IDF calculation
	totalEntries, err := s.calculator.dataQueries.CountAllEntries(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to count total entries: %w", err)
	}
	if totalEntries == 0 {
		return nil, nil
	}

	// 3. Build query vector and prepare term IDs
	type queryTermInfo struct {
		termID int64
		weight float64
	}
	var termInfos []queryTermInfo
	for term, count := range queryTerms {
		t, err := s.queries.GetTermByTerm(ctx, term)
		if err != nil {
			if err == sql.ErrNoRows {
				continue
			}
			return nil, fmt.Errorf("failed to get term: %w", err)
		}

		if t.DfCount <= 0 {
			continue
		}

		// IDF calculation: 1 + LOG(total_entries / entries_with_term)
		idf := 1.0 + math.Log(float64(totalEntries)/float64(t.DfCount))
		// TF calculation for query: LOG(count + 1)
		tf := math.Log(float64(count) + 1.0)

		termInfos = append(termInfos, queryTermInfo{
			termID: t.ID,
			weight: tf * idf,
		})
	}

	if len(termInfos) == 0 {
		return nil, nil
	}

	// 4. Execute scoring query
	// We use a CTE or VALUES clause to avoid temporary table creation,
	// allowing this to run in a ReadOnly transaction.

	valueStrings := make([]string, len(termInfos))
	binds := make([]interface{}, len(termInfos)*2)
	for i, info := range termInfos {
		valueStrings[i] = "(?, ?)"
		binds[i*2] = info.termID
		binds[i*2+1] = info.weight
	}
	binds = append(binds, limit)

	// Cosine similarity matching: Sum(postings.tfidf_n * query_terms.weight)
	// Includes DF=1 rescue path using terms.first_entry_id.
	querySQL := fmt.Sprintf(`
		WITH query_terms(term_id, weight) AS (
			VALUES %s
		)
		SELECT entry_id, SUM(score) AS total_score FROM (
			-- Matches from postings (DF >= 2)
			SELECT p.entry_id, p.tfidf_n * q.weight AS score
			FROM postings p
			JOIN query_terms q ON p.term_id = q.term_id
			WHERE p.tfidf_n > 0

			UNION ALL

			-- Matches from terms (DF = 1)
			SELECT t.first_entry_id AS entry_id, q.weight * 1.0 AS score
			FROM terms t
			JOIN query_terms q ON t.id = q.term_id
			WHERE t.df_count = 1 AND t.first_entry_id IS NOT NULL
		)
		GROUP BY entry_id
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
