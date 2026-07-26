/**
 * Build One Zambia Portal — Node.js / Express Backend
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
import * as shop from './shop.js';
import * as streams from './streams.js';
import * as voterRoll from './voterRoll.js';
import * as voterRegister from './voterRegister.js';
import * as memberCert from './membershipCertificate.js';
import * as memberCard from './membershipCard.js';
import * as adoptionCert from './adoptionCertificate.js';
import * as appointmentCert from './appointmentCertificate.js';
import { kv, getPersistenceStatus } from './db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = parseInt(process.env.PORT || '3001', 10);
const BASE = '/make-server-8fca9621';

const app = express();

// ─── Security & parsing ──────────────────────────────────────────────────────
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' }, contentSecurityPolicy: false }));

const EXTRA_ORIGINS = (process.env.ALLOWED_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);
app.use(cors({
  origin: (origin, cb) => {
    const allowed = ['https://bozplans.org','https://www.bozplans.org','https://glorious-sparkle-production-b0a3.up.railway.app',...EXTRA_ORIGINS];
    // SECURITY: origin.includes('railway.app') used to match ANY Railway-hosted
    // app (not just this project's), since Railway domains are always
    // *.up.railway.app — combined with credentials:true, that let any other
    // developer's Railway app make authenticated cross-origin requests here.
    // Use endsWith on the real Railway domain suffixes instead.
    const isRailwayOrigin = origin && (origin.endsWith('.up.railway.app') || origin.endsWith('.railway.internal'));
    if (!origin || allowed.includes(origin) || origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1') || isRailwayOrigin) cb(null, true);
    else { console.warn(`[CORS] Blocked: ${origin}`); cb(null, false); }
  },
  credentials: true,
  allowedHeaders: ['Content-Type','Authorization','X-Requested-With'],
}));
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));
app.set('trust proxy', 1);

// ─── Rate limiting ────────────────────────────────────────────────────────────
// No rate limiting existed anywhere in this API before — every endpoint,
// including login, could be hit as fast as a script could send requests.
// A coarse global limit plus a strict one on login specifically (the door
// to every election-manager and super-admin account) closes the most
// obvious brute-force and denial-of-service paths.
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 600,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests — please slow down and try again shortly.' },
}));

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: { error: 'Too many login attempts. Please wait 15 minutes before trying again.' },
});

// ─── Uploads ─────────────────────────────────────────────────────────────────
const IS_RAILWAY = !!process.env.RAILWAY_ENVIRONMENT || !!process.env.RAILWAY_PROJECT_ID;
const UPLOADS_DIR = IS_RAILWAY ? '/tmp/boz-uploads' : path.join(__dirname, '..', 'uploads');
if (IS_RAILWAY) {
  const srcLeaders = path.join(__dirname, '..', 'uploads', 'leaders');
  const dstLeaders = path.join(UPLOADS_DIR, 'leaders');
  fs.mkdirSync(dstLeaders, { recursive: true });
  try { const files = fs.readdirSync(srcLeaders); for (const f of files) { const dst = path.join(dstLeaders, f); if (!fs.existsSync(dst)) fs.copyFileSync(path.join(srcLeaders, f), dst); } console.log(`   🖼   Copied ${files.length} leader images`); } catch (e) { console.warn('   ⚠  Could not copy leader images:', e.message); }
} else { fs.mkdirSync(path.join(UPLOADS_DIR, 'leaders'), { recursive: true }); }
app.use('/uploads', express.static(UPLOADS_DIR, { maxAge: '7d' }));

// ─── Auto-seed presidential candidates ───────────────────────────────────────
async function autoSeedCandidates() {
  const existing = candidates.listCandidates({ electionType: 'presidential' });
  if (existing.length > 0) return;
  const list = [
    { id: 'gmc', name: 'Mr Given Mwenya Chansa', party: 'MEE', partyColor: '#16a34a', ballotNumber: 1 },
    { id: 'rs', name: 'Dr Richard Silumbe', party: 'LM', partyColor: '#0891b2', ballotNumber: 2 },
    { id: 'hk', name: 'Mr Harry Kalaba', party: 'CF', partyColor: '#d97706', ballotNumber: 3 },
    { id: 'fm', name: "Dr Fred M'membe", party: 'SP', partyColor: '#dc2626', ballotNumber: 4 },
    { id: 'kbf', name: 'Mr Kelvin Fube Bwalya (KBF)', party: 'ZMP', partyColor: '#7c3aed', ballotNumber: 5 },
    { id: 'bm', name: 'Mr Brian Mundubile', party: 'NRPUP', partyColor: '#0f766e', ballotNumber: 6 },
    { id: 'hkunda', name: 'Mr Howard Kunda', party: 'ZAWAPA', partyColor: '#b45309', ballotNumber: 7 },
    { id: 'bmush', name: 'Dr Brian Mushimba', party: 'OPP', partyColor: '#0369a1', ballotNumber: 8 },
    { id: 'gk', name: 'Ms Given Katuta', party: 'Independent', partyColor: '#6b7280', ballotNumber: 9 },
    { id: 'xc', name: 'Mr Xavier Chungu', party: 'LDP', partyColor: '#9333ea', ballotNumber: 10 },
    { id: 'hh', name: 'Mr Hakainde Hichilema', party: 'UPND', partyColor: '#e11d48', ballotNumber: 11 },
    { id: 'dp', name: 'Dr Dan Pule', party: 'CDP', partyColor: '#1d4ed8', ballotNumber: 12 },
    { id: 'rs2', name: 'Mr Richwell Siamunene', party: 'NFP', partyColor: '#065f46', ballotNumber: 13 },
    { id: 'aan', name: 'Mr Ackim Antony Njobvu', party: 'DU', partyColor: '#92400e', ballotNumber: 14 },
  ];
  const ids = [];
  for (const c of list) {
    kv.set(`boz:candidates:cand:${c.id}`, { ...c, electionType: 'presidential', scopeId: 'national', scopeName: 'National', gender: c.name.startsWith('Ms') ? 'female' : 'male', active: true, hasPhoto: false, addedBy: 'system', addedAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    ids.push(c.id);
  }
  const existing2 = kv.get('boz:candidates:index') || [];
  kv.set('boz:candidates:index', [...new Set([...existing2, ...ids])]);
  console.log(`[auto-seed] Seeded ${list.length} presidential candidates`);
}
autoSeedCandidates().catch(e => console.error('[auto-seed]', e.message));

// ─── Auto-seed 2026 parliamentary candidates (from ECZ nomination notice) ────
async function autoSeedParliamentaryCandidates() {
  const existing = candidates.listCandidates({ electionType: 'parliament' });
  if (existing.length > 0) return;
  let list = [];
  try {
    const dataPath = path.join(__dirname, '..', 'seed', 'parliamentary_candidates_2026.json');
    list = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  } catch (e) {
    console.warn('[auto-seed] Could not load parliamentary_candidates_2026.json:', e.message);
    return;
  }
  const ids = [];
  const now = new Date().toISOString();
  for (const c of list) {
    kv.set(`boz:candidates:cand:${c.id}`, { ...c, active: true, hasPhoto: false, addedBy: 'system', addedAt: now, updatedAt: now });
    ids.push(c.id);
  }
  const existing2 = kv.get('boz:candidates:index') || [];
  kv.set('boz:candidates:index', [...new Set([...existing2, ...ids])]);
  console.log(`[auto-seed] Seeded ${list.length} parliamentary candidates (2026, ECZ nomination notice)`);
}
autoSeedParliamentaryCandidates().catch(e => console.error('[auto-seed]', e.message));

// ─── One-time correction: watermark-obscured MP candidate names ─────────────
// The original ECZ nomination source had a watermark obscuring several
// candidate surnames in some constituencies; those got seeded as literal
// "(name Obscured By Watermark)" placeholders. As the real names are
// confirmed constituency by constituency, add their fixes to OBSCURED_NAME_FIXES
// below. Auto-seeding only runs once (skipped once candidates already
// exist), so fixing the seed JSON alone doesn't correct records already
// written to the live database on a prior deploy — this runs
// unconditionally on every boot, matches only the specific old placeholder
// ids listed, and is a no-op for anything already fixed.
const OBSCURED_NAME_FIXES = [
  // Munali (082)
  { oldId: 'p26-082-name-obscured-by-watermark-chrispin', newId: 'p26-082-chiinda-chrispin', name: 'Chiinda Chrispin' },
  { oldId: 'p26-082-name-obscured-by-watermark-m', newId: 'p26-082-chomba-obbie-m', name: 'Chomba Obbie M' },
  { oldId: 'p26-082-name-obscured-by-watermark-anwa-v', newId: 'p26-082-kasanda-mpomwa-v', name: 'Kasanda Mpomwa V' },
  { oldId: 'p26-082-name-obscured-by-watermark', newId: 'p26-082-mankishi-kisulo', name: 'Mankishi Kisulo' },
  { oldId: 'p26-082-name-obscured-by-watermark-mwenya-r', newId: 'p26-082-matafwali-mwenya-r', name: 'Matafwali Mwenya R' },
  { oldId: 'p26-082-name-obscured-by-watermark-2', newId: 'p26-082-mutila-andrew', name: 'Mutila Andrew' },
  { oldId: 'p26-082-name-obscured-by-watermark-agaton-m', newId: 'p26-082-mvunga-agaton-m', name: 'Mvunga Agaton M' },
  // Kanyama (078)
  { oldId: 'p26-078-name-obscured-by-watermark-joseph', newId: 'p26-078-chibesa-joseph', name: 'Chibesa Joseph' },
  { oldId: 'p26-078-name-obscured-by-watermark-muhammed-k', newId: 'p26-078-dambele-muhammed-k', name: 'Dambele Muhammed K' },
];

function correctObscuredCandidateNames() {
  let fixedCount = 0;
  const index = kv.get('boz:candidates:index') || [];
  let newIndex = index;
  for (const { oldId, newId, name } of OBSCURED_NAME_FIXES) {
    const existing = kv.get(`boz:candidates:cand:${oldId}`);
    if (!existing) continue; // already fixed, or never seeded under the old id
    kv.set(`boz:candidates:cand:${newId}`, { ...existing, id: newId, name, updatedAt: new Date().toISOString() });
    kv.del(`boz:candidates:cand:${oldId}`);
    newIndex = newIndex.map(id => (id === oldId ? newId : id));
    fixedCount++;
  }
  if (fixedCount > 0) {
    kv.set('boz:candidates:index', newIndex);
    console.log(`[correction] Fixed ${fixedCount} MP candidate name(s) previously obscured by a source-document watermark.`);
  }
}
// Runs after a short delay rather than immediately at boot, so the
// PostgreSQL connection (which happens asynchronously) has time to finish
// loading existing records into memory first — otherwise this could run
// before a previously-seeded record is even visible to kv.get() and
// wrongly conclude there's nothing to fix.
setTimeout(correctObscuredCandidateNames, 3000);

// ─── Auto-seed 2026 mayoral/chairperson candidates (from ECZ nomination notice) ──
async function autoSeedMayoralCandidates() {
  const existing = candidates.listCandidates({ electionType: 'mayoral' });
  if (existing.length > 0) return;
  let list = [];
  try {
    const dataPath = path.join(__dirname, '..', 'seed', 'mayoral_candidates_2026.json');
    list = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  } catch (e) {
    console.warn('[auto-seed] Could not load mayoral_candidates_2026.json:', e.message);
    return;
  }
  const ids = [];
  const now = new Date().toISOString();
  for (const c of list) {
    kv.set(`boz:candidates:cand:${c.id}`, { ...c, active: true, hasPhoto: false, addedBy: 'system', addedAt: now, updatedAt: now });
    ids.push(c.id);
  }
  const existing2 = kv.get('boz:candidates:index') || [];
  kv.set('boz:candidates:index', [...new Set([...existing2, ...ids])]);
  console.log(`[auto-seed] Seeded ${list.length} mayoral/chairperson candidates (2026, ECZ nomination notice)`);
}
autoSeedMayoralCandidates().catch(e => console.error('[auto-seed]', e.message));

// ─── Health ───────────────────────────────────────────────────────────────────
app.get(`${BASE}/health`, (req, res) => res.json({ name: 'Build One Zambia API', status: 'ok', server: 'node-express', version: '2.2.0', timestamp: new Date().toISOString(), persistence: getPersistenceStatus() }));
app.get('/ping', (req, res) => res.json({ status: 'ok', service: 'boz-backend', port: PORT, timestamp: new Date().toISOString() }));

// ─── Auth ─────────────────────────────────────────────────────────────────────
app.post(`${BASE}/auth/login`, loginLimiter, async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'username and password required' });
    const user = await auth.loginUser(username, password);
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const token = auth.createToken(user.username, user.role);
    const { id, username: uname, role, name, email, phone, scopeId, scopeName, scopeType, pollingStationId, pollingStationName, active, createdAt, lastLogin } = user;
    res.json({ token, user: { id, username: uname, role, name, email, phone, scopeId, scopeName, scopeType, pollingStationId, pollingStationName, active, createdAt, lastLogin } });
  } catch (err) { res.status(500).json({ error: err.message }); }
});
app.post(`${BASE}/auth/logout`, (req, res) => res.json({ success: true }));
app.get(`${BASE}/auth/me`, auth.requireAuth, (req, res) => res.json({ user: auth.getUser(req.user.username) || { username: req.user.username, role: req.user.role } }));
app.post(`${BASE}/auth/register`, auth.requireAuth, auth.requireRole('admin', 'super_admin'), async (req, res) => {
  try { const { password, ...userData } = req.body; res.json({ user: await auth.registerUser(userData, password) }); } catch (err) { res.status(400).json({ error: err.message }); }
});
app.get(`${BASE}/auth/users`, auth.requireAuth, auth.requireRole('admin', 'super_admin'), (req, res) => res.json({ users: auth.listUsers() }));

// Lets an admin/super_admin set or change the PIN used as a second factor
// on top of their password for irreversible actions (e.g. resetting
// election results). Requires the current password to change it, same as
// any sensitive account-security change.
app.post(`${BASE}/auth/set-pin`, auth.requireAuth, auth.requireRole('admin', 'super_admin'), loginLimiter, async (req, res) => {
  try {
    const { currentPassword, newPin } = req.body || {};
    if (!currentPassword || !newPin) return res.status(400).json({ error: 'Current password and a new PIN are required.' });
    if (!/^\d{4,8}$/.test(String(newPin))) return res.status(400).json({ error: 'PIN must be 4–8 digits.' });

    const isEnvAdmin = req.user.username === (process.env.ADMIN_USERNAME || 'superadmin');
    if (isEnvAdmin) {
      return res.status(400).json({ error: `The '${req.user.username}' shortcut login's PIN is set via the ADMIN_PIN environment variable on Railway, not here.` });
    }
    const storedHash = kv.get(`password:${req.user.username}`);
    const passOk = storedHash && await auth.verifyPassword(currentPassword, storedHash);
    if (!passOk) return res.status(401).json({ error: 'Incorrect current password.' });

    await auth.setPin(req.user.username, newPin);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ─── Cooperative Registration Certificate ──────────────────────────────────
// Populates a certificate from the actual online application a cooperative
// submitted — cooperative name, the 20 BOZ member names (resolved from
// their membership numbers), contact person, address, and approval date —
// rather than a static uploaded document. A cooperative account sees their
// own certificate; super_admin/admin can look up any coop via ?coopId=.
app.get(`${BASE}/coop/certificate`, auth.requireAuth, (req, res) => {
  const isAdmin = req.user.role === 'super_admin' || req.user.role === 'admin';
  let coopId = isAdmin ? (req.query.coopId || null) : null;

  if (!coopId) {
    const fullUser = auth.getUser(req.user.username);
    if (!fullUser || fullUser.registrationType !== 'cooperative' || !fullUser.registrationId) {
      return res.status(404).json({ error: 'No cooperative application linked to this account.' });
    }
    coopId = fullUser.registrationId;
  }

  const coop = registrations.getCoop(coopId);
  if (!coop) return res.status(404).json({ error: 'Cooperative application not found.' });
  if (coop.status !== 'approved') {
    return res.status(400).json({ error: `Certificate is only available once the application is approved. Current status: ${coop.status}.` });
  }

  const members = (coop.membershipNumbers || []).map((num, i) => {
    const m = registrations.getMemberByMembershipNumber(num);
    return { position: i + 1, membershipNumber: num, fullName: m ? `${m.firstName} ${m.lastName}` : null };
  });

  const TYPE_LABELS = { agricultural: 'Agricultural Cooperative', 'multi-purpose': 'Multi-Purpose Cooperative' };
  const approvedAt = coop.updatedAt || coop.createdAt;
  const year = new Date(approvedAt).getFullYear();
  // Deterministic certificate number from the registration id, so the same
  // application always produces the same number rather than a random one.
  const seq = String(Math.abs([...coopId].reduce((h, c) => (h * 31 + c.charCodeAt(0)) | 0, 0)) % 100000).padStart(5, '0');

  res.json({
    certificate: {
      certificateNo: `BOZ/COOP/${year}/${seq}`,
      registrationNumber: seq,
      dateOfIssue: approvedAt,
      dateOfRegistration: approvedAt,
      cooperativeName: coop.cooperativeName,
      legalStatus: 'Cooperative Society Limited',
      typeOfCooperative: TYPE_LABELS[coop.type] || 'Multi-Purpose Cooperative',
      registeredOffice: coop.address || '',
      contactPerson: coop.contactPerson || '',
      contactPhone: coop.contactPhone || '',
      memberCount: members.length,
      members,
    },
  });
});

// Passwords and PINs are hashed (auth.js/PBKDF2) — there is no original
// value to "resend", ever. This resets both to new random values and
// emails the new credentials, same as any standard account-recovery flow.
// Always responds with the same generic message regardless of whether a
// matching account was found, so this can't be used to check which
// emails/usernames have accounts (account enumeration).
app.post(`${BASE}/auth/resend-login`, loginLimiter, async (req, res) => {
  const { email, username } = req.body || {};
  const generic = { success: true, message: 'If an account matches those details, new login credentials have been emailed to the address on file.' };
  if (!email && !username) return res.status(400).json({ error: 'email or username is required' });

  try {
    const users = auth.listUsers();
    const match = users.find(u =>
      (username && u.username === username) ||
      (email && u.email && u.email.toLowerCase() === String(email).toLowerCase())
    );
    if (!match) return res.json(generic);

    const newPassword = generatePassword();
    await auth.resetPassword(match.id, newPassword);
    await sendCredentialsResetEmail(match, newPassword);
    res.json(generic);
  } catch (err) {
    console.error('[resend-login] error:', err.message);
    // Still return the generic message — never reveal whether something
    // failed internally vs. no account existed at all.
    res.json(generic);
  }
});

// ─── Leadership ───────────────────────────────────────────────────────────────
let seeded = false;
function ensureSeeded(req) { if (!seeded) { leadership.seedLeaders(`${req.protocol}://${req.get('host')}`); seeded = true; } }

app.get(`${BASE}/leadership`, (req, res) => { ensureSeeded(req); res.json({ leaders: leadership.listLeaders({ tier: req.query.tier, province: req.query.province }) }); });
app.get(`${BASE}/leadership/:id`, (req, res) => { const l = leadership.getLeader(req.params.id); if (!l) return res.status(404).json({ error: 'Not found' }); res.json({ leader: l }); });
app.get(`${BASE}/leadership/:id/image`, (req, res) => { const img = leadership.getLeaderImage(req.params.id); if (!img) return res.status(404).json({ error: 'No image' }); const [meta, b64] = img.split(','); res.setHeader('Content-Type', meta.replace('data:', '').replace(';base64', '')); res.send(Buffer.from(b64, 'base64')); });
app.post(`${BASE}/leadership`, auth.requireAuth, auth.requireRole('admin', 'super_admin'), (req, res) => { try { res.json({ leader: leadership.createLeader(req.body) }); } catch (err) { res.status(400).json({ error: err.message }); } });
app.patch(`${BASE}/leadership/:id`, auth.requireAuth, auth.requireRole('admin', 'super_admin'), (req, res) => { const l = leadership.updateLeader(req.params.id, req.body); if (!l) return res.status(404).json({ error: 'Not found' }); res.json({ leader: l }); });
app.patch(`${BASE}/leadership/:id/image`, auth.requireAuth, auth.requireRole('admin', 'super_admin'), (req, res) => { const l = leadership.updateLeaderImage(req.params.id, req.body.imageDataUrl); if (!l) return res.status(404).json({ error: 'Not found' }); res.json({ leader: l }); });
app.post(`${BASE}/leadership/reorder`, auth.requireAuth, auth.requireRole('admin', 'super_admin'), (req, res) => { leadership.reorderLeaders(req.body.orderings || []); res.json({ success: true }); });
app.delete(`${BASE}/leadership/:id`, auth.requireAuth, auth.requireRole('admin', 'super_admin'), (req, res) => { leadership.deleteLeader(req.params.id); res.json({ success: true }); });
app.delete(`${BASE}/leadership/:id/hard`, auth.requireAuth, auth.requireRole('super_admin'), (req, res) => { leadership.hardDeleteLeader(req.params.id); res.json({ success: true }); });
app.get(`${BASE}/leadership/seed`, auth.requireAuth, auth.requireRole('super_admin'), (req, res) => res.json({ seeded: false, message: 'Use POST /leadership/seed' }));
app.post(`${BASE}/leadership/seed`, auth.requireAuth, auth.requireRole('super_admin'), async (req, res) => { try { res.json({ success: true, ...(await leadership.seedLeaders(process.env.BACKEND_URL || '')) }); } catch (err) { res.status(500).json({ error: err.message }); } });

// ─── News ─────────────────────────────────────────────────────────────────────
app.get(`${BASE}/news/posts`, (req, res) => {
  const requestedStatus = req.query.status;
  // Only an authenticated admin/super_admin may see drafts, archived posts,
  // or 'all' — everyone else (the public news page) always gets published
  // posts only, regardless of what status is requested.
  let status = undefined;
  if (requestedStatus && requestedStatus !== 'published') {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    const payload = token ? auth.verifyToken(token) : null;
    if (payload && ['admin', 'super_admin'].includes(payload.role)) status = requestedStatus;
  } else if (requestedStatus === 'published') {
    status = 'published';
  }
  res.json({ posts: news.listPosts({ status, category: req.query.category, limit: parseInt(req.query.limit || '50', 10) }) });
});
app.get(`${BASE}/news/posts/stats`, auth.requireAuth, auth.requireRole('admin', 'super_admin'), (req, res) => res.json(news.getStats()));
app.get(`${BASE}/news/posts/:id`, (req, res) => { const p = news.getPost(req.params.id); if (!p) return res.status(404).json({ error: 'Not found' }); res.json({ post: p }); });
app.get(`${BASE}/news/posts/:id/image`, (req, res) => { const img = news.getPostImage(req.params.id); if (!img) return res.status(404).json({ error: 'No image' }); const [meta, b64] = img.split(','); res.setHeader('Content-Type', meta.replace('data:', '').replace(';base64', '')); res.send(Buffer.from(b64, 'base64')); });
app.post(`${BASE}/news/posts`, auth.requireAuth, auth.requireRole('admin', 'super_admin'), (req, res) => res.json({ post: news.createPost(req.body, req.user.username) }));
app.patch(`${BASE}/news/posts/:id`, auth.requireAuth, auth.requireRole('admin', 'super_admin'), (req, res) => { const p = news.updatePost(req.params.id, req.body); if (!p) return res.status(404).json({ error: 'Not found' }); res.json({ post: p }); });
app.patch(`${BASE}/news/posts/:id/image`, auth.requireAuth, auth.requireRole('admin', 'super_admin'), (req, res) => { const p = news.getPost(req.params.id); if (!p) return res.status(404).json({ error: 'Not found' }); res.json({ post: news.updatePost(req.params.id, { hasCustomImage: true, imageDataUrl: req.body.imageDataUrl }) }); });
app.patch(`${BASE}/news/posts/:id/publish`, auth.requireAuth, auth.requireRole('admin', 'super_admin'), (req, res) => { const p = news.publishPost(req.params.id); if (!p) return res.status(404).json({ error: 'Not found' }); res.json({ post: p }); });
app.patch(`${BASE}/news/posts/:id/unpublish`, auth.requireAuth, auth.requireRole('admin', 'super_admin'), (req, res) => { const p = news.unpublishPost(req.params.id); if (!p) return res.status(404).json({ error: 'Not found' }); res.json({ post: p }); });
app.patch(`${BASE}/news/posts/:id/restore`, auth.requireAuth, auth.requireRole('admin', 'super_admin'), (req, res) => { const p = news.restorePost(req.params.id); if (!p) return res.status(404).json({ error: 'Not found' }); res.json({ post: p }); });
// Soft archive (reversible) — this is what the admin UI's "delete"/"archive" action calls.
app.delete(`${BASE}/news/posts/:id`, auth.requireAuth, auth.requireRole('admin', 'super_admin'), (req, res) => { const p = news.archivePost(req.params.id); if (!p) return res.status(404).json({ error: 'Not found' }); res.json({ success: true, post: p }); });
// Permanent, irreversible delete — deliberately restricted to super_admin only.
app.delete(`${BASE}/news/posts/:id/hard`, auth.requireAuth, auth.requireRole('super_admin'), (req, res) => { news.hardDeletePost(req.params.id); res.json({ success: true, deleted: 'permanent' }); });

// ─── Candidates ───────────────────────────────────────────────────────────────
app.get(`${BASE}/candidates`, (req, res) => res.json({ candidates: candidates.listCandidates({ electionType: req.query.electionType, scopeId: req.query.scopeId, party: req.query.party, gender: req.query.gender }) }));
app.get(`${BASE}/candidates/stats`, auth.requireAuth, (req, res) => res.json(candidates.getStats()));
app.get(`${BASE}/candidates/scope/:electionType/:scopeId`, (req, res) => res.json({ candidates: candidates.listCandidates({ electionType: req.params.electionType, scopeId: req.params.scopeId }) }));
app.get(`${BASE}/candidates/seed`, auth.requireAuth, auth.requireRole('super_admin', 'admin'), (req, res) => res.json({ seeded: false }));
app.post(`${BASE}/candidates/seed`, auth.requireAuth, auth.requireRole('super_admin', 'admin'), async (req, res) => { try { res.json({ success: true, seeded: await candidates.seedDefault() }); } catch (e) { res.status(500).json({ error: e.message }); } });
app.get(`${BASE}/candidates/audit`, auth.requireAuth, auth.requireRole('super_admin', 'admin'), (req, res) => res.json({ log: [], count: 0 }));
app.get(`${BASE}/candidates/:id`, (req, res) => { const c = candidates.getCandidate(req.params.id); if (!c) return res.status(404).json({ error: 'Not found' }); res.json({ candidate: c }); });
app.get(`${BASE}/candidates/:id/photo`, (req, res) => { const photo = candidates.getCandidatePhoto(req.params.id); if (!photo) return res.status(404).json({ error: 'No photo' }); const [meta, b64] = photo.split(','); res.setHeader('Content-Type', meta.replace('data:', '').replace(';base64', '')); res.send(Buffer.from(b64, 'base64')); });
app.post(`${BASE}/candidates`, auth.requireAuth, auth.requireRole('admin', 'super_admin'), (req, res) => res.json({ candidate: candidates.createCandidate(req.body, req.user.username) }));
app.patch(`${BASE}/candidates/:id`, auth.requireAuth, auth.requireRole('admin', 'super_admin'), (req, res) => { const c = candidates.updateCandidate(req.params.id, req.body); if (!c) return res.status(404).json({ error: 'Not found' }); res.json({ candidate: c }); });
app.patch(`${BASE}/candidates/:id/photo`, auth.requireAuth, auth.requireRole('admin', 'super_admin'), (req, res) => { const c = candidates.updateCandidatePhoto(req.params.id, req.body.photoDataUrl); if (!c) return res.status(404).json({ error: 'Not found' }); res.json({ candidate: c }); });
app.delete(`${BASE}/candidates/:id`, auth.requireAuth, auth.requireRole('admin', 'super_admin'), (req, res) => { candidates.deleteCandidate(req.params.id); res.json({ success: true }); });
app.delete(`${BASE}/candidates/:id/hard`, auth.requireAuth, auth.requireRole('super_admin'), (req, res) => { candidates.deleteCandidate(req.params.id); res.json({ success: true }); });
app.post(`${BASE}/candidates/:id/restore`, auth.requireAuth, auth.requireRole('super_admin'), (req, res) => res.json({ success: true, id: req.params.id }));

// ─── Shop ─────────────────────────────────────────────────────────────────────
app.get(`${BASE}/shop/products`, (req, res) => { const products = shop.listProducts({ category: req.query.category, search: req.query.search, featured: req.query.featured === 'true', includeInactive: req.query.includeInactive === 'true' }); res.json({ products, count: products.length }); });
app.get(`${BASE}/shop/products/:id`, (req, res) => { const p = shop.getProduct(req.params.id); if (!p) return res.status(404).json({ error: 'Not found' }); res.json({ product: p }); });
app.get(`${BASE}/shop/products/:id/image`, (req, res) => { const img = shop.getProductImage(req.params.id); if (!img) return res.status(404).json({ error: 'No image' }); const [meta, b64] = img.split(','); res.setHeader('Content-Type', meta.replace('data:', '').replace(';base64', '')); res.send(Buffer.from(b64, 'base64')); });
app.post(`${BASE}/shop/products`, auth.requireAuth, auth.requireRole('admin', 'super_admin'), (req, res) => { try { res.json({ success: true, product: shop.createProduct(req.body) }); } catch (err) { res.status(400).json({ error: err.message }); } });
app.patch(`${BASE}/shop/products/:id`, auth.requireAuth, auth.requireRole('admin', 'super_admin'), (req, res) => { const p = shop.updateProduct(req.params.id, req.body); if (!p) return res.status(404).json({ error: 'Not found' }); res.json({ success: true, product: p }); });
app.patch(`${BASE}/shop/products/:id/image`, auth.requireAuth, auth.requireRole('admin', 'super_admin'), (req, res) => { const p = shop.updateProduct(req.params.id, { imageDataUrl: req.body.imageDataUrl }); if (!p) return res.status(404).json({ error: 'Not found' }); res.json({ success: true, product: p }); });
app.delete(`${BASE}/shop/products/:id`, auth.requireAuth, auth.requireRole('admin', 'super_admin'), (req, res) => { shop.deleteProduct(req.params.id); res.json({ success: true }); });
app.post(`${BASE}/shop/products/:id/restore`, auth.requireAuth, auth.requireRole('admin', 'super_admin'), (req, res) => { const p = shop.restoreProduct(req.params.id); if (!p) return res.status(404).json({ error: 'Not found' }); res.json({ success: true, product: p }); });
app.post(`${BASE}/shop/products/seed`, auth.requireAuth, auth.requireRole('admin', 'super_admin'), (req, res) => res.json({ success: true, ...shop.seedProducts() }));
app.post(`${BASE}/shop/payments/initiate`, (req, res) => { try { res.json({ success: true, payment: shop.initiatePayment(req.body) }); } catch (err) { res.status(400).json({ error: err.message }); } });
app.get(`${BASE}/shop/payments/:ref`, (req, res) => { const p = shop.getPayment(req.params.ref); if (!p) return res.status(404).json({ error: 'Not found' }); res.json({ payment: p }); });
app.post(`${BASE}/shop/payments/:ref/confirm`, (req, res) => { const p = shop.confirmPayment(req.params.ref, req.body.gatewayRef); if (!p) return res.status(404).json({ error: 'Not found' }); res.json({ success: true, payment: p }); });
app.post(`${BASE}/shop/payments/:ref/fail`, auth.requireAuth, auth.requireRole('admin', 'super_admin'), (req, res) => { const p = shop.failPayment(req.params.ref, req.body.reason); if (!p) return res.status(404).json({ error: 'Not found' }); res.json({ success: true, payment: p }); });
app.get(`${BASE}/shop/payments`, auth.requireAuth, auth.requireRole('admin', 'super_admin'), (req, res) => { const payments = shop.listPayments({ status: req.query.status, method: req.query.method }); res.json({ payments, count: payments.length }); });
app.get(`${BASE}/shop/stats`, auth.requireAuth, auth.requireRole('admin', 'super_admin'), (req, res) => res.json(shop.getStats()));
app.post(`${BASE}/orders`, (req, res) => { try { res.json({ success: true, message: 'Order received', order: shop.createOrder(req.body) }); } catch (err) { res.status(400).json({ error: err.message }); } });
app.get(`${BASE}/orders`, auth.requireAuth, auth.requireRole('admin', 'super_admin'), (req, res) => { const orders = shop.listOrders({ status: req.query.status }); res.json({ orders, count: orders.length }); });
app.patch(`${BASE}/orders/:id/status`, auth.requireAuth, auth.requireRole('admin', 'super_admin'), (req, res) => { const o = shop.updateOrderStatus(req.params.id, req.body.status, req.body.paymentRef); if (!o) return res.status(404).json({ error: 'Not found' }); res.json({ success: true, order: o }); });

// ─── Streams ──────────────────────────────────────────────────────────────────
app.get(`${BASE}/streams`, (req, res) => { const list = streams.listStreams({ status: req.query.status, category: req.query.category }); res.json({ streams: list, count: list.length }); });
app.get(`${BASE}/streams/stats`, auth.requireAuth, auth.requireRole('admin', 'super_admin'), (req, res) => res.json(streams.getStats()));
app.get(`${BASE}/streams/:id`, (req, res) => { const s = streams.getStream(req.params.id); if (!s) return res.status(404).json({ error: 'Not found' }); res.json({ stream: s }); });
app.post(`${BASE}/streams`, auth.requireAuth, auth.requireRole('admin', 'super_admin'), (req, res) => { try { res.json({ success: true, stream: streams.createStream(req.body) }); } catch (err) { res.status(400).json({ error: err.message }); } });
app.patch(`${BASE}/streams/:id`, auth.requireAuth, auth.requireRole('admin', 'super_admin'), (req, res) => { const s = streams.updateStream(req.params.id, req.body); if (!s) return res.status(404).json({ error: 'Not found' }); res.json({ success: true, stream: s }); });
app.patch(`${BASE}/streams/:id/status`, auth.requireAuth, auth.requireRole('admin', 'super_admin'), (req, res) => { const s = streams.setStreamStatus(req.params.id, req.body.status); if (!s) return res.status(404).json({ error: 'Not found' }); res.json({ success: true, stream: s }); });
app.delete(`${BASE}/streams/:id`, auth.requireAuth, auth.requireRole('admin', 'super_admin'), (req, res) => { streams.deleteStream(req.params.id); res.json({ success: true }); });
app.post(`${BASE}/streams/:id/view`, (req, res) => { streams.recordView(req.params.id); res.json({ success: true }); });
app.get(`${BASE}/streams/:id/comments`, (req, res) => { const c = streams.listComments(req.params.id); res.json({ comments: c, count: c.length }); });
app.post(`${BASE}/streams/:id/comments`, (req, res) => res.json({ success: true, comment: streams.postComment(req.params.id, req.body.name, req.body.message) }));
app.delete(`${BASE}/streams/:streamId/comments/:commentId`, auth.requireAuth, auth.requireRole('admin', 'super_admin'), (req, res) => { streams.deleteComment(req.params.streamId, req.params.commentId); res.json({ success: true }); });

// ─── Register (legacy endpoints) ─────────────────────────────────────────────
app.post(`${BASE}/register/member`, async (req, res) => { try { const registration = await registrations.registerMember(req.body); setImmediate(() => notifyNewApplication('member', registration)); res.json({ registration }); } catch (err) { res.status(400).json({ error: err.message }); } });
app.get(`${BASE}/register/members`, auth.requireAuth, auth.requireRole('admin', 'super_admin'), (req, res) => res.json({ members: registrations.listMembers({ status: req.query.status }) }));
app.get(`${BASE}/register/members/stats`, auth.requireAuth, auth.requireRole('admin', 'super_admin'), (req, res) => res.json(registrations.getMemberStats()));
app.patch(`${BASE}/register/members/:id/status`, auth.requireAuth, auth.requireRole('admin', 'super_admin'), (req, res) => { const m = registrations.updateMemberStatus(req.params.id, req.body.status, req.body.note); if (!m) return res.status(404).json({ error: 'Not found' }); res.json({ member: m }); });
app.post(`${BASE}/register/internship`, (req, res) => { try { const registration = registrations.registerIntern(req.body); setImmediate(() => notifyNewApplication('internship', registration)); res.json({ registration }); } catch (err) { res.status(400).json({ error: err.message }); } });
app.get(`${BASE}/register/interns`, auth.requireAuth, auth.requireRole('admin', 'super_admin'), (req, res) => res.json({ interns: registrations.listInterns() }));
app.post(`${BASE}/register/agent`, (req, res) => { try { const registration = registrations.registerAgent(req.body); setImmediate(() => notifyNewApplication('agent', registration)); res.json({ registration }); } catch (err) { res.status(400).json({ error: err.message }); } });
app.get(`${BASE}/register/agents`, auth.requireAuth, auth.requireRole('admin', 'super_admin'), (req, res) => res.json({ agents: registrations.listAgents() }));
app.delete(`${BASE}/register/agent/:id`, auth.requireAuth, auth.requireRole('super_admin'), (req, res) => { const ok = registrations.deleteAgent(req.params.id); if (!ok) return res.status(404).json({ error: 'Agent registration not found' }); res.json({ success: true }); });

// ─── Public application form (all 7 tiers: national through polling_station) ─
// This is the endpoint frontend/src/app/pages/registration/PollingAgentRegistration.tsx
// actually calls. It previously didn't exist at all — the form only had a
// matching GET .../capacity and a permanently-stubbed GET .../validate,
// meaning every application silently failed to reach the server and was
// quietly queued in the applicant's own browser localStorage instead,
// looking like a successful submission with nothing ever really submitted.
app.post(`${BASE}/registrations/agent`, async (req, res) => {
  try {
    const { role, scopeId, scopeName, dateOfBirth, nrcNumber, voterCardNumber, email, username, password } = req.body;
    if (!role || !scopeId) return res.status(400).json({ error: 'role and scopeId are required' });

    // Applicant chooses their own username and password on the form now.
    if (!username || !String(username).trim()) return res.status(400).json({ error: 'Please choose a username.' });
    if (!/^[a-zA-Z0-9_.]{4,20}$/.test(username)) {
      return res.status(400).json({ error: 'Username must be 4-20 characters, letters/numbers/underscore/period only.' });
    }
    if (!password || String(password).length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters.' });
    if (auth.getUser(username)) {
      return res.status(409).json({ error: 'That username is already taken. Please choose a different one.' });
    }

    // Applicants under 16 are refused outright.
    if (dateOfBirth) {
      const dob = new Date(dateOfBirth);
      if (!Number.isNaN(dob.getTime())) {
        const today = new Date();
        let age = today.getFullYear() - dob.getFullYear();
        const monthDiff = today.getMonth() - dob.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) age--;
        if (age < 16) {
          return res.status(400).json({ error: 'Applicants must be at least 16 years old. This application cannot be accepted.' });
        }
      }
    }

    // NRC number, voter's card number, and email may each only be on
    // record for one person — a new application reusing any of them from
    // an existing (non-rejected) application is refused.
    const dup = registrations.findDuplicateIdentity({ nrcNumber, voterCardNumber, email });
    if (dup) {
      return res.status(409).json({
        error: `This ${dup.field} is already on record for another application. Each ${dup.field} may only be used once. Please contact BOZ if you believe this is an error.`,
      });
    }

    // The actual fix for "an applicant must only apply if no one else has
    // applied for that polling station" — checked per role+scope, not as a
    // single national aggregate. A pending OR approved application for this
    // exact position blocks further applications; a rejected/withdrawn one
    // frees it back up.
    if (registrations.isRoleScopeTaken(role, scopeId)) {
      return res.status(409).json({
        error: `An application has already been submitted for ${scopeName || 'this position'}. Please choose a different position, or contact BOZ if you believe this is an error.`,
      });
    }

    const registration = registrations.registerAgent(req.body);
    const withAccount = await registrations.createPendingAccount('agent', registration);
    setImmediate(() => notifyNewApplication('agent', withAccount));
    setImmediate(() => sendApplicantWelcomeEmail(withAccount, withAccount.roleLabel || withAccount.role));
    res.json({ registration: withAccount });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get(`${BASE}/registrations/agent/capacity`, (req, res) => res.json({ capacity: registrations.getRoleCapacity() }));

// Which scopeIds (e.g. which polling stations within a ward) are already
// taken for a given role, so the form can grey them out before the
// applicant even picks one instead of only finding out on submit.
app.get(`${BASE}/registrations/agent/taken`, (req, res) => {
  const role = req.query.role;
  if (!role) return res.status(400).json({ error: 'role is required' });
  res.json({ taken: Array.from(registrations.takenScopeIdsForRole(role)) });
});

app.get(`${BASE}/registrations/agent/validate`, (req, res) => {
  const { role, scopeId } = req.query;
  if (!role || !scopeId) return res.json({ valid: false, message: 'role and scopeId are required' });
  const taken = registrations.isRoleScopeTaken(role, scopeId);
  res.json({ valid: !taken, message: taken ? 'An application has already been submitted for this position.' : 'Position is available.' });
});

// This is what RegistrationApprovalAdmin.tsx (the super-admin approval
// screen) actually calls — it didn't exist before, so submitted
// applications had nowhere to be listed for review even after the POST
// endpoint above was fixed to actually accept them.
app.get(`${BASE}/registrations/agent`, auth.requireAuth, auth.requireRole('super_admin', 'admin'), (req, res) => {
  const regs = registrations.listAgents({ status: req.query.status });
  res.json({ registrations: regs, applications: regs, count: regs.length });
});

app.patch(`${BASE}/registrations/agent/:id/status`, auth.requireAuth, auth.requireRole('super_admin', 'admin'), async (req, res) => {
  const { status, notes } = req.body;
  let reg = registrations.updateAgentStatus(req.params.id, status);
  if (!reg) return res.status(404).json({ error: 'Registration not found' });
  reg = registrations.updateAgent(req.params.id, { notes, reviewedAt: new Date().toISOString(), reviewedBy: req.user?.username });

  let activated = false;
  if (status === 'approved') {
    // Approving an application is now purely a status action — it does
    // not generate, show, or send any password. Applicants create their
    // own username and password at application time
    // (registrations.createPendingAccount); approval just switches that
    // already-existing (inactive) account on and lets them know by
    // email. Nothing here ever displays a password to an admin.
    if (reg.username && !reg.loginGranted) {
      try {
        auth.activateUser(reg.username);
        reg = registrations.updateAgent(req.params.id, { loginGranted: true, loginActivatedAt: new Date().toISOString() });
        activated = true;
        console.log(`[activate] Enabled login for agent/${reg.id}: ${reg.username}`);
        setImmediate(() => sendApprovalNotificationEmail(reg));
      } catch (e) { console.error(`[activate] Failed for agent/${req.params.id}:`, e.message); }
    } else if (!reg.username) {
      // Legacy record from before applicants chose their own credentials
      // at signup — has nothing to activate. Deliberately does NOT
      // auto-generate a password here; an admin must use the separate
      // "Grant Login" action for these specific old records, so
      // approving never silently creates credentials as a side effect.
      console.warn(`[activate] agent/${req.params.id} has no self-chosen username — approved, but needs manual "Grant Login" (legacy record).`);
    }
  }
  res.json({ success: true, application: reg, registration: reg, activated });
});

app.post(`${BASE}/registrations/agent/:id/grant-login`, auth.requireAuth, auth.requireRole('super_admin', 'admin'), async (req, res) => {
  try {
    const id = req.params.id;
    const reg = registrations.getAgent(id);
    if (!reg) return res.status(404).json({ error: `Registration ${id} not found` });
    const name = reg.fullName || reg.name || ((reg.firstName || '') + ' ' + (reg.lastName || '')).trim() || 'user';
    const safeName = name.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 10) || 'user';
    const suffix = reg.id.replace(/[^a-z0-9]/g, '').slice(-4);
    // Prefer the username already on this registration (set by
    // createPendingAccount at submission time, when the applicant chose
    // their own password) over recomputing one from scratch. Recomputing
    // can drift from the original for reasons as small as a name field
    // changing — auth.getUser() then finds nothing under the new guess,
    // falls through to creating a *second* account for the same area, and
    // the area-lock correctly (but confusingly) rejects it as already
    // taken by the applicant's own real, existing account.
    const username = reg.username || req.body.username || `agent_${safeName}_${suffix}`;
    const password = req.body.password || generatePassword();
    const role = registrations.AGENT_FORM_TIER_TO_ROLE[reg.role] || TYPE_ROLES.agent;
    const existingUser = auth.getUser(username);
    if (existingUser) { await auth.resetPassword(existingUser.id, password); await auth.activateUser(username); }
    else { await auth.registerUser({ username, role, name, email: reg.email || '', phone: reg.phone || reg.cellNumber || '', scopeId: reg.scopeId || '', scopeName: reg.scopeName || reg.pollingStationName || reg.ward || reg.constituency || reg.district || reg.province || 'National', active: true, registrationId: reg.id, registrationType: 'agent' }, password); }
    registrations.updateAgent(id, { status: reg.status === 'pending' ? 'approved' : reg.status, username, loginGranted: true, loginCreatedAt: new Date().toISOString(), loginGrantedBy: req.user?.username, pendingPassword: password });
    // This is a manual admin override for genuine edge cases (a legacy
    // record with no self-chosen password, or an admin needing to reset
    // one) — not part of normal approval. The new password still goes
    // straight to the applicant's email rather than only being shown in
    // the admin UI, same reasoning as everywhere else: an admin should
    // never be the one holding/relaying someone else's password.
    if (reg.email) setImmediate(() => sendCredentialsResetEmail({ username, name, email: reg.email }, password));
    res.json({ success: true, credentials: { username, password, role, generatedAt: new Date().toISOString(), name, alreadyExists: !!existingUser }, message: `Login granted for ${name}${reg.email ? ` — credentials emailed to ${reg.email}` : ''}` });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Public by design, same reasoning as the equivalent member endpoint above:
// the applicant has no login yet at this point, and the registration id
// doubles as their reference number to retrieve credentials once approved.
app.get(`${BASE}/registrations/agent/:id/credentials`, (req, res) => {
  const reg = registrations.getAgent(req.params.id);
  if (!reg) return res.status(404).json({ success: false, credentials: null, error: 'Registration not found' });
  if (!reg.loginGranted || !reg.username) {
    return res.json({ success: false, credentials: null, message: 'Not approved yet — check back after an admin reviews your application.' });
  }
  if (!reg.pendingPassword) {
    return res.json({ success: true, credentials: null, activated: true, username: reg.username, message: 'Your application has been approved — your account is now active. Log in with the username above and the password you created when you applied.' });
  }
  const credentials = { username: reg.username, password: reg.pendingPassword };
  registrations.updateAgent(req.params.id, { pendingPassword: null });
  res.json({ success: true, credentials, activated: false });
});
app.post(`${BASE}/register/cooperative`, (req, res) => { try { const registration = registrations.registerCoop(req.body); setImmediate(() => notifyNewApplication('cooperative', registration)); res.json({ registration }); } catch (err) { res.status(400).json({ error: err.message }); } });
app.get(`${BASE}/register/coops`, auth.requireAuth, auth.requireRole('admin', 'super_admin'), (req, res) => res.json({ coops: registrations.listCoops ? registrations.listCoops() : [] }));

// ─── Voter Register (authoritative ECZ registered-voter totals) ───────────────
// Source: rptPDListing20260508.md — ECZ Registered Voters per Polling Station
// 2026. See backend/src/voterRegister.js for details. Unlike results.js /
// elections.js (which sum whatever agents submitted), these figures are read
// straight from ECZ's own published totals, so they're correct regardless of
// submission status.
app.get(`${BASE}/voter-register/me`, auth.requireAuth, (req, res) => res.json(voterRegister.getTotalsForUser(req.user)));
app.get(`${BASE}/voter-register/national`, (req, res) => res.json({ level: 'national', ...voterRegister.getNational() }));
app.get(`${BASE}/voter-register/:level/:id/children`, (req, res) => res.json({ children: voterRegister.getChildren(req.params.level, decodeURIComponent(req.params.id)) }));
app.get(`${BASE}/voter-register/ward/:wardId/stations`, (req, res) => res.json({ stations: voterRegister.getStationsForWard(decodeURIComponent(req.params.wardId)) }));
app.get(`${BASE}/voter-register/search/:level`, (req, res) => res.json({ results: voterRegister.search(req.params.level, req.query.q) }));
app.get(`${BASE}/voter-register/:level/:id`, (req, res) => { const rec = voterRegister.getByLevel(req.params.level, decodeURIComponent(req.params.id)); if (!rec) return res.status(404).json({ error: 'Not found in ECZ register' }); res.json(rec); });

// ─── Elections (legacy) ───────────────────────────────────────────────────────
app.post(`${BASE}/results/submit`, auth.requireAuth, auth.requireRole('admin', 'super_admin', 'agent'), (req, res) => res.json({ result: elections.submitResult(req.body, req.user.username) }));
app.get(`${BASE}/results/station/:stationId/:category`, (req, res) => { const r = elections.getStationResult(req.params.stationId, req.params.category); if (!r) return res.status(404).json({ error: 'No results yet' }); res.json({ result: r }); });
app.post(`${BASE}/results/verify/:stationId/:category`, auth.requireAuth, auth.requireRole('admin', 'super_admin'), (req, res) => { const r = elections.verifyResult(req.params.stationId, req.params.category, req.user.username); if (!r) return res.status(404).json({ error: 'Not found' }); res.json({ result: r }); });
app.get(`${BASE}/results/aggregated/:category/:level/:id?`, (req, res) => res.json(elections.getAggregated(req.params.category, req.params.level, req.params.id)));
app.get(`${BASE}/results/summary/:category`, (req, res) => res.json(elections.getSummary(req.params.category)));

// ─── Press ────────────────────────────────────────────────────────────────────
app.get(`${BASE}/press`, (req, res) => res.json({ statements: press.listStatements() }));
app.get(`${BASE}/press/years`, (req, res) => res.json({ years: press.getYears() }));
app.get(`${BASE}/press/admin`, auth.requireAuth, auth.requireRole('admin', 'super_admin'), (req, res) => res.json({ statements: press.listStatements({ includeUnpublished: true }) }));
app.get(`${BASE}/press/:id`, (req, res) => { const s = press.getStatement(req.params.id); if (!s) return res.status(404).json({ error: 'Not found' }); res.json({ statement: s }); });
app.get(`${BASE}/press/:id/download`, (req, res) => { const s = press.getStatement(req.params.id); if (!s) return res.status(404).json({ error: 'Not found' }); const file = press.getStatementFile(req.params.id); if (!file) return res.status(404).json({ error: 'No file' }); press.updateStatement(req.params.id, { downloadCount: ((s.downloadCount) || 0) + 1 }); const [meta, b64] = file.split(','); res.setHeader('Content-Type', meta.replace('data:', '').replace(';base64', '')); res.setHeader('Content-Disposition', `attachment; filename="${s.title || 'statement'}.pdf"`); res.send(Buffer.from(b64, 'base64')); });
app.post(`${BASE}/press`, auth.requireAuth, auth.requireRole('admin', 'super_admin'), (req, res) => res.json({ statement: press.createStatement(req.body, req.user.username) }));
app.patch(`${BASE}/press/:id`, auth.requireAuth, auth.requireRole('admin', 'super_admin'), (req, res) => { const s = press.updateStatement(req.params.id, req.body); if (!s) return res.status(404).json({ error: 'Not found' }); res.json({ statement: s }); });
app.delete(`${BASE}/press/:id`, auth.requireAuth, auth.requireRole('admin', 'super_admin'), (req, res) => { press.deleteStatement(req.params.id); res.json({ success: true }); });

// ─── Documents ────────────────────────────────────────────────────────────────
app.get(`${BASE}/documents`, (req, res) => res.json({ documents: docs.listDocuments({ category: req.query.category, published: true }) }));
app.get(`${BASE}/documents/stats`, auth.requireAuth, (req, res) => { try { const list = docs.list ? docs.list() : []; res.json({ total: list.length, byType: {} }); } catch (e) { res.json({ total: 0, byType: {} }); } });
app.get(`${BASE}/documents/:id/meta`, auth.requireAuth, (req, res) => res.json({ meta: { id: req.params.id, size: 0, pages: 1, mimeType: 'application/pdf' } }));
app.get(`${BASE}/documents/:id`, (req, res) => { const d = docs.getDocument(req.params.id); if (!d) return res.status(404).json({ error: 'Not found' }); res.json({ document: d }); });
app.get(`${BASE}/documents/:id/download`, (req, res) => { const d = docs.getDocument(req.params.id); if (!d) return res.status(404).json({ error: 'Not found' }); const file = docs.getDocumentFile(req.params.id); if (!file) return res.status(404).json({ error: 'No file' }); docs.incrementDownload(req.params.id); const [meta, b64] = file.split(','); res.setHeader('Content-Type', meta.replace('data:', '').replace(';base64', '')); res.setHeader('Content-Disposition', `attachment; filename="${d.fileName || d.title}.${d.fileType || 'pdf'}"`); res.send(Buffer.from(b64, 'base64')); });
app.post(`${BASE}/documents`, auth.requireAuth, auth.requireRole('admin', 'super_admin'), (req, res) => res.json({ document: docs.createDocument(req.body, req.user.username) }));
app.patch(`${BASE}/documents/:id`, auth.requireAuth, auth.requireRole('admin', 'super_admin'), (req, res) => { const d = docs.updateDocument(req.params.id, req.body); if (!d) return res.status(404).json({ error: 'Not found' }); res.json({ document: d }); });
app.delete(`${BASE}/documents/:id`, auth.requireAuth, auth.requireRole('admin', 'super_admin'), (req, res) => { docs.deleteDocument(req.params.id); res.json({ success: true }); });

// ─── Membership ───────────────────────────────────────────────────────────────
app.get(`${BASE}/membership/my-profile`, auth.requireAuth, (req, res) => {
  const fullUser = auth.getUser(req.user.username);
  if (!fullUser || fullUser.registrationType !== 'member' || !fullUser.registrationId) {
    return res.status(404).json({ error: 'No member profile linked to this account' });
  }
  const member = registrations.getMember(fullUser.registrationId);
  if (!member) return res.status(404).json({ error: 'Member record not found' });
  // Never return the one-time plaintext password (or other internal
  // bookkeeping fields) through a member-facing endpoint.
  const { pendingPassword, ...safeMember } = member;
  res.json({ member: safeMember });
});

app.get(`${BASE}/shop/my-orders`, auth.requireAuth, (req, res) => {
  const fullUser = auth.getUser(req.user.username);
  if (!fullUser || fullUser.registrationType !== 'member' || !fullUser.registrationId) {
    return res.status(404).json({ error: 'No member profile linked to this account' });
  }
  const member = registrations.getMember(fullUser.registrationId);
  if (!member?.email) return res.json({ orders: [], payments: [] });
  const orders = shop.listOrders({ customerEmail: member.email });
  const payments = shop.listPayments({ orderIds: orders.map(o => o.id) });
  res.json({ orders, payments });
});

app.post(`${BASE}/shop/my-orders/:orderId/request-return`, auth.requireAuth, (req, res) => {
  const fullUser = auth.getUser(req.user.username);
  if (!fullUser || fullUser.registrationType !== 'member' || !fullUser.registrationId) {
    return res.status(404).json({ error: 'No member profile linked to this account' });
  }
  const member = registrations.getMember(fullUser.registrationId);
  const order = shop.getOrder(req.params.orderId);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  // A member can only request a return on their own order — match by
  // email rather than trusting the orderId alone.
  if (!member?.email || order.customerEmail.toLowerCase() !== member.email.toLowerCase()) {
    return res.status(403).json({ error: 'This order does not belong to your account' });
  }
  const { order: updated, error } = shop.requestReturn(req.params.orderId, req.body.reason);
  if (error) return res.status(400).json({ error });
  res.json({ success: true, order: updated });
});

// ─── Shop Buyer Accounts ───────────────────────────────────────────────────
// Lightweight customer accounts for people buying merchandise who are NOT
// (necessarily) BOZ party members — a much simpler registration than
// membership/registrationApi (no NRC, no approval queue, no area locking).
// Reuses the same auth.js primitives (PBKDF2 password hashing + JWT) as
// every other account type in this app, just under role: 'buyer'.

function requireBuyer(req, res, next) {
  if (!req.user || req.user.role !== 'buyer') {
    return res.status(403).json({ error: 'A buyer account is required for this action.' });
  }
  next();
}

function safeBuyer(user) {
  return {
    name: user.name || '', email: user.email || '', phone: user.phone || '',
    addressLine1: user.addressLine1 || '', addressLine2: user.addressLine2 || '',
    city: user.city || '', province: user.province || '',
  };
}

app.post(`${BASE}/shop/buyer/register`, async (req, res) => {
  try {
    const { name, email, phone, password, addressLine1, addressLine2, city, province } = req.body;
    if (!name || !email || !phone || !password || !addressLine1 || !city || !province) {
      return res.status(400).json({ error: 'Please fill in your name, email, phone, password, and delivery address.' });
    }
    if (String(password).length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    const username = String(email).toLowerCase().trim();
    if (auth.getUser(username)) {
      return res.status(400).json({ error: 'An account with this email already exists — please sign in instead.' });
    }
    const user = await auth.registerUser({
      username, role: 'buyer', name, email: username, phone,
      addressLine1, addressLine2: addressLine2 || '', city, province,
      active: true,
    }, password);
    const token = auth.createToken(user.username, user.role);
    res.json({ success: true, token, buyer: safeBuyer(user) });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post(`${BASE}/shop/buyer/login`, async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required.' });
    const username = String(email).toLowerCase().trim();
    const user = await auth.loginUser(username, password);
    if (!user || user.role !== 'buyer') return res.status(401).json({ error: 'Invalid email or password.' });
    const token = auth.createToken(user.username, user.role);
    res.json({ success: true, token, buyer: safeBuyer(user) });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get(`${BASE}/shop/buyer/me`, auth.requireAuth, requireBuyer, (req, res) => {
  const user = auth.getUser(req.user.username);
  if (!user) return res.status(404).json({ error: 'Account not found.' });
  res.json({ buyer: safeBuyer(user) });
});

app.patch(`${BASE}/shop/buyer/me`, auth.requireAuth, requireBuyer, async (req, res) => {
  try {
    const patch = {};
    for (const key of ['name', 'phone', 'addressLine1', 'addressLine2', 'city', 'province']) {
      if (req.body[key] !== undefined) patch[key] = req.body[key];
    }
    const updated = await auth.updateUser(req.user.username, patch);
    res.json({ success: true, buyer: safeBuyer(updated) });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get(`${BASE}/shop/buyer/orders`, auth.requireAuth, requireBuyer, (req, res) => {
  const user = auth.getUser(req.user.username);
  if (!user?.email) return res.json({ orders: [], payments: [] });
  const orders = shop.listOrders({ customerEmail: user.email });
  const payments = shop.listPayments({ orderIds: orders.map(o => o.id) });
  res.json({ orders, payments });
});

app.post(`${BASE}/shop/buyer/orders/:orderId/request-return`, auth.requireAuth, requireBuyer, (req, res) => {
  const user = auth.getUser(req.user.username);
  const order = shop.getOrder(req.params.orderId);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  if (!user?.email || order.customerEmail.toLowerCase() !== user.email.toLowerCase()) {
    return res.status(403).json({ error: 'This order does not belong to your account' });
  }
  const { order: updated, error } = shop.requestReturn(req.params.orderId, req.body.reason);
  if (error) return res.status(400).json({ error });
  res.json({ success: true, order: updated });
});

app.post(`${BASE}/membership/register`, async (req, res) => { try { const member = await registrations.registerMember(req.body); setImmediate(() => notifyNewApplication('member', member)); res.json({ member }); } catch (err) { res.status(400).json({ error: err.message }); } });
app.get(`${BASE}/membership/me`, auth.requireAuth, (req, res) => { const m = registrations.getMemberByMembershipNumber(req.query.membershipNumber); if (!m) return res.status(404).json({ error: 'Member not found' }); res.json({ member: m }); });
app.get(`${BASE}/membership/members`, auth.requireAuth, auth.requireRole('admin', 'super_admin'), (req, res) => res.json({ members: registrations.listMembers() }));
app.get(`${BASE}/membership/members/:id`, auth.requireAuth, auth.requireRole('admin', 'super_admin'), (req, res) => { const m = registrations.getMember(req.params.id); if (!m) return res.status(404).json({ error: 'Not found' }); res.json({ member: m }); });
app.get(`${BASE}/membership/stats`, auth.requireAuth, auth.requireRole('admin', 'super_admin'), (req, res) => res.json(registrations.getMemberStats()));
app.patch(`${BASE}/membership/members/:id`, auth.requireAuth, auth.requireRole('admin', 'super_admin'), (req, res) => {
  let m = registrations.updateMember(req.params.id, req.body);
  if (!m) return res.status(404).json({ error: 'Not found' });
  if (m.status === 'active' && !m.membershipNumber) {
    m = registrations.assignMembershipNumberIfNeeded(m.id);
  }
  res.json({ member: m });
});
app.post(`${BASE}/membership/members/:id/grant-adoption`, auth.requireAuth, auth.requireRole('admin', 'super_admin'), (req, res) => { const certNumber = `BOZ-ADOPT-${req.body.electionYear || new Date().getFullYear()}-${req.params.id.slice(-6).toUpperCase()}`; const member = registrations.updateMember(req.params.id, { adoptionGranted: true, adoptionGrantedAt: new Date().toISOString(), adoptionGrantedBy: req.user?.username, ...req.body, adoptionCertNumber: certNumber }); if (!member) return res.status(404).json({ error: 'Not found' }); res.json({ success: true, member }); });
app.post(`${BASE}/membership/members/:id/revoke-adoption`, auth.requireAuth, auth.requireRole('admin', 'super_admin'), (req, res) => { const member = registrations.updateMember(req.params.id, { adoptionGranted: false, adoptionRevokedAt: new Date().toISOString(), adoptionRevokedBy: req.user?.username }); if (!member) return res.status(404).json({ error: 'Not found' }); res.json({ success: true, member }); });

app.post(`${BASE}/membership/members/:id/grant-appointment`, auth.requireAuth, auth.requireRole('admin', 'super_admin'), (req, res) => { const appointmentNumber = `BOZ-APPT-${new Date().getFullYear()}-${req.params.id.slice(-6).toUpperCase()}`; const member = registrations.updateMember(req.params.id, { appointmentGranted: true, appointmentGrantedAt: new Date().toISOString(), appointmentGrantedBy: req.user?.username, ...req.body, appointmentNumber }); if (!member) return res.status(404).json({ error: 'Not found' }); res.json({ success: true, member }); });
app.post(`${BASE}/membership/members/:id/revoke-appointment`, auth.requireAuth, auth.requireRole('admin', 'super_admin'), (req, res) => { const member = registrations.updateMember(req.params.id, { appointmentGranted: false, appointmentRevokedAt: new Date().toISOString(), appointmentRevokedBy: req.user?.username }); if (!member) return res.status(404).json({ error: 'Not found' }); res.json({ success: true, member }); });
app.post(`${BASE}/membership/members/:id/link-order`, auth.requireAuth, (req, res) => { const member = registrations.updateMember(req.params.id, { orderId: req.body.orderId }); if (!member) return res.status(404).json({ error: 'Not found' }); res.json({ success: true, member }); });

// ─── Membership certificates ────────────────────────────────────────────────
const VERIFY_BASE_URL = process.env.VERIFY_BASE_URL || 'https://www.bozplans.org/verify';

function findMemberByEmailOrNumber(query) {
  if (query.number) return registrations.getMemberByMembershipNumber(query.number);
  if (query.email) return registrations.listMembers().find(m => m.email === query.email) || null;
  return null;
}

app.get(`${BASE}/membership/certificate/membership`, (req, res) => {
  const member = findMemberByEmailOrNumber(req.query);
  if (!member) return res.status(404).json({ error: 'Member not found' });
  if (!member.membershipNumber) {
    return res.status(403).json({ error: 'Membership is not active yet' });
  }
  res.json({
    certificateType: 'membership',
    membershipNumber: member.membershipNumber,
    fullName: `${member.firstName || ''} ${member.lastName || ''}`.trim(),
    tier: member.tier || 'standard',
    province: member.province, district: member.district,
    constituency: member.constituency, ward: member.ward,
    joinDate: member.joinDate || member.createdAt,
    status: member.status,
    issuedAt: member.certificateIssuedAt || member.updatedAt,
  });
});

app.get(`${BASE}/membership/certificate/card`, (req, res) => {
  const member = findMemberByEmailOrNumber(req.query);
  if (!member) return res.status(404).json({ error: 'Member not found' });
  if (!member.membershipNumber) {
    return res.status(403).json({ error: 'Card is not issued yet — membership is not approved yet.' });
  }
  res.json({
    id: member.id,
    certificateType: 'card',
    membershipNumber: member.membershipNumber,
    fullName: `${member.firstName || ''} ${member.lastName || ''}`.trim(),
    tier: member.tier || 'standard',
    joinDate: member.joinDate || member.createdAt,
    photoDataUrl: member.selfieDataUrl || null,
  });
});

app.get(`${BASE}/membership/certificate/adoption`, (req, res) => {
  const member = findMemberByEmailOrNumber(req.query);
  if (!member) return res.status(404).json({ error: 'Member not found' });
  if (!member.adoptionGranted) {
    return res.status(403).json({ error: 'Not qualified yet — adoption has not been granted by the admin.' });
  }
  res.json({
    eligible: true,
    certificateType: 'adoption',
    membershipNumber: member.membershipNumber,
    adoptionCertNumber: member.adoptionCertNumber,
    fullName: `${member.firstName || ''} ${member.lastName || ''}`.trim(),
    tier: member.tier || 'standard',
    province: member.province, district: member.district,
    constituency: member.constituency, ward: member.ward,
    joinDate: member.joinDate || member.createdAt,
    electionPosition: member.electionPosition, electionYear: member.electionYear,
    adoptionProvince: member.adoptionProvince, adoptionDistrict: member.adoptionDistrict,
    adoptionConstituency: member.adoptionConstituency, adoptionWard: member.adoptionWard,
    adoptionGrantedAt: member.adoptionGrantedAt, adoptionGrantedBy: member.adoptionGrantedBy,
    adoptionGrantedByTitle: member.adoptionGrantedByTitle, adoptionReason: member.adoptionReason,
    issuedAt: member.adoptionGrantedAt,
  });
});

app.get(`${BASE}/membership/certificate/appointment`, (req, res) => {
  const member = findMemberByEmailOrNumber(req.query);
  if (!member) return res.status(404).json({ error: 'Member not found' });
  if (!member.appointmentGranted) {
    return res.status(403).json({ error: 'No active appointment — an appointment has not been granted by the admin.' });
  }
  res.json({
    eligible: true,
    certificateType: 'appointment',
    membershipNumber: member.membershipNumber,
    appointmentNumber: member.appointmentNumber,
    fullName: `${member.firstName || ''} ${member.lastName || ''}`.trim(),
    appointmentPosition: member.appointmentPosition,
    appointmentLevel: member.appointmentLevel,
    appointmentProvince: member.appointmentProvince, appointmentDistrict: member.appointmentDistrict,
    appointmentConstituency: member.appointmentConstituency, appointmentWard: member.appointmentWard,
    appointmentTermYears: member.appointmentTermYears,
    appointmentEffectiveDate: member.appointmentEffectiveDate,
    appointmentGrantedAt: member.appointmentGrantedAt, appointmentGrantedBy: member.appointmentGrantedBy,
    appointmentGrantedByTitle: member.appointmentGrantedByTitle,
    issuedAt: member.appointmentGrantedAt,
  });
});

app.get(`${BASE}/membership/members/:id/certificate.pdf`, auth.requireAuth, async (req, res) => {
  try {
    const member = registrations.getMember(req.params.id);
    if (!member) return res.status(404).json({ error: 'Not found' });
    if (!member.membershipNumber) {
      return res.status(403).json({ error: 'Certificate not yet issued' });
    }
    const dataUrl = await memberCert.getOrCreateCertificatePdf(member, VERIFY_BASE_URL);
    const [, b64] = dataUrl.split(',');
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${member.membershipNumber}.pdf"`);
    res.send(Buffer.from(b64, 'base64'));
  } catch (err) {
    console.error('Certificate PDF generation failed:', err);
    res.status(500).json({ error: 'Failed to generate certificate' });
  }
});

app.get(`${BASE}/membership/members/:id/card.pdf`, auth.requireAuth, async (req, res) => {
  try {
    const member = registrations.getMember(req.params.id);
    if (!member) return res.status(404).json({ error: 'Not found' });
    if (!member.membershipNumber) {
      return res.status(403).json({ error: 'Card not yet issued — membership is not approved yet' });
    }
    const dataUrl = await memberCard.getOrCreateCardPdf(member);
    const [, b64] = dataUrl.split(',');
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${member.membershipNumber}-card.pdf"`);
    res.send(Buffer.from(b64, 'base64'));
  } catch (err) {
    console.error('Membership card PDF generation failed:', err);
    res.status(500).json({ error: 'Failed to generate membership card' });
  }
});

app.get(`${BASE}/membership/verify/:code`, (req, res) => {
  const code = req.params.code;
  // Membership numbers look like BOZ-YYYY-XXXXXX; adoption ones look like
  // BOZ-ADOPT-YYYY-XXXXXX; appointment ones look like BOZ-APPT-YYYY-XXXXXX.
  // Try each in turn.
  const member = registrations.getMemberByMembershipNumber(code);
  if (member && member.membershipNumber) {
    return res.json({
      valid: true,
      type: 'membership',
      fullName: `${member.firstName || ''} ${member.lastName || ''}`.trim(),
      membershipNumber: member.membershipNumber,
      tier: member.tier || 'standard',
      ward: member.ward, constituency: member.constituency,
      issuedAt: member.certificateIssuedAt || member.joinDate,
    });
  }
  const adoptedMember = registrations.listMembers().find(m => m.adoptionCertNumber === code);
  if (adoptedMember && adoptedMember.adoptionGranted) {
    return res.json({
      valid: true,
      type: 'adoption',
      fullName: `${adoptedMember.firstName || ''} ${adoptedMember.lastName || ''}`.trim(),
      adoptionCertNumber: adoptedMember.adoptionCertNumber,
      position: adoptedMember.electionPosition,
      constituency: adoptedMember.adoptionConstituency,
      issuedAt: adoptedMember.adoptionGrantedAt,
    });
  }
  const appointedMember = registrations.listMembers().find(m => m.appointmentNumber === code);
  if (appointedMember && appointedMember.appointmentGranted) {
    return res.json({
      valid: true,
      type: 'appointment',
      fullName: `${appointedMember.firstName || ''} ${appointedMember.lastName || ''}`.trim(),
      appointmentNumber: appointedMember.appointmentNumber,
      position: appointedMember.appointmentPosition,
      district: appointedMember.appointmentDistrict,
      issuedAt: appointedMember.appointmentGrantedAt,
    });
  }
  res.json({ valid: false });
});
app.get(`${BASE}/membership/members/:id/adoption-certificate.pdf`, auth.requireAuth, async (req, res) => {
  try {
    const member = registrations.getMember(req.params.id);
    if (!member) return res.status(404).json({ error: 'Not found' });
    if (!member.adoptionGranted || !member.adoptionCertNumber) {
      return res.status(403).json({ error: 'Adoption certificate not yet issued' });
    }
    const dataUrl = await adoptionCert.getOrCreateAdoptionCertificatePdf(member, VERIFY_BASE_URL);
    const [, b64] = dataUrl.split(',');
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${member.adoptionCertNumber}.pdf"`);
    res.send(Buffer.from(b64, 'base64'));
  } catch (err) {
    console.error('Adoption certificate PDF generation failed:', err);
    res.status(500).json({ error: 'Failed to generate adoption certificate' });
  }
});

app.get(`${BASE}/membership/members/:id/appointment-certificate.pdf`, auth.requireAuth, async (req, res) => {
  try {
    const member = registrations.getMember(req.params.id);
    if (!member) return res.status(404).json({ error: 'Not found' });
    if (!member.appointmentGranted || !member.appointmentNumber) {
      return res.status(403).json({ error: 'Appointment certificate not yet issued' });
    }
    const dataUrl = await appointmentCert.getOrCreateAppointmentCertificatePdf(member, VERIFY_BASE_URL);
    const [, b64] = dataUrl.split(',');
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${member.appointmentNumber}.pdf"`);
    res.send(Buffer.from(b64, 'base64'));
  } catch (err) {
    console.error('Appointment certificate PDF generation failed:', err);
    res.status(500).json({ error: 'Failed to generate appointment certificate' });
  }
});

// ─── Election Users ────────────────────────────────────────────────────────────
app.post(`${BASE}/election-users`, auth.requireAuth, auth.requireRole('super_admin', 'admin'), async (req, res) => { try { const { password, ...userData } = req.body; res.json({ user: await auth.registerUser(userData, password || 'TempPass@123') }); } catch (err) { res.status(400).json({ error: err.message }); } });
app.get(`${BASE}/election-users`, auth.requireAuth, auth.requireRole('super_admin', 'admin', 'national_manager'), (req, res) => res.json({ users: auth.listUsers() }));
app.get(`${BASE}/election-users/stats`, auth.requireAuth, auth.requireRole('super_admin', 'admin', 'national_manager'), (req, res) => { const users = auth.listUsers(); const byRole = {}; for (const u of users) { byRole[u.role] = (byRole[u.role] || 0) + 1; } const stats = { total: users.length, active: users.filter(u => u.active !== false).length, byRole }; res.json({ ...stats, stats }); });
app.get(`${BASE}/election-users/:id`, auth.requireAuth, auth.requireRole('super_admin', 'admin', 'national_manager'), (req, res) => { const user = auth.listUsers().find(u => u.id === req.params.id); if (!user) return res.status(404).json({ error: 'Not found' }); res.json({ user }); });
app.patch(`${BASE}/election-users/:id`, auth.requireAuth, auth.requireRole('super_admin', 'admin'), async (req, res) => { try { res.json({ user: await auth.updateUser(req.params.id, req.body) }); } catch (err) { res.status(400).json({ error: err.message }); } });
app.post(`${BASE}/election-users/:id/reset-password`, auth.requireAuth, auth.requireRole('super_admin', 'admin'), async (req, res) => { try { const pw = req.body.password || req.body.newPassword; if (!pw) return res.status(400).json({ error: 'Password required' }); const user = auth.listUsers().find(u => u.id === req.params.id || u.username === req.params.id); if (!user) return res.status(404).json({ error: 'Not found' }); await auth.resetPassword(user.id, pw); res.json({ success: true }); } catch (err) { res.status(400).json({ error: err.message }); } });
app.delete(`${BASE}/election-users/:id`, auth.requireAuth, auth.requireRole('super_admin'), (req, res) => { try { const user = auth.listUsers().find(u => u.id === req.params.id || u.username === req.params.id); if (!user) return res.status(404).json({ error: 'Not found' }); auth.deleteUser(user.id); res.json({ success: true }); } catch (err) { res.status(400).json({ error: err.message }); } });
app.post(`${BASE}/election-users/bulk`, auth.requireAuth, auth.requireRole('super_admin', 'admin'), async (req, res) => { const { users = [] } = req.body; let created = 0, skipped = 0; const errors = []; for (const u of users) { try { const { password, ...userData } = u; await auth.registerUser(userData, password || 'TempPass@123'); created++; } catch (e) { if (e.message.includes('already exists')) skipped++; else errors.push(`${u.username}: ${e.message}`); } } res.json({ created, skipped, errors }); });

// ─── Results Engine ────────────────────────────────────────────────────────────
app.get(`${BASE}/results/dashboard`, (req, res) => res.json({ summary: results.getDashboard() }));
app.get(`${BASE}/results/national/:electionType`, (req, res) => res.json({ result: results.getNational(req.params.electionType, req.query.stage, req.query.round) }));
app.get(`${BASE}/results/level/:electionType/:levelType/:levelId`, (req, res) => res.json({ result: results.getLevel(req.params.electionType, req.params.levelType, decodeURIComponent(req.params.levelId), req.query.stage, req.query.round) }));

// ─── Presidential runoff config (public read, admin write) ──────────────────
app.get(`${BASE}/elections/presidential/config`, (req, res) => res.json({ config: electionConfigStore.presidential }));

app.patch(`${BASE}/elections/presidential/config`, auth.requireAuth, auth.requireRole('national_manager', 'admin', 'super_admin'), (req, res) => {
  const { round, runoffCandidateIds, year } = req.body || {};
  if (round && !['round1', 'runoff'].includes(round)) return res.status(400).json({ error: "round must be 'round1' or 'runoff'" });
  if (round === 'runoff' && (!Array.isArray(runoffCandidateIds) || runoffCandidateIds.length !== 2)) {
    return res.status(400).json({ error: 'Declaring a runoff requires exactly two runoffCandidateIds.' });
  }
  const now = new Date().toISOString();
  electionConfigStore.presidential = {
    ...electionConfigStore.presidential,
    ...(round ? { round } : {}),
    ...(Array.isArray(runoffCandidateIds) ? { runoffCandidateIds } : {}),
    ...(year ? { year: Number(year) } : {}),
    updatedAt: now,
    updatedBy: req.user.username,
  };
  saveElectionConfig();
  res.json({ success: true, config: electionConfigStore.presidential });
});

// ─── Concluded election archive ──────────────────────────────────────────────
app.get(`${BASE}/elections/:electionType/archive`, (req, res) => {
  const entries = electionArchiveStore.entries
    .filter(e => e.electionType === req.params.electionType)
    .map(({ id, electionType, year, round, label, archivedAt, archivedBy }) => ({ id, electionType, year, round, label, archivedAt, archivedBy }))
    .sort((a, b) => b.year - a.year || (a.round === 'round1' ? -1 : 1));
  res.json({ entries });
});

app.get(`${BASE}/elections/:electionType/archive/:id`, (req, res) => {
  const entry = electionArchiveStore.entries.find(e => e.id === req.params.id && e.electionType === req.params.electionType);
  if (!entry) return res.status(404).json({ error: 'Archive entry not found' });
  res.json({ entry });
});

app.post(`${BASE}/elections/:electionType/archive`, auth.requireAuth, auth.requireRole('national_manager', 'admin', 'super_admin'), (req, res) => {
  const { year, round, label } = req.body || {};
  if (!year) return res.status(400).json({ error: 'year is required' });
  const electionType = req.params.electionType;
  const resolvedRound = electionType === 'presidential' && round === 'runoff' ? 'runoff' : 'round1';
  const snapshot = results.getNational(electionType, 'official', resolvedRound);
  const now = new Date().toISOString();
  const id = `arc-${electionType}-${year}-${resolvedRound}-${Date.now()}`;
  // Replace any prior archive for the same electionType+year+round (re-archiving overwrites, doesn't duplicate)
  electionArchiveStore.entries = electionArchiveStore.entries.filter(
    e => !(e.electionType === electionType && e.year === Number(year) && e.round === resolvedRound)
  );
  const entry = { id, electionType, year: Number(year), round: resolvedRound, label: label || `${year} ${resolvedRound === 'runoff' ? 'Runoff' : 'General Election'}`, result: snapshot, archivedAt: now, archivedBy: req.user.username };
  electionArchiveStore.entries.push(entry);
  saveElectionArchive();
  res.json({ success: true, entry });
});
app.get(`${BASE}/results/breakdown/:electionType/province`, (req, res) => res.json({ breakdown: results.getBreakdown(req.params.electionType, 'provinceId', null, null) }));
app.get(`${BASE}/results/breakdown/:electionType/district/:provinceId`, (req, res) => res.json({ breakdown: results.getBreakdown(req.params.electionType, 'districtId', 'provinceId', decodeURIComponent(req.params.provinceId)) }));
app.get(`${BASE}/results/breakdown/:electionType/constituency/:districtId`, (req, res) => res.json({ breakdown: results.getBreakdown(req.params.electionType, 'constituencyId', 'districtId', decodeURIComponent(req.params.districtId)) }));
app.get(`${BASE}/results/breakdown/:electionType/ward/:constituencyId`, (req, res) => res.json({ breakdown: results.getBreakdown(req.params.electionType, 'wardId', 'constituencyId', decodeURIComponent(req.params.constituencyId)) }));

// Full per-polling-station rows for PDF/Excel exports — see
// results.getStationBreakdown for what each row contains. levelType is one
// of national/province/district/constituency/ward/station; levelId is
// omitted (or ignored) for national.
app.get(`${BASE}/results/export-breakdown/:electionType/:levelType/:levelId?`, (req, res) => {
  const rows = results.getStationBreakdown(
    req.params.electionType,
    req.params.levelType,
    req.params.levelId ? decodeURIComponent(req.params.levelId) : null,
    req.query.stage,
    req.query.round
  );
  res.json({ rows, count: rows.length });
});
app.get(`${BASE}/results/leaderboard/:electionType`, (req, res) => res.json({ leaderboard: results.getLeaderboard(req.params.electionType) }));
app.get(`${BASE}/results/coverage`, (req, res) => res.json({ stats: results.getCoverage(req.query.electionType) }));
app.get(`${BASE}/results/heatmap/:electionType`, (req, res) => res.json({ heatmap: results.getHeatmap(req.params.electionType) }));
app.get(`${BASE}/results/trend/:electionType`, (req, res) => res.json({ trend: results.getTrend(req.params.electionType) }));
app.get(`${BASE}/results/live-feed`, (req, res) => res.json({ feed: results.getLiveFeed(parseInt(req.query.limit || '20', 10), req.query.electionType) }));
app.get(`${BASE}/results/compare/:electionType/:levelType/:levelId`, auth.requireAuth, (req, res) => res.json({ comparison: { electionType: req.params.electionType, boz: results.getLevel(req.params.electionType, req.params.levelType, decodeURIComponent(req.params.levelId)), ecz: null, agreementPercent: 100, flagged: false } }));
app.post(`${BASE}/results/cache/invalidate`, auth.requireAuth, auth.requireRole('super_admin', 'admin'), (req, res) => res.json({ success: true, message: 'Cache invalidated' }));
app.get(`${BASE}/results/debug`, auth.requireAuth, auth.requireRole('super_admin', 'admin'), (req, res) => { const keys = kv.getKeysByPrefix('boz:results:'); const entries = keys.map(k => { const v = kv.get(k); return { key: k, electionType: v?.electionType, pollingStationId: v?.pollingStationId, status: v?.status, candidateCount: (v?.candidateVotes || v?.candidateResults || []).length, totalVotesCast: v?.totalVotesCast || 0, submittedAt: v?.submittedAt }; }); res.json({ total: keys.length, entries }); });

// ─── ECZ Comparisons ──────────────────────────────────────────────────────────
const eczStore = { figures: [] };
app.get(`${BASE}/ecz/summary`, auth.requireAuth, (req, res) => { const f = eczStore.figures; const byElectionType = {}; const byLevelType = {}; f.forEach(x => { byElectionType[x.electionType] = (byElectionType[x.electionType]||0)+1; byLevelType[x.levelType] = (byLevelType[x.levelType]||0)+1; }); res.json({ summary: { total: f.length, byElectionType, byLevelType }, count: f.length }); });
app.get(`${BASE}/ecz/comparisons`, auth.requireAuth, (req, res) => { let f = [...eczStore.figures]; if (req.query.electionType) f = f.filter(x => x.electionType === req.query.electionType); if (req.query.levelType) f = f.filter(x => x.levelType === req.query.levelType); if (req.query.flaggedOnly === 'true') f = f.filter(x => x.isFlagged); res.json({ comparisons: f, meta: { total: f.length, withDiscrepancy: f.filter(x => x.hasDiscrepancy).length, flagged: f.filter(x => x.isFlagged).length, fullyMatching: f.filter(x => !x.hasDiscrepancy).length } }); });
app.get(`${BASE}/ecz/comparison/:electionType/:levelType/:levelId`, auth.requireAuth, (req, res) => { const fig = eczStore.figures.find(f => f.electionType === req.params.electionType && f.levelType === req.params.levelType && f.levelId === decodeURIComponent(req.params.levelId)); if (!fig) return res.status(404).json({ error: 'No ECZ comparison found' }); res.json({ comparison: fig }); });
app.post(`${BASE}/ecz/bulk-save`, auth.requireAuth, (req, res) => { let saved = 0, failed = 0; const errors = []; (req.body.figures||[]).forEach(f => { try { const now = new Date().toISOString(); const idx = eczStore.figures.findIndex(e => e.electionType===f.electionType && e.levelType===f.levelType && e.levelId===f.levelId); const entry = { ...f, id: f.id||`ecz-${Date.now()}`, updatedAt: now, enteredBy: req.user.username }; if (idx>=0) eczStore.figures[idx]=entry; else eczStore.figures.push(entry); saved++; } catch(e) { failed++; errors.push(e.message); } }); res.json({ success: true, saved, failed, errors }); });
app.get(`${BASE}/ecz/discrepancy-analysis/:electionType/:levelType/:levelId`, auth.requireAuth, (req, res) => res.json({ electionType: req.params.electionType, candidates: [], summary: { totalDiff: 0, hasDiscrepancy: false } }));

// ─── Voter Roll ───────────────────────────────────────────────────────────────
app.get(`${BASE}/voter-roll`, auth.requireAuth, (req, res) => res.json({ meta: null }));
app.delete(`${BASE}/voter-roll`, auth.requireAuth, auth.requireRole('super_admin'), (req, res) => res.json({ success: true, message: 'Voter roll cleared' }));
app.post(`${BASE}/voter-roll/verify`, (req, res) => { const roll = kv.get('voter-roll:data') || []; const voter = roll.find(v => v.nrc === req.body.nrc || (req.body.name && v.name?.toLowerCase().includes(req.body.name.toLowerCase()))); res.json({ found: !!voter, voter: voter || null }); });
app.post(`${BASE}/voter/verify`, (req, res) => res.json({ valid: false, message: 'Voter not found. Please check the details and try again.' }));
app.post(`${BASE}/voter/mark-voted`, auth.requireAuth, (req, res) => res.json({ success: true, voterNumber: req.body.voterNumber, markedAt: new Date().toISOString() }));
app.get(`${BASE}/voter/stats/:pollingStationId`, auth.requireAuth, (req, res) => res.json({ stats: { pollingStationId: req.params.pollingStationId, totalRegistered: 0, totalVoted: 0, turnout: 0 } }));

// ─── Data Entry ───────────────────────────────────────────────────────────────
const dataEntryStore = { submissions: kv.get('data-entry:submissions') || [], eczFigures: kv.get('data-entry:ecz-figures') || [], auditLog: kv.get('data-entry:audit-log') || [] };
function saveDataEntry() { kv.set('data-entry:submissions', dataEntryStore.submissions); kv.set('data-entry:ecz-figures', dataEntryStore.eczFigures); kv.set('data-entry:audit-log', dataEntryStore.auditLog); }

// ─── Presidential runoff config (Article 101) ────────────────────────────────
// round: 'round1' | 'runoff'. runoffCandidateIds: the two candidates carried
// into round 2 once round 1 fails to produce a 50%+1 majority. Declared
// explicitly by a national_manager/admin — never auto-switched — so a
// still-counting round 1 can't trip into runoff mode prematurely.
const electionConfigStore = { presidential: kv.get('boz:election-config:presidential') || { round: 'round1', runoffCandidateIds: [], year: 2026, updatedAt: null, updatedBy: null } };
function saveElectionConfig() { kv.set('boz:election-config:presidential', electionConfigStore.presidential); }

// ─── Concluded election archive ──────────────────────────────────────────────
// A permanent, point-in-time snapshot of a result (taken when a
// national_manager/admin formally archives a concluded round), so past years
// and past rounds stay viewable even after the live data is reset for the
// next contest.
const electionArchiveStore = { entries: kv.get('boz:election-archive') || [] };
function saveElectionArchive() { kv.set('boz:election-archive', electionArchiveStore.entries); }

app.post(`${BASE}/data-entry/result`, auth.requireAuth, async (req, res) => {
  try {
    const { pollingStationId, pollingStationName, wardId, wardName, constituencyId, constituencyName, districtId, districtName, provinceId, provinceName, electionType, candidates: rawCands, candidateResults, candidateVotes, totalVotesCast, totalVotes, totalRejectedBallots, totalRejected, rejectedBallots, registeredVoters, agentId, agentName, enteredBy, notes } = req.body;
    if (!pollingStationId || !electionType) return res.status(400).json({ error: 'pollingStationId and electionType required' });
    const electionRound = req.body.electionRound === 'runoff' ? 'runoff' : 'round1';

    // Enforce: polling agents can only submit for their assigned station
    const isAgent = ['polling_agent', 'agent', 'election_agent'].includes(req.user?.role || '');
    if (isAgent) {
      const user = auth.getUser(req.user.username);
      const assignedStation = user?.pollingStationId || user?.scopeId || '';
      const assignedName    = user?.pollingStationName || user?.scopeName || '';
      if (assignedStation && assignedStation !== pollingStationId) {
        return res.status(403).json({
          error: `Access denied. You are assigned to "${assignedName}" and cannot submit results for a different polling station.`
        });
      }
    }
    const rawList = candidateVotes || candidateResults || rawCands || [];
    const normCandidates = rawList.map(c => ({ candidateId: c.candidateId || c.id || '', name: c.name || c.candidateName || '', party: c.party || c.partyName || '', votes: Number(c.votes || c.voteCount || 0) }));

    // Presidential runoff: only the two candidates declared for the runoff may
    // receive votes — reject anything else so a stale/round-1 form can't leak
    // extra candidates into round-2 figures.
    if (electionType === 'presidential' && electionRound === 'runoff') {
      const runoffIds = electionConfigStore.presidential.runoffCandidateIds || [];
      const invalid = normCandidates.filter(c => c.candidateId && !runoffIds.includes(c.candidateId));
      if (runoffIds.length === 2 && invalid.length > 0) {
        return res.status(400).json({ error: `Runoff round only accepts votes for the two declared runoff candidates.` });
      }
    }

    const totalVotesNum = normCandidates.reduce((s, c) => s + c.votes, 0) || Number(totalVotesCast || totalVotes || 0);
    const rejectedNum = Number(rejectedBallots || totalRejectedBallots || totalRejected || 0);
    const registeredNum = Number(registeredVoters || 0);
    const id = `sub-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const now = new Date().toISOString();
    const emptyVerificationChain = () => ({
      ward: { status: 'pending', by: null, at: null, notes: null },
      constituency: { status: 'pending', by: null, at: null, notes: null },
      district: { status: 'pending', by: null, at: null, notes: null },
      province: { status: 'pending', by: null, at: null, notes: null },
      national: { status: 'pending', by: null, at: null, notes: null },
    });
    let submission = { id, pollingStationId, pollingStationName, wardId, wardName, constituencyId, constituencyName, districtId, districtName, provinceId, provinceName, electionType, electionRound, candidateResults: normCandidates, candidates: normCandidates, totalVotes: totalVotesNum, totalVotesCast: totalVotesNum, totalRejected: rejectedNum, totalRejectedBallots: rejectedNum, rejectedBallots: rejectedNum, registeredVoters: registeredNum, agentId, agentName: agentName || enteredBy, notes, status: 'pending', verificationChain: emptyVerificationChain(), isOfficial: false, submittedAt: now };
    // Check if station already submitted (for this round) — update instead of duplicate.
    // Round is part of the match key so a runoff submission never clobbers the
    // station's round-1 figures (and vice versa) — both stay available for the archive.
    const existingIdx = dataEntryStore.submissions.findIndex(
      s => s.pollingStationId === pollingStationId && s.electionType === electionType && (s.electionRound || 'round1') === electionRound
    );
    if (existingIdx >= 0) {
      // UPDATE existing submission (allows correction of rejected ballots)
      dataEntryStore.submissions[existingIdx] = { ...dataEntryStore.submissions[existingIdx], ...submission, id: dataEntryStore.submissions[existingIdx].id, updatedAt: now };
      submission = dataEntryStore.submissions[existingIdx];
    } else {
      dataEntryStore.submissions.push(submission);
    }
    saveDataEntry();
    // Write to results KV for immediate dashboard display. Round1 keeps the
    // original (unsuffixed) key for backward compatibility; runoff submissions
    // use a distinct key so they never overwrite the round-1 record.
    const category = electionType === 'parliament' ? 'parliamentary' : electionType;
    const stationKey = electionRound === 'runoff'
      ? `boz:results:${category}:station:${pollingStationId}:runoff`
      : `boz:results:${category}:station:${pollingStationId}`;
    kv.set(stationKey, { id, pollingStationId, pollingStationName, wardId, wardName, constituencyId, constituencyName, districtId, districtName, provinceId, provinceName, category, electionType, electionRound, candidateVotes: normCandidates, candidateResults: normCandidates, candidates: normCandidates, totalVotes: totalVotesNum, totalVotesCast: totalVotesNum, totalRejected: rejectedNum, rejectedBallots: rejectedNum, registeredVoters: registeredNum, status: 'pending', verified: false, verificationChain: submission.verificationChain, isOfficial: false, submittedBy: agentName || enteredBy || agentId || 'agent', submittedAt: now, updatedAt: now });
    res.json({ success: true, message: 'Result submitted successfully', submission: { id, submittedAt: now, status: 'pending' } });
  } catch (err) { res.status(500).json({ error: err.message }); }
});
app.get(`${BASE}/data-entry/turnout`, (req, res) => res.json({ stats: { totalStations: 0, reportingStations: dataEntryStore.submissions.length, totalVotesCast: 0 } }));
app.get(`${BASE}/data-entry/result/:pollingStationId/:electionType`, (req, res) => { const round = req.query.round === 'runoff' ? 'runoff' : 'round1'; const sub = dataEntryStore.submissions.find(s => s.pollingStationId === decodeURIComponent(req.params.pollingStationId) && s.electionType === req.params.electionType && (s.electionRound || 'round1') === round); res.json({ submitted: !!sub, submittedAt: sub?.submittedAt, status: sub?.status, id: sub?.id }); });
app.get(`${BASE}/data-entry/submissions`, auth.requireAuth, (req, res) => {
  let subs = [...dataEntryStore.submissions];
  const { status, electionType, wardId, constituencyId, districtId, provinceId, pollingStationId, agentId } = req.query;
  if (status) subs = subs.filter(s => s.status === status);
  if (electionType) subs = subs.filter(s => s.electionType === electionType);
  if (wardId) subs = subs.filter(s => s.wardId === wardId);
  if (constituencyId) subs = subs.filter(s => s.constituencyId === constituencyId);
  if (districtId) subs = subs.filter(s => s.districtId === districtId);
  if (provinceId) subs = subs.filter(s => s.provinceId === provinceId);
  if (pollingStationId) subs = subs.filter(s => s.pollingStationId === pollingStationId);
  if (agentId) subs = subs.filter(s => s.agentId === agentId);
  res.json({ submissions: subs, count: subs.length });
});

// ─── Reset Votes (Super Admin only, danger zone) ───────────────────────────────
// Wipes every submitted result/vote after testing, so the system starts clean
// on election day. Requires: the confirm string, AND a fresh re-entry of the
// account password + a separate PIN (auth.verifyStepUp) — being logged in as
// super_admin is not enough on its own for something this irreversible; a
// stolen or left-open session token can't trigger it without also knowing
// both secrets.
app.post(`${BASE}/admin/reset-votes`, auth.requireAuth, auth.requireRole('super_admin'), async (req, res) => {
  try {
    if (req.body?.confirm !== 'RESET') {
      return res.status(400).json({ error: 'Confirmation required — send { "confirm": "RESET" } to proceed.' });
    }
    const stepUpOk = await auth.verifyStepUp(req.user.username, req.body?.password, req.body?.pin);
    if (!stepUpOk) {
      return res.status(401).json({ error: 'Incorrect password or PIN. Re-enter both to confirm this action.' });
    }
    const stationsCleared = kv.delByPrefix('boz:results:');
    const submissionsCleared = dataEntryStore.submissions.length;
    dataEntryStore.submissions = [];
    dataEntryStore.auditLog.push({
      id: `audit-${Date.now()}`,
      action: 'reset_votes',
      by: req.user.username,
      at: new Date().toISOString(),
      stationsCleared,
      submissionsCleared,
    });
    saveDataEntry();
    res.json({ success: true, stationsCleared, submissionsCleared });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Reset Election Agents (Super Admin only, danger zone) ────────────────────
// Permanently deletes every login account across the full election-role
// hierarchy: polling agents up through ward, constituency, district,
// provincial, and national managers. admin/super_admin accounts are NOT
// included — those are administrative accounts, not election roles. Their
// original registration/application records are left intact; only the
// ability to log in is removed. Same confirm + password + PIN step-up gate
// as reset-votes above, since this is equally irreversible.
const ELECTION_AGENT_ROLES = [
  'polling_agent', 'agent', 'election_agent',
  'ward_manager', 'constituency_manager', 'district_manager', 'provincial_manager', 'national_manager',
];
app.post(`${BASE}/admin/reset-agents`, auth.requireAuth, auth.requireRole('super_admin'), async (req, res) => {
  try {
    if (req.body?.confirm !== 'RESET AGENTS') {
      return res.status(400).json({ error: 'Confirmation required — send { "confirm": "RESET AGENTS" } to proceed.' });
    }
    const stepUpOk = await auth.verifyStepUp(req.user.username, req.body?.password, req.body?.pin);
    if (!stepUpOk) {
      return res.status(401).json({ error: 'Incorrect password or PIN. Re-enter both to confirm this action.' });
    }
    const targets = auth.listUsers().filter(u => ELECTION_AGENT_ROLES.includes(u.role));
    for (const u of targets) auth.deleteUser(u.username);
    dataEntryStore.auditLog.push({
      id: `audit-${Date.now()}`,
      action: 'reset_agents',
      by: req.user.username,
      at: new Date().toISOString(),
      accountsDeleted: targets.length,
      roles: ELECTION_AGENT_ROLES,
    });
    saveDataEntry();
    res.json({ success: true, accountsDeleted: targets.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get(`${BASE}/data-entry/submissions/:id`, auth.requireAuth, (req, res) => { const sub = dataEntryStore.submissions.find(s => s.id === req.params.id); if (!sub) return res.status(404).json({ error: 'Not found' }); res.json({ submission: sub }); });
app.patch(`${BASE}/data-entry/submissions/:id/status`, auth.requireAuth, (req, res) => { const idx = dataEntryStore.submissions.findIndex(s => s.id === req.params.id); if (idx < 0) return res.status(404).json({ error: 'Not found' }); const now = new Date().toISOString(); const updated = { ...dataEntryStore.submissions[idx], status: req.body.status, notes: req.body.notes, reviewedAt: now, reviewedBy: req.user?.username }; dataEntryStore.submissions[idx] = updated; saveDataEntry(); const category = updated.electionType === 'parliament' ? 'parliamentary' : updated.electionType; const key = `boz:results:${category}:station:${updated.pollingStationId}`; const existing = kv.get(key); if (existing) kv.set(key, { ...existing, status: req.body.status, verified: req.body.status === 'approved' || req.body.status === 'verified', verifiedBy: req.user?.username, updatedAt: now }); res.json({ success: true, submission: updated }); });
app.get(`${BASE}/data-entry/stats`, auth.requireAuth, (req, res) => { const subs = dataEntryStore.submissions; res.json({ stats: { total: subs.length, pending: subs.filter(s => s.status === 'pending').length, approved: subs.filter(s => s.status === 'approved').length, rejected: subs.filter(s => s.status === 'rejected').length } }); });

// ─── Chain-of-custody verification (ward → constituency → district → province → national) ──
// A polling-station submission only counts toward "Official Results" once it
// has been approved sequentially at every level. Provisional results show
// every submission regardless of where it sits in this chain.
const VERIFICATION_LEVELS = ['ward', 'constituency', 'district', 'province', 'national'];
const VERIFICATION_LEVEL_ROLE = { ward: 'ward_manager', constituency: 'constituency_manager', district: 'district_manager', province: 'provincial_manager', national: 'national_manager' };
const VERIFICATION_LEVEL_SCOPE_FIELD = { ward: 'wardId', constituency: 'constituencyId', district: 'districtId', province: 'provinceId', national: null };

app.patch(`${BASE}/data-entry/submissions/:id/verify-level`, auth.requireAuth, (req, res) => {
  const { level, decision, notes } = req.body || {};
  if (!VERIFICATION_LEVELS.includes(level)) {
    return res.status(400).json({ error: `level must be one of: ${VERIFICATION_LEVELS.join(', ')}` });
  }
  if (!['approved', 'rejected', 'queried'].includes(decision)) {
    return res.status(400).json({ error: 'decision must be approved, rejected, or queried' });
  }

  const idx = dataEntryStore.submissions.findIndex(s => s.id === req.params.id);
  if (idx < 0) return res.status(404).json({ error: 'Not found' });
  const sub = dataEntryStore.submissions[idx];

  // Only the manager for this exact level (or an admin, as an override) may act here.
  const role = req.user.role;
  const isOverride = ['super_admin', 'admin'].includes(role);
  if (!isOverride && role !== VERIFICATION_LEVEL_ROLE[level]) {
    return res.status(403).json({ error: `Only a ${VERIFICATION_LEVEL_ROLE[level]} (or an admin) can verify at the ${level} level.` });
  }

  // The manager can only act on submissions within their own assigned scope.
  const scopeField = VERIFICATION_LEVEL_SCOPE_FIELD[level];
  if (!isOverride && scopeField) {
    const user = auth.getUser(req.user.username);
    if (user?.scopeId && sub[scopeField] && user.scopeId !== sub[scopeField]) {
      return res.status(403).json({ error: `This submission is outside your assigned ${level}.` });
    }
  }

  // Sequential gating: every level below this one must already be approved.
  const levelIndex = VERIFICATION_LEVELS.indexOf(level);
  if (decision === 'approved') {
    for (let i = 0; i < levelIndex; i++) {
      const priorLevel = VERIFICATION_LEVELS[i];
      if (sub.verificationChain?.[priorLevel]?.status !== 'approved') {
        return res.status(409).json({ error: `Cannot approve at ${level} level — this submission is still awaiting ${priorLevel} approval.` });
      }
    }
  }

  const now = new Date().toISOString();
  const chain = { ...(sub.verificationChain || {}) };
  chain[level] = { status: decision, by: req.user.username, at: now, notes: notes || null };
  const nowOfficial = VERIFICATION_LEVELS.every(l => chain[l]?.status === 'approved');

  // Overall status mirrors where the submission sits: rejected/queried short-
  // circuit the chain; 'verified' means at least the ward level has signed
  // off but it isn't fully official yet; 'approved' means it cleared every level.
  const overallStatus = decision === 'rejected' ? 'rejected'
    : decision === 'queried' ? 'queried'
    : nowOfficial ? 'approved'
    : 'verified';

  const updated = { ...sub, verificationChain: chain, isOfficial: nowOfficial, status: overallStatus, reviewedAt: now, reviewedBy: req.user.username };
  dataEntryStore.submissions[idx] = updated;
  saveDataEntry();

  const category = updated.electionType === 'parliament' ? 'parliamentary' : updated.electionType;
  const key = `boz:results:${category}:station:${updated.pollingStationId}`;
  const existing = kv.get(key);
  if (existing) {
    kv.set(key, { ...existing, verificationChain: chain, isOfficial: nowOfficial, status: overallStatus, verified: overallStatus === 'approved' || overallStatus === 'verified', verifiedBy: req.user.username, updatedAt: now });
  }

  res.json({ success: true, submission: updated });
});
// District-level `levelId` is ECZ's raw 3-digit code, which is NOT
// globally unique -- it repeats both across provinces (Lusaka and Kapiri
// Mposhi are both '006') and even within the same province (Eastern has
// two districts coded '001': Chadiza and Chama). Matching only on
// (levelType, levelId, electionType) meant one district's submission
// could silently overwrite a different, same-coded district's real
// submitted election figures. levelName (the actual district name, sent
// correctly-resolved by the entry page) is unique nationally, so it's
// included in every match below to close that off. Harmless no-op for
// ward/constituency/province, whose ids are already globally unique.
app.post(`${BASE}/data-entry/ecz-figures`, auth.requireAuth, (req, res) => { const { levelType, levelId, levelName, electionType, candidates: rawC, figures, totalVotes, totalVotesCast, rejectedBallots, registeredVoters, enteredBy, source, notes, constituencyId, districtId, provinceId } = req.body; if (!levelType || !levelId || !electionType) return res.status(400).json({ error: 'levelType, levelId, electionType required' }); const idx = dataEntryStore.eczFigures.findIndex(f => f.levelType === levelType && f.levelId === levelId && f.electionType === electionType && (f.levelName || f.levelId) === (levelName || levelId)); const figure = { levelType, levelId, levelName: levelName || levelId, electionType, figures: figures || rawC || [], totalVotes: Number(totalVotesCast ?? totalVotes ?? 0), totalVotesCast: Number(totalVotesCast ?? totalVotes ?? 0), rejectedBallots: Number(rejectedBallots || 0), registeredVoters: Number(registeredVoters || 0), enteredBy: enteredBy || req.user?.username || '', source, notes, constituencyId, districtId, provinceId, status: 'pending', reviewedBy: null, reviewedAt: null, savedAt: new Date().toISOString(), savedBy: req.user?.username }; if (idx >= 0) dataEntryStore.eczFigures[idx] = figure; else dataEntryStore.eczFigures.push(figure); saveDataEntry(); res.json({ success: true, figure }); });
app.get(`${BASE}/data-entry/ecz-figures`, auth.requireAuth, (req, res) => { let figs = [...dataEntryStore.eczFigures]; const { electionType, levelType, constituencyId, districtId, provinceId, status } = req.query; if (electionType) figs = figs.filter(f => f.electionType === electionType); if (levelType) figs = figs.filter(f => f.levelType === levelType); if (constituencyId) figs = figs.filter(f => f.constituencyId === constituencyId); if (districtId) figs = figs.filter(f => f.districtId === districtId); if (provinceId) figs = figs.filter(f => f.provinceId === provinceId); if (status) figs = figs.filter(f => (f.status || 'pending') === status); res.json({ figures: figs, count: figs.length }); });
app.get(`${BASE}/data-entry/ecz-figures/:levelType/:levelId/:electionType`, auth.requireAuth, (req, res) => { const levelName = req.query.levelName; const figure = dataEntryStore.eczFigures.find(f => f.levelType === req.params.levelType && f.levelId === decodeURIComponent(req.params.levelId) && f.electionType === req.params.electionType && (!levelName || (f.levelName || f.levelId) === levelName)); res.json({ exists: !!figure, figure: figure || null }); });
app.patch(`${BASE}/data-entry/ecz-figures/:levelType/:levelId/:electionType/status`, auth.requireAuth, (req, res) => { const { status, notes, levelName } = req.body; const idx = dataEntryStore.eczFigures.findIndex(f => f.levelType === req.params.levelType && f.levelId === decodeURIComponent(req.params.levelId) && f.electionType === req.params.electionType && (!levelName || (f.levelName || f.levelId) === levelName)); if (idx < 0) return res.status(404).json({ error: 'Not found' }); if (!['approved', 'rejected', 'pending'].includes(status)) return res.status(400).json({ error: 'status must be approved, rejected, or pending' }); dataEntryStore.eczFigures[idx] = { ...dataEntryStore.eczFigures[idx], status, reviewNotes: notes, reviewedBy: req.user?.username, reviewedAt: new Date().toISOString() }; saveDataEntry(); res.json({ success: true, figure: dataEntryStore.eczFigures[idx] }); });
app.delete(`${BASE}/data-entry/ecz-figures/:levelType/:levelId/:electionType`, auth.requireAuth, (req, res) => { const levelName = req.query.levelName; const before = dataEntryStore.eczFigures.length; dataEntryStore.eczFigures = dataEntryStore.eczFigures.filter(f => !(f.levelType === req.params.levelType && f.levelId === decodeURIComponent(req.params.levelId) && f.electionType === req.params.electionType && (!levelName || (f.levelName || f.levelId) === levelName))); saveDataEntry(); res.json({ success: dataEntryStore.eczFigures.length < before }); });

// ── Voter Roll (polling-station voter validation) ────────────────────────────
app.post(`${BASE}/voter-roll/upload`, auth.requireAuth, (req, res) => {
  const { pollingStationId, pollingStationName, wardId, wardName, constituencyId, constituencyName, districtId, districtName, provinceId, provinceName, records } = req.body;
  if (!pollingStationId || !Array.isArray(records)) return res.status(400).json({ error: 'pollingStationId and records[] are required' });
  if (records.length > 50000) return res.status(400).json({ error: 'Roll too large — please split into smaller files (max 50,000 records per upload).' });
  const stationRecord = voterRoll.saveStationRoll({ pollingStationId, pollingStationName, wardId, wardName, constituencyId, constituencyName, districtId, districtName, provinceId, provinceName, records, uploadedBy: req.user?.username });
  res.json({ success: true, ...stationRecord });
});
app.get(`${BASE}/voter-roll/status/:pollingStationId`, auth.requireAuth, (req, res) => {
  res.json({ status: voterRoll.getStationRollStatus(decodeURIComponent(req.params.pollingStationId)) });
});
app.get(`${BASE}/voter-roll/search`, auth.requireAuth, (req, res) => {
  res.json(voterRoll.searchVoter({ voterId: req.query.voterId, nrc: req.query.nrc, name: req.query.name, pollingStationId: req.query.pollingStationId }));
});
app.delete(`${BASE}/voter-roll/:pollingStationId`, auth.requireAuth, (req, res) => {
  voterRoll.deleteStationRoll(decodeURIComponent(req.params.pollingStationId));
  res.json({ success: true });
});
app.get(`${BASE}/data-entry/audit-log`, auth.requireAuth, (req, res) => { const limit = parseInt(req.query.limit || '50', 10); res.json({ entries: dataEntryStore.auditLog.slice(-limit), count: dataEntryStore.auditLog.length }); });

// ─── Events ───────────────────────────────────────────────────────────────────
const eventsStore = { events: kv.get('events') || [] };
function saveEvents() { kv.set('events', eventsStore.events); }
app.get(`${BASE}/events`, (req, res) => { let evts = [...eventsStore.events]; if (req.query.status) evts = evts.filter(e => e.status === req.query.status); res.json({ events: evts, count: evts.length }); });
app.get(`${BASE}/events/:id`, (req, res) => { const evt = eventsStore.events.find(e => e.id === req.params.id); if (!evt) return res.status(404).json({ error: 'Not found' }); res.json({ event: evt }); });
app.get(`${BASE}/events/:id/photo`, (req, res) => { const photo = kv.get(`events:photo:${req.params.id}`); if (!photo) return res.status(404).json({ error: 'No photo' }); const [meta, b64] = photo.split(','); res.setHeader('Content-Type', meta.replace('data:', '').replace(';base64', '')); res.send(Buffer.from(b64, 'base64')); });
app.post(`${BASE}/events`, auth.requireAuth, (req, res) => { const { imageDataUrl, ...rest } = req.body; const id = `evt-${Date.now()}`; const evt = { ...rest, id, createdAt: new Date().toISOString(), status: rest.status || 'upcoming', hasPhoto: !!imageDataUrl }; if (imageDataUrl) kv.set(`events:photo:${id}`, imageDataUrl); eventsStore.events.push(evt); saveEvents(); res.json({ event: evt }); });
app.patch(`${BASE}/events/:id`, auth.requireAuth, (req, res) => { const idx = eventsStore.events.findIndex(e => e.id === req.params.id); if (idx < 0) return res.status(404).json({ error: 'Not found' }); const { imageDataUrl, ...rest } = req.body; if (imageDataUrl) kv.set(`events:photo:${req.params.id}`, imageDataUrl); eventsStore.events[idx] = { ...eventsStore.events[idx], ...rest, ...(imageDataUrl ? { hasPhoto: true } : {}), updatedAt: new Date().toISOString() }; saveEvents(); res.json({ event: eventsStore.events[idx] }); });
app.delete(`${BASE}/events/:id`, auth.requireAuth, (req, res) => { eventsStore.events = eventsStore.events.filter(e => e.id !== req.params.id); kv.del && kv.del(`events:photo:${req.params.id}`); saveEvents(); res.json({ success: true }); });

// ─── Registrations (new /registrations/* routes) ─────────────────────────────
// All four types (agent, member, cooperative, internship) now read and
// write registrations.js's canonical boz:reg:*/* stores directly — see
// the dedicated route blocks below and further down in this file.

