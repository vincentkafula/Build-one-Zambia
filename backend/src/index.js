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
import rateLimit from 'express-rate-limit';
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

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = parseInt(process.env.PORT || '3001', 10);
const BASE = '/make-server-8fca9621'; // Keep the same path prefix as original

const app = express();

// ─── Security & parsing ──────────────────────────────────────────────────────

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: false, // frontend handles CSP
}));

app.use(cors({
  origin: (origin, cb) => {
    const allowed = [
      'https://bozplans.org',
      'https://www.bozplans.org',
      // Allow any URL set via env var (e.g. Railway custom domain for frontend)
      ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : []),
      ...(process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',').map(s => s.trim()) : []),
    ].filter(Boolean);
    if (
      !origin ||
      allowed.includes(origin) ||
      origin.startsWith('http://localhost') ||
      origin.startsWith('http://127.0.0.1') ||
      origin.includes('vercel.app') ||
      origin.includes('netlify.app') ||
      origin.includes('railway.app') ||
      origin.includes('up.railway.app')
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

// Global rate limit
app.use(rateLimit({ windowMs: 60_000, max: 300, standardHeaders: true, legacyHeaders: false }));

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

// ─── Health ──────────────────────────────────────────────────────────────────

app.get(`${BASE}/health`, (req, res) => {
  res.json({ status: 'ok', server: 'node-express', version: '1.0.0', timestamp: new Date().toISOString() });
});

// ─── Auth ────────────────────────────────────────────────────────────────────

app.post(`${BASE}/auth/login`,
  rateLimit({ windowMs: 15 * 60_000, max: 10, standardHeaders: true, legacyHeaders: false }),
  async (req, res) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) return res.status(400).json({ error: 'username and password required' });

      const user = await auth.loginUser(username, password);
      if (!user) return res.status(401).json({ error: 'Invalid credentials' });

      const token = auth.createToken(user.username, user.role);
      res.json({ token, user: { username: user.username, role: user.role, name: user.name } });
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

app.post(`${BASE}/security/change-password`, auth.requireAuth, async (req, res) => {
  try {
    await auth.changePassword(req.user.username, req.body.newPassword);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

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

app.get(`${BASE}/membership/stats`,
  auth.requireAuth, auth.requireRole('admin', 'super_admin'),
  (req, res) => res.json(registrations.getMemberStats())
);

app.patch(`${BASE}/membership/members/:id`,
  auth.requireAuth, auth.requireRole('admin', 'super_admin'),
  (req, res) => {
    const m = registrations.updateMemberStatus(req.params.id, req.body.status, req.body.note);
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
  console.log(`\n🇿🇲  Build One Zambia Backend`);
  console.log(`   ✅  Server running on http://localhost:${PORT}`);
  console.log(`   📁  Database: ./data/kv.json`);
  console.log(`   🖼   Uploads:  ./uploads/`);
  console.log(`   🔑  Admin:    username=${process.env.ADMIN_USERNAME || 'superadmin'}\n`);
});

export default app;
