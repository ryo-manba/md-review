import { useState, useCallback, useEffect, useRef } from 'react';

interface UseResizableOptions {
  initialWidth: number;
  minWidth: number;
  maxWidth: number;
  storageKey?: string;
  direction?: 'left' | 'right'; // 'left' = grows to right, 'right' = grows to left
  collapsible?: boolean; // Allow closing by dragging below minWidth
  collapseThreshold?: number; // Width threshold to trigger collapse
}

export const useResizable = ({
  initialWidth,
  minWidth,
  maxWidth,
  storageKey,
  direction = 'left',
  collapsible = false,
  collapseThreshold = 100,
}: UseResizableOptions) => {
  const [width, setWidth] = useState<number>(() => {
    if (storageKey) {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = parseInt(saved, 10);
        if (!isNaN(parsed) && parsed >= minWidth && parsed <= maxWidth) {
          return parsed;
        }
      }
    }
    return initialWidth;
  });

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const startXRef = useRef<number>(0);
  const startWidthRef = useRef<number>(0);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      setIsResizing(true);
      startXRef.current = e.clientX;
      startWidthRef.current = width;
    },
    [width],
  );

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      const delta = e.clientX - startXRef.current;
      // For right-side panels, invert the delta (dragging left = wider)
      const effectiveDelta = direction === 'right' ? -delta : delta;
      const newWidth = startWidthRef.current + effectiveDelta;

      // Check if should collapse
      if (collapsible && newWidth < collapseThreshold) {
        setIsCollapsed(true);
        setWidth(minWidth); // Keep a minimum width for reopening
      } else {
        setIsCollapsed(false);
        const clampedWidth = Math.min(maxWidth, Math.max(minWidth, newWidth));
        setWidth(clampedWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      if (storageKey && !isCollapsed) {
        localStorage.setItem(storageKey, width.toString());
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [
    isResizing,
    maxWidth,
    minWidth,
    storageKey,
    width,
    direction,
    collapsible,
    collapseThreshold,
    isCollapsed,
  ]);

  const toggleCollapse = useCallback(() => {
    setIsCollapsed((prev) => !prev);
  }, []);

  return {
    width,
    isResizing,
    isCollapsed,
    handleMouseDown,
    toggleCollapse,
  };
};
