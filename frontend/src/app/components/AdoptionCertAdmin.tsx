import { useState, useEffect } from 'react';
import { Award, Search, CheckCircle, XCircle, ChevronDown, Loader, AlertCircle } from 'lucide-react';
import { membershipApi, Member } from '../lib/api';

const NAVY = '#1e2d4a';
const GOLD = '#c9a84c';

type ElectionPosition = 'presidential' | 'mp' | 'mayoral' | 'councillor';

const POSITIONS: { value: ElectionPosition; label: string }[] = [
  { value: 'presidential', label: 'Presidential Candidate' },
  { value: 'mp',           label: 'Member of Parliament (MP)' },
  { value: 'mayoral',      label: 'Mayoral Candidate' },
  { value: 'councillor',   label: 'Councillor Candidate' },
];

const ZAMBIA_PROVINCES = [
  'Central','Copperbelt','Eastern','Luapula','Lusaka','Muchinga',
  'Northern','North-Western','Southern','Western',
];

function positionNeedsConstituency(pos: ElectionPosition) {
  return pos === 'mp';
}
function positionNeedsWard(pos: ElectionPosition) {
  return pos === 'councillor';
}

export function AdoptionCertAdmin() {
  const [tab, setTab] = useState<'grant' | 'list'>('grant');

  // ── Grant form ──
  const [searchQ, setSearchQ]   = useState('');
  const [searching, setSearching] = useState(false);
  const [found, setFound]       = useState<Member | null>(null);
  const [searchErr, setSearchErr] = useState('');

  const [grantedBy, setGrantedBy]     = useState('');
  const [grantedByTitle, setGrantedByTitle] = useState('Secretary General');
  const [position, setPosition]       = useState<ElectionPosition>('presidential');
  const [year, setYear]               = useState(new Date().getFullYear());
  const [province, setProvince]       = useState('');
  const [district, setDistrict]       = useState('');
  const [constituency, setConstituency] = useState('');
  const [ward, setWard]               = useState('');
  const [reason, setReason]           = useState('');

  const [granting, setGranting]   = useState(false);
  const [grantMsg, setGrantMsg]   = useState('');
  const [grantErr, setGrantErr]   = useState('');

  // ── List ──
  const [members, setMembers]     = useState<Member[]>([]);
  const [listLoading, setListLoading] = useState(false);

  useEffect(() => {
    if (tab === 'list') loadList();
  }, [tab]);

  async function loadList() {
    setListLoading(true);
    try {
      const res = await membershipApi.listMembers({ adopted: true, limit: 200 });
      setMembers(res.members);
    } catch { /* ignore */ }
    setListLoading(false);
  }

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!searchQ.trim()) return;
    setSearching(true); setSearchErr(''); setFound(null); setGrantMsg(''); setGrantErr('');
    try {
      const byNum = searchQ.trim().toUpperCase().startsWith('BOZ-');
      const res = await membershipApi.listMembers({ search: searchQ.trim(), limit: 1 });
      if (res.members.length) {
        setFound(res.members[0]);
      } else {
        setSearchErr('No member found. Try membership number or email.');
      }
      void byNum;
    } catch (e) {
      setSearchErr(e instanceof Error ? e.message : 'Search failed');
    }
    setSearching(false);
  }

  async function handleGrant(e: React.FormEvent) {
    e.preventDefault();
    if (!found) return;
    if (!grantedBy.trim()) { setGrantErr('Enter the Secretary General\'s name.'); return; }
    setGranting(true); setGrantErr(''); setGrantMsg('');
    try {
      await membershipApi.grantAdoption(found.id, {
        grantedBy: grantedBy.trim(),
        grantedByTitle: grantedByTitle.trim() || 'Secretary General',
        electionPosition: position,
        electionYear: year,
        adoptionProvince: province || undefined,
        adoptionDistrict: district || undefined,
        adoptionConstituency: positionNeedsConstituency(position) ? constituency : undefined,
        adoptionWard: positionNeedsWard(position) ? ward : undefined,
        reason: reason.trim() || undefined,
      });
      setGrantMsg(`Adoption certificate granted to ${found.firstName} ${found.lastName} for ${position.toUpperCase()} — ${year}`);
      setFound(null); setSearchQ(''); setReason(''); setProvince(''); setDistrict(''); setConstituency(''); setWard('');
    } catch (e) {
      setGrantErr(e instanceof Error ? e.message : 'Failed to grant adoption');
    }
    setGranting(false);
  }

  async function handleRevoke(memberId: string, name: string) {
    if (!confirm(`Revoke adoption certificate for ${name}?`)) return;
    try {
      await membershipApi.revokeAdoption(memberId);
      setMembers(prev => prev.filter(m => m.id !== memberId));
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Failed to revoke');
    }
  }

  const posLabel = (p: string) => POSITIONS.find(x => x.value === p)?.label || p;

  return (
    <div style={{ padding: '0 0 40px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
        <div style={{ width: '44px', height: '44px', borderRadius: '10px', backgroundColor: `${GOLD}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Award size={22} color={GOLD} />
        </div>
        <div>
          <h2 style={{ fontFamily: 'Oswald, sans-serif', fontSize: '1.4rem', color: NAVY, margin: 0, letterSpacing: '0.06em' }}>ADOPTION CERTIFICATES</h2>
          <p style={{ color: '#6b7280', fontSize: '13px', margin: '2px 0 0' }}>Secretary General grants adoption to selected election candidates</p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '28px', borderBottom: '2px solid #e5e7eb', paddingBottom: '0' }}>
        {(['grant', 'list'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: '10px 24px', border: 'none', background: 'none', cursor: 'pointer',
            fontFamily: 'Oswald, sans-serif', fontSize: '13px', letterSpacing: '0.08em',
            color: tab === t ? NAVY : '#9ca3af',
            borderBottom: tab === t ? `2px solid ${GOLD}` : '2px solid transparent',
            marginBottom: '-2px', textTransform: 'uppercase',
          }}>
            {t === 'grant' ? 'Grant Certificate' : 'Granted Certificates'}
          </button>
        ))}
      </div>

      {/* ── GRANT TAB ── */}
      {tab === 'grant' && (
        <div style={{ maxWidth: '720px' }}>
          {/* Info box */}
          <div style={{ padding: '14px 18px', backgroundColor: '#fffbeb', border: '1px solid #fde68a', borderRadius: '10px', marginBottom: '24px', display: 'flex', gap: '10px' }}>
            <AlertCircle size={18} color="#d97706" style={{ flexShrink: 0, marginTop: '1px' }} />
            <p style={{ margin: 0, fontSize: '13px', color: '#92400e', lineHeight: 1.6 }}>
              Adoption certificates are granted <strong>only by the Secretary General</strong> to members selected through competition to represent BOZ in an election (Presidential, MP, Mayoral, or Councillor).
            </p>
          </div>

          {/* Search member */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: NAVY, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Step 1 — Find Member
            </label>
            <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                <input
                  value={searchQ} onChange={e => setSearchQ(e.target.value)}
                  placeholder="Search by name, email, or membership number…"
                  style={{ width: '100%', padding: '10px 12px 10px 36px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
              <button type="submit" disabled={searching} style={{ padding: '10px 20px', backgroundColor: NAVY, color: '#fff', border: 'none', borderRadius: '8px', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.08em', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                {searching ? <Loader size={14} /> : <Search size={14} />} SEARCH
              </button>
            </form>
            {searchErr && <p style={{ color: '#dc2626', fontSize: '12px', marginTop: '6px' }}>{searchErr}</p>}
          </div>

          {/* Found member card */}
          {found && (
            <div style={{ padding: '16px 20px', backgroundColor: '#f0fdf4', border: '1px solid #86efac', borderRadius: '10px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ fontWeight: 700, color: NAVY, margin: '0 0 4px', fontSize: '15px' }}>{found.firstName} {found.lastName}</p>
                <p style={{ color: '#6b7280', fontSize: '12px', margin: 0 }}>{found.membershipNumber} · {found.province} · Status: <strong style={{ color: found.status === 'active' ? '#16a34a' : '#dc2626' }}>{found.status.toUpperCase()}</strong></p>
                {found.adoptionGranted && <p style={{ color: '#d97706', fontSize: '12px', marginTop: '4px' }}>⚠ Already has adoption grant — granting again will update the existing certificate.</p>}
              </div>
              <button onClick={() => { setFound(null); setSearchQ(''); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: '4px' }}>
                <XCircle size={18} />
              </button>
            </div>
          )}

          {/* Grant form */}
          {found && (
            <form onSubmit={handleGrant}>
              <p style={{ fontSize: '12px', fontWeight: 600, color: NAVY, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '16px' }}>
                Step 2 — Certificate Details
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                {/* Secretary General name */}
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontSize: '12px', color: '#4b5563', marginBottom: '5px' }}>Secretary General's Name *</label>
                  <input value={grantedBy} onChange={e => setGrantedBy(e.target.value)} required
                    placeholder="Full name of the Secretary General"
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid #d1d5db', borderRadius: '7px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
                </div>

                {/* Title */}
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#4b5563', marginBottom: '5px' }}>Title</label>
                  <input value={grantedByTitle} onChange={e => setGrantedByTitle(e.target.value)}
                    placeholder="Secretary General"
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid #d1d5db', borderRadius: '7px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
                </div>

                {/* Election year */}
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#4b5563', marginBottom: '5px' }}>Election Year *</label>
                  <input type="number" value={year} onChange={e => setYear(parseInt(e.target.value))} required min={2020} max={2050}
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid #d1d5db', borderRadius: '7px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
                </div>

                {/* Election position */}
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontSize: '12px', color: '#4b5563', marginBottom: '5px' }}>Election Position *</label>
                  <div style={{ position: 'relative' }}>
                    <select value={position} onChange={e => setPosition(e.target.value as ElectionPosition)} required
                      style={{ width: '100%', padding: '9px 36px 9px 12px', border: '1px solid #d1d5db', borderRadius: '7px', fontSize: '14px', outline: 'none', appearance: 'none', backgroundColor: '#fff', boxSizing: 'border-box' }}>
                      {POSITIONS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                    </select>
                    <ChevronDown size={16} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', pointerEvents: 'none' }} />
                  </div>
                </div>

                {/* Province — shown for MP, Mayoral, Councillor */}
                {position !== 'presidential' && (
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', color: '#4b5563', marginBottom: '5px' }}>Province</label>
                    <div style={{ position: 'relative' }}>
                      <select value={province} onChange={e => setProvince(e.target.value)}
                        style={{ width: '100%', padding: '9px 36px 9px 12px', border: '1px solid #d1d5db', borderRadius: '7px', fontSize: '14px', outline: 'none', appearance: 'none', backgroundColor: '#fff', boxSizing: 'border-box' }}>
                        <option value="">Select Province</option>
                        {ZAMBIA_PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                      <ChevronDown size={16} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', pointerEvents: 'none' }} />
                    </div>
                  </div>
                )}

                {/* District */}
                {position !== 'presidential' && (
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', color: '#4b5563', marginBottom: '5px' }}>District</label>
                    <input value={district} onChange={e => setDistrict(e.target.value)}
                      placeholder="e.g. Lusaka"
                      style={{ width: '100%', padding: '9px 12px', border: '1px solid #d1d5db', borderRadius: '7px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
                  </div>
                )}

                {/* Constituency — for MP */}
                {positionNeedsConstituency(position) && (
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', color: '#4b5563', marginBottom: '5px' }}>Constituency</label>
                    <input value={constituency} onChange={e => setConstituency(e.target.value)}
                      placeholder="e.g. Kabulonga"
                      style={{ width: '100%', padding: '9px 12px', border: '1px solid #d1d5db', borderRadius: '7px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
                  </div>
                )}

                {/* Ward — for Councillor */}
                {positionNeedsWard(position) && (
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', color: '#4b5563', marginBottom: '5px' }}>Ward</label>
                    <input value={ward} onChange={e => setWard(e.target.value)}
                      placeholder="e.g. Ward 12"
                      style={{ width: '100%', padding: '9px 12px', border: '1px solid #d1d5db', borderRadius: '7px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
                  </div>
                )}

                {/* Notes */}
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontSize: '12px', color: '#4b5563', marginBottom: '5px' }}>Selection Notes / Reason (optional)</label>
                  <textarea value={reason} onChange={e => setReason(e.target.value)} rows={3}
                    placeholder="Brief description of how this candidate was selected through competition…"
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid #d1d5db', borderRadius: '7px', fontSize: '14px', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }} />
                </div>
              </div>

              {grantErr && (
                <div style={{ padding: '10px 14px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', marginBottom: '14px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <XCircle size={15} color="#dc2626" />
                  <p style={{ color: '#dc2626', fontSize: '13px', margin: 0 }}>{grantErr}</p>
                </div>
              )}

              <button type="submit" disabled={granting} style={{
                padding: '12px 32px', backgroundColor: GOLD, color: '#0a1628', border: 'none', borderRadius: '8px',
                fontFamily: 'Oswald, sans-serif', letterSpacing: '0.1em', fontSize: '14px', cursor: granting ? 'not-allowed' : 'pointer',
                display: 'inline-flex', alignItems: 'center', gap: '8px', opacity: granting ? 0.7 : 1,
              }}>
                {granting ? <Loader size={15} /> : <Award size={15} />} GRANT ADOPTION CERTIFICATE
              </button>
            </form>
          )}

          {grantMsg && (
            <div style={{ padding: '14px 18px', backgroundColor: '#f0fdf4', border: '1px solid #86efac', borderRadius: '10px', marginTop: '20px', display: 'flex', gap: '10px', alignItems: 'center' }}>
              <CheckCircle size={18} color="#16a34a" />
              <p style={{ color: '#166534', fontSize: '14px', margin: 0 }}>{grantMsg}</p>
            </div>
          )}
        </div>
      )}

      {/* ── LIST TAB ── */}
      {tab === 'list' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <p style={{ color: '#6b7280', fontSize: '13px', margin: 0 }}>
              {listLoading ? 'Loading…' : `${members.length} member${members.length !== 1 ? 's' : ''} with adoption certificates`}
            </p>
            <button onClick={loadList} style={{ padding: '7px 16px', border: '1px solid #e5e7eb', backgroundColor: '#fff', borderRadius: '7px', fontSize: '12px', cursor: 'pointer', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.06em', color: NAVY }}>
              REFRESH
            </button>
          </div>

          {listLoading ? (
            <div style={{ textAlign: 'center', padding: '48px', color: '#9ca3af' }}><Loader size={24} /></div>
          ) : members.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px', color: '#9ca3af', border: '2px dashed #e5e7eb', borderRadius: '12px' }}>
              <Award size={32} style={{ marginBottom: '12px', opacity: 0.3 }} />
              <p style={{ margin: 0 }}>No adoption certificates granted yet.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {members.map(m => (
                <div key={m.id} style={{ padding: '16px 20px', border: '1px solid #e5e7eb', borderRadius: '10px', backgroundColor: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                      <p style={{ fontWeight: 700, color: NAVY, margin: 0, fontSize: '15px' }}>{m.firstName} {m.lastName}</p>
                      <span style={{ padding: '2px 10px', backgroundColor: `${GOLD}22`, color: '#78450a', borderRadius: '20px', fontSize: '11px', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.06em' }}>
                        {posLabel(m.electionPosition || '')}
                      </span>
                    </div>
                    <p style={{ color: '#6b7280', fontSize: '12px', margin: '0 0 3px' }}>
                      {m.membershipNumber} · {m.adoptionCertNumber || '—'}
                    </p>
                    <p style={{ color: '#6b7280', fontSize: '12px', margin: 0 }}>
                      {m.electionYear} · {[m.adoptionConstituency, m.adoptionDistrict, m.adoptionProvince].filter(Boolean).join(', ') || m.province}
                    </p>
                    {m.adoptionGrantedBy && (
                      <p style={{ color: '#9ca3af', fontSize: '11px', marginTop: '3px' }}>
                        Granted by: {m.adoptionGrantedBy} ({m.adoptionGrantedByTitle || 'Secretary General'})
                      </p>
                    )}
                  </div>
                  <button onClick={() => handleRevoke(m.id, `${m.firstName} ${m.lastName}`)}
                    style={{ padding: '7px 14px', border: '1px solid #fecaca', backgroundColor: '#fff', color: '#dc2626', borderRadius: '7px', fontSize: '12px', cursor: 'pointer', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.06em', whiteSpace: 'nowrap', flexShrink: 0 }}>
                    REVOKE
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export { AdoptionCertAdmin as default };
