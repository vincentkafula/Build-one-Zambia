import { initializeApp, getApps } from 'firebase/app';
import {
  getAuth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  type ConfirmationResult,
} from 'firebase/auth';

// ─────────────────────────────────────────────────────────────────────────────
// Firebase config — Build One Zambia
// To enable real SMS OTP:
//   1. Firebase Console → Authentication → Sign-in method → Phone → Enable
//   2. Firebase Console → Authentication → Settings → Authorized domains
//      → Add: bozplans.org  and  www.bozplans.org
//   3. Firebase Console → Project Settings → App Check → disable reCAPTCHA Enterprise
//      or whitelist bozplans.org under reCAPTCHA Enterprise in Google Cloud Console
// ─────────────────────────────────────────────────────────────────────────────
const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY            || 'AIzaSyCj6hSk9FcZjX9rYNK7SX96QT9BoNBXxcs',
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN        || 'build-one-zambia.firebaseapp.com',
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID         || 'build-one-zambia',
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET     || 'build-one-zambia.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '681107002005',
  appId:             import.meta.env.VITE_FIREBASE_APP_ID             || '1:681107002005:web:adf250c234ccf2841c819c',
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);

// Check if Firebase is properly configured and domain is authorized
export function isFirebaseConfigured(): boolean {
  try {
    const cfg = auth.app.options;
    return !!(cfg.apiKey && !cfg.apiKey.startsWith('YOUR_'));
  } catch {
    return false;
  }
}

// reCAPTCHA verifier instance
let recaptchaVerifier: RecaptchaVerifier | null = null;

export function clearRecaptcha() {
  if (recaptchaVerifier) {
    try { recaptchaVerifier.clear(); } catch {}
    recaptchaVerifier = null;
  }
}

export function setupRecaptcha(container: HTMLElement | string): RecaptchaVerifier {
  clearRecaptcha();
  recaptchaVerifier = new RecaptchaVerifier(
    auth,
    container,
    {
      size: 'invisible',
      callback: () => {},
      'expired-callback': () => { clearRecaptcha(); },
    },
  );
  return recaptchaVerifier;
}

// Send OTP — returns success/error
export async function sendFirebaseOTP(
  phoneNumber: string,
  recaptchaContainerId: HTMLElement | string = 'recaptcha-container',
): Promise<{ success: boolean; confirmationResult?: ConfirmationResult; error?: string }> {
  try {
    const verifier = setupRecaptcha(recaptchaContainerId);
    await verifier.render();
    const result = await signInWithPhoneNumber(auth, phoneNumber, verifier);
    return { success: true, confirmationResult: result };
  } catch (err: any) {
    clearRecaptcha();
    console.error('[Firebase OTP]', err?.code, err?.message);
    const code = err?.code || '';
    const msg =
      code === 'auth/invalid-phone-number'    ? 'Invalid phone number. Use format: +260XXXXXXXXX' :
      code === 'auth/too-many-requests'        ? 'Too many attempts. Please wait a few minutes.' :
      code === 'auth/quota-exceeded'           ? 'SMS quota reached. Please try again later.' :
      code === 'auth/captcha-check-failed'     ? 'Security check failed. Please refresh the page and try again.' :
      code === 'auth/missing-phone-number'     ? 'Please enter your phone number.' :
      code === 'auth/operation-not-allowed'    ? 'Phone verification is not enabled. Contact support.' :
      code === 'auth/unauthorized-domain'      ? 'This domain is not authorized in Firebase. Add bozplans.org to Firebase → Authentication → Authorized Domains.' :
      // error-code:-39 = reCAPTCHA Enterprise not configured for this domain
      (err?.message?.includes('-39') || code?.includes('-39'))
        ? 'reCAPTCHA verification failed. This usually means bozplans.org needs to be added to Firebase authorized domains or reCAPTCHA Enterprise needs to be configured.' :
      `OTP failed (${code || 'unknown'}). Please try again.`;
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
      c === 'auth/missing-verification-code' ? 'Please enter the 6-digit code.' :
      'Verification failed. Please try again.';
    return { success: false, error: msg };
  }
}
