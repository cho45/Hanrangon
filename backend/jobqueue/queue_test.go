package jobqueue

import (
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"strings"
	"sync"
	"testing"
	"time"

	"github.com/cho45/hanrangon/backend/model"
	"github.com/cho45/hanrangon/backend/model/workerdb"
	"github.com/cho45/hanrangon/internal/testutil"
	_ "github.com/mattn/go-sqlite3"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
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

// workerTestEnv はWorkerテストの環境を保持する構造体
// 目的: クリーンナップの順序を確実にし、DB接続のライフサイクルを管理する
type workerTestEnv struct {
	DBs          *testutil.DBs
	Worker       *Worker
	Queries      *workerdb.Queries
	WorkerCtx    context.Context    // Worker制御用context
	workerCancel context.CancelFunc // Worker停止用（非公開）
}

// Cleanup はテスト環境を正しい順序でクリーンナップする
// 順序: Worker停止 → Worker完全停止待ち → DB接続クローズ
func (e *workerTestEnv) Cleanup() {
	if e.workerCancel != nil {
		e.workerCancel()
	}
	if e.Worker != nil {
		e.Worker.Wait()
	}
	if e.DBs != nil {
		e.DBs.Close()
	}
}

// StopWorker はWorkerを停止する（テストで明示的に停止したい場合）
func (e *workerTestEnv) StopWorker() {
	if e.workerCancel != nil {
		e.workerCancel()
	}
}

// setupWorkerTest はWorkerテストの共通セットアップを行う
// registry: ジョブを登録したRegistry（nilの場合は空のRegistryを作成）
func setupWorkerTest(t *testing.T, registry *Registry) *workerTestEnv {
	if registry == nil {
		registry = NewRegistry()
	}

	dbs := testutil.SetupAllDBs(t)
	db, queries := dbs.Worker, dbs.WorkerQueries

	workerDB := model.NewDatabase[workerdb.Querier](
		db,
		func(d model.DBTX) workerdb.Querier { return workerdb.New(d.(workerdb.DBTX)) },
	)
	worker := NewWorker(workerDB, queries, registry)

	// Worker制御用context
	workerCtx, workerCancel := context.WithCancel(context.Background())

	return &workerTestEnv{
		DBs:          dbs,
		Worker:       worker,
		Queries:      queries.(*workerdb.Queries),
		WorkerCtx:    workerCtx,
		workerCancel: workerCancel,
	}
}

func TestWorker_Enqueue(t *testing.T) {
	registry := NewRegistry()
	registry.Register(&TestJob{
		name:      "TestJob",
		executeFn: func(ctx context.Context, arg json.RawMessage) error { return nil },
	})

	env := setupWorkerTest(t, registry)
	defer env.Cleanup()

	ctx := context.Background()

	// ジョブをエンキュー
	_, err := env.Worker.Enqueue(ctx, "TestJob", map[string]string{"key": "value"}, "")
	if err != nil {
		t.Fatalf("failed to enqueue job: %v", err)
	}

	// ジョブがDBに存在することを確認
	count, err := env.Queries.CountPendingJobs(ctx)
	if err != nil {
		t.Fatalf("failed to count jobs: %v", err)
	}

	if count != 1 {
		t.Errorf("expected 1 pending job, got %d", count)
	}
}

func TestWorker_EnqueueWithUniqkey(t *testing.T) {
	registry := NewRegistry()
	registry.Register(&TestJob{
		name:      "TestJob",
		executeFn: func(ctx context.Context, arg json.RawMessage) error { return nil },
	})

	env := setupWorkerTest(t, registry)
	defer env.Cleanup()

	ctx := context.Background()

	// 同じuniqkeyで2回エンキュー
	_, err := env.Worker.Enqueue(ctx, "TestJob", map[string]string{"key": "value1"}, "unique-1")
	if err != nil {
		t.Fatalf("failed to enqueue job: %v", err)
	}

	_, err = env.Worker.Enqueue(ctx, "TestJob", map[string]string{"key": "value2"}, "unique-1")
	if err != nil {
		t.Fatalf("failed to enqueue job: %v", err)
	}

	// 重複排除されて1つだけ存在することを確認
	count, err := env.Queries.CountPendingJobs(ctx)
	if err != nil {
		t.Fatalf("failed to count jobs: %v", err)
	}

	if count != 1 {
		t.Errorf("expected 1 pending job (deduplicated), got %d", count)
	}
}

func TestWorker_ProcessNextJob_Success(t *testing.T) {
	executed := false
	registry := NewRegistry()
	registry.Register(&TestJob{
		name: "TestJob",
		executeFn: func(ctx context.Context, arg json.RawMessage) error {
			executed = true
			return nil
		},
	})

	env := setupWorkerTest(t, registry)
	defer env.Cleanup()

	ctx := context.Background()

	// ジョブをエンキュー
	_, err := env.Worker.Enqueue(ctx, "TestJob", map[string]string{"key": "value"}, "")
	if err != nil {
		t.Fatalf("failed to enqueue job: %v", err)
	}

	// ジョブを処理
	err = env.Worker.processNextJob(ctx)
	if err != nil {
		t.Fatalf("failed to process job: %v", err)
	}

	// ジョブが実行されたことを確認
	if !executed {
		t.Error("job was not executed")
	}

	// ジョブが削除されたことを確認
	count, err := env.Queries.CountPendingJobs(ctx)
	if err != nil {
		t.Fatalf("failed to count jobs: %v", err)
	}

	if count != 0 {
		t.Errorf("expected 0 pending jobs after completion, got %d", count)
	}
}

func TestWorker_ProcessNextJob_Failure(t *testing.T) {
	executionCount := 0
	registry := NewRegistry()
	registry.Register(&TestJob{
		name: "TestJob",
		executeFn: func(ctx context.Context, arg json.RawMessage) error {
			executionCount++
			return errors.New("job failed")
		},
	})

	env := setupWorkerTest(t, registry)
	defer env.Cleanup()

	ctx := context.Background()

	// ジョブをエンキュー
	_, err := env.Worker.Enqueue(ctx, "TestJob", map[string]string{"key": "value"}, "")
	if err != nil {
		t.Fatalf("failed to enqueue job: %v", err)
	}

	// ジョブを処理（失敗する）
	err = env.Worker.processNextJob(ctx)
	if err != nil {
		t.Fatalf("processNextJob should not return error on job failure: %v", err)
	}

	// ジョブが実行されたことを確認
	if executionCount != 1 {
		t.Errorf("expected job to be executed once, got %d", executionCount)
	}

	// ジョブがまだpendingとして存在することを確認（リトライ用）
	job, err := env.Queries.FindNextJob(ctx, time.Now().Add(31*time.Second))
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
	registry := NewRegistry()
	registry.Register(&TestJob{
		name: "TestJob",
		executeFn: func(ctx context.Context, arg json.RawMessage) error {
			return errors.New("job failed")
		},
	})

	env := setupWorkerTest(t, registry)
	defer env.Cleanup()

	ctx := context.Background()

	// ジョブをエンキュー
	_, err := env.Worker.Enqueue(ctx, "TestJob", map[string]string{"key": "value"}, "")
	require.NoError(t, err)

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
		_, err := env.DBs.Worker.Exec("UPDATE jobs SET retry_count = ?, status = 'pending', run_after = datetime('now') WHERE status != 'failed'", tc.retryCount)
		require.NoError(t, err)

		// 失敗前の時刻を記録
		beforeFail := time.Now()

		// ジョブを処理（失敗する）
		err = env.Worker.processNextJob(ctx)
		require.NoError(t, err)

		// ジョブの状態を確認
		var runAfter time.Time
		var status string
		err = env.DBs.Worker.QueryRow("SELECT run_after, status FROM jobs WHERE id = 1").Scan(&runAfter, &status)
		require.NoError(t, err)

		// retry_count + 1 が max_retries (5) に達していない場合
		if tc.retryCount+1 < 5 {
			assert.Equal(t, "pending", status, "retry_count=%d: expected status=pending", tc.retryCount)

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
			assert.Equal(t, "failed", status, "retry_count=%d (>= max_retries): expected status=failed", tc.retryCount)
		}
	}
}

