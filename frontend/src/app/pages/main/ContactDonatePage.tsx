import React, { useState, CSSProperties } from 'react';
import { MapPin, Phone, Mail, Send, CheckCircle } from 'lucide-react';

const INVOLVEMENT = [
  { label: 'Volunteer',             desc: 'Help organise in your province, district, or ward.' },
  { label: 'Spread the Word',       desc: 'Share our message with family, friends, and community members.' },
  { label: 'Join a Cooperative',    desc: 'Take part in our agricultural mechanisation programme.' },
  { label: 'Vote Build One Zambia', desc: 'On 14 August 2031, choose genuine progress.' },
];

const TESTIMONIALS = [
  { quote: 'As a farmer in Northern Province, the prospect of local fertiliser plants changes everything. No more prohibitive costs — just growth for my family and my community.', name: 'Mwansa K.', role: 'Farmer, Northern Province' },
  { quote: 'This is the leadership Zambia has needed for generations. Equipping locals to build their own homes and run their own businesses — that is real, lasting progress.', name: 'Chanda M.', role: 'Community Leader' },
];

export function ContactDonatePage() {
  const [tab, setTab]           = useState<'contact' | 'volunteer'>('contact');
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const inp: CSSProperties = {
    backgroundColor: '#111', border: '1px solid #2a2a2a', color: '#fff',
    padding: '12px 16px', width: '100%',
    fontFamily: 'Open Sans, sans-serif', fontSize: '14px', outline: 'none',
  };

  return (
    <div style={{ backgroundColor: '#007A30', fontFamily: 'Open Sans, sans-serif', color: '#fff' }}>

      {/* Hero */}
      <section style={{ position: 'relative', padding: 'clamp(80px, 10vw, 112px) 16px', textAlign: 'center', overflow: 'hidden', background: 'linear-gradient(135deg, #007A30 0%, #006B28 40%, #1a0000 100%)' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 50% 40%, rgba(220,38,38,0.1) 0%, transparent 60%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', maxWidth: '700px', margin: '0 auto' }}>
          <p style={{ fontSize: '11px', letterSpacing: '0.25em', color: '#dc2626', fontFamily: 'Oswald, sans-serif', fontWeight: 600, marginBottom: '16px' }}>
            YOUR VOICE. YOUR VOTE. YOUR ZAMBIA.
          </p>
          <h1 style={{ fontFamily: 'Oswald, sans-serif', fontSize: 'clamp(2.4rem, 6vw, 4rem)', lineHeight: 1.1, letterSpacing: '0.03em', marginBottom: '20px', color: '#fff' }}>
            JOIN THE <span style={{ color: '#dc2626' }}>MOVEMENT</span>
          </h1>
          <p style={{ color: '#9ca3af', fontSize: '1.05rem', lineHeight: 1.85, maxWidth: '540px', margin: '0 auto' }}>
            The time for talk is over. This campaign is powered by people exactly like you — farmers, builders, teachers, families, and dreamers who refuse to accept the status quo.
          </p>
        </div>
      </section>

      {/* How to get involved */}
      <section style={{ padding: '72px 16px', backgroundColor: '#0d0d0d' }}>
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '12px' }}>
              <span style={{ display: 'block', width: '32px', height: '2px', backgroundColor: '#dc2626' }} />
              <span style={{ fontSize: '11px', letterSpacing: '0.2em', color: '#dc2626', fontFamily: 'Oswald, sans-serif', fontWeight: 600 }}>TAKE ACTION</span>
              <span style={{ display: 'block', width: '32px', height: '2px', backgroundColor: '#dc2626' }} />
            </div>
            <h2 style={{ fontFamily: 'Oswald, sans-serif', fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)', fontWeight: 700, color: '#fff', margin: 0 }}>
              How You Can Get Involved
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            {INVOLVEMENT.map((item, i) => (
              <div key={item.label} style={{ padding: '28px', backgroundColor: '#111', border: '1px solid #1f1f1f', borderTop: '3px solid #dc2626' }}>
                <div style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#dc2626', fontFamily: 'Oswald, sans-serif', fontSize: '1rem', color: '#fff', marginBottom: '16px', fontWeight: 700 }}>
                  {i + 1}
                </div>
                <h3 style={{ fontFamily: 'Oswald, sans-serif', letterSpacing: '0.04em', fontSize: '1rem', color: '#fff', marginBottom: '8px' }}>{item.label}</h3>
                <p style={{ color: '#6b7280', fontSize: '13px', lineHeight: 1.75, margin: 0 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section style={{ padding: '72px 16px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '40px' }}>
            <span style={{ display: 'block', width: '32px', height: '2px', backgroundColor: '#dc2626' }} />
            <span style={{ fontSize: '11px', letterSpacing: '0.2em', color: '#dc2626', fontFamily: 'Oswald, sans-serif', fontWeight: 600 }}>WHAT OUR SUPPORTERS SAY</span>
            <span style={{ display: 'block', width: '32px', height: '2px', backgroundColor: '#dc2626' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            {TESTIMONIALS.map(t => (
              <div key={t.name} style={{ padding: '32px', backgroundColor: '#111', border: '1px solid #1f1f1f', borderLeft: '3px solid #dc2626' }}>
                <p style={{ color: '#d1d5db', fontSize: '15px', lineHeight: 1.8, fontStyle: 'italic', marginBottom: '20px' }}>"{t.quote}"</p>
                <p style={{ fontFamily: 'Oswald, sans-serif', letterSpacing: '0.04em', color: '#fff', marginBottom: '4px' }}>— {t.name}</p>
                <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>{t.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tab bar */}
      <div style={{ padding: '16px', backgroundColor: '#080808', borderTop: '1px solid #005020', borderBottom: '1px solid #005020' }}>
        <div style={{ maxWidth: '480px', margin: '0 auto', display: 'flex', gap: '8px', justifyContent: 'center' }}>
          {(['contact', 'volunteer'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                padding: '10px 28px', cursor: 'pointer', border: 'none',
                fontFamily: 'Oswald, sans-serif', fontSize: '13px', letterSpacing: '0.1em',
                backgroundColor: tab === t ? '#dc2626' : '#111',
                color: tab === t ? '#fff' : '#9ca3af',
                outline: `1px solid ${tab === t ? '#dc2626' : '#2a2a2a'}`,
              }}
            >
              {t === 'contact' ? 'CONTACT US' : 'VOLUNTEER'}
            </button>
          ))}
        </div>
      </div>

      {/* Contact */}
      {tab === 'contact' && (
        <section style={{ padding: '72px 16px' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '64px' }}>
            <div>
              <h2 style={{ fontFamily: 'Oswald, sans-serif', fontSize: 'clamp(1.8rem, 3vw, 2.2rem)', letterSpacing: '0.03em', marginBottom: '32px', color: '#fff' }}>REACH OUR TEAM</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginBottom: '40px' }}>
                {[
                  { Icon: MapPin, label: 'Headquarters', val: 'Plot 3456, Independence Avenue, Lusaka, Zambia' },
                  { Icon: Phone,  label: 'Phone',        val: '+260 571 224 074' },
                  { Icon: Mail,   label: 'Email',        val: 'info@bozplans.org' },
                ].map(({ Icon, label, val }) => (
                  <div key={label} style={{ display: 'flex', gap: '16px' }}>
                    <div style={{ width: 48, height: 48, flexShrink: 0, backgroundColor: 'rgba(220,38,38,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon size={20} color="#dc2626" />
                    </div>
                    <div>
                      <p style={{ fontSize: '11px', letterSpacing: '0.08em', color: '#6b7280', fontFamily: 'Oswald, sans-serif', marginBottom: '4px' }}>{label.toUpperCase()}</p>
                      <p style={{ color: '#d1d5db', margin: 0 }}>{val}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ padding: '24px', backgroundColor: '#111', border: '1px solid #1f1f1f' }}>
                <p style={{ fontSize: '12px', color: '#9ca3af', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.06em', marginBottom: '12px' }}>OFFICE HOURS</p>
                <p style={{ fontSize: '14px', color: '#d1d5db', margin: '4px 0' }}>Monday – Friday: 08:00 – 17:00 hrs</p>
                <p style={{ fontSize: '14px', color: '#d1d5db', margin: '4px 0' }}>Saturday: 09:00 – 13:00 hrs</p>
                <p style={{ fontSize: '13px', color: '#6b7280', margin: '4px 0' }}>Closed on Sundays and public holidays</p>
              </div>
              <p style={{ marginTop: '24px', fontSize: '13px', color: '#4b5563' }}>bozplans.org · Vote: 14 August 2031</p>
            </div>

            <div>
              {submitted ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '64px 0', textAlign: 'center' }}>
                  <CheckCircle size={64} color="#dc2626" style={{ marginBottom: '24px' }} />
                  <h3 style={{ fontFamily: 'Oswald, sans-serif', fontSize: '1.5rem', letterSpacing: '0.04em', color: '#fff', marginBottom: '12px' }}>MESSAGE RECEIVED</h3>
                  <p style={{ color: '#9ca3af' }}>Our team will get back to you within 2 business days.</p>
                  <button onClick={() => setSubmitted(false)} style={{ marginTop: '24px', padding: '10px 28px', backgroundColor: '#dc2626', color: '#fff', border: 'none', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.08em', cursor: 'pointer' }}>SEND ANOTHER</button>
                </div>
              ) : (
                <form
                  onSubmit={e => { e.preventDefault(); setSubmitted(true); setFormData({ name: '', email: '', phone: '', subject: '', message: '' }); }}
                  style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
                >
                  <h2 style={{ fontFamily: 'Oswald, sans-serif', fontSize: 'clamp(1.4rem, 3vw, 1.8rem)', letterSpacing: '0.03em', color: '#fff', marginBottom: '8px' }}>SEND A MESSAGE</h2>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <input required style={inp} placeholder="Full name" value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} />
                    <input required type="email" style={inp} placeholder="Email address" value={formData.email} onChange={e => setFormData(p => ({ ...p, email: e.target.value }))} />
                  </div>
                  <input style={inp} placeholder="Phone number (optional)" value={formData.phone} onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))} />
                  <input required style={inp} placeholder="Subject" value={formData.subject} onChange={e => setFormData(p => ({ ...p, subject: e.target.value }))} />
                  <textarea required rows={5} style={{ ...inp, resize: 'none' }} placeholder="Your message…" value={formData.message} onChange={e => setFormData(p => ({ ...p, message: e.target.value }))} />
                  <button type="submit" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 32px', backgroundColor: '#dc2626', color: '#fff', border: 'none', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.08em', fontSize: '14px', cursor: 'pointer', alignSelf: 'flex-start' }}>
                    <Send size={15} /> SEND MESSAGE
                  </button>
                </form>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Volunteer */}
      {tab === 'volunteer' && (
        <section style={{ padding: '72px 16px' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '48px' }}>
              <h2 style={{ fontFamily: 'Oswald, sans-serif', fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', letterSpacing: '0.03em', color: '#fff', marginBottom: '16px' }}>JOIN AS A VOLUNTEER</h2>
              <p style={{ color: '#9ca3af', lineHeight: 1.8, maxWidth: '580px', margin: '0 auto', fontSize: '15px' }}>
                Change doesn't come from above — it rises from the grassroots. Join thousands of volunteers working across Zambia's constituencies, districts, and wards.
              </p>
            </div>
            <div style={{ maxWidth: '560px', margin: '0 auto', backgroundColor: '#111', border: '1px solid #1f1f1f', padding: '36px' }}>
              <h3 style={{ fontFamily: 'Oswald, sans-serif', letterSpacing: '0.06em', fontSize: '1.2rem', color: '#fff', marginBottom: '24px' }}>VOLUNTEER SIGN-UP</h3>
              <form
                style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}
                onSubmit={e => { e.preventDefault(); alert('Thank you! Our provincial coordinator will contact you within 48 hours. Together we rise — One Zambia!'); }}
              >
                <input required style={inp} placeholder="Full name" />
                <input required type="email" style={inp} placeholder="Email address" />
                <input required style={inp} placeholder="Phone number" />
                <input required style={inp} placeholder="Province / District / Ward" />
                <select required style={{ ...inp, appearance: 'none' as const }}>
                  <option value="">How would you like to help?</option>
                  <option>Volunteer — organise in my province, district, or ward</option>
                  <option>Join a Cooperative — agricultural mechanisation programme</option>
                  <option>Spread the Word — community outreach and social media</option>
                  <option>Polling Agent — monitor my polling station on election day</option>
                  <option>Legal Observer — report irregularities and uphold the vote</option>
                </select>
                <textarea rows={3} style={{ ...inp, resize: 'none' }} placeholder="Tell us more about yourself or your skills (optional)" />
                <button type="submit" style={{ padding: '13px', backgroundColor: '#dc2626', color: '#fff', border: 'none', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.1em', fontSize: '14px', cursor: 'pointer' }}>
                  JOIN THE MOVEMENT — VOTE 13 AUGUST 2026
                </button>
              </form>
            </div>
          </div>
        </section>
      )}

      {/* Closing banner */}
      <section style={{ padding: '72px 16px', backgroundColor: '#dc2626', textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'Oswald, sans-serif', fontSize: 'clamp(2rem, 4vw, 3rem)', letterSpacing: '0.03em', color: '#fff', marginBottom: '10px' }}>
          One Zambia. One Future. Built by Us.
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.85)', fontStyle: 'italic', fontSize: '15px', margin: 0 }}>Let us make history together.</p>
      </section>
    </div>
  );
}

export { ContactDonatePage as default };
