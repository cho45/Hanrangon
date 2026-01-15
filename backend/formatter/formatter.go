package formatter

import (
	"fmt"
)

func Format(body string, format string) (string, error) {
	switch format {
	case "HTML":
		return FormatHTML(body)
	case "Hatena":
		return FormatHatena(body)
	case "tDiary":
		return FormatTDiary(body)
	case "Markdown":
		return FormatMarkdown(body)
	default:
		// 未知のフォーマットの場合はエラーを返す
		return "", fmt.Errorf("unsupported format: %s", format)
	}
}