func TestWorker_ProcessNextJob_MaxRetries(t *testing.T) {
	executionCount := 0
	registry := NewRegistry()
	registry.Register(&TestJob{
		name: "TestJob",
		executeFn: func(ctx context.Context, arg json.RawMessage) error {
			executionCount++
			return errors.New("job failed")
		},
	})

	env := setupWorkerTest(t, registry)
	defer env.Cleanup()

	ctx := context.Background()

	// ジョブをエンキュー
	_, err := env.Worker.Enqueue(ctx, "TestJob", map[string]string{"key": "value"}, "")
	require.NoError(t, err)

	// 最大リトライ回数まで実行
	for i := 0; i < 5; i++ {
		// run_afterを過去にして即座に実行可能にする
		_, err := env.DBs.Worker.Exec("UPDATE jobs SET run_after = datetime('now', '-1 second') WHERE status = 'pending'")
		require.NoError(t, err)

		err = env.Worker.processNextJob(ctx)
		require.NoError(t, err)
	}

	// 5回実行されたことを確認
	assert.Equal(t, 5, executionCount)

	// ジョブがfailedになっていることを確認
	job, err := env.Queries.FindNextJob(ctx, time.Now().Add(365*24*time.Hour))
	if err == nil {
		assert.Equal(t, "failed", job.Status)
	}
}

func TestWorker_ProcessNextJob_NoJobs(t *testing.T) {
	env := setupWorkerTest(t, nil)
	defer env.Cleanup()

	ctx := context.Background()

	// ジョブがない状態で処理を試みる
	err := env.Worker.processNextJob(ctx)
	require.NoError(t, err)
}

func TestWorker_ProcessNextJob_JobNotRegistered(t *testing.T) {
	// ジョブを登録しないレジストリ
	env := setupWorkerTest(t, nil)
	defer env.Cleanup()

	ctx := context.Background()

	// 未登録のジョブをエンキュー
	_, err := env.Worker.Enqueue(ctx, "UnknownJob", map[string]string{"key": "value"}, "")
	require.NoError(t, err)

	// ジョブを処理（失敗するはず）
	err = env.Worker.processNextJob(ctx)
	require.NoError(t, err)

	// ジョブがリトライ待ちになっていることを確認
	job, err := env.Queries.FindNextJob(ctx, time.Now().Add(31*time.Second))
	require.NoError(t, err)
	assert.Equal(t, int64(1), job.RetryCount)
}

func TestWorker_ProcessNextJob_Panic(t *testing.T) {
	registry := NewRegistry()
	registry.Register(&TestJob{
		name: "TestJob",
		executeFn: func(ctx context.Context, arg json.RawMessage) error {
			panic("job panicked")
		},
	})

	env := setupWorkerTest(t, registry)
	defer env.Cleanup()

	ctx := context.Background()

	// ジョブをエンキュー
	_, err := env.Worker.Enqueue(ctx, "TestJob", map[string]string{"key": "value"}, "")
	require.NoError(t, err)

	// パニックがリカバーされることを確認
	err = env.Worker.processNextJob(ctx)
	require.NoError(t, err)

	// ジョブがリトライ待ちになっていることを確認
	job, err := env.Queries.FindNextJob(ctx, time.Now().Add(31*time.Second))
	require.NoError(t, err)
	assert.Equal(t, int64(1), job.RetryCount)
}

func TestWorker_Integration(t *testing.T) {
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

	env := setupWorkerTest(t, registry)
	defer env.Cleanup()

	ctx := context.Background()

	// 複数のジョブをエンキュー
	_, _ = env.Worker.Enqueue(ctx, "Job1", nil, "")
	_, _ = env.Worker.Enqueue(ctx, "Job2", nil, "")
	_, _ = env.Worker.Enqueue(ctx, "Job1", nil, "")

	// 全てのジョブを処理
	for i := 0; i < 3; i++ {
		err := env.Worker.processNextJob(ctx)
		require.NoError(t, err)
	}

	// 全てのジョブが実行されたことを確認
	assert.Len(t, executedJobs, 3)

	// 全てのジョブが削除されたことを確認
	count, err := env.Queries.CountPendingJobs(ctx)
	require.NoError(t, err)
	assert.Equal(t, int64(0), count)
}

func TestWorker_ProcessNextJob_RunAfter(t *testing.T) {
	executed := false
	registry := NewRegistry()
	registry.Register(&TestJob{
		name: "TestJob",
		executeFn: func(ctx context.Context, arg json.RawMessage) error {
			executed = true
			return nil
		},
	})

	env := setupWorkerTest(t, registry)
	defer env.Cleanup()

	ctx := context.Background()

	// 未来にスケジュールされたジョブをDBに直接挿入
	jobType, err := env.Queries.GetOrCreateJobType(ctx, "TestJob")
	require.NoError(t, err)

	futureTime := time.Now().Add(1 * time.Hour)
	_, err = env.Queries.EnqueueJob(ctx, workerdb.EnqueueJobParams{
		JobTypeID:  jobType.ID,
		Arg:        "{}",
		Uniqkey:    sql.NullString{},
		MaxRetries: 5,
		CreatedAt:  time.Now(),
		RunAfter:   futureTime,
	})
	require.NoError(t, err)

	// 現在時刻でジョブを処理しようとする
	err = env.Worker.processNextJob(ctx)
	require.NoError(t, err)

	// ジョブが実行されていないことを確認
	assert.False(t, executed)

	// ジョブがまだpendingとして存在することを確認
	count, err := env.Queries.CountPendingJobs(ctx)
	require.NoError(t, err)
	assert.Equal(t, int64(1), count)
}

func TestWorker_EnqueueWithUniqkey_DifferentJobTypes(t *testing.T) {
	registry := NewRegistry()
	registry.Register(&TestJob{
		name:      "Job1",
		executeFn: func(ctx context.Context, arg json.RawMessage) error { return nil },
	})
	registry.Register(&TestJob{
		name:      "Job2",
		executeFn: func(ctx context.Context, arg json.RawMessage) error { return nil },
	})

	env := setupWorkerTest(t, registry)
	defer env.Cleanup()

	ctx := context.Background()

	// 異なるジョブタイプで同じuniqkeyを使用
	_, err := env.Worker.Enqueue(ctx, "Job1", map[string]string{"key": "value1"}, "unique-key")
	require.NoError(t, err)

	_, err = env.Worker.Enqueue(ctx, "Job2", map[string]string{"key": "value2"}, "unique-key")
	require.NoError(t, err)

	// 両方のジョブが存在することを確認（異なるjob_type_idなので重複排除されない）
	count, err := env.Queries.CountPendingJobs(ctx)
	require.NoError(t, err)
	assert.Equal(t, int64(2), count)
}

