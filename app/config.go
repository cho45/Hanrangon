package app

import (
	"log"
	"os"
	"path/filepath"

	"github.com/BurntSushi/toml"
)

type Config struct {
	DataDBPath      string `toml:"data_db_path"`
	ImagesDBPath    string `toml:"images_db_path"`
	TFIDFDBPath     string `toml:"tfidf_db_path"`
	WorkerDBPath    string `toml:"worker_db_path"`
	StaticDir       string `toml:"static_dir"`
	Username        string `toml:"username"`
	Password        string `toml:"password"`
	SessionSecret   string `toml:"session_secret"`
	UploadDir       string `toml:"upload_dir"`
	UploadURLPrefix string `toml:"upload_url_prefix"`
	BaseURL         string `toml:"base_url"`
	Listen          string `toml:"listen"`
	Environment     string `toml:"environment"` // "development" or "production"
	NodePath        string `toml:"node_path"`
}

func LoadConfig() *Config {
	// Default values
	wd, _ := os.Getwd()
	varDir := filepath.Join(wd, "var")
	staticDir := filepath.Join(wd, "static")

	cfg := &Config{
		DataDBPath:      filepath.Join(varDir, "db", "data.db"),
		ImagesDBPath:    filepath.Join(varDir, "db", "images.db"),
		TFIDFDBPath:     filepath.Join(varDir, "db", "tfidf.db"),
		WorkerDBPath:    filepath.Join(varDir, "db", "worker.db"),
		StaticDir:       staticDir,
		UploadDir:       filepath.Join(staticDir, "images", "entry"),
		UploadURLPrefix: "/images/entry/",
		BaseURL:         "http://localhost:5555",
		Listen:          ":5555",
		SessionSecret:   "change-me-please", // Default secret
	}
	// 1. Load from TOML (mandatory)
	configPath := os.Getenv("HANRANGON_CONFIG")
	if configPath == "" {
		configPath = "config.toml"
	}

	if _, err := toml.DecodeFile(configPath, cfg); err != nil {
		log.Fatalf("Fatal: failed to load config from %s: %v", configPath, err)
	}

	// 2. Override with individual environment variables (for backward compatibility)
	if env := os.Getenv("HANRANGON_DB_DATA"); env != "" {
		cfg.DataDBPath = env
	}
	if env := os.Getenv("HANRANGON_DB_IMAGES"); env != "" {
		cfg.ImagesDBPath = env
	}
	if env := os.Getenv("HANRANGON_DB_TFIDF"); env != "" {
		cfg.TFIDFDBPath = env
	}
	if env := os.Getenv("HANRANGON_DB_WORKER"); env != "" {
		cfg.WorkerDBPath = env
	}
	if env := os.Getenv("HANRANGON_STATIC_DIR"); env != "" {
		cfg.StaticDir = env
	}
	if env := os.Getenv("HANRANGON_UPLOAD_DIR"); env != "" {
		cfg.UploadDir = env
	}
	if env := os.Getenv("HANRANGON_UPLOAD_URL_PREFIX"); env != "" {
		cfg.UploadURLPrefix = env
	}
	if env := os.Getenv("HANRANGON_BASE_URL"); env != "" {
		cfg.BaseURL = env
	}
	if env := os.Getenv("HANRANGON_LISTEN"); env != "" {
		cfg.Listen = env
	}
	if env := os.Getenv("HANRANGON_ENV"); env != "" {
		cfg.Environment = env
	}
	if env := os.Getenv("HANRANGON_NODE_PATH"); env != "" {
		cfg.NodePath = env
	}

	// デフォルトは development (開発効率優先)
	if cfg.Environment == "" {
		cfg.Environment = "development"
	}

	return cfg
}

// IsDevelopment returns true if the environment is development
func (c *Config) IsDevelopment() bool {
	return c.Environment == "development"
}
