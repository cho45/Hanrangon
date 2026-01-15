# コンテンツパイプライン

記事の保存から表示までの変換プロセスと非同期処理。

## 処理フロー

### 1. メインパイプライン (同期)

記事保存時、または予約投稿の公開時に実行。`backend/app/entry_service.go` が担当。

1.  **フォーマット**: 各種記法（Markdown, Hatena, tDiary）を HTML に変換。
2.  **ポストプロセス**: Node.js サイドカーによる高度なレンダリング（MathJax, Highlight.js）。
3.  **メタデータ抽出**: HTML から要約と OGP 用画像 URL を抽出。
4.  **DB 保存**: 最終 HTML とメタデータを `entries` テーブルに永続化。

### 2. 非同期ジョブ (バックグラウンド)

公開状態（`public`）の記事に対して、`backend/jobqueue` を介して実行。

- **RecalculateTFIDF**: 2-gram による TF-IDF 計算と関連記事の更新。
- **UpdateTrackbacks**: 記事内リンク先へのトラックバック送信。
- **IndexImages**: 画像解析と類似画像検索用インデックスの作成。

## コンポーネント

### フォーマッタ (`backend/formatter/`)

- **Markdown**: `goldmark` (GFM)
- **Hatena**: `backend/xatena-go` (自作パッケージ)
- **tDiary**: 専用パーサ

### ポストプロセス (Node.js サイドカー)

`postprocess/main.js` を `exec.Command` で呼び出し、`jsdom` 上で処理。

- **MathJax**: 数式レンダリング。
- **Highlight.js**: シンタックスハイライト。
- **その他**: DOM 操作によるウィジェット展開。

### ジョブキュー (`backend/jobqueue/`)

SQLite (`worker.db`) をバックエンドとした独自のキュー実装。

- 指数バックオフによる自動リトライ。
- プロセス再起動時のスタックジョブ自動回復。