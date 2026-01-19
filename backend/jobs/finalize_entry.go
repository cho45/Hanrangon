package jobs

import (
	"context"
	"encoding/json"
	"fmt"
	"log"

	"github.com/cho45/hanrangon/backend/app"
)

// FinalizeEntryJob はエントリ更新パイプラインの最終工程を処理するジョブ
type FinalizeEntryJob struct {
	app app.App
}

// FinalizeEntryArg は FinalizeEntryJob の引数
type FinalizeEntryArg struct {
	EntryID int64 `json:"entry_id"`
}

// NewFinalizeEntryJob は新しい FinalizeEntryJob を作成する
func NewFinalizeEntryJob(a app.App) *FinalizeEntryJob {
	return &FinalizeEntryJob{
		app: a,
	}
}

// Name はジョブ名を返す
func (j *FinalizeEntryJob) Name() string {
	return "FinalizeEntry"
}

// Execute はジョブを実行する
func (j *FinalizeEntryJob) Execute(ctx context.Context, arg json.RawMessage) error {
	var params FinalizeEntryArg
	if err := json.Unmarshal(arg, &params); err != nil {
		return fmt.Errorf("failed to unmarshal job arg: %w", err)
	}

	log.Printf("[INFO] FinalizeEntry job started for entry %d", params.EntryID)

	// キャッシュ無効化
	// 1. 該当エントリに依存するページを無効化
	if err := j.app.CacheService().InvalidateBySourceID(ctx, fmt.Sprintf("entry:%d", params.EntryID)); err != nil {
		log.Printf("[WARN] Failed to invalidate cache for entry:%d: %v", params.EntryID, err)
	}

	// 2. 最新エントリリストに依存するページを無効化
	if err := j.app.CacheService().InvalidateBySourceID(ctx, "global:latest"); err != nil {
		log.Printf("[WARN] Failed to invalidate cache for global:latest: %v", err)
	}

	// 3. エントリの内容から、日付アーカイブやカテゴリページも無効化すべきだが、
	// 現在のジョブ引数には ID しかないため、必要であればここでエントリ情報を取得して無効化する。
	// YAGNI 原則に基づき、まずは主要な上記2つを実装。

	log.Printf("[INFO] FinalizeEntry job completed for entry %d", params.EntryID)
	return nil
}
