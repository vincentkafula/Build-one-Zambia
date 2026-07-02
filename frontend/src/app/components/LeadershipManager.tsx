import { useState, useEffect, useRef, CSSProperties } from 'react';
import {
  Users, Plus, Edit2, Trash2, Camera, Upload, X, AlertCircle,
  CheckCircle, RefreshCw, ImagePlus, ChevronUp, ChevronDown,
  Star, EyeOff, Eye,
} from 'lucide-react';
import { leadershipApi, Leader, LeaderTier } from '../lib/api';

// ─── Constants ────────────────────────────────────────────────────────────────

const TIERS: { value: LeaderTier; label: string; color: string }[] = [
  { value: 'national',   label: 'National',   color: '#1d4ed8' },
  { value: 'provincial', label: 'Provincial', color: '#7c3aed' },
  { value: 'district',   label: 'District',   color: '#0891b2' },
  { value: 'youth',      label: 'Youth',      color: '#16a34a' },
  { value: 'women',      label: 'Women',      color: '#db2777' },
];

const PROVINCES = [
  'Central', 'Copperbelt', 'Eastern', 'Luapula', 'Lusaka',
  'Muchinga', 'Northern', 'North-Western', 'Southern', 'Western',
];

function TierBadge({ tier }: { tier: LeaderTier }) {
  const t = TIERS.find(t => t.value === tier);
  return (
    <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: '10px', fontSize: '10px', fontWeight: 700, backgroundColor: `${t?.color}18`, color: t?.color || '#6b7280', letterSpacing: '0.04em' }}>
      {t?.label || tier}
    </span>
  );
}

// ─── Quick Image Modal ────────────────────────────────────────────────────────

