-- name: ListRelatedEntries :many
SELECT related_entry_id, score
FROM related_entries
WHERE entry_id = ?
ORDER BY score DESC
LIMIT 5;

-- name: DeleteTFIDFByEntryID :exec
DELETE FROM tfidf WHERE entry_id = ?;

-- name: InsertTFIDF :exec
INSERT INTO tfidf (entry_id, term, term_count, tfidf, tfidf_n)
VALUES (?, ?, ?, 0.0, 0.0);

-- name: DeleteRelatedEntriesByEntryID :exec
DELETE FROM related_entries WHERE entry_id = ?;

-- name: InsertRelatedEntry :exec
INSERT INTO related_entries (entry_id, related_entry_id, score)
VALUES (?, ?, ?);
