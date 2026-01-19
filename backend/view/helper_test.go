package view

import (
	"encoding/json"
	"testing"
	"time"

	"github.com/cho45/hanrangon/backend/model/maindb"
)

func TestSummary(t *testing.T) {
	tests := []struct {
		name   string
		html   string
		length interface{}
		want   string
	}{
		{
			name:   "Basic text",
			html:   "<p>Hello world</p>",
			length: 100,
			want:   "Hello world",
		},
		{
			name:   "Strip tags",
			html:   "<div><span>Hello</span> <b>Go</b></div>",
			length: 100,
			want:   "Hello Go",
		},
		{
			name:   "Skip script and style",
			html:   "<p>Visible</p><script>alert(1)</script><style>body { color: red }</style><p>Text</p>",
			length: 100,
			want:   "Visible Text",
		},
		{
			name:   "Block elements spacing",
			html:   "<div>Line 1</div><div>Line 2</div><p>Para</p>Next",
			length: 100,
			want:   "Line 1 Line 2 Para Next",
		},
		{
			name:   "Truncation",
			html:   "<p>This is a long text that should be truncated.</p>",
			length: 10,
			want:   "This is a ...",
		},
		{
			name:   "Int64 length",
			html:   "<p>Testing int64</p>",
			length: int64(7),
			want:   "Testing...",
		},
		{
			name:   "Handle line breaks and whitespace",
			html:   "<p>Line\nBreak</p>  <p>  Multiple   Spaces  </p>",
			length: 100,
			want:   "Line Break Multiple Spaces",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, _ := ExtractSummaryAndFirstImage(tt.html, tt.length)
			if got != tt.want {
				t.Errorf("Summary() = %q, want %q", got, tt.want)
			}
		})
	}
}

