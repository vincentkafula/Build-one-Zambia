import { useState } from 'react';
import { X, Send, CheckCircle2, Loader2 } from 'lucide-react';
import { contactApi } from '../lib/api';

const REASONS = [
  'General inquiry',
  'Report an issue in my area',
  'Request a meeting',
  'Policy question',
  'Media / press',
  'Other',
];

interface Props {
  minister: { name: string; role: string; constituency?: string };
  onClose: () => void;
}

export function ShadowMinisterContactModal({ minister, onClose }: Props) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [reason, setReason] = useState(REASONS[0]);
  const [message, setMessage] = useState('');
  const [confidential, setConfidential] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      setError('Please fill in your name, email, and message.');
      return;
    }
    setSending(true);
    setError('');
    try {
      await contactApi.send({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        subject: `${reason} — Message for ${minister.name} (${minister.role})`,
        message: `${confidential ? '[Constituent asked to remain confidential]\n\n' : ''}${message.trim()}`,
        ministerName: minister.name,
        ministerRole: minister.role,
      });
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong — please try again or email info@bozplans.org directly.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(17,24,39,0.55)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl overflow-hidden"
        style={{ backgroundColor: '#ffffff', boxShadow: 'var(--shadow-xl, 0 24px 48px -12px rgba(15,23,42,0.25))', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-start justify-between px-6 pt-6 pb-4" style={{ borderBottom: '1px solid #f0f0f0' }}>
          <div>
            <p className="text-xs mb-1" style={{ fontFamily: 'Oswald, sans-serif', letterSpacing: '0.1em', color: '#f97316' }}>CONTACT SHADOW MINISTER</p>
            <h3 style={{ fontFamily: 'Oswald, sans-serif', fontSize: '1.15rem', letterSpacing: '0.02em', color: '#1e2d4a' }}>{minister.name}</h3>
            <p className="text-xs mt-0.5" style={{ color: '#9ca3af' }}>{minister.role}{minister.constituency ? ` · ${minister.constituency}` : ''}</p>
          </div>
          <button onClick={onClose} aria-label="Close" className="p-1 rounded-lg" style={{ color: '#9ca3af' }}>
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-5 overflow-y-auto">
          {sent ? (
            <div className="text-center py-6">
              <CheckCircle2 size={44} style={{ color: '#16a34a', margin: '0 auto 14px' }} />
              <h4 style={{ fontFamily: 'Oswald, sans-serif', fontSize: '1.1rem', color: '#1e2d4a', marginBottom: 6 }}>Message sent</h4>
              <p className="text-sm" style={{ color: '#6b7280' }}>
                Your message has been forwarded to the office of {minister.name}. You'll receive a confirmation by email shortly.
              </p>
              <button onClick={onClose} className="mt-5 px-5 py-2 rounded-lg text-sm text-white" style={{ backgroundColor: '#f97316', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.06em' }}>
                CLOSE
              </button>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs mb-1" style={{ color: '#6b7280', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.04em' }}>YOUR NAME</label>
                  <input value={name} onChange={e => setName(e.target.value)} placeholder="Jane Mwansa"
                    className="w-full px-3 py-2 rounded-lg text-sm" style={inputStyle} />
                </div>
                <div>
                  <label className="block text-xs mb-1" style={{ color: '#6b7280', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.04em' }}>PHONE (OPTIONAL)</label>
                  <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+260 97 000 0000"
                    className="w-full px-3 py-2 rounded-lg text-sm" style={inputStyle} />
                </div>
              </div>

              <div>
                <label className="block text-xs mb-1" style={{ color: '#6b7280', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.04em' }}>EMAIL</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com"
                  className="w-full px-3 py-2 rounded-lg text-sm" style={inputStyle} />
              </div>

              <div>
                <label className="block text-xs mb-1" style={{ color: '#6b7280', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.04em' }}>REASON FOR CONTACT</label>
                <select value={reason} onChange={e => setReason(e.target.value)} className="w-full px-3 py-2 rounded-lg text-sm" style={inputStyle}>
                  {REASONS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs mb-1" style={{ color: '#6b7280', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.04em' }}>YOUR MESSAGE</label>
                <textarea value={message} onChange={e => setMessage(e.target.value)} rows={4}
                  placeholder="Tell us what's going on, including any dates, locations, or people involved"
                  className="w-full px-3 py-2 rounded-lg text-sm resize-none" style={inputStyle} />
              </div>

              <label className="flex items-center gap-2 text-xs pt-1" style={{ color: '#6b7280' }}>
                <input type="checkbox" checked={confidential} onChange={e => setConfidential(e.target.checked)} />
                Keep my identity confidential
              </label>

              {error && <p className="text-xs" style={{ color: '#dc2626' }}>{error}</p>}

              <button type="submit" disabled={sending}
                className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm text-white"
                style={{ backgroundColor: '#f97316', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.06em', opacity: sending ? 0.7 : 1 }}>
                {sending ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
                {sending ? 'SENDING…' : 'SEND MESSAGE'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', color: '#111827', outline: 'none',
};
