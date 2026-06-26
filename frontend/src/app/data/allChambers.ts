// Comprehensive Chamber of Commerce System for Zambia
// Generates 800+ chambers at ward, constituency, district, provincial, and national levels

export interface Chamber {
  id: string;
  name: string;
  location: string;
  wardId?: string;
  wardName?: string;
  constituencyId?: string;
  constituencyName?: string;
  districtName?: string;
  provinceId?: string;
  provinceName?: string;
  type: 'ward' | 'constituency' | 'district' | 'provincial' | 'national';
  established: string;
  memberBusinesses: number;
  contactEmail: string;
  contactPhone: string;
  website?: string;
  description: string;
  sector: string;
}

export interface InternshipProgram {
  id: string;
  chamberId: string;
  title: string;
  description: string;
  duration: string;
  positions: number;
  requirements: string[];
  benefits: string[];
  applicationDeadline?: string;
  status: 'open' | 'closed' | 'upcoming';
  sector: string;
}

// Sector mapping by province
const provinceSectors: Record<string, string[]> = {
  'Central': ['Agriculture', 'Business Development', 'Manufacturing', 'Livestock'],
  'Copperbelt': ['Mining', 'Manufacturing', 'Engineering', 'Trade'],
  'Eastern': ['Agriculture', 'Cross-border Trade', 'Tourism', 'Textiles'],
  'Luapula': ['Fishing', 'Agriculture', 'Tourism', 'Trade'],
  'Lusaka': ['Business Development', 'Technology', 'Finance', 'Retail'],
  'Muchinga': ['Agriculture', 'Forestry', 'Wildlife Management', 'Eco-tourism'],
  'Northern': ['Agriculture', 'Education', 'Healthcare', 'Forestry'],
  'North-western': ['Mining', 'Agriculture', 'Tourism', 'Forestry'],
  'Southern': ['Agriculture', 'Tourism', 'Livestock', 'Manufacturing'],
  'Western': ['Agriculture', 'Fishing', 'Tourism', 'Crafts']
};

// Ward name suffixes for variety
const wardSuffixes = ['Central', 'East', 'West', 'North', 'South', 'Urban', 'Rural'];

