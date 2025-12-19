import { useState, useEffect, useCallback, useRef } from 'react';

interface PopoverPosition {
  x: number;
  y: number;
}

interface SavedSelection {
  range: Range;
  text: string;
  startLine: number;
  endLine: number;
}

interface SelectionPopoverProps {
  containerRef: React.RefObject<HTMLElement | null>;
  onSubmitComment?: (comment: string, selectedText: string, startLine: number, endLine: number) => void;
}

// Get line number at selection point
function getLineAtSelectionPoint(node: Node, intraOffset: number): number | null {
  let el: HTMLElement | null =
    node.nodeType === Node.TEXT_NODE
      ? node.parentElement
      : (node as HTMLElement);

  while (el && !el.hasAttribute('data-line-start')) {
    el = el.parentElement;
  }
  if (!el) return null;

  const startLine = Number(el.getAttribute('data-line-start'));
  if (!Number.isFinite(startLine)) return null;

  const text = node.nodeType === Node.TEXT_NODE ? (node as Text).data : '';
  const fragment = text.slice(0, intraOffset);
  const extraNewlines = (fragment.match(/\n/g) || []).length;

  return startLine + extraNewlines;
}

// Get line range from selection
function getSelectionLineRange(sel: Selection): { startLine: number; endLine: number } | null {
  if (sel.isCollapsed) return null;

  const { anchorNode, anchorOffset, focusNode, focusOffset } = sel;
  if (!anchorNode || !focusNode) return null;

  const anchorLine = getLineAtSelectionPoint(anchorNode, anchorOffset);
  const focusLine = getLineAtSelectionPoint(focusNode, focusOffset);

  if (anchorLine == null || focusLine == null) return null;

  const startLine = Math.min(anchorLine, focusLine);
  let endLine = Math.max(anchorLine, focusLine);

  const selectedText = sel.toString();
  if (selectedText.endsWith('\n') && startLine < endLine) {
    const trimmedText = selectedText.replace(/\n+$/, '');
    const actualNewlines = (trimmedText.match(/\n/g) || []).length;
    endLine = startLine + actualNewlines;
  }

  return { startLine, endLine };
}

export const SelectionPopover = ({
  containerRef,
  onSubmitComment,
}: SelectionPopoverProps) => {
  const [position, setPosition] = useState<PopoverPosition | null>(null);
  const [visible, setVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [comment, setComment] = useState('');
  const [savedSelection, setSavedSelection] = useState<SavedSelection | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const highlightRef = useRef<HTMLDivElement | null>(null);
  const isEditingRef = useRef(false);

  // Create or update highlight elements
  const updateHighlight = useCallback((range: Range | null) => {
    // Remove existing highlight
    if (highlightRef.current) {
      highlightRef.current.remove();
      highlightRef.current = null;
    }

    if (!range || !containerRef.current) return;

    const rects = range.getClientRects();
    if (rects.length === 0) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const highlight = document.createElement('div');
    highlight.className = 'selection-highlight-container';
    highlight.style.position = 'absolute';
    highlight.style.top = '0';
    highlight.style.left = '0';
    highlight.style.pointerEvents = 'none';

    for (let i = 0; i < rects.length; i++) {
      const rect = rects[i];
      const span = document.createElement('div');
      span.className = 'selection-highlight';
      span.style.position = 'absolute';
      span.style.left = `${rect.left - containerRect.left + containerRef.current.scrollLeft}px`;
      span.style.top = `${rect.top - containerRect.top + containerRef.current.scrollTop}px`;
      span.style.width = `${rect.width}px`;
      span.style.height = `${rect.height}px`;
      highlight.appendChild(span);
    }

    containerRef.current.style.position = 'relative';
    containerRef.current.appendChild(highlight);
    highlightRef.current = highlight;
  }, [containerRef]);

  const updatePosition = useCallback(() => {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || !containerRef.current) {
      // Keep highlight while editing
      if (!isEditing) {
        setVisible(false);
        setSavedSelection(null);
        updateHighlight(null);
      }
      return;
    }

    const anchorNode = sel.anchorNode;
    if (!anchorNode || !containerRef.current.contains(anchorNode)) {
      if (!isEditing) {
        setVisible(false);
        setSavedSelection(null);
        updateHighlight(null);
      }
      return;
    }

    const range = sel.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    // Get line numbers
    const lineRange = getSelectionLineRange(sel);

    // Save selection range
    setSavedSelection({
      range: range.cloneRange(),
      text: sel.toString(),
      startLine: lineRange?.startLine ?? 1,
      endLine: lineRange?.endLine ?? 1,
    });

    setPosition({
      x: rect.left + rect.width / 2,
      y: rect.top - 8,
    });
    setVisible(true);
  }, [containerRef, isEditing, updateHighlight]);

  const handleCommentClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Highlight current selection
    if (savedSelection) {
      updateHighlight(savedSelection.range);

      // Position input at the top of selection
      const rects = savedSelection.range.getClientRects();
      if (rects.length > 0) {
        // Find topmost rect
        let topRect = rects[0];
        for (let i = 1; i < rects.length; i++) {
          if (rects[i].top < topRect.top) {
            topRect = rects[i];
          }
        }
        setPosition({
          x: topRect.left,
          y: topRect.top - 8,
        });
      }
    }

    setIsEditing(true);
    isEditingRef.current = true;
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  };

  const handleSubmit = () => {
    if (comment.trim() && onSubmitComment && savedSelection) {
      onSubmitComment(
        comment.trim(),
        savedSelection.text,
        savedSelection.startLine,
        savedSelection.endLine
      );
    }
    setComment('');
    setIsEditing(false);
    isEditingRef.current = false;
    setVisible(false);
    setSavedSelection(null);
    updateHighlight(null);
  };

  const handleCancel = () => {
    setComment('');
    setIsEditing(false);
    isEditingRef.current = false;
    setVisible(false);
    setSavedSelection(null);
    updateHighlight(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  useEffect(() => {
    const handleMouseUp = (e: MouseEvent) => {
      setTimeout(() => {
        if ((e.target as HTMLElement)?.closest('.selection-popover')) {
          return;
        }
        if (!isEditingRef.current) {
          updatePosition();
        }
      }, 10);
    };

    const handleMouseDown = (e: MouseEvent) => {
      if ((e.target as HTMLElement)?.closest('.selection-popover')) {
        return;
      }
      if (!isEditingRef.current) {
        setVisible(false);
        setSavedSelection(null);
        updateHighlight(null);
      }
    };

    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mousedown', handleMouseDown);

    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, [updatePosition, updateHighlight]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (highlightRef.current) {
        highlightRef.current.remove();
      }
    };
  }, []);

  if (!visible || !position) {
    return null;
  }

  return (
    <div
      className="selection-popover"
      style={{
        position: 'fixed',
        left: position.x,
        top: position.y,
        transform: isEditing ? 'translateY(-100%)' : 'translate(-50%, -100%)',
      }}
    >
      {!isEditing ? (
        <button
          className="popover-button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={handleCommentClick}
        >
          Comment
        </button>
      ) : (
        <div className="comment-form">
          <textarea
            ref={inputRef}
            className="comment-input"
            placeholder="Add a comment..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={3}
          />
          <div className="comment-actions">
            <button className="comment-cancel" onClick={handleCancel}>
              Cancel
            </button>
            <button
              className="comment-submit"
              onClick={handleSubmit}
              disabled={!comment.trim()}
            >
              Submit
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
