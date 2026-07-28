import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { useAuth } from '../lib/AuthContext';

const GREEN = '#007A30';

export default function LoginScreen() {
  const { login, error, loading } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState('');

  const handleLogin = async () => {
    setLocalError('');
    if (!username.trim() || !password) {
      setLocalError('Please enter your email/username and password.');
      return;
    }
    setSubmitting(true);
    await login(username.trim(), password);
    setSubmitting(false);
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={GREEN} size="large" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
      <View style={styles.header}>
        <Image source={require('../../assets/icon.png')} style={styles.logo} resizeMode="contain" />
        <Text style={styles.title}>BOZ Portal</Text>
        <Text style={styles.subtitle}>Sign in to access your dashboard</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Email or Username</Text>
        <TextInput
          style={styles.input}
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
          autoCorrect={false}
          placeholder="youremail@example.com or username"
        />

        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder="Enter your password"
        />

        {(error || localError) ? <Text style={styles.error}>{error || localError}</Text> : null}

        <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={submitting}>
          {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Sign In</Text>}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 24, justifyContent: 'center' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: 32 },
  logo: { width: 72, height: 72, marginBottom: 12 },
  title: { fontSize: 26, fontWeight: '700', color: GREEN },
  subtitle: { fontSize: 14, color: '#6b7280', marginTop: 4 },
  form: { gap: 4 },
  label: { fontSize: 13, fontWeight: '600', color: '#374151', marginTop: 12, marginBottom: 6 },
  input: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15 },
  error: { color: '#dc2626', fontSize: 13, marginTop: 12 },
  button: { backgroundColor: GREEN, borderRadius: 10, paddingVertical: 15, alignItems: 'center', marginTop: 24 },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
