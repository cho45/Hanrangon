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
├── app/                 # アプリケーションのコアロジック
│   ├── app.go           # App構造体、認証ミドルウェア
│   ├── config.go        # 設定読み込み (TOML + 環境変数)
│   ├── handler_public.go # 公開ページハンドラ
│   ├── handler_admin.go  # 管理画面ハンドラ
│   ├── server.go        # Echoサーバー設定
│   └── template.go      # テンプレート管理
├── model/               # sqlc生成のDBアクセスコード (編集禁止)
├── view/                # html/template テンプレート
│   ├── *.html          # テンプレートファイル
│   ├── data.go         # テンプレートデータ構造定義
│   └── helper.go       # テンプレート用ヘルパー関数
├── formatter/           # テキストフォーマッタ
│   ├── formatter.go    # フォーマット振り分け
│   ├── html.go         # HTMLフォーマッタ
│   ├── markdown.go     # Markdownフォーマッタ
│   ├── hatena.go       # Hatena記法フォーマッタ
│   ├── tdiary.go       # tDiary記法フォーマッタ
│   └── *_test.go       # 各フォーマッタのテスト
├── db/
│   ├── schema/         # SQLスキーマ定義
│   │   ├── schema.sql      # メインDB (entries, images等)
│   │   ├── tfidf.sql       # TF-IDF検索用DB
│   │   └── images.sql      # 画像メタデータDB
│   └── query/          # sqlc用SQLクエリ定義
│       ├── entries.sql
│       └── tfidf.sql
├── cmd/migration-test/  # 旧実装との互換性検証ツール
├── xatena-go/          # Hatena記法パーサー (gitサブモジュール/ローカル依存)
├── static/             # 静的ファイル (CSS, JS, images)
└── var/db/             # 実行時データベースファイル置き場
```

### 主要な設計パターン

#### 1. データベース層 (sqlc)

- `db/schema/*.sql`: スキーマ定義 → SQLiteデータベース作成に使用
- `db/query/*.sql`: クエリ定義 → sqlcが型安全なGoコードを生成
- `model/`: 生成されたコード (手動編集禁止)
- テストでは `:memory:` SQLiteを使用し、スキーマファイルを読み込んで初期化

**重要**: `db/schema/` や `db/query/` を変更した場合は必ず `sqlc generate` を実行

#### 2. テンプレート層 (html/template)

- `view/*.html`: テンプレートファイル
- `view/data.go`: テンプレートに渡すデータ構造の定義
- `view/helper.go`: テンプレート用ヘルパー関数
- `app/template.go`: テンプレート管理（開発モードでの自動リロード対応）
- Go標準の `html/template` + `Masterminds/sprig` を使用

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

1. **ユニットテスト**: 各パッケージの `*_test.go` でロジック単体をテスト
2. **統合テスト**: `main_test.go` でHTTPハンドラをエンドツーエンドでテスト
   - in-memoryデータベースを使用
   - `internal/testutil` パッケージでDB初期化
3. **マイグレーションテスト**: `cmd/migration-test/` で旧Perl実装との出力一致性を検証
   - `var/db/data.db` の実データに対して実行
   - HTML正規化＋diff比較でフォーマッタの正しさを保証

#### テストデータベースの初期化

全てのテストで `internal/testutil` パッケージを使用してデータベースを初期化する:

```go
import "github.com/cho45/hanrangon/internal/testutil"

// 全DBが必要な場合（Main, TFIDF, Worker, Images）
dbs := testutil.SetupAllDBs(t)
defer dbs.Close()

// 特定のDBのみ使用する場合
dbs := testutil.SetupAllDBs(t)
defer dbs.Close()
db := dbs.Worker          // Worker DBのみ使用
queries := dbs.WorkerQueries

// Main + TFIDF DBを使用する場合（TF-IDF関連テスト）
dbs := testutil.SetupAllDBs(t)
defer dbs.Close()
dataDB, dataQueries := dbs.Main, dbs.MainQueries
tfidfDB, tfidfQueries := dbs.TFIDF, dbs.TFIDFQueries
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

1. **生成コードの編集禁止**
   - `model/*.go` (sqlc生成)

2. **フォーマッタの変更時**
   - 必ず対応するテストを追加・更新
   - `cmd/migration-test` で既存データとの互換性を確認
   - テストは実装の正しさを保証するためのもので、通すことが目的ではない

3. **データベーススキーマ変更時**
   - `db/schema/*.sql` を編集
   - `sqlc generate` を実行
   - 必要に応じてマイグレーションスクリプトを作成

4. **テンプレート変更時**
   - `view/*.html` を直接編集
   - 開発モード（デフォルト）では、ブラウザリロードで即座に反映
   - ビルドやコード生成は不要

5. **インポート管理**
   - 手動でのインポート文の追加・削除は禁止
   - 必ず `goimports` を使用してフォーマット
