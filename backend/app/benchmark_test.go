package app

import (
	"context"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/cho45/hanrangon/backend/model/maindb"
)

// setupBenchmark はベンチマーク用のテスト環境を準備する
// testing.B.N ループ内で繰返し呼ばれないよう、b.Helper() を使用して外部で初期化する
func setupBenchmark(b *testing.B) *testEnv {
	b.Helper()

	env := setupTest(&testing.T{})

	return env
}

// createBenchEntries はベンチマーク用のテストエントリを作成する
func createBenchEntries(b *testing.B, env *testEnv, count int) {
	b.Helper()
	ctx := context.Background()

	for i := 0; i < count; i++ {
		_, err := env.app.MainDB().Q.CreateEntry(ctx, maindb.CreateEntryParams{
			Title:         "Benchmark Test Entry",
			Body:          "This is a benchmark test entry body with some content to make it realistic.",
			FormattedBody: "<p>This is a benchmark test entry body with some content to make it realistic.</p>",
			Summary:       "Benchmark test entry summary",
			Path:          "2025/01/01/" + string(rune('a'+i)),
			Format:        "Markdown",
			Date:          "2025-01-01",
			Status:        "public",
		})
		if err != nil {
			b.Fatalf("failed to create entry: %v", err)
		}
	}
}

// BenchmarkHandleIndex はトップページのベンチマーク
func BenchmarkHandleIndex(b *testing.B) {
	env := setupBenchmark(b)
	defer env.close()

	// テストデータを準備
	createBenchEntries(b, env, 10)

	req := httptest.NewRequest(http.MethodGet, "/", nil)

	b.ResetTimer()
	b.ReportAllocs()

	for i := 0; i < b.N; i++ {
		rec := httptest.NewRecorder()
		env.server.ServeHTTP(rec, req)

		if rec.Code != http.StatusOK {
			b.Fatalf("expected status 200, got %d", rec.Code)
		}
	}
}

// BenchmarkHandlePath は個別エントリページのベンチマーク
func BenchmarkHandlePath(b *testing.B) {
	env := setupBenchmark(b)
	defer env.close()

	// テストエントリを1つ作成
	ctx := context.Background()
	entry, err := env.app.MainDB().Q.CreateEntry(ctx, maindb.CreateEntryParams{
		Title:         "Benchmark Test Entry for Path",
		Body:          "This is a benchmark test entry body with some content to make it realistic. Lorem ipsum dolor sit amet.",
		FormattedBody: "<p>This is a benchmark test entry body with some content to make it realistic. Lorem ipsum dolor sit amet.</p>",
		Summary:       "Benchmark test entry summary",
		Path:          "2025/01/01/benchmark-entry",
		Format:        "Markdown",
		Date:          "2025-01-01",
		Status:        "public",
	})
	if err != nil {
		b.Fatalf("failed to create entry: %v", err)
	}

	req := httptest.NewRequest(http.MethodGet, "/"+entry.Path, nil)

	b.ResetTimer()
	b.ReportAllocs()

	for i := 0; i < b.N; i++ {
		rec := httptest.NewRecorder()
		env.server.ServeHTTP(rec, req)

		if rec.Code != http.StatusOK {
			b.Fatalf("expected status 200, got %d", rec.Code)
		}
	}
}

// BenchmarkHandleOGP はOGP画像生成のベンチマーク（キャッシュなし）
func BenchmarkHandleOGP(b *testing.B) {
	env := setupBenchmark(b)
	defer env.close()

	// テストエントリを1つ作成
	ctx := context.Background()
	entry, err := env.app.MainDB().Q.CreateEntry(ctx, maindb.CreateEntryParams{
		Title:         "Benchmark Test Entry for OGP",
		Body:          "This is a benchmark test entry body for OGP image generation.",
		FormattedBody: "<p>This is a benchmark test entry body for OGP image generation.</p>",
		Summary:       "Benchmark test entry summary for OGP",
		Path:          "2025/01/01/benchmark-ogp",
		Format:        "Markdown",
		Date:          "2025-01-01",
		Status:        "public",
	})
	if err != nil {
		b.Fatalf("failed to create entry: %v", err)
	}

	b.ResetTimer()
	b.ReportAllocs()

	for i := 0; i < b.N; i++ {
		// キャッシュを無効化するために毎回 Cache-Control: no-cache を設定
		req := httptest.NewRequest(http.MethodGet, fmt.Sprintf("/images/ogp/%d", entry.ID), nil)
		req.Header.Set("Cache-Control", "no-cache")
		rec := httptest.NewRecorder()
		env.server.ServeHTTP(rec, req)

		if rec.Code != http.StatusOK {
			b.Fatalf("expected status 200, got %d", rec.Code)
		}
	}
}

// BenchmarkHandleStatic は静的ファイル配信のベンチマーク
func BenchmarkHandleStatic(b *testing.B) {
	env := setupBenchmark(b)
	defer env.close()

	// 実際に存在する静的ファイルのパスを使用
	req := httptest.NewRequest(http.MethodGet, "/images/favicon.ico", nil)

	b.ResetTimer()
	b.ReportAllocs()

	for i := 0; i < b.N; i++ {
		rec := httptest.NewRecorder()
		env.server.ServeHTTP(rec, req)

		if rec.Code != http.StatusOK {
			b.Fatalf("expected status 200, got %d", rec.Code)
		}
	}
}
