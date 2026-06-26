import { db } from '../db/indexedDbService';
import { auditService } from '../audit/auditService';
import { eventBus } from '../realtime/eventBus';

export type ElectionType = 'presidential' | 'parliamentary' | 'mayoral' | 'councillor';
export type ResultStatus = 'draft' | 'submitted' | 'verified' | 'rejected';

export interface CandidateResult {
  candidateId: string;
  candidateName: string;
  partyName: string;
  partyAbbr: string;
  votes: number;
}

export interface PollingStationResult {
  id: string;
  pollingStationId: string;
  pollingStationName: string;
  wardId: string;
  wardName: string;
  constituencyId: string;
  constituencyName: string;
  districtId: string;
  districtName: string;
  provinceId: string;
  provinceName: string;
  electionType: ElectionType;
  registeredVoters: number;
  totalVotesCast: number;
  validVotes: number;
  rejectedBallots: number;
  candidates: CandidateResult[];
  status: ResultStatus;
  agentId: string;
  agentName: string;
  submittedAt: string;
  updatedAt: string;
  documentUrls: string[]; // uploaded form photos/scans
  notes?: string;
}

export interface ResultsFilter {
  provinceId?: string;
  districtId?: string;
  constituencyId?: string;
  wardId?: string;
  pollingStationId?: string;
  electionType?: ElectionType;
  status?: ResultStatus;
}

export interface AggregatedResult {
  level: 'national' | 'province' | 'district' | 'constituency' | 'ward';
  levelId: string;
  levelName: string;
  electionType: ElectionType;
  registeredVoters: number;
  totalVotesCast: number;
  validVotes: number;
  rejectedBallots: number;
  turnoutPercent: number;
  stationsReported: number;
  stationsTotal: number;
  candidates: (CandidateResult & { percent: number; isLeading: boolean })[];
  lastUpdated: string;
}

function generateId(): string {
  return `res-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

class ResultsService {
  async submit(data: Omit<PollingStationResult, 'id' | 'submittedAt' | 'updatedAt'>, agentUserId: string): Promise<PollingStationResult> {
    const now = new Date().toISOString();
    const result: PollingStationResult = {
      ...data,
      id: generateId(),
      submittedAt: now,
      updatedAt: now,
    };
    await db.put('results', result);
    await auditService.log('RESULT_SUBMITTED', 'result', result.id, {
      pollingStation: data.pollingStationName,
      electionType: data.electionType,
      totalVotes: data.totalVotesCast,
    }, agentUserId);
    eventBus.emit('results_updated', { result });
    return result;
  }

  async update(id: string, updates: Partial<PollingStationResult>, userId: string): Promise<PollingStationResult | undefined> {
    const existing = await db.get<PollingStationResult>('results', id);
    if (!existing) return undefined;
    const updated: PollingStationResult = { ...existing, ...updates, updatedAt: new Date().toISOString() };
    await db.put('results', updated);
    await auditService.log('RESULT_UPDATED', 'result', id, { changes: Object.keys(updates) }, userId);
    eventBus.emit('results_updated', { result: updated });
    return updated;
  }

  async approve(id: string, userId: string): Promise<PollingStationResult | undefined> {
    return this.update(id, { status: 'verified' }, userId);
  }

  async reject(id: string, reason: string, userId: string): Promise<PollingStationResult | undefined> {
    const result = await this.update(id, { status: 'rejected', notes: reason }, userId);
    await auditService.log('RESULT_DELETED', 'result', id, { reason }, userId);
    return result;
  }

  async getById(id: string): Promise<PollingStationResult | undefined> {
    return db.get<PollingStationResult>('results', id);
  }

  async getByPollingStation(stationId: string): Promise<PollingStationResult[]> {
    return db.getByIndex<PollingStationResult>('results', 'by_pollingStation', stationId);
  }

  async getAll(): Promise<PollingStationResult[]> {
    return db.getAll<PollingStationResult>('results');
  }

  async getFiltered(filter: ResultsFilter): Promise<PollingStationResult[]> {
    return db.query<PollingStationResult>('results', (r) => {
      if (filter.provinceId && r.provinceId !== filter.provinceId) return false;
      if (filter.districtId && r.districtId !== filter.districtId) return false;
      if (filter.constituencyId && r.constituencyId !== filter.constituencyId) return false;
      if (filter.wardId && r.wardId !== filter.wardId) return false;
      if (filter.pollingStationId && r.pollingStationId !== filter.pollingStationId) return false;
      if (filter.electionType && r.electionType !== filter.electionType) return false;
      if (filter.status && r.status !== filter.status) return false;
      return true;
    });
  }

  async count(): Promise<number> {
    return db.count('results');
  }

  async getStats(): Promise<{
    total: number;
    byStatus: Record<ResultStatus, number>;
    byElectionType: Record<ElectionType, number>;
  }> {
    const all = await db.getAll<PollingStationResult>('results');
    const byStatus: Record<ResultStatus, number> = { draft: 0, submitted: 0, verified: 0, rejected: 0 };
    const byElectionType: Record<ElectionType, number> = { presidential: 0, parliamentary: 0, mayoral: 0, councillor: 0 };
    for (const r of all) {
      byStatus[r.status] = (byStatus[r.status] ?? 0) + 1;
      byElectionType[r.electionType] = (byElectionType[r.electionType] ?? 0) + 1;
    }
    return { total: all.length, byStatus, byElectionType };
  }
}

export const resultsService = new ResultsService();
