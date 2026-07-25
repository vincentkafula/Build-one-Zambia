import { useEffect, useRef, useState } from 'react';
import { Lock, Landmark, CreditCard, Smartphone, ArrowDown } from 'lucide-react';
import { DonationFlow } from '../../components/DonationFlow';

// Real donation tiers already used by DonationFlow (K100/K500/K1,000/K5,000)
// mapped to concrete, specific outcomes drawn from BOZ's actual described
// activities — grassroots outreach, voter education, rally logistics —
// rather than generic "your gift matters" language. This is the page's
// signature: a stepped "build" ladder (green rail, ascending) that makes
// the literal thing a kwacha amount buys visible, tying directly into the
// party's own name.
const IMPACT_STEPS = [
  { amount: 'K100', title: 'Bronze', outcome: 'Prints voter-education flyers for one polling station.' },
  { amount: 'K500', title: 'Silver', outcome: 'Funds a full day of door-to-door canvassing in one ward.' },
  { amount: 'K1,000', title: 'Gold', outcome: 'Covers sound and staging for one community rally.' },
  { amount: 'K5,000', title: 'Platinum', outcome: 'Buys a voter-education radio slot reaching a whole constituency.' },
];

const TRUST_ITEMS = [
  { Icon: Lock, label: '256-bit SSL Encryption' },
  { Icon: CreditCard, label: 'Visa · Mastercard · Amex' },
  { Icon: Landmark, label: 'ABSA · FNB · Zanaco' },
  { Icon: Smartphone, label: 'Airtel · Zamtel · MTN' },
];

function useCountUp(target: number, active: boolean, durationMs = 1400) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!active) return;
    let raf: number;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(Math.round(target * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, target, durationMs]);
  return value;
}

