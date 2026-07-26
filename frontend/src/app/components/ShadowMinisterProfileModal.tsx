import { useState } from 'react';
import { X, Quote, Mail } from 'lucide-react';
import type { ShadowMember } from '../lib/api';
import { shadowCabinetApi } from '../lib/api';
import { ShadowMinisterContactModal } from './ShadowMinisterContactModal';

const O = '#f97316';
const NAVY = '#1e2d4a';

interface Props {
  member: ShadowMember;
  onClose: () => void;
}

export function ShadowMinisterProfileModal({ member, onClose }: Props) {
  const [contacting, setContacting] = useState(false);
  const [imgError, setImgError] = useState(false);

  return (
    <>
      <div
        className="fixed inset-0 z-[190] flex items-center justify-center p-4"
        style={{ backgroundColor: 'rgba(17,24,39,0.6)' }}
        onClick={onClose}
      >
        <div
          className="relative w-full max-w-2xl rounded-2xl overflow-hidden"
          style={{ backgroundColor: '#ffffff', boxShadow: 'var(--shadow-xl, 0 24px 48px -12px rgba(15,23,42,0.28))', maxHeight: '88vh', display: 'flex', flexDirection: 'column' }}
          onClick={e => e.stopPropagation()}
        >
          <button onClick={onClose} aria-label="Close" className="absolute top-4 right-4 p-1.5 rounded-lg z-10" style={{ color: '#fff', backgroundColor: 'rgba(0,0,0,0.35)' }}>
            <X size={18} />
          </button>

          <div className="overflow-y-auto">
            <div className="grid grid-cols-1 sm:grid-cols-[220px_1fr]">
              {/* Photo */}
              <div className="relative" style={{ backgroundColor: '#0d1810', minHeight: '220px' }}>
                {!imgError ? (
                  <img
                    src={shadowCabinetApi.photoUrl(member.id, member.gender)}
                    alt={member.name}
                    onError={() => setImgError(true)}
                    className="w-full h-full object-cover"
                    style={{ position: 'absolute', inset: 0 }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center" style={{ position: 'absolute', inset: 0, color: 'rgba(255,255,255,0.3)' }}>
                    <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: '2.5rem' }}>{member.name.charAt(0)}</span>
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="p-6">
                {member.constituency && (
                  <span className="inline-block text-xs px-3 py-1 rounded-full mb-3" style={{ backgroundColor: 'rgba(249,115,22,0.1)', color: O, fontFamily: 'Oswald, sans-serif', letterSpacing: '0.06em' }}>
                    {member.constituency}
                  </span>
                )}
                <h2 style={{ fontFamily: 'Oswald, sans-serif', fontSize: '1.4rem', letterSpacing: '0.02em', color: NAVY, marginBottom: 4 }}>{member.name}</h2>
                <p className="text-sm mb-1" style={{ color: O, fontFamily: 'Oswald, sans-serif', letterSpacing: '0.02em' }}>{member.role}</p>
                {member.credentials && <p className="text-xs mb-4" style={{ color: '#9ca3af' }}>{member.credentials}</p>}

                {member.headline && (
                  <p className="text-sm mb-4" style={{ color: '#374151', lineHeight: 1.6, fontStyle: 'italic' }}>{member.headline}</p>
                )}

                {member.bio1 && <p className="text-sm mb-3" style={{ color: '#4b5563', lineHeight: 1.7 }}>{member.bio1}</p>}
                {member.bio2 && <p className="text-sm mb-3" style={{ color: '#4b5563', lineHeight: 1.7 }}>{member.bio2}</p>}

                {member.quote && (
                  <div className="flex gap-2 mt-4 mb-2 p-3 rounded-lg" style={{ backgroundColor: '#f9fafb', borderLeft: `3px solid ${O}` }}>
                    <Quote size={16} style={{ color: O, flexShrink: 0, marginTop: 2 }} />
                    <div>
                      <p className="text-sm" style={{ color: '#374151', fontStyle: 'italic', lineHeight: 1.6 }}>{member.quote}</p>
                      {member.signature && <p className="text-xs mt-2" style={{ color: '#9ca3af' }}>— {member.signature}</p>}
                    </div>
                  </div>
                )}

                {member.focus && (
                  <p className="text-xs mt-4" style={{ color: O, fontFamily: 'Oswald, sans-serif', letterSpacing: '0.06em' }}>KEY FOCUS: {member.focus}</p>
                )}

                <button
                  onClick={() => setContacting(true)}
                  className="mt-6 flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm text-white"
                  style={{ backgroundColor: O, fontFamily: 'Oswald, sans-serif', letterSpacing: '0.06em' }}
                >
                  <Mail size={15} /> SEND A MESSAGE
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {contacting && (
        <ShadowMinisterContactModal
          minister={{ name: member.name, role: member.role, constituency: member.constituency, email: member.email }}
          onClose={() => setContacting(false)}
        />
      )}
    </>
  );
}
