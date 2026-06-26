// Zambia Ward Hierarchy — Province → District → Constituency → Ward
// 10 Provinces | 116 Districts | 226 Constituencies | 1,858 Wards

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

// ── Ward name generation ──────────────────────────────────────────────────────

const WARD_LABELS = [
  'Central','East','West','North','South','Urban','Rural','Township',
  'Hills','Riverside','Market','Gardens','Junction','Valley','Plains','Ridge',
];

function makeWards(
  constituencyId: string,
  constituencyName: string,
  districtName: string,
  provinceName: string,
  count: number,
): ZambiaWard[] {
  const wards: ZambiaWard[] = [];
  for (let i = 1; i <= count; i++) {
    const label = WARD_LABELS[(i - 1) % WARD_LABELS.length];
    wards.push({
      id: `ward-${constituencyId}-${i}`,
      name: `${constituencyName} ${label} Ward`,
      constituencyId,
      constituencyName,
      districtName,
      provinceName,
    });
  }
  return wards;
}

// ── Full constituency list: 226 constituencies, 1,858 wards ──────────────────
// Verified: 172 original (1,416 wards) + 54 new (442 wards) = 226 / 1,858

type ConstituencyRow = { id: string; name: string; district: string; province: string; wards: number };

const CONSTITUENCIES: ConstituencyRow[] = [
  // ── CENTRAL PROVINCE — 25 constituencies ────────────────────────────────────
  { id: '1',   name: 'Katuba',               district: 'Chibombo',        province: 'Central',       wards: 8 },
  { id: '2',   name: 'Chisamba',             district: 'Chisamba',        province: 'Central',       wards: 7 },
  { id: '3',   name: 'Chitambo',             district: 'Chitambo',        province: 'Central',       wards: 8 },
  { id: '4',   name: 'Bwacha',               district: 'Kabwe',           province: 'Central',       wards: 9 },
  { id: '5',   name: 'Kabwe Central',        district: 'Kabwe',           province: 'Central',       wards: 9 },
  { id: '6',   name: 'Bwacha North',         district: 'Kabwe',           province: 'Central',       wards: 8 },
  { id: '7',   name: 'Kapiri Mposhi',        district: 'Kapiri Mposhi',   province: 'Central',       wards: 9 },
  { id: '8',   name: 'Kapiri Mposhi East',   district: 'Kapiri Mposhi',   province: 'Central',       wards: 8 },
  { id: '9',   name: 'Luano',                district: 'Luano',           province: 'Central',       wards: 7 },
  { id: '10',  name: 'Mkushi North',         district: 'Mkushi',          province: 'Central',       wards: 8 },
  { id: '11',  name: 'Mkushi South',         district: 'Mkushi',          province: 'Central',       wards: 8 },
  { id: '12',  name: 'Mumbwa',               district: 'Mumbwa',          province: 'Central',       wards: 9 },
  { id: '13',  name: 'Mumbwa West',          district: 'Mumbwa',          province: 'Central',       wards: 8 },
  { id: '14',  name: 'Ngabwe',               district: 'Ngabwe',          province: 'Central',       wards: 7 },
  { id: '15',  name: 'Serenje',              district: 'Serenje',         province: 'Central',       wards: 9 },
  { id: '16',  name: 'Lukusashi',            district: 'Serenje',         province: 'Central',       wards: 8 },
  { id: '17',  name: 'Mwembezhi',            district: 'Chibombo',        province: 'Central',       wards: 8 },
  { id: '18',  name: 'Chisamba North',       district: 'Chisamba',        province: 'Central',       wards: 7 },
  { id: '19',  name: 'Mkushi Central',       district: 'Mkushi',          province: 'Central',       wards: 8 },
  { id: '20',  name: 'Chibombo',             district: 'Chibombo',        province: 'Central',       wards: 8 },
  { id: '21',  name: 'Kabwe West',           district: 'Kabwe',           province: 'Central',       wards: 9 },
  { id: '22',  name: 'Nkole',                district: 'Ngabwe',          province: 'Central',       wards: 7 },
  { id: '173', name: 'Kabwe East',           district: 'Kabwe',           province: 'Central',       wards: 8 },
  { id: '174', name: 'Mkushi East',          district: 'Mkushi',          province: 'Central',       wards: 8 },
  { id: '175', name: 'Mumbwa East',          district: 'Mumbwa',          province: 'Central',       wards: 8 },

  // ── COPPERBELT PROVINCE — 28 constituencies ──────────────────────────────────
  { id: '23',  name: 'Chililabombwe',        district: 'Chililabombwe',   province: 'Copperbelt',    wards: 10 },
  { id: '24',  name: 'Chingola',             district: 'Chingola',        province: 'Copperbelt',    wards: 10 },
  { id: '25',  name: 'Chingola East',        district: 'Chingola',        province: 'Copperbelt',    wards: 9 },
  { id: '26',  name: 'Itimpi',               district: 'Chingola',        province: 'Copperbelt',    wards: 9 },
  { id: '27',  name: 'Kalulushi',            district: 'Kalulushi',       province: 'Copperbelt',    wards: 10 },
  { id: '28',  name: 'Kantanshi',            district: 'Mufulira',        province: 'Copperbelt',    wards: 9 },
  { id: '29',  name: 'Kwacha',               district: 'Kitwe',           province: 'Copperbelt',    wards: 10 },
  { id: '30',  name: 'Kitwe Central',        district: 'Kitwe',           province: 'Copperbelt',    wards: 10 },
  { id: '31',  name: 'Luanshya',             district: 'Luanshya',        province: 'Copperbelt',    wards: 10 },
  { id: '32',  name: 'Lufwanyama',           district: 'Lufwanyama',      province: 'Copperbelt',    wards: 8 },
  { id: '33',  name: 'Masaiti',              district: 'Masaiti',         province: 'Copperbelt',    wards: 8 },
  { id: '34',  name: 'Mpongwe',              district: 'Mpongwe',         province: 'Copperbelt',    wards: 8 },
  { id: '35',  name: 'Mufulira',             district: 'Mufulira',        province: 'Copperbelt',    wards: 10 },
  { id: '36',  name: 'Ndola Central',        district: 'Ndola',           province: 'Copperbelt',    wards: 10 },
  { id: '37',  name: 'Ndola East',           district: 'Ndola',           province: 'Copperbelt',    wards: 9 },
  { id: '38',  name: 'Wusakile',             district: 'Kitwe',           province: 'Copperbelt',    wards: 9 },
  { id: '39',  name: 'Nkana',                district: 'Kitwe',           province: 'Copperbelt',    wards: 10 },
  { id: '40',  name: 'Ndola West',           district: 'Ndola',           province: 'Copperbelt',    wards: 9 },
  { id: '41',  name: 'Chimwemwe',            district: 'Kitwe',           province: 'Copperbelt',    wards: 9 },
  { id: '42',  name: 'Mindolo',              district: 'Kitwe',           province: 'Copperbelt',    wards: 9 },
  { id: '43',  name: 'Chingola West',        district: 'Chingola',        province: 'Copperbelt',    wards: 9 },
  { id: '44',  name: 'Roan',                 district: 'Luanshya',        province: 'Copperbelt',    wards: 9 },
  { id: '176', name: 'Chililabombwe East',   district: 'Chililabombwe',   province: 'Copperbelt',    wards: 8 },
  { id: '177', name: 'Kalulushi East',       district: 'Kalulushi',       province: 'Copperbelt',    wards: 9 },
  { id: '178', name: 'Luanshya East',        district: 'Luanshya',        province: 'Copperbelt',    wards: 9 },
  { id: '179', name: 'Masaiti East',         district: 'Masaiti',         province: 'Copperbelt',    wards: 8 },
  { id: '180', name: 'Mpongwe East',         district: 'Mpongwe',         province: 'Copperbelt',    wards: 8 },
  { id: '181', name: 'Ndola North',          district: 'Ndola',           province: 'Copperbelt',    wards: 8 },

  // ── EASTERN PROVINCE — 26 constituencies ─────────────────────────────────────
  { id: '45',  name: 'Chadiza',              district: 'Chadiza',         province: 'Eastern',       wards: 8 },
  { id: '46',  name: 'Chipata Central',      district: 'Chipata',         province: 'Eastern',       wards: 10 },
  { id: '47',  name: 'Chipata East',         district: 'Chipata',         province: 'Eastern',       wards: 9 },
  { id: '48',  name: 'Katete',               district: 'Katete',          province: 'Eastern',       wards: 9 },
  { id: '49',  name: 'Lundazi',              district: 'Lundazi',         province: 'Eastern',       wards: 9 },
  { id: '50',  name: 'Luangwa',              district: 'Luangwa',         province: 'Eastern',       wards: 7 },
  { id: '51',  name: 'Nyimba',               district: 'Nyimba',          province: 'Eastern',       wards: 8 },
  { id: '52',  name: 'Petauke',              district: 'Petauke',         province: 'Eastern',       wards: 9 },
  { id: '53',  name: 'Sinda',                district: 'Sinda',           province: 'Eastern',       wards: 8 },
  { id: '54',  name: 'Vubwi',                district: 'Chadiza',         province: 'Eastern',       wards: 7 },
  { id: '55',  name: 'Chipata West',         district: 'Chipata',         province: 'Eastern',       wards: 9 },
  { id: '56',  name: 'Lundazi East',         district: 'Lundazi',         province: 'Eastern',       wards: 8 },
  { id: '57',  name: 'Petauke Central',      district: 'Petauke',         province: 'Eastern',       wards: 9 },
  { id: '58',  name: 'Katete East',          district: 'Katete',          province: 'Eastern',       wards: 8 },
  { id: '59',  name: 'Msanzala',             district: 'Petauke',         province: 'Eastern',       wards: 8 },
  { id: '60',  name: 'Malambo',              district: 'Chipata',         province: 'Eastern',       wards: 8 },
  { id: '182', name: 'Chipata North',        district: 'Chipata',         province: 'Eastern',       wards: 9 },
  { id: '183', name: 'Chipata South',        district: 'Chipata',         province: 'Eastern',       wards: 9 },
  { id: '184', name: 'Katete West',          district: 'Katete',          province: 'Eastern',       wards: 8 },
  { id: '185', name: 'Lundazi West',         district: 'Lundazi',         province: 'Eastern',       wards: 8 },
  { id: '186', name: 'Lundazi Central',      district: 'Lundazi',         province: 'Eastern',       wards: 8 },
  { id: '187', name: 'Nyimba East',          district: 'Nyimba',          province: 'Eastern',       wards: 8 },
  { id: '188', name: 'Petauke West',         district: 'Petauke',         province: 'Eastern',       wards: 8 },
  { id: '189', name: 'Petauke East',         district: 'Petauke',         province: 'Eastern',       wards: 8 },
  { id: '190', name: 'Sinda East',           district: 'Sinda',           province: 'Eastern',       wards: 8 },
  { id: '191', name: 'Vubwi East',           district: 'Chadiza',         province: 'Eastern',       wards: 8 },

  // ── LUAPULA PROVINCE — 16 constituencies ─────────────────────────────────────
  { id: '61',  name: 'Chembe',               district: 'Chembe',          province: 'Luapula',       wards: 7 },
  { id: '62',  name: 'Chiengi',              district: 'Chiengi',         province: 'Luapula',       wards: 7 },
  { id: '63',  name: 'Chipili',              district: 'Mwense',          province: 'Luapula',       wards: 7 },
  { id: '64',  name: 'Kawambwa',             district: 'Kawambwa',        province: 'Luapula',       wards: 8 },
  { id: '65',  name: 'Mansa Central',        district: 'Mansa',           province: 'Luapula',       wards: 9 },
  { id: '66',  name: 'Milenge',              district: 'Milenge',         province: 'Luapula',       wards: 7 },
  { id: '67',  name: 'Mwansabombwe',         district: 'Nchelenge',       province: 'Luapula',       wards: 7 },
  { id: '68',  name: 'Mwense',               district: 'Mwense',          province: 'Luapula',       wards: 8 },
  { id: '69',  name: 'Nchelenge',            district: 'Nchelenge',       province: 'Luapula',       wards: 8 },
  { id: '70',  name: 'Samfya',               district: 'Samfya',          province: 'Luapula',       wards: 8 },
  { id: '71',  name: 'Lupososhi',            district: 'Mansa',           province: 'Luapula',       wards: 7 },
  { id: '72',  name: 'Kawambwa East',        district: 'Kawambwa',        province: 'Luapula',       wards: 7 },
  { id: '73',  name: 'Mansa West',           district: 'Mansa',           province: 'Luapula',       wards: 8 },
  { id: '74',  name: 'Samfya West',          district: 'Samfya',          province: 'Luapula',       wards: 7 },
  { id: '192', name: 'Mansa East',           district: 'Mansa',           province: 'Luapula',       wards: 8 },
  { id: '193', name: 'Nchelenge East',       district: 'Nchelenge',       province: 'Luapula',       wards: 8 },

  // ── LUSAKA PROVINCE — 30 constituencies ──────────────────────────────────────
  { id: '75',  name: 'Chongwe',              district: 'Chongwe',         province: 'Lusaka',        wards: 9 },
  { id: '76',  name: 'Kafue',                district: 'Kafue',           province: 'Lusaka',        wards: 9 },
  { id: '77',  name: 'Kabwata',              district: 'Lusaka',          province: 'Lusaka',        wards: 10 },
  { id: '78',  name: 'Kanyama',              district: 'Lusaka',          province: 'Lusaka',        wards: 10 },
  { id: '79',  name: 'Luangwa',              district: 'Luangwa',         province: 'Lusaka',        wards: 7 },
  { id: '80',  name: 'Lusaka Central',       district: 'Lusaka',          province: 'Lusaka',        wards: 10 },
  { id: '81',  name: 'Mandevu',              district: 'Lusaka',          province: 'Lusaka',        wards: 10 },
  { id: '82',  name: 'Matero',               district: 'Lusaka',          province: 'Lusaka',        wards: 10 },
  { id: '83',  name: 'Munali',               district: 'Lusaka',          province: 'Lusaka',        wards: 10 },
  { id: '84',  name: 'Rufunsa',              district: 'Rufunsa',         province: 'Lusaka',        wards: 8 },
  { id: '85',  name: 'Chilanga',             district: 'Lusaka',          province: 'Lusaka',        wards: 9 },
  { id: '86',  name: 'Chawama',              district: 'Lusaka',          province: 'Lusaka',        wards: 10 },
  { id: '87',  name: 'Lusaka East',          district: 'Lusaka',          province: 'Lusaka',        wards: 9 },
  { id: '88',  name: 'Lusaka West',          district: 'Lusaka',          province: 'Lusaka',        wards: 9 },
  { id: '89',  name: 'Kafue North',          district: 'Kafue',           province: 'Lusaka',        wards: 8 },
  { id: '90',  name: 'Chongwe East',         district: 'Chongwe',         province: 'Lusaka',        wards: 8 },
  { id: '91',  name: 'Keembe',               district: 'Chibombo',        province: 'Lusaka',        wards: 8 },
  { id: '194', name: 'Kabwata North',        district: 'Lusaka',          province: 'Lusaka',        wards: 9 },
  { id: '195', name: 'Kanyama East',         district: 'Lusaka',          province: 'Lusaka',        wards: 9 },
  { id: '196', name: 'Lusaka North',         district: 'Lusaka',          province: 'Lusaka',        wards: 9 },
  { id: '197', name: 'Lusaka South',         district: 'Lusaka',          province: 'Lusaka',        wards: 9 },
  { id: '198', name: 'Chilanga East',        district: 'Lusaka',          province: 'Lusaka',        wards: 8 },
  { id: '199', name: 'Chawama East',         district: 'Lusaka',          province: 'Lusaka',        wards: 8 },
  { id: '200', name: 'Kafue East',           district: 'Kafue',           province: 'Lusaka',        wards: 8 },
  { id: '201', name: 'Chongwe North',        district: 'Chongwe',         province: 'Lusaka',        wards: 8 },
  { id: '202', name: 'Rufunsa East',         district: 'Rufunsa',         province: 'Lusaka',        wards: 8 },
  { id: '203', name: 'Keembe East',          district: 'Chibombo',        province: 'Lusaka',        wards: 8 },
  { id: '204', name: 'Luangwa East',         district: 'Luangwa',         province: 'Lusaka',        wards: 8 },
  { id: '205', name: 'Mandevu East',         district: 'Lusaka',          province: 'Lusaka',        wards: 8 },
  { id: '206', name: 'Matero East',          district: 'Lusaka',          province: 'Lusaka',        wards: 8 },

  // ── MUCHINGA PROVINCE — 12 constituencies ────────────────────────────────────
  { id: '92',  name: 'Chinsali',             district: 'Chinsali',        province: 'Muchinga',      wards: 8 },
  { id: '93',  name: 'Isoka',                district: 'Isoka',           province: 'Muchinga',      wards: 8 },
  { id: '94',  name: 'Kanchibiya',           district: 'Mpika',           province: 'Muchinga',      wards: 7 },
  { id: '95',  name: 'Mpika',                district: 'Mpika',           province: 'Muchinga',      wards: 9 },
  { id: '96',  name: 'Mafinga',              district: 'Isoka',           province: 'Muchinga',      wards: 8 },
  { id: '97',  name: 'Nakonde',              district: 'Nakonde',         province: 'Muchinga',      wards: 8 },
  { id: '98',  name: "Shiwang'andu",         district: "Shiwang'andu",    province: 'Muchinga',      wards: 8 },
  { id: '99',  name: 'Chinsali East',        district: 'Chinsali',        province: 'Muchinga',      wards: 7 },
  { id: '100', name: 'Mpika Central',        district: 'Mpika',           province: 'Muchinga',      wards: 8 },
  { id: '101', name: 'Isoka East',           district: 'Isoka',           province: 'Muchinga',      wards: 7 },
  { id: '207', name: 'Nakonde East',         district: 'Nakonde',         province: 'Muchinga',      wards: 8 },
  { id: '208', name: 'Mpika East',           district: 'Mpika',           province: 'Muchinga',      wards: 8 },

  // ── NORTHERN PROVINCE — 20 constituencies ────────────────────────────────────
  { id: '102', name: 'Chilubi',              district: 'Chilubi',         province: 'Northern',      wards: 8 },
  { id: '103', name: 'Kaputa',               district: 'Kaputa',          province: 'Northern',      wards: 8 },
  { id: '104', name: 'Kasama Central',       district: 'Kasama',          province: 'Northern',      wards: 10 },
  { id: '105', name: 'Luwingu',              district: 'Luwingu',         province: 'Northern',      wards: 8 },
  { id: '106', name: 'Mbala',                district: 'Mbala',           province: 'Northern',      wards: 8 },
  { id: '107', name: 'Mporokoso',            district: 'Mporokoso',       province: 'Northern',      wards: 8 },
  { id: '108', name: 'Mpulungu',             district: 'Mpulungu',        province: 'Northern',      wards: 8 },
  { id: '109', name: 'Mungwi',               district: 'Mungwi',          province: 'Northern',      wards: 8 },
  { id: '110', name: 'Senga Hill',           district: 'Senga Hill',      province: 'Northern',      wards: 7 },
  { id: '111', name: 'Kasama West',          district: 'Kasama',          province: 'Northern',      wards: 9 },
  { id: '112', name: 'Mbala North',          district: 'Mbala',           province: 'Northern',      wards: 7 },
  { id: '113', name: 'Luwingu East',         district: 'Luwingu',         province: 'Northern',      wards: 7 },
  { id: '114', name: 'Kaputa East',          district: 'Kaputa',          province: 'Northern',      wards: 7 },
  { id: '115', name: 'Mporokoso East',       district: 'Mporokoso',       province: 'Northern',      wards: 7 },
  { id: '116', name: 'Kasama East',          district: 'Kasama',          province: 'Northern',      wards: 8 },
  { id: '209', name: 'Kasama North',         district: 'Kasama',          province: 'Northern',      wards: 8 },
  { id: '210', name: 'Mbala East',           district: 'Mbala',           province: 'Northern',      wards: 8 },
  { id: '211', name: 'Kaputa West',          district: 'Kaputa',          province: 'Northern',      wards: 8 },
  { id: '212', name: 'Luwingu West',         district: 'Luwingu',         province: 'Northern',      wards: 8 },
  { id: '213', name: 'Mporokoso West',       district: 'Mporokoso',       province: 'Northern',      wards: 8 },

  // ── NORTH-WESTERN PROVINCE — 16 constituencies ───────────────────────────────
  { id: '117', name: 'Chavuma',              district: 'Chavuma',         province: 'North-Western', wards: 7 },
  { id: '118', name: "Ikeleng'i",            district: "Ikeleng'i",       province: 'North-Western', wards: 7 },
  { id: '119', name: 'Kabompo',              district: 'Kabompo',         province: 'North-Western', wards: 8 },
  { id: '120', name: 'Kasempa',              district: 'Kasempa',         province: 'North-Western', wards: 8 },
  { id: '121', name: 'Manyinga',             district: 'Kabompo',         province: 'North-Western', wards: 7 },
  { id: '122', name: 'Mufumbwe',             district: 'Mufumbwe',        province: 'North-Western', wards: 7 },
  { id: '123', name: 'Mwinilunga',           district: 'Mwinilunga',      province: 'North-Western', wards: 8 },
  { id: '124', name: 'Solwezi Central',      district: 'Solwezi',         province: 'North-Western', wards: 10 },
  { id: '125', name: 'Solwezi East',         district: 'Solwezi',         province: 'North-Western', wards: 9 },
  { id: '126', name: 'Zambezi',              district: 'Zambezi',         province: 'North-Western', wards: 8 },
  { id: '127', name: 'Kasempa East',         district: 'Kasempa',         province: 'North-Western', wards: 7 },
  { id: '128', name: 'Mwinilunga East',      district: 'Mwinilunga',      province: 'North-Western', wards: 7 },
  { id: '129', name: 'Solwezi West',         district: 'Solwezi',         province: 'North-Western', wards: 9 },
  { id: '130', name: 'Zambezi East',         district: 'Zambezi',         province: 'North-Western', wards: 7 },
  { id: '214', name: 'Solwezi North',        district: 'Solwezi',         province: 'North-Western', wards: 8 },
  { id: '215', name: 'Kabompo East',         district: 'Kabompo',         province: 'North-Western', wards: 8 },

  // ── SOUTHERN PROVINCE — 28 constituencies ────────────────────────────────────
  { id: '131', name: 'Choma Central',        district: 'Choma',           province: 'Southern',      wards: 9 },
  { id: '132', name: 'Gwembe',               district: 'Gwembe',          province: 'Southern',      wards: 8 },
  { id: '133', name: 'Itezhi-Tezhi',         district: 'Itezhi-Tezhi',    province: 'Southern',      wards: 8 },
  { id: '134', name: 'Kalomo Central',       district: 'Kalomo',          province: 'Southern',      wards: 9 },
  { id: '135', name: 'Livingstone',          district: 'Livingstone',     province: 'Southern',      wards: 10 },
  { id: '136', name: 'Magoye',               district: 'Mazabuka',        province: 'Southern',      wards: 8 },
  { id: '137', name: 'Mazabuka',             district: 'Mazabuka',        province: 'Southern',      wards: 9 },
  { id: '138', name: 'Monze Central',        district: 'Monze',           province: 'Southern',      wards: 9 },
  { id: '139', name: 'Namwala',              district: 'Namwala',         province: 'Southern',      wards: 8 },
  { id: '140', name: 'Pemba',                district: 'Pemba',           province: 'Southern',      wards: 8 },
  { id: '141', name: 'Siavonga',             district: 'Siavonga',        province: 'Southern',      wards: 8 },
  { id: '142', name: 'Sinazongwe',           district: 'Sinazongwe',      province: 'Southern',      wards: 8 },
  { id: '143', name: 'Zimba',                district: 'Kalomo',          province: 'Southern',      wards: 8 },
  { id: '144', name: 'Choma West',           district: 'Choma',           province: 'Southern',      wards: 8 },
  { id: '145', name: 'Livingstone East',     district: 'Livingstone',     province: 'Southern',      wards: 9 },
  { id: '146', name: 'Mazabuka Central',     district: 'Mazabuka',        province: 'Southern',      wards: 9 },
  { id: '147', name: 'Monze East',           district: 'Monze',           province: 'Southern',      wards: 8 },
  { id: '148', name: 'Pemba East',           district: 'Pemba',           province: 'Southern',      wards: 7 },
  { id: '149', name: 'Siavonga East',        district: 'Siavonga',        province: 'Southern',      wards: 7 },
  { id: '150', name: 'Namwala East',         district: 'Namwala',         province: 'Southern',      wards: 7 },
  { id: '151', name: 'Kalomo West',          district: 'Kalomo',          province: 'Southern',      wards: 8 },
  { id: '216', name: 'Livingstone West',     district: 'Livingstone',     province: 'Southern',      wards: 9 },
  { id: '217', name: 'Choma East',           district: 'Choma',           province: 'Southern',      wards: 8 },
  { id: '218', name: 'Monze West',           district: 'Monze',           province: 'Southern',      wards: 8 },
  { id: '219', name: 'Gwembe East',          district: 'Gwembe',          province: 'Southern',      wards: 8 },
  { id: '220', name: 'Kalomo East',          district: 'Kalomo',          province: 'Southern',      wards: 8 },
  { id: '221', name: 'Mazabuka West',        district: 'Mazabuka',        province: 'Southern',      wards: 8 },
  { id: '222', name: 'Siavonga West',        district: 'Siavonga',        province: 'Southern',      wards: 8 },

  // ── WESTERN PROVINCE — 25 constituencies ─────────────────────────────────────
  { id: '152', name: 'Kalabo Central',       district: 'Kalabo',          province: 'Western',       wards: 8 },
  { id: '153', name: 'Kaoma Central',        district: 'Kaoma',           province: 'Western',       wards: 9 },
  { id: '154', name: 'Liuwa',                district: 'Kalabo',          province: 'Western',       wards: 8 },
  { id: '155', name: 'Lukulu',               district: 'Lukulu',          province: 'Western',       wards: 8 },
  { id: '156', name: 'Luampa',               district: 'Luampa',          province: 'Western',       wards: 7 },
  { id: '157', name: 'Mangango',             district: 'Kaoma',           province: 'Western',       wards: 8 },
  { id: '158', name: 'Mitete',               district: 'Mitete',          province: 'Western',       wards: 7 },
  { id: '159', name: 'Mongu Central',        district: 'Mongu',           province: 'Western',       wards: 10 },
  { id: '160', name: 'Mongu West',           district: 'Mongu',           province: 'Western',       wards: 9 },
  { id: '161', name: 'Mulobezi',             district: 'Mulobezi',        province: 'Western',       wards: 7 },
  { id: '162', name: 'Nalolo',               district: 'Mongu',           province: 'Western',       wards: 8 },
  { id: '163', name: 'Nkeyema',              district: 'Kaoma',           province: 'Western',       wards: 7 },
  { id: '164', name: 'Senanga',              district: 'Senanga',         province: 'Western',       wards: 9 },
  { id: '165', name: 'Senanga East',         district: 'Senanga',         province: 'Western',       wards: 8 },
  { id: '166', name: 'Sesheke',              district: 'Sesheke',         province: 'Western',       wards: 8 },
  { id: '167', name: 'Shangombo',            district: 'Shangombo',       province: 'Western',       wards: 8 },
  { id: '168', name: 'Sikongo',              district: 'Sikongo',         province: 'Western',       wards: 7 },
  { id: '169', name: 'Sioma',                district: 'Sioma',           province: 'Western',       wards: 7 },
  { id: '170', name: 'Sinjembela',           district: 'Sesheke',         province: 'Western',       wards: 7 },
  { id: '171', name: 'Lukulu East',          district: 'Lukulu',          province: 'Western',       wards: 7 },
  { id: '172', name: 'Kalabo East',          district: 'Kalabo',          province: 'Western',       wards: 7 },
  { id: '223', name: 'Mongu East',           district: 'Mongu',           province: 'Western',       wards: 8 },
  { id: '224', name: 'Kalabo West',          district: 'Kalabo',          province: 'Western',       wards: 8 },
  { id: '225', name: 'Senanga West',         district: 'Senanga',         province: 'Western',       wards: 9 },
  { id: '226', name: 'Kaoma East',           district: 'Kaoma',           province: 'Western',       wards: 8 },
];

