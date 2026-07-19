/**
 * Authoritative Voter Register — Registered Voter Totals
 * ─────────────────────────────────────────────────────────────────────────
 * Source of truth: ECZ "Registered Voters per Polling Station 2026" report
 * (rptPDListing20260508.md), parsed once at build time into
 * data/voterRegisterLevels.json (province/district/constituency/ward totals,
 * ~640KB) and data/voterRegisterStations.json (13,529 individual polling
 * station rows, ~5MB, loaded lazily only when station-level detail is asked
 * for).
 *
 * WHY THIS MODULE EXISTS
 * Previously "registered voters" for a ward/constituency/etc. was computed
 * by summing whatever number each polling agent typed into their own result
 * submission (see results.js buildResult() / elections.getAggregated()).
 * That number is only as good as each agent's manual entry, so it drifted
 * from the real ECZ-published figures. This module instead reads the
 * figures straight from ECZ's own published totals for every level of the
 * hierarchy, so it is correct regardless of what has or hasn't been
 * submitted yet.
 *
 * Every number below reconciles exactly against the report's own summary
 * page: 10 provinces, 116 districts, 226 constituencies, 1,858 wards,
 * 13,529 polling-station rows, 8,786,300 registered voters nationally
 * (4,120,869 female / 4,665,431 male).
 */
import fs from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const LEVELS_PATH = path.join(__dirname, 'data', 'voterRegisterLevels.json');
const STATIONS_PATH = path.join(__dirname, 'data', 'voterRegisterStations.json');

let levels = null;      // { national, provinces[], districts[], constituencies[], wards[] }
let stations = null;    // lazy-loaded — 13,529 rows, only needed for polling-level detail
let indexes = null;     // level -> Map(id -> record)

function loadLevels() {
  if (levels) return levels;
  levels = JSON.parse(fs.readFileSync(LEVELS_PATH, 'utf-8'));
  indexes = {
    province: new Map(levels.provinces.map(r => [r.id, r])),
    district: new Map(levels.districts.map(r => [r.id, r])),
    constituency: new Map(levels.constituencies.map(r => [r.id, r])),
    ward: new Map(levels.wards.map(r => [r.id, r])),
  };
  return levels;
}

function loadStations() {
  if (stations) return stations;
  stations = JSON.parse(fs.readFileSync(STATIONS_PATH, 'utf-8'));
  return stations;
}

// ─── National ────────────────────────────────────────────────────────────

export function getNational() {
  const l = loadLevels();
  return l.national;
}

// ─── Single record by level + id ────────────────────────────────────────

const LEVEL_ORDER = ['ward', 'constituency', 'district', 'province'];

export function getByLevel(level, id) {
  loadLevels();
  if (level === 'national') return { level: 'national', ...getNational() };
  const idx = indexes[level];
  if (!idx) return null;
  const rec = idx.get(id);
  return rec ? { level, ...rec } : null;
}

// ─── Children of a given node (for building drill-down UIs) ────────────

export function getChildren(level, id) {
  loadLevels();
  const childMap = { province: 'district', district: 'constituency', constituency: 'ward' };
  const childLevel = level === 'national' ? 'province' : childMap[level];
  if (!childLevel) return [];
  const parentField = { district: 'provinceId', constituency: 'districtId', ward: 'constituencyId' }[childLevel];
  const list = levels[`${childLevel}s`];
  if (level === 'national') return list;
  return list.filter(r => r[parentField] === id);
}

// ─── Polling-station level (lazy) ───────────────────────────────────────

export function getStationsForWard(wardId) {
  return loadStations().filter(s => s.wardId === wardId);
}

export function getStation(code) {
  return loadStations().find(s => s.code === code) || null;
}

// ─── Role-based lookup ───────────────────────────────────────────────────
// Maps an authenticated user's role/scope onto the correct authoritative
// total, per the access table:
//   polling      -> their own polling station          (no aggregation)
//   ward         -> their ward                          (from polling stations within it)
//   constituency -> their constituency                  (from wards within it)
//   district     -> their district                      (from constituencies within it)
//   provincial   -> their province                       (from districts within it)
//   national     -> the whole country                    (from provinces)
//
// Expects the user object shape already used across the app:
//   { role, scopeType, scopeId, pollingStationId, pollingStationName }

const ROLE_TO_LEVEL = {
  polling_agent: 'polling',
  ward_manager: 'ward',
  constituency_manager: 'constituency',
  district_manager: 'district',
  provincial_manager: 'province',
  national_manager: 'national',
  admin: 'national',
  super_admin: 'national',
};

export function getTotalsForUser(user) {
  const level = user?.scopeType && ['polling', 'ward', 'constituency', 'district', 'province', 'national'].includes(user.scopeType)
    ? user.scopeType
    : (ROLE_TO_LEVEL[user?.role] || null);

  if (!level) return { error: 'No scope or role on this user — cannot determine which totals to show.' };

  if (level === 'national') return { level: 'national', ...getNational() };

  if (level === 'polling') {
    const code = user.pollingStationId;
    if (!code) return { level: 'polling', registeredVoters: 0, note: 'No polling station code linked to this account yet.' };
    const rec = getStation(code);
    return rec ? { level: 'polling', ...rec } : { level: 'polling', registeredVoters: 0, note: 'Polling station code not found in the ECZ register.' };
  }

  const id = user.scopeId;
  if (!id) return { level, registeredVoters: 0, note: `No ${level} assigned to this account yet.` };
  const rec = getByLevel(level, id);
  return rec || { level, id, registeredVoters: 0, note: `${level} id "${id}" not found in the ECZ register.` };
}

// ─── Search (used to help admins wire up scopeId values when creating users) ─

export function search(level, query) {
  loadLevels();
  const list = level === 'national' ? [] : levels[`${level}s`];
  if (!list) return [];
  const q = (query || '').trim().toLowerCase();
  if (!q) return list.slice(0, 50);
  return list.filter(r => r.name.toLowerCase().includes(q)).slice(0, 50);
}
