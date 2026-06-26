import { useState } from 'react';
import { Play, Music, ExternalLink, Youtube, Mic2, Radio } from 'lucide-react';

// Replace video IDs with real BOZ music video IDs from YouTube
const FEATURED = {
  title: 'Build One Zambia — Official Campaign Anthem 2031',
  artist: 'BOZ Campaign Music',
  videoId: 'dQw4w9WgXcQ',
  description: 'The official Build One Zambia 2031 election anthem — a unifying call to every Zambian to rise, vote, and build the nation we deserve.',
};

const TRACKS = [
  {
    id: 'track-1',
    title: 'One Zambia, One Nation',
    artist: 'BOZ Choir',
    videoId: 'dQw4w9WgXcQ',
    duration: '4:12',
    thumb: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop&auto=format',
  },
  {
    id: 'track-2',
    title: 'Rise Up Zambia',
    artist: 'Vincent Kafula ft. BOZ Youth Choir',
    videoId: 'dQw4w9WgXcQ',
    duration: '3:45',
    thumb: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=400&fit=crop&auto=format',
  },
  {
    id: 'track-3',
    title: 'Build the Nation',
    artist: 'BOZ Campaign Band',
    videoId: 'dQw4w9WgXcQ',
    duration: '5:02',
    thumb: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=400&h=400&fit=crop&auto=format',
  },
  {
    id: 'track-4',
    title: 'Zambia Forward',
    artist: 'BOZ Cultural Ensemble',
    videoId: 'dQw4w9WgXcQ',
    duration: '3:58',
    thumb: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400&h=400&fit=crop&auto=format',
  },
  {
    id: 'track-5',
    title: 'Vote for the Future',
    artist: 'BOZ Youth Voices',
    videoId: 'dQw4w9WgXcQ',
    duration: '4:30',
    thumb: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=400&fit=crop&auto=format',
  },
  {
    id: 'track-6',
    title: 'Unity Song',
    artist: 'All Provinces Combined Choir',
    videoId: 'dQw4w9WgXcQ',
    duration: '6:15',
    thumb: 'https://images.unsplash.com/photo-1468164016595-6a78abb985a2?w=400&h=400&fit=crop&auto=format',
  },
];

const YOUTUBE_CHANNEL = 'https://www.youtube.com/@BuildOneZambia';
const YOUTUBE_MUSIC_PLAYLIST = 'https://www.youtube.com/@BuildOneZambia/videos';

