/**
 * BUILD ONE ZAMBIA — BOZ Portal Login
 *
 * A single, unified sign-in for every dashboard type: Member, Election
 * (polling agents through provincial/national managers), Management
 * (admin/super_admin), Cooperative, Internship, and Chamber of Commerce.
 *
 * There is no "pick your dashboard first" step. The person just signs in
 * with their email/username and password, and the backend's response — the role
 * assigned to their account when it was approved — tells this page which
 * dashboard to send them to. Nobody needs to know or choose their own
 * role; it's detected automatically from their credentials.
 */

import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router';
import { Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, Users, BarChart3, Loader2, AlertCircle } from 'lucide-react';
import { authApi, setToken } from '../lib/api';

const GREEN = '#007A30';
const GREEN_DARK = '#065A22';
// Sampled directly from the reference design's right panel — a vivid,
// saturated orange, not a darkened/browned-down version of it.
const ORANGE = '#EC6D01';
const ORANGE_DARK = '#D46200';

// Where each backend role lands. Every dashboard-facing role in the system
// must resolve to something here — if a role isn't listed, the person sees
// a clear "contact an administrator" message instead of a silent failure.
function routeForRole(role: string): string | null {
  const ELECTION_ROLES = [
    'polling_agent', 'agent', 'election_agent',
    'ward_manager', 'constituency_manager', 'district_manager',
    'provincial_manager', 'province_manager', 'national_manager',
  ];
  const MANAGEMENT_ROLES = ['super_admin', 'admin', 'manager'];

  if (role === 'member') return '/dashboard/member';
  if (role === 'cooperative') return '/dashboard/cooperative';
  if (role === 'internship') return '/dashboard/internship';
  if (role === 'chamber') return '/dashboard/chamber';
  if (role === 'intl_party') return '/dashboard/intl-party';
  if (ELECTION_ROLES.includes(role)) return '/dashboard/election';
  if (MANAGEMENT_ROLES.includes(role)) return '/dashboard/manager';
  return null;
}

const REMEMBERED_EMAIL_KEY = 'boz_remembered_email';

const FEATURES = [
  { icon: ShieldCheck, title: 'Secure & Trusted', text: 'Enterprise-grade security protects your data and privacy.' },
  { icon: Users, title: 'Role-Based Access', text: 'Your account automatically opens the right dashboard for your role.' },
  { icon: BarChart3, title: 'All in One Platform', text: 'Membership, elections, cooperatives, and more in one secure place.' },
];

