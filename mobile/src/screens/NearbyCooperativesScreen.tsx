import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { orgResourcesApi } from '../lib/api';

const GREEN = '#007A30';

export default function NearbyCooperativesScreen({ route }: { route: { params?: { source?: 'chamber' | 'internship' } } }) {
  const source = route.params?.source || 'chamber';
  const [items, setItems] = useState<Record<string, unknown>[]>([]);
  const [area, setArea] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const call = source === 'chamber' ? orgResourcesApi.chamberCooperatives() : orgResourcesApi.internshipCooperatives();
    call.then(res => {
      setItems(res.cooperatives);
      setArea('ward' in res ? res.ward : ('district' in res ? res.district : ''));
    }).catch(e => setError(e instanceof Error ? e.message : 'Could not load cooperatives.')).finally(() => setLoading(false));
  }, [source]);

  if (loading) return <View style={styles.centered}><ActivityIndicator color={GREEN} size="large" /></View>;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#f9fafb' }} contentContainerStyle={{ padding: 16 }}>
      <Text style={styles.areaLabel}>{area || 'Your area'} \u2014 {items.length} registered cooperative{items.length === 1 ? '' : 's'}</Text>
      {error ? (
        <Text style={styles.error}>{error}</Text>
      ) : items.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>No approved cooperatives registered in your area yet.</Text>
        </View>
      ) : (
        items.map((coop) => (
          <View key={String(coop.id)} style={styles.card}>
            <Text style={styles.name}>{String(coop.cooperativeName || 'Cooperative')}</Text>
            {Array.isArray(coop.membershipNumbers) && <Text style={styles.sub}>{coop.membershipNumbers.length} Members</Text>}
            <View style={styles.contactBlock}>
              <Text style={styles.contactLine}>{String(coop.contactPerson || '\u2014')}</Text>
              <Text style={styles.contactLine}>{String(coop.contactPhone || '\u2014')}</Text>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  error: { color: '#dc2626', fontSize: 14, textAlign: 'center' },
  areaLabel: { color: '#6b7280', fontSize: 12, marginBottom: 12 },
  emptyCard: { alignItems: 'center', paddingVertical: 40, borderWidth: 1, borderColor: '#e5e7eb', borderStyle: 'dashed', borderRadius: 12 },
  emptyText: { color: '#6b7280', fontSize: 13, textAlign: 'center', paddingHorizontal: 24 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#f0f0f0' },
  name: { fontWeight: '700', color: '#111827', fontSize: 15 },
  sub: { color: '#6b7280', fontSize: 12, marginTop: 2, marginBottom: 8 },
  contactBlock: { gap: 3 },
  contactLine: { fontSize: 12, color: '#374151' },
});
