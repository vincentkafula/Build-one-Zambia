import { API_BASE } from '@/app/lib/apiBase';
import { useState, useEffect, useCallback } from 'react';
import {
  Calendar, Plus, Edit2, Trash2, RefreshCw, Loader2,
  AlertCircle, CheckCircle2, X, ChevronDown,
} from 'lucide-react';
import { getToken } from '../lib/api';
import { projectId } from '../../../utils/supabase/info';

// Safe fetch wrapper — handles non-JSON responses (e.g. rate limit plain text)
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

interface BOZEvent {
  id: string; title: string; date: string; time: string;
  venue: string; province: string; type: string; description: string;
  capacity?: number; status: 'upcoming' | 'past' | 'cancelled';
  featured: boolean; createdAt: string; updatedAt: string; createdBy: string;
}

const EVENT_TYPES = ['Conference','Rally','Forum','Summit','Symposium','Launch','Election Day','Meeting','Training','Other'];
const STATUS_OPTS = ['upcoming','past','cancelled'] as const;
const STATUS_COLORS: Record<string,string> = { upcoming:'bg-green-100 text-green-800', past:'bg-gray-100 text-gray-700', cancelled:'bg-red-100 text-red-700' };
const INP = 'w-full px-3 py-2 border border-border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary';

const EMPTY = { title:'', date:'', time:'', venue:'', province:'Lusaka Province', type:'Conference', description:'', capacity:undefined as number|undefined, status:'upcoming' as const, featured:false };
type FormData = typeof EMPTY;

