import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, TextInput, Alert } from 'react-native';
import { orgResourcesApi, EquipmentRecord } from '../lib/api';

const GREEN = '#007A30';

export default function CoopEquipmentScreen() {
  const [items, setItems] = useState<EquipmentRecord[]>([]);
  const [tab, setTab] = useState<'approved' | 'applied'>('applied');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', category: '', justification: '' });
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    setLoading(true);
    orgResourcesApi.listEquipment().then(res => setItems(res.equipment)).catch(() => setItems([])).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const filtered = tab === 'approved' ? items.filter(i => i.status === 'approved') : items;

  const submit = async () => {
    if (!form.name.trim() || !form.category.trim()) {
      Alert.alert('Missing details', 'Equipment name and category are required.');
      return;
    }
    setSubmitting(true);
    try {
      await orgResourcesApi.applyForEquipment(form);
      Alert.alert('Submitted', 'Your equipment application has been submitted.');
      setForm({ name: '', category: '', justification: '' });
      setShowForm(false);
      load();
    } catch (e) {
      Alert.alert('Could not submit', e instanceof Error ? e.message : 'Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#f9fafb' }}>
      <View style={styles.tabs}>
        <TouchableOpacity style={[styles.tab, tab === 'applied' && styles.tabActive]} onPress={() => setTab('applied')}>
          <Text style={[styles.tabText, tab === 'applied' && styles.tabTextActive]}>All Applications</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, tab === 'approved' && styles.tabActive]} onPress={() => setTab('approved')}>
          <Text style={[styles.tabText, tab === 'approved' && styles.tabTextActive]}>Approved</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <TouchableOpacity style={styles.applyButton} onPress={() => setShowForm(s => !s)}>
          <Text style={styles.applyButtonText}>{showForm ? 'Cancel' : 'Apply for Equipment'}</Text>
        </TouchableOpacity>

        {showForm && (
          <View style={styles.formCard}>
            <TextInput style={styles.input} placeholder="Equipment name" value={form.name} onChangeText={t => setForm(f => ({ ...f, name: t }))} />
            <TextInput style={styles.input} placeholder="Category (e.g. Irrigation)" value={form.category} onChangeText={t => setForm(f => ({ ...f, category: t }))} />
            <TextInput style={[styles.input, { height: 70 }]} placeholder="Why do you need this?" multiline value={form.justification} onChangeText={t => setForm(f => ({ ...f, justification: t }))} />
            <TouchableOpacity style={styles.submitButton} onPress={submit} disabled={submitting}>
              {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitButtonText}>Submit Application</Text>}
            </TouchableOpacity>
          </View>
        )}

        {loading ? (
          <ActivityIndicator color={GREEN} size="large" style={{ marginTop: 30 }} />
        ) : filtered.length === 0 ? (
          <Text style={styles.emptyText}>No {tab === 'approved' ? 'approved equipment yet' : 'equipment applications yet'}.</Text>
        ) : (
          filtered.map(eq => (
            <View key={eq.id} style={styles.card}>
              <Text style={styles.cardTitle}>{eq.name}</Text>
              <Text style={styles.cardSub}>{eq.category}</Text>
              <View style={[styles.statusPill, statusColor(eq.status)]}>
                <Text style={styles.statusText}>{eq.status.replace('_', ' ').toUpperCase()}</Text>
              </View>
              {eq.status === 'approved' && eq.assignedBy && <Text style={styles.meta}>Assigned by {eq.assignedBy}</Text>}
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

function statusColor(status: string) {
  if (status === 'approved') return { backgroundColor: '#dcfce7' };
  if (status === 'rejected') return { backgroundColor: '#fee2e2' };
  return { backgroundColor: '#fef3c7' };
}

const styles = StyleSheet.create({
  tabs: { flexDirection: 'row', backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  tab: { flex: 1, paddingVertical: 14, alignItems: 'center' },
  tabActive: { borderBottomWidth: 2, borderBottomColor: GREEN },
  tabText: { fontSize: 12, fontWeight: '600', color: '#6b7280' },
  tabTextActive: { color: GREEN },
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
  statusPill: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 },
  statusText: { fontSize: 9, fontWeight: '700', color: '#374151', letterSpacing: 0.5 },
  meta: { fontSize: 11, color: '#9ca3af', marginTop: 6 },
});
