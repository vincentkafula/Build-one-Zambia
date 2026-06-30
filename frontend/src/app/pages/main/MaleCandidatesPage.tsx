import { useState, useEffect } from 'react';
import { Heart, Users, Leaf, ArrowRight, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router';
import { candidatesApi, type BackendCandidate } from '../../lib/api';
import vincentKafulaPhoto from '../../../imports/vincent_6-1.png';
import sishuwaPhoto from '../../../imports/Dr_Sishuwa_Sishuwa.jpg';
import makebiZuluPhoto from '../../../imports/Hon._Makebi_Zulu.jpg';
import kanyantaKapwepwePhoto from '../../../imports/kanyanta_Kapwepwe.jpg';
import sililoMwalaPhoto from '../../../imports/Sililo_Mwala.jpg';
import greyfordMondePhoto from '../../../imports/Hon._Greyford_Monde.jpg';
import kbfPhoto from '../../../imports/Kelvin_Bwalya_Fube.jpg';
import garyNkomboPhoto from '../../../imports/Hon._Garry_Nkombo.jpg';
import kangombePhoto from '../../../imports/Christopher_Kang_ombe.jpg';
import binwellMpunduPhoto from '../../../imports/KITWE-District-Commissioner-Binwell-Mpundu.jpg';
import johnKapilaPhoto from '../../../imports/John_Kapila.jpg';
import harryKalabaPhoto from '../../../imports/Harry_Kalaba.png';
import fredMmembePhoto from '../../../imports/Fred_Mm.png';
import bobSichingaPhoto from '../../../imports/Bob_shichinga.png';
import milesSampaPhoto from '../../../imports/mile_sampa.png';
import johnSangwaPhoto from '../../../imports/John_Sangwa.png';
import sakwibaSikotaPhoto from '../../../imports/sikota.png';
import seanTemboPhoto from '../../../imports/sean_te-1.png';
import kasondePhoto from '../../../imports/image-21.png';
import hamududuPhoto from '../../../imports/image-22.png';
import haabazookaPhoto from '../../../imports/image-23.png';
import franklynLuandoPhoto from '../../../imports/frackling_luando.jpg';
import givenLubindaPhoto from '../../../imports/image-25.png';

// Real photos keyed by candidate index (0-based)
const REAL_PHOTOS: Record<number, string> = {
  0:  vincentKafulaPhoto,
  1:  haabazookaPhoto,
  2:  makebiZuluPhoto,
  3:  bobSichingaPhoto,
  4:  johnSangwaPhoto,
  5:  milesSampaPhoto,
  6:  harryKalabaPhoto,
  9:  sakwibaSikotaPhoto,
  11: seanTemboPhoto,
  13: hamududuPhoto,
  15: kasondePhoto,
  7:  fredMmembePhoto,
  8:  sishuwaPhoto,
  10: kbfPhoto,
  12: garyNkomboPhoto,
  14: kangombePhoto,
  16: greyfordMondePhoto,
  17: johnKapilaPhoto,
  18: sililoMwalaPhoto,
  19: givenLubindaPhoto,
  20: binwellMpunduPhoto,
  21: franklynLuandoPhoto,
  22: kanyantaKapwepwePhoto,
};

const O    = '#f97316';
const R    = '#ef4444';
const NAVY = '#1e2d4a';

const PHOTOS = [
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=600&h=800&fit=crop&auto=format&q=90',
  'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=600&h=800&fit=crop&auto=format&q=90',
  'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&h=800&fit=crop&auto=format&q=90',
  'https://images.unsplash.com/photo-1623880840102-7df0a9f3545b?w=600&h=800&fit=crop&auto=format&q=90',
  'https://images.unsplash.com/photo-1534030347209-467a5b0ad3e6?w=600&h=800&fit=crop&auto=format&q=90',
  'https://images.unsplash.com/flagged/photo-1553642618-de0381320ff3?w=600&h=800&fit=crop&auto=format&q=90',
];

const CARD_PHOTOS = [
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=500&fit=crop&auto=format&q=90',
  'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=500&fit=crop&auto=format&q=90',
  'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400&h=500&fit=crop&auto=format&q=90',
  'https://images.unsplash.com/photo-1623880840102-7df0a9f3545b?w=400&h=500&fit=crop&auto=format&q=90',
  'https://images.unsplash.com/photo-1534030347209-467a5b0ad3e6?w=400&h=500&fit=crop&auto=format&q=90',
  'https://images.unsplash.com/flagged/photo-1553642618-de0381320ff3?w=400&h=500&fit=crop&auto=format&q=90',
];

const CANDIDATES = [
  {
    name: 'Vincent Kafula',
    role: 'Presidential Candidate — Build One Zambia',
    credentials: 'BCom Economics (UNISA) · Co-founder, Vink Multi Services Pty Ltd',
    constituency: 'National',
    focus: 'Economic Empowerment & National Unity',
    bio1: 'Vincent Kafula was born in Ndola in 1988 into a working-class family — an experience that shaped his deep understanding of the economic struggles facing ordinary Zambians. Despite significant financial hardship in his formative years, he earned a BCom in Economics from UNISA and co-founded Vink Multi Services Pty Ltd, growing it from a start-up into a multi-sector business across services, logistics, and trading.',
    bio2: 'As presidential candidate, Kafula brings a vision rooted in economic empowerment, national unity, and institutional reform. His platform is focused on job creation through SME support, education investment, agricultural modernisation, and responsible mineral resource governance — a personal story that resonates deeply with millions of Zambians.',
    quote: '"Every Zambian — regardless of background — deserves a genuine opportunity to build a prosperous life."',
    signature: 'Vincent Kafula',
  },
  {
    name: 'Dr. Lubinda Haabazoka',
    role: 'Shadow Minister of Energy & Electricity',
    credentials: 'Director, UNZA Graduate School of Business · PhD Economics',
    constituency: 'National',
    focus: 'Energy Sector Transformation',
    bio1: 'Dr. Lubinda Haabazoka is one of Zambia\'s most prominent economists and a leading voice on energy economics, structural development, and financial policy. He serves as Director of the Graduate School of Business at UNZA and has advised the World Bank on energy and economic policy, consulted with international hedge funds, and structured over $600 million in project finance across the energy and extractive sectors.',
    bio2: 'A sought-after commentator on CNN, Bloomberg, and the Financial Times, his expertise spans renewable energy finance, power sector restructuring, and the economics of hydropower, solar, and thermal systems. As Minister of Energy, he will pursue electricity sector transformation encompassing energy source diversification, private sector investment, and rural electrification.',
    quote: '"Zambia\'s electricity deficit is not a technical problem — it is a governance problem. We know how to fix it."',
    signature: 'Lubinda Haabazoka',
  },
  {
    name: 'Makebi Zulu, SC',
    role: 'Shadow Minister of Employment & Labour',
    credentials: 'Senior Counsel · LLB (UNZA) · Former MP Malambo · Founder, Makebi Zulu Advocates',
    constituency: 'National',
    focus: 'Labour Reform & Job Creation',
    bio1: 'Makebi Zulu is one of Zambia\'s most accomplished legal practitioners, having attained the prestigious rank of Senior Counsel. He holds a Bachelor of Laws from UNZA and is the founding partner of Makebi Zulu Advocates, with extensive experience in employment law, industrial relations, constitutional matters, and commercial litigation.',
    bio2: 'His career includes service as Member of Parliament for Malambo Constituency and as Eastern Province Minister. He has practised extensively before the Industrial Relations Court, representing both employers and workers — giving him a uniquely balanced understanding of the competing interests that must be reconciled in effective labour policy.',
    quote: '"Zambia\'s workers deserve a legal framework that protects their rights and a business climate that creates their jobs."',
    signature: 'Makebi Zulu',
  },
  {
    name: 'Hon. Robert \'Bob\' Sichinga',
    role: 'Shadow Minister of Agriculture & Rural Development',
    credentials: 'Harvard-educated Economist · Former Minister of Commerce (2011–2016) and Agriculture (2013–2016)',
    constituency: 'National',
    focus: 'Agriculture & Food Security',
    bio1: 'Hon. Robert \'Bob\' Sichinga is a Harvard-educated economist with a distinguished record in both Zambia\'s public service and private sector. His ministerial career in the Patriotic Front government included tenures as Minister of Commerce, Trade and Industry and Minister of Agriculture and Livestock — advancing policies promoting mechanised farming, irrigation infrastructure, and agro-processing investment.',
    bio2: 'His conviction is that Zambia\'s agricultural sector — endowed with fertile land, abundant water, and a predominantly rural population — represents the country\'s most reliable pathway to broad-based prosperity. He will pursue a national food security strategy built on smallholder empowerment, post-harvest infrastructure, and agri-processing zones.',
    quote: '"Our farmers feed the nation. It is time the nation fed them back with investment, markets, and dignity."',
    signature: 'Bob Sichinga',
  },
  {
    name: 'John Sangwa, SC',
    role: 'Shadow Minister of Justice & Constitutional Development',
    credentials: 'Senior Counsel · LLB (UNZA) · Advanced Trial Advocacy, NITA (USA) · Founding Partner',
    constituency: 'National',
    focus: 'Constitutional Reform & Rule of Law',
    bio1: 'John Sangwa is widely regarded as one of Zambia\'s foremost constitutional lawyers and public interest advocates. A Senior Counsel of exceptional reputation, he holds an LLB from UNZA and completed advanced training at the National Institute of Trial Advocacy in the United States. As a founding partner and former UNZA Law School lecturer, he has shaped both legal practice and legal education in Zambia for several decades.',
    bio2: 'Sangwa has built a reputation for principled advocacy — publicly challenging constitutional violations by governments of all political persuasions. His deep knowledge of Zambia\'s constitutional framework and the reforms required to strengthen democratic governance make him exceptionally well-suited to lead the Ministry of Justice and Constitutional Development.',
    quote: '"The constitution is the supreme law. No leader — regardless of party — stands above it."',
    signature: 'John Sangwa',
  },
  {
    name: 'Hon. Miles Bwalya Sampa',
    role: 'Shadow Minister of Transport',
    credentials: 'PF President · MP for Matero · Economics Degree · Former Mayor of Lusaka · Former Deputy Commerce Minister',
    constituency: 'Lusaka',
    focus: 'Transport Infrastructure & Urban Mobility',
    bio1: 'Hon. Miles Bwalya Sampa has held some of Zambia\'s most significant political and administrative leadership positions. As Mayor of Lusaka, he managed one of sub-Saharan Africa\'s fastest-growing capital cities, grappling directly with congested road networks, inadequate public transport, deteriorating street infrastructure, and the challenge of planning mobility networks for a rapidly growing city.',
    bio2: 'As President of the Patriotic Front and Member of Parliament for Matero, he continues to engage directly with transport challenges facing urban communities. As Minister of Transport, he will develop a national integrated transport strategy addressing road networks, railway rehabilitation, urban public transport modernisation, and airport infrastructure development.',
    quote: '"Connect our communities and commerce will follow. Infrastructure is not a luxury — it is justice."',
    signature: 'Miles Sampa',
  },
  {
    name: 'Hon. Harry Kalaba',
    role: 'Shadow Minister of International Relations',
    credentials: 'MP for Bahati · Former Minister of Foreign Affairs (2014–2018) · Founder, Citizens First Party · UNZA Graduate',
    constituency: 'Bahati',
    focus: 'Ethical Diplomacy & South-South Cooperation',
    bio1: 'Hon. Harry Kalaba served as Zambia\'s Minister of Foreign Affairs from 2014 to 2018. His 2018 resignation from cabinet — publicly citing concerns about corruption and ethical governance — demonstrated a rare commitment to principle over personal political advancement. A UNZA graduate, he founded the Citizens First Party as a vehicle for politics grounded in ethical governance, anti-corruption, and economic justice.',
    bio2: 'His four years as Foreign Affairs Minister gave him direct experience in diplomatic negotiation, multilateral institution engagement, and the management of Zambia\'s bilateral relationships across Africa and the wider world. As Minister of International Relations, he will pursue an ethical diplomacy agenda advancing Zambia\'s trade and investment partnerships.',
    quote: '"Zambia\'s diplomacy must serve its people — not the interests of those who happen to be in power."',
    signature: 'Harry Kalaba',
  },
  {
    name: 'Dr. Fred M\'membe',
    role: 'Shadow Minister of Communications & Digital Technologies',
    credentials: 'Founder, The Post Newspapers · IPI World Press Hero Award (2000) · DBA, LLM, MA, LLB, Bachelor of Accountancy',
    constituency: 'National',
    focus: 'Digital Transformation & Media Freedom',
    bio1: 'Dr. Fred M\'membe is one of Africa\'s most academically accomplished and publicly known media and political figures. As founder and editor of The Post Newspapers — once Zambia\'s most influential independent newspaper — he led one of the continent\'s most courageous journalistic enterprises and earned the IPI World Press Hero Award in 2000. His credentials span a DBA, LLM in Taxation, MA in Economic Policy Management, LLB, and Bachelor of Accountancy.',
    bio2: 'As President of the Socialist Party, he has articulated a vision centred on economic justice, media freedom, and digital technology as a tool for democratic participation. As Minister of Communications and Digital Technologies, he will lead Zambia\'s digital transformation — expanding broadband infrastructure, bridging the urban-rural digital divide, and developing a regulatory framework that promotes innovation.',
    quote: '"Digital technology is the great equaliser. Every Zambian village deserves the same connectivity as Lusaka\'s CBD."',
    signature: 'Fred M\'membe',
  },
  {
    name: 'Dr. Sishuwa Sishuwa',
    role: 'Shadow Minister of Home Affairs',
    credentials: 'PhD Modern History, University of Oxford · Senior Lecturer, Stellenbosch University · Author',
    constituency: 'National',
    focus: 'Democratic Governance & Social Cohesion',
    bio1: 'Dr. Sishuwa Sishuwa is one of Africa\'s leading academic voices on Zambian politics, governance, and democratic development. He holds a PhD in Modern History from Oxford and serves as a Senior Lecturer at Stellenbosch University. His 2024 book, Party Politics and Populism in Zambia, represents a landmark scholarly contribution to understanding Zambia\'s democratic trajectory.',
    bio2: 'Beyond academia, Dr. Sishuwa has been a consistent and courageous public commentator on Zambian political affairs, challenging abuses of power, documenting electoral irregularities, and advocating for institutional accountability. As Minister of Home Affairs, he will pursue an evidence-based, rights-centred approach encompassing immigration, civil registration, and security sector reform.',
    quote: '"History is the most honest teacher — and Zambia\'s history demands that we build institutions that outlast any one leader."',
    signature: 'Sishuwa Sishuwa',
  },
  {
    name: 'Hon. Sakwiba Sikota, SC',
    role: 'Shadow Minister of Police',
    credentials: 'Senior Counsel · Law and Politics, Keele University · MP for Livingstone (2001–2011) · Founder, Central Chambers',
    constituency: 'Livingstone',
    focus: 'Police Reform & Constitutional Rights',
    bio1: 'Hon. Sakwiba Sikota is a Senior Counsel and founding partner of Central Chambers, with expertise in constitutional law, media law, and commercial litigation. He studied Law and Politics at Keele University in the UK. From 2001 to 2011 he served as Member of Parliament for Livingstone, where he championed tourism development, community rights, and legislative accountability.',
    bio2: 'His specialisation in constitutional and media law — including extensive work on freedom of expression, press freedom, and state accountability — gives him a distinctive perspective on policing. As Minister of Police, he will lead a comprehensive transformation of the Zambia Police Service: professionalising training, establishing accountability mechanisms, and building genuine community policing capacity.',
    quote: '"A police service that upholds constitutional rights is not a weak police service — it is a trusted one."',
    signature: 'Sakwiba Sikota',
  },
  {
    name: 'Kelvin Bwalya Fube (KBF)',
    role: 'Shadow Minister of Correctional & Prison Services',
    credentials: 'Lawyer and Advocate · Founder, \'Zambia Must Prosper\' Agenda · Anti-Corruption Expert',
    constituency: 'National',
    focus: 'Prison Reform & Rehabilitation',
    bio1: 'Kelvin Bwalya Fube — widely known as KBF — is a lawyer, advocate, and political entrepreneur who has spent over a decade building a public platform focused on national renewal, anti-corruption, and economic reform. He launched his \'Zambia Must Prosper\' agenda in 2018 as a grassroots mobilisation effort challenging systemic governance failures.',
    bio2: 'KBF approaches correctional services with a transformative vision: prisons should not merely be places of punishment, but centres for rehabilitation, skills development, and genuine reintegration. As Minister, he will implement a comprehensive prison reform agenda including vocational training, mental health support, educational opportunities, and community partnership frameworks for ex-offenders.',
    quote: '"Rehabilitation is not weakness — it is the most cost-effective crime prevention strategy a government can invest in."',
    signature: 'KBF',
  },
  {
    name: 'Hon. Sean E. Tembo',
    role: 'Shadow Minister of Cooperative Governance & Traditional Affairs',
    credentials: 'PeP President · FCCA, FZICA, MBA · Founder, Enosyst Associates',
    constituency: 'National',
    focus: 'Governance Accountability & Cooperative Management',
    bio1: 'Hon. Sean E. Tembo is the President of the Patriots for Economic Progress (PeP) party and one of Zambia\'s most vocal advocates for fiscal accountability, anti-corruption, and systemic governance reform. He is a Fellow of the Chartered Certified Accountants (FCCA) and a Fellow of the Zambia Institute of Chartered Accountants (FZICA), as well as an MBA holder.',
    bio2: 'As founder of Enosyst Associates, a consulting firm focused on governance and financial advisory services, he has worked with public and private sector organisations on improving accountability systems and strengthening internal controls. As Minister, he will leverage financial expertise to strengthen governance frameworks of Zambia\'s local authorities, cooperatives, and traditional leadership institutions.',
    quote: '"Accountability is not a bureaucratic exercise. It is the foundation of trust between government and citizens."',
    signature: 'Sean Tembo',
  },
  {
    name: 'Hon. Gary Nkombo',
    role: 'Shadow Minister of Basic Education',
    credentials: 'Educator and Politician · MP for Mazabuka Central (2006–2021) · UPND Party Whip · Former Minister of Local Government',
    constituency: 'Mazabuka Central',
    focus: 'Education Reform & Universal Access',
    bio1: 'Hon. Gary Nkombo brings a rare combination of classroom experience and national legislative leadership to the Ministry of Basic Education. A trained educator, he served as Member of Parliament for Mazabuka Central from 2006 to 2021, making him one of Zambia\'s most experienced legislators. He served as the UPND Party Whip, requiring exceptional organisational acumen and the ability to build consensus across diverse political perspectives.',
    bio2: 'Nkombo is a passionate advocate for free, quality education as a fundamental right and the most powerful tool for breaking intergenerational poverty cycles in Zambia. He will implement comprehensive curriculum reform, accelerate school construction in underserved communities, strengthen teacher training, and ensure every Zambian child has access to quality basic education.',
    quote: '"A Zambia that educates every child is a Zambia that can compete with any nation on earth."',
    signature: 'Gary Nkombo',
  },
  {
    name: 'Hon. Highvie Hambulo Hamududu',
    role: 'Shadow Minister of Higher Education & Innovation',
    credentials: 'PNUP President · BA Economics · Former MP and University Lecturer · Parliamentary Budget Committee Chair',
    constituency: 'National',
    focus: 'Higher Education & Knowledge Economy',
    bio1: 'Hon. Highvie Hambulo Hamududu is one of Zambia\'s most respected voices on public finance, economic development, and higher education policy. He holds a BA in Economics and has served both as a university lecturer and as a parliamentarian, bringing academic rigour to legislative debates. As Chair of Zambia\'s Parliamentary Budget Committee, he played a pivotal role in scrutinising government expenditure and fiscal policy proposals.',
    bio2: 'As President of the Party for National Unity and Progress (PNUP), Hamududu has articulated a vision for Zambia\'s economic transformation centred on knowledge, innovation, and human capital. As Minister of Higher Education and Innovation, he will strengthen university-industry partnerships, expand technical and vocational education, increase research funding, and support STEM education at scale.',
    quote: '"Zambia\'s universities must become engines of innovation — generating solutions to Zambian problems."',
    signature: 'Highvie Hamududu',
  },
  {
    name: 'Hon. Christopher C. Kang\'ombe',
    role: 'Shadow Minister of Mineral & Petroleum Resources',
    credentials: 'MA Economic Policy Management · BSc Electrical/Mechanical Engineering · MP for Kamfinsa (2021) · Former Mayor of Kitwe',
    constituency: 'Kamfinsa',
    focus: 'Mineral Resource Governance & Value Addition',
    bio1: 'Hon. Christopher C. Kang\'ombe is a technically accomplished leader whose combination of engineering expertise and economic policy training positions him exceptionally well to steward Zambia\'s vast mineral resources. He holds a BSc in Electrical/Mechanical Engineering and an MA in Economic Policy Management. His tenure as Mayor of Kitwe — the Copperbelt\'s most significant industrial city — gave him practical experience of how mining shapes urban economies and community welfare.',
    bio2: 'As Member of Parliament for Kamfinsa Constituency since 2021, he represents a Copperbelt community whose lives are intimately bound up with the mining industry. As Minister of Mineral and Petroleum Resources, he will develop a comprehensive resource governance strategy maximising Zambia\'s fiscal receipts, ensuring environmental responsibility, promoting local content, and advancing downstream beneficiation of copper and other minerals.',
    quote: '"Zambia\'s mineral wealth must translate into lasting prosperity for its people — not just profits for its extractors."',
    signature: 'Christopher Kang\'ombe',
  },
  {
    name: 'Hon. Kasonde C. Mwenda',
    role: 'Shadow Minister of Environment, Forestry & Fisheries',
    credentials: 'EFF President · BArch, LLB, MPhil Intellectual Property · Author and Activist',
    constituency: 'National',
    focus: 'Environmental Protection & Climate Action',
    bio1: 'Hon. Kasonde C. Mwenda is a uniquely multidisciplinary leader — an architect, lawyer, intellectual property expert, author, and environmental activist — whose diverse intellectual formation gives him an exceptional ability to integrate environmental protection with economic development imperatives. He holds a Bachelor of Architecture, a Bachelor of Laws, and an MPhil in Intellectual Property.',
    bio2: 'As President of the Economic Freedom Fighters (EFF) Zambia, he has articulated a political vision that challenges resource exploitation frameworks failing to deliver genuine benefits to local communities. As Minister of Environment, Forestry and Fisheries, he will advance Zambia\'s climate commitments, strengthen forest conservation, combat illegal logging and wildlife trafficking, and promote community-led natural resource management.',
    quote: '"Zambia\'s ecological heritage is its greatest long-term asset. We cannot afford to trade it for short-term profit."',
    signature: 'Kasonde Mwenda',
  },
  {
    name: 'Hon. Greyford Monde',
    role: 'Shadow Minister of Land Reform',
    credentials: 'PF Mobilization Chairman · BA Economics · Former Minister of Fisheries · MP for Itezhi Tezhi',
    constituency: 'Itezhi Tezhi',
    focus: 'Land Reform & Tenure Security',
    bio1: 'Hon. Greyford Monde brings extensive government experience and deep understanding of rural communities\' land needs to the Ministry of Land Reform. He has served as Member of Parliament for Itezhi Tezhi and as Minister of Fisheries, where he developed practical experience of the nexus between land access, natural resource management, and rural livelihoods. He holds a BA in Economics.',
    bio2: 'Zambia\'s land challenges are deep-seated: a dual tenure system creates confusion between statutory and customary land rights, and smallholder farmers frequently lack secure tenure over the land they depend on. As Minister of Land Reform, Monde will pursue equitable land access, systematic land registration, transparent allocation processes, and the strengthening of traditional land governance systems.',
    quote: '"Secure land rights are the foundation of smallholder prosperity. Without them, no agricultural policy will succeed."',
    signature: 'Greyford Monde',
  },
  {
    name: 'John Kapila',
    role: 'Shadow Minister of Defence & Military Veterans',
    credentials: 'Strategic Leadership · Resource Management · National Security Expert',
    constituency: 'National',
    focus: 'Defence Modernisation & Veterans\' Welfare',
    bio1: 'John Kapila is a dynamic leader whose professional background in strategic leadership, resource management, and organisational development equips him to provide civilian oversight of Zambia\'s defence establishment with fresh energy and reform-oriented vision. His experience in managing complex organisations and building high-performance institutional cultures translates directly to the challenges of modernising the Zambia Defence Force.',
    bio2: 'Kapila brings an entrepreneurial perspective to the defence portfolio — one that values efficiency, clear accountability, outcomes-based management, and the welfare of personnel. As Minister of Defence and Military Veterans, he will prioritise a comprehensive welfare programme for Zambia\'s military veterans, develop structured skills transfer pathways for retiring service members, and advance the modernisation of defence capabilities.',
    quote: '"Those who served Zambia in uniform deserve a nation that serves them in return."',
    signature: 'John Kapila',
  },
  {
    name: 'Sililo Mwala',
    role: 'Shadow Minister of Public Works & Infrastructure',
    credentials: 'Graduate, Lusaka Open University · Sustainable Construction and Urban Planning',
    constituency: 'National',
    focus: 'Sustainable Infrastructure & Local Employment',
    bio1: 'Sililo Mwala brings a grounded, community-centred perspective to infrastructure development — one that prioritises transparency, environmental sustainability, and the creation of local employment opportunities through construction and public works programmes. A graduate of Lusaka Open University, he has developed expertise in sustainable construction practices and urban planning principles.',
    bio2: 'His approach is fundamentally pragmatic: infrastructure projects must be managed transparently to ensure value for public money, construction must maximise local employment and skills transfer, and built infrastructure must be maintained to deliver sustained economic benefits. As Minister of Public Works, he will oversee Zambia\'s infrastructure portfolio with an emphasis on transparent project management and climate-resilient construction standards.',
    quote: '"Every kwacha spent on infrastructure must create a Zambian job, use a Zambian material, and build a lasting asset."',
    signature: 'Sililo Mwala',
  },
  {
    name: 'Hon. Given Lubinda',
    role: 'Shadow Minister of Water & Sanitation',
    credentials: 'National Institute of Public Administration (NIPA) · Charter in Marketing (CIM) · Water Sector Development Expert',
    constituency: 'National',
    focus: 'Water Security & Sanitation Access',
    bio1: 'Hon. Given Lubinda combines public administration expertise with a deep commitment to equitable access to water and sanitation — services whose absence condemns communities to preventable disease, economic marginalisation, and diminished human dignity. His educational background at the National Institute of Public Administration and Charter in Marketing from CIM equip him to manage complex public service delivery systems.',
    bio2: 'Zambia\'s water and sanitation sector faces profound challenges: significant portions of the rural population lack access to safe drinking water, urban sanitation systems are overwhelmed by population growth, and climate variability is threatening water security. As Minister, he will champion a national water security strategy including accelerated rural water point construction, urban sanitation modernisation, and water utility governance reform.',
    quote: '"Access to safe water is not a development aspiration — it is a constitutional right and a human necessity."',
    signature: 'Given Lubinda',
  },
  {
    name: 'Hon. Binwell Chansa Mpundu',
    role: 'Shadow Minister of Sports, Arts & Culture',
    credentials: 'Independent MP for Nkana · Former Kitwe District Commissioner (2017–2020) · Businessman and Youth Advocate',
    constituency: 'Nkana',
    focus: 'Creative Economy & Cultural Heritage',
    bio1: 'Hon. Binwell Chansa Mpundu serves as Independent Member of Parliament for Nkana Constituency, bringing an independent, community-first perspective to national politics. His earlier service as Kitwe District Commissioner from 2017 to 2020 gave him executive experience in local government administration, including the management of cultural and sports facilities, community events, and youth development programmes.',
    bio2: 'As a businessman and youth advocate, Mpundu understands the economic potential of the creative and sports industries. He recognises that Zambia\'s extraordinary cultural heritage — spanning 73 ethnic groups, rich musical traditions, visual arts, crafts, and cultural festivals — represents both an intrinsic national treasure and an underutilised economic asset. As Minister, he will develop a national strategy to harness the power of sport, arts, and culture.',
    quote: '"Zambia\'s culture is not a soft asset — it is an economic engine waiting to be ignited."',
    signature: 'Binwell Mpundu',
  },
  {
    name: 'Hon. Franklyn Luando',
    role: 'Minister in the Presidency — Planning, Monitoring & Evaluation',
    credentials: 'FCCA and FCMA · Founder, F.C.L Accountancy Tuition Centre · Financial Strategy Expert',
    constituency: 'National',
    focus: 'Government Performance & Accountability',
    bio1: 'Hon. Franklyn Luando is a dual Fellow — holding both the Fellowship of the Chartered Certified Accountants (FCCA) and the Fellowship of the Chartered Institute of Management Accountants (FCMA) — placing him among the most technically qualified financial professionals in Zambia. As founder of F.C.L Accountancy Tuition Centre, he has invested in developing the next generation of Zambian financial professionals.',
    bio2: 'In the Office of the Presidency, Luando will serve as the engine of government performance — designing and implementing the national development planning framework, establishing robust monitoring and evaluation systems for all government programmes, driving evidence-based decision-making across ministries, and ensuring that ministerial commitments translate into measurable outcomes for Zambian citizens.',
    quote: '"What gets measured gets managed. Zambia\'s government must be as accountable to results as it is to voters."',
    signature: 'Franklyn Luando',
  },
  {
    name: 'Hon. Kanyanta Chanda Kapwepwe',
    role: 'Shadow Minister of Small Business Development',
    credentials: 'Lecturer, Cape Peninsula University of Technology · Former Executive, Graca Machel Trust · MBA, LLB, ACCA',
    constituency: 'National',
    focus: 'SME Development & Entrepreneurship',
    bio1: 'Hon. Kanyanta Chanda Kapwepwe is a multi-disciplinary professional whose career intersects law, business, academia, and international development. Currently lecturing at the Cape Peninsula University of Technology in South Africa, she holds an MBA, a Bachelor of Laws (LLB), and ACCA professional qualifications — a combination equipping her to design legally robust business support frameworks.',
    bio2: 'Executive roles at the Graca Machel Trust and Habitat for Humanity gave her frontline experience in community-centred economic development, women\'s enterprise empowerment, and sustainable livelihoods programming across sub-Saharan Africa. As Minister, she will implement a national SME support ecosystem including simplified business registration, innovative financing vehicles, mentorship networks, and dedicated industrial parks.',
    quote: '"Every entrepreneur who fails due to red tape is a job Zambia never created. That is the real cost of bad policy."',
    signature: 'Kanyanta Kapwepwe',
  },
];

const STATS = [
  { value: '10',  unit: 'Provinces', label: 'Represented by BOZ candidates' },
  { value: '226', unit: 'Seats',     label: 'Parliamentary constituencies targeted' },
  { value: '23',  unit: '',          label: 'Male shadow cabinet members' },
  { value: '1st', unit: '',          label: 'Party with full parity commitment' },
];

const ACTION_CARDS = [
  { icon: Heart, title: 'Make Donation',   desc: 'Support our male candidates by donating to their constituency campaigns. Every kwacha makes a direct difference on the ground.', path: '/contact' },
  { icon: Users, title: 'Campaign Events', desc: 'Join us at rallies, community meetings, and hustings across all ten provinces as our candidates take their message to the people.', path: '/contact' },
  { icon: Leaf,  title: 'Join Volunteer',  desc: 'Join our team of campaign volunteers and help make a positive impact in your constituency today.', path: '/contact' },
];

// ── Redaction helpers ─────────────────────────────────────────────────────────
// All shadow ministers except the Presidential Candidate (index 0) are pending
// formal confirmation. Their identities are redacted until officially announced.

const REDACTED_PHOTO = (
  <div className="w-full h-full flex flex-col items-center justify-center" style={{ backgroundColor: '#111', gap: '12px' }}>
    <svg viewBox="0 0 80 80" width="60" height="60" fill="none">
      <circle cx="40" cy="28" r="18" fill="#333" />
      <ellipse cx="40" cy="72" rx="30" ry="18" fill="#333" />
    </svg>
    <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: '10px', letterSpacing: '0.12em', color: '#444' }}>IDENTITY PENDING</span>
  </div>
);

