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
	dryRun := fs.Bool("dry-run", false, "show what would be done without making changes")
	fs.Parse(args)

	if !*force && !*dryRun {
		fmt.Println("Warning: This operation will index all images in all entries and may take some time.")
		fmt.Println("Use --force to actually execute the operation, or --dry-run to see what would happen.")
		fmt.Println()
		fs.Usage()
		return nil
	}

	if *dryRun {
		log.Println("DRY-RUN MODE: No changes will be saved to the database.")
	}

	total, err := application.Queries().CountAllEntries(ctx)
	if err != nil {
		return fmt.Errorf("failed to count entries: %w", err)
	}

	log.Printf("Indexing images for %d entries...", total)

	entries, err := application.Queries().ListAllEntries(ctx)
	if err != nil {
		return fmt.Errorf("failed to list entries: %w", err)
	}

	job := jobs.NewIndexImagesJob(application)

	for i, entry := range entries {
		log.Printf("  [%d/%d] Processing id:%d %s", i+1, total, entry.ID, entry.Title)

		if !*dryRun {
			if err := job.IndexImagesForEntry(ctx, entry.ID); err != nil {
				log.Printf("  Error indexing images for entry %d: %v", entry.ID, err)
				continue
			}
		}
	}

	if *dryRun {
		log.Println("Dry-run finished. No changes were made.")
	} else {
		log.Println("Image indexing finished successfully.")
	}
	return nil
}
