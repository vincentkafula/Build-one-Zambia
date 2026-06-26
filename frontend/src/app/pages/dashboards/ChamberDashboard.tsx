import { useState, useEffect } from 'react';

import {
  LayoutDashboard, Globe, Users, GraduationCap, UserCircle, Lock, MapPin,
  Phone, Mail, Edit2, Save, Building2, DollarSign,
  FilePenLine, CheckCircle, Clock, XCircle, Plus, ChevronDown, ChevronUp,
} from 'lucide-react';
import { chambersApi, ChamberAmendment, AmendmentField } from '../../lib/api';
import { DashboardShell, DashCard } from '../../components/DashboardShell';

const A = '#f59e0b';
const NAVY = '#1e2d4a';

type SectionKey = 'overview' | 'investors' | 'cooperatives' | 'intern-coordinator' | 'amendments' | 'personal-details' | 'security' | 'address-book';

// Stub chamber ID — in production this comes from the logged-in chamber session
const MY_CHAMBER_ID = 'chamber-monze-ward-001';
const MY_CHAMBER_NAME = 'Monze Ward Chamber of Commerce';

const AMENDMENT_FIELDS: { field: AmendmentField; label: string }[] = [
  { field: 'name',            label: 'Chamber Name' },
  { field: 'location',        label: 'Location / Address' },
  { field: 'description',     label: 'Description' },
  { field: 'contactEmail',    label: 'Contact Email' },
  { field: 'contactPhone',    label: 'Contact Phone' },
  { field: 'website',         label: 'Website URL' },
  { field: 'memberBusinesses',label: 'Number of Member Businesses' },
];

const NAV: { group: string; items: { key: SectionKey; label: string; icon: React.ReactNode }[] }[] = [
  {
    group: 'MAIN',
    items: [{ key: 'overview', label: 'Overview', icon: <LayoutDashboard size={16} /> }],
  },
  {
    group: 'WARD DIRECTORY',
    items: [
      { key: 'investors', label: 'Companies to Invest', icon: <Globe size={16} /> },
      { key: 'cooperatives', label: 'Zambian Cooperatives', icon: <Users size={16} /> },
      { key: 'intern-coordinator', label: 'Intern Coordinator', icon: <GraduationCap size={16} /> },
    ],
  },
  {
    group: 'CHAMBER ADMIN',
    items: [
      { key: 'amendments', label: 'Amendment Requests', icon: <FilePenLine size={16} /> },
    ],
  },
  {
    group: 'PROFILE',
    items: [
      { key: 'personal-details', label: 'Personal Details', icon: <UserCircle size={16} /> },
      { key: 'security', label: 'Security Settings', icon: <Lock size={16} /> },
      { key: 'address-book', label: 'Address Book', icon: <MapPin size={16} /> },
    ],
  },
];

const INVESTORS = [
  {
    id: 'INV-001', company: 'Pioneer Seeds International', country: 'USA', sector: 'Agri-inputs',
    contactPerson: 'Mr. Robert Miller', phone: '+1 (312) 555-0178', email: 'r.miller@pioneerseeds.us',
    investmentType: 'Seed supply franchise', ward: 'Monze Ward', status: 'Confirmed',
  },
  {
    id: 'INV-002', company: 'SolarPower Africa Corp', country: 'USA', sector: 'Renewable Energy',
    contactPerson: 'Ms. Amara Johnson', phone: '+1 (415) 555-0234', email: 'amara@solarafricacorp.com',
    investmentType: 'Solar irrigation infrastructure', ward: 'Monze Ward', status: 'Pending',
  },
  {
    id: 'INV-003', company: 'AgroTech Holdings LLC', country: 'USA', sector: 'Food processing',
    contactPerson: 'Mr. Daniel Carter', phone: '+1 (646) 555-0312', email: 'dcarter@agrotech.us',
    investmentType: 'Maize milling partnership', ward: 'Monze Ward', status: 'Under Review',
  },
];

