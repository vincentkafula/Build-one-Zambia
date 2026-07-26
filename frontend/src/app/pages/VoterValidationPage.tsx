import { useState, useEffect, useRef, useMemo } from 'react';
import * as XLSX from 'xlsx';
import {
  Upload, Search, CheckCircle2, XCircle, MapPin, Loader2, RefreshCw,
  FileSpreadsheet, Trash2, AlertTriangle, ShieldCheck, UserSearch,
  User, IdCard,
} from 'lucide-react';
import { voterRollApi, VoterRollSearchResult, VoterRollMatch } from '../lib/api';
import { provinces } from '../data/mockData';

function findField(row: Record<string, unknown>, aliases: string[]): string {
  const keys = Object.keys(row);
  for (const alias of aliases) {
    const found = keys.find(k => k.toLowerCase().replace(/[^a-z0-9]/g, '') === alias);
    if (found && row[found] !== undefined && row[found] !== null) return String(row[found]).trim();
  }
  return '';
}

const NRC_ALIASES = ['nrc', 'nrcnumber', 'nrcno', 'idnumber', 'nationalid', 'nationalregistrationcard', 'id'];
const NAME_ALIASES = ['name', 'fullname', 'votername', 'voter'];
const SURNAME_ALIASES = ['surname', 'lastname', 'familyname'];
const FIRSTNAME_ALIASES = ['firstname', 'givenname', 'forename'];
const GENDER_ALIASES = ['gender', 'sex'];
const VOTERID_ALIASES = ['voterid', 'voterno', 'votercard', 'cardno', 'votercardnumber', 'cardnumber', 'barcode'];
const DOB_ALIASES = ['dob', 'dateofbirth', 'birthdate'];
const ADDRESS_ALIASES = ['residentialaddress', 'address', 'residence'];
const ISSUEDATE_ALIASES = ['issuedate', 'dateissued', 'date'];
const EXPIRYDATE_ALIASES = ['expirydate', 'dateofexpiry', 'expiry', 'expires'];
const POLLINGDISTRICT_ALIASES = ['pollingdistrict', 'district'];

function CardField({ label, value, light }: { label: string; value?: string; light?: boolean }) {
  return (
    <div>
      <p style={{ fontSize: '9.5px', letterSpacing: '0.08em', fontFamily: 'Oswald, sans-serif', color: light ? 'rgba(255,255,255,0.75)' : 'rgba(255,255,255,0.4)', marginBottom: 2 }}>
        {label}
      </p>
      <p style={{ fontSize: '0.88rem', color: '#fff', fontWeight: light ? 700 : 400 }}>
        {value?.trim() ? value : '—'}
      </p>
    </div>
  );
}

