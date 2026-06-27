import { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router';
import {
  Phone, User, MapPin, FileText, CheckCircle2, ArrowRight, ArrowLeft,
  Upload, X, Eye, Loader2, ShieldCheck, AlertCircle, ChevronDown, Bell,
  Briefcase, Users,
} from 'lucide-react';
import { provinces } from '../../data/mockData';
import { agentApi, getToken } from '../../lib/api';
import { apiBaseUrl } from '../../../../utils/supabase/info';
import { sendFirebaseOTP, verifyFirebaseOTP, type ConfirmationResult as FirebaseConfirmation } from '../../lib/firebase';

// ── Constants ─────────────────────────────────────────────────────────────────

const GREEN  = '#007A30';
const RED    = '#dc2626';
const DARK   = '#0d1f14';
const BACKEND = apiBaseUrl;

const STEPS = [
  { num: 1, label: 'Phone Verification',  icon: Phone },
  { num: 2, label: 'Role & Area',          icon: Briefcase },
  { num: 3, label: 'Personal Information', icon: User },
  { num: 4, label: 'Assignment Area',      icon: MapPin },
  { num: 5, label: 'Documents',            icon: FileText },
  { num: 6, label: 'Review & Submit',      icon: CheckCircle2 },
];

// ── Role tier configuration ───────────────────────────────────────────────────

const ROLES = [
  { key: 'super_national',  label: 'Super National Manager',  limit: 1,     scopeType: 'national',       desc: '1 position — National oversight of all election results' },
  { key: 'national',        label: 'National Manager',        limit: 10,    scopeType: 'national',       desc: '10 positions — National results management' },
  { key: 'provincial',      label: 'Provincial Manager',      limit: 10,    scopeType: 'province',       desc: '10 positions — One per province' },
  { key: 'district',        label: 'District Manager',        limit: 116,   scopeType: 'district',       desc: '116 positions — One per district' },
  { key: 'constituency',    label: 'Constituency Manager',    limit: 226,   scopeType: 'constituency',   desc: '226 positions — One per constituency' },
  { key: 'ward',            label: 'Ward Manager',            limit: 1858,  scopeType: 'ward',           desc: '1,858 positions — One per ward' },
  { key: 'agent',           label: 'Polling Agent',           limit: 13529, scopeType: 'polling_station',desc: '13,529 positions — One per polling station' },
] as const;

type RoleKey = typeof ROLES[number]['key'];

const GRADES = ['Grade 8','Grade 9','Grade 10','Grade 11','Grade 12','Certificate','Diploma','Degree','Masters','PhD','Other'];

const DOCS = [
  { key: 'grade12',     label: 'Grade 12 Certificate',                              required: true  },
  { key: 'nrc',         label: 'NRC (National Registration Card)',                  required: true  },
  { key: 'voterCard',   label: "Voter's Card",                                      required: true  },
  { key: 'proofAddress',label: 'Proof of Address',                                  required: true  },
  { key: 'headTeacher', label: 'Original Letter from Head Teacher / Principal',     required: false },
  { key: 'police',      label: 'Police Clearance (required for Tallying Centre)',   required: false },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (raw.startsWith('+')) return raw.replace(/\s/g, '');
  if (digits.startsWith('0') && digits.length === 10) return '+260' + digits.slice(1);
  if (digits.startsWith('260') && digits.length === 12) return '+' + digits;
  if (digits.length === 9) return '+260' + digits;
  return raw;
}

async function fileToBase64(file: File): Promise<string> {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload  = () => res(r.result as string);
    r.onerror = rej;
    r.readAsDataURL(file);
  });
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StepIndicator({ step }: { step: number }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-10 overflow-x-auto pb-2">
      {STEPS.map((s, i) => {
        const done    = step > s.num;
        const current = step === s.num;
        const Icon    = s.icon;
        return (
          <div key={s.num} className="flex items-center">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 shrink-0"
                style={{
                  backgroundColor: done ? GREEN : current ? GREEN : '#e5e7eb',
                  border: current ? `3px solid ${GREEN}` : done ? 'none' : '2px solid #d1d5db',
                }}
              >
                {done
                  ? <CheckCircle2 className="w-5 h-5 text-white" />
                  : <Icon className="w-4 h-4" style={{ color: current ? '#fff' : '#9ca3af' }} />}
              </div>
              <span
                className="text-xs font-medium text-center hidden sm:block w-20 leading-tight"
                style={{ color: current || done ? GREEN : '#9ca3af' }}
              >
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className="h-0.5 w-8 sm:w-12 mx-1 shrink-0 mt-[-14px] sm:mt-[-24px] transition-all duration-300"
                style={{ backgroundColor: step > s.num ? GREEN : '#e5e7eb' }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-semibold mb-1.5 text-gray-700">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls = "w-full px-3.5 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:border-transparent transition-all";
const inputStyle = { '--tw-ring-color': GREEN } as React.CSSProperties;

function SelectField({ value, onChange, children, disabled }: {
  value: string; onChange: (v: string) => void; children: React.ReactNode; disabled?: boolean;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        disabled={disabled}
        className={`${inputCls} appearance-none pr-10 disabled:bg-gray-100 disabled:text-gray-400`}
        style={inputStyle}
      >
        {children}
      </select>
      <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
    </div>
  );
}

// ── Document Upload Card ──────────────────────────────────────────────────────

function DocUploadCard({
  doc, file, onUpload, onRemove,
}: {
  doc: typeof DOCS[0];
  file: File | null;
  onUpload: (f: File) => void;
  onRemove: () => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFile = (f: File) => {
    onUpload(f);
    if (f.type.startsWith('image/')) {
      const r = new FileReader();
      r.onload = () => setPreview(r.result as string);
      r.readAsDataURL(f);
    } else {
      setPreview(null);
    }
  };

  return (
    <div
      className="rounded-xl border-2 border-dashed p-4 flex flex-col gap-3 transition-colors"
      style={{ borderColor: file ? GREEN : '#d1d5db', backgroundColor: file ? '#f0fdf4' : '#fafafa' }}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-gray-800">{doc.label}</p>
          {!doc.required && (
            <p className="text-xs text-gray-500 mt-0.5">Optional</p>
          )}
        </div>
        {file && (
          <button onClick={onRemove} className="p-1 rounded-lg hover:bg-red-50 text-red-400 shrink-0">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {preview ? (
        <img src={preview} alt="preview" className="w-full h-28 object-cover rounded-lg" />
      ) : file ? (
        <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg border border-gray-200">
          <FileText className="w-4 h-4 text-gray-500 shrink-0" />
          <span className="text-xs text-gray-700 truncate">{file.name}</span>
          <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 ml-auto" />
        </div>
      ) : null}

      <button
        onClick={() => ref.current?.click()}
        className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
        style={{ backgroundColor: file ? '#f0fdf4' : '#f3f4f6', color: file ? GREEN : '#374151', border: `1px solid ${file ? '#bbf7d0' : '#e5e7eb'}` }}
      >
        <Upload className="w-4 h-4" />
        {file ? 'Replace' : 'Upload'}
      </button>
      <input
        ref={ref}
        type="file"
        accept="image/*,.pdf"
        className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ''; }}
      />
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function PollingAgentRegistration() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  // Security: honeypot + timing (bot detection)
  const [honeypot, setHoneypot] = useState('');
  const formStartTime = useState(() => Date.now())[0];

  // Step 1 — Phone
  const [phone, setPhone] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpId, setOtpId] = useState('');
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [firebaseConfirmation, setFirebaseConfirmation] = useState<FirebaseConfirmation | null>(null);
  const [otpError, setOtpError] = useState('');
  const [notifyWhenOpen, setNotifyWhenOpen] = useState(false);

  // Step 2 — Role & Area selection
  const [selectedRole, setSelectedRole] = useState<RoleKey | ''>('');
  const [capacity, setCapacity] = useState<Record<string, { limit: number; current: number; remaining: number; full: boolean }>>({});
  const [capacityLoading, setCapacityLoading] = useState(false);

  // Load capacity on mount
  useEffect(() => {
    setCapacityLoading(true);
    fetch(`${BACKEND}/registrations/agent/capacity`)
      .then(r => r.json())
      .then(data => { if (data.capacity) setCapacity(data.capacity); })
      .catch(() => {
        // Backend not deployed — set all to empty (will show limits only)
        const mock: typeof capacity = {};
        ROLES.forEach(r => { mock[r.key] = { limit: r.limit, current: 0, remaining: r.limit, full: false }; });
        setCapacity(mock);
      })
      .finally(() => setCapacityLoading(false));
  }, []);

  // Step 3 — Personal
  const [personal, setPersonal] = useState({
    firstName: '', lastName: '', dateOfBirth: '', placeOfBirth: '',
    chief: '', town: '', grade: '', email: '', address: '',
  });

  // Step 4 — Assignment Area (real ECZ data — depth depends on role)
  const [loc, setLoc] = useState({
    provinceId: '', districtId: '', constituencyId: '', wardId: '', pollingStationId: '', pollingStationName: '',
  });

  const selProvince     = provinces.find(p => p.id === loc.provinceId);
  const selDistrict     = selProvince?.districts.find(d => d.id === loc.districtId);
  const selConstituency = selDistrict?.constituencies.find(c => c.id === loc.constituencyId);
  const selWard         = selConstituency?.wards.find(w => w.id === loc.wardId);

  function setProvince(id: string) {
    setLoc({ provinceId: id, districtId: '', constituencyId: '', wardId: '', pollingStationId: '', pollingStationName: '' });
  }
  function setDistrict(id: string) {
    setLoc(l => ({ ...l, districtId: id, constituencyId: '', wardId: '', pollingStationId: '', pollingStationName: '' }));
  }
  function setConstituency(id: string) {
    setLoc(l => ({ ...l, constituencyId: id, wardId: '', pollingStationId: '', pollingStationName: '' }));
  }
  function setWard(id: string) {
    setLoc(l => ({ ...l, wardId: id, pollingStationId: '', pollingStationName: '' }));
  }
  function setPollingStation(id: string) {
    const ps = selWard?.pollingStations.find(s => s.id === id);
    setLoc(l => ({ ...l, pollingStationId: id, pollingStationName: ps?.name ?? '' }));
  }

  // Step 4 — Documents
  const [docs, setDocs] = useState<Record<string, File | null>>({
    grade12: null, nrc: null, voterCard: null, proofAddress: null, headTeacher: null, police: null,
  });

  // ── OTP flow ──────────────────────────────────────────────────────────────

  // Track whether backend is reachable
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);
  const [devCode, setDevCode] = useState('');

  // ── OTP via Firebase Phone Authentication ─────────────────────────────────
  const sendOtp = async () => {
    const formatted = formatPhone(phone);
    if (!/^\+260[976]\d{8}$/.test(formatted)) {
      setOtpError('Enter a valid Zambian mobile number (e.g. 0966 123 456)');
      return;
    }
    setOtpLoading(true); setOtpError('');
    try {
      const result = await sendFirebaseOTP(formatted, 'firebase-recaptcha');
      if (result.success && result.confirmationResult) {
        setFirebaseConfirmation(result.confirmationResult);
        setOtpSent(true);
        setBackendOnline(true);
      } else {
        setOtpError(result.error ?? 'Failed to send SMS');
      }
    } catch (e) {
      setOtpError(e instanceof Error ? e.message : 'Failed to send SMS');
    } finally {
      setOtpLoading(false);
    }
  };

  const verifyOtp = async () => {
    setOtpLoading(true); setOtpError('');
    try {
      if (!firebaseConfirmation) {
        setOtpError('Session expired. Please request a new code.');
        return;
      }
      const result = await verifyFirebaseOTP(firebaseConfirmation, otpCode);
      if (result.success) {
        setPhoneVerified(true);
      } else {
        setOtpError(result.error ?? 'Incorrect code. Please try again.');
      }
    } catch (e) {
      setOtpError(e instanceof Error ? e.message : 'Verification failed');
    } finally {
      setOtpLoading(false);
    }
  };

  // ── Validation ────────────────────────────────────────────────────────────

  const roleConfig = ROLES.find(r => r.key === selectedRole);
  const roleCap = selectedRole ? capacity[selectedRole] : null;

  // Which area fields are required based on role scope
  function areaValid(): boolean {
    if (!selectedRole) return false;
    const scope = roleConfig?.scopeType;
    if (scope === 'national') return true;
    if (scope === 'province') return !!loc.provinceId;
    if (scope === 'district') return !!(loc.provinceId && loc.districtId);
    if (scope === 'constituency') return !!(loc.provinceId && loc.districtId && loc.constituencyId);
    if (scope === 'ward') return !!(loc.provinceId && loc.districtId && loc.constituencyId && loc.wardId);
    if (scope === 'polling_station') return !!(loc.provinceId && loc.districtId && loc.constituencyId && loc.wardId && loc.pollingStationId);
    return false;
  }

  function canAdvance(): boolean {
    if (step === 1) return phoneVerified;
    if (step === 2) return !!(selectedRole && !roleCap?.full);
    if (step === 3) return !!(personal.firstName && personal.lastName && personal.dateOfBirth && personal.grade && personal.email && personal.address);
    if (step === 4) return areaValid();
    if (step === 5) return !!(docs.grade12 && docs.nrc && docs.voterCard && docs.proofAddress);
    return true;
  }

  // ── Submit ────────────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    // Bot detection: honeypot filled or form completed impossibly fast
    if (honeypot.length > 0 || Date.now() - formStartTime < 3000) {
      setSubmitted(true); // Silently pretend success to fool bots
      return;
    }
    setSubmitting(true); setError('');
    try {
      const uploads: Record<string, string> = {};
      for (const [key, file] of Object.entries(docs)) {
        if (file) uploads[key] = await fileToBase64(file);
      }

      const province     = provinces.find(p => p.id === loc.provinceId)?.name ?? '';
      const district     = selProvince?.districts.find(d => d.id === loc.districtId)?.name ?? '';
      const constituency = selDistrict?.constituencies.find(c => c.id === loc.constituencyId)?.name ?? '';
      const ward         = selConstituency?.wards.find(w => w.id === loc.wardId)?.name ?? '';

      // Derive scopeId and scopeName from the selected role's area depth
      const scope = roleConfig?.scopeType;
      let scopeId = '';
      let scopeName = '';
      if (scope === 'national')         { scopeId = 'national'; scopeName = 'National'; }
      else if (scope === 'province')    { scopeId = loc.provinceId; scopeName = province; }
      else if (scope === 'district')    { scopeId = loc.districtId; scopeName = district; }
      else if (scope === 'constituency'){ scopeId = loc.constituencyId; scopeName = constituency; }
      else if (scope === 'ward')        { scopeId = loc.wardId; scopeName = ward; }
      else if (scope === 'polling_station') { scopeId = loc.pollingStationId; scopeName = loc.pollingStationName; }

      const payload = {
        // Role & assignment
        role:               selectedRole,
        roleLabel:          roleConfig?.label ?? '',
        scopeType:          scope ?? '',
        scopeId,
        scopeName,
        // Personal
        firstName:          personal.firstName,
        lastName:           personal.lastName,
        fullName:           `${personal.firstName} ${personal.lastName}`,
        dateOfBirth:        personal.dateOfBirth,
        placeOfBirth:       personal.placeOfBirth,
        chief:              personal.chief,
        town:               personal.town,
        grade:              personal.grade,
        email:              personal.email,
        phone:              formatPhone(phone),
        physicalAddress:    personal.address,
        cellNumber:         formatPhone(phone),
        notifyWhenOpen,
        // Location
        provinceId:         loc.provinceId,
        province,
        districtId:         loc.districtId,
        district,
        constituencyId:     loc.constituencyId,
        constituency,
        wardId:             loc.wardId,
        ward,
        pollingStationId:   loc.pollingStationId,
        pollingStationName: loc.pollingStationName,
        availability:       'election-day',
        // Documents (base64)
        documents: uploads,
      };

      try {
        const res = await fetch(`${BACKEND}/registrations/agent`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (res.status === 409) throw new Error(data.error ?? 'Position already filled');
        if (!res.ok) throw new Error(data.error ?? 'Submission failed');
      } catch (e) {
        if (e instanceof Error && e.message.includes('filled')) throw e;
        // Backend not deployed — save to localStorage queue
        const queue = JSON.parse(localStorage.getItem('boz_agent_applications') ?? '[]');
        queue.push({ ...payload, submittedAt: new Date().toISOString(), synced: false });
        localStorage.setItem('boz_agent_applications', JSON.stringify(queue));
      }

      setSubmitted(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Success screen ────────────────────────────────────────────────────────

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: '#f0fdf4' }}>
        <div className="bg-white rounded-3xl shadow-xl p-10 max-w-md w-full text-center">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5" style={{ backgroundColor: '#dcfce7' }}>
            <CheckCircle2 className="w-10 h-10" style={{ color: GREEN }} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Oswald, sans-serif' }}>Application Submitted!</h2>
          <p className="text-gray-600 mb-6 leading-relaxed">
            Thank you, <strong>{personal.firstName}</strong>. Your polling agent application has been received.
            Our team will review your documents and contact you on <strong>{formatPhone(phone)}</strong>.
          </p>
          <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm text-green-800 mb-6 text-left">
            <p className="font-semibold mb-1">Registered for:</p>
            <p>{loc.pollingStationName}</p>
            <p className="text-green-600 text-xs mt-0.5">
              {selWard?.name} · {selConstituency?.name} · {selDistrict?.name} · {selProvince?.name} Province
            </p>
          </div>
          <button
            onClick={() => navigate('/')}
            className="w-full py-3 rounded-xl font-bold text-white transition-all"
            style={{ backgroundColor: GREEN }}
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  // ── Main render ───────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f0fdf4' }}>
      {/* Header */}
      <div style={{ background: `linear-gradient(135deg, ${GREEN} 0%, #005a22 100%)` }} className="px-4 py-8 text-center text-white">
        <div className="flex items-center justify-center gap-2 mb-2">
          <ShieldCheck className="w-6 h-6" />
          <span className="text-sm font-semibold tracking-widest uppercase" style={{ fontFamily: 'Oswald, sans-serif', letterSpacing: '0.2em' }}>
            Build One Zambia
          </span>
        </div>
        <h1 className="text-3xl font-bold mb-1" style={{ fontFamily: 'Oswald, sans-serif' }}>Polling Agent Application</h1>
        <p className="text-green-200 text-sm">Zambia 2026 General Election · 14 August 2031</p>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <StepIndicator step={step} />

        <div className="bg-white rounded-3xl shadow-lg p-6 sm:p-8">

          {/* reCAPTCHA container (invisible) */}
          <div id="firebase-recaptcha" />

          {/* Honeypot field — hidden from humans, filled by bots */}
          <div aria-hidden="true" style={{ position: 'absolute', left: '-9999px', width: '1px', height: '1px', overflow: 'hidden' }}>
            <label htmlFor="website">Website</label>
            <input
              id="website"
              name="website"
              type="text"
              value={honeypot}
              onChange={e => setHoneypot(e.target.value)}
              tabIndex={-1}
              autoComplete="off"
            />
          </div>

          {/* ── STEP 1: Phone Verification ── */}
          {step === 1 && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#dcfce7' }}>
                  <Phone className="w-5 h-5" style={{ color: GREEN }} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Phone Verification</h2>
                  <p className="text-sm text-gray-500">Enter your Zambian mobile number to receive a verification code</p>
                </div>
              </div>

              {!phoneVerified ? (
                <div className="space-y-4">
                  <Field label="Mobile Number" required>
                    <div className="flex gap-2">
                      <div className="flex items-center px-3.5 bg-gray-100 border border-gray-300 rounded-xl text-sm text-gray-600 shrink-0">
                        🇿🇲 +260
                      </div>
                      <input
                        type="tel"
                        placeholder="966 123 456"
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        className={inputCls + " flex-1"}
                        style={inputStyle}
                      />
                    </div>
                  </Field>

                  {!otpSent ? (
                    <button
                      onClick={sendOtp}
                      disabled={otpLoading || !phone}
                      className="w-full py-3.5 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                      style={{ backgroundColor: GREEN }}
                    >
                      {otpLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Phone className="w-4 h-4" />}
                      Send Verification Code
                    </button>
                  ) : (
                    <div className="space-y-4">
                      {backendOnline === false ? (
                        <div className="bg-amber-50 border border-amber-300 rounded-xl px-4 py-3 text-sm text-amber-800">
                          <p className="font-semibold mb-1">Preview Mode — Backend not yet deployed</p>
                          <p>Your verification code is: <strong className="text-2xl tracking-widest font-mono">{devCode}</strong></p>
                          <p className="text-xs mt-1 text-amber-600">Enter this code below to continue. SMS will work once the backend is deployed.</p>
                        </div>
                      ) : (
                        <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm text-green-800">
                          A 6-digit code was sent to <strong>{formatPhone(phone)}</strong>
                        </div>
                      )}
                      <Field label="Verification Code" required>
                        <input
                          type="text"
                          inputMode="numeric"
                          maxLength={6}
                          placeholder="000 000"
                          value={otpCode}
                          onChange={e => setOtpCode(e.target.value.replace(/\D/g, ''))}
                          className={inputCls + " text-center text-2xl tracking-[0.5em] font-mono"}
                          style={inputStyle}
                        />
                      </Field>
                      <button
                        onClick={verifyOtp}
                        disabled={otpLoading || otpCode.length < 6}
                        className="w-full py-3.5 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                        style={{ backgroundColor: GREEN }}
                      >
                        {otpLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                        Verify Code
                      </button>
                      <button onClick={() => { setOtpSent(false); setOtpCode(''); }} className="w-full text-sm text-gray-500 underline">
                        Change number
                      </button>
                    </div>
                  )}

                  {otpError && (
                    <div className="flex items-center gap-2 px-3 py-2.5 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                      <AlertCircle className="w-4 h-4 shrink-0" />{otpError}
                    </div>
                  )}

                  {/* Notification opt-in */}
                  <label className="flex items-start gap-3 cursor-pointer mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <input
                      type="checkbox"
                      checked={notifyWhenOpen}
                      onChange={e => setNotifyWhenOpen(e.target.checked)}
                      className="mt-0.5 w-4 h-4 rounded accent-green-600"
                    />
                    <div>
                      <p className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                        <Bell className="w-3.5 h-3.5" style={{ color: GREEN }} />
                        Notify me when applications open
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Receive an SMS when the polling agent registration officially opens.
                      </p>
                    </div>
                  </label>
                </div>
              ) : (
                <div className="text-center py-6">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#dcfce7' }}>
                    <CheckCircle2 className="w-8 h-8" style={{ color: GREEN }} />
                  </div>
                  <p className="text-lg font-bold text-gray-900">Number Verified!</p>
                  <p className="text-sm text-gray-500 mt-1">{formatPhone(phone)}</p>
                </div>
              )}
            </div>
          )}

          {/* ── STEP 2: Role & Area Selection ── */}
          {step === 2 && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#dcfce7' }}>
                  <Briefcase className="w-5 h-5" style={{ color: GREEN }} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Select Your Role</h2>
                  <p className="text-sm text-gray-500">Choose the position you are applying for</p>
                </div>
              </div>

              {capacityLoading ? (
                <div className="flex items-center justify-center py-10 gap-3 text-gray-500">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Checking available positions…</span>
                </div>
              ) : (
                <div className="space-y-3">
                  {ROLES.map(role => {
                    const cap = capacity[role.key];
                    const isFull = cap?.full ?? false;
                    const isSelected = selectedRole === role.key;
                    const remaining = cap?.remaining ?? role.limit;
                    const pct = cap ? Math.round((cap.current / cap.limit) * 100) : 0;

                    return (
                      <button
                        key={role.key}
                        onClick={() => { if (!isFull) setSelectedRole(role.key as RoleKey); }}
                        disabled={isFull}
                        className="w-full text-left rounded-2xl border-2 p-4 transition-all"
                        style={{
                          borderColor: isSelected ? GREEN : isFull ? '#fca5a5' : '#e5e7eb',
                          backgroundColor: isSelected ? '#f0fdf4' : isFull ? '#fef2f2' : '#fff',
                          opacity: isFull ? 0.7 : 1,
                          cursor: isFull ? 'not-allowed' : 'pointer',
                        }}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            <div
                              className="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all"
                              style={{ borderColor: isSelected ? GREEN : '#d1d5db', backgroundColor: isSelected ? GREEN : '#fff' }}
                            >
                              {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-gray-900">{role.label}</p>
                              <p className="text-xs text-gray-500 mt-0.5">{role.desc}</p>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            {isFull ? (
                              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-red-100 text-red-700">
                                <X className="w-3 h-3" /> Full
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full" style={{ backgroundColor: '#dcfce7', color: GREEN }}>
                                <Users className="w-3 h-3" /> {remaining.toLocaleString()} left
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Capacity bar */}
                        {cap && (
                          <div className="mt-3 ml-8">
                            <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all"
                                style={{ width: `${pct}%`, backgroundColor: isFull ? RED : pct > 80 ? '#f59e0b' : GREEN }}
                              />
                            </div>
                            <p className="text-xs text-gray-400 mt-1">{cap.current.toLocaleString()} of {cap.limit.toLocaleString()} positions filled</p>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              {selectedRole && roleCap?.full && (
                <div className="mt-4 flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  All positions for <strong>{roleConfig?.label}</strong> have been filled. Please select a different role.
                </div>
              )}
            </div>
          )}

          {/* ── STEP 3: Personal Information ── */}
          {step === 3 && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#dcfce7' }}>
                  <User className="w-5 h-5" style={{ color: GREEN }} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Personal Information</h2>
                  <p className="text-sm text-gray-500">Tell us about yourself</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="First Name" required>
                  <input className={inputCls} style={inputStyle} placeholder="e.g. Chanda" value={personal.firstName}
                    onChange={e => setPersonal(p => ({ ...p, firstName: e.target.value }))} />
                </Field>
                <Field label="Last Name" required>
                  <input className={inputCls} style={inputStyle} placeholder="e.g. Mwale" value={personal.lastName}
                    onChange={e => setPersonal(p => ({ ...p, lastName: e.target.value }))} />
                </Field>
                <Field label="Date of Birth" required>
                  <input type="date" className={inputCls} style={inputStyle} value={personal.dateOfBirth}
                    onChange={e => setPersonal(p => ({ ...p, dateOfBirth: e.target.value }))} />
                </Field>
                <Field label="Place of Birth">
                  <input className={inputCls} style={inputStyle} placeholder="e.g. Lusaka" value={personal.placeOfBirth}
                    onChange={e => setPersonal(p => ({ ...p, placeOfBirth: e.target.value }))} />
                </Field>
                <Field label="Chief / Traditional Authority">
                  <input className={inputCls} style={inputStyle} placeholder="e.g. Chief Chipepo" value={personal.chief}
                    onChange={e => setPersonal(p => ({ ...p, chief: e.target.value }))} />
                </Field>
                <Field label="Town / City">
                  <input className={inputCls} style={inputStyle} placeholder="e.g. Choma" value={personal.town}
                    onChange={e => setPersonal(p => ({ ...p, town: e.target.value }))} />
                </Field>
                <Field label="Highest Grade / Qualification" required>
                  <SelectField value={personal.grade} onChange={v => setPersonal(p => ({ ...p, grade: v }))}>
                    <option value="">Select grade...</option>
                    {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
                  </SelectField>
                </Field>
                <Field label="Email Address" required>
                  <input type="email" className={inputCls} style={inputStyle} placeholder="name@example.com" value={personal.email}
                    onChange={e => setPersonal(p => ({ ...p, email: e.target.value }))} />
                </Field>
                <Field label="Residential Address" required>
                  <input className={inputCls + " sm:col-span-2"} style={inputStyle} placeholder="Plot number, street, area" value={personal.address}
                    onChange={e => setPersonal(p => ({ ...p, address: e.target.value }))} />
                </Field>
              </div>

              {(personal.grade === 'Grade 11' || personal.grade === 'Grade 12') && (
                <div className="mt-4 flex items-start gap-2 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <p>
                    <strong>Eligibility Note:</strong> Grade 11 and 12 students may qualify if they hold an original letter from their Head Teacher or Principal. Upload this letter in Step 4.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ── STEP 4: Assignment Area ── */}
          {step === 4 && (
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#dcfce7' }}>
                  <MapPin className="w-5 h-5" style={{ color: GREEN }} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Assignment Area</h2>
                  <p className="text-sm text-gray-500">
                    Select the area for your <strong>{roleConfig?.label}</strong> role
                  </p>
                </div>
              </div>

              <div className="mb-5 px-4 py-3 rounded-xl text-xs" style={{ backgroundColor: '#f0fdf4', border: `1px solid #bbf7d0`, color: GREEN }}>
                Select your assignment area. Only the fields relevant to your role are required.
              </div>

              <div className="space-y-4">
                {/* Province — shown for all scoped roles */}
                {roleConfig && roleConfig.scopeType !== 'national' && (
                <Field label="Province" required>
                  <SelectField value={loc.provinceId} onChange={setProvince}>
                    <option value="">— Select Province —</option>
                    {provinces.map(p => <option key={p.id} value={p.id}>{p.name} Province</option>)}
                  </SelectField>
                </Field>
                )}

                {/* District — shown for district and below */}
                {roleConfig && ['district','constituency','ward','polling_station'].includes(roleConfig.scopeType) && (
                <Field label="District" required>
                  <SelectField value={loc.districtId} onChange={setDistrict} disabled={!selProvince}>
                    <option value="">— {selProvince ? 'Select District' : 'Select Province first'} —</option>
                    {selProvince?.districts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </SelectField>
                </Field>
                )}

                {/* Constituency — shown for constituency and below */}
                {roleConfig && ['constituency','ward','polling_station'].includes(roleConfig.scopeType) && (
                <Field label="Constituency" required>
                  <SelectField value={loc.constituencyId} onChange={setConstituency} disabled={!selDistrict}>
                    <option value="">— {selDistrict ? 'Select Constituency' : 'Select District first'} —</option>
                    {selDistrict?.constituencies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </SelectField>
                </Field>
                )}

                {/* Ward — shown for ward and polling agent */}
                {roleConfig && ['ward','polling_station'].includes(roleConfig.scopeType) && (
                <Field label="Ward" required>
                  <SelectField value={loc.wardId} onChange={setWard} disabled={!selConstituency}>
                    <option value="">— {selConstituency ? 'Select Ward' : 'Select Constituency first'} —</option>
                    {selConstituency?.wards.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                  </SelectField>
                </Field>
                )}

                {/* Polling Station — shown only for polling agents */}
                {roleConfig?.scopeType === 'polling_station' && (
                <Field label="Polling Station" required>
                  <SelectField value={loc.pollingStationId} onChange={setPollingStation} disabled={!selWard}>
                    <option value="">— {selWard ? 'Select Polling Station' : 'Select Ward first'} —</option>
                    {selWard?.pollingStations.map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.registeredVoters.toLocaleString()} voters)</option>
                    ))}
                  </SelectField>
                </Field>
                )}

                {/* Summary card */}
                {loc.pollingStationId && (
                  <div className="rounded-xl border-2 p-4 space-y-1" style={{ borderColor: GREEN, backgroundColor: '#f0fdf4' }}>
                    <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: GREEN }}>Your Polling Station</p>
                    <p className="font-bold text-gray-900">{loc.pollingStationName}</p>
                    <p className="text-sm text-gray-600">{selWard?.name} Ward</p>
                    <p className="text-sm text-gray-600">{selConstituency?.name} Constituency · {selDistrict?.name} District</p>
                    <p className="text-sm text-gray-600">{selProvince?.name} Province</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {selWard?.pollingStations.find(s => s.id === loc.pollingStationId)?.registeredVoters.toLocaleString()} registered voters
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── STEP 5: Document Upload ── */}
          {step === 5 && (
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#dcfce7' }}>
                  <FileText className="w-5 h-5" style={{ color: GREEN }} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Documents</h2>
                  <p className="text-sm text-gray-500">Upload clear photos or scans of your documents</p>
                </div>
              </div>

              <div className="mb-4 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
                <strong>Eligibility Note:</strong> Grade 11 or 12 students holding an original letter from their Head Teacher or Principal may qualify as a Polling Agent.
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {DOCS.map(doc => (
                  <DocUploadCard
                    key={doc.key}
                    doc={doc}
                    file={docs[doc.key]}
                    onUpload={f => setDocs(d => ({ ...d, [doc.key]: f }))}
                    onRemove={() => setDocs(d => ({ ...d, [doc.key]: null }))}
                  />
                ))}
              </div>

              <p className="text-xs text-gray-500 mt-4">Accepted formats: JPG, PNG, PDF. Max 10MB per file.</p>
            </div>
          )}

          {/* ── STEP 6: Review & Submit ── */}
          {step === 6 && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#dcfce7' }}>
                  <CheckCircle2 className="w-5 h-5" style={{ color: GREEN }} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Review & Submit</h2>
                  <p className="text-sm text-gray-500">Confirm your details before submitting</p>
                </div>
              </div>

              <div className="space-y-4">
                {/* Phone */}
                <ReviewSection title="Phone Number" onEdit={() => setStep(1)}>
                  <ReviewRow label="Mobile" value={formatPhone(phone)} />
                  <ReviewRow label="Verified" value="✓ Confirmed" />
                </ReviewSection>

                {/* Role */}
                <ReviewSection title="Applied Role" onEdit={() => setStep(2)}>
                  <ReviewRow label="Role" value={roleConfig?.label ?? '—'} highlight />
                  <ReviewRow label="Positions Available" value={roleCap ? `${roleCap.remaining.toLocaleString()} of ${roleCap.limit.toLocaleString()}` : '—'} />
                  <ReviewRow label="Scope" value={roleConfig?.scopeType ?? '—'} />
                </ReviewSection>

                {/* Personal */}
                <ReviewSection title="Personal Information" onEdit={() => setStep(3)}>
                  <ReviewRow label="Full Name" value={`${personal.firstName} ${personal.lastName}`} />
                  <ReviewRow label="Date of Birth" value={personal.dateOfBirth} />
                  <ReviewRow label="Place of Birth" value={personal.placeOfBirth || '—'} />
                  <ReviewRow label="Chief" value={personal.chief || '—'} />
                  <ReviewRow label="Town" value={personal.town || '—'} />
                  <ReviewRow label="Grade" value={personal.grade} />
                  <ReviewRow label="Email" value={personal.email} />
                  <ReviewRow label="Address" value={personal.address} />
                </ReviewSection>

                {/* Location */}
                <ReviewSection title="Assignment Area" onEdit={() => setStep(4)}>
                  <ReviewRow label="Polling Station" value={loc.pollingStationName} highlight />
                  <ReviewRow label="Ward" value={selWard?.name ?? ''} />
                  <ReviewRow label="Constituency" value={selConstituency?.name ?? ''} />
                  <ReviewRow label="District" value={selDistrict?.name ?? ''} />
                  <ReviewRow label="Province" value={`${selProvince?.name} Province`} />
                </ReviewSection>

                {/* Documents */}
                <ReviewSection title="Documents Uploaded" onEdit={() => setStep(5)}>
                  {DOCS.map(doc => (
                    <ReviewRow
                      key={doc.key}
                      label={doc.label}
                      value={docs[doc.key] ? `✓ ${docs[doc.key]!.name}` : doc.required ? '⚠ Missing (required)' : '— Not uploaded'}
                    />
                  ))}
                </ReviewSection>
              </div>

              {error && (
                <div className="flex items-start gap-2 mt-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />{error}
                </div>
              )}

              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="mt-6 w-full py-4 rounded-xl font-bold text-white text-base flex items-center justify-center gap-2 transition-all disabled:opacity-60"
                style={{ backgroundColor: GREEN }}
              >
                {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                {submitting ? 'Submitting Application…' : 'Submit Application'}
              </button>

              <p className="text-xs text-center text-gray-500 mt-3">
                By submitting, you confirm all information is true and accurate. False declarations may result in disqualification.
              </p>
            </div>
          )}

          {/* ── Navigation buttons ── */}
          <div className="flex gap-3 mt-8">
            {step > 1 && (
              <button
                onClick={() => setStep(s => s - 1)}
                className="flex items-center gap-2 px-5 py-3 rounded-xl border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
            )}
            {step < 6 && (
              <button
                onClick={() => { setError(''); setStep(s => s + 1); }}
                disabled={!canAdvance()}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-white text-sm transition-all disabled:opacity-40"
                style={{ backgroundColor: canAdvance() ? GREEN : '#9ca3af' }}
              >
                {step === 5 ? 'Review Application' : 'Continue'}
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-gray-500 mt-6">
          Build One Zambia · Polling Agent Registration · 2026 General Election
        </p>
      </div>
    </div>
  );
}

// ── Review helpers ────────────────────────────────────────────────────────────

function ReviewSection({ title, onEdit, children }: { title: string; onEdit: () => void; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-gray-200 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">
        <p className="text-sm font-bold text-gray-700">{title}</p>
        <button onClick={onEdit} className="text-xs font-semibold underline" style={{ color: GREEN }}>Edit</button>
      </div>
      <div className="divide-y divide-gray-100">{children}</div>
    </div>
  );
}

function ReviewRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-start gap-4 px-4 py-2.5">
      <span className="text-xs text-gray-500 w-36 shrink-0 mt-0.5">{label}</span>
      <span className={`text-sm font-medium ${highlight ? 'font-bold' : ''}`} style={{ color: highlight ? GREEN : '#374151' }}>{value}</span>
    </div>
  );
}
