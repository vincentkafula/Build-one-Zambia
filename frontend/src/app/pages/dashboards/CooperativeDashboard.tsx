import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import {
  LayoutDashboard, Package, PackagePlus, Globe, Users, UserCircle, Lock, MapPin,
  CheckCircle, Clock, Edit2, Save,
  Phone, Mail, TrendingUp, DollarSign, FileText, Download, ShieldCheck, Loader2, AlertCircle
} from 'lucide-react';
import { DashboardShell, DashCard } from '../../components/DashboardShell';
import { registrationApi, CoopCertificate } from '../../lib/api';

const A = '#00712B';
const NAVY = '#1e2d4a';

type SectionKey = 'overview' | 'equip-approved' | 'equip-applied' | 'exports' | 'investors' | 'documents' | 'personal-details' | 'security' | 'address-book';

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
      { key: 'documents', label: 'Registration Certificate', icon: <FileText size={16} /> },
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
    Approved: '#00712B', Active: '#00712B', Delivered: '#00712B',
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

function printCertificate() {
  const el = document.getElementById('coop-cert-print');
  if (!el) return;
  const html = `<!DOCTYPE html><html><head><title>BOZ Cooperative Certificate</title>
    <link href="https://fonts.googleapis.com/css2?family=Oswald:wght@400;600;700&family=Open+Sans&display=swap" rel="stylesheet">
    <style>*{margin:0;padding:0;box-sizing:border-box}body{background:#fff;font-family:'Open Sans',sans-serif;-webkit-print-color-adjust:exact;print-color-adjust:exact}@page{size:A4 landscape;margin:0}</style>
    </head><body>${el.outerHTML}</body></html>`;
  const w = window.open('', '_blank');
  if (!w) return;
  w.document.write(html);
  w.document.close();
  w.focus();
  setTimeout(() => { w.print(); w.close(); }, 600);
}

function CertificateVisual({ cert }: { cert: CoopCertificate }) {
  const issued = new Date(cert.dateOfIssue).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  return (
    <div id="coop-cert-print" style={{
      width: '100%', maxWidth: '900px', margin: '0 auto', background: '#fff', color: '#1a1a1a',
      border: `3px double ${A}`, borderRadius: '6px', padding: '40px 48px', position: 'relative',
    }}>
      {cert.isSample && (
        <div style={{
          position: 'absolute', top: '45%', left: '50%', transform: 'translate(-50%, -50%) rotate(-30deg)',
          fontFamily: 'Oswald, sans-serif', fontSize: '4rem', fontWeight: 700, letterSpacing: '0.1em',
          color: 'rgba(220,38,38,0.15)', pointerEvents: 'none', whiteSpace: 'nowrap', zIndex: 1,
        }}>
          SAMPLE — NOT VALID
        </div>
      )}
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <p style={{ fontFamily: 'Oswald, sans-serif', fontSize: '11px', letterSpacing: '0.2em', color: A }}>REPUBLIC OF ZAMBIA</p>
        <p style={{ fontSize: '11px', color: '#555' }}>Registered under the Cooperatives Act, Chapter 119 of the Laws of Zambia</p>
        <h1 style={{ fontFamily: 'Oswald, sans-serif', fontSize: '1.6rem', letterSpacing: '0.08em', color: A, margin: '14px 0 4px', textTransform: 'uppercase' }}>
          Cooperative Registration Certificate
        </h1>
      </div>

      <p style={{ textAlign: 'center', fontStyle: 'italic', color: '#555', marginBottom: '8px' }}>This is to certify that</p>
      <p style={{ textAlign: 'center', fontFamily: 'Oswald, sans-serif', fontSize: '1.8rem', color: '#1a1a1a', margin: '0 0 6px', textTransform: 'uppercase' }}>{cert.cooperativeName}</p>
      <p style={{ textAlign: 'center', color: '#555', marginBottom: '20px', fontSize: '0.9rem' }}>
        has been duly registered as a {cert.legalStatus} and is entitled to all rights, privileges and obligations conferred by law.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 24px', fontSize: '0.85rem', marginBottom: '20px', borderTop: '1px solid #ddd', borderBottom: '1px solid #ddd', padding: '16px 0' }}>
        <p><strong>Certificate No:</strong> {cert.certificateNo}</p>
        <p><strong>Registration No:</strong> {cert.registrationNumber}</p>
        <p><strong>Date of Registration:</strong> {issued}</p>
        <p><strong>Type of Cooperative:</strong> {cert.typeOfCooperative}</p>
        <p style={{ gridColumn: '1 / -1' }}><strong>Registered Office:</strong> {cert.registeredOffice}</p>
        <p style={{ gridColumn: '1 / -1' }}><strong>Group Chairperson / Contact:</strong> {cert.contactPerson} · {cert.contactPhone}</p>
      </div>

      <p style={{ fontFamily: 'Oswald, sans-serif', fontSize: '0.8rem', letterSpacing: '0.06em', color: A, marginBottom: '8px' }}>
        REGISTERED MEMBERS ({cert.memberCount})
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '2px 20px', fontSize: '0.78rem', marginBottom: '24px' }}>
        {cert.members.map(m => (
          <p key={m.membershipNumber} style={{ margin: 0 }}>
            {m.position}. {m.fullName || <span style={{ color: '#b91c1c' }}>Unknown member ({m.membershipNumber})</span>}
            <span style={{ color: '#888' }}> — {m.membershipNumber}</span>
          </p>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: '1px solid #ddd', paddingTop: '16px' }}>
        <div>
          <div style={{ width: '140px', height: '1px', backgroundColor: '#1a1a1a', marginBottom: '6px' }} />
          <p style={{ fontSize: '0.7rem', color: '#555' }}>Registrar of Cooperatives</p>
        </div>
        <p style={{ fontSize: '0.68rem', color: '#888', textAlign: 'right' }}>
          Issued {issued} · bozplans.org<br />This certificate is the property of the Registrar of Cooperatives.
        </p>
      </div>
    </div>
  );
}

