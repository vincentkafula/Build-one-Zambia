import { db } from '../db/indexedDbService';
import { PollingStationResult, ElectionType, CandidateResult, AggregatedResult } from './resultsService';

export interface NationalSummary {
  electionType: ElectionType;
  totalRegisteredVoters: number;
  totalVotesCast: number;
  totalValidVotes: number;
  totalRejectedBallots: number;
  turnoutPercent: number;
  stationsReported: number;
  stationsTotal: number;
  reportingPercent: number;
  leadingCandidate?: CandidateResult & { percent: number };
  candidates: (CandidateResult & { percent: number; isLeading: boolean; votes: number })[];
  lastUpdated: string;
}

export interface ProvinceSummary extends NationalSummary {
  provinceId: string;
  provinceName: string;
}

export interface TurnoutByProvince {
  provinceId: string;
  provinceName: string;
  registeredVoters: number;
  votesCast: number;
  turnoutPercent: number;
  stationsReported: number;
}

class AggregationService {
  private async getAllResults(): Promise<PollingStationResult[]> {
    return db.getAll<PollingStationResult>('results');
  }

  private aggregateCandidates(results: PollingStationResult[]): (CandidateResult & { percent: number; isLeading: boolean })[] {
    const totals = new Map<string, CandidateResult & { percent: number; isLeading: boolean }>();
    let totalValid = 0;

    for (const r of results) {
      totalValid += r.validVotes;
      for (const c of r.candidates) {
        if (!totals.has(c.candidateId)) {
          totals.set(c.candidateId, { ...c, votes: 0, percent: 0, isLeading: false });
        }
        const entry = totals.get(c.candidateId)!;
        entry.votes += c.votes;
      }
    }

    const candidates = Array.from(totals.values());
    const maxVotes = Math.max(...candidates.map((c) => c.votes), 0);

    return candidates
      .map((c) => ({
        ...c,
        percent: totalValid > 0 ? Math.round((c.votes / totalValid) * 1000) / 10 : 0,
        isLeading: c.votes === maxVotes && maxVotes > 0,
      }))
      .sort((a, b) => b.votes - a.votes);
  }

  async getNationalSummary(electionType: ElectionType, totalStations = 13529): Promise<NationalSummary> {
    const all = await db.query<PollingStationResult>(
      'results',
      (r) => r.electionType === electionType
    );

    const totalRegisteredVoters = all.reduce((s, r) => s + r.registeredVoters, 0);
    const totalVotesCast = all.reduce((s, r) => s + r.totalVotesCast, 0);
    const totalValidVotes = all.reduce((s, r) => s + r.validVotes, 0);
    const totalRejectedBallots = all.reduce((s, r) => s + r.rejectedBallots, 0);
    const stationsReported = all.length;
    const candidates = this.aggregateCandidates(all);

    return {
      electionType,
      totalRegisteredVoters,
      totalVotesCast,
      totalValidVotes,
      totalRejectedBallots,
      turnoutPercent: totalRegisteredVoters > 0
        ? Math.round((totalVotesCast / totalRegisteredVoters) * 1000) / 10
        : 0,
      stationsReported,
      stationsTotal: totalStations,
      reportingPercent: Math.round((stationsReported / totalStations) * 1000) / 10,
      leadingCandidate: candidates[0],
      candidates,
      lastUpdated: new Date().toISOString(),
    };
  }

  async getProvinceSummaries(electionType: ElectionType): Promise<ProvinceSummary[]> {
    const all = await db.query<PollingStationResult>(
      'results',
      (r) => r.electionType === electionType
    );

    const byProvince = new Map<string, PollingStationResult[]>();
    for (const r of all) {
      if (!byProvince.has(r.provinceId)) byProvince.set(r.provinceId, []);
      byProvince.get(r.provinceId)!.push(r);
    }

    return Array.from(byProvince.entries()).map(([provinceId, results]) => {
      const totalRegisteredVoters = results.reduce((s, r) => s + r.registeredVoters, 0);
      const totalVotesCast = results.reduce((s, r) => s + r.totalVotesCast, 0);
      const totalValidVotes = results.reduce((s, r) => s + r.validVotes, 0);
      const totalRejectedBallots = results.reduce((s, r) => s + r.rejectedBallots, 0);
      const candidates = this.aggregateCandidates(results);

      return {
        electionType,
        provinceId,
        provinceName: results[0].provinceName,
        totalRegisteredVoters,
        totalVotesCast,
        totalValidVotes,
        totalRejectedBallots,
        turnoutPercent: totalRegisteredVoters > 0
          ? Math.round((totalVotesCast / totalRegisteredVoters) * 1000) / 10 : 0,
        stationsReported: results.length,
        stationsTotal: 0, // populated by caller from master data
        reportingPercent: 0,
        leadingCandidate: candidates[0],
        candidates,
        lastUpdated: new Date().toISOString(),
      };
    });
  }

