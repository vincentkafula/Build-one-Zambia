import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { Search, X, ArrowRight, Users, FileText, Newspaper, ShoppingBag, MapPin, Music, Video, ChevronRight } from 'lucide-react';

// ── Search Index ──────────────────────────────────────────────────────────────

interface SearchItem {
  id: string;
  title: string;
  description: string;
  path: string;
  category: string;
  keywords: string[];
  icon?: React.ReactNode;
}

const PAGES: SearchItem[] = [
  { id: 'home', title: 'Home', description: 'Build One Zambia official homepage', path: '/', category: 'Pages', keywords: ['home', 'main', 'start', 'welcome', 'boz'], icon: <MapPin className="w-4 h-4" /> },
  { id: 'about', title: 'About Us', description: 'Our leadership, story, and national movement', path: '/about', category: 'Pages', keywords: ['about', 'leadership', 'history', 'movement', 'party'], icon: <Users className="w-4 h-4" /> },
  { id: 'campaign', title: 'Campaign Platform', description: 'Our full campaign platform and policy promises', path: '/campaign', category: 'Pages', keywords: ['campaign', 'policy', 'manifesto', 'promises', 'platform', 'plan'], icon: <FileText className="w-4 h-4" /> },
  { id: 'contact', title: 'Contact & Donate', description: 'Get in touch or make a donation to support BOZ', path: '/contact', category: 'Pages', keywords: ['contact', 'donate', 'support', 'phone', 'email', 'address', 'lusaka'], icon: <MapPin className="w-4 h-4" /> },
  { id: 'donate', title: 'Donate', description: 'Support the Build One Zambia campaign financially', path: '/donate', category: 'Pages', keywords: ['donate', 'donation', 'support', 'fund', 'money', 'contribute'], icon: <ShoppingBag className="w-4 h-4" /> },
  { id: 'shop', title: 'BOZ Shop', description: 'Official BOZ merchandise and campaign materials', path: '/shop', category: 'Pages', keywords: ['shop', 'merchandise', 'buy', 'products', 't-shirt', 'hat', 'sticker', 'store'], icon: <ShoppingBag className="w-4 h-4" /> },
  { id: 'male-candidates', title: 'Male Candidates', description: 'BOZ male shadow cabinet candidates', path: '/home/male', category: 'Candidates', keywords: ['male', 'candidates', 'shadow', 'cabinet', 'men', 'ministers'], icon: <Users className="w-4 h-4" /> },
  { id: 'female-candidates', title: 'Female Candidates', description: 'BOZ female shadow cabinet candidates', path: '/home/female', category: 'Candidates', keywords: ['female', 'women', 'candidates', 'shadow', 'cabinet', 'ministers', 'gender'], icon: <Users className="w-4 h-4" /> },
  { id: 'opportunities', title: 'Opportunities', description: 'Internship, employment and business opportunities', path: '/home/opportunities', category: 'Pages', keywords: ['opportunities', 'jobs', 'internship', 'employment', 'careers', 'business'], icon: <FileText className="w-4 h-4" /> },
  { id: 'news', title: 'Latest News', description: 'Latest news, updates and announcements from BOZ', path: '/news/latest', category: 'Media', keywords: ['news', 'latest', 'updates', 'announcements', 'stories'], icon: <Newspaper className="w-4 h-4" /> },
  { id: 'press', title: 'Press Statements', description: 'Official press releases and media statements from BOZ', path: '/news/press-statements', category: 'Media', keywords: ['press', 'statement', 'media', 'release', 'official'], icon: <FileText className="w-4 h-4" /> },
  { id: 'gallery', title: 'Events Gallery', description: 'Photos and videos from campaign events and rallies', path: '/news/gallery', category: 'Media', keywords: ['gallery', 'photos', 'pictures', 'events', 'rallies', 'images'], icon: <Video className="w-4 h-4" /> },
  { id: 'live', title: 'Live Streaming', description: 'Watch live campaign events and rallies', path: '/news/live', category: 'Media', keywords: ['live', 'stream', 'watch', 'video', 'rally', 'event', 'broadcast'], icon: <Video className="w-4 h-4" /> },
  { id: 'music', title: 'Party Music', description: 'BOZ campaign songs and party audio content', path: '/news/music', category: 'Media', keywords: ['music', 'songs', 'audio', 'party', 'campaign', 'anthem'], icon: <Music className="w-4 h-4" /> },
  { id: 'documents', title: 'Documents', description: 'Policy papers, manifestos and official BOZ documents', path: '/news/documents', category: 'Media', keywords: ['documents', 'papers', 'manifesto', 'policy', 'download', 'pdf', 'files'], icon: <FileText className="w-4 h-4" /> },
  { id: 'results', title: 'Election Results', description: 'Live election results portal — all categories', path: '/results', category: 'Elections', keywords: ['results', 'election', 'votes', 'live', 'tally', 'count'], icon: <FileText className="w-4 h-4" /> },
  { id: 'presidential-results', title: 'Presidential Results', description: 'Live presidential election results across Zambia', path: '/results/presidential', category: 'Elections', keywords: ['presidential', 'president', 'results', 'votes', 'election'], icon: <FileText className="w-4 h-4" /> },
  { id: 'parliament-results', title: 'Parliamentary Results', description: 'National Assembly MP results by constituency', path: '/results/parliament', category: 'Elections', keywords: ['parliament', 'mp', 'constituency', 'national assembly', 'results'], icon: <FileText className="w-4 h-4" /> },
  { id: 'mayoral-results', title: 'Mayoral Results', description: 'City and district council leadership results', path: '/results/mayoral', category: 'Elections', keywords: ['mayoral', 'mayor', 'council', 'district', 'results'], icon: <FileText className="w-4 h-4" /> },
  { id: 'councillor-results', title: 'Councillor Results', description: 'Ward councillor results across Zambia', path: '/results/councillor', category: 'Elections', keywords: ['councillor', 'ward', 'local', 'results'], icon: <FileText className="w-4 h-4" /> },
  { id: 'register-member', title: 'Member Registration', description: 'Register as a BOZ party member', path: '/register/member', category: 'Registration', keywords: ['register', 'member', 'join', 'membership', 'sign up'], icon: <Users className="w-4 h-4" /> },
  { id: 'register-cooperative', title: 'Cooperative Registration', description: 'Register a cooperative with Build One Zambia', path: '/register/cooperative', category: 'Registration', keywords: ['cooperative', 'register', 'business', 'group', 'join'], icon: <Users className="w-4 h-4" /> },
  { id: 'register-internship', title: 'Internship Registration', description: 'Apply for the Zambia–US internship programme', path: '/register/internship', category: 'Registration', keywords: ['internship', 'apply', 'programme', 'zambia', 'us', 'america', 'usa'], icon: <Users className="w-4 h-4" /> },
];

