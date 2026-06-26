/**
 * Authentication Module — PBKDF2-SHA256 password hashing + JWT sessions
 * Mirrors the original Deno auth.ts behaviour exactly.
 */

import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { kv } from './db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'boz-jwt-secret-change-in-production-2024';
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

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'superadmin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin@BOZ2024';

export async function loginUser(username, password) {
  // Super-admin shortcut (env-based)
  if (username === ADMIN_USERNAME) {
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
  if (!user || !user.active) return null;

  const storedHash = kv.get(`password:${username}`);
  if (!storedHash) return null;

  const valid = await verifyPassword(password, storedHash);
  if (!valid) return null;

  // Update lastLogin
  kv.set(`user:${username}`, { ...user, lastLogin: new Date().toISOString() });
  return user;
}

export async function registerUser(userData, password) {
  const existing = kv.get(`user:${userData.username}`);
  if (existing) throw new Error('Username already exists');

  const now = new Date().toISOString();
  const user = {
    ...userData,
    createdAt: now,
    active: true,
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
