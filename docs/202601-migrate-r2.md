# Hanrangon R2画像ストレージ移行手順書

作成日: 2026-01-11

## 概要

HanrangonブログシステムをローカルストレージからCloudflare R2オブジェクトストレージへ移行するための完全手順書。

### 移行の目的

- ローカルストレージからクラウドストレージへの移行
- CDN配信による画像の高速配信
- ストレージコストの最適化
- スケーラビリティの向上

### 実装の完了状況

#### Phase 1: 新規アップロードのR2対応 ✅ 完了
- ストレージ抽象化レイヤー (`app/storage.go`) 実装済み
- R2設定 (`app/config.go`) 実装済み
- アップロードハンドラ (`app/handler_admin.go`) 修正済み
- テスト (`app/storage_test.go`) 実装済み

#### Phase 2: 既存画像のR2移行 ✅ 完了
- 移行サブコマンド (`subcommands/migrate_to_r2.go`) 実装済み
- HTMLパーサーによる書き換え実装済み
- エントリ単位アトミック処理実装済み
- べき等性保証実装済み
- テスト (`subcommands/migrate_to_r2_test.go`) 実装済み
- スペース付きファイル名の対応完了

---

## 事前準備

### 1. R2バケットのセットアップ

Cloudflare R2コンソールで以下を実行:

#### 1.1 バケット作成

```
バケット名: hanrangon-assets (例)
リージョン: 自動（Cloudflareが最適化）
```

#### 1.2 カスタムドメイン設定

```
カスタムドメイン: assets.lowreal.net
```

- Cloudflareが自動的にCNAMEレコードを設定
- SSL/TLS証明書も自動発行

#### 1.3 API Token作成

R2コンソールで API Token を作成:

```
権限: Object Read & Write
対象バケット: hanrangon-assets
```

作成後、以下の情報を取得:
- **Access Key ID**: `xxxxxxxxxxxxxxxxxxxxxxxx`
- **Secret Access Key**: `yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy`
- **Account ID**: `d52dc19d3368d36eecf4b48d5eb2dd44` (例)

エンドポイントURLは以下の形式:
```
https://<ACCOUNT_ID>.r2.cloudflarestorage.com
```

例: `https://d52dc19d3368d36eecf4b48d5eb2dd44.r2.cloudflarestorage.com`

### 2. 設定ファイルの準備

`config.toml` にR2設定を追加:

```toml
# R2 Configuration
r2_endpoint_url = "https://d52dc19d3368d36eecf4b48d5eb2dd44.r2.cloudflarestorage.com"
r2_access_key_id = "your-access-key-id"
r2_secret_access_key = "your-secret-access-key"
r2_bucket_name = "hanrangon-assets"
r2_public_url = "https://assets.lowreal.net"
```

**重要**:
- 上記4つの設定がすべて存在する場合のみR2が有効化される
- いずれかが空の場合、自動的にローカルストレージにフォールバックする
- 環境変数でのオーバーライドは現在サポートされていない

### 3. データベースバックアップ

**移行前に必ずバックアップを作成**:

```bash
# タイムスタンプ付きバックアップ
cp var/db/data.db var/db/data.db.backup.$(date +%Y%m%d_%H%M%S)
cp var/db/images.db var/db/images.db.backup.$(date +%Y%m%d_%H%M%S)

# バックアップの確認
ls -lh var/db/*.backup.*
```

---

## 移行手順

### ステップ1: 設定の検証

アプリケーションが正常に起動し、R2設定が正しく読み込まれることを確認:

```bash
# アプリケーション起動
go run . &

# ログで以下のメッセージを確認:
# "Using R2 storage: https://assets.lowreal.net"
# または
# "Using local storage: static/images/entry/" (R2設定がない場合)

# プロセス停止
kill %1
```

### ステップ2: 新規アップロードのテスト

Phase 1の実装が正しく動作することを確認:

