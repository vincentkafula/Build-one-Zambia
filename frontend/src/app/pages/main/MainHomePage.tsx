import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { ArrowRight, CheckCircle, Home, Zap, Wheat, Building2 } from 'lucide-react';
import { ImageWithFallback } from '../../components/figma/ImageWithFallback';
import heroSlide1 from '../../../imports/vincent_1.png';
import heroSlide2 from '../../../imports/vincent_2.png';
import heroSlide3 from '../../../imports/vincent_3.png';
import heroSlide4 from '../../../imports/vincent_4.png';
import heroSlide5 from '../../../imports/vincent_5.png';
import heroSlide6 from '../../../imports/vincent_6.png';
import heroSlide7 from '../../../imports/vincent_7.png';
import heroSlide8 from '../../../imports/vincent_8.png';

const HERO_SLIDES = [
  heroSlide1, heroSlide2, heroSlide3, heroSlide4,
  heroSlide5, heroSlide6, heroSlide7, heroSlide8,
];

const RALLY_IMG     = 'https://images.unsplash.com/photo-1604212561903-5ca7f041c58b?w=1600&h=700&fit=crop&auto=format';
const COMMUNITY_IMG = 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=800&h=600&fit=crop&auto=format';

const PROMISES = [
  {
    icon: Home,
    title: 'Homes for Every Family',
    desc: 'Government-provided machinery deployed in every municipality so communities can build their own homes.',
  },
  {
    icon: Zap,
    title: 'Power in All Provinces',
    desc: 'Ten new power plants — one per province — delivering reliable electricity from dawn to dusk.',
  },
  {
    icon: Wheat,
    title: 'Fertiliser for Our Fields',
    desc: 'A production plant in every province to boost harvests and end food insecurity.',
  },
  {
    icon: Building2,
    title: 'Cement and Stone for Growth',
    desc: 'Local production facilities across the country to support construction and create thousands of sustainable jobs.',
  },
];

