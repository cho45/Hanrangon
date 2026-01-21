-- name: InsertCache :exec
INSERT OR REPLACE INTO cache (cache_key, content, etag, content_type, created_at)
VALUES (?, ?, ?, ?, ?);

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

-- name: ListMetadata :many
SELECT * FROM cache_metadata;

-- name: SetMetadata :exec
INSERT OR REPLACE INTO cache_metadata (key, value) VALUES (?, ?);

-- name: TruncateCache :exec
DELETE FROM cache;

-- name: GetCacheStats :one
SELECT
    COUNT(*) AS total_count,
    COALESCE(SUM(LENGTH(content)), 0) AS total_size,
    MIN(created_at) AS oldest_at,
    MAX(created_at) AS newest_at
FROM cache;

-- name: ListCacheEntries :many
SELECT
    cache_key,
    LENGTH(content) AS size,
    etag,
    content_type,
    created_at
FROM cache
ORDER BY created_at DESC
LIMIT ? OFFSET ?;

