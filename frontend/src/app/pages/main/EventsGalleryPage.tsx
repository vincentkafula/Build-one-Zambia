import { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Camera, Video } from 'lucide-react';
import { API_BASE } from '../../lib/apiBase';

interface BOZEvent {
  id: string;
  title: string;
  date: string;
  time?: string;
  venue: string;
  province?: string;
  type?: string;
  description: string;
  status: string;
  featured?: boolean;
  hasPhoto?: boolean;
}

function eventPhotoUrl(id: string) { return `${API_BASE}/events/${id}/photo`; }

function fmtDate(d: string) {
  const parsed = new Date(d);
  if (isNaN(parsed.getTime())) return d;
  return parsed.toLocaleDateString('en-ZM', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
}

interface LightboxItem { src: string; title: string; date: string; venue: string; index: number; }

export function EventsGalleryPage() {
  const [events, setEvents] = useState<BOZEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState<LightboxItem | null>(null);
  const [filterType, setFilterType] = useState('ALL');

  useEffect(() => {
    fetch(`${API_BASE}/events`)
      .then(r => r.json())
      .then(data => setEvents((data.events || []).filter((e: BOZEvent) => e.hasPhoto)))
      .catch(() => { /* leave empty — the empty-state message below handles this */ })
      .finally(() => setLoading(false));
  }, []);

  const types = ['ALL', ...Array.from(new Set(events.map(e => e.type).filter(Boolean)))] as string[];
  const filtered = filterType === 'ALL' ? events : events.filter(e => e.type === filterType);

  const openLightbox = (ev: BOZEvent, index: number) => {
    setLightbox({ src: eventPhotoUrl(ev.id), title: ev.title, date: fmtDate(ev.date), venue: ev.venue, index });
  };
  const navLightbox = (dir: 1 | -1) => {
    if (!lightbox) return;
    const next = (lightbox.index + dir + filtered.length) % filtered.length;
    const ev = filtered[next];
    setLightbox({ src: eventPhotoUrl(ev.id), title: ev.title, date: fmtDate(ev.date), venue: ev.venue, index: next });
  };

  return (
    <div style={{ backgroundColor: '#111111', fontFamily: 'Open Sans, sans-serif', color: '#111111', minHeight: '100vh' }}>

      {/* Hero */}
      <section style={{ position: 'relative', padding: '96px 16px 56px', overflow: 'hidden', background: 'linear-gradient(135deg, #007A30 0%, #006B28 40%, #1a0000 100%)' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 50% 40%, rgba(220,38,38,0.10) 0%, transparent 60%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', maxWidth: '760px', margin: '0 auto', textAlign: 'center' }}>
          <p style={{ fontSize: '11px', letterSpacing: '0.22em', color: '#dc2626', fontFamily: 'Oswald, sans-serif', fontWeight: 600, marginBottom: '14px' }}>BUILD ONE ZAMBIA</p>
          <h1 style={{ fontFamily: 'Oswald, sans-serif', fontSize: 'clamp(2.2rem, 5vw, 3.6rem)', lineHeight: 1.1, letterSpacing: '0.03em', marginBottom: '18px' }}>
            EVENTS <span style={{ color: '#dc2626' }}>GALLERY</span>
          </h1>
          <p style={{ color: '#9ca3af', fontSize: '1.02rem', lineHeight: 1.85, maxWidth: '520px', margin: '0 auto' }}>
            Photos from rallies, forums, and events across the Build One Zambia movement.
          </p>
        </div>
      </section>

      {/* Type filter */}
      {types.length > 1 && (
        <div style={{ backgroundColor: '#007A30', borderBottom: '1px solid #005020', overflowX: 'auto' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 16px', display: 'flex' }}>
            {types.map(t => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                style={{
                  background: 'none', border: 'none', borderBottom: `2px solid ${filterType === t ? '#dc2626' : 'transparent'}`,
                  color: filterType === t ? '#dc2626' : '#6b7280',
                  padding: '16px 20px', fontFamily: 'Oswald, sans-serif', fontSize: '12px',
                  letterSpacing: '0.1em', cursor: 'pointer', whiteSpace: 'nowrap',
                }}
              >
                {t.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Photo grid */}
      <section style={{ padding: '56px 16px 40px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {loading && (
            <p style={{ textAlign: 'center', color: '#4b5563', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.06em', padding: '60px 0' }}>Loading gallery…</p>
          )}
          {!loading && filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 16px', color: '#4b5563' }}>
              <Camera style={{ width: '32px', height: '32px', margin: '0 auto 16px', opacity: 0.5 }} />
              <p style={{ fontFamily: 'Oswald, sans-serif', fontSize: '1.05rem', letterSpacing: '0.05em' }}>No event photos have been added yet.</p>
            </div>
          )}
          {!loading && filtered.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '18px' }}>
              {filtered.map((ev, i) => (
                <div
                  key={ev.id}
                  onClick={() => openLightbox(ev, i)}
                  style={{ position: 'relative', cursor: 'pointer', overflow: 'hidden', backgroundColor: '#1a1a1a', border: '1px solid #1f1f1f' }}
                >
                  <img src={eventPhotoUrl(ev.id)} alt={ev.title} style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover', display: 'block' }} />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 45%)' }} />
                  <div style={{ position: 'absolute', bottom: '10px', left: '12px', right: '12px' }}>
                    <p style={{ fontFamily: 'Oswald, sans-serif', fontSize: '13px', color: '#fff', margin: '0 0 2px', letterSpacing: '0.03em' }}>{ev.title}</p>
                    <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)', margin: 0 }}>{fmtDate(ev.date)}{ev.venue ? ` · ${ev.venue}` : ''}</p>
                  </div>
                  {ev.featured && (
                    <span style={{ position: 'absolute', top: '10px', left: '10px', backgroundColor: '#dc2626', color: '#fff', fontSize: '9px', padding: '3px 8px', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.12em' }}>FEATURED</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Video note — honest placeholder, since there's no video-events
          backend yet (only single photo-per-event is supported). Rather
          than show 6 videos that all pointed at the same YouTube video ID
          regardless of their captions, this links out to the real channel
          instead of fabricating content that doesn't exist here. */}
      <section style={{ padding: '48px 16px 80px', textAlign: 'center', borderTop: '1px solid #005020' }}>
        <Video style={{ width: '26px', height: '26px', color: '#dc2626', margin: '0 auto 16px' }} />
        <p style={{ fontFamily: 'Oswald, sans-serif', fontSize: '1.1rem', letterSpacing: '0.04em', color: '#111111', marginBottom: '10px' }}>Looking for event videos?</p>
        <p style={{ color: '#9ca3af', fontSize: '14px', marginBottom: '24px', maxWidth: '440px', margin: '0 auto 24px' }}>
          Full rally and event coverage is posted to the official YouTube channel.
        </p>
        <a
          href="https://www.youtube.com/@BuildOneZambia"
          target="_blank"
          rel="noopener noreferrer"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: '#dc2626', color: '#fff', padding: '12px 28px', fontFamily: 'Oswald, sans-serif', fontSize: '13px', letterSpacing: '0.1em', textDecoration: 'none' }}
        >
          WATCH ON YOUTUBE
        </a>
      </section>

      {/* Lightbox */}
      {lightbox && (
        <div
          onClick={() => setLightbox(null)}
          style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.95)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}
        >
          <button
            onClick={() => setLightbox(null)}
            style={{ position: 'absolute', top: '20px', right: '20px', background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10 }}
          >
            <X style={{ width: '18px', height: '18px' }} />
          </button>

          {filtered.length > 1 && (
            <button
              onClick={e => { e.stopPropagation(); navLightbox(-1); }}
              style={{ position: 'absolute', left: '16px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            >
              <ChevronLeft style={{ width: '20px', height: '20px' }} />
            </button>
          )}

          <div onClick={e => e.stopPropagation()} style={{ maxWidth: '900px', width: '100%' }}>
            <img src={lightbox.src} alt={lightbox.title} style={{ width: '100%', maxHeight: '75vh', objectFit: 'contain', display: 'block' }} />
            <div style={{ marginTop: '16px', textAlign: 'center' }}>
              <p style={{ fontFamily: 'Oswald, sans-serif', fontSize: '15px', color: '#fff', margin: '0 0 4px', letterSpacing: '0.04em' }}>{lightbox.title}</p>
              <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0 }}>{lightbox.date}{lightbox.venue ? ` · ${lightbox.venue}` : ''}</p>
              <p style={{ fontSize: '11px', color: '#4b5563', margin: '8px 0 0', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.08em' }}>
                {lightbox.index + 1} / {filtered.length}
              </p>
            </div>
          </div>

          {filtered.length > 1 && (
            <button
              onClick={e => { e.stopPropagation(); navLightbox(1); }}
              style={{ position: 'absolute', right: '16px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            >
              <ChevronRight style={{ width: '20px', height: '20px' }} />
            </button>
          )}
        </div>
      )}

      {/* CTA */}
      <section style={{ padding: '72px 16px', backgroundColor: '#dc2626', textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'Oswald, sans-serif', fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', letterSpacing: '0.03em', color: '#111111', marginBottom: '12px' }}>
          Be Part of the Movement
        </h2>
        <p style={{ color: 'rgba(17,17,17,0.85)', fontSize: '15px', margin: '0 auto 28px', maxWidth: '480px' }}>
          Join us at upcoming events across Zambia and help build the nation we deserve.
        </p>
        <a
          href="https://www.youtube.com/@BuildOneZambia"
          target="_blank"
          rel="noopener noreferrer"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: '#fff', color: '#dc2626', padding: '14px 32px', fontFamily: 'Oswald, sans-serif', fontSize: '14px', letterSpacing: '0.1em', textDecoration: 'none', fontWeight: 700 }}
        >
          WATCH MORE ON YOUTUBE
        </a>
      </section>
    </div>
  );
}

export default EventsGalleryPage;
