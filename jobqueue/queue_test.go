package jobqueue

import (
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"os"
	"testing"
	"time"

	"github.com/cho45/hanrangon/model"
	_ "github.com/mattn/go-sqlite3"
)

// TestJob はテスト用のジョブ
type TestJob struct {
	name      string
	executeFn func(ctx context.Context, arg json.RawMessage) error
}

func (j *TestJob) Name() string {
	return j.name
}

func (j *TestJob) Execute(ctx context.Context, arg json.RawMessage) error {
	return j.executeFn(ctx, arg)
}

// setupTestDB はテスト用のインメモリDBをセットアップする
func setupTestDB(t *testing.T) (*sql.DB, *model.Queries) {
	db, err := sql.Open("sqlite3", ":memory:")
	if err != nil {
		t.Fatalf("failed to open db: %v", err)
	}

	// スキーマをロード
	schema, err := os.ReadFile("../db/schema/worker.sql")
	if err != nil {
		t.Fatalf("failed to read schema: %v", err)
	}

	if _, err := db.Exec(string(schema)); err != nil {
		t.Fatalf("failed to create schema: %v", err)
	}

	return db, model.New(db)
}

func TestWorker_Enqueue(t *testing.T) {
	db, queries := setupTestDB(t)
	defer db.Close()

	registry := NewRegistry()
	registry.Register(&TestJob{
		name:      "TestJob",
		executeFn: func(ctx context.Context, arg json.RawMessage) error { return nil },
	})

	worker := NewWorker(db, queries, registry)

	// ジョブをエンキュー
	err := worker.Enqueue(context.Background(), "TestJob", map[string]string{"key": "value"}, "")
	if err != nil {
		t.Fatalf("failed to enqueue job: %v", err)
	}

	// ジョブがDBに存在することを確認
	count, err := queries.CountPendingJobs(context.Background())
	if err != nil {
		t.Fatalf("failed to count jobs: %v", err)
	}

	if count != 1 {
		t.Errorf("expected 1 pending job, got %d", count)
	}
}

func TestWorker_EnqueueWithUniqkey(t *testing.T) {
	db, queries := setupTestDB(t)
	defer db.Close()

	registry := NewRegistry()
	registry.Register(&TestJob{
		name:      "TestJob",
		executeFn: func(ctx context.Context, arg json.RawMessage) error { return nil },
	})

	worker := NewWorker(db, queries, registry)

	// 同じuniqkeyで2回エンキュー
	err := worker.Enqueue(context.Background(), "TestJob", map[string]string{"key": "value1"}, "unique-1")
	if err != nil {
		t.Fatalf("failed to enqueue job: %v", err)
	}

	err = worker.Enqueue(context.Background(), "TestJob", map[string]string{"key": "value2"}, "unique-1")
	if err != nil {
		t.Fatalf("failed to enqueue job: %v", err)
	}

	// 重複排除されて1つだけ存在することを確認
	count, err := queries.CountPendingJobs(context.Background())
	if err != nil {
		t.Fatalf("failed to count jobs: %v", err)
	}

	if count != 1 {
		t.Errorf("expected 1 pending job (deduplicated), got %d", count)
	}
}

func TestWorker_ProcessNextJob_Success(t *testing.T) {
	db, queries := setupTestDB(t)
	defer db.Close()

	executed := false
	registry := NewRegistry()
	registry.Register(&TestJob{
		name: "TestJob",
		executeFn: func(ctx context.Context, arg json.RawMessage) error {
			executed = true
			return nil
		},
	})

	worker := NewWorker(db, queries, registry)

	// ジョブをエンキュー
	err := worker.Enqueue(context.Background(), "TestJob", map[string]string{"key": "value"}, "")
	if err != nil {
		t.Fatalf("failed to enqueue job: %v", err)
	}

	// ジョブを処理
	err = worker.processNextJob(context.Background())
	if err != nil {
		t.Fatalf("failed to process job: %v", err)
	}

	// ジョブが実行されたことを確認
	if !executed {
		t.Error("job was not executed")
	}

	// ジョブが削除されたことを確認
	count, err := queries.CountPendingJobs(context.Background())
	if err != nil {
		t.Fatalf("failed to count jobs: %v", err)
	}

	if count != 0 {
		t.Errorf("expected 0 pending jobs after completion, got %d", count)
	}
}