// Grant Login helper
function generatePassword() { const chars = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789!@#$'; let p = ''; for (let i = 0; i < 10; i++) p += chars[Math.floor(Math.random() * chars.length)]; return p; }
const TYPE_ROLES = { agent: 'polling_agent', member: 'member', internship: 'internship', cooperative: 'cooperative' };

// Sent by POST /auth/resend-login once new credentials have actually been
// generated and saved — separate from sendApplicantWelcomeEmail (that one
// only fires once, right at initial application submission).
async function sendCredentialsResetEmail(user, newPassword) {
  if (!process.env.RESEND_API_KEY || !user.email) return;
  try {
    const html = `
      <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto">
        <h2 style="color:#007A30">Your Login Details</h2>
        <p>Hi ${user.name || 'there'},</p>
        <p>Here are your new Build One Zambia login details, as requested:</p>
        <div style="background:#f3f4f6;border-radius:8px;padding:16px;margin:16px 0">
          <p style="margin:0 0 10px"><span style="color:#6b7280;font-size:12px;text-transform:uppercase;letter-spacing:0.05em">Username</span><br><strong style="font-size:16px">${user.username}</strong></p>
          <p style="margin:0"><span style="color:#6b7280;font-size:12px;text-transform:uppercase;letter-spacing:0.05em">New Password</span><br><strong style="font-size:16px">${newPassword}</strong></p>
        </div>
        <p style="color:#374151">Your previous password no longer works — please use this new one to log in.</p>
        <p style="color:#6b7280;font-size:13px">If you didn't request this, please contact BOZ immediately.</p>
      </div>`;
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: process.env.EMAIL_FROM_ADDRESS || 'no-reply@bozplans.org', to: user.email, subject: 'Your Build One Zambia Login Details', html }),
    });
    const data = await r.json();
    if (!r.ok) console.error(`[resend-login] Resend error for ${user.username}:`, data);
    else console.log(`[resend-login] Sent new credentials to ${user.username} (${user.email}): ${data.id}`);
  } catch (e) {
    console.error(`[resend-login] Failed to send credentials email for ${user.username}:`, e.message);
  }
}

