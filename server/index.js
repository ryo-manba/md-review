// server/index.js
import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { readFile, readdir, stat } from 'fs/promises';
import { basename, join, relative, resolve } from 'path';

// Port validation function
function validatePort(value) {
  const port = parseInt(value, 10);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(`Invalid port: ${value}`);
  }
  return port;
}

// Try to start server on port, incrementing if busy
async function startServer(app, port, maxRetries = 10) {
  for (let i = 0; i < maxRetries; i++) {
    const tryPort = port + i;
    try {
      await new Promise((resolve, reject) => {
        const server = serve({
          fetch: app.fetch,
          port: tryPort
        });
        server.once('listening', () => resolve(server));
        server.once('error', reject);
      });
      return tryPort;
    } catch (err) {
      if (err.code === 'EADDRINUSE') {
        console.log(`Port ${tryPort} is in use, trying ${tryPort + 1}...`);
        continue;
      }
      throw err;
    }
  }
  throw new Error(`Could not find an available port after ${maxRetries} attempts`);
}

const app = new Hono();
const PORT = validatePort(process.env.API_PORT || 3030);
const MARKDOWN_FILE_PATH = process.env.MARKDOWN_FILE_PATH;
const BASE_DIR = process.env.BASE_DIR || process.cwd();

// Check if file has markdown extension
function isMarkdownFile(filename) {
  return filename.endsWith('.md') || filename.endsWith('.markdown');
}

// Helper function to scan markdown files recursively
async function scanMarkdownFiles(dir, baseDir = dir) {
  const files = [];
  const entries = await readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    const relativePath = relative(baseDir, fullPath);

    // Skip node_modules, .git, dist, and hidden directories
    if (entry.name.startsWith('.') ||
        entry.name === 'node_modules' ||
        entry.name === 'dist' ||
        entry.name === 'dist-ssr') {
      continue;
    }

    if (entry.isDirectory()) {
      const subFiles = await scanMarkdownFiles(fullPath, baseDir);
      files.push(...subFiles);
    } else if (entry.isFile() && isMarkdownFile(entry.name)) {
      files.push({
        name: entry.name,
        path: relativePath,
        dir: relative(baseDir, dir) || '.'
      });
    }
  }

  return files;
}

// Health check
app.get('/api/health', (c) => {
  return c.json({ status: 'ok' });
});

// Get list of all markdown files
app.get('/api/files', async (c) => {
  try {
    const files = await scanMarkdownFiles(BASE_DIR);
    return c.json({ files, baseDir: BASE_DIR });
  } catch (err) {
    console.error('Error scanning markdown files:', err.message);
    return c.json({
      error: 'Failed to scan markdown files'
    }, 500);
  }
});

// Get markdown file API (CLI mode)
app.get('/api/markdown', async (c) => {
  if (!MARKDOWN_FILE_PATH) {
    return c.json({
      error: 'Markdown file path not specified'
    }, 500);
  }

  try {
    const data = await readFile(MARKDOWN_FILE_PATH, 'utf-8');
    const filename = basename(MARKDOWN_FILE_PATH);
    return c.json({ content: data, filename });
  } catch (err) {
    console.error('Error reading markdown:', err.message);
    return c.json({
      error: 'Failed to read markdown file'
    }, 500);
  }
});

// Get specific markdown file by path (Dev mode)
app.get('/api/markdown/:path{.+}', async (c) => {
  const requestedPath = c.req.param('path');

  try {
    // Security check: prevent path traversal
    const fullPath = resolve(BASE_DIR, requestedPath);
    if (!fullPath.startsWith(resolve(BASE_DIR))) {
      return c.json({
        error: 'Invalid file path'
      }, 403);
    }

    const data = await readFile(fullPath, 'utf-8');
    const filename = basename(fullPath);
    return c.json({ content: data, filename, path: requestedPath });
  } catch (err) {
    console.error('Error reading markdown:', err.message);
    return c.json({
      error: 'Failed to read markdown file'
    }, 500);
  }
});

const SERVER_READY_MESSAGE = 'md-review server started';

startServer(app, PORT).then((actualPort) => {
  console.log(`API Server running on http://localhost:${actualPort}`);
  console.log(SERVER_READY_MESSAGE);
}).catch((err) => {
  console.error('Failed to start server:', err.message);
  process.exit(1);
});
