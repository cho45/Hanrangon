package subcommands

import (
	"bufio"
	"context"
	"flag"
	"fmt"
	"log"
	"os"
	"strings"
	"time"

	"github.com/cho45/hanrangon/backend/app"
)

func init() {
	Register(Definition{
		Name:        "gc-images",
		Description: "Garbage collect images in R2 that are not in the database",
		Run:         GCImages,
	})
}

func GCImages(ctx context.Context, application app.App, args []string) error {
	fs := flag.NewFlagSet("gc-images", flag.ExitOnError)
	listMode := fs.Bool("list", false, "Phase 1: List orphan images to a file")
	deleteMode := fs.Bool("delete", false, "Phase 2: Delete images listed in the file")
	inputFile := fs.String("file", "", "Input file for delete mode")
	force := fs.Bool("force", false, "Force execution of delete phase")
	fs.Parse(args)

	if !*listMode && !*deleteMode {
		fmt.Println("Usage: hanrangon gc-images [-list | -delete -file <path> -force]")
		fs.PrintDefaults()
		return nil
	}

	if *listMode {
		return runListPhase(ctx, application)
	}

	if *deleteMode {
		if *inputFile == "" {
			return fmt.Errorf("-file is required for delete mode")
		}
		if !*force {
			fmt.Println("Warning: This operation will delete images from storage.")
			fmt.Println("Use --force to actually execute the operation.")
			return nil
		}
		return runDeletePhase(ctx, application, *inputFile)
	}

	return nil
}

func runListPhase(ctx context.Context, application app.App) error {
	log.Println("Phase 1: Listing orphan images...")

	// 1. Get all image URIs from DB
	rows, err := application.ImagesDB().QueryContext(ctx, "SELECT uri FROM images")
	if err != nil {
		return fmt.Errorf("failed to query images: %w", err)
	}
	defer rows.Close()

	dbKeys := make(map[string]bool)
	for rows.Next() {
		var uri string
		if err := rows.Scan(&uri); err != nil {
			return fmt.Errorf("failed to scan uri: %w", err)
		}
		// Extract key from URI (e.g., https://.../entry/filename.jpg -> filename.jpg)
		parts := strings.Split(uri, "/entry/")
		if len(parts) > 1 {
			dbKeys[parts[1]] = true
		}
	}

	// 2. List all objects in storage
	storage := application.Storage()
	objects, err := storage.ListObjects(ctx, "")
	if err != nil {
		return fmt.Errorf("failed to list objects: %w", err)
	}

	// 3. Find orphans
	var orphans []app.StorageObject
	var totalSize int64
	for _, obj := range objects {
		if !dbKeys[obj.Key] {
			orphans = append(orphans, obj)
			totalSize += obj.Size
		}
	}

	if len(orphans) == 0 {
		log.Println("No orphan images found.")
		return nil
	}

	// 4. Save to file
	timestamp := time.Now().Format("20060102-150405")
	filename := fmt.Sprintf("%s-orphans.txt", timestamp)
	f, err := os.Create(filename)
	if err != nil {
		return fmt.Errorf("failed to create output file: %w", err)
	}
	defer f.Close()

	writer := bufio.NewWriter(f)
	for _, obj := range orphans {
		fmt.Fprintf(writer, "%s\t%d\n", obj.Key, obj.Size)
	}
	if err := writer.Flush(); err != nil {
		return fmt.Errorf("failed to flush writer: %w", err)
	}

	log.Printf("Found %d orphan images (Total: %d bytes).", len(orphans), totalSize)
	log.Printf("List saved to: %s", filename)
	log.Println("Review the file and run with -delete -file <filename> to remove them.")

	return nil
}

func runDeletePhase(ctx context.Context, application app.App, inputFile string) error {
	log.Printf("Phase 2: Deleting images listed in %s...", inputFile)

	f, err := os.Open(inputFile)
	if err != nil {
		return fmt.Errorf("failed to open input file: %w", err)
	}
	defer f.Close()

	storage := application.Storage()
	scanner := bufio.NewScanner(f)
	count := 0
	failed := 0

	for scanner.Scan() {
		line := scanner.Text()
		parts := strings.Split(line, "\t")
		if len(parts) == 0 {
			continue
		}
		key := parts[0]
		if key == "" {
			continue
		}

		log.Printf("Deleting: %s", key)
		if err := storage.Delete(ctx, key); err != nil {
			log.Printf("  Error deleting %s: %v", key, err)
			failed++
		} else {
			count++
		}
	}

	if err := scanner.Err(); err != nil {
		return fmt.Errorf("error reading input file: %w", err)
	}

	log.Printf("Delete phase completed. Deleted: %d, Failed: %d", count, failed)
	return nil
}