// Sent to the APPLICANT themselves right after they submit — separate from
// notifyNewApplication, which only ever emails BOZ admins about the new
// application, never the applicant. Without this, an applicant who chose
// their own password/PIN at signup had no record at all of their own
// username once they closed the confirmation screen.
// Sent by PATCH /registrations/agent/:id/status when an admin approves an
// application. Unlike the other credential emails, this never includes a
// password — the applicant already knows it, since they chose it
// themselves at signup (registrations.createPendingAccount). This is
// purely a "you're approved, you can log in now" notification.
async function sendApprovalNotificationEmail(reg) {
  if (!process.env.RESEND_API_KEY || !reg.email || !reg.username) return;
  try {
    const name = reg.fullName || reg.name || ((reg.firstName || '') + ' ' + (reg.lastName || '')).trim() || 'there';
    const html = `
      <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto">
        <h2 style="color:#007A30">Application Approved!</h2>
        <p>Hi ${name},</p>
        <p>Your Build One Zambia application has been approved. You can now log in using the username and password you chose when you applied.</p>
        <div style="background:#f3f4f6;border-radius:8px;padding:16px;margin:16px 0">
          <p style="margin:0;color:#6b7280;font-size:12px;text-transform:uppercase;letter-spacing:0.05em">Your Username</p>
          <p style="margin:0;font-size:18px;font-weight:700;color:#111827">${reg.username}</p>
        </div>
        <p style="color:#6b7280;font-size:13px">Forgotten your password? Use "Resend Login Details" on the login page to reset it.</p>
        <p>Together we build One Zambia.</p>
      </div>`;
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: process.env.EMAIL_FROM_ADDRESS || 'no-reply@bozplans.org', to: reg.email, subject: 'Your Build One Zambia Application Has Been Approved', html }),
    });
    const data = await r.json();
    if (!r.ok) console.error(`[approval] Resend error sending approval email for ${reg.id}:`, data);
    else console.log(`[approval] Sent approval notification for ${reg.id} to ${reg.email}: ${data.id}`);
  } catch (e) {
    console.error(`[approval] Failed to send approval email for ${reg.id}:`, e.message);
  }
}

