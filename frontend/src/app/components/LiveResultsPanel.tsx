import { useState, useEffect, useCallback } from 'react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  Cell, PieChart, Pie, Legend,
} from 'recharts';
import {
  Activity, RefreshCw, TrendingUp, TrendingDown, Minus, Users,
  CheckCircle, Clock, AlertCircle, XCircle, BarChart2, MapPin,
  Radio, Award, Zap,
} from 'lucide-react';
import {
  resultsApi,
  type ElectionCategory,
  type LevelResult,
  type NationalLeaderboard,
  type CoverageStats,
  type LiveFeedEntry,
  type VoteTrendPoint,
} from '../lib/api';
import {
  presidentialCandidates,
  provinces,
  type Candidate,
} from '../data/mockData';

// ─── Candidate resolver ───────────────────────────────────────────────────────

const ALL_CANDIDATES_MAP = new Map<string, Candidate>(
  presidentialCandidates.map(c => [c.id, c])
);

function resolveCandidate(id: string): { name: string; party: string; color: string } {
  const c = ALL_CANDIDATES_MAP.get(id);
  return c
    ? { name: c.name, party: c.party, color: c.partyColor || '#6b7280' }
    : { name: id, party: 'Unknown', color: '#6b7280' };
}

function resolveProvinceName(id: string): string {
  return provinces.find(p => p.id === id)?.name || id;
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { icon: React.ReactNode; cls: string; label: string }> = {
    verified:  { icon: <CheckCircle className="w-3 h-3" />, cls: 'bg-green-100 text-green-700',  label: 'Verified' },
    pending:   { icon: <Clock className="w-3 h-3" />,       cls: 'bg-yellow-100 text-yellow-700', label: 'Pending' },
    queried:   { icon: <AlertCircle className="w-3 h-3" />, cls: 'bg-orange-100 text-orange-700', label: 'Queried' },
    rejected:  { icon: <XCircle className="w-3 h-3" />,     cls: 'bg-red-100 text-red-700',       label: 'Rejected' },
  };
  const s = map[status] || map.pending;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${s.cls}`}>
      {s.icon}{s.label}
    </span>
  );
}

function StatTile({ label, value, sub, accent }: { label: string; value: string | number; sub?: string; accent?: string }) {
  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className={`text-2xl font-bold ${accent || 'text-foreground'}`}>{typeof value === 'number' ? value.toLocaleString() : value}</p>
      {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
    </div>
  );
}

// ─── Candidate Result Bar ─────────────────────────────────────────────────────

function CandidateResultBar({ candidateId, votes, percentage, rank, swing }: {
  candidateId: string; votes: number; percentage: number; rank: number; swing?: number | null;
}) {
  const { name, party, color } = resolveCandidate(candidateId);
  const isLeader = rank === 1;
  return (
    <div className={`rounded-xl border p-4 ${isLeader ? 'border-green-300 bg-green-50/30' : 'border-border bg-card'}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <span className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold ${isLeader ? 'bg-green-600 text-white' : 'bg-muted text-muted-foreground'}`}>
            {rank}
          </span>
          <div>
            <p className="font-semibold text-sm text-foreground">{name}</p>
            <p className="text-xs text-muted-foreground">{party}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-bold text-foreground">{votes.toLocaleString()}</p>
          <p className="text-sm text-muted-foreground">{percentage.toFixed(2)}%</p>
          {swing != null && (
            <span className={`text-xs font-medium flex items-center justify-end gap-0.5 ${swing > 0 ? 'text-green-600' : swing < 0 ? 'text-red-500' : 'text-muted-foreground'}`}>
              {swing > 0 ? <TrendingUp className="w-3 h-3" /> : swing < 0 ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
              {Math.abs(swing).toFixed(1)}%
            </span>
          )}
        </div>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${Math.min(percentage, 100)}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

// ─── Coverage Ring ────────────────────────────────────────────────────────────

function CoverageRing({ verified, pending, queried, rejected, total }: CoverageStats) {
  const data = [
    { name: 'Verified', value: verified, fill: '#16a34a' },
    { name: 'Pending',  value: pending,  fill: '#ca8a04' },
    { name: 'Queried',  value: queried,  fill: '#ea580c' },
    { name: 'Rejected', value: rejected, fill: '#dc2626' },
  ].filter(d => d.value > 0);

  if (total === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-40 text-muted-foreground text-sm">
        <Radio className="w-8 h-8 mb-2 opacity-30" />
        No submissions yet
      </div>
    );
  }

  return (
    <div className="flex items-center gap-6">
      <ResponsiveContainer width={120} height={120}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={35} outerRadius={55} dataKey="value" strokeWidth={0}>
            {data.map((d, i) => <Cell key={i} fill={d.fill} />)}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="flex-1 space-y-1.5">
        {data.map(d => (
          <div key={d.name} className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.fill }} />
              {d.name}
            </span>
            <span className="font-medium">{d.value} ({total > 0 ? ((d.value / total) * 100).toFixed(1) : 0}%)</span>
          </div>
        ))}
        <div className="flex items-center justify-between text-sm font-semibold border-t border-border pt-1 mt-1">
          <span>Total</span><span>{total}</span>
        </div>
      </div>
    </div>
  );
}

// ─── Trend Chart ─────────────────────────────────────────────────────────────

function TrendChart({ trend, electionType }: { trend: VoteTrendPoint[]; electionType: ElectionCategory }) {
  if (trend.length === 0) {
    return <div className="flex items-center justify-center h-40 text-muted-foreground text-sm">No trend data yet</div>;
  }

  // Get candidate ids that appear in trend
  const candidateIds = new Set<string>();
  for (const t of trend) Object.keys(t.cumulativeVotes).forEach(id => candidateIds.add(id));

  const chartData = trend.map(t => ({
    hour: t.hour.slice(11, 13) + ':00',
    total: t.cumulativeTotal,
    ...Object.fromEntries(Array.from(candidateIds).map(id => [id, t.cumulativeVotes[id] || 0])),
  }));

  const colors = ['#16a34a', '#dc2626', '#2563eb', '#ca8a04', '#7c3aed', '#db2777'];
  const candidateList = Array.from(candidateIds);

  return (
    <ResponsiveContainer width="100%" height={180}>
      <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
        <XAxis dataKey="hour" tick={{ fontSize: 10 }} />
        <YAxis tick={{ fontSize: 10 }} />
        <Tooltip formatter={(v: number, name: string) => [v.toLocaleString(), resolveCandidate(name).name || name]} />
        {candidateList.map((id, i) => (
          <Area
            key={id}
            type="monotone"
            dataKey={id}
            stackId="1"
            stroke={colors[i % colors.length]}
            fill={colors[i % colors.length]}
            fillOpacity={0.6}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
}

// ─── Province Heat Bar ────────────────────────────────────────────────────────

function ProvinceBreakdownBar({ coverage }: { coverage: CoverageStats }) {
  const provinces_data = Object.entries(coverage.byProvince)
    .map(([pid, data]) => ({
      name: resolveProvinceName(pid).replace(' Province', ''),
      submitted: data.submitted,
      verified: data.verified,
      pending: data.pending,
    }))
    .sort((a, b) => b.submitted - a.submitted)
    .slice(0, 10);

  if (provinces_data.length === 0) {
    return <div className="flex items-center justify-center h-40 text-muted-foreground text-sm">No provincial data</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={provinces_data} layout="vertical" margin={{ top: 0, right: 10, left: 60, bottom: 0 }}>
        <XAxis type="number" tick={{ fontSize: 10 }} />
        <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={60} />
        <Tooltip />
        <Bar dataKey="verified" fill="#16a34a" stackId="a" name="Verified" />
        <Bar dataKey="pending"  fill="#ca8a04" stackId="a" name="Pending" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

// ─── Live Feed ────────────────────────────────────────────────────────────────

function LiveFeedList({ feed }: { feed: LiveFeedEntry[] }) {
  if (feed.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-muted-foreground text-sm">
        <Zap className="w-8 h-8 mb-2 opacity-30" />
        No submissions yet
      </div>
    );
  }
  return (
    <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
      {feed.map(entry => (
        <div key={entry.submissionId} className="flex items-start gap-3 p-3 rounded-lg border border-border bg-card hover:bg-muted/30 transition-colors">
          <div className="mt-0.5">
            <StatusBadge status={entry.status} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{entry.pollingStationName}</p>
            <p className="text-xs text-muted-foreground">
              {entry.electionType.charAt(0).toUpperCase() + entry.electionType.slice(1)} ·{' '}
              {resolveProvinceName(entry.provinceId)} ·{' '}
              {entry.totalVotesCast.toLocaleString()} votes
            </p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-xs text-muted-foreground">{new Date(entry.submittedAt).toLocaleTimeString()}</p>
            {entry.topCandidateId && (
              <p className="text-xs font-medium text-green-700">{resolveCandidate(entry.topCandidateId).name.split(' ')[0]}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Main Panel ───────────────────────────────────────────────────────────────

interface LiveResultsPanelProps {
  electionType?: ElectionCategory;
  autoRefreshSeconds?: number;
  showLeaderboard?: boolean;
  showCoverage?: boolean;
  showTrend?: boolean;
  showFeed?: boolean;
  compact?: boolean;
}

export function LiveResultsPanel({
  electionType = 'presidential',
  autoRefreshSeconds = 30,
  showLeaderboard = true,
  showCoverage = true,
  showTrend = true,
  showFeed = true,
  compact = false,
}: LiveResultsPanelProps) {
  const [national, setNational] = useState<LevelResult | null>(null);
  const [leaderboard, setLeaderboard] = useState<NationalLeaderboard | null>(null);
  const [coverage, setCoverage] = useState<CoverageStats | null>(null);
  const [trend, setTrend] = useState<VoteTrendPoint[]>([]);
  const [feed, setFeed] = useState<LiveFeedEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [error, setError] = useState('');

  const fetchAll = useCallback(async () => {
    setError('');
    try {
      const promises: Promise<void>[] = [];

      promises.push(
        resultsApi.national(electionType).then(r => setNational(r.result)).catch(() => {})
      );
      if (showLeaderboard) {
        promises.push(
          resultsApi.leaderboard(electionType).then(r => setLeaderboard(r.leaderboard)).catch(() => {})
        );
      }
      if (showCoverage) {
        promises.push(
          resultsApi.coverage(electionType).then(r => setCoverage(r.stats)).catch(() => {})
        );
      }
      if (showTrend) {
        promises.push(
          resultsApi.trend(electionType).then(r => setTrend(r.trend)).catch(() => {})
        );
      }
      if (showFeed) {
        promises.push(
          resultsApi.liveFeed(20, electionType).then(r => setFeed(r.feed)).catch(() => {})
        );
      }

      await Promise.all(promises);
      setLastRefresh(new Date());
    } catch {
      setError('Failed to load live results. Retrying...');
    } finally {
      setLoading(false);
    }
  }, [electionType, showLeaderboard, showCoverage, showTrend, showFeed]);

  useEffect(() => {
    fetchAll();
    const interval = setInterval(fetchAll, autoRefreshSeconds * 1000);
    return () => clearInterval(interval);
  }, [fetchAll, autoRefreshSeconds]);

  const totalVotes = national?.totalVotesCast ?? 0;
  const turnout = national?.turnoutPercent ?? 0;

  // Days left until 13 August 2026
  const ELECTION_DATE = new Date('2026-08-13T00:00:00');
  const now = new Date();
  const msLeft = ELECTION_DATE.getTime() - now.getTime();
  const daysLeft = Math.max(0, Math.ceil(msLeft / (1000 * 60 * 60 * 24)));
  const electionPassed = msLeft <= 0;

  return (
    <div className="space-y-6">
      {/* Election countdown banner */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0f2027, #1e2d4a, #0f3020)' }}
      >
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-5">
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-center justify-center rounded-xl px-5 py-3 shrink-0"
              style={{ background: electionPassed ? '#16a34a' : '#dc2626', minWidth: 80 }}>
              <span className="text-white font-bold" style={{ fontSize: '2.2rem', fontFamily: 'Oswald, sans-serif', lineHeight: 1 }}>
                {electionPassed ? '✓' : daysLeft}
              </span>
              {!electionPassed && (
                <span className="text-white text-xs mt-0.5" style={{ fontFamily: 'Oswald, sans-serif', letterSpacing: '0.12em' }}>
                  {daysLeft === 1 ? 'DAY' : 'DAYS'}
                </span>
              )}
            </div>
            <div>
              <p className="text-white font-bold" style={{ fontFamily: 'Oswald, sans-serif', fontSize: '1.1rem', letterSpacing: '0.06em' }}>
                {electionPassed ? 'ELECTION DAY HAS PASSED' : `${daysLeft} ${daysLeft === 1 ? 'DAY' : 'DAYS'} LEFT UNTIL ELECTION DAY`}
              </p>
              <p className="text-gray-300 text-sm mt-0.5">
                {electionPassed
                  ? 'Zambia 2026 General Election — 13 August 2026'
                  : 'Zambia 2026 General Election · 13 August 2026'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-6 text-center shrink-0">
            {[
              { label: 'Hours', value: electionPassed ? 0 : Math.floor((msLeft / (1000 * 60 * 60)) % 24) },
              { label: 'Minutes', value: electionPassed ? 0 : Math.floor((msLeft / (1000 * 60)) % 60) },
            ].map(({ label, value }) => (
              <div key={label} className="flex flex-col items-center">
                <span className="text-white font-bold text-xl" style={{ fontFamily: 'Oswald, sans-serif' }}>
                  {String(value).padStart(2, '0')}
                </span>
                <span className="text-gray-400 text-xs">{label}</span>
              </div>
            ))}
          </div>
        </div>
        {/* Progress bar: days elapsed / total campaign days */}
        {!electionPassed && (
          <div className="px-6 pb-4">
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>Campaign Start</span>
              <span>Election: 13 Aug 2026</span>
            </div>
            <div className="h-1.5 rounded-full bg-white/10">
              <div
                className="h-1.5 rounded-full transition-all"
                style={{
                  width: `${Math.min(100, Math.max(2, ((365 - daysLeft) / 365) * 100))}%`,
                  background: 'linear-gradient(90deg, #16a34a, #4ade80)',
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </span>
          <span className="font-semibold text-foreground">Live Results</span>
          <span className="text-sm text-muted-foreground capitalize">· {electionType}</span>
        </div>
        <div className="flex items-center gap-2">
          {lastRefresh && (
            <span className="text-xs text-muted-foreground">
              Updated {lastRefresh.toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={() => { setLoading(true); fetchAll(); }}
            className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {loading && !national && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-card border border-border rounded-xl p-4 animate-pulse">
              <div className="h-3 bg-muted rounded w-2/3 mb-2" />
              <div className="h-7 bg-muted rounded w-1/2" />
            </div>
          ))}
        </div>
      )}

      {/* Top stats */}
      {national && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatTile
            label="Total Votes Cast"
            value={totalVotes}
            sub={`${national.validVotes.toLocaleString()} valid`}
            accent="text-green-700"
          />
          <StatTile
            label="Voter Turnout"
            value={`${turnout.toFixed(1)}%`}
            sub={`${national.registeredVoters.toLocaleString()} registered`}
          />
          <StatTile
            label="Rejected Ballots"
            value={national.rejectedBallots}
            sub={`${national.totalVotesCast > 0 ? ((national.rejectedBallots / national.totalVotesCast) * 100).toFixed(2) : 0}% of cast`}
            accent="text-red-600"
          />
          <StatTile
            label="Stations Reporting"
            value={national.stationsReporting}
            sub={`${national.submissionBreakdown.verified} verified`}
            accent="text-blue-700"
          />
        </div>
      )}

      {/* Main content grid */}
      <div className={`grid gap-6 ${compact ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2'}`}>

        {/* Candidate Results / Leaderboard */}
        {showLeaderboard && national && national.candidates.length > 0 && (
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Award className="w-4 h-4 text-green-600" />
              <h3 className="font-semibold text-foreground">Candidate Results</h3>
              {national.margin > 0 && (
                <span className="text-xs text-muted-foreground ml-auto">
                  Margin: {national.margin.toLocaleString()} ({national.marginPercent.toFixed(2)}%)
                </span>
              )}
            </div>
            <div className="space-y-3">
              {national.candidates.map(c => {
                const lb = leaderboard?.candidates.find(l => l.candidateId === c.candidateId);
                return (
                  <CandidateResultBar
                    key={c.candidateId}
                    candidateId={c.candidateId}
                    votes={c.votes}
                    percentage={c.percentage}
                    rank={c.rank}
                    swing={lb?.swing}
                  />
                );
              })}
            </div>
            {leaderboard && leaderboard.candidates.length > 0 && (
              <div className="mt-4 pt-3 border-t border-border">
                <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Province Leads</p>
                <div className="space-y-1">
                  {leaderboard.candidates.slice(0, 3).map(c => {
                    const { name, color } = resolveCandidate(c.candidateId);
                    return (
                      <div key={c.candidateId} className="flex items-center gap-2 text-xs">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
                        <span className="font-medium">{name.split(' ').slice(-1)[0]}</span>
                        <span className="text-muted-foreground">
                          leads {c.provinceLeads.length} province{c.provinceLeads.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Coverage */}
        {showCoverage && coverage && (
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <BarChart2 className="w-4 h-4 text-blue-600" />
              <h3 className="font-semibold text-foreground">Submission Coverage</h3>
              <span className={`ml-auto text-xs font-semibold px-2 py-0.5 rounded-full ${coverage.verifiedPercent >= 80 ? 'bg-green-100 text-green-700' : coverage.verifiedPercent >= 40 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                {coverage.verifiedPercent.toFixed(1)}% verified
              </span>
            </div>
            <CoverageRing {...coverage} />
            <div className="mt-4 pt-3 border-t border-border">
              <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">By Province</p>
              <ProvinceBreakdownBar coverage={coverage} />
            </div>
          </div>
        )}

        {/* Vote Trend */}
        {showTrend && trend.length > 0 && (
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-4 h-4 text-purple-600" />
              <h3 className="font-semibold text-foreground">Vote Accumulation Trend</h3>
              <span className="text-xs text-muted-foreground ml-auto">{trend.length} hour{trend.length !== 1 ? 's' : ''} of data</span>
            </div>
            <TrendChart trend={trend} electionType={electionType} />
          </div>
        )}

        {/* Live Feed */}
        {showFeed && (
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-4 h-4 text-orange-500" />
              <h3 className="font-semibold text-foreground">Live Submission Feed</h3>
              <span className="flex items-center gap-1 ml-auto text-xs text-muted-foreground">
                <Users className="w-3 h-3" />
                {feed.length} recent
              </span>
            </div>
            <LiveFeedList feed={feed} />
          </div>
        )}
      </div>

      {/* Submission breakdown pills */}
      {national && (
        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          <MapPin className="w-3.5 h-3.5" />
          <span>Breakdown:</span>
          <span className="font-medium text-green-700">{national.submissionBreakdown.verified} verified</span>
          <span>·</span>
          <span className="font-medium text-yellow-700">{national.submissionBreakdown.pending} pending</span>
          <span>·</span>
          <span className="font-medium text-orange-600">{national.submissionBreakdown.queried} queried</span>
          <span>·</span>
          <span className="font-medium text-red-600">{national.submissionBreakdown.rejected} rejected</span>
          <span>·</span>
          <span>Auto-refreshes every {autoRefreshSeconds}s</span>
        </div>
      )}
    </div>
  );
}

export { LiveResultsPanel as default };
