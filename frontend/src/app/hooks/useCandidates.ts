/**
 * useCandidates hook
 * Fetches candidates from the backend for a given election type + scope.
 * Falls back gracefully to static mockData if the backend is unreachable.
 * Returns candidates in the same Candidate shape used by the result pages.
 */

import { useState, useEffect } from 'react';
import { candidatesApi, type CandidateElectionType } from '../lib/api';
import { presidentialCandidates, type Candidate } from '../data/mockData';

interface UseCandidatesOptions {
  electionType: CandidateElectionType;
  scopeId?: string;  // 'national' for presidential; constituencyId for mp, etc.
}

interface UseCandidatesResult {
  candidates: Candidate[];
  loading: boolean;
  fromBackend: boolean;  // true if data came from backend, false if using static fallback
}

function backendToCandidate(bc: {
  id: string;
  name: string;
  title?: string;
  party: string;
  partyColor: string;
  photoDataUrl?: string;
}): Candidate {
  return {
    id: bc.id,
    name: bc.title ? `${bc.title} ${bc.name}` : bc.name,
    party: bc.party,
    partyColor: bc.partyColor,
    photo: bc.photoDataUrl,
  };
}

/**
 * Presidential candidates — fetches from backend, merges with static photo assets
 * for candidates that have static photos but no backend photo yet.
 */
export function useCandidates({ electionType, scopeId }: UseCandidatesOptions): UseCandidatesResult {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [fromBackend, setFromBackend] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function fetch() {
      setLoading(true);
      try {
        const effectiveScopeId = scopeId || (electionType === 'presidential' ? 'national' : '');
        if (!effectiveScopeId) {
          // No scope means no candidates from backend yet — use static
          throw new Error('No scopeId');
        }

        const res = await candidatesApi.byScope(electionType, effectiveScopeId);
        if (cancelled) return;

        if (res.candidates.length > 0) {
          // Backend has candidates — use them, with photo URLs pointing to backend
          setCandidates(res.candidates.map(bc => ({
            id: bc.id,
            name: bc.title ? `${bc.title} ${bc.name}` : bc.name,
            party: bc.party,
            partyColor: bc.partyColor,
            // Use the backend photo URL (binary served from /candidates/:id/photo)
            photo: candidatesApi.photoUrl(bc.id),
          })));
          setFromBackend(true);
        } else {
          throw new Error('No candidates in backend yet');
        }
      } catch {
        if (cancelled) return;
        // Fallback to static data
        if (electionType === 'presidential') {
          setCandidates(presidentialCandidates);
        } else {
          setCandidates([]);
        }
        setFromBackend(false);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetch();
    return () => { cancelled = true; };
  }, [electionType, scopeId]);

  return { candidates, loading, fromBackend };
}

/**
 * Simple hook that returns a Map of candidateId → Candidate for fast lookups.
 * Used by result components that already have a list of candidate IDs from vote data.
 */
export function useCandidateMap(electionType: CandidateElectionType, scopeId?: string): {
  candidateMap: Map<string, Candidate>;
  loading: boolean;
  fromBackend: boolean;
} {
  const { candidates, loading, fromBackend } = useCandidates({ electionType, scopeId });
  const candidateMap = new Map<string, Candidate>(candidates.map(c => [c.id, c]));
  return { candidateMap, loading, fromBackend };
}
