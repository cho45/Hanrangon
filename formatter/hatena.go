package formatter

import (
	"context"
	"fmt"
	htmltemplate "html/template"
	"regexp"
	"strings"

	"github.com/cho45/xatena-go/pkg/xatena"
)

// Replicate templates from Nogag::Formatter::Hatena.pm
var hatenaTemplates = map[string]string{
	"superpre":   `{{ if contains .Class "lang-math" }}<p class="{{ .Class }}">{{ .RawText }}</p>{{ else }}<pre class="{{ .Class }}">{{ .RawText }}</pre>{{ end }}`,
	"section":    `<section class="level-{{ add .Level -2 }}"><h{{ .Level }}>{{ .Title }}</h{{ .Level }}>{{ .Content }}</section>`,
	"blockquote": `<figure class="quote"><blockquote{{ if .Cite }} cite="{{ .Cite }}"{{ end }}>{{ .Content }}</blockquote>{{ if .Title }}<figcaption><cite>{{ .Title }}</cite></figcaption>{{ end }}</figure>`,
	"seemore":    `<!-- seemore --><section class="seemore">{{ .Content }}</section><!-- /seemore -->`,
}

func FormatHatena(body string) (res string, err error) {
	defer func() {
		if r := recover(); r != nil {
			err = fmt.Errorf("panic in xatena-go: %v", r)
		}
	}()

	// Define custom inline rules
	inline := xatena.NewInlineFormatter()

	// f:id:user:id[jpeg]:image
	reFotolife := regexp.MustCompile(`\[?f:id:([^:]+):(\d+)([jpeg]):image\]?`)
	inline.AddRule(xatena.InlineRule{
		Pattern: reFotolife,
		Handler: func(ctx context.Context, f *xatena.InlineFormatter, m []string) string {
			user := m[1]
			id := m[2]
			extType := m[3]

			ext := "jpg"
			switch extType {
			case "p":
				ext = "png"
			case "g":
				ext = "gif"
			}

			imgURL := fmt.Sprintf("https://cdn-ak.f.st-hatena.com/images/fotolife/%s/%s/%s/%s.%s",
				user[0:1], user, id[0:8], id, ext)

			return fmt.Sprintf(`<span itemscope itemtype="http://schema.org/Photograph"><a class="hatena-fotolife" href="%s" itemprop="url"><img src="%s" alt="photo" class="hatena-fotolife" itemprop="image"/></a></span>`,
				imgURL, imgURL)
		},
	})

	// asin:ASIN:detail
	reAsin := regexp.MustCompile(`\[?asin:([^\]:]+):detail\]?`)
	inline.AddRule(xatena.InlineRule{
		Pattern: reAsin,
		Handler: func(ctx context.Context, f *xatena.InlineFormatter, m []string) string {
			asin := m[1]
			return fmt.Sprintf(`<a href="https://www.amazon.co.jp/dp/%s">asin:%s:detail</a>`, asin, asin)
		},
	})

	x := xatena.NewXatenaWithInline(inline)

	// Custom templates
	for name, src := range hatenaTemplates {
		t := htmltemplate.New(name).Funcs(htmltemplate.FuncMap{
			"add":      func(a, b int) int { return a + b },
			"contains": func(s, substr string) bool { return strings.Contains(s, substr) },
		})
		t, err := t.Parse(src)
		if err == nil {
			x.Templates[name] = t
		}
	}

	htmlBody := x.ToHTML(context.Background(), strings.TrimSpace(body))

	// Footnotes handling
	// x.Inline is an interface, we expect it to be *xatena.InlineFormatter
	if inline, ok := x.Inline.(*xatena.InlineFormatter); ok {
		footnotes := inline.Footnotes()
		if len(footnotes) > 0 {
			var sb strings.Builder
			sb.WriteString(htmlBody)
			sb.WriteString("\n<div class=\"footnotes\">\n")
			for _, fn := range footnotes {
				// We use id="fnX" to match href="#fnX" in the body,
				// and href="#fX" to allow returning to the body (if body has id="fX").
				// xatena-go default doesn't provide id="fX" in body yet, but we match the pattern.
				fmt.Fprintf(&sb, "<p class=\"footnote\"><a href=\"#f%d\" id=\"fn%d\" name=\"fn%d\">*%d</a>: %s</p>\n",
					fn.Number, fn.Number, fn.Number, fn.Number, fn.Note)
			}
			sb.WriteString("</div>\n")
			htmlBody = sb.String()
		}
	}

	return htmlBody, nil
}
