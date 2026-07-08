import { useState, useEffect, useMemo } from 'react';
import { Scale, Save, CheckCircle2, AlertCircle, Loader2, Lock } from 'lucide-react';
import { dataEntryApi } from '../lib/api';
import { provinces, presidentialCandidates, Candidate } from '../data/mockData';

type ElectionType = 'presidential' | 'parliament' | 'mayoral' | 'councillor';

const ELECTION_OPTIONS: { value: ElectionType; label: string }[] = [
  { value: 'presidential', label: 'Presidential' },
  { value: 'parliament', label: 'National Assembly (MP)' },
  { value: 'mayoral', label: 'Mayoral / Council Chairperson' },
  { value: 'councillor', label: 'Ward Councillor' },
];

// Only Presidential shares one nationwide candidate list. Mayoral (per
// district), Parliament (per constituency) and Councillor (per ward) all
// have different candidates in different parts of the country.
const COMBINABLE: ElectionType[] = ['presidential'];

const NATIONAL_ID = 'zambia';
const NATIONAL_NAME = 'Republic of Zambia';

interface ECZFigureCandidate { candidateId: string; votes: number; }
interface ProvinceFigure {
  levelId: string;
  status: string;
  figures?: ECZFigureCandidate[];
  totalVotesCast?: number;
  totalVotes?: number;
  rejectedBallots?: number;
}

