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
let pgConnectFailed = false;
// Writes that happen before Postgres finishes connecting used to be silently
// dropped from durable storage (kept only in memory + the ephemeral file).
// Queue them instead and flush once the connection is up, so nothing posted
// in the first second or two after a cold start gets lost on the next deploy.
const pendingPgWrites = new Map(); // key -> value | '__DELETE__'

async function initPostgres() {
  if (!process.env.DATABASE_URL) {
    console.warn('┌──────────────────────────────────────────────────────────────────┐');
    console.warn('│ [db] WARNING: DATABASE_URL is not set.                             │');
    console.warn('│ All admin-panel content (news, shop, documents, shadow cabinet,    │');
    console.warn('│ leadership, live streams, etc.) is being stored ONLY in an          │');
    console.warn('│ ephemeral file (' + DB_PATH.padEnd(51) + ')│');
    console.warn('│ This will be WIPED on the next deploy/restart. Add a PostgreSQL     │');
    console.warn('│ database in Railway and set DATABASE_URL on this service to fix.    │');
    console.warn('└──────────────────────────────────────────────────────────────────┘');
    return;
  }
  try {
    const { default: pg } = await import('pg');
    // Railway's internal database host (*.railway.internal) doesn't offer
    // SSL on that private connection at all — it's already isolated inside
    // Railway's network. Forcing ssl:{rejectUnauthorized:false} against a
    // server that doesn't support SSL makes the connection fail outright
    // (not just a warning), which silently sends everything back to the
    // ephemeral file store even though DATABASE_URL is correctly set. Only
    // use SSL for external hosts (public DATABASE_PUBLIC_URL, other
    // providers), never for *.railway.internal.
    const isInternalHost = /\.railway\.internal(:\d+)?/.test(process.env.DATABASE_URL);
    const client = new pg.Client({
      connectionString: process.env.DATABASE_URL,
      ssl: isInternalHost ? false : { rejectUnauthorized: false },
    });
    await client.connect();

    // Create table if not exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS boz_kv (
        key   TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    // Load all keys from DB into memory (Postgres is the source of truth —
    // overwrites anything with the same key loaded from the local file)
    const { rows } = await client.query('SELECT key, value FROM boz_kv');
    for (const row of rows) {
      try { store[row.key] = JSON.parse(row.value); } catch { store[row.key] = row.value; }
    }

    pgClient = client;
    pgReady  = true;
    console.log(`[db] PostgreSQL connected — ${rows.length} keys loaded. All writes are now persisted durably.`);

    // Flush anything that was written during the connection handshake
    if (pendingPgWrites.size > 0) {
      console.log(`[db] Flushing ${pendingPgWrites.size} write(s) queued during startup...`);
      for (const [key, value] of pendingPgWrites) {
        if (value === '__DELETE__') await pgDel(key);
        else await pgSet(key, value);
      }
      pendingPgWrites.clear();
    }
  } catch (err) {
    pgConnectFailed = true;
    console.error('┌──────────────────────────────────────────────────────────────────┐');
    console.error('│ [db] ERROR: DATABASE_URL is set but PostgreSQL connection failed.   │');
    console.error('│ Falling back to the ephemeral file store — data WILL be lost on     │');
    console.error('│ the next deploy/restart until this is fixed.                        │');
    console.error('│ Error: ' + String(err.message).slice(0, 60).padEnd(60) + '│');
    console.error('└──────────────────────────────────────────────────────────────────┘');
    console.error('[db] Full connection error:', err.message);
  }
}

// Start PG init (non-blocking)
initPostgres();

export function getPersistenceStatus() {
  return {
    databaseUrlConfigured: !!process.env.DATABASE_URL,
    connected: pgReady,
    connectFailed: pgConnectFailed,
    mode: pgReady ? 'postgresql' : 'ephemeral-file',
    dataDir: DATA_DIR,
    keyCount: Object.keys(store).length,
  };
}

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
  if (!pgReady) {
    if (process.env.DATABASE_URL && !pgConnectFailed) pendingPgWrites.set(key, value);
    return;
  }
  try {
    await pgClient.query(
      `INSERT INTO boz_kv (key, value, updated_at) VALUES ($1, $2, NOW())
       ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = NOW()`,
      [key, JSON.stringify(value)]
    );
  } catch (e) { console.warn('[db] pg set error:', e.message); }
}

async function pgDel(key) {
  if (!pgReady) {
    if (process.env.DATABASE_URL && !pgConnectFailed) pendingPgWrites.set(key, '__DELETE__');
    return;
  }
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
  delByPrefix(prefix) {
    const keys = Object.keys(store).filter(k => k.startsWith(prefix));
    for (const k of keys) {
      delete store[k];
      pgDel(k).catch(() => {});
    }
    if (keys.length) scheduleFlush();
    return keys.length;
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
