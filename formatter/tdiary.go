package formatter

import (
	"fmt"
	"regexp"
	"strings"
)

var (
	reTDiaryPlugin = regexp.MustCompile(`(?s)(?:{{|<%=)([\s\S]+?)(?:}}|%>)`)
	// Basic regexes for internal parsing
	reBqHeader     = regexp.MustCompile(`(?s)^bq <<(\w+)(?:, ['"]([^'"']+)["'])?(?:, ['"]([^'"']+)["'])?`)
	reUlLongHeader = regexp.MustCompile(`(?s)^(ul|ol) <<(\w+)`)
	// Simplified to avoid backreferences
	reA         = regexp.MustCompile(`(?s)a\s*(?:'|")(?:([^|]+)\|)?(.+?)(?:'|")`)
	reUlOlShort = regexp.MustCompile(`(?s)(ul|ol)\s*(?:'|")(.+?)(?:'|")`)
	reFn        = regexp.MustCompile(`(?s)fn\s*(?:'|")(.+?)(?:'|")`)
	reMy        = regexp.MustCompile(`(?s)my\s*(?:'|")(\d{4})(\d{2})(\d{2})#p(\d+)(?:'|"),\s*(?:'|")([^'"]+)(?:'|")`)
)

func FormatTDiary(body string) (string, error) {
	res := reTDiaryPlugin.ReplaceAllStringFunc(body, func(match string) string {
		sub := reTDiaryPlugin.FindStringSubmatch(match)
		if len(sub) < 2 {
			return match
		}
		content := strings.TrimSpace(sub[1])

		// a
		if m := reA.FindStringSubmatch(content); m != nil {
			title, url := m[1], m[2]
			if title == "" {
				title = url
			}
			return fmt.Sprintf(`<a href="%s">%s</a>`, url, title)
		}

		// fn
		if m := reFn.FindStringSubmatch(content); m != nil {
			return fmt.Sprintf(`<span title="%s">*</span>`, m[1])
		}

		// my
		if m := reMy.FindStringSubmatch(content); m != nil {
			path := fmt.Sprintf("%s/%s/%s/%s", m[1], m[2], m[3], m[4])
			return fmt.Sprintf(`<a href="/%s">%s</a>`, path, m[5])
		}

		// ul/ol short
		if m := reUlOlShort.FindStringSubmatch(content); m != nil {
			name, str := m[1], m[2]
			items := strings.Split(str, "\n")
			return fmt.Sprintf(`<%s><li>%s</li></%s>`, name, strings.Join(items, "</li><li>"), name)
		}

		// bq (heredoc style)
		if m := reBqHeader.FindStringSubmatch(content); m != nil {
			tag := m[1]
			title := m[2]
			cite := m[3]

			lines := strings.Split(content, "\n")
			if len(lines) > 1 {
				var quoteLines []string
				found := false
				for i := 1; i < len(lines); i++ {
					if lines[i] == tag {
						found = true
						break
					}
					quoteLines = append(quoteLines, lines[i])
				}
				if found {
					quote := strings.Join(quoteLines, "\n")
					if cite != "" {
						return fmt.Sprintf(`<blockquote title="%s" cite="%s"><p>%s</p></blockquote>`, title, cite, quote)
					} else if title != "" {
						return fmt.Sprintf(`<blockquote title="%s"><p>%s</p></blockquote>`, title, quote)
					}
					return fmt.Sprintf(`<blockquote><p>%s</p></blockquote>`, quote)
				}
			}
		}

		// ul/ol long (heredoc style)
		if m := reUlLongHeader.FindStringSubmatch(content); m != nil {
			name := m[1]
			tag := m[2]

			lines := strings.Split(content, "\n")
			if len(lines) > 1 {
				var itemLines []string
				found := false
				for i := 1; i < len(lines); i++ {
					if lines[i] == tag {
						found = true
						break
					}
					itemLines = append(itemLines, lines[i])
				}
				if found {
					return fmt.Sprintf(`<%s><li>%s</li></%s>`, name, strings.Join(itemLines, "</li><li>"), name)
				}
			}
		}

		return match // fallback
	})

	// Wrap every line in <p> tags, including empty ones, matching original Perl logic
	lines := strings.Split(res, "\n")
	var sb strings.Builder
	for _, line := range lines {
		sb.WriteString("<p>")
		sb.WriteString(line)
		sb.WriteString("</p>")
	}
	return sb.String(), nil
}
