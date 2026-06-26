export interface NewsArticle {
  id: string;
  title: string;
  category: string;
  date: string;
  author: string;
  image: string;
  excerpt: string;
  body: string[];
}

export const NEWS_ARTICLES: NewsArticle[] = [
  {
    id: 'boz-healthcare-plan-2026',
    title: 'BOZ Presidential Candidate Unveils Comprehensive Healthcare Plan',
    category: 'PRESS RELEASE',
    date: '3 June 2026',
    author: 'BOZ Communications Office',
    image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1200&h=675&fit=crop&auto=format',
    excerpt: 'Hon. Vincent Kafula today released a detailed blueprint to achieve universal health coverage by 2027, backed by an additional K3.2 billion in annual health expenditure.',
    body: [
      'Build One Zambia presidential candidate Hon. Vincent Kafula today released a landmark healthcare blueprint that promises to transform Zambia\'s health system within the first year of a BOZ government.',
      'The plan, titled "Health for Every Zambian," commits K3.2 billion in additional annual health expenditure, prioritising rural health posts, maternal care, and the elimination of user fees at all government facilities.',
      '"No Zambian should die because they cannot afford to see a doctor. This is not a distant dream — it is a plan, fully costed and ready to implement from day one," said Hon. Kafula at a press conference held at Lusaka\'s Mulungushi International Conference Centre.',
      'Key pillars of the healthcare plan include the construction of 500 new rural health posts across all 10 provinces, the hiring of 8,000 additional nurses and 2,000 doctors over five years, free maternal care including delivery and postnatal services, and the establishment of a National Health Insurance Fund accessible to all Zambians.',
      'The plan also addresses the critical shortage of medicines, committing to maintain a minimum of six months\' drug stock at all government facilities — a stark contrast to the current situation where many clinics run dry within weeks of a supply cycle.',
      'Secretary General Mulaza Kaira, who helped draft the policy, described it as "the most ambitious and affordable healthcare reform in Zambia\'s post-independence history." He noted that the K3.2 billion commitment would be funded through reallocation of government expenditure, reduction of wasteful spending, and revenue gains from the mining sector.',
      'The healthcare blueprint is part of Build One Zambia\'s broader Five Pillar Manifesto, which also covers education, agriculture, infrastructure, and economic development.',
    ],
  },
  {
    id: 'copperbelt-rally-kitwe',
    title: 'Copperbelt Rally Draws Record 80,000 Supporters in Kitwe',
    category: 'CAMPAIGN',
    date: '28 May 2026',
    author: 'BOZ Campaign Team',
    image: 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=1200&h=675&fit=crop&auto=format',
    excerpt: 'The largest political rally in Zambian history drew supporters from all 10 districts of the Copperbelt, as Build One Zambia momentum continues to build across the nation.',
    body: [
      'In what organisers and independent observers are calling the largest political rally in Zambian history, Build One Zambia drew an estimated 80,000 supporters to the Nkana stadium grounds in Kitwe on Saturday.',
      'Supporters arrived from all 10 districts of the Copperbelt Province, with some travelling overnight from as far as Chingola, Mufulira, and Chililabombwe. The atmosphere was described as electric, with party colours filling every available vantage point inside and around the stadium.',
      'Chairperson Gary Nkombo opened the rally, calling on Copperbelt residents to "take ownership of this election and ensure that every vote in this province is counted and protected." He was followed by Deputy President Mukubesa Mundia, who delivered a rousing address on economic justice for mining communities.',
      '"The Copperbelt has powered Zambia\'s economy for generations. It is time that the Copperbelt receives what it is owed — proper hospitals, good roads, quality schools, and jobs for our children," Mundia told the crowd to thunderous applause.',
      'Presidential candidate Vincent Kafula closed the rally with a forty-minute address that outlined BOZ\'s specific commitments for the Copperbelt: reinvestment of 30% of mining royalties into the province, construction of a new referral hospital in Kitwe, and a K500 million youth skills fund targeting mining-adjacent trades.',
      'The rally was preceded by a three-day road show across the Copperbelt, during which BOZ officials met with chiefs, civil society leaders, women\'s groups, and youth organisations.',
      'Party spokesperson confirmed that similar mega-rallies are planned for Lusaka, Eastern Province, and Southern Province in the coming weeks.',
    ],
  },
  {
    id: 'rural-roads-fund',
    title: 'BOZ Proposes K2 Billion Rural Roads Emergency Fund',
    category: 'POLICY',
    date: '20 May 2026',
    author: 'BOZ Policy Desk',
    image: 'https://images.unsplash.com/photo-1545558014-8692077e9b5c?w=1200&h=675&fit=crop&auto=format',
    excerpt: 'A new infrastructure financing mechanism would tar 5,000 km of rural roads by 2028, connecting farming communities to markets and reducing post-harvest losses.',
    body: [
      'Build One Zambia has announced a K2 billion Rural Roads Emergency Fund that would, if implemented, tar over 5,000 kilometres of feeder roads connecting farming communities to district markets across all 10 provinces.',
      'The proposal, unveiled by Treasurer General Christopher Kang\'ombe, is designed to address one of the most cited barriers to agricultural growth in Zambia: the inability of smallholder farmers to move their produce to market due to impassable roads, particularly during the rainy season.',
      '"Post-harvest losses in Zambia are estimated at 40% in some regions. A significant portion of those losses are caused not by lack of production, but by bad roads. We are losing food before it even reaches the table," said Kang\'ombe at a press briefing in Lusaka.',
      'The fund would operate as a dedicated infrastructure account, drawing from mining royalties, fuel levies, and development partner co-financing. BOZ has indicated that South Africa, the European Union, and the African Development Bank have expressed informal interest in co-funding the initiative.',
      'Priority corridors identified under the plan include the Luapula fishing routes, Eastern Province farming roads from Petauke to Nyimba, the Southern Province agri-corridor from Monze to Gwembe, and the North-Western Province cassava zone roads.',
      'Deputy Secretary General Scart Chansa Kantanta emphasised that the programme would include a community road maintenance component, creating local employment while ensuring roads remain passable year-round.',
      'The Rural Roads Emergency Fund is expected to be one of the centrepiece announcements at the upcoming BOZ National Conference scheduled for July 2026.',
    ],
  },
  {
    id: 'polling-agent-registration',
    title: 'Build One Zambia Opens Registration for 13,529 Polling Agents',
    category: 'ANNOUNCEMENT',
    date: '10 May 2026',
    author: 'BOZ Elections Desk',
    image: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=1200&h=675&fit=crop&auto=format',
    excerpt: 'The party has opened online and in-person registration for polling agents who will observe all 13,529 polling stations across Zambia on election day, 14 August 2031.',
    body: [
      'Build One Zambia has officially opened registration for polling agents ahead of the 2031 General Election. The party aims to place a verified agent at each of Zambia\'s 13,529 registered polling stations on election day.',
      'Registration is open to all Zambian citizens who are registered voters at their respective polling stations. Applicants must be available for a one-day training session and commit to remaining at their station from the opening of polls until results are announced.',
      '"This is not just about protecting BOZ votes. This is about protecting every Zambian\'s vote. Our agents are there to ensure the process is free, fair, and transparent for all parties and all candidates," said Secretary General Mulaza Kaira.',
      'Selected agents will undergo mandatory training covering their legal rights and responsibilities as polling agents under the Electoral Process Act, how to observe the voting and counting process, how to record and verify results using the BOZ Results Management System, and how to report irregularities through proper channels.',
      'Deputy Chairperson Willah Mudolo, who is coordinating the polling agent programme, confirmed that the party had already received over 9,000 applications in the first 48 hours since registration opened.',
      '"The response has been overwhelming. Zambians understand what is at stake in this election, and they want to be part of ensuring it is credible," Mudolo said.',
      'Applications can be submitted online via the Build One Zambia website or in person at any provincial or district party office. The deadline for applications is 30 June 2026.',
    ],
  },
];
