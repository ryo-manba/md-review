import { useState, useEffect } from 'react';

interface FileInfo {
  name: string;
  path: string;
  dir: string;
}

interface FileListData {
  files: FileInfo[];
  selectedFile: string | null;
  setSelectedFile: (file: string | null) => void;
  loading: boolean;
  error: Error | null;
}

const API_URL = '/api/files';

export const useFileList = (): FileListData => {
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
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
        setSelectedFile(data.selectedFile || null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setLoading(false);
      }
    };

    fetchFiles();
  }, []);

  return { files, selectedFile, setSelectedFile, loading, error };
};
