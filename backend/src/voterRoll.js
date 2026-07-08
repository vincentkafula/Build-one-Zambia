/**
 * Voter Roll — lets a polling agent upload the official voters roll for
 * their polling station and validate individual voters against it.
 *
 * Storage:
 *  - boz:voterroll:station:<stationId>  -> upload metadata (count, uploadedBy, uploadedAt, location chain)
 *  - boz:voterroll:records:<stationId>  -> array of cleaned voter records for that station
 *  - boz:voterroll:index                -> global map of normalized NRC -> voter + station location
 *                                          (built across every station that has uploaded a roll, so an
 *                                          agent can look up a voter and be told the correct station even
 *                                          if that voter isn't on their own station's roll)
 */
import { kv } from './db.js';

const INDEX_KEY = 'boz:voterroll:index';

function normNrc(v) {
  return String(v || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
}

function stationKey(id) { return `boz:voterroll:station:${id}`; }
function recordsKey(id) { return `boz:voterroll:records:${id}`; }

export function saveStationRoll({
  pollingStationId, pollingStationName,
  wardId, wardName, constituencyId, constituencyName,
  districtId, districtName, provinceId, provinceName,
  records, uploadedBy,
}) {
  const clean = (records || [])
    .map(r => ({
      nrc: normNrc(r.nrc),
      nrcDisplay: String(r.nrc || '').trim(),
      fullName: String(r.fullName || '').trim(),
      gender: r.gender ? String(r.gender).trim() : undefined,
      voterId: r.voterId ? String(r.voterId).trim() : undefined,
    }))
    .filter(r => r.nrc && r.fullName);

  // Remove this station's previous entries from the global index before
  // merging in the new upload (handles re-uploads / corrections cleanly).
  const index = kv.get(INDEX_KEY) || {};
  for (const key of Object.keys(index)) {
    if (index[key].pollingStationId === pollingStationId) delete index[key];
  }
  for (const r of clean) {
    index[r.nrc] = {
      nrcDisplay: r.nrcDisplay,
      fullName: r.fullName,
      gender: r.gender,
      voterId: r.voterId,
      pollingStationId, pollingStationName,
      wardId, wardName, constituencyId, constituencyName,
      districtId, districtName, provinceId, provinceName,
    };
  }
  kv.set(INDEX_KEY, index);

  const stationRecord = {
    pollingStationId, pollingStationName,
    wardId, wardName, constituencyId, constituencyName,
    districtId, districtName, provinceId, provinceName,
    count: clean.length,
    uploadedBy: uploadedBy || '',
    uploadedAt: new Date().toISOString(),
  };
  kv.set(stationKey(pollingStationId), stationRecord);
  kv.set(recordsKey(pollingStationId), clean);

  return stationRecord;
}

export function getStationRollStatus(pollingStationId) {
  return kv.get(stationKey(pollingStationId)) || null;
}

export function deleteStationRoll(pollingStationId) {
  const index = kv.get(INDEX_KEY) || {};
  for (const key of Object.keys(index)) {
    if (index[key].pollingStationId === pollingStationId) delete index[key];
  }
  kv.set(INDEX_KEY, index);
  kv.del(stationKey(pollingStationId));
  kv.del(recordsKey(pollingStationId));
  return true;
}

/**
 * Look a voter up either by NRC (exact, normalized) or by (partial) name.
 * Searches the *global* index so an agent can be told the correct polling
 * station even when the voter isn't on their own station's roll.
 */
export function searchVoter({ nrc, name, pollingStationId }) {
  const index = kv.get(INDEX_KEY) || {};

  if (nrc && normNrc(nrc)) {
    const n = normNrc(nrc);
    const entry = index[n];
    if (!entry) return { found: false, mode: 'nrc' };
    return {
      found: true,
      mode: 'nrc',
      registeredHere: !!(pollingStationId && entry.pollingStationId === pollingStationId),
      voter: { ...entry, nrc: n },
    };
  }

  if (name && name.trim()) {
    const q = name.trim().toLowerCase();
    const matches = Object.entries(index)
      .filter(([, v]) => v.fullName && v.fullName.toLowerCase().includes(q))
      .slice(0, 25)
      .map(([nrcKey, v]) => ({
        ...v,
        nrc: nrcKey,
        registeredHere: !!(pollingStationId && v.pollingStationId === pollingStationId),
      }));
    return { found: matches.length > 0, mode: 'name', matches };
  }

  return { found: false, mode: 'none' };
}
