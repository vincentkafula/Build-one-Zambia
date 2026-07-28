import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { orgResourcesApi, InvestorRecord } from '../lib/api';

const GREEN = '#007A30';

export default function InvestorsScreen({ route }: { route: { params?: { source?: 'coop' | 'chamber' } } }) {
  const source = route.params?.source || 'coop';
  const [items, setItems] = useState<InvestorRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const call = source === 'coop' ? orgResourcesApi.coopInvestors() : orgResourcesApi.chamberInvestors();
    call.then(res => setItems(res.investors)).catch(e => setError(e instanceof Error ? e.message : 'Could not load investors.')).finally(() => setLoading(false));
  }, [source]);

  if (loading) return <View style={styles.centered}><ActivityIndicator color={GREEN} size="large" /></View>;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#f9fafb' }} contentContainerStyle={{ padding: 16 }}>
      {error ? (
        <Text style={styles.error}>{error}</Text>
      ) : items.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>No investors have been connected to you yet. BOZ's investor-relations team links real investor contacts here as they express interest.</Text>
        </View>
      ) : (
        items.map(inv => (
          <View key={inv.id} style={styles.card}>
            <View style={styles.rowBetween}>
              <Text style={styles.name}>{inv.name}</Text>
              <View style={styles.statusPill}><Text style={styles.statusText}>{inv.status.toUpperCase()}</Text></View>
            </View>
            <Text style={styles.sub}>{inv.country} · {inv.sector}</Text>
            {inv.investmentInterest && <Text style={styles.interest}>{inv.investmentInterest}</Text>}
            <View style={styles.contactBlock}>
              <Text style={styles.contactLine}>{inv.contactPerson || '\u2014'}</Text>
              <Text style={styles.contactLine}>{inv.phone || '\u2014'}</Text>
              <Text style={styles.contactLine}>{inv.email || '\u2014'}</Text>
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
  emptyCard: { alignItems: 'center', paddingVertical: 40, borderWidth: 1, borderColor: '#e5e7eb', borderStyle: 'dashed', borderRadius: 12 },
  emptyText: { color: '#6b7280', fontSize: 13, textAlign: 'center', paddingHorizontal: 24 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#f0f0f0' },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  name: { fontWeight: '700', color: '#111827', fontSize: 15 },
  sub: { color: '#6b7280', fontSize: 12, marginTop: 2, marginBottom: 8 },
  statusPill: { backgroundColor: '#dcfce7', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 },
  statusText: { fontSize: 9, fontWeight: '700', color: '#374151' },
  interest: { backgroundColor: '#fffbeb', color: '#92400e', fontSize: 12, padding: 8, borderRadius: 8, marginBottom: 10 },
  contactBlock: { gap: 3 },
  contactLine: { fontSize: 12, color: '#374151' },
});
