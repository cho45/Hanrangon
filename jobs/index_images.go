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
	"log"
	"math"
	"net/url"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/cho45/hanrangon/app"
	"github.com/cho45/hanrangon/model"
	"github.com/nfnt/resize"
	_ "golang.org/x/image/webp"
	"golang.org/x/net/html"
	"golang.org/x/sync/errgroup"
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
	EntryID   int64 `json:"entry_id"`
	Overwrite bool  `json:"overwrite"`
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

	return j.FillImagesForEntry(ctx, a.EntryID, a.Overwrite)
}

func (j *IndexImagesJob) SyncImagesForEntry(ctx context.Context, entryID int64) error {
	return j.SyncImagesForEntries(ctx, []int64{entryID})
}

func (j *IndexImagesJob) SyncImagesForEntries(ctx context.Context, entryIDs []int64) error {
	if len(entryIDs) == 0 {
		return nil
	}

	tx, err := j.app.ImagesDB().BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()
	qtx := j.app.ImagesQueries().WithTx(tx)

	for _, entryID := range entryIDs {
		if err := j.syncInternal(ctx, qtx, entryID); err != nil {
			return err
		}
	}

	return tx.Commit()
}

func (j *IndexImagesJob) syncInternal(ctx context.Context, qtx *model.Queries, entryID int64) error {
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
	existingImages, err := qtx.ListImagesByEntryID(ctx, entryID)
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

	// Skip if no changes
	if len(idsToDelete) == 0 && len(urlsToAdd) == 0 {
		return nil
	}

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

	return nil
}

func (j *IndexImagesJob) FillImagesForEntry(ctx context.Context, entryID int64, force bool) error {
	return j.FillImagesForEntries(ctx, []int64{entryID}, force)
}

func (j *IndexImagesJob) FillImagesForEntries(ctx context.Context, entryIDs []int64, force bool) error {
	if len(entryIDs) == 0 {
		return nil
	}

	// 1. Get all unindexed images for these entries
	var allImages []model.Image
	for _, entryID := range entryIDs {
		images, err := j.app.ImagesQueries().ListImagesByEntryID(ctx, entryID)
		if err != nil {
			return err
		}
		for _, img := range images {
			if force || len(img.Sig) == 0 {
				allImages = append(allImages, img)
			}
		}
	}

	if len(allImages) == 0 {
		return nil
	}

	// 2. Process images in parallel
	type result struct {
		imgRecord model.Image
		sig       uint64
		success   bool
	}
	results := make([]result, len(allImages))

	var g errgroup.Group
	g.SetLimit(3) // Limit concurrency to 3 as requested

	for i, imgRecord := range allImages {
		i, imgRecord := i, imgRecord
		g.Go(func() error {
			img, err := j.loadImage(imgRecord.Uri)
			status := "SUCCESS"
			if err != nil {
				status = fmt.Sprintf("FAIL (%v)", err)
			} else {
				// 1. Calculate color signature
				sig := j.CalculateColorSignatureFromImage(img)

				results[i] = result{
					imgRecord: imgRecord,
					sig:       sig,
					success:   true,
				}
			}
			log.Printf("    Image %d: %s -> %s", imgRecord.ID, imgRecord.Uri, status)

			return nil
		})
	}

	if err := g.Wait(); err != nil {
		return err
	}

	// 3. Save results in a single transaction
	tx, err := j.app.ImagesDB().BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()
	qtx := j.app.ImagesQueries().WithTx(tx)

	for _, res := range results {
		sigBytes := []byte{}
		if res.success {
			sigBytes = make([]byte, 8)
			binary.BigEndian.PutUint64(sigBytes, res.sig)
		}

		if err := qtx.UpdateImageSig(ctx, model.UpdateImageSigParams{
			Sig: sigBytes,
			ID:  res.imgRecord.ID,
		}); err != nil {
			return err
		}

		if res.success {
			if err := qtx.DeleteNgramsByImageID(ctx, res.imgRecord.ID); err != nil {
				return err
			}

			// Sliding window of 12-bits (53 ngrams)
			// Including the offset 'i' in the word ensures that we only match
			// patterns at the same absolute position in the color space.
			for i := 0; i <= 64-12; i++ {
				pattern := int64((res.sig >> i) & 0xFFF)
				word := (int64(i) << 12) | pattern

				if err := qtx.CreateNgram(ctx, model.CreateNgramParams{
					ImageID: res.imgRecord.ID,
					Word:    word,
				}); err != nil {
					return err
				}
			}
		}
	}

	return tx.Commit()
}

