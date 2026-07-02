import { useState, useEffect } from 'react';
import { Heart, Users, Leaf, ArrowRight, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router';
import { candidatesApi, shadowCabinetApi, type BackendCandidate, type ShadowMember } from '../../lib/api';
import chilesheKapwepwePhoto from '../../../imports/Chileshe.png';
import mwituaMushibwePhoto from '../../../imports/image-26.png';
import margaretMwanakatwePhoto from '../../../imports/image-27.png';
import dolikaBandaPhoto from '../../../imports/Dolika_Banda.jpg';
import chishalaKatekaPhoto from '../../../imports/Chishala_Kateka.jpg';
import nkanduLuoPhoto from '../../../imports/Nkandu_Luo.jpg';
import tasilaLunguPhoto from '../../../imports/Mrs_Tasila_Lungu-Mwansa_2.jpg';
import saboiImboelaPhoto from '../../../imports/Saboi_Imboela-1.jpg';
import doraSiliyaPhoto from '../../../imports/Dora-1.jpeg';
import kampambaMulengaPhoto from '../../../imports/kampamba_mulenga.jpg';

// Real photos keyed by candidate index (0-based)
const REAL_PHOTOS: Record<number, string> = {
  0: tasilaLunguPhoto,
  1: chilesheKapwepwePhoto,
  2: dolikaBandaPhoto,
  3: nkanduLuoPhoto,
  4: saboiImboelaPhoto,
  5: kampambaMulengaPhoto,
  6: doraSiliyaPhoto,
  7: chishalaKatekaPhoto,
  8: margaretMwanakatwePhoto,
  9: mwituaMushibwePhoto,
};

const O    = '#e8621a';
const R    = '#ef4444';
const NAVY = '#1e2d4a';

const PHOTOS1 = [
  'https://images.unsplash.com/photo-1637589267610-6c66fc2a086b?w=600&h=380&fit=crop&auto=format&q=90',
  'https://images.unsplash.com/photo-1696960190591-60d693f4d50d?w=600&h=380&fit=crop&auto=format&q=90',
  'https://images.unsplash.com/photo-1616065297556-f05bc00c9a3e?w=600&h=380&fit=crop&auto=format&q=90',
  'https://images.unsplash.com/photo-1581065178047-8ee15951ede6?w=600&h=380&fit=crop&auto=format&q=90',
  'https://images.unsplash.com/photo-1665224752136-4dbe2dfc8195?w=600&h=380&fit=crop&auto=format&q=90',
  'https://images.unsplash.com/photo-1582896911227-c966f6e7fb93?w=600&h=380&fit=crop&auto=format&q=90',
];

const PHOTOS2 = [
  'https://images.unsplash.com/photo-1696960190591-60d693f4d50d?w=600&h=380&fit=crop&auto=format&q=90',
  'https://images.unsplash.com/photo-1665224752136-4dbe2dfc8195?w=600&h=380&fit=crop&auto=format&q=90',
  'https://images.unsplash.com/photo-1582896911227-c966f6e7fb93?w=600&h=380&fit=crop&auto=format&q=90',
  'https://images.unsplash.com/photo-1637589267610-6c66fc2a086b?w=600&h=380&fit=crop&auto=format&q=90',
  'https://images.unsplash.com/photo-1616065297556-f05bc00c9a3e?w=600&h=380&fit=crop&auto=format&q=90',
  'https://images.unsplash.com/photo-1581065178047-8ee15951ede6?w=600&h=380&fit=crop&auto=format&q=90',
];

const CARD_PHOTOS = [
  'https://images.unsplash.com/photo-1637589267610-6c66fc2a086b?w=400&h=480&fit=crop&auto=format&q=90',
  'https://images.unsplash.com/photo-1696960190591-60d693f4d50d?w=400&h=480&fit=crop&auto=format&q=90',
  'https://images.unsplash.com/photo-1616065297556-f05bc00c9a3e?w=400&h=480&fit=crop&auto=format&q=90',
  'https://images.unsplash.com/photo-1581065178047-8ee15951ede6?w=400&h=480&fit=crop&auto=format&q=90',
  'https://images.unsplash.com/photo-1665224752136-4dbe2dfc8195?w=400&h=480&fit=crop&auto=format&q=90',
  'https://images.unsplash.com/photo-1582896911227-c966f6e7fb93?w=400&h=480&fit=crop&auto=format&q=90',
];

// All female shadow ministers are pending formal confirmation — identities redacted until announced
const REDACTED_PHOTO_F = (
  <div className="w-full h-full flex flex-col items-center justify-center" style={{ backgroundColor: '#111', gap: '12px' }}>
    <svg viewBox="0 0 80 80" width="60" height="60" fill="none">
      <circle cx="40" cy="28" r="18" fill="#333" />
      <ellipse cx="40" cy="72" rx="30" ry="18" fill="#333" />
    </svg>
    <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: '10px', letterSpacing: '0.12em', color: '#444' }}>IDENTITY PENDING</span>
  </div>
);

