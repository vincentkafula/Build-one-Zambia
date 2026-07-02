import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, RefreshCw, Loader2, AlertCircle,
         CheckCircle2, X, ImagePlus, Image as ImageIcon, ArrowUp, ArrowDown } from 'lucide-react';
import { shadowCabinetApi, type ShadowMember } from '../lib/api';

type Gender = 'male' | 'female';

const EMPTY = {
  name: '', role: '', credentials: '', constituency: 'National',
  focus: '', headline: '', bio1: '', bio2: '', quote: '', signature: '',
};

function photoUrl(id: string, gender: Gender) {
  return shadowCabinetApi.photoUrl(id, gender);
}

function MemberPhoto({ member }: { member: ShadowMember }) {
  const [err, setErr] = useState(false);
  if (!member.hasPhoto || err) {
    return (
      <div className="w-14 h-14 rounded-xl flex items-center justify-center bg-muted border border-border shrink-0">
        <ImageIcon className="w-5 h-5 text-muted-foreground/40" />
      </div>
    );
  }
  return (
    <img src={photoUrl(member.id, member.gender)} alt={member.name}
      onError={() => setErr(true)}
      className="w-14 h-14 rounded-xl object-cover border border-border shrink-0" />
  );
}

function MemberForm({
  initial, existingPhotoUrl: epUrl, gender, onSave, onCancel, saving,
}: {
  initial: typeof EMPTY;
  existingPhotoUrl?: string;
  gender: Gender;
  onSave: (data: typeof EMPTY & { photoDataUrl?: string }) => Promise<void>;
  onCancel: () => void;
  saving: boolean;
}) {
  const [form, setForm] = useState(initial);
  const [preview, setPreview] = useState<string | undefined>(epUrl);
  const [photoDataUrl, setPhotoDataUrl] = useState<string | undefined>();

  const set = (k: keyof typeof EMPTY, v: string) => setForm(p => ({ ...p, [k]: v }));

  function handleImage(file: File | null) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => { const d = reader.result as string; setPhotoDataUrl(d); setPreview(d); };
    reader.readAsDataURL(file);
  }

  const INP = "w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:border-primary";
  const TA  = `${INP} resize-none`;

  return (
    <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
      <div>
        <label className="block text-xs font-semibold text-muted-foreground mb-2">PHOTO</label>
        <div className="flex items-center gap-4">
          <div className="w-24 h-28 rounded-xl overflow-hidden bg-muted border border-border flex items-center justify-center shrink-0">
            {preview ? <img src={preview} alt="" className="w-full h-full object-cover" /> : <ImageIcon className="w-6 h-6 text-muted-foreground/40" />}
          </div>
          <label className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-sm cursor-pointer hover:bg-muted transition-colors">
            <ImagePlus className="w-4 h-4" /> {preview ? 'Change Photo' : 'Upload Photo'}
            <input type="file" accept="image/*" className="hidden" onChange={e => handleImage(e.target.files?.[0] ?? null)} />
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-muted-foreground mb-1">FULL NAME *</label>
          <input required value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Dr. Lubinda Haabazoka" className={INP} />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-muted-foreground mb-1">ROLE / PORTFOLIO *</label>
          <input required value={form.role} onChange={e => set('role', e.target.value)}
            placeholder={gender === 'male' ? 'Shadow Minister of Energy & Electricity' : 'Shadow Minister of Finance'} className={INP} />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-muted-foreground mb-1">CREDENTIALS</label>
          <input value={form.credentials} onChange={e => set('credentials', e.target.value)} placeholder="e.g. PhD Economics · Director, UNZA Graduate School" className={INP} />
        </div>
        <div>
          <label className="block text-xs font-semibold text-muted-foreground mb-1">CONSTITUENCY</label>
          <input value={form.constituency} onChange={e => set('constituency', e.target.value)} placeholder="National" className={INP} />
        </div>
        <div>
          <label className="block text-xs font-semibold text-muted-foreground mb-1">KEY FOCUS AREA</label>
          <input value={form.focus} onChange={e => set('focus', e.target.value)} placeholder="e.g. Energy Sector Transformation" className={INP} />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-muted-foreground mb-1">HEADLINE (optional)</label>
          <input value={form.headline || ''} onChange={e => set('headline', e.target.value)} placeholder="One-line policy headline displayed on card" className={INP} />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-muted-foreground mb-1">BIO — PARAGRAPH 1 *</label>
          <textarea rows={4} value={form.bio1} onChange={e => set('bio1', e.target.value)} placeholder="Background, career history..." className={TA} />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-muted-foreground mb-1">BIO — PARAGRAPH 2</label>
          <textarea rows={4} value={form.bio2} onChange={e => set('bio2', e.target.value)} placeholder="Policy vision, achievements..." className={TA} />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-muted-foreground mb-1">QUOTE</label>
          <textarea rows={2} value={form.quote} onChange={e => set('quote', e.target.value)} placeholder={`"Their key quote here..."`} className={TA} />
        </div>
        <div>
          <label className="block text-xs font-semibold text-muted-foreground mb-1">SIGNATURE NAME</label>
          <input value={form.signature} onChange={e => set('signature', e.target.value)} placeholder="e.g. Lubinda Haabazoka" className={INP} />
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <button type="button" onClick={onCancel} disabled={saving}
          className="flex-1 px-4 py-2.5 rounded-xl text-sm border border-border hover:bg-muted transition-colors">
          Cancel
        </button>
        <button type="button" disabled={saving || !form.name || !form.role}
          onClick={() => onSave({ ...form, photoDataUrl })}
          className="flex-1 px-4 py-2.5 rounded-xl text-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center justify-center gap-2">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>
    </div>
  );
}

