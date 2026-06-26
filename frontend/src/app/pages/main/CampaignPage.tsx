import { useState } from 'react';
import { Link } from 'react-router';
import { ArrowRight, Truck, Tractor, Home, Gem, Building, ChevronDown, ChevronUp } from 'lucide-react';
import { ImageWithFallback } from '../../components/figma/ImageWithFallback';
import { EquipmentParade } from '../../components/EquipmentParade';

const ROADS_IMG    = 'https://images.unsplash.com/photo-1545558014-8692077e9b5c?w=700&h=450&fit=crop&auto=format';
const FARM_IMG     = 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=700&h=450&fit=crop&auto=format';
const HOUSING_IMG  = 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=700&h=450&fit=crop&auto=format';
const MINING_IMG   = 'https://images.unsplash.com/photo-1659174280011-0b9ec848c2d7?w=700&h=450&fit=crop&auto=format';
const GOV_IMG      = 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=700&h=450&fit=crop&auto=format';

const TABS = [
  { id: 'transport',    label: 'TRANSPORT',    icon: Truck    },
  { id: 'agriculture',  label: 'AGRICULTURE',  icon: Tractor  },
  { id: 'housing',      label: 'HOUSING',      icon: Home     },
  { id: 'mining',       label: 'MINING',       icon: Gem      },
  { id: 'governance',   label: 'GOVERNANCE',   icon: Building },
];

function SectionLabel({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <span className="block w-8 h-0.5" style={{ backgroundColor: '#f97316' }} />
      <span className="text-xs tracking-widest uppercase" style={{ color: '#f97316', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.2em', fontWeight: 600 }}>{text}</span>
    </div>
  );
}

function H2({ children }: { children: React.ReactNode }) {
  return <h2 className="mb-5" style={{ fontFamily: 'Oswald, sans-serif', fontSize: 'clamp(1.6rem, 3vw, 2.4rem)', fontWeight: 700, color: '#1a1a1a', lineHeight: 1.1 }}>{children}</h2>;
}

function H3({ children }: { children: React.ReactNode }) {
  return <h3 className="mb-3" style={{ fontFamily: 'Oswald, sans-serif', fontSize: '1.15rem', letterSpacing: '0.04em', color: '#1f2937' }}>{children}</h3>;
}

function BodyText({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <p className={`leading-relaxed ${className}`} style={{ color: '#4b5563', fontSize: '15px', lineHeight: 1.85 }}>{children}</p>;
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2 my-4">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-3">
          <span className="w-2 h-2 rounded-full mt-2 shrink-0" style={{ backgroundColor: '#16a34a' }} />
          <span style={{ color: '#374151', fontSize: '14px', lineHeight: 1.75 }}>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function Blockquote({ children }: { children: React.ReactNode }) {
  return (
    <blockquote className="my-6 pl-5 italic" style={{ borderLeft: '3px solid #f97316', color: '#475569', fontSize: '15px', lineHeight: 1.8 }}>
      {children}
    </blockquote>
  );
}

function ImpactBox({ text }: { text: string }) {
  return (
    <div className="mt-6 p-5" style={{ backgroundColor: '#fef3c7', border: '2px solid #f59e0b', borderRadius: '8px' }}>
      <p style={{ color: '#92400e', fontSize: '14px', lineHeight: 1.8 }}><strong style={{ color: '#78350f' }}>What This Means for You:</strong> {text}</p>
    </div>
  );
}

function Accordion({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ backgroundColor: '#ffffff', border: '2px solid #e5e7eb', marginBottom: '12px', borderRadius: '8px', overflow: 'hidden' }}>
      <button
        className="w-full flex items-center justify-between p-5 text-left"
        onClick={() => setOpen(o => !o)}
        style={{ backgroundColor: open ? '#f0fdf4' : '#ffffff' }}
      >
        <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: '1rem', letterSpacing: '0.04em', color: '#111827' }}>{title}</span>
        {open ? <ChevronUp className="w-4 h-4 shrink-0" style={{ color: '#16a34a' }} /> : <ChevronDown className="w-4 h-4 shrink-0" style={{ color: '#16a34a' }} />}
      </button>
      {open && <div className="px-5 pb-5" style={{ backgroundColor: '#f9fafb' }}>{children}</div>}
    </div>
  );
}

/* ── Tab panels ────────────────────────────────────────────────────────────── */

