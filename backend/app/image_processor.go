package app

import (
	"context"
	"fmt"
	"log"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"time"
)

type ImageProcessor struct {
	oxipngPath    string
	optipngPath   string
	cavifPath     string
	avifencPath   string
	jpegoptimPath string
	jpegtranPath  string
}

func NewImageProcessor(cfg *Config) *ImageProcessor {
	p := &ImageProcessor{}

	findTool := func(name, cfgPath string) string {
		if cfgPath != "" {
			if path, err := exec.LookPath(cfgPath); err == nil {
				log.Printf("[INFO] %s found (config): %s", name, path)
				return path
			}
			log.Printf("[WARN] %s configured but not found: %s", name, cfgPath)
		}
		if path, err := exec.LookPath(name); err == nil {
			log.Printf("[INFO] %s found (path): %s", name, path)
			return path
		}
		return ""
	}

	p.oxipngPath = findTool("oxipng", cfg.OxipngPath)
	p.optipngPath = findTool("optipng", cfg.OptipngPath)
	p.cavifPath = findTool("cavif", cfg.CavifPath)
	p.avifencPath = findTool("avifenc", cfg.AvifencPath)
	p.jpegoptimPath = findTool("jpegoptim", cfg.JpegoptimPath)
	p.jpegtranPath = findTool("jpegtran", cfg.JpegtranPath)

	return p
}

// ProcessFile は srcPath にある画像を最適化する。
// 元ファイルを上書きする場合と、新しいファイル（.avif など）を作成する場合がある。
// 戻り値: resultPath, resultFilename, resultContentType, error
func (p *ImageProcessor) ProcessFile(ctx context.Context, srcPath string, filename string, contentType string) (string, string, string, error) {
	ext := strings.ToLower(filepath.Ext(filename))

	switch ext {
	case ".png":
		return p.processPNG(ctx, srcPath, filename, contentType)
	case ".jpg", ".jpeg":
		return p.processJPEG(ctx, srcPath, filename, contentType)
	default:
		return srcPath, filename, contentType, nil
	}
}

func (p *ImageProcessor) processPNG(ctx context.Context, srcPath string, filename string, contentType string) (string, string, string, error) {
	if p.oxipngPath == "" && p.optipngPath == "" {
		return srcPath, filename, contentType, nil
	}

	originalSize := int64(0)
	if info, err := os.Stat(srcPath); err == nil {
		originalSize = info.Size()
	}

	ctx, cancel := context.WithTimeout(ctx, 60*time.Second)
	defer cancel()

	if p.oxipngPath != "" {
		// oxipng -o 2 --strip none <srcPath> (上書き)
		var stderr strings.Builder
		cmd := exec.CommandContext(ctx, p.oxipngPath, "-o", "2", "--strip", "none", srcPath)
		cmd.Stderr = &stderr
		if err := cmd.Run(); err == nil {
			p.logResult("oxipng", srcPath, originalSize)
			return srcPath, filename, contentType, nil
		} else {
			log.Printf("[WARN] oxipng failed: %v, stderr: %s", err, stderr.String())
		}
	}

	if p.optipngPath != "" {
		// optipng -quiet -preserve -clobber <srcPath> (上書き)
		var stderr strings.Builder
		cmd := exec.CommandContext(ctx, p.optipngPath, "-quiet", "-preserve", "-clobber", srcPath)
		cmd.Stderr = &stderr
		if err := cmd.Run(); err == nil {
			p.logResult("optipng", srcPath, originalSize)
			return srcPath, filename, contentType, nil
		} else {
			log.Printf("[WARN] optipng failed: %v, stderr: %s", err, stderr.String())
		}
	}

	return srcPath, filename, contentType, nil
}

