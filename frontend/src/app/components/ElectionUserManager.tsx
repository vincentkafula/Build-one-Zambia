import { API_BASE } from '@/app/lib/apiBase';
/**
 * Election User Manager
 * Super admin tool to create, view, and manage all 7 tiers of election users:
 * Super Admin → National → Provincial → District → Constituency → Ward → Agent
 */
import { useState, useEffect, useCallback } from 'react';
import {
  Users, Plus, Search, RefreshCw, CheckCircle2, XCircle, Edit2,
  KeyRound, Loader2, AlertCircle, ChevronDown, ChevronUp, Download,
  Shield, MapPin, Building2, BarChart2, ClipboardList, Upload,
} from 'lucide-react';
import { provinces } from '../data/mockData';
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

// ── Config ─────────────────────────────────────────────────────────────────

const ROLE_CONFIG = {
  super_admin:          { label: 'Super National Manager', color: '#7c3aed', icon: Shield,       target: 1,     scope: null },
  national_manager:     { label: 'National Manager',       color: '#0ea5e9', icon: BarChart2,    target: 10,    scope: null },
  provincial_manager:   { label: 'Provincial Manager',     color: '#0891b2', icon: Building2,    target: 10,    scope: 'province' },
  district_manager:     { label: 'District Manager',       color: '#059669', icon: Building2,    target: 116,   scope: 'district' },
  constituency_manager: { label: 'Constituency Manager',   color: '#16a34a', icon: MapPin,       target: 226,   scope: 'constituency' },
  ward_manager:         { label: 'Ward Manager',           color: '#65a30d', icon: MapPin,       target: 1858,  scope: 'ward' },
  agent:                { label: 'Polling Agent',          color: '#dc2626', icon: ClipboardList, target: 13529, scope: 'polling_station' },
} as const;

type RoleKey = keyof typeof ROLE_CONFIG;

interface ElectionUser {
  username: string;
  role: string;
  name: string;
  email?: string;
  phone?: string;
  scopeId?: string;
  scopeName?: string;
  scopeType?: string;
  pollingStationId?: string;
  pollingStationName?: string;
  active: boolean;
  createdAt: string;
  lastLogin?: string;
}

interface Stats {
  total: number; active: number;
  byRole: Record<string, number>;
  targets: Record<string, number>;
}

// ── Sub-components ────────────────────────────────────────────────────────

