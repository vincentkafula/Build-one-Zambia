import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useAuth } from '../lib/AuthContext';
import { resultsApi, candidatesApi, LevelResult, LevelType, ElectionCategory } from '../lib/api';

const GREEN = '#007A30';

const ROLE_TO_LEVEL: Record<string, LevelType> = {
  ward_manager: 'ward',
  constituency_manager: 'constituency',
  district_manager: 'district',
  provincial_manager: 'province',
  province_manager: 'province',
  national_manager: 'national',
  super_admin: 'national',
  admin: 'national',
  manager: 'national',
};

const CATEGORIES: { key: ElectionCategory; label: string }[] = [
  { key: 'presidential', label: 'President' },
  { key: 'parliament', label: 'Parliament' },
  { key: 'mayoral', label: 'Mayoral' },
  { key: 'councillor', label: 'Councillor' },
];

export default function ManagerDashboardScreen() {
  const { user, logout } = useAuth();
  const [category, setCategory] = useState<ElectionCategory>('presidential');
  const [result, setResult] = useState<LevelResult | null>(null);
  const [names, setNames] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  const levelType = ROLE_TO_LEVEL[user?.role || ''] || 'national';
  const levelId = levelType === 'national' ? 'national' : (user?.scopeId || 'national');
  const scopeName = user?.scopeName || 'National';

  useEffect(() => {
    setLoading(true);
    Promise.all([
      resultsApi.level(category, levelType, levelId),
      candidatesApi.list(category, levelType === 'national' ? undefined : levelId),
    ]).then(([resultsRes, candRes]) => {
      setResult(resultsRes.result);
      const map: Record<string, string> = {};
      candRes.candidates.forEach(c => { map[c.id] = c.party || c.name; });
      setNames(map);
    }).catch(() => setResult(null)).finally(() => setLoading(false));
  }, [category, levelType, levelId]);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#f9fafb' }} contentContainerStyle={{ padding: 16 }}>
      <View style={styles.hero}>
        <Text style={styles.heroTitle}>{scopeName}</Text>
        <Text style={styles.heroSub}>{levelType.charAt(0).toUpperCase() + levelType.slice(1)} Manager</Text>
      </View>

      <View style={styles.tabs}>
        {CATEGORIES.map(c => (
          <TouchableOpacity key={c.key} style={[styles.tab, category === c.key && styles.tabActive]} onPress={() => setCategory(c.key)}>
            <Text style={[styles.tabText, category === c.key && styles.tabTextActive]}>{c.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator color={GREEN} size="large" style={{ marginTop: 30 }} />
      ) : (
        <>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Total Votes Cast in {scopeName}</Text>
            <Text style={styles.summaryValue}>{(result?.totalVotesCast ?? 0).toLocaleString()}</Text>
            <Text style={styles.summarySub}>
              {result?.stationsReporting ?? 0} stations reporting · {(result?.turnoutPercent ?? 0).toFixed(1)}% turnout
            </Text>
          </View>

          {(!result || result.candidates.length === 0) ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>No results yet</Text>
              <Text style={styles.emptyText}>No submissions have cleared verification for this race in your area yet.</Text>
            </View>
          ) : (
            result.candidates.map(c => (
              <View key={c.candidateId} style={styles.candidateRow}>
                <Text style={styles.candidateName}>{names[c.candidateId] || `Candidate ${c.rank}`}</Text>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.candidateVotes}>{c.votes.toLocaleString()}</Text>
                  <Text style={styles.candidatePct}>{c.percentage.toFixed(1)}%</Text>
                </View>
              </View>
            ))
          )}
        </>
      )}

      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <Text style={styles.logoutText}>Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  hero: { backgroundColor: GREEN, borderRadius: 14, padding: 18, marginBottom: 16 },
  heroTitle: { color: '#fff', fontSize: 17, fontWeight: '700' },
  heroSub: { color: 'rgba(255,255,255,0.8)', fontSize: 12, marginTop: 2 },
  tabs: { flexDirection: 'row', gap: 6, marginBottom: 16 },
  tab: { flex: 1, paddingVertical: 10, borderRadius: 8, backgroundColor: '#fff', alignItems: 'center', borderWidth: 1, borderColor: '#e5e7eb' },
  tabActive: { backgroundColor: GREEN, borderColor: GREEN },
  tabText: { fontSize: 12, fontWeight: '600', color: '#6b7280' },
  tabTextActive: { color: '#fff' },
  summaryCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#f0f0f0', marginBottom: 12 },
  summaryLabel: { fontSize: 11, color: '#9ca3af' },
  summaryValue: { fontSize: 26, fontWeight: '700', color: '#111827', marginTop: 4 },
  summarySub: { fontSize: 11, color: '#9ca3af', marginTop: 4 },
  emptyCard: { alignItems: 'center', paddingVertical: 40, borderWidth: 1, borderColor: '#e5e7eb', borderStyle: 'dashed', borderRadius: 12 },
  emptyTitle: { fontWeight: '700', color: '#111827', marginBottom: 4 },
  emptyText: { color: '#6b7280', fontSize: 13, textAlign: 'center', paddingHorizontal: 24 },
  candidateRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', borderRadius: 10, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: '#f0f0f0' },
  candidateName: { fontWeight: '600', color: '#111827', flex: 1 },
  candidateVotes: { fontWeight: '700', color: '#111827' },
  candidatePct: { fontSize: 12, color: '#6b7280' },
  logoutButton: { alignItems: 'center', paddingVertical: 14, borderRadius: 10, borderWidth: 1, borderColor: '#dc2626', marginTop: 20 },
  logoutText: { color: '#dc2626', fontWeight: '700' },
});
