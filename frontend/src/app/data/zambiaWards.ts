// Zambia Ward Hierarchy — Province → District → Constituency → Ward
// 10 Provinces | 116 Districts | 226 Constituencies | 1,858 Wards
// Real names and IDs are sourced from mockData.ts (ECZ rptPDListing20260508.md).

import { provinces as eczProvinces } from './mockData';


export interface ZambiaWard {
  id: string;
  name: string;
  constituencyId: string;
  constituencyName: string;
  districtName: string;
  provinceName: string;
}

export interface ZambiaConstituency {
  id: string;
  name: string;
  districtName: string;
  provinceName: string;
  wards: ZambiaWard[];
}

export interface ZambiaDistrict {
  name: string;
  provinceName: string;
  constituencies: ZambiaConstituency[];
}

export interface ZambiaProvince {
  name: string;
  districts: ZambiaDistrict[];
}

// ── Name pools for deterministic leader generation ───────────────────────────

const MALE_FIRST = [
  'Aaron','Abel','Abraham','Adam','Adrian','Albert','Alex','Alfred','Allan','Alvin',
  'Andrew','Anthony','Arthur','Austin','Bernard','Brian','Bruce','Calvin','Charles','Chanda',
  'Chansa','Chester','Christopher','Clement','Collins','Daniel','David','Dennis','Derek','Donald',
  'Douglas','Duncan','Edmund','Edward','Elias','Emmanuel','Eric','Ernest','Evans','Felix',
  'Francis','Frank','Fred','Gabriel','George','Gerald','Gift','Given','Gordon','Gregory',
  'Harrison','Henry','Herbert','Isaac','Jacob','James','Jason','Jeffrey','Jerome','Joel',
  'John','Jonathan','Joseph','Joshua','Julius','Justin','Kennedy','Kevin','Lawrence','Leonard',
  'Lovemore','Luckson','Luke','Mark','Martin','Maxwell','Michael','Miles','Moses','Nathan',
  'Nelson','Nicholas','Noah','Oliver','Oscar','Patrick','Paul','Peter','Philip','Raymond',
  'Richard','Robert','Ronald','Samuel','Simon','Solomon','Stanley','Stephen','Steven','Timothy',
  'Thomas','Trevor','Victor','Vincent','Walter','Warren','Wesley','William','Wilson','Xavier',
];

const FEMALE_FIRST = [
  'Agnes','Alice','Alicia','Amanda','Amy','Anastasia','Angela','Anita','Ann','Anna',
  'Beatrice','Bertha','Bridget','Catherine','Charity','Chisomo','Christine','Clara','Claudia','Cynthia',
  'Daisy','Dina','Doreen','Dorothy','Edith','Elsie','Emily','Emma','Esther','Eunice',
  'Evelyn','Faith','Florence','Francisca','Gloria','Grace','Harriet','Helen','Hope','Irene',
  'Ivy','Jane','Janet','Jennifer','Jessica','Josephine','Joyce','Judith','Julia','Juliet',
  'Karen','Lilian','Linda','Lisa','Lucy','Lydia','Maggie','Martha','Mary','Maureen',
  'Memory','Mercy','Michelle','Monica','Mutinta','Natasha','Nelly','Ngosa','Nicole','Nomsa',
  'Olive','Pamela','Patricia','Pauline','Penelope','Precious','Rebecca','Regina','Rose','Ruth',
  'Sarah','Sharon','Sheila','Stella','Susan','Sylvia','Theresa','Tracey','Veronica','Victoria',
  'Virginia','Vivian','Winifred','Yvonne','Zelda','Zindaba','Zona','Zuwena','Aida','Brenda',
];

