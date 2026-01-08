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

// Search executes an AND search using the TF-IDF index.
// It requires all 2-grams of the query to be present in the entry.
// Longer alphanumeric words are used to boost the score if they exist in the index.
func (s *Searcher) Search(ctx context.Context, query string, limit int) ([]SearchResult, error) {
	if query == "" {
		return nil, nil
	}

	if limit <= 0 {
		limit = 50
	}

	// 1. Extract terms (words and bigrams) from query
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

	// 3. Identify which terms are required for the AND condition
	type queryTermInfo struct {
		termID     int64
		weight     float64
		isRequired bool
	}
	var termInfos []queryTermInfo
	var requiredCount int

	for term, count := range queryTerms {
		// Use runes to handle multi-byte characters correctly.
		// Bigrams (len=2) are the atomic units of our index and required for AND search.
		isBigram := len([]rune(term)) == 2

		t, err := s.queries.GetTermByTerm(ctx, term)
		if err != nil {
			if err == sql.ErrNoRows {
				if isBigram {
					// If a required bigram doesn't exist in the index at all,
					// no document can possibly match the AND query.
					return nil, nil
				}
				// Optional terms (words > 2 chars) can be missing from the index.
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

	// 4. Prepare parameters for the SQL query
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

	// SQL Logic:
	// - We use a CTE/VALUES to provide the query terms and their properties.
	// - SUM(is_required) counts how many distinct required term_ids match for each entry.
	// - HAVING ensures that all required terms (all bigrams) are present.
	querySQL := fmt.Sprintf(`
		WITH query_terms(term_id, weight, is_required) AS (
			VALUES %s
		)
		SELECT entry_id, SUM(score) AS total_score FROM (
			-- Matches from the postings table (DF >= 2)
			SELECT p.entry_id, p.term_id, p.tfidf_n * q.weight AS score, q.is_required
			FROM postings p
			JOIN query_terms q ON p.term_id = q.term_id

			UNION ALL

			-- Matches from the terms table (DF = 1 rescue path)
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