func TestNewViewEntry(t *testing.T) {
	baseURL := "https://example.com"
	createdAt := time.Date(2024, 1, 15, 10, 30, 0, 0, time.UTC)
	modifiedAt := time.Date(2024, 1, 16, 12, 0, 0, 0, time.UTC)

	tests := []struct {
		name  string
		entry maindb.Entry
		check func(t *testing.T, ve ViewEntry)
	}{
		{
			name: "Normal entry with title and tags",
			entry: maindb.Entry{
				ID:            1,
				Title:         "Test Entry [tag1][tag2]",
				Date:          "20240115",
				Path:          "20240115/test",
				Body:          "This is test content",
				FormattedBody: "<p>This is test content</p>",
				ImageUrl:      "https://example.com/image.jpg",
				Summary:       "Test summary",
				CreatedAt:     createdAt,
				ModifiedAt:    modifiedAt,
			},
			check: func(t *testing.T, ve ViewEntry) {
				if ve.DisplayTitle != "Test Entry" {
					t.Errorf("DisplayTitle = %v, want Test Entry", ve.DisplayTitle)
				}
				if len(ve.Tags) != 2 || ve.Tags[0] != "tag1" || ve.Tags[1] != "tag2" {
					t.Errorf("Tags = %v, want [tag1 tag2]", ve.Tags)
				}
				if ve.CanonicalURL != "https://example.com/20240115/test" {
					t.Errorf("CanonicalURL = %v", ve.CanonicalURL)
				}
				if ve.IsShortEntry {
					t.Error("IsShortEntry should be false when tags exist")
				}
				if ve.CreatedAtUnix != createdAt.Unix() {
					t.Errorf("CreatedAtUnix = %v, want %v", ve.CreatedAtUnix, createdAt.Unix())
				}

				// Check JSON-LD
				if ve.JSONLD == "" {
					t.Error("JSONLD should not be empty")
				}
				var ld map[string]any
				if err := json.Unmarshal([]byte(ve.JSONLD), &ld); err != nil {
					t.Errorf("Failed to unmarshal JSONLD: %v", err)
				}
				if ld["@type"] != "BlogPosting" {
					t.Errorf("JSONLD @type = %v, want BlogPosting", ld["@type"])
				}
				if ld["headline"] != "Test Entry" {
					t.Errorf("JSONLD headline = %v, want Test Entry", ld["headline"])
				}
				if ld["datePublished"] != createdAt.UTC().Format(time.RFC3339) {
					t.Errorf("JSONLD datePublished = %v", ld["datePublished"])
				}
			},
		},
		{
			name: "Entry with no title",
			entry: maindb.Entry{
				ID:            2,
				Title:         "",
				Date:          "20240115",
				Path:          "20240115/test2",
				Body:          "Content",
				FormattedBody: "<p>Content</p>",
				CreatedAt:     createdAt,
				ModifiedAt:    modifiedAt,
			},
			check: func(t *testing.T, ve ViewEntry) {
				if ve.DisplayTitle != "✖" {
					t.Errorf("DisplayTitle = %v, want ✖", ve.DisplayTitle)
				}
			},
		},
		{
			name: "Short entry (no tags, no image, short body)",
			entry: maindb.Entry{
				ID:            3,
				Title:         "Short",
				Date:          "20240115",
				Path:          "20240115/test3",
				Body:          "Short content",
				FormattedBody: "<p>Short content</p>",
				ImageUrl:      "",
				CreatedAt:     createdAt,
				ModifiedAt:    modifiedAt,
			},
			check: func(t *testing.T, ve ViewEntry) {
				if !ve.IsShortEntry {
					t.Error("IsShortEntry should be true for short content without tags")
				}
			},
		},
		{
			name: "Long entry without tags (not short)",
			entry: maindb.Entry{
				ID:         4,
				Title:      "Long",
				Date:       "20240115",
				Path:       "20240115/test4",
				Body:       "This is a very long content that exceeds 140 characters. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.",
				ImageUrl:   "",
				CreatedAt:  createdAt,
				ModifiedAt: modifiedAt,
			},
			check: func(t *testing.T, ve ViewEntry) {
				if ve.IsShortEntry {
					t.Error("IsShortEntry should be false for long content")
				}
			},
		},
		{
			name: "Entry with image should not be short",
			entry: maindb.Entry{
				ID:            5,
				Title:         "With Image",
				Date:          "20240115",
				Path:          "20240115/test5",
				Body:          "Short",
				FormattedBody: "<p>Short</p>",
				ImageUrl:      "https://example.com/img.jpg",
				CreatedAt:     createdAt,
				ModifiedAt:    modifiedAt,
			},
			check: func(t *testing.T, ve ViewEntry) {
				if ve.IsShortEntry {
					t.Error("IsShortEntry should be false when image exists")
				}
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			ve := NewViewEntry(tt.entry, baseURL)
			tt.check(t, ve)
		})
	}
}

func TestNewViewEntries(t *testing.T) {
	baseURL := "https://example.com"
	createdAt := time.Date(2024, 1, 15, 10, 30, 0, 0, time.UTC)

	entries := []maindb.Entry{
		{
			ID:         1,
			Title:      "Entry 1",
			Date:       "20240115",
			Path:       "20240115/entry1",
			Body:       "Content 1",
			CreatedAt:  createdAt,
			ModifiedAt: createdAt,
		},
		{
			ID:         2,
			Title:      "Entry 2",
			Date:       "20240115",
			Path:       "20240115/entry2",
			Body:       "Content 2",
			CreatedAt:  createdAt,
			ModifiedAt: createdAt,
		},
		{
			ID:         3,
			Title:      "Entry 3",
			Date:       "20240116",
			Path:       "20240116/entry3",
			Body:       "Content 3",
			CreatedAt:  createdAt,
			ModifiedAt: createdAt,
		},
	}

	viewEntries := NewViewEntries(entries, baseURL)

	if len(viewEntries) != 3 {
		t.Fatalf("Expected 3 entries, got %d", len(viewEntries))
	}

	// First entry should always be a date boundary
	if !viewEntries[0].IsDateBoundary {
		t.Error("First entry should be a date boundary")
	}

	// Second entry on same date should not be a boundary
	if viewEntries[1].IsDateBoundary {
		t.Error("Second entry on same date should not be a date boundary")
	}

	// Third entry on different date should be a boundary
	if !viewEntries[2].IsDateBoundary {
		t.Error("Entry on different date should be a date boundary")
	}
}

