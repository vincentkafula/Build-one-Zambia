import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import {
  LayoutDashboard, BarChart2, MapPin, UserCircle, Lock, ShieldCheck,
  Edit2, Save, TrendingUp, Users, CheckCircle, Clock, ExternalLink, Radio, FileText, Activity, Scale, ShoppingBag, Newspaper, Crown, Building2, Mail, Award, Vote, ScanLine, Server, Shield, Calendar
} from 'lucide-react';
import { DashboardShell, DashCard, StatCard } from '../../components/DashboardShell';
import { ECZEntryPage } from '../ECZEntryPage';
import { provinces } from '../../data/mockData';
import { LiveStreamAdmin } from '../../components/LiveStreamAdmin';
import { DocumentLibraryAdmin } from '../../components/DocumentLibraryAdmin';
import { LiveResultsPanel } from '../../components/LiveResultsPanel';
import { CandidateManager } from '../../components/CandidateManager';
import { ECZComparisonDashboard } from '../../components/ECZComparisonDashboard';
import { ShopManager } from '../../components/ShopManager';
import { NewsManager } from '../../components/NewsManager';
import { LeadershipManager } from '../../components/LeadershipManager';
import { MembershipAdmin } from '../../components/MembershipAdmin';
import { ChamberAmendmentsAdmin } from '../../components/ChamberAmendmentsAdmin';
import { RegistrationApprovalAdmin } from '../../components/RegistrationApprovalAdmin';
import { SecurityDashboard } from '../../components/SecurityDashboard';
import { PressStatementsAdmin } from '../../components/PressStatementsAdmin';
import { EmailAdmin } from '../../components/EmailAdmin';
import { AdoptionCertAdmin } from '../../components/AdoptionCertAdmin';
import { BallotScanSystem } from '../../components/BallotScanSystem';
import { VoterVerification } from '../../components/VoterVerification';
import { ResultsApprovalQueue } from '../../components/ResultsApprovalQueue';
import { SystemSetupDashboard } from '../../components/SystemSetupDashboard';
import { VoterRollUpload } from '../../components/VoterRollUpload';
import { ElectionUserManager } from '../../components/ElectionUserManager';
import { NoticeBoard } from '../../components/NoticeBoard';
import { EventsManager } from '../../components/EventsManager';

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

const PROVINCE_REGISTERED: Record<string, number> = {
  'Central': 820079,
  'Copperbelt': 1296446,
  'Eastern': 1129444,
  'Luapula': 694681,
  'Lusaka': 1430889,
  'Muchinga': 435536,
  'Northern': 722403,
  'North-Western': 524195,
  'Southern': 1103275,
  'Western': 629352,
};

