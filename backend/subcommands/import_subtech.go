package subcommands

import (
	"context"
	"database/sql"
	"encoding/csv"
	"flag"
	"fmt"
	"io"
	"log"
	"os"
	"path/filepath"
	"regexp"
	"sort"
	"strconv"
	"strings"
	"time"

	"github.com/cho45/hanrangon/backend/app"
	"github.com/cho45/hanrangon/backend/formatter"
	"github.com/cho45/hanrangon/backend/model/maindb"
	"github.com/cho45/hanrangon/backend/view"
)

const insertSubtechEntrySQL = `INSERT INTO entries (
	title, body, formatted_body, summary, image_url, path, format, date, created_at, modified_at, publish_at, status
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`

const selectCreatedAtByDateSQL = `SELECT created_at FROM entries WHERE date = ?`

var subtechSectionHeader = regexp.MustCompile(`(?m)^\*(\d{10})\*(.*)$`)

type subtechEntry struct {
	Title        string
	Body         string
	Date         string
	Path         string
	CreatedAt    time.Time
	ModifiedAt   time.Time
	SourceCSVRow int
	SourcePart   int
}

func init() {
	Register(Definition{
		Name:        "import-subtech",
		Description: "Import subtech CSV into entries table",
		Run:         ImportSubtech,
	})
}

func ImportSubtech(ctx context.Context, application app.App, args []string) error {
	fs := flag.NewFlagSet("import-subtech", flag.ExitOnError)
	file := fs.String("file", "subtech-cho45.csv", "path to source csv (relative to base_dir by default)")
	dryRun := fs.Bool("dry-run", false, "parse and validate only, no database writes")
	wetRun := fs.Bool("wet-run", false, "actually execute import")
	if err := fs.Parse(args); err != nil {
		return err
	}

	if *dryRun && *wetRun {
		return fmt.Errorf("--dry-run and --wet-run cannot be used together")
	}

	if !*dryRun && !*wetRun {
		fmt.Println("Warning: This operation will import entries from CSV into the database.")
		fmt.Println("Use --wet-run to actually execute the operation, or --dry-run to validate parsing only.")
		fmt.Println()
		fmt.Println("Usage: hanrangon import-subtech [-file PATH] [-dry-run | -wet-run]")
		fs.PrintDefaults()
		return nil
	}

	csvPath := resolveImportPath(application.Config().BaseDir, *file)
	entries, err := parseSubtechCSV(csvPath)
	if err != nil {
		return err
	}
	parsedCount := len(entries)
	if parsedCount == 0 {
		log.Printf("no entries found in %s", csvPath)
		return nil
	}

	tx, err := application.MainDB().BeginImmediate(ctx)
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback()

	existingTimestamps, err := loadExistingTimestampSet(ctx, tx, entries)
	if err != nil {
		return err
	}
	entries, skippedByTimestamp := filterSubtechEntriesByTimestamp(entries, existingTimestamps)

	log.Printf("parsed %d entries from %s", parsedCount, csvPath)
	if skippedByTimestamp > 0 {
		log.Printf("skipped %d entries due to existing/duplicate timestamps", skippedByTimestamp)
	}
	if len(entries) == 0 {
		log.Printf("no new entries to import")
		return nil
	}

	baseCounters, err := loadExistingPathCounters(ctx, tx.Q, entries)
	if err != nil {
		return err
	}
	assignSubtechPaths(entries, baseCounters)

	log.Printf("to import: %d entries", len(entries))
	log.Printf("date range: %s .. %s", entries[0].Date, entries[len(entries)-1].Date)
	if *dryRun {
		return nil
	}

	processor, err := application.PostprocessBatch(ctx, 30*time.Minute)
	if err != nil {
		return fmt.Errorf("failed to start postprocess batch: %w", err)
	}
	defer func() { _ = processor.Close() }()

	for i := range entries {
		e := entries[i]
		entryURL := buildEntryURL(application.Config().BaseURL, e.Path)
		title := decorateSubtechTitle(e.Title)
		formatted, err := formatter.Format(e.Body, "Hatena")
		if err != nil {
			return fmt.Errorf("format failed at csv_row=%d part=%d path=%s url=%s: %w", e.SourceCSVRow, e.SourcePart, e.Path, entryURL, err)
		}

		processed, err := processor.Process(ctx, formatted, nil)
		if err != nil {
			log.Printf("postprocess failed at csv_row=%d part=%d path=%s url=%s: %v (falling back to formatted body)", e.SourceCSVRow, e.SourcePart, e.Path, entryURL, err)
			processed = formatted
		}
		summary, imageURL := view.ExtractSummaryAndFirstImage(processed, 70)

		_, err = tx.ExecContext(ctx, insertSubtechEntrySQL,
			title,
			e.Body,
			processed,
			summary,
			imageURL,
			e.Path,
			"Hatena",
			e.Date,
			e.CreatedAt,
			e.ModifiedAt,
			nil,
			string(maindb.StatusPublic),
		)
		if err != nil {
			return fmt.Errorf("insert failed at csv_row=%d part=%d path=%s url=%s: %w", e.SourceCSVRow, e.SourcePart, e.Path, entryURL, err)
		}

		if (i+1)%100 == 0 || i+1 == len(entries) {
			log.Printf("imported %d/%d (last path=%s url=%s)", i+1, len(entries), e.Path, entryURL)
		}
	}

	if err := tx.Commit(); err != nil {
		return fmt.Errorf("failed to commit import transaction: %w", err)
	}

	log.Printf("import completed: inserted %d entries (skipped=%d)", len(entries), skippedByTimestamp)
	return nil
}

