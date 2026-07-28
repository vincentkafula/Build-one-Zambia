import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, TextInput, Alert } from 'react-native';
import { orgResourcesApi, ExportRecord } from '../lib/api';

const GREEN = '#007A30';

export default function CoopExportsScreen() {
  const [items, setItems] = useState<ExportRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ product: '', destination: '', quantity: '', value: '' });
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    setLoading(true);
    orgResourcesApi.listExports().then(res => setItems(res.exports)).catch(() => setItems([])).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const submit = async () => {
    if (!form.product.trim() || !form.destination.trim()) {
      Alert.alert('Missing details', 'Product and destination are required.');
      return;
    }
    setSubmitting(true);
    try {
      await orgResourcesApi.logExport(form);
      Alert.alert('Saved', 'Export record added.');
      setForm({ product: '', destination: '', quantity: '', value: '' });
      setShowForm(false);
      load();
    } catch (e) {
      Alert.alert('Could not save', e instanceof Error ? e.message : 'Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const totalValue = items.reduce((s, e) => s + (parseFloat(String(e.value).replace(/[^0-9.]/g, '')) || 0), 0);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#f9fafb' }} contentContainerStyle={{ padding: 16 }}>
      <View style={styles.statsRow}>
        <View style={styles.statCard}><Text style={styles.statValue}>{items.length}</Text><Text style={styles.statLabel}>Total Exports</Text></View>
        <View style={styles.statCard}><Text style={styles.statValue}>ZMW {totalValue.toLocaleString()}</Text><Text style={styles.statLabel}>Total Value</Text></View>
      </View>

      <TouchableOpacity style={styles.applyButton} onPress={() => setShowForm(s => !s)}>
        <Text style={styles.applyButtonText}>{showForm ? 'Cancel' : 'Log Export'}</Text>
      </TouchableOpacity>

      {showForm && (
        <View style={styles.formCard}>
          <TextInput style={styles.input} placeholder="Product" value={form.product} onChangeText={t => setForm(f => ({ ...f, product: t }))} />
          <TextInput style={styles.input} placeholder="Destination country" value={form.destination} onChangeText={t => setForm(f => ({ ...f, destination: t }))} />
          <TextInput style={styles.input} placeholder="Quantity (e.g. 500 kg)" value={form.quantity} onChangeText={t => setForm(f => ({ ...f, quantity: t }))} />
          <TextInput style={styles.input} placeholder="Value (e.g. ZMW 45,000)" value={form.value} onChangeText={t => setForm(f => ({ ...f, value: t }))} />
          <TouchableOpacity style={styles.submitButton} onPress={submit} disabled={submitting}>
            {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitButtonText}>Save Export Record</Text>}
          </TouchableOpacity>
        </View>
      )}

      {loading ? (
        <ActivityIndicator color={GREEN} size="large" style={{ marginTop: 30 }} />
      ) : items.length === 0 ? (
        <Text style={styles.emptyText}>No export records logged yet.</Text>
      ) : (
        items.map(ex => (
          <View key={ex.id} style={styles.card}>
            <Text style={styles.cardTitle}>{ex.product}</Text>
            <Text style={styles.cardSub}>{ex.destination} · {ex.quantity}</Text>
            <View style={styles.rowBetween}>
              <Text style={styles.value}>{ex.value}</Text>
              <View style={statusColor(ex.status)}><Text style={styles.statusText}>{ex.status.toUpperCase()}</Text></View>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
}

function statusColor(status: string) {
  const bg = status === 'Delivered' ? '#dcfce7' : status === 'In Transit' ? '#fed7aa' : '#fef3c7';
  return [styles.statusPill, { backgroundColor: bg }];
}

const styles = StyleSheet.create({
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  statCard: { flex: 1, backgroundColor: GREEN, borderRadius: 10, padding: 14, alignItems: 'center' },
  statValue: { color: '#fff', fontSize: 18, fontWeight: '700' },
  statLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 10, marginTop: 4 },
  applyButton: { backgroundColor: GREEN, borderRadius: 10, paddingVertical: 12, alignItems: 'center', marginBottom: 12 },
  applyButtonText: { color: '#fff', fontWeight: '700' },
  formCard: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: '#f0f0f0', gap: 10 },
  input: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8, fontSize: 13 },
  submitButton: { backgroundColor: GREEN, borderRadius: 8, paddingVertical: 10, alignItems: 'center' },
  submitButtonText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  emptyText: { color: '#9ca3af', fontSize: 13, textAlign: 'center', marginTop: 20 },
  card: { backgroundColor: '#fff', borderRadius: 10, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#f0f0f0' },
  cardTitle: { fontWeight: '700', color: '#111827', fontSize: 14 },
  cardSub: { color: '#6b7280', fontSize: 12, marginTop: 2, marginBottom: 8 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  value: { fontWeight: '700', color: '#111827', fontSize: 13 },
  statusPill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 },
  statusText: { fontSize: 9, fontWeight: '700', color: '#374151', letterSpacing: 0.5 },
});
