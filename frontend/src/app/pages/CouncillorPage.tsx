import { useState } from 'react';
import { provinces, PollingStation, calculateTurnout, resolveCandidate } from '../data/mockData';
import { DrillDownFilters } from '../components/DrillDownFilters';
import { CandidateCard } from '../components/CandidateCard';
import { CandidateCardCompact } from '../components/CandidateCardCompact';
import { ResultsStatusBar, ResultStage } from '../components/ResultsStatusBar';
import { useElectionResults } from '../hooks/useElectionResults';
import { MapPin, Clock, Wifi, WifiOff } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export function CouncillorPage() {
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedConstituency, setSelectedConstituency] = useState('');
  const [selectedWard, setSelectedWard] = useState('');
  const [selectedPollingStation, setSelectedPollingStation] = useState('');
  const [showAllCandidates, setShowAllCandidates] = useState(false);
  const [resultStage, setResultStage] = useState<ResultStage>('provisional');

  const currentProvince = provinces.find(p => p.id === selectedProvince);
  const currentDistrict = currentProvince?.districts.find(d => d.id === selectedDistrict);
  const currentConstituency = currentDistrict?.constituencies.find(c => c.id === selectedConstituency);
  const currentWard = currentConstituency?.wards.find(w => w.id === selectedWard);

  // Get polling stations if ward is selected
  let pollingStations: PollingStation[] = [];
  if (selectedWard && currentWard && currentWard.pollingStations) {
    if (selectedPollingStation) {
      const station = currentWard.pollingStations.find(s => s.id === selectedPollingStation);
      if (station) pollingStations = [station];
    } else {
      pollingStations = currentWard.pollingStations || [];
    }
  }


  // ── Live API ──────────────────────────────────────────────────────────────
  const levelType = selectedWard ? 'ward' : selectedConstituency ? 'constituency' : selectedDistrict ? 'district' : selectedProvince ? 'province' : 'national';
  const levelId = selectedWard || selectedConstituency || selectedDistrict || selectedProvince || '';
  const live = useElectionResults('councillor' as any, levelType as any, levelId);
  const usingLive = !live.usingMockData && live.liveResults.length > 0;
  const hasLiveStats = live.backendConnected && !live.usingMockData;

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

  // Calculate aggregated results for the selected ward
  const getAggregatedResults = () => {
    if (!currentWard) return null;

    const stations: PollingStation[] = [];
    if (selectedPollingStation) {
      const station = currentWard.pollingStations.find(s => s.id === selectedPollingStation);
      if (station) stations.push(station);
    } else {
      stations.push(...currentWard.pollingStations);
    }

    const totalRegistered = stations.reduce((sum, s) => sum + s.registeredVoters, 0);
    const totalVotes = stations.reduce((sum, s) => sum + (s.totalVotes ?? 0), 0);
    const totalRejected = stations.reduce((sum, s) => sum + (s.totalRejected ?? 0), 0);
    const turnout = calculateTurnout(totalRegistered, totalVotes);

    // Aggregate votes per candidate
    const voteTotals = new Map<string, number>();
    stations.forEach(station => {
      if (station.results && Array.isArray(station.results)) {
        station.results.forEach(result => {
          const current = voteTotals.get(result.candidateId) || 0;
          voteTotals.set(result.candidateId, current + result.votes);
        });
      }
    });

    return {
      totalRegistered,
      totalVotes,
      totalRejected,
      turnout,
      voteTotals,
      stationCount: stations.length };
  };

  const aggregatedResults = getAggregatedResults();

  const councillorCandidates = currentWard?.councillorCandidates || [];

  // Prefer live backend results (from actual agent submissions) when available;
  // fall back to the local sample-data aggregation only when the backend has
  // no submissions yet for this level — mirrors PresidentialPage's data flow.
  const localCandidateResults = aggregatedResults && councillorCandidates.length > 0
    ? [...councillorCandidates]
        .map(c => ({ candidate: c, votes: aggregatedResults.voteTotals.get(c.id) || 0 }))
        .sort((a, b) => b.votes - a.votes)
    : [];
  const candidateResults = usingLive ? live.liveResults : localCandidateResults;
  const displayRegistered = hasLiveStats ? live.totalRegistered : (aggregatedResults?.totalRegistered ?? 0);
  const displayVotesCast = hasLiveStats ? live.totalVotes : (aggregatedResults?.totalVotes ?? 0);
  const displayRejected = hasLiveStats ? live.rejectedBallots : (aggregatedResults?.totalRejected ?? 0);
  const displayTurnout = hasLiveStats ? live.turnoutPercent : (aggregatedResults?.turnout ?? 0);
  const displayStations = hasLiveStats ? live.stationsReporting : (aggregatedResults?.stationCount ?? 0);
  const totalValidVotesForDisplay = hasLiveStats ? live.validVotes : (displayVotesCast - displayRejected);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <ResultsStatusBar title="Councillor" stage={resultStage} onStageChange={setResultStage} />
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-[#F59E0B] to-[#D97706] bg-clip-text text-transparent mb-2">
            Ward Councillor Elections
          </h1>
          <p className="text-muted-foreground">Local government representative results by ward</p>
        </div>

        {!selectedWard && (
          <div className="text-center py-12">
            <MapPin className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">Select a Ward</h3>
            <p className="text-muted-foreground">Please select a ward from the filters below to view councillor results</p>
          </div>
        )}

        {selectedWard && currentWard && aggregatedResults && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
              <div className="bg-card border border-border rounded-lg p-6">
                <p className="text-sm text-muted-foreground mb-1">Registered Voters</p>
                <p className="text-3xl font-semibold text-foreground">{displayRegistered.toLocaleString()}</p>
              </div>
              <div className="bg-card border border-border rounded-lg p-6">
                <p className="text-sm text-muted-foreground mb-1">Votes Cast</p>
                <p className="text-3xl font-semibold text-foreground">{displayVotesCast.toLocaleString()}</p>
              </div>
              <div className="bg-card border border-border rounded-lg p-6">
                <p className="text-sm text-muted-foreground mb-1">Voter Turnout</p>
                <p className="text-3xl font-semibold text-foreground">{displayTurnout.toFixed(1)}%</p>
              </div>
              <div className="bg-card border border-border rounded-lg p-6">
                <p className="text-sm text-muted-foreground mb-1">Polling Stations</p>
                <p className="text-3xl font-semibold text-foreground">{displayStations}</p>
              </div>
            </div>

            {/* Ward Results */}
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-1">
                  <MapPin className="w-5 h-5 text-[#F59E0B]" />
                  <h2 className="text-xl font-bold text-foreground">{currentWard.name}</h2>
                </div>
                <p className="text-sm text-muted-foreground">
                  {currentConstituency?.name} Constituency, {currentDistrict?.name}, {currentProvince?.name} Province
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {aggregatedResults.stationCount} polling station{aggregatedResults.stationCount !== 1 ? 's' : ''}
                </p>
              </div>

              {(() => {
                const totalValidVotes = totalValidVotesForDisplay;
                const sorted = candidateResults;
                const displayed = showAllCandidates ? sorted : sorted.slice(0, 4);

                const header = (
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-semibold text-foreground">
                      {showAllCandidates ? 'All Candidates' : 'Top 4 Candidates'}
                    </p>
                    {sorted.length > 4 && (
                      <button
                        onClick={() => setShowAllCandidates(v => !v)}
                        className="text-xs px-3 py-1 rounded-full border transition-colors"
                        style={{ borderColor: '#F59E0B', color: showAllCandidates ? '#fff' : '#F59E0B', background: showAllCandidates ? '#F59E0B' : 'transparent' }}
                      >
                        {showAllCandidates ? 'Show Top 4' : 'View Full Results'}
                      </button>
                    )}
                  </div>
                );

                const viewMoreButton = !showAllCandidates && sorted.length > 4 && (
                  <button
                    onClick={() => setShowAllCandidates(true)}
                    className="w-full py-3 rounded-xl border-2 border-dashed text-sm font-semibold transition-colors"
                    style={{ borderColor: '#F59E0B', color: '#F59E0B' }}
                  >
                    View Full Results — {sorted.length - 4} more candidate{sorted.length - 4 !== 1 ? 's' : ''}
                  </button>
                );

                if (!showAllCandidates) {
                  // Top-4 view: same compact card grid used on the Presidential dashboard
                  return (
                    <div className="space-y-3">
                      {header}
                      <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                        {displayed.map((r) => (
                          <CandidateCardCompact
                            key={r.candidate.id}
                            candidate={r.candidate}
                            votes={r.votes}
                            totalVotes={totalValidVotes}
                            isLeading={r === sorted[0]}
                          />
                        ))}
                      </div>
                      {viewMoreButton}
                    </div>
                  );
                }

                return (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Candidates List */}
                    <div className="lg:col-span-2 space-y-3">
                      {header}
                      {displayed.map((r, i) => (
                        <CandidateCard
                          key={r.candidate.id}
                          candidate={r.candidate}
                          votes={r.votes}
                          totalVotes={totalValidVotes}
                          rank={i + 1}
                          isLeading={i === 0}
                        />
                      ))}
                    </div>

                    {/* Pie Chart */}
                    <div className="lg:col-span-1">
                      <div className="bg-gradient-to-br from-card to-card/80 border border-border rounded-xl p-4">
                        <h3 className="text-sm font-bold text-foreground mb-4">Vote Distribution</h3>
                        <ResponsiveContainer width="100%" height={200}>
                          <PieChart>
                            <Pie
                              data={sorted.map(r => ({
                                name: r.candidate.id,
                                label: r.candidate.party,
                                value: r.votes,
                                color: r.candidate.partyColor }))}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ percent }) => percent > 0 ? `${(percent * 100).toFixed(0)}%` : ''}
                              outerRadius={60}
                              fill="#8884d8"
                              dataKey="value"
                              nameKey="name"
                            >
                              {sorted.map((r) => (
                                <Cell key={r.candidate.id} fill={r.candidate.partyColor} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value, name) => [value, sorted.find(r => r.candidate.id === name)?.candidate.party ?? name]} />
                          </PieChart>
                        </ResponsiveContainer>
                        <div className="mt-4 pt-4 border-t border-border text-center">
                          <p className="text-xs text-muted-foreground">Total Valid Votes</p>
                          <p className="text-lg font-bold text-foreground">{totalValidVotes.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}

              <div className="mt-4 pt-4 border-t border-border">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Registered Voters:</span>
                    <span className="ml-2 font-semibold">{displayRegistered.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Votes Cast:</span>
                    <span className="ml-2 font-semibold">{displayVotesCast.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Turnout:</span>
                    <span className="ml-2 font-semibold">{displayTurnout.toFixed(1)}%</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Rejected:</span>
                    <span className="ml-2 font-semibold">{displayRejected.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Filters */}
        <div className="mb-6 mt-8">
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

        {/* Polling Station Details - shown when ward is selected */}
        {selectedWard && pollingStations.length > 0 && (
          <div className="mt-8">
            <h2 className="font-bold text-foreground mb-4">Polling Station Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pollingStations.map(station => (
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

                  <div className="grid grid-cols-2 gap-2 text-sm">
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
                        {calculateTurnout(station.registeredVoters || 0, station.totalVotes ?? 0).toFixed(1)}%
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Rejected:</span>
                      <span className="ml-1 font-semibold text-foreground">{(station.totalRejected ?? 0).toLocaleString()}</span>
                    </div>
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

export { CouncillorPage as default };
