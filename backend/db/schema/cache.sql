-- ページキャッシュ専用DB

-- ページキャッシュテーブル
CREATE TABLE IF NOT EXISTS cache (
    cache_key TEXT NOT NULL PRIMARY KEY,
    content BLOB NOT NULL
);

-- キャッシュ依存関係テーブル
CREATE TABLE IF NOT EXISTS cache_relation (
    id INTEGER PRIMARY KEY,
    cache_key TEXT NOT NULL,
    source_id TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS cache_relation_index_cache_key ON cache_relation (cache_key);
CREATE INDEX IF NOT EXISTS cache_relation_index_source_id ON cache_relation (source_id);

-- キャッシュ削除時に関連も自動削除
CREATE TRIGGER IF NOT EXISTS on_cache_deleted AFTER DELETE ON cache BEGIN
    DELETE FROM cache_relation WHERE cache_key = old.cache_key;
END;

-- 関連が削除されたらキャッシュも削除
CREATE TRIGGER IF NOT EXISTS on_cache_related_deleted AFTER DELETE ON cache_relation BEGIN
    DELETE FROM cache WHERE cache_key = old.cache_key;
END;
