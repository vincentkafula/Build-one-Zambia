import { useState, useEffect } from 'react';
import { Radio, Plus, Edit3, Trash2, Play, Square, Clock, Check, X, AlertCircle, ChevronDown } from 'lucide-react';
import { streamApi } from '../lib/api';

interface LiveStream {
  id: string;
  title: string;
  description?: string;
  platform: string;
  streamUrl: string;
  embedUrl?: string;
  category: string;
  status: 'scheduled' | 'live' | 'ended' | 'cancelled';
  scheduledAt: string;
  province?: string;
  location?: string;
  featured: boolean;
  viewerCount: number;
  createdAt: string;
}

const PLATFORMS = ['youtube', 'facebook', 'twitter', 'custom'];
const CATEGORIES = ['rally', 'press_conference', 'debate', 'interview', 'announcement', 'other'];
const CATEGORY_LABELS: Record<string, string> = {
  rally: 'Campaign Rally', press_conference: 'Press Conference',
  debate: 'Political Debate', interview: 'Interview',
  announcement: 'Announcement', other: 'Other',
};
const PROVINCES = [
  'Central', 'Copperbelt', 'Eastern', 'Luapula', 'Lusaka',
  'Muchinga', 'Northern', 'North-Western', 'Southern', 'Western',
];

const inp: React.CSSProperties = {
  width: '100%', boxSizing: 'border-box', padding: '10px 12px',
  background: '#111', border: '1px solid #2a2a2a', color: '#fff',
  fontSize: '14px', fontFamily: 'Open Sans, sans-serif', outline: 'none', marginBottom: '12px',
};
const lbl: React.CSSProperties = {
  display: 'block', fontSize: '11px', letterSpacing: '0.12em',
  color: '#6b7280', fontFamily: 'Oswald, sans-serif', marginBottom: '5px',
};

