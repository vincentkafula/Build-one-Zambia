import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useForm } from 'react-hook-form';
import { PhoneVerification } from '../../components/registration/PhoneVerification';
import { DocumentUpload } from '../../components/registration/DocumentUpload';
import { SelfieCapture } from '../../components/registration/SelfieCapture';
import { zambiaLocationData, type Province, type District, type Constituency, type Ward } from '../../data/locationData';
import {
  ArrowRight, ArrowLeft, CheckCircle, User, MapPin, FileText, Clock,
  Copy, Eye, EyeOff, Camera,
} from 'lucide-react';
import { memberApi, registrationApi, type GeneratedCredentials } from '../../lib/api';

const ACCENT = '#3b82f6';

const inp = (accent = ACCENT) => ({
  border: '1px solid #d1d5db',
  outline: 'none',
  onFocus: (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    (e.target.style.borderColor = accent),
  onBlur: (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    (e.target.style.borderColor = '#d1d5db'),
});

interface MemberFormData {
  firstName: string;
  lastName: string;
  email: string;
  cellNumber: string;
  voterCardNumber: string;
  nrcNumber: string;
  dateOfBirth: string;
  gender: string;
  physicalAddress: string;
  province: string;
  district: string;
  constituency: string;
  ward: string;
  pollingStation: string;
}

async function compressImage(dataUrl: string, maxPx: number, quality: number): Promise<string> {
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxPx / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

const STEPS = [
  { num: 1, label: 'Personal Info', icon: User },
  { num: 2, label: 'Location', icon: MapPin },
  { num: 3, label: 'Documents', icon: FileText },
  { num: 4, label: 'Selfie', icon: Camera },
];

export default function MemberRegistration() {
  const navigate = useNavigate();
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [verifiedPhone, setVerifiedPhone] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const [formComplete, setFormComplete] = useState(false);
  const [registrationId, setRegistrationId] = useState('');
  const [credentials, setCredentials] = useState<GeneratedCredentials | null>(null);
  const [showPass, setShowPass] = useState(false);
  const [copied, setCopied] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Documents
  const [idDocument, setIdDocument] = useState<File | null>(null);
  const [votersCard, setVotersCard] = useState<File | null>(null);
  const [proofOfAddress, setProofOfAddress] = useState<File | null>(null);

  // Selfie
  const [selfieDataUrl, setSelfieDataUrl] = useState('');

  // Location cascading
  const [selectedProvince, setSelectedProvince] = useState<Province | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<District | null>(null);
  const [selectedConstituency, setSelectedConstituency] = useState<Constituency | null>(null);
  const [selectedWard, setSelectedWard] = useState<Ward | null>(null);

  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm<MemberFormData>();

  // ─── Location cascade handlers ──────────────────────────────────────────────

  const handleProvinceChange = (id: string) => {
    setValue('province', id, { shouldValidate: true });
    setSelectedProvince(zambiaLocationData.find(p => p.id === id) || null);
    setSelectedDistrict(null); setSelectedConstituency(null); setSelectedWard(null);
    setValue('district', ''); setValue('constituency', ''); setValue('ward', ''); setValue('pollingStation', '');
  };
  const handleDistrictChange = (id: string) => {
    setValue('district', id, { shouldValidate: true });
    setSelectedDistrict(selectedProvince?.districts.find(d => d.id === id) || null);
    setSelectedConstituency(null); setSelectedWard(null);
    setValue('constituency', ''); setValue('ward', ''); setValue('pollingStation', '');
  };
  const handleConstituencyChange = (id: string) => {
    setValue('constituency', id, { shouldValidate: true });
    setSelectedConstituency(selectedDistrict?.constituencies.find(c => c.id === id) || null);
    setSelectedWard(null);
    setValue('ward', ''); setValue('pollingStation', '');
  };
  const handleWardChange = (id: string) => {
    setValue('ward', id, { shouldValidate: true });
    setSelectedWard(selectedConstituency?.wards.find(w => w.id === id) || null);
    setValue('pollingStation', '');
  };
  const handlePollingStationChange = (id: string) => {
    setValue('pollingStation', id, { shouldValidate: true });
  };

  // ─── Step navigation ─────────────────────────────────────────────────────────

  const onStep1Submit = () => setCurrentStep(2);

  const onStep2Submit = () => {
    const data = watch();
    if (!data.province || !data.district || !data.constituency || !data.ward || !data.pollingStation) {
      alert('Please select all location details');
      return;
    }
    setCurrentStep(3);
  };

  const onStep3Next = () => {
    if (!idDocument || !votersCard || !proofOfAddress) {
      alert('Please upload all three required documents');
      return;
    }
    setCurrentStep(4);
  };

  // ─── Final submission ─────────────────────────────────────────────────────────

  const submitRegistration = async () => {
    setSubmitting(true);
    setSubmitError('');
    const data = watch();
    try {
      // Compress selfie to reduce payload size
      let compressedSelfie = selfieDataUrl;
      if (selfieDataUrl) {
        compressedSelfie = await compressImage(selfieDataUrl, 600, 0.65);
      }

      const payload: Record<string, unknown> = {
        fullName: `${data.firstName} ${data.lastName}`,
        firstName: data.firstName,
        lastName: data.lastName,
        nrcId: data.nrcNumber || data.voterCardNumber,
        dateOfBirth: data.dateOfBirth || '',
        gender: data.gender || '',
        phone: verifiedPhone || data.cellNumber,
        email: data.email,
        province: data.province,
        district: data.district,
        constituency: data.constituency,
        ward: data.ward,
        pollingStation: data.pollingStation,
        address: data.physicalAddress,
        membershipType: 'standard',
        voterNumber: data.voterCardNumber,
        // Document metadata only — binaries excluded to stay within payload limits
        documentsMeta: {
          nationalId: idDocument ? { name: idDocument.name, size: idDocument.size, type: idDocument.type } : null,
          votersCard: votersCard ? { name: votersCard.name, size: votersCard.size, type: votersCard.type } : null,
          proofOfAddress: proofOfAddress ? { name: proofOfAddress.name, size: proofOfAddress.size, type: proofOfAddress.type } : null,
        },
        documentsUploaded: !!(idDocument && votersCard && proofOfAddress),
        selfieDataUrl: compressedSelfie || null,
        hasSelfie: !!selfieDataUrl,
      };

      const res = await memberApi.submit(payload);
      const reg = (res as { registration?: { id: string } }).registration;
      if (reg?.id) setRegistrationId(reg.id);
      setFormComplete(true);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Copy helper ─────────────────────────────────────────────────────────────

  function copyText(text: string, key: string) {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(''), 2500);
    });
  }

  // ─── Phone verification gate ──────────────────────────────────────────────────

  if (!phoneVerified) {
    return (
      <PhoneVerification
        onVerified={(phone) => { setVerifiedPhone(phone); setValue('cellNumber', phone); setPhoneVerified(true); }}
        accentColor={ACCENT}
        title="Member Registration"
      />
    );
  }

  // ─── Success screen ───────────────────────────────────────────────────────────

  if (formComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12" style={{ backgroundColor: '#fafafa' }}>
        <div className="w-full max-w-xl">
          {!credentials ? (
            <div className="rounded-2xl p-10 text-center" style={{ backgroundColor: '#fff', boxShadow: '0 8px 32px rgba(0,0,0,0.08)' }}>
              <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: '#fef3c715', border: '3px solid #d97706' }}>
                <Clock className="w-10 h-10" style={{ color: '#d97706' }} />
              </div>
              <h1 className="mb-3" style={{ fontFamily: 'Oswald, sans-serif', fontSize: '2rem', letterSpacing: '0.03em', color: '#1e2d4a' }}>
                APPLICATION SUBMITTED
              </h1>
              <p className="mb-6 text-base" style={{ color: '#6b7280' }}>
                Your membership application has been received and is under review.
              </p>
              <div className="p-4 rounded-xl mb-4 text-left" style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                <p className="text-xs text-gray-500 mb-1">Application Reference</p>
                <p className="font-mono text-sm text-gray-800 break-all">{registrationId || 'Submitted'}</p>
              </div>
              <div className="p-4 rounded-xl mb-6 text-left" style={{ backgroundColor: '#fef9c3', border: '1px solid #fde047' }}>
                <p className="text-sm font-semibold text-yellow-800 mb-1">What happens next?</p>
                <ul className="text-sm text-yellow-700 space-y-1 list-disc list-inside">
                  <li>An admin will review and verify your documents</li>
                  <li>Once approved, a username &amp; password will be generated</li>
                  <li>Return here with your reference number to collect credentials</li>
                </ul>
              </div>
              {registrationId && (
                <button
                  onClick={async () => {
                    try {
                      const res = await registrationApi.getMemberCredentials(registrationId);
                      if (res.credentials) setCredentials(res.credentials as GeneratedCredentials);
                    } catch { /* not yet approved */ }
                  }}
                  className="w-full py-3 rounded-xl text-white font-semibold mb-3"
                  style={{ background: ACCENT }}
                >
                  Check if My Credentials Are Ready
                </button>
              )}
              <button onClick={() => navigate('/')} className="w-full py-2 text-sm text-gray-500 hover:text-gray-700">
                Return to Home
              </button>
            </div>
          ) : (
            <div className="rounded-2xl overflow-hidden" style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
              <div className="py-6 px-8 text-center" style={{ background: 'linear-gradient(135deg, #16a34a, #15803d)' }}>
                <CheckCircle className="w-12 h-12 text-white mx-auto mb-3" />
                <h1 style={{ fontFamily: 'Oswald, sans-serif', fontSize: '1.8rem', color: '#fff', letterSpacing: '0.04em' }}>
                  MEMBERSHIP APPROVED
                </h1>
                <p className="text-green-100 mt-1 text-sm">Welcome to Build One Zambia!</p>
              </div>
              <div className="bg-white p-8 space-y-4">
                <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <strong>Save these credentials now.</strong> Your password is only shown once.
                </p>
                <div className="rounded-xl border border-gray-200 p-4">
                  <p className="text-xs text-gray-400 mb-1">Your Username</p>
                  <div className="flex items-center justify-between">
                    <code className="text-lg font-mono font-bold text-gray-900">{credentials.username}</code>
                    <button onClick={() => copyText(credentials.username, 'u')} className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg border" style={{ color: ACCENT, borderColor: ACCENT }}>
                      <Copy size={12} /> {copied === 'u' ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                </div>
                <div className="rounded-xl border border-gray-200 p-4">
                  <p className="text-xs text-gray-400 mb-1">Your Password</p>
                  <div className="flex items-center justify-between gap-3">
                    <code className="text-lg font-mono font-bold text-gray-900">{showPass ? credentials.password : '••••••••••'}</code>
                    <div className="flex gap-2">
                      <button onClick={() => setShowPass(s => !s)} className="p-2 rounded-lg border border-gray-200 text-gray-400">
                        {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                      <button onClick={() => copyText(credentials.password, 'p')} className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg border" style={{ color: ACCENT, borderColor: ACCENT }}>
                        <Copy size={12} /> {copied === 'p' ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => copyText(`Username: ${credentials.username}\nPassword: ${credentials.password}`, 'all')}
                  className="w-full py-3 rounded-xl border text-sm font-semibold"
                  style={{ color: ACCENT, borderColor: ACCENT }}
                >
                  {copied === 'all' ? '✓ Copied!' : 'Copy Both Username & Password'}
                </button>
                <button onClick={() => navigate('/dashboard-login')} className="w-full py-3 rounded-xl text-white font-semibold" style={{ background: ACCENT }}>
                  Go to Dashboard Login →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ─── Registration form ────────────────────────────────────────────────────────

  const fieldClass = 'w-full px-4 py-3 rounded-lg';
  const fieldStyle = { border: '1px solid #d1d5db', outline: 'none' };
  const labelStyle = { color: '#374151', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.04em' } as React.CSSProperties;
  const onFocus = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => (e.target.style.borderColor = ACCENT);
  const onBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => (e.target.style.borderColor = '#d1d5db');

  return (
    <div className="min-h-screen px-4 py-12" style={{ backgroundColor: '#fafafa' }}>
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="mb-2" style={{ fontFamily: 'Oswald, sans-serif', fontSize: '2.5rem', letterSpacing: '0.03em', color: '#1e2d4a' }}>
            MEMBER REGISTRATION
          </h1>
          <p className="text-sm" style={{ color: '#6b7280' }}>Build One Zambia Membership Application</p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center">
            {STEPS.map((step, idx) => (
              <div key={step.num} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center">
                  <div
                    className="w-11 h-11 rounded-full flex items-center justify-center mb-1 transition-all"
                    style={{ backgroundColor: currentStep >= step.num ? ACCENT : '#e5e7eb', color: currentStep >= step.num ? '#fff' : '#9ca3af' }}
                  >
                    <step.icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs hidden sm:block" style={{ color: currentStep >= step.num ? ACCENT : '#9ca3af' }}>
                    {step.label}
                  </span>
                </div>
                {idx < STEPS.length - 1 && (
                  <div className="flex-1 h-1 mx-2 rounded mb-4" style={{ backgroundColor: currentStep > step.num ? ACCENT : '#e5e7eb' }} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Card */}
        <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: '#fff', boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
          <div className="p-8">

            {/* ── Step 1: Personal Info ── */}
            {currentStep === 1 && (
              <form onSubmit={handleSubmit(onStep1Submit)}>
                <h2 className="mb-6" style={{ fontFamily: 'Oswald, sans-serif', fontSize: '1.5rem', letterSpacing: '0.03em', color: '#1e2d4a' }}>
                  Step 1: Personal Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block mb-1.5 text-sm" style={labelStyle}>FIRST NAME *</label>
                    <input {...register('firstName', { required: true })} className={fieldClass} style={fieldStyle} onFocus={onFocus} onBlur={onBlur} />
                    {errors.firstName && <p className="text-red-500 text-xs mt-1">Required</p>}
                  </div>
                  <div>
                    <label className="block mb-1.5 text-sm" style={labelStyle}>LAST NAME *</label>
                    <input {...register('lastName', { required: true })} className={fieldClass} style={fieldStyle} onFocus={onFocus} onBlur={onBlur} />
                    {errors.lastName && <p className="text-red-500 text-xs mt-1">Required</p>}
                  </div>
                  <div>
                    <label className="block mb-1.5 text-sm" style={labelStyle}>DATE OF BIRTH *</label>
                    <input type="date" {...register('dateOfBirth', { required: true })} className={fieldClass} style={fieldStyle} onFocus={onFocus} onBlur={onBlur} />
                    {errors.dateOfBirth && <p className="text-red-500 text-xs mt-1">Required</p>}
                  </div>
                  <div>
                    <label className="block mb-1.5 text-sm" style={labelStyle}>GENDER *</label>
                    <select {...register('gender', { required: true })} className={fieldClass} style={fieldStyle} onFocus={onFocus} onBlur={onBlur}>
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                    {errors.gender && <p className="text-red-500 text-xs mt-1">Required</p>}
                  </div>
                  <div>
                    <label className="block mb-1.5 text-sm" style={labelStyle}>EMAIL ADDRESS *</label>
                    <input type="email" {...register('email', { required: true })} className={fieldClass} style={fieldStyle} onFocus={onFocus} onBlur={onBlur} />
                    {errors.email && <p className="text-red-500 text-xs mt-1">Required</p>}
                  </div>
                  <div>
                    <label className="block mb-1.5 text-sm" style={labelStyle}>CELL NUMBER (VERIFIED)</label>
                    <input value={verifiedPhone} disabled className={fieldClass} style={{ ...fieldStyle, backgroundColor: `${ACCENT}08`, color: ACCENT }} />
                  </div>
                  <div>
                    <label className="block mb-1.5 text-sm" style={labelStyle}>NRC NUMBER *</label>
                    <input {...register('nrcNumber', { required: true })} placeholder="e.g. 123456/78/9" className={fieldClass} style={fieldStyle} onFocus={onFocus} onBlur={onBlur} />
                    {errors.nrcNumber && <p className="text-red-500 text-xs mt-1">Required</p>}
                  </div>
                  <div>
                    <label className="block mb-1.5 text-sm" style={labelStyle}>VOTER CARD NUMBER *</label>
                    <input {...register('voterCardNumber', { required: true })} className={fieldClass} style={fieldStyle} onFocus={onFocus} onBlur={onBlur} />
                    {errors.voterCardNumber && <p className="text-red-500 text-xs mt-1">Required</p>}
                  </div>
                  <div className="md:col-span-2">
                    <label className="block mb-1.5 text-sm" style={labelStyle}>PHYSICAL ADDRESS *</label>
                    <textarea {...register('physicalAddress', { required: true })} rows={3} className={fieldClass} style={fieldStyle} onFocus={onFocus} onBlur={onBlur} />
                    {errors.physicalAddress && <p className="text-red-500 text-xs mt-1">Required</p>}
                  </div>
                </div>
                <button type="submit" className="w-full mt-8 flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg text-white" style={{ backgroundColor: ACCENT, fontFamily: 'Oswald, sans-serif', letterSpacing: '0.08em', fontSize: '14px' }}>
                  CONTINUE TO LOCATION <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}

            {/* ── Step 2: Location ── */}
            {currentStep === 2 && (
              <form onSubmit={e => { e.preventDefault(); onStep2Submit(); }}>
                <h2 className="mb-6" style={{ fontFamily: 'Oswald, sans-serif', fontSize: '1.5rem', letterSpacing: '0.03em', color: '#1e2d4a' }}>
                  Step 2: Location Details
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block mb-1.5 text-sm" style={labelStyle}>PROVINCE *</label>
                    <select value={watch('province') || ''} onChange={e => handleProvinceChange(e.target.value)} className={fieldClass} style={fieldStyle} onFocus={onFocus} onBlur={onBlur}>
                      <option value="">Select Province</option>
                      {zambiaLocationData.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block mb-1.5 text-sm" style={labelStyle}>DISTRICT *</label>
                    <select value={watch('district') || ''} onChange={e => handleDistrictChange(e.target.value)} disabled={!selectedProvince} className={fieldClass} style={{ ...fieldStyle, backgroundColor: !selectedProvince ? '#f9fafb' : '#fff' }} onFocus={onFocus} onBlur={onBlur}>
                      <option value="">Select District</option>
                      {selectedProvince?.districts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block mb-1.5 text-sm" style={labelStyle}>CONSTITUENCY *</label>
                    <select value={watch('constituency') || ''} onChange={e => handleConstituencyChange(e.target.value)} disabled={!selectedDistrict} className={fieldClass} style={{ ...fieldStyle, backgroundColor: !selectedDistrict ? '#f9fafb' : '#fff' }} onFocus={onFocus} onBlur={onBlur}>
                      <option value="">Select Constituency</option>
                      {selectedDistrict?.constituencies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block mb-1.5 text-sm" style={labelStyle}>WARD *</label>
                    <select value={watch('ward') || ''} onChange={e => handleWardChange(e.target.value)} disabled={!selectedConstituency} className={fieldClass} style={{ ...fieldStyle, backgroundColor: !selectedConstituency ? '#f9fafb' : '#fff' }} onFocus={onFocus} onBlur={onBlur}>
                      <option value="">Select Ward</option>
                      {selectedConstituency?.wards.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block mb-1.5 text-sm" style={labelStyle}>POLLING STATION *</label>
                    <select value={watch('pollingStation') || ''} onChange={e => handlePollingStationChange(e.target.value)} disabled={!selectedWard} className={fieldClass} style={{ ...fieldStyle, backgroundColor: !selectedWard ? '#f9fafb' : '#fff' }} onFocus={onFocus} onBlur={onBlur}>
                      <option value="">Select Polling Station</option>
                      {selectedWard?.pollingStations.map(ps => <option key={ps.id} value={ps.id}>{ps.name}</option>)}
                    </select>
                  </div>
                </div>
                <div className="flex gap-3 mt-8">
                  <button type="button" onClick={() => setCurrentStep(1)} className="flex items-center gap-2 px-6 py-3.5 rounded-lg" style={{ border: `2px solid ${ACCENT}`, color: ACCENT, fontFamily: 'Oswald, sans-serif', letterSpacing: '0.08em', fontSize: '14px' }}>
                    <ArrowLeft className="w-4 h-4" /> BACK
                  </button>
                  <button type="submit" className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg text-white" style={{ backgroundColor: ACCENT, fontFamily: 'Oswald, sans-serif', letterSpacing: '0.08em', fontSize: '14px' }}>
                    CONTINUE TO DOCUMENTS <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            )}

            {/* ── Step 3: Documents ── */}
            {currentStep === 3 && (
              <div>
                <h2 className="mb-2" style={{ fontFamily: 'Oswald, sans-serif', fontSize: '1.5rem', letterSpacing: '0.03em', color: '#1e2d4a' }}>
                  Step 3: Document Upload
                </h2>
                <p className="text-sm mb-6" style={{ color: '#6b7280' }}>
                  Upload clear, legible copies. Accepted: PDF, JPG, PNG (max 5 MB each).
                </p>

                <DocumentUpload
                  label="NATIONAL REGISTRATION CARD (NRC) *"
                  description="Upload a clear photo or scan of your NRC"
                  file={idDocument}
                  onFileChange={setIdDocument}
                  accentColor={ACCENT}
                />
                <DocumentUpload
                  label="VOTER'S CARD *"
                  description="Upload a clear photo or scan of your Voter's Card"
                  file={votersCard}
                  onFileChange={setVotersCard}
                  accentColor={ACCENT}
                />
                <DocumentUpload
                  label="PROOF OF PHYSICAL ADDRESS *"
                  description="Utility bill, bank statement, or official document showing your address"
                  file={proofOfAddress}
                  onFileChange={setProofOfAddress}
                  accentColor={ACCENT}
                />

                {/* Upload status */}
                <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: '#fafafa', border: '1px solid #e5e7eb' }}>
                  <p className="text-sm mb-3" style={{ color: '#374151', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.04em' }}>UPLOAD STATUS</p>
                  <div className="space-y-2">
                    {[
                      { label: 'NRC Document', ok: !!idDocument },
                      { label: "Voter's Card", ok: !!votersCard },
                      { label: 'Proof of Address', ok: !!proofOfAddress },
                    ].map(item => (
                      <div key={item.label} className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" style={{ color: item.ok ? '#22c55e' : '#d1d5db' }} />
                        <span className="text-sm" style={{ color: item.ok ? '#374151' : '#9ca3af' }}>{item.label}</span>
                        {item.ok && <span className="text-xs text-green-600 ml-auto">✓ Uploaded</span>}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button type="button" onClick={() => setCurrentStep(2)} className="flex items-center gap-2 px-6 py-3.5 rounded-lg" style={{ border: `2px solid ${ACCENT}`, color: ACCENT, fontFamily: 'Oswald, sans-serif', letterSpacing: '0.08em', fontSize: '14px' }}>
                    <ArrowLeft className="w-4 h-4" /> BACK
                  </button>
                  <button
                    type="button"
                    onClick={onStep3Next}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg text-white"
                    style={{ backgroundColor: ACCENT, fontFamily: 'Oswald, sans-serif', letterSpacing: '0.08em', fontSize: '14px' }}
                  >
                    CONTINUE TO SELFIE <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* ── Step 4: Selfie ── */}
            {currentStep === 4 && (
              <div>
                <h2 className="mb-2" style={{ fontFamily: 'Oswald, sans-serif', fontSize: '1.5rem', letterSpacing: '0.03em', color: '#1e2d4a' }}>
                  Step 4: Identity Selfie
                </h2>
                <p className="text-sm mb-6" style={{ color: '#6b7280' }}>
                  Take a clear selfie photo so we can verify your identity. Look straight at the camera in good lighting.
                  You may skip this step, but it helps speed up approval.
                </p>

                <div className="flex justify-center mb-6">
                  <SelfieCapture
                    onCapture={url => setSelfieDataUrl(url)}
                    captured={selfieDataUrl || null}
                  />
                </div>

                {selfieDataUrl && (
                  <div className="mb-4 p-3 rounded-lg flex items-center gap-2 text-sm" style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534' }}>
                    <CheckCircle size={16} />
                    Selfie captured successfully
                  </div>
                )}

                {submitError && (
                  <div className="mb-4 p-3 rounded-lg text-sm" style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626' }}>
                    {submitError}
                  </div>
                )}

                <div className="flex gap-3">
                  <button type="button" onClick={() => setCurrentStep(3)} className="flex items-center gap-2 px-6 py-3.5 rounded-lg" style={{ border: `2px solid ${ACCENT}`, color: ACCENT, fontFamily: 'Oswald, sans-serif', letterSpacing: '0.08em', fontSize: '14px' }}>
                    <ArrowLeft className="w-4 h-4" /> BACK
                  </button>
                  {!selfieDataUrl ? (
                    <button
                      type="button"
                      onClick={submitRegistration}
                      disabled={submitting}
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg text-white disabled:opacity-60"
                      style={{ backgroundColor: '#6b7280', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.08em', fontSize: '14px' }}
                    >
                      {submitting ? 'SUBMITTING…' : 'SKIP & SUBMIT APPLICATION'}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={submitRegistration}
                      disabled={submitting}
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg text-white disabled:opacity-60"
                      style={{ backgroundColor: '#16a34a', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.08em', fontSize: '14px' }}
                    >
                      {submitting ? 'SUBMITTING…' : <><CheckCircle className="w-4 h-4" /> SUBMIT APPLICATION</>}
                    </button>
                  )}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
