import { API_BASE } from '@/app/lib/apiBase';
import { useState, useEffect, useCallback } from 'react';
import {
  Music, Plus, Edit2, Trash2, RefreshCw, Loader2,
  AlertCircle, CheckCircle2, X,
} from 'lucide-react';
import { getToken } from '../lib/api';

async function safeFetch(url: string, options?: RequestInit) {
  const res = await fetch(url, options);
  const ct = res.headers.get('content-type') || '';
  if (!ct.includes('application/json')) {
    const text = await res.text();
    if (res.status === 429) throw new Error('Rate limit exceeded — please wait a moment and try again.');
    if (!res.ok) throw new Error(text || `HTTP ${res.status}`);
    return { ok: res.ok, status: res.status, json: async () => ({}) };
  }
  return res;
}

const BASE = API_BASE;

async function apiFetch<T>(method: string, path: string, body?: unknown): Promise<T> {
  const token = getToken();
  const res = await safeFetch(`${BASE}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
  return data as T;
}

interface Track {
  id: string; title: string; artist: string; youtubeVideoId: string;
  duration?: string; thumbnailUrl?: string; featured: boolean; createdAt: string;
}

const INP = 'w-full px-3 py-2 border border-border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary';

const EMPTY = { title: '', artist: 'Build One Zambia', youtubeVideoId: '', duration: '', thumbnailUrl: '', featured: false };
type FormData = typeof EMPTY;

// Extracts a bare video ID whether someone pastes a full YouTube URL or
// just the ID itself — avoids a common mistake (pasting the full link)
// silently producing a broken embed.
function extractVideoId(input: string): string {
  const trimmed = input.trim();
  const watchMatch = trimmed.match(/[?&]v=([^&]+)/);
  if (watchMatch) return watchMatch[1];
  const shortMatch = trimmed.match(/youtu\.be\/([^?&]+)/);
  if (shortMatch) return shortMatch[1];
  const embedMatch = trimmed.match(/embed\/([^?&]+)/);
  if (embedMatch) return embedMatch[1];
  return trimmed;
}

function TrackForm({ initial, onSave, onCancel, saving }: { initial: FormData; onSave: (d: FormData) => Promise<void>; onCancel: () => void; saving: boolean }) {
  const [form, setForm] = useState(initial);
  const set = (k: keyof FormData, v: unknown) => setForm(p => ({ ...p, [k]: v }));

  return (
    <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-muted-foreground mb-1">TRACK TITLE *</label>
          <input required value={form.title} onChange={e => set('title', e.target.value)} placeholder="e.g. Build One Zambia — Official Campaign Anthem" className={INP} />
        </div>
        <div>
          <label className="block text-xs font-semibold text-muted-foreground mb-1">ARTIST</label>
          <input value={form.artist} onChange={e => set('artist', e.target.value)} placeholder="e.g. BOZ Choir" className={INP} />
        </div>
        <div>
          <label className="block text-xs font-semibold text-muted-foreground mb-1">DURATION</label>
          <input value={form.duration} onChange={e => set('duration', e.target.value)} placeholder="e.g. 3:45" className={INP} />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-muted-foreground mb-1">YOUTUBE VIDEO *</label>
          <input
            required
            value={form.youtubeVideoId}
            onChange={e => set('youtubeVideoId', extractVideoId(e.target.value))}
            placeholder="Paste the full YouTube link or just the video ID"
            className={INP}
          />
          <p className="text-xs text-muted-foreground mt-1">Paste the whole YouTube URL — the video ID is pulled out automatically.</p>
        </div>
        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-muted-foreground mb-1">CUSTOM THUMBNAIL URL (optional)</label>
          <input value={form.thumbnailUrl} onChange={e => set('thumbnailUrl', e.target.value)} placeholder="Leave blank to use the YouTube thumbnail automatically" className={INP} />
        </div>
        <div className="sm:col-span-2 flex items-center gap-2">
          <input type="checkbox" id="featured" checked={form.featured} onChange={e => set('featured', e.target.checked)} className="w-4 h-4 accent-primary" />
          <label htmlFor="featured" className="text-sm text-foreground">Feature this track (shown as the main player on the Party Music page)</label>
        </div>
      </div>
      <div className="flex gap-3 pt-2">
        <button onClick={() => onSave(form)} disabled={saving || !form.title || !form.youtubeVideoId}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-sm font-semibold disabled:opacity-50">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />} Save Track
        </button>
        <button onClick={onCancel} className="flex items-center gap-2 px-4 py-2.5 border border-border rounded-lg text-sm text-muted-foreground hover:bg-muted">
          <X className="w-4 h-4" /> Cancel
        </button>
      </div>
    </div>
  );
}

export function MusicManager() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingTrack, setEditingTrack] = useState<Track | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const data = await apiFetch<{ tracks: Track[] }>('GET', '/music');
      setTracks(data.tracks ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load tracks');
      setTracks([]);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async (form: FormData) => {
    setSaving(true);
    try { await apiFetch('POST', '/music', form); setShowForm(false); await load(); }
    catch (e) { setError(e instanceof Error ? e.message : 'Failed'); }
    finally { setSaving(false); }
  };

  const handleUpdate = async (form: FormData) => {
    if (!editingTrack) return;
    setSaving(true);
    try { await apiFetch('PATCH', `/music/${editingTrack.id}`, form); setEditingTrack(null); await load(); }
    catch (e) { setError(e instanceof Error ? e.message : 'Failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    setDeleting(id);
    try { await apiFetch('DELETE', `/music/${id}`); await load(); }
    catch (e) { setError(e instanceof Error ? e.message : 'Failed'); }
    finally { setDeleting(null); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Music className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold text-foreground">Party Music Manager</h2>
          </div>
          <p className="text-sm text-muted-foreground">Add and manage the campaign tracks shown on the public Party Music page. Playback uses YouTube — no audio files are uploaded here.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={load} disabled={loading} className="p-2 rounded-lg border border-border hover:bg-muted">
            <RefreshCw className={`w-4 h-4 text-muted-foreground ${loading ? 'animate-spin' : ''}`} />
          </button>
          {!showForm && !editingTrack && (
            <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-sm font-semibold">
              <Plus className="w-4 h-4" /> Add Track
            </button>
          )}
        </div>
      </div>

      {error && <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700"><AlertCircle className="w-4 h-4 shrink-0" />{error}</div>}

      {showForm && <TrackForm initial={EMPTY} onSave={handleCreate} onCancel={() => setShowForm(false)} saving={saving} />}

      {loading ? (
        <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="rounded-xl border border-border p-4 animate-pulse h-20 bg-muted/20" />)}</div>
      ) : tracks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <Music className="w-12 h-12 mb-3 opacity-20" />
          <p className="font-medium text-foreground">No tracks yet</p>
          <button onClick={() => setShowForm(true)} className="mt-3 flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold">
            <Plus className="w-4 h-4" /> Add First Track
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {tracks.map(t => (
            <div key={t.id}>
              {editingTrack?.id === t.id ? (
                <TrackForm
                  initial={{ title: t.title, artist: t.artist, youtubeVideoId: t.youtubeVideoId, duration: t.duration || '', thumbnailUrl: t.thumbnailUrl || '', featured: t.featured }}
                  onSave={handleUpdate} onCancel={() => setEditingTrack(null)} saving={saving}
                />
              ) : (
                <div className="rounded-xl border border-border overflow-hidden hover:border-primary/30 transition-colors">
                  <div className="flex items-start gap-4 px-4 py-4">
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex items-center justify-center shrink-0 border border-border">
                      <img src={t.thumbnailUrl || `https://img.youtube.com/vi/${t.youtubeVideoId}/default.jpg`} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        {t.featured && <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">⭐ Featured</span>}
                        {t.duration && <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{t.duration}</span>}
                      </div>
                      <p className="font-semibold text-foreground">{t.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{t.artist}</p>
                      <a href={`https://www.youtube.com/watch?v=${t.youtubeVideoId}`} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline mt-1 inline-block">
                        View on YouTube ↗
                      </a>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={() => setEditingTrack(t)} className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted transition-colors" title="Edit">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(t.id, t.title)} disabled={deleting === t.id}
                        className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 transition-colors disabled:opacity-50" title="Delete">
                        {deleting === t.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export { MusicManager as default };
