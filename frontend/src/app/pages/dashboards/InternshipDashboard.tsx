import { useState, useMemo, useEffect } from 'react';

import {
  LayoutDashboard, Building2, Users, UserCircle, Lock, MapPin,
  Phone, Mail, Edit2, Save, Globe, Award, Briefcase, Clock, Calendar, Flag, RefreshCw
} from 'lucide-react';
import { DashboardShell, DashCard } from '../../components/DashboardShell';
import { getAllChambers, getInternshipsByChamberId, getOpenInternships } from '../../data/allChambers';
import { suggestUSPartners, USChamber } from '../../data/usChambers';
import { chambersApi, ChamberInfo } from '../../lib/api';

const A = '#8b5cf6';
const NAVY = '#1e2d4a';

type SectionKey = 'overview' | 'chamber' | 'us-chambers' | 'internships' | 'cooperatives' | 'personal-details' | 'security' | 'address-book';

const NAV: { group: string; items: { key: SectionKey; label: string; icon: React.ReactNode }[] }[] = [
  {
    group: 'MAIN',
    items: [{ key: 'overview', label: 'Overview', icon: <LayoutDashboard size={16} /> }],
  },
  {
    group: 'OPPORTUNITIES',
    items: [
      { key: 'internships', label: 'Browse Internships', icon: <Briefcase size={16} /> },
    ],
  },
  {
    group: 'WARD RESOURCES',
    items: [
      { key: 'chamber', label: 'Ward Chamber', icon: <Building2 size={16} /> },
      { key: 'us-chambers', label: 'U.S. Partner Chambers', icon: <Flag size={16} /> },
      { key: 'cooperatives', label: 'Cooperatives in Ward', icon: <Users size={16} /> },
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

// Chamber data will be fetched based on intern's ward assignment

const COOPERATIVES = [
  {
    id: 'COOP-001',
    name: 'Monze Valley Agri Cooperative',
    sector: 'Agriculture / Maize & Sunflower',
    status: 'Successful Applicant',
    contactPerson: 'Mrs. Agnes Mwale',
    phone: '+260 966 112 233',
    email: 'agnes@monzevalley.zm',
    members: 42,
    ward: 'Monze Ward',
  },
  {
    id: 'COOP-002',
    name: 'Southern Beekeepers Cooperative',
    sector: 'Apiculture / Honey Processing',
    status: 'Successful Applicant',
    contactPerson: 'Mr. Peter Siame',
    phone: '+260 955 443 221',
    email: 'psiame@southernbee.zm',
    members: 28,
    ward: 'Monze Ward',
  },
  {
    id: 'COOP-003',
    name: 'Women in Trade Cooperative (WITCO)',
    sector: 'Retail & Cottage Industry',
    status: 'Successful Applicant',
    contactPerson: 'Ms. Dorothy Banda',
    phone: '+260 971 887 654',
    email: 'dorothy@witco.zm',
    members: 60,
    ward: 'Monze Ward',
  },
];

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs mb-1" style={{ color: 'rgba(255,255,255,0.35)', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.08em' }}>{label}</p>
      <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.9rem' }}>{value}</p>
    </div>
  );
}

export default function InternshipDashboard() {
  const [active, setActive] = useState<SectionKey>('overview');
  const [editing, setEditing] = useState(false);
  const [intern, setIntern] = useState({
    firstName: 'Mutale',
    lastName: 'Chipalo',
    phone: '+260 977 345 678',
    email: 'mutale.chipalo@intern.boz.zm',
    ward: 'Monze Central',
    wardId: 'ward-138-1', // First ward of Choma Central constituency
    district: 'Choma District',
    province: 'Southern Province',
    idNumber: 'NRC-234567/89/1',
  });

  // Backend-loaded ward chamber
  const [backendChamber, setBackendChamber] = useState<ChamberInfo | null | undefined>(undefined); // undefined = loading
  const [chamberError, setChamberError] = useState('');

  useEffect(() => {
    async function fetchWardChamber() {
      try {
        const res = await chambersApi.getByWard(intern.wardId);
        setBackendChamber(res.chamber); // null = no chamber assigned
      } catch {
        setChamberError('Could not load chamber from server. Showing local data.');
        setBackendChamber(null);
      }
    }
    fetchWardChamber();
  }, [intern.wardId]);

  // Fallback: local data chamber if backend not yet available
  const localWardChamber = useMemo(() => {
    const allChambers = getAllChambers();
    return allChambers.find(c => c.type === 'ward' && c.wardId === intern.wardId) || null;
  }, [intern.wardId]);

  // Use backend chamber if loaded, otherwise fall back to local
  const wardChamber = backendChamber !== undefined
    ? (backendChamber || localWardChamber)
    : localWardChamber;

  // Get internship programs from this chamber
  const chamberInternships = useMemo(() => {
    if (!wardChamber) return [];
    return getInternshipsByChamberId(wardChamber.id);
  }, [wardChamber]);

  // Get all available internships
  const allInternships = useMemo(() => getOpenInternships(), []);

  function navigate_(key: SectionKey) {
    setActive(key);
  }

  function renderSection() {
    switch (active) {
      case 'overview':
        return (
          <div>
            <h2 className="text-xl mb-2" style={{ color: NAVY }}>Internship Dashboard</h2>
            <p className="text-sm text-white/38 mb-6">Welcome, {intern.firstName}. Here is your ward assignment overview.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {[
                { label: 'Ward Assigned', value: intern.ward, icon: <MapPin size={20} />, color: A },
                { label: 'Cooperatives in Ward', value: COOPERATIVES.length, icon: <Users size={20} />, color: '#10b981' },
                { label: 'Chamber Contact', value: 'Available', icon: <Building2 size={20} />, color: '#f59e0b' },
              ].map(s => (
                <div key={s.label} className="rounded-xl p-4 flex items-center gap-3" style={{backgroundColor: "#0f1f33", border: "1px solid rgba(255,255,255,0.07)"}}>
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white" style={{ background: s.color }}>
                    {s.icon}
                  </div>
                  <div>
                    <p className="text-xs text-white/40">{s.label}</p>
                    <p className="text-sm" style={{ color: NAVY }}>{s.value}</p>
                  </div>
                </div>
              ))}
            </div>
            <DashCard title="Quick Reference">
              <div className="space-y-3">
                {wardChamber && (
                  <div className="flex items-start gap-3 p-3 rounded-lg" style={{backgroundColor:"#1a0f2e"}}>
                    <Building2 size={16} className="mt-0.5" style={{ color: A }} />
                    <div>
                      <p className="text-sm text-white/85">Your Ward Chamber: <strong>{wardChamber.name}</strong></p>
                      <p className="text-xs text-white/38">{wardChamber.contactPhone} · {wardChamber.contactEmail}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-start gap-3 p-3 rounded-lg" style={{backgroundColor:"#0a1f12"}}>
                  <Users size={16} className="mt-0.5 text-green-600" />
                  <div>
                    <p className="text-sm text-white/85">{COOPERATIVES.length} cooperatives registered in {intern.ward}</p>
                    <p className="text-xs text-white/38">All are successful BOZ programme applicants</p>
                  </div>
                </div>
              </div>
            </DashCard>
          </div>
        );

      case 'chamber':
        return (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl" style={{ color: NAVY }}>Ward Chamber of Commerce</h2>
              <button
                onClick={async () => {
                  setBackendChamber(undefined);
                  try { const r = await chambersApi.getByWard(intern.wardId); setBackendChamber(r.chamber); }
                  catch { setBackendChamber(null); }
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-gray-300 rounded-lg hover:bg-white/5"
              >
                <RefreshCw size={12} /> Refresh
              </button>
            </div>
            {chamberError && <p className="mb-3 text-xs rounded p-2" style={{color:"#fbbf24",backgroundColor:"#2a1a00",border:"1px solid #f59e0b30"}}>{chamberError}</p>}
            {backendChamber === undefined && (
              <p className="text-sm text-white/40 mb-4">Loading chamber from server…</p>
            )}
            {backendChamber !== undefined && (
              <div className="mb-3 text-xs px-3 py-1.5 rounded-lg inline-flex items-center gap-1.5" style={{ background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0' }}>
                <Building2 size={11} /> Loaded from BOZ server
              </div>
            )}
            {!wardChamber ? (
              <DashCard title="No Chamber Assigned">
                <p className="text-sm text-white/38">No chamber has been assigned to your ward yet. Contact your ward administrator.</p>
              </DashCard>
            ) : (
              <>
                <DashCard title="Chamber Details">
                  <div className="mb-4 p-3 rounded-lg text-sm" style={{backgroundColor:"#1a0f2e",color:"#c4b5fd"}}>{wardChamber.description}</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <Field label="Chamber Name" value={wardChamber.name} />
                    <Field label="Location" value={wardChamber.location} />
                    <Field label="Sector Focus" value={wardChamber.sector} />
                    <Field label="Established" value={wardChamber.established} />
                    <Field label="Member Businesses" value={String(wardChamber.memberBusinesses)} />
                    <Field label="Province" value={wardChamber.provinceName || ''} />
                  </div>
                  <h4 className="text-sm text-white/38 mb-3">Chamber Contact Information</h4>
                  <div className="rounded-2xl p-5" style={{backgroundColor: "#0f1f33", border: "1px solid rgba(255,255,255,0.07)"}}>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-white/55">
                        <Phone size={14} className="text-white/40" />{wardChamber.contactPhone}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-white/55">
                        <Mail size={14} className="text-white/40" />{wardChamber.contactEmail}
                      </div>
                      {wardChamber.website && (
                        <div className="flex items-center gap-2 text-sm text-white/55">
                          <Globe size={14} className="text-white/40" />{wardChamber.website}
                        </div>
                      )}
                    </div>
                  </div>
                </DashCard>
                {chamberInternships.length > 0 && (
                  <DashCard title="Available Internship Programs">
                    <ul className="space-y-2">
                      {chamberInternships.map(prog => (
                        <li key={prog.id} className="flex items-start gap-2 text-sm text-white/70 p-2 rounded-lg bg-white/5">
                          <Award size={14} style={{ color: A }} className="mt-0.5" />
                          <div>
                            <p className="font-medium">{prog.title}</p>
                            <p className="text-xs text-white/38">{prog.duration} · {prog.positions} positions · {prog.status}</p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </DashCard>
                )}
              </>
            )}
          </div>
        );

      case 'us-chambers':
        return (
          <div>
            <h2 className="text-xl mb-6" style={{ color: NAVY }}>U.S. Partner Chambers</h2>
            
            <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
              <div className="flex items-start gap-3">
                <Flag size={20} style={{ color: A }} className="mt-0.5" />
                <div>
                  <h3 className="text-sm font-semibold mb-1" style={{ color: NAVY }}>International Partnership Program</h3>
                  <p className="text-sm text-white/55">
                    As a Build One Zambia intern, you have access to partnership opportunities with U.S. Chambers of Commerce. 
                    These chambers can provide mentorship, business connections, and export market guidance to support your ward's economic development.
                  </p>
                </div>
              </div>
            </div>

            <DashCard title="Suggested Partner Chambers">
              <p className="text-sm text-white/38 mb-4">
                Based on your ward's sector focus ({wardChamber?.sector || 'General Business'}), here are recommended U.S. partner chambers:
              </p>
              <div className="space-y-4">
                {suggestUSPartners(wardChamber?.sector || 'General Business', 10).map(chamber => (
                  <div key={chamber.id} className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="text-sm font-semibold text-white mb-1">{chamber.name}</h4>
                        <div className="flex items-center gap-2 text-xs text-white/38">
                          <MapPin size={12} />
                          {chamber.city}, {chamber.state}
                        </div>
                      </div>
                      {chamber.isUSChamberMember && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-semibold">
                          U.S. Chamber Member
                        </span>
                      )}
                    </div>
                    
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <button 
                        className="text-sm flex items-center gap-1.5 transition-colors"
                        style={{ color: A }}
                        onMouseEnter={(e) => e.currentTarget.style.color = '#7c3aed'}
                        onMouseLeave={(e) => e.currentTarget.style.color = A}
                      >
                        <Globe size={13} />
                        Request Partnership Introduction
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </DashCard>

            <DashCard title="Partnership Benefits">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { icon: <Users size={16} />, title: 'Business Networking', desc: 'Connect with U.S. business owners and entrepreneurs' },
                  { icon: <Globe size={16} />, title: 'Export Markets', desc: 'Access guidance on exporting to American markets' },
                  { icon: <Award size={16} />, title: 'Mentorship', desc: 'Learn from experienced chamber professionals' },
                  { icon: <Briefcase size={16} />, title: 'Resources', desc: 'Access business tools and development resources' },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-white/5">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(139, 92, 246, 0.1)', color: A }}>
                      {item.icon}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{item.title}</p>
                      <p className="text-xs text-white/55">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </DashCard>
          </div>
        );

      case 'internships':
        return (
          <div>
            <h2 className="text-xl mb-6" style={{ color: NAVY }}>Browse Internship Opportunities</h2>
            <p className="text-sm text-white/38 mb-6">Explore {allInternships.length} open internship programs from chambers across Zambia</p>
            <div className="space-y-4">
              {allInternships.map(internship => {
                const chamber = getAllChambers().find(c => c.id === internship.chamberId);
                return (
                  <div key={internship.id} className="rounded-2xl p-5" style={{backgroundColor: "#0f1f33", border: "1px solid rgba(255,255,255,0.07)"}}>
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="text-white mb-0.5">{internship.title}</h4>
                        <p className="text-xs text-white/40">{chamber?.location} · {chamber?.provinceName}</p>
                      </div>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">{internship.status.toUpperCase()}</span>
                    </div>
                    <p className="text-sm text-white/55 mb-3">{internship.description}</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3 text-sm text-white/55">
                      <div className="flex items-center gap-2"><Clock size={13} className="text-white/40" /> {internship.duration}</div>
                      <div className="flex items-center gap-2"><Users size={13} className="text-white/40" /> {internship.positions} positions</div>
                      <div className="flex items-center gap-2"><Award size={13} className="text-white/40" /> {internship.sector}</div>
                      {internship.applicationDeadline && (
                        <div className="flex items-center gap-2"><Calendar size={13} className="text-white/40" /> {new Date(internship.applicationDeadline).toLocaleDateString()}</div>
                      )}
                    </div>
                    <div className="border-t border-gray-100 pt-3">
                      <details className="text-sm">
                        <summary className="cursor-pointer text-purple-600 hover:text-purple-700">View Details</summary>
                        <div className="mt-3 space-y-3">
                          <div>
                            <p className="text-xs text-white/40 mb-1">Requirements:</p>
                            <ul className="text-xs text-white/55 space-y-0.5 ml-4">
                              {internship.requirements.map((req, idx) => (
                                <li key={idx} className="list-disc">{req}</li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <p className="text-xs text-white/40 mb-1">Benefits:</p>
                            <ul className="text-xs text-white/55 space-y-0.5 ml-4">
                              {internship.benefits.map((ben, idx) => (
                                <li key={idx} className="list-disc">{ben}</li>
                              ))}
                            </ul>
                          </div>
                          {chamber && (
                            <div>
                              <p className="text-xs text-white/40 mb-1">Chamber Contact:</p>
                              <p className="text-xs text-white/55">{chamber.contactEmail} · {chamber.contactPhone}</p>
                            </div>
                          )}
                        </div>
                      </details>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );

      case 'cooperatives':
        return (
          <div>
            <h2 className="text-xl mb-6" style={{ color: NAVY }}>Cooperatives in Your Ward</h2>
            <p className="text-sm text-white/38 mb-4">{intern.ward} — {COOPERATIVES.length} successful BOZ programme applicants</p>
            <div className="space-y-4">
              {COOPERATIVES.map(coop => (
                <div key={coop.id} className="rounded-2xl p-5" style={{backgroundColor: "#0f1f33", border: "1px solid rgba(255,255,255,0.07)"}}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="text-white mb-0.5">{coop.name}</h4>
                      <p className="text-xs text-white/40">{coop.sector}</p>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">{coop.status}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mb-3 text-sm text-white/55">
                    <div className="flex items-center gap-2"><Users size={13} className="text-white/40" /> {coop.members} Members</div>
                    <div className="flex items-center gap-2"><MapPin size={13} className="text-white/40" /> {coop.ward}</div>
                  </div>
                  <div className="border-t border-gray-100 pt-3 space-y-1.5">
                    <p className="text-xs text-white/40 mb-1">Contact Person: <strong className="text-white/70">{coop.contactPerson}</strong></p>
                    <div className="flex items-center gap-2 text-sm text-white/55"><Phone size={13} className="text-white/40" />{coop.phone}</div>
                    <div className="flex items-center gap-2 text-sm text-white/55"><Mail size={13} className="text-white/40" />{coop.email}</div>
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
              <h2 className="text-xl" style={{ color: NAVY }}>Personal Details</h2>
              <button onClick={() => setEditing(!editing)} className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm" style={{ background: A }}>
                {editing ? <><Save size={14} /> Save</> : <><Edit2 size={14} /> Edit</>}
              </button>
            </div>
            <DashCard title="Personal Information">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(Object.keys(intern) as (keyof typeof intern)[]).filter(k => k !== 'wardId').map(k => {
                  const labels: Record<string, string> = {
                    firstName: 'First Name', lastName: 'Last Name', phone: 'Phone Number',
                    email: 'Email Address', ward: 'Ward', district: 'District',
                    province: 'Province', idNumber: 'NRC / ID Number',
                  };
                  return editing ? (
                    <div key={k}>
                      <label className="text-xs text-white/40 mb-1 block">{labels[k]}</label>
                      <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none" value={intern[k]} onChange={e => setIntern(p => ({ ...p, [k]: e.target.value }))} />
                    </div>
                  ) : (
                    <Field key={k} label={labels[k]} value={intern[k]} />
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
                {[['Street Address', '45 Mapanza Rd'], ['Town', 'Monze'], ['District', 'Monze District'], ['Province', 'Southern Province'], ['Country', 'Zambia'], ['Postal Code', '50300']].map(([l, v]) => (
                  <Field key={l} label={l} value={v} />
                ))}
              </div>
              <button className="mt-4 text-sm flex items-center gap-1" style={{ color: A }}><Edit2 size={13} /> Edit Address</button>
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
      title="Internship Portal"
      subtitle="BOZ ZAMBIA–US PARTNERSHIP"
      user={{ name: `${intern.firstName} ${intern.lastName}`, role: `${intern.ward} · ${intern.district}` }}
      navGroups={NAV}
      activeSection={active}
      onNavigate={(key) => navigate_(key as SectionKey)}
    >
      {renderSection()}
    </DashboardShell>
  );
}