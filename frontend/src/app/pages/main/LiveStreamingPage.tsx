import { useState, useEffect } from 'react';
import { Play, Radio, Calendar, Clock, Eye, ExternalLink, Bell, Wifi } from 'lucide-react';
import { LiveStreamViewer } from '../../components/LiveStreamViewer';
import { streamApi } from '../../lib/api';

const YOUTUBE_CHANNEL_URL = 'https://www.youtube.com/@BuildOneZambia';
const YOUTUBE_LIVE_URL    = 'https://www.youtube.com/@BuildOneZambia/streams';

interface StreamItem {
  id: string;
  title: string;
  description?: string;
  status: 'scheduled' | 'live' | 'ended' | 'cancelled';
  scheduledAt: string;
  thumbnailUrl?: string;
  streamUrl?: string;
  embedUrl?: string;
  viewerCount?: number;
}

const STATS = [
  { value: '13.5K', label: 'Registered Polling Stations', sub: 'across Zambia' },
  { value: '226',   label: 'Constituencies', sub: 'fully covered' },
  { value: '10',    label: 'Provinces', sub: 'monitored nationwide' },
  { value: '14 Aug', label: 'Election Day', sub: '2031 General Election' },
];

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-ZM', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
}
function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-ZM', { hour: '2-digit', minute: '2-digit' }) + ' CAT';
}