const MALE_CANDIDATES: SearchItem[] = [
  { id: 'kafula', title: 'Vincent Kafula', description: 'Presidential Candidate — Build One Zambia · Economic Empowerment & National Unity', path: '/home/male', category: 'Male Candidates', keywords: ['vincent', 'kafula', 'president', 'presidential', 'economics', 'ndola'] },
  { id: 'haabazoka', title: 'Dr. Lubinda Haabazoka', description: 'Shadow Minister of Energy & Electricity · UNZA Economist · Energy Sector', path: '/home/male', category: 'Male Candidates', keywords: ['lubinda', 'haabazoka', 'energy', 'electricity', 'economist', 'unza', 'phd'] },
  { id: 'makebi', title: 'Makebi Zulu, SC', description: 'Shadow Minister of Employment & Labour · Senior Counsel · Labour Law', path: '/home/male', category: 'Male Candidates', keywords: ['makebi', 'zulu', 'senior counsel', 'labour', 'employment', 'law', 'sc'] },
  { id: 'sichinga', title: "Hon. Robert 'Bob' Sichinga", description: 'Shadow Minister of Agriculture & Rural Development · Harvard Economist', path: '/home/male', category: 'Male Candidates', keywords: ['robert', 'bob', 'sichinga', 'agriculture', 'rural', 'harvard', 'commerce'] },
  { id: 'sangwa', title: 'John Sangwa, SC', description: 'Shadow Minister of Justice & Constitutional Affairs · Senior Counsel', path: '/home/male', category: 'Male Candidates', keywords: ['john', 'sangwa', 'justice', 'constitutional', 'law', 'senior counsel', 'sc'] },
  { id: 'sampa', title: 'Hon. Miles Bwalya Sampa', description: 'Shadow Minister of Infrastructure & Works · Former MP', path: '/home/male', category: 'Male Candidates', keywords: ['miles', 'sampa', 'infrastructure', 'works', 'construction', 'mp'] },
  { id: 'kalaba', title: 'Hon. Harry Kalaba', description: 'Shadow Minister of International Relations · Former Foreign Affairs Minister', path: '/home/male', category: 'Male Candidates', keywords: ['harry', 'kalaba', 'international', 'relations', 'foreign affairs', 'diplomacy'] },
  { id: 'mmembe', title: "Dr. Fred M'membe", description: 'Shadow Minister of Communications & Digital Technologies · Media & Technology', path: '/home/male', category: 'Male Candidates', keywords: ['fred', 'mmembe', 'communications', 'digital', 'technology', 'media', 'post'] },
  { id: 'sishuwa', title: 'Dr. Sishuwa Sishuwa', description: 'Shadow Minister of Home Affairs · Oxford PhD Historian · Author', path: '/home/male', category: 'Male Candidates', keywords: ['sishuwa', 'home affairs', 'oxford', 'history', 'phd', 'stellenbosch', 'author'] },
  { id: 'sikota', title: 'Hon. Sakwiba Sikota, SC', description: 'Shadow Minister of Lands · Senior Counsel · Former MP', path: '/home/male', category: 'Male Candidates', keywords: ['sakwiba', 'sikota', 'lands', 'senior counsel', 'mp', 'law'] },
  { id: 'kbf', title: 'Kelvin Bwalya Fube (KBF)', description: 'Shadow Minister of Correctional & Prison Services · Reform & Rehabilitation', path: '/home/male', category: 'Male Candidates', keywords: ['kelvin', 'kbf', 'correctional', 'prison', 'rehabilitation', 'reform'] },
  { id: 'tembo', title: 'Hon. Sean E. Tembo', description: 'Shadow Minister of Sports & Youth Affairs · Youth Development', path: '/home/male', category: 'Male Candidates', keywords: ['sean', 'tembo', 'sports', 'youth', 'development'] },
  { id: 'nkombo', title: 'Hon. Gary Nkombo', description: 'Shadow Minister of Basic Education · Former MP Mazabuka · Teacher', path: '/home/male', category: 'Male Candidates', keywords: ['gary', 'nkombo', 'education', 'basic', 'mazabuka', 'teacher', 'school'] },
  { id: 'hamududu', title: 'Hon. Highvie Hambulo Hamududu', description: 'Shadow Minister of Finance (Budget) · Former MP', path: '/home/male', category: 'Male Candidates', keywords: ['highvie', 'hamududu', 'finance', 'budget', 'economics', 'mp'] },
  { id: 'kangombe', title: "Hon. Christopher C. Kang'ombe", description: 'Shadow Minister of Mineral & Petroleum Resources · Former Mayor Kitwe', path: '/home/male', category: 'Male Candidates', keywords: ['christopher', 'kangombe', 'mineral', 'petroleum', 'copper', 'mining', 'kitwe', 'mayor'] },
  { id: 'mwenda', title: 'Hon. Kasonde C. Mwenda', description: 'Shadow Minister of Tourism & Arts · Tourism Development', path: '/home/male', category: 'Male Candidates', keywords: ['kasonde', 'mwenda', 'tourism', 'arts', 'culture', 'heritage'] },
  { id: 'monde', title: 'Hon. Greyford Monde', description: 'Shadow Minister of Science & Technology Innovation', path: '/home/male', category: 'Male Candidates', keywords: ['greyford', 'monde', 'science', 'technology', 'innovation', 'research'] },
  { id: 'kapila', title: 'John Kapila', description: 'Shadow Minister of Health (Public Health) · Healthcare Development', path: '/home/male', category: 'Male Candidates', keywords: ['john', 'kapila', 'health', 'public health', 'medical', 'hospitals'] },
  { id: 'sililo', title: 'Sililo Mwala', description: 'Shadow Minister of Gender & Community Development', path: '/home/male', category: 'Male Candidates', keywords: ['sililo', 'mwala', 'gender', 'community', 'development', 'women'] },
  { id: 'given-lubinda', title: 'Hon. Given Lubinda', description: 'Shadow Minister of Water & Sanitation · Water Security', path: '/home/male', category: 'Male Candidates', keywords: ['given', 'lubinda', 'water', 'sanitation', 'clean water', 'borehole'] },
  { id: 'mpundu', title: 'Hon. Binwell Chansa Mpundu', description: 'Shadow Minister of Local Government · District Commissioner Kitwe', path: '/home/male', category: 'Male Candidates', keywords: ['binwell', 'mpundu', 'local government', 'kitwe', 'district commissioner'] },
  { id: 'luando', title: 'Hon. Franklyn Luando', description: 'Minister in the Presidency — Planning, Monitoring & Evaluation', path: '/home/male', category: 'Male Candidates', keywords: ['franklyn', 'luando', 'planning', 'monitoring', 'evaluation', 'presidency', 'fcca', 'fcma'] },
  { id: 'kanyanta', title: 'Hon. Kanyanta Chanda Kapwepwe', description: 'Shadow Minister of Small Business Development · MBA, LLB, ACCA', path: '/home/male', category: 'Male Candidates', keywords: ['kanyanta', 'kapwepwe', 'small business', 'sme', 'entrepreneurs', 'mba', 'llb'] },
];

