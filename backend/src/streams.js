/**
 * Live Streams Module
 */

import { kv } from './db.js';
import { randomUUID } from 'crypto';

function sid() { return `stream_${Date.now().toString(36)}_${randomUUID().slice(0, 6)}`; }
function cid() { return `cmt_${Date.now().toString(36)}_${randomUUID().slice(0, 6)}`; }

function getIndex() { return kv.get('boz:streams:index') || []; }
function setIndex(ids) { kv.set('boz:streams:index', ids); }

function getCommentIndex(streamId) { return kv.get(`boz:streams:comments-index:${streamId}`) || []; }
function setCommentIndex(streamId, ids) { kv.set(`boz:streams:comments-index:${streamId}`, ids); }

export function listStreams(filters = {}) {
  let streams = getIndex()
    .map(id => kv.get(`boz:streams:stream:${id}`))
    .filter(Boolean)
    .filter(s => s.active !== false);

  if (filters.status) streams = streams.filter(s => s.status === filters.status);
  if (filters.category) streams = streams.filter(s => s.category === filters.category);

  return streams.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export function getStream(id) { return kv.get(`boz:streams:stream:${id}`); }

export function createStream(input) {
  const id = sid();
  const now = new Date().toISOString();
  const stream = {
    id,
    title: (input.title || '').trim(),
    description: input.description || '',
    category: input.category || 'general',
    platform: input.platform || 'youtube', // youtube | facebook | custom
    embedUrl: input.embedUrl || '',
    thumbnailUrl: input.thumbnailUrl || '',
    status: input.status || 'scheduled', // scheduled | live | ended
    scheduledFor: input.scheduledFor || null,
    startedAt: null,
    endedAt: null,
    viewCount: 0,
    active: true,
    createdAt: now,
    updatedAt: now,
  };
  kv.set(`boz:streams:stream:${id}`, stream);
  setIndex([id, ...getIndex()]);
  return stream;
}

export function updateStream(id, input) {
  const s = getStream(id);
  if (!s) return null;
  const updated = { ...s, ...input, updatedAt: new Date().toISOString() };
  kv.set(`boz:streams:stream:${id}`, updated);
  return updated;
}

export function setStreamStatus(id, status) {
  const s = getStream(id);
  if (!s) return null;
  const patch = { status, updatedAt: new Date().toISOString() };
  if (status === 'live' && !s.startedAt) patch.startedAt = new Date().toISOString();
  if (status === 'ended') patch.endedAt = new Date().toISOString();
  const updated = { ...s, ...patch };
  kv.set(`boz:streams:stream:${id}`, updated);
  return updated;
}

export function deleteStream(id) {
  const s = getStream(id);
  if (!s) return false;
  kv.set(`boz:streams:stream:${id}`, { ...s, active: false });
  return true;
}

export function recordView(id) {
  const s = getStream(id);
  if (!s) return null;
  const updated = { ...s, viewCount: (s.viewCount || 0) + 1 };
  kv.set(`boz:streams:stream:${id}`, updated);
  return updated;
}

export function getStats() {
  const all = getIndex().map(id => kv.get(`boz:streams:stream:${id}`)).filter(Boolean);
  const active = all.filter(s => s.active !== false);
  const byStatus = {};
  for (const s of active) byStatus[s.status] = (byStatus[s.status] || 0) + 1;
  const totalViews = active.reduce((sum, s) => sum + (s.viewCount || 0), 0);
  return {
    stats: {
      total: active.length,
      byStatus,
      totalViews,
      live: active.filter(s => s.status === 'live').length,
    },
  };
}

// ─── Comments ────────────────────────────────────────────────────────────────

export function listComments(streamId) {
  return getCommentIndex(streamId)
    .map(id => kv.get(`boz:streams:comment:${id}`))
    .filter(Boolean)
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
}

export function postComment(streamId, name, message) {
  const id = cid();
  const comment = {
    id,
    streamId,
    name: (name || 'Anonymous').trim().slice(0, 60),
    message: (message || '').trim().slice(0, 500),
    createdAt: new Date().toISOString(),
  };
  kv.set(`boz:streams:comment:${id}`, comment);
  setCommentIndex(streamId, [...getCommentIndex(streamId), id]);
  return comment;
}

export function deleteComment(streamId, commentId) {
  kv.del(`boz:streams:comment:${commentId}`);
  setCommentIndex(streamId, getCommentIndex(streamId).filter(id => id !== commentId));
  return true;
}
