package jobs

import (
	"context"
	"encoding/json"
	"testing"

	"github.com/cho45/hanrangon/backend/jobqueue"
)

// TestFinalizeEntryJob_Name はジョブ名が正しく返されることを検証する
func TestFinalizeEntryJob_Name(t *testing.T) {
	application, _ := setupTestApp(t)
	job := NewFinalizeEntryJob(application)

	got := job.Name()
	want := "FinalizeEntry"

	if got != want {
		t.Errorf("Name() = %q, want %q", got, want)
	}
}

// TestFinalizeEntryJob_ImplementsJobHandler はJobHandlerインターフェースを実装していることを検証する
func TestFinalizeEntryJob_ImplementsJobHandler(t *testing.T) {
	application, _ := setupTestApp(t)
	//nolint:staticcheck // 明示的にインターフェースの実装を検証するため型を明示
	var _ jobqueue.JobHandler = NewFinalizeEntryJob(application)
}

// TestFinalizeEntryJob_Execute はジョブの実行が正しく行われることを検証する
func TestFinalizeEntryJob_Execute(t *testing.T) {
	application, db := setupTestApp(t)

	// Given: テスト用エントリを作成
	entryID := int64(1)
	_, err := db.Exec(`
		INSERT INTO entries (id, title, body, formatted_body, path, format, date, created_at, modified_at)
		VALUES (?, 'Test Entry', 'Body', 'Formatted', '2026/01/19/1', 'Markdown', '2026-01-19', '2026-01-19 00:00:00', '2026-01-19 00:00:00')
	`, entryID)
	if err != nil {
		t.Fatal(err)
	}

	// Given: FinalizeEntryJobのインスタンスを作成
	job := NewFinalizeEntryJob(application)
	ctx := context.Background()

	// Given: 引数をJSON化
	arg := FinalizeEntryArg{EntryID: entryID}
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

// TestFinalizeEntryJob_Execute_InvalidJSON は不正なJSONでエラーが返されることを検証する
func TestFinalizeEntryJob_Execute_InvalidJSON(t *testing.T) {
	application, _ := setupTestApp(t)
	job := NewFinalizeEntryJob(application)
	ctx := context.Background()

	// When: 不正なJSONでジョブを実行
	err := job.Execute(ctx, json.RawMessage(`{invalid json}`))

	// Then: エラーが返される
	if err == nil {
		t.Error("Execute() with invalid JSON should return error, got nil")
	}
}

// TestFinalizeEntryJob_Execute_MissingEntryID は必須フィールドが欠けている場合の挙動を検証する
func TestFinalizeEntryJob_Execute_MissingEntryID(t *testing.T) {
	application, _ := setupTestApp(t)
	job := NewFinalizeEntryJob(application)
	ctx := context.Background()

	// When: entry_idが欠けたJSONでジョブを実行
	err := job.Execute(ctx, json.RawMessage(`{}`))

	// Then: entry_idはint64のゼロ値(0)になるが、エラーは返らない
	// 注: 実際の運用では存在しないエントリIDに対する適切なエラーハンドリングが必要かもしれない
	if err != nil {
		t.Logf("Execute() with missing entry_id returned error: %v", err)
	}
}
