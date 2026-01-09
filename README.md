# Hanrangon (Go Implementation)

[![CI](https://github.com/cho45/hanrangon/actions/workflows/ci.yml/badge.svg)](https://github.com/cho45/hanrangon/actions/workflows/ci.yml)

Perl 版 Nogag (氾濫原) の Go (Golang) によるリライトプロジェクト。
"Hanra-n-Go-n" (氾濫原 + Go).

## 設計思想

システムの長期的な運用性と保守性を確保するため、以下の設計方針を採用している。

### データベースの分離とバックアップ効率
データベースを `Data`, `Images`, `TF-IDF`, `Worker` の 4 つに物理的に分割している。バックアップが不可欠な記事データを、再生成可能あるいは肥大化しやすいインデックスやログから分離することで、バックアップサイズの最小化とメンテナンスの効率化を実現している。また、`WAL` モードにおける書き込み競合の影響範囲を限定する。

### ポストプロセスによる表示品質の確保
`MathJax` や `Highlight.js` といった成熟した JavaScript ライブラリを活用するため、`Node.js` をサイドカーとして利用している。`jsdom` を用いてブラウザ環境に近い状態でサーバー側レンダリング（事前整形）を行い、静的な HTML として保存することで、閲覧時の高速なコンテンツ表示を可能にしている。

### 安定した言語解析と関連記事表示
関連記事抽出のための `TF-IDF` 計算には、文字 2-gram (Bigram) 方式を採用している。形態素解析器（`go-tinysegmenter` や `kagome` 等）と比較してメモリ消費が少なく、辞書のメンテナンスも不要である。日本語における分かち書きの精度に左右されず、安定したターム抽出と検索性を確保している。

### 外部依存の排除と運用性の向上
`Redis` 等の外部ミドルウェアを必要とせず、`SQLite` ベースのジョブキューを内蔵している。Go による単一バイナリとデータベースファイル群のみでシステムが完結するため、環境構築やサーバー移転が容易である。個人のブログシステムという規模において、依存する外部プロセスを最小限に抑えることを優先している。

### 多様なテキストフォーマットへの対応
はてな記法、tDiary 記法、`Markdown`、`HTML` に対応している。

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
- `Node.js` (記事保存時のポストプロセスおよび管理画面のビルドに使用)
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
- `recalc-tfidf`: `TF-IDF` の再計算
- `backup`: データベースのバックアップ
- `index-images`: 画像のインデックス作成
- `update-password`: 管理者パスワードの更新
- `recalc-metadata`: メタデータの再計算

実行例:
```bash
make
./hanrangon update-password
```

## 管理画面 (Admin Panel)

`Svelte` による `SPA` 管理画面。

- 技術スタック: `Svelte 5`, `Vite`, `TypeScript`
- 主な機能:
    - エントリ管理: 記事の作成・編集・削除。オートセーブ、画像アップロード、公開予約に対応。
    - ジョブ監視: 内蔵ジョブキューの実行状況、エラーログの確認。
    - システム情報 (Info): アプリケーションのハッシュ、稼働時間、メモリ使用量、構成設定の確認。
- 開発とビルド:
    - `admin-frontend/` ディレクトリで `npm run dev` を実行することで HMR 有効な開発が可能。
    - `make watch` を使用すると、フロントエンドの開発サーバーと Go のホットリロード (`air`) を同時に起動可能。
    - `npm run build` により、ビルド成果物が `static/admin/` に出力され、Go サーバー経由で配信。

## Project Structure

- `app/`: アプリケーションのコアロジック（ハンドラー、サーバー構成、設定）。
- `admin-frontend/`: `Svelte 5` による `SPA` 管理画面のソースコード。
- `model/`: `sqlc` によって生成されたデータベースモデルとクエリ。
- `view/`: `html/template` による HTML/XML テンプレート。(注: 実際には`app/template.go`で処理されています)
- `db/`: SQL スキーマ (`schema/`) とクエリ定義 (`query/`)。
- `formatter/`: 各種記法（Hatena, tDiary 等）のパーサ。
- `jobqueue/`: ジョブキューの基盤実装（Worker 監視ループ等）。
- `jobs/`: 具体的なジョブハンドラーの実装。
- `tfidf/`: `TF-IDF` 計算と 2-gram 抽出ロジック。
- `postprocess/`: `Node.js` による HTML ポストプロセススクリプト。
- `static/`: CSS, JS, 画像などの静的アセット。
- `main.go`: エントリーポイント。

## Testing

インメモリ `SQLite` を使用した統合テストが可能。`SQLite` の数学関数を使用するため、`sqlite_math_functions` タグが必要。

```bash
make test
```

`Node.js` によるポストプロセスのテスト:

```bash
make postprocess-test
```