function RedactedName() {
  return (
    <span className="inline-flex flex-col gap-1.5" aria-label="Redacted">
      <span style={{ display: 'inline-block', width: '120px', height: '14px', backgroundColor: '#1a1a1a', borderRadius: '3px' }} />
      <span style={{ display: 'inline-block', width: '80px', height: '14px', backgroundColor: '#1a1a1a', borderRadius: '3px' }} />
    </span>
  );
}

function GeometricFrame({ img, name, redacted = false }: { img: string; name: string; redacted?: boolean }) {
  return (
    <div className="relative flex items-center justify-center" style={{ width: '100%', maxWidth: '460px', minHeight: '540px' }}>
      <svg viewBox="0 0 480 560" className="absolute inset-0 w-full h-full" style={{ zIndex: 0 }} aria-hidden>
        <polygon points="60,40 420,40 480,480 240,560 0,480" fill={O} opacity="0.92" />
        <polygon points="180,120 300,120 360,420 240,480 120,420" fill={NAVY} opacity="0.6" />
        <line x1="30" y1="20" x2="200" y2="20" stroke={O} strokeWidth="4" opacity="0.7" />
        <line x1="30" y1="20" x2="30" y2="80" stroke={O} strokeWidth="4" opacity="0.7" />
        <line x1="450" y1="20" x2="280" y2="20" stroke={O} strokeWidth="4" opacity="0.7" />
        <line x1="450" y1="20" x2="450" y2="80" stroke={O} strokeWidth="4" opacity="0.7" />
      </svg>
      <div
        className="relative overflow-hidden"
        style={{ zIndex: 1, width: '72%', height: '510px', clipPath: 'polygon(15% 0%, 85% 0%, 100% 85%, 50% 100%, 0% 85%)' }}
      >
        {redacted ? REDACTED_PHOTO : <img src={img} alt={name} className="w-full h-full object-cover" style={{ objectPosition: 'center 15%' }} />}
      </div>
    </div>
  );
}

