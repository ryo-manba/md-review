import { useState, useEffect, useCallback, RefObject } from 'react';

export interface LineRange {
  startLine: number;
  endLine: number;
}

/**
 * 選択点の行番号を取得
 */
function getLineAtSelectionPoint(node: Node, intraOffset: number): number | null {
  // テキストノード → 親要素から data-line-start を探す
  let el: HTMLElement | null =
    node.nodeType === Node.TEXT_NODE
      ? node.parentElement
      : (node as HTMLElement);

  // data-line-start を持つ要素まで遡る
  while (el && !el.hasAttribute('data-line-start')) {
    el = el.parentElement;
  }
  if (!el) return null;

  const startLine = Number(el.getAttribute('data-line-start'));
  if (!Number.isFinite(startLine)) return null;

  // 選択位置までの改行数をカウント
  const text = node.nodeType === Node.TEXT_NODE ? (node as Text).data : '';
  const fragment = text.slice(0, intraOffset);
  const extraNewlines = (fragment.match(/\n/g) || []).length;

  return startLine + extraNewlines; // 1-based
}

/**
 * 選択範囲の行番号を取得
 */
function getSelectedLineRange(): LineRange | null {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return null;

  const { anchorNode, anchorOffset, focusNode, focusOffset } = sel;
  if (!anchorNode || !focusNode) return null;

  const anchorLine = getLineAtSelectionPoint(anchorNode, anchorOffset);
  const focusLine = getLineAtSelectionPoint(focusNode, focusOffset);

  if (anchorLine == null || focusLine == null) return null;

  let startLine = Math.min(anchorLine, focusLine);
  let endLine = Math.max(anchorLine, focusLine);

  // 選択テキストが改行のみで終わる場合、endLine を調整
  // （ダブルクリックで単語選択時に次の行まで含まれる問題を回避）
  const selectedText = sel.toString();
  if (selectedText.endsWith('\n') && startLine < endLine) {
    // 選択テキストから末尾の改行を除いた実際の行数を計算
    const trimmedText = selectedText.replace(/\n+$/, '');
    const actualNewlines = (trimmedText.match(/\n/g) || []).length;
    endLine = startLine + actualNewlines;
  }

  return { startLine, endLine };
}

/**
 * Markdown プレビュー内での選択行範囲を追跡するフック
 */
export function useSelectionLineRange(containerRef: RefObject<HTMLElement | null>): LineRange | null {
  const [lineRange, setLineRange] = useState<LineRange | null>(null);

  const handleSelectionChange = useCallback(() => {
    const sel = window.getSelection();

    // 選択がコンテナ内かどうかチェック
    if (!sel || sel.isCollapsed || !containerRef.current) {
      setLineRange(null);
      return;
    }

    const anchorNode = sel.anchorNode;
    if (!anchorNode || !containerRef.current.contains(anchorNode)) {
      setLineRange(null);
      return;
    }

    const range = getSelectedLineRange();
    setLineRange(range);
  }, [containerRef]);

  useEffect(() => {
    document.addEventListener('selectionchange', handleSelectionChange);
    return () => document.removeEventListener('selectionchange', handleSelectionChange);
  }, [handleSelectionChange]);

  return lineRange;
}