func TestWorker_RecoverStuckJobs(t *testing.T) {
	registry := NewRegistry()
	registry.Register(&TestJob{
		name:      "TestJob",
		executeFn: func(ctx context.Context, arg json.RawMessage) error { return nil },
	})

	env := setupWorkerTest(t, registry)
	defer env.Cleanup()

	ctx := context.Background()

	// ジョブをエンキュー
	_, err := env.Worker.Enqueue(ctx, "TestJob", map[string]string{"key": "value"}, "")
	require.NoError(t, err)

	// ジョブをrunningに変更し、grabbed_atを6分前に設定（スタック状態にする）
	_, err = env.DBs.Worker.Exec("UPDATE jobs SET status = 'running', grabbed_at = datetime('now', '-6 minutes') WHERE id = 1")
	require.NoError(t, err)

	// スタックジョブを回復
	err = env.Worker.recoverStuckJobs(ctx)
	require.NoError(t, err)

	// ジョブの状態を確認
	job, err := env.Queries.GetJobByID(ctx, 1)
	require.NoError(t, err)

	assert.Equal(t, "pending", job.Status)
	assert.Equal(t, int64(1), job.RetryCount)
	assert.False(t, job.GrabbedAt.Valid)
}

func TestWorker_RecoverStuckJobs_MaxRetriesReached(t *testing.T) {
	registry := NewRegistry()
	registry.Register(&TestJob{
		name:      "TestJob",
		executeFn: func(ctx context.Context, arg json.RawMessage) error { return nil },
	})

	env := setupWorkerTest(t, registry)
	defer env.Cleanup()

	ctx := context.Background()

	// ジョブをエンキュー
	_, err := env.Worker.Enqueue(ctx, "TestJob", map[string]string{"key": "value"}, "")
	require.NoError(t, err)

	// ジョブをrunningに変更し、grabbed_atを6分前、retry_countをmax_retries（5）に設定
	_, err = env.DBs.Worker.Exec("UPDATE jobs SET status = 'running', grabbed_at = datetime('now', '-6 minutes'), retry_count = 5 WHERE id = 1")
	require.NoError(t, err)

	// スタックジョブを回復
	err = env.Worker.recoverStuckJobs(ctx)
	require.NoError(t, err)

	// ジョブの状態を確認
	job, err := env.Queries.GetJobByID(ctx, 1)
	require.NoError(t, err)

	assert.Equal(t, "failed", job.Status)
	assert.Equal(t, int64(5), job.RetryCount)
}

func TestWorker_RecoverStuckJobs_NotStuck(t *testing.T) {
	registry := NewRegistry()
	registry.Register(&TestJob{
		name:      "TestJob",
		executeFn: func(ctx context.Context, arg json.RawMessage) error { return nil },
	})

	env := setupWorkerTest(t, registry)
	defer env.Cleanup()

	ctx := context.Background()

	// ジョブをエンキュー
	_, err := env.Worker.Enqueue(ctx, "TestJob", map[string]string{"key": "value"}, "")
	require.NoError(t, err)

	// ジョブをrunningに変更するが、grabbed_atは現在時刻（スタックしていない）
	_, err = env.DBs.Worker.Exec("UPDATE jobs SET status = 'running', grabbed_at = datetime('now') WHERE id = 1")
	require.NoError(t, err)

	// スタックジョブを回復（何も変わらないはず）
	err = env.Worker.recoverStuckJobs(ctx)
	require.NoError(t, err)

	// ジョブの状態を確認
	job, err := env.Queries.GetJobByID(ctx, 1)
	require.NoError(t, err)

	// スタックしていないのでrunningのまま
	assert.Equal(t, "running", job.Status)
	assert.Equal(t, int64(0), job.RetryCount)
}

func TestWorker_JobTimeout_Default(t *testing.T) {
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

	env := setupWorkerTest(t, registry)
	defer env.Cleanup()

	ctx := context.Background()

	// Enqueue job
	_, err := env.Worker.Enqueue(ctx, "TestJob", map[string]string{"key": "value"}, "")
	require.NoError(t, err)

	// Process job
	err = env.Worker.processNextJob(ctx)
	require.NoError(t, err)

	assert.True(t, executed)
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

	env := setupWorkerTest(t, registry)
	defer env.Cleanup()

	ctx := context.Background()

	// Enqueue job
	_, err := env.Worker.Enqueue(ctx, "TestJobWithTimeout", map[string]string{"key": "value"}, "")
	require.NoError(t, err)

	// Process job
	err = env.Worker.processNextJob(ctx)
	require.NoError(t, err)

	assert.True(t, executed)
}

func TestWorker_JobTimeout_Exceeded(t *testing.T) {
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

	env := setupWorkerTest(t, registry)
	defer env.Cleanup()

	ctx := context.Background()

	// Enqueue job
	_, err := env.Worker.Enqueue(ctx, "TestJobWithTimeout", map[string]string{"key": "value"}, "")
	require.NoError(t, err)

	// Process job (should timeout)
	err = env.Worker.processNextJob(ctx)
	require.NoError(t, err)

	assert.True(t, executionStarted)

	// Job should be marked for retry after timeout
	job, err := env.Queries.FindNextJob(ctx, time.Now().Add(31*time.Second))
	require.NoError(t, err)

	assert.Equal(t, int64(1), job.RetryCount)
	assert.Equal(t, "pending", job.Status)

	// Error message should indicate timeout
	require.True(t, job.ErrorMessage.Valid)
	assert.True(t, strings.Contains(job.ErrorMessage.String, "deadline exceeded") ||
		strings.Contains(job.ErrorMessage.String, "context deadline exceeded"))
}

func TestWorker_GracefulShutdown_RunningJobCompletes(t *testing.T) {
	jobStarted := make(chan struct{})
	jobFinished := make(chan struct{})

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

	env := setupWorkerTest(t, registry)
	defer env.Cleanup()

	ctx := context.Background()

	// Enqueue a job
	_, err := env.Worker.Enqueue(ctx, "LongJob", nil, "")
	require.NoError(t, err)

	env.Worker.interval = 10 * time.Millisecond
	env.Worker.Start(env.WorkerCtx)

	// Wait for job to start
	select {
	case <-jobStarted:
		// OK
	case <-time.After(1 * time.Second):
		t.Fatal("timeout waiting for job to start")
	}

	// Cancel the main context while the job is running
	env.StopWorker()

	// Wait for the job to finish (it should finish because it uses detached context)
	select {
	case <-jobFinished:
		// OK
	case <-time.After(1 * time.Second):
		t.Fatal("job did not finish in time")
	}

	// Wait for worker to stop
	env.Worker.Wait()

	// Verify the job is marked as completed in the DB
	count, err := env.Queries.CountPendingJobs(ctx)
	require.NoError(t, err)
	assert.Equal(t, int64(0), count, "job should be completed in DB even after main context cancel")
}

func TestWorker_GracefulShutdown_NoNewJobs(t *testing.T) {
	executionCount := 0
	registry := NewRegistry()
	registry.Register(&TestJob{
		name: "QuickJob",
		executeFn: func(ctx context.Context, arg json.RawMessage) error {
			executionCount++
			return nil
		},
	})

	env := setupWorkerTest(t, registry)
	defer env.Cleanup()

	ctx := context.Background()

	// Enqueue 3 jobs
	for i := 0; i < 3; i++ {
		_, _ = env.Worker.Enqueue(ctx, "QuickJob", nil, fmt.Sprintf("job-%d", i))
	}

	env.Worker.interval = 10 * time.Millisecond
	env.Worker.Start(env.WorkerCtx)

	// We want to stop the worker after the first job is fetched or during the interval
	// Give it just enough time to possibly start one job
	time.Sleep(50 * time.Millisecond)
	env.StopWorker()
	env.Worker.Wait()

	// The count should be less than or equal to 3, but definitely stopped
	t.Logf("Executed %d jobs before shutdown", executionCount)

	// If it executed some jobs, ensure they are removed from DB
	count, err := env.Queries.CountPendingJobs(ctx)
	require.NoError(t, err)
	if int64(executionCount)+count != 3 {
		t.Errorf("sum of executed (%d) and pending (%d) jobs should be 3", executionCount, count)
	}
}

