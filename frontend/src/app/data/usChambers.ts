// US Chambers of Commerce for International Partnerships
// Data sourced from Arkansas, Georgia, Iowa, and National chambers

export interface USChamber {
  id: string;
  name: string;
  city: string;
  state: string;
  isUSChamberMember: boolean;
  contactEmail?: string;
  contactPhone?: string;
  website?: string;
  partnershipStatus?: 'active' | 'pending' | 'available';
  sectors?: string[];
}

// Parse and structure US Chambers data
export const usChambers: USChamber[] = [
  // Arkansas Chambers - U.S. Chamber Members
  { id: 'us-ar-001', name: 'Arkadelphia Regional Economic Development Alliance & Chamber', city: 'Arkadelphia', state: 'AR', isUSChamberMember: true },
  { id: 'us-ar-002', name: 'Arkansas State Chamber of Commerce', city: 'Little Rock', state: 'AR', isUSChamberMember: true },
  { id: 'us-ar-003', name: 'Bentonville Area Chamber of Commerce', city: 'Bentonville', state: 'AR', isUSChamberMember: true },
  { id: 'us-ar-004', name: 'Chamber Fayetteville', city: 'Fayetteville', state: 'AR', isUSChamberMember: true },
  { id: 'us-ar-005', name: 'Clarksville Johnson County Chamber of Commerce', city: 'Clarksville', state: 'AR', isUSChamberMember: true },
  { id: 'us-ar-006', name: 'Conway Area Chamber of Commerce', city: 'Conway', state: 'AR', isUSChamberMember: true },
  { id: 'us-ar-007', name: 'Fort Smith Regional Chamber of Commerce', city: 'Fort Smith', state: 'AR', isUSChamberMember: true },
  { id: 'us-ar-008', name: 'Jonesboro Regional Chamber of Commerce', city: 'Jonesboro', state: 'AR', isUSChamberMember: true },
  { id: 'us-ar-009', name: 'Little Rock Regional Chamber of Commerce', city: 'Little Rock', state: 'AR', isUSChamberMember: true },
  { id: 'us-ar-010', name: 'Rogers-Lowell Chamber', city: 'Rogers', state: 'AR', isUSChamberMember: true },
  { id: 'us-ar-011', name: 'Springdale Chamber of Commerce', city: 'Springdale', state: 'AR', isUSChamberMember: true },

  // Arkansas Chambers - Non-members
  { id: 'us-ar-101', name: 'Alma Area Chamber of Commerce', city: 'Alma', state: 'AR', isUSChamberMember: false },
  { id: 'us-ar-102', name: 'Batesville Area Chamber of Commerce', city: 'Batesville', state: 'AR', isUSChamberMember: false },
  { id: 'us-ar-103', name: 'Benton Chamber of Commerce', city: 'Benton', state: 'AR', isUSChamberMember: false },
  { id: 'us-ar-104', name: 'Bryant Chamber of Commerce', city: 'Bryant', state: 'AR', isUSChamberMember: false },
  { id: 'us-ar-105', name: 'Cabot Chamber of Commerce', city: 'Cabot', state: 'AR', isUSChamberMember: false },

  // Georgia Chambers - U.S. Chamber Members
  { id: 'us-ga-001', name: 'Albany Area Chamber of Commerce', city: 'Albany', state: 'GA', isUSChamberMember: true },
  { id: 'us-ga-002', name: 'Athens Area Chamber of Commerce', city: 'Athens', state: 'GA', isUSChamberMember: true },
  { id: 'us-ga-003', name: 'Augusta Metro Chamber of Commerce', city: 'Augusta', state: 'GA', isUSChamberMember: true },
  { id: 'us-ga-004', name: 'Brunswick-Golden Isles Chamber of Commerce', city: 'Brunswick', state: 'GA', isUSChamberMember: true },
  { id: 'us-ga-005', name: 'Cherokee County Chamber of Commerce', city: 'Canton', state: 'GA', isUSChamberMember: true },
  { id: 'us-ga-006', name: 'Cobb Chamber', city: 'Atlanta', state: 'GA', isUSChamberMember: true },
  { id: 'us-ga-007', name: 'Georgia Chamber of Commerce', city: 'Atlanta', state: 'GA', isUSChamberMember: true },
  { id: 'us-ga-008', name: 'Greater Macon Chamber of Commerce', city: 'Macon', state: 'GA', isUSChamberMember: true },
  { id: 'us-ga-009', name: 'Gwinnett Chamber of Commerce', city: 'Duluth', state: 'GA', isUSChamberMember: true },
  { id: 'us-ga-010', name: 'Metro Atlanta Chamber', city: 'Atlanta', state: 'GA', isUSChamberMember: true },
  { id: 'us-ga-011', name: 'Savannah Area Chamber of Commerce', city: 'Savannah', state: 'GA', isUSChamberMember: true },

  // Georgia Chambers - Non-members
  { id: 'us-ga-101', name: 'Alpharetta Chamber Of Commerce', city: 'Alpharetta', state: 'GA', isUSChamberMember: false },
  { id: 'us-ga-102', name: 'Brookhaven Chamber of Commerce', city: 'Brookhaven', state: 'GA', isUSChamberMember: false },
  { id: 'us-ga-103', name: 'Dahlonega-Lumpkin County Chamber of Commerce', city: 'Dahlonega', state: 'GA', isUSChamberMember: false },
  { id: 'us-ga-104', name: 'Johns Creek Chamber of Commerce', city: 'Johns Creek', state: 'GA', isUSChamberMember: false },

  // Iowa Chambers - U.S. Chamber Members
  { id: 'us-ia-001', name: 'Cedar Rapids Metro Economic Alliance', city: 'Cedar Rapids', state: 'IA', isUSChamberMember: true },
  { id: 'us-ia-002', name: 'Dubuque Area Chamber of Commerce', city: 'Dubuque', state: 'IA', isUSChamberMember: true },
  { id: 'us-ia-003', name: 'Greater Des Moines Partnership', city: 'Des Moines', state: 'IA', isUSChamberMember: true },
  { id: 'us-ia-004', name: 'Iowa Association of Business and Industry', city: 'Des Moines', state: 'IA', isUSChamberMember: true },
  { id: 'us-ia-005', name: 'Quad Cities Chamber of Commerce', city: 'Davenport', state: 'IA', isUSChamberMember: true },
  { id: 'us-ia-006', name: 'Sioux Center Chamber of Commerce', city: 'Sioux Center', state: 'IA', isUSChamberMember: true },

  // Iowa Chambers - Non-members
  { id: 'us-ia-101', name: 'Ames Chamber of Commerce', city: 'Ames', state: 'IA', isUSChamberMember: false },
  { id: 'us-ia-102', name: 'Ankeny Area Chamber of Commerce', city: 'Ankeny', state: 'IA', isUSChamberMember: false },
  { id: 'us-ia-103', name: 'Carroll Chamber of Commerce', city: 'Carroll', state: 'IA', isUSChamberMember: false },

  // Washington DC & National Chambers
  { id: 'us-dc-001', name: 'U.S. Chamber of Commerce', city: 'Washington', state: 'DC', isUSChamberMember: true },
  { id: 'us-dc-002', name: 'DC Chamber of Commerce', city: 'Washington', state: 'DC', isUSChamberMember: false },
  { id: 'us-dc-003', name: 'National AAPI Chamber of Commerce', city: 'Washington', state: 'DC', isUSChamberMember: true },
  { id: 'us-dc-004', name: 'US Pan Asian American Chamber of Commerce', city: 'Washington', state: 'DC', isUSChamberMember: true },
  { id: 'us-dc-005', name: 'U.S. Hispanic Chamber of Commerce', city: 'Washington', state: 'DC', isUSChamberMember: false },
  { id: 'us-dc-006', name: 'National Black Chamber of Commerce', city: 'Washington', state: 'DC', isUSChamberMember: false },
  { id: 'us-dc-007', name: 'National LGBT Chamber of Commerce', city: 'Washington', state: 'DC', isUSChamberMember: false },
  { id: 'us-dc-008', name: 'Greater Washington Board of Trade', city: 'Washington', state: 'DC', isUSChamberMember: false },
];

