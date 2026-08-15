import { useState, useEffect } from 'react';
import { MapPin, CheckCircle2, Loader2 } from 'lucide-react';
import { resultsApi, ElectionCategory } from '../lib/api';
import { presidentialCandidates } from '../data/mockData';

function resolveCandidate(id: string): { name: string; party: string; color: string } {
  const c = presidentialCandidates.find(c => c.id === id);
  if (c) return { name: c.name, party: c.party, color: c.partyColor };
  return { name: id, party: '', color: '#6b7280' };
}

// Shows every constituency nationwide that has at least one declared
// result — whether from real polling-station submissions or a direct
// constituency-level ECZ entry (see the direct ECZ entry feature).
// Deliberately reads from the same declared-constituencies endpoint
// regardless of source, so a constituency appears here the moment any
// result exists for it, without needing station/ward coverage.
export function DeclaredConstituenciesList({ electionType }: { electionType: ElectionCategory }) {
  const [constituencies, setConstituencies] = useState<Awaited<ReturnType<typeof resultsApi.declaredConstituencies>>['constituencies']>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    resultsApi.declaredConstituencies(electionType)
      .then(res => { if (!cancelled) setConstituencies(res.constituencies); })
      .catch(() => { if (!cancelled) setConstituencies([]); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [electionType]);

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-10 text-muted-foreground">
        <Loader2 className="w-4 h-4 animate-spin" /> Loading declared constituencies…
      </div>
    );
  }

  if (constituencies.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-10 text-center text-muted-foreground">
        <MapPin className="w-6 h-6 opacity-40" />
        <p className="text-sm">No constituency results have been declared yet.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-foreground flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-primary" /> Declared Constituencies
        </h3>
        <span className="text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-full">{constituencies.length} declared</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {constituencies.map(c => {
          const leader = c.candidates[0];
          const info = leader ? resolveCandidate(leader.candidateId) : null;
          return (
            <div key={c.levelId} className="rounded-xl border border-border p-4 bg-card">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <p className="font-semibold text-foreground text-sm leading-tight">{c.levelName}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{c.districtName}{c.provinceName ? `, ${c.provinceName}` : ''}</p>
                </div>
                {c.isDirectEntry && (
                  <span className="shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700" title="Entered directly from ECZ's constituency-level announcement">
                    ECZ
                  </span>
                )}
              </div>
              {info && leader ? (
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: info.color }} />
                  <p className="text-xs text-foreground truncate">
                    <span className="font-medium">{info.name}</span>
                    <span className="text-muted-foreground"> — {leader.votes.toLocaleString()} votes ({leader.percentage}%)</span>
                  </p>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">No candidate votes recorded yet.</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default DeclaredConstituenciesList;
