package app

import (
	"os"
	"path/filepath"
	"testing"

	"github.com/cho45/hanrangon/internal/testutil"
)

func TestLoadConfig(t *testing.T) {
	testutil.SetupEnvironment()
	baseDir := os.Getenv("HANRANGON_BASE_DIR")

	// Create a temporary TOML file for testing
	tomlPath := filepath.Join(baseDir, "test_config.toml")
	tomlContent := `
	data_db_path = "from_toml_data"
	static_dir = "from_toml_static"
	`
	if err := os.WriteFile(tomlPath, []byte(tomlContent), 0644); err != nil {
		t.Fatalf("failed to create test toml: %v", err)
	}
	defer os.Remove(tomlPath)

	// Set env var for config path
	os.Setenv("HANRANGON_CONFIG", tomlPath)
	defer os.Unsetenv("HANRANGON_CONFIG")

	// Set env var for override
	os.Setenv("HANRANGON_STATIC_DIR", "from_env_static")
	defer os.Unsetenv("HANRANGON_STATIC_DIR")

	cfg := LoadConfig()

	if cfg.DataDBPath != "from_toml_data" {
		t.Errorf("want from_toml_data, got %s", cfg.DataDBPath)
	}
	if cfg.StaticDir != "from_env_static" {
		t.Errorf("want from_env_static (override), got %s", cfg.StaticDir)
	}
}
