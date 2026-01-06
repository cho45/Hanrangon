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

-- name: GetTFIDFStats :one
SELECT 
    (SELECT count(*) FROM terms) as total_terms,
    (SELECT count(DISTINCT entry_id) FROM postings) as indexed_entries,
    (SELECT count(*) FROM related_entries) as total_related_pairs,
    (SELECT count(DISTINCT entry_id) FROM related_entries) as entries_with_related
;

-- name: GetTopTermsByDF :many
SELECT t.term, count(p.entry_id) as df
FROM terms t
JOIN postings p ON t.id = p.term_id
GROUP BY t.id
ORDER BY df DESC
LIMIT ?;

-- name: GetAverageSimilarityScore :one
SELECT CAST(COALESCE(avg(score), 0.0) AS REAL) as avg_score FROM related_entries;