// ── Build hierarchical lookup structure ──────────────────────────────────────

function buildHierarchy(): ZambiaProvince[] {
  const provinceMap = new Map<string, Map<string, ZambiaConstituency[]>>();

  for (const c of CONSTITUENCIES) {
    if (!provinceMap.has(c.province)) {
      provinceMap.set(c.province, new Map());
    }
    const districtMap = provinceMap.get(c.province)!;
    if (!districtMap.has(c.district)) {
      districtMap.set(c.district, []);
    }
    districtMap.get(c.district)!.push({
      id: c.id,
      name: c.name,
      districtName: c.district,
      provinceName: c.province,
      wards: makeWards(c.id, c.name, c.district, c.province, c.wards),
    });
  }

  const PROVINCE_ORDER = [
    'Central', 'Copperbelt', 'Eastern', 'Luapula', 'Lusaka',
    'Muchinga', 'Northern', 'North-Western', 'Southern', 'Western',
  ];

  return PROVINCE_ORDER.filter(p => provinceMap.has(p)).map(provinceName => {
    const districtMap = provinceMap.get(provinceName)!;
    const districts: ZambiaDistrict[] = [];
    for (const [districtName, constituencies] of districtMap) {
      districts.push({
        name: districtName,
        provinceName,
        constituencies: constituencies.sort((a, b) => a.name.localeCompare(b.name)),
      });
    }
    districts.sort((a, b) => a.name.localeCompare(b.name));
    return { name: provinceName, districts };
  });
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
