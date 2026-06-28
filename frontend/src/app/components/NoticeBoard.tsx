import { API_BASE } from '@/app/lib/apiBase';
/**
 * NoticeBoard — inter-level correction request and notice system.
 * Managers send notices/correction requests to agents or lower managers.
 * Agents/lower managers see their inbox and can respond.
 */
import { useState, useEffect, useCallback } from 'react';
import {
  Bell, Send, RefreshCw, AlertCircle, CheckCircle2, Info,
  Loader2, MessageSquare, Clock, Search, Users,
} from 'lucide-react';
import { getToken } from '../lib/api';

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

async function api<T>(method: string, path: string, body?: unknown): Promise<T> {
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

interface Notice {
  id: string;
  fromUsername: string; fromName: string; fromRole: string;
  toUsername: string;   toName?: string;
  submissionId?: string;
  pollingStationId?: string; pollingStationName?: string;
  message: string;
  type: 'correction_request' | 'info' | 'warning' | 'approval';
  createdAt: string; read: boolean;
}

const TYPE_CONFIG = {
  correction_request: { label: 'Correction Request', color: '#dc2626', bg: 'bg-red-50', border: 'border-red-200', icon: AlertCircle },
  warning:            { label: 'Warning',            color: '#d97706', bg: 'bg-amber-50', border: 'border-amber-200', icon: AlertCircle },
  info:               { label: 'Information',        color: '#0ea5e9', bg: 'bg-blue-50', border: 'border-blue-200', icon: Info },
  approval:           { label: 'Approved',           color: '#16a34a', bg: 'bg-green-50', border: 'border-green-200', icon: CheckCircle2 },
};

function NoticeCard({ notice, onMarkRead }: { notice: Notice; onMarkRead: (id: string) => void }) {
  const cfg = TYPE_CONFIG[notice.type] ?? TYPE_CONFIG.info;
  const Icon = cfg.icon;

  return (
    <div className={`rounded-xl border p-4 ${notice.read ? 'opacity-60' : ''} ${cfg.bg} ${cfg.border}`}>
      <div className="flex items-start gap-3">
        <Icon className="w-4 h-4 mt-0.5 shrink-0" style={{ color: cfg.color }} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1 flex-wrap">
            <span className="text-xs font-semibold" style={{ color: cfg.color }}>{cfg.label}</span>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {new Date(notice.createdAt).toLocaleString()}
            </span>
          </div>
          <p className="text-sm text-foreground mb-2">{notice.message}</p>
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span>From: <strong className="text-foreground">{notice.fromName}</strong> ({notice.fromRole.replace(/_/g, ' ')})</span>
            {notice.pollingStationName && <span>Station: <strong className="text-foreground">{notice.pollingStationName}</strong></span>}
            {notice.submissionId && <span>Submission: <code className="bg-muted px-1 rounded">{notice.submissionId.slice(0, 12)}…</code></span>}
          </div>
        </div>
        {!notice.read && (
          <button onClick={() => onMarkRead(notice.id)}
            className="text-xs px-2 py-1 bg-white border border-border rounded-lg text-muted-foreground hover:text-foreground shrink-0">
            Mark read
          </button>
        )}
      </div>
    </div>
  );
}

function SendNoticeForm({ onSent }: { onSent: () => void }) {
  const [form, setForm] = useState({
    toUsername: '', message: '', type: 'correction_request' as Notice['type'],
    submissionId: '', pollingStationId: '', pollingStationName: '',
  });
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.toUsername || !form.message) { setError('Recipient username and message are required'); return; }
    setSending(true); setError(''); setSuccess('');
    try {
      await api('POST', '/notices', form);
      setSuccess('Notice sent successfully');
      setForm(p => ({ ...p, toUsername: '', message: '', submissionId: '', pollingStationId: '', pollingStationName: '' }));
      onSent();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to send');
    } finally {
      setSending(false);
    }
  };

  return (
    <form onSubmit={handleSend} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-muted-foreground mb-1">RECIPIENT USERNAME *</label>
          <div className="relative">
            <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input required value={form.toUsername} onChange={e => set('toUsername', e.target.value)} placeholder="agent's or manager's username"
              className="w-full pl-9 pr-3 py-2 border border-border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-muted-foreground mb-1">NOTICE TYPE</label>
          <select value={form.type} onChange={e => set('type', e.target.value)}
            className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary">
            {Object.entries(TYPE_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-muted-foreground mb-1">MESSAGE *</label>
        <textarea required value={form.message} onChange={e => set('message', e.target.value)} rows={3}
          placeholder="Explain what needs to be corrected or verified…"
          className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-semibold text-muted-foreground mb-1">POLLING STATION</label>
          <input value={form.pollingStationName} onChange={e => set('pollingStationName', e.target.value)} placeholder="optional"
            className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-muted-foreground mb-1">STATION ID</label>
          <input value={form.pollingStationId} onChange={e => set('pollingStationId', e.target.value)} placeholder="optional"
            className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-muted-foreground mb-1">SUBMISSION ID</label>
          <input value={form.submissionId} onChange={e => set('submissionId', e.target.value)} placeholder="optional"
            className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary" />
        </div>
      </div>

      {error && <div className="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700"><AlertCircle className="w-4 h-4" />{error}</div>}
      {success && <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700"><CheckCircle2 className="w-4 h-4" />{success}</div>}

      <button type="submit" disabled={sending}
        className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-sm font-semibold disabled:opacity-50">
        {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        Send Notice
      </button>
    </form>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────

export function NoticeBoard() {
  const [inbox, setInbox] = useState<Notice[]>([]);
  const [sent, setSent] = useState<Notice[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'inbox' | 'sent' | 'compose'>('inbox');
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [inboxRes, sentRes] = await Promise.all([
        api<{ notices: Notice[]; unreadCount: number }>('GET', '/notices'),
        api<{ notices: Notice[] }>('GET', '/notices/sent'),
      ]);
      setInbox(inboxRes.notices);
      setUnreadCount(inboxRes.unreadCount);
      setSent(sentRes.notices);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const markRead = async (id: string) => {
    try {
      await api('PATCH', `/notices/${id}/read`);
      setInbox(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch {}
  };

  const filteredInbox = inbox.filter(n =>
    !search || n.fromName.toLowerCase().includes(search.toLowerCase()) ||
    n.message.toLowerCase().includes(search.toLowerCase()) ||
    (n.pollingStationName ?? '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Bell className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold text-foreground">Notice Board</h2>
            {unreadCount > 0 && (
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-red-500 text-white text-xs font-bold">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            Send correction requests to agents or lower managers. Receive notices from your supervisor.
          </p>
        </div>
        <button onClick={load} disabled={loading} className="p-2 rounded-lg border border-border hover:bg-muted">
          <RefreshCw className={`w-4 h-4 text-muted-foreground ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-red-600">{unreadCount}</p>
          <p className="text-xs text-muted-foreground">Unread</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-foreground">{inbox.length}</p>
          <p className="text-xs text-muted-foreground">Total Received</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-foreground">{sent.length}</p>
          <p className="text-xs text-muted-foreground">Sent</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-lg border border-border overflow-hidden w-fit">
        {([
          { id: 'inbox',   label: `Inbox${unreadCount > 0 ? ` (${unreadCount})` : ''}` },
          { id: 'sent',    label: 'Sent' },
          { id: 'compose', label: '+ Send Notice' },
        ] as const).map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium transition-colors ${activeTab === tab.id ? 'bg-primary text-primary-foreground' : 'bg-card hover:bg-muted'}`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Inbox */}
      {activeTab === 'inbox' && (
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search notices…"
              className="w-full pl-9 pr-3 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
          {loading ? (
            [...Array(3)].map((_, i) => <div key={i} className="h-20 bg-muted animate-pulse rounded-xl" />)
          ) : filteredInbox.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <MessageSquare className="w-10 h-10 mx-auto mb-2 opacity-20" />
              <p>{search ? 'No notices match your search' : 'No notices yet — your inbox is empty'}</p>
            </div>
          ) : (
            filteredInbox.map(n => <NoticeCard key={n.id} notice={n} onMarkRead={markRead} />)
          )}
        </div>
      )}

      {/* Sent */}
      {activeTab === 'sent' && (
        <div className="space-y-3">
          {loading ? (
            [...Array(3)].map((_, i) => <div key={i} className="h-20 bg-muted animate-pulse rounded-xl" />)
          ) : sent.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <Send className="w-10 h-10 mx-auto mb-2 opacity-20" />
              <p>No notices sent yet</p>
            </div>
          ) : (
            sent.map(n => (
              <div key={n.id} className="rounded-xl border border-border p-4 bg-card">
                <div className="flex items-center justify-between mb-1 flex-wrap gap-2">
                  <span className="text-sm font-semibold text-foreground">To: {n.toName ?? n.toUsername}</span>
                  <span className="text-xs text-muted-foreground">{new Date(n.createdAt).toLocaleString()}</span>
                </div>
                <p className="text-sm text-muted-foreground">{n.message}</p>
                {n.pollingStationName && <p className="text-xs text-muted-foreground mt-1">Station: {n.pollingStationName}</p>}
              </div>
            ))
          )}
        </div>
      )}

      {/* Compose */}
      {activeTab === 'compose' && (
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
            <Send className="w-4 h-4" /> Send Notice / Correction Request
          </h3>
          <SendNoticeForm onSent={() => { load(); setActiveTab('sent'); }} />
        </div>
      )}
    </div>
  );
}
