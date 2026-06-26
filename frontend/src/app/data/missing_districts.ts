// Missing districts to be added to mockData.ts
// These 4 districts are missing from the current data (112/116)
// UPDATED: Using ACTUAL data extracted from mockData.ts for CHOMA, KALOMO, and SHIWANG'ANDU

import { District } from './mockData';

// Helper functions (same as in mockData.ts)
function createActualPollingStation(id: string, name: string, registeredVoters: number) {
  return {
    id,
    name,
    registeredVoters,
    totalVotes: 0,
    rejectedBallots: 0,
    results: [],
  };
}

function generateMPCandidates(constituencyId: string) {
  return []; // Placeholder
}

function generateCouncillorCandidates(wardId: string) {
  return []; // Placeholder
}

function generateMayoralCandidates(districtId: string) {
  return []; // Placeholder
}

// ============================================================================
// 1. CHOMA District (Southern Province) - ACTUAL DATA from mockData.ts
// District Code: 109002
// 3 Constituencies, 27 Wards, 202 Polling Stations
// ============================================================================

export const chomaDistrict: District = {
  id: 'choma',
  name: 'CHOMA',
  mayoralCandidates: generateMayoralCandidates('choma'),
  constituencies: [
    {
      id: 'choma-south',
      name: 'CHOMA SOUTH',
      mpCandidates: generateMPCandidates('choma-south'),
      wards: [
        {
          id: 'namuswa',
          name: 'NAMUSWA',
          councillorCandidates: generateCouncillorCandidates('namuswa'),
          pollingStations: [
            createActualPollingStation('109002000101', 'Namuswa Primary School-01', 955),
            createActualPollingStation('109002000201', 'Simwami Primary School-01', 382),
            createActualPollingStation('109002000301', 'Kalalasaka Primary School-01', 388),
            createActualPollingStation('109002000401', 'Masuku Terminal Primary School-01', 797),
            createActualPollingStation('109002000402', 'Masuku Terminal Primary School-02', 797),
          ],
        },
        {
          id: 'masuku',
          name: 'MASUKU',
          councillorCandidates: generateCouncillorCandidates('masuku'),
          pollingStations: [
            createActualPollingStation('109002000501', 'Kamawindo Community School-01', 293),
            createActualPollingStation('109002000601', 'Masuku Primary School-01', 577),
            createActualPollingStation('109002000602', 'Masuku Primary School-02', 576),
            createActualPollingStation('109002000701', 'Makalakala Community School-01', 451),
            createActualPollingStation('109002000801', 'Chuulu Primary School-01', 808),
            createActualPollingStation('109002000901', 'Namaanza Primary School-01', 538),
            createActualPollingStation('109002000902', 'Namaanza Primary School-02', 538),
          ],
        },
        {
          id: 'siasikabole',
          name: 'SIASIKABOLE',
          councillorCandidates: generateCouncillorCandidates('siasikabole'),
          pollingStations: [
            createActualPollingStation('109002001001', 'Siamakando Primary School-01', 899),
            createActualPollingStation('109002001101', 'Siasikabole Primary School-01', 567),
            createActualPollingStation('109002001102', 'Siasikabole Primary School-02', 566),
            createActualPollingStation('109002001201', 'Mwanachilenga Primary School-01', 537),
            createActualPollingStation('109002001202', 'Mwanachilenga Primary School-02', 536),
            createActualPollingStation('109002001301', 'Siamaluba Primary School-01', 542),
            createActualPollingStation('109002001302', 'Siamaluba Primary School-02', 541),
            createActualPollingStation('109002001401', 'Patasi Primary School-01', 599),
          ],
        },
        {
          id: 'singani',
          name: 'SINGANI',
          councillorCandidates: generateCouncillorCandidates('singani'),
          pollingStations: [
            createActualPollingStation('109002001501', 'Siamvula Primary School-01', 505),
            createActualPollingStation('109002001601', 'Chooye Community School-01', 477),
            createActualPollingStation('109002001701', 'Singani East Primary School-01', 675),
            createActualPollingStation('109002001702', 'Singani East Primary School-02', 674),
            createActualPollingStation('109002001801', 'Munzuma Community School-01', 788),
          ],
        },
        {
          id: 'nakeempa',
          name: 'NAKEEMPA',
          councillorCandidates: generateCouncillorCandidates('nakeempa'),
          pollingStations: [
            createActualPollingStation('109002001901', 'Simpweze Primary School-01', 975),
            createActualPollingStation('109002002001', 'Nakeempa Primary School-01', 535),
            createActualPollingStation('109002002002', 'Nakeempa Primary School-02', 535),
            createActualPollingStation('109002002101', 'Simukanka Primary School-01', 693),
          ],
        },
        {
          id: 'sikalongo',
          name: 'SIKALONGO',
          councillorCandidates: generateCouncillorCandidates('sikalongo'),
          pollingStations: [
            createActualPollingStation('109002005501', 'Mabanga Community School-01', 343),
            createActualPollingStation('109002005601', 'Sikalongo Primary School-01', 774),
            createActualPollingStation('109002005602', 'Sikalongo Primary School-02', 773),
            createActualPollingStation('109002005701', 'Mboole Primary School-01', 740),
            createActualPollingStation('109002005702', 'Mboole Primary School-02', 739),
            createActualPollingStation('109002005703', 'Mboole Primary School-03', 739),
            createActualPollingStation('109002005801', 'Chipande Primary School-01', 825),
            createActualPollingStation('109002005901', 'Masopo Primary School-01', 865),
          ],
        },
        {
          id: 'batoka',
          name: 'BATOKA',
          councillorCandidates: generateCouncillorCandidates('batoka'),
          pollingStations: [
            createActualPollingStation('109002006001', 'Sichikali Primary School-01', 786),
            createActualPollingStation('109002006002', 'Sichikali Primary School-02', 785),
            createActualPollingStation('109002006101', 'Chilube Community School-01', 683),
            createActualPollingStation('109002006201', 'Batoka Primary School-01', 793),
            createActualPollingStation('109002006202', 'Batoka Primary School-02', 793),
            createActualPollingStation('109002006203', 'Batoka Primary School-03', 793),
            createActualPollingStation('109002006204', 'Batoka Primary School-04', 793),
            createActualPollingStation('109002006301', 'Roman Catholic Church-01', 551),
            createActualPollingStation('109002006302', 'Roman Catholic Church-02', 551),
            createActualPollingStation('109002006401', 'Siachidinta Primary School-01', 956),
            createActualPollingStation('109002006501', 'Bbombo Primary School-01', 581),
            createActualPollingStation('109002006502', 'Bbombo Primary School-02', 580),
          ],
        },
      ],
    },
    {
      id: 'choma-central',
      name: 'CHOMA CENTRAL',
      mpCandidates: generateMPCandidates('choma-central'),
      wards: [
        {
          id: 'mutandalike',
          name: 'MUTANDALIKE',
          councillorCandidates: generateCouncillorCandidates('mutandalike'),
          pollingStations: [
            createActualPollingStation('109002002201', 'Ben Mulalu Community School-01', 744),
            createActualPollingStation('109002002301', 'Mutandalike Primary School-01', 962),
            createActualPollingStation('109002002401', 'Gamela TBZ Shed-01', 695),
          ],
        },
        {
          id: 'mubula',
          name: 'MUBULA',
          councillorCandidates: generateCouncillorCandidates('mubula'),
          pollingStations: [
            createActualPollingStation('109002002501', 'Kalundu Kamaria Community School-01', 997),
            createActualPollingStation('109002002502', 'Kalundu Kamaria Community School-02', 997),
            createActualPollingStation('109002002503', 'Kalundu Kamaria Community School-03', 997),
            createActualPollingStation('109002002504', 'Kalundu Kamaria Community School-04', 997),
            createActualPollingStation('109002002505', 'Kalundu Kamaria Community School-05', 996),
            createActualPollingStation('109002002601', 'Kanjanji Mothers Shelter-01', 583),
            createActualPollingStation('109002002602', 'Kanjanji Mothers Shelter-02', 583),
            createActualPollingStation('109002002701', 'Overspill SDA Church-01', 977),
            createActualPollingStation('109002002702', 'Overspill SDA Church-02', 976),
            createActualPollingStation('109002002801', 'Nkumbula Health Post-01', 706),
            createActualPollingStation('109002002802', 'Nkumbula Health Post-02', 706),
          ],
        },
        {
          id: 'sikalundu',
          name: 'SIKALUNDU',
          councillorCandidates: generateCouncillorCandidates('sikalundu'),
          pollingStations: [
            createActualPollingStation('109002002901', 'Council Community Hall-01', 827),
            createActualPollingStation('109002002902', 'Council Community Hall-02', 827),
            createActualPollingStation('109002003001', 'St. Patricks Primary School-01', 698),
            createActualPollingStation('109002003002', 'St. Patricks Primary School-02', 698),
            createActualPollingStation('109002003101', 'Shampande Primary School A-01', 674),
            createActualPollingStation('109002003102', 'Shampande Primary School A-02', 674),
            createActualPollingStation('109002003103', 'Shampande Primary School A-03', 673),
            createActualPollingStation('109002003201', 'Shampande Primary School B-01', 909),
            createActualPollingStation('109002003301', 'St Mawagali Trades School-01', 719),
            createActualPollingStation('109002003302', 'St Mawagali Trades School-02', 718),
            createActualPollingStation('109002003401', 'Nahumba Primary School-01', 656),
            createActualPollingStation('109002056601', 'Choma Correctional Facility-01', 242),
          ],
        },
        {
          id: 'stateland',
          name: 'STATELAND',
          councillorCandidates: generateCouncillorCandidates('stateland'),
          pollingStations: [
            createActualPollingStation('109002003501', 'Jacobson Farm-01', 617),
            createActualPollingStation('109002003601', 'Kabeleka Salvation Army Church-01', 216),
            createActualPollingStation('109002003701', 'New Venture Private School-01', 395),
            createActualPollingStation('109002003801', 'Sibanyati Primary School-01', 564),
            createActualPollingStation('109002003802', 'Sibanyati Primary School-02', 563),
            createActualPollingStation('109002003901', 'ZNS SDA Church-01', 636),
            createActualPollingStation('109002056701', 'Singani Correctional Farm-01', 4),
          ],
        },
        {
          id: 'kulundana',
          name: 'KULUNDANA',
          councillorCandidates: generateCouncillorCandidates('kulundana'),
          pollingStations: [
            createActualPollingStation('109002004001', 'Njase Secondary School-01', 933),
            createActualPollingStation('109002004002', 'Njase Secondary School-02', 933),
            createActualPollingStation('109002004003', 'Njase Secondary School-03', 932),
            createActualPollingStation('109002004101', 'Kamunza Primary School-01', 903),
            createActualPollingStation('109002004102', 'Kamunza Primary School-02', 903),
            createActualPollingStation('109002004103', 'Kamunza Primary School-03', 903),
            createActualPollingStation('109002004201', 'Chundu Day High School-01', 831),
            createActualPollingStation('109002004202', 'Chundu Day High School-02', 831),
            createActualPollingStation('109002004301', 'Adastra Primary School-01', 867),
            createActualPollingStation('109002004302', 'Adastra Primary School-02', 867),
            createActualPollingStation('109002004303', 'Adastra Primary School-03', 866),
            createActualPollingStation('109002004304', 'Adastra Primary School-04', 866),
            createActualPollingStation('109002004401', 'Airport Community School-01', 863),
            createActualPollingStation('109002004402', 'Airport Community School-02', 863),
            createActualPollingStation('109002004403', 'Airport Community School-03', 863),
            createActualPollingStation('109002004404', 'Airport Community School-04', 863),
            createActualPollingStation('109002004405', 'Airport Community School-05', 863),
            createActualPollingStation('109002004406', 'Airport Community School-06', 862),
          ],
        },
        {
          id: 'simacheche',
          name: 'SIMACHECHE',
          councillorCandidates: generateCouncillorCandidates('simacheche'),
          pollingStations: [
            createActualPollingStation('109002004501', 'Mwapona Primary School-01', 853),
            createActualPollingStation('109002004502', 'Mwapona Primary School-02', 853),
            createActualPollingStation('109002004503', 'Mwapona Primary School-03', 853),
            createActualPollingStation('109002004504', 'Mwapona Primary School-04', 853),
            createActualPollingStation('109002004505', 'Mwapona Primary School-05', 853),
            createActualPollingStation('109002004601', 'Choma Day High School-01', 895),
            createActualPollingStation('109002004602', 'Choma Day High School-02', 895),
            createActualPollingStation('109002004603', 'Choma Day High School-03', 895),
            createActualPollingStation('109002004604', 'Choma Day High School-04', 895),
            createActualPollingStation('109002004605', 'Choma Day High School-05', 895),
            createActualPollingStation('109002004701', 'Timber Yard-01', 722),
            createActualPollingStation('109002004702', 'Timber Yard-02', 721),
            createActualPollingStation('109002004801', 'Mochipapa UCZ Church-01', 687),
            createActualPollingStation('109002004802', 'Mochipapa UCZ Church-02', 687),
            createActualPollingStation('109002004901', 'Old Kabanana Health Post-01', 540),
            createActualPollingStation('109002004902', 'Old Kabanana Health Post-02', 540),
            createActualPollingStation('109002005001', 'Lugwasho Community School-01', 889),
            createActualPollingStation('109002005002', 'Lugwasho Community School-02', 889),
          ],
        },
        {
          id: 'siamambo',
          name: 'SIAMAMBO',
          councillorCandidates: generateCouncillorCandidates('siamambo'),
          pollingStations: [
            createActualPollingStation('109002005101', 'Sikalongo Settlement Primary Health Centre-01', 548),
            createActualPollingStation('109002005201', 'Siatembo Primary School-01', 782),
            createActualPollingStation('109002005301', 'Siamambo Primary School-01', 500),
            createActualPollingStation('109002005302', 'Siamambo Primary School-02', 500),
            createActualPollingStation('109002005401', 'Siankope Primary School-01', 621),
            createActualPollingStation('109002005402', 'Siankope Primary School-02', 620),
          ],
        },
        {
          id: 'moomba',
          name: 'MOOMBA',
          councillorCandidates: generateCouncillorCandidates('moomba'),
          pollingStations: [
            createActualPollingStation('109002006601', 'Harmony Primary School-01', 559),
            createActualPollingStation('109002006602', 'Harmony Primary School-02', 559),
            createActualPollingStation('109002006701', 'Moomba Primary School-01', 582),
            createActualPollingStation('109002006801', 'Abel Nell Community School-01', 252),
          ],
        },
        {
          id: 'simamvwa',
          name: 'SIMAMVWA',
          councillorCandidates: generateCouncillorCandidates('simamvwa'),
          pollingStations: [
            createActualPollingStation('109002006901', 'Buffalo 8 Farm-01', 237),
            createActualPollingStation('109002007001', 'Suntwe Fertilizer Shed-01', 828),
            createActualPollingStation('109002007101', 'New Kachenje Primary School-01', 434),
            createActualPollingStation('109002007201', 'Popota Primary School-01', 571),
            createActualPollingStation('109002007202', 'Popota Primary School-02', 570),
            createActualPollingStation('109002007301', 'Pangwe Primary School-01', 696),
            createActualPollingStation('109002007302', 'Pangwe Primary School-02', 696),
            createActualPollingStation('109002007401', 'Hanyanga Brethren in Christ Church-01', 411),
          ],
        },
      ],
    },
    {
      id: 'mbabala',
      name: 'MBABALA',
      mpCandidates: generateMPCandidates('mbabala'),
      wards: [
        {
          id: 'simamvwa',
          name: 'SIMAMVWA',
          councillorCandidates: generateCouncillorCandidates('simamvwa'),
          pollingStations: [
            createActualPollingStation('109002007501', 'Nalituba Primary School-01', 552),
            createActualPollingStation('109002007601', 'Chisikili Primary School-01', 716),
            createActualPollingStation('109002007701', 'Halumba Primary School-01', 669),
            createActualPollingStation('109002007801', 'Simunzele Primary School-01', 869),
          ],
        },
        {
          id: 'kabimba',
          name: 'KABIMBA',
          councillorCandidates: generateCouncillorCandidates('kabimba'),
          pollingStations: [
            createActualPollingStation('109002007901', 'Silukwiya Primary School-01', 556),
            createActualPollingStation('109002007902', 'Silukwiya Primary School-02', 556),
            createActualPollingStation('109002008001', 'Namiyanda Rural Health Centre-01', 738),
            createActualPollingStation('109002008101', 'Sinalungu Community School-01', 751),
            createActualPollingStation('109002008201', 'Kabimba Primary School-01', 644),
          ],
        },
        {
          id: 'mutanga',
          name: 'MUTANGA',
          councillorCandidates: generateCouncillorCandidates('mutanga'),
          pollingStations: [
            createActualPollingStation('109002008301', 'Pilgrim Church-01', 560),
            createActualPollingStation('109002008401', 'Mutanga Primary School-01', 771),
            createActualPollingStation('109002008501', 'Simuvwimi SDA Church-01', 294),
            createActualPollingStation('109002008601', 'Katumbi Under 5 Community Clinic-01', 609),
          ],
        },
        {
          id: 'macha',
          name: 'MACHA',
          councillorCandidates: generateCouncillorCandidates('macha'),
          pollingStations: [
            createActualPollingStation('109002008701', 'Lupata Primary School-01', 695),
            createActualPollingStation('109002008801', 'Macha PHC Hospital-01', 683),
            createActualPollingStation('109002008802', 'Macha PHC Hospital-02', 682),
            createActualPollingStation('109002008901', 'Maliko PHC-01', 483),
            createActualPollingStation('109002009001', 'Macha School-01', 544),
            createActualPollingStation('109002009002', 'Macha School-02', 544),
            createActualPollingStation('109002009101', 'Mabwe-Atuba Primary School-01', 677),
            createActualPollingStation('109002009201', 'Kaseko Primary Health Centre-01', 337),
            createActualPollingStation('109002009301', 'Nemfwe Primary School-01', 798),
          ],
        },
        {
          id: 'kabanze-mayobo',
          name: 'KABANZE-MAYOBO',
          councillorCandidates: generateCouncillorCandidates('kabanze-mayobo'),
          pollingStations: [
            createActualPollingStation('109002009401', 'Sichaanji Bretheren In Christ-01', 440),
            createActualPollingStation('109002009501', 'Namoompa Primary School-01', 987),
            createActualPollingStation('109002009502', 'Namoompa Primary School-02', 987),
            createActualPollingStation('109002009601', 'Mayobo Primary School-01', 591),
            createActualPollingStation('109002009602', 'Mayobo Primary School-02', 590),
          ],
        },
        {
          id: 'simaubi',
          name: 'SIMAUBI',
          councillorCandidates: generateCouncillorCandidates('simaubi'),
          pollingStations: [
            createActualPollingStation('109002009701', 'Muyanda Primary School-01', 650),
            createActualPollingStation('109002009801', 'Hakaloba Health Post-01', 420),
            createActualPollingStation('109002009901', 'Mpinda Primary School-01', 984),
            createActualPollingStation('109002010001', 'Simaubi Primary School-01', 955),
            createActualPollingStation('109002010002', 'Simaubi Primary School-02', 955),
            createActualPollingStation('109002010101', 'Kapondo Primary School-01', 446),
          ],
        },
        {
          id: 'chilalantambo',
          name: 'CHILALANTAMBO',
          councillorCandidates: generateCouncillorCandidates('chilalantambo'),
          pollingStations: [
            createActualPollingStation('109002010201', 'Mutongwa Primary School-01', 591),
            createActualPollingStation('109002010301', 'Nalube Primary School-01', 521),
            createActualPollingStation('109002010302', 'Nalube Primary School-02', 521),
            createActualPollingStation('109002010401', 'Hamubbwatu Primary School-01', 504),
            createActualPollingStation('109002010501', 'Kataba Community School-01', 507),
            createActualPollingStation('109002010601', 'Chilalantambo Primary School-01', 717),
            createActualPollingStation('109002010602', 'Chilalantambo Primary School-02', 716),
            createActualPollingStation('109002010701', 'Hamoonde Primary School-01', 812),
            createActualPollingStation('109002010801', 'Bulebo Community School-01', 488),
          ],
        },
        {
          id: 'mapanza',
          name: 'MAPANZA',
          councillorCandidates: generateCouncillorCandidates('mapanza'),
          pollingStations: [
            createActualPollingStation('109002010901', 'Chibwe Primary School-01', 914),
            createActualPollingStation('109002010902', 'Chibwe Primary School-02', 914),
            createActualPollingStation('109002011001', 'Maanda Primary School-01', 912),
            createActualPollingStation('109002011101', 'Kasiwe Community School-01', 474),
            createActualPollingStation('109002011201', 'Masonsa Primary School-01', 678),
          ],
        },
        {
          id: 'kalundu',
          name: 'KALUNDU',
          councillorCandidates: generateCouncillorCandidates('kalundu'),
          pollingStations: [
            createActualPollingStation('109002011301', 'Ndawana Primary School-01', 501),
            createActualPollingStation('109002011401', 'Malindi Primary School-01', 777),
            createActualPollingStation('109002011501', 'Kabanga Primary School-01', 642),
            createActualPollingStation('109002011502', 'Kabanga Primary School-02', 642),
          ],
        },
        {
          id: 'nchembe',
          name: 'NCHEMBE',
          councillorCandidates: generateCouncillorCandidates('nchembe'),
          pollingStations: [
            createActualPollingStation('109002011601', 'Chivuma Community School-01', 392),
            createActualPollingStation('109002011701', 'Nabukowa Primary School-01', 707),
            createActualPollingStation('109002011801', 'Kadombo Primary School-01', 790),
            createActualPollingStation('109002011901', 'Kalindi Primary School-01', 828),
            createActualPollingStation('109002012001', 'Chazangwe Primary School-01', 453),
            createActualPollingStation('109002012201', 'Sivubwa Primary School-01', 633),
            createActualPollingStation('109002012301', 'Mauka Primary School-01', 777),
            createActualPollingStation('109002012401', 'Mutama Primary School-01', 443),
          ],
        },
        {
          id: 'mbabala',
          name: 'MBABALA',
          councillorCandidates: generateCouncillorCandidates('mbabala'),
          pollingStations: [
            createActualPollingStation('109002012501', 'Maubwe Primary School-01', 587),
            createActualPollingStation('109002012601', 'Kasamu Community School-01', 416),
            createActualPollingStation('109002012701', 'Mbabala Primary School-01', 746),
            createActualPollingStation('109002012702', 'Mbabala Primary School-02', 745),
            createActualPollingStation('109002012703', 'Mbabala Primary School-03', 745),
            createActualPollingStation('109002012801', 'Mandala Primary School-01', 942),
            createActualPollingStation('109002012901', 'Namuhila Community School-01', 412),
          ],
        },
      ],
    },
  ],
};

