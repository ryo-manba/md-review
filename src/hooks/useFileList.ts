import { useState, useEffect } from 'react';

interface FileInfo {
  name: string;
  path: string;
  dir: string;
}

interface FileListData {
  files: FileInfo[];
  loading: boolean;
  error: Error | null;
}

const API_URL = '/api/files';

export const useFileList = (): FileListData => {
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const response = await fetch(API_URL);

        if (!response.ok) {
          throw new Error(`API request failed: ${response.status}`);
        }

        const data = await response.json();
        setFiles(data.files || []);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setLoading(false);
      }
    };

    fetchFiles();
  }, []);

  return { files, loading, error };
};
