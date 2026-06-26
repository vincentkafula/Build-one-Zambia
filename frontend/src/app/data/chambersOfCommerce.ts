// Chambers of Commerce for Zambian Wards
// Modeled after California Chamber structure but adapted for Zambian context

export interface Chamber {
  id: string;
  name: string;
  location: string; // Ward or District name
  wardId?: string;
  districtId?: string;
  provinceId?: string;
  type: 'ward' | 'district' | 'provincial' | 'national';
  established?: string;
  memberBusinesses?: number;
  internshipPrograms?: InternshipProgram[];
  contactEmail?: string;
  contactPhone?: string;
  website?: string;
  description?: string;
}

export interface InternshipProgram {
  id: string;
  chamberId: string;
  title: string;
  description: string;
  duration: string; // e.g., "3 months", "6 months"
  positions: number;
  requirements: string[];
  benefits: string[];
  applicationDeadline?: string;
  status: 'open' | 'closed' | 'upcoming';
  sector: string; // e.g., "Agriculture", "Technology", "Tourism"
}

// Sample chambers of commerce for Zambian wards
// In production, each of the 226 constituencies and their wards would have chambers
export const chambersOfCommerce: Chamber[] = [
  {
    id: 'chamber-001',
    name: 'Lusaka Central Ward Chamber of Commerce',
    location: 'Lusaka Central',
    type: 'ward',
    provinceId: 'lusaka',
    established: '2020',
    memberBusinesses: 45,
    contactEmail: 'info@lusakacentralchamber.org.zm',
    contactPhone: '+260-211-123456',
    description: 'Supporting local businesses and entrepreneurship in Lusaka Central Ward',
    internshipPrograms: [
      {
        id: 'int-001',
        chamberId: 'chamber-001',
        title: 'Business Development Internship',
        description: 'Learn business development skills with local SMEs in Lusaka Central',
        duration: '6 months',
        positions: 10,
        requirements: [
          'Grade 12 certificate or higher',
          'Interest in business and entrepreneurship',
          'Good communication skills',
        ],
        benefits: [
          'Monthly stipend of K500',
          'Certificate of completion',
          'Mentorship from experienced business owners',
          'Networking opportunities',
        ],
        applicationDeadline: '2026-07-31',
        status: 'open',
        sector: 'Business Development',
      },
    ],
  },
  {
    id: 'chamber-002',
    name: 'Kitwe District Chamber of Commerce',
    location: 'Kitwe',
    type: 'district',
    provinceId: 'copperbelt',
    established: '2018',
    memberBusinesses: 120,
    contactEmail: 'info@kitwechamber.org.zm',
    contactPhone: '+260-212-234567',
    description: 'Promoting trade and commerce in the Copperbelt region',
    internshipPrograms: [
      {
        id: 'int-002',
        chamberId: 'chamber-002',
        title: 'Mining & Industry Internship',
        description: 'Gain practical experience in mining sector support services',
        duration: '12 months',
        positions: 20,
        requirements: [
          'Diploma or degree in relevant field',
          'Basic computer skills',
          'Willingness to learn',
        ],
        benefits: [
          'Monthly stipend of K800',
          'Professional certification',
          'Job placement assistance',
          'Health insurance',
        ],
        applicationDeadline: '2026-08-15',
        status: 'open',
        sector: 'Mining & Industry',
      },
    ],
  },
  {
    id: 'chamber-003',
    name: 'Southern Province Chamber of Commerce',
    location: 'Choma',
    type: 'provincial',
    provinceId: 'southern',
    established: '2015',
    memberBusinesses: 200,
    contactEmail: 'info@southernchamber.org.zm',
    contactPhone: '+260-213-345678',
    description: 'Advancing business interests across Southern Province',
    internshipPrograms: [
      {
        id: 'int-003',
        chamberId: 'chamber-003',
        title: 'Agriculture & Agribusiness Internship',
        description: 'Work with agricultural cooperatives and agribusiness enterprises',
        duration: '9 months',
        positions: 30,
        requirements: [
          'Interest in agriculture',
          'Grade 12 or diploma',
          'Physical fitness for field work',
        ],
        benefits: [
          'Monthly stipend of K600',
          'Training in modern farming techniques',
          'Access to farming equipment',
          'Certificate of completion',
        ],
        applicationDeadline: '2026-09-01',
        status: 'open',
        sector: 'Agriculture',
      },
    ],
  },
  {
    id: 'chamber-004',
    name: 'Livingstone Tourism Chamber',
    location: 'Livingstone',
    type: 'district',
    provinceId: 'southern',
    established: '2017',
    memberBusinesses: 85,
    contactEmail: 'info@livingstonechamber.org.zm',
    contactPhone: '+260-213-456789',
    description: 'Supporting tourism and hospitality businesses near Victoria Falls',
    internshipPrograms: [
      {
        id: 'int-004',
        chamberId: 'chamber-004',
        title: 'Tourism & Hospitality Internship',
        description: 'Gain experience in hotels, tour operations, and tourism marketing',
        duration: '6 months',
        positions: 25,
        requirements: [
          'Grade 12 certificate',
          'Good English communication',
          'Customer service orientation',
        ],
        benefits: [
          'Monthly stipend of K700',
          'Tourism industry certification',
          'International exposure',
          'Job placement opportunities',
        ],
        applicationDeadline: '2026-07-20',
        status: 'open',
        sector: 'Tourism & Hospitality',
      },
    ],
  },
  {
    id: 'chamber-005',
    name: 'Zambia National Chamber of Commerce',
    location: 'Lusaka',
    type: 'national',
    established: '1965',
    memberBusinesses: 1500,
    contactEmail: 'info@zambiachamber.org.zm',
    contactPhone: '+260-211-987654',
    description: 'National apex body for business chambers across Zambia',
    internshipPrograms: [
      {
        id: 'int-005',
        chamberId: 'chamber-005',
        title: 'National Business Policy Internship',
        description: 'Work on national business advocacy and policy development',
        duration: '12 months',
        positions: 5,
        requirements: [
          'University degree in Business, Economics, or related field',
          'Strong analytical skills',
          'Excellent written communication',
        ],
        benefits: [
          'Monthly stipend of K2,000',
          'National exposure',
          'Policy training',
          'Networking with senior business leaders',
        ],
        applicationDeadline: '2026-08-30',
        status: 'open',
        sector: 'Business Policy',
      },
    ],
  },
];

