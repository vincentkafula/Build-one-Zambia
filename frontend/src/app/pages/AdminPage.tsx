import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { api } from '../services/api/apiClient';
import { ROLE_LABELS, ROLE_COLORS } from '../services/auth/rbac';
import { auditService } from '../services/audit/auditService';
import { syncService } from '../services/sync/syncService';
import { realtimeService } from '../services/realtime/realtimeService';
import { eventBus } from '../services/realtime/eventBus';
import { User } from '../services/auth/authService';
import { VerificationRecord } from '../services/verification/verificationService';
import { AuditEntry } from '../services/audit/auditService';
import { SyncQueueItem } from '../services/sync/syncService';
import {
  LayoutDashboard, Users, ClipboardCheck, FileText, RefreshCw,
  Bell, LogOut, Shield, Database, Activity, AlertTriangle,
  CheckCircle2, XCircle, Clock, ChevronDown, ChevronUp,
  Download, Eye, Search, Filter, Wifi, WifiOff, Server,
  BarChart3, TrendingUp, Globe, Lock
} from 'lucide-react';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line
} from 'recharts';
import { toast } from 'sonner';

type AdminTab = 'dashboard' | 'results' | 'verifications' | 'users' | 'audit' | 'sync' | 'notifications';

const STATUS_COLORS: Record<string, string> = {
  submitted: '#22c55e',
  draft: '#f59e0b',
  verified: '#3b82f6',
  rejected: '#ef4444',
  pending: '#f59e0b',
  signed: '#22c55e',
  completed: '#22c55e',
  failed: '#ef4444',
  in_progress: '#3b82f6',
};

