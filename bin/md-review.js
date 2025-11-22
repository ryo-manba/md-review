#!/usr/bin/env node

import { spawn } from 'child_process';
import { resolve, dirname } from 'path';
import { existsSync, readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import mri from 'mri';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const packageRoot = resolve(__dirname, '..');

const pkg = JSON.parse(readFileSync(resolve(packageRoot, 'package.json'), 'utf-8'));

const SERVER_READY_MESSAGE = 'md-review server started';

// Parse arguments
const args = mri(process.argv.slice(2), {
  alias: {
    p: 'port',
    h: 'help',
    v: 'version'
  },
  default: {
    port: '6060',
    'api-port': '3030',
    open: true
  },
  boolean: ['help', 'version', 'open']
});

// Help message
if (args.help) {
  console.log(`
md-review - Review and annotate Markdown files with comments

Usage:
  md-review [options]              Start in dev mode (browse all .md files)
  md-review <file> [options]       Preview a specific markdown file

Options:
  -p, --port <port>      Vite server port (default: 6060)
  --api-port <port>      API server port (default: 3030)
  --no-open              Do not open browser automatically
  -h, --help             Show this help message
  -v, --version          Show version number

Examples:
  md-review                        Start dev mode in current directory
  md-review README.md              Preview README.md
  md-review docs/guide.md --port 8080
`);
  process.exit(0);
}

// Version
if (args.version) {
  console.log(pkg.version);
  process.exit(0);
}

const file = args._[0];
const port = args.port;
const apiPort = args['api-port'];
const shouldOpen = args.open;

// Set environment variables
process.env.API_PORT = apiPort;
process.env.VITE_PORT = port;

// If file is specified, validate it
if (file) {
  const filePath = resolve(file);

  if (!existsSync(filePath)) {
    console.error(`Error: File not found: ${filePath}`);
    process.exit(1);
  }

  if (!filePath.endsWith('.md')) {
    console.warn('Warning: File does not have .md extension');
  }

  process.env.MARKDOWN_FILE_PATH = filePath;
  console.log(`File: ${filePath}`);
} else {
  // Dev mode - browse all markdown files
  process.env.BASE_DIR = process.cwd();
  console.log(`Directory: ${process.cwd()}`);
}

console.log('Starting md-review...');
console.log(`   API Port: ${apiPort}`);
console.log(`   Vite Port: ${port}`);

// Start API server
const apiProcess = spawn('node', ['server/index.js'], {
  cwd: packageRoot,
  stdio: ['inherit', 'pipe', 'inherit'],
  env: process.env
});

let viteProcess = null;
let serverReady = false;

// Wait for API server to be ready before starting Vite
apiProcess.stdout.on('data', (data) => {
  process.stdout.write(data);
  const output = data.toString();

  if (!serverReady && output.includes(SERVER_READY_MESSAGE)) {
    serverReady = true;
    console.log('Starting Vite dev server...');

    viteProcess = spawn('node', [
      'node_modules/vite/bin/vite.js',
      '--port', port,
      ...(shouldOpen ? ['--open'] : [])
    ], {
      cwd: packageRoot,
      stdio: 'inherit',
      env: process.env
    });

    viteProcess.on('error', (err) => {
      console.error('Vite server error:', err.message);
    });
  }
});

// Handle graceful shutdown
const shutdown = () => {
  console.log('\nShutting down...');
  apiProcess.kill('SIGINT');
  viteProcess?.kill('SIGINT');
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

// Handle API server exit
apiProcess.on('exit', (code) => {
  if (code !== 0 && code !== null) {
    console.error(`API server exited with code ${code}`);
  }
  viteProcess?.kill('SIGINT');
  process.exit(code || 0);
});

apiProcess.on('error', (err) => {
  console.error('Failed to start API server:', err.message);
  process.exit(1);
});
