import React, { useState, CSSProperties } from 'react';
import {
  CreditCard, Building2, Smartphone,
  ChevronRight, ChevronLeft, CheckCircle,
  Heart, Lock, AlertCircle, Copy, Check,
} from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────

type Step       = 1 | 2 | 3 | 4;
type Category   = 'card' | 'bank' | 'mobile';
type CardBrand  = 'visa' | 'mastercard' | 'amex';
type BankKey    = 'absa' | 'fnb' | 'zanaco';
type MobileKey  = 'airtel' | 'zamtel' | 'mtn';

interface State {
  // step 1
  tier: string;
  custom: string;
  name: string;
  email: string;
  // step 2
  category: Category | '';
  // step 3 – card
  cardBrand: CardBrand | '';
  cardNum: string;
  cardName: string;
  cardExpiry: string;
  cardCvv: string;
  // step 3 – bank
  bank: BankKey | '';
  bankHolder: string;
  bankRef: string;
  // step 3 – mobile
  net: MobileKey | '';
  phone: string;
  txRef: string;
}

const INIT: State = {
  tier: '', custom: '', name: '', email: '',
  category: '',
  cardBrand: '', cardNum: '', cardName: '', cardExpiry: '', cardCvv: '',
  bank: '', bankHolder: '', bankRef: '',
  net: '', phone: '', txRef: '',
};

// ── Static data ───────────────────────────────────────────────────────────────

const TIERS = [
  { amount: 'K100',   label: 'Supporter', perks: 'Campaign badge & newsletter' },
  { amount: 'K500',   label: 'Advocate',  perks: 'Badge, newsletter & signed poster' },
  { amount: 'K1,000', label: 'Champion',  perks: 'All above + rally invitation' },
  { amount: 'K5,000', label: 'Patron',    perks: 'All above + leadership meet & greet' },
];

const BANKS: Record<BankKey, { label: string; account: string; branch: string; swift: string; color: string }> = {
  absa:   { label: 'ABSA Bank Zambia', account: '0012-345678-91',  branch: 'Cairo Road, Lusaka',   swift: 'BARCZMLU', color: '#e00a1a' },
  fnb:    { label: 'FNB Zambia',       account: '6234-5678-9012',  branch: 'Kabulonga, Lusaka',    swift: 'FIRSZMLX', color: '#009900' },
  zanaco: { label: 'Zanaco Bank',      account: '3900-1234-5678',  branch: 'Head Office, Lusaka',  swift: 'ZNCOZMLU', color: '#005bac' },
};

const NETS: Record<MobileKey, { label: string; ussd: string; payNum: string; color: string; dark: boolean }> = {
  airtel: { label: 'Airtel Money', ussd: '*115#', payNum: '0970-000-000', color: '#e2001a', dark: false },
  zamtel: { label: 'Zamtel Money', ussd: '*322#', payNum: '0950-000-000', color: '#009245', dark: false },
  mtn:    { label: 'MTN Money',    ussd: '*303#', payNum: '0960-000-000', color: '#ffc000', dark: true  },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatCardNum(raw: string, brand: CardBrand | ''): string {
  const digits = raw.replace(/\D/g, '');
  const max    = brand === 'amex' ? 15 : 16;
  const s      = digits.slice(0, max);
  if (brand === 'amex') {
    return s.replace(/^(\d{0,4})(\d{0,6})(\d{0,5})$/, (_, a, b, c) =>
      [a, b, c].filter(Boolean).join(' '));
  }
  return s.replace(/(\d{4})(?=\d)/g, '$1 ');
}

function formatExpiry(raw: string): string {
  const d = raw.replace(/\D/g, '').slice(0, 4);
  return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
}

function displayAmount(s: State): string {
  return s.tier === 'custom' ? `K${s.custom || '0'}` : s.tier;
}

// ── Shared styles ─────────────────────────────────────────────────────────────

const INP: CSSProperties = {
  backgroundColor: '#0d0d0d',
  border: '1px solid #2a2a2a',
  color: '#fff',
  padding: '12px 16px',
  width: '100%',
  fontFamily: 'Open Sans, sans-serif',
  fontSize: '14px',
  outline: 'none',
};

// ── Sub-components ────────────────────────────────────────────────────────────

function CopyBtn({ text }: { text: string }) {
  const [ok, setOk] = useState(false);
  return (
    <button
      type="button"
      onClick={() => { navigator.clipboard.writeText(text); setOk(true); setTimeout(() => setOk(false), 2000); }}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: '4px',
        padding: '2px 8px', fontSize: '11px', border: 'none', borderRadius: '3px', cursor: 'pointer',
        backgroundColor: ok ? 'rgba(220,38,38,0.15)' : 'rgba(255,255,255,0.06)',
        color: ok ? '#dc2626' : '#9ca3af',
      }}
    >
      {ok ? <Check size={11} /> : <Copy size={11} />}
      {ok ? 'Copied' : 'Copy'}
    </button>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #1a1a1a' }}>
      <span style={{ color: '#6b7280', fontSize: '12px', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.06em' }}>{label}</span>
      <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ color: '#e5e7eb', fontSize: '13px' }}>{value}</span>
        <CopyBtn text={value} />
      </span>
    </div>
  );
}

