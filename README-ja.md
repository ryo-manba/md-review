# md-review

[English](./README.md) | 日本語 | [简体中文](./README-zh.md)

![screenshot](./assets/screenshot.png)

Markdown ファイルにコメントを付けてレビューするための CLI ツール。
コメントはコピー可能で、AI エージェントへのフィードバックに使える。

## Features

- Markdown をそのままの形式で表示
- 特定の行にコメントを残せる
- ツリービューでファイルを選択
- ダークモード対応（システムの設定に追従）
- サイドバーのリサイズと折りたたみに対応
- コメントの行番号をクリックして該当箇所にジャンプ

## Install

```shell
npm install -g md-review
```

## Usage

```sh
md-review [options]              # カレントディレクトリのすべてのマークダウンファイルをプレビュー
md-review <file> [options]       # 特定のマークダウンファイルをプレビュー
```

### Options

```sh
-p, --port <port>     # サーバーポート (default: 3030)
    --no-open         # ブラウザを自動で開かない
-h, --help            # ヘルプメッセージを表示
-v, --version         # バージョン番号を表示
```

### Examples

```sh
md-review                        # カレントディレクトリのすべてのマークダウンファイルをプレビュー
md-review README.md              # README.md をプレビュー
md-review docs/guide.md --port 8080
```

## License

[MIT](./LICENSE)
