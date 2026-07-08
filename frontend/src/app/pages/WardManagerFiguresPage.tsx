import { useState, useEffect, useMemo } from 'react';
import {
  Users, CheckCircle2, XCircle, Clock, ChevronDown, ChevronUp,
  AlertTriangle, RefreshCw, FileWarning, ShieldCheck,
} from 'lucide-react';
import { dataEntryApi } from '../lib/api';
import { provinces, presidentialCandidates, Candidate } from '../data/mockData';

type ElectionType = 'presidential' | 'parliament' | 'mayoral' | 'councillor';

interface ECZFigureCandidate { candidateId: string; votes: number; }

interface WardFigure {
  levelType: string;
  levelId: string; // wardId
  levelName: string;
  electionType: string;
  figures: ECZFigureCandidate[];
  totalVotesCast?: number;
  totalVotes?: number;
  rejectedBallots?: number;
  enteredBy?: string;
  constituencyId?: string;
  status: string;
  reviewedBy?: string;
  reviewedAt?: string;
  savedAt?: string;
}

const ELECTION_OPTIONS: { value: ElectionType; label: string; eczValue: string }[] = [
  { value: 'presidential', label: 'Presidential', eczValue: 'presidential' },
  { value: 'parliament', label: 'National Assembly (MP)', eczValue: 'mp' },
  { value: 'mayoral', label: 'Mayoral / Council Chairperson', eczValue: 'mayoral' },
  { value: 'councillor', label: 'Ward Councillor', eczValue: 'councillor' },
];

function findConstituencyChain(constituencyId: string) {
  for (const p of provinces) {
    for (const d of p.districts) {
      for (const c of d.constituencies) {
        if (c.id === constituencyId) return { province: p, district: d, constituency: c };
      }
    }
  }
  return null;
}

function resolveCandidateList(electionType: ElectionType, constituencyId: string, wardId: string): Candidate[] {
  if (electionType === 'presidential') return presidentialCandidates;
  const chain = findConstituencyChain(constituencyId);
  if (!chain) return [];
  if (electionType === 'parliament') return chain.constituency.mpCandidates ?? [];
  if (electionType === 'mayoral') return chain.district.mayoralCandidates ?? [];
  if (electionType === 'councillor') {
    const ward = chain.constituency.wards.find(w => w.id === wardId);
    return ward?.councillorCandidates ?? [];
  }
  return [];
}

function candidateMeta(list: Candidate[], candidateId: string) {
  const found = list.find(c => c.id === candidateId);
  return { name: found?.name || candidateId, party: found?.party || '—', partyColor: found?.partyColor || '#6b7280' };
}