func TestWorker_ProcessNextJob_Failure(t *testing.T) {
	db, queries := setupTestDB(t)
	defer db.Close()

	executionCount := 0
	registry := NewRegistry()
	registry.Register(&TestJob{
		name: "TestJob",
		executeFn: func(ctx context.Context, arg json.RawMessage) error {
			executionCount++
			return errors.New("job failed")
		},
	})

	worker := NewWorker(db, queries, registry)

	// ジョブをエンキュー
	err := worker.Enqueue(context.Background(), "TestJob", map[string]string{"key": "value"}, "")
	if err != nil {
		t.Fatalf("failed to enqueue job: %v", err)
	}

	// ジョブを処理（失敗する）
	err = worker.processNextJob(context.Background())
	if err != nil {
		t.Fatalf("processNextJob should not return error on job failure: %v", err)
	}

	// ジョブが実行されたことを確認
	if executionCount != 1 {
		t.Errorf("expected job to be executed once, got %d", executionCount)
	}

	// ジョブがまだpendingとして存在することを確認（リトライ用）
	job, err := queries.FindNextJob(context.Background(), time.Now().Add(31*time.Second))
	if err != nil {
		t.Fatalf("failed to find next job: %v", err)
	}

	if job.RetryCount != 1 {
		t.Errorf("expected retry_count=1, got %d", job.RetryCount)
	}

	if job.Status != "pending" {
		t.Errorf("expected status=pending, got %s", job.Status)
	}

	// エラーメッセージが保存されていることを確認
	if !job.ErrorMessage.Valid {
		t.Error("expected error_message to be set")
	}
	if job.ErrorMessage.String != "job failed" {
		t.Errorf("expected error_message='job failed', got '%s'", job.ErrorMessage.String)
	}
}

func TestWorker_ProcessNextJob_MaxRetries(t *testing.T) {
	db, queries := setupTestDB(t)
	defer db.Close()

	executionCount := 0
	registry := NewRegistry()
	registry.Register(&TestJob{
		name: "TestJob",
		executeFn: func(ctx context.Context, arg json.RawMessage) error {
			executionCount++
			return errors.New("job failed")
		},
	})

	worker := NewWorker(db, queries, registry)

	// ジョブをエンキュー
	err := worker.Enqueue(context.Background(), "TestJob", map[string]string{"key": "value"}, "")
	if err != nil {
		t.Fatalf("failed to enqueue job: %v", err)
	}

	// 最大リトライ回数まで実行
	for i := 0; i < 5; i++ {
		// run_afterを過去にして即座に実行可能にする
		_, err := db.Exec("UPDATE jobs SET run_after = datetime('now', '-1 second') WHERE status = 'pending'")
		if err != nil {
			t.Fatalf("failed to update run_after: %v", err)
		}

		err = worker.processNextJob(context.Background())
		if err != nil {
			t.Fatalf("processNextJob failed: %v", err)
		}
	}

	// 5回実行されたことを確認
	if executionCount != 5 {
		t.Errorf("expected job to be executed 5 times, got %d", executionCount)
	}

	// ジョブがfailedになっていることを確認
	job, err := queries.FindNextJob(context.Background(), time.Now().Add(365*24*time.Hour))
	if err == nil {
		if job.Status != "failed" {
			t.Errorf("expected status=failed after max retries, got %s", job.Status)
		}
	}
}

func TestWorker_ProcessNextJob_NoJobs(t *testing.T) {
	db, queries := setupTestDB(t)
	defer db.Close()

	registry := NewRegistry()
	worker := NewWorker(db, queries, registry)

	// ジョブがない状態で処理を試みる
	err := worker.processNextJob(context.Background())
	if err != nil {
		t.Fatalf("processNextJob should not error when no jobs: %v", err)
	}
}

