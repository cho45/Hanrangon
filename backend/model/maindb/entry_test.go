package maindb

import (
	"testing"
)

func TestParseTitle(t *testing.T) {
	tests := []struct {
		rawTitle  string
		wantTitle string
		wantTags  []string
	}{
		{
			rawTitle:  "[tech] Hello World",
			wantTitle: "Hello World",
			wantTags:  []string{"tech"},
		},
		{
			rawTitle:  "[tech][go] Multiple Tags",
			wantTitle: "Multiple Tags",
			wantTags:  []string{"tech", "go"},
		},
		{
			rawTitle:  "Tag in [middle] of title",
			wantTitle: "Tag inof title",
			wantTags:  []string{"middle"},
		},
		{
			rawTitle:  "No Tags",
			wantTitle: "No Tags",
			wantTags:  []string{},
		},
	}

	for _, tt := range tests {
		t.Run(tt.rawTitle, func(t *testing.T) {
			gotTitle, gotTags := ParseTitle(tt.rawTitle)
			if gotTitle != tt.wantTitle {
				t.Errorf("ParseTitle title = %q, want %q", gotTitle, tt.wantTitle)
			}
			if len(gotTags) != len(tt.wantTags) {
				t.Errorf("ParseTitle tags len = %d, want %d", len(gotTags), len(tt.wantTags))
			}
			for i, tag := range gotTags {
				if tag != tt.wantTags[i] {
					t.Errorf("ParseTitle tags[%d] = %q, want %q", i, tag, tt.wantTags[i])
				}
			}
		})
	}
}

func TestEntry_DisplayTitle(t *testing.T) {
	tests := []struct {
		title string
		want  string
	}{
		{"[tag] Title", "Title"},
		{"", "✖"},
		{"[tag]", "✖"},
		{"Plain Title", "Plain Title"},
	}
	for _, tt := range tests {
		e := &Entry{Title: tt.title}
		if got := e.DisplayTitle(); got != tt.want {
			t.Errorf("Entry{Title: %q}.DisplayTitle() = %q, want %q", tt.title, got, tt.want)
		}
	}
}
