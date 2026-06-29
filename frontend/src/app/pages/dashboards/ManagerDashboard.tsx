import { useState, useMemo, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router';
import {
  LayoutDashboard, BarChart2, MapPin, UserCircle, Lock, ShieldCheck,
  Edit2, Save, TrendingUp, Users, CheckCircle, Clock, ExternalLink, Radio, FileText, Activity, Scale, ShoppingBag, Newspaper, Crown, Building2, Mail, Award, Vote, ScanLine, Server, Shield, Calendar, User, Upload
} from 'lucide-react';
import { DashboardShell, DashCard, StatCard } from '../../components/DashboardShell';
import { SuperAdminGate } from '../../components/SuperAdminGate';
import { provinces } from '../../data/mockData';

// Lazy-load all heavy components to avoid circular dependency at build time
const ECZEntryPage            = lazy(() => import('../ECZEntryPage').then(m => ({ default: m.ECZEntryPage })));
const LiveStreamAdmin         = lazy(() => import('../../components/LiveStreamAdmin').then(m => ({ default: m.LiveStreamAdmin })));
const DocumentLibraryAdmin    = lazy(() => import('../../components/DocumentLibraryAdmin').then(m => ({ default: m.DocumentLibraryAdmin })));
const LiveResultsPanel        = lazy(() => import('../../components/LiveResultsPanel').then(m => ({ default: m.LiveResultsPanel })));
const CandidateManager        = lazy(() => import('../../components/CandidateManager').then(m => ({ default: m.CandidateManager })));
const ECZComparisonDashboard  = lazy(() => import('../../components/ECZComparisonDashboard').then(m => ({ default: m.ECZComparisonDashboard })));
const ShopManager             = lazy(() => import('../../components/ShopManager').then(m => ({ default: m.ShopManager })));
const NewsManager             = lazy(() => import('../../components/NewsManager').then(m => ({ default: m.NewsManager })));
const LeadershipManager       = lazy(() => import('../../components/LeadershipManager').then(m => ({ default: m.LeadershipManager })));
const MembershipAdmin         = lazy(() => import('../../components/MembershipAdmin').then(m => ({ default: m.MembershipAdmin })));
const ChamberAmendmentsAdmin  = lazy(() => import('../../components/ChamberAmendmentsAdmin').then(m => ({ default: m.ChamberAmendmentsAdmin })));
const RegistrationApprovalAdmin = lazy(() => import('../../components/RegistrationApprovalAdmin').then(m => ({ default: m.RegistrationApprovalAdmin })));
const SecurityDashboard       = lazy(() => import('../../components/SecurityDashboard').then(m => ({ default: m.SecurityDashboard })));
const PressStatementsAdmin    = lazy(() => import('../../components/PressStatementsAdmin').then(m => ({ default: m.PressStatementsAdmin })));
const EmailAdmin              = lazy(() => import('../../components/EmailAdmin').then(m => ({ default: m.EmailAdmin })));
const AdoptionCertAdmin       = lazy(() => import('../../components/AdoptionCertAdmin').then(m => ({ default: m.AdoptionCertAdmin })));
const BallotScanSystem        = lazy(() => import('../../components/BallotScanSystem').then(m => ({ default: m.BallotScanSystem })));
const VoterVerification       = lazy(() => import('../../components/VoterVerification').then(m => ({ default: m.VoterVerification })));
const ResultsApprovalQueue    = lazy(() => import('../../components/ResultsApprovalQueue').then(m => ({ default: m.ResultsApprovalQueue })));
const SystemSetupDashboard    = lazy(() => import('../../components/SystemSetupDashboard').then(m => ({ default: m.SystemSetupDashboard })));
const VoterRollUpload         = lazy(() => import('../../components/VoterRollUpload').then(m => ({ default: m.VoterRollUpload })));
const ElectionUserManager     = lazy(() => import('../../components/ElectionUserManager').then(m => ({ default: m.ElectionUserManager })));
const NoticeBoard             = lazy(() => import('../../components/NoticeBoard').then(m => ({ default: m.NoticeBoard })));
const EventsManager           = lazy(() => import('../../components/EventsManager').then(m => ({ default: m.EventsManager })));

function SectionLoader() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
    </div>
  );
}

const A = '#0ea5e9';
const NAVY = '#1e2d4a';

