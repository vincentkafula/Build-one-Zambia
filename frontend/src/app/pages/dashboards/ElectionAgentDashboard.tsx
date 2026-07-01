import { useState, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router';
import {
  LayoutDashboard, ClipboardList, UserCircle, Lock,
  CheckCircle, BarChart2, Scale, AlertTriangle, Edit2, Save,
  MapPin, ChevronDown, ArrowRight, LogOut, Shield,
} from 'lucide-react';
import { DashboardShell, DashCard } from '../../components/DashboardShell';
import { clearToken } from '../../lib/api';
import { getApiBase } from '../../lib/apiBase';

const DataEntryPage       = lazy(() => import('../DataEntryPage'));
const ECZEntryPage        = lazy(() => import('../ECZEntryPage'));
const ECZComparisonDashboard = lazy(() => import('../../components/ECZComparisonDashboard'));
const ResultsApprovalQueue = lazy(() => import('../../components/ResultsApprovalQueue'));

function SectionLoader() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
    </div>
  );
}

// ── Role definitions ──────────────────────────────────────────────────────────
export type ElectionRole =
  | 'polling_agent' | 'agent' | 'election_agent'
  | 'ward_manager'
  | 'constituency_manager'
  | 'district_manager'
  | 'provincial_manager'
  | 'national_manager'
  | 'super_admin';

interface RoleDef {
  label: string;
  color: string;
  scopeLabel: string;  // what level this role manages
  eczLevel: string;    // label for ECZ entry section
  canEnterPS: boolean; // can enter polling station results
  sections: SectionKey[];
}

type SectionKey =
  | 'overview'
  | 'data-entry'         // polling station data entry (agents only)
  | 'ecz-entry'          // ECZ official figures entry
  | 'comparison'         // Agent results vs ECZ results
  | 'discrepancy'        // Discrepancy notice
  | 'personal-details'
  | 'security';

const ROLE_DEFS: Record<string, RoleDef> = {
  polling_agent: {
    label: 'Polling Station Agent', color: '#ef4444', scopeLabel: 'Polling Station',
    eczLevel: 'Polling Station', canEnterPS: true,
    sections: ['overview', 'data-entry', 'ecz-entry', 'comparison', 'personal-details', 'security'],
  },
  agent: {
    label: 'Polling Station Agent', color: '#ef4444', scopeLabel: 'Polling Station',
    eczLevel: 'Polling Station', canEnterPS: true,
    sections: ['overview', 'data-entry', 'ecz-entry', 'comparison', 'personal-details', 'security'],
  },
  election_agent: {
    label: 'Polling Station Agent', color: '#ef4444', scopeLabel: 'Polling Station',
    eczLevel: 'Polling Station', canEnterPS: true,
    sections: ['overview', 'data-entry', 'ecz-entry', 'comparison', 'personal-details', 'security'],
  },
  ward_manager: {
    label: 'Ward Manager', color: '#16a34a', scopeLabel: 'Ward',
    eczLevel: 'Ward', canEnterPS: false,
    sections: ['overview', 'ecz-entry', 'comparison', 'discrepancy', 'personal-details', 'security'],
  },
  constituency_manager: {
    label: 'Constituency Manager', color: '#0ea5e9', scopeLabel: 'Constituency',
    eczLevel: 'Constituency', canEnterPS: false,
    sections: ['overview', 'ecz-entry', 'comparison', 'discrepancy', 'personal-details', 'security'],
  },
  district_manager: {
    label: 'District Manager', color: '#f59e0b', scopeLabel: 'District',
    eczLevel: 'District', canEnterPS: false,
    sections: ['overview', 'ecz-entry', 'comparison', 'discrepancy', 'personal-details', 'security'],
  },
  provincial_manager: {
    label: 'Provincial Manager', color: '#8b5cf6', scopeLabel: 'Province',
    eczLevel: 'Province', canEnterPS: false,
    sections: ['overview', 'ecz-entry', 'comparison', 'discrepancy', 'personal-details', 'security'],
  },
  national_manager: {
    label: 'National Manager', color: '#0ea5e9', scopeLabel: 'National',
    eczLevel: 'National', canEnterPS: false,
    sections: ['overview', 'ecz-entry', 'comparison', 'discrepancy', 'personal-details', 'security'],
  },
  super_admin: {
    label: 'Super Administrator', color: '#7c3aed', scopeLabel: 'National',
    eczLevel: 'National', canEnterPS: false,
    sections: ['overview', 'ecz-entry', 'comparison', 'discrepancy', 'personal-details', 'security'],
  },
};