export function LiveStreamingPage() {
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [upcoming, setUpcoming] = useState<StreamItem[]>([]);
  const [past, setPast] = useState<StreamItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      streamApi.list({ status: 'scheduled' }) as unknown as Promise<{ streams: StreamItem[] }>,
      streamApi.list({ status: 'ended' }) as unknown as Promise<{ streams: StreamItem[] }>,
    ])
      .then(([up, ended]) => {
        setUpcoming((up.streams || []).slice(0, 6));
        setPast((ended.streams || []).slice(0, 8));
      })
      .catch(() => { /* leave empty — sections below handle the empty state */ })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ backgroundColor: '#111111', fontFamily: 'Open Sans, sans-serif', color: '#111111', minHeight: '100vh' }}>

      {/* ── HERO ────────────────────────────────────────────────────────────── */}
      <section style={{ position: 'relative', overflow: 'hidden', backgroundColor: '#111111', padding: '80px 16px 56px' }}>
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'radial-gradient(circle at 30% 50%, rgba(220,38,38,0.18) 0%, transparent 55%), radial-gradient(circle at 80% 20%, rgba(220,38,38,0.08) 0%, transparent 40%)',
          pointerEvents: 'none',
        }} />

        <div style={{ position: 'relative', maxWidth: '820px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(220,38,38,0.15)', border: '1px solid rgba(220,38,38,0.35)', padding: '6px 14px', marginBottom: '28px' }}>
            <Wifi style={{ width: '13px', height: '13px', color: '#dc2626' }} />
            <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: '11px', letterSpacing: '0.2em', color: '#dc2626' }}>LIVE BROADCASTING</span>
          </div>

          <h1 style={{ fontFamily: 'Oswald, sans-serif', fontSize: 'clamp(2.2rem, 5vw, 3.8rem)', lineHeight: 1.08, letterSpacing: '0.03em', marginBottom: '20px' }}>
            WATCH BUILD ONE ZAMBIA <span style={{ color: '#dc2626' }}>LIVE</span>
          </h1>
          <p style={{ color: '#9ca3af', fontSize: '15px', lineHeight: 1.8, marginBottom: '40px', maxWidth: '520px', margin: '0 auto 40px' }}>
            Stream rallies, policy debates, press conferences, and election night coverage — live and on demand from every corner of Zambia.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1px', backgroundColor: '#005020', border: '1px solid #005020', marginBottom: '40px', maxWidth: '640px', marginLeft: 'auto', marginRight: 'auto' }}>
            {STATS.map(s => (
              <div key={s.label} style={{ backgroundColor: '#111111', padding: '20px 12px' }}>
                <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 'clamp(1.2rem, 2.5vw, 1.8rem)', color: '#111111', letterSpacing: '0.02em', lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: '10px', color: '#dc2626', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.06em', marginTop: '4px' }}>{s.label}</div>
                <div style={{ fontSize: '10px', color: '#4b5563', marginTop: '2px' }}>{s.sub}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
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
      </section>

      {/* ── LIVE STREAM VIEWER — the actual watch experience, backed by real
           data (current live stream, viewer count, live chat). The hero
           above used to also embed its own video player pointed at a
           literal placeholder ID that could never play; removed rather
           than duplicate (and fake) what this component already does
           correctly. ────────────────────────────────────────────────── */}
      <section style={{ padding: '0', backgroundColor: '#111111', borderTop: '1px solid #005020' }}>
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

          {!loading && upcoming.length === 0 && (
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px' }}>No upcoming streams scheduled right now — check back soon, or watch past broadcasts below.</p>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
            {upcoming.map((ev, i) => (
              <div key={ev.id} style={{ backgroundColor: '#111111', border: '1px solid #1f1f1f', overflow: 'hidden' }}>
                <div style={{ position: 'relative', height: '180px', overflow: 'hidden' }}>
                  <img src={ev.thumbnailUrl || 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=600&h=340&fit=crop&auto=format'} alt={ev.title} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.6)' }} />
                  {i === 0 && (
                    <div style={{ position: 'absolute', top: '12px', left: '12px', backgroundColor: '#dc2626', padding: '3px 10px', fontFamily: 'Oswald, sans-serif', fontSize: '10px', letterSpacing: '0.15em', color: '#fff' }}>
                      NEXT UP
                    </div>
                  )}
                </div>
                <div style={{ padding: '24px' }}>
                  <div style={{ display: 'flex', gap: '16px', marginBottom: '12px', flexWrap: 'wrap' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: '#6b7280', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.06em' }}>
                      <Calendar style={{ width: '11px', height: '11px', color: '#dc2626' }} /> {fmtDate(ev.scheduledAt)}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: '#6b7280', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.06em' }}>
                      <Clock style={{ width: '11px', height: '11px', color: '#dc2626' }} /> {fmtTime(ev.scheduledAt)}
                    </span>
                  </div>
                  <h3 style={{ fontFamily: 'Oswald, sans-serif', fontSize: '1.05rem', letterSpacing: '0.04em', color: '#111111', marginBottom: '10px', marginTop: 0, lineHeight: 1.3 }}>{ev.title}</h3>
                  {ev.description && <p style={{ fontSize: '13px', lineHeight: 1.75, color: '#6b7280', margin: '0 0 20px' }}>{ev.description}</p>}
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
      <section style={{ padding: '80px 16px', backgroundColor: '#111111', borderTop: '1px solid #005020' }}>
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

          {!loading && past.length === 0 && (
            <p style={{ color: '#6b7280', fontSize: '14px' }}>No past broadcasts recorded yet.</p>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px' }}>
            {past.map(vid => (
              <div
                key={vid.id}
                style={{ backgroundColor: '#111111', border: '1px solid #1f1f1f', overflow: 'hidden', cursor: vid.embedUrl || vid.streamUrl ? 'pointer' : 'default' }}
                onClick={() => (vid.embedUrl || vid.streamUrl) && setPlayingId(playingId === vid.id ? null : vid.id)}
              >
                <div style={{ position: 'relative', aspectRatio: '16/9', overflow: 'hidden' }}>
                  {playingId === vid.id && (vid.embedUrl || vid.streamUrl) ? (
                    <iframe
                      src={vid.embedUrl || vid.streamUrl}
                      title={vid.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
                    />
                  ) : (
                    <>
                      <img src={vid.thumbnailUrl || 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&h=340&fit=crop&auto=format'} alt={vid.title} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.6)', display: 'block' }} />
                      {(vid.embedUrl || vid.streamUrl) && (
                        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(220,38,38,0.88)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Play style={{ width: '18px', height: '18px', color: '#111111', marginLeft: '3px' }} />
                          </div>
                        </div>
                      )}
                      {typeof vid.viewerCount === 'number' && (
                        <div style={{ position: 'absolute', bottom: '8px', right: '8px', display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: 'rgba(0,0,0,0.7)', padding: '3px 8px' }}>
                          <Eye style={{ width: '10px', height: '10px', color: '#9ca3af' }} />
                          <span style={{ fontSize: '10px', color: '#9ca3af', fontFamily: 'Oswald, sans-serif' }}>{vid.viewerCount.toLocaleString()}</span>
                        </div>
                      )}
                    </>
                  )}
                </div>
                <div style={{ padding: '16px' }}>
                  <p style={{ fontFamily: 'Oswald, sans-serif', fontSize: '13px', letterSpacing: '0.04em', color: '#111111', margin: '0 0 4px', lineHeight: 1.3 }}>{vid.title}</p>
                  <p style={{ fontSize: '11px', color: '#4b5563', margin: 0 }}>{fmtDate(vid.scheduledAt)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ───────────────────────────────────────────────────────── */}
      <section style={{ padding: '72px 16px', backgroundColor: '#dc2626', textAlign: 'center' }}>
        <p style={{ fontSize: '11px', letterSpacing: '0.22em', color: 'rgba(17,17,17,0.7)', fontFamily: 'Oswald, sans-serif', marginBottom: '12px' }}>STAY CONNECTED</p>
        <h2 style={{ fontFamily: 'Oswald, sans-serif', fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', letterSpacing: '0.03em', color: '#111111', marginBottom: '16px' }}>
          Never Miss a Moment
        </h2>
        <p style={{ color: 'rgba(17,17,17,0.8)', fontSize: '15px', marginBottom: '32px', maxWidth: '500px', margin: '0 auto 32px' }}>
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
