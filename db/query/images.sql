-- name: CreateImage :one
INSERT INTO images (uri, entry_id, sig) VALUES (?, ?, ?) RETURNING id;

-- name: DeleteImagesByEntryID :exec
DELETE FROM images WHERE entry_id = ?;

-- name: DeleteNgramsByImageID :exec
DELETE FROM ngram WHERE image_id = ?;

-- name: CreateNgram :exec
INSERT INTO ngram (image_id, word) VALUES (?, ?);

-- name: ListImagesByEntryID :many
SELECT * FROM images WHERE entry_id = ?;

-- name: GetImageByURI :one
SELECT * FROM images WHERE uri = ? LIMIT 1;

-- name: ListSimilarImages :many
SELECT
    i.id,
    i.uri,
    i.entry_id,
    COUNT(isw.word) as score
FROM
    images AS i
JOIN 
    ngram AS isw ON i.id = isw.image_id
JOIN 
    ngram AS isw_search ON isw.word = isw_search.word AND isw.image_id != isw_search.image_id
WHERE
    isw_search.image_id = ?
GROUP BY 
    i.id
ORDER BY 
    score DESC
LIMIT ?;
