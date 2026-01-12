package model

import (
	"regexp"
	"strings"
)

var titleTagRegexp = regexp.MustCompile(`\s*\[([^\]]+)\]\s*`)

// ParseTitle separates tags like [tag] from the title.
// This is used internally by Entry methods and also available for cases where only a title string is available.
func ParseTitle(rawTitle string) (string, []string) {
	submatches := titleTagRegexp.FindAllStringSubmatch(rawTitle, -1)
	if len(submatches) == 0 {
		return strings.TrimSpace(rawTitle), nil
	}

	tags := make([]string, len(submatches))
	for i, sub := range submatches {
		tags[i] = sub[1]
	}
	cleanTitle := titleTagRegexp.ReplaceAllString(rawTitle, "")
	return strings.TrimSpace(cleanTitle), tags
}

// DisplayTitle returns the title without tags, or "✖" if empty.
func (e Entry) DisplayTitle() string {
	clean, _ := ParseTitle(e.Title)
	if clean == "" {
		return "✖"
	}
	return clean
}

// Tags returns the tags extracted from the title.
func (e Entry) Tags() []string {
	_, tags := ParseTitle(e.Title)
	return tags
}

// DisplayTitle returns the title without tags, or "✖" if empty.
func (e ListTrackbackEntriesRow) DisplayTitle() string {
	clean, _ := ParseTitle(e.Title)
	if clean == "" {
		return "✖"
	}
	return clean
}

// Tags returns the tags extracted from the title.
func (e ListTrackbackEntriesRow) Tags() []string {
	_, tags := ParseTitle(e.Title)
	return tags
}
