# Hanrangon (Go Implementation)

Perl版 Nogag の Go 言語によるリライトプロジェクト。

## Development Guidelines

### 1. Code Formatting & Imports
Goのコードを変更・作成した際は、必ず `goimports` を実行してフォーマットとインポートの整理を行うこと。手動でのインポート修正は禁止。

```bash
goimports -w path/to/file.go
```

### 2. Testing
`modernc.org/sqlite` のインメモリモード (`:memory:`) を使用して統合テストを行う。スキーマファイルは `db/schema/` から読み込む。

```bash
go test ./...
```

### 3. Database
- Schema: `db/schema/*.sql`
- Query: `db/query/*.sql`
- Code Gen: `sqlc generate`

### 4. Templating
`a-h/templ` を使用。

```bash
templ generate
```
