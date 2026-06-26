/**
 * Election Results Module — submit, verify, and aggregate polling results
 */

import { kv } from './db.js';
import { randomUUID } from 'crypto';

function uid() { return `res_${Date.now().toString(36)}_${randomUUID().slice(0, 6)}`; }

// ─── Submit ─────────────────────────────────────────────────────────────────

export function submitResult(data, submittedBy) {
  const id = uid();
  const now = new Date().toISOString();
  const result = {
    id,
    ...data,
    submittedBy,
    submittedAt: now,
    verified: false,
    status: 'pending',
    updatedAt: now,
  };
  kv.set(`boz:results:${data.category}:station:${data.pollingStationId}`, result);
  return result;
}

// ─── Get ─────────────────────────────────────────────────────────────────────

export function getStationResult(stationId, category) {
  return kv.get(`boz:results:${category}:station:${stationId}`);
}

export function verifyResult(stationId, category, verifiedBy) {
  const r = getStationResult(stationId, category);
  if (!r) return null;
  const updated = { ...r, verified: true, verifiedBy, verifiedAt: new Date().toISOString(), status: 'verified' };
  kv.set(`boz:results:${category}:station:${stationId}`, updated);
  return updated;
}

// ─── Aggregation ─────────────────────────────────────────────────────────────

export function getAggregated(category, level, id) {
  const prefix = `boz:results:${category}:station:`;
  const results = kv.getByPrefix(prefix);

  let filtered = results;
  if (level && id) {
    const fieldMap = {
      ward: 'wardId',
      constituency: 'constituencyId',
      district: 'districtId',
      province: 'provinceId',
    };
    const field = fieldMap[level];
    if (field) filtered = results.filter(r => r[field] === id);
  }

  if (!filtered.length) return { totalVotes: 0, totalRejected: 0, candidates: {}, stationsReporting: 0 };

  const aggregated = {
    totalVotes: 0,
    totalRejected: 0,
    registeredVoters: 0,
    candidates: {},
    stationsReporting: filtered.length,
    verifiedCount: filtered.filter(r => r.verified).length,
  };

  for (const r of filtered) {
    aggregated.totalVotes += r.totalVotes || 0;
    aggregated.totalRejected += r.totalRejected || 0;
    aggregated.registeredVoters += r.registeredVoters || 0;
    for (const cr of r.candidateResults || []) {
      if (!aggregated.candidates[cr.candidateId]) {
        aggregated.candidates[cr.candidateId] = { name: cr.name, party: cr.party, votes: 0 };
      }
      aggregated.candidates[cr.candidateId].votes += cr.votes || 0;
    }
  }

  return aggregated;
}

export function getSummary(category) {
  const prefix = `boz:results:${category}:station:`;
  const results = kv.getByPrefix(prefix);
  return {
    category,
    total: results.length,
    verified: results.filter(r => r.verified).length,
    pending: results.filter(r => !r.verified).length,
  };
}
