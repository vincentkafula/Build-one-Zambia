/**
 * Database layer — simple JSON file store
 * Uses /tmp on Railway (ephemeral) or ./data locally.
 * Data is in-memory; persisted to disk as a best-effort cache.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Railway has a read-only filesystem except /tmp.
// Use DATA_DIR env var to override, else /tmp on Railway, ./data locally.
const IS_RAILWAY = !!process.env.RAILWAY_ENVIRONMENT || !!process.env.RAILWAY_PROJECT_ID;
const DATA_DIR = process.env.DATA_DIR || (IS_RAILWAY ? '/tmp/boz-data' : path.join(__dirname, '..', 'data'));
const DB_PATH  = path.join(DATA_DIR, 'kv.json');

try { fs.mkdirSync(DATA_DIR, { recursive: true }); } catch {}

let store = {};
try {
  if (fs.existsSync(DB_PATH)) {
    store = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
  }
} catch { store = {}; }

let flushTimer = null;

function scheduleFlush() {
  if (flushTimer) return;
  flushTimer = setTimeout(() => {
    flushTimer = null;
    try { fs.writeFileSync(DB_PATH, JSON.stringify(store), 'utf8'); } catch (e) {
      console.error('[db] flush error:', e.message);
    }
  }, 200);
}

export const kv = {
  get(key) {
    const v = store[key];
    return v === undefined ? null : v;
  },
  set(key, value) {
    store[key] = value;
    scheduleFlush();
  },
  del(key) {
    delete store[key];
    scheduleFlush();
  },
  getByPrefix(prefix) {
    return Object.keys(store).filter(k => k.startsWith(prefix)).map(k => store[k]);
  },
  getKeysByPrefix(prefix) {
    return Object.keys(store).filter(k => k.startsWith(prefix));
  },
  mset(pairs) {
    for (const [k, v] of pairs) store[k] = v;
    scheduleFlush();
  },
};

process.on('exit', () => {
  if (flushTimer) {
    clearTimeout(flushTimer);
    try { fs.writeFileSync(DB_PATH, JSON.stringify(store), 'utf8'); } catch {}
  }
});

export default { store };
