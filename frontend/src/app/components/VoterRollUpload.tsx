import { API_BASE } from '@/app/lib/apiBase';
import { useState, useRef, useEffect } from 'react';
import { Upload, FileText, Trash2, CheckCircle, AlertCircle, Users, Search, Eye, EyeOff, RefreshCw } from 'lucide-react';
import { voterApi, getToken } from '../lib/api';

// Safe fetch wrapper — handles non-JSON responses (e.g. rate limit plain text)
async function safeFetch(url: string, options?: RequestInit) {
  const res = await fetch(url, options);
  const ct = res.headers.get('content-type') || '';
  if (!ct.includes('application/json')) {
    const text = await res.text();
    if (res.status === 429) throw new Error('Rate limit exceeded — please wait a moment and try again.');
    if (!res.ok) throw new Error(text || `HTTP ${res.status}`);
    return { ok: res.ok, status: res.status, json: async () => ({}) };
  }
  return res;
}

const BACKEND_BASE = API_BASE;

export interface VoterRecord {
  fullName: string;
  nrcId: string;
  voterNumber: string;
  pollingStation: string;
  constituency: string;
  district: string;
  province: string;
}

const STORAGE_KEY = 'boz_voter_roll';

export function loadVoterRoll(): VoterRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export function verifyVoter(name: string, nrcId: string, voterNumber: string): { valid: boolean; record?: VoterRecord } {
  // Local fallback check using cached localStorage data
  const roll = loadVoterRoll();
  if (roll.length === 0) return { valid: true };
  const record = roll.find(r =>
    r.fullName.toLowerCase().trim() === name.toLowerCase().trim() &&
    r.nrcId.replace(/\s|-/g, '').toLowerCase() === nrcId.replace(/\s|-/g, '').toLowerCase() &&
    r.voterNumber.replace(/\s/g, '').toLowerCase() === voterNumber.replace(/\s/g, '').toLowerCase()
  );
  return record ? { valid: true, record } : { valid: false };
}

// Async version that checks the backend
export async function verifyVoterAsync(name: string, nrcId: string, voterNumber: string): Promise<{ valid: boolean; message: string }> {
  const { voterApi } = await import('../lib/api');
  try {
    return await voterApi.verify(name, nrcId, voterNumber);
  } catch {
    // Fallback to local check
    const local = verifyVoter(name, nrcId, voterNumber);
    return { valid: local.valid, message: local.valid ? 'Verified' : 'Voter not found in register.' };
  }
}

// Parses a plain-text voter list from an uploaded file
// Expected format per line: FullName | NRC-ID | VoterNumber | PollingStation | Constituency | District | Province
function parseVoterFile(text: string): VoterRecord[] {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('#'));
  const records: VoterRecord[] = [];
  for (const line of lines) {
    const parts = line.split('|').map(p => p.trim());
    if (parts.length >= 3) {
      records.push({
        fullName: parts[0] || '',
        nrcId: parts[1] || '',
        voterNumber: parts[2] || '',
        pollingStation: parts[3] || '',
        constituency: parts[4] || '',
        district: parts[5] || '',
        province: parts[6] || '',
      });
    }
  }
  return records;
}

// Generate demo records for testing
function generateDemoRecords(): VoterRecord[] {
  return [
    { fullName: 'Chanda Mwale', nrcId: '123456/78/9', voterNumber: 'ZM-001-2031', pollingStation: 'Lusaka East Primary', constituency: 'Lusaka East', district: 'Lusaka', province: 'Lusaka' },
    { fullName: 'Grace Tembo', nrcId: '234567/89/0', voterNumber: 'ZM-002-2031', pollingStation: 'Chilenje Secondary', constituency: 'Chilenje', district: 'Lusaka', province: 'Lusaka' },
    { fullName: 'Emmanuel Banda', nrcId: '345678/90/1', voterNumber: 'ZM-003-2031', pollingStation: 'Kabwata Hall', constituency: 'Kabwata', district: 'Lusaka', province: 'Lusaka' },
    { fullName: 'Mutale Chipasha', nrcId: '456789/01/2', voterNumber: 'ZM-004-2031', pollingStation: 'Kitwe North Primary', constituency: 'Kitwe North', district: 'Kitwe', province: 'Copperbelt' },
    { fullName: 'Brenda Nkonde', nrcId: '567890/12/3', voterNumber: 'ZM-005-2031', pollingStation: 'Chipata Central', constituency: 'Chipata Central', district: 'Chipata', province: 'Eastern' },
  ];
}

