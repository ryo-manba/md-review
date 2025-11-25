# md-review

English | [日本語](./README-ja.md) | [简体中文](./README-zh.md)

![screenshot](./assets/screenshot.png)

A CLI tool for reviewing Markdown files with inline comments.
Comments can be copied and used as feedback for AI agents.

## Features

- Display Markdown in its original format
- Add comments to specific lines
- Select files from tree view
- Dark mode support (follows system preferences)
- Resizable and collapsible sidebars
- Click line numbers in comments to jump to corresponding content

## Install

```sh
npm install -g md-review
```

## Usage

```sh
md-review [options]              # Browse all markdown files in current directory
md-review <file> [options]       # Preview a specific markdown file
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
md-review README.md              # Preview README.md
md-review docs/guide.md --port 8080
```

## License

[MIT](./LICENSE)
