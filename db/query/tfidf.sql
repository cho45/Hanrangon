-- name: GetTermsByFirstEntryID :many
SELECT * FROM terms WHERE first_entry_id = ?;

-- name: GetTermIDsByEntryID :many
SELECT term_id FROM postings WHERE entry_id = ?;

-- name: DecrementTermDFCount :exec
UPDATE terms SET df_count = df_count - 1 WHERE id = ?;

-- name: GetTermByTerm :one
SELECT * FROM terms WHERE term = ?;

-- name: UpsertTerm :one
INSERT INTO terms (term, df_count, first_entry_id)
VALUES (?, 1, ?)
ON CONFLICT(term) DO UPDATE SET
    df_count = terms.df_count + 1,
    first_entry_id = CASE WHEN terms.df_count <= 0 THEN excluded.first_entry_id ELSE terms.first_entry_id END
RETURNING *;

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
VALUES (?, ?, ?, 0.0, 0.0)
ON CONFLICT(entry_id, term_id) DO UPDATE SET
    term_count = excluded.term_count;

-- name: DeleteRelatedEntriesByEntryID :exec
DELETE FROM related_entries WHERE entry_id = ?;

-- name: InsertRelatedEntry :exec
INSERT INTO related_entries (entry_id, related_entry_id, score)
VALUES (?, ?, ?);

-- name: GetTFIDFStats :one
SELECT 
    (SELECT count(*) FROM terms) as total_terms,
    (SELECT count(DISTINCT entry_id) FROM postings) as indexed_entries,
    (SELECT count(*) FROM related_entries) as total_related_pairs,
    (SELECT count(DISTINCT entry_id) FROM related_entries) as entries_with_related
;

-- name: GetTopTermsByDF :many
SELECT term, df_count as df
FROM terms
ORDER BY df_count DESC
LIMIT ?;

-- name: GetAverageSimilarityScore :one
SELECT CAST(COALESCE(avg(score), 0.0) AS REAL) as avg_score FROM related_entries;