function SmallGeometry({ img, name, redacted = false }: { img: string; name: string; redacted?: boolean }) {
  return (
    <div className="relative flex items-center justify-center" style={{ height: '260px' }}>
      <svg viewBox="0 0 300 260" className="absolute inset-0 w-full h-full" aria-hidden>
        <polygon points="30,10 270,10 300,240 150,260 0,240" fill={O} opacity="0.85" />
        <polygon points="90,60 210,60 240,220 150,240 60,220" fill={NAVY} opacity="0.55" />
      </svg>
      <div className="relative overflow-hidden" style={{ zIndex: 1, width: '65%', height: '230px', clipPath: 'polygon(15% 0%, 85% 0%, 100% 85%, 50% 100%, 0% 85%)' }}>
        {redacted ? REDACTED_PHOTO : <img src={img} alt={name} className="w-full h-full object-cover" style={{ objectPosition: 'center 15%' }} />}
      </div>
    </div>
  );
}

function LiveCandidatePhoto({ id, name }: { id: string; name: string }) {
  const [imgError, setImgError] = useState(false);
  return (
    <div className="w-full aspect-[4/5] overflow-hidden bg-gray-100">
      {!imgError ? (
        <img
          src={candidatesApi.photoUrl(id)}
          alt={name}
          onError={() => setImgError(true)}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center" style={{ color: '#d1d5db' }}>
          <Users className="w-12 h-12" />
        </div>
      )}
    </div>
  );
}

