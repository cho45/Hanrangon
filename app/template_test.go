package app

import (
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"testing"

	"github.com/labstack/echo/v4"
)

func TestTemplates_MetadataParsing(t *testing.T) {
	tmpDir, err := os.MkdirTemp("", "hanrangon-template-test")
	if err != nil {
		t.Fatalf("failed to create temp dir: %v", err)
	}
	defer os.RemoveAll(tmpDir)

	viewDir := filepath.Join(tmpDir, "view")
	if err := os.Mkdir(viewDir, 0755); err != nil {
		t.Fatalf("failed to create view dir: %v", err)
	}

	templateContent := `---
links = [
  { url = "/css/test.css", rel = "preload", as = "style" },
  { url = "/js/test.js", rel = "preload", as = "script", crossorigin = true }
]
---
<html><body>Test</body></html>`

	if err := os.WriteFile(filepath.Join(viewDir, "test.html"), []byte(templateContent), 0644); err != nil {
		t.Fatalf("failed to write template file: %v", err)
	}

	// Change working directory for LoadTemplates to find the view directory
	oldWd, _ := os.Getwd()
	os.Chdir(tmpDir)
	defer os.Chdir(oldWd)

	config := &Config{Environment: "development"}
	templates, err := InitTemplates(config)
	if err != nil {
		t.Fatalf("InitTemplates failed: %v", err)
	}

	tmpl, err := templates.LoadTemplates()
	if err != nil {
		t.Fatalf("LoadTemplates failed: %v", err)
	}

	if tmpl.Lookup("test.html") == nil {
		t.Fatal("template test.html not found")
	}

	meta, ok := templates.metadata["test.html"]
	if !ok {
		t.Fatal("metadata for test.html not found")
	}

	if len(meta.Links) != 2 {
		t.Errorf("expected 2 links, got %d", len(meta.Links))
	}

	if meta.Links[0].URL != "/css/test.css" || meta.Links[0].As != "style" {
		t.Errorf("unexpected link 0: %+v", meta.Links[0])
	}

	if meta.Links[1].URL != "/js/test.js" || meta.Links[1].As != "script" || !meta.Links[1].CrossOrigin {
		t.Errorf("unexpected link 1: %+v", meta.Links[1])
	}
}

func TestTemplates_RenderSetsLinkHeader(t *testing.T) {
	tmpDir, err := os.MkdirTemp("", "hanrangon-render-test")
	if err != nil {
		t.Fatalf("failed to create temp dir: %v", err)
	}
	defer os.RemoveAll(tmpDir)

	viewDir := filepath.Join(tmpDir, "view")
	if err := os.Mkdir(viewDir, 0755); err != nil {
		t.Fatalf("failed to create view dir: %v", err)
	}

	contentTmpl := `---
links = [ { url = "/js/content.js", rel = "preload", as = "script" } ]
---
{{define "content"}}Content{{end}}`

	layoutTmpl := `---
links = [ { url = "/css/layout.css", rel = "preload", as = "style" } ]
---
<html>{{template "content" .}}</html>`

	os.WriteFile(filepath.Join(viewDir, "content.html"), []byte(contentTmpl), 0644)
	os.WriteFile(filepath.Join(viewDir, "layout.html"), []byte(layoutTmpl), 0644)

	oldWd, _ := os.Getwd()
	os.Chdir(tmpDir)
	defer os.Chdir(oldWd)

	config := &Config{Environment: "development"}
	templates, err := InitTemplates(config)
	if err != nil {
		t.Fatalf("InitTemplates failed: %v", err)
	}

	e := echo.New()
	req := httptest.NewRequest(http.MethodGet, "/", nil)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)

	err = templates.RenderWithLayout(c, "layout.html", "content.html", nil)
	if err != nil {
		t.Fatalf("RenderWithLayout failed: %v", err)
	}

	links := rec.Header().Values("Link")
	if len(links) != 2 {
		t.Errorf("expected 2 Link headers, got %d: %v", len(links), links)
	}

	expectedLinks := map[string]bool{
		"</css/layout.css>; rel=preload; as=style": true,
		"</js/content.js>; rel=preload; as=script": true,
	}

	for _, link := range links {
		if !expectedLinks[link] {
			t.Errorf("unexpected link header: %s", link)
		}
		delete(expectedLinks, link)
	}

	if len(expectedLinks) > 0 {
		t.Errorf("missing link headers: %v", expectedLinks)
	}
}
