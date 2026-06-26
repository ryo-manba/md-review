# MDX サポート設計

## 概要

`md-review` で `.mdx` ファイルを開けるようにする。レンダリング方針は「Markdown パートのみ表示、JSX は無視」。あわせて `.md` / `.mdx` 両方の frontmatter を解析してメタデータとして表示する。

## 要件

- `md-review file.mdx` で CLI モードが起動できる
- Dev モードでディレクトリスキャン時に `.mdx` ファイルが一覧に表示される
- `.mdx` の `import` / `export` 文はレンダリング対象から除外される
- JSX コンポーネントタグは react-markdown が自然に無視する（`rehype-raw` 未使用のため）
- `.md` / `.mdx` 両方の YAML frontmatter をパースし、ファイル名ヘッダー直下にメタデータブロックとして表示する

## アーキテクチャ

### 変更ファイル

| ファイル | 変更内容 |
|---|---|
| `server/index.js` | `isMarkdownFile()` に `.mdx` を追加 |
| `bin/md-review.js` | `isMarkdownFile()` に `.mdx` を追加 |
| `src/lib/parseMdContent.ts` | **新規** frontmatter 抽出・MDX 前処理ユーティリティ |
| `src/components/MarkdownPreview.tsx` | frontmatter メタデータブロックの表示を追加 |
| `src/styles/markdown.css` | メタデータブロックのスタイル追加 |

### データフロー

```
ファイル読み込み（サーバー）
  → raw content をそのまま返す（サーバーは変換しない）
  → クライアントの parseMdContent() で前処理
      - frontmatter を抽出・パース
      - .mdx なら import/export 行を除去
  → body を react-markdown に渡す
  → frontmatter をメタデータブロックとして表示
```

## 詳細設計

### `src/lib/parseMdContent.ts`

```ts
interface ParsedContent {
  frontmatter: Record<string, string>;
  body: string;
}

function parseMdContent(content: string, filename: string): ParsedContent
```

処理ステップ：
1. 先頭の `---\n...\n---` を正規表現で抽出
2. YAML 部分を `key: value` のシンプルな行パースで `Record<string, string>` に変換（ネスト・配列は文字列のまま）
3. `.mdx` ファイルの場合、body から `import ...` / `export ...` で始まる行を除去

### `MarkdownPreview.tsx` の表示

ファイル名ヘッダーの直下に frontmatter が存在する場合のみメタデータブロックを表示する：

```
filename.mdx
─────────────────────────────────
title:   Getting Started
date:    2024-01-01
author:  ryo-manba
─────────────────────────────────

# Getting Started
...
```

キーの表示順は frontmatter に記載された順序を保持する。

### スタイル

`.frontmatter-block` クラスを `markdown.css` に追加：
- ヘッダーとコンテンツの間に薄いボーダーで区切る
- キー名を薄いグレーで表示し、値を通常色で表示
- ダークモード対応（CSS 変数を使用）

## スコープ外

- YAML の複雑な型（ネスト・配列）のリッチな表示
- MDX の JSX コンポーネントを実際に評価・レンダリングすること
- frontmatter の編集機能
