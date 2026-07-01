import { useState, useEffect, useRef } from 'react';
import {
  FileText, Upload, Trash2, Edit3, Eye, Download, Check, AlertCircle,
  FileSpreadsheet, Loader2, Plus, Star, X, ExternalLink,
} from 'lucide-react';
import { documentsApi, DocumentMeta } from '../lib/api';

const CATEGORIES = [
  { value: 'founding',   label: 'Founding Document' },
  { value: 'manifesto',  label: 'Manifesto' },
  { value: 'policy',     label: 'Policy Framework' },
  { value: 'governance', label: 'Governance' },
  { value: 'report',     label: 'Report' },
  { value: 'budget',     label: 'Budget' },
  { value: 'election',   label: 'Election' },
  { value: 'press',      label: 'Press Release' },
  { value: 'other',      label: 'Other' },
];

const ACCEPTED = '.pdf,.xlsx,.xls,.docx,.csv';
const ACCEPTED_TYPES = ['application/pdf', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/csv'];

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function FormatIcon({ format, size = 18 }: { format: string; size?: number }) {
  if (format === 'pdf') return <FileText size={size} color="#dc2626" />;
  if (format === 'xlsx' || format === 'xls' || format === 'csv') return <FileSpreadsheet size={size} color="#16a34a" />;
  return <FileText size={size} color="#6b7280" />;
}

const inp: React.CSSProperties = {
  width: '100%', boxSizing: 'border-box', padding: '10px 12px',
  background: '#111', border: '1px solid #2a2a2a', color: '#fff',
  fontSize: '14px', fontFamily: 'Open Sans, sans-serif', outline: 'none', marginBottom: '12px',
};
const lbl: React.CSSProperties = {
  display: 'block', fontSize: '11px', letterSpacing: '0.12em',
  color: '#6b7280', fontFamily: 'Oswald, sans-serif', marginBottom: '5px',
};

interface UploadForm {
  title: string;
  description: string;
  category: string;
  version: string;
  pages: string;
  featured: boolean;
  externalUrl: string;
}

const emptyForm: UploadForm = {
  title: '', description: '', category: 'policy',
  version: '', pages: '', featured: false, externalUrl: '',
};

function UploadPanel({ onDone, editTarget, onCancel }: {
  onDone: () => void;
  editTarget?: DocumentMeta;
  onCancel: () => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState<UploadForm>(editTarget ? {
    title: editTarget.title,
    description: editTarget.description || '',
    category: editTarget.category,
    version: editTarget.version || '',
    pages: editTarget.pages ? String(editTarget.pages) : '',
    featured: editTarget.featured,
    externalUrl: editTarget.externalUrl || '',
  } : emptyForm);
  const [file, setFile] = useState<File | null>(null);
  const [dataUrl, setDataUrl] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState('');
  const [dragOver, setDragOver] = useState(false);

  const set = (k: keyof UploadForm, v: string | boolean) => setForm(f => ({ ...f, [k]: v }));

  const processFile = (f: File) => {
    if (f.size > 25 * 1024 * 1024) { setErr('File too large. Maximum size is 25 MB.'); return; }
    setFile(f);
    setErr('');
    const reader = new FileReader();
    reader.onloadend = () => setDataUrl(reader.result as string);
    reader.readAsDataURL(f);
    if (!form.title) set('title', f.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' '));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) processFile(f);
  };

  const handleSave = async () => {
    if (!form.title.trim()) { setErr('Title is required.'); return; }
    if (!editTarget && !file && !form.externalUrl.trim()) {
      setErr('Please upload a file or provide an external URL.'); return;
    }
    setUploading(true); setErr('');
    try {
      if (editTarget) {
        const updates: Record<string, unknown> = {
          title: form.title, description: form.description,
          category: form.category, version: form.version,
          pages: form.pages ? parseInt(form.pages) : undefined,
          featured: form.featured,
          externalUrl: form.externalUrl || undefined,
        };
        if (dataUrl) { updates.dataUrl = dataUrl; updates.sizeBytes = file?.size || 0; }
        await documentsApi.update(editTarget.id, updates);
      } else {
        await documentsApi.upload({
          title: form.title.trim(),
          description: form.description.trim() || undefined,
          category: form.category,
          mimeType: file?.type || 'application/octet-stream',
          originalName: file?.name || form.title.trim(),
          sizeBytes: file?.size || 0,
          pages: form.pages ? parseInt(form.pages) : undefined,
          version: form.version.trim() || undefined,
          featured: form.featured,
          dataUrl: dataUrl || undefined,
          externalUrl: form.externalUrl.trim() || undefined,
        });
      }
      onDone();
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ background: '#0d0d0d', border: '1px solid #2a2a2a', padding: '24px', marginBottom: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: '15px', letterSpacing: '0.1em', color: '#e5e7eb' }}>
          {editTarget ? 'EDIT DOCUMENT' : 'UPLOAD DOCUMENT'}
        </span>
        <button onClick={onCancel} style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer' }}>
          <X size={18} />
        </button>
      </div>

      {err && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#450a0a', border: '1px solid #7f1d1d', padding: '10px 14px', marginBottom: '16px', color: '#fca5a5', fontSize: '13px' }}>
          <AlertCircle size={14} /> {err}
        </div>
      )}

      {/* Drop zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileRef.current?.click()}
        style={{
          border: `2px dashed ${dragOver ? '#dc2626' : file ? '#16a34a' : '#2a2a2a'}`,
          background: dragOver ? 'rgba(220,38,38,0.05)' : file ? 'rgba(22,163,74,0.05)' : 'transparent',
          padding: '28px 16px', textAlign: 'center', cursor: 'pointer', marginBottom: '16px',
          transition: 'all 0.2s',
        }}
      >
        <input ref={fileRef} type="file" accept={ACCEPTED} style={{ display: 'none' }}
          onChange={e => { const f = e.target.files?.[0]; if (f) processFile(f); }} />
        {file ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
            <FormatIcon format={file.name.split('.').pop() || ''} size={24} />
            <div style={{ textAlign: 'left' }}>
              <div style={{ color: '#e5e7eb', fontSize: '14px' }}>{file.name}</div>
              <div style={{ color: '#4b5563', fontSize: '12px' }}>{formatBytes(file.size)}</div>
            </div>
            <Check size={16} color="#16a34a" />
          </div>
        ) : (
          <>
            <Upload size={32} color="#4b5563" style={{ margin: '0 auto 10px', display: 'block' }} />
            <div style={{ color: '#9ca3af', fontSize: '13px', marginBottom: '4px' }}>
              Drop your file here or <span style={{ color: '#dc2626' }}>click to browse</span>
            </div>
            <div style={{ color: '#4b5563', fontSize: '11px' }}>PDF, Excel (.xlsx/.xls), Word (.docx), CSV — max 25 MB</div>
          </>
        )}
      </div>

      <div style={{ fontSize: '11px', color: '#4b5563', marginBottom: '12px', textAlign: 'center' }}>
        — OR —
      </div>

      <label style={lbl}>EXTERNAL URL (Google Drive, Dropbox, etc.)</label>
      <input style={inp} placeholder="https://drive.google.com/file/d/..." value={form.externalUrl} onChange={e => set('externalUrl', e.target.value)} />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
        <div style={{ gridColumn: '1 / -1' }}>
          <label style={lbl}>DOCUMENT TITLE *</label>
          <input style={inp} value={form.title} onChange={e => set('title', e.target.value)} placeholder="e.g. BOZ 2031 Manifesto" />
        </div>
        <div style={{ gridColumn: '1 / -1' }}>
          <label style={lbl}>DESCRIPTION</label>
          <textarea style={{ ...inp, minHeight: '60px', resize: 'vertical' }} value={form.description}
            onChange={e => set('description', e.target.value)} placeholder="Brief description..." />
        </div>
        <div>
          <label style={lbl}>CATEGORY *</label>
          <select style={inp} value={form.category} onChange={e => set('category', e.target.value)}>
            {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>
        <div>
          <label style={lbl}>VERSION / EDITION</label>
          <input style={inp} value={form.version} onChange={e => set('version', e.target.value)} placeholder="e.g. 2026 Edition" />
        </div>
        <div>
          <label style={lbl}>PAGE COUNT</label>
          <input type="number" min="1" style={inp} value={form.pages} onChange={e => set('pages', e.target.value)} placeholder="e.g. 48" />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingTop: '18px' }}>
          <input type="checkbox" id="featured" checked={form.featured} onChange={e => set('featured', e.target.checked)}
            style={{ accentColor: '#dc2626', width: '16px', height: '16px' }} />
          <label htmlFor="featured" style={{ ...lbl, marginBottom: 0, cursor: 'pointer', color: '#9ca3af' }}>
            ★ FEATURE ON DOCUMENTS PAGE
          </label>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
        <button onClick={handleSave} disabled={uploading}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 22px', background: '#dc2626', color: '#fff', border: 'none', fontFamily: 'Oswald, sans-serif', fontSize: '13px', letterSpacing: '0.1em', cursor: uploading ? 'default' : 'pointer', opacity: uploading ? 0.7 : 1 }}>
          {uploading ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
          {uploading ? 'SAVING...' : editTarget ? 'SAVE CHANGES' : 'UPLOAD DOCUMENT'}
        </button>
        <button onClick={onCancel}
          style={{ padding: '10px 18px', background: 'transparent', color: '#6b7280', border: '1px solid #2a2a2a', fontFamily: 'Oswald, sans-serif', fontSize: '13px', cursor: 'pointer' }}>
          CANCEL
        </button>
      </div>
    </div>
  );
}

export function DocumentLibraryAdmin() {
  const [documents, setDocuments] = useState<DocumentMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [editTarget, setEditTarget] = useState<DocumentMeta | null>(null);
  const [ok, setOk] = useState('');
  const [err, setErr] = useState('');
  const [stats, setStats] = useState<{ total: number; totalDownloads: number } | null>(null);

  const flash = (msg: string) => { setOk(msg); setTimeout(() => setOk(''), 3500); };
  const flashErr = (msg: string) => { setErr(msg); setTimeout(() => setErr(''), 5000); };

  const load = async () => {
    try {
      const res = await documentsApi.list();
      setDocuments(res.documents);
    } catch { /* ignore */ } finally { setLoading(false); }
    try {
      const s = await documentsApi.stats();
      setStats(s.stats);
    } catch { /* ignore */ }
  };

  useEffect(() => { load(); }, []);

  const handleDone = async () => {
    setShowUpload(false); setEditTarget(null);
    await load();
    flash(editTarget ? 'Document updated.' : 'Document uploaded successfully.');
  };

  const handleDelete = async (doc: DocumentMeta) => {
    if (!confirm(`Delete "${doc.title}"? This cannot be undone.`)) return;
    try {
      await documentsApi.delete(doc.id);
      await load();
      flash('Document deleted.');
    } catch (e) {
      flashErr(e instanceof Error ? e.message : 'Failed to delete.');
    }
  };

  return (
    <div style={{ color: '#fff', fontFamily: 'Open Sans, sans-serif' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <FileText size={18} color="#dc2626" />
          <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: '18px', letterSpacing: '0.12em' }}>DOCUMENT LIBRARY</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {stats && (
            <div style={{ fontSize: '12px', color: '#4b5563', display: 'flex', gap: '16px' }}>
              <span><span style={{ color: '#e5e7eb' }}>{stats.total}</span> files</span>
              <span><span style={{ color: '#e5e7eb' }}>{stats.totalDownloads}</span> downloads</span>
            </div>
          )}
          <button onClick={() => { setShowUpload(true); setEditTarget(null); }}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 18px', background: '#dc2626', color: '#fff', border: 'none', fontFamily: 'Oswald, sans-serif', fontSize: '13px', letterSpacing: '0.08em', cursor: 'pointer' }}>
            <Plus size={14} /> UPLOAD FILE
          </button>
        </div>
      </div>

      {/* Alerts */}
      {ok && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#052e16', border: '1px solid #14532d', padding: '10px 14px', marginBottom: '16px', color: '#86efac', fontSize: '13px' }}>
          <Check size={14} /> {ok}
        </div>
      )}
      {err && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#450a0a', border: '1px solid #7f1d1d', padding: '10px 14px', marginBottom: '16px', color: '#fca5a5', fontSize: '13px' }}>
          <AlertCircle size={14} /> {err}
        </div>
      )}

      {/* Upload panel */}
      {(showUpload && !editTarget) && (
        <UploadPanel onDone={handleDone} onCancel={() => setShowUpload(false)} />
      )}
      {editTarget && (
        <UploadPanel editTarget={editTarget} onDone={handleDone} onCancel={() => setEditTarget(null)} />
      )}

      {/* Document list */}
      {loading ? (
        <div style={{ padding: '48px', textAlign: 'center', color: '#4b5563', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.1em' }}>
          LOADING...
        </div>
      ) : documents.length === 0 ? (
        <div style={{ padding: '48px', textAlign: 'center', color: '#4b5563' }}>
          <FileText size={40} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.3 }} />
          <div style={{ fontFamily: 'Oswald, sans-serif', letterSpacing: '0.1em' }}>NO DOCUMENTS YET</div>
          <div style={{ fontSize: '13px', marginTop: '6px' }}>Upload your first PDF or Excel file using the button above.</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: '#1f1f1f', border: '1px solid #1f1f1f' }}>
          {documents.map(doc => (
            <div key={doc.id} style={{ background: '#0d0d0d', padding: '16px 20px', display: 'grid', gridTemplateColumns: '1fr auto', gap: '16px', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', minWidth: 0 }}>
                <div style={{ marginTop: '2px', flexShrink: 0 }}>
                  <FormatIcon format={doc.format} size={22} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: '15px', color: '#e5e7eb', letterSpacing: '0.04em' }}>{doc.title}</span>
                    {doc.featured && <Star size={12} color="#f59e0b" fill="#f59e0b" />}
                    <span style={{ fontSize: '10px', padding: '1px 7px', background: '#1f1f1f', color: '#6b7280', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.06em' }}>
                      {doc.format.toUpperCase()}
                    </span>
                    {!doc.hasContent && doc.externalUrl && (
                      <span style={{ fontSize: '10px', padding: '1px 7px', background: '#1d4ed820', color: '#60a5fa', fontFamily: 'Oswald, sans-serif' }}>
                        EXTERNAL
                      </span>
                    )}
                  </div>
                  {doc.description && (
                    <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '500px' }}>
                      {doc.description}
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: '12px', marginTop: '6px', flexWrap: 'wrap' }}>
                    {[
                      doc.version,
                      doc.pages ? `${doc.pages} pages` : null,
                      formatBytes(doc.sizeBytes),
                      `${doc.downloadCount} downloads`,
                      CATEGORIES.find(c => c.value === doc.category)?.label,
                    ].filter(Boolean).map(chip => (
                      <span key={chip} style={{ fontSize: '11px', color: '#4b5563' }}>{chip}</span>
                    ))}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                {/* View / Preview */}
                {doc.hasContent ? (
                  <a href={documentsApi.viewUrl(doc.id)} target="_blank" rel="noopener noreferrer"
                    title="View file"
                    style={{ padding: '6px 8px', background: 'transparent', color: '#6b7280', border: '1px solid #2a2a2a', cursor: 'pointer', display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
                    <Eye size={13} />
                  </a>
                ) : doc.externalUrl ? (
                  <a href={doc.externalUrl} target="_blank" rel="noopener noreferrer"
                    title="Open external link"
                    style={{ padding: '6px 8px', background: 'transparent', color: '#6b7280', border: '1px solid #2a2a2a', cursor: 'pointer', display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
                    <ExternalLink size={13} />
                  </a>
                ) : null}
                {/* Download */}
                {doc.hasContent && (
                  <a href={documentsApi.downloadUrl(doc.id)} download
                    title="Download file"
                    style={{ padding: '6px 8px', background: 'transparent', color: '#6b7280', border: '1px solid #2a2a2a', cursor: 'pointer', display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
                    <Download size={13} />
                  </a>
                )}
                {/* Edit */}
                <button title="Edit metadata" onClick={() => { setEditTarget(doc); setShowUpload(false); }}
                  style={{ padding: '6px 8px', background: 'transparent', color: '#6b7280', border: '1px solid #2a2a2a', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                  <Edit3 size={13} />
                </button>
                {/* Delete */}
                <button title="Delete" onClick={() => handleDelete(doc)}
                  style={{ padding: '6px 8px', background: 'transparent', color: '#6b7280', border: '1px solid #2a2a2a', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export { DocumentLibraryAdmin as default };
