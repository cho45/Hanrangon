package jobqueue

import (
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"strings"
	"testing"
	"time"

	"github.com/cho45/hanrangon/backend/model/workerdb"
	"github.com/cho45/hanrangon/internal/testutil"
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

func TestWorker_Enqueue(t *testing.T) {
	dbs := testutil.SetupAllDBs(t)
	defer dbs.Close()
	db, queries := dbs.Worker, dbs.WorkerQueries

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
	dbs := testutil.SetupAllDBs(t)
	defer dbs.Close()
	db, queries := dbs.Worker, dbs.WorkerQueries

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
	dbs := testutil.SetupAllDBs(t)
	defer dbs.Close()
	db, queries := dbs.Worker, dbs.WorkerQueries

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
	dbs := testutil.SetupAllDBs(t)
	defer dbs.Close()
	db, queries := dbs.Worker, dbs.WorkerQueries

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

func TestWorker_ExponentialBackoff(t *testing.T) {
	dbs := testutil.SetupAllDBs(t)
	defer dbs.Close()
	db, queries := dbs.Worker, dbs.WorkerQueries

	registry := NewRegistry()
	registry.Register(&TestJob{
		name: "TestJob",
		executeFn: func(ctx context.Context, arg json.RawMessage) error {
			return errors.New("job failed")
		},
	})

	worker := NewWorker(db, queries, registry)

	// ジョブをエンキュー
	err := worker.Enqueue(context.Background(), "TestJob", map[string]string{"key": "value"}, "")
	if err != nil {
		t.Fatalf("failed to enqueue job: %v", err)
	}

	// テストケース: retry_count → 期待されるバックオフ間隔
	testCases := []struct {
		retryCount       int64
		expectedBackoff  time.Duration
		toleranceSeconds int // 許容誤差（秒）
	}{
		{0, 30 * time.Second, 2}, // 2^0 * 30s = 30s
		{1, 1 * time.Minute, 2},  // 2^1 * 30s = 1m
		{2, 2 * time.Minute, 2},  // 2^2 * 30s = 2m
		{3, 4 * time.Minute, 2},  // 2^3 * 30s = 4m
		{4, 8 * time.Minute, 2},  // 2^4 * 30s = 8m
		{10, 1 * time.Hour, 2},   // 2^10 * 30s = 512m > 60m → max 1h
	}

	for _, tc := range testCases {
		// retry_countを設定
		_, err := db.Exec("UPDATE jobs SET retry_count = ?, status = 'pending', run_after = datetime('now') WHERE status != 'failed'", tc.retryCount)
		if err != nil {
			t.Fatalf("failed to update retry_count: %v", err)
		}

		// 失敗前の時刻を記録
		beforeFail := time.Now()

		// ジョブを処理（失敗する）
		err = worker.processNextJob(context.Background())
		if err != nil {
			t.Fatalf("processNextJob should not return error on job failure: %v", err)
		}

		// ジョブの状態を確認
		var runAfter time.Time
		var status string
		err = db.QueryRow("SELECT run_after, status FROM jobs WHERE id = 1").Scan(&runAfter, &status)
		if err != nil {
			t.Fatalf("failed to get job: %v", err)
		}

		// retry_count + 1 が max_retries (5) に達していない場合
		if tc.retryCount+1 < 5 {
			if status != "pending" {
				t.Errorf("retry_count=%d: expected status=pending, got %s", tc.retryCount, status)
			}

			// run_afterが期待される時刻になっているか確認
			actualBackoff := runAfter.Sub(beforeFail)

			// 許容誤差内かチェック
			diff := actualBackoff - tc.expectedBackoff
			if diff < 0 {
				diff = -diff
			}

			if diff > time.Duration(tc.toleranceSeconds)*time.Second {
				t.Errorf("retry_count=%d: expected backoff=%v, got %v (diff=%v)",
					tc.retryCount, tc.expectedBackoff, actualBackoff, diff)
			}

			t.Logf("retry_count=%d: backoff=%v (expected=%v)", tc.retryCount, actualBackoff, tc.expectedBackoff)
		} else {
			// max_retries に達した場合は failed になる
			if status != "failed" {
				t.Errorf("retry_count=%d (>= max_retries): expected status=failed, got %s", tc.retryCount, status)
			}
		}
	}
}

func TestWorker_ProcessNextJob_MaxRetries(t *testing.T) {
	dbs := testutil.SetupAllDBs(t)
	defer dbs.Close()
	db, queries := dbs.Worker, dbs.WorkerQueries

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
	dbs := testutil.SetupAllDBs(t)
	defer dbs.Close()
	db, queries := dbs.Worker, dbs.WorkerQueries

	registry := NewRegistry()
	worker := NewWorker(db, queries, registry)

	// ジョブがない状態で処理を試みる
	err := worker.processNextJob(context.Background())
	if err != nil {
		t.Fatalf("processNextJob should not error when no jobs: %v", err)
	}
}

func TestWorker_ProcessNextJob_JobNotRegistered(t *testing.T) {
	dbs := testutil.SetupAllDBs(t)
	defer dbs.Close()
	db, queries := dbs.Worker, dbs.WorkerQueries

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
	dbs := testutil.SetupAllDBs(t)
	defer dbs.Close()
	db, queries := dbs.Worker, dbs.WorkerQueries

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
	dbs := testutil.SetupAllDBs(t)
	defer dbs.Close()
	db, queries := dbs.Worker, dbs.WorkerQueries

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
	dbs := testutil.SetupAllDBs(t)
	defer dbs.Close()
	db, queries := dbs.Worker, dbs.WorkerQueries

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
	_, err = queries.EnqueueJob(context.Background(), workerdb.EnqueueJobParams{
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
	dbs := testutil.SetupAllDBs(t)
	defer dbs.Close()
	db, queries := dbs.Worker, dbs.WorkerQueries

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

func TestWorker_RecoverStuckJobs(t *testing.T) {
	dbs := testutil.SetupAllDBs(t)
	defer dbs.Close()
	db, queries := dbs.Worker, dbs.WorkerQueries

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

	// ジョブをrunningに変更し、grabbed_atを6分前に設定（スタック状態にする）
	_, err = db.Exec("UPDATE jobs SET status = 'running', grabbed_at = datetime('now', '-6 minutes') WHERE id = 1")
	if err != nil {
		t.Fatalf("failed to update job: %v", err)
	}

	// スタックジョブを回復
	err = worker.recoverStuckJobs(context.Background())
	if err != nil {
		t.Fatalf("failed to recover stuck jobs: %v", err)
	}

	// ジョブの状態を確認
	job, err := queries.GetJobByID(context.Background(), 1)
	if err != nil {
		t.Fatalf("failed to get job: %v", err)
	}

	if job.Status != "pending" {
		t.Errorf("expected status=pending after recovery, got %s", job.Status)
	}

	if job.RetryCount != 1 {
		t.Errorf("expected retry_count=1 after recovery, got %d", job.RetryCount)
	}

	if job.GrabbedAt.Valid {
		t.Errorf("expected grabbed_at to be NULL after recovery, got %v", job.GrabbedAt)
	}
}

func TestWorker_RecoverStuckJobs_MaxRetriesReached(t *testing.T) {
	dbs := testutil.SetupAllDBs(t)
	defer dbs.Close()
	db, queries := dbs.Worker, dbs.WorkerQueries

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

	// ジョブをrunningに変更し、grabbed_atを6分前、retry_countをmax_retries（5）に設定
	_, err = db.Exec("UPDATE jobs SET status = 'running', grabbed_at = datetime('now', '-6 minutes'), retry_count = 5 WHERE id = 1")
	if err != nil {
		t.Fatalf("failed to update job: %v", err)
	}

	// スタックジョブを回復
	err = worker.recoverStuckJobs(context.Background())
	if err != nil {
		t.Fatalf("failed to recover stuck jobs: %v", err)
	}

	// ジョブの状態を確認
	job, err := queries.GetJobByID(context.Background(), 1)
	if err != nil {
		t.Fatalf("failed to get job: %v", err)
	}

	if job.Status != "failed" {
		t.Errorf("expected status=failed when max_retries reached, got %s", job.Status)
	}

	if job.RetryCount != 5 {
		t.Errorf("expected retry_count=5 (unchanged), got %d", job.RetryCount)
	}
}

func TestWorker_RecoverStuckJobs_NotStuck(t *testing.T) {
	dbs := testutil.SetupAllDBs(t)
	defer dbs.Close()
	db, queries := dbs.Worker, dbs.WorkerQueries

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

	// ジョブをrunningに変更するが、grabbed_atは現在時刻（スタックしていない）
	_, err = db.Exec("UPDATE jobs SET status = 'running', grabbed_at = datetime('now') WHERE id = 1")
	if err != nil {
		t.Fatalf("failed to update job: %v", err)
	}

	// スタックジョブを回復（何も変わらないはず）
	err = worker.recoverStuckJobs(context.Background())
	if err != nil {
		t.Fatalf("failed to recover stuck jobs: %v", err)
	}

	// ジョブの状態を確認
	job, err := queries.GetJobByID(context.Background(), 1)
	if err != nil {
		t.Fatalf("failed to get job: %v", err)
	}

	// スタックしていないのでrunningのまま
	if job.Status != "running" {
		t.Errorf("expected status=running (not stuck), got %s", job.Status)
	}

	if job.RetryCount != 0 {
		t.Errorf("expected retry_count=0 (unchanged), got %d", job.RetryCount)
	}
}

func TestWorker_JobTimeout_Default(t *testing.T) {
	dbs := testutil.SetupAllDBs(t)
	defer dbs.Close()
	db, queries := dbs.Worker, dbs.WorkerQueries

	executed := false
	registry := NewRegistry()
	registry.Register(&TestJob{
		name: "TestJob",
		executeFn: func(ctx context.Context, arg json.RawMessage) error {
			executed = true
			// Check that context has a deadline (timeout)
			deadline, ok := ctx.Deadline()
			if !ok {
				t.Error("expected context to have deadline")
			}
			// Deadline should be approximately 5 minutes from now
			expectedDeadline := time.Now().Add(5 * time.Minute)
			diff := deadline.Sub(expectedDeadline)
			if diff < 0 {
				diff = -diff
			}
			if diff > 2*time.Second {
				t.Errorf("expected deadline ~5m from now, got %v (diff=%v)", deadline, diff)
			}
			return nil
		},
	})

	worker := NewWorker(db, queries, registry)

	// Enqueue job
	err := worker.Enqueue(context.Background(), "TestJob", map[string]string{"key": "value"}, "")
	if err != nil {
		t.Fatalf("failed to enqueue job: %v", err)
	}

	// Process job
	err = worker.processNextJob(context.Background())
	if err != nil {
		t.Fatalf("failed to process job: %v", err)
	}

	if !executed {
		t.Error("job was not executed")
	}
}

// TestJobWithTimeout is a test job that implements JobHandlerWithTimeout
type TestJobWithTimeout struct {
	name      string
	timeout   time.Duration
	executeFn func(ctx context.Context, arg json.RawMessage) error
}

func (j *TestJobWithTimeout) Name() string {
	return j.name
}

func (j *TestJobWithTimeout) Timeout() time.Duration {
	return j.timeout
}

func (j *TestJobWithTimeout) Execute(ctx context.Context, arg json.RawMessage) error {
	return j.executeFn(ctx, arg)
}

func TestWorker_JobTimeout_Custom(t *testing.T) {
	dbs := testutil.SetupAllDBs(t)
	defer dbs.Close()
	db, queries := dbs.Worker, dbs.WorkerQueries

	customTimeout := 2 * time.Minute
	executed := false
	registry := NewRegistry()
	registry.Register(&TestJobWithTimeout{
		name:    "TestJobWithTimeout",
		timeout: customTimeout,
		executeFn: func(ctx context.Context, arg json.RawMessage) error {
			executed = true
			// Check that context has the custom timeout
			deadline, ok := ctx.Deadline()
			if !ok {
				t.Error("expected context to have deadline")
			}
			expectedDeadline := time.Now().Add(customTimeout)
			diff := deadline.Sub(expectedDeadline)
			if diff < 0 {
				diff = -diff
			}
			if diff > 2*time.Second {
				t.Errorf("expected deadline ~%v from now, got %v (diff=%v)", customTimeout, deadline, diff)
			}
			return nil
		},
	})

	worker := NewWorker(db, queries, registry)

	// Enqueue job
	err := worker.Enqueue(context.Background(), "TestJobWithTimeout", map[string]string{"key": "value"}, "")
	if err != nil {
		t.Fatalf("failed to enqueue job: %v", err)
	}

	// Process job
	err = worker.processNextJob(context.Background())
	if err != nil {
		t.Fatalf("failed to process job: %v", err)
	}

	if !executed {
		t.Error("job was not executed")
	}
}

func TestWorker_JobTimeout_Exceeded(t *testing.T) {
	dbs := testutil.SetupAllDBs(t)
	defer dbs.Close()
	db, queries := dbs.Worker, dbs.WorkerQueries

	shortTimeout := 100 * time.Millisecond
	executionStarted := false
	registry := NewRegistry()
	registry.Register(&TestJobWithTimeout{
		name:    "TestJobWithTimeout",
		timeout: shortTimeout,
		executeFn: func(ctx context.Context, arg json.RawMessage) error {
			executionStarted = true
			// Sleep longer than the timeout
			select {
			case <-time.After(1 * time.Second):
				return nil
			case <-ctx.Done():
				// Context was cancelled due to timeout
				return ctx.Err()
			}
		},
	})

	worker := NewWorker(db, queries, registry)

	// Enqueue job
	err := worker.Enqueue(context.Background(), "TestJobWithTimeout", map[string]string{"key": "value"}, "")
	if err != nil {
		t.Fatalf("failed to enqueue job: %v", err)
	}

	// Process job (should timeout)
	err = worker.processNextJob(context.Background())
	if err != nil {
		t.Fatalf("processNextJob should not return error: %v", err)
	}

	if !executionStarted {
		t.Error("job should have started executing")
	}

	// Job should be marked for retry after timeout
	job, err := queries.FindNextJob(context.Background(), time.Now().Add(31*time.Second))
	if err != nil {
		t.Fatalf("failed to find next job: %v", err)
	}

	if job.RetryCount != 1 {
		t.Errorf("expected retry_count=1 after timeout, got %d", job.RetryCount)
	}

	if job.Status != "pending" {
		t.Errorf("expected status=pending after timeout, got %s", job.Status)
	}

	// Error message should indicate timeout
	if !job.ErrorMessage.Valid {
		t.Error("expected error_message to be set after timeout")
	}
	if !strings.Contains(job.ErrorMessage.String, "deadline exceeded") &&
		!strings.Contains(job.ErrorMessage.String, "context deadline exceeded") {
		t.Errorf("expected error message to contain 'deadline exceeded', got '%s'", job.ErrorMessage.String)
	}
}

func TestWorker_GracefulShutdown_RunningJobCompletes(t *testing.T) {
	dbs := testutil.SetupAllDBs(t)
	defer dbs.Close()
	db, queries := dbs.Worker, dbs.WorkerQueries

	jobStarted := make(chan struct{})
	jobFinished := make(chan struct{})
	jobCompletedInDB := make(chan bool, 1)

	registry := NewRegistry()
	registry.Register(&TestJob{
		name: "LongJob",
		executeFn: func(ctx context.Context, arg json.RawMessage) error {
			close(jobStarted)
			// Wait for a signal that the main context is canceled
			// Use a select with time.After to avoid hanging if something goes wrong
			select {
			case <-time.After(500 * time.Millisecond):
				// OK
			case <-ctx.Done():
				t.Error("job context should not be canceled by main context cancellation")
			}
			close(jobFinished)
			return nil
		},
	})

	// Use a short interval for testing
	worker := NewWorker(db, queries, registry)
	worker.interval = 10 * time.Millisecond

	// Enqueue a job
	err := worker.Enqueue(context.Background(), "LongJob", nil, "")
	if err != nil {
		t.Fatalf("failed to enqueue job: %v", err)
	}

	// Start worker with a cancelable context
	ctx, cancel := context.WithCancel(context.Background())
	worker.Start(ctx)

	// Wait for job to start
	<-jobStarted

	// Cancel the main context while the job is running
	cancel()

	// Wait for the job to finish (it should finish because it uses detached context)
	select {
	case <-jobFinished:
		// OK
	case <-time.After(1 * time.Second):
		t.Fatal("job did not finish in time")
	}

	// Wait for worker to stop
	worker.Wait()

	// Verify the job is marked as completed in the DB
	// (Check queries.CountPendingJobs should be 0)
	go func() {
		count, _ := queries.CountPendingJobs(context.Background())
		jobCompletedInDB <- (count == 0)
	}()

	select {
	case completed := <-jobCompletedInDB:
		if !completed {
			t.Error("job should be completed in DB even after main context cancel")
		}
	case <-time.After(1 * time.Second):
		t.Fatal("timed out waiting for DB check")
	}
}

func TestWorker_GracefulShutdown_NoNewJobs(t *testing.T) {
	dbs := testutil.SetupAllDBs(t)
	defer dbs.Close()
	db, queries := dbs.Worker, dbs.WorkerQueries

	executionCount := 0
	registry := NewRegistry()
	registry.Register(&TestJob{
		name: "QuickJob",
		executeFn: func(ctx context.Context, arg json.RawMessage) error {
			executionCount++
			return nil
		},
	})

	worker := NewWorker(db, queries, registry)
	worker.interval = 10 * time.Millisecond

	// Enqueue 3 jobs
	for i := 0; i < 3; i++ {
		worker.Enqueue(context.Background(), "QuickJob", nil, fmt.Sprintf("job-%d", i))
	}

	ctx, cancel := context.WithCancel(context.Background())

	// We want to stop the worker after the first job is fetched or during the interval
	worker.Start(ctx)

	// Give it just enough time to possibly start one job
	time.Sleep(50 * time.Millisecond)
	cancel()
	worker.Wait()

	// The count should be less than or equal to 3, but definitely stopped
	t.Logf("Executed %d jobs before shutdown", executionCount)

	// If it executed some jobs, ensure they are removed from DB
	count, _ := queries.CountPendingJobs(context.Background())
	if int64(executionCount)+count != 3 {
		t.Errorf("sum of executed (%d) and pending (%d) jobs should be 3", executionCount, count)
	}
}
