import { useState, useRef, CSSProperties } from 'react';
import {
  Download, Share2, Award, Shield, CheckCircle, XCircle,
  Loader, Star, Lock,
} from 'lucide-react';
import { membershipApi, Member, MembershipCert, AdoptionCert } from '../lib/api';

const A    = '#3b82f6';
const NAVY = '#1e2d4a';
const GREEN = '#16a34a';

// ─── Print / Download helper ──────────────────────────────────────────────────

function printElement(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const html = `<!DOCTYPE html><html><head><title>BOZ Certificate</title>
    <link href="https://fonts.googleapis.com/css2?family=Oswald:wght@400;600;700&family=EB+Garamond:ital,wght@0,400;0,600;1,400&family=Open+Sans&display=swap" rel="stylesheet">
    <style>
      *{margin:0;padding:0;box-sizing:border-box}
      body{background:#fff;font-family:'Open Sans',sans-serif;-webkit-print-color-adjust:exact;print-color-adjust:exact}
      @page{size:A4 landscape;margin:0}
    </style>
    </head><body>${el.outerHTML}</body></html>`;
  const w = window.open('', '_blank');
  if (!w) return;
  w.document.write(html);
  w.document.close();
  w.focus();
  setTimeout(() => { w.print(); w.close(); }, 600);
}

// ─── Membership Certificate Visual ───────────────────────────────────────────

function MembershipCertVisual({ cert }: { cert: MembershipCert }) {
  const joined = new Date(cert.joinDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  const issued = new Date(cert.issuedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div id="membership-cert-print" style={{
      width: '100%', maxWidth: '820px', margin: '0 auto',
      background: 'linear-gradient(145deg, #0a1628 0%, #0f2040 50%, #0a1628 100%)',
      borderRadius: '16px', overflow: 'hidden', position: 'relative', color: '#fff',
      boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
    }}>
      {/* Gold border frame */}
      <div style={{ position: 'absolute', inset: '12px', border: '2px solid #c9a84c', borderRadius: '8px', pointerEvents: 'none', zIndex: 1 }} />
      <div style={{ position: 'absolute', inset: '16px', border: '1px solid #c9a84c44', borderRadius: '6px', pointerEvents: 'none', zIndex: 1 }} />

      {/* Corner ornaments */}
      {[
        { top: '8px', left: '8px' },
        { top: '8px', right: '8px' },
        { bottom: '8px', left: '8px' },
        { bottom: '8px', right: '8px' },
      ].map((pos, i) => (
        <div key={i} style={{ position: 'absolute', ...pos, width: '28px', height: '28px', zIndex: 2 }}>
          <svg viewBox="0 0 28 28" fill="none">
            <path d="M4 4 L14 4 L14 8 L8 8 L8 14 L4 14 Z" fill="#c9a84c" />
          </svg>
        </div>
      ))}

      {/* Background seal */}
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '320px', height: '320px', borderRadius: '50%', border: '2px solid #c9a84c11', zIndex: 0, opacity: 0.15 }} />

      <div style={{ position: 'relative', zIndex: 3, padding: '48px 60px', textAlign: 'center' }}>
        {/* Header row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', marginBottom: '16px' }}>
          <div style={{ width: '2px', flex: 1, background: 'linear-gradient(to right, transparent, #c9a84c)' }} />
          <div style={{ display: 'flex', align: 'center', gap: '12px', flexDirection: 'column', alignItems: 'center' }}>
            <Shield size={40} color="#c9a84c" />
            <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: '11px', letterSpacing: '0.3em', color: '#c9a84c', textTransform: 'uppercase' }}>Build One Zambia</span>
          </div>
          <div style={{ width: '2px', flex: 1, background: 'linear-gradient(to left, transparent, #c9a84c)' }} />
        </div>

        <h1 style={{ fontFamily: 'Oswald, sans-serif', fontSize: '2.4rem', letterSpacing: '0.12em', color: '#fff', marginBottom: '4px', textTransform: 'uppercase' }}>
          Membership Certificate
        </h1>
        <p style={{ fontFamily: 'EB Garamond, Georgia, serif', fontStyle: 'italic', color: '#c9a84c88', fontSize: '0.95rem', marginBottom: '28px', letterSpacing: '0.05em' }}>
          This certifies the membership of
        </p>

        {/* Name */}
        <div style={{ padding: '12px 40px', margin: '0 auto 20px', display: 'inline-block', borderTop: '1px solid #c9a84c66', borderBottom: '1px solid #c9a84c66' }}>
          <p style={{ fontFamily: 'EB Garamond, Georgia, serif', fontSize: '2.8rem', color: '#fff', fontWeight: 600, margin: 0, lineHeight: 1.2 }}>{cert.fullName}</p>
        </div>

        <p style={{ color: '#9eb3cc', fontSize: '0.9rem', marginBottom: '28px', lineHeight: 1.8 }}>
          as a <strong style={{ color: '#c9a84c', textTransform: 'capitalize' }}>{cert.tier}</strong> member of the Build One Zambia political party<br />
          representing <strong style={{ color: '#fff' }}>{cert.ward}</strong> Ward, <strong style={{ color: '#fff' }}>{cert.constituency}</strong> Constituency,<br />
          <strong style={{ color: '#fff' }}>{cert.district}</strong>, <strong style={{ color: '#fff' }}>{cert.province}</strong> Province, Zambia
        </p>

        {/* Stats row */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '40px', marginBottom: '32px' }}>
          {[
            ['Member Since', joined],
            ['Certificate No.', cert.membershipNumber],
            ['Status', cert.status.toUpperCase()],
          ].map(([label, val]) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <p style={{ fontFamily: 'Oswald, sans-serif', fontSize: '10px', letterSpacing: '0.15em', color: '#c9a84c', marginBottom: '4px' }}>{label}</p>
              <p style={{ fontFamily: 'Oswald, sans-serif', fontSize: '0.9rem', color: '#fff' }}>{val}</p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ borderTop: '1px solid #c9a84c33', paddingTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div style={{ textAlign: 'left' }}>
            <div style={{ width: '120px', height: '1px', backgroundColor: '#c9a84c', marginBottom: '6px' }} />
            <p style={{ fontFamily: 'Oswald, sans-serif', fontSize: '10px', letterSpacing: '0.1em', color: '#c9a84c88' }}>NATIONAL SECRETARY</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontFamily: 'Oswald, sans-serif', fontSize: '9px', letterSpacing: '0.08em', color: '#4a5568' }}>
              ISSUED: {issued} · VALID: ACTIVE MEMBERSHIP ONLY<br />
              buildonezambia.com · Lusaka, Zambia
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ width: '120px', height: '1px', backgroundColor: '#c9a84c', marginBottom: '6px', marginLeft: 'auto' }} />
            <p style={{ fontFamily: 'Oswald, sans-serif', fontSize: '10px', letterSpacing: '0.1em', color: '#c9a84c88' }}>NATIONAL PRESIDENT</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Adoption Certificate Visual ──────────────────────────────────────────────

