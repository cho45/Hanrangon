CREATE TABLE entries (
    id INTEGER PRIMARY KEY,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    formatted_body TEXT NOT NULL,
    summary TEXT NOT NULL DEFAULT '', -- HTMLを含まない最大70文字程度のプレーンテキスト要約
    image_url TEXT NOT NULL DEFAULT '', -- 記事中最初の画像URL (あれば)
    path TEXT NOT NULL,
    format TEXT NOT NULL,
    date TEXT NOT NULL, -- YYYY-MM-DD (JST),
    created_at DATETIME NOT NULL, -- YYYY-MM-DD HH:MM:SS[.ffffff]+09:00,
    modified_at DATETIME NOT NULL, -- YYYY-MM-DD HH:MM:SS[.ffffff]+09:00,
    publish_at DATETIME, -- YYYY-MM-DD HH:MM:SS[.ffffff]+09:00,
    status TEXT NOT NULL DEFAULT 'public'
);
CREATE INDEX index_date ON entries (date, path);
CREATE INDEX index_path ON entries (path);
CREATE INDEX index_created_at ON entries (created_at);

CREATE TABLE trackbacks (
    id INTEGER PRIMARY KEY,
    entry_id INTEGER,
    trackback_entry_id INTEGER
);
CREATE INDEX index_trackbacks_entry_id ON trackbacks (entry_id);
CREATE INDEX index_trackbacks_trackback_entry_id ON trackbacks (trackback_entry_id);

CREATE TABLE exif (
    uri VARCHAR PRIMARY KEY,
    original_uri VARCHAR,
    model VARCHAR,
    make VARCHAR,
    focallength VARCHAR,
    fnumber VARCHAR,
    iso VARCHAR,
    speed VARCHAR
);
