# データベース設計方針

SQLite を使用し、データの特性に応じてデータベースを物理的に分割している。

## データベースの構成

以下の 4 つに分割されている。

1.  **Main DB (`main.db`)**: 記事、トラックバック、認証情報。バックアップ必須。
2.  **Images DB (`images.db`)**: 画像インデックス、類似度判定データ。再生成可能。
3.  **TF-IDF DB (`tfidf.db`)**: TF-IDF 統計、関連記事。再生成可能。
4.  **Worker DB (`worker.db`)**: ジョブキュー。実行時ステート。

### 分離の目的

*   **バックアップ効率**: 肥大化しやすい再生成可能なデータを分離し、バックアップサイズを最小化する。
*   **書き込み競合の抑制**: WAL モードにおける書き込みロックの影響範囲をデータベース単位で限定する。

## 実装 (sqlc)

`sqlc` を使用して型安全なコードを生成している。

*   スキーマ定義: `backend/db/schema/*.sql`
*   クエリ定義: `backend/db/query/*.sql`
*   生成コード: `backend/model/` (手動編集禁止)
    *   `maindb/`, `imagesdb/`, `tfidfdb/`, `workerdb/`

スキーマやクエリの変更後は `make generate` を実行すること。

## データベース操作パターン

### 1. 単一の参照 (トランザクション不要)

単一の `SELECT` クエリを実行する場合は、トランザクションを使用せず、`Database` 構造体の `Q` を直接使用する。

```go
entry, err := app.MainDB().Q.GetEntry(ctx, id)
```

### 2. 一連の書き込み (原子性の保証)

複数の書き込み操作を一つの不可分な単位として実行する場合に使用する。

```go
tx, err := app.MainDB().BeginTxx(ctx, nil)
if err != nil {
    return err
}
defer tx.Rollback()

if err := tx.Q.InsertEntry(ctx, arg1); err != nil {
    return err
}
if err := tx.Q.UpdateTagCount(ctx, arg2); err != nil {
    return err
}

return tx.Commit()
```

### 3. 読み取り結果に基づく書き込み (Read-Modify-Write)

SQLite には `SELECT FOR UPDATE` がない。読み取った値に基づいて書き込みを行う場合、読み取りから書き込みまでの間に他の接続によってデータが変更されることによる不整合を防ぐため、最初から書き込みロックを取得する `BEGIN IMMEDIATE` を使用する。

```go
tx, err := app.MainDB().BeginImmediate(ctx)
if err != nil {
    return err
}
defer tx.Rollback()

// 書き込みロックを取得した状態で読み取りを行う
count, err := tx.Q.GetCountForUpdate(ctx, id)
if err != nil {
    return err
}

// 読み取った値に基づいて書き込みを行う
if err := tx.Q.UpdateCount(ctx, count + 1); err != nil {
    return err
}

return tx.Commit()
```

### 4. トランザクションヘルパー (`WithTx`)

単純な一連の操作であれば、`WithTx` を使用して記述を簡略化できる。内部では通常の `BeginTx` (DEFERRED) が使用される。

```go
err := app.MainDB().WithTx(ctx, func(q *maindb.Queries) error {
    if err := q.UpdateSomething(ctx, arg); err != nil {
        return err
    }
    return nil
})
```