package jobs

import (
	"context"
	"encoding/json"
	"testing"
	"time"

	"github.com/cho45/hanrangon/backend/jobqueue"
)

// TestRecalculateTFIDFJob_Name はジョブ名が正しく返されることを検証する
func TestRecalculateTFIDFJob_Name(t *testing.T) {
	application, _ := setupTestApp(t)
	job := NewRecalculateTFIDFJob(application)

	got := job.Name()
	want := "RecalculateTFIDF"

	if got != want {
		t.Errorf("Name() = %q, want %q", got, want)
	}
}

// TestRecalculateTFIDFJob_ImplementsJobHandler はJobHandlerインターフェースを実装していることを検証する
func TestRecalculateTFIDFJob_ImplementsJobHandler(t *testing.T) {
	application, _ := setupTestApp(t)
	//nolint:staticcheck // 明示的にインターフェースの実装を検証するため型を明示
	var _ jobqueue.JobHandler = NewRecalculateTFIDFJob(application)
}

// TestRecalculateTFIDFJob_ImplementsJobHandlerWithTimeout はJobHandlerWithTimeoutインターフェースを実装していることを検証する
func TestRecalculateTFIDFJob_ImplementsJobHandlerWithTimeout(t *testing.T) {
	application, _ := setupTestApp(t)
	//nolint:staticcheck // 明示的にインターフェースの実装を検証するため型を明示
	var _ jobqueue.JobHandlerWithTimeout = NewRecalculateTFIDFJob(application)
}

// TestRecalculateTFIDFJob_Timeout はタイムアウトが正しく設定されることを検証する
func TestRecalculateTFIDFJob_Timeout(t *testing.T) {
	application, _ := setupTestApp(t)
	job := NewRecalculateTFIDFJob(application)

	got := job.Timeout()
	want := 10 * time.Minute

	if got != want {
		t.Errorf("Timeout() = %v, want %v", got, want)
	}
}

// TestRecalculateTFIDFJob_Execute はジョブの実行が正しく行われることを検証する
func TestRecalculateTFIDFJob_Execute(t *testing.T) {
	application, db := setupTestApp(t)

	// Given: テスト用エントリを作成
	entryID := int64(1)
	_, err := db.Exec(`
		INSERT INTO entries (id, title, body, formatted_body, path, format, date, created_at, modified_at)
		VALUES (?, 'Test Entry', 'This is a test body with some keywords', 'Formatted', '2026/01/19/1', 'Markdown', '2026-01-19', '2026-01-19 00:00:00', '2026-01-19 00:00:00')
	`, entryID)
	if err != nil {
		t.Fatal(err)
	}

	// Given: RecalculateTFIDFJobのインスタンスを作成
	job := NewRecalculateTFIDFJob(application)
	ctx := context.Background()

	// Given: 引数をJSON化
	arg := RecalculateTFIDFArg{EntryID: entryID}
	argJSON, err := json.Marshal(arg)
	if err != nil {
		t.Fatalf("failed to marshal arg: %v", err)
	}

	// When: ジョブを実行
	err = job.Execute(ctx, argJSON)

	// Then: エラーが返されない
	if err != nil {
		t.Errorf("Execute() error = %v, want nil", err)
	}
}

// TestRecalculateTFIDFJob_Execute_InvalidJSON は不正なJSONでエラーが返されることを検証する
func TestRecalculateTFIDFJob_Execute_InvalidJSON(t *testing.T) {
	application, _ := setupTestApp(t)
	job := NewRecalculateTFIDFJob(application)
	ctx := context.Background()

	// When: 不正なJSONでジョブを実行
	err := job.Execute(ctx, json.RawMessage(`{invalid json}`))

	// Then: エラーが返される
	if err == nil {
		t.Error("Execute() with invalid JSON should return error, got nil")
	}
}

// TestRecalculateTFIDFJob_Execute_NonExistentEntry は存在しないエントリIDでエラーが返されることを検証する
func TestRecalculateTFIDFJob_Execute_NonExistentEntry(t *testing.T) {
	application, _ := setupTestApp(t)
	job := NewRecalculateTFIDFJob(application)
	ctx := context.Background()

	// Given: 存在しないエントリIDの引数
	arg := RecalculateTFIDFArg{EntryID: 99999}
	argJSON, err := json.Marshal(arg)
	if err != nil {
		t.Fatalf("failed to marshal arg: %v", err)
	}

	// When: 存在しないエントリIDでジョブを実行
	err = job.Execute(ctx, argJSON)

	// Then: エラーが返される
	if err == nil {
		t.Error("Execute() with non-existent entry should return error, got nil")
	}
}
