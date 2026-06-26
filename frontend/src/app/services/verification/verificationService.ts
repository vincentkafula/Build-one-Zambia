import { db } from '../db/indexedDbService';
import { auditService } from '../audit/auditService';
import { eventBus } from '../realtime/eventBus';
import { ElectionType } from '../results/resultsService';

export type VerificationLevel = 'polling_station' | 'ward' | 'constituency' | 'district' | 'province' | 'national';
export type VerificationStatus = 'pending' | 'signed' | 'rejected' | 'under_review';

export interface ReturningOfficer {
  officerId: string;
  name: string;
  eczId: string;
  role: string;
  phone?: string;
}

export interface VerificationRecord {
  id: string;
  levelType: VerificationLevel;
  levelId: string;
  levelName: string;
  electionType: ElectionType;
  status: VerificationStatus;
  officerId: string;
  officer: ReturningOfficer;
  agentTotalVotes: number;
  officialTotalVotes: number;
  discrepancy: number;
  discrepancyPercent: number;
  autoCalculationMatch: boolean;
  documentUrls: string[];
  signatureData?: string; // base64 signature image or digital signature ID
  signedAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

function generateId(): string {
  return `ver-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

class VerificationService {
  async create(
    data: Omit<VerificationRecord, 'id' | 'createdAt' | 'updatedAt' | 'status'>,
    userId: string
  ): Promise<VerificationRecord> {
    const now = new Date().toISOString();
    const discrepancy = Math.abs(data.agentTotalVotes - data.officialTotalVotes);
    const record: VerificationRecord = {
      ...data,
      id: generateId(),
      status: 'pending',
      discrepancy,
      discrepancyPercent: data.agentTotalVotes > 0
        ? Math.round((discrepancy / data.agentTotalVotes) * 1000) / 10
        : 0,
      autoCalculationMatch: discrepancy === 0,
      createdAt: now,
      updatedAt: now,
    };
    await db.put('verifications', record);
    await auditService.log('VERIFICATION_CREATED', 'verification', record.id, {
      level: data.levelType,
      levelName: data.levelName,
      electionType: data.electionType,
    }, userId);
    return record;
  }

  async sign(
    id: string,
    signatureData: string,
    documentUrls: string[],
    notes: string,
    officerId: string
  ): Promise<VerificationRecord | undefined> {
    const existing = await db.get<VerificationRecord>('verifications', id);
    if (!existing) return undefined;

    const now = new Date().toISOString();
    const updated: VerificationRecord = {
      ...existing,
      status: 'signed',
      signatureData,
      documentUrls: [...existing.documentUrls, ...documentUrls],
      notes,
      signedAt: now,
      updatedAt: now,
    };
    await db.put('verifications', updated);
    await auditService.log('VERIFICATION_SIGNED', 'verification', id, {
      level: existing.levelType,
      levelName: existing.levelName,
    }, officerId);
    eventBus.emit('verification_signed', { verification: updated });

    if (updated.discrepancy > 0) {
      eventBus.emit('discrepancy_detected', {
        verificationId: id,
        levelName: existing.levelName,
        discrepancy: updated.discrepancy,
        discrepancyPercent: updated.discrepancyPercent,
      });
    }

    return updated;
  }

  async reject(id: string, reason: string, officerId: string): Promise<VerificationRecord | undefined> {
    const existing = await db.get<VerificationRecord>('verifications', id);
    if (!existing) return undefined;

    const now = new Date().toISOString();
    const updated: VerificationRecord = {
      ...existing,
      status: 'rejected',
      rejectionReason: reason,
      rejectedAt: now,
      updatedAt: now,
    };
    await db.put('verifications', updated);
    await auditService.log('VERIFICATION_REJECTED', 'verification', id, { reason }, officerId);
    return updated;
  }

  async getById(id: string): Promise<VerificationRecord | undefined> {
    return db.get<VerificationRecord>('verifications', id);
  }

  async getByLevel(levelType: VerificationLevel, levelId: string, electionType?: ElectionType): Promise<VerificationRecord[]> {
    const byLevel = await db.getByIndex<VerificationRecord>('verifications', 'by_levelId', levelId);
    return byLevel.filter(
      (v) => v.levelType === levelType && (!electionType || v.electionType === electionType)
    );
  }

  async getAll(): Promise<VerificationRecord[]> {
    return db.getAll<VerificationRecord>('verifications');
  }

  async getPending(): Promise<VerificationRecord[]> {
    return db.getByIndex<VerificationRecord>('verifications', 'by_status', 'pending');
  }

  async getStats(): Promise<{
    total: number;
    byStatus: Record<VerificationStatus, number>;
    withDiscrepancies: number;
    completionRate: number;
  }> {
    const all = await db.getAll<VerificationRecord>('verifications');
    const byStatus: Record<VerificationStatus, number> = {
      pending: 0, signed: 0, rejected: 0, under_review: 0,
    };
    let withDiscrepancies = 0;
    for (const v of all) {
      byStatus[v.status] = (byStatus[v.status] ?? 0) + 1;
      if (v.discrepancy > 0) withDiscrepancies++;
    }
    const completionRate = all.length > 0
      ? Math.round(((byStatus.signed) / all.length) * 100) : 0;

    return { total: all.length, byStatus, withDiscrepancies, completionRate };
  }
}

export const verificationService = new VerificationService();
