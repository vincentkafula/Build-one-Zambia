/**
 * Build One Zambia Portal — Node.js / Express Backend
 * Replaces the original Deno/Hono/Supabase server.
 *
 * Endpoints mirror the original server paths so the frontend needs only
 * a single BASE_URL change from the Supabase edge-function URL to
 * http://localhost:3001  (or your production domain).
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

import * as auth from './auth.js';
import * as leadership from './leadership.js';
import * as news from './news.js';
import * as candidates from './candidates.js';
import * as registrations from './registrations.js';
import * as press from './press.js';
import * as elections from './elections.js';
import * as docs from './documents.js';
import * as results from './results.js';
import * as shop from './shop.js';
import * as streams from './streams.js';
import { kv } from './db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = parseInt(process.env.PORT || '3001', 10);
const BASE = '/make-server-8fca9621'; // Keep the same path prefix as original

const app = express();

// ─── Security & parsing ──────────────────────────────────────────────────────

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: false, // frontend handles CSP
}));

// Additional allowed origins from environment (comma-separated)
const EXTRA_ORIGINS = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

app.use(cors({
  origin: (origin, cb) => {
    const allowed = [
      'https://bozplans.org',
      'https://www.bozplans.org',
      'https://glorious-sparkle-production-b0a3.up.railway.app',
      ...EXTRA_ORIGINS,
    ];
    if (
      !origin ||
      allowed.includes(origin) ||
      origin.startsWith('http://localhost') ||
      origin.startsWith('http://127.0.0.1') ||
      origin.includes('vercel.app') ||
      origin.includes('netlify.app') ||
      origin.includes('railway.app') ||
      origin.includes('up.railway.app') ||
      origin.includes('railway.internal')
    ) {
      cb(null, true);
    } else {
      console.warn(`[CORS] Blocked origin: ${origin}`);
      cb(null, false);
    }
  },
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['X-RateLimit-Limit', 'X-RateLimit-Remaining'],
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Trust Railway's proxy so rate limiter sees real client IPs (not the frontend server IP)
app.set('trust proxy', 1);

// ─── Health (registered BEFORE rate limiter so it's never blocked) ───────────
app.get(`${BASE}/health`, (req, res) => {
  res.json({ name: 'Build One Zambia API', status: 'ok', server: 'node-express', version: '1.0.0', timestamp: new Date().toISOString() });
});

// Simple top-level ping — no path prefix, works from browser immediately
app.get('/ping', (req, res) => {
  res.json({
    status: 'ok',
    service: 'boz-backend',
    port: PORT,
    railwayService: process.env.RAILWAY_SERVICE_NAME || '(local)',
    railwayEnv: process.env.RAILWAY_ENVIRONMENT || 'local',
    publicDomain: process.env.RAILWAY_PUBLIC_DOMAIN || '(not set)',
    timestamp: new Date().toISOString(),
  });
});

// Rate limiting removed — Railway provides DDoS protection at the edge

// ─── Static uploads ──────────────────────────────────────────────────────────
// Leader images and other public uploads are served here

const IS_RAILWAY = !!process.env.RAILWAY_ENVIRONMENT || !!process.env.RAILWAY_PROJECT_ID;
const UPLOADS_DIR = IS_RAILWAY
  ? '/tmp/boz-uploads'
  : path.join(__dirname, '..', 'uploads');

// On Railway, copy bundled leader images to /tmp on startup
if (IS_RAILWAY) {
  const srcLeaders = path.join(__dirname, '..', 'uploads', 'leaders');
  const dstLeaders = path.join(UPLOADS_DIR, 'leaders');
  fs.mkdirSync(dstLeaders, { recursive: true });
  try {
    const files = fs.readdirSync(srcLeaders);
    for (const f of files) {
      const dst = path.join(dstLeaders, f);
      if (!fs.existsSync(dst)) fs.copyFileSync(path.join(srcLeaders, f), dst);
    }
    console.log(`   🖼   Copied ${files.length} leader images to ${dstLeaders}`);
  } catch (e) {
    console.warn('   ⚠  Could not copy leader images:', e.message);
  }
} else {
  fs.mkdirSync(path.join(UPLOADS_DIR, 'leaders'), { recursive: true });
}
app.use('/uploads', express.static(UPLOADS_DIR, { maxAge: '7d' }));

// ─── Auth ────────────────────────────────────────────────────────────────────

app.post(`${BASE}/auth/login`,
  async (req, res) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) return res.status(400).json({ error: 'username and password required' });

      const user = await auth.loginUser(username, password);
      if (!user) return res.status(401).json({ error: 'Invalid credentials' });

      const token = auth.createToken(user.username, user.role);
      // Return the full user record (minus any sensitive fields) so the frontend
      // can auto-detect role + assigned scope (province/district/constituency/
      // ward/polling station) exactly as granted by the super admin in the
      // Election Users manager — no manual role/area picking needed at login.
      const { id, username: uname, role, name, email, phone,
              scopeId, scopeName, scopeType,
              pollingStationId, pollingStationName,
              active, createdAt, lastLogin } = user;
      res.json({
        token,
        user: {
          id, username: uname, role, name, email, phone,
          scopeId, scopeName, scopeType,
          pollingStationId, pollingStationName,
          active, createdAt, lastLogin,
        },
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

app.post(`${BASE}/auth/logout`, (req, res) => res.json({ success: true }));

app.get(`${BASE}/auth/me`, auth.requireAuth, (req, res) => {
  const user = auth.getUser(req.user.username) || { username: req.user.username, role: req.user.role };
  res.json({ user });
});

app.post(`${BASE}/auth/register`,
  auth.requireAuth, auth.requireRole('admin', 'super_admin'),
  async (req, res) => {
    try {
      const { password, ...userData } = req.body;
      const user = await auth.registerUser(userData, password);
      res.json({ user });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
);

app.get(`${BASE}/auth/users`,
  auth.requireAuth, auth.requireRole('admin', 'super_admin'),
  (req, res) => res.json({ users: auth.listUsers() })
);

// ─── Leadership ──────────────────────────────────────────────────────────────

// Seed on first request if needed
let seeded = false;
function ensureSeeded(req) {
  if (!seeded) {
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    leadership.seedLeaders(baseUrl);
    seeded = true;
  }
}

app.get(`${BASE}/leadership`, (req, res) => {
  ensureSeeded(req);
  const leaders = leadership.listLeaders({
    tier: req.query.tier,
    province: req.query.province,
  });
  res.json({ leaders });
});

app.get(`${BASE}/leadership/:id`, (req, res) => {
  const l = leadership.getLeader(req.params.id);
  if (!l) return res.status(404).json({ error: 'Leader not found' });
  res.json({ leader: l });
});

app.get(`${BASE}/leadership/:id/image`, (req, res) => {
  const img = leadership.getLeaderImage(req.params.id);
  if (!img) return res.status(404).json({ error: 'No image' });
  // data URL: data:image/jpeg;base64,...
  const [meta, b64] = img.split(',');
  const mime = meta.replace('data:', '').replace(';base64', '');
  res.setHeader('Content-Type', mime);
  res.send(Buffer.from(b64, 'base64'));
});

app.post(`${BASE}/leadership`,
  auth.requireAuth, auth.requireRole('admin', 'super_admin'),
  (req, res) => {
    try {
      const l = leadership.createLeader(req.body);
      res.json({ leader: l });
    } catch (err) { res.status(400).json({ error: err.message }); }
  }
);

app.patch(`${BASE}/leadership/:id`,
  auth.requireAuth, auth.requireRole('admin', 'super_admin'),
  (req, res) => {
    const l = leadership.updateLeader(req.params.id, req.body);
    if (!l) return res.status(404).json({ error: 'Not found' });
    res.json({ leader: l });
  }
);

app.patch(`${BASE}/leadership/:id/image`,
  auth.requireAuth, auth.requireRole('admin', 'super_admin'),
  (req, res) => {
    const l = leadership.updateLeaderImage(req.params.id, req.body.imageDataUrl);
    if (!l) return res.status(404).json({ error: 'Not found' });
    res.json({ leader: l });
  }
);

app.post(`${BASE}/leadership/reorder`,
  auth.requireAuth, auth.requireRole('admin', 'super_admin'),
  (req, res) => {
    leadership.reorderLeaders(req.body.orderings || []);
    res.json({ success: true });
  }
);

app.delete(`${BASE}/leadership/:id`,
  auth.requireAuth, auth.requireRole('admin', 'super_admin'),
  (req, res) => {
    leadership.deleteLeader(req.params.id);
    res.json({ success: true });
  }
);

app.delete(`${BASE}/leadership/:id/hard`,
  auth.requireAuth, auth.requireRole('super_admin'),
  (req, res) => {
    leadership.hardDeleteLeader(req.params.id);
    res.json({ success: true });
  }
);

// ─── News ────────────────────────────────────────────────────────────────────

app.get(`${BASE}/news/posts`, (req, res) => {
  const published = req.query.published !== 'false';
  const limit = parseInt(req.query.limit || '50', 10);
  const posts = news.listPosts({ published, category: req.query.category, limit });
  res.json({ posts });
});

app.get(`${BASE}/news/posts/stats`,
  auth.requireAuth, auth.requireRole('admin', 'super_admin'),
  (req, res) => res.json(news.getStats())
);

app.get(`${BASE}/news/posts/:id`, (req, res) => {
  const p = news.getPost(req.params.id);
  if (!p) return res.status(404).json({ error: 'Not found' });
  res.json({ post: p });
});

app.get(`${BASE}/news/posts/:id/image`, (req, res) => {
  const img = news.getPostImage(req.params.id);
  if (!img) return res.status(404).json({ error: 'No image' });
  const [meta, b64] = img.split(',');
  const mime = meta.replace('data:', '').replace(';base64', '');
  res.setHeader('Content-Type', mime);
  res.send(Buffer.from(b64, 'base64'));
});

app.post(`${BASE}/news/posts`,
  auth.requireAuth, auth.requireRole('admin', 'super_admin'),
  (req, res) => res.json({ post: news.createPost(req.body, req.user.username) })
);

app.patch(`${BASE}/news/posts/:id`,
  auth.requireAuth, auth.requireRole('admin', 'super_admin'),
  (req, res) => {
    const p = news.updatePost(req.params.id, req.body);
    if (!p) return res.status(404).json({ error: 'Not found' });
    res.json({ post: p });
  }
);

app.patch(`${BASE}/news/posts/:id/image`,
  auth.requireAuth, auth.requireRole('admin', 'super_admin'),
  (req, res) => {
    const p = news.getPost(req.params.id);
    if (!p) return res.status(404).json({ error: 'Not found' });
    const updated = news.updatePost(req.params.id, { hasCustomImage: true, imageDataUrl: req.body.imageDataUrl });
    res.json({ post: updated });
  }
);

app.patch(`${BASE}/news/posts/:id/publish`,
  auth.requireAuth, auth.requireRole('admin', 'super_admin'),
  (req, res) => {
    const p = news.publishPost(req.params.id);
    if (!p) return res.status(404).json({ error: 'Not found' });
    res.json({ post: p });
  }
);

app.patch(`${BASE}/news/posts/:id/unpublish`,
  auth.requireAuth, auth.requireRole('admin', 'super_admin'),
  (req, res) => {
    const p = news.unpublishPost(req.params.id);
    if (!p) return res.status(404).json({ error: 'Not found' });
    res.json({ post: p });
  }
);

app.delete(`${BASE}/news/posts/:id`,
  auth.requireAuth, auth.requireRole('admin', 'super_admin'),
  (req, res) => {
    news.deletePost(req.params.id);
    res.json({ success: true });
  }
);

// ─── Candidates ──────────────────────────────────────────────────────────────

app.get(`${BASE}/candidates`, (req, res) => {
  const { electionType, scopeId, party, gender } = req.query;
  const list = candidates.listCandidates({ electionType, scopeId, party, gender });
  res.json({ candidates: list });
});

app.get(`${BASE}/candidates/scope/:electionType/:scopeId`, (req, res) => {
  const list = candidates.listCandidates({
    electionType: req.params.electionType,
    scopeId: req.params.scopeId,
  });
  res.json({ candidates: list });
});

app.get(`${BASE}/candidates/stats`, auth.requireAuth, (req, res) => res.json(candidates.getStats()));

app.get(`${BASE}/candidates/:id`, (req, res) => {
  const c = candidates.getCandidate(req.params.id);
  if (!c) return res.status(404).json({ error: 'Not found' });
  res.json({ candidate: c });
});

app.get(`${BASE}/candidates/:id/photo`, (req, res) => {
  const photo = candidates.getCandidatePhoto(req.params.id);
  if (!photo) return res.status(404).json({ error: 'No photo' });
  const [meta, b64] = photo.split(',');
  const mime = meta.replace('data:', '').replace(';base64', '');
  res.setHeader('Content-Type', mime);
  res.send(Buffer.from(b64, 'base64'));
});

app.post(`${BASE}/candidates`,
  auth.requireAuth, auth.requireRole('admin', 'super_admin'),
  (req, res) => res.json({ candidate: candidates.createCandidate(req.body, req.user.username) })
);

app.patch(`${BASE}/candidates/:id`,
  auth.requireAuth, auth.requireRole('admin', 'super_admin'),
  (req, res) => {
    const c = candidates.updateCandidate(req.params.id, req.body);
    if (!c) return res.status(404).json({ error: 'Not found' });
    res.json({ candidate: c });
  }
);

app.patch(`${BASE}/candidates/:id/photo`,
  auth.requireAuth, auth.requireRole('admin', 'super_admin'),
  (req, res) => {
    const c = candidates.updateCandidatePhoto(req.params.id, req.body.photoDataUrl);
    if (!c) return res.status(404).json({ error: 'Not found' });
    res.json({ candidate: c });
  }
);

app.delete(`${BASE}/candidates/:id`,
  auth.requireAuth, auth.requireRole('admin', 'super_admin'),
  (req, res) => {
    candidates.deleteCandidate(req.params.id);
    res.json({ success: true });
  }
);

// ─── Shop: Products ──────────────────────────────────────────────────────────

app.get(`${BASE}/shop/products`, (req, res) => {
  const { category, search, featured, includeInactive } = req.query;
  const products = shop.listProducts({
    category,
    search,
    featured: featured === 'true',
    includeInactive: includeInactive === 'true',
  });
  res.json({ products, count: products.length });
});

app.get(`${BASE}/shop/products/:id`, (req, res) => {
  const p = shop.getProduct(req.params.id);
  if (!p) return res.status(404).json({ error: 'Not found' });
  res.json({ product: p });
});

app.get(`${BASE}/shop/products/:id/image`, (req, res) => {
  const img = shop.getProductImage(req.params.id);
  if (!img) return res.status(404).json({ error: 'No image' });
  const [meta, b64] = img.split(',');
  const mime = meta.replace('data:', '').replace(';base64', '');
  res.setHeader('Content-Type', mime);
  res.send(Buffer.from(b64, 'base64'));
});

app.post(`${BASE}/shop/products`,
  auth.requireAuth, auth.requireRole('admin', 'super_admin'),
  (req, res) => {
    try {
      const product = shop.createProduct(req.body);
      res.json({ success: true, product });
    } catch (err) { res.status(400).json({ error: err.message }); }
  }
);

app.patch(`${BASE}/shop/products/:id`,
  auth.requireAuth, auth.requireRole('admin', 'super_admin'),
  (req, res) => {
    const p = shop.updateProduct(req.params.id, req.body);
    if (!p) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true, product: p });
  }
);

app.patch(`${BASE}/shop/products/:id/image`,
  auth.requireAuth, auth.requireRole('admin', 'super_admin'),
  (req, res) => {
    const p = shop.updateProduct(req.params.id, { imageDataUrl: req.body.imageDataUrl });
    if (!p) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true, product: p });
  }
);

app.delete(`${BASE}/shop/products/:id`,
  auth.requireAuth, auth.requireRole('admin', 'super_admin'),
  (req, res) => {
    shop.deleteProduct(req.params.id);
    res.json({ success: true });
  }
);

app.post(`${BASE}/shop/products/:id/restore`,
  auth.requireAuth, auth.requireRole('admin', 'super_admin'),
  (req, res) => {
    const p = shop.restoreProduct(req.params.id);
    if (!p) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true, product: p });
  }
);

app.post(`${BASE}/shop/products/seed`,
  auth.requireAuth, auth.requireRole('admin', 'super_admin'),
  (req, res) => {
    const result = shop.seedProducts();
    res.json({ success: true, ...result });
  }
);

// ─── Shop: Payments ──────────────────────────────────────────────────────────

app.post(`${BASE}/shop/payments/initiate`, (req, res) => {
  try {
    const payment = shop.initiatePayment(req.body);
    res.json({ success: true, payment });
  } catch (err) { res.status(400).json({ error: err.message }); }
});

app.get(`${BASE}/shop/payments/:ref`, (req, res) => {
  const p = shop.getPayment(req.params.ref);
  if (!p) return res.status(404).json({ error: 'Not found' });
  res.json({ payment: p });
});

app.post(`${BASE}/shop/payments/:ref/confirm`, (req, res) => {
  const p = shop.confirmPayment(req.params.ref, req.body.gatewayRef);
  if (!p) return res.status(404).json({ error: 'Not found' });
  res.json({ success: true, payment: p });
});

app.post(`${BASE}/shop/payments/:ref/fail`,
  auth.requireAuth, auth.requireRole('admin', 'super_admin'),
  (req, res) => {
    const p = shop.failPayment(req.params.ref, req.body.reason);
    if (!p) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true, payment: p });
  }
);

app.get(`${BASE}/shop/payments`,
  auth.requireAuth, auth.requireRole('admin', 'super_admin'),
  (req, res) => {
    const payments = shop.listPayments({ status: req.query.status, method: req.query.method });
    res.json({ payments, count: payments.length });
  }
);

// ─── Shop: Stats ─────────────────────────────────────────────────────────────

app.get(`${BASE}/shop/stats`,
  auth.requireAuth, auth.requireRole('admin', 'super_admin'),
  (req, res) => res.json(shop.getStats())
);

// ─── Orders ──────────────────────────────────────────────────────────────────

app.post(`${BASE}/orders`, (req, res) => {
  try {
    const order = shop.createOrder(req.body);
    res.json({ success: true, message: 'Order received', order });
  } catch (err) { res.status(400).json({ error: err.message }); }
});

app.get(`${BASE}/orders`,
  auth.requireAuth, auth.requireRole('admin', 'super_admin'),
  (req, res) => {
    const orders = shop.listOrders({ status: req.query.status });
    res.json({ orders, count: orders.length });
  }
);

app.patch(`${BASE}/orders/:id/status`,
  auth.requireAuth, auth.requireRole('admin', 'super_admin'),
  (req, res) => {
    const o = shop.updateOrderStatus(req.params.id, req.body.status, req.body.paymentRef);
    if (!o) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true, order: o });
  }
);

// ─── Live Streams ────────────────────────────────────────────────────────────

app.get(`${BASE}/streams`, (req, res) => {
  const list = streams.listStreams({ status: req.query.status, category: req.query.category });
  res.json({ streams: list, count: list.length });
});

app.get(`${BASE}/streams/stats`,
  auth.requireAuth, auth.requireRole('admin', 'super_admin'),
  (req, res) => res.json(streams.getStats())
);

app.get(`${BASE}/streams/:id`, (req, res) => {
  const s = streams.getStream(req.params.id);
  if (!s) return res.status(404).json({ error: 'Not found' });
  res.json({ stream: s });
});

app.post(`${BASE}/streams`,
  auth.requireAuth, auth.requireRole('admin', 'super_admin'),
  (req, res) => {
    try {
      const s = streams.createStream(req.body);
      res.json({ success: true, stream: s });
    } catch (err) { res.status(400).json({ error: err.message }); }
  }
);

app.patch(`${BASE}/streams/:id`,
  auth.requireAuth, auth.requireRole('admin', 'super_admin'),
  (req, res) => {
    const s = streams.updateStream(req.params.id, req.body);
    if (!s) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true, stream: s });
  }
);

app.patch(`${BASE}/streams/:id/status`,
  auth.requireAuth, auth.requireRole('admin', 'super_admin'),
  (req, res) => {
    const s = streams.setStreamStatus(req.params.id, req.body.status);
    if (!s) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true, stream: s });
  }
);

app.delete(`${BASE}/streams/:id`,
  auth.requireAuth, auth.requireRole('admin', 'super_admin'),
  (req, res) => {
    streams.deleteStream(req.params.id);
    res.json({ success: true });
  }
);

app.post(`${BASE}/streams/:id/view`, (req, res) => {
  streams.recordView(req.params.id);
  res.json({ success: true });
});

app.get(`${BASE}/streams/:id/comments`, (req, res) => {
  const comments = streams.listComments(req.params.id);
  res.json({ comments, count: comments.length });
});

app.post(`${BASE}/streams/:id/comments`, (req, res) => {
  const comment = streams.postComment(req.params.id, req.body.name, req.body.message);
  res.json({ success: true, comment });
});

app.delete(`${BASE}/streams/:streamId/comments/:commentId`,
  auth.requireAuth, auth.requireRole('admin', 'super_admin'),
  (req, res) => {
    streams.deleteComment(req.params.streamId, req.params.commentId);
    res.json({ success: true });
  }
);

// ─── Registrations ───────────────────────────────────────────────────────────

app.post(`${BASE}/register/member`, (req, res) => {
  try {
    const reg = registrations.registerMember(req.body);
    res.json({ registration: reg });
  } catch (err) { res.status(400).json({ error: err.message }); }
});

app.get(`${BASE}/register/members`,
  auth.requireAuth, auth.requireRole('admin', 'super_admin'),
  (req, res) => res.json({ members: registrations.listMembers({ status: req.query.status }) })
);

app.get(`${BASE}/register/members/stats`,
  auth.requireAuth, auth.requireRole('admin', 'super_admin'),
  (req, res) => res.json(registrations.getMemberStats())
);

app.patch(`${BASE}/register/members/:id/status`,
  auth.requireAuth, auth.requireRole('admin', 'super_admin'),
  (req, res) => {
    const m = registrations.updateMemberStatus(req.params.id, req.body.status, req.body.note);
    if (!m) return res.status(404).json({ error: 'Not found' });
    res.json({ member: m });
  }
);

app.post(`${BASE}/register/internship`, (req, res) => {
  try {
    const reg = registrations.registerIntern(req.body);
    res.json({ registration: reg });
  } catch (err) { res.status(400).json({ error: err.message }); }
});

app.get(`${BASE}/register/interns`,
  auth.requireAuth, auth.requireRole('admin', 'super_admin'),
  (req, res) => res.json({ interns: registrations.listInterns() })
);

app.post(`${BASE}/register/agent`, (req, res) => {
  try {
    const reg = registrations.registerAgent(req.body);
    res.json({ registration: reg });
  } catch (err) { res.status(400).json({ error: err.message }); }
});

app.get(`${BASE}/register/agents`,
  auth.requireAuth, auth.requireRole('admin', 'super_admin'),
  (req, res) => res.json({ agents: registrations.listAgents() })
);

app.post(`${BASE}/register/cooperative`, (req, res) => {
  try {
    const reg = registrations.registerCoop(req.body);
    res.json({ registration: reg });
  } catch (err) { res.status(400).json({ error: err.message }); }
});

// ─── Election Results ────────────────────────────────────────────────────────

app.post(`${BASE}/results/submit`,
  auth.requireAuth, auth.requireRole('admin', 'super_admin', 'agent'),
  (req, res) => {
    const result = elections.submitResult(req.body, req.user.username);
    res.json({ result });
  }
);

app.get(`${BASE}/results/station/:stationId/:category`, (req, res) => {
  const r = elections.getStationResult(req.params.stationId, req.params.category);
  if (!r) return res.status(404).json({ error: 'No results yet' });
  res.json({ result: r });
});

app.post(`${BASE}/results/verify/:stationId/:category`,
  auth.requireAuth, auth.requireRole('admin', 'super_admin'),
  (req, res) => {
    const r = elections.verifyResult(req.params.stationId, req.params.category, req.user.username);
    if (!r) return res.status(404).json({ error: 'Not found' });
    res.json({ result: r });
  }
);

app.get(`${BASE}/results/aggregated/:category/:level/:id?`, (req, res) => {
  const agg = elections.getAggregated(req.params.category, req.params.level, req.params.id);
  res.json(agg);
});

app.get(`${BASE}/results/summary/:category`, (req, res) => {
  res.json(elections.getSummary(req.params.category));
});

// ─── Press Statements ────────────────────────────────────────────────────────

app.get(`${BASE}/press`, (req, res) => {
  res.json({ statements: press.listStatements() });
});

app.get(`${BASE}/press/years`, (req, res) => {
  res.json({ years: press.getYears() });
});

app.get(`${BASE}/press/admin`,
  auth.requireAuth, auth.requireRole('admin', 'super_admin'),
  (req, res) => res.json({ statements: press.listStatements({ includeUnpublished: true }) })
);

app.get(`${BASE}/press/:id`, (req, res) => {
  const s = press.getStatement(req.params.id);
  if (!s) return res.status(404).json({ error: 'Not found' });
  res.json({ statement: s });
});

app.get(`${BASE}/press/:id/download`, (req, res) => {
  const s = press.getStatement(req.params.id);
  if (!s) return res.status(404).json({ error: 'Not found' });
  const file = press.getStatementFile(req.params.id);
  if (!file) return res.status(404).json({ error: 'No file attached' });

  press.updateStatement(req.params.id, { downloadCount: ((s.downloadCount) || 0) + 1 });

  const [meta, b64] = file.split(',');
  const mime = meta.replace('data:', '').replace(';base64', '');
  res.setHeader('Content-Type', mime);
  res.setHeader('Content-Disposition', `attachment; filename="${s.title || 'statement'}.pdf"`);
  res.send(Buffer.from(b64, 'base64'));
});

app.post(`${BASE}/press`,
  auth.requireAuth, auth.requireRole('admin', 'super_admin'),
  (req, res) => res.json({ statement: press.createStatement(req.body, req.user.username) })
);

app.patch(`${BASE}/press/:id`,
  auth.requireAuth, auth.requireRole('admin', 'super_admin'),
  (req, res) => {
    const s = press.updateStatement(req.params.id, req.body);
    if (!s) return res.status(404).json({ error: 'Not found' });
    res.json({ statement: s });
  }
);

app.delete(`${BASE}/press/:id`,
  auth.requireAuth, auth.requireRole('admin', 'super_admin'),
  (req, res) => {
    press.deleteStatement(req.params.id);
    res.json({ success: true });
  }
);

// ─── Documents ───────────────────────────────────────────────────────────────

app.get(`${BASE}/documents`, (req, res) => {
  res.json({ documents: docs.listDocuments({ category: req.query.category, published: true }) });
});

app.get(`${BASE}/documents/:id`, (req, res) => {
  const d = docs.getDocument(req.params.id);
  if (!d) return res.status(404).json({ error: 'Not found' });
  res.json({ document: d });
});

app.get(`${BASE}/documents/:id/download`, (req, res) => {
  const d = docs.getDocument(req.params.id);
  if (!d) return res.status(404).json({ error: 'Not found' });
  const file = docs.getDocumentFile(req.params.id);
  if (!file) return res.status(404).json({ error: 'No file' });

  docs.incrementDownload(req.params.id);

  const [meta, b64] = file.split(',');
  const mime = meta.replace('data:', '').replace(';base64', '');
  res.setHeader('Content-Type', mime);
  res.setHeader('Content-Disposition', `attachment; filename="${d.fileName || d.title}.${d.fileType || 'pdf'}"`);
  res.send(Buffer.from(b64, 'base64'));
});

app.post(`${BASE}/documents`,
  auth.requireAuth, auth.requireRole('admin', 'super_admin'),
  (req, res) => res.json({ document: docs.createDocument(req.body, req.user.username) })
);

app.patch(`${BASE}/documents/:id`,
  auth.requireAuth, auth.requireRole('admin', 'super_admin'),
  (req, res) => {
    const d = docs.updateDocument(req.params.id, req.body);
    if (!d) return res.status(404).json({ error: 'Not found' });
    res.json({ document: d });
  }
);

app.delete(`${BASE}/documents/:id`,
  auth.requireAuth, auth.requireRole('admin', 'super_admin'),
  (req, res) => {
    docs.deleteDocument(req.params.id);
    res.json({ success: true });
  }
);

// ─── Membership ──────────────────────────────────────────────────────────────
// Aliases to the registrations module for frontend compatibility

app.post(`${BASE}/membership/register`, (req, res) => {
  try {
    const reg = registrations.registerMember(req.body);
    res.json({ member: reg });
  } catch (err) { res.status(400).json({ error: err.message }); }
});

app.get(`${BASE}/membership/me`, auth.requireAuth, (req, res) => {
  const { membershipNumber } = req.query;
  if (!membershipNumber) return res.status(400).json({ error: 'membershipNumber required' });
  const m = registrations.getMemberByMembershipNumber(membershipNumber);
  if (!m) return res.status(404).json({ error: 'Member not found' });
  res.json({ member: m });
});

app.get(`${BASE}/membership/members`,
  auth.requireAuth, auth.requireRole('admin', 'super_admin'),
  (req, res) => res.json({ members: registrations.listMembers() })
);

app.get(`${BASE}/membership/members/:id`,
  auth.requireAuth, auth.requireRole('admin', 'super_admin'),
  (req, res) => {
    const m = registrations.getMember(req.params.id);
    if (!m) return res.status(404).json({ error: 'Member not found' });
    res.json({ member: m });
  }
);

app.get(`${BASE}/membership/stats`,
  auth.requireAuth, auth.requireRole('admin', 'super_admin'),
  (req, res) => res.json(registrations.getMemberStats())
);

app.patch(`${BASE}/membership/members/:id`,
  auth.requireAuth, auth.requireRole('admin', 'super_admin'),
  (req, res) => {
    const m = registrations.updateMember(req.params.id, req.body);
    if (!m) return res.status(404).json({ error: 'Not found' });
    res.json({ member: m });
  }
);

// ─── Election users (manager/agent accounts) ─────────────────────────────────

app.post(`${BASE}/election-users`,
  auth.requireAuth, auth.requireRole('super_admin', 'admin'),
  async (req, res) => {
    try {
      const { password, ...userData } = req.body;
      const user = await auth.registerUser(userData, password || 'TempPass@123');
      res.json({ user });
    } catch (err) { res.status(400).json({ error: err.message }); }
  }
);

app.get(`${BASE}/election-users`,
  auth.requireAuth, auth.requireRole('super_admin', 'admin', 'national_manager'),
  (req, res) => res.json({ users: auth.listUsers() })
);

app.get(`${BASE}/election-users/stats`,
  auth.requireAuth, auth.requireRole('super_admin', 'admin', 'national_manager'),
  (req, res) => {
    const users = auth.listUsers();
    const byRole = {};
    for (const u of users) { byRole[u.role] = (byRole[u.role] || 0) + 1; }
    res.json({ total: users.length, byRole });
  }
);


app.get(`${BASE}/election-users/:id`,
  auth.requireAuth, auth.requireRole('super_admin', 'admin', 'national_manager'),
  (req, res) => {
    const user = auth.listUsers().find(u => u.id === req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
  }
);

app.patch(`${BASE}/election-users/:id`,
  auth.requireAuth, auth.requireRole('super_admin', 'admin'),
  async (req, res) => {
    try {
      const user = await auth.updateUser(req.params.id, req.body);
      res.json({ user });
    } catch (err) { res.status(400).json({ error: err.message }); }
  }
);

app.post(`${BASE}/election-users/:id/reset-password`,
  auth.requireAuth, auth.requireRole('super_admin', 'admin'),
  async (req, res) => {
    try {
      const { password, newPassword } = req.body;
      const pw = password || newPassword;
      if (!pw) return res.status(400).json({ error: 'Password required' });
      // Support both id (UUID) and username
      const users = auth.listUsers();
      const user = users.find(u => u.id === req.params.id || u.username === req.params.id);
      if (!user) return res.status(404).json({ error: 'User not found' });
      await auth.resetPassword(user.id, pw);
      res.json({ success: true });
    } catch (err) { res.status(400).json({ error: err.message }); }
  }
);

app.delete(`${BASE}/election-users/:id`,
  auth.requireAuth, auth.requireRole('super_admin', 'admin'),
  (req, res) => {
    try {
      // Support both id (UUID) and username
      const users = auth.listUsers();
      const user = users.find(u => u.id === req.params.id || u.username === req.params.id);
      if (!user) return res.status(404).json({ error: 'User not found' });
      auth.deleteUser(user.id);
      res.json({ success: true });
    } catch (err) { res.status(400).json({ error: err.message }); }
  }
);

// ── Bulk create election users ───────────────────────────────────────────────
app.post(`${BASE}/election-users/bulk`,
  auth.requireAuth, auth.requireRole('super_admin', 'admin'),
  async (req, res) => {
    const { users = [] } = req.body;
    let created = 0, skipped = 0;
    const errors = [];
    for (const u of users) {
      try {
        const { password, ...userData } = u;
        await auth.registerUser(userData, password || 'TempPass@123');
        created++;
      } catch (e) {
        if (e.message.includes('already exists')) skipped++;
        else errors.push(`${u.username}: ${e.message}`);
      }
    }
    res.json({ created, skipped, errors });
  }
);



// ─── Results Engine ───────────────────────────────────────────────────────────

app.get(`${BASE}/results/dashboard`, (req, res) => res.json({ summary: results.getDashboard() }));
app.get(`${BASE}/results/national/:electionType`, (req, res) => res.json({ result: results.getNational(req.params.electionType) }));
app.get(`${BASE}/results/level/:electionType/:levelType/:levelId`, (req, res) => res.json({ result: results.getLevel(req.params.electionType, req.params.levelType, decodeURIComponent(req.params.levelId)) }));
app.get(`${BASE}/results/breakdown/:electionType/province`, (req, res) => res.json({ breakdown: results.getBreakdown(req.params.electionType, 'provinceId', null, null) }));
app.get(`${BASE}/results/breakdown/:electionType/district/:provinceId`, (req, res) => res.json({ breakdown: results.getBreakdown(req.params.electionType, 'districtId', 'provinceId', decodeURIComponent(req.params.provinceId)) }));
app.get(`${BASE}/results/breakdown/:electionType/constituency/:districtId`, (req, res) => res.json({ breakdown: results.getBreakdown(req.params.electionType, 'constituencyId', 'districtId', decodeURIComponent(req.params.districtId)) }));
app.get(`${BASE}/results/breakdown/:electionType/ward/:constituencyId`, (req, res) => res.json({ breakdown: results.getBreakdown(req.params.electionType, 'wardId', 'constituencyId', decodeURIComponent(req.params.constituencyId)) }));
app.get(`${BASE}/results/leaderboard/:electionType`, (req, res) => res.json({ leaderboard: results.getLeaderboard(req.params.electionType) }));
app.get(`${BASE}/results/coverage`, (req, res) => res.json({ stats: results.getCoverage(req.query.electionType) }));
app.get(`${BASE}/results/heatmap/:electionType`, (req, res) => res.json({ heatmap: results.getHeatmap(req.params.electionType) }));
app.get(`${BASE}/results/trend/:electionType`, (req, res) => res.json({ trend: results.getTrend(req.params.electionType) }));
app.get(`${BASE}/results/live-feed`, (req, res) => res.json({ feed: results.getLiveFeed(parseInt(req.query.limit || '20', 10), req.query.electionType) }));
app.get(`${BASE}/results/compare/:electionType/:levelType/:levelId`, auth.requireAuth, (req, res) => res.json({ comparison: { electionType: req.params.electionType, levelType: req.params.levelType, levelId: req.params.levelId, boz: results.getLevel(req.params.electionType, req.params.levelType, decodeURIComponent(req.params.levelId)), ecz: null, agreementPercent: 100, flagged: false } }));

// ─── ECZ Comparisons ─────────────────────────────────────────────────────────
// In-memory store for ECZ figures entered by managers
const eczStore = { figures: [] };

app.get(`${BASE}/ecz/summary`, auth.requireAuth, (req, res) => {
  const figures = eczStore.figures;
  const byElectionType = {};
  const byLevelType = {};
  let latestUpdated = null;
  figures.forEach(f => {
    byElectionType[f.electionType] = (byElectionType[f.electionType] || 0) + 1;
    byLevelType[f.levelType] = (byLevelType[f.levelType] || 0) + 1;
    if (!latestUpdated || f.updatedAt > latestUpdated) latestUpdated = f.updatedAt;
  });
  res.json({ summary: { total: figures.length, byElectionType, byLevelType, latestUpdated }, count: figures.length });
});

app.get(`${BASE}/ecz/comparisons`, auth.requireAuth, (req, res) => {
  let figures = [...eczStore.figures];
  if (req.query.electionType) figures = figures.filter(f => f.electionType === req.query.electionType);
  if (req.query.levelType)    figures = figures.filter(f => f.levelType === req.query.levelType);
  if (req.query.flaggedOnly === 'true') figures = figures.filter(f => f.isFlagged);
  const meta = {
    total: figures.length,
    withDiscrepancy: figures.filter(f => f.hasDiscrepancy).length,
    flagged: figures.filter(f => f.isFlagged).length,
    fullyMatching: figures.filter(f => !f.hasDiscrepancy).length,
  };
  res.json({ comparisons: figures, meta });
});

app.get(`${BASE}/ecz/comparison/:electionType/:levelType/:levelId`, auth.requireAuth, (req, res) => {
  const fig = eczStore.figures.find(f =>
    f.electionType === req.params.electionType &&
    f.levelType === req.params.levelType &&
    f.levelId === decodeURIComponent(req.params.levelId)
  );
  if (!fig) return res.status(404).json({ error: 'No ECZ comparison found for this level' });
  res.json({ comparison: fig });
});

app.post(`${BASE}/ecz/bulk-save`, auth.requireAuth, (req, res) => {
  const figures = req.body.figures || [];
  let saved = 0, failed = 0;
  const errors = [];
  figures.forEach(f => {
    try {
      const now = new Date().toISOString();
      const existing = eczStore.figures.findIndex(e => e.electionType === f.electionType && e.levelType === f.levelType && e.levelId === f.levelId);
      const entry = { ...f, id: f.id || `ecz-${Date.now()}-${Math.random().toString(36).slice(2)}`, savedAt: f.savedAt || now, updatedAt: now, enteredBy: req.user.username };
      if (existing >= 0) { eczStore.figures[existing] = entry; } else { eczStore.figures.push(entry); }
      saved++;
    } catch (e) { failed++; errors.push(e.message); }
  });
  res.json({ success: true, saved, failed, errors });
});

app.get(`${BASE}/ecz/discrepancy-analysis/:electionType/:levelType/:levelId`, auth.requireAuth, (req, res) => {
  res.json({ electionType: req.params.electionType, levelType: req.params.levelType, levelId: decodeURIComponent(req.params.levelId), candidates: [], summary: { totalDiff: 0, hasDiscrepancy: false } });
});

// ─── Voter Roll ───────────────────────────────────────────────────────────────
app.get(`${BASE}/voter-roll`, auth.requireAuth, (req, res) => {
  res.json({ meta: null });
});

// ─── Data Entry ───────────────────────────────────────────────────────────────

const dataEntryStore = {
  submissions: kv.get('data-entry:submissions') || [],
  eczFigures:  kv.get('data-entry:ecz-figures') || [],
  auditLog:    kv.get('data-entry:audit-log') || [],
};

function saveDataEntry() {
  kv.set('data-entry:submissions', dataEntryStore.submissions);
  kv.set('data-entry:ecz-figures', dataEntryStore.eczFigures);
  kv.set('data-entry:audit-log',   dataEntryStore.auditLog);
}

// Submit result
app.post(`${BASE}/data-entry/result`, async (req, res) => {
  try {
    const { pollingStationId, electionType, candidates, totalVotesCast, totalRejectedBallots, totalVoterTurnout, agentId, agentName, notes } = req.body;
    if (!pollingStationId || !electionType) return res.status(400).json({ error: 'pollingStationId and electionType required' });
    const id = `sub-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const submission = { id, pollingStationId, electionType, candidates: candidates || [], totalVotesCast, totalRejectedBallots, totalVoterTurnout, agentId, agentName, notes, status: 'pending', submittedAt: new Date().toISOString() };
    dataEntryStore.submissions.push(submission);
    saveDataEntry();
    res.json({ success: true, message: 'Result submitted successfully', submission: { id, submittedAt: submission.submittedAt, status: 'pending' } });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Get turnout
app.get(`${BASE}/data-entry/turnout`, (req, res) => {
  res.json({ stats: { totalStations: 0, reportingStations: dataEntryStore.submissions.length, totalVotesCast: 0 } });
});

// Check if result submitted for a station
app.get(`${BASE}/data-entry/result/:pollingStationId/:electionType`, (req, res) => {
  const sub = dataEntryStore.submissions.find(s =>
    s.pollingStationId === decodeURIComponent(req.params.pollingStationId) &&
    s.electionType === req.params.electionType
  );
  res.json({ submitted: !!sub, submittedAt: sub?.submittedAt, status: sub?.status, id: sub?.id });
});

// List submissions (admin)
app.get(`${BASE}/data-entry/submissions`, auth.requireAuth, (req, res) => {
  let subs = [...dataEntryStore.submissions];
  if (req.query.status)        subs = subs.filter(s => s.status === req.query.status);
  if (req.query.electionType)  subs = subs.filter(s => s.electionType === req.query.electionType);
  if (req.query.pollingStationId) subs = subs.filter(s => s.pollingStationId === req.query.pollingStationId);
  res.json({ submissions: subs, count: subs.length });
});

// Get single submission
app.get(`${BASE}/data-entry/submissions/:id`, auth.requireAuth, (req, res) => {
  const sub = dataEntryStore.submissions.find(s => s.id === req.params.id);
  if (!sub) return res.status(404).json({ error: 'Submission not found' });
  res.json({ submission: sub });
});

// Update submission status (approve/reject)
app.patch(`${BASE}/data-entry/submissions/:id/status`, auth.requireAuth, (req, res) => {
  const idx = dataEntryStore.submissions.findIndex(s => s.id === req.params.id);
  if (idx < 0) return res.status(404).json({ error: 'Submission not found' });
  dataEntryStore.submissions[idx] = { ...dataEntryStore.submissions[idx], status: req.body.status, notes: req.body.notes, reviewedAt: new Date().toISOString(), reviewedBy: req.user?.username };
  saveDataEntry();
  res.json({ success: true, submission: dataEntryStore.submissions[idx] });
});

// Stats
app.get(`${BASE}/data-entry/stats`, auth.requireAuth, (req, res) => {
  const subs = dataEntryStore.submissions;
  res.json({ stats: { total: subs.length, pending: subs.filter(s => s.status === 'pending').length, approved: subs.filter(s => s.status === 'approved').length, rejected: subs.filter(s => s.status === 'rejected').length } });
});

// Save ECZ figures
app.post(`${BASE}/data-entry/ecz-figures`, auth.requireAuth, (req, res) => {
  const { levelType, levelId, electionType, candidates, totalVotes, source, notes } = req.body;
  if (!levelType || !levelId || !electionType) return res.status(400).json({ error: 'levelType, levelId, electionType required' });
  const existing = dataEntryStore.eczFigures.findIndex(f => f.levelType === levelType && f.levelId === levelId && f.electionType === electionType);
  const figure = { levelType, levelId, electionType, candidates: candidates || [], totalVotes, source, notes, savedAt: new Date().toISOString(), savedBy: req.user?.username };
  if (existing >= 0) dataEntryStore.eczFigures[existing] = figure;
  else dataEntryStore.eczFigures.push(figure);
  saveDataEntry();
  res.json({ success: true, figure });
});

// Get ECZ figure
app.get(`${BASE}/data-entry/ecz-figures/:levelType/:levelId/:electionType`, auth.requireAuth, (req, res) => {
  const figure = dataEntryStore.eczFigures.find(f =>
    f.levelType === req.params.levelType &&
    f.levelId === decodeURIComponent(req.params.levelId) &&
    f.electionType === req.params.electionType
  );
  res.json({ exists: !!figure, figure: figure || null });
});

// List ECZ figures
app.get(`${BASE}/data-entry/ecz-figures`, auth.requireAuth, (req, res) => {
  let figs = [...dataEntryStore.eczFigures];
  if (req.query.electionType) figs = figs.filter(f => f.electionType === req.query.electionType);
  if (req.query.levelType) figs = figs.filter(f => f.levelType === req.query.levelType);
  res.json({ figures: figs, count: figs.length });
});

// Delete ECZ figure
app.delete(`${BASE}/data-entry/ecz-figures/:levelType/:levelId/:electionType`, auth.requireAuth, (req, res) => {
  const before = dataEntryStore.eczFigures.length;
  dataEntryStore.eczFigures = dataEntryStore.eczFigures.filter(f =>
    !(f.levelType === req.params.levelType && f.levelId === decodeURIComponent(req.params.levelId) && f.electionType === req.params.electionType)
  );
  saveDataEntry();
  res.json({ success: dataEntryStore.eczFigures.length < before });
});

// Audit log
app.get(`${BASE}/data-entry/audit-log`, auth.requireAuth, (req, res) => {
  const limit = parseInt(req.query.limit || '50', 10);
  res.json({ entries: dataEntryStore.auditLog.slice(-limit), count: dataEntryStore.auditLog.length });
});


// ─── Events ───────────────────────────────────────────────────────────────────

const eventsStore = { events: kv.get('events') || [] };
function saveEvents() { kv.set('events', eventsStore.events); }

app.get(`${BASE}/events`, (req, res) => {
  let evts = [...eventsStore.events];
  if (req.query.status) evts = evts.filter(e => e.status === req.query.status);
  res.json({ events: evts, count: evts.length });
});

app.get(`${BASE}/events/:id`, (req, res) => {
  const evt = eventsStore.events.find(e => e.id === req.params.id);
  if (!evt) return res.status(404).json({ error: 'Event not found' });
  res.json({ event: evt });
});

app.get(`${BASE}/events/:id/photo`, (req, res) => {
  const photo = kv.get(`events:photo:${req.params.id}`);
  if (!photo) return res.status(404).json({ error: 'No photo' });
  const [meta, b64] = photo.split(',');
  const mime = meta.replace('data:', '').replace(';base64', '');
  res.setHeader('Content-Type', mime);
  res.send(Buffer.from(b64, 'base64'));
});

app.post(`${BASE}/events`, auth.requireAuth, (req, res) => {
  const { imageDataUrl, ...rest } = req.body;
  const id = `evt-${Date.now()}`;
  const evt = { ...rest, id, createdAt: new Date().toISOString(), status: rest.status || 'upcoming', hasPhoto: !!imageDataUrl };
  if (imageDataUrl) kv.set(`events:photo:${id}`, imageDataUrl);
  eventsStore.events.push(evt);
  saveEvents();
  res.json({ event: evt });
});

app.patch(`${BASE}/events/:id`, auth.requireAuth, (req, res) => {
  const idx = eventsStore.events.findIndex(e => e.id === req.params.id);
  if (idx < 0) return res.status(404).json({ error: 'Event not found' });
  const { imageDataUrl, ...rest } = req.body;
  if (imageDataUrl) kv.set(`events:photo:${req.params.id}`, imageDataUrl);
  eventsStore.events[idx] = { ...eventsStore.events[idx], ...rest, ...(imageDataUrl ? { hasPhoto: true } : {}), updatedAt: new Date().toISOString() };
  saveEvents();
  res.json({ event: eventsStore.events[idx] });
});

app.delete(`${BASE}/events/:id`, auth.requireAuth, (req, res) => {
  eventsStore.events = eventsStore.events.filter(e => e.id !== req.params.id);
  kv.del(`events:photo:${req.params.id}`);
  saveEvents();
  res.json({ success: true });
});

// ─── Registrations ────────────────────────────────────────────────────────────

const regStore = {
  member:      kv.get('reg:member')      || [],
  cooperative: kv.get('reg:cooperative') || [],
  agent:       kv.get('reg:agent')       || [],
  internship:  kv.get('reg:internship')  || [],
};
function saveReg(type) { kv.set(`reg:${type}`, regStore[type]); }

function regRoutes(type, noun) {
  app.post(`${BASE}/registrations/${type}`, (req, res) => {
    const reg = { ...req.body, id: `${type}-${Date.now()}`, status: 'pending', submittedAt: new Date().toISOString() };
    regStore[type].push(reg);
    saveReg(type);
    res.json({ success: true, message: `${noun} registration submitted`, registration: reg });
  });

  app.get(`${BASE}/registrations/${type}`, auth.requireAuth, (req, res) => {
    let regs = [...regStore[type]];
    if (req.query.status) regs = regs.filter(r => r.status === req.query.status);
    res.json({ registrations: regs, count: regs.length });
  });

  app.patch(`${BASE}/registrations/${type}/:id/status`, auth.requireAuth, (req, res) => {
    const idx = regStore[type].findIndex(r => r.id === req.params.id);
    if (idx < 0) return res.status(404).json({ error: 'Registration not found' });
    regStore[type][idx] = { ...regStore[type][idx], status: req.body.status, notes: req.body.notes, reviewedAt: new Date().toISOString() };
    saveReg(type);
    res.json({ success: true, registration: regStore[type][idx] });
  });
}

regRoutes('member',      'Member');
regRoutes('cooperative', 'Cooperative');
regRoutes('agent',       'Agent');
regRoutes('internship',  'Internship');

app.get(`${BASE}/registrations/stats`, auth.requireAuth, (req, res) => {
  const stats = {};
  for (const [type, regs] of Object.entries(regStore)) {
    stats[type] = { total: regs.length, pending: regs.filter(r => r.status === 'pending').length, approved: regs.filter(r => r.status === 'approved').length, rejected: regs.filter(r => r.status === 'rejected').length };
  }
  res.json({ success: true, stats });
});

// ─── Donations ────────────────────────────────────────────────────────────────

const donationStore = { donations: kv.get('donations') || [] };
function saveDonations() { kv.set('donations', donationStore.donations); }

app.post(`${BASE}/donations`, (req, res) => {
  const donation = { ...req.body, id: `don-${Date.now()}`, status: 'pending', createdAt: new Date().toISOString() };
  donationStore.donations.push(donation);
  saveDonations();
  res.json({ success: true, message: 'Donation initiated', donation });
});

app.get(`${BASE}/donations`, auth.requireAuth, (req, res) => {
  const donations = donationStore.donations;
  const total = donations.filter(d => d.status === 'completed').reduce((s, d) => s + (d.amount || 0), 0);
  const byMethod = {};
  donations.forEach(d => { if (d.method) byMethod[d.method] = (byMethod[d.method] || 0) + 1; });
  res.json({ donations, count: donations.length, stats: { total, count: donations.length, byMethod } });
});

app.patch(`${BASE}/donations/:id/status`, auth.requireAuth, (req, res) => {
  const idx = donationStore.donations.findIndex(d => d.id === req.params.id);
  if (idx < 0) return res.status(404).json({ error: 'Donation not found' });
  donationStore.donations[idx] = { ...donationStore.donations[idx], status: req.body.status, updatedAt: new Date().toISOString() };
  saveDonations();
  res.json({ success: true, donation: donationStore.donations[idx] });
});

// ─── Contact ──────────────────────────────────────────────────────────────────

const contactStore = { messages: kv.get('contact') || [] };
function saveContact() { kv.set('contact', contactStore.messages); }

app.post(`${BASE}/contact`, (req, res) => {
  const msg = { ...req.body, id: `msg-${Date.now()}`, read: false, createdAt: new Date().toISOString() };
  contactStore.messages.push(msg);
  saveContact();
  res.json({ success: true, message: 'Message received' });
});

app.get(`${BASE}/contact`, auth.requireAuth, (req, res) => {
  const messages = contactStore.messages;
  res.json({ messages, count: messages.length, unread: messages.filter(m => !m.read).length });
});

app.patch(`${BASE}/contact/:id/read`, auth.requireAuth, (req, res) => {
  const idx = contactStore.messages.findIndex(m => m.id === req.params.id);
  if (idx < 0) return res.status(404).json({ error: 'Message not found' });
  contactStore.messages[idx] = { ...contactStore.messages[idx], read: true };
  saveContact();
  res.json({ success: true });
});

// ─── Membership — adoption & order linking (extends the canonical alias block above) ──

app.post(`${BASE}/membership/members/:id/grant-adoption`, auth.requireAuth, auth.requireRole('admin', 'super_admin'), (req, res) => {
  const {
    grantedByTitle, electionPosition, electionYear,
    adoptionProvince, adoptionDistrict, adoptionConstituency, adoptionWard, reason,
  } = req.body;
  const certNumber = `BOZ-ADOPT-${electionYear || new Date().getFullYear()}-${req.params.id.slice(-6).toUpperCase()}`;
  const member = registrations.updateMember(req.params.id, {
    adoptionGranted: true,
    adoptionGrantedAt: new Date().toISOString(),
    adoptionGrantedBy: req.user?.username,
    adoptionGrantedByTitle: grantedByTitle,
    adoptionReason: reason,
    adoptionCertNumber: certNumber,
    electionPosition, electionYear,
    adoptionProvince, adoptionDistrict, adoptionConstituency, adoptionWard,
  });
  if (!member) return res.status(404).json({ error: 'Member not found' });
  res.json({ success: true, member });
});

app.post(`${BASE}/membership/members/:id/revoke-adoption`, auth.requireAuth, auth.requireRole('admin', 'super_admin'), (req, res) => {
  const member = registrations.updateMember(req.params.id, {
    adoptionGranted: false,
    adoptionRevokedAt: new Date().toISOString(),
    adoptionRevokedBy: req.user?.username,
  });
  if (!member) return res.status(404).json({ error: 'Member not found' });
  res.json({ success: true, member });
});

app.post(`${BASE}/membership/members/:id/link-order`, auth.requireAuth, (req, res) => {
  const member = registrations.updateMember(req.params.id, { orderId: req.body.orderId });
  if (!member) return res.status(404).json({ error: 'Member not found' });
  res.json({ success: true, member });
});

app.get(`${BASE}/membership/certificate/membership`, auth.requireAuth, (req, res) => {
  res.json({ certificateUrl: null, message: 'Certificate generation not yet configured' });
});

app.get(`${BASE}/membership/certificate/adoption`, auth.requireAuth, (req, res) => {
  res.json({ certificateUrl: null, message: 'Certificate generation not yet configured' });
});

app.get(`${BASE}/registrations/validate-membership`, auth.requireAuth, (req, res) => {
  const m = registrations.getMemberByMembershipNumber(req.query.number);
  if (!m) return res.json({ valid: false, error: 'No member found with that number' });
  res.json({ valid: true, fullName: `${m.firstName || ''} ${m.lastName || ''}`.trim(), membershipNumber: m.membershipNumber, status: m.status });
});

app.post(`${BASE}/registrations/validate-memberships`, auth.requireAuth, (req, res) => {
  const { numbers = [] } = req.body;
  const results = {};
  let invalidCount = 0;
  const invalidNumbers = [];
  for (const num of numbers) {
    const m = registrations.getMemberByMembershipNumber(num);
    if (m) {
      results[num] = { valid: true, fullName: `${m.firstName || ''} ${m.lastName || ''}`.trim() };
    } else {
      results[num] = { valid: false, error: 'Not found' };
      invalidCount++;
      invalidNumbers.push(num);
    }
  }
  res.json({ results, invalidCount, invalidNumbers });
});


// ─── Candidates Seed ─────────────────────────────────────────────────────────
app.post(`${BASE}/candidates/seed`, auth.requireAuth, auth.requireRole('super_admin','admin'), async (req, res) => {
  try {
    const result = await candidates.seedDefault();
    res.json({ success: true, seeded: result });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// ─── Documents Stats ─────────────────────────────────────────────────────────
app.get(`${BASE}/documents/stats`, auth.requireAuth, (req, res) => {
  try {
    const list = docs.list ? docs.list() : [];
    res.json({ total: list.length, byType: {} });
  } catch(e) { res.json({ total: 0, byType: {} }); }
});

// ─── Gateway Config ──────────────────────────────────────────────────────────
app.get(`${BASE}/gateway/config`, (req, res) => {
  res.json({
    config: {
      flutterwaveEnabled: !!process.env.FLUTTERWAVE_SECRET_KEY,
      resendEnabled:      !!process.env.RESEND_API_KEY,
      twilioEnabled:      !!process.env.TWILIO_ACCOUNT_SID,
      publicKey:          process.env.FLUTTERWAVE_PUBLIC_KEY || null,
      siteUrl:            process.env.SITE_URL || '',
    }
  });
});

// ─── Security ────────────────────────────────────────────────────────────────
const secStore = { blockedIPs: kv.get('security:blocked-ips') || [], sessions: kv.get('security:sessions') || [] };
function saveSec() { kv.set('security:blocked-ips', secStore.blockedIPs); kv.set('security:sessions', secStore.sessions); }

app.get(`${BASE}/security/stats`, auth.requireAuth, auth.requireRole('super_admin','admin'), (req, res) => {
  res.json({ blockedIPs: secStore.blockedIPs.length, activeSessions: secStore.sessions.length, failedLogins: kv.get('security:failed-logins') || 0 });
});

app.get(`${BASE}/security/sessions`, auth.requireAuth, auth.requireRole('super_admin','admin'), (req, res) => {
  res.json({ sessions: secStore.sessions });
});

app.delete(`${BASE}/security/sessions/all`, auth.requireAuth, auth.requireRole('super_admin','admin'), (req, res) => {
  secStore.sessions = [];
  saveSec();
  res.json({ success: true });
});

app.get(`${BASE}/security/blocked-ips`, auth.requireAuth, auth.requireRole('super_admin','admin'), (req, res) => {
  res.json({ blockedIPs: secStore.blockedIPs });
});

app.post(`${BASE}/security/block-ip`, auth.requireAuth, auth.requireRole('super_admin','admin'), (req, res) => {
  const { ip, reason } = req.body;
  if (!ip) return res.status(400).json({ error: 'IP required' });
  if (!secStore.blockedIPs.find(b => b.ip === ip)) {
    secStore.blockedIPs.push({ ip, reason, blockedAt: new Date().toISOString(), blockedBy: req.user?.username });
    saveSec();
  }
  res.json({ success: true });
});

app.delete(`${BASE}/security/blocked-ips/:ip`, auth.requireAuth, auth.requireRole('super_admin','admin'), (req, res) => {
  secStore.blockedIPs = secStore.blockedIPs.filter(b => b.ip !== req.params.ip);
  saveSec();
  res.json({ success: true });
});

app.post(`${BASE}/security/change-password`, auth.requireAuth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) return res.status(400).json({ error: 'Both passwords required' });
    const storedHash = kv.get(`password:${req.user.username}`);
    const verified = await auth.verifyPassword(currentPassword, storedHash);
    if (!verified) return res.status(401).json({ error: 'Current password incorrect' });
    await auth.changePassword(req.user.username, newPassword);
    res.json({ success: true, message: 'Password changed successfully' });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

app.post(`${BASE}/security/deactivate-user`, auth.requireAuth, auth.requireRole('super_admin','admin'), async (req, res) => {
  try {
    const { username } = req.body;
    await auth.updateUser(auth.getUser(username)?.id, { active: false });
    res.json({ success: true });
  } catch(e) { res.status(400).json({ error: e.message }); }
});

app.post(`${BASE}/security/unlock-account`, auth.requireAuth, auth.requireRole('super_admin','admin'), async (req, res) => {
  try {
    const { username } = req.body;
    await auth.updateUser(auth.getUser(username)?.id, { active: true, lockedUntil: null });
    res.json({ success: true });
  } catch(e) { res.status(400).json({ error: e.message }); }
});

// ─── Voter Roll Verify ───────────────────────────────────────────────────────
app.post(`${BASE}/voter-roll/verify`, (req, res) => {
  const { nrc, name } = req.body;
  const roll = kv.get('voter-roll:data') || [];
  const voter = roll.find(v => v.nrc === nrc || (name && v.name?.toLowerCase().includes(name.toLowerCase())));
  res.json({ found: !!voter, voter: voter || null });
});

// ─── Chambers ────────────────────────────────────────────────────────────────
const chamberStore = { chambers: kv.get('chambers') || [] };
function saveChambers() { kv.set('chambers', chamberStore.chambers); }

app.get(`${BASE}/chambers`, (req, res) => {
  res.json({ chambers: chamberStore.chambers, count: chamberStore.chambers.length });
});

app.get(`${BASE}/chambers/stats`, auth.requireAuth, (req, res) => {
  res.json({ total: chamberStore.chambers.length, active: chamberStore.chambers.filter(c => c.active).length });
});

app.post(`${BASE}/chambers`, auth.requireAuth, (req, res) => {
  const chamber = { ...req.body, id: `ch-${Date.now()}`, createdAt: new Date().toISOString(), active: true };
  chamberStore.chambers.push(chamber);
  saveChambers();
  res.json({ chamber });
});

app.patch(`${BASE}/chambers/:id`, auth.requireAuth, (req, res) => {
  const idx = chamberStore.chambers.findIndex(c => c.id === req.params.id);
  if (idx < 0) return res.status(404).json({ error: 'Chamber not found' });
  chamberStore.chambers[idx] = { ...chamberStore.chambers[idx], ...req.body, updatedAt: new Date().toISOString() };
  saveChambers();
  res.json({ chamber: chamberStore.chambers[idx] });
});

app.delete(`${BASE}/chambers/:id`, auth.requireAuth, (req, res) => {
  chamberStore.chambers = chamberStore.chambers.filter(c => c.id !== req.params.id);
  saveChambers();
  res.json({ success: true });
});

app.get(`${BASE}/chambers/amendments`, (req, res) => {
  res.json({ amendments: kv.get('chambers:amendments') || [] });
});

// ─── Email Test ───────────────────────────────────────────────────────────────
app.post(`${BASE}/email/test`, auth.requireAuth, auth.requireRole('super_admin','admin'), async (req, res) => {
  try {
    if (!process.env.RESEND_API_KEY) return res.status(400).json({ error: 'RESEND_API_KEY not configured', configured: false });
    const { to } = req.body;
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: process.env.EMAIL_FROM_ADDRESS || 'no-reply@bozplans.org', to: to || process.env.ADMIN_EMAIL, subject: 'BOZ Email Test', html: '<p>Email service is working correctly.</p>' })
    });
    const data = await r.json();
    if (r.ok) res.json({ success: true, message: 'Test email sent', id: data.id });
    else res.status(400).json({ error: data.message || 'Email send failed', configured: true });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// ─── Results Cache Invalidate ─────────────────────────────────────────────────
app.post(`${BASE}/results/cache/invalidate`, auth.requireAuth, auth.requireRole('super_admin','admin'), (req, res) => {
  // Clear any cached results
  const keys = ['results:cache:presidential','results:cache:mp','results:cache:mayoral','results:cache:councillor'];
  keys.forEach(k => kv.del ? kv.del(k) : null);
  res.json({ success: true, message: 'Results cache invalidated', clearedKeys: keys.length });
});

// ─── OTP ─────────────────────────────────────────────────────────────────────
const otpStore = {};
app.post(`${BASE}/otp/send`, async (req, res) => {
  try {
    const { phone, email } = req.body;
    if (!phone && !email) return res.status(400).json({ error: 'Phone or email required' });
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const key = phone || email;
    otpStore[key] = { otp, expiresAt: Date.now() + 10 * 60 * 1000 };
    // TODO: Send via Twilio/Resend when keys are configured
    const sent = !!(process.env.TWILIO_ACCOUNT_SID || process.env.RESEND_API_KEY);
    console.log(`OTP for ${key}: ${otp}`); // Log for debugging
    res.json({ success: true, sent, message: sent ? 'OTP sent' : 'OTP generated (SMS/Email not configured)', ...(process.env.NODE_ENV !== 'production' ? { otp } : {}) });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

app.post(`${BASE}/otp/verify`, (req, res) => {
  const { phone, email, otp } = req.body;
  const key = phone || email;
  const stored = otpStore[key];
  if (!stored) return res.status(400).json({ error: 'No OTP found. Request a new one.' });
  if (Date.now() > stored.expiresAt) { delete otpStore[key]; return res.status(400).json({ error: 'OTP expired' }); }
  if (stored.otp !== otp) return res.status(400).json({ error: 'Invalid OTP' });
  delete otpStore[key];
  res.json({ success: true, verified: true });
});


// ─── Email config endpoint ────────────────────────────────────────────────────
app.get(`${BASE}/email/config`, auth.requireAuth, auth.requireRole('super_admin', 'admin'), (req, res) => {
  const key = process.env.RESEND_API_KEY || '';
  res.json({
    connected: !!key,
    keyPreview: key ? `re_...${key.slice(-6)}` : null,
    fromName: process.env.EMAIL_FROM_NAME || 'Build One Zambia',
    fromEmail: process.env.EMAIL_FROM_ADDRESS || 'noreply@bozplans.org',
    adminEmail: process.env.ADMIN_EMAIL || '',
    siteUrl: process.env.SITE_URL || 'https://www.bozplans.org',
    provider: 'Resend',
    configured: !!key,
  });
});

// ─── Shadow Cabinet ────────────────────────────────────────────────────────────

const shadowStore = {
  male:   kv.get('shadow:male')   || [],
  female: kv.get('shadow:female') || [],
};
function saveShadow(gender) { kv.set(`shadow:${gender}`, shadowStore[gender]); }

app.get(`${BASE}/shadow-cabinet/:gender`, (req, res) => {
  const g = req.params.gender;
  if (!['male','female'].includes(g)) return res.status(400).json({ error: 'gender must be male or female' });
  res.json({ members: shadowStore[g], count: shadowStore[g].length });
});

app.get(`${BASE}/shadow-cabinet/:gender/:id`, (req, res) => {
  const g = req.params.gender;
  if (!['male','female'].includes(g)) return res.status(400).json({ error: 'invalid gender' });
  const member = shadowStore[g].find(m => m.id === req.params.id);
  if (!member) return res.status(404).json({ error: 'Member not found' });
  res.json({ member });
});

app.get(`${BASE}/shadow-cabinet/:gender/:id/photo`, (req, res) => {
  const photo = kv.get(`shadow:photo:${req.params.id}`);
  if (!photo) return res.status(404).json({ error: 'No photo' });
  const [meta, b64] = photo.split(',');
  const mime = meta.replace('data:', '').replace(';base64', '');
  res.setHeader('Content-Type', mime);
  res.send(Buffer.from(b64, 'base64'));
});

app.post(`${BASE}/shadow-cabinet/:gender`, auth.requireAuth, auth.requireRole('super_admin', 'admin'), (req, res) => {
  const g = req.params.gender;
  if (!['male','female'].includes(g)) return res.status(400).json({ error: 'invalid gender' });
  const { photoDataUrl, ...rest } = req.body;
  const id = `sc-${Date.now()}-${Math.random().toString(36).slice(2,6)}`;
  const member = { ...rest, id, gender: g, hasPhoto: !!photoDataUrl, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
  if (photoDataUrl) kv.set(`shadow:photo:${id}`, photoDataUrl);
  shadowStore[g].push(member);
  saveShadow(g);
  res.json({ member });
});

app.patch(`${BASE}/shadow-cabinet/:gender/reorder`, auth.requireAuth, auth.requireRole('super_admin', 'admin'), (req, res) => {
  const g = req.params.gender;
  if (!['male','female'].includes(g)) return res.status(400).json({ error: 'invalid gender' });
  const { ids } = req.body;
  if (!Array.isArray(ids)) return res.status(400).json({ error: 'ids must be an array' });
  const map = Object.fromEntries(shadowStore[g].map(m => [m.id, m]));
  shadowStore[g] = ids.map(id => map[id]).filter(Boolean);
  saveShadow(g);
  res.json({ success: true, count: shadowStore[g].length });
});

app.patch(`${BASE}/shadow-cabinet/:gender/:id`, auth.requireAuth, auth.requireRole('super_admin', 'admin'), (req, res) => {
  const g = req.params.gender;
  if (!['male','female'].includes(g)) return res.status(400).json({ error: 'invalid gender' });
  const idx = shadowStore[g].findIndex(m => m.id === req.params.id);
  if (idx < 0) return res.status(404).json({ error: 'Member not found' });
  const { photoDataUrl, ...rest } = req.body;
  if (photoDataUrl) { kv.set(`shadow:photo:${req.params.id}`, photoDataUrl); rest.hasPhoto = true; }
  shadowStore[g][idx] = { ...shadowStore[g][idx], ...rest, updatedAt: new Date().toISOString() };
  saveShadow(g);
  res.json({ member: shadowStore[g][idx] });
});

app.delete(`${BASE}/shadow-cabinet/:gender/:id`, auth.requireAuth, auth.requireRole('super_admin', 'admin'), (req, res) => {
  const g = req.params.gender;
  if (!['male','female'].includes(g)) return res.status(400).json({ error: 'invalid gender' });
  shadowStore[g] = shadowStore[g].filter(m => m.id !== req.params.id);
  kv.del(`shadow:photo:${req.params.id}`);
  saveShadow(g);
  res.json({ success: true });
});


// ─── 404 catch-all ───────────────────────────────────────────────────────────

app.use((req, res) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.path}` });
});

// ─── Error handler ───────────────────────────────────────────────────────────

app.use((err, req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

// ─── Start ───────────────────────────────────────────────────────────────────

app.listen(PORT, '0.0.0.0', () => {
  const railwayService = process.env.RAILWAY_SERVICE_NAME || '(unknown-service)';
  const railwayEnv    = process.env.RAILWAY_ENVIRONMENT  || 'local';
  const internalHost  = `${railwayService}.railway.internal`;

  console.log(`\n🇿🇲  Build One Zambia Backend`);
  console.log(`   ✅  Server running on http://0.0.0.0:${PORT}`);
  console.log(`   🚂  Railway service : ${railwayService}`);
  console.log(`   🌍  Environment     : ${railwayEnv}`);
  console.log(`   🔌  PORT (Railway)  : ${PORT}`);
  console.log(`   🔗  Private net URL : http://${internalHost}:${PORT}`);
  console.log(`   ──────────────────────────────────────────────`);
  console.log(`   👉  Set BACKEND_URL in the frontend service to:`);
  console.log(`       http://${internalHost}:${PORT}`);
  console.log(`   ──────────────────────────────────────────────`);
  console.log(`   📁  Database: ${IS_RAILWAY ? '/tmp/boz-data' : './data'}/kv.json`);
  console.log(`   🖼   Uploads:  ${UPLOADS_DIR}`);
  console.log(`   🔑  Admin:    username=${process.env.ADMIN_USERNAME || 'superadmin'}\n`);
});

export default app;

// cache-bust: 20260627-225912
// Sun Jun 28 16:54:37 UTC 2026
// force-redeploy: 20260630 — Route not found: POST /data-entry/result reported in prod,
// confirms Railway backend service is running a stale build predating commit 8be9b71
// (kv import fix) and 86249ec/1cb1d33 (data-entry routes). This comment forces a new
// commit SHA so Railway's GitHub webhook has a fresh push event to deploy from.
