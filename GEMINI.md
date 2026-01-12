# Hanrangon (Hanra-n-Go-n)

Hanrangon is a modern rewrite of the Nogag CMS (originally Perl) in Go. It is designed to be a fast, memory-efficient, and self-contained blogging platform with advanced features like full-text search similarity (TF-IDF) and robust image handling.

## Project Overview

*   **Core Logic:** Go (Golang) 1.24+
*   **Web Framework:** Echo v4
*   **Database:** SQLite (partitioned into Data, Images, TF-IDF, and Worker DBs).
*   **Data Access:** `sqlc` is used for type-safe SQL execution.
*   **Image Handling:** Supports JPEG, PNG, WebP, and AVIF (via `vegidio/avif-go`).
*   **Frontend (Public):** Server-side rendered `html/template`.
*   **Frontend (Admin):** Single Page Application (SPA) built with Svelte 5 and Vite.
*   **Post-processing:** Node.js sidecar process for heavy content rendering (MathJax, Syntax Highlighting).

## Architecture

1.  **Backend (Go):** Handles HTTP requests, database operations, and an internal job queue (TheSchwartz-like implementation on SQLite).
2.  **Admin UI:** A Svelte-based SPA living in `admin-frontend/`. It compiles to static assets served by the Go backend.
3.  **Content Pipeline:**
    *   Input: Markdown, Hatena, or tDiary format.
    *   Processing: Parsed by Go, then piped to a Node.js script (`postprocess/main.js`) for final HTML generation (math, highlighting) before storage.
    *   Storage: SQLite.

## Development Guidelines

### 0. Strict Mandates for AI Agents
Code modifications MUST follow this sequence:
1.  **Verification (Functional):** Run `make test` first. Functional correctness is the highest priority.
2.  **Linting:** Only after tests pass, run `make lint`. Resolve all issues.
3.  **Final Verification:** If any changes were made to satisfy the linter, run `make test` again to ensure no regressions were introduced.
4.  **No Exceptions:** Do not ignore errors without documented justification.

### 1. Build & Run

*   **Run Server:** `make run` (runs on `http://localhost:5555`)
*   **Build Binary:** `make build`
*   **Test:** `make test` (Requires `sqlite_math_functions` build tag, handled by Makefile)
*   **Lint:** `make lint`

### 2. Database & SQL

*   **Schema:** Located in `db/schema/`.
*   **Queries:** Located in `db/query/`.
*   **Code Generation:** After modifying SQL files, **ALWAYS** run:
    ```bash
    make generate
    ```
    This updates the Go code in `model/` via `sqlc`.

### 3. Formatting

*   **Go:** Run `make fmt` (uses `goimports`).
*   **Do not manually format imports.**

### 4. Admin Frontend Development

*   Navigate to `admin-frontend/`.
*   Run `npm install` then `npm run dev` for hot-reloading development.
*   The Go server expects built assets in `static/admin/`. Run `npm run build` to update them.

### 5. Post-process Development

*   Logic resides in `postprocess/`.
*   Test changes with `make postprocess-test`.

## Project Structure

*   `backend/app/`: Core application logic, HTTP handlers, and server setup.
*   `backend/db/` & `backend/model/`: SQL schemas, queries, and `sqlc` generated code.
*   `backend/subcommands/`: Subcommands integrated into the main `hanrangon` binary.
*   `cmd/`: Independent tools and utilities built separately from the main binary.
*   `backend/formatter/`: Text format parsers (Markdown, Hatena, etc.).
*   `backend/xatena-go/`: Hatena notation parser implementation.
*   `backend/jobqueue/` & `backend/jobs/`: Asynchronous background worker system.
*   `backend/tfidf/`: TF-IDF calculation and related entries extraction.
*   `backend/view/`: Public-facing HTML templates (SSR).
*   `admin-frontend/`: Svelte 5 admin panel source (SPA).
*   `postprocess/`: Node.js rendering script for MathJax and syntax highlighting.
*   `static/`: Public static assets (CSS, JS, Images).
*   `var/`: SQLite databases and cache storage.
*   `internal/`: Common internal utilities and test helpers.


## Configuration

*   Copy `config.toml.sample` to `config.toml` to customize database paths and credentials.
*   Default credentials (dev): `admin` / `changeme`.
