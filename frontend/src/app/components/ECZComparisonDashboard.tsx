import { useState, useEffect, useCallback } from 'react';
import {
  Scale, AlertTriangle, CheckCircle2, MinusCircle, RefreshCw, Filter,
  ChevronDown, ChevronUp, TrendingUp, TrendingDown, Minus,
  BarChart2, Flag, Search, Eye, Trash2, Edit2, Save, X,
  AlertCircle, Loader2, Plus, Activity,
} from 'lucide-react';
import {
  eczComparisonApi, dataEntryApi,
  type ECZComparison, type ECZComparisonsMeta,
} from '../lib/api';
import {
  presidentialCandidates, provinces,
  type Candidate,
} from '../data/mockData';
import { ECZEntryPage } from '../pages/ECZEntryPage';
import { DiscrepancyAnalysisPanel } from './DiscrepancyAnalysisPanel';

// ─── Candidate resolver ───────────────────────────────────────────────────────

const CAND_MAP = new Map<string, Candidate>(presidentialCandidates.map(c => [c.id, c]));
function resolveCandidate(id: string): Candidate {
  return CAND_MAP.get(id) ?? { id, name: id, party: '?', partyColor: '#6b7280' };
}
function resolveProvinceName(id: string): string {
  return provinces.find(p => p.id === id)?.name ?? id;
}

// ─── Config ───────────────────────────────────────────────────────────────────

const ELECTION_LABELS: Record<string, string> = {
  presidential: 'Presidential',
  mp: 'Parliamentary (MP)',
  mayoral: 'Mayoral',
  councillor: 'Councillor',
};
const LEVEL_LABELS: Record<string, string> = {
  national: 'National',
  province: 'Province',
  district: 'District',
  constituency: 'Constituency',
  ward: 'Ward',
};

// ─── Status helpers ───────────────────────────────────────────────────────────

function StatusBadge({ comp }: { comp: ECZComparison }) {
  if (!comp.hasDiscrepancy) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        <CheckCircle2 className="w-3 h-3" /> Match
      </span>
    );
  }
  if (comp.isFlagged) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
        <Flag className="w-3 h-3" /> Flagged
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
      <AlertTriangle className="w-3 h-3" /> Discrepancy
    </span>
  );
}

