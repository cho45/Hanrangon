package app

import (
	"context"
	"database/sql"
	"fmt"
	"os"
	"path/filepath"
	"testing"

	"github.com/cho45/hanrangon/backend/model"
	"github.com/cho45/hanrangon/backend/model/cachedb"
	_ "github.com/mattn/go-sqlite3"
)

func setupCacheDB(t *testing.T) (*sql.DB, *model.Database[cachedb.Querier]) {
	t.Helper()

	tmpDir := t.TempDir()
	dbPath := filepath.Join(tmpDir, "cache_test.db")

	db, err := sql.Open("sqlite3", dbPath)
	if err != nil {
		t.Fatalf("Failed to open cache DB: %v", err)
	}

	// スキーマを読み込んで適用
	schemaPath := filepath.Join("..", "db", "schema", "cache.sql")
	schema, err := os.ReadFile(schemaPath)
	if err != nil {
		t.Fatalf("Failed to read schema: %v", err)
	}

	if _, err := db.Exec(string(schema)); err != nil {
		t.Fatalf("Failed to execute schema: %v", err)
	}

	wrapper := model.NewDatabase[cachedb.Querier](db, func(tx model.DBTX) cachedb.Querier { return cachedb.New(tx) })
	return db, wrapper
}

func TestCacheService_SetAndGet(t *testing.T) {
	db, wrapper := setupCacheDB(t)
	defer db.Close()

	service := NewCacheService(wrapper)
	ctx := context.Background()

	// キャッシュ保存 + 依存関係登録
	key := "/test/page"
	content := []byte("test content")
	etag := "etag"
	contentType := "text/plain"
	sourceIDs := []string{"entry:123", "entry:456"}

	if err := service.Set(ctx, key, content, etag, contentType, sourceIDs); err != nil {
		t.Fatalf("Set failed: %v", err)
	}

	// キャッシュ取得
	got, err := service.Get(ctx, key)
	if err != nil {
		t.Fatalf("Get failed: %v", err)
	}

	if string(got.Content) != string(content) {
		t.Errorf("Get() = %q, want %q", got.Content, content)
	}
	if got.Etag != etag {
		t.Errorf("Get() etag = %q, want %q", got.Etag, etag)
	}
	if got.ContentType != contentType {
		t.Errorf("Get() contentType = %q, want %q", got.ContentType, contentType)
	}
}

func TestCacheService_InvalidateByKey(t *testing.T) {
	db, wrapper := setupCacheDB(t)
	defer db.Close()

	service := NewCacheService(wrapper)
	ctx := context.Background()

	// キャッシュ保存
	key := "/test/page"
	content := []byte("test content")
	sourceIDs := []string{"entry:123"}

	if err := service.Set(ctx, key, content, "etag", "text/plain", sourceIDs); err != nil {
		t.Fatalf("Set failed: %v", err)
	}

	// キーで無効化
	if err := service.InvalidateByKey(ctx, key); err != nil {
		t.Fatalf("InvalidateByKey failed: %v", err)
	}

	// 取得できないことを確認
	_, err := service.Get(ctx, key)
	if err == nil || err != sql.ErrNoRows {
		t.Errorf("Get() after invalidation should return sql.ErrNoRows, got: %v", err)
	}
}

func TestCacheService_InvalidateBySourceID(t *testing.T) {
	db, wrapper := setupCacheDB(t)
	defer db.Close()

	service := NewCacheService(wrapper)
	ctx := context.Background()

	// 複数のキャッシュを保存、同じ source_id を持つ
	key1 := "/test/page1"
	key2 := "/test/page2"
	key3 := "/test/page3"
	content := []byte("test content")

	if err := service.Set(ctx, key1, content, "etag", "text/plain", []string{"entry:123", "entry:456"}); err != nil {
		t.Fatalf("Set key1 failed: %v", err)
	}

	if err := service.Set(ctx, key2, content, "etag", "text/plain", []string{"entry:123"}); err != nil {
		t.Fatalf("Set key2 failed: %v", err)
	}

	if err := service.Set(ctx, key3, content, "etag", "text/plain", []string{"entry:789"}); err != nil {
		t.Fatalf("Set key3 failed: %v", err)
	}

	// entry:123 で無効化 → key1, key2 が削除される
	if err := service.InvalidateBySourceID(ctx, "entry:123"); err != nil {
		t.Fatalf("InvalidateBySourceID failed: %v", err)
	}

	// key1, key2 は削除されている
	if _, err := service.Get(ctx, key1); err != sql.ErrNoRows {
		t.Errorf("key1 should be deleted, got: %v", err)
	}

	if _, err := service.Get(ctx, key2); err != sql.ErrNoRows {
		t.Errorf("key2 should be deleted, got: %v", err)
	}

	// key3 はまだ存在している
	if _, err := service.Get(ctx, key3); err != nil {
		t.Errorf("key3 should still exist, got: %v", err)
	}
}

