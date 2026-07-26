/**
 * Voter Roll — lets a polling agent upload the official voters roll for
 * their polling station and validate individual voters against it.
 *
 * A voter can be looked up three ways:
 *  - Voter Card Number (the barcode number printed on the physical card,
 *    e.g. "90980571") — this is the primary lookup an agent uses at the
 *    polling station, since it's the one thing every voter has in hand.
 *  - NRC number
 *  - Name (partial match)
 *
 * Storage:
 *  - boz:voterroll:station:<stationId>   -> upload metadata (count, uploadedBy, uploadedAt, location chain)
 *  - boz:voterroll:records:<stationId>   -> array of cleaned voter records for that station
 *  - boz:voterroll:index                 -> global map of normalized NRC -> voter + station location
 *  - boz:voterroll:cardindex             -> global map of normalized voter card number -> voter + station location
 *    (both indexes are built across every station that has uploaded a roll, so an agent can look up a
 *    voter and be told the correct station even if that voter isn't on their own station's roll)
 */
import { kv } from './db.js';

const NRC_INDEX_KEY = 'boz:voterroll:index';
const CARD_INDEX_KEY = 'boz:voterroll:cardindex';

function normNrc(v) {
  return String(v || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
}
function normCard(v) {
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
      surname: r.surname ? String(r.surname).trim() : undefined,
      firstName: r.firstName ? String(r.firstName).trim() : undefined,
      gender: r.gender ? String(r.gender).trim() : undefined,
      dob: r.dob ? String(r.dob).trim() : undefined,
      residentialAddress: r.residentialAddress ? String(r.residentialAddress).trim() : undefined,
      voterId: r.voterId ? String(r.voterId).trim() : undefined,
      issueDate: r.issueDate ? String(r.issueDate).trim() : undefined,
      expiryDate: r.expiryDate ? String(r.expiryDate).trim() : undefined,
      pollingDistrict: r.pollingDistrict ? String(r.pollingDistrict).trim() : undefined,
    }))
    .filter(r => r.nrc && r.fullName);

  // Remove this station's previous entries from both global indexes before
  // merging in the new upload (handles re-uploads / corrections cleanly).
  const nrcIndex = kv.get(NRC_INDEX_KEY) || {};
  const cardIndex = kv.get(CARD_INDEX_KEY) || {};
  for (const key of Object.keys(nrcIndex)) {
    if (nrcIndex[key].pollingStationId === pollingStationId) delete nrcIndex[key];
  }
  for (const key of Object.keys(cardIndex)) {
    if (cardIndex[key].pollingStationId === pollingStationId) delete cardIndex[key];
  }

  for (const r of clean) {
    const entry = {
      nrcDisplay: r.nrcDisplay,
      fullName: r.fullName,
      surname: r.surname,
      firstName: r.firstName,
      gender: r.gender,
      dob: r.dob,
      residentialAddress: r.residentialAddress,
      voterId: r.voterId,
      issueDate: r.issueDate,
      expiryDate: r.expiryDate,
      pollingDistrict: r.pollingDistrict,
      pollingStationId, pollingStationName,
      wardId, wardName, constituencyId, constituencyName,
      districtId, districtName, provinceId, provinceName,
    };
    nrcIndex[r.nrc] = entry;
    const card = normCard(r.voterId);
    if (card) cardIndex[card] = entry;
  }
  kv.set(NRC_INDEX_KEY, nrcIndex);
  kv.set(CARD_INDEX_KEY, cardIndex);

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
  const nrcIndex = kv.get(NRC_INDEX_KEY) || {};
  const cardIndex = kv.get(CARD_INDEX_KEY) || {};
  for (const key of Object.keys(nrcIndex)) {
    if (nrcIndex[key].pollingStationId === pollingStationId) delete nrcIndex[key];
  }
  for (const key of Object.keys(cardIndex)) {
    if (cardIndex[key].pollingStationId === pollingStationId) delete cardIndex[key];
  }
  kv.set(NRC_INDEX_KEY, nrcIndex);
  kv.set(CARD_INDEX_KEY, cardIndex);
  kv.del(stationKey(pollingStationId));
  kv.del(recordsKey(pollingStationId));
  return true;
}

/**
 * Look a voter up by Voter Card Number (primary — this is what's printed on
 * the physical card an agent actually has in hand), by NRC (exact,
 * normalized), or by (partial) name. Searches the *global* index so an
 * agent can be told the correct polling station even when the voter isn't
 * on their own station's roll.
 */
export function searchVoter({ voterId, nrc, name, pollingStationId }) {
  if (voterId && normCard(voterId)) {
    const cardIndex = kv.get(CARD_INDEX_KEY) || {};
    const c = normCard(voterId);
    const entry = cardIndex[c];
    if (!entry) return { found: false, mode: 'card' };
    return {
      found: true,
      mode: 'card',
      registeredHere: !!(pollingStationId && entry.pollingStationId === pollingStationId),
      voter: { ...entry, voterId: entry.voterId || c },
    };
  }

  if (nrc && normNrc(nrc)) {
    const nrcIndex = kv.get(NRC_INDEX_KEY) || {};
    const n = normNrc(nrc);
    const entry = nrcIndex[n];
    if (!entry) return { found: false, mode: 'nrc' };
    return {
      found: true,
      mode: 'nrc',
      registeredHere: !!(pollingStationId && entry.pollingStationId === pollingStationId),
      voter: { ...entry, nrc: n },
    };
  }

  if (name && name.trim()) {
    const nrcIndex = kv.get(NRC_INDEX_KEY) || {};
    const q = name.trim().toLowerCase();
    const matches = Object.entries(nrcIndex)
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