function statusBadge(status: string) {
  if (status === 'approved') return { label: 'Approved', color: '#16a34a', bg: 'rgba(22,163,74,0.1)', Icon: CheckCircle2 };
  if (status === 'rejected') return { label: 'Not Approved', color: '#dc2626', bg: 'rgba(220,38,38,0.1)', Icon: XCircle };
  return { label: 'Pending Review', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', Icon: Clock };
}

export function WardManagerFiguresPage() {
  const rawUser = typeof window !== 'undefined' ? sessionStorage.getItem('boz_election_user') : null;
  const user = rawUser ? JSON.parse(rawUser) : null;
  const constituencyId: string = user?.scopeId || '';
  const constituencyName: string = user?.scopeName || 'your constituency';

  const [electionType, setElectionType] = useState<ElectionType>('presidential');
  const [wardFigures, setWardFigures] = useState<WardFigure[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [actioning, setActioning] = useState<string | null>(null);
  const [rejectNoteFor, setRejectNoteFor] = useState<string | null>(null);
  const [rejectNote, setRejectNote] = useState('');

  const eczElectionType = ELECTION_OPTIONS.find(o => o.value === electionType)?.eczValue || electionType;
  const chain = useMemo(() => (constituencyId ? findConstituencyChain(constituencyId) : null), [constituencyId]);
  const totalWardsInConstituency = chain?.constituency.wards.length ?? 0;

  async function load() {
    setLoading(true);
    setError('');
    try {
      const filters: Record<string, string> = { electionType: eczElectionType, levelType: 'ward' };
      if (constituencyId) filters.constituencyId = constituencyId;
      const res = await dataEntryApi.listECZFigures(filters);
      let figs = (res.figures as WardFigure[]) || [];
      if (constituencyId) figs = figs.filter(f => f.constituencyId === constituencyId);
      figs.sort((a, b) => (b.savedAt || '').localeCompare(a.savedAt || ''));
      setWardFigures(figs);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load ward manager figures.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [electionType, constituencyId]);

  const stats = useMemo(() => {
    const total = wardFigures.length;
    const approved = wardFigures.filter(f => f.status === 'approved').length;
    const rejected = wardFigures.filter(f => f.status === 'rejected').length;
    const pending = total - approved - rejected;
    return { total, approved, rejected, pending };
  }, [wardFigures]);

  const approvedTotals = useMemo(() => {
    const approvedFigs = wardFigures.filter(f => f.status === 'approved');
    const perCandidate: Record<string, number> = {};
    let rejectedBallots = 0, totalVotesCast = 0;
    for (const f of approvedFigs) {
      for (const c of f.figures || []) perCandidate[c.candidateId] = (perCandidate[c.candidateId] || 0) + (c.votes || 0);
      rejectedBallots += f.rejectedBallots ?? 0;
      totalVotesCast += f.totalVotesCast ?? f.totalVotes ?? 0;
    }
    return { perCandidate, rejectedBallots, totalVotesCast, wardsApproved: approvedFigs.length };
  }, [wardFigures]);

  async function handleDecision(wardId: string, status: 'approved' | 'rejected', notes?: string) {
    setActioning(wardId);
    try {
      await dataEntryApi.updateECZFigureStatus('ward', wardId, eczElectionType, status, notes);
      await load();
      setRejectNoteFor(null);
      setRejectNote('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update status.');
    } finally {
      setActioning(null);
    }
  }

  if (!constituencyId) {
    return (
      <div className="rounded-2xl p-6 flex flex-col items-center gap-3 text-center" style={{ backgroundColor: '#0f1f33', border: '1px solid rgba(255,255,255,0.07)' }}>
        <FileWarning size={32} style={{ color: '#f59e0b' }} />
        <p style={{ color: '#fff', fontFamily: 'Oswald, sans-serif', fontSize: '1rem' }}>Constituency Not Configured</p>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', maxWidth: 420 }}>
          Your account isn't linked to a specific constituency yet. Please contact your Build One Zambia administrator
          so they can assign your constituency in Election Users management.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {ELECTION_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => setElectionType(opt.value)}
              className="px-3 py-2 rounded-xl text-sm transition-all"
              style={{
                fontFamily: 'Oswald, sans-serif', letterSpacing: '0.03em',
                background: electionType === opt.value ? '#16a34a' : 'rgba(255,255,255,0.06)',
                color: electionType === opt.value ? '#fff' : 'rgba(255,255,255,0.6)',
                border: `1px solid ${electionType === opt.value ? '#16a34a' : 'rgba(255,255,255,0.1)'}`,
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm"
          style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)' }}
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Wards Submitted', value: `${stats.total}/${totalWardsInConstituency || stats.total}`, color: '#16a34a' },
          { label: 'Approved', value: stats.approved, color: '#16a34a' },
          { label: 'Pending Review', value: stats.pending, color: '#f59e0b' },
          { label: 'Not Approved', value: stats.rejected, color: '#dc2626' },
        ].map(s => (
          <div key={s.label} className="rounded-2xl p-4 text-center" style={{ backgroundColor: '#0f1f33', border: `1px solid ${s.color}25` }}>
            <p style={{ color: s.color, fontSize: '1.8rem', fontFamily: 'Oswald, sans-serif', lineHeight: 1 }}>{s.value}</p>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.7rem', marginTop: 6 }}>{s.label}</p>
          </div>
        ))}
      </div>

      {stats.pending > 0 && (
        <div className="flex items-start gap-3 px-4 py-3 rounded-xl" style={{ backgroundColor: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
          <AlertTriangle size={16} style={{ color: '#f59e0b', marginTop: 2, flexShrink: 0 }} />
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', lineHeight: 1.5 }}>
            <strong style={{ color: '#f59e0b' }}>{stats.pending}</strong> ward manager figure{stats.pending !== 1 ? 's' : ''} still
            need review. Once every ward below is marked <strong>Approved</strong> or <strong>Not Approved</strong>, you can enter
            the ECZ announced figures for {constituencyName} from the ECZ Official Figures tab.
          </p>
        </div>
      )}
      {stats.pending === 0 && stats.total > 0 && (
        <div className="flex items-start gap-3 px-4 py-3 rounded-xl" style={{ backgroundColor: 'rgba(22,163,74,0.08)', border: '1px solid rgba(22,163,74,0.2)' }}>
          <ShieldCheck size={16} style={{ color: '#16a34a', marginTop: 2, flexShrink: 0 }} />
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', lineHeight: 1.5 }}>
            All ward manager figures for this election type have been reviewed. You can now proceed to enter
            the ECZ Announced Figures for {constituencyName}.
          </p>
        </div>
      )}

      {error && (
        <div className="px-4 py-3 rounded-xl text-sm" style={{ backgroundColor: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.3)', color: '#f87171' }}>
          {error}
        </div>
      )}

      <div className="space-y-3">
        {loading && wardFigures.length === 0 && (
          <div className="flex items-center justify-center py-16">
            <div className="w-7 h-7 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          </div>
        )}

        {!loading && wardFigures.length === 0 && (
          <div className="rounded-2xl p-8 flex flex-col items-center gap-2 text-center" style={{ backgroundColor: '#0f1f33', border: '1px solid rgba(255,255,255,0.07)' }}>
            <Users size={28} style={{ color: 'rgba(255,255,255,0.3)' }} />
            <p style={{ color: '#fff', fontFamily: 'Oswald, sans-serif', fontSize: '0.95rem' }}>No ward figures submitted yet</p>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', maxWidth: 380 }}>
              Once ward managers in {constituencyName} enter their ward's ECZ figures for this election type, they'll appear here for your review.
            </p>
          </div>
        )}

        {wardFigures.map(fig => {
          const badge = statusBadge(fig.status || 'pending');
          const candList = resolveCandidateList(electionType, constituencyId, fig.levelId);
          const rejected = fig.rejectedBallots ?? 0;
          const totalCast = fig.totalVotesCast ?? fig.totalVotes ?? 0;
          const isOpen = expanded === fig.levelId;

          return (
            <div key={fig.levelId} className="rounded-2xl overflow-hidden" style={{ backgroundColor: '#0f1f33', border: '1px solid rgba(255,255,255,0.07)' }}>
              <button
                onClick={() => setExpanded(isOpen ? null : fig.levelId)}
                className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left"
              >
                <div className="min-w-0">
                  <p style={{ color: '#fff', fontFamily: 'Oswald, sans-serif', fontSize: '0.92rem', letterSpacing: '0.02em' }}>
                    {fig.levelName || fig.levelId}
                  </p>
                  <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', marginTop: 2 }}>
                    Ward Manager: {fig.enteredBy || 'Unknown'} · Submitted {fig.savedAt ? new Date(fig.savedAt).toLocaleString() : '—'}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs" style={{ backgroundColor: badge.bg, color: badge.color, fontFamily: 'Oswald, sans-serif' }}>
                    <badge.Icon size={12} />
                    {badge.label}
                  </span>
                  {isOpen ? <ChevronUp size={16} style={{ color: 'rgba(255,255,255,0.4)' }} /> : <ChevronDown size={16} style={{ color: 'rgba(255,255,255,0.4)' }} />}
                </div>
              </button>

              {isOpen && (
                <div className="px-5 pb-5 pt-1 space-y-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  {(fig.figures || []).length > 0 ? (
                    <div className="space-y-2 mt-3">
                      {(fig.figures || []).map(v => {
                        const meta = candidateMeta(candList, v.candidateId);
                        return (
                          <div key={v.candidateId} className="flex items-center gap-3">
                            <div className="w-1.5 h-6 rounded-full flex-shrink-0" style={{ background: meta.partyColor }} />
                            <div className="flex-1 min-w-0">
                              <p style={{ color: '#fff', fontSize: '0.82rem' }}>{meta.name}</p>
                              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.7rem' }}>{meta.party}</p>
                            </div>
                            <p style={{ color: '#fff', fontFamily: 'Oswald, sans-serif', fontSize: '0.95rem' }}>{v.votes.toLocaleString()}</p>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem' }}>No candidate-level votes recorded for this ward.</p>
                  )}

                  <div className="grid grid-cols-2 gap-3 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <div>
                      <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.68rem', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.08em' }}>REJECTED BALLOTS</p>
                      <p style={{ color: '#fff', fontSize: '0.9rem', marginTop: 2 }}>{rejected.toLocaleString()}</p>
                    </div>
                    <div>
                      <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.68rem', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.08em' }}>TOTAL VOTES CAST</p>
                      <p style={{ color: '#fff', fontSize: '0.9rem', marginTop: 2 }}>{totalCast.toLocaleString()}</p>
                    </div>
                  </div>

                  {fig.reviewedBy && (
                    <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.72rem' }}>
                      Last reviewed by {fig.reviewedBy} on {fig.reviewedAt ? new Date(fig.reviewedAt).toLocaleString() : '—'}
                    </p>
                  )}

                  {rejectNoteFor === fig.levelId ? (
                    <div className="space-y-2">
                      <textarea
                        value={rejectNote}
                        onChange={e => setRejectNote(e.target.value)}
                        placeholder="Reason for not approving this ward's figures (visible to the ward manager)"
                        rows={2}
                        className="w-full px-3 py-2 rounded-xl text-sm"
                        style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', outline: 'none' }}
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleDecision(fig.levelId, 'rejected', rejectNote)}
                          disabled={actioning === fig.levelId}
                          className="px-4 py-2 rounded-xl text-sm"
                          style={{ background: '#dc2626', color: '#fff', fontFamily: 'Oswald, sans-serif' }}
                        >
                          Confirm Not Approved
                        </button>
                        <button
                          onClick={() => { setRejectNoteFor(null); setRejectNote(''); }}
                          className="px-4 py-2 rounded-xl text-sm"
                          style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.6)', fontFamily: 'Oswald, sans-serif' }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2 pt-1">
                      <button
                        onClick={() => handleDecision(fig.levelId, 'approved')}
                        disabled={actioning === fig.levelId}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm"
                        style={{
                          background: fig.status === 'approved' ? 'rgba(22,163,74,0.15)' : '#16a34a',
                          color: fig.status === 'approved' ? '#16a34a' : '#fff',
                          border: fig.status === 'approved' ? '1px solid #16a34a55' : 'none',
                          fontFamily: 'Oswald, sans-serif', letterSpacing: '0.03em',
                        }}
                      >
                        <CheckCircle2 size={15} />
                        {fig.status === 'approved' ? 'Approved' : 'Approve'}
                      </button>
                      <button
                        onClick={() => setRejectNoteFor(fig.levelId)}
                        disabled={actioning === fig.levelId}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm"
                        style={{
                          background: fig.status === 'rejected' ? 'rgba(220,38,38,0.15)' : 'rgba(220,38,38,0.9)',
                          color: fig.status === 'rejected' ? '#dc2626' : '#fff',
                          border: fig.status === 'rejected' ? '1px solid #dc262655' : 'none',
                          fontFamily: 'Oswald, sans-serif', letterSpacing: '0.03em',
                        }}
                      >
                        <XCircle size={15} />
                        {fig.status === 'rejected' ? 'Not Approved' : 'Not Approve'}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {stats.approved > 0 && (
        <div className="rounded-2xl p-5" style={{ backgroundColor: '#0f1f33', border: '1px solid rgba(22,163,74,0.25)' }}>
          <p className="mb-3 text-xs" style={{ fontFamily: 'Oswald, sans-serif', letterSpacing: '0.12em', color: '#16a34a' }}>
            APPROVED WARD TOTALS — {constituencyName.toUpperCase()}
          </p>
          <div className="space-y-2">
            {Object.entries(approvedTotals.perCandidate).map(([candidateId, votes]) => {
              const list = electionType === 'presidential' ? presidentialCandidates
                : electionType === 'parliament' ? (chain?.constituency.mpCandidates ?? [])
                : [];
              const meta = candidateMeta(list, candidateId);
              return (
                <div key={candidateId} className="flex items-center justify-between">
                  <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem' }}>{meta.name} <span style={{ color: 'rgba(255,255,255,0.35)' }}>({meta.party})</span></span>
                  <span style={{ color: '#fff', fontFamily: 'Oswald, sans-serif' }}>{votes.toLocaleString()}</span>
                </div>
              );
            })}
          </div>
          <div className="grid grid-cols-3 gap-3 mt-4 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
            <div>
              <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.68rem', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.08em' }}>REJECTED BALLOTS</p>
              <p style={{ color: '#fff', fontSize: '1rem', marginTop: 2 }}>{approvedTotals.rejectedBallots.toLocaleString()}</p>
            </div>
            <div>
              <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.68rem', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.08em' }}>TOTAL VOTES CAST</p>
              <p style={{ color: '#16a34a', fontSize: '1rem', marginTop: 2, fontFamily: 'Oswald, sans-serif' }}>{approvedTotals.totalVotesCast.toLocaleString()}</p>
            </div>
            <div>
              <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.68rem', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.08em' }}>WARDS APPROVED</p>
              <p style={{ color: '#fff', fontSize: '1rem', marginTop: 2 }}>{approvedTotals.wardsApproved}</p>
            </div>
          </div>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', marginTop: 12 }}>
            This is the figure your ECZ Announced Figures entry must match exactly for {constituencyName}.
          </p>
        </div>
      )}
    </div>
  );
}

export default WardManagerFiguresPage;
