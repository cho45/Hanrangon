package app

import (
	"fmt"
	"html/template"
	"log"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"sync"

	"github.com/BurntSushi/toml"
	"github.com/Masterminds/sprig/v3"
	"github.com/cho45/hanrangon/backend/view"
	"github.com/labstack/echo/v4"
)

// TemplateMetadata はテンプレートのフロントマターから解析されたメタデータを保持
type TemplateMetadata struct {
	Links []struct {
		URL         string `toml:"url"`
		Rel         string `toml:"rel"`
		As          string `toml:"as"`
		CrossOrigin bool   `toml:"crossorigin"`
	} `toml:"links"`
}

// Templates はHTMLテンプレートを管理
type Templates struct {
	config    *Config
	templates map[string]*template.Template
	metadata  map[string]*TemplateMetadata
	merged    map[string]*template.Template
	mu        sync.RWMutex
}

// buildFuncMap はテンプレート用の関数マップを構築
func buildFuncMap() template.FuncMap {
	funcMap := sprig.FuncMap()

	// カスタム関数を追加
	funcMap["similarURL"] = func(entries []view.ViewEntry) string {
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

// loadTemplates は各テンプレートを分離されたセットとして読み込み、テンプレート間の名前衝突（例："head"）を回避
func (t *Templates) loadTemplates() (map[string]*template.Template, map[string]*TemplateMetadata, error) {
	templates := make(map[string]*template.Template)
	funcMap := buildFuncMap()
	metadata := make(map[string]*TemplateMetadata)

	basePath := filepath.Join(t.config.BaseDir, "backend", "view")

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
		// フロントマター形式の解析: "---\n"で始まる場合はTOMLメタデータを解析
		// 形式:
		//   ---
		//   [links]
		//   url = "..."
		//   ---
		//   テンプレート本文
		if strings.HasPrefix(content, "---\n") {
			// SplitNで3分割すると ["", "TOML", "テンプレート本文"] になる
			parts := strings.SplitN(content, "---\n", 3)
			if len(parts) == 3 {
				var meta TemplateMetadata
				if _, err := toml.Decode(parts[1], &meta); err == nil {
					metadata[rel] = &meta
					content = parts[2]
				} else {
					log.Printf("Error parsing TOML front matter in %s: %v", path, err)
				}
			}
		}

		// 各ファイルを独自のテンプレートセットとして解析し、{{define "head"}}のような定義を分離
		tmpl := template.New(rel).Funcs(funcMap)
		_, err = tmpl.Parse(content)
		if err != nil {
			return err
		}
		templates[rel] = tmpl

		return nil
	})

	if err != nil {
		return nil, nil, err
	}

	return templates, metadata, nil
}

// LoadTemplates はloadTemplatesのスレッドセーフなラッパー
func (t *Templates) LoadTemplates() (map[string]*template.Template, error) {
	templates, metadata, err := t.loadTemplates()
	if err != nil {
		return nil, err
	}
	t.mu.Lock()
	t.metadata = metadata
	t.mu.Unlock()
	return templates, nil
}

// InitTemplates はテンプレートシステムを初期化
func InitTemplates(config *Config) (*Templates, error) {
	t := &Templates{
		config:   config,
		metadata: make(map[string]*TemplateMetadata),
		merged:   make(map[string]*template.Template),
	}

	if !config.IsDevelopment() {
		// 本番モードでは起動時に一度だけ読み込む
		templates, metadata, err := t.loadTemplates()
		if err != nil {
			return nil, err
		}
		t.templates = templates
		t.metadata = metadata
	}

	return t, nil
}

// getTemplates はテンプレートマップとメタデータマップを返す。開発モードでは再読み込み
func (t *Templates) getTemplates() (map[string]*template.Template, map[string]*TemplateMetadata, error) {
	if t.config.IsDevelopment() {
		return t.loadTemplates()
	}

	t.mu.RLock()
	if t.templates != nil {
		defer t.mu.RUnlock()
		return t.templates, t.metadata, nil
	}
	t.mu.RUnlock()

	t.mu.Lock()
	defer t.mu.Unlock()

	// ダブルチェック
	if t.templates != nil {
		return t.templates, t.metadata, nil
	}

	tmpl, meta, err := t.loadTemplates()
	if err != nil {
		return nil, nil, err
	}
	t.templates = tmpl
	t.metadata = meta
	// テンプレート再読み込み時にマージ済みキャッシュをクリア
	t.merged = make(map[string]*template.Template)
	return t.templates, t.metadata, nil
}

// RenderWithLayout は指定されたレイアウトでテンプレートを描画
// レイアウトとコンテンツテンプレートを新規セットにマージして分離
func (t *Templates) RenderWithLayout(c echo.Context, layoutName, contentName string, data interface{}) error {
	templates, metadata, err := t.getTemplates()
	if err != nil {
		return err
	}

	key := layoutName + "|" + contentName
	if !t.config.IsDevelopment() {
		t.mu.RLock()
		mergedTmpl, ok := t.merged[key]
		t.mu.RUnlock()
		if ok {
			t.setHeaders(c, metadata, layoutName, contentName)
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

	// レイアウトから始まる新しいテンプレートセットを作成
	// layoutTmplをクローン化することで、キャッシュされたテンプレートの汚染を防ぐことが重要
	mergedTmpl, err := layoutTmpl.Clone()
	if err != nil {
		return err
	}

	// コンテンツテンプレートの定義済みテンプレートをすべてレイアウトセットにマージ
	// これにより、コンテンツがレイアウトで定義された"head"のようなテンプレートを上書きできる
	for _, sub := range contentTmpl.Templates() {
		if sub.Name() == contentName {
			continue
		}
		// レイアウトセットに定義を上書きまたは追加
		_, err := mergedTmpl.AddParseTree(sub.Name(), sub.Tree)
		if err != nil {
			return err
		}
	}

	// コンテンツテンプレートの本文を"content"としてレイアウトに注入
	_, err = mergedTmpl.AddParseTree("content", contentTmpl.Tree)
	if err != nil {
		return err
	}

	if !t.config.IsDevelopment() {
		t.mu.Lock()
		t.merged[key] = mergedTmpl
		t.mu.Unlock()
	}

	t.setHeaders(c, metadata, layoutName, contentName)

	err = mergedTmpl.ExecuteTemplate(c.Response(), layoutName, data)
	if err != nil {
		log.Printf("Template execution error (RenderWithLayout): %v", err)
	}
	return err
}

// Render は名前でテンプレートを描画
func (t *Templates) Render(c echo.Context, name string, data interface{}) error {
	templates, metadata, err := t.getTemplates()
	if err != nil {
		return err
	}

	tmpl := templates[name]
	if tmpl == nil {
		return fmt.Errorf("template %s not found", name)
	}

	t.setHeaders(c, metadata, name)

	err = tmpl.ExecuteTemplate(c.Response(), name, data)
	if err != nil {
		log.Printf("Template execution error (Render): %v", err)
	}
	return err
}

func (t *Templates) setHeaders(c echo.Context, metadata map[string]*TemplateMetadata, names ...string) {
	for _, name := range names {
		if meta, ok := metadata[name]; ok {
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
