/**
 * News Module — blog posts and news articles
 */

import { kv } from './db.js';
import { randomUUID } from 'crypto';

function uid() { return `post_${Date.now().toString(36)}_${randomUUID().slice(0, 6)}`; }
function getIndex() { return kv.get('boz:news:index') || []; }
function setIndex(ids) { kv.set('boz:news:index', ids); }

export function listPosts(filters = {}) {
  const index = getIndex();
  let posts = index
    .map(id => kv.get(`boz:news:post:${id}`))
    .filter(Boolean);

  if (filters.published !== undefined) {
    posts = posts.filter(p => p.published === filters.published);
  }
  if (filters.category) posts = posts.filter(p => p.category === filters.category);

  return posts
    .sort((a, b) => new Date(b.publishedAt || b.createdAt) - new Date(a.publishedAt || a.createdAt))
    .slice(0, filters.limit || 100);
}

export function getPost(id) { return kv.get(`boz:news:post:${id}`); }
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
  return post;
}

export function updatePost(id, input) {
  const post = getPost(id);
  if (!post) return null;
  const updated = { ...post, ...input, updatedAt: new Date().toISOString() };
  kv.set(`boz:news:post:${id}`, updated);
  return updated;
}

export function publishPost(id) {
  const post = getPost(id);
  if (!post) return null;
  const updated = { ...post, published: true, publishedAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
  kv.set(`boz:news:post:${id}`, updated);
  return updated;
}

export function unpublishPost(id) {
  const post = getPost(id);
  if (!post) return null;
  const updated = { ...post, published: false, updatedAt: new Date().toISOString() };
  kv.set(`boz:news:post:${id}`, updated);
  return updated;
}

export function deletePost(id) {
  kv.del(`boz:news:post:${id}`);
  kv.del(`boz:news:image:${id}`);
  setIndex(getIndex().filter(i => i !== id));
}

export function getStats() {
  const posts = getIndex().map(id => kv.get(`boz:news:post:${id}`)).filter(Boolean);
  return {
    total: posts.length,
    published: posts.filter(p => p.published).length,
    draft: posts.filter(p => !p.published).length,
  };
}
