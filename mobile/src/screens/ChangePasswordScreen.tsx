import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { accountApi } from '../lib/api';

const GREEN = '#007A30';

export default function ChangePasswordScreen({ navigation }: { navigation?: { goBack: () => void } }) {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!current || !next || !confirm) {
      Alert.alert('Missing fields', 'Please fill in your current password and a new password.');
      return;
    }
    if (next.length < 8) {
      Alert.alert('Password too short', 'Your new password must be at least 8 characters.');
      return;
    }
    if (next !== confirm) {
      Alert.alert('Passwords don\u2019t match', 'Please re-enter your new password to confirm it.');
      return;
    }
    setSubmitting(true);
    try {
      await accountApi.changePassword(current, next);
      Alert.alert('Password updated', 'Your password has been changed.', [
        { text: 'OK', onPress: () => navigation?.goBack() },
      ]);
      setCurrent(''); setNext(''); setConfirm('');
    } catch (e) {
      Alert.alert('Could not update password', e instanceof Error ? e.message : 'Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Current Password</Text>
      <TextInput style={styles.input} secureTextEntry value={current} onChangeText={setCurrent} />

      <Text style={styles.label}>New Password</Text>
      <TextInput style={styles.input} secureTextEntry value={next} onChangeText={setNext} placeholder="At least 8 characters" />

      <Text style={styles.label}>Confirm New Password</Text>
      <TextInput style={styles.input} secureTextEntry value={confirm} onChangeText={setConfirm} />

      <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={submitting}>
        {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Update Password</Text>}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb', padding: 20 },
  label: { fontSize: 13, fontWeight: '600', color: '#374151', marginTop: 14, marginBottom: 6 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#d1d5db', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15 },
  button: { backgroundColor: GREEN, borderRadius: 10, paddingVertical: 15, alignItems: 'center', marginTop: 24 },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
