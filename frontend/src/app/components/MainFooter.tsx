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
            <div className="flex gap-3">
              {SOCIALS.map(({ icon: Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-9 h-9 rounded flex items-center justify-center transition-colors"
                  style={{ backgroundColor: '#0a2016', color: '#9ca3af' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#dc2626'; (e.currentTarget as HTMLElement).style.color = '#fff'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#0a2016'; (e.currentTarget as HTMLElement).style.color = '#9ca3af'; }}
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
      <div className="border-t" style={{ borderColor: '#0a2016' }}>
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
