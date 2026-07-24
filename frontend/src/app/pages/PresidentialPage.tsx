import { useState, useMemo, useEffect } from 'react';
import { LiveResultsPanel } from '../components/LiveResultsPanel';
import { DrillDownFilters } from '../components/DrillDownFilters';
import { CandidateCard } from '../components/CandidateCard';
import { CandidateCardCompact } from '../components/CandidateCardCompact';
import { ResultsStatusBar, ResultStage } from '../components/ResultsStatusBar';
import { StatCard } from '../components/StatCard';
import { DownloadButton } from '../components/DownloadButton';
import {
  presidentialCandidates,
  provinces,
  aggregateResults,
  calculateTurnout,
  PollingStation, resolveCandidate } from '../data/mockData';
import { useElectionResults } from '../hooks/useElectionResults';
import { presidentialElectionApi, electionArchiveApi, type PresidentialElectionConfig, type ArchiveEntrySummary, type ArchiveEntryDetail } from '../lib/api';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { MapPin, Clock, AlertTriangle, Archive, ChevronDown } from 'lucide-react';

export function PresidentialPage() {
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedConstituency, setSelectedConstituency] = useState('');
  const [selectedWard, setSelectedWard] = useState('');
  const [selectedPollingStation, setSelectedPollingStation] = useState('');
  const [showAllCandidates, setShowAllCandidates] = useState(false);
  const [resultStage, setResultStage] = useState<ResultStage>('provisional');

  // ── Article 101 runoff ────────────────────────────────────────────────────
  const [presConfig, setPresConfig] = useState<PresidentialElectionConfig | null>(null);
  const [viewRound, setViewRound] = useState<'round1' | 'runoff'>('round1');

  useEffect(() => {
    presidentialElectionApi.getConfig()
      .then(({ config }) => { setPresConfig(config); setViewRound(config.round); })
      .catch(() => setPresConfig(null));
  }, []);

  // Always watch round-1 official results (regardless of what's being viewed)
  // so the "runoff required" banner can be sensed automatically, independent
  // of whichever round the viewer currently has selected.
  const round1Official = useElectionResults('presidential', 'national', '', 'official', 'round1');
  const round1Leader = round1Official.liveResults[0];
  const round1RunnerUp = round1Official.liveResults[1];
  const needsRunoff = round1Official.backendConnected
    && round1Official.validVotes > 0
    && !!round1Leader
    && round1Leader.percentage <= 50
    && (!presConfig || presConfig.round === 'round1');

  // ── Concluded results archive ─────────────────────────────────────────────
  const [showArchive, setShowArchive] = useState(false);
  const [archiveEntries, setArchiveEntries] = useState<ArchiveEntrySummary[]>([]);
  const [archiveYear, setArchiveYear] = useState('');
  const [archiveRound, setArchiveRound] = useState<'round1' | 'runoff'>('round1');
  const [archiveDetail, setArchiveDetail] = useState<ArchiveEntryDetail | null>(null);
  const [archiveLoading, setArchiveLoading] = useState(false);

  useEffect(() => {
    if (!showArchive) return;
    electionArchiveApi.list('presidential').then(({ entries }) => {
      setArchiveEntries(entries);
      if (entries.length > 0 && !archiveYear) {
        setArchiveYear(String(entries[0].year));
        setArchiveRound(entries[0].round);
      }
    }).catch(() => setArchiveEntries([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showArchive]);

  const archiveYears = Array.from(new Set(archiveEntries.map(e => e.year))).sort((a, b) => b - a);
  const roundsForSelectedYear = archiveEntries.filter(e => String(e.year) === archiveYear);
  const hasRunoffForYear = roundsForSelectedYear.some(e => e.round === 'runoff');

  useEffect(() => {
    if (!archiveYear) return;
    const match = archiveEntries.find(e => String(e.year) === archiveYear && e.round === archiveRound);
    if (!match) { setArchiveDetail(null); return; }
    setArchiveLoading(true);
    electionArchiveApi.get('presidential', match.id)
      .then(({ entry }) => setArchiveDetail(entry))
      .catch(() => setArchiveDetail(null))
      .finally(() => setArchiveLoading(false));
  }, [archiveYear, archiveRound, archiveEntries]);

  // Get filtered polling stations
  const getFilteredStations = (): PollingStation[] => {
    let stations: PollingStation[] = [];

    provinces.forEach(province => {
      if (selectedProvince && province.id !== selectedProvince) return;

      province.districts.forEach(district => {
        if (selectedDistrict && district.id !== selectedDistrict) return;

        district.constituencies.forEach(constituency => {
          if (selectedConstituency && constituency.id !== selectedConstituency) return;

          constituency.wards.forEach(ward => {
            if (selectedWard && ward.id !== selectedWard) return;

            if (selectedPollingStation) {
              const station = ward.pollingStations.find(s => s.id === selectedPollingStation);
              if (station) stations.push(station);
            } else {
              stations.push(...ward.pollingStations);
            }
          });
        });
      });
    });

    return stations;
  };

  // ── Live API ──────────────────────────────────────────────────────────────
  const levelType = selectedWard ? 'ward'
    : selectedConstituency ? 'constituency'
    : selectedDistrict ? 'district'
    : selectedProvince ? 'province'
    : 'national';
  const levelId = selectedWard || selectedConstituency || selectedDistrict || selectedProvince || '';

  // Downloads go one level finer than the live results view — a specific
  // polling station can be selected for the report even though the results
  // panel above only drills down to ward level.
  const exportLevelType = selectedPollingStation ? 'station'
    : selectedWard ? 'ward'
    : selectedConstituency ? 'constituency'
    : selectedDistrict ? 'district'
    : selectedProvince ? 'province'
    : 'national';
  const exportLevelId = selectedPollingStation || selectedWard || selectedConstituency || selectedDistrict || selectedProvince || '';

  const live = useElectionResults('presidential', levelType as any, levelId, resultStage, viewRound);

  // ── Mock data fallback ────────────────────────────────────────────────────
  const filteredStations = getFilteredStations();
  const resultTotals = aggregateResults(filteredStations);
  const rosterForRound = viewRound === 'runoff' && presConfig?.runoffCandidateIds?.length === 2
    ? presidentialCandidates.filter(c => presConfig.runoffCandidateIds.includes(c.id))
    : presidentialCandidates;
  const mockResults = rosterForRound
    .map(c => ({ candidate: c, votes: resultTotals.get(c.id) || 0, percentage: 0, rank: 0 }))
    .sort((a, b) => b.votes - a.votes)
    .map((r, i) => ({ ...r, rank: i + 1 }));

  // Use live data for stats if backend is connected (even if liveResults is empty)
  const usingLive = !live.usingMockData && live.liveResults.length > 0;
  const hasLiveStats = live.backendConnected && !live.usingMockData;
  const candidateResults = usingLive ? live.liveResults : mockResults;

  const totalValidVotes = candidateResults.reduce((sum, r) => sum + r.votes, 0);
  const totalRegistered = hasLiveStats ? live.totalRegistered : filteredStations.reduce((sum, s) => sum + s.registeredVoters, 0);
  const totalVotes      = hasLiveStats ? live.totalVotes      : filteredStations.reduce((sum, s) => sum + (s.totalVotes ?? 0), 0);
  const totalRejected   = hasLiveStats ? live.rejectedBallots : filteredStations.reduce((sum, s) => sum + (s.totalRejected ?? 0), 0);
  const turnout         = hasLiveStats ? live.turnoutPercent  : calculateTurnout(totalRegistered, totalVotes);

  const chartData = candidateResults.map(r => ({
    name: r.candidate.id,
    label: r.candidate.party,
    value: r.votes,
    color: r.candidate.partyColor }));

  // Provinces reporting: a province counts as "reporting" once at least
  // one of its polling stations has a result entered.
  const totalProvincesCount = provinces.length;
  const provincesReportingCount = provinces.filter(p =>
    p.districts.some(d =>
      d.constituencies.some(c =>
        c.wards.some(w => w.pollingStations.some(s => s.totalVotes !== undefined))
      )
    )
  ).length;

  const handleProvinceChange = (value: string) => {
    setSelectedProvince(value);
    setSelectedDistrict('');
    setSelectedConstituency('');
    setSelectedWard('');
    setSelectedPollingStation('');
  };

  const handleDistrictChange = (value: string) => {
    setSelectedDistrict(value);
    setSelectedConstituency('');
    setSelectedWard('');
    setSelectedPollingStation('');
  };

  const handleConstituencyChange = (value: string) => {
    setSelectedConstituency(value);
    setSelectedWard('');
    setSelectedPollingStation('');
  };

  const handleWardChange = (value: string) => {
    setSelectedWard(value);
    setSelectedPollingStation('');
  };

  // Determine current level for ECZ comparison
  const eczLevelType = selectedWard
    ? 'ward'
    : selectedConstituency
    ? 'constituency'
    : selectedDistrict
    ? 'district'
    : selectedProvince
    ? 'province'
    : 'national';

  const eczLevelId = selectedWard || selectedConstituency || selectedDistrict || selectedProvince || 'national';

  const eczLevelName = (() => {
    if (selectedWard) {
      for (const p of provinces) for (const d of p.districts) for (const c of d.constituencies)
        for (const w of c.wards) if (w.id === selectedWard) return w.name;
    }
    if (selectedConstituency) {
      for (const p of provinces) for (const d of p.districts) for (const c of d.constituencies)
        if (c.id === selectedConstituency) return c.name;
    }
    if (selectedDistrict) {
      for (const p of provinces) {
        if (selectedProvince && p.id !== selectedProvince) continue;
        for (const d of p.districts) if (d.id === selectedDistrict) return d.name;
      }
    }
    if (selectedProvince) {
      const prov = provinces.find(p => p.id === selectedProvince);
      return prov?.name ?? '';
    }
    return 'National';
  })();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <ResultsStatusBar title="Presidential" stage={resultStage} onStageChange={setResultStage} />

        {/* Article 101 — 50%+1 majority check, sensed automatically from official round-1 results */}
        {needsRunoff && (
          <div className="mb-6 rounded-2xl border-2 border-amber-400 bg-amber-50 dark:bg-amber-950/30 p-5 flex items-start gap-4">
            <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-amber-900 dark:text-amber-200">Runoff Required — Article 101 of the Constitution</h3>
              <p className="text-sm text-amber-800 dark:text-amber-300 mt-1">
                No candidate has passed 50% of valid votes cast in Round 1
                {round1Leader ? <> — <strong>{round1Leader.candidate.name}</strong> leads with {round1Leader.percentage.toFixed(2)}%</> : null}
                {round1RunnerUp ? <>, followed by <strong>{round1RunnerUp.candidate.name}</strong> ({round1RunnerUp.percentage.toFixed(2)}%)</> : null}.
                A runoff between the top two candidates is required once Round 1 is fully certified.
              </p>
            </div>
          </div>
        )}

        {presConfig?.round === 'runoff' && (
          <div className="mb-6 rounded-2xl border-2 border-[#198754] bg-green-50 dark:bg-green-950/20 p-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="px-3 py-1 rounded-full bg-[#198754] text-white text-xs font-bold uppercase tracking-wide">Runoff — Round 2</div>
              <p className="text-sm text-foreground">
                Voting is between the top two Round 1 finishers
                {round1Leader ? <> — <strong>{round1Leader.candidate.name}</strong></> : null}
                {round1RunnerUp ? <> and <strong>{round1RunnerUp.candidate.name}</strong></> : null}.
              </p>
            </div>
            <div className="flex gap-1 rounded-lg overflow-hidden border border-border">
              {(['round1', 'runoff'] as const).map(r => (
                <button
                  key={r}
                  onClick={() => setViewRound(r)}
                  className={`px-3 py-1.5 text-xs font-semibold transition-colors ${viewRound === r ? 'bg-[#198754] text-white' : 'bg-card hover:bg-muted text-foreground'}`}
                >
                  {r === 'round1' ? 'View Round 1' : 'View Runoff'}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Results Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Candidate Results */}
          <div className={showAllCandidates ? 'lg:col-span-2 space-y-5' : 'lg:col-span-3 space-y-5'}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="w-1 h-8 bg-gradient-to-b from-[#198754] to-[#DC2626] rounded-full"></div>
                <h2 className="text-xl font-bold text-foreground">
                  {showAllCandidates ? 'All Candidates' : 'Top 4 Candidates'}
                </h2>
              </div>
              {candidateResults.length > 4 && (
                <button
                  onClick={() => setShowAllCandidates(v => !v)}
                  className="text-sm px-4 py-1.5 rounded-full border transition-colors"
                  style={{ borderColor: '#DC2626', color: showAllCandidates ? '#fff' : '#DC2626', background: showAllCandidates ? '#DC2626' : 'transparent' }}
                >
                  {showAllCandidates ? 'Show Top 4' : 'View Full Results'}
                </button>
              )}
            </div>
            {showAllCandidates ? (
              <div className="space-y-3">
                {candidateResults.map((result, index) => (
                  <CandidateCard
                    key={result.candidate.id}
                    candidate={result.candidate}
                    votes={result.votes}
                    totalVotes={totalValidVotes}
                    rank={index + 1}
                    isLeading={index === 0}
                  />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                {candidateResults.slice(0, 4).map((result) => (
                  <CandidateCardCompact
                    key={result.candidate.id}
                    candidate={result.candidate}
                    votes={result.votes}
                    totalVotes={totalValidVotes}
                    isLeading={result === candidateResults[0]}
                  />
                ))}
              </div>
            )}
            {!showAllCandidates && candidateResults.length > 4 && (
              <button
                onClick={() => setShowAllCandidates(true)}
                className="w-full py-3 rounded-xl border-2 border-dashed text-sm font-semibold transition-colors"
                style={{ borderColor: '#DC2626', color: '#DC2626' }}
              >
                View Full Results — {candidateResults.length - 4} more candidate{candidateResults.length - 4 !== 1 ? 's' : ''}
              </button>
            )}

            {/* Stats — sit directly below the candidate percentages */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="Registered Voters"
                value={totalRegistered.toLocaleString()}
              />
              <StatCard
                title="Votes Cast"
                value={totalVotes.toLocaleString()}
              />
              <StatCard
                title="Voter Turnout"
                value={`${turnout.toFixed(1)}%`}
                subtitle={`${filteredStations.length} stations`}
              />
              <StatCard
                title="Rejected Ballots"
                value={totalRejected.toLocaleString()}
              />
            </div>

            {/* Constitutional threshold note */}
            <p className="text-sm text-muted-foreground text-center sm:text-left">
              The winner of the presidential election needs more than 50% of the valid votes cast, per Article 101 of the Constitution.
            </p>

            {/* Provinces Reporting */}
            <div className="bg-gradient-to-br from-card to-card/80 border-2 border-border rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-foreground">Provinces Reporting</h3>
                <span className="text-sm font-semibold text-muted-foreground">
                  {provincesReportingCount} of {totalProvincesCount}
                </span>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                {provinces.map(p => {
                  const reporting = p.districts.some(d =>
                    d.constituencies.some(c => c.wards.some(w => w.pollingStations.some(s => s.totalVotes !== undefined)))
                  );
                  return (
                    <span
                      key={p.id}
                      title={p.name}
                      className="w-3 h-3 rounded-full"
                      style={{ background: reporting ? '#198754' : 'var(--muted)', border: reporting ? 'none' : '1px solid var(--border)' }}
                    />
                  );
                })}
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="lg:col-span-3">
            <DrillDownFilters
              selectedProvince={selectedProvince}
              selectedDistrict={selectedDistrict}
              selectedConstituency={selectedConstituency}
              selectedWard={selectedWard}
              selectedPollingStation={selectedPollingStation}
              onProvinceChange={handleProvinceChange}
              onDistrictChange={handleDistrictChange}
              onConstituencyChange={handleConstituencyChange}
              onWardChange={handleWardChange}
              onPollingStationChange={setSelectedPollingStation}
            />
          </div>

          {/* Chart — only shown in the full 'All Candidates' view to keep the page shorter by default */}
          {showAllCandidates && (
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-card to-card/80 border-2 border-border rounded-2xl p-6 sticky top-20 shadow-xl">
              <h3 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
                <div className="w-1 h-6 bg-gradient-to-b from-[#198754] to-[#DC2626] rounded-full"></div>
                Vote Distribution
              </h3>
              {totalValidVotes > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ percent }) => percent > 0.01 ? `${(percent * 100).toFixed(0)}%` : ''}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="name"
                    >
                      {chartData.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value, name) => [value, chartData.find(d => d.name === name)?.label ?? name]} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex flex-col items-center justify-center text-muted-foreground gap-2">
                  <div className="w-24 h-24 rounded-full border-4 border-dashed border-muted-foreground/30 flex items-center justify-center">
                    <span className="text-3xl text-muted-foreground/30">—</span>
                  </div>
                  <p className="text-sm">No votes recorded yet</p>
                </div>
              )}

              <div className="mt-4 pt-4 border-t border-border">
                <div className="flex justify-between text-sm mb-3">
                  <span className="text-muted-foreground font-semibold">Total Valid Votes</span>
                  <span className="font-bold text-foreground">{totalValidVotes.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm mb-4">
                  <span className="text-muted-foreground">Rejected Ballots</span>
                  <span className="font-semibold">{totalRejected}</span>
                </div>
                {/* Party colour legend */}
                <div className="grid grid-cols-2 gap-x-2 gap-y-1 max-h-44 overflow-y-auto pr-1">
                  {chartData.map(d => (
                    <div key={d.name} className="flex items-center gap-1.5 min-w-0">
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: d.color }} />
                      <span className="text-xs text-muted-foreground truncate">{d.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          )}
        </div>

        {/* Live Backend Results — also only shown in the full 'All Candidates' view */}
        {showAllCandidates && (
        <div className="mt-8 bg-card border border-border rounded-2xl p-6">
          <LiveResultsPanel
            electionType="presidential"
            autoRefreshSeconds={30}
            showLeaderboard={true}
            showCoverage={true}
            showTrend={true}
            showFeed={true}
          />
        </div>
        )}


        {/* Polling Station Details */}
        {selectedWard && filteredStations.length > 0 && (
          <div className="mt-8">
            <h2 className="font-bold text-foreground mb-4">Polling Station Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredStations.map(station => (
                <div key={station.id} className="bg-card border border-border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-[#198754]" />
                      <h3 className="font-semibold text-foreground">{station.name}</h3>
                    </div>
                    {station.timestamp && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {new Date(station.timestamp).toLocaleTimeString()}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                    <div>
                      <span className="text-muted-foreground">Registered:</span>
                      <span className="ml-1 font-semibold text-foreground">{station.registeredVoters?.toLocaleString() || 0}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Cast:</span>
                      <span className="ml-1 font-semibold text-foreground">{(station.totalVotes ?? 0).toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Turnout:</span>
                      <span className="ml-1 font-semibold text-foreground">
                        {calculateTurnout(station.registeredVoters || 0, station.totalVotes || 0).toFixed(1)}%
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Rejected:</span>
                      <span className="ml-1 font-semibold text-foreground">{(station.totalRejected ?? 0).toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    {station.results && Array.isArray(station.results) && station.results.map(result => {
                      const candidate = resolveCandidate(result.candidateId);

                      const percentage = station.totalVotes > 0
                        ? ((result.votes / station.totalVotes) * 100).toFixed(1)
                        : '0.0';

                      return (
                        <div key={result.candidateId} className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: candidate.partyColor }}
                          ></div>
                          <span className="text-xs flex-1">{candidate.party}</span>
                          <span className="text-xs font-semibold">{result.votes}</span>
                          <span className="text-xs text-muted-foreground">({percentage}%)</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Concluded Results Archive */}
        <div className="mt-10 pt-6 border-t border-border">
          <button
            onClick={() => setShowArchive(v => !v)}
            className="flex items-center gap-2 text-lg font-bold text-foreground mb-4"
          >
            <Archive className="w-5 h-5 text-[#198754]" />
            Concluded Results Archive
            <ChevronDown className={`w-4 h-4 transition-transform ${showArchive ? 'rotate-180' : ''}`} />
          </button>

          {showArchive && (
            <div className="bg-card border border-border rounded-2xl p-6">
              {archiveEntries.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No concluded elections have been archived yet. A national manager or admin can archive a certified
                  result once it's official.
                </p>
              ) : (
                <>
                  <div className="flex flex-wrap gap-4 mb-6">
                    <div>
                      <label className="block text-xs font-semibold text-muted-foreground mb-1">Year</label>
                      <select
                        value={archiveYear}
                        onChange={e => { setArchiveYear(e.target.value); setArchiveRound('round1'); }}
                        className="px-3 py-2 rounded-lg border border-border bg-background text-sm"
                      >
                        {archiveYears.map(y => <option key={y} value={y}>{y}</option>)}
                      </select>
                    </div>
                    {hasRunoffForYear && (
                      <div>
                        <label className="block text-xs font-semibold text-muted-foreground mb-1">Round</label>
                        <select
                          value={archiveRound}
                          onChange={e => setArchiveRound(e.target.value as 'round1' | 'runoff')}
                          className="px-3 py-2 rounded-lg border border-border bg-background text-sm"
                        >
                          <option value="round1">Round 1 (General)</option>
                          <option value="runoff">Runoff</option>
                        </select>
                      </div>
                    )}
                  </div>

                  {archiveLoading ? (
                    <p className="text-sm text-muted-foreground">Loading archived result…</p>
                  ) : archiveDetail ? (
                    <div>
                      <p className="text-sm text-muted-foreground mb-4">{archiveDetail.label} · Archived {new Date(archiveDetail.archivedAt).toLocaleDateString()}</p>
                      <div className="space-y-2">
                        {archiveDetail.result.candidates.map(c => {
                          const candidate = resolveCandidate(c.candidateId);
                          return (
                            <div key={c.candidateId} className="flex items-center gap-3 p-3 rounded-lg border border-border">
                              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: candidate.partyColor }} />
                              <span className="flex-1 text-sm font-medium text-foreground">{candidate.name}</span>
                              <span className="text-xs text-muted-foreground">{candidate.party}</span>
                              <span className="text-sm font-bold text-foreground w-16 text-right">{c.percentage.toFixed(2)}%</span>
                              <span className="text-xs text-muted-foreground w-24 text-right">{c.votes.toLocaleString()} votes</span>
                            </div>
                          );
                        })}
                      </div>
                      <p className="text-xs text-muted-foreground mt-4">
                        Turnout {archiveDetail.result.turnoutPercent.toFixed(1)}% · {archiveDetail.result.registeredVoters.toLocaleString()} registered voters
                        · {archiveDetail.result.stationsReporting.toLocaleString()} stations reporting
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No archived result found for this selection.</p>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* Downloads */}
        <div className="mt-10 pt-6 border-t border-border flex flex-col items-center gap-3">
          <p className="text-xs text-muted-foreground text-center max-w-md">
            Includes a full breakdown by polling station under the currently selected location, for every candidate.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <DownloadButton
              format="pdf"
              electionType="presidential"
              levelType={exportLevelType}
              levelId={exportLevelId || undefined}
              locationLabel={eczLevelName}
              candidateRoster={candidateResults.map(r => ({ id: r.candidate.id, name: r.candidate.name, party: r.candidate.party }))}
              title="Presidential Election Results"
              stage={resultStage}
              round={viewRound}
            />
            <DownloadButton
              format="excel"
              electionType="presidential"
              levelType={exportLevelType}
              levelId={exportLevelId || undefined}
              locationLabel={eczLevelName}
              candidateRoster={candidateResults.map(r => ({ id: r.candidate.id, name: r.candidate.name, party: r.candidate.party }))}
              title="Presidential Election Results"
              stage={resultStage}
              round={viewRound}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export { PresidentialPage as default };
