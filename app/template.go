package app

import (
	"fmt"
	"html/template"
	"io"
	"strings"

	"github.com/Masterminds/sprig/v3"
	"github.com/cho45/hanrangon/view"
)

// Templates manages HTML templates
type Templates struct {
	config *Config
}

// LoadTemplates loads all HTML templates from the view directory
func LoadTemplates(config *Config) (*Templates, error) {
	return &Templates{
		config: config,
	}, nil
}

// Render renders a template with the given data
func (t *Templates) Render(w io.Writer, name string, data interface{}) error {
	// 開発モードでは毎回リロード
	if t.config.IsDevelopment() {
		return t.renderTemplate(w, name, data)
	}

	// 本番モードではキャッシュ（未実装、とりあえず毎回読み込み）
	return t.renderTemplate(w, name, data)
}

func (t *Templates) renderTemplate(w io.Writer, name string, data interface{}) error {
	tmpl := template.New("")

	// Sprig関数を登録
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

	tmpl.Funcs(funcMap)

	// テンプレートファイルのパスを決定
	basePath := "view/"
	_, err := tmpl.ParseFiles(basePath + "layout.html")
	if err != nil {
		// テスト実行時は相対パスが異なる
		basePath = "../view/"
		tmpl = template.New("")
		tmpl.Funcs(funcMap)
		_, err = tmpl.ParseFiles(basePath + "layout.html")
		if err != nil {
			return err
		}
	}

	// テンプレート名に応じて追加ファイルを読み込み
	var additionalFiles []string
	var executeTemplate string
	switch name {
	case "index":
		additionalFiles = []string{basePath + "entries.html"}
		executeTemplate = "layout"
	case "archive":
		additionalFiles = []string{basePath + "archive.html"}
		executeTemplate = "layout"
	case "login":
		additionalFiles = []string{basePath + "login.html"}
		executeTemplate = "login"
	case "edit":
		additionalFiles = []string{basePath + "edit.html"}
		executeTemplate = "edit"
	case "feed":
		additionalFiles = []string{basePath + "feed.html"}
		executeTemplate = "feed"
	case "sitemap":
		additionalFiles = []string{basePath + "sitemap.html"}
		executeTemplate = "sitemap"
	case "similar-entries", "similar-images":
		additionalFiles = []string{basePath + "similar.html"}
		executeTemplate = name
	default:
		return fmt.Errorf("unknown template name: %s", name)
	}

	if len(additionalFiles) > 0 {
		_, err = tmpl.ParseFiles(additionalFiles...)
		if err != nil {
			return err
		}
	}

	return tmpl.ExecuteTemplate(w, executeTemplate, data)
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
