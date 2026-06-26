import { useState } from 'react';
import { useNavigate } from 'react-router';
import {
  LayoutDashboard, Package, PackagePlus, Globe, Users, UserCircle, Lock, MapPin,
  CheckCircle, Clock, Edit2, Save,
  Phone, Mail, TrendingUp, DollarSign
} from 'lucide-react';
import { DashboardShell, DashCard } from '../../components/DashboardShell';

const A = '#10b981';
const NAVY = '#1e2d4a';

type SectionKey = 'overview' | 'equip-approved' | 'equip-applied' | 'exports' | 'investors' | 'personal-details' | 'security' | 'address-book';

const NAV: { group: string; items: { key: SectionKey; label: string; icon: React.ReactNode }[] }[] = [
  {
    group: 'MAIN',
    items: [{ key: 'overview', label: 'Overview', icon: <LayoutDashboard size={16} /> }],
  },
  {
    group: 'EQUIPMENT',
    items: [
      { key: 'equip-approved', label: 'Equipment Approved', icon: <Package size={16} /> },
      { key: 'equip-applied', label: 'Equipment Applied', icon: <PackagePlus size={16} /> },
    ],
  },
  {
    group: 'TRADE',
    items: [
      { key: 'exports', label: 'Products Exported', icon: <Globe size={16} /> },
      { key: 'investors', label: 'List of Investors', icon: <Users size={16} /> },
    ],
  },
  {
    group: 'PROFILE',
    items: [
      { key: 'personal-details', label: 'Organisation Details', icon: <UserCircle size={16} /> },
      { key: 'security', label: 'Security Settings', icon: <Lock size={16} /> },
      { key: 'address-book', label: 'Address Book', icon: <MapPin size={16} /> },
    ],
  },
];

const EQUIPMENT_APPROVED = [
  { id: 'EQ-001', name: 'Maize Sheller Machine', category: 'Processing', approvedDate: '2026-03-12', condition: 'New', assignedBy: 'Ministry of Agriculture' },
  { id: 'EQ-002', name: 'Solar-Powered Water Pump', category: 'Irrigation', approvedDate: '2026-04-05', condition: 'Refurbished', assignedBy: 'ZAWA Cooperative Fund' },
  { id: 'EQ-003', name: 'Tractor (20HP)', category: 'Farming', approvedDate: '2026-05-18', condition: 'New', assignedBy: 'BOZ Development Fund' },
];

const EQUIPMENT_APPLIED = [
  { id: 'APP-001', name: 'Cold Storage Unit (5 Ton)', category: 'Storage', appliedDate: '2026-05-20', status: 'Pending' },
  { id: 'APP-002', name: 'Rice Milling Machine', category: 'Processing', appliedDate: '2026-06-01', status: 'Under Review' },
  { id: 'APP-003', name: 'Drip Irrigation Kit (2 Acres)', category: 'Irrigation', appliedDate: '2026-06-05', status: 'Approved' },
];

const EXPORTS = [
  { id: 'EXP-001', product: 'Dried Kapenta', destination: 'Zimbabwe', quantity: '500 kg', value: 'ZMW 45,000', date: '2026-04-10', status: 'Delivered' },
  { id: 'EXP-002', product: 'Groundnuts (Processed)', destination: 'South Africa', quantity: '1,200 kg', value: 'ZMW 132,000', date: '2026-05-02', status: 'In Transit' },
  { id: 'EXP-003', product: 'Honey (Raw)', destination: 'Botswana', quantity: '300 kg', value: 'ZMW 27,000', date: '2026-06-01', status: 'Processing' },
];

