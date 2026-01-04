package app

import (
	"fmt"
	"html/template"
	"io"
	"log"
	"os"
	"path/filepath"
	"strings"

	"github.com/Masterminds/sprig/v3"
	"github.com/cho45/hanrangon/view"
)

// Templates manages HTML templates
type Templates struct {
	config    *Config
	templates *template.Template // 本番モード用キャッシュ (未実行)
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
		clean, tags := view.ParseTitle(title)
		return []interface{}{clean, tags}, nil
	}
	funcMap["cleanTitle"] = func(title string) string {
		clean, _ := view.ParseTitle(title)
		return clean
	}
	funcMap["getTags"] = func(title string) []string {
		_, tags := view.ParseTitle(title)
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

		_, err = tmpl.New(rel).Parse(string(b))
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
		config: config,
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

// RenderWithLayout renders a template with the specified layout
func (t *Templates) RenderWithLayout(w io.Writer, layoutName, contentName string, data interface{}) error {
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

	err = layoutTmpl.Execute(w, data)
	if err != nil {
		log.Printf("Template execution error (RenderWithLayout): %v", err)
	}
	return err
}

// Render renders a template by name
func (t *Templates) Render(w io.Writer, name string, data interface{}) error {
	templates, err := t.getTemplates()
	if err != nil {
		return err
	}
	err = templates.ExecuteTemplate(w, name, data)
	if err != nil {
		log.Printf("Template execution error (Render): %v", err)
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
