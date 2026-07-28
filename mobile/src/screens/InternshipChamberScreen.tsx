import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { orgResourcesApi } from '../lib/api';

const GREEN = '#007A30';

export default function InternshipChamberScreen() {
  const [chamber, setChamber] = useState<Record<string, unknown> | null>(null);
  const [district, setDistrict] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orgResourcesApi.internshipChamber()
      .then(res => { setChamber(res.chamber); setDistrict(res.district); })
      .catch(() => setChamber(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <View style={styles.centered}><ActivityIndicator color={GREEN} size="large" /></View>;

  if (!chamber) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyText}>No chamber has been assigned to your district ({district || 'unknown'}) yet.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#f9fafb' }} contentContainerStyle={{ padding: 16 }}>
      <View style={styles.card}>
        <Text style={styles.name}>{String(chamber.chamberName || 'Chamber of Commerce')}</Text>
        <Text style={styles.sub}>{district}</Text>
        <View style={styles.row}><Text style={styles.rowLabel}>Contact Person</Text><Text style={styles.rowValue}>{String(chamber.contactPerson || '\u2014')}</Text></View>
        <View style={styles.row}><Text style={styles.rowLabel}>Phone</Text><Text style={styles.rowValue}>{String(chamber.contactPhone || chamber.phone || '\u2014')}</Text></View>
        <View style={styles.row}><Text style={styles.rowLabel}>Email</Text><Text style={styles.rowValue}>{String(chamber.email || '\u2014')}</Text></View>
        {!!chamber.website && <View style={styles.row}><Text style={styles.rowLabel}>Website</Text><Text style={styles.rowValue}>{String(chamber.website)}</Text></View>}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  emptyText: { color: '#6b7280', fontSize: 13, textAlign: 'center' },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 18, borderWidth: 1, borderColor: '#f0f0f0' },
  name: { fontWeight: '700', color: '#111827', fontSize: 17 },
  sub: { color: '#6b7280', fontSize: 12, marginTop: 2, marginBottom: 12 },
  row: { paddingVertical: 8, borderTopWidth: 1, borderTopColor: '#f3f4f6' },
  rowLabel: { fontSize: 11, color: '#9ca3af' },
  rowValue: { fontSize: 13, fontWeight: '600', color: '#111827', marginTop: 2 },
});
