import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createServer } from 'http';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

// ── Resolve backend URL ───────────────────────────────────────────────────────
// Priority: VITE_API_URL → API_URL → same-host internal → localhost:3001
function resolveBackendUrl() {
  if (process.env.VITE_API_URL) return process.env.VITE_API_URL;
  if (process.env.API_URL)      return process.env.API_URL;
  if (process.env.BACKEND_PRIVATE_DOMAIN) {
    const port = process.env.BACKEND_PORT || '8080';
    return `http://${process.env.BACKEND_PRIVATE_DOMAIN}:${port}`;
  }
  // Default: backend running on the same host (monorepo mode)
  const backendPort = process.env.BACKEND_PORT || '3001';
  return `http://localhost:${backendPort}`;
}

const API_URL = resolveBackendUrl();

// ── API Proxy ─────────────────────────────────────────────────────────────────
// Forward /make-server-8fca9621/* and /uploads/* to the backend
app.use(['/make-server-8fca9621', '/uploads'], async (req, res) => {
  const target = `${API_URL}${req.url.startsWith('/make-server') ? '' : ''}`;
  const url = `${API_URL}${req.originalUrl}`;

  try {
    const headers = { ...req.headers };
    delete headers['host'];

    // Read body for non-GET requests
    let body = undefined;
    if (!['GET', 'HEAD'].includes(req.method)) {
      body = await new Promise((resolve, reject) => {
        const chunks = [];
        req.on('data', c => chunks.push(c));
        req.on('end', () => resolve(Buffer.concat(chunks)));
        req.on('error', reject);
      });
    }

    const fetchRes = await fetch(url, {
      method: req.method,
      headers,
      body: body && body.length > 0 ? body : undefined,
    });

    res.status(fetchRes.status);
    fetchRes.headers.forEach((val, key) => {
      if (!['transfer-encoding', 'connection'].includes(key.toLowerCase())) {
        res.setHeader(key, val);
      }
    });

    const buf = await fetchRes.arrayBuffer();
    res.end(Buffer.from(buf));
  } catch (err) {
    console.error('[Proxy] Error:', err.message);
    res.status(502).json({ error: 'Backend unavailable', detail: err.message });
  }
});

// ── Static assets ─────────────────────────────────────────────────────────────
app.use('/assets', express.static(path.join(__dirname, 'dist/assets'), {
  maxAge: '1y', immutable: true,
}));
app.use('/js', express.static(path.join(__dirname, 'dist/js'), {
  maxAge: '1y', immutable: true,
}));
app.use(express.static(path.join(__dirname, 'dist'), { index: false }));

// ── SPA catch-all ─────────────────────────────────────────────────────────────
// Inject the backend URL so the React app can find it at runtime
app.get('*', (req, res) => {
  const indexPath = path.join(__dirname, 'dist', 'index.html');
  let html = fs.readFileSync(indexPath, 'utf8');

  // Always inject the real backend URL so the SPA knows where to call
  const injection = `<script>window.__API_URL__=${JSON.stringify(API_URL)};</script>`;
  html = html.replace('</head>', `${injection}\n</head>`);

  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.send(html);
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`\nBuild One Zambia — Frontend`);
  console.log(`  Serving on port  : ${PORT}`);
  console.log(`  Backend API at   : ${API_URL}`);
  console.log(`  Proxy active for : /make-server-8fca9621/* and /uploads/*`);
});
