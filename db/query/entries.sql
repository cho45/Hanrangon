-- name: ListEntries :many
SELECT * FROM entries
WHERE date <= ?
ORDER BY date DESC, created_at ASC
LIMIT ?;

-- name: CountEntries :one
SELECT count(*) FROM entries;

-- name: GetEntryByPath :one
SELECT * FROM entries
WHERE path = ? LIMIT 1;

-- name: ListEntriesByYearMonthDay :many
SELECT * FROM entries
WHERE CAST(? AS TEXT) <= date AND date < CAST(? AS TEXT)
ORDER BY created_at;

-- name: GetPrevEntry :one
SELECT * FROM entries
WHERE created_at < ?
ORDER BY created_at DESC
LIMIT 1;

-- name: GetNextEntry :one
SELECT * FROM entries
WHERE created_at > ?
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
