package jobqueue

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"testing"
	"time"

	workerdb "github.com/cho45/hanrangon/backend/model/workerdb"
	_ "github.com/mattn/go-sqlite3"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

// このファイルは MarkJobCompleted の実行中再エンキュー検出ロジックに関する
// エッジケースと境界条件をテストする。
//
// テスト対象の実装:
//   UPDATE jobs SET
//     status = CASE WHEN created_at > grabbed_at THEN 'pending' ELSE 'completed' END,
//     ...
//   WHERE id = ?;
//
// 設計の重要なポイント:
// - SQLiteのSET句は全て「更新前の値」を参照するため、grabbed_at = NULL の後でも
//   CASE式は元の grabbed_at を使用する
// - created_at > grabbed_at により、実行中の再エンキューを検出
// - 検出された場合、ジョブは pending に戻り、最新の引数で再実行される

// TestMarkJobCompleted_EdgeCases は MarkJobCompleted の境界条件をテストする
func TestMarkJobCompleted_EdgeCases(t *testing.T) {
	tests := []struct {
		name           string
		setupFn        func(ctx context.Context, env *workerTestEnv, jobID int64)
		expectedStatus string
		description    string
	}{
		{
			name: "created_at equals grabbed_at",
			setupFn: func(ctx context.Context, env *workerTestEnv, jobID int64) {
				// created_at と grabbed_at を同じ値に設定
				now := time.Now()
				_, err := env.DBs.Worker.Exec(
					"UPDATE jobs SET created_at = ?, grabbed_at = ? WHERE id = ?",
					now, now, jobID,
				)
				require.NoError(t, err)
			},
			expectedStatus: "completed",
			description:    "created_at == grabbed_at の場合は completed になるべき",
		},
		{
			name: "created_at 1ms before grabbed_at",
			setupFn: func(ctx context.Context, env *workerTestEnv, jobID int64) {
				now := time.Now()
				createdAt := now.Add(-1 * time.Millisecond)
				_, err := env.DBs.Worker.Exec(
					"UPDATE jobs SET created_at = ?, grabbed_at = ? WHERE id = ?",
					createdAt, now, jobID,
				)
				require.NoError(t, err)
			},
			expectedStatus: "completed",
			description:    "created_at < grabbed_at の場合は completed になるべき",
		},
		{
			name: "created_at 1ms after grabbed_at",
			setupFn: func(ctx context.Context, env *workerTestEnv, jobID int64) {
				now := time.Now()
				createdAt := now.Add(1 * time.Millisecond)
				_, err := env.DBs.Worker.Exec(
					"UPDATE jobs SET created_at = ?, grabbed_at = ? WHERE id = ?",
					createdAt, now, jobID,
				)
				require.NoError(t, err)
			},
			expectedStatus: "pending",
			description:    "created_at > grabbed_at の場合は pending に戻るべき（再エンキュー検出）",
		},
		{
			name: "created_at significantly after grabbed_at",
			setupFn: func(ctx context.Context, env *workerTestEnv, jobID int64) {
				now := time.Now()
				createdAt := now.Add(10 * time.Second)
				_, err := env.DBs.Worker.Exec(
					"UPDATE jobs SET created_at = ?, grabbed_at = ? WHERE id = ?",
					createdAt, now, jobID,
				)
				require.NoError(t, err)
			},
			expectedStatus: "pending",
			description:    "created_at が grabbed_at より大幅に後の場合も pending に戻るべき",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			registry := NewRegistry()
			registry.Register(&TestJob{
				name:      "TestJob",
				executeFn: func(ctx context.Context, arg json.RawMessage) error { return nil },
			})

			env := setupWorkerTest(t, registry)
			defer env.Cleanup()

			ctx := context.Background()

			// ジョブをエンキュー
			job, err := env.Worker.Enqueue(ctx, "TestJob", map[string]string{"key": "value"}, "")
			require.NoError(t, err)

			// GrabJob でジョブを取得（これにより grabbed_at が設定される）
			res, err := env.Queries.GrabJob(ctx, workerdb.GrabJobParams{
				GrabbedAt: sql.NullTime{Time: time.Now(), Valid: true},
				ID:        job.ID,
			})
			require.NoError(t, err)
			rows, err := res.RowsAffected()
			require.NoError(t, err)
			require.Equal(t, int64(1), rows)

			// テストケース固有のセットアップ
			tt.setupFn(ctx, env, job.ID)

			// 状態を確認
			beforeJob, err := env.Queries.GetJobByID(ctx, job.ID)
			require.NoError(t, err)
			t.Logf("Before MarkJobCompleted: created_at=%v, grabbed_at=%v, diff=%v",
				beforeJob.CreatedAt, beforeJob.GrabbedAt.Time,
				beforeJob.CreatedAt.Sub(beforeJob.GrabbedAt.Time))

			// MarkJobCompleted を実行
			err = env.Queries.MarkJobCompleted(ctx, workerdb.MarkJobCompletedParams{
				ID:         job.ID,
				FinishedAt: sql.NullTime{Time: time.Now(), Valid: true},
			})
			require.NoError(t, err)

			// 結果を確認
			resultJob, err := env.Queries.GetJobByID(ctx, job.ID)
			require.NoError(t, err)

			assert.Equal(t, tt.expectedStatus, resultJob.Status, tt.description)

			if tt.expectedStatus == "pending" {
				assert.False(t, resultJob.FinishedAt.Valid, "pending に戻った場合は finished_at は NULL であるべき")
				assert.Equal(t, int64(0), resultJob.RetryCount, "pending に戻った場合は retry_count はリセットされるべき")
			} else {
				assert.True(t, resultJob.FinishedAt.Valid, "completed の場合は finished_at が設定されているべき")
			}
		})
	}
}

