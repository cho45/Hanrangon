package main

import (
	"bytes"
	"os"
	"testing"

	gen2brain_avif "github.com/gen2brain/avif"
	vegidio_avif "github.com/vegidio/avif-go"
)

func BenchmarkGen2brain(b *testing.B) {
	data, err := os.ReadFile("../../static/fixtures/sample.avif")
	if err != nil {
		b.Fatal(err)
	}

	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		r := bytes.NewReader(data)
		_, err := gen2brain_avif.Decode(r)
		if err != nil {
			b.Fatal(err)
		}
	}
}

func BenchmarkVegidio(b *testing.B) {
	data, err := os.ReadFile("../../static/fixtures/sample.avif")
	if err != nil {
		b.Fatal(err)
	}

	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		r := bytes.NewReader(data)
		_, err := vegidio_avif.Decode(r)
		if err != nil {
			b.Fatal(err)
		}
	}
}
