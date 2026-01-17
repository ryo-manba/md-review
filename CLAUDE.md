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
- `CommentList`: Manages inline comments (persisted to localStorage)
- `SelectionPopover`: Text selection UI for adding comments
- `FileTree`: Directory browser with search

### Data Flow

1. CLI parses args → sets `MARKDOWN_FILE_PATH` or `BASE_DIR` env vars
2. Server reads files from these paths
3. SSE connection (`/api/watch`) enables hot reload on file changes
4. Comments stored in localStorage, keyed by file path
