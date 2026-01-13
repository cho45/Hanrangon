# tygo 導入による BE/FE 型共有の実施計画 (改訂版)

## 1. 現状の構造体の配置
管理画面 (Svelte SPA) が API 経由でやり取りし、共有が必要な構造体は以下の通りです。

- **対象（APIで露出するもの）**:
  - `backend/model/models.go`: `Entry`, `Image`, `Job` などのデータベースモデル（sqlc 生成）。これらは管理画面の各一覧・詳細 API で直接返却されています。
  - `backend/app/handler_admin.go`: `EditRequest`, `EditResponse` などの管理画面専用 API のリクエスト/レスポンス構造体。
- **対象外（SSR用）**:
  - `backend/view/data.go`: `ViewEntry`, `IndexData` など。これらは公開側の Go テンプレートレンダリング用であり、管理画面の JS からは参照されないため、`tygo` の抽出対象から除外します。

## 2. 導入ステップ

### ステップ 1: tygo のインストールと設定
1.  `tygo` をインストール（`go install github.com/gzuidhof/tygo@latest`）。
2.  プロジェクトルートに `tygo.yaml` を作成。

### ステップ 2: 自動生成の設定 (tygo.yaml)
API で実際に使用されているパッケージと構造体のみをターゲットに指定します。

```yaml
packages:
  - path: "github.com/cho45/hanrangon/backend/model"
    target: "admin-frontend/src/lib/types/models.ts"
    # 必要に応じて、SSR専用の構造体が含まれるパッケージは除外、または include で明示
  - path: "github.com/cho45/hanrangon/backend/app"
    target: "admin-frontend/src/lib/types/api.ts"
    include:
      - "EditRequest"
      - "EditResponse"
      - "ProgressMessage"

type_mappings:
  "database/sql.NullString": "string | null"
  "database/sql.NullInt64": "number | null"
  "database/sql.NullTime": "string | null"
  "time.Time": "string"
```

### ステップ 3: Makefile への組み込み
`Makefile` に `gen-types` ターゲットを追加し、`sqlc generate` と同様に手軽に実行できるようにします。

```makefile
gen-types:
	tygo generate
```

## 3. 期待される効果
- **API 通信の型安全**: `admin-frontend/src/lib/api.svelte.ts` 等で API レスポンスを受け取る際、`Entry` 型などのプロパティ補完が効くようになり、LLM も正確なコードを生成できます。
- **不整合の早期発見**: DB スキーマを変更して `sqlc generate` した際、その影響が `tygo` を通じてフロントエンドの型エラーとして即座に現れます。