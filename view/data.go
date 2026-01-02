package view

import (
	"github.com/cho45/hanrangon/model"
)

// LayoutData holds data for the layout template
type LayoutData struct {
	Title  string
	IsAuth bool
}

// IndexData holds data for both index and entry detail pages
type IndexData struct {
	LayoutData
	Entries    []model.Entry                   // For index: multiple entries, for detail: single entry
	IsDetail   bool                            // true for entry detail page, false for list page
	NextPage   string                          // For index pagination
	Trackbacks []model.ListTrackbackEntriesRow // For entry detail
	Prev       *model.Entry                    // For entry detail navigation
	Next       *model.Entry                    // For entry detail navigation
}

// ArchiveData holds data for the archive page
type ArchiveData struct {
	LayoutData
	Archives []ArchiveYear
}

// LoginData holds data for the login page
type LoginData struct {
	ErrorMsg   string
	ReturnPath string
}

// EditData holds data for the edit page
type EditData struct {
	EntryJSON string
}

// FeedData holds data for the Atom feed
type FeedData struct {
	Entries []model.Entry
	Updated string // RFC3339形式
}

// SitemapData holds data for the sitemap
type SitemapData struct {
	Entries []model.ListAllEntriesForSitemapRow
}

// SimilarEntry represents an entry with similarity score
type SimilarEntry struct {
	model.Entry
	Score float64
}

// SimilarImage represents an image with similarity information
type SimilarImage struct {
	URI       string
	EntryPath string
	Score     int64
}

// SimilarEntriesData holds data for similar entries
type SimilarEntriesData struct {
	Entries []SimilarEntry
}

// SimilarImagesData holds data for similar images
type SimilarImagesData struct {
	Images []SimilarImage
}
