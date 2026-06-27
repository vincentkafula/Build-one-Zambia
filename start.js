/**
 * BOZ Monorepo Starter
 * Starts backend on BACKEND_PORT (3001) then frontend on PORT (Railway public port).
 * The frontend server.js proxies /make-server-8fca9621/* → backend.
 */

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import { setTimeout as sleep } from 'timers/promises';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const PUBLIC_PORT  = process.env.PORT || '3000';
const BACKEND_PORT = '3001'; // always internal, never exposed

// Pass these down to child processes
process.env.BACKEND_PORT = BACKEND_PORT;
process.env.API_URL      = `http://localhost:${BACKEND_PORT}`;

console.log('\n🇿🇲  Build One Zambia — Monorepo Starter');
console.log(`   NODE_ENV    : ${process.env.NODE_ENV || 'development'}`);
console.log(`   Public port : ${PUBLIC_PORT}  (frontend + proxy)`);
console.log(`   Backend port: ${BACKEND_PORT} (internal only)`);
console.log(`   API_URL     : ${process.env.API_URL}\n`);

function startProcess(name, args, cwd, extraEnv = {}) {
  console.log(`[${name}] Starting: node ${args.join(' ')} in ${cwd}`);
  const proc = spawn('node', args, {
    cwd,
    env: { ...process.env, ...extraEnv },
    stdio: 'inherit',
  });

  proc.on('error', err => {
    console.error(`[${name}] ERROR:`, err.message);
    process.exit(1);
  });

  proc.on('exit', code => {
    if (code !== 0 && code !== null) {
      console.error(`[${name}] Exited with code ${code} — shutting down`);
      process.exit(code);
    }
  });

  return proc;
}

// 1. Start backend
const backend = startProcess(
  'backend',
  ['src/index.js'],
  path.join(__dirname, 'backend'),
  { PORT: BACKEND_PORT }
);

// 2. Wait for backend to be ready, then start frontend
async function waitForBackend(maxWaitMs = 15000) {
  const start = Date.now();
  while (Date.now() - start < maxWaitMs) {
    try {
      const res = await fetch(`http://localhost:${BACKEND_PORT}/`);
      if (res.ok) {
        console.log(`[backend] Ready on port ${BACKEND_PORT} ✅`);
        return true;
      }
    } catch {
      // not ready yet
    }
    await sleep(500);
  }
  console.warn(`[backend] Did not respond within ${maxWaitMs}ms — starting frontend anyway`);
  return false;
}

await waitForBackend();

startProcess(
  'frontend',
  ['server.js'],
  path.join(__dirname, 'frontend'),
  { PORT: PUBLIC_PORT }
);

// Graceful shutdown
['SIGTERM', 'SIGINT'].forEach(sig => process.on(sig, () => {
  backend.kill('SIGTERM');
  process.exit(0);
}));
