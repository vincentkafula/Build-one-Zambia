/**
 * One-off migration: backfill the `rejectedBallots` field on existing
 * data-entry submissions and boz:results:* station records.
 *
 * Background: the /data-entry/result endpoint used to save the rejected
 * ballot count only under `totalRejected` / `totalRejectedBallots`, but the
 * admin Approval Queue UI reads `rejectedBallots`. Any submission created
 * before the fix has no `rejectedBallots` field, so it displays 0.
 *
 * This script is safe to run multiple times (it's idempotent) and only
 * fills in `rejectedBallots` when it's missing, using whichever of
 * totalRejected / totalRejectedBallots already has the real number.
 *
 * USAGE
 * -----
 * Run this with the exact same environment the backend uses, so it reads
 * from the same store:
 *
 *   # Local file-based store:
 *   cd backend && node scripts/migrate-rejected-ballots.js
 *
 *   # Railway / Postgres-backed store:
 *   railway run node scripts/migrate-rejected-ballots.js
 *   (or paste the DATABASE_URL env var into your shell before running)
 *
 * It prints a summary of how many records were fixed and exits.
 */

import { kv } from '../src/db.js';

function backfillRejectedBallots(record) {
  if (record == null || typeof record !== 'object') return { record, changed: false };
  if (record.rejectedBallots !== undefined && record.rejectedBallots !== null) {
    return { record, changed: false };
  }
  const fallback = record.totalRejected ?? record.totalRejectedBallots ?? 0;
  return { record: { ...record, rejectedBallots: Number(fallback) || 0 }, changed: true };
}

function migrateSubmissionsList() {
  const submissions = kv.get('data-entry:submissions') || [];
  let changedCount = 0;

  const updated = submissions.map((s) => {
    const { record, changed } = backfillRejectedBallots(s);
    if (changed) changedCount++;
    return record;
  });

  if (changedCount > 0) {
    kv.set('data-entry:submissions', updated);
  }

  console.log(`[migrate] data-entry:submissions — ${changedCount}/${submissions.length} records backfilled`);
  return changedCount;
}

function migrateResultsStationRecords() {
  const prefixes = ['boz:results:presidential:station:', 'boz:results:parliamentary:station:', 'boz:results:mayoral:station:', 'boz:results:councillor:station:'];
  let changedCount = 0;
  let total = 0;

  for (const prefix of prefixes) {
    const keys = kv.getKeysByPrefix(prefix);
    for (const key of keys) {
      total++;
      const rec = kv.get(key);
      const { record, changed } = backfillRejectedBallots(rec);
      if (changed) {
        kv.set(key, record);
        changedCount++;
      }
    }
  }

  console.log(`[migrate] boz:results:*:station:* — ${changedCount}/${total} records backfilled`);
  return changedCount;
}

async function main() {
  console.log('[migrate] Starting rejectedBallots backfill...');
  const a = migrateSubmissionsList();
  const b = migrateResultsStationRecords();
  console.log(`[migrate] Done. Total records fixed: ${a + b}`);

  // db.js flushes to disk/Postgres on a 200ms debounce timer; give it a
  // moment to finish writing before the process exits.
  await new Promise((resolve) => setTimeout(resolve, 1000));
  process.exit(0);
}

main().catch((err) => {
  console.error('[migrate] Failed:', err);
  process.exit(1);
});
