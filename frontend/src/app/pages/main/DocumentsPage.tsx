import { useState, useEffect } from 'react';
import { FileText, Download, Search, BookOpen, Scale, FileCheck, Shield, ChevronRight,
  Eye, FileSpreadsheet, X, Loader2, ExternalLink, AlertCircle } from 'lucide-react';
import { documentsApi, DocumentMeta } from '../../lib/api';

// ─── Fallback static documents (shown when backend has nothing) ───────────────
const STATIC_DOCS = [
  {
    id: 'constitution',
    category: 'founding' as const,
    icon: Scale,
    title: 'Build One Zambia Constitution',
    description: 'The supreme governing document of the party. Sets out the structure, objectives, membership rules, and operational procedures of Build One Zambia.',
    version: 'Edition 2026',
    pages: 48,
    sizeBytes: 2.4 * 1024 * 1024,
    format: 'pdf' as const,
    mimeType: 'application/pdf',
    originalName: 'boz-constitution.pdf',
    hasContent: false,
    externalUrl: undefined as string | undefined,
    featured: true,
    downloadCount: 0,
    uploadedBy: '', uploadedAt: '', updatedAt: '',
  },
  {
    id: 'manifesto',
    category: 'manifesto' as const,
    icon: BookOpen,
    title: 'Build One Zambia 2031 Manifesto',
    description: 'Our comprehensive policy blueprint for the 2031 General Election — 120 pages of costed, evidence-based commitments across agriculture, health, education, economy, and infrastructure.',
    version: '2031 Edition',
    pages: 120,
    sizeBytes: 5.8 * 1024 * 1024,
    format: 'pdf' as const,
    mimeType: 'application/pdf',
    originalName: 'boz-manifesto-2031.pdf',
    hasContent: false,
    externalUrl: undefined as string | undefined,
    featured: true,
    downloadCount: 0,
    uploadedBy: '', uploadedAt: '', updatedAt: '',
  },
  {
    id: 'policy',
    category: 'policy' as const,
    icon: FileCheck,
    title: 'Policy Documents',
    description: 'Detailed sector-specific policy papers covering economic development, mining, agriculture, health, education, women empowerment, and youth development.',
    version: 'Series 2026',
    pages: 210,
    sizeBytes: 8.1 * 1024 * 1024,
    format: 'pdf' as const,
    mimeType: 'application/pdf',
    originalName: 'boz-policy-documents.pdf',
    hasContent: false,
    externalUrl: undefined as string | undefined,
    featured: false,
    downloadCount: 0,
    uploadedBy: '', uploadedAt: '', updatedAt: '',
  },
  {
    id: 'rules',
    category: 'governance' as const,
    icon: Shield,
    title: 'Party Rules and Regulations',
    description: 'The internal rules, codes of conduct, disciplinary procedures, and electoral guidelines that govern all members, officials, and structures of Build One Zambia.',
    version: 'Revised 2026',
    pages: 36,
    sizeBytes: 1.9 * 1024 * 1024,
    format: 'pdf' as const,
    mimeType: 'application/pdf',
    originalName: 'boz-rules-regulations.pdf',
    hasContent: false,
    externalUrl: undefined as string | undefined,
    featured: false,
    downloadCount: 0,
    uploadedBy: '', uploadedAt: '', updatedAt: '',
  },
];

const CATEGORY_LABELS: Record<string, string> = {
  founding: 'Founding Document', manifesto: 'Manifesto', policy: 'Policy Framework',
  governance: 'Governance', report: 'Report', budget: 'Budget',
  election: 'Election', press: 'Press Release', other: 'Other',
};

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function DocIcon({ format, size = 24 }: { format: string; size?: number }) {
  if (format === 'pdf') return <FileText style={{ width: size, height: size, color: '#dc2626' }} />;
  if (['xlsx', 'xls', 'csv'].includes(format)) return <FileSpreadsheet style={{ width: size, height: size, color: '#16a34a' }} />;
  return <FileText style={{ width: size, height: size, color: '#6b7280' }} />;
}

