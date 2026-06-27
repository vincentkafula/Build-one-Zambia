import { API_BASE } from '@/app/lib/apiBase';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { User, Building2, Building, GraduationCap, ClipboardList, BarChart2, ArrowRight, Lock, Eye, EyeOff, Zap, ChevronLeft, Shield } from 'lucide-react';
// Inline API base resolver — relative path in prod so proxy always works
function getApiBaseUrl(): string {
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
    return '/make-server-8fca9621';
  }
  return API_BASE;
}

// Election roles that use real backend auth
const ELECTION_DASHBOARD_IDS = ['agent', 'manager'];
const AGENT_ROLES = ['agent'];
const MANAGER_ROLES = ['super_admin','national_manager','provincial_manager','district_manager','constituency_manager','ward_manager','admin'];

const DASHBOARD_TYPES = [
  {
    id: 'member',
    title: 'Member Portal',
    description: 'Access your BOZ membership, elections & benefits',
    icon: User,
    color: '#3b82f6',
    route: '/dashboard/member',
  },
  {
    id: 'cooperative',
    title: 'Cooperative',
    description: 'Equipment, exports, investors & cooperative data',
    icon: Building2,
    color: '#10b981',
    route: '/dashboard/cooperative',
  },
  {
    id: 'chamber',
    title: 'Chamber of Commerce',
    description: 'Ward chamber, investments & cooperative directory',
    icon: Building,
    color: '#f59e0b',
    route: '/dashboard/chamber',
  },
  {
    id: 'internship',
    title: 'Internship Portal',
    description: 'Zambia–US partnership internship management',
    icon: GraduationCap,
    color: '#8b5cf6',
    route: '/dashboard/internship',
  },
  {
    id: 'agent',
    title: 'Election Agent',
    description: 'Submit and track polling station results',
    icon: ClipboardList,
    color: '#ef4444',
    route: '/dashboard/agent',
  },
  {
    id: 'manager',
    title: 'Results Manager',
    description: 'National ECZ figures, province results & admin',
    icon: BarChart2,
    color: '#0ea5e9',
    route: '/dashboard/manager',
  },
];

const VALID_USERNAME = 'Bozplans';
const VALID_PASSWORD = 'Wakuca55';

