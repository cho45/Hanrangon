package formatter

import (
	"strings"
	"testing"
)

func TestFormat(t *testing.T) {
	tests := []struct {
		name    string
		body    string
		format  string
		wantErr bool
		check   func(t *testing.T, result string)
	}{
		{
			name:    "HTML format",
			body:    "<p>test</p>",
			format:  "HTML",
			wantErr: false,
			check: func(t *testing.T, result string) {
				if !strings.Contains(result, "<p>test</p>") {
					t.Errorf("HTML format failed: got %v", result)
				}
			},
		},
		{
			name:    "Hatena format",
			body:    "*title\ntest",
			format:  "Hatena",
			wantErr: false,
			check: func(t *testing.T, result string) {
				if result == "" {
					t.Error("Hatena format returned empty")
				}
			},
		},
		{
			name:    "tDiary format",
			body:    "^title\ntest",
			format:  "tDiary",
			wantErr: false,
			check: func(t *testing.T, result string) {
				if result == "" {
					t.Error("tDiary format returned empty")
				}
			},
		},
		{
			name:    "Markdown format",
			body:    "# title\ntest",
			format:  "Markdown",
			wantErr: false,
			check: func(t *testing.T, result string) {
				if result == "" {
					t.Error("Markdown format returned empty")
				}
			},
		},
		{
			name:    "Unsupported format",
			body:    "test",
			format:  "Unknown",
			wantErr: true,
			check:   nil,
		},
		{
			name:    "Empty format",
			body:    "test",
			format:  "",
			wantErr: true,
			check:   nil,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result, err := Format(tt.body, tt.format)
			if (err != nil) != tt.wantErr {
				t.Errorf("Format() error = %v, wantErr %v", err, tt.wantErr)
				return
			}
			if !tt.wantErr && tt.check != nil {
				tt.check(t, result)
			}
		})
	}
}
