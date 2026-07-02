import { useState, useMemo } from 'react';
import { LiveResultsPanel } from '../components/LiveResultsPanel';
import { DrillDownFilters } from '../components/DrillDownFilters';
import { CandidateCard } from '../components/CandidateCard';
import { StatCard } from '../components/StatCard';
import { DownloadButton } from '../components/DownloadButton';
import {
  presidentialCandidates,
  provinces,
  aggregateResults,
  calculateTurnout,
  PollingStation,
} from '../data/mockData';
import { useElectionResults } from '../hooks/useElectionResults';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { MapPin, Clock, Wifi, WifiOff } from 'lucide-react';

export function PresidentialPage() {
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedConstituency, setSelectedConstituency] = useState('');
  const [selectedWard, setSelectedWard] = useState('');
  const [selectedPollingStation, setSelectedPollingStation] = useState('');
  const [showAllCandidates, setShowAllCandidates] = useState(false);

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

  const live = useElectionResults('presidential', levelType as any, levelId);

  // ── Mock data fallback ────────────────────────────────────────────────────
  const filteredStations = getFilteredStations();
  const resultTotals = aggregateResults(filteredStations);
  const mockResults = presidentialCandidates
    .map(c => ({ candidate: c, votes: resultTotals.get(c.id) || 0, percentage: 0, rank: 0 }))
    .sort((a, b) => b.votes - a.votes)
    .map((r, i) => ({ ...r, rank: i + 1 }));

  const usingLive = !live.usingMockData && live.liveResults.length > 0;
  const candidateResults = usingLive ? live.liveResults : mockResults;

  const totalValidVotes = candidateResults.reduce((sum, r) => sum + r.votes, 0);
  const totalRegistered = usingLive ? live.totalRegistered : filteredStations.reduce((sum, s) => sum + s.registeredVoters, 0);
  const totalVotes      = usingLive ? live.totalVotes      : filteredStations.reduce((sum, s) => sum + (s.totalVotes ?? 0), 0);
  const totalRejected   = usingLive ? live.rejectedBallots : filteredStations.reduce((sum, s) => sum + (s.totalRejected ?? 0), 0);
  const turnout         = usingLive ? live.turnoutPercent  : calculateTurnout(totalRegistered, totalVotes);

  const chartData = candidateResults.map(r => ({
    name: r.candidate.id,
    label: r.candidate.party,
    value: r.votes,
    color: r.candidate.partyColor,
  }));

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
      for (const p of provinces) for (const d of p.districts)
        if (d.id === selectedDistrict) return d.name;
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
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-[#198754] to-[#DC2626] bg-clip-text text-transparent mb-2">
              Presidential Election Results
            </h1>
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-muted-foreground">Real-time results from polling stations across Zambia</p>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${usingLive ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                {usingLive ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                {usingLive ? `Live · ${live.stationsReporting} stations` : 'Preview data'}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <DownloadButton
              format="pdf"
              data={candidateResults}
              title="Presidential Election Results"
              locationLabel={eczLevelName}
              totals={{ registered: totalRegistered, cast: totalVotes, valid: totalValidVotes, rejected: totalRejected, turnout }}
            />
            <DownloadButton
              format="excel"
              data={candidateResults}
              title="Presidential Election Results"
              locationLabel={eczLevelName}
              totals={{ registered: totalRegistered, cast: totalVotes, valid: totalValidVotes, rejected: totalRejected, turnout }}
            />
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6">
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

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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

        {/* Results Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Candidate Results */}
          <div className="lg:col-span-2 space-y-5">
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
            {(showAllCandidates ? candidateResults : candidateResults.slice(0, 4)).map((result, index) => (
              <CandidateCard
                key={result.candidate.id}
                candidate={result.candidate}
                votes={result.votes}
                totalVotes={totalValidVotes}
                rank={index + 1}
                isLeading={index === 0}
              />
            ))}
            {!showAllCandidates && candidateResults.length > 4 && (
              <button
                onClick={() => setShowAllCandidates(true)}
                className="w-full py-3 rounded-xl border-2 border-dashed text-sm font-semibold transition-colors"
                style={{ borderColor: '#DC2626', color: '#DC2626' }}
              >
                View Full Results — {candidateResults.length - 4} more candidate{candidateResults.length - 4 !== 1 ? 's' : ''}
              </button>
            )}
          </div>

          {/* Chart */}
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
        </div>

        {/* Live Backend Results */}
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
                      const candidate = presidentialCandidates.find(c => c.id === result.candidateId);
                      if (!candidate) return null;

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
      </div>
    </div>
  );
}

export { PresidentialPage as default };
