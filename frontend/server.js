import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;
const DIST = path.join(__dirname, 'dist');

// 1. API proxy - forward /make-server-8fca9621/* to backend
const BACKEND = process.env.BACKEND_URL || 'http://localhost:3001';
app.use('/make-server-8fca9621', async (req, res) => {
  const url = `${BACKEND}/make-server-8fca9621${req.originalUrl.replace('/make-server-8fca9621','')}`;
  try {
    const headers = { ...req.headers, host: undefined };
    // Forward real client IP so backend rate-limits per user, not per proxy server
    headers['x-forwarded-for'] = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    headers['x-real-ip'] = req.headers['x-real-ip'] || req.socket.remoteAddress;
    const body = ['GET','HEAD'].includes(req.method) ? undefined : await new Promise((resolve, reject) => {
      const chunks = [];
      req.on('data', c => chunks.push(c));
      req.on('end', () => resolve(Buffer.concat(chunks)));
      req.on('error', reject);
    });
    const r = await fetch(url, { method: req.method, headers, body: body?.length ? body : undefined });
    res.status(r.status);
    r.headers.forEach((v, k) => { if (!['transfer-encoding','connection'].includes(k)) res.setHeader(k, v); });
    res.end(Buffer.from(await r.arrayBuffer()));
  } catch(e) {
    res.status(502).json({ error: 'Backend unavailable' });
  }
});

// 2. Intercept ALL html requests BEFORE static files - inject API URL
app.use((req, res, next) => {
  if (req.path === '/' || req.path.endsWith('.html')) {
    const html = fs.readFileSync(path.join(DIST, 'index.html'), 'utf8');
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache');
    res.send(html.replace('</head>', `<script>window.__API_URL__='';</script>\n</head>`));
  } else {
    next();
  }
});

// 3. Static files (JS, CSS, assets)
app.use(express.static(DIST, { maxAge: '1y', immutable: true }));

// 4. SPA fallback for all other routes
app.get('*', (req, res) => {
  const html = fs.readFileSync(path.join(DIST, 'index.html'), 'utf8');
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache');
  res.send(html.replace('</head>', `<script>window.__API_URL__='';</script>\n</head>`));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Frontend running on port ${PORT}`);
});
