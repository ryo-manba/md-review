import { useState } from 'react';

export interface Comment {
  id: string;
  text: string;
  selectedText: string;
  startLine: number;
  endLine: number;
  createdAt: Date;
}

interface CommentListProps {
  comments: Comment[];
  filename: string;
  onDeleteComment?: (id: string) => void;
  onDeleteAll?: () => void;
  onClose?: () => void;
}

export const CommentList = ({ comments, filename, onDeleteComment, onDeleteAll, onClose }: CommentListProps) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  const formatComment = (comment: Comment) => {
    const lineRange = comment.startLine === comment.endLine
      ? `L${comment.startLine}`
      : `L${comment.startLine}-${comment.endLine}`;
    return `${filename}:${lineRange}\n${comment.text}`;
  };

  const handleCopyComment = async (comment: Comment) => {
    try {
      await navigator.clipboard.writeText(formatComment(comment));
      setCopiedId(comment.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleCopyAll = async () => {
    const text = comments
      .map(formatComment)
      .join('\n------------------------------------\n');

    try {
      await navigator.clipboard.writeText(text);
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (comments.length === 0) {
    return (
      <div className="comment-list-empty">
        <p>No comments yet</p>
        <p className="comment-list-hint">Select text to add a comment</p>
      </div>
    );
  }

  return (
    <div className="comment-list">
      <div className="comment-list-header">
        <div className="comment-list-title-wrapper">
          {onClose && (
            <button
              className="comment-list-collapse-btn"
              onClick={onClose}
              title="Hide comments"
              aria-label="Hide comments"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </button>
          )}
          <h3 className="comment-list-title">Comments ({comments.length})</h3>
        </div>
        <div className="comment-list-actions">
          <button
            className={`comment-list-copy-all ${copiedAll ? 'copied' : ''}`}
            onClick={handleCopyAll}
            title={copiedAll ? 'Copied!' : 'Copy all comments'}
          >
            {copiedAll ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
              </svg>
            )}
            <span>Copy All</span>
          </button>
          {onDeleteAll && (
            <button
              className="comment-list-delete-all"
              onClick={onDeleteAll}
              title="Delete all comments"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
              </svg>
              <span>Clear</span>
            </button>
          )}
        </div>
      </div>
      <div className="comment-list-items">
        {comments.map((comment) => (
          <div key={comment.id} className="comment-item">
            <div className="comment-item-header">
              <span className="comment-item-lines">
                Line {comment.startLine === comment.endLine
                  ? comment.startLine
                  : `${comment.startLine}-${comment.endLine}`}
              </span>
              <div className="comment-item-actions">
                <button
                  className={`comment-item-copy ${copiedId === comment.id ? 'copied' : ''}`}
                  onClick={() => handleCopyComment(comment)}
                  title={copiedId === comment.id ? 'Copied!' : 'Copy comment'}
                >
                  {copiedId === comment.id ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  ) : (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                      <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
                    </svg>
                  )}
                </button>
                {onDeleteComment && (
                  <button
                    className="comment-item-delete"
                    onClick={() => onDeleteComment(comment.id)}
                    title="Delete comment"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>
            <div className="comment-item-selection">
              "{comment.selectedText.length > 50
                ? comment.selectedText.slice(0, 50) + '...'
                : comment.selectedText}"
            </div>
            <div className="comment-item-text">{comment.text}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
