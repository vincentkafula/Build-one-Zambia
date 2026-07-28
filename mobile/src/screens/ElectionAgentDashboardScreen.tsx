import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useAuth } from '../lib/AuthContext';
import { dataEntryApi, candidatesApi, ElectionCategory } from '../lib/api';

const GREEN = '#007A30';

const CATEGORIES: { key: ElectionCategory; label: string }[] = [
  { key: 'presidential', label: 'President' },
  { key: 'parliament', label: 'Parliament' },
  { key: 'mayoral', label: 'Mayoral' },
  { key: 'councillor', label: 'Councillor' },
];

export default function ElectionAgentDashboardScreen() {
  const { user, logout } = useAuth();
  const [category, setCategory] = useState<ElectionCategory>('presidential');
  const [candidates, setCandidates] = useState<{ id: string; name: string; party?: string }[]>([]);
  const [votes, setVotes] = useState<Record<string, string>>({});
  const [registeredVoters, setRegisteredVoters] = useState('');
  const [rejectedBallots, setRejectedBallots] = useState('0');
  const [lockStatus, setLockStatus] = useState<{ submitted: boolean; locked: boolean; submittedAt?: string; status?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const stationId = user?.pollingStationId || user?.scopeId || '';
  const stationName = user?.pollingStationName || user?.scopeName || 'Not assigned';

  useEffect(() => {
    if (!stationId) { setLoading(false); return; }
    setLoading(true);
    Promise.all([
      candidatesApi.list(category, stationId),
      dataEntryApi.checkSubmission(stationId, category),
    ]).then(([candRes, statusRes]) => {
      setCandidates(candRes.candidates);
      setLockStatus({ submitted: statusRes.submitted, locked: statusRes.locked !== false, submittedAt: statusRes.submittedAt, status: statusRes.status });
      setVotes({});
    }).catch(() => {
      setCandidates([]);
      setLockStatus(null);
    }).finally(() => setLoading(false));
  }, [category, stationId]);

  const totalVotes = Object.values(votes).reduce((s, v) => s + (parseInt(v, 10) || 0), 0);

  const handleSubmit = async () => {
    if (lockStatus?.submitted && lockStatus.locked) {
      Alert.alert('Locked', 'This result is already submitted and locked. Ask a super admin to unlock it if it needs correcting.');
      return;
    }
    const regVoters = parseInt(registeredVoters, 10) || 0;
    if (regVoters > 0 && totalVotes > regVoters) {
      Alert.alert('Check your figures', `Total votes (${totalVotes}) cannot exceed registered voters (${regVoters}) for this station.`);
      return;
    }
    setSubmitting(true);
    try {
      await dataEntryApi.submitResult({
        pollingStationId: stationId,
        pollingStationName: stationName,
        electionType: category,
        candidates: candidates.map(c => ({ candidateId: c.id, votes: parseInt(votes[c.id] || '0', 10) || 0 })),
        registeredVoters: regVoters,
        rejectedBallots: parseInt(rejectedBallots, 10) || 0,
      });
      Alert.alert('Submitted', 'Your results have been submitted and the station is now locked.');
      setLockStatus({ submitted: true, locked: true });
    } catch (e) {
      Alert.alert('Submission failed', e instanceof Error ? e.message : 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!stationId) {
    return (
      <View style={styles.centered}>
        <Text style={styles.error}>Your account isn\u2019t assigned to a polling station yet. Contact an administrator.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#f9fafb' }} contentContainerStyle={{ padding: 16 }}>
      <View style={styles.hero}>
        <Text style={styles.heroTitle}>{stationName}</Text>
        <Text style={styles.heroSub}>Polling Station Agent</Text>
      </View>

      <View style={styles.tabs}>
        {CATEGORIES.map(c => (
          <TouchableOpacity key={c.key} style={[styles.tab, category === c.key && styles.tabActive]} onPress={() => setCategory(c.key)}>
            <Text style={[styles.tabText, category === c.key && styles.tabTextActive]}>{c.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator color={GREEN} size="large" style={{ marginTop: 30 }} />
      ) : lockStatus?.submitted && lockStatus.locked ? (
        <View style={styles.lockedCard}>
          <Text style={styles.lockedTitle}>Result Locked</Text>
          <Text style={styles.lockedText}>
            A result for {category} was already submitted{lockStatus.submittedAt ? ` on ${new Date(lockStatus.submittedAt).toLocaleString('en-ZM')}` : ''}.
            It cannot be resubmitted or edited until a super admin unlocks it.
          </Text>
        </View>
      ) : candidates.length === 0 ? (
        <Text style={styles.error}>No candidates found for this race at your station.</Text>
      ) : (
        <View>
          {candidates.map(c => (
            <View key={c.id} style={styles.voteRow}>
              <Text style={styles.candidateName}>{c.name}{c.party ? ` (${c.party})` : ''}</Text>
              <TextInput
                style={styles.voteInput}
                keyboardType="number-pad"
                placeholder="0"
                value={votes[c.id] || ''}
                onChangeText={t => setVotes(prev => ({ ...prev, [c.id]: t.replace(/[^0-9]/g, '') }))}
              />
            </View>
          ))}

          <Text style={styles.label}>Registered Voters at this Station</Text>
          <TextInput style={styles.input} keyboardType="number-pad" value={registeredVoters} onChangeText={setRegisteredVoters} placeholder="e.g. 850" />

          <Text style={styles.label}>Rejected Ballots</Text>
          <TextInput style={styles.input} keyboardType="number-pad" value={rejectedBallots} onChangeText={setRejectedBallots} />

          <Text style={styles.totalText}>Total votes entered: {totalVotes.toLocaleString()}</Text>

          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={submitting}>
            {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitButtonText}>Submit Results</Text>}
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <Text style={styles.logoutText}>Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  error: { color: '#dc2626', fontSize: 14, textAlign: 'center' },
  hero: { backgroundColor: GREEN, borderRadius: 14, padding: 18, marginBottom: 16 },
  heroTitle: { color: '#fff', fontSize: 17, fontWeight: '700' },
  heroSub: { color: 'rgba(255,255,255,0.8)', fontSize: 12, marginTop: 2 },
  tabs: { flexDirection: 'row', gap: 6, marginBottom: 16 },
  tab: { flex: 1, paddingVertical: 10, borderRadius: 8, backgroundColor: '#fff', alignItems: 'center', borderWidth: 1, borderColor: '#e5e7eb' },
  tabActive: { backgroundColor: GREEN, borderColor: GREEN },
  tabText: { fontSize: 12, fontWeight: '600', color: '#6b7280' },
  tabTextActive: { color: '#fff' },
  lockedCard: { backgroundColor: '#fef2f2', borderWidth: 1, borderColor: '#fca5a5', borderRadius: 12, padding: 16 },
  lockedTitle: { color: '#991b1b', fontWeight: '700', marginBottom: 6 },
  lockedText: { color: '#991b1b', fontSize: 13, lineHeight: 19 },
  voteRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 10, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: '#f0f0f0' },
  candidateName: { flex: 1, fontSize: 14, fontWeight: '600', color: '#111827' },
  voteInput: { width: 80, borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 10, textAlign: 'center' },
  label: { fontSize: 13, fontWeight: '600', color: '#374151', marginTop: 14, marginBottom: 6 },
  input: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10 },
  totalText: { marginTop: 14, fontSize: 14, fontWeight: '700', color: '#111827' },
  submitButton: { backgroundColor: GREEN, borderRadius: 10, paddingVertical: 14, alignItems: 'center', marginTop: 16 },
  submitButtonText: { color: '#fff', fontWeight: '700' },
  logoutButton: { alignItems: 'center', paddingVertical: 14, borderRadius: 10, borderWidth: 1, borderColor: '#dc2626', marginTop: 20 },
  logoutText: { color: '#dc2626', fontWeight: '700' },
});