async function sendApplicantWelcomeEmail(reg, roleLabel) {
  if (!process.env.RESEND_API_KEY || !reg.email || !reg.username) return;
  try {
    const name = reg.fullName || reg.name || ((reg.firstName || '') + ' ' + (reg.lastName || '')).trim() || 'there';
    const html = `
      <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto">
        <h2 style="color:#007A30">Application Received</h2>
        <p>Hi ${name},</p>
        <p>Thank you for applying${roleLabel ? ` for <strong>${roleLabel}</strong>` : ''} with Build One Zambia. Your application is now awaiting admin review.</p>
        <div style="background:#f3f4f6;border-radius:8px;padding:16px;margin:16px 0">
          <p style="margin:0 0 4px;color:#6b7280;font-size:12px;text-transform:uppercase;letter-spacing:0.05em">Your Username</p>
          <p style="margin:0;font-size:18px;font-weight:700;color:#111827">${reg.username}</p>
        </div>
        <p style="color:#374151">Use this username with the password you chose when applying, once your application is approved, to log in.</p>
        <p style="color:#6b7280;font-size:13px">If you forget your password later, use the "Resend Login Details" option on the login page to reset it.</p>
        <p>Together we build One Zambia.</p>
      </div>`;
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: process.env.EMAIL_FROM_ADDRESS || 'no-reply@bozplans.org', to: reg.email, subject: 'Your Build One Zambia Application — Username Inside', html }),
    });
    const data = await r.json();
    if (!r.ok) console.error(`[welcome] Resend error sending applicant email for ${reg.id}:`, data);
    else console.log(`[welcome] Sent applicant username email for ${reg.id} to ${reg.email}: ${data.id}`);
  } catch (e) {
    console.error(`[welcome] Failed to send applicant email for ${reg.id}:`, e.message);
  }
}

