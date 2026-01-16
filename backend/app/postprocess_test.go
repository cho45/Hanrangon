package app

import (
	"context"
	"fmt"
	"strings"
	"testing"
	"time"
)

func TestPostprocess(t *testing.T) {
	env := setupTest(t)
	defer env.close()

	ctx := context.Background()
	html := `<p>Hello World</p><pre class="highlight"><code>const x = 1;</code></pre>`

	// 1回目の実行（プロセス起動）
	res1, err := env.app.Postprocess(ctx, html, nil)
	if err != nil {
		t.Fatalf("First postprocess failed: %v", err)
	}
	if res1 == "" {
		t.Error("First result is empty")
	}

	// 2回目の実行（常駐プロセス再利用）
	res2, err := env.app.Postprocess(ctx, html, nil)
	if err != nil {
		t.Fatalf("Second postprocess failed: %v", err)
	}
	if res2 != res1 {
		t.Errorf("Results differ: res1=%d bytes, res2=%d bytes", len(res1), len(res2))
	}
}

func TestPostprocessIdleTimeout(t *testing.T) {
	env := setupTest(t)
	defer env.close()

	ctx := context.Background()
	html := `<p>Hello</p>`

	// 1. 短いタイムアウトでプロセスを起動
	appImpl := env.app.(*AppImpl)
	p, err := appImpl.PostprocessBatch(ctx, 100*time.Millisecond)
	if err != nil {
		t.Fatalf("Failed to start batch: %v", err)
	}

	appImpl.postprocessMu.Lock()
	appImpl.postprocessProcessor = p
	appImpl.postprocessMu.Unlock()

	// 2. 一度実行
	_, err = env.app.Postprocess(ctx, html, nil)
	if err != nil {
		t.Fatalf("First postprocess failed: %v", err)
	}

	// 3. タイムアウト（100ms）より長く待機
	time.Sleep(300 * time.Millisecond)

	// 4. 再度実行（ここで Broken pipe を検知してリトライ・再起動が走るはず）
	res, err := env.app.Postprocess(ctx, html, nil)
	if err != nil {
		t.Fatalf("Postprocess after timeout failed: %v", err)
	}
	if !strings.Contains(res, "Hello") {
		t.Errorf("Unexpected result: %s", res)
	}
}

func TestPostprocessCancel(t *testing.T) {
	env := setupTest(t)
	defer env.close()

	html := `<p>Hello</p>`

	// 1. すでにキャンセルされている context を渡す
	ctx, cancel := context.WithCancel(context.Background())
	cancel()

	_, err := env.app.Postprocess(ctx, html, nil)
	if err == nil {
		t.Error("Expected error for canceled context, but got nil")
	}
	if err != context.Canceled {
		t.Errorf("Expected context.Canceled, but got %v", err)
	}

	// 2. その後、通常の context で実行して復旧することを確認
	res, err := env.app.Postprocess(context.Background(), html, nil)
	if err != nil {
		t.Fatalf("Postprocess after cancel failed: %v", err)
	}
	if !strings.Contains(res, "Hello") {
		t.Errorf("Unexpected result: %s", res)
	}
}

func TestPostprocessProgress(t *testing.T) {
	env := setupTest(t)
	defer env.close()

	ctx := context.Background()
	// MathJax などの処理が走るような HTML を渡す
	html := `<p>$$x^2$$</p>`

	session := &ProgressSession{
		ID:       "test-session",
		Messages: make(chan string, 100),
		Done:     make(chan error, 1),
	}

	// PostprocessWithProgress は削除されたので Postprocess を使う
	_, err := env.app.Postprocess(ctx, html, session)
	if err != nil {
		t.Fatalf("Postprocess failed: %v", err)
	}

	// Messages チャネルから Node のログが届いているか確認
	foundProgress := false
	timeout := time.After(5 * time.Second)
loop:
	for {
		select {
		case msg := <-session.Messages:
			t.Logf("Received progress: %s", msg)
			// Node 側から JSON-RPC の progress 通知として送られてきたメッセージが、
			// ProgressSession.Report 経由で SSE 用の JSON 形式に変換されているか確認。
			if strings.Contains(msg, `"type":"progress"`) &&
				(strings.Contains(msg, "processHTML") || strings.Contains(msg, "MathJax")) {
				foundProgress = true
			}
		case <-timeout:
			break loop
		default:
			if foundProgress {
				// すべてのメッセージを読み切るために少し待つ
				time.Sleep(100 * time.Millisecond)
				break loop
			}
			time.Sleep(10 * time.Millisecond)
		}
	}

	if !foundProgress {
		t.Error("Did not receive detailed progress messages from Node.js stderr")
	}
}