function VisaLogo() {
  return (
    <div style={{ backgroundColor: '#fff', borderRadius: '4px', padding: '2px 6px', display: 'inline-flex', alignItems: 'center' }}>
      <span style={{ fontFamily: 'Oswald, sans-serif', fontWeight: 700, fontSize: '0.85rem', color: '#1a1f71', letterSpacing: '-0.02em' }}>VISA</span>
    </div>
  );
}

function MCLogo({ size = 20 }: { size?: number }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center' }}>
      <span style={{ width: size, height: size, borderRadius: '50%', backgroundColor: '#eb001b', display: 'inline-block' }} />
      <span style={{ width: size, height: size, borderRadius: '50%', backgroundColor: '#f79e1b', display: 'inline-block', marginLeft: -(size * 0.4) }} />
    </span>
  );
}

function AmexLogo() {
  return (
    <div style={{ backgroundColor: '#2e77bc', borderRadius: '4px', padding: '2px 6px', display: 'inline-flex', alignItems: 'center' }}>
      <span style={{ fontFamily: 'Oswald, sans-serif', fontWeight: 700, fontSize: '0.65rem', color: '#fff', letterSpacing: '0.04em' }}>AMEX</span>
    </div>
  );
}

function BrandTag({ color, label, dark = false }: { color: string; label: string; dark?: boolean }) {
  return (
    <div style={{ backgroundColor: color, borderRadius: '3px', padding: '2px 7px', display: 'inline-flex', alignItems: 'center' }}>
      <span style={{ fontFamily: 'Oswald, sans-serif', fontWeight: 700, fontSize: '0.6rem', color: dark ? '#111' : '#fff', letterSpacing: '0.04em' }}>
        {label}
      </span>
    </div>
  );
}

// ── Step indicator ────────────────────────────────────────────────────────────