// ─── Cooperative & Internship registrations — consolidated onto the ───────────
// canonical store, same treatment as member. There isn't a second live UI
// depending on registrations.js's registerCoop/registerIntern today the way
// MembershipAdmin.tsx depended on registerMember, so this wasn't an active
// user-facing bug for these two — but it was the same latent trap: a
// disconnected duplicate store that any future admin panel built against
// registrations.js (the natural place to build one, since it already has
// the list/status functions) would silently miss all real registrants.
// Consolidating now closes that off before it becomes a real bug.

function consolidatedRegRoutes(type, noun, api) {
  // api = { register, list, getOne, updateStatus, update }
  app.post(`${BASE}/registrations/${type}`, async (req, res) => {
    try {
      const reg = await api.register(req.body);
      setImmediate(() => notifyNewApplication(type, reg));
      res.json({ success: true, message: `${noun} registration submitted`, registration: reg });
    } catch (err) { res.status(400).json({ error: err.message }); }
  });

  app.get(`${BASE}/registrations/${type}`, auth.requireAuth, auth.requireRole('super_admin', 'admin'), (req, res) => {
    const regs = api.list({ status: req.query.status });
    res.json({ registrations: regs, count: regs.length });
  });

  app.patch(`${BASE}/registrations/${type}/:id/status`, auth.requireAuth, auth.requireRole('super_admin', 'admin'), async (req, res) => {
    const { status, notes } = req.body;
    let reg = api.updateStatus(req.params.id, status, notes);
    if (!reg) return res.status(404).json({ error: 'Registration not found' });
    reg = api.update(req.params.id, { reviewedAt: new Date().toISOString(), reviewedBy: req.user?.username });

    let credentials = null;
    let activated = false;
    if (status === 'approved') {
      try {
        if (reg.username && !reg.loginGranted) {
          // Applicant already chose their own password + PIN at
          // registration time — just switch their account on.
          auth.activateUser(reg.username);
          reg = api.update(req.params.id, { loginGranted: true, loginActivatedAt: new Date().toISOString() });
          activated = true;
          console.log(`[activate] Enabled login for ${type}/${reg.id}: ${reg.username}`);
        } else if (!reg.username && !reg.loginGranted) {
          // Legacy fallback for registrations submitted before applicants
          // chose their own password.
          const name = reg.fullName || reg.name || ((reg.firstName||'') + ' ' + (reg.lastName||'')).trim() || 'user';
          const safeName = name.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 10) || 'user';
          const suffix = reg.id.replace(/[^a-z0-9]/g, '').slice(-4);
          const username = `${type}_${safeName}_${suffix}`;
          const password = generatePassword();
          const role = TYPE_ROLES[type] || 'polling_agent';
          if (!auth.getUser(username)) {
            await auth.registerUser({ username, role, name, email: reg.email || '', phone: reg.phone || reg.cellNumber || '', scopeName: reg.pollingStation || reg.ward || reg.constituency || reg.district || reg.province || 'National', active: true, registrationId: reg.id, registrationType: type }, password);
          }
          credentials = { username, password, role, generatedAt: new Date().toISOString(), name };
          reg = api.update(req.params.id, { username, loginGranted: true, loginCreatedAt: new Date().toISOString(), pendingPassword: password });
          console.log(`[auto-grant] Created login for ${type}/${reg.id}: ${username}`);
        }
      } catch (e) { console.error(`[auto-grant] Failed for ${type}/${req.params.id}:`, e.message); }
    }
    res.json({ success: true, registration: reg, credentials, activated });
  });

  app.post(`${BASE}/registrations/${type}/:id/grant-login`, auth.requireAuth, auth.requireRole('super_admin', 'admin'), async (req, res) => {
    try {
      const id = req.params.id;
      const reg = api.getOne(id);
      if (!reg) return res.status(404).json({ error: `Registration ${id} not found` });
      const name = reg.fullName || reg.name || ((reg.firstName||'') + ' ' + (reg.lastName||'')).trim() || 'user';
      const safeName = name.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 10) || 'user';
      const suffix = reg.id.replace(/[^a-z0-9]/g, '').slice(-4);
      const username = req.body.username || `${type}_${safeName}_${suffix}`;
      const password = req.body.password || generatePassword();
      const role = TYPE_ROLES[type] || 'polling_agent';
      const existingUser = auth.getUser(username);
      if (existingUser) { await auth.resetPassword(existingUser.id, password); }
      else { await auth.registerUser({ username, role, name, email: reg.email || '', phone: reg.phone || reg.cellNumber || '', scopeName: reg.pollingStation || reg.ward || reg.constituency || reg.district || reg.province || 'National', active: true, registrationId: reg.id, registrationType: type }, password); }
      api.update(id, { status: reg.status === 'pending' ? 'approved' : reg.status, username, loginGranted: true, loginCreatedAt: new Date().toISOString(), loginGrantedBy: req.user?.username, pendingPassword: password });
      res.json({ success: true, credentials: { username, password, role, generatedAt: new Date().toISOString(), name, alreadyExists: !!existingUser }, message: `Login granted for ${name}` });
    } catch (e) { res.status(500).json({ error: e.message }); }
  });

  app.get(`${BASE}/registrations/${type}/:id/selfie`, auth.requireAuth, auth.requireRole('super_admin', 'admin'), (req, res) => {
    const reg = api.getOne(req.params.id);
    if (!reg) return res.status(404).json({ error: 'Not found' });
    res.json({ dataUrl: reg.selfieDataUrl || reg.selfie || null, hasSelfie: !!(reg.selfieDataUrl || reg.selfie) });
  });

  app.get(`${BASE}/registrations/${type}/:id/documents`, auth.requireAuth, auth.requireRole('super_admin', 'admin'), (req, res) => {
    const reg = api.getOne(req.params.id);
    if (!reg) return res.status(404).json({ error: `Registration ${req.params.id} not found` });
    const documents = { ...(reg.documents || reg.uploads || reg.docs || {}) };
    if (reg.selfieDataUrl && !documents.selfie) documents.selfie = reg.selfieDataUrl;
    res.json({ documents, documentsMeta: reg.documentsMeta || {}, hasDocuments: Object.keys(documents).length > 0 });
  });

  app.get(`${BASE}/registrations/${type}/:id/credentials`, (req, res) => {
    const reg = api.getOne(req.params.id);
    if (!reg) return res.status(404).json({ success: false, credentials: null, error: 'Registration not found' });
    if (!reg.loginGranted || !reg.username) {
      return res.json({ success: false, credentials: null, message: 'Not approved yet — check back after an admin reviews your application.' });
    }
    if (!reg.pendingPassword) {
      return res.json({ success: true, credentials: null, activated: true, username: reg.username, message: 'Your application has been approved — your account is now active. Log in with the username above and the password you created when you applied.' });
    }
    const name = reg.fullName || reg.name || ((reg.firstName||'') + ' ' + (reg.lastName||'')).trim() || 'user';
    const credentials = { username: reg.username, password: reg.pendingPassword };
    api.update(req.params.id, { pendingPassword: null });
    res.json({ success: true, credentials, fullName: name });
  });
}

