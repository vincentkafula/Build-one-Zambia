import { initializeApp, getApps } from 'firebase/app';
import {
  getAuth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  type ConfirmationResult,
} from 'firebase/auth';

// ─────────────────────────────────────────────────────────────────────────────
// STEP 1 — Paste your Firebase config here (or use env vars).
// Firebase Console → Project Settings → Your Apps → Web App → Config
//
// STEP 2 — Enable Phone Auth:
// Firebase Console → Authentication → Sign-in method → Phone → Enable
//
// STEP 3 — Add your domain to Authorised domains:
// Firebase Console → Authentication → Settings → Authorised domains → Add domain
// ─────────────────────────────────────────────────────────────────────────────
const firebaseConfig = {
  apiKey:            'AIzaSyCj6hSk9FcZjX9rYNK7SX96QT9BoNBXxcs',
  authDomain:        'build-one-zambia.firebaseapp.com',
  projectId:         'build-one-zambia',
  storageBucket:     'build-one-zambia.firebasestorage.app',
  messagingSenderId: '681107002005',
  appId:             '1:681107002005:web:adf250c234ccf2841c819c',
  measurementId:     'G-TP99TZBNFK',
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);

// ── reCAPTCHA — invisible, required by Firebase before sending SMS ────────────
let recaptchaVerifier: RecaptchaVerifier | null = null;

export function setupRecaptcha(containerId: string): RecaptchaVerifier {
  if (recaptchaVerifier) {
    try { recaptchaVerifier.clear(); } catch {}
    recaptchaVerifier = null;
  }
  recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
    size: 'invisible',
    callback: () => {},
    'expired-callback': () => { recaptchaVerifier = null; },
  });
  return recaptchaVerifier;
}

// ── Send OTP SMS ──────────────────────────────────────────────────────────────
// phoneNumber must be in international format: +260XXXXXXXXX
export async function sendFirebaseOTP(
  phoneNumber: string,
  recaptchaContainerId = 'recaptcha-container',
): Promise<{ success: boolean; confirmationResult?: ConfirmationResult; error?: string }> {
  try {
    const verifier = setupRecaptcha(recaptchaContainerId);
    const result = await signInWithPhoneNumber(auth, phoneNumber, verifier);
    return { success: true, confirmationResult: result };
  } catch (err: any) {
    console.error('[Firebase OTP]', err.code, err.message);
    const msg =
      err.code === 'auth/invalid-phone-number'       ? 'Invalid phone number. Please use format: +260XXXXXXXXX' :
      err.code === 'auth/too-many-requests'           ? 'Too many attempts. Please wait a few minutes before trying again.' :
      err.code === 'auth/quota-exceeded'              ? 'SMS service temporarily unavailable. Please try again later.' :
      err.code === 'auth/captcha-check-failed'        ? 'Security check failed. Please refresh the page and try again.' :
      err.code === 'auth/missing-phone-number'        ? 'Please enter your phone number.' :
      err.code === 'auth/internal-error'              ? 'SMS could not be sent. Please check your number and try again.' :
      err.code === 'auth/operation-not-allowed'       ? 'Phone verification is currently unavailable. Please contact support.' :
      err.code === 'auth/app-not-authorized'          ? 'Verification unavailable on this device. Please try on the main website.' :
      'Failed to send verification code. Please try again.';
    return { success: false, error: msg };
  }
}

// ── Verify the code the user entered ─────────────────────────────────────────
export async function verifyFirebaseOTP(
  confirmationResult: ConfirmationResult,
  code: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    await confirmationResult.confirm(code);
    return { success: true };
  } catch (err: any) {
    console.error('[Firebase OTP verify]', err.code);
    const msg =
      err.code === 'auth/invalid-verification-code' ? 'Incorrect code. Please check and try again.' :
      err.code === 'auth/code-expired'              ? 'Your code has expired. Please request a new one.' :
      err.code === 'auth/missing-verification-code' ? 'Please enter the 6-digit code sent to your phone.' :
      'Verification failed. Please try again.';
    return { success: false, error: msg };
  }
}
