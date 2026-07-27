import { provinces } from '../../data/mockData';

const CARD_BG = '#0d1f14';

function StatCard({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div className="rounded-2xl p-4 text-center" style={{ backgroundColor: CARD_BG, border: `1px solid ${color}25` }}>
      <p style={{ color, fontSize: '1.8rem', fontFamily: 'Oswald, sans-serif', lineHeight: 1 }}>{value}</p>
      <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.7rem', marginTop: 6 }}>{label}</p>
    </div>
  );
}

/** Sum registeredVoters for every polling station under a given scope.
 *  District ids are not even unique within their own province -- ECZ's
 *  3-digit codes repeat both across provinces (e.g. '006' is Lusaka
 *  district AND Kapiri Mposhi district) *and* within the same province
 *  (Eastern province alone has two districts coded '001': Chadiza and
 *  Chama). Matching a district_manager's scopeId alone silently pulls in
 *  every same-numbered district and inflates the total. District names
 *  are unique nationally (verified against the full list), so resolve
 *  the exact district object by filtering id-matches down by name,
 *  rather than reconstructing a composite key that can itself collide. */
function sumRegisteredVoters(role: string, scopeId: string, scopeName: string): { total: number; stations: number } | null {
  let total = 0;
  let stations = 0;

  const isNational = role === 'national_manager';
  const isProvince = role === 'provincial_manager' || role === 'province_manager';
  const isDistrict = role === 'district_manager';
  const isConstituency = role === 'constituency_manager';
  const isWard = role === 'ward_manager';

  if (!isNational && !scopeId) return null;

  const normName = (s: string) => s.trim().toLowerCase();

  // Resolve the exact district object this scope refers to, up front, so
  // no colliding id (within or across provinces) can leak into the sum.
  let targetDistrict: (typeof provinces)[number]['districts'][number] | null = null;
  if (isDistrict) {
    const matches: (typeof provinces)[number]['districts'][number][] = [];
    for (const p of provinces) for (const d of p.districts) if (d.id === scopeId) matches.push(d);
    if (matches.length <= 1) {
      targetDistrict = matches[0] ?? null;
    } else {
      const target = normName(scopeName);
      targetDistrict = matches.find(d => normName(d.name) === target) ?? matches[0];
    }
  }

  for (const p of provinces) {
    if (isProvince && p.id !== scopeId) continue;
    for (const d of p.districts) {
      if (isDistrict && d !== targetDistrict) continue;
      for (const c of d.constituencies) {
        if (isConstituency && c.id !== scopeId) continue;
        for (const w of c.wards) {
          if (isWard && w.id !== scopeId) continue;
          for (const s of w.pollingStations) {
            total += s.registeredVoters;
            stations += 1;
          }
        }
      }
    }
  }
  return { total, stations };
}

const SCOPE_ROLES = ['ward_manager', 'constituency_manager', 'district_manager', 'provincial_manager', 'province_manager', 'national_manager'];

export function TotalRegisteredVotersStat({ color }: { color: string }) {
  const rawUser = typeof window !== 'undefined' ? sessionStorage.getItem('boz_election_user') : null;
  const user = rawUser ? JSON.parse(rawUser) : null;
  const role: string = user?.role || '';
  const scopeId: string = user?.scopeId || '';
  const scopeName: string = user?.scopeName || '';

  if (!SCOPE_ROLES.includes(role)) return null;
  if (role !== 'national_manager' && !scopeId) return null;

  const result = sumRegisteredVoters(role, scopeId, scopeName);
  if (!result) return null;

  const label = role === 'national_manager' ? 'Total Registered Voters — Nation'
    : role === 'provincial_manager' || role === 'province_manager' ? 'Total Registered Voters — Province'
    : role === 'district_manager' ? 'Total Registered Voters — District'
    : role === 'constituency_manager' ? 'Total Registered Voters — Constituency'
    : 'Total Registered Voters — Ward';

  return (
    <>
      <StatCard label={label} value={result.total.toLocaleString()} color={color} />
      <StatCard label="Polling Stations Covered" value={result.stations.toLocaleString()} color={color} />
    </>
  );
}

export default TotalRegisteredVotersStat;
