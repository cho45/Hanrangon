# テスト戦略と実行方法

全機能はテストを通して動作の保証を行う。バグに対してはリグレッションテストを追加し退行を防ぐ。
コードに手を加えたら必ずテストを実行すること。

## 全テストの実行

Go (Backend), Postprocess, Admin Frontend のすべてのテストを一括で実行する。

```bash
make test
```

## 1. バックエンド (Go)

バックエンドのテストは Go の標準テストツールを使用する。

### 実行コマンド

```bash
# 全パッケージのテスト実行
make test-go

# 特定パッケージのみ実行 (例: formatter)
# SQLite 数学関数タグが必要な場合がある
go test -v -tags "sqlite_math_functions" ./backend/formatter/...
```

### テストの構造と詳細

1.  **環境セットアップ**: `main_test.go` で `testutil.SetupEnvironment()` を呼び出し、パス解決（BaseDir）を正しく行う。
2.  **ユニットテスト**: `*_test.go` で各コンポーネントのロジックをテスト。
3.  **統合テスト**: HTTP ハンドラのエンドツーエンドテストを実施。

### データベースの初期化

`internal/testutil` を使用して、テストごとにクリーンな SQLite データベースを構築できる。

```go
import "github.com/cho45/hanrangon/internal/testutil"

func TestSomething(t *testing.T) {
    // 4 つのデータベース（Main, TFIDF, Worker, Images）を自動生成する
    dbs := testutil.SetupAllDBs(t)
    defer dbs.Close()

    // dbs.MainDB.Q などから sqlc 生成のクエリを実行できる
    entry, err := dbs.MainDB.Q.GetEntry(ctx, "entry-id")

    // トランザクションの使用例
    err = dbs.MainDB.WithTx(ctx, func(q maindb.Querier) error {
        return q.UpdateEntry(ctx, params)
    })
}
```

- タイムゾーンは `Asia/Tokyo` に統一。
- `dbs.MainDB` などの各フィールドは `model.Database[Q]` 型のラッパーになっており、以下の機能を持つ：
    - `.Q`: `sqlc` で生成された Querier インターフェース。直接クエリを実行可能。
    - `.DB`: `*sql.DB` 本体へのアクセス。
    - `.WithTx(ctx, fn)`: トランザクション内での処理実行。
    - `.BeginTxx(ctx, opts)`: トランザクション（`*model.Transaction[Q]`）の開始。

---

## 2. ポストプロセス (Node.js)

HTML 変換後の DOM 操作、数式レンダリング、シンタックスハイライトなどの検証を行う。

### 実行コマンド

```bash
make postprocess-test
```

### テストの詳細

Node.js 標準のテストランナーを使用し、`postprocess/test/` 以下のファイルを検証する。

---

## 3. 管理画面 (Admin Frontend)

Svelte SPA として実装されている管理画面の型チェックとコンポーネントテストを行う。

### 事前準備

管理画面の型定義は Go の構造体から自動生成されている。バックエンドのモデルに変更を加えた場合、テスト実行前に必ず以下のコマンドを実行すること。

```bash
make generate
```

これによって `tygo` が実行され、`admin-frontend/src/lib/types/generated/` 以下の TypeScript 型定義が更新される。

### 実行コマンド

```bash
make admin-test
```

### テストの詳細

- **`svelte-check`**: Svelte コンポーネントの型チェック、未定義変数の検出を行う。自動生成された型との不整合もここで検知される。
- **`vitest`**: `testing-library/svelte` および `jsdom` を使用。コンポーネントのレンダリング、ユーザーインタラクション、API クライアントのロジックをテストする。