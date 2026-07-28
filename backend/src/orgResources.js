import { randomUUID } from 'node:crypto';
import { kv } from './db.js';

/**
 * Real backing data for the Cooperative/Chamber/Internship dashboard
 * sections that used to be hardcoded mock arrays (EQUIPMENT_APPROVED,
 * EQUIPMENT_APPLIED, EXPORTS, INVESTORS, INTERN). Every record here is
 * genuinely tied to a specific cooperative/chamber via its registration
 * id, not a fixed demo constant.
 */

function uid(prefix) { return `${prefix}_${Date.now().toString(36)}_${randomUUID().slice(0, 6)}`; }

// ─── Equipment Applications ──────────────────────────────────────────────
// Cooperative applies for equipment (self-service); admin approves/rejects.
// "Equipment Approved" and "Equipment Applied" on the dashboard are both
// just this same list filtered by status.
function getEquipmentIndex() { return kv.get('boz:equipment:index') || []; }

export function applyForEquipment(cooperativeId, cooperativeName, input) {
  const id = uid('eq');
  const now = new Date().toISOString();
  const record = {
    id, cooperativeId, cooperativeName,
    name: input.name, category: input.category, condition: input.condition || 'Requested',
    justification: input.justification || '',
    status: 'pending', // pending | under_review | approved | rejected
    appliedDate: now, approvedDate: null, assignedBy: null, reviewNotes: null,
  };
  kv.set(`boz:equipment:${id}`, record);
  kv.set('boz:equipment:index', [id, ...getEquipmentIndex()]);
  return record;
}

export function listEquipmentForCoop(cooperativeId) {
  return getEquipmentIndex().map(id => kv.get(`boz:equipment:${id}`)).filter(Boolean)
    .filter(r => r.cooperativeId === cooperativeId)
    .sort((a, b) => new Date(b.appliedDate) - new Date(a.appliedDate));
}

export function listAllEquipment(filters = {}) {
  let list = getEquipmentIndex().map(id => kv.get(`boz:equipment:${id}`)).filter(Boolean);
  if (filters.status) list = list.filter(r => r.status === filters.status);
  return list.sort((a, b) => new Date(b.appliedDate) - new Date(a.appliedDate));
}

export function updateEquipmentStatus(id, status, { assignedBy, reviewNotes } = {}) {
  const rec = kv.get(`boz:equipment:${id}`);
  if (!rec) return null;
  const now = new Date().toISOString();
  const updated = {
    ...rec, status, reviewNotes: reviewNotes ?? rec.reviewNotes,
    assignedBy: status === 'approved' ? (assignedBy || rec.assignedBy) : rec.assignedBy,
    approvedDate: status === 'approved' ? now : rec.approvedDate,
  };
  kv.set(`boz:equipment:${id}`, updated);
  return updated;
}

// ─── Export Records ──────────────────────────────────────────────────────
// Cooperative logs its own export shipments (self-service ledger, not
// admin-gated — this is the cooperative's own record-keeping).
function getExportIndex() { return kv.get('boz:exports:index') || []; }

export function logExport(cooperativeId, cooperativeName, input) {
  const id = uid('exp');
  const now = new Date().toISOString();
  const record = {
    id, cooperativeId, cooperativeName,
    product: input.product, destination: input.destination, quantity: input.quantity,
    value: input.value, date: input.date || now, status: input.status || 'Processing',
    createdAt: now, updatedAt: now,
  };
  kv.set(`boz:exports:${id}`, record);
  kv.set('boz:exports:index', [id, ...getExportIndex()]);
  return record;
}

export function updateExport(id, cooperativeId, patch) {
  const rec = kv.get(`boz:exports:${id}`);
  if (!rec || rec.cooperativeId !== cooperativeId) return null;
  const updated = { ...rec, ...patch, id: rec.id, cooperativeId: rec.cooperativeId, updatedAt: new Date().toISOString() };
  kv.set(`boz:exports:${id}`, updated);
  return updated;
}

export function listExportsForCoop(cooperativeId) {
  return getExportIndex().map(id => kv.get(`boz:exports:${id}`)).filter(Boolean)
    .filter(r => r.cooperativeId === cooperativeId)
    .sort((a, b) => new Date(b.date) - new Date(a.date));
}

// ─── Investor Directory ──────────────────────────────────────────────────
// Admin-managed (BOZ's investor-relations team maintains real investor
// contacts and links each one to whichever cooperative/chamber/ward
// they're actually interested in) — a cooperative or chamber can't
// invent its own investor leads, only see the ones BOZ has connected
// them with. linkedTo: { type: 'cooperative'|'chamber', id } | { wardId }
// so an investor can be scoped to one org or to a whole ward.
function getInvestorIndex() { return kv.get('boz:investors:index') || []; }

export function createInvestor(input, addedBy) {
  const id = uid('invr');
  const now = new Date().toISOString();
  const record = {
    id,
    name: input.name, country: input.country, sector: input.sector,
    contactPerson: input.contactPerson, phone: input.phone, email: input.email,
    investmentInterest: input.investmentInterest, status: input.status || 'Interested',
    linkedType: input.linkedType || null, // 'cooperative' | 'chamber' | null
    linkedId: input.linkedId || null,
    wardId: input.wardId || null,
    addedBy, createdAt: now, updatedAt: now,
  };
  kv.set(`boz:investors:${id}`, record);
  kv.set('boz:investors:index', [id, ...getInvestorIndex()]);
  return record;
}

export function updateInvestor(id, patch) {
  const rec = kv.get(`boz:investors:${id}`);
  if (!rec) return null;
  const updated = { ...rec, ...patch, id: rec.id, updatedAt: new Date().toISOString() };
  kv.set(`boz:investors:${id}`, updated);
  return updated;
}

export function deleteInvestor(id) {
  kv.del(`boz:investors:${id}`);
  kv.set('boz:investors:index', getInvestorIndex().filter(i => i !== id));
}

export function listAllInvestors() {
  return getInvestorIndex().map(id => kv.get(`boz:investors:${id}`)).filter(Boolean)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export function listInvestorsFor({ type, id, wardId }) {
  return listAllInvestors().filter(inv =>
    (inv.linkedType === type && inv.linkedId === id) ||
    (wardId && inv.wardId === wardId)
  );
}

// ─── Ward Intern Coordinator ─────────────────────────────────────────────
// One assigned BOZ contact per ward — admin-managed. Chamber dashboards
// show whichever coordinator is assigned to their own ward.
export function setWardCoordinator(wardId, input) {
  const record = {
    wardId, name: input.name, title: input.title || 'BOZ Ward Intern Coordinator',
    phone: input.phone, email: input.email, availableHours: input.availableHours,
    note: input.note, updatedAt: new Date().toISOString(),
  };
  kv.set(`boz:ward-coordinator:${wardId}`, record);
  return record;
}

export function getWardCoordinator(wardId) {
  return kv.get(`boz:ward-coordinator:${wardId}`);
}
