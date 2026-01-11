package jobs

import (
	"context"
	"io"
	"os"
	"path/filepath"
	"testing"

	"github.com/cho45/hanrangon/app"
	"github.com/cho45/hanrangon/model"
)

func TestIndexImagesJob_SimilarityIntegration(t *testing.T) {
	// Setup databases
	db, tfidfDB, workerDB, imagesDB := setupTestDB(t)
	defer db.Close()
	defer tfidfDB.Close()
	defer workerDB.Close()
	defer imagesDB.Close()

	tmpDir := t.TempDir()
	config := &app.Config{
		BaseURL:         "http://localhost:5555",
		UploadURLPrefix: "/images/upload/",
		UploadDir:       tmpDir,
	}

	application := app.NewApp(config, db, tfidfDB, workerDB, imagesDB, nil, nil, nil, nil)
	job := NewIndexImagesJob(application)
	ctx := context.Background()

	// 1. Prepare test fixtures
	// Copy apple-touch-icon.png to two different paths in uploadDir
	// Path from 'jobs' directory during test execution
	srcPath := filepath.Join("..", "static", "images", "apple-touch-icon.png")

	image1Rel := "icon1.png"
	image2Rel := "icon2.png"
	image1Path := filepath.Join(tmpDir, image1Rel)
	image2Path := filepath.Join(tmpDir, image2Rel)

	copyFile := func(src, dst string) {
		s, err := os.Open(src)
		if err != nil {
			t.Fatalf("failed to open src %s: %v", src, err)
		}
		defer s.Close()
		d, err := os.Create(dst)
		if err != nil {
			t.Fatalf("failed to create dst %s: %v", dst, err)
		}
		defer d.Close()
		if _, err := io.Copy(d, s); err != nil {
			t.Fatalf("failed to copy: %v", err)
		}
	}

	copyFile(srcPath, image1Path)
	copyFile(srcPath, image2Path)

	// 2. Insert image records
	entryID := int64(100)
	_, err := db.Exec("INSERT INTO entries (id, title, body, formatted_body, path, date, format, summary, image_url, created_at, modified_at) VALUES (?, 'Test', 'Body', 'Body', 'test', '2026-01-11', 'Markdown', '', '', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)", entryID)
	if err != nil {
		t.Fatal(err)
	}

	img1URI := config.UploadURLPrefix + image1Rel
	img2URI := config.UploadURLPrefix + image2Rel

	id1, err := application.ImagesQueries().CreateImage(ctx, model.CreateImageParams{
		Uri:     img1URI,
		EntryID: entryID,
		Sig:     []byte{},
	})
	if err != nil {
		t.Fatal(err)
	}

	id2, err := application.ImagesQueries().CreateImage(ctx, model.CreateImageParams{
		Uri:     img2URI,
		EntryID: entryID,
		Sig:     []byte{},
	})
	if err != nil {
		t.Fatal(err)
	}

	// 3. Run indexing
	err = job.FillImagesForEntry(ctx, entryID, false)
	if err != nil {
		t.Fatalf("indexing failed: %v", err)
	}

	// 4. Verify similarity
	similar, err := application.ImagesQueries().ListSimilarImagesByImageIDs(ctx, []int64{id1})
	if err != nil {
		t.Fatal(err)
	}

	found := false
	for _, row := range similar {
		if row.ID == id2 {
			found = true
			if row.Score != 49 {
				t.Errorf("expected perfect score 49 for identical image, got %d", row.Score)
			}
		}
	}

	if !found {
		t.Errorf("identical image %d was not found in similarity results for %d", id2, id1)
		// Debug: check what was found
		for _, row := range similar {
			t.Logf("Found similar: ID=%d, Score=%d, URI=%s", row.ID, row.Score, row.Uri)
		}
	}
}
