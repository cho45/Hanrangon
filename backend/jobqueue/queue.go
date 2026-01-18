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
	workerdb "github.com/cho45/hanrangon/backend/model/workerdb"
)

// Worker はジョブキューのワーカーを管理する
type Worker struct {
	db       *model.Database[workerdb.Querier]
	queries  workerdb.Querier
	registry *Registry
	interval time.Duration
	wg       sync.WaitGroup
}

// NewWorker は新しいWorkerを作成する
func NewWorker(db *model.Database[workerdb.Querier], queries workerdb.Querier, registry *Registry) *Worker {
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

	log.Printf("[DEBUG] Job queue worker started (polling interval: %v)", w.interval)

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

			// 1分ごとにスタックジョブを回復とクリーンアップ
			ticksSinceLastRecovery++
			if ticksSinceLastRecovery >= ticksUntilRecovery {
				if err := w.recoverStuckJobs(ctx); err != nil {
					log.Printf("Error recovering stuck jobs: %v", err)
				}
				if err := w.CleanupCompletedJobs(ctx); err != nil {
					log.Printf("Error cleaning up completed jobs: %v", err)
				}
				ticksSinceLastRecovery = 0
			}
		}
	}
}

// processNextJob は次のジョブを1つ処理する
func (w *Worker) processNextJob(ctx context.Context) error {
	// contextがキャンセルされている場合は即座に終了
	select {
	case <-ctx.Done():
		return nil
	default:
	}

	// 次のジョブを取得 (これはポーリングなので ctx を使う)
	job, err := w.queries.FindNextJob(ctx, time.Now())
	if err != nil {
		if err == sql.ErrNoRows {
			// ジョブがない場合は何もしない
			return nil
		}
		// contextキャンセルによるエラーは無視
		if ctx.Err() != nil {
			return nil
		}
		log.Printf("[ERROR] FindNextJob failed: %v", err)
		return fmt.Errorf("failed to find next job: %w", err)
	}

	// 親の ctx がキャンセル（プロセスの停止信号など）されても、
	// 開始したジョブの状態更新（成功/失敗の記録）を確実に行うため、
	// 独立したコンテキスト（detached context）を使用する。
	jobCtx, cancelJob := context.WithTimeout(context.Background(), 10*time.Minute)
	defer cancelJob()

	// ジョブを実行中としてマーク
	now := time.Now()
	res, err := w.queries.GrabJob(jobCtx, workerdb.GrabJobParams{
		GrabbedAt: sql.NullTime{Time: now, Valid: true},
		ID:        job.ID,
	})
	if err != nil {
		return fmt.Errorf("failed to grab job %d: %w", job.ID, err)
	}

	rows, err := res.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected for job %d: %w", job.ID, err)
	}
	if rows == 0 {
		// 他のワーカーが既に取得したか、状態が変わった
		return nil
	}

	// 依存関係のチェック (GrabJob の後に行うことで TOCTOU を防ぐ)
	if job.DependsOn.Valid && job.DependsOn.String != "" {
		dependsOn, err := ParseDependsOn(job.DependsOn.String)
		if err != nil {
			log.Printf("Error parsing depends_on for job %d: %v", job.ID, err)
			return w.markJobFailed(jobCtx, job, fmt.Errorf("failed to parse depends_on: %w", err))
		}

		if len(dependsOn.Dependencies) > 0 {
			parentIDs := make([]int64, len(dependsOn.Dependencies))
			for i, dep := range dependsOn.Dependencies {
				parentIDs[i] = dep.ID
			}

			parents, err := w.queries.GetJobsByIDs(jobCtx, parentIDs)
			if err != nil {
				return fmt.Errorf("failed to get parent jobs for job %d: %w", job.ID, err)
			}

			parentMap := make(map[int64]workerdb.Job)
			for _, p := range parents {
				parentMap[p.ID] = p
			}

			// 自己依存のチェック（無限ループ防止）
			for _, dep := range dependsOn.Dependencies {
				if dep.ID == job.ID {
					log.Printf("Job %d has self-dependency, marking as failed", job.ID)
					return w.queries.MarkJobPermanentlyFailed(jobCtx, workerdb.MarkJobPermanentlyFailedParams{
						ID:           job.ID,
						ErrorMessage: sql.NullString{String: "self-dependency detected", Valid: true},
						FinishedAt:   sql.NullTime{Time: time.Now(), Valid: true},
					})
				}
			}

			result := dependsOn.Evaluate(parentMap)
			switch result {
			case EvaluateWait:
				// 待機が必要な場合は status を pending に戻し、run_after を更新して後回しにする
				waitInterval := 30 * time.Second
				runAfter := time.Now().Add(waitInterval)
				log.Printf("Job %d is waiting for dependencies, rescheduling to %v", job.ID, runAfter)
				return w.queries.MarkJobFailed(jobCtx, workerdb.MarkJobFailedParams{
					ID:           job.ID,
					RunAfter:     runAfter,
					ErrorMessage: sql.NullString{String: "waiting for dependencies", Valid: true},
				})
			case EvaluateFail:
				// 親の失敗により実行不可。即座に failed にする
				log.Printf("[DEBUG] Job %d failed due to dependency failure, calling MarkJobPermanentlyFailed", job.ID)
				err := w.queries.MarkJobPermanentlyFailed(jobCtx, workerdb.MarkJobPermanentlyFailedParams{
					ID:           job.ID,
					ErrorMessage: sql.NullString{String: "dependency failed", Valid: true},
					FinishedAt:   sql.NullTime{Time: time.Now(), Valid: true},
				})
				if err != nil {
					log.Printf("[ERROR] MarkJobPermanentlyFailed failed: %v", err)
				}
				log.Printf("[DEBUG] MarkJobPermanentlyFailed returned")
				return err
			case EvaluateReady:
				// 実行可能。そのまま進む
			}
		}
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
	return w.queries.MarkJobCompleted(jobCtx, workerdb.MarkJobCompletedParams{
		ID:         job.ID,
		FinishedAt: sql.NullTime{Time: time.Now(), Valid: true},
	})
}

