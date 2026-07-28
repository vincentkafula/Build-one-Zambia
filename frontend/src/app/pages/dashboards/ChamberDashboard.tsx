import { useState, useEffect } from 'react';

import {
  LayoutDashboard, Globe, Users, GraduationCap, UserCircle, Lock, MapPin,
  Phone, Mail, Edit2, Save, Building2, DollarSign,
  FilePenLine, CheckCircle, Clock, XCircle, Plus, ChevronDown, ChevronUp,
} from 'lucide-react';
import { chambersApi, ChamberAmendment, AmendmentField, registrationApi, orgResourcesApi, InvestorRecord, WardCoordinator, securityApi } from '../../lib/api';
import { DashboardShell, DashCard } from '../../components/DashboardShell';

const A = '#00712B';
const NAVY = '#1e2d4a';

type SectionKey = 'overview' | 'investors' | 'cooperatives' | 'intern-coordinator' | 'amendments' | 'personal-details' | 'security' | 'address-book';

// Previously hardcoded MY_CHAMBER_ID/MY_CHAMBER_NAME constants meant every
// chamber account's amendments were submitted against the same fake
// "Monze Ward Chamber of Commerce" record regardless of who was actually
// logged in. Real identity is now loaded via registrationApi.mySelf('chamber')
// in the component below.

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

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = { Confirmed: '#00712B', Active: '#00712B', Pending: '#f59e0b', 'Under Review': A };
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

