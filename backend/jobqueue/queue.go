package jobqueue

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"sync"
	"time"

	"github.com/cho45/hanrangon/backend/model"
)

// Worker はジョブキューのワーカーを管理する
type Worker struct {
	db       *sql.DB
	queries  *model.Queries
	registry *Registry
	interval time.Duration
	wg       sync.WaitGroup
}

// NewWorker は新しいWorkerを作成する
func NewWorker(db *sql.DB, queries *model.Queries, registry *Registry) *Worker {
	return &Worker{
		db:       db,
		queries:  queries,
		registry: registry,
		interval: 5 * time.Second, // デフォルト5秒
	}
}

// Start はジョブキューのワーカーを起動する
func (w *Worker) Start(ctx context.Context) {
	w.wg.Add(1)
	go w.run(ctx)
}

// Wait はワーカーの停止を待機する
func (w *Worker) Wait() {
	w.wg.Wait()
}

// Registry はワーカーに紐づくレジストリを返す
func (w *Worker) Registry() *Registry {
	return w.registry
}

// run はポーリングループを実行する
func (w *Worker) run(ctx context.Context) {
	defer w.wg.Done()
	ticker := time.NewTicker(w.interval)
	defer ticker.Stop()

	log.Printf("Job queue worker started (polling interval: %v)", w.interval)

	// ワーカー起動時にスタックジョブを回復
	// 起動時なので短いタイムアウト付きのコンテキストを使用
	recoverCtx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	if err := w.recoverStuckJobs(recoverCtx); err != nil {
		log.Printf("Error recovering stuck jobs on startup: %v", err)
	}
	cancel()

	// 1分ごとにスタックジョブを回復するためのカウンター
	recoveryInterval := 1 * time.Minute
	ticksSinceLastRecovery := 0
	ticksUntilRecovery := int(recoveryInterval / w.interval)

	for {
		select {
		case <-ctx.Done():
			log.Printf("Job queue worker stopping...")
			return
		case <-ticker.C:
			// ジョブ処理
			// processNextJob 自体は context.Background() をベースにしたものを使う
			// ただしDB操作などには ctx を渡して良い（クリーンアップを急ぐなら）
			// ここではジョブ実行のトリガーとして ctx を使い、実行自体は独立させる
			if err := w.processNextJob(ctx); err != nil {
				log.Printf("Error processing job: %v", err)
			}

			// 1分ごとにスタックジョブを回復
			ticksSinceLastRecovery++
			if ticksSinceLastRecovery >= ticksUntilRecovery {
				if err := w.recoverStuckJobs(ctx); err != nil {
					log.Printf("Error recovering stuck jobs: %v", err)
				}
				ticksSinceLastRecovery = 0
			}
		}
	}
}

// processNextJob は次のジョブを1つ処理する
func (w *Worker) processNextJob(ctx context.Context) error {
	// 次のジョブを取得 (これはポーリングなので ctx を使う)
	job, err := w.queries.FindNextJob(ctx, time.Now())
	if err != nil {
		if err == sql.ErrNoRows {
			// ジョブがない場合は何もしない
			return nil
		}
		return fmt.Errorf("failed to find next job: %w", err)
	}

	// これ以降の処理は、たとえ ctx がキャンセルされても完了させたい
	// そのため、独立したコンテキスト（detached context）を使用する
	jobCtx, cancelJob := context.WithTimeout(context.Background(), 10*time.Minute)
	defer cancelJob()

	// ジョブを実行中としてマーク
	err = w.queries.GrabJob(jobCtx, model.GrabJobParams{
		GrabbedAt: sql.NullTime{Time: time.Now(), Valid: true},
		ID:        job.ID,
	})
	if err != nil {
		return fmt.Errorf("failed to grab job %d: %w", job.ID, err)
	}

	// ジョブタイプを取得
	jobType, err := w.queries.GetJobTypeByID(jobCtx, job.JobTypeID)
	if err != nil {
		return fmt.Errorf("failed to get job type %d: %w", job.JobTypeID, err)
	}

	// レジストリからジョブハンドラを取得
	handler, ok := w.registry.Get(jobType.Name)
	if !ok {
		// ジョブハンドラが見つからない場合は失敗としてマーク
		return w.markJobFailed(jobCtx, job, fmt.Errorf("job type %s not registered", jobType.Name))
	}

	// ジョブを実行
	log.Printf("Executing job %d (type: %s)", job.ID, jobType.Name)
	w.wg.Add(1)
	defer w.wg.Done()

	err = w.executeJob(jobCtx, handler, job)
	if err != nil {
		log.Printf("Job %d failed: %v", job.ID, err)
		return w.markJobFailed(jobCtx, job, err)
	}

	// 成功したらジョブを削除
	log.Printf("Job %d completed successfully", job.ID)
	return w.queries.MarkJobCompleted(jobCtx, job.ID)
}

