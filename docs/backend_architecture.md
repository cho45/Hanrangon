# バックエンドの構造と設計パターン

バックエンドのコアロジックは `backend/app` パッケージに集約されており、`AppImpl` 構造体を中心とした設計を採用している。

## App 構造体パターン

すべての HTTP ハンドラやビジネスロジックは、`AppImpl` 構造体のメソッドとして実装する。これにより、各種データベースや設定へのアクセスを統一的に行う。

### AppImpl の定義

`backend/app/app.go` にて定義されている。

```go
type AppImpl struct {
	mainDB               *model.Database[maindb.Querier]
	tfidfDB              *model.Database[tfidfdb.Querier]
	workerDB             *model.Database[workerdb.Querier]
	imagesDB             *model.Database[imagesdb.Querier]
	config               *Config
	// ... その他の依存関係
}
```

### ハンドラの実装

ハンドラは `AppImpl` のポインタレシーバを持つメソッドとして定義する。

```go
func (a *AppImpl) HandleIndex(c echo.Context) error {
    // a.mainDB を使用してデータ取得
    // a.config を参照して動作を切り替え
    return c.Render(http.StatusOK, "index.html", data)
}
```

## 依存性の注入と初期化

1.  **設定の読み込み**: `Config` 構造体に環境変数や設定ファイルから値をロードする。
2.  **データベース接続**: 各 SQLite データベースへの接続を確立し、`model.Database` インスタンスを作成する。
3.  **AppImpl の生成**: 依存関係を注入して `AppImpl` を初期化する。
4.  **ルーティング**: Echo のルートに `AppImpl` のメソッドを紐付ける。

## サービス層

特定のドメインロジックや複雑な処理は、サービス層として `AppImpl` から分離して実装する。

### EntryService

エントリの保存、公開処理、パスの自動採番などのドメインロジックを担当する。`backend/app/entry_service.go` に実装されている。

- `SaveEntry`: エントリのバリデーション、フォーマット、ポストプロセス、DB保存、非同期ジョブの投入を一括して行う。
- `PublishScheduledEntries`: 公開予定日時が過ぎたエントリを自動的に公開状態にする。

### Searcher (TF-IDF)

TF-IDF インデックスを使用した検索ロジックを担当する。`backend/tfidf/searcher.go` に実装されている。特定の技術領域に特化した処理をカプセル化する。

## パス解決の原則

すべてのパス（データベース、テンプレート、静的ファイル、外部スクリプト）は、`app.Config` の `BaseDir` を起点とした絶対パスとして構築する。実行環境に依存しないパス解決を保証するため、相対パスの直接使用は禁止する。