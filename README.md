# md-review

English | [日本語](./README-ja.md) | [简体中文](./README-zh.md)

![demo](./assets/demo.gif)

A CLI tool for reviewing Markdown files with inline comments.
Comments can be copied and used as feedback for AI agents.

## Features

- Display Markdown in its original format
- Add comments to specific lines
- Edit existing comments
- Select files from tree view
- Dark mode support (follows system preferences)
- Resizable and collapsible sidebars
- Click line numbers in comments to jump to corresponding content
- Hot reload when markdown files change

## Install

```sh
npm install -g md-review
```

## Usage

```sh
md-review [options]              # Browse all markdown files in current directory
md-review <file> [options]       # Preview a specific markdown file
md-review <directory> [options]  # Browse markdown files in a specific directory
```

### Options

```sh
-p, --port <port>      Server port (default: 3030)
    --no-open          Do not open browser automatically
-h, --help             Show this help message
-v, --version          Show version number
```

### Examples

```sh
md-review                        # Browse all markdown files in current directory
md-review docs                   # Browse markdown files in docs directory
md-review README.md              # Preview README.md
md-review docs/guide.md --port 8080
```

## Comment Management

### Adding Comments

1. Select text in the markdown preview
2. Click the "Comment" button that appears
3. Type your comment and press `Cmd/Ctrl+Enter` or click "Submit"

### Editing Comments

1. Click the edit icon (pencil) on any existing comment
2. Modify the text in the textarea
3. Press `Cmd/Ctrl+Enter` or click "Save" to save changes
4. Press `Escape` or click "Cancel" to discard changes

### Keyboard Shortcuts

- `Cmd/Ctrl+Enter` - Submit/Save comment
- `Escape` - Cancel editing
- `Cmd+K` - Focus search bar (in directory mode)

## Hot Module Replacement

md-review automatically watches for changes to markdown files:

- When you edit and save a markdown file, the preview updates automatically
- No manual browser refresh needed
- Works in both single file and directory browsing modes
- File watching uses efficient Server-Sent Events (SSE)

This makes it ideal for live editing workflows and quick iteration on documentation.

## License

[MIT](./LICENSE)
