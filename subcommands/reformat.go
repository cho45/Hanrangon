package subcommands

import (
	"context"
	"flag"
	"fmt"
	"log"

	"github.com/cho45/hanrangon/app"
	"github.com/cho45/hanrangon/formatter"
)

func Reformat(ctx context.Context, application app.App, args []string) error {
	fs := flag.NewFlagSet("reformat", flag.ExitOnError)
	all := fs.Bool("all", false, "reformat all entries")
	prefix := fs.String("prefix", "", "path prefix to reformat")
	fs.Parse(args)

	if !*all && *prefix == "" {
		fmt.Println("Usage: hanrangon reformat [-all | -prefix PREFIX]")
		fs.PrintDefaults()
		return nil
	}

	var query string
	var queryArgs []interface{}

	if *all {
		log.Println("Reformatting all entries...")
		query = "SELECT id, path, body, format FROM entries ORDER BY date DESC, created_at DESC"
	} else {
		log.Printf("Reformatting entries with prefix: %s...", *prefix)
		query = "SELECT id, path, body, format FROM entries WHERE path LIKE ? || '%' ORDER BY date DESC, created_at DESC"
		queryArgs = append(queryArgs, *prefix)
	}

	rows, err := application.DB().QueryContext(ctx, query, queryArgs...)
	if err != nil {
		return fmt.Errorf("failed to query entries: %w", err)
	}
	defer rows.Close()

	count := 0
	for rows.Next() {
		count++
		var id int64
		var path, body, format string
		err := rows.Scan(&id, &path, &body, &format)
		if err != nil {
			log.Printf("  Error scanning entry: %v", err)
			continue
		}

		log.Printf("[%d] Reformatting id:%d path:%s", count, id, path)

		formattedBody, err := formatter.Format(body, format)
		if err != nil {
			log.Printf("  Error formatting entry %d: %v", id, err)
			continue
		}

		processedBody, err := application.Postprocess(ctx, formattedBody)
		if err != nil {
			log.Printf("  Error postprocessing entry %d: %v", id, err)
		} else {
			formattedBody = processedBody
		}

		_, err = application.DB().ExecContext(ctx, "UPDATE entries SET formatted_body = ? WHERE id = ?", formattedBody, id)
		if err != nil {
			log.Printf("  Error updating entry %d: %v", id, err)
			continue
		}
	}

	if err := rows.Err(); err != nil {
		return fmt.Errorf("error during row iteration: %w", err)
	}

	log.Printf("Reformat completed. Processed %d entries.", count)
	return nil
}