func resolveImportPath(baseDir string, path string) string {
	if filepath.IsAbs(path) {
		return filepath.Clean(path)
	}
	return filepath.Join(baseDir, path)
}

func parseSubtechCSV(path string) ([]subtechEntry, error) {
	f, err := os.Open(path)
	if err != nil {
		return nil, fmt.Errorf("failed to open csv %s: %w", path, err)
	}
	defer f.Close()

	r := csv.NewReader(f)
	header, err := r.Read()
	if err == io.EOF {
		return nil, nil
	}
	if err != nil {
		return nil, fmt.Errorf("failed to read csv header: %w", err)
	}

	dateIndex := -1
	textIndex := -1
	for i, col := range header {
		switch strings.TrimSpace(strings.ToLower(col)) {
		case "date":
			dateIndex = i
		case "text":
			textIndex = i
		}
	}
	if dateIndex < 0 || textIndex < 0 {
		return nil, fmt.Errorf("required columns not found (date=%v text=%v)", dateIndex >= 0, textIndex >= 0)
	}

	var entries []subtechEntry
	csvRow := 1
	for {
		record, err := r.Read()
		if err == io.EOF {
			break
		}
		if err != nil {
			return nil, fmt.Errorf("failed to read csv row %d: %w", csvRow+1, err)
		}
		csvRow++

		rowDate := strings.TrimSpace(getField(record, dateIndex))
		text := getField(record, textIndex)
		if strings.TrimSpace(text) == "" {
			continue
		}

		parsed, err := parseSubtechTextSections(text, rowDate, csvRow)
		if err != nil {
			return nil, err
		}
		entries = append(entries, parsed...)
	}

	sort.SliceStable(entries, func(i, j int) bool {
		if entries[i].CreatedAt.Equal(entries[j].CreatedAt) {
			if entries[i].SourceCSVRow == entries[j].SourceCSVRow {
				return entries[i].SourcePart < entries[j].SourcePart
			}
			return entries[i].SourceCSVRow < entries[j].SourceCSVRow
		}
		return entries[i].CreatedAt.Before(entries[j].CreatedAt)
	})
	assignSubtechPaths(entries, nil)
	return entries, nil
}

func getField(record []string, index int) string {
	if index < 0 || index >= len(record) {
		return ""
	}
	return record[index]
}

func parseSubtechTextSections(text string, rowDate string, csvRow int) ([]subtechEntry, error) {
	matches := subtechSectionHeader.FindAllStringSubmatchIndex(text, -1)
	if len(matches) == 0 {
		return parseSubtechFallback(text, rowDate, csvRow)
	}

	entries := make([]subtechEntry, 0, len(matches))
	for i, m := range matches {
		tsText := text[m[2]:m[3]]
		ts, err := strconv.ParseInt(tsText, 10, 64)
		if err != nil {
			return nil, fmt.Errorf("invalid timestamp at csv row %d: %w", csvRow, err)
		}
		createdAt := time.Unix(ts, 0).In(app.APP_TZ)

		title := strings.TrimSpace(text[m[4]:m[5]])
		bodyStart := m[1]
		if bodyStart < len(text) && text[bodyStart] == '\r' {
			bodyStart++
		}
		if bodyStart < len(text) && text[bodyStart] == '\n' {
			bodyStart++
		}
		bodyEnd := len(text)
		if i+1 < len(matches) {
			bodyEnd = matches[i+1][0]
		}

		body := strings.Trim(text[bodyStart:bodyEnd], "\r\n")
		entries = append(entries, subtechEntry{
			Title:        title,
			Body:         body,
			Date:         createdAt.Format("2006-01-02"),
			CreatedAt:    createdAt,
			ModifiedAt:   createdAt,
			SourceCSVRow: csvRow,
			SourcePart:   i + 1,
		})
	}
	return entries, nil
}

