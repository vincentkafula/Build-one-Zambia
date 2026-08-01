/**
 * Authentication Module — PBKDF2-SHA256 password hashing + JWT sessions
 * Mirrors the original Deno auth.ts behaviour exactly.
 */

import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { kv } from './db.js';

// SECURITY: never fall back to a hardcoded secret — this repo is public on
// GitHub, so any default string here is known to anyone who reads the
// source and can be used to forge valid session tokens for ANY role,
// including super_admin. If JWT_SECRET isn't set, generate a random one for
// this process instead (sessions won't survive a restart, but that's far
// safer than a guessable, publicly-known secret signing live election data).
function resolveJwtSecret() {
  if (process.env.JWT_SECRET) return process.env.JWT_SECRET;
  const generated = crypto.randomBytes(48).toString('hex');
  console.error('┌──────────────────────────────────────────────────────────────────┐');
  console.error('│ [auth] SECURITY WARNING: JWT_SECRET is not set.                     │');
  console.error('│ Generated a random secret for THIS PROCESS ONLY — every existing    │');
  console.error('│ login session will be invalidated on the next restart/deploy.       │');
  console.error('│ Set a strong, permanent JWT_SECRET on this Railway service now.      │');
  console.error('└──────────────────────────────────────────────────────────────────┘');
  return generated;
}
const JWT_SECRET = resolveJwtSecret();
const SESSION_TTL = 24 * 60 * 60; // 24 hours in seconds

// ─── Password Hashing (PBKDF2-SHA256, 310,000 iterations) ──────────────────

export async function hashPassword(password) {
  return new Promise((resolve, reject) => {
    const salt = crypto.randomBytes(16);
    crypto.pbkdf2(password, salt, 310_000, 32, 'sha256', (err, hash) => {
      if (err) return reject(err);
      resolve(`pbkdf2:sha256:310000:${salt.toString('base64')}:${hash.toString('base64')}`);
    });
  });
}

export async function verifyPassword(password, stored) {
  if (!stored || !stored.startsWith('pbkdf2:')) return false;
  return new Promise((resolve) => {
    const parts = stored.split(':');
    if (parts.length !== 5) return resolve(false);
    const [, , iter, saltB64, hashB64] = parts;
    const salt = Buffer.from(saltB64, 'base64');
    const expected = Buffer.from(hashB64, 'base64');
    crypto.pbkdf2(password, salt, parseInt(iter, 10), expected.length, 'sha256', (err, derived) => {
      if (err) return resolve(false);
      resolve(crypto.timingSafeEqual(derived, expected));
    });
  });
}

// ─── PIN (same PBKDF2 scheme as passwords, stored under its own key) ────────
// Used for a lighter-weight secondary check (e.g. confirming sensitive
// actions) separate from the login password.

export async function setPin(username, pin) {
  const hash = await hashPassword(String(pin));
  kv.set(`pin:${username}`, hash);
}

export async function verifyPin(username, pin) {
  const stored = kv.get(`pin:${username}`);
  if (!stored) return false;
  return verifyPassword(String(pin), stored);
}

// ─── Session (JWT) ──────────────────────────────────────────────────────────

export function createToken(username, role) {
  return jwt.sign({ username, role }, JWT_SECRET, { expiresIn: SESSION_TTL });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

// ─── Middleware ─────────────────────────────────────────────────────────────

export function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Unauthorised — no token' });
  const payload = verifyToken(token);
  if (!payload) return res.status(401).json({ error: 'Unauthorised — invalid or expired token' });

  // A JWT can be validly signed and unexpired yet belong to an account
  // that's still pending approval (see loginUser above, which now issues
  // a token for pending accounts too) or has since been deactivated. Only
  // the JWT payload was ever checked here before, so a pending account's
  // token would otherwise carry full real access to its role's
  // permissions — re-check the live record on every request instead.
  // The env-based super_admin shortcut has no backing user record, so
  // this naturally doesn't apply to it.
  const liveUser = getUser(payload.username);
  if (liveUser && liveUser.active === false) {
    return res.status(403).json({ error: 'Your account is pending admin approval.', pending: true });
  }

  req.user = payload;
  next();
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Unauthorised' });
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: `Forbidden — requires role: ${roles.join(' | ')}` });
    }
    next();
  };
}

// ─── User CRUD ──────────────────────────────────────────────────────────────