export default function ShadowCabinetManager() {
  const [gender, setGender] = useState<Gender>('male');
  const [members, setMembers] = useState<ShadowMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm]   = useState(false);
  const [editing, setEditing]     = useState<ShadowMember | null>(null);

  async function load() {
    setLoading(true); setError('');
    try {
      const res = await shadowCabinetApi.list(gender);
      setMembers(res.members);
    } catch (e) { setError(e instanceof Error ? e.message : 'Failed to load'); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, [gender]);

  async function handleCreate(data: typeof EMPTY & { photoDataUrl?: string }) {
    setSaving(true); setError(''); setSuccess('');
    try {
      await shadowCabinetApi.create(gender, data);
      setSuccess(`${data.name} added to ${gender} Shadow Cabinet`);
      setShowForm(false); load();
    } catch (e) { setError(e instanceof Error ? e.message : 'Failed to save'); }
    finally { setSaving(false); }
  }

  async function handleUpdate(data: typeof EMPTY & { photoDataUrl?: string }) {
    if (!editing) return;
    setSaving(true); setError(''); setSuccess('');
    try {
      await shadowCabinetApi.update(gender, editing.id, data);
      setSuccess(`${data.name} updated`);
      setEditing(null); load();
    } catch (e) { setError(e instanceof Error ? e.message : 'Failed to update'); }
    finally { setSaving(false); }
  }

  async function handleDelete(m: ShadowMember) {
    if (!confirm(`Remove ${m.name} from the Shadow Cabinet?`)) return;
    setError(''); setSuccess('');
    try {
      await shadowCabinetApi.remove(gender, m.id);
      setSuccess(`${m.name} removed`); load();
    } catch (e) { setError(e instanceof Error ? e.message : 'Failed to delete'); }
  }

  async function move(id: string, dir: 'up' | 'down') {
    const idx = members.findIndex(m => m.id === id);
    if (idx < 0) return;
    const newList = [...members];
    const swapIdx = dir === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= newList.length) return;
    [newList[idx], newList[swapIdx]] = [newList[swapIdx], newList[idx]];
    setMembers(newList);
    try { await shadowCabinetApi.reorder(gender, newList.map(m => m.id)); }
    catch { setError('Reorder failed — reload to resync'); load(); }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold">Shadow Cabinet Manager</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Edit the "MEET ALL CANDIDATES" section — names, roles, bios, photos, and display order.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={() => setGender('male')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${gender === 'male' ? 'bg-primary text-primary-foreground' : 'border border-border hover:bg-muted'}`}>
            Male Cabinet
          </button>
          <button onClick={() => setGender('female')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${gender === 'female' ? 'bg-primary text-primary-foreground' : 'border border-border hover:bg-muted'}`}>
            Female Cabinet
          </button>
          <button onClick={load} className="p-2 rounded-xl border border-border hover:bg-muted transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
          {!showForm && !editing && (
            <button onClick={() => { setShowForm(true); setEditing(null); setError(''); setSuccess(''); }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm hover:bg-primary/90 transition-colors">
              <Plus className="w-4 h-4" /> Add Member
            </button>
          )}
        </div>
      </div>

      {error   && <div className="mb-4 flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3"><AlertCircle className="w-4 h-4 shrink-0" />{error}</div>}
      {success && <div className="mb-4 flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-xl px-4 py-3"><CheckCircle2 className="w-4 h-4 shrink-0" />{success}</div>}

      {showForm && (
        <div className="mb-6">
          <MemberForm initial={EMPTY} gender={gender} onSave={handleCreate} onCancel={() => setShowForm(false)} saving={saving} />
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16 gap-2 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin" /> Loading…
        </div>
      ) : members.length === 0 && !showForm ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
          <ImageIcon className="w-10 h-10 text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground">No {gender} shadow cabinet members added yet.</p>
          <p className="text-xs text-muted-foreground/60 max-w-md">
            The existing team bios on the website are currently hardcoded. Add members here to manage them
            from the Admin Panel — they appear in a new section on the public Candidates page.
          </p>
          <button onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm mt-2">
            <Plus className="w-4 h-4" /> Add First Member
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {members.map((m, idx) => (
            <div key={m.id}>
              {editing?.id === m.id ? (
                <MemberForm
                  initial={{ name: m.name, role: m.role, credentials: m.credentials || '', constituency: m.constituency || 'National',
                    focus: m.focus || '', headline: m.headline || '', bio1: m.bio1 || '', bio2: m.bio2 || '', quote: m.quote || '', signature: m.signature || '' }}
                  existingPhotoUrl={m.hasPhoto ? photoUrl(m.id, gender) : undefined}
                  gender={gender} onSave={handleUpdate} onCancel={() => setEditing(null)} saving={saving}
                />
              ) : (
                <div className="flex items-start gap-4 p-4 rounded-xl border border-border bg-card hover:border-primary/30 transition-colors">
                  <MemberPhoto member={m} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-semibold text-sm truncate">{m.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">{m.role}</p>
                        {m.credentials && <p className="text-xs text-muted-foreground/60 mt-0.5 truncate">{m.credentials}</p>}
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button onClick={() => move(m.id, 'up')} disabled={idx === 0}
                          className="p-1.5 rounded-lg hover:bg-muted transition-colors disabled:opacity-30" title="Move up">
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => move(m.id, 'down')} disabled={idx === members.length - 1}
                          className="p-1.5 rounded-lg hover:bg-muted transition-colors disabled:opacity-30" title="Move down">
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => { setEditing(m); setShowForm(false); setError(''); setSuccess(''); }}
                          className="p-1.5 rounded-lg hover:bg-muted transition-colors" title="Edit">
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleDelete(m)}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors" title="Delete">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    {m.focus && (
                      <span className="inline-block text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary mt-2">{m.focus}</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 p-4 rounded-xl bg-muted/50 border border-border">
        <p className="text-xs text-muted-foreground">
          <strong>How this works:</strong> Members added here appear in the <em>"MEET ALL CANDIDATES"</em> section
          on the public {gender === 'male' ? 'Male' : 'Female'} Candidates page, below the existing featured bios.
          Use the ↑↓ arrows to control display order.
        </p>
      </div>
    </div>
  );
}
