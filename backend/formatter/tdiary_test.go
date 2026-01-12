package formatter

import (
	"strings"
	"testing"
)

func TestFormatTDiary(t *testing.T) {
	tests := []struct {
		name string
		body string
		want []string
	}{
		{
			name: "plain text",
			body: "line1\nline2",
			want: []string{"<p>line1</p><p>line2</p>"},
		},
		{
			name: "empty lines",
			body: "line1\n\nline2",
			want: []string{"<p>line1</p><p></p><p>line2</p>"},
		},
		{
			name: "link",
			body: `{{a "Title|http://example.com"}}`,
			want: []string{`<a href="http://example.com">Title</a>`},
		},
		{
			name: "link without title",
			body: `{{a "http://example.com"}}`,
			want: []string{`<a href="http://example.com">http://example.com</a>`},
		},
		{
			name: "blockquote",
			body: "{{bq <<OK\nquoted text\nOK}}",
			want: []string{"<blockquote><p>quoted text</p></blockquote>"},
		},
		{
			name: "blockquote with title and cite",
			body: `{{bq <<OK, "Title", "http://cite.com"
quoted text
OK}}`,
			want: []string{`<blockquote title="Title" cite="http://cite.com"><p>quoted text</p></blockquote>`},
		},
		{
			name: "list short",
			body: "{{ul \"item1\nitem2\"}}",
			want: []string{"<ul><li>item1</li><li>item2</li></ul>"},
		},
		{
			name: "footnote",
			body: `{{fn "note text"}}`,
			want: []string{`<span title="note text">*</span>`},
		},
		{
			name: "my link",
			body: `{{my "20250101#p1", "Label"}}`,
			want: []string{`<a href="/2025/01/01/1">Label</a>`},
		},
		{
			name: "erb style and no space",
			body: `<%=a"title|url"%>`,
			want: []string{`<a href="url">title</a>`},
		},
		{
			name: "erb style with space",
			body: `<%= a "url" %>`,
			want: []string{`<a href="url">url</a>`},
		},
		{
			name: "erb style footnote",
			body: `<%=fn"note"%>`,
			want: []string{`<span title="note">*</span>`},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, err := FormatTDiary(tt.body)
			if err != nil {
				t.Errorf("FormatTDiary() error = %v", err)
				return
			}
			for _, w := range tt.want {
				if !strings.Contains(got, w) {
					t.Errorf("FormatTDiary() output does not contain %q\nGot: %s", w, got)
				}
			}
		})
	}
}
