#!/usr/bin/env node
const { spawn } = require('child_process');
const { join } = require('path');

const child = spawn('node', [join(__dirname, 'apps/wrbt-api/dist/index.js')], {
  stdio: 'inherit',
  env: { ...process.env, NODE_ENV: 'production' }
});

child.on('exit', (code) => process.exit(code));