// TestUpdateJobForEnqueue_MultipleUpdatesWhileRunning は
// 実行中に複数回再エンキューされた場合の挙動をテストする
func TestUpdateJobForEnqueue_MultipleUpdatesWhileRunning(t *testing.T) {
	registry := NewRegistry()

	executionCount := 0
	jobStarted := make(chan struct{}, 5)
	jobCanComplete := make(chan struct{}, 5)

	registry.Register(&TestJob{
		name: "MultiUpdateJob",
		executeFn: func(ctx context.Context, arg json.RawMessage) error {
			executionCount++
			jobStarted <- struct{}{}
			<-jobCanComplete
			return nil
		},
	})

	env := setupWorkerTest(t, registry)
	defer env.Cleanup()

	ctx := context.Background()

	// 初回エンキュー
	job, err := env.Worker.Enqueue(ctx, "MultiUpdateJob", map[string]int{"version": 1}, "multi-update-test")
	require.NoError(t, err)
	t.Logf("Initial job ID: %d", job.ID)

	// Worker 開始
	env.Worker.interval = 10 * time.Millisecond
	env.Worker.Start(env.WorkerCtx)

	// 最初の実行開始を待つ
	<-jobStarted
	t.Log("First execution started")

	// 実行中に3回再エンキュー
	for i := 2; i <= 4; i++ {
		time.Sleep(5 * time.Millisecond)
		updatedJob, err := env.Worker.Enqueue(ctx, "MultiUpdateJob", map[string]int{"version": i}, "multi-update-test")
		require.NoError(t, err)
		assert.Equal(t, job.ID, updatedJob.ID, "同じ uniqkey なので ID は変わらないべき")
		t.Logf("Re-enqueued with version %d", i)
	}

	// 最初の実行を完了させる
	jobCanComplete <- struct{}{}
	t.Log("First execution completed")

	// 2回目の実行開始を待つ
	<-jobStarted
	t.Log("Second execution started")

	// 2回目の実行を完了させる
	jobCanComplete <- struct{}{}
	t.Log("Second execution completed")

	time.Sleep(50 * time.Millisecond)

	env.StopWorker()
	env.Worker.Wait()

	// 最終状態を確認
	finalJob, err := env.Queries.GetJobByID(ctx, job.ID)
	require.NoError(t, err)

	// 少なくとも2回実行されているべき（初回 + 再エンキュー後）
	assert.GreaterOrEqual(t, executionCount, 2, "最低2回は実行されるべき")

	// 最終的には completed になるべき
	assert.Equal(t, "completed", finalJob.Status, "最終的には completed になるべき")

	t.Logf("Total executions: %d", executionCount)
}

// TestUpdateJobForEnqueue_StatusTransitions は
// 各ステータスからの UpdateJobForEnqueue の挙動をテストする
func TestUpdateJobForEnqueue_StatusTransitions(t *testing.T) {
	tests := []struct {
		name           string
		initialStatus  string
		expectedStatus string
		description    string
	}{
		{
			name:           "pending to pending",
			initialStatus:  "pending",
			expectedStatus: "pending",
			description:    "pending 状態からの更新は pending のまま",
		},
		{
			name:           "running to running",
			initialStatus:  "running",
			expectedStatus: "running",
			description:    "running 状態からの更新は running のまま（実行中再エンキュー）",
		},
		{
			name:           "completed to pending",
			initialStatus:  "completed",
			expectedStatus: "pending",
			description:    "completed 状態からの更新は pending に戻る",
		},
		{
			name:           "failed to pending",
			initialStatus:  "failed",
			expectedStatus: "pending",
			description:    "failed 状態からの更新は pending に戻る",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			env := setupWorkerTest(t, nil)
			defer env.Cleanup()

			ctx := context.Background()

			// ジョブを作成
			jobType, err := env.Queries.GetOrCreateJobType(ctx, "TestJob")
			require.NoError(t, err)

			job, err := env.Queries.EnqueueJob(ctx, workerdb.EnqueueJobParams{
				JobTypeID:  jobType.ID,
				Arg:        "{}",
				Uniqkey:    sql.NullString{String: "status-test", Valid: true},
				MaxRetries: 5,
				CreatedAt:  time.Now(),
				RunAfter:   time.Now(),
				DependsOn:  sql.NullString{String: "null", Valid: true},
			})
			require.NoError(t, err)

			// 初期ステータスに設定
			_, err = env.DBs.Worker.Exec(
				"UPDATE jobs SET status = ?, finished_at = ? WHERE id = ?",
				tt.initialStatus,
				sql.NullTime{Time: time.Now(), Valid: tt.initialStatus == "completed" || tt.initialStatus == "failed"},
				job.ID,
			)
			require.NoError(t, err)

			// UpdateJobForEnqueue を実行
			err = env.Queries.UpdateJobForEnqueue(ctx, workerdb.UpdateJobForEnqueueParams{
				Arg:       "{\"updated\": true}",
				DependsOn: sql.NullString{String: "null", Valid: true},
				RunAfter:  time.Now(),
				CreatedAt: time.Now(),
				ID:        job.ID,
			})
			require.NoError(t, err)

			// 結果を確認
			updatedJob, err := env.Queries.GetJobByID(ctx, job.ID)
			require.NoError(t, err)

			assert.Equal(t, tt.expectedStatus, updatedJob.Status, tt.description)

			// retry_count が 0 にリセットされていることを確認
			assert.Equal(t, int64(0), updatedJob.RetryCount, "retry_count は 0 にリセットされるべき")
		})
	}
}

