-- name: CreateImage :one
INSERT INTO images (uri, entry_id, sig) VALUES (?, ?, ?) RETURNING id;

-- name: DeleteImagesByIDs :exec
DELETE FROM images WHERE id IN (sqlc.slice('ids'));

-- name: DeleteNgramsByImageID :exec
DELETE FROM ngram WHERE image_id = ?;

-- name: DeleteNgramsByImageIDs :exec
DELETE FROM ngram WHERE image_id IN (sqlc.slice('ids'));

-- name: CreateNgram :exec
INSERT OR REPLACE INTO ngram (image_id, word) VALUES (?, ?);

-- name: ListImages :many
SELECT * FROM images
ORDER BY entry_id DESC
LIMIT ? OFFSET ?;

-- name: CountImages :one
SELECT COUNT(*) FROM images;

-- name: CountUnindexedImages :one
SELECT COUNT(*) FROM images WHERE length(sig) = 0;

-- name: ListEntryIDsWithUnindexedImages :many
SELECT DISTINCT entry_id FROM images WHERE length(sig) = 0;

-- name: ListAllEntryIDsInImages :many
SELECT DISTINCT entry_id FROM images;

-- name: UpdateImageSig :exec
UPDATE images SET sig = ? WHERE id = ?;

-- name: ListImagesByEntryID :many
SELECT * FROM images WHERE entry_id = ?;

-- name: ListSimilarImagesByImageIDs :many
SELECT
    isw_search.image_id AS search_image_id,
    i.id,
    i.uri,
    i.entry_id,
    i.sig,
    COUNT(isw.word) as score
FROM
    images AS i
JOIN 
    ngram AS isw ON i.id = isw.image_id
JOIN 
    ngram AS isw_search ON isw.word = isw_search.word AND isw.image_id != isw_search.image_id
WHERE
    isw_search.image_id IN (sqlc.slice('image_ids'))
GROUP BY 
    isw_search.image_id, i.id
ORDER BY 
    score DESC;

-- name: GetImage :one
SELECT * FROM images WHERE id = ?;

-- name: ListImagesByEntryIDs :many
SELECT * FROM images WHERE entry_id IN (sqlc.slice('entry_ids'));
