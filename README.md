# md-preview

ローカルのMarkdownファイルをブラウザで見やすくプレビューするCLIツール

## 特徴

- 🎨 GitHub風の見やすいデザイン
- 🌈 シンタックスハイライト対応（highlight.js）
- ✅ GitHub Flavored Markdown (GFM) サポート
  - テーブル
  - タスクリスト
  - 取り消し線
- ⚡ 高速な起動（Vite）
- 🚀 軽量なAPIサーバー（Hono）
- 📦 TypeScript + React 19

## インストール

```bash
# 依存パッケージのインストール
pnpm install
```

## 使い方

### 基本的な使い方

```bash
node bin/md-preview.js <markdown-file-path>
```

### 例

```bash
# サンプルファイルをプレビュー
node bin/md-preview.js test-samples/sample.md

# 任意のMarkdownファイルをプレビュー
node bin/md-preview.js ./docs/README.md
node bin/md-preview.js ~/Documents/notes.md
```

### オプション

```bash
# ポート番号を指定
node bin/md-preview.js --port 8080 --api-port 3000 file.md

# ブラウザを自動的に開かない
node bin/md-preview.js --no-open file.md

# ヘルプを表示
node bin/md-preview.js --help

# バージョンを表示
node bin/md-preview.js --version
```

## オプション一覧

| オプション | 短縮形 | デフォルト | 説明 |
|-----------|--------|-----------|------|
| `--port` | `-p` | `6060` | Viteサーバーのポート番号 |
| `--api-port` | - | `3030` | APIサーバーのポート番号 |
| `--no-open` | - | - | ブラウザを自動的に開かない |
| `--help` | `-h` | - | ヘルプを表示 |
| `--version` | `-v` | - | バージョンを表示 |

## 起動の流れ

1. CLIコマンドを実行すると、以下のサーバーが起動します：
   - **APIサーバー（Hono）**: `http://localhost:3030` - Markdownファイルを読み込むAPI
   - **Viteサーバー**: `http://localhost:6060` - Reactアプリケーション

2. 自動的にブラウザで `http://localhost:6060` が開き、Markdownファイルが表示されます

3. 終了するには `Ctrl+C` を押してください

## 技術スタック

### フロントエンド
- **React** 19 - UIライブラリ
- **TypeScript** - 型安全な開発
- **Vite** - 高速な開発サーバー
- **react-markdown** - Markdownレンダリング
- **remark-gfm** - GFM記法サポート
- **rehype-highlight** - シンタックスハイライト
- **highlight.js** - コードハイライトライブラリ

### バックエンド
- **Hono** - 高速で軽量なWebフレームワーク
- **@hono/node-server** - Node.js用アダプター

### CLI
- **commander** - コマンドライン引数のパース
- **chalk** - ターミナル出力の色付け
- **open** - ブラウザを開く

## プロジェクト構成

```
md-preview/
├── bin/
│   └── md-preview.js           # CLI エントリーポイント
├── server/
│   └── index.js                # Hono APIサーバー
├── src/
│   ├── components/
│   │   ├── ErrorDisplay.tsx    # エラー表示
│   │   └── MarkdownPreview.tsx # Markdownプレビュー
│   ├── hooks/
│   │   └── useMarkdown.ts      # Markdown取得フック
│   ├── styles/
│   │   └── markdown.css        # Markdownスタイル
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── test-samples/
│   └── sample.md               # テスト用サンプル
├── index.html
├── vite.config.ts
├── tsconfig.json
└── package.json
```

## サポートするMarkdown記法

### 基本記法
- 見出し (h1-h6)
- 段落
- 強調 (**太字**, *斜体*)
- リスト（順序付き/順序なし）
- インラインコード
- コードブロック（シンタックスハイライト付き）
- リンク
- 引用
- 水平線

### GFM拡張記法
- テーブル
- タスクリスト
- 取り消し線 (~~text~~)

## 開発

### 開発サーバーの起動

```bash
# Vite開発サーバーのみ起動
pnpm run dev

# APIサーバーのみ起動
pnpm run server
```

### ビルド

```bash
pnpm run build
```

## トラブルシューティング

### ポートが既に使用されている

デフォルトのポート（6060, 3030）が既に使用されている場合は、別のポートを指定してください：

```bash
node bin/md-preview.js --port 8080 --api-port 3000 file.md
```

### ブラウザが自動的に開かない

`--no-open` オプションを付けずに実行してください。または、手動で以下のURLを開いてください：

```
http://localhost:6060
```

### Markdownが表示されない

1. APIサーバーが正常に起動しているか確認してください（`http://localhost:3030/api/health` にアクセス）
2. ファイルパスが正しいか確認してください
3. ファイルが読み取り可能か確認してください

## ライセンス

MIT