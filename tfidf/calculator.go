package tfidf

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"regexp"
	"strings"

	"github.com/cho45/hanrangon/model"
	"github.com/ikawaha/kagome-dict/ipa"
	"github.com/ikawaha/kagome/v2/tokenizer"
)

// Calculator handles TF-IDF calculations
type Calculator struct {
	db      *sql.DB
	queries *model.Queries
	tok     *tokenizer.Tokenizer
}

// NewCalculator creates a new Calculator
func NewCalculator(db *sql.DB, queries *model.Queries) (*Calculator, error) {
	// Initialize kagome tokenizer with IPA dictionary
	tok, err := tokenizer.New(ipa.Dict())
	if err != nil {
		return nil, fmt.Errorf("failed to initialize tokenizer: %w", err)
	}

	return &Calculator{
		db:      db,
		queries: queries,
		tok:     tok,
	}, nil
}

// ExtractTerms extracts terms from title and body text
// It removes HTML tags, tokenizes Japanese text with kagome, and splits alphanumeric words
func (c *Calculator) ExtractTerms(title, body string) map[string]int {
	terms := make(map[string]int)

	// Combine title and body
	text := title + " " + body

	// Remove HTML tags
	text = c.removeHTMLTags(text)

	// Extract Japanese terms with kagome
	tokens := c.tok.Tokenize(text)
	for _, token := range tokens {
		features := token.Features()
		if len(features) < 2 {
			continue
		}

		// Extract nouns, verbs, and adjectives
		pos := features[0] // Part of speech
		if pos == "名詞" || pos == "動詞" || pos == "形容詞" {
			surface := token.Surface
			if len(surface) > 1 { // Skip single character terms
				terms[surface]++
			}
		}
	}

	// Extract alphanumeric words (English, numbers)
	alphanumericPattern := regexp.MustCompile(`[a-zA-Z0-9]+`)
	matches := alphanumericPattern.FindAllString(text, -1)
	for _, match := range matches {
		if len(match) > 1 { // Skip single character terms
			match = strings.ToLower(match)
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

	// Delete existing TF-IDF data for this entry
	if err := c.queries.DeleteTFIDFByEntryID(ctx, entryID); err != nil {
		return fmt.Errorf("failed to delete existing tfidf data: %w", err)
	}

	// Insert new terms
	for term, count := range terms {
		err := c.queries.InsertTFIDF(ctx, model.InsertTFIDFParams{
			EntryID:   entryID,
			Term:      term,
			TermCount: int64(count),
		})
		if err != nil {
			return fmt.Errorf("failed to insert tfidf term: %w", err)
		}
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
			SELECT CAST(COUNT(DISTINCT entry_id) AS REAL) AS value FROM tfidf
	`)
	if err != nil {
		return fmt.Errorf("failed to create entry_total table: %w", err)
	}

	// term_counts: number of entries each term appears in
	_, err = tx.ExecContext(ctx, `
		CREATE TEMPORARY TABLE term_counts AS
			SELECT term, CAST(COUNT(*) AS REAL) AS cnt FROM tfidf GROUP BY term
	`)
	if err != nil {
		return fmt.Errorf("failed to create term_counts table: %w", err)
	}

	_, err = tx.ExecContext(ctx, `CREATE INDEX temp.term_counts_term ON term_counts (term)`)
	if err != nil {
		return fmt.Errorf("failed to create index on term_counts: %w", err)
	}

	// entry_term_counts: log of total term count per entry
	_, err = tx.ExecContext(ctx, `
		CREATE TEMPORARY TABLE entry_term_counts AS
			SELECT entry_id, LN(CAST(SUM(term_count) AS REAL)) AS cnt FROM tfidf GROUP BY entry_id
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
		UPDATE tfidf SET tfidf = IFNULL(
			-- tf (normalized with Harman method)
			(
				LN(CAST(term_count AS REAL) + 1) -- term_count in an entry
				/
				(SELECT cnt FROM entry_term_counts WHERE entry_term_counts.entry_id = tfidf.entry_id) -- total term count in an entry
			)
			*
			-- idf (normalized with Sparck Jones method)
			(1 + LN(
				(SELECT value FROM entry_total) -- total
				/
				(SELECT cnt FROM term_counts WHERE term_counts.term = tfidf.term) -- term entry count
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
			SELECT entry_id, SQRT(SUM(tfidf * tfidf)) AS size FROM tfidf
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
		UPDATE tfidf SET tfidf_n = IFNULL(tfidf / (SELECT size FROM tfidf_size WHERE entry_id = tfidf.entry_id), 0.0)
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
