import { useState, useEffect, useMemo } from 'react';
import {
  Users, CheckCircle2, XCircle, Clock, MapPin,
  AlertTriangle, RefreshCw, FileWarning, ShieldCheck,
} from 'lucide-react';
import { dataEntryApi } from '../lib/api';
import { provinces, presidentialCandidates, Candidate } from '../data/mockData';

type ElectionType = 'presidential' | 'parliament' | 'mayoral' | 'councillor';

interface ECZFigureCandidate { candidateId: string; votes: number; }

interface DistrictFigure {
  levelType: string;
  levelId: string; // districtId
  levelName: string;
  electionType: string;
  figures: ECZFigureCandidate[];
  totalVotesCast?: number;
  totalVotes?: number;
  rejectedBallots?: number;
  registeredVoters?: number;
  enteredBy?: string;
  provinceId?: string;
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

function findProvinceChain(provinceId: string) {
  for (const p of provinces) {
    if (p.id === provinceId) return { province: p };
  }
  return null;
}

function resolveCandidateList(electionType: ElectionType, provinceId: string, districtId: string, districtName: string): Candidate[] {
  if (electionType === 'presidential') return presidentialCandidates;
  const chain = findProvinceChain(provinceId);
  if (!chain) return [];
  if (electionType === 'mayoral') {
    const matches = chain.province.districts.filter(d => d.id === districtId);
    const d = matches.length <= 1 ? matches[0] : matches.find(m => m.name === districtName) ?? matches[0];
    return d?.mayoralCandidates ?? [];
  }
  return []; // parliament (per constituency) & councillor (per ward) not resolvable at this level
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

const selectStyle = { backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', outline: 'none' } as const;

export function DistrictManagerFiguresPage() {
  const rawUser = typeof window !== 'undefined' ? sessionStorage.getItem('boz_election_user') : null;
  const user = rawUser ? JSON.parse(rawUser) : null;
  const provinceId: string = user?.scopeId || '';
  const provinceName: string = user?.scopeName || 'your province';

  const chain = useMemo(() => (provinceId ? findProvinceChain(provinceId) : null), [provinceId]);
  const districts = chain?.province.districts ?? [];

  const [electionType, setElectionType] = useState<ElectionType>('presidential');
  const [districtName, setDistrictName] = useState('');
  const selectedDistrict = districts.find(d => d.name === districtName);
  const districtId = selectedDistrict?.id || '';
  const [figures, setFigures] = useState<DistrictFigure[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [actioning, setActioning] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [rejectNote, setRejectNote] = useState('');

  const eczElectionType = ELECTION_OPTIONS.find(o => o.value === electionType)?.eczValue || electionType;

  async function load() {
    setLoading(true);
    setError('');
    try {
      const filters: Record<string, string> = { electionType: eczElectionType, levelType: 'district' };
      if (provinceId) filters.provinceId = provinceId;
      const res = await dataEntryApi.listECZFigures(filters);
      let figs = (res.figures as DistrictFigure[]) || [];
      if (provinceId) figs = figs.filter(f => f.provinceId === provinceId);
      setFigures(figs);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load district manager figures.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [electionType, provinceId]);
  useEffect(() => { setRejecting(false); setRejectNote(''); }, [districtId, electionType]);

  const stats = useMemo(() => {
    const total = figures.length;
    const approved = figures.filter(f => f.status === 'approved').length;
    const rejected = figures.filter(f => f.status === 'rejected').length;
    const pending = total - approved - rejected;
    return { total, approved, rejected, pending };
  }, [figures]);

  const approvedTotals = useMemo(() => {
    const approvedFigs = figures.filter(f => f.status === 'approved');
    const perCandidate: Record<string, number> = {};
    let rejectedBallots = 0, totalVotesCast = 0, registeredVoters = 0;
    for (const f of approvedFigs) {
      for (const c of f.figures || []) perCandidate[c.candidateId] = (perCandidate[c.candidateId] || 0) + (c.votes || 0);
      rejectedBallots += f.rejectedBallots ?? 0;
      totalVotesCast += f.totalVotesCast ?? f.totalVotes ?? 0;
      registeredVoters += f.registeredVoters ?? 0;
    }
    return { perCandidate, rejectedBallots, totalVotesCast, registeredVoters, districtsApproved: approvedFigs.length };
  }, [figures]);

  const selected = useMemo(() => figures.find(f => f.levelId === districtId && (f.levelName === districtName || !f.levelName)) || null, [figures, districtId, districtName]);

  async function handleDecision(status: 'approved' | 'rejected', notes?: string) {
    if (!districtId) return;
    setActioning(true);
    try {
      await dataEntryApi.updateECZFigureStatus('district', districtId, eczElectionType, status, notes, districtName);
      await load();
      setRejecting(false);
      setRejectNote('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update status.');
    } finally {
      setActioning(false);
    }
  }

  if (!provinceId) {
    return (
      <div className="rounded-2xl p-6 flex flex-col items-center gap-3 text-center" style={{ backgroundColor: '#0d1f14', border: '1px solid rgba(255,255,255,0.07)' }}>
        <FileWarning size={32} style={{ color: '#f59e0b' }} />
        <p style={{ color: '#fff', fontFamily: 'Oswald, sans-serif', fontSize: '1rem' }}>Province Not Configured</p>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', maxWidth: 420 }}>
          Your account isn't linked to a specific province yet. Please contact your Build One Zambia administrator.
        </p>
      </div>
    );
  }

  const badge = selected ? statusBadge(selected.status) : null;
  const candList = selected ? resolveCandidateList(electionType, provinceId, selected.levelId, districtName) : [];
  const rejected = selected?.rejectedBallots ?? 0;
  const totalCast = selected?.totalVotesCast ?? selected?.totalVotes ?? 0;
  const registered = selected?.registeredVoters ?? 0;
  const turnout = registered > 0 ? (totalCast / registered) * 100 : null;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {ELECTION_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => { setElectionType(opt.value); setDistrictName(''); }}
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
        <button onClick={load} disabled={loading} className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm"
          style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)' }}>
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Districts Submitted', value: `${stats.total}/${districts.length || stats.total}`, color: '#16a34a' },
          { label: 'Approved', value: stats.approved, color: '#16a34a' },
          { label: 'Pending Review', value: stats.pending, color: '#f59e0b' },
          { label: 'Not Approved', value: stats.rejected, color: '#dc2626' },
        ].map(s => (
          <div key={s.label} className="rounded-2xl p-4 text-center" style={{ backgroundColor: '#0d1f14', border: `1px solid ${s.color}25` }}>
            <p style={{ color: s.color, fontSize: '1.8rem', fontFamily: 'Oswald, sans-serif', lineHeight: 1 }}>{s.value}</p>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.7rem', marginTop: 6 }}>{s.label}</p>
          </div>
        ))}
      </div>

      {error && (
        <div className="px-4 py-3 rounded-xl text-sm" style={{ backgroundColor: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.3)', color: '#f87171' }}>
          {error}
        </div>
      )}

      <div className="rounded-2xl p-6" style={{ backgroundColor: '#0d1f14', border: '1px solid rgba(255,255,255,0.07)' }}>
        <h2 className="mb-1" style={{ color: '#fff', fontFamily: 'Oswald, sans-serif', fontSize: '1.05rem' }}>
          <MapPin className="inline w-5 h-5 mr-2" style={{ color: '#16a34a' }} />
          Select a District
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.78rem', marginBottom: 14 }}>
          Choose a district in {provinceName} to see whether its district manager has entered figures.
        </p>
        <select className="w-full px-3 py-2.5 rounded-lg text-sm" style={selectStyle} value={districtName} onChange={e => setDistrictName(e.target.value)}>
          <option value="">Select District</option>
          {districts.map(d => {
            const fig = figures.find(x => x.levelId === d.id && (x.levelName === d.name || !x.levelName));
            const tag = fig ? (fig.status === 'approved' ? ' — Approved' : fig.status === 'rejected' ? ' — Not Approved' : ' — Pending Review') : ' — Not yet submitted';
            return <option key={d.id + d.name} value={d.name}>{d.name}{tag}</option>;
          })}
        </select>
      </div>

      {districtName && (
        !selected ? (
          <div className="flex items-start gap-3 px-4 py-4 rounded-xl" style={{ backgroundColor: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
            <AlertTriangle size={18} style={{ color: '#f59e0b', marginTop: 2, flexShrink: 0 }} />
            <div>
              <p style={{ color: '#f59e0b', fontFamily: 'Oswald, sans-serif', fontSize: '0.95rem' }}>No figures entered yet</p>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.82rem', marginTop: 4 }}>
                The district manager for {selectedDistrict?.name} hasn't submitted figures for this election type yet.
              </p>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: '#0d1f14', border: '1px solid rgba(255,255,255,0.07)' }}>
            <div className="flex items-center justify-between gap-3 px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <div>
                <p style={{ color: '#fff', fontFamily: 'Oswald, sans-serif', fontSize: '0.95rem' }}>{selected.levelName || selectedDistrict?.name}</p>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', marginTop: 2 }}>
                  District Manager: {selected.enteredBy || 'Unknown'} · Submitted {selected.savedAt ? new Date(selected.savedAt).toLocaleString() : '—'}
                </p>
              </div>
              {badge && (
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs" style={{ backgroundColor: badge.bg, color: badge.color, fontFamily: 'Oswald, sans-serif' }}>
                  <badge.Icon size={12} />
                  {badge.label}
                </span>
              )}
            </div>

            <div className="px-5 py-5 space-y-4">
              {(selected.figures || []).length > 0 ? (
                <div className="space-y-2">
                  {(selected.figures || []).map(v => {
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
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem' }}>No candidate-level votes recorded for this district.</p>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <div>
                  <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.68rem', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.08em' }}>REGISTERED VOTERS</p>
                  <p style={{ color: '#fff', fontSize: '0.9rem', marginTop: 2 }}>{registered.toLocaleString()}</p>
                </div>
                <div>
                  <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.68rem', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.08em' }}>TOTAL VOTES CAST</p>
                  <p style={{ color: '#fff', fontSize: '0.9rem', marginTop: 2 }}>{totalCast.toLocaleString()}</p>
                </div>
                <div>
                  <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.68rem', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.08em' }}>VOTER TURNOUT</p>
                  <p style={{ color: '#16a34a', fontSize: '0.9rem', marginTop: 2, fontFamily: 'Oswald, sans-serif' }}>{turnout !== null ? `${turnout.toFixed(1)}%` : '—'}</p>
                </div>
                <div>
                  <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.68rem', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.08em' }}>REJECTED BALLOTS</p>
                  <p style={{ color: '#fff', fontSize: '0.9rem', marginTop: 2 }}>{rejected.toLocaleString()}</p>
                </div>
              </div>

              {selected.reviewedBy && (
                <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.72rem' }}>
                  Last reviewed by {selected.reviewedBy} on {selected.reviewedAt ? new Date(selected.reviewedAt).toLocaleString() : '—'}
                </p>
              )}

              {rejecting ? (
                <div className="space-y-2">
                  <textarea
                    value={rejectNote}
                    onChange={e => setRejectNote(e.target.value)}
                    placeholder="Reason for not approving this district's figures (visible to the district manager)"
                    rows={2}
                    className="w-full px-3 py-2 rounded-xl text-sm"
                    style={selectStyle}
                  />
                  <div className="flex gap-2">
                    <button onClick={() => handleDecision('rejected', rejectNote)} disabled={actioning}
                      className="px-4 py-2 rounded-xl text-sm" style={{ background: '#dc2626', color: '#fff', fontFamily: 'Oswald, sans-serif' }}>
                      Confirm Not Approved
                    </button>
                    <button onClick={() => { setRejecting(false); setRejectNote(''); }}
                      className="px-4 py-2 rounded-xl text-sm" style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.6)', fontFamily: 'Oswald, sans-serif' }}>
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2 pt-1">
                  <button onClick={() => handleDecision('approved')} disabled={actioning}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm"
                    style={{
                      background: selected.status === 'approved' ? 'rgba(22,163,74,0.15)' : '#16a34a',
                      color: selected.status === 'approved' ? '#16a34a' : '#fff',
                      border: selected.status === 'approved' ? '1px solid #16a34a55' : 'none',
                      fontFamily: 'Oswald, sans-serif', letterSpacing: '0.03em',
                    }}>
                    <CheckCircle2 size={15} />
                    {selected.status === 'approved' ? 'Approved' : 'Approve'}
                  </button>
                  <button onClick={() => setRejecting(true)} disabled={actioning}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm"
                    style={{
                      background: selected.status === 'rejected' ? 'rgba(220,38,38,0.15)' : 'rgba(220,38,38,0.9)',
                      color: selected.status === 'rejected' ? '#dc2626' : '#fff',
                      border: selected.status === 'rejected' ? '1px solid #dc262655' : 'none',
                      fontFamily: 'Oswald, sans-serif', letterSpacing: '0.03em',
                    }}>
                    <XCircle size={15} />
                    {selected.status === 'rejected' ? 'Not Approved' : 'Not Approve'}
                  </button>
                </div>
              )}
            </div>
          </div>
        )
      )}

      {stats.pending > 0 && (
        <div className="flex items-start gap-3 px-4 py-3 rounded-xl" style={{ backgroundColor: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
          <AlertTriangle size={16} style={{ color: '#f59e0b', marginTop: 2, flexShrink: 0 }} />
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', lineHeight: 1.5 }}>
            <strong style={{ color: '#f59e0b' }}>{stats.pending}</strong> district manager figure{stats.pending !== 1 ? 's' : ''} still
            need review before you can enter ECZ figures for {provinceName}.
          </p>
        </div>
      )}
      {stats.pending === 0 && stats.total > 0 && (
        <div className="flex items-start gap-3 px-4 py-3 rounded-xl" style={{ backgroundColor: 'rgba(22,163,74,0.08)', border: '1px solid rgba(22,163,74,0.2)' }}>
          <ShieldCheck size={16} style={{ color: '#16a34a', marginTop: 2, flexShrink: 0 }} />
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', lineHeight: 1.5 }}>
            All district manager figures reviewed. You can now enter the ECZ Announced Figures for {provinceName}.
          </p>
        </div>
      )}

      {stats.approved > 0 && (
        <div className="rounded-2xl p-5" style={{ backgroundColor: '#0d1f14', border: '1px solid rgba(22,163,74,0.25)' }}>
          <p className="mb-3 text-xs" style={{ fontFamily: 'Oswald, sans-serif', letterSpacing: '0.12em', color: '#16a34a' }}>
            APPROVED DISTRICT TOTALS — {provinceName.toUpperCase()}
          </p>
          <div className="space-y-2">
            {Object.entries(approvedTotals.perCandidate).map(([candidateId, v]) => {
              const list = electionType === 'presidential' ? presidentialCandidates : [];
              const meta = candidateMeta(list, candidateId);
              return (
                <div key={candidateId} className="flex items-center justify-between">
                  <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem' }}>{meta.name} <span style={{ color: 'rgba(255,255,255,0.35)' }}>({meta.party})</span></span>
                  <span style={{ color: '#fff', fontFamily: 'Oswald, sans-serif' }}>{v.toLocaleString()}</span>
                </div>
              );
            })}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
            <div>
              <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.68rem', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.08em' }}>REGISTERED VOTERS</p>
              <p style={{ color: '#fff', fontSize: '1rem', marginTop: 2 }}>{approvedTotals.registeredVoters.toLocaleString()}</p>
            </div>
            <div>
              <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.68rem', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.08em' }}>REJECTED BALLOTS</p>
              <p style={{ color: '#fff', fontSize: '1rem', marginTop: 2 }}>{approvedTotals.rejectedBallots.toLocaleString()}</p>
            </div>
            <div>
              <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.68rem', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.08em' }}>TOTAL VOTES CAST</p>
              <p style={{ color: '#16a34a', fontSize: '1rem', marginTop: 2, fontFamily: 'Oswald, sans-serif' }}>{approvedTotals.totalVotesCast.toLocaleString()}</p>
            </div>
            <div>
              <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.68rem', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.08em' }}>DISTRICTS APPROVED</p>
              <p style={{ color: '#fff', fontSize: '1rem', marginTop: 2 }}>{approvedTotals.districtsApproved}</p>
            </div>
          </div>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', marginTop: 12 }}>
            {electionType === 'presidential'
              ? `This is the figure your ECZ Announced Figures entry must match exactly for ${provinceName}.`
              : `Candidates for this race differ per district/constituency/ward, so this total is for reference only and isn't entered as a single province-level figure.`}
          </p>
        </div>
      )}
    </div>
  );
}

export default DistrictManagerFiguresPage;
