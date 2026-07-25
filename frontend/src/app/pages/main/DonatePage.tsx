import { useEffect, useRef, useState } from 'react';
import { Lock, CheckCircle2, Loader2, AlertCircle, ShieldCheck } from 'lucide-react';
import { donationApi, gatewayApi } from '../../lib/api';

declare global {
  interface Window {
    FlutterwaveCheckout?: (config: Record<string, unknown>) => { close: () => void };
  }
}

// ── Content — matches the approved reference design exactly ────────────────

const TIERS = [
  { name: 'Supporter', amount: 100, desc: 'Membership card, supporter listing, and regular monitoring updates.' },
  { name: 'Bronze', amount: 250, desc: 'AGM voting rights, a free branded t-shirt, and early access to monitoring reports.' },
  { name: 'Silver', amount: 1000, desc: 'Named as sponsor of a monitoring agent, with a certificate of appreciation.' },
  { name: 'Gold', amount: 5000, desc: 'Listed as a Gold Patron, funding multiple agents across constituencies.' },
  { name: 'Platinum', amount: 15000, desc: 'Priority input on monitoring regions, VIP invite to our annual launch event.' },
  { name: 'Diamond', amount: 25000, desc: 'Founding-level recognition on our permanent Founding Donors page.' },
];

const FUNDS_LIST = [
  'Stipends for trained, independent election monitoring agents',
  'Deployment logistics to constituencies across Zambia',
  'Reporting tools and data verification for real-time results tracking',
  'Public transparency reports published after every election',
];

const BANKS = [
  { label: 'ABSA Bank Zambia', account: '0012-345678-91', branch: 'Cairo Road, Lusaka', swift: 'BARCZMLU' },
  { label: 'FNB Zambia', account: '6234-5678-9012', branch: 'Kabulonga, Lusaka', swift: 'FIRSZMLX' },
  { label: 'Zanaco Bank', account: '3900-1234-5678', branch: 'Head Office, Lusaka', swift: 'ZNCOZMLU' },
];

const CREAM = '#F5F0E3';
const GREEN_DARK = '#0E2A1B';
const GOLD = '#CC9F3D';
const SERIF = "'Playfair Display', serif";
const MONO = "'IBM Plex Mono', monospace";

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '13px 16px', borderRadius: '10px',
  border: '1px solid #ddd5c2', backgroundColor: '#fff', fontSize: '14px',
  fontFamily: 'Open Sans, sans-serif', color: '#1a1a1a', outline: 'none',
};

let flwLoadPromise: Promise<boolean> | null = null;
function loadFlutterwaveScript(): Promise<boolean> {
  if (window.FlutterwaveCheckout) return Promise.resolve(true);
  if (flwLoadPromise) return flwLoadPromise;
  flwLoadPromise = new Promise(resolve => {
    document.querySelectorAll('script[src*="checkout.flutterwave.com"]').forEach(el => el.remove());
    const script = document.createElement('script');
    script.src = 'https://checkout.flutterwave.com/v3.js';
    script.async = true;
    let settled = false;
    const finish = (ok: boolean) => { if (!settled) { settled = true; resolve(ok); } };
    script.onload = () => {
      const deadline = Date.now() + 5000;
      const poll = () => {
        if (window.FlutterwaveCheckout) { finish(true); return; }
        if (Date.now() > deadline) { finish(false); return; }
        setTimeout(poll, 100);
      };
      poll();
    };
    script.onerror = () => finish(false);
    document.body.appendChild(script);
    setTimeout(() => finish(!!window.FlutterwaveCheckout), 8000);
  });
  return flwLoadPromise;
}

