package tfidf

import (
	"context"
	"database/sql"
	"fmt"
	"log"

	"github.com/cho45/hanrangon/model"
)

// SimilarityCalculator handles similarity calculations between entries
type SimilarityCalculator struct {
	db      *sql.DB
	queries *model.Queries
}

// NewSimilarityCalculator creates a new SimilarityCalculator
func NewSimilarityCalculator(db *sql.DB, queries *model.Queries) *SimilarityCalculator {
	return &SimilarityCalculator{
		db:      db,
		queries: queries,
	}
}

// SimilarEntry represents a similar entry with its score
type SimilarEntry struct {
	EntryID int64
	Score   float64
}

// CalculateSimilarEntries calculates similar entries for given entry IDs
// This faithfully ports the Nogag logic from SimilarEntry.pm (lines 186-254)
func (s *SimilarityCalculator) CalculateSimilarEntries(ctx context.Context, entryIDs []int64) error {
	for _, entryID := range entryIDs {
		if err := s.calculateForEntry(ctx, entryID); err != nil {
			return fmt.Errorf("failed to calculate similar entries for entry %d: %w", entryID, err)
		}
	}
	return nil
}

// calculateForEntry calculates similar entries for a single entry
func (s *SimilarityCalculator) calculateForEntry(ctx context.Context, entryID int64) error {
	tx, err := s.db.BeginTx(ctx, nil)
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback()

	// Drop and create similar_candidate temporary table
	// This table contains candidate entries that share at least 3 terms with the target entry
	_, err = tx.ExecContext(ctx, `DROP TABLE IF EXISTS similar_candidate`)
	if err != nil {
		return fmt.Errorf("failed to drop similar_candidate table: %w", err)
	}

	// Create candidate table with entries that:
	// 1. Have entry_id > (target - 1000) to exclude older entries (performance optimization)
	// 2. Share terms with top 50 terms of target entry
	// 3. Share at least 3 terms (cnt > 3)
	// Limited to top 100 candidates
	_, err = tx.ExecContext(ctx, `
		CREATE TEMPORARY TABLE similar_candidate AS
			SELECT entry_id, COUNT(*) as cnt FROM postings
			WHERE
				entry_id > ? AND
				term_id IN (
					SELECT term_id FROM postings WHERE entry_id = ?
					ORDER BY tfidf_n DESC
					LIMIT 50
				)
			GROUP BY entry_id
			HAVING cnt > 3
			ORDER BY cnt DESC
			LIMIT 100
	`, entryID-1000, entryID)
	if err != nil {
		return fmt.Errorf("failed to create similar_candidate table: %w", err)
	}

	// Calculate cosine similarity scores
	// For normalized vectors, dot product equals cosine similarity
	// SUM(a.tfidf_n * b.tfidf_n) = cosine similarity
	type scoreResult struct {
		EntryID int64
		Score   float64
	}

	rows, err := tx.QueryContext(ctx, `
		SELECT
			entry_id AS eid,
			SUM(a.tfidf_n * b.tfidf_n) AS score
		FROM (
			(SELECT term_id, tfidf_n FROM postings WHERE entry_id = ? ORDER BY tfidf_n DESC LIMIT 50) as a
			INNER JOIN
			(SELECT entry_id, term_id, tfidf_n FROM postings WHERE entry_id IN (SELECT entry_id FROM similar_candidate)) as b
			ON
			a.term_id = b.term_id
		)
		WHERE eid != ?
		GROUP BY entry_id
		ORDER BY score DESC
		LIMIT 10
	`, entryID, entryID)

	if err != nil {
		return fmt.Errorf("failed to calculate similarity scores: %w", err)
	}
	defer rows.Close()

	var scores []scoreResult
	for rows.Next() {
		var sr scoreResult
		if err := rows.Scan(&sr.EntryID, &sr.Score); err != nil {
			return fmt.Errorf("failed to scan score result: %w", err)
		}
		scores = append(scores, sr)
	}
	if err := rows.Err(); err != nil {
		return fmt.Errorf("error iterating scores: %w", err)
	}

	// Delete existing related entries
	_, err = tx.ExecContext(ctx, `DELETE FROM related_entries WHERE entry_id = ?`, entryID)
	if err != nil {
		return fmt.Errorf("failed to delete existing related entries: %w", err)
	}

	// Insert new related entries
	if len(scores) > 0 {
		for _, score := range scores {
			_, err := tx.ExecContext(ctx, `
				INSERT INTO related_entries (entry_id, related_entry_id, score)
				VALUES (?, ?, ?)
			`, entryID, score.EntryID, score.Score)
			if err != nil {
				return fmt.Errorf("failed to insert related entry: %w", err)
			}
		}
	}

	if err := tx.Commit(); err != nil {
		return fmt.Errorf("failed to commit transaction: %w", err)
	}

	log.Printf("Calculated %d similar entries for entry %d", len(scores), entryID)
	return nil
}