func (j *IndexImagesJob) CalculateColorSignatureFromImage(img image.Image) uint64 {
	// 1. リサイズ
	// 処理速度の向上と、ノイズ除去（平滑化）のために 64x64 に縮小します。
	resized := resize.Resize(64, 64, img, resize.NearestNeighbor)

	// 2. 知覚的カラーヒストグラムの集計 (OKLCH 空間)
	// 人間の知覚に基づいた OKLCH 空間で、色空間を 4x2x8 = 64分割して集計します。
	//
	// 64bit整数の各ビット（0〜63番目）が、特定の「色領域（バケツ）」に対応します。
	// ある色が 64ビット中の何番目のビットに該当するか（ビット位置）を、
	// 空間充填曲線の一種である Z-order (Morton order) を用いて決定します。
	//
	// ビットインターリーブ順:
	//   ビット位置 (0-63) = [ H2 | L1 | H1 | L0 | H0 | C0 ]
	//   - L = Lightness(2bit), H = Hue(3bit), C = Chroma(1bit)
	//
	// この Z-order 配置により、色空間（L, H, C）上で近い特徴を持つ色が、
	// 1次元のビット列上でも高い確率で隣り合う（空間局所性が保存される）ようになります。
	// これによりスライディングウィンドウ（12bit 窓）による検索が、
	// 「色空間上の局所的な色の塊」をより意味のあるパターンとして捉えられます。
	counts := make([]int, 64)
	bounds := resized.Bounds()
	totalPixels := 0
	for y := bounds.Min.Y; y < bounds.Max.Y; y++ {
		for x := bounds.Min.X; x < bounds.Max.X; x++ {
			r, g, b, _ := resized.At(x, y).RGBA()

			// 16-bit (0-65535) から 0.0-1.0 に変換して OKLCH へ
			l, c, h := rgbToOKLCH(float64(r)/65535.0, float64(g)/65535.0, float64(b)/65535.0)

			// 量子化 (4x2x8 = 64 ビン)
			li := int(l * 3.99) // 明度: 4段階 (2bit: l1, l0)
			ci := 0
			if c > 0.05 {
				ci = 1
			} // 彩度: 2段階 (1bit: c0)
			hi := int((h / 360.0) * 7.99) // 色相: 8段階 (3bit: h2, h1, h0)

			// Z-order インターリーブ計算 [ H2 L1 H1 L0 H0 C0 ]
			l1, l0 := (li>>1)&1, li&1
			h2, h1, h0 := (hi>>2)&1, (hi>>1)&1, hi&1
			c0 := ci & 1

			bitPos := (h2 << 5) | (l1 << 4) | (h1 << 3) | (l0 << 2) | (h0 << 1) | c0
			counts[bitPos]++
			totalPixels++
		}
	}

	// 3. 64bit シグネチャ（主要色ビットマスク）の生成
	// 画像内で面積の 3% 以上を占める色のビットを立て、画像の「色の指紋」を作成します。
	// これにより、画像の「構造」ではなく「雰囲気（パレット）」に基づいた検索が可能になります。

	maxCount := 0
	maxBitPos := 0
	threshold := totalPixels * 3 / 100
	var sig uint64

	for bitPos, count := range counts {
		// 最も支配的な1色は必ず含める（sigが空になるのを防ぐ）
		if count > maxCount {
			maxCount = count
			maxBitPos = bitPos
		}
		if count > threshold {
			sig |= (1 << uint(bitPos))
		}
	}
	sig |= (1 << uint(maxBitPos))

	return sig
}

// rgbToOKLCH converts sRGB to OKLCH color space.
// Based on https://bottosson.github.io/posts/oklab/
func rgbToOKLCH(r, g, b float64) (l, c, h float64) {
	// 1. sRGB to Linear RGB
	lin := func(v float64) float64 {
		if v <= 0.04045 {
			return v / 12.92
		}
		return math.Pow((v+0.055)/1.055, 2.4)
	}
	r, g, b = lin(r), lin(g), lin(b)

	// 2. Linear RGB to LMS
	l_ := 0.4122214708*r + 0.5363325363*g + 0.0514459929*b
	m_ := 0.2119034982*r + 0.6806995451*g + 0.1073969566*b
	s_ := 0.0883024619*r + 0.2817188376*g + 0.6299787005*b

	// 3. LMS to OKLab
	l_root := math.Cbrt(l_)
	m_root := math.Cbrt(m_)
	s_root := math.Cbrt(s_)

	L := 0.2104542553*l_root + 0.7936177850*m_root - 0.0040720468*s_root
	a := 1.9779984951*l_root - 2.4285922050*m_root + 0.4505937099*s_root
	b_ := 0.0259040371*l_root + 0.7827717662*m_root - 0.8086757660*s_root

	// 4. OKLab to OKLCH
	C := math.Sqrt(a*a + b_*b_)
	var H float64
	if C < 1e-6 {
		H = 0
	} else {
		H = math.Atan2(b_, a) * 180.0 / math.Pi
		if H < 0 {
			H += 360.0
		}
	}

	return L, C, H
}

func (j *IndexImagesJob) loadImage(rawURL string) (image.Image, error) {
	uploadURLPrefix := j.app.Config().UploadURLPrefix
	uploadDir := j.app.Config().UploadDir
	baseURL := j.app.Config().BaseURL

	// 1. Handle local paths
	if strings.HasPrefix(rawURL, uploadURLPrefix) {
		p := filepath.Join(uploadDir, strings.TrimPrefix(rawURL, uploadURLPrefix))
		// Handle URL encoded filenames
		if unescaped, err := url.PathUnescape(p); err == nil {
			p = unescaped
		}

		f, err := os.Open(p)
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
