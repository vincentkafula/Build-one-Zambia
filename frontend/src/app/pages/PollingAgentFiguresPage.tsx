import { useState, useEffect, useMemo } from 'react';
import {
  Users, CheckCircle2, XCircle, Clock, ChevronDown, ChevronUp,
  AlertTriangle, RefreshCw, FileWarning, ShieldCheck,
} from 'lucide-react';
import { dataEntryApi } from '../lib/api';
import { provinces, presidentialCandidates, Candidate } from '../data/mockData';

type ElectionType = 'presidential' | 'parliament' | 'mayoral' | 'councillor';

interface SubmissionCandidateVote {
  candidateId: string;
  name?: string;
  party?: string;
  votes: number;
}

interface Submission {
  id: string;
  pollingStationId: string;
  pollingStationName?: string;
  wardId?: string;
  wardName?: string;
  constituencyId?: string;
  constituencyName?: string;
  districtId?: string;
  districtName?: string;
  provinceId?: string;
  provinceName?: string;
  electionType: ElectionType;
  candidateResults?: SubmissionCandidateVote[];
  candidates?: SubmissionCandidateVote[];
  totalVotesCast?: number;
  totalVotes?: number;
  totalRejected?: number;
  rejectedBallots?: number;
  registeredVoters?: number;
  agentId?: string;
  agentName?: string;
  notes?: string;
  status: string;
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

const ELECTION_OPTIONS: { value: ElectionType; label: string }[] = [
  { value: 'presidential', label: 'Presidential' },
  { value: 'parliament', label: 'National Assembly (MP)' },
  { value: 'mayoral', label: 'Mayoral / Council Chairperson' },
  { value: 'councillor', label: 'Ward Councillor' },
];

function resolveCandidateList(electionType: ElectionType, sub: Submission): Candidate[] {
  if (electionType === 'presidential') return presidentialCandidates;
  for (const p of provinces) {
    for (const d of p.districts) {
      if (electionType === 'mayoral' && d.id === sub.districtId) return d.mayoralCandidates ?? [];
      for (const c of d.constituencies) {
        if (electionType === 'parliament' && c.id === sub.constituencyId) return c.mpCandidates ?? [];
        for (const w of c.wards) {
          if (electionType === 'councillor' && w.id === sub.wardId) return w.councillorCandidates ?? [];
        }
      }
    }
  }
  return [];
}

function candidateMeta(list: Candidate[], candidateId: string, fallbackName?: string, fallbackParty?: string) {
  const found = list.find(c => c.id === candidateId);
  return {
    name: found?.name || fallbackName || candidateId,
    party: found?.party || fallbackParty || '—',
    partyColor: found?.partyColor || '#6b7280',
  };
}

function statusBadge(status: string) {
  if (status === 'approved') return { label: 'Approved', color: '#16a34a', bg: 'rgba(22,163,74,0.1)', Icon: CheckCircle2 };
  if (status === 'rejected') return { label: 'Not Approved', color: '#dc2626', bg: 'rgba(220,38,38,0.1)', Icon: XCircle };
  return { label: 'Pending Review', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', Icon: Clock };
}

export function PollingAgentFiguresPage() {
  const rawUser = typeof window !== 'undefined' ? sessionStorage.getItem('boz_election_user') : null;
  const user = rawUser ? JSON.parse(rawUser) : null;
  const wardId: string = user?.scopeId || '';
  const wardName: string = user?.scopeName || 'your ward';

  const [electionType, setElectionType] = useState<ElectionType>('presidential');
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [actioning, setActioning] = useState<string | null>(null);
  const [rejectNoteFor, setRejectNoteFor] = useState<string | null>(null);
  const [rejectNote, setRejectNote] = useState('');

  async function load() {
    setLoading(true);
    setError('');
    try {
      const filters: Record<string, string> = { electionType };
      if (wardId) filters.wardId = wardId;
      const res = await dataEntryApi.listSubmissions(filters);
      let subs = (res.submissions as Submission[]) || [];
      // Safety net: filter client-side too, in case older records lack wardId
      // and only carry a matching wardName.
      if (wardId) subs = subs.filter(s => s.wardId === wardId || (!s.wardId && s.wardName && s.wardName === wardName));
      subs.sort((a, b) => (b.submittedAt || '').localeCompare(a.submittedAt || ''));
      setSubmissions(subs);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load polling agent submissions.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [electionType, wardId]);

  const stats = useMemo(() => {
    const total = submissions.length;
    const approved = submissions.filter(s => s.status === 'approved').length;
    const rejected = submissions.filter(s => s.status === 'rejected').length;
    const pending = total - approved - rejected;
    return { total, approved, rejected, pending };
  }, [submissions]);

  const approvedTotals = useMemo(() => {
    const approvedSubs = submissions.filter(s => s.status === 'approved');
    const perCandidate: Record<string, number> = {};
    let rejectedBallots = 0, totalVotesCast = 0, registeredVoters = 0;
    for (const s of approvedSubs) {
      const list = s.candidateResults || s.candidates || [];
      for (const c of list) perCandidate[c.candidateId] = (perCandidate[c.candidateId] || 0) + (c.votes || 0);
      rejectedBallots += s.rejectedBallots ?? s.totalRejected ?? 0;
      totalVotesCast += s.totalVotesCast ?? s.totalVotes ?? 0;
      registeredVoters += s.registeredVoters ?? 0;
    }
    return { perCandidate, rejectedBallots, totalVotesCast, registeredVoters, stationsApproved: approvedSubs.length };
  }, [submissions]);

  async function handleDecision(id: string, status: 'approved' | 'rejected', notes?: string) {
    setActioning(id);
    try {
      await dataEntryApi.updateSubmissionStatus(id, status, notes);
      await load();
      setRejectNoteFor(null);
      setRejectNote('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update submission status.');
    } finally {
      setActioning(null);
    }
  }

  if (!wardId) {
    return (
      <div className="rounded-2xl p-6 flex flex-col items-center gap-3 text-center" style={{ backgroundColor: '#0f1f33', border: '1px solid rgba(255,255,255,0.07)' }}>
        <FileWarning size={32} style={{ color: '#f59e0b' }} />
        <p style={{ color: '#fff', fontFamily: 'Oswald, sans-serif', fontSize: '1rem' }}>Ward Not Configured</p>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', maxWidth: 420 }}>
          Your account isn't linked to a specific ward yet. Please contact your Build One Zambia administrator so
          they can assign your ward in Election Users management before you can review polling agent figures.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Election type selector + refresh */}
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

      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Submitted', value: stats.total, color: '#16a34a' },
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
            <strong style={{ color: '#f59e0b' }}>{stats.pending}</strong> polling agent submission{stats.pending !== 1 ? 's' : ''} still
            need review. Once every submission below is marked <strong>Approved</strong> or <strong>Not Approved</strong>, you can enter
            the ECZ announced figures for {wardName} from the ECZ Official Figures tab.
          </p>
        </div>
      )}
      {stats.pending === 0 && stats.total > 0 && (
        <div className="flex items-start gap-3 px-4 py-3 rounded-xl" style={{ backgroundColor: 'rgba(22,163,74,0.08)', border: '1px solid rgba(22,163,74,0.2)' }}>
          <ShieldCheck size={16} style={{ color: '#16a34a', marginTop: 2, flexShrink: 0 }} />
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', lineHeight: 1.5 }}>
            All polling agent submissions for this election type have been reviewed. You can now proceed to enter
            the ECZ Announced Figures for {wardName}.
          </p>
        </div>
      )}

      {error && (
        <div className="px-4 py-3 rounded-xl text-sm" style={{ backgroundColor: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.3)', color: '#f87171' }}>
          {error}
        </div>
      )}

      {/* Submissions list */}
      <div className="space-y-3">
        {loading && submissions.length === 0 && (
          <div className="flex items-center justify-center py-16">
            <div className="w-7 h-7 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          </div>
        )}

        {!loading && submissions.length === 0 && (
          <div className="rounded-2xl p-8 flex flex-col items-center gap-2 text-center" style={{ backgroundColor: '#0f1f33', border: '1px solid rgba(255,255,255,0.07)' }}>
            <Users size={28} style={{ color: 'rgba(255,255,255,0.3)' }} />
            <p style={{ color: '#fff', fontFamily: 'Oswald, sans-serif', fontSize: '0.95rem' }}>No polling agent submissions yet</p>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', maxWidth: 380 }}>
              Once polling agents in {wardName} submit their results for this election type, they'll appear here for your review.
            </p>
          </div>
        )}

        {submissions.map(sub => {
          const badge = statusBadge(sub.status);
          const candList = resolveCandidateList(electionType, sub);
          const votes = sub.candidateResults || sub.candidates || [];
          const rejected = sub.rejectedBallots ?? sub.totalRejected ?? 0;
          const totalCast = sub.totalVotesCast ?? sub.totalVotes ?? 0;
          const isOpen = expanded === sub.id;

          return (
            <div key={sub.id} className="rounded-2xl overflow-hidden" style={{ backgroundColor: '#0f1f33', border: '1px solid rgba(255,255,255,0.07)' }}>
              <button
                onClick={() => setExpanded(isOpen ? null : sub.id)}
                className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left"
              >
                <div className="min-w-0">
                  <p style={{ color: '#fff', fontFamily: 'Oswald, sans-serif', fontSize: '0.92rem', letterSpacing: '0.02em' }}>
                    {sub.pollingStationName || sub.pollingStationId}
                  </p>
                  <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', marginTop: 2 }}>
                    Agent: {sub.agentName || 'Unknown'} · Submitted {new Date(sub.submittedAt).toLocaleString()}
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
                  {votes.length > 0 ? (
                    <div className="space-y-2 mt-3">
                      {votes.map(v => {
                        const meta = candidateMeta(candList, v.candidateId, v.name, v.party);
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
                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem' }}>No candidate-level votes recorded for this submission.</p>
                  )}

                  <div className="grid grid-cols-3 gap-3 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <div>
                      <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.68rem', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.08em' }}>REGISTERED VOTERS</p>
                      <p style={{ color: '#fff', fontSize: '0.9rem', marginTop: 2 }}>{(sub.registeredVoters ?? 0).toLocaleString()}</p>
                    </div>
                    <div>
                      <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.68rem', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.08em' }}>REJECTED BALLOTS</p>
                      <p style={{ color: '#fff', fontSize: '0.9rem', marginTop: 2 }}>{rejected.toLocaleString()}</p>
                    </div>
                    <div>
                      <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.68rem', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.08em' }}>TOTAL VOTES CAST</p>
                      <p style={{ color: '#fff', fontSize: '0.9rem', marginTop: 2 }}>{totalCast.toLocaleString()}</p>
                    </div>
                  </div>

                  {sub.reviewedBy && (
                    <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.72rem' }}>
                      Last reviewed by {sub.reviewedBy} on {sub.reviewedAt ? new Date(sub.reviewedAt).toLocaleString() : '—'}
                    </p>
                  )}

                  {rejectNoteFor === sub.id ? (
                    <div className="space-y-2">
                      <textarea
                        value={rejectNote}
                        onChange={e => setRejectNote(e.target.value)}
                        placeholder="Reason for not approving this submission (visible to the agent)"
                        rows={2}
                        className="w-full px-3 py-2 rounded-xl text-sm"
                        style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', outline: 'none' }}
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleDecision(sub.id, 'rejected', rejectNote)}
                          disabled={actioning === sub.id}
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
                        onClick={() => handleDecision(sub.id, 'approved')}
                        disabled={actioning === sub.id}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm"
                        style={{
                          background: sub.status === 'approved' ? 'rgba(22,163,74,0.15)' : '#16a34a',
                          color: sub.status === 'approved' ? '#16a34a' : '#fff',
                          border: sub.status === 'approved' ? '1px solid #16a34a55' : 'none',
                          fontFamily: 'Oswald, sans-serif', letterSpacing: '0.03em',
                        }}
                      >
                        <CheckCircle2 size={15} />
                        {sub.status === 'approved' ? 'Approved' : 'Approve'}
                      </button>
                      <button
                        onClick={() => setRejectNoteFor(sub.id)}
                        disabled={actioning === sub.id}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm"
                        style={{
                          background: sub.status === 'rejected' ? 'rgba(220,38,38,0.15)' : 'rgba(220,38,38,0.9)',
                          color: sub.status === 'rejected' ? '#dc2626' : '#fff',
                          border: sub.status === 'rejected' ? '1px solid #dc262655' : 'none',
                          fontFamily: 'Oswald, sans-serif', letterSpacing: '0.03em',
                        }}
                      >
                        <XCircle size={15} />
                        {sub.status === 'rejected' ? 'Not Approved' : 'Not Approve'}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Approved totals summary — reference for the ECZ entry step */}
      {stats.approved > 0 && (
        <div className="rounded-2xl p-5" style={{ backgroundColor: '#0f1f33', border: '1px solid rgba(22,163,74,0.25)' }}>
          <p className="mb-3 text-xs" style={{ fontFamily: 'Oswald, sans-serif', letterSpacing: '0.12em', color: '#16a34a' }}>
            APPROVED POLLING AGENT TOTALS — {wardName.toUpperCase()}
          </p>
          <div className="space-y-2">
            {Object.entries(approvedTotals.perCandidate).map(([candidateId, votes]) => {
              const list = resolveCandidateList(electionType, submissions.find(s => s.status === 'approved') || ({} as Submission));
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
              <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.68rem', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.08em' }}>STATIONS APPROVED</p>
              <p style={{ color: '#fff', fontSize: '1rem', marginTop: 2 }}>{approvedTotals.stationsApproved}</p>
            </div>
          </div>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', marginTop: 12 }}>
            This is the figure your ECZ Announced Figures entry must match exactly for {wardName}.
          </p>
        </div>
      )}
    </div>
  );
}

export default PollingAgentFiguresPage;