const COOPERATIVES = [
  {
    id: 'COOP-001', name: 'Monze Valley Agri Cooperative', sector: 'Agriculture',
    contactPerson: 'Mrs. Agnes Mwale', phone: '+260 966 112 233', email: 'agnes@monzevalley.zm',
    members: 42, products: 'Maize, Sunflower Oil', ward: 'Monze Ward', status: 'Active',
  },
  {
    id: 'COOP-002', name: 'Southern Beekeepers Cooperative', sector: 'Apiculture',
    contactPerson: 'Mr. Peter Siame', phone: '+260 955 443 221', email: 'psiame@southernbee.zm',
    members: 28, products: 'Honey, Beeswax', ward: 'Monze Ward', status: 'Active',
  },
  {
    id: 'COOP-003', name: 'Women in Trade Cooperative (WITCO)', sector: 'Retail & Cottage',
    contactPerson: 'Ms. Dorothy Banda', phone: '+260 971 887 654', email: 'dorothy@witco.zm',
    members: 60, products: 'Crafts, Processed foods', ward: 'Monze Ward', status: 'Active',
  },
];

const INTERN = {
  name: 'Mutale Chipalo',
  title: 'BOZ Ward Intern Coordinator',
  ward: 'Monze Ward',
  phone: '+260 977 345 678',
  email: 'mutale.chipalo@intern.boz.zm',
  availableHours: 'Monday – Friday, 08:00 – 16:00 CAT',
  note: 'Contact the intern coordinator to arrange introductions with local cooperatives or to schedule ward investment visits.',
};

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = { Confirmed: '#10b981', Active: '#10b981', Pending: '#f59e0b', 'Under Review': A };
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

