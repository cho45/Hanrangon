# Hanrangon (Go Implementation)

[![CI](https://github.com/cho45/hanrangon/actions/workflows/ci.yml/badge.svg)](https://github.com/cho45/hanrangon/actions/workflows/ci.yml)

Perl 版 Nogag (氾濫原) の Go (Golang) によるリライトプロジェクト。
"Hanra-n-Go-n" (氾濫原 + Go).

## 特徴

- **高速・省メモリ:** Go によるネイティブ実装。
- **SQLite 活用:** Data, Images, TF-IDF, Worker の 4 つに分離。記事本体 (Data) のバックアップを最小限に抑えつつ、再生成可能なインデックスやメタデータによるファイル肥大化の影響を隔離。
- **マルチフォーマット:** はてな記法、tDiary 記法、Markdown、HTML に対応。
- **関連記事表示:** 文字 2-gram (Bigram) 方式と SQL を活用した高速な TF-IDF 計算。辞書不要でメンテナンス性の高い類似度計算を実現。
- **ポストプロセス:** Node.js による記事保存時の事前整形。MathJax や Highlight.js などの成熟した JS エコシステムを活用しつつ、サーバー側で静的な HTML へ変換しておくことで、閲覧時のクライアント負荷を排除しコンテンツの最速表示を実現。
- **内蔵ジョブキュー:** SQLite ベースの非同期実行システム。
外部ミドルウェア（Redis 等）を不要にし、単一バイナリと DB ファイルのみで完結する運用性を追求。

## Architecture

システムの構造と処理フロー。

### Backend Architecture
システムのコンポーネント構成と非同期ジョブのフロー。
![Backend Architecture](docs/arch_diagram.png)

### Frontend Architecture
公開側（SSR）と管理画面（Svelte SPA）の構成。
![Frontend Architecture](docs/frontend_arch_diagram.png)

### Content Pipeline
記事の投稿からフォーマット、ポストプロセス、保存、そして進捗通知（SSE）の流れ。
![Content Pipeline](docs/content_pipeline_diagram.png)

## Prerequisites

- Go 1.24+
- Node.js (記事保存時のポストプロセスおよび管理画面のビルドに使用)
- `sqlc` CLI (DB コード生成に使用)
- `goimports` (コードのフォーマットに使用)
- `air` (開発時のホットリロードに使用)

## Setup & Run

### 1. 依存ツールのインストール

```bash
make setup
```

### 2. フロントエンドとポストプロセスのビルド・セットアップ

```bash
# Admin Frontend (Vite/Svelte 5)
make build-fe

# Node.js 依存関係 (ポストプロセス)
cd postprocess
npm install
cd ..
```

### 3. コード生成

```bash
make generate
```

### 4. 設定

`config.toml.sample` を `config.toml` にコピーして編集。

```bash
cp config.toml.sample config.toml
```

### 5. サーバーの起動

```bash
# ビルドして起動
make run

# または、開発用 (ホットリロード有効)
make watch
```

デフォルトで http://localhost:5555 で動作。

## Subcommands

以下のサブコマンドをサポート。

- `serve`: サーバーの起動（デフォルト）
- `reformat`: 全記事の再フォーマット
- `recalc-tfidf`: TF-IDF の再計算
- `backup`: データベースのバックアップ
- `index-images`: 画像のインデックス作成
- `update-password`: 管理者パスワードの更新

実行例:
```bash
make
./hanrangon update-password
```

## 管理画面 (Admin Panel)

Svelte による SPA 管理画面。

- **技術スタック:** Svelte 5, Vite, TypeScript
- **主な機能:**
    - **エントリ管理:** 記事の作成・編集・削除。オートセーブ、画像アップロード、公開予約に対応。
    - **ジョブ監視:** 内蔵ジョブキューの実行状況、エラーログの確認。
    - **システム情報 (Info):** アプリケーションのハッシュ、稼働時間、メモリ使用量、構成設定の確認。
- **開発とビルド:**
    - `admin-frontend/` ディレクトリで `npm run dev` を実行することで HMR 有効な開発が可能。
    - `make watch` を使用すると、フロントエンドの開発サーバーと Go のホットリロード (air) を同時に起動可能。
    - `npm run build` により、ビルド成果物が `static/admin/` に出力され、Go サーバー経由で配信。

## Project Structure

- `app/`: アプリケーションのコアロジック（ハンドラー、サーバー構成、設定）。
- `admin-frontend/`: Svelte 5 による SPA 管理画面のソースコード。
- `model/`: `sqlc` によって生成されたデータベースモデルとクエリ。
- `view/`: `html/template` による HTML/XML テンプレート。
- `db/`: SQL スキーマ (`schema/`) とクエリ定義 (`query/`)。
- `formatter/`: 各種記法（Hatena, tDiary 等）のパーサ。
- `jobqueue/`: ジョブキューの基盤実装（Worker 監視ループ等）。
- `jobs/`: 具体的なジョブハンドラーの実装。
- `tfidf/`: TF-IDF 計算と 2-gram 抽出ロジック。
- `postprocess/`: Node.js による HTML ポストプロセススクリプト。
- `static/`: CSS, JS, 画像などの静的アセット。
- `main.go`: エントリーポイント。

## Testing

インメモリ SQLite を使用した統合テストが可能。SQLite の数学関数を使用するため、`sqlite_math_functions` タグが必要。

```bash
make test
```

Node.js によるポストプロセスのテスト:

```bash
make postprocess-test
```
