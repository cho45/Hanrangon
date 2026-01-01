package formatter

import (
	"fmt"
)

func Format(body string, format string) (string, error) {
	switch format {
	case "HTML":
		return FormatHTML(body), nil
	default:
		// Unknown format, fallback to plain HTML or error
		return "", fmt.Errorf("unsupported format: %s", format)
	}
}
