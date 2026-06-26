import { useState } from 'react';
import { provinces, PollingStation, calculateTurnout } from '../data/mockData';
import { CandidateCard } from '../components/CandidateCard';
import { DrillDownFilters } from '../components/DrillDownFilters';
import { useElectionResults } from '../hooks/useElectionResults';
import { Users, MapPin, Clock, Wifi, WifiOff } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export function ParliamentPage() {
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedConstituency, setSelectedConstituency] = useState('');
  const [selectedWard, setSelectedWard] = useState('');
  const [selectedPollingStation, setSelectedPollingStation] = useState('');
  const [showAllCandidates, setShowAllCandidates] = useState(false);

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

  // Calculate aggregated results for the selected constituency
  const getAggregatedResults = () => {
    if (!currentConstituency) return null;

    const stations: PollingStation[] = [];
    currentConstituency.wards.forEach(ward => {
      if (selectedWard && ward.id !== selectedWard) return;
      if (selectedPollingStation) {
        const station = ward.pollingStations.find(s => s.id === selectedPollingStation);
        if (station) stations.push(station);
      } else {
        stations.push(...ward.pollingStations);
      }
    });

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
      stationCount: stations.length,
    };
  };

  const aggregatedResults = getAggregatedResults();

  // ── Live API ──────────────────────────────────────────────────────────────
  const levelType = selectedWard ? 'ward' : selectedConstituency ? 'constituency' : selectedDistrict ? 'district' : selectedProvince ? 'province' : 'national';
  const levelId = selectedWard || selectedConstituency || selectedDistrict || selectedProvince || '';
  const live = useElectionResults('parliament' as any, levelType as any, levelId);
  const usingLive = !live.usingMockData && live.liveResults.length > 0;

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

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-[#DC2626] to-[#B91C1C] bg-clip-text text-transparent mb-2">
            National Assembly Elections
          </h1>
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-muted-foreground">Member of Parliament results by constituency</p>
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${usingLive ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
              {usingLive ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
              {usingLive ? `Live · ${live.stationsReporting} stations` : 'Preview data'}
            </span>
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

        {!selectedConstituency && (
          <div className="text-center py-12">
            <Users className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">Select a Constituency</h3>
            <p className="text-muted-foreground">Please select a constituency from the filters above to view parliamentary results</p>
          </div>
        )}

        {selectedConstituency && currentConstituency && currentConstituency.mpCandidates && aggregatedResults && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
              <div className="bg-card border border-border rounded-lg p-6">
                <p className="text-sm text-muted-foreground mb-1">Registered Voters</p>
                <p className="text-3xl font-semibold text-foreground">{aggregatedResults.totalRegistered.toLocaleString()}</p>
              </div>
              <div className="bg-card border border-border rounded-lg p-6">
                <p className="text-sm text-muted-foreground mb-1">Votes Cast</p>
                <p className="text-3xl font-semibold text-foreground">{aggregatedResults.totalVotes.toLocaleString()}</p>
              </div>
              <div className="bg-card border border-border rounded-lg p-6">
                <p className="text-sm text-muted-foreground mb-1">Voter Turnout</p>
                <p className="text-3xl font-semibold text-foreground">{aggregatedResults.turnout.toFixed(1)}%</p>
              </div>
              <div className="bg-card border border-border rounded-lg p-6">
                <p className="text-sm text-muted-foreground mb-1">Polling Stations</p>
                <p className="text-3xl font-semibold text-foreground">{aggregatedResults.stationCount}</p>
              </div>
            </div>

            {/* Constituency Results */}
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="mb-4">
                <h2 className="text-xl font-bold text-foreground">{currentConstituency.name} Constituency</h2>
                <p className="text-sm text-muted-foreground">
                  {currentDistrict?.name}, {currentProvince?.name} Province
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Candidates List */}
                <div className="lg:col-span-2 space-y-3">
                  {(() => {
                    const mockSorted = [...currentConstituency.mpCandidates]
                      .map(c => ({ candidate: c, votes: aggregatedResults.voteTotals.get(c.id) || 0 }))
                      .sort((a, b) => b.votes - a.votes);
                    const sorted = usingLive ? live.liveResults : mockSorted;
                    const totalValidVotes = usingLive ? live.validVotes : (aggregatedResults.totalVotes - aggregatedResults.totalRejected);
                    const displayed = showAllCandidates ? sorted : sorted.slice(0, 4);
                    return (
                      <>
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-semibold text-foreground">
                            {showAllCandidates ? 'All Candidates' : 'Top 4 Candidates'}
                          </p>
                          {sorted.length > 4 && (
                            <button
                              onClick={() => setShowAllCandidates(v => !v)}
                              className="text-xs px-3 py-1 rounded-full border transition-colors"
                              style={{ borderColor: '#198754', color: showAllCandidates ? '#fff' : '#198754', background: showAllCandidates ? '#198754' : 'transparent' }}
                            >
                              {showAllCandidates ? 'Show Top 4' : 'View Full Results'}
                            </button>
                          )}
                        </div>
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
                        {!showAllCandidates && sorted.length > 4 && (
                          <button
                            onClick={() => setShowAllCandidates(true)}
                            className="w-full py-3 rounded-xl border-2 border-dashed text-sm font-semibold transition-colors"
                            style={{ borderColor: '#198754', color: '#198754' }}
                          >
                            View Full Results — {sorted.length - 4} more candidate{sorted.length - 4 !== 1 ? 's' : ''}
                          </button>
                        )}
                      </>
                    );
                  })()}
                </div>

                {/* Pie Chart */}
                <div className="lg:col-span-1">
                  <div className="bg-gradient-to-br from-card to-card/80 border border-border rounded-xl p-4">
                    <h3 className="text-sm font-bold text-foreground mb-4">Vote Distribution</h3>
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={currentConstituency.mpCandidates.map(c => ({
                            name: c.id,
                            label: c.party,
                            value: aggregatedResults.voteTotals.get(c.id) || 0,
                            color: c.partyColor,
                          }))}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ percent }) => percent > 0 ? `${(percent * 100).toFixed(0)}%` : ''}
                          outerRadius={60}
                          fill="#8884d8"
                          dataKey="value"
                          nameKey="name"
                        >
                          {currentConstituency.mpCandidates.map((c) => (
                            <Cell key={c.id} fill={c.partyColor} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value, name) => [value, currentConstituency.mpCandidates.find(c => c.id === name)?.party ?? name]} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="mt-4 pt-4 border-t border-border text-center">
                      <p className="text-xs text-muted-foreground">Total Votes</p>
                      <p className="text-lg font-bold text-foreground">{(aggregatedResults.totalVotes - aggregatedResults.totalRejected).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-border">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Registered Voters:</span>
                    <span className="ml-2 font-semibold">{aggregatedResults.totalRegistered.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Votes Cast:</span>
                    <span className="ml-2 font-semibold">{aggregatedResults.totalVotes.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Turnout:</span>
                    <span className="ml-2 font-semibold">{aggregatedResults.turnout.toFixed(1)}%</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Rejected:</span>
                    <span className="ml-2 font-semibold">{aggregatedResults.totalRejected.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}


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
