import { useEffect } from 'react';
import { useLocation, Link } from 'react-router';
import {
  ArrowRight, Home, Users, FileText, Newspaper, BarChart2,
  ShoppingBag, Music, Video, MapPin, BookOpen, Scale,
  CheckCircle2, Mail, GraduationCap, Building2, ClipboardList,
  Shield, Camera, Globe, Vote, ChevronRight,
} from 'lucide-react';

const O = '#007A30';
const R = '#dc2626';
const NAVY = '#030d06';

// ── All website sections ──────────────────────────────────────────────────────

const SITE_SECTIONS = [
  {
    group: 'MAIN WEBSITE',
    color: '#007A30',
    pages: [
      {
        icon: Home, title: 'Home', path: '/',
        desc: 'The official Build One Zambia homepage — mission statement, latest updates, presidential candidate introduction, and campaign highlights.',
        sub: [],
      },
      {
        icon: Users, title: 'About Us', path: '/about',
        desc: "Learn about the Build One Zambia movement — our founding story, national leadership structure, provincial leaders, and the vision driving Zambia's renewal.",
        sub: [{ label: 'Leadership Team', path: '/about#leadership' }],
      },
      {
        icon: FileText, title: 'Campaign Platform', path: '/campaign',
        desc: 'The full BOZ 2026 policy platform — homes, power, fertiliser, cement, global connectivity, SME support, water, education, health, and mineral resources.',
        sub: [],
      },
      {
        icon: Mail, title: 'Contact & Donate', path: '/contact',
        desc: 'Get in touch with Build One Zambia national headquarters, reach provincial offices, or make a financial contribution to the campaign.',
        sub: [{ label: 'Make a Donation', path: '/donate' }],
      },
      {
        icon: ShoppingBag, title: 'BOZ Shop', path: '/shop',
        desc: "Buy official Build One Zambia merchandise — T-shirts, caps, flags, wristbands, and campaign materials. All proceeds support the people's movement.",
        sub: [],
      },
    ],
  },
  {
    group: 'CANDIDATES',
    color: '#0ea5e9',
    pages: [
      {
        icon: Users, title: 'Male Candidates', path: '/home/male',
        desc: "Meet all 23 BOZ male shadow cabinet candidates — presidential candidate Vincent Kafula, economists, lawyers, academics, and former ministers with proven track records.",
        sub: [
          { label: 'Vincent Kafula — Presidential Candidate', path: '/home/male' },
          { label: 'Dr. Lubinda Haabazoka — Energy & Electricity', path: '/home/male' },
          { label: 'Makebi Zulu, SC — Employment & Labour', path: '/home/male' },
          { label: 'Hon. Robert Sichinga — Agriculture', path: '/home/male' },
          { label: 'John Sangwa, SC — Justice', path: '/home/male' },
          { label: 'Hon. Miles Sampa — Infrastructure', path: '/home/male' },
          { label: 'Hon. Harry Kalaba — International Relations', path: '/home/male' },
          { label: "Dr. Fred M'membe — Communications", path: '/home/male' },
          { label: 'Dr. Sishuwa Sishuwa — Home Affairs', path: '/home/male' },
          { label: 'Hon. Sakwiba Sikota, SC — Lands', path: '/home/male' },
          { label: 'Kelvin Bwalya Fube (KBF) — Correctional Services', path: '/home/male' },
          { label: 'Hon. Sean Tembo — Sports & Youth', path: '/home/male' },
          { label: 'Hon. Gary Nkombo — Basic Education', path: '/home/male' },
          { label: 'Hon. Highvie Hamududu — Finance (Budget)', path: '/home/male' },
          { label: "Hon. Christopher Kang'ombe — Mineral Resources", path: '/home/male' },
          { label: 'Hon. Kasonde Mwenda — Tourism', path: '/home/male' },
          { label: 'Hon. Greyford Monde — Science & Technology', path: '/home/male' },
          { label: 'John Kapila — Public Health', path: '/home/male' },
          { label: 'Sililo Mwala — Gender & Community', path: '/home/male' },
          { label: 'Hon. Given Lubinda — Water & Sanitation', path: '/home/male' },
          { label: 'Hon. Binwell Mpundu — Local Government', path: '/home/male' },
          { label: 'Hon. Franklyn Luando — Planning & Evaluation', path: '/home/male' },
          { label: 'Hon. Kanyanta Kapwepwe — Small Business', path: '/home/male' },
        ],
      },
      {
        icon: Users, title: 'Female Candidates', path: '/home/female',
        desc: 'Meet all 10 BOZ female shadow cabinet candidates — Vice Presidential candidate Tasila Lungu Mwansa, finance experts, health professionals, and experienced leaders.',
        sub: [
          { label: 'Hon. Tasila Lungu Mwansa — Vice President', path: '/home/female' },
          { label: 'H.E. Chileshe Kapwepwe — Finance', path: '/home/female' },
          { label: 'Dr. Dolika Banda — Trade & Industry', path: '/home/female' },
          { label: 'Prof. Nkandu Luo — Health', path: '/home/female' },
          { label: 'Hon. Saboi Imboela — Social Welfare', path: '/home/female' },
          { label: 'Hon. Kampamba Mulenga — Education', path: '/home/female' },
          { label: 'Dr. Dora Siliya — Information & Media', path: '/home/female' },
          { label: 'Hon. Chishala Kateka — Human Settlements', path: '/home/female' },
          { label: 'Hon. Margaret Mwanakatwe — Commerce', path: '/home/female' },
          { label: 'Mwitwa Mushibwe — Rural Development', path: '/home/female' },
        ],
      },
    ],
  },
  {
    group: 'MEDIA & NEWS',
    color: '#0891b2',
    pages: [
      {
        icon: Newspaper, title: 'Latest News', path: '/news/latest',
        desc: 'Breaking news, campaign updates, policy announcements, and the latest developments from Build One Zambia across the country.',
        sub: [],
      },
      {
        icon: FileText, title: 'Press Statements', path: '/news/press-statements',
        desc: 'Official press releases, open letters, media statements, and formal responses from Build One Zambia on national issues.',
        sub: [],
      },
      {
        icon: Video, title: 'Live Streaming', path: '/news/live',
        desc: 'Watch live campaign rallies, town halls, press conferences, and major events as they happen across Zambia.',
        sub: [],
      },
      {
        icon: Music, title: 'Party Music', path: '/news/music',
        desc: 'Listen to the official BOZ campaign songs, anthems, and audio content produced in support of the Build One Zambia 2026 election drive.',
        sub: [],
      },
      {
        icon: Camera, title: 'Events Gallery', path: '/news/gallery',
        desc: 'Photos and videos from rallies, community meetings, provincial tours, and campaign events across all 10 Zambian provinces.',
        sub: [],
      },
      {
        icon: BookOpen, title: 'Documents Library', path: '/news/documents',
        desc: 'Download the full BOZ manifesto, policy briefs, position papers, financial disclosures, and official party documents.',
        sub: [],
      },
    ],
  },
  {
    group: 'ELECTION RESULTS PORTAL',
    color: '#dc2626',
    pages: [
      {
        icon: BarChart2, title: 'Results Dashboard', path: '/results',
        desc: 'Live national election results dashboard — real-time tallies from all 13,529 polling stations across Zambia\'s 10 provinces, updated as agents report.',
        sub: [],
      },
      {
        icon: Vote, title: 'Presidential Results', path: '/results/presidential',
        desc: 'Live presidential election results — candidate vote shares, province-by-province breakdown, and station-level drill-down across all of Zambia.',
        sub: [],
      },
      {
        icon: Building2, title: 'Parliamentary Results', path: '/results/parliament',
        desc: 'National Assembly MP results — 226 constituency races, candidate tallies, turnout, and seat projections updated in real time.',
        sub: [],
      },
      {
        icon: Building2, title: 'Mayoral Results', path: '/results/mayoral',
        desc: 'City and district council leadership results — mayoral races across all districts with live candidate standings.',
        sub: [],
      },
      {
        icon: MapPin, title: 'Councillor Results', path: '/results/councillor',
        desc: 'Ward councillor results across all 1,858 wards in Zambia — local government representation tracked station by station.',
        sub: [],
      },
    ],
  },
  {
    group: 'JOIN US',
    color: '#16a34a',
    pages: [
      {
        icon: Users, title: 'Become a Member', path: '/register/member',
        desc: 'Register as an official Build One Zambia party member — receive your membership card, access exclusive member benefits, and vote in party decisions.',
        sub: [],
      },
      {
        icon: Building2, title: 'Register a Cooperative', path: '/register/cooperative',
        desc: 'Register your farming, business, or community cooperative with Build One Zambia — access equipment, export opportunities, and investor connections.',
        sub: [],
      },
      {
        icon: GraduationCap, title: 'Internship Programme', path: '/register/internship',
        desc: 'Apply for the Zambia–USA Partnership Internship — structured placements connecting Zambian graduates with US chambers of commerce and business networks.',
        sub: [],
      },
      {
        icon: Globe, title: 'Opportunities', path: '/home/opportunities',
        desc: 'Explore career, business, and development opportunities created through the BOZ global chamber network and investment partnerships.',
        sub: [],
      },
    ],
  },
  {
    group: 'DASHBOARDS (RESTRICTED)',
    color: '#7c3aed',
    pages: [
      {
        icon: ClipboardList, title: 'Election Dashboard', path: '/dashboard-login',
        desc: 'Secure portal for accredited BOZ polling agents — submit verified results, verify voter cards, and receive notices from ward supervisors. Password required.',
        sub: [],
      },
      {
        icon: Shield, title: 'Management Dashboard', path: '/dashboard-login',
        desc: 'Multi-tier management dashboard for ward, constituency, district, provincial, and national managers — approve results, compare ECZ figures, send notices. Password required.',
        sub: [],
      },
    ],
  },
];

