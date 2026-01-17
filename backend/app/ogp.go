package app

import (
	"database/sql"
	"fmt"
	"image"
	"image/color"
	"image/draw"
	"image/png"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"sync"

	"github.com/labstack/echo/v4"
	"golang.org/x/image/font"
	"golang.org/x/image/font/opentype"
	"golang.org/x/image/math/fixed"
)

var (
	ogpPalette     color.Palette
	ogpPaletteOnce sync.Once

	ogpBaseImage    *image.RGBA
	ogpBasePaletted *image.Paletted
	ogpPaletteLUT   []uint8
	ogpFont         *opentype.Font
	ogpAssetOnce    sync.Once

	rgbaPool = sync.Pool{
		New: func() any {
			b := make([]byte, 1200*630*4)
			return &b
		},
	}
	palettedPool = sync.Pool{
		New: func() any {
			b := make([]byte, 1200*630)
			return &b
		},
	}
)

const (
	ogpBgR, ogpBgG, ogpBgB = 248, 249, 250 // #f8f9fa
)

type opaquePaletted struct {
	*image.Paletted
}

func (p *opaquePaletted) Opaque() bool { return true }

func getOGPPalette() color.Palette {
	ogpPaletteOnce.Do(func() {
		// 背景画像ogp_base.pngも含めて主要色を16色に制限（ファイルサイズ削減）
		p := make(color.Palette, 0, 16)
		p = append(p, color.RGBA{ogpBgR, ogpBgG, ogpBgB, 255})
		for i := 0; i < 14; i++ {
			t := float64(i) / 13.0
			p = append(p, color.RGBA{
				R: uint8(float64(ogpBgR)*(1-t) + 44*t),
				G: uint8(float64(ogpBgG)*(1-t) + 62*t),
				B: uint8(float64(ogpBgB)*(1-t) + 80*t),
				A: 255,
			})
		}
		p = append(p, color.RGBA{120, 130, 140, 255})
		ogpPalette = p
	})
	return ogpPalette
}

func (app *AppImpl) loadOGPAssets() {
	ogpAssetOnce.Do(func() {
		// ディレクトリを事前に作成
		cacheDir := filepath.Join(app.config.BaseDir, "var", "cache", "ogp")
		if err := os.MkdirAll(cacheDir, 0755); err != nil {
			log.Printf("Error creating OGP cache directory: %v", err)
		}

		p := getOGPPalette()
		bgPath := filepath.Join(app.config.StaticDir, "images", "ogp_base.png")
		if f, err := os.Open(bgPath); err == nil {
			img, _ := png.Decode(f)
			f.Close()
			if img != nil {
				b := img.Bounds()
				rgba := image.NewRGBA(b)
				draw.Draw(rgba, b, img, b.Min, draw.Src)
				ogpBaseImage = rgba
				pal := image.NewPaletted(b, p)
				draw.Draw(pal, b, rgba, b.Min, draw.Src)
				ogpBasePaletted = pal
			}
		}
		fontPath := filepath.Join(app.config.StaticDir, "fonts", "NotoSansJP-Bold.ttf")
		if fontBytes, err := os.ReadFile(fontPath); err == nil {
			ogpFont, _ = opentype.Parse(fontBytes)
		}
		lut := make([]uint8, 32*32*32)
		for r := 0; r < 32; r++ {
			for g := 0; g < 32; g++ {
				for b := 0; b < 32; b++ {
					c := color.RGBA{uint8(r<<3 | r>>2), uint8(g<<3 | g>>2), uint8(b<<3 | b>>2), 255}
					lut[(r<<10)|(g<<5)|b] = uint8(p.Index(c))
				}
			}
		}
		ogpPaletteLUT = lut
	})
}