// Helper functions
export function getUSChambersByState(state: string): USChamber[] {
  return usChambers.filter(c => c.state === state);
}

export function getUSChamberMembers(): USChamber[] {
  return usChambers.filter(c => c.isUSChamberMember);
}

export function getAllUSStates(): string[] {
  const states = new Set(usChambers.map(c => c.state));
  return Array.from(states).sort();
}

export function getUSChamberById(id: string): USChamber | undefined {
  return usChambers.find(c => c.id === id);
}

export function searchUSChambers(query: string): USChamber[] {
  const lowerQuery = query.toLowerCase();
  return usChambers.filter(c => 
    c.name.toLowerCase().includes(lowerQuery) ||
    c.city.toLowerCase().includes(lowerQuery) ||
    c.state.toLowerCase().includes(lowerQuery)
  );
}

// Generate partner suggestions based on Zambian chamber characteristics
export function suggestUSPartners(zambianChamberSector: string, limit: number = 5): USChamber[] {
  // Prioritize U.S. Chamber members for partnerships
  const members = getUSChamberMembers();
  
  // For now, return a mix of national and state chambers
  // In production, this could use AI or manual mapping based on sectors
  const suggestions: USChamber[] = [];
  
  // Always include national chamber
  const nationalChamber = usChambers.find(c => c.id === 'us-dc-001');
  if (nationalChamber) suggestions.push(nationalChamber);
  
  // Add some state-level chambers
  const stateChambers = members.filter(c => c.state !== 'DC').slice(0, limit - 1);
  suggestions.push(...stateChambers);
  
  return suggestions.slice(0, limit);
}

export function getUSChamberStats() {
  return {
    total: usChambers.length,
    usChamberMembers: usChambers.filter(c => c.isUSChamberMember).length,
    states: getAllUSStates().length,
    byState: getAllUSStates().map(state => ({
      state,
      count: getUSChambersByState(state).length,
    })),
  };
}
