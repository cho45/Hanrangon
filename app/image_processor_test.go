package app

import (
	"context"
	"os"
	"path/filepath"
	"strings"
	"testing"
)

func TestImageProcessor_Process(t *testing.T) {
	p := NewImageProcessor(&Config{})
	ctx := context.Background()

	// 1x1 PNG (transparent)
	pngData := []byte{
		0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52,
		0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, 0x08, 0x06, 0x00, 0x00, 0x00, 0x1f, 0x15, 0xc4,
		0x89, 0x00, 0x00, 0x00, 0x0a, 0x49, 0x44, 0x41, 0x54, 0x08, 0xd7, 0x63, 0x60, 0x00, 0x02, 0x00,
		0x00, 0x05, 0x00, 0x01, 0x0d, 0x26, 0xe5, 0x2e, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4e, 0x44,
		0xae, 0x42, 0x60, 0x82,
	}

	// Use real JPEG file
	wd, _ := os.Getwd()
	jpgPathOriginal := filepath.Join(wd, "..", "static", "images", "profile.jpg")
	jpgData, err := os.ReadFile(jpgPathOriginal)
	if err != nil {
		t.Fatalf("Failed to read test JPEG: %v", err)
	}

	createTempFile := func(data []byte, name string) string {
		f, err := os.CreateTemp("", "imgtest-*"+filepath.Ext(name))
		if err != nil {
			t.Fatal(err)
		}
		defer f.Close()
		f.Write(data)
		return f.Name()
	}

	t.Run("PNG Optimization", func(t *testing.T) {
		if p.oxipngPath == "" && p.optipngPath == "" {
			t.Skip("Neither oxipng nor optipng found")
		}
		path := createTempFile(pngData, "test.png")
		defer os.Remove(path)

		resPath, resName, resType, err := p.ProcessFile(ctx, path, "test.png", "image/png")
		if err != nil {
			t.Fatalf("Process failed: %v", err)
		}
		defer os.Remove(resPath) // in case path changed

		if resName != "test.png" {
			t.Errorf("Expected filename test.png, got %s", resName)
		}
		if resType != "image/png" {
			t.Errorf("Expected Content-Type image/png, got %s", resType)
		}

		resData, _ := os.ReadFile(resPath)
		if !strings.HasPrefix(string(resData[1:4]), "PNG") {
			t.Error("Result data is not a PNG")
		}
	})

	t.Run("JPEG to AVIF Conversion", func(t *testing.T) {
		if p.cavifPath == "" && p.avifencPath == "" {
			t.Skip("Neither cavif nor avifenc found")
		}
		path := createTempFile(jpgData, "test.jpg")
		defer os.Remove(path)

		resPath, resName, resType, err := p.ProcessFile(ctx, path, "test.jpg", "image/jpeg")
		if err != nil {
			t.Fatalf("Process failed: %v", err)
		}
		defer os.Remove(resPath)

		if !strings.HasSuffix(resName, ".avif") {
			t.Errorf("Expected extension .avif, got %s", resName)
		}
		if resType != "image/avif" {
			t.Errorf("Expected Content-Type image/avif, got %s", resType)
		}
	})

	t.Run("JPEG Optimization (Fallback)", func(t *testing.T) {
		if p.jpegoptimPath == "" && p.jpegtranPath == "" {
			t.Skip("Neither jpegoptim nor jpegtran found")
		}
		// AVIFツールを一時的に空にしてフォールバックをテストする
		originalCavif := p.cavifPath
		originalAvifenc := p.avifencPath
		p.cavifPath = ""
		p.avifencPath = ""
		defer func() {
			p.cavifPath = originalCavif
			p.avifencPath = originalAvifenc
		}()

		path := createTempFile(jpgData, "test.jpg")

		resPath, _, _, err := p.ProcessFile(ctx, path, "test.jpg", "image/jpeg")
		if err != nil {
			t.Fatalf("Process failed: %v", err)
		}
		defer os.Remove(resPath)

		if resPath == "" {
			t.Errorf("Expected resPath, got empty")
		}
	})

	t.Run("No tools available (Fallback to original)", func(t *testing.T) {
		emptyP := &ImageProcessor{}
		path := createTempFile(pngData, "test.png")
		defer os.Remove(path)

		resPath, _, _, err := emptyP.ProcessFile(ctx, path, "test.png", "image/png")
		if err != nil || resPath != path {
			t.Errorf("PNG fallback failed")
		}
	})
}