consolidatedRegRoutes('cooperative', 'Cooperative', {
  register: registrations.registerCoop,
  list: registrations.listCoops,
  getOne: registrations.getCoop,
  updateStatus: registrations.updateCoopStatus,
  update: registrations.updateCoop,
});

consolidatedRegRoutes('internship', 'Internship', {
  register: registrations.registerIntern,
  list: registrations.listInterns,
  getOne: registrations.getIntern,
  updateStatus: (id, status) => registrations.updateInternStatus(id, status),
  update: registrations.updateIntern,
});

// ─── Member registrations — consolidated onto the canonical store ─────────────
// Previously /registrations/member (used by the live public registration
// form and the admin approval flow) wrote into an in-memory array (regStore,
// kv key reg:member) that was completely separate from the store
// /membership/* (registrations.js, boz:reg:member:* keys) already used for
// tiers, adoption granting, and certificates. A real registrant would never
// appear in the Membership Admin panel, and an approved member had no tier/
// adoption/certificate record, because the two never shared data. Both paths
// now read and write registrations.js's boz:reg:member:* records directly,
// so a registration submitted publicly, reviewed by an admin, granted login
// access, and managed for tier/adoption/certificates is the same record
// throughout.

app.post(`${BASE}/registrations/member`, async (req, res) => {
  try {
    const reg = await registrations.registerMember(req.body);
    setImmediate(() => notifyNewApplication('member', reg));
    res.json({ success: true, message: 'Member registration submitted', registration: reg });
  } catch (err) { res.status(400).json({ error: err.message }); }
});

app.get(`${BASE}/registrations/member`, auth.requireAuth, auth.requireRole('super_admin', 'admin'), (req, res) => {
  const regs = registrations.listMembers({ status: req.query.status });
  res.json({ registrations: regs, count: regs.length });
});

app.patch(`${BASE}/registrations/member/:id/status`, auth.requireAuth, auth.requireRole('super_admin', 'admin'), async (req, res) => {
  const { status, notes } = req.body;
  let reg = registrations.updateMemberStatus(req.params.id, status, notes);
  if (!reg) return res.status(404).json({ error: 'Registration not found' });
  reg = registrations.updateMember(req.params.id, { reviewedAt: new Date().toISOString(), reviewedBy: req.user?.username });

  // Auto-grant login + assign a real membership number on approval — done
  // synchronously so credentials are included in this response, not lost
  // the way they were before (see prior commit).
  let credentials = null;
  let activated = false;
  if (status === 'approved') {
    try {
      if (reg.username && !reg.loginGranted) {
        // Applicant already chose their own password + PIN at registration
        // time — just switch their account on.
        auth.activateUser(reg.username);
        reg = registrations.updateMember(req.params.id, { loginGranted: true, loginActivatedAt: new Date().toISOString() });
        activated = true;
        console.log(`[activate] Enabled login for member/${reg.id}: ${reg.username}`);
      } else if (!reg.username && !reg.loginGranted) {
        // Legacy fallback for registrations submitted before applicants
        // chose their own password.
        const name = reg.fullName || reg.name || ((reg.firstName||'') + ' ' + (reg.lastName||'')).trim() || 'user';
        const safeName = name.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 10) || 'user';
        const suffix = reg.id.replace(/[^a-z0-9]/g, '').slice(-4);
        const username = `member_${safeName}_${suffix}`;
        const password = generatePassword();
        const role = TYPE_ROLES.member;
        if (!auth.getUser(username)) {
          await auth.registerUser({ username, role, name, email: reg.email || '', phone: reg.phone || reg.cellNumber || '', scopeName: reg.pollingStation || reg.ward || reg.constituency || reg.district || reg.province || 'National', active: true, registrationId: reg.id, registrationType: 'member' }, password);
        }
        credentials = { username, password, role, generatedAt: new Date().toISOString(), name };
        reg = registrations.updateMember(req.params.id, { username, loginGranted: true, loginCreatedAt: new Date().toISOString(), pendingPassword: password });
        console.log(`[auto-grant] Created login for member/${reg.id}: ${username}`);
      }
      reg = registrations.assignMembershipNumberIfNeeded(req.params.id) || reg;
    } catch (e) { console.error(`[auto-grant] Failed for member/${req.params.id}:`, e.message); }
  }
  res.json({ success: true, registration: reg, credentials, activated });
});

app.post(`${BASE}/registrations/member/:id/grant-login`, auth.requireAuth, auth.requireRole('super_admin', 'admin'), async (req, res) => {
  try {
    const id = req.params.id;
    const reg = registrations.getMember(id);
    if (!reg) return res.status(404).json({ error: `Registration ${id} not found` });
    const name = reg.fullName || reg.name || ((reg.firstName||'') + ' ' + (reg.lastName||'')).trim() || 'user';
    const safeName = name.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 10) || 'user';
    const suffix = reg.id.replace(/[^a-z0-9]/g, '').slice(-4);
    const username = req.body.username || `member_${safeName}_${suffix}`;
    const password = req.body.password || generatePassword();
    const role = TYPE_ROLES.member;
    const existingUser = auth.getUser(username);
    if (existingUser) { await auth.resetPassword(existingUser.id, password); }
    else { await auth.registerUser({ username, role, name, email: reg.email || '', phone: reg.phone || reg.cellNumber || '', scopeName: reg.pollingStation || reg.ward || reg.constituency || reg.district || reg.province || 'National', active: true, registrationId: reg.id, registrationType: 'member' }, password); }
    registrations.updateMember(id, { status: reg.status === 'pending' ? 'approved' : reg.status, username, loginGranted: true, loginCreatedAt: new Date().toISOString(), loginGrantedBy: req.user?.username, pendingPassword: password });
    registrations.assignMembershipNumberIfNeeded(id);
    res.json({ success: true, credentials: { username, password, role, generatedAt: new Date().toISOString(), name, alreadyExists: !!existingUser }, message: `Login granted for ${name}` });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get(`${BASE}/registrations/member/:id/selfie`, auth.requireAuth, auth.requireRole('super_admin', 'admin'), (req, res) => {
  const reg = registrations.getMember(req.params.id);
  if (!reg) return res.status(404).json({ error: 'Not found' });
  res.json({ dataUrl: reg.selfieDataUrl || reg.selfie || null, hasSelfie: !!(reg.selfieDataUrl || reg.selfie) });
});

app.get(`${BASE}/registrations/member/:id/documents`, auth.requireAuth, auth.requireRole('super_admin', 'admin'), (req, res) => {
  const reg = registrations.getMember(req.params.id);
  if (!reg) return res.status(404).json({ error: `Registration ${req.params.id} not found` });
  const documents = { ...(reg.documents || reg.uploads || reg.docs || {}) };
  if (reg.selfieDataUrl && !documents.selfie) documents.selfie = reg.selfieDataUrl;
  res.json({ documents, documentsMeta: reg.documentsMeta || {}, hasDocuments: Object.keys(documents).length > 0 });
});

// Public by design: the registrant has no login yet at this point, and the
// UI already tells them to "return with your reference number" to retrieve
// credentials. The registration id doubles as that reference number/lookup
// key. The password is returned once, then cleared from storage, so it
// can't be re-fetched after the real registrant has already collected it.
app.get(`${BASE}/registrations/member/:id/credentials`, (req, res) => {
  const reg = registrations.getMember(req.params.id);
  if (!reg) return res.status(404).json({ success: false, credentials: null, error: 'Registration not found' });
  if (!reg.loginGranted || !reg.username) {
    return res.json({ success: false, credentials: null, message: 'Not approved yet — check back after an admin reviews your application.' });
  }
  if (!reg.pendingPassword) {
    return res.json({ success: true, credentials: null, activated: true, username: reg.username, message: 'Your application has been approved — your account is now active. Log in with the username above and the password you created when you applied.' });
  }
  const name = reg.fullName || reg.name || ((reg.firstName||'') + ' ' + (reg.lastName||'')).trim() || 'user';
  const credentials = { username: reg.username, password: reg.pendingPassword };
  registrations.updateMember(req.params.id, { pendingPassword: null });
  res.json({ success: true, credentials, fullName: name });
});

// Registration extras
app.get(`${BASE}/registrations/stats`, auth.requireAuth, (req, res) => { const agents = registrations.listAgents({}); const members = registrations.listMembers({}); const interns = registrations.listInterns({}); const coops = registrations.listCoops ? registrations.listCoops({}) : []; const all = [...agents, ...members, ...interns, ...coops]; res.json({ stats: { total: all.length, agent: agents.length, member: members.length, internship: interns.length, cooperative: coops.length, pending: all.filter(r => r.status === 'pending').length, approved: all.filter(r => r.status === 'approved').length, rejected: all.filter(r => r.status === 'rejected').length } }); });
app.get(`${BASE}/registrations/validate-membership`, auth.requireAuth, (req, res) => { const m = registrations.getMemberByMembershipNumber(req.query.number); if (!m) return res.json({ valid: false, error: 'Not found' }); res.json({ valid: true, fullName: `${m.firstName || ''} ${m.lastName || ''}`.trim(), membershipNumber: m.membershipNumber, status: m.status }); });
app.post(`${BASE}/registrations/validate-memberships`, auth.requireAuth, (req, res) => { const { numbers = [] } = req.body; const results2 = {}; let invalidCount = 0; for (const num of numbers) { const m = registrations.getMemberByMembershipNumber(num); if (m) results2[num] = { valid: true, fullName: `${m.firstName || ''} ${m.lastName || ''}`.trim() }; else { results2[num] = { valid: false, error: 'Not found' }; invalidCount++; } } res.json({ results: results2, invalidCount }); });

// ─── Donations ────────────────────────────────────────────────────────────────
const donationStore = { donations: kv.get('donations') || [] };
function saveDonations() { kv.set('donations', donationStore.donations); }
app.post(`${BASE}/donations`, (req, res) => { const d = { ...req.body, id: `don-${Date.now()}`, status: 'pending', createdAt: new Date().toISOString() }; donationStore.donations.push(d); saveDonations(); res.json({ success: true, donation: d }); });

// Card donations get verified against Flutterwave the same way shop card
// payments do — the "Confirm Donation" button used to just flip a UI flag
// with no payment, backend record, or Flutterwave interaction whatsoever,
// even though raw card number/CVV/expiry fields existed right there in
// the form (never actually sent anywhere, but a real risk if that had
// ever been wired up naively — collecting raw card data on your own
// server is a PCI-DSS violation regardless of whether it's currently
// used). Card entry now goes through Flutterwave's own secure inline
// widget instead, same as the shop.
app.post(`${BASE}/gateway/donation/verify-card`, async (req, res) => {
  if (!process.env.FLUTTERWAVE_SECRET_KEY) {
    return res.status(503).json({ success: false, verified: false, error: 'Payment gateway is not configured yet.' });
  }
  try {
    const { transactionId, donationId } = req.body;
    if (!transactionId || !donationId) return res.status(400).json({ success: false, verified: false, error: 'transactionId and donationId are required.' });
    const idx = donationStore.donations.findIndex(d => d.id === donationId);
    if (idx < 0) return res.status(404).json({ success: false, verified: false, error: 'Donation not found.' });
    const donation = donationStore.donations[idx];

    const r = await fetch(`${FLW_BASE}/transactions/${transactionId}/verify`, { headers: flwHeaders() });
    const data = await r.json();
    if (data.status !== 'success' || !data.data) {
      return res.json({ success: true, verified: false, result: { verified: false, status: 'failed' } });
    }
    const d = data.data;
    // Never trust the client-supplied donation amount — cross-check what
    // Flutterwave actually confirms was charged against the real donation
    // record before marking it complete.
    const amountOk = Math.abs(Number(d.amount) - Number(donation.amount)) < 0.01;
    const verified = amountOk && d.currency === 'ZMW' && d.status === 'successful';
    if (verified) {
      donationStore.donations[idx] = { ...donation, status: 'completed', paymentRef: d.tx_ref, flwTransactionId: d.id, completedAt: new Date().toISOString() };
      saveDonations();
      if (donation.email) setImmediate(() => sendReceiptEmail('donation', donationStore.donations[idx]));
    }
    res.json({
      success: true,
      verified,
      result: { verified, status: d.status === 'successful' ? 'successful' : 'failed', amount: d.amount, currency: d.currency, txRef: d.tx_ref, transactionId: d.id },
    });
  } catch (err) {
    res.status(500).json({ success: false, verified: false, error: err.message });
  }
});
app.get(`${BASE}/donations`, auth.requireAuth, (req, res) => { const donations = donationStore.donations; res.json({ donations, count: donations.length, stats: { total: donations.filter(d => d.status === 'completed').reduce((s, d) => s + (d.amount || 0), 0), count: donations.length } }); });
app.patch(`${BASE}/donations/:id/status`, auth.requireAuth, (req, res) => { const idx = donationStore.donations.findIndex(d => d.id === req.params.id); if (idx < 0) return res.status(404).json({ error: 'Not found' }); donationStore.donations[idx] = { ...donationStore.donations[idx], status: req.body.status, updatedAt: new Date().toISOString() }; saveDonations(); res.json({ success: true, donation: donationStore.donations[idx] }); });

// ─── Contact ──────────────────────────────────────────────────────────────────
const contactStore = { messages: kv.get('contact') || [] };
function saveContact() { kv.set('contact', contactStore.messages); }

async function notifyContactMessage(msg) {
  if (!process.env.RESEND_API_KEY) { console.warn(`[notify] RESEND_API_KEY not set, skipping contact-form email for ${msg.id}`); return; }
  try {
    const escape = (v) => String(v ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const html = `
      <h2>New contact form submission — Build One Zambia</h2>
      <table style="border-collapse:collapse;">
        <tr><td style="padding:4px 8px;font-weight:600;border:1px solid #ddd;">Name</td><td style="padding:4px 8px;border:1px solid #ddd;">${escape(msg.name)}</td></tr>
        <tr><td style="padding:4px 8px;font-weight:600;border:1px solid #ddd;">Email</td><td style="padding:4px 8px;border:1px solid #ddd;">${escape(msg.email)}</td></tr>
        <tr><td style="padding:4px 8px;font-weight:600;border:1px solid #ddd;">Phone</td><td style="padding:4px 8px;border:1px solid #ddd;">${escape(msg.phone) || '—'}</td></tr>
        <tr><td style="padding:4px 8px;font-weight:600;border:1px solid #ddd;">Subject</td><td style="padding:4px 8px;border:1px solid #ddd;">${escape(msg.subject) || '—'}</td></tr>
      </table>
      <p style="white-space:pre-wrap;">${escape(msg.message)}</p>
    `;
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM_ADDRESS || 'no-reply@bozplans.org',
        to: 'info@bozplans.org',
        reply_to: msg.email || undefined,
        subject: `Contact form: ${msg.subject || 'New message from ' + (msg.name || 'website visitor')}`,
        html,
      })
    });
    const data = await r.json();
    if (!r.ok) console.error('[notify] Resend error sending contact-form email:', data);
    else console.log(`[notify] Contact-form email sent to info@bozplans.org for ${msg.id}: ${data.id}`);
  } catch (e) { console.error('[notify] Failed to send contact-form email:', e.message); }
}

