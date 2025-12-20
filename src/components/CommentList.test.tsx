import { render, screen } from '@testing-library/react';
import { type UserEvent, userEvent } from '@testing-library/user-event';
import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest';
import { CommentList, Comment } from './CommentList';

describe('CommentList', () => {
  let user: UserEvent;

  const mockComments: Comment[] = [
    {
      id: '1',
      text: 'First comment',
      selectedText: 'selected text 1',
      startLine: 1,
      endLine: 1,
      createdAt: new Date('2025-01-01'),
    },
    {
      id: '2',
      text: 'Second comment',
      selectedText: 'selected text 2',
      startLine: 5,
      endLine: 10,
      createdAt: new Date('2025-01-02'),
    },
  ];

  beforeAll(() => {
    user = userEvent.setup();
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should display comment list', () => {
    render(<CommentList comments={mockComments} filename="test.md" />);

    expect(screen.getByText('First comment')).toBeInTheDocument();
    expect(screen.getByText('Second comment')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Comments (2)' })).toBeInTheDocument();
  });

  it('should display empty state when no comments', () => {
    render(<CommentList comments={[]} filename="test.md" />);

    expect(screen.getByText('No comments yet')).toBeInTheDocument();
    expect(screen.getByText('Select text to add a comment')).toBeInTheDocument();
  });

  it('should call onDeleteComment when delete button is clicked', async () => {
    const onDeleteComment = vi.fn();

    render(
      <CommentList comments={mockComments} filename="test.md" onDeleteComment={onDeleteComment} />,
    );

    const deleteButtons = screen.getAllByRole('button', { name: '×' });
    await user.click(deleteButtons[0]);

    expect(onDeleteComment).toHaveBeenCalledWith('1');
  });

  it('should call onDeleteAll when delete all button is clicked', async () => {
    const onDeleteAll = vi.fn();

    render(<CommentList comments={mockComments} filename="test.md" onDeleteAll={onDeleteAll} />);

    const deleteAllButton = screen.getByRole('button', { name: 'Clear' });
    await user.click(deleteAllButton);

    expect(onDeleteAll).toHaveBeenCalledTimes(1);
  });

  it('should copy comment to clipboard when copy button is clicked', async () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator.clipboard, { writeText: writeTextMock });

    render(<CommentList comments={mockComments} filename="test.md" />);

    const copyButtons = screen.getAllByTitle('Copy comment');
    await user.click(copyButtons[0]);

    expect(writeTextMock).toHaveBeenCalledWith('test.md:L1\nFirst comment');
  });

  it('should copy all comments when copy all button is clicked', async () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator.clipboard, { writeText: writeTextMock });

    render(<CommentList comments={mockComments} filename="test.md" />);

    const copyAllButton = screen.getByRole('button', { name: 'Copy All' });
    await user.click(copyAllButton);

    expect(writeTextMock).toHaveBeenCalledWith(expect.stringContaining('First comment'));
    expect(writeTextMock).toHaveBeenCalledWith(expect.stringContaining('Second comment'));
  });

  it('should call onLineClick when line number is clicked', async () => {
    const onLineClick = vi.fn();

    render(<CommentList comments={mockComments} filename="test.md" onLineClick={onLineClick} />);

    const lineButton = screen.getByRole('button', { name: 'Line 1' });
    await user.click(lineButton);

    expect(onLineClick).toHaveBeenCalledWith(1);
  });

  it('should display line range when comment spans multiple lines', () => {
    render(<CommentList comments={mockComments} filename="test.md" />);

    expect(screen.getByRole('button', { name: 'Line 5-10' })).toBeInTheDocument();
  });

  it('should enter edit mode when edit button is clicked', async () => {
    const onEditComment = vi.fn();

    render(
      <CommentList comments={mockComments} filename="test.md" onEditComment={onEditComment} />,
    );

    const editButtons = screen.getAllByTitle('Edit comment');
    await user.click(editButtons[0]);

    expect(screen.getByDisplayValue('First comment')).toBeInTheDocument();
  });

  it('should call onEditComment when save button is clicked in edit mode', async () => {
    const onEditComment = vi.fn();

    render(
      <CommentList comments={mockComments} filename="test.md" onEditComment={onEditComment} />,
    );

    const editButtons = screen.getAllByTitle('Edit comment');
    await user.click(editButtons[0]);

    const textarea = screen.getByDisplayValue('First comment');
    await user.clear(textarea);
    await user.type(textarea, 'Updated comment');

    const saveButton = screen.getByRole('button', { name: 'Save' });
    await user.click(saveButton);

    expect(onEditComment).toHaveBeenCalledWith('1', 'Updated comment');
  });

  it('should exit edit mode when cancel button is clicked', async () => {
    const onEditComment = vi.fn();

    render(
      <CommentList comments={mockComments} filename="test.md" onEditComment={onEditComment} />,
    );

    const editButtons = screen.getAllByTitle('Edit comment');
    await user.click(editButtons[0]);

    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    await user.click(cancelButton);

    expect(screen.queryByDisplayValue('First comment')).not.toBeInTheDocument();
  });

  it('should call onClose when hide button is clicked', async () => {
    const onClose = vi.fn();

    render(<CommentList comments={mockComments} filename="test.md" onClose={onClose} />);

    const hideButton = screen.getByRole('button', { name: 'Hide comments' });
    await user.click(hideButton);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('should truncate long selected text', () => {
    const longComment: Comment = {
      id: '3',
      text: 'Comment',
      selectedText: 'a'.repeat(100),
      startLine: 1,
      endLine: 1,
      createdAt: new Date(),
    };

    render(<CommentList comments={[longComment]} filename="test.md" />);

    expect(screen.getByText('"' + 'a'.repeat(50) + '..."')).toBeInTheDocument();
  });
});
