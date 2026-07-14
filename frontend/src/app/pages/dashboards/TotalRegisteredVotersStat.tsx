import { provinces } from '../../data/mockData';

const CARD_BG = '#0f1f33';

function StatCard({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div className="rounded-2xl p-4 text-center" style={{ backgroundColor: CARD_BG, border: `1px solid ${color}25` }}>
      <p style={{ color, fontSize: '1.8rem', fontFamily: 'Oswald, sans-serif', lineHeight: 1 }}>{value}</p>
      <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.7rem', marginTop: 6 }}>{label}</p>
    </div>
  );
}

/** Sum registeredVoters for every polling station under a given scope. */
function sumRegisteredVoters(role: string, scopeId: string): { total: number; stations: number } | null {
  let total = 0;
  let stations = 0;

  const isNational = role === 'national_manager';
  const isProvince = role === 'provincial_manager' || role === 'province_manager';
  const isDistrict = role === 'district_manager';
  const isConstituency = role === 'constituency_manager';
  const isWard = role === 'ward_manager';

  if (!isNational && !scopeId) return null;

  for (const p of provinces) {
    if (isProvince && p.id !== scopeId) continue;
    for (const d of p.districts) {
      if (isDistrict && d.id !== scopeId) continue;
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

  if (!SCOPE_ROLES.includes(role)) return null;
  if (role !== 'national_manager' && !scopeId) return null;

  const result = sumRegisteredVoters(role, scopeId);
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
