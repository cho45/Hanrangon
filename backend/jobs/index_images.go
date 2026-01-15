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
	"net/http"
	"net/url"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/cho45/hanrangon/backend/app"
	"github.com/cho45/hanrangon/backend/model/imagesdb"
	"github.com/nfnt/resize"
	_ "github.com/vegidio/avif-go"
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

// Timeout はこのジョブの最大実行時間を返す。
// 画像処理には時間がかかる可能性があるため、3分に設定。
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
	qtx := imagesdb.New(tx)

	for _, entryID := range entryIDs {
		if err := j.syncInternal(ctx, qtx, entryID); err != nil {
			return err
		}
	}

	return tx.Commit()
}

func (j *IndexImagesJob) syncInternal(ctx context.Context, qtx imagesdb.Querier, entryID int64) error {
	entry, err := j.app.MainDB().Q.GetEntryById(ctx, entryID)
	if err != nil {
		return err
	}

	// 堅牢な HTML パーサーを使用して、現在のエントリ内のすべての画像 URL を抽出
	urls := j.extractImageURLs(entry.FormattedBody)
	currentURLs := make(map[string]bool)
	for _, u := range urls {
		currentURLs[u] = true
	}

	// DB から既存の画像を取得
	existingImages, err := qtx.ListImagesByEntryID(ctx, entryID)
	if err != nil {
		return err
	}

	// 差分を計算
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

	// 変更がない場合はスキップ
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
		_, err := qtx.CreateImage(ctx, imagesdb.CreateImageParams{
			Uri:     u,
			EntryID: entryID,
			Sig:     []byte{}, // 新規画像の場合は空のシグネチャ
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

	// 1. これらのエントリの未インデックス画像をすべて取得
	var allImages []imagesdb.Image
	for _, entryID := range entryIDs {
		images, err := j.app.ImagesDB().Q.ListImagesByEntryID(ctx, entryID)
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

	// 2. 画像を並列処理
	type result struct {
		imgRecord imagesdb.Image
		sig       uint64
		success   bool
	}
	results := make([]result, len(allImages))

	var g errgroup.Group
	g.SetLimit(3) // 並行数を 3 に制限

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

	// 3. 単一のトランザクションで結果を保存
	tx, err := j.app.ImagesDB().BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()
	qtx := imagesdb.New(tx)

	for _, res := range results {
		sigBytes := []byte{}
		if res.success {
			sigBytes = make([]byte, 8)
			binary.BigEndian.PutUint64(sigBytes, res.sig)
		}

		if err := qtx.UpdateImageSig(ctx, imagesdb.UpdateImageSigParams{
			Sig: sigBytes,
			ID:  res.imgRecord.ID,
		}); err != nil {
			return err
		}

		if res.success {
			if err := qtx.DeleteNgramsByImageID(ctx, res.imgRecord.ID); err != nil {
				return err
			}

			// 12ビットのスライディングウィンドウ (53 個の ngram)
			// 単語にオフセット 'i' を含めることで、色空間内の同じ絶対位置にあるパターンのみが一致するようにする。
			for i := 0; i <= 64-12; i++ {
				pattern := int64((res.sig >> i) & 0xFFF)
				word := (int64(i) << 12) | pattern

				if err := qtx.CreateNgram(ctx, imagesdb.CreateNgramParams{
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
	// 処理速度の向上と、ノイズ除去（平滑化）のために 64x64 に縮小。
	resized := resize.Resize(64, 64, img, resize.NearestNeighbor)

	// 2. 知覚的カラーヒストグラムの集計 (OKLCH 空間)
	// 人間の知覚に基づいた OKLCH 空間で、色空間を 4x2x8 = 64分割して集計。
	//
	// 64bit整数の各ビット（0〜63番目）が、特定の「色領域（ビン）」に対応。
	// ある色が 64ビット中の何番目のビットに該当するか（ビット位置）を、
	// 空間充填曲線の一種である Z-order (Morton order) を用いて決定。
	//
	// ビットインターリーブ順:
	//   ビット位置 (0-63) = [ H2 | L1 | H1 | L0 | H0 | C0 ]
	//   - L = Lightness(2bit), H = Hue(3bit), C = Chroma(1bit)
	//
	// この Z-order 配置により、色空間（L, H, C）上で近い特徴を持つ色が、
	// 1次元のビット列上でも高い確率で隣り合う（空間局所性が保存される）。
	// これにより、後続のスライディングウィンドウ（12bit 窓）による検索において、
	// 「色空間上の局所的な色の塊」を意味のあるパターンとして抽出可能となる。
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
	// 画像内で面積の 3% 以上を占める色のビットを立て、画像の「色の指紋」を作成。
	// 画像の「構造」ではなく「雰囲気（パレット）」に基づいた検索を目的とする。

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

// rgbToOKLCH は sRGB を OKLCH 色空間に変換する。
// 参照: https://bottosson.github.io/posts/oklab/
func rgbToOKLCH(r, g, b float64) (l, c, h float64) {
	// 1. sRGB から Linear RGB へ
	lin := func(v float64) float64 {
		if v <= 0.04045 {
			return v / 12.92
		}
		return math.Pow((v+0.055)/1.055, 2.4)
	}
	r, g, b = lin(r), lin(g), lin(b)

	// 2. Linear RGB から LMS へ
	l_ := 0.4122214708*r + 0.5363325363*g + 0.0514459929*b
	m_ := 0.2119034982*r + 0.6806995451*g + 0.1073969566*b
	s_ := 0.0883024619*r + 0.2817188376*g + 0.6299787005*b

	// 3. LMS から OKLab へ
	l_root := math.Cbrt(l_)
	m_root := math.Cbrt(m_)
	s_root := math.Cbrt(s_)

	L := 0.2104542553*l_root + 0.7936177850*m_root - 0.0040720468*s_root
	a := 1.9779984951*l_root - 2.4285922050*m_root + 0.4505937099*s_root
	b_ := 0.0259040371*l_root + 0.7827717662*m_root - 0.8086757660*s_root

	// 4. OKLab から OKLCH へ
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

	// 1. ローカルパスの処理
	if strings.HasPrefix(rawURL, uploadURLPrefix) {
		p := filepath.Join(uploadDir, strings.TrimPrefix(rawURL, uploadURLPrefix))
		// URL エンコードされたファイル名を処理
		if unescaped, err := url.PathUnescape(p); err == nil {
			p = unescaped
		}

		f, err := os.Open(p)
		if err == nil {
			defer f.Close()
			img, _, err := image.Decode(f)
			if err == nil {
				return img, nil
			}
		}
		// ローカルでのオープン/デコードに失敗した場合、絶対 URL であれば他のソースを試みる可能性がある
	}

	// 2. 自ホストへの絶対 URL の処理
	u, err := url.Parse(rawURL)
	if err == nil {
		baseU, _ := url.Parse(baseURL)
		if u.Host == baseU.Host && strings.HasPrefix(u.Path, uploadURLPrefix) {
			// パス部分を用いて再帰的に呼び出すことで、ローカルパスのロジックを再利用
			return j.loadImage(u.Path)
		}

		// 3. 特定のリモートアセットホストの処理（ローカルフォールバック付き）
		// パターン: https://assets.lowreal.net/entry/{filename}
		if u.Scheme == "https" && u.Host == "assets.lowreal.net" && strings.HasPrefix(u.Path, "/entry/") {
			filename := strings.TrimPrefix(u.Path, "/entry/")
			localPath := filepath.Join(uploadDir, filename)
			if unescaped, err := url.PathUnescape(localPath); err == nil {
				localPath = unescaped
			}

			// まずローカルを試す
			if f, err := os.Open(localPath); err == nil {
				defer f.Close()
				if img, _, err := image.Decode(f); err == nil {
					return img, nil
				}
			}

			// フォールバック: リモートからダウンロード
			log.Printf("[INFO] Downloading remote image for indexing: %s", rawURL)
			resp, err := http.Get(rawURL)
			if err != nil {
				return nil, fmt.Errorf("failed to download remote image: %w", err)
			}
			defer resp.Body.Close()

			if resp.StatusCode != http.StatusOK {
				return nil, fmt.Errorf("failed to download remote image: status %d", resp.StatusCode)
			}

			img, _, err := image.Decode(resp.Body)
			return img, err
		}
	}

	return nil, fmt.Errorf("unsupported image source or image not found: %s", rawURL)
}
