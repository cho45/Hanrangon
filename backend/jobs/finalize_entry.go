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

	// 現時点では、先行するジョブ（IndexImages, UpdateTrackbacks, RecalculateTFIDF）が
	// 全て完了したことをログに記録するのみ。
	// 将来的に、外部サービスへの通知やキャッシュパージなどをここに追加する。

	log.Printf("[INFO] FinalizeEntry job completed for entry %d", params.EntryID)
	return nil
}
