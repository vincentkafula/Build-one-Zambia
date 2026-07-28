import { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, TextInput } from 'react-native';
import { useAuth } from '../lib/AuthContext';
import { verificationApi, Submission, VerificationLevel } from '../lib/api';

const GREEN = '#007A30';

const ROLE_TO_LEVEL: Record<string, VerificationLevel> = {
  ward_manager: 'ward', constituency_manager: 'constituency', district_manager: 'district',
  provincial_manager: 'province', province_manager: 'province', national_manager: 'national',
};
const LEVEL_SCOPE_FIELD: Record<VerificationLevel, string | null> = {
  ward: 'wardId', constituency: 'constituencyId', district: 'districtId', province: 'provinceId', national: null,
};
const PRIOR_LEVEL: Record<VerificationLevel, VerificationLevel | null> = {
  ward: null, constituency: 'ward', district: 'constituency', province: 'district', national: 'province',
};

export default function VerificationQueueScreen() {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});

  const isOverride = user?.role === 'super_admin' || user?.role === 'admin';
  const myLevel: VerificationLevel | null = isOverride ? 'national' : ROLE_TO_LEVEL[user?.role || ''] || null;

  const load = useCallback(() => {
    if (!myLevel) { setLoading(false); return; }
    setLoading(true);
    const filters: Record<string, string> = {};
    const scopeField = LEVEL_SCOPE_FIELD[myLevel];
    if (!isOverride && scopeField && user?.scopeId) filters[scopeField] = user.scopeId;
    verificationApi.listSubmissions(filters)
      .then(res => setSubmissions(res.submissions))
      .catch(() => setSubmissions([]))
      .finally(() => setLoading(false));
  }, [myLevel, isOverride, user?.scopeId]);

  useEffect(() => { load(); }, [load]);

  if (!myLevel) {
    return (
      <View style={styles.centered}>
        <Text style={styles.error}>Your account role isn't part of the verification chain.</Text>
      </View>
    );
  }

  const priorLevel = PRIOR_LEVEL[myLevel];
  const pending = submissions.filter(s => {
    const priorOk = !priorLevel || s.verificationChain?.[priorLevel]?.status === 'approved';
    const mineUndecided = !s.verificationChain?.[myLevel]?.status || s.verificationChain[myLevel].status === 'pending';
    return priorOk && mineUndecided;
  });

  const act = async (submissionId: string, decision: 'approved' | 'rejected' | 'queried') => {
    setActingId(submissionId);
    try {
      await verificationApi.verifyLevel(submissionId, myLevel, decision, notes[submissionId]);
      load();
    } catch (e) {
      Alert.alert('Could not update', e instanceof Error ? e.message : 'Please try again.');
    } finally {
      setActingId(null);
    }
  };

  const confirmAct = (submissionId: string, stationName: string | undefined, decision: 'approved' | 'rejected' | 'queried') => {
    Alert.alert(
      `${decision === 'approved' ? 'Approve' : decision === 'rejected' ? 'Reject' : 'Query'} this result?`,
      `${stationName || 'This station'}'s result will be ${decision} at the ${myLevel} level.`,
      [{ text: 'Cancel', style: 'cancel' }, { text: 'Confirm', onPress: () => act(submissionId, decision) }]
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#f9fafb' }}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{myLevel.charAt(0).toUpperCase() + myLevel.slice(1)}-Level Approval Queue</Text>
        <Text style={styles.headerSub}>{pending.length} awaiting your decision</Text>
      </View>

      {loading ? (
        <ActivityIndicator color={GREEN} size="large" style={{ marginTop: 30 }} />
      ) : (
        <FlatList
          data={pending}
          keyExtractor={s => s.id}
          contentContainerStyle={{ padding: 16 }}
          ListEmptyComponent={
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>Nothing waiting on your approval right now.</Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.stationName}>{item.pollingStationName || item.pollingStationId}</Text>
              <Text style={styles.stationMeta}>{item.electionType} \u00b7 {item.totalVotesCast.toLocaleString()} votes \u00b7 submitted {new Date(item.submittedAt).toLocaleDateString('en-ZM')}</Text>

              <TextInput
                style={styles.notesInput}
                placeholder="Optional notes"
                value={notes[item.id] || ''}
                onChangeText={t => setNotes(prev => ({ ...prev, [item.id]: t }))}
              />

              <View style={styles.actionRow}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.approveButton]}
                  disabled={actingId === item.id}
                  onPress={() => confirmAct(item.id, item.pollingStationName, 'approved')}
                >
                  {actingId === item.id ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.actionButtonText}>Approve</Text>}
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.queryButton]}
                  disabled={actingId === item.id}
                  onPress={() => confirmAct(item.id, item.pollingStationName, 'queried')}
                >
                  <Text style={styles.actionButtonTextDark}>Query</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.rejectButton]}
                  disabled={actingId === item.id}
                  onPress={() => confirmAct(item.id, item.pollingStationName, 'rejected')}
                >
                  <Text style={styles.actionButtonText}>Reject</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  error: { color: '#dc2626', fontSize: 14, textAlign: 'center' },
  header: { backgroundColor: GREEN, padding: 18 },
  headerTitle: { color: '#fff', fontSize: 16, fontWeight: '700' },
  headerSub: { color: 'rgba(255,255,255,0.8)', fontSize: 12, marginTop: 2 },
  emptyCard: { alignItems: 'center', paddingVertical: 40, borderWidth: 1, borderColor: '#e5e7eb', borderStyle: 'dashed', borderRadius: 12 },
  emptyText: { color: '#6b7280', fontSize: 13 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: '#f0f0f0' },
  stationName: { fontSize: 15, fontWeight: '700', color: '#111827' },
  stationMeta: { fontSize: 12, color: '#6b7280', marginTop: 2, marginBottom: 10 },
  notesInput: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8, fontSize: 13, marginBottom: 10 },
  actionRow: { flexDirection: 'row', gap: 8 },
  actionButton: { flex: 1, paddingVertical: 11, borderRadius: 8, alignItems: 'center' },
  approveButton: { backgroundColor: GREEN },
  queryButton: { backgroundColor: '#fef3c7' },
  rejectButton: { backgroundColor: '#dc2626' },
  actionButtonText: { color: '#fff', fontWeight: '700', fontSize: 12 },
  actionButtonTextDark: { color: '#92400e', fontWeight: '700', fontSize: 12 },
});