func (p *ImageProcessor) processJPEG(ctx context.Context, srcPath string, filename string, contentType string) (string, string, string, error) {
	originalSize := int64(0)
	if info, err := os.Stat(srcPath); err == nil {
		originalSize = info.Size()
	}

	ctx, cancel := context.WithTimeout(ctx, 60*time.Second)
	defer cancel()

	if p.avifencPath != "" {
		dstPath := srcPath + ".avif"
		var stderr strings.Builder
		cmd := exec.CommandContext(ctx, p.avifencPath, "--jobs", "3", "--speed", "8", "--yuv", "444", "-q", "60", srcPath, dstPath)
		cmd.Stderr = &stderr
		// 本番運用のサーバのCPU数が3。--jobs 3 は並列処理数。
		// --speed 8 でほぼ最速設定とする（speed 6 と 7 の間に大きな壁があり、
		// サーバのCPUがあまり高速ではないため、早さを重視）
		if err := cmd.Run(); err == nil {
			newFilename := strings.TrimSuffix(filename, filepath.Ext(filename)) + ".avif"
			p.logResult("avifenc", dstPath, originalSize)
			return dstPath, newFilename, "image/avif", nil
		} else {
			log.Printf("[WARN] avifenc failed: %v, stderr: %s", err, stderr.String())
			// 次の avif ツールへフォールバック
		}
	}

	if p.cavifPath != "" {
		dstPath := srcPath + ".avif"
		var stderr strings.Builder
		cmd := exec.CommandContext(ctx, p.cavifPath, "--quiet", "--speed", "7", "--quality", "80", "-o", dstPath, srcPath)
		cmd.Stderr = &stderr
		// 早さを重視した設定（--speed 7 は高速モード）
		// --quality 80 はavifencの -q 60 と同等品質を目指す
		if err := cmd.Run(); err == nil {
			newFilename := strings.TrimSuffix(filename, filepath.Ext(filename)) + ".avif"
			p.logResult("cavif", dstPath, originalSize)
			return dstPath, newFilename, "image/avif", nil
		} else {
			log.Printf("[WARN] cavif failed: %v, stderr: %s", err, stderr.String())
			// 次の avif ツールへフォールバック
		}
	}

	if p.jpegoptimPath != "" {
		// jpegoptim --strip-none <srcPath> (上書き)
		var stderr strings.Builder
		cmd := exec.CommandContext(ctx, p.jpegoptimPath, "--strip-none", srcPath)
		cmd.Stderr = &stderr
		if err := cmd.Run(); err == nil {
			p.logResult("jpegoptim", srcPath, originalSize)
			return srcPath, filename, contentType, nil
		} else {
			log.Printf("[WARN] jpegoptim failed: %v, stderr: %s", err, stderr.String())
		}
	}

	if p.jpegtranPath != "" {
		// jpegtran -optimize -copy all -outfile <srcPath> <srcPath>
		tmpPath := srcPath + ".tmp"
		var stderr strings.Builder
		cmd := exec.CommandContext(ctx, p.jpegtranPath, "-optimize", "-copy", "all", "-outfile", tmpPath, srcPath)
		cmd.Stderr = &stderr
		if err := cmd.Run(); err == nil {
			if err := os.Rename(tmpPath, srcPath); err != nil {
				return srcPath, filename, contentType, fmt.Errorf("failed to move optimized image back: %w", err)
			}
			p.logResult("jpegtran", srcPath, originalSize)
			return srcPath, filename, contentType, nil
		} else {
			os.Remove(tmpPath)
			log.Printf("[WARN] jpegtran failed: %v, stderr: %s", err, stderr.String())
		}
	}

	return srcPath, filename, contentType, nil
}

func (p *ImageProcessor) logResult(tool string, path string, originalSize int64) {
	if originalSize <= 0 {
		return
	}
	info, err := os.Stat(path)
	if err != nil {
		return
	}
	newSize := info.Size()
	reduction := float64(originalSize-newSize) / float64(originalSize) * 100
	log.Printf("[INFO] %s optimized image: %d -> %d bytes (%.2f%% reduction)", tool, originalSize, newSize, reduction)
}
