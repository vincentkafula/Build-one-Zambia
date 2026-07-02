import { initializeApp, getApps } from 'firebase/app';
import {
  getAuth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  type ConfirmationResult,
} from 'firebase/auth';
import { getApiBase } from './apiBase';

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY             || 'AIzaSyCj6hSk9FcZjX9rYNK7SX96QT9BoNBXxcs',
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN         || 'build-one-zambia.firebaseapp.com',
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID          || 'build-one-zambia',
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET      || 'build-one-zambia.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '681107002005',
  appId:             import.meta.env.VITE_FIREBASE_APP_ID              || '1:681107002005:web:adf250c234ccf2841c819c',
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);

export function isFirebaseConfigured(): boolean {
  try {
    const cfg = auth.app.options;
    return !!(cfg.apiKey && !cfg.apiKey.startsWith('YOUR_'));
  } catch {
    return false;
  }
}

// ── reCAPTCHA ─────────────────────────────────────────────────────────────────
let _verifier: RecaptchaVerifier | null = null;

export function clearRecaptcha() {
  try { _verifier?.clear(); } catch {}
  _verifier = null;
}

// ── Backend OTP (primary method — works without Firebase Phone Auth) ───────────
// Sends a 6-digit code via backend → Resend email or logs to console in dev
export async function sendBackendOTP(
  contact: string, // phone number or email
): Promise<{ success: boolean; otp?: string; error?: string }> {
  try {
    const isEmail = contact.includes('@');
    const body = isEmail ? { email: contact } : { phone: contact };
    const res = await fetch(`${getApiBase()}/otp/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) return { success: false, error: data.error || 'Failed to send OTP' };
    // In dev mode, backend returns the OTP directly
    return { success: true, otp: data.otp };
  } catch {
    return { success: false, error: 'Could not reach server. Please check your connection.' };
  }
}

export async function verifyBackendOTP(
  contact: string,
  code: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const isEmail = contact.includes('@');
    const body = isEmail ? { email: contact, otp: code } : { phone: contact, otp: code };
    const res = await fetch(`${getApiBase()}/otp/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok || !data.verified) return { success: false, error: data.error || 'Invalid code' };
    return { success: true };
  } catch {
    return { success: false, error: 'Could not reach server. Please check your connection.' };
  }
}

// ── Firebase Phone OTP (secondary — requires Firebase Phone Auth + reCAPTCHA) ─
export async function sendFirebaseOTP(
  phoneNumber: string,
  container: HTMLElement | string = 'recaptcha-container',
): Promise<{ success: boolean; confirmationResult?: ConfirmationResult; error?: string }> {
  try {
    clearRecaptcha();
    _verifier = new RecaptchaVerifier(auth, container, {
      size: 'invisible',
      callback: () => {},
      'expired-callback': () => { clearRecaptcha(); },
    });
    await _verifier.render();
    const result = await signInWithPhoneNumber(auth, phoneNumber, _verifier);
    return { success: true, confirmationResult: result };
  } catch (err: any) {
    clearRecaptcha();
    const code = err?.code || '';
    const msg =
      code === 'auth/invalid-phone-number'  ? 'Invalid phone number. Use format: +260XXXXXXXXX' :
      code === 'auth/too-many-requests'      ? 'Too many attempts. Please wait a few minutes and try again.' :
      code === 'auth/quota-exceeded'         ? 'SMS quota reached. Please try again later.' :
      code === 'auth/operation-not-allowed'  ? 'Phone Auth not enabled in Firebase Console.' :
      code === 'auth/unauthorized-domain'    ? 'Domain not authorized in Firebase.' :
      'Firebase OTP failed. Using backup method.';
    return { success: false, error: msg };
  }
}

export async function verifyFirebaseOTP(
  confirmationResult: ConfirmationResult,
  code: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    await confirmationResult.confirm(code);
    return { success: true };
  } catch (err: any) {
    const c = err?.code || '';
    const msg =
      c === 'auth/invalid-verification-code' ? 'Incorrect code. Please try again.' :
      c === 'auth/code-expired'              ? 'Code expired. Please request a new one.' :
      'Verification failed. Please try again.';
    return { success: false, error: msg };
  }
}
