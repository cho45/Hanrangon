package tfidf

import (
	"context"
	"database/sql"
	"fmt"
	"io"
	"log"
	"regexp"
	"strings"
	"unicode/utf8"

	"github.com/cho45/hanrangon/model"
	"github.com/nyarla/go-japanese-segmenter/dicts/tinyseg"
	"github.com/nyarla/go-japanese-segmenter/segmenter"
)

// Calculator handles TF-IDF calculations
type Calculator struct {
	db      *sql.DB
	queries *model.Queries
}

// NewCalculator creates a new Calculator
func NewCalculator(db *sql.DB, queries *model.Queries) (*Calculator, error) {
	return &Calculator{
		db:      db,
		queries: queries,
	}, nil
}

// ExtractTerms extracts terms from title and body text
// It removes HTML tags, tokenizes Japanese text with go-japanese-segmenter, and splits alphanumeric words
func (c *Calculator) ExtractTerms(title, body string) map[string]int {
	terms := make(map[string]int)

	// Combine title and body
	text := title + " " + body

	// Remove HTML tags
	text = c.removeHTMLTags(text)

	// Extract Japanese terms with go-japanese-segmenter (TinySegmenter based)
	src := strings.NewReader(text)
	dst := new(strings.Builder)
	dict := segmenter.BiasCalculatorFunc(tinyseg.CalculateBias)
	seg := segmenter.New(dst, src)

	for {
		err := seg.Segment(dict)
		if err != nil {
			if err != io.EOF {
				log.Printf("error during segmentation: %v", err)
			}
			break
		}

		surface := strings.TrimSpace(dst.String())
		// Only use terms with 2 or more characters
		if utf8.RuneCountInString(surface) >= 2 {
			terms[surface]++
		}
		dst.Reset()
	}

	// Extract alphanumeric words (English, numbers)
	alphanumericPattern := regexp.MustCompile(`[a-zA-Z0-9]+`)
	matches := alphanumericPattern.FindAllString(text, -1)
	for _, match := range matches {
		match = strings.ToLower(match)
		if utf8.RuneCountInString(match) >= 2 {
			terms[match]++
		}
	}

	return terms
}

// removeHTMLTags removes HTML tags from text
func (c *Calculator) removeHTMLTags(text string) string {
	// Simple HTML tag removal (can be improved with proper HTML parser if needed)
	re := regexp.MustCompile(`<[^>]*>`)
	return re.ReplaceAllString(text, "")
}

// UpdateTFIDF updates TF-IDF data for a given entry
func (c *Calculator) UpdateTFIDF(ctx context.Context, entryID int64, title, body string) error {
	// Extract terms from title and body
	terms := c.ExtractTerms(title, body)

	tx, err := c.db.BeginTx(ctx, nil)
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback()

	qtx := c.queries.WithTx(tx)

	// Delete existing TF-IDF data for this entry
	if err := qtx.DeletePostingsByEntryID(ctx, entryID); err != nil {
		return fmt.Errorf("failed to delete existing tfidf data: %w", err)
	}

	// Insert new terms
	for term, count := range terms {
		if err := qtx.InsertTerm(ctx, term); err != nil {
			return fmt.Errorf("failed to insert term: %w", err)
		}
		termID, err := qtx.GetTermID(ctx, term)
		if err != nil {
			return fmt.Errorf("failed to get term id: %w", err)
		}

		err = qtx.InsertPosting(ctx, model.InsertPostingParams{
			EntryID:   entryID,
			TermID:    termID,
			TermCount: int64(count),
		})
		if err != nil {
			return fmt.Errorf("failed to insert tfidf term: %w", err)
		}
	}

	if err := tx.Commit(); err != nil {
		return fmt.Errorf("failed to commit transaction: %w", err)
	}

	log.Printf("Updated TF-IDF for entry %d: %d terms", entryID, len(terms))
	return nil
}

// RecalculateTFIDFValues recalculates TF-IDF values for all or specified entries
// This faithfully ports the Nogag logic from SimilarEntry.pm (lines 109-184)
func (c *Calculator) RecalculateTFIDFValues(ctx context.Context, entryIDs []int64) error {
	tx, err := c.db.BeginTx(ctx, nil)
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback()

	// Create temporary tables for calculations
	// Drop existing temporary tables if they exist
	_, _ = tx.ExecContext(ctx, `DROP TABLE IF EXISTS temp.entry_total`)
	_, _ = tx.ExecContext(ctx, `DROP TABLE IF EXISTS temp.term_counts`)
	_, _ = tx.ExecContext(ctx, `DROP TABLE IF EXISTS temp.entry_term_counts`)
	_, _ = tx.ExecContext(ctx, `DROP TABLE IF EXISTS temp.tfidf_size`)

	// entry_total: total number of entries
	_, err = tx.ExecContext(ctx, `
		CREATE TEMPORARY TABLE entry_total AS
			SELECT CAST(COUNT(DISTINCT entry_id) AS REAL) AS value FROM postings
	`)
	if err != nil {
		return fmt.Errorf("failed to create entry_total table: %w", err)
	}

	// term_counts: number of entries each term appears in
	_, err = tx.ExecContext(ctx, `
		CREATE TEMPORARY TABLE term_counts AS
			SELECT term_id, CAST(COUNT(*) AS REAL) AS cnt FROM postings GROUP BY term_id
	`)
	if err != nil {
		return fmt.Errorf("failed to create term_counts table: %w", err)
	}

	_, err = tx.ExecContext(ctx, `CREATE INDEX temp.term_counts_term_id ON term_counts (term_id)`)
	if err != nil {
		return fmt.Errorf("failed to create index on term_counts: %w", err)
	}

	// entry_term_counts: log of total term count per entry
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

	// Build WHERE clause for specific entries
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

	// Calculate TF-IDF values
	// TF (Harman method): LOG(term_count + 1) / LOG(total_term_count_in_entry)
	// IDF (Sparck Jones method): 1 + LOG(total_entries / entries_with_term)
	calcTFIDFSQL := fmt.Sprintf(`
		UPDATE postings SET tfidf = IFNULL(
			-- tf (normalized with Harman method)
			(
				LN(CAST(term_count AS REAL) + 1) -- term_count in an entry
				/
				(SELECT cnt FROM entry_term_counts WHERE entry_term_counts.entry_id = postings.entry_id) -- total term count in an entry
			)
			*
			-- idf (normalized with Sparck Jones method)
			(1 + LN(
				(SELECT value FROM entry_total) -- total
				/
				(SELECT cnt FROM term_counts WHERE term_counts.term_id = postings.term_id) -- term entry count
			))
		, 0.0)
		%s
	`, where)

	_, err = tx.ExecContext(ctx, calcTFIDFSQL, binds...)
	if err != nil {
		return fmt.Errorf("failed to calculate tfidf: %w", err)
	}

	// Calculate vector size (L2 norm) for each entry
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

	// Normalize TF-IDF values
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

	log.Printf("Recalculated TF-IDF values for %d entries", len(entryIDs))
	return nil
}
