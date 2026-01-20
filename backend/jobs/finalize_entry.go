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

	// キャッシュ無効化のためにエントリ情報を取得
	entry, err := j.app.MainDB().Q.GetEntryById(ctx, params.EntryID)
	if err != nil {
		return fmt.Errorf("failed to fetch entry %d for cache invalidation: %w", params.EntryID, err)
	}

	// キャッシュ無効化
	// 1. 該当エントリに依存するページを無効化
	if err := j.app.CacheService().InvalidateBySourceID(ctx, fmt.Sprintf("entry:%d", params.EntryID)); err != nil {
		log.Printf("[WARN] Failed to invalidate cache for entry:%d: %v", params.EntryID, err)
	}

	// 2. 最新エントリリストに依存するページを無効化
	if err := j.app.CacheService().InvalidateBySourceID(ctx, "global:latest"); err != nil {
		log.Printf("[WARN] Failed to invalidate cache for global:latest: %v", err)
	}

	// 3. 日付アーカイブの無効化
	// date は "YYYY-MM-DD" 形式
	if len(entry.Date) >= 10 {
		yyyy := entry.Date[:4]
		mm := entry.Date[5:7]
		dd := entry.Date[8:10]

		// 日単位
		if err := j.app.CacheService().InvalidateBySourceID(ctx, fmt.Sprintf("query:date:%s-%s-%s", yyyy, mm, dd)); err != nil {
			log.Printf("[WARN] Failed to invalidate cache for date:%s-%s-%s: %v", yyyy, mm, dd, err)
		}
		// 月単位
		if err := j.app.CacheService().InvalidateBySourceID(ctx, fmt.Sprintf("query:date:%s-%s", yyyy, mm)); err != nil {
			log.Printf("[WARN] Failed to invalidate cache for date:%s-%s: %v", yyyy, mm, err)
		}
		// 年単位
		if err := j.app.CacheService().InvalidateBySourceID(ctx, fmt.Sprintf("query:date:%s", yyyy)); err != nil {
			log.Printf("[WARN] Failed to invalidate cache for date:%s: %v", yyyy, err)
		}
	}

	// 4. カテゴリページの無効化
	for _, cat := range entry.Tags() {
		if err := j.app.CacheService().InvalidateBySourceID(ctx, fmt.Sprintf("query:category:%s", cat)); err != nil {
			log.Printf("[WARN] Failed to invalidate cache for category:%s: %v", cat, err)
		}
	}

	log.Printf("[INFO] FinalizeEntry job completed for entry %d", params.EntryID)
	return nil
}
