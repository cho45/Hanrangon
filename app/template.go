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
	templates *template.Template
	config    *Config
}

// LoadTemplates loads all HTML templates from the view directory
func LoadTemplates(config *Config) (*Templates, error) {
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

	// テンプレートファイルを読み込み
	// テストとメインで異なるパスを試す
	var err error
	tmpl, err = tmpl.ParseGlob("view/*.html")
	if err != nil {
		// テスト実行時は相対パスが異なる
		tmpl = template.New("")
		tmpl.Funcs(funcMap) // 再度funcMapを登録
		tmpl, err = tmpl.ParseGlob("../view/*.html")
		if err != nil {
			return nil, err
		}
	}

	return &Templates{
		templates: tmpl,
		config:    config,
	}, nil
}

// Render renders a template with the given data
func (t *Templates) Render(w io.Writer, name string, data interface{}) error {
	// 開発モードでは毎回リロード
	if t.config.IsDevelopment() {
		tmpl, err := LoadTemplates(t.config)
		if err != nil {
			return err
		}
		return tmpl.templates.ExecuteTemplate(w, name, data)
	}

	return t.templates.ExecuteTemplate(w, name, data)
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
