package formatter

import (
	"strings"
	"testing"
)

func TestFormatMarkdown(t *testing.T) {
	tests := []struct {
		name string
		body string
		want []string
	}{
		{
			name: "basic markdown",
			body: "# Title\n\n- item 1\n- item 2",
			want: []string{"<h1", "Title</h1>", "<ul>", "<li>item 1</li>", "<li>item 2</li>"},
		},
		{
			name: "unsafe html",
			body: "<div>unsafe</div>",
			want: []string{"<div>unsafe</div>"},
		},
		{
			name: "gfm table",
			body: "| a | b |\n|---|---|\n| 1 | 2 |",
			want: []string{"<table>", "<thead>", "<tbody>", "<td>1</td>"},
		},
		{
			name: "strip comments",
			body: "hello <!-- secret --> world",
			want: []string{"<p>hello  world</p>"},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, err := FormatMarkdown(tt.body)
			if err != nil {
				t.Fatalf("FormatMarkdown() error = %v", err)
			}
			for _, w := range tt.want {
				if !strings.Contains(got, w) {
					t.Errorf("FormatMarkdown() output does not contain %q\nGot: %s", w, got)
				}
			}
		})
	}
}