export default function MainHomePage() {
  const [slideIndex, setSlideIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setSlideIndex(i => (i + 1) % HERO_SLIDES.length);
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div style={{ fontFamily: 'Open Sans, sans-serif', backgroundColor: '#007A30', color: '#1a1a1a' }}>

      {/* ── HERO — do not change this message ─────────────────────────── */}
      <section className="relative overflow-hidden" style={{ minHeight: '92vh', background: 'linear-gradient(160deg, #007A30 0%, #006B28 60%, #005A22 100%)' }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10 h-full">
          <div className="grid lg:grid-cols-2 gap-0 items-center" style={{ minHeight: '92vh' }}>

            {/* Left: text */}
            <div className="flex flex-col justify-center py-24 lg:py-0 pr-0 lg:pr-12">

              <div className="flex items-center gap-3 mb-6">
                <span className="block w-8 h-0.5" style={{ backgroundColor: '#dc2626' }} />
                <span className="text-xs tracking-widest uppercase" style={{ color: '#dc2626', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.25em', fontWeight: 600 }}>
                  WE ARE WAITING FOR YOU
                </span>
              </div>

              <h1
                className="mb-6 leading-none"
                style={{
                  fontFamily: 'Oswald, sans-serif',
                  fontSize: 'clamp(2.8rem, 5.5vw, 5rem)',
                  fontWeight: 700,
                  color: '#ffffff',
                  letterSpacing: '-0.01em',
                  lineHeight: 1.08,
                }}
              >
                Lets Build<br />
                Zambia<br />
                Together
              </h1>

              <p className="mb-10 leading-relaxed max-w-md" style={{ color: 'rgba(255,255,255,0.72)', fontSize: '15px', lineHeight: 1.85 }}>
                We can start by taking small steps and making small changes that can have a big impact in the country.
              </p>

              <div>
                <Link
                  to="/campaign"
                  className="inline-flex items-center gap-2 px-8 py-4 font-bold text-white transition-all duration-200 hover:opacity-90"
                  style={{ fontFamily: 'Oswald, sans-serif', fontSize: '14px', letterSpacing: '0.12em', backgroundColor: '#dc2626', borderRadius: '4px' }}
                >
                  JOIN THE CAMPAIGN
                </Link>
              </div>

              <div className="mt-12 flex flex-wrap gap-6">
                {['Transparency', 'Accountability', 'Democracy'].map(val => (
                  <div key={val} className="flex items-center gap-2 text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
                    <CheckCircle className="w-3.5 h-3.5 shrink-0" style={{ color: '#dc2626' }} />
                    {val}
                  </div>
                ))}
              </div>
            </div>

            {/* Right: speaker image over solid red circle */}
            <div className="hidden lg:flex items-end justify-center relative" style={{ height: '92vh' }}>
              <div
                className="absolute"
                style={{
                  width: '480px', height: '480px',
                  borderRadius: '50%',
                  backgroundColor: '#c41a1a',
                  bottom: '60px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                }}
              />
              <div className="absolute w-4 h-4 rounded-full" style={{ backgroundColor: '#dc2626', top: '18%', right: '8%' }} />
              <div className="absolute w-2 h-2 rounded-full" style={{ backgroundColor: '#dc2626', opacity: 0.5, top: '24%', right: '5%' }} />
              <div
                className="relative z-10"
                style={{
                  width: '340px', height: '540px', marginBottom: '60px',
                  overflow: 'hidden',
                  borderRadius: '50% 50% 0 0 / 30% 30% 0 0',
                }}
              >
                {HERO_SLIDES.map((src, i) => (
                  <img
                    key={src}
                    src={src}
                    alt="Build One Zambia"
                    className="absolute inset-0 w-full h-full object-cover object-top"
                    style={{
                      opacity: i === slideIndex ? 1 : 0,
                      transition: 'opacity 0.9s ease-in-out',
                    }}
                  />
                ))}

                {/* Dot indicators */}
                <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-10">
                  {HERO_SLIDES.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setSlideIndex(i)}
                      className="w-2 h-2 rounded-full transition-all"
                      style={{
                        backgroundColor: i === slideIndex ? '#fff' : 'rgba(255,255,255,0.4)',
                        transform: i === slideIndex ? 'scale(1.3)' : 'scale(1)',
                      }}
                    />
                  ))}
                </div>
              </div>
              <div
                className="absolute z-20 px-5 py-3 rounded"
                style={{ backgroundColor: '#006B28', border: '1px solid rgba(220,38,38,0.5)', bottom: '140px', left: '0' }}
              >
                <div className="text-white text-2xl font-bold" style={{ fontFamily: 'Oswald, sans-serif' }}>14 AUG</div>
                <div className="text-xs" style={{ color: '#9ca3af' }}>Election Day 2031</div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── ABOUT INTRO ───────────────────────────────────────────────── */}
      <section style={{ backgroundColor: '#dc2626' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-white text-xl leading-relaxed" style={{ fontFamily: 'Oswald, sans-serif', fontSize: 'clamp(1.1rem, 2vw, 1.4rem)', letterSpacing: '0.02em' }}>
              Zambia Is Waiting. The Time to Act Is Now.
            </p>
            <p className="text-red-100 mt-3 leading-relaxed" style={{ fontSize: '15px' }}>
              Let us build the Zambia we all deserve — together.
            </p>
          </div>
        </div>
      </section>

      {/* ── WHAT WE ARE ───────────────────────────────────────────────── */}
      <section className="py-24" style={{ backgroundColor: '#f0fdf4' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="relative">
              <div className="overflow-hidden" style={{ height: '480px' }}>
                <ImageWithFallback
                  src={COMMUNITY_IMG}
                  alt="Build One Zambia supporters"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(220,38,38,0.25) 0%, transparent 60%)' }} />
              </div>
              <div className="absolute -bottom-4 -right-4 w-48 h-48 -z-10" style={{ backgroundColor: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.25)' }} />
            </div>

            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="block w-8 h-0.5" style={{ backgroundColor: '#dc2626' }} />
                <span className="text-xs tracking-widest uppercase" style={{ color: '#dc2626', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.2em', fontWeight: 600 }}>
                  ABOUT THE MOVEMENT
                </span>
              </div>
              <h2 className="mb-6" style={{ fontFamily: 'Oswald, sans-serif', fontSize: 'clamp(2rem, 3.5vw, 3rem)', fontWeight: 700, color: '#1a1a1a', lineHeight: 1.1 }}>
                More Than a Campaign.<br /><span style={{ color: '#dc2626' }}>A National Movement.</span>
              </h2>
              <p className="mb-5 leading-relaxed" style={{ color: '#374151', fontSize: '15px' }}>
                Build One Zambia is more than a political campaign. It is a national movement rooted in the belief that Zambians — our farmers, builders, teachers, entrepreneurs, and young people — have everything it takes to transform this country. No more opaque tender systems. No more foreign contractors walking away with our wealth. No more empty promises.
              </p>
              <p className="mb-8 leading-relaxed" style={{ color: '#374151', fontSize: '15px' }}>
                From the bustling streets of Lusaka to the fertile fields of Eastern Province, from the mines of Copperbelt to the villages of Western Province, we will build one Zambia — a nation where every family has a roof over its head, every farmer has the means to succeed, and every province thrives with energy and opportunity.
              </p>
              <Link
                to="/about"
                className="inline-flex items-center gap-2 font-semibold transition-colors"
                style={{ fontFamily: 'Oswald, sans-serif', color: '#dc2626', fontSize: '14px', letterSpacing: '0.1em' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#b91c1c'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = '#dc2626'}
              >
                LEARN MORE ABOUT US <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── OUR PROMISE TO EVERY ZAMBIAN ──────────────────────────────── */}
      <section className="py-24" style={{ backgroundColor: '#ffffff' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-3 mb-4">
              <span className="block w-8 h-0.5" style={{ backgroundColor: '#dc2626' }} />
              <span className="text-xs tracking-widest uppercase" style={{ color: '#dc2626', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.2em', fontWeight: 600 }}>OUR PLATFORM</span>
              <span className="block w-8 h-0.5" style={{ backgroundColor: '#dc2626' }} />
            </div>
            <h2 style={{ fontFamily: 'Oswald, sans-serif', fontSize: 'clamp(2rem, 3.5vw, 3rem)', fontWeight: 700, color: '#1a1a1a' }}>
              Our Promise to Every Zambian
            </h2>
            <p className="mt-4 max-w-2xl mx-auto" style={{ color: '#4b5563', fontSize: '15px', lineHeight: 1.7 }}>
              Vote for a Zambia built by Zambians, for Zambians. Together, we rise.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {PROMISES.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="p-7 transition-all duration-300"
                style={{ backgroundColor: '#ffffff', borderTop: '1px solid #e5e7eb', borderRight: '1px solid #e5e7eb', borderBottom: '1px solid #e5e7eb', borderLeft: '1px solid #e5e7eb', borderRadius: '8px' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(220,38,38,0.4)'; (e.currentTarget as HTMLElement).style.backgroundColor = '#fef2f2'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#e5e7eb'; (e.currentTarget as HTMLElement).style.backgroundColor = '#ffffff'; }}
              >
                <div className="w-12 h-12 flex items-center justify-center mb-5" style={{ backgroundColor: 'rgba(220,38,38,0.12)', borderTop: '1px solid rgba(220,38,38,0.25)', borderRight: '1px solid rgba(220,38,38,0.25)', borderBottom: '1px solid rgba(220,38,38,0.25)', borderLeft: '1px solid rgba(220,38,38,0.25)', borderRadius: '8px' }}>
                  <Icon className="w-6 h-6" style={{ color: '#dc2626' }} />
                </div>
                <h3 className="font-bold mb-3" style={{ fontFamily: 'Oswald, sans-serif', fontSize: '17px', letterSpacing: '0.03em', color: '#1a1a1a' }}>{title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: '#4b5563' }}>{desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link
              to="/campaign"
              className="inline-flex items-center gap-2 px-8 py-4 font-bold text-white transition-all duration-200 hover:opacity-90"
              style={{ fontFamily: 'Oswald, sans-serif', fontSize: '14px', letterSpacing: '0.1em', backgroundColor: '#dc2626', borderRadius: '4px' }}
            >
              VIEW FULL CAMPAIGN PLATFORM <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── GLOBAL CONNECTIVITY ──────────────────────────────────────── */}
      <section className="py-24" style={{ background: 'linear-gradient(160deg, #007A30 0%, #006B28 60%, #005A22 100%)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-3 mb-4">
              <span className="block w-8 h-0.5" style={{ backgroundColor: '#dc2626' }} />
              <span className="text-xs tracking-widest uppercase" style={{ color: '#dc2626', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.2em', fontWeight: 600 }}>GLOBAL STRATEGY</span>
              <span className="block w-8 h-0.5" style={{ backgroundColor: '#dc2626' }} />
            </div>
            <h2 className="mb-6 text-white" style={{ fontFamily: 'Oswald, sans-serif', fontSize: 'clamp(2rem, 4vw, 3.5rem)', fontWeight: 700, lineHeight: 1.1 }}>
              A ZAMBIA FULLY CONNECTED<br />TO THE WORLD
            </h2>
            <p className="max-w-3xl mx-auto leading-relaxed" style={{ color: '#9ca3af', fontSize: '16px', lineHeight: 1.85 }}>
              We will connect Zambia's <strong style={{ color: '#ffffff' }}>1,858 wards</strong> with over <strong style={{ color: '#ffffff' }}>7,000 U.S. local chambers of commerce</strong>, a growing network of Chinese business associations, and international trade partners from every corner of the globe. Together, this powerful network drives economic growth, expands opportunity, and strengthens Zambia's place in the world.
            </p>
          </div>

          {/* Partner blocs */}
          <div className="grid sm:grid-cols-3 gap-6 mb-14">
            {/* USA */}
            <div className="p-8 rounded-xl" style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl" style={{ backgroundColor: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)' }}>🇺🇸</div>
                <div>
                  <p className="font-bold text-white" style={{ fontFamily: 'Oswald, sans-serif', fontSize: '18px' }}>United States</p>
                  <p className="text-xs" style={{ color: '#6b7280' }}>7,000+ Local Chambers</p>
                </div>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: '#9ca3af' }}>
                Every Zambian ward paired with a U.S. chamber of commerce — opening doors to American markets, investors, and business networks.
              </p>
            </div>

            {/* China */}
            <div className="p-8 rounded-xl" style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl" style={{ backgroundColor: 'rgba(220,38,38,0.15)', border: '1px solid rgba(220,38,38,0.3)' }}>🇨🇳</div>
                <div>
                  <p className="font-bold text-white" style={{ fontFamily: 'Oswald, sans-serif', fontSize: '18px' }}>China</p>
                  <p className="text-xs" style={{ color: '#6b7280' }}>Business Associations</p>
                </div>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: '#9ca3af' }}>
                A growing network of Chinese business associations bringing manufacturing partnerships, infrastructure finance, and trade relationships to Zambia's local economy.
              </p>
            </div>

            {/* Global */}
            <div className="p-8 rounded-xl" style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl" style={{ backgroundColor: 'rgba(25,135,84,0.15)', border: '1px solid rgba(25,135,84,0.3)' }}>🌍</div>
                <div>
                  <p className="font-bold text-white" style={{ fontFamily: 'Oswald, sans-serif', fontSize: '18px' }}>Global Partners</p>
                  <p className="text-xs" style={{ color: '#6b7280' }}>Every Corner of the Globe</p>
                </div>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: '#9ca3af' }}>
                International trade partners from Europe, Asia, and beyond — giving every local entrepreneur a global stage to sell, grow, and compete.
              </p>
            </div>
          </div>

          {/* Impact statement */}
          <div className="rounded-2xl p-10" style={{ background: 'linear-gradient(135deg, rgba(220,38,38,0.15) 0%, rgba(25,135,84,0.15) 100%)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div className="grid md:grid-cols-2 gap-10 items-center">
              <div>
                <p className="leading-relaxed" style={{ color: '#e5e7eb', fontSize: '16px', lineHeight: 1.85 }}>
                  Through these strategic partnerships, every Zambian ward gains a <strong style={{ color: '#ffffff' }}>direct link to the United States, China, and beyond</strong> — unlocking export markets, attracting investment, and empowering local entrepreneurs to compete on a global stage.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { num: '1,858', label: 'Wards Connected' },
                  { num: '7,000+', label: 'U.S. Chambers' },
                  { num: '3', label: 'Major Blocs' },
                  { num: '∞', label: 'Opportunities' },
                ].map(({ num, label }) => (
                  <div key={label} className="text-center p-4 rounded-lg" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}>
                    <p className="font-bold" style={{ fontFamily: 'Oswald, sans-serif', fontSize: '2rem', color: '#dc2626', lineHeight: 1 }}>{num}</p>
                    <p className="text-xs mt-1" style={{ color: '#9ca3af' }}>{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── RALLY / RESULTS CTA ───────────────────────────────────────── */}
      <section className="relative overflow-hidden" style={{ height: '480px' }}>
        <ImageWithFallback
          src={RALLY_IMG}
          alt="Build One Zambia campaign rally"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(0,0,0,0.88) 40%, rgba(0,0,0,0.3) 100%)' }} />
        <div className="absolute inset-0 flex items-center">
          <div className="max-w-7xl mx-auto px-6 lg:px-12 w-full">
            <div className="max-w-xl">
              <div className="flex items-center gap-3 mb-4">
                <span className="block w-8 h-0.5" style={{ backgroundColor: '#dc2626' }} />
                <span className="text-xs tracking-widest uppercase" style={{ color: '#dc2626', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.2em', fontWeight: 600 }}>ELECTION RESULTS PORTAL</span>
              </div>
              <h2 className="text-white mb-4" style={{ fontFamily: 'Oswald, sans-serif', fontSize: 'clamp(2rem, 4vw, 3.5rem)', fontWeight: 700, lineHeight: 1.1 }}>
                Real-Time Results.<br />Station by Station.
              </h2>
              <p className="mb-8" style={{ color: '#d1d5db', fontSize: '15px', lineHeight: 1.75, maxWidth: '460px' }}>
                Our trained agents cover all 13,529 polling stations across Zambia's 10 provinces on 14 August 2031. Every result captured, verified, and published in real time.
              </p>
              <Link
                to="/results"
                className="inline-flex items-center gap-2 px-7 py-4 font-bold text-white transition-all duration-200 hover:opacity-90"
                style={{ fontFamily: 'Oswald, sans-serif', fontSize: '14px', letterSpacing: '0.1em', backgroundColor: '#dc2626' }}
              >
                VIEW LIVE RESULTS <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS / JOIN ───────────────────────────────────────── */}
      <section className="py-24" style={{ backgroundColor: '#f0fdf4' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <div className="flex items-center justify-center gap-3 mb-4">
              <span className="block w-8 h-0.5" style={{ backgroundColor: '#dc2626' }} />
              <span className="text-xs tracking-widest uppercase" style={{ color: '#dc2626', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.2em', fontWeight: 600 }}>WHAT ZAMBIANS SAY</span>
              <span className="block w-8 h-0.5" style={{ backgroundColor: '#dc2626' }} />
            </div>
            <h2 style={{ fontFamily: 'Oswald, sans-serif', fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)', fontWeight: 700, color: '#1a1a1a' }}>
              Voices Across Zambia
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6 mb-16">
            {[
              { quote: 'As a farmer in Northern Province, the prospect of local fertiliser plants changes everything. No more prohibitive costs — just growth for my family and my community.', name: 'Mwansa K.', role: 'Farmer, Northern Province' },
              { quote: 'This is the leadership Zambia has needed for generations. Equipping locals to build their own homes and run their own businesses — that is real, lasting progress.', name: 'Chanda M.', role: 'Community Leader, Lusaka' },
            ].map(t => (
              <div key={t.name} className="p-8" style={{ backgroundColor: '#ffffff', borderTop: '1px solid #e5e7eb', borderRight: '1px solid #e5e7eb', borderBottom: '1px solid #e5e7eb', borderLeft: '3px solid #dc2626', borderRadius: '8px' }}>
                <p className="leading-relaxed mb-5 italic" style={{ color: '#374151', fontSize: '15px' }}>"{t.quote}"</p>
                <div>
                  <p className="font-bold" style={{ fontFamily: 'Oswald, sans-serif', letterSpacing: '0.04em', color: '#1a1a1a' }}>{t.name}</p>
                  <p className="text-xs mt-1" style={{ color: '#6b7280' }}>{t.role}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Join CTA */}
          <div className="text-center p-12" style={{ backgroundColor: '#ffffff', border: '2px solid #dc2626', borderRadius: '8px' }}>
            <h3 className="mb-3" style={{ fontFamily: 'Oswald, sans-serif', fontSize: 'clamp(1.8rem, 3vw, 2.5rem)', fontWeight: 700, color: '#1a1a1a' }}>
              One Zambia. One Future. Built by Us.
            </h3>
            <p className="mb-8 italic" style={{ color: '#4b5563', fontSize: '15px' }}>Let us make history together.</p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link
                to="/campaign"
                className="inline-flex items-center gap-2 px-8 py-4 font-bold text-white transition-all duration-200 hover:opacity-90"
                style={{ fontFamily: 'Oswald, sans-serif', fontSize: '14px', letterSpacing: '0.1em', backgroundColor: '#dc2626', borderRadius: '4px' }}
              >
                JOIN THE CAMPAIGN <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 px-8 py-4 font-bold transition-all duration-200"
                style={{ fontFamily: 'Oswald, sans-serif', fontSize: '14px', letterSpacing: '0.1em', border: '2px solid #dc2626', color: '#dc2626', borderRadius: '4px', backgroundColor: '#ffffff' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#fef2f2'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#ffffff'; }}
              >
                VOLUNTEER NOW
              </Link>
            </div>
            <p className="mt-8 text-xs" style={{ color: '#6b7280' }}>bozplans.org · Vote: 14 August 2031</p>
          </div>
        </div>
      </section>

    </div>
  );
}