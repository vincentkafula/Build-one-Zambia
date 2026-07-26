import { useState, CSSProperties } from 'react';
import { X, User, Loader2 } from 'lucide-react';
import { buyerApi, setToken, BuyerProfile } from '../lib/api';

const INK = '#181C12';
const RED = '#dc2626';
const ORANGE = '#DE8A2A';

const ZAMBIA_PROVINCES = [
  'Lusaka', 'Copperbelt', 'Central', 'Eastern', 'Southern',
  'Western', 'Northern', 'Luapula', 'North-Western', 'Muchinga',
];

const s = {
  overlay: { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' } as CSSProperties,
  card: { background: '#fff', color: INK, width: '100%', maxWidth: '420px', maxHeight: '90vh', overflowY: 'auto', borderRadius: '4px', fontFamily: 'Open Sans, sans-serif', position: 'relative' } as CSSProperties,
  header: { padding: '22px 24px 0', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' } as CSSProperties,
  body: { padding: '18px 24px 24px' } as CSSProperties,
  label: { fontSize: '11px', letterSpacing: '0.1em', color: '#6b6455', fontFamily: 'Oswald, sans-serif', display: 'block', marginBottom: '5px', textTransform: 'uppercase' } as CSSProperties,
  input: { width: '100%', boxSizing: 'border-box', padding: '11px 12px', background: '#F7F3E7', border: '1px solid #D8CDA9', color: INK, fontSize: '14px', outline: 'none', fontFamily: 'Open Sans, sans-serif', borderRadius: '2px', marginBottom: '13px' } as CSSProperties,
  row2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' } as CSSProperties,
  btnPrimary: { width: '100%', padding: '13px', backgroundColor: RED, color: '#fff', border: 'none', fontFamily: 'Oswald, sans-serif', fontSize: '13px', letterSpacing: '0.08em', cursor: 'pointer', borderRadius: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '4px' } as CSSProperties,
  tab: (active: boolean) => ({ flex: 1, padding: '10px', textAlign: 'center', fontFamily: 'Oswald, sans-serif', fontSize: '12.5px', letterSpacing: '0.06em', cursor: 'pointer', color: active ? '#fff' : '#6b6455', backgroundColor: active ? ORANGE : '#F0EAD6', border: 'none' } as CSSProperties),
};

interface Props {
  onClose: () => void;
  onAuthed: (buyer: BuyerProfile) => void;
}

export function BuyerAuth({ onClose, onAuthed }: Props) {
  const [mode, setMode] = useState<'signin' | 'register'>('signin');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // shared
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // register-only
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [addressLine1, setAddr1] = useState('');
  const [addressLine2, setAddr2] = useState('');
  const [city, setCity] = useState('');
  const [province, setProvince] = useState('');

  const submit = async () => {
    setError('');
    if (!email.trim() || !password.trim()) { setError('Please enter your email and password.'); return; }
    if (mode === 'register') {
      if (!name.trim() || !phone.trim() || !addressLine1.trim() || !city.trim() || !province) {
        setError('Please fill in your name, phone, and delivery address.');
        return;
      }
      if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    }
    setLoading(true);
    try {
      const res = mode === 'signin'
        ? await buyerApi.login(email.trim(), password)
        : await buyerApi.register({ name: name.trim(), email: email.trim(), phone: phone.trim(), password, addressLine1: addressLine1.trim(), addressLine2: addressLine2.trim(), city: city.trim(), province });
      setToken(res.token);
      onAuthed(res.buyer);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong — please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.overlay} onClick={onClose}>
      <div style={s.card} onClick={e => e.stopPropagation()}>
        <div style={s.header}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
              <User style={{ width: '16px', height: '16px', color: RED }} />
              <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: '10px', letterSpacing: '0.14em', color: RED }}>BOZ CAMPAIGN STORE</span>
            </div>
            <h2 style={{ fontFamily: 'Oswald, sans-serif', fontSize: '20px', margin: 0 }}>{mode === 'signin' ? 'Sign in to continue' : 'Create your account'}</h2>
            <p style={{ fontSize: '12.5px', color: '#6b6455', margin: '4px 0 0' }}>You don't need to be a BOZ member — just a quick account so we can deliver your order.</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b6455', padding: '4px' }} aria-label="Close">
            <X style={{ width: '18px', height: '18px' }} />
          </button>
        </div>

        <div style={{ display: 'flex', margin: '18px 24px 0', borderRadius: '2px', overflow: 'hidden' }}>
          <button style={s.tab(mode === 'signin')} onClick={() => { setMode('signin'); setError(''); }}>SIGN IN</button>
          <button style={s.tab(mode === 'register')} onClick={() => { setMode('register'); setError(''); }}>REGISTER</button>
        </div>

        <div style={s.body}>
          {mode === 'register' && (
            <>
              <label style={s.label}>Full name</label>
              <input style={s.input} value={name} onChange={e => setName(e.target.value)} placeholder="Chanda Mulenga" />
            </>
          )}

          <label style={s.label}>Email</label>
          <input style={s.input} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" />

          {mode === 'register' && (
            <>
              <label style={s.label}>Phone number</label>
              <input style={s.input} value={phone} onChange={e => setPhone(e.target.value)} placeholder="097 000 0000" />
            </>
          )}

          <label style={s.label}>Password</label>
          <input style={s.input} type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder={mode === 'register' ? 'At least 6 characters' : '••••••••'} />

          {mode === 'register' && (
            <>
              <label style={s.label}>Delivery address</label>
              <input style={s.input} value={addressLine1} onChange={e => setAddr1(e.target.value)} placeholder="Street address" />
              <input style={s.input} value={addressLine2} onChange={e => setAddr2(e.target.value)} placeholder="Apartment, suite, etc. (optional)" />
              <div style={s.row2}>
                <input style={s.input} value={city} onChange={e => setCity(e.target.value)} placeholder="City / town" />
                <select style={s.input} value={province} onChange={e => setProvince(e.target.value)}>
                  <option value="">Province</option>
                  {ZAMBIA_PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </>
          )}

          {error && (
            <p style={{ color: RED, fontSize: '12.5px', margin: '0 0 12px', fontFamily: 'Open Sans, sans-serif' }}>{error}</p>
          )}

          <button style={s.btnPrimary} onClick={submit} disabled={loading}>
            {loading ? <Loader2 style={{ width: '15px', height: '15px', animation: 'spin 1s linear infinite' }} /> : null}
            {loading ? 'Please wait…' : mode === 'signin' ? 'Sign in' : 'Create account'}
          </button>

          <p style={{ textAlign: 'center', fontSize: '12px', color: '#6b6455', marginTop: '14px' }}>
            {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
            <button onClick={() => { setMode(mode === 'signin' ? 'register' : 'signin'); setError(''); }} style={{ background: 'none', border: 'none', color: RED, cursor: 'pointer', fontWeight: 600, padding: 0, fontFamily: 'inherit', fontSize: 'inherit' }}>
              {mode === 'signin' ? 'Register' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