export function DonatePage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [nrc, setNrc] = useState('');
  const [citizen, setCitizen] = useState<'yes' | 'no'>('yes');
  const [declared, setDeclared] = useState(false);
  const [amount, setAmount] = useState<number | null>(100);
  const [customAmount, setCustomAmount] = useState('');
  const [recurring, setRecurring] = useState(false);
  const [showBank, setShowBank] = useState(false);

  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [showLinkFallback, setShowLinkFallback] = useState(false);
  const [pendingDonationId, setPendingDonationId] = useState('');
  const [done, setDone] = useState(false);
  const [gwPublicKey, setGwPublicKey] = useState('');

  useEffect(() => { gatewayApi.config().then(cfg => setGwPublicKey(cfg.publicKey || '')).catch(() => {}); }, []);

  const finalAmount = customAmount ? Number(customAmount) : amount;
  const formValid = name.trim() && email.trim() && phone.trim() && declared && finalAmount && finalAmount > 0;

  async function handleDonate() {
    if (!formValid) {
      setError('Please fill in your name, email, phone, choose an amount, and confirm the declaration.');
      return;
    }
    setProcessing(true);
    setError('');
    try {
      const { donation } = await donationApi.submit({
        name, email, phone, nrc, citizen, amount: finalAmount, recurring, method: 'card',
      });
      const donationId = (donation as { id: string }).id;

      let publicKey = gwPublicKey;
      let configErrorDetail = '';
      if (!publicKey) {
        // Retry twice with a short backoff — a single transient network
        // blip shouldn't fail the whole donation attempt when the backend
        // is otherwise healthy.
        for (let attempt = 0; attempt < 3 && !publicKey; attempt++) {
          if (attempt > 0) await new Promise(r => setTimeout(r, 500 * attempt));
          try {
            const cfg = await gatewayApi.config();
            publicKey = cfg.publicKey || '';
            if (publicKey) setGwPublicKey(publicKey);
            else configErrorDetail = 'backend responded but returned no public key — Flutterwave may not be configured on the backend.';
          } catch (cfgErr) {
            configErrorDetail = cfgErr instanceof Error ? cfgErr.message : 'unknown error contacting backend';
          }
        }
      }
      const scriptReady = publicKey ? await loadFlutterwaveScript() : false;
      if (!publicKey) {
        console.error('[donate] gateway config fetch failed after retries:', configErrorDetail);
        setError(`Could not reach BOZ's payment configuration. Please check your internet connection and try again. (Detail: ${configErrorDetail || 'unknown'})`);
        setProcessing(false);
        return;
      }
      if (!scriptReady || !window.FlutterwaveCheckout) {
        setError('The secure payment widget could not load — this is often an ad blocker or privacy extension blocking checkout.flutterwave.com.');
        setShowLinkFallback(true);
        setPendingDonationId(donationId);
        setProcessing(false);
        return;
      }

      window.FlutterwaveCheckout({
        public_key: publicKey,
        tx_ref: `boz-donation-${donationId}-${Date.now()}`,
        amount: finalAmount,
        currency: 'ZMW',
        payment_options: 'card,mobilemoneyzambia,ussd',
        customer: { email, name, phone_number: phone },
        customizations: {
          title: 'Build One Zambia',
          description: `K${finalAmount.toLocaleString()} donation — ${name}`,
        },
        callback: async (response: { status: string; transaction_id: number }) => {
          if (response.status !== 'successful' && response.status !== 'completed') {
            setError('Payment was not completed. Please try again.');
            setProcessing(false);
            return;
          }
          try {
            const res = await gatewayApi.verifyDonationCard({ transactionId: response.transaction_id, donationId });
            if (res.verified) setDone(true);
            else setError('Payment could not be verified. Please contact support if you were charged.');
          } catch {
            setError('Verification failed. Please contact support if you were charged.');
          } finally {
            setProcessing(false);
          }
        },
        onclose: () => setProcessing(false),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      setProcessing(false);
    }
  }

  async function handlePayViaLink() {
    setProcessing(true);
    setError('');
    try {
      const res = await gatewayApi.checkoutLink({ type: 'donation', id: pendingDonationId, name, email, phone });
      if (res.success && res.link) window.location.href = res.link;
      else { setError(res.error || 'Could not create a payment link.'); setProcessing(false); }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create a payment link.');
      setProcessing(false);
    }
  }

  if (done) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: CREAM, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div style={{ maxWidth: '440px', textAlign: 'center' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', backgroundColor: GREEN_DARK, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <CheckCircle2 color={GOLD} size={30} />
          </div>
          <h1 style={{ fontFamily: SERIF, fontSize: '1.8rem', fontWeight: 700, color: '#1a1a1a', marginBottom: '10px' }}>Thank you for your support.</h1>
          <p style={{ color: '#5a5648', fontSize: '15px', lineHeight: 1.7 }}>
            Your K{finalAmount?.toLocaleString()} donation has been received. A receipt has been sent to {email}.
          </p>
          <button
            onClick={() => { setDone(false); setName(''); setEmail(''); setPhone(''); setNrc(''); setDeclared(false); setAmount(100); setCustomAmount(''); }}
            style={{ marginTop: '24px', padding: '12px 28px', borderRadius: '10px', border: 'none', backgroundColor: GREEN_DARK, color: '#fff', fontFamily: MONO, fontSize: '13px', cursor: 'pointer' }}
          >
            DONATE AGAIN
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: CREAM, minHeight: '100vh', fontFamily: 'Open Sans, sans-serif' }}>

      {/* ── Hero ── */}
      <section style={{ position: 'relative', overflow: 'hidden', backgroundColor: GREEN_DARK, padding: '72px 20px 56px' }}>
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.5, pointerEvents: 'none',
          backgroundImage: 'repeating-radial-gradient(circle at 82% 30%, transparent 0, transparent 40px, rgba(255,255,255,0.025) 41px)',
        }} />
        <div style={{ position: 'relative', maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
          <h1 style={{ fontFamily: SERIF, fontSize: 'clamp(2.2rem, 6vw, 3.4rem)', lineHeight: 1.15, color: '#fff', marginBottom: '4px' }}>
            Fund the watch.
          </h1>
          <h1 style={{ fontFamily: SERIF, fontSize: 'clamp(2.2rem, 6vw, 3.4rem)', lineHeight: 1.15, fontStyle: 'italic', fontWeight: 500, color: GOLD, marginBottom: '24px' }}>
            Protect the vote.
          </h1>

          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '15px', lineHeight: 1.8, maxWidth: '620px', margin: '0 auto' }}>
            Every donation puts a trained, independent monitor at a polling station.
            Help us keep Zambia's elections transparent, counted, and accountable
            — from now through 2026 and every election after it.
          </p>
        </div>
      </section>

      {/* ── Form + Sidebar ── */}
      <section style={{ padding: '0 20px 96px' }}>
        <div style={{ maxWidth: '1080px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'minmax(0,1fr)', gap: '28px', transform: 'translateY(-1px)' }} className="donate-grid">

          {/* Form card */}
          <div style={{ backgroundColor: '#fff', borderRadius: '0 0 16px 16px', padding: '40px 32px', boxShadow: '0 20px 50px rgba(14,42,27,0.12)' }}>
            <p style={{ fontFamily: MONO, fontSize: '11px', letterSpacing: '0.2em', color: GOLD, marginBottom: '8px' }}>MAKE A DONATION</p>
            <h2 style={{ fontFamily: SERIF, fontSize: '1.6rem', fontWeight: 700, color: '#1a1a1a', marginBottom: '8px' }}>Donate now</h2>
            <p style={{ color: '#7a7566', fontSize: '13px', marginBottom: '24px' }}>Your contribution funds election monitoring agents on the ground.</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '20px' }}>
              <div>
                <label style={{ display: 'block', fontFamily: MONO, fontSize: '10.5px', letterSpacing: '0.08em', color: '#8a8470', marginBottom: '6px' }}>YOUR NAME*</label>
                <input style={inputStyle} value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Vincent Kafula" />
              </div>
              <div>
                <label style={{ display: 'block', fontFamily: MONO, fontSize: '10.5px', letterSpacing: '0.08em', color: '#8a8470', marginBottom: '6px' }}>YOUR EMAIL ADDRESS*</label>
                <input type="email" style={inputStyle} value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" />
              </div>
              <div>
                <label style={{ display: 'block', fontFamily: MONO, fontSize: '10.5px', letterSpacing: '0.08em', color: '#8a8470', marginBottom: '6px' }}>YOUR CELLPHONE*</label>
                <input style={inputStyle} value={phone} onChange={e => setPhone(e.target.value)} placeholder="+260 9XX XXX XXX" />
              </div>
              <div>
                <label style={{ display: 'block', fontFamily: MONO, fontSize: '10.5px', letterSpacing: '0.08em', color: '#8a8470', marginBottom: '6px' }}>YOUR NRC NUMBER</label>
                <input style={inputStyle} value={nrc} onChange={e => setNrc(e.target.value)} placeholder="XXXXXX/XX/X" />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '4px' }}>
                {(['yes', 'no'] as const).map(v => (
                  <label key={v} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer', fontFamily: MONO, fontSize: '11.5px', letterSpacing: '0.03em', color: '#3a3628' }}>
                    <input type="radio" checked={citizen === v} onChange={() => setCitizen(v)} style={{ marginTop: '3px', accentColor: GREEN_DARK }} />
                    {v === 'yes' ? 'I AM A ZAMBIAN CITIZEN OR PERMANENT RESIDENT' : 'I AM NOT A ZAMBIAN CITIZEN OR PERMANENT RESIDENT'}
                  </label>
                ))}
              </div>

              <div style={{ backgroundColor: '#F5F0E3', border: '1px solid #e6dfc9', borderRadius: '10px', padding: '16px', fontSize: '12.5px', color: '#5a5648', lineHeight: 1.7 }}>
                By ticking this box I declare that the information I have provided is true and correct, that I am
                making this donation in support of Build One Zambia's election monitoring mission, and that these
                funds are not the proceeds of a crime.
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontFamily: MONO, fontSize: '11.5px', letterSpacing: '0.03em', color: '#3a3628' }}>
                <input type="checkbox" checked={declared} onChange={e => setDeclared(e.target.checked)} style={{ accentColor: GREEN_DARK }} />
                I CONFIRM THE ABOVE DECLARATION
              </label>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <label style={{ fontFamily: MONO, fontSize: '10.5px', letterSpacing: '0.08em', color: '#8a8470' }}>SELECT AMOUNT (ZMW)</label>
              <span style={{ fontSize: '11px', color: '#b5ae98' }}>tap to choose</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '14px' }}>
              {TIERS.map(t => {
                const selected = !customAmount && amount === t.amount;
                return (
                  <button
                    key={t.name}
                    type="button"
                    onClick={() => { setAmount(t.amount); setCustomAmount(''); }}
                    style={{
                      padding: '12px 8px', borderRadius: '10px', textAlign: 'left', cursor: 'pointer',
                      border: `1.5px solid ${selected ? GREEN_DARK : '#e6dfc9'}`,
                      backgroundColor: selected ? '#eef2ec' : '#fff',
                    }}
                  >
                    <p style={{ fontFamily: SERIF, fontWeight: 700, fontSize: '0.95rem', color: '#1a1a1a', margin: 0 }}>K{t.amount.toLocaleString()}</p>
                    <p style={{ fontFamily: MONO, fontSize: '9.5px', letterSpacing: '0.05em', color: '#8a8470', margin: '3px 0 0' }}>{t.name.toUpperCase()}</p>
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => setCustomAmount(c => (c ? '' : ' '))}
              style={{ width: '100%', padding: '13px', borderRadius: '10px', border: 'none', backgroundColor: GREEN_DARK, color: '#fff', fontFamily: MONO, fontSize: '12.5px', letterSpacing: '0.06em', cursor: 'pointer', marginBottom: customAmount ? '10px' : '18px' }}
            >
              OTHER AMOUNT
            </button>
            {customAmount && (
              <div style={{ display: 'flex', alignItems: 'center', border: '1.5px solid #e6dfc9', borderRadius: '10px', overflow: 'hidden', marginBottom: '18px' }}>
                <span style={{ backgroundColor: GREEN_DARK, color: '#fff', padding: '13px 16px', fontFamily: MONO, fontSize: '13px' }}>K</span>
                <input
                  value={customAmount.trim()}
                  onChange={e => setCustomAmount(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter your own amount"
                  style={{ flex: 1, border: 'none', padding: '13px 16px', fontSize: '14px', outline: 'none' }}
                />
              </div>
            )}

            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontFamily: MONO, fontSize: '11.5px', letterSpacing: '0.03em', color: '#3a3628', marginBottom: '20px' }}>
              <input type="checkbox" checked={recurring} onChange={e => setRecurring(e.target.checked)} style={{ accentColor: GREEN_DARK }} />
              MAKE THIS A MONTHLY RECURRING DONATION
            </label>

            {error && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', backgroundColor: '#fdf2f2', border: '1px solid #f3caca', borderRadius: '10px', padding: '12px 14px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                  <AlertCircle size={14} color="#dc2626" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <p style={{ fontSize: '12.5px', color: '#991b1b', margin: 0 }}>{error}</p>
                </div>
                {showLinkFallback && (
                  <button type="button" onClick={handlePayViaLink} disabled={processing}
                    style={{ alignSelf: 'flex-start', background: 'none', border: '1px solid #dc2626', color: '#dc2626', borderRadius: '8px', padding: '8px 14px', fontFamily: MONO, fontSize: '11px', cursor: 'pointer' }}>
                    {processing ? 'OPENING…' : 'TRY A DIFFERENT SECURE PAYMENT LINK →'}
                  </button>
                )}
              </div>
            )}

            <button
              type="button"
              onClick={handleDonate}
              disabled={processing}
              style={{
                width: '100%', padding: '16px', borderRadius: '10px', border: 'none',
                backgroundColor: GOLD, color: '#1a1200', fontFamily: MONO, fontWeight: 600,
                fontSize: '13.5px', letterSpacing: '0.08em', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                opacity: processing ? 0.75 : 1,
              }}
            >
              {processing ? <Loader2 size={15} className="animate-spin" /> : null}
              {processing ? 'PROCESSING…' : 'DONATE NOW →'}
            </button>
            <p style={{ textAlign: 'center', fontSize: '11.5px', color: '#9a9482', marginTop: '12px' }}>
              Processed securely by Flutterwave. Build One Zambia does not store your card details.
            </p>
            <p style={{ textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '11px', color: '#b5ae98', marginTop: '6px' }}>
              <Lock size={11} /> 256-BIT ENCRYPTED CHECKOUT
            </p>
          </div>

          {/* Sidebar */}
          <div style={{ paddingTop: '40px' }}>
            <h3 style={{ fontFamily: SERIF, fontSize: '1.4rem', fontWeight: 700, color: '#1a1a1a', marginBottom: '16px' }}>Why your donation matters</h3>
            <p style={{ color: '#5a5648', fontSize: '14px', lineHeight: 1.85, marginBottom: '16px' }}>
              Build One Zambia trains and deploys independent monitoring agents to polling stations across the
              country. We are currently in the process of formation as a political party, and are not affiliated
              with any other political party — our monitoring work stands on its own, focused on a transparent,
              verifiable count that every Zambian can trust.
            </p>
            <p style={{ color: '#5a5648', fontSize: '14px', lineHeight: 1.85, marginBottom: '32px' }}>
              Election periods are short but decisive. Your donation, however small, puts real people at real
              polling stations, watching, recording, and reporting — so that results reflect the will of the
              people, not the convenience of the powerful.
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <span style={{ width: '16px', height: '2px', backgroundColor: GOLD }} />
              <h4 style={{ fontFamily: SERIF, fontSize: '1.05rem', fontWeight: 700, color: '#1a1a1a', margin: 0 }}>Donation tiers &amp; recognition</h4>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '36px' }}>
              {TIERS.map((t, i) => (
                <div key={t.name} style={{ display: 'flex', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(14,42,27,0.06)' }}>
                  <div style={{
                    flexShrink: 0, width: '92px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '14px 8px',
                    backgroundColor: i < 2 ? GREEN_DARK : GOLD, color: i < 2 ? '#fff' : '#1a1200',
                  }}>
                    <span style={{ fontFamily: MONO, fontSize: '9px', letterSpacing: '0.1em', opacity: 0.75 }}>TIER</span>
                    <span style={{ fontFamily: MONO, fontSize: '13px', fontWeight: 600 }}>K{t.amount.toLocaleString()}</span>
                  </div>
                  <div style={{ flex: 1, backgroundColor: '#fff', padding: '14px 16px' }}>
                    <p style={{ fontFamily: SERIF, fontWeight: 700, fontSize: '0.95rem', color: '#1a1a1a', margin: '0 0 4px' }}>{t.name}</p>
                    <p style={{ fontSize: '12.5px', color: '#7a7566', lineHeight: 1.6, margin: 0 }}>{t.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <span style={{ width: '16px', height: '2px', backgroundColor: GOLD }} />
              <h4 style={{ fontFamily: SERIF, fontSize: '1.05rem', fontWeight: 700, color: '#1a1a1a', margin: 0 }}>What your donation funds</h4>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', marginBottom: '28px' }}>
              {FUNDS_LIST.map((item, i) => (
                <div key={item} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', padding: '11px 0', borderBottom: i < FUNDS_LIST.length - 1 ? '1px solid #e6dfc9' : 'none' }}>
                  <CheckCircle2 size={15} color={GREEN_DARK} style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span style={{ fontSize: '13.5px', color: '#3a3628' }}>{item}</span>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setShowBank(v => !v)}
              style={{ background: 'none', border: 'none', padding: 0, color: GREEN_DARK, fontWeight: 600, fontSize: '13.5px', textDecoration: 'underline', cursor: 'pointer' }}
            >
              Prefer to make an offline donation? →
            </button>
            {showBank && (
              <div style={{ marginTop: '18px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {BANKS.map(b => (
                  <div key={b.label} style={{ backgroundColor: '#fff', borderRadius: '10px', padding: '14px 16px', fontSize: '12.5px', color: '#3a3628', boxShadow: '0 2px 8px rgba(14,42,27,0.06)' }}>
                    <p style={{ fontWeight: 700, marginBottom: '4px' }}>{b.label}</p>
                    <p style={{ margin: '2px 0', color: '#7a7566' }}>Account: {b.account}</p>
                    <p style={{ margin: '2px 0', color: '#7a7566' }}>Branch: {b.branch} · SWIFT: {b.swift}</p>
                  </div>
                ))}
                <p style={{ fontSize: '12px', color: '#8a8470', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ShieldCheck size={13} /> Please email your deposit slip to info@bozplans.org for a receipt.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      <style>{`
        @media (min-width: 900px) {
          .donate-grid { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>
    </div>
  );
}

export default DonatePage;
