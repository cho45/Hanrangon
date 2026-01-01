-- ジョブキュー用スキーマ
-- TheSchwartz互換ではなく、必要最小限の設計

-- ジョブタイプマッピング
CREATE TABLE job_types (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE
);

-- ジョブキュー
CREATE TABLE jobs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    job_type_id INTEGER NOT NULL,
    arg TEXT NOT NULL,              -- JSON形式の引数
    uniqkey TEXT,                   -- 重複排除用キー（NULLable）
    retry_count INTEGER NOT NULL DEFAULT 0,
    max_retries INTEGER NOT NULL DEFAULT 5,

    created_at DATETIME NOT NULL,
    run_after DATETIME NOT NULL,
    grabbed_at DATETIME,            -- ワーカーが取得した時刻

    status TEXT NOT NULL DEFAULT 'pending',  -- pending, running, completed, failed
    error_message TEXT,

    FOREIGN KEY (job_type_id) REFERENCES job_types(id),
    UNIQUE(job_type_id, uniqkey)
);

CREATE INDEX idx_jobs_status_run_after ON jobs(status, run_after);
CREATE INDEX idx_jobs_grabbed_at ON jobs(grabbed_at);
