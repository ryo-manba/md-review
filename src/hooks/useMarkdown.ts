import { useState, useEffect, useCallback } from 'react';

interface MarkdownData {
  content: string | null;
  filename: string | null;
  loading: boolean;
  error: Error | null;
  reload: () => void;
}

const BASE_API_URL = '/api/markdown';

export const useMarkdown = (filePath?: string | null): MarkdownData => {
  const [content, setContent] = useState<string | null>(null);
  const [filename, setFilename] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [reloadTrigger, setReloadTrigger] = useState<number>(0);

  const reload = useCallback(() => {
    setReloadTrigger((prev) => prev + 1);
  }, []);

  useEffect(() => {
    const fetchMarkdown = async () => {
      // If filePath is explicitly null, don't fetch
      if (filePath === null) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // If filePath is undefined, use the CLI endpoint (no path parameter)
        // If filePath is provided, use the dev endpoint (with path parameter)
        const url = filePath === undefined ? BASE_API_URL : `${BASE_API_URL}/${filePath}`;

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`API request failed: ${response.status}`);
        }

        const data = await response.json();
        setContent(data.content);
        setFilename(data.filename);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
        setContent(null);
        setFilename(null);
      } finally {
        setLoading(false);
      }
    };

    fetchMarkdown();
  }, [filePath, reloadTrigger]);

  return { content, filename, loading, error, reload };
};