function EventForm({ initial, onSave, onCancel, saving }: { initial: FormData; onSave: (d: FormData) => Promise<void>; onCancel: () => void; saving: boolean }) {
  const [form, setForm] = useState(initial);
  const set = (k: keyof FormData, v: unknown) => setForm(p => ({ ...p, [k]: v }));
  return (
    <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-muted-foreground mb-1">EVENT TITLE *</label>
          <input required value={form.title} onChange={e => set('title', e.target.value)} placeholder="e.g. Copperbelt Grand Rally" className={INP} />
        </div>
        <div>
          <label className="block text-xs font-semibold text-muted-foreground mb-1">DATE *</label>
          <input required value={form.date} onChange={e => set('date', e.target.value)} placeholder="e.g. Saturday, 26 July 2026" className={INP} />
        </div>
        <div>
          <label className="block text-xs font-semibold text-muted-foreground mb-1">TIME</label>
          <input value={form.time} onChange={e => set('time', e.target.value)} placeholder="e.g. 10:00 – 15:00" className={INP} />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-muted-foreground mb-1">VENUE *</label>
          <input required value={form.venue} onChange={e => set('venue', e.target.value)} placeholder="e.g. Nkana Stadium, Kitwe" className={INP} />
        </div>
        <div>
          <label className="block text-xs font-semibold text-muted-foreground mb-1">PROVINCE</label>
          <input value={form.province} onChange={e => set('province', e.target.value)} placeholder="e.g. Copperbelt Province" className={INP} />
        </div>
        <div>
          <label className="block text-xs font-semibold text-muted-foreground mb-1">CAPACITY</label>
          <input type="number" value={form.capacity ?? ''} onChange={e => set('capacity', e.target.value ? Number(e.target.value) : undefined)} placeholder="e.g. 5000" className={INP} />
        </div>
        <div>
          <label className="block text-xs font-semibold text-muted-foreground mb-1">TYPE</label>
          <div className="relative">
            <select value={form.type} onChange={e => set('type', e.target.value)} className={INP + ' appearance-none pr-8'}>
              {EVENT_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
            <ChevronDown className="w-4 h-4 absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-muted-foreground mb-1">STATUS</label>
          <div className="relative">
            <select value={form.status} onChange={e => set('status', e.target.value)} className={INP + ' appearance-none pr-8'}>
              {STATUS_OPTS.map(s => <option key={s} value={s} className="capitalize">{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
            </select>
            <ChevronDown className="w-4 h-4 absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          </div>
        </div>
        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-muted-foreground mb-1">DESCRIPTION *</label>
          <textarea required rows={3} value={form.description} onChange={e => set('description', e.target.value)} placeholder="Brief description…" className={INP + ' resize-none'} />
        </div>
        <div className="sm:col-span-2 flex items-center gap-2">
          <input type="checkbox" id="featured" checked={form.featured} onChange={e => set('featured', e.target.checked)} className="w-4 h-4 accent-primary" />
          <label htmlFor="featured" className="text-sm text-foreground">Feature this event (shown prominently on the website)</label>
        </div>
      </div>
      <div className="flex gap-3 pt-2">
        <button onClick={() => onSave(form)} disabled={saving || !form.title || !form.date || !form.venue || !form.description}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-sm font-semibold disabled:opacity-50">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />} Save Event
        </button>
        <button onClick={onCancel} className="flex items-center gap-2 px-4 py-2.5 border border-border rounded-lg text-sm text-muted-foreground hover:bg-muted">
          <X className="w-4 h-4" /> Cancel
        </button>
      </div>
    </div>
  );
}

export function EventsManager() {
  const [eventsList, setEventsList] = useState<BOZEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all'|'upcoming'|'past'|'cancelled'>('all');
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<BOZEvent | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const data = await apiFetch<{ events: BOZEvent[] }>('GET', `/events${filterStatus !== 'all' ? `?status=${filterStatus}` : ''}`);
      setEventsList(data.events ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load events');
      setEventsList([]);
    } finally { setLoading(false); }
  }, [filterStatus]);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async (form: FormData) => {
    setSaving(true);
    try { await apiFetch('POST', '/events', form); setShowForm(false); await load(); }
    catch (e) { setError(e instanceof Error ? e.message : 'Failed'); }
    finally { setSaving(false); }
  };

  const handleUpdate = async (form: FormData) => {
    if (!editingEvent) return;
    setSaving(true);
    try { await apiFetch('PATCH', `/events/${editingEvent.id}`, form); setEditingEvent(null); await load(); }
    catch (e) { setError(e instanceof Error ? e.message : 'Failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    setDeleting(id);
    try { await apiFetch('DELETE', `/events/${id}`); await load(); }
    catch (e) { setError(e instanceof Error ? e.message : 'Failed'); }
    finally { setDeleting(null); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Calendar className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold text-foreground">Events Manager</h2>
          </div>
          <p className="text-sm text-muted-foreground">Create, edit, and manage all BOZ campaign events shown on the website.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={load} disabled={loading} className="p-2 rounded-lg border border-border hover:bg-muted">
            <RefreshCw className={`w-4 h-4 text-muted-foreground ${loading ? 'animate-spin' : ''}`} />
          </button>
          {!showForm && !editingEvent && (
            <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-sm font-semibold">
              <Plus className="w-4 h-4" /> Add Event
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Upcoming', count: eventsList.filter(e => e.status==='upcoming').length, cls: 'text-green-700 bg-green-50 border-green-200' },
          { label: 'Past',     count: eventsList.filter(e => e.status==='past').length,     cls: 'text-gray-700  bg-gray-50  border-gray-200'  },
          { label: 'Total',    count: eventsList.length,                                    cls: 'text-primary  bg-primary/5 border-primary/20' },
        ].map(({ label, count, cls }) => (
          <div key={label} className={`rounded-xl border p-4 text-center ${cls}`}>
            <p className="text-2xl font-bold">{count}</p>
            <p className="text-xs font-medium mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {error && <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700"><AlertCircle className="w-4 h-4 shrink-0" />{error}</div>}

      {showForm && <EventForm initial={EMPTY} onSave={handleCreate} onCancel={() => setShowForm(false)} saving={saving} />}

      <div className="flex gap-1 p-1 rounded-xl bg-muted/40 w-fit">
        {(['all','upcoming','past','cancelled'] as const).map(s => (
          <button key={s} onClick={() => setFilterStatus(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${filterStatus===s ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground'}`}>
            {s === 'all' ? 'All Events' : s}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(3)].map((_,i) => <div key={i} className="rounded-xl border border-border p-4 animate-pulse h-20 bg-muted/20" />)}</div>
      ) : eventsList.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <Calendar className="w-12 h-12 mb-3 opacity-20" />
          <p className="font-medium text-foreground">No events found</p>
          <button onClick={() => setShowForm(true)} className="mt-3 flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold">
            <Plus className="w-4 h-4" /> Add First Event
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {eventsList.map(ev => (
            <div key={ev.id}>
              {editingEvent?.id === ev.id ? (
                <EventForm
                  initial={{ title:ev.title, date:ev.date, time:ev.time, venue:ev.venue, province:ev.province, type:ev.type, description:ev.description, capacity:ev.capacity, status:ev.status, featured:ev.featured }}
                  onSave={handleUpdate} onCancel={() => setEditingEvent(null)} saving={saving}
                />
              ) : (
                <div className="rounded-xl border border-border overflow-hidden hover:border-primary/30 transition-colors">
                  <div className="flex items-start gap-4 px-4 py-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_COLORS[ev.status] ?? ''}`}>{ev.status}</span>
                        <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{ev.type}</span>
                        {ev.featured && <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">⭐ Featured</span>}
                      </div>
                      <p className="font-semibold text-foreground">{ev.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{ev.date}{ev.time ? ` · ${ev.time}` : ''} · {ev.venue}</p>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{ev.description}</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={() => setEditingEvent(ev)} className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted transition-colors" title="Edit">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(ev.id, ev.title)} disabled={deleting===ev.id}
                        className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 transition-colors disabled:opacity-50" title="Delete">
                        {deleting===ev.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
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
