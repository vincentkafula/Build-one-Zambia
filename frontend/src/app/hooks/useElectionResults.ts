import { useState, useEffect } from 'react';
import {
  resultsApi, candidatesApi,
  type LevelResult, type ElectionCategory, type LevelType, type BackendCandidate,
} from '../lib/api';
import { type Candidate } from '../data/mockData';

export interface LiveCandidateResult {
  candidate: Candidate;
  votes: number;
  percentage: number;
  rank: number;
}

export interface UseElectionResultsReturn {
  result: LevelResult | null;
  liveResults: LiveCandidateResult[];
  loading: boolean;
  /** true only when backend is genuinely unreachable (network/auth error) */
  usingMockData: boolean;
  /** true when the backend responded successfully (even if zero results yet) */
  backendConnected: boolean;
  totalRegistered: number;
  totalVotes: number;
  validVotes: number;
  rejectedBallots: number;
  turnoutPercent: number;
  stationsReporting: number;
}

function toCandidate(bc: BackendCandidate): Candidate {
  return { id: bc.id, name: bc.name, party: bc.party, partyColor: bc.partyColor, photo: bc.photoDataUrl };
}

/**
 * Fetches live election results from the backend.
 * When levelType is 'national' or levelId is empty, fetches national aggregates.
 * Falls back to usingMockData=true when backend is unavailable.
 */
export function useElectionResults(
  electionType: ElectionCategory,
  levelType: LevelType = 'national',
  levelId: string = '',
): UseElectionResultsReturn {
  const [result, setResult] = useState<LevelResult | null>(null);
  const [candidateMap, setCandidateMap] = useState<Map<string, Candidate>>(new Map());
  const [loading, setLoading] = useState(true);
  const [usingMockData, setUsingMockData] = useState(false);
  const [backendConnected, setBackendConnected] = useState(false);

  const isNational = !levelId || levelType === 'national';

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setUsingMockData(false);
    setBackendConnected(false);
    setResult(null);

    const run = async () => {
      try {
        const [resData, candsData] = await Promise.all([
          isNational
            ? resultsApi.national(electionType)
            : resultsApi.level(electionType, levelType, levelId),
          candidatesApi.list({ electionType, active: true }),
        ]);
        if (cancelled) return;
        setResult(resData.result);
        setCandidateMap(new Map(candsData.candidates.map((c: BackendCandidate) => [c.id, toCandidate(c)])));
        setUsingMockData(false);
        setBackendConnected(true);
      } catch {
        if (!cancelled) {
          setUsingMockData(true);
          setBackendConnected(false);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    run();
    return () => { cancelled = true; };
  }, [electionType, levelType, levelId, isNational]);

  const liveResults: LiveCandidateResult[] = result
    ? result.candidates
        .map(t => ({
          candidate: candidateMap.get(t.candidateId) ?? {
            id: t.candidateId,
            name: `Candidate ${t.candidateId.slice(0, 8)}`,
            party: '—',
            partyColor: '#6b7280',
          },
          votes: t.votes,
          percentage: t.percentage,
          rank: t.rank,
        }))
        .sort((a, b) => a.rank - b.rank)
    : [];

  return {
    result,
    liveResults,
    loading,
    usingMockData,
    backendConnected,
    totalRegistered: result?.registeredVoters ?? 0,
    totalVotes: result?.totalVotesCast ?? 0,
    validVotes: result?.validVotes ?? 0,
    rejectedBallots: result?.rejectedBallots ?? 0,
    turnoutPercent: result?.turnoutPercent ?? 0,
    stationsReporting: result?.stationsReporting ?? 0,
  };
}
