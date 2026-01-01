package formatter

import (
	"strings"
	"testing"
)

func TestFormatHatena(t *testing.T) {
	tests := []struct {
		name string
		body string
		want []string
	}{
		{
			name: "basic",
			body: "* heading\nbody",
			want: []string{"<section class=\"level-1\">", "<h3>heading</h3>", "<p>body</p>"},
		},
		{
			name: "footnotes",
			body: "hello((note1))\nworld((note2))",
			want: []string{
				"<p>hello<a href=\"#fn1\" title=\"note1\">*1</a><br />",
				"<div class=\"footnotes\">",
				"<p class=\"footnote\"><a href=\"#f1\" id=\"fn1\" name=\"fn1\">*1</a>: note1</p>",
				"<p class=\"footnote\"><a href=\"#f2\" id=\"fn2\" name=\"fn2\">*2</a>: note2</p>",
			},
		},
		{
			name: "superpre",
			body: ">|go|\nfunc main() {}\n||<",
			want: []string{`<pre class="code lang-go">func main() {}</pre>`},
		},
		{
			name: "math",
			body: ">|math|\nE=mc^2\n||<",
			want: []string{`<p class="code lang-math">E=mc^2</p>`},
		},
		{
			name: "html-tag",
			body: "><ins datetime=\"2026-01-01T00:00:00+09:00\"><\ncontent\n></ins><",
			want: []string{"<ins datetime=\"2026-01-01T00:00:00+09:00\">", "content", "</ins>"},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, err := FormatHatena(tt.body)
			if err != nil {
				t.Fatalf("FormatHatena() error = %v", err)
			}
			for _, w := range tt.want {
				if !strings.Contains(got, w) {
					t.Errorf("FormatHatena() output does not contain %q\nGot: %s", w, got)
				}
			}
		})
	}
}
