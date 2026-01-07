package view

import (
	"io"
	"regexp"
	"strings"

	"github.com/cho45/hanrangon/model"
	"golang.org/x/net/html"
)

var htmlTagRegexp = regexp.MustCompile(`<[^>]*>`)

func IsSameDay(t1Str, t2Str string) bool {
	return t1Str == t2Str
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
	skipContent := false

	// Block elements that should be separated by spaces
	isBlock := map[string]bool{
		"p": true, "div": true, "h1": true, "h2": true, "h3": true, "h4": true, "h5": true, "h6": true,
		"li": true, "blockquote": true, "br": true, "hr": true, "table": true, "tr": true,
	}

	for {
		tokenType := tokenizer.Next()
		if tokenType == html.ErrorToken {
			if tokenizer.Err() == io.EOF {
				break
			}
			return "" // Parse error
		}

		token := tokenizer.Token()
		switch tokenType {
		case html.StartTagToken:
			if token.Data == "script" || token.Data == "style" {
				skipContent = true
			}
			if isBlock[token.Data] {
				textBuilder.WriteString(" ")
			}
		case html.EndTagToken:
			if token.Data == "script" || token.Data == "style" {
				skipContent = false
			}
			if isBlock[token.Data] {
				textBuilder.WriteString(" ")
			}
		case html.TextToken:
			if !skipContent {
				textBuilder.WriteString(token.Data)
			}
		case html.SelfClosingTagToken:
			if isBlock[token.Data] {
				textBuilder.WriteString(" ")
			}
		}
	}

	text := textBuilder.String()
	text = strings.ReplaceAll(text, "\n", " ")
	text = strings.ReplaceAll(text, "\r", "")
	// Replace multiple spaces with a single space
	text = regexp.MustCompile(`\s+`).ReplaceAllString(text, " ")
	text = strings.TrimSpace(text)

	runes := []rune(text)
	if len(runes) > l {
		return string(runes[:l]) + "..."
	}
	return string(runes)
}

func ExtractFirstImage(htmlContent string) string {
	tokenizer := html.NewTokenizer(strings.NewReader(htmlContent))
	for {
		tokenType := tokenizer.Next()
		if tokenType == html.ErrorToken {
			break
		}

		token := tokenizer.Token()
		if tokenType == html.StartTagToken || tokenType == html.SelfClosingTagToken {
			if token.Data == "img" {
				for _, attr := range token.Attr {
					if attr.Key == "src" {
						return attr.Val
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
