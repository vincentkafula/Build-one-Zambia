import { useState, useEffect, useMemo } from 'react';
import { Scale, Save, CheckCircle2, AlertCircle, Loader2, Lock, ShieldAlert } from 'lucide-react';
import { dataEntryApi } from '../lib/api';
import { provinces, presidentialCandidates, Candidate } from '../data/mockData';

type ElectionType = 'presidential' | 'parliament' | 'mayoral' | 'councillor';

const ELECTION_OPTIONS: { value: ElectionType; label: string }[] = [
  { value: 'presidential', label: 'Presidential' },
  { value: 'parliament', label: 'National Assembly (MP)' },
  { value: 'mayoral', label: 'Mayoral / Council Chairperson' },
  { value: 'councillor', label: 'Ward Councillor' },
];

// Only Presidential shares one candidate list across an entire province.
// Mayoral (per district), Parliament (per constituency) and Councillor
// (per ward) all have different candidates within the same province.
const COMBINABLE: ElectionType[] = ['presidential'];

interface ECZFigureCandidate { candidateId: string; votes: number; }
interface DistrictFigure {
  levelId: string;
  status: string;
  figures?: ECZFigureCandidate[];
  totalVotesCast?: number;
  totalVotes?: number;
  rejectedBallots?: number;
  registeredVoters?: number;
  provinceId?: string;
}

function findProvinceChain(provinceId: string) {
  for (const p of provinces) {
    if (p.id === provinceId) return { province: p };
  }
  return null;
}