// Helper function to get chambers by ward
export function getChambersByWard(wardId: string): Chamber[] {
  return chambersOfCommerce.filter(chamber => chamber.wardId === wardId);
}

// Helper function to get chambers by district
export function getChambersByDistrict(districtId: string): Chamber[] {
  return chambersOfCommerce.filter(chamber => chamber.districtId === districtId);
}

// Helper function to get chambers by province
export function getChambersByProvince(provinceId: string): Chamber[] {
  return chambersOfCommerce.filter(chamber => chamber.provinceId === provinceId);
}

// Helper function to get all open internships
export function getOpenInternships(): InternshipProgram[] {
  const internships: InternshipProgram[] = [];
  chambersOfCommerce.forEach(chamber => {
    if (chamber.internshipPrograms) {
      internships.push(...chamber.internshipPrograms.filter(prog => prog.status === 'open'));
    }
  });
  return internships;
}

// Helper function to get internships by sector
export function getInternshipsBySector(sector: string): InternshipProgram[] {
  const internships: InternshipProgram[] = [];
  chambersOfCommerce.forEach(chamber => {
    if (chamber.internshipPrograms) {
      internships.push(...chamber.internshipPrograms.filter(prog => prog.sector === sector));
    }
  });
  return internships;
}

// Helper function to get chamber by ID
export function getChamberById(chamberId: string): Chamber | undefined {
  return chambersOfCommerce.find(chamber => chamber.id === chamberId);
}