function TransportPanel() {
  return (
    <div>
      <div className="grid lg:grid-cols-2 gap-12 items-start mb-16">
        <div>
          <SectionLabel text="ZAMBIA FIRST" />
          <H2>Transport Infrastructure</H2>
          <p className="text-xs mb-5 px-3 py-2 inline-block" style={{ backgroundColor: 'rgba(220,38,38,0.12)', color: '#dc2626', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.06em' }}>
            ELECTION DATE: 13 AUGUST 2026
          </p>
          <BodyText className="mb-4">
            On 14 August 2031, Zambians will elect a President, Members of the National Assembly, mayors, council chairs, and councillors. This is your opportunity to embrace real, lasting change.
          </BodyText>
          <BodyText className="mb-4">
            Build One Zambia is committed to a Zambia First development philosophy — one that is practical, people-centred, and firmly opposed to the old system of endless contracts, foreign firms extracting profits while our citizens receive little, and corruption that drains our national resources.
          </BodyText>
          <BodyText>
            Previous governments allowed foreign companies to dominate key infrastructure projects. These firms often performed minimal work while sharing returns with corrupt officials, leaving Zambian workers with low wages or none at all — and leaving our communities with no lasting skills or benefits.
          </BodyText>
        </div>
        <div className="overflow-hidden" style={{ height: '380px' }}>
          <ImageWithFallback src={ROADS_IMG} alt="Road construction" className="w-full h-full object-cover" />
        </div>
      </div>

      <div className="mb-12 p-8" style={{ backgroundColor: '#f0fdf4', border: '2px solid #16a34a', borderRadius: '8px' }}>
        <H3>Our People-Powered Infrastructure Strategy</H3>
        <BodyText className="mb-4">We offer a fundamentally different approach — one that places Zambians at the forefront of building their own country:</BodyText>
        <BulletList items={[
          'The government will directly procure modern machinery, equipment, and materials — bypassing tenders to middlemen or foreign firms entirely.',
          'Local Zambians — your family, your neighbours — will operate the machinery, drive the bulldozers, lay the tracks, and build the runways in every province and district.',
          'All manual and skilled labour will be performed by Zambian workers, creating thousands of well-paying, dignified jobs across the nation.',
          'Only specialised foreign engineers will be engaged — as individuals, never through companies — to work alongside our own qualified Zambian engineers, with a clear mandate to transfer essential skills and knowledge.',
          'The vast majority of construction materials — cement, aggregates, steel, and asphalt blends — will be sourced and produced locally, stimulating Zambian industries and keeping money circulating within our economy.',
        ]} />
      </div>

      <div className="space-y-2">
        <Accordion title="Roads — Our Roads Revolution">
          <BodyText className="mb-4">Imagine smooth, all-weather roads connecting your village to the nearest market and your district to the provincial capital — no more potholes causing vehicle damage or isolating families during the rainy season.</BodyText>
          <H3>Core Commitments (2026–2031)</H3>
          <BulletList items={[
            'Upgrade national economic corridors to dual carriageways — Lusaka–Ndola, Lusaka–Livingstone, Great North Road to Nakonde, and more — using Zambian-operated equipment and labour.',
            'Provincial priorities: Western Province\'s Mutanda–Kaoma corridor, Lobito Corridor feeder links, Central Province farm-to-market roads, Copperbelt mining haul routes, and Eastern Province trade links to Malawi and Mozambique.',
            'District-level action: All-weather paved or durable gravel roads in every underserved district, particularly in rural Luapula, Muchinga, Northern, and North-Western Provinces.',
            'Urban relief: Ring roads and decongestion projects in provincial capitals — Lusaka, Ndola, Kitwe, Livingstone, Chipata, Solwezi, Mongu, Kasama, and Mansa.',
            'Local production of road materials through quarries and asphalt plants to lower costs and create employment.',
          ]} />
          <ImpactBox text="Shorter travel times, lower transportation costs, thousands of construction jobs with fair wages, fewer vehicle breakdowns, and safer journeys every day." />
        </Accordion>

        <Accordion title="Rail — Reviving Our Railways">
          <BodyText className="mb-4">Rail is the most cost-effective and environmentally responsible means of transporting heavy loads, yet our rail network has been neglected for decades. We will revitalise it with Zambian workers operating machinery, laying rails, and running trains.</BodyText>
          <H3>Core Commitments</H3>
          <BulletList items={[
            'Government-led rehabilitation of Zambia Railways Limited (ZRL) lines: new tracks, modern signalling, locomotives, and wagons — built and maintained by Zambian teams.',
            'Accelerated revival of TAZARA through individual specialist engagement rather than foreign contractors, expanding export capacity to Dar es Salaam.',
            'New extensions: Chingola–Angola (Lobito Corridor), Northern Province links, and commuter lines connecting Lusaka and the Copperbelt for daily workers.',
            'Freight spurs to mining areas in Copperbelt and North-Western Provinces; agricultural sidings in Central and Eastern Provinces.',
            'Local sourcing of rails, sleepers, ballast, and fuel depot upgrades.',
          ]} />
          <ImpactBox text="Lower export costs for copper, cobalt, maize, and fertiliser; fewer truck accidents; reliable, environmentally friendly transport; and thousands of jobs in rail construction, operations, and maintenance." />
        </Accordion>

        <Accordion title="Cargo Airports — Zambia's Cargo Powerhouse">
          <BodyText className="mb-4">As a landlocked nation, fast and reliable air cargo is critical for accessing global markets with fresh produce, flowers, fish, and high-value minerals. We will expand cargo facilities — with Zambian workers leading the construction.</BodyText>
          <H3>Core Commitments</H3>
          <BulletList items={[
            'Major cargo terminal expansion at Kenneth Kaunda International Airport (Lusaka): cold-chain facilities, warehouses, and freighter aprons, built by local teams.',
            'Upgrades at Simon Mwansa Kapwepwe International Airport (Ndola) to serve Copperbelt mining and industrial exports.',
            'Provincial enhancements at Mfuwe (Eastern Province agro-tourism), Livingstone (Southern), Solwezi (North-Western mining), and key sites across other provinces.',
            'Airport City projects in Lusaka and Ndola: logistics parks and agro-processing zones generating local employment.',
            'Local materials and Zambian labour for all runways, taxiways, and terminal buildings.',
          ]} />
          <ImpactBox text="Farmers in rural districts can sell fresh produce without spoilage; mineral exporters reach markets faster; new logistics and processing jobs emerge; and Zambia becomes the premier regional cargo hub." />
        </Accordion>

        <Accordion title="Passenger Airports — Wings for All Zambians">
          <BodyText className="mb-4">Better airports make travel easier for business, family visits, tourism, and investment — ending the era of long, costly road journeys to reach loved ones or pursue opportunities.</BodyText>
          <H3>Core Commitments</H3>
          <BulletList items={[
            'Complete modernisation of Kenneth Kaunda International Airport (Lusaka): expanded terminals, upgraded facilities, and more routes — all built by Zambian workers.',
            'Upgrades to Harry Mwanga Nkumbula International Airport (Livingstone) to accommodate growing tourism at Victoria Falls.',
            'New and refurbished provincial airports: Choma, Kasaba Bay, Nakonde, with major improvements at Mansa, Mfuwe, Solwezi, Mongu, and others.',
            'Improved domestic and regional routes to Johannesburg, Dar es Salaam, and Nairobi.',
            'Zambian-led construction using locally sourced materials throughout.',
          ]} />
          <ImpactBox text="Affordable flights for family visits, a thriving tourism industry across our national parks, easier access for investors, and economic growth reaching the most remote provinces." />
        </Accordion>
      </div>

      <Blockquote>
        Your vote on 14 August 2031 is the key to this future. Choose progress. Choose ownership. Choose Zambia First. Together, we will build the Zambia we deserve.
      </Blockquote>
    </div>
  );
}

function AgriculturePanel() {
  return (
    <div>
      <div className="grid lg:grid-cols-2 gap-12 items-start mb-12">
        <div>
          <SectionLabel text="ZAMBIAN FARMERS FIRST" />
          <H2>Agricultural Mechanisation</H2>
          <BodyText className="mb-4">
            Zambia's fertile soil is one of our greatest national assets. Build One Zambia is committed to placing the tools of modern agriculture directly into the hands of Zambian farmers — through transparent, accountable, cooperative-based models that eliminate middlemen and corruption.
          </BodyText>
        </div>
        <div className="overflow-hidden" style={{ height: '300px' }}>
          <ImageWithFallback src={FARM_IMG} alt="Zambian farming" className="w-full h-full object-cover" />
        </div>
      </div>

      {[
        {
          num: '1',
          title: 'Tractors — Power and Prosperity for Zambian Farmers',
          body: 'Imagine turning weeks of arduous land preparation into just days of efficient, productive work. Through Build One Zambia, we will establish farmer cooperatives of 20 dedicated members, each receiving high-quality tractors sourced from reputable manufacturers in China and the United States — procured through transparent, accountable financing with no middlemen. These cooperatives will partner with U.S. Chambers of Commerce, including AmCham Zambia, to access expert sourcing, maintenance support, and export pathways to American markets.',
          benefits: [
            'Cultivate larger areas more quickly to maximise each rainy season and diversify crops.',
            'Reduce the burden of manual labour, freeing youth and women to focus on value addition and family welfare.',
            'Dramatically boost yields — turning subsistence farming into surplus production for real income and food security.',
            'Build economic independence: your cooperative owns its assets and grows its own profits.',
          ],
        },
        {
          num: '2',
          title: 'Harrows — Building the Foundation Your Crops Deserve',
          body: 'Healthy soil is the foundation of every successful harvest. Through 20-member citizen cooperatives, Build One Zambia will deliver harrows from trusted manufacturers in China and the United States, with transparent financing and allocation.',
          benefits: [
            'Create fine, uniform seedbeds that maximise germination and plant health.',
            'Incorporate fertilisers and crop residues effectively for nutrient-rich, productive soil.',
            'Control weeds early to save time and reduce manual labour requirements.',
            'Invest in long-term soil health for sustained productivity and growing household income.',
          ],
        },
        {
          num: '3',
          title: "Disc Implements — Cutting Through Barriers to Bigger Yields",
          body: "Zambia's diverse soils demand tools that do not compromise. Build One Zambia will equip cooperatives with robust disc ploughs and disc harrows sourced from manufacturers in China and the United States, procured transparently and supported by U.S. Chamber of Commerce expertise.",
          benefits: [
            'Tackle heavy clay, weedy, or compacted soils with minimal effort.',
            'Promote conservation tillage practices for healthier, erosion-resistant farmland.',
            'Prepare fields faster to reduce delays and post-harvest risks.',
            'Turn challenging conditions into opportunities for higher productivity and profits.',
          ],
        },
        {
          num: '4',
          title: 'Precision Planters — Planting Smarter, Harvesting More',
          body: 'No more uneven rows or wasted seed. Through cooperatives of 20 members, Build One Zambia will deliver precision planters from China and the United States with accountable financing. U.S. Chamber partnerships will provide calibration training, market access, and export pathways for surplus production.',
          benefits: [
            'Achieve exact seed spacing and depth for optimal growth and easier crop management.',
            'Significantly reduce seed waste while boosting germination rates.',
            'Plant quickly to align with seasonal rains — critical for higher, marketable yields.',
            'Diversify into cash crops for greater and more reliable household income.',
          ],
        },
        {
          num: '5',
          title: 'Irrigation Equipment — Farming Every Season, Thriving Every Year',
          body: 'Rainfall cannot be controlled, but with the right infrastructure, your success can be. Build One Zambia will provide subsidised irrigation equipment — including pumps, drip systems, and sprinklers from China and the United States — to 20-member cooperatives, with transparent delivery and U.S. Chamber technical support. We prioritise solar-powered, low-maintenance irrigation systems in drought-prone areas.',
          benefits: [
            'Unlock dry-season cropping for double or triple annual income.',
            'Grow high-value vegetables, fruits, and specialty crops profitably.',
            'Mitigate climate risks and ensure consistent family nutrition year-round.',
            'Achieve genuine economic independence through reliable, year-round production.',
          ],
        },
      ].map(item => (
        <div key={item.num} className="mb-6 p-7" style={{ backgroundColor: '#111', border: '1px solid #1f1f1f' }}>
          <div className="flex items-start gap-5">
            <div className="w-10 h-10 flex items-center justify-center shrink-0 font-bold" style={{ backgroundColor: '#dc2626', fontFamily: 'Oswald, sans-serif', fontSize: '1.1rem', color: '#fff' }}>
              {item.num}
            </div>
            <div className="flex-1">
              <H3>{item.title}</H3>
              <BodyText className="mb-4">{item.body}</BodyText>
              <p className="text-xs mb-2 font-semibold tracking-wider" style={{ color: '#dc2626', fontFamily: 'Oswald, sans-serif' }}>WHAT THIS MEANS FOR YOU</p>
              <BulletList items={item.benefits} />
            </div>
          </div>
        </div>
      ))}

      <Blockquote>Water is life. With Build One Zambia, prosperity is within reach for every Zambian farmer.</Blockquote>
    </div>
  );
}

function HousingPanel() {
  return (
    <div>
      <div className="grid lg:grid-cols-2 gap-12 items-start mb-12">
        <div>
          <SectionLabel text="HOMES FOR ZAMBIANS" />
          <H2>Housing Revolution</H2>
          <BodyText className="mb-4">
            A Home for Every Zambian Family — Our Promise for 2026 and Beyond. For too long, Zambian families have faced preventable disease, lived in unsafe and unplanned settlements, paid unaffordable rents, and watched a privileged few grow wealthy from corrupt contracts while many remain homeless or without security.
          </BodyText>
          <p style={{ color: '#dc2626', fontFamily: 'Oswald, sans-serif', fontSize: '1.1rem', letterSpacing: '0.04em' }}>That ends now.</p>
          <BodyText className="mt-4">
            Under the Build One Zambia government, we will take direct responsibility for rebuilding our country. No more costly, corrupt contracting systems. Instead, we will own and deploy modern construction machinery in every municipality across Zambia. Zambian workers, youth, and communities will operate these machines to build safe, modern homes for themselves and their neighbours.
          </BodyText>
        </div>
        <div className="overflow-hidden" style={{ height: '360px' }}>
          <ImageWithFallback src={HOUSING_IMG} alt="Housing construction" className="w-full h-full object-cover" />
        </div>
      </div>

      <div className="mb-8 p-7" style={{ backgroundColor: '#111', border: '1px solid #1f1f1f' }}>
        <H3>Redeveloping Unplanned Settlements with Dignity</H3>
        <BodyText className="mb-4">We will redevelop unplanned settlements and informal compounds across Zambia — not by displacing residents, but by replacing small, unsafe structures with tall, modern buildings that offer proper sanitation, clean water, reliable electricity, and genuine dignity for all families.</BodyText>
        <BulletList items={[
          'Current title holders in affected areas will receive first priority and the freedom to choose their preferred floor in the new buildings — beginning with the ground floor if they wish.',
          'Remaining units will be allocated to fellow Zambians who currently cannot afford secure housing.',
          'Government will provide free labour support so that no family is left behind.',
          'Only Zambians will own homes. Foreign nationals may rent units, but ownership belongs exclusively to our people.',
        ]} />
        <Blockquote>No Zambian should live in rented accommodation indefinitely. Home ownership is a right, not a privilege.</Blockquote>
      </div>

      <div className="mb-8 p-7" style={{ backgroundColor: '#111', border: '1px solid #1f1f1f' }}>
        <H3>Going Further — Infrastructure for Dignity</H3>
        <BulletList items={[
          'Construct tourism hotels owned and operated by Zambian entrepreneurs to create jobs and strengthen our economy.',
          'Build new dams and upgrade water systems so every home has clean, running water around the clock.',
          'Install modern sewage infrastructure across cities and towns to permanently end cholera outbreaks.',
          'Equip each district with its own electricity generation capacity, ensuring reliable and affordable power for all.',
        ]} />
        <BodyText className="mt-4">Zambians will lead every phase of construction. This is our work, our pride. Foreign engineers and architects will be engaged solely to support and train our teams — never to replace them.</BodyText>
      </div>

      <h3 className="mb-6 text-white" style={{ fontFamily: 'Oswald, sans-serif', fontSize: '1.3rem', letterSpacing: '0.06em' }}>The Machinery That Will Build the New Zambia</h3>
      <div className="grid md:grid-cols-2 gap-4 mb-8">
        {[
          { title: 'Tower Cranes — Lifting Zambia to New Heights', desc: 'Deployed in every major municipality, they will enable us to replace low, unsafe structures in unplanned settlements with strong, multi-storey buildings — offering current residents priority ownership of floors while opening homeownership to thousands more Zambian families.' },
          { title: 'Concrete Pumps — Delivering Strength to Every Floor', desc: 'Boom pumps, line pumps, and trailer pumps deliver fresh concrete precisely and continuously to upper floors, walls, and slabs — ensuring uniform, high-strength pours without interruption.' },
          { title: 'Passenger Hoists — Safe, Fast Access for Zambian Builders', desc: 'High-speed, enclosed construction elevators safely transport workers, tools, and materials to upper levels — protecting our workforce, reducing fatigue, and enabling communities to construct tall buildings with confidence and pride.' },
          { title: 'Concrete Batching Plants — Quality Concrete, Made in Zambia', desc: 'Positioned across the country, we reduce dependence on distant suppliers, lower transport costs, maintain material quality for every high-rise and public facility, and accelerate construction timelines.' },
          { title: "Stone Crushers — Turning Zambia's Resources into Homes", desc: 'Stone crushers process raw rock and recycled materials into the sand, gravel, and crushed stone required for concrete, foundations, and roads. Locally positioned crushers cut import costs and create community employment.' },
        ].map(m => (
          <div key={m.title} className="p-6" style={{ backgroundColor: '#111', border: '1px solid #1f1f1f' }}>
            <h4 className="mb-2 text-white" style={{ fontFamily: 'Oswald, sans-serif', fontSize: '0.95rem', letterSpacing: '0.04em' }}>{m.title}</h4>
            <p style={{ color: '#9ca3af', fontSize: '14px', lineHeight: 1.75 }}>{m.desc}</p>
          </div>
        ))}
      </div>

      <Blockquote>
        The old system enriched foreigners and a handful of corrupt officials. Our system enriches Zambian families, Zambian communities, and Zambia's future. This is the Zambia we are building — together.
      </Blockquote>
    </div>
  );
}

function MiningPanel() {
  return (
    <div>
      <div className="grid lg:grid-cols-2 gap-12 items-start mb-12">
        <div>
          <SectionLabel text="ZAMBIA'S WEALTH FOR ZAMBIANS" />
          <H2>Mining Strategy</H2>
          <BodyText className="mb-4">
            Zambia is blessed with some of the richest mineral deposits on earth. For too long, however, our people have watched that wealth depart our borders as foreign companies and a handful of corrupt officials captured the profits. That era ends with Build One Zambia.
          </BodyText>
          <p style={{ color: '#dc2626', fontFamily: 'Oswald, sans-serif', fontSize: '1.1rem', letterSpacing: '0.04em' }}>
            Our vision is clear and powerful: Zambians will develop Zambia's minerals for Zambians.
          </p>
        </div>
        <div className="overflow-hidden" style={{ height: '340px' }}>
          <ImageWithFallback src={MINING_IMG} alt="Zambian mining" className="w-full h-full object-cover" />
        </div>
      </div>

      <div className="mb-8 p-7" style={{ backgroundColor: '#111', border: '1px solid #1f1f1f' }}>
        <H3>Our Plan</H3>
        <BulletList items={[
          'All new mines will be 100% Zambian-owned.',
          'Existing foreign-owned mines will retain their current ownership structures, but will no longer be permitted to export raw minerals. Instead, they must sell their entire ore output to Zambian-owned processing companies that convert it into finished products for the global market.',
          'These Zambian processing companies will partner with reputable investors from China and the United States, securing capital and technology without ceding ownership of our resources.',
          'The government will supply heavy machinery and build modern infrastructure in every mineral-rich municipality, enabling local entrepreneurs to establish factories across the country.',
          'All manual labour and machinery operation will be performed by Zambian men and women. Only individual foreign engineers — engaged on personal contracts, never through foreign companies — will be permitted on site.',
          'Virtually all materials required for factories and infrastructure will be sourced and manufactured locally.',
        ]} />
        <BodyText className="mt-4">
          This is not a campaign slogan. It is a comprehensive overhaul that will multiply government revenue, create hundreds of thousands of well-paying jobs, establish factories in every province, and ensure that ordinary Zambian families share in the prosperity that is rightfully theirs.
        </BodyText>
      </div>

      {[
        {
          title: "Copper — Zambia's Economic Backbone",
          body: "Copper accounts for more than 70% of Zambia's export earnings. We are already Africa's second-largest producer and among the world's top ten. In 2025, Zambia achieved a record 890,346 metric tonnes of copper production — an 8% increase — with Konkola Copper Mines alone quadrupling output to over 80,000 tonnes. Yet under the old system, most of this wealth departed our shores as raw cathodes and concentrates. Our strategy transforms this reality. New copper projects will be fully Zambian-owned from inception. Existing major operations — Lumwana, Konkola, Mopani, and Kansanshi — will continue under their current owners but will be required to sell their entire output to Zambian processing companies. These local firms will manufacture finished copper products: wires, cables, busbars, and components for electric vehicles, renewable energy, and artificial intelligence industries.",
        },
        {
          title: 'Battery and Critical Minerals — Powering the Global Green Revolution from Zambia',
          body: "The world is accelerating toward electric vehicles, renewable energy, and advanced technology. Cobalt, nickel, lithium, graphite, and rare earth elements are the essential raw materials of that future — and Zambia is uniquely positioned to supply them. Cobalt production has surged dramatically, with Zambia already hosting six active operations and Africa's first major cobalt sulphate refinery now coming online. High-grade lithium deposits in the Choma Belt and flake graphite in Eastern Province are ready for development. All new projects in these critical minerals will be 100% Zambian-owned.",
        },
        {
          title: 'Gold, Manganese and Gemstones — Diversifying Wealth Across Every Community',
          body: "Zambia's gold, manganese, and world-class gemstones represent enormous potential for rural development and export diversification. Zambia is the world's largest emerald producer, led by the iconic Kagem mine. Manganese output in Luapula Province has more than doubled over the past decade. Our strategy ends exploitation. New mines and processing facilities will be Zambian-owned. Partnerships with Chinese and American investors will bring polishing and jewellery-making technology without surrendering ownership.",
        },
      ].map(s => (
        <div key={s.title} className="mb-6 p-7" style={{ backgroundColor: '#111', border: '1px solid #1f1f1f' }}>
          <H3>{s.title}</H3>
          <BodyText>{s.body}</BodyText>
        </div>
      ))}

      <Blockquote>
        From the villages of Luapula to the hills of Southern Province, our gemstones, gold, and manganese will finally lift families, fund schools, and build clinics — because the wealth will belong to the people who own the land.
      </Blockquote>
    </div>
  );
}

function GovernancePanel() {
  return (
    <div>
      <div className="grid lg:grid-cols-2 gap-12 items-start mb-12">
        <div>
          <SectionLabel text="PEOPLE-CENTRED POWER" />
          <H2>Our Vision for Governance</H2>
          <BodyText className="mb-4">
            Build One Zambia is committed to decentralising power in order to make governance more responsive, inclusive, and accountable. We will establish a robust three-sphere system — national, provincial, and local — with clear and distinct mandates to ensure efficiency and genuine accountability at every level.
          </BodyText>
        </div>
        <div className="overflow-hidden" style={{ height: '320px' }}>
          <ImageWithFallback src={GOV_IMG} alt="Community gathering" className="w-full h-full object-cover" />
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-10">
        {[
          { sphere: 'National Government', desc: 'The central hub for national legislation, defence, foreign relations, and macroeconomic strategy — uniting all provinces under one flag and one purpose.' },
          { sphere: 'Provincial Parliaments', desc: "Newly established in each of Zambia's ten provinces, these bodies will manage regional development — from infrastructure and education to health and agriculture. The provincial leader will be appointed by the paramount chief, honouring our traditional structures." },
          { sphere: 'Local Council Chambers', desc: 'Strengthened at the municipal level, these councils will focus on the day-to-day services that matter most to citizens: water supply, sanitation, community facilities, and local economic development.' },
        ].map(s => (
          <div key={s.sphere} className="p-7" style={{ backgroundColor: '#111', border: '1px solid #1f1f1f', borderTop: '3px solid #dc2626' }}>
            <h3 className="mb-3 text-white" style={{ fontFamily: 'Oswald, sans-serif', fontSize: '1rem', letterSpacing: '0.06em' }}>{s.sphere}</h3>
            <p style={{ color: '#9ca3af', fontSize: '14px', lineHeight: 1.8 }}>{s.desc}</p>
          </div>
        ))}
      </div>

      <div className="p-7 mb-8" style={{ backgroundColor: '#111', border: '1px solid #1f1f1f' }}>
        <H3>Strategic Development in Every Province</H3>
        <BulletList items={[
          'Power plants to end load-shedding and support economic growth.',
          'Fertiliser plants to enhance agricultural productivity and reduce dependence on imports.',
          'Cement production facilities for affordable, sustainable building materials.',
          'Stone crushing plants to boost construction and support the mining and infrastructure sectors.',
        ]} />
        <BodyText className="mt-4">
          By appointing provincial leaders through paramount chiefs, we combine modern governance with cultural heritage — reducing the risk of corruption and increasing public trust. Decisions will no longer be trapped in Lusaka. With provincial parliaments, your voice will be stronger, and the benefits — energy independence, economic growth, quality services — will be real and tangible.
        </BodyText>
      </div>

      {/* Housing & Community Infrastructure Projects */}
      <h3 className="mb-6 text-white" style={{ fontFamily: 'Oswald, sans-serif', fontSize: '1.3rem', letterSpacing: '0.06em' }}>Projects We Commit to Delivering</h3>
      <div className="grid md:grid-cols-2 gap-4">
        {[
          { title: 'Modern Schools in Every Ward', desc: 'We will construct and fully equip modern primary and secondary schools across every ward in the country — complete with laboratories, libraries, ICT labs, clean water, sanitation facilities, and solar power.' },
          { title: 'University of Zambia Campuses in All Ten Provinces', desc: "Quality higher education has been concentrated in Lusaka for too long. We will establish a full UNZA satellite campus in each of Zambia's ten provinces with faculties tailored to regional strengths." },
          { title: 'Technical and Vocational Colleges in Every District', desc: 'We will build and fully equip modern technical and vocational colleges in every district, training young Zambians in engineering, mechanics, construction, ICT, agriculture, and renewable energy.' },
          { title: 'District and Provincial Hospitals', desc: 'We will construct modern district hospitals in underserved areas and upgrade provincial referral hospitals with state-of-the-art operating theatres, laboratories, maternity wings, and specialist clinics.' },
          { title: 'International-Standard Stadiums', desc: 'Modern stadiums and sports complexes in every province — venues capable of hosting national league matches, international tournaments, concerts, and community events — nurturing the next Chipolopolo champions.' },
          { title: 'Recreation Parks, Libraries & Cultural Museums', desc: 'Beautiful public parks in every urban centre, well-stocked public libraries in every constituency, and dedicated cultural museums honouring all 73 of Zambia\'s tribes — preserving our heritage while embracing progress.' },
        ].map(p => (
          <div key={p.title} className="p-6" style={{ backgroundColor: '#111', border: '1px solid #1f1f1f' }}>
            <h4 className="mb-2 text-white" style={{ fontFamily: 'Oswald, sans-serif', fontSize: '0.95rem', letterSpacing: '0.04em' }}>{p.title}</h4>
            <p style={{ color: '#9ca3af', fontSize: '14px', lineHeight: 1.75 }}>{p.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Main component ────────────────────────────────────────────────────────── */

export function CampaignPage() {
  const [activeTab, setActiveTab] = useState('transport');

  const panels: Record<string, React.ReactNode> = {
    transport:   <TransportPanel />,
    agriculture: <AgriculturePanel />,
    housing:     <HousingPanel />,
    mining:      <MiningPanel />,
    governance:  <GovernancePanel />,
  };

  return (
    <div style={{ backgroundColor: '#f8fafc', fontFamily: 'Open Sans, sans-serif', color: '#1f2937' }}>

      {/* Hero */}
      <section className="relative py-24 px-4 text-center overflow-hidden" style={{ background: 'linear-gradient(160deg, #166534 0%, #15803d 45%, #16a34a 100%)' }}>
        {/* Radial glow */}
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 50% 35%, #ffffff 0%, transparent 60%)' }} />
        <div className="relative max-w-4xl mx-auto">
          <p className="text-xs tracking-widest mb-4" style={{ color: '#fef3c7', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.25em', fontWeight: 600 }}>2031 GENERAL ELECTION · 14 AUGUST 2031</p>
          <h1 className="mb-6" style={{ fontFamily: 'Oswald, sans-serif', fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', lineHeight: 1.1, letterSpacing: '0.03em', color: '#ffffff' }}>
            OUR <span style={{ color: '#fbbf24' }}>CAMPAIGN</span> PLATFORM
          </h1>
          <p className="max-w-2xl mx-auto" style={{ color: '#f0fdf4', fontSize: '1.05rem', lineHeight: 1.85 }}>
            Build One Zambia is committed to a Zambia First development philosophy — practical, people-centred, and firmly opposed to the old system of endless contracts and corruption that drains our national resources.
          </p>
        </div>
      </section>

      {/* Equipment slideshow — full width below hero text */}
      <EquipmentParade />

      {/* Tab bar */}
      <div className="sticky top-20 z-20 py-4 px-4" style={{ backgroundColor: '#ffffff', borderBottom: '2px solid #e5e7eb', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
        <div className="max-w-4xl mx-auto flex flex-wrap justify-center gap-2">
          {TABS.map(t => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className="flex items-center gap-2 px-5 py-2.5 transition-all"
                style={{
                  fontFamily: 'Oswald, sans-serif', fontSize: '13px', letterSpacing: '0.1em',
                  backgroundColor: activeTab === t.id ? '#16a34a' : '#f9fafb',
                  color: activeTab === t.id ? '#fff' : '#6b7280',
                  border: `2px solid ${activeTab === t.id ? '#16a34a' : '#e5e7eb'}`,
                  borderRadius: '6px'
                }}
              >
                <Icon className="w-4 h-4" />
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Panel content */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          {panels[activeTab]}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="mb-4 text-white" style={{ fontFamily: 'Oswald, sans-serif', fontSize: 'clamp(2rem, 4vw, 3rem)', letterSpacing: '0.03em' }}>
            We will build Zambia with Zambian hands, Zambian minds, and Zambian resources.
          </h2>
          <p className="mb-8" style={{ fontSize: '15px', color: '#fef3c7' }}>Vote Build One Zambia — 14 August 2031</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/register/member" className="inline-flex items-center gap-2 px-8 py-4 font-bold bg-white transition-all hover:opacity-90" style={{ fontFamily: 'Oswald, sans-serif', fontSize: '14px', letterSpacing: '0.1em', color: '#d97706', borderRadius: '6px' }}>
              JOIN THE MOVEMENT <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/results" className="inline-flex items-center gap-2 px-8 py-4 font-bold text-white transition-all" style={{ fontFamily: 'Oswald, sans-serif', fontSize: '14px', letterSpacing: '0.1em', border: '2px solid #ffffff', borderRadius: '6px' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(255,255,255,0.15)'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'}
            >
              VIEW RESULTS PORTAL
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}