// ── Supporting content ────────────────────────────────────────────────────────

const TRANSPARENCY_PRINCIPLES = [
  { title: 'Independent Verification', desc: 'Results are submitted by on-the-ground observers, independent of government or ECZ systems.' },
  { title: 'Real-Time Reporting', desc: 'Data is published as submissions are received, giving Zambians live visibility into the count.' },
  { title: 'Full Data Transparency', desc: 'All submitted results, including station-level data, are publicly accessible.' },
  { title: 'Auditable Trail', desc: 'Every submission is logged and traceable, ensuring accountability at every stage.' },
];

function SectionHeader({ label, title }: { label: string; title: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '32px' }}>
      <p style={{ fontSize: '11px', letterSpacing: '0.22em', color: R, fontFamily: 'Oswald, sans-serif', fontWeight: 600, marginBottom: '10px' }}>{label}</p>
      <h2 style={{ fontFamily: 'Oswald, sans-serif', fontSize: 'clamp(1.7rem, 3.5vw, 2.4rem)', letterSpacing: '0.03em', color: '#fff', margin: 0, lineHeight: 1.15 }}>{title}</h2>
    </div>
  );
}

export function PagesPage() {
  const { hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const el = document.querySelector(hash);
      if (el) setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 120);
    }
  }, [hash]);

  return (
    <div style={{ backgroundColor: NAVY, fontFamily: 'Open Sans, sans-serif', color: '#fff' }}>

      {/* Hero */}
      <section style={{ position: 'relative', padding: '112px 16px 80px', textAlign: 'center', overflow: 'hidden', background: `linear-gradient(135deg, ${O} 0%, #006B28 40%, #1a0000 100%)` }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 50% 40%, rgba(220,38,38,0.10) 0%, transparent 60%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', maxWidth: '860px', margin: '0 auto' }}>
          <p style={{ fontSize: '11px', letterSpacing: '0.22em', color: R, fontFamily: 'Oswald, sans-serif', fontWeight: 600, marginBottom: '14px' }}>SITEMAP</p>
          <h1 style={{ fontFamily: 'Oswald, sans-serif', fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', lineHeight: 1.1, letterSpacing: '0.03em', marginBottom: '20px' }}>
            ALL <span style={{ color: R }}>PAGES</span> & INFORMATION
          </h1>
          <p style={{ color: '#9ca3af', fontSize: '1.05rem', lineHeight: 1.8, maxWidth: '640px', margin: '0 auto' }}>
            Every page, section, and resource on the Build One Zambia website — candidates, campaign policies, election results, media, registration, and dashboards — all in one place.
          </p>
        </div>
      </section>

      {/* Quick jump links */}
      <section style={{ backgroundColor: '#0a1a10', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '16px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
          {SITE_SECTIONS.map(s => (
            <a key={s.group} href={`#${s.group.toLowerCase().replace(/\s+/g, '-').replace(/[()]/g, '')}`}
              style={{ fontSize: '11px', letterSpacing: '0.1em', fontFamily: 'Oswald, sans-serif', color: s.color, padding: '6px 14px', border: `1px solid ${s.color}40`, borderRadius: '999px', textDecoration: 'none', transition: 'background 0.2s' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.backgroundColor = `${s.color}15`}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'}>
              {s.group}
            </a>
          ))}
        </div>
      </section>

      {/* All sections */}
      {SITE_SECTIONS.map((section, si) => (
        <section
          key={section.group}
          id={section.group.toLowerCase().replace(/\s+/g, '-').replace(/[()]/g, '')}
          style={{ padding: '72px 16px', backgroundColor: si % 2 === 0 ? NAVY : '#0a1a10', scrollMarginTop: '80px' }}
        >
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            {/* Section heading */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px' }}>
              <div style={{ width: '4px', height: '32px', backgroundColor: section.color, borderRadius: '2px' }} />
              <h2 style={{ fontFamily: 'Oswald, sans-serif', fontSize: 'clamp(1.2rem, 2.5vw, 1.6rem)', letterSpacing: '0.08em', color: '#fff', margin: 0 }}>
                {section.group}
              </h2>
            </div>

            {/* Page cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
              {section.pages.map(page => (
                <div
                  key={page.title}
                  style={{ backgroundColor: '#111', border: `1px solid rgba(255,255,255,0.06)`, borderRadius: '12px', overflow: 'hidden', display: 'flex', flexDirection: 'column', transition: 'border-color 0.2s' }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = `${section.color}50`}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.06)'}
                >
                  {/* Card header */}
                  <div style={{ padding: '24px 24px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: `${section.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <page.icon style={{ width: '20px', height: '20px', color: section.color }} />
                      </div>
                      <Link
                        to={page.path}
                        style={{ fontFamily: 'Oswald, sans-serif', fontSize: '1.05rem', letterSpacing: '0.04em', color: '#fff', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}
                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = section.color}
                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = '#fff'}
                      >
                        {page.title}
                        <ArrowRight style={{ width: '14px', height: '14px', flexShrink: 0 }} />
                      </Link>
                    </div>
                    <p style={{ fontSize: '13px', lineHeight: 1.75, color: '#9ca3af', margin: 0 }}>{page.desc}</p>
                  </div>

                  {/* Sub-links */}
                  {page.sub.length > 0 && (
                    <div style={{ padding: '12px 24px 16px', flex: 1 }}>
                      <p style={{ fontSize: '10px', letterSpacing: '0.14em', color: 'rgba(255,255,255,0.25)', fontFamily: 'Oswald, sans-serif', marginBottom: '8px' }}>
                        {page.sub.length > 4 ? `${page.sub.length} ENTRIES` : 'INCLUDES'}
                      </p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', maxHeight: page.sub.length > 6 ? '160px' : 'none', overflowY: page.sub.length > 6 ? 'auto' : 'visible' }}>
                        {page.sub.map(sub => (
                          <Link
                            key={sub.label}
                            to={sub.path}
                            style={{ fontSize: '12px', color: '#6b7280', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px', padding: '3px 0', transition: 'color 0.15s' }}
                            onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = section.color}
                            onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = '#6b7280'}
                          >
                            <ChevronRight style={{ width: '12px', height: '12px', flexShrink: 0 }} />
                            {sub.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* CTA */}
                  <div style={{ padding: '12px 24px 20px' }}>
                    <Link
                      to={page.path}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '11px', letterSpacing: '0.08em', fontFamily: 'Oswald, sans-serif', color: section.color, textDecoration: 'none' }}
                    >
                      VISIT PAGE <ArrowRight style={{ width: '13px', height: '13px' }} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      ))}

      {/* Divider */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }} />

      {/* Election Portal */}
      <section id="portal" style={{ padding: '96px 16px', backgroundColor: O, scrollMarginTop: '80px' }}>
        <div style={{ maxWidth: '860px', margin: '0 auto' }}>
          <SectionHeader label="ELECTION PORTAL" title={<>BUILD ONE ZAMBIA <span style={{ color: R }}>ELECTION PORTAL</span></>} />
          <div style={{ fontSize: '15px', lineHeight: 1.9, color: '#c0c0c0', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <p style={{ margin: 0 }}>The Build One Zambia Election Portal is an independent civic technology platform designed to complement the official Electoral Commission of Zambia process. It serves as a parallel verification system, enabling ordinary Zambians to hold the electoral process accountable through data, evidence, and transparency.</p>
            <p style={{ margin: 0 }}>Our system enables registered polling agents to submit verified, real-time results directly from polling stations. Should any discrepancies arise between our tallied figures and the official ECZ count, Build One Zambia is committed to raising those concerns through proper legal and constitutional channels.</p>
          </div>
          <div style={{ marginTop: '40px' }}>
            <Link to="/results" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: R, color: '#fff', padding: '14px 28px', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.08em', fontSize: '13px', textDecoration: 'none', borderRadius: '4px' }}>
              VIEW RESULTS PORTAL <ArrowRight style={{ width: '15px', height: '15px' }} />
            </Link>
          </div>
        </div>
      </section>

      <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }} />

      {/* Polling Agents */}
      <section id="agents" style={{ padding: '96px 16px', backgroundColor: '#0a1a10', scrollMarginTop: '80px' }}>
        <div style={{ maxWidth: '860px', margin: '0 auto' }}>
          <SectionHeader label="CIVIC OBSERVERS" title={<>OUR <span style={{ color: R }}>POLLING AGENTS</span></>} />
          <div style={{ fontSize: '15px', lineHeight: 1.9, color: '#c0c0c0', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <p style={{ margin: 0 }}>Our polling agents are volunteers drawn from the general public and party members who are registered to vote at their respective polling stations. On election day, after casting their own votes, they remain at the polling station to observe the voting process and ensure it proceeds without intimidation or irregularity.</p>
            <p style={{ margin: 0 }}>Once voting concludes, agents observe the official vote count. When results are announced at the polling station, agents record the figures as accepted and declared by all parties present, and request confirmation from the presiding ECZ official that the results are accurate and final. The verified results are then submitted through this platform, which automatically aggregates the national tally.</p>
          </div>
          <div style={{ marginTop: '40px' }}>
            <Link to="/register/agent" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: R, color: '#fff', padding: '14px 28px', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.08em', fontSize: '13px', textDecoration: 'none', borderRadius: '4px' }}>
              BECOME A POLLING AGENT <ArrowRight style={{ width: '15px', height: '15px' }} />
            </Link>
          </div>
        </div>
      </section>

      <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }} />

      {/* Methodology */}
      <section id="methodology" style={{ padding: '96px 16px', backgroundColor: O, scrollMarginTop: '80px' }}>
        <div style={{ maxWidth: '860px', margin: '0 auto' }}>
          <SectionHeader label="HOW IT WORKS" title={<>OUR <span style={{ color: R }}>METHODOLOGY</span></>} />
          <p style={{ fontSize: '15px', lineHeight: 1.9, color: '#c0c0c0', margin: '0 0 40px' }}>
            Results are entered and uploaded by accredited polling agents stationed at each of Zambia's 13,529 registered polling stations. Every submission reflects the officially announced results at that station and is submitted only after confirmation by the presiding ECZ official.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '16px' }}>
            {[
              { num: '13,529', label: 'Polling Stations' },
              { num: '1,858',  label: 'Wards Covered' },
              { num: '226',    label: 'Constituencies' },
              { num: '116',    label: 'Districts' },
              { num: '10',     label: 'Provinces' },
              { num: '8.79M',  label: 'Registered Voters' },
            ].map(stat => (
              <div key={stat.label} style={{ backgroundColor: '#111', border: '1px solid #1f1f1f', borderTop: `3px solid ${R}`, padding: '20px 16px', borderRadius: '8px' }}>
                <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: '1.6rem', color: R, letterSpacing: '0.04em', marginBottom: '4px' }}>{stat.num}</div>
                <div style={{ fontSize: '11px', color: '#6b7280', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.06em' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }} />

      {/* Transparency */}
      <section id="transparency" style={{ padding: '96px 16px', backgroundColor: '#0a1a10', scrollMarginTop: '80px' }}>
        <div style={{ maxWidth: '860px', margin: '0 auto' }}>
          <SectionHeader label="OUR COMMITMENTS" title={<>TRANSPARENCY <span style={{ color: R }}>PRINCIPLES</span></>} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {TRANSPARENCY_PRINCIPLES.map(p => (
              <div key={p.title} style={{ display: 'flex', gap: '20px', backgroundColor: '#111', border: '1px solid #1f1f1f', padding: '28px 24px', alignItems: 'flex-start', borderRadius: '10px' }}>
                <CheckCircle2 style={{ width: '22px', height: '22px', color: R, flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <h4 style={{ fontFamily: 'Oswald, sans-serif', letterSpacing: '0.05em', fontSize: '1rem', color: '#fff', marginBottom: '6px', marginTop: 0 }}>{p.title}</h4>
                  <p style={{ fontSize: '14px', lineHeight: 1.75, color: '#6b7280', margin: 0 }}>{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