function RedactedNameF() {
  return (
    <span className="inline-flex flex-col gap-1.5" aria-label="Redacted">
      <span style={{ display: 'inline-block', width: '120px', height: '14px', backgroundColor: '#1a1a1a', borderRadius: '3px' }} />
      <span style={{ display: 'inline-block', width: '80px', height: '14px', backgroundColor: '#1a1a1a', borderRadius: '3px' }} />
    </span>
  );
}

const CANDIDATES = [
  {
    name: 'Hon. Tasila Lungu Mwansa',
    role: 'Vice Presidential Candidate — Build One Zambia',
    credentials: 'MP for Chawama (2021) · PF Chairperson Chawama · Nkoloma Ward Councillor (2016)',
    constituency: 'National',
    focus: 'Inclusive Governance & Community Leadership',
    headline: 'Zambia\'s future depends on ensuring every voice — especially women, youth, and the marginalised — is heard at the decision-making table.',
    bio1: 'Hon. Tasila Lungu Mwansa was born on 10 May 1983 and has distinguished herself as one of Zambia\'s most dynamic and compassionate political figures. Her political career began at the grassroots level as Nkoloma Ward Councillor in 2016, before she won the parliamentary seat for Chawama in the 2021 general elections — a constituency with one of the highest population densities in Lusaka, facing persistent challenges of unemployment, infrastructure deficits, and social inequality.',
    bio2: 'Beyond politics, Tasila is a committed philanthropist whose charitable work spans education access, women\'s empowerment, and youth development. Her blend of empathy, legislative experience, and grassroots credibility make her an ideal partner to the presidential candidate. As Vice President, she will serve as a strong advocate for inclusive governance.',
    quote: '"Inclusive governance is not a preference — it is the only governance model that actually works for all Zambians."',
    signature: 'Tasila Lungu Mwansa',
  },
  {
    name: 'H.E. Chileshe Mpundu Kapwepwe',
    role: 'Shadow Minister of Finance',
    credentials: 'Secretary-General, COMESA · Former IMF Executive Director · MBA, FCCA',
    constituency: 'National',
    focus: 'Fiscal Discipline & Macroeconomic Stability',
    headline: 'Zambia\'s fiscal credibility must be rebuilt through disciplined frameworks, sustainable debt resolution, and strengthened revenue mobilisation.',
    bio1: 'H.E. Chileshe Mpundu Kapwepwe is one of Africa\'s most respected figures in international economic governance. She has built a distinguished career spanning Zambia\'s national treasury, international financial institutions, and pan-African economic integration. She served as Deputy Minister of Finance in Zambia and as an IMF Executive Director — representing Africa\'s interests at the world\'s premier international monetary institution.',
    bio2: 'As Secretary-General of COMESA, she has championed regional trade integration, digital financial systems, and the harmonisation of investment policies across 21 member states. She holds an MBA and is a Fellow of the Chartered Certified Accountants (FCCA), and was named one of Africa\'s Most Influential Women in 2023. As Minister of Finance, she will implement disciplined fiscal frameworks and pursue sustainable debt resolution.',
    quote: '"Zambia cannot grow its way out of poverty without first establishing the fiscal credibility that attracts investment."',
    signature: 'Chileshe M. Kapwepwe',
  },
  {
    name: 'Dr. Dolika Banda',
    role: 'Shadow Minister of Trade, Industry & Economic Development',
    credentials: 'Former CEO, African Risk Capacity Insurance Ltd · Africa Regional Director, British International Investment · MBA',
    constituency: 'National',
    focus: 'AfCFTA Integration & Industrial Development',
    headline: 'Zambia\'s raw commodities must be transformed into finished products — creating jobs, adding value, and building lasting economic strength.',
    bio1: 'Dr. Dolika Banda brings over 36 years of experience in global finance, development economics, and business leadership. As former CEO of African Risk Capacity Insurance Limited — a specialised agency of the African Union — she led the development of innovative sovereign risk insurance mechanisms protecting African nations against climate-related agricultural losses.',
    bio2: 'As Africa Regional Director for British International Investment, she managed a substantial portfolio of investments across multiple African markets, focusing on job-creating businesses in financial services, manufacturing, and agri-processing. She also served as Chair of Standard Chartered Bank Zambia\'s Board. As Minister of Trade, she will spearhead Zambia\'s AfCFTA integration strategy and build industrial clusters that add value to raw commodities.',
    quote: '"Every tonne of copper that leaves Zambia unprocessed is a Zambian job that was never created."',
    signature: 'Dolika Banda',
  },
  {
    name: 'Prof. Nkandu Luo',
    role: 'Shadow Minister of Health',
    credentials: 'Over 40 Years in Health & Research · Pioneer of Zambia\'s HIV/AIDS Programmes · Founder, SWAA · Global Roles with WHO and UNAIDS',
    constituency: 'National',
    focus: 'Universal Health Coverage & Health Systems Strengthening',
    headline: 'Every Zambian deserves access to quality healthcare — not as a privilege of proximity to a city, but as a constitutional right.',
    bio1: 'Prof. Nkandu Luo is one of the most distinguished figures in African public health, with a career spanning more than four decades in medical research, health policy, and international health governance. She is a pioneer whose early work on HIV/AIDS in Zambia helped establish the institutional infrastructure that has since saved hundreds of thousands of lives — including the establishment of national blood screening centres and the creation of the National AIDS Council.',
    bio2: 'As founder of the Society for Women Against AIDS in Africa (SWAA), she championed the gendered dimensions of the AIDS epidemic. Her global roles with WHO and UNAIDS placed her at the centre of international health policy development. As Minister of Health, she will pursue universal health coverage, strengthen primary healthcare infrastructure in rural areas, rebuild health worker capacity, and reduce Zambia\'s dependence on donor-funded health programmes.',
    quote: '"A nation that cannot protect the health of its mothers and children cannot claim to be developing."',
    signature: 'Nkandu Luo',
  },
  {
    name: 'Hon. Saboi Imboela',
    role: 'Minister in the Presidency — Women, Youth & Persons with Disabilities',
    credentials: 'NDC President · Master\'s in International Law and Politics · Musician, Lecturer and UNDP Consultant',
    constituency: 'National',
    focus: 'Gender Equality, Youth Empowerment & Inclusion',
    headline: 'Gender equality, meaningful youth participation, and genuine inclusion for persons with disabilities are not aspirations — they are obligations.',
    bio1: 'Hon. Saboi Imboela is one of Zambia\'s most multifaceted public figures — a lawyer, musician, lecturer, and political leader whose professional life embodies the intersection of culture, human rights, and democratic advocacy. As President of the National Democratic Congress (NDC), she has consistently championed an inclusive political vision centring gender equality, youth participation, and disability rights.',
    bio2: 'She holds a Master\'s degree in International Law and Politics and her work as a UNDP consultant has given her practical understanding of how international development programmes are designed and implemented. As a musician, she has used her artistic platform to advocate for women\'s rights and challenge gender-based violence. As Minister, she will expand economic opportunities for women, create meaningful youth employment pathways, and ensure Zambia\'s frameworks protect persons with disabilities.',
    quote: '"Culture can change minds that law cannot reach. I use every platform available to me — as a lawyer, a politician, and a musician."',
    signature: 'Saboi Imboela',
  },
  {
    name: 'Hon. Kampamba Mulenga',
    role: 'Shadow Minister of Social Development',
    credentials: 'Qualified Nurse · Former Kalulushi District Commissioner · First Female MP for Kalulushi',
    constituency: 'Kalulushi',
    focus: 'Social Protection & Community Welfare',
    headline: 'Zambia\'s most vulnerable communities — children, the elderly, persons with disabilities — deserve a social protection system that truly protects them.',
    bio1: 'Hon. Kampamba Mulenga carries an exceptional breadth of experience across healthcare, public administration, and parliamentary service. As a qualified nurse, she began her career in direct service to Zambia\'s most vulnerable communities. Her appointment as Kalulushi District Commissioner provided executive experience in local government administration and community development programming.',
    bio2: 'When she became the first female Member of Parliament for Kalulushi, she broke historic barriers and became a symbol of women\'s political empowerment in the Copperbelt region. Her parliamentary service spanned committees covering Information, Fisheries, and Community Development. As Minister of Social Development, Mulenga will prioritise strengthening Zambia\'s social protection systems, expanding cash transfer programmes, and improving social services for vulnerable groups.',
    quote: '"I began my career as a nurse — I know what poverty looks like in a person\'s body. That is why I entered politics."',
    signature: 'Kampamba Mulenga',
  },
  {
    name: 'Dr. Dora Siliya',
    role: 'Shadow Minister of Public Service & Administration',
    credentials: 'PhD Development Studies · MPhil Political Economy · BA Mass Communication · Diplomat and Former Minister',
    constituency: 'National',
    focus: 'Civil Service Reform & Citizen-Centred Delivery',
    headline: 'Zambia\'s civil service must become a high-performance institution defined by accountability, innovation, and genuine commitment to citizens.',
    bio1: 'Dr. Dora Siliya is one of Zambia\'s most accomplished and versatile public servants, with a career encompassing journalism, business, diplomacy, and senior ministerial leadership across multiple government portfolios. Her academic credentials are exceptional: a PhD in Development Studies, an MPhil in Political Economy, and a BA in Mass Communication — giving her sophisticated analytical tools for policy design and powerful communication skills for driving institutional change.',
    bio2: 'As a former minister with experience spanning trade, education, and agriculture portfolios, Dr. Siliya has led large government departments through complex reform processes. Her entrepreneurial credentials include co-founding Platinum Communications. As Minister of Public Service and Administration, she will lead a comprehensive transformation of Zambia\'s civil service: modernising HR systems, implementing performance management frameworks, and embedding citizen-centred service delivery as the defining ethos.',
    quote: '"A civil service that serves citizens — not itself — is the most powerful anti-poverty tool a government possesses."',
    signature: 'Dora Siliya',
  },
  {
    name: 'Hon. Chishala Kateka',
    role: 'Shadow Minister of Human Settlements',
    credentials: 'New Heritage Party President · FCCA · Former Barclays Zambia Chair',
    constituency: 'National',
    focus: 'Affordable Housing & Urban Development',
    headline: 'Every Zambian family deserves dignified, affordable housing in a well-planned community — not just those who can afford a mortgage.',
    bio1: 'Hon. Chishala Kateka brings formidable financial expertise and governance experience to the challenge of human settlements. As a Fellow of the Chartered Certified Accountants (FCCA), she has the professional credentials to understand the complex financing requirements of housing development. Her tenure as Chair of Barclays Zambia\'s Board of Directors placed her at the apex of one of Zambia\'s leading financial institutions.',
    bio2: 'As President of the New Heritage Party, Kateka has articulated a vision for a Zambia where all citizens can access decent, dignified housing. As Minister of Human Settlements, she will develop a national affordable housing strategy that mobilises public and private finance, streamlines planning approval processes, upgrades informal settlements with infrastructure and tenure security, and creates community housing cooperatives that empower low-income households.',
    quote: '"Housing is not a luxury — it is the foundation of every other aspect of human dignity and economic participation."',
    signature: 'Chishala Kateka',
  },
  {
    name: 'Hon. Margaret Mwanakatwe',
    role: 'Shadow Minister of Tourism',
    credentials: 'BBA · Pioneer CEO of Barclays Zambia and UBA Uganda · Former Minister of Finance and Commerce',
    constituency: 'National',
    focus: 'Tourism Development & Natural Heritage',
    headline: 'Zambia\'s extraordinary natural assets — from Victoria Falls to Lake Tanganyika — represent an untapped economic engine waiting to be unlocked.',
    bio1: 'Hon. Margaret Mwanakatwe is one of Zambia\'s most distinguished business and public policy leaders. As the inaugural Chief Executive Officer of Barclays Bank Zambia, she led the establishment of a major banking institution from inception — an entrepreneurial achievement demonstrating exceptional organisational capability and strategic vision. She subsequently served as CEO of United Bank for Africa (UBA) Uganda, extending her financial sector leadership across borders.',
    bio2: 'Her transition from private sector leadership to government saw her serve as Minister of Finance and Minister of Commerce. As Minister of Tourism, Mwanakatwe will pursue a comprehensive tourism development strategy that leverages Zambia\'s extraordinary natural assets to generate sustainable economic growth, foreign exchange earnings, and local employment, while advancing eco-tourism standards that protect Zambia\'s natural heritage.',
    quote: '"Zambia is one of the world\'s most beautiful countries. Our task is to ensure that beauty creates jobs for Zambian families."',
    signature: 'Margaret Mwanakatwe',
  },
  {
    name: 'Mwitwa Mushibwe',
    role: 'Minister in the Presidency',
    credentials: 'Graduate, University of Zambia · Governance and Policy Development Expert',
    constituency: 'National',
    focus: 'Inter-Ministerial Coordination & Policy Development',
    headline: 'Effective governance requires not just good policies, but the institutional coordination and follow-through discipline to actually implement them.',
    bio1: 'Mwitwa Mushibwe is a University of Zambia graduate whose deep engagement with governance systems, policy development, and public administration has prepared her for the demanding coordination role of Minister in the Presidency. Her understanding of Zambia\'s governance architecture — how institutions relate to one another, how policy is developed and implemented, and where coordination failures undermine effective government — makes her a valuable facilitator in the Office of the Presidency.',
    bio2: 'As a member of Build One Zambia\'s leadership team, Mushibwe has been closely involved in the development of the shadow government\'s policy platform — contributing to governance reform proposals, inter-ministerial coordination frameworks, and national development priorities. In the Presidency, she will serve as a key liaison between the President, the Vice President, and the wider cabinet — ensuring coherent policy development and maintaining the discipline of implementation follow-through.',
    quote: '"Policy without implementation is just a document. My role is to make sure that every commitment becomes an outcome."',
    signature: 'Mwitwa Mushibwe',
  },
];

