import { useState, useEffect, useCallback } from 'react';
import { AlertTriangle, ShieldCheck, Archive, RefreshCw, CheckCircle2 } from 'lucide-react';
import { useElectionResults } from '../hooks/useElectionResults';
import {
  presidentialElectionApi, electionArchiveApi,
  type PresidentialElectionConfig, type ArchiveEntrySummary,
} from '../lib/api';

interface ElectionUserSession { username: string; role: string; scopeId?: string; scopeName?: string; name?: string }
function getElectionUser(): ElectionUserSession | null {
  try { return JSON.parse(sessionStorage.getItem('boz_election_user') ?? 'null'); } catch { return null; }
}

export function PresidentialRunoffAdmin() {
  const electionUser = getElectionUser();
  const canManage = ['national_manager', 'admin', 'super_admin'].includes(electionUser?.role ?? '');

  const [config, setConfig] = useState<PresidentialElectionConfig | null>(null);
  const [archiveEntries, setArchiveEntries] = useState<ArchiveEntrySummary[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // Archive form
  const [archiveYear, setArchiveYear] = useState(new Date().getFullYear().toString());
  const [archiveRoundChoice, setArchiveRoundChoice] = useState<'round1' | 'runoff'>('round1');
  const [archiveLabel, setArchiveLabel] = useState('');

  const round1 = useElectionResults('presidential', 'national', '', 'official', 'round1');
  const leader = round1.liveResults[0];
  const runnerUp = round1.liveResults[1];
  const needsRunoff = round1.backendConnected && round1.validVotes > 0 && !!leader && leader.percentage <= 50;

  const loadAll = useCallback(() => {
    presidentialElectionApi.getConfig().then(({ config }) => setConfig(config)).catch(() => setConfig(null));
    electionArchiveApi.list('presidential').then(({ entries }) => setArchiveEntries(entries)).catch(() => setArchiveEntries([]));
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  const declareRunoff = async () => {
    if (!leader || !runnerUp) return;
    setSaving(true); setError(''); setMessage('');
    try {
      const { config } = await presidentialElectionApi.updateConfig({
        round: 'runoff',
        runoffCandidateIds: [leader.candidate.id, runnerUp.candidate.id],
      });
      setConfig(config);
      setMessage(`Runoff declared between ${leader.candidate.name} and ${runnerUp.candidate.name}. Polling agents will now only see these two candidates for the presidential form.`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to declare runoff');
    } finally { setSaving(false); }
  };

  const revertToRound1 = async () => {
    setSaving(true); setError(''); setMessage('');
    try {
      const { config } = await presidentialElectionApi.updateConfig({ round: 'round1' });
      setConfig(config);
      setMessage('Reverted to Round 1. The presidential data-entry form will show the full candidate list again.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to revert');
    } finally { setSaving(false); }
  };

  const archiveNow = async () => {
    setSaving(true); setError(''); setMessage('');
    try {
      const { entry } = await electionArchiveApi.archiveNow('presidential', {
        year: Number(archiveYear),
        round: archiveRoundChoice,
        label: archiveLabel || undefined,
      });
      setMessage(`Archived: ${entry.label}`);
      loadAll();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to archive');
    } finally { setSaving(false); }
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <ShieldCheck className="w-5 h-5 text-green-600" />
          <h2 className="text-xl font-bold text-foreground">Presidential Runoff & Archive</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Article 101 of the Constitution requires a runoff between the top two candidates if no one passes 50% of
          valid votes cast in Round 1. This declares that runoff explicitly — it is never switched automatically —
          and archives concluded results by year.
        </p>
        {!canManage && (
          <p className="text-xs mt-2 text-amber-600">
            Your account ({electionUser?.role ?? 'not signed in'}) can view this page but only a National Manager or
            admin can declare a runoff or archive results.
          </p>
        )}
      </div>

      {error && <div className="px-4 py-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">{error}</div>}
      {message && <div className="px-4 py-3 bg-green-50 border border-green-200 text-green-800 rounded-xl text-sm flex items-center gap-2"><CheckCircle2 className="w-4 h-4 shrink-0" />{message}</div>}

      {/* Current status */}
      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-foreground">Current Status</h3>
          <button onClick={loadAll} className="p-1.5 rounded-lg border border-border hover:bg-muted">
            <RefreshCw className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {config?.round === 'runoff' ? (
          <div className="flex items-center gap-2 mb-3">
            <span className="px-3 py-1 rounded-full bg-[#198754] text-white text-xs font-bold uppercase">Runoff Active</span>
            <span className="text-sm text-foreground">
              Between the two candidates declared on {config.updatedAt ? new Date(config.updatedAt).toLocaleString() : '—'} by {config.updatedBy}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2 mb-3">
            <span className="px-3 py-1 rounded-full bg-muted text-foreground text-xs font-bold uppercase">Round 1</span>
            <span className="text-sm text-muted-foreground">Full candidate list is active for data entry</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          <div className="p-3 rounded-lg bg-muted/50">
            <p className="text-xs text-muted-foreground">Round 1 leader (official results)</p>
            <p className="text-sm font-bold text-foreground">{leader ? `${leader.candidate.name} — ${leader.percentage.toFixed(2)}%` : '—'}</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/50">
            <p className="text-xs text-muted-foreground">Round 1 runner-up</p>
            <p className="text-sm font-bold text-foreground">{runnerUp ? `${runnerUp.candidate.name} — ${runnerUp.percentage.toFixed(2)}%` : '—'}</p>
          </div>
        </div>

        {needsRunoff && config?.round !== 'runoff' && (
          <div className="mb-4 flex items-start gap-2 px-3 py-2 rounded-lg bg-amber-50 border border-amber-300 text-amber-800 text-sm">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            No candidate has reached 50%+1 of valid votes. A runoff can be declared once Round 1 is fully certified.
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {config?.round !== 'runoff' ? (
            <button
              onClick={declareRunoff}
              disabled={!canManage || saving || !leader || !runnerUp}
              className="px-4 py-2 bg-[#198754] hover:bg-[#146c43] text-white rounded-lg text-sm font-semibold disabled:opacity-50"
            >
              Declare Runoff — {leader?.candidate.name ?? '—'} vs {runnerUp?.candidate.name ?? '—'}
            </button>
          ) : (
            <button
              onClick={revertToRound1}
              disabled={!canManage || saving}
              className="px-4 py-2 bg-muted hover:bg-muted/70 text-foreground border border-border rounded-lg text-sm font-semibold disabled:opacity-50"
            >
              Revert to Round 1
            </button>
          )}
        </div>
      </div>

      {/* Archive */}
      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center gap-2 mb-3">
          <Archive className="w-4 h-4 text-[#198754]" />
          <h3 className="font-bold text-foreground">Archive a Concluded Result</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Snapshots the current <strong>official</strong> national result for the given year/round permanently, so it
          stays viewable on the public Presidential page's archive dropdown even after the live data resets for the
          next election.
        </p>
        <div className="flex flex-wrap gap-3 items-end mb-4">
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1">Year</label>
            <input
              type="number"
              value={archiveYear}
              onChange={e => setArchiveYear(e.target.value)}
              className="px-3 py-2 rounded-lg border border-border bg-background text-sm w-28"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1">Round</label>
            <select
              value={archiveRoundChoice}
              onChange={e => setArchiveRoundChoice(e.target.value as 'round1' | 'runoff')}
              className="px-3 py-2 rounded-lg border border-border bg-background text-sm"
            >
              <option value="round1">Round 1 (General)</option>
              <option value="runoff">Runoff</option>
            </select>
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-semibold text-muted-foreground mb-1">Label (optional)</label>
            <input
              type="text"
              value={archiveLabel}
              onChange={e => setArchiveLabel(e.target.value)}
              placeholder={`${archiveYear} ${archiveRoundChoice === 'runoff' ? 'Runoff' : 'General Election'}`}
              className="px-3 py-2 rounded-lg border border-border bg-background text-sm w-full"
            />
          </div>
          <button
            onClick={archiveNow}
            disabled={!canManage || saving}
            className="px-4 py-2 bg-[#198754] hover:bg-[#146c43] text-white rounded-lg text-sm font-semibold disabled:opacity-50"
          >
            Archive Now
          </button>
        </div>

        {archiveEntries.length > 0 && (
          <div className="space-y-1.5">
            {archiveEntries.map(e => (
              <div key={e.id} className="flex items-center justify-between text-sm px-3 py-2 rounded-lg bg-muted/50">
                <span className="text-foreground font-medium">{e.label}</span>
                <span className="text-xs text-muted-foreground">Archived {new Date(e.archivedAt).toLocaleDateString()} by {e.archivedBy}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default PresidentialRunoffAdmin;
