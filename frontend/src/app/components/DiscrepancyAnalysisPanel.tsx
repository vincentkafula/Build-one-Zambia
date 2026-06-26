import { useState, useEffect } from 'react';
import {
  TrendingUp, TrendingDown, Minus, AlertTriangle, Building2,
  ChevronDown, ChevronUp, Loader2, RefreshCw, MapPin, User,
  ShieldAlert, CheckCircle2, Info,
} from 'lucide-react';
import { eczComparisonApi, type DiscrepancyAnalysis, type DiscrepancyCandidateAnalysis, type DiscrepancyStation } from '../lib/api';
import { presidentialCandidates, provinces } from '../data/mockData';
import type { Candidate } from '../data/mockData';

// ─── Candidate resolver ───────────────────────────────────────────────────────

const CAND_MAP = new Map<string, Candidate>(presidentialCandidates.map(c => [c.id, c]));
function resolveCandidate(id: string): Candidate {
  return CAND_MAP.get(id) ?? { id, name: id, party: '?', partyColor: '#6b7280' } as Candidate;
}

// ─── Outcome config ───────────────────────────────────────────────────────────

const OUTCOME = {
  benefited: {
    label: 'BENEFITED',
    sublabel: 'ECZ announced more than agents recorded',
    bg: 'rgba(239,68,68,0.08)',
    border: '#ef4444',
    textColor: '#ef4444',
    badgeBg: '#ef4444',
    icon: <TrendingUp size={16} color="#ef4444" />,
    headerBg: 'rgba(239,68,68,0.12)',
  },
  disadvantaged: {
    label: 'DISADVANTAGED',
    sublabel: 'ECZ announced fewer than agents recorded',
    bg: 'rgba(59,130,246,0.08)',
    border: '#3b82f6',
    textColor: '#3b82f6',
    badgeBg: '#3b82f6',
    icon: <TrendingDown size={16} color="#3b82f6" />,
    headerBg: 'rgba(59,130,246,0.12)',
  },
  neutral: {
    label: 'MATCHED',
    sublabel: 'Agent and ECZ figures agree exactly',
    bg: 'rgba(16,185,129,0.06)',
    border: '#10b981',
    textColor: '#10b981',
    badgeBg: '#10b981',
    icon: <Minus size={16} color="#10b981" />,
    headerBg: 'rgba(16,185,129,0.08)',
  },
};

// ─── Candidate card ───────────────────────────────────────────────────────────

