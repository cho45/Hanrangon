package formatter

import (
	"html"
	"regexp"
)

var cdataRegexp = regexp.MustCompile(`<!\[CDATA\[([\s\S]*?)\]\]>`)
var htmlCommentRegexp = regexp.MustCompile(`(?s)<!--[\s\S]*?-->`)

func FormatHTML(body string) (string, error) {
	res := cdataRegexp.ReplaceAllStringFunc(body, func(match string) string {
		submatch := cdataRegexp.FindStringSubmatch(match)
		if len(submatch) > 1 {
			return html.EscapeString(submatch[1])
		}
		return match
	})
	return htmlCommentRegexp.ReplaceAllString(res, ""), nil
}
