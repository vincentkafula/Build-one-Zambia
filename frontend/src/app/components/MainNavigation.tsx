import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router';
import { Menu, X, Search, ChevronDown } from 'lucide-react';
import bozLogo from '../../imports/One_Zambia_Logo.png';
import { SiteSearch } from './SiteSearch';

const HOME_DROPDOWN = [
  { label: 'Home Main',            path: '/',                  desc: 'Build One Zambia official home' },
  { label: 'Male Candidates',      path: '/home/male',         desc: 'Meet our shadow cabinet male candidates' },
  { label: 'Female Candidates',    path: '/home/female',       desc: 'Meet our shadow cabinet female candidates' },
  { label: 'Opportunities',        path: '/home/opportunities', desc: 'Membership, cooperatives & internships' },
];

const ABOUT_DROPDOWN = [
  { label: 'Leadership', path: '/about#leadership', desc: 'Our national, provincial, district & branch leaders' },
  { label: 'Events',     path: '/about/events',     desc: 'Upcoming rallies, forums, summits & past activities' },
];

const NEWS_DROPDOWN = [
  { label: 'Press Statements', path: '/news/press-statements', desc: 'Official press releases, letters and media statements' },
  { label: 'Live Streaming',   path: '/news/live',             desc: 'Watch live events and rallies' },
  { label: 'Party Music',      path: '/news/music',            desc: 'Campaign songs and audio content' },
  { label: 'News',             path: '/news/latest',           desc: 'Latest news and updates' },
  { label: 'Documents',        path: '/news/documents',        desc: 'Policy papers, manifestos, and official documents' },
  { label: 'Events Gallery',   path: '/news/gallery',          desc: 'Photos and videos from campaign events' },
];

interface NavLink {
  label: string;
  path: string;
  hasDropdown: boolean;
  dropdownType?: 'home' | 'about' | 'news';
}

const NAV_LINKS: NavLink[] = [
  { label: 'HOME',      path: '/',         hasDropdown: true,  dropdownType: 'home' },
  { label: 'ABOUT US',  path: '/about',    hasDropdown: true,  dropdownType: 'about' },
  { label: 'CAMPAIGN',  path: '/campaign', hasDropdown: false },
  { label: 'PAGES',     path: '/pages',    hasDropdown: false },
  { label: 'MEDIA',     path: '/news',     hasDropdown: true,  dropdownType: 'news' },
  { label: 'SHOP',      path: '/shop',     hasDropdown: false },
  { label: 'CONTACT',   path: '/contact',  hasDropdown: false },
];

