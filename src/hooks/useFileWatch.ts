import { useEffect } from 'react';

interface FileWatchEvent {
  type: 'file-changed' | 'file-added' | 'connected';
  path?: string;
}

export const useFileWatch = (
  onFileChange: (path: string) => void,
  onFileAdded?: (path: string) => void,
) => {
  useEffect(() => {
    const eventSource = new EventSource('/api/watch');

    eventSource.onmessage = (event) => {
      try {
        const data: FileWatchEvent = JSON.parse(event.data);

        if (data.type === 'file-changed' && data.path) {
          onFileChange(data.path);
        } else if (data.type === 'file-added' && data.path && onFileAdded) {
          onFileAdded(data.path);
        }
      } catch (err) {
        console.error('[FileWatch] Error parsing message:', err);
      }
    };

    eventSource.onerror = (error) => {
      console.error('[FileWatch] Connection error:', error);
    };

    return () => {
      eventSource.close();
    };
  }, [onFileChange, onFileAdded]);
};