// executeJob はジョブを実行する（パニックをリカバー、タイムアウト付き）
func (w *Worker) executeJob(ctx context.Context, handler JobHandler, job workerdb.Job) (err error) {
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
func (w *Worker) markJobFailed(ctx context.Context, job workerdb.Job, jobErr error) error {
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

	return w.queries.MarkJobFailed(ctx, workerdb.MarkJobFailedParams{
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

// CleanupCompletedJobs は完了したジョブをクリーンアップする
func (w *Worker) CleanupCompletedJobs(ctx context.Context) error {
	// 1日以上経過した完了ジョブを削除
	threshold := time.Now().Add(-24 * time.Hour)
	err := w.queries.CleanupJobs(ctx, sql.NullTime{Time: threshold, Valid: true})
	if err != nil {
		return fmt.Errorf("failed to cleanup completed jobs: %w", err)
	}
	return nil
}

// Enqueue はジョブをキューに追加する
func (w *Worker) Enqueue(ctx context.Context, jobTypeName string, arg interface{}, uniqkey string) (workerdb.Job, error) {
	return w.EnqueueWithDepends(ctx, jobTypeName, arg, uniqkey, nil)
}

// EnqueueWithDepends は依存関係を指定してジョブをキューに追加する
func (w *Worker) EnqueueWithDepends(ctx context.Context, jobTypeName string, arg interface{}, uniqkey string, dependsOn *DependsOn) (workerdb.Job, error) {
	// ジョブタイプを取得または作成
	jobType, err := w.queries.GetOrCreateJobType(ctx, jobTypeName)
	if err != nil {
		return workerdb.Job{}, fmt.Errorf("failed to get or create job type: %w", err)
	}

	// 引数をJSONにシリアライズ
	argJSON, err := json.Marshal(arg)
	if err != nil {
		return workerdb.Job{}, fmt.Errorf("failed to marshal job arg: %w", err)
	}

	// トランザクションを開始
	// トランザクション開始時に即座に書き込みロックを取得する (Read-Modify-Write を安全に行うため)
	tx, err := w.db.BeginImmediate(ctx)
	if err != nil {
		return workerdb.Job{}, fmt.Errorf("failed to begin immediate transaction: %w", err)
	}
	defer tx.Rollback()

	queries := tx.Q

	var uniqkeyNull sql.NullString
	if uniqkey != "" {
		uniqkeyNull = sql.NullString{String: uniqkey, Valid: true}
	}

	now := time.Now()

	var job workerdb.Job

	// 既存のジョブをチェック
	existing, err := queries.GetJobByTypeAndUniqkey(ctx, workerdb.GetJobByTypeAndUniqkeyParams{
		JobTypeID: jobType.ID,
		Uniqkey:   uniqkeyNull,
	})

	switch err {
	case nil:
		// 既存ジョブがある場合はマージして更新
		existingDepends, err := ParseDependsOn(existing.DependsOn.String)
		if err != nil {
			log.Printf("Warning: failed to parse existing depends_on for job %d: %v", existing.ID, err)
			existingDepends = &DependsOn{}
		}
		existingDepends.Merge(dependsOn)

		dependsJSON, _ := json.Marshal(existingDepends)

		err = queries.UpdateJobForEnqueue(ctx, workerdb.UpdateJobForEnqueueParams{
			Arg:       string(argJSON),
			DependsOn: sql.NullString{String: string(dependsJSON), Valid: true},
			RunAfter:  now,
			CreatedAt: now,
			ID:        existing.ID,
		})
		if err != nil {
			return workerdb.Job{}, fmt.Errorf("failed to update job %d: %w", existing.ID, err)
		}
		log.Printf("Updated existing job: id=%d, type=%s, uniqkey=%s", existing.ID, jobTypeName, uniqkey)

		job, err = queries.GetJobByID(ctx, existing.ID)
		if err != nil {
			return workerdb.Job{}, fmt.Errorf("failed to get updated job %d: %w", existing.ID, err)
		}
	case sql.ErrNoRows:
		// 新規エンキュー
		dependsJSON := "null"
		if dependsOn != nil {
			b, _ := json.Marshal(dependsOn)
			dependsJSON = string(b)
		}

		job, err = queries.EnqueueJob(ctx, workerdb.EnqueueJobParams{
			JobTypeID:  jobType.ID,
			Arg:        string(argJSON),
			Uniqkey:    uniqkeyNull,
			MaxRetries: 5,
			CreatedAt:  now,
			RunAfter:   now,
			DependsOn:  sql.NullString{String: dependsJSON, Valid: true},
		})
		if err != nil {
			return workerdb.Job{}, fmt.Errorf("failed to enqueue new job: %w", err)
		}
		log.Printf("Enqueued new job: id=%d, type=%s, uniqkey=%s", job.ID, jobTypeName, uniqkey)
	default:
		return workerdb.Job{}, fmt.Errorf("failed to check existing job: %w", err)
	}

	if err := tx.Commit(); err != nil {
		return workerdb.Job{}, fmt.Errorf("failed to commit transaction: %w", err)
	}
	return job, nil
}