function ImageModal({ leader, onDone, onCancel }: {
  leader: Leader;
  onDone: () => void;
  onCancel: () => void;
}) {
  const [preview, setPreview] = useState<string | undefined>(
    leader.hasCustomImage ? leadershipApi.imageUrl(leader.id) : leader.imageUrl || undefined
  );
  const [dataUrl, setDataUrl] = useState<string | undefined>();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (file.size > 8 * 1024 * 1024) { setError('Image must be under 8MB'); return; }
    setError('');
    const reader = new FileReader();
    reader.onload = e => { const url = e.target?.result as string; setDataUrl(url); setPreview(url); };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!dataUrl) { setError('Please select a photo first'); return; }
    setSaving(true);
    try {
      await leadershipApi.uploadImage(leader.id, dataUrl);
      onDone();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed');
    } finally { setSaving(false); }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ background: '#fff', borderRadius: '12px', padding: '28px', width: '100%', maxWidth: '400px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#111827', display: 'flex', alignItems: 'center', gap: '8px' }}><Camera size={17} /> Change Photo</h3>
            <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#6b7280' }}>{leader.name} — {leader.position}</p>
          </div>
          <button onClick={onCancel} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}><X size={18} /></button>
        </div>

        <div
          onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f?.type.startsWith('image/')) handleFile(f); }}
          onDragOver={e => e.preventDefault()}
          onClick={() => fileRef.current?.click()}
          style={{ border: '2px dashed #d1d5db', borderRadius: '10px', cursor: 'pointer', backgroundColor: '#f9fafb', minHeight: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}
        >
          {preview ? (
            <img src={preview} alt="preview" style={{ width: '100%', maxHeight: '220px', objectFit: 'cover' }} />
          ) : (
            <div style={{ textAlign: 'center', color: '#9ca3af', padding: '20px' }}>
              <ImagePlus size={32} style={{ display: 'block', margin: '0 auto 8px' }} />
              <p style={{ margin: 0, fontSize: '13px' }}>Drag & drop or click to upload</p>
              <p style={{ margin: '4px 0 0', fontSize: '11px' }}>JPG, PNG, WebP — max 8MB</p>
            </div>
          )}
          <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
        </div>

        {error && <p style={{ margin: '8px 0 0', fontSize: '12px', color: '#dc2626' }}><AlertCircle size={12} style={{ display: 'inline', marginRight: 4 }} />{error}</p>}

        <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
          <button onClick={handleSave} disabled={saving || !dataUrl}
            style={{ flex: 1, padding: '10px', backgroundColor: saving || !dataUrl ? '#93c5fd' : '#1d4ed8', color: '#fff', border: 'none', borderRadius: '7px', fontWeight: 600, fontSize: '14px', cursor: saving || !dataUrl ? 'not-allowed' : 'pointer' }}>
            {saving ? 'Uploading…' : 'Save Photo'}
          </button>
          <button onClick={onCancel} style={{ padding: '10px 16px', backgroundColor: '#f3f4f6', color: '#374151', border: '1px solid #d1d5db', borderRadius: '7px', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

// ─── Leader Form ──────────────────────────────────────────────────────────────

function LeaderForm({ leader, onSave, onCancel }: {
  leader?: Leader;
  onSave: () => void;
  onCancel: () => void;
}) {
  const [name,        setName]        = useState(leader?.name        || '');
  const [position,    setPosition]    = useState(leader?.position    || '');
  const [description, setDescription] = useState(leader?.description || '');
  const [tier,        setTier]        = useState<LeaderTier>(leader?.tier || 'national');
  const [province,    setProvince]    = useState(leader?.province    || '');
  const [district,    setDistrict]    = useState(leader?.district    || '');
  const [order,       setOrder]       = useState(leader?.order       ?? 99);
  const [imageUrl,    setImageUrl]    = useState(leader?.imageUrl    || '');
  const [imageDataUrl, setImageDataUrl] = useState<string | undefined>();
  const [imagePreview, setImagePreview] = useState<string | undefined>(
    leader?.hasCustomImage ? leadershipApi.imageUrl(leader.id) : leader?.imageUrl || undefined
  );
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (file.size > 8 * 1024 * 1024) { setError('Image must be under 8MB'); return; }
    setError('');
    const reader = new FileReader();
    reader.onload = e => { const url = e.target?.result as string; setImageDataUrl(url); setImagePreview(url); };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!name.trim() || !position.trim()) { setError('Name and position are required'); return; }
    setSaving(true); setError('');
    try {
      const data = { name: name.trim(), position: position.trim(), description: description.trim(), tier, province: province || undefined, district: district || undefined, order: Number(order), imageUrl: imageUrl.trim() || undefined, imageDataUrl };
      if (leader) {
        await leadershipApi.update(leader.id, data);
      } else {
        await leadershipApi.create(data);
      }
      onSave();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed');
    } finally { setSaving(false); }
  };

  const inp: CSSProperties = { width: '100%', boxSizing: 'border-box', padding: '9px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', outline: 'none', color: '#111827', backgroundColor: '#fff' };

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.55)', zIndex: 200, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '20px', overflowY: 'auto' }}>
      <div style={{ background: '#fff', borderRadius: '12px', width: '100%', maxWidth: '600px', marginTop: '24px', marginBottom: '40px' }}>
        <div style={{ padding: '22px 28px', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#111827', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Users size={20} color="#1d4ed8" />
            {leader ? 'Edit Leader' : 'Add Leader'}
          </h3>
          <button onClick={onCancel} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}><X size={20} /></button>
        </div>

        <div style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div style={{ gridColumn: '1/-1' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '4px' }}>Full Name *</label>
              <input style={inp} value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Vincent Kafula" />
            </div>
            <div style={{ gridColumn: '1/-1' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '4px' }}>Position / Title *</label>
              <input style={inp} value={position} onChange={e => setPosition(e.target.value)} placeholder="e.g. President" />
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '4px' }}>Tier</label>
              <select style={{ ...inp, appearance: 'none' }} value={tier} onChange={e => setTier(e.target.value as LeaderTier)}>
                {TIERS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '4px' }}>Display Order</label>
              <input style={inp} type="number" value={order} onChange={e => setOrder(Number(e.target.value))} min={1} />
            </div>
            {(tier === 'provincial' || tier === 'district') && (
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '4px' }}>Province</label>
                <select style={{ ...inp, appearance: 'none' }} value={province} onChange={e => setProvince(e.target.value)}>
                  <option value="">— Select —</option>
                  {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            )}
            {tier === 'district' && (
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '4px' }}>District</label>
                <input style={inp} value={district} onChange={e => setDistrict(e.target.value)} placeholder="e.g. Lusaka District" />
              </div>
            )}
            <div style={{ gridColumn: '1/-1' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '4px' }}>Description / Role</label>
              <textarea style={{ ...inp, minHeight: '80px', resize: 'vertical' }} value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe this leader's role and responsibilities…" />
            </div>
          </div>

          {/* Photo section */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '6px' }}>Photo</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', alignItems: 'start' }}>
              <div>
                <div
                  onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f?.type.startsWith('image/')) handleFile(f); }}
                  onDragOver={e => e.preventDefault()}
                  onClick={() => fileRef.current?.click()}
                  style={{ border: '2px dashed #d1d5db', borderRadius: '8px', cursor: 'pointer', backgroundColor: '#f9fafb', minHeight: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}
                >
                  {imagePreview ? (
                    <img src={imagePreview} alt="preview" style={{ width: '100%', height: '120px', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ textAlign: 'center', color: '#9ca3af', padding: '12px' }}>
                      <Upload size={24} style={{ display: 'block', margin: '0 auto 6px' }} />
                      <p style={{ margin: 0, fontSize: '12px' }}>Upload photo</p>
                    </div>
                  )}
                  <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
                </div>
                {imagePreview && <button onClick={() => { setImagePreview(undefined); setImageDataUrl(undefined); }} style={{ marginTop: '4px', fontSize: '11px', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}>Remove</button>}
              </div>
              <div>
                <label style={{ fontSize: '11px', color: '#6b7280', display: 'block', marginBottom: '4px' }}>Or use external URL</label>
                <input style={{ ...inp, fontSize: '12px' }} value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="https://example.com/photo.jpg" />
                <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#9ca3af' }}>Used as fallback when no photo is uploaded.</p>
              </div>
            </div>
          </div>

          {error && (
            <div style={{ padding: '10px 14px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px', fontSize: '13px', color: '#dc2626', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircle size={14} /> {error}
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={handleSave} disabled={saving}
              style={{ flex: 1, padding: '11px', backgroundColor: saving ? '#93c5fd' : '#1d4ed8', color: '#fff', border: 'none', borderRadius: '7px', fontWeight: 600, fontSize: '14px', cursor: saving ? 'not-allowed' : 'pointer' }}>
              {saving ? 'Saving…' : leader ? 'Update Leader' : 'Add Leader'}
            </button>
            <button onClick={onCancel} style={{ padding: '11px 20px', backgroundColor: '#f3f4f6', color: '#374151', border: '1px solid #d1d5db', borderRadius: '7px', fontWeight: 600, fontSize: '14px', cursor: 'pointer' }}>Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Leader Row ───────────────────────────────────────────────────────────────

function LeaderRow({ leader, onEdit, onPhoto, onToggle, onMoveUp, onMoveDown, isFirst, isLast }: {
  leader: Leader;
  onEdit: () => void;
  onPhoto: () => void;
  onToggle: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isFirst: boolean;
  isLast: boolean;
}) {
  const imgSrc = leader.hasCustomImage ? leadershipApi.imageUrl(leader.id) : leader.imageUrl || undefined;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '12px 16px', border: '1px solid #e5e7eb', borderRadius: '10px', backgroundColor: leader.active ? '#fff' : '#f9fafb', marginBottom: '8px', opacity: leader.active ? 1 : 0.6 }}>
      {/* Photo */}
      <div style={{ width: '56px', height: '56px', borderRadius: '50%', overflow: 'hidden', backgroundColor: '#f3f4f6', flexShrink: 0, cursor: 'pointer', position: 'relative' }}
        onClick={onPhoto} title="Change photo"
      >
        {imgSrc ? (
          <img src={imgSrc} alt={leader.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d1d5db' }}>
            <Users size={22} />
          </div>
        )}
        <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', backgroundColor: 'rgba(0,0,0,0)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.15s' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(0,0,0,0.4)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(0,0,0,0)'; }}
        >
          <Camera size={14} color="#fff" style={{ opacity: 0 }}
            ref={el => {
              if (!el) return;
              const p = el.parentElement!;
              p.addEventListener('mouseenter', () => { el.style.opacity = '1'; });
              p.addEventListener('mouseleave', () => { el.style.opacity = '0'; });
            }}
          />
        </div>
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
          <TierBadge tier={leader.tier} />
          {leader.province && <span style={{ fontSize: '11px', color: '#6b7280' }}>{leader.province}</span>}
        </div>
        <p style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#111827' }}>{leader.name}</p>
        <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>{leader.position}</p>
      </div>

      {/* Reorder */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        <button onClick={onMoveUp} disabled={isFirst} style={{ background: 'none', border: 'none', cursor: isFirst ? 'not-allowed' : 'pointer', color: isFirst ? '#e5e7eb' : '#6b7280', padding: '2px' }}><ChevronUp size={14} /></button>
        <button onClick={onMoveDown} disabled={isLast} style={{ background: 'none', border: 'none', cursor: isLast ? 'not-allowed' : 'pointer', color: isLast ? '#e5e7eb' : '#6b7280', padding: '2px' }}><ChevronDown size={14} /></button>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        <button onClick={onPhoto} title="Change photo" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', padding: '6px' }}><Camera size={15} /></button>
        <button onClick={onEdit} title="Edit details" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', padding: '6px' }}><Edit2 size={15} /></button>
        <button onClick={onToggle} title={leader.active ? 'Deactivate' : 'Activate'} style={{ background: 'none', border: 'none', cursor: 'pointer', color: leader.active ? '#f59e0b' : '#10b981', padding: '6px' }}>
          {leader.active ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function LeadershipManager() {
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [loading, setLoading] = useState(true);
  const [tierFilter, setTierFilter] = useState<LeaderTier | 'all'>('all');
  const [provinceFilter, setProvinceFilter] = useState('');
  const [showInactive, setShowInactive] = useState(false);
  const [editing, setEditing] = useState<Leader | undefined>();
  const [creating, setCreating] = useState(false);
  const [changingPhotoFor, setChangingPhotoFor] = useState<Leader | undefined>();
  const [seeding, setSeeding] = useState(false);
  const [msg, setMsg] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const res = await leadershipApi.list({ includeInactive: true });
      setLeaders(res.leaders);
    } catch { /* ignore */ }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = leaders.filter(l => {
    if (!showInactive && !l.active) return false;
    if (tierFilter !== 'all' && l.tier !== tierFilter) return false;
    if (provinceFilter && l.province !== provinceFilter) return false;
    return true;
  });

  const handleToggle = async (leader: Leader) => {
    try {
      await leadershipApi.update(leader.id, { active: !leader.active });
      setMsg(leader.active ? 'Leader deactivated' : 'Leader activated');
      load();
    } catch { setMsg('Action failed'); }
  };

  const handleMove = async (leader: Leader, direction: 'up' | 'down') => {
    const group = filtered.filter(l => l.tier === leader.tier && (l.province || '') === (leader.province || ''));
    const idx = group.findIndex(l => l.id === leader.id);
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= group.length) return;

    const orderedIds = group.map(l => l.id);
    [orderedIds[idx], orderedIds[swapIdx]] = [orderedIds[swapIdx], orderedIds[idx]];
    await leadershipApi.reorder(orderedIds);
    load();
  };

  const handleSeed = async () => {
    setSeeding(true);
    try {
      const res = await leadershipApi.seed();
      setMsg(res.seeded > 0 ? `Seeded ${res.seeded} national leaders` : `${res.skipped} leaders already exist — skipped`);
      load();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'Seed failed');
    }
    setSeeding(false);
  };

  const tierCounts = TIERS.reduce((acc, t) => {
    acc[t.value] = leaders.filter(l => l.tier === t.value && l.active).length;
    return acc;
  }, {} as Record<LeaderTier, number>);

  const tabStyle = (active: boolean): CSSProperties => ({
    padding: '8px 14px', border: 'none', background: 'none', cursor: 'pointer',
    fontSize: '13px', fontWeight: 600, color: active ? '#1d4ed8' : '#6b7280',
    borderBottom: active ? '2px solid #1d4ed8' : '2px solid transparent',
  });

  return (
    <div style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Modals */}
      {(creating || editing) && (
        <LeaderForm
          leader={editing}
          onSave={() => { setCreating(false); setEditing(undefined); setMsg('Saved!'); load(); }}
          onCancel={() => { setCreating(false); setEditing(undefined); }}
        />
      )}
      {changingPhotoFor && (
        <ImageModal
          leader={changingPhotoFor}
          onDone={() => { setChangingPhotoFor(undefined); setMsg('Photo updated!'); load(); }}
          onCancel={() => setChangingPhotoFor(undefined)}
        />
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Users size={20} color="#1d4ed8" />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: '#111827' }}>Leadership Manager</h2>
            <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>Manage names, positions, and photos for all leadership tiers</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={handleSeed} disabled={seeding}
            style={{ padding: '9px 14px', backgroundColor: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: '7px', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <RefreshCw size={13} /> {seeding ? 'Seeding…' : 'Seed Nationals'}
          </button>
          <button onClick={() => setCreating(true)}
            style={{ padding: '9px 16px', backgroundColor: '#1d4ed8', color: '#fff', border: 'none', borderRadius: '7px', fontWeight: 600, fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Plus size={14} /> Add Leader
          </button>
        </div>
      </div>

      {/* Stat chips */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
        {TIERS.map(t => (
          <div key={t.value} style={{ padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, backgroundColor: `${t.color}12`, color: t.color, border: `1px solid ${t.color}30` }}>
            {t.label}: {tierCounts[t.value] || 0}
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px', borderBottom: '1px solid #e5e7eb', paddingBottom: '12px' }}>
        <button style={tabStyle(tierFilter === 'all')} onClick={() => setTierFilter('all')}>All</button>
        {TIERS.map(t => (
          <button key={t.value} style={tabStyle(tierFilter === t.value)} onClick={() => setTierFilter(t.value)}>{t.label}</button>
        ))}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px', alignItems: 'center' }}>
          {(tierFilter === 'provincial' || tierFilter === 'district') && (
            <select value={provinceFilter} onChange={e => setProvinceFilter(e.target.value)}
              style={{ padding: '7px 12px', border: '1px solid #d1d5db', borderRadius: '7px', fontSize: '13px', outline: 'none' }}>
              <option value="">All Provinces</option>
              {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          )}
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#6b7280', cursor: 'pointer' }}>
            <input type="checkbox" checked={showInactive} onChange={e => setShowInactive(e.target.checked)} />
            Show inactive
          </label>
          <button onClick={load} style={{ padding: '7px 12px', border: '1px solid #d1d5db', borderRadius: '7px', fontSize: '13px', background: '#f9fafb', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <RefreshCw size={13} />
          </button>
        </div>
      </div>

      {/* Success message */}
      {msg && (
        <div style={{ padding: '10px 14px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '7px', fontSize: '13px', color: '#15803d', marginBottom: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><CheckCircle size={14} /> {msg}</span>
          <button onClick={() => setMsg('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#15803d' }}><X size={14} /></button>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#9ca3af' }}>
          <RefreshCw size={24} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.5 }} />
          Loading leaders…
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#9ca3af', border: '2px dashed #e5e7eb', borderRadius: '10px' }}>
          <Users size={32} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.3 }} />
          <p style={{ margin: '0 0 12px', fontSize: '14px', fontWeight: 600 }}>No leaders found</p>
          <p style={{ margin: '0 0 16px', fontSize: '12px' }}>Click "Seed Nationals" to load the national leadership team, or add leaders manually.</p>
          <button onClick={() => setCreating(true)}
            style={{ padding: '9px 18px', backgroundColor: '#1d4ed8', color: '#fff', border: 'none', borderRadius: '7px', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}>
            Add First Leader
          </button>
        </div>
      ) : (
        <div>
          <p style={{ margin: '0 0 12px', fontSize: '12px', color: '#9ca3af' }}>{filtered.length} leader{filtered.length !== 1 ? 's' : ''} — click a photo to change it</p>
          {filtered.map((leader, idx) => {
            const groupLeaders = filtered.filter(l => l.tier === leader.tier && (l.province || '') === (leader.province || ''));
            const groupIdx = groupLeaders.findIndex(l => l.id === leader.id);
            return (
              <LeaderRow
                key={leader.id}
                leader={leader}
                onEdit={() => setEditing(leader)}
                onPhoto={() => setChangingPhotoFor(leader)}
                onToggle={() => handleToggle(leader)}
                onMoveUp={() => handleMove(leader, 'up')}
                onMoveDown={() => handleMove(leader, 'down')}
                isFirst={groupIdx === 0}
                isLast={groupIdx === groupLeaders.length - 1}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}


export { LeadershipManager as default };
