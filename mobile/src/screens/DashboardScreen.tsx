import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useAuth, dashboardLabelForRole } from '../lib/AuthContext';
import { accountApi, DashboardMe } from '../lib/api';

const GREEN = '#007A30';

export default function DashboardScreen() {
  const { user, logout } = useAuth();
  const [me, setMe] = useState<DashboardMe | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    accountApi.me().then(res => setMe(res.user)).catch(() => setMe(null)).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <View style={styles.centered}><ActivityIndicator color={GREEN} size="large" /></View>;
  }

  const label = dashboardLabelForRole(user?.role || '');

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#f9fafb' }} contentContainerStyle={{ padding: 16 }}>
      <View style={styles.hero}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{(me?.name || me?.username || 'U').charAt(0).toUpperCase()}</Text>
        </View>
        <Text style={styles.name}>{me?.name || me?.username}</Text>
        <Text style={styles.role}>{label}{me?.scopeName ? ` \u00b7 ${me.scopeName}` : ''}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Account</Text>
        <Row label="Username" value={me?.username} />
        <Row label="Email" value={me?.email} />
        <Row label="Phone" value={me?.phone} />
        <Row label="Role" value={me?.role} />
        <Row label="Status" value={me?.active === false ? 'Pending approval' : 'Active'} />
      </View>

      <View style={styles.notice}>
        <Text style={styles.noticeTitle}>Full {label} coming to mobile</Text>
        <Text style={styles.noticeText}>
          This first mobile release covers login, election results, and the shop. The full set of
          {'\u00a0'}{label.toLowerCase()} sections available on the website (data entry, voter validation,
          certificates, and more depending on your role) will follow in a later update.
        </Text>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <Text style={styles.logoutText}>Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function Row({ label, value }: { label: string; value?: string | null }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value || '\u2014'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  hero: { alignItems: 'center', backgroundColor: GREEN, borderRadius: 16, padding: 24, marginBottom: 16 },
  avatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  avatarText: { color: '#fff', fontSize: 22, fontWeight: '700' },
  name: { color: '#fff', fontSize: 18, fontWeight: '700' },
  role: { color: 'rgba(255,255,255,0.8)', fontSize: 13, marginTop: 4 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#f0f0f0', marginBottom: 16 },
  cardTitle: { fontSize: 13, fontWeight: '700', color: '#6b7280', marginBottom: 10, letterSpacing: 0.5 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  rowLabel: { color: '#6b7280', fontSize: 13 },
  rowValue: { color: '#111827', fontSize: 13, fontWeight: '600' },
  notice: { backgroundColor: '#fffbeb', borderWidth: 1, borderColor: '#fde68a', borderRadius: 12, padding: 14, marginBottom: 16 },
  noticeTitle: { fontWeight: '700', color: '#92400e', marginBottom: 4, fontSize: 13 },
  noticeText: { color: '#92400e', fontSize: 12, lineHeight: 18 },
  logoutButton: { alignItems: 'center', paddingVertical: 14, borderRadius: 10, borderWidth: 1, borderColor: '#dc2626' },
  logoutText: { color: '#dc2626', fontWeight: '700' },
});
