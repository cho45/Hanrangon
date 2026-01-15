package jobs

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"time"

	"github.com/cho45/hanrangon/backend/app"
)

// RecalculateTFIDFJob はエントリの TF-IDF 再計算を処理
type RecalculateTFIDFJob struct {
	app app.App
}

// RecalculateTFIDFArg は RecalculateTFIDFJob の引数
type RecalculateTFIDFArg struct {
	EntryID int64 `json:"entry_id"`
}

// NewRecalculateTFIDFJob creates a new RecalculateTFIDFJob
func NewRecalculateTFIDFJob(a app.App) *RecalculateTFIDFJob {
	return &RecalculateTFIDFJob{
		app: a,
	}
}

// Name returns the job name
func (j *RecalculateTFIDFJob) Name() string {
	return "RecalculateTFIDF"
}

// Timeout はこのジョブの最大実行時間を返す。
// TF-IDF の再計算はエントリ数が多い場合に重くなる可能性があるため、10分に設定。
func (j *RecalculateTFIDFJob) Timeout() time.Duration {
	return 10 * time.Minute
}

// Execute executes the TF-IDF recalculation job
func (j *RecalculateTFIDFJob) Execute(ctx context.Context, arg json.RawMessage) error {
	var params RecalculateTFIDFArg
	if err := json.Unmarshal(arg, &params); err != nil {
		return fmt.Errorf("failed to unmarshal job arg: %w", err)
	}

	log.Printf("RecalculateTFIDF job started for entry %d", params.EntryID)

	// Get entry from database
	entry, err := j.app.MainDB().Q.GetEntryById(ctx, params.EntryID)
	if err != nil {
		return fmt.Errorf("failed to get entry: %w", err)
	}

	// ステップ 1: タームを抽出し、DF (Document Frequency) 統計を更新
	if err := j.app.Calculator().UpdateTFIDF(ctx, params.EntryID, entry.Title, entry.Body); err != nil {
		return fmt.Errorf("failed to update tfidf: %w", err)
	}

	// ステップ 2: 全エントリの TF-IDF 値を再計算
	// 注記: IDF (Inverse Document Frequency) は総エントリ数および各タームの出現頻度に依存する
	// グローバルな統計量である。個別の記事更新が全体の重みに影響を与えるため、
	// 統計の整合性を維持するために全件を対象とした再計算を行う。
	if err := j.app.Calculator().RecalculateTFIDFValues(ctx, []int64{}); err != nil {
		return fmt.Errorf("failed to recalculate tfidf values: %w", err)
	}

	// ステップ 3: このエントリに対する類似エントリを計算
	if err := j.app.SimilarityCalculator().CalculateSimilarEntries(ctx, []int64{params.EntryID}); err != nil {
		return fmt.Errorf("failed to calculate similar entries: %w", err)
	}

	log.Printf("RecalculateTFIDF job completed for entry %d", params.EntryID)
	return nil
}