function StatusPill({ status }: { status: LiveStream['status'] }) {
  const map: Record<string, { bg: string; color: string }> = {
    scheduled: { bg: '#1d4ed820', color: '#60a5fa' },
    live: { bg: '#dc262620', color: '#f87171' },
    ended: { bg: '#37415120', color: '#6b7280' },
    cancelled: { bg: '#37415120', color: '#4b5563' },
  };
  const style = map[status] || map.ended;
  return (
    <span style={{ padding: '2px 8px', fontSize: '10px', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.08em', background: style.bg, color: style.color, borderRadius: '2px' }}>
      {status.toUpperCase()}
    </span>
  );
}

interface FormData {
  title: string; description: string; platform: string; streamUrl: string;
  thumbnailUrl: string; category: string; scheduledAt: string;
  province: string; location: string; featured: boolean;
}

const emptyForm: FormData = {
  title: '', description: '', platform: 'youtube', streamUrl: '',
  thumbnailUrl: '', category: 'rally', scheduledAt: '',
  province: '', location: '', featured: false,
};

function StreamForm({ initial, onSave, onCancel }: {
  initial?: Partial<FormData>;
  onSave: (data: FormData) => Promise<void>;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<FormData>({ ...emptyForm, ...initial });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const set = (k: keyof FormData, v: string | boolean) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.title.trim()) { setErr('Title is required.'); return; }
    if (!form.streamUrl.trim()) { setErr('Stream URL is required.'); return; }
    if (!form.scheduledAt) { setErr('Scheduled date & time is required.'); return; }
    setSaving(true); setErr('');
    try {
      await onSave(form);
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Save failed. Please try again.');
      setSaving(false);
    }
  };

  return (
    <div style={{ background: '#111', border: '1px solid #2a2a2a', padding: '24px', marginBottom: '20px' }}>
      {err && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#450a0a', border: '1px solid #7f1d1d', padding: '10px 14px', marginBottom: '16px', color: '#fca5a5', fontSize: '13px' }}>
          <AlertCircle size={14} /> {err}
        </div>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
        <div style={{ gridColumn: '1 / -1' }}>
          <label style={lbl}>STREAM TITLE *</label>
          <input style={inp} value={form.title} onChange={e => set('title', e.target.value)} placeholder="e.g. BOZ Lusaka Grand Rally" />
        </div>
        <div style={{ gridColumn: '1 / -1' }}>
          <label style={lbl}>DESCRIPTION</label>
          <textarea style={{ ...inp, minHeight: '70px', resize: 'vertical' }} value={form.description} onChange={e => set('description', e.target.value)} placeholder="Brief description of the event..." />
        </div>
        <div>
          <label style={lbl}>PLATFORM *</label>
          <select style={{ ...inp }} value={form.platform} onChange={e => set('platform', e.target.value)}>
            {PLATFORMS.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
          </select>
        </div>
        <div>
          <label style={lbl}>CATEGORY *</label>
          <select style={{ ...inp }} value={form.category} onChange={e => set('category', e.target.value)}>
            {CATEGORIES.map(c => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}
          </select>
        </div>
        <div style={{ gridColumn: '1 / -1' }}>
          <label style={lbl}>STREAM / VIDEO URL *</label>
          <input style={inp} value={form.streamUrl} onChange={e => set('streamUrl', e.target.value)} placeholder="https://youtube.com/watch?v=... or https://fb.com/..." />
          <div style={{ fontSize: '11px', color: '#4b5563', marginTop: '-8px', marginBottom: '12px' }}>
            For YouTube, paste the watch URL or live URL — it will be converted to an embed automatically.
          </div>
        </div>
        <div>
          <label style={lbl}>SCHEDULED DATE & TIME *</label>
          <input type="datetime-local" style={inp} value={form.scheduledAt} onChange={e => set('scheduledAt', e.target.value)} />
        </div>
        <div>
          <label style={lbl}>PROVINCE</label>
          <select style={{ ...inp }} value={form.province} onChange={e => set('province', e.target.value)}>
            <option value="">All Provinces</option>
            {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <div>
          <label style={lbl}>LOCATION / VENUE</label>
          <input style={inp} value={form.location} onChange={e => set('location', e.target.value)} placeholder="e.g. Heroes Stadium, Lusaka" />
        </div>
        <div>
          <label style={lbl}>THUMBNAIL URL</label>
          <input style={inp} value={form.thumbnailUrl} onChange={e => set('thumbnailUrl', e.target.value)} placeholder="https://..." />
        </div>
        <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <input type="checkbox" id="featured" checked={form.featured} onChange={e => set('featured', e.target.checked)} style={{ accentColor: '#dc2626', width: '16px', height: '16px' }} />
          <label htmlFor="featured" style={{ ...lbl, marginBottom: 0, cursor: 'pointer', color: '#9ca3af' }}>
            FEATURE THIS STREAM (shown first on homepage)
          </label>
        </div>
      </div>
      <div style={{ display: 'flex', gap: '10px' }}>
        <button onClick={handleSave} disabled={saving} style={{ padding: '10px 24px', background: '#dc2626', color: '#fff', border: 'none', fontFamily: 'Oswald, sans-serif', fontSize: '13px', letterSpacing: '0.1em', cursor: saving ? 'default' : 'pointer', opacity: saving ? 0.7 : 1, display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Check size={14} /> {saving ? 'SAVING...' : 'SAVE STREAM'}
        </button>
        <button onClick={onCancel} style={{ padding: '10px 20px', background: 'transparent', color: '#6b7280', border: '1px solid #2a2a2a', fontFamily: 'Oswald, sans-serif', fontSize: '13px', letterSpacing: '0.08em', cursor: 'pointer' }}>
          CANCEL
        </button>
      </div>
    </div>
  );
}

export function LiveStreamAdmin() {
  const [streams, setStreams] = useState<LiveStream[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<LiveStream | null>(null);
  const [actionErr, setActionErr] = useState('');
  const [actionOk, setActionOk] = useState('');

  const load = async () => {
    try {
      const res = await streamApi.list() as { streams: LiveStream[] };
      setStreams(res.streams);
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const flash = (ok: string) => { setActionOk(ok); setTimeout(() => setActionOk(''), 3000); };
  const flashErr = (e: string) => { setActionErr(e); setTimeout(() => setActionErr(''), 5000); };

  const handleCreate = async (data: FormData) => {
    await streamApi.create(data as unknown as Record<string, unknown>);
    setShowForm(false);
    await load();
    flash('Stream created successfully.');
  };

  const handleEdit = async (data: FormData) => {
    if (!editTarget) return;
    await streamApi.update(editTarget.id, data as unknown as Record<string, unknown>);
    setEditTarget(null);
    await load();
    flash('Stream updated successfully.');
  };

  const handleStatus = async (id: string, status: string) => {
    try {
      await streamApi.setStatus(id, status);
      await load();
      flash(`Stream marked as ${status}.`);
    } catch (e) {
      flashErr(e instanceof Error ? e.message : 'Failed to update status.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this stream? This cannot be undone.')) return;
    try {
      await streamApi.delete(id);
      await load();
      flash('Stream deleted.');
    } catch (e) {
      flashErr(e instanceof Error ? e.message : 'Failed to delete stream.');
    }
  };

  const toFormData = (s: LiveStream): Partial<FormData> => ({
    title: s.title, description: s.description || '',
    platform: s.platform, streamUrl: s.streamUrl,
    category: s.category,
    scheduledAt: s.scheduledAt ? s.scheduledAt.slice(0, 16) : '',
    province: s.province || '', location: s.location || '',
    featured: s.featured, thumbnailUrl: '',
  });

  return (
    <div style={{ color: '#fff', fontFamily: 'Open Sans, sans-serif' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Radio size={18} color="#dc2626" />
          <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: '18px', letterSpacing: '0.12em' }}>LIVE STREAM MANAGER</span>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditTarget(null); }}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 18px', background: '#dc2626', color: '#fff', border: 'none', fontFamily: 'Oswald, sans-serif', fontSize: '13px', letterSpacing: '0.08em', cursor: 'pointer' }}
        >
          <Plus size={14} /> NEW STREAM
        </button>
      </div>

      {/* Alerts */}
      {actionOk && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#052e16', border: '1px solid #14532d', padding: '10px 14px', marginBottom: '16px', color: '#86efac', fontSize: '13px' }}>
          <Check size={14} /> {actionOk}
        </div>
      )}
      {actionErr && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#450a0a', border: '1px solid #7f1d1d', padding: '10px 14px', marginBottom: '16px', color: '#fca5a5', fontSize: '13px' }}>
          <AlertCircle size={14} /> {actionErr}
        </div>
      )}

      {/* Create form */}
      {showForm && !editTarget && (
        <StreamForm onSave={handleCreate} onCancel={() => setShowForm(false)} />
      )}

      {/* Edit form */}
      {editTarget && (
        <StreamForm initial={toFormData(editTarget)} onSave={handleEdit} onCancel={() => setEditTarget(null)} />
      )}

      {/* Table */}
      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#4b5563', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.1em' }}>LOADING...</div>
      ) : streams.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#4b5563' }}>
          <Radio size={40} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.3 }} />
          <div style={{ fontFamily: 'Oswald, sans-serif', letterSpacing: '0.1em' }}>NO STREAMS YET</div>
          <div style={{ fontSize: '13px', marginTop: '6px' }}>Create your first live stream using the button above.</div>
        </div>
      ) : (
        <div style={{ border: '1px solid #1f1f1f' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #1f1f1f', background: '#0a0a0a' }}>
                {['Title', 'Platform', 'Category', 'Scheduled', 'Status', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontFamily: 'Oswald, sans-serif', fontSize: '11px', letterSpacing: '0.1em', color: '#6b7280', fontWeight: 400 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {streams.map(s => (
                <tr key={s.id} style={{ borderBottom: '1px solid #111' }}>
                  <td style={{ padding: '12px 14px', color: '#e5e7eb', maxWidth: '220px' }}>
                    <div style={{ fontFamily: 'Oswald, sans-serif', marginBottom: '2px' }}>{s.title}</div>
                    {s.featured && <span style={{ fontSize: '10px', color: '#f59e0b', fontFamily: 'Oswald, sans-serif' }}>★ FEATURED</span>}
                    {s.location && <div style={{ fontSize: '11px', color: '#4b5563' }}>{s.location}</div>}
                  </td>
                  <td style={{ padding: '12px 14px', color: '#9ca3af' }}>{s.platform}</td>
                  <td style={{ padding: '12px 14px', color: '#9ca3af' }}>{CATEGORY_LABELS[s.category] || s.category}</td>
                  <td style={{ padding: '12px 14px', color: '#9ca3af', fontSize: '12px', whiteSpace: 'nowrap' }}>
                    {new Date(s.scheduledAt).toLocaleString('en-ZM', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td style={{ padding: '12px 14px' }}><StatusPill status={s.status} /></td>
                  <td style={{ padding: '12px 14px' }}>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {s.status === 'scheduled' && (
                        <button title="Go Live" onClick={() => handleStatus(s.id, 'live')} style={{ padding: '5px 8px', background: '#dc262620', color: '#f87171', border: '1px solid #7f1d1d', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontFamily: 'Oswald, sans-serif' }}>
                          <Play size={11} /> LIVE
                        </button>
                      )}
                      {s.status === 'live' && (
                        <button title="End Stream" onClick={() => handleStatus(s.id, 'ended')} style={{ padding: '5px 8px', background: '#37415120', color: '#9ca3af', border: '1px solid #374151', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontFamily: 'Oswald, sans-serif' }}>
                          <Square size={11} /> END
                        </button>
                      )}
                      <button title="Edit" onClick={() => { setEditTarget(s); setShowForm(false); }} style={{ padding: '5px 8px', background: 'transparent', color: '#6b7280', border: '1px solid #2a2a2a', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                        <Edit3 size={12} />
                      </button>
                      <button title="Delete" onClick={() => handleDelete(s.id)} style={{ padding: '5px 8px', background: 'transparent', color: '#6b7280', border: '1px solid #2a2a2a', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
