import { API_BASE } from '@/app/lib/apiBase';
import { useState, useEffect, useCallback } from 'react';

// Safe fetch wrapper — handles non-JSON responses (e.g. rate limit plain text)
async function safeFetch(url: string, options?: RequestInit) {
  const res = await fetch(url, options);
  const ct = res.headers.get('content-type') || '';
  if (!ct.includes('application/json')) {
    const text = await res.text();
    if (res.status === 429) throw new Error('Rate limit exceeded — please wait a moment and try again.');
    if (!res.ok) throw new Error(text || `HTTP ${res.status}`);
    return { ok: res.ok, status: res.status, json: async () => ({}) };
  }
  return res;
}
import {
  CheckCircle, XCircle, Clock, ChevronDown, ChevronUp, RefreshCw,
  Copy, Eye, EyeOff, User, Users, GraduationCap, ShieldCheck,
  AlertCircle, Camera, FileText, MapPin, Phone, Mail, Calendar,
  CreditCard, Building, Search, Filter,
} from 'lucide-react';
import {
  registrationApi, RegStatus, RegStats,
  MemberReg, CoopReg, InternshipReg, AgentReg, GeneratedCredentials,
} from '../lib/api';

const A    = '#16a34a';
const NAVY = '#1e2d4a';
const BASE = API_BASE;

type TabKey = 'member' | 'cooperative' | 'internship' | 'agent';

const TABS: { key: TabKey; label: string; icon: React.ReactNode }[] = [
  { key: 'member',      label: 'Members',     icon: <User size={15} /> },
  { key: 'cooperative', label: 'Cooperatives', icon: <Users size={15} /> },
  { key: 'internship',  label: 'Interns',      icon: <GraduationCap size={15} /> },
  { key: 'agent',       label: 'Agents',       icon: <ShieldCheck size={15} /> },
];

const STATUS_CFG: Record<RegStatus, { icon: React.ReactNode; color: string; bg: string; label: string }> = {
  pending:  { icon: <Clock size={12} />,       color: '#d97706', bg: '#fef3c7', label: 'Pending' },
  approved: { icon: <CheckCircle size={12} />, color: '#16a34a', bg: '#f0fdf4', label: 'Approved' },
  rejected: { icon: <XCircle size={12} />,     color: '#dc2626', bg: '#fef2f2', label: 'Rejected' },
};

// ── Credentials box ───────────────────────────────────────────────────────────