func TestCacheService_TriggerCascade(t *testing.T) {
	db, wrapper := setupCacheDB(t)
	defer db.Close()

	service := NewCacheService(wrapper)
	ctx := context.Background()

	// キャッシュ保存
	key := "/test/page"
	content := []byte("test content")
	sourceIDs := []string{"entry:123"}

	if err := service.Set(ctx, key, content, "etag", "text/plain", sourceIDs); err != nil {
		t.Fatalf("Set failed: %v", err)
	}

	// cache_relation を削除 → TRIGGER で cache も削除される
	if err := service.InvalidateBySourceID(ctx, "entry:123"); err != nil {
		t.Fatalf("InvalidateBySourceID failed: %v", err)
	}

	// cache が削除されていることを確認
	_, err := wrapper.Q.GetCache(ctx, key)
	if err != sql.ErrNoRows {
		t.Errorf("cache should be deleted by TRIGGER, got: %v", err)
	}
}

func TestCacheService_MultipleSourceIDs(t *testing.T) {
	db, wrapper := setupCacheDB(t)
	defer db.Close()

	service := NewCacheService(wrapper)
	ctx := context.Background()

	// 複数の source_id を持つキャッシュ
	key := "/"
	content := []byte("index page")
	sourceIDs := []string{"global:latest", "entry:1", "entry:2", "entry:3"}

	if err := service.Set(ctx, key, content, "etag", "text/plain", sourceIDs); err != nil {
		t.Fatalf("Set failed: %v", err)
	}

	// entry:2 を無効化 → キャッシュ全体が削除される
	if err := service.InvalidateBySourceID(ctx, "entry:2"); err != nil {
		t.Fatalf("InvalidateBySourceID failed: %v", err)
	}

	// キャッシュが削除されている
	_, err := service.Get(ctx, key)
	if err != sql.ErrNoRows {
		t.Errorf("cache should be deleted, got: %v", err)
	}
}

func TestCacheService_OverwriteCache(t *testing.T) {
	db, wrapper := setupCacheDB(t)
	defer db.Close()

	service := NewCacheService(wrapper)
	ctx := context.Background()

	key := "/test/page"

	// 最初の保存
	content1 := []byte("content v1")
	sourceIDs1 := []string{"entry:1", "entry:2"}
	if err := service.Set(ctx, key, content1, "etag1", "text/plain", sourceIDs1); err != nil {
		t.Fatalf("Set v1 failed: %v", err)
	}

	// 上書き保存 (異なるcontent, 異なるsourceIDs)
	content2 := []byte("content v2")
	sourceIDs2 := []string{"entry:3", "entry:4"}
	if err := service.Set(ctx, key, content2, "etag2", "text/plain", sourceIDs2); err != nil {
		t.Fatalf("Set v2 failed: %v", err)
	}

	// content が更新されている
	got, err := service.Get(ctx, key)
	if err != nil {
		t.Fatalf("Get failed: %v", err)
	}
	if string(got.Content) != string(content2) {
		t.Errorf("Get() = %q, want %q", got.Content, content2)
	}

	// 古い依存関係 (entry:1) では無効化されない
	if err := service.InvalidateBySourceID(ctx, "entry:1"); err != nil {
		t.Fatalf("InvalidateBySourceID entry:1 failed: %v", err)
	}

	if _, err := service.Get(ctx, key); err != nil {
		t.Errorf("cache should still exist after invalidating old sourceID, got: %v", err)
	}

	// 新しい依存関係 (entry:3) では無効化される
	if err := service.InvalidateBySourceID(ctx, "entry:3"); err != nil {
		t.Fatalf("InvalidateBySourceID entry:3 failed: %v", err)
	}

	if _, err := service.Get(ctx, key); err != sql.ErrNoRows {
		t.Errorf("cache should be deleted after invalidating new sourceID, got: %v", err)
	}
}

