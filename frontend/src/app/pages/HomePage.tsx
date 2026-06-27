import { useState } from 'react';
import { Link } from 'react-router';
import { MovingStars } from '../components/MovingStars';
import { StatCard } from '../components/StatCard';
import { CandidateCard } from '../components/CandidateCard';
import {
  presidentialCandidates,
  getAllPollingStations,
  aggregateResults,
  getTotalRegisteredVoters,
  getTotalVotesCast,
  getTotalRejectedBallots,
  calculateTurnout,
} from '../data/mockData';
import { useElectionResults } from '../hooks/useElectionResults';
import { Users, Vote, FileX, TrendingUp, ArrowRight, Calendar, Wifi, WifiOff } from 'lucide-react';
import { PieChart, Pie, ResponsiveContainer, Tooltip } from 'recharts';

const ELECTION_DATE = new Date('2026-08-13T00:00:00');

function ElectionCountdown() {
  const now = new Date();
  const msLeft = ELECTION_DATE.getTime() - now.getTime();
  const daysLeft = Math.max(0, Math.ceil(msLeft / (1000 * 60 * 60 * 24)));
  const hoursLeft = Math.floor((msLeft / (1000 * 60 * 60)) % 24);
  const minutesLeft = Math.floor((msLeft / (1000 * 60)) % 60);
  const electionPassed = msLeft <= 0;

  return (
    <div
      className="rounded-2xl mb-8 overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #7c2d00 0%, #ea580c 55%, #fed7aa 100%)', border: '1px solid rgba(255,255,255,0.15)' }}
    >
      <div className="flex flex-col sm:flex-row items-center gap-6 px-6 py-6">
        <div className="flex items-center gap-4">
          <div
            className="flex flex-col items-center justify-center rounded-2xl shrink-0"
            style={{ background: electionPassed ? '#16a34a' : '#dc2626', width: 96, height: 96 }}
          >
            <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: '2.6rem', color: '#fff', lineHeight: 1, fontWeight: 700 }}>
              {electionPassed ? '✓' : daysLeft}
            </span>
            {!electionPassed && (
              <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: '0.65rem', color: 'rgba(255,255,255,0.85)', letterSpacing: '0.14em' }}>
                {daysLeft === 1 ? 'DAY' : 'DAYS'}
              </span>
            )}
          </div>
          <div>
            <p style={{ fontFamily: 'Oswald, sans-serif', fontSize: '1.25rem', color: '#fff', letterSpacing: '0.05em', lineHeight: 1.2 }}>
              {electionPassed ? 'ELECTION DAY HAS PASSED' : `${daysLeft} ${daysLeft === 1 ? 'DAY' : 'DAYS'} LEFT UNTIL ELECTION DAY`}
            </p>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', marginTop: 4 }}>
              Zambia 2026 General Election · 13 August 2026
            </p>
          </div>
        </div>
        <div className="hidden sm:block h-16 w-px" style={{ background: 'rgba(255,255,255,0.1)' }} />
        {!electionPassed && (
          <div className="flex items-center gap-6">
            {[{ label: 'HOURS', value: hoursLeft }, { label: 'MINUTES', value: minutesLeft }].map(({ label, value }) => (
              <div key={label} className="text-center">
                <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: '2rem', color: '#fff', lineHeight: 1 }}>
                  {String(value).padStart(2, '0')}
                </div>
                <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.45)', letterSpacing: '0.12em', marginTop: 4 }}>
                  {label}
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="sm:ml-auto flex items-center gap-2 px-5 py-3 rounded-xl" style={{ background: 'rgba(0,0,0,0.35)', border: '2px solid rgba(255,255,255,0.5)' }}>
          <Calendar size={16} style={{ color: '#fff' }} />
          <span style={{ fontSize: '1rem', color: '#fff', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.1em', fontWeight: 700 }}>
            THURSDAY, 13 AUG 2026
          </span>
        </div>
      </div>
      {!electionPassed && (
        <div style={{ padding: '0 24px 16px' }}>
          <div style={{ height: 4, borderRadius: 9999, background: 'rgba(255,255,255,0.07)', overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: 9999,
              background: 'linear-gradient(90deg, #16a34a, #4ade80)',
              width: `${Math.min(100, Math.max(1, ((365 - daysLeft) / 365) * 100))}%`,
            }} />
          </div>
        </div>
      )}
    </div>
  );
}

// ── Mock data fallback computation ────────────────────────────────────────────

function getMockStats() {
  const allStations = getAllPollingStations();
  const resultTotals = aggregateResults(allStations);
  const totalRegistered = getTotalRegisteredVoters();
  const totalVotes = getTotalVotesCast();
  const totalRejected = getTotalRejectedBallots();
  const turnout = calculateTurnout(totalRegistered, totalVotes);
  const candidateResults = presidentialCandidates
    .map(c => ({ candidate: c, votes: resultTotals.get(c.id) || 0, percentage: 0, rank: 0 }))
    .sort((a, b) => b.votes - a.votes)
    .map((r, i) => ({ ...r, rank: i + 1 }));
  return { totalRegistered, totalVotes, totalRejected, turnout, candidateResults, stationsReporting: allStations.length };
}

// ── Main page ─────────────────────────────────────────────────────────────────

export function HomePage() {
  const [showAllCandidates, setShowAllCandidates] = useState(false);

  const live = useElectionResults('presidential');

  // Decide which data to show
  const mock = getMockStats();
  const usingLive = live.backendConnected;
  const hasResults = live.liveResults.length > 0;

  const displayResults = usingLive && hasResults ? live.liveResults : mock.candidateResults;
  const totalRegistered  = usingLive ? live.totalRegistered  : mock.totalRegistered;
  const totalVotes       = usingLive ? live.totalVotes       : mock.totalVotes;
  const totalRejected    = usingLive ? live.rejectedBallots  : mock.totalRejected;
  const turnout          = usingLive ? live.turnoutPercent   : mock.turnout;
  const stationsLabel    = usingLive && hasResults
    ? `${live.stationsReporting.toLocaleString()} stations reporting`
    : usingLive
    ? 'Connected — awaiting first results'
    : `${mock.stationsReporting.toLocaleString()} polling stations`;
  const totalValidVotes  = displayResults.reduce((s, r) => s + r.votes, 0);

  const PIE_COLORS = [
    '#198754','#DC2626','#F59E0B','#3B82F6','#8B5CF6',
    '#EC4899','#10B981','#F97316','#06B6D4','#84CC16',
    '#6366F1','#EF4444','#14B8A6','#F43F5E',
  ];
  const pieData = displayResults.map((r, i) => ({
    name: r.candidate.party,
    fullName: r.candidate.name,
    value: r.votes,
    fill: PIE_COLORS[i % PIE_COLORS.length],
  }));

  return (
    <div className="min-h-screen bg-background">
      <MovingStars />
      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="mb-10 text-center">
          <div className="mb-4 flex flex-col items-center gap-2">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#198754] to-[#146644] text-white rounded-full text-sm font-semibold shadow-lg">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
              {live.loading ? 'Connecting to live feed…' : usingLive ? (hasResults ? 'Live Results Updating' : 'Connected — No Results Yet') : 'Showing Preview Data'}
            </div>
            {!live.loading && (
              <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${usingLive ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
                {usingLive ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                {usingLive
                  ? (hasResults ? `Live · ${live.stationsReporting} stations reporting` : 'Live · Awaiting results')
                  : 'Preview mode — backend unreachable'}
              </div>
            )}
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-[#198754] via-[#DC2626] to-[#F59E0B] bg-clip-text text-transparent mb-3">
            Election Results
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Transparency You Can Trust – Every Vote, Every Station, Every Count
          </p>
        </div>

        {/* Countdown */}
        <ElectionCountdown />

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard title="Registered Voters" value={totalRegistered.toLocaleString()} icon={Users} color="primary" />
          <StatCard title="Votes Cast" value={totalVotes.toLocaleString()} icon={Vote} color="success" />
          <StatCard
            title="Voter Turnout"
            value={`${typeof turnout === 'number' ? turnout.toFixed(1) : '0.0'}%`}
            subtitle={stationsLabel}
            icon={TrendingUp}
            color="warning"
          />
          <StatCard title="Rejected Ballots" value={totalRejected.toLocaleString()} icon={FileX} color="danger" />
        </div>

        {/* Presidential Results Preview */}
        <div className="bg-gradient-to-br from-card via-card to-card/80 border-2 border-border rounded-2xl p-8 mb-8 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-1 flex items-center gap-2">
                <div className="w-1 h-8 bg-gradient-to-b from-[#198754] to-[#DC2626] rounded-full" />
                Presidential Results
              </h2>
              <p className="text-sm text-muted-foreground ml-3">Vote distribution across all candidates</p>
            </div>
            <Link
              to="/results/presidential"
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-primary/90 text-primary-foreground rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-105 font-semibold"
            >
              View Full Results <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Candidate list */}
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-sm font-semibold text-foreground">
                  {showAllCandidates ? 'All Candidates' : 'Top 4 Candidates'}
                </h3>
                {displayResults.length > 4 && (
                  <button
                    onClick={() => setShowAllCandidates(v => !v)}
                    className="text-xs px-3 py-1 rounded-full border transition-colors"
                    style={{ borderColor: '#198754', color: showAllCandidates ? '#fff' : '#198754', background: showAllCandidates ? '#198754' : 'transparent' }}
                  >
                    {showAllCandidates ? 'Show Top 4' : 'View Full Results'}
                  </button>
                )}
              </div>
              <div className="space-y-3">
                {(showAllCandidates ? displayResults : displayResults.slice(0, 4)).map((result, index) => (
                  <CandidateCard
                    key={result.candidate.id}
                    candidate={result.candidate}
                    votes={result.votes}
                    totalVotes={totalValidVotes}
                    rank={index + 1}
                    isLeading={index === 0}
                  />
                ))}
              </div>
              {!showAllCandidates && displayResults.length > 4 && (
                <button
                  onClick={() => setShowAllCandidates(true)}
                  className="w-full py-3 rounded-xl border-2 border-dashed text-sm font-semibold transition-colors"
                  style={{ borderColor: '#198754', color: '#198754' }}
                >
                  View Full Results — {displayResults.length - 4} more candidate{displayResults.length - 4 !== 1 ? 's' : ''}
                </button>
              )}
              <div className="grid grid-cols-2 gap-2 pt-3 border-t border-border">
                <div className="bg-muted/50 rounded-lg p-3 border border-border">
                  <div className="text-xs text-muted-foreground mb-1">Total Valid Votes</div>
                  <div className="font-bold text-lg">{totalValidVotes.toLocaleString()}</div>
                </div>
                <div className="bg-muted/50 rounded-lg p-3 border border-border">
                  <div className="text-xs text-muted-foreground mb-1">Rejected Ballots</div>
                  <div className="font-bold text-lg">{totalRejected.toLocaleString()}</div>
                </div>
              </div>
            </div>

            {/* Pie chart */}
            <div className="flex flex-col items-center justify-center">
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ percent }) => percent > 0.04 ? `${(percent * 100).toFixed(1)}%` : ''}
                    outerRadius={120}
                    dataKey="value"
                  />
                  <Tooltip
                    formatter={(value: number, name: string, props: any) => [
                      value.toLocaleString(),
                      `${props.payload?.fullName ?? name} (${name})`,
                    ]}
                    contentStyle={{
                      backgroundColor: 'var(--card)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      padding: '8px 12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5 mt-2">
                {pieData.map(entry => (
                  <div key={entry.name} className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: entry.fill }} />
                    <span className="text-xs text-muted-foreground">{entry.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { to: '/results/parliament', label: 'National Assembly', sub: 'MP results by constituency', bg: 'from-[#DC2626] via-[#DC2626] to-[#B91C1C]' },
            { to: '/results/mayoral',    label: 'Mayoral Elections', sub: 'City & district council leaders', bg: 'from-[#198754] via-[#198754] to-[#146644]' },
            { to: '/results/councillor', label: 'Ward Councillors',  sub: 'Local government representatives', bg: 'from-[#F59E0B] via-[#F59E0B] to-[#D97706]' },
          ].map(({ to, label, sub, bg }) => (
            <Link
              key={to}
              to={to}
              className={`group relative bg-gradient-to-br ${bg} text-white rounded-2xl p-8 hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] overflow-hidden`}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
              <div className="relative">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4 backdrop-blur-sm">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-2">{label}</h3>
                <p className="text-sm opacity-90">{sub}</p>
                <ArrowRight className="w-5 h-5 mt-4 group-hover:translate-x-2 transition-transform" />
              </div>
            </Link>
          ))}
        </div>

        {/* Transparency Notice */}
        <div className="mt-8 bg-muted border border-border rounded-lg p-6">
          <h3 className="font-semibold text-foreground mb-2">About This Platform</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Build One Zambia's independent election observation platform provides real-time,
            station-by-station results from trained polling agents across every polling station in Zambia.
            All results are verified directly from Electoral Commission of Zambia (ECZ) officials.
          </p>
          <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-2"><div className="w-2 h-2 bg-[#198754] rounded-full" />Independent Verification</div>
            <div className="flex items-center gap-2"><div className="w-2 h-2 bg-[#DC2626] rounded-full" />Real-time Updates</div>
            <div className="flex items-center gap-2"><div className="w-2 h-2 bg-[#F59E0B] rounded-full" />Full Transparency</div>
          </div>
        </div>

      </div>
    </div>
  );
}