function DiffChip({ diff, pct }: { diff: number; pct?: number }) {
  if (diff === 0) return <span className="text-xs text-green-600 font-semibold">✓ 0</span>;
  const sign = diff > 0 ? '+' : '';
  const big = Math.abs(pct ?? 0) > 5;
  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-mono font-bold ${big ? 'text-red-600' : 'text-amber-600'}`}>
      {diff > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
      {sign}{diff.toLocaleString()}
      {pct !== undefined && <span className="text-xs font-normal opacity-70">({Math.abs(pct).toFixed(1)}%)</span>}
    </span>
  );
}

// ─── Summary Cards ────────────────────────────────────────────────────────────

function SummaryCards({ meta, byType }: {
  meta: ECZComparisonsMeta;
  byType: Record<string, number>;
}) {
  const cards = [
    { label: 'Total ECZ Figures', value: meta.total, icon: <Scale className="w-4 h-4" />, color: 'text-purple-700', bg: 'bg-purple-50 border-purple-200' },
    { label: 'Fully Matching', value: meta.fullyMatching, icon: <CheckCircle2 className="w-4 h-4" />, color: 'text-green-700', bg: 'bg-green-50 border-green-200' },
    { label: 'Discrepancies', value: meta.withDiscrepancy, icon: <AlertTriangle className="w-4 h-4" />, color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' },
    { label: 'Flagged (>5%)', value: meta.flagged, icon: <Flag className="w-4 h-4" />, color: 'text-red-700', bg: 'bg-red-50 border-red-200' },
  ];
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {cards.map(c => (
        <div key={c.label} className={`rounded-xl border p-4 ${c.bg}`}>
          <div className={`flex items-center gap-1.5 text-xs font-medium mb-1 ${c.color}`}>{c.icon}{c.label}</div>
          <p className={`text-3xl font-bold ${c.color}`}>{c.value}</p>
        </div>
      ))}
    </div>
  );
}

// ─── Comparison Row (expandable) ──────────────────────────────────────────────

function ComparisonRow({ comp, onDelete, onEdit }: {
  comp: ECZComparison;
  onDelete: () => void;
  onEdit: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`Delete ECZ figures for ${comp.levelName} (${ELECTION_LABELS[comp.electionType]})?`)) return;
    setDeleting(true);
    try {
      await dataEntryApi.deleteECZFigure(comp.levelType, comp.levelId, comp.electionType);
      onDelete();
    } finally {
      setDeleting(false);
    }
  };

  const agentHasData = comp.agentStationsReporting > 0;

  return (
    <div className={`rounded-xl border overflow-hidden ${comp.isFlagged ? 'border-red-300' : comp.hasDiscrepancy ? 'border-amber-300' : 'border-green-300'}`}>
      {/* Summary row */}
      <div
        className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-muted/20 transition-colors ${comp.isFlagged ? 'bg-red-50/40' : comp.hasDiscrepancy ? 'bg-amber-50/40' : 'bg-green-50/20'}`}
        onClick={() => setExpanded(v => !v)}
      >
        <div className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-4 gap-2 items-center">
          {/* Location */}
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">{comp.levelName}</p>
            <p className="text-xs text-muted-foreground">{LEVEL_LABELS[comp.levelType]} · {ELECTION_LABELS[comp.electionType]}</p>
          </div>

          {/* ECZ total */}
          <div className="text-right sm:text-left">
            <p className="text-xs text-muted-foreground">ECZ Announced</p>
            <p className="text-sm font-mono font-bold text-purple-800">{comp.eczTotalVotesCast.toLocaleString()}</p>
          </div>

          {/* Agent total */}
          <div className="text-right sm:text-left">
            <p className="text-xs text-muted-foreground">
              Agent Total {agentHasData ? `(${comp.agentStationsReporting} stn)` : '(no data)'}
            </p>
            <p className={`text-sm font-mono font-bold ${agentHasData ? 'text-blue-800' : 'text-muted-foreground'}`}>
              {agentHasData ? comp.agentTotalVotesCast.toLocaleString() : '—'}
            </p>
          </div>

          {/* Diff + status */}
          <div className="flex items-center gap-2 justify-end sm:justify-start">
            {agentHasData && <DiffChip diff={comp.totalVotesDiff} pct={comp.eczTotalVotesCast > 0 ? (Math.abs(comp.totalVotesDiff) / comp.eczTotalVotesCast) * 100 : 0} />}
            <StatusBadge comp={comp} />
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={e => { e.stopPropagation(); onEdit(); }}
            title="Edit"
            className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted transition-colors"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={e => { e.stopPropagation(); handleDelete(); }}
            disabled={deleting}
            title="Delete"
            className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors disabled:opacity-40"
          >
            {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
          </button>
          {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground ml-1" /> : <ChevronDown className="w-4 h-4 text-muted-foreground ml-1" />}
        </div>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t border-border overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/30">
                <th className="text-left px-4 py-2.5 font-semibold text-foreground">Candidate</th>
                <th className="text-left px-3 py-2.5 font-semibold text-foreground">Party</th>
                <th className="text-right px-4 py-2.5 font-semibold text-purple-700">ECZ Announced</th>
                <th className="text-right px-4 py-2.5 font-semibold text-blue-700">Agent Total</th>
                <th className="text-right px-4 py-2.5 font-semibold text-foreground">Difference</th>
              </tr>
            </thead>
            <tbody>
              {comp.candidateDiscrepancies.map((d, i) => {
                const cand = resolveCandidate(d.candidateId);
                const isDiscrepant = d.diff !== 0;
                return (
                  <tr
                    key={d.candidateId}
                    className={`border-b border-border/50 ${isDiscrepant ? (Math.abs(d.diffPct) > 5 ? 'bg-red-50/30' : 'bg-amber-50/30') : i % 2 === 0 ? 'bg-white' : 'bg-muted/10'}`}
                  >
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cand.partyColor }} />
                        <span className="font-medium text-foreground">{cand.name}</span>
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-muted-foreground">{cand.party}</td>
                    <td className="px-4 py-2.5 text-right font-mono font-semibold text-purple-800">{d.eczVotes.toLocaleString()}</td>
                    <td className="px-4 py-2.5 text-right font-mono font-semibold text-blue-800">
                      {agentHasData ? d.agentVotes.toLocaleString() : <span className="text-muted-foreground">—</span>}
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      {agentHasData ? <DiffChip diff={d.diff} pct={d.diffPct} /> : <span className="text-muted-foreground text-xs">—</span>}
                    </td>
                  </tr>
                );
              })}

              {/* Totals */}
              <tr className="bg-blue-50/40 border-t-2 border-blue-200">
                <td className="px-4 py-2.5 font-bold text-foreground" colSpan={2}>Total Valid Votes Cast</td>
                <td className="px-4 py-2.5 text-right font-mono font-bold text-purple-800">{comp.eczTotalVotesCast.toLocaleString()}</td>
                <td className="px-4 py-2.5 text-right font-mono font-bold text-blue-800">{agentHasData ? comp.agentTotalVotesCast.toLocaleString() : '—'}</td>
                <td className="px-4 py-2.5 text-right">{agentHasData ? <DiffChip diff={comp.totalVotesDiff} /> : '—'}</td>
              </tr>
              <tr className="bg-orange-50/40">
                <td className="px-4 py-2.5 font-semibold text-foreground" colSpan={2}>Rejected Ballots</td>
                <td className="px-4 py-2.5 text-right font-mono font-semibold text-purple-700">{comp.eczRejectedBallots.toLocaleString()}</td>
                <td className="px-4 py-2.5 text-right font-mono font-semibold text-blue-700">{agentHasData ? comp.agentRejectedBallots.toLocaleString() : '—'}</td>
                <td className="px-4 py-2.5 text-right">{agentHasData ? <DiffChip diff={comp.rejectedDiff} /> : '—'}</td>
              </tr>
            </tbody>
          </table>

          {/* Footer */}
          <div className="px-4 py-2.5 bg-muted/20 border-t border-border flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
            <span>Entered by <strong>{comp.enteredBy}</strong> · Last updated {new Date(comp.updatedAt).toLocaleString()}</span>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-500" /> ECZ Announced</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500" /> Agent Total (sum from polling agents)</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-gray-400" /> Diff = Agent − ECZ</span>
            </div>
          </div>

          {/* Discrepancy Analysis — shown when there is a discrepancy and agent has data */}
          {comp.hasDiscrepancy && agentHasData && (
            <div className="border-t-2 border-amber-200">
              <DiscrepancyAnalysisPanel
                electionType={comp.electionType}
                levelType={comp.levelType}
                levelId={comp.levelId}
                levelName={comp.levelName}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── ECZ Entry Modal ──────────────────────────────────────────────────────────

function ECZEntryModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/50 overflow-y-auto">
      <div className="min-h-full flex items-start justify-center p-4 py-8">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-purple-700 to-purple-600 border-b border-purple-500">
            <div className="flex items-center gap-2 text-white">
              <Scale className="w-5 h-5" />
              <span className="font-bold">Enter / Update ECZ Announced Figures</span>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="overflow-y-auto max-h-[80vh]">
            <ECZEntryPage />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Flagged Alerts Banner ────────────────────────────────────────────────────

function FlaggedBanner({ count, onFilter }: { count: number; onFilter: () => void }) {
  if (count === 0) return null;
  return (
    <div
      onClick={onFilter}
      className="flex items-center gap-3 px-4 py-3 bg-red-50 border-2 border-red-300 rounded-xl cursor-pointer hover:bg-red-100 transition-colors"
    >
      <Flag className="w-5 h-5 text-red-600 shrink-0" />
      <div className="flex-1">
        <p className="text-sm font-bold text-red-800">
          {count} scope{count !== 1 ? 's' : ''} flagged with &gt;5% discrepancy
        </p>
        <p className="text-xs text-red-600">Click to show only flagged entries</p>
      </div>
      <Filter className="w-4 h-4 text-red-500" />
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export function ECZComparisonDashboard() {
  const [comparisons, setComparisons] = useState<ECZComparison[]>([]);
  const [meta, setMeta] = useState<ECZComparisonsMeta>({ total: 0, withDiscrepancy: 0, flagged: 0, fullyMatching: 0 });
  const [byType, setByType] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [showEntry, setShowEntry] = useState(false);
  const [error, setError] = useState('');

  // Filters
  const [search, setSearch] = useState('');
  const [filterElection, setFilterElection] = useState('');
  const [filterLevel, setFilterLevel] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'matching' | 'discrepancy' | 'flagged'>('all');
  const [sortBy, setSortBy] = useState<'updated' | 'flagged' | 'level'>('updated');

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const [compRes, summaryRes] = await Promise.all([
        eczComparisonApi.comparisons(),
        eczComparisonApi.summary().catch(() => null),
      ]);
      setComparisons(compRes.comparisons);
      setMeta(compRes.meta);
      if (summaryRes) setByType(summaryRes.summary.byElectionType);
      setLastRefresh(new Date());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load ECZ comparisons');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Derived filtered + sorted list
  const filtered = comparisons
    .filter(c => {
      if (filterElection && c.electionType !== filterElection) return false;
      if (filterLevel && c.levelType !== filterLevel) return false;
      if (filterStatus === 'matching' && c.hasDiscrepancy) return false;
      if (filterStatus === 'discrepancy' && !c.hasDiscrepancy) return false;
      if (filterStatus === 'flagged' && !c.isFlagged) return false;
      if (search) {
        const q = search.toLowerCase();
        return c.levelName.toLowerCase().includes(q) || c.levelId.toLowerCase().includes(q) || c.enteredBy.toLowerCase().includes(q);
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'flagged') return Number(b.isFlagged) - Number(a.isFlagged) || Number(b.hasDiscrepancy) - Number(a.hasDiscrepancy);
      if (sortBy === 'level') return a.levelType.localeCompare(b.levelType) || a.levelName.localeCompare(b.levelName);
      return b.updatedAt.localeCompare(a.updatedAt);
    });

  const electionTypes = [...new Set(comparisons.map(c => c.electionType))];
  const levelTypes = [...new Set(comparisons.map(c => c.levelType))];

  return (
    <div className="space-y-6">
      {showEntry && <ECZEntryModal onClose={() => { setShowEntry(false); load(); }} />}

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Scale className="w-5 h-5 text-purple-600" />
            <h2 className="text-xl font-bold text-foreground">Agent vs ECZ Comparison</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Comparison of BOZ field agent totals against officially announced ECZ figures. Restricted to authorised managers only.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {lastRefresh && (
            <span className="text-xs text-muted-foreground">Updated {lastRefresh.toLocaleTimeString()}</span>
          )}
          <button
            onClick={load}
            className="p-2 rounded-lg border border-border hover:bg-muted transition-colors text-muted-foreground"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setShowEntry(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-semibold transition-colors"
          >
            <Plus className="w-4 h-4" />
            Enter ECZ Figures
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />{error}
        </div>
      )}

      {/* Summary cards */}
      {!loading && (
        <SummaryCards meta={meta} byType={byType} />
      )}

      {/* Election type breakdown pills */}
      {!loading && Object.keys(byType).length > 0 && (
        <div className="flex flex-wrap gap-2">
          {Object.entries(byType).map(([et, count]) => (
            <button
              key={et}
              onClick={() => setFilterElection(filterElection === et ? '' : et)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium transition-colors ${filterElection === et ? 'bg-purple-600 text-white border-purple-600' : 'bg-card border-border hover:border-purple-300'}`}
            >
              <BarChart2 className="w-3 h-3" />
              {ELECTION_LABELS[et] || et}
              <span className={`px-1.5 py-0.5 rounded-full ${filterElection === et ? 'bg-white/20' : 'bg-muted'}`}>{count}</span>
            </button>
          ))}
        </div>
      )}

      {/* Flagged banner */}
      <FlaggedBanner count={meta.flagged} onFilter={() => setFilterStatus('flagged')} />

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-52">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by location, enteredBy…"
            className="w-full pl-9 pr-3 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        {/* Status filter */}
        <div className="flex gap-1 rounded-lg overflow-hidden border border-border">
          {([['all','All'],['matching','✓ Match'],['discrepancy','⚠ Diff'],['flagged','🚩 Flagged']] as const).map(([val, label]) => (
            <button
              key={val}
              onClick={() => setFilterStatus(val as typeof filterStatus)}
              className={`px-3 py-2 text-xs font-medium transition-colors ${filterStatus === val ? 'bg-purple-600 text-white' : 'bg-card hover:bg-muted'}`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Level filter */}
        {levelTypes.length > 1 && (
          <select
            value={filterLevel}
            onChange={e => setFilterLevel(e.target.value)}
            className="px-3 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="">All Levels</option>
            {levelTypes.map(lt => <option key={lt} value={lt}>{LEVEL_LABELS[lt] || lt}</option>)}
          </select>
        )}

        {/* Sort */}
        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value as typeof sortBy)}
          className="px-3 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="updated">Sort: Latest Updated</option>
          <option value="flagged">Sort: Flagged First</option>
          <option value="level">Sort: By Level</option>
        </select>

        {(search || filterElection || filterLevel || filterStatus !== 'all') && (
          <button
            onClick={() => { setSearch(''); setFilterElection(''); setFilterLevel(''); setFilterStatus('all'); }}
            className="px-3 py-2 text-xs text-purple-600 hover:underline"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Results count */}
      <div className="text-sm text-muted-foreground">
        Showing <strong className="text-foreground">{filtered.length}</strong> of {comparisons.length} entries
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="rounded-xl border border-border p-4 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-1/4" />
                  <div className="h-3 bg-muted rounded w-1/6" />
                </div>
                <div className="h-6 bg-muted rounded w-20" />
                <div className="h-6 bg-muted rounded w-20" />
                <div className="h-6 bg-muted rounded w-16" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <Scale className="w-12 h-12 mb-3 opacity-20" />
          <p className="font-medium text-foreground">
            {comparisons.length === 0 ? 'No ECZ figures entered yet' : 'No results match your filters'}
          </p>
          {comparisons.length === 0 && (
            <button
              onClick={() => setShowEntry(true)}
              className="mt-3 flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-semibold hover:bg-purple-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Enter First ECZ Figures
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(comp => (
            <ComparisonRow
              key={comp.id}
              comp={comp}
              onDelete={load}
              onEdit={() => setShowEntry(true)}
            />
          ))}
        </div>
      )}

      {/* Legend */}
      {filtered.length > 0 && (
        <div className="flex flex-wrap gap-4 text-xs text-muted-foreground pt-2 border-t border-border">
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-green-500" /> All figures match</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Minor discrepancy (≤5%)</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-500" /> Flagged discrepancy (&gt;5%)</span>
          <span className="ml-auto">Difference = Agent Total − ECZ Announced</span>
        </div>
      )}
    </div>
  );
}
