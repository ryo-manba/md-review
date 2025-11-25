# md-review

[English](./README.md) | [日本語](./README-ja.md) | 简体中文

![screenshot](./assets/screenshot.png)

用于预览 Markdown 文件并添加注释的 CLI 工具。
注释可以复制并用作 AI 代理的反馈。

## Features

- 以原始格式显示 Markdown
- 为特定行添加注释
- 从树视图中选择文件
- 支持深色模式（跟随系统设置）
- 支持调整和折叠侧边栏
- 点击注释中的行号跳转到相应内容

## Install

```sh
npm install -g md-review
```

## Usage

```sh
md-review [options]              # 预览当前目录中的所有 Markdown 文件
md-review <file> [options]       # 预览特定的 Markdown 文件
```

### Options

```sh
-p, --port <port>     # 服务器端口 (默认: 3030)
    --no-open         # 不自动打开浏览器
-h, --help            # 显示帮助信息
-v, --version         # 显示版本号
```

### Examples

```sh
md-review                        # 预览当前目录中的所有 Markdown 文件
md-review README.md              # 预览 README.md
md-review docs/guide.md --port 8080
```

## License

[MIT](./LICENSE)