func TestCacheService_InvalidateNonExistent(t *testing.T) {
	db, wrapper := setupCacheDB(t)
	defer db.Close()

	service := NewCacheService(wrapper)
	ctx := context.Background()

	// 存在しないキーの無効化 - エラーにならない
	if err := service.InvalidateByKey(ctx, "/non-existent"); err != nil {
		t.Errorf("InvalidateByKey should not error for non-existent key, got: %v", err)
	}

	// 存在しない source_id の無効化 - エラーにならない
	if err := service.InvalidateBySourceID(ctx, "entry:99999"); err != nil {
		t.Errorf("InvalidateBySourceID should not error for non-existent sourceID, got: %v", err)
	}
}

func TestCacheService_EmptySourceIDs(t *testing.T) {
	db, wrapper := setupCacheDB(t)
	defer db.Close()

	service := NewCacheService(wrapper)
	ctx := context.Background()

	key := "/test/page"
	content := []byte("test content")

	// 空の sourceIDs で保存
	if err := service.Set(ctx, key, content, "etag", "text/plain", []string{}); err != nil {
		t.Fatalf("Set with empty sourceIDs failed: %v", err)
	}

	// 取得できる
	got, err := service.Get(ctx, key)
	if err != nil {
		t.Fatalf("Get failed: %v", err)
	}
	if string(got.Content) != string(content) {
		t.Errorf("Get() = %q, want %q", got.Content, content)
	}

	// どの source_id でも無効化されない
	if err := service.InvalidateBySourceID(ctx, "entry:123"); err != nil {
		t.Fatalf("InvalidateBySourceID failed: %v", err)
	}

	// まだ存在している
	if _, err := service.Get(ctx, key); err != nil {
		t.Errorf("cache should still exist, got: %v", err)
	}

	// キー指定で削除できる
	if err := service.InvalidateByKey(ctx, key); err != nil {
		t.Fatalf("InvalidateByKey failed: %v", err)
	}

	if _, err := service.Get(ctx, key); err != sql.ErrNoRows {
		t.Errorf("cache should be deleted, got: %v", err)
	}
}

func TestCacheService_EmptyContent(t *testing.T) {
	db, wrapper := setupCacheDB(t)
	defer db.Close()

	service := NewCacheService(wrapper)
	ctx := context.Background()

	key := "/test/empty"
	content := []byte("")
	sourceIDs := []string{"entry:1"}

	// 空のcontent
	if err := service.Set(ctx, key, content, "etag", "text/plain", sourceIDs); err != nil {
		t.Fatalf("Set with empty content failed: %v", err)
	}

	// 取得できる
	got, err := service.Get(ctx, key)
	if err != nil {
		t.Fatalf("Get failed: %v", err)
	}
	if len(got.Content) != 0 {
		t.Errorf("Get() should return empty content, got: %q", got.Content)
	}
}

func TestCacheService_ConcurrentWrite(t *testing.T) {
	db, wrapper := setupCacheDB(t)
	defer db.Close()

	service := NewCacheService(wrapper)
	ctx := context.Background()

	key := "/test/concurrent"
	iterations := 100

	// 100 goroutine で同時書き込み
	done := make(chan bool, iterations)
	for i := 0; i < iterations; i++ {
		go func(n int) {
			content := []byte(fmt.Sprintf("content-%d", n))
			sourceIDs := []string{fmt.Sprintf("entry:%d", n)}
			if err := service.Set(ctx, key, content, "etag", "text/plain", sourceIDs); err != nil {
				t.Errorf("Set failed: %v", err)
			}
			done <- true
		}(i)
	}

	// 全goroutine完了を待つ
	for i := 0; i < iterations; i++ {
		<-done
	}

	// 最終的にキャッシュが存在する
	got, err := service.Get(ctx, key)
	if err != nil {
		t.Fatalf("Get failed: %v", err)
	}

	// どれかの content が保存されている
	if len(got.Content) == 0 {
		t.Errorf("content should not be empty")
	}
}

func TestCacheService_NilSourceIDs(t *testing.T) {
	db, wrapper := setupCacheDB(t)
	defer db.Close()

	service := NewCacheService(wrapper)
	ctx := context.Background()

	key := "/test/nil"
	content := []byte("test")

	// nil sourceIDs
	if err := service.Set(ctx, key, content, "etag", "text/plain", nil); err != nil {
		t.Fatalf("Set with nil sourceIDs failed: %v", err)
	}

	// 取得できる
	if _, err := service.Get(ctx, key); err != nil {
		t.Fatalf("Get failed: %v", err)
	}
}

