/**
 * Legacy compatibility shim — kept to prevent import errors in old components.
 * Uses the same runtime API URL resolution as src/app/lib/api.ts.
 */

function resolveApiOrigin(): string {
  if ((import.meta as any).env?.VITE_API_URL) return (import.meta as any).env.VITE_API_URL;
  if (typeof window !== 'undefined' && (window as any).__API_URL__) {
    return (window as any).__API_URL__;
  }
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
    return window.location.origin;
  }
  return 'http://localhost:3001';
}

export const apiBaseUrl = `${resolveApiOrigin()}/make-server-8fca9621`;

/** @deprecated kept for backward compatibility */
export const projectId = resolveApiOrigin().replace(/^https?:\/\//, '').replace(/\/$/, '');

/** @deprecated no longer needed */
export const publicAnonKey = '';
