import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, TextInput, Alert } from 'react-native';
import { membershipApi, MemberProfile } from '../lib/api';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../lib/AuthContext';

const GREEN = '#007A30';
const ORANGE = '#EC6D01';

const EDIT_FIELDS: { key: keyof MemberProfile; label: string }[] = [
  { key: 'firstName', label: 'First Name' },
  { key: 'lastName', label: 'Last Name' },
  { key: 'email', label: 'Email' },
  { key: 'phone', label: 'Phone' },
  { key: 'dob', label: 'Date of Birth' },
  { key: 'gender', label: 'Gender' },
  { key: 'nationalId', label: 'National ID' },
  { key: 'province', label: 'Province' },
  { key: 'district', label: 'District' },
  { key: 'constituency', label: 'Constituency' },
  { key: 'ward', label: 'Ward' },
  { key: 'pollingStation', label: 'Polling Station' },
];

export default function MemberDashboardScreen() {
  const { logout } = useAuth();
  const navigation = useNavigation<any>();
  const [member, setMember] = useState<MemberProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [draft, setDraft] = useState<Record<string, string>>({});

  useEffect(() => {
    membershipApi.myProfile()
      .then(res => setMember(res.member))
      .catch(e => setError(e instanceof Error ? e.message : 'Could not load your membership profile.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <View style={styles.centered}><ActivityIndicator color={GREEN} size="large" /></View>;
  }

  if (error || !member) {
    return (
      <View style={styles.centered}>
        <Text style={styles.error}>{error || 'No membership profile linked to this account.'}</Text>
      </View>
    );
  }

  const memberSince = new Date(member.createdAt).toLocaleDateString('en-ZM', { day: 'numeric', month: 'long', year: 'numeric' });

  const startEditing = () => {
    const initial: Record<string, string> = {};
    EDIT_FIELDS.forEach(f => { initial[f.key] = String(member[f.key] ?? ''); });
    setDraft(initial);
    setEditing(true);
  };

  const saveEditing = async () => {
    setSaving(true);
    try {
      const res = await membershipApi.updateMyProfile(draft);
      setMember(res.member);
      setEditing(false);
      Alert.alert('Saved', 'Your profile has been updated.');
    } catch (e) {
      Alert.alert('Could not save', e instanceof Error ? e.message : 'Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#f9fafb' }} contentContainerStyle={{ padding: 16 }}>
      {/* Membership card visual — mirrors the website's membership card */}
      <View style={styles.card}>
        <View style={styles.cardTopBar}>
          <Text style={styles.cardBrand}>BUILD ONE ZAMBIA</Text>
          <Text style={styles.cardBrandSub}>MEMBERSHIP CARD</Text>
        </View>
        <View style={styles.cardBody}>
          <Text style={styles.cardLabel}>MEMBER NAME</Text>
          <Text style={styles.cardName}>{member.firstName} {member.lastName}</Text>

          <View style={styles.cardRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardLabel}>MEMBERSHIP ID</Text>
              <Text style={styles.cardValue}>{member.membershipNumber || 'Pending'}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardLabel}>TYPE</Text>
              <Text style={styles.cardValue}>{(member.tier || 'standard').toUpperCase()}</Text>
            </View>
          </View>
          <Text style={styles.cardLabel}>MEMBER SINCE</Text>
          <Text style={styles.cardValue}>{memberSince}</Text>
        </View>
        <View style={styles.cardBottomBar} />
      </View>

      <View style={styles.infoCard}>
        <View style={styles.infoHeaderRow}>
          <Text style={styles.infoTitle}>Personal Details</Text>
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
                <Text style={styles.infoLabel}>{f.label}</Text>
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
          EDIT_FIELDS.map(f => <InfoRow key={f.key} label={f.label} value={member[f.key] as string} />)
        )}
      </View>

      <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.navigate('Certificates', { email: member.email })}>
        <Text style={styles.secondaryButtonText}>Adoption &amp; Appointment Certificates</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.navigate('OrderHistory')}>
        <Text style={styles.secondaryButtonText}>My Orders</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.navigate('ChangePassword')}>
        <Text style={styles.secondaryButtonText}>Change Password</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <Text style={styles.logoutText}>Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value || '\u2014'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  secondaryButton: { alignItems: 'center', paddingVertical: 14, borderRadius: 10, borderWidth: 1, borderColor: '#007A30', marginTop: 12 },
  secondaryButtonText: { color: '#007A30', fontWeight: '700' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  error: { color: '#dc2626', fontSize: 14, textAlign: 'center' },
  card: { borderRadius: 16, overflow: 'hidden', backgroundColor: '#fff', marginBottom: 20, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 5 },
  cardTopBar: { backgroundColor: GREEN, paddingVertical: 12, paddingHorizontal: 18 },
  cardBrand: { color: '#fff', fontWeight: '700', fontSize: 15, letterSpacing: 0.5 },
  cardBrandSub: { color: 'rgba(255,255,255,0.8)', fontSize: 10, letterSpacing: 1, marginTop: 2 },
  cardBody: { padding: 18 },
  cardLabel: { fontSize: 10, color: '#9ca3af', letterSpacing: 0.5, marginTop: 10 },
  cardName: { fontSize: 20, fontWeight: '700', color: '#111827', marginTop: 2 },
  cardValue: { fontSize: 14, fontWeight: '600', color: '#111827', marginTop: 2 },
  cardRow: { flexDirection: 'row', marginTop: 4 },
  cardBottomBar: { height: 6, backgroundColor: ORANGE },
  infoCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#f0f0f0', marginBottom: 16 },
  infoHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  infoTitle: { fontSize: 13, fontWeight: '700', color: '#6b7280', letterSpacing: 0.5 },
  editLink: { color: GREEN, fontWeight: '700', fontSize: 13 },
  editInput: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8, fontSize: 13, marginTop: 4, color: '#111827' },
  editActions: { flexDirection: 'row', gap: 8, marginTop: 4 },
  editActionButton: { flex: 1, paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  cancelButton: { backgroundColor: '#f3f4f6' },
  cancelButtonText: { color: '#374151', fontWeight: '700', fontSize: 13 },
  saveButton: { backgroundColor: GREEN },
  saveButtonText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  infoLabel: { color: '#6b7280', fontSize: 13 },
  infoValue: { color: '#111827', fontSize: 13, fontWeight: '600' },
  logoutButton: { alignItems: 'center', paddingVertical: 14, borderRadius: 10, borderWidth: 1, borderColor: '#dc2626' },
  logoutText: { color: '#dc2626', fontWeight: '700' },
});