function ChamberInvestorsSection() {
  const [items, setItems] = useState<InvestorRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    orgResourcesApi.chamberInvestors()
      .then(res => setItems(res.investors))
      .catch(e => setError(e instanceof Error ? e.message : 'Could not load investors.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h2 className="text-xl mb-6" style={{ color: NAVY }}>Companies Willing to Invest</h2>
      {loading ? (
        <p className="text-sm py-10 text-center text-white/40">Loading…</p>
      ) : error ? (
        <p className="text-sm py-6 text-center" style={{ color: '#f87171' }}>{error}</p>
      ) : items.length === 0 ? (
        <div className="rounded-2xl p-8 text-center" style={{ backgroundColor: '#007A30', border: '1px solid rgba(255,255,255,0.07)' }}>
          <p className="text-sm text-white/50">No investors have been connected to your chamber yet. BOZ's investor-relations team links real investor contacts here as they express interest in your ward.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map(inv => (
            <div key={inv.id} className="rounded-2xl p-5" style={{ backgroundColor: '#007A30', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="text-white mb-0.5">{inv.name}</h4>
                  <p className="text-xs text-white/40">{inv.country} · {inv.sector}</p>
                </div>
                <StatusBadge status={inv.status} />
              </div>
              {inv.investmentInterest && (
                <div className="rounded-lg px-3 py-2 text-sm mb-3" style={{ backgroundColor: '#2a1a00', color: '#fbbf24' }}>
                  <span className="text-amber-600 mr-1">Investment Interest:</span>{inv.investmentInterest}
                </div>
              )}
              <div className="space-y-1.5 text-sm text-white/55">
                <div className="flex items-center gap-2"><Users size={13} className="text-white/40" /> {inv.contactPerson || '—'}</div>
                <div className="flex items-center gap-2"><Phone size={13} className="text-white/40" /> {inv.phone || '—'}</div>
                <div className="flex items-center gap-2"><Mail size={13} className="text-white/40" /> {inv.email || '—'}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ChamberCooperativesSection() {
  const [items, setItems] = useState<Record<string, unknown>[]>([]);
  const [ward, setWard] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    orgResourcesApi.chamberCooperatives()
      .then(res => { setItems(res.cooperatives); setWard(res.ward); })
      .catch(e => setError(e instanceof Error ? e.message : 'Could not load cooperatives.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h2 className="text-xl mb-6" style={{ color: NAVY }}>Zambian Cooperatives in Ward{ward ? ` (${ward})` : ''}</h2>
      {loading ? (
        <p className="text-sm py-10 text-center text-white/40">Loading…</p>
      ) : error ? (
        <p className="text-sm py-6 text-center" style={{ color: '#f87171' }}>{error}</p>
      ) : items.length === 0 ? (
        <div className="rounded-2xl p-8 text-center" style={{ backgroundColor: '#007A30', border: '1px solid rgba(255,255,255,0.07)' }}>
          <p className="text-sm text-white/50">No approved cooperatives registered in your ward yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((coop) => (
            <div key={String(coop.id)} className="rounded-2xl p-5" style={{ backgroundColor: '#007A30', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="text-white mb-0.5">{String(coop.cooperativeName || 'Cooperative')}</h4>
                  <p className="text-xs text-white/40">{coop.membershipNumbers ? `${(coop.membershipNumbers as unknown[]).length} Members` : ''}</p>
                </div>
                <StatusBadge status="Active" />
              </div>
              <div className="space-y-1.5 text-sm text-white/55">
                <div className="flex items-center gap-2"><Users size={13} className="text-white/40" /> {String(coop.contactPerson || '—')}</div>
                <div className="flex items-center gap-2"><Phone size={13} className="text-white/40" /> {String(coop.contactPhone || '—')}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ChamberCoordinatorSection() {
  const [coordinator, setCoordinator] = useState<WardCoordinator | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orgResourcesApi.wardCoordinator()
      .then(res => setCoordinator(res.coordinator))
      .catch(e => setError(e instanceof Error ? e.message : 'No intern coordinator has been assigned to your ward yet.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h2 className="text-xl mb-6" style={{ color: NAVY }}>Intern Coordinator Contact</h2>
      <DashCard title="Ward Intern Coordinator">
        {loading ? (
          <p className="text-sm py-6 text-center text-white/40">Loading…</p>
        ) : error || !coordinator ? (
          <p className="text-sm text-white/50">{error || 'No intern coordinator has been assigned to your ward yet.'}</p>
        ) : (
          <>
            {coordinator.note && (
              <div className="rounded-lg p-3 text-sm mb-4" style={{ backgroundColor: '#1a0f2e', color: '#c4b5fd' }}>{coordinator.note}</div>
            )}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center text-white" style={{ background: '#8b5cf6' }}>
                {coordinator.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>
              <div>
                <p className="text-white">{coordinator.name}</p>
                <p className="text-xs text-white/40">{coordinator.title}</p>
              </div>
            </div>
            <div className="space-y-2">
              {coordinator.availableHours && <Field label="Available Hours" value={coordinator.availableHours} />}
              <div className="flex items-center gap-2 text-sm text-white/55"><Phone size={13} className="text-white/40" />{coordinator.phone || '—'}</div>
              <div className="flex items-center gap-2 text-sm text-white/55"><Mail size={13} className="text-white/40" />{coordinator.email || '—'}</div>
            </div>
          </>
        )}
      </DashCard>
    </div>
  );
}

export default function ChamberDashboard() {
  const [active, setActive] = useState<SectionKey>('overview');
  const [pwCurrent, setPwCurrent] = useState('');
  const [pwNew, setPwNew] = useState('');
  const [pwConfirm, setPwConfirm] = useState('');
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMsg, setPwMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [savingDetails, setSavingDetails] = useState(false);
  async function savePersonalDetails() {
    if (!myChamberId) { setEditing(false); return; }
    setSavingDetails(true);
    try {
      await registrationApi.updateMySelf('chamber', {
        contactPerson: `${admin.firstName} ${admin.lastName}`.trim(),
        contactTitle: admin.title,
        phone: admin.phone,
        email: admin.email,
        ward: admin.ward,
        district: admin.district,
      });
      setEditing(false);
    } catch {
      // Keep the form open with the entered values on failure — the admin
      // state already reflects what they typed either way.
    } finally {
      setSavingDetails(false);
    }
  }

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

  // Real chamber identity, loaded from the logged-in account's own
  // registration — replaces the old hardcoded MY_CHAMBER_ID/MY_CHAMBER_NAME
  // that misattributed every chamber's amendments to the same fake record.
  const [myChamberId, setMyChamberId] = useState('');
  const [myChamberName, setMyChamberName] = useState('');
  useEffect(() => {
    registrationApi.mySelf('chamber').then(res => {
      const reg = res.registration;
      setMyChamberId(String(reg.id || ''));
      setMyChamberName(String(reg.chamberName || ''));
      setAdmin(prev => ({
        ...prev,
        firstName: String(reg.contactPerson || prev.firstName).split(' ')[0] || prev.firstName,
        lastName: String(reg.contactPerson || '').split(' ').slice(1).join(' ') || prev.lastName,
        title: String(reg.contactTitle || prev.title),
        phone: String(reg.phone || prev.phone),
        email: String(reg.email || prev.email),
        ward: String(reg.ward || prev.ward),
        district: String(reg.district || prev.district),
      }));
    }).catch(() => { /* no real application linked — keep placeholder so the UI still renders */ });
  }, []);

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
    if (active === 'amendments' && myChamberId) loadAmendments();
  }, [active, myChamberId]);

  async function loadAmendments() {
    setAmendLoading(true);
    try {
      const res = await chambersApi.listAmendments({ chamberId: myChamberId });
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
    if (!myChamberId) {
      setAmendMsg('No chamber application is linked to this account, so an amendment can\u2019t be submitted.');
      return;
    }
    setAmendSubmitting(true);
    setAmendMsg('');
    try {
      const fieldLabel = AMENDMENT_FIELDS.find(f => f.field === amendField)?.label || amendField;
      await chambersApi.submitAmendment({
        chamberId: myChamberId,
        chamberName: myChamberName,
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
                { label: 'Zambian Cooperatives', value: COOPERATIVES.length, icon: <Users size={20} />, color: '#00712B' },
                { label: 'Intern Coordinator', value: '1 Assigned', icon: <GraduationCap size={20} />, color: '#00712B' },
                { label: 'Pending Amendments', value: pendingCount, icon: <FilePenLine size={20} />, color: '#00712B' },
              ].map(s => (
                <div key={s.label} className="rounded-xl p-4 flex items-center gap-3" style={{backgroundColor: "#007A30", border: "1px solid rgba(255,255,255,0.07)"}}>
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
        return <ChamberInvestorsSection />;

      case 'cooperatives':
        return <ChamberCooperativesSection />;

      case 'intern-coordinator':
        return <ChamberCoordinatorSection />;

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
              <div className="mb-4 p-3 rounded-lg text-sm" style={amendMsg.includes('success') ? {backgroundColor:'#007A30',color:'#479966',border:'1px solid #47996630'} : {backgroundColor:'#200a0a',color:'#f87171',border:'1px solid #f8717130'}}>
                {amendMsg}
              </div>
            )}

            {showAmendForm && (
              <div className="rounded-xl p-6 mb-6" style={{backgroundColor:"#007A30",border:"2px solid #f59e0b50"}}>
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
              <div className="rounded-xl p-8 text-center" style={{backgroundColor:"#007A30",border:"1px solid rgba(255,255,255,0.07)"}}>
                <FilePenLine className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                <p className="text-sm text-white/38">No amendment requests yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {amendments.map(a => {
                  const isOpen = expandedAmend === a.id;
                  const statusConfig = {
                    pending:  { icon: <Clock size={13} />,        color: '#d97706', bg: '#fef3c7' },
                    approved: { icon: <CheckCircle size={13} />,  color: '#005D23', bg: '#f0fdf4' },
                    rejected: { icon: <XCircle size={13} />,      color: '#dc2626', bg: '#fef2f2' },
                  }[a.status];
                  return (
                    <div key={a.id} className="rounded-xl overflow-hidden" style={{backgroundColor:"#007A30",border:"1px solid rgba(255,255,255,0.07)"}}>
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
              <button onClick={() => (editing ? savePersonalDetails() : setEditing(true))} disabled={savingDetails} className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm" style={{ background: A, opacity: savingDetails ? 0.6 : 1 }}>
                {editing ? <><Save size={14} /> {savingDetails ? 'Saving…' : 'Save'}</> : <><Edit2 size={14} /> Edit</>}
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
                {[
                  { label: 'Current Password', value: pwCurrent, onChange: setPwCurrent },
                  { label: 'New Password', value: pwNew, onChange: setPwNew },
                  { label: 'Confirm New Password', value: pwConfirm, onChange: setPwConfirm },
                ].map(({ label, value, onChange }) => (
                  <div key={label}>
                    <label className="text-xs text-white/40 mb-1 block">{label}</label>
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