function CandidateAnalysisCard({ item }: { item: DiscrepancyCandidateAnalysis }) {
  const cand = resolveCandidate(item.candidateId);
  const cfg = OUTCOME[item.outcome];
  const absDiff = Math.abs(item.diff);
  const sign = item.diff > 0 ? '+' : item.diff < 0 ? '' : '';

  return (
    <div
      className="rounded-2xl p-4 transition-all"
      style={{ backgroundColor: cfg.bg, border: `2px solid ${cfg.border}` }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-xs shrink-0"
            style={{ background: cand.partyColor, fontFamily: 'Oswald, sans-serif', fontWeight: 700 }}>
            {cand.name.split(' ').filter(w => /^[A-Z]/.test(w) && !['Mr','Ms','Dr','Mrs'].includes(w)).map(n => n[0]).join('').slice(0, 2)}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-foreground text-sm truncate">{cand.name}</p>
            <p className="text-xs text-muted-foreground">{cand.party}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {item.isFlagged && (
            <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-200">
              <AlertTriangle size={10} /> Flagged
            </span>
          )}
          <span
            className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full text-white font-semibold"
            style={{ backgroundColor: cfg.badgeBg, fontFamily: 'Oswald, sans-serif', letterSpacing: '0.06em', fontSize: '0.65rem' }}
          >
            {cfg.icon}
            {cfg.label}
          </span>
        </div>
      </div>

      {/* Vote comparison bar */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="rounded-xl p-3 text-center" style={{ backgroundColor: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.25)' }}>
          <p style={{ color: 'rgba(0,0,0,0.4)', fontSize: '0.65rem', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.1em' }}>ECZ ANNOUNCED</p>
          <p style={{ color: '#7c3aed', fontFamily: 'Oswald, sans-serif', fontSize: '1.4rem', fontWeight: 700, lineHeight: 1 }}>{item.eczVotes.toLocaleString()}</p>
        </div>
        <div className="rounded-xl p-3 text-center" style={{ backgroundColor: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.25)' }}>
          <p style={{ color: 'rgba(0,0,0,0.4)', fontSize: '0.65rem', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.1em' }}>AGENT TOTAL</p>
          <p style={{ color: '#2563eb', fontFamily: 'Oswald, sans-serif', fontSize: '1.4rem', fontWeight: 700, lineHeight: 1 }}>{item.agentVotes.toLocaleString()}</p>
        </div>
      </div>

      {/* Diff row */}
      {item.diff !== 0 && (
        <div className="flex items-center justify-between px-3 py-2 rounded-xl mb-3"
          style={{ backgroundColor: `${cfg.border}15`, border: `1px solid ${cfg.border}30` }}>
          <span style={{ color: cfg.textColor, fontFamily: 'Oswald, sans-serif', fontSize: '0.75rem', letterSpacing: '0.06em' }}>
            DIFFERENCE
          </span>
          <span style={{ color: cfg.textColor, fontFamily: 'Oswald, sans-serif', fontSize: '1rem', fontWeight: 700 }}>
            {sign}{item.diff.toLocaleString()} ({item.diffPct.toFixed(1)}%)
          </span>
        </div>
      )}

      {/* Outcome explanation */}
      <p style={{ color: 'rgba(0,0,0,0.55)', fontSize: '0.75rem', lineHeight: 1.5 }}>{item.outcomeDetail}</p>
    </div>
  );
}

// ─── Station breakdown ────────────────────────────────────────────────────────

function StationRow({ station, candidateIds, expanded, onToggle }: {
  station: DiscrepancyStation;
  candidateIds: string[];
  expanded: boolean;
  onToggle: () => void;
}) {
  const devAbs = Math.abs(station.deviation);
  const devColor = devAbs > 20 ? '#ef4444' : devAbs > 10 ? '#f59e0b' : '#10b981';
  const statusColors: Record<string, string> = { verified: '#10b981', pending: '#f59e0b', queried: '#f97316', rejected: '#ef4444' };
  const stColor = statusColors[station.status] || '#9ca3af';

  return (
    <div className="border-b border-border/40 last:border-0">
      <div
        className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-muted/20 transition-colors"
        onClick={onToggle}
      >
        <MapPin size={14} className="shrink-0 text-muted-foreground" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">{station.pollingStationName}</p>
          <p className="text-xs text-muted-foreground">ID: {station.pollingStationId} · By {station.enteredBy}</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-xs font-mono font-bold text-foreground">{station.totalVotesCast.toLocaleString()}</span>
          {station.deviation !== 0 && (
            <span className="text-xs font-bold" style={{ color: devColor }}>
              {station.deviation > 0 ? '+' : ''}{station.deviation.toFixed(1)}%
            </span>
          )}
          <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: `${stColor}18`, color: stColor, border: `1px solid ${stColor}30`, fontFamily: 'Oswald, sans-serif', letterSpacing: '0.06em', fontSize: '0.62rem' }}>
            {station.status.toUpperCase()}
          </span>
          {expanded ? <ChevronUp size={14} className="text-muted-foreground" /> : <ChevronDown size={14} className="text-muted-foreground" />}
        </div>
      </div>

      {expanded && (
        <div className="px-4 pb-4 pt-1 bg-muted/10">
          <div className="grid grid-cols-3 gap-2 mb-3">
            {[
              { label: 'Registered', value: station.registeredVoters.toLocaleString() },
              { label: 'Votes Cast', value: station.totalVotesCast.toLocaleString() },
              { label: 'Rejected', value: station.rejectedBallots.toLocaleString() },
            ].map(f => (
              <div key={f.label} className="rounded-lg p-2 text-center bg-muted/30">
                <p className="text-xs text-muted-foreground">{f.label}</p>
                <p className="text-sm font-mono font-bold text-foreground">{f.value}</p>
              </div>
            ))}
          </div>
          <table className="w-full text-xs">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
                <th className="text-left py-1.5 text-muted-foreground font-medium">Candidate</th>
                <th className="text-right py-1.5 text-muted-foreground font-medium">Agent Votes</th>
              </tr>
            </thead>
            <tbody>
              {station.candidateVotes.filter(cv => candidateIds.includes(cv.candidateId)).map(cv => {
                const cand = resolveCandidate(cv.candidateId);
                return (
                  <tr key={cv.candidateId} style={{ borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
                    <td className="py-1.5 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ background: cand.partyColor }} />
                      <span className="text-foreground">{cand.name}</span>
                      <span className="text-muted-foreground">· {cand.party}</span>
                    </td>
                    <td className="py-1.5 text-right font-mono font-semibold text-foreground">{cv.votes.toLocaleString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <p className="text-xs text-muted-foreground mt-2">
            Submitted {new Date(station.submittedAt).toLocaleString()} · ECZ share deviation: {station.deviation > 0 ? '+' : ''}{station.deviation.toFixed(1)}%
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Main panel ───────────────────────────────────────────────────────────────

interface Props {
  electionType: string;
  levelType: string;
  levelId: string;
  levelName: string;
}

export function DiscrepancyAnalysisPanel({ electionType, levelType, levelId, levelName }: Props) {
  const [data, setData] = useState<DiscrepancyAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [expandedStation, setExpandedStation] = useState<string | null>(null);
  const [showAllStations, setShowAllStations] = useState(false);
  const [activeTab, setActiveTab] = useState<'candidates' | 'stations'>('candidates');

  async function load() {
    setLoading(true); setError('');
    try {
      const res = await eczComparisonApi.discrepancyAnalysis(electionType, levelType, levelId);
      setData(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load analysis');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [electionType, levelType, levelId]);

  if (loading) {
    return (
      <div className="flex items-center gap-3 px-6 py-10 text-muted-foreground">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span className="text-sm">Loading discrepancy analysis…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 px-6 py-6 text-red-600 text-sm">
        <AlertTriangle className="w-4 h-4 shrink-0" />
        {error}
        <button onClick={load} className="ml-2 underline text-xs">Retry</button>
      </div>
    );
  }

  if (!data) return null;

  const { summary, candidateAnalysis, stationBreakdown } = data;
  const allCandidateIds = candidateAnalysis.map(c => c.candidateId);
  const benefited = candidateAnalysis.filter(c => c.outcome === 'benefited');
  const disadvantaged = candidateAnalysis.filter(c => c.outcome === 'disadvantaged');
  const neutral = candidateAnalysis.filter(c => c.outcome === 'neutral');

  const displayedStations = showAllStations ? stationBreakdown : stationBreakdown.slice(0, 5);

  return (
    <div className="border-t-2 border-dashed border-border">
      {/* Analysis header */}
      <div className="px-5 py-4" style={{ background: 'linear-gradient(135deg, rgba(239,68,68,0.05) 0%, rgba(59,130,246,0.05) 100%)' }}>
        <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
          <div className="flex items-center gap-2">
            <ShieldAlert size={18} className="text-red-500" />
            <span className="font-bold text-foreground">Discrepancy Analysis — {levelName}</span>
          </div>
          <button
            onClick={load}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-border rounded-lg hover:bg-muted transition-colors text-muted-foreground"
          >
            <RefreshCw size={12} />
            Refresh
          </button>
        </div>

        {/* Summary pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
          {[
            { label: 'ECZ Announced', value: data.eczFigure.totalVotesCast.toLocaleString(), color: '#7c3aed' },
            { label: 'Agent Total', value: data.agentSummary.totalVotesCast.toLocaleString(), color: '#2563eb' },
            {
              label: 'Net Difference',
              value: `${data.overallDiff >= 0 ? '+' : ''}${data.overallDiff.toLocaleString()}`,
              color: data.overallDiff === 0 ? '#10b981' : Math.abs(data.overallDiff) > 100 ? '#ef4444' : '#f59e0b',
            },
            { label: 'Stations Reporting', value: summary.totalStations, color: '#0ea5e9' },
          ].map(p => (
            <div key={p.label} className="rounded-xl p-3 text-center" style={{ backgroundColor: `${p.color}10`, border: `1px solid ${p.color}25` }}>
              <p style={{ color: 'rgba(0,0,0,0.4)', fontSize: '0.65rem', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.1em' }}>{p.label}</p>
              <p style={{ color: p.color, fontFamily: 'Oswald, sans-serif', fontSize: '1.2rem', fontWeight: 700, lineHeight: 1.2 }}>{p.value}</p>
            </div>
          ))}
        </div>

        {/* Outcome summary banner */}
        {(summary.benefitedCount > 0 || summary.disadvantagedCount > 0) && (
          <div className="rounded-xl p-4 mb-4" style={{ backgroundColor: 'rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.08)' }}>
            <div className="flex items-start gap-2 mb-2">
              <Info size={14} className="text-amber-600 shrink-0 mt-0.5" />
              <p className="text-xs font-semibold text-foreground">Discrepancy Summary</p>
            </div>
            {benefited.length > 0 && (
              <p className="text-xs text-red-700 mb-1">
                <strong>{benefited.map(c => resolveCandidate(c.candidateId).name).join(', ')}</strong>
                {' '}— ECZ announced <strong>more</strong> votes than agents recorded
                {' '}({benefited.reduce((s, c) => s + Math.abs(c.diff), 0).toLocaleString()} extra votes in ECZ figures)
              </p>
            )}
            {disadvantaged.length > 0 && (
              <p className="text-xs text-blue-700">
                <strong>{disadvantaged.map(c => resolveCandidate(c.candidateId).name).join(', ')}</strong>
                {' '}— ECZ announced <strong>fewer</strong> votes than agents recorded
                {' '}({disadvantaged.reduce((s, c) => s + Math.abs(c.diff), 0).toLocaleString()} missing votes in ECZ figures)
              </p>
            )}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 rounded-xl overflow-hidden border border-border bg-muted/30" style={{ display: 'inline-flex' }}>
          {([['candidates', `Candidates (${summary.totalCandidates})`], ['stations', `Polling Stations (${summary.totalStations})`]] as const).map(([tab, label]) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="px-4 py-2 text-xs font-semibold transition-colors"
              style={{
                background: activeTab === tab ? '#1e2d4a' : 'transparent',
                color: activeTab === tab ? '#fff' : 'rgba(0,0,0,0.5)',
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Candidates tab */}
      {activeTab === 'candidates' && (
        <div className="px-5 pb-5">
          {/* Legend */}
          <div className="flex flex-wrap gap-4 mb-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <TrendingUp size={12} color="#ef4444" />
              <span className="text-red-600 font-semibold">Benefited</span> — ECZ announced more votes than agents counted
            </span>
            <span className="flex items-center gap-1.5">
              <TrendingDown size={12} color="#3b82f6" />
              <span className="text-blue-600 font-semibold">Disadvantaged</span> — ECZ announced fewer votes than agents counted
            </span>
            <span className="flex items-center gap-1.5">
              <Minus size={12} color="#10b981" />
              <span className="text-green-600 font-semibold">Matched</span> — Figures agree exactly
            </span>
          </div>

          {/* Benefited section */}
          {benefited.length > 0 && (
            <div className="mb-5">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp size={15} color="#ef4444" />
                <h4 className="text-sm font-bold text-red-700">Benefited from ECZ Figures ({benefited.length})</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {benefited.map(item => <CandidateAnalysisCard key={item.candidateId} item={item} />)}
              </div>
            </div>
          )}

          {/* Disadvantaged section */}
          {disadvantaged.length > 0 && (
            <div className="mb-5">
              <div className="flex items-center gap-2 mb-3">
                <TrendingDown size={15} color="#3b82f6" />
                <h4 className="text-sm font-bold text-blue-700">Disadvantaged by ECZ Figures ({disadvantaged.length})</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {disadvantaged.map(item => <CandidateAnalysisCard key={item.candidateId} item={item} />)}
              </div>
            </div>
          )}

          {/* Neutral section */}
          {neutral.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 size={15} color="#10b981" />
                <h4 className="text-sm font-bold text-green-700">Matched — No Discrepancy ({neutral.length})</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {neutral.map(item => <CandidateAnalysisCard key={item.candidateId} item={item} />)}
              </div>
            </div>
          )}

          {candidateAnalysis.length === 0 && (
            <div className="text-center py-8 text-muted-foreground text-sm">No candidate data available for analysis.</div>
          )}
        </div>
      )}

      {/* Stations tab */}
      {activeTab === 'stations' && (
        <div className="px-0 pb-4">
          {stationBreakdown.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground text-sm px-6">
              No polling station submissions found for this scope.
              <p className="text-xs mt-1">Agents may not have submitted results yet.</p>
            </div>
          ) : (
            <>
              <div className="px-5 py-3 flex items-center justify-between" style={{ backgroundColor: 'rgba(0,0,0,0.03)', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                <p className="text-xs text-muted-foreground">
                  Stations sorted by deviation from ECZ share.
                  <span className="text-red-600 font-semibold ml-1">{summary.flaggedStationsCount} station{summary.flaggedStationsCount !== 1 ? 's' : ''} flagged</span> (deviation &gt;10%)
                </p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500" /> &lt;10%</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500" /> 10–20%</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500" /> &gt;20%</span>
                </div>
              </div>

              <div className="rounded-xl overflow-hidden mx-5 mt-3" style={{ border: '1px solid rgba(0,0,0,0.08)' }}>
                {displayedStations.map(station => (
                  <StationRow
                    key={station.pollingStationId}
                    station={station}
                    candidateIds={allCandidateIds}
                    expanded={expandedStation === station.pollingStationId}
                    onToggle={() => setExpandedStation(prev => prev === station.pollingStationId ? null : station.pollingStationId)}
                  />
                ))}
              </div>

              {stationBreakdown.length > 5 && (
                <div className="text-center mt-3">
                  <button
                    onClick={() => setShowAllStations(v => !v)}
                    className="text-sm text-purple-600 hover:underline"
                  >
                    {showAllStations ? 'Show fewer stations' : `Show all ${stationBreakdown.length} stations`}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
