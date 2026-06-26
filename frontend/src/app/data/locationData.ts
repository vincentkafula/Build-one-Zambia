// Re-export the comprehensive election data for use in registration forms
// This uses the actual Zambian electoral data with all provinces, districts,
// constituencies, wards, and polling stations directly from the election results system

import { provinces as electionProvinces } from './mockData';

export interface PollingStation {
  id: string;
  name: string;
  registeredVoters?: number;
}

export interface Ward {
  id: string;
  name: string;
  pollingStations: PollingStation[];
}

export interface Constituency {
  id: string;
  name: string;
  wards: Ward[];
}

export interface District {
  id: string;
  name: string;
  constituencies: Constituency[];
}

export interface Province {
  id: string;
  name: string;
  districts: District[];
}

// Transform election data to registration form format
// Uses the EXACT data from the election results system (mockData.ts provinces array)
function transformElectionDataToLocationData(): Province[] {
  return electionProvinces.map(province => ({
    id: province.id,
    name: province.name,
    districts: province.districts.map(district => ({
      id: district.id,
      name: district.name,
      constituencies: district.constituencies.map(constituency => ({
        id: constituency.id,
        name: constituency.name,
        wards: constituency.wards.map(ward => ({
          id: ward.id,
          name: ward.name,
          pollingStations: ward.pollingStations.map(ps => ({
            id: ps.id,
            name: ps.name,
            registeredVoters: ps.registeredVoters,
          })),
        })),
      })),
    })),
  }));
}

// Export the actual Zambian location data from the election results system
// This uses the EXACT same data structure as the election results pages
// Total coverage: 10 provinces, all districts, constituencies, wards, and 13,529 polling stations
export const zambiaLocationData: Province[] = transformElectionDataToLocationData();

// Zambian universities for internship applications
export const zambianUniversities = [
  'University of Zambia (UNZA)',
  'Copperbelt University (CBU)',
  'Mulungushi University',
  'Kwame Nkrumah University',
  'Chalimbana University',
  'Cavendish University',
  'University of Lusaka',
  'Zambian Open University',
  'DMI-St. Eugene University',
  'Rusangu University',
  'Northrise University',
  'Zambia Catholic University',
  'Texila American University',
  'Eden University',
  'Information and Communications University',
  'Zambia Centre for Accountancy Studies (ZCAS)',
  'Natural Resources Development College (NRDC)',
  'Evelyn Hone College',
  'Mukuba University',
  'Apex Medical University',
];
