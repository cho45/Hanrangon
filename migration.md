Nogag から Hanrangon へのマイグレーション

未整理のやらなければならないこと

* db/migration/000-timezone-fix.sql の適用
* worker.db を削除して作りなおし。スキーマの初期化
* images.db, tfidf.db を新規作成し、db/schema/ から初期化
* systemd の設定

## 環境構築
* [ ] `postprocess/` で `npm install` を実行
* [ ] `config.toml` の作成（`config.toml.sample` からコピー）
* [ ] `var/db/` ディレクトリの作成と権限設定

## DB・インデックス初期化
* [ ] 全エントリの TF-IDF を再計算するジョブの投入
* [ ] 全画像の imghash 情報を再スキャンするジョブの投入

## 物理リソース
* [ ] 旧環境のアップロード画像ディレクトリを `static/images/entry` (または config 指定パス) に同期/移動