func (app *AppImpl) HandleOGP(c echo.Context) error {
	idStr := c.Param("id")
	idStr = strings.TrimSuffix(idStr, ".png")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Invalid ID")
	}

	cachePath := filepath.Join(app.config.BaseDir, "var", "cache", "ogp", fmt.Sprintf("%d.png", id))
	cc := c.Request().Header.Get("Cache-Control")
	pragma := c.Request().Header.Get("Pragma")
	noCache := (cc == "no-cache" || pragma == "no-cache") && app.config.IsDevelopment()

	if !noCache {
		if _, err := os.Stat(cachePath); err == nil {
			return c.File(cachePath)
		}
	}

	entry, err := app.MainDB().Q.GetEntryById(c.Request().Context(), id)
	if err != nil {
		if err == sql.ErrNoRows {
			return echo.NewHTTPError(http.StatusNotFound, "Entry not found")
		}
		return echo.NewHTTPError(http.StatusInternalServerError, fmt.Sprintf("DB error: %v", err))
	}

	// 1. アセットのロード（初回のみ）
	app.loadOGPAssets()
	if ogpFont == nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "Assets not loaded")
	}

	// 2. テキスト情報の準備
	title := entry.DisplayTitle()
	// 豆腐対策: ✖ を一般的な × に置換
	title = strings.ReplaceAll(title, "✖", "×")
	// 極端に長いタイトルの描画負荷を避ける
	if len([]rune(title)) > 200 {
		title = string([]rune(title)[:200])
	}
	dateStr := entry.CreatedAt.Format("2006 . 01 . 02")
	pathParts := strings.Split(strings.Trim(entry.Path, "/"), "/")
	if len(pathParts) > 0 {
		if seq := pathParts[len(pathParts)-1]; seq != "" {
			if _, err := strconv.Atoi(seq); err == nil {
				dateStr = fmt.Sprintf("%s  #%s", dateStr, seq)
			}
		}
	}
	tags := entry.Tags()
	tagStr := ""
	for _, t := range tags {
		tagStr += " #" + t
	}
	tagStr = strings.TrimSpace(tagStr)

	// 3. 描画コンテキストの準備
	// Faceはスレッドセーフではないため、リクエストごとに生成する
	const dpi = 72
	titleFace, _ := opentype.NewFace(ogpFont, &opentype.FaceOptions{Size: 64, DPI: dpi, Hinting: font.HintingFull})
	defer titleFace.Close()
	metaFace, _ := opentype.NewFace(ogpFont, &opentype.FaceOptions{Size: 36, DPI: dpi, Hinting: font.HintingFull})
	defer metaFace.Close()

	const margin = 80
	titleWidth := (&font.Drawer{Face: titleFace}).MeasureString(title)
	tagWidth := (&font.Drawer{Face: metaFace}).MeasureString(tagStr)

	// フェードアウトの必要判定
	needsFade := (tagStr != "" && (fixed.I(1200)-tagWidth)/2 < fixed.I(margin)) || ((fixed.I(1200)-titleWidth)/2 < fixed.I(margin))

	// 4. 描画実行
	pixPtr := rgbaPool.Get().(*[]byte)
	defer rgbaPool.Put(pixPtr)
	pix := *pixPtr
	dst := &image.RGBA{Pix: pix, Stride: 1200 * 4, Rect: image.Rect(0, 0, 1200, 630)}

	var textLayer *image.RGBA
	var d *font.Drawer
	if needsFade {
		// フェードアウトが必要な場合は、合成計算のためにテキストのみを別レイヤー（透明）に描画
		tpixPtr := rgbaPool.Get().(*[]byte)
		defer rgbaPool.Put(tpixPtr)
		tpix := *tpixPtr
		for i := range tpix {
			tpix[i] = 0
		}
		textLayer = &image.RGBA{Pix: tpix, Stride: 1200 * 4, Rect: dst.Rect}
		d = &font.Drawer{Dst: textLayer}
	} else {
		// フェード不要な場合は、直接背景画像の上にテキストを描画して高速化
		if ogpBaseImage != nil {
			copy(dst.Pix, ogpBaseImage.Pix)
		} else {
			draw.Draw(dst, dst.Bounds(), image.NewUniform(color.RGBA{ogpBgR, ogpBgG, ogpBgB, 255}), image.Point{}, draw.Src)
		}
		d = &font.Drawer{Dst: dst}
	}

	centerY := 315

	// パート1: 日付の描画
	d.Face = metaFace
	d.Src = image.NewUniform(color.RGBA{120, 130, 140, 255})
	d.Dot = fixed.Point26_6{X: (fixed.I(1200) - d.MeasureString(dateStr)) / 2, Y: fixed.I(centerY - 180)}
	d.DrawString(dateStr)

	// パート2: タグの描画
	if tagStr != "" {
		d.Src = image.NewUniform(color.RGBA{44, 62, 80, 255})
		tagX := (fixed.I(1200) - d.MeasureString(tagStr)) / 2
		if tagX < fixed.I(margin) {
			tagX = fixed.I(margin)
		}
		d.Dot = fixed.Point26_6{X: tagX, Y: fixed.I(centerY - 120)}
		d.DrawString(tagStr)
	}

	// パート3: タイトルの描画
	d.Face = titleFace
	d.Src = image.NewUniform(color.RGBA{44, 62, 80, 255})
	titleX := (fixed.I(1200) - titleWidth) / 2
	if titleX < fixed.I(margin) {
		titleX = fixed.I(margin)
	}
	d.Dot = fixed.Point26_6{X: titleX, Y: fixed.I(centerY - 20)}
	d.DrawString(title)

	// 5. 最終的な画像形式への変換 (RGBA -> 16色パレット)
	// フルカラー(RGBA)から16色のインデックス形式(Paletted)へ変換することで、ファイルサイズを削減。
	// これにより、画質を実用的なレベルで維持しつつ、OGP 画像の転送量を最小化する。
	ppixPtr := palettedPool.Get().(*[]byte)
	defer palettedPool.Put(ppixPtr)
	ppix := *ppixPtr
	paletted := &image.Paletted{Pix: ppix, Stride: 1200, Rect: dst.Rect, Palette: getOGPPalette()}

	lut, pPix, dPix := ogpPaletteLUT, paletted.Pix, dst.Pix
	// 高速化のため、不変の背景アセットを直接参照できるようにスライスを確保
	var bRPix, bPPix []uint8
	if ogpBaseImage != nil {
		bRPix = ogpBaseImage.Pix
	}
	if ogpBasePaletted != nil {
		bPPix = ogpBasePaletted.Pix
	}

	if needsFade {
		// フェード計算、アルファブレンディング（合成）、パレット変換（LUT）を 1 パスで実行
		// textLayer (RGBA) を背景アセットに重ねつつ、その結果を直接 paletted (Index) に書き込む
		const margin = 80
		fadeEnd := 1200 - margin
		fadeLen := 120
		fadeStart := fadeEnd - fadeLen
		tPix := textLayer.Pix
		for y := 0; y < 630; y++ {
			off, pOff := y*4800, y*1200
			for x := 0; x < 1200; x++ {
				i, j := off+x*4, pOff+x
				srcA := uint32(tPix[i+3])
				if srcA == 0 {
					// テキストピクセルが完全に透明な場合は、背景アセットのパレットインデックスをそのままコピーして変換をスキップ
					if bPPix != nil {
						pPix[j] = bPPix[j]
					} else {
						pPix[j] = 0
					}
					continue
				}

				// 右端マージン付近でのフェードアウト用マスクを計算 (0-255)
				mask := uint32(255)
				if x >= fadeEnd {
					mask = 0
				} else if x >= fadeStart {
					mask = uint32((fadeEnd - x) * 255 / fadeLen)
				}
				if mask == 0 {
					if bPPix != nil {
						pPix[j] = bPPix[j]
					} else {
						pPix[j] = 0
					}
					continue
				}

				// 合成（アルファブレンディング）とLUT変換
				sR, sG, sB, sA := (uint32(tPix[i])*mask)/255, (uint32(tPix[i+1])*mask)/255, (uint32(tPix[i+2])*mask)/255, (srcA*mask)/255
				var dR, dG, dB uint32
				if bRPix != nil {
					dR, dG, dB = uint32(bRPix[i]), uint32(bRPix[i+1]), uint32(bRPix[i+2])
				} else {
					dR, dG, dB = ogpBgR, ogpBgG, ogpBgB
				}
				// ポーター・ダフの Over 演算
				invA := 255 - sA
				r, g, b := (sR*255+dR*invA)/255, (sG*255+dG*invA)/255, (sB*255+dB*invA)/255
				pPix[j] = lut[((r>>3)<<10)|((g>>3)<<5)|(b>>3)]
			}
		}
	} else {
		// フェード不要な場合は、すでに描画済みの dst (RGBA) を一気にパレット変換する
		for i, j := 0, 0; i < len(dPix); i, j = i+4, j+1 {
			pPix[j] = lut[((uint32(dPix[i])>>3)<<10)|((uint32(dPix[i+1])>>3)<<5)|(uint32(dPix[i+2])>>3)]
		}
	}

	// 6. Atomic 保存 (CreateTempによる一意なファイル作成)
	if err := os.MkdirAll(filepath.Dir(cachePath), 0755); err != nil {
		return fmt.Errorf("mkdir: %w", err)
	}
	tmpFile, err := os.CreateTemp(filepath.Dir(cachePath), ".ogp-*.tmp")
	if err != nil {
		return fmt.Errorf("create temp: %w", err)
	}
	tmpPath := tmpFile.Name()

	enc := &png.Encoder{CompressionLevel: png.DefaultCompression}
	// 不透明ラッパーを使用して opacity チェックをスキップ
	err = enc.Encode(tmpFile, &opaquePaletted{paletted})
	tmpFile.Close()

	if err != nil {
		os.Remove(tmpPath)
		return fmt.Errorf("encode: %w", err)
	}

	if err := os.Rename(tmpPath, cachePath); err != nil {
		os.Remove(tmpPath)
		return fmt.Errorf("rename: %w", err)
	}

	return c.File(cachePath)
}

func (app *AppImpl) InvalidateOGPCache(id int64) error {
	cachePath := filepath.Join(app.config.BaseDir, "var", "cache", "ogp", fmt.Sprintf("%d.png", id))
	if err := os.Remove(cachePath); err != nil && !os.IsNotExist(err) {
		return err
	}
	return nil
}
