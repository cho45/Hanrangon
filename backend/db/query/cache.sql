-- name: InsertCache :exec
INSERT OR REPLACE INTO cache (cache_key, content, etag, content_type)
VALUES (?, ?, ?, ?);

-- name: GetCache :one
SELECT * FROM cache WHERE cache_key = ?;

-- name: UpdateCacheContentToNull :exec
UPDATE cache SET content = NULL WHERE cache_key = ?;

-- name: DeleteCache :exec
DELETE FROM cache WHERE cache_key = ?;

-- name: InsertCacheRelation :exec
INSERT INTO cache_relation (cache_key, source_id)
VALUES (?, ?);

-- name: DeleteCacheRelationsBySourceID :exec
DELETE FROM cache_relation WHERE source_id = ?;

-- name: DeleteCacheRelationsByCacheKey :exec
DELETE FROM cache_relation WHERE cache_key = ?;

-- name: GetMetadata :one
SELECT value FROM cache_metadata WHERE key = ?;

-- name: SetMetadata :exec
INSERT OR REPLACE INTO cache_metadata (key, value) VALUES (?, ?);

-- name: TruncateCache :exec
DELETE FROM cache;

