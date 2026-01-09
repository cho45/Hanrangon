package subcommands

import (
	"context"
	"database/sql"
	"flag"
	"fmt"
	"log"

	"github.com/cho45/hanrangon/app"
	"github.com/cho45/hanrangon/view"
)

func RecalcMetadata(ctx context.Context, application app.App, args []string) error {
	fs := flag.NewFlagSet("recalc-metadata", flag.ExitOnError)
	all := fs.Bool("all", false, "recalculate metadata for all entries")
	id := fs.Int64("id", 0, "recalculate metadata for specific entry ID")
	force := fs.Bool("force", false, "force execution of recalculation")
	dryRun := fs.Bool("dry-run", false, "show what would be done without making changes")
	fs.Parse(args)

	if !*all && *id == 0 {
		fmt.Println("Usage: hanrangon recalc-metadata [-all | -id ID] [-force | -dry-run]")
		fs.PrintDefaults()
		return nil
	}

	if !*force && !*dryRun {
		fmt.Println("Warning: This operation will recalculate metadata (summary and image_url) for targeted entries.")
		fmt.Println("Use --force to actually execute the operation, or --dry-run to see what would happen.")
		fmt.Println()
		fs.Usage()
		return nil
	}

	if *dryRun {
		log.Println("DRY-RUN MODE: No changes will be saved to the database.")
	}

	var query string
	var queryArgs []interface{}

	if *id != 0 {
		log.Printf("Targeting entry ID: %d", *id)
		query = "SELECT id, path, formatted_body FROM entries WHERE id = ?"
		queryArgs = append(queryArgs, *id)
	} else {
		log.Println("Targeting all entries...")
		query = "SELECT id, path, formatted_body FROM entries ORDER BY id DESC"
	}

	rows, err := application.DB().QueryContext(ctx, query, queryArgs...)
	if err != nil {
		return fmt.Errorf("failed to query entries: %w", err)
	}
	defer rows.Close()

	var tx *sql.Tx
	if !*dryRun {
		tx, err = application.DB().BeginTx(ctx, nil)
		if err != nil {
			return fmt.Errorf("failed to begin transaction: %w", err)
		}
		defer func() {
			if tx != nil {
				tx.Rollback()
			}
		}()
	}

	count := 0
	updated := 0
	const batchSize = 100

	for rows.Next() {
		count++
		var eid int64
		var path, formattedBody string
		err := rows.Scan(&eid, &path, &formattedBody)
		if err != nil {
			log.Printf("  Error scanning entry: %v", err)
			continue
		}

		summary, imageURL := view.ExtractSummaryAndFirstImage(formattedBody, 70)

		if !*dryRun {
			_, err = tx.ExecContext(ctx, "UPDATE entries SET summary = ?, image_url = ? WHERE id = ?", summary, imageURL, eid)
			if err != nil {
				log.Printf("  Error updating entry %d: %v", eid, err)
				continue
			}
			updated++

			if updated%batchSize == 0 {
				if err := tx.Commit(); err != nil {
					return fmt.Errorf("failed to commit batch: %w", err)
				}
				log.Printf("Processed %d entries...", updated)
				tx, err = application.DB().BeginTx(ctx, nil)
				if err != nil {
					return fmt.Errorf("failed to begin next transaction: %w", err)
				}
			}
		} else {
			log.Printf("  [dry-run] Would update id:%d path:%s summary:%.20q... image_url:%s", eid, path, summary, imageURL)
			updated++
		}
	}

	if !*dryRun && tx != nil {
		if err := tx.Commit(); err != nil {
			return fmt.Errorf("failed to commit final transaction: %w", err)
		}
		tx = nil
	}

	if err := rows.Err(); err != nil {
		return fmt.Errorf("error during row iteration: %w", err)
	}

	log.Printf("RecalcMetadata completed. Checked %d entries, updated %d entries.", count, updated)
	return nil
}
