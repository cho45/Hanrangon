package subcommands

import (
	"context"
	"os"
	"path/filepath"
	"strings"
	"testing"

	"github.com/BurntSushi/toml"
	"golang.org/x/crypto/bcrypt"
)

func TestUpdatePassword(t *testing.T) {
	tests := []struct {
		name          string
		initialConfig string
		newPassword   string
		wantErr       bool
	}{
		{
			name: "Double quotes",
			initialConfig: `
username = "admin"
password = "oldpassword"
base_url = "http://localhost:5555"
`,
			newPassword: "newpassword123",
			wantErr:     false,
		},
		{
			name: "Single quotes",
			initialConfig: `
username = 'admin'
password = 'oldpassword'
`,
			newPassword: "newpassword123",
			wantErr:     false,
		},
		{
			name: "With spaces and comments",
			initialConfig: `
# This is a comment
username = "admin"
password  =  "oldpassword" # another comment
`,
			newPassword: "newpassword123",
			wantErr:     false,
		},
		{
			name: "Missing password key",
			initialConfig: `
username = "admin"
`,
			newPassword: "newpassword123",
			wantErr:     true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			tmpDir := t.TempDir()
			configPath := filepath.Join(tmpDir, "config.toml")
			err := os.WriteFile(configPath, []byte(tt.initialConfig), 0644)
			if err != nil {
				t.Fatal(err)
			}

			ctx := context.Background()
			// Use -password flag to skip interactive prompt
			err = UpdatePassword(ctx, nil, []string{"-config", configPath, "-password", tt.newPassword})

			if (err != nil) != tt.wantErr {
				t.Errorf("UpdatePassword() error = %v, wantErr %v", err, tt.wantErr)
				return
			}

			if tt.wantErr {
				return
			}

			// Verify the updated config
			updatedData, err := os.ReadFile(configPath)
			if err != nil {
				t.Fatal(err)
			}

			var cfg struct {
				Password string `toml:"password"`
			}
			if _, err := toml.Decode(string(updatedData), &cfg); err != nil {
				t.Fatalf("failed to decode updated config: %v\nContent:\n%s", err, string(updatedData))
			}

			err = bcrypt.CompareHashAndPassword([]byte(cfg.Password), []byte(tt.newPassword))
			if err != nil {
				t.Errorf("password in config does not match new password: %v", err)
			}

			// Check if other content is preserved
			if strings.Contains(tt.initialConfig, "username") && !strings.Contains(string(updatedData), "username") {
				t.Error("other config keys were not preserved")
			}
			if strings.Contains(tt.initialConfig, "# This is a comment") && !strings.Contains(string(updatedData), "# This is a comment") {
				t.Error("comments were not preserved")
			}
		})
	}
}

func TestUpdatePassword_EmptyPassword(t *testing.T) {
	tmpDir := t.TempDir()
	configPath := filepath.Join(tmpDir, "config.toml")
	os.WriteFile(configPath, []byte(`password = "old"`), 0644)

	err := UpdatePassword(context.Background(), nil, []string{"-config", configPath, "-password", "  "})

	if err == nil || !strings.Contains(err.Error(), "password cannot be empty") {
		t.Errorf("expected error for empty password, got %v", err)
	}
}
