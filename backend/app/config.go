package app

import (
	"log"
	"os"
	"path/filepath"
	"strconv"
	"strings"

	"github.com/BurntSushi/toml"
)

type Config struct {
	BaseDir         string   `toml:"base_dir"`
	DataDBPath      string   `toml:"data_db_path"`
	ImagesDBPath    string   `toml:"images_db_path"`
	TFIDFDBPath     string   `toml:"tfidf_db_path"`
	WorkerDBPath    string   `toml:"worker_db_path"`
	StaticDir       string   `toml:"static_dir"`
	Username        string   `toml:"username"`
	Password        string   `toml:"password"`
	SessionSecret   string   `toml:"session_secret"`
	UploadDir       string   `toml:"upload_dir"`
	UploadURLPrefix string   `toml:"upload_url_prefix"`
	BaseURL         string   `toml:"base_url"`
	Listen          []string `toml:"listen"`
	Environment     string   `toml:"environment"` // "development" or "production"
	NodePath        string   `toml:"node_path"`

	// Image Optimization Tools (PNG: oxipng > optipng)
	OxipngPath  string `toml:"oxipng_path"`
	OptipngPath string `toml:"optipng_path"`

	// Image Optimization Tools (JPEG: avifenc > cavif > jpegoptim > jpegtran)
	CavifPath     string `toml:"cavif_path"`
	AvifencPath   string `toml:"avifenc_path"`
	JpegoptimPath string `toml:"jpegoptim_path"`
	JpegtranPath  string `toml:"jpegtran_path"`

	// R2 Configuration
	R2EndpointURL     string `toml:"r2_endpoint_url"`
	R2AccessKeyID     string `toml:"r2_access_key_id"`
	R2SecretAccessKey string `toml:"r2_secret_access_key"`
	R2BucketName      string `toml:"r2_bucket_name"`
	R2PublicURL       string `toml:"r2_public_url"`

	// Cloudflare API Configuration (for Analytics)
	CFAPIToken  string `toml:"cf_api_token"`
	CFAccountID string `toml:"cf_account_id"`

	PostprocessIdleTimeout int `toml:"postprocess_idle_timeout"` // seconds
}

func LoadConfig() *Config {
	// 0. Determine BaseDir
	baseDir := os.Getenv("HANRANGON_BASE_DIR")
	if baseDir == "" {
		baseDir, _ = os.Getwd()
	}
	baseDir, _ = filepath.Abs(baseDir)

	// Default values
	varDir := filepath.Join(baseDir, "var")
	staticDir := filepath.Join(baseDir, "static")

	cfg := &Config{
		BaseDir:         baseDir,
		DataDBPath:      filepath.Join(varDir, "db", "data.db"),
		ImagesDBPath:    filepath.Join(varDir, "db", "images.db"),
		TFIDFDBPath:     filepath.Join(varDir, "db", "tfidf.db"),
		WorkerDBPath:    filepath.Join(varDir, "db", "worker.db"),
		StaticDir:       staticDir,
		UploadDir:       filepath.Join(staticDir, "images", "entry"),
		UploadURLPrefix: "/images/entry/",
		BaseURL:         "http://localhost:5555",
		Listen:          []string{":5555"},
		SessionSecret:   "change-me-please", // Default secret
	}
	// 1. Load from TOML (mandatory)
	configPath := os.Getenv("HANRANGON_CONFIG")
	if configPath == "" {
		configPath = filepath.Join(baseDir, "config.toml")
	} else if !filepath.IsAbs(configPath) {
		configPath = filepath.Join(baseDir, configPath)
	}

	if _, err := toml.DecodeFile(configPath, cfg); err != nil {
		log.Fatalf("Fatal: failed to load config from %s: %v", configPath, err)
	}

	// Ensure BaseDir from config is absolute if provided
	if !filepath.IsAbs(cfg.BaseDir) {
		cfg.BaseDir, _ = filepath.Abs(filepath.Join(baseDir, cfg.BaseDir))
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
		cfg.Listen = strings.Split(env, ",")
	}
	if env := os.Getenv("HANRANGON_ENV"); env != "" {
		cfg.Environment = env
	}
	if env := os.Getenv("HANRANGON_NODE_PATH"); env != "" {
		cfg.NodePath = env
	}
	if env := os.Getenv("HANRANGON_POSTPROCESS_IDLE_TIMEOUT"); env != "" {
		if val, err := strconv.Atoi(env); err == nil {
			cfg.PostprocessIdleTimeout = val
		}
	}

	// Image Tools Environment Overrides
	if env := os.Getenv("HANRANGON_OXIPNG_PATH"); env != "" {
		cfg.OxipngPath = env
	}
	if env := os.Getenv("HANRANGON_OPTIPNG_PATH"); env != "" {
		cfg.OptipngPath = env
	}
	if env := os.Getenv("HANRANGON_CAVIF_PATH"); env != "" {
		cfg.CavifPath = env
	}
	if env := os.Getenv("HANRANGON_AVIFENC_PATH"); env != "" {
		cfg.AvifencPath = env
	}
	if env := os.Getenv("HANRANGON_JPEGOPTIM_PATH"); env != "" {
		cfg.JpegoptimPath = env
	}
	if env := os.Getenv("HANRANGON_JPEGTRAN_PATH"); env != "" {
		cfg.JpegtranPath = env
	}

	// Cloudflare API Overrides
	if env := os.Getenv("HANRANGON_CF_API_TOKEN"); env != "" {
		cfg.CFAPIToken = env
	}
	if env := os.Getenv("HANRANGON_CF_ACCOUNT_ID"); env != "" {
		cfg.CFAccountID = env
	}

	// デフォルトは development (開発効率優先)
	if cfg.Environment == "" {
		cfg.Environment = "development"
	}

	if cfg.PostprocessIdleTimeout == 0 {
		if cfg.IsDevelopment() {
			cfg.PostprocessIdleTimeout = 20
		} else {
			cfg.PostprocessIdleTimeout = 1800
		}
	}

	return cfg
}

// IsDevelopment returns true if the environment is development
func (c *Config) IsDevelopment() bool {
	return c.Environment == "development"
}