func TestCacheService_IndexPageScenario(t *testing.T) {
	db, wrapper := setupCacheDB(t)
	defer db.Close()

	service := NewCacheService(wrapper)
	ctx := context.Background()

	// シナリオ: Indexページは最新5件のエントリを表示

	// 初期状態: エントリ1, 2, 3, 4, 5 が存在
	// Indexページをキャッシュ
	indexKey := "/"
	indexContent1 := []byte("<html>Entry 5, 4, 3, 2, 1</html>")
	indexSourceIDs1 := []string{
		"global:latest", // created_at の最大値に依存
		"entry:5",       // 表示されているエントリ
		"entry:4",
		"entry:3",
		"entry:2",
		"entry:1",
	}

	if err := service.Set(ctx, indexKey, indexContent1, "etag", "text/plain", indexSourceIDs1); err != nil {
		t.Fatalf("Set index cache failed: %v", err)
	}

	// キャッシュヒット確認
	got, err := service.Get(ctx, indexKey)
	if err != nil {
		t.Fatalf("Get index cache failed: %v", err)
	}
	if string(got.Content) != string(indexContent1) {
		t.Errorf("Get() = %q, want %q", got.Content, indexContent1)
	}

	// ケース1: 既存エントリ3を更新 → Indexページのキャッシュが無効化される
	if err := service.InvalidateBySourceID(ctx, "entry:3"); err != nil {
		t.Fatalf("InvalidateBySourceID entry:3 failed: %v", err)
	}

	// Indexページが削除されている
	_, err = service.Get(ctx, indexKey)
	if err != sql.ErrNoRows {
		t.Errorf("index cache should be deleted after entry:3 update, got: %v", err)
	}

	// 再度キャッシュ (エントリ3の内容が更新されている)
	indexContent2 := []byte("<html>Entry 5, 4, 3(updated), 2, 1</html>")
	if err := service.Set(ctx, indexKey, indexContent2, "etag", "text/plain", indexSourceIDs1); err != nil {
		t.Fatalf("Set index cache again failed: %v", err)
	}

	// ケース2: 新規エントリ6が作成される → global:latest で無効化
	if err := service.InvalidateBySourceID(ctx, "global:latest"); err != nil {
		t.Fatalf("InvalidateBySourceID global:latest failed: %v", err)
	}

	// Indexページが削除されている
	_, err = service.Get(ctx, indexKey)
	if err != sql.ErrNoRows {
		t.Errorf("index cache should be deleted after new entry, got: %v", err)
	}

	// 新しいIndexページをキャッシュ (エントリ6, 5, 4, 3, 2 を表示、エントリ1は範囲外)
	indexContent3 := []byte("<html>Entry 6, 5, 4, 3, 2</html>")
	indexSourceIDs2 := []string{
		"global:latest",
		"entry:6", // 新規エントリ
		"entry:5",
		"entry:4",
		"entry:3",
		"entry:2",
		// entry:1 は表示されなくなった
	}

	if err := service.Set(ctx, indexKey, indexContent3, "etag", "text/plain", indexSourceIDs2); err != nil {
		t.Fatalf("Set index cache with new entry failed: %v", err)
	}

	// ケース3: 範囲外のエントリ1を更新 → Indexページは無効化されない
	if err := service.InvalidateBySourceID(ctx, "entry:1"); err != nil {
		t.Fatalf("InvalidateBySourceID entry:1 failed: %v", err)
	}

	// Indexページはまだ存在している (entry:1 は依存関係にない)
	got, err = service.Get(ctx, indexKey)
	if err != nil {
		t.Errorf("index cache should still exist after entry:1 update, got: %v", err)
	}
	if string(got.Content) != string(indexContent3) {
		t.Errorf("Get() = %q, want %q", got.Content, indexContent3)
	}

	// ケース4: 表示中のエントリ4を更新 → Indexページが無効化される
	if err := service.InvalidateBySourceID(ctx, "entry:4"); err != nil {
		t.Fatalf("InvalidateBySourceID entry:4 failed: %v", err)
	}

	// Indexページが削除されている
	_, err = service.Get(ctx, indexKey)
	if err != sql.ErrNoRows {
		t.Errorf("index cache should be deleted after entry:4 update, got: %v", err)
	}
}

