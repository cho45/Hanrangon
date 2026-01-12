-- name: ListTrackbackEntries :many
SELECT entries.*, CAST(entries.date AS TEXT) AS date FROM entries
INNER JOIN trackbacks ON entries.id = trackbacks.trackback_entry_id
WHERE trackbacks.entry_id = ?
ORDER BY entries.date DESC, entries.created_at DESC;

-- name: CreateTrackback :exec
INSERT INTO trackbacks (entry_id, trackback_entry_id) VALUES (?, ?);

-- name: DeleteTrackbacksBySourceEntryId :exec
DELETE FROM trackbacks WHERE trackback_entry_id = ?;
