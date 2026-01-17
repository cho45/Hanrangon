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
    t.search_image_id,
    i.id,
    i.uri,
    i.entry_id,
    i.sig,
    t.score
FROM (
    SELECT
        isw_search.image_id AS search_image_id,
        isw.image_id AS target_image_id,
        COUNT(*) AS score
    FROM
        ngram AS isw_search
    JOIN
        ngram AS isw ON isw_search.word = isw.word AND isw_search.image_id != isw.image_id
    WHERE
        isw_search.image_id IN (sqlc.slice('image_ids'))
    GROUP BY
        isw_search.image_id, isw.image_id
) AS t
JOIN
    images AS i ON i.id = t.target_image_id
ORDER BY
    t.score DESC;

-- name: UpsertSimilarImage :exec
INSERT OR REPLACE INTO similar_images (image_id, similar_image_id, score, jaccard)
VALUES (?, ?, ?, ?);

-- name: ListSimilarImagesFromCache :many
SELECT
    i.id,
    i.uri,
    i.entry_id,
    i.sig,
    s.score,
    s.jaccard
FROM
    similar_images AS s
JOIN
    images AS i ON i.id = s.similar_image_id
WHERE
    s.image_id = ?
ORDER BY
    s.jaccard DESC;

-- name: ListSimilarImagesFromCacheBulk :many
SELECT
    s.image_id AS search_image_id,
    i.id,
    i.uri,
    i.entry_id,
    i.sig,
    s.score,
    s.jaccard
FROM
    similar_images AS s
JOIN
    images AS i ON i.id = s.similar_image_id
WHERE
    s.image_id IN (sqlc.slice('image_ids'))
ORDER BY
    s.jaccard DESC;

-- name: DeleteSimilarImagesByImageID :exec
DELETE FROM similar_images WHERE image_id = ? OR similar_image_id = ?;

-- name: DeleteAllSimilarImages :exec
DELETE FROM similar_images;

-- name: GetImage :one
SELECT * FROM images WHERE id = ?;

-- name: ListImagesByEntryIDs :many
SELECT * FROM images WHERE entry_id IN (sqlc.slice('entry_ids'));
