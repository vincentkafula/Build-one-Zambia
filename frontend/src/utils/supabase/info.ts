/**
 * Legacy Supabase shim — replaced by Express backend.
 * All files that used to import from here get the correct API base URL.
 */

function resolveApiBase(): string {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  if (typeof window !== 'undefined' && (window as any).__API_URL__) {
    return (window as any).__API_URL__;
  }
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
    return window.location.origin;
  }
  return 'http://localhost:3001';
}

export const apiBaseUrl = `${resolveApiBase()}/make-server-8fca9621`;