export function MaleCandidatesPage() {
  const [featuredIdx, setFeaturedIdx] = useState(0);
  const [animating, setAnimating]     = useState(false);
  const [liveCandidates, setLiveCandidates] = useState<BackendCandidate[]>([]);

  useEffect(() => {
    candidatesApi.list({ gender: 'male', active: true })
      .then(res => setLiveCandidates(res.candidates))
      .catch(() => setLiveCandidates([]));
  }, []);

  const go = (next: number) => {
    if (animating) return;
    setAnimating(true);
    setTimeout(() => {
      setFeaturedIdx((next + CANDIDATES.length) % CANDIDATES.length);
      setAnimating(false);
    }, 300);
  };

  useEffect(() => {
    const t = setInterval(() => go(featuredIdx + 1), 6000);
    return () => clearInterval(t);
  }, [featuredIdx]);

  const c = CANDIDATES[featuredIdx];
  const img = REAL_PHOTOS[featuredIdx] ?? PHOTOS[featuredIdx % PHOTOS.length];
  // Only index 0 (Vincent Kafula) is publicly confirmed — all others pending formal acceptance
  const isRedacted = (idx: number) => idx !== 0;

  return (
    <div style={{ backgroundColor: '#fafafa', fontFamily: 'Open Sans, sans-serif', color: NAVY }}>

      {/* Hero header */}
      <section className="relative py-16 px-4 text-center overflow-hidden" style={{ background: 'linear-gradient(135deg, #007A30 0%, #006B28 40%, #1a0000 100%)' }}>
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `radial-gradient(circle at 50% 40%, ${O} 0%, transparent 60%)` }} />
        <div className="relative max-w-4xl mx-auto">
          <p className="text-xs tracking-widest mb-4" style={{ color: O, fontFamily: 'Oswald, sans-serif' }}>BUILD ONE ZAMBIA · SHADOW GOVERNMENT CABINET 2026–2031</p>
          <h1 className="mb-4" style={{ fontFamily: 'Oswald, sans-serif', fontSize: 'clamp(2.2rem, 5vw, 4rem)', lineHeight: 1.1, letterSpacing: '0.03em', color: '#fff' }}>
            MALE <span style={{ color: O }}>CANDIDATES</span>
          </h1>
          <p style={{ color: '#9ca3af', fontSize: '1rem', lineHeight: 1.8, maxWidth: '560px', margin: '0 auto' }}>
            Meet the men of Build One Zambia's Shadow Government Cabinet — experienced, visionary, and committed to a better Zambia.
          </p>
        </div>
      </section>

      {/* ── ROTATING FEATURED CANDIDATE ─────────────────────────── */}
      <section className="py-20 px-4" style={{ backgroundColor: '#fff' }}>
        <div className="max-w-6xl mx-auto">

          {/* Section label + controls */}
          <div className="flex items-center justify-between mb-12 flex-wrap gap-4">
            <div>
              <p className="text-xs tracking-widest mb-1" style={{ color: O, fontFamily: 'Oswald, sans-serif' }}>ABOUT THE CANDIDATE</p>
              <h2 style={{ fontFamily: 'Oswald, sans-serif', fontSize: 'clamp(1.4rem, 3vw, 2rem)', letterSpacing: '0.03em', color: NAVY }}>
                IN THEIR OWN WORDS
              </h2>
            </div>

            {/* Prev / Next + counter */}
            <div className="flex items-center gap-3">
              <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: '13px', color: '#9ca3af', letterSpacing: '0.08em' }}>
                {String(featuredIdx + 1).padStart(2, '0')} / {String(CANDIDATES.length).padStart(2, '0')}
              </span>
              <button
                onClick={() => go(featuredIdx - 1)}
                className="w-10 h-10 flex items-center justify-center rounded-full transition-colors"
                style={{ border: `2px solid ${O}`, color: O, backgroundColor: 'transparent' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = O; (e.currentTarget as HTMLElement).style.color = '#fff'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; (e.currentTarget as HTMLElement).style.color = O; }}
                aria-label="Previous candidate"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => go(featuredIdx + 1)}
                className="w-10 h-10 flex items-center justify-center rounded-full transition-colors"
                style={{ border: `2px solid ${O}`, color: O, backgroundColor: 'transparent' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = O; (e.currentTarget as HTMLElement).style.color = '#fff'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; (e.currentTarget as HTMLElement).style.color = O; }}
                aria-label="Next candidate"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Candidate content — fades between candidates */}
          <div
            className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center transition-opacity duration-300"
            style={{ opacity: animating ? 0 : 1 }}
          >
            {/* Geometric photo frame */}
            <div className="flex justify-center">
              <GeometricFrame img={img} name={c.name} redacted={isRedacted(featuredIdx)} />
            </div>

            {/* Text */}
            <div>
              <span
                className="inline-block text-xs px-3 py-1 rounded-full mb-5"
                style={{ backgroundColor: `rgba(249,115,22,0.1)`, color: O, fontFamily: 'Oswald, sans-serif', letterSpacing: '0.08em' }}
              >
                {c.constituency}
              </span>
              <h3 className="mb-1" style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(1.6rem, 3vw, 2.4rem)', lineHeight: 1.2, color: NAVY }}>
                {isRedacted(featuredIdx) ? <RedactedName /> : c.name}
              </h3>
              <p className="mb-1 text-sm" style={{ color: O, fontFamily: 'Oswald, sans-serif', letterSpacing: '0.06em' }}>{c.role}</p>
              <p className="mb-6 text-xs italic" style={{ color: '#9ca3af' }}>
                {isRedacted(featuredIdx) ? 'Identity pending formal confirmation — to be announced' : c.credentials}
              </p>
              {isRedacted(featuredIdx) ? (
                <div className="mb-8 p-5 rounded-xl" style={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb' }}>
                  <p style={{ fontSize: '0.9rem', color: '#6b7280', lineHeight: 1.8, fontStyle: 'italic' }}>
                    This individual has been identified by the founders of Build One Zambia as a prospective shadow minister. Their full profile will be published upon formal confirmation of their participation.
                  </p>
                </div>
              ) : (
                <>
                  <p className="mb-4 leading-relaxed" style={{ color: '#4b5563', fontSize: '0.95rem' }}>{c.bio1}</p>
                  <p className="mb-8 leading-relaxed" style={{ color: '#4b5563', fontSize: '0.95rem' }}>{c.bio2}</p>
                  <blockquote className="mb-8 pl-5 py-1" style={{ borderLeft: `4px solid ${O}` }}>
                    <p style={{ fontFamily: 'Georgia, serif', fontSize: '1rem', color: NAVY, lineHeight: 1.75 }}>{c.quote}</p>
                  </blockquote>
                </>
              )}
              <div className="flex items-center justify-between flex-wrap gap-6">
                <div>
                  <p style={{ fontFamily: 'Oswald, sans-serif', fontSize: '1.1rem', color: O, letterSpacing: '0.04em' }}>
                    {isRedacted(featuredIdx) ? <RedactedName /> : c.name}
                  </p>
                  <p className="text-sm mt-1" style={{ color: '#6b7280' }}>{c.focus}</p>
                </div>
                {!isRedacted(featuredIdx) && (
                  <p style={{ fontFamily: 'Dancing Script, cursive', fontSize: '2rem', color: NAVY, opacity: 0.55 }}>{c.signature}</p>
                )}
              </div>
            </div>
          </div>

          {/* Dot indicators */}
          <div className="flex justify-center gap-2 mt-12 flex-wrap">
            {CANDIDATES.map((_, i) => (
              <button
                key={i}
                onClick={() => go(i)}
                className="rounded-full transition-all duration-300"
                style={{ width: i === featuredIdx ? '28px' : '8px', height: '8px', backgroundColor: i === featuredIdx ? O : '#e5e7eb', border: 'none', cursor: 'pointer' }}
                aria-label={`Candidate ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Stats band */}
      <section className="relative py-16 px-4 overflow-hidden" style={{ background: `linear-gradient(90deg, ${O} 0%, ${R} 100%)` }}>
        <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 1200 200" preserveAspectRatio="none" aria-hidden>
          <polygon points="0,0 200,80 100,200 0,160" fill="none" stroke="#fff" strokeWidth="1" />
          <polygon points="200,0 400,100 300,200 100,80" fill="none" stroke="#fff" strokeWidth="1" />
          <polygon points="400,0 600,80 500,200 300,100" fill="none" stroke="#fff" strokeWidth="1" />
          <polygon points="600,0 800,100 700,200 500,80" fill="none" stroke="#fff" strokeWidth="1" />
          <polygon points="800,0 1000,80 900,200 700,100" fill="none" stroke="#fff" strokeWidth="1" />
          <polygon points="1000,0 1200,100 1100,200 900,80" fill="none" stroke="#fff" strokeWidth="1" />
        </svg>
        <div className="relative max-w-5xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-0">
          {STATS.map((s, i) => (
            <div key={s.label} className="flex flex-col items-center text-center py-6 px-4" style={{ borderRight: i < STATS.length - 1 ? '1px solid rgba(255,255,255,0.3)' : 'none' }}>
              <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 'clamp(2.5rem, 5vw, 3.5rem)', color: '#fff', lineHeight: 1 }}>
                {s.value}<span style={{ fontSize: '0.55em', marginLeft: '2px' }}>{s.unit}</span>
              </div>
              <p className="mt-3 text-sm leading-snug" style={{ color: 'rgba(255,255,255,0.85)' }}>{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Action cards */}
      <section className="py-20 px-4" style={{ backgroundColor: '#f8f8f8' }}>
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {ACTION_CARDS.map(card => (
            <Link key={card.title} to={card.path}
              className="group flex flex-col items-center text-center p-8 rounded-2xl transition-all"
              style={{ backgroundColor: '#fff', boxShadow: '0 4px 24px rgba(0,0,0,0.07)', border: '1px solid #f0f0f0', textDecoration: 'none' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 40px rgba(249,115,22,0.18)`}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 24px rgba(0,0,0,0.07)'}
            >
              <div className="relative mb-6">
                <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ border: `2px solid ${O}` }}>
                  <card.icon className="w-8 h-8" style={{ color: O }} />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full" style={{ backgroundColor: O }} />
              </div>
              <h3 className="mb-3" style={{ fontFamily: 'Oswald, sans-serif', fontSize: '1.2rem', letterSpacing: '0.04em', color: NAVY }}>{card.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: '#6b7280' }}>{card.desc}</p>
              <div className="mt-5 flex items-center gap-1 text-xs" style={{ color: O, fontFamily: 'Oswald, sans-serif', letterSpacing: '0.08em' }}>
                LEARN MORE <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Candidate grid */}
      <section className="py-20 px-4" style={{ backgroundColor: '#fff' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs tracking-widest mb-3" style={{ color: O, fontFamily: 'Oswald, sans-serif' }}>SHADOW CABINET</p>
            <h2 style={{ fontFamily: 'Oswald, sans-serif', fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', letterSpacing: '0.03em', color: NAVY }}>MEET ALL CANDIDATES</h2>
            <div className="w-16 h-1 mx-auto mt-4 rounded-full" style={{ backgroundColor: O }} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {CANDIDATES.map((cand, i) => (
              <div key={cand.name}
                className="group flex flex-col items-center text-center rounded-2xl overflow-hidden transition-all cursor-pointer"
                style={{ backgroundColor: i === featuredIdx ? `rgba(249,115,22,0.05)` : '#fafafa', border: `1px solid ${i === featuredIdx ? O : '#f0f0f0'}`, boxShadow: '0 2px 16px rgba(0,0,0,0.05)' }}
                onClick={() => go(i)}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 40px rgba(249,115,22,0.15)`}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 16px rgba(0,0,0,0.05)'}
              >
                <div className="w-full pt-6 px-6">
                  <SmallGeometry img={REAL_PHOTOS[i] ?? CARD_PHOTOS[i % CARD_PHOTOS.length]} name={cand.name} redacted={isRedacted(i)} />
                </div>
                <div className="px-6 pb-8 pt-2 w-full">
                  <span className="inline-block text-xs px-3 py-1 rounded-full mb-3" style={{ backgroundColor: 'rgba(249,115,22,0.1)', color: O, fontFamily: 'Oswald, sans-serif', letterSpacing: '0.06em' }}>
                    {cand.constituency}
                  </span>
                  <h3 className="mb-1" style={{ fontFamily: 'Oswald, sans-serif', fontSize: '1.05rem', letterSpacing: '0.04em', color: NAVY }}>
                    {isRedacted(i) ? <RedactedName /> : cand.name}
                  </h3>
                  <p className="text-xs mb-3" style={{ color: '#9ca3af' }}>{isRedacted(i) ? 'Pending confirmation' : cand.role}</p>
                  <div className="flex items-center justify-center gap-2 text-xs" style={{ color: O }}>
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span style={{ fontFamily: 'Oswald, sans-serif', letterSpacing: '0.06em' }}>{cand.focus}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Live candidates from Admin Panel */}
      {liveCandidates.length > 0 && (
        <section className="py-20 px-4" style={{ backgroundColor: '#fafafa' }}>
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-14">
              <p className="text-xs tracking-widest mb-3" style={{ color: O, fontFamily: 'Oswald, sans-serif' }}>ADDITIONAL CANDIDATES</p>
              <h2 style={{ fontFamily: 'Oswald, sans-serif', fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', letterSpacing: '0.03em', color: NAVY }}>MORE MALE CANDIDATES</h2>
              <div className="w-16 h-1 mx-auto mt-4 rounded-full" style={{ backgroundColor: O }} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
              {liveCandidates.map(c => (
                <div key={c.id} className="group flex flex-col items-center text-center rounded-2xl overflow-hidden"
                  style={{ backgroundColor: '#fff', border: '1px solid #f0f0f0', boxShadow: '0 2px 16px rgba(0,0,0,0.05)' }}>
                  <LiveCandidatePhoto id={c.id} name={c.name} />
                  <div className="px-6 pb-8 pt-5 w-full">
                    {c.scopeName && (
                      <span className="inline-block text-xs px-3 py-1 rounded-full mb-3" style={{ backgroundColor: 'rgba(249,115,22,0.1)', color: O, fontFamily: 'Oswald, sans-serif', letterSpacing: '0.06em' }}>
                        {c.scopeName}
                      </span>
                    )}
                    <h3 className="mb-1" style={{ fontFamily: 'Oswald, sans-serif', fontSize: '1.05rem', letterSpacing: '0.04em', color: NAVY }}>{c.name}</h3>
                    {c.title && <p className="text-xs mb-3" style={{ color: '#9ca3af' }}>{c.title}</p>}
                    {c.bio && <p className="text-xs leading-relaxed" style={{ color: '#6b7280' }}>{c.bio.slice(0, 140)}{c.bio.length > 140 ? '…' : ''}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-16 px-4 text-center" style={{ background: `linear-gradient(135deg, ${O} 0%, ${R} 100%)` }}>
        <div className="max-w-2xl mx-auto">
          <p className="text-xs tracking-widest mb-3" style={{ color: 'rgba(255,255,255,0.75)', fontFamily: 'Oswald, sans-serif' }}>GET INVOLVED</p>
          <h2 className="mb-4" style={{ fontFamily: 'Oswald, sans-serif', fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', letterSpacing: '0.03em', color: '#fff' }}>STAND BEHIND YOUR CANDIDATE</h2>
          <p className="mb-8 text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.85)' }}>
            Volunteer, donate, or simply spread the word. Every act of support brings Zambia one step closer to the change it deserves.
          </p>
          <Link to="/register/member" className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full transition-all"
            style={{ fontFamily: 'Oswald, sans-serif', fontSize: '13px', letterSpacing: '0.12em', backgroundColor: '#fff', color: O, textDecoration: 'none' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = NAVY; (e.currentTarget as HTMLElement).style.color = '#fff'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#fff'; (e.currentTarget as HTMLElement).style.color = O; }}
          >
            JOIN THE MOVEMENT <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

    </div>
  );
}
