package view

import (
	"testing"
)

func TestIsSameDay(t *testing.T) {
	tests := []struct {
		name string
		t1   string
		t2   string
		want bool
	}{
		{
			name: "Same day",
			t1:   "2025-12-30",
			t2:   "2025-12-30",
			want: true,
		},
		{
			name: "Different day",
			t1:   "2025-12-30",
			t2:   "2025-12-31",
			want: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := IsSameDay(tt.t1, tt.t2); got != tt.want {
				t.Errorf("IsSameDay() = %v, want %v", got, tt.want)
			}
		})
	}
}

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