func TestWorker_EnqueueWithDepends(t *testing.T) {
	registry := NewRegistry()
	executionOrder := make([]string, 0)
	var mu sync.Mutex

	registry.Register(&TestJob{
		name: "ParentJob",
		executeFn: func(ctx context.Context, arg json.RawMessage) error {
			mu.Lock()
			executionOrder = append(executionOrder, "parent")
			mu.Unlock()
			return nil
		},
	})

	registry.Register(&TestJob{
		name: "ChildJob",
		executeFn: func(ctx context.Context, arg json.RawMessage) error {
			mu.Lock()
			executionOrder = append(executionOrder, "child")
			mu.Unlock()
			return nil
		},
	})

	env := setupWorkerTest(t, registry)
	defer env.Cleanup()

	ctx := context.Background()

	// Enqueue parent job
	parentJobType, err := env.Queries.GetOrCreateJobType(ctx, "ParentJob")
	require.NoError(t, err)

	parentJob, err := env.Queries.EnqueueJob(ctx, workerdb.EnqueueJobParams{
		JobTypeID:  parentJobType.ID,
		Arg:        "{}",
		MaxRetries: 0,
		CreatedAt:  time.Now(),
		RunAfter:   time.Now(),
		DependsOn:  sql.NullString{String: "null", Valid: true},
	})
	require.NoError(t, err)

	// Enqueue child job with dependency
	dependsOn := &DependsOn{
		Dependencies: []Dependency{
			{ID: parentJob.ID, Condition: ConditionCompleted},
		},
		Strategy: StrategyAll,
	}
	dependsJSON, _ := json.Marshal(dependsOn)

	childJobType, err := env.Queries.GetOrCreateJobType(ctx, "ChildJob")
	require.NoError(t, err)

	_, err = env.Queries.EnqueueJob(ctx, workerdb.EnqueueJobParams{
		JobTypeID:  childJobType.ID,
		Arg:        "{}",
		MaxRetries: 5,
		CreatedAt:  time.Now(),
		RunAfter:   time.Now(),
		DependsOn:  sql.NullString{String: string(dependsJSON), Valid: true},
	})
	require.NoError(t, err)

	// Run worker
	env.Worker.interval = 10 * time.Millisecond
	env.Worker.Start(env.WorkerCtx)

	time.Sleep(100 * time.Millisecond)

	env.StopWorker()
	env.Worker.Wait()

	// Verify execution order
	mu.Lock()
	order := make([]string, len(executionOrder))
	copy(order, executionOrder)
	mu.Unlock()

	require.Len(t, order, 2, "Both jobs should be executed")
	assert.Equal(t, "parent", order[0], "Parent should execute first")
	assert.Equal(t, "child", order[1], "Child should execute after parent")
}

func TestWorker_DependencyEvaluation_Failed_Fail(t *testing.T) {
	registry := NewRegistry()

	registry.Register(&TestJob{
		name: "ParentJob",
		executeFn: func(ctx context.Context, arg json.RawMessage) error {
			return fmt.Errorf("parent failed")
		},
	})

	registry.Register(&TestJob{
		name: "ChildJob",
		executeFn: func(ctx context.Context, arg json.RawMessage) error {
			return nil
		},
	})

	env := setupWorkerTest(t, registry)
	defer env.Cleanup()

	ctx := context.Background()

	// Enqueue parent job
	parentJobType, err := env.Queries.GetOrCreateJobType(ctx, "ParentJob")
	require.NoError(t, err)

	parentJob, err := env.Queries.EnqueueJob(ctx, workerdb.EnqueueJobParams{
		JobTypeID:  parentJobType.ID,
		Arg:        "{}",
		MaxRetries: 0,
		CreatedAt:  time.Now(),
		RunAfter:   time.Now(),
		DependsOn:  sql.NullString{String: "null", Valid: true},
	})
	require.NoError(t, err)

	// Enqueue child job with dependency that should fail when parent fails
	dependsOn := &DependsOn{
		Dependencies: []Dependency{
			{ID: parentJob.ID, Condition: ConditionCompleted},
		},
		Strategy: StrategyAll,
	}
	dependsJSON, _ := json.Marshal(dependsOn)

	childJobType, err := env.Queries.GetOrCreateJobType(ctx, "ChildJob")
	require.NoError(t, err)

	childJob, err := env.Queries.EnqueueJob(ctx, workerdb.EnqueueJobParams{
		JobTypeID:  childJobType.ID,
		Arg:        "{}",
		MaxRetries: 5,
		CreatedAt:  time.Now(),
		RunAfter:   time.Now(),
		DependsOn:  sql.NullString{String: string(dependsJSON), Valid: true},
	})
	require.NoError(t, err)

	// Run worker
	env.Worker.interval = 10 * time.Millisecond
	env.Worker.Start(env.WorkerCtx)

	time.Sleep(100 * time.Millisecond)

	env.StopWorker()
	env.Worker.Wait()

	// Verify child job is marked as permanently failed
	jobs, err := env.Queries.GetJobsByIDs(ctx, []int64{childJob.ID})
	require.NoError(t, err)
	require.Len(t, jobs, 1, "Should find exactly one child job")

	childJobResult := jobs[0]

	// Child should be marked as failed due to parent failure
	assert.Equal(t, "failed", childJobResult.Status, "Child should be marked as failed")
	assert.True(t, childJobResult.FinishedAt.Valid, "Child should have finished_at timestamp")
}

func TestWorker_Dependencies_Merge(t *testing.T) {
	registry := NewRegistry()
	registry.Register(&TestJob{
		name:      "TestJob",
		executeFn: func(ctx context.Context, arg json.RawMessage) error { return nil },
	})

	env := setupWorkerTest(t, registry)
	defer env.Cleanup()

	ctx := context.Background()

	// Create parent jobs
	jobType, err := env.Queries.GetOrCreateJobType(ctx, "TestJob")
	require.NoError(t, err)

	parent1, err := env.Queries.EnqueueJob(ctx, workerdb.EnqueueJobParams{
		JobTypeID:  jobType.ID,
		Arg:        "{}",
		MaxRetries: 5,
		CreatedAt:  time.Now(),
		RunAfter:   time.Now(),
		DependsOn:  sql.NullString{String: "null", Valid: true},
	})
	require.NoError(t, err)

	parent2, err := env.Queries.EnqueueJob(ctx, workerdb.EnqueueJobParams{
		JobTypeID:  jobType.ID,
		Arg:        "{}",
		MaxRetries: 5,
		CreatedAt:  time.Now(),
		RunAfter:   time.Now(),
		DependsOn:  sql.NullString{String: "null", Valid: true},
	})
	require.NoError(t, err)

	// Enqueue child job with first dependency
	dependsOn1 := &DependsOn{
		Dependencies: []Dependency{
			{ID: parent1.ID, Condition: ConditionCompleted},
		},
		Strategy: StrategyAll,
	}

	_, err = env.Worker.EnqueueWithDepends(ctx, "TestJob", map[string]string{"key": "value"}, "child-1", dependsOn1)
	require.NoError(t, err)

	// Enqueue again with second dependency (should merge)
	dependsOn2 := &DependsOn{
		Dependencies: []Dependency{
			{ID: parent2.ID, Condition: ConditionCompleted},
		},
		Strategy: StrategyAll,
	}

	_, err = env.Worker.EnqueueWithDepends(ctx, "TestJob", map[string]string{"key": "updated"}, "child-1", dependsOn2)
	require.NoError(t, err)

	// Verify dependencies were merged
	job, err := env.Queries.GetJobByTypeAndUniqkey(ctx, workerdb.GetJobByTypeAndUniqkeyParams{
		JobTypeID: jobType.ID,
		Uniqkey:   sql.NullString{String: "child-1", Valid: true},
	})
	require.NoError(t, err)

	depends, err := ParseDependsOn(job.DependsOn.String)
	require.NoError(t, err)

	assert.Len(t, depends.Dependencies, 2, "Should have 2 dependencies after merge")
	assert.Equal(t, StrategyAll, depends.Strategy, "Should keep StrategyAll")
}