// Computed from actual ECZ data in mockData.ts (13,529 polling stations)
function computeProvinceStats() {
  return provinces.map(prov => {
    let regVoters = 0;
    let psCount = 0;
    let wardCount = 0;
    let consCount = 0;
    prov.districts.forEach(d => {
      d.constituencies.forEach(c => {
        consCount++;
        c.wards.forEach(w => {
          wardCount++;
          w.pollingStations.forEach(ps => {
            psCount++;
            regVoters += ps.registeredVoters;
          });
        });
      });
    });
    return {
      id: prov.id,
      name: prov.name,
      districts: prov.districts.length,
      constituencies: consCount,
      wards: wardCount,
      pollingStations: psCount,
      registeredVoters: regVoters,
    };
  });
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

      {/* Overall summary */}
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

      {/* Province rows */}
      <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: '#0f1f33', border: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="grid grid-cols-12 px-5 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          {['Province', 'Votes Cast / Registered', 'Turnout %', 'Status'].map(h => (
            <p key={h} className={`text-xs col-span-3`} style={{ color: 'rgba(255,255,255,0.3)', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.1em' }}>{h}</p>
          ))}
        </div>
        {PROVINCES_TURNOUT.map((p, idx) => {
          const cast = votesCast[p.name] ?? 0;
          const pct = p.registered > 0 ? (cast / p.registered) * 100 : 0;
          const color = turnoutColor(pct);
          const isLast = idx === PROVINCES_TURNOUT.length - 1;
          return (
            <div key={p.name} className="grid grid-cols-12 items-center px-5 py-4" style={{ borderBottom: isLast ? 'none' : '1px solid rgba(255,255,255,0.04)' }}>
              {/* Province name */}
              <div className="col-span-3">
                <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.88rem' }}>{p.name}</p>
              </div>

              {/* Bar + numbers */}
              <div className="col-span-3 pr-4">
                {editMode ? (
                  <input
                    type="number"
                    min={0}
                    max={p.registered}
                    value={cast}
                    onChange={e => setVotesCast(prev => ({ ...prev, [p.name]: Math.min(p.registered, Math.max(0, Number(e.target.value))) }))}
                    className="w-full px-3 py-1.5 rounded-lg text-sm"
                    style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', outline: 'none' }}
                  />
                ) : (
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.75rem' }}>
                        {cast.toLocaleString()} / {p.registered.toLocaleString()}
                      </p>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.07)' }}>
                      <div
                        className="h-1.5 rounded-full transition-all duration-700"
                        style={{ width: `${pct}%`, background: color, boxShadow: `0 0 6px ${color}60` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Percentage */}
              <div className="col-span-3">
                <p style={{ color, fontFamily: 'Oswald, sans-serif', fontSize: '1.1rem', letterSpacing: '0.04em' }}>{pct.toFixed(1)}%</p>
              </div>

              {/* Status badge */}
              <div className="col-span-3">
                <span
                  className="text-xs px-2.5 py-0.5 rounded-full"
                  style={{ backgroundColor: `${color}18`, color, border: `1px solid ${color}30`, fontFamily: 'Oswald, sans-serif', letterSpacing: '0.06em' }}
                >
                  {turnoutLabel(pct)}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 mt-4 px-1">
        {[
          { color: '#10b981', label: '≥70% High' },
          { color: '#f59e0b', label: '50–69% Moderate' },
          { color: '#ef4444', label: '<50% Low' },
        ].map(l => (
          <div key={l.label} className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full" style={{ background: l.color }} />
            <p style={{ color: 'rgba(255,255,255,0.38)', fontSize: '0.72rem', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.06em' }}>{l.label}</p>
          </div>
        ))}
        <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.68rem', marginLeft: 'auto' }}>ADMIN ONLY · Not visible to the public</p>
      </div>
    </div>
  );
}

// Role display config
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

export default function ManagerDashboard() {
  const navigate = useNavigate();
  const [active, setActive] = useState<SectionKey>('overview');
  const [editing, setEditing] = useState(false);

  // Load logged-in election user from session
  const electionUser = (() => {
    try { return JSON.parse(sessionStorage.getItem('boz_election_user') ?? 'null'); } catch { return null; }
  })();

  const [manager, setManager] = useState({
    firstName: electionUser?.name?.split(' ')[0] ?? 'Dr. Grace',
    lastName: electionUser?.name?.split(' ').slice(1).join(' ') ?? 'Mulenga',
    role: ROLE_LABELS[electionUser?.role] ?? 'National Results Manager',
    phone: electionUser?.phone ?? '+260 977 500 600',
    email: electionUser?.email ?? 'g.mulenga@manager.boz.zm',
    province: electionUser?.scopeName ?? 'National',
    clearanceLevel: ROLE_LABELS[electionUser?.role] ?? 'National',
    staffId: electionUser?.username ?? 'MGR-2026-001',
  });

  function navigate_(key: SectionKey) {
    setActive(key);
  }

  const provinceStats = useMemo(() => computeProvinceStats(), []);
  const totalRegistered = provinceStats.reduce((s, p) => s + p.registeredVoters, 0);
  const totalPS = provinceStats.reduce((s, p) => s + p.pollingStations, 0);
  const totalWards = provinceStats.reduce((s, p) => s + p.wards, 0);
  const totalConst = provinceStats.reduce((s, p) => s + p.constituencies, 0);
  const totalDistricts = provinceStats.reduce((s, p) => s + p.districts, 0);

  function renderSection() {
    switch (active) {
      case 'overview':
        return (
          <div>
            {/* Role context banner */}
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
                    <button key={key} onClick={() => navigate_(key as SectionKey)}
                      className="text-xs px-3 py-1.5 rounded-lg font-medium transition-colors"
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

      case 'ecz-figures':
        return <ECZEntryPage />;

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
          <div>
            <div className="mb-6">
              <h2 style={{ fontFamily: 'Oswald, sans-serif', fontSize: '1.4rem', letterSpacing: '0.04em', color: '#fff' }}>Admin Panel</h2>
              <p style={{ color: 'rgba(255,255,255,0.38)', fontSize: '0.82rem', marginTop: 4 }}>Authorised access only — system administration for the BOZ election results portal</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {[
                { label: 'Users & Roles', desc: 'Manage agent accounts, assign roles and permissions.', icon: <Users size={18} />, color: '#6366f1' },
                { label: 'Result Verifications', desc: 'Review, approve, or reject submitted polling station results.', icon: <CheckCircle size={18} />, color: '#10b981' },
                { label: 'Audit Log', desc: 'View full audit trail of all system actions.', icon: <Clock size={18} />, color: '#f59e0b' },
                { label: 'Sync & Database', desc: 'Monitor offline sync queue and data integrity.', icon: <TrendingUp size={18} />, color: A },
              ].map(card => (
                <div key={card.label} className="flex items-start gap-4 p-5 rounded-2xl cursor-pointer transition-all" style={{ backgroundColor: '#0f1f33', border: '1px solid rgba(255,255,255,0.07)' }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.border = `1px solid ${card.color}30`}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.border = '1px solid rgba(255,255,255,0.07)'}
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${card.color}20`, border: `1px solid ${card.color}30`, color: card.color }}>
                    {card.icon}
                  </div>
                  <div>
                    <p style={{ color: '#fff', fontSize: '0.9rem', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.04em' }}>{card.label}</p>
                    <p className="mt-1" style={{ color: 'rgba(255,255,255,0.38)', fontSize: '0.75rem' }}>{card.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between p-5 rounded-2xl" style={{ backgroundColor: '#0f1f33', border: `1px solid ${A}25` }}>
              <div>
                <p style={{ color: '#fff', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.04em' }}>Open Full Admin Dashboard</p>
                <p className="mt-1" style={{ color: 'rgba(255,255,255,0.38)', fontSize: '0.75rem' }}>Complete admin interface with charts, user management and sync monitoring.</p>
              </div>
              <a href="/admin" className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm shrink-0 ml-4" style={{ background: A, color: '#fff', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.06em' }}>
                <ExternalLink size={14} /> OPEN ADMIN
              </a>
            </div>
          </div>
        );

      case 'personal-details':
        return (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 style={{ fontFamily: 'Oswald, sans-serif', fontSize: '1.4rem', letterSpacing: '0.04em', color: '#fff' }}>Personal Details</h2>
              <button onClick={() => setEditing(!editing)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm" style={{ background: A, color: '#fff', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.06em' }}>
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
                      <input className="w-full px-3 py-2.5 rounded-xl text-sm" value={manager[k]} onChange={e => setManager(p => ({ ...p, [k]: e.target.value }))} style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: `1px solid ${A}40`, color: '#fff', outline: 'none' }} />
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
                    <input type="password" className="w-full px-3 py-2.5 rounded-xl text-sm" placeholder="••••••••" style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', outline: 'none' }} />
                  </div>
                ))}
                <button className="px-5 py-2.5 rounded-xl text-sm" style={{ background: A, color: '#fff', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.06em' }}>UPDATE PASSWORD</button>
              </div>
            </DashCard>
          </div>
        );

      case 'candidates':
        return <CandidateManager />;

      case 'ecz-comparison':
        return <ECZComparisonDashboard />;

      case 'results-approval':
        return <ResultsApprovalQueue />;

      case 'system-setup':
        return <SystemSetupDashboard />;

      case 'voter-roll-upload':
        return <VoterRollUpload />;

      case 'election-users':
        return <ElectionUserManager />;

      case 'notice-board':
        return <NoticeBoard />;

      case 'shop':
        return <ShopManager />;

      case 'news':
        return <NewsManager />;

      case 'leadership':
        return <LeadershipManager />;

      case 'membership-admin':
        return <MembershipAdmin />;

      case 'registrations':
        return <RegistrationApprovalAdmin />;

      case 'press-statements':
        return <PressStatementsAdmin />;

      case 'email':
        return <EmailAdmin />;

      case 'adoption-certs':
        return <AdoptionCertAdmin />;

      case 'ballot-scan':
        return <BallotScanSystem />;

      case 'voter-verify':
        return (
          <VoterVerification
            pollingStationId="ps-mapanza-01"
            pollingStationName="National Oversight — All Stations"
            agentName={`${manager.firstName} ${manager.lastName}`}
            accentColor={A}
          />
        );

      case 'voter-turnout':
        return <VoterTurnoutSection />;

      case 'chamber-amendments':
        return <ChamberAmendmentsAdmin />;

      case 'security-centre':
        return <SecurityDashboard />;

      case 'live-results':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold" style={{color:"rgba(255,255,255,0.9)"}}>Live Results Engine</h2>
              <p className="text-sm mt-1" style={{color:"rgba(255,255,255,0.4)"}}>Auto-calculated aggregations from all polling station submissions. Refreshes every 30 seconds.</p>
            </div>
            <div className="grid grid-cols-1 gap-8">
              {(['presidential', 'parliament', 'mayoral', 'councillor'] as const).map(et => (
                <div key={et} className="rounded-2xl p-6" style={{backgroundColor:"#0f1f33",border:"1px solid rgba(255,255,255,0.07)"}}>
                  <h3 className="text-base font-semibold capitalize mb-4 pb-3" style={{color:"rgba(255,255,255,0.7)",borderBottom:"1px solid rgba(255,255,255,0.07)"}}>{et === 'parliament' ? 'Parliamentary' : et.charAt(0).toUpperCase() + et.slice(1)} Election</h3>
                  <LiveResultsPanel
                    electionType={et}
                    autoRefreshSeconds={30}
                    showLeaderboard={true}
                    showCoverage={true}
                    showTrend={false}
                    showFeed={et === 'presidential'}
                    compact={true}
                  />
                </div>
              ))}
            </div>
          </div>
        );

      case 'events':
        return <EventsManager />;

      case 'live-streams':
        return <LiveStreamAdmin />;

      case 'documents':
        return <DocumentLibraryAdmin />;

      default:
        return null;
    }
  }

  return (
    <DashboardShell
      accentColor={A}
      title="Results Manager"
      subtitle="BOZ NATIONAL DASHBOARD"
      user={{ name: `${manager.firstName} ${manager.lastName}`, role: manager.role, id: manager.staffId }}
      navGroups={NAV}
      activeSection={active}
      onNavigate={(key) => navigate_(key as SectionKey)}
      notifications={2}
    >
      {renderSection()}
    </DashboardShell>
  );
}
