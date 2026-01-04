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

- Go 1.24+
- Node.js (記事保存時のポストプロセスおよび管理画面のビルドに使用)
- `sqlc` CLI (DB コード生成に使用)
- `goimports` (コードのフォーマットに使用)

## Setup & Run

### 1. 依存ツールのインストール

```bash
# sqlc (DB コード生成)
go install github.com/sqlc-dev/sqlc/cmd/sqlc@latest

# goimports (コードフォーマット)
go install golang.org/x/tools/cmd/goimports@latest

# Admin Frontend (Vite/Svelte 5)
cd admin-frontend
npm install
npm run build
cd ..

# Node.js 依存関係 (ポストプロセス)
cd postprocess
npm install
cd ..
```

### 2. コード生成

```bash
make generate
```

### 3. 設定

`config.toml.sample` を `config.toml` にコピーし、必要に応じて編集します。

```bash
cp config.toml.sample config.toml
```

### 4. サーバーの起動

```bash
make run
```

デフォルトで http://localhost:5555 でリッスンします。

## Subcommands

Hanrangon は以下のサブコマンドをサポートしています。

- `serve`: サーバーの起動（デフォルト）
- `reformat`: 全記事の再フォーマット
- `recalc-tfidf`: TF-IDF の再計算
- `backup`: データベースのバックアップ
- `index-images`: 画像のインデックス作成
- `update-password`: 管理者パスワードの更新

実行例:
```bash
go run -tags "sqlite_math_functions" . update-password
```

## 管理画面 (Admin Panel)

SPA (Single Page Application) として実装されたモダンな管理画面を提供します。

- **技術スタック:** Svelte 5, Vite, TypeScript
- **主な機能:**
    - **エントリ管理:** 記事の作成・編集・削除。オートセーブ機能や画像アップロード、公開予約に対応。
    - **ジョブ監視:** 内蔵ジョブキューの実行状況、エラーログの確認。
    - **システム情報 (Info):** アプリケーションのハッシュ、稼働時間、メモリ使用量、構成設定の確認。
- **開発とビルド:**
    - `admin-frontend/` ディレクトリで `npm run dev` を実行することで HMR (Hot Module Replacement) 有効な開発が可能です。
    - `npm run build` を実行すると、ビルドされた成果物が `static/admin/` に出力され、Go サーバー経由で配信されます。

## Project Structure

- `app/`: アプリケーションのコアロジック（ハンドラー、サーバー構成、設定）。
- `admin-frontend/`: Svelte 5 による SPA 管理画面のソースコード。
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

インメモリ SQLite を使用した統合テストが可能です。SQLite の数学関数を使用するため、`sqlite_math_functions` タグが必要です。

```bash
make test
```

Node.js によるポストプロセスのテスト:

```bash
make postprocess-test
```