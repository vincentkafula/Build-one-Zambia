import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { orgResourcesApi, WardCoordinator } from '../lib/api';

const GREEN = '#007A30';

export default function WardCoordinatorScreen() {
  const [coordinator, setCoordinator] = useState<WardCoordinator | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orgResourcesApi.wardCoordinator()
      .then(res => setCoordinator(res.coordinator))
      .catch(e => setError(e instanceof Error ? e.message : 'No intern coordinator has been assigned to your ward yet.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <View style={styles.centered}><ActivityIndicator color={GREEN} size="large" /></View>;

  if (error || !coordinator) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyText}>{error || 'No intern coordinator has been assigned to your ward yet.'}</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#f9fafb', padding: 16 }}>
      <View style={styles.card}>
        {coordinator.note && <View style={styles.noteBox}><Text style={styles.noteText}>{coordinator.note}</Text></View>}
        <View style={styles.headerRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{coordinator.name.split(' ').map(n => n[0]).join('').slice(0, 2)}</Text>
          </View>
          <View>
            <Text style={styles.name}>{coordinator.name}</Text>
            <Text style={styles.title}>{coordinator.title}</Text>
          </View>
        </View>
        {coordinator.availableHours && (
          <View style={styles.row}><Text style={styles.rowLabel}>Available Hours</Text><Text style={styles.rowValue}>{coordinator.availableHours}</Text></View>
        )}
        <View style={styles.row}><Text style={styles.rowLabel}>Phone</Text><Text style={styles.rowValue}>{coordinator.phone || '\u2014'}</Text></View>
        <View style={styles.row}><Text style={styles.rowLabel}>Email</Text><Text style={styles.rowValue}>{coordinator.email || '\u2014'}</Text></View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  emptyText: { color: '#6b7280', fontSize: 13, textAlign: 'center' },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 18, borderWidth: 1, borderColor: '#f0f0f0' },
  noteBox: { backgroundColor: '#f3e8ff', borderRadius: 8, padding: 10, marginBottom: 14 },
  noteText: { color: '#6b21a8', fontSize: 12 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#8b5cf6', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontWeight: '700' },
  name: { fontWeight: '700', color: '#111827', fontSize: 15 },
  title: { color: '#6b7280', fontSize: 12 },
  row: { paddingVertical: 8, borderTopWidth: 1, borderTopColor: '#f3f4f6' },
  rowLabel: { fontSize: 11, color: '#9ca3af' },
  rowValue: { fontSize: 13, fontWeight: '600', color: '#111827', marginTop: 2 },
});