export function NationalECZEntryPage() {
  const [electionType, setElectionType] = useState<ElectionType>('presidential');
  const [enteredBy, setEnteredBy] = useState('');
  const [totalVotesCast, setTotalVotesCast] = useState('');
  const [rejectedBallots, setRejectedBallots] = useState('');
  const [candidateVotes, setCandidateVotes] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [existing, setExisting] = useState<{ enteredBy?: string; savedAt?: string } | null>(null);

  const [provinceFigures, setProvinceFigures] = useState<ProvinceFigure[]>([]);
  const [loadingProvinces, setLoadingProvinces] = useState(false);

  const candidates: Candidate[] = useMemo(() => {
    if (electionType === 'presidential') return presidentialCandidates;
    return [];
  }, [electionType]);

  const eczElectionType = electionType === 'parliament' ? 'mp' : electionType;
  const totalProvincesNational = provinces.length;
  const isCombinable = COMBINABLE.includes(electionType);

  useEffect(() => {
    setLoadingProvinces(true);
    dataEntryApi.listECZFigures({ electionType: eczElectionType, levelType: 'province' })
      .then(res => setProvinceFigures((res.figures as ProvinceFigure[]) || []))
      .catch(() => setProvinceFigures([]))
      .finally(() => setLoadingProvinces(false));

    dataEntryApi.getECZFigure('national', NATIONAL_ID, eczElectionType)
      .then(res => {
        if (res.exists && res.figure) {
          const data = res.figure as { enteredBy?: string; savedAt?: string; totalVotesCast?: number; rejectedBallots?: number; figures?: ECZFigureCandidate[] };
          setExisting(data);
          setEnteredBy(data.enteredBy || '');
          setTotalVotesCast(String(data.totalVotesCast ?? ''));
          setRejectedBallots(String(data.rejectedBallots ?? ''));
          const cv: Record<string, string> = {};
          (data.figures || []).forEach(f => { cv[f.candidateId] = String(f.votes); });
          setCandidateVotes(cv);
        } else {
          setExisting(null);
          setTotalVotesCast('');
          setRejectedBallots('');
          setCandidateVotes({});
        }
      })
      .catch(() => setExisting(null));

    setSaved(false);
    setError('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [electionType]);

  const pendingCount = provinceFigures.filter(f => f.status !== 'approved' && f.status !== 'rejected').length;
  const approvedFigs = provinceFigures.filter(f => f.status === 'approved');

  const approvedTotals = useMemo(() => {
    const perCandidate: Record<string, number> = {};
    let rejected = 0, total = 0;
    for (const f of approvedFigs) {
      for (const c of f.figures || []) perCandidate[c.candidateId] = (perCandidate[c.candidateId] || 0) + (c.votes || 0);
      rejected += f.rejectedBallots ?? 0;
      total += f.totalVotesCast ?? f.totalVotes ?? 0;
    }
    return { perCandidate, rejected, total };
  }, [approvedFigs]);

  const canEnterFigures = isCombinable && pendingCount === 0 && provinceFigures.length > 0;

  const handleVoteChange = (candidateId: string, value: string) => {
    setCandidateVotes(prev => ({ ...prev, [candidateId]: value.replace(/[^0-9]/g, '') }));
  };

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!isCombinable) { setError('This race has different candidates in different parts of the country, so ECZ figures cannot be entered at national level for it.'); return; }
    if (!enteredBy.trim()) { setError('Please enter the name of the person entering these figures.'); return; }

    const figures = candidates.map(c => ({ candidateId: c.id, votes: parseInt(candidateVotes[c.id] ?? '0') || 0 }));
    const sumCandidates = figures.reduce((s, f) => s + f.votes, 0);
    const rejectedInt = parseInt(rejectedBallots) || 0;
    const totalInt = parseInt(totalVotesCast) || 0;

    if (sumCandidates + rejectedInt !== totalInt) {
      setError(`Candidate votes (${sumCandidates.toLocaleString()}) + Rejected ballots (${rejectedInt.toLocaleString()}) = ${(sumCandidates + rejectedInt).toLocaleString()}, but Total Votes Cast is ${totalInt.toLocaleString()}. These must match.`);
      return;
    }

    // Equality gate: ECZ figures for the nation must equal the sum of
    // approved provincial manager figures for this election type.
    const mismatches: string[] = [];
    if (rejectedInt !== approvedTotals.rejected) {
      mismatches.push(`Rejected ballots: ECZ ${rejectedInt.toLocaleString()} vs Provinces ${approvedTotals.rejected.toLocaleString()}`);
    }
    if (totalInt !== approvedTotals.total) {
      mismatches.push(`Total votes cast: ECZ ${totalInt.toLocaleString()} vs Provinces ${approvedTotals.total.toLocaleString()}`);
    }
    for (const f of figures) {
      const provVotes = approvedTotals.perCandidate[f.candidateId] || 0;
      if (f.votes !== provVotes) {
        const name = candidates.find(c => c.id === f.candidateId)?.name || f.candidateId;
        mismatches.push(`${name}: ECZ ${f.votes.toLocaleString()} vs Provinces ${provVotes.toLocaleString()}`);
      }
    }
    if (mismatches.length > 0) {
      setError(`ECZ figures must equal the approved provincial manager totals for the Nation. Mismatch found:\n${mismatches.join('\n')}`);
      return;
    }

    setSaving(true);
    try {
      await dataEntryApi.saveECZFigure({
        levelType: 'national',
        levelId: NATIONAL_ID,
        levelName: NATIONAL_NAME,
        electionType: eczElectionType,
        totalVotesCast: totalInt,
        rejectedBallots: rejectedInt,
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
          REPUBLIC OF ZAMBIA — NATIONAL LEVEL
        </span>
      </div>

      {!isCombinable ? (
        <div className="flex items-start gap-3 px-4 py-3 rounded-xl" style={{ backgroundColor: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
          <AlertCircle size={16} style={{ color: '#f59e0b', marginTop: 2, flexShrink: 0 }} />
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', lineHeight: 1.5 }}>
            {electionType === 'mayoral'
              ? 'Mayoral / Council Chairperson candidates differ per district, so there\'s no single combined figure to enter for the whole country.'
              : electionType === 'parliament'
              ? 'National Assembly candidates differ per constituency, so there\'s no single combined figure to enter for the whole country.'
              : 'Ward Councillor candidates differ per ward, so there\'s no single combined figure to enter for the whole country.'}
            {' '}Each province/district/constituency/ward's own ECZ entry is the record of truth for this race.
          </p>
        </div>
      ) : !canEnterFigures ? (
        <div className="flex items-start gap-3 px-4 py-3 rounded-xl" style={{ backgroundColor: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
          <AlertCircle size={16} style={{ color: '#f59e0b', marginTop: 2, flexShrink: 0 }} />
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', lineHeight: 1.5 }}>
            {provinceFigures.length === 0
              ? 'No provincial manager figures have been received yet for this election type. ECZ figures cannot be entered until provincial managers submit and you approve their results.'
              : `${pendingCount} provincial manager figure${pendingCount !== 1 ? 's' : ''} still need review. Go to Province Manager Figures and mark each as Approved or Not Approved before entering ECZ figures.`}
          </p>
        </div>
      ) : (
        <div className="flex items-start gap-3 px-4 py-3 rounded-xl" style={{ backgroundColor: 'rgba(22,163,74,0.08)', border: '1px solid rgba(22,163,74,0.2)' }}>
          <CheckCircle2 size={16} style={{ color: '#16a34a', marginTop: 2, flexShrink: 0 }} />
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', lineHeight: 1.5 }}>
            All {provinceFigures.length} provincial manager figure{provinceFigures.length !== 1 ? 's' : ''} reviewed
            ({approvedFigs.length} approved, out of {totalProvincesNational || provinceFigures.length} provinces). Enter the ECZ
            announced figures below — they must equal the approved provincial totals shown for the Nation.
          </p>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-5">
        <fieldset disabled={!isCombinable} style={{ opacity: isCombinable ? 1 : 0.5 }} className="space-y-5">
        <div className="rounded-2xl p-6" style={{ backgroundColor: '#0f1f33', border: '1px solid rgba(255,255,255,0.07)' }}>
          <h2 className="mb-4" style={{ color: '#fff', fontFamily: 'Oswald, sans-serif', fontSize: '1.05rem' }}>
            <Scale className="inline w-5 h-5 mr-2" style={{ color: '#16a34a' }} />
            ECZ Announced Votes per Candidate
          </h2>

          {candidates.length === 0 ? (
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>
              No candidates configured for this election type at national level.
            </p>
          ) : (
            <div className="space-y-3">
              {candidates.map(c => {
                const provVal = approvedTotals.perCandidate[c.id] || 0;
                const eczVal = parseInt(candidateVotes[c.id] ?? '0') || 0;
                const mismatch = canEnterFigures && candidateVotes[c.id] !== undefined && candidateVotes[c.id] !== '' && eczVal !== provVal;
                return (
                  <div key={c.id} className="flex items-center gap-3">
                    <div className="w-1.5 self-stretch rounded-full flex-shrink-0" style={{ background: c.partyColor }} />
                    <div className="flex-1 min-w-0">
                      <p style={{ color: '#fff', fontSize: '0.85rem' }}>{c.name}</p>
                      <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.72rem' }}>{c.party} · Provinces: {provVal.toLocaleString()}</p>
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 pt-5" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
            <div>
              <label className="block text-xs mb-1.5" style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.06em' }}>
                TOTAL VOTES CAST (ECZ) — Provinces: {approvedTotals.total.toLocaleString()}
              </label>
              <input
                type="text" inputMode="numeric" disabled={!canEnterFigures}
                value={totalVotesCast}
                onChange={e => setTotalVotesCast(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="0"
                className="w-full px-3 py-2.5 rounded-lg font-mono text-sm disabled:opacity-40"
                style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', outline: 'none' }}
              />
            </div>
            <div>
              <label className="block text-xs mb-1.5" style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.06em' }}>
                REJECTED BALLOTS (ECZ) — Provinces: {approvedTotals.rejected.toLocaleString()}
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

        <div className="rounded-2xl p-6" style={{ backgroundColor: '#0f1f33', border: '1px solid rgba(255,255,255,0.07)' }}>
          <label className="block text-xs mb-1.5" style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.06em' }}>
            NAME OF PERSON ENTERING THESE FIGURES
          </label>
          <input
            type="text" disabled={!canEnterFigures}
            value={enteredBy}
            onChange={e => setEnteredBy(e.target.value)}
            placeholder="Full name — e.g. Prisca Zulu, National Manager"
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
            ECZ figures saved for the Nation. They match the approved provincial manager totals.
          </div>
        )}

        <button
          type="submit"
          disabled={!canEnterFigures || saving || loadingProvinces}
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

export default NationalECZEntryPage;