const STATS = [
  { value: '10',  unit: 'Provinces', label: 'Covered by BOZ female candidates' },
  { value: '50',  unit: '%',         label: 'Of all BOZ candidates are women' },
  { value: '10',  unit: '',          label: 'Female shadow cabinet members' },
  { value: '1st', unit: '',          label: 'Party with full female leadership parity' },
];

const ACTION_CARDS = [
  { icon: Heart, title: 'Make Donation',   desc: 'Donate now to help our female candidates reach every constituency. Make a difference by taking action with your donation.', path: '/contact' },
  { icon: Users, title: 'Campaign Events', desc: 'Join us in supporting our female candidates at rallies and community meetings across all ten provinces of Zambia.', path: '/contact' },
  { icon: Leaf,  title: 'Join Volunteer',  desc: 'Join our team of volunteers and help make a positive impact in your community today.', path: '/contact' },
];

function ShadowMemberPhoto({ id, name }: { id: string; name: string }) {
  const [imgError, setImgError] = useState(false);
  return (
    <div className="w-full aspect-[4/5] overflow-hidden bg-gray-100">
      {!imgError ? (
        <img src={shadowCabinetApi.photoUrl(id, 'female')} alt={name}
          onError={() => setImgError(true)} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center" style={{ color: '#d1d5db' }}>
          <Users className="w-12 h-12" />
        </div>
      )}
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

export function FemaleCandidatesPage() {
  const [featuredIdx, setFeaturedIdx] = useState(0);
  const [animating, setAnimating]     = useState(false);
  const [liveCandidates, setLiveCandidates] = useState<BackendCandidate[]>([]);
  const [shadowMembers, setShadowMembers] = useState<ShadowMember[]>([]);

  useEffect(() => {
    candidatesApi.list({ gender: 'female', active: true })
      .then(res => setLiveCandidates(res.candidates))
      .catch(() => setLiveCandidates([]));
    shadowCabinetApi.list('female')
      .then(res => setShadowMembers(res.members))
      .catch(() => setShadowMembers([]));
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

  return (
    <div style={{ backgroundColor: '#fafafa', fontFamily: 'Open Sans, sans-serif', color: NAVY }}>

      {/* Hero header */}
      <section className="relative py-16 px-4 text-center overflow-hidden" style={{ background: 'linear-gradient(135deg, #007A30 0%, #006B28 40%, #1a0000 100%)' }}>
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `radial-gradient(circle at 50% 40%, ${O} 0%, transparent 60%)` }} />
        <div className="relative max-w-4xl mx-auto">
          <p className="text-xs tracking-widest mb-4" style={{ color: O, fontFamily: 'Oswald, sans-serif' }}>BUILD ONE ZAMBIA · SHADOW GOVERNMENT CABINET 2026–2031</p>
          <h1 className="mb-4" style={{ fontFamily: 'Oswald, sans-serif', fontSize: 'clamp(2.2rem, 5vw, 4rem)', lineHeight: 1.1, letterSpacing: '0.03em', color: '#fff' }}>
            FEMALE <span style={{ color: O }}>CANDIDATES</span>
          </h1>
          <p style={{ color: '#9ca3af', fontSize: '1rem', lineHeight: 1.8, maxWidth: '560px', margin: '0 auto' }}>
            Meet the women of Build One Zambia's Shadow Government Cabinet — bold, experienced, and committed to building a nation where every family thrives.
          </p>
        </div>
      </section>

      {/* ── ROTATING FEATURED CANDIDATE ─────────────────────────── */}
      <section className="py-20 px-4" style={{ backgroundColor: '#fff', borderLeft: `4px solid ${O}` }}>
        <div className="max-w-6xl mx-auto">

          {/* Label + controls */}
          <div className="flex items-center justify-between mb-12 flex-wrap gap-4">
            <div>
              <p className="text-xs tracking-widest mb-1" style={{ color: O, fontFamily: 'Oswald, sans-serif', letterSpacing: '0.15em' }}>ABOUT THE CANDIDATE</p>
              <h2 style={{ fontFamily: 'Oswald, sans-serif', fontSize: 'clamp(1.4rem, 3vw, 2rem)', letterSpacing: '0.03em', color: NAVY }}>IN THEIR OWN WORDS</h2>
            </div>
            <div className="flex items-center gap-3">
              <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: '13px', color: '#9ca3af', letterSpacing: '0.08em' }}>
                {String(featuredIdx + 1).padStart(2, '0')} / {String(CANDIDATES.length).padStart(2, '0')}
              </span>
              <button onClick={() => go(featuredIdx - 1)}
                className="w-10 h-10 flex items-center justify-center rounded-full transition-colors"
                style={{ border: `2px solid ${O}`, color: O, backgroundColor: 'transparent' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = O; (e.currentTarget as HTMLElement).style.color = '#fff'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; (e.currentTarget as HTMLElement).style.color = O; }}
                aria-label="Previous candidate"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button onClick={() => go(featuredIdx + 1)}
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

          {/* Candidate content */}
          <div
            className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start transition-opacity duration-300"
            style={{ opacity: animating ? 0 : 1 }}
          >
            {/* Two stacked rectangular photos */}
            <div className="flex flex-col gap-4">
              <div className="overflow-hidden rounded-sm" style={{ height: '280px', boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }}>
                {REDACTED_PHOTO_F}
              </div>
              <div className="overflow-hidden rounded-sm" style={{ height: '280px', boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }}>
                {REDACTED_PHOTO_F}
              </div>
            </div>

            {/* Text */}
            <div className="pt-2">
              <p className="text-xs tracking-widest mb-5" style={{ color: O, fontFamily: 'Oswald, sans-serif', letterSpacing: '0.15em' }}>
                SHADOW CABINET — FEMALE MINISTER
              </p>
              <h3 className="mb-2" style={{ fontFamily: 'Georgia, "Times New Roman", serif', fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', lineHeight: 1.3, color: NAVY, fontWeight: 700 }}>
                <RedactedNameF />
              </h3>
              <p className="mb-1 text-sm" style={{ color: O, fontFamily: 'Oswald, sans-serif', letterSpacing: '0.06em' }}>{c.role}</p>
              <p className="mb-6 text-xs italic" style={{ color: '#9ca3af' }}>Identity pending formal confirmation — to be announced</p>
              <div className="mb-8 p-5 rounded-xl" style={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb' }}>
                <p style={{ fontSize: '0.9rem', color: '#6b7280', lineHeight: 1.8, fontStyle: 'italic' }}>
                  This individual has been identified by the founders of Build One Zambia as a prospective shadow minister. Their full profile will be published upon formal confirmation of their participation.
                </p>
              </div>
              <blockquote className="mb-8 pl-5 py-1" style={{ borderLeft: `4px solid ${O}` }}>
                <p style={{ fontFamily: 'Georgia, serif', fontSize: '1rem', color: NAVY, lineHeight: 1.75 }}>{c.quote}</p>
              </blockquote>
              <div className="mb-6" style={{ height: '1px', backgroundColor: '#f0f0f0' }} />
              <div className="flex items-center justify-between flex-wrap gap-6">
                <div>
                  <p style={{ fontFamily: 'Oswald, sans-serif', fontSize: '1.15rem', color: O, letterSpacing: '0.04em' }}><RedactedNameF /></p>
                  <p className="text-sm mt-1" style={{ color: '#6b7280' }}>{c.role}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Dot indicators */}
          <div className="flex justify-center gap-2 mt-12 flex-wrap">
            {CANDIDATES.map((_, i) => (
              <button key={i} onClick={() => go(i)}
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
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 40px rgba(232,98,26,0.18)`}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {CANDIDATES.map((cand, i) => (
              <div key={cand.name}
                className="group overflow-hidden rounded-2xl transition-all cursor-pointer"
                style={{ backgroundColor: '#fafafa', border: `1px solid ${i === featuredIdx ? O : '#f0f0f0'}`, boxShadow: i === featuredIdx ? `0 8px 40px rgba(232,98,26,0.15)` : '0 2px 16px rgba(0,0,0,0.05)' }}
                onClick={() => go(i)}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 40px rgba(232,98,26,0.15)`}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.boxShadow = i === featuredIdx ? `0 8px 40px rgba(232,98,26,0.15)` : '0 2px 16px rgba(0,0,0,0.05)'}
              >
                <div className="relative overflow-hidden" style={{ height: '280px' }}>
                  <div className="absolute top-0 left-0 right-0 h-1 z-10" style={{ backgroundColor: O }} />
                  {REDACTED_PHOTO_F}
                  <div className="absolute bottom-0 left-0 right-0 h-20" style={{ background: 'linear-gradient(to top, rgba(30,45,74,0.5), transparent)' }} />
                  <span className="absolute bottom-3 left-4 text-xs px-3 py-1 rounded-full" style={{ backgroundColor: 'rgba(232,98,26,0.9)', color: '#fff', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.06em' }}>
                    {cand.constituency}
                  </span>
                </div>
                <div className="px-6 py-5">
                  <h3 className="mb-1" style={{ fontFamily: 'Oswald, sans-serif', fontSize: '1rem', letterSpacing: '0.04em', color: NAVY }}><RedactedNameF /></h3>
                  <p className="text-xs mb-4" style={{ color: '#9ca3af' }}>Pending confirmation</p>
                  <div className="flex items-center gap-2 text-xs" style={{ color: O }}>
                    <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                    <span style={{ fontFamily: 'Oswald, sans-serif', letterSpacing: '0.06em' }}>{cand.focus}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Shadow Cabinet from Admin Panel */}
      {shadowMembers.length > 0 && (
        <section className="py-20 px-4" style={{ backgroundColor: '#f0f4ff' }}>
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-14">
              <p className="text-xs tracking-widest mb-3" style={{ color: O, fontFamily: 'Oswald, sans-serif' }}>SHADOW CABINET</p>
              <h2 style={{ fontFamily: 'Oswald, sans-serif', fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', letterSpacing: '0.03em', color: NAVY }}>ADDITIONAL FEMALE SHADOW MINISTERS</h2>
              <div className="w-16 h-1 mx-auto mt-4 rounded-full" style={{ backgroundColor: O }} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
              {shadowMembers.map(m => (
                <div key={m.id} className="flex flex-col items-center text-center rounded-2xl overflow-hidden"
                  style={{ backgroundColor: '#fff', border: '1px solid #e0e7ff', boxShadow: '0 2px 16px rgba(0,0,0,0.05)' }}>
                  <ShadowMemberPhoto id={m.id} name={m.name} />
                  <div className="px-6 pb-8 pt-5 w-full">
                    {m.constituency && (
                      <span className="inline-block text-xs px-3 py-1 rounded-full mb-3"
                        style={{ backgroundColor: 'rgba(249,115,22,0.1)', color: O, fontFamily: 'Oswald, sans-serif', letterSpacing: '0.06em' }}>
                        {m.constituency}
                      </span>
                    )}
                    <h3 className="mb-1" style={{ fontFamily: 'Oswald, sans-serif', fontSize: '1.05rem', letterSpacing: '0.04em', color: NAVY }}>{m.name}</h3>
                    <p className="text-xs mb-2" style={{ color: '#9ca3af' }}>{m.role}</p>
                    {m.focus && (
                      <p className="text-xs" style={{ color: O }}>{m.focus}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Live candidates from Admin Panel */}
      {liveCandidates.length > 0 && (
        <section className="py-20 px-4" style={{ backgroundColor: '#fafafa' }}>
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-14">
              <p className="text-xs tracking-widest mb-3" style={{ color: O, fontFamily: 'Oswald, sans-serif' }}>ADDITIONAL CANDIDATES</p>
              <h2 style={{ fontFamily: 'Oswald, sans-serif', fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', letterSpacing: '0.03em', color: NAVY }}>MORE FEMALE CANDIDATES</h2>
              <div className="w-16 h-1 mx-auto mt-4 rounded-full" style={{ backgroundColor: O }} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
              {liveCandidates.map(c => (
                <div key={c.id} className="group flex flex-col items-center text-center rounded-2xl overflow-hidden"
                  style={{ backgroundColor: '#fff', border: '1px solid #f0f0f0', boxShadow: '0 2px 16px rgba(0,0,0,0.05)' }}>
                  <LiveCandidatePhoto id={c.id} name={c.name} />
                  <div className="px-6 pb-8 pt-5 w-full">
                    {c.scopeName && (
                      <span className="inline-block text-xs px-3 py-1 rounded-full mb-3" style={{ backgroundColor: 'rgba(232,98,26,0.1)', color: O, fontFamily: 'Oswald, sans-serif', letterSpacing: '0.06em' }}>
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
          <h2 className="mb-4" style={{ fontFamily: 'Oswald, sans-serif', fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', letterSpacing: '0.03em', color: '#fff' }}>STAND BEHIND OUR WOMEN LEADERS</h2>
          <p className="mb-8 text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.85)' }}>
            Volunteer, donate, or simply spread the word. Together we can build a Zambia where women's voices lead the way to a better future.
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

export { FemaleCandidatesPage as default };
