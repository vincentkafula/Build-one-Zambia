import { API_BASE } from '@/app/lib/apiBase';
import { useState, useEffect, useCallback } from 'react';
import {
  CheckCircle2, XCircle, Eye, RefreshCw, AlertCircle, Loader2,
  MapPin, User, Vote, ChevronDown, ChevronUp, Circle, ShieldCheck, Lock,
} from 'lucide-react';
import { getToken } from '../lib/api';

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

// ── The five-step chain of custody every submission must clear in order ──────
type VerificationLevel = 'ward' | 'constituency' | 'district' | 'province' | 'national';
const CHAIN: VerificationLevel[] = ['ward', 'constituency', 'district', 'province', 'national'];
const CHAIN_LABELS: Record<VerificationLevel, string> = {
  ward: 'Ward', constituency: 'Constituency', district: 'District', province: 'Provincial', national: 'National',
};

interface ChainEntry { status: 'pending' | 'approved' | 'rejected' | 'queried'; by: string | null; at: string | null; notes?: string | null }
type VerificationChain = Record<VerificationLevel, ChainEntry>;

interface Submission {
  id: string;
  pollingStationId: string;
  pollingStationName: string;
  electionType: string;
  status: 'pending' | 'verified' | 'approved' | 'queried' | 'rejected';
  enteredBy: string;
  submittedAt: string;
  totalVotesCast: number;
  rejectedBallots: number;
  registeredVoters: number;
  candidateResults: { candidateId: string; votes: number }[];
  notes?: string;
  province?: string;
  district?: string;
  wardId?: string;
  constituencyId?: string;
  districtId?: string;
  provinceId?: string;
  verificationChain?: VerificationChain;
  isOfficial?: boolean;
  locked?: boolean;
}

const ELECTION_LABELS: Record<string, string> = {
  presidential: 'Presidential',
  parliament: 'Parliament',
  mayoral: 'Mayoral',
  councillor: 'Councillor',
};

const STATUS_CONFIG = {
  pending:  { label: 'Pending Review', color: 'bg-amber-100 text-amber-800 border-amber-300', dot: 'bg-amber-400' },
  verified: { label: 'Partly Verified', color: 'bg-blue-100 text-blue-800 border-blue-300', dot: 'bg-blue-400' },
  approved: { label: 'Official',       color: 'bg-green-100  text-green-800  border-green-300',  dot: 'bg-green-400' },
  queried:  { label: 'Queried',        color: 'bg-sky-100   text-sky-800   border-sky-300',   dot: 'bg-sky-400' },
  rejected: { label: 'Rejected',       color: 'bg-red-100    text-red-800    border-red-300',    dot: 'bg-red-400' },
};

// Session written at manager login (see DashboardLogin.tsx) — same key used
// by ManagerDashboard.tsx to know who's signed in.
interface ElectionUserSession { username: string; role: string; scopeId?: string; scopeName?: string; name?: string }

function getElectionUser(): ElectionUserSession | null {
  try { return JSON.parse(sessionStorage.getItem('boz_election_user') ?? 'null'); } catch { return null; }
}

const ROLE_TO_LEVEL: Record<string, VerificationLevel> = {
  ward_manager: 'ward',
  constituency_manager: 'constituency',
  district_manager: 'district',
  provincial_manager: 'province',
  national_manager: 'national',
};

const LEVEL_SCOPE_QUERY_PARAM: Record<VerificationLevel, string | null> = {
  ward: 'wardId', constituency: 'constituencyId', district: 'districtId', province: 'provinceId', national: null,
};