// Sends the submitter their own copy — confirms the message actually went
// through, gives them a record of what they wrote, and tells them who to
// expect a reply from. Runs independently of notifyContactMessage() above
// so a failure on one side never blocks the other.
async function confirmContactMessage(msg) {
  if (!process.env.RESEND_API_KEY) { console.warn(`[notify] RESEND_API_KEY not set, skipping contact-form confirmation for ${msg.id}`); return; }
  const isValidEmail = typeof msg.email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(msg.email);
  if (!isValidEmail) { console.warn(`[notify] No valid submitter email on contact message ${msg.id}, skipping confirmation`); return; }
  try {
    const escape = (v) => String(v ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const firstName = (msg.name || '').trim().split(/\s+/)[0] || 'there';
    const html = `
      <p>Hi ${escape(firstName)},</p>
      <p>Thanks for reaching out to Build One Zambia — we've received your message and someone from our team will get back to you within 2 business days.</p>
      <p style="margin:20px 0;padding:14px 16px;background:#f7f7f7;border-left:3px solid #dc2626;white-space:pre-wrap;">
        ${msg.subject ? `<strong>${escape(msg.subject)}</strong><br/>` : ''}${escape(msg.message)}
      </p>
      <p>If this wasn't you, or you need to add anything, just reply to this email or write to <a href="mailto:info@bozplans.org">info@bozplans.org</a>.</p>
      <p>— Build One Zambia</p>
    `;
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM_ADDRESS || 'no-reply@bozplans.org',
        to: msg.email,
        reply_to: 'info@bozplans.org',
        subject: `We've received your message — Build One Zambia`,
        html,
      })
    });
    const data = await r.json();
    if (!r.ok) console.error('[notify] Resend error sending contact-form confirmation:', data);
    else console.log(`[notify] Contact-form confirmation sent to ${msg.email} for ${msg.id}: ${data.id}`);
  } catch (e) { console.error('[notify] Failed to send contact-form confirmation:', e.message); }
}

app.post(`${BASE}/contact`, (req, res) => {
  const msg = { ...req.body, id: `msg-${Date.now()}`, read: false, createdAt: new Date().toISOString() };
  contactStore.messages.push(msg);
  saveContact();
  setImmediate(() => notifyContactMessage(msg));
  setImmediate(() => confirmContactMessage(msg));
  res.json({ success: true, message: 'Message received' });
});
app.get(`${BASE}/contact`, auth.requireAuth, (req, res) => { const messages = contactStore.messages; res.json({ messages, count: messages.length, unread: messages.filter(m => !m.read).length }); });
app.patch(`${BASE}/contact/:id/read`, auth.requireAuth, (req, res) => { const idx = contactStore.messages.findIndex(m => m.id === req.params.id); if (idx < 0) return res.status(404).json({ error: 'Not found' }); contactStore.messages[idx] = { ...contactStore.messages[idx], read: true }; saveContact(); res.json({ success: true }); });

// ─── Chambers ─────────────────────────────────────────────────────────────────
const chamberStore = { chambers: kv.get('chambers') || [] };
function saveChambers() { kv.set('chambers', chamberStore.chambers); }
app.get(`${BASE}/chambers`, (req, res) => res.json({ chambers: chamberStore.chambers, count: chamberStore.chambers.length }));
app.get(`${BASE}/chambers/stats`, auth.requireAuth, (req, res) => res.json({ total: chamberStore.chambers.length, active: chamberStore.chambers.filter(c => c.active).length }));
app.get(`${BASE}/chambers/amendments`, (req, res) => res.json({ amendments: kv.get('chambers:amendments') || [] }));
app.get(`${BASE}/chambers/ward/:wardId`, (req, res) => res.json({ chambers: [], wardId: req.params.wardId }));
app.get(`${BASE}/chambers/:id`, auth.requireAuth, (req, res) => { const c = chamberStore.chambers.find(x => x.id === req.params.id); if (!c) return res.status(404).json({ error: 'Not found' }); res.json({ chamber: c }); });
app.post(`${BASE}/chambers`, auth.requireAuth, (req, res) => { const c = { ...req.body, id: `ch-${Date.now()}`, createdAt: new Date().toISOString(), active: true }; chamberStore.chambers.push(c); saveChambers(); res.json({ chamber: c }); });
app.patch(`${BASE}/chambers/:id`, auth.requireAuth, (req, res) => { const idx = chamberStore.chambers.findIndex(c => c.id === req.params.id); if (idx < 0) return res.status(404).json({ error: 'Not found' }); chamberStore.chambers[idx] = { ...chamberStore.chambers[idx], ...req.body, updatedAt: new Date().toISOString() }; saveChambers(); res.json({ chamber: chamberStore.chambers[idx] }); });
app.delete(`${BASE}/chambers/:id`, auth.requireAuth, (req, res) => { chamberStore.chambers = chamberStore.chambers.filter(c => c.id !== req.params.id); saveChambers(); res.json({ success: true }); });
app.post(`${BASE}/chambers/amendments`, auth.requireAuth, (req, res) => res.json({ amendment: { id: `amend-${Date.now()}`, ...req.body, status: 'pending', createdAt: new Date().toISOString(), createdBy: req.user?.username }, success: true }));
app.patch(`${BASE}/chambers/amendments/:id/review`, auth.requireAuth, auth.requireRole('super_admin', 'admin'), (req, res) => res.json({ success: true, id: req.params.id, status: req.body.status }));

// ─── Security ─────────────────────────────────────────────────────────────────
const secStore = { blockedIPs: kv.get('security:blocked-ips') || [], sessions: kv.get('security:sessions') || [] };
function saveSec() { kv.set('security:blocked-ips', secStore.blockedIPs); kv.set('security:sessions', secStore.sessions); }
app.get(`${BASE}/security/stats`, auth.requireAuth, auth.requireRole('super_admin', 'admin'), (req, res) => res.json({ blockedIPs: secStore.blockedIPs.length, activeSessions: secStore.sessions.length, failedLogins: kv.get('security:failed-logins') || 0 }));
app.get(`${BASE}/security/sessions`, auth.requireAuth, auth.requireRole('super_admin', 'admin'), (req, res) => res.json({ sessions: secStore.sessions }));
app.delete(`${BASE}/security/sessions/all`, auth.requireAuth, auth.requireRole('super_admin', 'admin'), (req, res) => { secStore.sessions = []; saveSec(); res.json({ success: true }); });
app.get(`${BASE}/security/blocked-ips`, auth.requireAuth, auth.requireRole('super_admin', 'admin'), (req, res) => res.json({ blockedIPs: secStore.blockedIPs }));
app.post(`${BASE}/security/block-ip`, auth.requireAuth, auth.requireRole('super_admin', 'admin'), (req, res) => { if (!req.body.ip) return res.status(400).json({ error: 'IP required' }); if (!secStore.blockedIPs.find(b => b.ip === req.body.ip)) { secStore.blockedIPs.push({ ip: req.body.ip, reason: req.body.reason, blockedAt: new Date().toISOString(), blockedBy: req.user?.username }); saveSec(); } res.json({ success: true }); });
app.delete(`${BASE}/security/blocked-ips/:ip`, auth.requireAuth, auth.requireRole('super_admin', 'admin'), (req, res) => { secStore.blockedIPs = secStore.blockedIPs.filter(b => b.ip !== req.params.ip); saveSec(); res.json({ success: true }); });
app.delete(`${BASE}/security/block-ip/:ip`, auth.requireAuth, auth.requireRole('super_admin', 'admin'), (req, res) => { secStore.blockedIPs = secStore.blockedIPs.filter(b => b.ip !== decodeURIComponent(req.params.ip)); saveSec(); res.json({ success: true }); });
app.get(`${BASE}/security/audit-log`, auth.requireAuth, auth.requireRole('super_admin', 'admin'), (req, res) => res.json({ log: [], total: 0, page: 1, limit: parseInt(req.query.limit) || 50 }));
app.post(`${BASE}/security/change-password`, auth.requireAuth, async (req, res) => { try { const { currentPassword, newPassword } = req.body; if (!currentPassword || !newPassword) return res.status(400).json({ error: 'Both passwords required' }); const storedHash = kv.get(`password:${req.user.username}`); const verified = await auth.verifyPassword(currentPassword, storedHash); if (!verified) return res.status(401).json({ error: 'Current password incorrect' }); await auth.changePassword(req.user.username, newPassword); res.json({ success: true }); } catch (e) { res.status(500).json({ error: e.message }); } });
app.post(`${BASE}/security/deactivate-user`, auth.requireAuth, auth.requireRole('super_admin', 'admin'), async (req, res) => { try { await auth.updateUser(auth.getUser(req.body.username)?.id, { active: false }); res.json({ success: true }); } catch (e) { res.status(400).json({ error: e.message }); } });
app.post(`${BASE}/security/unlock-account`, auth.requireAuth, auth.requireRole('super_admin', 'admin'), async (req, res) => { try { await auth.updateUser(auth.getUser(req.body.username)?.id, { active: true, lockedUntil: null }); res.json({ success: true }); } catch (e) { res.status(400).json({ error: e.message }); } });

// ─── Shadow Cabinet ───────────────────────────────────────────────────────────
const shadowStore = { male: kv.get('shadow:male') || [], female: kv.get('shadow:female') || [] };
function saveShadow(g) { kv.set(`shadow:${g}`, shadowStore[g]); }
app.get(`${BASE}/shadow-cabinet/:gender`, (req, res) => { const g = req.params.gender; if (!['male','female'].includes(g)) return res.status(400).json({ error: 'gender must be male or female' }); res.json({ members: shadowStore[g], count: shadowStore[g].length }); });
app.get(`${BASE}/shadow-cabinet/:gender/:id`, (req, res) => { const g = req.params.gender; if (!['male','female'].includes(g)) return res.status(400).json({ error: 'invalid gender' }); const m = shadowStore[g].find(x => x.id === req.params.id); if (!m) return res.status(404).json({ error: 'Not found' }); res.json({ member: m }); });
app.get(`${BASE}/shadow-cabinet/:gender/:id/photo`, (req, res) => { const photo = kv.get(`shadow:photo:${req.params.id}`); if (!photo) return res.status(404).json({ error: 'No photo' }); const [meta, b64] = photo.split(','); res.setHeader('Content-Type', meta.replace('data:', '').replace(';base64', '')); res.send(Buffer.from(b64, 'base64')); });
app.post(`${BASE}/shadow-cabinet/:gender`, auth.requireAuth, auth.requireRole('super_admin', 'admin'), (req, res) => { const g = req.params.gender; if (!['male','female'].includes(g)) return res.status(400).json({ error: 'invalid gender' }); const { photoDataUrl, ...rest } = req.body; const id = `sc-${Date.now()}-${Math.random().toString(36).slice(2,6)}`; const m = { ...rest, id, gender: g, hasPhoto: !!photoDataUrl, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }; if (photoDataUrl) kv.set(`shadow:photo:${id}`, photoDataUrl); shadowStore[g].push(m); saveShadow(g); res.json({ member: m }); });
app.patch(`${BASE}/shadow-cabinet/:gender/reorder`, auth.requireAuth, auth.requireRole('super_admin', 'admin'), (req, res) => { const g = req.params.gender; if (!['male','female'].includes(g)) return res.status(400).json({ error: 'invalid gender' }); if (!Array.isArray(req.body.ids)) return res.status(400).json({ error: 'ids must be array' }); const map = Object.fromEntries(shadowStore[g].map(m => [m.id, m])); shadowStore[g] = req.body.ids.map(id => map[id]).filter(Boolean); saveShadow(g); res.json({ success: true }); });
app.patch(`${BASE}/shadow-cabinet/:gender/:id`, auth.requireAuth, auth.requireRole('super_admin', 'admin'), (req, res) => { const g = req.params.gender; if (!['male','female'].includes(g)) return res.status(400).json({ error: 'invalid gender' }); const idx = shadowStore[g].findIndex(m => m.id === req.params.id); if (idx < 0) return res.status(404).json({ error: 'Not found' }); const { photoDataUrl, ...rest } = req.body; if (photoDataUrl) { kv.set(`shadow:photo:${req.params.id}`, photoDataUrl); rest.hasPhoto = true; } shadowStore[g][idx] = { ...shadowStore[g][idx], ...rest, updatedAt: new Date().toISOString() }; saveShadow(g); res.json({ member: shadowStore[g][idx] }); });
app.delete(`${BASE}/shadow-cabinet/:gender/:id`, auth.requireAuth, auth.requireRole('super_admin', 'admin'), (req, res) => { const g = req.params.gender; if (!['male','female'].includes(g)) return res.status(400).json({ error: 'invalid gender' }); shadowStore[g] = shadowStore[g].filter(m => m.id !== req.params.id); kv.del && kv.del(`shadow:photo:${req.params.id}`); saveShadow(g); res.json({ success: true }); });

// ─── OTP ──────────────────────────────────────────────────────────────────────
// Was a plain in-memory object — any backend restart or redeploy between
// a code being sent and the user entering it would silently wipe it,
// leaving them with "No OTP found. Request a new one." for no visible
// reason. Moved to kv (same persistent store everything else uses) so a
// code survives exactly as long as its actual 10-minute validity window,
// not just until the next deploy.
function getOtpEntry(key) { return kv.get(`boz:otp:${key}`); }
function setOtpEntry(key, entry) { kv.set(`boz:otp:${key}`, entry); }
function deleteOtpEntry(key) { kv.del(`boz:otp:${key}`); }

// Phone verification uses Twilio Verify instead of sending raw SMS
// ourselves. Two real advantages: Verify is priced per verification
// (~$0.05) rather than per SMS ($0.30-0.43 to Zambia on Twilio's raw
// Messages API) - roughly a sixth of the cost - and Twilio owns the
// entire code lifecycle (generation, storage, expiry, retry limits,
// fraud protection) on their side, so none of that needs to live in our
// own database at all for the phone path. Requires a Verify Service
// created in the Twilio console (Verify > Services), its SID set as
// TWILIO_VERIFY_SERVICE_SID, alongside the existing TWILIO_ACCOUNT_SID/
// TWILIO_AUTH_TOKEN.
const TWILIO_VERIFY_BASE = 'https://verify.twilio.com/v2';
function twilioAuthHeader() {
  return { Authorization: `Basic ${Buffer.from(process.env.TWILIO_ACCOUNT_SID + ':' + process.env.TWILIO_AUTH_TOKEN).toString('base64')}` };
}
const twilioVerifyConfigured = () => !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_VERIFY_SERVICE_SID);

app.post(`${BASE}/otp/send`, async (req, res) => {
  try {
    const { phone, email } = req.body;
    if (!phone && !email) return res.status(400).json({ error: 'Phone or email required' });

    if (phone) {
      if (!twilioVerifyConfigured()) {
        console.warn('[OTP] Phone requested but Twilio Verify is not fully configured (need TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_VERIFY_SERVICE_SID)');
        return res.json({ success: true, sent: false, channel: null, message: 'OTP generated' });
      }
      // channel: 'sms' (default), 'whatsapp', or 'call' (voice - Twilio
      // Verify's own name for this channel is "call", not "voice").
      // SMS and Voice work as soon as that channel is enabled on the
      // Verify Service in the console - no extra approval needed.
      // WhatsApp additionally requires a WhatsApp-approved sender
      // connected to this Verify Service before it will actually
      // deliver anything; enabling the channel checkbox alone is not
      // enough for WhatsApp specifically.
      const requestedChannel = ['sms', 'whatsapp', 'call'].includes(req.body.channel) ? req.body.channel : 'sms';
      try {
        const r = await fetch(`${TWILIO_VERIFY_BASE}/Services/${process.env.TWILIO_VERIFY_SERVICE_SID}/Verifications`, {
          method: 'POST',
          headers: Object.assign({ 'Content-Type': 'application/x-www-form-urlencoded' }, twilioAuthHeader()),
          body: new URLSearchParams({ To: phone, Channel: requestedChannel }),
        });
        const data = await r.json();
        if (r.ok && data.status === 'pending') {
          return res.json({ success: true, sent: true, channel: requestedChannel, message: `OTP sent via ${requestedChannel}` });
        }
        console.error('[OTP] Twilio Verify send error:', data);
        return res.json({ success: true, sent: false, channel: null, message: 'OTP generated', error: data.message });
      } catch (e) {
        console.error('[OTP] Twilio Verify error:', e.message);
        return res.json({ success: true, sent: false, channel: null, message: 'OTP generated' });
      }
    }

    // Email path - unchanged: generate + store our own code, send via Resend.
    // (Twilio Verify also offers an Email channel, but it requires its own
    // separate SendGrid sender setup, and Resend is already confirmed
    // working - no reason to duplicate a solved problem.)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    setOtpEntry(email, { otp, expiresAt: Date.now() + 10 * 60 * 1000 });
    let sent = false;
    if (process.env.RESEND_API_KEY) {
      try {
        const r = await fetch('https://api.resend.com/emails', { method: 'POST', headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ from: process.env.EMAIL_FROM_ADDRESS || 'no-reply@bozplans.org', to: email, subject: 'Your BOZ Verification Code', html: `<p>Your verification code is: <strong style="font-size:24px;letter-spacing:4px">${otp}</strong></p><p>Valid for 10 minutes.</p>` }) });
        const data = await r.json();
        if (r.ok && data.id) sent = true;
      } catch (e) { console.error('[OTP] Resend error:', e.message); }
    }
    if (!sent) console.log(`[OTP] Code for ${email}: ${otp}`);
    const isDev = process.env.NODE_ENV !== 'production';
    res.json({ success: true, sent, channel: sent ? 'email' : null, message: sent ? 'OTP sent via email' : 'OTP generated', ...(isDev ? { otp } : {}) });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post(`${BASE}/otp/verify`, async (req, res) => {
  const { phone, email, otp } = req.body;

  if (phone) {
    if (!twilioVerifyConfigured()) return res.status(400).json({ error: 'Phone verification is not configured.' });
    try {
      const r = await fetch(`${TWILIO_VERIFY_BASE}/Services/${process.env.TWILIO_VERIFY_SERVICE_SID}/VerificationCheck`, {
        method: 'POST',
        headers: Object.assign({ 'Content-Type': 'application/x-www-form-urlencoded' }, twilioAuthHeader()),
        body: new URLSearchParams({ To: phone, Code: otp }),
      });
      const data = await r.json();
      if (r.ok && data.status === 'approved') return res.json({ success: true, verified: true });
      return res.status(400).json({ error: data.status === 'pending' ? 'Invalid code' : (data.message || 'Invalid or expired code') });
    } catch (e) {
      console.error('[OTP] Twilio Verify check error:', e.message);
      return res.status(500).json({ error: 'Could not verify code right now. Please try again.' });
    }
  }

  // Email path - unchanged, checks our own kv-stored code.
  const stored = getOtpEntry(email);
  if (!stored) return res.status(400).json({ error: 'No OTP found. Request a new one.' });
  if (Date.now() > stored.expiresAt) { deleteOtpEntry(email); return res.status(400).json({ error: 'OTP expired' }); }
  if (stored.otp !== otp) return res.status(400).json({ error: 'Invalid OTP' });
  deleteOtpEntry(email);
  res.json({ success: true, verified: true });
});

// ─── Gateway ──────────────────────────────────────────────────────────────────
app.get(`${BASE}/gateway/config`, (req, res) => {
  // This response can change (keys getting configured/rotated) and is a
  // GET with no explicit cache directive, which browsers and any
  // intermediate proxy/CDN layer are allowed to cache by default. If a
  // stale response was ever cached from before FLUTTERWAVE_PUBLIC_KEY was
  // set (returning publicKey: null), it could keep being served
  // indefinitely through a caching layer even though hitting this route
  // directly always returns the current, correct value — explicitly
  // forbidding caching closes that off entirely.
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.json({
    config: {
      flutterwaveEnabled: !!process.env.FLUTTERWAVE_SECRET_KEY,
      resendEnabled: !!process.env.RESEND_API_KEY,
      twilioEnabled: !!process.env.TWILIO_ACCOUNT_SID,
      twilioVerifyConfigured: !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_VERIFY_SERVICE_SID),
      publicKey: process.env.FLUTTERWAVE_PUBLIC_KEY || null,
      currency: 'ZMW',
      country: 'ZM',
      redirectUrl: process.env.SITE_URL || '',
      siteUrl: process.env.SITE_URL || '',
    },
  });
});

