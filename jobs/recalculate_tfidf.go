package jobs

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"time"

	"github.com/cho45/hanrangon/app"
)

// RecalculateTFIDFJob handles TF-IDF recalculation for entries
type RecalculateTFIDFJob struct {
	app app.App
}

// RecalculateTFIDFArg is the argument for RecalculateTFIDFJob
type RecalculateTFIDFArg struct {
	EntryID int64 `json:"entry_id"`
}

// NewRecalculateTFIDFJob creates a new RecalculateTFIDFJob
func NewRecalculateTFIDFJob(a app.App) *RecalculateTFIDFJob {
	return &RecalculateTFIDFJob{
		app: a,
	}
}

// Name returns the job name
func (j *RecalculateTFIDFJob) Name() string {
	return "RecalculateTFIDF"
}

// Timeout returns the maximum execution time for this job
// TF-IDF recalculation can be heavy for large numbers of entries, so set to 10 minutes
func (j *RecalculateTFIDFJob) Timeout() time.Duration {
	return 10 * time.Minute
}

// Execute executes the TF-IDF recalculation job
func (j *RecalculateTFIDFJob) Execute(ctx context.Context, arg json.RawMessage) error {
	var params RecalculateTFIDFArg
	if err := json.Unmarshal(arg, &params); err != nil {
		return fmt.Errorf("failed to unmarshal job arg: %w", err)
	}

	log.Printf("RecalculateTFIDF job started for entry %d", params.EntryID)

	// Get entry from database
	entry, err := j.app.Queries().GetEntryById(ctx, params.EntryID)
	if err != nil {
		return fmt.Errorf("failed to get entry: %w", err)
	}

	// Step 1: Extract terms and update TF-IDF data
	if err := j.app.Calculator().UpdateTFIDF(ctx, params.EntryID, entry.Title, entry.Body); err != nil {
		return fmt.Errorf("failed to update tfidf: %w", err)
	}

	// Step 2: Recalculate TF-IDF values for all entries
	// Note: We recalculate for all entries to ensure global statistics (IDF) are up-to-date
	// This is necessary because IDF depends on the total number of entries and term frequencies
	if err := j.app.Calculator().RecalculateTFIDFValues(ctx, []int64{}); err != nil {
		return fmt.Errorf("failed to recalculate tfidf values: %w", err)
	}

	// Step 3: Calculate similar entries for this entry
	if err := j.app.SimilarityCalculator().CalculateSimilarEntries(ctx, []int64{params.EntryID}); err != nil {
		return fmt.Errorf("failed to calculate similar entries: %w", err)
	}

	log.Printf("RecalculateTFIDF job completed for entry %d", params.EntryID)
	return nil
}