1. 管理画面にログイン: `http://localhost:5555/admin/`
2. 新規エントリを作成
3. 画像をアップロード
4. アップロードされた画像のURLを確認:
   - R2有効時: `https://assets.lowreal.net/entry/20260111120000-image.jpg`
   - ローカル時: `/images/entry/20260111120000-image.jpg`
5. ブラウザで画像が表示されることを確認

### ステップ3: 既存画像の移行（ドライラン）

本番実行前に、ドライランで処理内容を確認:

```bash
go run . migrate-to-r2 --dry-run
```

**出力例**:
```
ドライランモード - 実際の変更は行われません
1375個の処理対象エントリを発見しました
ドライラン: 1375個のエントリを処理します（実際には変更しません）
ドライラン: 画像URIを更新します（実際には更新しません）
マイグレーション完了
```

### ステップ4: 小規模テスト（推奨）

本番実行前に、少数のエントリでテストすることを強く推奨:

#### 4.1 10件のエントリで小規模テスト

`--limit` フラグを使用して、最も古い10件のエントリのみを処理:

```bash
# 最も古い10件のエントリで移行テスト
go run . migrate-to-r2 --limit 10
```

**出力例**:
```
10個の処理対象エントリを発見しました
[1/10] 処理中 エントリID:1 /2020/01/first-post
  2個の画像ファイルをアップロードします
    image1.jpg → R2
    image2.jpg → R2
  完了: http://localhost:5555/2020/01/first-post
[2/10] 処理中 エントリID:2 /2020/01/second-post
  3個の画像ファイルをアップロードします
    photo1.jpg → R2
    photo2.jpg → R2
    photo3.jpg → R2
  完了: http://localhost:5555/2020/01/second-post
...
エントリ処理完了: 10成功, 0失敗, 0スキップ
画像URIを更新中...
15個の画像URIを更新しました
検証中...
✓ すべてのエントリが移行されました
✓ すべての画像URIが移行されました
マイグレーション完了
```

**ポイント**:
- `--limit 10` により、ID順で古い10件のみが処理される
- エントリURLが出力されるため、ブラウザで即座に確認可能
- べき等性により、同じコマンドを再実行しても安全

#### 4.2 結果確認

出力されたURLをブラウザで開き、画像が正しく表示されることを確認:

```bash
# 出力例:
#   完了: http://localhost:5555/2020/01/first-post
#   完了: http://localhost:5555/2020/01/second-post

# ブラウザで各URLを確認
# - 画像が正しく表示されるか
# - 開発者ツールで画像URLが https://assets.lowreal.net/entry/... になっているか

# 問題がある場合はバックアップから復元
cp var/db/data.db.backup.XXXXXX var/db/data.db
cp var/db/images.db.backup.XXXXXX var/db/images.db
```

#### 4.3 段階的なテスト（オプション）

問題がなければ、徐々に処理数を増やしてテスト:

```bash
# 100件のエントリで中規模テスト
go run . migrate-to-r2 --limit 100

# 確認後、さらに増やす
go run . migrate-to-r2 --limit 500
```

**注意**: 既に処理済みのエントリは自動的にスキップされるため、何度実行しても安全

### ステップ5: 本番移行

小規模テストで問題がなければ、全エントリを移行:

```bash
go run . migrate-to-r2
```

**進行状況の表示例**:
```
1375個の処理対象エントリを発見しました
[1/1375] 処理中 エントリID:1 /2020/01/first-post
  3個の画像ファイルをアップロードします
    20200101120000-photo1.jpg → R2
    20200101120000-photo2.jpg → R2
    20200101120000-screenshot.png → R2
  完了
[2/1375] 処理中 エントリID:2 /2020/01/second-post
  スキップ: 画像ファイルが見つかりませんでした
[3/1375] 処理中 エントリID:3 /2020/01/third-post
  1個の画像ファイルをアップロードします
    test.jpg: 既に存在します
  完了
...
[1375/1375] 処理中 エントリID:1375 /2024/12/latest
  完了
エントリ処理完了: 500成功, 0失敗, 875スキップ
画像URIを更新中...
1200個の画像URIを更新しました
検証中...
✓ すべてのエントリが移行されました
✓ すべての画像URIが移行されました
マイグレーション完了
```

