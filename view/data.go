package view

import (
	"encoding/xml"

	"github.com/cho45/hanrangon/model"
)

// LayoutData holds data for the layout template
type LayoutData struct {
	PageTitle    string // ページ固有のタイトル（サイト名は含まない）
	BaseURL      string
	CanonicalURL string
	Description  string
	ImageURL     string
	OGType       string
	IsAuth       bool
}

// ViewEntry wraps model.Entry with pre-calculated display fields
type ViewEntry struct {
	model.Entry
	DisplayTitle string
	Tags         []string
	Summary      string
}

func NewViewEntry(e model.Entry) ViewEntry {
	displayTitle, tags := model.ParseTitle(e.Title)
	if displayTitle == "" {
		displayTitle = "✖"
	}
	return ViewEntry{
		Entry:        e,
		DisplayTitle: displayTitle,
		Tags:         tags,
		Summary:      Summary(e.FormattedBody, 100),
	}
}

func NewViewEntries(entries []model.Entry) []ViewEntry {
	res := make([]ViewEntry, len(entries))
	for i, e := range entries {
		res[i] = NewViewEntry(e)
	}
	return res
}

// IndexData holds data for both index and entry detail pages
type IndexData struct {
	LayoutData
	Entries    []ViewEntry                      // For index: multiple entries, for detail: single entry
	IsDetail   bool                             // true for entry detail page, false for list page
	OlderPage  string                           // For index pagination
	Trackbacks []*model.ListTrackbackEntriesRow // For entry detail
	Older      *ViewEntry                       // For entry detail navigation (past)
	Newer      *ViewEntry                       // For entry detail navigation (future)
}

// ArchiveData holds data for the archive page
type ArchiveData struct {
	LayoutData
	Archives []ArchiveYear
}

// LoginData holds data for the login page
type LoginData struct {
	LayoutData
	ErrorMsg   string
	ReturnPath string
	SessionKey string
}

// EditData holds data for the edit page
type EditData struct {
	LayoutData
	EntryJSON  string
	SessionKey string
}

// AdminIndexData holds data for the admin index page
type AdminIndexData struct {
	LayoutData
	SessionKey string
}

type AtomFeed struct {
	XMLName xml.Name    `xml:"http://www.w3.org/2005/Atom feed"`
	Title   string      `xml:"title"`
	Link    []AtomLink  `xml:"link"`
	Updated string      `xml:"updated"`
	Author  AtomAuthor  `xml:"author"`
	ID      string      `xml:"id"`
	Entries []AtomEntry `xml:"entry"`
}

type AtomLink struct {
	Href string `xml:"href,attr"`
	Rel  string `xml:"rel,attr,omitempty"`
	Type string `xml:"type,attr,omitempty"`
}

type AtomAuthor struct {
	Name string `xml:"name"`
}

type AtomEntry struct {
	Title     string      `xml:"title"`
	Link      AtomLink    `xml:"link"`
	ID        string      `xml:"id"`
	Updated   string      `xml:"updated"`
	Published string      `xml:"published"`
	Content   AtomContent `xml:"content"`
}

type AtomContent struct {
	Type string `xml:"type,attr"`
	Body string `xml:",cdata"`
}

type SitemapXML struct {
	XMLName xml.Name     `xml:"http://www.sitemaps.org/schemas/sitemap/0.9 urlset"`
	URLs    []SitemapURL `xml:"url"`
}

type SitemapURL struct {
	Loc     string `xml:"loc"`
	LastMod string `xml:"lastmod,omitempty"`
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
