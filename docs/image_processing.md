# 画像処理とストレージ

アップロードされた画像の最適化プロセスと保存先。

## ストレージ (`backend/app/storage.go`)

`StorageClient` インターフェースを介して、環境に応じたストレージを使用する。

- **Cloudflare R2**: 本番環境で使用。S3 互換 API を介して接続。
- **ローカルファイルシステム**: 開発環境や R2 未設定時のフォールバック。

## 画像最適化プロセス

管理画面からのアップロード時（`HandleAdminApiUploadImage`）、`backend/app/image_processor.go` により以下のポリシーに基づいて同期的に処理される。

- **PNG**: ユーザーがロスレス（可逆）であることを期待しているため、`oxipng` または `optipng` による**可逆圧縮**のみを行う。
- **JPEG**: 「古い」フォーマットとして扱い、ファイルサイズ削減を優先する。`avifenc` または `cavif` を用いて、よりコストパフォーマンス（圧縮効率）の高い **AVIF 形式へ自動変換**する。
- **AVIF**: ユーザー側で既に適切に最適化・圧縮されていることを前提とし、**追加の処理を行わずそのまま保存**する。
- **その他**: 利用頻度が低いため、特別な最適化は考慮しない。

## 画像データベース (`images` テーブル)

記事内の画像情報を管理する。

- **レコード作成**: 記事の保存・公開時に、`FormattedBody` 内のすべての `<img>` タグの `src` を抽出してレコードを作成する。
- **シグネチャ**: 類似画像検索用の 64bit 特徴量。知覚的な色空間（OKLCH）におけるカラーヒストグラムに基づき、面積の一定割合以上を占める色のビットを立てた「色の指紋」。非同期ジョブまたはサブコマンドで生成される。詳細は [`backend/jobs/index_images.go`](backend/jobs/index_images.go:298) を参照。
- **管理画面**: `images` テーブルに基づき、アップロードされた画像や記事内で使用されている画像の一覧を表示する。類似画像検索のロジックは [`backend/app/image_similarity.go`](backend/app/image_similarity.go) に実装されている。

## インデックス処理

記事内の画像と `images` テーブルの状態を同期し、シグネチャを計算するプロセス。

### 非同期ジョブ ([`IndexImages`](backend/jobs/index_images.go))
記事公開時に自動実行される。
1. `FormattedBody` から `<img>` タグの URL を抽出。
2. `images` テーブルのレコードを同期（追加・削除）。
3. 未作成または更新が必要な画像のシグネチャを非同期で生成。

### サブコマンド ([`index-images`](backend/subcommands/index_images.go))
大量の過去記事やインポートした記事の画像を再処理するために使用。

```bash
# 記事内容と images テーブルの同期のみ（高速）
go run . index-images --sync --force

# 未作成シグネチャの生成（低速）
go run . index-images --fill --force

# 全件のシグネチャを強制再計算
go run . index-images --overwrite --force