func TestWorker_ProcessNextJob_JobNotRegistered(t *testing.T) {
	db, queries := setupTestDB(t)
	defer db.Close()

	// ジョブを登録しないレジストリ
	registry := NewRegistry()
	worker := NewWorker(db, queries, registry)

	// 未登録のジョブをエンキュー
	err := worker.Enqueue(context.Background(), "UnknownJob", map[string]string{"key": "value"}, "")
	if err != nil {
		t.Fatalf("failed to enqueue job: %v", err)
	}

	// ジョブを処理（失敗するはず）
	err = worker.processNextJob(context.Background())
	if err != nil {
		t.Fatalf("processNextJob should not return error: %v", err)
	}

	// ジョブがリトライ待ちになっていることを確認
	job, err := queries.FindNextJob(context.Background(), time.Now().Add(31*time.Second))
	if err != nil {
		t.Fatalf("failed to find next job: %v", err)
	}

	if job.RetryCount != 1 {
		t.Errorf("expected retry_count=1, got %d", job.RetryCount)
	}
}

func TestWorker_ProcessNextJob_Panic(t *testing.T) {
	db, queries := setupTestDB(t)
	defer db.Close()

	registry := NewRegistry()
	registry.Register(&TestJob{
		name: "TestJob",
		executeFn: func(ctx context.Context, arg json.RawMessage) error {
			panic("job panicked")
		},
	})

	worker := NewWorker(db, queries, registry)

	// ジョブをエンキュー
	err := worker.Enqueue(context.Background(), "TestJob", map[string]string{"key": "value"}, "")
	if err != nil {
		t.Fatalf("failed to enqueue job: %v", err)
	}

	// パニックがリカバーされることを確認
	err = worker.processNextJob(context.Background())
	if err != nil {
		t.Fatalf("processNextJob should recover from panic: %v", err)
	}

	// ジョブがリトライ待ちになっていることを確認
	job, err := queries.FindNextJob(context.Background(), time.Now().Add(31*time.Second))
	if err != nil {
		t.Fatalf("failed to find next job: %v", err)
	}

	if job.RetryCount != 1 {
		t.Errorf("expected retry_count=1 after panic, got %d", job.RetryCount)
	}
}

func TestWorker_Integration(t *testing.T) {
	db, queries := setupTestDB(t)
	defer db.Close()

	executedJobs := make([]string, 0)
	registry := NewRegistry()
	registry.Register(&TestJob{
		name: "Job1",
		executeFn: func(ctx context.Context, arg json.RawMessage) error {
			executedJobs = append(executedJobs, "Job1")
			return nil
		},
	})
	registry.Register(&TestJob{
		name: "Job2",
		executeFn: func(ctx context.Context, arg json.RawMessage) error {
			executedJobs = append(executedJobs, "Job2")
			return nil
		},
	})

	worker := NewWorker(db, queries, registry)

	// 複数のジョブをエンキュー
	worker.Enqueue(context.Background(), "Job1", nil, "")
	worker.Enqueue(context.Background(), "Job2", nil, "")
	worker.Enqueue(context.Background(), "Job1", nil, "")

	// 全てのジョブを処理
	for i := 0; i < 3; i++ {
		err := worker.processNextJob(context.Background())
		if err != nil {
			t.Fatalf("failed to process job %d: %v", i, err)
		}
	}

	// 全てのジョブが実行されたことを確認
	if len(executedJobs) != 3 {
		t.Errorf("expected 3 jobs executed, got %d", len(executedJobs))
	}

	// 全てのジョブが削除されたことを確認
	count, err := queries.CountPendingJobs(context.Background())
	if err != nil {
		t.Fatalf("failed to count jobs: %v", err)
	}

	if count != 0 {
		t.Errorf("expected 0 pending jobs after all processed, got %d", count)
	}
}

