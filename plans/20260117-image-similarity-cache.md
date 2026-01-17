# 画像類似度検索の事前計算キャッシュ導入計画

## 1. 背景と目的
現在、画像類似度検索 (`ListSimilarImagesByImageIDs`) は `ngram` テーブルを自己結合してオンザフライで集計している。前回の最適化により実行時間は短縮されたが、画像数（現在約6,000枚）が増えるにつれて計算コストが増大し続けることが予想される。
これを解消するため、`tfidf` の `related_entries` と同様の仕組みで類似画像を事前計算し、キャッシュテーブル (`similar_images`) に保存することで、検索時のパフォーマンスを劇的に向上させる。

## 2. システムアーキテクチャ

### 2.1 データベース設計 (`similar_images` テーブル)
双方向のレコード（A->B, B->A）を保持することで、検索クエリを単純化し、インデックスを活用した高速な取得を可能にする。

```sql
CREATE TABLE IF NOT EXISTS similar_images (
    image_id INTEGER NOT NULL,
    similar_image_id INTEGER NOT NULL,
    score INTEGER NOT NULL,
    PRIMARY KEY (image_id, similar_image_id),
    FOREIGN KEY (image_id) REFERENCES images(id),
    FOREIGN KEY (similar_image_id) REFERENCES images(id)
);

CREATE INDEX IF NOT EXISTS index_similar_images_image_id_score ON similar_images (image_id, score DESC);
```

### 2.2 更新ロジック (双方向インクリメンタル更新)
画像インデックス処理 (`IndexImages` ジョブ) の中で、画像 `X` が追加・更新された際に、以下の手順で双方向のキャッシュ更新を行う。

1. **既存キャッシュの削除**: 画像 `X` に関する古いキャッシュを削除する (`image_id = X OR similar_image_id = X`)。
2. **前方検索 (X -> Others)**:
    - 画像 `X` の `ngram` を元に、現在のデータベースから類似度の高い既存画像 `A, B, C...` を上位20件検索する。
3. **双方向保存**:
    - 検索された各画像 `A` について、以下の2レコードを保存する。
        - `(image_id: X, similar_image_id: A, score: S)` : `X` の類似画像リストに `A` を追加。
        - `(image_id: A, similar_image_id: X, score: S)` : `A` の類似画像リストに `X` を追加。
    - `INSERT OR REPLACE` を使用することで、`A` 側の既存リストに `X` とのペアが既にある場合は最新スコアで更新される。
4. **削除時のクリーンアップ**:
    - 画像 `X` 自体が削除された際は、`image_id = X OR similar_image_id = X` を削除し、他方の画像リストからも `X` が消えるようにする。

## 3. 実装ステップ

### ステップ 1: スキーマとクエリの定義
- `backend/db/schema/images.sql` にテーブル定義を追加。
- `backend/db/query/images.sql` にキャッシュ操作用クエリ（Upsert, List, Delete）を追加。

### ステップ 2: 再計算サブコマンドの作成 (`recalc-image-similarity`)
- `backend/subcommands/recalc_image_similarity.go` を作成。
- **機能**:
    - `similar_images` テーブルの全消去。
    - `images` テーブル内の全画像について、現在の `ngram` を元に類似度を再計算し、`similar_images` を一から構築し直す。
    - バッチ処理により、メモリ消費を抑えつつ高速に構築する。

### ステップ 3: インクリメンタル更新の実装
- `backend/jobs/index_images.go` を修正。
- 画像の `sig` が更新されたタイミングで、その画像に関する類似画像の計算とキャッシュ更新を自動で行う。

### ステップ 4: 検索ロジックの切り替え
- `backend/app/image_similarity.go` の `findSimilarImagesBulk` を、キャッシュテーブルを参照するように変更。

## 4. パフォーマンス目標
- 検索時間: 現在の 600ms 程度から、10ms 未満への短縮を目指す。
- ストレージ: 1画像あたり20件のキャッシュを持つ場合、6,000枚 × 20 = 120,000 レコード程度。

## 5. 懸念点と対応
- **不整合の解消**: インクリメンタル更新で漏れが生じた場合でも、ステップ2で作成する `recalc-image-similarity` サブコマンドを実行することで、いつでも `images` テーブルの状態に基いて正解データを再生成できる。