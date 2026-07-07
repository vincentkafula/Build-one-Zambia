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


// ── Hardcoded candidate name fallbacks ────────────────────────────────────────
// Used when backend candidate fetch fails or ID not in map
// Keys match the IDs stored in mockData.ts and auto-seeded in backend
const CANDIDATE_FALLBACKS: Record<string, { name: string; party: string; partyColor: string }> = {
  // Presidential
  gmc:    { name: 'Mr Given Mwenya Chansa',         party: 'MEE',         partyColor: '#16a34a' },
  rs:     { name: 'Dr Richard Silumbe',              party: 'LM',          partyColor: '#0891b2' },
  hk:     { name: 'Mr Harry Kalaba',                 party: 'CF',          partyColor: '#d97706' },
  fm:     { name: "Dr Fred M'membe",                 party: 'SP',          partyColor: '#dc2626' },
  kbf:    { name: 'Mr Kelvin Fube Bwalya (KBF)',    party: 'ZMP',         partyColor: '#7c3aed' },
  bm:     { name: 'Mr Brian Mundubile',              party: 'NRPUP',       partyColor: '#0f766e' },
  hkunda: { name: 'Mr Howard Kunda',                 party: 'ZAWAPA',      partyColor: '#b45309' },
  bmush:  { name: 'Dr Brian Mushimba',               party: 'OPP',         partyColor: '#0369a1' },
  gk:     { name: 'Ms Given Katuta',                 party: 'Independent', partyColor: '#6b7280' },
  xc:     { name: 'Mr Xavier Chungu',                party: 'LDP',         partyColor: '#9333ea' },
  hh:     { name: 'Mr Hakainde Hichilema',           party: 'UPND',        partyColor: '#e11d48' },
  dp:     { name: 'Dr Dan Pule',                     party: 'CDP',         partyColor: '#1d4ed8' },
  rs2:    { name: 'Mr Richwell Siamunene',           party: 'NFP',         partyColor: '#065f46' },
  aan:    { name: 'Mr Ackim Antony Njobvu',          party: 'DU',          partyColor: '#92400e' },
};

function resolveCandidate(candidateId: string, map: Map<string, Candidate>): Candidate {
  // 1. Try live backend map
  const fromMap = map.get(candidateId);
  if (fromMap) return fromMap;
  // 2. Try hardcoded fallback
  const fallback = CANDIDATE_FALLBACKS[candidateId];
  if (fallback) return { id: candidateId, ...fallback };
  // 3. Last resort — show ID
  return { id: candidateId, name: candidateId, party: '—', partyColor: '#6b7280' };
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
        const res = resData.result;
        setResult(res);
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
          candidate: resolveCandidate(t.candidateId, candidateMap),
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
