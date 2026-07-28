import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { coopApi, CoopCertificate } from '../lib/api';
import { useAuth } from '../lib/AuthContext';

const GREEN = '#007A30';

export default function CooperativeDashboardScreen() {
  const { user, logout } = useAuth();
  const [cert, setCert] = useState<CoopCertificate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    coopApi.certificate()
      .then(res => setCert(res.certificate))
      .catch(e => setError(e instanceof Error ? e.message : 'Could not load your certificate.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <View style={styles.centered}><ActivityIndicator color={GREEN} size="large" /></View>;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#f9fafb' }} contentContainerStyle={{ padding: 16 }}>
      <View style={styles.hero}>
        <Text style={styles.heroTitle}>{cert?.cooperativeName || user?.name || 'Cooperative'}</Text>
        <Text style={styles.heroSub}>Cooperative Society</Text>
      </View>

      {error ? (
        <Text style={styles.error}>{error}</Text>
      ) : cert ? (
        <View>
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
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  error: { color: '#dc2626', fontSize: 14, textAlign: 'center', marginTop: 12 },
  hero: { backgroundColor: GREEN, borderRadius: 14, padding: 18, marginBottom: 16 },
  heroTitle: { color: '#fff', fontSize: 17, fontWeight: '700' },
  heroSub: { color: 'rgba(255,255,255,0.8)', fontSize: 12, marginTop: 2 },
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
