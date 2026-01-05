import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MermaidBlock } from './MermaidBlock';
import mermaid from 'mermaid';

vi.mock('mermaid', () => ({
  default: {
    initialize: vi.fn(),
    render: vi.fn(),
  },
}));

vi.mock('../hooks/useDarkMode', () => ({
  useDarkMode: () => ({ isDark: false }),
}));

describe('MermaidBlock', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render diagram with strict security level', async () => {
    vi.mocked(mermaid.render).mockResolvedValue({
      svg: '<svg>diagram</svg>',
      diagramType: 'flowchart',
    });

    render(<MermaidBlock code="graph TD; A-->B" />);

    await waitFor(() => {
      expect(mermaid.initialize).toHaveBeenCalledWith(
        expect.objectContaining({ securityLevel: 'strict' }),
      );
      expect(document.querySelector('.mermaid-container')).toBeInTheDocument();
    });
  });

  it('should display error when rendering fails', async () => {
    vi.mocked(mermaid.render).mockRejectedValue(new Error('Invalid syntax'));

    render(<MermaidBlock code="invalid code" />);

    await waitFor(() => {
      expect(screen.getByText('Mermaid error: Invalid syntax')).toBeInTheDocument();
    });
  });
});
