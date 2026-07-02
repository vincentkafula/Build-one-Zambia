import { Link } from 'react-router';
import { Users, Briefcase, GraduationCap, Globe, ArrowRight, CheckCircle, TrendingUp } from 'lucide-react';

const O    = '#f97316';
const R    = '#ef4444';
const NAVY = '#1e2d4a';
const GREEN = '#16a34a';

const OPPORTUNITIES = [
  {
    icon: Users,
    title: 'Polling Agent',
    subtitle: 'Serve as an official observer at your polling station',
    color: '#007A30',
    features: [
      'Phone number verification',
      'Personal information',
      'Voter location (actual ECZ data)',
      'Document upload',
    ],
    benefits: [
      'Be part of history — observe the 2026 election',
      'Ensure votes are counted fairly',
      'Submit verified results in real time',
      'Receive official BOZ observer credentials',
      'Contribute to transparent democracy',
    ],
    cta: 'Become a Polling Agent',
    path: '/register/agent',
  },
  {
    icon: Users,
    title: 'Membership',
    subtitle: 'Register as an individual member of the party',
    color: '#3b82f6',
    features: [
      'Personal information',
      'Location details',
      'Document upload',
      'Two-factor verification',
    ],
    benefits: [
      'Access to ward-level international partnerships',
      'Connect with U.S. chambers of commerce',
      'Network with Chinese business associations',
      'Export opportunities to global markets',
      'Direct link to international investors',
    ],
    cta: 'Apply Now',
    path: '/register/member',
  },
  {
    icon: Briefcase,
    title: 'Cooperative',
    subtitle: 'Register a cooperative group with 20 members',
    color: '#16a34a',
    features: [
      '20 member group',
      'Cooperative details',
      'Chief & chairperson info',
      'Member verification codes',
    ],
    benefits: [
      'Collective bargaining power in global markets',
      'Shared export infrastructure',
      'Group access to international trade partners',
      'Navigate trade regulations together',
      'Build sustainable long-term relationships',
    ],
    cta: 'Apply Now',
    path: '/register/cooperative',
  },
  {
    icon: GraduationCap,
    title: 'Internship',
    subtitle: 'Register for a political internship program',
    color: '#9333ea',
    features: [
      'Membership verification',
      'University details',
      'Course information',
      'Year of study',
    ],
    benefits: [
      'Hands-on political campaign experience',
      'Learn international trade policy',
      'Network with global business leaders',
      'Career development in public service',
      'Build skills in economic diplomacy',
    ],
    cta: 'Apply Now',
    path: '/register/internship',
  },
];

const PARTNERSHIP_STATS = [
  { value: '1,858',  label: 'Zambian Wards Connected', icon: Globe },
  { value: '7,000+', label: 'U.S. Chambers of Commerce', icon: TrendingUp },
  { value: '3',      label: 'Continents Linked', icon: Users },
  { value: '100%',   label: 'Ward Coverage Target', icon: CheckCircle },
];

const VISION_POINTS = [
  {
    title: 'Export to Global Markets',
    desc: 'Help Zambian farmers, manufacturers, and entrepreneurs export products to U.S., Chinese, and global markets.',
    icon: Globe,
  },
  {
    title: 'Connect with International Investors',
    desc: 'Link local businesses with investors from America, China, and around the world to expand market reach.',
    icon: TrendingUp,
  },
  {
    title: 'Navigate Trade Regulations',
    desc: 'Expert guidance to navigate trade regulations across multiple countries and build sustainable relationships.',
    icon: Briefcase,
  },
];

