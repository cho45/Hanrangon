-- マイグレーション: date カラムの型を DATE から TEXT に変更
--
-- 【目的】
-- SQLite の DATE 型アフィニティにより、go-sqlite3 ドライバが値を勝手に time.Time (RFC3339形式) 
-- に変換してしまうのを防ぐため。TEXT 型に明示的に変更することで、sqlc が直接 Go の string 
-- として扱えるようになり、SELECT * による効率的なマッピングが可能になる。
--
-- 【互換性】
-- この変更は、既存の `CAST(date AS TEXT)` を使用している古いコードに対しても後方互換性がある。
-- したがって、新しい Go バイナリをデプロイする前に、稼働中のデータベースに対してこの
-- マイグレーションを先行して実行しても安全である。
--
-- 【手順】
-- 1. 本番データベースに対してこのマイグレーションを実行する。
-- 2. "SELECT *" クエリを採用した新しい Go バイナリをデプロイする。

PRAGMA foreign_keys=OFF;

BEGIN TRANSACTION;

-- 1. Create new table with TEXT type for date
CREATE TABLE entries_new (
    id INTEGER PRIMARY KEY,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    formatted_body TEXT NOT NULL,
    path TEXT NOT NULL,
    format TEXT NOT NULL,
    date TEXT NOT NULL, -- Changed from DATE to TEXT
    created_at DATETIME NOT NULL,
    modified_at DATETIME NOT NULL,
    publish_at DATETIME,
    status TEXT NOT NULL DEFAULT 'public'
);

-- 2. Copy data from old table
INSERT INTO entries_new (id, title, body, formatted_body, path, format, date, created_at, modified_at, publish_at, status)
SELECT id, title, body, formatted_body, path, format, CAST(date AS TEXT), created_at, modified_at, publish_at, status
FROM entries;

-- 3. Drop old table and rename new table
DROP TABLE entries;
ALTER TABLE entries_new RENAME TO entries;

-- 4. Re-create indexes
CREATE INDEX index_date ON entries (date, path);
CREATE INDEX index_path ON entries (path);
CREATE INDEX index_created_at ON entries (created_at);

COMMIT;

PRAGMA foreign_keys=ON;