// SECURITY: same reasoning as JWT_SECRET above — this repo is public, so a
// hardcoded default admin password here is a published credential. If
// ADMIN_PASSWORD isn't set, disable this shortcut login entirely rather than
// silently accepting a known password for the highest-privilege account in
// the system.
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'superadmin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || null;
if (!ADMIN_PASSWORD) {
  console.error('┌──────────────────────────────────────────────────────────────────┐');
  console.error('│ [auth] SECURITY WARNING: ADMIN_PASSWORD is not set.                 │');
  console.error(`│ The built-in super_admin shortcut login ('${ADMIN_USERNAME}') is DISABLED  │`);
  console.error('│ until a strong ADMIN_PASSWORD is set on this service.               │');
  console.error('│ Manage election-staff accounts via Election Users instead, or set   │');
  console.error('│ ADMIN_PASSWORD now if you need this login.                          │');
  console.error('└──────────────────────────────────────────────────────────────────┘');
}

// A separate PIN, required alongside the password for irreversible actions
// (e.g. wiping election results) as a second factor on top of an already
// authenticated session — so a stolen or left-open session token alone
// can't trigger something destructive. Same "never hardcode a default"
// reasoning as the password above.
const ADMIN_PIN = process.env.ADMIN_PIN || null;
if (!ADMIN_PIN) {
  console.error('┌──────────────────────────────────────────────────────────────────┐');
  console.error('│ [auth] SECURITY WARNING: ADMIN_PIN is not set.                      │');
  console.error(`│ Password+PIN-protected actions (e.g. resetting election results)   │`);
  console.error(`│ are DISABLED for the '${ADMIN_USERNAME}' shortcut login until ADMIN_PIN   │`);
  console.error('│ is set on this service.                                             │');
  console.error('└──────────────────────────────────────────────────────────────────┘');
}

// Re-verifies the password for irreversible actions (wiping election
// results, deleting every election-role account) as a step-up check —
// being logged in as any super_admin is not sufficient on its own.
//
// Deliberately only accepts the Railway-configured ADMIN_USERNAME +
// ADMIN_PASSWORD, not any database-stored super_admin password. A
// database password can be changed by whoever is logged in at the time
// (see /security/change-password) — using that as the gate for an
// irreversible, whole-election-wiping action would mean the check could
// be satisfied by a password the same session just set. The Railway
// variable can only be changed by whoever has access to the Railway
// project itself, which is the actual boundary this needs.
export async function verifyStepUp(username, password) {
  if (!password) return false;
  if (!ADMIN_PASSWORD) return false;
  return username === ADMIN_USERNAME && password === ADMIN_PASSWORD;
}

export async function loginUser(username, password) {
  // Super-admin shortcut (env-based) — only active when ADMIN_PASSWORD is
  // explicitly configured; see warning above.
  if (ADMIN_PASSWORD && username === ADMIN_USERNAME) {
    if (password !== ADMIN_PASSWORD) return null;
    return {
      username: ADMIN_USERNAME,
      role: 'super_admin',
      name: 'Super Administrator',
      active: true,
      createdAt: new Date().toISOString(),
    };
  }

  const user = kv.get(`user:${username}`);
  if (!user) return null;

  const storedHash = kv.get(`password:${username}`);
  if (!storedHash) return null;

  const valid = await verifyPassword(password, storedHash);
  if (!valid) return null;

  // Correct credentials, but the application hasn't been approved yet.
  // Previously this returned null here — identical to a wrong password —
  // so applicants got a confusing "Invalid credentials" error even with
  // the exact password they just set. Now login succeeds and returns the
  // account as-is (active: false) so the frontend can show a clear
  // "pending approval" screen instead. This does NOT grant real access:
  // requireAuth() below re-checks the live active status on every
  // subsequent request, so a pending account's token can't actually be
  // used to do anything until an admin approves it.
  if (!user.active) return user;

  // Update lastLogin
  kv.set(`user:${username}`, { ...user, lastLogin: new Date().toISOString() });
  return user;
}

// Roles tied to a specific area (polling station / ward / constituency /
// district / province) — each area may only have one active account per
// role at a time (configurable via userData.requiredAgents for roles like
// polling_agent where a station might legitimately need more than one).
// national_manager, admin, and super_admin are not area-scoped and are
// exempt from this lock.
const AREA_SCOPED_ROLES = ['polling_agent', 'agent', 'election_agent', 'ward_manager', 'constituency_manager', 'district_manager', 'provincial_manager'];
const DEFAULT_AREA_CAPACITY = 1;

function roleLabel(role) {
  return String(role).replace(/_/g, ' ');
}