func TestWorker_DependencyEvaluation_StrategyAny(t *testing.T) {
	registry := NewRegistry()
	executionOrder := make([]string, 0)
	var mu sync.Mutex

	registry.Register(&TestJob{
		name: "ParentJob",
		executeFn: func(ctx context.Context, arg json.RawMessage) error {
			mu.Lock()
			executionOrder = append(executionOrder, "parent")
			mu.Unlock()
			return nil
		},
	})

	registry.Register(&TestJob{
		name: "ChildJob",
		executeFn: func(ctx context.Context, arg json.RawMessage) error {
			mu.Lock()
			executionOrder = append(executionOrder, "child")
			mu.Unlock()
			return nil
		},
	})

	env := setupWorkerTest(t, registry)
	defer env.Cleanup()

	ctx := context.Background()

	// Enqueue parent job
	jobType, err := env.Queries.GetOrCreateJobType(ctx, "ParentJob")
	require.NoError(t, err)

	parentJob, err := env.Queries.EnqueueJob(ctx, workerdb.EnqueueJobParams{
		JobTypeID:  jobType.ID,
		Arg:        "{}",
		MaxRetries: 5,
		CreatedAt:  time.Now(),
		RunAfter:   time.Now(),
		DependsOn:  sql.NullString{String: "null", Valid: true},
	})
	require.NoError(t, err)

	// Enqueue a "missing" parent job (ID that doesn't exist)
	missingParentID := parentJob.ID + 10000

	// Enqueue child job with Strategy=any
	dependsOn := &DependsOn{
		Dependencies: []Dependency{
			{ID: parentJob.ID, Condition: ConditionCompleted},
			{ID: missingParentID, Condition: ConditionCompleted},
		},
		Strategy: StrategyAny,
	}
	dependsJSON, _ := json.Marshal(dependsOn)

	jobType, err = env.Queries.GetOrCreateJobType(ctx, "ChildJob")
	require.NoError(t, err)

	childJob, err := env.Queries.EnqueueJob(ctx, workerdb.EnqueueJobParams{
		JobTypeID:  jobType.ID,
		Arg:        "{}",
		MaxRetries: 5,
		CreatedAt:  time.Now(),
		RunAfter:   time.Now(),
		DependsOn:  sql.NullString{String: string(dependsJSON), Valid: true},
	})
	require.NoError(t, err)

	// Run worker
	env.Worker.interval = 10 * time.Millisecond
	env.Worker.Start(env.WorkerCtx)

	time.Sleep(100 * time.Millisecond)

	env.StopWorker()
	env.Worker.Wait()

	// Verify child job was executed (only needed parent to succeed)
	mu.Lock()
	order := make([]string, len(executionOrder))
	copy(order, executionOrder)
	mu.Unlock()

	require.Len(t, order, 2, "Both jobs should be executed")

	// Check child job status
	child, err := env.Queries.GetJobByID(ctx, childJob.ID)
	require.NoError(t, err)
	assert.Equal(t, "completed", child.Status, "Child should complete with any strategy when one parent succeeds")
}

func TestWorker_CircularDependency(t *testing.T) {
	registry := NewRegistry()
	registry.Register(&TestJob{
		name: "TestJob",
		executeFn: func(ctx context.Context, arg json.RawMessage) error {
			return nil
		},
	})

	env := setupWorkerTest(t, registry)
	defer env.Cleanup()

	ctx := context.Background()

	jobType, err := env.Queries.GetOrCreateJobType(ctx, "TestJob")
	require.NoError(t, err)

	// Create a chain: Job1 -> Job2 -> Job1 (circular)
	job1, err := env.Queries.EnqueueJob(ctx, workerdb.EnqueueJobParams{
		JobTypeID:  jobType.ID,
		Arg:        "{}",
		MaxRetries: 5,
		CreatedAt:  time.Now(),
		RunAfter:   time.Now(),
		DependsOn:  sql.NullString{String: "null", Valid: true},
	})
	require.NoError(t, err)

	job2, err := env.Queries.EnqueueJob(ctx, workerdb.EnqueueJobParams{
		JobTypeID:  jobType.ID,
		Arg:        "{}",
		MaxRetries: 5,
		CreatedAt:  time.Now(),
		RunAfter:   time.Now(),
		DependsOn:  sql.NullString{String: "null", Valid: true},
	})
	require.NoError(t, err)

	// Now make job2 depend on job1
	dependsOn1 := &DependsOn{
		Dependencies: []Dependency{{ID: job1.ID, Condition: ConditionCompleted}},
		Strategy:     StrategyAll,
	}
	dependsJSON1, _ := json.Marshal(dependsOn1)

	err = env.Queries.UpdateJobForEnqueue(ctx, workerdb.UpdateJobForEnqueueParams{
		Arg:       "{}",
		DependsOn: sql.NullString{String: string(dependsJSON1), Valid: true},
		RunAfter:  time.Now(),
		CreatedAt: time.Now(),
		ID:        job2.ID,
	})
	require.NoError(t, err)

	// Make job1 depend on job2 (circular)
	dependsOn2 := &DependsOn{
		Dependencies: []Dependency{{ID: job2.ID, Condition: ConditionCompleted}},
		Strategy:     StrategyAll,
	}
	dependsJSON2, _ := json.Marshal(dependsOn2)

	err = env.Queries.UpdateJobForEnqueue(ctx, workerdb.UpdateJobForEnqueueParams{
		Arg:       "{}",
		DependsOn: sql.NullString{String: string(dependsJSON2), Valid: true},
		RunAfter:  time.Now(),
		CreatedAt: time.Now(),
		ID:        job1.ID,
	})
	require.NoError(t, err)

	// Build dependency graph for detection
	jobDependencies := map[int64][]int64{
		job1.ID: {job2.ID},
		job2.ID: {job1.ID},
	}

	// Detect circular dependency
	visited := make(map[int64]bool)
	inPath := make(map[int64]bool)
	hasCycle := DetectCircularDependency(job1.ID, jobDependencies, visited, inPath)

	assert.True(t, hasCycle, "Should detect circular dependency")

	// Run worker to see how it handles circular deps
	env.Worker.interval = 10 * time.Millisecond
	env.Worker.Start(env.WorkerCtx)

	time.Sleep(300 * time.Millisecond)
	env.StopWorker()
	env.Worker.Wait()

	// With circular deps, jobs should get stuck and fail
	// Jobs should either remain pending or fail
	jobs, err := env.Queries.ListJobs(ctx, workerdb.ListJobsParams{Limit: 10, Offset: 0})
	require.NoError(t, err)

	// Jobs should be in pending or failed state (not completed due to circular dep)
	for _, job := range jobs {
		assert.NotEqual(t, "running", job.Status, "Job should not stay in running state")
	}
}

