import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createToken, requireAuth, requireRole } from '../auth.js';

// Minimal mock of Express req/res — enough to exercise the middleware
// without spinning up the real server.
function mockRes() {
  const res = { statusCode: 200, body: null };
  res.status = (code) => { res.statusCode = code; return res; };
  res.json = (payload) => { res.body = payload; return res; };
  return res;
}

test('requireAuth rejects requests with no Authorization header', () => {
  const req = { headers: {} };
  const res = mockRes();
  let nextCalled = false;
  requireAuth(req, res, () => { nextCalled = true; });
  assert.equal(nextCalled, false);
  assert.equal(res.statusCode, 401);
});

test('requireAuth rejects an invalid/garbage token', () => {
  const req = { headers: { authorization: 'Bearer not-a-real-token' } };
  const res = mockRes();
  let nextCalled = false;
  requireAuth(req, res, () => { nextCalled = true; });
  assert.equal(nextCalled, false);
  assert.equal(res.statusCode, 401);
});

test('requireAuth accepts a validly signed token and attaches req.user', () => {
  const token = createToken('some_admin', 'admin');
  const req = { headers: { authorization: `Bearer ${token}` } };
  const res = mockRes();
  let nextCalled = false;
  requireAuth(req, res, () => { nextCalled = true; });
  assert.equal(nextCalled, true);
  assert.equal(req.user.username, 'some_admin');
  assert.equal(req.user.role, 'admin');
});

test('requireRole blocks a role not in the allowed list (this is what now protects /results/rejected-debug)', () => {
  const req = { user: { username: 'field_agent_1', role: 'agent' } };
  const res = mockRes();
  let nextCalled = false;
  requireRole('admin', 'super_admin')(req, res, () => { nextCalled = true; });
  assert.equal(nextCalled, false);
  assert.equal(res.statusCode, 403);
});

test('requireRole allows a role that IS in the allowed list', () => {
  const req = { user: { username: 'admin_1', role: 'admin' } };
  const res = mockRes();
  let nextCalled = false;
  requireRole('admin', 'super_admin')(req, res, () => { nextCalled = true; });
  assert.equal(nextCalled, true);
  assert.equal(res.statusCode, 200); // unchanged — never set
});

test('requireRole rejects when req.user is missing entirely (requireAuth must run first)', () => {
  const req = {};
  const res = mockRes();
  let nextCalled = false;
  requireRole('admin', 'super_admin')(req, res, () => { nextCalled = true; });
  assert.equal(nextCalled, false);
  assert.equal(res.statusCode, 401);
});
