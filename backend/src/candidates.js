/**
 * Candidates Module
 */

import { kv } from './db.js';
import { randomUUID } from 'crypto';

function uid() { return `cand_${Date.now().toString(36)}_${randomUUID().slice(0, 6)}`; }
function getIndex() { return kv.get('boz:candidates:index') || []; }
function setIndex(ids) { kv.set('boz:candidates:index', ids); }

export function listCandidates(filters = {}) {
  let candidates = getIndex()
    .map(id => kv.get(`boz:candidates:cand:${id}`))
    .filter(Boolean)
    .filter(c => c.active !== false);

  if (filters.electionType) candidates = candidates.filter(c => c.electionType === filters.electionType);
  if (filters.scopeId) candidates = candidates.filter(c => c.scopeId === filters.scopeId);
  if (filters.party) candidates = candidates.filter(c => c.party === filters.party);
  if (filters.gender) candidates = candidates.filter(c => c.gender === filters.gender);

  return candidates;
}

export function getCandidate(id) { return kv.get(`boz:candidates:cand:${id}`); }
export function getCandidatePhoto(id) { return kv.get(`boz:candidates:photo:${id}`); }

export function createCandidate(input, addedBy) {
  const id = uid();
  const now = new Date().toISOString();
  const candidate = {
    id,
    electionType: input.electionType,
    scopeId: input.scopeId,
    scopeName: input.scopeName,
    name: (input.name || '').trim(),
    title: input.title,
    party: input.party,
    partyFullName: input.partyFullName,
    partyColor: input.partyColor || '#888888',
    ballotNumber: input.ballotNumber,
    gender: input.gender,
    bio: input.bio,
    age: input.age,
    education: input.education,
    occupation: input.occupation,
    homeDistrict: input.homeDistrict,
    hasPhoto: false,
    addedBy,
    addedAt: now,
    updatedAt: now,
    active: true,
  };

  kv.set(`boz:candidates:cand:${id}`, candidate);

  if (input.photoDataUrl) {
    kv.set(`boz:candidates:photo:${id}`, input.photoDataUrl);
    candidate.hasPhoto = true;
    kv.set(`boz:candidates:cand:${id}`, candidate);
  }

  setIndex([...getIndex(), id]);
  return candidate;
}

export function updateCandidate(id, input) {
  const c = getCandidate(id);
  if (!c) return null;
  const updated = { ...c, ...input, updatedAt: new Date().toISOString() };
  kv.set(`boz:candidates:cand:${id}`, updated);
  return updated;
}

export function updateCandidatePhoto(id, dataUrl) {
  const c = getCandidate(id);
  if (!c) return null;
  kv.set(`boz:candidates:photo:${id}`, dataUrl);
  const updated = { ...c, hasPhoto: true, updatedAt: new Date().toISOString() };
  kv.set(`boz:candidates:cand:${id}`, updated);
  return updated;
}

export function deleteCandidate(id) {
  const c = getCandidate(id);
  if (!c) return false;
  kv.set(`boz:candidates:cand:${id}`, { ...c, active: false });
  return true;
}

export function getStats() {
  const all = getIndex().map(id => kv.get(`boz:candidates:cand:${id}`)).filter(Boolean);
  const active = all.filter(c => c.active !== false);
  const byType = {};
  const byParty = {};
  for (const c of active) {
    byType[c.electionType] = (byType[c.electionType] || 0) + 1;
    byParty[c.party] = (byParty[c.party] || 0) + 1;
  }
  const recent = active.filter(c => Date.now() - new Date(c.addedAt).getTime() < 7 * 86400_000).length;
  return {
    total: all.length,
    active: active.length,
    inactive: all.length - active.length,
    byElectionType: byType,
    byParty,
    recentlyAdded: recent,
  };
}