export function ProvinceECZEntryPage() {
  const rawUser = typeof window !== 'undefined' ? sessionStorage.getItem('boz_election_user') : null;
  const user = rawUser ? JSON.parse(rawUser) : null;
  const provinceId: string = user?.scopeId || '';
  const provinceNameFallback: string = user?.scopeName || '';

  const chain = useMemo(() => (provinceId ? findProvinceChain(provinceId) : null), [provinceId]);
  const resolvedProvinceName = chain?.province.name || provinceNameFallback;

  const [electionType, setElectionType] = useState<ElectionType>('presidential');
  const [enteredBy, setEnteredBy] = useState('');
  const [rejectedBallots, setRejectedBallots] = useState('');
  const [candidateVotes, setCandidateVotes] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [existing, setExisting] = useState<{ enteredBy?: string; savedAt?: string } | null>(null);

  const [districtFigures, setDistrictFigures] = useState<DistrictFigure[]>([]);
  const [loadingDistricts, setLoadingDistricts] = useState(false);

  const candidates: Candidate[] = useMemo(() => {
    if (electionType === 'presidential') return presidentialCandidates;
    return [];
  }, [electionType]);

  const eczElectionType = electionType === 'parliament' ? 'mp' : electionType;
  const totalDistrictsInProvince = chain?.province.districts.length ?? 0;
  const isCombinable = COMBINABLE.includes(electionType);

  useEffect(() => {
    if (!provinceId) return;
    setLoadingDistricts(true);
    dataEntryApi.listECZFigures({ electionType: eczElectionType, levelType: 'district', provinceId })
      .then(res => {
        let figs = (res.figures as DistrictFigure[]) || [];
        figs = figs.filter(f => f.provinceId === provinceId);
        setDistrictFigures(figs);
      })
      .catch(() => setDistrictFigures([]))
      .finally(() => setLoadingDistricts(false));

    dataEntryApi.getECZFigure('province', provinceId, eczElectionType)
      .then(res => {
        if (res.exists && res.figure) {
          const data = res.figure as { enteredBy?: string; savedAt?: string; rejectedBallots?: number; figures?: ECZFigureCandidate[] };
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
      .catch(() => setExisting(null));

    setSaved(false);
    setError('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [provinceId, electionType]);

  const pendingCount = districtFigures.filter(f => f.status !== 'approved' && f.status !== 'rejected').length;
  const approvedFigs = districtFigures.filter(f => f.status === 'approved');

  const approvedTotals = useMemo(() => {
    const perCandidate: Record<string, number> = {};
    let rejected = 0, total = 0, registered = 0;
    for (const f of approvedFigs) {
      for (const c of f.figures || []) perCandidate[c.candidateId] = (perCandidate[c.candidateId] || 0) + (c.votes || 0);
      rejected += f.rejectedBallots ?? 0;
      total += f.totalVotesCast ?? f.totalVotes ?? 0;
      registered += f.registeredVoters ?? 0;
    }
    return { perCandidate, rejected, total, registered };
  }, [approvedFigs]);

  const canEnterFigures = isCombinable && pendingCount === 0 && districtFigures.length > 0;

  // Registered voters comes from ECZ's own published register for this
  // province (rptPDListing20260508.md), not from summing whatever districts
  // reported in their own submissions.
  const authoritativeRegistered = useMemo(
    () => chain?.province.districts.reduce(
      (sum, d) => sum + d.constituencies.reduce(
        (s, c) => s + c.wards.reduce(
          (ss, w) => ss + w.pollingStations.reduce((sss, p) => sss + (p.registeredVoters || 0), 0), 0
        ), 0
      ), 0
    ) ?? 0,
    [chain]
  );
  const registeredInt = authoritativeRegistered;
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

    if (!provinceId) { setError('Your account is not linked to a province.'); return; }
    if (!isCombinable) { setError('This race has different candidates in each district/constituency/ward within the province, so ECZ figures cannot be entered at province level for it.'); return; }
    if (!enteredBy.trim()) { setError('Please enter the name of the person entering these figures.'); return; }

    const figures = liveCandidateFigures;
    const rejectedInt = rejectedIntLive;
    const totalInt = computedTotalVotesCast;

    // Equality gate: ECZ figures for this province must equal the sum of
    // approved district manager figures for this province and election type.
    // Registered voters and total votes cast are auto-derived, so they can
    // only mismatch through the candidate/rejected-ballot figures.
    const mismatches: string[] = [];
    if (rejectedInt !== approvedTotals.rejected) {
      mismatches.push(`Rejected ballots: ECZ ${rejectedInt.toLocaleString()} vs Districts ${approvedTotals.rejected.toLocaleString()}`);
    }
    if (totalInt !== approvedTotals.total) {
      mismatches.push(`Total votes cast: ECZ ${totalInt.toLocaleString()} vs Districts ${approvedTotals.total.toLocaleString()}`);
    }
    for (const f of figures) {
      const distVotes = approvedTotals.perCandidate[f.candidateId] || 0;
      if (f.votes !== distVotes) {
        const name = candidates.find(c => c.id === f.candidateId)?.name || f.candidateId;
        mismatches.push(`${name}: ECZ ${f.votes.toLocaleString()} vs Districts ${distVotes.toLocaleString()}`);
      }
    }
    if (mismatches.length > 0) {
      setError(`ECZ figures must equal the approved district manager totals for ${resolvedProvinceName}. Mismatch found:\n${mismatches.join('\n')}`);
      return;
    }

    setSaving(true);
    try {
      await dataEntryApi.saveECZFigure({
        levelType: 'province',
        levelId: provinceId,
        levelName: resolvedProvinceName,
        electionType: eczElectionType,
        totalVotesCast: totalInt,
        rejectedBallots: rejectedInt,
        registeredVoters: registeredInt,
        figures,
        enteredBy: enteredBy.trim(),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 4000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save ECZ figures.');
    } finally {
      setSaving(false);
    }
  }

  if (!provinceId) {
    return (
      <div className="rounded-2xl p-6 flex flex-col items-center gap-3 text-center" style={{ backgroundColor: '#123322', border: '1px solid rgba(255,255,255,0.07)' }}>
        <ShieldAlert size={32} style={{ color: '#f59e0b' }} />
        <p style={{ color: '#fff', fontFamily: 'Oswald, sans-serif', fontSize: '1rem' }}>Province Not Configured</p>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', maxWidth: 420 }}>
          Your account isn't linked to a specific province yet. Please contact your Build One Zambia administrator.
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
          {resolvedProvinceName?.toUpperCase() || 'YOUR PROVINCE'} — LOCKED TO YOUR ASSIGNED PROVINCE
        </span>
      </div>

      {!isCombinable ? (
        <div className="flex items-start gap-3 px-4 py-3 rounded-xl" style={{ backgroundColor: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
          <AlertCircle size={16} style={{ color: '#f59e0b', marginTop: 2, flexShrink: 0 }} />
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', lineHeight: 1.5 }}>
            {electionType === 'mayoral'
              ? 'Mayoral / Council Chairperson candidates differ per district, so there\'s no single combined figure to enter for the whole province.'
              : electionType === 'parliament'
              ? 'National Assembly candidates differ per constituency, so there\'s no single combined figure to enter for the whole province.'
              : 'Ward Councillor candidates differ per ward, so there\'s no single combined figure to enter for the whole province.'}
            {' '}Each district/constituency/ward's own ECZ entry is the record of truth for this race.
          </p>
        </div>
      ) : !canEnterFigures ? (
        <div className="flex items-start gap-3 px-4 py-3 rounded-xl" style={{ backgroundColor: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
          <AlertCircle size={16} style={{ color: '#f59e0b', marginTop: 2, flexShrink: 0 }} />
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', lineHeight: 1.5 }}>
            {districtFigures.length === 0
              ? 'No district manager figures have been received yet for this election type in your province. ECZ figures cannot be entered until district managers submit and you approve their results.'
              : `${pendingCount} district manager figure${pendingCount !== 1 ? 's' : ''} still need review. Go to District Manager Figures and mark each as Approved or Not Approved before entering ECZ figures.`}
          </p>
        </div>
      ) : (
        <div className="flex items-start gap-3 px-4 py-3 rounded-xl" style={{ backgroundColor: 'rgba(22,163,74,0.08)', border: '1px solid rgba(22,163,74,0.2)' }}>
          <CheckCircle2 size={16} style={{ color: '#16a34a', marginTop: 2, flexShrink: 0 }} />
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', lineHeight: 1.5 }}>
            All {districtFigures.length} district manager figure{districtFigures.length !== 1 ? 's' : ''} reviewed
            ({approvedFigs.length} approved, out of {totalDistrictsInProvince || districtFigures.length} districts). Enter the ECZ
            announced figures below — they must equal the approved district totals shown for this province.
          </p>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-5">
        <fieldset disabled={!isCombinable} style={{ opacity: isCombinable ? 1 : 0.5 }} className="space-y-5">
        <div className="rounded-2xl p-6" style={{ backgroundColor: '#123322', border: '1px solid rgba(255,255,255,0.07)' }}>
          <h2 className="mb-4" style={{ color: '#fff', fontFamily: 'Oswald, sans-serif', fontSize: '1.05rem' }}>
            <Scale className="inline w-5 h-5 mr-2" style={{ color: '#16a34a' }} />
            ECZ Announced Votes per Candidate
          </h2>

          {candidates.length === 0 ? (
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>
              No candidates configured for this election type at province level.
            </p>
          ) : (
            <div className="space-y-3">
              {candidates.map(c => {
                const distVal = approvedTotals.perCandidate[c.id] || 0;
                const eczVal = parseInt(candidateVotes[c.id] ?? '0') || 0;
                const mismatch = canEnterFigures && candidateVotes[c.id] !== undefined && candidateVotes[c.id] !== '' && eczVal !== distVal;
                return (
                  <div key={c.id} className="flex items-center gap-3">
                    <div className="w-1.5 self-stretch rounded-full flex-shrink-0" style={{ background: c.partyColor }} />
                    <div className="flex-1 min-w-0">
                      <p style={{ color: '#fff', fontSize: '0.85rem' }}>{c.name}</p>
                      <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.72rem' }}>{c.party} · Districts: {distVal.toLocaleString()}</p>
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
                  ⚠ Districts reported {approvedTotals.registered.toLocaleString()} — differs from the ECZ figure above
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
                Candidate votes + rejected ballots · Districts: {approvedTotals.total.toLocaleString()}
              </p>
            </div>
            <div>
              <label className="block text-xs mb-1.5" style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.06em' }}>
                REJECTED BALLOTS (ECZ) — Districts: {approvedTotals.rejected.toLocaleString()}
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

        <div className="rounded-2xl p-6" style={{ backgroundColor: '#123322', border: '1px solid rgba(255,255,255,0.07)' }}>
          <label className="block text-xs mb-1.5" style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.06em' }}>
            NAME OF PERSON ENTERING THESE FIGURES
          </label>
          <input
            type="text" disabled={!canEnterFigures}
            value={enteredBy}
            onChange={e => setEnteredBy(e.target.value)}
            placeholder="Full name — e.g. Mutale Chibwe, Provincial Manager"
            className="w-full px-3 py-2.5 rounded-lg text-sm disabled:opacity-40"
            style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', outline: 'none' }}
          />
          {existing?.enteredBy && (
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.72rem', marginTop: 8 }}>
              Existing figures were entered by {existing.enteredBy}{existing.savedAt ? ` on ${new Date(existing.savedAt).toLocaleString()}` : ''}. Saving will overwrite them.
            </p>
          )}
        </div>
        </fieldset>

        {error && (
          <div className="px-4 py-3 rounded-xl text-sm whitespace-pre-line" style={{ backgroundColor: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.3)', color: '#f87171' }}>
            {error}
          </div>
        )}
        {saved && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm" style={{ backgroundColor: 'rgba(22,163,74,0.1)', border: '1px solid rgba(22,163,74,0.3)', color: '#16a34a' }}>
            <CheckCircle2 size={16} />
            ECZ figures saved for {resolvedProvinceName}. They match the approved district manager totals.
          </div>
        )}

        <button
          type="submit"
          disabled={!canEnterFigures || saving || loadingDistricts}
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

export default ProvinceECZEntryPage;
