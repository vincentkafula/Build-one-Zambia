import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useForm } from 'react-hook-form';
import { Globe2, Lock, ArrowRight, ArrowLeft, CheckCircle, Eye, EyeOff, Copy, Loader2 } from 'lucide-react';
import { registrationApi } from '../../lib/api';

const ACCENT_COLOR = '#16a34a';

interface IntlPartyFormData {
  partyName: string;
  country: string;
  headquartersAddress: string;
  contactPerson: string;
  contactTitle: string;
  phone: string;
  email: string;
  website: string;
  affiliationType: string;
  password: string;
  confirmPassword: string;
  pin: string;
  confirmPin: string;
}

const AFFILIATION_TYPES = [
  'Sister-party relationship',
  'Observer / delegation exchange',
  'Policy & training partnership',
  'Election-monitoring partnership',
  'Other',
];

export default function IntlPartyRegistration() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formComplete, setFormComplete] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [securityError, setSecurityError] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [copied, setCopied] = useState('');
  const [registrationId, setRegistrationId] = useState('');
  const [activatedInfo, setActivatedInfo] = useState<null | { username: string }>(null);

  const { register, handleSubmit, watch } = useForm<IntlPartyFormData>();

  const onStep1Submit = (data: IntlPartyFormData) => {
    if (!data.partyName || !data.country || !data.contactPerson || !data.phone || !data.email) {
      alert('Please fill in all required fields');
      return;
    }
    setCurrentStep(2);
  };

  const onStep2Submit = async () => {
    const data = watch();
    setSecurityError('');
    if (!data.password || data.password.length < 8) {
      setSecurityError('Password must be at least 8 characters.');
      return;
    }
    if (data.password !== data.confirmPassword) {
      setSecurityError('Passwords do not match.');
      return;
    }
    if (!/^\d{4,6}$/.test(data.pin || '')) {
      setSecurityError('PIN must be 4–6 digits.');
      return;
    }
    if (data.pin !== data.confirmPin) {
      setSecurityError('PINs do not match.');
      return;
    }

    setSubmitting(true);
    setSubmitError('');
    try {
      const res = await registrationApi.submitIntlParty({
        partyName: data.partyName,
        country: data.country,
        headquartersAddress: data.headquartersAddress,
        contactPerson: data.contactPerson,
        contactTitle: data.contactTitle,
        phone: data.phone,
        email: data.email,
        website: data.website,
        affiliationType: data.affiliationType,
        password: data.password,
        pin: data.pin,
      });
      if (res.registration?.id) setRegistrationId(res.registration.id as string);
      setFormComplete(true);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  function copyText(text: string, key: string) {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(''), 2500);
    });
  }

  if (formComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12" style={{ backgroundColor: '#fafafa' }}>
        <div className="w-full max-w-2xl relative text-center">
          <div className="rounded-2xl p-12" style={{ backgroundColor: '#fff', boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: `${ACCENT_COLOR}15`, border: `3px solid ${ACCENT_COLOR}` }}>
              <CheckCircle className="w-10 h-10" style={{ color: ACCENT_COLOR }} />
            </div>

            <h1 className="mb-4" style={{ fontFamily: 'Oswald, sans-serif', fontSize: '2.2rem', letterSpacing: '0.03em', color: '#1e2d4a' }}>
              APPLICATION RECEIVED
            </h1>

            <p className="mb-8 text-lg" style={{ color: '#6b7280' }}>
              Thank you — your party's application to affiliate with Build One Zambia has been submitted.
            </p>

            <div className="p-6 rounded-lg mb-6 text-left" style={{ backgroundColor: `${ACCENT_COLOR}08`, border: `1px solid ${ACCENT_COLOR}30` }}>
              <p className="text-sm font-semibold mb-2" style={{ color: '#1e2d4a' }}>What happens next?</p>
              <ul className="text-sm space-y-1 list-disc list-inside" style={{ color: '#4b5563' }}>
                <li>Our international relations team will review your application</li>
                <li>Your login is already created with the password and PIN you set — it just stays inactive until approved</li>
                {registrationId && <li>Reference: <span className="font-mono">{registrationId}</span></li>}
              </ul>
            </div>

            {activatedInfo ? (
              <div className="p-4 rounded-lg mb-6 text-left" style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                <p className="text-sm font-semibold text-green-800 mb-1">Approved — account active</p>
                <div className="flex items-center justify-between">
                  <code className="text-sm font-mono text-gray-900">{activatedInfo.username}</code>
                  <button onClick={() => copyText(activatedInfo.username, 'u')} className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg border" style={{ color: ACCENT_COLOR, borderColor: ACCENT_COLOR }}>
                    <Copy size={12} /> {copied === 'u' ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">Log in with the password and PIN you created when you applied.</p>
              </div>
            ) : registrationId && (
              <button
                onClick={async () => {
                  try {
                    const res = await registrationApi.getIntlPartyCredentials(registrationId);
                    if (res.activated) setActivatedInfo({ username: res.username || '' });
                  } catch { /* not yet approved */ }
                }}
                className="w-full py-3 rounded-lg text-white font-semibold mb-4"
                style={{ backgroundColor: ACCENT_COLOR }}
              >
                Check Application Status
              </button>
            )}

            <button onClick={() => navigate('/')} className="text-sm underline" style={{ color: '#9ca3af' }}>
              Return to home page
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-12" style={{ backgroundColor: '#fafafa' }}>
      <div className="max-w-2xl mx-auto relative">
        <div className="text-center mb-8">
          <h1 className="mb-2" style={{ fontFamily: 'Oswald, sans-serif', fontSize: '2.2rem', letterSpacing: '0.03em', color: '#1e2d4a' }}>
            INTERNATIONAL POLITICAL PARTY REGISTRATION
          </h1>
          <p className="text-sm" style={{ color: '#6b7280' }}>
            Apply to formally affiliate or partner with Build One Zambia
          </p>
        </div>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex items-center justify-center mb-3">
            {[
              { num: 1, label: 'Party Details', icon: Globe2 },
              { num: 2, label: 'Security', icon: Lock },
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
                {idx < 1 && (
                  <div className="w-24 h-1 mx-3 rounded" style={{ backgroundColor: currentStep > step.num ? ACCENT_COLOR : '#e5e7eb' }} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl overflow-hidden mb-6" style={{ backgroundColor: '#fff', boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
          <div className="p-8">
            {currentStep === 1 && (
              <form onSubmit={handleSubmit(onStep1Submit)}>
                <h2 className="mb-6" style={{ fontFamily: 'Oswald, sans-serif', fontSize: '1.4rem', letterSpacing: '0.03em', color: '#1e2d4a' }}>
                  Step 1: Party Details
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: '#374151' }}>Party Name *</label>
                    <input {...register('partyName', { required: true })} placeholder="e.g. Democratic Alliance of..."
                      className="w-full px-4 py-3 rounded-lg" style={{ border: '1px solid #d1d5db' }} />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1.5" style={{ color: '#374151' }}>Country *</label>
                      <input {...register('country', { required: true })} placeholder="e.g. South Africa"
                        className="w-full px-4 py-3 rounded-lg" style={{ border: '1px solid #d1d5db' }} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5" style={{ color: '#374151' }}>Website</label>
                      <input {...register('website')} placeholder="https://"
                        className="w-full px-4 py-3 rounded-lg" style={{ border: '1px solid #d1d5db' }} />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: '#374151' }}>Headquarters Address</label>
                    <input {...register('headquartersAddress')} placeholder="Street, city, country"
                      className="w-full px-4 py-3 rounded-lg" style={{ border: '1px solid #d1d5db' }} />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1.5" style={{ color: '#374151' }}>Contact Person *</label>
                      <input {...register('contactPerson', { required: true })} placeholder="Full name"
                        className="w-full px-4 py-3 rounded-lg" style={{ border: '1px solid #d1d5db' }} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5" style={{ color: '#374151' }}>Their Title</label>
                      <input {...register('contactTitle')} placeholder="e.g. Secretary-General"
                        className="w-full px-4 py-3 rounded-lg" style={{ border: '1px solid #d1d5db' }} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1.5" style={{ color: '#374151' }}>Phone *</label>
                      <input {...register('phone', { required: true })} placeholder="+___ __ ___ ____"
                        className="w-full px-4 py-3 rounded-lg" style={{ border: '1px solid #d1d5db' }} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5" style={{ color: '#374151' }}>Email *</label>
                      <input type="email" {...register('email', { required: true })} placeholder="office@party.org"
                        className="w-full px-4 py-3 rounded-lg" style={{ border: '1px solid #d1d5db' }} />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: '#374151' }}>Type of Affiliation Sought</label>
                    <select {...register('affiliationType')} className="w-full px-4 py-3 rounded-lg" style={{ border: '1px solid #d1d5db' }}>
                      <option value="">Select one</option>
                      {AFFILIATION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg text-white mt-8"
                  style={{ backgroundColor: ACCENT_COLOR, fontFamily: 'Oswald, sans-serif', letterSpacing: '0.08em', fontSize: '14px' }}
                >
                  CONTINUE <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}

            {currentStep === 2 && (
              <div>
                <h2 className="mb-2" style={{ fontFamily: 'Oswald, sans-serif', fontSize: '1.4rem', letterSpacing: '0.03em', color: '#1e2d4a' }}>
                  Step 2: Create Your Login
                </h2>
                <p className="text-sm text-gray-500 mb-6">
                  Choose the password and PIN your party's contact person will use to log in and manage
                  your party's profile. The account is created now but stays inactive until an admin
                  approves the application.
                </p>

                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: '#374151' }}>Password</label>
                    <div className="relative">
                      <input
                        type={showPass ? 'text' : 'password'}
                        {...register('password', { required: true, minLength: 8 })}
                        className="w-full px-4 py-3 rounded-lg pr-11"
                        style={{ border: '1px solid #d1d5db' }}
                        placeholder="At least 8 characters"
                      />
                      <button type="button" onClick={() => setShowPass(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                        {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: '#374151' }}>Confirm Password</label>
                    <input
                      type={showPass ? 'text' : 'password'}
                      {...register('confirmPassword', { required: true })}
                      className="w-full px-4 py-3 rounded-lg"
                      style={{ border: '1px solid #d1d5db' }}
                      placeholder="Re-enter your password"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1.5" style={{ color: '#374151' }}>PIN (4–6 digits)</label>
                      <input
                        type={showPin ? 'text' : 'password'}
                        inputMode="numeric"
                        {...register('pin', { required: true, pattern: /^\d{4,6}$/ })}
                        className="w-full px-4 py-3 rounded-lg"
                        style={{ border: '1px solid #d1d5db' }}
                        placeholder="e.g. 4821"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5" style={{ color: '#374151' }}>Confirm PIN</label>
                      <input
                        type={showPin ? 'text' : 'password'}
                        inputMode="numeric"
                        {...register('confirmPin', { required: true })}
                        className="w-full px-4 py-3 rounded-lg"
                        style={{ border: '1px solid #d1d5db' }}
                        placeholder="Re-enter your PIN"
                      />
                    </div>
                  </div>
                  <button type="button" onClick={() => setShowPin(s => !s)} className="text-xs" style={{ color: ACCENT_COLOR }}>
                    {showPin ? 'Hide PIN' : 'Show PIN'}
                  </button>
                </div>

                {securityError && (
                  <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">{securityError}</div>
                )}
                {submitError && (
                  <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">{submitError}</div>
                )}

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg transition-opacity"
                    style={{ border: `2px solid ${ACCENT_COLOR}`, color: ACCENT_COLOR, fontFamily: 'Oswald, sans-serif', letterSpacing: '0.08em', fontSize: '14px' }}
                  >
                    <ArrowLeft className="w-4 h-4" /> BACK
                  </button>
                  <button
                    type="button"
                    onClick={onStep2Submit}
                    disabled={submitting}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg text-white disabled:opacity-50"
                    style={{ backgroundColor: ACCENT_COLOR, fontFamily: 'Oswald, sans-serif', letterSpacing: '0.08em', fontSize: '14px' }}
                  >
                    {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> SUBMITTING…</> : <>SUBMIT APPLICATION <ArrowRight className="w-4 h-4" /></>}
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
