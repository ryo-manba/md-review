import { useRef, useEffect } from 'react';
import ReactMarkdown, { Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github.css';
import 'highlight.js/styles/github-dark.css';
import '../styles/markdown.css';
import { SelectionPopover } from './SelectionPopover';
import { CommentList, Comment } from './CommentList';
import { MermaidBlock } from './MermaidBlock';
import { useDarkMode } from '../hooks/useDarkMode';
import { useResizable } from '../hooks/useResizable';

interface MarkdownPreviewProps {
  content: string;
  filename: string;
  filePath?: string;
  comments: Comment[];
  onCommentsChange: (comments: Comment[]) => void;
}

// Components that add data-line-start attribute to elements
const componentsWithLinePosition: Components = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
  code: ({ node, className, children, ...props }: any) => {
    const match = /language-(\w+)/.exec(className || '');
    const language = match ? match[1] : '';

    // Render mermaid diagrams
    if (language === 'mermaid') {
      const code = String(children).replace(/\n$/, '');
      return <MermaidBlock code={code} />;
    }

    // Default code rendering
    return (
      <code className={className} {...props}>
        {children}
      </code>
    );
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  p: ({ node, children, ...props }: any) => (
    <p data-line-start={node?.position?.start?.line} {...props}>
      {children}
    </p>
  ),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  h1: ({ node, children, ...props }: any) => (
    <h1 data-line-start={node?.position?.start?.line} {...props}>
      {children}
    </h1>
  ),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  h2: ({ node, children, ...props }: any) => (
    <h2 data-line-start={node?.position?.start?.line} {...props}>
      {children}
    </h2>
  ),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  h3: ({ node, children, ...props }: any) => (
    <h3 data-line-start={node?.position?.start?.line} {...props}>
      {children}
    </h3>
  ),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  h4: ({ node, children, ...props }: any) => (
    <h4 data-line-start={node?.position?.start?.line} {...props}>
      {children}
    </h4>
  ),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  h5: ({ node, children, ...props }: any) => (
    <h5 data-line-start={node?.position?.start?.line} {...props}>
      {children}
    </h5>
  ),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  h6: ({ node, children, ...props }: any) => (
    <h6 data-line-start={node?.position?.start?.line} {...props}>
      {children}
    </h6>
  ),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  li: ({ node, children, ...props }: any) => (
    <li data-line-start={node?.position?.start?.line} {...props}>
      {children}
    </li>
  ),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  blockquote: ({ node, children, ...props }: any) => (
    <blockquote data-line-start={node?.position?.start?.line} {...props}>
      {children}
    </blockquote>
  ),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  pre: ({ node, children, ...props }: any) => (
    <pre data-line-start={node?.position?.start?.line} {...props}>
      {children}
    </pre>
  ),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  td: ({ node, children, ...props }: any) => (
    <td data-line-start={node?.position?.start?.line} {...props}>
      {children}
    </td>
  ),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  th: ({ node, children, ...props }: any) => (
    <th data-line-start={node?.position?.start?.line} {...props}>
      {children}
    </th>
  ),
};

export const MarkdownPreview = ({
  content,
  filename,
  filePath,
  comments,
  onCommentsChange,
}: MarkdownPreviewProps) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const { isDark } = useDarkMode();
  const {
    width: commentsSidebarWidth,
    isResizing,
    isCollapsed,
    handleMouseDown,
    toggleCollapse,
  } = useResizable({
    initialWidth: 300,
    minWidth: 250,
    maxWidth: 600,
    storageKey: 'md-review-comments-sidebar-width',
    direction: 'right',
    collapsible: true,
    collapseThreshold: 70,
  });

  // Update highlight.js theme based on dark mode
  useEffect(() => {
    const lightTheme = document.querySelector('link[href*="github.css"]');
    const darkTheme = document.querySelector('link[href*="github-dark.css"]');

    if (lightTheme && darkTheme) {
      if (isDark) {
        (lightTheme as HTMLLinkElement).disabled = true;
        (darkTheme as HTMLLinkElement).disabled = false;
      } else {
        (lightTheme as HTMLLinkElement).disabled = false;
        (darkTheme as HTMLLinkElement).disabled = true;
      }
    }
  }, [isDark]);

  const handleSubmitComment = (
    comment: string,
    selectedText: string,
    startLine: number,
    endLine: number,
  ) => {
    const newComment: Comment = {
      id: crypto.randomUUID(),
      text: comment,
      selectedText,
      startLine,
      endLine,
      createdAt: new Date(),
    };

    onCommentsChange([...comments, newComment]);
  };

  const handleDeleteComment = (id: string) => {
    onCommentsChange(comments.filter((c) => c.id !== id));
  };

  const handleDeleteAllComments = () => {
    onCommentsChange([]);
  };

  const handleEditComment = (id: string, newText: string) => {
    onCommentsChange(comments.map((c) => (c.id === id ? { ...c, text: newText } : c)));
  };

  const handleLineClick = (line: number) => {
    if (!contentRef.current) return;

    // Find the element with the matching line number
    const element = contentRef.current.querySelector(`[data-line-start="${line}"]`);
    if (element) {
      // Scroll to the element
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });

      // Add highlight animation
      element.classList.add('highlight-line');
      setTimeout(() => {
        element.classList.remove('highlight-line');
      }, 2000);
    }
  };

  return (
    <div
      className={`markdown-with-comments ${isResizing ? 'resizing' : ''} ${isCollapsed ? 'comments-collapsed' : ''}`}
    >
      <div
        className="markdown-container"
        style={{ paddingRight: isCollapsed ? '0' : `${commentsSidebarWidth + 20}px` }}
      >
        <header className="markdown-header">
          <h1>{filename}</h1>
        </header>
        <div className="markdown-content" ref={contentRef}>
          <ReactMarkdown
            remarkPlugins={[remarkGfm, remarkBreaks]}
            rehypePlugins={[rehypeHighlight]}
            components={componentsWithLinePosition}
          >
            {content}
          </ReactMarkdown>
        </div>
        <SelectionPopover containerRef={contentRef} onSubmitComment={handleSubmitComment} />
      </div>
      {isCollapsed && (
        <button
          className="comments-toggle-button"
          onClick={toggleCollapse}
          title="Show comments"
          aria-label="Show comments"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path
              d="M2 5a2 2 0 012-2h12a2 2 0 012 2v8a2 2 0 01-2 2H6l-4 3V5z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          {comments.length > 0 && <span className="comments-badge">{comments.length}</span>}
        </button>
      )}
      {!isCollapsed && (
        <aside className="comments-sidebar" style={{ width: `${commentsSidebarWidth}px` }}>
          <div className="comments-sidebar-resizer" onMouseDown={handleMouseDown} />
          <CommentList
            comments={[...comments].sort((a, b) => a.startLine - b.startLine)}
            filename={filePath || filename}
            onDeleteComment={handleDeleteComment}
            onDeleteAll={handleDeleteAllComments}
            onClose={toggleCollapse}
            onLineClick={handleLineClick}
            onEditComment={handleEditComment}
          />
        </aside>
      )}
    </div>
  );
};
