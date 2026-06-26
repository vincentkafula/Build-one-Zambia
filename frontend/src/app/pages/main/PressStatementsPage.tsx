import { useState, useEffect } from 'react';
import { FileText, Download, Search, Filter, Calendar, ChevronDown, ExternalLink, Newspaper } from 'lucide-react';
import { pressApi, PressStatement, PressType } from '../../lib/api';
import { MainNavigation } from '../../components/MainNavigation';
import { MainFooter } from '../../components/MainFooter';

const O    = '#d97706';
const NAVY = '#1e2d4a';

const TYPE_CFG: Record<PressType, { label: string; color: string; bg: string }> = {
  'press-release':   { label: 'Press Release',   color: '#1d4ed8', bg: '#eff6ff' },
  'letter':          { label: 'Letter',           color: '#7c3aed', bg: '#f5f3ff' },
  'media-statement': { label: 'Media Statement',  color: '#0369a1', bg: '#e0f2fe' },
  'communique':      { label: 'Communiqué',       color: '#047857', bg: '#ecfdf5' },
};

const TYPE_OPTIONS: { value: PressType | 'all'; label: string }[] = [
  { value: 'all',            label: 'All Types' },
  { value: 'press-release',  label: 'Press Releases' },
  { value: 'letter',         label: 'Letters' },
  { value: 'media-statement',label: 'Media Statements' },
  { value: 'communique',     label: 'Communiqués' },
];

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-ZM', { day: 'numeric', month: 'long', year: 'numeric' });
}