**処理時間の目安**:
- 画像数: 約1,200枚
- 処理時間: 5〜50分（ネットワーク速度とファイルサイズに依存）
- アップロード速度: 約1〜10枚/秒

### ステップ6: 検証

データベースに未移行のエントリが残っていないか確認:

```bash
# エントリの確認
sqlite3 var/db/data.db "SELECT COUNT(*) FROM entries WHERE formatted_body LIKE '%/images/entry/%' OR body LIKE '%/images/entry/%'"
# → 0 であることを確認

# 画像URIの確認
sqlite3 var/db/images.db "SELECT COUNT(*) FROM images WHERE uri LIKE '/images/entry/%'"
# → 0 であることを確認

# ランダムサンプル確認
sqlite3 var/db/data.db "SELECT path, substr(formatted_body, 1, 100) FROM entries WHERE id IN (SELECT id FROM entries ORDER BY RANDOM() LIMIT 5)"
# → 画像URLが https://assets.lowreal.net/entry/ で始まることを確認
```

### ステップ7: Webサイトでの最終確認

ブラウザで実際の表示を確認:

1. **アプリケーション起動**:
   ```bash
   go run .
   ```

2. **複数のエントリを確認**:
   - 最新のエントリ
   - 古いエントリ
   - 画像が多いエントリ
   - 特殊文字を含むファイル名のエントリ

3. **開発者ツールで確認**:
   - ネットワークタブで画像のURLを確認
   - `https://assets.lowreal.net/entry/...` になっていることを確認
   - HTTPステータス: 200 OK
   - Content-Type: 適切なMIMEタイプ（image/jpeg等）
   - Cache-Control: `public, max-age=31536000, immutable`

### ステップ8: ローカル画像ファイルの削除（オプション）

移行が完全に成功し、十分な期間（1週間〜1ヶ月）問題なく運用できていることを確認したら、ローカルファイルを削除可能:

```bash
# バックアップアーカイブを作成
tar czf static-images-backup-$(date +%Y%m%d).tar.gz static/images/entry/

# バックアップの確認
ls -lh static-images-backup-*.tar.gz

# ローカルファイルを削除
rm -rf static/images/entry/*

# または、一定期間保持
# 例: 1週間後に削除するcronジョブを設定
```

**注意**:
- ローカルファイル削除は不可逆的な操作
- 削除前に必ずバックアップアーカイブを作成
- R2が正常に動作していることを十分確認してから実行

---

## エラーハンドリング

### 移行中にエラーが発生した場合

#### エントリ処理エラー

**エラー例**:
```
[123/1375] 処理中 エントリID:456 /2024/01/broken
  HTMLパースエラー: unexpected token at line 15
  エラー: 画像アップロードに失敗しました
```

**対処法**:

1. **該当エントリの確認**:
   ```bash
   sqlite3 var/db/data.db "SELECT id, path, formatted_body FROM entries WHERE id = 456"
   ```

2. **エントリを手動で修正** (必要に応じて):
   - HTMLの構文エラーを修正
   - 不正なタグを削除

3. **再実行** (べき等性により安全):
   ```bash
   go run . migrate-to-r2
   # 既に完了したエントリはスキップされる
   ```

#### アップロードエラー

**エラー例**:
```
[456/1375] 処理中 エントリID:789 /2024/05/photo
  3個の画像ファイルをアップロードします
    photo1.jpg → R2
    photo2.jpg: アップロードエラー: network timeout
  エラー: 画像アップロードに失敗しました
```

**対処法**:

