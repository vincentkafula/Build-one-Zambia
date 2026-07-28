import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, TextInput, Alert } from 'react-native';
import { coopApi, CoopCertificate, registrationApi, RegistrationRecord } from '../lib/api';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../lib/AuthContext';

const GREEN = '#007A30';

const EDIT_FIELDS: { key: string; label: string }[] = [
  { key: 'cooperativeName', label: 'Cooperative Name' },
  { key: 'contactPerson', label: 'Contact Person' },
  { key: 'contactPhone', label: 'Contact Phone' },
  { key: 'address', label: 'Address' },
];

export default function CooperativeDashboardScreen() {
  const { user, logout } = useAuth();
  const navigation = useNavigation<any>();
  const [cert, setCert] = useState<CoopCertificate | null>(null);
  const [reg, setReg] = useState<RegistrationRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [draft, setDraft] = useState<Record<string, string>>({});

  useEffect(() => {
    Promise.all([
      coopApi.certificate().catch(() => null),
      registrationApi.my('cooperative').catch(() => null),
    ]).then(([certRes, regRes]) => {
      if (certRes) setCert(certRes.certificate);
      if (regRes) setReg(regRes.registration);
      if (!certRes && !regRes) setError('Could not load your cooperative details.');
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <View style={styles.centered}><ActivityIndicator color={GREEN} size="large" /></View>;

  const startEditing = () => {
    if (!reg) return;
    const initial: Record<string, string> = {};
    EDIT_FIELDS.forEach(f => { initial[f.key] = String(reg[f.key] ?? ''); });
    setDraft(initial);
    setEditing(true);
  };

  const saveEditing = async () => {
    setSaving(true);
    try {
      const res = await registrationApi.updateMy('cooperative', draft);
      setReg(res.registration);
      setEditing(false);
      Alert.alert('Saved', 'Your cooperative\u2019s details have been updated.');
    } catch (e) {
      Alert.alert('Could not save', e instanceof Error ? e.message : 'Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#f9fafb' }} contentContainerStyle={{ padding: 16 }}>
      <View style={styles.hero}>
        <Text style={styles.heroTitle}>{cert?.cooperativeName || user?.name || 'Cooperative'}</Text>
        <Text style={styles.heroSub}>Cooperative Society</Text>
      </View>

      {reg && (
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardTitle}>Organisation Details</Text>
            {!editing && (
              <TouchableOpacity onPress={startEditing}>
                <Text style={styles.editLink}>Edit</Text>
              </TouchableOpacity>
            )}
          </View>

          {editing ? (
            <>
              {EDIT_FIELDS.map(f => (
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
                <TouchableOpacity style={[styles.editActionButton, styles.cancelButton]} onPress={() => setEditing(false)} disabled={saving}>
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.editActionButton, styles.saveButton]} onPress={saveEditing} disabled={saving}>
                  {saving ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.saveButtonText}>Save Changes</Text>}
                </TouchableOpacity>
              </View>
            </>
          ) : (
            EDIT_FIELDS.map(f => <Row key={f.key} label={f.label} value={reg[f.key] as string} />)
          )}
        </View>
      )}

      {error && !cert ? (
        <Text style={styles.error}>{error}</Text>
      ) : cert ? (
        <View style={{ marginTop: 16 }}>
          {cert.isSample && (
            <View style={styles.sampleBanner}>
              <Text style={styles.sampleText}>Preview only — no real application linked to this account.</Text>
            </View>
          )}

          <View style={styles.certCard}>
            <Text style={styles.certLabel}>REPUBLIC OF ZAMBIA</Text>
            <Text style={styles.certHeading}>Cooperative Registration Certificate</Text>

            <Row label="Certificate No" value={cert.certificateNo} />
            <Row label="Registration No" value={cert.registrationNumber} />
            <Row label="Type" value={cert.typeOfCooperative} />
            <Row label="Registered Office" value={cert.registeredOffice} />
            <Row label="Contact Person" value={`${cert.contactPerson} \u00b7 ${cert.contactPhone}`} />

            <Text style={styles.membersHeading}>REGISTERED MEMBERS ({cert.memberCount})</Text>
            {cert.members.map(m => (
              <Text key={m.membershipNumber} style={styles.memberLine}>
                {m.position}. {m.fullName || `Unknown (${m.membershipNumber})`}
              </Text>
            ))}
          </View>
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

function Row({ label, value }: { label: string; value?: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value || '\u2014'}</Text>
    </View>
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
  cardTitle: { fontSize: 13, fontWeight: '700', color: '#6b7280', letterSpacing: 0.5 },
  editLink: { color: GREEN, fontWeight: '700', fontSize: 13 },
  editInput: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8, fontSize: 13, marginTop: 4, color: '#111827' },
  editActions: { flexDirection: 'row', gap: 8, marginTop: 4 },
  editActionButton: { flex: 1, paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  cancelButton: { backgroundColor: '#f3f4f6' },
  cancelButtonText: { color: '#374151', fontWeight: '700', fontSize: 13 },
  saveButton: { backgroundColor: GREEN },
  saveButtonText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  sampleBanner: { backgroundColor: '#fffbeb', borderWidth: 1, borderColor: '#fde68a', borderRadius: 10, padding: 12, marginBottom: 12 },
  sampleText: { color: '#92400e', fontSize: 12, fontWeight: '600' },
  certCard: { backgroundColor: '#fff', borderRadius: 12, padding: 18, borderWidth: 1, borderColor: '#f0f0f0' },
  certLabel: { textAlign: 'center', color: GREEN, fontSize: 11, letterSpacing: 1, fontWeight: '700' },
  certHeading: { textAlign: 'center', fontSize: 16, fontWeight: '700', color: '#111827', marginTop: 4, marginBottom: 16 },
  row: { paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  rowLabel: { fontSize: 11, color: '#9ca3af' },
  rowValue: { fontSize: 13, fontWeight: '600', color: '#111827', marginTop: 2 },
  membersHeading: { fontSize: 11, fontWeight: '700', color: GREEN, letterSpacing: 0.5, marginTop: 16, marginBottom: 8 },
  memberLine: { fontSize: 12, color: '#374151', paddingVertical: 3 },
  logoutButton: { alignItems: 'center', paddingVertical: 14, borderRadius: 10, borderWidth: 1, borderColor: '#dc2626', marginTop: 20 },
  logoutText: { color: '#dc2626', fontWeight: '700' },
});
