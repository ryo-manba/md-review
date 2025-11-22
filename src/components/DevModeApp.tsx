import { useState } from 'react';
import { useFileList } from '../hooks/useFileList';
import { useMarkdown } from '../hooks/useMarkdown';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { FileTree } from './FileTree';
import { MarkdownPreview } from './MarkdownPreview';
import { ErrorDisplay } from './ErrorDisplay';
import { Comment } from './CommentList';
import '../styles/devmode.css';

export const DevModeApp = () => {
  const { files, loading: filesLoading, error: filesError } = useFileList();
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [focusSearch, setFocusSearch] = useState<boolean>(false);
  const [commentsMap, setCommentsMap] = useLocalStorage<Record<string, Comment[]>>('md-preview-comments', {});
  const { content, filename, loading: markdownLoading, error: markdownError } = useMarkdown(selectedFile);

  const handleSearchClick = () => {
    setSidebarOpen(true);
    setFocusSearch(true);
    setTimeout(() => setFocusSearch(false), 100);
  };

  if (filesLoading) {
    return (
      <div className="dev-loading">
        <p>Loading files...</p>
      </div>
    );
  }

  if (filesError) {
    return <ErrorDisplay error={filesError} />;
  }

  if (files.length === 0) {
    return (
      <div className="dev-empty">
        <h2>No Markdown Files Found</h2>
        <p>No .md files were found in the current directory.</p>
      </div>
    );
  }

  return (
    <div className={`dev-container ${!sidebarOpen ? 'sidebar-closed' : ''}`}>
      <div className={`dev-sidebar ${!sidebarOpen ? 'closed' : ''}`}>
        {!sidebarOpen && (
          <div className="sidebar-icon-bar">
            <button
              className="icon-bar-item"
              onClick={() => setSidebarOpen(true)}
              title="Open sidebar"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M5 3h6l2 2h4a1 1 0 011 1v10a1 1 0 01-1 1H3a1 1 0 01-1-1V4a1 1 0 011-1h2z" stroke="currentColor" strokeWidth="1.5"/>
              </svg>
            </button>
            <button
              className="icon-bar-item"
              onClick={handleSearchClick}
              title="Search"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M13.5 13.5l3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
        )}
        {sidebarOpen && (
          <div className="sidebar-content">
            <FileTree
              files={files}
              selectedFile={selectedFile}
              onFileSelect={setSelectedFile}
              onToggleSidebar={() => setSidebarOpen(false)}
              autoFocusSearch={focusSearch}
            />
          </div>
        )}
      </div>
      <div className="dev-main">
        {!selectedFile ? (
          <div className="dev-placeholder">
            <h2>Welcome to md-preview</h2>
            <p>Select a markdown file from the sidebar to preview</p>
            <p className="file-count">{files.length} markdown files found</p>
          </div>
        ) : markdownLoading ? (
          <div className="dev-loading">
            <p>Loading markdown...</p>
          </div>
        ) : markdownError ? (
          <ErrorDisplay error={markdownError} />
        ) : content && filename ? (
          <MarkdownPreview
            content={content}
            filename={filename}
            filePath={selectedFile || filename}
            comments={commentsMap[selectedFile || filename] || []}
            onCommentsChange={(comments) => {
              const key = selectedFile || filename;
              setCommentsMap((prev) => ({ ...prev, [key]: comments }));
            }}
          />
        ) : (
          <div className="dev-placeholder">
            <p>No content available</p>
          </div>
        )}
      </div>
    </div>
  );
};
