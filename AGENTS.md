# Hanrangon (Go Implementation)

## プロジェクト概要

HanrangonはブログシステムのGo実装。Echoフレームワークベースで、複数テキストフォーマットをサポート。

## 主要コマンド

```bash
# ビルド・実行・生成
make build | make run | make clean | make generate | make fmt

# テスト (全テスト / 特定パッケージ)
make test
go test -v -tags "sqlite_math_functions" ./formatter/...

# 開発サーバー起動 (通常 / 設定指定 / 本番モード)
go run .
HANRANGON_CONFIG=/path/to/config.toml go run .
HANRANGON_ENV=production go run .
```

## アーキテクチャ

### ディレクトリ構造

- **Backend (Go)**: `backend/app/` (コア), `backend/db/` (SQL), `backend/model/` (sqlc生成), `backend/formatter/` (変換), `backend/tfidf/` (解析), `backend/jobqueue/` (ジョブ), `backend/subcommands/` (CLI), `backend/view/` (SSR)
- **Frontend & Assets**: `admin-frontend/` (Svelte SPA), `static/` (静的), `postprocess/` (Node.js)
- **Other**: `internal/` (共通), `var/` (データ), `main.go` (エントリ)

### 主要な設計パターン

- **パス解決 (BaseDir)**: `app.Config.BaseDir` 起点の絶対パス構築。詳細は [docs/backend_architecture.md](docs/backend_architecture.md)。
- **データベース層 (sqlc)**: `backend/model/` 下に自動生成（編集禁止）。詳細は [docs/database_design.md](docs/database_design.md)。
- **テンプレート層**: `backend/view/` 下の `html/template` を使用。詳細は [docs/ssr-view-and-templating.md](docs/ssr-view-and-templating.md)。
- **App 構造体パターン**: `AppImpl` メソッドとして全ハンドラを実装。サービス層（`EntryService` 等）によるロジック分離。詳細は [docs/backend_architecture.md](docs/backend_architecture.md)。
- **コンテンツパイプライン**: `formatter.Format` による HTML 変換。詳細は [docs/content_pipeline.md](docs/content_pipeline.md)。

## 開発時の注意事項

1. **AIエージェントへの厳命 (Mandates for AI Agents)**: `make test` -> `make lint` -> `make test` の順で検証を徹底。テストの詳細は [docs/how-to-testing.md](docs/how-to-testing.md) を参照。
2. **ディレクトリ移動への配慮**: インポートには常に `github.com/cho45/hanrangon/backend/...` を使用。
3. **生成コードの編集禁止**: `backend/model/` 以下の `sqlc` 生成ファイル。
4. **型定義ルール**: `tygo` を使用。フロントエンドでは `admin-frontend/src/lib/types/models.ts` からインポート。