const NAV_ITEMS: { key: SectionKey; label: string; icon: React.ReactNode; group: string }[] = [
  { key: 'overview',         label: 'Overview',                 icon: <LayoutDashboard size={16} />, group: 'MAIN' },
  { key: 'data-entry',       label: 'Data Entry',               icon: <ClipboardList size={16} />,   group: 'ELECTION WORK' },
  { key: 'ecz-entry',        label: 'ECZ Official Figures',     icon: <BarChart2 size={16} />,       group: 'ELECTION WORK' },
  { key: 'comparison',       label: 'Your Results vs ECZ',      icon: <Scale size={16} />,           group: 'ELECTION WORK' },
  { key: 'discrepancy',      label: 'Discrepancy Notices',      icon: <AlertTriangle size={16} />,   group: 'ELECTION WORK' },
  { key: 'personal-details', label: 'Personal Details',         icon: <UserCircle size={16} />,      group: 'PROFILE' },
  { key: 'security',         label: 'Security Settings',        icon: <Lock size={16} />,            group: 'PROFILE' },
];

// ── Role selector shown BEFORE login ─────────────────────────────────────────
const SELECTABLE_ROLES: { role: string; label: string; color: string; icon: React.ReactNode }[] = [
  { role: 'polling_agent',        label: 'Polling Station Agent', color: '#ef4444', icon: <MapPin size={18} /> },
  { role: 'ward_manager',         label: 'Ward Manager',          color: '#16a34a', icon: <Shield size={18} /> },
  { role: 'constituency_manager', label: 'Constituency Manager',  color: '#0ea5e9', icon: <Shield size={18} /> },
  { role: 'district_manager',     label: 'District Manager',      color: '#f59e0b', icon: <Shield size={18} /> },
  { role: 'provincial_manager',   label: 'Provincial Manager',    color: '#8b5cf6', icon: <Shield size={18} /> },
  { role: 'national_manager',     label: 'National Manager',      color: '#0ea5e9', icon: <Shield size={18} /> },
];

