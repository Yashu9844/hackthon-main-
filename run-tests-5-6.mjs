#!/usr/bin/env node
/**
 * Combined server starter and test runner
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🚀 Starting backend server...\n');

// Start server
const serverProcess = spawn('bun', ['run', 'dev'], {
  cwd: join(__dirname, 'apps', 'backend'),
  stdio: 'pipe',
  shell: true,
});

let serverReady = false;

serverProcess.stdout.on('data', (data) => {
  const output = data.toString();
  console.log(output);
  
  if (output.includes('listening on port 8000')) {
    serverReady = true;
    console.log('\n✅ Server ready! Starting tests in 2 seconds...\n');
    
    setTimeout(async () => {
      console.log('📝 Running tests...\n');
      
      // Import and run tests
      await import('./test-steps-5-6.mjs');
      
      // Kill server
      console.log('\n🛑 Stopping server...');
      serverProcess.kill();
      process.exit(0);
    }, 2000);
  }
});

serverProcess.stderr.on('data', (data) => {
  console.error(data.toString());
});

serverProcess.on('close', (code) => {
  if (!serverReady) {
    console.error(`\n❌ Server failed to start (exit code ${code})`);
    process.exit(1);
  }
});

// Timeout after 30 seconds
setTimeout(() => {
  if (!serverReady) {
    console.error('\n❌ Server start timeout');
    serverProcess.kill();
    process.exit(1);
  }
}, 30000);
