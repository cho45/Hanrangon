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
	"regexp"
	"strings"
	"time"

	"github.com/cho45/hanrangon/app"
	"github.com/cho45/hanrangon/model"
	"github.com/corona10/goimagehash"
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

var imgTagRegexp = regexp.MustCompile(`(?i)<img\s+[^>]*src=["']([^"']+)["']`)

func (j *IndexImagesJob) Execute(ctx context.Context, arg json.RawMessage) error {
	var a IndexImagesArg
	if err := json.Unmarshal(arg, &a); err != nil {
		return fmt.Errorf("failed to unmarshal arg: %w", err)
	}

	entry, err := j.app.Queries().GetEntryById(ctx, a.EntryID)
	if err != nil {
		return err
	}

	// Find all image URLs
	matches := imgTagRegexp.FindAllStringSubmatch(entry.FormattedBody, -1)
	urls := make([]string, 0, len(matches))
	seen := make(map[string]bool)
	for _, m := range matches {
		u := m[1]
		if !seen[u] {
			urls = append(urls, u)
			seen[u] = true
		}
	}

	// Delete old records
	if err := j.app.ImagesQueries().DeleteImagesByEntryID(ctx, a.EntryID); err != nil {
		return err
	}

	for _, rawURL := range urls {
		img, err := j.loadImage(rawURL)
		if err != nil {
			// Skip images that cannot be loaded
			continue
		}

		hash, err := goimagehash.PerceptionHash(img)
		if err != nil {
			continue
		}

		sig := make([]byte, 8)
		binary.BigEndian.PutUint64(sig, hash.GetHash())

		imageID, err := j.app.ImagesQueries().CreateImage(ctx, model.CreateImageParams{
			Uri:     rawURL,
			EntryID: a.EntryID,
			Sig:     sig,
		})
		if err != nil {
			return err
		}

		// Create n-grams for fast lookup
		h := hash.GetHash()
		for i := uint16(0); i < 4; i++ {
			segment := uint16((h >> (i * 16)) & 0xFFFF)
			word := make([]byte, 4)
			binary.BigEndian.PutUint16(word[0:2], i)       // Position
			binary.BigEndian.PutUint16(word[2:4], segment) // Value

			if err := j.app.ImagesQueries().CreateNgram(ctx, model.CreateNgramParams{
				ImageID: imageID,
				Word:    word,
			}); err != nil {
				return err
			}
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
