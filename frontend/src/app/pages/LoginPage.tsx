import { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { checkLoginRateLimit, recordLoginAttempt } from '../lib/production';
import { Shield, Eye, EyeOff, Lock, User, AlertCircle, ChevronRight, Timer } from 'lucide-react';


export default function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [lockoutMs, setLockoutMs] = useState(0);

  // ALL hooks must come before any conditional returns
  // Countdown timer for lockout
  useEffect(() => {
    if (lockoutMs <= 0) return;
    const t = setInterval(() => setLockoutMs((ms) => Math.max(0, ms - 1000)), 1000);
    return () => clearInterval(t);
  }, [lockoutMs]);

  // Use <Navigate> component instead of navigate() during render to avoid setState-during-render
  if (isAuthenticated) {
    return <Navigate to="/admin" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) { setError('Enter username and password'); return; }

    // Client-side rate limiting
    const rateCheck = checkLoginRateLimit();
    if (!rateCheck.allowed) {
      setLockoutMs(rateCheck.waitMs);
      setError(`Too many failed attempts. Try again in ${Math.ceil(rateCheck.waitMs / 60000)} min.`);
      return;
    }

    setLoading(true);
    setError('');
    const result = await login(username, password);
    setLoading(false);
    recordLoginAttempt(result.success);

    if (result.success) {
      navigate('/admin');
    } else {
      const newCheck = checkLoginRateLimit();
      const remaining = newCheck.attemptsLeft;
      setError(`${result.error ?? 'Login failed'}${remaining > 0 ? ` (${remaining} attempt${remaining !== 1 ? 's' : ''} left)` : ''}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-green-900 via-green-800 to-emerald-900 p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full border border-white/20"
              style={{
                width: `${80 + i * 40}px`, height: `${80 + i * 40}px`,
                top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%`,
                transform: 'translate(-50%, -50%)',
              }}
            />
          ))}
        </div>

        <div className="relative">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <div>
              <div className="text-white font-bold text-xl">Build One Zambia</div>
              <div className="text-green-200 text-sm">Election Results Portal 2026</div>
            </div>
          </div>
          <h1 className="text-white text-4xl font-bold leading-tight mb-4">
            Secure Election<br />Results Backend
          </h1>
          <p className="text-green-100 text-lg leading-relaxed">
            Real-time, station-by-station election results with multi-level verification,
            ECZ figure comparison, and comprehensive audit trails.
          </p>
        </div>

        <div className="relative space-y-4">
          {[
            { label: 'Polling Stations', value: '13,529', color: 'bg-green-400' },
            { label: 'Registered Voters', value: '8,786,300', color: 'bg-emerald-400' },
            { label: 'Verification Levels', value: '6 Levels', color: 'bg-teal-400' },
          ].map((stat) => (
            <div key={stat.label} className="flex items-center gap-4">
              <div className={`w-2 h-2 rounded-full ${stat.color}`} />
              <span className="text-green-100">{stat.label}</span>
              <span className="text-white font-semibold ml-auto">{stat.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-green-600/20 border border-green-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-green-400" />
            </div>
            <h2 className="text-white text-2xl font-bold">Backend Access</h2>
            <p className="text-gray-400 mt-1">Sign in to your account</p>
          </div>

          {/* Login form */}
          <form onSubmit={handleSubmit} className="space-y-4 mb-6">
            {error && (
              <div className="flex items-center gap-2 bg-red-900/30 border border-red-700/50 rounded-lg px-4 py-3">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span className="text-red-300 text-sm">{error}</span>
              </div>
            )}

            <div>
              <label className="block text-gray-300 text-sm font-medium mb-1">Username</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition"
                  placeholder="Enter username"
                  autoComplete="username"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-300 text-sm font-medium mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-12 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition"
                  placeholder="Enter password"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || lockoutMs > 0}
              className="w-full bg-green-600 hover:bg-green-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : lockoutMs > 0 ? (
                <><Timer className="w-4 h-4" /> Locked — {Math.ceil(lockoutMs / 1000)}s</>
              ) : (
                <>Sign In <ChevronRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}
