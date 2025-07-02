#!/usr/bin/env node

/**
 * TıpScribe Cross-Platform Development Starter
 * Windows, macOS, Linux uyumlu başlatma scripti
 */

const { spawn } = require('child_process');
const path = require('path');
const os = require('os');

console.log('🏥 TıpScribe Development Server Starting...\n');

// Platform detection
const isWindows = os.platform() === 'win32';
const isMacOS = os.platform() === 'darwin';
const isLinux = os.platform() === 'linux';

console.log(`Platform: ${os.platform()}`);
console.log(`Node.js: ${process.version}`);
console.log(`Architecture: ${os.arch()}\n`);

// Environment variables
const env = {
  ...process.env,
  NODE_ENV: 'development',
  PORT: '5000'
};

console.log('Environment variables set:');
console.log('- NODE_ENV=development');
console.log('- PORT=5000\n');

// Start command based on platform
let command, args;

if (isWindows) {
  command = 'npx';
  args = ['tsx', 'server/index.ts'];
} else {
  command = 'npx';
  args = ['tsx', 'server/index.ts'];
}

console.log(`Executing: ${command} ${args.join(' ')}\n`);

// Start the development server
const child = spawn(command, args, {
  env,
  stdio: 'inherit',
  shell: isWindows
});

child.on('error', (error) => {
  console.error(`❌ Error starting server: ${error.message}`);
  process.exit(1);
});

child.on('exit', (code) => {
  console.log(`\n🔚 Server process exited with code: ${code}`);
  process.exit(code);
});

// Handle Ctrl+C gracefully
process.on('SIGINT', () => {
  console.log('\n⏹️  Shutting down development server...');
  child.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('\n⏹️  Shutting down development server...');
  child.kill('SIGTERM');
});