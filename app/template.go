package app

import (
	"fmt"
	"html/template"
	"io"
	"log"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"sync"

	"github.com/BurntSushi/toml"
	"github.com/Masterminds/sprig/v3"
	"github.com/cho45/hanrangon/model"
	"github.com/cho45/hanrangon/view"
	"github.com/labstack/echo/v4"
)

// TemplateMetadata holds metadata parsed from template front matter
type TemplateMetadata struct {
	Links []struct {
		URL         string `toml:"url"`
		Rel         string `toml:"rel"`
		As          string `toml:"as"`
		CrossOrigin bool   `toml:"crossorigin"`
	} `toml:"links"`
}

// Templates manages HTML templates
type Templates struct {
	config    *Config
	templates map[string]*template.Template
	metadata  map[string]*TemplateMetadata
	merged    map[string]*template.Template
	mu        sync.RWMutex
}

// buildFuncMap builds the function map for templates
func buildFuncMap() template.FuncMap {
	funcMap := sprig.FuncMap()

	// カスタム関数を追加
	funcMap["safeHTML"] = func(s string) template.HTML {
		return template.HTML(s)
	}
	funcMap["safeURL"] = func(s string) template.URL {
		return template.URL(s)
	}
	funcMap["formatDate"] = formatDate
	funcMap["datePath"] = datePath
	// parseTitleはエラー戻り値付きに変換
	funcMap["parseTitle"] = func(title string) (interface{}, error) {
		clean, tags := model.ParseTitle(title)
		return []interface{}{clean, tags}, nil
	}
	funcMap["cleanTitle"] = func(title string) string {
		clean, _ := model.ParseTitle(title)
		return clean
	}
	funcMap["getTags"] = func(title string) []string {
		_, tags := model.ParseTitle(title)
		return tags
	}
	funcMap["summary"] = view.Summary
	funcMap["isSameDay"] = view.IsSameDay
	funcMap["isDateBoundary"] = func(i int, entries []model.Entry) bool {
		if i == 0 {
			return true
		}
		if i < 0 || i >= len(entries) {
			return false
		}
		return entries[i].Date != entries[i-1].Date
	}
	funcMap["similarURL"] = func(entries []model.Entry) string {
		if len(entries) == 0 {
			return ""
		}
		var sb strings.Builder
		sb.Grow(len(entries) * 20)
		sb.WriteString("/api/similar?")
		for i, e := range entries {
			if i > 0 {
				sb.WriteByte('&')
			}
			sb.WriteString("id=")
			sb.WriteString(strconv.FormatInt(e.ID, 10))
		}
		return sb.String()
	}

	return funcMap
}

// LoadTemplates loads each template as an isolated set to avoid cross-template name collisions (e.g., "head").
func (t *Templates) LoadTemplates() (map[string]*template.Template, error) {
	templates := make(map[string]*template.Template)
	funcMap := buildFuncMap()
	t.metadata = make(map[string]*TemplateMetadata)

	basePath := "view/"
	if _, err := os.Stat(basePath); os.IsNotExist(err) {
		basePath = "../view/"
	}

	err := filepath.Walk(basePath, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}
		if info.IsDir() {
			return nil
		}

		ext := filepath.Ext(path)
		if ext != ".html" && ext != ".xml" {
			return nil
		}

		rel, err := filepath.Rel(basePath, path)
		if err != nil {
			return err
		}
		rel = filepath.ToSlash(rel)

		b, err := os.ReadFile(path)
		if err != nil {
			return err
		}

		content := string(b)
		if strings.HasPrefix(content, "---\n") {
			parts := strings.SplitN(content, "---\n", 3)
			if len(parts) == 3 {
				var meta TemplateMetadata
				if _, err := toml.Decode(parts[1], &meta); err == nil {
					t.metadata[rel] = &meta
					content = parts[2]
				} else {
					log.Printf("Error parsing TOML front matter in %s: %v", path, err)
				}
			}
		}

		// Each file is parsed into its own template set to isolate definitions like {{define "head"}}.
		tmpl := template.New(rel).Funcs(funcMap)
		_, err = tmpl.Parse(content)
		if err != nil {
			return err
		}
		templates[rel] = tmpl

		return nil
	})

	if err != nil {
		return nil, err
	}

	return templates, nil
}

// InitTemplates initializes the template system
func InitTemplates(config *Config) (*Templates, error) {
	t := &Templates{
		config:   config,
		metadata: make(map[string]*TemplateMetadata),
		merged:   make(map[string]*template.Template),
	}

	if !config.IsDevelopment() {
		// 本番モードでは起動時に一度だけ読み込む
		templates, err := t.LoadTemplates()
		if err != nil {
			return nil, err
		}
		t.templates = templates
	}

	return t, nil
}

