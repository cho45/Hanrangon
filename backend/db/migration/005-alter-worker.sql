-- jobs テーブルに依存関係管理用のカラムを追加
ALTER TABLE jobs ADD COLUMN depends_on TEXT;
ALTER TABLE jobs ADD COLUMN finished_at DATETIME;