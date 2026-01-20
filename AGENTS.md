# Hanrangon (Go実装) - AIエージェント プロトコル

## 🛑 飛行前チェックリスト (必須)

コードを書く前に、以下のチェックリストから関連する項目を**必ず**あなたの計画に追加しなければなりません：

- [ ] **コンテキスト**: `AGENTS.md` (このファイル) を読む。
- [ ] **アーキテクチャ**: `docs/backend_architecture.md` を読む (`AppImpl` と `BaseDir` を理解する)。
- [ ] **テスト**: `docs/how-to-testing.md` を読む (`testutil` と DBセットアップを理解する)。
- [ ] **データベース** (DB編集時): `docs/database_design.md` と `backend/db/schema/` を読む。
- [ ] **フロントエンド** (UI編集時): `docs/ssr-view-and-templating.md` または `admin-frontend/README.md` を読む。

---

## ⚡️ 重大な「飛行禁止」区域 (立ち入り禁止)

これらのルールに違反すると、即座にビルド失敗やアーキテクチャの退行を引き起こします。

1.  **⛔️ 相対パス禁止**: すべてのファイル操作はルートとして `app.Config.BaseDir` を使用しなければなりません。実行時のファイルアクセスに `./` や `../` を決して使用しないでください。
2.  **⛔️ 読み取り専用ディレクトリ**:
    - `backend/model/`: これらは **sqlc によって生成**されます。決して手動で編集しないでください。
    - `admin-frontend/src/lib/types/generated/`: `tygo` によって生成されます。
    - **アクション**: `backend/db/schema` または Go構造体を修正し、その後 `make generate` を実行してください。
3.  **⛔️ 厳格なテスト順序**:
    - 変更**前**に `make test` を実行しなければなりません (ベースラインの確立)。
    - 変更**後**に `make lint` と `make test` を実行しなければなりません。
    - 「たぶん動く」と決して仮定しないでください。

---

## 🗺 タスク別ドキュメントマップ

タスクの種類を特定し、必要なファイルを即座に**読んで**ください。

| タスクカテゴリ | 必読資料 | 重要なコマンド |
| :--- | :--- | :--- |
| **コアロジック / ハンドラ** | [`docs/backend_architecture.md`](docs/backend_architecture.md) | `AppImpl` メソッドを使用 |
| **データベース / スキーマ** | [`docs/database_design.md`](docs/database_design.md) | `make generate` |
| **HTML / テンプレート** | [`docs/ssr-view-and-templating.md`](docs/ssr-view-and-templating.md) | `make postprocess-test` |
| **コンテンツ / Markdown** | [`docs/content_pipeline.md`](docs/content_pipeline.md) | `go test ./backend/formatter/...` |
| **テスト / デバッグ** | [`docs/how-to-testing.md`](docs/how-to-testing.md) | `make test` |

---

## 🛠 主要コマンド (チートシート)

```bash
# 1. ここから開始
make run              # 開発サーバー起動
make test             # 全テスト実行 (Go + Node + Frontend)

# 2. コード生成 (DB/構造体変更後に実行)
make generate

# 3. 個別テスト
make test-go          # バックエンドのみ
make postprocess-test # HTML/レンダリング検証
make admin-test       # Svelte フロントエンド
```

## 🏗 アーキテクチャのハイライト

- **App 構造**: モノリシックな `AppImpl` 構造体 (`backend/app/app.go`) が全ての依存関係 (DB, Config) を保持します。ハンドラは `*AppImpl` のメソッドです。
- **データベース**: 4つの分割された SQLite DB (`main`, `images`, `tfidf`, `worker`)。理由は `docs/database_design.md` を参照してください。
- **フロントエンド**: ハイブリッド構成。公開サイトは Go SSR + Node.js Postprocess。管理画面は Svelte SPA です。
