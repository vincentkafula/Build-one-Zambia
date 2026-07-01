import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Plus, Search, Edit2, Trash2, RotateCcw, Upload, X, CheckCircle,
  AlertCircle, User, Camera, Users, BarChart2, Clock, Filter, ChevronDown,
  Save, Eye, EyeOff, Palette, Hash, BookOpen, Briefcase, MapPin, Award,
} from 'lucide-react';
import { candidatesApi, type BackendCandidate, type CandidateElectionType, type CandidateCreatePayload } from '../lib/api';
import { presidentialCandidates } from '../data/mockData';

// ─── Types ────────────────────────────────────────────────────────────────────

const ELECTION_TYPES: { value: CandidateElectionType; label: string; scope: string }[] = [
  { value: 'presidential', label: 'Presidential', scope: 'National' },
  { value: 'mp',           label: 'Parliamentary (MP)', scope: 'Constituency' },
  { value: 'mayoral',      label: 'Mayoral', scope: 'District' },
  { value: 'councillor',   label: 'Councillor', scope: 'Ward' },
];

const TITLES = ['Mr', 'Mrs', 'Ms', 'Dr', 'Prof', 'Rev', 'Eng', 'Hon'];
const COLORS = [
  '#16a34a','#dc2626','#2563eb','#ca8a04','#7c3aed','#0891b2',
  '#d97706','#0f766e','#b45309','#0369a1','#9333ea','#e11d48',
  '#1d4ed8','#065f46','#92400e','#be185d','#6b7280',
];

// ─── Empty form state ─────────────────────────────────────────────────────────

const EMPTY_FORM: CandidateCreatePayload = {
  electionType: 'presidential',
  scopeId: 'national',
  scopeName: 'National',
  name: '',
  title: '',
  party: '',
  partyFullName: '',
  partyColor: '#16a34a',
  photoDataUrl: undefined,
  ballotNumber: undefined,
  gender: undefined,
  bio: '',
  age: undefined,
  education: '',
  occupation: '',
  homeDistrict: '',
};

// ─── Toast ────────────────────────────────────────────────────────────────────