// Replicates the front/back layout of the physical Zambian voter's card, plus
// the NRC number, which is on file but isn't printed on the card itself.
function VoterCardPanel({ voter, registeredHere }: { voter: VoterRollMatch; registeredHere: boolean }) {
  const [surname, firstName] = (() => {
    if (voter.surname || voter.firstName) return [voter.surname || '', voter.firstName || ''];
    const parts = voter.fullName.trim().split(/\s+/);
    return [parts[parts.length - 1] || '', parts.slice(0, -1).join(' ')];
  })();

  return (
    <div className="mt-3">
      {registeredHere ? (
        <div className="flex items-start gap-3 px-4 py-3 rounded-xl mb-3" style={{ backgroundColor: 'rgba(22,163,74,0.12)', border: '1px solid rgba(22,163,74,0.35)' }}>
          <CheckCircle2 size={18} style={{ color: '#16a34a', marginTop: 1, flexShrink: 0 }} />
          <p style={{ color: '#fff', fontSize: '0.85rem' }}>
            <strong style={{ color: '#16a34a', fontFamily: 'Oswald, sans-serif' }}>Registered at this polling station.</strong>{' '}
            Confirm the details below match the card and photo in hand before allowing this voter to vote.
          </p>
        </div>
      ) : (
        <div className="flex items-start gap-3 px-4 py-3 rounded-xl mb-3" style={{ backgroundColor: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.35)' }}>
          <MapPin size={18} style={{ color: '#f59e0b', marginTop: 1, flexShrink: 0 }} />
          <p style={{ color: '#fff', fontSize: '0.85rem' }}>
            <strong style={{ color: '#f59e0b', fontFamily: 'Oswald, sans-serif' }}>Registered at a different polling station.</strong>{' '}
            Please direct this voter to <strong>{voter.pollingStationName}</strong>
            {[voter.wardName, voter.constituencyName, voter.districtName, voter.provinceName].filter(Boolean).length > 0
              ? ` (${[voter.wardName, voter.constituencyName, voter.districtName, voter.provinceName].filter(Boolean).join(', ')})`
              : ''}.
          </p>
        </div>
      )}

      <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.14)' }}>
        {/* Front — matches the orange card face */}
        <div style={{ background: 'linear-gradient(135deg, #E8A24A 0%, #C97A22 55%, #9c5f1c 100%)', padding: '18px' }}>
          <div className="flex items-center gap-2 mb-4">
            <ShieldCheck size={15} color="#fff" />
            <span style={{ color: '#fff', fontFamily: 'Oswald, sans-serif', fontSize: '10px', letterSpacing: '0.12em' }}>
              REPUBLIC OF ZAMBIA · VOTER'S CARD
            </span>
          </div>
          <div className="flex gap-4 items-start mb-4">
            <div className="flex items-center justify-center flex-shrink-0" style={{ width: 60, height: 60, borderRadius: 8, background: 'rgba(255,255,255,0.22)' }}>
              <User size={28} color="#fff" />
            </div>
            <div className="flex-1 grid grid-cols-1 gap-2">
              <CardField label="SURNAME" value={surname} light />
              <CardField label="FIRST NAME" value={firstName} light />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <CardField label="VOTER CARD NO." value={voter.voterId} light />
            <CardField label="POLLING STATION" value={voter.pollingStationName} light />
          </div>
        </div>

        {/* Back — the rest of the card's fields, plus NRC on file */}
        <div style={{ background: '#0d1810', padding: '18px' }}>
          <div className="grid grid-cols-2 gap-x-4 gap-y-3">
            <CardField label="GENDER" value={voter.gender} />
            <CardField label="DATE OF BIRTH" value={voter.dob} />
            <div className="col-span-2">
              <CardField label="RESIDENTIAL ADDRESS" value={voter.residentialAddress} />
            </div>
            <CardField label="EXPIRY DATE" value={voter.expiryDate} />
            <CardField label="POLLING DISTRICT" value={voter.pollingDistrict} />
          </div>
          <div className="mt-3 pt-3 flex items-center gap-3" style={{ borderTop: '1px dashed rgba(255,255,255,0.15)' }}>
            <IdCard size={16} style={{ color: '#16a34a', flexShrink: 0 }} />
            <div>
              <p style={{ fontSize: '9.5px', letterSpacing: '0.08em', fontFamily: 'Oswald, sans-serif', color: 'rgba(255,255,255,0.4)', marginBottom: 2 }}>
                NRC NUMBER <span style={{ color: 'rgba(255,255,255,0.3)' }}>(on file — not printed on the card)</span>
              </p>
              <p style={{ fontSize: '0.95rem', color: '#fff', fontWeight: 700 }}>{voter.nrcDisplay || voter.nrc}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


export function VoterValidationPage() {
  const [provinceId, setProvinceId] = useState('');
  const [districtId, setDistrictId] = useState('');
  const [constituencyId, setConstituencyId] = useState('');
  const [wardId, setWardId] = useState('');
  const [pollingStationId, setPollingStationId] = useState('');

  const province = provinces.find(p => p.id === provinceId);
  const district = province?.districts.find(d => d.id === districtId);
  const constituency = district?.constituencies.find(c => c.id === constituencyId);
  const ward = constituency?.wards.find(w => w.id === wardId);
  const station = ward?.pollingStations.find(s => s.id === pollingStationId);

  const [status, setStatus] = useState<{ count: number; uploadedBy: string; uploadedAt: string } | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState('');
  const [uploadErr, setUploadErr] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [searchMode, setSearchMode] = useState<'card' | 'nrc' | 'name'>('card');
  const [cardQuery, setCardQuery] = useState('');
  const [nrcQuery, setNrcQuery] = useState('');
  const [nameQuery, setNameQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<VoterRollSearchResult | null>(null);
  const [searchErr, setSearchErr] = useState('');

  useMemo(() => station, [station]); // keep station referenced for linting

  async function loadStatus() {
    if (!pollingStationId) { setStatus(null); return; }
    setLoadingStatus(true);
    try {
      const res = await voterRollApi.status(pollingStationId);
      setStatus(res.status);
    } catch {
      setStatus(null);
    } finally {
      setLoadingStatus(false);
    }
  }

  useEffect(() => {
    loadStatus();
    setSearchResult(null);
    setUploadMsg('');
    setUploadErr('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pollingStationId]);

  async function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (!file || !pollingStationId || !station) return;

    setUploading(true);
    setUploadMsg('');
    setUploadErr('');
    try {
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { type: 'array' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { defval: '' });

      if (rows.length === 0) {
        setUploadErr('The file appears to be empty.');
        return;
      }

      let skipped = 0;
      const records = rows.map(row => {
        const nrc = findField(row, NRC_ALIASES);
        const fullName = findField(row, NAME_ALIASES);
        const surname = findField(row, SURNAME_ALIASES) || undefined;
        const firstName = findField(row, FIRSTNAME_ALIASES) || undefined;
        const gender = findField(row, GENDER_ALIASES) || undefined;
        const voterId = findField(row, VOTERID_ALIASES) || undefined;
        const dob = findField(row, DOB_ALIASES) || undefined;
        const residentialAddress = findField(row, ADDRESS_ALIASES) || undefined;
        const issueDate = findField(row, ISSUEDATE_ALIASES) || undefined;
        const expiryDate = findField(row, EXPIRYDATE_ALIASES) || undefined;
        const pollingDistrict = findField(row, POLLINGDISTRICT_ALIASES) || undefined;
        if (!nrc || !fullName) skipped++;
        return { nrc, fullName, surname, firstName, gender, voterId, dob, residentialAddress, issueDate, expiryDate, pollingDistrict };
      }).filter(r => r.nrc && r.fullName);

      if (records.length === 0) {
        setUploadErr('No valid rows found. Make sure the file has columns for NRC Number and Full Name (e.g. "NRC", "Name" or "Full Name").');
        return;
      }

      const res = await voterRollApi.upload({
        pollingStationId,
        pollingStationName: station.name,
        wardId, wardName: ward?.name,
        constituencyId, constituencyName: constituency?.name,
        districtId, districtName: district?.name,
        provinceId, provinceName: province?.name,
        records,
      });

      setStatus({ count: res.count, uploadedBy: res.uploadedBy, uploadedAt: res.uploadedAt });
      setUploadMsg(`Loaded ${res.count.toLocaleString()} voter record${res.count !== 1 ? 's' : ''} for ${station.name}.${skipped > 0 ? ` (${skipped} row${skipped !== 1 ? 's' : ''} skipped — missing NRC or name.)` : ''}`);
    } catch (err) {
      setUploadErr(err instanceof Error ? err.message : 'Failed to read or upload this file.');
    } finally {
      setUploading(false);
    }
  }

  async function handleClearRoll() {
    if (!pollingStationId) return;
    setUploading(true);
    try {
      await voterRollApi.remove(pollingStationId);
      setStatus(null);
      setUploadMsg('Voters roll cleared for this station.');
    } catch (err) {
      setUploadErr(err instanceof Error ? err.message : 'Failed to clear the roll.');
    } finally {
      setUploading(false);
    }
  }

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setSearchErr('');
    setSearchResult(null);
    if (!pollingStationId) { setSearchErr('Please select a polling station first.'); return; }
    if (searchMode === 'card' && !cardQuery.trim()) { setSearchErr("Please enter the voter's card number."); return; }
    if (searchMode === 'nrc' && !nrcQuery.trim()) { setSearchErr('Please enter an NRC number.'); return; }
    if (searchMode === 'name' && !nameQuery.trim()) { setSearchErr('Please enter a name.'); return; }

    setSearching(true);
    try {
      const res = await voterRollApi.search(
        searchMode === 'card' ? { voterId: cardQuery.trim(), pollingStationId }
          : searchMode === 'nrc' ? { nrc: nrcQuery.trim(), pollingStationId }
          : { name: nameQuery.trim(), pollingStationId }
      );
      setSearchResult(res);
    } catch (err) {
      setSearchErr(err instanceof Error ? err.message : 'Search failed. Please try again.');
    } finally {
      setSearching(false);
    }
  }

  const selectClass = "w-full px-3 py-2.5 rounded-lg text-sm disabled:opacity-40";
  const selectStyle = { backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', outline: 'none' } as const;

  return (
    <div className="space-y-5">
      {/* Location picker */}
      <div className="rounded-2xl p-6" style={{ backgroundColor: '#123322', border: '1px solid rgba(255,255,255,0.07)' }}>
        <h2 className="mb-1" style={{ color: '#fff', fontFamily: 'Oswald, sans-serif', fontSize: '1.05rem' }}>
          <MapPin className="inline w-5 h-5 mr-2" style={{ color: '#16a34a' }} />
          Select Your Polling Station
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.78rem', marginBottom: 16 }}>
          Choose the station you're deployed at to upload its voters roll or verify a voter.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs mb-1.5" style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.06em' }}>PROVINCE</label>
            <select className={selectClass} style={selectStyle} value={provinceId}
              onChange={e => { setProvinceId(e.target.value); setDistrictId(''); setConstituencyId(''); setWardId(''); setPollingStationId(''); }}>
              <option value="">Select Province</option>
              {provinces.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs mb-1.5" style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.06em' }}>DISTRICT</label>
            <select className={selectClass} style={selectStyle} disabled={!province} value={districtId}
              onChange={e => { setDistrictId(e.target.value); setConstituencyId(''); setWardId(''); setPollingStationId(''); }}>
              <option value="">Select District</option>
              {province?.districts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs mb-1.5" style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.06em' }}>CONSTITUENCY</label>
            <select className={selectClass} style={selectStyle} disabled={!district} value={constituencyId}
              onChange={e => { setConstituencyId(e.target.value); setWardId(''); setPollingStationId(''); }}>
              <option value="">Select Constituency</option>
              {district?.constituencies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs mb-1.5" style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.06em' }}>WARD</label>
            <select className={selectClass} style={selectStyle} disabled={!constituency} value={wardId}
              onChange={e => { setWardId(e.target.value); setPollingStationId(''); }}>
              <option value="">Select Ward</option>
              {constituency?.wards.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs mb-1.5" style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.06em' }}>POLLING STATION</label>
            <select className={selectClass} style={selectStyle} disabled={!ward} value={pollingStationId}
              onChange={e => setPollingStationId(e.target.value)}>
              <option value="">Select Polling Station</option>
              {ward?.pollingStations.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
        </div>
      </div>

      {!pollingStationId ? (
        <div className="rounded-2xl p-8 flex flex-col items-center gap-2 text-center" style={{ backgroundColor: '#123322', border: '1px solid rgba(255,255,255,0.07)' }}>
          <UserSearch size={28} style={{ color: 'rgba(255,255,255,0.3)' }} />
          <p style={{ color: '#fff', fontFamily: 'Oswald, sans-serif', fontSize: '0.95rem' }}>Select a polling station above to continue</p>
        </div>
      ) : (
        <>
          {/* Voters roll upload / status */}
          <div className="rounded-2xl p-6" style={{ backgroundColor: '#123322', border: '1px solid rgba(255,255,255,0.07)' }}>
            <div className="flex items-center justify-between gap-3 mb-1">
              <h2 style={{ color: '#fff', fontFamily: 'Oswald, sans-serif', fontSize: '1.05rem' }}>
                <FileSpreadsheet className="inline w-5 h-5 mr-2" style={{ color: '#16a34a' }} />
                Voters Roll — {station?.name}
              </h2>
              <button onClick={loadStatus} disabled={loadingStatus} className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs"
                style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)' }}>
                <RefreshCw size={12} className={loadingStatus ? 'animate-spin' : ''} />
                Refresh
              </button>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.78rem', marginBottom: 16 }}>
              Upload the official voters roll (CSV or Excel) for this polling station. It must include at least an
              NRC Number and Full Name column. Adding columns for Voter Card Number, Gender, Date of Birth,
              Residential Address, Expiry Date and Polling District lets agents pull up the full card on lookup.
              Once uploaded, you can verify any voter who comes to vote here.
            </p>

            {status ? (
              <div className="flex items-start gap-3 px-4 py-3 rounded-xl mb-4" style={{ backgroundColor: 'rgba(22,163,74,0.08)', border: '1px solid rgba(22,163,74,0.2)' }}>
                <ShieldCheck size={16} style={{ color: '#16a34a', marginTop: 2, flexShrink: 0 }} />
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', lineHeight: 1.5 }}>
                  <strong style={{ color: '#16a34a' }}>{status.count.toLocaleString()}</strong> voter record{status.count !== 1 ? 's' : ''} loaded
                  {status.uploadedBy ? ` by ${status.uploadedBy}` : ''}{status.uploadedAt ? ` on ${new Date(status.uploadedAt).toLocaleString()}` : ''}.
                </p>
              </div>
            ) : (
              <div className="flex items-start gap-3 px-4 py-3 rounded-xl mb-4" style={{ backgroundColor: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
                <AlertTriangle size={16} style={{ color: '#f59e0b', marginTop: 2, flexShrink: 0 }} />
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', lineHeight: 1.5 }}>
                  No voters roll has been uploaded yet for this station. Upload one below to start verifying voters.
                </p>
              </div>
            )}

            <input ref={fileInputRef} type="file" accept=".csv,.xlsx,.xls" onChange={handleFileSelected} className="hidden" />
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={uploading}
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm disabled:opacity-50"
                style={{ background: '#16a34a', color: '#fff', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.03em' }}
              >
                {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                {status ? 'Replace Voters Roll' : 'Upload Voters Roll'}
              </button>
              {status && (
                <button
                  type="button"
                  disabled={uploading}
                  onClick={handleClearRoll}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm disabled:opacity-50"
                  style={{ background: 'rgba(220,38,38,0.9)', color: '#fff', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.03em' }}
                >
                  <Trash2 size={16} />
                  Clear Roll
                </button>
              )}
            </div>

            {uploadMsg && (
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm mt-4" style={{ backgroundColor: 'rgba(22,163,74,0.1)', border: '1px solid rgba(22,163,74,0.3)', color: '#16a34a' }}>
                <CheckCircle2 size={16} />
                {uploadMsg}
              </div>
            )}
            {uploadErr && (
              <div className="px-4 py-3 rounded-xl text-sm mt-4" style={{ backgroundColor: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.3)', color: '#f87171' }}>
                {uploadErr}
              </div>
            )}
          </div>

          {/* Voter verification */}
          <div className="rounded-2xl p-6" style={{ backgroundColor: '#123322', border: '1px solid rgba(255,255,255,0.07)' }}>
            <h2 className="mb-1" style={{ color: '#fff', fontFamily: 'Oswald, sans-serif', fontSize: '1.05rem' }}>
              <UserSearch className="inline w-5 h-5 mr-2" style={{ color: '#16a34a' }} />
              Verify a Voter
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.78rem', marginBottom: 16 }}>
              Enter the number printed on the voter's card — every registered detail on file comes up automatically.
              NRC or name search are there as a backup if the card is damaged or unreadable.
            </p>

            <div className="flex flex-wrap gap-2 mb-4">
              {(['card', 'nrc', 'name'] as const).map(m => (
                <button
                  key={m}
                  type="button"
                  onClick={() => { setSearchMode(m); setSearchResult(null); setSearchErr(''); }}
                  className="px-3 py-2 rounded-xl text-sm"
                  style={{
                    fontFamily: 'Oswald, sans-serif', letterSpacing: '0.03em',
                    background: searchMode === m ? '#16a34a' : 'rgba(255,255,255,0.06)',
                    color: searchMode === m ? '#fff' : 'rgba(255,255,255,0.6)',
                    border: `1px solid ${searchMode === m ? '#16a34a' : 'rgba(255,255,255,0.1)'}`,
                  }}
                >
                  {m === 'card' ? 'Voter Card Number' : m === 'nrc' ? 'Search by NRC' : 'Search by Name'}
                </button>
              ))}
            </div>

            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 mb-2">
              {searchMode === 'card' ? (
                <input
                  type="text"
                  value={cardQuery}
                  onChange={e => setCardQuery(e.target.value)}
                  placeholder="e.g. 90980571"
                  autoFocus
                  className="flex-1 px-3 py-2.5 rounded-lg text-sm"
                  style={selectStyle}
                />
              ) : searchMode === 'nrc' ? (
                <input
                  type="text"
                  value={nrcQuery}
                  onChange={e => setNrcQuery(e.target.value)}
                  placeholder="e.g. 123456/78/1"
                  className="flex-1 px-3 py-2.5 rounded-lg text-sm"
                  style={selectStyle}
                />
              ) : (
                <input
                  type="text"
                  value={nameQuery}
                  onChange={e => setNameQuery(e.target.value)}
                  placeholder="e.g. Mwansa Banda"
                  className="flex-1 px-3 py-2.5 rounded-lg text-sm"
                  style={selectStyle}
                />
              )}
              <button
                type="submit"
                disabled={searching}
                className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm disabled:opacity-50"
                style={{ background: '#16a34a', color: '#fff', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.03em' }}
              >
                {searching ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
                Check
              </button>
            </form>

            {searchErr && (
              <div className="px-4 py-3 rounded-xl text-sm mt-2" style={{ backgroundColor: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.3)', color: '#f87171' }}>
                {searchErr}
              </div>
            )}

            {searchResult && (searchResult.mode === 'card' || searchResult.mode === 'nrc') && (
              searchResult.found && searchResult.voter ? (
                <VoterCardPanel voter={searchResult.voter} registeredHere={!!searchResult.registeredHere} />
              ) : (
                <div className="flex items-start gap-3 px-4 py-4 rounded-xl mt-3" style={{ backgroundColor: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.3)' }}>
                  <XCircle size={20} style={{ color: '#dc2626', marginTop: 2, flexShrink: 0 }} />
                  <div>
                    <p style={{ color: '#dc2626', fontFamily: 'Oswald, sans-serif', fontSize: '0.95rem' }}>Not found in the voters roll</p>
                    <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.82rem', marginTop: 4 }}>
                      {searchResult.mode === 'card'
                        ? "This voter card number does not appear in any uploaded voters roll. Double-check the number on the card, or the voter's station roll hasn't been uploaded yet."
                        : "This NRC does not appear in any uploaded voters roll. This person is not a registered voter, or their station's roll hasn't been uploaded yet."}
                    </p>
                  </div>
                </div>
              )
            )}

            {searchResult && searchResult.mode === 'name' && (
              searchResult.matches && searchResult.matches.length > 0 ? (
                <div className="space-y-2 mt-3">
                  {searchResult.matches.map(m => (
                    <div key={m.nrc} className="flex items-start gap-3 px-4 py-3 rounded-xl" style={{
                      backgroundColor: m.registeredHere ? 'rgba(22,163,74,0.08)' : 'rgba(245,158,11,0.08)',
                      border: `1px solid ${m.registeredHere ? 'rgba(22,163,74,0.25)' : 'rgba(245,158,11,0.25)'}`,
                    }}>
                      {m.registeredHere ? <CheckCircle2 size={18} style={{ color: '#16a34a', marginTop: 2, flexShrink: 0 }} /> : <MapPin size={18} style={{ color: '#f59e0b', marginTop: 2, flexShrink: 0 }} />}
                      <div>
                        <p style={{ color: '#fff', fontSize: '0.88rem' }}>{m.fullName}</p>
                        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.72rem' }}>NRC: {m.nrcDisplay || m.nrc}{m.voterId ? ` · Card: ${m.voterId}` : ''}</p>
                        {m.registeredHere ? (
                          <p style={{ color: '#16a34a', fontSize: '0.78rem', marginTop: 4 }}>Registered at this polling station</p>
                        ) : (
                          <p style={{ color: '#f59e0b', fontSize: '0.78rem', marginTop: 4 }}>
                            Registered at {m.pollingStationName} — {[m.wardName, m.constituencyName, m.districtName].filter(Boolean).join(', ')}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-start gap-3 px-4 py-4 rounded-xl mt-3" style={{ backgroundColor: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.3)' }}>
                  <XCircle size={20} style={{ color: '#dc2626', marginTop: 2, flexShrink: 0 }} />
                  <div>
                    <p style={{ color: '#dc2626', fontFamily: 'Oswald, sans-serif', fontSize: '0.95rem' }}>No matching voter found</p>
                    <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.82rem', marginTop: 4 }}>
                      Try the exact spelling, or search by voter card number instead for a more reliable match.
                    </p>
                  </div>
                </div>
              )
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default VoterValidationPage;