const INVESTORS = [
  {
    id: 'INV-001', name: 'AgriVest Africa Ltd', country: 'Kenya', sector: 'Agri-processing',
    contactPerson: 'Mr. David Otieno', phone: '+254 712 345 678', email: 'otieno@agrivest.co.ke',
    investmentInterest: 'Maize processing plant — ZMW 2.5M', status: 'Active',
  },
  {
    id: 'INV-002', name: 'GreenField Zambia Investments', country: 'Zambia', sector: 'Irrigation',
    contactPerson: 'Ms. Ruth Chanda', phone: '+260 977 654 321', email: 'ruth@greenfield.zm',
    investmentInterest: 'Solar irrigation systems — ZMW 1.8M', status: 'Negotiating',
  },
  {
    id: 'INV-003', name: 'Nordic Agro Partners', country: 'Sweden', sector: 'Organic exports',
    contactPerson: 'Ms. Ingrid Larsson', phone: '+46 70 123 4567', email: 'ingrid@nordicagro.se',
    investmentInterest: 'Organic honey & kapenta exports — ZMW 900K', status: 'Interested',
  },
];

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    Approved: '#10b981', Active: '#10b981', Delivered: '#10b981',
    Pending: '#f59e0b', 'Under Review': A, Negotiating: A,
    'In Transit': '#f97316', Processing: '#f97316', Interested: '#8b5cf6',
  };
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

