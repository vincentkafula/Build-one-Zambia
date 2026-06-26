import { useState } from 'react';
import { Play, Radio, Calendar, Clock, Eye, ExternalLink, Bell, Wifi } from 'lucide-react';
import { LiveStreamViewer } from '../../components/LiveStreamViewer';

const YOUTUBE_CHANNEL_URL = 'https://www.youtube.com/@BuildOneZambia';
const YOUTUBE_LIVE_URL    = 'https://www.youtube.com/@BuildOneZambia/streams';

// Replace with the real live stream video ID when broadcasting
const LIVE_VIDEO_ID = 'live_stream'; // placeholder

const STATS = [
  { value: '13.5K', label: 'Registered Polling Stations', sub: 'across Zambia' },
  { value: '226',   label: 'Constituencies', sub: 'fully covered' },
  { value: '10',    label: 'Provinces', sub: 'monitored nationwide' },
  { value: '14 Aug', label: 'Election Day', sub: '2031 General Election' },
];

const UPCOMING = [
  {
    title: 'Presidential Rally — Lusaka Showgrounds',
    date: 'Sat 20 Jun 2026',
    time: '14:00 CAT',
    desc: 'Live coverage of the Build One Zambia presidential rally at Lusaka Showgrounds. Over 100,000 supporters expected.',
    thumb: 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=600&h=340&fit=crop&auto=format',
  },
  {
    title: 'Policy Debate: Economy & Jobs',
    date: 'Wed 25 Jun 2026',
    time: '18:30 CAT',
    desc: 'A live panel discussion on Build One Zambia\'s economic vision — jobs, mining revenue, and small-business growth.',
    thumb: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&h=340&fit=crop&auto=format',
  },
  {
    title: 'Copperbelt Grand Rally — Kitwe',
    date: 'Sat 4 Jul 2026',
    time: '10:00 CAT',
    desc: 'Massive rally in the heart of the Copperbelt. Live stream includes pre-show entertainment and post-rally press conference.',
    thumb: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=600&h=340&fit=crop&auto=format',
  },
];

const PAST = [
  {
    title: 'Launch of the BOZ 2031 Manifesto',
    date: '1 May 2026',
    views: '84K',
    thumb: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&h=340&fit=crop&auto=format',
    id: 'dQw4w9WgXcQ',
  },
  {
    title: 'Eastern Province Farmers\' Forum',
    date: '15 Apr 2026',
    views: '41K',
    thumb: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600&h=340&fit=crop&auto=format',
    id: 'dQw4w9WgXcQ',
  },
  {
    title: 'Women in Leadership Symposium',
    date: '8 Mar 2026',
    views: '63K',
    thumb: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=600&h=340&fit=crop&auto=format',
    id: 'dQw4w9WgXcQ',
  },
  {
    title: 'Northern Province Road-Show Day 1',
    date: '20 Feb 2026',
    views: '29K',
    thumb: 'https://images.unsplash.com/photo-1519671282429-b44b4a78fdf2?w=600&h=340&fit=crop&auto=format',
    id: 'dQw4w9WgXcQ',
  },
];