// getTemplates returns the template map, reloading in development mode.
func (t *Templates) getTemplates() (map[string]*template.Template, error) {
	if t.config.IsDevelopment() {
		return t.LoadTemplates()
	}

	t.mu.RLock()
	if t.templates != nil {
		defer t.mu.RUnlock()
		return t.templates, nil
	}
	t.mu.RUnlock()

	t.mu.Lock()
	defer t.mu.Unlock()

	// Double check
	if t.templates != nil {
		return t.templates, nil
	}

	tmpl, err := t.LoadTemplates()
	if err != nil {
		return nil, err
	}
	t.templates = tmpl
	// Clear merged cache when templates are reloaded
	t.merged = make(map[string]*template.Template)
	return t.templates, nil
}

// RenderWithLayout renders a template with the specified layout.
// It merges the layout and content templates into a fresh set for isolation.
func (t *Templates) RenderWithLayout(c echo.Context, layoutName, contentName string, data interface{}) error {
	templates, err := t.getTemplates()
	if err != nil {
		return err
	}

	key := layoutName + "|" + contentName
	if !t.config.IsDevelopment() {
		t.mu.RLock()
		mergedTmpl, ok := t.merged[key]
		t.mu.RUnlock()
		if ok {
			t.setHeaders(c, layoutName, contentName)
			err = mergedTmpl.ExecuteTemplate(c.Response(), layoutName, data)
			if err != nil {
				log.Printf("Template execution error (RenderWithLayout cached): %v", err)
			}
			return err
		}
	}

	contentTmpl := templates[contentName]
	if contentTmpl == nil {
		return fmt.Errorf("content template %s not found", contentName)
	}

	layoutTmpl := templates[layoutName]
	if layoutTmpl == nil {
		return fmt.Errorf("layout template %s not found", layoutName)
	}

	// Create a new template set starting with the layout.
	// Cloning layoutTmpl is important to avoid polluting the cached template.
	mergedTmpl, err := layoutTmpl.Clone()
	if err != nil {
		return err
	}

	// Merge all defined templates from the content template into the layout set.
	// This allows the content to override templates like "head" defined in the layout.
	for _, sub := range contentTmpl.Templates() {
		if sub.Name() == contentName {
			continue
		}
		// Overwrite or add the definition to the layout set.
		_, err := mergedTmpl.AddParseTree(sub.Name(), sub.Tree)
		if err != nil {
			return err
		}
	}

	// Inject the main body of the content template as "content" for the layout.
	_, err = mergedTmpl.AddParseTree("content", contentTmpl.Tree)
	if err != nil {
		return err
	}

	if !t.config.IsDevelopment() {
		t.mu.Lock()
		t.merged[key] = mergedTmpl
		t.mu.Unlock()
	}

	t.setHeaders(c, layoutName, contentName)

	err = mergedTmpl.ExecuteTemplate(c.Response(), layoutName, data)
	if err != nil {
		log.Printf("Template execution error (RenderWithLayout): %v", err)
	}
	return err
}

// Render renders a template by name
func (t *Templates) Render(c echo.Context, name string, data interface{}) error {
	templates, err := t.getTemplates()
	if err != nil {
		return err
	}

	tmpl := templates[name]
	if tmpl == nil {
		return fmt.Errorf("template %s not found", name)
	}

	t.setHeaders(c, name)

	err = tmpl.ExecuteTemplate(c.Response(), name, data)
	if err != nil {
		log.Printf("Template execution error (Render): %v", err)
	}
	return err
}

// RenderTo renders a template to an io.Writer (no header setting)
func (t *Templates) RenderTo(w io.Writer, name string, data interface{}) error {
	templates, err := t.getTemplates()
	if err != nil {
		return err
	}

	tmpl := templates[name]
	if tmpl == nil {
		return fmt.Errorf("template %s not found", name)
	}

	err = tmpl.ExecuteTemplate(w, name, data)
	if err != nil {
		log.Printf("Template execution error (RenderTo): %v", err)
	}
	return err
}

func (t *Templates) setHeaders(c echo.Context, names ...string) {
	for _, name := range names {
		if meta, ok := t.metadata[name]; ok {
			for _, l := range meta.Links {
				rel := l.Rel
				if rel == "" {
					rel = "preload"
				}
				link := fmt.Sprintf("<%s>; rel=%s", l.URL, rel)
				if l.As != "" {
					link += fmt.Sprintf("; as=%s", l.As)
				}
				if l.CrossOrigin {
					link += "; crossorigin"
				}
				c.Response().Header().Add("Link", link)
			}
		}
	}
}

// formatDate formats a date string from "2006-01-02" to "2006年 01月 02日"
func formatDate(dateStr string) string {
	parts := strings.Split(dateStr, "-")
	if len(parts) != 3 {
		return dateStr
	}
	return parts[0] + "年 " + parts[1] + "月 " + parts[2] + "日"
}

// datePath converts a date string from "2006-01-02" to "/2006/01/02/"
func datePath(dateStr string) string {
	if len(dateStr) != 10 { // YYYY-MM-DD
		return "/" + strings.ReplaceAll(dateStr, "-", "/") + "/"
	}
	return "/" + dateStr[0:4] + "/" + dateStr[5:7] + "/" + dateStr[8:10] + "/"
}
