package subcommands

import (
	"context"
	"flag"
	"fmt"
	"log"

	"github.com/cho45/hanrangon/backend/app"
	"github.com/cho45/hanrangon/backend/jobs"
	"github.com/cho45/hanrangon/backend/model/imagesdb"
)

func init() {
	Register(Definition{
		Name:        "recalc-image-similarity",
		Description: "Recalculate image similarity scores and update cache",
		Run:         RecalcImageSimilarity,
	})
}

func RecalcImageSimilarity(ctx context.Context, application app.App, args []string) error {
	fs := flag.NewFlagSet("recalc-image-similarity", flag.ExitOnError)
	force := fs.Bool("force", false, "force execution of recalculation")
	dryRun := fs.Bool("dry-run", false, "show what would be done without making changes")
	fs.Parse(args)

	if !*force && !*dryRun {
		fmt.Println("Warning: This operation will recalculate similarity scores for all images and may take some time.")
		fmt.Println("Use --force to actually execute the operation, or --dry-run to see what would happen.")
		fmt.Println()
		fs.Usage()
		return nil
	}

	if *dryRun {
		log.Println("DRY-RUN MODE: No changes will be saved to the database.")
	}

	// 1. 全画像IDを取得
	rows, err := application.ImagesDB().QueryContext(ctx, "SELECT id FROM images WHERE length(sig) > 0 ORDER BY id ASC")
	if err != nil {
		return fmt.Errorf("failed to query image IDs: %w", err)
	}
	defer rows.Close()

	var imageIDs []int64
	for rows.Next() {
		var id int64
		if err := rows.Scan(&id); err != nil {
			return err
		}
		imageIDs = append(imageIDs, id)
	}
	if err := rows.Err(); err != nil {
		return err
	}

	total := len(imageIDs)
	log.Printf("Starting recalculation for %d images...", total)

	if !*dryRun {
		// キャッシュを全消去
		if err := application.ImagesDB().Q.DeleteAllSimilarImages(ctx); err != nil {
			return fmt.Errorf("failed to clear cache: %w", err)
		}
	}

	job := jobs.NewIndexImagesJob(application)

	// バッチサイズ
	const batchSize = 100
	for i := 0; i < total; i += batchSize {
		end := i + batchSize
		if end > total {
			end = total
		}
		chunk := imageIDs[i:end]

		log.Printf("  [%d/%d] Processing batch...", end, total)

		if !*dryRun {
			tx, err := application.ImagesDB().BeginTx(ctx, nil)
			if err != nil {
				return err
			}
			qtx := imagesdb.New(tx)

			for _, id := range chunk {
				if err := job.UpdateSimilarImagesCache(ctx, qtx, id); err != nil {
					tx.Rollback()
					return fmt.Errorf("failed to update cache for image %d: %w", id, err)
				}
			}

			if err := tx.Commit(); err != nil {
				return err
			}
		}
	}

	log.Println("Recalculation finished successfully.")
	return nil
}
