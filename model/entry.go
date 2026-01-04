package model

import (
	"regexp"
	"strings"
)

var titleTagRegexp = regexp.MustCompile(`\s*\[([^\]]+)\]\s*`)

// ParseTitle separates tags like [tag] from the title.
// This is used internally by Entry methods and also available for cases where only a title string is available.
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

// DisplayTitle returns the title without tags, or "✖" if empty.
func (e *Entry) DisplayTitle() string {
	clean, _ := ParseTitle(e.Title)
	if clean == "" {
		return "✖"
	}
	return clean
}

// Tags returns the tags extracted from the title.
func (e *Entry) Tags() []string {
	_, tags := ParseTitle(e.Title)
	return tags
}

// DisplayTitle returns the title without tags, or "✖" if empty.
func (e *ListTrackbackEntriesRow) DisplayTitle() string {
	clean, _ := ParseTitle(e.Title)
	if clean == "" {
		return "✖"
	}
	return clean
}

// Tags returns the tags extracted from the title.
func (e *ListTrackbackEntriesRow) Tags() []string {
	_, tags := ParseTitle(e.Title)
	return tags
}
