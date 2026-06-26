import { useState } from 'react';
import { Play, X, ChevronLeft, ChevronRight, Images, Video, ExternalLink, Camera } from 'lucide-react';

type Tab = 'photos' | 'videos';

const PHOTO_EVENTS = [
  {
    event: 'Copperbelt Grand Rally — Kitwe',
    date: 'Sat 28 May 2026',
    photos: [
      { id: 'p1', src: 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=900&h=600&fit=crop&auto=format', caption: 'Thousands of supporters fill Nkana Stadium grounds' },
      { id: 'p2', src: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=900&h=600&fit=crop&auto=format', caption: 'Hon. Vincent Kafula addresses the crowd' },
      { id: 'p3', src: 'https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?w=900&h=600&fit=crop&auto=format', caption: 'Supporters wave party flags at the rally' },
      { id: 'p4', src: 'https://images.unsplash.com/photo-1519671282429-b44b4a78fdf2?w=900&h=600&fit=crop&auto=format', caption: 'Cultural performances before the main address' },
    ],
  },
  {
    event: 'Manifesto Launch — Lusaka',
    date: 'Fri 1 May 2026',
    photos: [
      { id: 'p5', src: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=900&h=600&fit=crop&auto=format', caption: 'The 2031 manifesto unveiled at Mulungushi Conference Centre' },
      { id: 'p6', src: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=900&h=600&fit=crop&auto=format', caption: 'National leadership signs the manifesto document' },
      { id: 'p7', src: 'https://images.unsplash.com/photo-1552581234-26160f608093?w=900&h=600&fit=crop&auto=format', caption: 'Press conference after the launch ceremony' },
    ],
  },
  {
    event: 'Women in Leadership Symposium',
    date: 'Sun 8 Mar 2026',
    photos: [
      { id: 'p8', src: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=900&h=600&fit=crop&auto=format', caption: 'Women delegates from all 10 provinces gather in Lusaka' },
      { id: 'p9', src: 'https://images.unsplash.com/photo-1543269665-06d2d9e48aca?w=900&h=600&fit=crop&auto=format', caption: 'Panel discussion on women\'s political participation' },
      { id: 'p10', src: 'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=900&h=600&fit=crop&auto=format', caption: 'Award ceremony recognising women community leaders' },
      { id: 'p11', src: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=900&h=600&fit=crop&auto=format', caption: 'Networking session between provinces' },
    ],
  },
  {
    event: 'Eastern Province Farmers\' Forum',
    date: 'Wed 15 Apr 2026',
    photos: [
      { id: 'p12', src: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=900&h=600&fit=crop&auto=format', caption: 'Smallholder farmers discuss policy priorities in Chipata' },
      { id: 'p13', src: 'https://images.unsplash.com/photo-1595273670150-bd0c3c392e46?w=900&h=600&fit=crop&auto=format', caption: 'Agricultural demonstration plots visited by BOZ officials' },
      { id: 'p14', src: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=900&h=600&fit=crop&auto=format', caption: 'Farmers present their challenges to the BOZ policy team' },
    ],
  },
  {
    event: 'Youth Economic Forum — Ndola',
    date: 'Sat 20 Mar 2026',
    photos: [
      { id: 'p15', src: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=900&h=600&fit=crop&auto=format', caption: 'Young entrepreneurs pitch business ideas to BOZ panel' },
      { id: 'p16', src: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=900&h=600&fit=crop&auto=format', caption: 'Youth delegates in breakout sessions' },
      { id: 'p17', src: 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=900&h=600&fit=crop&auto=format', caption: 'Group photo of forum participants' },
    ],
  },
];

const VIDEOS = [
  {
    id: 'v1',
    title: 'Copperbelt Grand Rally — Full Coverage',
    event: 'Copperbelt Grand Rally',
    date: '28 May 2026',
    duration: '1:24:15',
    videoId: 'dQw4w9WgXcQ',
    thumb: 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=800&h=450&fit=crop&auto=format',
    description: 'Complete live coverage of the historic Copperbelt Grand Rally at Nkana Stadium, Kitwe — featuring addresses by the full national leadership.',
  },
  {
    id: 'v2',
    title: 'Build One Zambia Manifesto Launch',
    event: 'Manifesto Launch',
    date: '1 May 2026',
    duration: '58:40',
    videoId: 'dQw4w9WgXcQ',
    thumb: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&h=450&fit=crop&auto=format',
    description: 'The official launch of the BOZ 2031 Election Manifesto at Mulungushi International Conference Centre, Lusaka.',
  },
  {
    id: 'v3',
    title: 'Women in Leadership Symposium Highlights',
    event: 'Women\'s Symposium',
    date: '8 Mar 2026',
    duration: '42:10',
    videoId: 'dQw4w9WgXcQ',
    thumb: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&h=450&fit=crop&auto=format',
    description: 'Key moments from the Build One Zambia Women in Leadership Symposium, bringing together women delegates from all 10 provinces.',
  },
  {
    id: 'v4',
    title: 'Eastern Province Farmers\' Forum',
    event: 'Farmers\' Forum',
    date: '15 Apr 2026',
    duration: '1:05:32',
    videoId: 'dQw4w9WgXcQ',
    thumb: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&h=450&fit=crop&auto=format',
    description: 'Full recording of the Eastern Province Agricultural Forum held in Chipata, featuring smallholder farmers and BOZ policy officials.',
  },
  {
    id: 'v5',
    title: 'Youth Economic Forum — Ndola',
    event: 'Youth Forum',
    date: '20 Mar 2026',
    duration: '38:55',
    videoId: 'dQw4w9WgXcQ',
    thumb: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=800&h=450&fit=crop&auto=format',
    description: 'Highlights from the BOZ Youth Economic Forum in Ndola, where young Zambians shared their economic vision for the country.',
  },
  {
    id: 'v6',
    title: 'National Leadership Press Conference — June 2026',
    event: 'Press Conference',
    date: '5 Jun 2026',
    duration: '55:20',
    videoId: 'dQw4w9WgXcQ',
    thumb: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=450&fit=crop&auto=format',
    description: 'The full June 2026 national leadership press conference addressing election readiness, polling agents, and campaign updates.',
  },
];

const allPhotos = PHOTO_EVENTS.flatMap(ev => ev.photos.map(p => ({ ...p, event: ev.event, date: ev.date })));

interface LightboxPhoto {
  src: string;
  caption: string;
  event: string;
  date: string;
  index: number;
}

export function EventsGalleryPage() {
  const [tab, setTab] = useState<Tab>('photos');
  const [lightbox, setLightbox] = useState<LightboxPhoto | null>(null);
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);
  const [filterEvent, setFilterEvent] = useState('ALL');

  const eventNames = ['ALL', ...PHOTO_EVENTS.map(e => e.event)];

  const filteredPhotos = filterEvent === 'ALL'
    ? allPhotos
    : allPhotos.filter(p => p.event === filterEvent);

  const openLightbox = (photo: typeof allPhotos[0], index: number) => {
    setLightbox({ ...photo, index });
  };

  const navLightbox = (dir: -1 | 1) => {
    if (!lightbox) return;
    const newIndex = (lightbox.index + dir + filteredPhotos.length) % filteredPhotos.length;
    const p = filteredPhotos[newIndex];
    setLightbox({ ...p, index: newIndex });
  };

  return (
    <div style={{ backgroundColor: '#080808', fontFamily: 'Open Sans, sans-serif', color: '#fff', minHeight: '100vh' }}>

      {/* Hero */}
      <section style={{ position: 'relative', padding: '96px 16px 64px', overflow: 'hidden', background: 'linear-gradient(135deg, #007A30 0%, #006B28 40%, #1a0000 100%)' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 50% 40%, rgba(220,38,38,0.12) 0%, transparent 60%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', maxWidth: '760px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(220,38,38,0.12)', border: '1px solid rgba(220,38,38,0.3)', padding: '6px 16px', marginBottom: '28px' }}>
            <Camera style={{ width: '13px', height: '13px', color: '#dc2626' }} />
            <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: '11px', letterSpacing: '0.2em', color: '#dc2626' }}>CAMPAIGN MOMENTS</span>
          </div>
          <h1 style={{ fontFamily: 'Oswald, sans-serif', fontSize: 'clamp(2.4rem, 6vw, 4rem)', lineHeight: 1.08, letterSpacing: '0.03em', marginBottom: '20px' }}>
            EVENTS <span style={{ color: '#dc2626' }}>GALLERY</span>
          </h1>
          <p style={{ color: '#9ca3af', fontSize: '1.05rem', lineHeight: 1.85, maxWidth: '520px', margin: '0 auto' }}>
            Photos and videos from Build One Zambia rallies, forums, symposiums, and campaign events across all 10 provinces.
          </p>
        </div>
      </section>

      {/* Tab bar */}
      <div style={{ backgroundColor: '#007A30', borderBottom: '1px solid #005020', position: 'sticky', top: '80px', zIndex: 10 }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 16px', display: 'flex', gap: '0', alignItems: 'center' }}>
          {([{ key: 'photos' as Tab, Icon: Images, label: 'PHOTOS' }, { key: 'videos' as Tab, Icon: Video, label: 'VIDEOS' }]).map(({ key, Icon, label }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                background: 'none', border: 'none',
                borderBottom: `2px solid ${tab === key ? '#dc2626' : 'transparent'}`,
                color: tab === key ? '#dc2626' : '#6b7280',
                padding: '16px 24px', fontFamily: 'Oswald, sans-serif',
                fontSize: '13px', letterSpacing: '0.1em', cursor: 'pointer',
                transition: 'color 0.2s',
              }}
            >
              <Icon style={{ width: '14px', height: '14px' }} /> {label}
            </button>
          ))}
          <span style={{ marginLeft: 'auto', fontSize: '12px', color: '#4b5563', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.06em' }}>
            {tab === 'photos' ? `${filteredPhotos.length} PHOTOS` : `${VIDEOS.length} VIDEOS`}
          </span>
        </div>
      </div>

      {/* PHOTOS TAB */}
      {tab === 'photos' && (
        <section style={{ padding: '48px 16px 96px' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

            {/* Event filter */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '40px', overflowX: 'auto' }}>
              {eventNames.map(name => (
                <button
                  key={name}
                  onClick={() => setFilterEvent(name)}
                  style={{
                    background: filterEvent === name ? '#dc2626' : 'transparent',
                    border: `1px solid ${filterEvent === name ? '#dc2626' : '#2a2a2a'}`,
                    color: filterEvent === name ? '#fff' : '#6b7280',
                    padding: '7px 16px', fontFamily: 'Oswald, sans-serif',
                    fontSize: '11px', letterSpacing: '0.1em', cursor: 'pointer',
                    whiteSpace: 'nowrap', transition: 'all 0.2s',
                  }}
                >
                  {name === 'ALL' ? 'ALL EVENTS' : name}
                </button>
              ))}
            </div>

            {/* Photo grid */}
            <div style={{ columns: '3 280px', gap: '12px' }}>
              {filteredPhotos.map((photo, i) => (
                <div
                  key={photo.id}
                  onClick={() => openLightbox(photo, i)}
                  style={{ breakInside: 'avoid', marginBottom: '12px', cursor: 'pointer', position: 'relative', overflow: 'hidden', display: 'block' }}
                >
                  <img
                    src={photo.src}
                    alt={photo.caption}
                    style={{ width: '100%', display: 'block', transition: 'transform 0.4s' }}
                    onMouseEnter={e => (e.currentTarget as HTMLImageElement).style.transform = 'scale(1.04)'}
                    onMouseLeave={e => (e.currentTarget as HTMLImageElement).style.transform = 'scale(1)'}
                  />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 50%)', opacity: 0, transition: 'opacity 0.3s', pointerEvents: 'none' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.opacity = '1'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.opacity = '0'}
                  />
                  <div style={{ position: 'absolute', bottom: '10px', left: '12px', right: '12px' }}>
                    <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.0)', fontFamily: 'Oswald, sans-serif', margin: 0, transition: 'color 0.3s', letterSpacing: '0.05em' }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.9)'}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0)'}
                    >{photo.caption}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* VIDEOS TAB */}
      {tab === 'videos' && (
        <section style={{ padding: '48px 16px 96px' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '24px' }}>
              {VIDEOS.map(video => (
                <div key={video.id} style={{ backgroundColor: '#0d0d0d', border: '1px solid #1f1f1f', overflow: 'hidden' }}>
                  {/* Player or thumb */}
                  {playingVideo === video.id ? (
                    <iframe
                      src={`https://www.youtube.com/embed/${video.videoId}?autoplay=1&rel=0`}
                      title={video.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      style={{ width: '100%', aspectRatio: '16/9', border: 'none', display: 'block' }}
                    />
                  ) : (
                    <div
                      onClick={() => setPlayingVideo(video.id)}
                      style={{ position: 'relative', aspectRatio: '16/9', overflow: 'hidden', cursor: 'pointer' }}
                    >
                      <img src={video.thumb} alt={video.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', filter: 'brightness(0.55)', transition: 'transform 0.4s' }}
                        onMouseEnter={e => (e.currentTarget as HTMLImageElement).style.transform = 'scale(1.04)'}
                        onMouseLeave={e => (e.currentTarget as HTMLImageElement).style.transform = 'scale(1)'}
                      />
                      {/* Duration badge */}
                      <span style={{ position: 'absolute', bottom: '10px', right: '10px', backgroundColor: 'rgba(0,0,0,0.8)', color: '#fff', fontSize: '11px', padding: '2px 7px', fontFamily: 'Oswald, sans-serif' }}>{video.duration}</span>
                      {/* Play button */}
                      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: 'rgba(220,38,38,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 0 12px rgba(220,38,38,0.18)' }}>
                          <Play style={{ width: '22px', height: '22px', color: '#fff', marginLeft: '4px' }} />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Info */}
                  <div style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '10px', backgroundColor: 'rgba(220,38,38,0.12)', color: '#dc2626', padding: '3px 9px', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.1em' }}>{video.event}</span>
                      <span style={{ fontSize: '11px', color: '#4b5563' }}>{video.date}</span>
                    </div>
                    <h3 style={{ fontFamily: 'Oswald, sans-serif', fontSize: '1rem', letterSpacing: '0.04em', color: '#fff', marginBottom: '10px', lineHeight: 1.3 }}>{video.title}</h3>
                    <p style={{ fontSize: '13px', lineHeight: 1.75, color: '#6b7280', margin: '0 0 16px' }}>{video.description}</p>
                    <a
                      href={`https://www.youtube.com/watch?v=${video.videoId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: '#dc2626', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.08em', textDecoration: 'none' }}
                    >
                      <ExternalLink style={{ width: '12px', height: '12px' }} /> WATCH ON YOUTUBE
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div
          onClick={() => setLightbox(null)}
          style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.95)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}
        >
          {/* Close */}
          <button
            onClick={() => setLightbox(null)}
            style={{ position: 'absolute', top: '20px', right: '20px', background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10 }}
          >
            <X style={{ width: '18px', height: '18px' }} />
          </button>

          {/* Prev */}
          <button
            onClick={e => { e.stopPropagation(); navLightbox(-1); }}
            style={{ position: 'absolute', left: '16px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
          >
            <ChevronLeft style={{ width: '20px', height: '20px' }} />
          </button>

          {/* Image */}
          <div onClick={e => e.stopPropagation()} style={{ maxWidth: '900px', width: '100%' }}>
            <img src={lightbox.src} alt={lightbox.caption} style={{ width: '100%', maxHeight: '75vh', objectFit: 'contain', display: 'block' }} />
            <div style={{ marginTop: '16px', textAlign: 'center' }}>
              <p style={{ fontFamily: 'Oswald, sans-serif', fontSize: '15px', color: '#fff', margin: '0 0 4px', letterSpacing: '0.04em' }}>{lightbox.caption}</p>
              <p style={{ fontSize: '12px', color: '#4b5563', margin: 0 }}>{lightbox.event} · {lightbox.date}</p>
              <p style={{ fontSize: '11px', color: '#2a2a2a', margin: '8px 0 0', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.08em' }}>
                {lightbox.index + 1} / {filteredPhotos.length}
              </p>
            </div>
          </div>

          {/* Next */}
          <button
            onClick={e => { e.stopPropagation(); navLightbox(1); }}
            style={{ position: 'absolute', right: '16px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
          >
            <ChevronRight style={{ width: '20px', height: '20px' }} />
          </button>
        </div>
      )}

      {/* CTA */}
      <section style={{ padding: '72px 16px', backgroundColor: '#dc2626', textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'Oswald, sans-serif', fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', letterSpacing: '0.03em', color: '#fff', marginBottom: '12px' }}>
          Be Part of the Movement
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '15px', margin: '0 auto 28px', maxWidth: '480px' }}>
          Join us at upcoming events across Zambia and help build the nation we deserve.
        </p>
        <a
          href="https://www.youtube.com/@BuildOneZambia"
          target="_blank"
          rel="noopener noreferrer"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: '#fff', color: '#dc2626', padding: '14px 32px', fontFamily: 'Oswald, sans-serif', fontSize: '14px', letterSpacing: '0.1em', textDecoration: 'none', fontWeight: 700 }}
        >
          <Video style={{ width: '16px', height: '16px' }} /> WATCH MORE ON YOUTUBE
        </a>
      </section>
    </div>
  );
}

export default EventsGalleryPage;
