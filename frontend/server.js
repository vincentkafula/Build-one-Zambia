import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

// ── Resolve backend URL (server-side only — used by the proxy) ────────────────
// Priority: VITE_API_URL → API_URL → BACKEND_PRIVATE_DOMAIN → localhost:3001
function resolveBackendUrl() {
  if (process.env.VITE_API_URL)          return process.env.VITE_API_URL;
  if (process.env.API_URL)               return process.env.API_URL;
  if (process.env.BACKEND_PRIVATE_DOMAIN) {
    const port = process.env.BACKEND_PORT || '3001';
    return `http://${process.env.BACKEND_PRIVATE_DOMAIN}:${port}`;
  }
  const backendPort = process.env.BACKEND_PORT || '3001';
  return `http://localhost:${backendPort}`;
}

const BACKEND_URL = resolveBackendUrl();

// What the browser should call — always the same origin as the frontend,
// because the proxy below forwards /make-server-8fca9621/* to the backend.
// This means window.__API_URL__ is intentionally left empty so api.ts
// falls through to the same-origin /make-server-8fca9621 path.
const BROWSER_API_URL = ''; // same-origin: browser hits the proxy on this server

// ── API Proxy ─────────────────────────────────────────────────────────────────
// Forward /make-server-8fca9621/* and /uploads/* to the backend process
app.use(['/make-server-8fca9621', '/uploads'], async (req, res) => {
  const url = `${BACKEND_URL}${req.originalUrl}`;

  try {
    const headers = { ...req.headers };
    delete headers['host'];

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
      body:    body && body.length > 0 ? body : undefined,
    });

    res.status(fetchRes.status);
    fetchRes.headers.forEach((val, key) => {
      if (!['transfer-encoding', 'connection'].includes(key.toLowerCase())) {
        res.setHeader(key, val);
      }
    });

    res.end(Buffer.from(await fetchRes.arrayBuffer()));
  } catch (err) {
    console.error('[Proxy] Error forwarding to backend:', err.message);
    res.status(502).json({ error: 'Backend unavailable', detail: err.message });
  }
});

// ── Static assets (long cache — Vite content-hashes filenames) ───────────────
app.use('/assets', express.static(path.join(__dirname, 'dist/assets'), {
  maxAge: '1y', immutable: true,
}));
app.use('/js', express.static(path.join(__dirname, 'dist/js'), {
  maxAge: '1y', immutable: true,
}));
app.use(express.static(path.join(__dirname, 'dist'), { index: false }));

// ── SPA catch-all ─────────────────────────────────────────────────────────────
app.get('*', (req, res) => {
  const indexPath = path.join(__dirname, 'dist', 'index.html');
  let html = fs.readFileSync(indexPath, 'utf8');

  // Inject an empty string so api.ts uses the same-origin proxy path.
  // The frontend lib/api.ts resolveApiOrigin() will see window.__API_URL__ === ''
  // and fall through to window.location.origin, which routes through this proxy.
  const injection = `<script>window.__API_URL__='';</script>`;
  html = html.replace('</head>', `${injection}\n</head>`);

  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.send(html);
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🇿🇲  Build One Zambia — Frontend Server`);
  console.log(`   Public port  : ${PORT}`);
  console.log(`   Proxying to  : ${BACKEND_URL}`);
  console.log(`   Routes proxied: /make-server-8fca9621/*, /uploads/*`);
});