const POSITION_LABELS: Record<string, string> = {
  presidential: 'PRESIDENTIAL CANDIDATE',
  mp:           'MEMBER OF PARLIAMENT CANDIDATE',
  mayoral:      'MAYORAL CANDIDATE',
  councillor:   'COUNCILLOR CANDIDATE',
};

function electionScope(cert: AdoptionCert): string {
  const pos = cert.electionPosition;
  if (pos === 'presidential') return 'Zambia — National';
  if (pos === 'mp') return [cert.adoptionConstituency, cert.adoptionDistrict, cert.adoptionProvince].filter(Boolean).join(', ');
  if (pos === 'mayoral') return [cert.adoptionDistrict, cert.adoptionProvince].filter(Boolean).join(', ');
  return [cert.adoptionWard, cert.adoptionConstituency, cert.adoptionDistrict].filter(Boolean).join(', ');
}

function AdoptionCertVisual({ cert }: { cert: AdoptionCert & { eligible: true } }) {
  const granted  = new Date(cert.adoptionGrantedAt!).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  const issued   = new Date(cert.issuedAt!).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  const posLabel = POSITION_LABELS[cert.electionPosition || ''] || 'PARTY CANDIDATE';
  const scope    = electionScope(cert);

  return (
    <div id="adoption-cert-print" style={{
      width: '100%', maxWidth: '820px', margin: '0 auto',
      background: 'linear-gradient(145deg, #0a1628 0%, #0f2040 50%, #0a1628 100%)',
      borderRadius: '16px', overflow: 'hidden', position: 'relative', color: '#fff',
      boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
    }}>
      {/* Crimson border frame */}
      <div style={{ position: 'absolute', inset: '12px', border: '2px solid #c9a84c', borderRadius: '8px', pointerEvents: 'none', zIndex: 1 }} />
      <div style={{ position: 'absolute', inset: '16px', border: '1px solid #c9a84c44', borderRadius: '6px', pointerEvents: 'none', zIndex: 1 }} />

      {/* Corner ornaments */}
      {[{ top: '8px', left: '8px' }, { top: '8px', right: '8px' }, { bottom: '8px', left: '8px' }, { bottom: '8px', right: '8px' }].map((pos, i) => (
        <div key={i} style={{ position: 'absolute', ...pos, width: '28px', height: '28px', zIndex: 2 }}>
          <svg viewBox="0 0 28 28" fill="none"><path d="M4 4 L14 4 L14 8 L8 8 L8 14 L4 14 Z" fill="#c9a84c" /></svg>
        </div>
      ))}

      <div style={{ position: 'relative', zIndex: 3, padding: '48px 60px', textAlign: 'center' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', marginBottom: '16px' }}>
          <div style={{ width: '2px', flex: 1, background: 'linear-gradient(to right, transparent, #c9a84c)' }} />
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
            <Award size={44} color="#c9a84c" />
            <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: '11px', letterSpacing: '0.3em', color: '#c9a84c', textTransform: 'uppercase' }}>Build One Zambia</span>
          </div>
          <div style={{ width: '2px', flex: 1, background: 'linear-gradient(to left, transparent, #c9a84c)' }} />
        </div>

        <h1 style={{ fontFamily: 'Oswald, sans-serif', fontSize: '2.2rem', letterSpacing: '0.12em', color: '#fff', marginBottom: '8px', textTransform: 'uppercase' }}>
          Adoption Certificate
        </h1>

        {/* Election position banner */}
        <div style={{ display: 'inline-block', padding: '6px 28px', backgroundColor: '#c9a84c', borderRadius: '4px', marginBottom: '28px' }}>
          <p style={{ fontFamily: 'Oswald, sans-serif', fontSize: '13px', letterSpacing: '0.18em', color: '#0a1628', margin: 0, textTransform: 'uppercase' }}>
            {posLabel} · {cert.electionYear || new Date().getFullYear()}
          </p>
        </div>

        <p style={{ fontFamily: 'EB Garamond, Georgia, serif', fontStyle: 'italic', color: '#c9a84c88', fontSize: '0.95rem', marginBottom: '20px', letterSpacing: '0.05em' }}>
          This is to certify that
        </p>

        {/* Name */}
        <div style={{ padding: '12px 40px', margin: '0 auto 20px', display: 'inline-block', borderTop: '1px solid #c9a84c66', borderBottom: '1px solid #c9a84c66' }}>
          <p style={{ fontFamily: 'EB Garamond, Georgia, serif', fontSize: '2.8rem', color: '#fff', fontWeight: 600, margin: 0, lineHeight: 1.2 }}>{cert.fullName}</p>
        </div>

        <p style={{ color: '#9eb3cc', fontSize: '0.92rem', marginBottom: '12px', lineHeight: 1.9 }}>
          has been duly <strong style={{ color: '#c9a84c' }}>adopted</strong> by the Build One Zambia Party<br />
          to stand as the Party's <strong style={{ color: '#fff' }}>{posLabel}</strong><br />
          {scope && <><span>for </span><strong style={{ color: '#fff' }}>{scope}</strong><br /></>}
          in the <strong style={{ color: '#c9a84c' }}>{cert.electionYear || ''} General Elections</strong>
        </p>

        {cert.adoptionReason && (
          <div style={{ margin: '0 auto 20px', maxWidth: '480px', padding: '10px 20px', backgroundColor: '#c9a84c11', border: '1px solid #c9a84c33', borderRadius: '8px' }}>
            <p style={{ fontFamily: 'EB Garamond, Georgia, serif', fontStyle: 'italic', fontSize: '0.9rem', color: '#9eb3cc', margin: 0 }}>"{cert.adoptionReason}"</p>
          </div>
        )}

        {/* Stats */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '32px', marginBottom: '32px', flexWrap: 'wrap' }}>
          {[
            ['Certificate No.',  cert.adoptionCertNumber || cert.membershipNumber!],
            ['Adopted On',       granted],
            ['Membership No.',   cert.membershipNumber!],
          ].map(([label, val]) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <p style={{ fontFamily: 'Oswald, sans-serif', fontSize: '10px', letterSpacing: '0.15em', color: '#c9a84c', marginBottom: '4px' }}>{label}</p>
              <p style={{ fontFamily: 'Oswald, sans-serif', fontSize: '0.85rem', color: '#fff' }}>{val}</p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ borderTop: '1px solid #c9a84c33', paddingTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div style={{ textAlign: 'left' }}>
            <div style={{ width: '140px', height: '1px', backgroundColor: '#c9a84c', marginBottom: '6px' }} />
            <p style={{ fontFamily: 'Oswald, sans-serif', fontSize: '10px', letterSpacing: '0.1em', color: '#c9a84c88' }}>
              {cert.adoptionGrantedBy || 'SECRETARY GENERAL'}
            </p>
            <p style={{ fontFamily: 'Oswald, sans-serif', fontSize: '9px', color: '#4a5568', marginTop: '2px' }}>
              {cert.adoptionGrantedByTitle || 'SECRETARY GENERAL'}
            </p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontFamily: 'Oswald, sans-serif', fontSize: '9px', letterSpacing: '0.08em', color: '#3a4a5e' }}>
              ISSUED: {issued}<br />bozplans.org · Lusaka, Zambia
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ width: '140px', height: '1px', backgroundColor: '#c9a84c', marginBottom: '6px', marginLeft: 'auto' }} />
            <p style={{ fontFamily: 'Oswald, sans-serif', fontSize: '10px', letterSpacing: '0.1em', color: '#c9a84c88' }}>NATIONAL PRESIDENT</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Not Qualified Message ────────────────────────────────────────────────────

