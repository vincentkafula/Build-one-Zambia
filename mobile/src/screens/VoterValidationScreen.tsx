import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { voterRollApi, VoterSearchResult } from '../lib/api';
import { useAuth } from '../lib/AuthContext';

const GREEN = '#007A30';

type Mode = 'voterId' | 'nrc' | 'name';

export default function VoterValidationScreen() {
  const { user } = useAuth();
  const [mode, setMode] = useState<Mode>('voterId');
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<VoterSearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const stationId = user?.pollingStationId || user?.scopeId;

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const params: Record<string, string> = { pollingStationId: stationId || '' };
      if (mode === 'voterId') params.voterId = query.trim();
      if (mode === 'nrc') params.nrc = query.trim();
      if (mode === 'name') params.name = query.trim();
      const res = await voterRollApi.search(params);
      setResult(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.tabs}>
        {(['voterId', 'nrc', 'name'] as Mode[]).map(m => (
          <TouchableOpacity key={m} style={[styles.tab, mode === m && styles.tabActive]} onPress={() => { setMode(m); setResult(null); setQuery(''); }}>
            <Text style={[styles.tabText, mode === m && styles.tabTextActive]}>
              {m === 'voterId' ? 'Voter Card' : m === 'nrc' ? 'NRC' : 'Name'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TextInput
        style={styles.input}
        value={query}
        onChangeText={setQuery}
        placeholder={mode === 'voterId' ? 'Voter card number' : mode === 'nrc' ? 'NRC number' : 'Full name'}
        autoCapitalize={mode === 'name' ? 'words' : 'none'}
      />
      <TouchableOpacity style={styles.searchButton} onPress={handleSearch} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.searchButtonText}>Search</Text>}
      </TouchableOpacity>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {result && (
        result.found && result.voter ? (
          <View style={styles.resultCard}>
            <View style={[styles.statusPill, result.registeredHere ? styles.pillGood : styles.pillWarn]}>
              <Text style={styles.statusText}>{result.registeredHere ? 'REGISTERED AT THIS STATION' : 'REGISTERED ELSEWHERE'}</Text>
            </View>
            <Row label="Name" value={result.voter.fullName || `${result.voter.firstName || ''} ${result.voter.surname || ''}`.trim()} />
            <Row label="Voter Card No." value={result.voter.voterId} />
            <Row label="NRC" value={result.voter.nrc} />
            <Row label="Polling Station" value={result.voter.pollingStationName} />
          </View>
        ) : (
          <View style={styles.notFoundCard}>
            <Text style={styles.notFoundText}>No voter found for that {mode === 'voterId' ? 'voter card number' : mode === 'nrc' ? 'NRC' : 'name'}.</Text>
          </View>
        )
      )}
    </View>
  );
}

function Row({ label, value }: { label: string; value?: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value || '\u2014'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb', padding: 16 },
  tabs: { flexDirection: 'row', gap: 6, marginBottom: 12 },
  tab: { flex: 1, paddingVertical: 10, borderRadius: 8, backgroundColor: '#fff', alignItems: 'center', borderWidth: 1, borderColor: '#e5e7eb' },
  tabActive: { backgroundColor: GREEN, borderColor: GREEN },
  tabText: { fontSize: 12, fontWeight: '600', color: '#6b7280' },
  tabTextActive: { color: '#fff' },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#d1d5db', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, marginBottom: 10 },
  searchButton: { backgroundColor: GREEN, borderRadius: 10, paddingVertical: 13, alignItems: 'center' },
  searchButtonText: { color: '#fff', fontWeight: '700' },
  error: { color: '#dc2626', fontSize: 13, marginTop: 12, textAlign: 'center' },
  resultCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginTop: 16, borderWidth: 1, borderColor: '#f0f0f0' },
  statusPill: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, marginBottom: 12 },
  pillGood: { backgroundColor: '#dcfce7' },
  pillWarn: { backgroundColor: '#fef3c7' },
  statusText: { fontSize: 10, fontWeight: '700', color: '#374151', letterSpacing: 0.5 },
  row: { paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  rowLabel: { fontSize: 11, color: '#9ca3af' },
  rowValue: { fontSize: 14, fontWeight: '600', color: '#111827', marginTop: 2 },
  notFoundCard: { alignItems: 'center', paddingVertical: 30, marginTop: 16, borderWidth: 1, borderColor: '#e5e7eb', borderStyle: 'dashed', borderRadius: 12 },
  notFoundText: { color: '#6b7280', fontSize: 13 },
});