func TestPostprocessProgressBlocking(t *testing.T) {
	env := setupTest(t)
	defer env.close()

	ctx := context.Background()
	html := `<p>$$x^2$$</p>`

	// バッファなしチャネルを作成して、意図的にブロッキングを誘発する
	session := &ProgressSession{
		ID:       "blocking-test-session",
		Messages: make(chan string), // バッファなし
		Done:     make(chan error, 1),
	}

	// 読み取りを行わずに実行。
	// ProgressSession.Report がブロッキング実装なら、ここでデッドロックしてタイムアウトする。
	// 非ブロッキング実装なら、メッセージはドロップされるが処理は完了する。
	done := make(chan struct{})
	go func() {
		_, err := env.app.Postprocess(ctx, html, session)
		if err != nil {
			t.Errorf("Postprocess failed: %v", err)
		}
		close(done)
	}()

	select {
	case <-done:
		// Success
	case <-time.After(2 * time.Second):
		t.Fatal("Postprocess timed out (likely deadlocked due to blocking channel)")
	}
}

func TestPostprocessConcurrent(t *testing.T) {
	env := setupTest(t)
	defer env.close()

	const numRequests = 10
	errCh := make(chan error, numRequests)

	for i := 0; i < numRequests; i++ {
		go func(id int) {
			ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
			defer cancel()

			html := fmt.Sprintf("<p>Request %d</p>", id)
			res, err := env.app.Postprocess(ctx, html, nil)
			if err != nil {
				errCh <- fmt.Errorf("request %d failed: %v", id, err)
				return
			}
			if !strings.Contains(res, fmt.Sprintf("Request %d", id)) {
				errCh <- fmt.Errorf("request %d got wrong result: %s", id, res)
				return
			}
			errCh <- nil
		}(i)
	}

	for i := 0; i < numRequests; i++ {
		if err := <-errCh; err != nil {
			t.Error(err)
		}
	}
}

// TestPostprocessProcessCrash はプロセスが強制終了された場合のリトライを検証
func TestPostprocessProcessCrash(t *testing.T) {
	env := setupTest(t)
	defer env.close()

	ctx := context.Background()
	html := `<p>Hello</p>`

	appImpl := env.app.(*AppImpl)

	// 1. 最初の実行（プロセス起動）
	res1, err := env.app.Postprocess(ctx, html, nil)
	if err != nil {
		t.Fatalf("First postprocess failed: %v", err)
	}
	if !strings.Contains(res1, "Hello") {
		t.Errorf("Unexpected result: %s", res1)
	}

	// 2. プロセスを強制終了
	appImpl.postprocessMu.Lock()
	if appImpl.postprocessProcessor != nil {
		if appImpl.postprocessProcessor.cmd != nil && appImpl.postprocessProcessor.cmd.Process != nil {
			t.Logf("Killing process PID: %d", appImpl.postprocessProcessor.cmd.Process.Pid)
			_ = appImpl.postprocessProcessor.cmd.Process.Kill()
		}
	}
	appImpl.postprocessMu.Unlock()

	// 少し待機（プロセスが完全に終了するまで）
	time.Sleep(100 * time.Millisecond)

	// 3. 再度実行（リトライが走って新しいプロセスが起動されるはず）
	res2, err := env.app.Postprocess(ctx, html, nil)
	if err != nil {
		t.Fatalf("Postprocess after crash failed: %v", err)
	}
	if !strings.Contains(res2, "Hello") {
		t.Errorf("Unexpected result after crash: %s", res2)
	}
}