function PDFViewerModal({ doc, onClose }: { doc: DocumentMeta; onClose: () => void }) {
  const viewUrl = documentsApi.viewUrl(doc.id);
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)', zIndex: 9999, display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', background: '#0d0d0d', borderBottom: '1px solid #1f1f1f', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <DocIcon format={doc.format} size={18} />
          <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: '15px', letterSpacing: '0.06em', color: '#e5e7eb' }}>{doc.title}</span>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <a href={documentsApi.downloadUrl(doc.id)} download={doc.originalName}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: '#dc2626', color: '#fff', textDecoration: 'none', fontFamily: 'Oswald, sans-serif', fontSize: '12px', letterSpacing: '0.08em' }}>
            <Download style={{ width: 13, height: 13 }} /> DOWNLOAD
          </a>
          <button onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
            <X size={22} />
          </button>
        </div>
      </div>
      <iframe
        src={viewUrl}
        title={doc.title}
        style={{ flex: 1, border: 'none', width: '100%', background: '#fff' }}
      />
    </div>
  );
}

type AnyDoc = DocumentMeta | typeof STATIC_DOCS[0];

export function DocumentsPage() {
  const [search, setSearch] = useState('');
  const [documents, setDocuments] = useState<AnyDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [backendOk, setBackendOk] = useState(false);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [viewing, setViewing] = useState<DocumentMeta | null>(null);

  useEffect(() => {
    documentsApi.list()
      .then(res => {
        if (res.documents.length > 0) {
          setDocuments(res.documents);
          setBackendOk(true);
        } else {
          setDocuments(STATIC_DOCS);
        }
      })
      .catch(() => setDocuments(STATIC_DOCS))
      .finally(() => setLoading(false));
  }, []);

  const filtered = documents.filter(d =>
    d.title.toLowerCase().includes(search.toLowerCase()) ||
    (d.description?.toLowerCase() || '').includes(search.toLowerCase()) ||
    (CATEGORY_LABELS[d.category] || d.category).toLowerCase().includes(search.toLowerCase())
  );

  const handleDownload = (doc: AnyDoc) => {
    setDownloading(doc.id);
    if (backendOk && doc.hasContent) {
      // Trigger real download from backend
      const a = document.createElement('a');
      a.href = documentsApi.downloadUrl(doc.id);
      a.download = (doc as DocumentMeta).originalName || doc.title;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else if ((doc as AnyDoc).externalUrl) {
      window.open((doc as AnyDoc).externalUrl, '_blank');
    } else {
      // No real file — show friendly message
      alert('This document is not yet available for download. Please check back soon or contact the BOZ secretariat.');
    }
    setTimeout(() => setDownloading(null), 1500);
  };

  const handleView = (doc: AnyDoc) => {
    if (backendOk && doc.hasContent) {
      setViewing(doc as DocumentMeta);
    } else if ((doc as AnyDoc).externalUrl) {
      window.open((doc as AnyDoc).externalUrl, '_blank');
    } else {
      alert('Online preview is not yet available for this document.');
    }
  };

  const totalPages = documents.reduce((s, d) => s + (d.pages || 0), 0);

  const STATS = [
    { value: String(documents.length), label: 'Documents' },
    { value: String(totalPages || '414'), label: 'Total Pages' },
    { value: 'Free', label: 'Public Access' },
    { value: 'PDF & XLSX', label: 'Formats' },
  ];

  return (
    <div style={{ backgroundColor: '#080808', fontFamily: 'Open Sans, sans-serif', color: '#fff', minHeight: '100vh' }}>

      {/* PDF Viewer Modal */}
      {viewing && <PDFViewerModal doc={viewing} onClose={() => setViewing(null)} />}

      {/* Hero */}
      <section style={{ position: 'relative', padding: '100px 16px 72px', overflow: 'hidden', background: 'linear-gradient(135deg, #007A30 0%, #006B28 40%, #1a0000 100%)' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 50% 40%, rgba(220,38,38,0.12) 0%, transparent 60%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', maxWidth: '760px', margin: '0 auto', textAlign: 'center' }}>
          <p style={{ fontSize: '11px', letterSpacing: '0.22em', color: '#dc2626', fontFamily: 'Oswald, sans-serif', fontWeight: 600, marginBottom: '14px' }}>OFFICIAL DOCUMENTS</p>
          <h1 style={{ fontFamily: 'Oswald, sans-serif', fontSize: 'clamp(2.4rem, 6vw, 4rem)', lineHeight: 1.08, letterSpacing: '0.03em', marginBottom: '20px' }}>
            PARTY <span style={{ color: '#dc2626' }}>DOCUMENTS</span>
          </h1>
          <p style={{ color: '#9ca3af', fontSize: '1.05rem', lineHeight: 1.85, maxWidth: '560px', margin: '0 auto 40px' }}>
            Access, read, and download official Build One Zambia documents — freely available to all Zambians in the spirit of transparency and openness.
          </p>
          <div style={{ position: 'relative', maxWidth: '480px', margin: '0 auto' }}>
            <Search style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: '#4b5563' }} />
            <input
              type="text"
              placeholder="Search documents…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ width: '100%', boxSizing: 'border-box', padding: '14px 16px 14px 44px', backgroundColor: '#111', border: '1px solid #2a2a2a', color: '#fff', fontSize: '14px', outline: 'none', fontFamily: 'Open Sans, sans-serif' }}
            />
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <div style={{ backgroundColor: '#0d0d0d', borderTop: '1px solid #005020', borderBottom: '1px solid #005020' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)' }}>
          {STATS.map((s, i) => (
            <div key={s.label} style={{ padding: '24px 16px', textAlign: 'center', borderRight: i < 3 ? '1px solid #1a1a1a' : 'none' }}>
              <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: '1.6rem', color: '#dc2626', letterSpacing: '0.04em' }}>{s.value}</div>
              <div style={{ fontSize: '11px', color: '#6b7280', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.08em', marginTop: '4px' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Document list */}
      <section style={{ padding: '72px 16px 96px' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {loading && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', padding: '64px', color: '#4b5563' }}>
              <Loader2 style={{ width: '20px', height: '20px', animation: 'spin 1s linear infinite' }} />
              <span style={{ fontFamily: 'Oswald, sans-serif', letterSpacing: '0.08em' }}>LOADING DOCUMENTS...</span>
            </div>
          )}

          {!loading && filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '64px 16px', color: '#4b5563' }}>
              <FileText style={{ width: '48px', height: '48px', margin: '0 auto 16px', display: 'block' }} />
              <p style={{ fontFamily: 'Oswald, sans-serif', letterSpacing: '0.06em' }}>No documents match your search.</p>
            </div>
          )}

          {!loading && filtered.map(doc => {
            const isDownloading = downloading === doc.id;
            const hasFile = doc.hasContent;
            const hasExternal = !!(doc as AnyDoc).externalUrl;
            const canDownload = hasFile || hasExternal;

            // Pick a static icon for static docs, generic for backend docs
            const StaticIcon = (doc as typeof STATIC_DOCS[0]).icon;
            return (
              <div
                key={doc.id}
                style={{ backgroundColor: '#0d0d0d', border: '1px solid #1f1f1f', display: 'grid', gridTemplateColumns: '1fr auto', gap: '24px', padding: '32px', alignItems: 'center', transition: 'border-color 0.2s' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = '#dc2626'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = '#1f1f1f'}
              >
                {/* Left */}
                <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
                  <div style={{ width: '56px', height: '56px', backgroundColor: 'rgba(220,38,38,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, borderTop: '3px solid #dc2626' }}>
                    {StaticIcon ? <StaticIcon style={{ width: '24px', height: '24px', color: '#dc2626' }} /> : <DocIcon format={doc.format} size={24} />}
                  </div>
                  <div>
                    <span style={{ fontSize: '10px', letterSpacing: '0.18em', color: '#dc2626', fontFamily: 'Oswald, sans-serif', display: 'block', marginBottom: '6px' }}>
                      {CATEGORY_LABELS[doc.category] || doc.category}
                    </span>
                    <h3 style={{ fontFamily: 'Oswald, sans-serif', fontSize: '1.15rem', letterSpacing: '0.04em', color: '#fff', margin: '0 0 10px', lineHeight: 1.25 }}>
                      {doc.title}
                    </h3>
                    <p style={{ fontSize: '13px', lineHeight: 1.75, color: '#6b7280', margin: '0 0 16px', maxWidth: '580px' }}>
                      {doc.description}
                    </p>
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                      {[
                        (doc as DocumentMeta).version,
                        doc.pages ? `${doc.pages} pages` : null,
                        doc.sizeBytes ? formatBytes(doc.sizeBytes) : null,
                        doc.format?.toUpperCase(),
                        hasFile ? '✓ Available' : hasExternal ? '↗ External' : '— Coming soon',
                      ].filter(Boolean).map(chip => (
                        <span key={chip} style={{ fontSize: '11px', padding: '3px 10px', backgroundColor: '#1a1a1a', color: chip === '✓ Available' ? '#16a34a' : chip === '— Coming soon' ? '#4b5563' : '#9ca3af', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.06em' }}>
                          {chip}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right — actions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flexShrink: 0 }}>
                  <button
                    onClick={() => handleDownload(doc)}
                    disabled={isDownloading}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '8px',
                      backgroundColor: isDownloading ? '#b91c1c' : '#dc2626',
                      color: '#fff', border: 'none', cursor: isDownloading ? 'default' : 'pointer',
                      padding: '12px 20px', fontFamily: 'Oswald, sans-serif',
                      fontSize: '12px', letterSpacing: '0.1em', whiteSpace: 'nowrap',
                      transition: 'background-color 0.2s',
                    }}
                  >
                    {isDownloading
                      ? <Loader2 style={{ width: '14px', height: '14px', animation: 'spin 1s linear infinite' }} />
                      : <Download style={{ width: '14px', height: '14px' }} />}
                    {isDownloading ? 'DOWNLOADING…' : `DOWNLOAD ${doc.format?.toUpperCase() || 'FILE'}`}
                  </button>
                  <button
                    onClick={() => handleView(doc)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '8px',
                      border: '1px solid #2a2a2a', color: '#9ca3af', background: 'transparent',
                      padding: '12px 20px', fontFamily: 'Oswald, sans-serif',
                      fontSize: '12px', letterSpacing: '0.1em', whiteSpace: 'nowrap',
                      cursor: 'pointer', justifyContent: 'center',
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#dc2626'; (e.currentTarget as HTMLElement).style.color = '#fff'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#2a2a2a'; (e.currentTarget as HTMLElement).style.color = '#9ca3af'; }}
                  >
                    {hasExternal && !hasFile
                      ? <><ExternalLink style={{ width: '13px', height: '13px' }} /> OPEN LINK</>
                      : <><Eye style={{ width: '13px', height: '13px' }} /> VIEW ONLINE</>
                    }
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Notice */}
      <section style={{ padding: '48px 16px', backgroundColor: '#007A30', borderTop: '1px solid #005020' }}>
        <div style={{ maxWidth: '760px', margin: '0 auto', display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
          <ChevronRight style={{ width: '20px', height: '20px', color: '#dc2626', flexShrink: 0, marginTop: '2px' }} />
          <p style={{ fontSize: '13px', lineHeight: 1.85, color: '#6b7280', margin: 0 }}>
            All documents are published in good faith and freely accessible to the public. To request a printed copy or additional information, contact the Build One Zambia national secretariat at{' '}
            <a href="mailto:info@bozplans.org" style={{ color: '#dc2626', textDecoration: 'none' }}>info@bozplans.org</a>.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '72px 16px', backgroundColor: '#dc2626', textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'Oswald, sans-serif', fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', letterSpacing: '0.03em', color: '#fff', marginBottom: '12px' }}>
          Know Your Party. Know Your Rights.
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '15px', margin: '0 auto', maxWidth: '500px' }}>
          An informed citizen is the strongest foundation of democracy. Read, share, and hold us accountable.
        </p>
      </section>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default DocumentsPage;