function NotQualifiedYet({ reason }: { reason: string }) {
  return (
    <div style={{ textAlign: 'center', padding: '48px 32px', border: '2px dashed #e5e7eb', borderRadius: '16px', backgroundColor: '#fafafa' }}>
      <div style={{ width: '72px', height: '72px', borderRadius: '50%', backgroundColor: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
        <Lock size={32} color="#d97706" />
      </div>
      <h3 style={{ fontFamily: 'Oswald, sans-serif', fontSize: '1.4rem', letterSpacing: '0.06em', color: NAVY, margin: '0 0 12px' }}>NOT QUALIFIED YET</h3>
      <p style={{ color: '#6b7280', fontSize: '0.95rem', maxWidth: '420px', margin: '0 auto 20px', lineHeight: 1.7 }}>{reason}</p>
      <div style={{ padding: '12px 20px', backgroundColor: '#fffbeb', border: '1px solid #fde68a', borderRadius: '10px', display: 'inline-block', maxWidth: '380px' }}>
        <p style={{ fontSize: '12px', color: '#92400e', margin: 0, lineHeight: 1.6 }}>
          <strong>How to qualify:</strong> Adoption is granted only to members selected through competition to represent BOZ as a Presidential, MP, Mayoral, or Councillor candidate. The Secretary General authorises the certificate.
        </p>
      </div>
    </div>
  );
}

// ─── Exported Components ──────────────────────────────────────────────────────

export function MembershipCertSection({ member }: { member: typeof memberData }) {
  const [cert, setCert]     = useState<MembershipCert | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState('');
  const [shown, setShown]   = useState(false);

  const fetchCert = async () => {
    setLoading(true); setError('');
    try {
      const data = await membershipApi.getMembershipCert(member.email);
      setCert(data);
      setShown(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load certificate');
    }
    setLoading(false);
  };

  if (!shown) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 20px' }}>
        <div style={{ width: '72px', height: '72px', borderRadius: '50%', backgroundColor: `${A}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <Shield size={36} color={A} />
        </div>
        <h3 style={{ fontFamily: 'Oswald, sans-serif', fontSize: '1.4rem', color: NAVY, letterSpacing: '0.06em', margin: '0 0 8px' }}>MEMBERSHIP CERTIFICATE</h3>
        <p style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '20px' }}>Your official BOZ membership certificate including your name, number, and constituency details.</p>
        {error && <p style={{ color: '#dc2626', fontSize: '12px', marginBottom: '12px' }}>{error}</p>}
        <button onClick={fetchCert} disabled={loading}
          style={{ padding: '12px 28px', backgroundColor: A, color: '#fff', border: 'none', borderRadius: '8px', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.08em', fontSize: '14px', cursor: loading ? 'not-allowed' : 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px', opacity: loading ? 0.7 : 1 }}>
          {loading ? <><Loader size={15} /> Loading…</> : <><Shield size={15} /> VIEW CERTIFICATE</>}
        </button>
      </div>
    );
  }

  return (
    <div>
      {cert && <MembershipCertVisual cert={cert} />}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '20px' }}>
        <button onClick={() => printElement('membership-cert-print')}
          style={{ padding: '12px 24px', backgroundColor: A, color: '#fff', border: 'none', borderRadius: '8px', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.08em', fontSize: '13px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          <Download size={15} /> DOWNLOAD / PRINT
        </button>
        <button onClick={() => { navigator.share?.({ title: 'My BOZ Membership', text: `${member.firstName} ${member.lastName} — BOZ Member` }).catch(() => {}); }}
          style={{ padding: '12px 24px', border: `1px solid ${A}`, color: A, backgroundColor: 'transparent', borderRadius: '8px', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.08em', fontSize: '13px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          <Share2 size={15} /> SHARE
        </button>
      </div>
    </div>
  );
}

export function AdoptionCertSection({ member }: { member: typeof memberData }) {
  const [cert, setCert]     = useState<AdoptionCert | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState('');
  const [shown, setShown]   = useState(false);

  const fetchCert = async () => {
    setLoading(true); setError('');
    try {
      const data = await membershipApi.getAdoptionCert(member.email);
      setCert(data);
      setShown(true);
    } catch (e: unknown) {
      // Backend returns 403 with {eligible: false, reason: ...}
      if (e instanceof Error && e.message.includes('Not qualified')) {
        setCert({ eligible: false, reason: e.message });
        setShown(true);
      } else {
        try {
          const data = await membershipApi.getAdoptionCert(member.email);
          setCert(data);
          setShown(true);
        } catch (e2) {
          // If member not in backend yet, show not qualified
          setCert({ eligible: false, reason: 'Not qualified yet — adoption has not been granted by the admin. Keep participating in party activities to qualify.' });
          setShown(true);
        }
      }
    }
    setLoading(false);
  };

  if (!shown) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 20px' }}>
        <div style={{ width: '72px', height: '72px', borderRadius: '50%', backgroundColor: `${GREEN}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <Award size={36} color={GREEN} />
        </div>
        <h3 style={{ fontFamily: 'Oswald, sans-serif', fontSize: '1.4rem', color: NAVY, letterSpacing: '0.06em', margin: '0 0 8px' }}>ADOPTION CERTIFICATE</h3>
        <p style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '20px', maxWidth: '380px', margin: '0 auto 20px', lineHeight: 1.6 }}>
          Granted only to members selected to represent BOZ as Presidential, MP, Mayoral, or Councillor candidates through competition — authorised by the Secretary General.
        </p>
        {error && <p style={{ color: '#dc2626', fontSize: '12px', marginBottom: '12px' }}>{error}</p>}
        <button onClick={fetchCert} disabled={loading}
          style={{ padding: '12px 28px', backgroundColor: GREEN, color: '#fff', border: 'none', borderRadius: '8px', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.08em', fontSize: '14px', cursor: loading ? 'not-allowed' : 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px', opacity: loading ? 0.7 : 1 }}>
          {loading ? <><Loader size={15} /> Checking…</> : <><Award size={15} /> CHECK STATUS</>}
        </button>
      </div>
    );
  }

  if (cert && !cert.eligible) {
    return <NotQualifiedYet reason={cert.reason || 'Not qualified yet — adoption has not been granted by the admin.'} />;
  }

  return (
    <div>
      {cert && cert.eligible && <AdoptionCertVisual cert={cert as AdoptionCert & { eligible: true }} />}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '20px' }}>
        <button onClick={() => printElement('adoption-cert-print')}
          style={{ padding: '12px 24px', backgroundColor: GREEN, color: '#fff', border: 'none', borderRadius: '8px', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.08em', fontSize: '13px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          <Download size={15} /> DOWNLOAD / PRINT
        </button>
        <button onClick={() => { navigator.share?.({ title: 'My BOZ Adoption Certificate', text: `${member.firstName} ${member.lastName} — BOZ Adopted Member` }).catch(() => {}); }}
          style={{ padding: '12px 24px', border: `1px solid ${GREEN}`, color: GREEN, backgroundColor: 'transparent', borderRadius: '8px', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.08em', fontSize: '13px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          <Share2 size={15} /> SHARE
        </button>
      </div>
    </div>
  );
}

// Dummy member type for prop typing — matches what MemberDashboard passes
const memberData = {} as {
  email: string;
  firstName: string;
  lastName: string;
  membershipNumber: string;
};
