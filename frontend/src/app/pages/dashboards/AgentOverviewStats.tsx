import { useState, useEffect } from 'react';
import { dataEntryApi } from '../../lib/api';
import { provinces } from '../../data/mockData';

const CARD_BG = '#0f1f33';

interface Submission {
  pollingStationId?: string;
  totalVotesCast?: number;
  totalVotes?: number;
  submittedAt?: string;
}

function findStation(stationId: string) {
  for (const p of provinces) {
    for (const d of p.districts) {
      for (const c of d.constituencies) {
        for (const w of c.wards) {
          const s = w.pollingStations.find(s => s.id === stationId);
          if (s) return s;
        }
      }
    }
  }
  return null;
}

function StatCard({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div className="rounded-2xl p-4 text-center" style={{ backgroundColor: CARD_BG, border: `1px solid ${color}25` }}>
      <p style={{ color, fontSize: '1.8rem', fontFamily: 'Oswald, sans-serif', lineHeight: 1 }}>{value}</p>
      <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.7rem', marginTop: 6 }}>{label}</p>
    </div>
  );
}

export function AgentOverviewStats({ color }: { color: string }) {
  const rawUser = typeof window !== 'undefined' ? sessionStorage.getItem('boz_election_user') : null;
  const user = rawUser ? JSON.parse(rawUser) : null;
  const stationId: string = user?.scopeId || '';

  const station = stationId ? findStation(stationId) : null;
  const registeredVoters = station?.registeredVoters ?? 0;

  const [totalVotesCast, setTotalVotesCast] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!stationId) return;
    setLoading(true);
    dataEntryApi.listSubmissions({ pollingStationId: stationId })
      .then(res => {
        const subs = (res.submissions as Submission[]) || [];
        if (subs.length === 0) { setTotalVotesCast(null); return; }
        // Use whichever submission for this station was entered/updated most recently
        subs.sort((a, b) => (b.submittedAt || '').localeCompare(a.submittedAt || ''));
        const latest = subs[0];
        setTotalVotesCast(latest.totalVotesCast ?? latest.totalVotes ?? 0);
      })
      .catch(() => setTotalVotesCast(null))
      .finally(() => setLoading(false));
  }, [stationId]);

  if (!stationId) return null;

  const turnoutPct = registeredVoters > 0 && totalVotesCast !== null
    ? (totalVotesCast / registeredVoters) * 100
    : null;

  return (
    <>
      <StatCard
        label="Registered Voters"
        value={registeredVoters > 0 ? registeredVoters.toLocaleString() : '—'}
        color={color}
      />
      <StatCard
        label="Voter Turnout"
        value={loading ? '…' : (turnoutPct !== null ? `${turnoutPct.toFixed(1)}%` : '—')}
        color={color}
      />
    </>
  );
}

export default AgentOverviewStats;
