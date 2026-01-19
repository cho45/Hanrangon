package subcommands

import (
	"context"
	"database/sql"
	"flag"
	"fmt"
	"log"

	"github.com/cho45/hanrangon/backend/app"
	"github.com/cho45/hanrangon/backend/view"
)

func init() {
	Register(Definition{
		Name:        "recalc-metadata",
		Description: "Recalculate metadata (summary and image_url) for entries",
		Run:         RecalcMetadata,
	})
}

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
		query = "SELECT id FROM entries WHERE id = ?"
		queryArgs = append(queryArgs, *id)
	} else {
		log.Println("Targeting all entries...")
		query = "SELECT id FROM entries ORDER BY id DESC"
	}

	// 1. まず ID だけを全て取得する。
	// これにより、読み取り用の rows を開いたまま更新を行うことによるデッドロック/ロック競合を避ける。
	// ID だけであれば全件保持してもメモリ消費は少ない。
	rows, err := application.MainDB().QueryContext(ctx, query, queryArgs...)
	if err != nil {
		return fmt.Errorf("failed to query entry IDs: %w", err)
	}
	defer rows.Close()

	var entryIDs []int64
	for rows.Next() {
		var eid int64
		if err := rows.Scan(&eid); err != nil {
			log.Printf("  Error scanning entry ID: %v", err)
			continue
		}
		entryIDs = append(entryIDs, eid)
	}
	rows.Close()

	total := len(entryIDs)
	updated := 0
	const batchSize = 100

	// 2. ID のリストに基づいてバッチ処理を行う。
	// 各バッチごとにトランザクションを開始し、その中でデータの取得と更新を行う。
	for i := 0; i < total; i += batchSize {
		end := i + batchSize
		if end > total {
			end = total
		}
		chunk := entryIDs[i:end]

		var tx *sql.Tx
		if !*dryRun {
			tx, err = application.MainDB().BeginTx(ctx, nil)
			if err != nil {
				return fmt.Errorf("failed to begin transaction: %w", err)
			}
		}

		for _, eid := range chunk {
			var path, formattedBody string
			// トランザクション内（または dry-run の場合は DB 直接）でデータを取得
			var rowDB interface {
				QueryRowContext(ctx context.Context, query string, args ...interface{}) *sql.Row
			} = application.MainDB()
			if !*dryRun {
				rowDB = tx
			}

			err := rowDB.QueryRowContext(ctx, "SELECT path, formatted_body FROM entries WHERE id = ?", eid).Scan(&path, &formattedBody)
			if err != nil {
				log.Printf("  Error fetching entry %d: %v", eid, err)
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
			} else {
				log.Printf("  [dry-run] Would update id:%d path:%s summary:%.20q... image_url:%s", eid, path, summary, imageURL)
				updated++
			}
		}

		if !*dryRun {
			if err := tx.Commit(); err != nil {
				return fmt.Errorf("failed to commit batch: %w", err)
			}
			log.Printf("Processed %d/%d entries...", end, total)
		}
	}

	log.Printf("RecalcMetadata completed. Checked %d entries, updated %d entries.", total, updated)
	return nil
}