export default function CooperativeDashboard() {
  const [active, setActive] = useState<SectionKey>('overview');
  const [editing, setEditing] = useState(false);
  const [org, setOrg] = useState({
    name: 'Choma Valley Cooperative Society',
    regNumber: 'COOP-2021-0047',
    phone: '+260 977 100 200',
    email: 'chomavalley@cooperative.zm',
    province: 'Southern Province',
    district: 'Choma',
    ward: 'Mapanza Ward',
    address: 'Plot 12, Mapanza, Choma District',
  });

  function navigate_(key: SectionKey) {
    setActive(key);
  }

  function renderSection() {
    switch (active) {
      case 'overview':
        return (
          <div>
            <h2 className="text-xl mb-6" style={{ color: NAVY }}>Cooperative Overview</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {[
                { label: 'Equipment Approved', value: EQUIPMENT_APPROVED.length, icon: <Package size={20} />, color: A },
                { label: 'Equipment Applied', value: EQUIPMENT_APPLIED.length, icon: <PackagePlus size={20} />, color: '#f59e0b' },
                { label: 'Products Exported', value: EXPORTS.length, icon: <Globe size={20} />, color: '#6366f1' },
                { label: 'Investors', value: INVESTORS.length, icon: <Users size={20} />, color: '#ec4899' },
              ].map(s => (
                <div key={s.label} className="rounded-xl p-4 flex items-center gap-3" style={{backgroundColor: "#0f1f33", border: "1px solid rgba(255,255,255,0.07)"}}>
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white" style={{ background: s.color }}>
                    {s.icon}
                  </div>
                  <div>
                    <p className="text-xs text-white/40">{s.label}</p>
                    <p className="text-xl" style={{ color: NAVY }}>{s.value}</p>
                  </div>
                </div>
              ))}
            </div>
            <DashCard title="Recent Activity">
              <div className="space-y-3">
                {[
                  { text: 'Tractor (20HP) approved by BOZ Development Fund', time: '18 May 2026', icon: <CheckCircle size={14} className="text-green-500" /> },
                  { text: 'Rice Milling Machine application under review', time: '1 Jun 2026', icon: <Clock size={14} className="text-yellow-500" /> },
                  { text: 'Groundnuts export to South Africa in transit', time: '2 May 2026', icon: <TrendingUp size={14} style={{ color: A }} /> },
                  { text: 'Nordic Agro Partners expressed investment interest', time: '5 Jun 2026', icon: <DollarSign size={14} className="text-purple-500" /> },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3 py-2 border-b border-gray-100 last:border-0">
                    <div className="mt-0.5">{item.icon}</div>
                    <div className="flex-1">
                      <p className="text-sm text-white/70">{item.text}</p>
                      <p className="text-xs text-white/40">{item.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </DashCard>
          </div>
        );

      case 'equip-approved':
        return (
          <div>
            <h2 className="text-xl mb-6" style={{ color: NAVY }}>Equipment Approved</h2>
            <DashCard title={`${EQUIPMENT_APPROVED.length} Items Approved`}>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      {['ID', 'Equipment', 'Category', 'Approved Date', 'Condition', 'Assigned By'].map(h => (
                        <th key={h} className="text-left text-xs text-white/40 pb-2 pr-4">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {EQUIPMENT_APPROVED.map(eq => (
                      <tr key={eq.id} className="border-b hover:bg-white/5" style={{borderColor:"rgba(255,255,255,0.05)"}}>
                        <td className="py-3 pr-4 text-xs text-white/40">{eq.id}</td>
                        <td className="py-3 pr-4 text-white/85">{eq.name}</td>
                        <td className="py-3 pr-4 text-white/55">{eq.category}</td>
                        <td className="py-3 pr-4 text-white/55">{eq.approvedDate}</td>
                        <td className="py-3 pr-4"><StatusBadge status={eq.condition} /></td>
                        <td className="py-3 text-white/55">{eq.assignedBy}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </DashCard>
          </div>
        );

      case 'equip-applied':
        return (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl" style={{ color: NAVY }}>Equipment Applied</h2>
              <button
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm"
                style={{ background: A }}
              >
                <PackagePlus size={16} /> Apply for Equipment
              </button>
            </div>
            <DashCard title={`${EQUIPMENT_APPLIED.length} Applications`}>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      {['ID', 'Equipment', 'Category', 'Applied Date', 'Status'].map(h => (
                        <th key={h} className="text-left text-xs text-white/40 pb-2 pr-4">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {EQUIPMENT_APPLIED.map(eq => (
                      <tr key={eq.id} className="border-b hover:bg-white/5" style={{borderColor:"rgba(255,255,255,0.05)"}}>
                        <td className="py-3 pr-4 text-xs text-white/40">{eq.id}</td>
                        <td className="py-3 pr-4 text-white/85">{eq.name}</td>
                        <td className="py-3 pr-4 text-white/55">{eq.category}</td>
                        <td className="py-3 pr-4 text-white/55">{eq.appliedDate}</td>
                        <td className="py-3"><StatusBadge status={eq.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </DashCard>
          </div>
        );

      case 'exports':
        return (
          <div>
            <h2 className="text-xl mb-6" style={{ color: NAVY }}>Products Exported</h2>
            <div className="grid grid-cols-3 gap-4 mb-6">
              {[
                { label: 'Total Exports', value: EXPORTS.length },
                { label: 'Total Value', value: 'ZMW 204,000' },
                { label: 'Delivered', value: EXPORTS.filter(e => e.status === 'Delivered').length },
              ].map(s => (
                <div key={s.label} className="rounded-xl p-4 text-center" style={{backgroundColor:"#0f1f33",border:"1px solid rgba(255,255,255,0.07)"}}>
                  <p className="text-2xl" style={{ color: A }}>{s.value}</p>
                  <p className="text-xs text-white/40 mt-1">{s.label}</p>
                </div>
              ))}
            </div>
            <DashCard title="Export Records">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      {['ID', 'Product', 'Destination', 'Quantity', 'Value', 'Date', 'Status'].map(h => (
                        <th key={h} className="text-left text-xs text-white/40 pb-2 pr-4">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {EXPORTS.map(ex => (
                      <tr key={ex.id} className="border-b hover:bg-white/5" style={{borderColor:"rgba(255,255,255,0.05)"}}>
                        <td className="py-3 pr-4 text-xs text-white/40">{ex.id}</td>
                        <td className="py-3 pr-4 text-white/85">{ex.product}</td>
                        <td className="py-3 pr-4 text-white/55">{ex.destination}</td>
                        <td className="py-3 pr-4 text-white/55">{ex.quantity}</td>
                        <td className="py-3 pr-4 text-white/85">{ex.value}</td>
                        <td className="py-3 pr-4 text-white/55">{ex.date}</td>
                        <td className="py-3"><StatusBadge status={ex.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </DashCard>
          </div>
        );

      case 'investors':
        return (
          <div>
            <h2 className="text-xl mb-6" style={{ color: NAVY }}>List of Investors</h2>
            <div className="space-y-4">
              {INVESTORS.map(inv => (
                <div key={inv.id} className="rounded-2xl p-5" style={{backgroundColor: "#0f1f33", border: "1px solid rgba(255,255,255,0.07)"}}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="text-white mb-0.5">{inv.name}</h4>
                      <p className="text-xs text-white/40">{inv.country} · {inv.sector}</p>
                    </div>
                    <StatusBadge status={inv.status} />
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="flex items-center gap-2 text-sm text-white/55">
                      <Users size={14} className="text-white/40" />
                      {inv.contactPerson}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-white/55">
                      <Phone size={14} className="text-white/40" />
                      {inv.phone}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-white/55 col-span-2">
                      <Mail size={14} className="text-white/40" />
                      {inv.email}
                    </div>
                  </div>
                  <div className="rounded-lg px-3 py-2 text-sm" style={{backgroundColor:"#0a1f12",color:"#34d399"}}>
                    <span className="text-green-600 mr-1">Interest:</span>{inv.investmentInterest}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'personal-details':
        return (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl" style={{ color: NAVY }}>Organisation Details</h2>
              <button
                onClick={() => setEditing(!editing)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm"
                style={{ background: A }}
              >
                {editing ? <><Save size={14} /> Save</> : <><Edit2 size={14} /> Edit</>}
              </button>
            </div>
            <DashCard title="Organisation Information">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(Object.keys(org) as (keyof typeof org)[]).map(k => {
                  const labels: Record<keyof typeof org, string> = {
                    name: 'Organisation Name', regNumber: 'Registration Number',
                    phone: 'Phone Number', email: 'Email Address',
                    province: 'Province', district: 'District', ward: 'Ward', address: 'Physical Address',
                  };
                  return editing ? (
                    <div key={k}>
                      <label className="text-xs text-white/40 mb-1 block">{labels[k]}</label>
                      <input
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-white/85 focus:outline-none"
                        value={org[k]}
                        onChange={e => setOrg(prev => ({ ...prev, [k]: e.target.value }))}
                        style={{ '--tw-ring-color': A } as React.CSSProperties}
                      />
                    </div>
                  ) : (
                    <Field key={k} label={labels[k]} value={org[k]} />
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
            <DashCard title="Two-Factor Authentication">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/70 mb-1">SMS Authentication</p>
                  <p className="text-xs text-white/40">Receive a code via SMS when signing in</p>
                </div>
                <div className="w-11 h-6 rounded-full relative cursor-pointer" style={{backgroundColor:"rgba(255,255,255,0.15)"}}>
                  <div className="w-4 h-4 rounded-full absolute top-1 left-1" style={{backgroundColor:"white"}} />
                </div>
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
                {[
                  ['Street Address', 'Plot 12, Mapanza Road'],
                  ['City/Town', 'Choma'],
                  ['District', 'Choma District'],
                  ['Province', 'Southern Province'],
                  ['Country', 'Zambia'],
                  ['Postal Code', '50400'],
                ].map(([label, val]) => (
                  <Field key={label} label={label} value={val} />
                ))}
              </div>
              <button className="mt-4 text-sm flex items-center gap-1" style={{ color: A }}>
                <Edit2 size={13} /> Edit Address
              </button>
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
      title="Cooperative"
      subtitle="BOZ COOPERATIVE PORTAL"
      user={{ name: org.name, role: `Reg. ${org.regNumber}` }}
      navGroups={NAV}
      activeSection={active}
      onNavigate={(key) => navigate_(key as SectionKey)}
      notifications={2}
    >
      {renderSection()}
    </DashboardShell>
  );
}
