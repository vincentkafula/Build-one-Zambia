/**
 * Root server.js — used by Railway when Root Directory is set to /
 * Detects whether to run as BACKEND or FRONTEND based on env vars.
 *
 * Backend service: set IS_BACKEND=true in Railway Variables
 * Frontend service: set BACKEND_URL=https://... in Railway Variables
 */

// If IS_BACKEND is set, run the actual backend
if (process.env.IS_BACKEND === 'true') {
  import('./backend/src/index.js');
} else {
  // Run the frontend server
  import('./frontend/server.js');
}
