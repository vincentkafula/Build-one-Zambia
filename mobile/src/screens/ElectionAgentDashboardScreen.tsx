import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TextInput, TouchableOpacity, Alert, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../lib/AuthContext';
import { dataEntryApi, candidatesApi, ElectionCategory, DocumentPayload } from '../lib/api';

const GREEN = '#007A30';

const CATEGORIES: { key: ElectionCategory; label: string }[] = [
  { key: 'presidential', label: 'President' },
  { key: 'parliament', label: 'Parliament' },
  { key: 'mayoral', label: 'Mayoral' },
  { key: 'councillor', label: 'Councillor' },
];

interface PickedPhoto {
  id: string;
  uri: string;
  base64: string;
  mimeType: string;
  sizeBytes: number;
}

export default function ElectionAgentDashboardScreen() {
  const { user, logout } = useAuth();
  const navigation = useNavigation<any>();
  const [category, setCategory] = useState<ElectionCategory>('presidential');
  const [candidates, setCandidates] = useState<{ id: string; name: string; party?: string }[]>([]);
  const [votes, setVotes] = useState<Record<string, string>>({});
  const [registeredVoters, setRegisteredVoters] = useState('');
  const [rejectedBallots, setRejectedBallots] = useState('0');
  const [photos, setPhotos] = useState<PickedPhoto[]>([]);
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
      setPhotos([]);
    }).catch(() => {
      setCandidates([]);
      setLockStatus(null);
    }).finally(() => setLoading(false));
  }, [category, stationId]);

  const totalVotes = Object.values(votes).reduce((s, v) => s + (parseInt(v, 10) || 0), 0);

  // Matches the website's Data Entry page exactly — a photo of the signed
  // ECZ result sheet is required before submission is even attempted, not
  // just a nice-to-have. The backend now enforces this server-side too
  // (see /data-entry/result), so this isn't just a client-side courtesy.
  const addPhoto = async (fromCamera: boolean) => {
    const permission = fromCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', fromCamera ? 'Camera access is required to photograph the result sheet.' : 'Photo library access is required to attach a result sheet image.');
      return;
    }
    const result = fromCamera
      ? await ImagePicker.launchCameraAsync({ base64: true, quality: 0.6 })
      : await ImagePicker.launchImageLibraryAsync({ base64: true, quality: 0.6 });
    if (result.canceled || !result.assets?.[0]?.base64) return;
    const asset = result.assets[0];
    setPhotos(prev => [...prev, {
      id: `doc-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      uri: asset.uri,
      base64: asset.base64!,
      mimeType: asset.mimeType || 'image/jpeg',
      sizeBytes: asset.fileSize || 0,
    }]);
  };

  const removePhoto = (id: string) => setPhotos(prev => prev.filter(p => p.id !== id));

  const handleSubmit = async () => {
    if (lockStatus?.submitted && lockStatus.locked) {
      Alert.alert('Locked', 'This result is already submitted and locked. Ask a super admin to unlock it if it needs correcting.');
      return;
    }
    if (photos.length === 0) {
      Alert.alert('Photo required', 'You must attach at least one photo of the official signed vote sheet before submitting.');
      return;
    }
    const regVoters = parseInt(registeredVoters, 10) || 0;
    if (regVoters > 0 && totalVotes > regVoters) {
      Alert.alert('Check your figures', `Total votes (${totalVotes}) cannot exceed registered voters (${regVoters}) for this station.`);
      return;
    }
    setSubmitting(true);
    try {
      const documents: DocumentPayload[] = photos.map(p => ({
        id: p.id,
        fileName: `${p.id}.jpg`,
        mimeType: p.mimeType,
        sizeBytes: p.sizeBytes,
        base64: `data:${p.mimeType};base64,${p.base64}`,
        uploadedAt: new Date().toISOString(),
      }));
      await dataEntryApi.submitResult({
        pollingStationId: stationId,
        pollingStationName: stationName,
        electionType: category,
        candidates: candidates.map(c => ({ candidateId: c.id, votes: parseInt(votes[c.id] || '0', 10) || 0 })),
        registeredVoters: regVoters,
        rejectedBallots: parseInt(rejectedBallots, 10) || 0,
        documents,
      });
      Alert.alert('Submitted', 'Your results and photo evidence have been submitted, and the station is now locked.');
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

          <Text style={styles.label}>Photo of Signed Result Sheet (required)</Text>
          {photos.length > 0 && (
            <View style={styles.photoRow}>
              {photos.map(p => (
                <View key={p.id} style={styles.photoThumbWrap}>
                  <Image source={{ uri: p.uri }} style={styles.photoThumb} />
                  <TouchableOpacity style={styles.photoRemove} onPress={() => removePhoto(p.id)}>
                    <Text style={styles.photoRemoveText}>\u2715</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
          <View style={styles.photoButtonsRow}>
            <TouchableOpacity style={styles.photoButton} onPress={() => addPhoto(true)}>
              <Text style={styles.photoButtonText}>Take Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.photoButton} onPress={() => addPhoto(false)}>
              <Text style={styles.photoButtonText}>Choose from Library</Text>
            </TouchableOpacity>
          </View>
          {photos.length === 0 && (
            <Text style={styles.photoWarning}>\u26a0\ufe0f You cannot submit without at least one photo of the official signed vote sheet.</Text>
          )}

          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={submitting}>
            {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitButtonText}>Submit Results</Text>}
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.navigate('VoterValidation')}>
        <Text style={styles.secondaryButtonText}>Voter Validation</Text>
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

const styles = StyleSheet.create({
  secondaryButton: { alignItems: 'center', paddingVertical: 14, borderRadius: 10, borderWidth: 1, borderColor: '#007A30', marginTop: 12 },
  secondaryButtonText: { color: '#007A30', fontWeight: '700' },
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
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10 },
  totalText: { marginTop: 14, fontSize: 14, fontWeight: '700', color: '#111827' },
  photoRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  photoThumbWrap: { position: 'relative' },
  photoThumb: { width: 72, height: 72, borderRadius: 8, backgroundColor: '#e5e7eb' },
  photoRemove: { position: 'absolute', top: -6, right: -6, width: 20, height: 20, borderRadius: 10, backgroundColor: '#dc2626', alignItems: 'center', justifyContent: 'center' },
  photoRemoveText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  photoButtonsRow: { flexDirection: 'row', gap: 8 },
  photoButton: { flex: 1, paddingVertical: 12, borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: GREEN },
  photoButtonText: { color: GREEN, fontWeight: '700', fontSize: 12 },
  photoWarning: { color: '#b45309', fontSize: 12, marginTop: 8 },
  submitButton: { backgroundColor: GREEN, borderRadius: 10, paddingVertical: 14, alignItems: 'center', marginTop: 16 },
  submitButtonText: { color: '#fff', fontWeight: '700' },
  logoutButton: { alignItems: 'center', paddingVertical: 14, borderRadius: 10, borderWidth: 1, borderColor: '#dc2626', marginTop: 20 },
  logoutText: { color: '#dc2626', fontWeight: '700' },
});
