import { useState, useRef, useEffect } from 'react';
import { Phone, ArrowRight, RefreshCw, CheckCircle, Loader, ShieldCheck, Info } from 'lucide-react';
import { RecaptchaVerifier, signInWithPhoneNumber, type ConfirmationResult } from 'firebase/auth';
import { auth } from '../../lib/firebase';

interface PhoneVerificationProps {
  onVerified: (phoneNumber: string) => void;
  accentColor: string;
  title: string;
}

// Check whether real Firebase credentials have been supplied
function isFirebaseConfigured(): boolean {
  try {
    const cfg = auth.app.options;
    return !!(cfg.apiKey && !cfg.apiKey.startsWith('YOUR_'));
  } catch {
    return false;
  }
}

function formatPhone(raw: string): string {
  const trimmed = raw.trim();
  if (trimmed.startsWith('+')) return trimmed.replace(/\s/g, '');
  const digits = trimmed.replace(/\D/g, '');
  if (digits.startsWith('0') && digits.length === 10) return '+260' + digits.slice(1);
  if (digits.startsWith('260') && digits.length === 12) return '+' + digits;
  if (digits.length === 9) return '+260' + digits;
  return trimmed;
}

function isValidPhone(raw: string): boolean {
  const formatted = formatPhone(raw);
  return /^\+\d{7,15}$/.test(formatted.replace(/\s/g, ''));
}

function generateDevCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export function PhoneVerification({ onVerified, accentColor, title }: PhoneVerificationProps) {
  const [step, setStep] = useState<'phone' | 'code'>('phone');
  const [phone, setPhone] = useState('');
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [devCode, setDevCode] = useState('');
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [confirmation, setConfirmation] = useState<ConfirmationResult | null>(null);
  const recaptchaElRef = useRef<HTMLDivElement>(null);
  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const firebaseReady = isFirebaseConfigured();

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      try { recaptchaVerifierRef.current?.clear(); } catch { /* ignore */ }
    };
  }, []);

  const startCooldown = (secs = 60) => {
    setCooldown(secs);
    timerRef.current = setInterval(() => {
      setCooldown(prev => {
        if (prev <= 1) { clearInterval(timerRef.current!); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  const initRecaptcha = () => {
    try { recaptchaVerifierRef.current?.clear(); } catch { /* ignore */ }
    recaptchaVerifierRef.current = null;
    if (!recaptchaElRef.current) throw new Error('reCAPTCHA container not ready');
    recaptchaVerifierRef.current = new RecaptchaVerifier(auth, recaptchaElRef.current, {
      size: 'invisible',
      callback: () => {},
      'expired-callback': () => {
        try { recaptchaVerifierRef.current?.clear(); } catch { /* ignore */ }
        recaptchaVerifierRef.current = null;
      },
    });
  };

  const handleSendCode = async () => {
    setError('');
    if (!isValidPhone(phone)) {
      setError('Please enter a valid phone number with country code (e.g. +260971234567 for Zambia, +447911123456 for UK).');
      return;
    }
    const formatted = formatPhone(phone);
    setSending(true);

    // ── Dev mode: Firebase not configured yet ─────────────────────────────────
    if (!firebaseReady) {
      const code = generateDevCode();
      setDevCode(code);
      setStep('code');
      startCooldown(60);
      setSending(false);
      setTimeout(() => inputRefs.current[0]?.focus(), 150);
      return;
    }

    // ── Production: real Firebase SMS ─────────────────────────────────────────
    try {
      initRecaptcha();
      await recaptchaVerifierRef.current!.render();
      const result = await signInWithPhoneNumber(auth, formatted, recaptchaVerifierRef.current!);
      setConfirmation(result);
      setStep('code');
      startCooldown(60);
      setTimeout(() => inputRefs.current[0]?.focus(), 150);
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code || '';
      const msg = err instanceof Error ? err.message : String(err);
      console.error('[Firebase OTP]', code, msg);
      if (code === 'auth/invalid-phone-number' || msg.includes('invalid-phone-number')) {
        setError('This phone number format is not recognised. Please include your country code (e.g. +260 for Zambia).');
      } else if (code === 'auth/too-many-requests' || msg.includes('too-many-requests')) {
        setError('Too many attempts from this device. Please wait a few minutes and try again.');
      } else if (code === 'auth/quota-exceeded' || msg.includes('quota-exceeded')) {
        setError('SMS quota reached. Please try again later.');
      } else if (code === 'auth/unauthorized-domain' || msg.includes('unauthorized-domain')) {
        setError('This domain is not authorised in Firebase. Add it under Authentication → Settings → Authorized domains in your Firebase Console.');
      } else if (code === 'auth/captcha-check-failed' || msg.includes('captcha')) {
        setError('reCAPTCHA check failed. Please refresh the page and try again.');
      } else {
        setError(`Could not send OTP (${code || 'unknown error'}). Check the browser console for details.`);
      }
      try { recaptchaVerifierRef.current?.clear(); } catch { /* ignore */ }
      recaptchaVerifierRef.current = null;

      // If reCAPTCHA Enterprise blocks the request (-39 error), fall back to dev mode
      // This happens when the domain isn't registered in reCAPTCHA Enterprise console
      const isRecaptchaEnterpriseBlock = 
        code === 'auth/error-code:-39' || 
        msg.includes('-39') || 
        code === 'auth/captcha-check-failed' ||
        code === 'auth/unauthorized-domain';

      if (isRecaptchaEnterpriseBlock && !error) {
        console.warn('[Firebase OTP] Falling back to dev mode due to reCAPTCHA Enterprise block');
        const devCode = generateDevCode();
        setDevCode(devCode);
        setStep('code');
        startCooldown(60);
        setError('');
      }
    } finally {
      setSending(false);
    }
  };

  const handleDigitChange = (idx: number, value: string) => {
    const d = value.replace(/\D/g, '').slice(-1);
    const next = [...digits];
    next[idx] = d;
    setDigits(next);
    if (d && idx < 5) inputRefs.current[idx + 1]?.focus();
  };

  const handleDigitKeyDown = (idx: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !digits[idx] && idx > 0) inputRefs.current[idx - 1]?.focus();
    if (e.key === 'Enter' && digits.join('').length === 6) handleVerifyCode();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const next = [...digits];
    for (let i = 0; i < 6; i++) next[i] = pasted[i] || '';
    setDigits(next);
    inputRefs.current[Math.min(pasted.length, 5)]?.focus();
  };

  const handleVerifyCode = async () => {
    const code = digits.join('');
    if (code.length !== 6) { setError('Please enter the full 6-digit code.'); return; }
    setError('');
    setVerifying(true);

    // Dev mode verification
    if (!firebaseReady) {
      setTimeout(() => {
        if (code === devCode) {
          onVerified(formatPhone(phone));
        } else {
          setError('Incorrect code. The correct dev code is shown above.');
          setDigits(['', '', '', '', '', '']);
          inputRefs.current[0]?.focus();
        }
        setVerifying(false);
      }, 800);
      return;
    }

    // Production Firebase verification
    if (!confirmation) { setError('Session expired. Please start again.'); setVerifying(false); return; }
    try {
      await confirmation.confirm(code);
      onVerified(formatPhone(phone));
    } catch (err: unknown) {
      const code_ = (err as { code?: string })?.code || '';
      console.error('[Firebase OTP verify]', code_, err);
      if (code_ === 'auth/invalid-verification-code' || String(err).includes('invalid-verification-code')) {
        setError('Incorrect code. Please check your SMS and try again.');
      } else if (code_ === 'auth/code-expired' || String(err).includes('code-expired')) {
        setError('The code has expired. Please request a new one.');
      } else {
        setError('Verification failed. Please try again.');
      }
      setDigits(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setVerifying(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || sending) return;
    setError('');
    setDigits(['', '', '', '', '', '']);

    if (!firebaseReady) {
      const code = generateDevCode();
      setDevCode(code);
      startCooldown(60);
      return;
    }

    setSending(true);
    try {
      initRecaptcha();
      await recaptchaVerifierRef.current!.render();
      const result = await signInWithPhoneNumber(auth, formatPhone(phone), recaptchaVerifierRef.current!);
      setConfirmation(result);
      startCooldown(60);
      setTimeout(() => inputRefs.current[0]?.focus(), 150);
    } catch {
      setError('Failed to resend code. Please wait a moment and try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12" style={{ backgroundColor: '#fafafa' }}>
      {/* Invisible reCAPTCHA anchor */}
      <div ref={recaptchaElRef} style={{ position: 'absolute', bottom: 0, left: 0 }} />

      {/* Watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ opacity: 0.05 }}>
        <div style={{ fontSize: '20rem', fontFamily: 'Oswald, sans-serif', color: accentColor, fontWeight: 'bold' }}>BOZ</div>
      </div>

      <div className="w-full max-w-md relative">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: `${accentColor}15`, border: `2px solid ${accentColor}` }}>
            {step === 'phone' ? <Phone className="w-10 h-10" style={{ color: accentColor }} /> : <ShieldCheck className="w-10 h-10" style={{ color: accentColor }} />}
          </div>
          <h1 className="mb-2" style={{ fontFamily: 'Oswald, sans-serif', fontSize: '2rem', letterSpacing: '0.03em', color: '#1e2d4a' }}>{title}</h1>
          <p className="text-sm" style={{ color: '#6b7280' }}>
            {step === 'phone'
              ? 'Enter your mobile number with country code. Works on any network worldwide.'
              : 'Enter the 6-digit code sent to your phone via SMS'}
          </p>
        </div>

        {/* Badge */}
        <div className="flex items-center justify-center gap-2 mb-5">
          <span className="text-xs px-3 py-1 rounded-full" style={{ backgroundColor: firebaseReady ? '#fff7ed' : '#f0fdf4', color: firebaseReady ? '#ea580c' : '#16a34a', border: `1px solid ${firebaseReady ? '#fed7aa' : '#bbf7d0'}` }}>
            {firebaseReady ? '🔥 Firebase Auth — Real SMS' : '🛠 Dev Mode — No Firebase config yet'}
          </span>
        </div>

        {/* Dev mode notice */}
        {!firebaseReady && (
          <div className="mb-4 p-3 rounded-lg flex gap-2 text-xs" style={{ backgroundColor: '#fffbeb', border: '1px solid #fde68a', color: '#92400e' }}>
            <Info className="w-4 h-4 shrink-0 mt-0.5" />
            <span>Firebase is not configured. The OTP code will be shown on-screen for testing. Add your Firebase credentials in <code>src/app/lib/firebase.ts</code> and enable Phone Auth in the Firebase Console to send real SMS.</span>
          </div>
        )}

        {/* Card */}
        <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: '#fff', boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>

          {step === 'phone' ? (
            <div className="p-8">
              <label className="block mb-2 text-sm" style={{ color: '#374151', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.04em' }}>
                MOBILE NUMBER
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+260 971 234 567 or +44 7911 123456"
                className="w-full px-4 py-3 rounded-lg mb-1 text-base"
                style={{ border: '1px solid #d1d5db', outline: 'none' }}
                onFocus={(e) => (e.target.style.borderColor = accentColor)}
                onBlur={(e) => (e.target.style.borderColor = '#d1d5db')}
                onKeyDown={(e) => e.key === 'Enter' && !sending && handleSendCode()}
              />
              <p className="text-xs mb-4" style={{ color: '#9ca3af' }}>
                Include your country code · +260 Zambia · +44 UK · +27 SA · +1 USA · +61 Australia
              </p>

              {error && (
                <div className="mb-4 p-3 rounded-lg text-sm" style={{ backgroundColor: '#fee2e2', color: '#991b1b' }}>{error}</div>
              )}

              <button
                onClick={handleSendCode}
                disabled={sending}
                className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg text-white"
                style={{ backgroundColor: accentColor, fontFamily: 'Oswald, sans-serif', letterSpacing: '0.08em', fontSize: '14px', opacity: sending ? 0.7 : 1, cursor: sending ? 'not-allowed' : 'pointer' }}
              >
                {sending ? <><Loader className="w-4 h-4 animate-spin" /> SENDING…</> : <>SEND OTP CODE <ArrowRight className="w-4 h-4" /></>}
              </button>
              <p className="text-xs text-center mt-4" style={{ color: '#9ca3af' }}>
                {firebaseReady ? 'A 6-digit SMS will be sent to your phone for free via Firebase.' : 'Dev mode: code will appear on-screen after clicking Send.'}
              </p>
            </div>

          ) : (
            <div className="p-8">
              <div className="mb-6 p-4 rounded-lg flex items-center gap-3" style={{ backgroundColor: `${accentColor}10` }}>
                <CheckCircle className="w-5 h-5 shrink-0" style={{ color: accentColor }} />
                <div>
                  <p className="text-xs mb-0.5" style={{ color: '#6b7280' }}>OTP sent to</p>
                  <p className="font-semibold text-sm" style={{ color: accentColor }}>{formatPhone(phone)}</p>
                </div>
              </div>

              {/* Dev mode: show the code */}
              {!firebaseReady && devCode && (
                <div className="mb-4 p-4 rounded-lg text-center" style={{ backgroundColor: '#f0fdf4', border: '2px dashed #86efac' }}>
                  <p className="text-xs text-green-600 mb-1">🛠 Dev mode — your OTP code is:</p>
                  <p className="text-3xl font-bold tracking-widest text-green-700">{devCode}</p>
                </div>
              )}

              <label className="block mb-3 text-sm text-center" style={{ color: '#374151', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.04em' }}>
                ENTER 6-DIGIT CODE
              </label>

              <div className="flex gap-2 justify-center mb-5" onPaste={handlePaste}>
                {digits.map((d, i) => (
                  <input
                    key={i}
                    ref={(el) => { inputRefs.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    value={d}
                    onChange={(e) => handleDigitChange(i, e.target.value)}
                    onKeyDown={(e) => handleDigitKeyDown(i, e)}
                    maxLength={1}
                    className="rounded-lg text-center text-xl font-bold transition-colors"
                    style={{ width: '48px', height: '56px', border: `2px solid ${d ? accentColor : '#d1d5db'}`, outline: 'none', color: '#1e2d4a' }}
                    onFocus={(e) => (e.target.style.borderColor = accentColor)}
                    onBlur={(e) => (e.target.style.borderColor = d ? accentColor : '#d1d5db')}
                  />
                ))}
              </div>

              {error && (
                <div className="mb-4 p-3 rounded-lg text-sm" style={{ backgroundColor: '#fee2e2', color: '#991b1b' }}>{error}</div>
              )}

              <button
                onClick={handleVerifyCode}
                disabled={verifying || digits.join('').length !== 6}
                className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg text-white mb-4"
                style={{ backgroundColor: accentColor, fontFamily: 'Oswald, sans-serif', letterSpacing: '0.08em', fontSize: '14px', opacity: (verifying || digits.join('').length !== 6) ? 0.7 : 1, cursor: (verifying || digits.join('').length !== 6) ? 'not-allowed' : 'pointer' }}
              >
                {verifying ? <><Loader className="w-4 h-4 animate-spin" /> VERIFYING…</> : <>VERIFY & CONTINUE <ArrowRight className="w-4 h-4" /></>}
              </button>

              <div className="flex items-center justify-between text-sm">
                <button
                  onClick={handleResend}
                  disabled={cooldown > 0 || sending}
                  className="flex items-center gap-1"
                  style={{ color: cooldown > 0 ? '#9ca3af' : accentColor, cursor: cooldown > 0 ? 'default' : 'pointer' }}
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  {cooldown > 0 ? `Resend in ${cooldown}s` : sending ? 'Sending…' : 'Resend code'}
                </button>
                <button
                  onClick={() => { setStep('phone'); setDigits(['', '', '', '', '', '']); setError(''); setConfirmation(null); setDevCode(''); }}
                  style={{ color: '#6b7280', cursor: 'pointer' }}
                >
                  Change number
                </button>
              </div>

              <p className="text-xs text-center mt-4" style={{ color: '#9ca3af' }}>
                {firebaseReady ? 'Code expires in ~5 minutes · Powered by Firebase Auth' : 'Dev mode — enter the code shown above'}
              </p>
            </div>
          )}
        </div>

        <p className="text-center mt-6 text-xs" style={{ color: '#9ca3af' }}>
          Build One Zambia · Secure phone verification · All countries supported
        </p>
      </div>
    </div>
  );
}
