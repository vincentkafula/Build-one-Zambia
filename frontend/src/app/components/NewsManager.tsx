import { useState, useEffect, useRef, CSSProperties } from 'react';
import {
  Newspaper, Plus, Edit2, Trash2, Eye, EyeOff, Star, StarOff,
  RefreshCw, Search, X, AlertCircle, Upload, Camera, CheckCircle,
  Clock, Archive, BarChart2, FileText, TrendingUp, Globe, Tag,
  ChevronDown, ChevronUp, Bold, Italic, Link, List, ImagePlus,
} from 'lucide-react';
import { newsApi, Post, PostListItem, PostCategory, PostStatus, NewsStats } from '../lib/api';

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORIES: PostCategory[] = ['NEWS', 'ANNOUNCEMENT', 'PRESS_RELEASE', 'CAMPAIGN_UPDATE', 'MEDIA'];

const CAT_COLORS: Record<PostCategory, string> = {
  NEWS: '#3b82f6',
  ANNOUNCEMENT: '#f59e0b',
  PRESS_RELEASE: '#8b5cf6',
  CAMPAIGN_UPDATE: '#dc2626',
  MEDIA: '#10b981',
};

const CAT_LABELS: Record<PostCategory, string> = {
  NEWS: 'News',
  ANNOUNCEMENT: 'Announcement',
  PRESS_RELEASE: 'Press Release',
  CAMPAIGN_UPDATE: 'Campaign Update',
  MEDIA: 'Media',
};

const STATUS_CFG: Record<PostStatus, { label: string; color: string; icon: React.ReactNode }> = {
  published: { label: 'Published', color: '#10b981', icon: <Globe size={11} /> },
  draft:     { label: 'Draft',     color: '#f59e0b', icon: <Clock size={11} /> },
  archived:  { label: 'Archived',  color: '#6b7280', icon: <Archive size={11} /> },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function Badge({ status }: { status: PostStatus }) {
  const c = STATUS_CFG[status] || STATUS_CFG.draft;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '2px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: 600, backgroundColor: `${c.color}20`, color: c.color }}>
      {c.icon} {c.label}
    </span>
  );
}

