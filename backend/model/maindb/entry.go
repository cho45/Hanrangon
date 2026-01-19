package maindb

import (
	"regexp"
	"strings"
	"time"
)

type EntryStatus string

const (
	StatusPublic    EntryStatus = "public"
	StatusDraft     EntryStatus = "draft"
	StatusScheduled EntryStatus = "scheduled"
	StatusReserved  EntryStatus = "reserved"
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

// IsReserved は、エントリが「予約投稿」状態（公開待ちだがパスが未確定）かどうかを返します。
func (e Entry) IsReserved() bool {
	return e.Status == string(StatusReserved)
}

// IsScheduledLater は、エントリが「公開を遅延」状態（パスは確定済みで、指定時間に公開される）かどうかを返します。
func (e Entry) IsScheduledLater() bool {
	return e.Status == string(StatusScheduled)
}

// IsPubliclyVisible は、エントリが一般公開されている（ステータスが public かつ公開時刻を過ぎている）かどうかを返します。
func (e Entry) IsPubliclyVisible() bool {
	if e.Status != string(StatusPublic) {
		return false
	}
	if e.PublishAt.Valid && e.PublishAt.Time.After(time.Now()) {
		return false
	}
	return true
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
