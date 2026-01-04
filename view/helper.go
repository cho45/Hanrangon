package view

import (
	"regexp"
	"strings"

	"github.com/cho45/hanrangon/model"
)

var titleTagRegexp = regexp.MustCompile(`\s*\[([^\]]+)\]\s*`)
var htmlTagRegexp = regexp.MustCompile(`<[^>]*>`)

func IsSameDay(t1Str, t2Str string) bool {
	return t1Str == t2Str
}

func ParseTitle(rawTitle string) (string, []string) {
	tags := []string{}
	cleanTitle := titleTagRegexp.ReplaceAllStringFunc(rawTitle, func(match string) string {
		submatch := titleTagRegexp.FindStringSubmatch(match)
		if len(submatch) > 1 {
			tags = append(tags, submatch[1])
		}
		return ""
	})
	return strings.TrimSpace(cleanTitle), tags
}

func Summary(html string, length interface{}) string {
	var l int
	switch v := length.(type) {
	case int:
		l = v
	case int64:
		l = int(v)
	default:
		l = 100
	}

	text := htmlTagRegexp.ReplaceAllString(html, "")
	text = strings.ReplaceAll(text, "\n", " ")
	text = strings.ReplaceAll(text, "\r", "")
	text = strings.TrimSpace(text)
	runes := []rune(text)
	if len(runes) > l {
		return string(runes[:l]) + "..."
	}
	return string(runes)
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
