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

func TestFinalizeEntryJob_Invalidation(t *testing.T) {
	application, db := setupTestApp(t)
	ctx := context.Background()

	// 1. テストデータの準備
	entryID := int64(200)
	date := "2026-01-20"
	_ = "tech" // category
	_, err := db.Exec(`
		INSERT INTO entries (id, title, body, formatted_body, path, format, date, created_at, modified_at)
		VALUES (?, '[tech] Test Entry', 'Body', 'Formatted', '2026/01/20/1', 'Markdown', ?, '2026-01-20 10:00:00', '2026-01-20 10:00:00')
	`, entryID, date)
	if err != nil {
		t.Fatal(err)
	}

	// 2. 関連するキャッシュをあらかじめ作成
	cacheKeys := []struct {
		key      string
		sourceID string
	}{
		{"/2026/01/20/", "query:date:2026-01-20"},
		{"/2026/01/", "query:date:2026-01"},
		{"/2026/", "query:date:2026"},
		{"/tech/", "query:category:tech"},
	}

	for _, ck := range cacheKeys {
		err = application.CacheService().Set(ctx, ck.key, []byte("content"), "etag", "text/html", []string{ck.sourceID})
		if err != nil {
			t.Fatalf("Failed to setup cache for %s: %v", ck.key, err)
		}
	}

	// 3. ジョブ実行
	job := NewFinalizeEntryJob(application)
	arg := FinalizeEntryArg{EntryID: entryID}
	argJSON, _ := json.Marshal(arg)
	err = job.Execute(ctx, argJSON)
	if err != nil {
		t.Fatalf("Execute failed: %v", err)
	}

	// 4. キャッシュが削除されているか確認
	for _, ck := range cacheKeys {
		_, err := application.CacheService().Get(ctx, ck.key)
		if err == nil {
			t.Errorf("Cache for %s should have been invalidated but still exists", ck.key)
		}
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