function StatCard({ icon: Icon, label, value, sub, color = '#22c55e' }: {
  icon: React.ElementType; label: string; value: string | number; sub?: string; color?: string;
}) {
  return (
    <div className="bg-gray-800/60 border border-gray-700/50 rounded-xl p-5">
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color}20` }}>
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
      </div>
      <div className="text-2xl font-bold text-white mb-1">{value}</div>
      <div className="text-gray-400 text-sm">{label}</div>
      {sub && <div className="text-gray-500 text-xs mt-1">{sub}</div>}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const color = STATUS_COLORS[status] ?? '#6b7280';
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
      style={{ backgroundColor: `${color}20`, color }}
    >
      {status}
    </span>
  );
}

export default function AdminPage() {
  const { session, logout, can } = useAuth();
  const { notifications, unreadCount, markAllRead } = useNotifications();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [isOnline] = useState(navigator.onLine);

  // Dashboard stats
  const [resultStats, setResultStats] = useState<{ total: number; byStatus: Record<string, number>; byElectionType: Record<string, number> } | null>(null);
  const [verifStats, setVerifStats] = useState<{ total: number; byStatus: Record<string, number>; withDiscrepancies: number; completionRate: number } | null>(null);
  const [syncStats, setSyncStats] = useState<{ pending: number; completed: number; failed: number; lastSyncAt?: string } | null>(null);

  // Tabs data
  const [users, setUsers] = useState<User[]>([]);
  const [verifications, setVerifications] = useState<VerificationRecord[]>([]);
  const [auditLog, setAuditLog] = useState<AuditEntry[]>([]);
  const [syncQueue, setSyncQueue] = useState<SyncQueueItem[]>([]);
  const [tabLoading, setTabLoading] = useState(false);
  const [auditSearch, setAuditSearch] = useState('');
  const [syncing, setSyncing] = useState(false);

  const loadDashboard = useCallback(async () => {
    const [rs, vs, ss] = await Promise.all([
      api.results.getStats(),
      api.verifications.getStats(),
      syncService.getStats(),
    ]);
    if (rs.data) setResultStats(rs.data);
    if (vs.data) setVerifStats(vs.data);
    setSyncStats(ss);
  }, []);

  useEffect(() => {
    if (!session) { navigate('/login'); return; }
    loadDashboard();
    // Refresh every 30s
    const interval = setInterval(loadDashboard, 30000);
    return () => clearInterval(interval);
  }, [session, navigate, loadDashboard]);

  useEffect(() => {
    return eventBus.on('results_updated', loadDashboard);
  }, [loadDashboard]);

  const loadTab = useCallback(async (tab: AdminTab) => {
    setTabLoading(true);
    try {
      if (tab === 'users' && can('users:read')) {
        const res = await api.auth.getAllUsers();
        setUsers(res.data ?? []);
      } else if (tab === 'verifications') {
        const res = await api.verifications.getAll();
        setVerifications(res.data ?? []);
      } else if (tab === 'audit' && can('audit:read')) {
        const entries = await auditService.getAll(200);
        setAuditLog(entries);
      } else if (tab === 'sync' && can('admin:full')) {
        const queue = await syncService.getQueue();
        setSyncQueue(queue);
      }
    } finally {
      setTabLoading(false);
    }
  }, [can]);

  const handleTabChange = (tab: AdminTab) => {
    setActiveTab(tab);
    loadTab(tab);
  };

  const handleSync = async () => {
    if (!session) return;
    setSyncing(true);
    const result = await syncService.process(session.userId);
    setSyncing(false);
    await loadDashboard();
    if (result.processed > 0 || result.failed > 0) {
      toast.success(`Sync complete: ${result.processed} processed, ${result.failed} failed`);
    } else {
      toast.info('Nothing to sync');
    }
    if (activeTab === 'sync') loadTab('sync');
  };

  const handleExport = async (type: string) => {
    if (type === 'results') await api.export.results();
    else if (type === 'verifications') await api.export.verifications();
    else if (type === 'audit') await api.export.auditLog();
    toast.success('Export downloaded');
  };

  const filteredAudit = auditLog.filter((e) =>
    !auditSearch || e.action.toLowerCase().includes(auditSearch.toLowerCase()) ||
    e.entity.toLowerCase().includes(auditSearch.toLowerCase()) ||
    (e.userId ?? '').toLowerCase().includes(auditSearch.toLowerCase())
  );

  const tabs: { id: AdminTab; label: string; icon: React.ElementType; requirePermission?: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'results', label: 'Results', icon: BarChart3 },
    { id: 'verifications', label: 'Verifications', icon: ClipboardCheck },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'audit', label: 'Audit Log', icon: Activity },
    { id: 'sync', label: 'Sync Queue', icon: RefreshCw },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ];

  // Chart data
  const resultPieData = resultStats ? Object.entries(resultStats.byStatus).map(([status, value]) => ({
    // Use a prefixed key to guarantee uniqueness; recharts uses `name` as an internal key
    name: status.charAt(0).toUpperCase() + status.slice(1),
    id: `status-${status}`,
    value,
    fill: STATUS_COLORS[status] ?? '#6b7280',
  })) : [];

  const electionTypeData = resultStats ? Object.entries(resultStats.byElectionType).map(([type, value]) => ({
    name: type.charAt(0).toUpperCase() + type.slice(1),
    id: `type-${type}`,
    value,
  })) : [];

  return (
    <div className="min-h-screen bg-gray-950 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col shrink-0">
        <div className="p-5 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-green-600/20 border border-green-500/30 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <div className="text-white font-semibold text-sm leading-tight">Admin Backend</div>
              <div className="text-gray-500 text-xs">2026 Elections</div>
            </div>
          </div>
        </div>

        {/* User info */}
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-white text-sm font-semibold">
              {session?.name?.charAt(0) ?? 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-white text-sm font-medium truncate">{session?.name}</div>
              <div
                className="text-xs truncate"
                style={{ color: ROLE_COLORS[session?.role ?? 'OBSERVER'] }}
              >
                {ROLE_LABELS[session?.role ?? 'OBSERVER']}
              </div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition ${
                  isActive
                    ? 'bg-green-600/20 text-green-400 border border-green-500/30'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{tab.label}</span>
                {tab.id === 'notifications' && unreadCount > 0 && (
                  <span className="ml-auto bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-gray-800 space-y-2">
          <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs ${isOnline ? 'text-green-400' : 'text-red-400'}`}>
            {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
            {isOnline ? 'Online' : 'Offline'}
          </div>
          <button
            onClick={() => { logout(); navigate('/'); }}
            className="w-full flex items-center gap-3 px-3 py-2 text-gray-400 hover:text-red-400 hover:bg-red-900/10 rounded-lg text-sm transition"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-gray-900/80 border-b border-gray-800 px-6 py-4 flex items-center justify-between sticky top-0 z-10 backdrop-blur">
          <div>
            <h1 className="text-white font-bold text-lg capitalize">{activeTab.replace('_', ' ')}</h1>
            <p className="text-gray-500 text-xs">
              {activeTab === 'dashboard' && 'System overview and live statistics'}
              {activeTab === 'results' && 'Submitted polling station results'}
              {activeTab === 'verifications' && 'Multi-level verification records'}
              {activeTab === 'users' && 'User account management'}
              {activeTab === 'audit' && 'Full audit trail of system actions'}
              {activeTab === 'sync' && 'Sync queue status and management'}
              {activeTab === 'notifications' && 'In-system notifications'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleSync}
              disabled={syncing}
              className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 text-sm px-3 py-2 rounded-lg transition"
            >
              <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
              {syncing ? 'Syncing…' : 'Sync Now'}
            </button>
            {syncStats && syncStats.pending > 0 && (
              <span className="bg-amber-600/20 text-amber-400 border border-amber-500/30 text-xs px-2 py-1 rounded-full">
                {syncStats.pending} pending
              </span>
            )}
          </div>
        </header>

        <div className="p-6">
          {/* DASHBOARD TAB */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard icon={Database} label="Total Results" value={resultStats?.total ?? 0} sub="Across all stations" color="#22c55e" />
                <StatCard icon={ClipboardCheck} label="Verifications" value={verifStats?.total ?? 0} sub={`${verifStats?.completionRate ?? 0}% complete`} color="#3b82f6" />
                <StatCard icon={AlertTriangle} label="Discrepancies" value={verifStats?.withDiscrepancies ?? 0} sub="Requires review" color="#f59e0b" />
                <StatCard icon={RefreshCw} label="Sync Queue" value={syncStats?.pending ?? 0} sub={`${syncStats?.completed ?? 0} completed`} color="#a855f7" />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Results by status pie */}
                <div className="bg-gray-800/60 border border-gray-700/50 rounded-xl p-5">
                  <h3 className="text-white font-semibold mb-4">Results by Status</h3>
                  {resultPieData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={220}>
                      <PieChart>
                        <Pie data={resultPieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                          {resultPieData.map((entry, idx) => (
                            <Cell key={`cell-${idx}`} fill={entry.fill} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px', color: '#fff' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[220px] flex items-center justify-center text-gray-500">
                      No results submitted yet
                    </div>
                  )}
                </div>

                {/* Results by election type bar */}
                <div className="bg-gray-800/60 border border-gray-700/50 rounded-xl p-5">
                  <h3 className="text-white font-semibold mb-4">Results by Election Type</h3>
                  {electionTypeData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={electionTypeData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                        <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} />
                        <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px', color: '#fff' }} />
                        <Bar dataKey="value" fill="#22c55e" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[220px] flex items-center justify-center text-gray-500">
                      No results submitted yet
                    </div>
                  )}
                </div>
              </div>

              {/* Verification status breakdown */}
              {verifStats && (
                <div className="bg-gray-800/60 border border-gray-700/50 rounded-xl p-5">
                  <h3 className="text-white font-semibold mb-4">Verification Status</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.entries(verifStats.byStatus).map(([status, count]) => (
                      <div key={status} className="text-center">
                        <div className="text-2xl font-bold" style={{ color: STATUS_COLORS[status] ?? '#fff' }}>{count}</div>
                        <div className="text-gray-400 text-sm capitalize">{status}</div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4">
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                      <span>Completion Rate</span>
                      <span>{verifStats.completionRate}%</span>
                    </div>
                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500 rounded-full transition-all"
                        style={{ width: `${verifStats.completionRate}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* System info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { label: 'Database', value: 'IndexedDB v1', icon: Server, color: '#22c55e', sub: '8 object stores' },
                  { label: 'Auth System', value: 'Session-based', icon: Lock, color: '#3b82f6', sub: '8-hour sessions' },
                  { label: 'Sync Status', value: syncStats?.lastSyncAt ? 'Active' : 'Idle', icon: Globe, color: '#a855f7', sub: syncStats?.lastSyncAt ? `Last: ${new Date(syncStats.lastSyncAt).toLocaleTimeString()}` : 'Never synced' },
                ].map((info) => (
                  <div key={info.label} className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${info.color}20` }}>
                      <info.icon className="w-5 h-5" style={{ color: info.color }} />
                    </div>
                    <div>
                      <div className="text-white font-medium">{info.value}</div>
                      <div className="text-gray-500 text-xs">{info.label} · {info.sub}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* RESULTS TAB */}
          {activeTab === 'results' && (
            <ResultsTab />
          )}

          {/* VERIFICATIONS TAB */}
          {activeTab === 'verifications' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">{verifications.length} records</span>
                <button
                  onClick={() => handleExport('verifications')}
                  className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 text-sm px-3 py-2 rounded-lg transition"
                >
                  <Download className="w-4 h-4" /> Export CSV
                </button>
              </div>
              {tabLoading ? (
                <div className="flex items-center justify-center h-40">
                  <div className="w-8 h-8 border-2 border-green-500/30 border-t-green-500 rounded-full animate-spin" />
                </div>
              ) : verifications.length === 0 ? (
                <div className="text-center py-20 text-gray-500">
                  <ClipboardCheck className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>No verification records yet</p>
                  <p className="text-sm mt-1">Records appear when returning officers sign off on results</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {verifications.map((v) => (
                    <div key={v.id} className="bg-gray-800/60 border border-gray-700/50 rounded-xl p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="text-white font-medium">{v.levelName}</div>
                          <div className="text-gray-400 text-sm">{v.levelType} · {v.electionType}</div>
                          <div className="text-gray-500 text-xs mt-1">Officer: {v.officer.name} ({v.officer.eczId})</div>
                        </div>
                        <div className="text-right">
                          <StatusBadge status={v.status} />
                          {v.discrepancy > 0 && (
                            <div className="text-amber-400 text-xs mt-1 flex items-center gap-1 justify-end">
                              <AlertTriangle className="w-3 h-3" />
                              {v.discrepancy} vote diff
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* USERS TAB */}
          {activeTab === 'users' && can('users:read') && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">{users.length} users</span>
              </div>
              {tabLoading ? (
                <div className="flex items-center justify-center h-40">
                  <div className="w-8 h-8 border-2 border-green-500/30 border-t-green-500 rounded-full animate-spin" />
                </div>
              ) : (
                <div className="space-y-2">
                  {users.map((user) => (
                    <div key={user.id} className="bg-gray-800/60 border border-gray-700/50 rounded-xl p-4 flex items-center gap-4">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm shrink-0"
                        style={{ backgroundColor: `${ROLE_COLORS[user.role]}30`, border: `1px solid ${ROLE_COLORS[user.role]}40` }}
                      >
                        {user.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-white font-medium">{user.name}</div>
                        <div className="text-gray-400 text-sm">@{user.username}</div>
                        {user.eczId && <div className="text-gray-500 text-xs">ECZ ID: {user.eczId}</div>}
                      </div>
                      <div className="text-right shrink-0">
                        <div
                          className="text-xs font-medium px-2 py-1 rounded-full"
                          style={{ backgroundColor: `${ROLE_COLORS[user.role]}20`, color: ROLE_COLORS[user.role] }}
                        >
                          {ROLE_LABELS[user.role]}
                        </div>
                        <div className={`text-xs mt-1 ${user.active ? 'text-green-400' : 'text-red-400'}`}>
                          {user.active ? '● Active' : '● Inactive'}
                        </div>
                        {user.lastLogin && (
                          <div className="text-gray-600 text-xs">
                            Last: {new Date(user.lastLogin).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* AUDIT TAB */}
          {activeTab === 'audit' && can('audit:read') && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    value={auditSearch}
                    onChange={(e) => setAuditSearch(e.target.value)}
                    placeholder="Search audit log…"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-9 pr-4 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-green-500"
                  />
                </div>
                <button
                  onClick={() => handleExport('audit')}
                  className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 text-sm px-3 py-2 rounded-lg transition"
                >
                  <Download className="w-4 h-4" /> Export
                </button>
              </div>
              <div className="text-gray-400 text-xs">{filteredAudit.length} entries</div>
              {tabLoading ? (
                <div className="flex items-center justify-center h-40">
                  <div className="w-8 h-8 border-2 border-green-500/30 border-t-green-500 rounded-full animate-spin" />
                </div>
              ) : (
                <div className="space-y-1.5 max-h-[600px] overflow-y-auto">
                  {filteredAudit.map((entry) => (
                    <div key={entry.id} className="bg-gray-800/40 border border-gray-700/30 rounded-lg px-4 py-3 flex items-start gap-3 text-sm">
                      <Activity className="w-4 h-4 text-gray-500 shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-green-400 font-medium">{entry.action}</span>
                          <span className="text-gray-500">→</span>
                          <span className="text-gray-300">{entry.entity}</span>
                          {entry.entityId && (
                            <span className="text-gray-500 text-xs font-mono">{entry.entityId.slice(0, 16)}…</span>
                          )}
                        </div>
                        {entry.userId && (
                          <div className="text-gray-500 text-xs">User: {entry.userId}</div>
                        )}
                      </div>
                      <div className="text-gray-600 text-xs shrink-0">
                        {new Date(entry.timestamp).toLocaleString()}
                      </div>
                    </div>
                  ))}
                  {filteredAudit.length === 0 && (
                    <div className="text-center py-10 text-gray-500">No audit entries found</div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* SYNC TAB */}
          {activeTab === 'sync' && (
            <div className="space-y-6">
              {syncStats && (
                <div className="grid grid-cols-3 gap-4">
                  <StatCard icon={Clock} label="Pending" value={syncStats.pending} color="#f59e0b" />
                  <StatCard icon={CheckCircle2} label="Completed" value={syncStats.completed} color="#22c55e" />
                  <StatCard icon={XCircle} label="Failed" value={syncStats.failed} color="#ef4444" />
                </div>
              )}
              <div className="bg-gray-800/60 border border-gray-700/50 rounded-xl p-5">
                <h3 className="text-white font-semibold mb-4">Sync Queue</h3>
                {tabLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="w-8 h-8 border-2 border-green-500/30 border-t-green-500 rounded-full animate-spin" />
                  </div>
                ) : syncQueue.length === 0 ? (
                  <div className="text-center py-10 text-gray-500">Queue is empty</div>
                ) : (
                  <div className="space-y-2">
                    {syncQueue.slice(0, 50).map((item) => (
                      <div key={item.id} className="flex items-center gap-3 text-sm border-b border-gray-700/30 pb-2">
                        <StatusBadge status={item.status} />
                        <span className="text-gray-400">{item.operation}</span>
                        <span className="text-white">{item.entity}</span>
                        <span className="text-gray-500 font-mono text-xs">{item.entityId.slice(0, 12)}…</span>
                        <span className="ml-auto text-gray-600 text-xs">Priority {item.priority}</span>
                        {item.retryCount > 0 && (
                          <span className="text-amber-400 text-xs">retry {item.retryCount}/{item.maxRetries}</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* NOTIFICATIONS TAB */}
          {activeTab === 'notifications' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">{unreadCount} unread</span>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-green-400 hover:text-green-300 text-sm transition"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              {notifications.length === 0 ? (
                <div className="text-center py-20 text-gray-500">
                  <Bell className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>No notifications yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`bg-gray-800/60 border rounded-xl p-4 transition ${
                        n.read ? 'border-gray-700/30 opacity-60' : 'border-gray-600/60'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                          n.type === 'error' ? 'bg-red-500' :
                          n.type === 'warning' ? 'bg-amber-500' :
                          n.type === 'success' ? 'bg-green-500' : 'bg-blue-500'
                        }`} />
                        <div className="flex-1">
                          <div className="text-white font-medium text-sm">{n.title}</div>
                          <div className="text-gray-400 text-sm mt-0.5">{n.message}</div>
                          <div className="text-gray-600 text-xs mt-1">{new Date(n.createdAt).toLocaleString()}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

// Results sub-panel with live data
function ResultsTab() {
  const [results, setResults] = useState<import('../services/results/resultsService').PollingStationResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    const res = await api.results.getAll();
    setResults(res.data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { return eventBus.on('results_updated', () => load()); }, [load]);

  const filtered = results.filter((r) =>
    !search ||
    r.pollingStationName.toLowerCase().includes(search.toLowerCase()) ||
    r.provinceName.toLowerCase().includes(search.toLowerCase()) ||
    r.districtName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by station, province, district…"
            className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-9 pr-4 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-green-500"
          />
        </div>
        <button
          onClick={() => api.export.results()}
          className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 text-sm px-3 py-2 rounded-lg transition"
        >
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>
      <div className="text-gray-400 text-xs">{filtered.length} results</div>
      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-8 h-8 border-2 border-green-500/30 border-t-green-500 rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No results submitted yet</p>
          <p className="text-sm mt-1">Results appear after polling agents submit data</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700">
                {['Polling Station', 'Province', 'District', 'Election', 'Votes Cast', 'Turnout', 'Status', 'Agent', 'Submitted'].map((h) => (
                  <th key={h} className="text-left text-gray-400 font-medium py-3 px-3 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition">
                  <td className="py-3 px-3 text-white">{r.pollingStationName}</td>
                  <td className="py-3 px-3 text-gray-300">{r.provinceName}</td>
                  <td className="py-3 px-3 text-gray-400">{r.districtName}</td>
                  <td className="py-3 px-3 text-gray-400 capitalize">{r.electionType}</td>
                  <td className="py-3 px-3 text-gray-300">{r.totalVotesCast.toLocaleString()}</td>
                  <td className="py-3 px-3 text-gray-300">
                    {r.registeredVoters > 0 ? ((r.totalVotesCast / r.registeredVoters) * 100).toFixed(1) : 0}%
                  </td>
                  <td className="py-3 px-3"><StatusBadge status={r.status} /></td>
                  <td className="py-3 px-3 text-gray-400">{r.agentName}</td>
                  <td className="py-3 px-3 text-gray-500">{new Date(r.submittedAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