func TestWorker_MarkJobCompleted_ReEnqueued(t *testing.T) {
	registry := NewRegistry()

	jobStarted := make(chan struct{})
	jobCanComplete := make(chan struct{})
	executionCount := 0
	var mu sync.Mutex

	registry.Register(&TestJob{
		name: "ReEnqueueJob",
		executeFn: func(ctx context.Context, arg json.RawMessage) error {
			mu.Lock()
			executionCount++
			currentCount := executionCount
			mu.Unlock()

			if currentCount == 1 {
				// First execution
				close(jobStarted)
				<-jobCanComplete
			}
			// Second execution completes immediately
			return nil
		},
	})

	env := setupWorkerTest(t, registry)
	defer env.Cleanup()

	ctx := context.Background()

	// Enqueue initial job
	_, err := env.Worker.Enqueue(ctx, "ReEnqueueJob", nil, "re-enqueue-test")
	require.NoError(t, err)

	// Start worker
	env.Worker.interval = 10 * time.Millisecond
	env.Worker.Start(env.WorkerCtx)

	// Wait for job to start
	<-jobStarted

	// Re-enqueue the same job while it's running
	// This will update created_at to be > grabbed_at
	_, err = env.Worker.Enqueue(ctx, "ReEnqueueJob", nil, "re-enqueue-test")
	require.NoError(t, err)

	// Allow first execution to complete
	close(jobCanComplete)

	// Wait for job to be re-executed
	time.Sleep(200 * time.Millisecond)

	env.StopWorker()
	env.Worker.Wait()

	// Verify the job was executed twice
	mu.Lock()
	count := executionCount
	mu.Unlock()

	assert.Equal(t, 2, count, "Job should have been executed twice (initial run + re-enqueue)")

	// Verify final job status is completed
	jobType, err := env.Queries.GetOrCreateJobType(ctx, "ReEnqueueJob")
	require.NoError(t, err)

	job, err := env.Queries.GetJobByTypeAndUniqkey(ctx, workerdb.GetJobByTypeAndUniqkeyParams{
		JobTypeID: jobType.ID,
		Uniqkey:   sql.NullString{String: "re-enqueue-test", Valid: true},
	})
	require.NoError(t, err)

	assert.Equal(t, "completed", job.Status, "Job should be completed after re-execution")
}

func TestWorker_CleanupCompletedJobs(t *testing.T) {
	env := setupWorkerTest(t, nil)
	defer env.Cleanup()

	ctx := context.Background()

	// Create job type
	jobType, err := env.Queries.GetOrCreateJobType(ctx, "CleanupTestJob")
	require.NoError(t, err)

	// Create old completed job (25 hours ago)
	oldFinishedAt := time.Now().Add(-25 * time.Hour)
	oldJob, err := env.Queries.EnqueueJob(ctx, workerdb.EnqueueJobParams{
		JobTypeID:  jobType.ID,
		Arg:        "{}",
		MaxRetries: 0,
		CreatedAt:  oldFinishedAt.Add(-1 * time.Hour),
		RunAfter:   oldFinishedAt.Add(-1 * time.Hour),
		DependsOn:  sql.NullString{String: "null", Valid: true},
	})
	require.NoError(t, err)

	// Mark old job as completed
	err = env.Queries.MarkJobCompleted(ctx, workerdb.MarkJobCompletedParams{
		FinishedAt: sql.NullTime{Time: oldFinishedAt, Valid: true},
		ID:         oldJob.ID,
	})
	require.NoError(t, err)

	// Manually update the finished_at to be 25 hours ago (simulate old job)
	_, err = env.DBs.Worker.Exec("UPDATE jobs SET finished_at = ?, status = 'completed' WHERE id = ?", oldFinishedAt, oldJob.ID)
	require.NoError(t, err)

	// Create recent completed job (1 hour ago)
	recentFinishedAt := time.Now().Add(-1 * time.Hour)
	recentJob, err := env.Queries.EnqueueJob(ctx, workerdb.EnqueueJobParams{
		JobTypeID:  jobType.ID,
		Arg:        "{}",
		MaxRetries: 0,
		CreatedAt:  recentFinishedAt.Add(-1 * time.Hour),
		RunAfter:   recentFinishedAt.Add(-1 * time.Hour),
		DependsOn:  sql.NullString{String: "null", Valid: true},
	})
	require.NoError(t, err)

	// Mark recent job as completed
	err = env.Queries.MarkJobCompleted(ctx, workerdb.MarkJobCompletedParams{
		FinishedAt: sql.NullTime{Time: recentFinishedAt, Valid: true},
		ID:         recentJob.ID,
	})
	require.NoError(t, err)

	// Manually update the finished_at to be 1 hour ago
	_, err = env.DBs.Worker.Exec("UPDATE jobs SET finished_at = ?, status = 'completed' WHERE id = ?", recentFinishedAt, recentJob.ID)
	require.NoError(t, err)

	// Verify both jobs exist
	countBefore, err := env.Queries.CountJobs(ctx)
	require.NoError(t, err)
	assert.Equal(t, int64(2), countBefore, "Should have 2 jobs before cleanup")

	// Run cleanup
	err = env.Worker.CleanupCompletedJobs(ctx)
	require.NoError(t, err)

	// Verify old job was deleted and recent job still exists
	countAfter, err := env.Queries.CountJobs(ctx)
	require.NoError(t, err)
	assert.Equal(t, int64(1), countAfter, "Should have 1 job after cleanup (old job deleted)")

	// Verify the remaining job is the recent one
	jobs, err := env.Queries.ListJobs(ctx, workerdb.ListJobsParams{Limit: 10, Offset: 0})
	require.NoError(t, err)
	require.Len(t, jobs, 1)
	assert.Equal(t, recentJob.ID, jobs[0].ID, "Remaining job should be the recent one")
}

func TestWorker_DependencyEvaluation_Failed_Ignore(t *testing.T) {
	registry := NewRegistry()

	var mu sync.Mutex
	executionOrder := []string{}

	registry.Register(&TestJob{
		name: "ParentJob",
		executeFn: func(ctx context.Context, arg json.RawMessage) error {
			mu.Lock()
			executionOrder = append(executionOrder, "parent")
			mu.Unlock()
			return fmt.Errorf("parent failed")
		},
	})

	registry.Register(&TestJob{
		name: "ChildJob",
		executeFn: func(ctx context.Context, arg json.RawMessage) error {
			mu.Lock()
			executionOrder = append(executionOrder, "child")
			mu.Unlock()
			return nil
		},
	})

	env := setupWorkerTest(t, registry)
	defer env.Cleanup()

	ctx := context.Background()

	// Enqueue parent job
	parentJobType, err := env.Queries.GetOrCreateJobType(ctx, "ParentJob")
	require.NoError(t, err)

	parentJob, err := env.Queries.EnqueueJob(ctx, workerdb.EnqueueJobParams{
		JobTypeID:  parentJobType.ID,
		Arg:        "{}",
		MaxRetries: 0,
		CreatedAt:  time.Now(),
		RunAfter:   time.Now(),
		DependsOn:  sql.NullString{String: "null", Valid: true},
	})
	require.NoError(t, err)

	// Enqueue child job with dependency that uses ConditionFinished
	// Child should execute even when parent fails, because ConditionFinished only waits for parent to finish
	dependsOn := &DependsOn{
		Dependencies: []Dependency{
			{ID: parentJob.ID, Condition: ConditionFinished},
		},
		Strategy: StrategyAll,
	}
	dependsJSON, _ := json.Marshal(dependsOn)

	childJobType, err := env.Queries.GetOrCreateJobType(ctx, "ChildJob")
	require.NoError(t, err)

	childJob, err := env.Queries.EnqueueJob(ctx, workerdb.EnqueueJobParams{
		JobTypeID:  childJobType.ID,
		Arg:        "{}",
		MaxRetries: 5,
		CreatedAt:  time.Now(),
		RunAfter:   time.Now(),
		DependsOn:  sql.NullString{String: string(dependsJSON), Valid: true},
	})
	require.NoError(t, err)

	// Run worker
	env.Worker.interval = 10 * time.Millisecond
	env.Worker.Start(env.WorkerCtx)

	time.Sleep(100 * time.Millisecond)

	env.StopWorker()
	env.Worker.Wait()

	// Verify execution order: parent should run and fail, child should still execute
	mu.Lock()
	order := make([]string, len(executionOrder))
	copy(order, executionOrder)
	mu.Unlock()

	require.Len(t, order, 2, "Both parent and child should have executed")
	assert.Equal(t, "parent", order[0], "Parent should execute first")
	assert.Equal(t, "child", order[1], "Child should execute after parent, despite parent failure")

	// Verify parent is failed
	jobs, err := env.Queries.GetJobsByIDs(ctx, []int64{parentJob.ID})
	require.NoError(t, err)
	require.Len(t, jobs, 1)
	assert.Equal(t, "failed", jobs[0].Status, "Parent should be failed")

	// Verify child is completed
	jobs, err = env.Queries.GetJobsByIDs(ctx, []int64{childJob.ID})
	require.NoError(t, err)
	require.Len(t, jobs, 1)
	assert.Equal(t, "completed", jobs[0].Status, "Child should be completed despite parent failure")
}

