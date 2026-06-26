import { describe, it, expect } from 'vitest';
import { parseMdContent } from './parseMdContent';

describe('parseMdContent', () => {
  describe('frontmatter parsing', () => {
    it('extracts frontmatter from .md file', () => {
      const content = '---\ntitle: Hello\ndate: 2024-01-01\n---\n\n# Body';
      const { frontmatter, body } = parseMdContent(content, 'file.md');
      expect(frontmatter).toEqual({ title: 'Hello', date: '2024-01-01' });
      expect(body).toBe('\n# Body');
    });

    it('extracts frontmatter from .mdx file', () => {
      const content = '---\ntitle: Hello\n---\n\n# Body';
      const { frontmatter, body } = parseMdContent(content, 'file.mdx');
      expect(frontmatter).toEqual({ title: 'Hello' });
      expect(body).toBe('\n# Body');
    });

    it('returns empty frontmatter when none present', () => {
      const content = '# Body';
      const { frontmatter, body } = parseMdContent(content, 'file.md');
      expect(frontmatter).toEqual({});
      expect(body).toBe('# Body');
    });

    it('handles frontmatter with extra whitespace around values', () => {
      const content = '---\ntitle:   Hello World  \n---\n\n# Body';
      const { frontmatter } = parseMdContent(content, 'file.md');
      expect(frontmatter.title).toBe('Hello World');
    });
  });

  describe('MDX preprocessing', () => {
    it('strips import lines from .mdx', () => {
      const content = '---\ntitle: Test\n---\n\nimport Foo from "./foo"\n\n# Body';
      const { body } = parseMdContent(content, 'file.mdx');
      expect(body).not.toContain('import');
      expect(body).toContain('# Body');
    });

    it('strips export lines from .mdx', () => {
      const content = '---\ntitle: Test\n---\n\nexport const x = 1\n\n# Body';
      const { body } = parseMdContent(content, 'file.mdx');
      expect(body).not.toContain('export');
      expect(body).toContain('# Body');
    });

    it('does not strip import/export lines from .md', () => {
      const content = '# Title\n\nimport something\n\nexport default foo';
      const { body } = parseMdContent(content, 'file.md');
      expect(body).toContain('import something');
      expect(body).toContain('export default foo');
    });

    it('strips multiple import/export lines from .mdx', () => {
      const content = 'import A from "./a"\nimport B from "./b"\nexport const x = 1\n\n# Body';
      const { body } = parseMdContent(content, 'file.mdx');
      expect(body).not.toContain('import');
      expect(body).not.toContain('export');
      expect(body).toContain('# Body');
    });
  });
});
