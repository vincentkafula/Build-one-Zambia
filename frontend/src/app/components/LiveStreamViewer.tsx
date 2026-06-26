import { useState, useEffect, useRef, useCallback } from 'react';
import { Radio, Send, Users, Clock, Calendar, ChevronRight, Wifi, WifiOff } from 'lucide-react';
import { streamApi } from '../lib/api';

interface LiveStream {
  id: string;
  title: string;
  description?: string;
  platform: string;
  streamUrl: string;
  embedUrl?: string;
  thumbnailUrl?: string;
  category: string;
  status: 'scheduled' | 'live' | 'ended' | 'cancelled';
  scheduledAt: string;
  startedAt?: string;
  province?: string;
  location?: string;
  featured: boolean;
  viewerCount: number;
}

interface Comment {
  id: string;
  name: string;
  message: string;
  createdAt: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  rally: 'Campaign Rally',
  press_conference: 'Press Conference',
  debate: 'Political Debate',
  interview: 'Interview',
  announcement: 'Announcement',
  other: 'Event',
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('en-ZM', {
    weekday: 'short', day: 'numeric', month: 'short',
    year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

function StatusBadge({ status }: { status: LiveStream['status'] }) {
  if (status === 'live') {
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: '#dc2626', color: '#fff', padding: '3px 10px', fontSize: '11px', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.1em' }}>
        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#fff', display: 'inline-block', animation: 'pulse 1.5s infinite' }} />
        LIVE NOW
      </span>
    );
  }
  if (status === 'scheduled') {
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: '#1d4ed8', color: '#fff', padding: '3px 10px', fontSize: '11px', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.1em' }}>
        <Clock size={10} /> UPCOMING
      </span>
    );
  }
  if (status === 'ended') {
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: '#374151', color: '#9ca3af', padding: '3px 10px', fontSize: '11px', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.1em' }}>
        ENDED
      </span>
    );
  }
  return null;
}

function StreamCard({ stream, onClick, selected }: { stream: LiveStream; onClick: () => void; selected: boolean }) {
  return (
    <div
      onClick={onClick}
      style={{
        padding: '14px 16px',
        borderBottom: '1px solid #1f1f1f',
        cursor: 'pointer',
        background: selected ? '#1a0a0a' : 'transparent',
        borderLeft: selected ? '3px solid #dc2626' : '3px solid transparent',
        transition: 'background 0.15s',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
        <StatusBadge status={stream.status} />
        <span style={{ fontSize: '10px', color: '#4b5563', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.05em' }}>
          {CATEGORY_LABELS[stream.category] || stream.category}
        </span>
      </div>
      <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: '14px', color: '#e5e7eb', marginTop: '6px', marginBottom: '4px', lineHeight: '1.3' }}>
        {stream.title}
      </div>
      <div style={{ fontSize: '11px', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '4px' }}>
        <Calendar size={10} />
        {formatDate(stream.scheduledAt)}
      </div>
      {stream.location && (
        <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '2px' }}>{stream.location}</div>
      )}
    </div>
  );
}