func TestWorker_DependencyEvaluation_ConditionFinished(t *testing.T) {
	registry := NewRegistry()

	var mu sync.Mutex
	executionOrder := []string{}

	registry.Register(&TestJob{
		name: "FailingParentJob",
		executeFn: func(ctx context.Context, arg json.RawMessage) error {
			mu.Lock()
			executionOrder = append(executionOrder, "failing-parent")
			mu.Unlock()
			return fmt.Errorf("parent failed")
		},
	})

	registry.Register(&TestJob{
		name: "SuccessfulParentJob",
		executeFn: func(ctx context.Context, arg json.RawMessage) error {
			mu.Lock()
			executionOrder = append(executionOrder, "successful-parent")
			mu.Unlock()
			return nil
		},
	})

	registry.Register(&TestJob{
		name: "ChildJob",
		executeFn: func(ctx context.Context, arg json.RawMessage) error {
			mu.Lock()
			executionOrder = append(executionOrder, "child")
			mu.Unlock()
			return nil
		},
	})

	env := setupWorkerTest(t, registry)
	defer env.Cleanup()

	ctx := context.Background()

	// Enqueue failing parent job
	failingParentJobType, err := env.Queries.GetOrCreateJobType(ctx, "FailingParentJob")
	require.NoError(t, err)

	failingParentJob, err := env.Queries.EnqueueJob(ctx, workerdb.EnqueueJobParams{
		JobTypeID:  failingParentJobType.ID,
		Arg:        "{}",
		MaxRetries: 0,
		CreatedAt:  time.Now(),
		RunAfter:   time.Now(),
		DependsOn:  sql.NullString{String: "null", Valid: true},
	})
	require.NoError(t, err)

	// Enqueue successful parent job
	successfulParentJobType, err := env.Queries.GetOrCreateJobType(ctx, "SuccessfulParentJob")
	require.NoError(t, err)

	successfulParentJob, err := env.Queries.EnqueueJob(ctx, workerdb.EnqueueJobParams{
		JobTypeID:  successfulParentJobType.ID,
		Arg:        "{}",
		MaxRetries: 0,
		CreatedAt:  time.Now(),
		RunAfter:   time.Now(),
		DependsOn:  sql.NullString{String: "null", Valid: true},
	})
	require.NoError(t, err)

	// Enqueue child job that depends on both parents with ConditionFinished
	// Child should execute when both parents are finished (regardless of success/failure)
	dependsOn := &DependsOn{
		Dependencies: []Dependency{
			{ID: failingParentJob.ID, Condition: ConditionFinished},
			{ID: successfulParentJob.ID, Condition: ConditionFinished},
		},
		Strategy: StrategyAll,
	}
	dependsJSON, _ := json.Marshal(dependsOn)

	childJobType, err := env.Queries.GetOrCreateJobType(ctx, "ChildJob")
	require.NoError(t, err)

	childJob, err := env.Queries.EnqueueJob(ctx, workerdb.EnqueueJobParams{
		JobTypeID:  childJobType.ID,
		Arg:        "{}",
		MaxRetries: 5,
		CreatedAt:  time.Now(),
		RunAfter:   time.Now(),
		DependsOn:  sql.NullString{String: string(dependsJSON), Valid: true},
	})
	require.NoError(t, err)

	// Run worker
	env.Worker.interval = 10 * time.Millisecond
	env.Worker.Start(env.WorkerCtx)

	time.Sleep(100 * time.Millisecond)

	env.StopWorker()
	env.Worker.Wait()

	// Verify execution order: both parents should run, then child
	mu.Lock()
	order := make([]string, len(executionOrder))
	copy(order, executionOrder)
	mu.Unlock()

	require.Len(t, order, 3, "All three jobs should have executed")
	// Order of parents is not guaranteed, but child should be last
	assert.Contains(t, order[:2], "failing-parent", "Failing parent should execute")
	assert.Contains(t, order[:2], "successful-parent", "Successful parent should execute")
	assert.Equal(t, "child", order[2], "Child should execute after both parents finish")

	// Verify child is completed
	jobs, err := env.Queries.GetJobsByIDs(ctx, []int64{childJob.ID})
	require.NoError(t, err)
	require.Len(t, jobs, 1)
	assert.Equal(t, "completed", jobs[0].Status, "Child should be completed after both parents finished")
}

func TestWorker_UpdateJobForEnqueue_Running(t *testing.T) {
	registry := NewRegistry()

	jobStarted := make(chan struct{}, 2)     // Buffer for 2 executions
	jobCanComplete := make(chan struct{}, 2) // Buffer for 2 executions

	registry.Register(&TestJob{
		name: "LongRunningJob",
		executeFn: func(ctx context.Context, arg json.RawMessage) error {
			jobStarted <- struct{}{}
			<-jobCanComplete
			return nil
		},
	})

	env := setupWorkerTest(t, registry)
	defer env.Cleanup()

	ctx := context.Background()

	// Enqueue job
	_, err := env.Worker.Enqueue(ctx, "LongRunningJob", nil, "running-update-test")
	require.NoError(t, err)

	// Start worker
	env.Worker.interval = 10 * time.Millisecond
	env.Worker.Start(env.WorkerCtx)

	// Wait for job to start
	<-jobStarted

	// Get job ID
	jobType, err := env.Queries.GetOrCreateJobType(ctx, "LongRunningJob")
	require.NoError(t, err)

	job, err := env.Queries.GetJobByTypeAndUniqkey(ctx, workerdb.GetJobByTypeAndUniqkeyParams{
		JobTypeID: jobType.ID,
		Uniqkey:   sql.NullString{String: "running-update-test", Valid: true},
	})
	require.NoError(t, err)
	assert.Equal(t, "running", job.Status, "Job should be running")

	// Update the running job (simulate re-enqueue)
	err = env.Queries.UpdateJobForEnqueue(ctx, workerdb.UpdateJobForEnqueueParams{
		Arg:       "{\"updated\": true}",
		DependsOn: sql.NullString{String: "null", Valid: true},
		RunAfter:  time.Now(),
		CreatedAt: time.Now(),
		ID:        job.ID,
	})
	require.NoError(t, err)

	// Verify job is still running (not reset to pending)
	updatedJob, err := env.Queries.GetJobByID(ctx, job.ID)
	require.NoError(t, err)
	assert.Equal(t, "running", updatedJob.Status, "Job should remain running after update")

	// Verify created_at was updated (should be greater than grabbed_at)
	assert.True(t, updatedJob.CreatedAt.After(updatedJob.GrabbedAt.Time),
		"created_at should be after grabbed_at (re-enqueue marker)")

	// Allow first execution to complete
	jobCanComplete <- struct{}{}

	// Wait briefly for MarkJobCompleted to execute and job to be reset to pending
	time.Sleep(30 * time.Millisecond)

	// Verify job was reset to pending after completion (because created_at > grabbed_at)
	// OR it might already be running the second execution
	resetJob, err := env.Queries.GetJobByID(ctx, job.ID)
	require.NoError(t, err)
	// The status should be either pending (waiting for re-execution) or running (already started re-execution)
	assert.Contains(t, []string{"pending", "running"}, resetJob.Status,
		"Job should be pending or running after completion (because it was updated during execution)")

	// Wait for second execution to start
	<-jobStarted
	// Allow second execution to complete
	jobCanComplete <- struct{}{}

	time.Sleep(30 * time.Millisecond)

	env.StopWorker()
	env.Worker.Wait()

	// Final status should be completed
	finalJob, err := env.Queries.GetJobByID(ctx, job.ID)
	require.NoError(t, err)
	assert.Equal(t, "completed", finalJob.Status, "Job should be completed after second execution")
}

