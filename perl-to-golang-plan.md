# Perl to Go Migration Plan

Nogag (Perl/PSGI) プロジェクトを、**軽量・モダン・シングルバイナリ** な Go (Golang) プロジェクトへリライトするための移行計画書。

## プロジェクト目標

1.  **ランタイムの刷新:** Perl (v5.14) から Go (Latest) へ移行する。
2.  **シングルバイナリ化:** アプリケーション全体を単一の実行ファイルにコンパイルし、デプロイを簡素化する。
3.  **省メモリ:** メモリ2GBのサーバーで最大限のパフォーマンスを発揮するよう、フットプリントを極小化する。
4.  **アーキテクチャの維持:** 既存のデータ構造 (SQLite) やファイルシステム (画像格納先) を維持しつつ、モダンな開発手法を取り入れる。

## 技術スタック選定

| コンポーネント | 移行後の技術 | 選定理由 |
| :--- | :--- | :--- |
| **言語** | Go (Golang) | 省メモリ、シングルバイナリ、並行処理の容易さ。 |
| **Webフレームワーク** | `labstack/echo` または標準 `net/http` | 軽量かつ必要十分な機能。 |
| **DBドライバ** | `modernc.org/sqlite` | CGO不要 (Pure Go) なため、クロスコンパイルが容易でポータブル。 |
| **ORM / Query Builder** | `sqlc` | SQLファイルから型安全なGoコードを生成。実行時オーバーヘッドが皆無。 |
| **テンプレート** | `a-h/templ` | Goコードとしてコンパイルされる型安全なテンプレート。高速かつ堅牢。 |
| **ジョブキュー** | Go Native (Goroutine + SQLite) | `TheSchwartz` (Perl) を廃止し、アプリ内蔵の軽量キューシステムを実装。 |
| **テキスト整形** | `cho45/xatena-go` + 自作tDiaryパーサ | 既存のHatena/tDiary記法をGoでパース・HTML化。 |
| **日本語分かち書き** | `nyarla/go-japanese-segmenter` | 辞書内蔵・ゼロアロケーションのTinySegmenter移植版。省メモリ。 |
| **MathJax処理** | Node.js (On-demand execution) | 常駐デーモンを廃止し、必要な時だけ `exec.Command` でNodeスクリプトを実行。 |

## 詳細移行方針

### 1. テンプレートエンジン (HTML生成)
*   **現状:** `Text::Xslate` (TTerse記法) を使用。
*   **移行:** `templ` コンポーネントへ書き換え。
    *   ロジック（日付フォーマット、条件分岐）はGo側の `Handler` や `ViewModel` に寄せ、テンプレートは表示に専念させる。
    *   コンパイル時の型チェックにより、リファクタリング耐性を確保。

### 2. 独自記法 (Hatena / tDiary)
*   **Hatena記法:** `github.com/cho45/xatena-go` を利用。
*   **tDiary記法:** `lib/Nogag/Formatter/tDiary.pm` を参考に、Goの `regexp` パッケージを用いて再実装する。
    *   対象タグ: `bq`, `a`, `ul`, `ol`, `fn`, `my` (独自リンク記法)。

### 3. 日本語処理 (TF-IDF / 関連記事)
*   **分かち書き:** `nyarla/go-japanese-segmenter` を採用。
    *   辞書データがバイナリの `.text` 領域（読み取り専用）に配置されるため、ヒープメモリを圧迫しない。
    *   TF-IDF計算ロジック自体はGoで再実装。

### 4. データベース構成
*   **ファイル構成:** 現状の分割構成 (`data.db`, `cache.db`, `images.db` 等) を維持。
    *   Go側で複数の `*sql.DB` インスタンスを管理する。
    *   無理な統合は避け、マイグレーションリスクを低減。

### 5. 非同期処理 (Worker)
*   **アーキテクチャ:** Webサーバープロセス内にWorker機能を統合。
*   **実装:**
    *   `jobs` テーブル (SQLite) をポーリングするGoroutineを起動。
    *   外部プロセス (Workerプロセス) を廃止し、運用の手間を削減。

### 6. 外部ランタイム (Node.js)
*   **MathJax / Syntax Highlight:**
    *   Syntax Highlight は `chroma` (Pure Go) で置換し、Node.js依存を排除可能か検討。
    *   MathJax (数式) は代替が難しいため、Node.jsスクリプト (`script/postprocess-js-daemon.js` のロジックの一部) を「CLIツール」として再構築。
    *   Goから `exec.Command` で都度実行する形に変更し、メモリ常駐デーモンを撤廃。
    *   サーバーには `node` バイナリだけあれば良い（`npm install` 不要な単一スクリプトにするのが望ましい）。

## デプロイ戦略 (Single Binary)

*   **成果物:**
    *   Goバイナリ (`nogag`)
    *   Node.jsヘルパースクリプト (`render.js`) ※MathJax用
    *   静的アセット (`static/`) ※バイナリに `embed` することも検討可能だが、画像ファイル等の扱いに注意が必要。
*   **手順:**
    1.  開発機で `GOOS=linux GOARCH=amd64 go build`。
    2.  成果物をサーバーへ `scp`。
    3.  `systemd` 等でサービス化して起動。
*   **依存関係:**
    *   サーバー上に `node` ランタイムのみ必要（MathJaxを使う場合）。それ以外は一切不要。

## 開発ロードマップ案

1.  **Prototype Phase:**
    *   `sqlc` によるDBモデルの生成。
    *   記事参照 (Read) APIの実装。
    *   `templ` によるトップページ表示。
2.  **Core Logic Phase:**
    *   Hatena/tDiary記法パーサの実装。
    *   Node.js (MathJax) 連携の実装。
3.  **Admin & Write Phase:**
    *   記事投稿・編集機能の実装。
    *   画像アップロード機能。
    *   ジョブキューシステムの実装。
4.  **Migration Phase:**
    *   Perlアプリからのデータ検証。
    *   本番サーバーへのデプロイ試験。

