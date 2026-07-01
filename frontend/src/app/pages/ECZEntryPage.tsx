import { useState, useEffect } from 'react';
import { Scale, Save, CheckCircle2, AlertCircle, Trash2, Loader2 } from 'lucide-react';
import { dataEntryApi } from '../lib/api';
import {
  provinces,
  presidentialCandidates,
  Candidate,
} from '../data/mockData';
import {
  ECZElectionType,
  ECZLevelType,
  ECZLevelData,
  getECZFigures,
  saveECZFigures,
  deleteECZFigures,
} from '../data/eczStore';

const LEVEL_OPTIONS: { value: ECZLevelType; label: string }[] = [
  { value: 'ward', label: 'Ward Level' },
  { value: 'constituency', label: 'Constituency Level' },
  { value: 'district', label: 'District Level' },
  { value: 'province', label: 'Province Level' },
  { value: 'national', label: 'National Level' },
];

const ELECTION_OPTIONS: { value: ECZElectionType; label: string }[] = [
  { value: 'presidential', label: 'Presidential' },
  { value: 'mp', label: 'National Assembly (MP)' },
  { value: 'mayoral', label: 'Mayoral / Council Chairperson' },
  { value: 'councillor', label: 'Ward Councillor' },
];

export function ECZEntryPage() {
  const [levelType, setLevelType] = useState<ECZLevelType>('national');
  const [electionType, setElectionType] = useState<ECZElectionType>('presidential');
  const [province, setProvince] = useState('');
  const [district, setDistrict] = useState('');
  const [constituency, setConstituency] = useState('');
  const [ward, setWard] = useState('');
  const [enteredBy, setEnteredBy] = useState('');
  const [totalVotesCast, setTotalVotesCast] = useState('');
  const [rejectedBallots, setRejectedBallots] = useState('');
  const [candidateVotes, setCandidateVotes] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const [error, setError] = useState('');
  const [existing, setExisting] = useState<ECZLevelData | null>(null);

  const currentProvince = provinces.find(p => p.id === province);
  const currentDistrict = currentProvince?.districts.find(d => d.id === district);
  const currentConstituency = currentDistrict?.constituencies.find(c => c.id === constituency);
  const currentWard = currentConstituency?.wards.find(w => w.id === ward);

  // Derive levelId from current selections
  const levelId = (() => {
    switch (levelType) {
      case 'national': return 'national';
      case 'province': return province;
      case 'district': return district;
      case 'constituency': return constituency;
      case 'ward': return ward;
    }
  })();

  const levelName = (() => {
    switch (levelType) {
      case 'national': return 'National';
      case 'province': return currentProvince?.name ?? '';
      case 'district': return currentDistrict?.name ?? '';
      case 'constituency': return currentConstituency?.name ?? '';
      case 'ward': return currentWard?.name ?? '';
    }
  })();

  // Get candidates for selected election type + location
  const candidates: Candidate[] = (() => {
    switch (electionType) {
      case 'presidential': return presidentialCandidates;
      case 'mp': return currentConstituency?.mpCandidates ?? [];
      case 'mayoral': return currentDistrict?.mayoralCandidates ?? [];
      case 'councillor': return currentWard?.councillorCandidates ?? [];
    }
  })();

  // Load existing ECZ data when levelId / electionType changes
  useEffect(() => {
    if (!levelId) { setExisting(null); return; }

    // Try backend first, fall back to localStorage
    dataEntryApi.getECZFigure(levelType, levelId, electionType)
      .then(res => {
        if (res.exists && res.figure) {
          const data = res.figure as ECZLevelData & { figures: { candidateId: string; votes: number }[]; totalVotesCast: number; rejectedBallots: number; enteredBy: string };
          setExisting(data as ECZLevelData);
          setEnteredBy(data.enteredBy || '');
          setTotalVotesCast(String(data.totalVotesCast));
          setRejectedBallots(String(data.rejectedBallots));
          const cv: Record<string, string> = {};
          data.figures.forEach((f: { candidateId: string; votes: number }) => { cv[f.candidateId] = String(f.votes); });
          setCandidateVotes(cv);
        } else {
          // Fall back to localStorage
          const data = getECZFigures(levelType, levelId, electionType);
          setExisting(data);
          if (data) {
            setEnteredBy(data.enteredBy);
            setTotalVotesCast(String(data.totalVotesCast));
            setRejectedBallots(String(data.rejectedBallots));
            const cv: Record<string, string> = {};
            data.figures.forEach(f => { cv[f.candidateId] = String(f.votes); });
            setCandidateVotes(cv);
          } else {
            setTotalVotesCast('');
            setRejectedBallots('');
            const cv: Record<string, string> = {};
            candidates.forEach(c => { cv[c.id] = ''; });
            setCandidateVotes(cv);
          }
        }
      })
      .catch(() => {
        // Offline fallback to localStorage
        const data = getECZFigures(levelType, levelId, electionType);
        setExisting(data);
        if (data) {
          setEnteredBy(data.enteredBy);
          setTotalVotesCast(String(data.totalVotesCast));
          setRejectedBallots(String(data.rejectedBallots));
          const cv: Record<string, string> = {};
          data.figures.forEach(f => { cv[f.candidateId] = String(f.votes); });
          setCandidateVotes(cv);
        } else {
          setTotalVotesCast('');
          setRejectedBallots('');
          const cv: Record<string, string> = {};
          candidates.forEach(c => { cv[c.id] = ''; });
          setCandidateVotes(cv);
        }
      });

    setSaved(false);
    setDeleted(false);
    setError('');
  }, [levelType, levelId, electionType, province, district, constituency, ward]);

  // Reset downstream location when level changes
  useEffect(() => {
    if (levelType === 'national') { setProvince(''); setDistrict(''); setConstituency(''); setWard(''); }
    if (levelType === 'province') { setDistrict(''); setConstituency(''); setWard(''); }
    if (levelType === 'district') { setConstituency(''); setWard(''); }
    if (levelType === 'constituency') { setWard(''); }
  }, [levelType]);

  const handleVoteChange = (candidateId: string, value: string) => {
    const numVal = value.replace(/[^0-9]/g, '');
    setCandidateVotes(prev => ({ ...prev, [candidateId]: numVal }));
  };

  const isLocationComplete = (): boolean => {
    switch (levelType) {
      case 'national': return true;
      case 'province': return !!province;
      case 'district': return !!province && !!district;
      case 'constituency': return !!province && !!district && !!constituency;
      case 'ward': return !!province && !!district && !!constituency && !!ward;
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isLocationComplete()) { setError('Please select all required location fields.'); return; }
    if (!levelId) { setError('Level ID could not be determined.'); return; }
    if (!enteredBy.trim()) { setError('Please enter the name of the person entering these figures.'); return; }

    const totalInt = parseInt(totalVotesCast) || 0;
    const rejectedInt = parseInt(rejectedBallots) || 0;
    const figures = candidates.map(c => ({
      candidateId: c.id,
      votes: parseInt(candidateVotes[c.id] ?? '0') || 0,
    }));
    const sumCandidates = figures.reduce((s, f) => s + f.votes, 0);

    if (totalInt > 0 && sumCandidates + rejectedInt !== totalInt) {
      setError(`Candidate votes (${sumCandidates.toLocaleString()}) + Rejected ballots (${rejectedInt.toLocaleString()}) = ${(sumCandidates + rejectedInt).toLocaleString()} but Total Votes Cast is ${totalInt.toLocaleString()}. They must match.`);
      return;
    }

    const data: ECZLevelData = {
      levelType,
      levelId,
      electionType,
      figures,
      totalVotesCast: totalInt,
      rejectedBallots: rejectedInt,
      enteredBy: enteredBy.trim(),
      timestamp: new Date().toISOString(),
    };

    setSaving(true);
    try {
      await dataEntryApi.saveECZFigure({
        levelType,
        levelId,
        levelName: levelName || levelId,
        electionType,
        totalVotesCast: totalInt,
        rejectedBallots: rejectedInt,
        figures,
        enteredBy: enteredBy.trim(),
      });
    } catch {
      // If backend fails, still save to localStorage as fallback
    }
    // Always persist locally as offline fallback
    saveECZFigures(data);
    setExisting(data);
    setSaved(true);
    setDeleted(false);
    setTimeout(() => setSaved(false), 4000);
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!levelId) return;
    setDeleting(true);
    try {
      await dataEntryApi.deleteECZFigure(levelType, levelId, electionType);
    } catch { /* ignore backend error, still delete locally */ }
    deleteECZFigures(levelType, levelId, electionType);
    setExisting(null);
    setTotalVotesCast('');
    setRejectedBallots('');
    setCandidateVotes({});
    setDeleted(true);
    setSaved(false);
    setTimeout(() => setDeleted(false), 3000);
    setDeleting(false);
  };

  const needsProvince = levelType !== 'national';
  const needsDistrict = ['district', 'constituency', 'ward'].includes(levelType);
  const needsConstituency = ['constituency', 'ward'].includes(levelType);
  const needsWard = levelType === 'ward';

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Scale className="w-8 h-8" style={{ color: '#7C3AED' }} />
            <h1 className="text-3xl font-bold text-gray-900">ECZ Announced Figures Entry</h1>
          </div>
          <p className="text-gray-500">
            Enter the figures officially announced by the Electoral Commission of Zambia (ECZ) at each level. These will be compared against agent-captured polling station data to identify any discrepancies.
          </p>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          {/* Level & Election Type */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <h2 className="font-bold text-gray-800 mb-4 text-lg">1. Select Level & Election Type</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Result Level</label>
                <select
                  value={levelType}
                  onChange={e => setLevelType(e.target.value as ECZLevelType)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {LEVEL_OPTIONS.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Election Type</label>
                <select
                  value={electionType}
                  onChange={e => setElectionType(e.target.value as ECZElectionType)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {ELECTION_OPTIONS.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Location Selection */}
          {levelType !== 'national' && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <h2 className="font-bold text-gray-800 mb-4 text-lg">2. Select Location</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {needsProvince && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Province</label>
                    <select
                      value={province}
                      onChange={e => { setProvince(e.target.value); setDistrict(''); setConstituency(''); setWard(''); }}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="">— Select Province —</option>
                      {provinces.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </div>
                )}
                {needsDistrict && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">District</label>
                    <select
                      value={district}
                      onChange={e => { setDistrict(e.target.value); setConstituency(''); setWard(''); }}
                      disabled={!province}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
                    >
                      <option value="">— Select District —</option>
                      {currentProvince?.districts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                  </div>
                )}
                {needsConstituency && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Constituency</label>
                    <select
                      value={constituency}
                      onChange={e => { setConstituency(e.target.value); setWard(''); }}
                      disabled={!district}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
                    >
                      <option value="">— Select Constituency —</option>
                      {currentDistrict?.constituencies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                )}
                {needsWard && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Ward</label>
                    <select
                      value={ward}
                      onChange={e => setWard(e.target.value)}
                      disabled={!constituency}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
                    >
                      <option value="">— Select Ward —</option>
                      {currentConstituency?.wards.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                    </select>
                  </div>
                )}
              </div>

              {levelName && (
                <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 bg-purple-50 border border-purple-200 rounded-lg text-purple-800 text-sm font-semibold">
                  <Scale className="w-4 h-4" />
                  Selected: {levelName} ({levelType})
                </div>
              )}
            </div>
          )}

          {/* Existing data notice */}
          {existing && (
            <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-amber-800">
                <strong>Existing ECZ figures found</strong> — entered by <strong>{existing.enteredBy}</strong> on {new Date(existing.timestamp).toLocaleString()}. Submitting will overwrite them.
              </div>
            </div>
          )}

          {/* Candidate Votes */}
          {isLocationComplete() && candidates.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <h2 className="font-bold text-gray-800 mb-1 text-lg">
                {levelType === 'national' ? '2.' : '3.'} ECZ Announced Votes per Candidate
              </h2>
              <p className="text-gray-500 text-sm mb-5">Enter the figures as officially announced by ECZ at this level.</p>

              <div className="space-y-3">
                {candidates.map((c, i) => (
                  <div key={c.id} className="flex items-center gap-3">
                    <div
                      className="w-1.5 self-stretch rounded-full flex-shrink-0"
                      style={{ background: c.partyColor }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-gray-800 truncate">{c.name}</div>
                      <div className="text-xs text-gray-500">{c.party}</div>
                    </div>
                    <div className="flex-shrink-0 w-40">
                      <input
                        type="text"
                        inputMode="numeric"
                        value={candidateVotes[c.id] ?? ''}
                        onChange={e => handleVoteChange(c.id, e.target.value)}
                        placeholder="0"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-right font-mono text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="mt-6 pt-5 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Total Votes Cast (ECZ)</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={totalVotesCast}
                    onChange={e => setTotalVotesCast(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="0"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 font-mono text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Rejected Ballots (ECZ)</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={rejectedBallots}
                    onChange={e => setRejectedBallots(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="0"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 font-mono text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              {/* Running sum feedback */}
              {(() => {
                const sum = candidates.reduce((s, c) => s + (parseInt(candidateVotes[c.id] ?? '0') || 0), 0);
                const rej = parseInt(rejectedBallots) || 0;
                const tot = parseInt(totalVotesCast) || 0;
                if (sum === 0 && rej === 0) return null;
                const match = tot === 0 || sum + rej === tot;
                return (
                  <div className={`mt-3 flex items-center gap-2 text-sm font-semibold px-3 py-2 rounded-lg ${match ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {match ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                    Candidate votes: {sum.toLocaleString()} + Rejected: {rej.toLocaleString()} = {(sum + rej).toLocaleString()}
                    {tot > 0 && ` (Total announced: ${tot.toLocaleString()})`}
                    {!match && ' — MISMATCH'}
                  </div>
                );
              })()}
            </div>
          )}

          {/* Entered By */}
          {isLocationComplete() && candidates.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                {levelType === 'national' ? '3.' : '4.'} Name of Person Entering These Figures
              </label>
              <input
                type="text"
                value={enteredBy}
                onChange={e => setEnteredBy(e.target.value)}
                placeholder="Full name and role (e.g. John Banda – Provincial Coordinator)"
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Success */}
          {saved && (
            <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-300 rounded-xl">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <p className="text-sm text-green-800 font-semibold">ECZ figures saved successfully. The comparison panel on results pages will now show the discrepancy.</p>
            </div>
          )}
          {deleted && (
            <div className="flex items-center gap-3 p-4 bg-orange-50 border border-orange-200 rounded-xl">
              <Trash2 className="w-5 h-5 text-orange-600" />
              <p className="text-sm text-orange-800 font-semibold">ECZ figures deleted for this level.</p>
            </div>
          )}

          {/* Actions */}
          {isLocationComplete() && candidates.length > 0 && (
            <div className="flex items-center gap-3 flex-wrap">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-white font-bold shadow transition hover:opacity-90 disabled:opacity-60"
                style={{ background: '#7C3AED' }}
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? 'Saving...' : 'Save ECZ Figures'}
              </button>
              {existing && (
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-bold shadow transition hover:opacity-90 disabled:opacity-60"
                  style={{ background: '#DC2626' }}
                >
                  {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  {deleting ? 'Deleting...' : 'Delete ECZ Figures'}
                </button>
              )}
              <span className="text-sm text-gray-500">
                Figures are stored locally in your browser and visible on the results comparison panels.
              </span>
            </div>
          )}
        </form>

        {/* Info box */}
        <div className="mt-10 p-5 bg-blue-50 border border-blue-200 rounded-2xl">
          <h3 className="font-bold text-blue-800 mb-2">How the Comparison Works</h3>
          <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
            <li><strong>Agent Total</strong> — automatically summed from all polling station figures entered by your field agents.</li>
            <li><strong>ECZ Announced</strong> — the figure officially declared by ECZ at each level (entered here).</li>
            <li><strong>Discrepancy</strong> — the difference (Agent − ECZ). Zero means both sets of figures agree perfectly.</li>
            <li>You can enter ECZ figures at any level independently: ward, constituency, district, province, or national.</li>
            <li>All four election types (Presidential, MP, Mayoral, Councillor) can each have their own ECZ figure entries.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export { ECZEntryPage as default };
