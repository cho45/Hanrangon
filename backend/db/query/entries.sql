-- Note: date column is now TEXT type, so sqlc can map it directly to string without CAST.

-- name: ListEntries :many
SELECT * FROM entries
WHERE status = 'public' AND (publish_at IS NULL OR publish_at <= CURRENT_TIMESTAMP) AND date <= sqlc.arg(target_date)
ORDER BY date DESC, created_at ASC
LIMIT sqlc.arg('limit');

-- name: CountEntries :one
SELECT count(*) FROM entries WHERE status = 'public' AND (publish_at IS NULL OR publish_at <= CURRENT_TIMESTAMP);

-- name: ListPathsByDate :many
SELECT path FROM entries WHERE date = sqlc.arg(date);

-- name: GetEntryByPath :one
SELECT * FROM entries
WHERE path = sqlc.arg(path) LIMIT 1;

-- name: ListEntriesByYearMonthDay :many
SELECT * FROM entries
WHERE status = 'public' AND (publish_at IS NULL OR publish_at <= CURRENT_TIMESTAMP) AND sqlc.arg(start_date) <= date AND date < sqlc.arg(end_date)
ORDER BY created_at;

-- name: GetOlderEntry :one
SELECT * FROM entries
WHERE status = 'public' AND (publish_at IS NULL OR publish_at <= CURRENT_TIMESTAMP) AND created_at < sqlc.arg(created_at)
ORDER BY created_at DESC
LIMIT 1;

-- name: GetNewerEntry :one
SELECT * FROM entries
WHERE status = 'public' AND (publish_at IS NULL OR publish_at <= CURRENT_TIMESTAMP) AND created_at > sqlc.arg(created_at)
ORDER BY created_at ASC
LIMIT 1;

-- name: ListArchiveMonths :many
SELECT
	strftime('%Y', date) as year,
	strftime('%m', date) as month,
	count(*) as count
FROM entries
WHERE status = 'public' AND (publish_at IS NULL OR publish_at <= CURRENT_TIMESTAMP)
GROUP BY strftime('%Y-%m', date)
ORDER BY year DESC, month ASC;

-- name: ListEntriesByCategory :many
SELECT * FROM entries
WHERE status = 'public' AND (publish_at IS NULL OR publish_at <= CURRENT_TIMESTAMP) AND title LIKE sqlc.arg(title) AND date <= sqlc.arg(target_date)
ORDER BY date DESC, created_at ASC
LIMIT sqlc.arg('limit');

-- name: ListEntriesByIds :many
SELECT * FROM entries
WHERE id IN (sqlc.slice('ids'));

-- name: ListUniqueDates :many
SELECT DISTINCT date FROM entries
WHERE status = 'public' AND (publish_at IS NULL OR publish_at <= CURRENT_TIMESTAMP) AND date <= sqlc.arg(target_date)
ORDER BY date DESC
LIMIT sqlc.arg('limit');

-- name: ListEntriesByDates :many
SELECT * FROM entries
WHERE status = 'public' AND (publish_at IS NULL OR publish_at <= CURRENT_TIMESTAMP) AND date IN (sqlc.slice('dates'))
ORDER BY date DESC, created_at ASC;

-- name: ListAllEntriesForSitemap :many
SELECT path, modified_at FROM entries
WHERE status = 'public' AND (publish_at IS NULL OR publish_at <= CURRENT_TIMESTAMP)
ORDER BY date DESC;

-- name: CreateEntry :one
INSERT INTO entries (
    title, body, formatted_body, summary, image_url, path, format, date, created_at, modified_at, publish_at, status
) VALUES (
    sqlc.arg(title), sqlc.arg(body), sqlc.arg(formatted_body), sqlc.arg(summary), sqlc.arg(image_url), sqlc.arg(path), sqlc.arg(format), sqlc.arg(date), sqlc.arg(created_at), sqlc.arg(modified_at), sqlc.arg(publish_at), sqlc.arg(status)
) RETURNING *;

-- name: UpdateEntry :one
UPDATE entries SET
    title = sqlc.arg(title),
    body = sqlc.arg(body),
    formatted_body = sqlc.arg(formatted_body),
    summary = sqlc.arg(summary),
    image_url = sqlc.arg(image_url),
    path = sqlc.arg(path),
    format = sqlc.arg(format),
    date = sqlc.arg(date),
    created_at = sqlc.arg(created_at),
    modified_at = sqlc.arg(modified_at),
    publish_at = sqlc.arg(publish_at),
    status = sqlc.arg(status)
WHERE id = sqlc.arg(id)
RETURNING *;

-- name: GetEntryById :one
SELECT * FROM entries
WHERE id = sqlc.arg(id) LIMIT 1;

-- name: ListAllEntries :many
SELECT * FROM entries
ORDER BY date DESC, created_at DESC;

-- name: ListEntriesAdmin :many
SELECT * FROM entries
WHERE (CAST(sqlc.narg('cursor_id') AS BIGINT) IS NULL OR id < CAST(sqlc.narg('cursor_id') AS BIGINT))
ORDER BY id DESC
LIMIT sqlc.arg('limit');

-- name: SearchEntriesAdmin :many
SELECT * FROM entries
WHERE (title LIKE sqlc.arg('query') OR body LIKE sqlc.arg('query'))
AND (CAST(sqlc.narg('cursor_id') AS BIGINT) IS NULL OR id < CAST(sqlc.narg('cursor_id') AS BIGINT))
ORDER BY id DESC
LIMIT sqlc.arg('limit');

-- name: CountAllEntries :one
SELECT count(*) FROM entries;

-- name: FindScheduledEntriesToPublish :many
SELECT * FROM entries
WHERE status IN ('scheduled', 'reserved') AND (publish_at IS NULL OR publish_at <= sqlc.arg(now))
ORDER BY publish_at ASC;

-- name: PublishEntry :exec
UPDATE entries
SET status = 'public',
    path = sqlc.arg(path),
    date = sqlc.arg(date),
    created_at = sqlc.arg(created_at),
    modified_at = sqlc.arg(modified_at)
WHERE id = sqlc.arg(id);