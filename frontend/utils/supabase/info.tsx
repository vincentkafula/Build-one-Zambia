/**
 * Legacy compatibility shim.
 * Components that still import `projectId` use it to build the BASE URL.
 * We now redirect all calls to the Node.js backend instead.
 */

// The Node.js backend base (no trailing slash, no /make-server suffix)
const API_ORIGIN = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3001';

/**
 * projectId is kept for backward compatibility.
 * Components using it to build Supabase URLs will now get the Node.js URL.
 */
export const projectId = API_ORIGIN.replace(/^https?:\/\//, '').replace(/\/$/, '');

/**
 * No longer needed — kept to prevent import errors.
 */
export const publicAnonKey = '';

/**
 * Direct base URL for the API (use this in new code).
 */
export const apiBaseUrl = `${API_ORIGIN}/make-server-8fca9621`;