func TestWorker_ProcessNextJob_RunAfter(t *testing.T) {
	db, queries := setupTestDB(t)
	defer db.Close()

	executed := false
	registry := NewRegistry()
	registry.Register(&TestJob{
		name: "TestJob",
		executeFn: func(ctx context.Context, arg json.RawMessage) error {
			executed = true
			return nil
		},
	})

	worker := NewWorker(db, queries, registry)

	// 未来にスケジュールされたジョブをDBに直接挿入
	jobType, err := queries.GetOrCreateJobType(context.Background(), "TestJob")
	if err != nil {
		t.Fatalf("failed to create job type: %v", err)
	}

	futureTime := time.Now().Add(1 * time.Hour)
	_, err = queries.EnqueueJob(context.Background(), model.EnqueueJobParams{
		JobTypeID:  jobType.ID,
		Arg:        "{}",
		Uniqkey:    sql.NullString{},
		MaxRetries: 5,
		CreatedAt:  time.Now(),
		RunAfter:   futureTime,
	})
	if err != nil {
		t.Fatalf("failed to enqueue job: %v", err)
	}

	// 現在時刻でジョブを処理しようとする
	err = worker.processNextJob(context.Background())
	if err != nil {
		t.Fatalf("processNextJob failed: %v", err)
	}

	// ジョブが実行されていないことを確認
	if executed {
		t.Error("job should not be executed before run_after time")
	}

	// ジョブがまだpendingとして存在することを確認
	count, err := queries.CountPendingJobs(context.Background())
	if err != nil {
		t.Fatalf("failed to count jobs: %v", err)
	}

	if count != 1 {
		t.Errorf("expected 1 pending job, got %d", count)
	}
}

func TestWorker_EnqueueWithUniqkey_DifferentJobTypes(t *testing.T) {
	db, queries := setupTestDB(t)
	defer db.Close()

	registry := NewRegistry()
	registry.Register(&TestJob{
		name:      "Job1",
		executeFn: func(ctx context.Context, arg json.RawMessage) error { return nil },
	})
	registry.Register(&TestJob{
		name:      "Job2",
		executeFn: func(ctx context.Context, arg json.RawMessage) error { return nil },
	})

	worker := NewWorker(db, queries, registry)

	// 異なるジョブタイプで同じuniqkeyを使用
	err := worker.Enqueue(context.Background(), "Job1", map[string]string{"key": "value1"}, "unique-key")
	if err != nil {
		t.Fatalf("failed to enqueue Job1: %v", err)
	}

	err = worker.Enqueue(context.Background(), "Job2", map[string]string{"key": "value2"}, "unique-key")
	if err != nil {
		t.Fatalf("failed to enqueue Job2: %v", err)
	}

	// 両方のジョブが存在することを確認（異なるjob_type_idなので重複排除されない）
	count, err := queries.CountPendingJobs(context.Background())
	if err != nil {
		t.Fatalf("failed to count jobs: %v", err)
	}

	if count != 2 {
		t.Errorf("expected 2 pending jobs (different job types), got %d", count)
	}
}

func TestWorker_Start_ContextCancellation(t *testing.T) {
	db, queries := setupTestDB(t)
	defer db.Close()

	registry := NewRegistry()
	worker := NewWorker(db, queries, registry)

	// キャンセル可能なコンテキストを作成
	ctx, cancel := context.WithCancel(context.Background())

	// ワーカーを起動
	worker.Start(ctx)

	// 少し待つ
	time.Sleep(100 * time.Millisecond)

	// コンテキストをキャンセル
	cancel()

	// ワーカーが停止するまで待つ
	time.Sleep(100 * time.Millisecond)

	// ワーカーが停止したことを確認（特にエラーなく終了すればOK）
	// 注: ログ出力 "Job queue worker stopped" が出力されることを期待
}

func TestMain(m *testing.M) {
	// テスト実行時のログを抑制
	devNull, _ := os.Open(os.DevNull)
	os.Stderr = devNull
	defer devNull.Close()

	code := m.Run()

	// ログを元に戻す
	os.Stderr = os.NewFile(2, "/dev/stderr")

	os.Exit(code)
}