// Generate comprehensive chamber system
function generateChambers(): Chamber[] {
  const chambers: Chamber[] = [];
  let chamberIdCounter = 1;

  const constituencies = [
    // CENTRAL PROVINCE (22 constituencies)
    { id: '1', name: 'Katuba', district: 'Chibombo', province: 'Central', provinceId: '1', wardsCount: 4 },
    { id: '2', name: 'Chisamba', district: 'Chisamba', province: 'Central', provinceId: '1', wardsCount: 3 },
    { id: '3', name: 'Chitambo', district: 'Chitambo', province: 'Central', provinceId: '1', wardsCount: 3 },
    { id: '4', name: 'Bwacha North', district: 'Kabwe', province: 'Central', provinceId: '1', wardsCount: 4 },
    { id: '5', name: 'Kapiri Mposhi East', district: 'Kapiri Mposhi', province: 'Central', provinceId: '1', wardsCount: 4 },
    { id: '6', name: 'Luano', district: 'Luano', province: 'Central', provinceId: '1', wardsCount: 3 },
    { id: '7', name: 'Mkushi North', district: 'Mkushi', province: 'Central', provinceId: '1', wardsCount: 3 },
    { id: '8', name: 'Mumbwa Central', district: 'Mumbwa', province: 'Central', provinceId: '1', wardsCount: 4 },
    { id: '9', name: 'Lufubu', district: 'Ngabwe', province: 'Central', provinceId: '1', wardsCount: 3 },
    { id: '10', name: 'Lukusashi', district: 'Serenje', province: 'Central', provinceId: '1', wardsCount: 3 },
    { id: '11', name: 'Mwembezhi East', district: 'Chibombo', province: 'Central', provinceId: '1', wardsCount: 4 },
    { id: '12', name: 'Kabwe Central', district: 'Kabwe', province: 'Central', provinceId: '1', wardsCount: 5 },
    { id: '13', name: 'Kapiri Mposhi West', district: 'Kapiri Mposhi', province: 'Central', provinceId: '1', wardsCount: 3 },
    { id: '14', name: 'Mkushi South', district: 'Mkushi', province: 'Central', provinceId: '1', wardsCount: 3 },
    { id: '15', name: 'Mumbwa West', district: 'Mumbwa', province: 'Central', provinceId: '1', wardsCount: 4 },
    { id: '16', name: 'Serenje', district: 'Serenje', province: 'Central', provinceId: '1', wardsCount: 4 },
    { id: '17', name: 'Chisamba North', district: 'Chisamba', province: 'Central', provinceId: '1', wardsCount: 3 },
    { id: '18', name: 'Mkushi Central', district: 'Mkushi', province: 'Central', provinceId: '1', wardsCount: 3 },
    { id: '19', name: 'Bwacha', district: 'Kabwe', province: 'Central', provinceId: '1', wardsCount: 4 },
    { id: '20', name: 'Keembe', district: 'Chibombo', province: 'Central', provinceId: '1', wardsCount: 3 },
    { id: '21', name: 'Ngabwe', district: 'Ngabwe', province: 'Central', provinceId: '1', wardsCount: 3 },
    { id: '22', name: 'Itezhi Tezhi', district: 'Itezhi Tezhi', province: 'Central', provinceId: '1', wardsCount: 3 },

    // COPPERBELT PROVINCE (22 constituencies)
    { id: '23', name: 'Chililabombwe', district: 'Chililabombwe', province: 'Copperbelt', provinceId: '2', wardsCount: 4 },
    { id: '24', name: 'Chingola Central', district: 'Chingola', province: 'Copperbelt', provinceId: '2', wardsCount: 5 },
    { id: '25', name: 'Kalulushi', district: 'Kalulushi', province: 'Copperbelt', provinceId: '2', wardsCount: 4 },
    { id: '26', name: 'Chimwemwe', district: 'Kitwe', province: 'Copperbelt', provinceId: '2', wardsCount: 5 },
    { id: '27', name: 'Luanshya', district: 'Luanshya', province: 'Copperbelt', provinceId: '2', wardsCount: 4 },
    { id: '28', name: 'Lufwanyama West', district: 'Lufwanyama', province: 'Copperbelt', provinceId: '2', wardsCount: 3 },
    { id: '29', name: 'Kafulafuta', district: 'Luanshya', province: 'Copperbelt', provinceId: '2', wardsCount: 4 },
    { id: '30', name: 'Mpongwe West', district: 'Mpongwe', province: 'Copperbelt', provinceId: '2', wardsCount: 3 },
    { id: '31', name: 'Kankoyo', district: 'Mufulira', province: 'Copperbelt', provinceId: '2', wardsCount: 4 },
    { id: '32', name: 'Bwana Mkubwa', district: 'Ndola', province: 'Copperbelt', provinceId: '2', wardsCount: 5 },
    { id: '33', name: 'Nkana', district: 'Kitwe', province: 'Copperbelt', provinceId: '2', wardsCount: 5 },
    { id: '34', name: 'Chingola East', district: 'Chingola', province: 'Copperbelt', provinceId: '2', wardsCount: 4 },
    { id: '35', name: 'Masaiti Central', district: 'Masaiti', province: 'Copperbelt', provinceId: '2', wardsCount: 3 },
    { id: '36', name: 'Lufwanyama East', district: 'Lufwanyama', province: 'Copperbelt', provinceId: '2', wardsCount: 3 },
    { id: '37', name: 'Mufulira Central', district: 'Mufulira', province: 'Copperbelt', provinceId: '2', wardsCount: 4 },
    { id: '38', name: 'Ndola Central', district: 'Ndola', province: 'Copperbelt', provinceId: '2', wardsCount: 5 },
    { id: '39', name: 'Kitwe East', district: 'Kitwe', province: 'Copperbelt', provinceId: '2', wardsCount: 5 },
    { id: '40', name: 'Mpongwe East', district: 'Mpongwe', province: 'Copperbelt', provinceId: '2', wardsCount: 3 },
    { id: '41', name: 'Masaiti East', district: 'Masaiti', province: 'Copperbelt', provinceId: '2', wardsCount: 3 },
    { id: '42', name: 'Kabushi', district: 'Ndola', province: 'Copperbelt', provinceId: '2', wardsCount: 4 },
    { id: '43', name: 'Chifubu', district: 'Ndola', province: 'Copperbelt', provinceId: '2', wardsCount: 4 },
    { id: '44', name: 'Kwacha', district: 'Kitwe', province: 'Copperbelt', provinceId: '2', wardsCount: 4 },

    // EASTERN PROVINCE (18 constituencies)
    { id: '45', name: 'Chadiza West', district: 'Chadiza', province: 'Eastern', provinceId: '3', wardsCount: 3 },
    { id: '46', name: 'Chipata Central', district: 'Chipata', province: 'Eastern', provinceId: '3', wardsCount: 5 },
    { id: '47', name: 'Milanzi', district: 'Katete', province: 'Eastern', provinceId: '3', wardsCount: 3 },
    { id: '48', name: 'Lundazi', district: 'Lundazi', province: 'Eastern', provinceId: '3', wardsCount: 4 },
    { id: '49', name: 'Malambo East', district: 'Lundazi', province: 'Eastern', provinceId: '3', wardsCount: 3 },
    { id: '50', name: 'Nyimba South', district: 'Nyimba', province: 'Eastern', provinceId: '3', wardsCount: 3 },
    { id: '51', name: 'Kaumbwe', district: 'Petauke', province: 'Eastern', provinceId: '3', wardsCount: 4 },
    { id: '52', name: 'Kapoche', district: 'Mambwe', province: 'Eastern', provinceId: '3', wardsCount: 3 },
    { id: '53', name: 'Vubwi', district: 'Vubwi', province: 'Eastern', provinceId: '3', wardsCount: 3 },
    { id: '54', name: 'Chadiza East', district: 'Chadiza', province: 'Eastern', provinceId: '3', wardsCount: 3 },
    { id: '55', name: 'Chasefu', district: 'Chasefu', province: 'Eastern', provinceId: '3', wardsCount: 3 },
    { id: '56', name: 'Katete', district: 'Katete', province: 'Eastern', provinceId: '3', wardsCount: 4 },
    { id: '57', name: 'Petauke Central', district: 'Petauke', province: 'Eastern', provinceId: '3', wardsCount: 4 },
    { id: '58', name: 'Chipata East', district: 'Chipata', province: 'Eastern', provinceId: '3', wardsCount: 4 },
    { id: '59', name: 'Mambwe', district: 'Mambwe', province: 'Eastern', provinceId: '3', wardsCount: 3 },
    { id: '60', name: 'Nyimba North', district: 'Nyimba', province: 'Eastern', provinceId: '3', wardsCount: 3 },
    { id: '61', name: 'Lumezi', district: 'Lundazi', province: 'Eastern', provinceId: '3', wardsCount: 3 },
    { id: '62', name: 'Sinda', district: 'Sinda', province: 'Eastern', provinceId: '3', wardsCount: 3 },

    // LUAPULA PROVINCE (15 constituencies)
    { id: '63', name: 'Chembe', district: 'Nchelenge', province: 'Luapula', provinceId: '4', wardsCount: 3 },
    { id: '64', name: 'Mansa Central', district: 'Mansa', province: 'Luapula', provinceId: '4', wardsCount: 4 },
    { id: '65', name: 'Bangweulu', district: 'Samfya', province: 'Luapula', provinceId: '4', wardsCount: 3 },
    { id: '66', name: 'Chiengi', district: 'Chiengi', province: 'Luapula', provinceId: '4', wardsCount: 3 },
    { id: '67', name: 'Kawambwa', district: 'Kawambwa', province: 'Luapula', provinceId: '4', wardsCount: 4 },
    { id: '68', name: 'Luapula', district: 'Mansa', province: 'Luapula', provinceId: '4', wardsCount: 3 },
    { id: '69', name: 'Lunga', district: 'Lunga', province: 'Luapula', provinceId: '4', wardsCount: 3 },
    { id: '70', name: 'Milenge', district: 'Milenge', province: 'Luapula', provinceId: '4', wardsCount: 3 },
    { id: '71', name: 'Mwansabombwe', district: 'Mwansabombwe', province: 'Luapula', provinceId: '4', wardsCount: 3 },
    { id: '72', name: 'Mwense', district: 'Mwense', province: 'Luapula', provinceId: '4', wardsCount: 3 },
    { id: '73', name: 'Nchelenge', district: 'Nchelenge', province: 'Luapula', provinceId: '4', wardsCount: 4 },
    { id: '74', name: 'Samfya', district: 'Samfya', province: 'Luapula', provinceId: '4', wardsCount: 4 },
    { id: '75', name: 'Pambashe', district: 'Kawambwa', province: 'Luapula', provinceId: '4', wardsCount: 3 },
    { id: '76', name: 'Chipili', district: 'Chipili', province: 'Luapula', provinceId: '4', wardsCount: 3 },
    { id: '77', name: 'Mansa North', district: 'Mansa', province: 'Luapula', provinceId: '4', wardsCount: 3 },

    // LUSAKA PROVINCE (18 constituencies)
    { id: '78', name: 'Chilanga South', district: 'Chilanga', province: 'Lusaka', provinceId: '5', wardsCount: 4 },
    { id: '79', name: 'Kabwata', district: 'Lusaka', province: 'Lusaka', provinceId: '5', wardsCount: 5 },
    { id: '80', name: 'Mandevu', district: 'Lusaka', province: 'Lusaka', provinceId: '5', wardsCount: 5 },
    { id: '81', name: 'Chongwe', district: 'Chongwe', province: 'Lusaka', provinceId: '5', wardsCount: 4 },
    { id: '82', name: 'Kafue', district: 'Kafue', province: 'Lusaka', provinceId: '5', wardsCount: 4 },
    { id: '83', name: 'Kanyama', district: 'Lusaka', province: 'Lusaka', provinceId: '5', wardsCount: 5 },
    { id: '84', name: 'Chawama', district: 'Lusaka', province: 'Lusaka', provinceId: '5', wardsCount: 5 },
    { id: '85', name: 'Matero', district: 'Lusaka', province: 'Lusaka', provinceId: '5', wardsCount: 5 },
    { id: '86', name: 'Munali', district: 'Lusaka', province: 'Lusaka', provinceId: '5', wardsCount: 4 },
    { id: '87', name: 'Lusaka Central', district: 'Lusaka', province: 'Lusaka', provinceId: '5', wardsCount: 5 },
    { id: '88', name: 'Bweengwa', district: 'Monze', province: 'Lusaka', provinceId: '5', wardsCount: 3 },
    { id: '89', name: 'Rufunsa', district: 'Rufunsa', province: 'Lusaka', provinceId: '5', wardsCount: 3 },
    { id: '90', name: 'Feira', district: 'Luangwa', province: 'Lusaka', provinceId: '5', wardsCount: 3 },
    { id: '91', name: 'Chilanga North', district: 'Chilanga', province: 'Lusaka', provinceId: '5', wardsCount: 4 },
    { id: '92', name: 'Chongwe East', district: 'Chongwe', province: 'Lusaka', provinceId: '5', wardsCount: 3 },
    { id: '93', name: 'Kafue Central', district: 'Kafue', province: 'Lusaka', provinceId: '5', wardsCount: 4 },
    { id: '94', name: 'Mumbwa', district: 'Mumbwa', province: 'Lusaka', provinceId: '5', wardsCount: 3 },
    { id: '95', name: 'Bweengwa West', district: 'Monze', province: 'Lusaka', provinceId: '5', wardsCount: 3 },

    // MUCHINGA PROVINCE (12 constituencies)
    { id: '96', name: 'Chinsali Central', district: 'Chinsali', province: 'Muchinga', provinceId: '6', wardsCount: 4 },
    { id: '97', name: 'Isoka Central', district: 'Isoka', province: 'Muchinga', provinceId: '6', wardsCount: 3 },
    { id: '98', name: 'Kanchibiya', district: 'Kanchibiya', province: 'Muchinga', provinceId: '6', wardsCount: 3 },
    { id: '99', name: 'Mpika Central', district: 'Mpika', province: 'Muchinga', provinceId: '6', wardsCount: 4 },
    { id: '100', name: 'Nakonde', district: 'Nakonde', province: 'Muchinga', provinceId: '6', wardsCount: 3 },
    { id: '101', name: 'Shiwang\'andu', district: 'Shiwang\'andu', province: 'Muchinga', provinceId: '6', wardsCount: 3 },
    { id: '102', name: 'Lavushimanda', district: 'Mpika', province: 'Muchinga', provinceId: '6', wardsCount: 3 },
    { id: '103', name: 'Chinsali North', district: 'Chinsali', province: 'Muchinga', provinceId: '6', wardsCount: 3 },
    { id: '104', name: 'Isoka East', district: 'Isoka', province: 'Muchinga', provinceId: '6', wardsCount: 3 },
    { id: '105', name: 'Mafinga', district: 'Isoka', province: 'Muchinga', provinceId: '6', wardsCount: 3 },
    { id: '106', name: 'Mpika North', district: 'Mpika', province: 'Muchinga', provinceId: '6', wardsCount: 3 },
    { id: '107', name: 'Nakonde Central', district: 'Nakonde', province: 'Muchinga', provinceId: '6', wardsCount: 3 },

    // NORTHERN PROVINCE (16 constituencies)
    { id: '108', name: 'Chilubi', district: 'Chilubi', province: 'Northern', provinceId: '7', wardsCount: 3 },
    { id: '109', name: 'Kasama Central', district: 'Kasama', province: 'Northern', provinceId: '7', wardsCount: 5 },
    { id: '110', name: 'Luwingu', district: 'Luwingu', province: 'Northern', provinceId: '7', wardsCount: 3 },
    { id: '111', name: 'Mbala', district: 'Mbala', province: 'Northern', provinceId: '7', wardsCount: 4 },
    { id: '112', name: 'Mpulungu', district: 'Mpulungu', province: 'Northern', provinceId: '7', wardsCount: 3 },
    { id: '113', name: 'Mporokoso', district: 'Mporokoso', province: 'Northern', provinceId: '7', wardsCount: 3 },
    { id: '114', name: 'Mungwi', district: 'Mungwi', province: 'Northern', provinceId: '7', wardsCount: 3 },
    { id: '115', name: 'Senga Hill', district: 'Mbala', province: 'Northern', provinceId: '7', wardsCount: 3 },
    { id: '116', name: 'Kaputa', district: 'Kaputa', province: 'Northern', provinceId: '7', wardsCount: 3 },
    { id: '117', name: 'Lupososhi', district: 'Luwingu', province: 'Northern', provinceId: '7', wardsCount: 3 },
    { id: '118', name: 'Nsama', district: 'Kaputa', province: 'Northern', provinceId: '7', wardsCount: 3 },
    { id: '119', name: 'Kasama North', district: 'Kasama', province: 'Northern', provinceId: '7', wardsCount: 4 },
    { id: '120', name: 'Lubansenshi', district: 'Luwingu', province: 'Northern', provinceId: '7', wardsCount: 3 },
    { id: '121', name: 'Mbala Central', district: 'Mbala', province: 'Northern', provinceId: '7', wardsCount: 3 },
    { id: '122', name: 'Mporokoso Central', district: 'Mporokoso', province: 'Northern', provinceId: '7', wardsCount: 3 },
    { id: '123', name: 'Lunte', district: 'Lunte', province: 'Northern', provinceId: '7', wardsCount: 3 },

    // NORTH-WESTERN PROVINCE (14 constituencies)
    { id: '124', name: 'Chavuma', district: 'Chavuma', province: 'North-western', provinceId: '8', wardsCount: 3 },
    { id: '125', name: 'Kabompo Central', district: 'Kabompo', province: 'North-western', provinceId: '8', wardsCount: 3 },
    { id: '126', name: 'Kasempa', district: 'Kasempa', province: 'North-western', provinceId: '8', wardsCount: 3 },
    { id: '127', name: 'Mufumbwe', district: 'Mufumbwe', province: 'North-western', provinceId: '8', wardsCount: 3 },
    { id: '128', name: 'Mwinilunga Central', district: 'Mwinilunga', province: 'North-western', provinceId: '8', wardsCount: 4 },
    { id: '129', name: 'Solwezi Central', district: 'Solwezi', province: 'North-western', provinceId: '8', wardsCount: 5 },
    { id: '130', name: 'Zambezi East', district: 'Zambezi', province: 'North-western', provinceId: '8', wardsCount: 3 },
    { id: '131', name: 'Manyinga', district: 'Manyinga', province: 'North-western', provinceId: '8', wardsCount: 3 },
    { id: '132', name: 'Kabompo East', district: 'Kabompo', province: 'North-western', provinceId: '8', wardsCount: 3 },
    { id: '133', name: 'Ikelenge', district: 'Ikelenge', province: 'North-western', provinceId: '8', wardsCount: 3 },
    { id: '134', name: 'Solwezi East', district: 'Solwezi', province: 'North-western', provinceId: '8', wardsCount: 4 },
    { id: '135', name: 'Mwinilunga East', district: 'Mwinilunga', province: 'North-western', provinceId: '8', wardsCount: 3 },
    { id: '136', name: 'Kalumbila', district: 'Kalumbila', province: 'North-western', provinceId: '8', wardsCount: 3 },
    { id: '137', name: 'Zambezi West', district: 'Zambezi', province: 'North-western', provinceId: '8', wardsCount: 3 },

    // SOUTHERN PROVINCE (27 constituencies)
    { id: '138', name: 'Choma Central', district: 'Choma', province: 'Southern', provinceId: '9', wardsCount: 5 },
    { id: '139', name: 'Livingstone', district: 'Livingstone', province: 'Southern', provinceId: '9', wardsCount: 5 },
    { id: '140', name: 'Kalomo Central', district: 'Kalomo', province: 'Southern', provinceId: '9', wardsCount: 4 },
    { id: '141', name: 'Monze Central', district: 'Monze', province: 'Southern', provinceId: '9', wardsCount: 4 },
    { id: '142', name: 'Mazabuka Central', district: 'Mazabuka', province: 'Southern', provinceId: '9', wardsCount: 4 },
    { id: '143', name: 'Gwembe', district: 'Gwembe', province: 'Southern', provinceId: '9', wardsCount: 3 },
    { id: '144', name: 'Sinazongwe', district: 'Sinazongwe', province: 'Southern', provinceId: '9', wardsCount: 3 },
    { id: '145', name: 'Pemba', district: 'Pemba', province: 'Southern', provinceId: '9', wardsCount: 3 },
    { id: '146', name: 'Namwala', district: 'Namwala', province: 'Southern', provinceId: '9', wardsCount: 3 },
    { id: '147', name: 'Siavonga', district: 'Siavonga', province: 'Southern', provinceId: '9', wardsCount: 3 },
    { id: '148', name: 'Chikankata', district: 'Mazabuka', province: 'Southern', provinceId: '9', wardsCount: 3 },
    { id: '149', name: 'Zimba', district: 'Zimba', province: 'Southern', provinceId: '9', wardsCount: 3 },
    { id: '150', name: 'Dundumwezi', district: 'Kalomo', province: 'Southern', provinceId: '9', wardsCount: 3 },
    { id: '151', name: 'Choma North', district: 'Choma', province: 'Southern', provinceId: '9', wardsCount: 4 },
    { id: '152', name: 'Magoye', district: 'Choma', province: 'Southern', provinceId: '9', wardsCount: 3 },
    { id: '153', name: 'Pemba South', district: 'Pemba', province: 'Southern', provinceId: '9', wardsCount: 3 },
    { id: '154', name: 'Itezhi-Tezhi', district: 'Itezhi-Tezhi', province: 'Southern', provinceId: '9', wardsCount: 3 },
    { id: '155', name: 'Kalomo North', district: 'Kalomo', province: 'Southern', provinceId: '9', wardsCount: 3 },
    { id: '156', name: 'Sinazeze', district: 'Sinazongwe', province: 'Southern', provinceId: '9', wardsCount: 3 },
    { id: '157', name: 'Kazungula', district: 'Kazungula', province: 'Southern', provinceId: '9', wardsCount: 3 },
    { id: '158', name: 'Monze East', district: 'Monze', province: 'Southern', provinceId: '9', wardsCount: 3 },
    { id: '159', name: 'Machile', district: 'Kazungula', province: 'Southern', provinceId: '9', wardsCount: 3 },
    { id: '160', name: 'Nakambala', district: 'Mazabuka', province: 'Southern', provinceId: '9', wardsCount: 3 },
    { id: '161', name: 'Moomba', district: 'Choma', province: 'Southern', provinceId: '9', wardsCount: 3 },
    { id: '162', name: 'Siavonga West', district: 'Siavonga', province: 'Southern', provinceId: '9', wardsCount: 3 },
    { id: '163', name: 'Gwembe Valley', district: 'Gwembe', province: 'Southern', provinceId: '9', wardsCount: 3 },
    { id: '164', name: 'Namwala East', district: 'Namwala', province: 'Southern', provinceId: '9', wardsCount: 3 },

    // WESTERN PROVINCE (21 constituencies)
    { id: '165', name: 'Kalabo Central', district: 'Kalabo', province: 'Western', provinceId: '10', wardsCount: 4 },
    { id: '166', name: 'Mongu Central', district: 'Mongu', province: 'Western', provinceId: '10', wardsCount: 5 },
    { id: '167', name: 'Senanga', district: 'Senanga', province: 'Western', provinceId: '10', wardsCount: 4 },
    { id: '168', name: 'Sesheke', district: 'Sesheke', province: 'Western', provinceId: '10', wardsCount: 3 },
    { id: '169', name: 'Shangombo', district: 'Shangombo', province: 'Western', provinceId: '10', wardsCount: 3 },
    { id: '170', name: 'Sikongo', district: 'Sesheke', province: 'Western', provinceId: '10', wardsCount: 3 },
    { id: '171', name: 'Liuwa', district: 'Kalabo', province: 'Western', provinceId: '10', wardsCount: 3 },
    { id: '172', name: 'Kaoma Central', district: 'Kaoma', province: 'Western', provinceId: '10', wardsCount: 4 },
    { id: '173', name: 'Lukulu East', district: 'Lukulu', province: 'Western', provinceId: '10', wardsCount: 3 },
    { id: '174', name: 'Mitete', district: 'Kaoma', province: 'Western', provinceId: '10', wardsCount: 3 },
    { id: '175', name: 'Nalolo', district: 'Mongu', province: 'Western', provinceId: '10', wardsCount: 3 },
    { id: '176', name: 'Senanga East', district: 'Senanga', province: 'Western', provinceId: '10', wardsCount: 3 },
    { id: '177', name: 'Luampa', district: 'Luampa', province: 'Western', provinceId: '10', wardsCount: 3 },
    { id: '178', name: 'Mangango', district: 'Kaoma', province: 'Western', provinceId: '10', wardsCount: 3 },
    { id: '179', name: 'Mongu West', district: 'Mongu', province: 'Western', provinceId: '10', wardsCount: 4 },
    { id: '180', name: 'Kalabo East', district: 'Kalabo', province: 'Western', provinceId: '10', wardsCount: 3 },
    { id: '181', name: 'Lukulu West', district: 'Lukulu', province: 'Western', provinceId: '10', wardsCount: 3 },
    { id: '182', name: 'Nkeyema', district: 'Kaoma', province: 'Western', provinceId: '10', wardsCount: 3 },
    { id: '183', name: 'Mulobezi', district: 'Mulobezi', province: 'Western', provinceId: '10', wardsCount: 3 },
    { id: '184', name: 'Sioma', district: 'Sioma', province: 'Western', provinceId: '10', wardsCount: 3 },
    { id: '185', name: 'Sinjembela', district: 'Sesheke', province: 'Western', provinceId: '10', wardsCount: 3 },
  ];

  // Generate ward-level chambers for each constituency
  constituencies.forEach((constituency, constIndex) => {
    const sectors = provinceSectors[constituency.province] || ['General Business'];

    // Generate ward chambers (3-5 per constituency)
    for (let wardNum = 1; wardNum <= constituency.wardsCount; wardNum++) {
      const wardSuffix = wardSuffixes[(wardNum - 1) % wardSuffixes.length];
      const wardName = `${constituency.name} ${wardSuffix}`;
      const sector = sectors[(chamberIdCounter - 1) % sectors.length];

      chambers.push({
        id: `chamber-${String(chamberIdCounter).padStart(4, '0')}`,
        name: `${wardName} Ward Chamber of Commerce`,
        location: wardName,
        wardId: `ward-${constituency.id}-${wardNum}`,
        wardName: wardName,
        constituencyId: constituency.id,
        constituencyName: constituency.name,
        districtName: constituency.district,
        provinceId: constituency.provinceId,
        provinceName: constituency.province,
        type: 'ward',
        established: String(2015 + (chamberIdCounter % 9)),
        memberBusinesses: 15 + (chamberIdCounter % 40),
        contactEmail: `info@${wardName.toLowerCase().replace(/\s+/g, '')}chamber.org.zm`,
        contactPhone: `+260-${211 + (chamberIdCounter % 5)}-${String(100000 + (chamberIdCounter * 7) % 900000).padStart(6, '0')}`,
        description: `Supporting local businesses and entrepreneurship in ${wardName} Ward`,
        sector: sector,
      });
      chamberIdCounter++;
    }

    // Generate constituency-level chamber
    const constSector = sectors[constIndex % sectors.length];
    chambers.push({
      id: `chamber-${String(chamberIdCounter).padStart(4, '0')}`,
      name: `${constituency.name} Constituency Chamber of Commerce`,
      location: constituency.name,
      constituencyId: constituency.id,
      constituencyName: constituency.name,
      districtName: constituency.district,
      provinceId: constituency.provinceId,
      provinceName: constituency.province,
      type: 'constituency',
      established: String(2010 + (chamberIdCounter % 14)),
      memberBusinesses: 50 + (chamberIdCounter % 80),
      contactEmail: `info@${constituency.name.toLowerCase().replace(/\s+/g, '')}chamber.org.zm`,
      contactPhone: `+260-${211 + (chamberIdCounter % 5)}-${String(100000 + (chamberIdCounter * 11) % 900000).padStart(6, '0')}`,
      description: `Promoting trade and commerce across ${constituency.name} Constituency`,
      sector: constSector,
    });
    chamberIdCounter++;
  });

  // Generate district-level chambers
  const districts = [...new Set(constituencies.map(c => ({ name: c.district, province: c.province, provinceId: c.provinceId })))];
  districts.forEach((district, index) => {
    const sectors = provinceSectors[district.province] || ['General Business'];
    const sector = sectors[index % sectors.length];

    chambers.push({
      id: `chamber-${String(chamberIdCounter).padStart(4, '0')}`,
      name: `${district.name} District Chamber of Commerce`,
      location: district.name,
      districtName: district.name,
      provinceId: district.provinceId,
      provinceName: district.province,
      type: 'district',
      established: String(2005 + (chamberIdCounter % 19)),
      memberBusinesses: 100 + (chamberIdCounter % 150),
      contactEmail: `info@${district.name.toLowerCase().replace(/\s+/g, '')}chamber.org.zm`,
      contactPhone: `+260-${211 + (chamberIdCounter % 5)}-${String(100000 + (chamberIdCounter * 13) % 900000).padStart(6, '0')}`,
      description: `Advancing business interests across ${district.name} District`,
      sector: sector,
    });
    chamberIdCounter++;
  });

  // Generate provincial chambers
  const provinces = [
    { id: '1', name: 'Central' },
    { id: '2', name: 'Copperbelt' },
    { id: '3', name: 'Eastern' },
    { id: '4', name: 'Luapula' },
    { id: '5', name: 'Lusaka' },
    { id: '6', name: 'Muchinga' },
    { id: '7', name: 'Northern' },
    { id: '8', name: 'North-western' },
    { id: '9', name: 'Southern' },
    { id: '10', name: 'Western' },
  ];

  provinces.forEach((province, index) => {
    const sectors = provinceSectors[province.name] || ['General Business'];
    const sector = sectors[0];

    chambers.push({
      id: `chamber-${String(chamberIdCounter).padStart(4, '0')}`,
      name: `${province.name} Provincial Chamber of Commerce`,
      location: province.name,
      provinceId: province.id,
      provinceName: province.name,
      type: 'provincial',
      established: String(2000 + index),
      memberBusinesses: 500 + (index * 100),
      contactEmail: `info@${province.name.toLowerCase().replace(/\s+/g, '')}chamber.org.zm`,
      contactPhone: `+260-${211 + index}-${String(100000 + (index * 17) % 900000).padStart(6, '0')}`,
      description: `Provincial apex body for business chambers across ${province.name} Province`,
      sector: sector,
    });
    chamberIdCounter++;
  });

  // Generate national chamber
  chambers.push({
    id: 'chamber-national',
    name: 'Zambia National Chamber of Commerce and Industry (ZNCCI)',
    location: 'Lusaka',
    provinceId: '5',
    provinceName: 'Lusaka',
    type: 'national',
    established: '1965',
    memberBusinesses: 5000,
    contactEmail: 'info@zambiachamber.org.zm',
    contactPhone: '+260-211-987654',
    description: 'National apex body for business chambers across the Republic of Zambia',
    sector: 'National Business Advocacy',
  });

  return chambers;
}

