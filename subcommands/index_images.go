package subcommands

import (
	"context"
	"flag"
	"fmt"
	"log"

	"github.com/cho45/hanrangon/app"
	"github.com/cho45/hanrangon/jobs"
)

func IndexImages(ctx context.Context, application app.App, args []string) error {
	fs := flag.NewFlagSet("index-images", flag.ExitOnError)
	force := fs.Bool("force", false, "force execution of indexing")
	dryRun := fs.Bool("dry-run", false, "dry run mode (no actual changes)")
	sync := fs.Bool("sync", false, "only synchronize image records with entry content (fast)")
	fill := fs.Bool("fill", false, "only fill missing image signatures (slow)")
	overwrite := fs.Bool("overwrite", false, "force recalculate image signatures even if already indexed")
	fs.Parse(args)

	if !*force && !*dryRun {
		fmt.Println("Warning: This operation will index images in entries and may take some time.")
		fmt.Println("Use --sync to only synchronize records (fast).")
		fmt.Println("Use --fill to only process missing images (slow).")
		fmt.Println("Use --overwrite to force recalculate image signatures even if already indexed.")
		fmt.Println("If neither --sync nor --fill is specified, both will be executed.")
		fmt.Println()
		fmt.Println("Use --force to actually execute the operation, or --dry-run to see what would happen.")
		fmt.Println()
		fs.Usage()
		return nil
	}

	if *dryRun {
		log.Println("DRY-RUN MODE: No changes will be saved to the database.")
	}

	// Default to both if neither is specified
	doSync := *sync || (!*sync && !*fill)
	doFill := *fill || (!*sync && !*fill)

	job := jobs.NewIndexImagesJob(application)

	if doSync {
		entries, err := application.Queries().ListAllEntries(ctx)
		if err != nil {
			return fmt.Errorf("failed to list entries: %w", err)
		}
		total := len(entries)
		log.Printf("Syncing images for %d entries...", total)

		const chunkSize = 1000
		for i := 0; i < total; i += chunkSize {
			end := i + chunkSize
			if end > total {
				end = total
			}
			chunk := entries[i:end]
			ids := make([]int64, len(chunk))
			for j, entry := range chunk {
				ids[j] = entry.ID
			}

			log.Printf("  [%d/%d] Syncing chunk of %d entries (last id:%d %s)", end, total, len(ids), chunk[len(chunk)-1].ID, chunk[len(chunk)-1].Title)
			if !*dryRun {
				if err := job.SyncImagesForEntries(ctx, ids); err != nil {
					log.Printf("  Error syncing images for chunk: %v", err)
				}
			}
		}
		log.Println("Syncing finished.")
	}

	if doFill {
		entryIDs, err := application.ImagesQueries().ListEntryIDsWithUnindexedImages(ctx)
		if err != nil {
			return fmt.Errorf("failed to list entries with unindexed images: %w", err)
		}
		total := len(entryIDs)
		log.Printf("Filling signatures for %d entries...", total)

		const chunkSize = 100 // Smaller chunk size for fill as it's heavy
		for i := 0; i < total; i += chunkSize {
			end := i + chunkSize
			if end > total {
				end = total
			}
			chunk := entryIDs[i:end]

			log.Printf("  [%d/%d] Filling chunk of %d entries (last id:%d)", end, total, len(chunk), chunk[len(chunk)-1])
			if !*dryRun {
				if err := job.FillImagesForEntries(ctx, chunk, *overwrite); err != nil {
					log.Printf("  Error filling images for chunk: %v", err)
				}
			}
		}
		log.Println("Filling finished.")
	}

	if *dryRun {
		log.Println("Dry-run finished. No changes were made.")
	} else {
		log.Println("Image indexing finished successfully.")
	}
	return nil
}
