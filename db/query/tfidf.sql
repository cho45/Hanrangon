-- name: GetTermID :one
SELECT id FROM terms WHERE term = ?;

-- name: InsertTerm :exec
INSERT OR IGNORE INTO terms (term) VALUES (?);

-- name: ListRelatedEntries :many
SELECT related_entry_id, score
FROM related_entries
WHERE entry_id = ?
ORDER BY score DESC
LIMIT 5;

-- name: DeletePostingsByEntryID :exec
DELETE FROM postings WHERE entry_id = ?;

-- name: InsertPosting :exec
INSERT INTO postings (entry_id, term_id, term_count, tfidf, tfidf_n)
VALUES (?, ?, ?, 0.0, 0.0);

-- name: DeleteRelatedEntriesByEntryID :exec
DELETE FROM related_entries WHERE entry_id = ?;

-- name: InsertRelatedEntry :exec
INSERT INTO related_entries (entry_id, related_entry_id, score)
VALUES (?, ?, ?);