function downloadDataUrl(dataUrl: string, fileName: string) {
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

function StatementCard({ doc }: { doc: PressStatement }) {
  const [downloading, setDownloading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const cfg = TYPE_CFG[doc.type] || TYPE_CFG['press-release'];

  async function handleDownload() {
    setDownloading(true);
    try {
      const res = await pressApi.download(doc.id);
      downloadDataUrl(res.dataUrl, res.fileName);
    } catch {
      alert('Download failed. Please try again.');
    } finally {
      setDownloading(false);
    }
  }

  async function handlePreview() {
    if (previewUrl) { setPreviewUrl(null); return; }
    setDownloading(true);
    try {
      const res = await pressApi.download(doc.id);
      setPreviewUrl(res.dataUrl);
    } catch {
      alert('Could not load preview.');
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {/* Header stripe */}
      <div className="h-1" style={{ background: `linear-gradient(90deg, ${O}, ${NAVY})` }} />

      <div className="p-6">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex-1 min-w-0">
            {/* Type badge */}
            <span className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full font-semibold mb-2" style={{ color: cfg.color, background: cfg.bg }}>
              <FileText size={10} /> {cfg.label}
            </span>
            <h3 className="text-base font-bold leading-snug mb-1" style={{ color: NAVY }}>{doc.title}</h3>
            {doc.author && (
              <p className="text-xs text-gray-400 mb-1">By {doc.author}</p>
            )}
          </div>
          <div className="shrink-0 text-right">
            <div className="flex items-center gap-1 text-xs text-gray-400 mb-1">
              <Calendar size={11} />
              {formatDate(doc.date)}
            </div>
            <p className="text-xs text-gray-300">{formatBytes(doc.sizeBytes)}</p>
          </div>
        </div>

        {doc.summary && (
          <p className="text-sm text-gray-600 leading-relaxed mb-4 line-clamp-3">{doc.summary}</p>
        )}

        {/* Tags */}
        {doc.tags && doc.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {doc.tags.map(tag => (
              <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">{tag}</span>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-white text-sm font-semibold transition-opacity disabled:opacity-60"
            style={{ background: O }}
          >
            <Download size={14} />
            {downloading ? 'Loading…' : 'Download PDF'}
          </button>
          <button
            onClick={handlePreview}
            disabled={downloading}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-60"
          >
            <ExternalLink size={14} />
            {previewUrl ? 'Close Preview' : 'Preview'}
          </button>
        </div>

        {/* Inline PDF preview */}
        {previewUrl && (
          <div className="mt-4 rounded-xl overflow-hidden border border-gray-200" style={{ height: 500 }}>
            <iframe
              src={previewUrl}
              className="w-full h-full"
              title={doc.title}
            />
          </div>
        )}

        {/* Download count */}
        {doc.downloadCount > 0 && (
          <p className="text-xs text-gray-300 mt-3">{doc.downloadCount} download{doc.downloadCount !== 1 ? 's' : ''}</p>
        )}
      </div>
    </div>
  );
}

export function PressStatementsPage() {
  const [statements, setStatements] = useState<PressStatement[]>([]);
  const [years, setYears] = useState<number[]>([]);
  const [selectedYear, setSelectedYear] = useState<number | 'all'>('all');
  const [selectedType, setSelectedType] = useState<PressType | 'all'>('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    pressApi.years()
      .then(res => {
        const ys = res.years;
        if (!ys.includes(currentYear)) ys.unshift(currentYear);
        setYears(ys);
      })
      .catch(() => setYears([currentYear]));
  }, []);

  useEffect(() => {
    setLoading(true);
    pressApi.list({
      type: selectedType === 'all' ? undefined : selectedType,
      year: selectedYear === 'all' ? undefined : selectedYear,
    })
      .then(res => setStatements(res.statements))
      .catch(() => setStatements([]))
      .finally(() => setLoading(false));
  }, [selectedType, selectedYear]);

  const filtered = statements.filter(s => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return s.title.toLowerCase().includes(q) || s.summary?.toLowerCase().includes(q) || s.author?.toLowerCase().includes(q);
  });

  return (
    <div style={{ backgroundColor: '#f8f7f4', minHeight: '100vh' }}>
      <MainNavigation />

      {/* Hero */}
      <div style={{ background: `linear-gradient(135deg, ${NAVY} 0%, #2d3f5e 60%, #1a2035 100%)` }} className="pt-24 pb-16 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-5 text-sm font-semibold" style={{ background: 'rgba(217,119,6,0.15)', border: '1px solid rgba(217,119,6,0.3)', color: O }}>
            <Newspaper size={14} /> Official Communications
          </div>
          <h1 style={{ fontFamily: 'Oswald, sans-serif', fontSize: 'clamp(2rem,5vw,3.5rem)', letterSpacing: '0.04em', color: '#fff' }}>
            PRESS STATEMENTS
          </h1>
          <p className="mt-3 text-lg max-w-2xl mx-auto" style={{ color: 'rgba(255,255,255,0.7)' }}>
            Official press releases, open letters, and media statements from Build One Zambia
          </p>
        </div>
      </div>

      {/* Filter bar */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-3 flex flex-wrap gap-3 items-center">
          {/* Year */}
          <div className="relative">
            <select
              value={selectedYear}
              onChange={e => setSelectedYear(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
              className="appearance-none pl-3 pr-8 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none"
              style={{ paddingRight: '2rem' }}
            >
              <option value="all">All Years</option>
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>

          {/* Type */}
          <div className="relative">
            <select
              value={selectedType}
              onChange={e => setSelectedType(e.target.value as PressType | 'all')}
              className="appearance-none pl-3 pr-8 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none"
            >
              {TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>

          {/* Search */}
          <div className="relative flex-1 min-w-48">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search statements…"
              className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none"
            />
          </div>

          {/* Count */}
          <span className="text-xs text-gray-400 ml-auto hidden sm:block">
            {filtered.length} result{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Type pill filter */}
        <div className="max-w-5xl mx-auto px-4 pb-3 flex gap-2 flex-wrap">
          {TYPE_OPTIONS.map(o => (
            <button
              key={o.value}
              onClick={() => setSelectedType(o.value as PressType | 'all')}
              className="text-xs px-3 py-1.5 rounded-full font-medium transition-colors border"
              style={{
                background: selectedType === o.value ? NAVY : '#fff',
                color: selectedType === o.value ? '#fff' : '#6b7280',
                borderColor: selectedType === o.value ? NAVY : '#d1d5db',
              }}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 py-10">
        {loading ? (
          <div className="text-center py-20">
            <div className="w-10 h-10 border-4 border-gray-200 border-t-amber-500 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-400 text-sm">Loading statements…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-200">
            <FileText className="w-14 h-14 mx-auto mb-4 text-gray-200" />
            <p className="text-gray-400 font-medium mb-2">No statements found</p>
            <p className="text-sm text-gray-300">
              {search ? `No results for "${search}"` : 'No press statements have been published yet for the selected filters.'}
            </p>
            {(selectedType !== 'all' || selectedYear !== 'all' || search) && (
              <button
                onClick={() => { setSelectedType('all'); setSelectedYear('all'); setSearch(''); }}
                className="mt-4 text-sm underline text-gray-400"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filtered.map(doc => <StatementCard key={doc.id} doc={doc} />)}
          </div>
        )}
      </div>

      <MainFooter />
    </div>
  );
}
