package formatter

import (
	"html"
	"regexp"
)

var cdataRegexp = regexp.MustCompile(`<!\[CDATA\[([\s\S]*?)\]\]>`)

func FormatHTML(body string) string {
	return cdataRegexp.ReplaceAllStringFunc(body, func(match string) string {
		submatch := cdataRegexp.FindStringSubmatch(match)
		if len(submatch) > 1 {
			return html.EscapeString(submatch[1])
		}
		return match
	})
}
