import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

// Resolve the backend API URL using this priority order:
//   1. VITE_API_URL          — manually set Railway Variable (most explicit, public URL)
//   2. API_URL               — alternative manual Variable name
//   3. BACKEND_PRIVATE_DOMAIN — Railway private network (fastest, free internal traffic)
//      Copy the value of RAILWAY_PRIVATE_DOMAIN from the backend service Variables tab
//      into a new Variable on the frontend service called BACKEND_PRIVATE_DOMAIN.
//      e.g.  BACKEND_PRIVATE_DOMAIN = backend.railway.internal
//   4. Empty string          — frontend falls back to same-origin or localhost
function resolveBackendUrl() {
  if (process.env.VITE_API_URL)          return process.env.VITE_API_URL;
  if (process.env.API_URL)               return process.env.API_URL;
  if (process.env.BACKEND_PRIVATE_DOMAIN) {
    return `http://${process.env.BACKEND_PRIVATE_DOMAIN}:3001`;
  }
  return '';
}

const API_URL = resolveBackendUrl();

// Serve static assets with aggressive caching (hashed filenames)
app.use('/assets', express.static(path.join(__dirname, 'dist/assets'), {
  maxAge: '1y',
  immutable: true,
}));
app.use('/js', express.static(path.join(__dirname, 'dist/js'), {
  maxAge: '1y',
  immutable: true,
}));

// Serve other static files (public folder, etc.)
app.use(express.static(path.join(__dirname, 'dist'), { index: false }));

// SPA fallback — inject runtime config into index.html
app.get('*', (req, res) => {
  const indexPath = path.join(__dirname, 'dist', 'index.html');
  let html = fs.readFileSync(indexPath, 'utf8');

  // Inject runtime API URL so the app works without a rebuild
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
    console.log(`  ⚠  No backend URL configured — set VITE_API_URL or BACKEND_PRIVATE_DOMAIN in Railway Variables`);
  }
});
