# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

HanrangonはNogag (Perl/PSGI) ブログシステムのGo言語による書き直し実装。Echo フレームワークベースのWebアプリケーションで、複数のテキストフォーマット（HTML、Markdown、Hatena記法、tDiary記法）をサポートする。

## 主要コマンド

### ビルドと実行

```bash
# ビルド
make build

# 実行
make run

# クリーンアップ
make clean
```

### コード生成

```bash
# データベースアクセスコード生成 (model/ ディレクトリ)
make generate
```

### テスト実行

```bash
# 全テスト実行
make test

# 特定パッケージのテスト (tagsが必要な点に注意)
go test -tags "sqlite_math_functions" ./formatter/...

# 詳細出力付きテスト
go test -v -tags "sqlite_math_functions" ./formatter/...
```

### 開発サーバー起動

```bash
# デフォルト設定で起動 (http://localhost:5555)
# デフォルトで開発モード（テンプレート自動リロード）
go run .

# 設定ファイル指定
HANRANGON_CONFIG=/path/to/config.toml go run .

# 本番モード（テンプレート起動時1回のみロード）
HANRANGON_ENV=production go run .
```

### コードフォーマット

```bash
# プロジェクト全体のフォーマット (goimports + go fmt)
make fmt

# 単一ファイル
goimports -w path/to/file.go
```

## アーキテクチャ

### ディレクトリ構造

```
.
├── main.go              # エントリポイント
├── backend/             # メインバイナリを構成するコアロジック
│   ├── app/             # アプリケーション設定、HTTPハンドラ
│   ├── db/              # SQLスキーマとクエリ定義
│   ├── model/           # sqlc生成コード (編集禁止)
│   ├── view/            # SSR用 html/template
│   ├── formatter/       # 各種記法パーサー
│   ├── tfidf/           # TF-IDF関連記事解析
│   ├── jobqueue/        # ジョブキュー基盤 (SQLite)
│   ├── jobs/            # 非同期ジョブ実装
│   ├── subcommands/     # CLIサブコマンド実装
│   └── xatena-go/       # はてな記法パーサー
├── internal/            # プロジェクト共通ユーティリティ (テストヘルパー等)
├── cmd/                 # 独立したビルド対象ツール群
├── admin-frontend/      # Svelte 5 管理画面 (SPA)
├── static/              # 静的ファイル (CSS, JS, images)
├── postprocess/         # Node.js サイドカー
└── var/                 # 実行時データ (SQLite DB, キャッシュ)
```

### 主要な設計パターン

#### 1. 堅牢なパス解決 (BaseDir)

- `app.Config` に `BaseDir` フィールドを持ち、すべてのパス（DB、テンプレート、静的ファイル、外部スクリプト）はこの `BaseDir` を起点とする絶対パスとして構築される。
- メイン実行時はカレントディレクトリがデフォルトの `BaseDir` となる。
- テスト実行時は `internal/testutil.SetupEnvironment()` を呼び出すことで、リポジトリルートを自動特定し、環境変数 `HANRANGON_BASE_DIR` を通じて `BaseDir` が設定される。

#### 2. データベース層 (sqlc)

- `backend/db/schema/*.sql`: スキーマ定義
- `backend/db/query/*.sql`: クエリ定義
- `backend/model/`: 生成されたコード (手動編集禁止)

**重要**: スキーマやクエリを変更した場合は必ず `make generate` を実行。

#### 3. テンプレート層 (html/template)

- `backend/view/*.html`: テンプレートファイル。
- `backend/app/template.go`: `BaseDir` を起点にテンプレートをロード。
- Go標準の `html/template` + `Masterminds/sprig` を使用。

**開発モード**: デフォルトで有効。テンプレートファイルを変更すると、ブラウザリロードで即座に反映される（ビルド不要）

**本番モード**: `HANRANGON_ENV=production` で起動すると、テンプレートは起動時に1回のみロードされる

