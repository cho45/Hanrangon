# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

HanrangonはNogag (Perl/PSGI) ブログシステムのGo言語による書き直し実装。Echo フレームワークベースのWebアプリケーションで、複数のテキストフォーマット（HTML、Markdown、Hatena記法、tDiary記法）をサポートする。

## 主要コマンド

### コード生成

```bash
# データベースアクセスコード生成 (model/ ディレクトリ)
sqlc generate

# テンプレートコード生成 (view/*_templ.go ファイル)
templ generate

# 両方を実行する場合
sqlc generate && templ generate
```

### テスト実行

```bash
# 全テスト実行
go test ./...

# 特定パッケージのテスト
go test ./formatter/...

# 詳細出力付きテスト
go test -v ./formatter/...

# 特定のテスト関数のみ実行
go test -v -run TestFormatHatena ./formatter/
```

### マイグレーションテスト

旧Perl実装からの移行検証ツール:

```bash
# 全エントリのフォーマット出力を旧実装と比較
go run cmd/migration-test/main.go

# 特定ID のエントリのみテスト（詳細diff表示）
go run cmd/migration-test/main.go -id 123

# 特定フォーマットのみテスト
go run cmd/migration-test/main.go -format Hatena

# 詳細表示モード
go run cmd/migration-test/main.go -v
```

### 開発サーバー起動

```bash
# デフォルト設定で起動 (http://localhost:5555)
go run .

# 設定ファイル指定
HANRANGON_CONFIG=/path/to/config.toml go run .
```

### コードフォーマット

```bash
# 単一ファイル
goimports -w path/to/file.go

# 全Goファイル
find . -name "*.go" -not -path "./vendor/*" -not -path "./*_templ.go" -exec goimports -w {} \;
```

## アーキテクチャ

### ディレクトリ構造

```
.
├── main.go              # エントリポイント、サーバー設定
├── app.go               # App構造体、認証ミドルウェア
├── config.go            # 設定読み込み (TOML + 環境変数)
├── handler_public.go    # 公開ページハンドラ
├── handler_admin.go     # 管理画面ハンドラ
├── model/               # sqlc生成のDBアクセスコード (編集禁止)
├── view/                # templテンプレート
│   ├── *.templ         # テンプレートソース (これを編集)
│   └── *_templ.go      # 生成コード (編集禁止)
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

#### 2. テンプレート層 (templ)

- `view/*.templ`: テンプレートソース
- `view/*_templ.go`: 生成されたGoコード (手動編集禁止)
- templはコンポーネントベースで型安全なテンプレートを提供

**重要**: `*.templ` ファイルを変更した場合は必ず `templ generate` を実行

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
   - `setupTestDB()` でスキーマ読み込み＆初期化
3. **マイグレーションテスト**: `cmd/migration-test/` で旧Perl実装との出力一致性を検証
   - `var/db/data.db` の実データに対して実行
   - HTML正規化＋diff比較でフォーマッタの正しさを保証

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
   - `view/*_templ.go` (templ生成)

2. **フォーマッタの変更時**
   - 必ず対応するテストを追加・更新
   - `cmd/migration-test` で既存データとの互換性を確認
   - テストは実装の正しさを保証するためのもので、通すことが目的ではない

3. **データベーススキーマ変更時**
   - `db/schema/*.sql` を編集
   - `sqlc generate` を実行
   - 必要に応じてマイグレーションスクリプトを作成

4. **テンプレート変更時**
   - `view/*.templ` を編集
   - `templ generate` を実行

5. **インポート管理**
   - 手動でのインポート文の追加・削除は禁止
   - 必ず `goimports` を使用してフォーマット
