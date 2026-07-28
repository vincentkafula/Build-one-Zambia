import { Link } from 'react-router';
import { Facebook, Twitter, Youtube, Instagram, Mail, Phone, MapPin, ArrowRight } from 'lucide-react';
import bozLogo from '../../imports/One_Zambia_Logo.png';

const SOCIALS = [
  { icon: Facebook, label: 'Facebook', href: 'https://www.facebook.com/www.bozplans.org/' },
  { icon: Twitter, label: 'Twitter / X', href: 'https://twitter.com/bozplans' },
  { icon: Youtube, label: 'YouTube', href: 'https://www.youtube.com/@BuildOneZambia' },
  { icon: Instagram, label: 'Instagram', href: 'https://www.instagram.com/bozplans' },
];

const QUICK_LINKS = [
  { label: 'Home', path: '/' },
  { label: 'About Us', path: '/about' },
  { label: 'Campaign', path: '/campaign' },
  { label: 'Build One Zambia Election Portal', path: '/pages#portal' },
  { label: 'Our Polling Agents', path: '/pages#agents' },
];

const ELECTION_LINKS = [
  { label: 'Presidential Results', path: '/results/presidential' },
  { label: 'Parliamentary Results', path: '/results/parliament' },
  { label: 'Mayoral Results', path: '/results/mayoral' },
  { label: 'Councillor Results', path: '/results/councillor' },
  { label: 'Methodology', path: '/pages#methodology' },
];

function AppleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="#fff">
      <path d="M16.365 1.43c0 1.14-.493 2.27-1.177 3.08-.744.9-1.99 1.57-2.987 1.57-.12 0-.23-.02-.3-.03-.01-.06-.04-.22-.04-.39 0-1.15.572-2.27 1.206-2.98.804-.94 2.142-1.64 3.248-1.68.03.13.05.28.05.43zm4.565 15.71c-.03.07-.463 1.58-1.518 3.12-.945 1.34-1.94 2.71-3.43 2.71-1.517 0-1.9-.88-3.63-.88-1.698 0-2.302.91-3.67.91-1.377 0-2.332-1.26-3.428-2.8-1.287-1.82-2.323-4.63-2.323-7.28 0-4.28 2.797-6.55 5.552-6.55 1.448 0 2.652.95 3.559.95.865 0 2.21-1.01 3.85-1.01.622 0 2.86.06 4.335 2.2-.115.07-2.582 1.51-2.582 4.63 0 3.7 3.279 4.99 3.315 5.01z" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24">
      <path d="M3.6 2.3c-.4.3-.6.8-.6 1.4v16.6c0 .6.2 1.1.6 1.4l.1.1L13 12.4v-.2L3.7 2.2l-.1.1z" fill="#00d2ff" />
      <path d="M16.1 15.5 13 12.4v-.2l3.1-3.1.1.1 3.7 2.1c1.1.6 1.1 1.6 0 2.2l-3.7 2.1-.1-.1z" fill="#ffde00" />
      <path d="M16.2 15.4 13 12.2 3.6 21.6c.35.37.93.42 1.58.05l11.02-6.27" fill="#ff3a44" />
      <path d="M16.2 9 5.18 2.75c-.65-.37-1.23-.32-1.58.05L13 12.2l3.2-3.2z" fill="#00e177" />
    </svg>
  );
}

