# ジョブキュー

SQLite (`worker.db`) をバックエンドとした、依存関係制御機能付きの非同期処理エンジン。

## 使いかた (インターフェース)

### 1. ジョブハンドラの実装

[`backend/jobqueue/job.go`](backend/jobqueue/job.go:175) の `JobHandler` インターフェースを実装する。

```go
type JobHandler interface {
    Name() string
    Execute(ctx context.Context, arg json.RawMessage) error
}
```

オプションで [`JobHandlerWithTimeout`](backend/jobqueue/job.go:186) を実装することで、ジョブごとのタイムアウト（デフォルト5分）を指定できる。

### 2. ハンドラの登録

作成したハンドラを [`backend/jobqueue/registry.go`](backend/jobqueue/registry.go) の `Registry` に登録する。通常、`backend/app/server.go` 等の初期化処理で行う。

### 3. ジョブの投入

[`backend/jobqueue/queue.go`](backend/jobqueue/queue.go:324) の `Worker` インスタンスを介してジョブを投入する。

#### 単純な投入 (`Enqueue`)

依存関係のないジョブを投入する場合に使用する。

```go
arg := map[string]string{"key": "value"}
err := worker.Enqueue(ctx, "JobName", arg, "unique-key")
```

#### 依存関係付きの投入 (`EnqueueWithDepends`)

特定のジョブの完了を待ってから実行したい場合に使用する。

```go
// 依存関係の定義
dependsOn := &jobqueue.DependsOn{
    Dependencies: []jobqueue.Dependency{
        {
            ID:        parentJobID,
            Condition: jobqueue.ConditionCompleted,
        },
    },
    Strategy: jobqueue.StrategyAll,
}

arg := map[string]string{"key": "value"}
err := worker.EnqueueWithDepends(ctx, "JobName", arg, "unique-key", dependsOn)
```

##### 指定可能なパラメータ

| パラメータ | 定数 | 意味 |
| :--- | :--- | :--- |
| **`Condition`** | `ConditionCompleted` | 親ジョブが成功（`completed`）したら条件を満たす。親が失敗した場合は、このジョブも自動的に失敗する。 |
| | `ConditionFinished` | 親ジョブが終了（`completed` または `failed`）したら条件を満たす。親の成否に関わらず実行される。 |
| **`Strategy`** | `StrategyAll` | すべての依存関係が満たされたら実行（デフォルト）。 |
| | `StrategyAny` | いずれか一つの依存関係が満たされたら実行。 |

## 注意点

- **冪等性の担保**: `uniqkey` を指定することで、同一内容のジョブが多重に投入されるのを防ぐ（Read-Modify-Write による更新）。ジョブの実行自体も、中断・再試行を考慮して冪等に実装すること。
- **uniqkey と依存関係のマージ**: すでに同一の `uniqkey` を持つジョブがキューに存在する場合、新しいジョブの投入は既存レコードの更新（`UpdateJobForEnqueue`）として処理される。この際、**`depends_on` は既存の依存リストにマージ（重複排除）**され、引数（`arg`）も最新の内容で上書きされる。
    - **設計意図**: ジョブの実行中に同じ `uniqkey` で再エンキューされた場合、そのジョブは現在の実行が完了した直後に**再度 `pending` 状態に戻り、最新の引数とマージされた依存関係で再実行**される。これにより、実行中に発生した変更を取りこぼすことなく、最終的に最新の状態に同期されることが保証される。
- **依存関係の設計**: 複雑な依存グラフ（DAG）を構築できるが、循環依存は実行時に検出され、ジョブが失敗する原因となる。
- **リトライポリシー**: 指数バックオフ（30秒 * 2^retry_count、最大1時間）による自動リトライが行われる。最大リトライ回数（デフォルト5回）を超えると `failed` 状態となり、自動的な回復は行われない。

## 内部構造

### ポーリングと実行

[`Worker`](backend/jobqueue/queue.go:17) が一定間隔（デフォルト5秒）で `worker.db` をポーリングし、実行可能なジョブを取得する。

1.  **`FindNextJob`**: `run_after` が現在時刻以前で、かつ `pending` 状態のジョブを1つ取得。
2.  **`GrabJob`**: ジョブの状態を `running` に更新し、実行権を確保（TOCTOU 防止）。
3.  **依存関係評価**: 親ジョブの状態を確認。条件を満たさない場合は `pending` に戻して後回しにする。
4.  **実行**: ハンドラの `Execute` を呼び出し。パニックはリカバーされ、エラーとして記録される。
5.  **完了処理**: 成功時は `completed` として記録。失敗時はリトライ回数をインクリメントし `pending` に戻す。

### 依存関係の評価ロジック ([`job.go`](backend/jobqueue/job.go:59))

ジョブの実行前に依存関係が評価され、結果に応じて以下のいずれかの状態になります。

- **`EvaluateReady` (実行可能)**: 全ての条件を満たしたため、実行を開始する。
- **`EvaluateWait` (待機)**: 親が条件を満たしていない（実行中など）。ジョブを `pending` に戻し、後で再評価する。
- **`EvaluateFail` (失敗伝播)**: 親の失敗により、このジョブも実行不可と判断された。実行せずにジョブを `failed` にする。

#### 設定パラメータの役割

`Condition` の種類によって、親ジョブが失敗した際の振る舞いが自動的に決定されます。

| パラメータ | 設定値 | 挙動 | 親が失敗確定した時の挙動 |
| :--- | :--- | :--- | :--- |
| **`Condition`** | `ConditionCompleted` | 親が成功した時のみ実行。 | **失敗の伝播**: 親が失敗確定したら、自分も即座に `failed` になる。 |
| | `ConditionFinished` | 親が終了（成功または失敗）したら実行。 | **成否を問わず実行**: 親の成否に関わらず、終了した時点で実行を開始する。 |

#### なぜ自動失敗判定が必要なのか？（早期失敗とゴーストジョブの防止）

`ConditionCompleted`（親の成功を待つ）を指定している場合、親ジョブがリトライをすべて使い切り、失敗が確定（`failed`）した時点で、その条件が満たされる可能性はなくなります。

このとき、子ジョブを自動的に `failed` にさせないと、子ジョブは「親が成功する」という条件を**満たさないまま `pending` 状態でキューに残り続け、永遠に実行も終了もされない（ゴーストジョブ）**になってしまいます。

現在の実装では、`Condition` の種類から「条件達成が不可能になったか」を論理的に判断し、不可能な場合は即座に `EvaluateFail` を返すことで、無駄な待機を防いでいます。

- **リトライとの関係**: 親がリトライ（バックオフ待機）している間は、親の状態は依然として `pending` です。このとき子ジョブは単に「条件未達成」として **`EvaluateWait` (待機)** を継続します。失敗が確定（`failed`）した瞬間に初めて、子ジョブの失敗判定が行われます。
- **`Strategy` (複数依存の評価)**:
    - `StrategyAll`: 指定したすべての依存関係が満たされたら実行。
    - `StrategyAny`: いずれか1つの依存関係が満たされたら実行。

### クリーンアップ

1分ごとに以下のメンテナンス処理が行われる。
- **スタックジョブの回復**: `running` 状態で長時間放置されたジョブを `pending` に戻す、または `failed` に落とす。
- **完了ジョブの削除**: 24時間以上経過した `completed` 状態のレコードを削除する。