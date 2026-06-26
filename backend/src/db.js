/**
 * Database layer — simple JSON file store
 * Pure Node.js, no native dependencies, works everywhere.
 * Data is stored in ./data/kv.json
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '..', 'data');
const DB_PATH  = path.join(DATA_DIR, 'kv.json');

fs.mkdirSync(DATA_DIR, { recursive: true });

// Load the in-memory store on startup
let store = {};
if (fs.existsSync(DB_PATH)) {
  try {
    store = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
  } catch {
    store = {};
  }
}

let flushTimer = null;

function scheduleFlush() {
  if (flushTimer) return;
  flushTimer = setTimeout(() => {
    flushTimer = null;
    try {
      fs.writeFileSync(DB_PATH, JSON.stringify(store), 'utf8');
    } catch (e) {
      console.error('[db] flush error:', e.message);
    }
  }, 200); // debounce: write at most every 200ms
}

export const kv = {
  get(key) {
    const v = store[key];
    if (v === undefined) return null;
    return v;
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
    return Object.keys(store)
      .filter(k => k.startsWith(prefix))
      .map(k => store[k]);
  },

  getKeysByPrefix(prefix) {
    return Object.keys(store).filter(k => k.startsWith(prefix));
  },

  mset(pairs) {
    for (const [k, v] of pairs) store[k] = v;
    scheduleFlush();
  },
};

// Flush on process exit
process.on('exit', () => {
  if (flushTimer) {
    clearTimeout(flushTimer);
    try { fs.writeFileSync(DB_PATH, JSON.stringify(store), 'utf8'); } catch {}
  }
});

export default { store };