const allChambers = generateChambers();

// Generate internship programs (3-5 per constituency-level chamber)
function generateInternships(): InternshipProgram[] {
  const internships: InternshipProgram[] = [];
  const constituencyChambers = allChambers.filter(c => c.type === 'constituency');

  const statuses: ('open' | 'upcoming' | 'closed')[] = ['open', 'open', 'open', 'upcoming', 'closed'];
  const durations = ['3 months', '6 months', '9 months', '12 months'];

  constituencyChambers.forEach((chamber, index) => {
    const programCount = 2 + (index % 4); // 2-5 programs per chamber

    for (let i = 0; i < programCount; i++) {
      const internIndex = internships.length;
      const sector = chamber.sector;

      internships.push({
        id: `int-${String(internIndex + 1).padStart(5, '0')}`,
        chamberId: chamber.id,
        title: `${sector} Development Internship`,
        description: `Gain practical experience in ${sector.toLowerCase()} with local businesses in ${chamber.location}`,
        duration: durations[internIndex % durations.length],
        positions: 5 + (internIndex % 20),
        requirements: [
          'Grade 12 certificate or higher education qualification',
          `Interest in ${sector.toLowerCase()}`,
          'Good communication and teamwork skills',
          'Willingness to learn and adapt'
        ],
        benefits: [
          `Monthly stipend of K${400 + (internIndex % 10) * 100}`,
          'Certificate of completion from recognized chamber',
          'Professional mentorship and networking',
          'Practical skills development',
          'Job placement assistance upon completion'
        ],
        applicationDeadline: `2026-${String(7 + (internIndex % 5)).padStart(2, '0')}-${String(15 + (internIndex % 15)).padStart(2, '0')}`,
        status: statuses[internIndex % statuses.length],
        sector: sector
      });
    }
  });

  return internships;
}

