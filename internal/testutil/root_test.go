package testutil

import (
	"os"
	"testing"
)

func TestSetupEnvironment(t *testing.T) {
	// 元の環境変数を保存（テスト後に復元するためではないが、テスト内で変更されることを確認するため）
	oldBaseDir := os.Getenv("HANRANGON_BASE_DIR")
	oldConfig := os.Getenv("HANRANGON_CONFIG")
	oldEnv := os.Getenv("HANRANGON_ENV")

	// テスト実行
	SetupEnvironment()

	// HANRANGON_BASE_DIR のチェック
	baseDir := os.Getenv("HANRANGON_BASE_DIR")
	if baseDir == "" {
		t.Error("HANRANGON_BASE_DIR should not be empty")
	}
	// 少なくともこのディレクトリが存在することを確認
	if _, err := os.Stat(baseDir); os.IsNotExist(err) {
		t.Errorf("HANRANGON_BASE_DIR path does not exist: %s", baseDir)
	}

	// HANRANGON_CONFIG のチェック
	configPath := os.Getenv("HANRANGON_CONFIG")
	if configPath == "" {
		t.Error("HANRANGON_CONFIG should not be empty")
	}
	if _, err := os.Stat(configPath); os.IsNotExist(err) {
		t.Errorf("HANRANGON_CONFIG file does not exist: %s", configPath)
	}

	// HANRANGON_ENV のチェック
	env := os.Getenv("HANRANGON_ENV")
	if env != "test" {
		t.Errorf("expected HANRANGON_ENV to be 'test', got '%s'", env)
	}

	// クリーンアップ（他のテストに影響を与えないように、必要であれば元の値に戻すが、
	// 通常 testutil.SetupEnvironment は init や TestMain で呼ばれる想定なので
	// ここでは検証のみ行う）
	_ = oldBaseDir
	_ = oldConfig
	_ = oldEnv
}
