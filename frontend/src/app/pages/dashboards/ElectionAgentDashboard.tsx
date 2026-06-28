import { useState, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router';
import {
  LayoutDashboard, ClipboardList, UserCircle, Lock,
  CheckCircle, ScanLine, ShieldCheck, Radio, BarChart2,
  MapPin, FileText,
} from 'lucide-react';
import { DashboardShell, DashCard } from '../../components/DashboardShell';
import { clearToken } from '../../lib/api';

const DataEntryPage        = lazy(() => import('../DataEntryPage').then(m => ({ default: m.DataEntryPage })));
const AgentScannerMode     = lazy(() => import('../../components/AgentScannerMode').then(m => ({ default: m.AgentScannerMode })));
const VoterVerification    = lazy(() => import('../../components/VoterVerification').then(m => ({ default: m.VoterVerification })));
const LiveStreamViewer     = lazy(() => import('../../components/LiveStreamViewer').then(m => ({ default: m.LiveStreamViewer })));
const ResultsApprovalQueue = lazy(() => import('../../components/ResultsApprovalQueue').then(m => ({ default: m.ResultsApprovalQueue })));

function SectionLoader() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
    </div>
  );
}

const RED  = '#dc2626';
const NAVY = '#0f1f33';

// ── Role-based section access ─────────────────────────────────────────────────
const ROLE_CONFIG: Record<string, { label: string; color: string; sections: string[] }> = {
  election_agent: {
    label: 'Election Agent',
    color: RED,
    sections: ['overview', 'voter-verify', 'enter-results', 'submitted', 'live-streams', 'personal-details', 'security'],
  },
  ward_manager: {
    label: 'Ward Manager',
    color: '#16a34a',
    sections: ['overview', 'voter-verify', 'enter-results', 'submitted', 'results-approval', 'ballot-scan', 'live-streams', 'personal-details', 'security'],
  },
  constituency_manager: {
    label: 'Constituency Manager',
    color: '#0ea5e9',
    sections: ['overview', 'voter-verify', 'enter-results', 'submitted', 'results-approval', 'ballot-scan', 'live-streams', 'ecz-figures', 'personal-details', 'security'],
  },
  district_manager: {
    label: 'District Manager',
    color: '#f59e0b',
    sections: ['overview', 'voter-verify', 'enter-results', 'submitted', 'results-approval', 'ballot-scan', 'live-streams', 'ecz-figures', 'voter-turnout', 'personal-details', 'security'],
  },
};

type SectionKey =
  | 'overview' | 'voter-verify' | 'enter-results' | 'submitted'
  | 'results-approval' | 'ballot-scan' | 'live-streams' | 'ecz-figures'
  | 'voter-turnout' | 'personal-details' | 'security';

const ALL_NAV: { key: SectionKey; label: string; icon: React.ReactNode; group: string }[] = [
  { key: 'overview',          label: 'Overview',             icon: <LayoutDashboard size={16} />, group: 'MAIN' },
  { key: 'voter-verify',      label: 'Voter Verification',   icon: <ShieldCheck size={16} />,     group: 'OPERATIONS' },
  { key: 'enter-results',     label: 'Enter Results',        icon: <ClipboardList size={16} />,   group: 'OPERATIONS' },
  { key: 'submitted',         label: 'Submitted Results',    icon: <CheckCircle size={16} />,     group: 'OPERATIONS' },
  { key: 'results-approval',  label: 'Results Approval',     icon: <CheckCircle size={16} />,     group: 'OPERATIONS' },
  { key: 'ballot-scan',       label: 'Ballot Scanner',       icon: <ScanLine size={16} />,        group: 'OPERATIONS' },
  { key: 'ecz-figures',       label: 'ECZ Official Figures', icon: <BarChart2 size={16} />,       group: 'OPERATIONS' },
  { key: 'voter-turnout',     label: 'Voter Turnout',        icon: <MapPin size={16} />,          group: 'OPERATIONS' },
  { key: 'live-streams',      label: 'Live Streams',         icon: <Radio size={16} />,           group: 'MEDIA' },
  { key: 'personal-details',  label: 'Personal Details',     icon: <UserCircle size={16} />,      group: 'PROFILE' },
  { key: 'security',          label: 'Security Settings',    icon: <Lock size={16} />,            group: 'PROFILE' },
];

