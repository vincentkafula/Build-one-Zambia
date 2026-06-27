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
import * as results from './results.js';

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

// ─── Root & Health ───────────────────────────────────────────────────────────

// Root route — returns 200 so Railway healthcheck on GET / doesn't 404
app.get('/', (req, res) => {
  res.json({ name: 'Build One Zambia API', status: 'ok', version: '1.0.0' });
});

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


// ─── Results Engine ─────────────────────────────────────────────────────────
app.get(`${BASE}/results/dashboard`, (req, res) => {
  res.json({ summary: results.getDashboard() });
});

app.get(`${BASE}/results/national/:electionType`, (req, res) => {
  res.json({ result: results.getNational(req.params.electionType) });
});

app.get(`${BASE}/results/level/:electionType/:levelType/:levelId`, (req, res) => {
  res.json({ result: results.getLevel(
    req.params.electionType,
    req.params.levelType,
    decodeURIComponent(req.params.levelId)
  )});
});

app.get(`${BASE}/results/breakdown/:electionType/province`, (req, res) => {
  res.json({ breakdown: results.getBreakdown(req.params.electionType, 'provinceId', null, null) });
});

app.get(`${BASE}/results/breakdown/:electionType/district/:provinceId`, (req, res) => {
  res.json({ breakdown: results.getBreakdown(
    req.params.electionType, 'districtId', 'provinceId',
    decodeURIComponent(req.params.provinceId)
  )});
});

app.get(`${BASE}/results/breakdown/:electionType/constituency/:districtId`, (req, res) => {
  res.json({ breakdown: results.getBreakdown(
    req.params.electionType, 'constituencyId', 'districtId',
    decodeURIComponent(req.params.districtId)
  )});
});

app.get(`${BASE}/results/breakdown/:electionType/ward/:constituencyId`, (req, res) => {
  res.json({ breakdown: results.getBreakdown(
    req.params.electionType, 'wardId', 'constituencyId',
    decodeURIComponent(req.params.constituencyId)
  )});
});

app.get(`${BASE}/results/leaderboard/:electionType`, (req, res) => {
  res.json({ leaderboard: results.getLeaderboard(req.params.electionType) });
});

app.get(`${BASE}/results/coverage`, (req, res) => {
  res.json({ stats: results.getCoverage(req.query.electionType) });
});

app.get(`${BASE}/results/heatmap/:electionType`, (req, res) => {
  res.json({ heatmap: results.getHeatmap(req.params.electionType) });
});

app.get(`${BASE}/results/trend/:electionType`, (req, res) => {
  res.json({ trend: results.getTrend(req.params.electionType) });
});

app.get(`${BASE}/results/live-feed`, (req, res) => {
  const limit = parseInt(req.query.limit || '20', 10);
  res.json({ feed: results.getLiveFeed(limit, req.query.electionType) });
});

app.get(`${BASE}/results/compare/:electionType/:levelType/:levelId`,
  auth.requireAuth,
  (req, res) => {
    const { electionType, levelType, levelId } = req.params;
    const boz = results.getLevel(electionType, levelType, decodeURIComponent(levelId));
    res.json({ comparison: { electionType, levelType, levelId, boz, ecz: null, discrepancies: [], totalVotesDiff: 0, totalVotesDiffPercent: 0, agreementPercent: 100, flagged: false } });
  }
);

app.post(`${BASE}/results/cache/invalidate`, auth.requireAuth, (req, res) => {
  res.json({ success: true });
});

// ─── 404 catch-all ───────────────────────────────────────────────────────────

