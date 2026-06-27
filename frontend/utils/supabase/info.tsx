/**
 * Legacy compatibility shim — kept to prevent import errors in old components.
 *
 * KEY FIX: use relative URL /make-server-8fca9621 in production so API calls
 * always route through the Express proxy regardless of the domain (bozplans.org,
 * railway.app, etc). Evaluated lazily via getApiBaseUrl() to avoid module-load
 * timing issues with window.__API_URL__ injection.
 */

const BASE_PATH = '/make-server-8fca9621';

export function getApiBaseUrl(): string {
  // 1. Build-time env var
  if ((import.meta as any).env?.VITE_API_URL) {
    return `${(import.meta as any).env.VITE_API_URL}${BASE_PATH}`;
  }
  // 2. Runtime injection from server.js
  if (typeof window !== 'undefined' && (window as any).__API_URL__) {
    return `${(window as any).__API_URL__}${BASE_PATH}`;
  }
  // 3. Production: relative — same origin, always hits the proxy
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
    return BASE_PATH;
  }
  // 4. Local dev
  return `http://localhost:3001${BASE_PATH}`;
}

// Module-level constant for components that use it outside handlers.
// In production this resolves to the relative path immediately.
export const apiBaseUrl: string = getApiBaseUrl();

/** @deprecated kept for backward compatibility */
export const projectId = '';

/** @deprecated no longer needed */
export const publicAnonKey = '';