function CertificateSection() {
  const [cert, setCert] = useState<CoopCertificate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await registrationApi.getCoopCertificate();
        setCert(res.certificate);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Could not load your certificate.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div>
      <h2 className="text-xl mb-6" style={{ color: NAVY }}>Registration Certificate</h2>
      <DashCard title="Cooperative Registration Certificate">
        {loading ? (
          <div className="flex items-center gap-2 py-10 justify-center text-white/50">
            <Loader2 size={18} className="animate-spin" /> Loading your certificate…
          </div>
        ) : error ? (
          <div className="flex items-start gap-3 rounded-lg px-4 py-3" style={{ backgroundColor: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.25)' }}>
            <AlertCircle size={18} style={{ color: '#dc2626', flexShrink: 0, marginTop: 2 }} />
            <p className="text-sm" style={{ color: '#f87171' }}>{error}</p>
          </div>
        ) : cert ? (
          <>
            {cert.isSample ? (
              <div className="flex items-start gap-3 mb-5 rounded-lg px-4 py-3" style={{ backgroundColor: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)' }}>
                <AlertCircle size={18} style={{ color: '#f59e0b', flexShrink: 0, marginTop: 2 }} />
                <p className="text-sm" style={{ color: '#fbbf24' }}>
                  <strong>Template preview only</strong> — no real application is linked to this account, so this is sample data
                  showing how the certificate will look. A real cooperative's certificate is populated from their actual
                  approved application.
                </p>
              </div>
            ) : (
              <div className="flex items-start gap-3 mb-5 rounded-lg px-4 py-3" style={{ backgroundColor: '#0a1f12', border: '1px solid rgba(0,113,43,0.3)' }}>
                <ShieldCheck size={18} style={{ color: A, flexShrink: 0, marginTop: 2 }} />
                <p className="text-sm" style={{ color: '#7fc99a' }}>
                  Populated automatically from your online cooperative application — {cert.memberCount} registered members.
                </p>
              </div>
            )}
            <div className="mb-5" style={{ backgroundColor: '#0d1810', padding: '20px', borderRadius: '8px' }}>
              <CertificateVisual cert={cert} />
            </div>
            <div className="flex flex-wrap gap-3">
              <button onClick={printCertificate} className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm" style={{ background: A }}>
                <Download size={15} /> Download / Print Certificate
              </button>
            </div>
          </>
        ) : null}
      </DashCard>
    </div>
  );
}

export default function CooperativeDashboard() {
  const [active, setActive] = useState<SectionKey>('overview');
  const [editing, setEditing] = useState(false);

  const sessionUser = (() => {
    try { return JSON.parse(sessionStorage.getItem('boz_election_user') ?? 'null'); } catch { return null; }
  })();
  const isAdminAccess = sessionUser?.role === 'super_admin' || sessionUser?.role === 'admin';

  const [org, setOrg] = useState({
    name: sessionUser?.name || (isAdminAccess ? 'Admin Access — Choma Valley Cooperative Society' : 'Choma Valley Cooperative Society'),
    regNumber: sessionUser?.registrationId || 'COOP-2021-0047',
    phone: sessionUser?.phone || '+260 977 100 200',
    email: sessionUser?.email || 'chomavalley@cooperative.zm',
    province: sessionUser?.scopeName || 'Southern Province',
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
                { label: 'Equipment Applied', value: EQUIPMENT_APPLIED.length, icon: <PackagePlus size={20} />, color: '#00712B' },
                { label: 'Products Exported', value: EXPORTS.length, icon: <Globe size={20} />, color: '#00712B' },
                { label: 'Investors', value: INVESTORS.length, icon: <Users size={20} />, color: '#00712B' },
              ].map(s => (
                <div key={s.label} className="rounded-xl p-4 flex items-center gap-3" style={{backgroundColor: "#123322", border: "1px solid rgba(255,255,255,0.07)"}}>
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
                <div key={s.label} className="rounded-xl p-4 text-center" style={{backgroundColor:"#123322",border:"1px solid rgba(255,255,255,0.07)"}}>
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
                <div key={inv.id} className="rounded-2xl p-5" style={{backgroundColor: "#123322", border: "1px solid rgba(255,255,255,0.07)"}}>
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
                  <div className="rounded-lg px-3 py-2 text-sm" style={{backgroundColor:"#0a1f12",color:"#479966"}}>
                    <span className="text-green-600 mr-1">Interest:</span>{inv.investmentInterest}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'documents':
        return <CertificateSection />;

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