// ── Login gate shown when no session ─────────────────────────────────────────
function ElectionLoginGate({ onLogin }: { onLogin: (user: Record<string, string>) => void }) {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const roleInfo = SELECTABLE_ROLES.find(r => r.role === selectedRole);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedRole) { setError('Please select your role first'); return; }
    if (!username || !password) { setError('Please enter your credentials'); return; }
    setLoading(true); setError('');

    try {
      const res = await fetch(`${getApiBase()}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Invalid username or password');

      const userRole = data.user?.role ?? '';
      // Verify the logged-in user's role matches what they selected
      const normalised = userRole === 'agent' || userRole === 'election_agent' ? 'polling_agent' : userRole;
      if (normalised !== selectedRole && userRole !== 'super_admin') {
        throw new Error(`Your account role (${userRole}) does not match the selected role. Please select the correct role.`);
      }

      sessionStorage.setItem('boz_session_token', data.token);
      sessionStorage.setItem('boz_election_user', JSON.stringify(data.user));
      onLogin(data.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    }
    setLoading(false);
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-12"
      style={{ backgroundColor: '#050c17' }}
    >
      {/* Background grid */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: `linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)`,
        backgroundSize: '48px 48px',
      }} />

      <div className="relative w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full"
            style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <Shield size={13} style={{ color: '#ef4444' }} />
            <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: '0.7rem', letterSpacing: '0.18em', color: 'rgba(255,255,255,0.5)' }}>
              BOZ ELECTION PORTAL — 2026
            </span>
          </div>
          <h1 style={{ fontFamily: 'Oswald, sans-serif', fontSize: '2rem', letterSpacing: '0.04em', color: '#fff' }}>
            ELECTION DASHBOARD
          </h1>
          <p className="mt-2" style={{ color: 'rgba(255,255,255,0.38)', fontSize: '0.88rem' }}>
            Sign in with your issued credentials
          </p>
        </div>

        <div className="rounded-2xl p-7" style={{ backgroundColor: '#0b1929', border: `1px solid ${roleInfo?.color ?? 'rgba(255,255,255,0.08)'}30` }}>

          {/* Error */}
          {error && (
            <div className="mb-5 px-4 py-3 rounded-xl text-sm"
              style={{ backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Role dropdown */}
            <div>
              <label className="block text-xs mb-2"
                style={{ fontFamily: 'Oswald, sans-serif', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.4)' }}>
                SELECT YOUR ROLE
              </label>
              <div className="relative">
                <button type="button" onClick={() => setDropdownOpen(v => !v)}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm text-left"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    border: selectedRole ? `1px solid ${roleInfo?.color}60` : '1px solid rgba(255,255,255,0.1)',
                    color: selectedRole ? '#fff' : 'rgba(255,255,255,0.35)',
                  }}>
                  <div className="flex items-center gap-3">
                    {roleInfo && (
                      <div className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
                        style={{ backgroundColor: `${roleInfo.color}20`, color: roleInfo.color }}>
                        {roleInfo.icon}
                      </div>
                    )}
                    {roleInfo?.label ?? 'Choose your role...'}
                  </div>
                  <ChevronDown size={16} style={{ color: 'rgba(255,255,255,0.4)', transform: dropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                </button>

                {dropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 rounded-xl overflow-hidden z-50"
                    style={{ backgroundColor: '#0f1f33', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
                    {SELECTABLE_ROLES.map(r => (
                      <button type="button" key={r.role}
                        onClick={() => { setSelectedRole(r.role); setDropdownOpen(false); setError(''); }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-left transition-colors"
                        style={{
                          color: selectedRole === r.role ? r.color : 'rgba(255,255,255,0.7)',
                          backgroundColor: selectedRole === r.role ? `${r.color}12` : 'transparent',
                        }}
                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.backgroundColor = `${r.color}12`}
                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.backgroundColor = selectedRole === r.role ? `${r.color}12` : 'transparent'}>
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                          style={{ backgroundColor: `${r.color}20`, color: r.color }}>
                          {r.icon}
                        </div>
                        {r.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Username */}
            <div>
              <label className="block text-xs mb-2"
                style={{ fontFamily: 'Oswald, sans-serif', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.4)' }}>
                USERNAME
              </label>
              <input type="text" value={username} onChange={e => setUsername(e.target.value)}
                autoComplete="username" placeholder="Enter your username"
                className="w-full px-4 py-3 rounded-xl text-sm text-white outline-none"
                style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                onFocus={e => (e.target.style.borderColor = `${roleInfo?.color ?? '#ef4444'}70`)}
                onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')} />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs mb-2"
                style={{ fontFamily: 'Oswald, sans-serif', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.4)' }}>
                PASSWORD
              </label>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                  autoComplete="current-password" placeholder="••••••••"
                  className="w-full px-4 py-3 pr-12 rounded-xl text-sm text-white outline-none"
                  style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                  onFocus={e => (e.target.style.borderColor = `${roleInfo?.color ?? '#ef4444'}70`)}
                  onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')} />
                <button type="button" onClick={() => setShowPass(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs px-2 py-1 rounded"
                  style={{ color: 'rgba(255,255,255,0.3)' }}>
                  {showPass ? 'HIDE' : 'SHOW'}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button type="submit" disabled={loading || !selectedRole || !username || !password}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl transition-all"
              style={{
                background: (!selectedRole || !username || !password || loading) ? 'rgba(255,255,255,0.08)' : `linear-gradient(135deg, ${roleInfo?.color}, ${roleInfo?.color}cc)`,
                color: '#fff', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.1em', fontSize: '0.88rem',
                cursor: (!selectedRole || !username || !password || loading) ? 'not-allowed' : 'pointer',
                boxShadow: (!selectedRole || !username || !password || loading) ? 'none' : `0 4px 24px ${roleInfo?.color}40`,
              }}>
              {loading ? (
                <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> AUTHENTICATING...</>
              ) : (
                <>SIGN IN <ArrowRight size={15} /></>
              )}
            </button>
          </form>

          <button onClick={() => navigate('/dashboard-login')}
            className="w-full mt-4 text-sm py-2 transition-colors text-center"
            style={{ color: 'rgba(255,255,255,0.25)' }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.55)'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.25)'}>
            ← Back to portal selection
          </button>
        </div>

        <p className="text-xs text-center mt-5" style={{ color: 'rgba(255,255,255,0.18)' }}>
          Credentials are issued by your supervisor · All access is logged
        </p>
      </div>
    </div>
  );
}

// ── Main dashboard ────────────────────────────────────────────────────────────
function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs mb-1" style={{ color: 'rgba(255,255,255,0.35)', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.08em' }}>{label}</p>
      <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.9rem' }}>{value}</p>
    </div>
  );
}

function ElectionDashboardMain({ user }: { user: Record<string, string> }) {
  const navigate = useNavigate();
  const role = user?.role ?? 'polling_agent';
  const roleDef = ROLE_DEFS[role] ?? ROLE_DEFS['polling_agent'];
  const allowed = new Set(roleDef.sections);
  const [active, setActive] = useState<SectionKey>('overview');
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState({
    firstName: user?.name?.split(' ')[0] ?? user?.username ?? 'User',
    lastName:  user?.name?.split(' ').slice(1).join(' ') ?? '',
    phone:     user?.phone ?? '',
    email:     user?.email ?? '',
    scope:     user?.scopeName ?? 'Not assigned',
    staffId:   user?.username ?? '',
  });

  function handleLogout() {
    clearToken();
    sessionStorage.removeItem('boz_election_user');
    sessionStorage.removeItem('boz_session_token');
    navigate('/dashboard/agent');
  }

  // Build nav from allowed sections
  const groupMap: Record<string, typeof NAV_ITEMS> = {};
  for (const item of NAV_ITEMS) {
    if (!allowed.has(item.key)) continue;
    if (!groupMap[item.group]) groupMap[item.group] = [];
    groupMap[item.group].push(item);
  }
  const navGroups = Object.entries(groupMap).map(([group, items]) => ({ group, items }));

  const NAVY = '#0f1f33';
  const C = roleDef.color;

  function renderSection() {
    switch (active) {

      case 'overview':
        return (
          <div>
            {/* Role badge */}
            <div className="flex items-center gap-3 mb-6 px-4 py-3 rounded-xl"
              style={{ backgroundColor: `${C}12`, border: `1px solid ${C}30` }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: `${C}20`, color: C }}>
                <Shield size={18} />
              </div>
              <div>
                <p className="font-semibold text-white text-sm">{roleDef.label}</p>
                <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.45)' }}>
                  Scope: {roleDef.scopeLabel} · {profile.scope} · 2026 General Elections
                </p>
              </div>
              <button onClick={handleLogout} className="ml-auto flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg"
                style={{ backgroundColor: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.45)' }}>
                <LogOut size={12} /> Sign Out
              </button>
            </div>

            <h2 className="mb-2" style={{ fontFamily: 'Oswald, sans-serif', fontSize: '1.4rem', letterSpacing: '0.04em', color: '#fff' }}>
              Welcome, {profile.firstName}
            </h2>
            <p className="mb-6" style={{ color: 'rgba(255,255,255,0.38)', fontSize: '0.82rem' }}>
              2026 Zambian General Elections — {roleDef.eczLevel} Level
            </p>

            {/* Role description */}
            <div className="p-5 rounded-2xl mb-5" style={{ backgroundColor: NAVY, border: `1px solid ${C}20` }}>
              <p className="text-sm mb-1" style={{ color: '#fff', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.04em' }}>YOUR RESPONSIBILITIES</p>
              <p className="text-sm mt-2" style={{ color: 'rgba(255,255,255,0.55)', lineHeight: 1.6 }}>
                {roleDef.canEnterPS
                  ? 'Enter the figures officially announced by the Electoral Commission of Zambia (ECZ) at your polling station. These will be compared against agent-captured data to identify any discrepancies.'
                  : `Enter the ECZ officially announced figures at ${roleDef.eczLevel} level. Review agent-submitted results from all polling stations within your ${roleDef.scopeLabel.toLowerCase()} and identify discrepancies. You are not permitted to enter results at polling station${role === 'ward_manager' ? '' : ', ward'} level.`
                }
              </p>
            </div>

            {/* Quick access */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {NAV_ITEMS.filter(n => allowed.has(n.key) && n.key !== 'overview').map(s => (
                <button key={s.key} onClick={() => setActive(s.key)}
                  className="flex items-center gap-3 p-4 rounded-2xl text-left w-full transition-all"
                  style={{ backgroundColor: NAVY, border: '1px solid rgba(255,255,255,0.07)' }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.border = `1px solid ${C}40`}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.border = '1px solid rgba(255,255,255,0.07)'}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: `${C}20`, color: C }}>
                    {s.icon}
                  </div>
                  <div>
                    <p style={{ color: '#fff', fontSize: '0.88rem', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.04em' }}>{s.label}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>
                      {s.key === 'data-entry' && 'Submit polling station results'}
                      {s.key === 'ecz-entry' && `Enter ECZ official ${roleDef.eczLevel} figures`}
                      {s.key === 'comparison' && 'Your results vs ECZ announced figures'}
                      {s.key === 'discrepancy' && 'View flagged discrepancies'}
                      {s.key === 'personal-details' && 'View and update your profile'}
                      {s.key === 'security' && 'Change your password'}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        );

      case 'data-entry':
        return (
          <div>
            <div className="mb-6">
              <h2 style={{ fontFamily: 'Oswald, sans-serif', fontSize: '1.4rem', color: '#fff' }}>Data Entry — Polling Station Results</h2>
              <p className="mt-1 text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
                Enter the votes as officially announced at your polling station.
              </p>
            </div>
            <Suspense fallback={<SectionLoader />}><DataEntryPage /></Suspense>
          </div>
        );

      case 'ecz-entry':
        return (
          <div>
            <div className="mb-6">
              <h2 style={{ fontFamily: 'Oswald, sans-serif', fontSize: '1.4rem', color: '#fff' }}>ECZ Official Figures — {roleDef.eczLevel} Level</h2>
              <p className="mt-1 text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
                Enter the figures officially announced by the Electoral Commission of Zambia (ECZ) at {roleDef.eczLevel.toLowerCase()} level.
                These will be compared against agent-captured polling station data to identify any discrepancies.
              </p>
            </div>
            <Suspense fallback={<SectionLoader />}><ECZEntryPage /></Suspense>
          </div>
        );

      case 'comparison':
        return (
          <div>
            <div className="mb-6">
              <h2 style={{ fontFamily: 'Oswald, sans-serif', fontSize: '1.4rem', color: '#fff' }}>
                {roleDef.canEnterPS ? 'Your Results vs ECZ Results' : `Agents' Results vs ECZ Results`}
              </h2>
              <p className="mt-1 text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
                {roleDef.canEnterPS
                  ? 'Compare the results you submitted against the official ECZ announced figures for your polling station.'
                  : `Aggregated agent results from all polling stations in your ${roleDef.scopeLabel.toLowerCase()} compared to ECZ official announced figures.`}
              </p>
            </div>
            <Suspense fallback={<SectionLoader />}><ECZComparisonDashboard /></Suspense>
          </div>
        );

      case 'discrepancy':
        return (
          <div>
            <div className="mb-6">
              <h2 style={{ fontFamily: 'Oswald, sans-serif', fontSize: '1.4rem', color: '#fff' }}>Discrepancy Notices</h2>
              <p className="mt-1 text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
                Polling stations where agent-submitted results do not match ECZ announced figures within your {roleDef.scopeLabel.toLowerCase()}.
              </p>
            </div>

            {/* Restricted notice */}
            <div className="mb-5 px-5 py-4 rounded-2xl" style={{ backgroundColor: '#f59e0b12', border: '1px solid #f59e0b30' }}>
              <div className="flex items-start gap-3">
                <AlertTriangle size={16} className="shrink-0 mt-0.5" style={{ color: '#f59e0b' }} />
                <div>
                  <p className="text-sm font-semibold" style={{ color: '#fcd34d' }}>Access Restriction</p>
                  <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.5)' }}>
                    As a {roleDef.label}, you are not permitted to enter or modify results at{' '}
                    {role === 'ward_manager' && 'polling station level.'}
                    {role === 'constituency_manager' && 'polling station or ward level.'}
                    {role === 'district_manager' && 'polling station, ward, or constituency level.'}
                    {role === 'provincial_manager' && 'polling station, ward, constituency, or district level.'}
                    {(role === 'national_manager' || role === 'super_admin') && 'polling station, ward, constituency, district, or provincial level.'}
                    {' '}You may only view and report discrepancies.
                  </p>
                </div>
              </div>
            </div>

            <Suspense fallback={<SectionLoader />}><ResultsApprovalQueue /></Suspense>
          </div>
        );

      case 'personal-details':
        return (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 style={{ fontFamily: 'Oswald, sans-serif', fontSize: '1.4rem', color: '#fff' }}>Personal Details</h2>
              <button onClick={() => setEditing(v => !v)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm"
                style={{ background: C, color: '#fff', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.06em' }}>
                {editing ? <><Save size={13} /> SAVE</> : <><Edit2 size={13} /> EDIT</>}
              </button>
            </div>
            <DashCard title="Profile Information">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {(Object.keys(profile) as (keyof typeof profile)[]).map(k => {
                  const labels: Record<keyof typeof profile, string> = {
                    firstName: 'FIRST NAME', lastName: 'LAST NAME', phone: 'PHONE',
                    email: 'EMAIL', scope: 'ASSIGNED SCOPE', staffId: 'STAFF ID',
                  };
                  return editing && !['staffId'].includes(k) ? (
                    <div key={k}>
                      <label className="block text-xs mb-1" style={{ color: 'rgba(255,255,255,0.35)', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.1em' }}>{labels[k]}</label>
                      <input className="w-full px-3 py-2.5 rounded-xl text-sm text-white outline-none"
                        value={profile[k]} onChange={e => setProfile(p => ({ ...p, [k]: e.target.value }))}
                        style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: `1px solid ${C}40` }} />
                    </div>
                  ) : (
                    <Field key={k} label={labels[k]} value={profile[k] || '—'} />
                  );
                })}
                <Field label="ROLE" value={roleDef.label} />
              </div>
            </DashCard>
          </div>
        );

      case 'security':
        return (
          <div>
            <h2 className="mb-6" style={{ fontFamily: 'Oswald, sans-serif', fontSize: '1.4rem', color: '#fff' }}>Security Settings</h2>
            <DashCard title="Change Password">
              <div className="max-w-md space-y-4">
                {['Current Password', 'New Password', 'Confirm New Password'].map(label => (
                  <div key={label}>
                    <label className="text-xs mb-1 block" style={{ color: 'rgba(255,255,255,0.35)', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.1em' }}>{label.toUpperCase()}</label>
                    <input type="password" placeholder="••••••••" className="w-full px-3 py-2.5 rounded-xl text-sm text-white outline-none"
                      style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }} />
                  </div>
                ))}
                <button className="px-5 py-2.5 rounded-xl text-sm" style={{ background: C, color: '#fff', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.06em' }}>
                  UPDATE PASSWORD
                </button>
              </div>
            </DashCard>
          </div>
        );

      default: return null;
    }
  }

  return (
    <DashboardShell
      accentColor={C}
      title="Election Dashboard"
      subtitle={roleDef.label.toUpperCase()}
      user={{ name: `${profile.firstName} ${profile.lastName}`.trim() || 'User', role: roleDef.label, id: profile.staffId }}
      navGroups={navGroups}
      activeSection={active}
      onNavigate={k => setActive(k as SectionKey)}
      notifications={0}
    >
      {renderSection()}
    </DashboardShell>
  );
}

// ── Root component: gate → dashboard ─────────────────────────────────────────
export default function ElectionAgentDashboard() {
  const rawUser = sessionStorage.getItem('boz_election_user');
  const [user, setUser] = useState<Record<string, string> | null>(() => {
    try { return rawUser ? JSON.parse(rawUser) : null; } catch { return null; }
  });

  if (!user) {
    return <ElectionLoginGate onLogin={u => setUser(u)} />;
  }
  return <ElectionDashboardMain user={user} />;
}