export default function DashboardLogin() {
  const navigate = useNavigate();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const selected = DASHBOARD_TYPES.find(d => d.id === selectedId);
  const isElectionLogin = selectedId ? ELECTION_DASHBOARD_IDS.includes(selectedId) : false;

  function handleSelect(id: string) {
    setSelectedId(id);
    setError('');
    setUsername('');
    setPassword('');
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedId) return;
    if (!username || !password) { setError('Please enter your credentials'); return; }

    setIsLoading(true);
    setError('');

    try {
      if (isElectionLogin) {
        // ── Try real backend authentication ──
        let backendSuccess = false;
        try {
          const res = await fetch(`${getApiBaseUrl()}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
          });
          const data = await res.json();

          if (res.ok && data.token) {
            // Backend auth succeeded — store session and route
            sessionStorage.setItem('boz_session_token', data.token);
            sessionStorage.setItem('boz_election_user', JSON.stringify(data.user));

            const role: string = data.user?.role ?? '';
            if (AGENT_ROLES.includes(role)) {
              navigate('/dashboard/agent');
            } else if (MANAGER_ROLES.includes(role)) {
              navigate('/dashboard/manager');
            } else {
              throw new Error(`Your account role "${role}" does not have access to this portal.`);
            }
            backendSuccess = true;
          } else {
            // Backend responded but credentials are wrong
            throw new Error(data.error || data.details || 'Invalid username or password');
          }
        } catch (fetchErr) {
          // ── Network/CORS failure — fall back to local hardcoded admin check ──
          if (fetchErr instanceof TypeError && fetchErr.message.includes('fetch')) {
            // Backend unreachable — only allow the hardcoded super admin
            if (username === VALID_USERNAME && password === VALID_PASSWORD) {
              const localUser = {
                username: VALID_USERNAME,
                role: 'super_admin',
                name: 'Super National Manager',
                email: 'admin@bozplans.org',
                scopeName: 'National',
              };
              sessionStorage.setItem('boz_election_user', JSON.stringify(localUser));
              navigate('/dashboard/manager');
              backendSuccess = true;
            } else {
              throw new Error('Cannot reach the authentication server. If you are the system administrator, use your master credentials. All other users require network access.');
            }
          } else {
            // Re-throw non-network errors (wrong credentials etc.)
            throw fetchErr;
          }
        }

        if (!backendSuccess) {
          throw new Error('Login failed. Please try again.');
        }
      } else {
        // ── Legacy hardcoded auth for non-election dashboards ──
        if (username !== VALID_USERNAME || password !== VALID_PASSWORD) {
          throw new Error('Invalid username or password');
        }
        if (selected) navigate(selected.route);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
      setIsLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden"
      style={{ backgroundColor: '#050c17' }}
    >
      {/* Background grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
        }}
      />

      {/* Glow orbs */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: '-10%', left: '30%',
          width: 600, height: 400,
          background: 'radial-gradient(ellipse, rgba(59,130,246,0.08) 0%, transparent 70%)',
        }}
      />
      <div
        className="absolute pointer-events-none"
        style={{
          bottom: '-5%', right: '20%',
          width: 500, height: 300,
          background: 'radial-gradient(ellipse, rgba(139,92,246,0.07) 0%, transparent 70%)',
        }}
      />

      <div className="relative w-full max-w-5xl">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 mb-5 px-4 py-2 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <Zap size={13} style={{ color: '#3b82f6' }} />
            <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: '0.7rem', letterSpacing: '0.18em', color: 'rgba(255,255,255,0.5)' }}>
              BUILD ONE ZAMBIA — SECURE ACCESS
            </span>
          </div>
          <h1
            style={{
              fontFamily: 'Oswald, sans-serif',
              fontSize: 'clamp(2rem, 5vw, 3rem)',
              letterSpacing: '0.04em',
              color: '#fff',
              lineHeight: 1.1,
            }}
          >
            PORTAL{' '}
            <span style={{ background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              DASHBOARD
            </span>
          </h1>
          <p className="mt-3" style={{ color: 'rgba(255,255,255,0.38)', fontSize: '0.9rem' }}>
            Select your dashboard to continue
          </p>
        </div>

        {!selectedId ? (
          /* ── Dashboard selection grid ── */
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {DASHBOARD_TYPES.map((dash) => (
                <button
                  key={dash.id}
                  onClick={() => handleSelect(dash.id)}
                  className="text-left rounded-2xl p-5 transition-all duration-200 group"
                  style={{
                    backgroundColor: '#0b1929',
                    border: '1px solid rgba(255,255,255,0.07)',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.border = `1px solid ${dash.color}50`;
                    (e.currentTarget as HTMLElement).style.backgroundColor = '#0f2038';
                    (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)';
                    (e.currentTarget as HTMLElement).style.boxShadow = `0 12px 40px ${dash.color}18`;
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.border = '1px solid rgba(255,255,255,0.07)';
                    (e.currentTarget as HTMLElement).style.backgroundColor = '#0b1929';
                    (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                    (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                  }}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                      style={{
                        background: `linear-gradient(135deg, ${dash.color}22, ${dash.color}0a)`,
                        border: `1px solid ${dash.color}30`,
                      }}
                    >
                      <dash.icon size={20} style={{ color: dash.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        style={{
                          fontFamily: 'Oswald, sans-serif',
                          fontSize: '1rem',
                          letterSpacing: '0.04em',
                          color: '#fff',
                          marginBottom: '4px',
                        }}
                      >
                        {dash.title}
                      </p>
                      <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.38)', lineHeight: 1.5 }}>
                        {dash.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 mt-4" style={{ color: dash.color }}>
                    <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: '0.72rem', letterSpacing: '0.1em' }}>ACCESS</span>
                    <ArrowRight size={13} />
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-8 text-center">
              <button
                onClick={() => navigate('/')}
                className="text-sm transition-colors"
                style={{ color: 'rgba(255,255,255,0.3)' }}
                onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.6)'}
                onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.3)'}
              >
                ← Back to home
              </button>
            </div>
          </>
        ) : (
          /* ── Login form ── */
          <div className="max-w-md mx-auto">
            {/* Card */}
            <div
              className="rounded-2xl overflow-hidden"
              style={{
                backgroundColor: '#0b1929',
                border: `1px solid ${selected?.color}30`,
                boxShadow: `0 0 60px ${selected?.color}12`,
              }}
            >
              {/* Dashboard header strip */}
              <div
                className="px-7 pt-7 pb-6"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
              >
                <div className="flex items-center gap-4 mb-3">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{
                      background: `linear-gradient(135deg, ${selected?.color}30, ${selected?.color}10)`,
                      border: `1px solid ${selected?.color}40`,
                    }}
                  >
                    {selected && <selected.icon size={22} style={{ color: selected.color }} />}
                  </div>
                  <div>
                    <p
                      style={{
                        fontFamily: 'Oswald, sans-serif',
                        fontSize: '1.1rem',
                        letterSpacing: '0.04em',
                        color: '#fff',
                      }}
                    >
                      {selected?.title}
                    </p>
                    <p style={{ fontSize: '0.76rem', color: 'rgba(255,255,255,0.38)' }}>
                      {isElectionLogin ? 'Use credentials issued by your supervisor' : 'Secure sign in required'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleLogin} className="px-7 py-6">
                {error && (
                  <div
                    className="mb-5 px-4 py-3 rounded-xl text-sm"
                    style={{ backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171' }}
                  >
                    {error}
                  </div>
                )}

                {/* Username */}
                <div className="mb-4">
                  <label
                    className="block mb-2 text-xs"
                    style={{ fontFamily: 'Oswald, sans-serif', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.4)' }}
                  >
                    USERNAME
                  </label>
                  <div className="relative">
                    <User
                      size={15}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2"
                      style={{ color: 'rgba(255,255,255,0.25)' }}
                    />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Enter username"
                      autoComplete="username"
                      className="w-full pl-10 pr-4 py-3 rounded-xl text-sm transition-all"
                      style={{
                        backgroundColor: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: '#fff',
                        outline: 'none',
                      }}
                      onFocus={(e) => (e.target.style.borderColor = `${selected?.color}70`)}
                      onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="mb-6">
                  <label
                    className="block mb-2 text-xs"
                    style={{ fontFamily: 'Oswald, sans-serif', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.4)' }}
                  >
                    PASSWORD
                  </label>
                  <div className="relative">
                    <Lock
                      size={15}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2"
                      style={{ color: 'rgba(255,255,255,0.25)' }}
                    />
                    <input
                      type={showPass ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter password"
                      autoComplete="current-password"
                      className="w-full pl-10 pr-12 py-3 rounded-xl text-sm transition-all"
                      style={{
                        backgroundColor: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: '#fff',
                        outline: 'none',
                      }}
                      onFocus={(e) => (e.target.style.borderColor = `${selected?.color}70`)}
                      onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
                    />
                    <button
                      type="button"
                      className="absolute right-3.5 top-1/2 -translate-y-1/2"
                      style={{ color: 'rgba(255,255,255,0.3)' }}
                      onClick={() => setShowPass(!showPass)}
                    >
                      {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl transition-all"
                  style={{
                    background: isLoading
                      ? `${selected?.color}60`
                      : `linear-gradient(135deg, ${selected?.color}, ${selected?.color}cc)`,
                    color: '#fff',
                    fontFamily: 'Oswald, sans-serif',
                    letterSpacing: '0.1em',
                    fontSize: '0.85rem',
                    boxShadow: isLoading ? 'none' : `0 4px 24px ${selected?.color}40`,
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                  }}
                >
                  {isLoading ? (
                    <>
                      <span
                        className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                        style={{ animation: 'spin 0.7s linear infinite', display: 'inline-block' }}
                      />
                      AUTHENTICATING...
                    </>
                  ) : (
                    <>SIGN IN <ArrowRight size={15} /></>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => { setSelectedId(null); setError(''); }}
                  className="w-full mt-4 flex items-center justify-center gap-1.5 py-2.5 text-sm transition-colors"
                  style={{ color: 'rgba(255,255,255,0.3)' }}
                  onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.6)'}
                  onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.3)'}
                >
                  <ChevronLeft size={14} /> Choose different dashboard
                </button>
              </form>
            </div>

            <p className="text-center mt-5 text-sm" style={{ color: 'rgba(255,255,255,0.22)' }}>
              Not registered?{' '}
              <button
                onClick={() => {
                  if (selectedId === 'agent' || selectedId === 'manager') navigate('/register/agent');
                  else if (selectedId === 'cooperative') navigate('/register/cooperative');
                  else if (selectedId === 'internship') navigate('/register/internship');
                  else navigate('/register/member');
                }}
                className="transition-colors"
                style={{ color: selected?.color || '#3b82f6' }}
                onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.opacity = '0.75'}
                onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.opacity = '1'}
              >
                {(selectedId === 'agent' || selectedId === 'manager') ? 'Apply as Polling Agent'
                  : selectedId === 'cooperative' ? 'Apply as Cooperative'
                  : selectedId === 'internship' ? 'Apply for Internship'
                  : 'Apply for membership'}
              </button>
            </p>
          </div>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