#### 3. App構造体パターン

```go
type App struct {
    queries      *model.Queries  // メインDBクエリ
    db           *sql.DB
    tfidfQueries *model.Queries  // TF-IDF DBクエリ
    tfidfDB      *sql.DB
    config       *Config
}
```

すべてのハンドラは `App` のメソッドとして実装され、データベースと設定にアクセス可能。

#### 4. フォーマッタ抽象化

`formatter.Format(body, formatType)` が振り分け役となり、各フォーマット専用の関数を呼び出す:

- `FormatHTML()`: HTMLをそのまま処理（CDATAセクション展開、コメント削除）
- `FormatMarkdown()`: goldmarkでMarkdown→HTML変換
- `FormatHatena()`: xatena-goパッケージでHatena記法→HTML変換
- `FormatTDiary()`: tDiary記法→HTML変換

**重要**: Hatena記法は `xatena-go` という別パッケージに依存。このパッケージは同リポジトリ内の `xatena-go/` サブディレクトリで開発されている。

### テスト戦略

1. **TestMainによる環境セットアップ**: 各パッケージの `main_test.go` で `testutil.SetupEnvironment()` を呼び、パス解決とダミー設定ファイルの準備を行う。
2. **ユニットテスト**: 各パッケージの `*_test.go` でロジック単体をテスト。
3. **統合テスト**: `main_test.go` で HTTP エンドツーエンドテスト。

#### テストデータベースの初期化

`internal/testutil` パッケージを使用する:

```go
import "github.com/cho45/hanrangon/internal/testutil"

func TestSomething(t *testing.T) {
    // TestMain で SetupEnvironment() が呼ばれている前提
    dbs := testutil.SetupAllDBs(t)
    defer dbs.Close()
    // ...
}
```

**重要な特徴**:
- 全テストで `Asia/Tokyo` タイムゾーンに統一
- 4つのDB（Main, TFIDF, Worker, Images）と対応するQueriesを自動生成
- プロジェクトルートから相対パスでスキーマファイルを読み込み
- 一貫したエラーハンドリングとt.Helper()の使用

## 設定管理

設定は以下の優先順位で読み込まれる:

1. `config.toml` (デフォルト) または `HANRANGON_CONFIG` 環境変数で指定
2. 個別の環境変数でオーバーライド可能:
   - `HANRANGON_DB_DATA`
   - `HANRANGON_DB_IMAGES`
   - `HANRANGON_DB_TFIDF`
   - `HANRANGON_STATIC_DIR`

## 依存パッケージの重要な注意点

### xatena-go (Hatena記法パーサー)

このプロジェクトの `xatena-go/` ディレクトリは独立したGoモジュールで、Hatena記法のパース機能を提供する。

- `go.mod` では `github.com/cho45/xatena-go` として参照
- ローカル開発時は同じリポジトリ内のサブディレクトリを参照
- `formatter/hatena.go` がこのパッケージを使用してHatena記法を変換

**変更を加える場合**: `xatena-go/` 内で独立して開発・テストを行い、必要に応じてメインプロジェクトから参照

## 開発時の注意事項

1. **AIエージェントへの厳命 (Mandates for AI Agents)**
   コード修正後は必ず以下の順序で検証を行うこと：
   - **機能検証 (最優先)**: `make test` を実行し、全テストが通ることを確認。
   - **品質検証**: テスト通過後、`make lint` を実行。すべての指摘を解消する。理由なき無視は禁止。
   - **最終検証**: リンター対応でコードを変更した場合は、再度 `make test` を確認。

2. **ディレクトリ移動への配慮**
   パッケージが `backend/` 下に移動したため、新規ファイル作成やインポート時には常に `github.com/cho45/hanrangon/backend/...` を使用すること。

3. **生成コードの編集禁止**
   - `backend/model/*.go` (sqlc生成)

4. **インポート管理**
   - 手動編集は避け、常に `make fmt` (goimports) に任せること。