const allInternshipPrograms = generateInternships();

// Helper functions
export function getChambersByConstituency(constituencyId: string): Chamber[] {
  return allChambers.filter(c => c.constituencyId === constituencyId);
}

export function getChambersByProvince(provinceId: string): Chamber[] {
  return allChambers.filter(c => c.provinceId === provinceId);
}

export function getChambersBySector(sector: string): Chamber[] {
  return allChambers.filter(c => c.sector === sector);
}

export function getChamberById(id: string): Chamber | undefined {
  return allChambers.find(c => c.id === id);
}

export function getAllChambers(): Chamber[] {
  return allChambers;
}

export function getAllSectors(): string[] {
  const sectors = new Set<string>();
  allChambers.forEach(c => {
    if (c.sector) sectors.add(c.sector);
  });
  return Array.from(sectors).sort();
}

export function getInternshipsByChamberId(chamberId: string): InternshipProgram[] {
  return allInternshipPrograms.filter(i => i.chamberId === chamberId);
}

export function getOpenInternships(): InternshipProgram[] {
  return allInternshipPrograms.filter(i => i.status === 'open');
}

export function getInternshipsBySector(sector: string): InternshipProgram[] {
  return allInternshipPrograms.filter(i => i.sector === sector);
}

export function getInternshipById(id: string): InternshipProgram | undefined {
  return allInternshipPrograms.find(i => i.id === id);
}

// Statistics
export function getChamberStats() {
  return {
    total: allChambers.length,
    byType: {
      ward: allChambers.filter(c => c.type === 'ward').length,
      constituency: allChambers.filter(c => c.type === 'constituency').length,
      district: allChambers.filter(c => c.type === 'district').length,
      provincial: allChambers.filter(c => c.type === 'provincial').length,
      national: allChambers.filter(c => c.type === 'national').length,
    },
    totalMembers: allChambers.reduce((sum, c) => sum + c.memberBusinesses, 0),
    totalInternships: allInternshipPrograms.length,
    openInternships: allInternshipPrograms.filter(i => i.status === 'open').length,
  };
}
