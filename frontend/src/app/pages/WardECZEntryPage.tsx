import { useState, useEffect, useMemo } from 'react';
import { Scale, Save, CheckCircle2, AlertCircle, Loader2, Lock, ShieldAlert } from 'lucide-react';
import { dataEntryApi } from '../lib/api';
import { provinces, presidentialCandidates, Candidate } from '../data/mockData';

type ElectionType = 'presidential' | 'parliament' | 'mayoral' | 'councillor';

const ELECTION_OPTIONS: { value: ElectionType; label: string; eczLevelType: string }[] = [
  { value: 'presidential', label: 'Presidential', eczLevelType: 'ward' },
  { value: 'parliament', label: 'National Assembly (MP)', eczLevelType: 'ward' },
  { value: 'mayoral', label: 'Mayoral / Council Chairperson', eczLevelType: 'ward' },
  { value: 'councillor', label: 'Ward Councillor', eczLevelType: 'ward' },
];

interface SubmissionCandidateVote { candidateId: string; name?: string; party?: string; votes: number; }
interface Submission {
  id: string;
  status: string;
  candidateResults?: SubmissionCandidateVote[];
  candidates?: SubmissionCandidateVote[];
  totalVotesCast?: number;
  totalVotes?: number;
  rejectedBallots?: number;
  totalRejected?: number;
  registeredVoters?: number;
  wardId?: string;
}

function findWardChain(wardId: string) {
  for (const p of provinces) {
    for (const d of p.districts) {
      for (const c of d.constituencies) {
        for (const w of c.wards) {
          if (w.id === wardId) return { province: p, district: d, constituency: c, ward: w };
        }
      }
    }
  }
  return null;
}

