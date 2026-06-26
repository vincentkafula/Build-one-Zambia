import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useForm } from 'react-hook-form';
import { PhoneVerification } from '../../components/registration/PhoneVerification';
import { ArrowRight, ArrowLeft, CheckCircle, Users, UserCheck, Camera, Loader2, XCircle, BadgeCheck, AlertCircle } from 'lucide-react';
import { SelfieCapture } from '../../components/registration/SelfieCapture';
import { registrationApi } from '../../lib/api';

const ACCENT_COLOR = '#16a34a';

interface CooperativeFormData {
  cooperativeName: string;
  chiefName: string;
  villageName: string;
  groupChairperson: string;
  cellNumber: string;
  members: {
    membershipNumber: string;
    twoFactorCode: string;
  }[];
}

export default function CooperativeRegistration() {
  const navigate = useNavigate();
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [verifiedPhone, setVerifiedPhone] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const [formComplete, setFormComplete] = useState(false);
  const [selfieDataUrl, setSelfieDataUrl] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Membership batch validation state
  const [validatingMembers, setValidatingMembers] = useState(false);
  const [memberValidation, setMemberValidation] = useState<{
    results: Record<string, { valid: boolean; fullName?: string; error?: string }>;
    invalidNumbers: string[];
  } | null>(null);

  const { register, handleSubmit, watch, setValue } = useForm<CooperativeFormData>({
    defaultValues: {
      members: Array.from({ length: 20 }, () => ({ membershipNumber: '', twoFactorCode: '' })),
    },
  });

  const members = watch('members') || [];

  const onStep1Submit = (data: CooperativeFormData) => {
    if (!data.cooperativeName || !data.chiefName || !data.villageName || !data.groupChairperson) {
      alert('Please fill in all cooperative details');
      return;
    }
    setCurrentStep(2);
  };

  const onStep2Submit = async (data: CooperativeFormData) => {
    const allMembersFilled = data.members.every(m => m.membershipNumber && m.twoFactorCode && m.twoFactorCode.length === 6);
    if (!allMembersFilled) {
      alert('Please ensure all 20 members have valid membership numbers and 6-digit verification codes');
      return;
    }

    // Validate all 20 membership numbers against the BOZ membership register
    setValidatingMembers(true);
    setMemberValidation(null);
    try {
      const numbers = data.members.map(m => m.membershipNumber.trim());
      const res = await registrationApi.validateMemberships(numbers);
      setMemberValidation({ results: res.results, invalidNumbers: res.invalidNumbers });
      if (res.invalidCount > 0) {
        setValidatingMembers(false);
        return; // Errors shown in UI — do not advance
      }
    } catch {
      alert('Could not verify membership numbers. Please check your connection and try again.');
      setValidatingMembers(false);
      return;
    }
    setValidatingMembers(false);
    setCurrentStep(3);
  };

  const submitRegistration = async () => {
    setSubmitting(true);
    setSubmitError('');
    const data = watch();
    try {
      const membershipNumbers = data.members.map(m => m.membershipNumber.trim());
      await registrationApi.submitCooperative({
        cooperativeName: data.cooperativeName,
        contactPerson: data.groupChairperson,
        contactPhone: verifiedPhone,
        nrcId: '',
        members: 20,
        membershipNumbers,
        type: 'agricultural',
        province: '',
        district: '',
        constituency: '',
        address: `${data.villageName}, Chief ${data.chiefName}`,
        selfieDataUrl: selfieDataUrl ?? undefined,
      });
      setFormComplete(true);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Submission failed. Please try again.');
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
        title="Cooperative Registration"
      />
    );
  }

  if (formComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12" style={{ backgroundColor: '#fafafa' }}>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ opacity: 0.05 }}>
          <div style={{ fontSize: '20rem', fontFamily: 'Oswald, sans-serif', color: ACCENT_COLOR, fontWeight: 'bold' }}>BOZ</div>
        </div>

        <div className="w-full max-w-2xl relative text-center">
          <div className="rounded-2xl p-12" style={{ backgroundColor: '#fff', boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: `${ACCENT_COLOR}15`, border: `3px solid ${ACCENT_COLOR}` }}>
              <CheckCircle className="w-10 h-10" style={{ color: ACCENT_COLOR }} />
            </div>

            <h1 className="mb-4" style={{ fontFamily: 'Oswald, sans-serif', fontSize: '2.5rem', letterSpacing: '0.03em', color: '#1e2d4a' }}>
              COOPERATIVE REGISTERED
            </h1>

            <p className="mb-8 text-lg" style={{ color: '#6b7280' }}>
              Your cooperative has been successfully registered with Build One Zambia!
            </p>

            <div className="p-6 rounded-lg mb-6" style={{ backgroundColor: `${ACCENT_COLOR}08`, border: `1px solid ${ACCENT_COLOR}30` }}>
              <p className="text-sm mb-2" style={{ color: '#6b7280' }}>Cooperative ID</p>
              <p className="text-2xl" style={{ fontFamily: 'Oswald, sans-serif', color: ACCENT_COLOR, letterSpacing: '0.1em' }}>
                COOP-{new Date().getFullYear()}-{Math.floor(100000 + Math.random() * 900000)}
              </p>
            </div>

            <p className="text-sm" style={{ color: '#9ca3af' }}>
              Redirecting to home page...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-12" style={{ backgroundColor: '#fafafa' }}>
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ opacity: 0.05 }}>
        <div style={{ fontSize: '20rem', fontFamily: 'Oswald, sans-serif', color: ACCENT_COLOR, fontWeight: 'bold' }}>BOZ</div>
      </div>

      <div className="max-w-4xl mx-auto relative">
        <div className="text-center mb-8">
          <h1 className="mb-2" style={{ fontFamily: 'Oswald, sans-serif', fontSize: '2.5rem', letterSpacing: '0.03em', color: '#1e2d4a' }}>
            COOPERATIVE REGISTRATION
          </h1>
          <p className="text-sm" style={{ color: '#6b7280' }}>
            Register your 20-member cooperative group
          </p>
        </div>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex items-center justify-center mb-3">
            {[
              { num: 1, label: 'Coop Details', icon: Users },
              { num: 2, label: '20 Members', icon: UserCheck },
              { num: 3, label: 'Selfie', icon: Camera },
            ].map((step, idx) => (
              <div key={step.num} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-all"
                    style={{
                      backgroundColor: currentStep >= step.num ? ACCENT_COLOR : '#e5e7eb',
                      color: currentStep >= step.num ? '#fff' : '#9ca3af',
                    }}
                  >
                    <step.icon className="w-4 h-4" />
                  </div>
                  <span className="text-xs text-center" style={{ color: currentStep >= step.num ? ACCENT_COLOR : '#9ca3af' }}>
                    {step.label}
                  </span>
                </div>
                {idx < 2 && (
                  <div className="w-20 h-1 mx-3 rounded" style={{ backgroundColor: currentStep > step.num ? ACCENT_COLOR : '#e5e7eb' }} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl overflow-hidden mb-6" style={{ backgroundColor: '#fff', boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
          <div className="p-8">
            {currentStep === 1 && (
              <form onSubmit={handleSubmit(onStep1Submit)}>
                <h2 className="mb-6" style={{ fontFamily: 'Oswald, sans-serif', fontSize: '1.5rem', letterSpacing: '0.03em', color: '#1e2d4a' }}>
                  Step 1: Cooperative Details
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block mb-2 text-sm" style={{ color: '#374151', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.04em' }}>
                      COOPERATIVE NAME *
                    </label>
                    <input
                      {...register('cooperativeName', { required: true })}
                      className="w-full px-4 py-3 rounded-lg"
                      style={{ border: '1px solid #d1d5db', outline: 'none' }}
                      onFocus={(e) => e.target.style.borderColor = ACCENT_COLOR}
                      onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                    />
                  </div>

                  <div>
                    <label className="block mb-2 text-sm" style={{ color: '#374151', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.04em' }}>
                      CHIEF NAME *
                    </label>
                    <input
                      {...register('chiefName', { required: true })}
                      className="w-full px-4 py-3 rounded-lg"
                      style={{ border: '1px solid #d1d5db', outline: 'none' }}
                      onFocus={(e) => e.target.style.borderColor = ACCENT_COLOR}
                      onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                    />
                  </div>

                  <div>
                    <label className="block mb-2 text-sm" style={{ color: '#374151', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.04em' }}>
                      VILLAGE NAME *
                    </label>
                    <input
                      {...register('villageName', { required: true })}
                      className="w-full px-4 py-3 rounded-lg"
                      style={{ border: '1px solid #d1d5db', outline: 'none' }}
                      onFocus={(e) => e.target.style.borderColor = ACCENT_COLOR}
                      onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                    />
                  </div>

                  <div>
                    <label className="block mb-2 text-sm" style={{ color: '#374151', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.04em' }}>
                      GROUP CHAIRPERSON *
                    </label>
                    <input
                      {...register('groupChairperson', { required: true })}
                      className="w-full px-4 py-3 rounded-lg"
                      style={{ border: '1px solid #d1d5db', outline: 'none' }}
                      onFocus={(e) => e.target.style.borderColor = ACCENT_COLOR}
                      onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                    />
                  </div>

                  <div className="md:col-span-2">
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
                </div>

                <button
                  type="submit"
                  className="w-full mt-8 flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg text-white transition-opacity"
                  style={{ backgroundColor: ACCENT_COLOR, fontFamily: 'Oswald, sans-serif', letterSpacing: '0.08em', fontSize: '14px' }}
                  onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                >
                  CONTINUE TO MEMBER DETAILS <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}

            {currentStep === 2 && (
              <form onSubmit={handleSubmit(onStep2Submit)}>
                <h2 className="mb-6" style={{ fontFamily: 'Oswald, sans-serif', fontSize: '1.5rem', letterSpacing: '0.03em', color: '#1e2d4a' }}>
                  Step 2: 20 Member Details
                </h2>

                <div className="mb-4 p-4 rounded-lg" style={{ backgroundColor: `${ACCENT_COLOR}08`, border: `1px solid ${ACCENT_COLOR}30` }}>
                  <p className="text-sm" style={{ color: '#374151' }}>
                    Enter the <strong>BOZ membership number</strong> (format: BOZ-YYYY-XXXXXX) and verification code for all 20 members. Only active BOZ party members are accepted.
                  </p>
                </div>

                {/* Batch validation error summary */}
                {memberValidation && memberValidation.invalidNumbers.length > 0 && (
                  <div className="mb-4 p-4 rounded-lg border border-red-200 bg-red-50">
                    <div className="flex items-start gap-2 mb-2">
                      <AlertCircle size={16} className="text-red-600 shrink-0 mt-0.5" />
                      <p className="text-sm text-red-800 font-semibold">
                        {memberValidation.invalidNumbers.length} member(s) failed membership verification
                      </p>
                    </div>
                    <ul className="text-xs text-red-700 space-y-1 list-disc list-inside">
                      {memberValidation.invalidNumbers.map(num => (
                        <li key={num}>
                          <code>{num}</code>: {memberValidation.results[num]?.error || 'Not a valid active member'}
                        </li>
                      ))}
                    </ul>
                    <p className="text-xs text-red-600 mt-2">Please correct these membership numbers before proceeding.</p>
                  </div>
                )}

                <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2">
                  {Array.from({ length: 20 }).map((_, index) => {
                    const memberNum = members[index]?.membershipNumber;
                    const valResult = memberValidation?.results[memberNum];
                    const isInvalid = valResult && !valResult.valid;
                    const isValid = valResult && valResult.valid;
                    return (
                      <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-lg" style={{ backgroundColor: isInvalid ? '#fef2f2' : isValid ? '#f0fdf4' : '#fafafa', border: `1px solid ${isInvalid ? '#fecaca' : isValid ? '#bbf7d0' : '#e5e7eb'}` }}>
                        <div className="md:col-span-2 flex items-center justify-between">
                          <p className="text-sm" style={{ color: ACCENT_COLOR, fontFamily: 'Oswald, sans-serif', letterSpacing: '0.04em' }}>
                            MEMBER {index + 1}
                          </p>
                          {isValid && (
                            <span className="flex items-center gap-1 text-xs text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                              <BadgeCheck size={11} /> {valResult?.fullName || 'Verified'}
                            </span>
                          )}
                          {isInvalid && (
                            <span className="flex items-center gap-1 text-xs text-red-700 bg-red-100 px-2 py-0.5 rounded-full">
                              <XCircle size={11} /> Invalid
                            </span>
                          )}
                        </div>

                        <div>
                          <label className="block mb-2 text-xs" style={{ color: '#6b7280', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.04em' }}>
                            MEMBERSHIP NUMBER *
                          </label>
                          <input
                            {...register(`members.${index}.membershipNumber`, { required: true })}
                            placeholder="BOZ-2026-XXXXXX"
                            className="w-full px-3 py-2 rounded-lg text-sm"
                            style={{ border: `1px solid ${isInvalid ? '#ef4444' : isValid ? '#16a34a' : '#d1d5db'}`, outline: 'none' }}
                            onFocus={(e) => e.target.style.borderColor = ACCENT_COLOR}
                            onBlur={(e) => { if (!isValid && !isInvalid) e.target.style.borderColor = '#d1d5db'; }}
                            onChange={() => { if (memberValidation) setMemberValidation(null); }}
                          />
                        </div>

                        <div>
                          <label className="block mb-2 text-xs" style={{ color: '#6b7280', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.04em' }}>
                            2FA CODE *
                          </label>
                          <input
                            {...register(`members.${index}.twoFactorCode`, { required: true, minLength: 6, maxLength: 6 })}
                            type="text"
                            maxLength={6}
                            placeholder="000000"
                            className="w-full px-3 py-2 rounded-lg text-sm text-center tracking-wider"
                            style={{ border: '1px solid #d1d5db', outline: 'none' }}
                            onFocus={(e) => e.target.style.borderColor = ACCENT_COLOR}
                            onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex gap-4 mt-8">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg transition-opacity"
                    style={{ border: `2px solid ${ACCENT_COLOR}`, color: ACCENT_COLOR, fontFamily: 'Oswald, sans-serif', letterSpacing: '0.08em', fontSize: '14px' }}
                    onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
                    onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                  >
                    <ArrowLeft className="w-4 h-4" /> BACK
                  </button>
                  <button
                    type="submit"
                    disabled={validatingMembers}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg text-white transition-opacity disabled:opacity-60"
                    style={{ backgroundColor: ACCENT_COLOR, fontFamily: 'Oswald, sans-serif', letterSpacing: '0.08em', fontSize: '14px' }}
                    onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
                    onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                  >
                    {validatingMembers ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> VERIFYING MEMBERSHIPS…</>
                    ) : (
                      <>CONTINUE TO SELFIE <ArrowRight className="w-4 h-4" /></>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* Step 3: Selfie */}
            {currentStep === 3 && (
              <div>
                <h2 className="mb-2" style={{ fontFamily: 'Oswald, sans-serif', fontSize: '1.5rem', letterSpacing: '0.03em', color: '#1e2d4a' }}>
                  Step 3: Chairperson Identity Selfie
                </h2>
                <p className="text-sm text-gray-500 mb-6">
                  The group chairperson must take a selfie for identity verification of the cooperative registration.
                </p>
                <SelfieCapture onCapture={(dataUrl) => setSelfieDataUrl(dataUrl)} accentColor={ACCENT_COLOR} />
                {submitError && (
                  <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">{submitError}</div>
                )}
                <div className="flex gap-4 mt-6">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg transition-opacity"
                    style={{ border: `2px solid ${ACCENT_COLOR}`, color: ACCENT_COLOR, fontFamily: 'Oswald, sans-serif', letterSpacing: '0.08em', fontSize: '14px' }}
                    onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
                    onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                  >
                    <ArrowLeft className="w-4 h-4" /> BACK
                  </button>
                  <button
                    type="button"
                    onClick={submitRegistration}
                    disabled={submitting}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg text-white disabled:opacity-50"
                    style={{ backgroundColor: ACCENT_COLOR, fontFamily: 'Oswald, sans-serif', letterSpacing: '0.08em', fontSize: '14px' }}
                    onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
                    onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                  >
                    {submitting ? 'SUBMITTING…' : selfieDataUrl ? 'SUBMIT COOPERATIVE' : 'SKIP & SUBMIT'} <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