export function DonatePage() {
  const [heroVisible, setHeroVisible] = useState(false);
  const flowRef = useRef<HTMLDivElement>(null);
  useEffect(() => { const t = setTimeout(() => setHeroVisible(true), 80); return () => clearTimeout(t); }, []);
  const voters = useCountUp(8786300, heroVisible);

  return (
    <div style={{ backgroundColor: '#04120a', fontFamily: 'Open Sans, sans-serif', color: '#fff', minHeight: '100vh' }}>

      {/* ── Hero — split, grounded in real civic scale, not a generic appeal ── */}
      <section style={{ position: 'relative', overflow: 'hidden', padding: '96px 20px 64px', background: 'linear-gradient(160deg, #04120a 0%, #062b16 55%, #0a0a0a 100%)' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 15% 20%, rgba(0,122,48,0.35) 0%, transparent 55%)', pointerEvents: 'none' }} />
        <div
          style={{
            position: 'relative', maxWidth: '1060px', margin: '0 auto',
            display: 'grid', gridTemplateColumns: 'minmax(0,1fr)', gap: '32px',
          }}
          className="donate-hero-grid"
        >
          <div style={{ opacity: heroVisible ? 1 : 0, transform: heroVisible ? 'translateY(0)' : 'translateY(14px)', transition: 'opacity 0.7s ease, transform 0.7s ease' }}>
            <p style={{ fontSize: '11px', letterSpacing: '0.3em', color: '#dc2626', fontFamily: 'Oswald, sans-serif', fontWeight: 600, marginBottom: '18px' }}>
              WHY IT MATTERS
            </p>
            <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 'clamp(3rem, 9vw, 5.5rem)', lineHeight: 1, letterSpacing: '0.01em', color: '#fff', fontVariantNumeric: 'tabular-nums' }}>
              {voters.toLocaleString()}
            </div>
            <p style={{ color: '#8fb89e', fontSize: '0.95rem', letterSpacing: '0.04em', marginTop: '6px' }}>
              Zambians registered to vote in 2026 — every one of them reachable only with real resources.
            </p>
          </div>

          <div style={{ opacity: heroVisible ? 1 : 0, transform: heroVisible ? 'translateY(0)' : 'translateY(14px)', transition: 'opacity 0.7s ease 0.12s, transform 0.7s ease 0.12s' }}>
            <h1 style={{ fontFamily: 'Oswald, sans-serif', fontSize: 'clamp(2rem, 5vw, 3.1rem)', lineHeight: 1.12, letterSpacing: '0.01em', marginBottom: '18px', color: '#fff' }}>
              Your kwacha reaches every one of them.
            </h1>
            <p style={{ color: '#b9c9bf', fontSize: '1rem', lineHeight: 1.85, maxWidth: '520px', marginBottom: '28px' }}>
              Donations fund grassroots outreach, voter education, and rally logistics across all ten provinces —
              nothing routed anywhere else.
            </p>
            <button
              onClick={() => flowRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '10px',
                backgroundColor: '#dc2626', color: '#fff', border: 'none',
                padding: '14px 28px', fontFamily: 'Oswald, sans-serif', fontSize: '14px',
                letterSpacing: '0.1em', cursor: 'pointer',
              }}
            >
              DONATE NOW <ArrowDown size={15} />
            </button>
          </div>
        </div>

        {/* Zambian-flag colour rail — the one deliberate accent, used once */}
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: '4px', display: 'flex' }}>
          <div style={{ flex: 3, backgroundColor: '#007A30' }} />
          <div style={{ flex: 1, backgroundColor: '#dc2626' }} />
          <div style={{ flex: 1, backgroundColor: '#000' }} />
          <div style={{ flex: 1, backgroundColor: '#ff8200' }} />
        </div>
      </section>

      {/* ── Impact ladder — signature element: kwacha amount -> literal outcome ── */}
      <section style={{ padding: '76px 20px 64px', backgroundColor: '#080808' }}>
        <div style={{ maxWidth: '640px', margin: '0 auto 44px', textAlign: 'center' }}>
          <p style={{ fontSize: '11px', letterSpacing: '0.3em', color: '#dc2626', fontFamily: 'Oswald, sans-serif', fontWeight: 600, marginBottom: '14px' }}>
            WHAT IT BUILDS
          </p>
          <h2 style={{ fontFamily: 'Oswald, sans-serif', fontSize: 'clamp(1.6rem, 3.6vw, 2.3rem)', letterSpacing: '0.01em', color: '#fff' }}>
            Every level, a real result
          </h2>
        </div>

        <div style={{ maxWidth: '620px', margin: '0 auto', position: 'relative' }}>
          {/* connecting rail */}
          <div style={{ position: 'absolute', left: '27px', top: '14px', bottom: '14px', width: '2px', background: 'linear-gradient(180deg, #cd7f32 0%, #c0c0c0 33%, #e0b83c 66%, #e5e4e2 100%)' }} />
          {IMPACT_STEPS.map((step, i) => {
            const METAL_COLORS = ['#cd7f32', '#c0c0c0', '#e0b83c', '#e5e4e2'];
            const metal = METAL_COLORS[i];
            return (
            <div key={step.amount} style={{ position: 'relative', display: 'flex', gap: '24px', paddingBottom: i === IMPACT_STEPS.length - 1 ? 0 : '38px' }}>
              <div
                style={{
                  flexShrink: 0, width: '56px', height: '56px', borderRadius: '50%',
                  backgroundColor: '#0d0d0d', border: `2px solid ${metal}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1,
                  boxShadow: `0 0 0 1px rgba(0,0,0,0.4), 0 0 14px ${metal}33`,
                }}
              >
                <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: '10px', fontWeight: 700, color: metal, letterSpacing: '0.02em' }}>
                  {step.amount}
                </span>
              </div>
              <div style={{ paddingTop: '8px' }}>
                <p style={{ fontFamily: 'Oswald, sans-serif', fontSize: '0.95rem', letterSpacing: '0.06em', color: metal, marginBottom: '4px' }}>
                  {step.title.toUpperCase()}
                </p>
                <p style={{ color: '#8b9a91', fontSize: '14px', lineHeight: 1.7, margin: 0, maxWidth: '420px' }}>
                  {step.outcome}
                </p>
              </div>
            </div>
            );
          })}
        </div>
      </section>

      {/* ── Donation flow ── */}
      <section ref={flowRef} style={{ padding: '24px 20px 96px', backgroundColor: '#080808' }}>
        <div style={{ maxWidth: '640px', margin: '0 auto' }}>
          <div style={{ backgroundColor: '#0d0d0d', border: '1px solid #1a1a1a', borderTop: '3px solid #007A30' }}>
            <DonationFlow />
          </div>
        </div>
      </section>

      {/* ── Trust row ── */}
      <section style={{ padding: '36px 20px', backgroundColor: '#04120a', borderTop: '1px solid #0f2a1a', borderBottom: '1px solid #0f2a1a' }}>
        <div style={{ maxWidth: '760px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '36px' }}>
          {TRUST_ITEMS.map(({ Icon, label }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
              <Icon size={15} color="#4a7a5c" />
              <span style={{ fontSize: '12px', color: '#6b7280', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.05em' }}>{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Closing banner — angled, not a flat rectangle ── */}
      <section
        style={{
          position: 'relative', padding: '88px 20px 76px', textAlign: 'center',
          backgroundColor: '#dc2626', overflow: 'hidden',
          clipPath: 'polygon(0 6%, 100% 0, 100% 100%, 0 100%)',
        }}
      >
        <h2 style={{ fontFamily: 'Oswald, sans-serif', fontSize: 'clamp(1.7rem, 4.4vw, 2.7rem)', letterSpacing: '0.02em', color: '#fff', marginBottom: '10px' }}>
          One Zambia. One Future. Built by Us.
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.82)', fontStyle: 'italic', fontSize: '15px', margin: 0 }}>
          Let us make history together — Vote 14 August 2031.
        </p>
      </section>

      <style>{`
        @media (min-width: 860px) {
          .donate-hero-grid { grid-template-columns: 0.85fr 1.15fr !important; align-items: center; }
        }
        @media (prefers-reduced-motion: reduce) {
          * { transition-duration: 0.01ms !important; animation-duration: 0.01ms !important; }
        }
      `}</style>
    </div>
  );
}

export default DonatePage;
