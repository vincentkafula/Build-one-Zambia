// Unified API client — facade over all backend services with interceptors and error handling

import { authService } from '../auth/authService';
import { resultsService, PollingStationResult, ElectionType, ResultsFilter } from '../results/resultsService';
import { aggregationService, NationalSummary, TurnoutByProvince } from '../results/aggregationService';
import { verificationService, VerificationRecord, VerificationLevel } from '../verification/verificationService';
import { auditService, AuditEntry } from '../audit/auditService';
import { syncService, SyncStats } from '../sync/syncService';
import { realtimeService, Notification } from '../realtime/realtimeService';
import { exportService } from '../export/exportService';
import { User } from '../auth/authService';
import { hasPermission, Permission } from '../auth/rbac';

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  timestamp: string;
}

function ok<T>(data: T): ApiResponse<T> {
  return { data, error: null, timestamp: new Date().toISOString() };
}

function err<T>(error: string): ApiResponse<T> {
  return { data: null, error, timestamp: new Date().toISOString() };
}

function requirePermission(permission: Permission): void {
  const session = authService.getSession();
  if (!session) throw new Error('Unauthorized: not logged in');
  if (!hasPermission(session.role, permission)) {
    throw new Error(`Forbidden: requires ${permission}`);
  }
}

class ApiClient {
  // ── AUTH ──────────────────────────────────────────────────────────────
  readonly auth = {
    login: (username: string, password: string) => authService.login(username, password),
    logout: () => authService.logout(),
    getSession: () => authService.getSession(),
    isAuthenticated: () => authService.isAuthenticated(),
    createUser: async (data: Parameters<typeof authService.createUser>[0]): Promise<ApiResponse<User>> => {
      try {
        requirePermission('users:write');
        const user = await authService.createUser(data, authService.getSession()!.userId);
        return ok(user);
      } catch (e) { return err(e instanceof Error ? e.message : 'Error'); }
    },
    getAllUsers: async (): Promise<ApiResponse<User[]>> => {
      try {
        requirePermission('users:read');
        return ok(await authService.getAllUsers());
      } catch (e) { return err(e instanceof Error ? e.message : 'Error'); }
    },
    getActiveSessions: async () => {
      try {
        requirePermission('admin:full');
        return ok(await authService.getActiveSessions());
      } catch (e) { return err(e instanceof Error ? e.message : 'Error'); }
    },
  };

  // ── RESULTS ───────────────────────────────────────────────────────────
  readonly results = {
    submit: async (data: Parameters<typeof resultsService.submit>[0]): Promise<ApiResponse<PollingStationResult>> => {
      try {
        requirePermission('results:write');
        const result = await resultsService.submit(data, authService.getSession()!.userId);
        await syncService.enqueue('CREATE', 'result', result.id, result, 3);
        return ok(result);
      } catch (e) { return err(e instanceof Error ? e.message : 'Error'); }
    },
    update: async (id: string, updates: Partial<PollingStationResult>): Promise<ApiResponse<PollingStationResult | undefined>> => {
      try {
        requirePermission('results:write');
        const result = await resultsService.update(id, updates, authService.getSession()!.userId);
        if (result) await syncService.enqueue('UPDATE', 'result', id, updates, 3);
        return ok(result);
      } catch (e) { return err(e instanceof Error ? e.message : 'Error'); }
    },
    approve: async (id: string): Promise<ApiResponse<PollingStationResult | undefined>> => {
      try {
        requirePermission('results:approve');
        return ok(await resultsService.approve(id, authService.getSession()!.userId));
      } catch (e) { return err(e instanceof Error ? e.message : 'Error'); }
    },
    getAll: async (): Promise<ApiResponse<PollingStationResult[]>> => {
      try {
        requirePermission('results:read');
        return ok(await resultsService.getAll());
      } catch (e) { return err(e instanceof Error ? e.message : 'Error'); }
    },
    getFiltered: async (filter: ResultsFilter): Promise<ApiResponse<PollingStationResult[]>> => {
      try {
        requirePermission('results:read');
        return ok(await resultsService.getFiltered(filter));
      } catch (e) { return err(e instanceof Error ? e.message : 'Error'); }
    },
    getStats: async () => {
      try {
        requirePermission('results:read');
        return ok(await resultsService.getStats());
      } catch (e) { return err(e instanceof Error ? e.message : 'Error'); }
    },
  };

  // ── AGGREGATION ───────────────────────────────────────────────────────
  readonly aggregation = {
    getNationalSummary: async (electionType: ElectionType): Promise<ApiResponse<NationalSummary>> => {
      try {
        requirePermission('results:read');
        return ok(await aggregationService.getNationalSummary(electionType));
      } catch (e) { return err(e instanceof Error ? e.message : 'Error'); }
    },
    getProvinceSummaries: async (electionType: ElectionType) => {
      try {
        requirePermission('results:read');
        return ok(await aggregationService.getProvinceSummaries(electionType));
      } catch (e) { return err(e instanceof Error ? e.message : 'Error'); }
    },
    getTurnoutByProvince: async (): Promise<ApiResponse<TurnoutByProvince[]>> => {
      try {
        requirePermission('results:read');
        return ok(await aggregationService.getTurnoutByProvince());
      } catch (e) { return err(e instanceof Error ? e.message : 'Error'); }
    },
  };

