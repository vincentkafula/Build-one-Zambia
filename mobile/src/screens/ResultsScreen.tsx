import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, TouchableOpacity } from 'react-native';
import { resultsApi, candidatesApi, LevelResult, ElectionCategory } from '../lib/api';

const GREEN = '#007A30';
const CATEGORIES: { key: ElectionCategory; label: string }[] = [
  { key: 'presidential', label: 'President' },
  { key: 'parliament', label: 'Parliament' },
  { key: 'mayoral', label: 'Mayoral' },
  { key: 'councillor', label: 'Councillor' },
];

export default function ResultsScreen() {
  const [category, setCategory] = useState<ElectionCategory>('presidential');
  const [result, setResult] = useState<LevelResult | null>(null);
  const [names, setNames] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    (async () => {
      try {
        const [resultsRes, candRes] = await Promise.all([
          resultsApi.national(category),
          candidatesApi.list(category),
        ]);
        if (cancelled) return;
        setResult(resultsRes.result);
        const map: Record<string, string> = {};
        candRes.candidates.forEach(c => { map[c.id] = c.party || c.name; });
        setNames(map);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Could not load results.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [category]);

  return (
    <View style={styles.container}>
      <View style={styles.tabs}>
        {CATEGORIES.map(c => (
          <TouchableOpacity
            key={c.key}
            style={[styles.tab, category === c.key && styles.tabActive]}
            onPress={() => setCategory(c.key)}
          >
            <Text style={[styles.tabText, category === c.key && styles.tabTextActive]}>{c.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.centered}><ActivityIndicator color={GREEN} size="large" /></View>
      ) : error ? (
        <View style={styles.centered}><Text style={styles.error}>{error}</Text></View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16 }}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Total Votes Cast</Text>
            <Text style={styles.summaryValue}>{(result?.totalVotesCast ?? 0).toLocaleString()}</Text>
            <Text style={styles.summarySub}>
              {result?.stationsReporting ?? 0} stations reporting · {(result?.turnoutPercent ?? 0).toFixed(1)}% turnout
            </Text>
          </View>

          {(!result || result.candidates.length === 0) ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>No results yet</Text>
              <Text style={styles.emptyText}>No submissions have cleared verification for this race yet.</Text>
            </View>
          ) : (
            result.candidates.map(c => (
              <View key={c.candidateId} style={styles.candidateRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.candidateName}>{names[c.candidateId] || `Candidate ${c.rank}`}</Text>
                  <View style={styles.barTrack}>
                    <View style={[styles.barFill, { width: `${Math.min(100, c.percentage)}%` }]} />
                  </View>
                </View>
                <View style={{ alignItems: 'flex-end', marginLeft: 12 }}>
                  <Text style={styles.candidateVotes}>{c.votes.toLocaleString()}</Text>
                  <Text style={styles.candidatePct}>{c.percentage.toFixed(1)}%</Text>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  error: { color: '#dc2626', fontSize: 14 },
  tabs: { flexDirection: 'row', backgroundColor: '#fff', paddingHorizontal: 8, paddingTop: 8, gap: 6, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  tab: { paddingHorizontal: 12, paddingVertical: 10, borderTopLeftRadius: 8, borderTopRightRadius: 8 },
  tabActive: { backgroundColor: GREEN },
  tabText: { fontSize: 13, fontWeight: '600', color: '#6b7280' },
  tabTextActive: { color: '#fff' },
  summaryCard: { backgroundColor: GREEN, borderRadius: 14, padding: 20, marginBottom: 16 },
  summaryLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 12, letterSpacing: 0.5 },
  summaryValue: { color: '#fff', fontSize: 32, fontWeight: '700', marginTop: 4 },
  summarySub: { color: 'rgba(255,255,255,0.75)', fontSize: 12, marginTop: 6 },
  emptyCard: { alignItems: 'center', paddingVertical: 40, borderWidth: 1, borderColor: '#e5e7eb', borderStyle: 'dashed', borderRadius: 12 },
  emptyTitle: { fontWeight: '700', color: '#111827', marginBottom: 4 },
  emptyText: { color: '#6b7280', fontSize: 13, textAlign: 'center', paddingHorizontal: 24 },
  candidateRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 10, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: '#f0f0f0' },
  candidateName: { fontWeight: '600', color: '#111827', marginBottom: 6 },
  barTrack: { height: 6, backgroundColor: '#e5e7eb', borderRadius: 3, overflow: 'hidden' },
  barFill: { height: '100%', backgroundColor: GREEN },
  candidateVotes: { fontWeight: '700', color: '#111827' },
  candidatePct: { fontSize: 12, color: '#6b7280' },
});