// ============================================================================
// 2. KALOMO District (Southern Province) - ACTUAL DATA from mockData.ts
// District Code: 109004  
// 3 Constituencies, 20 Wards, 154 Polling Stations
// ============================================================================

export const kalomoDistrict: District = {
  id: 'kalomo',
  name: 'KALOMO',
  mayoralCandidates: generateMayoralCandidates('kalomo'),
  constituencies: [
    {
      id: 'dundumwezi',
      name: 'DUNDUMWEZI',
      mpCandidates: generateMPCandidates('dundumwezi'),
      wards: [
        {
          id: 'kasukwe',
          name: 'KASUKWE',
          councillorCandidates: generateCouncillorCandidates('kasukwe'),
          pollingStations: [
            createActualPollingStation('109004000101', 'Dunuka Primary School-01', 723),
            createActualPollingStation('109004000201', 'Kasukwe Basic School-01', 681),
            createActualPollingStation('109004000202', 'Kasukwe Basic School-02', 680),
            createActualPollingStation('109004000203', 'Kasukwe Basic School-03', 680),
            createActualPollingStation('109004000301', 'Nakatala Primary School-01', 862),
            createActualPollingStation('109004000401', 'Kalemu Basic School-01', 599),
            createActualPollingStation('109004000402', 'Kalemu Basic School-02', 599),
          ],
        },
        {
          id: 'katanda',
          name: 'KATANDA',
          councillorCandidates: generateCouncillorCandidates('katanda'),
          pollingStations: [
            createActualPollingStation('109004001401', 'Bongo Community School-01', 759),
            createActualPollingStation('109004001402', 'Bongo Community School-02', 759),
            createActualPollingStation('109004001501', 'Katanda Secondary School-01', 520),
            createActualPollingStation('109004001502', 'Katanda Secondary School-02', 520),
            createActualPollingStation('109004001601', 'Nabulangu Primary School-01', 694),
            createActualPollingStation('109004001602', 'Nabulangu Primary School-02', 694),
            createActualPollingStation('109004001603', 'Nabulangu Primary School-03', 693),
          ],
        },
        {
          id: 'omba',
          name: 'OMBA',
          councillorCandidates: generateCouncillorCandidates('omba'),
          pollingStations: [
            createActualPollingStation('109004001701', 'Maila-Male Basic School-01', 933),
            createActualPollingStation('109004001801', 'Shamba Community School-01', 876),
            createActualPollingStation('109004001901', 'Nkandanzovu Basic School-01', 808),
            createActualPollingStation('109004001902', 'Nkandanzovu Basic School-02', 807),
            createActualPollingStation('109004002001', 'Omba Basic School-01', 553),
            createActualPollingStation('109004002002', 'Omba Basic School-02', 552),
            createActualPollingStation('109004002101', 'Bulyambeba Basic School-01', 764),
            createActualPollingStation('109004002102', 'Bulyambeba Basic School-02', 764),
          ],
        },
        {
          id: 'mikata',
          name: 'MIKATA',
          councillorCandidates: generateCouncillorCandidates('mikata'),
          pollingStations: [
            createActualPollingStation('109004002201', 'Mikata Basic School-01', 597),
            createActualPollingStation('109004002202', 'Mikata Basic School-02', 597),
            createActualPollingStation('109004002301', 'Mwiili Community School-01', 692),
            createActualPollingStation('109004002401', 'Nakalombwe Community School-01', 518),
            createActualPollingStation('109004002402', 'Nakalombwe Community School-02', 517),
            createActualPollingStation('109004002501', 'Kabombo Community School-01', 589),
            createActualPollingStation('109004002601', 'Bungashiya Basic School-01', 563),
            createActualPollingStation('109004002602', 'Bungashiya Basic School-02', 562),
            createActualPollingStation('109004002701', 'Chilwi Primary School-01', 754),
          ],
        },
        {
          id: 'chikanta',
          name: 'CHIKANTA',
          councillorCandidates: generateCouncillorCandidates('chikanta'),
          pollingStations: [
            createActualPollingStation('109004002801', 'Mabombo Basic School-01', 546),
            createActualPollingStation('109004002802', 'Mabombo Basic School-02', 546),
            createActualPollingStation('109004002901', 'Hapuya Primary School-01', 712),
            createActualPollingStation('109004003001', 'Habulile Basic School-01', 748),
            createActualPollingStation('109004003002', 'Habulile Basic School-02', 748),
            createActualPollingStation('109004003003', 'Habulile Basic School-03', 748),
            createActualPollingStation('109004003101', 'Chikanta Basic School-01', 873),
            createActualPollingStation('109004003102', 'Chikanta Basic School-02', 872),
            createActualPollingStation('109004003201', 'Mweebo Basic School-01', 714),
            createActualPollingStation('109004003301', 'Chilala Basic School-01', 840),
          ],
        },
        {
          id: 'chamuka',
          name: 'CHAMUKA',
          councillorCandidates: generateCouncillorCandidates('chamuka'),
          pollingStations: [
            createActualPollingStation('109004003401', 'Sichimbwali Basic School-01', 808),
            createActualPollingStation('109004003402', 'Sichimbwali Basic School-02', 807),
            createActualPollingStation('109004003501', 'Siantete Basic School-01', 623),
            createActualPollingStation('109004003502', 'Siantete Basic School-02', 622),
            createActualPollingStation('109004003601', 'Siabunkululu Primary School-01', 717),
            createActualPollingStation('109004003701', 'Munyeke Basic School-01', 613),
            createActualPollingStation('109004003702', 'Munyeke Basic School-02', 613),
          ],
        },
      ],
    },
    {
      id: 'kalomo-central',
      name: 'KALOMO CENTRAL',
      mpCandidates: generateMPCandidates('kalomo-central'),
      wards: [
        {
          id: 'naluja',
          name: 'NALUJA',
          councillorCandidates: generateCouncillorCandidates('naluja'),
          pollingStations: [
            createActualPollingStation('109004000501', 'Naluja Basic School-01', 951),
            createActualPollingStation('109004000502', 'Naluja Basic School-02', 950),
            createActualPollingStation('109004000601', 'Mubanga Basic School-01', 888),
            createActualPollingStation('109004000602', 'Mubanga Basic School-02', 888),
            createActualPollingStation('109004000701', 'Siamankuli Primary School-01', 915),
            createActualPollingStation('109004000801', 'Simwanda Basic School-01', 844),
            createActualPollingStation('109004000901', 'Nameto Basic School-01', 938),
            createActualPollingStation('109004001001', 'Siamusunse Basic School-01', 900),
          ],
        },
        {
          id: 'bbilili',
          name: 'BBILILI',
          councillorCandidates: generateCouncillorCandidates('bbilili'),
          pollingStations: [
            createActualPollingStation('109004001101', 'Nsalali Basic School-01', 934),
            createActualPollingStation('109004001102', 'Nsalali Basic School-02', 934),
            createActualPollingStation('109004001201', 'Bbilili Basic School-01', 993),
            createActualPollingStation('109004001202', 'Bbilili Basic School-02', 992),
            createActualPollingStation('109004001301', 'Nabusanga Primary School-01', 580),
            createActualPollingStation('109004001302', 'Nabusanga Primary School-02', 580),
          ],
        },
        {
          id: 'chifusa',
          name: 'CHIFUSA',
          councillorCandidates: generateCouncillorCandidates('chifusa'),
          pollingStations: [
            createActualPollingStation('109004003801', 'Mayobo Basic School-01', 741),
            createActualPollingStation('109004003901', 'Chifusa Basic School-01', 802),
            createActualPollingStation('109004003902', 'Chifusa Basic School-02', 801),
            createActualPollingStation('109004004001', 'Maumbwe Basic School-01', 686),
            createActualPollingStation('109004004002', 'Maumbwe Basic School-02', 685),
            createActualPollingStation('109004004101', 'Namoomba Primary School-01', 743),
          ],
        },
        {
          id: 'siachitema',
          name: 'SIACHITEMA',
          councillorCandidates: generateCouncillorCandidates('siachitema'),
          pollingStations: [
            createActualPollingStation('109004004201', 'Chibomboma Primary School-01', 660),
            createActualPollingStation('109004004202', 'Chibomboma Primary School-02', 659),
            createActualPollingStation('109004004301', 'Nakabanga Primary School-01', 997),
            createActualPollingStation('109004004401', 'Njezya Primary School-01', 721),
            createActualPollingStation('109004004402', 'Njezya Primary School-02', 720),
            createActualPollingStation('109004004501', 'Siachitema Secondary School-01', 669),
            createActualPollingStation('109004004502', 'Siachitema Secondary School-02', 669),
            createActualPollingStation('109004004503', 'Siachitema Secondary School-03', 669),
          ],
        },
        {
          id: 'kalonda',
          name: 'KALONDA',
          councillorCandidates: generateCouncillorCandidates('kalonda'),
          pollingStations: [
            createActualPollingStation('109004004601', 'Siampayuma Primary School-01', 912),
            createActualPollingStation('109004004701', 'Katundulu Basic School-01', 967),
            createActualPollingStation('109004004801', 'Munyenye Primary School-01', 571),
            createActualPollingStation('109004004901', 'Nantale Primary School-01', 762),
            createActualPollingStation('109004004902', 'Nantale Primary School-02', 762),
            createActualPollingStation('109004005001', 'Kalondo Basic School-01', 720),
            createActualPollingStation('109004005002', 'Kalondo Basic School-02', 720),
            createActualPollingStation('109004005101', 'Tara Basic School-01', 743),
            createActualPollingStation('109004005201', 'Zyangale Primary School-01', 575),
          ],
        },
        {
          id: 'choonga',
          name: 'CHOONGA',
          councillorCandidates: generateCouncillorCandidates('choonga'),
          pollingStations: [
            createActualPollingStation('109004005301', 'Kanyaya Shed-01', 721),
            createActualPollingStation('109004005401', 'Choonga Secondary School-01', 520),
            createActualPollingStation('109004005402', 'Choonga Secondary School-02', 520),
            createActualPollingStation('109004005501', 'Muchenje Primary School-01', 738),
            createActualPollingStation('109004005601', 'Mabuyu Primary School-01', 951),
            createActualPollingStation('109004057501', 'Kalomo Correctional Centre-01', 575),
          ],
        },
        {
          id: 'mwaata',
          name: 'MWAATA',
          councillorCandidates: generateCouncillorCandidates('mwaata'),
          pollingStations: [
            createActualPollingStation('109004005701', 'Simakakata Primary School-01', 586),
            createActualPollingStation('109004005801', 'Green Acres Basic School-01', 886),
            createActualPollingStation('109004005802', 'Green Acres Basic School-02', 886),
            createActualPollingStation('109004005803', 'Green Acres Basic School-03', 885),
            createActualPollingStation('109004005804', 'Green Acres Basic School-04', 885),
            createActualPollingStation('109004005805', 'Green Acres Basic School-05', 885),
            createActualPollingStation('109004005806', 'Green Acres Basic School-06', 885),
            createActualPollingStation('109004005807', 'Green Acres Basic School-07', 885),
            createActualPollingStation('109004005901', 'Mwata Secondary School-01', 855),
            createActualPollingStation('109004005902', 'Mwata Secondary School-02', 855),
            createActualPollingStation('109004005903', 'Mwata Secondary School-03', 855),
            createActualPollingStation('109004005904', 'Mwata Secondary School-04', 855),
            createActualPollingStation('109004005905', 'Mwata Secondary School-05', 855),
            createActualPollingStation('109004005906', 'Mwata Secondary School-06', 855),
            createActualPollingStation('109004006001', 'Kalomo Secondary School-01', 811),
            createActualPollingStation('109004006002', 'Kalomo Secondary School-02', 811),
            createActualPollingStation('109004006003', 'Kalomo Secondary School-03', 810),
            createActualPollingStation('109004006004', 'Kalomo Secondary School-04', 810),
          ],
        },
        {
          id: 'chilesha',
          name: 'CHILESHA',
          councillorCandidates: generateCouncillorCandidates('chilesha'),
          pollingStations: [
            createActualPollingStation('109004006101', 'Matondo Primary School-01', 710),
            createActualPollingStation('109004006102', 'Matondo Primary School-02', 709),
            createActualPollingStation('109004006201', 'Rural Reconstruction Primary School-01', 906),
          ],
        },
      ],
    },
    {
      id: 'kalomo-south',
      name: 'KALOMO SOUTH',
      mpCandidates: generateMPCandidates('kalomo-south'),
      wards: [
        {
          id: 'mayoba',
          name: 'MAYOBA',
          councillorCandidates: generateCouncillorCandidates('mayoba'),
          pollingStations: [
            createActualPollingStation('109004006301', 'Sianyama Primary School-01', 270),
            createActualPollingStation('109004006401', 'Simuyuni Primary School-01', 582),
            createActualPollingStation('109004006501', 'Munkolo Basic School-01', 857),
            createActualPollingStation('109004006601', 'Mayoba Basic School-01', 532),
            createActualPollingStation('109004006602', 'Mayoba Basic School-02', 531),
            createActualPollingStation('109004006701', 'African Rivival Primary School-01', 552),
          ],
        },
        {
          id: 'namwianga',
          name: 'NAMWIANGA',
          councillorCandidates: generateCouncillorCandidates('namwianga'),
          pollingStations: [
            createActualPollingStation('109004006801', 'Mukwela Basic School-01', 689),
            createActualPollingStation('109004006802', 'Mukwela Basic School-02', 689),
            createActualPollingStation('109004006803', 'Mukwela Basic School-03', 688),
            createActualPollingStation('109004006901', 'Siabalumbi Primary School-01', 392),
            createActualPollingStation('109004007001', 'Good Hope Basic School-01', 718),
            createActualPollingStation('109004007101', 'Namwianga Basic School-01', 816),
            createActualPollingStation('109004007201', 'Bbelo Basic School-01', 687),
            createActualPollingStation('109004007301', 'Mutala B Primary School-01', 322),
          ],
        },
        {
          id: 'sipatunyana',
          name: 'SIPATUNYANA',
          councillorCandidates: generateCouncillorCandidates('sipatunyana'),
          pollingStations: [
            createActualPollingStation('109004007401', 'Nalubumba Basic School-01', 509),
            createActualPollingStation('109004007402', 'Nalubumba Basic School-02', 508),
            createActualPollingStation('109004007501', 'Inkumbi Basic School-01', 915),
            createActualPollingStation('109004007601', 'Inkumbi Local Court-01', 936),
            createActualPollingStation('109004007701', 'Lusumpuko Community School-01', 477),
            createActualPollingStation('109004007801', 'Kasikili Basic School-01', 884),
          ],
        },
        {
          id: 'chawila',
          name: 'CHAWILA',
          councillorCandidates: generateCouncillorCandidates('chawila'),
          pollingStations: [
            createActualPollingStation('109004007901', 'Mwiita Co-operative Shed-01', 502),
            createActualPollingStation('109004007902', 'Mwiita Co-operative Shed-02', 501),
            createActualPollingStation('109004008001', 'Sikweya Basic School-01', 513),
            createActualPollingStation('109004008002', 'Sikweya Basic School-02', 512),
            createActualPollingStation('109004008101', 'Mbole Primary School-01', 571),
            createActualPollingStation('109004008201', 'Chawila Basic School-01', 741),
            createActualPollingStation('109004008301', 'Kanchele Community School-01', 755),
            createActualPollingStation('109004008302', 'Kanchele Community School-02', 754),
          ],
        },
        {
          id: 'simayakwe',
          name: 'SIMAYAKWE',
          councillorCandidates: generateCouncillorCandidates('simayakwe'),
          pollingStations: [
            createActualPollingStation('109004008401', 'Nazilongo Basic School-01', 511),
            createActualPollingStation('109004008402', 'Nazilongo Basic School-02', 510),
            createActualPollingStation('109004008501', 'Moonde Basic School-01', 691),
            createActualPollingStation('109004008502', 'Moonde Basic School-02', 691),
            createActualPollingStation('109004008503', 'Moonde Basic School-03', 691),
            createActualPollingStation('109004008601', 'Mulwazi Primary School-01', 775),
          ],
        },
        {
          id: 'nachikungu',
          name: 'NACHIKUNGU',
          councillorCandidates: generateCouncillorCandidates('nachikungu'),
          pollingStations: [
            createActualPollingStation('109004008701', 'Mahimbwa SDA Church-01', 487),
            createActualPollingStation('109004008801', 'Kasizi Basic School-01', 541),
            createActualPollingStation('109004008802', 'Kasizi Basic School-02', 541),
            createActualPollingStation('109004008901', 'Dimbwe Basic School-01', 764),
            createActualPollingStation('109004008902', 'Dimbwe Basic School-02', 763),
            createActualPollingStation('109004009001', 'Masempela Basic School-01', 779),
            createActualPollingStation('109004009002', 'Masempela Basic School-02', 778),
            createActualPollingStation('109004009101', 'Dabali Basic School-01', 994),
          ],
        },
      ],
    },
  ],
};

