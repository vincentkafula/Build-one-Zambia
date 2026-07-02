import { useState, useEffect } from 'react';
import {
  CheckCircle, XCircle, Clock, ChevronDown, ChevronUp,
  RefreshCw, Building2, AlertCircle,
} from 'lucide-react';
import { chambersApi, ChamberAmendment, AmendmentStatus, ChamberStats } from '../lib/api';

const A    = '#16a34a';
const NAVY = '#1e2d4a';

function StatChip({ label, value, color }: { label: string; value: number | string; color: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
      <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-lg font-bold" style={{ background: color }}>
        {typeof value === 'number' ? value : '—'}
      </div>
      <div>
        <p className="text-xs text-gray-400">{label}</p>
        <p className="text-sm font-semibold" style={{ color: NAVY }}>{value}</p>
      </div>
    </div>
  );
}

const STATUS_CFG: Record<AmendmentStatus, { icon: React.ReactNode; color: string; bg: string; label: string }> = {
  pending:  { icon: <Clock size={13} />,       color: '#d97706', bg: '#fef3c7', label: 'Pending' },
  approved: { icon: <CheckCircle size={13} />, color: '#16a34a', bg: '#f0fdf4', label: 'Approved' },
  rejected: { icon: <XCircle size={13} />,     color: '#dc2626', bg: '#fef2f2', label: 'Rejected' },
};

