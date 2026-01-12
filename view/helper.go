package view

import (
	"io"
	"strings"
	"unicode/utf8"

	"github.com/cho45/hanrangon/model"
	"golang.org/x/net/html"
)

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

func isBlockTag(tagName string) bool {
	switch len(tagName) {
	case 1:
		return tagName == "p"
	case 2:
		switch tagName {
		case "li", "tr", "br", "hr":
			return true
		}
	case 3:
		switch tagName {
		case "div", "h1", "h2", "h3", "h4", "h5", "h6":
			return true
		}
	case 5:
		return tagName == "table"
	case 10:
		return tagName == "blockquote"
	}
	return false
}

func ExtractSummaryAndFirstImage(htmlContent string, length interface{}) (string, string) {
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
	textBuilder.Grow(l * 2)
	skipContent := false
	lastWasSpace := false
	runeCount := 0
	truncated := false
	firstImage := ""

	for {
		tokenType := tokenizer.Next()
		if tokenType == html.ErrorToken {
			if tokenizer.Err() == io.EOF {
				break
			}
			return "", ""
		}

		switch tokenType {
		case html.StartTagToken, html.SelfClosingTagToken:
			nameBytes, hasAttr := tokenizer.TagName()
			tagName := string(nameBytes)
			if firstImage == "" && tagName == "img" {
				if hasAttr {
					for {
						key, val, more := tokenizer.TagAttr()
						if len(key) == 3 && key[0] == 's' && key[1] == 'r' && key[2] == 'c' {
							firstImage = string(val)
							break
						}
						if !more {
							break
						}
					}
				}
			}

			if !skipContent {
				if tokenType == html.StartTagToken {
					if tagName == "script" || tagName == "style" {
						skipContent = true
					}
				}
				if isBlockTag(tagName) {
					if !lastWasSpace && textBuilder.Len() > 0 {
						textBuilder.WriteByte(' ')
						lastWasSpace = true
					}
				}
			}
		case html.EndTagToken:
			nameBytes, _ := tokenizer.TagName()
			tagName := string(nameBytes)
			if skipContent {
				if tagName == "script" || tagName == "style" {
					skipContent = false
				}
			} else {
				if isBlockTag(tagName) {
					if !lastWasSpace && textBuilder.Len() > 0 {
						textBuilder.WriteByte(' ')
						lastWasSpace = true
					}
				}
			}
		case html.TextToken:
			data := tokenizer.Text()
			if !skipContent {
				if !truncated {
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
							if firstImage != "" {
								goto done
							}
							break
						}
					}
				}
			}
		}
	}

done:
	text := textBuilder.String()
	var summary string
	if truncated {
		count := 0
		for i := range text {
			if count == l {
				summary = text[:i] + "..."
				break
			}
			count++
		}
		if summary == "" {
			summary = text + "..."
		}
	} else {
		summary = strings.TrimSpace(text)
	}

	return summary, firstImage
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
