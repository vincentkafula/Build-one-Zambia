import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;
const DIST = path.join(__dirname, 'dist');

// ─── Backend URL resolution ───────────────────────────────────────────────────
// BACKEND_URL must be set as an environment variable in Railway (frontend service).
// It should be the full URL of the backend Railway service, e.g.:
//   https://build-one-zambia-backend.up.railway.app
// Railway internal networking can use:
//   http://<backend-service-name>.railway.internal:<PORT>
const BACKEND = process.env.BACKEND_URL;

if (!BACKEND) {
  console.error('\n\x1b[31m╔══════════════════════════════════════════════════════════╗');
  console.error('║  FATAL: BACKEND_URL environment variable is not set!     ║');
  console.error('║  Set it in Railway → Frontend service → Variables tab    ║');
  console.error('║  Value: https://<your-backend>.up.railway.app            ║');
  console.error('╚══════════════════════════════════════════════════════════╝\x1b[0m\n');
  // Don't crash — still serve the frontend, but API calls will 502
}

console.log(`\n🇿🇲  Build One Zambia — Frontend Server`);
console.log(`   🔗  Backend URL:    ${BACKEND || '(NOT SET — API calls will fail)'}`);
console.log(`   🌐  Public domain:  ${process.env.RAILWAY_PUBLIC_DOMAIN || '(local)'}`);
console.log(`   🚂  Service name:   ${process.env.RAILWAY_SERVICE_NAME || '(local)'}`);
console.log(`   📁  Serving dist from: ${DIST}`);

// ─── Helper: proxy a request to the backend ──────────────────────────────────
async function proxyToBackend(req, res, targetPath) {
  if (!BACKEND) {
    return res.status(503).json({
      error: 'Backend not configured',
      details: 'BACKEND_URL environment variable is not set on the frontend service.',
      hint: 'Go to Railway → Frontend service → Variables → Add BACKEND_URL=https://your-backend.up.railway.app',
    });
  }

  const url = `${BACKEND}${targetPath}`;
  try {
    // Strip hop-by-hop headers, forward the rest
    const forwardHeaders = { ...req.headers };
    delete forwardHeaders['host'];
    delete forwardHeaders['connection'];
    delete forwardHeaders['transfer-encoding'];

    // Real IP forwarding (important for rate limiting)
    forwardHeaders['x-forwarded-for'] =
      req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
    forwardHeaders['x-real-ip'] =
      req.headers['x-real-ip'] || req.socket.remoteAddress || '';
    forwardHeaders['x-forwarded-proto'] = req.protocol;
    forwardHeaders['x-forwarded-host'] = req.hostname;

    let body;
    if (!['GET', 'HEAD'].includes(req.method)) {
      body = await new Promise((resolve, reject) => {
        const chunks = [];
        req.on('data', c => chunks.push(c));
        req.on('end', () => resolve(Buffer.concat(chunks)));
        req.on('error', reject);
      });
    }

    const response = await fetch(url, {
      method: req.method,
      headers: forwardHeaders,
      body: body?.length ? body : undefined,
      // 30-second timeout for long-running requests
      signal: AbortSignal.timeout(30_000),
    });

    // Forward response status + headers
    res.status(response.status);
    response.headers.forEach((value, key) => {
      if (!['transfer-encoding', 'connection', 'keep-alive'].includes(key.toLowerCase())) {
        res.setHeader(key, value);
      }
    });

    // Stream body back
    const buffer = Buffer.from(await response.arrayBuffer());
    res.end(buffer);
  } catch (err) {
    console.error(`[proxy] ${req.method} ${url} → ERROR: ${err.name}: ${err.message}`);
    if (err.name === 'TimeoutError') {
      res.status(504).json({ error: 'Backend request timed out', url, hint: 'Backend may be overloaded or BACKEND_URL points to wrong host.' });
    } else {
      res.status(502).json({
        error: 'Backend unreachable',
        details: err.message,
        errorType: err.name,
        triedUrl: url,
        backendUrlEnv: BACKEND,
        hint: 'Check: (1) IS_BACKEND=true on backend service, (2) both services in same Railway project, (3) BACKEND_URL uses correct private networking URL shown in backend logs.',
      });
    }
  }
}

