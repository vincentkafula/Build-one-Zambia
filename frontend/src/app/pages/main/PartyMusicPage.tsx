import { useState, useEffect } from 'react';
import { Play, Music, ExternalLink, Youtube, Mic2, Radio } from 'lucide-react';
import { API_BASE } from '../../lib/apiBase';

interface Track {
  id: string;
  title: string;
  artist: string;
  youtubeVideoId: string;
  duration?: string;
  thumbnailUrl?: string;
  featured?: boolean;
}

const YOUTUBE_CHANNEL = 'https://www.youtube.com/@BuildOneZambia';
const YOUTUBE_MUSIC_PLAYLIST = 'https://www.youtube.com/@BuildOneZambia/videos';

function thumbUrl(t: Track) {
  return t.thumbnailUrl || `https://img.youtube.com/vi/${t.youtubeVideoId}/hqdefault.jpg`;
}

export function PartyMusicPage() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [featuredActive, setFeaturedActive] = useState(false);
  const [playingId, setPlayingId] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API_BASE}/music`)
      .then(r => r.json())
      .then(data => setTracks(data.tracks || []))
      .catch(() => { /* empty state below handles this */ })
      .finally(() => setLoading(false));
  }, []);

  const featured = tracks.find(t => t.featured) || tracks[0];
  const rest = tracks.filter(t => t.id !== featured?.id);

  const handlePlay = (id: string) => setPlayingId(prev => prev === id ? null : id);

  return (
    <div style={{ backgroundColor: '#111111', fontFamily: 'Open Sans, sans-serif', color: '#111111', minHeight: '100vh' }}>

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

      {loading && (
        <p style={{ textAlign: 'center', color: '#4b5563', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.06em', padding: '40px 16px' }}>Loading tracks…</p>
      )}

      {!loading && tracks.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px 16px 80px', color: '#4b5563' }}>
          <Music style={{ width: '32px', height: '32px', margin: '0 auto 16px', opacity: 0.5 }} />
          <p style={{ fontFamily: 'Oswald, sans-serif', fontSize: '1.05rem', letterSpacing: '0.05em' }}>No tracks have been added yet.</p>
        </div>
      )}

      {!loading && featured && (
        <>
          {/* Featured track — embedded player */}
          <section style={{ padding: '0 16px 72px' }}>
            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
              <div style={{ marginBottom: '24px' }}>
                <p style={{ fontSize: '11px', letterSpacing: '0.2em', color: '#dc2626', fontFamily: 'Oswald, sans-serif', marginBottom: '8px' }}>FEATURED TRACK</p>
                <h2 style={{ fontFamily: 'Oswald, sans-serif', fontSize: 'clamp(1.4rem, 3vw, 2rem)', letterSpacing: '0.04em', margin: 0 }}>{featured.title}</h2>
                <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>{featured.artist}</p>
              </div>

              <div
                style={{ position: 'relative', aspectRatio: '16/9', backgroundColor: '#111111', border: '1px solid #1f1f1f', overflow: 'hidden', cursor: featuredActive ? 'default' : 'pointer' }}
                onClick={() => !featuredActive && setFeaturedActive(true)}
              >
                {featuredActive ? (
                  <iframe
                    src={`https://www.youtube.com/embed/${featured.youtubeVideoId}?autoplay=1&rel=0`}
                    title={featured.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
                  />
                ) : (
                  <>
                    <img
                      src={thumbUrl(featured)}
                      alt={featured.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', filter: 'brightness(0.5)' }}
                      onError={e => { (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1200&h=675&fit=crop&auto=format'; }}
                    />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 50%)' }} />
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'rgba(220,38,38,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 0 16px rgba(220,38,38,0.18)' }}>
                        <Play style={{ width: '32px', height: '32px', color: '#111111', marginLeft: '5px' }} />
                      </div>
                    </div>
                    <div style={{ position: 'absolute', bottom: '20px', left: '24px' }}>
                      <p style={{ fontFamily: 'Oswald, sans-serif', fontSize: '1rem', color: '#fff', margin: 0, letterSpacing: '0.04em' }}>{featured.title}</p>
                      <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', margin: '4px 0 0' }}>Click to play</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </section>

          {/* Track list */}
          {rest.length > 0 && (
            <section style={{ padding: '0 16px 72px' }}>
              <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                <p style={{ fontSize: '11px', letterSpacing: '0.2em', color: '#dc2626', fontFamily: 'Oswald, sans-serif', marginBottom: '16px' }}>MORE TRACKS</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  {rest.map((track, index) => (
                    <div key={track.id} style={{ backgroundColor: '#0d0d0d' }}>
                      <div
                        style={{ display: 'grid', gridTemplateColumns: '32px 48px 1fr auto auto', gap: '16px', alignItems: 'center', padding: '12px 16px', cursor: 'pointer', transition: 'background-color 0.15s' }}
                        onMouseEnter={e => { if (playingId !== track.id) (e.currentTarget as HTMLElement).style.backgroundColor = '#111'; }}
                        onMouseLeave={e => { if (playingId !== track.id) (e.currentTarget as HTMLElement).style.backgroundColor = '#0d0d0d'; }}
                        onClick={() => handlePlay(track.id)}
                      >
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

                        <div style={{ width: '48px', height: '48px', overflow: 'hidden', flexShrink: 0, position: 'relative' }}>
                          <img src={thumbUrl(track)} alt={track.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          {playingId !== track.id && (
                            <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <Play style={{ width: '14px', height: '14px', color: '#fff' }} />
                            </div>
                          )}
                        </div>

                        <div>
                          <p style={{ fontFamily: 'Oswald, sans-serif', fontSize: '14px', letterSpacing: '0.04em', color: playingId === track.id ? '#dc2626' : '#fff', margin: 0 }}>{track.title}</p>
                          <p style={{ fontSize: '12px', color: '#4b5563', margin: '3px 0 0', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Mic2 style={{ width: '10px', height: '10px' }} /> {track.artist}
                          </p>
                        </div>

                        <span style={{ fontSize: '12px', color: '#4b5563', fontFamily: 'Oswald, sans-serif' }}>{track.duration}</span>

                        <a
                          href={`https://www.youtube.com/watch?v=${track.youtubeVideoId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={e => e.stopPropagation()}
                          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', color: '#4b5563', textDecoration: 'none' }}
                          title="Open on YouTube"
                        >
                          <ExternalLink style={{ width: '14px', height: '14px' }} />
                        </a>
                      </div>
                      {playingId === track.id && (
                        <div style={{ aspectRatio: '16/9', backgroundColor: '#000' }}>
                          <iframe
                            src={`https://www.youtube.com/embed/${track.youtubeVideoId}?autoplay=1&rel=0`}
                            title={track.title}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: '32px', textAlign: 'center' }}>
                  <a
                    href={YOUTUBE_MUSIC_PLAYLIST}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', border: '1px solid #dc2626', color: '#dc2626', padding: '14px 32px', fontFamily: 'Oswald, sans-serif', fontSize: '13px', letterSpacing: '0.1em', textDecoration: 'none' }}
                  >
                    <Youtube style={{ width: '16px', height: '16px' }} /> VIEW ALL ON YOUTUBE
                  </a>
                </div>
              </div>
            </section>
          )}
        </>
      )}

      {/* CTA */}
      <section style={{ padding: '72px 16px', backgroundColor: '#dc2626', textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'Oswald, sans-serif', fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', letterSpacing: '0.03em', color: '#111111', marginBottom: '12px' }}>
          Music That Moves a Nation
        </h2>
        <p style={{ color: 'rgba(17,17,17,0.8)', fontSize: '15px', margin: '0 auto 28px', maxWidth: '480px' }}>
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
