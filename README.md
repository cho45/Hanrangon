# Hanrangon (Go Implementation)

Perl 版 Nogag (氾濫原) の Go (Golang) によるリライトプロジェクト。
"Hanra-n-Go-n" (氾濫原 + Go).

## 特徴

- **高速・省メモリ:** Go によるネイティブ実装。
- **SQLite 活用:** Data, Images, TF-IDF, Worker の 4 つのデータベースに分離して管理。
- **マルチフォーマット:** はてな記法、tDiary 記法、Markdown、HTML に対応。
- **高度なテキスト処理:** Kagome による分かち書きと SQL を活用した高速な TF-IDF 計算（関連記事抽出）。
- **モダンなレンダリング:** `html/template` によるサーバーサイドレンダリングと、Node.js による MathJax/Syntax Highlight のポストプロセス。
- **内蔵ジョブキュー:** アプリケーションと統合された SQLite ベースの非同期ジョブ実行システム。

## Prerequisites

- Go 1.23+
- Node.js (記事保存時のポストプロセスに使用)
- `sqlc` CLI

## Setup & Run

### 1. 依存ツールのインストール

```bash
# sqlc (DB コード生成)
go install github.com/sqlc-dev/sqlc/cmd/sqlc@latest

# Node.js 依存関係 (ポストプロセス)
cd postprocess
npm install
cd ..
```

### 2. コード生成

```bash
# SQL クエリからの Go コード生成
sqlc generate
```

### 3. 設定

`config.toml.sample` を `config.toml` にコピーし、必要に応じて編集します。

```bash
cp config.toml.sample config.toml
```

### 4. サーバーの起動

```bash
go run .
```

デフォルトで http://localhost:5555 でリッスンします。

## Project Structure

- `app/`: アプリケーションのコアロジック（ハンドラー、サーバー構成、設定）。
- `model/`: `sqlc` によって生成されたデータベースモデルとクエリ。
- `view/`: `html/template` による HTML/XML テンプレート。
- `db/`: SQL スキーマ (`schema/`) とクエリ定義 (`query/`)。
- `formatter/`: 各種記法（Hatena, tDiary 等）のパーサ。
- `jobqueue/`: ジョブキューの基盤実装（Worker 監視ループ等）。
- `jobs/`: 具体的なジョブハンドラーの実装。
- `tfidf/`: TF-IDF 計算と形態素解析（Kagome）。
- `postprocess/`: Node.js による HTML ポストプロセススクリプト。
- `static/`: CSS, JS, 画像などの静的アセット。
- `main.go`: エントリーポイント。

## Testing

インメモリ SQLite を使用した統合テストが可能です。

```bash
go test ./...
```