import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

// The backend URL — set VITE_API_URL (or API_URL) in Railway Variables for the frontend service
const API_URL = process.env.VITE_API_URL || process.env.API_URL || '';

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
  console.log(`Frontend serving on port ${PORT}`);
  if (API_URL) {
    console.log(`  → Backend API: ${API_URL}`);
  } else {
    console.log('  ⚠  API_URL not set — frontend will use same-origin or localhost fallback');
  }
});

