package main

import (
	"os"
	"path/filepath"
)

type Config struct {
	DataDBPath   string
	ImagesDBPath string
	TFIDFDBPath  string
	StaticDir    string
}

func LoadConfig() *Config {
	// Default paths
	wd, _ := os.Getwd()
	varDir := filepath.Join(wd, "var")
	staticDir := filepath.Join(wd, "../static") // Dev default

	cfg := &Config{
		DataDBPath:   filepath.Join(varDir, "db", "data.db"),
		ImagesDBPath: filepath.Join(varDir, "db", "images.db"),
		TFIDFDBPath:  filepath.Join(varDir, "db", "tfidf.db"),
		StaticDir:    staticDir,
	}

	if env := os.Getenv("HANRANGON_DB_DATA"); env != "" {
		cfg.DataDBPath = env
	}
	if env := os.Getenv("HANRANGON_DB_IMAGES"); env != "" {
		cfg.ImagesDBPath = env
	}
	if env := os.Getenv("HANRANGON_DB_TFIDF"); env != "" {
		cfg.TFIDFDBPath = env
	}
	if env := os.Getenv("HANRANGON_STATIC_DIR"); env != "" {
		cfg.StaticDir = env
	}

	return cfg
}
