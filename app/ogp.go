package app

import (
	"fmt"
	"image"
	"image/color"
	"image/draw"
	"image/png"
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

	ogpBaseImage *image.RGBA
	ogpFont      *opentype.Font
	ogpAssetOnce sync.Once
)

const (
	ogpBgR, ogpBgG, ogpBgB = 248, 249, 250 // #f8f9fa
)

func getOGPPalette() color.Palette {
	ogpPaletteOnce.Do(func() {
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
		// 背景画像のロード
		bgPath := filepath.Join(app.config.StaticDir, "images", "ogp_base.png")
		if f, err := os.Open(bgPath); err == nil {
			img, _ := png.Decode(f)
			f.Close()
			if rgba, ok := img.(*image.RGBA); ok {
				ogpBaseImage = rgba
			} else if img != nil {
				// RGBAでない場合は変換してキャッシュ
				b := img.Bounds()
				rgba = image.NewRGBA(b)
				draw.Draw(rgba, b, img, b.Min, draw.Src)
				ogpBaseImage = rgba
			}
		}
		// フォントのロード
		fontPath := filepath.Join(app.config.StaticDir, "fonts", "NotoSansJP-Bold.ttf")
		if fontBytes, err := os.ReadFile(fontPath); err == nil {
			ogpFont, _ = opentype.Parse(fontBytes)
		}
	})
}

