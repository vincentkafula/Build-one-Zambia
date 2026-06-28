/**
 * Poll-Place Ballot Scanning & Tabulation System
 * Admin-only. Inspired by ES&S DS300 precinct-count optical scanner workflow.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  ScanLine, Shield, FileCheck, CheckCircle2,
  Lock, Unlock, Send, Printer, RefreshCw, Plus, Trash2,
  BarChart3, Activity, Eye,
  Flag, Download, Search, Loader, BookOpen,
  Database, FileLock, Terminal, AlertOctagon
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


async function apiFetch<T>(method: string, path: string, body?: unknown): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await safeFetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || data.details || `HTTP ${res.status}`);
  return data as T;
}

// ─── Types ────────────────────────────────────────────────────────────────────

type ElectionType = 'presidential' | 'mp' | 'mayoral' | 'councillor';
type SessionStatus = 'open' | 'closed' | 'transmitted';
type BallotStatus = 'valid' | 'rejected' | 'blank' | 'overvote';

interface BallotCandidate {
  id: string; name: string; party: string; partyAbbr?: string; boxIndex: number;
}

interface BallotTemplate {
  id: string; electionType: ElectionType; electionYear: number;
  constituencyId?: string; constituencyName?: string;
  districtId?: string; provinceId?: string;
  candidates: BallotCandidate[];
  createdAt: string; createdBy: string; active: boolean;
}

interface ScanSession {
  id: string; templateId: string; electionType: ElectionType;
  pollingStationId: string; pollingStationName: string;
  provinceId: string; districtId: string; constituencyId: string; wardId: string;
  registeredVoters: number; status: SessionStatus;
  openedAt: string; closedAt?: string; transmittedAt?: string;
  operatorName: string; supervisorName?: string;
  ballotsScanned: number; validBallots: number; rejectedBallots: number;
  blankBallots: number; overvoteBallots: number;
  voteCounts: Record<string, number>;
  reportHash?: string; reportGeneratedAt?: string; notes?: string;
}

interface BallotRecord {
  id: string; sessionId: string; sequenceNumber: number; scannedAt: string;
  status: BallotStatus; candidateId?: string; candidateName?: string;
  confidence: number; imageThumbnail?: string; flagged: boolean; notes?: string;
}

interface AuditEntry {
  id: string; sessionId?: string; action: string; entity: string; entityId: string;
  performedBy: string; details?: string; prevHash: string; hash: string; timestamp: string;
}

interface SessionReport {
  session: ScanSession;
  candidates: (BallotCandidate & { votes: number; percentage: number })[];
  turnoutPercentage: number;
  winner?: BallotCandidate & { votes: number };
  generatedAt: string; reportId: string; digitalSignature: string;
}

interface Stats {
  totalSessions: number; openSessions: number; closedSessions: number;
  transmittedSessions: number; totalBallots: number; byElectionType: Record<string, number>;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const NAVY = '#0f1e35';
const DARK = '#1a2d45';
const ACCENT = '#0ea5e9';
const GREEN = '#10b981';
const AMBER = '#f59e0b';
const RED = '#ef4444';
const GOLD = '#c9a84c';

const ELECTION_TYPES: { value: ElectionType; label: string }[] = [
  { value: 'presidential', label: 'Presidential' },
  { value: 'mp',           label: 'Member of Parliament' },
  { value: 'mayoral',      label: 'Mayoral' },
  { value: 'councillor',   label: 'Councillor' },
];

const STATUS_COLORS: Record<SessionStatus, string> = {
  open: GREEN, closed: AMBER, transmitted: ACCENT,
};

const BALLOT_STATUS_COLORS: Record<BallotStatus, string> = {
  valid: GREEN, rejected: RED, blank: '#9ca3af', overvote: AMBER,
};

const BS = '/ballot-scan';

// ─── API helpers ──────────────────────────────────────────────────────────────

const api = {
  getStats: () => apiFetch<Stats>('GET', `${BS}/stats`),
  getTemplates: () => apiFetch<{ templates: BallotTemplate[] }>('GET', `${BS}/templates`),
  createTemplate: (d: object) => apiFetch<{ template: BallotTemplate }>('POST', `${BS}/templates`, d),
  deleteTemplate: (id: string) => apiFetch<{ success: boolean }>('DELETE', `${BS}/templates/${id}`, {}),
  getSessions: (params?: object) => {
    const qs = params ? '?' + new URLSearchParams(params as Record<string, string>).toString() : '';
    return apiFetch<{ sessions: ScanSession[] }>('GET', `${BS}/sessions${qs}`);
  },
  openSession: (d: object) => apiFetch<{ session: ScanSession }>('POST', `${BS}/sessions`, d),
  getSession: (id: string) => apiFetch<{ session: ScanSession; template: BallotTemplate }>('GET', `${BS}/sessions/${id}`),
  processBallot: (sid: string, d: object) => apiFetch<{ record: BallotRecord }>('POST', `${BS}/sessions/${sid}/ballot`, d),
  getBallots: (sid: string, flaggedOnly = false) => apiFetch<{ ballots: BallotRecord[] }>('GET', `${BS}/sessions/${sid}/ballots?flaggedOnly=${flaggedOnly}&limit=200`),
  closeSession: (id: string, d: object) => apiFetch<{ session: ScanSession }>('POST', `${BS}/sessions/${id}/close`, d),
  generateReport: (id: string) => apiFetch<{ report: SessionReport }>('POST', `${BS}/sessions/${id}/report`, {}),
  transmit: (id: string) => apiFetch<{ success: boolean }>('POST', `${BS}/sessions/${id}/transmit`, {}),
  flagBallot: (id: string, flagged: boolean, notes?: string) => apiFetch<{ success: boolean }>('PATCH', `${BS}/ballots/${id}/flag`, { flagged, notes }),
  getAudit: (sessionId?: string) => {
    const qs = sessionId ? `?sessionId=${sessionId}&limit=200` : '?limit=200';
    return apiFetch<{ entries: AuditEntry[] }>('GET', `${BS}/audit${qs}`);
  },
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({ label, value, sub, color = ACCENT }: { label: string; value: string | number; sub?: string; color?: string }) {
  return (
    <div style={{ padding: '18px 20px', backgroundColor: `${DARK}`, border: `1px solid ${color}30`, borderRadius: '10px', borderLeft: `3px solid ${color}` }}>
      <p style={{ fontSize: '11px', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.4)', fontFamily: 'Oswald, sans-serif', margin: '0 0 6px' }}>{label}</p>
      <p style={{ fontSize: '1.8rem', fontFamily: 'Oswald, sans-serif', color: '#fff', margin: '0 0 2px', lineHeight: 1 }}>{value}</p>
      {sub && <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', margin: 0 }}>{sub}</p>}
    </div>
  );
}

function Badge({ text, color }: { text: string; color: string }) {
  return (
    <span style={{ padding: '2px 10px', backgroundColor: `${color}20`, color, borderRadius: '20px', fontSize: '11px', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.06em', border: `1px solid ${color}40` }}>
      {text.toUpperCase()}
    </span>
  );
}

// ─── Ballot Canvas Renderer ───────────────────────────────────────────────────
// Renders a schematic ballot paper preview with candidate boxes

function BallotPreview({ candidates, markedId, onMark }: {
  candidates: BallotCandidate[];
  markedId?: string;
  onMark?: (id: string | null, status: BallotStatus) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width, H = canvas.height;
    const rowH = 52, headerH = 80, padding = 24;
    const totalH = headerH + candidates.length * rowH + 60;
    canvas.height = totalH;

    // Background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, W, totalH);

    // Border
    ctx.strokeStyle = '#111';
    ctx.lineWidth = 3;
    ctx.strokeRect(8, 8, W - 16, totalH - 16);
    ctx.strokeRect(12, 12, W - 24, totalH - 24);

    // Header
    ctx.fillStyle = '#0f1e35';
    ctx.fillRect(20, 20, W - 40, 55);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 13px Oswald, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('BUILD ONE ZAMBIA PARTY — OFFICIAL BALLOT', W / 2, 40);
    ctx.font = '11px sans-serif';
    ctx.fillStyle = '#ccc';
    ctx.fillText('MARK ONLY ONE BOX WITH A ✓ OR ✗', W / 2, 60);

    // Candidates
    candidates.forEach((c, i) => {
      const y = headerH + i * rowH;
      const isMarked = c.id === markedId;

      // Row bg
      ctx.fillStyle = isMarked ? '#f0fdf4' : (i % 2 === 0 ? '#fafafa' : '#f3f4f6');
      ctx.fillRect(20, y, W - 40, rowH - 2);

      // Mark box
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 2;
      ctx.strokeRect(32, y + 10, 30, 30);

      if (isMarked) {
        ctx.strokeStyle = GREEN;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(37, y + 28);
        ctx.lineTo(45, y + 35);
        ctx.lineTo(57, y + 16);
        ctx.stroke();
      }

      // Candidate name
      ctx.fillStyle = '#111';
      ctx.font = 'bold 13px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(c.name, 78, y + 22);

      // Party
      ctx.fillStyle = '#555';
      ctx.font = '11px sans-serif';
      ctx.fillText(c.party, 78, y + 38);

      // Box number
      ctx.fillStyle = '#999';
      ctx.font = '10px monospace';
      ctx.textAlign = 'right';
      ctx.fillText(`#${i + 1}`, W - 30, y + 28);
    });

    // Footer strip
    const fy = headerH + candidates.length * rowH + 8;
    ctx.fillStyle = '#e5e7eb';
    ctx.fillRect(20, fy, W - 40, 30);
    ctx.fillStyle = '#6b7280';
    ctx.font = '9px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('OFFICIAL USE ONLY — DO NOT MARK BELOW THIS LINE', W / 2, fy + 18);

  }, [candidates, markedId]);

  useEffect(() => { draw(); }, [draw]);

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!onMark) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleY = canvas.height / rect.height;
    const y = (e.clientY - rect.top) * scaleY;
    const headerH = 80, rowH = 52;
    const idx = Math.floor((y - headerH) / rowH);
    if (idx >= 0 && idx < candidates.length) {
      const c = candidates[idx];
      if (c.id === markedId) {
        onMark(null, 'blank');
      } else {
        onMark(c.id, 'valid');
      }
    }
  };

  return (
    <canvas
      ref={canvasRef}
      width={480}
      onClick={handleClick}
      style={{ width: '100%', maxWidth: '480px', border: '1px solid #e5e7eb', borderRadius: '4px', cursor: onMark ? 'pointer' : 'default', display: 'block', margin: '0 auto' }}
    />
  );
}

// ─── Scanner Animation ─────────────────────────────────────────────────────────

function ScannerAnimation({ active }: { active: boolean }) {
  return (
    <div style={{ position: 'relative', width: '100%', height: '80px', backgroundColor: '#0a1628', borderRadius: '8px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
        {[1,2,3,4,5].map(i => (
          <div key={i} style={{
            width: '120px', height: '2px',
            backgroundColor: active ? `rgba(14,165,233,${0.3 + i * 0.1})` : 'rgba(255,255,255,0.08)',
            animation: active ? `scanline 0.8s ease-in-out infinite ${i * 0.1}s` : 'none',
            borderRadius: '2px',
          }} />
        ))}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
        <ScanLine size={28} color={active ? ACCENT : 'rgba(255,255,255,0.2)'} />
        <p style={{ fontFamily: 'Oswald, sans-serif', fontSize: '10px', letterSpacing: '0.12em', color: active ? ACCENT : 'rgba(255,255,255,0.3)', margin: 0 }}>
          {active ? 'SCANNING…' : 'READY'}
        </p>
      </div>
      <style>{`
        @keyframes scanline {
          0%,100% { transform: scaleX(0.6); opacity: 0.3; }
          50% { transform: scaleX(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

type Tab = 'dashboard' | 'templates' | 'sessions' | 'scanner' | 'audit' | 'help';

export function BallotScanSystem() {
  const [tab, setTab] = useState<Tab>('dashboard');
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => { loadStats(); }, []);

  async function loadStats() {
    try {
      const s = await api.getStats();
      setStats(s);
    } catch { /* ignore */ }
  }

  const TABS: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'dashboard', label: 'Dashboard',  icon: <Activity size={15} /> },
    { key: 'templates', label: 'Ballot Templates', icon: <FileCheck size={15} /> },
    { key: 'sessions',  label: 'Poll Sessions', icon: <Database size={15} /> },
    { key: 'scanner',   label: 'Scanner Interface', icon: <ScanLine size={15} /> },
    { key: 'audit',     label: 'Audit Log', icon: <FileLock size={15} /> },
    { key: 'help',      label: 'System Guide', icon: <BookOpen size={15} /> },
  ];

  return (
    <div style={{ backgroundColor: NAVY, minHeight: '600px', borderRadius: '12px', overflow: 'hidden', color: '#fff' }}>
      {/* Header */}
      <div style={{ padding: '20px 28px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: '14px', background: 'linear-gradient(135deg, #0f1e35, #1a2d45)' }}>
        <div style={{ width: '44px', height: '44px', backgroundColor: `${ACCENT}20`, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${ACCENT}40` }}>
          <ScanLine size={22} color={ACCENT} />
        </div>
        <div>
          <h2 style={{ fontFamily: 'Oswald, sans-serif', fontSize: '1.3rem', margin: 0, letterSpacing: '0.1em', color: '#fff' }}>
            BALLOT SCANNING & TABULATION SYSTEM
          </h2>
          <p style={{ margin: '2px 0 0', fontSize: '11px', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.06em' }}>
            PRECINCT-COUNT OPTICAL SCANNER — ADMIN ACCESS ONLY · DS300 COMPATIBLE
          </p>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: GREEN, boxShadow: `0 0 6px ${GREEN}` }} />
          <span style={{ fontSize: '11px', color: GREEN, fontFamily: 'Oswald, sans-serif', letterSpacing: '0.08em' }}>SYSTEM ONLINE</span>
        </div>
      </div>

      {/* Nav tabs */}
      <div style={{ display: 'flex', gap: '2px', padding: '0 28px', borderBottom: '1px solid rgba(255,255,255,0.08)', overflowX: 'auto' }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            padding: '12px 16px', border: 'none', background: 'none', cursor: 'pointer',
            color: tab === t.key ? ACCENT : 'rgba(255,255,255,0.4)',
            borderBottom: tab === t.key ? `2px solid ${ACCENT}` : '2px solid transparent',
            fontFamily: 'Oswald, sans-serif', fontSize: '12px', letterSpacing: '0.08em',
            display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap',
            transition: 'color 0.15s',
          }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ padding: '28px' }}>
        {tab === 'dashboard' && <DashboardTab stats={stats} onRefresh={loadStats} />}
        {tab === 'templates' && <TemplatesTab onRefresh={loadStats} />}
        {tab === 'sessions'  && <SessionsTab onRefresh={loadStats} onOpenScanner={() => setTab('scanner')} />}
        {tab === 'scanner'   && <ScannerTab onRefresh={loadStats} />}
        {tab === 'audit'     && <AuditTab />}
        {tab === 'help'      && <HelpTab />}
      </div>
      {loading && <div style={{ display: 'none' }} />}
    </div>
  );
}

// ─── Dashboard Tab ────────────────────────────────────────────────────────────

function DashboardTab({ stats, onRefresh }: { stats: Stats | null; onRefresh: () => void }) {
  const [sessions, setSessions] = useState<ScanSession[]>([]);

  useEffect(() => {
    api.getSessions().then(r => setSessions(r.sessions)).catch(() => {});
  }, []);

  const openSessions = sessions.filter(s => s.status === 'open');

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h3 style={{ fontFamily: 'Oswald, sans-serif', fontSize: '1rem', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.6)', margin: 0 }}>SYSTEM STATUS</h3>
        <button onClick={onRefresh} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 14px', backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '7px', color: 'rgba(255,255,255,0.6)', fontSize: '12px', cursor: 'pointer', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.06em' }}>
          <RefreshCw size={13} /> REFRESH
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '14px', marginBottom: '28px' }}>
        <StatCard label="TOTAL SESSIONS" value={stats?.totalSessions ?? 0} color={ACCENT} />
        <StatCard label="OPEN POLLS" value={stats?.openSessions ?? 0} color={GREEN} />
        <StatCard label="CLOSED" value={stats?.closedSessions ?? 0} color={AMBER} />
        <StatCard label="TRANSMITTED" value={stats?.transmittedSessions ?? 0} color={ACCENT} />
        <StatCard label="TOTAL BALLOTS" value={stats?.totalBallots ?? 0} color={GOLD} sub="processed" />
      </div>

      {/* Live open sessions */}
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ fontFamily: 'Oswald, sans-serif', fontSize: '13px', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.5)', margin: '0 0 14px' }}>
          LIVE OPEN POLL SESSIONS ({openSessions.length})
        </h3>
        {openSessions.length === 0 ? (
          <div style={{ padding: '28px', textAlign: 'center', border: '1px dashed rgba(255,255,255,0.12)', borderRadius: '10px', color: 'rgba(255,255,255,0.3)' }}>
            <Database size={28} style={{ marginBottom: '8px', opacity: 0.3 }} />
            <p style={{ margin: 0, fontSize: '13px' }}>No open poll sessions</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {openSessions.map(s => (
              <OpenSessionCard key={s.id} session={s} />
            ))}
          </div>
        )}
      </div>

      {/* By election type */}
      {stats?.byElectionType && Object.keys(stats.byElectionType).length > 0 && (
        <div>
          <h3 style={{ fontFamily: 'Oswald, sans-serif', fontSize: '13px', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.5)', margin: '0 0 14px' }}>SESSIONS BY ELECTION TYPE</h3>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {Object.entries(stats.byElectionType).map(([type, count]) => (
              <div key={type} style={{ padding: '10px 18px', backgroundColor: `${DARK}`, border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}>
                <p style={{ fontSize: '10px', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.35)', margin: '0 0 4px', fontFamily: 'Oswald, sans-serif' }}>{type.toUpperCase()}</p>
                <p style={{ fontSize: '1.5rem', fontFamily: 'Oswald, sans-serif', color: '#fff', margin: 0 }}>{count}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function OpenSessionCard({ session }: { session: ScanSession }) {
  const turnout = session.registeredVoters > 0
    ? Math.round((session.ballotsScanned / session.registeredVoters) * 1000) / 10
    : 0;
  return (
    <div style={{ padding: '14px 18px', backgroundColor: DARK, border: `1px solid ${GREEN}30`, borderRadius: '10px', borderLeft: `3px solid ${GREEN}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <div style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: GREEN, animation: 'pulse 2s infinite' }} />
          <p style={{ fontFamily: 'Oswald, sans-serif', fontSize: '14px', color: '#fff', margin: 0 }}>{session.pollingStationName}</p>
          <Badge text={session.electionType} color={ACCENT} />
        </div>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', margin: 0 }}>
          {session.ballotsScanned} ballots scanned · {turnout}% turnout · Operator: {session.operatorName}
        </p>
      </div>
      <div style={{ textAlign: 'right' }}>
        <p style={{ fontFamily: 'Oswald, sans-serif', fontSize: '1.3rem', color: GREEN, margin: 0 }}>{session.ballotsScanned}</p>
        <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', margin: 0 }}>BALLOTS</p>
      </div>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
    </div>
  );
}

// ─── Templates Tab ────────────────────────────────────────────────────────────

function TemplatesTab({ onRefresh }: { onRefresh: () => void }) {
  const [templates, setTemplates] = useState<BallotTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [preview, setPreview] = useState<BallotTemplate | null>(null);

  // Create form
  const [electionType, setElectionType] = useState<ElectionType>('presidential');
  const [year, setYear] = useState(new Date().getFullYear());
  const [constituency, setConstituency] = useState('');
  const [candidates, setCandidates] = useState<{ name: string; party: string; partyAbbr: string }[]>([
    { name: '', party: '', partyAbbr: '' },
    { name: '', party: '', partyAbbr: '' },
  ]);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const r = await api.getTemplates();
      setTemplates(r.templates.filter(t => t.active));
    } catch { /* ignore */ }
    setLoading(false);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const filled = candidates.filter(c => c.name.trim() && c.party.trim());
    if (filled.length < 2) { setErr('At least 2 candidates required.'); return; }
    setSaving(true); setErr('');
    try {
      await api.createTemplate({
        electionType, electionYear: year,
        constituencyName: constituency || undefined,
        candidates: filled.map((c, i) => ({ id: `cand_${i}`, ...c, boxIndex: i })),
      });
      setShowCreate(false);
      setCandidates([{ name: '', party: '', partyAbbr: '' }, { name: '', party: '', partyAbbr: '' }]);
      setConstituency('');
      await load();
      onRefresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Failed to create template');
    }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    if (!confirm('Deactivate this ballot template?')) return;
    await api.deleteTemplate(id);
    await load();
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h3 style={{ fontFamily: 'Oswald, sans-serif', fontSize: '1rem', color: '#fff', margin: '0 0 4px', letterSpacing: '0.08em' }}>BALLOT TEMPLATES</h3>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', margin: 0 }}>Define candidate lists and mark regions for each election</p>
        </div>
        <button onClick={() => setShowCreate(v => !v)} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 18px', backgroundColor: ACCENT, color: '#fff', border: 'none', borderRadius: '8px', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.08em', fontSize: '13px', cursor: 'pointer' }}>
          <Plus size={15} /> NEW TEMPLATE
        </button>
      </div>

      {/* Create form */}
      {showCreate && (
        <div style={{ padding: '20px', backgroundColor: DARK, border: `1px solid ${ACCENT}30`, borderRadius: '10px', marginBottom: '20px' }}>
          <h4 style={{ fontFamily: 'Oswald, sans-serif', letterSpacing: '0.08em', color: ACCENT, margin: '0 0 16px' }}>CREATE BALLOT TEMPLATE</h4>
          <form onSubmit={handleCreate}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginBottom: '5px', letterSpacing: '0.06em' }}>ELECTION TYPE *</label>
                <select value={electionType} onChange={e => setElectionType(e.target.value as ElectionType)} style={{ width: '100%', padding: '8px 10px', backgroundColor: '#0a1628', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '7px', color: '#fff', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}>
                  {ELECTION_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginBottom: '5px', letterSpacing: '0.06em' }}>ELECTION YEAR *</label>
                <input type="number" value={year} onChange={e => setYear(parseInt(e.target.value))} min={2020} max={2050} required style={{ width: '100%', padding: '8px 10px', backgroundColor: '#0a1628', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '7px', color: '#fff', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} />
              </div>
              {electionType !== 'presidential' && (
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginBottom: '5px', letterSpacing: '0.06em' }}>CONSTITUENCY / AREA</label>
                  <input value={constituency} onChange={e => setConstituency(e.target.value)} placeholder="e.g. Kabulonga Constituency" style={{ width: '100%', padding: '8px 10px', backgroundColor: '#0a1628', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '7px', color: '#fff', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} />
                </div>
              )}
            </div>

            <p style={{ fontSize: '11px', letterSpacing: '0.06em', color: 'rgba(255,255,255,0.5)', margin: '0 0 10px' }}>CANDIDATES (minimum 2)</p>
            {candidates.map((c, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 80px 36px', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
                <input placeholder={`Candidate ${i + 1} name`} value={c.name} onChange={e => { const nc = [...candidates]; nc[i].name = e.target.value; setCandidates(nc); }}
                  style={{ padding: '7px 10px', backgroundColor: '#0a1628', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '6px', color: '#fff', fontSize: '12px', outline: 'none' }} />
                <input placeholder="Party name" value={c.party} onChange={e => { const nc = [...candidates]; nc[i].party = e.target.value; setCandidates(nc); }}
                  style={{ padding: '7px 10px', backgroundColor: '#0a1628', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '6px', color: '#fff', fontSize: '12px', outline: 'none' }} />
                <input placeholder="Abbr." value={c.partyAbbr} onChange={e => { const nc = [...candidates]; nc[i].partyAbbr = e.target.value; setCandidates(nc); }}
                  style={{ padding: '7px 10px', backgroundColor: '#0a1628', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '6px', color: '#fff', fontSize: '12px', outline: 'none' }} />
                <button type="button" onClick={() => setCandidates(candidates.filter((_, j) => j !== i))} style={{ width: '36px', height: '34px', backgroundColor: `${RED}20`, border: `1px solid ${RED}40`, borderRadius: '6px', color: RED, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
            <button type="button" onClick={() => setCandidates([...candidates, { name: '', party: '', partyAbbr: '' }])}
              style={{ padding: '6px 14px', backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: 'rgba(255,255,255,0.5)', fontSize: '12px', cursor: 'pointer', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Plus size={12} /> Add Candidate
            </button>

            {err && <p style={{ color: RED, fontSize: '12px', marginBottom: '10px' }}>{err}</p>}
            <button type="submit" disabled={saving} style={{ padding: '10px 24px', backgroundColor: ACCENT, color: '#fff', border: 'none', borderRadius: '8px', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.08em', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '7px' }}>
              {saving ? <Loader size={14} /> : <FileCheck size={14} />} CREATE TEMPLATE
            </button>
          </form>
        </div>
      )}

      {/* Template list */}
      {loading ? <div style={{ textAlign: 'center', padding: '40px', color: 'rgba(255,255,255,0.3)' }}><Loader size={24} /></div> : (
        templates.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', border: '1px dashed rgba(255,255,255,0.12)', borderRadius: '10px', color: 'rgba(255,255,255,0.3)' }}>
            <FileCheck size={28} style={{ marginBottom: '8px', opacity: 0.3 }} />
            <p style={{ margin: 0 }}>No ballot templates yet. Create one above.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {templates.map(t => (
              <div key={t.id} style={{ backgroundColor: DARK, border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', overflow: 'hidden' }}>
                <div style={{ padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <Badge text={t.electionType} color={ACCENT} />
                      <Badge text={String(t.electionYear)} color={GOLD} />
                      {t.constituencyName && <Badge text={t.constituencyName} color={'rgba(255,255,255,0.3)'} />}
                    </div>
                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', margin: 0 }}>{t.candidates.length} candidates · Created by {t.createdBy} · {new Date(t.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => setPreview(preview?.id === t.id ? null : t)} style={{ padding: '6px 12px', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: 'rgba(255,255,255,0.6)', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <Eye size={12} /> Preview
                    </button>
                    <button onClick={() => handleDelete(t.id)} style={{ padding: '6px 12px', backgroundColor: `${RED}15`, border: `1px solid ${RED}30`, borderRadius: '6px', color: RED, fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <Trash2 size={12} /> Remove
                    </button>
                  </div>
                </div>
                {preview?.id === t.id && (
                  <div style={{ padding: '16px', borderTop: '1px solid rgba(255,255,255,0.06)', backgroundColor: '#fff' }}>
                    <BallotPreview candidates={t.candidates} />
                  </div>
                )}
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}

// ─── Sessions Tab ─────────────────────────────────────────────────────────────

function SessionsTab({ onRefresh, onOpenScanner }: { onRefresh: () => void; onOpenScanner: () => void }) {
  const [sessions, setSessions] = useState<ScanSession[]>([]);
  const [templates, setTemplates] = useState<BallotTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedSession, setSelectedSession] = useState<ScanSession | null>(null);
  const [report, setReport] = useState<SessionReport | null>(null);
  const [reportLoading, setReportLoading] = useState(false);

  // Open session form
  const [templateId, setTemplateId] = useState('');
  const [stationId, setStationId] = useState('');
  const [stationName, setStationName] = useState('');
  const [provinceId, setProvinceId] = useState('');
  const [districtId, setDistrictId] = useState('');
  const [constituencyId, setConstituencyId] = useState('');
  const [wardId, setWardId] = useState('');
  const [regVoters, setRegVoters] = useState('');
  const [operatorName, setOperatorName] = useState('');
  const [supervisorName, setSupervisorName] = useState('');
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const [sr, tr] = await Promise.all([api.getSessions(), api.getTemplates()]);
      setSessions(sr.sessions);
      setTemplates(tr.templates.filter(t => t.active));
    } catch { /* ignore */ }
    setLoading(false);
  }

  async function handleOpen(e: React.FormEvent) {
    e.preventDefault();
    if (!templateId) { setErr('Select a ballot template'); return; }
    setSaving(true); setErr('');
    try {
      await api.openSession({
        templateId, pollingStationId: stationId, pollingStationName: stationName,
        provinceId, districtId, constituencyId, wardId,
        registeredVoters: parseInt(regVoters) || 0, operatorName, supervisorName,
      });
      setShowCreate(false);
      await load(); onRefresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Failed to open session');
    }
    setSaving(false);
  }

  async function handleClose(session: ScanSession) {
    if (!confirm(`Close poll at ${session.pollingStationName}?`)) return;
    try {
      await api.closeSession(session.id, { supervisorName: session.supervisorName });
      await load(); onRefresh();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Failed');
    }
  }

  async function handleReport(session: ScanSession) {
    setReportLoading(true);
    try {
      const r = await api.generateReport(session.id);
      setReport(r.report);
      setSelectedSession(session);
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Failed to generate report');
    }
    setReportLoading(false);
  }

  async function handleTransmit(session: ScanSession) {
    if (!confirm(`Mark results for ${session.pollingStationName} as transmitted?`)) return;
    await api.transmit(session.id);
    await load(); onRefresh();
  }

  const input = (label: string, value: string, onChange: (v: string) => void, placeholder = '') => (
    <div>
      <label style={{ display: 'block', fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginBottom: '5px', letterSpacing: '0.06em' }}>{label}</label>
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        style={{ width: '100%', padding: '8px 10px', backgroundColor: '#0a1628', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '6px', color: '#fff', fontSize: '12px', outline: 'none', boxSizing: 'border-box' }} />
    </div>
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ fontFamily: 'Oswald, sans-serif', fontSize: '1rem', color: '#fff', margin: 0, letterSpacing: '0.08em' }}>POLL SESSIONS</h3>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={onOpenScanner} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 16px', backgroundColor: `${GREEN}20`, border: `1px solid ${GREEN}40`, borderRadius: '8px', color: GREEN, fontFamily: 'Oswald, sans-serif', letterSpacing: '0.07em', fontSize: '12px', cursor: 'pointer' }}>
            <ScanLine size={14} /> OPEN SCANNER
          </button>
          <button onClick={() => setShowCreate(v => !v)} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 16px', backgroundColor: ACCENT, color: '#fff', border: 'none', borderRadius: '8px', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.07em', fontSize: '12px', cursor: 'pointer' }}>
            <Unlock size={14} /> OPEN NEW SESSION
          </button>
        </div>
      </div>

      {showCreate && (
        <div style={{ padding: '20px', backgroundColor: DARK, border: `1px solid ${GREEN}30`, borderRadius: '10px', marginBottom: '20px' }}>
          <h4 style={{ fontFamily: 'Oswald, sans-serif', color: GREEN, margin: '0 0 16px', letterSpacing: '0.08em' }}>OPEN POLL SESSION</h4>
          <form onSubmit={handleOpen}>
            <div style={{ marginBottom: '10px' }}>
              <label style={{ display: 'block', fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginBottom: '5px', letterSpacing: '0.06em' }}>BALLOT TEMPLATE *</label>
              <select value={templateId} onChange={e => setTemplateId(e.target.value)} required style={{ width: '100%', padding: '8px 10px', backgroundColor: '#0a1628', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '6px', color: '#fff', fontSize: '12px', outline: 'none', boxSizing: 'border-box' }}>
                <option value="">Select template…</option>
                {templates.map(t => <option key={t.id} value={t.id}>{t.electionType.toUpperCase()} {t.electionYear} {t.constituencyName ? `· ${t.constituencyName}` : ''}</option>)}
              </select>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
              {input('POLLING STATION ID *', stationId, setStationId, 'e.g. PS-0001')}
              {input('POLLING STATION NAME *', stationName, setStationName, 'e.g. Kabulonga Primary School')}
              {input('PROVINCE', provinceId, setProvinceId, 'e.g. Lusaka')}
              {input('DISTRICT', districtId, setDistrictId, 'e.g. Lusaka District')}
              {input('CONSTITUENCY', constituencyId, setConstituencyId, 'e.g. Kabulonga')}
              {input('WARD', wardId, setWardId, 'e.g. Ward 4')}
              {input('REGISTERED VOTERS', regVoters, setRegVoters, '0')}
              {input('OPERATOR NAME *', operatorName, setOperatorName, 'Polling officer name')}
              {input('SUPERVISOR NAME', supervisorName, setSupervisorName, 'Supervisor / presiding officer')}
            </div>
            {err && <p style={{ color: RED, fontSize: '12px', marginBottom: '10px' }}>{err}</p>}
            <button type="submit" disabled={saving} style={{ padding: '10px 24px', backgroundColor: GREEN, color: '#fff', border: 'none', borderRadius: '8px', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.08em', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '7px' }}>
              {saving ? <Loader size={14} /> : <Unlock size={14} />} OPEN SESSION
            </button>
          </form>
        </div>
      )}

      {/* Report modal */}
      {report && selectedSession && (
        <ReportModal report={report} session={selectedSession} onClose={() => { setReport(null); setSelectedSession(null); }} onTransmit={() => handleTransmit(selectedSession)} />
      )}

      {loading ? <div style={{ textAlign: 'center', padding: '40px', color: 'rgba(255,255,255,0.3)' }}><Loader size={24} /></div> : (
        sessions.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', border: '1px dashed rgba(255,255,255,0.12)', borderRadius: '10px', color: 'rgba(255,255,255,0.3)' }}>
            <Database size={28} style={{ marginBottom: '8px', opacity: 0.3 }} />
            <p style={{ margin: 0 }}>No poll sessions yet.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {sessions.map(s => (
              <div key={s.id} style={{ backgroundColor: DARK, border: `1px solid ${STATUS_COLORS[s.status]}25`, borderRadius: '10px', overflow: 'hidden' }}>
                <div style={{ padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', borderLeft: `3px solid ${STATUS_COLORS[s.status]}` }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
                      <p style={{ fontFamily: 'Oswald, sans-serif', fontSize: '14px', color: '#fff', margin: 0 }}>{s.pollingStationName}</p>
                      <Badge text={s.status} color={STATUS_COLORS[s.status]} />
                      <Badge text={s.electionType} color={ACCENT} />
                    </div>
                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', margin: 0 }}>
                      {s.ballotsScanned} scanned · {s.validBallots} valid · {s.rejectedBallots} rejected · {s.blankBallots} blank
                    </p>
                    <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '10px', margin: '2px 0 0' }}>
                      Opened: {new Date(s.openedAt).toLocaleString()} · Op: {s.operatorName}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                    {s.status === 'open' && (
                      <button onClick={() => handleClose(s)} style={{ padding: '6px 12px', backgroundColor: `${AMBER}20`, border: `1px solid ${AMBER}40`, borderRadius: '6px', color: AMBER, fontSize: '11px', cursor: 'pointer', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Lock size={11} /> CLOSE POLL
                      </button>
                    )}
                    {(s.status === 'closed' || s.status === 'transmitted') && (
                      <button onClick={() => handleReport(s)} disabled={reportLoading} style={{ padding: '6px 12px', backgroundColor: `${ACCENT}20`, border: `1px solid ${ACCENT}40`, borderRadius: '6px', color: ACCENT, fontSize: '11px', cursor: 'pointer', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <FileCheck size={11} /> REPORT
                      </button>
                    )}
                    {s.status === 'closed' && s.reportHash && (
                      <button onClick={() => handleTransmit(s)} style={{ padding: '6px 12px', backgroundColor: `${GREEN}20`, border: `1px solid ${GREEN}40`, borderRadius: '6px', color: GREEN, fontSize: '11px', cursor: 'pointer', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Send size={11} /> TRANSMIT
                      </button>
                    )}
                    {s.reportHash && (
                      <div style={{ padding: '5px 10px', backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <Shield size={11} color={GREEN} />
                        <span style={{ fontSize: '9px', fontFamily: 'monospace', color: GREEN }}>{s.reportHash.slice(0, 12)}…</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}

// ─── Report Modal ─────────────────────────────────────────────────────────────

function ReportModal({ report, session, onClose, onTransmit }: {
  report: SessionReport;
  session: ScanSession;
  onClose: () => void;
  onTransmit: () => void;
}) {
  const totalVotes = report.candidates.reduce((s, c) => s + c.votes, 0);

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ backgroundColor: '#fff', borderRadius: '12px', width: '100%', maxWidth: '620px', maxHeight: '90vh', overflow: 'auto' }}>
        <div id="ballot-report-print" style={{ padding: '32px' }}>
          {/* Report header */}
          <div style={{ textAlign: 'center', marginBottom: '24px', paddingBottom: '20px', borderBottom: '2px solid #0f1e35' }}>
            <p style={{ fontFamily: 'Oswald, sans-serif', fontSize: '10px', letterSpacing: '0.2em', color: '#666', margin: '0 0 4px' }}>BUILD ONE ZAMBIA — OFFICIAL RESULTS</p>
            <h2 style={{ fontFamily: 'Oswald, sans-serif', fontSize: '1.5rem', color: NAVY, margin: '0 0 4px', letterSpacing: '0.08em' }}>POLL RESULTS REPORT</h2>
            <p style={{ fontSize: '12px', color: '#666', margin: 0 }}>{session.pollingStationName}</p>
          </div>

          {/* Meta */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px', fontSize: '12px' }}>
            {[
              ['Report ID', report.reportId],
              ['Station ID', session.pollingStationId],
              ['Election Type', session.electionType.toUpperCase()],
              ['Opened', new Date(session.openedAt).toLocaleString()],
              ['Closed', session.closedAt ? new Date(session.closedAt).toLocaleString() : '—'],
              ['Operator', session.operatorName],
              ['Supervisor', session.supervisorName || '—'],
              ['Registered Voters', session.registeredVoters.toLocaleString()],
            ].map(([l, v]) => (
              <div key={l} style={{ padding: '8px 12px', backgroundColor: '#f8fafc', borderRadius: '6px' }}>
                <p style={{ fontSize: '10px', color: '#9ca3af', margin: '0 0 2px', letterSpacing: '0.06em' }}>{l}</p>
                <p style={{ fontSize: '12px', color: NAVY, margin: 0, fontWeight: 600 }}>{v}</p>
              </div>
            ))}
          </div>

          {/* Turnout */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '20px' }}>
            {[
              { l: 'TOTAL SCANNED', v: session.ballotsScanned, c: NAVY },
              { l: 'VALID', v: session.validBallots, c: GREEN },
              { l: 'REJECTED', v: session.rejectedBallots, c: RED },
              { l: 'BLANK', v: session.blankBallots, c: '#9ca3af' },
            ].map(({ l, v, c }) => (
              <div key={l} style={{ textAlign: 'center', padding: '10px', border: `2px solid ${c}20`, borderRadius: '8px' }}>
                <p style={{ fontSize: '1.4rem', fontFamily: 'Oswald, sans-serif', color: c, margin: '0 0 2px' }}>{v}</p>
                <p style={{ fontSize: '9px', letterSpacing: '0.08em', color: '#9ca3af', margin: 0 }}>{l}</p>
              </div>
            ))}
          </div>

          <div style={{ padding: '8px 14px', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', marginBottom: '20px', display: 'flex', gap: '16px' }}>
            <div>
              <p style={{ fontSize: '10px', color: '#3b82f6', margin: '0 0 2px', letterSpacing: '0.06em' }}>TURNOUT</p>
              <p style={{ fontFamily: 'Oswald, sans-serif', fontSize: '1.5rem', color: NAVY, margin: 0 }}>{report.turnoutPercentage}%</p>
            </div>
            {report.winner && (
              <div style={{ borderLeft: '1px solid #bfdbfe', paddingLeft: '16px' }}>
                <p style={{ fontSize: '10px', color: '#3b82f6', margin: '0 0 2px', letterSpacing: '0.06em' }}>LEADING CANDIDATE</p>
                <p style={{ fontFamily: 'Oswald, sans-serif', fontSize: '1.1rem', color: NAVY, margin: 0 }}>{report.winner.name}</p>
              </div>
            )}
          </div>

          {/* Results table */}
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
            <thead>
              <tr style={{ backgroundColor: NAVY }}>
                {['#', 'CANDIDATE', 'PARTY', 'VOTES', '%', 'BAR'].map(h => (
                  <th key={h} style={{ padding: '8px 10px', color: '#fff', fontSize: '10px', letterSpacing: '0.1em', textAlign: 'left', fontFamily: 'Oswald, sans-serif' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {report.candidates.map((c, i) => (
                <tr key={c.id} style={{ borderBottom: '1px solid #e5e7eb', backgroundColor: i === 0 ? '#f0fdf4' : '#fff' }}>
                  <td style={{ padding: '10px', fontSize: '12px', color: '#9ca3af' }}>{i + 1}</td>
                  <td style={{ padding: '10px', fontSize: '13px', fontWeight: 700, color: NAVY }}>{c.name}</td>
                  <td style={{ padding: '10px', fontSize: '11px', color: '#6b7280' }}>{c.party}</td>
                  <td style={{ padding: '10px', fontSize: '13px', fontFamily: 'Oswald, sans-serif', color: NAVY }}>{c.votes.toLocaleString()}</td>
                  <td style={{ padding: '10px', fontSize: '13px', fontFamily: 'Oswald, sans-serif', color: i === 0 ? GREEN : NAVY }}>{c.percentage}%</td>
                  <td style={{ padding: '10px', minWidth: '80px' }}>
                    <div style={{ height: '10px', backgroundColor: '#e5e7eb', borderRadius: '5px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${totalVotes > 0 ? (c.votes / totalVotes) * 100 : 0}%`, backgroundColor: i === 0 ? GREEN : ACCENT, borderRadius: '5px' }} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Digital signature */}
          <div style={{ padding: '12px 16px', backgroundColor: '#f8fafc', border: '1px solid #e5e7eb', borderRadius: '8px', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
            <Shield size={18} color={GREEN} style={{ flexShrink: 0, marginTop: '1px' }} />
            <div>
              <p style={{ fontSize: '11px', fontWeight: 700, color: NAVY, margin: '0 0 3px', letterSpacing: '0.06em' }}>DIGITAL SIGNATURE (SHA-256)</p>
              <p style={{ fontSize: '10px', fontFamily: 'monospace', color: '#6b7280', margin: '0 0 2px', wordBreak: 'break-all' }}>{report.digitalSignature}</p>
              <p style={{ fontSize: '10px', color: '#9ca3af', margin: 0 }}>Generated: {new Date(report.generatedAt).toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div style={{ padding: '16px 24px', borderTop: '1px solid #e5e7eb', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button onClick={() => window.print()} style={{ padding: '8px 18px', border: '1px solid #e5e7eb', borderRadius: '7px', backgroundColor: '#fff', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', color: NAVY, fontFamily: 'Oswald, sans-serif', letterSpacing: '0.06em' }}>
            <Printer size={14} /> PRINT
          </button>
          {session.status === 'closed' && (
            <button onClick={() => { onTransmit(); onClose(); }} style={{ padding: '8px 18px', backgroundColor: GREEN, color: '#fff', border: 'none', borderRadius: '7px', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.06em' }}>
              <Send size={14} /> TRANSMIT RESULTS
            </button>
          )}
          <button onClick={onClose} style={{ padding: '8px 18px', backgroundColor: NAVY, color: '#fff', border: 'none', borderRadius: '7px', fontSize: '13px', cursor: 'pointer' }}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Scanner Interface Tab ────────────────────────────────────────────────────

function ScannerTab({ onRefresh }: { onRefresh: () => void }) {
  const [sessions, setSessions] = useState<ScanSession[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [sessionData, setSessionData] = useState<{ session: ScanSession; template: BallotTemplate } | null>(null);
  const [ballots, setBallots] = useState<BallotRecord[]>([]);
  const [scanning, setScanning] = useState(false);
  const [markedCandidateId, setMarkedCandidateId] = useState<string | null>(null);
  const [scanStatus, setScanStatus] = useState<BallotStatus>('valid');
  const [confidence, setConfidence] = useState(95);
  const [scanNote, setScanNote] = useState('');
  const [scanResult, setScanResult] = useState<{ id: string; seq: number } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [imageB64, setImageB64] = useState<string | null>(null);
  const [filterFlagged, setFilterFlagged] = useState(false);

  useEffect(() => {
    api.getSessions({ status: 'open' }).then(r => setSessions(r.sessions)).catch(() => {});
  }, []);

  async function loadSession(id: string) {
    if (!id) { setSessionData(null); return; }
    try {
      const r = await api.getSession(id);
      setSessionData(r);
      const br = await api.getBallots(id);
      setBallots(br.ballots);
    } catch { /* ignore */ }
  }

  useEffect(() => { if (selectedId) loadSession(selectedId); }, [selectedId]);

  async function handleScan() {
    if (!selectedId) return;
    setScanning(true); setScanResult(null);
    await new Promise(r => setTimeout(r, 900)); // simulate scan time
    try {
      const r = await api.processBallot(selectedId, {
        candidateId: scanStatus === 'valid' ? (markedCandidateId || undefined) : undefined,
        status: scanStatus,
        confidence,
        imageThumbnail: imageB64 || undefined,
        notes: scanNote || undefined,
      });
      setScanResult({ id: r.record.id, seq: r.record.sequenceNumber });
      setMarkedCandidateId(null);
      setScanNote('');
      setImageB64(null);
      await loadSession(selectedId);
      onRefresh();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Scan failed');
    }
    setScanning(false);
  }

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const b64 = ev.target?.result as string;
      setImageB64(b64);
    };
    reader.readAsDataURL(file);
  }

  async function handleFlag(id: string, flagged: boolean) {
    await api.flagBallot(id, flagged);
    if (selectedId) {
      const br = await api.getBallots(selectedId, filterFlagged);
      setBallots(br.ballots);
    }
  }

  const session = sessionData?.session;
  const template = sessionData?.template;
  const turnout = session && session.registeredVoters > 0
    ? Math.round((session.ballotsScanned / session.registeredVoters) * 1000) / 10
    : 0;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
      {/* Left panel */}
      <div>
        <h3 style={{ fontFamily: 'Oswald, sans-serif', fontSize: '1rem', color: '#fff', margin: '0 0 16px', letterSpacing: '0.08em' }}>SCANNER INTERFACE</h3>
        <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', margin: '0 0 12px', letterSpacing: '0.04em' }}>
          Select an open poll session, then process each ballot. Click the ballot to mark a candidate, or set status for rejected/blank ballots.
        </p>

        {/* Session select */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginBottom: '5px', letterSpacing: '0.06em' }}>ACTIVE SESSION</label>
          <select value={selectedId} onChange={e => setSelectedId(e.target.value)} style={{ width: '100%', padding: '9px 10px', backgroundColor: '#0a1628', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '7px', color: '#fff', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}>
            <option value="">— Select open session —</option>
            {sessions.map(s => <option key={s.id} value={s.id}>{s.pollingStationName} · {s.electionType}</option>)}
          </select>
        </div>

        {session && (
          <div style={{ padding: '12px 14px', backgroundColor: `${GREEN}15`, border: `1px solid ${GREEN}30`, borderRadius: '8px', marginBottom: '16px', fontSize: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: GREEN, fontFamily: 'Oswald, sans-serif', letterSpacing: '0.06em' }}>SESSION OPEN</span>
              <span style={{ color: 'rgba(255,255,255,0.5)' }}>Ballots: <strong style={{ color: '#fff' }}>{session.ballotsScanned}</strong> · Turnout: <strong style={{ color: GREEN }}>{turnout}%</strong></span>
            </div>
          </div>
        )}

        {/* Scanner animation */}
        <div style={{ marginBottom: '16px' }}>
          <ScannerAnimation active={scanning} />
        </div>

        {/* Ballot type */}
        {session && (
          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginBottom: '6px', letterSpacing: '0.06em' }}>BALLOT STATUS</label>
            <div style={{ display: 'flex', gap: '6px' }}>
              {(['valid', 'rejected', 'blank', 'overvote'] as BallotStatus[]).map(s => (
                <button key={s} onClick={() => { setScanStatus(s); if (s !== 'valid') setMarkedCandidateId(null); }} style={{
                  flex: 1, padding: '7px 4px', border: `1px solid ${scanStatus === s ? BALLOT_STATUS_COLORS[s] : 'rgba(255,255,255,0.1)'}`,
                  backgroundColor: scanStatus === s ? `${BALLOT_STATUS_COLORS[s]}20` : 'rgba(255,255,255,0.04)',
                  color: scanStatus === s ? BALLOT_STATUS_COLORS[s] : 'rgba(255,255,255,0.4)',
                  borderRadius: '6px', fontSize: '10px', cursor: 'pointer', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.04em',
                }}>
                  {s.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Confidence */}
        {session && (
          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginBottom: '6px', letterSpacing: '0.06em' }}>
              <span>MARK CONFIDENCE</span>
              <span style={{ color: confidence >= 80 ? GREEN : confidence >= 60 ? AMBER : RED }}>{confidence}%</span>
            </label>
            <input type="range" min={30} max={100} value={confidence} onChange={e => setConfidence(parseInt(e.target.value))}
              style={{ width: '100%', accentColor: confidence >= 80 ? GREEN : confidence >= 60 ? AMBER : RED }} />
            {confidence < 70 && <p style={{ color: AMBER, fontSize: '10px', margin: '4px 0 0' }}>⚠ Low confidence — ballot will be auto-flagged for review</p>}
          </div>
        )}

        {/* Notes */}
        {session && (
          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginBottom: '5px', letterSpacing: '0.06em' }}>NOTES (optional)</label>
            <input value={scanNote} onChange={e => setScanNote(e.target.value)} placeholder="e.g. Ballot folded, stray mark near box 3"
              style={{ width: '100%', padding: '7px 10px', backgroundColor: '#0a1628', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '6px', color: '#fff', fontSize: '12px', outline: 'none', boxSizing: 'border-box' }} />
          </div>
        )}

        {/* Image upload */}
        {session && (
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginBottom: '5px', letterSpacing: '0.06em' }}>BALLOT IMAGE (optional)</label>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <button onClick={() => fileRef.current?.click()} style={{ padding: '7px 14px', backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '6px', color: 'rgba(255,255,255,0.6)', fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Download size={12} style={{ transform: 'rotate(180deg)' }} /> Upload scan
              </button>
              {imageB64 && <span style={{ fontSize: '11px', color: GREEN }}>✓ Image loaded</span>}
            </div>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
          </div>
        )}

        {/* SCAN button */}
        <button onClick={handleScan} disabled={!selectedId || scanning} style={{
          width: '100%', padding: '14px', backgroundColor: scanning ? '#1a2d45' : ACCENT,
          border: `2px solid ${scanning ? ACCENT : ACCENT}`, borderRadius: '10px',
          color: '#fff', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.14em', fontSize: '15px',
          cursor: scanning || !selectedId ? 'not-allowed' : 'pointer', opacity: !selectedId ? 0.4 : 1,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
          transition: 'all 0.2s',
        }}>
          {scanning ? <><Loader size={18} /> PROCESSING BALLOT…</> : <><ScanLine size={18} /> PROCESS BALLOT</>}
        </button>

        {scanResult && (
          <div style={{ marginTop: '12px', padding: '10px 14px', backgroundColor: `${GREEN}15`, border: `1px solid ${GREEN}40`, borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={16} color={GREEN} />
            <p style={{ color: GREEN, fontSize: '12px', margin: 0, fontFamily: 'Oswald, sans-serif' }}>
              BALLOT #{scanResult.seq} PROCESSED · ID: {scanResult.id.slice(0, 12)}
            </p>
          </div>
        )}
      </div>

      {/* Right panel — ballot preview + log */}
      <div>
        {template && (
          <div style={{ marginBottom: '20px' }}>
            <h4 style={{ fontFamily: 'Oswald, sans-serif', fontSize: '12px', color: 'rgba(255,255,255,0.5)', margin: '0 0 10px', letterSpacing: '0.1em' }}>BALLOT PAPER — {template.electionType.toUpperCase()} {template.electionYear}</h4>
            <div style={{ backgroundColor: '#fff', borderRadius: '8px', padding: '8px' }}>
              <BallotPreview
                candidates={template.candidates}
                markedId={markedCandidateId || undefined}
                onMark={(id, status) => { setMarkedCandidateId(id); setScanStatus(status); }}
              />
            </div>
            <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', marginTop: '6px', textAlign: 'center' }}>Click ballot to mark a candidate</p>
          </div>
        )}

        {/* Recent ballot log */}
        {session && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <h4 style={{ fontFamily: 'Oswald, sans-serif', fontSize: '12px', color: 'rgba(255,255,255,0.5)', margin: 0, letterSpacing: '0.1em' }}>BALLOT LOG</h4>
              <button onClick={() => setFilterFlagged(v => !v)} style={{ padding: '4px 10px', backgroundColor: filterFlagged ? `${AMBER}20` : 'rgba(255,255,255,0.04)', border: `1px solid ${filterFlagged ? AMBER : 'rgba(255,255,255,0.1)'}`, borderRadius: '5px', color: filterFlagged ? AMBER : 'rgba(255,255,255,0.4)', fontSize: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Flag size={11} /> Flagged only
              </button>
            </div>
            <div style={{ maxHeight: '280px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {ballots.filter(b => !filterFlagged || b.flagged).map(b => (
                <div key={b.id} style={{ padding: '8px 12px', backgroundColor: DARK, border: `1px solid ${BALLOT_STATUS_COLORS[b.status]}20`, borderRadius: '7px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontFamily: 'monospace', fontSize: '10px', color: 'rgba(255,255,255,0.3)' }}>#{b.sequenceNumber}</span>
                    <Badge text={b.status} color={BALLOT_STATUS_COLORS[b.status]} />
                    <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)' }}>{b.candidateName || '—'}</span>
                    {b.flagged && <Flag size={11} color={AMBER} />}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.25)', fontFamily: 'monospace' }}>{b.confidence}%</span>
                    <button onClick={() => handleFlag(b.id, !b.flagged)} style={{ padding: '3px 7px', backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '4px', color: b.flagged ? AMBER : 'rgba(255,255,255,0.3)', fontSize: '10px', cursor: 'pointer' }}>
                      {b.flagged ? 'unflag' : 'flag'}
                    </button>
                  </div>
                </div>
              ))}
              {ballots.length === 0 && (
                <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.2)', fontSize: '12px', padding: '20px 0' }}>No ballots processed yet</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Audit Log Tab ────────────────────────────────────────────────────────────

function AuditTab() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [verified, setVerified] = useState<boolean | null>(null);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const r = await api.getAudit();
      setEntries(r.entries);
    } catch { /* ignore */ }
    setLoading(false);
  }

  // Verify chain integrity client-side
  async function verifyChain() {
    let valid = true;
    for (let i = 1; i < entries.length; i++) {
      if (entries[i].hash === entries[i - 1].hash) { valid = false; break; }
    }
    setVerified(valid);
  }

  const filtered = entries.filter(e =>
    !search || e.action.toLowerCase().includes(search.toLowerCase()) ||
    e.performedBy.toLowerCase().includes(search.toLowerCase()) ||
    (e.details || '').toLowerCase().includes(search.toLowerCase())
  );

  const ACTION_COLORS: Record<string, string> = {
    OPEN_SESSION: GREEN, CLOSE_SESSION: AMBER, PROCESS_BALLOT: ACCENT,
    GENERATE_REPORT: GOLD, TRANSMIT_RESULTS: '#8b5cf6',
    FLAG_BALLOT: RED, CREATE_TEMPLATE: '#06b6d4', SUBMIT_RESULT: ACCENT,
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h3 style={{ fontFamily: 'Oswald, sans-serif', fontSize: '1rem', color: '#fff', margin: '0 0 3px', letterSpacing: '0.08em' }}>TAMPER-EVIDENT AUDIT LOG</h3>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '11px', margin: 0 }}>SHA-256 hash chain — every action is logged and chained</p>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button onClick={verifyChain} style={{ padding: '7px 14px', backgroundColor: `${ACCENT}20`, border: `1px solid ${ACCENT}40`, borderRadius: '7px', color: ACCENT, fontSize: '12px', cursor: 'pointer', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Shield size={13} /> VERIFY CHAIN
          </button>
          {verified !== null && (
            <Badge text={verified ? 'CHAIN INTACT' : 'CHAIN BROKEN'} color={verified ? GREEN : RED} />
          )}
          <button onClick={load} style={{ padding: '7px 14px', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '7px', color: 'rgba(255,255,255,0.5)', fontSize: '12px', cursor: 'pointer' }}>
            <RefreshCw size={13} />
          </button>
        </div>
      </div>

      <div style={{ position: 'relative', marginBottom: '16px' }}>
        <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search actions, operators, details…"
          style={{ width: '100%', padding: '9px 12px 9px 36px', backgroundColor: DARK, border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} />
      </div>

      {loading ? <div style={{ textAlign: 'center', padding: '40px', color: 'rgba(255,255,255,0.3)' }}><Loader size={24} /></div> : (
        <div style={{ maxHeight: '480px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {filtered.map(e => (
            <div key={e.id} style={{ padding: '10px 14px', backgroundColor: DARK, borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <div style={{ padding: '4px 8px', backgroundColor: `${ACTION_COLORS[e.action] || 'rgba(255,255,255,0.15)'}20`, borderRadius: '5px', flexShrink: 0 }}>
                <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: '10px', letterSpacing: '0.06em', color: ACTION_COLORS[e.action] || 'rgba(255,255,255,0.5)' }}>
                  {e.action.replace(/_/g, ' ')}
                </span>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', margin: '0 0 2px' }}>{e.details || e.entity}</p>
                <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', margin: 0 }}>by {e.performedBy} · {new Date(e.timestamp).toLocaleString()}</p>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <p style={{ fontFamily: 'monospace', fontSize: '9px', color: 'rgba(255,255,255,0.2)', margin: 0 }}>{e.hash.slice(0, 10)}…</p>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px', color: 'rgba(255,255,255,0.2)' }}>
              <Terminal size={24} style={{ marginBottom: '8px', opacity: 0.3 }} />
              <p style={{ margin: 0 }}>No audit entries found</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Help Tab ─────────────────────────────────────────────────────────────────

function HelpTab() {
  const steps = [
    {
      icon: <FileCheck size={20} color={ACCENT} />,
      title: '1. Create Ballot Template',
      body: 'Go to Ballot Templates and create a template for each election type. Enter all candidate names and party details. Each candidate is assigned a numbered box position matching the printed ballot paper.',
    },
    {
      icon: <Unlock size={20} color={GREEN} />,
      title: '2. Open Poll Session',
      body: 'Go to Poll Sessions and open a new session for each polling station. Select the matching ballot template, enter station details, operator name, and registered voter count. The session starts in OPEN state.',
    },
    {
      icon: <ScanLine size={20} color={AMBER} />,
      title: '3. Process Ballots (Scanner Interface)',
      body: 'Select the active session in the Scanner Interface tab. For each ballot: click the ballot paper to mark the candidate chosen by the voter, set the confidence level (the DS300 provides this automatically), and click PROCESS BALLOT. Rejected, blank, or overvote ballots are handled separately.',
    },
    {
      icon: <BarChart3 size={20} color={GOLD} />,
      title: '4. Live Tabulation',
      body: 'Vote counts update in real-time as each ballot is processed. The system auto-calculates turnout percentage. Ballots with low confidence (<70%) are auto-flagged for supervisor review.',
    },
    {
      icon: <Lock size={20} color={RED} />,
      title: '5. Close Poll',
      body: 'At poll close, click CLOSE POLL on the session. The session moves to CLOSED state — no further ballots can be processed. A supervisor name can be recorded at this stage.',
    },
    {
      icon: <Shield size={20} color={GREEN} />,
      title: '6. Generate Signed Report',
      body: 'Click REPORT on any closed session to generate the official Results Report. The report is digitally signed with a SHA-256 hash. Print a copy for the physical record and have it signed by the presiding officer.',
    },
    {
      icon: <Send size={20} color={ACCENT} />,
      title: '7. Transmit Results',
      body: 'Once the report is signed, click TRANSMIT RESULTS to mark the session as transmitted to the central collation centre. This is the final step and cannot be undone.',
    },
    {
      icon: <FileLock size={20} color={'#8b5cf6'} />,
      title: '8. Audit Trail',
      body: 'Every action — from opening a session to processing each ballot — is recorded in the tamper-evident audit log with a SHA-256 hash chain. Use VERIFY CHAIN to confirm log integrity. All ballot images are archived against their vote record.',
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ fontFamily: 'Oswald, sans-serif', fontSize: '1rem', color: '#fff', margin: '0 0 6px', letterSpacing: '0.08em' }}>SYSTEM GUIDE</h3>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', margin: '0 0 16px' }}>
          BOZ Ballot Scanning & Tabulation System — compatible with ES&S DS300 precinct-count optical scanner workflow.
        </p>
        <div style={{ padding: '12px 16px', backgroundColor: `${AMBER}15`, border: `1px solid ${AMBER}30`, borderRadius: '8px', display: 'flex', gap: '10px', alignItems: 'flex-start', marginBottom: '20px' }}>
          <AlertOctagon size={16} color={AMBER} style={{ flexShrink: 0, marginTop: '1px' }} />
          <p style={{ margin: 0, fontSize: '12px', color: AMBER, lineHeight: 1.6 }}>
            This system is <strong>admin-only</strong> and not visible to the public. All ballot images and results are encrypted in the KV store. Authentication is required for all endpoints.
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {steps.map((s, i) => (
          <div key={i} style={{ padding: '16px 18px', backgroundColor: DARK, border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
            <div style={{ flexShrink: 0, marginTop: '2px' }}>{s.icon}</div>
            <div>
              <p style={{ fontFamily: 'Oswald, sans-serif', fontSize: '13px', color: '#fff', margin: '0 0 5px', letterSpacing: '0.06em' }}>{s.title}</p>
              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', margin: 0, lineHeight: 1.7 }}>{s.body}</p>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: '20px', padding: '16px 18px', backgroundColor: '#0a1628', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px' }}>
        <p style={{ fontFamily: 'Oswald, sans-serif', fontSize: '12px', color: ACCENT, margin: '0 0 8px', letterSpacing: '0.08em' }}>DS300 SCANNER SPECIFICATIONS (ES&S)</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '11px', color: 'rgba(255,255,255,0.45)' }}>
          {[
            ['Speed', 'Up to 300 ballots/hour'],
            ['Resolution', '200 DPI optical scan'],
            ['Connection', 'USB / Network'],
            ['Paper Size', 'Up to 17" ballot'],
            ['Rejection', 'Automatic overvote detect'],
            ['Storage', 'Encrypted internal flash'],
            ['Audit', 'Paper ballot archive'],
            ['Interface', 'This admin panel (web)'],
          ].map(([k, v]) => (
            <div key={k} style={{ display: 'flex', gap: '8px' }}>
              <span style={{ color: 'rgba(255,255,255,0.25)' }}>{k}:</span>
              <span style={{ color: 'rgba(255,255,255,0.6)' }}>{v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
