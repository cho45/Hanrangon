package main

import (
	"bytes"
	"image"
	"os"
	"testing"

	_ "github.com/vegidio/avif-go"
)

func TestRegisterVegidio(t *testing.T) {
	data, err := os.ReadFile("../../static/fixtures/sample.avif")
	if err != nil {
		t.Fatal(err)
	}

	img, format, err := image.Decode(bytes.NewReader(data))
	if err != nil {
		t.Fatalf("Vegidio registration failed: %v", err)
	}

	t.Logf("Successfully decoded %dx%d %s image using vegidio", img.Bounds().Dx(), img.Bounds().Dy(), format)
	if format != "avif" {
		t.Errorf("Expected format avif, got %s", format)
	}
}
