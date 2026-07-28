import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { authApi, getStoredUser, getToken, setSession, clearSession, LoginResult } from './api';

interface AuthContextValue {
  user: LoginResult['user'] | null;
  loading: boolean;
  error: string;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<LoginResult['user'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      const token = await getToken();
      const stored = await getStoredUser();
      if (token && stored) setUser(stored as LoginResult['user']);
      setLoading(false);
    })();
  }, []);

  const login = async (username: string, password: string) => {
    setError('');
    try {
      const res = await authApi.login(username, password);
      if (res.user.active === false) {
        setError('Your account is pending approval. You\u2019ll be able to sign in once an administrator approves it.');
        return false;
      }
      await setSession(res.token, res.user);
      setUser(res.user);
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid username or password.');
      return false;
    }
  };

  const logout = async () => {
    await clearSession();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

// Mirrors DashboardLogin.tsx's routeForRole() on the web — same role
// families, just mapped to a mobile tab/screen label instead of a URL.
export function dashboardLabelForRole(role: string): string {
  const ELECTION_ROLES = [
    'polling_agent', 'agent', 'election_agent',
    'ward_manager', 'constituency_manager', 'district_manager',
    'provincial_manager', 'province_manager', 'national_manager',
  ];
  const MANAGEMENT_ROLES = ['super_admin', 'admin', 'manager'];
  if (role === 'member') return 'Member Dashboard';
  if (role === 'cooperative') return 'Cooperative Dashboard';
  if (role === 'internship') return 'Internship Dashboard';
  if (role === 'chamber') return 'Chamber of Commerce Dashboard';
  if (role === 'intl_party') return 'International Party Dashboard';
  if (ELECTION_ROLES.includes(role)) return 'Election Dashboard';
  if (MANAGEMENT_ROLES.includes(role)) return 'Management Dashboard';
  return 'Dashboard';
}