func TestNewViewTrackback(t *testing.T) {
	createdAt := time.Date(2024, 1, 15, 10, 30, 0, 0, time.UTC)

	row := maindb.ListTrackbackEntriesRow{
		ID:         1,
		Title:      "Trackback Title [tag]",
		Body:       "<p>This is a trackback body with some content</p>",
		Path:       "20240115/trackback",
		CreatedAt:  createdAt,
		ModifiedAt: createdAt,
	}

	vt := NewViewTrackback(row)

	if vt.DisplayTitle != "Trackback Title" {
		t.Errorf("DisplayTitle = %v, want 'Trackback Title'", vt.DisplayTitle)
	}

	if vt.Summary == "" {
		t.Error("Summary should not be empty")
	}

	if vt.CreatedAtUnix != createdAt.Unix() {
		t.Errorf("CreatedAtUnix = %v, want %v", vt.CreatedAtUnix, createdAt.Unix())
	}

	if vt.DisplayTime != "10:30" {
		t.Errorf("DisplayTime = %v, want '10:30'", vt.DisplayTime)
	}
}

func TestNewViewTrackback_EmptyTitle(t *testing.T) {
	createdAt := time.Date(2024, 1, 15, 10, 30, 0, 0, time.UTC)

	row := maindb.ListTrackbackEntriesRow{
		ID:         1,
		Title:      "",
		Body:       "<p>Content</p>",
		CreatedAt:  createdAt,
		ModifiedAt: createdAt,
	}

	vt := NewViewTrackback(row)

	if vt.DisplayTitle != "✖" {
		t.Errorf("DisplayTitle = %v, want '✖'", vt.DisplayTitle)
	}
}

func TestNewViewTrackbacks(t *testing.T) {
	createdAt := time.Date(2024, 1, 15, 10, 30, 0, 0, time.UTC)

	rows := []maindb.ListTrackbackEntriesRow{
		{
			ID:         1,
			Title:      "TB 1",
			Body:       "<p>Content 1</p>",
			CreatedAt:  createdAt,
			ModifiedAt: createdAt,
		},
		{
			ID:         2,
			Title:      "TB 2",
			Body:       "<p>Content 2</p>",
			CreatedAt:  createdAt,
			ModifiedAt: createdAt,
		},
	}

	vts := NewViewTrackbacks(rows)

	if len(vts) != 2 {
		t.Fatalf("Expected 2 trackbacks, got %d", len(vts))
	}

	if vts[0].DisplayTitle != "TB 1" {
		t.Errorf("First trackback DisplayTitle = %v, want 'TB 1'", vts[0].DisplayTitle)
	}

	if vts[1].DisplayTitle != "TB 2" {
		t.Errorf("Second trackback DisplayTitle = %v, want 'TB 2'", vts[1].DisplayTitle)
	}
}

func TestFormatDate(t *testing.T) {
	tests := []struct {
		name     string
		dateStr  string
		expected string
	}{
		{
			name:     "Normal date YYYY-MM-DD",
			dateStr:  "2024-01-15",
			expected: "2024年 01月 15日",
		},
		{
			name:     "Normal date with different values",
			dateStr:  "2023-12-31",
			expected: "2023年 12月 31日",
		},
		{
			name:     "Invalid format - too short",
			dateStr:  "2024-01",
			expected: "2024-01",
		},
		{
			name:     "Invalid format - too many parts",
			dateStr:  "2024-01-15-extra",
			expected: "2024-01-15-extra",
		},
		{
			name:     "Empty string",
			dateStr:  "",
			expected: "",
		},
		{
			name:     "YYYYMMDD format (8 chars)",
			dateStr:  "20240115",
			expected: "20240115",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := FormatDate(tt.dateStr)
			if result != tt.expected {
				t.Errorf("FormatDate(%q) = %q, want %q", tt.dateStr, result, tt.expected)
			}
		})
	}
}

