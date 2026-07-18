import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { Shield, CheckCircle, XCircle } from 'lucide-react';
import { API_BASE } from '@/app/lib/apiBase';

/**
 * Public page at /verify/:membershipNumber — what a certificate's QR code
 * opens. No login required; the backend only confirms active membership
 * (see GET /membership/verify/:membershipNumber in index.js).
 *
 * Add to App.tsx:
 *   <Route path="/verify/:membershipNumber" element={<VerifyMembershipPage />} />
 */
export default function VerifyMembershipPage() {
  const { membershipNumber } = useParams();
  const [state, setState] = useState<{ loading: boolean; result: any }>({ loading: true, result: null });

  useEffect(() => {
    let cancelled = false;
    fetch(`${API_BASE}/membership/verify/${encodeURIComponent(membershipNumber || '')}`)
      .then(r => r.json())
      .then(data => { if (!cancelled) setState({ loading: false, result: data }); })
      .catch(() => { if (!cancelled) setState({ loading: false, result: { valid: false } }); });
    return () => { cancelled = true; };
  }, [membershipNumber]);

  return (
    <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', background: '#f9fafb' }}>
      <div style={{ maxWidth: '420px', width: '100%', borderRadius: '16px', border: '1px solid #e5e7eb', background: '#fff', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
        <div style={{ background: 'linear-gradient(135deg, #15803d, #ea580c)', padding: '20px 24px', color: '#fff' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Shield size={22} />
            <span style={{ fontWeight: 700 }}>Build One Zambia</span>
          </div>
          <p style={{ opacity: 0.85, fontSize: '13px', marginTop: '4px' }}>Membership verification</p>
        </div>

        <div style={{ padding: '24px' }}>
          {state.loading && <p style={{ color: '#6b7280' }}>Checking membership number {membershipNumber}…</p>}

          {!state.loading && state.result?.valid && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#15803d', fontWeight: 700, marginBottom: '16px' }}>
                <CheckCircle size={20} /> Verified member
              </div>
              <dl style={{ fontSize: '14px', display: 'grid', rowGap: '8px' }}>
                <Row label="Name" value={state.result.fullName} />
                <Row label="Membership number" value={state.result.membershipNumber} />
                <Row label="Ward" value={state.result.ward} />
                <Row label="Constituency" value={state.result.constituency} />
              </dl>
            </div>
          )}

          {!state.loading && !state.result?.valid && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#b91c1c', fontWeight: 700 }}>
              <XCircle size={20} /> This membership number could not be verified.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value?: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
      <dt style={{ color: '#6b7280' }}>{label}</dt>
      <dd style={{ fontWeight: 600, color: '#111827', textAlign: 'right' }}>{value || '—'}</dd>
    </div>
  );
}
