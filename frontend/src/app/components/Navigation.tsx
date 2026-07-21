import { Link, useLocation } from 'react-router';
import { useState, useEffect } from 'react';
import { BarChart3, Home, Users, Building2, MapPin, Radio, WifiOff } from 'lucide-react';
import buildOneZambiaLogo from '../../imports/One_Zambia_Logo.png';

const navItems = [
  {
    path: '/results',
    label: 'Dashboard',
    icon: Home,
    color: '#92400E',
    bg: '#FEF3C7',
    border: '#F59E0B',
  },
  {
    path: '/results/presidential',
    label: 'Presidential',
    icon: BarChart3,
    color: '#991B1B',
    bg: '#FEE2E2',
    border: '#EF4444',
  },
  {
    path: '/results/parliament',
    label: 'Parliament',
    icon: Users,
    color: '#14532D',
    bg: '#DCFCE7',
    border: '#22C55E',
  },
  {
    path: '/results/mayoral',
    label: 'Mayoral',
    icon: Building2,
    color: '#7C2D12',
    bg: '#FFEDD5',
    border: '#F97316',
  },
  {
    path: '/results/councillor',
    label: 'Councillors',
    icon: MapPin,
    color: '#164E63',
    bg: '#CFFAFE',
    border: '#06B6D4',
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
    <nav className="sticky top-0 z-50 border-b" style={{ backgroundColor: '#ffffff', borderColor: '#d1fae5', boxShadow: '0 1px 6px rgba(5,40,20,0.1)' }}>
      {/* Offline banner */}
      {!isOnline && (
        <div className="bg-amber-500 text-white text-center text-xs py-1.5 px-4 flex items-center justify-center gap-2 font-medium">
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
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all duration-200"
                  style={{
                    background: isActive ? item.bg : 'transparent',
                    color: isActive ? item.color : '#374151',
                    border: `1.5px solid ${isActive ? item.border : 'transparent'}`,
                  }}
                  onMouseEnter={e => {
                    if (!isActive) {
                      (e.currentTarget as HTMLElement).style.color = item.color;
                      (e.currentTarget as HTMLElement).style.background = item.bg;
                      (e.currentTarget as HTMLElement).style.border = `1.5px solid ${item.border}`;
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isActive) {
                      (e.currentTarget as HTMLElement).style.color = '#374151';
                      (e.currentTarget as HTMLElement).style.background = 'transparent';
                      (e.currentTarget as HTMLElement).style.border = '1.5px solid transparent';
                    }
                  }}
                >
                  <Icon className="w-4 h-4" />
                  <span style={{ fontSize: '13px', fontWeight: 600 }}>{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Right side indicators */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Live indicator */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full"
              style={{ background: '#FEE2E2', border: '1.5px solid #EF4444' }}>
              <Radio className="w-3 h-3" style={{ color: '#DC2626' }} />
              <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#DC2626' }} />
              <span className="text-xs font-bold hidden sm:inline" style={{ color: '#DC2626' }}>LIVE</span>
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
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap transition-all duration-200 shrink-0"
                style={{
                  background: isActive ? item.bg : '#F3F4F6',
                  color: isActive ? item.color : '#374151',
                  border: `1px solid ${isActive ? item.border : 'transparent'}`,
                }}
              >
                <Icon className="w-3.5 h-3.5" />
                <span style={{ fontSize: '12px', fontWeight: 600 }}>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
