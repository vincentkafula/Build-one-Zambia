/**
 * Registrations Module — member, cooperative, internship, and agent registrations
 */

import { kv } from './db.js';
import { randomUUID } from 'crypto';
import * as auth from './auth.js';

function uid(prefix) { return `${prefix}_${Date.now().toString(36)}_${randomUUID().slice(0, 6)}`; }

const TYPE_ROLE = { member: 'member', agent: 'polling_agent', cooperative: 'cooperative' };

// Applicant chose their own password + PIN on the registration form. Create
// the login account right away, but inactive — auth.loginUser already
// refuses inactive accounts, so nothing works until an admin approves the
// application and flips it on with auth.activateUser(). Plaintext
// password/pin are never written into the registration record itself;
// only their PBKDF2 hashes (via auth.js) are persisted.
export async function createPendingAccount(type, reg) {
  const { password, pin } = reg;
  if (!password) return reg; // legacy/back-compat: no self-chosen password submitted
  const name = reg.fullName || reg.name || ((reg.firstName || '') + ' ' + (reg.lastName || '')).trim() || 'user';
  const safeName = name.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 10) || 'user';
  const suffix = reg.id.replace(/[^a-z0-9]/g, '').slice(-4);
  const username = `${type}_${safeName}_${suffix}`;
  const role = TYPE_ROLE[type] || 'member';
  try {
    if (!auth.getUser(username)) {
      await auth.registerUser({
        username,
        role,
        name,
        email: reg.email || '',
        phone: reg.phone || reg.cellNumber || '',
        scopeId: reg.scopeId || reg.pollingStationId || '',
        scopeName: reg.scopeName || reg.pollingStation || reg.ward || reg.constituency || reg.district || reg.province || 'National',
        active: false,
        registrationId: reg.id,
        registrationType: type,
      }, password);
      if (pin) await auth.setPin(username, pin);
    }
  } catch (e) {
    console.error(`[registrations] failed to pre-create account for ${type}/${reg.id}:`, e.message);
    return reg;
  }
  // Strip plaintext credentials before the registration record itself gets
  // persisted — they now live only as hashes in auth.js's kv store.
  const { password: _p, pin: _pin, ...rest } = reg;
  return { ...rest, username, accountPending: true };
}

// ─── Member Registration ────────────────────────────────────────────────────

function getMemberIndex() { return kv.get('boz:reg:member:index') || []; }

const MEMBER_TIERS = ['basic', 'standard', 'gold', 'platinum'];