// TestMarkJobCompleted_TimestampPrecision は
// タイムスタンプの精度による比較の問題をテストする
func TestMarkJobCompleted_TimestampPrecision(t *testing.T) {
	env := setupWorkerTest(t, nil)
	defer env.Cleanup()

	ctx := context.Background()

	// ジョブを作成
	jobType, err := env.Queries.GetOrCreateJobType(ctx, "TestJob")
	require.NoError(t, err)

	now := time.Now()

	job, err := env.Queries.EnqueueJob(ctx, workerdb.EnqueueJobParams{
		JobTypeID:  jobType.ID,
		Arg:        "{}",
		Uniqkey:    sql.NullString{String: "precision-test", Valid: true},
		MaxRetries: 5,
		CreatedAt:  now,
		RunAfter:   now,
		DependsOn:  sql.NullString{String: "null", Valid: true},
	})
	require.NoError(t, err)

	// GrabJob（grabbed_at を設定）
	grabbedAt := now.Add(1 * time.Second)
	_, err = env.DBs.Worker.Exec(
		"UPDATE jobs SET status = 'running', grabbed_at = ? WHERE id = ?",
		grabbedAt, job.ID,
	)
	require.NoError(t, err)

	// SQLite の DATETIME 型の精度を考慮してテスト
	// SQLite は文字列として保存されるため、マイクロ秒までは保存されるが、
	// 比較時の精度に依存する可能性がある

	testCases := []struct {
		name          string
		createdAtDiff time.Duration
		expectPending bool
	}{
		{"100ns after", 100 * time.Nanosecond, true},
		{"1us after", 1 * time.Microsecond, true},
		{"1ms after", 1 * time.Millisecond, true},
		{"1s after", 1 * time.Second, true},
		{"equal", 0, false},
		{"1ns before", -1 * time.Nanosecond, false},
		{"1us before", -1 * time.Microsecond, false},
		{"1ms before", -1 * time.Millisecond, false},
		{"1s before", -1 * time.Second, false},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			// grabbed_at を再設定（前回のテストで NULL になっている可能性があるため）
			_, err := env.DBs.Worker.Exec(
				"UPDATE jobs SET status = 'running', grabbed_at = ? WHERE id = ?",
				grabbedAt, job.ID,
			)
			require.NoError(t, err)

			// created_at を調整
			adjustedCreatedAt := grabbedAt.Add(tc.createdAtDiff)
			_, err = env.DBs.Worker.Exec(
				"UPDATE jobs SET created_at = ? WHERE id = ?",
				adjustedCreatedAt, job.ID,
			)
			require.NoError(t, err)

			// 状態を確認
			beforeJob, err := env.Queries.GetJobByID(ctx, job.ID)
			require.NoError(t, err)
			t.Logf("created_at=%v, grabbed_at=%v, diff=%v",
				beforeJob.CreatedAt, beforeJob.GrabbedAt.Time,
				beforeJob.CreatedAt.Sub(beforeJob.GrabbedAt.Time))

			// MarkJobCompleted を実行
			err = env.Queries.MarkJobCompleted(ctx, workerdb.MarkJobCompletedParams{
				ID:         job.ID,
				FinishedAt: sql.NullTime{Time: time.Now(), Valid: true},
			})
			require.NoError(t, err)

			// 結果を確認
			resultJob, err := env.Queries.GetJobByID(ctx, job.ID)
			require.NoError(t, err)

			if tc.expectPending {
				assert.Equal(t, "pending", resultJob.Status,
					fmt.Sprintf("created_at が grabbed_at より %v 後なら pending になるべき", tc.createdAtDiff))
			} else {
				assert.Equal(t, "completed", resultJob.Status,
					fmt.Sprintf("created_at が grabbed_at より %v 前（または同時）なら completed になるべき", tc.createdAtDiff))
			}
		})
	}
}
