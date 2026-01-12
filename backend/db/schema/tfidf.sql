-- 語彙（ターム）管理テーブル
CREATE TABLE IF NOT EXISTS terms (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    term TEXT NOT NULL UNIQUE,
    df_count INTEGER NOT NULL DEFAULT 0,
    first_entry_id INTEGER
);

-- ポスティングリスト（転置インデックス 兼 TF-IDF）
CREATE TABLE IF NOT EXISTS postings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    entry_id INTEGER NOT NULL,
    term_id INTEGER NOT NULL,
    term_count INTEGER NOT NULL DEFAULT 0,
    tfidf REAL NOT NULL DEFAULT 0.0,
    tfidf_n REAL NOT NULL DEFAULT 0.0,
    FOREIGN KEY (entry_id) REFERENCES entries(id),
    FOREIGN KEY (term_id) REFERENCES terms(id)
);

CREATE UNIQUE INDEX IF NOT EXISTS index_postings_term_id_entry_id ON postings (term_id, entry_id);
CREATE INDEX IF NOT EXISTS index_postings_entry_id_tfidf_n ON postings (entry_id, tfidf_n);

-- 関連エントリ（キャッシュ）
CREATE TABLE IF NOT EXISTS related_entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    entry_id INTEGER NOT NULL,
    related_entry_id INTEGER NOT NULL,
    score REAL NOT NULL,
    FOREIGN KEY (entry_id) REFERENCES entries(id),
    FOREIGN KEY (related_entry_id) REFERENCES entries(id)
);

CREATE INDEX IF NOT EXISTS index_related_entries_entry_id_score ON related_entries (entry_id, score);
CREATE INDEX IF NOT EXISTS index_related_entries_related_entry_id ON related_entries (related_entry_id);