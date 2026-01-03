package formatter

import "testing"

func TestFormatHTML(t *testing.T) {
	tests := []struct {
		name string
		body string
		want string
	}{
		{
			name: "plain html",
			body: "<div>hello</div>",
			want: "<div>hello</div>",
		},
		{
			name: "cdata",
			body: "<div><![CDATA[<script>alert(1)</script>]]></div>",
			want: "<div>&lt;script&gt;alert(1)&lt;/script&gt;</div>",
		},
		{
			name: "multiple cdata",
			body: "<![CDATA[<a>]]> and <![CDATA[<b>]]>",
			want: "&lt;a&gt; and &lt;b&gt;",
		},
		{
			name: "strip comments",
			body: "hello<!-- secret -->world",
			want: "helloworld",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, err := FormatHTML(tt.body)
			if err != nil {
				t.Errorf("FormatHTML() error = %v", err)
				return
			}
			if got != tt.want {
				t.Errorf("FormatHTML() = %v, want %v", got, tt.want)
			}
		})
	}
}