function StoreBadge({ icon, topLine, bottomLine }: { icon: React.ReactNode; topLine: string; bottomLine: string }) {
  return (
    <div
      className="relative flex items-center gap-2.5 px-3.5 py-2 rounded-lg w-fit cursor-not-allowed select-none"
      style={{ backgroundColor: '#000', border: '1px solid #2a2a2a' }}
      title="Coming soon"
    >
      {icon}
      <div className="leading-none">
        <p className="text-[9px]" style={{ color: '#d1d5db' }}>{topLine}</p>
        <p className="text-white font-semibold" style={{ fontSize: '13.5px', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.01em' }}>{bottomLine}</p>
      </div>
      <span
        className="absolute -top-2 -right-2 text-[8px] font-bold px-1.5 py-0.5 rounded-full"
        style={{ backgroundColor: '#dc2626', color: '#fff', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.04em' }}
      >
        SOON
      </span>
    </div>
  );
}

export function MainFooter() {
  return (
    <footer style={{ backgroundColor: '#007A30', fontFamily: 'Open Sans, sans-serif' }}>
      {/* CTA Band */}
      <div style={{ background: 'linear-gradient(135deg, #b91c1c 0%, #dc2626 50%, #ef4444 100%)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-white text-center sm:text-left">
            <p className="font-bold text-xl" style={{ fontFamily: 'Oswald, sans-serif', letterSpacing: '0.04em' }}>
              BUILD ONE ZAMBIA — TOGETHER WE RISE
            </p>
            <p className="text-red-100 text-sm mt-1">Support transparency, democracy, and development for all Zambians</p>
          </div>
          <Link
            to="/donate"
            className="flex items-center gap-2 px-6 py-3 bg-white rounded font-bold shrink-0 transition-opacity hover:opacity-90"
            style={{ fontFamily: 'Oswald, sans-serif', color: '#dc2626', fontSize: '14px', letterSpacing: '0.08em' }}
          >
            DONATE TODAY <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Main footer body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Brand col */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-5">
              <img src={bozLogo} alt="Build One Zambia" className="w-12 h-12 object-contain" />
              <div>
                <div className="text-white font-bold" style={{ fontFamily: 'Oswald, sans-serif', letterSpacing: '0.06em' }}>BUILD ONE ZAMBIA</div>
              </div>
            </div>
            <p className="text-sm leading-relaxed mb-6" style={{ color: '#9ca3af' }}>
              Committed to transparency, accountability, and building a better Zambia for every citizen through democratic participation.
            </p>
            <div className="flex gap-3 mb-6">
              {SOCIALS.map(({ icon: Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-9 h-9 rounded flex items-center justify-center transition-colors"
                  style={{ backgroundColor: '#007A30', color: '#9ca3af' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#dc2626'; (e.currentTarget as HTMLElement).style.color = '#fff'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#007A30'; (e.currentTarget as HTMLElement).style.color = '#9ca3af'; }}
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-5 pb-2 border-b" style={{ fontFamily: 'Oswald, sans-serif', letterSpacing: '0.08em', borderColor: '#005020' }}>
              QUICK LINKS
            </h4>
            <ul className="space-y-3">
              {QUICK_LINKS.map(link => (
                <li key={link.label}>
                  <Link
                    to={link.path}
                    className="flex items-center gap-2 text-sm transition-colors"
                    style={{ color: '#9ca3af' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#dc2626'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = '#9ca3af'}
                  >
                    <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: '#dc2626' }} />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Election Portal */}
          <div>
            <h4 className="text-white font-semibold mb-5 pb-2 border-b" style={{ fontFamily: 'Oswald, sans-serif', letterSpacing: '0.08em', borderColor: '#005020' }}>
              ELECTION RESULTS
            </h4>
            <ul className="space-y-3">
              {ELECTION_LINKS.map(link => (
                <li key={link.label}>
                  <Link
                    to={link.path}
                    className="flex items-center gap-2 text-sm transition-colors"
                    style={{ color: '#9ca3af' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#dc2626'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = '#9ca3af'}
                  >
                    <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: '#dc2626' }} />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-5 pb-2 border-b" style={{ fontFamily: 'Oswald, sans-serif', letterSpacing: '0.08em', borderColor: '#005020' }}>
              CONTACT US
            </h4>
            <ul className="space-y-4">
              {[
                { icon: MapPin, text: 'Plot 3456, Independence Avenue, Lusaka, Zambia' },
                { icon: Phone, text: '+260 571 224 074' },
                { icon: Mail, text: 'info@bozplans.org' },
              ].map(({ icon: Icon, text }) => (
                <li key={text} className="flex gap-3 text-sm" style={{ color: '#9ca3af' }}>
                  <Icon className="w-4 h-4 shrink-0 mt-0.5" style={{ color: '#dc2626' }} />
                  <span>{text}</span>
                </li>
              ))}
            </ul>

            {/* App download badges — mobile app isn't published yet, so these
                are intentionally non-clickable and marked "Coming Soon"
                rather than linking to store pages that don't exist. */}
            <p className="text-xs font-semibold mt-6 mb-3" style={{ color: '#9ca3af', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.06em' }}>
              GET THE APP
            </p>
            <div className="flex flex-col gap-2.5 mb-4">
              <StoreBadge
                icon={<AppleIcon />}
                topLine="Download on the"
                bottomLine="App Store"
              />
              <StoreBadge
                icon={<PlayIcon />}
                topLine="GET IT ON"
                bottomLine="Google Play"
              />
            </div>

            <ul className="space-y-4">
              <li>
                <Link
                  to="/pages#transparency"
                  className="flex items-center gap-2 text-sm transition-colors"
                  style={{ color: '#9ca3af' }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#dc2626'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = '#9ca3af'}
                >
                  <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: '#dc2626' }} />
                  Transparency Principles
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t" style={{ borderColor: '#007A30' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs" style={{ color: '#4b5563' }}>
            © 2026 Build One Zambia. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs" style={{ color: '#4b5563' }}>
            <span>Transparency · Accountability · Democracy</span>
            <span style={{ color: '#1a5c30' }}>·</span>
            <Link
              to="/terms"
              style={{ color: '#4b5563', textDecoration: 'none' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#dc2626'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = '#4b5563'}
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
