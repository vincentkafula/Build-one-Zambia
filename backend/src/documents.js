/**
 * Documents / Document Library Module
 */

import { kv } from './db.js';
import { randomUUID } from 'crypto';

function uid() { return `doc_${Date.now().toString(36)}_${randomUUID().slice(0, 6)}`; }
function getIndex() { return kv.get('boz:docs:index') || []; }
function setIndex(ids) { kv.set('boz:docs:index', ids); }

export function listDocuments(filters = {}) {
  let docs = getIndex()
    .map(id => kv.get(`boz:docs:doc:${id}`))
    .filter(Boolean)
    .filter(d => d.active !== false);

  if (filters.category) docs = docs.filter(d => d.category === filters.category);
  if (filters.published !== undefined) docs = docs.filter(d => d.published === filters.published);

  return docs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export function getDocument(id) { return kv.get(`boz:docs:doc:${id}`); }
export function getDocumentFile(id) { return kv.get(`boz:docs:file:${id}`); }

export function createDocument(input, author) {
  const id = uid();
  const now = new Date().toISOString();
  const doc = {
    id,
    title: (input.title || '').trim(),
    description: (input.description || '').trim(),
    category: input.category || 'general',
    fileType: input.fileType || 'pdf',
    fileName: input.fileName || '',
    fileSize: input.fileSize || 0,
    published: input.published !== false,
    hasFile: false,
    downloadCount: 0,
    author,
    active: true,
    createdAt: now,
    updatedAt: now,
  };

  kv.set(`boz:docs:doc:${id}`, doc);

  if (input.fileDataUrl) {
    kv.set(`boz:docs:file:${id}`, input.fileDataUrl);
    doc.hasFile = true;
    kv.set(`boz:docs:doc:${id}`, doc);
  }

  setIndex([id, ...getIndex()]);
  return doc;
}

export function updateDocument(id, input) {
  const d = getDocument(id);
  if (!d) return null;
  const updated = { ...d, ...input, updatedAt: new Date().toISOString() };
  kv.set(`boz:docs:doc:${id}`, updated);
  return updated;
}

export function incrementDownload(id) {
  const d = getDocument(id);
  if (!d) return;
  kv.set(`boz:docs:doc:${id}`, { ...d, downloadCount: (d.downloadCount || 0) + 1 });
}

export function deleteDocument(id) {
  const d = getDocument(id);
  if (!d) return false;
  kv.set(`boz:docs:doc:${id}`, { ...d, active: false });
  return true;
}