function CatBadge({ cat }: { cat: PostCategory }) {
  const color = CAT_COLORS[cat] || '#6b7280';
  return (
    <span style={{ display: 'inline-block', padding: '1px 7px', borderRadius: '8px', fontSize: '10px', fontWeight: 700, backgroundColor: `${color}18`, color, letterSpacing: '0.04em' }}>
      {CAT_LABELS[cat] || cat}
    </span>
  );
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

// ─── Rich Text Toolbar (simple HTML insertion) ────────────────────────────────

function RichToolbar({ textareaRef }: { textareaRef: React.RefObject<HTMLTextAreaElement | null> }) {
  const wrap = (before: string, after: string) => {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end   = el.selectionEnd;
    const selected = el.value.slice(start, end);
    const replacement = `${before}${selected || 'text'}${after}`;
    el.setRangeText(replacement, start, end, 'end');
    el.focus();
    el.dispatchEvent(new Event('input', { bubbles: true }));
  };

  const tools = [
    { title: 'Bold',       icon: <Bold size={13} />,    fn: () => wrap('<strong>', '</strong>') },
    { title: 'Italic',     icon: <Italic size={13} />,  fn: () => wrap('<em>', '</em>') },
    { title: 'Link',       icon: <Link size={13} />,    fn: () => wrap('<a href="URL">', '</a>') },
    { title: 'H2',         icon: <span style={{ fontSize: '12px', fontWeight: 700 }}>H2</span>, fn: () => wrap('<h2>', '</h2>') },
    { title: 'H3',         icon: <span style={{ fontSize: '12px', fontWeight: 700 }}>H3</span>, fn: () => wrap('<h3>', '</h3>') },
    { title: 'Paragraph',  icon: <FileText size={13} />, fn: () => wrap('<p>', '</p>') },
    { title: 'List',       icon: <List size={13} />,    fn: () => wrap('<ul>\n  <li>', '</li>\n</ul>') },
  ];

  return (
    <div style={{ display: 'flex', gap: '2px', padding: '6px 8px', backgroundColor: '#f3f4f6', border: '1px solid #d1d5db', borderBottom: 'none', borderRadius: '6px 6px 0 0', flexWrap: 'wrap' }}>
      {tools.map(t => (
        <button key={t.title} onClick={t.fn} title={t.title} type="button"
          style={{ padding: '4px 7px', border: '1px solid #d1d5db', borderRadius: '4px', background: '#fff', cursor: 'pointer', color: '#374151', display: 'flex', alignItems: 'center' }}>
          {t.icon}
        </button>
      ))}
    </div>
  );
}

// ─── Post Form (create / edit) ────────────────────────────────────────────────

function PostForm({ post, onSave, onCancel }: {
  post?: Post;
  onSave: () => void;
  onCancel: () => void;
}) {
  const [title,    setTitle]    = useState(post?.title    || '');
  const [category, setCategory] = useState<PostCategory>(post?.category || 'NEWS');
  const [status,   setStatus]   = useState<PostStatus>(post?.status   || 'draft');
  const [summary,  setSummary]  = useState(post?.summary  || '');
  const [body,     setBody]     = useState(post?.body     || '');
  const [author,   setAuthor]   = useState(post?.author   || 'BOZ Admin');
  const [tags,     setTags]     = useState((post?.tags || []).join(', '));
  const [featured, setFeatured] = useState(post?.featured ?? false);
  const [coverUrl, setCoverUrl] = useState(post?.coverImageUrl || '');

  const [imageDataUrl, setImageDataUrl] = useState<string | undefined>();
  const [imagePreview, setImagePreview] = useState<string | undefined>(
    post?.hasCustomImage ? newsApi.postImageUrl(post.id) : post?.coverImageUrl || undefined
  );

  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState('');
  const [tab, setTab] = useState<'content' | 'settings'>('content');

  const fileRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLTextAreaElement>(null);

  const handleFile = (file: File) => {
    if (file.size > 8 * 1024 * 1024) { setError('Image must be under 8MB'); return; }
    setError('');
    const reader = new FileReader();
    reader.onload = e => {
      const url = e.target?.result as string;
      setImageDataUrl(url);
      setImagePreview(url);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!title.trim()) { setError('Title is required'); return; }
    setSaving(true);
    setError('');
    try {
      const data = {
        title: title.trim(),
        category,
        status,
        summary: summary.trim(),
        body: body.trim(),
        author: author.trim(),
        coverImageUrl: coverUrl.trim() || undefined,
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
        featured,
        imageDataUrl,
      };
      if (post) {
        await newsApi.updatePost(post.id, data);
      } else {
        await newsApi.createPost(data);
      }
      onSave();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const inp: CSSProperties = {
    width: '100%', boxSizing: 'border-box', padding: '9px 12px',
    border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px',
    outline: 'none', color: '#111827', backgroundColor: '#fff',
  };

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.55)', zIndex: 200, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '20px', overflowY: 'auto' }}>
      <div style={{ background: '#fff', borderRadius: '12px', width: '100%', maxWidth: '780px', marginTop: '20px', marginBottom: '40px' }}>
        {/* Header */}
        <div style={{ padding: '22px 28px', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Newspaper size={20} color="#1d4ed8" />
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#111827' }}>
              {post ? 'Edit Post' : 'New Post'}
            </h3>
          </div>
          <button onClick={onCancel} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}><X size={20} /></button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb', padding: '0 28px' }}>
          {(['content', 'settings'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              style={{ padding: '12px 16px', border: 'none', background: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 600, color: tab === t ? '#1d4ed8' : '#6b7280', borderBottom: tab === t ? '2px solid #1d4ed8' : '2px solid transparent', textTransform: 'capitalize' }}>
              {t}
            </button>
          ))}
        </div>

        <div style={{ padding: '28px' }}>
          {tab === 'content' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '4px' }}>Title *</label>
                <input style={{ ...inp, fontSize: '16px', fontWeight: 600 }} value={title} onChange={e => setTitle(e.target.value)} placeholder="Post headline…" />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '4px' }}>Summary / Excerpt</label>
                <textarea style={{ ...inp, minHeight: '70px', resize: 'vertical' }} value={summary} onChange={e => setSummary(e.target.value)} placeholder="Short description shown in listings…" />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '4px' }}>Body (HTML supported)</label>
                <RichToolbar textareaRef={bodyRef} />
                <textarea
                  ref={bodyRef}
                  style={{ ...inp, minHeight: '280px', resize: 'vertical', borderRadius: '0 0 6px 6px', fontFamily: 'monospace', fontSize: '13px' }}
                  value={body}
                  onChange={e => setBody(e.target.value)}
                  placeholder="<p>Full article content here…</p>"
                />
              </div>
            </div>
          )}

          {tab === 'settings' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '4px' }}>Category</label>
                <select style={{ ...inp, appearance: 'none' }} value={category} onChange={e => setCategory(e.target.value as PostCategory)}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{CAT_LABELS[c]}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '4px' }}>Status</label>
                <select style={{ ...inp, appearance: 'none' }} value={status} onChange={e => setStatus(e.target.value as PostStatus)}>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '4px' }}>Author</label>
                <input style={inp} value={author} onChange={e => setAuthor(e.target.value)} placeholder="e.g. BOZ Team" />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '4px' }}>Tags (comma-separated)</label>
                <input style={inp} value={tags} onChange={e => setTags(e.target.value)} placeholder="zambia, election, 2026" />
              </div>
              <div style={{ gridColumn: '1/-1' }}>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '4px' }}>External Cover Image URL (optional)</label>
                <input style={inp} value={coverUrl} onChange={e => setCoverUrl(e.target.value)} placeholder="https://example.com/image.jpg" />
                <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#9ca3af' }}>Leave blank if uploading a file below.</p>
              </div>
              <div style={{ gridColumn: '1/-1' }}>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '6px' }}>Upload Cover Image</label>
                <div
                  onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f?.type.startsWith('image/')) handleFile(f); }}
                  onDragOver={e => e.preventDefault()}
                  onClick={() => fileRef.current?.click()}
                  style={{ border: '2px dashed #d1d5db', borderRadius: '8px', padding: '16px', textAlign: 'center', cursor: 'pointer', backgroundColor: '#f9fafb', minHeight: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  {imagePreview ? (
                    <img src={imagePreview} alt="preview" style={{ maxHeight: '110px', maxWidth: '100%', objectFit: 'contain', borderRadius: '6px' }} />
                  ) : (
                    <div style={{ color: '#9ca3af' }}>
                      <ImagePlus size={28} style={{ display: 'block', margin: '0 auto 8px' }} />
                      <p style={{ margin: 0, fontSize: '13px' }}>Drag & drop or click — JPG, PNG, WebP up to 8MB</p>
                    </div>
                  )}
                  <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
                </div>
                {imagePreview && (
                  <button onClick={() => { setImagePreview(undefined); setImageDataUrl(undefined); }} style={{ marginTop: '6px', fontSize: '12px', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}>
                    Remove image
                  </button>
                )}
              </div>
              <div style={{ gridColumn: '1/-1' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', color: '#374151', userSelect: 'none' }}>
                  <input type="checkbox" checked={featured} onChange={e => setFeatured(e.target.checked)} />
                  Feature this post (shown prominently on site)
                </label>
              </div>
            </div>
          )}

          {error && (
            <div style={{ marginTop: '14px', padding: '10px 14px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px', fontSize: '13px', color: '#dc2626', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircle size={14} /> {error}
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <button onClick={handleSave} disabled={saving}
              style={{ flex: 1, padding: '11px', backgroundColor: saving ? '#93c5fd' : '#1d4ed8', color: '#fff', border: 'none', borderRadius: '7px', fontWeight: 600, fontSize: '14px', cursor: saving ? 'not-allowed' : 'pointer' }}>
              {saving ? 'Saving…' : post ? 'Update Post' : 'Create Post'}
            </button>
            <button onClick={onCancel}
              style={{ padding: '11px 20px', backgroundColor: '#f3f4f6', color: '#374151', border: '1px solid #d1d5db', borderRadius: '7px', fontWeight: 600, fontSize: '14px', cursor: 'pointer' }}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Quick Image Modal ────────────────────────────────────────────────────────

function QuickImageModal({ post, onDone, onCancel }: {
  post: PostListItem;
  onDone: () => void;
  onCancel: () => void;
}) {
  const [preview, setPreview] = useState<string | undefined>(
    post.hasCustomImage ? newsApi.postImageUrl(post.id) : post.coverImageUrl || undefined
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
    if (!dataUrl) { setError('Please select an image'); return; }
    setSaving(true);
    try {
      await newsApi.uploadImage(post.id, dataUrl);
      onDone();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ background: '#fff', borderRadius: '12px', padding: '28px', width: '100%', maxWidth: '420px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#111827', display: 'flex', alignItems: 'center', gap: '8px' }}><Camera size={17} /> Change Cover</h3>
            <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#6b7280' }}>{post.title}</p>
          </div>
          <button onClick={onCancel} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}><X size={18} /></button>
        </div>
        <div
          onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f?.type.startsWith('image/')) handleFile(f); }}
          onDragOver={e => e.preventDefault()}
          onClick={() => fileRef.current?.click()}
          style={{ border: '2px dashed #d1d5db', borderRadius: '10px', padding: '16px', textAlign: 'center', cursor: 'pointer', backgroundColor: '#f9fafb', minHeight: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          {preview ? (
            <img src={preview} alt="preview" style={{ maxHeight: '140px', maxWidth: '100%', objectFit: 'contain', borderRadius: '6px' }} />
          ) : (
            <div style={{ color: '#9ca3af' }}>
              <ImagePlus size={32} style={{ display: 'block', margin: '0 auto 8px' }} />
              <p style={{ margin: 0, fontSize: '13px' }}>Drag & drop or click to upload</p>
            </div>
          )}
          <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
        </div>
        {error && <p style={{ margin: '8px 0 0', fontSize: '12px', color: '#dc2626' }}>{error}</p>}
        <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
          <button onClick={handleSave} disabled={saving || !dataUrl}
            style={{ flex: 1, padding: '10px', backgroundColor: saving || !dataUrl ? '#93c5fd' : '#1d4ed8', color: '#fff', border: 'none', borderRadius: '7px', fontWeight: 600, fontSize: '14px', cursor: saving || !dataUrl ? 'not-allowed' : 'pointer' }}>
            {saving ? 'Uploading…' : 'Save Image'}
          </button>
          <button onClick={onCancel} style={{ padding: '10px 16px', backgroundColor: '#f3f4f6', color: '#374151', border: '1px solid #d1d5db', borderRadius: '7px', fontWeight: 600, fontSize: '14px', cursor: 'pointer' }}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

// ─── Post Row ─────────────────────────────────────────────────────────────────

function PostRow({ post, onEdit, onChangeImage, onAction, actionLoading }: {
  post: PostListItem;
  onEdit: () => void;
  onChangeImage: () => void;
  onAction: (action: 'publish' | 'unpublish' | 'archive' | 'delete') => void;
  actionLoading: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const imgSrc = post.hasCustomImage ? newsApi.postImageUrl(post.id) : post.coverImageUrl || undefined;
  const pub = new Date(post.publishedAt || post.createdAt).toLocaleDateString('en-ZM', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div style={{ border: '1px solid #e5e7eb', borderRadius: '10px', backgroundColor: '#fff', overflow: 'hidden', marginBottom: '8px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', padding: '14px 16px' }}>
        {/* Cover thumbnail */}
        <div style={{ width: '72px', height: '56px', borderRadius: '6px', overflow: 'hidden', backgroundColor: '#f3f4f6', flexShrink: 0, cursor: 'pointer', position: 'relative' }} onClick={onChangeImage} title="Change cover image">
          {imgSrc ? (
            <img src={imgSrc} alt="cover" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d1d5db' }}>
              <ImagePlus size={20} />
            </div>
          )}
          <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.15s' }}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
            <CatBadge cat={post.category} />
            <Badge status={post.status} />
            {post.featured && <span style={{ fontSize: '10px', color: '#f59e0b', fontWeight: 700 }}>★ FEATURED</span>}
          </div>
          <p style={{ margin: '0 0 3px', fontSize: '14px', fontWeight: 700, color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{post.title}</p>
          <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>
            {post.author} · {pub} · {post.viewCount} views
            {post.tags.length > 0 && <span> · {post.tags.slice(0, 3).join(', ')}</span>}
          </p>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
          <button onClick={onChangeImage} title="Change cover" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', padding: '6px' }}><Camera size={15} /></button>
          <button onClick={onEdit} title="Edit" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', padding: '6px' }}><Edit2 size={15} /></button>
          {post.status === 'draft'     && <button onClick={() => onAction('publish')}   disabled={actionLoading} title="Publish"   style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#10b981', padding: '6px' }}><Globe size={15} /></button>}
          {post.status === 'published' && <button onClick={() => onAction('unpublish')} disabled={actionLoading} title="Unpublish" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#f59e0b', padding: '6px' }}><EyeOff size={15} /></button>}
          {post.status !== 'archived'  && <button onClick={() => onAction('archive')}   disabled={actionLoading} title="Archive"  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: '6px' }}><Archive size={15} /></button>}
          <button onClick={() => setExpanded(v => !v)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: '6px' }}>
            {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </button>
        </div>
      </div>

      {expanded && (
        <div style={{ borderTop: '1px solid #f3f4f6', padding: '12px 16px', backgroundColor: '#fafafa' }}>
          <p style={{ margin: '0 0 8px', fontSize: '13px', color: '#374151' }}>{post.summary || <em style={{ color: '#9ca3af' }}>No summary</em>}</p>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '11px', color: '#6b7280' }}>Slug: <code style={{ backgroundColor: '#e5e7eb', padding: '1px 5px', borderRadius: '4px' }}>{post.slug}</code></span>
            <span style={{ fontSize: '11px', color: '#6b7280' }}>Created: {new Date(post.createdAt).toLocaleString()}</span>
            {post.publishedAt && <span style={{ fontSize: '11px', color: '#6b7280' }}>Published: {new Date(post.publishedAt).toLocaleString()}</span>}
          </div>
          <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
            <button onClick={() => onAction('delete')} disabled={actionLoading}
              style={{ padding: '6px 12px', backgroundColor: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Trash2 size={12} /> Hard Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function NewsManager() {
  const [posts, setPosts] = useState<PostListItem[]>([]);
  const [stats, setStats] = useState<NewsStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'overview' | 'posts'>('posts');
  const [statusFilter, setStatusFilter] = useState<PostStatus | 'all'>('all');
  const [catFilter, setCatFilter] = useState<PostCategory | 'ALL'>('ALL');
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<Post | undefined>();
  const [creating, setCreating] = useState(false);
  const [changingImageFor, setChangingImageFor] = useState<PostListItem | undefined>();
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [msg, setMsg] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const [postsRes, statsRes] = await Promise.all([
        newsApi.listPosts({ status: 'all', limit: 100 }),
        newsApi.getStats(),
      ]);
      setPosts(postsRes.posts);
      setStats(statsRes);
    } catch { /* ignore */ }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = posts.filter(p => {
    if (statusFilter !== 'all' && p.status !== statusFilter) return false;
    if (catFilter !== 'ALL' && p.category !== catFilter) return false;
    if (search && !p.title.toLowerCase().includes(search.toLowerCase()) && !p.summary.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleEdit = async (p: PostListItem) => {
    try {
      const res = await newsApi.getPost(p.id);
      setEditing(res.post);
    } catch {
      setMsg('Failed to load post');
    }
  };

  const handleAction = async (post: PostListItem, action: 'publish' | 'unpublish' | 'archive' | 'delete') => {
    if (action === 'delete' && !confirm(`Permanently delete "${post.title}"? This cannot be undone.`)) return;
    setActionLoadingId(post.id);
    try {
      if (action === 'publish')   await newsApi.publish(post.id);
      if (action === 'unpublish') await newsApi.unpublish(post.id);
      if (action === 'archive')   await newsApi.archivePost(post.id);
      if (action === 'delete')    await newsApi.hardDeletePost(post.id);
      setMsg(action === 'delete' ? 'Post deleted' : `Post ${action}ed`);
      load();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'Action failed');
    } finally {
      setActionLoadingId(null);
    }
  };

  const tabStyle = (active: boolean): CSSProperties => ({
    padding: '10px 18px', border: 'none', background: 'none', cursor: 'pointer',
    fontSize: '13px', fontWeight: 600, color: active ? '#1d4ed8' : '#6b7280',
    borderBottom: active ? '2px solid #1d4ed8' : '2px solid transparent',
  });

  return (
    <div style={{ padding: '0', fontFamily: 'Inter, sans-serif' }}>
      {/* Modals */}
      {(creating || editing) && (
        <PostForm
          post={editing}
          onSave={() => { setCreating(false); setEditing(undefined); setMsg('Post saved!'); load(); }}
          onCancel={() => { setCreating(false); setEditing(undefined); }}
        />
      )}
      {changingImageFor && (
        <QuickImageModal
          post={changingImageFor}
          onDone={() => { setChangingImageFor(undefined); setMsg('Cover image updated!'); load(); }}
          onCancel={() => setChangingImageFor(undefined)}
        />
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Newspaper size={20} color="#1d4ed8" />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: '#111827' }}>News Manager</h2>
            <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>Manage news articles, announcements, and campaign updates</p>
          </div>
        </div>
        <button onClick={() => setCreating(true)}
          style={{ padding: '10px 18px', backgroundColor: '#1d4ed8', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '7px' }}>
          <Plus size={15} /> New Post
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb', marginBottom: '20px' }}>
        <button style={tabStyle(tab === 'overview')} onClick={() => setTab('overview')}>Overview</button>
        <button style={tabStyle(tab === 'posts')} onClick={() => setTab('posts')}>
          All Posts {stats ? `(${stats.total})` : ''}
        </button>
      </div>

      {/* Success message */}
      {msg && (
        <div style={{ padding: '10px 14px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '7px', fontSize: '13px', color: '#15803d', marginBottom: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><CheckCircle size={14} /> {msg}</span>
          <button onClick={() => setMsg('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#15803d' }}><X size={14} /></button>
        </div>
      )}

      {/* Overview Tab */}
      {tab === 'overview' && stats && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '12px', marginBottom: '24px' }}>
            <StatCard icon={<FileText size={18} />}    label="Total Posts"  value={stats.total}     color="#1d4ed8" />
            <StatCard icon={<Globe size={18} />}       label="Published"    value={stats.published} color="#10b981" />
            <StatCard icon={<Clock size={18} />}       label="Drafts"       value={stats.drafts}    color="#f59e0b" />
            <StatCard icon={<Archive size={18} />}     label="Archived"     value={stats.archived}  color="#6b7280" />
            <StatCard icon={<Star size={18} />}        label="Featured"     value={stats.featured}  color="#f59e0b" />
          </div>

          <h3 style={{ margin: '0 0 12px', fontSize: '14px', fontWeight: 700, color: '#374151' }}>By Category</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '8px' }}>
            {CATEGORIES.map(cat => (
              <div key={cat} style={{ padding: '12px 14px', border: '1px solid #e5e7eb', borderRadius: '8px', backgroundColor: '#fff', borderLeft: `4px solid ${CAT_COLORS[cat]}` }}>
                <p style={{ margin: '0 0 4px', fontSize: '11px', color: '#6b7280', fontWeight: 600 }}>{CAT_LABELS[cat]}</p>
                <p style={{ margin: 0, fontSize: '22px', fontWeight: 700, color: '#111827' }}>{stats.byCategory[cat] || 0}</p>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '24px', padding: '16px', backgroundColor: '#f8fafc', border: '1px solid #e5e7eb', borderRadius: '10px' }}>
            <h4 style={{ margin: '0 0 10px', fontSize: '13px', fontWeight: 700, color: '#374151' }}>Public API Endpoints</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {[
                ['GET', '/news/posts', 'List published posts'],
                ['GET', '/news/posts?status=all', 'List all posts (admin)'],
                ['GET', '/news/posts/:id', 'Get single post by id or slug'],
                ['GET', '/news/posts/:id/image', 'Serve stored cover image'],
              ].map(([method, path, desc]) => (
                <div key={path} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
                  <span style={{ padding: '2px 6px', borderRadius: '4px', backgroundColor: '#dbeafe', color: '#1d4ed8', fontWeight: 700, fontSize: '10px', minWidth: '34px', textAlign: 'center' }}>{method}</span>
                  <code style={{ color: '#374151' }}>{path}</code>
                  <span style={{ color: '#9ca3af' }}>— {desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Posts Tab */}
      {tab === 'posts' && (
        <div>
          {/* Filters */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '16px' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: '180px' }}>
              <Search size={13} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search posts…"
                style={{ width: '100%', boxSizing: 'border-box', padding: '8px 12px 8px 30px', border: '1px solid #d1d5db', borderRadius: '7px', fontSize: '13px', outline: 'none' }} />
            </div>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as PostStatus | 'all')}
              style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '7px', fontSize: '13px', outline: 'none' }}>
              <option value="all">All Statuses</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
            <select value={catFilter} onChange={e => setCatFilter(e.target.value as PostCategory | 'ALL')}
              style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '7px', fontSize: '13px', outline: 'none' }}>
              <option value="ALL">All Categories</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{CAT_LABELS[c]}</option>)}
            </select>
            <button onClick={load}
              style={{ padding: '8px 14px', border: '1px solid #d1d5db', borderRadius: '7px', fontSize: '13px', background: '#f9fafb', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <RefreshCw size={13} /> Refresh
            </button>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px', color: '#9ca3af' }}>
              <RefreshCw size={24} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.5 }} />
              Loading posts…
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px', color: '#9ca3af', border: '2px dashed #e5e7eb', borderRadius: '10px' }}>
              <Newspaper size={32} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.3 }} />
              <p style={{ margin: '0 0 12px', fontSize: '14px', fontWeight: 600 }}>No posts found</p>
              <button onClick={() => setCreating(true)}
                style={{ padding: '9px 18px', backgroundColor: '#1d4ed8', color: '#fff', border: 'none', borderRadius: '7px', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}>
                Create First Post
              </button>
            </div>
          ) : (
            <div>
              <p style={{ margin: '0 0 12px', fontSize: '12px', color: '#9ca3af' }}>Showing {filtered.length} of {posts.length} posts</p>
              {filtered.map(p => (
                <PostRow
                  key={p.id}
                  post={p}
                  onEdit={() => handleEdit(p)}
                  onChangeImage={() => setChangingImageFor(p)}
                  onAction={action => handleAction(p, action)}
                  actionLoading={actionLoadingId === p.id}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}


export { NewsManager as default };
