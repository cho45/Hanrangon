-- 画像類似度の事前計算キャッシュテーブル
CREATE TABLE IF NOT EXISTS similar_images (
    image_id INTEGER NOT NULL,
    similar_image_id INTEGER NOT NULL,
    score INTEGER NOT NULL,
    jaccard REAL NOT NULL,
    PRIMARY KEY (image_id, similar_image_id),
    FOREIGN KEY (image_id) REFERENCES images(id),
    FOREIGN KEY (similar_image_id) REFERENCES images(id)
);

-- image_id ごとの Jaccard 順検索を高速化
CREATE INDEX IF NOT EXISTS index_similar_images_image_id_jaccard ON similar_images (image_id, jaccard DESC);