# Postprocess 通信プロトコルの JSON-RPC 化設計 (Dispatcher 方式)

## 目的
- Go と Node.js 間の通信を構造化し、堅牢性を向上させる。
- `stderr` のパースに依存せず、進捗報告と結果取得を同一ストリーム (`stdout`) で安全に行う。
- ID 検証を導入し、リクエストとレスポンスの対応を確実にする。
- 従来の CLI モデル (stdout=HTML, stderr=Log) を維持しつつ、サーバー上では常駐プロセスによる JSON-RPC 通信を行う。

## 通信プロトコル仕様 (Batch Mode)

### Request (Go -> Node)
標準入力 (`stdin`) に一行ずつの JSON を送信する。

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "process",
  "params": {
    "html": "...",
    "baseURL": "..."
  }
}
```

### Response (Node -> Go)
標準出力 (`stdout`) から一行ずつの JSON を受信する。

#### 1. 進捗報告 (Notification)
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "progress",
  "params": { "message": "..." }
}
```

#### 2. 最終結果 (Response)
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": { "html": "..." }
}
```

## 実装の詳細

### Node.js 側 (`postprocess/main.js`)

#### Dispatcher (出力抽象化)
コアロジックが出力形式に依存しないよう、イベント配送を受け持つ `Dispatcher` インターフェースを導入しました。

- **`BatchDispatcher`**: JSON-RPC 形式で `stdout` へ出力。`id` をコンストラクタで保持。
- **`CLIDispatcher`**: 従来の `stdout` (HTML) / `stderr` (Log) モデルを再現。

#### 実行フロー
- **常駐モード**: `for await (const line of rl)` で一行ずつ読み込み、リクエストごとに `BatchDispatcher` を生成して `processHTML` に渡す。これにより逐次処理と ID の隔離を保証。
- **コアロジック**: `processHTML(html, baseURL, dispatcher)` は、進捗報告に `dispatcher.progress()`、最終結果に `dispatcher.result()` を使用する。

### Go 側 (`backend/app/app.go`)

#### `BatchProcessor` の改善
- **ID 管理**: `idSeq` によるシーケンシャルな ID 発行。
- **セッション管理**: `sync.Map` を使用し、発行した ID ごとに `resCh` と `reporter` を保持。
- **パースループ**: `stdout` を常時スキャンし、`id` に基づいて適切なセッションに進捗または結果を配送。

#### 堅牢性
- **タイムアウト**: `Postprocess` 呼び出しごとに 30 秒の `context.WithTimeout` を適用。
- **ID 検証**: 不明な ID や不整合なレスポンスを破棄し、ログに出力。

## 期待される効果
- **正確性**: リクエストとレスポンスが ID で紐付くため、データの混入が完全に防げる。
- **安定性**: `stdout` ひとつで完結するため、ストリーム間のバッファリングタイミング問題を回避。
- **クリーンな設計**: コアロジックが通信プロトコルの詳細を知る必要がなくなり、テストや拡張が容易。