function StepBar({ step }: { step: Step }) {
  const labels = ['Amount', 'Method', 'Details', 'Confirm'];
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '40px' }}>
      {labels.map((label, i) => {
        const n    = (i + 1) as Step;
        const done = step > n;
        const cur  = step === n;
        return (
          <React.Fragment key={label}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: i < labels.length - 1 ? '0 0 auto' : undefined }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                backgroundColor: done || cur ? '#dc2626' : '#1a1a1a',
                border: `2px solid ${done || cur ? '#dc2626' : '#333'}`,
                color: done || cur ? '#fff' : '#6b7280',
                fontFamily: 'Oswald, sans-serif', fontWeight: 600, fontSize: '13px',
              }}>
                {done ? <Check size={14} /> : n}
              </div>
              <span style={{ marginTop: '4px', fontSize: '11px', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.06em', whiteSpace: 'nowrap', color: cur ? '#dc2626' : done ? '#9ca3af' : '#4b5563' }}>
                {label}
              </span>
            </div>
            {i < labels.length - 1 && (
              <div style={{ flex: 1, height: '2px', backgroundColor: step > n ? '#dc2626' : '#2a2a2a', marginTop: '15px', marginLeft: '6px', marginRight: '6px' }} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ── Card preview ──────────────────────────────────────────────────────────────

function CardPreview({ s }: { s: State }) {
  return (
    <div style={{
      position: 'relative', background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      borderRadius: '14px', padding: '24px', maxWidth: '320px', margin: '0 auto 24px',
      aspectRatio: '1.586 / 1', overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 80% 20%, rgba(255,255,255,0.08) 0%, transparent 50%)' }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div style={{ width: 40, height: 28, borderRadius: '4px', background: 'linear-gradient(135deg, #d4a843, #f0c960)' }} />
        {s.cardBrand === 'visa'       && <VisaLogo />}
        {s.cardBrand === 'mastercard' && <MCLogo size={22} />}
        {s.cardBrand === 'amex'       && <AmexLogo />}
        {!s.cardBrand && <CreditCard size={22} color="rgba(255,255,255,0.3)" />}
      </div>
      <p style={{ fontFamily: 'monospace', fontSize: '1.05rem', letterSpacing: '0.18em', color: '#fff', marginBottom: '20px' }}>
        {s.cardNum || (s.cardBrand === 'amex' ? '•••• •••••• •••••' : '•••• •••• •••• ••••')}
      </p>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <p style={{ fontSize: '9px', color: 'rgba(255,255,255,0.45)', letterSpacing: '0.08em', fontFamily: 'Oswald, sans-serif', marginBottom: '2px' }}>CARD HOLDER</p>
          <p style={{ fontSize: '13px', color: '#fff', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.06em' }}>{s.cardName || 'YOUR NAME'}</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontSize: '9px', color: 'rgba(255,255,255,0.45)', letterSpacing: '0.08em', fontFamily: 'Oswald, sans-serif', marginBottom: '2px' }}>EXPIRES</p>
          <p style={{ fontSize: '13px', color: '#fff', fontFamily: 'Oswald, sans-serif' }}>{s.cardExpiry || 'MM/YY'}</p>
        </div>
      </div>
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────

export function DonationFlow() {
  const [step, setStep] = useState<Step>(1);
  const [done, setDone] = useState(false);
  const [s, setS]       = useState<State>(INIT);

  const set = (k: keyof State, v: string) => setS(prev => ({ ...prev, [k]: v }));
  const amt = displayAmount(s);

  // ── Success screen ──────────────────────────────────────────────────────────

  if (done) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 24px' }}>
        <div style={{ width: 80, height: 80, borderRadius: '50%', backgroundColor: 'rgba(220,38,38,0.12)', border: '1px solid rgba(220,38,38,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
          <Heart size={38} color="#dc2626" />
        </div>
        <h3 style={{ fontFamily: 'Oswald, sans-serif', fontSize: '2rem', letterSpacing: '0.04em', color: '#fff', marginBottom: '12px' }}>THANK YOU!</h3>
        <p style={{ color: '#9ca3af', fontSize: '15px', lineHeight: 1.8, maxWidth: '420px', margin: '0 auto 8px' }}>
          Your donation of <strong style={{ color: '#fff' }}>{amt}</strong> is being processed. A receipt will be sent to <strong style={{ color: '#fff' }}>{s.email}</strong>.
        </p>
        <p style={{ color: '#6b7280', fontSize: '13px', marginBottom: '32px' }}>Together we build One Zambia. Thank you for your support.</p>
        <button
          onClick={() => { setDone(false); setStep(1); setS(INIT); }}
          style={{ backgroundColor: '#dc2626', color: '#fff', border: 'none', padding: '12px 32px', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.1em', fontSize: '14px', cursor: 'pointer' }}
        >
          DONATE AGAIN
        </button>
      </div>
    );
  }

  // ── Validation helpers ──────────────────────────────────────────────────────

  const step1ok = (s.tier !== '' && (s.tier !== 'custom' || s.custom !== '')) && s.name !== '' && s.email !== '';
  const step3ok =
    s.category === 'card'   ? (s.cardBrand !== '' && s.cardNum !== '' && s.cardName !== '' && s.cardExpiry !== '' && s.cardCvv !== '') :
    s.category === 'bank'   ? (s.bank !== '' && s.bankHolder !== '') :
    s.category === 'mobile' ? (s.net !== '' && s.phone !== '') : false;

  const methodLabel =
    s.category === 'card'   ? `${s.cardBrand === 'amex' ? 'American Express' : s.cardBrand === 'mastercard' ? 'Mastercard' : 'Visa'} ····${s.cardNum.replace(/\s/g, '').slice(-4)}` :
    s.category === 'bank'   ? `Bank Transfer — ${s.bank ? BANKS[s.bank].label : ''}` :
    s.category === 'mobile' ? `${s.net ? NETS[s.net].label : ''} (+260 ${s.phone})` : '';

  // ── Shared button styles ────────────────────────────────────────────────────

  const btnBack: CSSProperties = {
    display: 'inline-flex', alignItems: 'center', gap: '6px',
    padding: '12px 20px', cursor: 'pointer',
    backgroundColor: '#111', color: '#9ca3af', border: '1px solid #2a2a2a',
    fontFamily: 'Oswald, sans-serif', letterSpacing: '0.08em', fontSize: '13px',
  };
  const btnNext = (disabled: boolean): CSSProperties => ({
    flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
    padding: '13px 24px', cursor: disabled ? 'not-allowed' : 'pointer',
    backgroundColor: '#dc2626', color: '#fff', border: 'none',
    fontFamily: 'Oswald, sans-serif', letterSpacing: '0.1em', fontSize: '13px',
    opacity: disabled ? 0.45 : 1,
  });

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto' }}>
      <StepBar step={step} />

      {/* ══════════════════════════════════════════════════════════════════════
          STEP 1 — Amount & donor info
      ══════════════════════════════════════════════════════════════════════ */}
      {step === 1 && (
        <div>
          <h3 style={{ fontFamily: 'Oswald, sans-serif', fontSize: '1.4rem', letterSpacing: '0.04em', color: '#fff', marginBottom: '6px' }}>CHOOSE YOUR AMOUNT</h3>
          <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '28px' }}>Every kwacha goes directly to grassroots outreach across all 10 provinces.</p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '16px' }}>
            {TIERS.map(t => (
              <button
                key={t.amount}
                type="button"
                onClick={() => set('tier', t.amount)}
                style={{
                  padding: '16px', textAlign: 'left', cursor: 'pointer', border: 'none',
                  backgroundColor: s.tier === t.amount ? 'rgba(220,38,38,0.15)' : '#111',
                  outline: `1px solid ${s.tier === t.amount ? '#dc2626' : '#1f1f1f'}`,
                }}
              >
                <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: '1.3rem', color: '#dc2626' }}>{t.amount}</div>
                <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: '0.75rem', letterSpacing: '0.06em', color: '#fff', margin: '3px 0' }}>{t.label}</div>
                <div style={{ fontSize: '11px', color: '#6b7280', lineHeight: 1.5 }}>{t.perks}</div>
              </button>
            ))}
          </div>

          {/* Custom amount toggle */}
          <button
            type="button"
            onClick={() => set('tier', s.tier === 'custom' ? '' : 'custom')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.06em', fontSize: '13px', color: s.tier === 'custom' ? '#dc2626' : '#9ca3af', marginBottom: '10px', padding: 0 }}
          >
            {s.tier === 'custom' ? '▶ CUSTOM AMOUNT' : '+ ENTER CUSTOM AMOUNT'}
          </button>

          {s.tier === 'custom' && (
            <div style={{ position: 'relative', marginBottom: '20px' }}>
              <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#dc2626', fontFamily: 'Oswald, sans-serif', fontWeight: 700 }}>K</span>
              <input type="number" min="10" placeholder="Enter amount" style={{ ...INP, paddingLeft: '32px' }} value={s.custom} onChange={e => set('custom', e.target.value)} />
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
            <input required style={INP} placeholder="Full name" value={s.name} onChange={e => set('name', e.target.value)} />
            <input required type="email" style={INP} placeholder="Email address" value={s.email} onChange={e => set('email', e.target.value)} />
          </div>

          <button type="button" disabled={!step1ok} onClick={() => setStep(2)} style={btnNext(!step1ok)}>
            CONTINUE <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          STEP 2 — Payment method
      ══════════════════════════════════════════════════════════════════════ */}
      {step === 2 && (
        <div>
          <h3 style={{ fontFamily: 'Oswald, sans-serif', fontSize: '1.4rem', letterSpacing: '0.04em', color: '#fff', marginBottom: '6px' }}>SELECT PAYMENT METHOD</h3>
          <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '28px' }}>
            Donating <span style={{ color: '#dc2626' }}>{amt}</span> — choose how you'd like to pay.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
            {/* Card */}
            {([
              {
                cat: 'card' as Category,
                icon: <CreditCard size={24} color="#9ca3af" />,
                title: 'Card Payment',
                sub: 'Visa · Mastercard · American Express',
                logos: <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><VisaLogo /><MCLogo size={18} /><AmexLogo /></span>,
              },
              {
                cat: 'bank' as Category,
                icon: <Building2 size={24} color="#9ca3af" />,
                title: 'Bank Transfer',
                sub: 'ABSA Bank · FNB · Zanaco',
                logos: (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <BrandTag color="#e00a1a" label="ABSA" />
                    <BrandTag color="#009900" label="FNB" />
                    <BrandTag color="#005bac" label="ZANACO" />
                  </span>
                ),
              },
              {
                cat: 'mobile' as Category,
                icon: <Smartphone size={24} color="#9ca3af" />,
                title: 'Mobile Money',
                sub: 'Airtel Money · Zamtel Money · MTN Money',
                logos: (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <BrandTag color="#e2001a" label="AIRTEL" />
                    <BrandTag color="#009245" label="ZAMTEL" />
                    <BrandTag color="#ffc000" label="MTN" dark />
                  </span>
                ),
              },
            ]).map(({ cat, icon, title, sub, logos }) => (
              <button
                key={cat}
                type="button"
                onClick={() => set('category', cat)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '16px', padding: '18px 20px',
                  textAlign: 'left', cursor: 'pointer', border: 'none',
                  backgroundColor: s.category === cat ? 'rgba(220,38,38,0.1)' : '#111',
                  outline: `1px solid ${s.category === cat ? '#dc2626' : '#1f1f1f'}`,
                }}
              >
                <div style={{ width: 48, height: 48, flexShrink: 0, backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: '1rem', letterSpacing: '0.06em', color: '#fff' }}>{title}</div>
                  <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>{sub}</div>
                </div>
                {logos}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button type="button" onClick={() => setStep(1)} style={btnBack}><ChevronLeft size={15} /> BACK</button>
            <button type="button" disabled={!s.category} onClick={() => setStep(3)} style={btnNext(!s.category)}>CONTINUE <ChevronRight size={16} /></button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          STEP 3 — Payment details
      ══════════════════════════════════════════════════════════════════════ */}
      {step === 3 && (
        <div>
          {/* ── Card ── */}
          {s.category === 'card' && (
            <>
              <h3 style={{ fontFamily: 'Oswald, sans-serif', fontSize: '1.4rem', letterSpacing: '0.04em', color: '#fff', marginBottom: '6px' }}>CARD DETAILS</h3>
              <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '24px' }}>Secure payment — card details are never stored.</p>

              <p style={{ fontFamily: 'Oswald, sans-serif', fontSize: '11px', letterSpacing: '0.15em', color: '#dc2626', marginBottom: '12px' }}>SELECT CARD TYPE</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '20px' }}>
                {(['visa', 'mastercard', 'amex'] as CardBrand[]).map(brand => (
                  <button
                    key={brand}
                    type="button"
                    onClick={() => set('cardBrand', brand)}
                    style={{
                      padding: '14px 8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
                      cursor: 'pointer', border: 'none',
                      backgroundColor: s.cardBrand === brand ? 'rgba(220,38,38,0.1)' : '#111',
                      outline: `1px solid ${s.cardBrand === brand ? '#dc2626' : '#1f1f1f'}`,
                    }}
                  >
                    {brand === 'visa'       && <div style={{ backgroundColor: '#fff', borderRadius: '4px', padding: '4px 10px' }}><span style={{ fontFamily: 'Oswald, sans-serif', fontWeight: 700, fontSize: '1rem', color: '#1a1f71' }}>VISA</span></div>}
                    {brand === 'mastercard' && <div style={{ backgroundColor: '#1a1a1a', borderRadius: '4px', padding: '4px 10px' }}><MCLogo size={20} /></div>}
                    {brand === 'amex'       && <div style={{ backgroundColor: '#2e77bc', borderRadius: '4px', padding: '4px 10px' }}><span style={{ fontFamily: 'Oswald, sans-serif', fontWeight: 700, fontSize: '0.75rem', color: '#fff', letterSpacing: '0.04em' }}>AMEX</span></div>}
                    <span style={{ fontSize: '11px', color: '#9ca3af', fontFamily: 'Oswald, sans-serif' }}>
                      {brand === 'visa' ? 'Visa' : brand === 'mastercard' ? 'Mastercard' : 'Amex'}
                    </span>
                  </button>
                ))}
              </div>

              <CardPreview s={s} />

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
                <div style={{ position: 'relative' }}>
                  <input
                    style={INP} placeholder="Card number"
                    value={s.cardNum}
                    onChange={e => set('cardNum', formatCardNum(e.target.value, s.cardBrand))}
                    maxLength={s.cardBrand === 'amex' ? 17 : 19}
                  />
                  <div style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)' }}>
                    {s.cardBrand === 'visa' && <VisaLogo />}
                    {s.cardBrand === 'mastercard' && <MCLogo size={18} />}
                    {s.cardBrand === 'amex' && <AmexLogo />}
                    {!s.cardBrand && <CreditCard size={18} color="#4b5563" />}
                  </div>
                </div>
                <input style={INP} placeholder="Name on card" value={s.cardName} onChange={e => set('cardName', e.target.value.toUpperCase())} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <input style={INP} placeholder="MM / YY" value={s.cardExpiry} onChange={e => set('cardExpiry', formatExpiry(e.target.value))} maxLength={5} />
                  <div style={{ position: 'relative' }}>
                    <input type="password" style={INP} placeholder={s.cardBrand === 'amex' ? 'CID (4 digits)' : 'CVV (3 digits)'} value={s.cardCvv} onChange={e => set('cardCvv', e.target.value.replace(/\D/g, '').slice(0, s.cardBrand === 'amex' ? 4 : 3))} maxLength={s.cardBrand === 'amex' ? 4 : 3} />
                    <Lock size={15} color="#4b5563" style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '12px', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid #1f1f1f', marginBottom: '20px' }}>
                <Lock size={14} color="#6b7280" style={{ flexShrink: 0, marginTop: '2px' }} />
                <p style={{ fontSize: '12px', color: '#6b7280', lineHeight: 1.6, margin: 0 }}>Your payment is secured with 256-bit SSL encryption. Card details are never stored on our servers.</p>
              </div>
            </>
          )}

          {/* ── Bank Transfer ── */}
          {s.category === 'bank' && (
            <>
              <h3 style={{ fontFamily: 'Oswald, sans-serif', fontSize: '1.4rem', letterSpacing: '0.04em', color: '#fff', marginBottom: '6px' }}>BANK TRANSFER</h3>
              <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '24px' }}>
                Transfer <span style={{ color: '#dc2626' }}>{amt}</span> to the campaign account below.
              </p>

              <p style={{ fontFamily: 'Oswald, sans-serif', fontSize: '11px', letterSpacing: '0.15em', color: '#dc2626', marginBottom: '12px' }}>SELECT BANK</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '20px' }}>
                {(Object.entries(BANKS) as [BankKey, typeof BANKS[BankKey]][]).map(([key, info]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => set('bank', key)}
                    style={{
                      padding: '14px 8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
                      cursor: 'pointer', border: 'none',
                      backgroundColor: s.bank === key ? 'rgba(220,38,38,0.1)' : '#111',
                      outline: `1px solid ${s.bank === key ? '#dc2626' : '#1f1f1f'}`,
                    }}
                  >
                    <div style={{ backgroundColor: info.color, borderRadius: '4px', padding: '4px 10px' }}>
                      <span style={{ fontFamily: 'Oswald, sans-serif', fontWeight: 700, fontSize: '0.7rem', color: '#fff', letterSpacing: '0.04em' }}>{key.toUpperCase()}</span>
                    </div>
                    <span style={{ fontSize: '10px', color: '#9ca3af', textAlign: 'center', lineHeight: 1.4 }}>{info.label}</span>
                  </button>
                ))}
              </div>

              {s.bank && (
                <div style={{ backgroundColor: '#0d0d0d', border: '1px solid #1f1f1f', padding: '20px', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingBottom: '12px', marginBottom: '4px', borderBottom: '1px solid #1a1a1a' }}>
                    <div style={{ backgroundColor: BANKS[s.bank].color, borderRadius: '4px', padding: '4px 8px' }}>
                      <span style={{ fontFamily: 'Oswald, sans-serif', fontWeight: 700, fontSize: '0.65rem', color: '#fff' }}>{s.bank.toUpperCase()}</span>
                    </div>
                    <div>
                      <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: '0.9rem', color: '#fff', letterSpacing: '0.04em' }}>Campaign Account</div>
                      <div style={{ fontSize: '11px', color: '#6b7280' }}>{BANKS[s.bank].label}</div>
                    </div>
                  </div>
                  <InfoRow label="ACCOUNT NAME"   value="Build One Zambia Campaign Fund" />
                  <InfoRow label="ACCOUNT NUMBER" value={BANKS[s.bank].account} />
                  <InfoRow label="BRANCH"         value={BANKS[s.bank].branch} />
                  <InfoRow label="SWIFT / BIC"    value={BANKS[s.bank].swift} />
                  <InfoRow label="AMOUNT"         value={amt} />
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '12px', backgroundColor: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.2)', marginTop: '12px' }}>
                    <AlertCircle size={14} color="#dc2626" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <p style={{ fontSize: '12px', color: '#9ca3af', lineHeight: 1.6, margin: 0 }}>Use your full name as the payment reference so we can match your donation.</p>
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
                <input style={INP} placeholder="Your full name (as it appears on your bank account)" value={s.bankHolder} onChange={e => set('bankHolder', e.target.value)} />
                <input style={INP} placeholder="Transaction / reference number (after transfer)" value={s.bankRef} onChange={e => set('bankRef', e.target.value)} />
              </div>
            </>
          )}

          {/* ── Mobile Money ── */}
          {s.category === 'mobile' && (
            <>
              <h3 style={{ fontFamily: 'Oswald, sans-serif', fontSize: '1.4rem', letterSpacing: '0.04em', color: '#fff', marginBottom: '6px' }}>MOBILE MONEY</h3>
              <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '24px' }}>
                Send <span style={{ color: '#dc2626' }}>{amt}</span> from your mobile wallet.
              </p>

              <p style={{ fontFamily: 'Oswald, sans-serif', fontSize: '11px', letterSpacing: '0.15em', color: '#dc2626', marginBottom: '12px' }}>SELECT NETWORK</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '20px' }}>
                {(Object.entries(NETS) as [MobileKey, typeof NETS[MobileKey]][]).map(([key, info]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => set('net', key)}
                    style={{
                      padding: '14px 8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
                      cursor: 'pointer', border: 'none',
                      backgroundColor: s.net === key ? 'rgba(220,38,38,0.1)' : '#111',
                      outline: `1px solid ${s.net === key ? '#dc2626' : '#1f1f1f'}`,
                    }}
                  >
                    <div style={{ backgroundColor: info.color, borderRadius: '4px', padding: '4px 10px' }}>
                      <span style={{ fontFamily: 'Oswald, sans-serif', fontWeight: 700, fontSize: '0.7rem', color: info.dark ? '#111' : '#fff', letterSpacing: '0.04em' }}>{key.toUpperCase()}</span>
                    </div>
                    <span style={{ fontSize: '10px', color: '#9ca3af', textAlign: 'center', lineHeight: 1.4 }}>{info.label}</span>
                  </button>
                ))}
              </div>

              {s.net && (
                <div style={{ backgroundColor: '#0d0d0d', border: '1px solid #1f1f1f', padding: '20px', marginBottom: '20px' }}>
                  <p style={{ fontFamily: 'Oswald, sans-serif', fontSize: '11px', letterSpacing: '0.12em', color: NETS[s.net].color, marginBottom: '16px' }}>
                    HOW TO SEND WITH {NETS[s.net].label.toUpperCase()}
                  </p>
                  <ol style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {[
                      `Dial ${NETS[s.net].ussd} on your ${s.net === 'airtel' ? 'Airtel' : s.net === 'zamtel' ? 'Zamtel' : 'MTN'} line`,
                      'Select "Send Money" or "Pay Bill"',
                      `Enter campaign pay number: ${NETS[s.net].payNum}`,
                      `Enter amount: ${amt.replace('K', '')}`,
                      'Confirm with your PIN and save the transaction ID',
                    ].map((step, i) => (
                      <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                        <span style={{ width: 24, height: 24, borderRadius: '50%', backgroundColor: NETS[s.net!].color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontFamily: 'Oswald, sans-serif', fontWeight: 700, fontSize: '11px', color: NETS[s.net!].dark ? '#111' : '#fff' }}>{i + 1}</span>
                        <span style={{ fontSize: '13px', color: '#d1d5db', lineHeight: 1.6, paddingTop: '2px' }}>{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#6b7280', fontSize: '13px', fontFamily: 'Oswald, sans-serif' }}>+260</span>
                  <input style={{ ...INP, paddingLeft: '58px' }} placeholder="9X XXX XXXX" value={s.phone} onChange={e => set('phone', e.target.value.replace(/\D/g, '').slice(0, 9))} />
                </div>
                <input style={INP} placeholder="Transaction ID / confirmation code" value={s.txRef} onChange={e => set('txRef', e.target.value)} />
              </div>
            </>
          )}

          <div style={{ display: 'flex', gap: '12px' }}>
            <button type="button" onClick={() => setStep(2)} style={btnBack}><ChevronLeft size={15} /> BACK</button>
            <button type="button" disabled={!step3ok} onClick={() => setStep(4)} style={btnNext(!step3ok)}>REVIEW DONATION <ChevronRight size={16} /></button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          STEP 4 — Confirm
      ══════════════════════════════════════════════════════════════════════ */}
      {step === 4 && (
        <div>
          <h3 style={{ fontFamily: 'Oswald, sans-serif', fontSize: '1.4rem', letterSpacing: '0.04em', color: '#fff', marginBottom: '6px' }}>CONFIRM DONATION</h3>
          <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '28px' }}>Please review before submitting.</p>

          <div style={{ backgroundColor: '#0d0d0d', border: '1px solid #1f1f1f', padding: '20px', marginBottom: '20px' }}>
            <p style={{ fontFamily: 'Oswald, sans-serif', fontSize: '11px', letterSpacing: '0.15em', color: '#dc2626', marginBottom: '8px' }}>DONATION SUMMARY</p>
            <InfoRow label="DONOR"  value={s.name} />
            <InfoRow label="EMAIL"  value={s.email} />
            <InfoRow label="AMOUNT" value={amt} />
            <InfoRow label="METHOD" value={methodLabel} />
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '14px', backgroundColor: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.2)', marginBottom: '24px' }}>
            <AlertCircle size={14} color="#dc2626" style={{ flexShrink: 0, marginTop: '2px' }} />
            <p style={{ fontSize: '12px', color: '#9ca3af', lineHeight: 1.7, margin: 0 }}>
              All donations are subject to Zambian Electoral Commission laws. Maximum individual contribution: <strong style={{ color: '#d1d5db' }}>K50,000</strong>. By donating you confirm this contribution is from personal funds only.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
            <button type="button" onClick={() => setStep(3)} style={btnBack}><ChevronLeft size={15} /> EDIT</button>
            <button type="button" onClick={() => setDone(true)} style={btnNext(false)}>
              <Heart size={15} /> CONFIRM DONATION
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
            <Lock size={12} color="#4b5563" />
            <span style={{ fontSize: '11px', color: '#4b5563' }}>Secured by 256-bit SSL · Your data is protected</span>
          </div>
        </div>
      )}
    </div>
  );
}
