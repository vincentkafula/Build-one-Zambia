/**
 * Database layer — JSON file store with optional PostgreSQL persistence.
 *
 * If DATABASE_URL is set (Railway PostgreSQL), data is persisted permanently
 * in a single key-value table. Otherwise falls back to /tmp JSON file.
 *
 * Usage is identical either way — import { kv } and use kv.get/set/del.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const IS_RAILWAY = !!process.env.RAILWAY_ENVIRONMENT || !!process.env.RAILWAY_PROJECT_ID;
const DATA_DIR   = process.env.DATA_DIR || (IS_RAILWAY ? '/tmp/boz-data' : path.join(__dirname, '..', 'data'));
const DB_PATH    = path.join(DATA_DIR, 'kv.json');

try { fs.mkdirSync(DATA_DIR, { recursive: true }); } catch {}

// ── In-memory store (always used) ────────────────────────────────────────────
let store = {};
try {
  if (fs.existsSync(DB_PATH)) {
    store = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
    console.log('[db] Loaded', Object.keys(store).length, 'keys from disk');
  }
} catch { store = {}; }

// ── PostgreSQL (optional) ─────────────────────────────────────────────────────
let pgClient = null;
let pgReady  = false;

async function initPostgres() {
  if (!process.env.DATABASE_URL) return;
  try {
    const { default: pg } = await import('pg');
    const client = new pg.Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
    await client.connect();

    // Create table if not exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS boz_kv (
        key   TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    // Load all keys from DB into memory
    const { rows } = await client.query('SELECT key, value FROM boz_kv');
    for (const row of rows) {
      try { store[row.key] = JSON.parse(row.value); } catch { store[row.key] = row.value; }
    }

    pgClient = client;
    pgReady  = true;
    console.log('[db] PostgreSQL connected —', rows.length, 'keys loaded');
  } catch (err) {
    console.warn('[db] PostgreSQL unavailable, using file store:', err.message);
  }
}

// Start PG init (non-blocking)
initPostgres();

// ── Flush helpers ─────────────────────────────────────────────────────────────
let flushTimer = null;
function scheduleFlush() {
  if (flushTimer) return;
  flushTimer = setTimeout(() => {
    flushTimer = null;
    try { fs.writeFileSync(DB_PATH, JSON.stringify(store), 'utf8'); } catch {}
  }, 200);
}

async function pgSet(key, value) {
  if (!pgReady) return;
  try {
    await pgClient.query(
      `INSERT INTO boz_kv (key, value, updated_at) VALUES ($1, $2, NOW())
       ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = NOW()`,
      [key, JSON.stringify(value)]
    );
  } catch (e) { console.warn('[db] pg set error:', e.message); }
}

async function pgDel(key) {
  if (!pgReady) return;
  try { await pgClient.query('DELETE FROM boz_kv WHERE key = $1', [key]); } catch {}
}

// ── Public KV interface ───────────────────────────────────────────────────────
export const kv = {
  get(key) {
    const v = store[key];
    return v === undefined ? null : v;
  },
  set(key, value) {
    store[key] = value;
    scheduleFlush();
    pgSet(key, value).catch(() => {});
  },
  del(key) {
    delete store[key];
    scheduleFlush();
    pgDel(key).catch(() => {});
  },
  getByPrefix(prefix) {
    return Object.keys(store).filter(k => k.startsWith(prefix)).map(k => store[k]);
  },
  getKeysByPrefix(prefix) {
    return Object.keys(store).filter(k => k.startsWith(prefix));
  },
  mset(pairs) {
    for (const [k, v] of pairs) {
      store[k] = v;
      pgSet(k, v).catch(() => {});
    }
    scheduleFlush();
  },
};

process.on('exit', () => {
  if (flushTimer) {
    clearTimeout(flushTimer);
    try { fs.writeFileSync(DB_PATH, JSON.stringify(store), 'utf8'); } catch {}
  }
  if (pgClient) { try { pgClient.end(); } catch {} }
});

export default { store };
