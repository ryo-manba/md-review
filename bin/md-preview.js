#!/usr/bin/env node

import { Command } from 'commander';
import { spawn } from 'child_process';
import { resolve, dirname } from 'path';
import { existsSync } from 'fs';
import open from 'open';
import chalk from 'chalk';
import { fileURLToPath } from 'url';

// get __dirname using ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const program = new Command();

program
  .name('md-preview')
  .description('Preview Markdown files in your browser')
  .version('0.0.1')
  .argument('<file>', 'Path to the markdown file')
  .option('-p, --port <port>', 'Vite server port', '6060')
  .option('--api-port <port>', 'API server port', '3030')
  .option('--no-open', 'Do not open browser automatically')
  .action((file, options) => {
    // validate file path
    const filePath = resolve(file);

    if (!existsSync(filePath)) {
      console.error(chalk.red(`Error: File not found: ${filePath}`));
      process.exit(1);
    }

    if (!filePath.endsWith('.md')) {
      console.warn(chalk.yellow('Warning: File does not have .md extension'));
    }

    console.log(chalk.blue('Starting md-preview...'));
    console.log(chalk.gray(`File: ${filePath}`));
    console.log(chalk.gray(`API Port: ${options.apiPort}`));
    console.log(chalk.gray(`Vite Port: ${options.port}`));

    // set environment variables
    process.env.MARKDOWN_FILE_PATH = filePath;
    process.env.API_PORT = options.apiPort;
    process.env.VITE_PORT = options.port;

    // start API server and Vite server
    const apiServer = spawn('node', ['server/index.js'], {
      cwd: resolve(__dirname, '..'),
      stdio: 'inherit',
      env: process.env
    });

    const viteServer = spawn('pnpm', ['run', 'dev', '--', '--port', options.port], {
      cwd: resolve(__dirname, '..'),
      stdio: 'inherit',
      shell: true
    });

    // open browser
    if (options.open) {
      setTimeout(() => {
        const url = `http://localhost:${options.port}`;
        console.log(chalk.green(`Opening browser at ${url}`));
        open(url);
      }, 2000);
    }

    // clean up
    process.on('SIGINT', () => {
      console.log(chalk.yellow('\nShutting down servers...'));
      apiServer.kill();
      viteServer.kill();
      process.exit(0);
    });
  });

program.parse();
