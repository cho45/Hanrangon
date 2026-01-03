package subcommands

import (
	"context"
	"flag"
	"fmt"
	"log"

	"github.com/cho45/hanrangon/app"
)

func RecalcTFIDF(ctx context.Context, application app.App, args []string) error {
	fs := flag.NewFlagSet("recalc-tfidf", flag.ExitOnError)
	force := fs.Bool("force", false, "force execution of recalculation")
	dryRun := fs.Bool("dry-run", false, "show what would be done without making changes")
	similarityOnly := fs.Bool("similarity-only", false, "run only similarity calculation phase")
	fs.Parse(args)

	if !*force && !*dryRun {
		fmt.Println("Warning: This operation will recalculate TF-IDF scores for all entries and may take some time.")
		fmt.Println("Use --force to actually execute the operation, or --dry-run to see what would happen.")
		fmt.Println()
		fs.Usage()
		return nil
	}

	if *dryRun {
		log.Println("DRY-RUN MODE: No changes will be saved to the database.")
	}

	// Get total count for progress reporting
	var total int
	err := application.DB().QueryRowContext(ctx, "SELECT COUNT(*) FROM entries").Scan(&total)
	if err != nil {
		return fmt.Errorf("failed to count entries: %w", err)
	}

	var entryIDs []int64

	// Phase 1: Term extraction and count update
	if !*similarityOnly {
		log.Printf("Phase 1: Extracting terms and updating term counts for %d entries...", total)

		query := "SELECT id, title, body FROM entries ORDER BY id ASC"
		rows, err := application.DB().QueryContext(ctx, query)
		if err != nil {
			return fmt.Errorf("failed to query entries: %w", err)
		}
		defer rows.Close()

		count := 0
		for rows.Next() {
			count++
			var id int64
			var title, body string
			if err := rows.Scan(&id, &title, &body); err != nil {
				log.Printf("  Error scanning entry: %v", err)
				continue
			}

			log.Printf("  [%d/%d] Processing id:%d %s", count, total, id, title)

			if !*dryRun {
				if err := application.Calculator().UpdateTFIDF(ctx, id, title, body); err != nil {
					log.Printf("  Error updating TF-IDF for entry %d: %v", id, err)
					continue
				}
			}
			entryIDs = append(entryIDs, id)
		}
		if err := rows.Err(); err != nil {
			return fmt.Errorf("error during row iteration: %w", err)
		}
		log.Printf("Phase 1 completed. Processed %d entries.", count)
	} else {
		log.Println("Skipping Phase 1 as --similarity-only is specified.")
		// Populate entryIDs for Phase 3
		rows, err := application.DB().QueryContext(ctx, "SELECT id FROM entries ORDER BY id ASC")
		if err != nil {
			return fmt.Errorf("failed to query entry IDs: %w", err)
		}
		defer rows.Close()
		for rows.Next() {
			var id int64
			if err := rows.Scan(&id); err != nil {
				return fmt.Errorf("failed to scan entry ID: %w", err)
			}
			entryIDs = append(entryIDs, id)
		}
	}

	// Phase 2: Global TF-IDF recalculation
	if !*similarityOnly {
		log.Println("Phase 2: Recalculating global TF-IDF values...")
		if *dryRun {
			log.Println("  [dry-run] Would recalculate global TF-IDF values using temporary tables.")
		} else {
			if err := application.Calculator().RecalculateTFIDFValues(ctx, nil); err != nil {
				return fmt.Errorf("failed to recalculate tfidf values: %w", err)
			}
		}
		log.Println("Phase 2 completed.")
	} else {
		log.Println("Skipping Phase 2 as --similarity-only is specified.")
	}

	// Phase 3: Similarity calculation
	totalToCalc := len(entryIDs)
	log.Printf("Phase 3: Calculating similar entries for %d processed entries...", totalToCalc)
	for i, id := range entryIDs {
		log.Printf("  [%d/%d] Calculating similarity for id:%d", i+1, totalToCalc, id)
		if *dryRun {
			// skip
		} else {
			if err := application.SimilarityCalculator().CalculateSimilarEntries(ctx, []int64{id}); err != nil {
				log.Printf("  Error calculating similar entries for entry %d: %v", id, err)
				continue
			}
		}
	}
	log.Println("Phase 3 completed.")

	if *dryRun {
		log.Println("Dry-run finished. No changes were made.")
	} else {
		log.Println("TF-IDF recalculation finished successfully.")
	}
	return nil
}
