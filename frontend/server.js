import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

// Backend is always on localhost:BACKEND_PORT (set by start.js)
const BACKEND_PORT = process.env.BACKEND_PORT || '3001';
const BACKEND_URL  = process.env.API_URL || `http://localhost:${BACKEND_PORT}`;

console.log(`[frontend] PORT        = ${PORT}`);
console.log(`[frontend] BACKEND_URL = ${BACKEND_URL}`);

// ── API Proxy ─────────────────────────────────────────────────────────────────
// Browser calls same-origin /make-server-8fca9621/* → this proxy → backend
app.use(['/make-server-8fca9621', '/uploads'], async (req, res) => {
  const url = `${BACKEND_URL}${req.originalUrl}`;

  try {
    const headers = { ...req.headers };
    delete headers['host'];
    delete headers['connection'];

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
      method:  req.method,
      headers,
      body:    body?.length ? body : undefined,
    });

    res.status(fetchRes.status);
    for (const [key, val] of fetchRes.headers.entries()) {
      if (!['transfer-encoding', 'connection', 'keep-alive'].includes(key.toLowerCase())) {
        res.setHeader(key, val);
      }
    }
    res.end(Buffer.from(await fetchRes.arrayBuffer()));

  } catch (err) {
    console.error(`[proxy] FAILED ${req.method} ${url} —`, err.message);
    res.status(502).json({ error: 'Backend unavailable', detail: err.message });
  }
});

// ── Static assets ─────────────────────────────────────────────────────────────
app.use('/assets', express.static(path.join(__dirname, 'dist/assets'), { maxAge: '1y', immutable: true }));
app.use('/js',     express.static(path.join(__dirname, 'dist/js'),     { maxAge: '1y', immutable: true }));

// ── SPA — inject empty __API_URL__ so browser uses same-origin proxy ──────────
// This must come BEFORE the generic static middleware so it intercepts all requests
app.get('*', (req, res) => {
  const indexPath = path.join(__dirname, 'dist', 'index.html');
  let html = fs.readFileSync(indexPath, 'utf8');

  // Empty string → resolveApiOrigin() falls to window.location.origin
  // → all API calls hit /make-server-8fca9621/* on this server → proxy above
  html = html.replace('</head>', `<script>window.__API_URL__='';</script>\n</head>`);

  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.send(html);
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[frontend] Listening on port ${PORT}`);
  console.log(`[frontend] Proxying API → ${BACKEND_URL}`);
});