func TestWorker_GrabJob_Concurrency(t *testing.T) {
	env := setupWorkerTest(t, nil)
	defer env.Cleanup()

	ctx := context.Background()

	// Create a job
	jobType, err := env.Queries.GetOrCreateJobType(ctx, "TestJob")
	require.NoError(t, err)

	job, err := env.Queries.EnqueueJob(ctx, workerdb.EnqueueJobParams{
		JobTypeID:  jobType.ID,
		Arg:        "{}",
		MaxRetries: 0,
		CreatedAt:  time.Now(),
		RunAfter:   time.Now(),
		DependsOn:  sql.NullString{String: "null", Valid: true},
	})
	require.NoError(t, err)

	// First grab should succeed
	result1, err := env.Queries.GrabJob(ctx, workerdb.GrabJobParams{
		GrabbedAt: sql.NullTime{Time: time.Now(), Valid: true},
		ID:        job.ID,
	})
	require.NoError(t, err)
	rows1, err := result1.RowsAffected()
	require.NoError(t, err)
	assert.Equal(t, int64(1), rows1, "First grab should succeed")

	// Verify job status is running
	grabbedJob, err := env.Queries.GetJobByID(ctx, job.ID)
	require.NoError(t, err)
	assert.Equal(t, "running", grabbedJob.Status, "Job should be in running status after first grab")

	// Second grab should fail (0 rows affected) because job is already running
	result2, err := env.Queries.GrabJob(ctx, workerdb.GrabJobParams{
		GrabbedAt: sql.NullTime{Time: time.Now(), Valid: true},
		ID:        job.ID,
	})
	require.NoError(t, err)
	rows2, err := result2.RowsAffected()
	require.NoError(t, err)
	assert.Equal(t, int64(0), rows2, "Second grab should fail (0 rows affected) because job is already running")
}

func TestWorker_EnqueueWithDepends_Concurrency(t *testing.T) {
	registry := NewRegistry()

	var mu sync.Mutex
	executionCount := 0

	registry.Register(&TestJob{
		name: "DependentJob",
		executeFn: func(ctx context.Context, arg json.RawMessage) error {
			mu.Lock()
			executionCount++
			mu.Unlock()
			return nil
		},
	})

	env := setupWorkerTest(t, registry)
	defer env.Cleanup()

	ctx := context.Background()

	// Create parent job
	parentJobType, err := env.Queries.GetOrCreateJobType(ctx, "DependentJob")
	require.NoError(t, err)

	parentJob, err := env.Queries.EnqueueJob(ctx, workerdb.EnqueueJobParams{
		JobTypeID:  parentJobType.ID,
		Arg:        "{}",
		MaxRetries: 0,
		CreatedAt:  time.Now(),
		RunAfter:   time.Now(),
		DependsOn:  sql.NullString{String: "null", Valid: true},
	})
	require.NoError(t, err)

	// Complete parent job immediately
	err = env.Queries.MarkJobCompleted(ctx, workerdb.MarkJobCompletedParams{
		FinishedAt: sql.NullTime{Time: time.Now(), Valid: true},
		ID:         parentJob.ID,
	})
	require.NoError(t, err)

	// Enqueue child job with same uniqkey multiple times
	// This tests that the transaction logic correctly handles re-enqueuing
	dependsOn := &DependsOn{
		Dependencies: []Dependency{
			{ID: parentJob.ID, Condition: ConditionCompleted},
		},
		Strategy: StrategyAll,
	}

	// First enqueue
	_, err = env.Worker.EnqueueWithDepends(ctx, "DependentJob", nil, "reused-child", dependsOn)
	require.NoError(t, err)

	// Get the job
	job1, err := env.Queries.GetJobByTypeAndUniqkey(ctx, workerdb.GetJobByTypeAndUniqkeyParams{
		JobTypeID: parentJobType.ID,
		Uniqkey:   sql.NullString{String: "reused-child", Valid: true},
	})
	require.NoError(t, err)
	firstJobID := job1.ID

	// Second enqueue with same uniqkey should update the existing job
	_, err = env.Worker.EnqueueWithDepends(ctx, "DependentJob", map[string]string{"updated": "true"}, "reused-child", dependsOn)
	require.NoError(t, err)

	// Verify only one job exists with the uniqkey
	job2, err := env.Queries.GetJobByTypeAndUniqkey(ctx, workerdb.GetJobByTypeAndUniqkeyParams{
		JobTypeID: parentJobType.ID,
		Uniqkey:   sql.NullString{String: "reused-child", Valid: true},
	})
	require.NoError(t, err)
	assert.Equal(t, firstJobID, job2.ID, "Should be the same job ID (updated, not newly created)")
	assert.Contains(t, job2.Arg, "updated", "Job argument should be updated")

	// Count total jobs - should still be 2 (parent + child)
	totalJobs, err := env.Queries.CountJobs(ctx)
	require.NoError(t, err)
	assert.Equal(t, int64(2), totalJobs, "Should have exactly 2 jobs (parent + child, not duplicated)")

	// Run worker to execute the child job
	env.Worker.interval = 10 * time.Millisecond
	env.Worker.Start(env.WorkerCtx)

	time.Sleep(100 * time.Millisecond)

	env.StopWorker()
	env.Worker.Wait()

	// Verify child job was executed exactly once
	mu.Lock()
	execCount := executionCount
	mu.Unlock()

	assert.Equal(t, 1, execCount, "Child job should be executed exactly once despite multiple enqueues")
}

func TestWorker_Registry(t *testing.T) {
	registry := NewRegistry()
	registry.Register(&TestJob{
		name:      "TestJob",
		executeFn: func(ctx context.Context, arg json.RawMessage) error { return nil },
	})

	env := setupWorkerTest(t, registry)
	defer env.Cleanup()

	// Registry() メソッドが正しくRegistryを返すことを確認
	gotRegistry := env.Worker.Registry()
	require.NotNil(t, gotRegistry, "Registry() should return non-nil registry")
	assert.Equal(t, registry, gotRegistry, "Registry() should return the same registry instance")

	// 返されたRegistryが実際に機能していることを確認
	handler, ok := gotRegistry.Get("TestJob")
	assert.True(t, ok, "Should find TestJob in returned registry")
	assert.NotNil(t, handler, "Handler should not be nil")
	assert.Equal(t, "TestJob", handler.Name(), "Handler should have correct name")
}