function CredentialBox({ creds, name }: { creds: GeneratedCredentials; name: string }) {
  const [showPass, setShowPass] = useState(false);
  const [copied, setCopied] = useState('');

  function copy(text: string, key: string) {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(''), 2000);
    });
  }

  return (
    <div className="mt-4 rounded-xl border-2 overflow-hidden" style={{ borderColor: A }}>
      <div className="px-4 py-2 flex items-center gap-2" style={{ background: A }}>
        <CheckCircle size={14} className="text-white" />
        <span className="text-white text-xs font-semibold" style={{ fontFamily: 'Oswald, sans-serif', letterSpacing: '0.1em' }}>
          LOGIN CREDENTIALS — {name.toUpperCase()}
        </span>
      </div>
      <div className="bg-white px-5 py-4 space-y-3">
        <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded p-2">
          <strong>Share these with the applicant securely.</strong> Password is only shown once.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="rounded-lg border border-gray-200 p-3">
            <p className="text-xs text-gray-400 mb-1">Username</p>
            <div className="flex items-center justify-between gap-2">
              <code className="text-sm font-mono text-gray-900">{creds.username}</code>
              <button onClick={() => copy(creds.username, 'u')} className="shrink-0 text-xs flex items-center gap-1 px-2 py-1 rounded border" style={{ borderColor: A, color: A }}>
                <Copy size={11} /> {copied === 'u' ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>
          <div className="rounded-lg border border-gray-200 p-3">
            <p className="text-xs text-gray-400 mb-1">Password</p>
            <div className="flex items-center justify-between gap-2">
              <code className="text-sm font-mono text-gray-900">{showPass ? creds.password : '••••••••••'}</code>
              <div className="flex items-center gap-1">
                <button onClick={() => setShowPass(s => !s)} className="p-1.5 rounded border border-gray-300 text-gray-400">
                  {showPass ? <EyeOff size={12} /> : <Eye size={12} />}
                </button>
                <button onClick={() => copy(creds.password, 'p')} className="shrink-0 text-xs flex items-center gap-1 px-2 py-1 rounded border" style={{ borderColor: A, color: A }}>
                  <Copy size={11} /> {copied === 'p' ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="text-xs text-gray-400">
          Role: <strong className="text-gray-600">{creds.role}</strong> · Generated: {new Date(creds.generatedAt).toLocaleString()}
        </div>
        <button onClick={() => copy(`Username: ${creds.username}\nPassword: ${creds.password}\nRole: ${creds.role}`, 'all')} className="w-full text-sm py-2 rounded-lg border" style={{ borderColor: A, color: A }}>
          {copied === 'all' ? '✓ Copied all!' : 'Copy Username + Password'}
        </button>
      </div>
    </div>
  );
}

// ── Detail field ───────────────────────────────────────────────────────────────

function Field({ label, value, icon }: { label: string; value?: string | null; icon?: React.ReactNode }) {
  if (!value) return null;
  return (
    <div className="flex gap-2">
      {icon && <div className="mt-0.5 shrink-0 text-gray-400">{icon}</div>}
      <div>
        <p className="text-xs text-gray-400 mb-0.5">{label}</p>
        <p className="text-sm text-gray-800 break-words">{value}</p>
      </div>
    </div>
  );
}

// ── Selfie viewer ─────────────────────────────────────────────────────────────

function SelfieViewer({ regId, type, hasSelfie }: { regId: string; type: TabKey; hasSelfie: boolean }) {
  const [selfieUrl, setSelfieUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);

  async function load() {
    if (selfieUrl || loading) return;
    setLoading(true);
    setError('');
    try {
      const token = sessionStorage.getItem('boz_session_token');
      const res = await safeFetch(`${BASE}/registrations/${type}/${regId}/selfie`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Not found');
      const data = await res.json();
      setSelfieUrl(data.dataUrl);
    } catch {
      setError('Could not load selfie.');
    } finally {
      setLoading(false);
    }
  }

  if (!hasSelfie) {
    return <p className="text-xs text-gray-400 italic">No selfie submitted</p>;
  }

  return (
    <div>
      <button
        onClick={() => { setOpen(o => !o); if (!open) load(); }}
        className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border"
        style={{ borderColor: '#3b82f6', color: '#3b82f6' }}
      >
        <Camera size={12} />
        {open ? 'Hide Selfie' : 'View Selfie'}
      </button>
      {open && (
        <div className="mt-3">
          {loading && <p className="text-xs text-gray-400">Loading…</p>}
          {error && <p className="text-xs text-red-500">{error}</p>}
          {selfieUrl && (
            <img
              src={selfieUrl}
              alt="Applicant selfie"
              className="w-36 h-36 object-cover rounded-xl border-2 border-gray-200"
            />
          )}
        </div>
      )}
    </div>
  );
}

// ── Member detail panel ────────────────────────────────────────────────────────

function MemberDetail({ reg }: { reg: MemberReg }) {
  const docsMeta = (reg as unknown as { documentsMeta?: Record<string, { name: string; size: number } | null> }).documentsMeta;
  const documentsUploaded = (reg as unknown as { documentsUploaded?: boolean }).documentsUploaded;
  return (
    <div className="space-y-5">
      {/* Personal */}
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Personal Information</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Full Name" value={reg.fullName} icon={<User size={13} />} />
          <Field label="Phone" value={reg.phone} icon={<Phone size={13} />} />
          <Field label="Email" value={reg.email} icon={<Mail size={13} />} />
          <Field label="Date of Birth" value={(reg as unknown as { dateOfBirth?: string }).dateOfBirth} icon={<Calendar size={13} />} />
          <Field label="Gender" value={(reg as unknown as { gender?: string }).gender} icon={<User size={13} />} />
          <Field label="NRC Number" value={reg.nrcId} icon={<CreditCard size={13} />} />
          <Field label="Voter Card Number" value={reg.voterNumber} icon={<CreditCard size={13} />} />
          <Field label="Membership Type" value={reg.membershipType} />
          <Field label="Physical Address" value={reg.address} icon={<MapPin size={13} />} />
        </div>
      </div>

      {/* Location */}
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Location</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <Field label="Province" value={reg.province} />
          <Field label="District" value={reg.district} />
          <Field label="Constituency" value={reg.constituency} />
          <Field label="Ward" value={reg.ward} />
          <Field label="Polling Station" value={(reg as unknown as { pollingStation?: string }).pollingStation} />
        </div>
      </div>

      {/* Documents */}
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Documents Submitted</p>
        {documentsUploaded ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {[
              { key: 'nationalId', label: 'NRC Document' },
              { key: 'votersCard', label: "Voter's Card" },
              { key: 'proofOfAddress', label: 'Proof of Address' },
            ].map(({ key, label }) => {
              const doc = docsMeta?.[key];
              return (
                <div key={key} className="flex items-center gap-2 p-2 rounded-lg" style={{ background: doc ? '#f0fdf4' : '#fafafa', border: `1px solid ${doc ? '#bbf7d0' : '#e5e7eb'}` }}>
                  <FileText size={14} style={{ color: doc ? '#16a34a' : '#9ca3af' }} />
                  <div className="min-w-0">
                    <p className="text-xs text-gray-600">{label}</p>
                    {doc ? (
                      <p className="text-xs text-green-600 truncate">{doc.name} ({Math.round(doc.size / 1024)}KB)</p>
                    ) : (
                      <p className="text-xs text-gray-400">Not uploaded</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg p-2">
            ⚠ Documents were not submitted electronically. Request physical copies.
          </p>
        )}
      </div>

      {/* Selfie */}
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Identity Selfie</p>
        <SelfieViewer regId={reg.id} type="member" hasSelfie={!!(reg as unknown as { hasSelfie?: boolean }).hasSelfie} />
      </div>
    </div>
  );
}

// ── Cooperative detail panel ───────────────────────────────────────────────────

function CoopDetail({ reg }: { reg: CoopReg }) {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Cooperative Details</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Cooperative Name" value={reg.cooperativeName} icon={<Building size={13} />} />
          <Field label="Sector" value={reg.sector} />
          <Field label="Registration Number" value={reg.registrationNumber} icon={<CreditCard size={13} />} />
          <Field label="Chairperson" value={reg.chairpersonName} icon={<User size={13} />} />
          <Field label="Phone" value={reg.phone} icon={<Phone size={13} />} />
          <Field label="Email" value={reg.email} icon={<Mail size={13} />} />
          <Field label="District" value={reg.district} icon={<MapPin size={13} />} />
          <Field label="Province" value={reg.province} />
          <Field label="Members" value={reg.numberOfMembers ? String(reg.numberOfMembers) : undefined} icon={<Users size={13} />} />
          <Field label="Address" value={reg.address} />
        </div>
      </div>
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Selfie</p>
        <SelfieViewer regId={reg.id} type="cooperative" hasSelfie={!!(reg as unknown as { hasSelfie?: boolean }).hasSelfie} />
      </div>
    </div>
  );
}

// ── Internship detail panel ────────────────────────────────────────────────────

function InternDetail({ reg }: { reg: InternshipReg }) {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Applicant Details</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Full Name" value={reg.fullName} icon={<User size={13} />} />
          <Field label="Phone" value={reg.phone} icon={<Phone size={13} />} />
          <Field label="Email" value={reg.email} icon={<Mail size={13} />} />
          <Field label="University" value={reg.university} icon={<Building size={13} />} />
          <Field label="Year of Study" value={reg.yearOfStudy ? `Year ${reg.yearOfStudy}` : undefined} />
          <Field label="Program" value={reg.program} />
          <Field label="Membership Number" value={reg.membershipNumber} icon={<CreditCard size={13} />} />
        </div>
      </div>
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Selfie</p>
        <SelfieViewer regId={reg.id} type="internship" hasSelfie={!!(reg as unknown as { hasSelfie?: boolean }).hasSelfie} />
      </div>
    </div>
  );
}

// ── Agent detail panel ────────────────────────────────────────────────────────

function AgentDetail({ reg }: { reg: AgentReg }) {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Agent Details</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Full Name" value={reg.fullName} icon={<User size={13} />} />
          <Field label="Phone" value={reg.phone} icon={<Phone size={13} />} />
          <Field label="Email" value={reg.email} icon={<Mail size={13} />} />
          <Field label="NRC Number" value={reg.nrcId} icon={<CreditCard size={13} />} />
          <Field label="Polling Station" value={reg.pollingStation} icon={<MapPin size={13} />} />
          <Field label="Constituency" value={reg.constituency} />
          <Field label="District" value={reg.district} />
          <Field label="Province" value={reg.province} />
          <Field label="Membership Number" value={reg.membershipNumber} icon={<CreditCard size={13} />} />
        </div>
      </div>
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Selfie</p>
        <SelfieViewer regId={reg.id} type="agent" hasSelfie={!!(reg as unknown as { hasSelfie?: boolean }).hasSelfie} />
      </div>
    </div>
  );
}

// ── Registration row ──────────────────────────────────────────────────────────

type AnyReg = MemberReg | CoopReg | InternshipReg | AgentReg;

function RegRow({
  reg,
  type,
  onDecision,
}: {
  reg: AnyReg;
  type: TabKey;
  onDecision: (id: string, status: RegStatus, notes: string) => Promise<GeneratedCredentials | null>;
}) {
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState('');
  const [acting, setActing] = useState(false);
  const [freshCreds, setFreshCreds] = useState<GeneratedCredentials | null>(null);
  const [actionMsg, setActionMsg] = useState('');
  const cfg = STATUS_CFG[reg.status];

  const displayName =
    type === 'cooperative' ? (reg as CoopReg).cooperativeName : (reg as MemberReg).fullName;

  const subLine =
    type === 'member'       ? `${(reg as MemberReg).membershipType || 'Standard'} · ${(reg as MemberReg).province || ''}`
    : type === 'cooperative'  ? `${(reg as CoopReg).sector || ''} · ${(reg as CoopReg).district || ''}`
    : type === 'internship'   ? `${(reg as InternshipReg).university || ''} · Yr ${(reg as InternshipReg).yearOfStudy || '?'}`
    : `${(reg as AgentReg).pollingStation || ''}`;

  const hasSelfie = !!(reg as unknown as { hasSelfie?: boolean }).hasSelfie;

  async function decide(status: RegStatus) {
    setActing(true);
    setActionMsg('');
    const creds = await onDecision(reg.id, status, note);
    if (creds) setFreshCreds(creds);
    setActionMsg(status === 'approved' ? 'Approved — credentials generated.' : 'Application rejected.');
    setActing(false);
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
      {/* Row header */}
      <button
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors"
        onClick={() => setOpen(o => !o)}
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className="flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full font-semibold shrink-0" style={{ color: cfg.color, background: cfg.bg }}>
            {cfg.icon} {cfg.label}
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-800 truncate">{displayName}</p>
            <p className="text-xs text-gray-400 truncate">{subLine}</p>
          </div>
          {hasSelfie && (
            <span className="hidden sm:flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-200 shrink-0">
              <Camera size={10} /> Photo
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 shrink-0 ml-3">
          <span className="text-xs text-gray-400">{new Date(reg.submittedAt).toLocaleDateString()}</span>
          {open ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
        </div>
      </button>

      {/* Expanded panel */}
      {open && (
        <div className="border-t border-gray-100 px-5 py-5 space-y-5" style={{ background: '#fafafa' }}>

          {/* Type-specific detail */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            {type === 'member'      && <MemberDetail reg={reg as MemberReg} />}
            {type === 'cooperative' && <CoopDetail   reg={reg as CoopReg} />}
            {type === 'internship'  && <InternDetail  reg={reg as InternshipReg} />}
            {type === 'agent'       && <AgentDetail   reg={reg as AgentReg} />}
          </div>

          {/* Admin note on record */}
          {reg.notes && (
            <div className="p-3 rounded-lg text-xs bg-blue-50 border border-blue-200 text-blue-800">
              <strong>Admin note:</strong> {reg.notes}
            </div>
          )}

          {/* Review meta */}
          {reg.reviewedBy && (
            <p className="text-xs text-gray-400">
              Reviewed by <strong className="text-gray-600">{reg.reviewedBy}</strong>
              {reg.reviewedAt && <> on {new Date(reg.reviewedAt).toLocaleString()}</>}
            </p>
          )}

          {/* Action feedback */}
          {actionMsg && (
            <div className="p-3 rounded-lg text-xs" style={{ background: freshCreds ? '#f0fdf4' : '#fef2f2', color: freshCreds ? '#166534' : '#dc2626', border: `1px solid ${freshCreds ? '#bbf7d0' : '#fecaca'}` }}>
              {actionMsg}
            </div>
          )}

          {/* Fresh credentials */}
          {freshCreds && <CredentialBox creds={freshCreds} name={displayName} />}

          {/* Decision controls — only while pending */}
          {reg.status === 'pending' && !freshCreds && (
            <div className="pt-1 space-y-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Admin note (optional)</label>
                <textarea
                  rows={2}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none"
                  placeholder="Reason for approval / rejection…"
                  value={note}
                  onChange={e => setNote(e.target.value)}
                />
              </div>
              <div className="flex gap-3 flex-wrap">
                <button
                  disabled={acting}
                  onClick={() => decide('approved')}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-white text-sm font-semibold disabled:opacity-50 transition-opacity"
                  style={{ background: '#16a34a' }}
                >
                  <CheckCircle size={15} />
                  {acting ? 'Processing…' : 'Approve & Generate Credentials'}
                </button>
                <button
                  disabled={acting}
                  onClick={() => decide('rejected')}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-white text-sm font-semibold disabled:opacity-50 transition-opacity"
                  style={{ background: '#dc2626' }}
                >
                  <XCircle size={15} />
                  {acting ? 'Processing…' : 'Reject Application'}
                </button>
              </div>
            </div>
          )}

          {/* Already approved */}
          {reg.status === 'approved' && !freshCreds && (
            <div className="p-3 rounded-lg text-xs text-green-800 bg-green-50 border border-green-200">
              ✓ This application was approved. Credentials were issued at approval time.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Stat card ─────────────────────────────────────────────────────────────────

function StatCard({ label, pending, approved, rejected, total, active }: {
  label: string; pending: number; approved: number; rejected: number; total: number; active: boolean;
}) {
  return (
    <div className="bg-white rounded-xl p-4 border transition-all" style={{ borderColor: active ? A : '#e5e7eb', boxShadow: active ? `0 0 0 2px ${A}30` : 'none' }}>
      <p className="text-xs text-gray-500 font-medium mb-3">{label}</p>
      <p className="text-3xl font-bold mb-2" style={{ color: NAVY }}>{total}</p>
      <div className="flex gap-3 text-xs">
        <span className="text-amber-600 font-medium">{pending} pending</span>
        <span className="text-green-600">✓ {approved}</span>
        <span className="text-red-500">✗ {rejected}</span>
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export function RegistrationApprovalAdmin() {
  const [activeTab, setActiveTab] = useState<TabKey>('member');
  const [statusFilter, setStatusFilter] = useState<RegStatus | 'all'>('pending');
  const [search, setSearch] = useState('');
  const [stats, setStats] = useState<RegStats | null>(null);
  const [records, setRecords] = useState<AnyReg[]>([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    setMsg('');
    try {
      const sf = statusFilter === 'all' ? undefined : statusFilter;
      const [sr, rr] = await Promise.all([
        registrationApi.getStats(),
        activeTab === 'member'      ? registrationApi.listMembers(sf)
        : activeTab === 'cooperative' ? registrationApi.listCoops(sf)
        : activeTab === 'internship'  ? registrationApi.listInterns(sf)
        : registrationApi.listAgents(sf),
      ]);
      if (sr.success) setStats(sr.stats);
      const list = (rr as { registrations?: AnyReg[]; applications?: AnyReg[] }).registrations
               || (rr as { registrations?: AnyReg[]; applications?: AnyReg[] }).applications
               || [];
      setRecords(list);
    } catch {
      setMsg('Could not load registrations. Please check your admin session.');
    } finally {
      setLoading(false);
    }
  }, [activeTab, statusFilter]);

  useEffect(() => { loadData(); }, [loadData]);

  async function handleDecision(id: string, status: RegStatus, notes: string): Promise<GeneratedCredentials | null> {
    try {
      let res: { credentials?: GeneratedCredentials | null } = {};
      if (activeTab === 'member')      res = await registrationApi.approveMember(id, status, notes);
      else if (activeTab === 'cooperative') res = await registrationApi.approveCoop(id, status, notes);
      else if (activeTab === 'internship')  res = await registrationApi.approveIntern(id, status, notes);
      else                                  res = await registrationApi.approveAgent(id, status, notes);
      setMsg(status === 'approved' ? '✓ Registration approved. Credentials generated.' : '✗ Registration rejected.');
      await loadData();
      return res.credentials || null;
    } catch {
      setMsg('Failed to process decision. Please try again.');
      return null;
    }
  }

  // Client-side search filter
  const filtered = records.filter(r => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const name = (r as MemberReg).fullName || (r as CoopReg).cooperativeName || '';
    const phone = (r as MemberReg).phone || '';
    const email = (r as MemberReg).email || '';
    return name.toLowerCase().includes(q) || phone.includes(q) || email.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold" style={{ fontFamily: 'Oswald, sans-serif', color: NAVY, letterSpacing: '0.04em' }}>
            REGISTRATION APPROVALS
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Review applications, approve registrations, and issue login credentials.
          </p>
        </div>
        <button onClick={loadData} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm border border-gray-300 hover:bg-gray-50 transition-colors">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Alert */}
      {msg && (
        <div className="p-3 rounded-lg text-sm flex items-center gap-2" style={{ background: msg.startsWith('✓') ? '#f0fdf4' : msg.startsWith('✗') ? '#fef2f2' : '#eff6ff', color: msg.startsWith('✓') ? '#166534' : msg.startsWith('✗') ? '#dc2626' : '#1d4ed8', border: `1px solid ${msg.startsWith('✓') ? '#bbf7d0' : msg.startsWith('✗') ? '#fecaca' : '#bfdbfe'}` }}>
          <AlertCircle size={14} /> {msg}
        </div>
      )}

      {/* Stats grid */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {TABS.map(t => (
            <div key={t.key} onClick={() => setActiveTab(t.key)} className="cursor-pointer">
              <StatCard
                label={t.label}
                active={activeTab === t.key}
                {...stats[t.key]}
              />
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap border-b border-gray-200 pb-1">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-t-lg text-sm font-medium transition-colors"
            style={{
              background: activeTab === t.key ? A : 'transparent',
              color: activeTab === t.key ? '#fff' : '#6b7280',
              borderBottom: activeTab === t.key ? `2px solid ${A}` : '2px solid transparent',
            }}
          >
            {t.icon} {t.label}
            {stats && stats[t.key].pending > 0 && (
              <span className="ml-1 text-xs rounded-full px-1.5 py-0.5 font-bold" style={{ background: activeTab === t.key ? 'rgba(255,255,255,0.3)' : '#fef3c7', color: activeTab === t.key ? '#fff' : '#92400e' }}>
                {stats[t.key].pending}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Filters row */}
      <div className="flex gap-3 flex-wrap items-center">
        {/* Status filter */}
        <div className="flex gap-1 items-center">
          <Filter size={13} className="text-gray-400" />
          {(['all', 'pending', 'approved', 'rejected'] as const).map(f => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors"
              style={{
                background: statusFilter === f ? NAVY : '#fff',
                color: statusFilter === f ? '#fff' : '#6b7280',
                borderColor: statusFilter === f ? NAVY : '#d1d5db',
              }}
            >
              {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative ml-auto">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, phone, email…"
            className="pl-8 pr-3 py-1.5 border border-gray-300 rounded-lg text-sm w-60"
          />
        </div>
      </div>

      {/* Records list */}
      {loading ? (
        <div className="text-center py-12">
          <RefreshCw size={24} className="animate-spin mx-auto mb-2 text-gray-300" />
          <p className="text-sm text-gray-400">Loading registrations…</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
          <CheckCircle className="w-12 h-12 mx-auto mb-3 text-gray-200" />
          <p className="text-sm font-medium text-gray-400">
            {search ? `No results for "${search}"` : `No ${statusFilter === 'all' ? '' : statusFilter + ' '}${activeTab} registrations.`}
          </p>
          {statusFilter !== 'all' && !search && (
            <button onClick={() => setStatusFilter('all')} className="mt-3 text-xs underline text-gray-400">Show all</button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-xs text-gray-400">{filtered.length} record{filtered.length !== 1 ? 's' : ''}</p>
          {filtered.map(r => (
            <RegRow key={r.id} reg={r} type={activeTab} onDecision={handleDecision} />
          ))}
        </div>
      )}
    </div>
  );
}