export function WardECZEntryPage() {
  const rawUser = typeof window !== 'undefined' ? sessionStorage.getItem('boz_election_user') : null;
  const user = rawUser ? JSON.parse(rawUser) : null;
  const wardId: string = user?.scopeId || '';
  const wardName: string = user?.scopeName || '';

  const chain = useMemo(() => (wardId ? findWardChain(wardId) : null), [wardId]);
  const resolvedWardName = chain?.ward.name || wardName;

  const [electionType, setElectionType] = useState<ElectionType>('presidential');
  const [enteredBy, setEnteredBy] = useState('');
  const [rejectedBallots, setRejectedBallots] = useState('');
  const [candidateVotes, setCandidateVotes] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [existing, setExisting] = useState<{ enteredBy?: string; savedAt?: string } | null>(null);

  const [agentSubs, setAgentSubs] = useState<Submission[]>([]);
  const [loadingAgents, setLoadingAgents] = useState(false);

  const candidates: Candidate[] = useMemo(() => {
    if (electionType === 'presidential') return presidentialCandidates;
    if (electionType === 'parliament') return chain?.constituency.mpCandidates ?? [];
    if (electionType === 'mayoral') return chain?.district.mayoralCandidates ?? [];
    if (electionType === 'councillor') return chain?.ward.councillorCandidates ?? [];
    return [];
  }, [electionType, chain]);

  // Map ECZ election type naming ('mp') vs submission naming ('parliament')
  const submissionElectionType = electionType === 'parliament' ? 'parliament' : electionType;
  const eczElectionType = electionType === 'parliament' ? 'mp' : electionType;

  useEffect(() => {
    if (!wardId) return;
    setLoadingAgents(true);
    dataEntryApi.listSubmissions({ electionType: submissionElectionType, wardId })
      .then(res => {
        let subs = (res.submissions as Submission[]) || [];
        subs = subs.filter(s => s.wardId === wardId);
        setAgentSubs(subs);
      })
      .catch(() => setAgentSubs([]))
      .finally(() => setLoadingAgents(false));

    dataEntryApi.getECZFigure('ward', wardId, eczElectionType)
      .then(res => {
        if (res.exists && res.figure) {
          const data = res.figure as { enteredBy?: string; savedAt?: string; rejectedBallots?: number; figures?: SubmissionCandidateVote[] };
          setExisting(data);
          setEnteredBy(data.enteredBy || '');
          setRejectedBallots(String(data.rejectedBallots ?? ''));
          const cv: Record<string, string> = {};
          (data.figures || []).forEach(f => { cv[f.candidateId] = String(f.votes); });
          setCandidateVotes(cv);
        } else {
          setExisting(null);
          setRejectedBallots('');
          setCandidateVotes({});
        }
      })
      .catch(() => { setExisting(null); });

    setSaved(false);
    setError('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wardId, electionType]);

  const pendingCount = agentSubs.filter(s => s.status !== 'approved' && s.status !== 'rejected').length;
  const approvedSubs = agentSubs.filter(s => s.status === 'approved');

  const approvedTotals = useMemo(() => {
    const perCandidate: Record<string, number> = {};
    let rejected = 0, total = 0, registered = 0;
    for (const s of approvedSubs) {
      const list = s.candidateResults || s.candidates || [];
      for (const c of list) perCandidate[c.candidateId] = (perCandidate[c.candidateId] || 0) + (c.votes || 0);
      rejected += s.rejectedBallots ?? s.totalRejected ?? 0;
      total += s.totalVotesCast ?? s.totalVotes ?? 0;
      registered += s.registeredVoters ?? 0;
    }
    return { perCandidate, rejected, total, registered };
  }, [approvedSubs]);

  const canEnterFigures = pendingCount === 0 && agentSubs.length > 0;

  // Registered voters comes from ECZ's own published register for this ward
  // (rptPDListing20260508.md), not from summing whatever agents typed into
  // their own submissions — that figure can drift from ECZ's numbers.
  const authoritativeRegistered = useMemo(
    () => chain?.ward.pollingStations.reduce((sum, s) => sum + (s.registeredVoters || 0), 0) ?? 0,
    [chain]
  );
  const registeredInt = authoritativeRegistered;

  // Total votes cast auto-calculates from whatever candidate votes + rejected
  // ballots have been entered so far, live, as the manager types.
  const liveCandidateFigures = useMemo(
    () => candidates.map(c => ({ candidateId: c.id, votes: parseInt(candidateVotes[c.id] ?? '0') || 0 })),
    [candidates, candidateVotes]
  );
  const sumCandidates = liveCandidateFigures.reduce((s, f) => s + f.votes, 0);
  const rejectedIntLive = parseInt(rejectedBallots) || 0;
  const computedTotalVotesCast = sumCandidates + rejectedIntLive;

  const handleVoteChange = (candidateId: string, value: string) => {
    setCandidateVotes(prev => ({ ...prev, [candidateId]: value.replace(/[^0-9]/g, '') }));
  };

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!wardId) { setError('Your account is not linked to a ward.'); return; }
    if (!enteredBy.trim()) { setError('Please enter the name of the person entering these figures.'); return; }

    const figures = liveCandidateFigures;
    const rejectedInt = rejectedIntLive;
    const totalInt = computedTotalVotesCast;

    // Equality gate: ECZ figures for this ward must equal the sum of approved
    // polling agent submissions for this ward and election type. Registered
    // voters and total votes cast are auto-derived, so they can only ever
    // mismatch through the candidate/rejected-ballot figures themselves.
    const mismatches: string[] = [];
    if (rejectedInt !== approvedTotals.rejected) {
      mismatches.push(`Rejected ballots: ECZ ${rejectedInt.toLocaleString()} vs Agents ${approvedTotals.rejected.toLocaleString()}`);
    }
    if (totalInt !== approvedTotals.total) {
      mismatches.push(`Total votes cast: ECZ ${totalInt.toLocaleString()} vs Agents ${approvedTotals.total.toLocaleString()}`);
    }
    for (const f of figures) {
      const agentVotes = approvedTotals.perCandidate[f.candidateId] || 0;
      if (f.votes !== agentVotes) {
        const name = candidates.find(c => c.id === f.candidateId)?.name || f.candidateId;
        mismatches.push(`${name}: ECZ ${f.votes.toLocaleString()} vs Agents ${agentVotes.toLocaleString()}`);
      }
    }
    if (mismatches.length > 0) {
      setError(`ECZ figures must equal the approved polling agent totals for ${resolvedWardName}. Mismatch found:\n${mismatches.join('\n')}`);
      return;
    }

    setSaving(true);
    try {
      await dataEntryApi.saveECZFigure({
        levelType: 'ward',
        levelId: wardId,
        levelName: resolvedWardName,
        electionType: eczElectionType,
        totalVotesCast: totalInt,
        rejectedBallots: rejectedInt,
        registeredVoters: registeredInt,
        figures,
        enteredBy: enteredBy.trim(),
        constituencyId: chain?.constituency.id,
        districtId: chain?.district.id,
        provinceId: chain?.province.id,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 4000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save ECZ figures.');
    } finally {
      setSaving(false);
    }
  }

  if (!wardId) {
    return (
      <div className="rounded-2xl p-6 flex flex-col items-center gap-3 text-center" style={{ backgroundColor: '#007A30', border: '1px solid rgba(255,255,255,0.07)' }}>
        <ShieldAlert size={32} style={{ color: '#f59e0b' }} />
        <p style={{ color: '#fff', fontFamily: 'Oswald, sans-serif', fontSize: '1rem' }}>Ward Not Configured</p>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', maxWidth: 420 }}>
          Your account isn't linked to a specific ward yet. Please contact your Build One Zambia administrator.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
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

      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ backgroundColor: 'rgba(22,163,74,0.1)', border: '1px solid rgba(22,163,74,0.3)' }}>
        <Lock size={13} style={{ color: '#16a34a' }} />
        <span style={{ color: '#16a34a', fontSize: '0.75rem', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.08em' }}>
          {resolvedWardName?.toUpperCase() || 'YOUR WARD'} — LOCKED TO YOUR ASSIGNED WARD
        </span>
      </div>

      {!canEnterFigures && (
        <div className="flex items-start gap-3 px-4 py-3 rounded-xl" style={{ backgroundColor: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
          <AlertCircle size={16} style={{ color: '#f59e0b', marginTop: 2, flexShrink: 0 }} />
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', lineHeight: 1.5 }}>
            {agentSubs.length === 0
              ? 'No polling agent submissions have been received yet for this election type in your ward. ECZ figures cannot be entered until agents submit and you approve their results.'
              : `${pendingCount} polling agent submission${pendingCount !== 1 ? 's' : ''} still need review. Go to Polling Agents Figures and mark each as Approved or Not Approved before entering ECZ figures.`}
          </p>
        </div>
      )}

      {canEnterFigures && (
        <div className="flex items-start gap-3 px-4 py-3 rounded-xl" style={{ backgroundColor: 'rgba(22,163,74,0.08)', border: '1px solid rgba(22,163,74,0.2)' }}>
          <CheckCircle2 size={16} style={{ color: '#16a34a', marginTop: 2, flexShrink: 0 }} />
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', lineHeight: 1.5 }}>
            All {agentSubs.length} polling agent submission{agentSubs.length !== 1 ? 's' : ''} reviewed
            ({approvedSubs.length} approved). Enter the ECZ announced figures below — they must equal the approved
            agent totals shown for this ward.
          </p>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-5">
        <div className="rounded-2xl p-6" style={{ backgroundColor: '#007A30', border: '1px solid rgba(255,255,255,0.07)' }}>
          <h2 className="mb-4" style={{ color: '#fff', fontFamily: 'Oswald, sans-serif', fontSize: '1.05rem' }}>
            <Scale className="inline w-5 h-5 mr-2" style={{ color: '#16a34a' }} />
            ECZ Announced Votes per Candidate
          </h2>

          {candidates.length === 0 ? (
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>
              No candidates configured for this election type in your ward yet.
            </p>
          ) : (
            <div className="space-y-3">
              {candidates.map(c => {
                const agentVal = approvedTotals.perCandidate[c.id] || 0;
                const eczVal = parseInt(candidateVotes[c.id] ?? '0') || 0;
                const mismatch = canEnterFigures && candidateVotes[c.id] !== undefined && candidateVotes[c.id] !== '' && eczVal !== agentVal;
                return (
                  <div key={c.id} className="flex items-center gap-3">
                    <div className="w-1.5 self-stretch rounded-full flex-shrink-0" style={{ background: c.partyColor }} />
                    <div className="flex-1 min-w-0">
                      <p style={{ color: '#fff', fontSize: '0.85rem' }}>{c.name}</p>
                      <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.72rem' }}>{c.party} · Agents: {agentVal.toLocaleString()}</p>
                    </div>
                    <input
                      type="text"
                      inputMode="numeric"
                      disabled={!canEnterFigures}
                      value={candidateVotes[c.id] ?? ''}
                      onChange={e => handleVoteChange(c.id, e.target.value)}
                      placeholder="0"
                      className="w-32 px-3 py-2 rounded-lg text-right font-mono text-sm disabled:opacity-40"
                      style={{
                        backgroundColor: 'rgba(255,255,255,0.06)',
                        border: `1px solid ${mismatch ? '#dc2626' : 'rgba(255,255,255,0.1)'}`,
                        color: '#fff', outline: 'none',
                      }}
                    />
                  </div>
                );
              })}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-5" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
            <div>
              <label className="block text-xs mb-1.5 flex items-center gap-1.5" style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.06em' }}>
                REGISTERED VOTERS
                <span className="text-[10px] px-1 rounded" style={{ background: 'rgba(22,163,74,0.2)', color: '#16a34a' }}>ECZ register</span>
              </label>
              <div className="w-full px-3 py-2.5 rounded-lg font-mono text-sm relative" style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff' }}>
                {registeredInt > 0 ? registeredInt.toLocaleString() : '—'}
                {registeredInt > 0 && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs" style={{ color: '#16a34a' }}>✓</span>}
              </div>
              {canEnterFigures && approvedTotals.registered !== authoritativeRegistered && (
                <p style={{ color: '#f59e0b', fontSize: '0.68rem', marginTop: 4 }}>
                  ⚠ Agents reported {approvedTotals.registered.toLocaleString()} — differs from the ECZ figure above
                </p>
              )}
            </div>
            <div>
              <label className="block text-xs mb-1.5 flex items-center gap-1.5" style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.06em' }}>
                TOTAL VOTES CAST
                <span className="text-[10px] px-1 rounded" style={{ background: 'rgba(22,163,74,0.2)', color: '#16a34a' }}>Auto-calculated</span>
              </label>
              <div className="w-full px-3 py-2.5 rounded-lg font-mono text-sm" style={{
                backgroundColor: 'rgba(255,255,255,0.03)',
                border: `1px solid ${canEnterFigures && computedTotalVotesCast !== approvedTotals.total ? '#dc2626' : 'rgba(255,255,255,0.08)'}`,
                color: '#fff',
              }}>
                {computedTotalVotesCast.toLocaleString()}
              </div>
              <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.68rem', marginTop: 4 }}>
                Candidate votes + rejected ballots · Agents: {approvedTotals.total.toLocaleString()}
              </p>
            </div>
            <div>
              <label className="block text-xs mb-1.5" style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.06em' }}>
                REJECTED BALLOTS (ECZ) — Agents: {approvedTotals.rejected.toLocaleString()}
              </label>
              <input
                type="text" inputMode="numeric" disabled={!canEnterFigures}
                value={rejectedBallots}
                onChange={e => setRejectedBallots(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="0"
                className="w-full px-3 py-2.5 rounded-lg font-mono text-sm disabled:opacity-40"
                style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', outline: 'none' }}
              />
            </div>
          </div>
        </div>

        <div className="rounded-2xl p-6" style={{ backgroundColor: '#007A30', border: '1px solid rgba(255,255,255,0.07)' }}>
          <label className="block text-xs mb-1.5" style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.06em' }}>
            NAME OF PERSON ENTERING THESE FIGURES
          </label>
          <input
            type="text" disabled={!canEnterFigures}
            value={enteredBy}
            onChange={e => setEnteredBy(e.target.value)}
            placeholder="Full name — e.g. Grace Mwansa, Ward Manager"
            className="w-full px-3 py-2.5 rounded-lg text-sm disabled:opacity-40"
            style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', outline: 'none' }}
          />
          {existing?.enteredBy && (
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.72rem', marginTop: 8 }}>
              Existing figures were entered by {existing.enteredBy}{existing.savedAt ? ` on ${new Date(existing.savedAt).toLocaleString()}` : ''}. Saving will overwrite them.
            </p>
          )}
        </div>

        {error && (
          <div className="px-4 py-3 rounded-xl text-sm whitespace-pre-line" style={{ backgroundColor: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.3)', color: '#f87171' }}>
            {error}
          </div>
        )}
        {saved && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm" style={{ backgroundColor: 'rgba(22,163,74,0.1)', border: '1px solid rgba(22,163,74,0.3)', color: '#16a34a' }}>
            <CheckCircle2 size={16} />
            ECZ figures saved for {resolvedWardName}. They match the approved polling agent totals.
          </div>
        )}

        <button
          type="submit"
          disabled={!canEnterFigures || saving || loadingAgents}
          className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ background: '#16a34a', color: '#fff', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.04em' }}
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {saving ? 'Saving…' : 'Save ECZ Announced Figures'}
        </button>
      </form>
    </div>
  );
}

export default WardECZEntryPage;
