package view

import (
	"testing"
)

func TestSummary(t *testing.T) {
	tests := []struct {
		name   string
		html   string
		length interface{}
		want   string
	}{
		{
			name:   "Basic text",
			html:   "<p>Hello world</p>",
			length: 100,
			want:   "Hello world",
		},
		{
			name:   "Strip tags",
			html:   "<div><span>Hello</span> <b>Go</b></div>",
			length: 100,
			want:   "Hello Go",
		},
		{
			name:   "Skip script and style",
			html:   "<p>Visible</p><script>alert(1)</script><style>body { color: red }</style><p>Text</p>",
			length: 100,
			want:   "Visible Text",
		},
		{
			name:   "Block elements spacing",
			html:   "<div>Line 1</div><div>Line 2</div><p>Para</p>Next",
			length: 100,
			want:   "Line 1 Line 2 Para Next",
		},
		{
			name:   "Truncation",
			html:   "<p>This is a long text that should be truncated.</p>",
			length: 10,
			want:   "This is a ...",
		},
		{
			name:   "Int64 length",
			html:   "<p>Testing int64</p>",
			length: int64(7),
			want:   "Testing...",
		},
		{
			name:   "Handle line breaks and whitespace",
			html:   "<p>Line\nBreak</p>  <p>  Multiple   Spaces  </p>",
			length: 100,
			want:   "Line Break Multiple Spaces",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := Summary(tt.html, tt.length); got != tt.want {
				t.Errorf("Summary() = %q, want %q", got, tt.want)
			}
		})
	}
}