func TestCacheService_CheckAndTruncateCache(t *testing.T) {
	db, wrapper := setupCacheDB(t)
	defer db.Close()

	service := NewCacheService(wrapper)
	ctx := context.Background()

	// 1. 初期状態: AppHash を保存 (初期化)
	initialHash := "hash-v1"
	if err := service.CheckAndTruncateCache(ctx, initialHash); err != nil {
		t.Fatalf("CheckAndTruncateCache v1 failed: %v", err)
	}

	// キャッシュを作成
	key := "/test/page"
	if err := service.Set(ctx, key, []byte("content"), "etag", "text/plain", nil); err != nil {
		t.Fatalf("Set failed: %v", err)
	}

	// キャッシュが存在することを確認
	if _, err := service.Get(ctx, key); err != nil {
		t.Fatalf("Cache should exist: %v", err)
	}

	// 2. 同じ AppHash でチェック -> 何も起きない
	if err := service.CheckAndTruncateCache(ctx, initialHash); err != nil {
		t.Fatalf("CheckAndTruncateCache v1 again failed: %v", err)
	}
	if _, err := service.Get(ctx, key); err != nil {
		t.Fatalf("Cache should still exist: %v", err)
	}

	// 3. 異なる AppHash でチェック -> キャッシュ全削除
	newHash := "hash-v2"
	if err := service.CheckAndTruncateCache(ctx, newHash); err != nil {
		t.Fatalf("CheckAndTruncateCache v2 failed: %v", err)
	}

	// キャッシュが削除されていることを確認
	if _, err := service.Get(ctx, key); err != sql.ErrNoRows {
		t.Errorf("Cache should be deleted after AppHash change, got: %v", err)
	}

	// AppHash が更新されていることを確認
	storedHash, err := wrapper.Q.GetMetadata(ctx, "app_hash")
	if err != nil {
		t.Fatalf("GetMetadata failed: %v", err)
	}
	if storedHash != newHash {
		t.Errorf("AppHash should be updated to %q, got %q", newHash, storedHash)
	}
}

func TestCacheService_MultiplePagesDependOnSameEntry(t *testing.T) {
	db, wrapper := setupCacheDB(t)
	defer db.Close()

	service := NewCacheService(wrapper)
	ctx := context.Background()

	// エントリ123が複数のページで表示されている
	// 1. エントリページ
	entryPageKey := "/2006/08/01/1"
	entryPageContent := []byte("<html>Entry 123 detail</html>")
	entryPageSourceIDs := []string{"entry:123", "entry:456", "entry:789"} // 本体 + 関連エントリ

	if err := service.Set(ctx, entryPageKey, entryPageContent, "etag", "text/plain", entryPageSourceIDs); err != nil {
		t.Fatalf("Set entry page failed: %v", err)
	}

	// 2. Indexページ
	indexKey := "/"
	indexContent := []byte("<html>Latest: 125, 124, 123, 122, 121</html>")
	indexSourceIDs := []string{"global:latest", "entry:125", "entry:124", "entry:123", "entry:122", "entry:121"}

	if err := service.Set(ctx, indexKey, indexContent, "etag", "text/plain", indexSourceIDs); err != nil {
		t.Fatalf("Set index page failed: %v", err)
	}

	// 3. 日付アーカイブページ
	archiveKey := "/2006/08/"
	archiveContent := []byte("<html>August 2006: 130, 125, 123, 120</html>")
	archiveSourceIDs := []string{"query:date:2006-08", "entry:130", "entry:125", "entry:123", "entry:120"}

	if err := service.Set(ctx, archiveKey, archiveContent, "etag", "text/plain", archiveSourceIDs); err != nil {
		t.Fatalf("Set archive page failed: %v", err)
	}

	// すべてのページがキャッシュされている
	if _, err := service.Get(ctx, entryPageKey); err != nil {
		t.Errorf("entry page should be cached, got: %v", err)
	}
	if _, err := service.Get(ctx, indexKey); err != nil {
		t.Errorf("index page should be cached, got: %v", err)
	}
	if _, err := service.Get(ctx, archiveKey); err != nil {
		t.Errorf("archive page should be cached, got: %v", err)
	}

	// エントリ123を更新 → 3つのページすべてが無効化される
	if err := service.InvalidateBySourceID(ctx, "entry:123"); err != nil {
		t.Fatalf("InvalidateBySourceID entry:123 failed: %v", err)
	}

	// すべてのページが削除されている
	if _, err := service.Get(ctx, entryPageKey); err != sql.ErrNoRows {
		t.Errorf("entry page should be deleted, got: %v", err)
	}
	if _, err := service.Get(ctx, indexKey); err != sql.ErrNoRows {
		t.Errorf("index page should be deleted, got: %v", err)
	}
	if _, err := service.Get(ctx, archiveKey); err != sql.ErrNoRows {
		t.Errorf("archive page should be deleted, got: %v", err)
	}
}
