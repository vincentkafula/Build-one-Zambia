import { useState, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router';
import {
  LayoutDashboard, ClipboardList, UserCircle, Lock, MapPin,
  Edit2, Save, CheckCircle, AlertCircle, ScanLine, PenLine, ShieldCheck
} from 'lucide-react';
import { DashboardShell, DashCard } from '../../components/DashboardShell';

const DataEntryPage    = lazy(() => import('../DataEntryPage').then(m => ({ default: m.DataEntryPage })));
const AgentScannerMode = lazy(() => import('../../components/AgentScannerMode').then(m => ({ default: m.AgentScannerMode })));
const VoterVerification = lazy(() => import('../../components/VoterVerification').then(m => ({ default: m.VoterVerification })));

function SectionLoader() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
    </div>
  );
}

const A = '#dc2626';
const NAVY = '#1e2d4a';

type SectionKey = 'overview' | 'enter-results' | 'submitted' | 'personal-details' | 'security' | 'voter-verify';

const NAV: { group: string; items: { key: SectionKey; label: string; icon: React.ReactNode }[] }[] = [
  {
    group: 'MAIN',
    items: [{ key: 'overview', label: 'Overview', icon: <LayoutDashboard size={16} /> }],
  },
  {
    group: 'RESULTS',
    items: [
      { key: 'voter-verify', label: 'Voter Verification', icon: <ShieldCheck size={16} /> },
      { key: 'enter-results', label: 'Enter Results', icon: <ClipboardList size={16} /> },
      { key: 'submitted', label: 'Submitted Results', icon: <CheckCircle size={16} /> },
    ],
  },
  {
    group: 'PROFILE',
    items: [
      { key: 'personal-details', label: 'Personal Details', icon: <UserCircle size={16} /> },
      { key: 'security', label: 'Security Settings', icon: <Lock size={16} /> },
    ],
  },
];

interface SubmittedResult {
  id: string;
  pollingStation: string;
  ward: string;
  submittedAt: string;
  status: 'Verified' | 'Pending' | 'Queried';
  totalVotesCast: number;
}

const SUBMITTED: SubmittedResult[] = [
  { id: 'RES-001', pollingStation: 'Mapanza Primary School', ward: 'Mapanza Ward', submittedAt: '2026-08-12 09:34', status: 'Verified', totalVotesCast: 342 },
  { id: 'RES-002', pollingStation: 'Choma Social Hall', ward: 'Choma Central Ward', submittedAt: '2026-08-12 11:15', status: 'Pending', totalVotesCast: 518 },
];

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = { Verified: '#10b981', Pending: '#f59e0b', Queried: '#ef4444' };
  const c = colors[status] || 'rgba(255,255,255,0.4)';
  return <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: `${c}18`, color: c, border: `1px solid ${c}30`, fontFamily: 'Oswald, sans-serif', letterSpacing: '0.06em' }}>{status}</span>;
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs mb-1" style={{ color: 'rgba(255,255,255,0.35)', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.08em' }}>{label}</p>
      <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.9rem' }}>{value}</p>
    </div>
  );
}

