import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

// Resolve the backend API URL.
// Railway assigns PORT dynamically — never hardcode a port number.
// Priority:
//   1. VITE_API_URL  — the backend's public Railway URL (most reliable)
//   2. API_URL       — alternative name
//   3. BACKEND_PRIVATE_DOMAIN + BACKEND_PORT
//      Set BACKEND_PORT to whatever PORT is shown in the backend service Variables
function resolveBackendUrl() {
  if (process.env.VITE_API_URL) return process.env.VITE_API_URL;
  if (process.env.API_URL)      return process.env.API_URL;
  if (process.env.BACKEND_PRIVATE_DOMAIN) {
    // BACKEND_PORT must match the PORT value shown in the backend's Railway Variables
    const port = process.env.BACKEND_PORT || '8080';
    return `http://${process.env.BACKEND_PRIVATE_DOMAIN}:${port}`;
  }
  return '';
}

const API_URL = resolveBackendUrl();

// Static assets — long cache (Vite content-hashes filenames)
app.use('/assets', express.static(path.join(__dirname, 'dist/assets'), {
  maxAge: '1y', immutable: true,
}));
app.use('/js', express.static(path.join(__dirname, 'dist/js'), {
  maxAge: '1y', immutable: true,
}));
app.use(express.static(path.join(__dirname, 'dist'), { index: false }));

// SPA catch-all — inject runtime API URL into index.html
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
  console.log(`  Backend API: ${API_URL || '⚠ NOT SET — add VITE_API_URL to Railway Variables'}`);
});
