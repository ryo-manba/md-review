import { useState, useEffect, useRef, useCallback } from 'react';
import { Comment } from '../components/CommentList';

interface UseReviewFileOptions {
  /** Relative file path for dev mode, or null for CLI mode */
  filePath: string | null;
}

interface UseReviewFileReturn {
  comments: Comment[];
  setComments: (comments: Comment[] | ((prev: Comment[]) => Comment[])) => void;
  saving: boolean;
  saveNow: () => Promise<void>;
}

const DEBOUNCE_MS = 1000;

function apiUrl(filePath: string | null): string {
  if (filePath === null) return '/api/reviews';
  return `/api/reviews/${encodeURIComponent(filePath)}`;
}

function deserializeComments(raw: Array<Record<string, unknown>>): Comment[] {
  return raw.map((c) => ({
    id: c.id as string,
    text: c.text as string,
    selectedText: c.selectedText as string,
    startLine: c.startLine as number,
    endLine: c.endLine as number,
    createdAt: new Date(c.createdAt as string),
  }));
}

function serializeComments(comments: Comment[]) {
  return comments.map((c) => ({
    id: c.id,
    text: c.text,
    selectedText: c.selectedText,
    startLine: c.startLine,
    endLine: c.endLine,
    createdAt: c.createdAt instanceof Date ? c.createdAt.toISOString() : c.createdAt,
  }));
}

export function useReviewFile({ filePath }: UseReviewFileOptions): UseReviewFileReturn {
  const [comments, setCommentsState] = useState<Comment[]>([]);
  const [saving, setSaving] = useState(false);

  // Track current comments for the debounce flush
  const commentsRef = useRef<Comment[]>(comments);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingRef = useRef(false);
  const filePathRef = useRef(filePath);

  // Keep refs in sync
  commentsRef.current = comments;
  filePathRef.current = filePath;

  const doSave = useCallback(async (toSave: Comment[], fp: string | null) => {
    setSaving(true);
    try {
      if (toSave.length === 0) {
        await fetch(apiUrl(fp), { method: 'DELETE' });
      } else {
        await fetch(apiUrl(fp), {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ comments: serializeComments(toSave) }),
        });
      }
    } catch (err) {
      console.error('Failed to save review file:', err);
    } finally {
      setSaving(false);
      pendingRef.current = false;
    }
  }, []);

  const saveNow = useCallback(async () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    await doSave(commentsRef.current, filePathRef.current);
  }, [doSave]);

  const scheduleSave = useCallback(() => {
    pendingRef.current = true;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      doSave(commentsRef.current, filePathRef.current);
    }, DEBOUNCE_MS);
  }, [doSave]);

  // Wrapper that accepts functional updates like useState
  const setComments = useCallback(
    (value: Comment[] | ((prev: Comment[]) => Comment[])) => {
      setCommentsState((prev) => {
        const next = typeof value === 'function' ? value(prev) : value;
        // Schedule after state updates
        setTimeout(() => scheduleSave(), 0);
        return next;
      });
    },
    [scheduleSave],
  );

  // Load comments on mount / file change
  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch(apiUrl(filePath));
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        if (cancelled) return;

        if (data.comments && data.comments.length > 0) {
          setCommentsState(deserializeComments(data.comments));
        } else {
          // One-time migration from localStorage
          const lsKey = 'md-review-comments';
          try {
            const stored = window.localStorage.getItem(lsKey);
            if (stored) {
              const parsed = JSON.parse(stored);
              // Dev mode: commentsMap keyed by path; CLI mode: plain array
              const migrateComments: Comment[] | undefined = filePath
                ? parsed[filePath]
                : Array.isArray(parsed)
                  ? parsed
                  : undefined;

              if (migrateComments && migrateComments.length > 0) {
                const deserialized = deserializeComments(
                  migrateComments as unknown as Array<Record<string, unknown>>,
                );
                if (!cancelled) {
                  setCommentsState(deserialized);
                  // Save migrated comments to server
                  await fetch(apiUrl(filePath), {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ comments: serializeComments(deserialized) }),
                  });
                }
              } else {
                setCommentsState([]);
              }
            } else {
              setCommentsState([]);
            }
          } catch {
            setCommentsState([]);
          }
        }
      } catch (err) {
        console.error('Failed to load review file:', err);
        if (!cancelled) setCommentsState([]);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [filePath]);

  // Flush on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      if (pendingRef.current) {
        // Fire-and-forget flush
        doSave(commentsRef.current, filePathRef.current);
      }
    };
  }, [doSave]);

  return { comments, setComments, saving, saveNow };
}
