-- name: ListEntries :many
SELECT id, title, body, formatted_body, path, format, CAST(date AS TEXT) AS date, created_at, modified_at FROM entries
WHERE date <= sqlc.arg(target_date)
ORDER BY date DESC, created_at ASC
LIMIT sqlc.arg('limit');

-- name: CountEntries :one
SELECT count(*) FROM entries;

-- name: GetEntryByPath :one
SELECT id, title, body, formatted_body, path, format, CAST(date AS TEXT) AS date, created_at, modified_at FROM entries
WHERE path = sqlc.arg(path) LIMIT 1;

-- name: ListEntriesByYearMonthDay :many
SELECT id, title, body, formatted_body, path, format, CAST(date AS TEXT) AS date, created_at, modified_at FROM entries
WHERE CAST(sqlc.arg(start_date) AS TEXT) <= date AND date < CAST(sqlc.arg(end_date) AS TEXT)
ORDER BY created_at;

-- name: GetPrevEntry :one
SELECT id, title, body, formatted_body, path, format, CAST(date AS TEXT) AS date, created_at, modified_at FROM entries
WHERE created_at < sqlc.arg(created_at)
ORDER BY created_at DESC
LIMIT 1;

-- name: GetNextEntry :one
SELECT id, title, body, formatted_body, path, format, CAST(date AS TEXT) AS date, created_at, modified_at FROM entries
WHERE created_at > sqlc.arg(created_at)
ORDER BY created_at ASC
LIMIT 1;

-- name: ListArchiveMonths :many
SELECT
	strftime('%Y', date) as year,
	strftime('%m', date) as month,
	count(*) as count
FROM entries
GROUP BY strftime('%Y-%m', date)
ORDER BY date DESC;

-- name: ListEntriesByCategory :many
SELECT id, title, body, formatted_body, path, format, CAST(date AS TEXT) AS date, created_at, modified_at FROM entries
WHERE title LIKE sqlc.arg(title) AND date <= sqlc.arg(target_date)
ORDER BY date DESC, created_at ASC
LIMIT sqlc.arg('limit');

-- name: ListEntriesByIds :many
SELECT id, title, body, formatted_body, path, format, CAST(date AS TEXT) AS date, created_at, modified_at FROM entries
WHERE id IN (sqlc.slice('ids'));

-- name: ListAllEntriesForSitemap :many
SELECT path, modified_at FROM entries
ORDER BY date DESC;