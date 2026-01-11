package jobs

import (
	"context"
	"encoding/binary"
	"io"
	"math/bits"
	"os"
	"path/filepath"
	"testing"

	"github.com/cho45/hanrangon/app"
	"github.com/cho45/hanrangon/internal/testutil"
	"github.com/cho45/hanrangon/model"
)

func TestIndexImagesJob_SimilarityIntegration(t *testing.T) {
	// Setup databases
	dbs := testutil.SetupAllDBs(t)
	defer dbs.Close()
	db, tfidfDB, workerDB, imagesDB := dbs.Main, dbs.TFIDF, dbs.Worker, dbs.Images

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
	// In the new color bitmask implementation, we should use Jaccard similarity or bit intersection
	var sig1, sig2 []byte
	application.ImagesQueries().GetImage(ctx, id1)
	img1, _ := application.ImagesQueries().GetImage(ctx, id1)
	img2, _ := application.ImagesQueries().GetImage(ctx, id2)
	sig1 = img1.Sig
	sig2 = img2.Sig

	s1 := binary.BigEndian.Uint64(sig1)
	s2 := binary.BigEndian.Uint64(sig2)

	intersection := bits.OnesCount64(s1 & s2)
	union := bits.OnesCount64(s1 | s2)
	jaccard := float64(intersection) / float64(union)

	if jaccard != 1.0 {
		t.Errorf("expected perfect Jaccard similarity 1.0 for identical images, got %f (intersection:%d, union:%d)", jaccard, intersection, union)
	}

	// Check if they are found as similar in the query
	similar, err := application.ImagesQueries().ListSimilarImagesByImageIDs(ctx, []int64{id1})
	if err != nil {
		t.Fatal(err)
	}

	found := false
	for _, row := range similar {
		if row.ID == id2 {
			found = true
			// Score in ListSimilarImagesByImageIDs is just ngram match count,
			// which will be small but non-zero
			if row.Score == 0 {
				t.Errorf("expected non-zero ngram match score for identical image, got %d", row.Score)
			}
		}
	}

	if !found {
		t.Errorf("identical image %d was not found in similarity results for %d", id2, id1)
	}
}
