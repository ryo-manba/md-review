import { useState, useEffect, useCallback, RefObject } from 'react';

export interface LineRange {
  startLine: number;
  endLine: number;
}

/**
 * Get line number at selection point
 */
function getLineAtSelectionPoint(node: Node, intraOffset: number): number | null {
  // For text nodes, find data-line-start from parent element
  let el: HTMLElement | null =
    node.nodeType === Node.TEXT_NODE
      ? node.parentElement
      : (node as HTMLElement);

  // Traverse up to find element with data-line-start
  while (el && !el.hasAttribute('data-line-start')) {
    el = el.parentElement;
  }
  if (!el) return null;

  const startLine = Number(el.getAttribute('data-line-start'));
  if (!Number.isFinite(startLine)) return null;

  // Count newlines up to selection position
  const text = node.nodeType === Node.TEXT_NODE ? (node as Text).data : '';
  const fragment = text.slice(0, intraOffset);
  const extraNewlines = (fragment.match(/\n/g) || []).length;

  return startLine + extraNewlines; // 1-based
}

/**
 * Get line range from selection
 */
function getSelectedLineRange(): LineRange | null {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return null;

  const { anchorNode, anchorOffset, focusNode, focusOffset } = sel;
  if (!anchorNode || !focusNode) return null;

  const anchorLine = getLineAtSelectionPoint(anchorNode, anchorOffset);
  const focusLine = getLineAtSelectionPoint(focusNode, focusOffset);

  if (anchorLine == null || focusLine == null) return null;

  const startLine = Math.min(anchorLine, focusLine);
  let endLine = Math.max(anchorLine, focusLine);

  // Adjust endLine when selection ends with newlines only
  // (prevents including next line when double-clicking to select words)
  const selectedText = sel.toString();
  if (selectedText.endsWith('\n') && startLine < endLine) {
    // Calculate actual line count excluding trailing newlines
    const trimmedText = selectedText.replace(/\n+$/, '');
    const actualNewlines = (trimmedText.match(/\n/g) || []).length;
    endLine = startLine + actualNewlines;
  }

  return { startLine, endLine };
}

/**
 * Hook to track selected line range within Markdown preview
 */
export function useSelectionLineRange(containerRef: RefObject<HTMLElement | null>): LineRange | null {
  const [lineRange, setLineRange] = useState<LineRange | null>(null);

  const handleSelectionChange = useCallback(() => {
    const sel = window.getSelection();

    // Check if selection is within container
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