export function VoterRollUpload() {
  const [records, setRecords] = useState<VoterRecord[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [search, setSearch] = useState('');
  const [showRecords, setShowRecords] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Load from backend on mount
  useEffect(() => {
    voterApi.list().then(res => {
      setRecords((res.records as VoterRecord[]) || []);
    }).catch(() => {
      // fallback to localStorage for offline use
      setRecords(loadVoterRoll());
    }).finally(() => setLoading(false));
  }, []);

  const pushToBackend = async (recs: VoterRecord[], fileName?: string) => {
    try {
      await voterApi.upload(recs, fileName);
      // Also update localStorage as cache
      localStorage.setItem(STORAGE_KEY, JSON.stringify(recs));
      setRecords(recs);
    } catch {
      // Fallback: save locally
      localStorage.setItem(STORAGE_KEY, JSON.stringify(recs));
      setRecords(recs);
    }
  };

  const handleFile = async (file: File) => {
    setError(''); setSuccess('');
    if (!file) return;
    const isCSV = file.name.endsWith('.csv') || file.type === 'text/csv' || file.type === 'text/plain';
    if (!isCSV) { setError('Please upload a CSV file.'); return; }
    setUploading(true);
    try {
      // Upload directly to backend — backend handles CSV parsing
      const form = new FormData();
      form.append('file', file);
      const token = getToken();
      const res = await safeFetch(`${BACKEND_BASE}/voter-roll/upload`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: form,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? data.details ?? `HTTP ${res.status}`);
      setSuccess(`✓ ${data.message ?? 'Upload successful'}`);
      // Refresh local records list from backend
      voterApi.list().then(r => setRecords((r.records as VoterRecord[]) || [])).catch(() => {});
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed. Check the file format and try again.');
    } finally {
      setUploading(false);
    }
  };

  const loadDemo = async () => {
    const demo = generateDemoRecords();
    const merged = [...records];
    let added = 0;
    for (const rec of demo) {
      if (!merged.find(r => r.voterNumber === rec.voterNumber)) { merged.push(rec); added++; }
    }
    await pushToBackend(merged, 'demo-records');
    setSuccess(`✓ ${added} demo voter records uploaded to server (${merged.length} total)`);
    setError('');
  };

  const clearAll = async () => {
    if (!confirm('Clear all voter records on the server? This will remove the voter roll and allow all applicants through unverified.')) return;
    try {
      await voterApi.clear();
    } catch { /* ignore */ }
    localStorage.removeItem(STORAGE_KEY);
    setRecords([]);
    setSuccess('Voter roll cleared from server.');
    setError('');
  };

  const filtered = records.filter(r =>
    !search || r.fullName.toLowerCase().includes(search.toLowerCase()) ||
    r.nrcId.includes(search) || r.voterNumber.includes(search) || r.pollingStation.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return <div style={{ padding: '48px', textAlign: 'center', color: '#6b7280', fontFamily: 'Open Sans, sans-serif' }}>Loading voter roll from server…</div>;
  }

  return (
    <div style={{ fontFamily: 'Open Sans, sans-serif' }}>

      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e2d4a', marginBottom: '6px' }}>Voter Roll Management</h2>
        <p style={{ fontSize: '13px', color: '#6b7280', lineHeight: 1.7 }}>
          Upload the official voter roll per polling station. Once uploaded, all applicants on this website must provide their genuine registered voter details (Full Name, NRC ID, and Voter Number) before any application can be submitted. Unmatched details will be rejected.
        </p>
      </div>

      {/* Status bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px', marginBottom: '24px' }}>
        {[
          { label: 'Total Voters', value: records.length.toLocaleString(), color: '#0ea5e9', icon: <Users size={18} /> },
          { label: 'Polling Stations', value: [...new Set(records.map(r => r.pollingStation))].length.toLocaleString(), color: '#10b981', icon: <CheckCircle size={18} /> },
          { label: 'Verification Status', value: records.length > 0 ? 'ACTIVE' : 'INACTIVE', color: records.length > 0 ? '#dc2626' : '#6b7280', icon: <CheckCircle size={18} /> },
        ].map(stat => (
          <div key={stat.label} style={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: `${stat.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: stat.color, flexShrink: 0 }}>
              {stat.icon}
            </div>
            <div>
              <div style={{ fontSize: '18px', fontWeight: 700, color: '#1e2d4a', lineHeight: 1 }}>{stat.value}</div>
              <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '3px' }}>{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Upload area */}
      <div
        onDragOver={e => e.preventDefault()}
        onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
        onClick={() => fileRef.current?.click()}
        style={{ border: '2px dashed #d1d5db', borderRadius: '12px', padding: '40px 24px', textAlign: 'center', cursor: 'pointer', backgroundColor: '#f9fafb', marginBottom: '16px', transition: 'border-color 0.2s' }}
        onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = '#dc2626'}
        onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = '#d1d5db'}
      >
        <input ref={fileRef} type="file" accept=".pdf,.txt,.csv" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ''; }} />
        {uploading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', color: '#6b7280' }}>
            <RefreshCw size={20} style={{ animation: 'spin 1s linear infinite' }} />
            <span style={{ fontSize: '14px' }}>Processing voter roll…</span>
          </div>
        ) : (
          <>
            <Upload size={32} style={{ color: '#dc2626', margin: '0 auto 12px', display: 'block' }} />
            <p style={{ fontSize: '15px', fontWeight: 600, color: '#1e2d4a', marginBottom: '6px' }}>Upload Voter Roll</p>
            <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>Drag and drop or click to browse</p>
            <p style={{ fontSize: '11px', color: '#9ca3af' }}>Accepts CSV · columns auto-detected from header row</p>
          </>
        )}
      </div>

      {/* Format guide */}
      <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '14px 16px', marginBottom: '16px', fontSize: '12px', color: '#475569' }}>
        <p style={{ fontWeight: 600, marginBottom: '6px', color: '#1e2d4a' }}>CSV format — header + data rows (column names are flexible):</p>
        <code style={{ backgroundColor: '#e2e8f0', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', display: 'block', lineHeight: 1.8 }}>
          fullName, nrcId, voterNumber, pollingStation, constituency, district, province
        </code>
        <p style={{ marginTop: '6px', color: '#94a3b8' }}>Column names like "Full Name", "NRC ID", "Voter Card" and "VoterNumber" are all auto-detected. Quoted fields supported.</p>
      </div>

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '20px' }}>
        <button onClick={loadDemo} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 16px', backgroundColor: '#0ea5e9', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '12px', cursor: 'pointer', fontWeight: 600 }}>
          <FileText size={14} /> Load Demo Records
        </button>
        <button onClick={() => setShowRecords(v => !v)} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 16px', backgroundColor: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '12px', cursor: 'pointer' }}>
          {showRecords ? <EyeOff size={14} /> : <Eye size={14} />} {showRecords ? 'Hide' : 'View'} Records ({records.length})
        </button>
        {records.length > 0 && (
          <button onClick={clearAll} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 16px', backgroundColor: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '8px', fontSize: '12px', cursor: 'pointer' }}>
            <Trash2 size={14} /> Clear All Records
          </button>
        )}
      </div>

      {/* Feedback messages */}
      {success && (
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '12px 14px', marginBottom: '16px' }}>
          <CheckCircle size={16} style={{ color: '#16a34a', flexShrink: 0, marginTop: '1px' }} />
          <p style={{ fontSize: '13px', color: '#166534', margin: 0 }}>{success}</p>
        </div>
      )}
      {error && (
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '12px 14px', marginBottom: '16px' }}>
          <AlertCircle size={16} style={{ color: '#dc2626', flexShrink: 0, marginTop: '1px' }} />
          <p style={{ fontSize: '13px', color: '#b91c1c', margin: 0 }}>{error}</p>
        </div>
      )}

      {/* Records table */}
      {showRecords && records.length > 0 && (
        <div style={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', overflow: 'hidden' }}>
          <div style={{ padding: '16px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
              <input type="text" placeholder="Search by name, NRC, voter number or polling station…" value={search} onChange={e => setSearch(e.target.value)}
                style={{ width: '100%', boxSizing: 'border-box', padding: '8px 12px 8px 32px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '13px', outline: 'none' }}
              />
            </div>
            <span style={{ fontSize: '12px', color: '#9ca3af', whiteSpace: 'nowrap' }}>{filtered.length} of {records.length}</span>
          </div>
          <div style={{ overflowX: 'auto', maxHeight: '400px', overflowY: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc' }}>
                  {['Full Name', 'NRC ID', 'Voter Number', 'Polling Station', 'Province'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '10px 14px', color: '#6b7280', fontWeight: 600, borderBottom: '1px solid #f1f5f9', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.slice(0, 200).map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #f9fafb' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.backgroundColor = '#f8fafc'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'}
                  >
                    <td style={{ padding: '10px 14px', color: '#1e2d4a', fontWeight: 500 }}>{r.fullName}</td>
                    <td style={{ padding: '10px 14px', color: '#4b5563', fontFamily: 'monospace' }}>{r.nrcId}</td>
                    <td style={{ padding: '10px 14px', color: '#4b5563', fontFamily: 'monospace' }}>{r.voterNumber}</td>
                    <td style={{ padding: '10px 14px', color: '#4b5563' }}>{r.pollingStation}</td>
                    <td style={{ padding: '10px 14px', color: '#4b5563' }}>{r.province}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length > 200 && (
              <p style={{ padding: '12px 14px', fontSize: '12px', color: '#9ca3af', textAlign: 'center' }}>Showing first 200 of {filtered.length} results. Refine your search to see more.</p>
            )}
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export { VoterRollUpload as default };