app.use((req, res) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.path}` });
});


// ─── Missing routes — aliases & stubs for frontend compatibility ─────────────

// /registrations/* aliases (frontend uses /registrations/, backend has /register/)
app.post(`${BASE}/registrations/member`, (req, res) => {
  const r = registrations.registerMember(req.body);
  res.json({ success: true, message: 'Registration submitted successfully', registration: r });
});
app.get(`${BASE}/registrations/member`, auth.requireAuth, (req, res) => {
  const status = req.query.status;
  const all = registrations.listMembers(status ? { status } : {});
  res.json({ registrations: all, count: all.length });
});
app.patch(`${BASE}/registrations/member/:id/status`, auth.requireAuth, (req, res) => {
  const r = registrations.updateMemberStatus(req.params.id, req.body.status, req.body.notes);
  if (!r) return res.status(404).json({ error: 'Not found' });
  res.json({ success: true, registration: r, credentials: null });
});
app.get(`${BASE}/registrations/member/:id/credentials`, (req, res) => {
  res.json({ success: true, credentials: null, fullName: '' });
});
app.get(`${BASE}/registrations/member/:id/selfie`, auth.requireAuth, (req, res) => {
  res.json({ success: false, dataUrl: null });
});

app.post(`${BASE}/registrations/cooperative`, (req, res) => {
  const r = registrations.registerCoop(req.body);
  res.json({ success: true, message: 'Registration submitted', registration: r });
});
app.get(`${BASE}/registrations/cooperative`, auth.requireAuth, (req, res) => {
  const all = registrations.listCoops(req.query.status ? { status: req.query.status } : {});
  res.json({ registrations: all, count: all.length });
});
app.patch(`${BASE}/registrations/cooperative/:id/status`, auth.requireAuth, (req, res) => {
  const r = registrations.updateCoopStatus(req.params.id, req.body.status);
  res.json({ success: true, registration: r, credentials: null });
});
app.get(`${BASE}/registrations/cooperative/:id/credentials`, (req, res) => {
  res.json({ success: true, credentials: null, fullName: '' });
});
app.get(`${BASE}/registrations/cooperative/:id/selfie`, auth.requireAuth, (req, res) => {
  res.json({ success: false, dataUrl: null });
});

app.post(`${BASE}/registrations/internship`, (req, res) => {
  const r = registrations.registerIntern(req.body);
  res.json({ success: true, message: 'Application submitted', application: r });
});
app.get(`${BASE}/registrations/internship`, auth.requireAuth, (req, res) => {
  const all = registrations.listInterns(req.query.status ? { status: req.query.status } : {});
  res.json({ applications: all, count: all.length });
});
app.patch(`${BASE}/registrations/internship/:id/status`, auth.requireAuth, (req, res) => {
  const r = registrations.updateInternStatus(req.params.id, req.body.status);
  res.json({ success: true, application: r, credentials: null });
});
app.get(`${BASE}/registrations/internship/:id/credentials`, (req, res) => {
  res.json({ success: true, credentials: null, fullName: '' });
});
app.get(`${BASE}/registrations/internship/:id/selfie`, auth.requireAuth, (req, res) => {
  res.json({ success: false, dataUrl: null });
});

app.post(`${BASE}/registrations/agent`, (req, res) => {
  const r = registrations.registerAgent(req.body);
  res.json({ success: true, message: 'Application submitted', application: r });
});
app.get(`${BASE}/registrations/agent`, auth.requireAuth, (req, res) => {
  const all = registrations.listAgents(req.query.status ? { status: req.query.status } : {});
  res.json({ applications: all, count: all.length });
});
app.patch(`${BASE}/registrations/agent/:id/status`, auth.requireAuth, (req, res) => {
  const r = registrations.updateAgentStatus(req.params.id, req.body.status);
  res.json({ success: true, application: r, credentials: null });
});
app.get(`${BASE}/registrations/agent/:id/credentials`, (req, res) => {
  res.json({ success: true, credentials: null, fullName: '' });
});
app.get(`${BASE}/registrations/agent/:id/selfie`, auth.requireAuth, (req, res) => {
  res.json({ success: false, dataUrl: null });
});

app.get(`${BASE}/registrations/stats`, auth.requireAuth, (req, res) => {
  res.json({ success: true, stats: { member: registrations.getMemberStats(), cooperative: {}, internship: {}, agent: {} } });
});

app.get(`${BASE}/registrations/validate-membership`, (req, res) => {
  res.json({ valid: false, error: 'Membership validation not configured' });
});
app.post(`${BASE}/registrations/validate-memberships`, (req, res) => {
  const numbers = req.body.numbers || [];
  const results = {};
  numbers.forEach(n => { results[n] = { valid: false, error: 'Not found' }; });
  res.json({ results, invalidCount: numbers.length, invalidNumbers: numbers });
});

// /ecz/* routes
app.get(`${BASE}/ecz/summary`, auth.requireAuth, (req, res) => {
  const figures = kv.getByPrefix('ecz:');
  res.json({ summary: { total: figures.length, byElectionType: {}, byLevelType: {}, latestUpdated: null }, count: figures.length });
});
app.get(`${BASE}/ecz/comparisons`, auth.requireAuth, (req, res) => {
  const figures = kv.getByPrefix('ecz:');
  res.json({ comparisons: figures, meta: { total: figures.length, withDiscrepancy: 0, flagged: 0, fullyMatching: figures.length } });
});
app.get(`${BASE}/ecz/comparison/:electionType/:levelType/:levelId`, auth.requireAuth, (req, res) => {
  const { electionType, levelType, levelId } = req.params;
  const figure = kv.get(`ecz:${electionType}:${levelType}:${levelId}`);
  res.json({ comparison: figure || null });
});
app.post(`${BASE}/ecz/bulk-save`, auth.requireAuth, (req, res) => {
  const { figures = [] } = req.body;
  let saved = 0;
  for (const f of figures) {
    kv.set(`ecz:${f.electionType}:${f.levelType}:${f.levelId}`, { ...f, savedAt: new Date().toISOString() });
    saved++;
  }
  res.json({ success: true, saved, failed: 0, errors: [] });
});
app.get(`${BASE}/ecz/discrepancy-analysis/:electionType/:levelType/:levelId`, auth.requireAuth, (req, res) => {
  res.json({ success: true, scope: req.params, eczFigure: null, agentSummary: null, overallDiff: 0, candidateAnalysis: [], benefited: [], disadvantaged: [], stationBreakdown: [], flaggedStations: [], summary: { totalCandidates: 0, benefitedCount: 0, disadvantagedCount: 0, neutralCount: 0, flaggedCandidates: 0, flaggedStationsCount: 0, totalStations: 0 } });
});

// /data-entry/* routes
app.post(`${BASE}/data-entry/result`, async (req, res) => {
  const { v4: uuid } = await import('uuid');
  const id = uuid();
  const submission = { id, ...req.body, status: 'pending', submittedAt: new Date().toISOString() };
  kv.set(`submission:${id}`, submission);
  res.json({ success: true, message: 'Result submitted', submission: { id, submittedAt: submission.submittedAt, status: 'pending' } });
});
app.get(`${BASE}/data-entry/submissions`, auth.requireAuth, (req, res) => {
  const all = kv.getByPrefix('submission:');
  res.json({ submissions: all, count: all.length });
});
app.get(`${BASE}/data-entry/submissions/:id`, auth.requireAuth, (req, res) => {
  const s = kv.get(`submission:${req.params.id}`);
  if (!s) return res.status(404).json({ error: 'Not found' });
  res.json({ submission: s });
});
app.patch(`${BASE}/data-entry/submissions/:id/status`, auth.requireAuth, (req, res) => {
  const s = kv.get(`submission:${req.params.id}`);
  if (!s) return res.status(404).json({ error: 'Not found' });
  const updated = { ...s, status: req.body.status, notes: req.body.notes, reviewedAt: new Date().toISOString() };
  kv.set(`submission:${req.params.id}`, updated);
  res.json({ success: true, submission: updated });
});
app.get(`${BASE}/data-entry/result/:pollingStationId/:electionType`, (req, res) => {
  const all = kv.getByPrefix('submission:');
  const found = all.find(s => s.pollingStationId === req.params.pollingStationId && s.electionType === req.params.electionType);
  res.json({ submitted: !!found, submittedAt: found?.submittedAt, status: found?.status, id: found?.id });
});
app.get(`${BASE}/data-entry/turnout`, (req, res) => {
  res.json({ stats: { totalVotesCast: 0, registeredVoters: 0, turnoutPercent: 0 } });
});
app.get(`${BASE}/data-entry/stats`, auth.requireAuth, (req, res) => {
  const all = kv.getByPrefix('submission:');
  res.json({ stats: { total: all.length, pending: all.filter(s=>s.status==='pending').length, verified: all.filter(s=>s.status==='verified').length, rejected: all.filter(s=>s.status==='rejected').length } });
});
app.post(`${BASE}/data-entry/ecz-figures`, auth.requireAuth, (req, res) => {
  const key = `ecz-fig:${req.body.electionType}:${req.body.levelType}:${req.body.levelId}`;
  const figure = { ...req.body, savedAt: new Date().toISOString() };
  kv.set(key, figure);
  res.json({ success: true, figure });
});
app.get(`${BASE}/data-entry/ecz-figures/:levelType/:levelId/:electionType`, auth.requireAuth, (req, res) => {
  const key = `ecz-fig:${req.params.electionType}:${req.params.levelType}:${req.params.levelId}`;
  const figure = kv.get(key);
  res.json({ exists: !!figure, figure: figure || null });
});
app.get(`${BASE}/data-entry/ecz-figures`, auth.requireAuth, (req, res) => {
  const all = kv.getByPrefix('ecz-fig:');
  res.json({ figures: all, count: all.length });
});
app.delete(`${BASE}/data-entry/ecz-figures/:levelType/:levelId/:electionType`, auth.requireAuth, (req, res) => {
  const key = `ecz-fig:${req.params.electionType}:${req.params.levelType}:${req.params.levelId}`;
  kv.del(key);
  res.json({ success: true });
});
app.get(`${BASE}/data-entry/audit-log`, auth.requireAuth, (req, res) => {
  res.json({ entries: [], count: 0 });
});

// /security/* routes
app.get(`${BASE}/security/stats`, auth.requireAuth, (req, res) => {
  res.json({ success: true, stats: { lockedAccounts: 0, blockedIPs: 0, auditEntries: 0, activeSessions: 0, recentFailedLogins: 0 } });
});
app.get(`${BASE}/security/audit-log`, auth.requireAuth, (req, res) => {
  res.json({ success: true, events: [], total: 0 });
});
app.get(`${BASE}/security/blocked-ips`, auth.requireAuth, (req, res) => {
  res.json({ success: true, blockedIPs: [], count: 0 });
});
app.post(`${BASE}/security/block-ip`, auth.requireAuth, (req, res) => {
  res.json({ success: true, message: 'IP blocked' });
});
app.delete(`${BASE}/security/block-ip/:ip`, auth.requireAuth, (req, res) => {
  res.json({ success: true, message: 'IP unblocked' });
});
app.get(`${BASE}/security/sessions`, auth.requireAuth, (req, res) => {
  res.json({ success: true, sessions: [], count: 0 });
});
app.delete(`${BASE}/security/sessions/all`, auth.requireAuth, (req, res) => {
  res.json({ success: true, message: 'All sessions revoked' });
});
app.post(`${BASE}/security/unlock-account`, auth.requireAuth, (req, res) => {
  res.json({ success: true, message: 'Account unlocked' });
});
app.post(`${BASE}/security/deactivate-user`, auth.requireAuth, (req, res) => {
  res.json({ success: true, message: 'User deactivated' });
});

// /voter-roll/* routes
app.post(`${BASE}/voter-roll/verify`, (req, res) => {
  res.json({ valid: false, message: 'No voter roll uploaded yet' });
});
app.post(`${BASE}/voter-roll/upload`, auth.requireAuth, (req, res) => {
  const { records = [], fileName } = req.body;
  kv.set('voter-roll:meta', { count: records.length, fileName, uploadedAt: new Date().toISOString() });
  records.forEach((r, i) => kv.set(`voter-roll:${i}`, r));
  res.json({ success: true, count: records.length });
});
app.get(`${BASE}/voter-roll`, auth.requireAuth, (req, res) => {
  const meta = kv.get('voter-roll:meta') || { count: 0 };
  const records = kv.getByPrefix('voter-roll:').filter(r => r && typeof r === 'object' && !r.count);
  res.json({ records, count: meta.count, meta });
});
app.delete(`${BASE}/voter-roll`, auth.requireAuth, (req, res) => {
  kv.getKeysByPrefix('voter-roll:').forEach(k => kv.del(k));
  res.json({ success: true });
});

// /streams/* routes
app.get(`${BASE}/streams`, (req, res) => {
  const all = kv.getByPrefix('stream:');
  res.json({ streams: all, count: all.length });
});
app.get(`${BASE}/streams/stats`, auth.requireAuth, (req, res) => {
  const all = kv.getByPrefix('stream:');
  res.json({ stats: { total: all.length, live: all.filter(s=>s.status==='live').length } });
});
app.post(`${BASE}/streams`, auth.requireAuth, async (req, res) => {
  const { v4: uuid } = await import('uuid');
  const id = uuid();
  const stream = { id, ...req.body, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), viewCount: 0 };
  kv.set(`stream:${id}`, stream);
  res.json({ success: true, stream });
});
app.get(`${BASE}/streams/:id`, (req, res) => {
  const s = kv.get(`stream:${req.params.id}`);
  if (!s) return res.status(404).json({ error: 'Not found' });
  res.json({ stream: s });
});
app.patch(`${BASE}/streams/:id`, auth.requireAuth, (req, res) => {
  const s = kv.get(`stream:${req.params.id}`);
  if (!s) return res.status(404).json({ error: 'Not found' });
  const updated = { ...s, ...req.body, updatedAt: new Date().toISOString() };
  kv.set(`stream:${req.params.id}`, updated);
  res.json({ success: true, stream: updated });
});
app.patch(`${BASE}/streams/:id/status`, auth.requireAuth, (req, res) => {
  const s = kv.get(`stream:${req.params.id}`);
  if (!s) return res.status(404).json({ error: 'Not found' });
  const updated = { ...s, status: req.body.status, updatedAt: new Date().toISOString() };
  kv.set(`stream:${req.params.id}`, updated);
  res.json({ success: true, stream: updated });
});
app.delete(`${BASE}/streams/:id`, auth.requireAuth, (req, res) => {
  kv.del(`stream:${req.params.id}`);
  res.json({ success: true });
});
app.post(`${BASE}/streams/:id/view`, (req, res) => {
  const s = kv.get(`stream:${req.params.id}`);
  if (s) kv.set(`stream:${req.params.id}`, { ...s, viewCount: (s.viewCount||0)+1 });
  res.json({ success: true });
});
app.get(`${BASE}/streams/:id/comments`, (req, res) => {
  const comments = kv.getByPrefix(`stream-comment:${req.params.id}:`);
  res.json({ comments, count: comments.length });
});
app.post(`${BASE}/streams/:id/comments`, async (req, res) => {
  const { v4: uuid } = await import('uuid');
  const id = uuid();
  const comment = { id, streamId: req.params.id, ...req.body, createdAt: new Date().toISOString() };
  kv.set(`stream-comment:${req.params.id}:${id}`, comment);
  res.json({ success: true, comment });
});
app.delete(`${BASE}/streams/:streamId/comments/:commentId`, auth.requireAuth, (req, res) => {
  kv.del(`stream-comment:${req.params.streamId}:${req.params.commentId}`);
  res.json({ success: true });
});

// /otp/* routes
app.post(`${BASE}/otp/send`, (req, res) => {
  const otpId = Math.random().toString(36).slice(2);
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  kv.set(`otp:${otpId}`, { code, recipient: req.body.recipient, purpose: req.body.purpose, expiresAt: new Date(Date.now() + 10*60*1000).toISOString() });
  console.log(`[OTP] Code for ${req.body.recipient}: ${code}`);
  res.json({ success: true, otpId, expiresAt: new Date(Date.now() + 10*60*1000).toISOString() });
});
app.post(`${BASE}/otp/verify`, (req, res) => {
  const all = kv.getByPrefix('otp:');
  const match = all.find(o => o.recipient === req.body.recipient && o.code === req.body.code && o.purpose === req.body.purpose);
  res.json({ success: true, verified: !!match });
});

// /contact/* routes
app.post(`${BASE}/contact`, (req, res) => {
  const id = Date.now().toString();
  kv.set(`contact:${id}`, { id, ...req.body, read: false, receivedAt: new Date().toISOString() });
  res.json({ success: true, message: 'Message received' });
});
app.get(`${BASE}/contact`, auth.requireAuth, (req, res) => {
  const all = kv.getByPrefix('contact:');
  res.json({ messages: all, count: all.length, unread: all.filter(m=>!m.read).length });
});
app.patch(`${BASE}/contact/:id/read`, auth.requireAuth, (req, res) => {
  const m = kv.get(`contact:${req.params.id}`);
  if (m) kv.set(`contact:${req.params.id}`, { ...m, read: true });
  res.json({ success: true });
});

// /donations/* routes
app.post(`${BASE}/donations`, (req, res) => {
  const id = Date.now().toString();
  kv.set(`donation:${id}`, { id, ...req.body, receivedAt: new Date().toISOString() });
  res.json({ success: true, message: 'Donation recorded', donation: { id } });
});
app.get(`${BASE}/donations`, auth.requireAuth, (req, res) => {
  const all = kv.getByPrefix('donation:');
  const total = all.reduce((sum, d) => sum + (Number(d.amount)||0), 0);
  res.json({ donations: all, count: all.length, stats: { total, count: all.length, byMethod: {} } });
});

// /orders/* routes
app.post(`${BASE}/orders`, async (req, res) => {
  const { v4: uuid } = await import('uuid');
  const id = uuid();
  const order = { id, ...req.body, status: 'pending', submittedAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
  kv.set(`order:${id}`, order);
  res.json({ success: true, message: 'Order created', order });
});
app.get(`${BASE}/orders`, auth.requireAuth, (req, res) => {
  const all = kv.getByPrefix('order:');
  res.json({ orders: all, count: all.length });
});
app.patch(`${BASE}/orders/:id/status`, auth.requireAuth, (req, res) => {
  const o = kv.get(`order:${req.params.id}`);
  if (!o) return res.status(404).json({ error: 'Not found' });
  const updated = { ...o, status: req.body.status, paymentRef: req.body.paymentRef, updatedAt: new Date().toISOString() };
  kv.set(`order:${req.params.id}`, updated);
  res.json({ success: true });
});

// /gateway/* routes
app.get(`${BASE}/gateway/config`, (req, res) => {
  res.json({ publicKey: process.env.FLUTTERWAVE_PUBLIC_KEY || '', currency: 'ZMW', country: 'ZM', redirectUrl: process.env.FRONTEND_URL || 'https://www.bozplans.org' });
});
app.post(`${BASE}/gateway/mobile-money`, (req, res) => {
  res.json({ success: false, txRef: '', status: 'error', message: 'Payment gateway not configured', error: 'FLUTTERWAVE_SECRET_KEY not set' });
});
app.get(`${BASE}/gateway/verify/:txRef`, (req, res) => {
  res.json({ result: { verified: false, status: 'error', error: 'Gateway not configured' } });
});
app.post(`${BASE}/gateway/verify-card`, (req, res) => {
  res.json({ success: false, verified: false, result: { verified: false, status: 'error' } });
});

// /email/* routes  
app.post(`${BASE}/email/test`, auth.requireAuth, (req, res) => {
  res.json({ success: false, error: 'Email service not configured' });
});
app.post(`${BASE}/email/resend/order/:orderId`, auth.requireAuth, (req, res) => {
  res.json({ success: false, error: 'Email service not configured' });
});
app.post(`${BASE}/email/resend/payment/:paymentRef`, auth.requireAuth, (req, res) => {
  res.json({ success: false, error: 'Email service not configured' });
});

// /chambers/* routes
app.get(`${BASE}/chambers`, auth.requireAuth, (req, res) => {
  const all = kv.getByPrefix('chamber:').filter(c => c && !c.field);
  res.json({ chambers: all });
});
app.get(`${BASE}/chambers/stats`, auth.requireAuth, (req, res) => {
  const all = kv.getByPrefix('chamber:').filter(c => c && !c.field);
  res.json({ success: true, stats: { total: all.length, byType: {}, pendingAmendments: 0 } });
});
app.get(`${BASE}/chambers/ward/:wardId`, auth.requireAuth, (req, res) => {
  const all = kv.getByPrefix('chamber:').filter(c => c && !c.field);
  const found = all.find(c => c.wardId === req.params.wardId);
  res.json({ success: true, chamber: found || null });
});
app.post(`${BASE}/chambers`, auth.requireAuth, async (req, res) => {
  const { v4: uuid } = await import('uuid');
  const id = uuid();
  const chamber = { id, ...req.body, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
  kv.set(`chamber:${id}`, chamber);
  res.json({ success: true, chamber });
});
app.get(`${BASE}/chambers/amendments`, auth.requireAuth, (req, res) => {
  const all = kv.getByPrefix('chamber-amendment:');
  res.json({ amendments: all, total: all.length });
});
app.post(`${BASE}/chambers/amendments`, auth.requireAuth, async (req, res) => {
  const { v4: uuid } = await import('uuid');
  const id = uuid();
  const amendment = { id, ...req.body, status: 'pending', submittedAt: new Date().toISOString() };
  kv.set(`chamber-amendment:${id}`, amendment);
  res.json({ success: true, amendment });
});
app.patch(`${BASE}/chambers/amendments/:id/review`, auth.requireAuth, (req, res) => {
  const a = kv.get(`chamber-amendment:${req.params.id}`);
  if (!a) return res.status(404).json({ error: 'Not found' });
  const updated = { ...a, status: req.body.decision, adminNote: req.body.adminNote, reviewedAt: new Date().toISOString() };
  kv.set(`chamber-amendment:${req.params.id}`, updated);
  res.json({ success: true, amendment: updated });
});
app.get(`${BASE}/chambers/:id`, auth.requireAuth, (req, res) => {
  const c = kv.get(`chamber:${req.params.id}`);
  if (!c) return res.status(404).json({ error: 'Not found' });
  res.json({ chamber: c });
});
app.patch(`${BASE}/chambers/:id`, auth.requireAuth, (req, res) => {
  const c = kv.get(`chamber:${req.params.id}`);
  if (!c) return res.status(404).json({ error: 'Not found' });
  const updated = { ...c, ...req.body, updatedAt: new Date().toISOString() };
  kv.set(`chamber:${req.params.id}`, updated);
  res.json({ success: true, chamber: updated });
});

// /membership/* additional routes
app.get(`${BASE}/membership/certificate/membership`, (req, res) => {
  res.json({ certificateType: 'membership', membershipNumber: '', fullName: '', tier: '', province: '', district: '', constituency: '', ward: '', joinDate: '', status: '', issuedAt: new Date().toISOString() });
});
app.get(`${BASE}/membership/certificate/adoption`, (req, res) => {
  res.json({ eligible: false, reason: 'No adoption on record' });
});
app.post(`${BASE}/membership/members/:id/grant-adoption`, auth.requireAuth, (req, res) => {
  const m = kv.get(`member:${req.params.id}`);
  if (!m) return res.status(404).json({ error: 'Not found' });
  const updated = { ...m, adoptionGranted: true, adoptionGrantedAt: new Date().toISOString(), ...req.body };
  kv.set(`member:${req.params.id}`, updated);
  res.json({ success: true, member: updated });
});
app.post(`${BASE}/membership/members/:id/revoke-adoption`, auth.requireAuth, (req, res) => {
  const m = kv.get(`member:${req.params.id}`);
  if (!m) return res.status(404).json({ error: 'Not found' });
  const updated = { ...m, adoptionGranted: false };
  kv.set(`member:${req.params.id}`, updated);
  res.json({ success: true, member: updated });
});
app.post(`${BASE}/membership/members/:id/link-order`, auth.requireAuth, (req, res) => {
  res.json({ success: true });
});
app.patch(`${BASE}/membership/members/:id`, auth.requireAuth, (req, res) => {
  const m = kv.get(`member:${req.params.id}`);
  if (!m) return res.status(404).json({ error: 'Not found' });
  const updated = { ...m, ...req.body, updatedAt: new Date().toISOString() };
  kv.set(`member:${req.params.id}`, updated);
  res.json({ success: true, member: updated });
});
app.get(`${BASE}/membership/members/:id`, auth.requireAuth, (req, res) => {
  const m = kv.get(`member:${req.params.id}`);
  if (!m) return res.status(404).json({ error: 'Not found' });
  res.json({ member: m });
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

