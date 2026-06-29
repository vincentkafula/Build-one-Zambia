/**
 * SuperAdminGate
 * Renders a full-screen login wall when the user tries to access the Admin Panel.
 * On success, stores the super-admin JWT in sessionStorage under 'boz_super_admin_token'
 * and renders children. The session expires when the browser tab closes.
 */
import { useState, useEffect, useCallback } from 'react';
import { Shield, Eye, EyeOff, LogOut, AlertCircle, Lock } from 'lucide-react';
import { getApiBase } from '../lib/apiBase';

const SESSION_KEY = 'boz_super_admin_token';
const SESSION_USER_KEY = 'boz_super_admin_user';

interface SuperAdminSession {
  username: string;
  name: string;
  role: string;
  token: string;
  expiresAt: number;
}

function getStoredSession(): SuperAdminSession | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const s: SuperAdminSession = JSON.parse(raw);
    if (Date.now() > s.expiresAt) {
      sessionStorage.removeItem(SESSION_KEY);
      sessionStorage.removeItem(SESSION_USER_KEY);
      return null;
    }
    return s;
  } catch {
    return null;
  }
}

function storeSession(session: SuperAdminSession) {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  sessionStorage.setItem(SESSION_USER_KEY, JSON.stringify({ username: session.username, name: session.name, role: session.role }));
}

function clearSession() {
  sessionStorage.removeItem(SESSION_KEY);
  sessionStorage.removeItem(SESSION_USER_KEY);
}

export function getSuperAdminToken(): string | null {
  const s = getStoredSession();
  return s?.token ?? null;
}

interface Props {
  children: React.ReactNode;
}

