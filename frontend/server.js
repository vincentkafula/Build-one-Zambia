import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

// Backend runs in the same container on BACKEND_PORT (set by start.js)
const BACKEND_URL = process.env.API_URL || `http://localhost:${process.env.BACKEND_PORT || '3001'}`;

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

// ── Static assets (immutable, cached) ──────────────────────────────────────────
app.use('/assets', express.static(path.join(__dirname, 'dist/assets'), { maxAge: '1y', immutable: true }));
app.use('/js',     express.static(path.join(__dirname, 'dist/js'),     { maxAge: '1y', immutable: true }));

// ── SPA catch-all: inject API_URL and serve index.html ────────────────────────
// This MUST come after specific routes but BEFORE any generic static middleware
app.get('*', (req, res) => {
  console.log(`[spa] Serving index.html for ${req.method} ${req.path}`);
  
  const indexPath = path.join(__dirname, 'dist', 'index.html');
  let html = fs.readFileSync(indexPath, 'utf8');

  // Inject window.__API_URL__ so React app knows where backend is
  const injection = `<script>window.__API_URL__='';</script>`;
  
  if (html.includes('</head>')) {
    html = html.replace('</head>', `${injection}\n</head>`);
    console.log(`[spa] Injected API_URL before </head>`);
  } else if (html.includes('</html>')) {
    html = html.replace('</html>', `${injection}\n</html>`);
    console.log(`[spa] Injected API_URL before </html>`);
  } else {
    console.warn(`[spa] WARNING: Could not find </head> or </html> in index.html`);
  }

  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(html);
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[frontend] Listening on port ${PORT}`);
  console.log(`[frontend] Proxying API → ${BACKEND_URL}`);
});

