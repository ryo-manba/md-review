import { useRef } from 'react';
import ReactMarkdown, { Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github.css';
import '../styles/markdown.css';
import { SelectionPopover } from './SelectionPopover';
import { CommentList, Comment } from './CommentList';

interface MarkdownPreviewProps {
  content: string;
  filename: string;
  filePath?: string;
  comments: Comment[];
  onCommentsChange: (comments: Comment[]) => void;
}

// 各要素に data-line-start を付与するコンポーネント群
const componentsWithLinePosition: Components = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  p: ({ node, children, ...props }: any) => (
    <p data-line-start={node?.position?.start?.line} {...props}>{children}</p>
  ),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  h1: ({ node, children, ...props }: any) => (
    <h1 data-line-start={node?.position?.start?.line} {...props}>{children}</h1>
  ),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  h2: ({ node, children, ...props }: any) => (
    <h2 data-line-start={node?.position?.start?.line} {...props}>{children}</h2>
  ),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  h3: ({ node, children, ...props }: any) => (
    <h3 data-line-start={node?.position?.start?.line} {...props}>{children}</h3>
  ),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  h4: ({ node, children, ...props }: any) => (
    <h4 data-line-start={node?.position?.start?.line} {...props}>{children}</h4>
  ),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  h5: ({ node, children, ...props }: any) => (
    <h5 data-line-start={node?.position?.start?.line} {...props}>{children}</h5>
  ),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  h6: ({ node, children, ...props }: any) => (
    <h6 data-line-start={node?.position?.start?.line} {...props}>{children}</h6>
  ),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  li: ({ node, children, ...props }: any) => (
    <li data-line-start={node?.position?.start?.line} {...props}>{children}</li>
  ),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  blockquote: ({ node, children, ...props }: any) => (
    <blockquote data-line-start={node?.position?.start?.line} {...props}>{children}</blockquote>
  ),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  pre: ({ node, children, ...props }: any) => (
    <pre data-line-start={node?.position?.start?.line} {...props}>{children}</pre>
  ),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  td: ({ node, children, ...props }: any) => (
    <td data-line-start={node?.position?.start?.line} {...props}>{children}</td>
  ),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  th: ({ node, children, ...props }: any) => (
    <th data-line-start={node?.position?.start?.line} {...props}>{children}</th>
  ),
};

export const MarkdownPreview = ({ content, filename, filePath, comments, onCommentsChange }: MarkdownPreviewProps) => {
  const contentRef = useRef<HTMLDivElement>(null);

  const handleSubmitComment = (comment: string, selectedText: string, startLine: number, endLine: number) => {
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

  return (
    <div className="markdown-with-comments">
      <div className="markdown-container">
        <header className="markdown-header">
          <h1>{filename}</h1>
        </header>
        <div className="markdown-content" ref={contentRef}>
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeHighlight]}
            components={componentsWithLinePosition}
          >
            {content}
          </ReactMarkdown>
        </div>
        <SelectionPopover
          containerRef={contentRef}
          onSubmitComment={handleSubmitComment}
        />
      </div>
      <aside className="comments-sidebar">
        <CommentList
          comments={[...comments].sort((a, b) => a.startLine - b.startLine)}
          filename={filePath || filename}
          onDeleteComment={handleDeleteComment}
          onDeleteAll={handleDeleteAllComments}
        />
      </aside>
    </div>
  );
};
