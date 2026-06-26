import { useState, useMemo } from 'react';
import { Search, Building2, MapPin, Phone, Mail, Users, Calendar, Filter, ChevronDown, Globe, Briefcase } from 'lucide-react';
import { getAllChambers, Chamber } from '../../data/allChambers';

export function ChambersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProvince, setSelectedProvince] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedSector, setSelectedSector] = useState<string>('all');

  const allChambers = useMemo(() => getAllChambers(), []);

  // Extract unique values for filters
  const provinces = useMemo(() => {
    const uniqueProvinces = new Set(allChambers.map(c => c.provinceName).filter(Boolean));
    return Array.from(uniqueProvinces).sort();
  }, [allChambers]);

  const sectors = useMemo(() => {
    const uniqueSectors = new Set(allChambers.map(c => c.sector).filter(Boolean));
    return Array.from(uniqueSectors).sort();
  }, [allChambers]);

  const types = ['ward', 'constituency', 'district', 'provincial', 'national'];

  // Filter chambers
  const filteredChambers = useMemo(() => {
    return allChambers.filter(chamber => {
      const matchesSearch = searchTerm === '' ||
        chamber.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        chamber.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        chamber.description.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesProvince = selectedProvince === 'all' || chamber.provinceName === selectedProvince;
      const matchesType = selectedType === 'all' || chamber.type === selectedType;
      const matchesSector = selectedSector === 'all' || chamber.sector === selectedSector;

      return matchesSearch && matchesProvince && matchesType && matchesSector;
    });
  }, [allChambers, searchTerm, selectedProvince, selectedType, selectedSector]);

  // Group by province for display
  const chambersByProvince = useMemo(() => {
    const grouped: Record<string, Chamber[]> = {};
    filteredChambers.forEach(chamber => {
      const province = chamber.provinceName || 'National';
      if (!grouped[province]) {
        grouped[province] = [];
      }
      grouped[province].push(chamber);
    });
    return grouped;
  }, [filteredChambers]);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'national': return '#dc2626';
      case 'provincial': return '#f59e0b';
      case 'district': return '#10b981';
      case 'constituency': return '#3b82f6';
      case 'ward': return '#8b5cf6';
      default: return '#6b7280';
    }
  };

  const getTypeLabel = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#007A30' }}>
      {/* Hero Section */}
      <div className="relative overflow-hidden" style={{ backgroundColor: '#111' }}>
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23dc2626\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")', backgroundSize: '60px 60px' }} />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6" style={{ backgroundColor: 'rgba(220, 38, 38, 0.1)', border: '1px solid rgba(220, 38, 38, 0.3)' }}>
              <Building2 size={16} style={{ color: '#dc2626' }} />
              <span style={{ color: '#dc2626', fontFamily: 'Oswald, sans-serif', fontSize: '12px', letterSpacing: '0.1em', fontWeight: 600 }}>
                BUSINESS NETWORK
              </span>
            </div>

            <h1 className="text-5xl md:text-6xl font-bold mb-6" style={{ fontFamily: 'Oswald, sans-serif', color: '#ffffff', lineHeight: '1.1' }}>
              Chambers of Commerce
            </h1>

            <p className="text-xl mb-8" style={{ color: '#9ca3af', lineHeight: '1.7' }}>
              Connecting businesses, entrepreneurs, and economic opportunities across all 10 provinces of Zambia. 
              From ward-level chambers to national networks, we're building a thriving business ecosystem.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-8 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(220, 38, 38, 0.15)' }}>
                  <Building2 size={20} style={{ color: '#dc2626' }} />
                </div>
                <div className="text-left">
                  <div className="font-bold text-2xl" style={{ color: '#ffffff', fontFamily: 'Oswald, sans-serif' }}>800+</div>
                  <div style={{ color: '#6b7280' }}>Chambers</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(245, 158, 11, 0.15)' }}>
                  <MapPin size={20} style={{ color: '#f59e0b' }} />
                </div>
                <div className="text-left">
                  <div className="font-bold text-2xl" style={{ color: '#ffffff', fontFamily: 'Oswald, sans-serif' }}>226</div>
                  <div style={{ color: '#6b7280' }}>Constituencies</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)' }}>
                  <Users size={20} style={{ color: '#10b981' }} />
                </div>
                <div className="text-left">
                  <div className="font-bold text-2xl" style={{ color: '#ffffff', fontFamily: 'Oswald, sans-serif' }}>1,858</div>
                  <div style={{ color: '#6b7280' }}>Wards</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="sticky top-20 z-40 border-b" style={{ backgroundColor: '#007A30', borderColor: '#1f1f1f' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: '#6b7280' }} />
                <input
                  type="text"
                  placeholder="Search chambers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-lg outline-none transition-all"
                  style={{
                    backgroundColor: '#111',
                    border: '1px solid #1f1f1f',
                    color: '#ffffff',
                    fontSize: '14px'
                  }}
                  onFocus={(e) => e.currentTarget.style.borderColor = '#dc2626'}
                  onBlur={(e) => e.currentTarget.style.borderColor = '#1f1f1f'}
                />
              </div>
            </div>

            {/* Province Filter */}
            <div className="relative">
              <select
                value={selectedProvince}
                onChange={(e) => setSelectedProvince(e.target.value)}
                className="w-full px-4 py-3 rounded-lg outline-none appearance-none cursor-pointer"
                style={{
                  backgroundColor: '#111',
                  border: '1px solid #1f1f1f',
                  color: '#ffffff',
                  fontSize: '14px'
                }}
              >
                <option value="all">All Provinces</option>
                {provinces.map(province => (
                  <option key={province} value={province}>{province}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: '#6b7280' }} />
            </div>

            {/* Type Filter */}
            <div className="relative">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-4 py-3 rounded-lg outline-none appearance-none cursor-pointer"
                style={{
                  backgroundColor: '#111',
                  border: '1px solid #1f1f1f',
                  color: '#ffffff',
                  fontSize: '14px'
                }}
              >
                <option value="all">All Types</option>
                {types.map(type => (
                  <option key={type} value={type}>{getTypeLabel(type)}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: '#6b7280' }} />
            </div>

            {/* Sector Filter */}
            <div className="relative">
              <select
                value={selectedSector}
                onChange={(e) => setSelectedSector(e.target.value)}
                className="w-full px-4 py-3 rounded-lg outline-none appearance-none cursor-pointer"
                style={{
                  backgroundColor: '#111',
                  border: '1px solid #1f1f1f',
                  color: '#ffffff',
                  fontSize: '14px'
                }}
              >
                <option value="all">All Sectors</option>
                {sectors.map(sector => (
                  <option key={sector} value={sector}>{sector}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: '#6b7280' }} />
            </div>
          </div>

          {/* Active Filters Summary */}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="text-sm" style={{ color: '#6b7280' }}>
              Showing {filteredChambers.length} of {allChambers.length} chambers
            </span>
            {(selectedProvince !== 'all' || selectedType !== 'all' || selectedSector !== 'all' || searchTerm) && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedProvince('all');
                  setSelectedType('all');
                  setSelectedSector('all');
                }}
                className="text-sm px-3 py-1 rounded transition-colors"
                style={{ backgroundColor: '#1f1f1f', color: '#dc2626' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1f1f1f'}
              >
                Clear filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Chambers List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {Object.keys(chambersByProvince).length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: '#1f1f1f' }}>
              <Search size={24} style={{ color: '#6b7280' }} />
            </div>
            <h3 className="text-xl font-semibold mb-2" style={{ color: '#ffffff', fontFamily: 'Oswald, sans-serif' }}>
              No chambers found
            </h3>
            <p style={{ color: '#6b7280' }}>Try adjusting your search or filters</p>
          </div>
        ) : (
          Object.entries(chambersByProvince).sort(([a], [b]) => a.localeCompare(b)).map(([province, chambers]) => (
            <div key={province} className="mb-12">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3" style={{ fontFamily: 'Oswald, sans-serif', color: '#ffffff' }}>
                <MapPin size={24} style={{ color: '#dc2626' }} />
                {province}
                <span className="text-sm font-normal px-3 py-1 rounded-full" style={{ backgroundColor: '#1f1f1f', color: '#9ca3af' }}>
                  {chambers.length} {chambers.length === 1 ? 'chamber' : 'chambers'}
                </span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {chambers.map(chamber => (
                  <div
                    key={chamber.id}
                    className="rounded-xl overflow-hidden transition-all duration-300 group"
                    style={{ backgroundColor: '#111', border: '1px solid #1f1f1f' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#dc2626';
                      e.currentTarget.style.transform = 'translateY(-4px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#1f1f1f';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    {/* Header */}
                    <div className="p-6 border-b" style={{ borderColor: '#1f1f1f' }}>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${getTypeColor(chamber.type)}20` }}>
                            <Building2 size={20} style={{ color: getTypeColor(chamber.type) }} />
                          </div>
                          <span
                            className="text-xs px-2 py-1 rounded font-semibold"
                            style={{
                              backgroundColor: `${getTypeColor(chamber.type)}20`,
                              color: getTypeColor(chamber.type),
                              fontFamily: 'Oswald, sans-serif',
                              letterSpacing: '0.05em'
                            }}
                          >
                            {getTypeLabel(chamber.type)}
                          </span>
                        </div>
                      </div>

                      <h3 className="text-lg font-bold mb-2 leading-tight" style={{ fontFamily: 'Oswald, sans-serif', color: '#ffffff' }}>
                        {chamber.name}
                      </h3>

                      <div className="flex items-center gap-2 mb-3">
                        <MapPin size={14} style={{ color: '#6b7280' }} />
                        <span className="text-sm" style={{ color: '#9ca3af' }}>{chamber.location}</span>
                      </div>

                      <p className="text-sm leading-relaxed" style={{ color: '#6b7280' }}>
                        {chamber.description}
                      </p>
                    </div>

                    {/* Details */}
                    <div className="p-6 space-y-3">
                      <div className="flex items-center gap-2">
                        <Briefcase size={16} style={{ color: '#f59e0b' }} />
                        <span className="text-sm" style={{ color: '#9ca3af' }}>Sector:</span>
                        <span className="text-sm font-semibold" style={{ color: '#ffffff' }}>{chamber.sector}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Users size={16} style={{ color: '#10b981' }} />
                        <span className="text-sm" style={{ color: '#9ca3af' }}>Members:</span>
                        <span className="text-sm font-semibold" style={{ color: '#ffffff' }}>{chamber.memberBusinesses}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Calendar size={16} style={{ color: '#3b82f6' }} />
                        <span className="text-sm" style={{ color: '#9ca3af' }}>Est:</span>
                        <span className="text-sm font-semibold" style={{ color: '#ffffff' }}>{chamber.established}</span>
                      </div>

                      <div className="pt-3 mt-3 border-t space-y-2" style={{ borderColor: '#1f1f1f' }}>
                        <div className="flex items-center gap-2">
                          <Phone size={14} style={{ color: '#6b7280' }} />
                          <a href={`tel:${chamber.contactPhone}`} className="text-sm hover:underline" style={{ color: '#9ca3af' }}>
                            {chamber.contactPhone}
                          </a>
                        </div>

                        <div className="flex items-center gap-2">
                          <Mail size={14} style={{ color: '#6b7280' }} />
                          <a href={`mailto:${chamber.contactEmail}`} className="text-sm hover:underline" style={{ color: '#9ca3af' }}>
                            {chamber.contactEmail}
                          </a>
                        </div>

                        {chamber.website && (
                          <div className="flex items-center gap-2">
                            <Globe size={14} style={{ color: '#6b7280' }} />
                            <a href={chamber.website} target="_blank" rel="noopener noreferrer" className="text-sm hover:underline" style={{ color: '#9ca3af' }}>
                              Visit website
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Call to Action */}
      <div className="border-t" style={{ borderColor: '#1f1f1f' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ fontFamily: 'Oswald, sans-serif', color: '#ffffff' }}>
              Join Your Local Chamber
            </h2>
            <p className="text-lg mb-8" style={{ color: '#9ca3af', lineHeight: '1.7' }}>
              Connect with fellow business owners, access resources, and grow your enterprise. 
              Chambers of commerce provide networking, advocacy, and support for businesses of all sizes.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a
                href="/contact"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-lg font-semibold transition-all"
                style={{ fontFamily: 'Oswald, sans-serif', backgroundColor: '#dc2626', color: '#ffffff', letterSpacing: '0.05em' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#b91c1c'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
              >
                Contact Us
              </a>
              <a
                href="/register/internship"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-lg font-semibold transition-all"
                style={{ fontFamily: 'Oswald, sans-serif', backgroundColor: 'transparent', color: '#ffffff', border: '1px solid #dc2626', letterSpacing: '0.05em' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#dc2626';
                  e.currentTarget.style.color = '#ffffff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#ffffff';
                }}
              >
                Internship Program
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