export async function registerMember(input) {
  const id = uid('mem');
  const now = new Date().toISOString();
  // The public registration form sends membershipType, not tier — normalize
  // so every stored record has a proper `tier` field regardless of which
  // field name the caller used (tier is what the admin UI and MemberTier
  // type actually read).
  const tier = MEMBER_TIERS.includes(input.tier) ? input.tier
    : MEMBER_TIERS.includes(input.membershipType) ? input.membershipType
    : 'standard';
  let reg = { ...input, id, tier, status: 'pending', createdAt: now, updatedAt: now };
  reg = await createPendingAccount('member', reg);
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

export function assignMembershipNumberIfNeeded(id) {
  const m = getMember(id);
  if (!m) return null;
  if (m.membershipNumber) return m; // already issued — don't reissue
  const year = new Date().getFullYear();
  const membershipNumber = `BOZ-${year}-${id.replace(/[^a-zA-Z0-9]/g, '').slice(-6).toUpperCase()}`;
  const updated = {
    ...m,
    membershipNumber,
    joinDate: m.joinDate || m.createdAt,
    certificateIssuedAt: new Date().toISOString(),
  };
  kv.set(`boz:reg:member:${id}`, updated);
  return updated;
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
  const byTier = Object.fromEntries(MEMBER_TIERS.map(t => [t, 0]));
  let active = 0;
  let adoptionGranted = 0;
  for (const m of all) {
    byStatus[m.status] = (byStatus[m.status] || 0) + 1;
    if (m.province) byProvince[m.province] = (byProvince[m.province] || 0) + 1;
    const tier = MEMBER_TIERS.includes(m.tier) ? m.tier : (MEMBER_TIERS.includes(m.membershipType) ? m.membershipType : 'basic');
    byTier[tier] = (byTier[tier] || 0) + 1;
    if (m.status === 'approved' || m.status === 'active') active++;
    if (m.adoptionGranted) adoptionGranted++;
  }
  return { total: all.length, active, adoptionGranted, byStatus, byTier, byProvince };
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

export function getIntern(id) { return kv.get(`boz:reg:intern:${id}`); }

export function updateInternStatus(id, status) {
  const i = kv.get(`boz:reg:intern:${id}`);
  if (!i) return null;
  const updated = { ...i, status, updatedAt: new Date().toISOString() };
  kv.set(`boz:reg:intern:${id}`, updated);
  return updated;
}

export function updateIntern(id, patch) {
  const i = kv.get(`boz:reg:intern:${id}`);
  if (!i) return null;
  const updated = { ...i, ...patch, updatedAt: new Date().toISOString() };
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

// A role+area combination (e.g. "polling_agent" at "Mukwas Primary School-12",
// or "ward_manager" at "Kanyama Ward") is taken once someone has a pending or
// approved application for it — rejected/withdrawn applications free it back
// up. This is what actually prevents two people applying for the same single
// position, independent of and in addition to the account-creation-time lock
// in auth.registerUser().
export function isRoleScopeTaken(role, scopeId) {
  if (!scopeId) return false;
  return getAgentIndex()
    .map(id => kv.get(`boz:reg:agent:${id}`))
    .filter(Boolean)
    .some(a => a.role === role && a.scopeId === scopeId && a.status !== 'rejected' && a.status !== 'withdrawn');
}

// Every scopeId already taken for a given role — used to grey out/mark
// already-applied-for options (e.g. polling stations within a ward) in the
// application form before the applicant even picks one.
export function takenScopeIdsForRole(role) {
  const taken = new Set();
  for (const id of getAgentIndex()) {
    const a = kv.get(`boz:reg:agent:${id}`);
    if (a && a.role === role && a.status !== 'rejected' && a.status !== 'withdrawn' && a.scopeId) taken.add(a.scopeId);
  }
  return taken;
}

const ROLE_CAPACITY_LIMITS = {
  super_national: 1, national: 10, provincial: 10, district: 116,
  constituency: 226, ward: 1858, agent: 13529,
};

export function getRoleCapacity() {
  const counts = {};
  for (const id of getAgentIndex()) {
    const a = kv.get(`boz:reg:agent:${id}`);
    if (a && a.status !== 'rejected' && a.status !== 'withdrawn') counts[a.role] = (counts[a.role] || 0) + 1;
  }
  const result = {};
  for (const [role, limit] of Object.entries(ROLE_CAPACITY_LIMITS)) {
    const current = counts[role] || 0;
    result[role] = { limit, current, remaining: Math.max(0, limit - current), full: current >= limit };
  }
  return result;
}

export function getAgent(id) { return kv.get(`boz:reg:agent:${id}`); }

export function updateAgent(id, patch) {
  const a = kv.get(`boz:reg:agent:${id}`);
  if (!a) return null;
  const updated = { ...a, ...patch, updatedAt: new Date().toISOString() };
  kv.set(`boz:reg:agent:${id}`, updated);
  return updated;
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

export function deleteAgent(id) {
  const a = kv.get(`boz:reg:agent:${id}`);
  if (!a) return false;
  kv.del(`boz:reg:agent:${id}`);
  kv.set('boz:reg:agent:index', getAgentIndex().filter(x => x !== id));
  return true;
}

// ─── Cooperative Registration ───────────────────────────────────────────────

function getCoopIndex() { return kv.get('boz:reg:coop:index') || []; }

export async function registerCoop(input) {
  const id = uid('coop');
  const now = new Date().toISOString();
  let reg = { id, ...input, status: 'pending', createdAt: now, updatedAt: now };
  reg = await createPendingAccount('cooperative', reg);
  kv.set(`boz:reg:coop:${id}`, reg);
  kv.set('boz:reg:coop:index', [...getCoopIndex(), id]);
  return reg;
}

export function listCoops(filters = {}) {
  let coops = getCoopIndex().map(id => kv.get(`boz:reg:coop:${id}`)).filter(Boolean);
  if (filters.status) coops = coops.filter(c => c.status === filters.status);
  return coops.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export function getCoop(id) { return kv.get(`boz:reg:coop:${id}`); }

export function updateCoopStatus(id, status, note) {
  const c = kv.get(`boz:reg:coop:${id}`);
  if (!c) return null;
  const updated = { ...c, status, statusNote: note, updatedAt: new Date().toISOString() };
  kv.set(`boz:reg:coop:${id}`, updated);
  return updated;
}

export function updateCoop(id, patch) {
  const c = kv.get(`boz:reg:coop:${id}`);
  if (!c) return null;
  const updated = { ...c, ...patch, updatedAt: new Date().toISOString() };
  kv.set(`boz:reg:coop:${id}`, updated);
  return updated;
}