export default function ElectionAgentDashboard() {
  const [active, setActive] = useState<SectionKey>('overview');
  const [editing, setEditing] = useState(false);
  const [entryMode, setEntryMode] = useState<'manual' | 'scanner'>('manual');

  // Load logged-in agent from session (populated by DashboardLogin on real auth)
  const sessionUser = (() => {
    try { return JSON.parse(sessionStorage.getItem('boz_election_user') ?? 'null'); } catch { return null; }
  })();

  const nameParts = (sessionUser?.name ?? 'Joseph Mwanza').split(' ');
  const [agent, setAgent] = useState({
    firstName:          nameParts[0] ?? 'Joseph',
    lastName:           nameParts.slice(1).join(' ') || 'Mwanza',
    phone:              sessionUser?.phone ?? '+260 966 234 567',
    email:              sessionUser?.email ?? 'jmwanza@agent.boz.zm',
    nrc:                sessionUser?.username ?? 'NRC-123456/78/1',
    ward:               sessionUser?.scopeName ?? 'Mapanza Ward',
    constituency:       sessionUser?.constituencyId ?? 'Choma Central',
    province:           sessionUser?.provinceId ?? 'Southern Province',
    pollingStationId:   sessionUser?.pollingStationId ?? sessionUser?.scopeId ?? 'ps-mapanza-01',
    pollingStationName: sessionUser?.pollingStationName ?? sessionUser?.scopeName ?? 'Mapanza Ward Polling Station',
  });

  function navigate_(key: SectionKey) {
    setActive(key);
  }

  function renderSection() {
    switch (active) {
      case 'voter-verify':
        return (
          <Suspense fallback={<SectionLoader />}>
            <VoterVerification
              pollingStationId={agent.pollingStationId}
              pollingStationName={agent.pollingStationName}
              agentName={`${agent.firstName} ${agent.lastName}`}
              accentColor={A}
            />
          </Suspense>
        );

      case 'overview':
        return (
          <div>
            <h2 className="text-xl mb-2" style={{ color: NAVY }}>Election Agent Dashboard</h2>
            <p className="text-sm text-white/38 mb-6">2026 Zambian General Elections — Results Entry Portal</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {[
                { label: 'Assigned Ward', value: agent.ward, icon: <MapPin size={20} />, color: A },
                { label: 'Results Submitted', value: SUBMITTED.length, icon: <CheckCircle size={20} />, color: '#10b981' },
                { label: 'Constituency', value: agent.constituency, icon: <ClipboardList size={20} />, color: NAVY },
              ].map(s => (
                <div key={s.label} className="rounded-xl p-4 flex items-center gap-3" style={{backgroundColor: "#0f1f33", border: "1px solid rgba(255,255,255,0.07)"}}>
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white" style={{ background: s.color }}>{s.icon}</div>
                  <div>
                    <p className="text-xs text-white/40">{s.label}</p>
                    <p className="text-sm" style={{ color: NAVY }}>{s.value}</p>
                  </div>
                </div>
              ))}
            </div>
            <DashCard title="Instructions for Election Agents">
              <ul className="space-y-2">
                {[
                  'Enter results from each polling station separately.',
                  'Double-check all figures against the official GEN-12 form before submitting.',
                  'Once submitted, results are locked pending ECZ verification.',
                  'Contact your constituency supervisor if you encounter discrepancies.',
                  'Ensure total votes cast does not exceed registered voters.',
                ].map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-white/55">
                    <AlertCircle size={14} className="mt-0.5 shrink-0" style={{ color: A }} />
                    {tip}
                  </li>
                ))}
              </ul>
            </DashCard>
          </div>
        );

      case 'enter-results':
        return (
          <div>
            {/* Header — Polling Station Data Entry Level */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-1">
                <ClipboardList size={18} style={{ color: A }} />
                <h2 className="text-lg font-bold" style={{ fontFamily: 'Oswald, sans-serif', letterSpacing: '0.06em', color: '#fff' }}>
                  POLLING STATION DATA ENTRY
                </h2>
              </div>
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>
                {agent.pollingStationName} · {agent.ward}
              </p>
            </div>

            {/* Mode Selection Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              {/* Data Entry */}
              <button
                onClick={() => setEntryMode('manual')}
                className="text-left rounded-2xl p-5 transition-all border-2"
                style={{
                  backgroundColor: entryMode === 'manual' ? 'rgba(30,45,74,0.9)' : '#0f1f33',
                  borderColor: entryMode === 'manual' ? NAVY : 'rgba(255,255,255,0.07)',
                  boxShadow: entryMode === 'manual' ? `0 0 0 1px ${NAVY}` : 'none',
                }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: entryMode === 'manual' ? NAVY : 'rgba(255,255,255,0.06)' }}>
                    <PenLine size={18} color="#fff" />
                  </div>
                  <div>
                    <p className="font-bold text-white" style={{ fontFamily: 'Oswald, sans-serif', letterSpacing: '0.04em' }}>DATA ENTRY</p>
                    <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>Manual votes entry</p>
                  </div>
                  {entryMode === 'manual' && (
                    <div className="ml-auto w-5 h-5 rounded-full flex items-center justify-center" style={{ background: NAVY }}>
                      <CheckCircle size={12} color="#fff" />
                    </div>
                  )}
                </div>
                <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  The election agent manually enters the number of votes received by each candidate at this polling station, then uploads the official signed results sheet.
                </p>
              </button>

              {/* Ballot Scanner */}
              <button
                onClick={() => setEntryMode('scanner')}
                className="text-left rounded-2xl p-5 transition-all border-2"
                style={{
                  backgroundColor: entryMode === 'scanner' ? `${A}18` : '#0f1f33',
                  borderColor: entryMode === 'scanner' ? A : 'rgba(255,255,255,0.07)',
                  boxShadow: entryMode === 'scanner' ? `0 0 0 1px ${A}` : 'none',
                }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: entryMode === 'scanner' ? A : 'rgba(255,255,255,0.06)' }}>
                    <ScanLine size={18} color="#fff" />
                  </div>
                  <div>
                    <p className="font-bold text-white" style={{ fontFamily: 'Oswald, sans-serif', letterSpacing: '0.04em' }}>BALLOT SCANNER</p>
                    <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>DS300 automatic tabulation</p>
                  </div>
                  {entryMode === 'scanner' && (
                    <div className="ml-auto w-5 h-5 rounded-full flex items-center justify-center" style={{ background: A }}>
                      <CheckCircle size={12} color="#fff" />
                    </div>
                  )}
                </div>
                <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  The DS300 ballot scanner reads and tabulates results automatically. Connect the scanner, load the ballots, and the machine captures each vote electronically.
                </p>
              </button>
            </div>

            {/* Divider with selected mode label */}
            <div className="flex items-center gap-3 mb-5">
              <div className="flex-1 h-px" style={{ backgroundColor: 'rgba(255,255,255,0.07)' }} />
              <span className="text-xs px-3 py-1 rounded-full" style={{ fontFamily: 'Oswald, sans-serif', letterSpacing: '0.1em', backgroundColor: entryMode === 'manual' ? NAVY : A, color: '#fff' }}>
                {entryMode === 'manual' ? '✏ VOTES ENTRY — DATA ENTRY MODE' : '⬛ VOTES ENTRY — BALLOT SCANNER MODE'}
              </span>
              <div className="flex-1 h-px" style={{ backgroundColor: 'rgba(255,255,255,0.07)' }} />
            </div>

            {entryMode === 'manual' ? (
              <Suspense fallback={<SectionLoader />}>
                <DataEntryPage />
              </Suspense>
            ) : (
              <Suspense fallback={<SectionLoader />}>
                <AgentScannerMode
                  stationId={agent.pollingStationId}
                  stationName={agent.pollingStationName}
                  agentName={`${agent.firstName} ${agent.lastName}`}
                  defaultElectionType="parliamentary"
                />
              </Suspense>
            )}
          </div>
        );

      case 'submitted':
        return (
          <div>
            <h2 className="text-xl mb-6" style={{ color: NAVY }}>Submitted Results</h2>
            {SUBMITTED.length === 0 ? (
              <div className="text-center py-12 text-white/40 text-sm">No results submitted yet.</div>
            ) : (
              <div className="space-y-4">
                {SUBMITTED.map(r => (
                  <div key={r.id} className="rounded-2xl p-5" style={{backgroundColor: "#0f1f33", border: "1px solid rgba(255,255,255,0.07)"}}>
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="text-white">{r.pollingStation}</p>
                        <p className="text-xs text-white/40">{r.ward} · Submitted {r.submittedAt}</p>
                      </div>
                      <StatusBadge status={r.status} />
                    </div>
                    <p className="text-sm text-white/55">Total Votes Cast: <strong>{r.totalVotesCast.toLocaleString()}</strong></p>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 'personal-details':
        return (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl" style={{ color: NAVY }}>Personal Details</h2>
              <button onClick={() => setEditing(!editing)} className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm" style={{ background: A }}>
                {editing ? <><Save size={14} /> Save</> : <><Edit2 size={14} /> Edit</>}
              </button>
            </div>
            <DashCard title="Agent Information">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(Object.keys(agent) as (keyof typeof agent)[]).map(k => {
                  const labels: Record<keyof typeof agent, string> = {
                    firstName: 'First Name', lastName: 'Last Name', phone: 'Phone',
                    email: 'Email', nrc: 'NRC / ID Number', ward: 'Ward', constituency: 'Constituency', province: 'Province',
                  };
                  return editing ? (
                    <div key={k}>
                      <label className="text-xs text-white/40 mb-1 block">{labels[k]}</label>
                      <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none" value={agent[k]} onChange={e => setAgent(p => ({ ...p, [k]: e.target.value }))} />
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
            <h2 className="text-xl mb-6" style={{ color: NAVY }}>Security Settings</h2>
            <DashCard title="Change Password">
              <div className="max-w-md space-y-4">
                {['Current Password', 'New Password', 'Confirm New Password'].map(label => (
                  <div key={label}>
                    <label className="text-xs text-white/40 mb-1 block">{label}</label>
                    <input type="password" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none" placeholder="••••••••" />
                  </div>
                ))}
                <button className="px-5 py-2 rounded-lg text-white text-sm" style={{ background: A }}>Update Password</button>
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
      accentColor={A}
      title="Election Agent"
      subtitle="BOZ RESULTS PORTAL"
      user={{ name: `${agent.firstName} ${agent.lastName}`, role: `${agent.ward} · ${agent.constituency}` }}
      navGroups={NAV}
      activeSection={active}
      onNavigate={(key) => navigate_(key as SectionKey)}
    >
      {renderSection()}
    </DashboardShell>
  );
}