export default function ChamberDashboard() {
  const [active, setActive] = useState<SectionKey>('overview');
  const [editing, setEditing] = useState(false);
  const [admin, setAdmin] = useState({
    firstName: 'Caroline',
    lastName: 'Mwansa',
    title: 'Ward Chamber Administrator',
    phone: '+1 (202) 555-0143',
    email: 'cmwansa@uszambiachamber.org',
    ward: 'Monze Ward',
    district: 'Monze District',
    province: 'Southern Province',
  });

  // ── Amendments state
  const [amendments, setAmendments] = useState<ChamberAmendment[]>([]);
  const [amendLoading, setAmendLoading] = useState(false);
  const [showAmendForm, setShowAmendForm] = useState(false);
  const [amendField, setAmendField] = useState<AmendmentField>('name');
  const [amendCurrent, setAmendCurrent] = useState('');
  const [amendProposed, setAmendProposed] = useState('');
  const [amendReason, setAmendReason] = useState('');
  const [amendSubmitting, setAmendSubmitting] = useState(false);
  const [amendMsg, setAmendMsg] = useState('');
  const [expandedAmend, setExpandedAmend] = useState<string | null>(null);
  const pendingCount = amendments.filter(a => a.status === 'pending').length;

  useEffect(() => {
    if (active === 'amendments') loadAmendments();
  }, [active]);

  async function loadAmendments() {
    setAmendLoading(true);
    try {
      const res = await chambersApi.listAmendments({ chamberId: MY_CHAMBER_ID });
      setAmendments(res.amendments || []);
    } catch {
      // use empty list on error
    } finally {
      setAmendLoading(false);
    }
  }

  async function submitAmendment() {
    if (!amendProposed.trim() || !amendReason.trim()) {
      setAmendMsg('Please fill in all fields.');
      return;
    }
    setAmendSubmitting(true);
    setAmendMsg('');
    try {
      const fieldLabel = AMENDMENT_FIELDS.find(f => f.field === amendField)?.label || amendField;
      await chambersApi.submitAmendment({
        chamberId: MY_CHAMBER_ID,
        chamberName: MY_CHAMBER_NAME,
        field: amendField,
        fieldLabel,
        currentValue: amendCurrent,
        proposedValue: amendProposed,
        reason: amendReason,
      });
      setAmendMsg('Amendment submitted successfully. Awaiting admin approval.');
      setShowAmendForm(false);
      setAmendProposed('');
      setAmendReason('');
      setAmendCurrent('');
      await loadAmendments();
    } catch (e: unknown) {
      setAmendMsg('Failed to submit. Please try again.');
    } finally {
      setAmendSubmitting(false);
    }
  }

  function navigate_(key: SectionKey) {
    setActive(key);
  }

  function renderSection() {
    switch (active) {
      case 'overview':
        return (
          <div>
            <h2 className="text-xl mb-2" style={{ color: NAVY }}>Chamber of Commerce Dashboard</h2>
            <p className="text-sm text-white/38 mb-6">Ward: {admin.ward} — US-Zambia Chamber of Commerce</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {[
                { label: 'Companies to Invest', value: INVESTORS.length, icon: <Globe size={20} />, color: A },
                { label: 'Zambian Cooperatives', value: COOPERATIVES.length, icon: <Users size={20} />, color: '#10b981' },
                { label: 'Intern Coordinator', value: '1 Assigned', icon: <GraduationCap size={20} />, color: '#8b5cf6' },
                { label: 'Pending Amendments', value: pendingCount, icon: <FilePenLine size={20} />, color: '#f97316' },
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
            <DashCard title="Ward Investment Summary">
              <div className="space-y-3">
                {INVESTORS.map(inv => (
                  <div key={inv.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                    <div>
                      <p className="text-sm text-white/85">{inv.company}</p>
                      <p className="text-xs text-white/40">{inv.sector} · {inv.investmentType}</p>
                    </div>
                    <StatusBadge status={inv.status} />
                  </div>
                ))}
              </div>
            </DashCard>
          </div>
        );

      case 'investors':
        return (
          <div>
            <h2 className="text-xl mb-6" style={{ color: NAVY }}>Companies Willing to Invest</h2>
            <div className="space-y-4">
              {INVESTORS.map(inv => (
                <div key={inv.id} className="rounded-2xl p-5" style={{backgroundColor: "#0f1f33", border: "1px solid rgba(255,255,255,0.07)"}}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="text-white mb-0.5">{inv.company}</h4>
                      <p className="text-xs text-white/40">{inv.country} · {inv.sector}</p>
                    </div>
                    <StatusBadge status={inv.status} />
                  </div>
                  <div className="rounded-lg px-3 py-2 text-sm mb-3" style={{backgroundColor:"#2a1a00",color:"#fbbf24"}}>
                    <span className="text-amber-600 mr-1">Investment Type:</span>{inv.investmentType}
                  </div>
                  <div className="space-y-1.5 text-sm text-white/55">
                    <div className="flex items-center gap-2"><Users size={13} className="text-white/40" /> {inv.contactPerson}</div>
                    <div className="flex items-center gap-2"><Phone size={13} className="text-white/40" /> {inv.phone}</div>
                    <div className="flex items-center gap-2"><Mail size={13} className="text-white/40" /> {inv.email}</div>
                    <div className="flex items-center gap-2"><MapPin size={13} className="text-white/40" /> {inv.ward}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'cooperatives':
        return (
          <div>
            <h2 className="text-xl mb-6" style={{ color: NAVY }}>Zambian Cooperatives in Ward</h2>
            <div className="space-y-4">
              {COOPERATIVES.map(coop => (
                <div key={coop.id} className="rounded-2xl p-5" style={{backgroundColor: "#0f1f33", border: "1px solid rgba(255,255,255,0.07)"}}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="text-white mb-0.5">{coop.name}</h4>
                      <p className="text-xs text-white/40">{coop.sector} · {coop.members} Members</p>
                    </div>
                    <StatusBadge status={coop.status} />
                  </div>
                  <p className="text-sm text-white/55 mb-3"><span className="text-white/40">Products: </span>{coop.products}</p>
                  <div className="space-y-1.5 text-sm text-white/55">
                    <div className="flex items-center gap-2"><Users size={13} className="text-white/40" /> {coop.contactPerson}</div>
                    <div className="flex items-center gap-2"><Phone size={13} className="text-white/40" /> {coop.phone}</div>
                    <div className="flex items-center gap-2"><Mail size={13} className="text-white/40" /> {coop.email}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'intern-coordinator':
        return (
          <div>
            <h2 className="text-xl mb-6" style={{ color: NAVY }}>Intern Coordinator Contact</h2>
            <DashCard title="Ward Intern Coordinator">
              <div className="rounded-lg p-3 text-sm mb-4" style={{backgroundColor:"#1a0f2e",color:"#c4b5fd"}}>{INTERN.note}</div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-white" style={{ background: '#8b5cf6' }}>
                  {INTERN.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <p className="text-white">{INTERN.name}</p>
                  <p className="text-xs text-white/40">{INTERN.title}</p>
                </div>
              </div>
              <div className="space-y-2">
                <Field label="Ward" value={INTERN.ward} />
                <Field label="Available Hours" value={INTERN.availableHours} />
                <div className="flex items-center gap-2 text-sm text-white/55"><Phone size={13} className="text-white/40" />{INTERN.phone}</div>
                <div className="flex items-center gap-2 text-sm text-white/55"><Mail size={13} className="text-white/40" />{INTERN.email}</div>
              </div>
            </DashCard>
          </div>
        );

      case 'amendments':
        return (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl" style={{ color: NAVY }}>Amendment Requests</h2>
                <p className="text-sm text-white/38 mt-1">Submit changes to your chamber's details for admin review and approval.</p>
              </div>
              <button
                onClick={() => { setShowAmendForm(true); setAmendMsg(''); }}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm"
                style={{ background: A }}
              >
                <Plus size={14} /> New Amendment
              </button>
            </div>

            {amendMsg && (
              <div className="mb-4 p-3 rounded-lg text-sm" style={amendMsg.includes('success') ? {backgroundColor:'#0a1f12',color:'#34d399',border:'1px solid #34d39930'} : {backgroundColor:'#200a0a',color:'#f87171',border:'1px solid #f8717130'}}>
                {amendMsg}
              </div>
            )}

            {showAmendForm && (
              <div className="rounded-xl p-6 mb-6" style={{backgroundColor:"#0f1f33",border:"2px solid #f59e0b50"}}>
                <h3 className="mb-4 text-sm font-semibold" style={{ color: NAVY }}>Submit Amendment Request</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-xs text-white/38 mb-1">Field to Change</label>
                    <select
                      value={amendField}
                      onChange={e => setAmendField(e.target.value as AmendmentField)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    >
                      {AMENDMENT_FIELDS.map(f => (
                        <option key={f.field} value={f.field}>{f.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-white/38 mb-1">Current Value</label>
                    <input
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                      placeholder="What it currently says…"
                      value={amendCurrent}
                      onChange={e => setAmendCurrent(e.target.value)}
                    />
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-xs text-white/38 mb-1">Proposed New Value</label>
                  <input
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    placeholder="What it should be changed to…"
                    value={amendProposed}
                    onChange={e => setAmendProposed(e.target.value)}
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-xs text-white/38 mb-1">Reason for Change</label>
                  <textarea
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none"
                    placeholder="Explain why this change is needed…"
                    value={amendReason}
                    onChange={e => setAmendReason(e.target.value)}
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={submitAmendment}
                    disabled={amendSubmitting}
                    className="px-5 py-2 rounded-lg text-white text-sm disabled:opacity-50"
                    style={{ background: A }}
                  >
                    {amendSubmitting ? 'Submitting…' : 'Submit Amendment'}
                  </button>
                  <button onClick={() => { setShowAmendForm(false); setAmendMsg(''); }} className="px-4 py-2 text-sm rounded-lg border border-gray-300">Cancel</button>
                </div>
              </div>
            )}

            {amendLoading ? (
              <p className="text-sm text-white/40">Loading amendments…</p>
            ) : amendments.length === 0 ? (
              <div className="rounded-xl p-8 text-center" style={{backgroundColor:"#0f1f33",border:"1px solid rgba(255,255,255,0.07)"}}>
                <FilePenLine className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                <p className="text-sm text-white/38">No amendment requests yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {amendments.map(a => {
                  const isOpen = expandedAmend === a.id;
                  const statusConfig = {
                    pending:  { icon: <Clock size={13} />,        color: '#d97706', bg: '#fef3c7' },
                    approved: { icon: <CheckCircle size={13} />,  color: '#16a34a', bg: '#f0fdf4' },
                    rejected: { icon: <XCircle size={13} />,      color: '#dc2626', bg: '#fef2f2' },
                  }[a.status];
                  return (
                    <div key={a.id} className="rounded-xl overflow-hidden" style={{backgroundColor:"#0f1f33",border:"1px solid rgba(255,255,255,0.07)"}}>
                      <button
                        className="w-full flex items-center justify-between px-5 py-4 text-left"
                        onClick={() => setExpandedAmend(isOpen ? null : a.id)}
                      >
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full font-medium" style={{ color: statusConfig.color, background: statusConfig.bg }}>
                            {statusConfig.icon} {a.status.toUpperCase()}
                          </span>
                          <span className="text-sm text-white/85">{a.fieldLabel}</span>
                          <span className="text-xs text-white/40 hidden sm:inline">→ {a.proposedValue}</span>
                        </div>
                        <div className="flex items-center gap-2 text-white/40">
                          <span className="text-xs">{new Date(a.submittedAt).toLocaleDateString()}</span>
                          {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </div>
                      </button>
                      {isOpen && (
                        <div className="border-t border-gray-100 px-5 pb-5 pt-3 bg-white/5 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                          <div><span className="text-xs text-white/40 block">Current Value</span><span className="text-white/70">{a.currentValue || '—'}</span></div>
                          <div><span className="text-xs text-white/40 block">Proposed Value</span><span className="text-white/70">{a.proposedValue}</span></div>
                          <div className="md:col-span-2"><span className="text-xs text-white/40 block">Reason</span><span className="text-white/70">{a.reason}</span></div>
                          {a.adminNote && <div className="md:col-span-2 p-3 rounded-lg text-xs" style={{backgroundColor:"#0a1525",color:"#93c5fd"}}><strong>Admin Note:</strong> {a.adminNote}</div>}
                          {a.reviewedAt && <div className="text-xs text-white/40">Reviewed: {new Date(a.reviewedAt).toLocaleString()} {a.reviewedBy ? `by ${a.reviewedBy}` : ''}</div>}
                        </div>
                      )}
                    </div>
                  );
                })}
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
            <DashCard title="Admin Information">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(Object.keys(admin) as (keyof typeof admin)[]).map(k => {
                  const labels: Record<keyof typeof admin, string> = {
                    firstName: 'First Name', lastName: 'Last Name', title: 'Title',
                    phone: 'Phone', email: 'Email', ward: 'Ward', district: 'District', province: 'Province',
                  };
                  return editing ? (
                    <div key={k}>
                      <label className="text-xs text-white/40 mb-1 block">{labels[k]}</label>
                      <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none" value={admin[k]} onChange={e => setAdmin(p => ({ ...p, [k]: e.target.value }))} />
                    </div>
                  ) : (
                    <Field key={k} label={labels[k]} value={admin[k]} />
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

      case 'address-book':
        return (
          <div>
            <h2 className="text-xl mb-6" style={{ color: NAVY }}>Address Book</h2>
            <DashCard title="Primary Address">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[['Office', 'Monze Civic Centre, Room 204'], ['Town', 'Monze'], ['District', 'Monze District'], ['Province', 'Southern Province'], ['Country', 'Zambia'], ['Postal Code', '50300']].map(([l, v]) => (
                  <Field key={l} label={l} value={v} />
                ))}
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
      title="Chamber of Commerce"
      subtitle="US-ZAMBIA CHAMBER PORTAL"
      user={{ name: `${admin.firstName} ${admin.lastName}`, role: admin.title }}
      navGroups={NAV}
      activeSection={active}
      onNavigate={(key) => navigate_(key as SectionKey)}
      notifications={pendingCount}
    >
      {renderSection()}
    </DashboardShell>
  );
}
