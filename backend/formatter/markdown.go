package formatter

import (
	"bytes"
	"regexp"

	"github.com/yuin/goldmark"
	"github.com/yuin/goldmark/extension"
	"github.com/yuin/goldmark/parser"
	"github.com/yuin/goldmark/renderer/html"
)

var md = goldmark.New(
	goldmark.WithExtensions(extension.GFM),
	goldmark.WithParserOptions(
		parser.WithAutoHeadingID(),
	),
	goldmark.WithRendererOptions(
		html.WithUnsafe(),
	),
)

var mdCommentRegexp = regexp.MustCompile(`(?s)<!--[\s\S]*?-->`)

func FormatMarkdown(body string) (string, error) {
	var buf bytes.Buffer
	if err := md.Convert([]byte(body), &buf); err != nil {
		return "", err
	}
	// セキュリティと互換性のため、HTML コメントを除去する
	res := mdCommentRegexp.ReplaceAllString(buf.String(), "")
	return res, nil
}