// ── Chain-of-custody strip — five dots showing where a submission sits ───────
function VerificationChainStrip({ chain }: { chain?: VerificationChain }) {
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {CHAIN.map((level, i) => {
        const entry = chain?.[level];
        const status = entry?.status ?? 'pending';
        const icon = status === 'approved'
          ? <CheckCircle2 className="w-3.5 h-3.5" />
          : status === 'rejected'
          ? <XCircle className="w-3.5 h-3.5" />
          : status === 'queried'
          ? <Eye className="w-3.5 h-3.5" />
          : <Circle className="w-3 h-3" />;
        const colorClass = status === 'approved' ? 'text-green-600 bg-green-50 border-green-300'
          : status === 'rejected' ? 'text-red-600 bg-red-50 border-red-300'
          : status === 'queried' ? 'text-sky-600 bg-sky-50 border-sky-300'
          : 'text-muted-foreground bg-muted border-border';
        return (
          <span key={level} className="flex items-center gap-1.5">
            <span
              title={`${CHAIN_LABELS[level]}: ${status}${entry?.by ? ` — ${entry.by}` : ''}`}
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-semibold ${colorClass}`}
            >
              {icon}
              {CHAIN_LABELS[level]}
            </span>
            {i < CHAIN.length - 1 && <span className="text-muted-foreground text-xs">→</span>}
          </span>
        );
      })}
    </div>
  );
}

function SubmissionRow({
  sub, myLevel, isOverride, onStatusChange,
}: {
  sub: Submission;
  myLevel: VerificationLevel | null;
  isOverride: boolean;
  onStatusChange: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState('');
  const [unlocking, setUnlocking] = useState(false);

  const unlockSubmission = async () => {
    if (!confirm(`Unlock "${sub.pollingStationName}"'s ${ELECTION_LABELS[sub.electionType] ?? sub.electionType} result for one corrected resubmission? The agent will be able to submit a replacement once, then it locks again automatically.`)) return;
    setUnlocking(true);
    try {
      await apiFetch('POST', `/data-entry/submissions/${sub.id}/unlock`, undefined);
      onStatusChange();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Failed to unlock submission');
    } finally {
      setUnlocking(false);
    }
  };
  const [overrideLevel, setOverrideLevel] = useState<VerificationLevel>('ward');
  const cfg = STATUS_CONFIG[sub.status] ?? STATUS_CONFIG.pending;

  const chain = sub.verificationChain;
  const acceptingLevel = isOverride ? overrideLevel : myLevel;

  // Can this viewer act right now? Every level before theirs must already be approved.
  const priorLevelsApproved = acceptingLevel
    ? CHAIN.slice(0, CHAIN.indexOf(acceptingLevel)).every(l => chain?.[l]?.status === 'approved')
    : false;
  const alreadyDecidedAtMyLevel = acceptingLevel ? chain?.[acceptingLevel]?.status !== 'pending' : true;
  const canActNow = !!acceptingLevel && priorLevelsApproved && (isOverride || !alreadyDecidedAtMyLevel) && sub.status !== 'rejected';

  const verifyLevel = async (decision: 'approved' | 'queried' | 'rejected') => {
    if (!acceptingLevel) return;
    setLoading(true);
    try {
      await apiFetch('PATCH', `/data-entry/submissions/${sub.id}/verify-level`, { level: acceptingLevel, decision, notes });
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
    <div className={`rounded-xl border overflow-hidden ${sub.status === 'pending' ? 'border-amber-300' : sub.status === 'approved' ? 'border-green-300' : sub.status === 'rejected' ? 'border-red-300' : 'border-blue-300'}`}>
      {/* Summary row */}
      <div
        className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:/20 transition-colors" style={{ backgroundColor: "#0f2d4a", color: "#7dd3fc", border: "1px solid #3b82f6" }}
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
              {sub.totalVotesCast?.toLocaleString() ?? 0} / {turnout}%
            </p>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.color}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
              {sub.isOfficial ? 'Official' : cfg.label}
            </span>
            {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
          </div>
        </div>
      </div>

      {expanded && (
        <div className="p-4 space-y-4 border-t border-border" style={{ backgroundColor: "#0b2136" }}>
          {/* Chain of custody */}
          <div>
            <p className="text-xs text-muted-foreground mb-2">Chain of custody</p>
            <VerificationChainStrip chain={chain} />
          </div>

          {/* Candidate votes */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {sub.candidateResults?.map(c => (
              <div key={c.candidateId} className="bg-card rounded-lg p-2 border border-border text-center">
                <p className="text-xs text-muted-foreground truncate">{c.candidateId}</p>
                <p className="text-sm font-bold text-foreground">{c.votes.toLocaleString()}</p>
              </div>
            ))}
          </div>

          {/* Lock status + admin-only unlock action */}
          {isOverride && (
            <div className={`flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-sm ${sub.locked !== false ? 'bg-red-50 border border-red-200' : 'bg-amber-50 border border-amber-200'}`}>
              <span className={sub.locked !== false ? 'text-red-800' : 'text-amber-800'}>
                {sub.locked !== false
                  ? 'Locked — the agent cannot resubmit or edit this result.'
                  : 'Unlocked — the agent can submit one corrected result before it locks again.'}
              </span>
              {sub.locked !== false && (
                <button
                  onClick={unlockSubmission}
                  disabled={unlocking}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-red-300 hover:bg-red-100 text-red-700 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 shrink-0"
                >
                  {unlocking ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Lock className="w-3.5 h-3.5" />}
                  Unlock for Resubmission
                </button>
              )}
            </div>
          )}

          {/* Override level selector — admins/super_admins only */}
          {isOverride && (
            <div className="flex items-center gap-2">
              <label className="text-xs text-muted-foreground">Act as level:</label>
              <select
                value={overrideLevel}
                onChange={e => setOverrideLevel(e.target.value as VerificationLevel)}
                className="px-2 py-1 text-sm rounded border"
                style={{ backgroundColor: "#1e3a5f", color: "#ffffff", border: "1px solid #3b82f6" }}
              >
                {CHAIN.map(l => <option key={l} value={l}>{CHAIN_LABELS[l]}</option>)}
              </select>
            </div>
          )}

          {/* Notes input */}
          {canActNow && (
            <div>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="w-full px-3 py-2 border  rounded-lg text-sm  resize-none focus:outline-none focus:ring-2 focus:ring-primary" style={{ backgroundColor: "#1e3a5f", color: "#ffffff", border: "1px solid #3b82f6" }}
                rows={2}
                placeholder="Reason for query or rejection…"
              />
            </div>
          )}

          {/* Action buttons — only for the manager whose turn it currently is */}
          {canActNow ? (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => verifyLevel('approved')}
                disabled={loading}
                className="flex items-center gap-1.5 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                Approve at {CHAIN_LABELS[acceptingLevel!]} level
              </button>
              <button
                onClick={() => verifyLevel('queried')}
                disabled={loading}
                className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
              >
                <Eye className="w-4 h-4" />
                Query (needs clarification)
              </button>
              <button
                onClick={() => verifyLevel('rejected')}
                disabled={loading}
                className="flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
              >
                <XCircle className="w-4 h-4" />
                Reject
              </button>
            </div>
          ) : sub.status === 'rejected' ? (
            <div className="text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-red-800">
              This submission was rejected in the chain and needs a corrected resubmission from the polling agent.
            </div>
          ) : !myLevel ? (
            <div className="text-sm bg-muted border border-border rounded-lg px-3 py-2 text-muted-foreground">
              Your account isn't assigned a ward/constituency/district/province manager role, so you can't act on this chain.
            </div>
          ) : !priorLevelsApproved ? (
            <div className="text-sm bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-amber-800">
              Awaiting {CHAIN_LABELS[CHAIN.find(l => chain?.[l]?.status !== 'approved') ?? 'ward']} approval before this reaches your ({CHAIN_LABELS[myLevel]}) level.
            </div>
          ) : (
            <div className="text-sm bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-green-800">
              You've already recorded a decision at the {CHAIN_LABELS[myLevel!]} level for this submission.
            </div>
          )}

          {sub.notes && (
            <div className="text-sm bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 text-blue-800">
              <span className="font-semibold">Agent notes: </span>{sub.notes}
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
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'verified' | 'approved' | 'queried' | 'rejected'>('pending');
  const [filterElection, setFilterElection] = useState('');
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const electionUser = getElectionUser();
  const isOverride = ['super_admin', 'admin'].includes(electionUser?.role ?? '');
  const myLevel = electionUser?.role ? (ROLE_TO_LEVEL[electionUser.role] ?? null) : null;

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const qs = new URLSearchParams();
      if (filterStatus !== 'all') qs.set('status', filterStatus);
      if (filterElection) qs.set('electionType', filterElection);
      // Managers only ever see submissions inside their own assigned scope
      // (national managers and admins see everything).
      if (!isOverride && myLevel) {
        const scopeParam = LEVEL_SCOPE_QUERY_PARAM[myLevel];
        if (scopeParam && electionUser?.scopeId) qs.set(scopeParam, electionUser.scopeId);
      }
      const data = await apiFetch<{ submissions: Submission[] }>('GET', `/data-entry/submissions?${qs}`);
      setSubmissions(data.submissions ?? []);
      setLastRefresh(new Date());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load submissions');
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterStatus, filterElection]);

  useEffect(() => { load(); }, [load]);

  const pending  = submissions.filter(s => s.status === 'pending').length;
  const verified = submissions.filter(s => s.status === 'verified').length;
  const approved = submissions.filter(s => s.status === 'approved').length;
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
            Review polling station results submitted by field agents. Each submission must clear ward → constituency →
            district → provincial → national approval in order before it counts toward Official Results.
          </p>
          {myLevel && !isOverride && (
            <p className="text-xs mt-1 flex items-center gap-1.5" style={{ color: '#7dd3fc' }}>
              <ShieldCheck className="w-3.5 h-3.5" />
              Signed in as {CHAIN_LABELS[myLevel]} Manager{electionUser?.scopeName ? ` — ${electionUser.scopeName}` : ''}
            </p>
          )}
          {isOverride && (
            <p className="text-xs mt-1 flex items-center gap-1.5" style={{ color: '#7dd3fc' }}>
              <ShieldCheck className="w-3.5 h-3.5" />
              Admin override — you can act at any level on any submission
            </p>
          )}
          {!myLevel && !isOverride && (
            <p className="text-xs mt-1 text-amber-400">
              Your account has no manager scope assigned, so you can view this queue but can't approve or reject.
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {lastRefresh && <span className="text-xs text-muted-foreground">Updated {lastRefresh.toLocaleTimeString()}</span>}
          <button onClick={load} className="p-2 rounded-lg border  hover: transition-colors" style={{ backgroundColor: "#0f2d4a", color: "#7dd3fc", border: "1px solid #3b82f6" }}>
            <RefreshCw className={`w-4 h-4 text-muted-foreground ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Summary pills */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: 'Pending Review', count: pending,  bg: 'bg-amber-50 border-amber-200',  text: 'text-amber-800' },
          { label: 'Partly Verified', count: verified, bg: 'bg-blue-50  border-blue-200',  text: 'text-blue-800' },
          { label: 'Official',        count: approved, bg: 'bg-green-50  border-green-200',  text: 'text-green-800' },
          { label: 'Queried',        count: queried,  bg: 'bg-sky-50   border-sky-200',   text: 'text-sky-800' },
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
          {(['all','pending','verified','approved','queried','rejected'] as const).map(s => (
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
          className="px-3 py-2 border  rounded-lg  text-sm focus:outline-none focus:ring-2 focus:ring-primary" style={{ backgroundColor: "#1e3a5f", color: "#ffffff", border: "1px solid #3b82f6" }}
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
                  <div className="h-4  rounded w-1/3" style={{ backgroundColor: "#0f2d4a", color: "#7dd3fc", border: "1px solid #3b82f6" }} />
                  <div className="h-3  rounded w-1/5" style={{ backgroundColor: "#0f2d4a", color: "#7dd3fc", border: "1px solid #3b82f6" }} />
                </div>
                <div className="h-6  rounded w-24" style={{ backgroundColor: "#0f2d4a", color: "#7dd3fc", border: "1px solid #3b82f6" }} />
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
            <SubmissionRow key={sub.id} sub={sub} myLevel={myLevel} isOverride={isOverride} onStatusChange={load} />
          ))}
        </div>
      )}
    </div>
  );
}


export { ResultsApprovalQueue as default };