export function OpportunitiesPage() {
  return (
    <div style={{ backgroundColor: '#fafafa', fontFamily: 'Open Sans, sans-serif', color: NAVY }}>

      {/* Hero header */}
      <section className="relative py-16 px-4 text-center overflow-hidden" style={{ background: 'linear-gradient(135deg, #007A30 0%, #006B28 40%, #1a0000 100%)' }}>
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `radial-gradient(circle at 50% 40%, ${O} 0%, transparent 60%)` }} />
        <div className="relative max-w-4xl mx-auto">
          <p className="text-xs tracking-widest mb-4" style={{ color: O, fontFamily: 'Oswald, sans-serif' }}>BUILD ONE ZAMBIA · REGISTRATION & PARTNERSHIPS</p>
          <h1 className="mb-4" style={{ fontFamily: 'Oswald, sans-serif', fontSize: 'clamp(2.2rem, 5vw, 4rem)', lineHeight: 1.1, letterSpacing: '0.03em', color: '#fff' }}>
            GLOBAL <span style={{ color: O }}>OPPORTUNITIES</span>
          </h1>
          <p style={{ color: '#9ca3af', fontSize: '1rem', lineHeight: 1.8, maxWidth: '640px', margin: '0 auto' }}>
            Unite Zambians, Americans, Chinese, and people from across the world — forging lasting people-to-people and economic ties between our nation and the global community, one ward at a time.
          </p>
        </div>
      </section>

      {/* Vision statement */}
      <section className="py-20 px-4" style={{ backgroundColor: '#fff' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs tracking-widest mb-3" style={{ color: O, fontFamily: 'Oswald, sans-serif' }}>OUR VISION</p>
            <h2 style={{ fontFamily: 'Oswald, sans-serif', fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', letterSpacing: '0.03em', color: NAVY }}>
              A ZAMBIA FULLY CONNECTED TO THE WORLD
            </h2>
            <div className="w-16 h-1 mx-auto mt-4 rounded-full" style={{ backgroundColor: O }} />
          </div>

          <div className="max-w-4xl mx-auto mb-16">
            <p className="text-center leading-relaxed mb-6" style={{ color: '#4b5563', fontSize: '1.05rem', lineHeight: 1.9 }}>
              We connect Zambia's 1,858 wards with over 7,000 U.S. local chambers of commerce, a growing network of Chinese business associations, and international trade partners from every corner of the globe. Together, this powerful network drives economic growth, expands opportunity, and strengthens Zambia's place in the world.
            </p>
            <p className="text-center leading-relaxed" style={{ color: '#4b5563', fontSize: '1.05rem', lineHeight: 1.9 }}>
              Through these strategic partnerships, every Zambian ward gains a direct link to the United States, China, and beyond — unlocking export markets, attracting investment, and empowering local entrepreneurs to compete on a global stage.
            </p>
          </div>

          {/* Vision points */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {VISION_POINTS.map(point => (
              <div key={point.title} className="text-center p-8 rounded-xl" style={{ backgroundColor: '#fafafa', border: '1px solid #f0f0f0' }}>
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5" style={{ backgroundColor: `rgba(249,115,22,0.1)`, border: `2px solid ${O}` }}>
                  <point.icon className="w-7 h-7" style={{ color: O }} />
                </div>
                <h3 className="mb-3" style={{ fontFamily: 'Oswald, sans-serif', fontSize: '1.2rem', letterSpacing: '0.04em', color: NAVY }}>{point.title}</h3>
                <p className="leading-relaxed text-sm" style={{ color: '#6b7280' }}>{point.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partnership stats */}
      <section className="relative py-16 px-4 overflow-hidden" style={{ background: `linear-gradient(90deg, ${O} 0%, ${R} 100%)` }}>
        <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 1200 200" preserveAspectRatio="none" aria-hidden>
          <polygon points="0,0 200,80 100,200 0,160" fill="none" stroke="#fff" strokeWidth="1" />
          <polygon points="200,0 400,100 300,200 100,80" fill="none" stroke="#fff" strokeWidth="1" />
          <polygon points="400,0 600,80 500,200 300,100" fill="none" stroke="#fff" strokeWidth="1" />
          <polygon points="600,0 800,100 700,200 500,80" fill="none" stroke="#fff" strokeWidth="1" />
          <polygon points="800,0 1000,80 900,200 700,100" fill="none" stroke="#fff" strokeWidth="1" />
          <polygon points="1000,0 1200,100 1100,200 900,80" fill="none" stroke="#fff" strokeWidth="1" />
        </svg>
        <div className="relative max-w-6xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-8">
          {PARTNERSHIP_STATS.map(stat => (
            <div key={stat.label} className="text-center">
              <stat.icon className="w-10 h-10 mx-auto mb-4" style={{ color: '#fff', opacity: 0.9 }} />
              <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 'clamp(2rem, 4vw, 3rem)', color: '#fff', lineHeight: 1 }}>
                {stat.value}
              </div>
              <p className="mt-3 text-sm leading-snug" style={{ color: 'rgba(255,255,255,0.85)' }}>{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Registration types */}
      <section className="py-20 px-4" style={{ backgroundColor: '#fff' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs tracking-widest mb-3" style={{ color: O, fontFamily: 'Oswald, sans-serif' }}>GET STARTED</p>
            <h2 className="mb-4" style={{ fontFamily: 'Oswald, sans-serif', fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', letterSpacing: '0.03em', color: NAVY }}>
              CHOOSE YOUR REGISTRATION TYPE
            </h2>
            <p style={{ color: '#6b7280', fontSize: '1rem', maxWidth: '600px', margin: '0 auto' }}>
              Select the opportunity that best fits your goals and become part of this global movement.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {OPPORTUNITIES.map(opp => (
              <div
                key={opp.title}
                className="group flex flex-col rounded-2xl overflow-hidden transition-all"
                style={{ backgroundColor: '#fafafa', border: '1px solid #f0f0f0', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.boxShadow = `0 12px 48px rgba(249,115,22,0.15)`}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 24px rgba(0,0,0,0.06)'}
              >
                {/* Header with icon */}
                <div className="relative p-8 pb-6" style={{ background: `linear-gradient(135deg, ${opp.color} 0%, ${opp.color}dd 100%)` }}>
                  <div className="absolute top-0 right-0 w-32 h-32 opacity-10" style={{ background: `radial-gradient(circle at center, #fff 0%, transparent 70%)` }} />
                  <opp.icon className="w-12 h-12 mb-4" style={{ color: '#fff' }} />
                  <h3 className="mb-2" style={{ fontFamily: 'Oswald, sans-serif', fontSize: '1.5rem', letterSpacing: '0.04em', color: '#fff' }}>
                    {opp.title}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.9)' }}>{opp.subtitle}</p>
                </div>

                {/* Features */}
                <div className="p-8 pt-6">
                  <p className="text-xs tracking-widest mb-4" style={{ color: opp.color, fontFamily: 'Oswald, sans-serif' }}>REQUIREMENTS</p>
                  <ul className="space-y-2.5 mb-6">
                    {opp.features.map(feat => (
                      <li key={feat} className="flex items-start gap-2 text-sm" style={{ color: '#4b5563' }}>
                        <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: opp.color }} />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>

                  <p className="text-xs tracking-widest mb-4 mt-8" style={{ color: opp.color, fontFamily: 'Oswald, sans-serif' }}>BENEFITS</p>
                  <ul className="space-y-2.5 mb-8">
                    {opp.benefits.map(ben => (
                      <li key={ben} className="flex items-start gap-2 text-sm" style={{ color: '#6b7280' }}>
                        <ArrowRight className="w-3.5 h-3.5 mt-1 flex-shrink-0" style={{ color: opp.color }} />
                        <span>{ben}</span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    to={opp.path}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg transition-all"
                    style={{ fontFamily: 'Oswald, sans-serif', fontSize: '13px', letterSpacing: '0.1em', backgroundColor: opp.color, color: '#fff', textDecoration: 'none' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.opacity = '0.9'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.opacity = '1'}
                  >
                    {opp.cta} <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Join CTA */}
      <section className="py-16 px-4" style={{ backgroundColor: O }}>
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs tracking-widest mb-3" style={{ color: 'rgba(255,255,255,0.75)', fontFamily: 'Oswald, sans-serif' }}>JOIN THE MOVEMENT</p>
          <h2 className="mb-4" style={{ fontFamily: 'Oswald, sans-serif', fontSize: 'clamp(1.5rem, 3vw, 2.4rem)', letterSpacing: '0.03em', color: '#fff' }}>
            JOIN AS A MEMBER TODAY
          </h2>
          <p className="mb-8 text-sm leading-relaxed max-w-2xl mx-auto" style={{ color: 'rgba(255,255,255,0.9)' }}>
            Become a member today and unlock the full benefits of our platform, including access to partnerships, cooperative registration, and internship opportunities. Together, we're building a brighter future for Zambian businesses on the global stage.
          </p>
          <Link
            to="/register/member"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full transition-all"
            style={{ fontFamily: 'Oswald, sans-serif', fontSize: '13px', letterSpacing: '0.12em', backgroundColor: '#fff', color: O, textDecoration: 'none' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = NAVY; (e.currentTarget as HTMLElement).style.color = '#fff'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#fff'; (e.currentTarget as HTMLElement).style.color = O; }}
          >
            GET STARTED TODAY <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Final vision statement */}
      <section className="py-20 px-4 text-center" style={{ backgroundColor: '#fff' }}>
        <div className="max-w-3xl mx-auto">
          <blockquote className="mb-6" style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(1.2rem, 2.5vw, 1.6rem)', color: NAVY, lineHeight: 1.8, fontStyle: 'italic' }}>
            "This is our vision: a Zambia fully connected to the world — to America, to China, and to every nation willing to grow with us."
          </blockquote>
          <div className="w-20 h-1 mx-auto rounded-full" style={{ backgroundColor: O }} />
        </div>
      </section>

    </div>
  );
}

export { OpportunitiesPage as default };