type SectionKey = 'overview' | 'notice-board' | 'system-setup' | 'election-users' |
  'ecz-figures' | 'results-by-province' | 'admin' | 'candidates' | 'ecz-comparison' |
  'results-approval' | 'live-results' | 'voter-verify' | 'voter-roll-upload' |
  'voter-turnout' | 'ballot-scan' | 'registrations' | 'security-centre' |
  'events' | 'shop' | 'news' | 'leadership' | 'membership-admin' | 'adoption-certs' |
  'press-statements' | 'email' | 'chamber-amendments' | 'live-streams' | 'documents' |
  'personal-details' | 'security';

const NAV: { group: string; items: { key: SectionKey; label: string; icon: React.ReactNode }[] }[] = [
  {
    group: 'MAIN',
    items: [
      { key: 'overview',       label: 'Overview',       icon: <LayoutDashboard size={16} /> },
      { key: 'notice-board',   label: 'Notice Board',   icon: <Activity size={16} /> },
      { key: 'system-setup',   label: 'System Setup',   icon: <Server size={16} /> },
      { key: 'election-users', label: 'Election Users', icon: <Users size={16} /> },
    ],
  },
  {
    group: 'ELECTION OPERATIONS',
    items: [
      { key: 'ecz-figures',       label: 'ECZ Official Figures',    icon: <BarChart2 size={16} /> },
      { key: 'results-by-province', label: 'Results by Province',   icon: <MapPin size={16} /> },
      { key: 'admin',             label: 'Admin Panel',             icon: <ShieldCheck size={16} /> },
      { key: 'candidates',        label: 'Candidates',              icon: <Users size={16} /> },
      { key: 'ecz-comparison',    label: 'Agent vs ECZ',            icon: <Scale size={16} /> },
      { key: 'results-approval',  label: 'Results Approval Queue',  icon: <CheckCircle size={16} /> },
      { key: 'live-results',      label: 'Live Results Engine',     icon: <Activity size={16} /> },
      { key: 'voter-verify',      label: 'Voter Verification',      icon: <ShieldCheck size={16} /> },
      { key: 'voter-roll-upload', label: 'Voter Roll Upload',       icon: <FileText size={16} /> },
      { key: 'voter-turnout',     label: 'Voter Turnout',           icon: <Vote size={16} /> },
      { key: 'ballot-scan',       label: 'Ballot Scanner (DS300)',  icon: <ScanLine size={16} /> },
      { key: 'registrations',     label: 'Registration Approvals',  icon: <CheckCircle size={16} /> },
      { key: 'security-centre',   label: 'Security Centre',         icon: <ShieldCheck size={16} /> },
    ],
  },
  {
    group: 'WEBSITE CONTENT',
    items: [
      { key: 'events',           label: 'Events Manager',        icon: <Calendar size={16} /> },
      { key: 'news',             label: 'News & Posts',          icon: <Newspaper size={16} /> },
      { key: 'shop',             label: 'Shop Manager',          icon: <ShoppingBag size={16} /> },
      { key: 'leadership',       label: 'Leadership',            icon: <Crown size={16} /> },
      { key: 'press-statements', label: 'Press Statements',      icon: <Newspaper size={16} /> },
      { key: 'documents',        label: 'Document Library',      icon: <FileText size={16} /> },
      { key: 'live-streams',     label: 'Live Streams',          icon: <Radio size={16} /> },
      { key: 'membership-admin', label: 'Membership',            icon: <Users size={16} /> },
      { key: 'adoption-certs',   label: 'Adoption Certificates', icon: <Award size={16} /> },
      { key: 'email',            label: 'Email / Resend',        icon: <Mail size={16} /> },
      { key: 'chamber-amendments', label: 'Chamber Amendments',  icon: <Building2 size={16} /> },
    ],
  },
  {
    group: 'PROFILE',
    items: [
      { key: 'personal-details', label: 'Personal Details',  icon: <UserCircle size={16} /> },
      { key: 'security',         label: 'Security Settings', icon: <Lock size={16} /> },
    ],
  },
];

