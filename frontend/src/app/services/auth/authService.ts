import { db } from '../db/indexedDbService';
import { UserRole, UserScope } from './rbac';
import { auditService } from '../audit/auditService';

export interface User {
  id: string;
  username: string;
  passwordHash: string; // SHA-256 hex
  name: string;
  role: UserRole;
  scope: UserScope;
  province?: string;
  district?: string;
  constituency?: string;
  ward?: string;
  pollingStation?: string;
  email?: string;
  phone?: string;
  nrcId?: string; // National Registration Card
  eczId?: string;
  active: boolean;
  lastLogin?: string;
  createdAt: string;
  createdBy?: string;
}

export interface Session {
  token: string;
  userId: string;
  role: UserRole;
  scope: UserScope;
  name: string;
  username: string;
  createdAt: string;
  expiresAt: string;
  ipAddress?: string;
}

export interface LoginResult {
  success: boolean;
  session?: Session;
  error?: string;
}

// Simple hash — browser-compatible, not for production cryptography
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + 'zambia_election_2026_salt');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

function generateToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (b) => b.toString(16).padStart(2, '0')).join('');
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

const SESSION_DURATION_MS = 8 * 60 * 60 * 1000; // 8 hours
const SESSION_KEY = 'election_session_token';

class AuthService {
  private currentSession: Session | null = null;
  private initialized = false;

  async init(): Promise<void> {
    if (this.initialized) return;
    this.initialized = true;
    await this.seedDefaultUsers();
    await this.restoreSession();
  }

  private async seedDefaultUsers(): Promise<void> {
    // Clear all existing users and enforce the single authorised account
    const existing = await db.getAll<User>('users');
    for (const u of existing) {
      await db.delete('users', u.id);
    }

    const user: User = {
      id: 'usr-001',
      username: 'Bozplans',
      passwordHash: await hashPassword('Wakuca55'),
      name: 'BOZ Administrator',
      role: 'SUPER_ADMIN',
      scope: { level: 'national', ids: [] },
      active: true,
      createdAt: new Date().toISOString(),
    };
    await db.put('users', user);
  }

  private async restoreSession(): Promise<void> {
    const token = localStorage.getItem(SESSION_KEY);
    if (!token) return;
    const session = await db.get<Session>('sessions', token);
    if (!session) return;
    if (new Date(session.expiresAt) < new Date()) {
      localStorage.removeItem(SESSION_KEY);
      return;
    }
    this.currentSession = session;
  }

  async login(username: string, password: string): Promise<LoginResult> {
    const users = await db.getByIndex<User>('users', 'by_username', username);
    const user = users[0];
    if (!user || !user.active) {
      return { success: false, error: 'Invalid username or password' };
    }

    const hash = await hashPassword(password);
    if (hash !== user.passwordHash) {
      await auditService.log('LOGIN_FAILED', 'user', user.id, { username });
      return { success: false, error: 'Invalid username or password' };
    }

    const now = new Date();
    const token = generateToken();
    const session: Session = {
      token,
      userId: user.id,
      role: user.role,
      scope: user.scope,
      name: user.name,
      username: user.username,
      createdAt: now.toISOString(),
      expiresAt: new Date(now.getTime() + SESSION_DURATION_MS).toISOString(),
    };

    await db.put('sessions', session);
    localStorage.setItem(SESSION_KEY, token);

    // Update last login
    await db.put('users', { ...user, lastLogin: now.toISOString() });

    this.currentSession = session;
    await auditService.log('LOGIN_SUCCESS', 'user', user.id, { username, role: user.role });

    return { success: true, session };
  }

  async logout(): Promise<void> {
    if (this.currentSession) {
      await auditService.log('LOGOUT', 'user', this.currentSession.userId, {});
      await db.delete('sessions', this.currentSession.token);
      localStorage.removeItem(SESSION_KEY);
      this.currentSession = null;
    }
  }

  getSession(): Session | null {
    return this.currentSession;
  }

  isAuthenticated(): boolean {
    return this.currentSession !== null;
  }

  // Create a new user (admin only)
  async createUser(data: Omit<User, 'id' | 'passwordHash' | 'createdAt'> & { password: string }, createdBy: string): Promise<User> {
    const { password, ...userData } = data;
    const user: User = {
      ...userData,
      id: generateId(),
      passwordHash: await hashPassword(password),
      createdAt: new Date().toISOString(),
      createdBy,
    };
    await db.put('users', user);
    await auditService.log('USER_CREATED', 'user', user.id, { username: user.username, role: user.role }, createdBy);
    return user;
  }

  async updateUser(id: string, updates: Partial<User>, updatedBy: string): Promise<User | undefined> {
    const existing = await db.get<User>('users', id);
    if (!existing) return undefined;
    const updated = { ...existing, ...updates };
    await db.put('users', updated);
    await auditService.log('USER_UPDATED', 'user', id, { changes: Object.keys(updates) }, updatedBy);
    return updated;
  }

  async changePassword(userId: string, newPassword: string, changedBy: string): Promise<boolean> {
    const user = await db.get<User>('users', userId);
    if (!user) return false;
    const updated = { ...user, passwordHash: await hashPassword(newPassword) };
    await db.put('users', updated);
    await auditService.log('PASSWORD_CHANGED', 'user', userId, {}, changedBy);
    return true;
  }

  async getAllUsers(): Promise<User[]> {
    return db.getAll<User>('users');
  }

  async getUserById(id: string): Promise<User | undefined> {
    return db.get<User>('users', id);
  }

  async getActiveSessions(): Promise<Session[]> {
    const all = await db.getAll<Session>('sessions');
    const now = new Date();
    return all.filter((s) => new Date(s.expiresAt) > now);
  }

  async revokeSession(token: string, revokedBy: string): Promise<void> {
    await db.delete('sessions', token);
    await auditService.log('SESSION_REVOKED', 'session', token, {}, revokedBy);
  }
}

export const authService = new AuthService();
