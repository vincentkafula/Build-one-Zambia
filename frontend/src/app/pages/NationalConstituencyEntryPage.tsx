import { useState, useMemo } from 'react';
import { MapPin, ChevronRight } from 'lucide-react';
import { provinces } from '../data/mockData';
import { ConstituencyECZEntryForm } from './ConstituencyECZEntryPage';

// Lets a national manager enter ECZ figures for ANY constituency in the
// country directly — not just review aggregated province totals (that's
// what NationalECZEntryPage does). This exists for the same reason
// direct constituency entry exists: BOZ doesn't have full agent coverage
// everywhere, and a national manager is often the practical fallback for
// entering a constituency's ECZ-announced figures when there's no
// constituency manager assigned there at all.
export function NationalConstituencyEntryPage() {
  const [provinceId, setProvinceId] = useState('');
  const [districtId, setDistrictId] = useState('');
  const [constituencyId, setConstituencyId] = useState('');

  const selectedProvince = useMemo(() => provinces.find(p => p.id === provinceId), [provinceId]);
  const districts = selectedProvince?.districts ?? [];
  const selectedDistrict = useMemo(() => districts.find(d => d.id === districtId), [districts, districtId]);
  const constituencies = selectedDistrict?.constituencies ?? [];
  const selectedConstituency = useMemo(() => constituencies.find(c => c.id === constituencyId), [constituencies, constituencyId]);

  const selectStyle: React.CSSProperties = {
    backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
    color: '#fff', outline: 'none', appearance: 'none',
  };

  return (
    <div className="space-y-5">
      <div className="rounded-2xl p-6" style={{ backgroundColor: '#0A5D25', border: '1px solid rgba(255,255,255,0.07)' }}>
        <h2 className="mb-1 flex items-center gap-2" style={{ color: '#fff', fontFamily: 'Oswald, sans-serif', fontSize: '1.05rem' }}>
          <MapPin size={18} style={{ color: '#16a34a' }} /> Pick a Constituency
        </h2>
        <p className="mb-4" style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', lineHeight: 1.5 }}>
          Choose any province, district, and constituency in the country to enter its ECZ-announced figures — for
          constituencies without their own assigned Constituency Manager, or where BOZ agents didn't cover every
          polling station.
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={provinceId}
            onChange={e => { setProvinceId(e.target.value); setDistrictId(''); setConstituencyId(''); }}
            className="px-3 py-2.5 rounded-lg text-sm flex-1 min-w-[160px]"
            style={selectStyle}
          >
            <option value="">Select province…</option>
            {provinces.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <ChevronRight size={14} style={{ color: 'rgba(255,255,255,0.25)' }} className="hidden sm:block" />
          <select
            value={districtId}
            onChange={e => { setDistrictId(e.target.value); setConstituencyId(''); }}
            disabled={!provinceId}
            className="px-3 py-2.5 rounded-lg text-sm flex-1 min-w-[160px] disabled:opacity-40"
            style={selectStyle}
          >
            <option value="">Select district…</option>
            {districts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
          <ChevronRight size={14} style={{ color: 'rgba(255,255,255,0.25)' }} className="hidden sm:block" />
          <select
            value={constituencyId}
            onChange={e => setConstituencyId(e.target.value)}
            disabled={!districtId}
            className="px-3 py-2.5 rounded-lg text-sm flex-1 min-w-[160px] disabled:opacity-40"
            style={selectStyle}
          >
            <option value="">Select constituency…</option>
            {constituencies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      </div>

      {selectedConstituency ? (
        <ConstituencyECZEntryForm
          key={selectedConstituency.id}
          constituencyId={selectedConstituency.id}
          constituencyNameFallback={selectedConstituency.name}
        />
      ) : (
        <div className="rounded-2xl p-6 flex flex-col items-center gap-2 text-center" style={{ backgroundColor: '#0A5D25', border: '1px solid rgba(255,255,255,0.07)' }}>
          <MapPin size={28} style={{ color: 'rgba(255,255,255,0.25)' }} />
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' }}>Select a province, district, and constituency above to begin.</p>
        </div>
      )}
    </div>
  );
}

export default NationalConstituencyEntryPage;