const FEMALE_CANDIDATES: SearchItem[] = [
  { id: 'tasila', title: 'Hon. Tasila Lungu Mwansa', description: 'Vice Presidential Candidate · MP Chawama · Inclusive Governance', path: '/home/female', category: 'Female Candidates', keywords: ['tasila', 'lungu', 'mwansa', 'vice president', 'chawama', 'mp', 'governance'] },
  { id: 'chileshe', title: 'H.E. Chileshe Mpundu Kapwepwe', description: 'Shadow Minister of Finance · COMESA Secretary-General · IMF Director', path: '/home/female', category: 'Female Candidates', keywords: ['chileshe', 'kapwepwe', 'finance', 'comesa', 'imf', 'economics', 'fiscal'] },
  { id: 'dolika', title: 'Dr. Dolika Banda', description: 'Shadow Minister of Trade, Industry & Economic Development · AfCFTA', path: '/home/female', category: 'Female Candidates', keywords: ['dolika', 'banda', 'trade', 'industry', 'afcfta', 'economic', 'investment'] },
  { id: 'nkandu', title: 'Prof. Nkandu Luo', description: 'Shadow Minister of Health · Professor · Healthcare Reform', path: '/home/female', category: 'Female Candidates', keywords: ['nkandu', 'luo', 'health', 'professor', 'medical', 'hospitals', 'healthcare'] },
  { id: 'saboi', title: 'Hon. Saboi Imboela', description: 'Shadow Minister of Social Welfare & Child Development', path: '/home/female', category: 'Female Candidates', keywords: ['saboi', 'imboela', 'social welfare', 'child', 'development', 'vulnerable'] },
  { id: 'kampamba', title: 'Hon. Kampamba Mulenga', description: 'Shadow Minister of Education · Higher Education Reform', path: '/home/female', category: 'Female Candidates', keywords: ['kampamba', 'mulenga', 'education', 'higher education', 'university', 'schools'] },
  { id: 'dora', title: 'Dr. Dora Siliya', description: 'Shadow Minister of Information & Media · Former Cabinet Minister', path: '/home/female', category: 'Female Candidates', keywords: ['dora', 'siliya', 'information', 'media', 'communications', 'minister'] },
  { id: 'chishala', title: 'Hon. Chishala Kateka', description: 'Shadow Minister of Human Settlements & Housing · FCCA · Barclays Chair', path: '/home/female', category: 'Female Candidates', keywords: ['chishala', 'kateka', 'housing', 'human settlements', 'fcca', 'barclays', 'accountant'] },
  { id: 'margaret', title: 'Hon. Margaret Mwanakatwe', description: 'Shadow Minister of Commerce · Former Finance Minister', path: '/home/female', category: 'Female Candidates', keywords: ['margaret', 'mwanakatwe', 'commerce', 'finance', 'former minister', 'business'] },
  { id: 'mwitwa', title: 'Mwitwa Mushibwe', description: 'Shadow Minister of Rural Development & Cooperatives', path: '/home/female', category: 'Female Candidates', keywords: ['mwitwa', 'mushibwe', 'rural', 'development', 'cooperatives', 'farming'] },
];