func TestDatePath(t *testing.T) {
	tests := []struct {
		name     string
		dateStr  string
		expected string
	}{
		{
			name:     "Normal date YYYY-MM-DD (10 chars)",
			dateStr:  "2024-01-15",
			expected: "/2024/01/15/",
		},
		{
			name:     "Normal date with different values",
			dateStr:  "2023-12-31",
			expected: "/2023/12/31/",
		},
		{
			name:     "YYYYMMDD format (8 chars)",
			dateStr:  "20240115",
			expected: "/20240115/",
		},
		{
			name:     "Short date YY-MM-DD (not 10 chars)",
			dateStr:  "24-01-15",
			expected: "/24/01/15/",
		},
		{
			name:     "Date with slash separators (not 10 chars)",
			dateStr:  "2024/01/15",
			expected: "/2024/01/15/",
		},
		{
			name:     "Empty string",
			dateStr:  "",
			expected: "//",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := DatePath(tt.dateStr)
			if result != tt.expected {
				t.Errorf("DatePath(%q) = %q, want %q", tt.dateStr, result, tt.expected)
			}
		})
	}
}

func TestConvertArchives(t *testing.T) {
	tests := []struct {
		name     string
		archives []maindb.ListArchiveMonthsRow
		expected []ArchiveYear
	}{
		{
			name:     "Empty archives",
			archives: []maindb.ListArchiveMonthsRow{},
			expected: nil,
		},
		{
			name: "Single year with single month",
			archives: []maindb.ListArchiveMonthsRow{
				{Year: "2024", Month: "01", Count: 5},
			},
			expected: []ArchiveYear{
				{
					Year: "2024",
					Months: []ArchiveMonth{
						{Year: "2024", Month: "01", Count: 5},
					},
				},
			},
		},
		{
			name: "Single year with multiple months",
			archives: []maindb.ListArchiveMonthsRow{
				{Year: "2024", Month: "01", Count: 5},
				{Year: "2024", Month: "02", Count: 10},
				{Year: "2024", Month: "03", Count: 3},
			},
			expected: []ArchiveYear{
				{
					Year: "2024",
					Months: []ArchiveMonth{
						{Year: "2024", Month: "01", Count: 5},
						{Year: "2024", Month: "02", Count: 10},
						{Year: "2024", Month: "03", Count: 3},
					},
				},
			},
		},
		{
			name: "Multiple years",
			archives: []maindb.ListArchiveMonthsRow{
				{Year: "2024", Month: "01", Count: 5},
				{Year: "2024", Month: "02", Count: 10},
				{Year: "2023", Month: "11", Count: 7},
				{Year: "2023", Month: "12", Count: 8},
			},
			expected: []ArchiveYear{
				{
					Year: "2024",
					Months: []ArchiveMonth{
						{Year: "2024", Month: "01", Count: 5},
						{Year: "2024", Month: "02", Count: 10},
					},
				},
				{
					Year: "2023",
					Months: []ArchiveMonth{
						{Year: "2023", Month: "11", Count: 7},
						{Year: "2023", Month: "12", Count: 8},
					},
				},
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := ConvertArchives(tt.archives)

			if len(result) != len(tt.expected) {
				t.Fatalf("ConvertArchives() returned %d years, expected %d", len(result), len(tt.expected))
			}

			for i, year := range result {
				if year.Year != tt.expected[i].Year {
					t.Errorf("Year[%d].Year = %v, want %v", i, year.Year, tt.expected[i].Year)
				}

				if len(year.Months) != len(tt.expected[i].Months) {
					t.Errorf("Year[%d] has %d months, expected %d", i, len(year.Months), len(tt.expected[i].Months))
					continue
				}

				for j, month := range year.Months {
					exp := tt.expected[i].Months[j]
					if month.Year != exp.Year || month.Month != exp.Month || month.Count != exp.Count {
						t.Errorf("Year[%d].Months[%d] = {Year:%v, Month:%v, Count:%v}, want {Year:%v, Month:%v, Count:%v}",
							i, j, month.Year, month.Month, month.Count, exp.Year, exp.Month, exp.Count)
					}
				}
			}
		})
	}
}
