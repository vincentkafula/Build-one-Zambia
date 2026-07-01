import { useState, useEffect, CSSProperties } from 'react';
import {
  Users, Award, CheckCircle, XCircle, Search, RefreshCw,
  X, AlertCircle, Shield, ShoppingBag, TrendingUp, ChevronDown,
  ChevronUp, Clock, Ban, Star,
} from 'lucide-react';
import { membershipApi, Member, MemberStatus, MemberTier, MemberStats } from '../lib/api';

// ─── Constants ────────────────────────────────────────────────────────────────

const TIER_COLORS: Record<MemberTier, string> = {
  basic: '#6b7280', standard: '#3b82f6', gold: '#f59e0b', platinum: '#8b5cf6',
};

const STATUS_COLORS: Record<MemberStatus, string> = {
  active: '#10b981', suspended: '#f59e0b', expired: '#ef4444', pending: '#6b7280',
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function TierBadge({ tier }: { tier: MemberTier }) {
  const c = TIER_COLORS[tier] || '#6b7280';
  return <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: '10px', fontSize: '10px', fontWeight: 700, backgroundColor: `${c}18`, color: c, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{tier}</span>;
}

function StatusBadge({ status }: { status: MemberStatus }) {
  const c = STATUS_COLORS[status] || '#6b7280';
  return <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '2px 8px', borderRadius: '10px', fontSize: '10px', fontWeight: 700, backgroundColor: `${c}18`, color: c }}>{status}</span>;
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: string }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '12px' }}>
      <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color, flexShrink: 0 }}>{icon}</div>
      <div>
        <p style={{ fontSize: '11px', color: '#6b7280', margin: '0 0 2px' }}>{label}</p>
        <p style={{ fontSize: '20px', fontWeight: 700, color: '#111827', margin: 0, lineHeight: 1 }}>{value}</p>
      </div>
    </div>
  );
}

// ─── Member Row ───────────────────────────────────────────────────────────────

