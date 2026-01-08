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
)

const (
	ogpBgR, ogpBgG, ogpBgB = 248, 249, 250 // #f8f9fa
)

func getOGPPalette() color.Palette {
	ogpPaletteOnce.Do(func() {
		p := make(color.Palette, 0, 16)
		p = append(p, color.RGBA{ogpBgR, ogpBgG, ogpBgB, 255})

		// 濃紺 (#2c3e50) へのグラデーション (14段階)
		for i := 0; i < 14; i++ {
			t := float64(i) / 13.0
			p = append(p, color.RGBA{
				R: uint8(float64(ogpBgR)*(1-t) + 44*t),
				G: uint8(float64(ogpBgG)*(1-t) + 62*t),
				B: uint8(float64(ogpBgB)*(1-t) + 80*t),
				A: 255,
			})
		}
		// 単色グレー (#78828c) を追加
		p = append(p, color.RGBA{120, 130, 140, 255})
		ogpPalette = p
	})
	return ogpPalette
}

func (app *AppImpl) HandleOGP(c echo.Context) error {
	idStr := c.Param("id")
	idStr = strings.TrimSuffix(idStr, ".png")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Invalid ID")
	}

	cachePath := filepath.Join("var", "cache", "ogp", fmt.Sprintf("%d.png", id))

	// 開発環境かつスーパーリロード時はキャッシュを破棄する
	if app.config.IsDevelopment() {
		cc := c.Request().Header.Get("Cache-Control")
		pragma := c.Request().Header.Get("Pragma")
		if cc == "no-cache" || pragma == "no-cache" {
			os.Remove(cachePath)
		}
	}

	// キャッシュがあれば即座に返す
	if _, err := os.Stat(cachePath); err == nil {
		return c.File(cachePath)
	}

	// 記事タイトルを取得
	entry, err := app.queries.GetEntryById(c.Request().Context(), id)
	if err != nil {
		return echo.NewHTTPError(http.StatusNotFound, "Entry not found")
	}

	// 1. 背景画像をロード
	bgPath := filepath.Join(app.config.StaticDir, "images", "ogp_base.png")
	bgFile, err := os.Open(bgPath)
	var bg image.Image
	if err != nil {
		rgba := image.NewRGBA(image.Rect(0, 0, 1200, 630))
		draw.Draw(rgba, rgba.Bounds(), image.NewUniform(color.RGBA{ogpBgR, ogpBgG, ogpBgB, 255}), image.Point{}, draw.Src)
		bg = rgba
	} else {
		bg, err = png.Decode(bgFile)
		bgFile.Close()
		if err != nil {
			return fmt.Errorf("failed to decode background: %w", err)
		}
	}

	bounds := bg.Bounds()
	dst := image.NewRGBA(bounds)
	draw.Draw(dst, bounds, bg, bounds.Min, draw.Src)

	// 2. フォントの準備
	fontPath := filepath.Join(app.config.StaticDir, "fonts", "NotoSansJP-Bold.ttf")
	fontBytes, err := os.ReadFile(fontPath)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, fmt.Sprintf("failed to read font: %v", err))
	}

	f, err := opentype.Parse(fontBytes)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, fmt.Sprintf("failed to parse font: %v", err))
	}

	const dpi = 72
	titleFace, _ := opentype.NewFace(f, &opentype.FaceOptions{
		Size:    64,
		DPI:     dpi,
		Hinting: font.HintingFull,
	})
	defer titleFace.Close()

	metaFace, _ := opentype.NewFace(f, &opentype.FaceOptions{
		Size:    36,
		DPI:     dpi,
		Hinting: font.HintingFull,
	})
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

	// テキストレイヤー
	textLayer := image.NewRGBA(bounds)
	d := &font.Drawer{
		Dst: textLayer,
	}

	const margin = 80
	centerY := bounds.Dy() / 2

	// 日付
	d.Face = metaFace
	d.Src = image.NewUniform(color.RGBA{120, 130, 140, 255})
	dateWidth := d.MeasureString(dateStr)
	d.Dot = fixed.Point26_6{
		X: (fixed.I(bounds.Dx()) - dateWidth) / 2,
		Y: fixed.I(centerY - 180),
	}
	d.DrawString(dateStr)

	// タグ
	if tagStr != "" {
		d.Src = image.NewUniform(color.RGBA{44, 62, 80, 255})
		tagWidth := d.MeasureString(tagStr)
		tagX := (fixed.I(bounds.Dx()) - tagWidth) / 2
		if tagX < fixed.I(margin) { tagX = fixed.I(margin) }
		d.Dot = fixed.Point26_6{
			X: tagX,
			Y: fixed.I(centerY - 120),
		}
		d.DrawString(tagStr)
	}

	// タイトル
	d.Face = titleFace
	d.Src = image.NewUniform(color.RGBA{44, 62, 80, 255})
	titleWidth := d.MeasureString(title)
	titleX := (fixed.I(bounds.Dx()) - titleWidth) / 2
	if titleX < fixed.I(margin) { titleX = fixed.I(margin) }
	d.Dot = fixed.Point26_6{
		X: titleX,
		Y: fixed.I(centerY - 20),
	}
	d.DrawString(title)

	// 4. 右端フェードアウト処理
	fadeEnd := bounds.Dx() - margin
	fadeLen := 120
	needsFade := false
	if tagStr != "" && (fixed.I(bounds.Dx()) - d.MeasureString(tagStr)) / 2 < fixed.I(margin) {
		needsFade = true
	}
	if (fixed.I(bounds.Dx()) - titleWidth) / 2 < fixed.I(margin) {
		needsFade = true
	}

	if needsFade {
		fadeStart := fadeEnd - fadeLen
		for y := 0; y < bounds.Dy(); y++ {
			for x := fadeStart; x < bounds.Dx(); x++ {
				var mask float64 = 1.0
				if x >= fadeEnd {
					mask = 0
				} else {
					mask = float64(fadeEnd-x) / float64(fadeLen)
				}

				if mask < 1.0 {
					c := textLayer.RGBAAt(x, y)
					if c.A > 0 {
						c.R = uint8(float64(c.R) * mask)
						c.G = uint8(float64(c.G) * mask)
						c.B = uint8(float64(c.B) * mask)
						c.A = uint8(float64(c.A) * mask)
						textLayer.SetRGBA(x, y, c)
					}
				}
			}
		}
	}

	// 5. 合成
	draw.Draw(dst, bounds, textLayer, image.Point{}, draw.Over)

	// 6. 栞（しおり）タブ
	tabColor := color.RGBA{44, 62, 80, 255}
	tabW := 60
	tabH := 80
	tabX := (bounds.Dx() - tabW) / 2
	for x := tabX; x < tabX+tabW; x++ {
		for y := 0; y < tabH; y++ {
			distFromBottom := tabH - y
			distFromCenter := x - (tabX + tabW/2)
			if distFromCenter < 0 { distFromCenter = -distFromCenter }
			if distFromBottom > distFromCenter {
				dst.Set(x, y, tabColor)
			}
		}
	}

	// 7. 下部ライン
	lineColor := color.RGBA{44, 62, 80, 255}
	for x := 0; x < bounds.Dx(); x++ {
		for y := bounds.Dy() - 12; y < bounds.Dy(); y++ {
			dst.Set(x, y, lineColor)
		}
	}

	// 8. パレット変換と保存
	paletted := image.NewPaletted(bounds, getOGPPalette())
	draw.Draw(paletted, bounds, dst, image.Point{}, draw.Src)

	if err := os.MkdirAll(filepath.Dir(cachePath), 0755); err != nil {
		return fmt.Errorf("failed to create cache directory: %w", err)
	}

	outFile, err := os.Create(cachePath)
	if err != nil {
		return fmt.Errorf("failed to create cache file: %w", err)
	}
	defer outFile.Close()

	enc := &png.Encoder{CompressionLevel: png.BestCompression}
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
