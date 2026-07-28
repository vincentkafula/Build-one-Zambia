import { useState } from 'react';
import {
  LayoutDashboard, Lock, MapPin, Globe2, CheckCircle2, Clock,
} from 'lucide-react';
import { DashboardShell, DashCard } from '../../components/DashboardShell';
import { securityApi } from '../../lib/api';

const A = '#00712B';
const NAVY = '#1e2d4a';

type SectionKey = 'overview' | 'party-details' | 'security' | 'address-book';

const NAV: { group: string; items: { key: SectionKey; label: string; icon: React.ReactNode }[] }[] = [
  { group: 'MAIN', items: [{ key: 'overview', label: 'Overview', icon: <LayoutDashboard size={16} /> }] },
  {
    group: 'PROFILE',
    items: [
      { key: 'party-details', label: 'Party Details', icon: <Globe2 size={16} /> },
      { key: 'security', label: 'Security Settings', icon: <Lock size={16} /> },
      { key: 'address-book', label: 'Address Book', icon: <MapPin size={16} /> },
    ],
  },
];

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs mb-1" style={{ color: 'rgba(255,255,255,0.7)', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.08em' }}>{label}</p>
      <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.9rem' }}>{value || '—'}</p>
    </div>
  );
}

function getSessionUser(): Record<string, string> | null {
  try { return JSON.parse(sessionStorage.getItem('boz_election_user') ?? 'null'); } catch { return null; }
}