const POLICIES: SearchItem[] = [
  { id: 'policy-homes', title: 'Homes for Every Family', description: 'Government machinery deployed in every municipality so communities can build their own homes', path: '/campaign', category: 'Campaign', keywords: ['homes', 'housing', 'construction', 'buildings', 'shelter', 'family', 'municipality', 'machinery'] },
  { id: 'policy-power', title: 'Power in All Provinces', description: 'Ten new power plants — one per province — delivering reliable electricity from dawn to dusk', path: '/campaign', category: 'Campaign', keywords: ['power', 'electricity', 'energy', 'power plants', 'provinces', 'load shedding', 'zesco'] },
  { id: 'policy-fertiliser', title: 'Fertiliser for Our Fields', description: 'A fertiliser production plant in every province to boost harvests and end food insecurity', path: '/campaign', category: 'Campaign', keywords: ['fertiliser', 'farming', 'agriculture', 'food', 'harvest', 'maize', 'crops', 'farmers'] },
  { id: 'policy-cement', title: 'Cement and Stone for Growth', description: 'Local cement and stone production facilities creating thousands of sustainable jobs', path: '/campaign', category: 'Campaign', keywords: ['cement', 'stone', 'construction', 'jobs', 'manufacturing', 'building materials'] },
  { id: 'policy-chambers', title: 'Global Chamber Connections', description: 'Connecting all 1,858 Zambian wards with 7,000+ US local chambers of commerce', path: '/campaign', category: 'Campaign', keywords: ['chambers', 'commerce', 'usa', 'america', 'trade', 'investment', 'business', 'wards', 'global', '7000'] },
  { id: 'policy-afcfta', title: 'AfCFTA Integration', description: "Zambia's AfCFTA integration strategy — building industrial clusters to add value to raw commodities", path: '/campaign', category: 'Campaign', keywords: ['afcfta', 'africa', 'trade', 'free trade', 'copper', 'minerals', 'industrial', 'value addition'] },
  { id: 'policy-sme', title: 'SME & Entrepreneurship Support', description: 'Simplified business registration, financing vehicles, mentorship networks and industrial parks', path: '/campaign', category: 'Campaign', keywords: ['sme', 'small business', 'entrepreneurs', 'startup', 'business registration', 'loans', 'finance'] },
  { id: 'policy-water', title: 'Water Security & Sanitation', description: 'Rural water point construction, urban sanitation modernisation and water utility governance reform', path: '/campaign', category: 'Campaign', keywords: ['water', 'sanitation', 'clean water', 'borehole', 'rural', 'sewage', 'hygiene'] },
  { id: 'policy-education', title: 'Education Reform', description: 'Free quality education, curriculum reform, school construction and teacher training', path: '/campaign', category: 'Campaign', keywords: ['education', 'schools', 'teachers', 'curriculum', 'free education', 'university', 'learning'] },
  { id: 'policy-health', title: 'Healthcare Reform', description: 'Comprehensive healthcare reform — hospitals, medicines, rural clinics, universal access', path: '/campaign', category: 'Campaign', keywords: ['health', 'hospital', 'clinic', 'doctor', 'medicine', 'healthcare', 'nurses', 'medical'] },
  { id: 'policy-mining', title: 'Mineral & Mining Development', description: 'Copper, cobalt and mineral resources processed in Zambia before export — more jobs', path: '/campaign', category: 'Campaign', keywords: ['mining', 'copper', 'cobalt', 'minerals', 'copperbelt', 'zambia', 'resources', 'export'] },
];