export function MainNavigation() {
  const location = useLocation();
  const [menuOpen, setMenuOpen]       = useState(false);
  const [scrolled, setScrolled]       = useState(false);
  const [searchOpen, setSearchOpen]   = useState(false);
  const [homeDropOpen, setHomeDropOpen] = useState(false);
  const [aboutDropOpen, setAboutDropOpen] = useState(false);
  const [newsDropOpen, setNewsDropOpen] = useState(false);
  const [mobileHomeOpen, setMobileHomeOpen] = useState(false);
  const [mobileAboutOpen, setMobileAboutOpen] = useState(false);
  const [mobileNewsOpen, setMobileNewsOpen] = useState(false);
  const homeDropRef = useRef<HTMLDivElement>(null);
  const aboutDropRef = useRef<HTMLDivElement>(null);
  const newsDropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setHomeDropOpen(false);
    setAboutDropOpen(false);
    setNewsDropOpen(false);
  }, [location.pathname]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (homeDropRef.current && !homeDropRef.current.contains(e.target as Node)) {
        setHomeDropOpen(false);
      }
      if (aboutDropRef.current && !aboutDropRef.current.contains(e.target as Node)) {
        setAboutDropOpen(false);
      }
      if (newsDropRef.current && !newsDropRef.current.contains(e.target as Node)) {
        setNewsDropOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const isActive = (path: string) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  return (
    <header
      className="sticky top-0 z-50 transition-all duration-300"
      style={{
        backgroundColor: scrolled ? 'rgba(0,122,48,0.97)' : '#007A30',
        backdropFilter: 'blur(12px)',
        borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : '1px solid transparent',
        boxShadow: scrolled ? '0 4px 30px rgba(0,0,0,0.4)' : 'none',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 shrink-0 group">
            <img src={bozLogo} alt="Build One Zambia" className="w-12 h-12 object-contain" />
            <div className="hidden sm:block">
              <div className="text-white font-bold leading-tight tracking-wide" style={{ fontFamily: 'Oswald, sans-serif', fontSize: '16px', letterSpacing: '0.05em' }}>
                BUILD ONE
              </div>
              <div className="leading-tight tracking-widest" style={{ fontFamily: 'Oswald, sans-serif', fontSize: '16px', color: '#dc2626', letterSpacing: '0.12em' }}>
                ZAMBIA
              </div>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map(link => {
              const active = isActive(link.path);

              if (link.hasDropdown) {
                const isHomeDropdown = link.dropdownType === 'home';
                const isNewsDropdown = link.dropdownType === 'news';
                const dropOpen = isHomeDropdown ? homeDropOpen : isNewsDropdown ? newsDropOpen : aboutDropOpen;
                const setDropOpen = isHomeDropdown ? setHomeDropOpen : isNewsDropdown ? setNewsDropOpen : setAboutDropOpen;
                const dropdownItems = isHomeDropdown ? HOME_DROPDOWN : isNewsDropdown ? NEWS_DROPDOWN : ABOUT_DROPDOWN;
                const dropRef = isHomeDropdown ? homeDropRef : isNewsDropdown ? newsDropRef : aboutDropRef;

                return (
                  <div
                    key={link.label}
                    className="relative"
                    ref={dropRef}
                    onMouseEnter={() => setDropOpen(true)}
                    onMouseLeave={() => setDropOpen(false)}
                  >
                    <button
                      className="relative flex items-center gap-1 px-4 py-2 transition-colors duration-200"
                      style={{
                        fontFamily: 'Oswald, sans-serif',
                        fontSize: '13px',
                        fontWeight: 500,
                        letterSpacing: '0.1em',
                        color: active || dropOpen ? '#dc2626' : '#d1d5db',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      {link.label}
                      <ChevronDown
                        className="w-3 h-3 transition-transform duration-200"
                        style={{ transform: dropOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                      />
                      {(active || dropOpen) && (
                        <span className="absolute bottom-0 left-4 right-4 h-0.5 rounded-full" style={{ backgroundColor: '#dc2626' }} />
                      )}
                    </button>

                    {/* Dropdown panel — opens on hover */}
                    {dropOpen && (
                      <div
                        className="absolute top-full left-0 py-2 min-w-[240px]"
                        style={{
                          backgroundColor: '#006B28',
                          border: '1px solid #005020',
                          boxShadow: '0 12px 40px rgba(0,0,0,0.6)',
                        }}
                      >
                        {dropdownItems.map(item => (
                          <Link
                            key={item.label}
                            to={item.path}
                            className="flex flex-col px-5 py-3 transition-colors group"
                            style={{ textDecoration: 'none' }}
                            onMouseEnter={e => (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(220,38,38,0.08)'}
                            onMouseLeave={e => (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'}
                            onClick={() => setDropOpen(false)}
                          >
                            <span
                              style={{
                                fontFamily: 'Oswald, sans-serif',
                                fontSize: '13px',
                                letterSpacing: '0.08em',
                                color: location.pathname === item.path || location.pathname + location.hash === item.path ? '#dc2626' : '#d1d5db',
                              }}
                            >
                              {item.label}
                            </span>
                            <span style={{ fontSize: '11px', color: '#4b5563', marginTop: '2px' }}>
                              {item.desc}
                            </span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <Link
                  key={link.label}
                  to={link.path}
                  className="relative px-4 py-2 transition-colors duration-200"
                  style={{
                    fontFamily: 'Oswald, sans-serif',
                    fontSize: '13px',
                    fontWeight: 500,
                    letterSpacing: '0.1em',
                    color: active ? '#dc2626' : '#d1d5db',
                  }}
                  onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.color = '#ffffff'; }}
                  onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.color = '#d1d5db'; }}
                >
                  {link.label}
                  {active && (
                    <span className="absolute bottom-0 left-4 right-4 h-0.5 rounded-full" style={{ backgroundColor: '#dc2626' }} />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="hidden lg:flex w-9 h-9 items-center justify-center rounded-full transition-colors"
              style={{ color: '#9ca3af' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#fff'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = '#9ca3af'}
              aria-label="Search"
            >
              <Search className="w-4 h-4" />
            </button>

            <Link
              to="/dashboard-login"
              className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded transition-all duration-200 font-semibold"
              style={{ fontFamily: 'Oswald, sans-serif', fontSize: '13px', letterSpacing: '0.1em', color: '#d1d5db', border: '1px solid rgba(255,255,255,0.15)', backgroundColor: 'transparent' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#fff'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.35)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#d1d5db'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.15)'; }}
            >
              LOGIN
            </Link>

            <Link
              to="/donate"
              className="hidden sm:flex items-center gap-2 px-5 py-2.5 rounded transition-all duration-200 font-semibold text-white"
              style={{ fontFamily: 'Oswald, sans-serif', fontSize: '13px', letterSpacing: '0.1em', backgroundColor: '#dc2626' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.backgroundColor = '#b91c1c'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.backgroundColor = '#dc2626'}
            >
              DONATE NOW
            </Link>

            <button
              className="lg:hidden flex items-center justify-center w-9 h-9 rounded"
              style={{ color: '#d1d5db' }}
              onClick={() => setSearchOpen(true)}
              aria-label="Search"
            >
              <Search className="w-4 h-4" />
            </button>

            <button
              className="lg:hidden flex items-center justify-center w-10 h-10 rounded"
              style={{ color: '#d1d5db' }}
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Menu"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="lg:hidden border-t" style={{ backgroundColor: '#006B28', borderColor: '#005020' }}>
          <nav className="px-4 py-4 flex flex-col gap-1">

            {/* Render dropdown items */}
            {NAV_LINKS.filter(l => l.hasDropdown).map(link => {
              const isHome = link.dropdownType === 'home';
              const isNews = link.dropdownType === 'news';
              const mobileOpen = isHome ? mobileHomeOpen : isNews ? mobileNewsOpen : mobileAboutOpen;
              const setMobileOpen = isHome ? setMobileHomeOpen : isNews ? setMobileNewsOpen : setMobileAboutOpen;
              const dropdownItems = isHome ? HOME_DROPDOWN : isNews ? NEWS_DROPDOWN : ABOUT_DROPDOWN;

              return (
                <div key={link.label}>
                  <button
                    className="flex items-center justify-between px-4 py-3 rounded transition-colors w-full text-left"
                    style={{
                      fontFamily: 'Oswald, sans-serif', fontSize: '14px', letterSpacing: '0.1em', fontWeight: 500,
                      color: isActive(link.path) ? '#dc2626' : '#d1d5db',
                      backgroundColor: isActive(link.path) ? 'rgba(220,38,38,0.08)' : 'transparent',
                      border: 'none', cursor: 'pointer',
                    }}
                    onClick={() => setMobileOpen(o => !o)}
                  >
                    {link.label}
                    <ChevronDown className="w-4 h-4" style={{ transform: mobileOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
                  </button>

                  {mobileOpen && (
                    <div className="ml-4 border-l" style={{ borderColor: '#dc2626' }}>
                      {dropdownItems.map(item => (
                        <Link
                          key={item.label}
                          to={item.path}
                          className="flex flex-col px-4 py-2.5 transition-colors"
                          style={{ textDecoration: 'none' }}
                          onMouseEnter={e => (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(220,38,38,0.08)'}
                          onMouseLeave={e => (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'}
                        >
                          <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: '13px', letterSpacing: '0.06em', color: location.pathname === item.path || location.pathname + location.hash === item.path ? '#dc2626' : '#d1d5db' }}>
                            {item.label}
                          </span>
                          <span style={{ fontSize: '11px', color: '#4b5563', marginTop: '2px' }}>{item.desc}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Other nav links without dropdowns */}
            {NAV_LINKS.filter(l => !l.hasDropdown).map(link => {
              const active = isActive(link.path);
              return (
                <Link
                  key={link.label}
                  to={link.path}
                  className="px-4 py-3 rounded transition-colors"
                  style={{
                    fontFamily: 'Oswald, sans-serif', fontSize: '14px', letterSpacing: '0.1em', fontWeight: 500,
                    color: active ? '#dc2626' : '#d1d5db',
                    backgroundColor: active ? 'rgba(220,38,38,0.08)' : 'transparent',
                    textDecoration: 'none',
                  }}
                >
                  {link.label}
                </Link>
              );
            })}

            <Link
              to="/dashboard-login"
              className="mt-3 px-4 py-3 text-center rounded font-semibold"
              style={{ fontFamily: 'Oswald, sans-serif', fontSize: '13px', letterSpacing: '0.1em', color: '#d1d5db', border: '1px solid rgba(255,255,255,0.2)', textDecoration: 'none' }}
            >
              LOGIN
            </Link>

            <Link
              to="/donate"
              className="mt-2 px-4 py-3 text-center rounded font-semibold text-white"
              style={{ fontFamily: 'Oswald, sans-serif', fontSize: '13px', letterSpacing: '0.1em', backgroundColor: '#dc2626', textDecoration: 'none' }}
            >
              DONATE NOW
            </Link>
          </nav>
        </div>
      )}

      {/* Site-wide search overlay */}
      <SiteSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  );
}