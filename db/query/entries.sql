-- Note: sqlite3 driver converts DATE to time.Time by default, which is undesirable for 
-- date-based logic here (we want YYYY-MM-DD string). We use CAST(date AS TEXT) to 
-- ensure string return and we cannot change the schema to TEXT because we reuse 
-- existing data files.

-- name: ListEntries :many
SELECT id, title, body, formatted_body, path, format, CAST(date AS TEXT) AS date, created_at, modified_at FROM entries
WHERE date <= sqlc.arg(target_date)
ORDER BY date DESC, created_at ASC
LIMIT sqlc.arg('limit');

-- name: CountEntries :one
SELECT count(*) FROM entries;

-- name: CountEntriesByDate :one
SELECT count(*) FROM entries WHERE CAST(date AS TEXT) = sqlc.arg(date);

-- name: GetEntryByPath :one
SELECT id, title, body, formatted_body, path, format, CAST(date AS TEXT) AS date, created_at, modified_at FROM entries
WHERE path = sqlc.arg(path) LIMIT 1;

-- name: ListEntriesByYearMonthDay :many
SELECT id, title, body, formatted_body, path, format, CAST(date AS TEXT) AS date, created_at, modified_at FROM entries
WHERE CAST(sqlc.arg(start_date) AS TEXT) <= CAST(date AS TEXT) AND CAST(date AS TEXT) < CAST(sqlc.arg(end_date) AS TEXT)
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

-- name: ListUniqueDates :many
SELECT DISTINCT CAST(date AS TEXT) AS date FROM entries
WHERE date <= sqlc.arg(target_date)
ORDER BY date DESC
LIMIT sqlc.arg('limit');

-- name: ListEntriesByDates :many
SELECT id, title, body, formatted_body, path, format, CAST(date AS TEXT) AS date, created_at, modified_at FROM entries
WHERE date IN (sqlc.slice('dates'))
ORDER BY date DESC, created_at ASC;

-- name: ListAllEntriesForSitemap :many
SELECT path, modified_at FROM entries
ORDER BY date DESC;

-- name: CreateEntry :one
INSERT INTO entries (
    title, body, formatted_body, path, format, date, created_at, modified_at
) VALUES (
    sqlc.arg(title), sqlc.arg(body), sqlc.arg(formatted_body), sqlc.arg(path), sqlc.arg(format), sqlc.arg(date), sqlc.arg(created_at), sqlc.arg(modified_at)
) RETURNING *;

-- name: UpdateEntry :one
UPDATE entries SET
    title = sqlc.arg(title),
    body = sqlc.arg(body),
    formatted_body = sqlc.arg(formatted_body),
    path = sqlc.arg(path),
    format = sqlc.arg(format),
    date = sqlc.arg(date),
    modified_at = sqlc.arg(modified_at)
WHERE id = sqlc.arg(id)
RETURNING *;

-- name: GetEntryById :one
SELECT id, title, body, formatted_body, path, format, CAST(date AS TEXT) AS date, created_at, modified_at FROM entries
WHERE id = sqlc.arg(id) LIMIT 1;