const ALL_ITEMS: SearchItem[] = [...PAGES, ...MALE_CANDIDATES, ...FEMALE_CANDIDATES, ...POLICIES];

const CATEGORY_COLORS: Record<string, string> = {
  'Pages':            '#007A30',
  'Male Candidates':  '#0ea5e9',
  'Female Candidates':'#e8621a',
  'Campaign':         '#dc2626',
  'Elections':        '#7c3aed',
  'Media':            '#0891b2',
  'Registration':     '#16a34a',
};

// ── Search engine ─────────────────────────────────────────────────────────────

function score(item: SearchItem, query: string): number {
  const q = query.toLowerCase().trim();
  if (!q) return 0;
  const terms = q.split(/\s+/);
  let total = 0;
  for (const term of terms) {
    if (item.title.toLowerCase().includes(term))        total += 10;
    if (item.description.toLowerCase().includes(term))  total += 5;
    if (item.category.toLowerCase().includes(term))     total += 3;
    if (item.keywords.some(k => k.includes(term)))      total += 4;
    if (item.keywords.some(k => k.startsWith(term)))    total += 2;
  }
  return total;
}

function search(query: string): SearchItem[] {
  if (!query.trim()) return [];
  return ALL_ITEMS
    .map(item => ({ item, score: score(item, query) }))
    .filter(r => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 12)
    .map(r => r.item);
}

