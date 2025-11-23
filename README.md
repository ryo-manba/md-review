# md-review

English | [日本語](./README-ja.md)

![screenshot](./assets/screenshot.png)

A CLI tool for reviewing Markdown files with inline comments.
Comments can be copied and used as feedback for AI agents.

## Features

- Display Markdown in its original format
- Add comments to specific lines
- Select files from tree view

## Install

```sh
npm install -g md-review
```

## Usage

```sh
md-review README.md
```

### Options

```sh
-p, --port <port>      Vite server port (default: 6060)
    --api-port <port>  API server port (default: 3030)
    --no-open          Do not open browser automatically
-h, --help             Show help
-v, --version          Show version
```

## License

[MIT](./LICENSE)
