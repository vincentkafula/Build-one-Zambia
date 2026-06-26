import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useForm } from 'react-hook-form';
import { PhoneVerification } from '../../components/registration/PhoneVerification';
import { SelfieCapture } from '../../components/registration/SelfieCapture';
import { zambianUniversities } from '../../data/locationData';
import {
  ArrowRight, ArrowLeft, CheckCircle, GraduationCap, Info,
  Clock, Copy, Eye, EyeOff, Camera, Loader2, XCircle, BadgeCheck,
} from 'lucide-react';
import { registrationApi, GeneratedCredentials } from '../../lib/api';

const ACCENT_COLOR = '#9333ea';

interface InternshipFormData {
  membershipNumber: string;
  university: string;
  course: string;
  yearOfStudy: string;
  cellNumber: string;
  twoFactorCode: string;
}

export default function InternshipRegistration() {
  const navigate = useNavigate();
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [verifiedPhone, setVerifiedPhone] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const [formComplete, setFormComplete] = useState(false);
  const [registrationId, setRegistrationId] = useState('');
  const [credentials, setCredentials] = useState<GeneratedCredentials | null>(null);
  const [showPass, setShowPass] = useState(false);
  const [copied, setCopied] = useState('');
  const [selfieDataUrl, setSelfieDataUrl] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Membership validation state
  const [membershipChecking, setMembershipChecking] = useState(false);
  const [membershipValid, setMembershipValid] = useState<boolean | null>(null);
  const [membershipInfo, setMembershipInfo] = useState<{ fullName?: string; error?: string } | null>(null);

  async function checkMembership(number: string) {
    if (!number.trim()) return;
    setMembershipChecking(true);
    setMembershipValid(null);
    setMembershipInfo(null);
    try {
      const res = await registrationApi.validateMembership(number.trim());
      setMembershipValid(res.valid);
      setMembershipInfo({ fullName: res.fullName, error: res.error });
    } catch {
      setMembershipValid(false);
      setMembershipInfo({ error: 'Could not verify membership. Please check your number and try again.' });
    } finally {
      setMembershipChecking(false);
    }
  }

  function copyText(text: string, key: string) {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(''), 2000);
    });
  }

  const { register, handleSubmit, setValue, watch } = useForm<InternshipFormData>();

  const onFormSubmit = async (data: InternshipFormData) => {
    if (!data.membershipNumber || !data.university || !data.course || !data.yearOfStudy || !data.twoFactorCode) {
      alert('Please fill in all required fields');
      return;
    }
    if (data.twoFactorCode.length !== 6) {
      alert('Please enter a valid 6-digit two-factor verification code');
      return;
    }

    // If not yet validated, run check now
    let isValid = membershipValid;
    if (isValid === null) {
      setMembershipChecking(true);
      try {
        const res = await registrationApi.validateMembership(data.membershipNumber.trim());
        setMembershipValid(res.valid);
        setMembershipInfo({ fullName: res.fullName, error: res.error });
        isValid = res.valid;
      } catch {
        setMembershipValid(false);
        setMembershipInfo({ error: 'Could not verify membership. Please try again.' });
        isValid = false;
      } finally {
        setMembershipChecking(false);
      }
    }

    if (!isValid) return; // validation banner shows error

    setCurrentStep(2);
  };

  const submitRegistration = async () => {
    setSubmitting(true);
    setSubmitError('');
    const data = watch();
    try {
      const res = await registrationApi.submitInternship({
        fullName: verifiedPhone,
        nrcId: data.membershipNumber,
        membershipNumber: data.membershipNumber,
        dateOfBirth: '',
        gender: '',
        phone: verifiedPhone,
        email: '',
        province: '',
        district: '',
        department: 'General',
        startDate: new Date().toISOString().split('T')[0],
        duration: '6 months',
        university: data.university,
        course: data.course,
        yearOfStudy: data.yearOfStudy,
        selfieDataUrl: selfieDataUrl ?? undefined,
      });
      if (res && (res as { application?: { id: string } }).application?.id) {
        setRegistrationId((res as { application: { id: string } }).application.id);
      }
      setFormComplete(true);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Submission failed. Please try again.';
      setSubmitError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (!phoneVerified) {
    return (
      <PhoneVerification
        onVerified={(phone) => {
          setVerifiedPhone(phone);
          setValue('cellNumber', phone);
          setPhoneVerified(true);
        }}
        accentColor={ACCENT_COLOR}
        title="Internship Registration"
      />
    );
  }

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
                Your internship application has been received and is under review.
              </p>
              {registrationId && (
                <div className="p-4 rounded-xl mb-5 text-left" style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                  <p className="text-xs text-gray-500 mb-1">Application Reference</p>
                  <p className="font-mono text-sm text-gray-800 break-all">{registrationId}</p>
                </div>
              )}
              <div className="p-4 rounded-xl text-left mb-6" style={{ backgroundColor: '#fef9c3', border: '1px solid #fde047' }}>
                <p className="text-sm font-semibold text-yellow-800 mb-1">What happens next?</p>
                <ul className="text-sm text-yellow-700 space-y-1 list-disc list-inside">
                  <li>Admin reviews your application</li>
                  <li>Once approved, a <strong>username and password</strong> will be generated</li>
                  <li>Use them to log in to your Internship Dashboard</li>
                </ul>
              </div>
              {registrationId && (
                <button
                  onClick={async () => {
                    try {
                      const res = await registrationApi.getInternCredentials(registrationId);
                      if (res.credentials) setCredentials(res.credentials);
                    } catch { /* not ready yet */ }
                  }}
                  className="w-full py-3 rounded-xl text-white font-semibold mb-3"
                  style={{ background: ACCENT_COLOR }}
                >
                  Check if My Credentials Are Ready
                </button>
              )}
              <button onClick={() => navigate('/')} className="w-full py-2 text-sm text-gray-400 hover:text-gray-600">
                Return to Home
              </button>
            </div>
          ) : (
            <div className="rounded-2xl overflow-hidden" style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
              <div className="py-6 px-8 text-center" style={{ background: `linear-gradient(135deg, ${ACCENT_COLOR}, #7c3aed)` }}>
                <CheckCircle className="w-12 h-12 text-white mx-auto mb-3" />
                <h1 style={{ fontFamily: 'Oswald, sans-serif', fontSize: '1.8rem', color: '#fff', letterSpacing: '0.04em' }}>
                  INTERNSHIP APPROVED
                </h1>
                <p className="text-purple-100 mt-1 text-sm">Welcome to BOZ Internship Program!</p>
              </div>
              <div className="bg-white p-8 space-y-4">
                <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <strong>Save these credentials now.</strong> Your password is only shown once.
                </p>
                <div className="rounded-xl border border-gray-200 p-4">
                  <p className="text-xs text-gray-400 mb-1">Username</p>
                  <div className="flex items-center justify-between">
                    <code className="text-lg font-mono font-bold text-gray-900">{credentials.username}</code>
                    <button onClick={() => copyText(credentials.username, 'u')} className="text-xs flex items-center gap-1 px-3 py-1.5 rounded-lg border" style={{ color: ACCENT_COLOR, borderColor: ACCENT_COLOR }}>
                      <Copy size={12} /> {copied === 'u' ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                </div>
                <div className="rounded-xl border border-gray-200 p-4">
                  <p className="text-xs text-gray-400 mb-1">Password</p>
                  <div className="flex items-center justify-between gap-3">
                    <code className="text-lg font-mono font-bold text-gray-900">{showPass ? credentials.password : '••••••••••'}</code>
                    <div className="flex gap-2">
                      <button onClick={() => setShowPass(s => !s)} className="p-2 rounded-lg border border-gray-200 text-gray-400">{showPass ? <EyeOff size={14} /> : <Eye size={14} />}</button>
                      <button onClick={() => copyText(credentials.password, 'p')} className="text-xs flex items-center gap-1 px-3 py-1.5 rounded-lg border" style={{ color: ACCENT_COLOR, borderColor: ACCENT_COLOR }}>
                        <Copy size={12} /> {copied === 'p' ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                  </div>
                </div>
                <button onClick={() => copyText(`Username: ${credentials.username}\nPassword: ${credentials.password}`, 'all')} className="w-full py-3 rounded-xl border text-sm font-semibold" style={{ color: ACCENT_COLOR, borderColor: ACCENT_COLOR }}>
                  {copied === 'all' ? '✓ Copied!' : 'Copy Both'}
                </button>
                <button onClick={() => navigate('/dashboard-login')} className="w-full py-3 rounded-xl text-white font-semibold" style={{ background: ACCENT_COLOR }}>
                  Go to Dashboard Login →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12" style={{ backgroundColor: '#fafafa' }}>
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ opacity: 0.05 }}>
        <div style={{ fontSize: '20rem', fontFamily: 'Oswald, sans-serif', color: ACCENT_COLOR, fontWeight: 'bold' }}>BOZ</div>
      </div>

      <div className="w-full max-w-2xl relative">
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: `${ACCENT_COLOR}15`, border: `2px solid ${ACCENT_COLOR}` }}>
            <GraduationCap className="w-10 h-10" style={{ color: ACCENT_COLOR }} />
          </div>
          <h1 className="mb-2" style={{ fontFamily: 'Oswald, sans-serif', fontSize: '2.5rem', letterSpacing: '0.03em', color: '#1e2d4a' }}>
            INTERNSHIP REGISTRATION
          </h1>
          <p className="text-sm" style={{ color: '#6b7280' }}>Student Internship Program Application</p>
        </div>

        {/* Info boxes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="p-4 rounded-lg" style={{ backgroundColor: '#fff', border: `1px solid ${ACCENT_COLOR}30` }}>
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: ACCENT_COLOR }} />
              <div>
                <p className="text-xs mb-1" style={{ color: ACCENT_COLOR, fontFamily: 'Oswald, sans-serif', letterSpacing: '0.04em' }}>REQUIREMENTS</p>
                <ul className="text-xs space-y-1" style={{ color: '#6b7280' }}>
                  <li>• Must be an <strong>active</strong> BOZ party member</li>
                  <li>• Must have a voter's card</li>
                  <li>• Currently enrolled in university</li>
                </ul>
              </div>
            </div>
          </div>
          <div className="p-4 rounded-lg" style={{ backgroundColor: '#fff', border: `1px solid ${ACCENT_COLOR}30` }}>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: ACCENT_COLOR }} />
              <div>
                <p className="text-xs mb-1" style={{ color: ACCENT_COLOR, fontFamily: 'Oswald, sans-serif', letterSpacing: '0.04em' }}>BENEFITS</p>
                <ul className="text-xs space-y-1" style={{ color: '#6b7280' }}>
                  <li>• Monthly education stipend</li>
                  <li>• American phone number</li>
                  <li>• Laptop for remote work</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Step progress */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {[
            { num: 1, label: 'Application', icon: GraduationCap },
            { num: 2, label: 'Selfie', icon: Camera },
          ].map((s, i) => (
            <div key={s.num} className="flex items-center">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full flex items-center justify-center mb-1 transition-all" style={{ backgroundColor: currentStep >= s.num ? ACCENT_COLOR : '#e5e7eb', color: currentStep >= s.num ? '#fff' : '#9ca3af' }}>
                  <s.icon className="w-4 h-4" />
                </div>
                <span className="text-xs" style={{ color: currentStep >= s.num ? ACCENT_COLOR : '#9ca3af' }}>{s.label}</span>
              </div>
              {i < 1 && <div className="w-16 h-1 rounded mx-3 mb-5" style={{ backgroundColor: currentStep > s.num ? ACCENT_COLOR : '#e5e7eb' }} />}
            </div>
          ))}
        </div>

        <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: '#fff', boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
          <div className="p-8">

            {/* Step 2: Selfie */}
            {currentStep === 2 && (
              <div>
                <h2 className="mb-2" style={{ fontFamily: 'Oswald, sans-serif', fontSize: '1.5rem', letterSpacing: '0.03em', color: '#1e2d4a' }}>
                  Identity Selfie
                </h2>
                <p className="text-sm text-gray-500 mb-6">Take a clear selfie for identity verification.</p>
                <SelfieCapture onCapture={(dataUrl) => setSelfieDataUrl(dataUrl)} accentColor={ACCENT_COLOR} />
                {submitError && (
                  <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">{submitError}</div>
                )}
                <div className="flex gap-4 mt-6">
                  <button type="button" onClick={() => setCurrentStep(1)}
                    className="flex items-center gap-2 px-6 py-3.5 rounded-lg transition-opacity"
                    style={{ border: `2px solid ${ACCENT_COLOR}`, color: ACCENT_COLOR, fontFamily: 'Oswald, sans-serif', letterSpacing: '0.08em', fontSize: '14px' }}>
                    <ArrowLeft className="w-4 h-4" /> BACK
                  </button>
                  <button type="button" onClick={submitRegistration} disabled={submitting}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg text-white disabled:opacity-50"
                    style={{ backgroundColor: ACCENT_COLOR, fontFamily: 'Oswald, sans-serif', letterSpacing: '0.08em', fontSize: '14px' }}>
                    {submitting ? 'SUBMITTING…' : selfieDataUrl ? 'SUBMIT APPLICATION' : 'SKIP & SUBMIT'} <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 1: Application form */}
            {currentStep === 1 && (
              <form onSubmit={handleSubmit(onFormSubmit)}>
                <div className="space-y-6">
                  {/* Membership number with live validation */}
                  <div>
                    <label className="block mb-2 text-sm" style={{ color: '#374151', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.04em' }}>
                      BOZ MEMBERSHIP NUMBER *
                    </label>
                    <div className="relative">
                      <input
                        {...register('membershipNumber', { required: true })}
                        placeholder="BOZ-2026-XXXXXX"
                        className="w-full px-4 py-3 rounded-lg pr-10"
                        style={{
                          border: `1px solid ${membershipValid === false ? '#ef4444' : membershipValid === true ? '#16a34a' : '#d1d5db'}`,
                          outline: 'none',
                        }}
                        onFocus={(e) => { if (membershipValid === null) e.target.style.borderColor = ACCENT_COLOR; }}
                        onBlur={(e) => { checkMembership(e.target.value); }}
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        {membershipChecking && <Loader2 size={16} className="animate-spin text-gray-400" />}
                        {!membershipChecking && membershipValid === true && <BadgeCheck size={16} className="text-green-600" />}
                        {!membershipChecking && membershipValid === false && <XCircle size={16} className="text-red-500" />}
                      </div>
                    </div>

                    {/* Validation feedback */}
                    {membershipValid === true && membershipInfo?.fullName && (
                      <div className="mt-2 flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                        <BadgeCheck size={14} className="shrink-0" />
                        <span>Verified: <strong>{membershipInfo.fullName}</strong> — Active BOZ Member</span>
                      </div>
                    )}
                    {membershipValid === false && membershipInfo?.error && (
                      <div className="mt-2 flex items-start gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                        <XCircle size={14} className="shrink-0 mt-0.5" />
                        <span>{membershipInfo.error}</span>
                      </div>
                    )}
                    {membershipValid === null && !membershipChecking && (
                      <p className="text-xs mt-1" style={{ color: '#9ca3af' }}>
                        Enter your membership number (e.g. BOZ-2026-123456). Only active members may apply.
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block mb-2 text-sm" style={{ color: '#374151', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.04em' }}>
                      CONTACT NUMBER (VERIFIED)
                    </label>
                    <input
                      type="tel"
                      value={verifiedPhone}
                      disabled
                      className="w-full px-4 py-3 rounded-lg"
                      style={{ border: '1px solid #d1d5db', backgroundColor: `${ACCENT_COLOR}08`, color: ACCENT_COLOR }}
                    />
                  </div>

                  <div>
                    <label className="block mb-2 text-sm" style={{ color: '#374151', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.04em' }}>
                      UNIVERSITY *
                    </label>
                    <select
                      {...register('university', { required: true })}
                      className="w-full px-4 py-3 rounded-lg"
                      style={{ border: '1px solid #d1d5db', outline: 'none' }}
                      onFocus={(e) => e.target.style.borderColor = ACCENT_COLOR}
                      onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                    >
                      <option value="">Select University</option>
                      {zambianUniversities.map(uni => (
                        <option key={uni} value={uni}>{uni}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block mb-2 text-sm" style={{ color: '#374151', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.04em' }}>
                      COURSE / PROGRAM OF STUDY *
                    </label>
                    <input
                      {...register('course', { required: true })}
                      placeholder="e.g., Bachelor of Business Administration"
                      className="w-full px-4 py-3 rounded-lg"
                      style={{ border: '1px solid #d1d5db', outline: 'none' }}
                      onFocus={(e) => e.target.style.borderColor = ACCENT_COLOR}
                      onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                    />
                  </div>

                  <div>
                    <label className="block mb-2 text-sm" style={{ color: '#374151', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.04em' }}>
                      YEAR OF STUDY *
                    </label>
                    <select
                      {...register('yearOfStudy', { required: true })}
                      className="w-full px-4 py-3 rounded-lg"
                      style={{ border: '1px solid #d1d5db', outline: 'none' }}
                      onFocus={(e) => e.target.style.borderColor = ACCENT_COLOR}
                      onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                    >
                      <option value="">Select Year</option>
                      <option value="1">Year 1</option>
                      <option value="2">Year 2</option>
                      <option value="3">Year 3</option>
                      <option value="4">Year 4</option>
                      <option value="5">Year 5</option>
                    </select>
                  </div>

                  <div>
                    <label className="block mb-2 text-sm" style={{ color: '#374151', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.04em' }}>
                      TWO-FACTOR VERIFICATION CODE *
                    </label>
                    <input
                      {...register('twoFactorCode', { required: true, minLength: 6, maxLength: 6 })}
                      type="text"
                      maxLength={6}
                      placeholder="000000"
                      className="w-full px-4 py-3 rounded-lg text-center text-xl tracking-widest"
                      style={{ border: '1px solid #d1d5db', outline: 'none', letterSpacing: '0.5em' }}
                      onFocus={(e) => e.target.style.borderColor = ACCENT_COLOR}
                      onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={membershipValid === false || membershipChecking}
                  className="w-full mt-8 flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg text-white transition-opacity disabled:opacity-50"
                  style={{ backgroundColor: ACCENT_COLOR, fontFamily: 'Oswald, sans-serif', letterSpacing: '0.08em', fontSize: '14px' }}
                  onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                >
                  {membershipChecking ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> VERIFYING MEMBERSHIP…</>
                  ) : (
                    <>CONTINUE TO SELFIE <ArrowRight className="w-4 h-4" /></>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
