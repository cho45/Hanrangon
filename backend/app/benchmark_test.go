package app

import (
	"bytes"
	"context"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/cho45/hanrangon/backend/model/imagesdb"
	"github.com/cho45/hanrangon/backend/model/maindb"
)

// preallocRecorder は事前確保されたバッファを持つ ResponseRecorder
// pprof 結果から bytes.growSlice のノイズを除去するために使用
type preallocRecorder struct {
	Code   int
	header http.Header
	Body   *bytes.Buffer
}

func newPreallocRecorder(size int) *preallocRecorder {
	return &preallocRecorder{
		Code:   http.StatusOK,
		header: make(http.Header),
		Body:   bytes.NewBuffer(make([]byte, 0, size)),
	}
}

func (r *preallocRecorder) Header() http.Header {
	return r.header
}

func (r *preallocRecorder) Write(b []byte) (int, error) {
	return r.Body.Write(b)
}

func (r *preallocRecorder) WriteHeader(code int) {
	r.Code = code
}

func (r *preallocRecorder) Reset() {
	r.Code = http.StatusOK
	r.Body.Reset()
	clear(r.header)
}

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

	// テストデータを準備 (より現実に近い件数にする)
	createBenchEntries(b, env, 100)

	req := httptest.NewRequest(http.MethodGet, "/", nil)

	// レスポンスサイズに十分な容量を事前確保（grow を回避）
	rec := newPreallocRecorder(512 * 1024)

	b.ResetTimer()
	b.ReportAllocs()

	for i := 0; i < b.N; i++ {
		rec.Reset()
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
	rec := newPreallocRecorder(128 * 1024)

	b.ResetTimer()
	b.ReportAllocs()

	for i := 0; i < b.N; i++ {
		rec.Reset()
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

	// OGP 画像は約 100KB 程度
	rec := newPreallocRecorder(256 * 1024)

	b.ResetTimer()
	b.ReportAllocs()

	for i := 0; i < b.N; i++ {
		// キャッシュを無効化するために毎回 Cache-Control: no-cache を設定
		req := httptest.NewRequest(http.MethodGet, fmt.Sprintf("/images/ogp/%d", entry.ID), nil)
		req.Header.Set("Cache-Control", "no-cache")
		rec.Reset()
		env.server.ServeHTTP(rec, req)

		if rec.Code != http.StatusOK {
			b.Fatalf("expected status 200, got %d", rec.Code)
		}
	}
}

// BenchmarkFindSimilarImagesBulk は画像類似度検索のベンチマーク
func BenchmarkFindSimilarImagesBulk(b *testing.B) {
	env := setupBenchmark(b)
	defer env.close()

	ctx := context.Background()

	// テスト用画像を20枚作成
	const numImages = 20
	var images []imagesdb.Image
	for i := 0; i < numImages; i++ {
		// 実際にはDBにレコードがある必要がある
		params := imagesdb.CreateImageParams{
			Uri:     fmt.Sprintf("/images/entry/bench-%d.png", i),
			EntryID: int64(i + 1),
			Sig:     []byte{byte(i), byte(i), byte(i), byte(i), byte(i), byte(i), byte(i), byte(i)},
		}
		imgID, err := env.app.ImagesDB().Q.CreateImage(ctx, params)
		if err != nil {
			b.Fatal(err)
		}
		images = append(images, imagesdb.Image{
			ID:      imgID,
			Uri:     params.Uri,
			EntryID: params.EntryID,
			Sig:     params.Sig,
		})

		// キャッシュにダミーデータを20件ずつ入れる
		for j := 0; j < 20; j++ {
			env.app.ImagesDB().Q.UpsertSimilarImage(ctx, imagesdb.UpsertSimilarImageParams{
				ImageID:        imgID,
				SimilarImageID: int64(j + 100), // 適当なID
				Score:          int64(j),
				Jaccard:        0.5,
			})
		}
	}

	b.ResetTimer()
	b.ReportAllocs()

	for i := 0; i < b.N; i++ {
		_, err := env.app.(*AppImpl).findSimilarImagesBulk(ctx, images)
		if err != nil {
			b.Fatal(err)
		}
	}
}

// BenchmarkHandleStatic は静的ファイル配信のベンチマーク
func BenchmarkHandleStatic(b *testing.B) {
	env := setupBenchmark(b)
	defer env.close()

	// 実際に存在する静的ファイルのパスを使用
	req := httptest.NewRequest(http.MethodGet, "/images/favicon.ico", nil)
	rec := newPreallocRecorder(64 * 1024)

	b.ResetTimer()
	b.ReportAllocs()

	for i := 0; i < b.N; i++ {
		rec.Reset()
		env.server.ServeHTTP(rec, req)

		if rec.Code != http.StatusOK {
			b.Fatalf("expected status 200, got %d", rec.Code)
		}
	}
}
