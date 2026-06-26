import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api/apiClient';
import { PollingStationResult, ResultsFilter, ElectionType } from '../services/results/resultsService';
import { NationalSummary } from '../services/results/aggregationService';
import { eventBus } from '../services/realtime/eventBus';

export function useResults(filter?: ResultsFilter) {
  const [results, setResults] = useState<PollingStationResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await api.results.getFiltered(filter ?? {});
    if (res.error) setError(res.error);
    else { setResults(res.data ?? []); setError(null); }
    setLoading(false);
  }, [JSON.stringify(filter)]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    return eventBus.on('results_updated', () => load());
  }, [load]);

  return { results, loading, error, refresh: load };
}

export function useNationalSummary(electionType: ElectionType) {
  const [summary, setSummary] = useState<NationalSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await api.aggregation.getNationalSummary(electionType);
    setSummary(res.data ?? null);
    setLoading(false);
  }, [electionType]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    return eventBus.on('results_updated', () => load());
  }, [load]);

  return { summary, loading, refresh: load };
}

export function useResultsStats() {
  const [stats, setStats] = useState<Awaited<ReturnType<typeof api.results.getStats>>['data']>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const res = await api.results.getStats();
    setStats(res.data ?? null);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { return eventBus.on('results_updated', () => load()); }, [load]);

  return { stats, loading, refresh: load };
}
