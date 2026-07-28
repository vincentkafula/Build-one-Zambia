import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, TextInput, Alert } from 'react-native';
import { registrationApi, RegistrationRecord } from '../lib/api';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../lib/AuthContext';

const GREEN = '#007A30';

// Fields worth showing vary per registration type — chamber applications
// have chamberName/contactPerson, internship applications have
// university/course, etc. Rather than hardcode one shape, show whichever
// of these commonly-used fields the record actually has.
const DISPLAY_FIELDS: { key: string; label: string }[] = [
  { key: 'chamberName', label: 'Chamber Name' },
  { key: 'partyName', label: 'Party Name' },
  { key: 'country', label: 'Country' },
  { key: 'affiliationType', label: 'Affiliation Type' },
  { key: 'university', label: 'University' },
  { key: 'course', label: 'Course' },
  { key: 'yearOfStudy', label: 'Year of Study' },
  { key: 'ward', label: 'Ward' },
  { key: 'district', label: 'District' },
  { key: 'headquartersAddress', label: 'Headquarters Address' },
  { key: 'memberBusinesses', label: 'Member Businesses' },
  { key: 'website', label: 'Website' },
  { key: 'contactPerson', label: 'Contact Person' },
  { key: 'contactTitle', label: "Contact Person's Title" },
  { key: 'phone', label: 'Phone' },
  { key: 'email', label: 'Email' },
];

export default function RegistrationProfileScreen({
  type, title, subtitle,
}: {
  type: 'chamber' | 'internship' | 'intlparty';
  title: string;
  subtitle: string;
}) {
  const { logout } = useAuth();
  const navigation = useNavigation<any>();
  const [reg, setReg] = useState<RegistrationRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [draft, setDraft] = useState<Record<string, string>>({});

  useEffect(() => {
    registrationApi.my(type)
      .then(res => setReg(res.registration))
      .catch(e => setError(e instanceof Error ? e.message : 'Could not load your application.'))
      .finally(() => setLoading(false));
  }, [type]);

  if (loading) return <View style={styles.centered}><ActivityIndicator color={GREEN} size="large" /></View>;

  const fields = DISPLAY_FIELDS.filter(f => reg && reg[f.key] !== undefined);

  const startEditing = () => {
    if (!reg) return;
    const initial: Record<string, string> = {};
    fields.forEach(f => { initial[f.key] = String(reg[f.key] ?? ''); });
    setDraft(initial);
    setEditing(true);
  };

  const cancelEditing = () => setEditing(false);

  const saveEditing = async () => {
    setSaving(true);
    try {
      const res = await registrationApi.updateMy(type, draft);
      setReg(res.registration);
      setEditing(false);
      Alert.alert('Saved', 'Your details have been updated.');
    } catch (e) {
      Alert.alert('Could not save', e instanceof Error ? e.message : 'Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#f9fafb' }} contentContainerStyle={{ padding: 16 }}>
      <View style={styles.hero}>
        <Text style={styles.heroTitle}>
          {(reg?.chamberName as string) || (reg?.partyName as string) || (reg?.fullName as string) || title}
        </Text>
        <Text style={styles.heroSub}>{subtitle}</Text>
      </View>

      {error ? (
        <Text style={styles.error}>{error}</Text>
      ) : reg ? (
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <View style={[styles.statusPill, reg.status === 'approved' ? styles.statusApproved : styles.statusPending]}>
              <Text style={styles.statusText}>{String(reg.status).toUpperCase()}</Text>
            </View>
            {!editing && (
              <TouchableOpacity onPress={startEditing}>
                <Text style={styles.editLink}>Edit</Text>
              </TouchableOpacity>
            )}
          </View>

          {editing ? (
            <>
              {fields.map(f => (
                <View key={f.key} style={{ marginBottom: 12 }}>
                  <Text style={styles.rowLabel}>{f.label}</Text>
                  <TextInput
                    style={styles.editInput}
                    value={draft[f.key] ?? ''}
                    onChangeText={t => setDraft(prev => ({ ...prev, [f.key]: t }))}
                  />
                </View>
              ))}
              <View style={styles.editActions}>
                <TouchableOpacity style={[styles.editActionButton, styles.cancelButton]} onPress={cancelEditing} disabled={saving}>
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.editActionButton, styles.saveButton]} onPress={saveEditing} disabled={saving}>
                  {saving ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.saveButtonText}>Save Changes</Text>}
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
              {fields.map(f => (
                <View key={f.key} style={styles.row}>
                  <Text style={styles.rowLabel}>{f.label}</Text>
                  <Text style={styles.rowValue}>{String(reg[f.key])}</Text>
                </View>
              ))}
              {fields.length === 0 && (
                <Text style={styles.emptyText}>No additional details on file yet.</Text>
              )}
            </>
          )}
        </View>
      ) : null}

      <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.navigate('ChangePassword')}>
        <Text style={styles.secondaryButtonText}>Change Password</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <Text style={styles.logoutText}>Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  secondaryButton: { alignItems: 'center', paddingVertical: 14, borderRadius: 10, borderWidth: 1, borderColor: '#007A30', marginTop: 12 },
  secondaryButtonText: { color: '#007A30', fontWeight: '700' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  error: { color: '#dc2626', fontSize: 14, textAlign: 'center', marginTop: 12 },
  hero: { backgroundColor: GREEN, borderRadius: 14, padding: 18, marginBottom: 16 },
  heroTitle: { color: '#fff', fontSize: 17, fontWeight: '700' },
  heroSub: { color: 'rgba(255,255,255,0.8)', fontSize: 12, marginTop: 2 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#f0f0f0' },
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  editLink: { color: GREEN, fontWeight: '700', fontSize: 13 },
  statusPill: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  statusApproved: { backgroundColor: '#dcfce7' },
  statusPending: { backgroundColor: '#fef3c7' },
  statusText: { fontSize: 10, fontWeight: '700', color: '#374151', letterSpacing: 0.5 },
  row: { paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  rowLabel: { fontSize: 11, color: '#9ca3af' },
  rowValue: { fontSize: 13, fontWeight: '600', color: '#111827', marginTop: 2 },
  editInput: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8, fontSize: 13, marginTop: 4, color: '#111827' },
  editActions: { flexDirection: 'row', gap: 8, marginTop: 4 },
  editActionButton: { flex: 1, paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  cancelButton: { backgroundColor: '#f3f4f6' },
  cancelButtonText: { color: '#374151', fontWeight: '700', fontSize: 13 },
  saveButton: { backgroundColor: GREEN },
  saveButtonText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  emptyText: { color: '#9ca3af', fontSize: 13 },
  logoutButton: { alignItems: 'center', paddingVertical: 14, borderRadius: 10, borderWidth: 1, borderColor: '#dc2626', marginTop: 20 },
  logoutText: { color: '#dc2626', fontWeight: '700' },
});
