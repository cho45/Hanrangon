package jobqueue

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"time"

	"github.com/cho45/hanrangon/model"
)

// Queue はジョブキューを管理する
type Queue struct {
	db       *sql.DB
	queries  *model.Queries
	registry *Registry
	interval time.Duration
}

// NewQueue は新しいQueueを作成する
func NewQueue(db *sql.DB, queries *model.Queries, registry *Registry) *Queue {
	return &Queue{
		db:       db,
		queries:  queries,
		registry: registry,
		interval: 5 * time.Second, // デフォルト5秒
	}
}

// Start はジョブキューのワーカーを起動する
func (q *Queue) Start(ctx context.Context) {
	go q.run(ctx)
}

// run はポーリングループを実行する
func (q *Queue) run(ctx context.Context) {
	ticker := time.NewTicker(q.interval)
	defer ticker.Stop()

	log.Printf("Job queue worker started (polling interval: %v)", q.interval)

	for {
		select {
		case <-ctx.Done():
			log.Printf("Job queue worker stopped")
			return
		case <-ticker.C:
			if err := q.processNextJob(ctx); err != nil {
				log.Printf("Error processing job: %v", err)
			}
		}
	}
}

// processNextJob は次のジョブを1つ処理する
func (q *Queue) processNextJob(ctx context.Context) error {
	// 次のジョブを取得
	job, err := q.queries.FindNextJob(ctx, time.Now())
	if err != nil {
		if err == sql.ErrNoRows {
			// ジョブがない場合は何もしない
			return nil
		}
		return fmt.Errorf("failed to find next job: %w", err)
	}

	// ジョブを実行中としてマーク
	err = q.queries.GrabJob(ctx, model.GrabJobParams{
		GrabbedAt: sql.NullTime{Time: time.Now(), Valid: true},
		ID:        job.ID,
	})
	if err != nil {
		return fmt.Errorf("failed to grab job %d: %w", job.ID, err)
	}

	// ジョブタイプを取得
	jobType, err := q.queries.GetJobTypeByID(ctx, job.JobTypeID)
	if err != nil {
		return fmt.Errorf("failed to get job type %d: %w", job.JobTypeID, err)
	}

	// レジストリからジョブを取得
	jobImpl, ok := q.registry.Get(jobType.Name)
	if !ok {
		// ジョブが見つからない場合は失敗としてマーク
		return q.markJobFailed(ctx, job.ID, fmt.Errorf("job type %s not registered", jobType.Name))
	}

	// ジョブを実行
	log.Printf("Executing job %d (type: %s)", job.ID, jobType.Name)
	err = q.executeJob(ctx, jobImpl, job)
	if err != nil {
		log.Printf("Job %d failed: %v", job.ID, err)
		return q.markJobFailed(ctx, job.ID, err)
	}

	// 成功したらジョブを削除
	log.Printf("Job %d completed successfully", job.ID)
	return q.queries.MarkJobCompleted(ctx, job.ID)
}

// executeJob はジョブを実行する（パニックをリカバー）
func (q *Queue) executeJob(ctx context.Context, jobImpl Job, job model.Job) (err error) {
	defer func() {
		if r := recover(); r != nil {
			err = fmt.Errorf("job panicked: %v", r)
		}
	}()

	return jobImpl.Execute(ctx, json.RawMessage(job.Arg))
}

// markJobFailed はジョブを失敗としてマークする
func (q *Queue) markJobFailed(ctx context.Context, jobID int64, jobErr error) error {
	runAfter := time.Now().Add(30 * time.Second) // 30秒後にリトライ
	errorMessage := sql.NullString{String: jobErr.Error(), Valid: true}

	return q.queries.MarkJobFailed(ctx, model.MarkJobFailedParams{
		RunAfter:     runAfter,
		ErrorMessage: errorMessage,
		ID:           jobID,
	})
}

// Enqueue はジョブをキューに追加する
func (q *Queue) Enqueue(ctx context.Context, jobTypeName string, arg interface{}, uniqkey string) error {
	// ジョブタイプを取得または作成
	jobType, err := q.queries.GetOrCreateJobType(ctx, jobTypeName)
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

	_, err = q.queries.EnqueueJob(ctx, model.EnqueueJobParams{
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