  // ── VERIFICATIONS ─────────────────────────────────────────────────────
  readonly verifications = {
    create: async (data: Parameters<typeof verificationService.create>[0]): Promise<ApiResponse<VerificationRecord>> => {
      try {
        requirePermission('verification:write');
        const record = await verificationService.create(data, authService.getSession()!.userId);
        return ok(record);
      } catch (e) { return err(e instanceof Error ? e.message : 'Error'); }
    },
    sign: async (id: string, signature: string, docs: string[], notes: string): Promise<ApiResponse<VerificationRecord | undefined>> => {
      try {
        requirePermission('verification:write');
        return ok(await verificationService.sign(id, signature, docs, notes, authService.getSession()!.userId));
      } catch (e) { return err(e instanceof Error ? e.message : 'Error'); }
    },
    getAll: async (): Promise<ApiResponse<VerificationRecord[]>> => {
      try {
        requirePermission('verification:read');
        return ok(await verificationService.getAll());
      } catch (e) { return err(e instanceof Error ? e.message : 'Error'); }
    },
    getPending: async (): Promise<ApiResponse<VerificationRecord[]>> => {
      try {
        requirePermission('verification:read');
        return ok(await verificationService.getPending());
      } catch (e) { return err(e instanceof Error ? e.message : 'Error'); }
    },
    getByLevel: async (level: VerificationLevel, levelId: string, electionType?: ElectionType) => {
      try {
        requirePermission('verification:read');
        return ok(await verificationService.getByLevel(level, levelId, electionType));
      } catch (e) { return err(e instanceof Error ? e.message : 'Error'); }
    },
    getStats: async () => {
      try {
        requirePermission('verification:read');
        return ok(await verificationService.getStats());
      } catch (e) { return err(e instanceof Error ? e.message : 'Error'); }
    },
  };

  // ── AUDIT ─────────────────────────────────────────────────────────────
  readonly audit = {
    getAll: async (limit?: number): Promise<ApiResponse<AuditEntry[]>> => {
      try {
        requirePermission('audit:read');
        return ok(await auditService.getAll(limit));
      } catch (e) { return err(e instanceof Error ? e.message : 'Error'); }
    },
    getRecent: async (hours?: number) => {
      try {
        requirePermission('audit:read');
        return ok(await auditService.getRecent(hours));
      } catch (e) { return err(e instanceof Error ? e.message : 'Error'); }
    },
  };

  // ── SYNC ──────────────────────────────────────────────────────────────
  readonly sync = {
    getStats: async (): Promise<ApiResponse<SyncStats>> => {
      try {
        return ok(await syncService.getStats());
      } catch (e) { return err(e instanceof Error ? e.message : 'Error'); }
    },
    process: async () => {
      try {
        const session = authService.getSession();
        if (!session) throw new Error('Not authenticated');
        return ok(await syncService.process(session.userId));
      } catch (e) { return err(e instanceof Error ? e.message : 'Error'); }
    },
    getQueue: async () => {
      try {
        requirePermission('admin:full');
        return ok(await syncService.getQueue());
      } catch (e) { return err(e instanceof Error ? e.message : 'Error'); }
    },
  };

  // ── NOTIFICATIONS ─────────────────────────────────────────────────────
  readonly notifications = {
    getAll: async (): Promise<ApiResponse<Notification[]>> => {
      try {
        const session = authService.getSession();
        if (!session) throw new Error('Not authenticated');
        return ok(await realtimeService.getNotifications(session.userId));
      } catch (e) { return err(e instanceof Error ? e.message : 'Error'); }
    },
    getUnreadCount: async (): Promise<ApiResponse<number>> => {
      try {
        const session = authService.getSession();
        if (!session) return ok(0);
        return ok(await realtimeService.getUnreadCount(session.userId));
      } catch (e) { return err(e instanceof Error ? e.message : 'Error'); }
    },
    markRead: async (id: string) => {
      try {
        await realtimeService.markRead(id);
        return ok(true);
      } catch (e) { return err(e instanceof Error ? e.message : 'Error'); }
    },
    markAllRead: async () => {
      try {
        const session = authService.getSession();
        if (!session) throw new Error('Not authenticated');
        await realtimeService.markAllRead(session.userId);
        return ok(true);
      } catch (e) { return err(e instanceof Error ? e.message : 'Error'); }
    },
  };

  // ── EXPORT ────────────────────────────────────────────────────────────
  readonly export = {
    results: async (filter?: ResultsFilter) => {
      try {
        requirePermission('reports:export');
        const { data } = await this.results.getFiltered(filter ?? {});
        if (data) exportService.exportResultsCsv(data);
        return ok(true);
      } catch (e) { return err(e instanceof Error ? e.message : 'Error'); }
    },
    candidateResults: async (filter?: ResultsFilter) => {
      try {
        requirePermission('reports:export');
        const { data } = await this.results.getFiltered(filter ?? {});
        if (data) exportService.exportCandidateResultsCsv(data);
        return ok(true);
      } catch (e) { return err(e instanceof Error ? e.message : 'Error'); }
    },
    verifications: async () => {
      try {
        requirePermission('reports:export');
        const { data } = await this.verifications.getAll();
        if (data) exportService.exportVerificationsCsv(data);
        return ok(true);
      } catch (e) { return err(e instanceof Error ? e.message : 'Error'); }
    },
    auditLog: async () => {
      try {
        requirePermission('audit:read');
        const { data } = await this.audit.getAll();
        if (data) exportService.exportAuditLogCsv(data);
        return ok(true);
      } catch (e) { return err(e instanceof Error ? e.message : 'Error'); }
    },
  };
}

export const api = new ApiClient();