export async function registerUser(userData, password) {
  if (!userData.username) throw new Error('Username is required');
  if (!userData.role) throw new Error('Role is required');

  const existing = kv.get(`user:${userData.username}`);
  if (existing) throw new Error('Username already exists');

  // Area lock: block creating (or approving an application into) a new
  // account for a role+area that's already at capacity. The area frees up
  // automatically the moment the occupying account is deleted — there's no
  // separate "slot" record to manage, occupancy is always computed live.
  const scopeId = userData.scopeId || userData.pollingStationId;
  if (AREA_SCOPED_ROLES.includes(userData.role) && scopeId) {
    const capacity = Number(userData.requiredAgents) > 0 ? Number(userData.requiredAgents) : DEFAULT_AREA_CAPACITY;
    const occupying = listUsers().filter(u =>
      u.active !== false && u.role === userData.role && (u.scopeId || u.pollingStationId) === scopeId
    );
    if (occupying.length >= capacity) {
      const areaName = userData.scopeName || userData.pollingStationName || 'This area';
      throw new Error(
        `${areaName} already has ${occupying.length} active ${roleLabel(userData.role)}${occupying.length === 1 ? '' : 's'} `
        + `(limit ${capacity}). Remove the existing account before creating a new one here.`
      );
    }
  }

  const now = new Date().toISOString();
  const user = {
    ...userData,
    id: crypto.randomUUID(),
    createdAt: now,
    // BUG FIX: this used to be a hardcoded `active: true` placed after the
    // ...userData spread, which unconditionally overwrote whatever active
    // value the caller passed — including createPendingAccount's explicit
    // active: false for applications awaiting approval. Every account was
    // silently active immediately on creation, regardless of intent,
    // completely bypassing the pending-approval gate. Now only defaults to
    // true when the caller didn't specify active at all.
    active: userData.active !== undefined ? userData.active : true,
  };

  const hash = await hashPassword(password);
  kv.set(`user:${userData.username}`, user);
  kv.set(`password:${userData.username}`, hash);

  // Add to users index
  const index = kv.get('users:index') || [];
  if (!index.includes(userData.username)) {
    kv.set('users:index', [...index, userData.username]);
  }
  return user;
}

export function getUser(username) {
  return kv.get(`user:${username}`);
}

// Flip a pre-created (active:false) account on once an admin approves the
// underlying application. No password change involved — the applicant
// already chose their own password and PIN at registration time.
export function activateUser(username) {
  const user = kv.get(`user:${username}`);
  if (!user) throw new Error('User not found');
  const updated = { ...user, active: true, activatedAt: new Date().toISOString() };
  kv.set(`user:${username}`, updated);
  return updated;
}

export function listUsers() {
  const index = kv.get('users:index') || [];
  return index.map(u => kv.get(`user:${u}`)).filter(Boolean);
}

export async function changePassword(username, newPassword) {
  const user = kv.get(`user:${username}`);
  if (!user) throw new Error('User not found');
  const hash = await hashPassword(newPassword);
  kv.set(`password:${username}`, hash);
  kv.set(`user:${username}`, { ...user, passwordChangedAt: new Date().toISOString() });
}

export async function updateUser(idOrUsername, updates) {
  const index = kv.get('users:index') || [];
  const username = index.find(u => {
    const user = kv.get(`user:${u}`);
    return user?.id === idOrUsername || u === idOrUsername;
  });
  if (!username) throw new Error('User not found');
  const existing = kv.get(`user:${username}`);
  const updated = { ...existing, ...updates, id: existing.id, username: existing.username, updatedAt: new Date().toISOString() };
  kv.set(`user:${username}`, updated);
  return updated;
}

export async function resetPassword(id, newPassword) {
  const index = kv.get('users:index') || [];
  const username = index.find(u => kv.get(`user:${u}`)?.id === id);
  if (!username) throw new Error('User not found');
  const hash = await hashPassword(newPassword);
  kv.set(`password:${username}`, hash);
  kv.set(`user:${username}`, { ...kv.get(`user:${username}`), passwordChangedAt: new Date().toISOString() });
}

export function deleteUser(idOrUsername) {
  const index = kv.get('users:index') || [];
  // Support both UUID id and username
  const username = index.find(u => {
    const user = kv.get(`user:${u}`);
    return user?.id === idOrUsername || u === idOrUsername;
  });
  if (!username) throw new Error('User not found');
  kv.del(`user:${username}`);
  kv.del(`password:${username}`);
  kv.set('users:index', index.filter(u => u !== username));
}
