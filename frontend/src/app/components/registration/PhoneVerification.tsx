import { useState, useRef, useEffect } from 'react';
import { Phone, ArrowRight, RefreshCw, CheckCircle, Loader, ShieldCheck } from 'lucide-react';
import { sendBackendOTP, verifyBackendOTP } from '../../lib/firebase';

interface PhoneVerificationProps {
  onVerified: (phoneNumber: string) => void;
  accentColor: string;
  title: string;
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

export function PhoneVerification({ onVerified, accentColor, title }: PhoneVerificationProps) {
  const [step, setStep] = useState<'phone' | 'code'>('phone');
  const [phone, setPhone] = useState('');
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');   // dev mode shows code here
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const contactRef = useRef('');  // stores phone or email used

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  const startCooldown = (secs = 60) => {
    setCooldown(secs);
    timerRef.current = setInterval(() => {
      setCooldown(prev => {
        if (prev <= 1) { clearInterval(timerRef.current!); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSendCode = async () => {
    setError(''); setInfo('');
    if (!isValidPhone(phone)) {
      setError('Please enter a valid Zambian phone number (e.g. 0971234567 or +260971234567).');
      return;
    }
    const formatted = formatPhone(phone);
    contactRef.current = formatted;
    setSending(true);

    const result = await sendBackendOTP(formatted);

    if (!result.success) {
      setError(result.error || 'Could not send verification code. Please try again.');
      setSending(false);
      return;
    }

    // Dev mode — backend returns OTP directly when NODE_ENV !== production
    if (result.otp) {
      setInfo(`Dev mode: your code is ${result.otp}`);
    }

    setStep('code');
    startCooldown(60);
    setSending(false);
    setTimeout(() => inputRefs.current[0]?.focus(), 150);
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
    setError(''); setVerifying(true);

    const result = await verifyBackendOTP(contactRef.current, code);

    if (!result.success) {
      setError(result.error || 'Incorrect code. Please try again.');
      setVerifying(false);
      return;
    }

    setVerifying(false);
    onVerified(contactRef.current);
  };

  const handleResend = () => {
    setDigits(['', '', '', '', '', '']);
    setError(''); setInfo('');
    handleSendCode();
  };

  const A = accentColor;

  // ── Step 1: Enter phone ───────────────────────────────────────────────────
  if (step === 'phone') {
    return (
      <div className="space-y-5">
        <div>
          <h3 className="text-lg font-semibold text-white mb-1">{title}</h3>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>
            Enter your Zambian mobile number. A 6-digit verification code will be sent.
          </p>
        </div>

        {error && (
          <div className="px-4 py-3 rounded-xl text-sm" style={{ backgroundColor: '#ef444418', border: '1px solid #ef444430', color: '#f87171' }}>
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs mb-2" style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.1em' }}>
            PHONE NUMBER
          </label>
          <div className="flex gap-2">
            <div className="flex items-center px-3 rounded-xl shrink-0 text-sm" style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)' }}>
              <Phone size={14} className="mr-1.5" /> +260
            </div>
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSendCode()}
              placeholder="971 234 567"
              className="flex-1 px-4 py-3 rounded-xl text-sm text-white outline-none"
              style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
              onFocus={e => (e.target.style.borderColor = `${A}80`)}
              onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
            />
          </div>
        </div>

        <button
          onClick={handleSendCode}
          disabled={sending || !phone.trim()}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm transition-all"
          style={{
            background: sending || !phone.trim() ? 'rgba(255,255,255,0.08)' : A,
            color: '#fff',
            fontFamily: 'Oswald, sans-serif',
            letterSpacing: '0.08em',
            cursor: sending || !phone.trim() ? 'not-allowed' : 'pointer',
          }}
        >
          {sending
            ? <><Loader size={15} className="animate-spin" /> SENDING CODE...</>
            : <>SEND VERIFICATION CODE <ArrowRight size={15} /></>}
        </button>

        <p className="text-xs text-center" style={{ color: 'rgba(255,255,255,0.2)' }}>
          A 6-digit code will be sent to your phone
        </p>
      </div>
    );
  }

  // ── Step 2: Enter code ────────────────────────────────────────────────────
  const codeComplete = digits.join('').length === 6;

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-lg font-semibold text-white mb-1">Enter Verification Code</h3>
        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>
          We sent a 6-digit code to <span className="text-white font-medium">{contactRef.current}</span>
        </p>
      </div>

      {error && (
        <div className="px-4 py-3 rounded-xl text-sm" style={{ backgroundColor: '#ef444418', border: '1px solid #ef444430', color: '#f87171' }}>
          {error}
        </div>
      )}

      {info && (
        <div className="px-4 py-3 rounded-xl text-sm font-mono" style={{ backgroundColor: '#f59e0b18', border: '1px solid #f59e0b30', color: '#fcd34d' }}>
          {info}
        </div>
      )}

      {/* 6-digit input */}
      <div className="flex gap-2 justify-center">
        {digits.map((d, idx) => (
          <input
            key={idx}
            ref={el => { inputRefs.current[idx] = el; }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={d}
            onChange={e => handleDigitChange(idx, e.target.value)}
            onKeyDown={e => handleDigitKeyDown(idx, e)}
            onPaste={idx === 0 ? handlePaste : undefined}
            className="w-11 h-14 text-center text-xl font-bold rounded-xl outline-none transition-all"
            style={{
              backgroundColor: d ? `${A}18` : 'rgba(255,255,255,0.06)',
              border: d ? `2px solid ${A}` : '1px solid rgba(255,255,255,0.12)',
              color: '#fff',
            }}
          />
        ))}
      </div>

      <button
        onClick={handleVerifyCode}
        disabled={verifying || !codeComplete}
        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm transition-all"
        style={{
          background: verifying || !codeComplete ? 'rgba(255,255,255,0.08)' : A,
          color: '#fff',
          fontFamily: 'Oswald, sans-serif',
          letterSpacing: '0.08em',
          cursor: verifying || !codeComplete ? 'not-allowed' : 'pointer',
          boxShadow: codeComplete && !verifying ? `0 4px 20px ${A}40` : 'none',
        }}
      >
        {verifying
          ? <><Loader size={15} className="animate-spin" /> VERIFYING...</>
          : <><CheckCircle size={15} /> VERIFY CODE</>}
      </button>

      <div className="flex items-center justify-between">
        <button
          onClick={() => { setStep('phone'); setDigits(['','','','','','']); setError(''); setInfo(''); }}
          className="text-xs"
          style={{ color: 'rgba(255,255,255,0.35)' }}
        >
          ← Change number
        </button>
        {cooldown > 0 ? (
          <span className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
            Resend in {cooldown}s
          </span>
        ) : (
          <button onClick={handleResend} className="flex items-center gap-1 text-xs" style={{ color: A }}>
            <RefreshCw size={12} /> Resend code
          </button>
        )}
      </div>

      <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ backgroundColor: 'rgba(255,255,255,0.03)' }}>
        <ShieldCheck size={13} style={{ color: A, flexShrink: 0 }} />
        <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
          Code expires in 10 minutes. Do not share it with anyone.
        </p>
      </div>
    </div>
  );
}

export { PhoneVerification as default };