function CommentBox({ streamId, onNew }: { streamId: string; onNew: (c: Comment) => void }) {
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [posting, setPosting] = useState(false);
  const [err, setErr] = useState('');

  const submit = async () => {
    if (!name.trim() || !message.trim()) { setErr('Please enter your name and message.'); return; }
    setPosting(true); setErr('');
    try {
      const res = await streamApi.postComment(streamId, name, message) as { comment: Comment };
      onNew(res.comment);
      setMessage('');
    } catch {
      setErr('Failed to post comment. Please try again.');
    } finally {
      setPosting(false);
    }
  };

  return (
    <div style={{ padding: '12px 16px', borderTop: '1px solid #1f1f1f' }}>
      {err && <div style={{ color: '#ef4444', fontSize: '12px', marginBottom: '8px' }}>{err}</div>}
      <input
        placeholder="Your name"
        value={name}
        onChange={e => setName(e.target.value)}
        style={{ width: '100%', boxSizing: 'border-box', padding: '8px 10px', background: '#111', border: '1px solid #2a2a2a', color: '#fff', fontSize: '13px', marginBottom: '8px', fontFamily: 'Open Sans, sans-serif', outline: 'none' }}
      />
      <div style={{ display: 'flex', gap: '8px' }}>
        <input
          placeholder="Write a comment..."
          value={message}
          onChange={e => setMessage(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') submit(); }}
          style={{ flex: 1, padding: '8px 10px', background: '#111', border: '1px solid #2a2a2a', color: '#fff', fontSize: '13px', fontFamily: 'Open Sans, sans-serif', outline: 'none' }}
        />
        <button
          onClick={submit}
          disabled={posting}
          style={{ padding: '8px 14px', background: '#dc2626', border: 'none', color: '#fff', cursor: posting ? 'default' : 'pointer', display: 'flex', alignItems: 'center', gap: '4px', opacity: posting ? 0.6 : 1 }}
        >
          <Send size={14} />
        </button>
      </div>
    </div>
  );
}

export function LiveStreamViewer() {
  const [streams, setStreams] = useState<LiveStream[]>([]);
  const [selected, setSelected] = useState<LiveStream | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [online, setOnline] = useState(true);
  const commentsEndRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchStreams = useCallback(async () => {
    try {
      const res = await streamApi.list() as { streams: LiveStream[] };
      const sorted = res.streams.filter(s => s.status !== 'cancelled');
      setStreams(sorted);
      setOnline(true);
      if (!selected && sorted.length > 0) {
        const live = sorted.find(s => s.status === 'live' && s.featured) || sorted.find(s => s.status === 'live') || sorted[0];
        if (live) setSelected(live);
      }
    } catch {
      setOnline(false);
    } finally {
      setLoading(false);
    }
  }, [selected]);

  const fetchComments = useCallback(async (streamId: string) => {
    try {
      const res = await streamApi.getComments(streamId) as { comments: Comment[] };
      setComments(res.comments);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    fetchStreams();
    pollRef.current = setInterval(fetchStreams, 30000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, []);

  useEffect(() => {
    if (selected) {
      fetchComments(selected.id);
      if (selected.status === 'live') streamApi.recordView(selected.id);
      const iv = setInterval(() => fetchComments(selected.id), 15000);
      return () => clearInterval(iv);
    }
  }, [selected?.id]);

  useEffect(() => {
    commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [comments.length]);

  const addComment = (c: Comment) => setComments(prev => [...prev, c]);

  if (loading) {
    return (
      <div style={{ minHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0d0d0d', color: '#4b5563', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.1em' }}>
        LOADING STREAMS...
      </div>
    );
  }

  return (
    <div style={{ background: '#0d0d0d', color: '#fff', fontFamily: 'Open Sans, sans-serif' }}>
      {/* Header */}
      <div style={{ padding: '20px 24px', borderBottom: '1px solid #1f1f1f', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Radio size={18} color="#dc2626" />
          <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: '18px', letterSpacing: '0.12em', color: '#fff' }}>LIVE STREAMS</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: online ? '#10b981' : '#6b7280' }}>
          {online ? <Wifi size={12} /> : <WifiOff size={12} />}
          {online ? 'CONNECTED' : 'OFFLINE'}
        </div>
      </div>

      <div style={{ display: 'flex', minHeight: '600px' }}>
        {/* Sidebar — stream list */}
        <div style={{ width: '280px', flexShrink: 0, borderRight: '1px solid #1f1f1f', overflowY: 'auto', maxHeight: '700px' }}>
          {streams.length === 0 ? (
            <div style={{ padding: '32px 16px', textAlign: 'center', color: '#4b5563', fontSize: '13px' }}>
              No streams available at this time.<br />Check back soon.
            </div>
          ) : (
            streams.map(s => (
              <StreamCard key={s.id} stream={s} selected={selected?.id === s.id} onClick={() => setSelected(s)} />
            ))
          )}
        </div>

        {/* Main content */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {!selected ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px', color: '#4b5563' }}>
              <Radio size={40} />
              <div style={{ fontFamily: 'Oswald, sans-serif', letterSpacing: '0.1em' }}>SELECT A STREAM TO WATCH</div>
            </div>
          ) : (
            <>
              {/* Stream info bar */}
              <div style={{ padding: '14px 20px', borderBottom: '1px solid #1f1f1f', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <StatusBadge status={selected.status} />
                    <span style={{ fontSize: '11px', color: '#6b7280', fontFamily: 'Oswald, sans-serif' }}>
                      {CATEGORY_LABELS[selected.category] || selected.category}
                    </span>
                  </div>
                  <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: '20px', color: '#fff', lineHeight: '1.3' }}>{selected.title}</div>
                  {selected.description && <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>{selected.description}</div>}
                  <div style={{ fontSize: '11px', color: '#4b5563', marginTop: '4px', display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar size={10} />{formatDate(selected.scheduledAt)}</span>
                    {selected.location && <span>{selected.location}</span>}
                    {selected.status === 'live' && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#dc2626' }}>
                        <Users size={10} />{selected.viewerCount.toLocaleString()} watching
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Video player */}
              <div style={{ position: 'relative', background: '#000', aspectRatio: '16/9', maxHeight: '420px' }}>
                {selected.status === 'scheduled' ? (
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px', background: '#050505' }}>
                    <Clock size={48} color="#374151" />
                    <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: '18px', color: '#6b7280', letterSpacing: '0.12em' }}>STREAM STARTS SOON</div>
                    <div style={{ fontSize: '13px', color: '#4b5563' }}>{formatDate(selected.scheduledAt)}</div>
                  </div>
                ) : selected.status === 'ended' ? (
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px', background: '#050505' }}>
                    <Radio size={40} color="#374151" />
                    <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: '16px', color: '#6b7280', letterSpacing: '0.1em' }}>STREAM HAS ENDED</div>
                    {selected.embedUrl && (
                      <a href={selected.streamUrl} target="_blank" rel="noopener noreferrer"
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#dc2626', fontSize: '13px', textDecoration: 'none', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.06em' }}>
                        WATCH RECORDING <ChevronRight size={14} />
                      </a>
                    )}
                  </div>
                ) : selected.embedUrl ? (
                  <iframe
                    src={selected.embedUrl}
                    title={selected.title}
                    style={{ width: '100%', height: '100%', border: 'none' }}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', background: '#050505' }}>
                    <Radio size={40} color="#dc2626" />
                    <div style={{ fontFamily: 'Oswald, sans-serif', color: '#9ca3af', letterSpacing: '0.1em' }}>STREAM UNAVAILABLE</div>
                    <a href={selected.streamUrl} target="_blank" rel="noopener noreferrer"
                      style={{ color: '#dc2626', fontSize: '13px', textDecoration: 'none' }}>
                      Open in browser →
                    </a>
                  </div>
                )}
              </div>

              {/* Comments panel */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                <div style={{ padding: '10px 16px', borderBottom: '1px solid #1f1f1f', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: '12px', letterSpacing: '0.1em', color: '#9ca3af' }}>LIVE COMMENTS</span>
                  <span style={{ fontSize: '11px', color: '#4b5563' }}>({comments.length})</span>
                </div>
                <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px', maxHeight: '200px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {comments.length === 0 ? (
                    <div style={{ color: '#4b5563', fontSize: '13px', textAlign: 'center', paddingTop: '16px' }}>
                      No comments yet. Be the first!
                    </div>
                  ) : (
                    comments.map(c => (
                      <div key={c.id} style={{ display: 'flex', gap: '10px' }}>
                        <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#1f1f1f', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '12px', fontFamily: 'Oswald, sans-serif', color: '#dc2626' }}>
                          {c.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontSize: '12px', fontFamily: 'Oswald, sans-serif', color: '#e5e7eb', marginBottom: '2px' }}>
                            {c.name}
                            <span style={{ fontFamily: 'Open Sans, sans-serif', color: '#4b5563', fontWeight: 'normal', marginLeft: '8px', fontSize: '10px' }}>
                              {new Date(c.createdAt).toLocaleTimeString('en-ZM', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <div style={{ fontSize: '13px', color: '#9ca3af', lineHeight: '1.4' }}>{c.message}</div>
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={commentsEndRef} />
                </div>
                {(selected.status === 'live' || selected.status === 'scheduled') && (
                  <CommentBox streamId={selected.id} onNew={addComment} />
                )}
              </div>
            </>
          )}
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}
