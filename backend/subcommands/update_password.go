package subcommands

import (
	"context"
	"flag"
	"fmt"
	"log"
	"os"
	"regexp"
	"strings"

	"github.com/cho45/hanrangon/backend/app"
	"golang.org/x/crypto/bcrypt"
	"golang.org/x/term"
)

func UpdatePassword(ctx context.Context, application app.App, args []string) error {
	fs := flag.NewFlagSet("update-password", flag.ExitOnError)
	configPath := fs.String("config", "config.toml", "path to config file")
	fs.Parse(args)

	fmt.Print("Enter new password: ")
	bytePassword, err := term.ReadPassword(int(os.Stdin.Fd()))
	if err != nil {
		return fmt.Errorf("failed to read password: %w", err)
	}
	fmt.Println()

	password := strings.TrimSpace(string(bytePassword))
	if password == "" {
		return fmt.Errorf("password cannot be empty")
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return fmt.Errorf("failed to hash password: %w", err)
	}

	// Read existing config as map to preserve other fields/comments if possible,
	// but toml.Encode will just write the struct.
	// To preserve exactly what's there we'd need more complex logic,
	// but for this project struct-based rewrite should be fine.

	configData, err := os.ReadFile(*configPath)
	if err != nil {
		return fmt.Errorf("failed to read config file: %w", err)
	}

	// Use regex to replace the password value while preserving comments and formatting.
	// This matches `password = "..."` or `password = '...'`.
	re := regexp.MustCompile(`(?m)^(password\s*=\s*)"[^"]*"`)
	if !re.Match(configData) {
		// Try single quotes if double quotes not found
		re = regexp.MustCompile(`(?m)^(password\s*=\s*)'[^']*'`)
	}

	newConfigData := re.ReplaceAllFunc(configData, func(match []byte) []byte {
		prefix := re.FindSubmatch(match)[1]
		return append(prefix, []byte(fmt.Sprintf(`"%s"`, string(hashedPassword)))...)
	})

	if len(newConfigData) == len(configData) && string(newConfigData) == string(configData) {
		return fmt.Errorf("could not find password key in config file. Please ensure it exists as 'password = \"...\"'")
	}

	err = os.WriteFile(*configPath, newConfigData, 0644)
	if err != nil {
		return fmt.Errorf("failed to write config file: %w", err)
	}

	log.Printf("Password updated successfully in %s", *configPath)
	return nil
}