function MemberRow({ member, onGrant, onRevoke, onUpdateTier, onUpdateStatus, loading }: {
  member: Member;
  onGrant: (reason: string) => void;
  onRevoke: () => void;
  onUpdateTier: (tier: MemberTier) => void;
  onUpdateStatus: (status: MemberStatus) => void;
  loading: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const [grantReason, setGrantReason] = useState('');
  const [showGrantForm, setShowGrantForm] = useState(false);

  const fullName = `${member.firstName} ${member.lastName}`;

  return (
    <div style={{ border: '1px solid #e5e7eb', borderRadius: '10px', backgroundColor: '#fff', overflow: 'hidden', marginBottom: '8px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px' }}>
        {/* Avatar */}
        <div style={{ width: '44px', height: '44px', borderRadius: '50%', backgroundColor: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <span style={{ fontSize: '16px', fontWeight: 700, color: '#1d4ed8' }}>{member.firstName[0]}{member.lastName[0]}</span>
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '3px' }}>
            <span style={{ fontSize: '14px', fontWeight: 700, color: '#111827' }}>{fullName}</span>
            <TierBadge tier={member.tier} />
            <StatusBadge status={member.status} />
            {member.adoptionGranted && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', padding: '2px 7px', borderRadius: '10px', fontSize: '10px', fontWeight: 700, backgroundColor: '#dcfce7', color: '#16a34a' }}>
                <CheckCircle size={9} /> ADOPTED
              </span>
            )}
          </div>
          <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>
            {member.membershipNumber} · {member.email} · {member.ward}, {member.constituency}
          </p>
        </div>

        {/* Quick actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
          {!member.adoptionGranted ? (
            <button onClick={() => setShowGrantForm(v => !v)} disabled={loading}
              style={{ padding: '6px 12px', backgroundColor: '#16a34a', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Award size={12} /> Grant Adoption
            </button>
          ) : (
            <button onClick={onRevoke} disabled={loading}
              style={{ padding: '6px 12px', backgroundColor: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
              Revoke
            </button>
          )}
          <button onClick={() => setExpanded(v => !v)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: '6px' }}>
            {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </button>
        </div>
      </div>

      {/* Grant reason form */}
      {showGrantForm && !member.adoptionGranted && (
        <div style={{ padding: '12px 16px', backgroundColor: '#f0fdf4', borderTop: '1px solid #dcfce7' }}>
          <p style={{ margin: '0 0 8px', fontSize: '12px', fontWeight: 600, color: '#15803d' }}>Reason for granting adoption (optional)</p>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input value={grantReason} onChange={e => setGrantReason(e.target.value)}
              placeholder="e.g. Active participant, ward mobiliser…"
              style={{ flex: 1, padding: '8px 12px', border: '1px solid #bbf7d0', borderRadius: '6px', fontSize: '13px', outline: 'none' }} />
            <button onClick={() => { onGrant(grantReason); setShowGrantForm(false); }} disabled={loading}
              style={{ padding: '8px 16px', backgroundColor: '#16a34a', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
              Confirm
            </button>
            <button onClick={() => setShowGrantForm(false)}
              style={{ padding: '8px 12px', backgroundColor: '#f3f4f6', color: '#374151', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '13px', cursor: 'pointer' }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Expanded details */}
      {expanded && (
        <div style={{ borderTop: '1px solid #f3f4f6', padding: '14px 16px', backgroundColor: '#fafafa' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '10px', marginBottom: '14px' }}>
            {[
              ['Phone',        member.phone],
              ['Province',     member.province],
              ['District',     member.district],
              ['Constituency', member.constituency],
              ['Ward',         member.ward],
              ['Joined',       new Date(member.joinDate).toLocaleDateString('en-ZM')],
              ['Orders',       member.shopOrderIds.length + ' linked'],
              ['Discount',     member.memberDiscountPct + '%'],
            ].map(([label, val]) => (
              <div key={label}>
                <p style={{ margin: '0 0 2px', fontSize: '10px', color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</p>
                <p style={{ margin: 0, fontSize: '13px', color: '#374151' }}>{val}</p>
              </div>
            ))}
          </div>

          {member.adoptionGranted && (
            <div style={{ padding: '10px 12px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', marginBottom: '12px', fontSize: '12px', color: '#15803d' }}>
              <strong>Adoption granted</strong> by {member.adoptionGrantedBy} on {new Date(member.adoptionGrantedAt!).toLocaleDateString('en-ZM')}
              {member.adoptionReason && <> — "{member.adoptionReason}"</>}
            </div>
          )}

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <div>
              <p style={{ margin: '0 0 4px', fontSize: '11px', color: '#6b7280', fontWeight: 600 }}>Change Tier</p>
              <select value={member.tier} onChange={e => onUpdateTier(e.target.value as MemberTier)}
                style={{ padding: '6px 10px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '12px', outline: 'none' }}>
                {(['basic', 'standard', 'gold', 'platinum'] as MemberTier[]).map(t => (
                  <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <p style={{ margin: '0 0 4px', fontSize: '11px', color: '#6b7280', fontWeight: 600 }}>Change Status</p>
              <select value={member.status} onChange={e => onUpdateStatus(e.target.value as MemberStatus)}
                style={{ padding: '6px 10px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '12px', outline: 'none' }}>
                {(['active', 'suspended', 'expired', 'pending'] as MemberStatus[]).map(s => (
                  <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function MembershipAdmin() {
  const [members, setMembers]   = useState<Member[]>([]);
  const [stats, setStats]       = useState<MemberStats | null>(null);
  const [loading, setLoading]   = useState(true);
  const [tab, setTab]           = useState<'overview' | 'members' | 'adoption'>('members');
  const [search, setSearch]     = useState('');
  const [statusFilter, setStatusFilter] = useState<MemberStatus | 'all'>('all');
  const [tierFilter, setTierFilter]     = useState<MemberTier | 'all'>('all');
  const [adoptFilter, setAdoptFilter]   = useState<'all' | 'granted' | 'pending'>('all');
  const [actionId, setActionId] = useState<string | null>(null);
  const [msg, setMsg]           = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const [membersRes, statsRes] = await Promise.all([
        membershipApi.listMembers({ limit: 200 }),
        membershipApi.getStats(),
      ]);
      setMembers(membersRes.members);
      setStats(statsRes);
    } catch { /* ignore */ }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = members.filter(m => {
    if (statusFilter !== 'all' && m.status !== statusFilter) return false;
    if (tierFilter !== 'all' && m.tier !== tierFilter) return false;
    if (adoptFilter === 'granted' && !m.adoptionGranted) return false;
    if (adoptFilter === 'pending' && m.adoptionGranted) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!m.firstName.toLowerCase().includes(q) && !m.lastName.toLowerCase().includes(q) &&
          !m.email.toLowerCase().includes(q) && !m.membershipNumber.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const handleGrant = async (id: string, reason: string) => {
    setActionId(id);
    try {
      await membershipApi.grantAdoption(id, reason);
      setMsg('Adoption granted successfully');
      load();
    } catch (e) { setMsg(e instanceof Error ? e.message : 'Failed'); }
    setActionId(null);
  };

  const handleRevoke = async (id: string) => {
    if (!confirm('Revoke adoption for this member?')) return;
    setActionId(id);
    try {
      await membershipApi.revokeAdoption(id);
      setMsg('Adoption revoked');
      load();
    } catch (e) { setMsg(e instanceof Error ? e.message : 'Failed'); }
    setActionId(null);
  };

  const handleUpdate = async (id: string, patch: { tier?: MemberTier; status?: MemberStatus }) => {
    setActionId(id);
    try {
      await membershipApi.updateMember(id, patch);
      load();
    } catch { /* ignore */ }
    setActionId(null);
  };

  const tabStyle = (active: boolean): CSSProperties => ({
    padding: '10px 18px', border: 'none', background: 'none', cursor: 'pointer',
    fontSize: '13px', fontWeight: 600, color: active ? '#1d4ed8' : '#6b7280',
    borderBottom: active ? '2px solid #1d4ed8' : '2px solid transparent',
  });

  const pendingAdoption = members.filter(m => m.status === 'active' && !m.adoptionGranted).length;

  return (
    <div style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Users size={20} color="#1d4ed8" />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: '#111827' }}>Membership Admin</h2>
            <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>Manage members, grant adoption, and link shop orders</p>
          </div>
        </div>
        <button onClick={load} style={{ padding: '9px 14px', border: '1px solid #d1d5db', borderRadius: '7px', fontSize: '13px', background: '#f9fafb', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb', marginBottom: '20px' }}>
        <button style={tabStyle(tab === 'overview')} onClick={() => setTab('overview')}>Overview</button>
        <button style={tabStyle(tab === 'members')} onClick={() => setTab('members')}>
          All Members {stats ? `(${stats.total})` : ''}
        </button>
        <button style={tabStyle(tab === 'adoption')} onClick={() => setTab('adoption')}>
          Adoption Queue
          {pendingAdoption > 0 && <span style={{ marginLeft: '6px', padding: '1px 6px', borderRadius: '10px', fontSize: '10px', backgroundColor: '#fef3c7', color: '#d97706', fontWeight: 700 }}>{pendingAdoption}</span>}
        </button>
      </div>

      {/* Alert */}
      {msg && (
        <div style={{ padding: '10px 14px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '7px', fontSize: '13px', color: '#15803d', marginBottom: '14px', display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><CheckCircle size={14} /> {msg}</span>
          <button onClick={() => setMsg('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#15803d' }}><X size={14} /></button>
        </div>
      )}

      {/* OVERVIEW */}
      {tab === 'overview' && stats && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '12px', marginBottom: '24px' }}>
            <StatCard icon={<Users size={18} />}       label="Total Members"    value={stats.total}           color="#1d4ed8" />
            <StatCard icon={<CheckCircle size={18} />} label="Active"           value={stats.active}          color="#10b981" />
            <StatCard icon={<Award size={18} />}       label="Adoption Granted" value={stats.adoptionGranted} color="#f59e0b" />
            <StatCard icon={<Clock size={18} />}       label="Pending Adoption" value={pendingAdoption}       color="#6b7280" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '16px' }}>
              <h4 style={{ margin: '0 0 12px', fontSize: '13px', fontWeight: 700, color: '#374151' }}>By Tier</h4>
              {(['basic', 'standard', 'gold', 'platinum'] as MemberTier[]).map(t => (
                <div key={t} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid #f3f4f6' }}>
                  <TierBadge tier={t} />
                  <span style={{ fontSize: '14px', fontWeight: 700, color: '#111827' }}>{stats.byTier[t] || 0}</span>
                </div>
              ))}
            </div>
            <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '16px' }}>
              <h4 style={{ margin: '0 0 12px', fontSize: '13px', fontWeight: 700, color: '#374151' }}>By Province</h4>
              {Object.entries(stats.byProvince).slice(0, 8).map(([prov, count]) => (
                <div key={prov} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid #f3f4f6', fontSize: '12px' }}>
                  <span style={{ color: '#374151' }}>{prov}</span>
                  <span style={{ fontWeight: 700, color: '#1d4ed8' }}>{count}</span>
                </div>
              ))}
              {Object.keys(stats.byProvince).length === 0 && <p style={{ margin: 0, fontSize: '12px', color: '#9ca3af' }}>No data yet</p>}
            </div>
          </div>
        </div>
      )}

      {/* MEMBERS LIST */}
      {tab === 'members' && (
        <div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '16px' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: '180px' }}>
              <Search size={13} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, email, number…"
                style={{ width: '100%', boxSizing: 'border-box', padding: '8px 12px 8px 30px', border: '1px solid #d1d5db', borderRadius: '7px', fontSize: '13px', outline: 'none' }} />
            </div>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as MemberStatus | 'all')}
              style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '7px', fontSize: '13px', outline: 'none' }}>
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="expired">Expired</option>
              <option value="pending">Pending</option>
            </select>
            <select value={tierFilter} onChange={e => setTierFilter(e.target.value as MemberTier | 'all')}
              style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '7px', fontSize: '13px', outline: 'none' }}>
              <option value="all">All Tiers</option>
              <option value="basic">Basic</option>
              <option value="standard">Standard</option>
              <option value="gold">Gold</option>
              <option value="platinum">Platinum</option>
            </select>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px', color: '#9ca3af' }}><RefreshCw size={24} style={{ display: 'block', margin: '0 auto 12px', opacity: 0.4 }} />Loading…</div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px', color: '#9ca3af', border: '2px dashed #e5e7eb', borderRadius: '10px' }}>
              <Users size={32} style={{ display: 'block', margin: '0 auto 12px', opacity: 0.3 }} />
              <p style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>No members found</p>
              <p style={{ margin: '6px 0 0', fontSize: '12px' }}>Members appear here once they register through the membership form.</p>
            </div>
          ) : (
            <div>
              <p style={{ margin: '0 0 12px', fontSize: '12px', color: '#9ca3af' }}>{filtered.length} of {members.length} members</p>
              {filtered.map(m => (
                <MemberRow key={m.id} member={m}
                  onGrant={reason => handleGrant(m.id, reason)}
                  onRevoke={() => handleRevoke(m.id)}
                  onUpdateTier={tier => handleUpdate(m.id, { tier })}
                  onUpdateStatus={status => handleUpdate(m.id, { status })}
                  loading={actionId === m.id}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ADOPTION QUEUE */}
      {tab === 'adoption' && (
        <div>
          <div style={{ padding: '14px 16px', backgroundColor: '#fffbeb', border: '1px solid #fde68a', borderRadius: '10px', marginBottom: '16px', fontSize: '13px', color: '#92400e', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
            <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '1px' }} />
            <div>
              <strong>Adoption grants are permanent awards.</strong> Only grant adoption to members who have demonstrated active participation, community mobilisation, or outstanding contribution to the party's mission.
              Members without adoption will see "Not qualified yet" when they try to download the adoption certificate.
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
            {(['all', 'pending', 'granted'] as const).map(f => (
              <button key={f} onClick={() => setAdoptFilter(f)}
                style={{ padding: '7px 14px', border: `1px solid ${adoptFilter === f ? '#1d4ed8' : '#d1d5db'}`, borderRadius: '7px', fontSize: '12px', fontWeight: 600, backgroundColor: adoptFilter === f ? '#eff6ff' : '#fff', color: adoptFilter === f ? '#1d4ed8' : '#6b7280', cursor: 'pointer', textTransform: 'capitalize' }}>
                {f === 'pending' ? '⏳ Not Yet Granted' : f === 'granted' ? '✅ Granted' : 'All'}
              </button>
            ))}
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>Loading…</div>
          ) : (
            <div>
              <p style={{ margin: '0 0 12px', fontSize: '12px', color: '#9ca3af' }}>
                {adoptFilter === 'pending'
                  ? `${members.filter(m => m.status === 'active' && !m.adoptionGranted).length} active members not yet granted adoption`
                  : adoptFilter === 'granted'
                  ? `${members.filter(m => m.adoptionGranted).length} members with adoption`
                  : `${members.length} total members`}
              </p>
              {filtered.map(m => (
                <MemberRow key={m.id} member={m}
                  onGrant={reason => handleGrant(m.id, reason)}
                  onRevoke={() => handleRevoke(m.id)}
                  onUpdateTier={tier => handleUpdate(m.id, { tier })}
                  onUpdateStatus={status => handleUpdate(m.id, { status })}
                  loading={actionId === m.id}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export { MembershipAdmin as default };
