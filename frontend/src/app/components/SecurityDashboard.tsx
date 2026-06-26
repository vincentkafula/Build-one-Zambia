import { useState, useEffect, useCallback } from 'react';
import {
  Shield, AlertTriangle, Lock, Unlock, Globe, RefreshCw, XCircle,
  CheckCircle, Clock, Eye, User, Activity, Ban, Trash2, Key,
  ChevronDown, ChevronUp, Terminal, Wifi, LogOut,
} from 'lucide-react';
import { securityApi, AuditEvent, BlockedIP, ActiveSession, SecurityStats } from '../lib/api';

const A    = '#16a34a';
const NAVY = '#1e2d4a';
const RED  = '#dc2626';
const AMBER= '#d97706';

// ─── Severity badge ───────────────────────────────────────────────────────────

function SeverityBadge({ severity }: { severity: AuditEvent['severity'] }) {
  const cfg = {
    info:     { bg: '#f0fdf4', color: '#16a34a', label: 'INFO' },
    warn:     { bg: '#fef3c7', color: '#d97706', label: 'WARN' },
    critical: { bg: '#fef2f2', color: '#dc2626', label: 'CRIT' },
  }[severity];
  return (
    <span className="text-xs px-2 py-0.5 rounded-full font-bold tracking-wider"
      style={{ background: cfg.bg, color: cfg.color }}>
      {cfg.label}
    </span>
  );
}

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({
  label, value, icon, color, sub,
}: { label: string; value: number | string; icon: React.ReactNode; color: string; sub?: string }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-gray-400 uppercase tracking-wider">{label}</span>
        <span className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: color + '15', color }}>
          {icon}
        </span>
      </div>
      <p className="text-3xl font-bold" style={{ color: NAVY }}>{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

// ─── Audit log row ────────────────────────────────────────────────────────────

function AuditRow({ event }: { event: AuditEvent }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors"
        onClick={() => setOpen(o => !o)}
      >
        <SeverityBadge severity={event.severity} />
        <span className="text-xs font-mono text-gray-500 shrink-0 hidden sm:inline">
          {new Date(event.timestamp).toLocaleString()}
        </span>
        <span className="text-xs font-semibold text-gray-700 shrink-0" style={{ minWidth: 160 }}>
          {event.type.replace(/_/g, ' ')}
        </span>
        <span className="text-xs text-gray-500 truncate flex-1">{event.detail ?? '—'}</span>
        {event.actor && (
          <span className="text-xs text-blue-600 shrink-0 hidden md:inline">{event.actor}</span>
        )}
        {open ? <ChevronUp size={12} className="shrink-0 text-gray-400" /> : <ChevronDown size={12} className="shrink-0 text-gray-400" />}
      </button>
      {open && (
        <div className="bg-gray-50 px-4 pb-4 pt-2 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
          {[
            ['ID', event.id],
            ['Time', new Date(event.timestamp).toLocaleString()],
            ['Actor', event.actor ?? '—'],
            ['IP', event.ip ?? '—'],
            ['Target', event.target ?? '—'],
            ['User-Agent', event.userAgent ?? '—'],
          ].map(([k, v]) => (
            <div key={k}>
              <p className="text-gray-400 mb-0.5">{k}</p>
              <p className="text-gray-700 font-mono break-all">{v}</p>
            </div>
          ))}
          {event.metadata && (
            <div className="col-span-full">
              <p className="text-gray-400 mb-0.5">Metadata</p>
              <pre className="bg-gray-100 rounded p-2 text-gray-700 overflow-x-auto text-xs">
                {JSON.stringify(event.metadata, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

type Tab = 'overview' | 'audit' | 'ips' | 'sessions' | 'tools';

export function SecurityDashboard() {
  const [tab, setTab] = useState<Tab>('overview');
  const [stats, setStats] = useState<SecurityStats | null>(null);
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([]);
  const [auditTotal, setAuditTotal] = useState(0);
  const [blockedIPs, setBlockedIPs] = useState<BlockedIP[]>([]);
  const [sessions, setSessions] = useState<ActiveSession[]>([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);

  // Audit filters
  const [filterType, setFilterType] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('');
  const [auditOffset, setAuditOffset] = useState(0);

  // Block IP form
  const [blockIpValue, setBlockIpValue] = useState('');
  const [blockReason, setBlockReason] = useState('');
  const [blockHours, setBlockHours] = useState('');

  // Tools
  const [unlockUser, setUnlockUser] = useState('');
  const [deactivateUser, setDeactivateUser] = useState('');

  const flash = (text: string, ok = true) => {
    setMsg({ text, ok });
    setTimeout(() => setMsg(null), 4000);
  };

  const loadStats = useCallback(async () => {
    try { const r = await securityApi.getStats(); if (r.success) setStats(r.stats); } catch { /* ignore */ }
  }, []);

  const loadAudit = useCallback(async () => {
    setLoading(true);
    try {
      const r = await securityApi.getAuditLog({
        type: filterType || undefined,
        severity: filterSeverity || undefined,
        limit: 100,
        offset: auditOffset,
      });
      if (r.success) { setAuditEvents(r.events); setAuditTotal(r.total); }
    } catch { flash('Failed to load audit log.', false); }
    finally { setLoading(false); }
  }, [filterType, filterSeverity, auditOffset]);

  const loadIPs = useCallback(async () => {
    try { const r = await securityApi.getBlockedIPs(); if (r.success) setBlockedIPs(r.blockedIPs); } catch { /* ignore */ }
  }, []);

  const loadSessions = useCallback(async () => {
    try { const r = await securityApi.getSessions(); if (r.success) setSessions(r.sessions); } catch { /* ignore */ }
  }, []);

  useEffect(() => { loadStats(); }, [loadStats]);
  useEffect(() => { if (tab === 'audit') loadAudit(); }, [tab, loadAudit]);
  useEffect(() => { if (tab === 'ips') loadIPs(); }, [tab, loadIPs]);
  useEffect(() => { if (tab === 'sessions') loadSessions(); }, [tab, loadSessions]);

  async function handleBlockIP() {
    if (!blockIpValue || !blockReason) return flash('IP and reason are required.', false);
    try {
      await securityApi.blockIP(blockIpValue, blockReason, blockHours ? parseFloat(blockHours) : undefined);
      flash(`IP ${blockIpValue} blocked.`);
      setBlockIpValue(''); setBlockReason(''); setBlockHours('');
      loadIPs();
    } catch { flash('Failed to block IP.', false); }
  }

  async function handleUnblockIP(ip: string) {
    try { await securityApi.unblockIP(ip); flash(`IP ${ip} unblocked.`); loadIPs(); }
    catch { flash('Failed to unblock IP.', false); }
  }

  async function handleRevokeAllSessions() {
    if (!confirm('Revoke all sessions except your own? All other users will be logged out.')) return;
    try { const r = await securityApi.revokeAllSessions(); flash(r.message); loadSessions(); }
    catch { flash('Failed to revoke sessions.', false); }
  }

  async function handleUnlockAccount() {
    if (!unlockUser) return;
    try { await securityApi.unlockAccount(unlockUser); flash(`Account '${unlockUser}' unlocked.`); setUnlockUser(''); }
    catch { flash('Failed to unlock account.', false); }
  }

  async function handleDeactivateUser() {
    if (!deactivateUser) return;
    if (!confirm(`Deactivate user '${deactivateUser}'? Their session will be revoked immediately.`)) return;
    try { await securityApi.deactivateUser(deactivateUser); flash(`User '${deactivateUser}' deactivated.`); setDeactivateUser(''); }
    catch { flash('Failed to deactivate user.', false); }
  }

  const TABS: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'overview', label: 'Overview',    icon: <Shield size={14} /> },
    { key: 'audit',    label: 'Audit Log',   icon: <Terminal size={14} /> },
    { key: 'ips',      label: 'IP Blocklist',icon: <Globe size={14} /> },
    { key: 'sessions', label: 'Sessions',    icon: <Wifi size={14} /> },
    { key: 'tools',    label: 'Tools',       icon: <Key size={14} /> },
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl flex items-center gap-2" style={{ fontFamily: 'Oswald, sans-serif', color: NAVY, letterSpacing: '0.04em' }}>
            <Shield size={22} style={{ color: A }} /> SECURITY CENTRE
          </h2>
          <p className="text-sm text-gray-500 mt-1">Rate limiting · Brute-force protection · Audit logging · IP management</p>
        </div>
        <button onClick={() => { loadStats(); if (tab === 'audit') loadAudit(); if (tab === 'ips') loadIPs(); if (tab === 'sessions') loadSessions(); }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm border border-gray-300 hover:bg-gray-50">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {msg && (
        <div className={`mb-4 p-3 rounded-lg text-sm flex items-center gap-2 ${msg.ok ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {msg.ok ? <CheckCircle size={14} /> : <XCircle size={14} />} {msg.text}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium transition-colors"
            style={{ background: tab === t.key ? NAVY : '#f3f4f6', color: tab === t.key ? '#fff' : '#374151' }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* ── Overview ── */}
      {tab === 'overview' && (
        <div>
          {stats ? (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
              <StatCard label="Active Sessions" value={stats.activeSessions} icon={<Wifi size={16} />} color={A} sub="logged-in users" />
              <StatCard label="Blocked IPs" value={stats.blockedIPs} icon={<Ban size={16} />} color={RED} sub="on blocklist" />
              <StatCard label="Audit Entries" value={stats.auditEntries.toLocaleString()} icon={<Terminal size={16} />} color="#6366f1" sub="total logged events" />
              <StatCard label="Failed Logins" value={stats.recentFailedLogins} icon={<AlertTriangle size={16} />} color={AMBER} sub="last 60 minutes" />
              <StatCard label="Locked Accounts" value={stats.lockedAccounts} icon={<Lock size={16} />} color={RED} sub="brute-force locked" />
            </div>
          ) : (
            <p className="text-sm text-gray-400 py-8 text-center">Loading security stats…</p>
          )}

          {/* Security posture summary */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="mb-4 text-sm font-semibold" style={{ fontFamily: 'Oswald, sans-serif', color: NAVY, letterSpacing: '0.04em' }}>
              SECURITY POSTURE — ACTIVE CONTROLS
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { label: 'PBKDF2-SHA256 Password Hashing (310k iterations)', status: true },
                { label: 'Brute-Force Protection (5 failures → progressive lockout)', status: true },
                { label: 'Global Rate Limit (300 req/min per IP)', status: true },
                { label: 'Login Rate Limit (10 attempts per 15 min per IP)', status: true },
                { label: 'OTP Rate Limit (5 sends per 60 sec per IP)', status: true },
                { label: 'IP Blocklist Enforcement', status: true },
                { label: 'Audit Logging for All Sensitive Operations', status: true },
                { label: 'HTTP Security Headers (CSP, HSTS, X-Frame-Options)', status: true },
                { label: 'CORS Restricted to Known Origins', status: true },
                { label: 'Session IP & User-Agent Tracking', status: true },
                { label: 'Error Sanitisation (No Internal Leakage)', status: true },
                { label: 'Admin Role Enforcement on All Sensitive Routes', status: true },
                { label: 'Credential Access Rate Limiting (10 req/min)', status: true },
                { label: 'Selfie / Biometric Data Admin-Only Access', status: true },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-2 text-sm">
                  <CheckCircle size={14} className="shrink-0" style={{ color: item.status ? A : '#d1d5db' }} />
                  <span style={{ color: item.status ? '#374151' : '#9ca3af' }}>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Audit Log ── */}
      {tab === 'audit' && (
        <div>
          <div className="flex flex-wrap gap-3 mb-4">
            <select value={filterType} onChange={e => { setFilterType(e.target.value); setAuditOffset(0); }}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
              <option value="">All Types</option>
              {['LOGIN_SUCCESS','LOGIN_FAILED','LOGOUT','ACCOUNT_LOCKED','ACCOUNT_UNLOCKED','IP_BLOCKED','IP_UNBLOCKED','SESSION_CREATED','SESSION_REVOKED','CREDENTIALS_ACCESSED','REGISTRATION_SUBMITTED','REGISTRATION_APPROVED','REGISTRATION_REJECTED','ADMIN_ACTION','SECURITY_VIOLATION','RATE_LIMIT_HIT'].map(t => (
                <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
              ))}
            </select>
            <select value={filterSeverity} onChange={e => { setFilterSeverity(e.target.value); setAuditOffset(0); }}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
              <option value="">All Severities</option>
              <option value="info">INFO</option>
              <option value="warn">WARN</option>
              <option value="critical">CRITICAL</option>
            </select>
            <button onClick={loadAudit} className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm border border-gray-300 hover:bg-gray-50">
              <RefreshCw size={13} /> Apply
            </button>
            <span className="ml-auto text-xs text-gray-400 self-center">{auditTotal.toLocaleString()} total entries</span>
          </div>

          {loading ? (
            <p className="text-sm text-gray-400 py-8 text-center">Loading audit log…</p>
          ) : (
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              {auditEvents.length === 0 ? (
                <p className="text-sm text-gray-400 py-8 text-center">No events match your filters.</p>
              ) : auditEvents.map(ev => <AuditRow key={ev.id} event={ev} />)}
            </div>
          )}

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <button disabled={auditOffset === 0} onClick={() => setAuditOffset(Math.max(0, auditOffset - 100))}
              className="px-4 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50">
              ← Previous
            </button>
            <span className="text-xs text-gray-400">Showing {auditOffset + 1}–{Math.min(auditOffset + 100, auditTotal)} of {auditTotal}</span>
            <button disabled={auditOffset + 100 >= auditTotal} onClick={() => setAuditOffset(auditOffset + 100)}
              className="px-4 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50">
              Next →
            </button>
          </div>
        </div>
      )}

      {/* ── IP Blocklist ── */}
      {tab === 'ips' && (
        <div className="space-y-6">
          {/* Add form */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="mb-4 text-sm font-semibold" style={{ fontFamily: 'Oswald, sans-serif', color: NAVY, letterSpacing: '0.04em' }}>BLOCK AN IP ADDRESS</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
              <input value={blockIpValue} onChange={e => setBlockIpValue(e.target.value)} placeholder="IP address (e.g. 192.168.1.1)"
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
              <input value={blockReason} onChange={e => setBlockReason(e.target.value)} placeholder="Reason for blocking"
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
              <input value={blockHours} onChange={e => setBlockHours(e.target.value)} type="number" placeholder="Duration (hours, blank = permanent)"
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            </div>
            <button onClick={handleBlockIP}
              className="flex items-center gap-2 px-5 py-2 rounded-lg text-white text-sm"
              style={{ background: RED }}>
              <Ban size={14} /> Block IP
            </button>
          </div>

          {/* Blocked list */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100 text-sm font-semibold" style={{ color: NAVY }}>
              Blocked IPs ({blockedIPs.length})
            </div>
            {blockedIPs.length === 0 ? (
              <p className="text-sm text-gray-400 py-8 text-center">No IPs are currently blocked.</p>
            ) : blockedIPs.map(entry => (
              <div key={entry.ip} className="flex items-center justify-between px-5 py-3 border-b border-gray-100 last:border-0">
                <div>
                  <code className="text-sm font-mono text-gray-800">{entry.ip}</code>
                  <span className="ml-3 text-xs text-gray-400">{entry.reason}</span>
                  {entry.expiresAt && (
                    <span className="ml-3 text-xs text-amber-600">expires {new Date(entry.expiresAt).toLocaleString()}</span>
                  )}
                  {!entry.expiresAt && <span className="ml-3 text-xs text-red-600">permanent</span>}
                </div>
                <button onClick={() => handleUnblockIP(entry.ip)}
                  className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg border border-gray-300 hover:bg-gray-50 text-gray-600">
                  <Unlock size={12} /> Unblock
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Sessions ── */}
      {tab === 'sessions' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">{sessions.length} active session(s)</p>
            <button onClick={handleRevokeAllSessions}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm"
              style={{ background: RED }}>
              <LogOut size={14} /> Revoke All Other Sessions
            </button>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            {sessions.length === 0 ? (
              <p className="text-sm text-gray-400 py-8 text-center">No active sessions found.</p>
            ) : sessions.map((s, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-3 border-b border-gray-100 last:border-0">
                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ background: A + '15' }}>
                  <User size={14} style={{ color: A }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800">{s.username}</p>
                  <p className="text-xs text-gray-400">
                    {s.role} · IP: {s.ip ?? '—'} · created {new Date(s.createdAt).toLocaleString()}
                  </p>
                  {s.userAgent && <p className="text-xs text-gray-300 truncate">{s.userAgent}</p>}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: '#f0fdf4', color: A }}>active</span>
                  <code className="text-xs text-gray-400 font-mono">{s.token}</code>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Tools ── */}
      {tab === 'tools' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Unlock account */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="mb-1 text-sm font-semibold flex items-center gap-2" style={{ fontFamily: 'Oswald, sans-serif', color: NAVY, letterSpacing: '0.04em' }}>
              <Unlock size={16} style={{ color: A }} /> UNLOCK ACCOUNT
            </h3>
            <p className="text-xs text-gray-400 mb-4">Remove brute-force lockout from a user account.</p>
            <input value={unlockUser} onChange={e => setUnlockUser(e.target.value)} placeholder="Username to unlock"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm mb-3" />
            <button onClick={handleUnlockAccount}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm w-full justify-center"
              style={{ background: A }}>
              <Unlock size={14} /> Unlock Account
            </button>
          </div>

          {/* Deactivate user */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="mb-1 text-sm font-semibold flex items-center gap-2" style={{ fontFamily: 'Oswald, sans-serif', color: NAVY, letterSpacing: '0.04em' }}>
              <XCircle size={16} style={{ color: RED }} /> DEACTIVATE USER
            </h3>
            <p className="text-xs text-gray-400 mb-4">Immediately deactivate an account and revoke their session.</p>
            <input value={deactivateUser} onChange={e => setDeactivateUser(e.target.value)} placeholder="Username to deactivate"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm mb-3" />
            <button onClick={handleDeactivateUser}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm w-full justify-center"
              style={{ background: RED }}>
              <XCircle size={14} /> Deactivate User
            </button>
          </div>

          {/* Security info */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 md:col-span-2">
            <h3 className="mb-4 text-sm font-semibold flex items-center gap-2" style={{ fontFamily: 'Oswald, sans-serif', color: NAVY, letterSpacing: '0.04em' }}>
              <Activity size={16} style={{ color: '#6366f1' }} /> SECURITY CONFIGURATION
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
              {[
                ['Password Algorithm', 'PBKDF2-SHA256'],
                ['Hash Iterations', '310,000'],
                ['Session Duration', '24 hours'],
                ['Max Login Attempts', '5 per 15 min'],
                ['Lockout Level 1', '15 minutes'],
                ['Lockout Level 2', '1 hour'],
                ['Lockout Level 3', '24 hours'],
                ['Global Rate Limit', '300 req/min/IP'],
                ['Login Rate Limit', '10 req/15min/IP'],
                ['OTP Rate Limit', '5 req/min/IP'],
                ['Credential Rate Limit', '10 req/min/IP'],
                ['Max Audit Entries', '20,000'],
              ].map(([k, v]) => (
                <div key={k} className="rounded-lg p-3" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                  <p className="text-xs text-gray-400 mb-1">{k}</p>
                  <p className="font-mono text-sm font-semibold text-gray-800">{v}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