export function PartyMusicPage() {
  const [featuredActive, setFeaturedActive] = useState(false);
  const [playingId, setPlayingId] = useState<string | null>(null);

  const handlePlay = (id: string) => {
    setPlayingId(prev => prev === id ? null : id);
  };

  return (
    <div style={{ backgroundColor: '#080808', fontFamily: 'Open Sans, sans-serif', color: '#fff', minHeight: '100vh' }}>

      {/* Hero */}
      <section style={{ position: 'relative', padding: '100px 16px 72px', overflow: 'hidden', background: 'linear-gradient(135deg, #080808 0%, #1a0000 60%, #080808 100%)' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 30% 50%, rgba(220,38,38,0.15) 0%, transparent 55%), radial-gradient(circle at 75% 30%, rgba(220,38,38,0.07) 0%, transparent 40%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', maxWidth: '760px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(220,38,38,0.12)', border: '1px solid rgba(220,38,38,0.3)', padding: '6px 16px', marginBottom: '28px' }}>
            <Music style={{ width: '13px', height: '13px', color: '#dc2626' }} />
            <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: '11px', letterSpacing: '0.2em', color: '#dc2626' }}>OFFICIAL CAMPAIGN MUSIC</span>
          </div>
          <h1 style={{ fontFamily: 'Oswald, sans-serif', fontSize: 'clamp(2.4rem, 6vw, 4rem)', lineHeight: 1.08, letterSpacing: '0.03em', marginBottom: '20px' }}>
            PARTY <span style={{ color: '#dc2626' }}>MUSIC</span>
          </h1>
          <p style={{ color: '#9ca3af', fontSize: '1.05rem', lineHeight: 1.85, maxWidth: '520px', margin: '0 auto 36px' }}>
            Listen to Build One Zambia's official campaign songs — music that unites, inspires, and carries the voice of every Zambian who believes in a better future.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a
              href={YOUTUBE_MUSIC_PLAYLIST}
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: '#dc2626', color: '#fff', padding: '14px 28px', fontFamily: 'Oswald, sans-serif', fontSize: '13px', letterSpacing: '0.1em', textDecoration: 'none' }}
            >
              <Youtube style={{ width: '16px', height: '16px' }} /> OPEN ON YOUTUBE
            </a>
            <a
              href={YOUTUBE_CHANNEL}
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', border: '1px solid rgba(255,255,255,0.18)', color: '#d1d5db', padding: '14px 28px', fontFamily: 'Oswald, sans-serif', fontSize: '13px', letterSpacing: '0.1em', textDecoration: 'none' }}
            >
              <Radio style={{ width: '14px', height: '14px' }} /> SUBSCRIBE
            </a>
          </div>
        </div>
      </section>

      {/* Featured track — embedded player */}
      <section style={{ padding: '0 16px 72px' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ marginBottom: '24px' }}>
            <p style={{ fontSize: '11px', letterSpacing: '0.2em', color: '#dc2626', fontFamily: 'Oswald, sans-serif', marginBottom: '8px' }}>FEATURED TRACK</p>
            <h2 style={{ fontFamily: 'Oswald, sans-serif', fontSize: 'clamp(1.4rem, 3vw, 2rem)', letterSpacing: '0.04em', margin: 0 }}>{FEATURED.title}</h2>
            <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>{FEATURED.artist}</p>
          </div>

          {/* YouTube embed */}
          <div
            style={{ position: 'relative', aspectRatio: '16/9', backgroundColor: '#0d0d0d', border: '1px solid #1f1f1f', overflow: 'hidden', cursor: featuredActive ? 'default' : 'pointer' }}
            onClick={() => !featuredActive && setFeaturedActive(true)}
          >
            {featuredActive ? (
              <iframe
                src={`https://www.youtube.com/embed/${FEATURED.videoId}?autoplay=1&rel=0`}
                title={FEATURED.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
              />
            ) : (
              <>
                <img
                  src={`https://img.youtube.com/vi/${FEATURED.videoId}/maxresdefault.jpg`}
                  alt={FEATURED.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', filter: 'brightness(0.5)' }}
                  onError={e => { (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1200&h=675&fit=crop&auto=format'; }}
                />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 50%)' }} />
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'rgba(220,38,38,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 0 16px rgba(220,38,38,0.18)' }}>
                    <Play style={{ width: '32px', height: '32px', color: '#fff', marginLeft: '5px' }} />
                  </div>
                </div>
                <div style={{ position: 'absolute', bottom: '20px', left: '24px' }}>
                  <p style={{ fontFamily: 'Oswald, sans-serif', fontSize: '1rem', color: '#fff', margin: 0, letterSpacing: '0.04em' }}>{FEATURED.title}</p>
                  <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', margin: '4px 0 0' }}>Click to play</p>
                </div>
              </>
            )}
          </div>

          <p style={{ fontSize: '13px', lineHeight: 1.8, color: '#6b7280', marginTop: '16px' }}>{FEATURED.description}</p>

          <a
            href={`https://www.youtube.com/watch?v=${FEATURED.videoId}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginTop: '12px', fontSize: '12px', color: '#dc2626', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.08em', textDecoration: 'none' }}
          >
            <ExternalLink style={{ width: '12px', height: '12px' }} /> WATCH ON YOUTUBE
          </a>
        </div>
      </section>

      {/* Track list */}
      <section style={{ padding: '0 16px 96px', borderTop: '1px solid #1a1a1a' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', paddingTop: '64px' }}>
          <div style={{ marginBottom: '40px' }}>
            <p style={{ fontSize: '11px', letterSpacing: '0.2em', color: '#dc2626', fontFamily: 'Oswald, sans-serif', marginBottom: '8px' }}>PLAYLIST</p>
            <h2 style={{ fontFamily: 'Oswald, sans-serif', fontSize: 'clamp(1.4rem, 3vw, 2rem)', letterSpacing: '0.04em', margin: 0 }}>
              ALL <span style={{ color: '#dc2626' }}>TRACKS</span>
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', backgroundColor: '#1a1a1a' }}>
            {TRACKS.map((track, index) => (
              <div key={track.id}>
                {/* Player row */}
                {playingId === track.id && (
                  <div style={{ backgroundColor: '#0d0d0d' }}>
                    <iframe
                      src={`https://www.youtube.com/embed/${track.videoId}?autoplay=1&rel=0`}
                      title={track.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      style={{ width: '100%', aspectRatio: '16/9', border: 'none', display: 'block' }}
                    />
                  </div>
                )}

                {/* Track row */}
                <div
                  style={{
                    backgroundColor: playingId === track.id ? '#130000' : '#0d0d0d',
                    display: 'grid',
                    gridTemplateColumns: '48px 56px 1fr auto auto',
                    alignItems: 'center',
                    gap: '16px',
                    padding: '16px 20px',
                    cursor: 'pointer',
                    transition: 'background-color 0.15s',
                    borderLeft: playingId === track.id ? '3px solid #dc2626' : '3px solid transparent',
                  }}
                  onMouseEnter={e => { if (playingId !== track.id) (e.currentTarget as HTMLElement).style.backgroundColor = '#111'; }}
                  onMouseLeave={e => { if (playingId !== track.id) (e.currentTarget as HTMLElement).style.backgroundColor = '#0d0d0d'; }}
                  onClick={() => handlePlay(track.id)}
                >
                  {/* Track number / play indicator */}
                  <div style={{ textAlign: 'center' }}>
                    {playingId === track.id ? (
                      <div style={{ display: 'flex', gap: '2px', alignItems: 'flex-end', justifyContent: 'center', height: '20px' }}>
                        {[1, 2, 3].map(b => (
                          <div key={b} style={{ width: '3px', backgroundColor: '#dc2626', borderRadius: '1px', animation: `eq${b} 0.8s ease-in-out infinite alternate`, height: `${8 + b * 4}px` }} />
                        ))}
                      </div>
                    ) : (
                      <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: '13px', color: '#4b5563' }}>{String(index + 1).padStart(2, '0')}</span>
                    )}
                  </div>

                  {/* Thumb */}
                  <div style={{ width: '48px', height: '48px', overflow: 'hidden', flexShrink: 0, position: 'relative' }}>
                    <img src={track.thumb} alt={track.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    {playingId !== track.id && (
                      <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Play style={{ width: '14px', height: '14px', color: '#fff' }} />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div>
                    <p style={{ fontFamily: 'Oswald, sans-serif', fontSize: '14px', letterSpacing: '0.04em', color: playingId === track.id ? '#dc2626' : '#fff', margin: 0 }}>{track.title}</p>
                    <p style={{ fontSize: '12px', color: '#4b5563', margin: '3px 0 0', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Mic2 style={{ width: '10px', height: '10px' }} /> {track.artist}
                    </p>
                  </div>

                  {/* Duration */}
                  <span style={{ fontSize: '12px', color: '#4b5563', fontFamily: 'Oswald, sans-serif' }}>{track.duration}</span>

                  {/* YouTube link */}
                  <a
                    href={`https://www.youtube.com/watch?v=${track.videoId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={e => e.stopPropagation()}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', color: '#4b5563', textDecoration: 'none' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#dc2626'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = '#4b5563'}
                    title="Open on YouTube"
                  >
                    <ExternalLink style={{ width: '14px', height: '14px' }} />
                  </a>
                </div>
              </div>
            ))}
          </div>

          {/* View all on YouTube */}
          <div style={{ marginTop: '32px', textAlign: 'center' }}>
            <a
              href={YOUTUBE_MUSIC_PLAYLIST}
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', border: '1px solid #dc2626', color: '#dc2626', padding: '14px 32px', fontFamily: 'Oswald, sans-serif', fontSize: '13px', letterSpacing: '0.1em', textDecoration: 'none' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#dc2626'; (e.currentTarget as HTMLElement).style.color = '#fff'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#dc2626'; }}
            >
              <Youtube style={{ width: '16px', height: '16px' }} /> VIEW ALL ON YOUTUBE
            </a>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '72px 16px', backgroundColor: '#dc2626', textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'Oswald, sans-serif', fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', letterSpacing: '0.03em', color: '#fff', marginBottom: '12px' }}>
          Music That Moves a Nation
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '15px', margin: '0 auto 28px', maxWidth: '480px' }}>
          Subscribe to the Build One Zambia YouTube channel for new campaign music, rally anthems, and cultural performances.
        </p>
        <a
          href={YOUTUBE_CHANNEL}
          target="_blank"
          rel="noopener noreferrer"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: '#fff', color: '#dc2626', padding: '14px 32px', fontFamily: 'Oswald, sans-serif', fontSize: '14px', letterSpacing: '0.1em', textDecoration: 'none', fontWeight: 700 }}
        >
          <Youtube style={{ width: '16px', height: '16px' }} /> SUBSCRIBE ON YOUTUBE
        </a>
      </section>

      <style>{`
        @keyframes eq1 { from { height: 6px; } to { height: 16px; } }
        @keyframes eq2 { from { height: 14px; } to { height: 6px; } }
        @keyframes eq3 { from { height: 8px; } to { height: 18px; } }
      `}</style>
    </div>
  );
}

export default PartyMusicPage;