const SURNAMES = [
  'Banda','Bwalya','Chanda','Changala','Chibale','Chibuye','Chifunda','Chikwanda','Chila','Chiluba',
  'Chimba','Chimbwali','Chisanga','Chisonta','Chivunda','Daka','Dlamini','Gondwe','Hamonga','Hapunda',
  'Imasiku','Imbuwa','Kabwe','Kafwanka','Kalaba','Kalisa','Kamanga','Kangombe','Kapata','Kapembwa',
  'Kaunda','Kawana','Kayumba','Kazembe','Kayekesi','Lungu','Lupupa','Lusaka','Lushinga','Lwaanga',
  'Mabenga','Maimbolwa','Makumba','Malama','Manda','Masumba','Mataka','Mbewe','Miyanda','Moonga',
  'Mpundu','Msiska','Mudenda','Mulenga','Mulilo','Mumba','Mupeta','Mwale','Mwamba','Mwanakatwe',
  'Mwanawasa','Mweemba','Mwewa','Mwinga','Ngoma','Ngosa','Nkonde','Nkoya','Nkumbula','Nsingo',
  'Patel','Phiri','Sakala','Sata','Shawa','Simumba','Simuchembe','Sikazwe','Simukonda','Sitwala',
  'Siwale','Tembo','Thole','Wamunyima','Wasama','Witola','Yamba','Zaloumis','Zulu','Zimba',
];

const PHOTO_M = [
  'photo-1507003211169-0a1dd7228f2d','photo-1472099645785-5658abf4ff4e','photo-1560250097-0b93528c311a',
  'photo-1539571696357-5a69c17a67c6','photo-1506794778202-cad84cf45f1d','photo-1492562080023-ab3db95bfbce',
  'photo-1500648767791-00dcc994a43e','photo-1519085360753-af0119f7cbe7','photo-1557862921-37829c790f19',
  'photo-1534528741775-53994a69daeb',
];

const PHOTO_F = [
  'photo-1573496359142-b8d87734a5a2','photo-1438761681033-6461ffad8d80','photo-1487412720507-e7ab37603c6f',
  'photo-1580489944761-15a19d654956','photo-1552058544-f2b08422138a','photo-1542190891-2093d38760f2',
  'photo-1504593811423-6dd665756598','photo-1594744803329-e58b31de8bf5','photo-1573497019940-1c28c88b4f3e',
  'photo-1517841905240-472988babdf9',
];

function pick<T>(arr: T[], seed: number): T {
  return arr[Math.abs(seed) % arr.length];
}

export interface BranchLeader {
  name: string;
  position: string;
  description: string;
  image: string;
}

export function getBranchLeaders(wardId: string): BranchLeader[] {
  let seed = 0;
  for (let i = 0; i < wardId.length; i++) {
    seed = (seed * 31 + wardId.charCodeAt(i)) >>> 0;
  }
  const s = (offset: number) => (seed + offset * 7919) >>> 0;
  const mName  = (o: number) => `${pick(MALE_FIRST,   s(o))} ${pick(SURNAMES, s(o + 13))}`;
  const fName  = (o: number) => `${pick(FEMALE_FIRST, s(o))} ${pick(SURNAMES, s(o + 17))}`;
  const mPhoto = (o: number) => `https://images.unsplash.com/${pick(PHOTO_M, s(o))}?w=400&h=500&fit=crop&auto=format`;
  const fPhoto = (o: number) => `https://images.unsplash.com/${pick(PHOTO_F, s(o))}?w=400&h=500&fit=crop&auto=format`;

  return [
    { name: mName(0), position: 'Branch Chairperson',        description: 'Presides over all Branch General Meetings and Branch Executive Committee meetings. Represents the party in the local community and coordinates with district structures.',          image: mPhoto(0) },
    { name: fName(1), position: 'Deputy Branch Chairperson', description: 'Assists the Branch Chairperson in all leadership duties. Acts as Chairperson when absent and oversees specific portfolios and local community programmes.',                          image: fPhoto(1) },
    { name: mName(2), position: 'Branch Secretary',          description: 'Manages day-to-day administrative duties of the branch. Records and circulates minutes, maintains the membership register, and coordinates communication with the district secretary.', image: mPhoto(2) },
    { name: fName(3), position: 'Deputy Branch Secretary',   description: 'Assists the Branch Secretary in all administrative and clerical duties. Helps maintain membership records and supports coordination of branch activities.',                           image: fPhoto(3) },
    { name: mName(4), position: 'Branch Treasurer',          description: 'Manages all branch funds, collections, and financial transactions. Collects membership subscriptions, prepares financial statements, and oversees local fundraising initiatives.',       image: mPhoto(4) },
    { name: fName(5), position: 'Deputy Branch Treasurer',   description: 'Assists the Branch Treasurer in managing financial activities. Supports collection and recording of membership subscriptions and helps prepare financial reports.',                       image: fPhoto(5) },
    { name: mName(6), position: 'Youth Coordinator',         description: 'Engages young people in branch activities, community service, and political participation. Supports member recruitment and retention among the youth in the ward.',                      image: mPhoto(6) },
    { name: fName(7), position: 'Women Coordinator',         description: "Supports women members and promotes gender equality in the community. Coordinates women's programmes and advocacy initiatives at the branch level.",                                     image: fPhoto(7) },
  ];
}

