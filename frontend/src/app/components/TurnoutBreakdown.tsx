import { useMemo } from 'react';
import { provinces, calculateTurnout, PollingStation } from '../data/mockData';
import { TrendingUp } from 'lucide-react';

interface TurnoutRow {
  id: string;
  name: string;
  registered: number;
  cast: number;
  turnout: number;
}

interface TurnoutBreakdownProps {
  selectedProvince: string;
  selectedDistrict: string;
  selectedConstituency: string;
  selectedWard: string;
}

function collectStations(
  opts: { provinceId?: string; districtId?: string; constituencyId?: string; wardId?: string }
): PollingStation[] {
  const result: PollingStation[] = [];
  for (const prov of provinces) {
    if (opts.provinceId && prov.id !== opts.provinceId) continue;
    for (const dist of prov.districts) {
      if (opts.districtId && dist.id !== opts.districtId) continue;
      for (const con of dist.constituencies) {
        if (opts.constituencyId && con.id !== opts.constituencyId) continue;
        for (const ward of con.wards) {
          if (opts.wardId && ward.id !== opts.wardId) continue;
          result.push(...ward.pollingStations);
        }
      }
    }
  }
  return result;
}

export function TurnoutBreakdown({
  selectedProvince,
  selectedDistrict,
  selectedConstituency,
  selectedWard,
}: TurnoutBreakdownProps) {

  const { label, rows } = useMemo<{ label: string; rows: TurnoutRow[] }>(() => {
    // Determine which sub-level to break down into
    if (selectedWard) {
      // Show individual polling stations within the ward
      const ward = (() => {
        for (const p of provinces) for (const d of p.districts) for (const c of d.constituencies)
          for (const w of c.wards) if (w.id === selectedWard) return w;
      })();
      if (!ward) return { label: '', rows: [] };
      return {
        label: 'Polling Stations',
        rows: ward.pollingStations.map(s => ({
          id: s.id,
          name: s.name,
          registered: s.registeredVoters || 0,
          cast: s.totalVotes ?? 0,
          turnout: calculateTurnout(s.registeredVoters || 0, s.totalVotes ?? 0),
        })),
      };
    }

    if (selectedConstituency) {
      // Break down by ward
      const constituency = (() => {
        for (const p of provinces) for (const d of p.districts) for (const c of d.constituencies)
          if (c.id === selectedConstituency) return c;
      })();
      if (!constituency) return { label: '', rows: [] };
      return {
        label: 'Wards',
        rows: constituency.wards.map(w => {
          const stations = collectStations({ wardId: w.id });
          const reg = stations.reduce((s, st) => s + (st.registeredVoters || 0), 0);
          const cast = stations.reduce((s, st) => s + (st.totalVotes ?? 0), 0);
          return { id: w.id, name: w.name, registered: reg, cast, turnout: calculateTurnout(reg, cast) };
        }),
      };
    }

    if (selectedDistrict) {
      // Break down by constituency
      const district = (() => {
        for (const p of provinces) for (const d of p.districts)
          if (d.id === selectedDistrict) return d;
      })();
      if (!district) return { label: '', rows: [] };
      return {
        label: 'Constituencies',
        rows: district.constituencies.map(c => {
          const stations = collectStations({ constituencyId: c.id });
          const reg = stations.reduce((s, st) => s + (st.registeredVoters || 0), 0);
          const cast = stations.reduce((s, st) => s + (st.totalVotes ?? 0), 0);
          return { id: c.id, name: c.name, registered: reg, cast, turnout: calculateTurnout(reg, cast) };
        }),
      };
    }

    if (selectedProvince) {
      // Break down by district
      const province = provinces.find(p => p.id === selectedProvince);
      if (!province) return { label: '', rows: [] };
      return {
        label: 'Districts',
        rows: province.districts.map(d => {
          const stations = collectStations({ districtId: d.id });
          const reg = stations.reduce((s, st) => s + (st.registeredVoters || 0), 0);
          const cast = stations.reduce((s, st) => s + (st.totalVotes ?? 0), 0);
          return { id: d.id, name: d.name, registered: reg, cast, turnout: calculateTurnout(reg, cast) };
        }),
      };
    }

    // National: break down by province
    return {
      label: 'Provinces',
      rows: provinces.map(p => {
        const stations = collectStations({ provinceId: p.id });
        const reg = stations.reduce((s, st) => s + (st.registeredVoters || 0), 0);
        const cast = stations.reduce((s, st) => s + (st.totalVotes ?? 0), 0);
        return { id: p.id, name: p.name, registered: reg, cast, turnout: calculateTurnout(reg, cast) };
      }),
    };
  }, [selectedProvince, selectedDistrict, selectedConstituency, selectedWard]);

  if (!rows.length) return null;

  const maxTurnout = Math.max(...rows.map(r => r.turnout), 1);

  const color = (t: number) => {
    if (t >= 70) return '#198754';
    if (t >= 50) return '#F59E0B';
    return '#DC2626';
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-5 h-5 text-[#198754]" />
        <h3 className="font-bold text-foreground">Voter Turnout by {label}</h3>
      </div>

      <div className="space-y-3">
        {rows
          .slice()
          .sort((a, b) => b.turnout - a.turnout)
          .map(row => (
          <div key={row.id} className="group">
            <div className="flex items-center justify-between mb-1 gap-2">
              <span className="text-sm text-foreground truncate flex-1">{row.name}</span>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-xs text-muted-foreground">{row.cast.toLocaleString()} / {row.registered.toLocaleString()}</span>
                <span
                  className="text-sm font-bold w-14 text-right"
                  style={{ color: color(row.turnout) }}
                >
                  {row.turnout.toFixed(1)}%
                </span>
              </div>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${(row.turnout / maxTurnout) * 100}%`,
                  backgroundColor: color(row.turnout),
                }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-3 border-t border-border flex items-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-[#198754] inline-block"></span>≥70% High</div>
        <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-[#F59E0B] inline-block"></span>50–69% Moderate</div>
        <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-[#DC2626] inline-block"></span>&lt;50% Low</div>
      </div>
    </div>
  );
}
