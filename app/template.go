package app

import (
	"fmt"
	"html/template"
	"io"
	"os"
	"strings"

	"github.com/Masterminds/sprig/v3"
	"github.com/cho45/hanrangon/view"
)

// Templates manages HTML templates
type Templates struct {
	config    *Config
	templates *template.Template // 本番モード用キャッシュ
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

// LoadTemplates loads all templates from the view directory
func (t *Templates) LoadTemplates() (*template.Template, error) {
	tmpl := template.New("")
	funcMap := buildFuncMap()
	tmpl.Funcs(funcMap)

	// 実行ディレクトリに応じてテンプレートディレクトリのパスを決定
	// (メインから実行: view/, テストから実行: ../view/)
	basePath := "view/"
	if _, err := os.Stat(basePath); os.IsNotExist(err) {
		basePath = "../view/"
	}

	// HTML テンプレートを読み込む
	templates, err := tmpl.ParseGlob(basePath + "*.html")
	if err != nil {
		return nil, err
	}

	// XML テンプレートを読み込む
	templates, err = templates.ParseGlob(basePath + "*.xml")
	if err != nil {
		return nil, err
	}

	return templates, nil
}

// InitTemplates initializes the template system
func InitTemplates(config *Config) (*Templates, error) {
	t := &Templates{
		config: config,
	}

	if !config.IsDevelopment() {
		// 本番モードでは起動時に読み込んでキャッシュ
		templates, err := t.LoadTemplates()
		if err != nil {
			return nil, err
		}
		t.templates = templates
	}

	return t, nil
}

// getTemplates returns the template set (from cache or by loading)
func (t *Templates) getTemplates() (*template.Template, error) {
	// 開発モードでは常にテンプレートを再読み込み
	if t.config.IsDevelopment() {
		return t.LoadTemplates()
	}

	// 本番モードでキャッシュがあればそれを返す
	if t.templates != nil {
		return t.templates, nil
	}

	// キャッシュがない場合は読み込む
	return t.LoadTemplates()
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

	// layout をクローンして content を追加
	cloned, err := layoutTmpl.Clone()
	if err != nil {
		return err
	}

	_, err = cloned.AddParseTree("content", contentTmpl.Tree)
	if err != nil {
		return err
	}

	return cloned.ExecuteTemplate(w, layoutName, data)
}

// Render renders a template by name
func (t *Templates) Render(w io.Writer, name string, data interface{}) error {
	templates, err := t.getTemplates()
	if err != nil {
		return err
	}
	return templates.ExecuteTemplate(w, name, data)
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
