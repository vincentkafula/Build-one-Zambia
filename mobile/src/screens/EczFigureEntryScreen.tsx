import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useAuth } from '../lib/AuthContext';
import { eczApi, candidatesApi, ElectionCategory, LevelType } from '../lib/api';

const GREEN = '#007A30';

const ROLE_TO_LEVEL: Record<string, LevelType> = {
  ward_manager: 'ward', constituency_manager: 'constituency', district_manager: 'district',
  provincial_manager: 'province', province_manager: 'province', national_manager: 'national',
  super_admin: 'national', admin: 'national', manager: 'national',
};

const CATEGORIES: { key: ElectionCategory; label: string }[] = [
  { key: 'presidential', label: 'President' },
  { key: 'parliament', label: 'Parliament' },
  { key: 'mayoral', label: 'Mayoral' },
  { key: 'councillor', label: 'Councillor' },
];

export default function EczFigureEntryScreen() {
  const { user } = useAuth();
  const [category, setCategory] = useState<ElectionCategory>('presidential');
  const [candidates, setCandidates] = useState<{ id: string; name: string; party?: string }[]>([]);
  const [figures, setFigures] = useState<Record<string, string>>({});
  const [registeredVoters, setRegisteredVoters] = useState('');
  const [rejectedBallots, setRejectedBallots] = useState('0');
  const [existing, setExisting] = useState<{ savedAt: string; status: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const levelType = ROLE_TO_LEVEL[user?.role || ''] || 'national';
  const levelId = levelType === 'national' ? 'national' : (user?.scopeId || 'national');
  const levelName = user?.scopeName || 'National';

  useEffect(() => {
    setLoading(true);
    Promise.all([
      candidatesApi.list(category, levelType === 'national' ? undefined : levelId),
      eczApi.get(levelType, levelId, category, levelName),
    ]).then(([candRes, figRes]) => {
      setCandidates(candRes.candidates);
      if (figRes.exists && figRes.figure) {
        setExisting({ savedAt: figRes.figure.savedAt, status: figRes.figure.status });
        const prefill: Record<string, string> = {};
        figRes.figure.figures.forEach(f => { prefill[f.candidateId] = String(f.votes); });
        setFigures(prefill);
        setRegisteredVoters(String(figRes.figure.registeredVoters || ''));
        setRejectedBallots(String(figRes.figure.rejectedBallots || 0));
      } else {
        setExisting(null);
        setFigures({});
      }
    }).catch(() => { setCandidates([]); setExisting(null); }).finally(() => setLoading(false));
  }, [category, levelType, levelId]);

  const totalVotes = Object.values(figures).reduce((s, v) => s + (parseInt(v, 10) || 0), 0);

  const handleSave = async () => {
    setSaving(true);
    try {
      await eczApi.save({
        levelType, levelId, levelName, electionType: category,
        figures: candidates.map(c => ({ candidateId: c.id, votes: parseInt(figures[c.id] || '0', 10) || 0 })),
        totalVotesCast: totalVotes,
        registeredVoters: parseInt(registeredVoters, 10) || 0,
        rejectedBallots: parseInt(rejectedBallots, 10) || 0,
      });
      Alert.alert('Saved', `Official ECZ figures for ${levelName} have been recorded and will be compared against BOZ-collected results.`);
      setExisting({ savedAt: new Date().toISOString(), status: 'pending' });
    } catch (e) {
      Alert.alert('Could not save', e instanceof Error ? e.message : 'Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#f9fafb' }} contentContainerStyle={{ padding: 16 }}>
      <View style={styles.hero}>
        <Text style={styles.heroTitle}>{levelName}</Text>
        <Text style={styles.heroSub}>Official ECZ Figures — {levelType.charAt(0).toUpperCase() + levelType.slice(1)} Level</Text>
      </View>

      <View style={styles.tabs}>
        {CATEGORIES.map(c => (
          <TouchableOpacity key={c.key} style={[styles.tab, category === c.key && styles.tabActive]} onPress={() => setCategory(c.key)}>
            <Text style={[styles.tabText, category === c.key && styles.tabTextActive]}>{c.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {existing && (
        <View style={styles.existingBanner}>
          <Text style={styles.existingText}>
            Figures already on file (saved {new Date(existing.savedAt).toLocaleString('en-ZM')}, status: {existing.status}). Saving again will replace them.
          </Text>
        </View>
      )}

      {loading ? (
        <ActivityIndicator color={GREEN} size="large" style={{ marginTop: 30 }} />
      ) : candidates.length === 0 ? (
        <Text style={styles.error}>No candidates found for this race at your level.</Text>
      ) : (
        <View>
          {candidates.map(c => (
            <View key={c.id} style={styles.voteRow}>
              <Text style={styles.candidateName}>{c.name}{c.party ? ` (${c.party})` : ''}</Text>
              <TextInput
                style={styles.voteInput}
                keyboardType="number-pad"
                placeholder="0"
                value={figures[c.id] || ''}
                onChangeText={t => setFigures(prev => ({ ...prev, [c.id]: t.replace(/[^0-9]/g, '') }))}
              />
            </View>
          ))}

          <Text style={styles.label}>Registered Voters</Text>
          <TextInput style={styles.input} keyboardType="number-pad" value={registeredVoters} onChangeText={setRegisteredVoters} />

          <Text style={styles.label}>Rejected Ballots</Text>
          <TextInput style={styles.input} keyboardType="number-pad" value={rejectedBallots} onChangeText={setRejectedBallots} />

          <Text style={styles.totalText}>Total votes entered: {totalVotes.toLocaleString()}</Text>

          <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={saving}>
            {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveButtonText}>{existing ? 'Update Official Figures' : 'Save Official Figures'}</Text>}
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  error: { color: '#dc2626', fontSize: 14, textAlign: 'center' },
  hero: { backgroundColor: GREEN, borderRadius: 14, padding: 18, marginBottom: 16 },
  heroTitle: { color: '#fff', fontSize: 17, fontWeight: '700' },
  heroSub: { color: 'rgba(255,255,255,0.8)', fontSize: 12, marginTop: 2 },
  tabs: { flexDirection: 'row', gap: 6, marginBottom: 12 },
  tab: { flex: 1, paddingVertical: 10, borderRadius: 8, backgroundColor: '#fff', alignItems: 'center', borderWidth: 1, borderColor: '#e5e7eb' },
  tabActive: { backgroundColor: GREEN, borderColor: GREEN },
  tabText: { fontSize: 12, fontWeight: '600', color: '#6b7280' },
  tabTextActive: { color: '#fff' },
  existingBanner: { backgroundColor: '#fffbeb', borderWidth: 1, borderColor: '#fde68a', borderRadius: 10, padding: 12, marginBottom: 12 },
  existingText: { color: '#92400e', fontSize: 12 },
  voteRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 10, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: '#f0f0f0' },
  candidateName: { flex: 1, fontSize: 14, fontWeight: '600', color: '#111827' },
  voteInput: { width: 80, borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 10, textAlign: 'center' },
  label: { fontSize: 13, fontWeight: '600', color: '#374151', marginTop: 14, marginBottom: 6 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10 },
  totalText: { marginTop: 14, fontSize: 14, fontWeight: '700', color: '#111827' },
  saveButton: { backgroundColor: GREEN, borderRadius: 10, paddingVertical: 14, alignItems: 'center', marginTop: 16 },
  saveButtonText: { color: '#fff', fontWeight: '700' },
});