// ── Real hierarchy, sourced from the ECZ register ────────────────────────────
// Previously this file generated placeholder ward names (e.g. "Katuba
// Central Ward") and a hand-typed constituency list that didn't match the
// real ECZ hierarchy in several places (missing constituencies, wrong
// province/district mappings). It's now derived directly from
// `../data/mockData`, which is auto-generated from ECZ's own report
// (rptPDListing20260508.md) and carries the real names and IDs for every
// province, district, constituency, and ward — 10 / 116 / 226 / 1,858,
// matching ECZ's published counts exactly.


function buildHierarchy(): ZambiaProvince[] {
  return eczProvinces.map(p => ({
    name: p.name,
    districts: p.districts.map(d => ({
      name: d.name,
      provinceName: p.name,
      constituencies: d.constituencies.map(c => ({
        id: c.id,
        name: c.name,
        districtName: d.name,
        provinceName: p.name,
        wards: c.wards.map(w => ({
          id: w.id,
          name: w.name,
          constituencyId: c.id,
          constituencyName: c.name,
          districtName: d.name,
          provinceName: p.name,
        })),
      })),
    })),
  }));
}

export const ZAMBIA_HIERARCHY: ZambiaProvince[] = buildHierarchy();

// ── Convenience helpers ────────────────────────────────────────────────────────

export function getProvinces(): string[] {
  return ZAMBIA_HIERARCHY.map(p => p.name);
}

export function getDistricts(provinceName: string): ZambiaDistrict[] {
  return ZAMBIA_HIERARCHY.find(p => p.name === provinceName)?.districts ?? [];
}

export function getConstituencies(provinceName: string, districtName: string): ZambiaConstituency[] {
  return getDistricts(provinceName).find(d => d.name === districtName)?.constituencies ?? [];
}

export function getWards(provinceName: string, districtName: string, constituencyId: string): ZambiaWard[] {
  return getConstituencies(provinceName, districtName).find(c => c.id === constituencyId)?.wards ?? [];
}

// ── Stats ──────────────────────────────────────────────────────────────────────

export function getWardStats() {
  let totalConstituencies = 0;
  let totalDistricts = 0;
  let totalWards = 0;
  for (const province of ZAMBIA_HIERARCHY) {
    totalDistricts += province.districts.length;
    for (const district of province.districts) {
      totalConstituencies += district.constituencies.length;
      for (const constituency of district.constituencies) {
        totalWards += constituency.wards.length;
      }
    }
  }
  return {
    provinces: ZAMBIA_HIERARCHY.length,
    districts: totalDistricts,
    constituencies: totalConstituencies,
    wards: totalWards,
  };
}
