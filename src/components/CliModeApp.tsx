import { useMarkdown } from '../hooks/useMarkdown';
import { useFileWatch } from '../hooks/useFileWatch';
import { useReviewFile } from '../hooks/useReviewFile';
import { MarkdownPreview } from './MarkdownPreview';
import { ErrorDisplay } from './ErrorDisplay';

export const CliModeApp = () => {
  const { content, filename, loading, error, reload } = useMarkdown();
  const { comments, setComments, saving, saveNow } = useReviewFile({ filePath: null });

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
      saving={saving}
      onSaveNow={saveNow}
    />
  );
};
