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
  onLineClick?: (line: number) => void;
  onEditComment?: (id: string, newText: string) => void;
}

export const CommentList = ({ comments, filename, onDeleteComment, onDeleteAll, onClose, onLineClick, onEditComment }: CommentListProps) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

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

  const handleStartEdit = (comment: Comment) => {
    setEditingId(comment.id);
    setEditText(comment.text);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditText('');
  };

  const handleSaveEdit = (id: string) => {
    if (editText.trim() && onEditComment) {
      onEditComment(id, editText.trim());
      setEditingId(null);
      setEditText('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>, id: string) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSaveEdit(id);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancelEdit();
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
              <button
                className="comment-item-lines"
                onClick={() => onLineClick?.(comment.startLine)}
                title="Jump to line"
              >
                Line {comment.startLine === comment.endLine
                  ? comment.startLine
                  : `${comment.startLine}-${comment.endLine}`}
              </button>
              <div className="comment-item-actions">
                {onEditComment && editingId !== comment.id && (
                  <button
                    className="comment-item-edit"
                    onClick={() => handleStartEdit(comment)}
                    title="Edit comment"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                  </button>
                )}
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
              {'"'}
              {comment.selectedText.length > 50
                ? comment.selectedText.slice(0, 50) + '...'
                : comment.selectedText}
              {'"'}
            </div>
            {editingId === comment.id ? (
              <div className="comment-edit-form">
                <textarea
                  className="comment-edit-input"
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, comment.id)}
                  rows={3}
                  autoFocus
                />
                <div className="comment-edit-actions">
                  <button
                    className="comment-edit-cancel"
                    onClick={handleCancelEdit}
                  >
                    Cancel
                  </button>
                  <button
                    className="comment-edit-save"
                    onClick={() => handleSaveEdit(comment.id)}
                    disabled={!editText.trim()}
                  >
                    Save
                  </button>
                </div>
              </div>
            ) : (
              <div className="comment-item-text">{comment.text}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
