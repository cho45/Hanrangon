-- entry_id による検索の高速化 (Sync/Fill/画像一覧で使用)
CREATE INDEX IF NOT EXISTS index_images_entry_id ON images (entry_id);

-- 未インデックス画像（sigが空）の抽出高速化 (Fillフェーズや統計で使用)
CREATE INDEX IF NOT EXISTS index_images_unindexed ON images (entry_id) WHERE length(sig) = 0;