  async getTurnoutByProvince(): Promise<TurnoutByProvince[]> {
    const all = await db.getAll<PollingStationResult>('results');
    const byProvince = new Map<string, PollingStationResult[]>();
    for (const r of all) {
      if (!byProvince.has(r.provinceId)) byProvince.set(r.provinceId, []);
      byProvince.get(r.provinceId)!.push(r);
    }

    return Array.from(byProvince.entries()).map(([provinceId, results]) => ({
      provinceId,
      provinceName: results[0].provinceName,
      registeredVoters: results.reduce((s, r) => s + r.registeredVoters, 0),
      votesCast: results.reduce((s, r) => s + r.totalVotesCast, 0),
      turnoutPercent: 0,
      stationsReported: results.length,
    })).map((p) => ({
      ...p,
      turnoutPercent: p.registeredVoters > 0
        ? Math.round((p.votesCast / p.registeredVoters) * 1000) / 10 : 0,
    }));
  }

  async getAggregatedResult(
    level: AggregatedResult['level'],
    levelId: string,
    electionType: ElectionType
  ): Promise<AggregatedResult | null> {
    const indexMap: Record<string, string> = {
      province: 'by_province',
      district: 'by_district',
      constituency: 'by_constituency',
      ward: 'by_ward',
    };

    let results: PollingStationResult[] = [];

    if (level === 'national') {
      results = await db.query<PollingStationResult>('results', (r) => r.electionType === electionType);
    } else {
      const index = indexMap[level];
      if (!index) return null;
      const all = await db.getByIndex<PollingStationResult>('results', index, levelId);
      results = all.filter((r) => r.electionType === electionType);
    }

    if (results.length === 0) return null;

    const totalRegisteredVoters = results.reduce((s, r) => s + r.registeredVoters, 0);
    const totalVotesCast = results.reduce((s, r) => s + r.totalVotesCast, 0);
    const candidates = this.aggregateCandidates(results);

    return {
      level,
      levelId,
      levelName: level === 'national' ? 'Zambia' : results[0][`${level}Name` as keyof PollingStationResult] as string,
      electionType,
      registeredVoters: totalRegisteredVoters,
      totalVotesCast,
      validVotes: results.reduce((s, r) => s + r.validVotes, 0),
      rejectedBallots: results.reduce((s, r) => s + r.rejectedBallots, 0),
      turnoutPercent: totalRegisteredVoters > 0
        ? Math.round((totalVotesCast / totalRegisteredVoters) * 1000) / 10 : 0,
      stationsReported: results.length,
      stationsTotal: results.length,
      candidates,
      lastUpdated: new Date().toISOString(),
    };
  }

  // Compare agent results with ECZ official figures
  async computeDiscrepancies(provinceId?: string): Promise<{
    station: string;
    agentVotes: number;
    eczVotes: number;
    diff: number;
    severity: 'ok' | 'minor' | 'major';
  }[]> {
    const results = provinceId
      ? await db.getByIndex<PollingStationResult>('results', 'by_province', provinceId)
      : await db.getAll<PollingStationResult>('results');

    return results.map((r) => {
      const diff = 0; // real comparison with ECZ figures would go here
      return {
        station: r.pollingStationName,
        agentVotes: r.totalVotesCast,
        eczVotes: r.totalVotesCast + diff,
        diff: Math.abs(diff),
        severity: diff === 0 ? 'ok' : Math.abs(diff) < 10 ? 'minor' : 'major',
      };
    });
  }
}

export const aggregationService = new AggregationService();
