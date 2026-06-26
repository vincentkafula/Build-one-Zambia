import { DonationFlow } from '../../components/DonationFlow';

export function DonatePage() {
  return (
    <div style={{ backgroundColor: '#007A30', fontFamily: 'Open Sans, sans-serif', color: '#fff', minHeight: '100vh' }}>

      {/* Hero */}
      <section style={{ position: 'relative', padding: '100px 16px 80px', textAlign: 'center', overflow: 'hidden', background: 'linear-gradient(135deg, #007A30 0%, #006B28 40%, #1a0000 100%)' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 50% 40%, rgba(220,38,38,0.12) 0%, transparent 65%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', maxWidth: '700px', margin: '0 auto' }}>
          <p style={{ fontSize: '11px', letterSpacing: '0.25em', color: '#dc2626', fontFamily: 'Oswald, sans-serif', fontWeight: 600, marginBottom: '16px' }}>
            FUEL THE MOVEMENT
          </p>
          <h1 style={{ fontFamily: 'Oswald, sans-serif', fontSize: 'clamp(2.4rem, 6vw, 4rem)', lineHeight: 1.1, letterSpacing: '0.03em', marginBottom: '20px', color: '#fff' }}>
            DONATE TO <span style={{ color: '#dc2626' }}>BUILD ONE ZAMBIA</span>
          </h1>
          <p style={{ color: '#9ca3af', fontSize: '1.05rem', lineHeight: 1.85, maxWidth: '560px', margin: '0 auto' }}>
            Every kwacha you give goes directly to grassroots outreach, voter education, and rally logistics across all 10 provinces of Zambia.
          </p>
        </div>
      </section>

      {/* Why donate — 3 pillars */}
      <section style={{ padding: '60px 16px', backgroundColor: '#0d0d0d' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
          {[
            { num: '01', title: 'Grassroots Outreach',   desc: 'Fund campaign teams in every ward, constituency, and district across Zambia.' },
            { num: '02', title: 'Voter Education',        desc: 'Support materials, radio broadcasts, and community meetings educating citizens on their rights.' },
            { num: '03', title: 'Rally Logistics',        desc: 'Help cover transport, venues, and equipment to bring the message to every corner of the nation.' },
          ].map(item => (
            <div key={item.num} style={{ backgroundColor: '#111', border: '1px solid #1f1f1f', borderTop: '3px solid #dc2626', padding: '28px 24px' }}>
              <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: '2rem', color: 'rgba(220,38,38,0.25)', marginBottom: '12px', letterSpacing: '0.06em' }}>{item.num}</div>
              <h3 style={{ fontFamily: 'Oswald, sans-serif', fontSize: '1rem', letterSpacing: '0.06em', color: '#fff', marginBottom: '8px' }}>{item.title}</h3>
              <p style={{ color: '#6b7280', fontSize: '13px', lineHeight: 1.75, margin: 0 }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Donation flow */}
      <section style={{ padding: '72px 16px 96px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr', gap: '48px' }}>

          {/* Flow */}
          <div style={{ backgroundColor: '#0d0d0d', border: '1px solid #1f1f1f', padding: '40px 36px' }}>
            <DonationFlow />
          </div>
        </div>
      </section>

      {/* Trust bar */}
      <section style={{ padding: '40px 16px', backgroundColor: '#080808', borderTop: '1px solid #005020' }}>
        <div style={{ maxWidth: '700px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '32px' }}>
          {[
            '🔒 256-bit SSL Encryption',
            '🏛 Compliant with Zambian Electoral Laws',
            '💳 Visa · Mastercard · Amex',
            '🏦 ABSA · FNB · Zanaco',
            '📱 Airtel · Zamtel · MTN',
          ].map(item => (
            <span key={item} style={{ fontSize: '12px', color: '#6b7280', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.06em' }}>{item}</span>
          ))}
        </div>
      </section>

      {/* Closing banner */}
      <section style={{ padding: '72px 16px', backgroundColor: '#dc2626', textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'Oswald, sans-serif', fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', letterSpacing: '0.03em', color: '#fff', marginBottom: '10px' }}>
          One Zambia. One Future. Built by Us.
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.8)', fontStyle: 'italic', fontSize: '15px', margin: 0 }}>Let us make history together — Vote 14 August 2031.</p>
      </section>
    </div>
  );
}

export default DonatePage;