// ─── 1. Proxy: API calls ─────────────────────────────────────────────────────
app.use('/make-server-8fca9621', (req, res) => {
  const targetPath = `/make-server-8fca9621${req.originalUrl.replace('/make-server-8fca9621', '')}`;
  proxyToBackend(req, res, targetPath);
});

// ─── 2. Proxy: Uploaded files (leader images, etc.) ──────────────────────────
app.use('/uploads', (req, res) => {
  proxyToBackend(req, res, `/uploads${req.originalUrl.replace('/uploads', '')}`);
});

// ─── 3. Health check (for Railway) ───────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'boz-frontend',
    backendConfigured: !!BACKEND,
    backendUrl: BACKEND ? `${BACKEND.replace(/\/+$/, '')} (configured)` : 'NOT SET',
    timestamp: new Date().toISOString(),
  });
});

// ─── 4. Debug endpoints ───────────────────────────────────────────────────────
app.get('/__debug/backend', async (req, res) => {
  if (!BACKEND) {
    return res.json({
      configured: false,
      hint: 'Set BACKEND_URL in Railway frontend service variables.',
      example: 'http://<backend-service-name>.railway.internal:<PORT>',
    });
  }
  try {
    const r = await fetch(`${BACKEND}/make-server-8fca9621/health`, { signal: AbortSignal.timeout(8000) });
    const ct = r.headers.get('content-type') || '';
    const text = await r.text();
    let backendResponse;
    try { backendResponse = JSON.parse(text); } catch { backendResponse = text; }
    res.json({ configured: true, backendUrl: BACKEND, backendStatus: r.status, backendResponse });
  } catch (err) {
    res.status(502).json({
      configured: true,
      backendUrl: BACKEND,
      error: err.message,
      hint: 'Check that BACKEND_URL uses the correct private networking URL and PORT.',
    });
  }
});

// Shows what port this frontend is on — helpful when Railway shows it
app.get('/__debug/env', (req, res) => {
  const serviceName = process.env.RAILWAY_SERVICE_NAME || '(unknown)';
  res.json({
    PORT,
    BACKEND_URL: BACKEND || '(NOT SET)',
    backendConfigured: !!BACKEND,
    nodeEnv: process.env.NODE_ENV || 'production',
    railwayService: serviceName,
    railwayEnv: process.env.RAILWAY_ENVIRONMENT || '(unknown)',
    publicDomain: process.env.RAILWAY_PUBLIC_DOMAIN || '(unknown)',
    hint: !BACKEND
      ? 'Set BACKEND_URL in Railway frontend service variables. Check backend service logs for the private networking URL.'
      : 'BACKEND_URL is set. If API calls fail, visit /__debug/backend to test connectivity.',
  });
});

// ─── 5. SPA: inject config + serve index.html ────────────────────────────────
function serveIndex(req, res) {
  try {
    const html = fs.readFileSync(path.join(DIST, 'index.html'), 'utf8');
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    // Inject runtime config so the frontend can confirm the proxy is active
    const injected = html.replace(
      '</head>',
      `<script>window.__API_URL__='';window.__BACKEND_CONFIGURED__=${!!BACKEND};</script>\n</head>`
    );
    res.send(injected);
  } catch (err) {
    res.status(500).send(`<h1>Build error</h1><pre>${err.message}</pre><p>The frontend dist/ folder may not have been built.</p>`);
  }
}

// ─── 6. Static assets (JS/CSS/images - long cache) ───────────────────────────
app.use(express.static(DIST, {
  maxAge: '1y',
  immutable: true,
  // Don't serve index.html from static — we handle it above
  index: false,
}));

// ─── 7. SPA fallback ─────────────────────────────────────────────────────────
app.get('*', serveIndex);

// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, '0.0.0.0', () => {
  console.log(`   ✅  Listening on http://0.0.0.0:${PORT}\n`);
});
