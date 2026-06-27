/**
 * Single source of truth for the API base URL.
 *
 * In production (Railway): always use a relative path so requests go through
 * the Express proxy in server.js → which forwards to BACKEND_URL.
 *
 * In local dev: proxy is handled by Vite (vite.config.ts), so relative path
 * works there too. Falls back to localhost:3001 only as a last resort.
 */
export function getApiBase(): string {
  // If we're in a browser on any real domain (not localhost), always use relative path.
  // This ensures all requests go through the frontend's proxy.
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return '/make-server-8fca9621';
  }
  // Local dev: use absolute URL (Vite proxy handles it, or direct if no proxy)
  return (import.meta.env.VITE_API_URL || 'http://localhost:3001') + '/make-server-8fca9621';
}

export const API_BASE = getApiBase();
