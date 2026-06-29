# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development (runs server + Vite concurrently)
pnpm dev

# Build
pnpm build

# Run tests
pnpm test              # Run tests once
pnpm test:watch        # Watch mode
pnpm test:coverage     # With coverage

# Linting and formatting
pnpm lint              # ESLint + Stylelint
pnpm lint:fix          # Auto-fix lint issues
pnpm fmt               # Prettier format
pnpm fmt:check         # Check formatting
```

## Fork & Upstream Sync

This repo is a fork of [`ryo-manba/md-review`](https://github.com/ryo-manba/md-review). Our main divergence from upstream is **file-based comment persistence** (comments saved to `.review.json` alongside each markdown file).

To check for and pull in upstream improvements:

```bash
# One-time: add the upstream remote (origin is dfpersonal/md-review)
git remote add upstream https://github.com/ryo-manba/md-review.git

# Each sync:
git fetch upstream
git log --oneline --no-merges main..upstream/main   # what upstream has that we don't
git log --oneline --no-merges upstream/main..main   # our fork-only commits

# Pull a specific commit, preserving authorship + a cherry-pick trailer:
git cherry-pick -x <sha>
```

Notes when syncing:

- Skip upstream's release-please version-bump / CHANGELOG commits — manage our own versioning.
- Conflicts cluster in `MarkdownPreview.tsx`, `server/index.js`, `markdown.css`, and the READMEs, since that's where the `.review.json` work lives.
- After a cherry-pick, run `pnpm build` (typecheck + build) and `pnpm test` before pushing.

## Architecture

This is a CLI tool for reviewing Markdown files with inline comments in the browser.

### Two Runtime Modes

1. **CLI Mode** (`md-review <file>`): Single file preview using `CliModeApp`
2. **Dev Mode** (`md-review` or `md-review <dir>`): File browser with tree view using `DevModeApp`

Mode detection happens in `App.tsx` via `/api/files` endpoint availability.

### Server/Client Split

- **`server/index.js`**: Hono-based Node.js server
  - Serves static files from `dist/`
  - API endpoints: `/api/markdown`, `/api/files`, `/api/watch` (SSE)
  - File watching via chokidar for hot reload
- **`bin/md-review.js`**: CLI entry point, spawns server process
- **`src/`**: React frontend (Vite)

### Key Components

- `MarkdownPreview`: Main preview component with line-by-line rendering
- `CommentList`: Manages inline comments (persisted to `.review.json` via `useReviewFile`; legacy localStorage migrated on first load)
- `SelectionPopover`: Text selection UI for adding comments
- `FileTree`: Directory browser with search

### Data Flow

1. CLI parses args → sets `MARKDOWN_FILE_PATH` or `BASE_DIR` env vars
2. Server reads files from these paths
3. SSE connection (`/api/watch`) enables hot reload on file changes
4. Comments persist to a `.review.json` file alongside each markdown file (debounced auto-save), served/written by the server; legacy localStorage data is migrated on first load