export function SuperAdminGate({ children }: Props) {
  const [session, setSession] = useState<SuperAdminSession | null>(() => getStoredSession());
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);

  // Auto-clear expired lockout
  useEffect(() => {
    if (!lockedUntil) return;
    const ms = lockedUntil - Date.now();
    if (ms <= 0) { setLockedUntil(null); return; }
    const t = setTimeout(() => setLockedUntil(null), ms);
    return () => clearTimeout(t);
  }, [lockedUntil]);

  const handleLogin = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (lockedUntil && Date.now() < lockedUntil) return;
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${getApiBase()}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password }),
      });

      const data = await res.json();

      if (!res.ok) {
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        if (newAttempts >= 5) {
          const lockMs = 5 * 60 * 1000; // 5 minutes
          setLockedUntil(Date.now() + lockMs);
          setError('Too many failed attempts. Locked for 5 minutes.');
        } else {
          setError(data.error || 'Invalid credentials. Access denied.');
        }
        setLoading(false);
        return;
      }

      // Verify the authenticated user is super_admin
      const role = data.user?.role ?? data.role ?? '';
      if (role !== 'super_admin') {
        setError('Access denied. Only Super Administrators can access the Admin Panel.');
        setAttempts(a => a + 1);
        setLoading(false);
        return;
      }

      const newSession: SuperAdminSession = {
        username: data.user?.username ?? username,
        name: data.user?.name ?? 'Super Administrator',
        role,
        token: data.token,
        expiresAt: Date.now() + 8 * 60 * 60 * 1000, // 8 hours
      };
      storeSession(newSession);
      setSession(newSession);
      setAttempts(0);
    } catch {
      setError('Connection error. Please try again.');
    }

    setLoading(false);
  }, [username, password, attempts, lockedUntil]);

  const handleLogout = useCallback(() => {
    clearSession();
    setSession(null);
    setUsername('');
    setPassword('');
    setError('');
  }, []);

  // ── Authenticated: render children with a logout bar ────────────────────
  if (session) {
    return (
      <div>
        <div
          className="flex items-center justify-between px-5 py-3 rounded-xl mb-6"
          style={{ backgroundColor: '#7c3aed18', border: '1px solid #7c3aed40' }}
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#7c3aed30' }}>
              <Shield size={15} style={{ color: '#7c3aed' }} />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Admin Panel — Super Administrator</p>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>
                Signed in as <span style={{ color: '#a78bfa' }}>@{session.username}</span> · Session expires when tab closes
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm"
            style={{ backgroundColor: '#7c3aed20', color: '#a78bfa', border: '1px solid #7c3aed40' }}
          >
            <LogOut size={13} /> Sign Out
          </button>
        </div>
        {children}
      </div>
    );
  }

  // ── Unauthenticated: login wall ──────────────────────────────────────────
  const isLocked = lockedUntil !== null && Date.now() < lockedUntil;
  const lockSecondsLeft = isLocked ? Math.ceil((lockedUntil! - Date.now()) / 1000) : 0;

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <div
        className="w-full max-w-md rounded-2xl p-8"
        style={{ backgroundColor: '#0f1f33', border: '1px solid rgba(255,255,255,0.08)' }}
      >
        {/* Header */}
        <div className="flex flex-col items-center mb-8">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
            style={{ backgroundColor: '#7c3aed20', border: '1px solid #7c3aed40' }}
          >
            <Lock size={28} style={{ color: '#7c3aed' }} />
          </div>
          <h2
            className="text-2xl text-white text-center"
            style={{ fontFamily: 'Oswald, sans-serif', letterSpacing: '0.06em' }}
          >
            ADMIN PANEL ACCESS
          </h2>
          <p className="text-sm text-center mt-2" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Restricted to authorised Super Administrators only
          </p>
        </div>

        {/* Error */}
        {error && (
          <div
            className="flex items-start gap-3 px-4 py-3 rounded-xl mb-6"
            style={{ backgroundColor: '#ef444418', border: '1px solid #ef444440' }}
          >
            <AlertCircle size={16} className="shrink-0 mt-0.5" style={{ color: '#ef4444' }} />
            <p className="text-sm" style={{ color: '#fca5a5' }}>{error}</p>
          </div>
        )}

        {/* Lockout countdown */}
        {isLocked && (
          <div
            className="px-4 py-3 rounded-xl mb-6 text-center"
            style={{ backgroundColor: '#f59e0b18', border: '1px solid #f59e0b40' }}
          >
            <p className="text-sm" style={{ color: '#fcd34d' }}>
              Account locked. Try again in <strong>{Math.floor(lockSecondsLeft / 60)}:{String(lockSecondsLeft % 60).padStart(2, '0')}</strong>
            </p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label
              className="block text-xs mb-2"
              style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.1em' }}
            >
              ADMIN USERNAME
            </label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              disabled={isLocked || loading}
              autoComplete="username"
              className="w-full px-4 py-3 rounded-xl text-sm text-white outline-none transition-all"
              style={{
                backgroundColor: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.12)',
              }}
              onFocus={e => (e.target.style.borderColor = '#7c3aed')}
              onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.12)')}
              placeholder="Enter admin username"
            />
          </div>

          <div>
            <label
              className="block text-xs mb-2"
              style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.1em' }}
            >
              ADMIN PASSWORD
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                disabled={isLocked || loading}
                autoComplete="current-password"
                className="w-full px-4 py-3 pr-12 rounded-xl text-sm text-white outline-none transition-all"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.12)',
                }}
                onFocus={e => (e.target.style.borderColor = '#7c3aed')}
                onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.12)')}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1"
                style={{ color: 'rgba(255,255,255,0.35)' }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={!username.trim() || !password || loading || isLocked}
            className="w-full py-3 rounded-xl text-sm font-semibold transition-all"
            style={{
              background: (!username.trim() || !password || loading || isLocked)
                ? 'rgba(124,58,237,0.3)'
                : '#7c3aed',
              color: '#fff',
              fontFamily: 'Oswald, sans-serif',
              letterSpacing: '0.08em',
              cursor: (!username.trim() || !password || loading || isLocked) ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'VERIFYING...' : 'SIGN IN TO ADMIN PANEL'}
          </button>
        </form>

        <p className="text-xs text-center mt-6" style={{ color: 'rgba(255,255,255,0.2)' }}>
          All access attempts are logged and monitored · Unauthorised access is prohibited
        </p>
      </div>
    </div>
  );
}

export default SuperAdminGate;
export { SuperAdminGate as default };