const PROVINCES_TURNOUT = [
  { name: 'Central',        registered: 820079 },
  { name: 'Copperbelt',     registered: 1296446 },
  { name: 'Eastern',        registered: 1129444 },
  { name: 'Luapula',        registered: 694681 },
  { name: 'Lusaka',         registered: 1430889 },
  { name: 'Muchinga',       registered: 435536 },
  { name: 'Northern',       registered: 722403 },
  { name: 'North-Western',  registered: 524195 },
  { name: 'Southern',       registered: 1103275 },
  { name: 'Western',        registered: 629352 },
];

function turnoutColor(pct: number) {
  if (pct >= 70) return '#10b981';
  if (pct >= 50) return '#f59e0b';
  return '#ef4444';
}

function turnoutLabel(pct: number) {
  if (pct >= 70) return 'High';
  if (pct >= 50) return 'Moderate';
  if (pct > 0)   return 'Low';
  return 'No Data';
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = { Final: '#10b981', Partial: '#f59e0b', Counting: A };
  const c = colors[status] || 'rgba(255,255,255,0.4)';
  return (
    <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: `${c}18`, color: c, border: `1px solid ${c}30`, fontFamily: 'Oswald, sans-serif', letterSpacing: '0.06em' }}>
      {status}
    </span>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs mb-1" style={{ color: 'rgba(255,255,255,0.35)', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.08em' }}>{label}</p>
      <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.9rem' }}>{value}</p>
    </div>
  );
}

