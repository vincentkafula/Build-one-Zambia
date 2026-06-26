import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { authService, Session } from '../services/auth/authService';
import { UserRole, hasPermission, Permission } from '../services/auth/rbac';
import { realtimeService } from '../services/realtime/realtimeService';
import { syncService } from '../services/sync/syncService';
import { requestBackgroundSync } from '../lib/serviceWorker';

interface AuthContextValue {
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  can: (permission: Permission) => boolean;
  role: UserRole | null;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function init() {
      await authService.init();
      const s = authService.getSession();
      setSession(s);
      if (s) {
        realtimeService.init(s.userId);
        const syncMs = Number(import.meta.env.VITE_SYNC_INTERVAL_MS) || 30000;
        syncService.startAutoSync(s.userId, syncMs);
        // Wire SW background-sync trigger to the app sync service
        window.addEventListener('sw-sync-trigger', () => syncService.process(s.userId));
      }
      setIsLoading(false);
    }
    init();
    return () => {
      syncService.stopAutoSync();
      realtimeService.destroy();
    };
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    const result = await authService.login(username, password);
    if (result.success && result.session) {
      setSession(result.session);
      realtimeService.init(result.session.userId);
      const syncMs = Number(import.meta.env.VITE_SYNC_INTERVAL_MS) || 30000;
      syncService.startAutoSync(result.session.userId, syncMs);
      requestBackgroundSync();
    }
    return { success: result.success, error: result.error };
  }, []);

  const logout = useCallback(async () => {
    syncService.stopAutoSync();
    realtimeService.destroy();
    await authService.logout();
    setSession(null);
  }, []);

  const can = useCallback(
    (permission: Permission): boolean => {
      if (!session) return false;
      return hasPermission(session.role, permission);
    },
    [session]
  );

  return (
    <AuthContext.Provider
      value={{
        session,
        isAuthenticated: !!session,
        isLoading,
        login,
        logout,
        can,
        role: session?.role ?? null,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
