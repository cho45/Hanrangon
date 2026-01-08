package view

import (
	"encoding/xml"
	"html/template"
	"strings"
	"time"

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
	DisplayTitle      string
	Tags              []string
	Summary           string
	FirstImageURL     template.URL
	CanonicalURL      template.URL // Pre-calculated URL
	FormattedDate     string
	DatePath          string
	DisplayTime       string
	CreatedAtRFC3339  string
	ModifiedAtRFC3339 string
	FormattedBodyHTML template.HTML
	IsDateBoundary    bool // Pre-calculated for template
}

func NewViewEntry(e model.Entry, baseURL string) ViewEntry {
	displayTitle, tags := model.ParseTitle(e.Title)
	if displayTitle == "" {
		displayTitle = "✖"
	}
	summary, firstImage := ExtractSummaryAndFirstImage(e.FormattedBody, 100)
	return ViewEntry{
		Entry:             e,
		DisplayTitle:      displayTitle,
		Tags:              tags,
		Summary:           summary,
		FirstImageURL:     template.URL(firstImage),
		CanonicalURL:      template.URL(strings.TrimSuffix(baseURL, "/") + "/" + e.Path),
		FormattedDate:     FormatDate(e.Date),
		DatePath:          DatePath(e.Date),
		DisplayTime:       e.CreatedAt.Format("15:04"),
		CreatedAtRFC3339:  e.CreatedAt.UTC().Format(time.RFC3339),
		ModifiedAtRFC3339: e.ModifiedAt.UTC().Format(time.RFC3339),
		FormattedBodyHTML: template.HTML(e.FormattedBody),
	}
}

func NewViewEntries(entries []model.Entry, baseURL string) []ViewEntry {
	res := make([]ViewEntry, len(entries))
	for i, e := range entries {
		res[i] = NewViewEntry(e, baseURL)
		if i == 0 {
			res[i].IsDateBoundary = true
		} else {
			res[i].IsDateBoundary = res[i].Date != res[i-1].Date
		}
	}
	return res
}

// ViewTrackback represents pre-calculated trackback data
type ViewTrackback struct {
	model.ListTrackbackEntriesRow
	DisplayTitle     string
	Summary          string
	CreatedAtRFC3339 string
	DisplayTime      string
}

func NewViewTrackback(row model.ListTrackbackEntriesRow) ViewTrackback {
	displayTitle, _ := model.ParseTitle(row.Title)
	if displayTitle == "" {
		displayTitle = "✖"
	}
	summary, _ := ExtractSummaryAndFirstImage(row.Body, 140)
	return ViewTrackback{
		ListTrackbackEntriesRow: row,
		DisplayTitle:            displayTitle,
		Summary:                 summary,
		CreatedAtRFC3339:        row.CreatedAt.UTC().Format(time.RFC3339),
		DisplayTime:             row.CreatedAt.Format("15:04"),
	}
}

func NewViewTrackbacks(rows []model.ListTrackbackEntriesRow) []ViewTrackback {
	res := make([]ViewTrackback, len(rows))
	for i, r := range rows {
		res[i] = NewViewTrackback(r)
	}
	return res
}

// IndexData holds data for both index and entry detail pages
type IndexData struct {
	LayoutData
	Entries           []ViewEntry     // For index: multiple entries, for detail: single entry
	IsDetail          bool            // true for entry detail page, false for list page
	OlderPage         string          // For index pagination
	Trackbacks        []ViewTrackback // For entry detail
	Older             *ViewEntry      // For entry detail navigation (past)
	Newer             *ViewEntry      // For entry detail navigation (future)
	SimilarEntriesURL template.URL    // Pre-calculated URL for similar entries
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
	ViewEntry
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