function VoterTurnoutSection() {
  const [votesCast, setVotesCast] = useState<Record<string, number>>(
    Object.fromEntries(PROVINCES_TURNOUT.map(p => [p.name, 0]))
  );
  const [editMode, setEditMode] = useState(false);

  const totalRegistered = PROVINCES_TURNOUT.reduce((s, p) => s + p.registered, 0);
  const totalVotes = Object.values(votesCast).reduce((s, v) => s + v, 0);
  const overallPct = totalRegistered > 0 ? (totalVotes / totalRegistered) * 100 : 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 style={{ fontFamily: 'Oswald, sans-serif', fontSize: '1.4rem', letterSpacing: '0.04em', color: '#fff' }}>Voter Turnout by Provinces</h2>
          <p style={{ color: 'rgba(255,255,255,0.38)', fontSize: '0.8rem', marginTop: 3 }}>2026 Zambian General Elections — Admin only · ECZ Electoral Register</p>
        </div>
        <button
          onClick={() => setEditMode(v => !v)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm"
          style={{ background: editMode ? '#10b981' : '#0ea5e9', color: '#fff', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.05em' }}
        >
          {editMode ? <><Save size={13} /> SAVE</> : <><Edit2 size={13} /> EDIT VOTES</>}
        </button>
      </div>
      <div className="grid grid-cols-3 gap-4 mb-6 mt-4">
        {[
          { label: 'Total Registered', value: totalRegistered.toLocaleString(), color: '#0ea5e9' },
          { label: 'Total Votes Cast', value: totalVotes.toLocaleString(), color: '#10b981' },
          { label: 'National Turnout', value: `${overallPct.toFixed(1)}%`, color: turnoutColor(overallPct) },
        ].map(s => (
          <div key={s.label} className="rounded-2xl p-4" style={{ backgroundColor: '#0f1f33', border: '1px solid rgba(255,255,255,0.07)' }}>
            <p style={{ color: 'rgba(255,255,255,0.38)', fontSize: '0.72rem', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.1em' }}>{s.label}</p>
            <p style={{ color: s.color, fontFamily: 'Oswald, sans-serif', fontSize: '1.4rem', letterSpacing: '0.04em', marginTop: 4 }}>{s.value}</p>
          </div>
        ))}
      </div>
      <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: '#0f1f33', border: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="grid grid-cols-12 px-5 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          {['Province', 'Votes Cast / Registered', 'Turnout %', 'Status'].map(h => (
            <p key={h} className="text-xs col-span-3" style={{ color: 'rgba(255,255,255,0.3)', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.1em' }}>{h}</p>
          ))}
        </div>
        {PROVINCES_TURNOUT.map((p, idx) => {
          const cast = votesCast[p.name] ?? 0;
          const pct = p.registered > 0 ? (cast / p.registered) * 100 : 0;
          const color = turnoutColor(pct);
          const isLast = idx === PROVINCES_TURNOUT.length - 1;
          return (
            <div key={p.name} className="grid grid-cols-12 items-center px-5 py-4" style={{ borderBottom: isLast ? 'none' : '1px solid rgba(255,255,255,0.04)' }}>
              <div className="col-span-3">
                <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.88rem' }}>{p.name}</p>
              </div>
              <div className="col-span-3 pr-4">
                {editMode ? (
                  <input
                    type="number" min={0} max={p.registered} value={cast}
                    onChange={e => setVotesCast(prev => ({ ...prev, [p.name]: Math.min(p.registered, Math.max(0, Number(e.target.value))) }))}
                    className="w-full px-3 py-1.5 rounded-lg text-sm"
                    style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', outline: 'none' }}
                  />
                ) : (
                  <div>
                    <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.75rem' }}>{cast.toLocaleString()} / {p.registered.toLocaleString()}</p>
                    <div className="h-1.5 rounded-full overflow-hidden mt-1.5" style={{ backgroundColor: 'rgba(255,255,255,0.07)' }}>
                      <div className="h-1.5 rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: color, boxShadow: `0 0 6px ${color}60` }} />
                    </div>
                  </div>
                )}
              </div>
              <div className="col-span-3">
                <p style={{ color, fontFamily: 'Oswald, sans-serif', fontSize: '1.1rem', letterSpacing: '0.04em' }}>{pct.toFixed(1)}%</p>
              </div>
              <div className="col-span-3">
                <span className="text-xs px-2.5 py-0.5 rounded-full" style={{ backgroundColor: `${color}18`, color, border: `1px solid ${color}30`, fontFamily: 'Oswald, sans-serif', letterSpacing: '0.06em' }}>
                  {turnoutLabel(pct)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const ROLE_LABELS: Record<string, string> = {
  super_admin:          'Super National Manager',
  national_manager:     'National Manager',
  provincial_manager:   'Provincial Manager',
  district_manager:     'District Manager',
  constituency_manager: 'Constituency Manager',
  ward_manager:         'Ward Manager',
  admin:                'System Administrator',
};

const ROLE_COLORS: Record<string, string> = {
  super_admin:          '#7c3aed',
  national_manager:     '#0ea5e9',
  provincial_manager:   '#0891b2',
  district_manager:     '#059669',
  constituency_manager: '#16a34a',
  ward_manager:         '#65a30d',
  admin:                '#6b7280',
};

function computeProvinceStats() {
  return provinces.map(prov => {
    let regVoters = 0, psCount = 0, wardCount = 0, consCount = 0;
    prov.districts.forEach(d => {
      d.constituencies.forEach(c => {
        consCount++;
        c.wards.forEach(w => {
          wardCount++;
          w.pollingStations.forEach(ps => { psCount++; regVoters += ps.registeredVoters; });
        });
      });
    });
    return { id: prov.id, name: prov.name, districts: prov.districts.length, constituencies: consCount, wards: wardCount, pollingStations: psCount, registeredVoters: regVoters };
  });
}

export default function ManagerDashboard() {
  const navigate = useNavigate();
  const [active, setActive] = useState<SectionKey>('overview');
  const [editing, setEditing] = useState(false);

  const electionUser = (() => {
    try { return JSON.parse(sessionStorage.getItem('boz_election_user') ?? 'null'); } catch { return null; }
  })();

  const [manager, setManager] = useState({
    firstName: electionUser?.name?.split(' ')[0] ?? 'Dr. Grace',
    lastName: electionUser?.name?.split(' ').slice(1).join(' ') ?? 'Mulenga',
    role: ROLE_LABELS[electionUser?.role] ?? 'National Management',
    phone: electionUser?.phone ?? '+260 977 500 600',
    email: electionUser?.email ?? 'g.mulenga@manager.boz.zm',
    province: electionUser?.scopeName ?? 'National',
    clearanceLevel: ROLE_LABELS[electionUser?.role] ?? 'National',
    staffId: electionUser?.username ?? 'MGR-2026-001',
  });

  const provinceStats = useMemo(() => computeProvinceStats(), []);
  const totalRegistered = provinceStats.reduce((s, p) => s + p.registeredVoters, 0);
  const totalPS         = provinceStats.reduce((s, p) => s + p.pollingStations, 0);
  const totalWards      = provinceStats.reduce((s, p) => s + p.wards, 0);
  const totalConst      = provinceStats.reduce((s, p) => s + p.constituencies, 0);
  const totalDistricts  = provinceStats.reduce((s, p) => s + p.districts, 0);

  function renderSection() {
    switch (active) {
      case 'overview':
        return (
          <div>
            {electionUser && (
              <div className="mb-5 rounded-xl border px-4 py-3 flex items-center gap-3 flex-wrap"
                style={{ borderColor: `${ROLE_COLORS[electionUser.role] ?? '#6b7280'}40`, backgroundColor: `${ROLE_COLORS[electionUser.role] ?? '#6b7280'}10` }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${ROLE_COLORS[electionUser.role] ?? '#6b7280'}20` }}>
                  <Shield size={16} style={{ color: ROLE_COLORS[electionUser.role] ?? '#6b7280' }} />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{ROLE_LABELS[electionUser.role] ?? electionUser.role}</p>
                  <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
                    {electionUser.name} · Scope: {electionUser.scopeName ?? 'National'} · @{electionUser.username}
                  </p>
                </div>
                <div className="ml-auto flex gap-2 flex-wrap">
                  {['results-approval', 'notice-board'].map(key => (
                    <button key={key} onClick={() => setActive(key as SectionKey)}
                      className="text-xs px-3 py-1.5 rounded-lg font-medium"
                      style={{ backgroundColor: `${ROLE_COLORS[electionUser.role] ?? '#6b7280'}30`, color: ROLE_COLORS[electionUser.role] ?? '#6b7280' }}>
                      {key === 'results-approval' ? 'Approval Queue' : 'Notice Board'}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div className="mb-6">
              <h2 style={{ fontFamily: 'Oswald, sans-serif', fontSize: '1.4rem', letterSpacing: '0.04em', color: '#fff' }}>Manager Dashboard</h2>
              <p style={{ color: 'rgba(255,255,255,0.38)', fontSize: '0.82rem', marginTop: 4 }}>2026 Zambian General Elections — National Electoral Register (ECZ Official)</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              <StatCard label="Registered Voters" value={totalRegistered.toLocaleString()} sub="ECZ Electoral Register 2026" accentColor={A} icon={<Users size={16} />} />
              <StatCard label="Polling Stations" value={totalPS.toLocaleString()} sub="Across all 10 provinces" accentColor={A} />
              <StatCard label="Wards" value={totalWards.toLocaleString()} accentColor={A} />
              <StatCard label="Constituencies" value={totalConst.toLocaleString()} accentColor={A} />
              <StatCard label="Districts" value={totalDistricts.toLocaleString()} accentColor={A} />
              <StatCard label="Provinces" value="10" accentColor={A} />
            </div>
            <DashCard title="Province — Registered Voters">
              <div className="space-y-3">
                {provinceStats.map(p => (
                  <div key={p.id} className="flex items-center gap-3 py-1">
                    <p className="w-36 shrink-0" style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.82rem' }}>{p.name}</p>
                    <div className="flex-1 rounded-full h-1.5 overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.07)' }}>
                      <div className="h-1.5 rounded-full" style={{ width: `${(p.registeredVoters / totalRegistered) * 100}%`, background: A, boxShadow: `0 0 6px ${A}60` }} />
                    </div>
                    <p className="w-24 text-right shrink-0" style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.75rem' }}>{p.registeredVoters.toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </DashCard>
          </div>
        );

      case 'ecz-figures':        return <Suspense fallback={<SectionLoader />}><ECZEntryPage /></Suspense>;
      case 'candidates':         return <Suspense fallback={<SectionLoader />}><CandidateManager /></Suspense>;
      case 'ecz-comparison':     return <Suspense fallback={<SectionLoader />}><ECZComparisonDashboard /></Suspense>;
      case 'results-approval':   return <Suspense fallback={<SectionLoader />}><ResultsApprovalQueue /></Suspense>;
      case 'system-setup':       return <Suspense fallback={<SectionLoader />}><SystemSetupDashboard /></Suspense>;
      case 'voter-roll-upload':  return <Suspense fallback={<SectionLoader />}><VoterRollUpload /></Suspense>;
      case 'election-users':     return <Suspense fallback={<SectionLoader />}><ElectionUserManager /></Suspense>;
      case 'notice-board':       return <Suspense fallback={<SectionLoader />}><NoticeBoard /></Suspense>;
      case 'shop':               return <Suspense fallback={<SectionLoader />}><ShopManager /></Suspense>;
      case 'news':               return <Suspense fallback={<SectionLoader />}><NewsManager /></Suspense>;
      case 'leadership':         return <Suspense fallback={<SectionLoader />}><LeadershipManager /></Suspense>;
      case 'membership-admin':   return <Suspense fallback={<SectionLoader />}><MembershipAdmin /></Suspense>;
      case 'registrations':      return <Suspense fallback={<SectionLoader />}><RegistrationApprovalAdmin /></Suspense>;
      case 'press-statements':   return <Suspense fallback={<SectionLoader />}><PressStatementsAdmin /></Suspense>;
      case 'email':              return <Suspense fallback={<SectionLoader />}><EmailAdmin /></Suspense>;
      case 'adoption-certs':     return <Suspense fallback={<SectionLoader />}><AdoptionCertAdmin /></Suspense>;
      case 'ballot-scan':        return <Suspense fallback={<SectionLoader />}><BallotScanSystem /></Suspense>;
      case 'chamber-amendments': return <Suspense fallback={<SectionLoader />}><ChamberAmendmentsAdmin /></Suspense>;
      case 'security-centre':    return <Suspense fallback={<SectionLoader />}><SecurityDashboard /></Suspense>;
      case 'live-streams':       return <Suspense fallback={<SectionLoader />}><LiveStreamAdmin /></Suspense>;
      case 'documents':          return <Suspense fallback={<SectionLoader />}><DocumentLibraryAdmin /></Suspense>;
      case 'events':             return <Suspense fallback={<SectionLoader />}><EventsManager /></Suspense>;

      case 'voter-verify':
        return (
          <Suspense fallback={<SectionLoader />}>
            <VoterVerification
              pollingStationId="ps-mapanza-01"
              pollingStationName="National Oversight — All Stations"
              agentName={`${manager.firstName} ${manager.lastName}`}
              accentColor={A}
            />
          </Suspense>
        );

      case 'voter-turnout':
        return <VoterTurnoutSection />;

      case 'live-results':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold" style={{ color: 'rgba(255,255,255,0.9)' }}>Live Results Engine</h2>
              <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>Auto-calculated aggregations from all polling station submissions. Refreshes every 30 seconds.</p>
            </div>
            <div className="grid grid-cols-1 gap-8">
              {(['presidential', 'parliament', 'mayoral', 'councillor'] as const).map(et => (
                <div key={et} className="rounded-2xl p-6" style={{ backgroundColor: '#0f1f33', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <h3 className="text-base font-semibold capitalize mb-4 pb-3" style={{ color: 'rgba(255,255,255,0.7)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                    {et === 'parliament' ? 'Parliamentary' : et.charAt(0).toUpperCase() + et.slice(1)} Election
                  </h3>
                  <Suspense fallback={<SectionLoader />}>
                    <LiveResultsPanel electionType={et} autoRefreshSeconds={30} showLeaderboard showCoverage showTrend={false} showFeed={et === 'presidential'} compact />
                  </Suspense>
                </div>
              ))}
            </div>
          </div>
        );

      case 'results-by-province':
        return (
          <div>
            <div className="mb-6">
              <h2 style={{ fontFamily: 'Oswald, sans-serif', fontSize: '1.4rem', letterSpacing: '0.04em', color: '#fff' }}>Electoral Register by Province</h2>
              <p style={{ color: 'rgba(255,255,255,0.38)', fontSize: '0.82rem', marginTop: 4 }}>Source: ECZ — 2026 General Elections official register</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm rounded-2xl overflow-hidden" style={{ backgroundColor: '#0f1f33', border: '1px solid rgba(255,255,255,0.07)' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                    {['Province', 'Districts', 'Constituencies', 'Wards', 'Polling Stations', 'Registered Voters'].map(h => (
                      <th key={h} className="text-left px-4 py-3" style={{ color: 'rgba(255,255,255,0.35)', fontFamily: 'Oswald, sans-serif', fontSize: '0.7rem', letterSpacing: '0.1em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {provinceStats.map(p => (
                    <tr key={p.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <td className="px-4 py-3" style={{ color: 'rgba(255,255,255,0.85)' }}>{p.name} Province</td>
                      <td className="px-4 py-3" style={{ color: 'rgba(255,255,255,0.5)' }}>{p.districts}</td>
                      <td className="px-4 py-3" style={{ color: 'rgba(255,255,255,0.5)' }}>{p.constituencies}</td>
                      <td className="px-4 py-3" style={{ color: 'rgba(255,255,255,0.5)' }}>{p.wards.toLocaleString()}</td>
                      <td className="px-4 py-3" style={{ color: 'rgba(255,255,255,0.5)' }}>{p.pollingStations.toLocaleString()}</td>
                      <td className="px-4 py-3" style={{ color: A, fontFamily: 'Oswald, sans-serif' }}>{p.registeredVoters.toLocaleString()}</td>
                    </tr>
                  ))}
                  <tr style={{ borderTop: `1px solid ${A}30`, backgroundColor: `${A}08` }}>
                    <td className="px-4 py-3" style={{ color: '#fff', fontFamily: 'Oswald, sans-serif', fontSize: '0.8rem', letterSpacing: '0.06em' }}>TOTAL</td>
                    <td className="px-4 py-3" style={{ color: '#fff' }}>{totalDistricts}</td>
                    <td className="px-4 py-3" style={{ color: '#fff' }}>{totalConst}</td>
                    <td className="px-4 py-3" style={{ color: '#fff' }}>{totalWards.toLocaleString()}</td>
                    <td className="px-4 py-3" style={{ color: '#fff' }}>{totalPS.toLocaleString()}</td>
                    <td className="px-4 py-3" style={{ color: A, fontFamily: 'Oswald, sans-serif' }}>{totalRegistered.toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'admin':
        return (
          <SuperAdminGate>
            <div>
              <div className="mb-6">
                <h2 style={{ fontFamily: 'Oswald, sans-serif', fontSize: '1.4rem', letterSpacing: '0.04em', color: '#fff' }}>Admin Panel — Management Hub</h2>
                <p style={{ color: 'rgba(255,255,255,0.38)', fontSize: '0.82rem', marginTop: 4 }}>Manage all content, users, candidates, and system settings</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {[
                  { key: 'system-setup',      label: 'System Setup',         desc: 'Configure backend, check service health.',                          icon: <Server size={18} />,      color: '#6366f1' },
                  { key: 'election-users',    label: 'Election Users',        desc: 'Create & manage all 7 tiers of election staff.',                    icon: <Users size={18} />,       color: '#0ea5e9' },
                  { key: 'candidates',        label: 'Candidates',            desc: 'Add, edit & remove presidential, MP, mayoral & councillor candidates.', icon: <Shield size={18} />, color: '#f59e0b' },
                  { key: 'leadership',        label: 'Party Leadership',      desc: 'Add or remove party leaders and officials.',                        icon: <Crown size={18} />,       color: '#a855f7' },
                  { key: 'news',              label: 'News & Posts',          desc: 'Publish, edit and remove news articles.',                           icon: <Newspaper size={18} />,   color: '#10b981' },
                  { key: 'shop',              label: 'Shop Manager',          desc: 'Add, edit and remove products in the BOZ shop.',                    icon: <ShoppingBag size={18} />, color: '#ec4899' },
                  { key: 'documents',         label: 'Documents & Letters',   desc: 'Upload official letters and documents.',                            icon: <FileText size={18} />,    color: '#f97316' },
                  { key: 'press-statements',  label: 'Press Statements',      desc: 'Upload and manage press releases.',                                 icon: <Newspaper size={18} />,   color: '#06b6d4' },
                  { key: 'live-streams',      label: 'Live Streaming',        desc: 'Go live and manage stream sessions.',                               icon: <Radio size={18} />,       color: A },
                  { key: 'events',            label: 'Events Manager',        desc: 'Create and manage party events.',                                   icon: <Calendar size={18} />,    color: '#84cc16' },
                  { key: 'membership-admin',  label: 'Membership',            desc: 'View and manage party members.',                                    icon: <Users size={18} />,       color: '#8b5cf6' },
                  { key: 'registrations',     label: 'Registrations',         desc: 'Approve or reject member registrations.',                           icon: <CheckCircle size={18} />, color: '#22c55e' },
                  { key: 'results-approval',  label: 'Results Approval',      desc: 'Verify and approve polling station results.',                       icon: <CheckCircle size={18} />, color: '#f59e0b' },
                  { key: 'voter-roll-upload', label: 'Voter Roll Upload',     desc: 'Upload the official ECZ voter roll CSV.',                           icon: <FileText size={18} />,    color: '#0891b2' },
                  { key: 'email',             label: 'Email Settings',        desc: 'Configure Resend email service.',                                   icon: <Mail size={18} />,        color: '#64748b' },
                  { key: 'security-centre',   label: 'Security Centre',       desc: 'Monitor system security and access logs.',                          icon: <ShieldCheck size={18} />, color: '#dc2626' },
                  { key: 'adoption-certs',    label: 'Adoption Certificates', desc: 'Issue and manage adoption certificates.',                           icon: <Award size={18} />,       color: '#14b8a6' },
                  { key: 'chamber-amendments',label: 'Chamber Amendments',    desc: 'Manage chamber amendment submissions.',                             icon: <Building2 size={18} />,   color: '#f43f5e' },
                ].map(card => (
                  <button key={card.key} onClick={() => setActive(card.key as SectionKey)}
                    className="flex items-start gap-3 p-4 rounded-2xl text-left w-full transition-all hover:scale-[1.02]"
                    style={{ backgroundColor: '#0f1f33', border: '1px solid rgba(255,255,255,0.07)' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.border = `1px solid ${card.color}40`}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.border = '1px solid rgba(255,255,255,0.07)'}>
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                      style={{ background: `${card.color}20`, border: `1px solid ${card.color}30`, color: card.color }}>
                      {card.icon}
                    </div>
                    <div>
                      <p style={{ color: '#fff', fontSize: '0.88rem', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.04em' }}>{card.label}</p>
                      <p className="mt-1" style={{ color: 'rgba(255,255,255,0.38)', fontSize: '0.73rem', lineHeight: 1.4 }}>{card.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </SuperAdminGate>
        );

      case 'personal-details':
        return (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 style={{ fontFamily: 'Oswald, sans-serif', fontSize: '1.4rem', letterSpacing: '0.04em', color: '#fff' }}>Personal Details</h2>
              <button onClick={() => setEditing(!editing)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm"
                style={{ background: A, color: '#fff', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.06em' }}>
                {editing ? <><Save size={14} /> SAVE</> : <><Edit2 size={14} /> EDIT</>}
              </button>
            </div>
            <DashCard title="Manager Information">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {(Object.keys(manager) as (keyof typeof manager)[]).map(k => {
                  const labels: Record<keyof typeof manager, string> = {
                    firstName: 'FIRST NAME', lastName: 'LAST NAME', role: 'ROLE / TITLE',
                    phone: 'PHONE', email: 'EMAIL', province: 'PROVINCE',
                    clearanceLevel: 'CLEARANCE LEVEL', staffId: 'STAFF ID',
                  };
                  return editing ? (
                    <div key={k}>
                      <label className="block text-xs mb-1" style={{ color: 'rgba(255,255,255,0.35)', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.1em' }}>{labels[k]}</label>
                      <input className="w-full px-3 py-2.5 rounded-xl text-sm" value={manager[k]}
                        onChange={e => setManager(p => ({ ...p, [k]: e.target.value }))}
                        style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: `1px solid ${A}40`, color: '#fff', outline: 'none' }} />
                    </div>
                  ) : (
                    <Field key={k} label={labels[k]} value={manager[k]} />
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
                {['Current Password', 'New Password', 'Confirm New Password'].map(label => (
                  <div key={label}>
                    <label className="text-xs mb-1 block" style={{ color: 'rgba(255,255,255,0.35)', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.1em' }}>{label.toUpperCase()}</label>
                    <input type="password" className="w-full px-3 py-2.5 rounded-xl text-sm" placeholder="••••••••"
                      style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', outline: 'none' }} />
                  </div>
                ))}
                <button className="px-5 py-2.5 rounded-xl text-sm" style={{ background: A, color: '#fff', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.06em' }}>UPDATE PASSWORD</button>
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
      title="Management"
      subtitle="BOZ NATIONAL DASHBOARD"
      user={{ name: `${manager.firstName} ${manager.lastName}`, role: manager.role, id: manager.staffId }}
      navGroups={NAV}
      activeSection={active}
      onNavigate={(key) => setActive(key as SectionKey)}
      notifications={2}
    >
      {renderSection()}
    </DashboardShell>
  );
}
