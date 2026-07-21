import { Link, useLocation } from 'react-router';
import { useState, useEffect } from 'react';
import { BarChart3, Home, Users, Building2, MapPin, Radio, WifiOff } from 'lucide-react';
import buildOneZambiaLogo from '../../imports/One_Zambia_Logo.png';

const navItems = [
  {
    path: '/results',
    label: 'Dashboard',
    icon: Home,
    color: '#0A0D0B',
    bg: '#E89A5C',
    border: '#E89A5C',
  },
  {
    path: '/results/presidential',
    label: 'Presidential',
    icon: BarChart3,
    color: '#0A0D0B',
    bg: '#E89A5C',
    border: '#E89A5C',
  },
  {
    path: '/results/parliament',
    label: 'Parliament',
    icon: Users,
    color: '#0A0D0B',
    bg: '#E89A5C',
    border: '#E89A5C',
  },
  {
    path: '/results/mayoral',
    label: 'Mayoral',
    icon: Building2,
    color: '#0A0D0B',
    bg: '#E89A5C',
    border: '#E89A5C',
  },
  {
    path: '/results/councillor',
    label: 'Councillors',
    icon: MapPin,
    color: '#0A0D0B',
    bg: '#E89A5C',
    border: '#E89A5C',
  },
];

export function Navigation() {
  const location = useLocation();
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const on = () => setIsOnline(true);
    const off = () => setIsOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  }, []);

  return (
    <nav className="sticky top-0 z-50 border-b" style={{ backgroundColor: 'rgba(10,13,11,0.92)', backdropFilter: 'blur(10px)', borderColor: '#26301F', boxShadow: '0 1px 20px rgba(0,0,0,0.35)' }}>
      {/* Offline banner */}
      {!isOnline && (
        <div className="text-center text-xs py-1.5 px-4 flex items-center justify-center gap-2 font-medium" style={{ backgroundColor: '#C17A3E', color: '#0A0D0B' }}>
          <WifiOff className="w-3.5 h-3.5 shrink-0" />
          You are offline — results will sync automatically when connectivity is restored
        </div>
      )}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Brand */}
          <Link to="/results" className="flex items-center shrink-0">
            <img src={buildOneZambiaLogo} alt="Build One Zambia" className="w-16 h-16 object-contain" />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = item.path === '/results'
                ? location.pathname === '/results' || location.pathname === '/results/'
                : location.pathname.startsWith(item.path);

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full transition-all duration-200"
                  style={{
                    background: isActive ? item.bg : 'transparent',
                    color: isActive ? item.color : '#948F80',
                    border: `1px solid ${isActive ? item.border : 'transparent'}`,
                  }}
                  onMouseEnter={e => {
                    if (!isActive) {
                      (e.currentTarget as HTMLElement).style.color = '#F3EFE4';
                      (e.currentTarget as HTMLElement).style.background = '#171C14';
                      (e.currentTarget as HTMLElement).style.border = '1px solid #26301F';
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isActive) {
                      (e.currentTarget as HTMLElement).style.color = '#948F80';
                      (e.currentTarget as HTMLElement).style.background = 'transparent';
                      (e.currentTarget as HTMLElement).style.border = '1px solid transparent';
                    }
                  }}
                >
                  <Icon className="w-4 h-4" />
                  <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: '13px', fontWeight: 600, letterSpacing: '0.02em' }}>{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Right side indicators */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Live indicator */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full"
              style={{ background: 'rgba(28,170,115,0.10)', border: '1px solid rgba(28,170,115,0.4)' }}>
              <Radio className="w-3 h-3" style={{ color: '#1CAA73' }} />
              <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#1CAA73' }} />
              <span className="text-xs font-bold hidden sm:inline" style={{ color: '#1CAA73', letterSpacing: '0.08em' }}>LIVE</span>
            </div>
          </div>
        </div>

        {/* Mobile Nav */}
        <div className="md:hidden pb-3 flex gap-1.5 overflow-x-auto scrollbar-hide">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = item.path === '/results'
              ? location.pathname === '/results' || location.pathname === '/results/'
              : location.pathname.startsWith(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full whitespace-nowrap transition-all duration-200 shrink-0"
                style={{
                  background: isActive ? item.bg : '#171C14',
                  color: isActive ? item.color : '#948F80',
                  border: `1px solid ${isActive ? item.border : '#26301F'}`,
                }}
              >
                <Icon className="w-3.5 h-3.5" />
                <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: '12px', fontWeight: 600 }}>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