const SUBMITTED_MOCK = [
  { id: 'RES-001', pollingStation: 'Mapanza Primary School', ward: 'Mapanza Ward',       submittedAt: '2026-08-12 09:34', status: 'Verified', total: 342 },
  { id: 'RES-002', pollingStation: 'Choma Social Hall',      ward: 'Choma Central Ward', submittedAt: '2026-08-12 11:15', status: 'Pending',  total: 518 },
];

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs mb-1" style={{ color: 'rgba(255,255,255,0.35)', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.08em' }}>{label}</p>
      <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.9rem' }}>{value}</p>
    </div>
  );
}

export function ElectionAgentDashboard() {
  const navigate = useNavigate();
  const [active, setActive]   = useState<SectionKey>('overview');
  const [editing, setEditing] = useState(false);
  const [pwFields, setPwFields] = useState({ current: '', next: '', confirm: '' });

  const rawUser  = sessionStorage.getItem('boz_election_user');
  const user     = rawUser ? JSON.parse(rawUser) : null;
  const role     = user?.role ?? 'election_agent';
  const roleConf = ROLE_CONFIG[role] ?? ROLE_CONFIG['election_agent'];
  const allowed  = new Set(roleConf.sections);

  const [agent, setAgent] = useState({
    firstName: user?.firstName ?? 'Agent',
    lastName:  user?.lastName  ?? '',
    role:      roleConf.label,
    phone:     user?.phone     ?? '',
    email:     user?.email     ?? '',
    ward:      user?.scopeName ?? 'Not assigned',
    agentId:   user?.username  ?? 'EA-' + Math.random().toString(36).slice(2, 8).toUpperCase(),
  });

  function handleLogout() {
    clearToken();
    sessionStorage.removeItem('boz_election_user');
    navigate('/dashboard-login');
  }

  // Build nav groups filtered by role
  const groupMap: Record<string, typeof ALL_NAV> = {};
  for (const s of ALL_NAV) {
    if (!allowed.has(s.key)) continue;
    if (!groupMap[s.group]) groupMap[s.group] = [];
    groupMap[s.group].push(s);
  }
  const navGroups = Object.entries(groupMap).map(([group, items]) => ({ group, items }));

  const operationSections = ALL_NAV.filter(s =>
    allowed.has(s.key) && !['overview', 'personal-details', 'security'].includes(s.key)
  );

  function renderContent() {
    switch (active) {

      case 'overview':
        return (
          <div>
            <div className="mb-6">
              <h2 style={{ fontFamily: 'Oswald, sans-serif', fontSize: '1.4rem', letterSpacing: '0.04em', color: '#fff' }}>
                Welcome, {agent.firstName}
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.38)', fontSize: '0.82rem', marginTop: 4 }}>
                {roleConf.label} · {agent.ward} · 2026 Zambian General Election
              </p>
            </div>

            {/* Quick access grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
              {operationSections.map(s => (
                <button key={s.key} onClick={() => setActive(s.key)}
                  className="flex items-center gap-3 p-4 rounded-2xl text-left w-full transition-all"
                  style={{ backgroundColor: NAVY, border: '1px solid rgba(255,255,255,0.07)' }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.border = `1px solid ${roleConf.color}40`}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.border = '1px solid rgba(255,255,255,0.07)'}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: `${roleConf.color}20`, color: roleConf.color }}>
                    {s.icon}
                  </div>
                  <span style={{ color: '#fff', fontSize: '0.88rem', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.04em' }}>{s.label}</span>
                </button>
              ))}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Results Submitted', value: '2', color: '#10b981' },
                { label: 'Pending Verification', value: '1', color: '#f59e0b' },
                { label: 'Voters Verified', value: '47', color: roleConf.color },
              ].map(c => (
                <div key={c.label} className="p-4 rounded-2xl text-center"
                  style={{ backgroundColor: NAVY, border: `1px solid ${c.color}25` }}>
                  <p style={{ color: c.color, fontSize: '1.6rem', fontFamily: 'Oswald, sans-serif' }}>{c.value}</p>
                  <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.72rem', marginTop: 2 }}>{c.label}</p>
                </div>
              ))}
            </div>
          </div>
        );

      case 'voter-verify':
        return <Suspense fallback={<SectionLoader />}><VoterVerification pollingStationId={agent.ward} pollingStationName={agent.ward} agentName={agent.firstName} accentColor={roleConf.color} /></Suspense>;

      case 'enter-results':
        return <Suspense fallback={<SectionLoader />}><DataEntryPage /></Suspense>;

      case 'ballot-scan':
        return <Suspense fallback={<SectionLoader />}><AgentScannerMode stationId={agent.ward} stationName={agent.ward} agentName={agent.firstName} /></Suspense>;

      case 'results-approval':
        return <Suspense fallback={<SectionLoader />}><ResultsApprovalQueue /></Suspense>;

      case 'live-streams':
        return <Suspense fallback={<SectionLoader />}><LiveStreamViewer /></Suspense>;

      case 'submitted':
        return (
          <div>
            <div className="mb-6">
              <h2 style={{ fontFamily: 'Oswald, sans-serif', fontSize: '1.4rem', letterSpacing: '0.04em', color: '#fff' }}>Submitted Results</h2>
              <p style={{ color: 'rgba(255,255,255,0.38)', fontSize: '0.82rem', marginTop: 4 }}>All results you have submitted from your assigned polling stations</p>
            </div>
            <div className="space-y-3">
              {SUBMITTED_MOCK.map(r => (
                <div key={r.id} className="p-4 rounded-2xl flex items-center justify-between"
                  style={{ backgroundColor: NAVY, border: '1px solid rgba(255,255,255,0.07)' }}>
                  <div>
                    <p style={{ color: '#fff', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.04em', fontSize: '0.9rem' }}>{r.pollingStation}</p>
                    <p style={{ color: 'rgba(255,255,255,0.38)', fontSize: '0.76rem', marginTop: 2 }}>{r.ward} · {r.submittedAt} · {r.total} votes</p>
                  </div>
                  <span className="text-xs px-3 py-1 rounded-full shrink-0 ml-3"
                    style={{
                      background: r.status === 'Verified' ? '#10b98120' : '#f59e0b20',
                      color: r.status === 'Verified' ? '#10b981' : '#f59e0b',
                      border: `1px solid ${r.status === 'Verified' ? '#10b981' : '#f59e0b'}30`,
                      fontFamily: 'Oswald, sans-serif', letterSpacing: '0.06em',
                    }}>
                    {r.status}
                  </span>
                </div>
              ))}
              {SUBMITTED_MOCK.length === 0 && (
                <DashCard title="No Results Yet">
                  <div className="flex flex-col items-center py-10 gap-3">
                    <FileText size={32} style={{ color: 'rgba(255,255,255,0.2)' }} />
                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>No results submitted yet</p>
                    <button onClick={() => setActive('enter-results')}
                      className="px-4 py-2 rounded-xl text-sm mt-2"
                      style={{ background: RED, color: '#fff', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.06em' }}>
                      ENTER RESULTS
                    </button>
                  </div>
                </DashCard>
              )}
            </div>
          </div>
        );

      case 'ecz-figures':
        return (
          <div>
            <h2 className="mb-6" style={{ fontFamily: 'Oswald, sans-serif', fontSize: '1.4rem', color: '#fff' }}>ECZ Official Figures</h2>
            <DashCard title="Official Results">
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>ECZ official figures will appear here once published.</p>
            </DashCard>
          </div>
        );

      case 'voter-turnout':
        return (
          <div>
            <h2 className="mb-6" style={{ fontFamily: 'Oswald, sans-serif', fontSize: '1.4rem', color: '#fff' }}>Voter Turnout</h2>
            <DashCard title="Turnout Overview">
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>Voter turnout data for your area will appear here.</p>
            </DashCard>
          </div>
        );

      case 'personal-details':
        return (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 style={{ fontFamily: 'Oswald, sans-serif', fontSize: '1.4rem', letterSpacing: '0.04em', color: '#fff' }}>Personal Details</h2>
              <button onClick={() => setEditing(!editing)} className="px-4 py-2.5 rounded-xl text-sm"
                style={{ background: roleConf.color, color: '#fff', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.06em' }}>
                {editing ? 'SAVE' : 'EDIT'}
              </button>
            </div>
            <DashCard title="Agent Information">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {(Object.keys(agent) as (keyof typeof agent)[]).map(k => {
                  const labels: Record<keyof typeof agent, string> = {
                    firstName: 'FIRST NAME', lastName: 'LAST NAME', role: 'ROLE',
                    phone: 'PHONE', email: 'EMAIL', ward: 'WARD / AREA', agentId: 'AGENT ID',
                  };
                  return editing && !['role', 'agentId'].includes(k) ? (
                    <div key={k}>
                      <label className="block text-xs mb-1" style={{ color: 'rgba(255,255,255,0.35)', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.1em' }}>{labels[k]}</label>
                      <input className="w-full px-3 py-2.5 rounded-xl text-sm" value={agent[k]}
                        onChange={e => setAgent(p => ({ ...p, [k]: e.target.value }))}
                        style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: `1px solid ${roleConf.color}40`, color: '#fff', outline: 'none' }} />
                    </div>
                  ) : (
                    <Field key={k} label={labels[k]} value={agent[k]} />
                  );
                })}
              </div>
            </DashCard>
          </div>
        );

      case 'security':
        return (
          <div>
            <h2 className="mb-6" style={{ fontFamily: 'Oswald, sans-serif', fontSize: '1.4rem', letterSpacing: '0.04em', color: '#fff' }}>Security Settings</h2>
            <DashCard title="Change Password">
              <div className="max-w-md space-y-4">
                {['Current Password', 'New Password', 'Confirm New Password'].map((label, i) => {
                  const key = i === 0 ? 'current' : i === 1 ? 'next' : 'confirm';
                  return (
                    <div key={label}>
                      <label className="text-xs mb-1 block" style={{ color: 'rgba(255,255,255,0.35)', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.1em' }}>{label.toUpperCase()}</label>
                      <input type="password" className="w-full px-3 py-2.5 rounded-xl text-sm"
                        placeholder="••••••••"
                        value={pwFields[key as keyof typeof pwFields]}
                        onChange={e => setPwFields(p => ({ ...p, [key]: e.target.value }))}
                        style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', outline: 'none' }} />
                    </div>
                  );
                })}
                <button className="px-5 py-2.5 rounded-xl text-sm"
                  style={{ background: roleConf.color, color: '#fff', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.06em' }}>
                  UPDATE PASSWORD
                </button>
              </div>
            </DashCard>
          </div>
        );

      default:
        return null;
    }
  }

  return (
    <DashboardShell
      accentColor={roleConf.color}
      title="BOZ Election Portal"
      subtitle={roleConf.label}
      user={{ name: `${agent.firstName} ${agent.lastName}`.trim() || 'Agent', role: roleConf.label }}
      navGroups={navGroups}
      activeSection={active}
      onNavigate={k => setActive(k as SectionKey)}
    >
      {renderContent()}
    </DashboardShell>
  );
}
