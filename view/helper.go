package view

import (
	"io"
	"regexp"
	"strings"
	"unicode/utf8"

	"github.com/cho45/hanrangon/model"
	"golang.org/x/net/html"
)

var htmlTagRegexp = regexp.MustCompile(`<[^>]*>`)
var whitespaceRegexp = regexp.MustCompile(`\s+`)

// FormatDate formats a date string from "2006-01-02" to "2006年 01月 02日"
func FormatDate(dateStr string) string {
	parts := strings.Split(dateStr, "-")
	if len(parts) != 3 {
		return dateStr
	}
	return parts[0] + "年 " + parts[1] + "月 " + parts[2] + "日"
}

// DatePath converts a date string from "2006-01-02" to "/2006/01/02/"
func DatePath(dateStr string) string {
	if len(dateStr) != 10 { // YYYY-MM-DD
		return "/" + strings.ReplaceAll(dateStr, "-", "/") + "/"
	}
	return "/" + dateStr[0:4] + "/" + dateStr[5:7] + "/" + dateStr[8:10] + "/"
}

var isBlock = map[string]bool{
	"p": true, "div": true, "h1": true, "h2": true, "h3": true, "h4": true, "h5": true, "h6": true,
	"li": true, "blockquote": true, "br": true, "hr": true, "table": true, "tr": true,
}

func Summary(htmlContent string, length interface{}) string {
	var l int
	switch v := length.(type) {
	case int:
		l = v
	case int64:
		l = int(v)
	default:
		l = 100
	}

	tokenizer := html.NewTokenizer(strings.NewReader(htmlContent))
	var textBuilder strings.Builder
	textBuilder.Grow(l * 2) // Approximate growth
	skipContent := false
	lastWasSpace := false
	runeCount := 0
	truncated := false

	for {
		tokenType := tokenizer.Next()
		if tokenType == html.ErrorToken {
			if tokenizer.Err() == io.EOF {
				break
			}
			return "" // Parse error
		}

		switch tokenType {
		case html.StartTagToken, html.EndTagToken, html.SelfClosingTagToken:
			nameBytes, _ := tokenizer.TagName()
			tagName := string(nameBytes)
			if tokenType != html.EndTagToken {
				if tagName == "script" || tagName == "style" {
					skipContent = true
				}
			} else {
				if tagName == "script" || tagName == "style" {
					skipContent = false
				}
			}
			if isBlock[tagName] {
				if !lastWasSpace && textBuilder.Len() > 0 {
					textBuilder.WriteByte(' ')
					lastWasSpace = true
				}
			}
		case html.TextToken:
			if !skipContent {
				data := tokenizer.Text()
				for i := 0; i < len(data); {
					r, size := utf8.DecodeRune(data[i:])
					i += size

					if r == ' ' || r == '\n' || r == '\t' || r == '\r' {
						if !lastWasSpace && textBuilder.Len() > 0 {
							textBuilder.WriteByte(' ')
							lastWasSpace = true
							runeCount++
						}
					} else {
						textBuilder.WriteRune(r)
						lastWasSpace = false
						runeCount++
					}

					if runeCount >= l {
						truncated = true
						goto done
					}
				}
			}
		}
	}

done:
	text := textBuilder.String()
	if truncated {
		count := 0
		for i := range text {
			if count == l {
				return text[:i] + "..."
			}
			count++
		}
		return text + "..."
	}

	return strings.TrimSpace(text)
}

func ExtractFirstImage(htmlContent string) string {
	tokenizer := html.NewTokenizer(strings.NewReader(htmlContent))
	for {
		tokenType := tokenizer.Next()
		if tokenType == html.ErrorToken {
			break
		}

		if tokenType == html.StartTagToken || tokenType == html.SelfClosingTagToken {
			name, hasAttr := tokenizer.TagName()
			if string(name) == "img" && hasAttr {
				for {
					key, val, more := tokenizer.TagAttr()
					if string(key) == "src" {
						return string(val)
					}
					if !more {
						break
					}
				}
			}
		}
	}
	return ""
}

type ArchiveYear struct {
	Year   string
	Months []ArchiveMonth
}

type ArchiveMonth struct {
	Year  string
	Month string
	Count int64
}

func ConvertArchives(archives []model.ListArchiveMonthsRow) []ArchiveYear {
	var res []ArchiveYear
	var currentYear *ArchiveYear

	for _, a := range archives {
		year := a.Year.(string)
		month := a.Month.(string)

		if currentYear == nil || currentYear.Year != year {
			if currentYear != nil {
				res = append(res, *currentYear)
			}
			currentYear = &ArchiveYear{
				Year: year,
			}
		}
		currentYear.Months = append(currentYear.Months, ArchiveMonth{
			Year:  year,
			Month: month,
			Count: a.Count,
		})
	}
	if currentYear != nil {
		res = append(res, *currentYear)
	}
	return res
}
