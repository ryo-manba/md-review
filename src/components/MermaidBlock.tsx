import { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { useDarkMode } from '../hooks/useDarkMode';

interface MermaidBlockProps {
  code: string;
}

export const MermaidBlock = ({ code }: MermaidBlockProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const { isDark } = useDarkMode();

  useEffect(() => {
    let cancelled = false;

    const renderDiagram = async () => {
      try {
        mermaid.initialize({
          startOnLoad: false,
          theme: isDark ? 'dark' : 'default',
          securityLevel: 'strict',
        });

        const id = `mermaid-${crypto.randomUUID()}`;
        const { svg: renderedSvg } = await mermaid.render(id, code);

        if (!cancelled) {
          setSvg(renderedSvg);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to render diagram');
          setSvg('');
        }
      }
    };

    renderDiagram();

    return () => {
      cancelled = true;
    };
  }, [code, isDark]);

  if (error) {
    return (
      <div className="mermaid-error">
        <pre>{code}</pre>
        <p className="mermaid-error-message">Mermaid error: {error}</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="mermaid-container"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
};
