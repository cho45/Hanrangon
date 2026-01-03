# Hanrangon (Go Implementation)

Perl版 Nogag の Go 言語によるリライトプロジェクト。

## Development Guidelines

### 1. Code Formatting & Imports
Goのコードを変更・作成した際は、必ず `goimports` を実行してフォーマットとインポートの整理を行うこと。手動でのインポート修正は禁止。

```bash
goimports -w path/to/file.go
```

### 2. Testing
インメモリモード (`:memory:`) を使用して統合テストを行う。スキーマファイルは `db/schema/` から読み込む。

```bash
go test ./...
```

### 3. Database
- Schema: `db/schema/*.sql`
- Query: `db/query/*.sql`
- Code Gen: `sqlc generate`

### 4. Templating
標準の `html/template` を使用。テンプレートは `view/*.html` および `view/*.xml`。
開発モードではリクエストごとにディスクから再読み込みされる。

### 5. Post-processing
MathJax やシンタックスハイライトなどの最終整形には Node.js を使用する。
`postprocess/main.js` が記事保存時に `exec` 経由で実行される。
