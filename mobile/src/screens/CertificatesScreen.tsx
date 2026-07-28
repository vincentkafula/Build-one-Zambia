import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { certificateApi, CertificateInfo } from '../lib/api';

const GREEN = '#007A30';
const ORANGE = '#EC6D01';

type CertType = 'adoption' | 'appointment';

export default function CertificatesScreen({ route }: { route: { params?: { email?: string } } }) {
  const email = route.params?.email || '';
  const [type, setType] = useState<CertType>('adoption');
  const [cert, setCert] = useState<CertificateInfo | null>(null);
  const [notEligible, setNotEligible] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!email) { setLoading(false); return; }
    setLoading(true);
    setNotEligible('');
    setCert(null);
    certificateApi.get(type, email)
      .then(res => setCert(res))
      .catch(e => setNotEligible(e instanceof Error ? e.message : 'Not available.'))
      .finally(() => setLoading(false));
  }, [type, email]);

  return (
    <View style={{ flex: 1, backgroundColor: '#f9fafb' }}>
      <View style={styles.tabs}>
        <TouchableOpacity style={[styles.tab, type === 'adoption' && styles.tabActive]} onPress={() => setType('adoption')}>
          <Text style={[styles.tabText, type === 'adoption' && styles.tabTextActive]}>Adoption Certificate</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, type === 'appointment' && styles.tabActive]} onPress={() => setType('appointment')}>
          <Text style={[styles.tabText, type === 'appointment' && styles.tabTextActive]}>Appointment Certificate</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {loading ? (
          <ActivityIndicator color={GREEN} size="large" style={{ marginTop: 30 }} />
        ) : notEligible ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>Not Available</Text>
            <Text style={styles.emptyText}>{notEligible}</Text>
          </View>
        ) : cert ? (
          <View style={styles.card}>
            <View style={styles.cardTopBar}>
              <Text style={styles.cardBrand}>BUILD ONE ZAMBIA</Text>
              <Text style={styles.cardBrandSub}>{type === 'adoption' ? 'CERTIFICATE OF ADOPTION' : 'CERTIFICATE OF APPOINTMENT'}</Text>
            </View>
            <View style={styles.cardBody}>
              <Text style={styles.cardName}>{cert.fullName}</Text>
              {type === 'adoption' ? (
                <>
                  <Row label="Certificate No." value={cert.adoptionCertNumber} />
                  <Row label="Position" value={cert.electionPosition} />
                  <Row label="Election Year" value={cert.electionYear} />
                  <Row label="Ward" value={cert.adoptionWard} />
                  <Row label="Constituency" value={cert.adoptionConstituency} />
                  <Row label="District" value={cert.adoptionDistrict} />
                  <Row label="Province" value={cert.adoptionProvince} />
                  <Row label="Granted By" value={`${cert.adoptionGrantedBy || ''}${cert.adoptionGrantedByTitle ? `, ${cert.adoptionGrantedByTitle}` : ''}`} />
                  <Row label="Reason" value={cert.adoptionReason} />
                </>
              ) : (
                <>
                  <Row label="Certificate No." value={cert.appointmentNumber} />
                  <Row label="Position" value={cert.appointmentPosition} />
                  <Row label="Level" value={cert.appointmentLevel} />
                  <Row label="Term" value={cert.appointmentTermYears ? `${cert.appointmentTermYears} years` : undefined} />
                  <Row label="Effective Date" value={cert.appointmentEffectiveDate} />
                  <Row label="Ward" value={cert.appointmentWard} />
                  <Row label="Constituency" value={cert.appointmentConstituency} />
                  <Row label="District" value={cert.appointmentDistrict} />
                  <Row label="Province" value={cert.appointmentProvince} />
                  <Row label="Granted By" value={`${cert.appointmentGrantedBy || ''}${cert.appointmentGrantedByTitle ? `, ${cert.appointmentGrantedByTitle}` : ''}`} />
                </>
              )}
              <Row label="Issued" value={cert.issuedAt ? new Date(cert.issuedAt).toLocaleDateString('en-ZM') : undefined} />
            </View>
            <View style={styles.cardBottomBar} />
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

function Row({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tabs: { flexDirection: 'row', backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  tab: { flex: 1, paddingVertical: 14, alignItems: 'center' },
  tabActive: { borderBottomWidth: 2, borderBottomColor: GREEN },
  tabText: { fontSize: 12, fontWeight: '600', color: '#6b7280' },
  tabTextActive: { color: GREEN },
  emptyCard: { alignItems: 'center', paddingVertical: 40, borderWidth: 1, borderColor: '#e5e7eb', borderStyle: 'dashed', borderRadius: 12 },
  emptyTitle: { fontWeight: '700', color: '#111827', marginBottom: 4 },
  emptyText: { color: '#6b7280', fontSize: 13, textAlign: 'center', paddingHorizontal: 24 },
  card: { borderRadius: 16, overflow: 'hidden', backgroundColor: '#fff', shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 5 },
  cardTopBar: { backgroundColor: GREEN, paddingVertical: 12, paddingHorizontal: 18 },
  cardBrand: { color: '#fff', fontWeight: '700', fontSize: 14, letterSpacing: 0.5 },
  cardBrandSub: { color: 'rgba(255,255,255,0.8)', fontSize: 10, letterSpacing: 1, marginTop: 2 },
  cardBody: { padding: 18 },
  cardName: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 10 },
  cardBottomBar: { height: 6, backgroundColor: ORANGE },
  row: { paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  rowLabel: { fontSize: 10, color: '#9ca3af', letterSpacing: 0.5 },
  rowValue: { fontSize: 13, fontWeight: '600', color: '#111827', marginTop: 2 },
});
