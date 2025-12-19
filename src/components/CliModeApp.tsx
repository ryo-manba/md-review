import { useState } from 'react';
import { useMarkdown } from '../hooks/useMarkdown';
import { useFileWatch } from '../hooks/useFileWatch';
import { MarkdownPreview } from './MarkdownPreview';
import { ErrorDisplay } from './ErrorDisplay';
import { Comment } from './CommentList';

export const CliModeApp = () => {
  const { content, filename, loading, error, reload } = useMarkdown();
  const [comments, setComments] = useState<Comment[]>([]);

  // Watch for file changes and reload
  useFileWatch(() => {
    reload();
  });

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return <ErrorDisplay error={error} />;
  }

  if (!content || !filename) {
    return (
      <div style={{ padding: '2rem' }}>
        <p>No content available</p>
      </div>
    );
  }

  return (
    <MarkdownPreview
      content={content}
      filename={filename}
      comments={comments}
      onCommentsChange={setComments}
    />
  );
};
