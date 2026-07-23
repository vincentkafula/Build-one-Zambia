/**
 * Build One Zambia Portal — Node.js / Express Backend
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
import * as voterRoll from './voterRoll.js';
import * as voterRegister from './voterRegister.js';
import * as memberCert from './membershipCertificate.js';
import * as memberCard from './membershipCard.js';
import * as adoptionCert from './adoptionCertificate.js';
import * as appointmentCert from './appointmentCertificate.js';
import { kv } from './db.js';

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
    if (!origin || allowed.includes(origin) || origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1') || origin.includes('railway.app') || origin.includes('railway.internal')) cb(null, true);
    else { console.warn(`[CORS] Blocked: ${origin}`); cb(null, false); }
  },
  credentials: true,
  allowedHeaders: ['Content-Type','Authorization','X-Requested-With'],
}));
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));
app.set('trust proxy', 1);

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

// ─── Health ───────────────────────────────────────────────────────────────────
app.get(`${BASE}/health`, (req, res) => res.json({ name: 'Build One Zambia API', status: 'ok', server: 'node-express', version: '2.2.0', timestamp: new Date().toISOString() }));
app.get('/ping', (req, res) => res.json({ status: 'ok', service: 'boz-backend', port: PORT, timestamp: new Date().toISOString() }));

// ─── Auth ─────────────────────────────────────────────────────────────────────
app.post(`${BASE}/auth/login`, async (req, res) => {
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
app.get(`${BASE}/news/posts`, (req, res) => res.json({ posts: news.listPosts({ published: req.query.published !== 'false', category: req.query.category, limit: parseInt(req.query.limit || '50', 10) }) }));
app.get(`${BASE}/news/posts/stats`, auth.requireAuth, auth.requireRole('admin', 'super_admin'), (req, res) => res.json(news.getStats()));
app.get(`${BASE}/news/posts/:id`, (req, res) => { const p = news.getPost(req.params.id); if (!p) return res.status(404).json({ error: 'Not found' }); res.json({ post: p }); });
app.get(`${BASE}/news/posts/:id/image`, (req, res) => { const img = news.getPostImage(req.params.id); if (!img) return res.status(404).json({ error: 'No image' }); const [meta, b64] = img.split(','); res.setHeader('Content-Type', meta.replace('data:', '').replace(';base64', '')); res.send(Buffer.from(b64, 'base64')); });
app.post(`${BASE}/news/posts`, auth.requireAuth, auth.requireRole('admin', 'super_admin'), (req, res) => res.json({ post: news.createPost(req.body, req.user.username) }));
app.patch(`${BASE}/news/posts/:id`, auth.requireAuth, auth.requireRole('admin', 'super_admin'), (req, res) => { const p = news.updatePost(req.params.id, req.body); if (!p) return res.status(404).json({ error: 'Not found' }); res.json({ post: p }); });
app.patch(`${BASE}/news/posts/:id/image`, auth.requireAuth, auth.requireRole('admin', 'super_admin'), (req, res) => { const p = news.getPost(req.params.id); if (!p) return res.status(404).json({ error: 'Not found' }); res.json({ post: news.updatePost(req.params.id, { hasCustomImage: true, imageDataUrl: req.body.imageDataUrl }) }); });
app.patch(`${BASE}/news/posts/:id/publish`, auth.requireAuth, auth.requireRole('admin', 'super_admin'), (req, res) => { const p = news.publishPost(req.params.id); if (!p) return res.status(404).json({ error: 'Not found' }); res.json({ post: p }); });
app.patch(`${BASE}/news/posts/:id/unpublish`, auth.requireAuth, auth.requireRole('admin', 'super_admin'), (req, res) => { const p = news.unpublishPost(req.params.id); if (!p) return res.status(404).json({ error: 'Not found' }); res.json({ post: p }); });
app.delete(`${BASE}/news/posts/:id`, auth.requireAuth, auth.requireRole('admin', 'super_admin'), (req, res) => { news.deletePost(req.params.id); res.json({ success: true }); });
app.delete(`${BASE}/news/posts/:id/hard`, auth.requireAuth, auth.requireRole('super_admin'), (req, res) => { news.deletePost(req.params.id); res.json({ success: true, deleted: 'permanent' }); });

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
app.post(`${BASE}/voter-roll/upload`, auth.requireAuth, auth.requireRole('super_admin', 'admin'), (req, res) => res.json({ success: true, message: 'Voter roll uploaded', totalRecords: 0, uploadedAt: new Date().toISOString() }));
app.delete(`${BASE}/voter-roll`, auth.requireAuth, auth.requireRole('super_admin'), (req, res) => res.json({ success: true, message: 'Voter roll cleared' }));
app.post(`${BASE}/voter-roll/verify`, (req, res) => { const roll = kv.get('voter-roll:data') || []; const voter = roll.find(v => v.nrc === req.body.nrc || (req.body.name && v.name?.toLowerCase().includes(req.body.name.toLowerCase()))); res.json({ found: !!voter, voter: voter || null }); });
app.post(`${BASE}/voter/verify`, (req, res) => res.json({ valid: false, message: 'Voter not found. Please check the details and try again.' }));
app.post(`${BASE}/voter/mark-voted`, auth.requireAuth, (req, res) => res.json({ success: true, voterNumber: req.body.voterNumber, markedAt: new Date().toISOString() }));
app.get(`${BASE}/voter/stats/:pollingStationId`, auth.requireAuth, (req, res) => res.json({ stats: { pollingStationId: req.params.pollingStationId, totalRegistered: 0, totalVoted: 0, turnout: 0 } }));

// ─── Data Entry ───────────────────────────────────────────────────────────────
const dataEntryStore = { submissions: kv.get('data-entry:submissions') || [], eczFigures: kv.get('data-entry:ecz-figures') || [], auditLog: kv.get('data-entry:audit-log') || [] };
function saveDataEntry() { kv.set('data-entry:submissions', dataEntryStore.submissions); kv.set('data-entry:ecz-figures', dataEntryStore.eczFigures); kv.set('data-entry:audit-log', dataEntryStore.auditLog); }

app.post(`${BASE}/data-entry/result`, auth.requireAuth, async (req, res) => {
  try {
    const { pollingStationId, pollingStationName, wardId, wardName, constituencyId, constituencyName, districtId, districtName, provinceId, provinceName, electionType, candidates: rawCands, candidateResults, candidateVotes, totalVotesCast, totalVotes, totalRejectedBallots, totalRejected, rejectedBallots, registeredVoters, agentId, agentName, enteredBy, notes } = req.body;
    if (!pollingStationId || !electionType) return res.status(400).json({ error: 'pollingStationId and electionType required' });

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
    const totalVotesNum = normCandidates.reduce((s, c) => s + c.votes, 0) || Number(totalVotesCast || totalVotes || 0);
    const rejectedNum = Number(rejectedBallots || totalRejectedBallots || totalRejected || 0);
    const registeredNum = Number(registeredVoters || 0);
    const id = `sub-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const now = new Date().toISOString();
    let submission = { id, pollingStationId, pollingStationName, wardId, wardName, constituencyId, constituencyName, districtId, districtName, provinceId, provinceName, electionType, candidateResults: normCandidates, candidates: normCandidates, totalVotes: totalVotesNum, totalVotesCast: totalVotesNum, totalRejected: rejectedNum, totalRejectedBallots: rejectedNum, rejectedBallots: rejectedNum, registeredVoters: registeredNum, agentId, agentName: agentName || enteredBy, notes, status: 'pending', submittedAt: now };
    // Check if station already submitted — update instead of duplicate
    const existingIdx = dataEntryStore.submissions.findIndex(
      s => s.pollingStationId === pollingStationId && s.electionType === electionType
    );
    if (existingIdx >= 0) {
      // UPDATE existing submission (allows correction of rejected ballots)
      dataEntryStore.submissions[existingIdx] = { ...dataEntryStore.submissions[existingIdx], ...submission, id: dataEntryStore.submissions[existingIdx].id, updatedAt: now };
      submission = dataEntryStore.submissions[existingIdx];
    } else {
      dataEntryStore.submissions.push(submission);
    }
    saveDataEntry();
    // Write to results KV for immediate dashboard display
    const category = electionType === 'parliament' ? 'parliamentary' : electionType;
    kv.set(`boz:results:${category}:station:${pollingStationId}`, { id, pollingStationId, pollingStationName, wardId, wardName, constituencyId, constituencyName, districtId, districtName, provinceId, provinceName, category, electionType, candidateVotes: normCandidates, candidateResults: normCandidates, candidates: normCandidates, totalVotes: totalVotesNum, totalVotesCast: totalVotesNum, totalRejected: rejectedNum, rejectedBallots: rejectedNum, registeredVoters: registeredNum, status: 'pending', verified: false, submittedBy: agentName || enteredBy || agentId || 'agent', submittedAt: now, updatedAt: now });
    res.json({ success: true, message: 'Result submitted successfully', submission: { id, submittedAt: now, status: 'pending' } });
  } catch (err) { res.status(500).json({ error: err.message }); }
});
app.get(`${BASE}/data-entry/turnout`, (req, res) => res.json({ stats: { totalStations: 0, reportingStations: dataEntryStore.submissions.length, totalVotesCast: 0 } }));
app.get(`${BASE}/data-entry/result/:pollingStationId/:electionType`, (req, res) => { const sub = dataEntryStore.submissions.find(s => s.pollingStationId === decodeURIComponent(req.params.pollingStationId) && s.electionType === req.params.electionType); res.json({ submitted: !!sub, submittedAt: sub?.submittedAt, status: sub?.status, id: sub?.id }); });
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
// on election day. Requires the caller to send { confirm: "RESET" } to avoid
// accidental triggering.
app.post(`${BASE}/admin/reset-votes`, auth.requireAuth, auth.requireRole('super_admin'), (req, res) => {
  try {
    if (req.body?.confirm !== 'RESET') {
      return res.status(400).json({ error: 'Confirmation required — send { "confirm": "RESET" } to proceed.' });
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
app.get(`${BASE}/data-entry/submissions/:id`, auth.requireAuth, (req, res) => { const sub = dataEntryStore.submissions.find(s => s.id === req.params.id); if (!sub) return res.status(404).json({ error: 'Not found' }); res.json({ submission: sub }); });
app.patch(`${BASE}/data-entry/submissions/:id/status`, auth.requireAuth, (req, res) => { const idx = dataEntryStore.submissions.findIndex(s => s.id === req.params.id); if (idx < 0) return res.status(404).json({ error: 'Not found' }); const now = new Date().toISOString(); const updated = { ...dataEntryStore.submissions[idx], status: req.body.status, notes: req.body.notes, reviewedAt: now, reviewedBy: req.user?.username }; dataEntryStore.submissions[idx] = updated; saveDataEntry(); const category = updated.electionType === 'parliament' ? 'parliamentary' : updated.electionType; const key = `boz:results:${category}:station:${updated.pollingStationId}`; const existing = kv.get(key); if (existing) kv.set(key, { ...existing, status: req.body.status, verified: req.body.status === 'approved' || req.body.status === 'verified', verifiedBy: req.user?.username, updatedAt: now }); res.json({ success: true, submission: updated }); });
app.get(`${BASE}/data-entry/stats`, auth.requireAuth, (req, res) => { const subs = dataEntryStore.submissions; res.json({ stats: { total: subs.length, pending: subs.filter(s => s.status === 'pending').length, approved: subs.filter(s => s.status === 'approved').length, rejected: subs.filter(s => s.status === 'rejected').length } }); });
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
  res.json(voterRoll.searchVoter({ nrc: req.query.nrc, name: req.query.name, pollingStationId: req.query.pollingStationId }));
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
// regStore still backs agent only (member, cooperative, and internship are
// now consolidated onto registrations.js's boz:reg:* stores — see the
// dedicated route blocks below).
const regStore = { agent: kv.get('reg:agent') || [] };
function saveReg(type) { kv.set(`reg:${type}`, regStore[type]); }

// Grant Login helper
function generatePassword() { const chars = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789!@#$'; let p = ''; for (let i = 0; i < 10; i++) p += chars[Math.floor(Math.random() * chars.length)]; return p; }
const TYPE_ROLES = { agent: 'polling_agent', member: 'member', internship: 'internship', cooperative: 'cooperative' };

function regRoutes(type, noun) {
  app.post(`${BASE}/registrations/${type}`, async (req, res) => {
    let reg = { ...req.body, id: `${type}-${Date.now()}`, status: 'pending', submittedAt: new Date().toISOString() };
    reg = await registrations.createPendingAccount(type, reg);
    regStore[type].push(reg); saveReg(type);
    setImmediate(() => notifyNewApplication(type, reg));
    res.json({ success: true, message: `${noun} registration submitted`, registration: reg });
  });

  app.get(`${BASE}/registrations/${type}`, auth.requireAuth, auth.requireRole('super_admin', 'admin'), (req, res) => {
    let regs = [...regStore[type]];
    if (req.query.status) regs = regs.filter(r => r.status === req.query.status);
    res.json({ registrations: regs, count: regs.length });
  });

  app.patch(`${BASE}/registrations/${type}/:id/status`, auth.requireAuth, auth.requireRole('super_admin', 'admin'), async (req, res) => {
    const idx = regStore[type].findIndex(r => r.id === req.params.id);
    if (idx < 0) return res.status(404).json({ error: 'Registration not found' });
    const { status, notes } = req.body;
    regStore[type][idx] = { ...regStore[type][idx], status, notes, reviewedAt: new Date().toISOString(), reviewedBy: req.user?.username };
    saveReg(type);
    // Auto-grant login on approval — done synchronously (not via setImmediate)
    // so the generated credentials can actually be included in this response.
    // Previously this ran after the response had already been sent, so the
    // password was generated but never returned to anyone — the account
    // existed but nobody, including the admin, ever saw its password.
    let credentials = null;
    let activated = false;
    if (status === 'approved') {
      try {
        const reg = regStore[type][idx];
        if (reg.username && !reg.loginGranted) {
          // Applicant already chose their own password + PIN at
          // registration time — just switch their account on.
          auth.activateUser(reg.username);
          regStore[type][idx] = { ...regStore[type][idx], loginGranted: true, loginActivatedAt: new Date().toISOString() };
          saveReg(type);
          activated = true;
          console.log(`[activate] Enabled login for ${type}/${reg.id}: ${reg.username}`);
        } else if (!reg.username && !reg.loginGranted) {
          // Legacy fallback for registrations submitted before applicants
          // chose their own password (no self-service account to activate).
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
          // pendingPassword is cleared the first time /credentials is fetched
          // (by the registrant, using their reference number), so the
          // plaintext password is retrievable exactly once outside of this
          // admin-only response.
          regStore[type][idx] = { ...regStore[type][idx], username, loginGranted: true, loginCreatedAt: new Date().toISOString(), pendingPassword: password };
          saveReg(type);
          console.log(`[auto-grant] Created login for ${type}/${reg.id}: ${username}`);
        }
      } catch (e) { console.error(`[auto-grant] Failed for ${type}/${req.params.id}:`, e.message); }
    }
    res.json({ success: true, registration: regStore[type][idx], credentials, activated });
  });

  app.post(`${BASE}/registrations/${type}/:id/grant-login`, auth.requireAuth, auth.requireRole('super_admin', 'admin'), async (req, res) => {
    try {
      const id = req.params.id;
      let idx = regStore[type]?.findIndex(r => r.id === id) ?? -1;
      let reg = idx >= 0 ? regStore[type][idx] : null;
      // Check KV variants
      if (!reg) {
        for (const key of [`boz:reg:${type === 'internship' ? 'intern' : type === 'cooperative' ? 'coop' : type}:${id}`, `reg:${type}`]) {
          const val = kv.get(key);
          if (Array.isArray(val)) { const found = val.find(r => r.id === id); if (found) { reg = found; regStore[type].push(reg); saveReg(type); idx = regStore[type].length - 1; break; } }
          else if (val?.id === id) { reg = val; regStore[type].push(reg); saveReg(type); idx = regStore[type].length - 1; break; }
        }
      }
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
      regStore[type][idx] = { ...reg, status: reg.status === 'pending' ? 'approved' : reg.status, username, loginGranted: true, loginCreatedAt: new Date().toISOString(), loginGrantedBy: req.user?.username, pendingPassword: password };
      saveReg(type);
      res.json({ success: true, credentials: { username, password, role, generatedAt: new Date().toISOString(), name, alreadyExists: !!existingUser }, message: `Login granted for ${name}` });
    } catch (e) { res.status(500).json({ error: e.message }); }
  });

  app.get(`${BASE}/registrations/${type}/:id/selfie`, auth.requireAuth, auth.requireRole('super_admin', 'admin'), (req, res) => {
    const reg = regStore[type]?.find(r => r.id === req.params.id) || kv.get(`boz:reg:${type === 'internship' ? 'intern' : type === 'cooperative' ? 'coop' : type}:${req.params.id}`);
    if (!reg) return res.status(404).json({ error: 'Not found' });
    res.json({ dataUrl: reg.selfieDataUrl || reg.selfie || null, hasSelfie: !!(reg.selfieDataUrl || reg.selfie) });
  });

  app.get(`${BASE}/registrations/${type}/:id/documents`, auth.requireAuth, auth.requireRole('super_admin', 'admin'), (req, res) => {
    const id = req.params.id;
    let reg = regStore[type]?.find(r => r.id === id);
    if (!reg) {
      for (const key of [`boz:reg:${type === 'internship' ? 'intern' : type === 'cooperative' ? 'coop' : type}:${id}`, `boz:reg:agent:${id}`, `boz:reg:member:${id}`]) {
        const val = kv.get(key);
        if (Array.isArray(val)) { const found = val.find(r => r.id === id); if (found) { reg = found; break; } }
        else if (val?.id === id) { reg = val; break; }
      }
    }
    if (!reg) return res.status(404).json({ error: `Registration ${id} not found` });
    const documents = { ...(reg.documents || reg.uploads || reg.docs || {}) };
    if (reg.selfieDataUrl && !documents.selfie) documents.selfie = reg.selfieDataUrl;
    res.json({ documents, documentsMeta: reg.documentsMeta || {}, hasDocuments: Object.keys(documents).length > 0 });
  });

  // Public by design: the registrant has no login yet at this point, and
  // the UI already tells them to "return with your reference number" to
  // retrieve credentials. The registration id doubles as that reference
  // number/lookup key. The password is returned once, then cleared from
  // storage, so it can't be re-fetched by someone who intercepts the id
  // after the real registrant has already collected it.
  app.get(`${BASE}/registrations/${type}/:id/credentials`, (req, res) => {
    const id = req.params.id;
    const idx = regStore[type]?.findIndex(r => r.id === id) ?? -1;
    const reg = idx >= 0 ? regStore[type][idx] : null;
    if (!reg) return res.status(404).json({ success: false, credentials: null, error: 'Registration not found' });
    if (!reg.loginGranted || !reg.username) {
      return res.json({ success: false, credentials: null, message: 'Not approved yet — check back after an admin reviews your application.' });
    }
    if (!reg.pendingPassword) {
      // Self-service accounts (applicant chose their own password/PIN at
      // registration) have nothing to hand back here — just confirm it's live.
      return res.json({ success: true, credentials: null, activated: true, username: reg.username, message: 'Your application has been approved — your account is now active. Log in with the username above and the password you created when you applied.' });
    }
    const name = reg.fullName || reg.name || ((reg.firstName||'') + ' ' + (reg.lastName||'')).trim() || 'user';
    const credentials = { username: reg.username, password: reg.pendingPassword };
    regStore[type][idx] = { ...reg, pendingPassword: null };
    saveReg(type);
    res.json({ success: true, credentials, fullName: name });
  });
}

regRoutes('agent', 'Agent');

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
app.get(`${BASE}/registrations/agent/capacity`, (req, res) => { const agents = registrations.listAgents({}); res.json({ capacity: { total: 500, registered: agents.length, remaining: Math.max(0, 500 - agents.length), open: agents.length < 500 } }); });
app.get(`${BASE}/registrations/agent/validate`, (req, res) => res.json({ valid: false, message: 'No registration found' }));
app.get(`${BASE}/registrations/stats`, auth.requireAuth, (req, res) => { const agents = registrations.listAgents({}); const members = registrations.listMembers({}); const interns = registrations.listInterns({}); const coops = registrations.listCoops ? registrations.listCoops({}) : []; const all = [...agents, ...members, ...interns, ...coops]; res.json({ stats: { total: all.length, agent: agents.length, member: members.length, internship: interns.length, cooperative: coops.length, pending: all.filter(r => r.status === 'pending').length, approved: all.filter(r => r.status === 'approved').length, rejected: all.filter(r => r.status === 'rejected').length } }); });
app.get(`${BASE}/registrations/validate-membership`, auth.requireAuth, (req, res) => { const m = registrations.getMemberByMembershipNumber(req.query.number); if (!m) return res.json({ valid: false, error: 'Not found' }); res.json({ valid: true, fullName: `${m.firstName || ''} ${m.lastName || ''}`.trim(), membershipNumber: m.membershipNumber, status: m.status }); });
app.post(`${BASE}/registrations/validate-memberships`, auth.requireAuth, (req, res) => { const { numbers = [] } = req.body; const results2 = {}; let invalidCount = 0; for (const num of numbers) { const m = registrations.getMemberByMembershipNumber(num); if (m) results2[num] = { valid: true, fullName: `${m.firstName || ''} ${m.lastName || ''}`.trim() }; else { results2[num] = { valid: false, error: 'Not found' }; invalidCount++; } } res.json({ results: results2, invalidCount }); });

// ─── Donations ────────────────────────────────────────────────────────────────
const donationStore = { donations: kv.get('donations') || [] };
function saveDonations() { kv.set('donations', donationStore.donations); }
app.post(`${BASE}/donations`, (req, res) => { const d = { ...req.body, id: `don-${Date.now()}`, status: 'pending', createdAt: new Date().toISOString() }; donationStore.donations.push(d); saveDonations(); res.json({ success: true, donation: d }); });
app.get(`${BASE}/donations`, auth.requireAuth, (req, res) => { const donations = donationStore.donations; res.json({ donations, count: donations.length, stats: { total: donations.filter(d => d.status === 'completed').reduce((s, d) => s + (d.amount || 0), 0), count: donations.length } }); });
app.patch(`${BASE}/donations/:id/status`, auth.requireAuth, (req, res) => { const idx = donationStore.donations.findIndex(d => d.id === req.params.id); if (idx < 0) return res.status(404).json({ error: 'Not found' }); donationStore.donations[idx] = { ...donationStore.donations[idx], status: req.body.status, updatedAt: new Date().toISOString() }; saveDonations(); res.json({ success: true, donation: donationStore.donations[idx] }); });

// ─── Contact ──────────────────────────────────────────────────────────────────
const contactStore = { messages: kv.get('contact') || [] };
function saveContact() { kv.set('contact', contactStore.messages); }
app.post(`${BASE}/contact`, (req, res) => { const msg = { ...req.body, id: `msg-${Date.now()}`, read: false, createdAt: new Date().toISOString() }; contactStore.messages.push(msg); saveContact(); res.json({ success: true, message: 'Message received' }); });
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
const otpStore = {};
app.post(`${BASE}/otp/send`, async (req, res) => {
  try {
    const { phone, email } = req.body;
    if (!phone && !email) return res.status(400).json({ error: 'Phone or email required' });
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const key = phone || email;
    otpStore[key] = { otp, expiresAt: Date.now() + 10 * 60 * 1000 };
    let sent = false, channel = null;
    if (phone && process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
      try { const r = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Messages.json`, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded', Authorization: `Basic ${Buffer.from(`${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`).toString('base64')}` }, body: new URLSearchParams({ From: process.env.TWILIO_FROM_NUMBER, To: phone, Body: `Your BOZ verification code is: ${otp}. Valid for 10 minutes.` }) }); const data = await r.json(); if (r.ok && data.sid) { sent = true; channel = 'sms'; } } catch (e) { console.error('[OTP] Twilio error:', e.message); }
    }
    if (!sent && email && process.env.RESEND_API_KEY) {
      try { const r = await fetch('https://api.resend.com/emails', { method: 'POST', headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ from: process.env.EMAIL_FROM_ADDRESS || 'no-reply@bozplans.org', to: email, subject: 'Your BOZ Verification Code', html: `<p>Your verification code is: <strong style="font-size:24px;letter-spacing:4px">${otp}</strong></p><p>Valid for 10 minutes.</p>` }) }); const data = await r.json(); if (r.ok && data.id) { sent = true; channel = 'email'; } } catch (e) { console.error('[OTP] Resend error:', e.message); }
    }
    if (!sent) console.log(`[OTP] Code for ${key}: ${otp}`);
    const isDev = process.env.NODE_ENV !== 'production';
    res.json({ success: true, sent, channel, message: sent ? `OTP sent via ${channel}` : 'OTP generated', ...(isDev ? { otp } : {}) });
  } catch (e) { res.status(500).json({ error: e.message }); }
});
app.post(`${BASE}/otp/verify`, (req, res) => { const { phone, email, otp } = req.body; const key = phone || email; const stored = otpStore[key]; if (!stored) return res.status(400).json({ error: 'No OTP found. Request a new one.' }); if (Date.now() > stored.expiresAt) { delete otpStore[key]; return res.status(400).json({ error: 'OTP expired' }); } if (stored.otp !== otp) return res.status(400).json({ error: 'Invalid OTP' }); delete otpStore[key]; res.json({ success: true, verified: true }); });

// ─── Gateway ──────────────────────────────────────────────────────────────────
app.get(`${BASE}/gateway/config`, (req, res) => res.json({ config: { flutterwaveEnabled: !!process.env.FLUTTERWAVE_SECRET_KEY, resendEnabled: !!process.env.RESEND_API_KEY, twilioEnabled: !!process.env.TWILIO_ACCOUNT_SID, publicKey: process.env.FLUTTERWAVE_PUBLIC_KEY || null, siteUrl: process.env.SITE_URL || '' } }));
app.get(`${BASE}/gateway/verify/:txRef`, (req, res) => res.json({ verified: false, txRef: req.params.txRef, status: 'pending' }));
app.post(`${BASE}/gateway/mobile-money`, (req, res) => res.json({ success: true, reference: `MM-${Date.now()}`, status: 'pending', message: 'Mobile money request initiated' }));
app.post(`${BASE}/gateway/verify-card`, (req, res) => res.json({ success: false, message: 'Card verification unavailable' }));

// ─── Email ────────────────────────────────────────────────────────────────────
app.get(`${BASE}/email/config`, auth.requireAuth, auth.requireRole('super_admin', 'admin'), (req, res) => { const key = process.env.RESEND_API_KEY || ''; res.json({ connected: !!key, keyPreview: key ? `re_...${key.slice(-6)}` : null, fromName: process.env.EMAIL_FROM_NAME || 'Build One Zambia', fromEmail: process.env.EMAIL_FROM_ADDRESS || 'noreply@bozplans.org', adminEmail: process.env.ADMIN_EMAIL || '', siteUrl: process.env.SITE_URL || 'https://www.bozplans.org', provider: 'Resend' }); });
app.post(`${BASE}/email/test`, auth.requireAuth, auth.requireRole('super_admin', 'admin'), async (req, res) => { try { if (!process.env.RESEND_API_KEY) return res.status(400).json({ error: 'RESEND_API_KEY not configured', configured: false }); const r = await fetch('https://api.resend.com/emails', { method: 'POST', headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ from: process.env.EMAIL_FROM_ADDRESS || 'no-reply@bozplans.org', to: req.body.to || process.env.ADMIN_EMAIL, subject: 'BOZ Email Test', html: '<p>Email service is working correctly.</p>' }) }); const data = await r.json(); if (r.ok) res.json({ success: true, id: data.id }); else res.status(400).json({ error: data.message || 'Email send failed', configured: true }); } catch (e) { res.status(500).json({ error: e.message }); } });
app.post(`${BASE}/email/resend/order/:orderId`, auth.requireAuth, auth.requireRole('super_admin', 'admin'), (req, res) => res.json({ success: true, orderId: req.params.orderId, message: 'Email queued' }));
app.post(`${BASE}/email/resend/payment/:paymentRef`, auth.requireAuth, auth.requireRole('super_admin', 'admin'), (req, res) => res.json({ success: true, paymentRef: req.params.paymentRef, message: 'Receipt email queued' }));

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