function RoleCard({ role, stats, selected, onClick }: {
  role: RoleKey; stats: Stats | null; selected: boolean; onClick: () => void;
}) {
  const cfg = ROLE_CONFIG[role];
  const Icon = cfg.icon;
  const count = stats?.byRole[role] ?? 0;
  const pct = cfg.target > 0 ? Math.min(100, (count / cfg.target) * 100) : 100;

  return (
    <button
      onClick={onClick}
      className="text-left rounded-xl border p-4 transition-all"
      style={{
        borderColor: selected ? cfg.color : 'var(--border)',
        backgroundColor: selected ? `${cfg.color}10` : 'var(--card)',
        boxShadow: selected ? `0 0 0 2px ${cfg.color}30` : 'none',
      }}
    >
      <div className="flex items-center gap-2 mb-2">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${cfg.color}15` }}>
          <Icon className="w-4 h-4" style={{ color: cfg.color }} />
        </div>
        <p className="text-xs font-semibold text-foreground">{cfg.label}</p>
      </div>
      <p className="text-2xl font-bold mb-1" style={{ color: cfg.color }}>{count.toLocaleString()}</p>
      <p className="text-xs text-muted-foreground mb-2">of {cfg.target.toLocaleString()} target</p>
      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: cfg.color }} />
      </div>
    </button>
  );
}

// Roles available in the Create User form (excludes super_admin)
const CREATE_ROLES: { key: RoleKey; label: string; scope: string | null }[] = [
  { key: 'national_manager',     label: 'National Manager',      scope: null },
  { key: 'provincial_manager',   label: 'Provincial Manager',    scope: 'province' },
  { key: 'district_manager',     label: 'District Manager',      scope: 'district' },
  { key: 'constituency_manager', label: 'Constituency Manager',  scope: 'constituency' },
  { key: 'ward_manager',         label: 'Ward Manager',          scope: 'ward' },
  { key: 'agent',                label: 'Polling Agent',         scope: 'polling_station' },
];

const INP = 'w-full px-3 py-2 border border-border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary';

function CreateUserForm({ onCreated, defaultRole }: { onCreated: () => void; defaultRole?: RoleKey }) {
  const [form, setForm] = useState({
    name: '', username: '', password: '', phone: '',
    role: (defaultRole ?? 'agent') as RoleKey,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // ECZ cascading geography state
  const [provinceId, setProvinceId]         = useState('');
  const [districtId, setDistrictId]         = useState('');
  const [constituencyId, setConstituencyId] = useState('');
  const [wardId, setWardId]                 = useState('');
  const [pollingStationId, setPollingStationId] = useState('');

  const selProvince     = provinces.find(p => p.id === provinceId);
  const selDistrict     = selProvince?.districts.find(d => d.id === districtId);
  const selConstituency = selDistrict?.constituencies.find(c => c.id === constituencyId);
  const selWard         = selConstituency?.wards.find(w => w.id === wardId);
  const selStation      = selWard?.pollingStations.find(s => s.id === pollingStationId);

  const roleScope = CREATE_ROLES.find(r => r.key === form.role)?.scope ?? null;

  function changeRole(r: RoleKey) {
    setForm(p => ({ ...p, role: r }));
    setProvinceId(''); setDistrictId(''); setConstituencyId(''); setWardId(''); setPollingStationId('');
  }

  function changeProvince(id: string) {
    setProvinceId(id); setDistrictId(''); setConstituencyId(''); setWardId(''); setPollingStationId('');
  }
  function changeDistrict(id: string) {
    setDistrictId(id); setConstituencyId(''); setWardId(''); setPollingStationId('');
  }
  function changeConstituency(id: string) {
    setConstituencyId(id); setWardId(''); setPollingStationId('');
  }
  function changeWard(id: string) {
    setWardId(id); setPollingStationId('');
  }

  // Derive scopeId/scopeName from the deepest selected area
  function getScopeFields() {
    if (!roleScope) return { scopeId: '', scopeName: '', scopeType: null };
    if (roleScope === 'province')         return { scopeId: provinceId,      scopeName: selProvince?.name ?? '',     scopeType: 'province' };
    if (roleScope === 'district')         return { scopeId: districtId,      scopeName: selDistrict?.name ?? '',     scopeType: 'district' };
    if (roleScope === 'constituency')     return { scopeId: constituencyId,  scopeName: selConstituency?.name ?? '', scopeType: 'constituency' };
    if (roleScope === 'ward')             return { scopeId: wardId,          scopeName: selWard?.name ?? '',         scopeType: 'ward' };
    if (roleScope === 'polling_station')  return { scopeId: pollingStationId, scopeName: selStation?.name ?? '',     scopeType: 'polling_station' };
    return { scopeId: '', scopeName: '', scopeType: null };
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { scopeId, scopeName, scopeType } = getScopeFields();
    setSaving(true); setError(''); setSuccess('');
    try {
      await api('POST', '/election-users', {
        ...form,
        scopeId, scopeName, scopeType,
        pollingStationId: form.role === 'agent' ? pollingStationId : undefined,
        pollingStationName: form.role === 'agent' ? selStation?.name : undefined,
      });
      const cfg = ROLE_CONFIG[form.role as RoleKey];
      setSuccess(`✓ ${form.name} created as ${cfg?.label ?? form.role}`);
      setForm(p => ({ ...p, name: '', username: '', password: '', phone: '' }));
      setProvinceId(''); setDistrictId(''); setConstituencyId(''); setWardId(''); setPollingStationId('');
      onCreated();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create user');
    } finally {
      setSaving(false);
    }
  };

  const selRole = CREATE_ROLES.find(r => r.key === form.role);

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      {/* ROLE — dropdown */}
      <div>
        <label className="block text-xs font-semibold text-muted-foreground mb-1.5">ROLE *</label>
        <div className="relative">
          <select
            required
            value={form.role}
            onChange={e => changeRole(e.target.value as RoleKey)}
            className={INP + ' appearance-none pr-8'}
          >
            {CREATE_ROLES.map(r => (
              <option key={r.key} value={r.key}>{r.label}</option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        </div>
        {selRole && (
          <p className="text-xs text-muted-foreground mt-1">
            Scope: <span className="font-medium capitalize">{selRole.scope ?? 'National (no area required)'}</span>
          </p>
        )}
      </div>

      {/* Core identity fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-muted-foreground mb-1">FULL NAME *</label>
          <input required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
            placeholder="e.g. John Mwale" className={INP} />
        </div>
        <div>
          <label className="block text-xs font-semibold text-muted-foreground mb-1">USERNAME *</label>
          <input required value={form.username} onChange={e => setForm(p => ({ ...p, username: e.target.value }))}
            placeholder="Unique login username" className={INP} />
        </div>
        <div>
          <label className="block text-xs font-semibold text-muted-foreground mb-1">PASSWORD *</label>
          <input required type="password" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
            placeholder="Min 8 characters" className={INP} />
        </div>
        <div>
          <label className="block text-xs font-semibold text-muted-foreground mb-1">PHONE</label>
          <input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
            placeholder="+260 97 000 0000" className={INP} />
        </div>
      </div>

      {/* ECZ Geography — Province (all scoped roles) */}
      {roleScope && roleScope !== null && (
        <div className="space-y-3 p-4 rounded-xl border border-border bg-muted/20">
          <p className="text-xs font-bold text-foreground uppercase tracking-wider">Assignment Area</p>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1">PROVINCE *</label>
            <div className="relative">
              <select required value={provinceId} onChange={e => changeProvince(e.target.value)} className={INP + ' appearance-none pr-8'}>
                <option value="">— Select Province —</option>
                {provinces.map(p => <option key={p.id} value={p.id}>{p.name} Province</option>)}
              </select>
              <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            </div>
          </div>

          {/* District */}
          {['district','constituency','ward','polling_station'].includes(roleScope) && (
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">DISTRICT *</label>
              <div className="relative">
                <select required value={districtId} onChange={e => changeDistrict(e.target.value)} disabled={!selProvince} className={INP + ' appearance-none pr-8 disabled:opacity-50'}>
                  <option value="">— {selProvince ? 'Select District' : 'Select Province first'} —</option>
                  {selProvince?.districts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
                <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              </div>
            </div>
          )}

          {/* Constituency */}
          {['constituency','ward','polling_station'].includes(roleScope) && (
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">CONSTITUENCY *</label>
              <div className="relative">
                <select required value={constituencyId} onChange={e => changeConstituency(e.target.value)} disabled={!selDistrict} className={INP + ' appearance-none pr-8 disabled:opacity-50'}>
                  <option value="">— {selDistrict ? 'Select Constituency' : 'Select District first'} —</option>
                  {selDistrict?.constituencies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              </div>
            </div>
          )}

          {/* Ward */}
          {['ward','polling_station'].includes(roleScope) && (
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">WARD *</label>
              <div className="relative">
                <select required value={wardId} onChange={e => changeWard(e.target.value)} disabled={!selConstituency} className={INP + ' appearance-none pr-8 disabled:opacity-50'}>
                  <option value="">— {selConstituency ? 'Select Ward' : 'Select Constituency first'} —</option>
                  {selConstituency?.wards.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                </select>
                <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              </div>
            </div>
          )}

          {/* Polling Station — agent only */}
          {roleScope === 'polling_station' && (
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">POLLING STATION *</label>
              <div className="relative">
                <select required value={pollingStationId} onChange={e => setPollingStationId(e.target.value)} disabled={!selWard} className={INP + ' appearance-none pr-8 disabled:opacity-50'}>
                  <option value="">— {selWard ? 'Select Polling Station' : 'Select Ward first'} —</option>
                  {selWard?.pollingStations.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.registeredVoters.toLocaleString()} voters)</option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              </div>

              {/* Polling Station ID + Name display */}
              {selStation && (
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1">POLLING STATION ID</label>
                    <input readOnly value={pollingStationId} className={INP + ' bg-muted/40 cursor-default'} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1">POLLING STATION NAME</label>
                    <input readOnly value={selStation.name} className={INP + ' bg-muted/40 cursor-default'} />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {error   && <div className="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700"><AlertCircle className="w-4 h-4 shrink-0" />{error}</div>}
      {success && <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700"><CheckCircle2 className="w-4 h-4 shrink-0" />{success}</div>}

      <button type="submit" disabled={saving}
        className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-sm font-semibold transition-colors disabled:opacity-50">
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
        Create {selRole?.label ?? 'User'}
      </button>
    </form>
  );
}

function UserRow({ user, onRefresh }: { user: ElectionUser; onRefresh: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [newPwd, setNewPwd] = useState('');
  const [deactivating, setDeactivating] = useState(false);
  const cfg = ROLE_CONFIG[user.role as RoleKey] ?? { label: user.role, color: '#6b7280' };

  const resetPassword = async () => {
    if (!newPwd || newPwd.length < 6) { alert('Password must be at least 6 characters'); return; }
    setResetting(true);
    try { await api('POST', `/election-users/${user.username}/reset-password`, { newPassword: newPwd }); setNewPwd(''); alert('Password reset successfully'); }
    catch (e) { alert(e instanceof Error ? e.message : 'Failed'); }
    finally { setResetting(false); }
  };

  const deactivate = async () => {
    if (!confirm(`Deactivate ${user.name}? They will lose dashboard access immediately.`)) return;
    setDeactivating(true);
    try { await api('DELETE', `/election-users/${user.username}`); onRefresh(); }
    catch (e) { alert(e instanceof Error ? e.message : 'Failed'); setDeactivating(false); }
  };

  return (
    <div className={`rounded-xl border overflow-hidden ${!user.active ? 'opacity-50' : ''}`} style={{ borderColor: `${cfg.color}30` }}>
      <div className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-muted/10" onClick={() => setExpanded(v => !v)}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${cfg.color}15` }}>
          <span className="text-xs font-bold" style={{ color: cfg.color }}>{user.name.charAt(0)}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground truncate">{user.name}</p>
          <p className="text-xs text-muted-foreground">@{user.username} · {user.scopeName ?? 'National'}</p>
        </div>
        <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: `${cfg.color}15`, color: cfg.color }}>{cfg.label}</span>
        <span className={`text-xs px-2 py-0.5 rounded-full ${user.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{user.active ? 'Active' : 'Inactive'}</span>
        {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />}
      </div>

      {expanded && (
        <div className="border-t border-border px-4 py-3 space-y-3 bg-muted/10">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            {[
              { label: 'Email', value: user.email || '—' },
              { label: 'Phone', value: user.phone || '—' },
              { label: 'Scope ID', value: user.scopeId || user.pollingStationId || '—' },
              { label: 'Last Login', value: user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never' },
            ].map(({ label, value }) => (
              <div key={label} className="bg-card rounded-lg p-2 border border-border">
                <p className="text-muted-foreground">{label}</p>
                <p className="font-medium text-foreground truncate">{value}</p>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="flex gap-1">
              <input value={newPwd} onChange={e => setNewPwd(e.target.value)} type="password" placeholder="New password" className="px-2 py-1.5 border border-border rounded-lg text-xs bg-background w-36 focus:outline-none focus:ring-1 focus:ring-primary" />
              <button onClick={resetPassword} disabled={resetting} className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium disabled:opacity-50">
                {resetting ? <Loader2 className="w-3 h-3 animate-spin" /> : <KeyRound className="w-3 h-3" />} Reset
              </button>
            </div>
            {user.active && (
              <button onClick={deactivate} disabled={deactivating} className="flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-medium disabled:opacity-50">
                {deactivating ? <Loader2 className="w-3 h-3 animate-spin" /> : <XCircle className="w-3 h-3" />} Deactivate
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────

export function ElectionUserManager() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<ElectionUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterRole, setFilterRole] = useState<RoleKey | 'all'>('all');
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'create'>('overview');
  const [bulkText, setBulkText] = useState('');
  const [bulkRole, setBulkRole] = useState<RoleKey>('agent');
  const [bulking, setBulking] = useState(false);
  const [bulkResult, setBulkResult] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes] = await Promise.all([
        api<Stats>('GET', '/election-users/stats'),
        api<{ users: ElectionUser[] }>('GET', '/election-users'),
      ]);
      setStats(statsRes);
      setUsers(usersRes.users);
    } catch (e) {
      console.error('Failed to load users', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = users.filter(u => {
    if (filterRole !== 'all' && u.role !== filterRole) return false;
    if (search) {
      const q = search.toLowerCase();
      return u.name.toLowerCase().includes(q) || u.username.toLowerCase().includes(q) || (u.scopeName ?? '').toLowerCase().includes(q);
    }
    return true;
  });

  const handleBulkImport = async () => {
    const lines = bulkText.trim().split('\n').filter(Boolean);
    if (!lines.length) return;
    setBulking(true); setBulkResult('');
    try {
      const usersToCreate = lines.map(line => {
        const [username, password, name, scopeId, scopeName] = line.split(',').map(s => s.trim());
        const cfg = ROLE_CONFIG[bulkRole];
        return { username, password, name, role: bulkRole, scopeId, scopeName, scopeType: cfg.scope ?? undefined };
      });
      const res = await api<{ created: number; skipped: number; errors: string[] }>('POST', '/election-users/bulk', { users: usersToCreate });
      setBulkResult(`✓ ${res.created} created, ${res.skipped} skipped${res.errors.length ? `, ${res.errors.length} errors` : ''}`);
      await load();
    } catch (e) {
      setBulkResult(`Error: ${e instanceof Error ? e.message : 'Failed'}`);
    } finally {
      setBulking(false); }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold text-foreground">Election User Management</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Manage all {(13529 + 1858 + 226 + 116 + 10 + 10 + 1).toLocaleString()} election system users across 7 access tiers.
          </p>
        </div>
        <button onClick={load} disabled={loading} className="p-2 rounded-lg border border-border hover:bg-muted">
          <RefreshCw className={`w-4 h-4 text-muted-foreground ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-lg border border-border overflow-hidden w-fit">
        {(['overview','users','create'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium capitalize transition-colors ${activeTab === tab ? 'bg-primary text-primary-foreground' : 'bg-card hover:bg-muted'}`}>
            {tab === 'create' ? '+ Create' : tab}
          </button>
        ))}
      </div>

      {/* Overview tab — role cards */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {(Object.keys(ROLE_CONFIG) as RoleKey[]).map(role => (
              <RoleCard key={role} role={role} stats={stats} selected={filterRole === role}
                onClick={() => { setFilterRole(role); setActiveTab('users'); }} />
            ))}
          </div>
          {stats && (
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Total Users', value: stats.total, color: '#7c3aed' },
                { label: 'Active', value: stats.active, color: '#16a34a' },
                { label: 'Inactive', value: stats.inactive, color: '#dc2626' },
              ].map(({ label, value, color }) => (
                <div key={label} className="bg-card border border-border rounded-xl p-4 text-center">
                  <p className="text-3xl font-bold" style={{ color }}>{value.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground mt-1">{label}</p>
                </div>
              ))}
            </div>
          )}

          {/* Bulk import section */}
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Upload className="w-4 h-4 text-muted-foreground" />
              <h3 className="text-sm font-bold text-foreground">Bulk Import Users</h3>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              One user per line: <code className="bg-muted px-1 rounded">username, password, full name, scopeId, scopeName</code>
            </p>
            <div className="flex gap-2 mb-3 flex-wrap">
              <select value={bulkRole} onChange={e => setBulkRole(e.target.value as RoleKey)}
                className="px-3 py-2 border border-border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary">
                {(Object.keys(ROLE_CONFIG) as RoleKey[]).filter(r => r !== 'super_admin').map(r => (
                  <option key={r} value={r}>{ROLE_CONFIG[r].label}</option>
                ))}
              </select>
            </div>
            <textarea value={bulkText} onChange={e => setBulkText(e.target.value)} rows={6}
              placeholder={`agent001, SecurePass123, John Mwale, ps-lusaka-001, Lusaka Primary School\nagent002, SecurePass456, Mary Banda, ps-lusaka-002, Chilenje Hall`}
              className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background font-mono resize-none focus:outline-none focus:ring-2 focus:ring-primary mb-3" />
            {bulkResult && <p className={`text-sm mb-3 ${bulkResult.startsWith('✓') ? 'text-green-700' : 'text-red-700'}`}>{bulkResult}</p>}
            <button onClick={handleBulkImport} disabled={bulking || !bulkText.trim()}
              className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-sm font-semibold disabled:opacity-50">
              {bulking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              Import {bulkText.trim().split('\n').filter(Boolean).length} Users
            </button>
          </div>
        </div>
      )}

      {/* Users tab — searchable list */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-52">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, username, or area…"
                className="w-full pl-9 pr-3 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <select value={filterRole} onChange={e => setFilterRole(e.target.value as RoleKey | 'all')}
              className="px-3 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary">
              <option value="all">All Roles</option>
              {(Object.keys(ROLE_CONFIG) as RoleKey[]).map(r => (
                <option key={r} value={r}>{ROLE_CONFIG[r].label}</option>
              ))}
            </select>
          </div>

          <p className="text-sm text-muted-foreground">
            Showing <strong className="text-foreground">{filtered.length}</strong> of {users.length} users
          </p>

          {loading ? (
            <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-14 bg-muted animate-pulse rounded-xl" />)}</div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <Users className="w-10 h-10 mx-auto mb-2 opacity-20" />
              <p>No users found</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map(u => <UserRow key={u.username} user={u} onRefresh={load} />)}
            </div>
          )}
        </div>
      )}

      {/* Create tab */}
      {activeTab === 'create' && (
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-sm font-bold text-foreground mb-4">Create New User</h3>
          <CreateUserForm onCreated={() => { load(); setActiveTab('users'); }} />
        </div>
      )}
    </div>
  );
}
