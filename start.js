/**
 * BOZ Monorepo Starter
 * Runs the backend (Express on PORT) and frontend (static server on FRONTEND_PORT).
 * Railway exposes a single port — we proxy API requests from the frontend server
 * to the backend, so only one port is needed externally.
 */

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Railway provides PORT for the single public-facing port.
// We run the frontend server on that port, and the backend on an internal port.
const PUBLIC_PORT  = process.env.PORT || '3000';
const BACKEND_PORT = process.env.BACKEND_PORT || '3001';

// Tell the backend which port to use
process.env.BACKEND_PORT = BACKEND_PORT;

// Tell the frontend server where to find the backend
// (server.js reads VITE_API_URL or API_URL to inject window.__API_URL__)
if (!process.env.VITE_API_URL && !process.env.API_URL) {
  // Same-host loopback: frontend proxies to backend on internal port
  process.env.API_URL = `http://localhost:${BACKEND_PORT}`;
}

console.log('\n🇿🇲  Build One Zambia — Starting services...');
console.log(`   Frontend → port ${PUBLIC_PORT}`);
console.log(`   Backend  → port ${BACKEND_PORT}`);
console.log(`   API URL  → ${process.env.VITE_API_URL || process.env.API_URL}\n`);

function startProcess(name, command, args, cwd, env = {}) {
  const proc = spawn(command, args, {
    cwd,
    env: { ...process.env, ...env },
    stdio: 'inherit',
    shell: false,
  });

  proc.on('error', (err) => {
    console.error(`[${name}] Failed to start:`, err.message);
    process.exit(1);
  });

  proc.on('exit', (code) => {
    if (code !== 0) {
      console.error(`[${name}] Exited with code ${code}`);
      process.exit(code);
    }
  });

  return proc;
}

// Start backend
const backend = startProcess(
  'backend',
  'node',
  ['src/index.js'],
  path.join(__dirname, 'backend'),
  { PORT: BACKEND_PORT }
);

// Give backend 2s to boot, then start frontend
setTimeout(() => {
  startProcess(
    'frontend',
    'node',
    ['server.js'],
    path.join(__dirname, 'frontend'),
    { PORT: PUBLIC_PORT }
  );
}, 2000);

// Graceful shutdown
function shutdown() {
  backend.kill('SIGTERM');
  process.exit(0);
}
process.on('SIGTERM', shutdown);
process.on('SIGINT',  shutdown);
