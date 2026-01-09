-- summary: HTMLを含まない最大70文字程度のプレーンテキスト要約
ALTER TABLE entries ADD COLUMN summary TEXT NOT NULL DEFAULT '';
-- image_url: 記事中最初の画像URL (あれば)
ALTER TABLE entries ADD COLUMN image_url TEXT NOT NULL DEFAULT '';