function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 4000); return () => clearTimeout(t); }, [onClose]);
  return (
    <div className={`fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-xl text-sm font-medium transition-all ${type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
      {type === 'success' ? <CheckCircle className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
      {message}
      <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100"><X className="w-3.5 h-3.5" /></button>
    </div>
  );
}

// ─── Photo Upload ─────────────────────────────────────────────────────────────

function PhotoUploader({ value, onChange, candidateName }: {
  value?: string;
  onChange: (dataUrl: string | null) => void;
  candidateName?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    if (file.size > 5 * 1024 * 1024) { alert('Photo must be under 5 MB'); return; }
    const reader = new FileReader();
    reader.onload = (e) => onChange(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const initials = candidateName
    ? candidateName.split(' ').filter(Boolean).slice(-2).map(w => w[0]).join('').toUpperCase()
    : '?';

  return (
    <div className="flex items-start gap-4">
      {/* Preview */}
      <div className="relative shrink-0">
        <div className="w-28 h-28 rounded-2xl border-2 border-dashed border-border overflow-hidden bg-muted flex items-center justify-center">
          {value ? (
            <img src={value} alt="Preview" className="w-full h-full object-cover" />
          ) : (
            <span className="text-2xl font-bold text-muted-foreground">{initials}</span>
          )}
        </div>
        {value && (
          <button
            type="button"
            onClick={() => onChange(null)}
            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 shadow"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Drop zone */}
      <div
        className={`flex-1 border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-colors ${dragging ? 'border-green-500 bg-green-50' : 'border-border hover:border-green-400 hover:bg-green-50/30'}`}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
        onClick={() => inputRef.current?.click()}
      >
        <Camera className="w-6 h-6 mx-auto mb-1 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Drop photo here or <span className="text-green-600 font-medium">click to browse</span></p>
        <p className="text-xs text-muted-foreground mt-0.5">JPG, PNG, WebP · max 5 MB</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
        />
      </div>
    </div>
  );
}

// ─── Candidate Form Modal ─────────────────────────────────────────────────────

function CandidateFormModal({
  editing,
  onSave,
  onClose,
}: {
  editing: BackendCandidate | null;
  onSave: () => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState<CandidateCreatePayload>(
    editing
      ? {
          electionType: editing.electionType,
          scopeId: editing.scopeId,
          scopeName: editing.scopeName,
          name: editing.name,
          title: editing.title || '',
          party: editing.party,
          partyFullName: editing.partyFullName || '',
          partyColor: editing.partyColor,
          photoDataUrl: editing.photoDataUrl,
          ballotNumber: editing.ballotNumber,
          gender: editing.gender,
          bio: editing.bio || '',
          age: editing.age,
          education: editing.education || '',
          occupation: editing.occupation || '',
          homeDistrict: editing.homeDistrict || '',
        }
      : { ...EMPTY_FORM }
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [tab, setTab] = useState<'basic' | 'profile' | 'photo'>('basic');

  const set = <K extends keyof CandidateCreatePayload>(k: K, v: CandidateCreatePayload[K]) =>
    setForm(f => ({ ...f, [k]: v }));

  const handleScopeChange = (et: CandidateElectionType) => {
    const scopeId = et === 'presidential' ? 'national' : '';
    const scopeName = et === 'presidential' ? 'National' : '';
    setForm(f => ({ ...f, electionType: et, scopeId, scopeName }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { setError('Candidate name is required'); return; }
    if (!form.party.trim()) { setError('Party abbreviation is required'); return; }
    if (form.electionType !== 'presidential' && !form.scopeId.trim()) {
      setError(`Please enter the ${ELECTION_TYPES.find(x => x.value === form.electionType)?.scope} ID`);
      return;
    }

    setSaving(true); setError('');
    try {
      if (editing) {
        const { photoDataUrl, ...rest } = form;
        await candidatesApi.update(editing.id, rest);
        // Update photo separately only if changed
        if (photoDataUrl !== editing.photoDataUrl) {
          await candidatesApi.updatePhoto(editing.id, photoDataUrl ?? null);
        }
      } else {
        await candidatesApi.create(form);
      }
      onSave();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const elType = ELECTION_TYPES.find(x => x.value === form.electionType);

  return (
    <div className="fixed inset-0 z-40 bg-black/50 flex items-start justify-center p-4 overflow-y-auto">
      <div className="bg-card rounded-2xl shadow-2xl w-full max-w-2xl my-8 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-700 to-green-600 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-white text-lg">{editing ? 'Edit Candidate' : 'Add New Candidate'}</h2>
            <p className="text-green-100 text-sm">{editing ? editing.name : 'Fill in the candidate details below'}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border bg-muted/30">
          {[
            { key: 'basic', label: 'Basic Info', icon: <User className="w-4 h-4" /> },
            { key: 'profile', label: 'Profile', icon: <BookOpen className="w-4 h-4" /> },
            { key: 'photo', label: 'Photo', icon: <Camera className="w-4 h-4" /> },
          ].map(t => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key as typeof tab)}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors ${tab === t.key ? 'border-green-600 text-green-700 bg-white' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
            >
              {t.icon}{t.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* ── Basic Info ── */}
          {tab === 'basic' && (
            <div className="space-y-4">
              {/* Election Type */}
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">Election Type *</label>
                <div className="grid grid-cols-2 gap-2">
                  {ELECTION_TYPES.map(et => (
                    <button
                      key={et.value}
                      type="button"
                      onClick={() => handleScopeChange(et.value)}
                      className={`px-3 py-2.5 rounded-lg border text-sm font-medium transition-colors text-left ${form.electionType === et.value ? 'bg-green-600 text-white border-green-600' : 'border-border bg-card hover:border-green-400'}`}
                    >
                      <div className="font-semibold">{et.label}</div>
                      <div className={`text-xs ${form.electionType === et.value ? 'text-green-100' : 'text-muted-foreground'}`}>Scope: {et.scope}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Scope ID (only for non-presidential) */}
              {form.electionType !== 'presidential' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-1.5">{elType?.scope} ID *</label>
                    <input
                      type="text"
                      value={form.scopeId}
                      onChange={e => set('scopeId', e.target.value)}
                      placeholder={`e.g. central-chibombo-katuba`}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-1.5">{elType?.scope} Name *</label>
                    <input
                      type="text"
                      value={form.scopeName}
                      onChange={e => set('scopeName', e.target.value)}
                      placeholder={`e.g. Katuba Constituency`}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>
              )}

              {/* Name + Title */}
              <div className="grid grid-cols-4 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">Title</label>
                  <select
                    value={form.title}
                    onChange={e => set('title', e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">—</option>
                    {TITLES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="col-span-3">
                  <label className="block text-sm font-semibold text-foreground mb-1.5">Full Name *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={e => set('name', e.target.value)}
                    placeholder="e.g. Hakainde Hichilema"
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

              {/* Gender */}
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">Gender</label>
                <div className="flex gap-2">
                  {(['male', 'female', 'other'] as const).map(g => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => set('gender', form.gender === g ? undefined : g)}
                      className={`px-3 py-1.5 rounded-lg border text-sm capitalize transition-colors ${form.gender === g ? 'bg-green-600 text-white border-green-600' : 'border-border hover:border-green-400'}`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              {/* Party */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">Party Abbreviation *</label>
                  <input
                    type="text"
                    value={form.party}
                    onChange={e => set('party', e.target.value.toUpperCase())}
                    placeholder="e.g. UPND"
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm font-mono focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">Party Full Name</label>
                  <input
                    type="text"
                    value={form.partyFullName}
                    onChange={e => set('partyFullName', e.target.value)}
                    placeholder="e.g. United Party for National Development"
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

              {/* Party Color */}
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5 flex items-center gap-1.5"><Palette className="w-4 h-4" />Party Colour</label>
                <div className="flex items-center gap-3">
                  <div className="flex flex-wrap gap-2">
                    {COLORS.map(c => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => set('partyColor', c)}
                        className={`w-7 h-7 rounded-full border-2 transition-transform ${form.partyColor === c ? 'border-foreground scale-125' : 'border-transparent hover:scale-110'}`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={form.partyColor}
                      onChange={e => set('partyColor', e.target.value)}
                      className="w-10 h-10 rounded-lg border border-border cursor-pointer"
                    />
                    <span className="text-xs font-mono text-muted-foreground">{form.partyColor}</span>
                  </div>
                </div>
                {/* Preview */}
                <div className="mt-2 flex items-center gap-2 px-3 py-2 rounded-lg" style={{ backgroundColor: form.partyColor + '15', border: `1px solid ${form.partyColor}40` }}>
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: form.partyColor }} />
                  <span className="text-sm font-medium" style={{ color: form.partyColor }}>{form.party || 'PARTY'}</span>
                  <span className="text-xs text-muted-foreground">· {form.name || 'Candidate Name'}</span>
                </div>
              </div>

              {/* Ballot # */}
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5 flex items-center gap-1.5"><Hash className="w-4 h-4" />Ballot Number</label>
                <input
                  type="number"
                  min={1}
                  value={form.ballotNumber ?? ''}
                  onChange={e => set('ballotNumber', e.target.value ? parseInt(e.target.value) : undefined)}
                  placeholder="e.g. 1"
                  className="w-28 px-3 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
          )}

          {/* ── Profile ── */}
          {tab === 'profile' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5 flex items-center gap-1"><Award className="w-4 h-4" />Age</label>
                  <input
                    type="number"
                    min={18} max={120}
                    value={form.age ?? ''}
                    onChange={e => set('age', e.target.value ? parseInt(e.target.value) : undefined)}
                    placeholder="e.g. 45"
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5 flex items-center gap-1"><MapPin className="w-4 h-4" />Home District</label>
                  <input
                    type="text"
                    value={form.homeDistrict}
                    onChange={e => set('homeDistrict', e.target.value)}
                    placeholder="e.g. Monze"
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5 flex items-center gap-1"><BookOpen className="w-4 h-4" />Education</label>
                <input
                  type="text"
                  value={form.education}
                  onChange={e => set('education', e.target.value)}
                  placeholder="e.g. BSc Economics, UNZA"
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5 flex items-center gap-1"><Briefcase className="w-4 h-4" />Occupation</label>
                <input
                  type="text"
                  value={form.occupation}
                  onChange={e => set('occupation', e.target.value)}
                  placeholder="e.g. Businessman / Farmer"
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">Biography</label>
                <textarea
                  value={form.bio}
                  onChange={e => set('bio', e.target.value)}
                  rows={5}
                  placeholder="A brief biography of the candidate..."
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                />
              </div>
            </div>
          )}

          {/* ── Photo ── */}
          {tab === 'photo' && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">Upload a high-quality portrait photo. It will be stored securely and used across the results platform.</p>
              <PhotoUploader
                value={form.photoDataUrl}
                onChange={(url) => set('photoDataUrl', url ?? undefined)}
                candidateName={form.name}
              />
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              <AlertCircle className="w-4 h-4 shrink-0" />{error}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-2 border-t border-border">
            <div className="flex gap-2">
              {tab !== 'basic' && <button type="button" onClick={() => setTab(tab === 'photo' ? 'profile' : 'basic')} className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-muted transition-colors">← Back</button>}
              {tab !== 'photo' && <button type="button" onClick={() => setTab(tab === 'basic' ? 'profile' : 'photo')} className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-muted transition-colors">Next →</button>}
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={onClose} className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-muted transition-colors">Cancel</button>
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-60"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving…' : editing ? 'Save Changes' : 'Add Candidate'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Candidate Card ───────────────────────────────────────────────────────────

function CandidateRow({ candidate, onEdit, onDelete, onRestore, photoUrl }: {
  candidate: BackendCandidate;
  onEdit: () => void;
  onDelete: () => void;
  onRestore: () => void;
  photoUrl: string;
}) {
  const [imgError, setImgError] = useState(false);

  const initials = candidate.name.split(' ').filter(Boolean).slice(-2).map(w => w[0]).join('').toUpperCase();

  return (
    <div className={`flex items-center gap-4 p-4 rounded-xl border transition-colors ${candidate.active ? 'border-border bg-card hover:bg-muted/20' : 'border-red-200 bg-red-50/30 opacity-70'}`}>
      {/* Photo */}
      <div className="shrink-0">
        {!imgError && photoUrl ? (
          <img
            src={photoUrl}
            alt={candidate.name}
            onError={() => setImgError(true)}
            className="w-14 h-14 rounded-xl object-cover border border-border"
          />
        ) : (
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold text-lg"
            style={{ backgroundColor: candidate.partyColor }}
          >
            {initials}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-foreground truncate">
            {candidate.title ? `${candidate.title} ` : ''}{candidate.name}
          </span>
          {!candidate.active && (
            <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">Inactive</span>
          )}
          {candidate.ballotNumber != null && (
            <span className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground">#{candidate.ballotNumber}</span>
          )}
        </div>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          <span
            className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full"
            style={{ backgroundColor: candidate.partyColor + '20', color: candidate.partyColor }}
          >
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: candidate.partyColor }} />
            {candidate.party}
          </span>
          <span className="text-xs text-muted-foreground capitalize">{candidate.electionType}</span>
          {candidate.scopeId !== 'national' && (
            <span className="text-xs text-muted-foreground">· {candidate.scopeName || candidate.scopeId}</span>
          )}
          {candidate.gender && (
            <span className="text-xs text-muted-foreground">· {candidate.gender}</span>
          )}
        </div>
        {candidate.bio && (
          <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{candidate.bio}</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 shrink-0">
        {!candidate.active ? (
          <button
            onClick={onRestore}
            title="Restore candidate"
            className="p-2 rounded-lg text-green-600 hover:bg-green-50 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        ) : (
          <>
            <button onClick={onEdit} title="Edit" className="p-2 rounded-lg text-muted-foreground hover:bg-muted transition-colors">
              <Edit2 className="w-4 h-4" />
            </button>
            <button onClick={onDelete} title="Deactivate" className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors">
              <Trash2 className="w-4 h-4" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Seed Modal ───────────────────────────────────────────────────────────────

function SeedModal({ onDone, onClose }: { onDone: () => void; onClose: () => void }) {
  const [seeding, setSeeding] = useState(false);
  const [result, setResult] = useState<{ created: number; skipped: number } | null>(null);
  const [error, setError] = useState('');

  const handleSeed = async () => {
    setSeeding(true); setError('');
    try {
      // Build seed list from presidentialCandidates + static photos
      const seedList = presidentialCandidates.map((c, i) => ({
        id: c.id,
        electionType: 'presidential' as const,
        scopeId: 'national',
        scopeName: 'National',
        name: c.name,
        party: c.party,
        partyColor: c.partyColor,
        ballotNumber: i + 1,
        // Note: static photos are bundled assets, not data-URLs — we skip them here
        // Admins can upload photos individually via the manager
      }));
      const res = await candidatesApi.seed(seedList);
      setResult(res);
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Seeding failed');
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="fixed inset-0 z-40 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-card rounded-2xl shadow-2xl w-full max-w-md p-6">
        <h3 className="font-bold text-lg text-foreground mb-2">Seed Presidential Candidates</h3>
        <p className="text-sm text-muted-foreground mb-4">
          This will import {presidentialCandidates.length} presidential candidates from the static data into the backend database. Already-imported candidates are skipped automatically.
        </p>
        {result && (
          <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-sm text-green-800 mb-4">
            ✓ Created <strong>{result.created}</strong> candidates · Skipped <strong>{result.skipped}</strong> (already exist)
          </div>
        )}
        {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
        <div className="flex gap-2 justify-end">
          <button onClick={onClose} className="px-4 py-2 border border-border rounded-lg text-sm hover:bg-muted">Cancel</button>
          <button
            onClick={handleSeed}
            disabled={seeding}
            className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 disabled:opacity-60"
          >
            {seeding ? 'Seeding…' : 'Import Now'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Stats Bar ────────────────────────────────────────────────────────────────

function StatsBar({ stats }: { stats: { total: number; active: number; inactive: number; recentlyAdded: number; byElectionType: Record<string, number> } }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {[
        { label: 'Total Candidates', value: stats.total, icon: <Users className="w-4 h-4" />, color: 'text-blue-700' },
        { label: 'Active', value: stats.active, icon: <CheckCircle className="w-4 h-4" />, color: 'text-green-700' },
        { label: 'Inactive', value: stats.inactive, icon: <EyeOff className="w-4 h-4" />, color: 'text-red-600' },
        { label: 'Added This Week', value: stats.recentlyAdded, icon: <Clock className="w-4 h-4" />, color: 'text-purple-700' },
      ].map(s => (
        <div key={s.label} className="bg-card border border-border rounded-xl p-4">
          <div className={`flex items-center gap-1.5 text-xs font-medium mb-1 ${s.color}`}>{s.icon}{s.label}</div>
          <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
        </div>
      ))}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function CandidateManager() {
  const [allCandidates, setAllCandidates] = useState<BackendCandidate[]>([]);
  const [stats, setStats] = useState<{ total: number; active: number; inactive: number; recentlyAdded: number; byElectionType: Record<string, number> } | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showSeed, setShowSeed] = useState(false);
  const [editing, setEditing] = useState<BackendCandidate | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<CandidateElectionType | 'all'>('all');
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('active');
  const [filterParty, setFilterParty] = useState('');

  const showToast = (message: string, type: 'success' | 'error') => setToast({ message, type });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [listRes, statsRes] = await Promise.all([
        candidatesApi.list({ active: filterActive === 'all' ? undefined : filterActive === 'active' }),
        candidatesApi.stats().catch(() => null),
      ]);
      setAllCandidates(listRes.candidates);
      if (statsRes) setStats(statsRes.stats);
    } catch {
      showToast('Failed to load candidates', 'error');
    } finally {
      setLoading(false);
    }
  }, [filterActive]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleDelete = async (id: string) => {
    if (!confirm('Deactivate this candidate? They can be restored later.')) return;
    try {
      await candidatesApi.delete(id);
      showToast('Candidate deactivated', 'success');
      loadData();
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Delete failed', 'error');
    }
  };

  const handleRestore = async (id: string) => {
    try {
      await candidatesApi.restore(id);
      showToast('Candidate restored', 'success');
      loadData();
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Restore failed', 'error');
    }
  };

  const handleFormSave = () => {
    showToast(editing ? 'Candidate updated' : 'Candidate added', 'success');
    setShowForm(false);
    setEditing(null);
    loadData();
  };

  // Filter candidates
  const filtered = allCandidates.filter(c => {
    if (filterType !== 'all' && c.electionType !== filterType) return false;
    if (filterParty && !c.party.toLowerCase().includes(filterParty.toLowerCase())) return false;
    if (search) {
      const q = search.toLowerCase();
      return c.name.toLowerCase().includes(q) || c.party.toLowerCase().includes(q) || (c.scopeName || '').toLowerCase().includes(q);
    }
    return true;
  });

  const parties = [...new Set(allCandidates.map(c => c.party))].sort();

  return (
    <div className="space-y-6">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      {showForm && (
        <CandidateFormModal
          editing={editing}
          onSave={handleFormSave}
          onClose={() => { setShowForm(false); setEditing(null); }}
        />
      )}
      {showSeed && (
        <SeedModal onDone={loadData} onClose={() => setShowSeed(false)} />
      )}

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-bold text-foreground">Candidate Management</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Add, edit, and manage election candidates with full profile and photo support</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowSeed(true)}
            className="flex items-center gap-2 px-3 py-2 border border-border rounded-lg text-sm hover:bg-muted transition-colors"
          >
            <Upload className="w-4 h-4" />Seed from Data
          </button>
          <button
            onClick={() => { setEditing(null); setShowForm(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-semibold transition-colors"
          >
            <Plus className="w-4 h-4" />Add Candidate
          </button>
        </div>
      </div>

      {/* Stats */}
      {stats && <StatsBar stats={stats} />}

      {/* Election type breakdown */}
      {stats && (
        <div className="flex gap-2 flex-wrap">
          {ELECTION_TYPES.map(et => (
            <div
              key={et.value}
              className="flex items-center gap-2 px-3 py-1.5 bg-card border border-border rounded-lg text-xs"
            >
              <BarChart2 className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="font-medium">{et.label}</span>
              <span className="bg-muted px-1.5 py-0.5 rounded-full font-bold">{stats.byElectionType[et.value] || 0}</span>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, party, scope…"
            className="w-full pl-9 pr-3 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
        <div className="flex items-center gap-1.5">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <select
            value={filterType}
            onChange={e => setFilterType(e.target.value as any)}
            className="px-3 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="all">All Types</option>
            {ELECTION_TYPES.map(et => <option key={et.value} value={et.value}>{et.label}</option>)}
          </select>
        </div>
        <div className="flex gap-1">
          {(['all', 'active', 'inactive'] as const).map(s => (
            <button
              key={s}
              onClick={() => setFilterActive(s)}
              className={`px-3 py-2 rounded-lg text-sm capitalize transition-colors ${filterActive === s ? 'bg-green-600 text-white' : 'bg-card border border-border hover:bg-muted'}`}
            >
              {s}
            </button>
          ))}
        </div>
        {parties.length > 0 && (
          <div className="relative">
            <select
              value={filterParty}
              onChange={e => setFilterParty(e.target.value)}
              className="pl-3 pr-8 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-green-500 appearance-none"
            >
              <option value="">All Parties</option>
              {parties.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          </div>
        )}
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>Showing <strong className="text-foreground">{filtered.length}</strong> candidate{filtered.length !== 1 ? 's' : ''}</span>
        {(search || filterType !== 'all' || filterParty) && (
          <button
            onClick={() => { setSearch(''); setFilterType('all'); setFilterParty(''); }}
            className="text-xs text-green-600 hover:underline"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card animate-pulse">
              <div className="w-14 h-14 rounded-xl bg-muted shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted rounded w-1/3" />
                <div className="h-3 bg-muted rounded w-1/4" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <Users className="w-12 h-12 mb-3 opacity-30" />
          <p className="font-medium">No candidates found</p>
          <p className="text-sm mt-1">
            {allCandidates.length === 0
              ? 'Use "Seed from Data" to import presidential candidates, or add one manually.'
              : 'Try adjusting your filters.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(c => (
            <CandidateRow
              key={c.id}
              candidate={c}
              photoUrl={candidatesApi.photoUrl(c.id)}
              onEdit={() => { setEditing(c); setShowForm(true); }}
              onDelete={() => handleDelete(c.id)}
              onRestore={() => handleRestore(c.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export { CandidateManager as default };
