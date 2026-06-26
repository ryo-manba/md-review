export interface ParsedContent {
  frontmatter: Record<string, string>;
  body: string;
}

function parseFrontmatter(raw: string): Record<string, string> {
  const result: Record<string, string> = {};
  for (const line of raw.split('\n')) {
    const match = line.match(/^([^:]+):\s*(.*)$/);
    if (match) {
      result[match[1].trim()] = match[2].trim();
    }
  }
  return result;
}

export function parseMdContent(content: string, filename: string): ParsedContent {
  const isMdx = filename.endsWith('.mdx');
  let body = content;
  let frontmatter: Record<string, string> = {};

  // Extract frontmatter
  const fmMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (fmMatch) {
    frontmatter = parseFrontmatter(fmMatch[1]);
    body = content.slice(fmMatch[0].length);
  }

  // Strip import/export lines for MDX
  if (isMdx) {
    body = body
      .split('\n')
      .filter((line) => !/^(import|export)\s/.test(line))
      .join('\n');
  }

  return { frontmatter, body };
}
