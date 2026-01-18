# JobQueue DAG (依存関係) サポート実装計画

## 概要
`jobqueue` において、ジョブ間の依存関係を定義し、先行ジョブの状態に基づいて後続ジョブを実行する仕組み（DAG: Directed Acyclic Graph）を導入する。

## 1. データベース・スキーマの変更
依存関係の状態を確認するため、完了したジョブを即座に削除せず、ステータス更新で保持するように変更する。

### `backend/db/schema/worker.sql`
- `jobs` テーブルに以下のカラムを追加:
    - `depends_on`: JSON 形式。親ジョブ ID と実行条件を格納。
    - `finished_at`: ジョブが完了（成功/失敗）した時刻。クリーンアップ用。

### `backend/db/query/worker.sql`
- `MarkJobCompleted`: `DELETE` から `UPDATE` に変更。実行中の更新（`created_at > grabbed_at`）を検知して `pending` に戻す条件分岐を含む。
- `FindNextJob`: 従来通り `status = 'pending'` のものを取得。
- `GetJobsByIDs`: 複数の ID を指定してジョブを取得するクエリ（依存関係チェック用）。
- `GetJobByTypeAndUniqkey`: `Enqueue` 時の既存チェック用。
- `UpdateJobForEnqueue`: 既存ジョブ（実行中含む）の引数・依存関係・時刻を更新する。

## 2. 依存関係の実行制御
- ジョブは常に `pending` ステータスで投入される。
- ワーカーがジョブを取得した直後に、`depends_on` に記述された親ジョブの状態をチェックする。
- **実行可能**: 親ジョブが指定された `condition` を満たしている。
- **実行不可（待機）**: 親ジョブがまだ完了していない。`run_after` を更新して、次回のポーリングに回す。この際、`created_at` は変更しないことで、実行中更新判定（`created_at > grabbed_at`）との混同を避ける。
- **実行不可（失敗）**: 親ジョブが失敗し、`on_fail: fail` が指定されている。ジョブを `failed` に更新する。

## 3. 依存関係の定義
`depends_on` カラムに格納する JSON の構造は以下の通り。

```json
{
  "dependencies": [
    { "id": 123, "condition": "completed", "on_fail": "fail" },
    { "id": 124, "condition": "finished", "on_fail": "ignore" }
  ],
  "strategy": "all"
}
```
- `strategy`:
    - `all`: 全ての依存関係が満たされたら実行（デフォルト）。
    - `any`: いずれか1つの依存関係が満たされたら実行。
- `condition`:
    - `completed`: 親が `completed` の場合のみ実行可能。
    - `finished`: 親が `completed` または `failed` であれば実行可能。
- `on_fail`:
    - `fail`: 親が `failed` になったら、このジョブも自動的に `failed` に遷移させる。
    - `ignore`: 親が `failed` になっても、条件（`finished` など）が満たされれば実行する。

## 4. ロジックの実装 (`backend/jobqueue/`)

### `queue.go`
- `Enqueue` メソッドの拡張:
    - `BEGIN IMMEDIATE` トランザクション内で `SELECT` -> Go側でマージ -> `UPDATE/INSERT` を行う。
    - 更新時は `created_at` を現在時刻に更新し、実行中ジョブの再実行を促す。
- `processNextJob` の更新:
    - `GrabJob` の直前で依存関係チェックロジックを挿入。
    - 待機が必要な場合は、`GrabJob` せずに `run_after` だけ更新してリターンする。

### クリーンアップ処理
- `completed` ジョブ: 1日経過後に削除。
- `failed` ジョブ: 手動削除まで保持。
- `Worker.run` のループ、または既存の `recoverStuckJobs` のタイミングでクリーンアップを実行。

## 5. 実装ステップ
1. [ ] マイグレーションファイルの作成と `sqlc generate`
2. [ ] `jobqueue` パッケージ内の構造体定義更新
3. [ ] `Enqueue` 処理の依存関係対応（トランザクションとマージ）
4. [ ] `processNextJob` に実行直前の依存関係チェック処理を追加
5. [ ] `MarkJobCompleted` クエリの修正と再実行判定の実装
6. [ ] 完了後1日経過した `completed` ジョブを削除するクリーンアップ処理の実装
7. [ ] テストコードによる DAG 実行の検証（all/any, 失敗伝播, 実行中更新, 親消失, 大量依存）

## 6. テストプラン

### 6.1. 単体テスト (`backend/jobqueue/`)
- **依存関係評価ロジック**:
    - `condition: completed` で親が `completed` / `failed` / `pending` の各ケース。
    - `condition: finished` で親が `completed` / `failed` / `pending` の各ケース。
    - `strategy: all/any` の判定。
    - `on_fail: fail` で親が `failed` になった時の判定。
- **JSON パース**: 不正な JSON や空の配列が渡された場合の挙動。

### 6.2. 統合テスト (`backend/jobqueue/queue_test.go`)
- **基本 DAG 実行**: ジョブ A -> ジョブ B (depends on A) の順でエンキューし、A が終わるまで B が実行されないこと、A 完了後に B が実行されることを確認。
- **論理演算 (all/any)**: 一部の親のみ完了している場合や、いずれか一人の親が完了した時点での実行制御。
- **並列実行とレースコンディション**: 複数ワーカーが同じ依存待ちジョブを処理しようとした際のアトミックな制御。
- **失敗伝播**: 親 A が失敗し、子 B (`on_fail: fail`) が `failed` になり、子 C (`on_fail: ignore`) が実行されること。
- **待機とリトライ**: 依存関係によりスキップされたジョブの `run_after` 更新と再試行。
- **親ジョブ消失**: 親がクリーンアップされた後でも、子ジョブが「親完了」とみなして実行されること。
- **クリーンアップ**: 1日経過した `completed` ジョブの自動削除確認。
- **大量依存関係**: 数百件の親ジョブを持つジョブのパフォーマンス検証。
- **実行中更新 (再実行)**: ジョブ実行中に再エンキューを行い、完了後に再実行されること。

## 7. 懸念事項と対策

- **デッドロック（循環参照）とタイムアウト**:
    - **懸念**: 循環参照や、親ジョブが永遠に完了しない場合、子ジョブが永遠に待機し続ける。
    - **対策**: `recoverStuckJobs` により解消される。依存待機によるスキップ回数をログ出力し、監視可能にする。
- **並列実行とレースコンディション**:
    - **懸念**: 複数ワーカーが同じ依存待ちジョブを同時に処理しようとする。
    - **対策**: 依存チェックは `GrabJob` の直前に行う。`GrabJob` はアトミックな UPDATE であり、1つのワーカーしか成功しない。
- **パフォーマンスの劣化**:
    - **懸念**: 大量の依存待ちジョブによるポーリング負荷。
    - **対策**: スキップ時の `run_after` 更新間隔を長め（30秒〜1分）に設定する。
- **親ジョブの消失（クリーンアップ）**:
    - **懸念**: 依存関係チェック時に親ジョブが既に削除されている。
    - **対策**: `failed` は削除されないため、不在 = `completed` とみなす。
- **uniqkey との競合とアトミック性（実行中更新の保証）**:
    - **懸念**: `running` ジョブの更新判定がスキップによる `run_after` 更新と混同されないか。
    - **対策**: `Enqueue` 時のみ `created_at` を更新し、スキップ時は更新しない。`MarkJobCompleted` で `created_at > grabbed_at` を厳密に判定する。