// TestPostprocessLargeHTML は大きな HTML の処理を検証
func TestPostprocessLargeHTML(t *testing.T) {
	env := setupTest(t)
	defer env.close()

	ctx := context.Background()

	// 約 1MB の HTML を生成（バッファサイズ 2MB の半分、現実的な大きなエントリサイズ）
	var builder strings.Builder
	builder.WriteString("<div>")
	for i := 0; i < 20000; i++ {
		builder.WriteString(fmt.Sprintf("<p>Line %d: This is a test line with some content.</p>", i))
	}
	builder.WriteString("</div>")
	html := builder.String()

	t.Logf("Testing with HTML size: %d bytes (%.2f MB)", len(html), float64(len(html))/1024/1024)

	res, err := env.app.Postprocess(ctx, html, nil)
	if err != nil {
		t.Fatalf("Postprocess large HTML failed: %v", err)
	}
	if len(res) == 0 {
		t.Error("Result is empty")
	}
	if !strings.Contains(res, "Line 0") {
		t.Error("Result does not contain expected content")
	}
}

// TestPostprocessInvalidJSON は不正な JSON レスポンスの処理を検証
// このテストは Node.js 側が壊れた JSON を返すケースをシミュレートできないため、
// 代わりにタイムアウトが適切に機能することを検証する
func TestPostprocessTimeout(t *testing.T) {
	env := setupTest(t)
	defer env.close()

	// 非常に短いタイムアウトで実行（Node.js が応答する前にタイムアウト）
	ctx, cancel := context.WithTimeout(context.Background(), 1*time.Millisecond)
	defer cancel()

	// 短時間でタイムアウトするため、エラーが返るはず
	html := `<p>Test</p>`
	_, err := env.app.Postprocess(ctx, html, nil)
	if err == nil {
		t.Error("Expected timeout error, but got nil")
	}
	if !strings.Contains(err.Error(), "context deadline exceeded") &&
		!strings.Contains(err.Error(), "context canceled") {
		t.Errorf("Expected timeout error, got: %v", err)
	}
}

// TestPostprocessMemoryLeak はメモリリークがないことを検証
func TestPostprocessMemoryLeak(t *testing.T) {
	if testing.Short() {
		t.Skip("Skipping memory leak test in short mode")
	}

	env := setupTest(t)
	defer env.close()

	ctx := context.Background()
	html := `<p>Memory leak test</p>`

	// 大量のリクエストを実行
	const numIterations = 100
	for i := 0; i < numIterations; i++ {
		res, err := env.app.Postprocess(ctx, html, nil)
		if err != nil {
			t.Fatalf("Iteration %d failed: %v", i, err)
		}
		if !strings.Contains(res, "Memory leak test") {
			t.Errorf("Iteration %d: unexpected result", i)
		}

		// 10回ごとに進捗を表示
		if (i+1)%10 == 0 {
			t.Logf("Completed %d/%d iterations", i+1, numIterations)
		}
	}

	// BatchProcessor の sessions が空であることを確認
	appImpl := env.app.(*AppImpl)
	appImpl.postprocessMu.Lock()
	if appImpl.postprocessProcessor != nil {
		count := 0
		appImpl.postprocessProcessor.sessions.Range(func(key, value interface{}) bool {
			count++
			return true
		})
		if count > 0 {
			t.Errorf("Found %d leaked sessions in sync.Map", count)
		}
	}
	appImpl.postprocessMu.Unlock()

	t.Logf("Memory leak test completed: %d iterations", numIterations)
}

// TestPostprocessCloseWhileProcessing はプロセス中に Close が呼ばれた場合の動作を検証
func TestPostprocessCloseWhileProcessing(t *testing.T) {
	env := setupTest(t)
	defer env.close()

	ctx := context.Background()
	html := `<p>Close while processing</p>`

	appImpl := env.app.(*AppImpl)

	// 1. プロセスを起動
	_, err := env.app.Postprocess(ctx, html, nil)
	if err != nil {
		t.Fatalf("First postprocess failed: %v", err)
	}

	// 2. 並行してリクエストを送信し、途中で Close を呼ぶ
	errCh := make(chan error, 5)
	for i := 0; i < 5; i++ {
		go func(id int) {
			_, err := env.app.Postprocess(ctx, html, nil)
			errCh <- err
		}(i)
	}

	// 少し待ってから Close
	time.Sleep(50 * time.Millisecond)
	if err := appImpl.Close(); err != nil {
		t.Logf("Close returned error (expected): %v", err)
	}

	// すべてのリクエストが何らかの結果を返すことを確認
	for i := 0; i < 5; i++ {
		err := <-errCh
		// エラーまたは成功のいずれかであることを確認（ハングしないことが重要）
		t.Logf("Request %d result: %v", i, err)
	}
}