function AmendmentRow({
  amendment,
  onDecision,
}: {
  amendment: ChamberAmendment;
  onDecision: (id: string, decision: 'approved' | 'rejected', note: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState('');
  const [acting, setActing] = useState(false);
  const cfg = STATUS_CFG[amendment.status];

  async function decide(decision: 'approved' | 'rejected') {
    setActing(true);
    await onDecision(amendment.id, decision, note);
    setActing(false);
    setOpen(false);
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <button
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors"
        onClick={() => setOpen(o => !o)}
      >
        <div className="flex items-center gap-3 min-w-0">
          <span
            className="flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full font-medium shrink-0"
            style={{ color: cfg.color, background: cfg.bg }}
          >
            {cfg.icon} {cfg.label}
          </span>
          <span className="text-sm font-medium text-gray-800 truncate">{amendment.chamberName}</span>
          <span className="text-xs text-gray-400 hidden md:inline shrink-0">— {amendment.fieldLabel}</span>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-xs text-gray-400">{new Date(amendment.submittedAt).toLocaleDateString()}</span>
          {open ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
        </div>
      </button>

      {open && (
        <div className="border-t border-gray-100 bg-gray-50 px-5 pt-4 pb-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Field</p>
              <p className="text-gray-700 font-medium">{amendment.fieldLabel}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Current Value</p>
              <p className="text-gray-700">{amendment.currentValue || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Proposed Value</p>
              <p className="text-gray-700 font-semibold" style={{ color: NAVY }}>{amendment.proposedValue}</p>
            </div>
          </div>

          <div>
            <p className="text-xs text-gray-400 mb-0.5">Reason from Chamber</p>
            <p className="text-sm text-gray-700 italic bg-white border border-gray-200 rounded-lg p-3">{amendment.reason}</p>
          </div>

          <div>
            <p className="text-xs text-gray-400 mb-0.5">Submitted by</p>
            <p className="text-sm text-gray-700">{amendment.submittedBy}</p>
          </div>

          {amendment.status === 'pending' ? (
            <div className="pt-1 space-y-3">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Admin Note (optional)</label>
                <textarea
                  rows={2}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none"
                  placeholder="Add a note for the chamber…"
                  value={note}
                  onChange={e => setNote(e.target.value)}
                />
              </div>
              <div className="flex gap-3">
                <button
                  disabled={acting}
                  onClick={() => decide('approved')}
                  className="flex items-center gap-2 px-5 py-2 rounded-lg text-white text-sm disabled:opacity-50"
                  style={{ background: '#16a34a' }}
                >
                  <CheckCircle size={14} /> {acting ? 'Processing…' : 'Approve'}
                </button>
                <button
                  disabled={acting}
                  onClick={() => decide('rejected')}
                  className="flex items-center gap-2 px-5 py-2 rounded-lg text-white text-sm disabled:opacity-50"
                  style={{ background: '#dc2626' }}
                >
                  <XCircle size={14} /> {acting ? 'Processing…' : 'Reject'}
                </button>
              </div>
            </div>
          ) : (
            <div className="pt-1 text-xs text-gray-400">
              {amendment.reviewedBy && <>Reviewed by <strong>{amendment.reviewedBy}</strong> on {new Date(amendment.reviewedAt!).toLocaleString()}</>}
              {amendment.adminNote && <p className="mt-1 p-2 rounded bg-blue-50 text-blue-800"><strong>Note:</strong> {amendment.adminNote}</p>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function ChamberAmendmentsAdmin() {
  const [amendments, setAmendments] = useState<ChamberAmendment[]>([]);
  const [stats, setStats] = useState<ChamberStats | null>(null);
  const [filter, setFilter] = useState<AmendmentStatus | 'all'>('all');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const [ar, sr] = await Promise.all([
        chambersApi.listAmendments({}),
        chambersApi.getStats(),
      ]);
      setAmendments(ar.amendments || []);
      if (sr.success) setStats(sr.stats);
    } catch {
      setMsg('Could not load amendments.');
    } finally {
      setLoading(false);
    }
  }

  async function handleDecision(id: string, decision: 'approved' | 'rejected', adminNote: string) {
    try {
      await chambersApi.reviewAmendment(id, decision, adminNote);
      setMsg(`Amendment ${decision}.`);
      await load();
    } catch {
      setMsg('Failed to process decision.');
    }
  }

  const displayed = filter === 'all' ? amendments : amendments.filter(a => a.status === filter);
  const pendingCount = amendments.filter(a => a.status === 'pending').length;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl" style={{ fontFamily: 'Oswald, sans-serif', color: NAVY, letterSpacing: '0.04em' }}>
            CHAMBER AMENDMENT REQUESTS
          </h2>
          <p className="text-sm text-gray-500 mt-1">Review and approve changes submitted by chamber administrators.</p>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm border border-gray-300 hover:bg-gray-50"
        >
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {msg && (
        <div className="mb-4 p-3 rounded-lg text-sm bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-2">
          <AlertCircle size={14} /> {msg}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatChip label="Total Chambers" value={stats?.total ?? '—'} color={NAVY} />
        <StatChip label="Pending Amendments" value={pendingCount} color="#d97706" />
        <StatChip label="Approved" value={amendments.filter(a => a.status === 'approved').length} color="#16a34a" />
        <StatChip label="Rejected" value={amendments.filter(a => a.status === 'rejected').length} color="#dc2626" />
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {(['all', 'pending', 'approved', 'rejected'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className="px-4 py-1.5 rounded-lg text-sm font-medium transition-colors"
            style={{
              background: filter === f ? A : '#f3f4f6',
              color: filter === f ? '#fff' : '#374151',
              border: `1.5px solid ${filter === f ? A : 'transparent'}`,
            }}
          >
            {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
            {f === 'pending' && pendingCount > 0 && (
              <span className="ml-1.5 bg-amber-500 text-white text-xs rounded-full px-1.5 py-0.5">{pendingCount}</span>
            )}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <p className="text-sm text-gray-400 py-8 text-center">Loading amendments…</p>
      ) : displayed.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-10 text-center">
          <Building2 className="w-10 h-10 mx-auto mb-3 text-gray-200" />
          <p className="text-sm text-gray-400">No {filter === 'all' ? '' : filter} amendments found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {displayed.map(a => (
            <AmendmentRow key={a.id} amendment={a} onDecision={handleDecision} />
          ))}
        </div>
      )}
    </div>
  );
}


export { ChamberAmendmentsAdmin as default };
