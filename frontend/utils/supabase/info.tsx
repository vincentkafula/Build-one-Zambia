/**
 * Legacy compatibility shim.
 * Always uses relative /make-server-8fca9621 path in production
 * so calls go through the Express proxy, never directly to the backend.
 */

export function getApiBaseUrl(): string {
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    return 'http://localhost:3001/make-server-8fca9621';
  }
  return '/make-server-8fca9621';
}

export const apiBaseUrl: string = getApiBaseUrl();

/** @deprecated */
export const projectId = '';
/** @deprecated */
export const publicAnonKey = '';
