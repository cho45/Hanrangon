package testutil

import (
	"os"
	"path/filepath"
	"runtime"
)

// SetupEnvironment sets HANRANGON_BASE_DIR to the project root
// and points HANRANGON_CONFIG to a temporary empty file to avoid
// loading the production config.toml.
func SetupEnvironment() {
	_, filename, _, _ := runtime.Caller(0)
	// internal/testutil/root.go から 2 段上がるとルート
	root := filepath.Join(filepath.Dir(filename), "..", "..")
	os.Setenv("HANRANGON_BASE_DIR", root)

	// Create a persistent temporary file for the duration of the test process
	tmpDir := os.TempDir()
	configPath := filepath.Join(tmpDir, "hanrangon-test-config.toml")
	_ = os.WriteFile(configPath, []byte(""), 0644)
	os.Setenv("HANRANGON_CONFIG", configPath)
}
