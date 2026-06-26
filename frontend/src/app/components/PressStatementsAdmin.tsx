import { useState, useEffect, useRef, useCallback } from 'react';
import {
  FileText, Upload, Trash2, Eye, EyeOff, RefreshCw, Plus, X,
  Download, Calendar, CheckCircle, AlertCircle, Edit2, Newspaper,
} from 'lucide-react';
import { pressApi, PressStatement, PressType } from '../lib/api';

const NAVY = '#1e2d4a';
const A    = '#d97706';

const TYPE_OPTIONS: { value: PressType; label: string }[] = [
  { value: 'press-release',   label: 'Press Release' },
  { value: 'letter',          label: 'Letter' },
  { value: 'media-statement', label: 'Media Statement' },
  { value: 'communique',      label: 'Communiqué' },
];

const TYPE_CFG: Record<PressType, { color: string; bg: string }> = {
  'press-release':   { color: '#1d4ed8', bg: '#eff6ff' },
  'letter':          { color: '#7c3aed', bg: '#f5f3ff' },
  'media-statement': { color: '#0369a1', bg: '#e0f2fe' },
  'communique':      { color: '#047857', bg: '#ecfdf5' },
};

function formatBytes(b: number) {
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(0)} KB`;
  return `${(b / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(s: string) {
  return new Date(s).toLocaleDateString('en-ZM', { day: 'numeric', month: 'short', year: 'numeric' });
}

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

// ── Upload form ───────────────────────────────────────────────────────────────

interface FormState {
  type: PressType;
  title: string;
  summary: string;
  date: string;
  author: string;
  tags: string;
  published: boolean;
}

const EMPTY_FORM: FormState = {
  type: 'press-release',
  title: '',
  summary: '',
  date: new Date().toISOString().slice(0, 10),
  author: '',
  tags: '',
  published: true,
};

function UploadForm({
  onDone,
  editing,
}: {
  onDone: () => void;
  editing?: PressStatement;
}) {
  const [form, setForm] = useState<FormState>(
    editing
      ? {
          type: editing.type,
          title: editing.title,
          summary: editing.summary,
          date: editing.date,
          author: editing.author || '',
          tags: (editing.tags || []).join(', '),
          published: editing.published,
        }
      : EMPTY_FORM,
  );
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  function set(key: keyof FormState, val: unknown) {
    setForm(f => ({ ...f, [key]: val }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!editing && !pdfFile) { setError('Please select a PDF file.'); return; }
    if (!form.title.trim())   { setError('Title is required.'); return; }
    if (!form.date)           { setError('Date is required.'); return; }

    setUploading(true);
    setError('');
    try {
      const tags = form.tags.split(',').map(t => t.trim()).filter(Boolean);

      if (editing) {
        const updates: Record<string, unknown> = {
          type: form.type,
          title: form.title,
          summary: form.summary,
          date: form.date,
          author: form.author,
          tags,
          published: form.published,
        };
        if (pdfFile) {
          updates.pdfDataUrl = await fileToBase64(pdfFile);
          updates.fileName = pdfFile.name;
          updates.mimeType = pdfFile.type;
          updates.sizeBytes = pdfFile.size;
        }
        await pressApi.update(editing.id, updates as Parameters<typeof pressApi.update>[1]);
      } else {
        const pdfDataUrl = await fileToBase64(pdfFile!);
        await pressApi.upload({
          type: form.type,
          title: form.title,
          summary: form.summary,
          date: form.date,
          author: form.author,
          tags,
          published: form.published,
          fileName: pdfFile!.name,
          mimeType: pdfFile!.type,
          sizeBytes: pdfFile!.size,
          pdfDataUrl,
        });
      }
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  }

  const inp = 'w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-amber-500';

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Type */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">TYPE *</label>
          <select value={form.type} onChange={e => set('type', e.target.value)} className={inp}>
            {TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>

        {/* Date */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">DATE *</label>
          <input type="date" value={form.date} onChange={e => set('date', e.target.value)} className={inp} />
        </div>

        {/* Title */}
        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">TITLE *</label>
          <input value={form.title} onChange={e => set('title', e.target.value)} placeholder="e.g. BOZ Statement on the 2026 Budget" className={inp} />
        </div>

        {/* Author */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">AUTHOR / SIGNATORY</label>
          <input value={form.author} onChange={e => set('author', e.target.value)} placeholder="e.g. Party President" className={inp} />
        </div>

        {/* Tags */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">TAGS (comma-separated)</label>
          <input value={form.tags} onChange={e => set('tags', e.target.value)} placeholder="economy, mining, youth" className={inp} />
        </div>

        {/* Summary */}
        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">SUMMARY / DESCRIPTION</label>
          <textarea value={form.summary} onChange={e => set('summary', e.target.value)} rows={3} placeholder="Brief summary of the document…" className={`${inp} resize-none`} />
        </div>

        {/* PDF file */}
        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">
            PDF DOCUMENT {editing ? '(leave blank to keep existing)' : '*'}
          </label>
          <div
            className="border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors"
            style={{ borderColor: pdfFile ? '#16a34a' : '#d1d5db', background: pdfFile ? '#f0fdf4' : '#fafafa' }}
            onClick={() => fileRef.current?.click()}
          >
            {pdfFile ? (
              <div className="flex items-center justify-center gap-3">
                <CheckCircle size={20} className="text-green-500" />
                <div className="text-left">
                  <p className="text-sm font-semibold text-green-700">{pdfFile.name}</p>
                  <p className="text-xs text-green-500">{formatBytes(pdfFile.size)}</p>
                </div>
                <button type="button" onClick={e => { e.stopPropagation(); setPdfFile(null); }} className="ml-2 text-gray-400 hover:text-red-500">
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div>
                <Upload size={24} className="mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-gray-500">Click to select PDF</p>
                <p className="text-xs text-gray-400 mt-1">PDF only · Max 10 MB</p>
              </div>
            )}
            <input ref={fileRef} type="file" accept="application/pdf" className="hidden"
              onChange={e => {
                const f = e.target.files?.[0];
                if (f) {
                  if (f.size > 10 * 1024 * 1024) { setError('File is too large (max 10 MB).'); return; }
                  setPdfFile(f); setError('');
                }
              }}
            />
          </div>
        </div>

        {/* Published toggle */}
        <div className="sm:col-span-2 flex items-center gap-3">
          <button
            type="button"
            onClick={() => set('published', !form.published)}
            className="relative w-11 h-6 rounded-full transition-colors"
            style={{ background: form.published ? '#16a34a' : '#d1d5db' }}
          >
            <span className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform" style={{ transform: form.published ? 'translateX(20px)' : 'none' }} />
          </button>
          <span className="text-sm text-gray-600">
            {form.published ? 'Published — visible to public' : 'Draft — hidden from public'}
          </span>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-lg text-sm text-red-700 bg-red-50 border border-red-200 flex items-center gap-2">
          <AlertCircle size={14} /> {error}
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={uploading}
          className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-white text-sm font-semibold disabled:opacity-60"
          style={{ background: A }}
        >
          <Upload size={15} />
          {uploading ? 'Uploading…' : editing ? 'Save Changes' : 'Upload Statement'}
        </button>
        <button type="button" onClick={onDone} className="px-4 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-600 hover:bg-gray-50">
          Cancel
        </button>
      </div>
    </form>
  );
}

// ── Statement row ─────────────────────────────────────────────────────────────

function StatRow({
  doc,
  onEdit,
  onDelete,
  onToggle,
}: {
  doc: PressStatement;
  onEdit: (d: PressStatement) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string, published: boolean) => void;
}) {
  const [downloading, setDownloading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const cfg = TYPE_CFG[doc.type];

  async function download() {
    setDownloading(true);
    try {
      const res = await pressApi.download(doc.id);
      const a = document.createElement('a');
      a.href = res.dataUrl;
      a.download = res.fileName;
      a.click();
    } catch { alert('Download failed.'); }
    finally { setDownloading(false); }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl px-5 py-4 flex items-center gap-4 hover:border-gray-300 transition-colors">
      {/* Type badge */}
      <span className="text-xs px-2.5 py-1 rounded-full font-semibold shrink-0" style={{ color: cfg.color, background: cfg.bg }}>
        {TYPE_OPTIONS.find(t => t.value === doc.type)?.label || doc.type}
      </span>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-800 truncate">{doc.title}</p>
        <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-400">
          <span className="flex items-center gap-1"><Calendar size={10} />{formatDate(doc.date)}</span>
          {doc.author && <span>{doc.author}</span>}
          <span>{formatBytes(doc.sizeBytes)}</span>
          <span>{doc.downloadCount} downloads</span>
        </div>
      </div>

      {/* Status */}
      <span className="shrink-0 text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: doc.published ? '#f0fdf4' : '#fafafa', color: doc.published ? '#16a34a' : '#9ca3af', border: `1px solid ${doc.published ? '#bbf7d0' : '#e5e7eb'}` }}>
        {doc.published ? 'Published' : 'Draft'}
      </span>

      {/* Actions */}
      <div className="flex items-center gap-2 shrink-0">
        <button onClick={download} disabled={downloading} title="Download" className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 disabled:opacity-50">
          <Download size={15} />
        </button>
        <button onClick={() => onToggle(doc.id, !doc.published)} title={doc.published ? 'Unpublish' : 'Publish'} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400">
          {doc.published ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
        <button onClick={() => onEdit(doc)} title="Edit" className="p-2 rounded-lg hover:bg-gray-100 text-gray-400">
          <Edit2 size={15} />
        </button>
        {confirmDelete ? (
          <div className="flex items-center gap-1">
            <button onClick={() => onDelete(doc.id)} className="text-xs px-2 py-1 rounded bg-red-600 text-white font-semibold">Delete</button>
            <button onClick={() => setConfirmDelete(false)} className="text-xs px-2 py-1 rounded bg-gray-200 text-gray-600">Cancel</button>
          </div>
        ) : (
          <button onClick={() => setConfirmDelete(true)} title="Delete" className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500">
            <Trash2 size={15} />
          </button>
        )}
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export function PressStatementsAdmin() {
  const [statements, setStatements] = useState<PressStatement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<PressStatement | undefined>();
  const [filterType, setFilterType] = useState<PressType | 'all'>('all');
  const [msg, setMsg] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await pressApi.adminList(filterType !== 'all' ? { type: filterType } : undefined);
      setStatements(res.statements);
    } catch {
      setMsg('Could not load press statements.');
    } finally {
      setLoading(false);
    }
  }, [filterType]);

  useEffect(() => { load(); }, [load]);

  async function handleDelete(id: string) {
    try {
      await pressApi.delete(id);
      setMsg('Statement deleted.');
      load();
    } catch { setMsg('Delete failed.'); }
  }

  async function handleToggle(id: string, published: boolean) {
    try {
      await pressApi.update(id, { published });
      load();
    } catch { setMsg('Failed to toggle visibility.'); }
  }

  function openEdit(doc: PressStatement) {
    setEditing(doc);
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditing(undefined);
    load();
  }

  const totals = {
    total: statements.length,
    published: statements.filter(s => s.published).length,
    draft: statements.filter(s => !s.published).length,
    downloads: statements.reduce((sum, s) => sum + s.downloadCount, 0),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold" style={{ fontFamily: 'Oswald, sans-serif', color: NAVY, letterSpacing: '0.04em' }}>
            PRESS STATEMENTS & LETTERS
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">Upload and manage press releases, letters, and media statements.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => load()} className="flex items-center gap-1.5 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
            <RefreshCw size={14} /> Refresh
          </button>
          <button
            onClick={() => { setEditing(undefined); setShowForm(s => !s); }}
            className="flex items-center gap-1.5 px-4 py-2 text-sm text-white rounded-lg font-semibold"
            style={{ background: showForm ? '#6b7280' : A }}
          >
            {showForm ? <><X size={14} /> Close</> : <><Plus size={14} /> Upload New</>}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total', value: totals.total, icon: <Newspaper size={16} className="text-gray-400" /> },
          { label: 'Published', value: totals.published, icon: <Eye size={16} className="text-green-500" /> },
          { label: 'Drafts', value: totals.draft, icon: <EyeOff size={16} className="text-gray-400" /> },
          { label: 'Downloads', value: totals.downloads, icon: <Download size={16} className="text-amber-500" /> },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-200 px-4 py-3 flex items-center gap-3">
            {s.icon}
            <div>
              <p className="text-2xl font-bold" style={{ color: NAVY }}>{s.value}</p>
              <p className="text-xs text-gray-400">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Alert */}
      {msg && (
        <div className="p-3 rounded-lg text-sm text-blue-700 bg-blue-50 border border-blue-200 flex items-center gap-2">
          <AlertCircle size={14} /> {msg}
          <button onClick={() => setMsg('')} className="ml-auto text-blue-400 hover:text-blue-600"><X size={14} /></button>
        </div>
      )}

      {/* Upload / Edit form */}
      {showForm && (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <h3 className="text-base font-bold mb-5" style={{ color: NAVY }}>
            {editing ? `Edit: ${editing.title}` : 'Upload New Statement'}
          </h3>
          <UploadForm onDone={closeForm} editing={editing} />
        </div>
      )}

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        <span className="text-sm text-gray-500 self-center mr-1">Filter:</span>
        {([['all', 'All'] as const, ...TYPE_OPTIONS.map(o => [o.value, o.label] as const)]).map(([val, lbl]) => (
          <button
            key={val}
            onClick={() => setFilterType(val as PressType | 'all')}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors"
            style={{
              background: filterType === val ? NAVY : '#fff',
              color: filterType === val ? '#fff' : '#6b7280',
              borderColor: filterType === val ? NAVY : '#d1d5db',
            }}
          >
            {lbl}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="text-center py-12">
          <RefreshCw size={22} className="animate-spin mx-auto mb-2 text-gray-300" />
          <p className="text-sm text-gray-400">Loading…</p>
        </div>
      ) : statements.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">
          <FileText className="w-12 h-12 mx-auto mb-3 text-gray-200" />
          <p className="text-gray-400 font-medium">No statements uploaded yet</p>
          <p className="text-sm text-gray-300 mt-1">Click "Upload New" to add your first press statement or letter.</p>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-xs text-gray-400">{statements.length} statement{statements.length !== 1 ? 's' : ''}</p>
          {statements.map(doc => (
            <StatRow
              key={doc.id}
              doc={doc}
              onEdit={openEdit}
              onDelete={handleDelete}
              onToggle={handleToggle}
            />
          ))}
        </div>
      )}
    </div>
  );
}