// ── Component ─────────────────────────────────────────────────────────────────

interface SiteSearchProps {
  open: boolean;
  onClose: () => void;
}

export function SiteSearch({ open, onClose }: SiteSearchProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchItem[]>([]);
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      setQuery('');
      setResults([]);
      setSelected(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    setResults(search(query));
    setSelected(0);
  }, [query]);

  const handleSelect = useCallback((item: SearchItem) => {
    navigate(item.path);
    onClose();
    setQuery('');
  }, [navigate, onClose]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setSelected(s => Math.min(s + 1, results.length - 1)); }
    if (e.key === 'ArrowUp')   { e.preventDefault(); setSelected(s => Math.max(s - 1, 0)); }
    if (e.key === 'Enter' && results[selected]) { handleSelect(results[selected]); }
    if (e.key === 'Escape') { onClose(); }
  };

  if (!open) return null;

  const grouped: Record<string, SearchItem[]> = {};
  for (const item of results) {
    if (!grouped[item.category]) grouped[item.category] = [];
    grouped[item.category].push(item);
  }

  const QUICK_LINKS: SearchItem[] = [
    PAGES.find(p => p.id === 'male-candidates')!,
    PAGES.find(p => p.id === 'female-candidates')!,
    PAGES.find(p => p.id === 'campaign')!,
    PAGES.find(p => p.id === 'results')!,
    PAGES.find(p => p.id === 'news')!,
    PAGES.find(p => p.id === 'donate')!,
  ];

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[9999] flex items-start justify-center pt-[10vh] px-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
      onClick={e => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div
        className="w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl"
        style={{ backgroundColor: '#0a1a10', border: '1px solid rgba(0,200,80,0.2)' }}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
          <Search className="w-5 h-5 shrink-0" style={{ color: '#4ade80' }} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search candidates, policies, pages…"
            className="flex-1 bg-transparent outline-none text-white placeholder-gray-500"
            style={{ fontFamily: 'Open Sans, sans-serif', fontSize: '16px' }}
          />
          {query && (
            <button onClick={() => setQuery('')} className="p-1 rounded-full hover:bg-white/10 transition-colors">
              <X className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.4)' }} />
            </button>
          )}
          <button
            onClick={onClose}
            className="text-xs px-2 py-1 rounded border transition-colors"
            style={{ borderColor: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.4)' }}
          >
            ESC
          </button>
        </div>

        {/* Results */}
        <div className="max-h-[60vh] overflow-y-auto">
          {!query ? (
            /* Quick links when no query */
            <div className="p-4">
              <p className="text-xs mb-3 px-1" style={{ color: 'rgba(255,255,255,0.3)', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.12em' }}>QUICK LINKS</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {QUICK_LINKS.map(item => (
                  <button
                    key={item.id}
                    onClick={() => handleSelect(item)}
                    className="text-left px-3 py-2.5 rounded-xl transition-colors flex items-center gap-2 group"
                    style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(0,200,80,0.08)'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(255,255,255,0.04)'}
                  >
                    <span style={{ color: CATEGORY_COLORS[item.category] ?? '#4ade80' }} className="shrink-0">{item.icon}</span>
                    <span className="text-sm truncate" style={{ color: 'rgba(255,255,255,0.75)', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.04em' }}>
                      {item.title}
                    </span>
                    <ChevronRight className="w-3 h-3 ml-auto shrink-0 opacity-0 group-hover:opacity-50 transition-opacity" style={{ color: '#4ade80' }} />
                  </button>
                ))}
              </div>
            </div>
          ) : results.length === 0 ? (
            <div className="py-12 text-center" style={{ color: 'rgba(255,255,255,0.3)' }}>
              <Search className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p style={{ fontFamily: 'Oswald, sans-serif', letterSpacing: '0.04em' }}>No results for "{query}"</p>
              <p className="text-sm mt-1">Try different keywords or browse the navigation above</p>
            </div>
          ) : (
            <div className="p-3 space-y-4">
              {Object.entries(grouped).map(([category, items]) => (
                <div key={category}>
                  <p className="text-xs px-2 mb-1.5" style={{ color: CATEGORY_COLORS[category] ?? '#4ade80', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.12em' }}>
                    {category.toUpperCase()}
                  </p>
                  <div className="space-y-1">
                    {items.map((item, idx) => {
                      const globalIdx = results.indexOf(item);
                      const isSelected = globalIdx === selected;
                      return (
                        <button
                          key={item.id}
                          onClick={() => handleSelect(item)}
                          className="w-full text-left px-3 py-2.5 rounded-xl transition-colors flex items-start gap-3 group"
                          style={{
                            backgroundColor: isSelected ? `${CATEGORY_COLORS[item.category] ?? '#007A30'}20` : 'transparent',
                            border: `1px solid ${isSelected ? `${CATEGORY_COLORS[item.category] ?? '#007A30'}40` : 'transparent'}`,
                          }}
                          onMouseEnter={() => setSelected(globalIdx)}
                        >
                          <span className="mt-0.5 shrink-0" style={{ color: CATEGORY_COLORS[item.category] ?? '#4ade80' }}>
                            {item.icon ?? <FileText className="w-4 h-4" />}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate" style={{ color: 'rgba(255,255,255,0.9)', fontFamily: 'Open Sans, sans-serif' }}>
                              {item.title}
                            </p>
                            <p className="text-xs truncate mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
                              {item.description}
                            </p>
                          </div>
                          <ArrowRight className="w-4 h-4 shrink-0 mt-0.5 opacity-0 group-hover:opacity-60 transition-opacity" style={{ color: '#4ade80' }} />
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer hint */}
        <div className="px-4 py-2.5 border-t flex items-center gap-4 text-xs" style={{ borderColor: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.25)' }}>
          <span>↑↓ Navigate</span>
          <span>↵ Open</span>
          <span>ESC Close</span>
          <span className="ml-auto">{results.length > 0 ? `${results.length} result${results.length !== 1 ? 's' : ''}` : ''}</span>
        </div>
      </div>
    </div>
  );
}