export default function IntlPartyDashboard() {
  const [active, setActive] = useState<SectionKey>('overview');
  const [pwCurrent, setPwCurrent] = useState('');
  const [pwNew, setPwNew] = useState('');
  const [pwConfirm, setPwConfirm] = useState('');
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMsg, setPwMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  async function submitPasswordChange() {
    setPwMsg(null);
    if (!pwCurrent || !pwNew) { setPwMsg({ type: 'error', text: 'Enter your current and new password.' }); return; }
    if (pwNew !== pwConfirm) { setPwMsg({ type: 'error', text: "New passwords don't match." }); return; }
    if (pwNew.length < 8) { setPwMsg({ type: 'error', text: 'New password must be at least 8 characters.' }); return; }
    setPwSaving(true);
    try {
      await securityApi.changePassword(pwCurrent, pwNew);
      setPwMsg({ type: 'success', text: 'Password updated.' });
      setPwCurrent(''); setPwNew(''); setPwConfirm('');
    } catch (e) {
      setPwMsg({ type: 'error', text: e instanceof Error ? e.message : 'Failed to update password.' });
    } finally {
      setPwSaving(false);
    }
  }
  const sessionUser = getSessionUser();
  const isAdminAccess = sessionUser?.role === 'super_admin' || sessionUser?.role === 'admin';

  const party = {
    name: sessionUser?.name || (isAdminAccess ? 'Admin Access — Preview Party' : 'International Party'),
    country: sessionUser?.scopeName || 'Not specified',
    email: sessionUser?.email || '—',
    phone: sessionUser?.phone || '—',
    status: 'Active',
  };

  function renderSection() {
    switch (active) {
      case 'overview':
        return (
          <div className="space-y-6">
            <div className="rounded-2xl p-6" style={{ background: `linear-gradient(135deg, ${A}18, ${A}06)`, border: `1px solid ${A}30` }}>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg" style={{ background: A }}>
                  {party.name.charAt(0).toUpperCase() || 'P'}
                </div>
                <div>
                  <h2 style={{ fontFamily: 'Oswald, sans-serif', fontSize: '1.4rem', letterSpacing: '0.04em', color: '#fff' }}>
                    Welcome, {party.name}
                  </h2>
                  <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.82rem' }}>
                    International Political Party Partner · Build One Zambia
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="rounded-2xl p-4 text-center" style={{ backgroundColor: A }}>
                <CheckCircle2 className="w-6 h-6 mx-auto mb-2" style={{ color: '#fff' }} />
                <p style={{ color: '#fff', fontSize: '1rem', fontFamily: 'Oswald, sans-serif' }}>{party.status}</p>
                <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.7rem', marginTop: 4 }}>Partnership Status</p>
              </div>
              <div className="rounded-2xl p-4 text-center" style={{ backgroundColor: A }}>
                <Globe2 className="w-6 h-6 mx-auto mb-2" style={{ color: '#fff' }} />
                <p style={{ color: '#fff', fontSize: '1rem', fontFamily: 'Oswald, sans-serif' }}>{party.country}</p>
                <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.7rem', marginTop: 4 }}>Country / Region</p>
              </div>
              <div className="rounded-2xl p-4 text-center" style={{ backgroundColor: A }}>
                <Clock className="w-6 h-6 mx-auto mb-2" style={{ color: '#fff' }} />
                <p style={{ color: '#fff', fontSize: '1rem', fontFamily: 'Oswald, sans-serif' }}>Pending Review</p>
                <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.7rem', marginTop: 4 }}>Next Milestone</p>
              </div>
            </div>

            <DashCard title="About this Partnership">
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.85)', lineHeight: 1.7 }}>
                This dashboard is where your party's designated contact manages your affiliation profile with
                Build One Zambia — party details, delegation contacts, and the status of your application. Once
                fully approved, your BOZ liaison will reach out to coordinate next steps (delegation visits,
                policy exchange, or election-observation arrangements, depending on the affiliation type you
                requested).
              </p>
            </DashCard>
          </div>
        );

      case 'party-details':
        return (
          <div>
            <h2 className="text-xl mb-6" style={{ color: NAVY }}>Party Details</h2>
            <DashCard title="Registered Information">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Party Name" value={party.name} />
                <Field label="Country" value={party.country} />
                <Field label="Contact Email" value={party.email} />
                <Field label="Contact Phone" value={party.phone} />
              </div>
              <p className="text-xs mt-5" style={{ color: 'rgba(255,255,255,0.7)' }}>
                To update these details, contact info@bozplans.org — changes to a registered party's official
                information are reviewed by our team before being applied.
              </p>
            </DashCard>
          </div>
        );

      case 'security':
        return (
          <div>
            <h2 className="text-xl mb-6" style={{ color: NAVY }}>Security Settings</h2>
            <DashCard title="Change Password">
              <div className="max-w-md space-y-4">
                {[
                  { label: 'Current Password', value: pwCurrent, onChange: setPwCurrent },
                  { label: 'New Password', value: pwNew, onChange: setPwNew },
                  { label: 'Confirm New Password', value: pwConfirm, onChange: setPwConfirm },
                ].map(({ label, value, onChange }) => (
                  <div key={label}>
                    <label className="text-xs mb-1 block" style={{ color: 'rgba(255,255,255,0.7)' }}>{label}</label>
                    <input type="password" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none" placeholder="••••••••"
                      value={value} onChange={e => onChange(e.target.value)} />
                  </div>
                ))}
                {pwMsg && <p className="text-sm" style={{ color: pwMsg.type === 'success' ? A : '#dc2626' }}>{pwMsg.text}</p>}
                <button onClick={submitPasswordChange} disabled={pwSaving} className="px-5 py-2 rounded-lg text-white text-sm" style={{ background: A, opacity: pwSaving ? 0.6 : 1 }}>
                  {pwSaving ? 'Updating…' : 'Update Password'}
                </button>
              </div>
            </DashCard>
          </div>
        );

      case 'address-book':
        return (
          <div>
            <h2 className="text-xl mb-6" style={{ color: NAVY }}>Address Book</h2>
            <DashCard title="Headquarters Address">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Country" value={party.country} />
                <Field label="Contact Email" value={party.email} />
              </div>
              <p className="text-xs mt-5" style={{ color: 'rgba(255,255,255,0.7)' }}>
                Full headquarters address is on file from your application and visible to BOZ administrators.
              </p>
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
      title="International Party"
      subtitle="BOZ INTERNATIONAL RELATIONS PORTAL"
      user={{ name: party.name, role: 'International Political Party' }}
      navGroups={NAV}
      activeSection={active}
      onNavigate={(key) => setActive(key as SectionKey)}
    >
      {renderSection()}
    </DashboardShell>
  );
}