export function LiveStreamingPage() {
  const [embedActive, setEmbedActive] = useState(false);
  const [playingId, setPlayingId] = useState<string | null>(null);

  return (
    <div style={{ backgroundColor: '#080808', fontFamily: 'Open Sans, sans-serif', color: '#fff', minHeight: '100vh' }}>

      {/* ── HERO ────────────────────────────────────────────────────────────── */}
      <section style={{ position: 'relative', overflow: 'hidden', backgroundColor: '#050505' }}>

        {/* Background texture */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'radial-gradient(circle at 30% 50%, rgba(220,38,38,0.18) 0%, transparent 55%), radial-gradient(circle at 80% 20%, rgba(220,38,38,0.08) 0%, transparent 40%)',
          pointerEvents: 'none',
        }} />

        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '80px 16px 0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px', alignItems: 'center' }}>

          {/* LEFT — stats block (mirrors the reference image layout) */}
          <div style={{ paddingBottom: '80px' }}>
            {/* Live badge */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(220,38,38,0.15)', border: '1px solid rgba(220,38,38,0.35)', padding: '6px 14px', marginBottom: '32px' }}>
              <Wifi style={{ width: '13px', height: '13px', color: '#dc2626' }} />
              <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: '11px', letterSpacing: '0.2em', color: '#dc2626' }}>LIVE BROADCASTING</span>
            </div>

            <h1 style={{ fontFamily: 'Oswald, sans-serif', fontSize: 'clamp(2.2rem, 5vw, 3.8rem)', lineHeight: 1.08, letterSpacing: '0.03em', marginBottom: '20px' }}>
              WATCH BUILD<br />ONE ZAMBIA<br /><span style={{ color: '#dc2626' }}>LIVE</span>
            </h1>
            <p style={{ color: '#9ca3af', fontSize: '15px', lineHeight: 1.8, marginBottom: '40px', maxWidth: '420px' }}>
              Stream rallies, policy debates, press conferences, and election night coverage — live and on demand from every corner of Zambia.
            </p>

            {/* Stats grid — mirrors reference image */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1px', backgroundColor: '#1a1a1a', border: '1px solid #005020', marginBottom: '40px' }}>
              {STATS.map(s => (
                <div key={s.label} style={{ backgroundColor: '#0d0d0d', padding: '24px 20px' }}>
                  <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', color: '#fff', letterSpacing: '0.02em', lineHeight: 1 }}>{s.value}</div>
                  <div style={{ fontSize: '12px', color: '#dc2626', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.06em', marginTop: '4px' }}>{s.label}</div>
                  <div style={{ fontSize: '11px', color: '#4b5563', marginTop: '2px' }}>{s.sub}</div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <a
                href={YOUTUBE_LIVE_URL}
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: '#dc2626', color: '#fff', padding: '14px 24px', fontFamily: 'Oswald, sans-serif', fontSize: '13px', letterSpacing: '0.1em', textDecoration: 'none' }}
              >
                <Radio style={{ width: '15px', height: '15px' }} /> WATCH LIVE ON YOUTUBE
              </a>
              <a
                href={YOUTUBE_CHANNEL_URL}
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', border: '1px solid rgba(255,255,255,0.2)', color: '#d1d5db', padding: '14px 24px', fontFamily: 'Oswald, sans-serif', fontSize: '13px', letterSpacing: '0.1em', textDecoration: 'none' }}
              >
                <Bell style={{ width: '14px', height: '14px' }} /> SUBSCRIBE
              </a>
            </div>
          </div>

          {/* RIGHT — video player panel */}
          <div style={{ position: 'relative', paddingBottom: '80px' }}>
            {/* Decorative accent */}
            <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '180px', height: '180px', backgroundColor: 'rgba(220,38,38,0.06)', borderRadius: '50%', pointerEvents: 'none' }} />

            <div
              style={{
                position: 'relative',
                aspectRatio: '16/9',
                backgroundColor: '#111',
                border: '1px solid #1f1f1f',
                overflow: 'hidden',
                cursor: embedActive ? 'default' : 'pointer',
              }}
              onClick={() => !embedActive && setEmbedActive(true)}
            >
              {embedActive ? (
                <iframe
                  src={`https://www.youtube.com/embed/${LIVE_VIDEO_ID}?autoplay=1&rel=0`}
                  title="Build One Zambia Live Stream"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
                />
              ) : (
                <>
                  <img
                    src="https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=900&h=506&fit=crop&auto=format"
                    alt="Live stream preview"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', filter: 'brightness(0.55)' }}
                  />
                  {/* Overlay gradient */}
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(0,0,0,0.5) 0%, transparent 60%)' }} />

                  {/* Live pill */}
                  <div style={{ position: 'absolute', top: '14px', left: '14px', display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#dc2626', padding: '4px 10px' }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#fff', display: 'inline-block', animation: 'pulse 1.5s infinite' }} />
                    <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: '11px', letterSpacing: '0.15em', color: '#fff' }}>LIVE</span>
                  </div>

                  {/* Play button — matches reference image circular play icon */}
                  <div style={{
                    position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <div style={{
                      width: '72px', height: '72px', borderRadius: '50%',
                      backgroundColor: 'rgba(220,38,38,0.9)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: '0 0 0 12px rgba(220,38,38,0.2)',
                    }}>
                      <Play style={{ width: '28px', height: '28px', color: '#fff', marginLeft: '4px' }} />
                    </div>
                  </div>

                  <div style={{ position: 'absolute', bottom: '14px', left: '14px', right: '14px' }}>
                    <p style={{ fontFamily: 'Oswald, sans-serif', fontSize: '15px', color: '#fff', letterSpacing: '0.04em', margin: 0 }}>
                      Build One Zambia — Official Live Stream
                    </p>
                    <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', margin: '4px 0 0' }}>Click to watch on this page · Opens YouTube in a new tab</p>
                  </div>
                </>
              )}
            </div>

            {/* Open in YouTube link */}
            <a
              href={YOUTUBE_LIVE_URL}
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '12px', fontSize: '12px', color: '#6b7280', textDecoration: 'none', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.06em' }}
            >
              <ExternalLink style={{ width: '12px', height: '12px' }} /> OPEN IN YOUTUBE
            </a>
          </div>
        </div>
      </section>

      {/* ── LIVE STREAM VIEWER (backend-powered) ─────────────────────────────── */}
      <section style={{ padding: '0', backgroundColor: '#0d0d0d', borderTop: '1px solid #005020' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <LiveStreamViewer />
        </div>
      </section>

      {/* ── UPCOMING STREAMS ─────────────────────────────────────────────────── */}
      <section style={{ padding: '80px 16px', backgroundColor: '#007A30' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ marginBottom: '48px' }}>
            <p style={{ fontSize: '11px', letterSpacing: '0.22em', color: '#dc2626', fontFamily: 'Oswald, sans-serif', fontWeight: 600, marginBottom: '10px' }}>SCHEDULE</p>
            <h2 style={{ fontFamily: 'Oswald, sans-serif', fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', letterSpacing: '0.03em', margin: 0 }}>
              UPCOMING <span style={{ color: '#dc2626' }}>LIVE EVENTS</span>
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
            {UPCOMING.map((ev, i) => (
              <div key={ev.title} style={{ backgroundColor: '#0d0d0d', border: '1px solid #1f1f1f', overflow: 'hidden' }}>
                <div style={{ position: 'relative', height: '180px', overflow: 'hidden' }}>
                  <img src={ev.thumb} alt={ev.title} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.6)' }} />
                  {i === 0 && (
                    <div style={{ position: 'absolute', top: '12px', left: '12px', backgroundColor: '#dc2626', padding: '3px 10px', fontFamily: 'Oswald, sans-serif', fontSize: '10px', letterSpacing: '0.15em', color: '#fff' }}>
                      NEXT UP
                    </div>
                  )}
                </div>
                <div style={{ padding: '24px' }}>
                  <div style={{ display: 'flex', gap: '16px', marginBottom: '12px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: '#6b7280', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.06em' }}>
                      <Calendar style={{ width: '11px', height: '11px', color: '#dc2626' }} /> {ev.date}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: '#6b7280', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.06em' }}>
                      <Clock style={{ width: '11px', height: '11px', color: '#dc2626' }} /> {ev.time}
                    </span>
                  </div>
                  <h3 style={{ fontFamily: 'Oswald, sans-serif', fontSize: '1.05rem', letterSpacing: '0.04em', color: '#fff', marginBottom: '10px', marginTop: 0, lineHeight: 1.3 }}>{ev.title}</h3>
                  <p style={{ fontSize: '13px', lineHeight: 1.75, color: '#6b7280', margin: '0 0 20px' }}>{ev.desc}</p>
                  <a
                    href={YOUTUBE_LIVE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#dc2626', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.08em', textDecoration: 'none' }}
                  >
                    <Bell style={{ width: '12px', height: '12px' }} /> SET REMINDER ON YOUTUBE
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PAST BROADCASTS ──────────────────────────────────────────────────── */}
      <section style={{ padding: '80px 16px', backgroundColor: '#080808', borderTop: '1px solid #005020' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '48px', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <p style={{ fontSize: '11px', letterSpacing: '0.22em', color: '#dc2626', fontFamily: 'Oswald, sans-serif', fontWeight: 600, marginBottom: '10px' }}>ARCHIVE</p>
              <h2 style={{ fontFamily: 'Oswald, sans-serif', fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', letterSpacing: '0.03em', margin: 0 }}>
                PAST <span style={{ color: '#dc2626' }}>BROADCASTS</span>
              </h2>
            </div>
            <a
              href={YOUTUBE_CHANNEL_URL}
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#dc2626', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.08em', textDecoration: 'none' }}
            >
              VIEW ALL ON YOUTUBE <ExternalLink style={{ width: '12px', height: '12px' }} />
            </a>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px' }}>
            {PAST.map(vid => (
              <div
                key={vid.title}
                style={{ backgroundColor: '#0d0d0d', border: '1px solid #1f1f1f', overflow: 'hidden', cursor: 'pointer' }}
                onClick={() => setPlayingId(playingId === vid.id + vid.title ? null : vid.id + vid.title)}
              >
                <div style={{ position: 'relative', aspectRatio: '16/9', overflow: 'hidden' }}>
                  {playingId === vid.id + vid.title ? (
                    <iframe
                      src={`https://www.youtube.com/embed/${vid.id}?autoplay=1&rel=0`}
                      title={vid.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
                    />
                  ) : (
                    <>
                      <img src={vid.thumb} alt={vid.title} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.6)', display: 'block' }} />
                      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(220,38,38,0.88)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Play style={{ width: '18px', height: '18px', color: '#fff', marginLeft: '3px' }} />
                        </div>
                      </div>
                      <div style={{ position: 'absolute', bottom: '8px', right: '8px', display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: 'rgba(0,0,0,0.7)', padding: '3px 8px' }}>
                        <Eye style={{ width: '10px', height: '10px', color: '#9ca3af' }} />
                        <span style={{ fontSize: '10px', color: '#9ca3af', fontFamily: 'Oswald, sans-serif' }}>{vid.views}</span>
                      </div>
                    </>
                  )}
                </div>
                <div style={{ padding: '16px' }}>
                  <p style={{ fontFamily: 'Oswald, sans-serif', fontSize: '13px', letterSpacing: '0.04em', color: '#fff', margin: '0 0 4px', lineHeight: 1.3 }}>{vid.title}</p>
                  <p style={{ fontSize: '11px', color: '#4b5563', margin: 0 }}>{vid.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ───────────────────────────────────────────────────────── */}
      <section style={{ padding: '72px 16px', backgroundColor: '#dc2626', textAlign: 'center' }}>
        <p style={{ fontSize: '11px', letterSpacing: '0.22em', color: 'rgba(255,255,255,0.7)', fontFamily: 'Oswald, sans-serif', marginBottom: '12px' }}>STAY CONNECTED</p>
        <h2 style={{ fontFamily: 'Oswald, sans-serif', fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', letterSpacing: '0.03em', color: '#fff', marginBottom: '16px' }}>
          Never Miss a Moment
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '15px', marginBottom: '32px', maxWidth: '500px', margin: '0 auto 32px' }}>
          Subscribe to the Build One Zambia YouTube channel for live rallies, debates, and election night coverage.
        </p>
        <a
          href={YOUTUBE_CHANNEL_URL}
          target="_blank"
          rel="noopener noreferrer"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: '#fff', color: '#dc2626', padding: '14px 32px', fontFamily: 'Oswald, sans-serif', fontSize: '14px', letterSpacing: '0.1em', textDecoration: 'none', fontWeight: 700 }}
        >
          <Play style={{ width: '16px', height: '16px' }} /> SUBSCRIBE ON YOUTUBE
        </a>
      </section>

    </div>
  );
}

export default LiveStreamingPage;
