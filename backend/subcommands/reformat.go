package subcommands

import (
	"context"
	"flag"
	"fmt"
	"log"
	"strconv"
	"strings"
	"time"

	"github.com/cho45/hanrangon/backend/app"
	"github.com/cho45/hanrangon/backend/formatter"
)

type int64ListFlag []int64

func (f *int64ListFlag) String() string {
	if f == nil {
		return ""
	}
	parts := make([]string, len(*f))
	for i, v := range *f {
		parts[i] = strconv.FormatInt(v, 10)
	}
	return strings.Join(parts, ",")
}

func (f *int64ListFlag) Set(value string) error {
	for _, raw := range strings.Split(value, ",") {
		s := strings.TrimSpace(raw)
		if s == "" {
			continue
		}
		id, err := strconv.ParseInt(s, 10, 64)
		if err != nil {
			return fmt.Errorf("invalid id %q: %w", s, err)
		}
		if id <= 0 {
			return fmt.Errorf("id must be positive: %d", id)
		}
		*f = append(*f, id)
	}
	return nil
}

func init() {
	Register(Definition{
		Name:        "reformat",
		Description: "Reformat all or specific entries",
		Run:         Reformat,
	})
}

func Reformat(ctx context.Context, application app.App, args []string) error {
	fs := flag.NewFlagSet("reformat", flag.ExitOnError)
	all := fs.Bool("all", false, "reformat all entries")
	prefix := fs.String("prefix", "", "path prefix to reformat")
	var ids int64ListFlag
	fs.Var(&ids, "id", "entry ID to reformat (repeatable, supports comma-separated values)")
	fs.Parse(args)

	targets := 0
	if *all {
		targets++
	}
	if *prefix != "" {
		targets++
	}
	if len(ids) > 0 {
		targets++
	}
	if targets != 1 {
		fmt.Println("Usage: hanrangon reformat [-all | -prefix PREFIX | -id ID[,ID...]]")
		fs.PrintDefaults()
		return nil
	}

	var query string
	var queryArgs []interface{}

	if *all {
		log.Println("Reformatting all entries...")
		query = "SELECT id, path, body, format FROM entries ORDER BY date DESC, created_at DESC"
	} else if *prefix != "" {
		log.Printf("Reformatting entries with prefix: %s...", *prefix)
		query = "SELECT id, path, body, format FROM entries WHERE path LIKE ? || '%' ORDER BY date DESC, created_at DESC"
		queryArgs = append(queryArgs, *prefix)
	} else {
		placeholders := make([]string, len(ids))
		for i, id := range ids {
			placeholders[i] = "?"
			queryArgs = append(queryArgs, id)
		}
		log.Printf("Reformatting entries with IDs: %s...", ids.String())
		query = fmt.Sprintf("SELECT id, path, body, format FROM entries WHERE id IN (%s) ORDER BY date DESC, created_at DESC", strings.Join(placeholders, ","))
	}

	rows, err := application.MainDB().QueryContext(ctx, query, queryArgs...)
	if err != nil {
		return fmt.Errorf("failed to query entries: %w", err)
	}
	type entryData struct {
		id     int64
		path   string
		body   string
		format string
	}
	var entries []entryData
	for rows.Next() {
		var d entryData
		if err := rows.Scan(&d.id, &d.path, &d.body, &d.format); err != nil {
			rows.Close()
			return fmt.Errorf("failed to scan entry: %w", err)
		}
		entries = append(entries, d)
	}
	rows.Close()

	processor, err := application.PostprocessBatch(ctx, 30*time.Minute)
	if err != nil {
		return fmt.Errorf("failed to start postprocess batch: %w", err)
	}
	defer func() { _ = processor.Close() }()

	count := 0
	for _, d := range entries {
		count++
		log.Printf("[%d/%d] Reformatting id:%d path:%s", count, len(entries), d.id, d.path)

		formattedBody, err := formatter.Format(d.body, d.format)
		if err != nil {
			log.Printf("  Error formatting entry %d: %v", d.id, err)
			continue
		}

		// BatchProcessor.Process に context と reporter を渡す
		// バッチ処理では個別の進捗報告は不要なので reporter は nil
		processedBody, err := processor.Process(ctx, formattedBody, nil)
		if err != nil {
			log.Printf("  Error postprocessing entry %d: %v", d.id, err)
		} else {
			formattedBody = processedBody
		}

		_, err = application.MainDB().ExecContext(ctx, "UPDATE entries SET formatted_body = ? WHERE id = ?", formattedBody, d.id)
		if err != nil {
			log.Printf("  Error updating entry %d: %v", d.id, err)
			continue
		}
	}

	log.Printf("Reformat completed. Processed %d entries.", count)
	return nil
}
