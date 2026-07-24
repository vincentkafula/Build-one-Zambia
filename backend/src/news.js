/**
 * News Module — blog posts and news articles
 */

import { kv } from './db.js';
import { randomUUID } from 'crypto';

function uid() { return `post_${Date.now().toString(36)}_${randomUUID().slice(0, 6)}`; }
function getIndex() { return kv.get('boz:news:index') || []; }
function setIndex(ids) { kv.set('boz:news:index', ids); }

// Derives the 3-state status the admin UI expects (draft/published/archived)
// from the underlying published/archived booleans, so every post returned
// by this module always has a `status` field to key off.
function withStatus(post) {
  const status = post.archived ? 'archived' : post.published ? 'published' : 'draft';
  return { ...post, status };
}

export function listPosts(filters = {}) {
  const index = getIndex();
  let posts = index
    .map(id => kv.get(`boz:news:post:${id}`))
    .filter(Boolean)
    .map(withStatus);

  if (filters.status && filters.status !== 'all') {
    posts = posts.filter(p => p.status === filters.status);
  } else if (filters.status === undefined) {
    // No status requested at all (the public site's default) — only ever
    // show published posts. 'all' is opt-in and must be explicitly requested
    // by an authenticated admin (enforced by the route handler, not here).
    posts = posts.filter(p => p.status === 'published');
  }
  if (filters.category) posts = posts.filter(p => p.category === filters.category);

  return posts
    .sort((a, b) => new Date(b.publishedAt || b.createdAt) - new Date(a.publishedAt || a.createdAt))
    .slice(0, filters.limit || 100);
}

export function getPost(id) {
  const post = kv.get(`boz:news:post:${id}`);
  return post ? withStatus(post) : null;
}
export function getPostImage(id) { return kv.get(`boz:news:image:${id}`); }

export function createPost(input, author) {
  const id = uid();
  const now = new Date().toISOString();
  const post = {
    id,
    title: (input.title || '').trim(),
    summary: (input.summary || '').trim(),
    content: (input.content || '').trim(),
    category: input.category || 'general',
    tags: input.tags || [],
    published: false,
    archived: false,
    featured: !!input.featured,
    publishedAt: null,
    author,
    imageUrl: input.imageUrl || '',
    hasCustomImage: false,
    createdAt: now,
    updatedAt: now,
  };

  kv.set(`boz:news:post:${id}`, post);

  if (input.imageDataUrl) {
    kv.set(`boz:news:image:${id}`, input.imageDataUrl);
    post.hasCustomImage = true;
    kv.set(`boz:news:post:${id}`, post);
  }

  setIndex([id, ...getIndex()]);
  return withStatus(post);
}

export function updatePost(id, input) {
  const post = kv.get(`boz:news:post:${id}`);
  if (!post) return null;
  const updated = { ...post, ...input, updatedAt: new Date().toISOString() };
  kv.set(`boz:news:post:${id}`, updated);
  return withStatus(updated);
}

export function publishPost(id) {
  const post = kv.get(`boz:news:post:${id}`);
  if (!post) return null;
  const updated = { ...post, published: true, archived: false, publishedAt: post.publishedAt || new Date().toISOString(), updatedAt: new Date().toISOString() };
  kv.set(`boz:news:post:${id}`, updated);
  return withStatus(updated);
}

export function unpublishPost(id) {
  const post = kv.get(`boz:news:post:${id}`);
  if (!post) return null;
  const updated = { ...post, published: false, updatedAt: new Date().toISOString() };
  kv.set(`boz:news:post:${id}`, updated);
  return withStatus(updated);
}

// Soft archive — reversible. Keeps the post (and its id in the index) so it
// can be restored; just hides it from every public/default listing.
export function archivePost(id) {
  const post = kv.get(`boz:news:post:${id}`);
  if (!post) return null;
  const updated = { ...post, archived: true, published: false, updatedAt: new Date().toISOString() };
  kv.set(`boz:news:post:${id}`, updated);
  return withStatus(updated);
}

export function restorePost(id) {
  const post = kv.get(`boz:news:post:${id}`);
  if (!post) return null;
  const updated = { ...post, archived: false, updatedAt: new Date().toISOString() };
  kv.set(`boz:news:post:${id}`, updated);
  return withStatus(updated);
}

// Permanent, irreversible delete — distinct from archivePost. Only ever
// wired to the super_admin-only /hard route.
export function hardDeletePost(id) {
  kv.del(`boz:news:post:${id}`);
  kv.del(`boz:news:image:${id}`);
  setIndex(getIndex().filter(i => i !== id));
}

export function getStats() {
  const posts = getIndex().map(id => kv.get(`boz:news:post:${id}`)).filter(Boolean).map(withStatus);
  const byCategory = {};
  for (const p of posts) byCategory[p.category] = (byCategory[p.category] || 0) + 1;
  return {
    total: posts.length,
    published: posts.filter(p => p.status === 'published').length,
    drafts: posts.filter(p => p.status === 'draft').length,
    archived: posts.filter(p => p.status === 'archived').length,
    featured: posts.filter(p => p.featured).length,
    byCategory,
  };
}
