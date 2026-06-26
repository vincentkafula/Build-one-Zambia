import { Link } from 'react-router';
import { ArrowLeft, Clock } from 'lucide-react';

interface ComingSoonPageProps {
  title: string;
  subtitle: string;
}

export function ComingSoonPage({ title, subtitle }: ComingSoonPageProps) {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 text-center"
      style={{ backgroundColor: '#007A30', fontFamily: 'Open Sans, sans-serif' }}
    >
      <div className="max-w-lg mx-auto">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-8"
          style={{ backgroundColor: 'rgba(220,38,38,0.12)', border: '1px solid rgba(220,38,38,0.25)' }}
        >
          <Clock className="w-9 h-9" style={{ color: '#dc2626' }} />
        </div>

        <p
          className="text-xs tracking-widest mb-4"
          style={{ color: '#dc2626', fontFamily: 'Oswald, sans-serif' }}
        >
          BUILD ONE ZAMBIA
        </p>

        <h1
          className="mb-4"
          style={{
            fontFamily: 'Oswald, sans-serif',
            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
            letterSpacing: '0.03em',
            color: '#ffffff',
            lineHeight: 1.1,
          }}
        >
          {title}
        </h1>

        <p
          className="mb-4"
          style={{ color: '#9ca3af', fontSize: '1rem', lineHeight: 1.8 }}
        >
          {subtitle}
        </p>

        <p
          className="mb-10 text-sm"
          style={{ color: '#4b5563', lineHeight: 1.8 }}
        >
          We are currently preparing this section. Check back soon for the latest information and updates from the Build One Zambia campaign.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/"
            className="flex items-center gap-2 px-6 py-3 rounded text-white"
            style={{
              fontFamily: 'Oswald, sans-serif',
              fontSize: '13px',
              letterSpacing: '0.1em',
              backgroundColor: '#dc2626',
              textDecoration: 'none',
            }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.backgroundColor = '#b91c1c'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.backgroundColor = '#dc2626'}
          >
            BACK TO HOME
          </Link>

          <Link
            to="/contact"
            className="flex items-center gap-2 px-6 py-3 rounded"
            style={{
              fontFamily: 'Oswald, sans-serif',
              fontSize: '13px',
              letterSpacing: '0.1em',
              color: '#d1d5db',
              border: '1px solid #333',
              textDecoration: 'none',
            }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = '#dc2626'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = '#333'}
          >
            <ArrowLeft className="w-4 h-4" />
            GET IN TOUCH
          </Link>
        </div>
      </div>
    </div>
  );
}

// Note: OpportunitiesPage is defined in OpportunitiesPage.tsx — do not duplicate here.