1. **ネットワーク接続を確認**
2. **R2のステータスを確認**: [Cloudflare Status](https://www.cloudflarestatus.com/)
3. **しばらく待ってから再実行**:
   ```bash
   # 既にアップロード済みのファイルは自動的にスキップされる
   go run . migrate-to-r2
   ```

#### R2レート制限エラー

**エラー例**:
```
アップロードエラー: 429 Too Many Requests
```

**対処法**:

1. **待機**: 数分待ってから再実行
2. **並列度の調整**: 現在は並列度4（将来のオプション化予定）

### ロールバック

移行後に問題が発生した場合、バックアップから復元可能:

```bash
# データベースを復元
cp var/db/data.db.backup.XXXXXX var/db/data.db
cp var/db/images.db.backup.XXXXXX var/db/images.db

# アプリケーション再起動
# R2設定をコメントアウトすればローカルストレージに戻る
```

**注意**:
- R2上のファイルは削除する必要なし（既存ファイルは上書きされない）
- ロールバック後も新規アップロードは継続可能
- 再移行時は同じコマンドで実行可能（べき等性保証）

---

## べき等性と安全性

### 何度でも安全に実行可能

`migrate-to-r2` コマンドは以下の仕組みでべき等性を保証:

#### 1. エントリの検出
- `/images/entry/` を含むエントリのみを処理対象とする
- 既に移行済みのエントリは自動的にスキップされる

**実装**:
```go
if !strings.Contains(e.body, "/images/entry/") &&
   !strings.Contains(e.formattedBody, "/images/entry/") {
    log.Printf("  スキップ: 既に移行済み")
    skippedCount++
    continue
}
```

#### 2. アップロードのスキップ
- R2に既に存在するファイルは再アップロードしない
- HTTP HEADリクエストで存在確認

**実装**:
```go
exists, err := m.existsOnR2(ctx, imgFile)
if exists {
    log.Printf("    %s: 既に存在します", imgFile)
    continue
}
```

#### 3. DB更新のアトミック性
- 各エントリごとに: 画像抽出 → R2アップロード → DB更新 を完結
- 1つのエントリの処理が完了してから次へ進む

#### 4. エラー時の継続
- 1つのエントリでエラーが発生しても、他のエントリの処理を継続
- エラーカウントを記録し、最後に報告

**実装**:
```go
if !uploadSuccess {
    log.Printf("  エラー: 画像アップロードに失敗しました")
    errorCount++
    continue // 次のエントリへ
}
```

### Ctrl-Cでの中断について

**現在の実装**: 中断しても安全

- **エントリ単位でアトミック**: 各エントリごとに「画像アップロード→DB更新」を完結
- **中断時の影響**: 処理中のエントリのみが中途半端な状態になる可能性
- **再実行で回復**: 再実行すれば、未完了のエントリから処理が再開される

**注意点**:
- コンテキストキャンセル（Ctrl-C）への応答は遅い
- 現在の実装では `ctx.Done()` をチェックしていない
- エントリ処理の途中で中断しても、現在のエントリが完了するまで待つ

**改善案** (必要に応じて):
```go
for i, e := range entries {
    // コンテキストキャンセルをチェック
    select {
    case <-ctx.Done():
        log.Printf("中断されました")
        return ctx.Err()
    default:
        // 処理を継続
    }

    // エントリ処理...
}
```

---

## サブコマンドのオプション

### migrate-to-r2

```bash
hanrangon migrate-to-r2 [OPTIONS]
```

#### オプション

- `--dry-run`: ドライランモード。実際の変更を行わず、処理内容のみを表示
- `--limit N`: 処理するエントリ数の上限（0=無制限、ID昇順で古いものから処理）
- `--backup`: データベースバックアップを作成してから実行（未実装）
- `--verify-only`: 検証のみを実行（未実装）
- `--parallel N`: 並列度を指定（未実装、現在は4固定）

**例**:
```bash
# ドライラン
go run . migrate-to-r2 --dry-run

# 最も古い10件のエントリのみを処理
go run . migrate-to-r2 --limit 10

# 最も古い100件のエントリのみを処理（ドライラン）
go run . migrate-to-r2 --limit 100 --dry-run

# 本番実行（全エントリ）
go run . migrate-to-r2

# バックアップ付き実行（未実装）
# go run . migrate-to-r2 --backup
```

---

## トラブルシューティング

### Q: 移行後、一部の画像が表示されない

**A**: 以下を確認:

1. **ブラウザのコンソールでエラー確認**:
   - CORS エラー → R2のCORS設定を確認
   - 404 エラー → ファイル名やパスを確認

2. **R2に画像が存在するか確認**:
   ```bash
   # HTTP HEADリクエストで確認
   curl -I https://assets.lowreal.net/entry/20240101120000-test.jpg
   ```

3. **データベースのURIを確認**:
   ```bash
   sqlite3 var/db/data.db "SELECT formatted_body FROM entries WHERE id = XXX"
   ```

### Q: 移行が途中で止まる

**A**: 以下を確認:

1. **ネットワーク接続**: R2への接続が安定しているか
2. **ディスク容量**: ログファイルや一時ファイルの容量
3. **メモリ使用量**: 大量のエントリ処理時のメモリ

再実行すれば、未完了のエントリから処理が再開されます。

### Q: 特殊文字を含むファイル名が正しく移行されない

**A**: 以下のファイル名は対応済み:

- スペースを含むファイル名: `test image.jpg`
- 日本語ファイル名: `テスト画像.jpg`
- 複数のドット: `test.backup.jpg`

正規表現パターンで正しく抽出されます:
```go
re := regexp.MustCompile(`(?:(?:src|href)=(?:"(/images/entry/[^"]*)"|'(/images/entry/[^']*)'|(/images/entry/[^>\s]+))|(?:\s)(/images/entry/[^\s\]]+))`)
```

### Q: R2の認証エラーが発生する

**A**: 以下を確認:

1. **config.toml の設定**:
   - `r2_access_key_id` が正しいか
   - `r2_secret_access_key` が正しいか
   - `r2_endpoint_url` が正しいか（Account IDを含む）

2. **API Tokenの権限**:
   - Object Read & Write 権限があるか
   - 対象バケットが正しいか

3. **設定の再読み込み**:
   ```bash
   # アプリケーション再起動
   kill %1
   go run . &
   ```

---

## パフォーマンス

### 処理速度

- **エントリ数**: 1,375件
- **画像数**: 約1,200枚
- **処理時間**: 5〜50分（ネットワーク速度に依存）

### 最適化

現在の実装:
- **並列アップロード**: なし（順次処理）
- **エントリ処理**: 順次処理
- **HTTP接続**: リクエストごとに確立

将来的な最適化案:
- 並列度オプションの追加（`--parallel N`）
- HTTP接続プールの使用
- バッチアップロードの検討

---

## 技術詳細

### アーキテクチャ

#### Phase 1: 新規アップロード
```
[管理画面] → [handler_admin.go] → [StorageClient] → [R2 or Local]
                                          ↓
                                    [LocalStorage]
                                    [R2Storage]
```

#### Phase 2: 既存画像移行
```
[migrate-to-r2] → [ProcessEntries] → for each entry:
                                        ↓
                                   [extractImageFiles]
                                        ↓
                                   [uploadFile (R2Storage)]
                                        ↓
                                   [RewriteImageURLs]
                                        ↓
                                   [DB Update]
                       ↓
                  [UpdateImageURIs] → images.uri 一括更新
                       ↓
                  [Verify] → 検証
```

### ストレージ抽象化

`app/storage.go` で定義されたインターフェース:

```go
type StorageClient interface {
    Upload(ctx context.Context, key string, body io.Reader, contentType string) (string, error)
}
```

実装:
- `LocalStorage`: ローカルファイルシステム
- `R2Storage`: Cloudflare R2（S3互換API）

### HTML書き換えロジック

#### formatted_body (HTMLフラグメント)

`golang.org/x/net/html` パッケージを使用:

```go
func RewriteImageURLs(htmlContent, newBaseURL string) (string, error) {
    // HTMLフラグメントをパース
    nodes, err := html.ParseFragment(...)

    // <img src> と <a href> を書き換え
    for each node:
        if node is img and attr is src:
            rewrite "/images/entry/" → "newBaseURL/entry/"
        if node is a and attr is href:
            rewrite "/images/entry/" → "newBaseURL/entry/"

    return rendered HTML
}
```

#### body (生のHatena記法等)

単純な文字列置換:

```go
func RewriteBodyImageURLs(body, newBaseURL string) string {
    body = strings.ReplaceAll(body, `src="/images/entry/`, `src="`+newBaseURL+`/entry/`)
    body = strings.ReplaceAll(body, `src='/images/entry/`, `src='`+newBaseURL+`/entry/`)
    body = strings.ReplaceAll(body, `src=/images/entry/`, `src=`+newBaseURL+`/entry/`)
    // href も同様
    return body
}
```

### 画像ファイル抽出

正規表現パターン:

```go
re := regexp.MustCompile(`(?:(?:src|href)=(?:"(/images/entry/[^"]*)"|'(/images/entry/[^']*)'|(/images/entry/[^>\s]+))|(?:\s)(/images/entry/[^\s\]]+))`)
```

**対応パターン**:
1. ダブルクォート: `src="/images/entry/test image.jpg"`
2. シングルクォート: `src='/images/entry/test.jpg'`
3. クォートなし: `src=/images/entry/test.jpg`
4. Hatena記法: `[f:id:... /images/entry/test.jpg ]`

---

## テスト

### ユニットテスト

```bash
# ストレージ層
go test -v ./app/storage_test.go

# 移行ロジック
go test -v ./subcommands/migrate_to_r2_test.go
```

### 主要なテストケース

1. **HTML書き換え**: 16種類のHTMLパターン
2. **画像抽出**: 16種類の境界条件
3. **べき等性**: 3回実行して同じ結果
4. **エラーハンドリング**: アップロード失敗時の継続
5. **統合テスト**: エンドツーエンドのエントリ処理

### テスト実行

```bash
# 全テスト実行
make test

# 特定パッケージのテスト
go test -tags "sqlite_math_functions" ./subcommands/...

# 詳細出力
go test -v -tags "sqlite_math_functions" ./subcommands/migrate_to_r2_test.go
```

---

## まとめ

### 移行の利点

1. **高速配信**: CDN経由で画像を配信
2. **スケーラビリティ**: ストレージ容量の制約なし
3. **コスト最適化**: 使用量に応じた課金
4. **信頼性**: Cloudflareの冗長化とバックアップ

### 重要なポイント

1. **Phase 1（新規アップロード）**: 既に実装完了。設定を追加すれば即座に利用可能
2. **Phase 2（既存画像移行）**: `migrate-to-r2` サブコマンドで実行
3. **安全性**: べき等性とエラー継続により、何度でも安全に再実行可能
4. **推奨手順**: ドライラン → 小規模テスト → 本番実行 → 検証
5. **ロールバック**: データベースバックアップから即座に復元可能

### 次のステップ

移行完了後:

1. **監視**: R2の使用量とコストを監視
2. **最適化**: 必要に応じて並列度やキャッシュ設定を調整
3. **ローカルファイル削除**: 十分な期間（1週間〜1ヶ月）問題なく運用後に実施

---

## 関連ファイル

### Phase 1（新規アップロード）
- [app/config.go](../app/config.go) - R2設定フィールド
- [app/storage.go](../app/storage.go) - StorageClient抽象化
- [app/app.go](../app/app.go) - AppImplへのstorage統合
- [app/handler_admin.go](../app/handler_admin.go) - アップロードハンドラ
- [app/storage_test.go](../app/storage_test.go) - ストレージ層のテスト

### Phase 2（既存画像移行）
- [subcommands/migrate_to_r2.go](../subcommands/migrate_to_r2.go) - 移行メインロジック
- [subcommands/migrate_to_r2_test.go](../subcommands/migrate_to_r2_test.go) - 移行テスト
- [main.go](../main.go) - サブコマンド登録

---

## 更新履歴

- 2026-01-11: 初版作成
  - Phase 1, Phase 2 実装完了
  - スペース付きファイル名対応完了
  - べき等性保証
  - 包括的なテスト実装
