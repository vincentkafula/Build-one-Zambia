import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

// Resolve the backend API URL using this priority order:
//   1. VITE_API_URL           — explicit public URL (e.g. https://xxx.up.railway.app)
//   2. API_URL                — alternative name for the same
//   3. BACKEND_PRIVATE_DOMAIN + BACKEND_PORT
//      - BACKEND_PRIVATE_DOMAIN: copy RAILWAY_PRIVATE_DOMAIN from the backend service
//        e.g. build-one-zambia.railway.internal
//      - BACKEND_PORT: copy RAILWAY_TCP_PROXY_PORT (or PORT) from the backend service
//        On Railway private network, use the internal PORT (default 3001 if not set)
//   4. Empty — frontend falls back to same-origin or localhost
function resolveBackendUrl() {
  if (process.env.VITE_API_URL) return process.env.VITE_API_URL;
  if (process.env.API_URL)      return process.env.API_URL;

  if (process.env.BACKEND_PRIVATE_DOMAIN) {
    // On the private network, services talk to each other on their internal PORT.
    // Railway sets PORT on each service — the backend defaults to 3001.
    // Set BACKEND_PORT in frontend Variables to match what the backend actually uses.
    const port = process.env.BACKEND_PORT || '3001';
    return `http://${process.env.BACKEND_PRIVATE_DOMAIN}:${port}`;
  }

  return '';
}

const API_URL = resolveBackendUrl();

// Serve static assets with long-lived cache (filenames are content-hashed by Vite)
app.use('/assets', express.static(path.join(__dirname, 'dist/assets'), {
  maxAge: '1y',
  immutable: true,
}));
app.use('/js', express.static(path.join(__dirname, 'dist/js'), {
  maxAge: '1y',
  immutable: true,
}));

// All other static files (no caching — index.html must stay fresh)
app.use(express.static(path.join(__dirname, 'dist'), { index: false }));

// SPA catch-all — inject the runtime API URL into index.html before serving
app.get('*', (req, res) => {
  const indexPath = path.join(__dirname, 'dist', 'index.html');
  let html = fs.readFileSync(indexPath, 'utf8');

  if (API_URL) {
    const injection = `<script>window.__API_URL__=${JSON.stringify(API_URL)};</script>`;
    html = html.replace('</head>', `${injection}\n</head>`);
  }

  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.send(html);
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`\nBuild One Zambia — Frontend`);
  console.log(`  Serving on port ${PORT}`);
  if (API_URL) {
    console.log(`  Backend API: ${API_URL}`);
  } else {
    console.log(`  ⚠  No backend URL set — add BACKEND_PRIVATE_DOMAIN to frontend Variables`);
  }
});