// executeJob はジョブを実行する（パニックをリカバー、タイムアウト付き）
func (w *Worker) executeJob(ctx context.Context, handler JobHandler, job model.Job) (err error) {
	defer func() {
		if r := recover(); r != nil {
			err = fmt.Errorf("job panicked: %v", r)
		}
	}()

	// タイムアウトを取得（デフォルト5分）
	timeout := 5 * time.Minute
	if handlerWithTimeout, ok := handler.(JobHandlerWithTimeout); ok {
		timeout = handlerWithTimeout.Timeout()
	}

	// 引数をパースしてハンドラに渡す。ctx は既に detached なので
	// ここでさらにタイムアウトを設定しても、親のキャンセルには影響されない。
	timeoutCtx, cancel := context.WithTimeout(ctx, timeout)
	defer cancel()

	log.Printf("Job %d executing with timeout %v", job.ID, timeout)

	return handler.Execute(timeoutCtx, json.RawMessage(job.Arg))
}

// markJobFailed はジョブを失敗としてマークする（指数バックオフ付きリトライ）
func (w *Worker) markJobFailed(ctx context.Context, job model.Job, jobErr error) error {
	// 指数バックオフの計算: min(30秒 * 2^retry_count, 1時間)
	baseDelay := 30 * time.Second
	maxDelay := 1 * time.Hour
	backoffDelay := baseDelay * time.Duration(1<<job.RetryCount) // 2^retry_count
	if backoffDelay > maxDelay {
		backoffDelay = maxDelay
	}

	runAfter := time.Now().Add(backoffDelay)
	errorMessage := sql.NullString{String: jobErr.Error(), Valid: true}

	log.Printf("Job %d failed (retry_count=%d), will retry after %v", job.ID, job.RetryCount, backoffDelay)

	return w.queries.MarkJobFailed(ctx, model.MarkJobFailedParams{
		RunAfter:     runAfter,
		ErrorMessage: errorMessage,
		ID:           job.ID,
	})
}

// recoverStuckJobs はスタックしたジョブを回復する
func (w *Worker) recoverStuckJobs(ctx context.Context) error {
	// retry_count < max_retries のスタックジョブをpendingに戻す
	err := w.queries.RecoverStuckJobs(ctx)
	if err != nil {
		return fmt.Errorf("failed to recover stuck jobs: %w", err)
	}

	// retry_count >= max_retries のスタックジョブをfailedにする
	err = w.queries.FailStuckJobs(ctx)
	if err != nil {
		return fmt.Errorf("failed to fail stuck jobs: %w", err)
	}

	return nil
}

// Enqueue はジョブをキューに追加する
func (w *Worker) Enqueue(ctx context.Context, jobTypeName string, arg interface{}, uniqkey string) error {
	// ジョブタイプを取得または作成
	jobType, err := w.queries.GetOrCreateJobType(ctx, jobTypeName)
	if err != nil {
		return fmt.Errorf("failed to get or create job type: %w", err)
	}

	// 引数をJSONにシリアライズ
	argJSON, err := json.Marshal(arg)
	if err != nil {
		return fmt.Errorf("failed to marshal job arg: %w", err)
	}

	// ジョブをエンキュー
	var uniqkeyNull sql.NullString
	if uniqkey != "" {
		uniqkeyNull = sql.NullString{String: uniqkey, Valid: true}
	}

	_, err = w.queries.EnqueueJob(ctx, model.EnqueueJobParams{
		JobTypeID:  jobType.ID,
		Arg:        string(argJSON),
		Uniqkey:    uniqkeyNull,
		MaxRetries: 5,
		CreatedAt:  time.Now(),
		RunAfter:   time.Now(),
	})
	if err != nil {
		return fmt.Errorf("failed to enqueue job: %w", err)
	}

	log.Printf("Enqueued job: type=%s, uniqkey=%s", jobTypeName, uniqkey)
	return nil
}
