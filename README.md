# Hanrangon

Nogag (Perl/PSGI) の Go (Golang) によるリライト実装。
"Hanra-n-Go-n" (氾濫原 + Go).

## Prerequisites

*   Go 1.23+
*   [templ](https://templ.guide/) CLI

## Setup & Run

### 1. Install Tools

```bash
go install github.com/a-h/templ/cmd/templ@latest
go install github.com/sqlc-dev/sqlc/cmd/sqlc@latest
```

### 2. Generate Code

```bash
# Generate SQL queries
sqlc generate

# Generate templates
templ generate
```

### 3. Run Server

```bash
go run main.go
```

Server listens on http://localhost:5555

## Project Structure

*   `model/`: `sqlc` generated database models.
*   `view/`: `templ` templates.
*   `db/`: SQL schemas and queries.
*   `main.go`: Entry point and HTTP handlers.

## Notes

開発モードでは、親ディレクトリ (`../`) にある以下のリソースを参照します。

*   `../data.db`: SQLiteデータベース (本番データコピー)
*   `../static/`: 静的ファイル (CSS, JS, Images)
