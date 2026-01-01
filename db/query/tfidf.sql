-- name: ListRelatedEntries :many
SELECT related_entry_id, score
FROM related_entries
WHERE entry_id = ?
ORDER BY score DESC
LIMIT 5;
