-- name: GetOrCreateJobType :one
INSERT INTO job_types (name) VALUES (?) ON CONFLICT(name) DO UPDATE SET name = name RETURNING *;

-- name: GetJobTypeByID :one
SELECT * FROM job_types WHERE id = ? LIMIT 1;

-- name: EnqueueJob :one
INSERT INTO jobs (job_type_id, arg, uniqkey, max_retries, created_at, run_after, status)
VALUES (?, ?, ?, ?, ?, ?, 'pending')
ON CONFLICT(job_type_id, uniqkey) DO UPDATE SET arg = excluded.arg, run_after = excluded.run_after, status = 'pending', grabbed_at = NULL, retry_count = 0
RETURNING *;

-- name: GetJobByID :one
SELECT * FROM jobs WHERE id = ? LIMIT 1;

-- name: FindNextJob :one
SELECT * FROM jobs WHERE status = 'pending' AND run_after <= ? ORDER BY created_at ASC LIMIT 1;

-- name: GrabJob :exec
UPDATE jobs SET status = 'running', grabbed_at = ? WHERE id = ?;

-- name: MarkJobCompleted :exec
DELETE FROM jobs WHERE id = ?;

-- name: MarkJobFailed :exec
UPDATE jobs SET status = CASE WHEN retry_count + 1 >= max_retries THEN 'failed' ELSE 'pending' END, retry_count = retry_count + 1, run_after = ?, error_message = ?, grabbed_at = NULL WHERE id = ?;

-- name: CountPendingJobs :one
SELECT count(*) FROM jobs WHERE status = 'pending';

-- name: RecoverStuckJobs :exec
UPDATE jobs
SET status = 'pending', grabbed_at = NULL, retry_count = retry_count + 1
WHERE status = 'running'
AND grabbed_at < datetime('now', '-5 minutes')
AND retry_count < max_retries;

-- name: FailStuckJobs :exec
UPDATE jobs
SET status = 'failed'
WHERE status = 'running'
AND grabbed_at < datetime('now', '-5 minutes')
AND retry_count >= max_retries;

-- name: CountJobs :one
SELECT count(*) FROM jobs;
