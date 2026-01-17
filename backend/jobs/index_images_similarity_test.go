package jobs

import (
	"context"
	"image"
	"image/color"
	"image/png"
	"os"
	"path/filepath"
	"testing"

	"github.com/cho45/hanrangon/backend/app"
	"github.com/cho45/hanrangon/backend/model"
	"github.com/cho45/hanrangon/backend/model/imagesdb"
	"github.com/cho45/hanrangon/backend/model/maindb"
	"github.com/cho45/hanrangon/backend/model/tfidfdb"
	"github.com/cho45/hanrangon/backend/model/workerdb"
	"github.com/cho45/hanrangon/backend/tfidf"
	"github.com/cho45/hanrangon/internal/testutil"
)

func createSolidTestImage(t *testing.T, path string, c color.RGBA) {
	f, err := os.Create(path)
	if err != nil {
		t.Fatalf("failed to create image file: %v", err)
	}
	defer f.Close()

	img := image.NewRGBA(image.Rect(0, 0, 64, 64))
	for y := 0; y < 64; y++ {
		for x := 0; x < 64; x++ {
			img.Set(x, y, c)
		}
	}
	if err := png.Encode(f, img); err != nil {
		t.Fatalf("failed to encode image: %v", err)
	}
}

func TestIndexImagesJob_SimilarityCache(t *testing.T) {
	dbs := testutil.SetupAllDBs(t)
	defer dbs.Close()
	db, tfidfDB, workerDB, imagesDB := dbs.Main, dbs.TFIDF, dbs.Worker, dbs.Images

	tmpDir := t.TempDir()
	config := app.LoadConfig()
	config.BaseURL = "http://localhost:5555"
	config.UploadURLPrefix = "/images/entry/"
	config.UploadDir = tmpDir

	mainDBWrapper := model.NewDatabase[maindb.Querier](db, func(tx model.DBTX) maindb.Querier { return maindb.New(tx) })
	tfidfDBWrapper := model.NewDatabase[tfidfdb.Querier](tfidfDB, func(tx model.DBTX) tfidfdb.Querier { return tfidfdb.New(tx) })
	workerDBWrapper := model.NewDatabase[workerdb.Querier](workerDB, func(tx model.DBTX) workerdb.Querier { return workerdb.New(tx) })
	imagesDBWrapper := model.NewDatabase[imagesdb.Querier](imagesDB, func(tx model.DBTX) imagesdb.Querier { return imagesdb.New(tx) })

	calc, _ := tfidf.NewCalculator(tfidfDB, tfidfDBWrapper.Q, db, mainDBWrapper.Q)
	sim := tfidf.NewSimilarityCalculator(tfidfDB, tfidfDBWrapper.Q)
	searcher := tfidf.NewSearcher(tfidfDB, tfidfDBWrapper.Q, calc)

	application := app.NewApp(config, mainDBWrapper, tfidfDBWrapper, workerDBWrapper, imagesDBWrapper, calc, sim, searcher, nil)
	job := NewIndexImagesJob(application)

	ctx := context.Background()

	// 1. 画像A（赤）を登録
	imgA := filepath.Join(tmpDir, "a.png")
	createSolidTestImage(t, imgA, color.RGBA{255, 0, 0, 255})
	entryID := int64(1)
	db.Exec(`INSERT INTO entries (id, title, body, formatted_body, path, format, date, created_at, modified_at)
		VALUES (?, 'T', 'B', '<img src="/images/entry/a.png">', 'p', 'M', '2026-01-01', '2026-01-01', '2026-01-01')`, entryID)

	job.SyncImagesForEntry(ctx, entryID)
	job.FillImagesForEntry(ctx, entryID, false)

	var idA int64
	imagesDB.QueryRow("SELECT id FROM images WHERE uri = '/images/entry/a.png'").Scan(&idA)

	// 2. 画像B（赤に近い色）を登録
	imgB := filepath.Join(tmpDir, "b.png")
	createSolidTestImage(t, imgB, color.RGBA{250, 5, 5, 255}) // 赤に近い
	entryID2 := int64(2)
	db.Exec(`INSERT INTO entries (id, title, body, formatted_body, path, format, date, created_at, modified_at)
		VALUES (?, 'T2', 'B2', '<img src="/images/entry/b.png">', 'p2', 'M', '2026-01-01', '2026-01-01', '2026-01-01')`, entryID2)

	job.SyncImagesForEntry(ctx, entryID2)
	job.FillImagesForEntry(ctx, entryID2, false)

	var idB int64
	imagesDB.QueryRow("SELECT id FROM images WHERE uri = '/images/entry/b.png'").Scan(&idB)

	// AのキャッシュにBがあるか、BのキャッシュにAがあるか確認（双方向）
	var count int
	imagesDB.QueryRow("SELECT COUNT(*) FROM similar_images WHERE image_id = ? AND similar_image_id = ?", idA, idB).Scan(&count)
	if count != 1 {
		t.Errorf("Cache A -> B not found")
	}
	imagesDB.QueryRow("SELECT COUNT(*) FROM similar_images WHERE image_id = ? AND similar_image_id = ?", idB, idA).Scan(&count)
	if count != 1 {
		t.Errorf("Cache B -> A not found")
	}

	// 3. 画像C（青：似ていない）を登録
	imgC := filepath.Join(tmpDir, "c.png")
	createSolidTestImage(t, imgC, color.RGBA{0, 0, 255, 255}) // 青
	entryID3 := int64(3)
	db.Exec(`INSERT INTO entries (id, title, body, formatted_body, path, format, date, created_at, modified_at)
		VALUES (?, 'T3', 'B3', '<img src="/images/entry/c.png">', 'p3', 'M', '2026-01-01', '2026-01-01', '2026-01-01')`, entryID3)

	job.SyncImagesForEntry(ctx, entryID3)
	job.FillImagesForEntry(ctx, entryID3, false)

	var idC int64
	imagesDB.QueryRow("SELECT id FROM images WHERE uri = '/images/entry/c.png'").Scan(&idC)

	// CのキャッシュにA, Bがないことを確認
	imagesDB.QueryRow("SELECT COUNT(*) FROM similar_images WHERE image_id = ? AND similar_image_id = ?", idC, idA).Scan(&count)
	if count != 0 {
		t.Errorf("Cache C -> A should not exist")
	}

	// 4. 画像Bを削除
	db.Exec("UPDATE entries SET formatted_body = '' WHERE id = ?", entryID2)
	job.SyncImagesForEntry(ctx, entryID2)

	// AのキャッシュからBが消えていることを確認
	imagesDB.QueryRow("SELECT COUNT(*) FROM similar_images WHERE image_id = ? AND similar_image_id = ?", idA, idB).Scan(&count)
	if count != 0 {
		t.Errorf("Cache A -> B should be deleted")
	}
	imagesDB.QueryRow("SELECT COUNT(*) FROM similar_images WHERE similar_image_id = ?", idB).Scan(&count)
	if count != 0 {
		t.Errorf("All caches pointing to B should be deleted")
	}
}
