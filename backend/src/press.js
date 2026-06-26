/**
 * Press Statements Module
 */

import { kv } from './db.js';
import { randomUUID } from 'crypto';

function uid() { return `press_${Date.now().toString(36)}_${randomUUID().slice(0, 6)}`; }
function getIndex() { return kv.get('boz:press:index') || []; }
function setIndex(ids) { kv.set('boz:press:index', ids); }

export function listStatements(filters = {}) {
  let statements = getIndex()
    .map(id => kv.get(`boz:press:stmt:${id}`))
    .filter(Boolean);

  if (!filters.includeUnpublished) {
    statements = statements.filter(s => s.published !== false);
  }

  return statements.sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt));
}

export function getStatement(id) { return kv.get(`boz:press:stmt:${id}`); }
export function getStatementFile(id) { return kv.get(`boz:press:file:${id}`); }

export function createStatement(input, author) {
  const id = uid();
  const now = new Date().toISOString();
  const stmt = {
    id,
    title: (input.title || '').trim(),
    summary: (input.summary || '').trim(),
    date: input.date || now.slice(0, 10),
    year: input.year || new Date().getFullYear(),
    category: input.category || 'general',
    published: input.published !== false,
    hasFile: false,
    fileUrl: input.fileUrl || '',
    author,
    createdAt: now,
    updatedAt: now,
  };

  kv.set(`boz:press:stmt:${id}`, stmt);

  if (input.fileDataUrl) {
    kv.set(`boz:press:file:${id}`, input.fileDataUrl);
    stmt.hasFile = true;
    kv.set(`boz:press:stmt:${id}`, stmt);
  }

  setIndex([id, ...getIndex()]);
  return stmt;
}

export function updateStatement(id, input) {
  const s = getStatement(id);
  if (!s) return null;
  const updated = { ...s, ...input, updatedAt: new Date().toISOString() };
  kv.set(`boz:press:stmt:${id}`, updated);
  return updated;
}

export function deleteStatement(id) {
  kv.del(`boz:press:stmt:${id}`);
  kv.del(`boz:press:file:${id}`);
  setIndex(getIndex().filter(i => i !== id));
}

export function getYears() {
  return [...new Set(
    getIndex()
      .map(id => kv.get(`boz:press:stmt:${id}`))
      .filter(Boolean)
      .filter(s => s.published !== false)
      .map(s => s.year || new Date(s.date || s.createdAt).getFullYear())
  )].sort((a, b) => b - a);
}
