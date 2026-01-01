CREATE TABLE entries (
    id INTEGER PRIMARY KEY,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    formatted_body TEXT NOT NULL,
    path TEXT NOT NULL,
    format TEXT NOT NULL,
    date DATE NOT NULL,
    created_at DATETIME NOT NULL,
    modified_at DATETIME NOT NULL,
    publish_at DATETIME,
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