func (app *AppImpl) HandleOGP(c echo.Context) error {
	idStr := c.Param("id")
	idStr = strings.TrimSuffix(idStr, ".png")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Invalid ID")
	}

	cachePath := filepath.Join("var", "cache", "ogp", fmt.Sprintf("%d.png", id))

	if app.config.IsDevelopment() {
		cc := c.Request().Header.Get("Cache-Control")
		pragma := c.Request().Header.Get("Pragma")
		if cc == "no-cache" || pragma == "no-cache" {
			os.Remove(cachePath)
		}
	}

	if _, err := os.Stat(cachePath); err == nil {
		return c.File(cachePath)
	}

	entry, err := app.queries.GetEntryById(c.Request().Context(), id)
	if err != nil {
		return echo.NewHTTPError(http.StatusNotFound, "Entry not found")
	}

	// 1. アセットのロード
	app.loadOGPAssets()

	// 2. 背景の準備（copyによる高速化）
	bounds := image.Rect(0, 0, 1200, 630)
	dst := image.NewRGBA(bounds)
	if ogpBaseImage != nil {
		copy(dst.Pix, ogpBaseImage.Pix)
	} else {
		draw.Draw(dst, dst.Bounds(), image.NewUniform(color.RGBA{ogpBgR, ogpBgG, ogpBgB, 255}), image.Point{}, draw.Src)
	}

	if ogpFont == nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "Font not loaded")
	}

	const dpi = 72
	titleFace, _ := opentype.NewFace(ogpFont, &opentype.FaceOptions{Size: 64, DPI: dpi, Hinting: font.HintingFull})
	defer titleFace.Close()
	metaFace, _ := opentype.NewFace(ogpFont, &opentype.FaceOptions{Size: 36, DPI: dpi, Hinting: font.HintingFull})
	defer metaFace.Close()

	// 3. テキストの準備
	title := entry.DisplayTitle()
	title = strings.ReplaceAll(title, "✖", "×")
	if len([]rune(title)) > 200 {
		title = string([]rune(title)[:200])
	}
	dateStr := entry.CreatedAt.Format("2006 . 01 . 02")
	pathParts := strings.Split(strings.Trim(entry.Path, "/"), "/")
	if len(pathParts) > 0 {
		seq := pathParts[len(pathParts)-1]
		if _, err := strconv.Atoi(seq); err == nil {
			dateStr = fmt.Sprintf("%s  #%s", dateStr, seq)
		}
	}
	tags := entry.Tags()
	tagStr := ""
	for _, t := range tags {
		tagStr += " #" + t
	}
	tagStr = strings.TrimSpace(tagStr)

	// 4. フェードアウトの必要判定
	const margin = 80
	titleWidth := (&font.Drawer{Face: titleFace}).MeasureString(title)
	needsFade := false
	if tagStr != "" && (fixed.I(dst.Bounds().Dx())-(&font.Drawer{Face: metaFace}).MeasureString(tagStr))/2 < fixed.I(margin) {
		needsFade = true
	}
	if (fixed.I(dst.Bounds().Dx())-titleWidth)/2 < fixed.I(margin) {
		needsFade = true
	}

	// 5. 描画ターゲットの決定
	var drawDst draw.Image = dst
	var textLayer *image.RGBA
	if needsFade {
		textLayer = image.NewRGBA(dst.Bounds())
		drawDst = textLayer
	}

	centerY := dst.Bounds().Dy() / 2
	d := &font.Drawer{Dst: drawDst}

	// 日付
	d.Face = metaFace
	d.Src = image.NewUniform(color.RGBA{120, 130, 140, 255})
	d.Dot = fixed.Point26_6{X: (fixed.I(dst.Bounds().Dx()) - d.MeasureString(dateStr)) / 2, Y: fixed.I(centerY - 180)}
	d.DrawString(dateStr)

	// タグ
	if tagStr != "" {
		d.Src = image.NewUniform(color.RGBA{44, 62, 80, 255})
		tagX := (fixed.I(dst.Bounds().Dx()) - d.MeasureString(tagStr)) / 2
		if tagX < fixed.I(margin) {
			tagX = fixed.I(margin)
		}
		d.Dot = fixed.Point26_6{X: tagX, Y: fixed.I(centerY - 120)}
		d.DrawString(tagStr)
	}

	// タイトル
	d.Face = titleFace
	d.Src = image.NewUniform(color.RGBA{44, 62, 80, 255})
	titleX := (fixed.I(dst.Bounds().Dx()) - titleWidth) / 2
	if titleX < fixed.I(margin) {
		titleX = fixed.I(margin)
	}
	d.Dot = fixed.Point26_6{X: titleX, Y: fixed.I(centerY - 20)}
	d.DrawString(title)

	// 6. 合成
	if needsFade {
		fadeEnd := dst.Bounds().Dx() - margin
		fadeLen := 120
		fadeStart := fadeEnd - fadeLen
		stride := textLayer.Stride
		for y := 0; y < dst.Bounds().Dy(); y++ {
			rowOffset := y * stride
			for x := fadeStart; x < dst.Bounds().Dx(); x++ {
				var mask float64 = 1.0
				if x >= fadeEnd {
					mask = 0
				} else {
					mask = float64(fadeEnd-x) / float64(fadeLen)
				}

				if mask < 1.0 {
					pixIdx := rowOffset + x*4
					a := textLayer.Pix[pixIdx+3]
					if a > 0 {
						textLayer.Pix[pixIdx] = uint8(float64(textLayer.Pix[pixIdx]) * mask)
						textLayer.Pix[pixIdx+1] = uint8(float64(textLayer.Pix[pixIdx+1]) * mask)
						textLayer.Pix[pixIdx+2] = uint8(float64(textLayer.Pix[pixIdx+2]) * mask)
						textLayer.Pix[pixIdx+3] = uint8(float64(a) * mask)
					}
				}
			}
		}
		draw.Draw(dst, dst.Bounds(), textLayer, image.Point{}, draw.Over)
	}

	// 7. パレット変換と保存
	paletted := image.NewPaletted(dst.Bounds(), getOGPPalette())
	draw.Draw(paletted, dst.Bounds(), dst, image.Point{}, draw.Src)

	if err := os.MkdirAll(filepath.Dir(cachePath), 0755); err != nil {
		return fmt.Errorf("failed to create cache directory: %w", err)
	}
	outFile, err := os.Create(cachePath)
	if err != nil {
		return fmt.Errorf("failed to create cache file: %w", err)
	}
	defer outFile.Close()
	enc := &png.Encoder{CompressionLevel: png.DefaultCompression}
	if err := enc.Encode(outFile, paletted); err != nil {
		return fmt.Errorf("failed to encode png: %w", err)
	}

	return c.File(cachePath)
}

func (app *AppImpl) InvalidateOGPCache(id int64) error {
	cachePath := filepath.Join("var", "cache", "ogp", fmt.Sprintf("%d.png", id))
	if err := os.Remove(cachePath); err != nil && !os.IsNotExist(err) {
		return err
	}
	return nil
}
