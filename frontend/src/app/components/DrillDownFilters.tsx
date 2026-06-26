import { provinces, Province, District, Constituency, Ward } from '../data/mockData';

interface DrillDownFiltersProps {
  selectedProvince: string;
  selectedDistrict: string;
  selectedConstituency: string;
  selectedWard: string;
  selectedPollingStation: string;
  onProvinceChange: (value: string) => void;
  onDistrictChange: (value: string) => void;
  onConstituencyChange: (value: string) => void;
  onWardChange: (value: string) => void;
  onPollingStationChange: (value: string) => void;
}

export function DrillDownFilters({
  selectedProvince,
  selectedDistrict,
  selectedConstituency,
  selectedWard,
  selectedPollingStation,
  onProvinceChange,
  onDistrictChange,
  onConstituencyChange,
  onWardChange,
  onPollingStationChange,
}: DrillDownFiltersProps) {
  const currentProvince = provinces.find(p => p.id === selectedProvince);
  const currentDistrict = currentProvince?.districts.find(d => d.id === selectedDistrict);
  const currentConstituency = currentDistrict?.constituencies.find(c => c.id === selectedConstituency);
  const currentWard = currentConstituency?.wards.find(w => w.id === selectedWard);

  return (
    <div className="bg-gradient-to-br from-card to-card/80 border border-border rounded-xl p-6 shadow-md">
      <h3 className="font-semibold text-foreground mb-5 flex items-center gap-2">
        <div className="w-1 h-5 bg-gradient-to-b from-[#198754] to-[#DC2626] rounded-full"></div>
        Filter by Location
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Province */}
        <div>
          <label className="block text-sm mb-2">Province</label>
          <select
            value={selectedProvince}
            onChange={(e) => onProvinceChange(e.target.value)}
            className="w-full px-3 py-2 bg-input-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">All Provinces</option>
            {provinces.map(province => (
              <option key={province.id} value={province.id}>
                {province.name}
              </option>
            ))}
          </select>
        </div>

        {/* District */}
        <div>
          <label className="block text-sm mb-2">District</label>
          <select
            value={selectedDistrict}
            onChange={(e) => onDistrictChange(e.target.value)}
            disabled={!selectedProvince}
            className="w-full px-3 py-2 bg-input-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="">All Districts</option>
            {currentProvince?.districts.map(district => (
              <option key={district.id} value={district.id}>
                {district.name}
              </option>
            ))}
          </select>
        </div>

        {/* Constituency */}
        <div>
          <label className="block text-sm mb-2">Constituency</label>
          <select
            value={selectedConstituency}
            onChange={(e) => onConstituencyChange(e.target.value)}
            disabled={!selectedDistrict}
            className="w-full px-3 py-2 bg-input-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="">All Constituencies</option>
            {currentDistrict?.constituencies.map(constituency => (
              <option key={constituency.id} value={constituency.id}>
                {constituency.name}
              </option>
            ))}
          </select>
        </div>

        {/* Ward */}
        <div>
          <label className="block text-sm mb-2">Ward</label>
          <select
            value={selectedWard}
            onChange={(e) => onWardChange(e.target.value)}
            disabled={!selectedConstituency}
            className="w-full px-3 py-2 bg-input-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="">All Wards</option>
            {currentConstituency?.wards.map(ward => (
              <option key={ward.id} value={ward.id}>
                {ward.name}
              </option>
            ))}
          </select>
        </div>

        {/* Polling Station */}
        <div>
          <label className="block text-sm mb-2">Polling Station</label>
          <select
            value={selectedPollingStation}
            onChange={(e) => onPollingStationChange(e.target.value)}
            disabled={!selectedWard}
            className="w-full px-3 py-2 bg-input-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="">All Polling Stations</option>
            {currentWard?.pollingStations.map(station => (
              <option key={station.id} value={station.id}>
                {station.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
