package app

import (
	"fmt"
	"html/template"
	"io"
	"log"
	"os"
	"path/filepath"
	"strings"

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
	templates *template.Template // 本番モード用キャッシュ (未実行)
	metadata  map[string]*TemplateMetadata
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

	return funcMap
}

// LoadTemplates loads all templates recursively from the view directory
func (t *Templates) LoadTemplates() (*template.Template, error) {
	tmpl := template.New("")
	funcMap := buildFuncMap()
	tmpl.Funcs(funcMap)
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

		_, err = tmpl.New(rel).Parse(content)
		if err != nil {
			return err
		}

		return nil
	})

	if err != nil {
		return nil, err
	}

	return tmpl, nil
}

// InitTemplates initializes the template system
func InitTemplates(config *Config) (*Templates, error) {
	t := &Templates{
		config:   config,
		metadata: make(map[string]*TemplateMetadata),
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

// getTemplates returns a fresh clone of the template set to avoid "cannot Clone after executed" error.
func (t *Templates) getTemplates() (*template.Template, error) {
	if t.config.IsDevelopment() {
		return t.LoadTemplates()
	}

	if t.templates != nil {
		return t.templates.Clone()
	}

	tmpl, err := t.LoadTemplates()
	if err != nil {
		return nil, err
	}
	t.templates = tmpl
	return t.templates.Clone()
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

// RenderWithLayout renders a template with the specified layout
func (t *Templates) RenderWithLayout(c echo.Context, layoutName, contentName string, data interface{}) error {
	templates, err := t.getTemplates()
	if err != nil {
		return err
	}

	layoutTmpl := templates.Lookup(layoutName)
	if layoutTmpl == nil {
		return fmt.Errorf("layout template %s not found", layoutName)
	}

	contentTmpl := templates.Lookup(contentName)
	if contentTmpl == nil {
		return fmt.Errorf("content template %s not found", contentName)
	}

	// templates は既に Clone() されたものなので AddParseTree してもマスターは汚染されない
	_, err = layoutTmpl.AddParseTree("content", contentTmpl.Tree)
	if err != nil {
		return err
	}

	t.setHeaders(c, layoutName, contentName)

	err = layoutTmpl.Execute(c.Response(), data)
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

	t.setHeaders(c, name)

	err = templates.ExecuteTemplate(c.Response(), name, data)
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
	err = templates.ExecuteTemplate(w, name, data)
	if err != nil {
		log.Printf("Template execution error (RenderTo): %v", err)
	}
	return err
}

// formatDate formats a date string from "2006-01-02" to "2006年 01月 02日"
func formatDate(dateStr string) string {
	parts := strings.Split(dateStr, "-")
	if len(parts) != 3 {
		return dateStr
	}
	return fmt.Sprintf("%s年 %s月 %s日", parts[0], parts[1], parts[2])
}

// datePath converts a date string from "2006-01-02" to "/2006/01/02/"
func datePath(dateStr string) string {
	return "/" + strings.ReplaceAll(dateStr, "-", "/") + "/"
}