export default function DashboardLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem(REMEMBERED_EMAIL_KEY);
    if (saved) {
      setEmail(saved);
      setRemember(true);
    }
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password) {
      setError('Please enter your email/username and password.');
      return;
    }
    setLoading(true);
    try {
      const res = await authApi.login(email.trim(), password);
      const user = res.user as unknown as { role: string; active?: boolean };

      if (user.active === false) {
        setError('Your account is pending approval. You\u2019ll be able to sign in once an administrator approves your application.');
        setLoading(false);
        return;
      }

      const destination = routeForRole(user.role);
      if (!destination) {
        setError(`Your account role ("${user.role}") isn\u2019t linked to a dashboard yet. Please contact an administrator.`);
        setLoading(false);
        return;
      }

      setToken(res.token);
      sessionStorage.setItem('boz_session_token', res.token);
      sessionStorage.setItem('boz_election_user', JSON.stringify(res.user));

      if (remember) localStorage.setItem(REMEMBERED_EMAIL_KEY, email.trim());
      else localStorage.removeItem(REMEMBERED_EMAIL_KEY);

      navigate(destination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid email or password.');
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: `linear-gradient(160deg, ${ORANGE} 0%, ${ORANGE_DARK} 100%)` }}>
      <div
        className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 overflow-hidden"
        style={{ borderRadius: '24px', boxShadow: '0 30px 80px -20px rgba(0,0,0,0.6)', minHeight: '640px' }}
      >
        {/* Left — brand panel */}
        <div className="relative hidden lg:flex flex-col p-10 overflow-hidden" style={{ background: `linear-gradient(160deg, ${GREEN} 0%, ${GREEN_DARK} 100%)` }}>
          {/* dotted world-map texture */}
          <svg className="absolute inset-0 w-full h-full opacity-[0.12] pointer-events-none" preserveAspectRatio="xMidYMid slice">
            <pattern id="dots" width="14" height="14" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1.4" fill="#ffffff" />
            </pattern>
            <rect width="100%" height="100%" fill="url(#dots)" />
          </svg>

          <div className="relative z-10 flex flex-col h-full">
            <div className="flex flex-col items-center text-center mb-8">
              <img src="/logo-boz.png" alt="Build One Zambia" className="w-24 h-24 object-contain mb-6" style={{ filter: 'drop-shadow(0 8px 20px rgba(0,0,0,0.35))' }} />
              <h1 style={{ fontFamily: 'Oswald, sans-serif', fontSize: '2.2rem', letterSpacing: '0.02em', color: '#ffffff' }}>
                BOZ <span style={{ color: '#0a1f12' }}>PORTAL</span>
              </h1>
              <p className="text-sm mt-2 max-w-xs" style={{ color: 'rgba(255,255,255,0.85)' }}>
                Your gateway to membership, elections, cooperative data &amp; more.
              </p>
            </div>

            <div className="h-px w-full mb-8" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }} />

            <div className="flex flex-col gap-6">
              {FEATURES.map(f => (
                <div key={f.title} className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'rgba(255,255,255,0.14)' }}>
                    <f.icon className="w-5 h-5" style={{ color: '#ffffff' }} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold mb-0.5" style={{ color: '#ffffff' }}>{f.title}</p>
                    <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.75)' }}>{f.text}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-auto pt-8 flex justify-center opacity-70">
              <svg viewBox="0 0 260 100" className="w-56" fill="none" stroke="#ffffff" strokeWidth="1.2">
                <rect x="30" y="30" width="80" height="60" />
                <rect x="115" y="15" width="55" height="75" />
                <rect x="175" y="40" width="60" height="50" />
                <line x1="30" y1="90" x2="235" y2="90" />
                {[42, 62, 82].map(x => <rect key={x} x={x} y="45" width="10" height="12" />)}
                {[130, 148].map(x => <rect key={x} x={x} y="30" width="9" height="11" />)}
                {[187, 203, 219].map(x => <rect key={x} x={x} y="55" width="9" height="11" />)}
              </svg>
            </div>
          </div>
        </div>

        {/* Right — login form */}
        <div className="flex flex-col justify-center px-6 py-12 sm:px-14" style={{ background: `linear-gradient(200deg, ${ORANGE} 0%, ${ORANGE_DARK} 100%)` }}>
          <div className="w-full max-w-sm mx-auto">
            <div className="flex flex-col items-center text-center mb-8">
              <div className="w-14 h-14 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: 'rgba(0,0,0,0.2)' }}>
                <Lock className="w-6 h-6" style={{ color: '#fff' }} />
              </div>
              <h2 style={{ fontFamily: 'Oswald, sans-serif', fontSize: '1.5rem', color: '#fff' }}>Welcome Back</h2>
              <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.85)' }}>Sign in to access your dashboard</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'rgba(255,255,255,0.92)' }}>Email or Username</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'rgba(255,255,255,0.75)' }} />
                  <input
                    type="text"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="youremail@example.com or username"
                    autoComplete="username"
                    className="w-full pl-10 pr-4 py-3 rounded-lg text-sm"
                    style={{ backgroundColor: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.35)', color: '#fff', outline: 'none' }}
                    onFocus={e => { e.currentTarget.style.borderColor = '#ffffff'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(255,255,255,0.25)'; }}
                    onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.35)'; e.currentTarget.style.boxShadow = 'none'; }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'rgba(255,255,255,0.92)' }}>Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'rgba(255,255,255,0.75)' }} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    className="w-full pl-10 pr-11 py-3 rounded-lg text-sm"
                    style={{ backgroundColor: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.35)', color: '#fff', outline: 'none' }}
                    onFocus={e => { e.currentTarget.style.borderColor = '#ffffff'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(255,255,255,0.25)'; }}
                    onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.35)'; e.currentTarget.style.boxShadow = 'none'; }}
                  />
                  <button type="button" onClick={() => setShowPassword(s => !s)} className="absolute right-3.5 top-1/2 -translate-y-1/2" style={{ color: 'rgba(255,255,255,0.75)' }}>
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-2" style={{ color: 'rgba(255,255,255,0.85)' }}>
                  <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} style={{ accentColor: GREEN }} />
                  Remember me
                </label>
                <Link to="/contact" className="hover:underline" style={{ color: '#ffffff' }}>Forgot password?</Link>
              </div>

              {error && (
                <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg text-xs" style={{ backgroundColor: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.3)', color: '#f87171' }}>
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-lg font-semibold text-sm disabled:opacity-60"
                style={{ background: `linear-gradient(135deg, ${GREEN} 0%, ${GREEN_DARK} 100%)`, color: '#fff' }}
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Sign In <ArrowRight className="w-4 h-4" /></>}
              </button>
            </form>

            <div className="mt-8 text-center text-xs" style={{ color: 'rgba(255,255,255,0.8)' }}>
              New to Build One Zambia?{' '}
              <Link to="/home/opportunities#registration-options" className="font-medium hover:underline" style={{ color: '#ffffff' }}>Register here</Link>
            </div>
            <div className="mt-2 text-center text-xs" style={{ color: 'rgba(255,255,255,0.8)' }}>
              Trouble signing in?{' '}
              <Link to="/contact" className="font-medium hover:underline" style={{ color: '#ffffff' }}>Contact Administrator</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
