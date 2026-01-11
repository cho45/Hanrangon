package jobs

import (
	"context"
	"encoding/binary"
	"encoding/json"
	"fmt"
	"image"
	_ "image/gif"
	_ "image/jpeg"
	_ "image/png"
	"net/url"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/cho45/hanrangon/app"
	"github.com/cho45/hanrangon/model"
	"github.com/corona10/goimagehash"
	"golang.org/x/net/html"
)

type IndexImagesJob struct {
	app app.App
}

func NewIndexImagesJob(a app.App) *IndexImagesJob {
	return &IndexImagesJob{
		app: a,
	}
}

func (j *IndexImagesJob) Name() string {
	return "IndexImages"
}

// Timeout returns the maximum execution time for this job
// Image processing can take time, so set to 3 minutes
func (j *IndexImagesJob) Timeout() time.Duration {
	return 3 * time.Minute
}

type IndexImagesArg struct {
	EntryID int64 `json:"entry_id"`
}

func (j *IndexImagesJob) extractImageURLs(htmlStr string) []string {
	var urls []string
	seen := make(map[string]bool)

	tokenizer := html.NewTokenizer(strings.NewReader(htmlStr))
	for {
		tokenType := tokenizer.Next()
		if tokenType == html.ErrorToken {
			break
		}
		if tokenType == html.StartTagToken || tokenType == html.SelfClosingTagToken {
			token := tokenizer.Token()
			if token.Data == "img" {
				for _, attr := range token.Attr {
					if attr.Key == "src" {
						u := attr.Val
						if !seen[u] {
							urls = append(urls, u)
							seen[u] = true
						}
						break
					}
				}
			}
		}
	}
	return urls
}

func (j *IndexImagesJob) Execute(ctx context.Context, arg json.RawMessage) error {
	var a IndexImagesArg
	if err := json.Unmarshal(arg, &a); err != nil {
		return fmt.Errorf("failed to unmarshal arg: %w", err)
	}

	if err := j.SyncImagesForEntry(ctx, a.EntryID); err != nil {
		return fmt.Errorf("failed to sync images: %w", err)
	}

	return j.FillImagesForEntry(ctx, a.EntryID)
}

func (j *IndexImagesJob) SyncImagesForEntry(ctx context.Context, entryID int64) error {
	entry, err := j.app.Queries().GetEntryById(ctx, entryID)
	if err != nil {
		return err
	}

	// Find all image URLs in current entry using robust HTML parser
	urls := j.extractImageURLs(entry.FormattedBody)
	currentURLs := make(map[string]bool)
	for _, u := range urls {
		currentURLs[u] = true
	}

	// Get existing images from DB
	existingImages, err := j.app.ImagesQueries().ListImagesByEntryID(ctx, entryID)
	if err != nil {
		return err
	}

	// Calculate diff
	var idsToDelete []int64
	existingURLs := make(map[string]bool)
	for _, img := range existingImages {
		if !currentURLs[img.Uri] {
			idsToDelete = append(idsToDelete, img.ID)
		} else {
			existingURLs[img.Uri] = true
		}
	}

	var urlsToAdd []string
	for url := range currentURLs {
		if !existingURLs[url] {
			urlsToAdd = append(urlsToAdd, url)
		}
	}

	// Apply changes in transaction
	tx, err := j.app.ImagesDB().BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()
	qtx := j.app.ImagesQueries().WithTx(tx)

	if len(idsToDelete) > 0 {
		if err := qtx.DeleteNgramsByImageIDs(ctx, idsToDelete); err != nil {
			return err
		}
		if err := qtx.DeleteImagesByIDs(ctx, idsToDelete); err != nil {
			return err
		}
	}

	for _, u := range urlsToAdd {
		_, err := qtx.CreateImage(ctx, model.CreateImageParams{
			Uri:     u,
			EntryID: entryID,
			Sig:     []byte{}, // Empty signature for new images
		})
		if err != nil {
			return err
		}
	}

	return tx.Commit()
}

func (j *IndexImagesJob) FillImagesForEntry(ctx context.Context, entryID int64) error {
	images, err := j.app.ImagesQueries().ListImagesByEntryID(ctx, entryID)
	if err != nil {
		return err
	}

	for _, imgRecord := range images {
		if len(imgRecord.Sig) > 0 {
			continue // Already indexed
		}

		var sig []byte
		var hash *goimagehash.ImageHash

		img, err := j.loadImage(imgRecord.Uri)
		if err == nil {
			hash, err = goimagehash.PerceptionHash(img)
			if err == nil {
				sig = make([]byte, 8)
				binary.BigEndian.PutUint64(sig, hash.GetHash())
			}
		}

		if sig == nil {
			sig = []byte{} // Mark as tried but failed with empty blob
		}

		// Update signature and n-grams in a small transaction for each image
		tx, err := j.app.ImagesDB().BeginTx(ctx, nil)
		if err != nil {
			return err
		}
		qtx := j.app.ImagesQueries().WithTx(tx)

		if err := qtx.UpdateImageSig(ctx, model.UpdateImageSigParams{
			Sig: sig,
			ID:  imgRecord.ID,
		}); err != nil {
			tx.Rollback()
			return err
		}

		if hash != nil {
			// Clear any existing ngrams just in case (though should be empty)
			if err := qtx.DeleteNgramsByImageID(ctx, imgRecord.ID); err != nil {
				tx.Rollback()
				return err
			}

			h := hash.GetHash()
			for i := uint16(0); i < 4; i++ {
				segment := uint16((h >> (i * 16)) & 0xFFFF)
				word := make([]byte, 4)
				binary.BigEndian.PutUint16(word[0:2], i)       // Position
				binary.BigEndian.PutUint16(word[2:4], segment) // Value

				if err := qtx.CreateNgram(ctx, model.CreateNgramParams{
					ImageID: imgRecord.ID,
					Word:    word,
				}); err != nil {
					tx.Rollback()
					return err
				}
			}
		}

		if err := tx.Commit(); err != nil {
			return err
		}
	}

	return nil
}

func (j *IndexImagesJob) loadImage(rawURL string) (image.Image, error) {
	uploadURLPrefix := j.app.Config().UploadURLPrefix
	uploadDir := j.app.Config().UploadDir
	baseURL := j.app.Config().BaseURL

	// 1. Handle local paths
	if strings.HasPrefix(rawURL, uploadURLPrefix) {
		filename := strings.TrimPrefix(rawURL, uploadURLPrefix)
		unescaped, err := url.PathUnescape(filename)
		if err == nil {
			filename = unescaped
		}
		path := filepath.Join(uploadDir, filename)
		f, err := os.Open(path)
		if err != nil {
			return nil, err
		}
		defer f.Close()
		img, _, err := image.Decode(f)
		return img, err
	}

	// 2. Handle absolute URLs to our host
	u, err := url.Parse(rawURL)
	if err == nil {
		baseU, _ := url.Parse(baseURL)
		if u.Host == baseU.Host && strings.HasPrefix(u.Path, uploadURLPrefix) {
			// Reuse local path logic via recursing with the path part
			return j.loadImage(u.Path)
		}
	}

	return nil, fmt.Errorf("unsupported image source or image not found: %s", rawURL)
}