// ─── Flutterwave payment processing ──────────────────────────────────────────
// These were referenced by the frontend (ShopCheckout.tsx) all along but
// never actually existed on the backend — only the /gateway/config check
// above did. Card payments would hang forever verifying, and mobile money
// had no way to even initiate a charge.
const FLW_BASE = 'https://api.flutterwave.com/v3';
function flwHeaders() {
  return { Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`, 'Content-Type': 'application/json' };
}

// Every verification cross-checks the amount/currency Flutterwave actually
// confirms against the real order record — never trusts a client-supplied
// amount — so a tampered client request can't mark an order paid for less
// than its real total.
function confirmOrderPaid(order, flwData) {
  if (!order) return false;
  const amountOk = Math.abs(Number(flwData.amount) - Number(order.total)) < 0.01;
  const currencyOk = flwData.currency === 'ZMW';
  const statusOk = flwData.status === 'successful';
  if (amountOk && currencyOk && statusOk) {
    shop.updateOrderStatus(order.id, 'paid', flwData.tx_ref);
    if (order.email) setImmediate(() => sendReceiptEmail('order', order));
    return true;
  }
  return false;
}

// Every "a receipt will be sent to your email" message on a successful
// order/donation was never backed by any actual email — confirmOrderPaid
// and the donation verify-card endpoint only ever updated the database
// record, nothing ever called Resend. Reuses the exact same
// fetch-to-resend.com pattern already proven working elsewhere (OTP
// codes, new-application notifications) rather than anything new/untested.
async function sendReceiptEmail(kind, record) {
  if (!process.env.RESEND_API_KEY) { console.warn(`[receipt] RESEND_API_KEY not set, skipping ${kind} receipt for ${record.id}`); return; }
  try {
    const isDonation = kind === 'donation';
    const amount = isDonation ? record.amount : record.total;
    const email = record.email;
    if (!email) return;
    const subject = isDonation ? 'Thank you for your donation — Build One Zambia' : 'Your Build One Zambia order receipt';
    const html = `
      <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto">
        <h2 style="color:#007A30">${isDonation ? 'Thank you for your donation!' : 'Order Confirmed'}</h2>
        <p>Hi ${record.name || 'there'},</p>
        <p>${isDonation
          ? `Your donation of <strong>K${Number(amount).toLocaleString()}</strong> has been received and confirmed.`
          : `Your order <strong>${record.id}</strong> for <strong>K${Number(amount).toLocaleString()}</strong> has been paid and confirmed.`}</p>
        <p style="color:#6b7280;font-size:13px">Reference: ${record.paymentRef || record.id}</p>
        <p>Together we build One Zambia. Thank you for your support.</p>
      </div>`;
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: process.env.EMAIL_FROM_ADDRESS || 'no-reply@bozplans.org', to: email, subject, html }),
    });
    const data = await r.json();
    if (!r.ok) console.error(`[receipt] Resend error sending ${kind} receipt for ${record.id}:`, data);
    else console.log(`[receipt] Sent ${kind} receipt for ${record.id} to ${email}`);
  } catch (e) {
    console.error(`[receipt] Failed to send ${kind} receipt for ${record.id}:`, e.message);
  }
}

app.post(`${BASE}/gateway/mobile-money`, async (req, res) => {
  if (!process.env.FLUTTERWAVE_SECRET_KEY) {
    return res.status(503).json({ success: false, error: 'Payment gateway is not configured yet.' });
  }
  try {
    const { orderId, phone, network, customerName, customerEmail, customerPhone } = req.body;
    if (!orderId || !phone || !network) return res.status(400).json({ success: false, error: 'orderId, phone, and network are required.' });
    const order = shop.getOrder(orderId);
    if (!order) return res.status(404).json({ success: false, error: 'Order not found.' });

    const txRef = `boz-${orderId}-${Date.now()}`;
    const r = await fetch(`${FLW_BASE}/charges?type=mobile_money_zambia`, {
      method: 'POST',
      headers: flwHeaders(),
      body: JSON.stringify({
        tx_ref: txRef,
        amount: String(order.total), // real order total, not whatever the client sent
        currency: 'ZMW',
        email: customerEmail || order.customerEmail || 'no-reply@buildonezambia.com',
        phone_number: phone,
        fullname: customerName || order.customerName || 'Customer',
        network: String(network).toUpperCase(),
      }),
    });
    const data = await r.json();
    if (data.status === 'success') {
      shop.updateOrder(orderId, { paymentRef: txRef });
      // Per Flutterwave's Zambia mobile money docs, the charge response
      // carries a meta.authorization object with a redirect URL the
      // customer must visit to actually approve the payment — this was
      // previously being silently dropped, so a network requiring that
      // step (confirmed here: Airtel) would sit "awaiting approval"
      // forever since nothing ever prompted the customer to complete it.
      const authorization = data.meta?.authorization || null;
      return res.json({
        success: true,
        txRef,
        status: data.data?.status || 'pending',
        message: authorization?.redirect
          ? 'Please approve the payment on the confirmation page that just opened.'
          : (data.message || 'Check your phone and approve the payment prompt.'),
        authorization,
      });
    }
    return res.json({ success: false, error: data.message || 'Mobile money initiation failed.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get(`${BASE}/gateway/verify/:txRef`, async (req, res) => {
  if (!process.env.FLUTTERWAVE_SECRET_KEY) {
    return res.json({ result: { verified: false, status: 'error', error: 'Payment gateway is not configured.' } });
  }
  try {
    const txRef = req.params.txRef;
    const r = await fetch(`${FLW_BASE}/transactions/verify_by_reference?tx_ref=${encodeURIComponent(txRef)}`, { headers: flwHeaders() });
    const data = await r.json();
    if (data.status !== 'success' || !data.data) {
      return res.json({ result: { verified: false, status: 'pending', txRef } });
    }
    const d = data.data;
    // tx_ref is boz-{orderId}-{timestamp} — recover the order to cross-check against.
    const orderId = txRef.replace(/^boz-/, '').replace(/-\d+$/, '');
    const order = shop.getOrder(orderId);
    const verified = confirmOrderPaid(order, { amount: d.amount, currency: d.currency, status: d.status, tx_ref: d.tx_ref });
    res.json({
      result: {
        verified,
        status: d.status === 'successful' ? 'successful' : d.status === 'failed' ? 'failed' : 'pending',
        amount: d.amount, currency: d.currency, txRef: d.tx_ref, transactionId: d.id, flwRef: d.flw_ref, paymentType: d.payment_type,
      },
    });
  } catch (err) {
    res.status(500).json({ result: { verified: false, status: 'error', error: err.message } });
  }
});

// ─── Hosted checkout link (Flutterwave "Standard" flow) ─────────────────────
// The inline widget above loads checkout.flutterwave.com/v3.js as a
// same-page <script> tag, which some ad blockers / privacy extensions /
// VPNs block outright — the customer's browser fetches the page fine but
// the embedded script never initializes. This is a fallback that sidesteps
// that entirely: instead of loading anything in-page, it asks Flutterwave
// for a hosted payment page URL and does a full-page redirect there, then
// Flutterwave redirects back once payment completes. No third-party
// script runs on this site at any point in this flow.
app.post(`${BASE}/gateway/checkout-link`, async (req, res) => {
  if (!process.env.FLUTTERWAVE_SECRET_KEY) {
    return res.status(503).json({ success: false, error: 'Payment gateway is not configured yet.' });
  }
  try {
    const { type, id, name, email, phone } = req.body;
    if (!type || !id) return res.status(400).json({ success: false, error: 'type and id are required.' });

    let amount;
    if (type === 'order') {
      const order = shop.getOrder(id);
      if (!order) return res.status(404).json({ success: false, error: 'Order not found.' });
      amount = order.total;
    } else if (type === 'donation') {
      const donation = donationStore.donations.find(d => d.id === id);
      if (!donation) return res.status(404).json({ success: false, error: 'Donation not found.' });
      amount = donation.amount;
    } else {
      return res.status(400).json({ success: false, error: "type must be 'order' or 'donation'." });
    }

    const txRef = `boz-${type}-${id}-${Date.now()}`;
    // Prefer the configured SITE_URL, but fall back to wherever this
    // request actually came from — SITE_URL being unset shouldn't be a
    // hard blocker for an otherwise-working payment flow.
    const origin = process.env.SITE_URL || req.headers.origin || (req.headers.referer ? new URL(req.headers.referer).origin : '');
    if (!origin) return res.status(500).json({ success: false, error: 'Could not determine a return address for this payment. Please set SITE_URL on the backend.' });
    const redirectUrl = `${origin.replace(/\/$/, '')}/payment/complete?type=${type}&id=${encodeURIComponent(id)}`;

    const r = await fetch(`${FLW_BASE}/payments`, {
      method: 'POST',
      headers: flwHeaders(),
      body: JSON.stringify({
        tx_ref: txRef,
        amount: String(amount),
        currency: 'ZMW',
        redirect_url: redirectUrl,
        customer: { email: email || 'no-reply@buildonezambia.com', name: name || 'Customer', phonenumber: phone || '' },
        customizations: { title: 'Build One Zambia', description: type === 'order' ? 'BOZ Shop Order' : 'BOZ Donation' },
      }),
    });
    const data = await r.json();
    if (data.status === 'success' && data.data?.link) {
      return res.json({ success: true, link: data.data.link, txRef });
    }
    return res.json({ success: false, error: data.message || 'Could not create a payment link.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post(`${BASE}/gateway/verify-card`, async (req, res) => {
  if (!process.env.FLUTTERWAVE_SECRET_KEY) {
    return res.status(503).json({ success: false, verified: false, error: 'Payment gateway is not configured yet.' });
  }
  try {
    const { transactionId, orderId } = req.body;
    if (!transactionId) return res.status(400).json({ success: false, verified: false, error: 'transactionId is required.' });
    const order = shop.getOrder(orderId);
    const r = await fetch(`${FLW_BASE}/transactions/${transactionId}/verify`, { headers: flwHeaders() });
    const data = await r.json();
    if (data.status !== 'success' || !data.data) {
      return res.json({ success: true, verified: false, result: { verified: false, status: 'failed' } });
    }
    const d = data.data;
    const verified = confirmOrderPaid(order, { amount: d.amount, currency: d.currency, status: d.status, tx_ref: d.tx_ref });
    res.json({
      success: true,
      verified,
      result: {
        verified,
        status: d.status === 'successful' ? 'successful' : d.status === 'failed' ? 'failed' : 'pending',
        amount: d.amount, currency: d.currency, txRef: d.tx_ref, transactionId: d.id, flwRef: d.flw_ref, paymentType: d.payment_type,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, verified: false, error: err.message });
  }
});

// ─── Email ────────────────────────────────────────────────────────────────────
app.get(`${BASE}/email/config`, auth.requireAuth, auth.requireRole('super_admin', 'admin'), (req, res) => { const key = process.env.RESEND_API_KEY || ''; res.json({ connected: !!key, keyPreview: key ? `re_...${key.slice(-6)}` : null, fromName: process.env.EMAIL_FROM_NAME || 'Build One Zambia', fromEmail: process.env.EMAIL_FROM_ADDRESS || 'noreply@bozplans.org', adminEmail: process.env.ADMIN_EMAIL || '', siteUrl: process.env.SITE_URL || 'https://www.bozplans.org', provider: 'Resend' }); });
app.post(`${BASE}/email/test`, auth.requireAuth, auth.requireRole('super_admin', 'admin'), async (req, res) => { try { if (!process.env.RESEND_API_KEY) return res.status(400).json({ error: 'RESEND_API_KEY not configured', configured: false }); const r = await fetch('https://api.resend.com/emails', { method: 'POST', headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ from: process.env.EMAIL_FROM_ADDRESS || 'no-reply@bozplans.org', to: req.body.to || process.env.ADMIN_EMAIL, subject: 'BOZ Email Test', html: '<p>Email service is working correctly.</p>' }) }); const data = await r.json(); if (r.ok) res.json({ success: true, id: data.id }); else res.status(400).json({ error: data.message || 'Email send failed', configured: true }); } catch (e) { res.status(500).json({ error: e.message }); } });
app.post(`${BASE}/email/resend/order/:orderId`, auth.requireAuth, auth.requireRole('super_admin', 'admin'), async (req, res) => {
  const order = shop.getOrder(req.params.orderId);
  if (!order) return res.status(404).json({ success: false, error: 'Order not found' });
  if (!order.email) return res.status(400).json({ success: false, error: 'This order has no email address on file.' });
  await sendReceiptEmail('order', order);
  res.json({ success: true, orderId: req.params.orderId, message: `Receipt sent to ${order.email}` });
});
app.post(`${BASE}/email/resend/payment/:paymentRef`, auth.requireAuth, auth.requireRole('super_admin', 'admin'), async (req, res) => {
  const donation = donationStore.donations.find(d => d.paymentRef === req.params.paymentRef || d.id === req.params.paymentRef);
  if (!donation) return res.status(404).json({ success: false, error: 'Donation not found for that reference.' });
  if (!donation.email) return res.status(400).json({ success: false, error: 'This donation has no email address on file.' });
  await sendReceiptEmail('donation', donation);
  res.json({ success: true, paymentRef: req.params.paymentRef, message: `Receipt sent to ${donation.email}` });
});

// ─── Application Notifications (send all submitted applications + documents to BOZ) ──
const APPLICATION_NOTIFY_EMAIL = 'info@bozplans.org';
function formatRegLabel(k) { return k.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase()).trim(); }
async function notifyNewApplication(type, reg) {
  if (!process.env.RESEND_API_KEY) { console.warn(`[notify] RESEND_API_KEY not set, skipping application email for ${type}/${reg?.id}`); return; }
  try {
    const skipKeys = new Set(['id', 'password', 'selfieDataUrl', 'selfie', 'documents', 'uploads', 'docs', 'documentsMeta']);
    const rows = Object.entries(reg)
      .filter(([k, v]) => !skipKeys.has(k) && v !== undefined && v !== null && v !== '')
      .map(([k, v]) => `<tr><td style="padding:4px 8px;font-weight:600;border:1px solid #ddd;">${formatRegLabel(k)}</td><td style="padding:4px 8px;border:1px solid #ddd;">${typeof v === 'object' ? JSON.stringify(v) : String(v)}</td></tr>`)
      .join('');

    // Collect any uploaded documents/selfie as email attachments
    const attachments = [];
    const docSources = { ...(reg.documents || {}), ...(reg.uploads || {}), ...(reg.docs || {}) };
    if (reg.selfieDataUrl) docSources.selfie = reg.selfieDataUrl;
    else if (reg.selfie) docSources.selfie = reg.selfie;
    for (const [name, val] of Object.entries(docSources)) {
      if (typeof val === 'string' && val.startsWith('data:')) {
        const [meta, b64] = val.split(',');
        const ext = (meta.match(/data:[^/]+\/([^;]+)/) || [, 'bin'])[1];
        if (b64) attachments.push({ filename: `${name}.${ext}`, content: b64 });
      }
    }

    const html = `<h2>New ${formatRegLabel(type)} application submitted</h2><p>A new ${type} registration/application was submitted through the BOZ website.</p><table style="border-collapse:collapse;">${rows}</table><p>${attachments.length ? `${attachments.length} document(s) attached.` : 'No documents were attached to this application.'}</p>`;

    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM_ADDRESS || 'no-reply@bozplans.org',
        to: APPLICATION_NOTIFY_EMAIL,
        subject: `New ${formatRegLabel(type)} application — ${reg.fullName || reg.name || ((reg.firstName || '') + ' ' + (reg.lastName || '')).trim() || reg.id}`,
        html,
        ...(attachments.length ? { attachments } : {})
      })
    });
    const data = await r.json();
    if (!r.ok) console.error(`[notify] Resend error sending ${type} application email:`, data);
    else console.log(`[notify] Application email sent to ${APPLICATION_NOTIFY_EMAIL} for ${type}/${reg.id}: ${data.id}`);
  } catch (e) { console.error(`[notify] Failed to send ${type} application email:`, e.message); }
}

// ─── Adoption certs ───────────────────────────────────────────────────────────
const _adoptionStore = [];
app.get(`${BASE}/adoption-certs`, auth.requireAuth, auth.requireRole('super_admin', 'admin'), (req, res) => res.json({ certs: _adoptionStore, total: _adoptionStore.length }));
app.post(`${BASE}/adoption-certs`, auth.requireAuth, auth.requireRole('super_admin', 'admin'), (req, res) => { const cert = { id: `cert-${Date.now()}`, ...req.body, issuedAt: new Date().toISOString(), issuedBy: req.user.username }; _adoptionStore.push(cert); res.json({ cert }); });

// ─── Ballot scan ──────────────────────────────────────────────────────────────
const _ballotSessions = [];
app.get(`${BASE}/ballot-scan/agent/session`, auth.requireAuth, (req, res) => res.json({ session: _ballotSessions.find(s => s.agentUsername === req.user.username && s.status === 'active') || null }));
app.post(`${BASE}/ballot-scan/agent/session`, auth.requireAuth, (req, res) => { const existing = _ballotSessions.find(s => s.agentUsername === req.user.username && s.status === 'active'); if (existing) return res.json({ session: existing }); const session = { id: `bsess-${Date.now()}`, agentUsername: req.user.username, ...req.body, status: 'active', scanned: 0, startedAt: new Date().toISOString() }; _ballotSessions.push(session); res.json({ session }); });
app.get(`${BASE}/ballot-scan/sessions`, auth.requireAuth, (req, res) => res.json({ sessions: _ballotSessions }));
app.get(`${BASE}/ballots/:id`, auth.requireAuth, (req, res) => res.json({ ballot: null, id: req.params.id }));

// ─── Notices ──────────────────────────────────────────────────────────────────
const noticesStore = kv.get('notices') || [];
app.get(`${BASE}/notices`, auth.requireAuth, (req, res) => { const role = req.user?.role; const visible = noticesStore.filter(n => !n.targetRoles?.length || n.targetRoles.includes(role) || role === 'super_admin'); res.json({ notices: visible.sort((a, b) => b.createdAt.localeCompare(a.createdAt)) }); });
app.get(`${BASE}/notices/sent`, auth.requireAuth, (req, res) => res.json({ notices: noticesStore.filter(n => n.createdBy === req.user.username) }));
app.post(`${BASE}/notices`, auth.requireAuth, auth.requireRole('super_admin', 'national_manager', 'provincial_manager'), (req, res) => { const notice = { id: `notice-${Date.now()}`, ...req.body, createdBy: req.user.username, createdAt: new Date().toISOString(), readBy: [] }; noticesStore.unshift(notice); kv.set('notices', noticesStore); res.json({ notice }); });
app.patch(`${BASE}/notices/:id/read`, auth.requireAuth, (req, res) => { const n = noticesStore.find(x => x.id === req.params.id); if (!n) return res.status(404).json({ error: 'Not found' }); if (!n.readBy.includes(req.user.username)) n.readBy.push(req.user.username); kv.set('notices', noticesStore); res.json({ notice: n }); });


// ─── Rejected ballots debug (temporary) ──────────────────────────────────────
app.get(`${BASE}/results/rejected-debug`, (req, res) => {
  const keys = kv.getKeysByPrefix('boz:results:');
  const entries = keys.map(k => {
    const v = kv.get(k);
    return {
      key: k,
      electionType: v?.electionType,
      pollingStationId: v?.pollingStationId,
      rejectedBallots: v?.rejectedBallots,
      totalRejected: v?.totalRejected,
      totalRejectedBallots: v?.totalRejectedBallots,
      candidateVotesCount: (v?.candidateVotes || v?.candidateResults || []).length,
      totalVotesCast: v?.totalVotesCast,
      submittedAt: v?.submittedAt,
    };
  });
  // Also compute what buildResult would return
  const presResults = entries.filter(e => e.electionType === 'presidential');
  const totalRejected = presResults.reduce((s, e) => s + (Number(e.rejectedBallots) || Number(e.totalRejected) || 0), 0);
  res.json({ total: keys.length, entries, presTotal: presResults.length, totalRejected });
});


// ─── Migrate old results: pull rejectedBallots from dataEntryStore ────────────
app.post(`${BASE}/results/migrate-rejected`, auth.requireAuth, auth.requireRole('super_admin', 'admin'), (req, res) => {
  const keys = kv.getKeysByPrefix('boz:results:');
  let patched = 0;
  const log = [];

  for (const k of keys) {
    const v = kv.get(k);
    if (!v) continue;

    // Already has rejected ballots — skip
    const existing = Number(v.rejectedBallots || v.totalRejected || v.totalRejectedBallots || 0);
    if (existing > 0) {
      log.push({ key: k, action: 'skip', rejectedBallots: existing });
      continue;
    }

    // Try to find matching submission in dataEntryStore by pollingStationId + electionType
    const match = dataEntryStore.submissions.find(s =>
      s.pollingStationId === v.pollingStationId &&
      (s.electionType === v.electionType || s.electionType === v.category)
    );

    const rejected = match
      ? Number(match.rejectedBallots || match.totalRejected || match.totalRejectedBallots || 0)
      : 0;

    // Patch the KV entry
    kv.set(k, {
      ...v,
      rejectedBallots: rejected,
      totalRejected: rejected,
      totalRejectedBallots: rejected,
      _migratedAt: new Date().toISOString(),
    });
    patched++;
    log.push({ key: k, action: 'patched', rejectedBallots: rejected, pollingStationId: v.pollingStationId });
  }

  res.json({ total: keys.length, patched, log });
});


// ─── Patch rejected ballots for existing submission ───────────────────────────
app.patch(`${BASE}/data-entry/submissions/:id/rejected-ballots`, auth.requireAuth, auth.requireRole('super_admin', 'admin', 'national_manager'), (req, res) => {
  const { rejectedBallots } = req.body;
  if (rejectedBallots === undefined) return res.status(400).json({ error: 'rejectedBallots required' });
  const rejected = Number(rejectedBallots);

  // Update dataEntryStore
  const idx = dataEntryStore.submissions.findIndex(s => s.id === req.params.id);
  if (idx < 0) return res.status(404).json({ error: 'Submission not found' });

  const sub = dataEntryStore.submissions[idx];
  dataEntryStore.submissions[idx] = { ...sub, rejectedBallots: rejected, totalRejected: rejected, totalRejectedBallots: rejected, updatedAt: new Date().toISOString() };
  saveDataEntry();

  // Update KV entry
  const category = sub.electionType === 'parliament' ? 'parliamentary' : sub.electionType;
  const key = `boz:results:${category}:station:${sub.pollingStationId}`;
  const existing = kv.get(key);
  if (existing) {
    kv.set(key, { ...existing, rejectedBallots: rejected, totalRejected: rejected, totalRejectedBallots: rejected, updatedAt: new Date().toISOString() });
  }

  res.json({ success: true, submission: dataEntryStore.submissions[idx] });
});

// ─── Bulk patch all existing submissions to pull rejectedBallots from request body ─
app.post(`${BASE}/data-entry/bulk-patch-rejected`, auth.requireAuth, auth.requireRole('super_admin', 'admin'), (req, res) => {
  // Expects: { patches: [{ pollingStationId, electionType, rejectedBallots }] }
  const { patches = [] } = req.body;
  let updated = 0;
  for (const patch of patches) {
    const rejected = Number(patch.rejectedBallots || 0);
    // Update dataEntryStore
    const idx = dataEntryStore.submissions.findIndex(
      s => s.pollingStationId === patch.pollingStationId && s.electionType === patch.electionType
    );
    if (idx >= 0) {
      dataEntryStore.submissions[idx] = { ...dataEntryStore.submissions[idx], rejectedBallots: rejected, totalRejected: rejected, totalRejectedBallots: rejected };
    }
    // Update KV
    const category = patch.electionType === 'parliament' ? 'parliamentary' : patch.electionType;
    const key = `boz:results:${category}:station:${patch.pollingStationId}`;
    const existing = kv.get(key);
    if (existing) {
      kv.set(key, { ...existing, rejectedBallots: rejected, totalRejected: rejected, totalRejectedBallots: rejected });
      updated++;
    }
  }
  if (patches.length > 0) saveDataEntry();
  res.json({ success: true, updated });
});

// ─── 404 ──────────────────────────────────────────────────────────────────────
app.use((req, res) => res.status(404).json({ error: `Route not found: ${req.method} ${req.path}` }));
app.use((err, req, res, _next) => { console.error(err); res.status(500).json({ error: 'Internal server error', message: err.message }); });

// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, '0.0.0.0', () => {
  const railwayService = process.env.RAILWAY_SERVICE_NAME || '(unknown)';
  const internalHost = `${railwayService}.railway.internal`;
  console.log(`\n🇿🇲  Build One Zambia Backend`);
  console.log(`   ✅  Running on http://0.0.0.0:${PORT}`);
  console.log(`   🚂  Service: ${railwayService}`);
  console.log(`   🔗  Private: http://${internalHost}:${PORT}`);
  console.log(`   📁  DB: ${IS_RAILWAY ? '/tmp/boz-data' : './data'}/kv.json`);
  console.log(`   🔑  Admin: ${process.env.ADMIN_USERNAME || 'superadmin'}\n`);
});

export default app;
// cache-bust: 20260707-204500
// force-deploy-1783458008
// deploy-1783663771
// redeploy-1784379566
