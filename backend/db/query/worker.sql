-- name: GetOrCreateJobType :one
INSERT INTO job_types (name) VALUES (?) ON CONFLICT(name) DO UPDATE SET name = name RETURNING *;

-- name: GetJobTypeByID :one
SELECT * FROM job_types WHERE id = ? LIMIT 1;

-- name: EnqueueJob :one
INSERT INTO jobs (job_type_id, arg, uniqkey, max_retries, created_at, run_after, status, depends_on)
VALUES (?, ?, ?, ?, ?, ?, 'pending', ?)
RETURNING *;

-- name: GetJobByID :one
SELECT * FROM jobs WHERE id = ? LIMIT 1;

-- name: GetJobsByIDs :many
SELECT * FROM jobs WHERE id IN (sqlc.slice('ids'));

-- name: GetJobByTypeAndUniqkey :one
SELECT * FROM jobs WHERE job_type_id = ? AND uniqkey = ? LIMIT 1;

-- name: FindNextJob :one
SELECT * FROM jobs WHERE status = 'pending' AND run_after <= ? ORDER BY created_at ASC LIMIT 1;

-- name: GrabJob :execresult
UPDATE jobs SET status = 'running', grabbed_at = :grabbed_at
WHERE id = :id AND status = 'pending';

-- name: MarkJobCompleted :exec
UPDATE jobs
SET
    status = CASE WHEN created_at > grabbed_at THEN 'pending' ELSE 'completed' END,
    finished_at = CASE WHEN created_at > grabbed_at THEN NULL ELSE ? END,
    grabbed_at = NULL,
    retry_count = CASE WHEN created_at > grabbed_at THEN 0 ELSE retry_count END
WHERE id = ?;

-- name: MarkJobFailed :exec
UPDATE jobs SET status = CASE WHEN retry_count + 1 >= max_retries THEN 'failed' ELSE 'pending' END, retry_count = retry_count + 1, run_after = ?, error_message = ?, grabbed_at = NULL WHERE id = ?;

-- name: MarkJobPermanentlyFailed :exec
UPDATE jobs SET status = 'failed', error_message = ?, grabbed_at = NULL, finished_at = ? WHERE id = ?;

-- name: UpdateJobForEnqueue :exec
UPDATE jobs
SET arg = ?,
    depends_on = ?,
    run_after = ?,
    status = CASE WHEN status = 'running' THEN 'running' ELSE 'pending' END,
    retry_count = 0,
    created_at = ?
WHERE id = ?;

-- name: UpdateJobRunAfter :exec
UPDATE jobs SET run_after = ? WHERE id = ?;

-- name: CleanupJobs :exec
DELETE FROM jobs WHERE status = 'completed' AND finished_at < ?;

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

-- name: ListJobs :many
SELECT 
    j.id, 
    j.job_type_id, 
    j.arg, 
    j.uniqkey, 
    j.retry_count, 
    j.max_retries, 
    j.created_at, 
    j.run_after, 
    j.grabbed_at, 
    j.status, 
    j.error_message, 
    j.depends_on, 
    j.finished_at,
    jt.name as job_type_name
FROM jobs j
JOIN job_types jt ON j.job_type_id = jt.id
ORDER BY j.created_at DESC
LIMIT ? OFFSET ?;