func parseSubtechFallback(text string, rowDate string, csvRow int) ([]subtechEntry, error) {
	day, err := time.ParseInLocation("2006-01-02", rowDate, app.APP_TZ)
	if err != nil {
		return nil, fmt.Errorf("invalid date at csv row %d (%s): %w", csvRow, rowDate, err)
	}

	cleaned := strings.TrimSpace(text)
	if strings.HasPrefix(cleaned, "><!--") && strings.HasSuffix(cleaned, "--><") {
		cleaned = strings.TrimSpace(strings.TrimSuffix(strings.TrimPrefix(cleaned, "><!--"), "--><"))
	}

	title := ""
	body := cleaned
	if strings.HasPrefix(cleaned, "*") {
		header := cleaned
		rest := ""
		if nl := strings.IndexByte(cleaned, '\n'); nl >= 0 {
			header = cleaned[:nl]
			rest = cleaned[nl+1:]
		}
		title = strings.TrimSpace(strings.TrimPrefix(header, "*"))
		body = strings.Trim(rest, "\r\n")
	}

	return []subtechEntry{
		{
			Title:        title,
			Body:         body,
			Date:         day.Format("2006-01-02"),
			CreatedAt:    day,
			ModifiedAt:   day,
			SourceCSVRow: csvRow,
			SourcePart:   1,
		},
	}, nil
}

func assignSubtechPaths(entries []subtechEntry, initial map[string]int) {
	counters := map[string]int{}
	for date, n := range initial {
		counters[date] = n
	}

	for i := range entries {
		d := entries[i].Date
		counters[d]++
		entries[i].Path = strings.ReplaceAll(d, "-", "/") + "/" + strconv.Itoa(counters[d])
	}
}

func loadExistingPathCounters(ctx context.Context, q maindb.Querier, entries []subtechEntry) (map[string]int, error) {
	dateSet := map[string]struct{}{}
	for _, e := range entries {
		dateSet[e.Date] = struct{}{}
	}

	counters := map[string]int{}
	for date := range dateSet {
		paths, err := q.ListPathsByDate(ctx, date)
		if err != nil {
			return nil, fmt.Errorf("failed to list existing paths for date %s: %w", date, err)
		}

		maxN := 0
		prefix := strings.ReplaceAll(date, "-", "/") + "/"
		for _, p := range paths {
			if !strings.HasPrefix(p, prefix) {
				continue
			}
			n, err := strconv.Atoi(strings.TrimPrefix(p, prefix))
			if err != nil {
				continue
			}
			if n > maxN {
				maxN = n
			}
		}
		counters[date] = maxN
	}

	return counters, nil
}

type subtechTimestampQueryer interface {
	QueryContext(context.Context, string, ...interface{}) (*sql.Rows, error)
}

func loadExistingTimestampSet(ctx context.Context, q subtechTimestampQueryer, entries []subtechEntry) (map[int64]struct{}, error) {
	dateSet := map[string]struct{}{}
	for _, e := range entries {
		dateSet[e.Date] = struct{}{}
	}

	timestamps := map[int64]struct{}{}
	for date := range dateSet {
		rows, err := q.QueryContext(ctx, selectCreatedAtByDateSQL, date)
		if err != nil {
			return nil, fmt.Errorf("failed to list existing timestamps for date %s: %w", date, err)
		}
		for rows.Next() {
			var createdAt time.Time
			if err := rows.Scan(&createdAt); err != nil {
				rows.Close()
				return nil, fmt.Errorf("failed to scan existing timestamp for date %s: %w", date, err)
			}
			timestamps[createdAt.Unix()] = struct{}{}
		}
		if err := rows.Err(); err != nil {
			rows.Close()
			return nil, fmt.Errorf("failed while reading existing timestamps for date %s: %w", date, err)
		}
		rows.Close()
	}

	return timestamps, nil
}

func filterSubtechEntriesByTimestamp(entries []subtechEntry, existing map[int64]struct{}) ([]subtechEntry, int) {
	if len(entries) == 0 {
		return entries, 0
	}

	seen := make(map[int64]struct{}, len(existing)+len(entries))
	for ts := range existing {
		seen[ts] = struct{}{}
	}

	filtered := make([]subtechEntry, 0, len(entries))
	skipped := 0
	for _, e := range entries {
		ts := e.CreatedAt.Unix()
		if _, ok := seen[ts]; ok {
			skipped++
			continue
		}
		seen[ts] = struct{}{}
		filtered = append(filtered, e)
	}

	return filtered, skipped
}

func buildEntryURL(baseURL string, path string) string {
	cleanPath := strings.TrimLeft(path, "/")
	if baseURL == "" {
		return "/" + cleanPath
	}
	return strings.TrimRight(baseURL, "/") + "/" + cleanPath
}

func decorateSubtechTitle(title string) string {
	cleanTitle := strings.TrimSpace(title)
	if cleanTitle == "" {
		return "[subtech]"
	}
	return "[subtech] " + cleanTitle
}
