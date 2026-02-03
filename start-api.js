/**
 * Production starter for Replit Cloud Run deployment
 * Runs the compiled Express API from apps/wrbt-api/dist
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Set production environment
process.env.NODE_ENV = 'production';

// Validate required environment variables
const required = ['DATABASE_URL', 'SESSION_SECRET'];
const missing = required.filter(key => !process.env[key]);
if (missing.length > 0) {
  console.error(`❌ Missing required environment variables: ${missing.join(', ')}`);
  process.exit(1);
}

// Log startup info
console.log('🚀 Starting WRBT API');
console.log('   NODE_ENV:', process.env.NODE_ENV);
console.log('   PORT:', process.env.PORT || '5000');
console.log('   Database:', process.env.DATABASE_URL ? '✓ configured' : '✗ missing');

// Import and run the compiled server
const serverPath = join(__dirname, 'apps', 'wrbt-api', 'dist', 'server', 'index.js');
await import(serverPath);
