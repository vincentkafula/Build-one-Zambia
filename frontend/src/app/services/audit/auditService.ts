import { db } from '../db/indexedDbService';

export type AuditAction =
  | 'LOGIN_SUCCESS' | 'LOGIN_FAILED' | 'LOGOUT' | 'SESSION_REVOKED'
  | 'USER_CREATED' | 'USER_UPDATED' | 'PASSWORD_CHANGED'
  | 'RESULT_SUBMITTED' | 'RESULT_UPDATED' | 'RESULT_DELETED' | 'RESULT_APPROVED'
  | 'VERIFICATION_CREATED' | 'VERIFICATION_SIGNED' | 'VERIFICATION_REJECTED'
  | 'ECZ_FIGURES_SUBMITTED' | 'ECZ_FIGURES_UPDATED'
  | 'SYNC_PUSHED' | 'SYNC_PULLED'
  | 'REPORT_EXPORTED';

export interface AuditEntry {
  id: string;
  action: AuditAction;
  entity: string;
  entityId: string;
  userId?: string;
  metadata: Record<string, unknown>;
  timestamp: string;
  ipAddress?: string;
}

function generateId(): string {
  return `audit-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

class AuditService {
  async log(
    action: AuditAction,
    entity: string,
    entityId: string,
    metadata: Record<string, unknown>,
    userId?: string
  ): Promise<void> {
    const entry: AuditEntry = {
      id: generateId(),
      action,
      entity,
      entityId,
      userId,
      metadata,
      timestamp: new Date().toISOString(),
    };
    await db.put('audit_log', entry);
  }

  async getAll(limit = 500): Promise<AuditEntry[]> {
    const all = await db.getAll<AuditEntry>('audit_log');
    return all
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }

  async getByUser(userId: string): Promise<AuditEntry[]> {
    return db.getByIndex<AuditEntry>('audit_log', 'by_userId', userId);
  }

  async getByEntity(entityId: string): Promise<AuditEntry[]> {
    return db.getByIndex<AuditEntry>('audit_log', 'by_entityId', entityId);
  }

  async getByAction(action: AuditAction): Promise<AuditEntry[]> {
    return db.getByIndex<AuditEntry>('audit_log', 'by_action', action);
  }

  async count(): Promise<number> {
    return db.count('audit_log');
  }

  async getRecent(hours = 24): Promise<AuditEntry[]> {
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
    return db.query<AuditEntry>('audit_log', (e) => e.timestamp >= cutoff);
  }

  exportToCsv(entries: AuditEntry[]): string {
    const headers = ['Timestamp', 'Action', 'Entity', 'Entity ID', 'User ID', 'Metadata'];
    const rows = entries.map((e) => [
      e.timestamp,
      e.action,
      e.entity,
      e.entityId,
      e.userId ?? '',
      JSON.stringify(e.metadata),
    ]);
    return [headers, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
  }
}

export const auditService = new AuditService();
