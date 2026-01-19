package view

import (
	"encoding/json"
	"encoding/xml"
	"html/template"
	"strings"
	"time"

	"github.com/cho45/hanrangon/backend/model/maindb"
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

// ViewEntry wraps maindb.Entry with pre-calculated display fields
type ViewEntry struct {
	maindb.Entry
	DisplayTitle      string
	Tags              []string
	Summary           string
	FirstImageURL     template.URL
	CanonicalURL      template.URL // Pre-calculated URL
	FormattedDate     string
	DatePath          string
	DisplayTime       string
	CreatedAtUnix     int64
	CreatedAtRFC3339  string
	ModifiedAtRFC3339 string
	FormattedBodyHTML template.HTML
	IsDateBoundary    bool // Pre-calculated for template
	IsShortEntry      bool
	SimilarEntries    []SimilarEntry
	SimilarImages     []SimilarImage
	JSONLD            template.JS
}

func NewViewEntry(e maindb.Entry, baseURL string) ViewEntry {
	displayTitle, tags := maindb.ParseTitle(e.Title)
	if displayTitle == "" {
		displayTitle = "✖"
	}

	isShortEntry := false
	if len(tags) == 0 && strings.TrimSpace(e.ImageUrl) == "" {
		// タグがなく、画像（ImageUrlカラム）も空の場合、本文の文字数で判定
		if len([]rune(strings.TrimSpace(e.Body))) < 140 {
			isShortEntry = true
		}
	}

	canonicalURL := strings.TrimSuffix(baseURL, "/") + "/" + e.Path
	jsonLD := map[string]any{
		"@context": "https://schema.org",
		"@type":    "BlogPosting",
		"mainEntityOfPage": map[string]any{
			"@type": "@WebPage",
			"@id":   canonicalURL,
		},
		"headline":    displayTitle,
		"description": e.Summary,
		"image": map[string]any{
			"@type":  "ImageObject",
			"url":    "https://www.lowreal.net/images/logo.png",
			"width":  189,
			"height": 105,
		},
		"author": map[string]any{
			"@type": "Person",
			"name":  "cho45",
			"url":   "https://www.lowreal.net/",
		},
		"publisher": map[string]any{
			"@type": "Organization",
			"name":  "cho45",
			"logo": map[string]any{
				"@type":  "ImageObject",
				"url":    "https://www.lowreal.net/images/logo.png",
				"width":  189,
				"height": 105,
			},
		},
		"datePublished": e.CreatedAt.UTC().Format(time.RFC3339),
		"dateModified":  e.ModifiedAt.UTC().Format(time.RFC3339),
	}
	jsonLDBody, _ := json.Marshal(jsonLD)

	return ViewEntry{
		Entry:             e,
		DisplayTitle:      displayTitle,
		Tags:              tags,
		Summary:           e.Summary,
		FirstImageURL:     template.URL(e.ImageUrl),
		CanonicalURL:      template.URL(canonicalURL),
		FormattedDate:     FormatDate(e.Date),
		DatePath:          DatePath(e.Date),
		DisplayTime:       e.CreatedAt.Format("15:04"),
		CreatedAtUnix:     e.CreatedAt.Unix(),
		CreatedAtRFC3339:  e.CreatedAt.UTC().Format(time.RFC3339),
		ModifiedAtRFC3339: e.ModifiedAt.UTC().Format(time.RFC3339),
		FormattedBodyHTML: template.HTML(e.FormattedBody),
		IsShortEntry:      isShortEntry,
		JSONLD:            template.JS(jsonLDBody),
	}
}

func NewViewEntries(entries []maindb.Entry, baseURL string) []ViewEntry {
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
	maindb.ListTrackbackEntriesRow
	DisplayTitle     string
	Summary          string
	CreatedAtUnix    int64
	CreatedAtRFC3339 string
	DisplayTime      string
}

func NewViewTrackback(row maindb.ListTrackbackEntriesRow) ViewTrackback {
	displayTitle, _ := maindb.ParseTitle(row.Title)
	if displayTitle == "" {
		displayTitle = "✖"
	}
	summary, _ := ExtractSummaryAndFirstImage(row.Body, 140)
	return ViewTrackback{
		ListTrackbackEntriesRow: row,
		DisplayTitle:            displayTitle,
		Summary:                 summary,
		CreatedAtUnix:           row.CreatedAt.Unix(),
		CreatedAtRFC3339:        row.CreatedAt.UTC().Format(time.RFC3339),
		DisplayTime:             row.CreatedAt.Format("15:04"),
	}
}

func NewViewTrackbacks(rows []maindb.ListTrackbackEntriesRow) []ViewTrackback {
	res := make([]ViewTrackback, len(rows))
	for i, r := range rows {
		res[i] = NewViewTrackback(r)
	}
	return res
}

// IndexData holds data for both index and entry detail pages
type IndexData struct {
	LayoutData
	Entries    []ViewEntry     // For index: multiple entries, for detail: single entry
	IsDetail   bool            // true for entry detail page, false for list page
	OlderPage  string          // For index pagination
	Trackbacks []ViewTrackback // For entry detail
	Older      *ViewEntry      // For entry detail navigation (past)
	Newer      *ViewEntry      // For entry detail navigation (future)
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

// ErrorData holds data for the error page
type ErrorData struct {
	LayoutData
	StatusCode int
	Message    string
	Error      string // For development
	Internal   string // For development
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
	URI        string
	EntryPath  string
	EntryTitle string
	Score      int64
}

// SimilarEntriesData holds data for similar entries
type SimilarEntriesData struct {
	Entries []SimilarEntry
}

// SimilarImagesData holds data for similar images
type SimilarImagesData struct {
	Images []SimilarImage
}
