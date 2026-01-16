package app

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"net/url"
	"strings"
	"testing"
	"time"

	"github.com/labstack/echo/v4"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

// TestConcurrentEditRequests は、連続して2回のeditリクエストを送信し、
// 両方のprogressセッションが正しく動作することを確認する
func TestConcurrentEditRequests(t *testing.T) {
	// テスト全体のタイムアウトを設定
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Setup
	testEnv := setupTest(t)
	defer testEnv.close()

	app := testEnv.app.(*AppImpl)
	e := echo.New()

	// 最初のエントリを作成
	form := url.Values{}
	form.Set("title", "Test Entry")
	form.Set("body", "Initial content")
	form.Set("format", "Hatena")
	form.Set("status", "public")

	req1 := httptest.NewRequest(http.MethodPost, "/admin/api/edit", strings.NewReader(form.Encode()))
	req1 = req1.WithContext(ctx)
	req1.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	rec1 := httptest.NewRecorder()
	c1 := e.NewContext(req1, rec1)

	err := app.HandleAdminApiEdit(c1)
	require.NoError(t, err)
	assert.Equal(t, http.StatusOK, rec1.Code)

	var resp1 EditResponse
	err = json.Unmarshal(rec1.Body.Bytes(), &resp1)
	require.NoError(t, err)
	sessionID1 := resp1.SessionID
	assert.NotEmpty(t, sessionID1)

	// 1つ目のprogressセッションが存在することを確認
	_, ok := app.progressSessions.Load(sessionID1)
	assert.True(t, ok, "First progress session should exist")

	// 少し待って、1つ目の処理が完了するようにする
	time.Sleep(200 * time.Millisecond)

	// 2回目のリクエスト（同じエントリを更新）
	form2 := url.Values{}
	form2.Set("id", "1") // 最初に作成されたエントリのIDを仮定
	form2.Set("title", "Test Entry Updated")
	form2.Set("body", "Updated content")
	form2.Set("format", "Hatena")
	form2.Set("status", "public")

	req2 := httptest.NewRequest(http.MethodPost, "/admin/api/edit", strings.NewReader(form2.Encode()))
	req2 = req2.WithContext(ctx)
	req2.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	rec2 := httptest.NewRecorder()
	c2 := e.NewContext(req2, rec2)

	err = app.HandleAdminApiEdit(c2)
	require.NoError(t, err)
	assert.Equal(t, http.StatusOK, rec2.Code)

	var resp2 EditResponse
	err = json.Unmarshal(rec2.Body.Bytes(), &resp2)
	require.NoError(t, err)
	sessionID2 := resp2.SessionID
	assert.NotEmpty(t, sessionID2)
	assert.NotEqual(t, sessionID1, sessionID2, "Session IDs should be different")

	// 2つ目のprogressセッションが存在することを確認
	_, ok = app.progressSessions.Load(sessionID2)
	assert.True(t, ok, "Second progress session should exist immediately after edit request")

	// 少し待って処理を進める
	time.Sleep(200 * time.Millisecond)

	// 両方のprogressセッションが存在することを確認（30秒のグレースピリオド内）
	_, ok1 := app.progressSessions.Load(sessionID1)
	_, ok2 := app.progressSessions.Load(sessionID2)
	assert.True(t, ok1, "First session should still exist (within 30s grace period)")
	assert.True(t, ok2, "Second session should exist")

	// 実際にprogressエンドポイントにアクセスして確認
	// 2つ目のセッションの進捗を取得
	progressReq := httptest.NewRequest(http.MethodGet, "/admin/api/edit/progress?sid="+sessionID2, nil)
	progressCtx, progressCancel := context.WithTimeout(ctx, 1*time.Second)
	defer progressCancel()
	progressReq = progressReq.WithContext(progressCtx)
	progressRec := httptest.NewRecorder()
	progressEchoCtx := e.NewContext(progressReq, progressRec)

	// 非同期でprogressハンドラを呼び出し
	done := make(chan error, 1)
	go func() {
		done <- app.HandleAdminApiEditProgress(progressEchoCtx)
	}()

	// 短いタイムアウトでチェック（処理は既に完了しているはず）
	select {
	case err := <-done:
		// コンテキストキャンセルは許容（SSEが接続維持するため）
		if err != nil && err != context.DeadlineExceeded && err != context.Canceled {
			t.Errorf("HandleAdminApiEditProgress returned unexpected error: %v", err)
		}
	case <-time.After(2 * time.Second):
		progressCancel()
		<-done // goroutine の終了を待つ
	}

	// 404が返されていないことを確認（最重要）
	if progressRec.Code != 0 {
		assert.NotEqual(t, http.StatusNotFound, progressRec.Code,
			"Should not return 404 for second session")
	}
}
