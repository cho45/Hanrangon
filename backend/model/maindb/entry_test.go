package maindb

import (
	"database/sql"
	"testing"
	"time"
)

func TestTitleParsing(t *testing.T) {
	tests := []struct {
		rawTitle    string
		wantTitle   string
		wantDisplay string
		wantTags    []string
	}{
		{
			rawTitle:    "[tech] Hello World",
			wantTitle:   "Hello World",
			wantDisplay: "Hello World",
			wantTags:    []string{"tech"},
		},
		{
			rawTitle:    "[tech][go] Multiple Tags",
			wantTitle:   "Multiple Tags",
			wantDisplay: "Multiple Tags",
			wantTags:    []string{"tech", "go"},
		},
		{
			rawTitle:    "Tag in [middle] of title",
			wantTitle:   "Tag inof title",
			wantDisplay: "Tag inof title",
			wantTags:    []string{"middle"},
		},
		{
			rawTitle:    "No Tags",
			wantTitle:   "No Tags",
			wantDisplay: "No Tags",
			wantTags:    []string{},
		},
		{
			rawTitle:    "",
			wantTitle:   "",
			wantDisplay: "✖",
			wantTags:    []string{},
		},
		{
			rawTitle:    "[tag]",
			wantTitle:   "",
			wantDisplay: "✖",
			wantTags:    []string{"tag"},
		},
	}

	for _, tt := range tests {
		t.Run(tt.rawTitle, func(t *testing.T) {
			// Test ParseTitle function
			gotTitle, gotTags := ParseTitle(tt.rawTitle)
			if gotTitle != tt.wantTitle {
				t.Errorf("ParseTitle(%q) title = %q, want %q", tt.rawTitle, gotTitle, tt.wantTitle)
			}
			if len(gotTags) != len(tt.wantTags) {
				t.Errorf("ParseTitle(%q) tags len = %d, want %d", tt.rawTitle, len(gotTags), len(tt.wantTags))
			}
			for i, tag := range gotTags {
				if tag != tt.wantTags[i] {
					t.Errorf("ParseTitle(%q) tags[%d] = %q, want %q", tt.rawTitle, i, tag, tt.wantTags[i])
				}
			}

			// Test Entry.DisplayTitle method
			e := &Entry{Title: tt.rawTitle}
			if got := e.DisplayTitle(); got != tt.wantDisplay {
				t.Errorf("Entry{Title: %q}.DisplayTitle() = %q, want %q", tt.rawTitle, got, tt.wantDisplay)
			}

			// Test Entry.Tags method
			eTags := e.Tags()
			if len(eTags) != len(tt.wantTags) {
				t.Errorf("Entry{Title: %q}.Tags() len = %d, want %d", tt.rawTitle, len(eTags), len(tt.wantTags))
			}
			for i, tag := range eTags {
				if tag != tt.wantTags[i] {
					t.Errorf("Entry{Title: %q}.Tags()[%d] = %q, want %q", tt.rawTitle, i, tag, tt.wantTags[i])
				}
			}

			// Test ListTrackbackEntriesRow.DisplayTitle method
			row := &ListTrackbackEntriesRow{Title: tt.rawTitle}
			if got := row.DisplayTitle(); got != tt.wantDisplay {
				t.Errorf("ListTrackbackEntriesRow{Title: %q}.DisplayTitle() = %q, want %q", tt.rawTitle, got, tt.wantDisplay)
			}

			// Test ListTrackbackEntriesRow.Tags method
			rowTags := row.Tags()
			if len(rowTags) != len(tt.wantTags) {
				t.Errorf("ListTrackbackEntriesRow{Title: %q}.Tags() len = %d, want %d", tt.rawTitle, len(rowTags), len(tt.wantTags))
			}
			for i, tag := range rowTags {
				if tag != tt.wantTags[i] {
					t.Errorf("ListTrackbackEntriesRow{Title: %q}.Tags()[%d] = %q, want %q", tt.rawTitle, i, tag, tt.wantTags[i])
				}
			}
		})
	}
}

func TestEntry_IsReserved(t *testing.T) {
	tests := []struct {
		name   string
		status string
		want   bool
	}{
		{
			name:   "reserved status",
			status: string(StatusReserved),
			want:   true,
		},
		{
			name:   "public status",
			status: string(StatusPublic),
			want:   false,
		},
		{
			name:   "draft status",
			status: string(StatusDraft),
			want:   false,
		},
		{
			name:   "scheduled status",
			status: string(StatusScheduled),
			want:   false,
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			e := &Entry{Status: tt.status}
			if got := e.IsReserved(); got != tt.want {
				t.Errorf("Entry{Status: %q}.IsReserved() = %v, want %v", tt.status, got, tt.want)
			}
		})
	}
}

func TestEntry_IsScheduledLater(t *testing.T) {
	tests := []struct {
		name   string
		status string
		want   bool
	}{
		{
			name:   "scheduled status",
			status: string(StatusScheduled),
			want:   true,
		},
		{
			name:   "public status",
			status: string(StatusPublic),
			want:   false,
		},
		{
			name:   "draft status",
			status: string(StatusDraft),
			want:   false,
		},
		{
			name:   "reserved status",
			status: string(StatusReserved),
			want:   false,
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			e := &Entry{Status: tt.status}
			if got := e.IsScheduledLater(); got != tt.want {
				t.Errorf("Entry{Status: %q}.IsScheduledLater() = %v, want %v", tt.status, got, tt.want)
			}
		})
	}
}

func TestEntry_IsPubliclyVisible(t *testing.T) {
	now := time.Now()
	past := now.Add(-1 * time.Hour)
	future := now.Add(1 * time.Hour)

	tests := []struct {
		name      string
		status    string
		publishAt sql.NullTime
		want      bool
	}{
		{
			name:      "public status with no publish_at",
			status:    string(StatusPublic),
			publishAt: sql.NullTime{Valid: false},
			want:      true,
		},
		{
			name:      "public status with past publish_at",
			status:    string(StatusPublic),
			publishAt: sql.NullTime{Valid: true, Time: past},
			want:      true,
		},
		{
			name:      "public status with future publish_at",
			status:    string(StatusPublic),
			publishAt: sql.NullTime{Valid: true, Time: future},
			want:      false,
		},
		{
			name:      "draft status with no publish_at",
			status:    string(StatusDraft),
			publishAt: sql.NullTime{Valid: false},
			want:      false,
		},
		{
			name:      "draft status with past publish_at",
			status:    string(StatusDraft),
			publishAt: sql.NullTime{Valid: true, Time: past},
			want:      false,
		},
		{
			name:      "scheduled status with future publish_at",
			status:    string(StatusScheduled),
			publishAt: sql.NullTime{Valid: true, Time: future},
			want:      false,
		},
		{
			name:      "reserved status",
			status:    string(StatusReserved),
			publishAt: sql.NullTime{Valid: false},
			want:      false,
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			e := &Entry{
				Status:    tt.status,
				PublishAt: tt.publishAt,
			}
			if got := e.IsPubliclyVisible(); got != tt.want {
				t.Errorf("Entry{Status: %q, PublishAt: %v}.IsPubliclyVisible() = %v, want %v",
					tt.status, tt.publishAt, got, tt.want)
			}
		})
	}
}
