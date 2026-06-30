/**
 * Registrations Module — member, cooperative, internship, and agent registrations
 */

import { kv } from './db.js';
import { randomUUID } from 'crypto';

function uid(prefix) { return `${prefix}_${Date.now().toString(36)}_${randomUUID().slice(0, 6)}`; }

// ─── Member Registration ────────────────────────────────────────────────────

function getMemberIndex() { return kv.get('boz:reg:member:index') || []; }

export function registerMember(input) {
  const id = uid('mem');
  const now = new Date().toISOString();
  const reg = { id, ...input, status: 'pending', createdAt: now, updatedAt: now };
  kv.set(`boz:reg:member:${id}`, reg);
  kv.set('boz:reg:member:index', [...getMemberIndex(), id]);
  return reg;
}

export function getMember(id) { return kv.get(`boz:reg:member:${id}`); }

export function getMemberByMembershipNumber(num) {
  return getMemberIndex()
    .map(id => kv.get(`boz:reg:member:${id}`))
    .filter(Boolean)
    .find(m => m.membershipNumber === num) || null;
}

export function listMembers(filters = {}) {
  let members = getMemberIndex().map(id => kv.get(`boz:reg:member:${id}`)).filter(Boolean);
  if (filters.status) members = members.filter(m => m.status === filters.status);
  if (filters.province) members = members.filter(m => m.province === filters.province);
  return members.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export function updateMemberStatus(id, status, note) {
  const m = getMember(id);
  if (!m) return null;
  const updated = { ...m, status, statusNote: note, updatedAt: new Date().toISOString() };
  kv.set(`boz:reg:member:${id}`, updated);
  return updated;
}

export function updateMember(id, patch) {
  const m = getMember(id);
  if (!m) return null;
  const updated = { ...m, ...patch, updatedAt: new Date().toISOString() };
  kv.set(`boz:reg:member:${id}`, updated);
  return updated;
}

export function getMemberStats() {
  const all = getMemberIndex().map(id => kv.get(`boz:reg:member:${id}`)).filter(Boolean);
  const byStatus = {};
  const byProvince = {};
  for (const m of all) {
    byStatus[m.status] = (byStatus[m.status] || 0) + 1;
    if (m.province) byProvince[m.province] = (byProvince[m.province] || 0) + 1;
  }
  return { total: all.length, byStatus, byProvince };
}

// ─── Internship Registration ────────────────────────────────────────────────

function getInternIndex() { return kv.get('boz:reg:intern:index') || []; }

export function registerIntern(input) {
  const id = uid('int');
  const now = new Date().toISOString();
  const reg = { id, ...input, status: 'pending', createdAt: now, updatedAt: now };
  kv.set(`boz:reg:intern:${id}`, reg);
  kv.set('boz:reg:intern:index', [...getInternIndex(), id]);
  return reg;
}

export function listInterns(filters = {}) {
  let interns = getInternIndex().map(id => kv.get(`boz:reg:intern:${id}`)).filter(Boolean);
  if (filters.status) interns = interns.filter(i => i.status === filters.status);
  return interns.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export function updateInternStatus(id, status) {
  const i = kv.get(`boz:reg:intern:${id}`);
  if (!i) return null;
  const updated = { ...i, status, updatedAt: new Date().toISOString() };
  kv.set(`boz:reg:intern:${id}`, updated);
  return updated;
}

// ─── Polling Agent Registration ─────────────────────────────────────────────

function getAgentIndex() { return kv.get('boz:reg:agent:index') || []; }

export function registerAgent(input) {
  const id = uid('agt');
  const now = new Date().toISOString();
  const reg = { id, ...input, status: 'pending', createdAt: now, updatedAt: now };
  kv.set(`boz:reg:agent:${id}`, reg);
  kv.set('boz:reg:agent:index', [...getAgentIndex(), id]);
  return reg;
}

export function listAgents(filters = {}) {
  let agents = getAgentIndex().map(id => kv.get(`boz:reg:agent:${id}`)).filter(Boolean);
  if (filters.status) agents = agents.filter(a => a.status === filters.status);
  return agents.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export function updateAgentStatus(id, status) {
  const a = kv.get(`boz:reg:agent:${id}`);
  if (!a) return null;
  const updated = { ...a, status, updatedAt: new Date().toISOString() };
  kv.set(`boz:reg:agent:${id}`, updated);
  return updated;
}

// ─── Cooperative Registration ───────────────────────────────────────────────

function getCoopIndex() { return kv.get('boz:reg:coop:index') || []; }

export function registerCoop(input) {
  const id = uid('coop');
  const now = new Date().toISOString();
  const reg = { id, ...input, status: 'pending', createdAt: now, updatedAt: now };
  kv.set(`boz:reg:coop:${id}`, reg);
  kv.set('boz:reg:coop:index', [...getCoopIndex(), id]);
  return reg;
}

export function listCoops(filters = {}) {
  return getCoopIndex().map(id => kv.get(`boz:reg:coop:${id}`)).filter(Boolean)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}
