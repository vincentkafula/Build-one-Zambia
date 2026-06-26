import { useState, ReactNode } from 'react';
import { useNavigate } from 'react-router';
import { LogOut, Bell, Menu, X, ChevronRight, Zap } from 'lucide-react';

interface NavItem {
  key: string;
  label: string;
  icon: ReactNode;
}

interface NavGroup {
  group: string;
  items: NavItem[];
}

interface DashboardShellProps {
  accentColor: string;
  title: string;
  subtitle?: string;
  user: { name: string; role: string; id?: string };
  navGroups: NavGroup[];
  activeSection: string;
  onNavigate: (key: string) => void;
  children: ReactNode;
  notifications?: number;
}

const SIDEBAR_BG = '#07111f';
const SIDEBAR_BORDER = 'rgba(255,255,255,0.06)';
const TOPBAR_BG = '#0b1929';

export function DashboardShell({
  accentColor,
  title,
  subtitle,
  user,
  navGroups,
  activeSection,
  onNavigate,
  children,
  notifications = 0,
}: DashboardShellProps) {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const initials = user.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const activeLabel = navGroups
    .flatMap(g => g.items)
    .find(i => i.key === activeSection)?.label || title;

  function handleNav(key: string) {
    onNavigate(key);
    setSidebarOpen(false);
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: '#070f1c' }}>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          style={{ backgroundColor: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className="fixed top-0 left-0 h-full z-50 flex flex-col lg:relative lg:translate-x-0 transition-transform duration-300"
        style={{
          width: 264,
          backgroundColor: SIDEBAR_BG,
          borderRight: `1px solid ${SIDEBAR_BORDER}`,
          transform: sidebarOpen ? 'translateX(0)' : undefined,
          flexShrink: 0,
        }}
      >
        {/* Logo area */}
        <div
          className="flex items-center justify-between px-5 py-5"
          style={{ borderBottom: `1px solid ${SIDEBAR_BORDER}` }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: `linear-gradient(135deg, ${accentColor}, ${accentColor}99)`, boxShadow: `0 0 16px ${accentColor}40` }}
            >
              <Zap size={14} className="text-white" />
            </div>
            <div>
              <p
                style={{ fontFamily: 'Oswald, sans-serif', fontSize: '0.8rem', letterSpacing: '0.12em', color: 'rgba(255,255,255,0.45)' }}
              >
                BUILD ONE ZAMBIA
              </p>
              <p
                style={{ fontFamily: 'Oswald, sans-serif', fontSize: '0.9rem', letterSpacing: '0.06em', color: '#fff' }}
              >
                {title.toUpperCase()}
              </p>
            </div>
          </div>
          <button
            className="lg:hidden"
            style={{ color: 'rgba(255,255,255,0.4)' }}
            onClick={() => setSidebarOpen(false)}
          >
            <X size={18} />
          </button>
        </div>

        {/* User chip */}
        <div className="px-4 py-4" style={{ borderBottom: `1px solid ${SIDEBAR_BORDER}` }}>
          <div className="flex items-center gap-3 px-2 py-2.5 rounded-xl" style={{ backgroundColor: 'rgba(255,255,255,0.04)' }}>
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-sm"
              style={{
                background: `linear-gradient(135deg, ${accentColor}60, ${accentColor}30)`,
                border: `1.5px solid ${accentColor}60`,
                color: '#fff',
                fontFamily: 'Oswald, sans-serif',
                letterSpacing: '0.04em',
              }}
            >
              {initials}
            </div>
            <div className="min-w-0">
              <p className="truncate" style={{ color: '#fff', fontSize: '0.85rem', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.04em' }}>
                {user.name}
              </p>
              <p className="truncate" style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.7rem' }}>
                {user.role}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-3 px-3" style={{ scrollbarWidth: 'none' }}>
          {navGroups.map((group) => (
            <div key={group.group} className="mb-5">
              <p
                className="px-3 mb-2"
                style={{
                  fontFamily: 'Oswald, sans-serif',
                  fontSize: '0.65rem',
                  letterSpacing: '0.14em',
                  color: 'rgba(255,255,255,0.28)',
                }}
              >
                {group.group}
              </p>
              {group.items.map((item) => {
                const isActive = activeSection === item.key;
                return (
                  <button
                    key={item.key}
                    onClick={() => handleNav(item.key)}
                    className="relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl mb-0.5 text-left transition-all duration-150"
                    style={{
                      backgroundColor: isActive ? `${accentColor}18` : 'transparent',
                      color: isActive ? '#fff' : 'rgba(255,255,255,0.52)',
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(255,255,255,0.05)';
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
                    }}
                  >
                    {isActive && (
                      <span
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full"
                        style={{ backgroundColor: accentColor, boxShadow: `0 0 8px ${accentColor}` }}
                      />
                    )}
                    <span
                      className="shrink-0"
                      style={{ color: isActive ? accentColor : 'rgba(255,255,255,0.38)' }}
                    >
                      {item.icon}
                    </span>
                    <span
                      className="text-sm truncate flex-1"
                      style={{ fontFamily: 'Oswald, sans-serif', letterSpacing: '0.04em' }}
                    >
                      {item.label}
                    </span>
                    {isActive && (
                      <ChevronRight size={12} style={{ color: accentColor, opacity: 0.7 }} />
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Logout */}
        <div className="px-3 py-4" style={{ borderTop: `1px solid ${SIDEBAR_BORDER}` }}>
          <button
            onClick={() => navigate('/dashboard-login')}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150"
            style={{ color: 'rgba(255,255,255,0.38)' }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(239,68,68,0.12)';
              (e.currentTarget as HTMLElement).style.color = '#f87171';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
              (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.38)';
            }}
          >
            <LogOut size={15} />
            <span className="text-sm" style={{ fontFamily: 'Oswald, sans-serif', letterSpacing: '0.06em' }}>SIGN OUT</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header
          className="shrink-0 flex items-center justify-between px-5 py-3.5"
          style={{
            backgroundColor: TOPBAR_BG,
            borderBottom: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <div className="flex items-center gap-4">
            <button
              className="lg:hidden p-2 rounded-lg transition-colors"
              style={{ color: 'rgba(255,255,255,0.5)', backgroundColor: 'rgba(255,255,255,0.05)' }}
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={18} />
            </button>
            <div>
              {subtitle && (
                <p style={{ fontFamily: 'Oswald, sans-serif', fontSize: '0.65rem', letterSpacing: '0.14em', color: 'rgba(255,255,255,0.3)' }}>
                  {subtitle}
                </p>
              )}
              <p style={{ fontFamily: 'Oswald, sans-serif', fontSize: '0.9rem', letterSpacing: '0.06em', color: 'rgba(255,255,255,0.85)' }}>
                {activeLabel.toUpperCase()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              className="relative p-2.5 rounded-xl transition-colors"
              style={{ color: 'rgba(255,255,255,0.45)', backgroundColor: 'rgba(255,255,255,0.05)' }}
              onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(255,255,255,0.09)'}
              onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(255,255,255,0.05)'}
            >
              <Bell size={16} />
              {notifications > 0 && (
                <span
                  className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
                  style={{ backgroundColor: accentColor, boxShadow: `0 0 6px ${accentColor}` }}
                />
              )}
            </button>

            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-sm"
              style={{
                background: `linear-gradient(135deg, ${accentColor}80, ${accentColor}40)`,
                border: `1.5px solid ${accentColor}60`,
                color: '#fff',
                fontFamily: 'Oswald, sans-serif',
                letterSpacing: '0.04em',
                cursor: 'pointer',
              }}
            >
              {initials}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main
          className="flex-1 overflow-y-auto p-5 md:p-7"
          style={{ backgroundColor: '#070f1c', scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.1) transparent' }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}

/* ── Dark-themed card for content sections ── */
export function DashCard({ title, children, className = '' }: { title?: string; children: ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-2xl overflow-hidden ${className}`}
      style={{ backgroundColor: '#0f1f33', border: '1px solid rgba(255,255,255,0.07)' }}
    >
      {title && (
        <div
          className="px-6 py-4"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
        >
          <p style={{ fontFamily: 'Oswald, sans-serif', fontSize: '0.85rem', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.55)' }}>
            {title.toUpperCase()}
          </p>
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  );
}

/* ── Stat card ── */
export function StatCard({
  label,
  value,
  sub,
  accentColor,
  icon,
}: {
  label: string;
  value: string;
  sub?: string;
  accentColor?: string;
  icon?: ReactNode;
}) {
  return (
    <div
      className="rounded-2xl p-5"
      style={{ backgroundColor: '#0f1f33', border: '1px solid rgba(255,255,255,0.07)' }}
    >
      <div className="flex items-start justify-between mb-3">
        <p style={{ fontFamily: 'Oswald, sans-serif', fontSize: '0.7rem', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.38)' }}>
          {label.toUpperCase()}
        </p>
        {icon && (
          <span style={{ color: accentColor || 'rgba(255,255,255,0.25)', opacity: 0.7 }}>
            {icon}
          </span>
        )}
      </div>
      <p style={{ fontFamily: 'Oswald, sans-serif', fontSize: '1.6rem', letterSpacing: '0.02em', color: '#fff' }}>
        {value}
      </p>
      {sub && (
        <p className="mt-1" style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.3)' }}>
          {sub}
        </p>
      )}
    </div>
  );
}

/* ── Dark badge ── */
export function DarkBadge({ label, color }: { label: string; color: string }) {
  return (
    <span
      className="px-2.5 py-0.5 rounded-full text-xs"
      style={{
        backgroundColor: `${color}18`,
        color,
        border: `1px solid ${color}30`,
        fontFamily: 'Oswald, sans-serif',
        letterSpacing: '0.06em',
      }}
    >
      {label}
    </span>
  );
}
