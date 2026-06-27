import { API_BASE } from '@/app/lib/apiBase';
import { useState, useEffect, useCallback } from 'react';
import {
  CheckCircle2, XCircle, Eye, RefreshCw, AlertCircle, Loader2,
  Clock, MapPin, User, Vote, Filter, ChevronDown, ChevronUp,
} from 'lucide-react';
import { dataEntryApi, getToken } from '../lib/api';
import { projectId } from '../../../utils/supabase/info';

// Safe fetch wrapper — handles non-JSON responses (e.g. rate limit plain text)
async function safeFetch(url: string, options?: RequestInit) {
  const res = await fetch(url, options);
  const ct = res.headers.get('content-type') || '';
  if (!ct.includes('application/json')) {
    const text = await res.text();
    if (res.status === 429) throw new Error('Rate limit exceeded — please wait a moment and try again.');
    if (!res.ok) throw new Error(text || `HTTP ${res.status}`);
    return { ok: res.ok, status: res.status, json: async () => ({}) };
  }
  return res;
}

const BASE = API_BASE;

async function apiFetch<T>(method: string, path: string, body?: unknown): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await safeFetch(`${BASE}${path}`, {
    method, headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data as T;
}

interface Submission {
  id: string;
  pollingStationId: string;
  pollingStationName: string;
  electionType: string;
  status: 'pending' | 'verified' | 'queried' | 'rejected';
  enteredBy: string;
  submittedAt: string;
  totalVotesCast: number;
  rejectedBallots: number;
  registeredVoters: number;
  candidateResults: { candidateId: string; votes: number }[];
  notes?: string;
  province?: string;
  district?: string;
}

const ELECTION_LABELS: Record<string, string> = {
  presidential: 'Presidential',
  parliament: 'Parliament',
  mayoral: 'Mayoral',
  councillor: 'Councillor',
};

const STATUS_CONFIG = {
  pending:  { label: 'Pending Review', color: 'bg-amber-100 text-amber-800 border-amber-300', dot: 'bg-amber-400' },
  verified: { label: 'Verified',       color: 'bg-green-100  text-green-800  border-green-300',  dot: 'bg-green-400' },
  queried:  { label: 'Queried',        color: 'bg-blue-100   text-blue-800   border-blue-300',   dot: 'bg-blue-400' },
  rejected: { label: 'Rejected',       color: 'bg-red-100    text-red-800    border-red-300',    dot: 'bg-red-400' },
};

function SubmissionRow({
  sub, onStatusChange,
}: {
  sub: Submission;
  onStatusChange: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState('');
  const cfg = STATUS_CONFIG[sub.status] ?? STATUS_CONFIG.pending;

  const updateStatus = async (newStatus: 'verified' | 'queried' | 'rejected') => {
    setLoading(true);
    try {
      await apiFetch('PATCH', `/data-entry/submissions/${sub.id}/status`, { status: newStatus, notes });
      onStatusChange();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  const turnout = sub.registeredVoters > 0
    ? ((sub.totalVotesCast / sub.registeredVoters) * 100).toFixed(1)
    : '—';

  return (
    <div className={`rounded-xl border overflow-hidden ${sub.status === 'pending' ? 'border-amber-300' : sub.status === 'verified' ? 'border-green-300' : sub.status === 'rejected' ? 'border-red-300' : 'border-blue-300'}`}>
      {/* Summary row */}
      <div
        className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-muted/20 transition-colors"
        onClick={() => setExpanded(v => !v)}
      >
        <div className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-4 gap-2 items-center">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground truncate flex items-center gap-1">
              <MapPin className="w-3 h-3 shrink-0 text-muted-foreground" />
              {sub.pollingStationName}
            </p>
            <p className="text-xs text-muted-foreground">{ELECTION_LABELS[sub.electionType] ?? sub.electionType}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Agent</p>
            <p className="text-sm font-medium flex items-center gap-1">
              <User className="w-3 h-3 text-muted-foreground" />
              {sub.enteredBy}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Votes Cast / Turnout</p>
            <p className="text-sm font-mono font-semibold text-foreground">
              {sub.totalVotesCast.toLocaleString()} <span className="text-muted-foreground font-normal">({turnout}%)</span>
            </p>
          </div>
          <div className="flex items-center gap-2 justify-end sm:justify-start">
            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border ${cfg.color}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
              {cfg.label}
            </span>
          </div>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />}
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t border-border px-4 py-4 space-y-4 bg-muted/10">
          {/* Stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Registered Voters', value: sub.registeredVoters.toLocaleString() },
              { label: 'Total Votes Cast',  value: sub.totalVotesCast.toLocaleString() },
              { label: 'Rejected Ballots',  value: sub.rejectedBallots.toLocaleString() },
              { label: 'Submitted',         value: new Date(sub.submittedAt).toLocaleString() },
            ].map(({ label, value }) => (
              <div key={label} className="bg-card rounded-lg p-3 border border-border">
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-sm font-semibold text-foreground">{value}</p>
              </div>
            ))}
          </div>

          {/* Candidate results */}
          {sub.candidateResults.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Candidate Results</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {sub.candidateResults.map(cr => (
                  <div key={cr.candidateId} className="bg-card rounded-lg px-3 py-2 border border-border">
                    <p className="text-xs text-muted-foreground truncate">{cr.candidateId}</p>
                    <p className="text-sm font-mono font-bold text-foreground">{cr.votes.toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes input */}
          {sub.status === 'pending' && (
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">Notes (optional — shown to agent if queried/rejected)</label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                rows={2}
                placeholder="Reason for query or rejection…"
              />
            </div>
          )}

          {/* Action buttons */}
          {sub.status === 'pending' && (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => updateStatus('verified')}
                disabled={loading}
                className="flex items-center gap-1.5 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                Approve & Verify
              </button>
              <button
                onClick={() => updateStatus('queried')}
                disabled={loading}
                className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
              >
                <Eye className="w-4 h-4" />
                Query (needs clarification)
              </button>
              <button
                onClick={() => updateStatus('rejected')}
                disabled={loading}
                className="flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
              >
                <XCircle className="w-4 h-4" />
                Reject
              </button>
            </div>
          )}
          {sub.status !== 'pending' && sub.notes && (
            <div className="text-sm bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 text-blue-800">
              <span className="font-semibold">Notes: </span>{sub.notes}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function ResultsApprovalQueue() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'verified' | 'queried' | 'rejected'>('pending');
  const [filterElection, setFilterElection] = useState('');
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const qs = new URLSearchParams();
      if (filterStatus !== 'all') qs.set('status', filterStatus);
      if (filterElection) qs.set('electionType', filterElection);
      const data = await apiFetch<{ submissions: Submission[] }>('GET', `/data-entry/submissions?${qs}`);
      setSubmissions(data.submissions ?? []);
      setLastRefresh(new Date());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load submissions');
    } finally {
      setLoading(false);
    }
  }, [filterStatus, filterElection]);

  useEffect(() => { load(); }, [load]);

  const pending  = submissions.filter(s => s.status === 'pending').length;
  const verified = submissions.filter(s => s.status === 'verified').length;
  const queried  = submissions.filter(s => s.status === 'queried').length;
  const rejected = submissions.filter(s => s.status === 'rejected').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            <h2 className="text-xl font-bold text-foreground">Results Approval Queue</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Review and verify polling station results submitted by field agents before they count toward official totals.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {lastRefresh && <span className="text-xs text-muted-foreground">Updated {lastRefresh.toLocaleTimeString()}</span>}
          <button onClick={load} className="p-2 rounded-lg border border-border hover:bg-muted transition-colors">
            <RefreshCw className={`w-4 h-4 text-muted-foreground ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Summary pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Pending Review', count: pending,  bg: 'bg-amber-50 border-amber-200',  text: 'text-amber-800' },
          { label: 'Verified',       count: verified, bg: 'bg-green-50  border-green-200',  text: 'text-green-800' },
          { label: 'Queried',        count: queried,  bg: 'bg-blue-50   border-blue-200',   text: 'text-blue-800' },
          { label: 'Rejected',       count: rejected, bg: 'bg-red-50    border-red-200',    text: 'text-red-800' },
        ].map(({ label, count, bg, text }) => (
          <div key={label} className={`rounded-xl border p-4 ${bg}`}>
            <p className={`text-xs font-medium mb-1 ${text}`}>{label}</p>
            <p className={`text-3xl font-bold ${text}`}>{count}</p>
          </div>
        ))}
      </div>

      {error && (
        <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />{error}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex gap-1 rounded-lg overflow-hidden border border-border">
          {(['all','pending','verified','queried','rejected'] as const).map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-2 text-xs font-medium capitalize transition-colors ${filterStatus === s ? 'bg-primary text-primary-foreground' : 'bg-card hover:bg-muted'}`}
            >
              {s === 'all' ? 'All' : STATUS_CONFIG[s].label}
            </button>
          ))}
        </div>
        <select
          value={filterElection}
          onChange={e => setFilterElection(e.target.value)}
          className="px-3 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">All Election Types</option>
          {Object.entries(ELECTION_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
      </div>

      <p className="text-sm text-muted-foreground">
        Showing <strong className="text-foreground">{submissions.length}</strong> submission{submissions.length !== 1 ? 's' : ''}
      </p>

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-xl border border-border p-4 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-1/3" />
                  <div className="h-3 bg-muted rounded w-1/5" />
                </div>
                <div className="h-6 bg-muted rounded w-24" />
              </div>
            </div>
          ))}
        </div>
      ) : submissions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <Vote className="w-12 h-12 mb-3 opacity-20" />
          <p className="font-medium text-foreground">
            {filterStatus === 'pending' ? 'No pending submissions — all clear!' : 'No submissions match your filters'}
          </p>
          <p className="text-sm mt-1">Polling agents submit results via their dashboard during election day</p>
        </div>
      ) : (
        <div className="space-y-3">
          {submissions.map(sub => (
            <SubmissionRow key={sub.id} sub={sub} onStatusChange={load} />
          ))}
        </div>
      )}
    </div>
  );
}