// ============================================================================
// 3. SHIWANG'ANDU District (Muchinga Province) - ACTUAL DATA from mockData.ts
// District Code: 106007
// 1 Constituency, 13 Wards, 76 Polling Stations
// ============================================================================
export const shiwangAnduDistrict: District = {
  id: 'shiwangandu',
  name: 'SHIWANG\'ANDU',
  mayoralCandidates: generateMayoralCandidates('shiwangandu'),
  constituencies: [
    {
      id: 'shiwangandu',
      name: 'SHIWAN\'GANDU',
      mpCandidates: generateMPCandidates('shiwangandu'),
      wards: [
        {
          id: 'nkulungwe',
          name: 'NKULUNGWE',
          councillorCandidates: generateCouncillorCandidates('nkulungwe'),
          pollingStations: [
            createActualPollingStation('106007000101', 'Kalesha Community School-01', 305),
            createActualPollingStation('106007000201', 'Kantimba Primary School-01', 858),
            createActualPollingStation('106007000301', 'Kalonga Primary School-01', 525),
            createActualPollingStation('106007000401', 'Mwika Primary School-01', 936),
          ],
        },
        {
          id: 'nyimbwe',
          name: 'NYIMBWE',
          councillorCandidates: generateCouncillorCandidates('nyimbwe'),
          pollingStations: [
            createActualPollingStation('106007000501', 'Catholic Church-01', 862),
            createActualPollingStation('106007000601', 'Mutitima Primary School-01', 739),
            createActualPollingStation('106007000701', 'Chibamba Primary School-01', 819),
            createActualPollingStation('106007000801', 'Mufushi Primary School-01', 527),
          ],
        },
        {
          id: 'chimpundu',
          name: 'CHIMPUNDU',
          councillorCandidates: generateCouncillorCandidates('chimpundu'),
          pollingStations: [
            createActualPollingStation('106007000901', 'Masongo Primary School-01', 613),
            createActualPollingStation('106007001001', 'Mapampa Primary School-01', 309),
            createActualPollingStation('106007001101', 'Ilondola Primary School-01', 729),
            createActualPollingStation('106007001102', 'Ilondola Primary School-02', 729),
            createActualPollingStation('106007001103', 'Ilondola Primary School-03', 728),
            createActualPollingStation('106007001201', 'Chitundu Primary School-01', 292),
          ],
        },
        {
          id: 'kalebe',
          name: 'KALEBE',
          councillorCandidates: generateCouncillorCandidates('kalebe'),
          pollingStations: [
            createActualPollingStation('106007001301', 'Ketani Primary School-01', 325),
            createActualPollingStation('106007001401', 'Mungulube Primary School-01', 412),
            createActualPollingStation('106007001501', 'Chikuta Community School-01', 233),
            createActualPollingStation('106007001601', 'Lwishishe Primary School-01', 378),
            createActualPollingStation('106007001701', 'Pesa Village-01', 171),
          ],
        },
        {
          id: 'mwilakabuswe',
          name: 'MWILAKABUSWE',
          councillorCandidates: generateCouncillorCandidates('mwilakabuswe'),
          pollingStations: [
            createActualPollingStation('106007001801', 'Poya Primary School-01', 162),
            createActualPollingStation('106007001901', 'Lupande Community School-01', 474),
            createActualPollingStation('106007002001', 'Nsuluka Primary School-01', 297),
            createActualPollingStation('106007002101', 'Konja Primary School-01', 779),
            createActualPollingStation('106007002201', 'Muntuwenda Primary School-01', 480),
            createActualPollingStation('106007002301', 'Yosamu Primary School-01', 583),
          ],
        },
        {
          id: 'muchinga',
          name: 'MUCHINGA',
          councillorCandidates: generateCouncillorCandidates('muchinga'),
          pollingStations: [
            createActualPollingStation('106007002401', 'Chisaka Community School-01', 191),
            createActualPollingStation('106007002501', 'Chinkumba Primary School-01', 825),
            createActualPollingStation('106007002601', 'Kanakashi Community School-01', 874),
            createActualPollingStation('106007002701', 'Matumbo Primary School-01', 915),
            createActualPollingStation('106007002702', 'Matumbo Primary School-02', 915),
            createActualPollingStation('106007002801', 'Chibesakunda Primary School-01', 860),
          ],
        },
        {
          id: 'mwambwa',
          name: 'MWAMBWA',
          councillorCandidates: generateCouncillorCandidates('mwambwa'),
          pollingStations: [
            createActualPollingStation('106007002901', 'Chuma Village-01', 504),
            createActualPollingStation('106007002902', 'Chuma Village-02', 504),
            createActualPollingStation('106007003001', 'Bwalya Chanda School-01', 377),
            createActualPollingStation('106007003101', 'Nshitima UCZ Church-01', 350),
            createActualPollingStation('106007003201', 'Mulanga Primary School-01', 703),
          ],
        },
        {
          id: 'chamusenga',
          name: 'CHAMUSENGA',
          councillorCandidates: generateCouncillorCandidates('chamusenga'),
          pollingStations: [
            createActualPollingStation('106007003301', 'Chabola Primary School-01', 489),
            createActualPollingStation('106007003401', 'Kabale Primary School-01', 444),
            createActualPollingStation('106007003501', 'Kalikiti Primary School-01', 741),
            createActualPollingStation('106007003601', 'Chindoshi Primary School-01', 319),
            createActualPollingStation('106007003701', 'Chimbwese Primary School-01', 271),
            createActualPollingStation('106007003801', 'Chipapa Primary School-01', 217),
          ],
        },
        {
          id: 'chandaula',
          name: 'CHANDAULA',
          councillorCandidates: generateCouncillorCandidates('chandaula'),
          pollingStations: [
            createActualPollingStation('106007003901', 'Katoma Primary School-01', 553),
            createActualPollingStation('106007004001', 'Kabuswe Community School-01', 305),
            createActualPollingStation('106007004101', 'Mwenge Primary School-01', 293),
            createActualPollingStation('106007004201', 'Kasangala Primary School-01', 875),
            createActualPollingStation('106007004301', 'Kasashi Primary School-01', 242),
            createActualPollingStation('106007004401', 'Kabangama Primary School-01', 557),
          ],
        },
        {
          id: 'manshya',
          name: 'MANSHYA',
          councillorCandidates: generateCouncillorCandidates('manshya'),
          pollingStations: [
            createActualPollingStation('106007004501', 'Philip Primary School-01', 667),
            createActualPollingStation('106007004601', 'Chiseko Primary School-01', 216),
            createActualPollingStation('106007004701', 'Timba Primary School-01', 169),
            createActualPollingStation('106007004801', 'Shiwang\'andu Primary School-01', 236),
            createActualPollingStation('106007004901', 'Kalalantekwe Primary School-01', 724),
            createActualPollingStation('106007004902', 'Kalalantekwe Primary School-02', 723),
            createActualPollingStation('106007004903', 'Kalalantekwe Primary School-03', 723),
            createActualPollingStation('106007005001', 'Musonko Primary School-01', 596),
          ],
        },
        {
          id: 'mukumbi',
          name: 'MUKUMBI',
          councillorCandidates: generateCouncillorCandidates('mukumbi'),
          pollingStations: [
            createActualPollingStation('106007005101', 'Chpindo Primary School-01', 341),
            createActualPollingStation('106007005201', 'Lwanya Primary School-01', 707),
            createActualPollingStation('106007005301', 'Mukwikile Primary School-01', 513),
            createActualPollingStation('106007005302', 'Mukwikile Primary School-02', 513),
            createActualPollingStation('106007005401', 'Mwilwa Primary School-01', 370),
          ],
        },
        {
          id: 'kulamwele',
          name: 'KULAMWELE',
          councillorCandidates: generateCouncillorCandidates('kulamwele'),
          pollingStations: [
            createActualPollingStation('106007005501', 'Chabala Primary School-01', 519),
            createActualPollingStation('106007005601', 'Kaloswe Primary School-01', 124),
            createActualPollingStation('106007005701', 'Chakulwa Primary School-01', 251),
            createActualPollingStation('106007005801', 'Macheleta Community Hall-01', 409),
            createActualPollingStation('106007005901', 'Mukungwa Primary School-01', 536),
          ],
        },
        {
          id: 'lukalashi',
          name: 'LUKALASHI',
          councillorCandidates: generateCouncillorCandidates('lukalashi'),
          pollingStations: [
            createActualPollingStation('106007006001', 'Lukalashi Primary School-01', 258),
            createActualPollingStation('106007006101', 'Nabutende Primary School-01', 291),
            createActualPollingStation('106007006201', 'Kapisha Primary School-01', 581),
          ],
        },
      ],
    },
  ],
};

