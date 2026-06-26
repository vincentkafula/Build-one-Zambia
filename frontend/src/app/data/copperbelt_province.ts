import { generateMayoralCandidates, generateMPCandidates, generateCouncillorCandidates, createActualPollingStation } from "../utils/candidateGenerators";

export const copperbeltProvinceData = {
  id: "copperbelt",
  name: "Copperbelt",
  mayoralCandidates: generateMayoralCandidates("copperbelt"),
  districts: [
    {
      id: "chililabombwe",
      name: "CHILILABOMBWE",
      mayoralCandidates: generateMayoralCandidates("chililabombwe"),
      constituencies: [
        {
          id: "copperbelt-chililabombwe-chililabombwe",
          name: "CHILILABOMBWE",
          mpCandidates: generateMPCandidates("copperbelt-chililabombwe-chililabombwe"),
          wards: [
            {
              id: "copperbelt-chililabombwe-chililabombwe-anoya-zulu",
              name: "ANOYA ZULU",
              councillorCandidates: generateCouncillorCandidates("copperbelt-chililabombwe-chililabombwe-anoya-zulu"),
              pollingStations: [
                createActualPollingStation("102001001701", "Church of God-01", 578),
                createActualPollingStation("102001001801", "Kasumbalesa Primary School-01", 820),
                createActualPollingStation("102001001802", "Kasumbalesa Primary School-02", 820),
                createActualPollingStation("102001001803", "Kasumbalesa Primary School-03", 820),
                createActualPollingStation("102001001804", "Kasumbalesa Primary School-04", 819),
                createActualPollingStation("102001001901", "Kakoso East Primary School-01", 504),
              ]
            },
            {
              id: "copperbelt-chililabombwe-chililabombwe-kawama",
              name: "KAWAMA",
              councillorCandidates: generateCouncillorCandidates("copperbelt-chililabombwe-chililabombwe-kawama"),
              pollingStations: [
                createActualPollingStation("102001002001", "Maina Soko Primary School-01", 382),
                createActualPollingStation("102001002101", "Kawama Primary School-01", 958),
                createActualPollingStation("102001002102", "Kawama Primary School-02", 957),
                createActualPollingStation("102001002103", "Kawama Primary School-03", 957),
                createActualPollingStation("102001002104", "Kawama Primary School-04", 957),
                createActualPollingStation("102001002105", "Kawama Primary School-05", 957),
                createActualPollingStation("102001002106", "Kawama Primary School-06", 957),
                createActualPollingStation("102001002107", "Kawama Primary School-07", 957),
              ]
            },
            {
              id: "copperbelt-chililabombwe-chililabombwe-lubansa",
              name: "LUBANSA",
              councillorCandidates: generateCouncillorCandidates("copperbelt-chililabombwe-chililabombwe-lubansa"),
              pollingStations: [
                createActualPollingStation("102001002201", "Lubansa Primary School-01", 855),
                createActualPollingStation("102001002202", "Lubansa Primary School-02", 854),
                createActualPollingStation("102001002301", "Milyashi RR Primary School-01", 647),
              ]
            },
            {
              id: "copperbelt-chililabombwe-chililabombwe-chitambi",
              name: "CHITAMBI",
              councillorCandidates: generateCouncillorCandidates("copperbelt-chililabombwe-chililabombwe-chitambi"),
              pollingStations: [
                createActualPollingStation("102001002401", "Fipimpili Primary School-01", 94),
                createActualPollingStation("102001002501", "Milyashi East Primary School-01", 275),
                createActualPollingStation("102001002601", "Fikolongo Primary School-01", 521),
                createActualPollingStation("102001002701", "Fitobaula Primary School-01", 763),
                createActualPollingStation("102001002702", "Fitobaula Primary School-02", 763),
              ]
            },
            {
              id: "copperbelt-chililabombwe-chililabombwe-kakoso",
              name: "KAKOSO",
              councillorCandidates: generateCouncillorCandidates("copperbelt-chililabombwe-chililabombwe-kakoso"),
              pollingStations: [
                createActualPollingStation("102001002801", "Mother Angela Convent School-01", 883),
                createActualPollingStation("102001002802", "Mother Angela Convent School-02", 883),
                createActualPollingStation("102001002803", "Mother Angela Convent School-03", 883),
                createActualPollingStation("102001002901", "Kakoso Primary School-01", 989),
                createActualPollingStation("102001002902", "Kakoso Primary School-02", 989),
                createActualPollingStation("102001002903", "Kakoso Primary School-03", 989),
                createActualPollingStation("102001002904", "Kakoso Primary School-04", 989),
              ]
            },
            {
              id: "copperbelt-chililabombwe-chililabombwe-kamenza-east",
              name: "KAMENZA EAST",
              councillorCandidates: generateCouncillorCandidates("copperbelt-chililabombwe-chililabombwe-kamenza-east"),
              pollingStations: [
                createActualPollingStation("102001003001", "Catholic Church-01", 807),
                createActualPollingStation("102001003002", "Catholic Church-02", 807),
                createActualPollingStation("102001003101", "Chico Primary School-01", 829),
                createActualPollingStation("102001003102", "Chico Primary School-02", 829),
                createActualPollingStation("102001003103", "Chico Primary School-03", 829),
              ]
            },
            {
              id: "copperbelt-chililabombwe-chililabombwe-mumba",
              name: "MUMBA",
              councillorCandidates: generateCouncillorCandidates("copperbelt-chililabombwe-chililabombwe-mumba"),
              pollingStations: [
                createActualPollingStation("102001003201", "Kamenza Secondary School-01", 699),
                createActualPollingStation("102001003202", "Kamenza Secondary School-02", 699),
                createActualPollingStation("102001003203", "Kamenza Secondary School-03", 698),
              ]
            },
            {
              id: "copperbelt-chililabombwe-chililabombwe-kafue",
              name: "KAFUE",
              councillorCandidates: generateCouncillorCandidates("copperbelt-chililabombwe-chililabombwe-kafue"),
              pollingStations: [
                createActualPollingStation("102001003301", "Cricket Club-01", 661),
                createActualPollingStation("102001003401", "Symposium-01", 706),
                createActualPollingStation("102001003501", "Mine Club-01", 556),
                createActualPollingStation("102001003502", "Mine Club-02", 555),
              ]
            },
            {
              id: "copperbelt-chililabombwe-chililabombwe-nakatindi",
              name: "NAKATINDI",
              councillorCandidates: generateCouncillorCandidates("copperbelt-chililabombwe-chililabombwe-nakatindi"),
              pollingStations: [
                createActualPollingStation("102001003601", "Youth Vocation Training Centre-01", 757),
                createActualPollingStation("102001003602", "Youth Vocation Training Centre-02", 757),
                createActualPollingStation("102001003701", "Chililabombwe Secondary School-01", 540),
                createActualPollingStation("102001003702", "Chililabombwe Secondary School-02", 540),
                createActualPollingStation("102001003801", "Lubengele Primary School-01", 670),
                createActualPollingStation("102001003802", "Lubengele Primary School-02", 669),
              ]
            },
            {
              id: "copperbelt-chililabombwe-chililabombwe-mukuka",
              name: "MUKUKA",
              councillorCandidates: generateCouncillorCandidates("copperbelt-chililabombwe-chililabombwe-mukuka"),
              pollingStations: [
                createActualPollingStation("102001004501", "Lubengele Community Hall-01", 805),
                createActualPollingStation("102001004502", "Lubengele Community Hall-02", 805),
                createActualPollingStation("102001004601", "Ishuko Tarven-01", 882),
                createActualPollingStation("102001004602", "Ishuko Tarven-02", 881),
                createActualPollingStation("102001004603", "Ishuko Tarven-03", 881),
              ]
            },
            {
              id: "copperbelt-chililabombwe-chililabombwe-yotam-muleya",
              name: "YOTAM MULEYA",
              councillorCandidates: generateCouncillorCandidates("copperbelt-chililabombwe-chililabombwe-yotam-muleya"),
              pollingStations: [
                createActualPollingStation("102001004701", "Canaan Community School-01", 688),
                createActualPollingStation("102001004702", "Canaan Community School-02", 687),
                createActualPollingStation("102001004703", "Canaan Community School-03", 687),
                createActualPollingStation("102001004801", "Old Apostolic Church-01", 959),
                createActualPollingStation("102001004802", "Old Apostolic Church-02", 958),
              ]
            },
          ]
        },
        {
          id: "copperbelt-chililabombwe-konkola",
          name: "KONKOLA",
          mpCandidates: generateMPCandidates("copperbelt-chililabombwe-konkola"),
          wards: [
            {
              id: "copperbelt-chililabombwe-konkola-chilimina",
              name: "CHILIMINA",
              councillorCandidates: generateCouncillorCandidates("copperbelt-chililabombwe-konkola-chilimina"),
              pollingStations: [
                createActualPollingStation("102001000101", "Fyeso (Temporal Shelter)-01", 148),
                createActualPollingStation("102001000201", "Chimfunshi Primary School-01", 853),
                createActualPollingStation("102001000301", "Malubeni Primary School-01", 594),
                createActualPollingStation("102001000401", "Chimfunshi River Bend Primary School-01", 196),
              ]
            },
            {
              id: "copperbelt-chililabombwe-konkola-miyanda",
              name: "MIYANDA",
              councillorCandidates: generateCouncillorCandidates("copperbelt-chililabombwe-konkola-miyanda"),
              pollingStations: [
                createActualPollingStation("102001000501", "Chankwashi Primary School-01", 186),
                createActualPollingStation("102001000601", "Namubwela Primary School-01", 168),
                createActualPollingStation("102001000701", "Butondo Primary School-01", 886),
              ]
            },
            {
              id: "copperbelt-chililabombwe-konkola-silwizya",
              name: "SILWIZYA",
              councillorCandidates: generateCouncillorCandidates("copperbelt-chililabombwe-konkola-silwizya"),
              pollingStations: [
                createActualPollingStation("102001000801", "Kantupu Primary School-01", 489),
                createActualPollingStation("102001000901", "Kafue River Bend Primary School-01", 398),
                createActualPollingStation("102001001001", "Kanenga Primary School-01", 470),
                createActualPollingStation("102001001101", "Chililabombwe Golf Club-01", 407),
                createActualPollingStation("102001001201", "Kanyemu Seventh Day Adventist Church-01", 249),
              ]
            },
            {
              id: "copperbelt-chililabombwe-konkola-joseph-mwilwa",
              name: "JOSEPH MWILWA",
              councillorCandidates: generateCouncillorCandidates("copperbelt-chililabombwe-konkola-joseph-mwilwa"),
              pollingStations: [
                createActualPollingStation("102001001301", "Miyanda Primary School-01", 779),
                createActualPollingStation("102001001401", "Konkola Primary School-01", 970),
                createActualPollingStation("102001001402", "Konkola Primary School-02", 969),
              ]
            },
            {
              id: "copperbelt-chililabombwe-konkola-kasumbalesa",
              name: "KASUMBALESA",
              councillorCandidates: generateCouncillorCandidates("copperbelt-chililabombwe-konkola-kasumbalesa"),
              pollingStations: [
                createActualPollingStation("102001001501", "New Konkola Primary School-01", 995),
                createActualPollingStation("102001001502", "New Konkola Primary School-02", 995),
                createActualPollingStation("102001001503", "New Konkola Primary School-03", 995),
                createActualPollingStation("102001001504", "New Konkola Primary School-04", 995),
                createActualPollingStation("102001001505", "New Konkola Primary School-05", 995),
                createActualPollingStation("102001001506", "New Konkola Primary School-06", 994),
                createActualPollingStation("102001001601", "Kasapa Primary School-01", 467),
              ]
            },
            {
              id: "copperbelt-chililabombwe-konkola-mvula",
              name: "MVULA",
              councillorCandidates: generateCouncillorCandidates("copperbelt-chililabombwe-konkola-mvula"),
              pollingStations: [
                createActualPollingStation("102001003901", "Mitondo Secondary School-01", 731),
                createActualPollingStation("102001003902", "Mitondo Secondary School-02", 730),
              ]
            },
            {
              id: "copperbelt-chililabombwe-konkola-chitimukulu",
              name: "CHITIMUKULU",
              councillorCandidates: generateCouncillorCandidates("copperbelt-chililabombwe-konkola-chitimukulu"),
              pollingStations: [
                createActualPollingStation("102001004001", "MUZ Offices-01", 528),
                createActualPollingStation("102001004002", "MUZ Offices-02", 527),
                createActualPollingStation("102001004101", "Kwacha Pentecostal Church-01", 532),
                createActualPollingStation("102001004102", "Kwacha Pentecostal Church-02", 531),
              ]
            },
            {
              id: "copperbelt-chililabombwe-konkola-ilute-yeta",
              name: "ILUTE YETA",
              councillorCandidates: generateCouncillorCandidates("copperbelt-chililabombwe-konkola-ilute-yeta"),
              pollingStations: [
                createActualPollingStation("102001004201", "St. Matthews UCZ Church-01", 933),
                createActualPollingStation("102001004202", "St. Matthews UCZ Church-02", 932),
              ]
            },
            {
              id: "copperbelt-chililabombwe-konkola-ngebe",
              name: "NGEBE",
              councillorCandidates: generateCouncillorCandidates("copperbelt-chililabombwe-konkola-ngebe"),
              pollingStations: [
                createActualPollingStation("102001004301", "MAIN Social Club-01", 777),
                createActualPollingStation("102001004302", "MAIN Social Club-02", 776),
                createActualPollingStation("102001004303", "MAIN Social Club-03", 776),
              ]
            },
            {
              id: "copperbelt-chililabombwe-konkola-kamima",
              name: "KAMIMA",
              councillorCandidates: generateCouncillorCandidates("copperbelt-chililabombwe-konkola-kamima"),
              pollingStations: [
                createActualPollingStation("102001004401", "Ward Office-01", 876),
                createActualPollingStation("102001004402", "Ward Office-02", 875),
              ]
            },
            {
              id: "copperbelt-chililabombwe-konkola-helen-kaunda",
              name: "HELEN KAUNDA",
              councillorCandidates: generateCouncillorCandidates("copperbelt-chililabombwe-konkola-helen-kaunda"),
              pollingStations: [
                createActualPollingStation("102001004901", "Muleya Secondary School-01", 980),
                createActualPollingStation("102001004902", "Muleya Secondary School-02", 980),
                createActualPollingStation("102001005001", "Chililabombwe Primary School-01", 276),
              ]
            },
            {
              id: "copperbelt-chililabombwe-konkola-james-phiri",
              name: "JAMES PHIRI",
              councillorCandidates: generateCouncillorCandidates("copperbelt-chililabombwe-konkola-james-phiri"),
              pollingStations: [
                createActualPollingStation("102001005101", "Ming'omba Primary School-01", 327),
                createActualPollingStation("102001005201", "Sansamukeni Private School-01", 857),
                createActualPollingStation("102001005202", "Sansamukeni Private School-02", 857),
                createActualPollingStation("102001005301", "Ming'omba Primary School-01", 602),
                createActualPollingStation("102001005302", "Ming'omba Primary School-02", 602),
              ]
            },
            {
              id: "copperbelt-chililabombwe-konkola-mathew-nkoloma",
              name: "MATHEW NKOLOMA",
              councillorCandidates: generateCouncillorCandidates("copperbelt-chililabombwe-konkola-mathew-nkoloma"),
              pollingStations: [
                createActualPollingStation("102001005401", "Ming'omba Primary School-01", 978),
                createActualPollingStation("102001005501", "Nsofu Nazarene Church-01", 789),
                createActualPollingStation("102001005502", "Nsofu Nazarene Church-02", 788),
              ]
            },
          ]
        },
      ]
    },
    {
      id: "chingola",
      name: "CHINGOLA",
      mayoralCandidates: generateMayoralCandidates("chingola"),
      constituencies: [
        {
          id: "copperbelt-chingola-chingola-central",
          name: "CHINGOLA CENTRAL",
          mpCandidates: generateMPCandidates("copperbelt-chingola-chingola-central"),
          wards: [
            {
              id: "copperbelt-chingola-chingola-central-chikola",
              name: "CHIKOLA",
              councillorCandidates: generateCouncillorCandidates("copperbelt-chingola-chingola-central-chikola"),
              pollingStations: [
                createActualPollingStation("102002004001", "Chiwempala Housing Offices-01", 753),
                createActualPollingStation("102002004101", "Twatasha Primary School-01", 695),
                createActualPollingStation("102002004102", "Twatasha Primary School-02", 694),
                createActualPollingStation("102002004201", "Chikola Secondary School-01", 876),
                createActualPollingStation("102002004202", "Chikola Secondary School-02", 876),
                createActualPollingStation("102002004203", "Chikola Secondary School-03", 876),
                createActualPollingStation("102002004204", "Chikola Secondary School-04", 876),
                createActualPollingStation("102002004205", "Chikola Secondary School-05", 876),
              ]
            },
            {
              id: "copperbelt-chingola-chingola-central-chingola",
              name: "CHINGOLA",
              councillorCandidates: generateCouncillorCandidates("copperbelt-chingola-chingola-central-chingola"),
              pollingStations: [
                createActualPollingStation("102002004301", "Chingola Secondary School-01", 791),
                createActualPollingStation("102002004302", "Chingola Secondary School-02", 791),
                createActualPollingStation("102002004401", "Nakatindi Primary School-01", 855),
                createActualPollingStation("102002004402", "Nakatindi Primary School-02", 855),
                createActualPollingStation("102002004403", "Nakatindi Primary School-03", 855),
                createActualPollingStation("102002004501", "Fair Haven Private School-01", 519),
                createActualPollingStation("102002004502", "Fair Haven Private School-02", 518),
                createActualPollingStation("102002004601", "Twateka Primary School-01", 862),
                createActualPollingStation("102002004602", "Twateka Primary School-02", 861),
                createActualPollingStation("102002004603", "Twateka Primary School-03", 861),
                createActualPollingStation("102002004701", "SDA Riverside Church-01", 952),
                createActualPollingStation("102002052401", "Chingola Correctional Facility-01", 328),
              ]
            },
            {
              id: "copperbelt-chingola-chingola-central-kasompe",
              name: "KASOMPE",
              councillorCandidates: generateCouncillorCandidates("copperbelt-chingola-chingola-central-kasompe"),
              pollingStations: [
                createActualPollingStation("102002004801", "Kasompe Primary School-01", 931),
                createActualPollingStation("102002004901", "Kasompe Primary School-01", 167),
                createActualPollingStation("102002005001", "Kasompe Primary School-01", 957),
                createActualPollingStation("102002005002", "Kasompe Primary School-02", 957),
                createActualPollingStation("102002005003", "Kasompe Primary School-03", 957),
                createActualPollingStation("102002005101", "Cooperative Centre (Tent)-01", 168),
                createActualPollingStation("102002005201", "Muntimpa Primary School-01", 72),
                createActualPollingStation("102002005301", "Muntimpa Primary School-01", 126),
              ]
            },
            {
              id: "copperbelt-chingola-chingola-central-musenga",
              name: "MUSENGA",
              councillorCandidates: generateCouncillorCandidates("copperbelt-chingola-chingola-central-musenga"),
              pollingStations: [
                createActualPollingStation("102002005401", "Evangelical Church-01", 449),
                createActualPollingStation("102002005501", "Musenga Primary School-01", 951),
                createActualPollingStation("102002005502", "Musenga Primary School-02", 951),
              ]
            },
            {
              id: "copperbelt-chingola-chingola-central-mimbula",
              name: "MIMBULA",
              councillorCandidates: generateCouncillorCandidates("copperbelt-chingola-chingola-central-mimbula"),
              pollingStations: [
                createActualPollingStation("102002005601", "Restored Community School-01", 976),
                createActualPollingStation("102002005602", "Restored Community School-02", 976),
                createActualPollingStation("102002005603", "Restored Community School-03", 976),
                createActualPollingStation("102002005604", "Restored Community School-04", 976),
                createActualPollingStation("102002005701", "Kasompe Community Hall-01", 617),
                createActualPollingStation("102002005801", "Kasompe Community Hall-01", 718),
                createActualPollingStation("102002005802", "Kasompe Community Hall-02", 717),
                createActualPollingStation("102002005901", "Bwingimilonga Primary School-01", 204),
                createActualPollingStation("102002006001", "Muntimpa Primary School-01", 353),
                createActualPollingStation("102002006101", "Kakalo Primary School-01", 411),
              ]
            },
            {
              id: "copperbelt-chingola-chingola-central-lulamba",
              name: "LULAMBA",
              councillorCandidates: generateCouncillorCandidates("copperbelt-chingola-chingola-central-lulamba"),
              pollingStations: [
                createActualPollingStation("102002006201", "Lulamba Primary School-01", 948),
                createActualPollingStation("102002006202", "Lulamba Primary School-02", 948),
                createActualPollingStation("102002006203", "Lulamba Primary School-03", 948),
                createActualPollingStation("102002006301", "Chigayo Community School-01", 688),
                createActualPollingStation("102002006302", "Chigayo Community School-02", 687),
                createActualPollingStation("102002006303", "Chigayo Community School-03", 687),
                createActualPollingStation("102002006401", "Lulamba Complex School-01", 776),
                createActualPollingStation("102002006501", "Lulamba Complex School-01", 587),
                createActualPollingStation("102002006601", "Lulamba Primary School-01", 892),
                createActualPollingStation("102002006602", "Lulamba Primary School-02", 891),
                createActualPollingStation("102002006603", "Lulamba Primary School-03", 891),
                createActualPollingStation("102002006604", "Lulamba Primary School-04", 891),
                createActualPollingStation("102002006605", "Lulamba Primary School-05", 891),
                createActualPollingStation("102002006606", "Lulamba Primary School-06", 891),
              ]
            },
            {
              id: "copperbelt-chingola-chingola-central-kamuchanga",
              name: "KAMUCHANGA",
              councillorCandidates: generateCouncillorCandidates("copperbelt-chingola-chingola-central-kamuchanga"),
              pollingStations: [
                createActualPollingStation("102002006701", "Fipuya Primary School-01", 889),
                createActualPollingStation("102002006801", "Mujomba Community School-01", 556),
                createActualPollingStation("102002006802", "Mujomba Community School-02", 555),
                createActualPollingStation("102002006901", "Kamuchanga Community School-01", 249),
                createActualPollingStation("102002007001", "Lushishi Primary School-01", 145),
              ]
            },
            {
              id: "copperbelt-chingola-chingola-central-chabanyama",
              name: "CHABANYAMA",
              councillorCandidates: generateCouncillorCandidates("copperbelt-chingola-chingola-central-chabanyama"),
              pollingStations: [
                createActualPollingStation("102002007801", "Chabanyama Primary School-01", 698),
                createActualPollingStation("102002007802", "Chabanyama Primary School-02", 698),
                createActualPollingStation("102002007901", "Chabanyama Primary School-01", 557),
                createActualPollingStation("102002007902", "Chabanyama Primary School-02", 556),
                createActualPollingStation("102002008001", "Chabanyama Primary School-01", 964),
                createActualPollingStation("102002008002", "Chabanyama Primary School-02", 964),
                createActualPollingStation("102002008003", "Chabanyama Primary School-03", 963),
                createActualPollingStation("102002008004", "Chabanyama Primary School-04", 963),
              ]
            },
            {
              id: "copperbelt-chingola-chingola-central-twatasha",
              name: "TWATASHA",
              councillorCandidates: generateCouncillorCandidates("copperbelt-chingola-chingola-central-twatasha"),
              pollingStations: [
                createActualPollingStation("102002008101", "New Twatasha Market (Tent)-01", 856),
                createActualPollingStation("102002008102", "New Twatasha Market (Tent)-02", 856),
                createActualPollingStation("102002008201", "New Twatasha Market (Tent)-01", 723),
                createActualPollingStation("102002008202", "New Twatasha Market (Tent)-02", 723),
                createActualPollingStation("102002008203", "New Twatasha Market (Tent)-03", 722),
                createActualPollingStation("102002008301", "New Twatasha Market (Tent)-01", 684),
                createActualPollingStation("102002008302", "New Twatasha Market (Tent)-02", 684),
                createActualPollingStation("102002008303", "New Twatasha Market (Tent)-03", 684),
              ]
            },
            {
              id: "copperbelt-chingola-chingola-central-gibson-chimfwembe",
              name: "GIBSON CHIMFWEMBE",
              councillorCandidates: generateCouncillorCandidates("copperbelt-chingola-chingola-central-gibson-chimfwembe"),
              pollingStations: [
                createActualPollingStation("102002008401", "Kachema Musuma-01", 826),
                createActualPollingStation("102002008402", "Kachema Musuma-02", 826),
                createActualPollingStation("102002008501", "Kachema Musuma-01", 764),
                createActualPollingStation("102002008502", "Kachema Musuma-02", 764),
                createActualPollingStation("102002008503", "Kachema Musuma-03", 763),
              ]
            },
          ]
        },
        {
          id: "copperbelt-chingola-nchanga",
          name: "NCHANGA",
          mpCandidates: generateMPCandidates("copperbelt-chingola-nchanga"),
          wards: [
            {
              id: "copperbelt-chingola-nchanga-kwacha",
              name: "KWACHA",
              councillorCandidates: generateCouncillorCandidates("copperbelt-chingola-nchanga-kwacha"),
              pollingStations: [
                createActualPollingStation("102002008601", "Accountancy Training College (ATC)-01", 385),
                createActualPollingStation("102002008701", "Mine Recreation Centre-01", 514),
                createActualPollingStation("102002008702", "Mine Recreation Centre-02", 514),
                createActualPollingStation("102002008801", "Nchanga Trust Upper Primary School-01", 834),
                createActualPollingStation("102002008802", "Nchanga Trust Upper Primary School-02", 834),
                createActualPollingStation("102002008901", "Mine Recreation Centre-01", 391),
              ]
            },
            {
              id: "copperbelt-chingola-nchanga-nchanga",
              name: "NCHANGA",
              councillorCandidates: generateCouncillorCandidates("copperbelt-chingola-nchanga-nchanga"),
              pollingStations: [
                createActualPollingStation("102002009001", "Nchanga Trust Secondary School-01", 513),
                createActualPollingStation("102002009002", "Nchanga Trust Secondary School-02", 513),
                createActualPollingStation("102002009101", "Nchanga Trust Secondary School-01", 611),
                createActualPollingStation("102002009201", "Nchanga Trust Secondary School-01", 492),
                createActualPollingStation("102002009301", "Nchanga Trust Secondary School-01", 574),
                createActualPollingStation("102002009401", "Nchanga Trust Secondary School-01", 472),
                createActualPollingStation("102002009501", "Nchanga Trust Secondary School-01", 704),
              ]
            },
            {
              id: "copperbelt-chingola-nchanga-sekela",
              name: "SEKELA",
              councillorCandidates: generateCouncillorCandidates("copperbelt-chingola-nchanga-sekela"),
              pollingStations: [
                createActualPollingStation("102002009601", "Matelo Primary School-01", 534),
                createActualPollingStation("102002009701", "Matelo Primary School-01", 712),
                createActualPollingStation("102002009801", "Sekela Secondary School-01", 871),
                createActualPollingStation("102002009901", "Sekela Secondary School-01", 758),
                createActualPollingStation("102002009902", "Sekela Secondary School-02", 758),
              ]
            },
            {
              id: "copperbelt-chingola-nchanga-nsansa",
              name: "NSANSA",
              councillorCandidates: generateCouncillorCandidates("copperbelt-chingola-nchanga-nsansa"),
              pollingStations: [
                createActualPollingStation("102002010001", "River of Life Church-01", 245),
                createActualPollingStation("102002010101", "River of Life Church-01", 676),
                createActualPollingStation("102002010201", "Nchanga Local Court-01", 476),
                createActualPollingStation("102002010301", "Main Social Club-01", 681),
                createActualPollingStation("102002010401", "Lubambe Primary School-01", 876),
                createActualPollingStation("102002010402", "Lubambe Primary School-02", 875),
                createActualPollingStation("102002010501", "Kabundi Primary School-01", 706),
                createActualPollingStation("102002010502", "Kabundi Primary School-02", 706),
                createActualPollingStation("102002010601", "Mwize Private School-01", 96),
                createActualPollingStation("102002010701", "Main Social Club-01", 655),
              ]
            },
            {
              id: "copperbelt-chingola-nchanga-buntungwa",
              name: "BUNTUNGWA",
              councillorCandidates: generateCouncillorCandidates("copperbelt-chingola-nchanga-buntungwa"),
              pollingStations: [
                createActualPollingStation("102002010801", "Mudzabwela Secondary School-01", 166),
                createActualPollingStation("102002010901", "Mudzabwela Secondary School-01", 709),
                createActualPollingStation("102002010902", "Mudzabwela Secondary School-02", 708),
                createActualPollingStation("102002010903", "Mudzabwela Secondary School-03", 708),
                createActualPollingStation("102002011001", "Kapisha Primary School-01", 977),
                createActualPollingStation("102002011101", "Kapisha Primary School-01", 386),
                createActualPollingStation("102002011201", "Kapisha Primary School-01", 529),
                createActualPollingStation("102002011301", "Mudzabwela Secondary School-01", 298),
                createActualPollingStation("102002011401", "Nchanga UCZ Church-01", 319),
              ]
            },
            {
              id: "copperbelt-chingola-nchanga-kabundi",
              name: "KABUNDI",
              councillorCandidates: generateCouncillorCandidates("copperbelt-chingola-nchanga-kabundi"),
              pollingStations: [
                createActualPollingStation("102002011501", "Nchanga Primary School-01", 880),
                createActualPollingStation("102002011502", "Nchanga Primary School-02", 879),
                createActualPollingStation("102002011601", "Kasala Primary School-01", 787),
                createActualPollingStation("102002011602", "Kasala Primary School-02", 787),
                createActualPollingStation("102002011701", "Nchanga Primary School-01", 979),
              ]
            },
            {
              id: "copperbelt-chingola-nchanga-kasala",
              name: "KASALA",
              councillorCandidates: generateCouncillorCandidates("copperbelt-chingola-nchanga-kasala"),
              pollingStations: [
                createActualPollingStation("102002011801", "Kapopo Primary School-01", 910),
                createActualPollingStation("102002011802", "Kapopo Primary School-02", 910),
                createActualPollingStation("102002011901", "Kabundi Secondary School-01", 857),
                createActualPollingStation("102002011902", "Kabundi Secondary School-02", 857),
                createActualPollingStation("102002012001", "Chibwe Primary School-01", 691),
                createActualPollingStation("102002012002", "Chibwe Primary School-02", 691),
                createActualPollingStation("102002012003", "Chibwe Primary School-03", 691),
                createActualPollingStation("102002012101", "Chibwe Primary School-01", 848),
              ]
            },
            {
              id: "copperbelt-chingola-nchanga-kabuta",
              name: "KABUTA",
              councillorCandidates: generateCouncillorCandidates("copperbelt-chingola-nchanga-kabuta"),
              pollingStations: [
                createActualPollingStation("102002012201", "Mapalo Community School-01", 935),
                createActualPollingStation("102002012301", "Kapisha Council Office-01", 755),
                createActualPollingStation("102002012302", "Kapisha Council Office-02", 754),
                createActualPollingStation("102002012401", "Luano Cooperative Building-01", 214),
                createActualPollingStation("102002012501", "Kamiteta Community School-01", 123),
                createActualPollingStation("102002012601", "Kambenja Primary School-01", 129),
              ]
            },
            {
              id: "copperbelt-chingola-nchanga-bupalo",
              name: "BUPALO",
              councillorCandidates: generateCouncillorCandidates("copperbelt-chingola-nchanga-bupalo"),
              pollingStations: [
                createActualPollingStation("102002012701", "Tripple S Community School-01", 154),
                createActualPollingStation("102002012801", "Twali Primary School-01", 454),
                createActualPollingStation("102002012901", "Mbayi Primary School-01", 180),
                createActualPollingStation("102002013001", "Luano B Primary School-01", 513),
                createActualPollingStation("102002013101", "Kings Trust School-01", 846),
                createActualPollingStation("102002013102", "Kings Trust School-02", 845),
                createActualPollingStation("102002013103", "Kings Trust School-03", 845),
                createActualPollingStation("102002013104", "Kings Trust School-04", 845),
                createActualPollingStation("102002013105", "Kings Trust School-05", 845),
                createActualPollingStation("102002013106", "Kings Trust School-06", 845),
                createActualPollingStation("102002013201", "Soweto Primary School-01", 805),
                createActualPollingStation("102002013202", "Soweto Primary School-02", 805),
              ]
            },
            {
              id: "copperbelt-chingola-nchanga-luano",
              name: "LUANO",
              councillorCandidates: generateCouncillorCandidates("copperbelt-chingola-nchanga-luano"),
              pollingStations: [
                createActualPollingStation("102002013301", "Nchanga Youth Centre-01", 722),
                createActualPollingStation("102002013401", "Soul Winning Church-01", 594),
                createActualPollingStation("102002013501", "St. Luke Methodist Church-01", 600),
                createActualPollingStation("102002013502", "St. Luke Methodist Church-02", 599),
                createActualPollingStation("102002013601", "Pentencost Holiness Church-01", 410),
                createActualPollingStation("102002013701", "Jesus Compassion Church-01", 714),
                createActualPollingStation("102002013702", "Jesus Compassion Church-02", 714),
                createActualPollingStation("102002013801", "Nchanga Youth Centre-01", 542),
              ]
            },
            {
              id: "copperbelt-chingola-nchanga-kapisha",
              name: "KAPISHA",
              councillorCandidates: generateCouncillorCandidates("copperbelt-chingola-nchanga-kapisha"),
              pollingStations: [
                createActualPollingStation("102002013901", "Kabuta Community School-01", 481),
                createActualPollingStation("102002014001", "Luano Primary School-01", 224),
                createActualPollingStation("102002014101", "Luano Primary School-01", 567),
                createActualPollingStation("102002014201", "Luano Primary School-01", 899),
                createActualPollingStation("102002014202", "Luano Primary School-02", 899),
                createActualPollingStation("102002014203", "Luano Primary School-03", 898),
                createActualPollingStation("102002014204", "Luano Primary School-04", 898),
                createActualPollingStation("102002014205", "Luano Primary School-05", 898),
                createActualPollingStation("102002014206", "Luano Primary School-06", 898),
                createActualPollingStation("102002014301", "Desmo Community School-01", 614),
                createActualPollingStation("102002014401", "Hope for Africa-01", 733),
                createActualPollingStation("102002014402", "Hope for Africa-02", 733),
              ]
            },
          ]
        },
        {
          id: "copperbelt-chingola-chingola-west",
          name: "CHINGOLA WEST",
          mpCandidates: generateMPCandidates("copperbelt-chingola-chingola-west"),
          wards: [
            {
              id: "copperbelt-chingola-chingola-west-mutenda",
              name: "MUTENDA",
              councillorCandidates: generateCouncillorCandidates("copperbelt-chingola-chingola-west-mutenda"),
              pollingStations: [
                createActualPollingStation("102002000101", "Mutenda Primary School-01", 843),
                createActualPollingStation("102002000102", "Mutenda Primary School-02", 842),
                createActualPollingStation("102002000201", "Chansobe Primary School-01", 34),
                createActualPollingStation("102002000301", "Chansobe Primary School-01", 109),
                createActualPollingStation("102002000401", "Twampane Primary School-01", 106),
                createActualPollingStation("102002000501", "Chamakubi Primary School-01", 346),
                createActualPollingStation("102002000601", "Mutenda Multi-Purpose-01", 160),
                createActualPollingStation("102002000701", "Mato Primary School-01", 261),
                createActualPollingStation("102002000801", "Mapande Community School-01", 173),
              ]
            },
            {
              id: "copperbelt-chingola-chingola-west-muchinshi",
              name: "MUCHINSHI",
              councillorCandidates: generateCouncillorCandidates("copperbelt-chingola-chingola-west-muchinshi"),
              pollingStations: [
                createActualPollingStation("102002000901", "Kayowelo Primary School-01", 294),
                createActualPollingStation("102002001001", "Muchinshi Primary School-01", 934),
                createActualPollingStation("102002001002", "Muchinshi Primary School-02", 933),
                createActualPollingStation("102002001101", "Fibwanse Community Centre-01", 731),
                createActualPollingStation("102002001201", "Chiwangula Community School-01", 92),
                createActualPollingStation("102002001301", "Fibangula Primary School-01", 443),
              ]
            },
            {
              id: "copperbelt-chingola-chingola-west-ipafu",
              name: "IPAFU",
              councillorCandidates: generateCouncillorCandidates("copperbelt-chingola-chingola-west-ipafu"),
              pollingStations: [
                createActualPollingStation("102002001401", "Mambili Primary School-01", 609),
                createActualPollingStation("102002001501", "Twalambulwa Pre School-01", 197),
                createActualPollingStation("102002001601", "Kamita Primary School-01", 223),
                createActualPollingStation("102002001701", "Ipafu Primary School-01", 622),
                createActualPollingStation("102002001801", "Lwankole Primary School-01", 308),
                createActualPollingStation("102002001901", "Kawama Primary School-01", 527),
                createActualPollingStation("102002002001", "George Mwela Primary School-01", 278),
                createActualPollingStation("102002002101", "Ngosa Primary School-01", 415),
                createActualPollingStation("102002002201", "Jackson Phiri Primary School-01", 128),
              ]
            },
            {
              id: "copperbelt-chingola-chingola-west-kalilo",
              name: "KALILO",
              councillorCandidates: generateCouncillorCandidates("copperbelt-chingola-chingola-west-kalilo"),
              pollingStations: [
                createActualPollingStation("102002002301", "Fisonge Primary School-01", 140),
                createActualPollingStation("102002002401", "Kalilo Primary School-01", 788),
                createActualPollingStation("102002002402", "Kalilo Primary School-02", 787),
                createActualPollingStation("102002002501", "Shimulala Primary School-01", 428),
                createActualPollingStation("102002002601", "CMML Church Building-01", 113),
                createActualPollingStation("102002002701", "Trust In God Co-operative-01", 607),
                createActualPollingStation("102002002801", "Luankole UCZ Church-01", 195),
                createActualPollingStation("102002002901", "Ikelenge Community School-01", 259),
              ]
            },
            {
              id: "copperbelt-chingola-chingola-west-kabungo",
              name: "KABUNGO",
              councillorCandidates: generateCouncillorCandidates("copperbelt-chingola-chingola-west-kabungo"),
              pollingStations: [
                createActualPollingStation("102002003001", "Hippo Pool Community School-01", 273),
                createActualPollingStation("102002003101", "Hellen Twikatane Community School-01", 209),
                createActualPollingStation("102002003201", "Mushishima Primary School-01", 446),
                createActualPollingStation("102002003301", "Chiwempala Primary School-01", 670),
                createActualPollingStation("102002003401", "Chiwempala Primary School-01", 693),
                createActualPollingStation("102002003501", "Chiwempala Primary School-01", 889),
                createActualPollingStation("102002003502", "Chiwempala Primary School-02", 889),
                createActualPollingStation("102002003503", "Chiwempala Primary School-03", 888),
              ]
            },
            {
              id: "copperbelt-chingola-chingola-west-chiwempala",
              name: "CHIWEMPALA",
              councillorCandidates: generateCouncillorCandidates("copperbelt-chingola-chingola-west-chiwempala"),
              pollingStations: [
                createActualPollingStation("102002003601", "Malemba Primary School-01", 333),
                createActualPollingStation("102002003701", "Malemba Primary School-01", 701),
                createActualPollingStation("102002003702", "Malemba Primary School-02", 700),
                createActualPollingStation("102002003703", "Malemba Primary School-03", 700),
                createActualPollingStation("102002003801", "Malemba Primary School-01", 214),
                createActualPollingStation("102002003901", "Chiwempala Hall-01", 896),
                createActualPollingStation("102002003902", "Chiwempala Hall-02", 896),
                createActualPollingStation("102002003903", "Chiwempala Hall-03", 896),
                createActualPollingStation("102002003904", "Chiwempala Hall-04", 896),
              ]
            },
            {
              id: "copperbelt-chingola-chingola-west-maiteneke",
              name: "MAITENEKE",
              councillorCandidates: generateCouncillorCandidates("copperbelt-chingola-chingola-west-maiteneke"),
              pollingStations: [
                createActualPollingStation("102002007101", "Maiteneke Secondary School-01", 605),
                createActualPollingStation("102002007201", "Maiteneke Secondary School-01", 513),
                createActualPollingStation("102002007202", "Maiteneke Secondary School-02", 512),
                createActualPollingStation("102002007301", "Maiteneke Secondary School-01", 756),
                createActualPollingStation("102002007302", "Maiteneke Secondary School-02", 756),
                createActualPollingStation("102002007303", "Maiteneke Secondary School-03", 756),
                createActualPollingStation("102002007401", "Ndungu Primary School-01", 968),
                createActualPollingStation("102002007402", "Ndungu Primary School-02", 968),
                createActualPollingStation("102002007403", "Ndungu Primary School-03", 968),
              ]
            },
            {
              id: "copperbelt-chingola-chingola-west-chitimukulu",
              name: "CHITIMUKULU",
              councillorCandidates: generateCouncillorCandidates("copperbelt-chingola-chingola-west-chitimukulu"),
              pollingStations: [
                createActualPollingStation("102002007501", "Chitimukulu Hall-01", 506),
                createActualPollingStation("102002007502", "Chitimukulu Hall-02", 505),
                createActualPollingStation("102002007601", "Chitimukulu Hall-01", 645),
                createActualPollingStation("102002007701", "Chitimukulu Hall-01", 715),
                createActualPollingStation("102002007702", "Chitimukulu Hall-02", 715),
                createActualPollingStation("102002007703", "Chitimukulu Hall-03", 714),
              ]
            },
          ]
        },
      ]
    },
    {
      id: "kalulushi",
      name: "KALULUSHI",
      mayoralCandidates: generateMayoralCandidates("kalulushi"),
      constituencies: [
        {
          id: "copperbelt-kalulushi-kalulushi",
          name: "KALULUSHI",
          mpCandidates: generateMPCandidates("copperbelt-kalulushi-kalulushi"),
          wards: [
            {
              id: "copperbelt-kalulushi-kalulushi-kalanga",
              name: "KALANGA",
              councillorCandidates: generateCouncillorCandidates("copperbelt-kalulushi-kalulushi-kalanga"),
              pollingStations: [
                createActualPollingStation("102003003301", "Kalulushi Trust School-01", 784),
                createActualPollingStation("102003003302", "Kalulushi Trust School-02", 784),
                createActualPollingStation("102003003303", "Kalulushi Trust School-03", 783),
                createActualPollingStation("102003003401", "Chavuma Secondary School-01", 763),
                createActualPollingStation("102003003402", "Chavuma Secondary School-02", 763),
                createActualPollingStation("102003003403", "Chavuma Secondary School-03", 763),
                createActualPollingStation("102003003404", "Chavuma Secondary School-04", 762),
              ]
            },
            {
              id: "copperbelt-kalulushi-kalulushi-lubuto",
              name: "LUBUTO",
              councillorCandidates: generateCouncillorCandidates("copperbelt-kalulushi-kalulushi-lubuto"),
              pollingStations: [
                createActualPollingStation("102003003501", "Cornerstone Primary School-01", 883),
                createActualPollingStation("102003003601", "Lubuto Primary School-01", 994),
                createActualPollingStation("102003003602", "Lubuto Primary School-02", 993),
                createActualPollingStation("102003003603", "Lubuto Primary School-03", 993),
              ]
            },
            {
              id: "copperbelt-kalulushi-kalulushi-dongwe",
              name: "DONGWE",
              councillorCandidates: generateCouncillorCandidates("copperbelt-kalulushi-kalulushi-dongwe"),
              pollingStations: [
                createActualPollingStation("102003003701", "Dongwe Pentecostal Holiness Church-01", 370),
                createActualPollingStation("102003003801", "Dongwe Community Centre-01", 846),
                createActualPollingStation("102003003802", "Dongwe Community Centre-02", 846),
                createActualPollingStation("102003003803", "Dongwe Community Centre-03", 846),
                createActualPollingStation("102003003804", "Dongwe Community Centre-04", 845),
              ]
            },
            {
              id: "copperbelt-kalulushi-kalulushi-kalungwishi",
              name: "KALUNGWISHI",
              councillorCandidates: generateCouncillorCandidates("copperbelt-kalulushi-kalulushi-kalungwishi"),
              pollingStations: [
                createActualPollingStation("102003003901", "Kalulushi Social Club-01", 671),
                createActualPollingStation("102003004001", "Council Library-01", 601),
                createActualPollingStation("102003004002", "Council Library-02", 601),
              ]
            },
            {
              id: "copperbelt-kalulushi-kalulushi-luapula",
              name: "LUAPULA",
              councillorCandidates: generateCouncillorCandidates("copperbelt-kalulushi-kalulushi-luapula"),
              pollingStations: [
                createActualPollingStation("102003004101", "Council Housing Office-01", 994),
                createActualPollingStation("102003004102", "Council Housing Office-02", 993),
                createActualPollingStation("102003004103", "Council Housing Office-03", 993),
                createActualPollingStation("102003004201", "NAPSA School-01", 527),
                createActualPollingStation("102003004202", "NAPSA School-02", 527),
                createActualPollingStation("102003004301", "Shekinah Community Orphanage-01", 367),
              ]
            },
            {
              id: "copperbelt-kalulushi-kalulushi-kalengwa",
              name: "KALENGWA",
              councillorCandidates: generateCouncillorCandidates("copperbelt-kalulushi-kalulushi-kalengwa"),
              pollingStations: [
                createActualPollingStation("102003004401", "Chibuluma Primary School-01", 712),
                createActualPollingStation("102003004402", "Chibuluma Primary School-02", 712),
              ]
            },
            {
              id: "copperbelt-kalulushi-kalulushi-buseko",
              name: "BUSEKO",
              councillorCandidates: generateCouncillorCandidates("copperbelt-kalulushi-kalulushi-buseko"),
              pollingStations: [
                createActualPollingStation("102003004501", "Kankonshi Secondary School-01", 876),
                createActualPollingStation("102003004502", "Kankonshi Secondary School-02", 876),
                createActualPollingStation("102003004601", "Buseko Community Youth Centre-01", 598),
              ]
            },
            {
              id: "copperbelt-kalulushi-kalulushi-kankonshi",
              name: "KANKONSHI",
              councillorCandidates: generateCouncillorCandidates("copperbelt-kalulushi-kalulushi-kankonshi"),
              pollingStations: [
                createActualPollingStation("102003004701", "Chibuluma Housing Office-01", 515),
                createActualPollingStation("102003004702", "Chibuluma Housing Office-02", 514),
                createActualPollingStation("102003004801", "Mapalo Community Halll-01", 300),
              ]
            },
            {
              id: "copperbelt-kalulushi-kalulushi-chibuluma",
              name: "CHIBULUMA",
              councillorCandidates: generateCouncillorCandidates("copperbelt-kalulushi-kalulushi-chibuluma"),
              pollingStations: [
                createActualPollingStation("102003004901", "Chibuluma Pre School-01", 706),
                createActualPollingStation("102003004902", "Chibuluma Pre School-02", 705),
              ]
            },
            {
              id: "copperbelt-kalulushi-kalulushi-remmy-chisupa",
              name: "REMMY CHISUPA",
              councillorCandidates: generateCouncillorCandidates("copperbelt-kalulushi-kalulushi-remmy-chisupa"),
              pollingStations: [
                createActualPollingStation("102003005001", "Butemwe Community School-01", 564),
                createActualPollingStation("102003005002", "Butemwe Community School-02", 563),
                createActualPollingStation("102003005101", "Chibote Primary School-01", 599),
                createActualPollingStation("102003005102", "Chibote Primary School-02", 598),
                createActualPollingStation("102003005201", "Twayuka Primary School-01", 746),
                createActualPollingStation("102003005202", "Twayuka Primary School-02", 746),
                createActualPollingStation("102003005301", "Farm College-01", 498),
              ]
            },
            {
              id: "copperbelt-kalulushi-kalulushi-ngweshi",
              name: "NGWESHI",
              councillorCandidates: generateCouncillorCandidates("copperbelt-kalulushi-kalulushi-ngweshi"),
              pollingStations: [
                createActualPollingStation("102003005401", "St. Marceline School-01", 780),
                createActualPollingStation("102003005402", "St. Marceline School-02", 780),
                createActualPollingStation("102003005501", "Ward Office-01", 817),
                createActualPollingStation("102003005502", "Ward Office-02", 816),
                createActualPollingStation("102003005601", "Kalulushi Primary School-01", 704),
                createActualPollingStation("102003005602", "Kalulushi Primary School-02", 703),
              ]
            },
            {
              id: "copperbelt-kalulushi-kalulushi-kafue",
              name: "KAFUE",
              councillorCandidates: generateCouncillorCandidates("copperbelt-kalulushi-kalulushi-kafue"),
              pollingStations: [
                createActualPollingStation("102003005701", "Masamba Primary School-01", 736),
                createActualPollingStation("102003005702", "Masamba Primary School-02", 735),
                createActualPollingStation("102003005703", "Masamba Primary School-03", 735),
              ]
            },
            {
              id: "copperbelt-kalulushi-kalulushi-nsokoloko",
              name: "NSOKOLOKO",
              councillorCandidates: generateCouncillorCandidates("copperbelt-kalulushi-kalulushi-nsokoloko"),
              pollingStations: [
                createActualPollingStation("102003005801", "Buyantanshi Primary School-01", 969),
                createActualPollingStation("102003005802", "Buyantanshi Primary School-02", 969),
                createActualPollingStation("102003005803", "Buyantanshi Primary School-03", 968),
                createActualPollingStation("102003005804", "Buyantanshi Primary School-04", 968),
                createActualPollingStation("102003005805", "Buyantanshi Primary School-05", 968),
                createActualPollingStation("102003005806", "Buyantanshi Primary School-06", 968),
                createActualPollingStation("102003005807", "Buyantanshi Primary School-07", 968),
                createActualPollingStation("102003005808", "Buyantanshi Primary School-08", 968),
                createActualPollingStation("102003005901", "Nazarine Pentecostal Church-01", 854),
                createActualPollingStation("102003005902", "Nazarine Pentecostal Church-02", 854),
                createActualPollingStation("102003005903", "Nazarine Pentecostal Church-03", 853),
              ]
            },
            {
              id: "copperbelt-kalulushi-kalulushi-lubanga",
              name: "LUBANGA",
              councillorCandidates: generateCouncillorCandidates("copperbelt-kalulushi-kalulushi-lubanga"),
              pollingStations: [
                createActualPollingStation("102003006001", "Chibanga Make Shift-01", 497),
                createActualPollingStation("102003006101", "Chembe Primary School-01", 599),
                createActualPollingStation("102003006102", "Chembe Primary School-02", 599),
                createActualPollingStation("102003006201", "Nyashi Makeshift-01", 251),
                createActualPollingStation("102003006301", "Michinka Primary School-01", 479),
                createActualPollingStation("102003006401", "Chati East Primary School-01", 462),
              ]
            },
          ]
        },
        {
          id: "copperbelt-kalulushi-chambishi",
          name: "CHAMBISHI",
          mpCandidates: generateMPCandidates("copperbelt-kalulushi-chambishi"),
          wards: [
            {
              id: "copperbelt-kalulushi-chambishi-musakashi",
              name: "MUSAKASHI",
              councillorCandidates: generateCouncillorCandidates("copperbelt-kalulushi-chambishi-musakashi"),
              pollingStations: [
                createActualPollingStation("102003000101", "Musakashi Primary School-01", 890),
                createActualPollingStation("102003000201", "Day Spring Church-01", 726),
              ]
            },
            {
              id: "copperbelt-kalulushi-chambishi-sitwe",
              name: "SITWE",
              councillorCandidates: generateCouncillorCandidates("copperbelt-kalulushi-chambishi-sitwe"),
              pollingStations: [
                createActualPollingStation("102003000301", "Sitwe Primary School-01", 830),
                createActualPollingStation("102003000302", "Sitwe Primary School-02", 830),
                createActualPollingStation("102003000303", "Sitwe Primary School-03", 830),
                createActualPollingStation("102003000304", "Sitwe Primary School-04", 829),
                createActualPollingStation("102003000401", "Moomba PAOG Church-01", 968),
                createActualPollingStation("102003000501", "Nkoloso Baptist Church-01", 702),
              ]
            },
            {
              id: "copperbelt-kalulushi-chambishi-chambishi",
              name: "CHAMBISHI",
              councillorCandidates: generateCouncillorCandidates("copperbelt-kalulushi-chambishi-chambishi"),
              pollingStations: [
                createActualPollingStation("102003000601", "Chimbishi Secondary School-01", 623),
                createActualPollingStation("102003000602", "Chimbishi Secondary School-02", 622),
                createActualPollingStation("102003000701", "Twalubuka Secondary School-01", 780),
                createActualPollingStation("102003000702", "Twalubuka Secondary School-02", 780),
                createActualPollingStation("102003000703", "Twalubuka Secondary School-03", 779),
                createActualPollingStation("102003000801", "Chambishi Primary School-01", 879),
                createActualPollingStation("102003000802", "Chambishi Primary School-02", 879),
              ]
            },
            {
              id: "copperbelt-kalulushi-chambishi-twaiteka",
              name: "TWAITEKA",
              councillorCandidates: generateCouncillorCandidates("copperbelt-kalulushi-chambishi-twaiteka"),
              pollingStations: [
                createActualPollingStation("102003000901", "New Convenant Church-01", 267),
                createActualPollingStation("102003001001", "Tata Waluse Community School-01", 976),
                createActualPollingStation("102003001101", "Bridge of Life Ministries-01", 388),
                createActualPollingStation("102003001201", "Twaiteka Primary School-01", 804),
                createActualPollingStation("102003001202", "Twaiteka Primary School-02", 804),
                createActualPollingStation("102003001203", "Twaiteka Primary School-03", 803),
                createActualPollingStation("102003001204", "Twaiteka Primary School-04", 803),
                createActualPollingStation("102003001205", "Twaiteka Primary School-05", 803),
              ]
            },
            {
              id: "copperbelt-kalulushi-chambishi-lukoshi",
              name: "LUKOSHI",
              councillorCandidates: generateCouncillorCandidates("copperbelt-kalulushi-chambishi-lukoshi"),
              pollingStations: [
                createActualPollingStation("102003001301", "Luongo Primary School-01", 542),
                createActualPollingStation("102003001401", "Lukoshi Primary School-01", 397),
                createActualPollingStation("102003001501", "Temporally Shelter-01", 218),
                createActualPollingStation("102003001601", "Catholic Church-01", 180),
              ]
            },
            {
              id: "copperbelt-kalulushi-chambishi-lulamba",
              name: "LULAMBA",
              councillorCandidates: generateCouncillorCandidates("copperbelt-kalulushi-chambishi-lulamba"),
              pollingStations: [
                createActualPollingStation("102003001701", "Pentass Christian School-01", 753),
                createActualPollingStation("102003001702", "Pentass Christian School-02", 753),
                createActualPollingStation("102003001703", "Pentass Christian School-03", 752),
                createActualPollingStation("102003001801", "Providence Primary School-01", 947),
                createActualPollingStation("102003001901", "ZR Evangelical Church-01", 713),
                createActualPollingStation("102003002001", "Roman Catholic Church-01", 659),
                createActualPollingStation("102003002101", "Pentecostal Holiness Church-01", 188),
              ]
            },
            {
              id: "copperbelt-kalulushi-chambishi-mwambashi",
              name: "MWAMBASHI",
              councillorCandidates: generateCouncillorCandidates("copperbelt-kalulushi-chambishi-mwambashi"),
              pollingStations: [
                createActualPollingStation("102003002201", "Mukulumpe Primary School-01", 369),
                createActualPollingStation("102003002301", "Fitanda PAOG Church-01", 199),
                createActualPollingStation("102003002401", "Kalusale PAOG Church-01", 256),
                createActualPollingStation("102003002501", "Chishilano Primary School-01", 587),
                createActualPollingStation("102003002601", "Minsenga Primary School-01", 951),
                createActualPollingStation("102003002701", "Kamilundu Primary School-01", 242),
              ]
            },
            {
              id: "copperbelt-kalulushi-chambishi-ichimpe",
              name: "ICHIMPE",
              councillorCandidates: generateCouncillorCandidates("copperbelt-kalulushi-chambishi-ichimpe"),
              pollingStations: [
                createActualPollingStation("102003002801", "Denovan Primary School-01", 248),
                createActualPollingStation("102003002901", "Kankomo Apostolic Church-01", 165),
                createActualPollingStation("102003003001", "Ichimpe Primary School-01", 642),
                createActualPollingStation("102003003002", "Ichimpe Primary School-02", 641),
                createActualPollingStation("102003003101", "Kameme Central Primary School-01", 318),
                createActualPollingStation("102003003201", "Kameme Primary School-01", 431),
              ]
            },
            {
              id: "copperbelt-kalulushi-chambishi-chembe",
              name: "CHEMBE",
              councillorCandidates: generateCouncillorCandidates("copperbelt-kalulushi-chambishi-chembe"),
              pollingStations: [
                createActualPollingStation("102003006501", "Katuta Primary School-01", 245),
                createActualPollingStation("102003006601", "Chifupa Primary School-01", 310),
                createActualPollingStation("102003006701", "Chati South Boarding Secondary School-01", 437),
                createActualPollingStation("102003006801", "Kalisha Primary School-01", 718),
                createActualPollingStation("102003006901", "Lunga Primary School-01", 907),
              ]
            },
            {
              id: "copperbelt-kalulushi-chambishi-chati",
              name: "CHATI",
              councillorCandidates: generateCouncillorCandidates("copperbelt-kalulushi-chambishi-chati"),
              pollingStations: [
                createActualPollingStation("102003007001", "Chisangwa Primary School-01", 430),
                createActualPollingStation("102003007101", "Mwansangwa Community School-01", 223),
                createActualPollingStation("102003007201", "Chiwembashi Primary School-01", 164),
                createActualPollingStation("102003007301", "Kawama Primary School-01", 174),
                createActualPollingStation("102003007401", "Chiwempala Primary School-01", 257),
                createActualPollingStation("102003007501", "Kafubu Depot Primary School-01", 825),
                createActualPollingStation("102003007502", "Kafubu Depot Primary School-02", 824),
                createActualPollingStation("102003007601", "Mpandala Primary School-01", 135),
                createActualPollingStation("102003007701", "Mwanawasa Primary School-01", 214),
                createActualPollingStation("102003007801", "Council Community Hall-01", 539),
                createActualPollingStation("102003007802", "Council Community Hall-02", 538),
              ]
            },
          ]
        },
      ]
    },
    {
      id: "kitwe",
      name: "KITWE",
      mayoralCandidates: generateMayoralCandidates("kitwe"),
      constituencies: [
        {
          id: "copperbelt-kitwe-chimwemwe",
          name: "CHIMWEMWE",
          mpCandidates: generateMPCandidates("copperbelt-kitwe-chimwemwe"),
          wards: [
            {
              id: "copperbelt-kitwe-chimwemwe-itimpi",
              name: "ITIMPI",
              councillorCandidates: generateCouncillorCandidates("copperbelt-kitwe-chimwemwe-itimpi"),
              pollingStations: [
                createActualPollingStation("102004000101", "Mwambashi Primary School-01", 677),
                createActualPollingStation("102004000102", "Mwambashi Primary School-02", 676),
                createActualPollingStation("102004000103", "Mwambashi Primary School-03", 676),
                createActualPollingStation("102004000201", "Luela Community School-01", 547),
                createActualPollingStation("102004000202", "Luela Community School-02", 547),
                createActualPollingStation("102004000301", "Salamano Primary School-01", 454),
                createActualPollingStation("102004000401", "Mwambashi Primary School-01", 745),
                createActualPollingStation("102004000402", "Mwambashi Primary School-02", 744),
                createActualPollingStation("102004000403", "Mwambashi Primary School-03", 744),
                createActualPollingStation("102004000501", "Garneton Secondary School-01", 781),
                createActualPollingStation("102004000502", "Garneton Secondary School-02", 781),
              ]
            },
            {
              id: "copperbelt-kitwe-chimwemwe-twatasha",
              name: "TWATASHA",
              councillorCandidates: generateCouncillorCandidates("copperbelt-kitwe-chimwemwe-twatasha"),
              pollingStations: [
                createActualPollingStation("102004000601", "Race Course Primary School-01", 554),
                createActualPollingStation("102004000701", "Race Course Primary School-01", 626),
                createActualPollingStation("102004000702", "Race Course Primary School-02", 626),
                createActualPollingStation("102004000801", "TYFO TAP-01", 756),
                createActualPollingStation("102004000802", "TYFO TAP-02", 755),
                createActualPollingStation("102004000803", "TYFO TAP-03", 755),
                createActualPollingStation("102004000804", "TYFO TAP-04", 755),
                createActualPollingStation("102004000901", "Race Course Primary School-01", 633),
                createActualPollingStation("102004001001", "Twatasha Secondary School-01", 935),
                createActualPollingStation("102004001002", "Twatasha Secondary School-02", 935),
                createActualPollingStation("102004001003", "Twatasha Secondary School-03", 934),
                createActualPollingStation("102004001004", "Twatasha Secondary School-04", 934),
                createActualPollingStation("102004001005", "Twatasha Secondary School-05", 934),
                createActualPollingStation("102004001101", "Twatasha Secondary School-01", 839),
                createActualPollingStation("102004001102", "Twatasha Secondary School-02", 839),
              ]
            },
            {
              id: "copperbelt-kitwe-chimwemwe-kawama",
              name: "KAWAMA",
              councillorCandidates: generateCouncillorCandidates("copperbelt-kitwe-chimwemwe-kawama"),
              pollingStations: [
                createActualPollingStation("102004001201", "Old Kamatipa Council Office-01", 628),
                createActualPollingStation("102004001301", "Happy Community School-01", 942),
                createActualPollingStation("102004001302", "Happy Community School-02", 942),
                createActualPollingStation("102004001303", "Happy Community School-03", 942),
                createActualPollingStation("102004001401", "Minsenga Primary School-01", 871),
                createActualPollingStation("102004001402", "Minsenga Primary School-02", 871),
                createActualPollingStation("102004001403", "Minsenga Primary School-03", 871),
                createActualPollingStation("102004001501", "OVC Orphanage-01", 724),
                createActualPollingStation("102004001601", "Comis Catholic Community School-01", 992),
                createActualPollingStation("102004001701", "Pentecostal Church-01", 85),
                createActualPollingStation("102004001801", "Kamatipa 'B' Secondary School-01", 734),
                createActualPollingStation("102004001802", "Kamatipa 'B' Secondary School-02", 733),
                createActualPollingStation("102004001803", "Kamatipa 'B' Secondary School-03", 733),
                createActualPollingStation("102004001901", "Twingi Building-01", 827),
                createActualPollingStation("102004001902", "Twingi Building-02", 826),
              ]
            },
            {
              id: "copperbelt-kitwe-chimwemwe-kamatipa",
              name: "KAMATIPA",
              councillorCandidates: generateCouncillorCandidates("copperbelt-kitwe-chimwemwe-kamatipa"),
              pollingStations: [
                createActualPollingStation("102004002001", "Kamatipa 'B' Secondary School-01", 820),
                createActualPollingStation("102004002101", "Kachema Musuma Primary School-01", 802),
                createActualPollingStation("102004002102", "Kachema Musuma Primary School-02", 801),
                createActualPollingStation("102004002103", "Kachema Musuma Primary School-03", 801),
                createActualPollingStation("102004002201", "Kamatipa 'B' Secondary School-01", 863),
                createActualPollingStation("102004002202", "Kamatipa 'B' Secondary School-02", 863),
                createActualPollingStation("102004002203", "Kamatipa 'B' Secondary School-03", 863),
                createActualPollingStation("102004002204", "Kamatipa 'B' Secondary School-04", 863),
                createActualPollingStation("102004002205", "Kamatipa 'B' Secondary School-05", 863),
                createActualPollingStation("102004002206", "Kamatipa 'B' Secondary School-06", 862),
                createActualPollingStation("102004002301", "Kabala Farm-01", 923),
                createActualPollingStation("102004002401", "Pentecostal Assemblies of GOD Zambia-01", 580),
                createActualPollingStation("102004002501", "Kamatipa Community School-01", 330),
                createActualPollingStation("102004002601", "Kapota Primary School-01", 903),
                createActualPollingStation("102004002602", "Kapota Primary School-02", 903),
                createActualPollingStation("102004002603", "Kapota Primary School-03", 903),
                createActualPollingStation("102004002604", "Kapota Primary School-04", 903),
                createActualPollingStation("102004002605", "Kapota Primary School-05", 903),
                createActualPollingStation("102004002701", "YMCA Clinic-01", 993),
              ]
            },
            {
              id: "copperbelt-kitwe-chimwemwe-buntungwa",
              name: "BUNTUNGWA",
              councillorCandidates: generateCouncillorCandidates("copperbelt-kitwe-chimwemwe-buntungwa"),
              pollingStations: [
                createActualPollingStation("102004002801", "Kampemba Primary School-01", 563),
                createActualPollingStation("102004002901", "Buntungwa Centre-01", 294),
                createActualPollingStation("102004003001", "Buntungwa Centre-01", 591),
                createActualPollingStation("102004003002", "Buntungwa Centre-02", 590),
                createActualPollingStation("102004003101", "Natwange Secondary School-01", 839),
                createActualPollingStation("102004003102", "Natwange Secondary School-02", 838),
                createActualPollingStation("102004003201", "Mama Mont Secondary School-01", 902),
                createActualPollingStation("102004003202", "Mama Mont Secondary School-02", 901),
                createActualPollingStation("102004003301", "Mama Mont Secondary School-01", 634),
                createActualPollingStation("102004003401", "Mama Mont Secondary School-01", 927),
                createActualPollingStation("102004003402", "Mama Mont Secondary School-02", 927),
                createActualPollingStation("102004003501", "Mama Mont Secondary School-01", 701),
                createActualPollingStation("102004003601", "Natwange Secondary School-01", 906),
                createActualPollingStation("102004003602", "Natwange Secondary School-02", 906),
                createActualPollingStation("102004003603", "Natwange Secondary School-03", 906),
              ]
            },
            {
              id: "copperbelt-kitwe-chimwemwe-lubuto",
              name: "LUBUTO",
              councillorCandidates: generateCouncillorCandidates("copperbelt-kitwe-chimwemwe-lubuto"),
              pollingStations: [
                createActualPollingStation("102004003701", "Chimwemwe KCC W/Shop-01", 705),
                createActualPollingStation("102004003801", "Chimwemwe Secondary School-01", 911),
                createActualPollingStation("102004003802", "Chimwemwe Secondary School-02", 911),
                createActualPollingStation("102004003803", "Chimwemwe Secondary School-03", 910),
                createActualPollingStation("102004003901", "Chimwemwe Secondary School-01", 836),
                createActualPollingStation("102004003902", "Chimwemwe Secondary School-02", 836),
                createActualPollingStation("102004004001", "Lubuto Centre-01", 786),
                createActualPollingStation("102004004002", "Lubuto Centre-02", 786),
                createActualPollingStation("102004004101", "Christian Council Centre-01", 780),
              ]
            },
            {
              id: "copperbelt-kitwe-chimwemwe-chimwemwe",
              name: "CHIMWEMWE",
              councillorCandidates: generateCouncillorCandidates("copperbelt-kitwe-chimwemwe-chimwemwe"),
              pollingStations: [
                createActualPollingStation("102004004201", "Riverside Primary School-01", 948),
                createActualPollingStation("102004004301", "Ishuko Primary School-01", 772),
                createActualPollingStation("102004004302", "Ishuko Primary School-02", 771),
                createActualPollingStation("102004004401", "Ishuko Primary School-01", 989),
                createActualPollingStation("102004004402", "Ishuko Primary School-02", 989),
                createActualPollingStation("102004004501", "Kampemba Primary School-01", 378),
                createActualPollingStation("102004004601", "Kampemba Primary School-01", 843),
                createActualPollingStation("102004004602", "Kampemba Primary School-02", 843),
                createActualPollingStation("102004004603", "Kampemba Primary School-03", 842),
                createActualPollingStation("102004004701", "Kampemba Primary School-01", 474),
              ]
            },
          ]
        },
        {
          id: "copperbelt-kitwe-kamfinsa",
          name: "KAMFINSA",
          mpCandidates: generateMPCandidates("copperbelt-kitwe-kamfinsa"),
          wards: [
            {
              id: "copperbelt-kitwe-kamfinsa-bupe",
              name: "BUPE",
              councillorCandidates: generateCouncillorCandidates("copperbelt-kitwe-kamfinsa-bupe"),
              pollingStations: [
                createActualPollingStation("102004004801", "Cultural Club (Nakambala)-01", 581),
                createActualPollingStation("102004004901", "Miseshi Secondary School-01", 859),
                createActualPollingStation("102004004902", "Miseshi Secondary School-02", 859),
                createActualPollingStation("102004004903", "Miseshi Secondary School-03", 858),
                createActualPollingStation("102004005001", "Wesly Nyirenda Secondary School-01", 864),
                createActualPollingStation("102004005002", "Wesly Nyirenda Secondary School-02", 864),
                createActualPollingStation("102004005003", "Wesly Nyirenda Secondary School-03", 864),
                createActualPollingStation("102004005004", "Wesly Nyirenda Secondary School-04", 864),
                createActualPollingStation("102004005101", "Wesly Nyirenda Secondary School-01", 687),
                createActualPollingStation("102004005102", "Wesly Nyirenda Secondary School-02", 687),
                createActualPollingStation("102004005103", "Wesly Nyirenda Secondary School-03", 686),
                createActualPollingStation("102004005201", "Temwani Primary School-01", 999),
                createActualPollingStation("102004005202", "Temwani Primary School-02", 999),
                createActualPollingStation("102004005301", "Beautiful Gates-01", 710),
                createActualPollingStation("102004005302", "Beautiful Gates-02", 710),
                createActualPollingStation("102004005401", "Ndeke Secondary School-01", 944),
                createActualPollingStation("102004005402", "Ndeke Secondary School-02", 943),
                createActualPollingStation("102004005403", "Ndeke Secondary School-03", 943),
                createActualPollingStation("102004005404", "Ndeke Secondary School-04", 943),
                createActualPollingStation("102004005501", "Ndeke Primary School-01", 836),
                createActualPollingStation("102004005502", "Ndeke Primary School-02", 835),
                createActualPollingStation("102004005601", "Justine Kabwe Secondary School-01", 983),
                createActualPollingStation("102004005701", "Justine Kabwe Secondary School-01", 996),
                createActualPollingStation("102004005801", "Ndeke Primary School-01", 639),
                createActualPollingStation("102004005802", "Ndeke Primary School-02", 639),
                createActualPollingStation("102004005901", "Cecina School-01", 880),
                createActualPollingStation("102004005902", "Cecina School-02", 879),
                createActualPollingStation("102004005903", "Cecina School-03", 879),
                createActualPollingStation("102004005904", "Cecina School-04", 879),
                createActualPollingStation("102004006001", "Justine Kabwe Secondary School-01", 643),
                createActualPollingStation("102004006002", "Justine Kabwe Secondary School-02", 643),
                createActualPollingStation("102004006101", "Living Water Global Ministries-01", 151),
              ]
            },
            {
              id: "copperbelt-kitwe-kamfinsa-ndeke",
              name: "NDEKE",
              councillorCandidates: generateCouncillorCandidates("copperbelt-kitwe-kamfinsa-ndeke"),
              pollingStations: [
                createActualPollingStation("102004006201", "St. Augustine Catholic School-01", 553),
                createActualPollingStation("102004006301", "Jesus Blessing Primary School-01", 770),
                createActualPollingStation("102004006401", "Tatenda Primary School-01", 682),
                createActualPollingStation("102004006501", "Tatenda Primary School-01", 839),
                createActualPollingStation("102004006601", "Mulenga Clinic-01", 825),
                createActualPollingStation("102004006602", "Mulenga Clinic-02", 824),
                createActualPollingStation("102004006603", "Mulenga Clinic-03", 824),
                createActualPollingStation("102004006604", "Mulenga Clinic-04", 824),
                createActualPollingStation("102004006701", "Mulenga Community School-01", 868),
                createActualPollingStation("102004006702", "Mulenga Community School-02", 868),
                createActualPollingStation("102004006703", "Mulenga Community School-03", 868),
                createActualPollingStation("102004006704", "Mulenga Community School-04", 868),
                createActualPollingStation("102004006705", "Mulenga Community School-05", 868),
                createActualPollingStation("102004006706", "Mulenga Community School-06", 868),
                createActualPollingStation("102004006801", "UCZ Church-01", 732),
                createActualPollingStation("102004006802", "UCZ Church-02", 732),
                createActualPollingStation("102004006803", "UCZ Church-03", 732),
                createActualPollingStation("102004006901", "Chibansa Primary School-01", 855),
                createActualPollingStation("102004006902", "Chibansa Primary School-02", 855),
              ]
            },
            {
              id: "copperbelt-kitwe-kamfinsa-kafue",
              name: "KAFUE",
              councillorCandidates: generateCouncillorCandidates("copperbelt-kitwe-kamfinsa-kafue"),
              pollingStations: [
                createActualPollingStation("102004007001", "Kafue Bridge Secondary School-01", 948),
                createActualPollingStation("102004007002", "Kafue Bridge Secondary School-02", 948),
                createActualPollingStation("102004007003", "Kafue Bridge Secondary School-03", 947),
                createActualPollingStation("102004007101", "Kakolo Primary School-01", 410),
                createActualPollingStation("102004007201", "Kafue Bridge Secondary School-01", 896),
                createActualPollingStation("102004007202", "Kafue Bridge Secondary School-02", 895),
                createActualPollingStation("102004007203", "Kafue Bridge Secondary School-03", 895),
                createActualPollingStation("102004007204", "Kafue Bridge Secondary School-04", 895),
                createActualPollingStation("102004007301", "Chipashi Community School-01", 322),
                createActualPollingStation("102004007401", "New Apostolic Church-01", 313),
                createActualPollingStation("102004007501", "Kawama Community School-01", 426),
              ]
            },
            {
              id: "copperbelt-kitwe-kamfinsa-kamfinsa",
              name: "KAMFINSA",
              councillorCandidates: generateCouncillorCandidates("copperbelt-kitwe-kamfinsa-kamfinsa"),
              pollingStations: [
                createActualPollingStation("102004007601", "Mwekera Secondary School-01", 506),
                createActualPollingStation("102004007602", "Mwekera Secondary School-02", 506),
                createActualPollingStation("102004007701", "Kamfinsa Primary School-01", 953),
                createActualPollingStation("102004007702", "Kamfinsa Primary School-02", 952),
                createActualPollingStation("102004007801", "Kamfinsa Secondary School-01", 724),
                createActualPollingStation("102004007802", "Kamfinsa Secondary School-02", 724),
                createActualPollingStation("102004007803", "Kamfinsa Secondary School-03", 723),
                createActualPollingStation("102004007901", "Zambia Community School-01", 984),
                createActualPollingStation("102004008001", "Kamfinsa Mission Primary School-01", 483),
                createActualPollingStation("102004051501", "Kamfinsa Female Correctional Facility-01", 96),
                createActualPollingStation("102004051601", "Kamfinsa Correctional Facility-01", 852),
                createActualPollingStation("102004051602", "Kamfinsa Correctional Facility-02", 851),
                createActualPollingStation("102004051603", "Kamfinsa Correctional Facility-03", 851),
                createActualPollingStation("102004051604", "Kamfinsa Correctional Facility-04", 851),
                createActualPollingStation("102004051605", "Kamfinsa Correctional Facility-05", 851),
              ]
            },
          ]
        },
        {
          id: "copperbelt-kitwe-nkana",
          name: "NKANA",
          mpCandidates: generateMPCandidates("copperbelt-kitwe-nkana"),
          wards: [
            {
              id: "copperbelt-kitwe-nkana-kwacha",
              name: "KWACHA",
              councillorCandidates: generateCouncillorCandidates("copperbelt-kitwe-nkana-kwacha"),
              pollingStations: [
                createActualPollingStation("102004008101", "Mutende Primary School-01", 826),
                createActualPollingStation("102004008201", "Mutende Primary School-01", 809),
                createActualPollingStation("102004008301", "Kwacha CCAP Church-01", 552),
                createActualPollingStation("102004008302", "Kwacha CCAP Church-02", 551),
                createActualPollingStation("102004008401", "Mutende Primary School-01", 944),
                createActualPollingStation("102004008501", "Mutende Primary School-01", 833),
                createActualPollingStation("102004008502", "Mutende Primary School-02", 832),
                createActualPollingStation("102004008601", "Bread of Life Church-01", 759),
                createActualPollingStation("102004008602", "Bread of Life Church-02", 759),
                createActualPollingStation("102004008701", "Kwacha Primary School-01", 761),
                createActualPollingStation("102004008702", "Kwacha Primary School-02", 760),
                createActualPollingStation("102004008801", "Kwacha Primary School-01", 977),
                createActualPollingStation("102004008901", "Mitanto Secondary School-01", 910),
                createActualPollingStation("102004008902", "Mitanto Secondary School-02", 910),
                createActualPollingStation("102004008903", "Mitanto Secondary School-03", 910),
                createActualPollingStation("102004009001", "Kwacha Clinic-01", 562),
                createActualPollingStation("102004009002", "Kwacha Clinic-02", 562),
              ]
            },
            {
              id: "copperbelt-kitwe-nkana-bulangililo",
              name: "BULANGILILO",
              councillorCandidates: generateCouncillorCandidates("copperbelt-kitwe-nkana-bulangililo"),
              pollingStations: [
                createActualPollingStation("102004009101", "Kwacha East Congregation UCZ-01", 643),
                createActualPollingStation("102004009102", "Kwacha East Congregation UCZ-02", 642),
                createActualPollingStation("102004009201", "Kwacha East Congregation UCZ-01", 711),
                createActualPollingStation("102004009202", "Kwacha East Congregation UCZ-02", 710),
                createActualPollingStation("102004009301", "Bulangililo Secondary School-01", 525),
                createActualPollingStation("102004009302", "Bulangililo Secondary School-02", 524),
                createActualPollingStation("102004009401", "Bulangililo Secondary School-01", 829),
                createActualPollingStation("102004009402", "Bulangililo Secondary School-02", 828),
                createActualPollingStation("102004009501", "Bulangililo Secondary School-01", 812),
                createActualPollingStation("102004009502", "Bulangililo Secondary School-02", 812),
                createActualPollingStation("102004009503", "Bulangililo Secondary School-03", 812),
                createActualPollingStation("102004009504", "Bulangililo Secondary School-04", 812),
                createActualPollingStation("102004009601", "Bulangililo Community Centre-01", 555),
                createActualPollingStation("102004009602", "Bulangililo Community Centre-02", 555),
                createActualPollingStation("102004009701", "Bulangililo Community Centre-01", 770),
                createActualPollingStation("102004009702", "Bulangililo Community Centre-02", 770),
                createActualPollingStation("102004009703", "Bulangililo Community Centre-03", 770),
                createActualPollingStation("102004009801", "Lulamba Secondary School-01", 839),
                createActualPollingStation("102004009802", "Lulamba Secondary School-02", 839),
                createActualPollingStation("102004009803", "Lulamba Secondary School-03", 839),
                createActualPollingStation("102004009901", "Ipusukilo Primary School-01", 502),
                createActualPollingStation("102004009902", "Ipusukilo Primary School-02", 501),
                createActualPollingStation("102004010001", "Ipusukilo Primary School-01", 697),
                createActualPollingStation("102004010002", "Ipusukilo Primary School-02", 697),
                createActualPollingStation("102004010003", "Ipusukilo Primary School-03", 696),
                createActualPollingStation("102004010101", "Scientific Research-01", 480),
              ]
            },
            {
              id: "copperbelt-kitwe-nkana-ipusukilo",
              name: "IPUSUKILO",
              councillorCandidates: generateCouncillorCandidates("copperbelt-kitwe-nkana-ipusukilo"),
              pollingStations: [
                createActualPollingStation("102004010201", "Katwesheko Grocery (Tent)-01", 807),
                createActualPollingStation("102004010202", "Katwesheko Grocery (Tent)-02", 806),
                createActualPollingStation("102004010301", "Baptist Church-01", 560),
                createActualPollingStation("102004010302", "Baptist Church-02", 560),
                createActualPollingStation("102004010401", "Yatula Enterprises-01", 695),
                createActualPollingStation("102004010402", "Yatula Enterprises-02", 694),
                createActualPollingStation("102004010501", "SDA Church (Tent)-01", 927),
                createActualPollingStation("102004010601", "Chep Community School-01", 895),
                createActualPollingStation("102004010602", "Chep Community School-02", 894),
                createActualPollingStation("102004010701", "Chep Community School-01", 768),
                createActualPollingStation("102004010801", "Ipusukilo RDC Office-01", 526),
                createActualPollingStation("102004010901", "Ipusukilo RDC Office -01", 787),
                createActualPollingStation("102004010902", "Ipusukilo RDC Office -02", 786),
                createActualPollingStation("102004010903", "Ipusukilo RDC Office -03", 786),
                createActualPollingStation("102004010904", "Ipusukilo RDC Office -04", 786),
                createActualPollingStation("102004011001", "Kapoto (Tent)-01", 613),
                createActualPollingStation("102004011002", "Kapoto (Tent)-02", 612),
              ]
            },
            {
              id: "copperbelt-kitwe-nkana-chantete",
              name: "CHANTETE",
              councillorCandidates: generateCouncillorCandidates("copperbelt-kitwe-nkana-chantete"),
              pollingStations: [
                createActualPollingStation("102004011101", "Nyali Community School-01", 957),
                createActualPollingStation("102004011201", "Mupundu primary School-01", 611),
                createActualPollingStation("102004011301", "Chantete Primary School -01", 357),
                createActualPollingStation("102004011401", "Mukuba Primary School-01", 531),
                createActualPollingStation("102004011501", "Kamilili Community School-01", 325),
                createActualPollingStation("102004011601", "Kamiseshi Community School-01", 432),
                createActualPollingStation("102004011701", "Mobile Police Camp (Tent)-01", 408),
                createActualPollingStation("102004011801", "Across (Tent)-01", 644),
                createActualPollingStation("102004011802", "Across (Tent)-02", 644),
              ]
            },
            {
              id: "copperbelt-kitwe-nkana-musonda",
              name: "MUSONDA",
              councillorCandidates: generateCouncillorCandidates("copperbelt-kitwe-nkana-musonda"),
              pollingStations: [
                createActualPollingStation("102004011901", "Musonda Center Primary School-01", 694),
                createActualPollingStation("102004012001", "Women Community Centre-01", 781),
                createActualPollingStation("102004012002", "Women Community Centre-02", 781),
                createActualPollingStation("102004012003", "Women Community Centre-03", 780),
                createActualPollingStation("102004012004", "Women Community Centre-04", 780),
                createActualPollingStation("102004012101", "Country Side School-01", 592),
                createActualPollingStation("102004012102", "Country Side School-02", 592),
                createActualPollingStation("102004012201", "Catholic Church-01", 794),
                createActualPollingStation("102004012202", "Catholic Church-02", 793),
                createActualPollingStation("102004012203", "Catholic Church-03", 793),
                createActualPollingStation("102004012204", "Catholic Church-04", 793),
                createActualPollingStation("102004012301", "Faith Fire Ministries-01", 728),
              ]
            },
            {
              id: "copperbelt-kitwe-nkana-riverside",
              name: "RIVERSIDE",
              councillorCandidates: generateCouncillorCandidates("copperbelt-kitwe-nkana-riverside"),
              pollingStations: [
                createActualPollingStation("102004012401", "Valleyview Secondary School-01", 792),
                createActualPollingStation("102004012402", "Valleyview Secondary School-02", 792),
                createActualPollingStation("102004012403", "Valleyview Secondary School-03", 791),
                createActualPollingStation("102004012501", "Riverside Primary School-01", 603),
                createActualPollingStation("102004012601", "Lamb of God Christian School-01", 437),
                createActualPollingStation("102004012701", "UCZ Riverside Congregation -01", 625),
                createActualPollingStation("102004012801", "Lamb of God Christian School-01", 160),
                createActualPollingStation("102004012901", "Valleyview Secondary School-01", 565),
                createActualPollingStation("102004013001", "Copperbelt University-01", 878),
                createActualPollingStation("102004013002", "Copperbelt University-02", 877),
                createActualPollingStation("102004013003", "Copperbelt University-03", 877),
                createActualPollingStation("102004013004", "Copperbelt University-04", 877),
                createActualPollingStation("102004013005", "Copperbelt University-05", 877),
                createActualPollingStation("102004013006", "Copperbelt University-06", 877),
                createActualPollingStation("102004013007", "Copperbelt University-07", 877),
              ]
            },
            {
              id: "copperbelt-kitwe-nkana-lubwa",
              name: "LUBWA",
              councillorCandidates: generateCouncillorCandidates("copperbelt-kitwe-nkana-lubwa"),
              pollingStations: [
                createActualPollingStation("102004013101", "Matete Secondary School-01", 663),
                createActualPollingStation("102004013102", "Matete Secondary School-02", 662),
                createActualPollingStation("102004013201", "Riverain Primary School-01", 879),
                createActualPollingStation("102004013301", "Riverain Primary School-01", 672),
                createActualPollingStation("102004013302", "Riverain Primary School-02", 671),
                createActualPollingStation("102004013303", "Riverain Primary School-03", 671),
                createActualPollingStation("102004013401", "Nkana Trust School-01", 796),
                createActualPollingStation("102004013402", "Nkana Trust School-02", 796),
                createActualPollingStation("102004013501", "ST Mathews The Apostle Parish Catholic Chu", 754),
                createActualPollingStation("102004013502", "ST Mathews The Apostle Parish Catholic Chu", 753),
                createActualPollingStation("102004013503", "ST Mathews The Apostle Parish Catholic Chu", 753),
                createActualPollingStation("102004013601", "Nsama Primary School-01", 612),
              ]
            },
            {
              id: "copperbelt-kitwe-nkana-buchi",
              name: "BUCHI",
              councillorCandidates: generateCouncillorCandidates("copperbelt-kitwe-nkana-buchi"),
              pollingStations: [
                createActualPollingStation("102004013701", "Buseko Primary School-01", 287),
                createActualPollingStation("102004013801", "Bamboo Council Building-01", 646),
                createActualPollingStation("102004013802", "Bamboo Council Building-02", 646),
                createActualPollingStation("102004013901", "Kawama Primary School-01", 671),
                createActualPollingStation("102004013902", "Kawama Primary School-02", 671),
                createActualPollingStation("102004014001", "Sandulula Centre-01", 644),
                createActualPollingStation("102004014101", "Kamitondo Secondary School-01", 803),
                createActualPollingStation("102004014201", "Kamitondo Secondary School-01", 921),
                createActualPollingStation("102004014202", "Kamitondo Secondary School-02", 921),
                createActualPollingStation("102004014203", "Kamitondo Secondary School-03", 920),
                createActualPollingStation("102004014301", "Buchi Committee Room-01", 623),
                createActualPollingStation("102004014302", "Buchi Committee Room-02", 622),
                createActualPollingStation("102004014401", "Buseko Primary School-01", 880),
                createActualPollingStation("102004014402", "Buseko Primary School-02", 880),
                createActualPollingStation("102004014403", "Buseko Primary School-03", 880),
                createActualPollingStation("102004014404", "Buseko Primary School-04", 880),
                createActualPollingStation("102004014405", "Buseko Primary School-05", 880),
                createActualPollingStation("102004014406", "Buseko Primary School-06", 879),
                createActualPollingStation("102004014501", "Twashuka Community School-01", 558),
              ]
            },
            {
              id: "copperbelt-kitwe-nkana-parklands",
              name: "PARKLANDS",
              councillorCandidates: generateCouncillorCandidates("copperbelt-kitwe-nkana-parklands"),
              pollingStations: [
                createActualPollingStation("102004014601", "YMCA Norfred House-01", 401),
                createActualPollingStation("102004014701", "Helen Kaunda Secondary School-01", 868),
                createActualPollingStation("102004014702", "Helen Kaunda Secondary School-02", 868),
                createActualPollingStation("102004014801", "Kitwe Boys Secondary School-01", 664),
                createActualPollingStation("102004014802", "Kitwe Boys Secondary School-02", 663),
                createActualPollingStation("102004014901", "Parklands Secondary School-01", 777),
                createActualPollingStation("102004014902", "Parklands Secondary School-02", 776),
                createActualPollingStation("102004015001", "ZIPSIP-01", 789),
                createActualPollingStation("102004015101", "Council Main Library-01", 805),
                createActualPollingStation("102004015102", "Council Main Library-02", 804),
                createActualPollingStation("102004015103", "Council Main Library-03", 804),
                createActualPollingStation("102004015104", "Council Main Library-04", 804),
                createActualPollingStation("102004015201", "Freedom Park (Tent)-01", 391),
              ]
            },
            {
              id: "copperbelt-kitwe-nkana-mukuba",
              name: "MUKUBA",
              councillorCandidates: generateCouncillorCandidates("copperbelt-kitwe-nkana-mukuba"),
              pollingStations: [
                createActualPollingStation("102004015301", "Kitwe Main Primary School-01", 609),
                createActualPollingStation("102004015302", "Kitwe Main Primary School-02", 609),
                createActualPollingStation("102004015401", "Diamond Drive CHEP Offices-01", 423),
                createActualPollingStation("102004015501", "Kitwe Main Primary School-01", 815),
                createActualPollingStation("102004015502", "Kitwe Main Primary School-02", 815),
                createActualPollingStation("102004015601", "Faith Foundation Orphanage-01", 485),
                createActualPollingStation("102004015701", "St Antony Community School-01", 705),
                createActualPollingStation("102004015702", "St Antony Community School-02", 705),
                createActualPollingStation("102004015703", "St Antony Community School-03", 705),
                createActualPollingStation("102004015801", "Mukuba Primary School-01", 793),
                createActualPollingStation("102004015802", "Mukuba Primary School-02", 792),
              ]
            },
            {
              id: "copperbelt-kitwe-nkana-rokana",
              name: "ROKANA",
              councillorCandidates: generateCouncillorCandidates("copperbelt-kitwe-nkana-rokana"),
              pollingStations: [
                createActualPollingStation("102004015901", "Oasis of Love Church-01", 674),
                createActualPollingStation("102004016001", "Rokana Primary School-01", 614),
                createActualPollingStation("102004016101", "Rokana Primary School-01", 984),
                createActualPollingStation("102004016102", "Rokana Primary School-02", 984),
              ]
            },
            {
              id: "copperbelt-kitwe-nkana-kamakonde",
              name: "KAMAKONDE",
              councillorCandidates: generateCouncillorCandidates("copperbelt-kitwe-nkana-kamakonde"),
              pollingStations: [
                createActualPollingStation("102004016201", "Judy Christian Primary School-01", 601),
                createActualPollingStation("102004016202", "Judy Christian Primary School-02", 600),
                createActualPollingStation("102004016301", "Kamakonde Primary School-01", 904),
                createActualPollingStation("102004016302", "Kamakonde Primary School-02", 904),
                createActualPollingStation("102004016303", "Kamakonde Primary School-03", 904),
                createActualPollingStation("102004016401", "St. Anthony Catholic Church-01", 756),
                createActualPollingStation("102004016501", "Mapalo Primary School-01", 531),
              ]
            },
            {
              id: "copperbelt-kitwe-nkana-miseshi",
              name: "MISESHI",
              councillorCandidates: generateCouncillorCandidates("copperbelt-kitwe-nkana-miseshi"),
              pollingStations: [
                createActualPollingStation("102004016601", "Machona Primary School-01", 592),
                createActualPollingStation("102004016602", "Machona Primary School-02", 591),
                createActualPollingStation("102004016701", "Buntungwa Primary School-01", 818),
                createActualPollingStation("102004016702", "Buntungwa Primary School-02", 818),
                createActualPollingStation("102004016703", "Buntungwa Primary School-03", 818),
                createActualPollingStation("102004016704", "Buntungwa Primary School-04", 817),
                createActualPollingStation("102004016705", "Buntungwa Primary School-05", 817),
                createActualPollingStation("102004016801", "Mindolo Welfare Centre-01", 756),
                createActualPollingStation("102004016802", "Mindolo Welfare Centre-02", 756),
                createActualPollingStation("102004016803", "Mindolo Welfare Centre-03", 755),
                createActualPollingStation("102004016901", "Mindolo Welfare Centre-01", 634),
                createActualPollingStation("102004016902", "Mindolo Welfare Centre-02", 634),
              ]
            },
            {
              id: "copperbelt-kitwe-nkana-mindolo",
              name: "MINDOLO",
              councillorCandidates: generateCouncillorCandidates("copperbelt-kitwe-nkana-mindolo"),
              pollingStations: [
                createActualPollingStation("102004017001", "King Solomon Institute for Studies-01", 615),
                createActualPollingStation("102004017101", "King Solomon Institute for Studies-01", 736),
                createActualPollingStation("102004017201", "Salemu Primary School-01", 840),
                createActualPollingStation("102004017202", "Salemu Primary School-02", 840),
                createActualPollingStation("102004017203", "Salemu Primary School-03", 840),
                createActualPollingStation("102004017204", "Salemu Primary School-04", 840),
                createActualPollingStation("102004017301", "Mindolo Primary School-01", 857),
                createActualPollingStation("102004017302", "Mindolo Primary School-02", 857),
                createActualPollingStation("102004017401", "KTTC Hall-01", 556),
                createActualPollingStation("102004017402", "KTTC Hall-02", 556),
                createActualPollingStation("102004017501", "Salemu Primary School-01", 731),
                createActualPollingStation("102004017502", "Salemu Primary School-02", 731),
                createActualPollingStation("102004017601", "Salemu Primary School-01", 656),
                createActualPollingStation("102004017602", "Salemu Primary School-02", 655),
              ]
            },
            {
              id: "copperbelt-kitwe-nkana-luyando",
              name: "LUYANDO",
              councillorCandidates: generateCouncillorCandidates("copperbelt-kitwe-nkana-luyando"),
              pollingStations: [
                createActualPollingStation("102004017701", "Musa Primary School-01", 879),
                createActualPollingStation("102004017702", "Musa Primary School-02", 879),
                createActualPollingStation("102004017703", "Musa Primary School-03", 878),
                createActualPollingStation("102004017801", "Luyando Primary School-01", 857),
                createActualPollingStation("102004017802", "Luyando Primary School-02", 857),
                createActualPollingStation("102004017803", "Luyando Primary School-03", 856),
              ]
            },
          ]
        },
        {
          id: "copperbelt-kitwe-wusakile",
          name: "WUSAKILE",
          mpCandidates: generateMPCandidates("copperbelt-kitwe-wusakile"),
          wards: [
            {
              id: "copperbelt-kitwe-wusakile-wusakile",
              name: "WUSAKILE",
              councillorCandidates: generateCouncillorCandidates("copperbelt-kitwe-wusakile-wusakile"),
              pollingStations: [
                createActualPollingStation("102004017901", "Wusakile Secondary School-01", 822),
                createActualPollingStation("102004017902", "Wusakile Secondary School-02", 821),
                createActualPollingStation("102004018001", "Wusakile Secondary School-01", 665),
                createActualPollingStation("102004018002", "Wusakile Secondary School-02", 665),
                createActualPollingStation("102004018101", "Wusakile Secondary School-01", 807),
                createActualPollingStation("102004018102", "Wusakile Secondary School-02", 806),
                createActualPollingStation("102004018103", "Wusakile Secondary School-03", 806),
                createActualPollingStation("102004018104", "Wusakile Secondary School-04", 806),
                createActualPollingStation("102004018105", "Wusakile Secondary School-05", 806),
                createActualPollingStation("102004018201", "Children of Bethrehem School-01", 791),
                createActualPollingStation("102004018301", "Kalela Primary School-01", 998),
                createActualPollingStation("102004018401", "Lido Hall-01", 802),
                createActualPollingStation("102004018402", "Lido Hall-02", 802),
                createActualPollingStation("102004018403", "Lido Hall-03", 802),
                createActualPollingStation("102004018501", "Kalela Primary School-01", 706),
                createActualPollingStation("102004018502", "Kalela Primary School-02", 706),
                createActualPollingStation("102004018503", "Kalela Primary School-03", 705),
                createActualPollingStation("102004018601", "Children of Bethrehem School-01", 502),
                createActualPollingStation("102004018602", "Children of Bethrehem School-02", 502),
                createActualPollingStation("102004018701", "Children of Bethrehem School-01", 949),
              ]
            },
            {
              id: "copperbelt-kitwe-wusakile-chibote",
              name: "CHIBOTE",
              councillorCandidates: generateCouncillorCandidates("copperbelt-kitwe-wusakile-chibote"),
              pollingStations: [
                createActualPollingStation("102004018801", "New Life Christian Centre-01", 601),
                createActualPollingStation("102004018901", "Wusakile Community Centre-01", 770),
                createActualPollingStation("102004018902", "Wusakile Community Centre-02", 769),
                createActualPollingStation("102004018903", "Wusakile Community Centre-03", 769),
                createActualPollingStation("102004018904", "Wusakile Community Centre-04", 769),
                createActualPollingStation("102004019001", "Wusakile Community Centre-01", 905),
                createActualPollingStation("102004019101", "Nkana Primary School-01", 691),
                createActualPollingStation("102004019102", "Nkana Primary School-02", 690),
              ]
            },
            {
              id: "copperbelt-kitwe-wusakile-chamboli",
              name: "CHAMBOLI",
              councillorCandidates: generateCouncillorCandidates("copperbelt-kitwe-wusakile-chamboli"),
              pollingStations: [
                createActualPollingStation("102004019201", "Twashuka Secondary School-01", 943),
                createActualPollingStation("102004019202", "Twashuka Secondary School-02", 943),
                createActualPollingStation("102004019203", "Twashuka Secondary School-03", 943),
                createActualPollingStation("102004019301", "Twashuka Secondary School-01", 918),
                createActualPollingStation("102004019302", "Twashuka Secondary School-02", 917),
                createActualPollingStation("102004019303", "Twashuka Secondary School-03", 917),
                createActualPollingStation("102004019401", "Chamboli Primary School-01", 972),
                createActualPollingStation("102004019402", "Chamboli Primary School-02", 972),
                createActualPollingStation("102004019501", "Bupe Primary School-01", 887),
                createActualPollingStation("102004019502", "Bupe Primary School-02", 887),
                createActualPollingStation("102004019503", "Bupe Primary School-03", 887),
                createActualPollingStation("102004019601", "Bupe Primary School-01", 543),
                createActualPollingStation("102004019602", "Bupe Primary School-02", 542),
                createActualPollingStation("102004019701", "Chamboli Primary School-01", 397),
                createActualPollingStation("102004019801", "Butotelo Primary School-01", 798),
                createActualPollingStation("102004019802", "Butotelo Primary School-02", 797),
                createActualPollingStation("102004019901", "SOS-01", 845),
                createActualPollingStation("102004020001", "Chamboli Primary School-01", 787),
              ]
            },
            {
              id: "copperbelt-kitwe-wusakile-luangwa",
              name: "LUANGWA",
              councillorCandidates: generateCouncillorCandidates("copperbelt-kitwe-wusakile-luangwa"),
              pollingStations: [
                createActualPollingStation("102004020101", "Luangwa Secondary School-01", 879),
                createActualPollingStation("102004020102", "Luangwa Secondary School-02", 879),
                createActualPollingStation("102004020103", "Luangwa Secondary School-03", 878),
                createActualPollingStation("102004020104", "Luangwa Secondary School-04", 878),
                createActualPollingStation("102004020201", "Luangwa Secondary School-01", 676),
                createActualPollingStation("102004020202", "Luangwa Secondary School-02", 675),
                createActualPollingStation("102004020301", "Twatemwa Secondary School-01", 858),
                createActualPollingStation("102004020302", "Twatemwa Secondary School-02", 857),
                createActualPollingStation("102004020303", "Twatemwa Secondary School-03", 857),
                createActualPollingStation("102004020401", "African Methodist Church-01", 323),
                createActualPollingStation("102004020501", "Twafweni Primary School-01", 758),
                createActualPollingStation("102004020502", "Twafweni Primary School-02", 758),
                createActualPollingStation("102004020503", "Twafweni Primary School-03", 758),
                createActualPollingStation("102004020504", "Twafweni Primary School-04", 758),
                createActualPollingStation("102004020601", "Luangwa UCZ Church-01", 801),
                createActualPollingStation("102004020602", "Luangwa UCZ Church-02", 801),
                createActualPollingStation("102004020701", "Twatemwa Secondary School-01", 827),
                createActualPollingStation("102004020702", "Twatemwa Secondary School-02", 826),
                createActualPollingStation("102004020801", "Catholic School-01", 687),
              ]
            },
            {
              id: "copperbelt-kitwe-wusakile-luto",
              name: "LUTO",
              councillorCandidates: generateCouncillorCandidates("copperbelt-kitwe-wusakile-luto"),
              pollingStations: [
                createActualPollingStation("102004020901", "Lima Secondary School-01", 862),
                createActualPollingStation("102004021001", "Church of God-01", 538),
                createActualPollingStation("102004021101", "Airport-01", 58),
                createActualPollingStation("102004021201", "Chilobwe UCZ-01", 127),
                createActualPollingStation("102004021301", "Miombo Primary School-01", 371),
                createActualPollingStation("102004021401", "Lupili Primary School-01", 253),
              ]
            },
            {
              id: "copperbelt-kitwe-wusakile-limaposa",
              name: "LIMAPOSA",
              councillorCandidates: generateCouncillorCandidates("copperbelt-kitwe-wusakile-limaposa"),
              pollingStations: [
                createActualPollingStation("102004021501", "Pentecostal Holiness Church-01", 278),
                createActualPollingStation("102004021601", "Cedric Farm School-01", 385),
                createActualPollingStation("102004021701", "Limaposa Disciples Church-01", 732),
                createActualPollingStation("102004021702", "Limaposa Disciples Church-02", 732),
                createActualPollingStation("102004021801", "Church Of God-01", 104),
              ]
            },
          ]
        },
      ]
    },
    {
      id: "luanshya",
      name: "LUANSHYA",
      mayoralCandidates: generateMayoralCandidates("luanshya"),
      constituencies: [
        {
          id: "copperbelt-luanshya-luanshya",
          name: "LUANSHYA",
          mpCandidates: generateMPCandidates("copperbelt-luanshya-luanshya"),
          wards: [
            {
              id: "copperbelt-luanshya-luanshya-baluba",
              name: "BALUBA",
              councillorCandidates: generateCouncillorCandidates("copperbelt-luanshya-luanshya-baluba"),
              pollingStations: [
                createActualPollingStation("102005000101", "St Catherine Catholic-01", 840),
                createActualPollingStation("102005000102", "St Catherine Catholic-02", 840),
                createActualPollingStation("102005000103", "St Catherine Catholic-03", 840),
                createActualPollingStation("102005000104", "St Catherine Catholic-04", 839),
                createActualPollingStation("102005000201", "Baluba Primary School-01", 405),
                createActualPollingStation("102005000301", "Chibwe Catholic Church-01", 417),
                createActualPollingStation("102005000401", "Elohim Primary School-01", 415),
              ]
            },
            {
              id: "copperbelt-luanshya-luanshya-fisenge",
              name: "FISENGE",
              councillorCandidates: generateCouncillorCandidates("copperbelt-luanshya-luanshya-fisenge"),
              pollingStations: [
                createActualPollingStation("102005000501", "Kasongo Primary School-01", 564),
                createActualPollingStation("102005000601", "Fisenge Primary School-01", 831),
                createActualPollingStation("102005000602", "Fisenge Primary School-02", 830),
                createActualPollingStation("102005000603", "Fisenge Primary School-03", 830),
                createActualPollingStation("102005000604", "Fisenge Primary School-04", 830),
                createActualPollingStation("102005000701", "Siwale Farm-01", 257),
              ]
            },
            {
              id: "copperbelt-luanshya-luanshya-chitwi",
              name: "CHITWI",
              councillorCandidates: generateCouncillorCandidates("copperbelt-luanshya-luanshya-chitwi"),
              pollingStations: [
                createActualPollingStation("102005000801", "Village 1 Centre-01", 447),
                createActualPollingStation("102005000901", "Kafubu Block Primary School-01", 434),
                createActualPollingStation("102005001001", "Village 3 Community School-01", 590),
                createActualPollingStation("102005001101", "Village 4 Centre-01", 287),
                createActualPollingStation("102005001201", "Village II Centre-01", 321),
                createActualPollingStation("102005001301", "DAPP Community Centre-01", 180),
              ]
            },
            {
              id: "copperbelt-luanshya-luanshya-twashuka",
              name: "TWASHUKA",
              councillorCandidates: generateCouncillorCandidates("copperbelt-luanshya-luanshya-twashuka"),
              pollingStations: [
                createActualPollingStation("102005001401", "Kapenda Primary School-01", 267),
                createActualPollingStation("102005001501", "Banja Farms-01", 50),
                createActualPollingStation("102005001601", "Mazzieri Primary School-01", 879),
                createActualPollingStation("102005001602", "Mazzieri Primary School-02", 878),
                createActualPollingStation("102005001603", "Mazzieri Primary School-03", 878),
                createActualPollingStation("102005001701", "St William Catholic Church-01", 654),
                createActualPollingStation("102005052301", "Chitwi Correctional Facility -01", 172),
              ]
            },
            {
              id: "copperbelt-luanshya-luanshya-buntungwa",
              name: "BUNTUNGWA",
              councillorCandidates: generateCouncillorCandidates("copperbelt-luanshya-luanshya-buntungwa"),
              pollingStations: [
                createActualPollingStation("102005001801", "Kankwiba Primary School-01", 213),
                createActualPollingStation("102005001901", "Chifulube Primary School-01", 183),
                createActualPollingStation("102005002001", "Mama Rosa Primary School-01", 911),
                createActualPollingStation("102005002002", "Mama Rosa Primary School-02", 911),
                createActualPollingStation("102005002003", "Mama Rosa Primary School-03", 910),
                createActualPollingStation("102005002004", "Mama Rosa Primary School-04", 910),
                createActualPollingStation("102005002005", "Mama Rosa Primary School-05", 910),
              ]
            },
            {
              id: "copperbelt-luanshya-luanshya-kamuchanga",
              name: "KAMUCHANGA",
              councillorCandidates: generateCouncillorCandidates("copperbelt-luanshya-luanshya-kamuchanga"),
              pollingStations: [
                createActualPollingStation("102005002101", "Kamuchanga Community Centre-01", 927),
                createActualPollingStation("102005002102", "Kamuchanga Community Centre-02", 926),
                createActualPollingStation("102005002103", "Kamuchanga Community Centre-03", 926),
                createActualPollingStation("102005002201", "Malaika Primary School-01", 544),
                createActualPollingStation("102005002202", "Malaika Primary School-02", 544),
                createActualPollingStation("102005002301", "Tonga Farm-01", 85),
              ]
            },
            {
              id: "copperbelt-luanshya-luanshya-mwaiseni",
              name: "MWAISENI",
              councillorCandidates: generateCouncillorCandidates("copperbelt-luanshya-luanshya-mwaiseni"),
              pollingStations: [
                createActualPollingStation("102005002501", "Pentecostal Assemblies of God-01", 750),
                createActualPollingStation("102005002601", "Mwaiseni Community School-01", 900),
                createActualPollingStation("102005002602", "Mwaiseni Community School-02", 900),
                createActualPollingStation("102005002603", "Mwaiseni Community School-03", 900),
              ]
            },
            {
              id: "copperbelt-luanshya-luanshya-mulungushi",
              name: "MULUNGUSHI",
              councillorCandidates: generateCouncillorCandidates("copperbelt-luanshya-luanshya-mulungushi"),
              pollingStations: [
                createActualPollingStation("102005002701", "Harold Orphanage-01", 487),
                createActualPollingStation("102005002801", "Twatemwa Primary School-01", 743),
                createActualPollingStation("102005002802", "Twatemwa Primary School-02", 743),
                createActualPollingStation("102005002803", "Twatemwa Primary School-03", 743),
                createActualPollingStation("102005002901", "Kalala Market-01", 640),
                createActualPollingStation("102005002902", "Kalala Market-02", 639),
                createActualPollingStation("102005003001", "Mipundu Primary School-01", 674),
              ]
            },
            {
              id: "copperbelt-luanshya-luanshya-zambezi",
              name: "ZAMBEZI",
              councillorCandidates: generateCouncillorCandidates("copperbelt-luanshya-luanshya-zambezi"),
              pollingStations: [
                createActualPollingStation("102005003101", "Tumfwane Community Centre-01", 526),
                createActualPollingStation("102005003102", "Tumfwane Community Centre-02", 526),
                createActualPollingStation("102005003201", "Tumfwane Community Centre-01", 280),
                createActualPollingStation("102005003301", "Buntungwa Community Centre-01", 858),
                createActualPollingStation("102005003401", "Mipundu Primary School-01", 769),
              ]
            },
            {
              id: "copperbelt-luanshya-luanshya-mikomfwa",
              name: "MIKOMFWA",
              councillorCandidates: generateCouncillorCandidates("copperbelt-luanshya-luanshya-mikomfwa"),
              pollingStations: [
                createActualPollingStation("102005003501", "Mikomfwa Secondary School-01", 820),
                createActualPollingStation("102005003502", "Mikomfwa Secondary School-02", 820),
                createActualPollingStation("102005003601", "Bwananyina Primary School-01", 666),
                createActualPollingStation("102005003602", "Bwananyina Primary School-02", 665),
                createActualPollingStation("102005003701", "Ngwee Community Centre-01", 837),
                createActualPollingStation("102005003801", "Twalichulile Community Centre-01", 701),
                createActualPollingStation("102005003901", "Twalichulile Community Centre-01", 565),
                createActualPollingStation("102005004001", "Twalichulile Community Centre-01", 670),
                createActualPollingStation("102005004002", "Twalichulile Community Centre-02", 670),
                createActualPollingStation("102005004003", "Twalichulile Community Centre-03", 669),
              ]
            },
            {
              id: "copperbelt-luanshya-luanshya-levi-chito",
              name: "LEVI CHITO",
              councillorCandidates: generateCouncillorCandidates("copperbelt-luanshya-luanshya-levi-chito"),
              pollingStations: [
                createActualPollingStation("102005004101", "Buteko Community Centre-01", 657),
                createActualPollingStation("102005004201", "Muchinshi Primary School-01", 743),
                createActualPollingStation("102005004202", "Muchinshi Primary School-02", 742),
                createActualPollingStation("102005004203", "Muchinshi Primary School-03", 742),
                createActualPollingStation("102005004301", "Mikomfwa Welfare Centre-01", 978),
                createActualPollingStation("102005052101", "Luanshya Correctional facility-01", 320),
              ]
            },
            {
              id: "copperbelt-luanshya-luanshya-mipundu",
              name: "MIPUNDU",
              councillorCandidates: generateCouncillorCandidates("copperbelt-luanshya-luanshya-mipundu"),
              pollingStations: [
                createActualPollingStation("102005004401", "Muchinshi Play Park (Coctail Council Bar)-01", 586),
                createActualPollingStation("102005004402", "Muchinshi Play Park (Coctail Council Bar)-02", 586),
                createActualPollingStation("102005004501", "Nkoloma Community Centre-01", 437),
                createActualPollingStation("102005004601", "Nkoloma Community Centre-01", 764),
                createActualPollingStation("102005004602", "Nkoloma Community Centre-02", 764),
              ]
            },
            {
              id: "copperbelt-luanshya-luanshya-james-phiri",
              name: "JAMES PHIRI",
              councillorCandidates: generateCouncillorCandidates("copperbelt-luanshya-luanshya-james-phiri"),
              pollingStations: [
                createActualPollingStation("102005004701", "Luanshya Skills-01", 955),
                createActualPollingStation("102005004801", "District Education Office-01", 744),
                createActualPollingStation("102005004901", "Rotary Centre-01", 778),
                createActualPollingStation("102005004902", "Rotary Centre-02", 777),
                createActualPollingStation("102005005001", "Chibansa Primary School-01", 552),
                createActualPollingStation("102005005002", "Chibansa Primary School-02", 552),
              ]
            },
            {
              id: "copperbelt-luanshya-luanshya-buteko",
              name: "BUTEKO",
              councillorCandidates: generateCouncillorCandidates("copperbelt-luanshya-luanshya-buteko"),
              pollingStations: [
                createActualPollingStation("102005005101", "Luanshya Boys Secondary School-01", 864),
                createActualPollingStation("102005005102", "Luanshya Boys Secondary School-02", 863),
                createActualPollingStation("102005005201", "Luanshya Trades-01", 795),
                createActualPollingStation("102005005301", "Kamirenda Community School-01", 513),
                createActualPollingStation("102005005302", "Kamirenda Community School-02", 513),
                createActualPollingStation("102005005401", "St Nel School-01", 117),
                createActualPollingStation("102005005501", "Kamirenda Primary School-01", 713),
                createActualPollingStation("102005005502", "Kamirenda Primary School-02", 712),
                createActualPollingStation("102005005503", "Kamirenda Primary School-03", 712),
              ]
            },
            {
              id: "copperbelt-luanshya-luanshya-mpelembe",
              name: "MPELEMBE",
              councillorCandidates: generateCouncillorCandidates("copperbelt-luanshya-luanshya-mpelembe"),
              pollingStations: [
                createActualPollingStation("102005005601", "Rivercross Primary School-01", 773),
                createActualPollingStation("102005005602", "Rivercross Primary School-02", 772),
                createActualPollingStation("102005005701", "Luanshya Trust School-01", 716),
                createActualPollingStation("102005005702", "Luanshya Trust School-02", 716),
                createActualPollingStation("102005005801", "Mpelembe Secondary School-01", 708),
                createActualPollingStation("102005005802", "Mpelembe Secondary School-02", 707),
                createActualPollingStation("102005005803", "Mpelembe Secondary School-03", 707),
                createActualPollingStation("102005005901", "Mine Recreation Club-01", 564),
                createActualPollingStation("102005005902", "Mine Recreation Club-02", 563),
              ]
            },
            {
              id: "copperbelt-luanshya-luanshya-chawama",
              name: "CHAWAMA",
              councillorCandidates: generateCouncillorCandidates("copperbelt-luanshya-luanshya-chawama"),
              pollingStations: [
                createActualPollingStation("102005006001", "Kapupulu Primary School-01", 647),
                createActualPollingStation("102005006101", "Kakumba Primary-01", 329),
                createActualPollingStation("102005006201", "Chawama Community School-01", 623),
                createActualPollingStation("102005006301", "Blind Centre-01", 395),
              ]
            },
          ]
        },
        {
          id: "copperbelt-luanshya-roan",
          name: "ROAN",
          mpCandidates: generateMPCandidates("copperbelt-luanshya-roan"),
          wards: [
            {
              id: "copperbelt-luanshya-roan-maposa",
              name: "MAPOSA",
              councillorCandidates: generateCouncillorCandidates("copperbelt-luanshya-roan-maposa"),
              pollingStations: [
                createActualPollingStation("102005006401", "St Thomas Catholic Church-01", 891),
                createActualPollingStation("102005006501", "St Peter Catholic Church-01", 204),
                createActualPollingStation("102005006601", "John Ken Primary School-01", 224),
                createActualPollingStation("102005006701", "Chiminwa Health Post-01", 236),
                createActualPollingStation("102005006801", "Maposa Primary School-01", 562),
                createActualPollingStation("102005006901", "UCZ (Pa Fred)-01", 309),
              ]
            },
            {
              id: "copperbelt-luanshya-roan-kawama",
              name: "KAWAMA",
              councillorCandidates: generateCouncillorCandidates("copperbelt-luanshya-roan-kawama"),
              pollingStations: [
                createActualPollingStation("102005007001", "Maila's Farm-01", 281),
                createActualPollingStation("102005007101", "Kasununu New Apostolic Church-01", 174),
                createActualPollingStation("102005007201", "Kawama Primary School-01", 738),
                createActualPollingStation("102005007202", "Kawama Primary School-02", 738),
                createActualPollingStation("102005007203", "Kawama Primary School-03", 738),
                createActualPollingStation("102005007301", "Mpata Hill Primary School-01", 485),
                createActualPollingStation("102005007401", "Chendamaunga Community School-01", 369),
              ]
            },
            {
              id: "copperbelt-luanshya-roan-lumumba",
              name: "LUMUMBA",
              councillorCandidates: generateCouncillorCandidates("copperbelt-luanshya-roan-lumumba"),
              pollingStations: [
                createActualPollingStation("102005007501", "Bwafwano Community Centre-01", 988),
                createActualPollingStation("102005007601", "Section 5 Clinic (Temporal Shelter)-01", 647),
                createActualPollingStation("102005007701", "Makoma Primary School-01", 891),
                createActualPollingStation("102005007702", "Makoma Primary School-02", 891),
                createActualPollingStation("102005007801", "Makoma Primary School-01", 279),
              ]
            },
            {
              id: "copperbelt-luanshya-roan-nkoloma",
              name: "NKOLOMA",
              councillorCandidates: generateCouncillorCandidates("copperbelt-luanshya-roan-nkoloma"),
              pollingStations: [
                createActualPollingStation("102005007901", "Makoma Community School-01", 585),
                createActualPollingStation("102005007902", "Makoma Community School-02", 584),
                createActualPollingStation("102005008001", "Roan Primary School-01", 910),
              ]
            },
            {
              id: "copperbelt-luanshya-roan-kafubu",
              name: "KAFUBU",
              councillorCandidates: generateCouncillorCandidates("copperbelt-luanshya-roan-kafubu"),
              pollingStations: [
                createActualPollingStation("102005008101", "Twashuka Secondary School-01", 588),
                createActualPollingStation("102005008102", "Twashuka Secondary School-02", 588),
                createActualPollingStation("102005008201", "Roan Antelope Secondary School-01", 814),
                createActualPollingStation("102005008202", "Roan Antelope Secondary School-02", 813),
                createActualPollingStation("102005008301", "Youth Scheme (Temporal Shelter)-01", 608),
              ]
            },
            {
              id: "copperbelt-luanshya-roan-chilabula",
              name: "CHILABULA",
              councillorCandidates: generateCouncillorCandidates("copperbelt-luanshya-roan-chilabula"),
              pollingStations: [
                createActualPollingStation("102005002401", "Ng'ombe New Apostolic Church-01", 176),
                createActualPollingStation("102005008401", "Kampelembe Community School-01", 329),
                createActualPollingStation("102005008501", "Chisokone Community School-01", 402),
                createActualPollingStation("102005008601", "Kamishishi Community School-01", 234),
                createActualPollingStation("102005008701", "Chilabula Primary School-01", 480),
              ]
            },
            {
              id: "copperbelt-luanshya-roan-kafue",
              name: "KAFUE",
              councillorCandidates: generateCouncillorCandidates("copperbelt-luanshya-roan-kafue"),
              pollingStations: [
                createActualPollingStation("102005008801", "Kafubu Primary School-01", 959),
                createActualPollingStation("102005008802", "Kafubu Primary School-02", 958),
                createActualPollingStation("102005008901", "Fisansa Primary School-01", 1000),
                createActualPollingStation("102005008902", "Fisansa Primary School-02", 999),
                createActualPollingStation("102005009001", "Fisansa Primary School-01", 517),
                createActualPollingStation("102005009101", "Fisansa Community Centre-01", 586),
                createActualPollingStation("102005009201", "Fisansa PlayPark (Temporal Shelter)-01", 277),
              ]
            },
            {
              id: "copperbelt-luanshya-roan-justine-kabwe",
              name: "JUSTINE KABWE",
              councillorCandidates: generateCouncillorCandidates("copperbelt-luanshya-roan-justine-kabwe"),
              pollingStations: [
                createActualPollingStation("102005009301", "Mwaiseni Primary School-01", 849),
                createActualPollingStation("102005009302", "Mwaiseni Primary School-02", 848),
                createActualPollingStation("102005009401", "NKulumashiba East Secondary School-01", 941),
                createActualPollingStation("102005009501", "Mwaiseni Primary School-01", 578),
              ]
            },
            {
              id: "copperbelt-luanshya-roan-nkulumashiba",
              name: "NKULUMASHIBA",
              councillorCandidates: generateCouncillorCandidates("copperbelt-luanshya-roan-nkulumashiba"),
              pollingStations: [
                createActualPollingStation("102005009601", "NKulumashiba Secondary School-01", 526),
                createActualPollingStation("102005009602", "NKulumashiba Secondary School-02", 526),
                createActualPollingStation("102005009701", "Nkambo Primary School-01", 797),
              ]
            },
            {
              id: "copperbelt-luanshya-roan-mpatamatu",
              name: "MPATAMATU",
              councillorCandidates: generateCouncillorCandidates("copperbelt-luanshya-roan-mpatamatu"),
              pollingStations: [
                createActualPollingStation("102005009801", "Kabulangeti Community Centre-01", 868),
                createActualPollingStation("102005009901", "Kansumbi Primary School-01", 556),
                createActualPollingStation("102005009902", "Kansumbi Primary School-02", 555),
              ]
            },
            {
              id: "copperbelt-luanshya-roan-milyashi",
              name: "MILYASHI",
              councillorCandidates: generateCouncillorCandidates("copperbelt-luanshya-roan-milyashi"),
              pollingStations: [
                createActualPollingStation("102005010001", "Sports Complex-01", 614),
                createActualPollingStation("102005010101", "Section 25 Clinic-01", 782),
                createActualPollingStation("102005010102", "Section 25 Clinic-02", 782),
              ]
            },
            {
              id: "copperbelt-luanshya-roan-ngebe",
              name: "NGEBE",
              councillorCandidates: generateCouncillorCandidates("copperbelt-luanshya-roan-ngebe"),
              pollingStations: [
                createActualPollingStation("102005010201", "Kalulu Primary School-01", 977),
                createActualPollingStation("102005010202", "Kalulu Primary School-02", 976),
                createActualPollingStation("102005010301", "CMML Church-01", 425),
              ]
            },
            {
              id: "copperbelt-luanshya-roan-kansengu",
              name: "KANSENGU",
              councillorCandidates: generateCouncillorCandidates("copperbelt-luanshya-roan-kansengu"),
              pollingStations: [
                createActualPollingStation("102005010401", "Milyashi Community Centre-01", 765),
                createActualPollingStation("102005010402", "Milyashi Community Centre-02", 764),
                createActualPollingStation("102005010501", "Mpatamatu first Aid-01", 765),
              ]
            },
            {
              id: "copperbelt-luanshya-roan-buyantanshi",
              name: "BUYANTANSHI",
              councillorCandidates: generateCouncillorCandidates("copperbelt-luanshya-roan-buyantanshi"),
              pollingStations: [
                createActualPollingStation("102005010601", "Kansengu Community Centre-01", 747),
                createActualPollingStation("102005010701", "Mpatamatu Primary School-01", 513),
                createActualPollingStation("102005010702", "Mpatamatu Primary School-02", 512),
              ]
            },
          ]
        },
      ]
    },
    {
      id: "lufwanyama",
      name: "LUFWANYAMA",
      mayoralCandidates: generateMayoralCandidates("lufwanyama"),
      constituencies: [
        {
          id: "copperbelt-lufwanyama-lufwanyama-west",
          name: "LUFWANYAMA WEST",
          mpCandidates: generateMPCandidates("copperbelt-lufwanyama-lufwanyama-west"),
          wards: [
            {
              id: "copperbelt-lufwanyama-lufwanyama-west-kansanta",
              name: "KANSANTA",
              councillorCandidates: generateCouncillorCandidates("copperbelt-lufwanyama-lufwanyama-west-kansanta"),
              pollingStations: [
                createActualPollingStation("102006000101", "Mutenda Primary School-01", 207),
                createActualPollingStation("102006000201", "Kanshimbi (Mafulo Tent)-01", 371),
                createActualPollingStation("102006000301", "Kansanta Primary School-01", 842),
              ]
            },
            {
              id: "copperbelt-lufwanyama-lufwanyama-west-milopa",
              name: "MILOPA",
              councillorCandidates: generateCouncillorCandidates("copperbelt-lufwanyama-lufwanyama-west-milopa"),
              pollingStations: [
                createActualPollingStation("102006000401", "Milulu Primary School-01", 531),
                createActualPollingStation("102006000501", "Milopa Secondary School-01", 925),
                createActualPollingStation("102006000601", "Mubende Primary School-01", 262),
                createActualPollingStation("102006000701", "Mibila Community School-01", 155),
              ]
            },
            {
              id: "copperbelt-lufwanyama-lufwanyama-west-kansoka",
              name: "KANSOKA",
              councillorCandidates: generateCouncillorCandidates("copperbelt-lufwanyama-lufwanyama-west-kansoka"),
              pollingStations: [
                createActualPollingStation("102006000801", "Ndashe Primary School-01", 358),
                createActualPollingStation("102006000901", "Kansoka Primary School-01", 859),
                createActualPollingStation("102006001001", "Nkulumashiba School-01", 246),
              ]
            },
            {
              id: "copperbelt-lufwanyama-lufwanyama-west-chinemu",
              name: "CHINEMU",
              councillorCandidates: generateCouncillorCandidates("copperbelt-lufwanyama-lufwanyama-west-chinemu"),
              pollingStations: [
                createActualPollingStation("102006001101", "Mibenshi Primary School-01", 352),
                createActualPollingStation("102006001201", "Chinemu Primary School-01", 697),
                createActualPollingStation("102006001301", "Lufwanyama Primary School-01", 535),
                createActualPollingStation("102006001401", "Fumbwe Primary School-01", 718),
              ]
            },
            {
              id: "copperbelt-lufwanyama-lufwanyama-west-katembula",
              name: "KATEMBULA",
              councillorCandidates: generateCouncillorCandidates("copperbelt-lufwanyama-lufwanyama-west-katembula"),
              pollingStations: [
                createActualPollingStation("102006001501", "Mpopo Primary School-01", 551),
                createActualPollingStation("102006001502", "Mpopo Primary School-02", 551),
                createActualPollingStation("102006001601", "Shimukunami Primary School-01", 831),
                createActualPollingStation("102006001602", "Shimukunami Primary School-02", 831),
                createActualPollingStation("102006001603", "Shimukunami Primary School-03", 830),
                createActualPollingStation("102006001701", "Kabamba Community School-01", 599),
              ]
            },
            {
              id: "copperbelt-lufwanyama-lufwanyama-west-lufwanyama",
              name: "LUFWANYAMA",
              councillorCandidates: generateCouncillorCandidates("copperbelt-lufwanyama-lufwanyama-west-lufwanyama"),
              pollingStations: [
                createActualPollingStation("102006006301", "Puma Primary School-01", 346),
                createActualPollingStation("102006006401", "Bimbe Primary School-01", 214),
                createActualPollingStation("102006006501", "Kapilamikwa Primary School-01", 873),
                createActualPollingStation("102006006601", "Funda Primary School-01", 701),
              ]
            },
            {
              id: "copperbelt-lufwanyama-lufwanyama-west-mpindi",
              name: "MPINDI",
              councillorCandidates: generateCouncillorCandidates("copperbelt-lufwanyama-lufwanyama-west-mpindi"),
              pollingStations: [
                createActualPollingStation("102006006701", "Fungulwe Primary School-01", 972),
                createActualPollingStation("102006006801", "Muluba Community School-01", 190),
                createActualPollingStation("102006006901", "Chitaba Community School-01", 435),
              ]
            },
            {
              id: "copperbelt-lufwanyama-lufwanyama-west-kabundya",
              name: "KABUNDYA",
              councillorCandidates: generateCouncillorCandidates("copperbelt-lufwanyama-lufwanyama-west-kabundya"),
              pollingStations: [
                createActualPollingStation("102006007001", "St Mary's Secondary School-01", 719),
                createActualPollingStation("102006007002", "St Mary's Secondary School-02", 718),
                createActualPollingStation("102006007101", "Kantende Primary School-01", 530),
                createActualPollingStation("102006007201", "Mafuta B Primary School-01", 509),
                createActualPollingStation("102006007301", "Lyamaoma Community School-01", 255),
              ]
            },
            {
              id: "copperbelt-lufwanyama-lufwanyama-west-luswishi",
              name: "LUSWISHI",
              councillorCandidates: generateCouncillorCandidates("copperbelt-lufwanyama-lufwanyama-west-luswishi"),
              pollingStations: [
                createActualPollingStation("102006007401", "Nsambantenga Primary School-01", 142),
                createActualPollingStation("102006007501", "Shibuchinga Primary School-01", 779),
                createActualPollingStation("102006007502", "Shibuchinga Primary School-02", 779),
                createActualPollingStation("102006007601", "Nchakwa Primary School-01", 704),
                createActualPollingStation("102006007602", "Nchakwa Primary School-02", 703),
                createActualPollingStation("102006007603", "Nchakwa Primary School-03", 703),
              ]
            },
            {
              id: "copperbelt-lufwanyama-lufwanyama-west-mushingashi",
              name: "MUSHINGASHI",
              councillorCandidates: generateCouncillorCandidates("copperbelt-lufwanyama-lufwanyama-west-mushingashi"),
              pollingStations: [
                createActualPollingStation("102006007701", "Twashuka Community School-01", 232),
                createActualPollingStation("102006007801", "Kambilombilo Primary School-01", 681),
                createActualPollingStation("102006007901", "Mushingashi Primary School-01", 791),
                createActualPollingStation("102006008001", "Luanshimba Community School-01", 300),
                createActualPollingStation("102006008101", "Kasakalabwe Health Post-01", 392),
              ]
            },
          ]
        },
        {
          id: "copperbelt-lufwanyama-lufwanyama-east",
          name: "LUFWANYAMA EAST",
          mpCandidates: generateMPCandidates("copperbelt-lufwanyama-lufwanyama-east"),
          wards: [
            {
              id: "copperbelt-lufwanyama-lufwanyama-east-mitwe",
              name: "MITWE",
              councillorCandidates: generateCouncillorCandidates("copperbelt-lufwanyama-lufwanyama-east-mitwe"),
              pollingStations: [
                createActualPollingStation("102006001801", "Kalima Primary School-01", 358),
                createActualPollingStation("102006001901", "Mukutuma Primary School-01", 749),
                createActualPollingStation("102006002001", "Tunga Primary School-01", 172),
                createActualPollingStation("102006002101", "Chisanina Community School-01", 301),
              ]
            },
            {
              id: "copperbelt-lufwanyama-lufwanyama-east-kafubu",
              name: "KAFUBU",
              councillorCandidates: generateCouncillorCandidates("copperbelt-lufwanyama-lufwanyama-east-kafubu"),
              pollingStations: [
                createActualPollingStation("102006002201", "Kafubu West Primary School-01", 370),
                createActualPollingStation("102006002301", "Mibenge Farmers Training College (F.T.C)-01", 185),
                createActualPollingStation("102006002401", "Chilumba Primary School-01", 709),
                createActualPollingStation("102006002501", "Lumanto Primary School-01", 726),
              ]
            },
            {
              id: "copperbelt-lufwanyama-lufwanyama-east-chibanga",
              name: "CHIBANGA",
              councillorCandidates: generateCouncillorCandidates("copperbelt-lufwanyama-lufwanyama-east-chibanga"),
              pollingStations: [
                createActualPollingStation("102006002601", "Kakunko Primary School-01", 377),
                createActualPollingStation("102006002701", "Kakonge Primary School-01", 244),
                createActualPollingStation("102006002801", "Chimoto Primary School-01", 550),
                createActualPollingStation("102006002901", "Mikuta Primary School-01", 227),
                createActualPollingStation("102006003001", "St. Joseph Primary School-01", 787),
                createActualPollingStation("102006003002", "St. Joseph Primary School-02", 787),
                createActualPollingStation("102006003101", "Chibanga Primary School-01", 333),
                createActualPollingStation("102006003201", "Lwamisamba Primary School-01", 386),
                createActualPollingStation("102006003301", "Chapula Primary School-01", 662),
              ]
            },
            {
              id: "copperbelt-lufwanyama-lufwanyama-east-sokontwe",
              name: "SOKONTWE",
              councillorCandidates: generateCouncillorCandidates("copperbelt-lufwanyama-lufwanyama-east-sokontwe"),
              pollingStations: [
                createActualPollingStation("102006003401", "Mulemu Secondary School-01", 434),
                createActualPollingStation("102006003501", "Mingeli Living Water Church-01", 513),
                createActualPollingStation("102006003601", "Nkana Primary School-01", 991),
                createActualPollingStation("102006003602", "Nkana Primary School-02", 990),
                createActualPollingStation("102006003603", "Nkana Primary School-03", 990),
                createActualPollingStation("102006003701", "Kamuchanga Primary School-01", 357),
              ]
            },
            {
              id: "copperbelt-lufwanyama-lufwanyama-east-bulaya",
              name: "BULAYA",
              councillorCandidates: generateCouncillorCandidates("copperbelt-lufwanyama-lufwanyama-east-bulaya"),
              pollingStations: [
                createActualPollingStation("102006003801", "Bulaya Primary School-01", 621),
                createActualPollingStation("102006003901", "Misako Community School-01", 301),
                createActualPollingStation("102006004001", "Joseph Mutupa Community School-01", 436),
              ]
            },
            {
              id: "copperbelt-lufwanyama-lufwanyama-east-chantete",
              name: "CHANTETE",
              councillorCandidates: generateCouncillorCandidates("copperbelt-lufwanyama-lufwanyama-east-chantete"),
              pollingStations: [
                createActualPollingStation("102006004101", "Kandole Community School-01", 839),
                createActualPollingStation("102006004201", "Chantete Primary School-01", 562),
                createActualPollingStation("102006004301", "Kapila Primary School-01", 266),
                createActualPollingStation("102006004401", "Kansato Community School-01", 179),
              ]
            },
            {
              id: "copperbelt-lufwanyama-lufwanyama-east-mibenge",
              name: "MIBENGE",
              councillorCandidates: generateCouncillorCandidates("copperbelt-lufwanyama-lufwanyama-east-mibenge"),
              pollingStations: [
                createActualPollingStation("102006004501", "Mibenge Secondary School-01", 910),
                createActualPollingStation("102006004601", "Masasa Primary School-01", 464),
                createActualPollingStation("102006004701", "Fipundu Community School-01", 173),
                createActualPollingStation("102006004801", "Kapimbe Primary School-01", 303),
                createActualPollingStation("102006004901", "Kamupundu Health Post-01", 428),
              ]
            },
            {
              id: "copperbelt-lufwanyama-lufwanyama-east-mukumbo",
              name: "MUKUMBO",
              councillorCandidates: generateCouncillorCandidates("copperbelt-lufwanyama-lufwanyama-east-mukumbo"),
              pollingStations: [
                createActualPollingStation("102006005001", "Kamakanga Community School-01", 686),
                createActualPollingStation("102006005002", "Kamakanga Community School-02", 686),
                createActualPollingStation("102006005101", "Mukumbo Primary School-01", 979),
                createActualPollingStation("102006005201", "Chifumpa Health Post-01", 305),
                createActualPollingStation("102006005301", "Kafyanga Community School-01", 248),
                createActualPollingStation("102006005401", "Kapata Community School-01", 460),
              ]
            },
            {
              id: "copperbelt-lufwanyama-lufwanyama-east-mwelushi",
              name: "MWELUSHI",
              councillorCandidates: generateCouncillorCandidates("copperbelt-lufwanyama-lufwanyama-east-mwelushi"),
              pollingStations: [
                createActualPollingStation("102006005501", "Mukeleshi Community School-01", 185),
                createActualPollingStation("102006005601", "Kankomo Primary School-01", 305),
                createActualPollingStation("102006005701", "Lumpuma Primary School-01", 643),
                createActualPollingStation("102006005702", "Lumpuma Primary School-02", 643),
                createActualPollingStation("102006005801", "Mumfunsha Community School-01", 246),
                createActualPollingStation("102006005901", "Chikabuke Community School-01", 259),
              ]
            },
            {
              id: "copperbelt-lufwanyama-lufwanyama-east-lwabufubo",
              name: "LWABUFUBO",
              councillorCandidates: generateCouncillorCandidates("copperbelt-lufwanyama-lufwanyama-east-lwabufubo"),
              pollingStations: [
                createActualPollingStation("102006006001", "Chikulimba Community School-01", 158),
                createActualPollingStation("102006006101", "Musakashi Community School-01", 368),
                createActualPollingStation("102006006201", "Chamoni Community School-01", 495),
              ]
            },
          ]
        },
      ]
    },
    {
      id: "masaiti",
      name: "MASAITI",
      mayoralCandidates: generateMayoralCandidates("masaiti"),
      constituencies: [
        {
          id: "copperbelt-masaiti-kafulafuta",
          name: "KAFULAFUTA",
          mpCandidates: generateMPCandidates("copperbelt-masaiti-kafulafuta"),
          wards: [
            {
              id: "copperbelt-masaiti-kafulafuta-mapalo",
              name: "MAPALO",
              councillorCandidates: generateCouncillorCandidates("copperbelt-masaiti-kafulafuta-mapalo"),
              pollingStations: [
                createActualPollingStation("102007000101", "Chikumbi Primary School-01", 717),
                createActualPollingStation("102007000102", "Chikumbi Primary School-02", 717),
                createActualPollingStation("102007000201", "Kanyanje Baptist Church-01", 565),
                createActualPollingStation("102007000202", "Kanyanje Baptist Church-02", 564),
                createActualPollingStation("102007000301", "Mapalo Primary School-01", 938),
                createActualPollingStation("102007000302", "Mapalo Primary School-02", 937),
                createActualPollingStation("102007000303", "Mapalo Primary School-03", 937),
                createActualPollingStation("102007000304", "Mapalo Primary School-04", 937),
                createActualPollingStation("102007000305", "Mapalo Primary School-05", 937),
                createActualPollingStation("102007000306", "Mapalo Primary School-06", 937),
              ]
            },
            {
              id: "copperbelt-masaiti-kafulafuta-mwatishi",
              name: "MWATISHI",
              councillorCandidates: generateCouncillorCandidates("copperbelt-masaiti-kafulafuta-mwatishi"),
              pollingStations: [
                createActualPollingStation("102007000401", "Lubendo Primary School-01", 761),
                createActualPollingStation("102007000402", "Lubendo Primary School-02", 760),
                createActualPollingStation("102007000501", "Chilengwa Baptist-01", 523),
                createActualPollingStation("102007000601", "Muwaya Primary School-01", 942),
              ]
            },
            {
              id: "copperbelt-masaiti-kafulafuta-majaliwa",
              name: "MAJALIWA",
              councillorCandidates: generateCouncillorCandidates("copperbelt-masaiti-kafulafuta-majaliwa"),
              pollingStations: [
                createActualPollingStation("102007000701", "Chiwala Primary School-01", 759),
                createActualPollingStation("102007000702", "Chiwala Primary School-02", 759),
                createActualPollingStation("102007000703", "Chiwala Primary School-03", 758),
                createActualPollingStation("102007000801", "Chilengwa Church of Christ-01", 361),
                createActualPollingStation("102007000901", "Lupiya Primary School-01", 603),
                createActualPollingStation("102007000902", "Lupiya Primary School-02", 603),
                createActualPollingStation("102007001001", "Chimanshi Primary School-01", 397),
              ]
            },
            {
              id: "copperbelt-masaiti-kafulafuta-chondwe",
              name: "CHONDWE",
              councillorCandidates: generateCouncillorCandidates("copperbelt-masaiti-kafulafuta-chondwe"),
              pollingStations: [
                createActualPollingStation("102007001101", "Kambowa Combined School-01", 512),
                createActualPollingStation("102007001102", "Kambowa Combined School-02", 511),
                createActualPollingStation("102007001201", "Ifulumo Primary School-01", 688),
                createActualPollingStation("102007001301", "Kansamfu Catholic Church-01", 161),
                createActualPollingStation("102007001401", "Bangwe Primary School-01", 682),
                createActualPollingStation("102007001501", "Mapala Community School-01", 438),
                createActualPollingStation("102007001601", "Chondwe Primary School-01", 539),
                createActualPollingStation("102007001701", "Washa Community School-01", 320),
                createActualPollingStation("102007001801", "Munkulungwe Primary School-01", 621),
                createActualPollingStation("102007001802", "Munkulungwe Primary School-02", 621),
                createActualPollingStation("102007052201", "Chondwe Correctional Farm-01", 145),
              ]
            },
            {
              id: "copperbelt-masaiti-kafulafuta-mutaba",
              name: "MUTABA",
              councillorCandidates: generateCouncillorCandidates("copperbelt-masaiti-kafulafuta-mutaba"),
              pollingStations: [
                createActualPollingStation("102007001901", "Fipembele UCZ-01", 396),
                createActualPollingStation("102007002001", "Mutaba Secondary School-01", 640),
                createActualPollingStation("102007002002", "Mutaba Secondary School-02", 639),
                createActualPollingStation("102007002101", "Muteteshi Primary School-01", 500),
                createActualPollingStation("102007002201", "Kaleya Catholic Church-01", 355),
                createActualPollingStation("102007002401", "Ngosa Baptist Church-01", 284),
              ]
            },
            {
              id: "copperbelt-masaiti-kafulafuta-katonte",
              name: "KATONTE",
              councillorCandidates: generateCouncillorCandidates("copperbelt-masaiti-kafulafuta-katonte"),
              pollingStations: [
                createActualPollingStation("102007002301", "Liteta Baptist Church-01", 192),
                createActualPollingStation("102007002501", "Mpulabushi Primary School-01", 315),
                createActualPollingStation("102007002601", "Chief Chiwala's Camp-01", 137),
                createActualPollingStation("102007002701", "Chembo Primary School-01", 402),
              ]
            },
          ]
        },
        {
          id: "copperbelt-masaiti-masaiti",
          name: "MASAITI",
          mpCandidates: generateMPCandidates("copperbelt-masaiti-masaiti"),
          wards: [
            {
              id: "copperbelt-masaiti-masaiti-kamifungo",
              name: "KAMIFUNGO",
              councillorCandidates: generateCouncillorCandidates("copperbelt-masaiti-masaiti-kamifungo"),
              pollingStations: [
                createActualPollingStation("102007004101", "Kamifungo Primary School-01", 569),
                createActualPollingStation("102007004201", "Nkulumashiba SDA Church-01", 246),
                createActualPollingStation("102007004301", "Kalulu Primary School-01", 466),
              ]
            },
            {
              id: "copperbelt-masaiti-masaiti-miputu",
              name: "MIPUTU",
              councillorCandidates: generateCouncillorCandidates("copperbelt-masaiti-masaiti-miputu"),
              pollingStations: [
                createActualPollingStation("102007004401", "Miputu Primary School-01", 691),
                createActualPollingStation("102007004501", "Kankonshi Primary School-01", 388),
                createActualPollingStation("102007004601", "Malemba Community School-01", 379),
                createActualPollingStation("102007004701", "Malemba Baptist Church-01", 231),
              ]
            },
            {
              id: "copperbelt-masaiti-masaiti-chilulu",
              name: "CHILULU",
              councillorCandidates: generateCouncillorCandidates("copperbelt-masaiti-masaiti-chilulu"),
              pollingStations: [
                createActualPollingStation("102007004801", "Kapandwa Batptist Church-01", 147),
                createActualPollingStation("102007004901", "Kafulafuta Primary School-01", 235),
                createActualPollingStation("102007005001", "Council Chamber-01", 696),
                createActualPollingStation("102007005002", "Council Chamber-02", 695),
                createActualPollingStation("102007005101", "Pyutu Primary School-01", 208),
                createActualPollingStation("102007005201", "Fipashi Primary School-01", 361),
                createActualPollingStation("102007005301", "Kasabwa Baptist Church-01", 181),
              ]
            },
            {
              id: "copperbelt-masaiti-masaiti-shimibanga",
              name: "SHIMIBANGA",
              councillorCandidates: generateCouncillorCandidates("copperbelt-masaiti-masaiti-shimibanga"),
              pollingStations: [
                createActualPollingStation("102007005401", "Mulofwa Primary School-01", 421),
                createActualPollingStation("102007005501", "Munyemesha Primary School-01", 203),
                createActualPollingStation("102007005601", "Matete Primary School-01", 351),
                createActualPollingStation("102007005701", "Boaz Baptist Church-01", 541),
                createActualPollingStation("102007005801", "Land of Foundation Community School-01", 328),
                createActualPollingStation("102007005901", "Chamunda Combined School-01", 631),
                createActualPollingStation("102007005902", "Chamunda Combined School-02", 631),
              ]
            },
            {
              id: "copperbelt-masaiti-masaiti-katuba",
              name: "KATUBA",
              councillorCandidates: generateCouncillorCandidates("copperbelt-masaiti-masaiti-katuba"),
              pollingStations: [
                createActualPollingStation("102007006001", "Saka Primary School-01", 473),
                createActualPollingStation("102007006101", "Kangwena Community School-01", 365),
                createActualPollingStation("102007006201", "Moni Baptist Church-01", 256),
                createActualPollingStation("102007006301", "Katuba Combined School-01", 866),
                createActualPollingStation("102007006401", "Chankalamu Baptist Church-01", 133),
                createActualPollingStation("102007006501", "Lisomona Secondary School-01", 631),
                createActualPollingStation("102007006601", "Kansato Community Hall-01", 283),
              ]
            },
            {
              id: "copperbelt-masaiti-masaiti-lumano",
              name: "LUMANO",
              councillorCandidates: generateCouncillorCandidates("copperbelt-masaiti-masaiti-lumano"),
              pollingStations: [
                createActualPollingStation("102007006701", "Chumameno Community School-01", 398),
                createActualPollingStation("102007006801", "Kamafwasa Baptist Church-01", 393),
                createActualPollingStation("102007006901", "Lumano Combined School-01", 610),
                createActualPollingStation("102007006902", "Lumano Combined School-02", 609),
                createActualPollingStation("102007007001", "Makubi Clinic-01", 333),
                createActualPollingStation("102007007101", "Munama Baptist Church-01", 304),
                createActualPollingStation("102007007201", "Fibunde Community School-01", 302),
                createActualPollingStation("102007007301", "Mushili Combined School-01", 911),
                createActualPollingStation("102007007401", "Welcome-01", 479),
              ]
            },
            {
              id: "copperbelt-masaiti-masaiti-masangano",
              name: "MASANGANO",
              councillorCandidates: generateCouncillorCandidates("copperbelt-masaiti-masaiti-masangano"),
              pollingStations: [
                createActualPollingStation("102007007501", "St Marksimilian Catholic Church-01", 293),
                createActualPollingStation("102007007601", "Fiwale Combined School-01", 625),
                createActualPollingStation("102007007701", "Chella Community School-01", 223),
                createActualPollingStation("102007007801", "Mupapa SDA Academy-01", 358),
                createActualPollingStation("102007007901", "Kabwata Combined School-01", 906),
                createActualPollingStation("102007008001", "Misapa Primary School-01", 856),
                createActualPollingStation("102007008101", "Fiwale St. Pauls Catholic Church-01", 626),
              ]
            },
          ]
        },
        {
          id: "copperbelt-masaiti-kalalangabo",
          name: "KALALANGABO",
          mpCandidates: generateMPCandidates("copperbelt-masaiti-kalalangabo"),
          wards: [
            {
              id: "copperbelt-masaiti-kalalangabo-ishitwe",
              name: "ISHITWE",
              councillorCandidates: generateCouncillorCandidates("copperbelt-masaiti-kalalangabo-ishitwe"),
              pollingStations: [
                createActualPollingStation("102007002801", "Mumana Primary School-01", 346),
                createActualPollingStation("102007002901", "Nkambo Primary School-01", 291),
                createActualPollingStation("102007003001", "Silangwa Secondary School-01", 740),
                createActualPollingStation("102007003101", "Mobe Under Five Clinic-01", 346),
                createActualPollingStation("102007003201", "Levy Partrick Mwanawasa-01", 387),
                createActualPollingStation("102007003301", "Jerusalem Baptist Church-01", 304),
                createActualPollingStation("102007003401", "Katanino Community School-01", 233),
              ]
            },
            {
              id: "copperbelt-masaiti-kalalangabo-miengwe",
              name: "MIENGWE",
              councillorCandidates: generateCouncillorCandidates("copperbelt-masaiti-kalalangabo-miengwe"),
              pollingStations: [
                createActualPollingStation("102007003501", "Mbotwa Primary School-01", 361),
                createActualPollingStation("102007003601", "Mbotwa Community School-01", 216),
                createActualPollingStation("102007003701", "Matipa Primary School-01", 905),
                createActualPollingStation("102007003801", "Mwambachimo Primary School-01", 324),
                createActualPollingStation("102007003901", "Miengwe Primary School-01", 599),
                createActualPollingStation("102007004001", "Kalalangabo Primary School-01", 354),
              ]
            },
            {
              id: "copperbelt-masaiti-kalalangabo-mishikishi",
              name: "MISHIKISHI",
              councillorCandidates: generateCouncillorCandidates("copperbelt-masaiti-kalalangabo-mishikishi"),
              pollingStations: [
                createActualPollingStation("102007008201", "Chinuankulo Primary School-01", 347),
                createActualPollingStation("102007008301", "Chankute Primary School-01", 528),
                createActualPollingStation("102007008302", "Chankute Primary School-02", 528),
                createActualPollingStation("102007008401", "Moni Baptist Church-01", 249),
                createActualPollingStation("102007008501", "Mishikishi Secondary School-01", 783),
                createActualPollingStation("102007008502", "Mishikishi Secondary School-02", 782),
                createActualPollingStation("102007008601", "Kaunga Primary School-01", 473),
                createActualPollingStation("102007008701", "Mpendeni Community School-01", 406),
                createActualPollingStation("102007008801", "Mirraim Mokola Primary School-01", 434),
              ]
            },
            {
              id: "copperbelt-masaiti-kalalangabo-chinondo",
              name: "CHINONDO",
              councillorCandidates: generateCouncillorCandidates("copperbelt-masaiti-kalalangabo-chinondo"),
              pollingStations: [
                createActualPollingStation("102007008901", "Kansefu Community School-01", 184),
                createActualPollingStation("102007009001", "Sandya Baptist Church-01", 153),
                createActualPollingStation("102007009101", "Chiweme Primary School-01", 788),
                createActualPollingStation("102007009201", "Lwampensa Primary School-01", 282),
                createActualPollingStation("102007009301", "Mipundu Primary School-01", 480),
                createActualPollingStation("102007009401", "Katisha Community School-01", 256),
                createActualPollingStation("102007009501", "Chinondo Primary School-01", 691),
              ]
            },
            {
              id: "copperbelt-masaiti-kalalangabo-kashitu",
              name: "KASHITU",
              councillorCandidates: generateCouncillorCandidates("copperbelt-masaiti-kalalangabo-kashitu"),
              pollingStations: [
                createActualPollingStation("102007009601", "Chilese Primary School-01", 792),
                createActualPollingStation("102007009701", "Kashitu Primary School-01", 903),
                createActualPollingStation("102007009801", "Fifungo Primary School-01", 819),
                createActualPollingStation("102007009901", "Kebamba UCZ Church-01", 8),
                createActualPollingStation("102007010001", "Levy Mwanawasa Primary School-01", 936),
                createActualPollingStation("102007010101", "Grace Ministries-01", 359),
                createActualPollingStation("102007010201", "Kalweo Secondary School-01", 712),
                createActualPollingStation("102007010202", "Kalweo Secondary School-02", 711),
                createActualPollingStation("102007010401", "Chola Community School-01", 466),
              ]
            },
            {
              id: "copperbelt-masaiti-kalalangabo-luansobe",
              name: "LUANSOBE",
              councillorCandidates: generateCouncillorCandidates("copperbelt-masaiti-kalalangabo-luansobe"),
              pollingStations: [
                createActualPollingStation("102007010501", "Jerusalem Church-01", 203),
                createActualPollingStation("102007010601", "Lukanga Community School-01", 394),
                createActualPollingStation("102007010701", "Kamabaya Secondary School-01", 701),
                createActualPollingStation("102007010801", "Kwesha Primary School-01", 347),
                createActualPollingStation("102007010901", "Ngosa Community School-01", 261),
                createActualPollingStation("102007011001", "Makango Community School-01", 586),
                createActualPollingStation("102007011101", "Kandulwe Community School-01", 455),
                createActualPollingStation("102007011201", "Luansobe Secondary School-01", 539),
                createActualPollingStation("102007011202", "Luansobe Secondary School-02", 539),
                createActualPollingStation("102007011301", "Michelo Community School-01", 159),
              ]
            },
          ]
        },
      ]
    },
    {
      id: "mpongwe",
      name: "MPONGWE",
      mayoralCandidates: generateMayoralCandidates("mpongwe"),
      constituencies: [
        {
          id: "copperbelt-mpongwe-mpongwe-west",
          name: "MPONGWE WEST",
          mpCandidates: generateMPCandidates("copperbelt-mpongwe-mpongwe-west"),
          wards: [
            {
              id: "copperbelt-mpongwe-mpongwe-west-luswishi",
              name: "LUSWISHI",
              councillorCandidates: generateCouncillorCandidates("copperbelt-mpongwe-mpongwe-west-luswishi"),
              pollingStations: [
                createActualPollingStation("102008000101", "Kalabi Community School-01", 174),
                createActualPollingStation("102008000201", "Mayewe (Temporal Shelter)-01", 163),
                createActualPollingStation("102008000301", "Luswishi Primary School-01", 548),
              ]
            },
            {
              id: "copperbelt-mpongwe-mpongwe-west-kasonga",
              name: "KASONGA",
              councillorCandidates: generateCouncillorCandidates("copperbelt-mpongwe-mpongwe-west-kasonga"),
              pollingStations: [
                createActualPollingStation("102008000401", "Mushiwe Primary School-01", 309),
                createActualPollingStation("102008000501", "Kapili Primary School-01", 257),
                createActualPollingStation("102008000601", "Mitumba Chiefs Camp-01", 340),
                createActualPollingStation("102008000701", "Machiya Secondary School-01", 889),
                createActualPollingStation("102008000801", "Katemene Kwiyulu Community School-01", 401),
              ]
            },
            {
              id: "copperbelt-mpongwe-mpongwe-west-munkumpu",
              name: "MUNKUMPU",
              councillorCandidates: generateCouncillorCandidates("copperbelt-mpongwe-mpongwe-west-munkumpu"),
              pollingStations: [
                createActualPollingStation("102008000901", "Tsetse Fly Control Centre-01", 240),
                createActualPollingStation("102008001001", "Kampemba Club-01", 192),
                createActualPollingStation("102008001101", "Chitabale Primary School-01", 447),
                createActualPollingStation("102008001201", "Munkumpu Secondary School-01", 799),
                createActualPollingStation("102008001202", "Munkumpu Secondary School-02", 798),
                createActualPollingStation("102008001301", "Mulela Primary School-01", 526),
                createActualPollingStation("102008001302", "Mulela Primary School-02", 525),
              ]
            },
            {
              id: "copperbelt-mpongwe-mpongwe-west-ipumbu",
              name: "IPUMBU",
              councillorCandidates: generateCouncillorCandidates("copperbelt-mpongwe-mpongwe-west-ipumbu"),
              pollingStations: [
                createActualPollingStation("102008001401", "Kanyuma Private School-01", 575),
                createActualPollingStation("102008001501", "Ipumbu Primary School-01", 517),
                createActualPollingStation("102008001502", "Ipumbu Primary School-02", 516),
                createActualPollingStation("102008001601", "Lukangala Primary School-01", 466),
                createActualPollingStation("102008001701", "Kalukwiso Community School-01", 586),
                createActualPollingStation("102008001702", "Kalukwiso Community School-02", 585),
              ]
            },
            {
              id: "copperbelt-mpongwe-mpongwe-west-kashiba",
              name: "KASHIBA",
              councillorCandidates: generateCouncillorCandidates("copperbelt-mpongwe-mpongwe-west-kashiba"),
              pollingStations: [
                createActualPollingStation("102008001801", "Kalamba Community School-01", 333),
                createActualPollingStation("102008001901", "St. Anthony Primary School-01", 560),
                createActualPollingStation("102008001902", "St. Anthony Primary School-02", 560),
                createActualPollingStation("102008002001", "Bilima Primary School-01", 451),
                createActualPollingStation("102008002101", "Chinampanga Primary School-01", 488),
                createActualPollingStation("102008002201", "Mfulabunga Secondary School-01", 821),
                createActualPollingStation("102008002202", "Mfulabunga Secondary School-02", 820),
                createActualPollingStation("102008002203", "Mfulabunga Secondary School-03", 820),
                createActualPollingStation("102008002301", "Minsongwe Primary School-01", 535),
              ]
            },
            {
              id: "copperbelt-mpongwe-mpongwe-west-mpongwe-central",
              name: "MPONGWE CENTRAL",
              councillorCandidates: generateCouncillorCandidates("copperbelt-mpongwe-mpongwe-west-mpongwe-central"),
              pollingStations: [
                createActualPollingStation("102008002401", "Musangashi Primary School-01", 612),
                createActualPollingStation("102008002501", "Lesa Nkushe Primary School-01", 388),
                createActualPollingStation("102008002601", "Shingwa Primary School-01", 518),
                createActualPollingStation("102008002602", "Shingwa Primary School-02", 518),
                createActualPollingStation("102008002701", "Kabumba Primary School-01", 662),
                createActualPollingStation("102008002801", "Bwembelelo Primary School-01", 978),
                createActualPollingStation("102008002901", "Chinwa Primary School-01", 671),
                createActualPollingStation("102008003001", "Farmers Training Centre-01", 889),
                createActualPollingStation("102008003002", "Farmers Training Centre-02", 889),
                createActualPollingStation("102008003003", "Farmers Training Centre-03", 889),
                createActualPollingStation("102008003004", "Farmers Training Centre-04", 889),
                createActualPollingStation("102008003101", "Mpongwe Day Secondary School-01", 836),
                createActualPollingStation("102008003102", "Mpongwe Day Secondary School-02", 836),
                createActualPollingStation("102008003103", "Mpongwe Day Secondary School-03", 836),
                createActualPollingStation("102008003104", "Mpongwe Day Secondary School-04", 835),
                createActualPollingStation("102008003105", "Mpongwe Day Secondary School-05", 835),
                createActualPollingStation("102008003201", "Chipese Primary School-01", 974),
                createActualPollingStation("102008003202", "Chipese Primary School-02", 974),
              ]
            },
            {
              id: "copperbelt-mpongwe-mpongwe-west-nampamba",
              name: "NAMPAMBA",
              councillorCandidates: generateCouncillorCandidates("copperbelt-mpongwe-mpongwe-west-nampamba"),
              pollingStations: [
                createActualPollingStation("102008006601", "Chawama Primary School-01", 717),
                createActualPollingStation("102008006602", "Chawama Primary School-02", 716),
                createActualPollingStation("102008006701", "Chowa Primary School-01", 982),
              ]
            },
            {
              id: "copperbelt-mpongwe-mpongwe-west-musofu",
              name: "MUSOFU",
              councillorCandidates: generateCouncillorCandidates("copperbelt-mpongwe-mpongwe-west-musofu"),
              pollingStations: [
                createActualPollingStation("102008006801", "Mushipashi Primary School-01", 604),
                createActualPollingStation("102008006901", "Kasamba Community School-01", 323),
                createActualPollingStation("102008007001", "Mwinuna Secondary School-01", 528),
                createActualPollingStation("102008007002", "Mwinuna Secondary School-02", 527),
                createActualPollingStation("102008007101", "Kabampanga Primary School-01", 269),
              ]
            },
          ]
        },
        {
          id: "copperbelt-mpongwe-mpongwe-east",
          name: "MPONGWE EAST",
          mpCandidates: generateMPCandidates("copperbelt-mpongwe-mpongwe-east"),
          wards: [
            {
              id: "copperbelt-mpongwe-mpongwe-east-kanyenda",
              name: "KANYENDA",
              councillorCandidates: generateCouncillorCandidates("copperbelt-mpongwe-mpongwe-east-kanyenda"),
              pollingStations: [
                createActualPollingStation("102008003301", "Nkulumashiba Primary School-01", 293),
                createActualPollingStation("102008003401", "Kalunkumya Primary School-01", 300),
                createActualPollingStation("102008003501", "Nkumbu Primary School-01", 440),
                createActualPollingStation("102008003601", "Kanyenda Secondary School-01", 668),
                createActualPollingStation("102008003602", "Kanyenda Secondary School-02", 667),
                createActualPollingStation("102008003603", "Kanyenda Secondary School-03", 667),
                createActualPollingStation("102008003701", "Kaloko Community School-01", 356),
                createActualPollingStation("102008003801", "Chibuli Primary School-01", 845),
                createActualPollingStation("102008003901", "Buyantanshi Primary School-01", 451),
              ]
            },
            {
              id: "copperbelt-mpongwe-mpongwe-east-kasamba",
              name: "KASAMBA",
              councillorCandidates: generateCouncillorCandidates("copperbelt-mpongwe-mpongwe-east-kasamba"),
              pollingStations: [
                createActualPollingStation("102008004001", "Minkoyo Primary School-01", 379),
                createActualPollingStation("102008004101", "Mulilansolo Baptist Church-01", 175),
                createActualPollingStation("102008004201", "Kasamba Secondary School-01", 618),
                createActualPollingStation("102008004301", "Mikumbi Primary School-01", 660),
                createActualPollingStation("102008004401", "Milomfi Primary School-01", 506),
              ]
            },
            {
              id: "copperbelt-mpongwe-mpongwe-east-ibenga",
              name: "IBENGA",
              councillorCandidates: generateCouncillorCandidates("copperbelt-mpongwe-mpongwe-east-ibenga"),
              pollingStations: [
                createActualPollingStation("102008004501", "Chipala Baptist Church-01", 297),
                createActualPollingStation("102008004601", "Lyobeka Clinic-01", 510),
                createActualPollingStation("102008004602", "Lyobeka Clinic-02", 510),
                createActualPollingStation("102008004701", "St. Thresa's Secondary School-01", 859),
                createActualPollingStation("102008004702", "St. Thresa's Secondary School-02", 859),
                createActualPollingStation("102008004703", "St. Thresa's Secondary School-03", 858),
                createActualPollingStation("102008004704", "St. Thresa's Secondary School-04", 858),
                createActualPollingStation("102008004705", "St. Thresa's Secondary School-05", 858),
                createActualPollingStation("102008004801", "Mulilantambo Primary School-01", 760),
                createActualPollingStation("102008004901", "Kampelembe Primary School-01", 296),
                createActualPollingStation("102008005001", "Butikili Primary School-01", 547),
                createActualPollingStation("102008005101", "Mipini Community School-01", 242),
              ]
            },
            {
              id: "copperbelt-mpongwe-mpongwe-east-chisapa",
              name: "CHISAPA",
              councillorCandidates: generateCouncillorCandidates("copperbelt-mpongwe-mpongwe-east-chisapa"),
              pollingStations: [
                createActualPollingStation("102008005201", "Malembeka Primary School-01", 556),
                createActualPollingStation("102008005202", "Malembeka Primary School-02", 556),
                createActualPollingStation("102008005301", "Kantolo Baptist Church-01", 466),
                createActualPollingStation("102008005401", "Chisapa Secondary School-01", 931),
              ]
            },
            {
              id: "copperbelt-mpongwe-mpongwe-east-kalweo",
              name: "KALWEO",
              councillorCandidates: generateCouncillorCandidates("copperbelt-mpongwe-mpongwe-east-kalweo"),
              pollingStations: [
                createActualPollingStation("102008005501", "Muyambe Primary School-01", 696),
                createActualPollingStation("102008005502", "Muyambe Primary School-02", 696),
                createActualPollingStation("102008005601", "Lwamabwe Primary School-01", 747),
              ]
            },
            {
              id: "copperbelt-mpongwe-mpongwe-east-ntanda",
              name: "NTANDA",
              councillorCandidates: generateCouncillorCandidates("copperbelt-mpongwe-mpongwe-east-ntanda"),
              pollingStations: [
                createActualPollingStation("102008005701", "Chibangu Community School-01", 492),
                createActualPollingStation("102008005801", "Ntanda Primary School-01", 542),
                createActualPollingStation("102008005802", "Ntanda Primary School-02", 542),
                createActualPollingStation("102008005901", "Lukanga North Catholic Church-01", 537),
                createActualPollingStation("102008006001", "Twikatane Communityunity School-01", 441),
                createActualPollingStation("102008006101", "Muchindushi Primary School-01", 766),
              ]
            },
            {
              id: "copperbelt-mpongwe-mpongwe-east-mikata",
              name: "MIKATA",
              councillorCandidates: generateCouncillorCandidates("copperbelt-mpongwe-mpongwe-east-mikata"),
              pollingStations: [
                createActualPollingStation("102008006201", "Nawanda Community School-01", 311),
                createActualPollingStation("102008006301", "Mikata Secondary School-01", 925),
                createActualPollingStation("102008006302", "Mikata Secondary School-02", 925),
                createActualPollingStation("102008006401", "Nachitalu Primary School-01", 300),
                createActualPollingStation("102008006501", "Mpondwa Community School-01", 633),
              ]
            },
          ]
        },
      ]
    },
    {
      id: "mufulira",
      name: "MUFULIRA",
      mayoralCandidates: generateMayoralCandidates("mufulira"),
      constituencies: [
        {
          id: "copperbelt-mufulira-kantanshi",
          name: "KANTANSHI",
          mpCandidates: generateMPCandidates("copperbelt-mufulira-kantanshi"),
          wards: [
            {
              id: "copperbelt-mufulira-kantanshi-luansobe",
              name: "LUANSOBE",
              councillorCandidates: generateCouncillorCandidates("copperbelt-mufulira-kantanshi-luansobe"),
              pollingStations: [
                createActualPollingStation("102009000101", "Mindela Primary School-01", 196),
                createActualPollingStation("102009000201", "Salumingu Community School-01", 151),
                createActualPollingStation("102009000301", "Muya Primary School-01", 286),
                createActualPollingStation("102009000401", "Luansobe Primary School-01", 800),
                createActualPollingStation("102009000402", "Luansobe Primary School-02", 799),
                createActualPollingStation("102009000501", "Ka Banki Hall-01", 637),
              ]
            },
            {
              id: "copperbelt-mufulira-kantanshi-butondo",
              name: "BUTONDO",
              councillorCandidates: generateCouncillorCandidates("copperbelt-mufulira-kantanshi-butondo"),
              pollingStations: [
                createActualPollingStation("102009000601", "Envision Outreach Church-01", 715),
                createActualPollingStation("102009000701", "Butondo UCZ Congregesion-01", 658),
                createActualPollingStation("102009000702", "Butondo UCZ Congregesion-02", 658),
              ]
            },
            {
              id: "copperbelt-mufulira-kantanshi-mpelembe",
              name: "MPELEMBE",
              councillorCandidates: generateCouncillorCandidates("copperbelt-mufulira-kantanshi-mpelembe"),
              pollingStations: [
                createActualPollingStation("102009000801", "Agape Christian Beliviers Church-01", 628),
                createActualPollingStation("102009000901", "Kankoyo Primary School-01", 676),
                createActualPollingStation("102009000902", "Kankoyo Primary School-02", 675),
                createActualPollingStation("102009001001", "Agape Christian Beliviers Church-01", 677),
              ]
            },
            {
              id: "copperbelt-mufulira-kantanshi-fibusa",
              name: "FIBUSA",
              councillorCandidates: generateCouncillorCandidates("copperbelt-mufulira-kantanshi-fibusa"),
              pollingStations: [
                createActualPollingStation("102009001101", "Muleya Winter Primary School-01", 953),
                createActualPollingStation("102009001201", "Clinic 5 (Tent)-01", 835),
                createActualPollingStation("102009001202", "Clinic 5 (Tent)-02", 834),
                createActualPollingStation("102009001301", "Clinic 5 (Tent)-01", 807),
                createActualPollingStation("102009001401", "Muleya Winter Primary School-01", 154),
              ]
            },
            {
              id: "copperbelt-mufulira-kantanshi-bufuke",
              name: "BUFUKE",
              councillorCandidates: generateCouncillorCandidates("copperbelt-mufulira-kantanshi-bufuke"),
              pollingStations: [
                createActualPollingStation("102009001501", "Mopani Copper Mines Clinic 7-01", 753),
                createActualPollingStation("102009001502", "Mopani Copper Mines Clinic 7-02", 752),
                createActualPollingStation("102009001601", "Butondo Primary School-01", 605),
                createActualPollingStation("102009001602", "Butondo Primary School-02", 604),
              ]
            },
            {
              id: "copperbelt-mufulira-kantanshi-kwacha",
              name: "KWACHA",
              councillorCandidates: generateCouncillorCandidates("copperbelt-mufulira-kantanshi-kwacha"),
              pollingStations: [
                createActualPollingStation("102009001701", "Twampane Primary School-01", 477),
                createActualPollingStation("102009001801", "Twampane Primary School-01", 242),
                createActualPollingStation("102009001901", "Makole Primary School-01", 759),
                createActualPollingStation("102009001902", "Makole Primary School-02", 759),
                createActualPollingStation("102009001903", "Makole Primary School-03", 758),
              ]
            },
            {
              id: "copperbelt-mufulira-kantanshi-buntungwa",
              name: "BUNTUNGWA",
              councillorCandidates: generateCouncillorCandidates("copperbelt-mufulira-kantanshi-buntungwa"),
              pollingStations: [
                createActualPollingStation("102009002001", "Chibolya Community Centre-01", 790),
                createActualPollingStation("102009002002", "Chibolya Community Centre-02", 789),
                createActualPollingStation("102009002101", "Chibolya Primary School-01", 952),
                createActualPollingStation("102009002102", "Chibolya Primary School-02", 951),
              ]
            },
            {
              id: "copperbelt-mufulira-kantanshi-john-kampengele",
              name: "JOHN KAMPENGELE",
              councillorCandidates: generateCouncillorCandidates("copperbelt-mufulira-kantanshi-john-kampengele"),
              pollingStations: [
                createActualPollingStation("102009002201", "Old People's Home-01", 990),
                createActualPollingStation("102009002301", "St Pauls UCZ Congregession-01", 625),
                createActualPollingStation("102009002401", "Coyle Community Centre-01", 578),
                createActualPollingStation("102009002402", "Coyle Community Centre-02", 578),
              ]
            },
            {
              id: "copperbelt-mufulira-kantanshi-kangwa-nsuluka",
              name: "KANGWA NSULUKA",
              councillorCandidates: generateCouncillorCandidates("copperbelt-mufulira-kantanshi-kangwa-nsuluka"),
              pollingStations: [
                createActualPollingStation("102009002501", "Luansobe Community School-01", 882),
                createActualPollingStation("102009002502", "Luansobe Community School-02", 881),
              ]
            },
            {
              id: "copperbelt-mufulira-kantanshi-minambe",
              name: "MINAMBE",
              councillorCandidates: generateCouncillorCandidates("copperbelt-mufulira-kantanshi-minambe"),
              pollingStations: [
                createActualPollingStation("102009002601", "Kasombo Community School-01", 262),
                createActualPollingStation("102009002701", "Mokambo Clinic-01", 675),
                createActualPollingStation("102009002702", "Mokambo Clinic-02", 675),
                createActualPollingStation("102009002801", "Valley Dam-01", 119),
                createActualPollingStation("102009002901", "Minambe Primary School-01", 880),
              ]
            },
            {
              id: "copperbelt-mufulira-kantanshi-mokambo",
              name: "MOKAMBO",
              councillorCandidates: generateCouncillorCandidates("copperbelt-mufulira-kantanshi-mokambo"),
              pollingStations: [
                createActualPollingStation("102009003001", "Mokambo Primary School-01", 957),
                createActualPollingStation("102009003002", "Mokambo Primary School-02", 957),
                createActualPollingStation("102009003101", "Lima Primary School-01", 442),
                createActualPollingStation("102009003201", "Mupena Primary School-01", 322),
                createActualPollingStation("102009003301", "Twalubuka Primary School-01", 276),
              ]
            },
            {
              id: "copperbelt-mufulira-kantanshi-murundu",
              name: "MURUNDU",
              councillorCandidates: generateCouncillorCandidates("copperbelt-mufulira-kantanshi-murundu"),
              pollingStations: [
                createActualPollingStation("102009003401", "Murundu Primary School-01", 744),
                createActualPollingStation("102009003501", "Murundu Clinic-01", 568),
                createActualPollingStation("102009003502", "Murundu Clinic-02", 568),
                createActualPollingStation("102009003601", "St. John's Catholic School-01", 600),
                createActualPollingStation("102009003602", "St. John's Catholic School-02", 600),
                createActualPollingStation("102009003701", "Chiwele Primary School-01", 187),
              ]
            },
            {
              id: "copperbelt-mufulira-kantanshi-mupambe",
              name: "MUPAMBE",
              councillorCandidates: generateCouncillorCandidates("copperbelt-mufulira-kantanshi-mupambe"),
              pollingStations: [
                createActualPollingStation("102009003801", "Fenda Excel School-01", 475),
                createActualPollingStation("102009003901", "Mupambe Primary School-01", 637),
                createActualPollingStation("102009003902", "Mupambe Primary School-02", 636),
                createActualPollingStation("102009004001", "Pine Haven School-01", 732),
                createActualPollingStation("102009004101", "Sunshine International Christian Accademy (S", 724),
                createActualPollingStation("102009004102", "Sunshine International Christian Accademy (S", 724),
              ]
            },
            {
              id: "copperbelt-mufulira-kantanshi-david-kaunda",
              name: "DAVID KAUNDA",
              councillorCandidates: generateCouncillorCandidates("copperbelt-mufulira-kantanshi-david-kaunda"),
              pollingStations: [
                createActualPollingStation("102009004201", "Mopani Copper Mines Secondary School-01", 746),
                createActualPollingStation("102009004202", "Mopani Copper Mines Secondary School-02", 746),
              ]
            },
            {
              id: "copperbelt-mufulira-kantanshi-maina-soko",
              name: "MAINA SOKO",
              councillorCandidates: generateCouncillorCandidates("copperbelt-mufulira-kantanshi-maina-soko"),
              pollingStations: [
                createActualPollingStation("102009004301", "Boma Offices (ZCH)-01", 751),
                createActualPollingStation("102009004302", "Boma Offices (ZCH)-02", 751),
                createActualPollingStation("102009004401", "Mano Upper Primary-01", 614),
                createActualPollingStation("102009004402", "Mano Upper Primary-02", 613),
                createActualPollingStation("102009004501", "St. Anthony Catholic Primary School-01", 585),
                createActualPollingStation("102009004502", "St. Anthony Catholic Primary School-02", 584),
              ]
            },
            {
              id: "copperbelt-mufulira-kantanshi-leya-mukutu",
              name: "LEYA MUKUTU",
              councillorCandidates: generateCouncillorCandidates("copperbelt-mufulira-kantanshi-leya-mukutu"),
              pollingStations: [
                createActualPollingStation("102009004601", "J Boating-01", 389),
                createActualPollingStation("102009004701", "Buyantanshi Youth Centre-01", 584),
                createActualPollingStation("102009004801", "J Boating-01", 533),
                createActualPollingStation("102009004802", "J Boating-02", 533),
              ]
            },
            {
              id: "copperbelt-mufulira-kantanshi-bwafwano",
              name: "BWAFWANO",
              councillorCandidates: generateCouncillorCandidates("copperbelt-mufulira-kantanshi-bwafwano"),
              pollingStations: [
                createActualPollingStation("102009004901", "Central School-01", 782),
                createActualPollingStation("102009004902", "Central School-02", 781),
                createActualPollingStation("102009005001", "Mutamba Primary School-01", 891),
              ]
            },
            {
              id: "copperbelt-mufulira-kantanshi-mulungushi",
              name: "MULUNGUSHI",
              councillorCandidates: generateCouncillorCandidates("copperbelt-mufulira-kantanshi-mulungushi"),
              pollingStations: [
                createActualPollingStation("102009005101", "Kasumba Primary School-01", 585),
                createActualPollingStation("102009005102", "Kasumba Primary School-02", 585),
                createActualPollingStation("102009005201", "Katangalele Pre School-01", 952),
                createActualPollingStation("102009005202", "Katangalele Pre School-02", 951),
                createActualPollingStation("102009005301", "Muz Offices-01", 461),
                createActualPollingStation("102009005401", "Tent (Near Clinic)-01", 652),
                createActualPollingStation("102009005402", "Tent (Near Clinic)-02", 652),
                createActualPollingStation("102009005501", "Kantanshi Secondary School-01", 839),
                createActualPollingStation("102009005502", "Kantanshi Secondary School-02", 838),
              ]
            },
            {
              id: "copperbelt-mufulira-kantanshi-shinde",
              name: "SHINDE",
              councillorCandidates: generateCouncillorCandidates("copperbelt-mufulira-kantanshi-shinde"),
              pollingStations: [
                createActualPollingStation("102009005601", "Clinc 2 (Tent)-01", 791),
                createActualPollingStation("102009005701", "Mufulira Wanderers Camp House-01", 699),
                createActualPollingStation("102009005702", "Mufulira Wanderers Camp House-02", 699),
                createActualPollingStation("102009005801", "Kasumba Primary School-01", 845),
                createActualPollingStation("102009005802", "Kasumba Primary School-02", 845),
                createActualPollingStation("102009005901", "Tangata Secondary School-01", 780),
                createActualPollingStation("102009006001", "Tangata Primary School-01", 331),
              ]
            },
            {
              id: "copperbelt-mufulira-kantanshi-bwembya-silwizya",
              name: "BWEMBYA SILWIZYA",
              councillorCandidates: generateCouncillorCandidates("copperbelt-mufulira-kantanshi-bwembya-silwizya"),
              pollingStations: [
                createActualPollingStation("102009006101", "LIKAM Private School-01", 286),
                createActualPollingStation("102009006201", "LIKAM Private School-01", 686),
                createActualPollingStation("102009006202", "LIKAM Private School-02", 686),
                createActualPollingStation("102009006301", "Mine School-01", 338),
              ]
            },
          ]
        },
        {
          id: "copperbelt-mufulira-mufulira",
          name: "MUFULIRA",
          mpCandidates: generateMPCandidates("copperbelt-mufulira-mufulira"),
          wards: [
            {
              id: "copperbelt-mufulira-mufulira-kafue",
              name: "KAFUE",
              councillorCandidates: generateCouncillorCandidates("copperbelt-mufulira-mufulira-kafue"),
              pollingStations: [
                createActualPollingStation("102009006401", "Luanshimba Make Shift-01", 86),
                createActualPollingStation("102009006501", "Kangwena Clinic-01", 265),
                createActualPollingStation("102009006601", "Kapolopolo Agriculture Shed-01", 230),
                createActualPollingStation("102009006701", "Kafironda Primary School-01", 437),
                createActualPollingStation("102009006801", "Concrete Pipes Offices (Tent)-01", 156),
              ]
            },
            {
              id: "copperbelt-mufulira-mufulira-kansuswa",
              name: "KANSUSWA",
              councillorCandidates: generateCouncillorCandidates("copperbelt-mufulira-mufulira-kansuswa"),
              pollingStations: [
                createActualPollingStation("102009006901", "Kansuswa Community Hall-01", 886),
                createActualPollingStation("102009007001", "Kansuswa Primary School-01", 662),
                createActualPollingStation("102009007101", "Kansuswa Secondary School-01", 825),
                createActualPollingStation("102009007201", "Kansuswa Clinic (Tent)-01", 823),
              ]
            },
            {
              id: "copperbelt-mufulira-mufulira-kawama",
              name: "KAWAMA",
              councillorCandidates: generateCouncillorCandidates("copperbelt-mufulira-mufulira-kawama"),
              pollingStations: [
                createActualPollingStation("102009007301", "Kawama Community Hall-01", 776),
                createActualPollingStation("102009007302", "Kawama Community Hall-02", 775),
                createActualPollingStation("102009007401", "Enter the Land of Cannan Church (Tent)-01", 887),
                createActualPollingStation("102009007501", "Kawama Primary School-01", 556),
                createActualPollingStation("102009007502", "Kawama Primary School-02", 555),
                createActualPollingStation("102009007601", "Kawama Primary School B-01", 314),
              ]
            },
            {
              id: "copperbelt-mufulira-mufulira-hanky-kalanga",
              name: "HANKY KALANGA",
              councillorCandidates: generateCouncillorCandidates("copperbelt-mufulira-mufulira-hanky-kalanga"),
              pollingStations: [
                createActualPollingStation("102009007701", "Murah International School-01", 689),
                createActualPollingStation("102009007702", "Murah International School-02", 688),
                createActualPollingStation("102009007703", "Murah International School-03", 688),
                createActualPollingStation("102009007801", "Suburbs Clinic-01", 795),
                createActualPollingStation("102009007901", "Kamuchanga Primary School-01", 555),
                createActualPollingStation("102009008001", "Kamuchanga Primary School-01", 783),
                createActualPollingStation("102009008002", "Kamuchanga Primary School-02", 783),
                createActualPollingStation("102009051901", "Mufulira Correctional Facility -01", 232),
              ]
            },
            {
              id: "copperbelt-mufulira-mufulira-kasempa",
              name: "KASEMPA",
              councillorCandidates: generateCouncillorCandidates("copperbelt-mufulira-mufulira-kasempa"),
              pollingStations: [
                createActualPollingStation("102009008101", "Kalukanya Primary School-01", 663),
                createActualPollingStation("102009008102", "Kalukanya Primary School-02", 663),
                createActualPollingStation("102009008201", "Twashuka Primary School-01", 885),
                createActualPollingStation("102009008202", "Twashuka Primary School-02", 885),
                createActualPollingStation("102009008301", "Convenant International Church-01", 513),
                createActualPollingStation("102009008302", "Convenant International Church-02", 513),
              ]
            },
            {
              id: "copperbelt-mufulira-mufulira-kamuchanga",
              name: "KAMUCHANGA",
              councillorCandidates: generateCouncillorCandidates("copperbelt-mufulira-mufulira-kamuchanga"),
              pollingStations: [
                createActualPollingStation("102009008401", "Buyantanshi Secondary School-01", 523),
                createActualPollingStation("102009008501", "Buyantanshi Secondary School-01", 886),
                createActualPollingStation("102009008502", "Buyantanshi Secondary School-02", 886),
                createActualPollingStation("102009008503", "Buyantanshi Secondary School-03", 885),
                createActualPollingStation("102009008601", "Jordan UCZ Church-01", 582),
                createActualPollingStation("102009008602", "Jordan UCZ Church-02", 582),
              ]
            },
            {
              id: "copperbelt-mufulira-mufulira-chachacha",
              name: "CHACHACHA",
              councillorCandidates: generateCouncillorCandidates("copperbelt-mufulira-mufulira-chachacha"),
              pollingStations: [
                createActualPollingStation("102009008701", "CMML Twatasha-01", 832),
                createActualPollingStation("102009008801", "Buseko Community Centre-01", 649),
                createActualPollingStation("102009008901", "Mutundu Primary School-01", 674),
                createActualPollingStation("102009008902", "Mutundu Primary School-02", 673),
                createActualPollingStation("102009008903", "Mutundu Primary School-03", 673),
                createActualPollingStation("102009009001", "Bible Gospel Church in Africa (BIGOCA)-01", 653),
                createActualPollingStation("102009009101", "Katwezye School-01", 648),
                createActualPollingStation("102009009102", "Katwezye School-02", 647),
              ]
            },
            {
              id: "copperbelt-mufulira-mufulira-david-lunda",
              name: "DAVID LUNDA",
              councillorCandidates: generateCouncillorCandidates("copperbelt-mufulira-mufulira-david-lunda"),
              pollingStations: [
                createActualPollingStation("102009009201", "Drill Hall-01", 823),
                createActualPollingStation("102009009301", "Eastlea Primary School-01", 518),
                createActualPollingStation("102009009302", "Eastlea Primary School-02", 517),
                createActualPollingStation("102009009401", "Rosefinni Accademy School-01", 729),
              ]
            },
            {
              id: "copperbelt-mufulira-mufulira-bwananyina",
              name: "BWANANYINA",
              councillorCandidates: generateCouncillorCandidates("copperbelt-mufulira-mufulira-bwananyina"),
              pollingStations: [
                createActualPollingStation("102009009501", "St. Threasa Catholic Church-01", 867),
                createActualPollingStation("102009009502", "St. Threasa Catholic Church-02", 867),
                createActualPollingStation("102009009503", "St. Threasa Catholic Church-03", 867),
                createActualPollingStation("102009009504", "St. Threasa Catholic Church-04", 866),
                createActualPollingStation("102009009505", "St. Threasa Catholic Church-05", 866),
                createActualPollingStation("102009009601", "Gasto Primary School-01", 691),
                createActualPollingStation("102009009602", "Gasto Primary School-02", 691),
                createActualPollingStation("102009009603", "Gasto Primary School-03", 691),
                createActualPollingStation("102009009701", "Kalindini Community School-01", 147),
                createActualPollingStation("102009009801", "Yumba's Farm (Tent)-01", 213),
                createActualPollingStation("102009009901", "Zamchin Community Hall-01", 745),
                createActualPollingStation("102009009902", "Zamchin Community Hall-02", 745),
                createActualPollingStation("102009009903", "Zamchin Community Hall-03", 745),
              ]
            },
            {
              id: "copperbelt-mufulira-mufulira-mutundu",
              name: "MUTUNDU",
              councillorCandidates: generateCouncillorCandidates("copperbelt-mufulira-mufulira-mutundu"),
              pollingStations: [
                createActualPollingStation("102009010001", "Misambo Primary School-01", 730),
                createActualPollingStation("102009010101", "Namboard (Tent)-01", 137),
                createActualPollingStation("102009010201", "Mutupa 17 Miles (Tent)-01", 469),
                createActualPollingStation("102009010301", "Mulilangoma Temporal Shelter-01", 276),
                createActualPollingStation("102009010401", "Twasekela Primary School-01", 660),
                createActualPollingStation("102009010501", "Mufuchani Catholic Church-01", 224),
                createActualPollingStation("102009010601", "Emaskid Primary School-01", 86),
                createActualPollingStation("102009010701", "Mukuba 'B' New Clinic-01", 264),
                createActualPollingStation("102009010801", "Kasaria Community School-01", 366),
                createActualPollingStation("102009010901", "Rural Resettlement Community School-01", 191),
                createActualPollingStation("102009052001", "Mukuba Correctional Farm-01", 4),
              ]
            },
          ]
        },
      ]
    },
    {
      id: "ndola",
      name: "NDOLA",
      mayoralCandidates: generateMayoralCandidates("ndola"),
      constituencies: [
        {
          id: "copperbelt-ndola-bwana-mkubwa",
          name: "BWANA MKUBWA",
          mpCandidates: generateMPCandidates("copperbelt-ndola-bwana-mkubwa"),
          wards: [
            {
              id: "copperbelt-ndola-bwana-mkubwa-mushili",
              name: "MUSHILI",
              councillorCandidates: generateCouncillorCandidates("copperbelt-ndola-bwana-mkubwa-mushili"),
              pollingStations: [
                createActualPollingStation("102010001101", "UCZ Bethel Primary School-01", 913),
                createActualPollingStation("102010001102", "UCZ Bethel Primary School-02", 913),
                createActualPollingStation("102010001201", "UCZ Bethel Primary School-01", 803),
                createActualPollingStation("102010001202", "UCZ Bethel Primary School-02", 802),
                createActualPollingStation("102010001301", "Mapepo Primary School-01", 542),
                createActualPollingStation("102010001302", "Mapepo Primary School-02", 542),
                createActualPollingStation("102010001401", "Mapepo Primary School-01", 533),
                createActualPollingStation("102010001402", "Mapepo Primary School-02", 533),
                createActualPollingStation("102010001501", "Mapepo Primary School-01", 657),
                createActualPollingStation("102010001601", "Bonano Primary School-01", 816),
                createActualPollingStation("102010001602", "Bonano Primary School-02", 816),
                createActualPollingStation("102010001603", "Bonano Primary School-03", 815),
                createActualPollingStation("102010001701", "Potters House Church-01", 818),
                createActualPollingStation("102010001702", "Potters House Church-02", 818),
                createActualPollingStation("102010001703", "Potters House Church-03", 817),
                createActualPollingStation("102010001704", "Potters House Church-04", 817),
                createActualPollingStation("102010001705", "Potters House Church-05", 817),
                createActualPollingStation("102010001801", "Twikatane Combined School-01", 933),
                createActualPollingStation("102010001802", "Twikatane Combined School-02", 933),
                createActualPollingStation("102010001901", "Twikatane Combined School-01", 786),
                createActualPollingStation("102010001902", "Twikatane Combined School-02", 785),
                createActualPollingStation("102010001903", "Twikatane Combined School-03", 785),
              ]
            },
            {
              id: "copperbelt-ndola-bwana-mkubwa-lupili",
              name: "LUPILI",
              councillorCandidates: generateCouncillorCandidates("copperbelt-ndola-bwana-mkubwa-lupili"),
              pollingStations: [
                createActualPollingStation("102010002001", "Mushili Youth Training Centre-01", 819),
                createActualPollingStation("102010002002", "Mushili Youth Training Centre-02", 819),
                createActualPollingStation("102010002003", "Mushili Youth Training Centre-03", 818),
                createActualPollingStation("102010002101", "Mushili Kansengu Primary School-01", 851),
                createActualPollingStation("102010002102", "Mushili Kansengu Primary School-02", 850),
                createActualPollingStation("102010002103", "Mushili Kansengu Primary School-03", 850),
                createActualPollingStation("102010002104", "Mushili Kansengu Primary School-04", 850),
                createActualPollingStation("102010002201", "Don Trust-01", 937),
                createActualPollingStation("102010002301", "Chikulupililo Community School-01", 925),
              ]
            },
            {
              id: "copperbelt-ndola-bwana-mkubwa-twashuka",
              name: "TWASHUKA",
              councillorCandidates: generateCouncillorCandidates("copperbelt-ndola-bwana-mkubwa-twashuka"),
              pollingStations: [
                createActualPollingStation("102010002401", "Twalubuka Combined School-01", 987),
                createActualPollingStation("102010002402", "Twalubuka Combined School-02", 987),
                createActualPollingStation("102010002403", "Twalubuka Combined School-03", 987),
                createActualPollingStation("102010002404", "Twalubuka Combined School-04", 987),
                createActualPollingStation("102010002405", "Twalubuka Combined School-05", 987),
                createActualPollingStation("102010002406", "Twalubuka Combined School-06", 986),
                createActualPollingStation("102010002407", "Twalubuka Combined School-07", 986),
                createActualPollingStation("102010002408", "Twalubuka Combined School-08", 986),
                createActualPollingStation("102010002409", "Twalubuka Combined School-09", 986),
                createActualPollingStation("102010002501", "West Born Community School-01", 939),
                createActualPollingStation("102010002502", "West Born Community School-02", 939),
                createActualPollingStation("102010002601", "Muzi Secondary School-01", 800),
                createActualPollingStation("102010002602", "Muzi Secondary School-02", 800),
                createActualPollingStation("102010002701", "Mwandila's Farm-01", 322),
                createActualPollingStation("102010002801", "Old Regiment Community School-01", 814),
              ]
            },
            {
              id: "copperbelt-ndola-bwana-mkubwa-itawa",
              name: "ITAWA",
              councillorCandidates: generateCouncillorCandidates("copperbelt-ndola-bwana-mkubwa-itawa"),
              pollingStations: [
                createActualPollingStation("102010002901", "Dzikomo Primary School-01", 533),
                createActualPollingStation("102010002902", "Dzikomo Primary School-02", 533),
                createActualPollingStation("102010003001", "Itawa Combined School-01", 774),
                createActualPollingStation("102010003002", "Itawa Combined School-02", 774),
                createActualPollingStation("102010003101", "Itawa Combined School-01", 101),
                createActualPollingStation("102010003201", "Ndeke Combined School-01", 828),
                createActualPollingStation("102010003301", "Church of God-01", 603),
                createActualPollingStation("102010003401", "Mackenzie Combined School-01", 625),
                createActualPollingStation("102010003402", "Mackenzie Combined School-02", 624),
                createActualPollingStation("102010003501", "Itawa Combined School-01", 238),
                createActualPollingStation("102010003601", "Ndeke Primary School-01", 625),
                createActualPollingStation("102010003602", "Ndeke Primary School-02", 624),
                createActualPollingStation("102010003701", "Ndeke Combined School-01", 626),
                createActualPollingStation("102010003801", "Twavane Private School-01", 374),
                createActualPollingStation("102010003901", "Ndeke Combined School-01", 804),
                createActualPollingStation("102010003902", "Ndeke Combined School-02", 803),
                createActualPollingStation("102010003903", "Ndeke Combined School-03", 803),
                createActualPollingStation("102010004001", "Ndeke Combined School-01", 621),
                createActualPollingStation("102010004002", "Ndeke Combined School-02", 620),
              ]
            },
            {
              id: "copperbelt-ndola-bwana-mkubwa-munkulungwe",
              name: "MUNKULUNGWE",
              councillorCandidates: generateCouncillorCandidates("copperbelt-ndola-bwana-mkubwa-munkulungwe"),
              pollingStations: [
                createActualPollingStation("102010004101", "Katondo Secondary School-01", 965),
                createActualPollingStation("102010004102", "Katondo Secondary School-02", 964),
                createActualPollingStation("102010004103", "Katondo Secondary School-03", 964),
                createActualPollingStation("102010004104", "Katondo Secondary School-04", 964),
                createActualPollingStation("102010004201", "Sungabukanda Primary School-01", 771),
                createActualPollingStation("102010004301", "Tur-Argan Primary School-01", 728),
                createActualPollingStation("102010004302", "Tur-Argan Primary School-02", 727),
                createActualPollingStation("102010004401", "Tur-Argan Primary School-01", 183),
                createActualPollingStation("102010004501", "Simunyola Community Hall-01", 259),
                createActualPollingStation("102010004601", "Chalubemba Primary School-01", 442),
              ]
            },
            {
              id: "copperbelt-ndola-bwana-mkubwa-kavu",
              name: "KAVU",
              councillorCandidates: generateCouncillorCandidates("copperbelt-ndola-bwana-mkubwa-kavu"),
              pollingStations: [
                createActualPollingStation("102010004701", "Mercy Touch School-01", 276),
                createActualPollingStation("102010004801", "Munkulungwe kavu south Community Hall-01", 657),
                createActualPollingStation("102010004901", "Kang'onga Community Hall-01", 681),
                createActualPollingStation("102010004902", "Kang'onga Community Hall-02", 680),
                createActualPollingStation("102010004903", "Kang'onga Community Hall-03", 680),
                createActualPollingStation("102010005001", "St Andrews Catholic Church-01", 604),
                createActualPollingStation("102010005002", "St Andrews Catholic Church-02", 604),
                createActualPollingStation("102010005101", "St Andrews Catholic Church-01", 417),
              ]
            },
          ]
        },
        {
          id: "copperbelt-ndola-chifubu",
          name: "CHIFUBU",
          mpCandidates: generateMPCandidates("copperbelt-ndola-chifubu"),
          wards: [
            {
              id: "copperbelt-ndola-chifubu-kamba",
              name: "KAMBA",
              councillorCandidates: generateCouncillorCandidates("copperbelt-ndola-chifubu-kamba"),
              pollingStations: [
                createActualPollingStation("102010005501", "Malasha Combined School-01", 825),
                createActualPollingStation("102010005502", "Malasha Combined School-02", 824),
                createActualPollingStation("102010005601", "Kamba Secondary School-01", 711),
                createActualPollingStation("102010005602", "Kamba Secondary School-02", 710),
                createActualPollingStation("102010005701", "Kamba Secondary School-01", 516),
                createActualPollingStation("102010005702", "Kamba Secondary School-02", 515),
                createActualPollingStation("102010005801", "Kamba Secondary School-01", 739),
                createActualPollingStation("102010005802", "Kamba Secondary School-02", 739),
                createActualPollingStation("102010005901", "Kamba Secondary School-01", 896),
                createActualPollingStation("102010006001", "Malasha Combined School-01", 832),
                createActualPollingStation("102010006002", "Malasha Combined School-02", 832),
                createActualPollingStation("102010006101", "Malasha Combined School-01", 844),
                createActualPollingStation("102010006102", "Malasha Combined School-02", 843),
              ]
            },
            {
              id: "copperbelt-ndola-chifubu-kawama",
              name: "KAWAMA",
              councillorCandidates: generateCouncillorCandidates("copperbelt-ndola-chifubu-kawama"),
              pollingStations: [
                createActualPollingStation("102010006201", "Kawama Secondary School-01", 981),
                createActualPollingStation("102010006301", "Intulo Basic Hall-01", 776),
                createActualPollingStation("102010006302", "Intulo Basic Hall-02", 775),
                createActualPollingStation("102010006401", "Garden of Hope School-01", 726),
                createActualPollingStation("102010006501", "Garden of Hope School-01", 985),
                createActualPollingStation("102010006601", "Chawama Primary School-01", 918),
                createActualPollingStation("102010006602", "Chawama Primary School-02", 918),
                createActualPollingStation("102010006701", "Chawama Primary School-01", 841),
                createActualPollingStation("102010006801", "Chawama Primary School-01", 625),
                createActualPollingStation("102010006802", "Chawama Primary School-02", 625),
                createActualPollingStation("102010006901", "Intulo Basic Hall-01", 957),
                createActualPollingStation("102010006902", "Intulo Basic Hall-02", 957),
                createActualPollingStation("102010006903", "Intulo Basic Hall-03", 957),
              ]
            },
            {
              id: "copperbelt-ndola-chifubu-kanyanje",
              name: "KANYANJE",
              councillorCandidates: generateCouncillorCandidates("copperbelt-ndola-chifubu-kanyanje"),
              pollingStations: [
                createActualPollingStation("102010007001", "United Church of Zambia- Mulyata-01", 547),
                createActualPollingStation("102010007101", "Haven Of Hope Community School-01", 868),
                createActualPollingStation("102010007201", "Korean School-01", 858),
                createActualPollingStation("102010007301", "Hands of Compassion Community School-01", 706),
                createActualPollingStation("102010007302", "Hands of Compassion Community School-02", 706),
                createActualPollingStation("102010007303", "Hands of Compassion Community School-03", 705),
                createActualPollingStation("102010007401", "Chipulukusu Primary School-01", 927),
                createActualPollingStation("102010007402", "Chipulukusu Primary School-02", 927),
              ]
            },
            {
              id: "copperbelt-ndola-chifubu-pamodzi",
              name: "PAMODZI",
              councillorCandidates: generateCouncillorCandidates("copperbelt-ndola-chifubu-pamodzi"),
              pollingStations: [
                createActualPollingStation("102010007501", "Twatasha Primary School-01", 766),
                createActualPollingStation("102010007502", "Twatasha Primary School-02", 766),
                createActualPollingStation("102010007601", "Twatasha Primary School-01", 955),
                createActualPollingStation("102010007701", "Twatasha Primary School-01", 841),
                createActualPollingStation("102010007702", "Twatasha Primary School-02", 841),
                createActualPollingStation("102010007703", "Twatasha Primary School-03", 841),
                createActualPollingStation("102010007801", "Pamodzi Combined School-01", 759),
                createActualPollingStation("102010007802", "Pamodzi Combined School-02", 759),
                createActualPollingStation("102010007803", "Pamodzi Combined School-03", 758),
                createActualPollingStation("102010007804", "Pamodzi Combined School-04", 758),
                createActualPollingStation("102010007901", "Pamodzi Combined School-01", 773),
                createActualPollingStation("102010007902", "Pamodzi Combined School-02", 773),
                createActualPollingStation("102010007903", "Pamodzi Combined School-03", 772),
                createActualPollingStation("102010008001", "Sathya Sai Boys-01", 688),
                createActualPollingStation("102010008101", "Pamodzi Site & Service-01", 683),
                createActualPollingStation("102010008102", "Pamodzi Site & Service-02", 683),
                createActualPollingStation("102010008201", "Sathya Sai Boys School-01", 901),
                createActualPollingStation("102010008202", "Sathya Sai Boys School-02", 901),
                createActualPollingStation("102010008301", "Pamodzi Combined School-01", 826),
                createActualPollingStation("102010008302", "Pamodzi Combined School-02", 826),
                createActualPollingStation("102010008401", "Minsundu Primary School-01", 287),
                createActualPollingStation("102010008501", "Twikatane Community School-01", 308),
              ]
            },
            {
              id: "copperbelt-ndola-chifubu-fibobe",
              name: "FIBOBE",
              councillorCandidates: generateCouncillorCandidates("copperbelt-ndola-chifubu-fibobe"),
              pollingStations: [
                createActualPollingStation("102010008601", "St. Bonaventure Secondary School-01", 766),
                createActualPollingStation("102010008701", "St. Bonaventure Secondary School-01", 658),
                createActualPollingStation("102010008702", "St. Bonaventure Secondary School-02", 658),
                createActualPollingStation("102010008801", "St. Bonaventure Secondary School-01", 593),
                createActualPollingStation("102010008901", "Fibobe Primary School-01", 760),
                createActualPollingStation("102010009001", "Fibobe Primary School-01", 554),
                createActualPollingStation("102010009002", "Fibobe Primary School-02", 553),
                createActualPollingStation("102010009101", "Fibobe Primary School-01", 639),
                createActualPollingStation("102010009102", "Fibobe Primary School-02", 639),
                createActualPollingStation("102010009201", "Fibobe Primary School-01", 864),
              ]
            },
            {
              id: "copperbelt-ndola-chifubu-chifubu",
              name: "CHIFUBU",
              councillorCandidates: generateCouncillorCandidates("copperbelt-ndola-chifubu-chifubu"),
              pollingStations: [
                createActualPollingStation("102010009301", "Chifubu Primary School-01", 611),
                createActualPollingStation("102010009302", "Chifubu Primary School-02", 610),
                createActualPollingStation("102010009401", "Chifubu Primary School-01", 684),
                createActualPollingStation("102010009402", "Chifubu Primary School-02", 684),
                createActualPollingStation("102010009501", "Chifubu Primary School-01", 606),
                createActualPollingStation("102010009502", "Chifubu Primary School-02", 606),
                createActualPollingStation("102010009601", "Chifubu Primary School-01", 613),
                createActualPollingStation("102010009602", "Chifubu Primary School-02", 612),
                createActualPollingStation("102010009701", "Temweni Secondary School-01", 715),
                createActualPollingStation("102010009801", "Temweni Secondary School-01", 966),
                createActualPollingStation("102010009901", "Temweni Secondary School-01", 521),
                createActualPollingStation("102010009902", "Temweni Secondary School-02", 521),
              ]
            },
          ]
        },
        {
          id: "copperbelt-ndola-kabushi",
          name: "KABUSHI",
          mpCandidates: generateMPCandidates("copperbelt-ndola-kabushi"),
          wards: [
            {
              id: "copperbelt-ndola-kabushi-chichele",
              name: "CHICHELE",
              councillorCandidates: generateCouncillorCandidates("copperbelt-ndola-kabushi-chichele"),
              pollingStations: [
                createActualPollingStation("102010000101", "Chichele Community Centre-01", 503),
                createActualPollingStation("102010000201", "Kafubu Farm M B School-01", 755),
                createActualPollingStation("102010000301", "Wisdom Community School-01", 952),
                createActualPollingStation("102010000302", "Wisdom Community School-02", 952),
                createActualPollingStation("102010000303", "Wisdom Community School-03", 952),
                createActualPollingStation("102010000401", "Hope Church Of God-01", 528),
                createActualPollingStation("102010000501", "Kafubu Water Dam-01", 729),
                createActualPollingStation("102010000601", "Mwange Tarven-01", 473),
              ]
            },
            {
              id: "copperbelt-ndola-kabushi-kantolomba",
              name: "KANTOLOMBA",
              councillorCandidates: generateCouncillorCandidates("copperbelt-ndola-kabushi-kantolomba"),
              pollingStations: [
                createActualPollingStation("102010000701", "Dag Community School-01", 354),
                createActualPollingStation("102010000801", "Sewerage Offices-01", 705),
                createActualPollingStation("102010000802", "Sewerage Offices-02", 705),
                createActualPollingStation("102010000901", "Rainbow Community Centre-01", 363),
                createActualPollingStation("102010001001", "Twatemwa Primary School-01", 599),
                createActualPollingStation("102010001002", "Twatemwa Primary School-02", 599),
              ]
            },
            {
              id: "copperbelt-ndola-kabushi-lubuto",
              name: "LUBUTO",
              councillorCandidates: generateCouncillorCandidates("copperbelt-ndola-kabushi-lubuto"),
              pollingStations: [
                createActualPollingStation("102010010001", "Lubuto Community Hall-01", 795),
                createActualPollingStation("102010010101", "Kambeba Bethel Church-01", 546),
                createActualPollingStation("102010010102", "Kambeba Bethel Church-02", 545),
                createActualPollingStation("102010010201", "Lubuto Community Hall-01", 358),
                createActualPollingStation("102010010301", "Life Way Church-01", 433),
                createActualPollingStation("102010010401", "Lubuto Community Hall-01", 523),
                createActualPollingStation("102010010501", "Lubuto Community Hall-01", 389),
                createActualPollingStation("102010010601", "Frederick Chiluba Combined School-01", 724),
                createActualPollingStation("102010010602", "Frederick Chiluba Combined School-02", 724),
                createActualPollingStation("102010010701", "Lubuto Community Hall-01", 614),
                createActualPollingStation("102010010801", "Lubuto Community Hall-01", 665),
                createActualPollingStation("102010010901", "Lubuto Clinic-01", 564),
                createActualPollingStation("102010010902", "Lubuto Clinic-02", 564),
                createActualPollingStation("102010011001", "Lubuto Primary School-01", 788),
                createActualPollingStation("102010011101", "Lubuto Primary School-01", 707),
                createActualPollingStation("102010011201", "Lubuto Primary School-01", 542),
                createActualPollingStation("102010011301", "Lubuto Primary School-01", 432),
                createActualPollingStation("102010011401", "Lubuto Secondary School-01", 923),
                createActualPollingStation("102010011402", "Lubuto Secondary School-02", 923),
                createActualPollingStation("102010011403", "Lubuto Secondary School-03", 923),
                createActualPollingStation("102010011404", "Lubuto Secondary School-04", 923),
                createActualPollingStation("102010011405", "Lubuto Secondary School-05", 923),
              ]
            },
            {
              id: "copperbelt-ndola-kabushi-mukuba",
              name: "MUKUBA",
              councillorCandidates: generateCouncillorCandidates("copperbelt-ndola-kabushi-mukuba"),
              pollingStations: [
                createActualPollingStation("102010011501", "Kayela Secondary School-01", 884),
                createActualPollingStation("102010011502", "Kayela Secondary School-02", 884),
                createActualPollingStation("102010011503", "Kayela Secondary School-03", 883),
                createActualPollingStation("102010011601", "Kayela Secondary School-01", 620),
                createActualPollingStation("102010011701", "Kabushi Primary School-01", 772),
                createActualPollingStation("102010011702", "Kabushi Primary School-02", 771),
                createActualPollingStation("102010011801", "Kayela Secondary School-01", 857),
                createActualPollingStation("102010011901", "Kayela Secondary School-01", 636),
              ]
            },
            {
              id: "copperbelt-ndola-kabushi-kafubu",
              name: "KAFUBU",
              councillorCandidates: generateCouncillorCandidates("copperbelt-ndola-kabushi-kafubu"),
              pollingStations: [
                createActualPollingStation("102010012001", "KX Baptist Church-01", 549),
                createActualPollingStation("102010012101", "Milemu Secondary School-01", 843),
                createActualPollingStation("102010012102", "Milemu Secondary School-02", 843),
                createActualPollingStation("102010012103", "Milemu Secondary School-03", 842),
                createActualPollingStation("102010012201", "Milemu Secondary School-01", 948),
                createActualPollingStation("102010012202", "Milemu Secondary School-02", 947),
                createActualPollingStation("102010012301", "Simon Mwansa Kapwepwe Primary School-01", 628),
                createActualPollingStation("102010012401", "Ndola Main Primary School-01", 721),
              ]
            },
            {
              id: "copperbelt-ndola-kabushi-skyways",
              name: "SKYWAYS",
              councillorCandidates: generateCouncillorCandidates("copperbelt-ndola-kabushi-skyways"),
              pollingStations: [
                createActualPollingStation("102010012501", "Lyuni Primary School-01", 568),
                createActualPollingStation("102010012502", "Lyuni Primary School-02", 568),
                createActualPollingStation("102010012601", "YMCA-01", 686),
                createActualPollingStation("102010012701", "Chilengwa Secondary School-01", 939),
                createActualPollingStation("102010012702", "Chilengwa Secondary School-02", 938),
                createActualPollingStation("102010012703", "Chilengwa Secondary School-03", 938),
                createActualPollingStation("102010012801", "Chilengwa Primary School-01", 884),
                createActualPollingStation("102010012901", "Chilengwa Primary School-01", 834),
                createActualPollingStation("102010013001", "Lyuni Primary School-01", 753),
                createActualPollingStation("102010013101", "Lyuni Primary School-01", 690),
                createActualPollingStation("102010013201", "Hope Chapel-01", 712),
                createActualPollingStation("102010013202", "Hope Chapel-02", 712),
                createActualPollingStation("102010013301", "Lyuni Primary School-01", 743),
              ]
            },
            {
              id: "copperbelt-ndola-kabushi-masala",
              name: "MASALA",
              councillorCandidates: generateCouncillorCandidates("copperbelt-ndola-kabushi-masala"),
              pollingStations: [
                createActualPollingStation("102010013401", "Masala Secondary School-01", 886),
                createActualPollingStation("102010013501", "Masala Secondary School-01", 885),
                createActualPollingStation("102010013601", "Bethsaida Church-01", 286),
                createActualPollingStation("102010013701", "Mine Masala Community Hall-01", 820),
                createActualPollingStation("102010013702", "Mine Masala Community Hall-02", 819),
                createActualPollingStation("102010013703", "Mine Masala Community Hall-03", 819),
                createActualPollingStation("102010013801", "Masala Primary School-01", 682),
                createActualPollingStation("102010013802", "Masala Primary School-02", 682),
              ]
            },
            {
              id: "copperbelt-ndola-kabushi-kaloko",
              name: "KALOKO",
              councillorCandidates: generateCouncillorCandidates("copperbelt-ndola-kabushi-kaloko"),
              pollingStations: [
                createActualPollingStation("102010013901", "Kaloko Primary School-01", 860),
                createActualPollingStation("102010013902", "Kaloko Primary School-02", 860),
                createActualPollingStation("102010014001", "Kaloko Primary School-01", 846),
                createActualPollingStation("102010014002", "Kaloko Primary School-02", 846),
                createActualPollingStation("102010014003", "Kaloko Primary School-03", 846),
                createActualPollingStation("102010014101", "Kaloko Primary School-01", 875),
                createActualPollingStation("102010014102", "Kaloko Primary School-02", 874),
              ]
            },
            {
              id: "copperbelt-ndola-kabushi-kabushi",
              name: "KABUSHI",
              councillorCandidates: generateCouncillorCandidates("copperbelt-ndola-kabushi-kabushi"),
              pollingStations: [
                createActualPollingStation("102010014201", "Giddings Community Hall-01", 515),
                createActualPollingStation("102010014202", "Giddings Community Hall-02", 515),
                createActualPollingStation("102010014301", "Giddings Community Hall-01", 760),
                createActualPollingStation("102010014302", "Giddings Community Hall-02", 760),
                createActualPollingStation("102010014401", "Kabushi Primary School-01", 744),
                createActualPollingStation("102010014402", "Kabushi Primary School-02", 743),
                createActualPollingStation("102010014501", "Kabushi Mosque-01", 524),
                createActualPollingStation("102010014601", "Dambo Secondary School-01", 981),
                createActualPollingStation("102010014602", "Dambo Secondary School-02", 981),
                createActualPollingStation("102010014603", "Dambo Secondary School-03", 981),
                createActualPollingStation("102010014604", "Dambo Secondary School-04", 981),
              ]
            },
            {
              id: "copperbelt-ndola-kabushi-toka",
              name: "TOKA",
              councillorCandidates: generateCouncillorCandidates("copperbelt-ndola-kabushi-toka"),
              pollingStations: [
                createActualPollingStation("102010014701", "Toka Community Hall-01", 738),
                createActualPollingStation("102010014702", "Toka Community Hall-02", 738),
                createActualPollingStation("102010014801", "Toka Community Hall-01", 608),
                createActualPollingStation("102010014802", "Toka Community Hall-02", 608),
                createActualPollingStation("102010014901", "Toka Community Hall-01", 998),
              ]
            },
          ]
        },
        {
          id: "copperbelt-ndola-ndola-central",
          name: "NDOLA CENTRAL",
          mpCandidates: generateMPCandidates("copperbelt-ndola-ndola-central"),
          wards: [
            {
              id: "copperbelt-ndola-ndola-central-kanini",
              name: "KANINI",
              councillorCandidates: generateCouncillorCandidates("copperbelt-ndola-ndola-central-kanini"),
              pollingStations: [
                createActualPollingStation("102010017201", "Niec Business College-01", 747),
                createActualPollingStation("102010017301", "Rehabilitation Centre-01", 914),
                createActualPollingStation("102010017401", "Hillcrest Community Centre-01", 781),
                createActualPollingStation("102010017402", "Hillcrest Community Centre-02", 780),
                createActualPollingStation("102010017501", "Kwacha Centre-01", 721),
                createActualPollingStation("102010017601", "Ndola Primary School-01", 629),
                createActualPollingStation("102010017602", "Ndola Primary School-02", 628),
                createActualPollingStation("102010017701", "School of Continuing Education-01", 703),
                createActualPollingStation("102010017702", "School of Continuing Education-02", 702),
                createActualPollingStation("102010017801", "Kanini Secondary School-01", 978),
                createActualPollingStation("102010017901", "Hill Crest Baptist Church-01", 890),
                createActualPollingStation("102010051801", "Peter Singogo Correctional Facility -01", 420),
              ]
            },
            {
              id: "copperbelt-ndola-ndola-central-kansenshi",
              name: "KANSENSHI",
              councillorCandidates: generateCouncillorCandidates("copperbelt-ndola-ndola-central-kansenshi"),
              pollingStations: [
                createActualPollingStation("102010018001", "Ndola Trust School-01", 877),
                createActualPollingStation("102010018002", "Ndola Trust School-02", 877),
                createActualPollingStation("102010018101", "New Apostolic-01", 787),
                createActualPollingStation("102010018201", "Chifubu Secondary School-01", 990),
                createActualPollingStation("102010018202", "Chifubu Secondary School-02", 990),
                createActualPollingStation("102010018301", "Kansenshi Secondary School-01", 847),
                createActualPollingStation("102010018302", "Kansenshi Secondary School-02", 847),
                createActualPollingStation("102010018303", "Kansenshi Secondary School-03", 846),
                createActualPollingStation("102010018401", "Kansenshi Combined School-01", 790),
                createActualPollingStation("102010018402", "Kansenshi Combined School-02", 790),
                createActualPollingStation("102010018403", "Kansenshi Combined School-03", 790),
                createActualPollingStation("102010018404", "Kansenshi Combined School-04", 790),
                createActualPollingStation("102010018501", "Ndola Trust School-01", 661),
                createActualPollingStation("102010051701", "Kasenji Correctional Facility-01", 621),
              ]
            },
            {
              id: "copperbelt-ndola-ndola-central-nkwazi",
              name: "NKWAZI",
              councillorCandidates: generateCouncillorCandidates("copperbelt-ndola-ndola-central-nkwazi"),
              pollingStations: [
                createActualPollingStation("102010018601", "Nkwazi Community Centre-01", 751),
                createActualPollingStation("102010018701", "Nkwazi Community Centre-01", 292),
                createActualPollingStation("102010018801", "Nkwazi Primary School-01", 781),
                createActualPollingStation("102010018802", "Nkwazi Primary School-02", 781),
                createActualPollingStation("102010018803", "Nkwazi Primary School-03", 780),
                createActualPollingStation("102010018901", "Zambia ICT College-01", 552),
                createActualPollingStation("102010018902", "Zambia ICT College-02", 552),
                createActualPollingStation("102010019001", "Nkwazi Primary School-01", 766),
                createActualPollingStation("102010019002", "Nkwazi Primary School-02", 766),
                createActualPollingStation("102010019101", "Nkwazi Primary School-01", 951),
                createActualPollingStation("102010019102", "Nkwazi Primary School-02", 951),
                createActualPollingStation("102010019103", "Nkwazi Primary School-03", 950),
                createActualPollingStation("102010019104", "Nkwazi Primary School-04", 950),
                createActualPollingStation("102010019105", "Nkwazi Primary School-05", 950),
                createActualPollingStation("102010019201", "OLD Resident Development Committee (RDC", 317),
                createActualPollingStation("102010019301", "Nkwazi Primary School-01", 528),
                createActualPollingStation("102010019302", "Nkwazi Primary School-02", 528),
              ]
            },
            {
              id: "copperbelt-ndola-ndola-central-yengwe",
              name: "YENGWE",
              councillorCandidates: generateCouncillorCandidates("copperbelt-ndola-ndola-central-yengwe"),
              pollingStations: [
                createActualPollingStation("102010019401", "Northrise Combined School-01", 746),
                createActualPollingStation("102010019402", "Northrise Combined School-02", 745),
                createActualPollingStation("102010019501", "Zambia ICT College-01", 510),
                createActualPollingStation("102010019502", "Zambia ICT College-02", 509),
                createActualPollingStation("102010019601", "Zambia Railways-01", 496),
                createActualPollingStation("102010019701", "St Andrews Secondary School-01", 790),
                createActualPollingStation("102010019702", "St Andrews Secondary School-02", 790),
                createActualPollingStation("102010019801", "Red Cross Offices-01", 701),
                createActualPollingStation("102010019802", "Red Cross Offices-02", 701),
                createActualPollingStation("102010019901", "Evangelica University-01", 958),
                createActualPollingStation("102010020001", "Northrise Combined School-01", 455),
                createActualPollingStation("102010020101", "Northrise Combined School-01", 204),
              ]
            },
            {
              id: "copperbelt-ndola-ndola-central-mapalo",
              name: "MAPALO",
              councillorCandidates: generateCouncillorCandidates("copperbelt-ndola-ndola-central-mapalo"),
              pollingStations: [
                createActualPollingStation("102010020201", "RDC Offices-01", 941),
                createActualPollingStation("102010020301", "RDC-01", 641),
                createActualPollingStation("102010020302", "RDC-02", 641),
                createActualPollingStation("102010020401", "Chibolele Combined School-01", 929),
                createActualPollingStation("102010020402", "Chibolele Combined School-02", 929),
                createActualPollingStation("102010020403", "Chibolele Combined School-03", 928),
                createActualPollingStation("102010020404", "Chibolele Combined School-04", 928),
                createActualPollingStation("102010020501", "Chibolele Combined School-01", 930),
                createActualPollingStation("102010020502", "Chibolele Combined School-02", 930),
                createActualPollingStation("102010020503", "Chibolele Combined School-03", 930),
                createActualPollingStation("102010020504", "Chibolele Combined School-04", 930),
                createActualPollingStation("102010020505", "Chibolele Combined School-05", 930),
                createActualPollingStation("102010020601", "Bread of Life Church-01", 710),
                createActualPollingStation("102010020602", "Bread of Life Church-02", 710),
                createActualPollingStation("102010020603", "Bread of Life Church-03", 709),
                createActualPollingStation("102010020701", "Hygiene Medical Stores-01", 719),
                createActualPollingStation("102010020702", "Hygiene Medical Stores-02", 719),
                createActualPollingStation("102010020703", "Hygiene Medical Stores-03", 718),
                createActualPollingStation("102010020801", "Council Depot Offices-01", 431),
              ]
            },
          ]
        },
        {
          id: "copperbelt-ndola-dag-hammerskjoeld",
          name: "DAG HAMMERSKJOELD",
          mpCandidates: generateMPCandidates("copperbelt-ndola-dag-hammerskjoeld"),
          wards: [
            {
              id: "copperbelt-ndola-dag-hammerskjoeld-kaniki",
              name: "KANIKI",
              councillorCandidates: generateCouncillorCandidates("copperbelt-ndola-dag-hammerskjoeld-kaniki"),
              pollingStations: [
                createActualPollingStation("102010005201", "Kaniki Secondary School-01", 971),
                createActualPollingStation("102010005202", "Kaniki Secondary School-02", 970),
                createActualPollingStation("102010005203", "Kaniki Secondary School-03", 970),
                createActualPollingStation("102010005301", "Zaffico Nursery-01", 244),
                createActualPollingStation("102010005401", "Mitengo Franciscan Convent-01", 550),
                createActualPollingStation("102010005402", "Mitengo Franciscan Convent-02", 549),
              ]
            },
            {
              id: "copperbelt-ndola-dag-hammerskjoeld-dag-hammerskjoeld",
              name: "DAG HAMMERSKJOELD",
              councillorCandidates: generateCouncillorCandidates("copperbelt-ndola-dag-hammerskjoeld-dag-hammerskjoeld"),
              pollingStations: [
                createActualPollingStation("102010015001", "Lesa Waluse Primary School-01", 663),
                createActualPollingStation("102010015101", "Mitenge Mwekera Community School-01", 439),
                createActualPollingStation("102010015201", "Kaweme Community School-01", 168),
                createActualPollingStation("102010015301", "Tent-01", 306),
                createActualPollingStation("102010015401", "St Mary's Catholic Church-01", 357),
                createActualPollingStation("102010015501", "Dola Hill Primary School-01", 834),
                createActualPollingStation("102010015502", "Dola Hill Primary School-02", 834),
                createActualPollingStation("102010015601", "George Community Hall-01", 622),
                createActualPollingStation("102010015602", "George Community Hall-02", 621),
                createActualPollingStation("102010015701", "Dag Hammersjoeld Community School-01", 597),
                createActualPollingStation("102010015801", "Kakupepa Community School-01", 486),
                createActualPollingStation("102010015901", "St Joseph Catholic Church-01", 337),
                createActualPollingStation("102010016001", "Isoma Shop (Tent)-01", 302),
                createActualPollingStation("102010016101", "Mwansa Primary School-01", 437),
                createActualPollingStation("102010016201", "UCZ Church-01", 195),
              ]
            },
            {
              id: "copperbelt-ndola-dag-hammerskjoeld-twapia",
              name: "TWAPIA",
              councillorCandidates: generateCouncillorCandidates("copperbelt-ndola-dag-hammerskjoeld-twapia"),
              pollingStations: [
                createActualPollingStation("102010016301", "Chimbotela New Apostalic Church-01", 589),
                createActualPollingStation("102010016401", "Mabungo Primary School-01", 735),
                createActualPollingStation("102010016402", "Mabungo Primary School-02", 735),
                createActualPollingStation("102010016403", "Mabungo Primary School-03", 734),
                createActualPollingStation("102010016501", "Mwabombeni Secondary School-01", 842),
                createActualPollingStation("102010016502", "Mwabombeni Secondary School-02", 842),
                createActualPollingStation("102010016503", "Mwabombeni Secondary School-03", 842),
                createActualPollingStation("102010016601", "Twapia Primary School-01", 984),
                createActualPollingStation("102010016701", "Mwaiseni Community Centre-01", 768),
                createActualPollingStation("102010016702", "Mwaiseni Community Centre-02", 768),
                createActualPollingStation("102010016703", "Mwaiseni Community Centre-03", 768),
                createActualPollingStation("102010016801", "Kamanda UCZ Church-01", 838),
                createActualPollingStation("102010016901", "Mabungo Primary School-01", 739),
                createActualPollingStation("102010016902", "Mabungo Primary School-02", 739),
                createActualPollingStation("102010017001", "Twapia Council Offices-01", 716),
                createActualPollingStation("102010017002", "Twapia Council Offices-02", 716),
                createActualPollingStation("102010017003", "Twapia Council Offices-03", 715),
                createActualPollingStation("102010017101", "Twapia Primary School-01", 688),
                createActualPollingStation("102010017102", "Twapia Primary School-02", 688),
              ]
            },
          ]
        },
      ]
    },
  ]
};
