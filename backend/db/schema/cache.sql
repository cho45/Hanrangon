CREATE TABLE IF NOT EXISTS cache (
    cache_key TEXT NOT NULL PRIMARY KEY,
    content BLOB,
    etag TEXT NOT NULL,
    content_type TEXT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cache_relation (
    id INTEGER PRIMARY KEY,
    cache_key TEXT NOT NULL,
    source_id TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS cache_relation_index_cache_key ON cache_relation (cache_key);
CREATE INDEX IF NOT EXISTS cache_relation_index_source_id ON cache_relation (source_id);


CREATE TABLE IF NOT EXISTS cache_metadata (
    key TEXT NOT NULL PRIMARY KEY,
    value TEXT NOT NULL
);


CREATE TRIGGER IF NOT EXISTS on_cache_deleted AFTER DELETE ON cache BEGIN
    DELETE FROM cache_relation WHERE cache_key = old.cache_key;
END;

CREATE TRIGGER IF NOT EXISTS on_cache_related_deleted AFTER DELETE ON cache_relation BEGIN
    DELETE FROM cache WHERE cache_key = old.cache_key;
END;