// ============================================================================
// 4. CHIENGI District (Luapula Province) - PLACEHOLDER DATA
// NOTE: Actual data not yet available
// ============================================================================
export const chiengiDistrict: District = {
  id: 'chiengi',
  name: 'CHIENGI',
  mayoralCandidates: generateMayoralCandidates('chiengi'),
  constituencies: [
    {
      id: 'chiengi-central',
      name: 'CHIENGI CENTRAL',
      mpCandidates: generateMPCandidates('chiengi-central'),
      wards: [
        {
          id: 'chiengi-boma',
          name: 'CHIENGI BOMA',
          councillorCandidates: generateCouncillorCandidates('chiengi-boma'),
          pollingStations: [
            createActualPollingStation('110001000101', 'Chiengi Boma-01', 780),
            createActualPollingStation('110001000201', 'Chiengi Primary School-01', 820),
            createActualPollingStation('110001000301', 'Chiengi District Office-01', 690),
          ],
        },
        {
          id: 'kaputa',
          name: 'KAPUTA',
          councillorCandidates: generateCouncillorCandidates('kaputa'),
          pollingStations: [
            createActualPollingStation('110001000401', 'Kaputa Primary School-01', 710),
            createActualPollingStation('110001000501', 'Kaputa Community Hall-01', 640),
          ],
        },
        {
          id: 'puta',
          name: 'PUTA',
          councillorCandidates: generateCouncillorCandidates('puta'),
          pollingStations: [
            createActualPollingStation('110001000601', 'Puta Primary School-01', 620),
            createActualPollingStation('110001000701', 'Puta Trading Center-01', 560),
          ],
        },
        {
          id: 'kashiba',
          name: 'KASHIBA',
          councillorCandidates: generateCouncillorCandidates('kashiba'),
          pollingStations: [
            createActualPollingStation('110001000801', 'Kashiba Primary School-01', 590),
            createActualPollingStation('110001000901', 'Kashiba Community School-01', 530),
          ],
        },
        {
          id: 'mofwe',
          name: 'MOFWE',
          councillorCandidates: generateCouncillorCandidates('mofwe'),
          pollingStations: [
            createActualPollingStation('110001001001', 'Mofwe Primary School-01', 650),
            createActualPollingStation('110001001101', 'Mofwe Community Hall-01', 580),
          ],
        },
      ],
    },
  ],
};

export const missingDistricts = {
  choma: chomaDistrict,
  kalomo: kalomoDistrict,
  shiwangandu: shiwangAnduDistrict,
  chiengi: chiengiDistrict,
};
