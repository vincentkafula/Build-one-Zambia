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

// ── HTML Injection Middleware ──────────────────────────────────────────────────
// Intercept HTML requests and inject window.__API_URL__ BEFORE serving static files
app.use((req, res, next) => {
  // Only intercept root and .html requests
  if (req.path === '/' || req.path.endsWith('.html')) {
    console.log(`[spa] Intercepting HTML request: ${req.method} ${req.path}`);
    
    const indexPath = path.join(__dirname, 'dist', 'index.html');
    try {
      let html = fs.readFileSync(indexPath, 'utf8');

      // Inject window.__API_URL__ so React app knows where backend is
      const injection = `<script>window.__API_URL__='';</script>`;
      
      if (html.includes('</head>')) {
        html = html.replace('</head>', `${injection}\n</head>`);
        console.log(`[spa] ✅ Injected API_URL before </head>`);
      } else if (html.includes('</html>')) {
        html = html.replace('</html>', `${injection}\n</html>`);
        console.log(`[spa] ✅ Injected API_URL before </html>`);
      } else {
        console.warn(`[spa] ⚠️  Could not find </head> or </html> in index.html`);
      }

      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.send(html);
    } catch (err) {
      console.error(`[spa] ❌ Error reading/injecting index.html:`, err.message);
      return res.status(500).send('Error loading page');
    }
  }
  
  // Not an HTML request, continue to next middleware
  next();
});

// ── Static Files ───────────────────────────────────────────────────────────────
// Serve all static files (assets, js, images, etc.)
// This runs AFTER HTML injection middleware, so HTML is already handled
app.use(express.static(path.join(__dirname, 'dist'), {
  maxAge: '1y',
  immutable: false,  // index.html should not be cached
  index: false,      // Don't auto-serve index.html (we handle it above)
}));

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[frontend] Listening on port ${PORT}`);
  console.log(`[frontend] Proxying API → ${BACKEND_URL}`);
});

