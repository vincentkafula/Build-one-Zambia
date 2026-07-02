import { API_BASE } from '@/app/lib/apiBase';
import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { Calendar, MapPin, Clock, ArrowRight, Users, ChevronRight } from 'lucide-react';

const BACKEND = API_BASE;

interface BackendEvent {
  id: string; title: string; date: string; time: string;
  venue: string; province: string; type: string; description: string;
  capacity?: number; status: 'upcoming' | 'past' | 'cancelled'; featured: boolean;
  hasPhoto?: boolean;
}

function eventPhotoUrl(id: string) { return `${BACKEND}/events/${id}/photo`; }

const O    = '#dc2626';
const GREEN = '#007A30';
const NAVY  = '#1e2d4a';

const UPCOMING = [
  {
    id: 1,
    title: 'National Delegates Conference',
    date: 'Saturday, 19 July 2026',
    time: '08:00 – 17:00',
    venue: 'Mulungushi International Conference Centre, Lusaka',
    province: 'Lusaka Province',
    type: 'Conference',
    desc: 'The first national delegates conference of Build One Zambia. All provincial, district, and constituency delegates are expected to attend. The agenda includes ratification of the party constitution, election of national officers, and adoption of the 2031 manifesto.',
    seats: 2000,
    color: O,
  },
  {
    id: 2,
    title: 'Copperbelt Rally — Kitwe',
    date: 'Saturday, 26 July 2026',
    time: '10:00 – 15:00',
    venue: 'Nkana Stadium, Kitwe',
    province: 'Copperbelt Province',
    type: 'Rally',
    desc: 'A major public rally across the Copperbelt province bringing together mining communities, youth groups, and business leaders. Presidential candidate Vincent Kafula will address the crowd on economic transformation and job creation.',
    seats: 15000,
    color: '#1d4ed8',
  },
  {
    id: 3,
    title: 'Women in Leadership Forum',
    date: 'Friday, 1 August 2026',
    time: '09:00 – 16:00',
    venue: 'Pamodzi Hotel, Lusaka',
    province: 'Lusaka Province',
    type: 'Forum',
    desc: 'A national forum bringing together women leaders from all ten provinces to discuss policy priorities on gender equity, maternal health, education, and economic empowerment ahead of the 2026 general election.',
    seats: 500,
    color: '#7c3aed',
  },
  {
    id: 4,
    title: 'Youth Economic Summit',
    date: 'Saturday, 9 August 2026',
    time: '09:00 – 17:00',
    venue: 'Ndola Civic Centre, Ndola',
    province: 'Copperbelt Province',
    type: 'Summit',
    desc: 'A two-session summit for young entrepreneurs and graduates across Zambia. Sessions will cover SME financing, BOZ cooperative programmes, chamber of commerce partnerships, and the party\'s youth economic empowerment agenda.',
    seats: 800,
    color: '#059669',
  },
  {
    id: 5,
    title: 'Election Day — Zambia General Elections',
    date: 'Thursday, 13 August 2026',
    time: 'Polls open 06:00 – 18:00',
    venue: 'All 13,529 Polling Stations Nationwide',
    province: 'National',
    type: 'Election Day',
    desc: 'Zambians go to the polls to elect a President, Members of the National Assembly, Mayors, Council Chairpersons, and Ward Councillors. BOZ agents will be stationed at every polling station across all 10 provinces.',
    seats: 8786300,
    color: O,
  },
];

const PAST = [
  {
    id: 101,
    title: 'Manifesto Launch — Lusaka',
    date: '1 May 2026',
    venue: 'Mulungushi Conference Centre, Lusaka',
    type: 'Launch',
    desc: 'Build One Zambia officially unveiled its 2031 election manifesto to the public, press, and invited stakeholders.',
    color: '#0891b2',
  },
  {
    id: 102,
    title: 'Women in Leadership Symposium',
    date: '8 March 2026',
    venue: 'Intercontinental Hotel, Lusaka',
    type: 'Symposium',
    desc: 'International Women\'s Day symposium attended by delegates from all 10 provinces, celebrating women in Zambian politics.',
    color: '#7c3aed',
  },
  {
    id: 103,
    title: 'Eastern Province Farmers\' Forum',
    date: '15 April 2026',
    venue: 'Chipata Agricultural Showgrounds',
    type: 'Forum',
    desc: 'Smallholder farmers from Eastern Province engaged directly with the BOZ policy team on agricultural priorities.',
    color: '#059669',
  },
  {
    id: 104,
    title: 'Youth Economic Forum — Ndola',
    date: '20 March 2026',
    venue: 'Ndola Civic Centre',
    type: 'Forum',
    desc: 'Young entrepreneurs pitched business ideas and engaged with the BOZ team on youth economic policy.',
    color: '#d97706',
  },
  {
    id: 105,
    title: 'Party Formation Meeting',
    date: '14 February 2026',
    venue: 'Lusaka, Zambia',
    type: 'Founding',
    desc: 'The founding meeting of Build One Zambia, where the core leadership team gathered to formally establish the party and adopt its founding values.',
    color: O,
  },
];

const TYPE_COLORS: Record<string, string> = {
  Conference: O,
  Rally: '#1d4ed8',
  Forum: '#7c3aed',
  Summit: '#059669',
  'Election Day': O,
  Launch: '#0891b2',
  Symposium: '#7c3aed',
  Founding: O,
};

function TypeBadge({ type }: { type: string }) {
  const color = TYPE_COLORS[type] ?? '#6b7280';
  return (
    <span
      className="inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full"
      style={{ backgroundColor: `${color}18`, color, border: `1px solid ${color}30`, fontFamily: 'Oswald, sans-serif', letterSpacing: '0.06em' }}
    >
      {type.toUpperCase()}
    </span>
  );
}

export function AboutEventsPage() {
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming');
  const [liveEvents, setLiveEvents] = useState<BackendEvent[] | null>(null);

  useEffect(() => {
    fetch(`${BACKEND}/events`)
      .then(r => r.json())
      .then(d => { if (Array.isArray(d.events) && d.events.length > 0) setLiveEvents(d.events); })
      .catch(() => {}); // fall back to hardcoded data silently
  }, []);

  // Use live data if available, otherwise fall back to hardcoded arrays
  const displayUpcoming = liveEvents
    ? liveEvents.filter(e => e.status === 'upcoming')
    : UPCOMING;
  const displayPast = liveEvents
    ? liveEvents.filter(e => e.status === 'past')
    : PAST;

  return (
    <div style={{ backgroundColor: '#fafafa', fontFamily: 'Open Sans, sans-serif', color: NAVY }}>

      {/* Hero */}
      <section style={{ background: `linear-gradient(135deg, ${GREEN} 0%, #005a22 60%, #1a0000 100%)`, padding: 'clamp(64px, 8vw, 96px) 16px 72px' }}>
        <div className="max-w-5xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="block w-8 h-0.5" style={{ backgroundColor: O }} />
            <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: '11px', letterSpacing: '0.25em', color: O }}>ABOUT BUILD ONE ZAMBIA</span>
            <span className="block w-8 h-0.5" style={{ backgroundColor: O }} />
          </div>
          <h1 style={{ fontFamily: 'Oswald, sans-serif', fontSize: 'clamp(2.2rem, 5vw, 3.8rem)', color: '#fff', letterSpacing: '0.03em', lineHeight: 1.1 }}>
            EVENTS & ACTIVITIES
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', marginTop: '16px', fontSize: '15px', maxWidth: '560px', margin: '16px auto 0' }}>
            Rallies, forums, summits, and key milestones on the road to the 2026 General Election.
          </p>
        </div>
      </section>

      {/* Tab toggle */}
      <div className="sticky top-20 z-30 border-b" style={{ backgroundColor: '#fff', borderColor: '#e5e7eb' }}>
        <div className="max-w-5xl mx-auto px-4 flex gap-0">
          {(['upcoming', 'past'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="px-6 py-4 text-sm font-semibold capitalize transition-colors relative"
              style={{
                fontFamily: 'Oswald, sans-serif',
                letterSpacing: '0.08em',
                color: tab === t ? O : '#6b7280',
                background: 'none',
                border: 'none',
                borderBottom: tab === t ? `2px solid ${O}` : '2px solid transparent',
                cursor: 'pointer',
              }}
            >
              {t === 'upcoming' ? 'UPCOMING EVENTS' : 'PAST EVENTS'}
            </button>
          ))}
        </div>
      </div>

      {/* Upcoming Events */}
      {tab === 'upcoming' && (
        <section className="py-16 px-4">
          <div className="max-w-5xl mx-auto space-y-6">
            {displayUpcoming.map((ev: any, i: number) => (
              <div
                key={ev.id}
                className="rounded-2xl overflow-hidden"
                style={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', boxShadow: '0 2px 16px rgba(0,0,0,0.05)' }}
              >
                {/* Top accent bar */}
                <div style={{ height: '4px', backgroundColor: ev.color }} />

                <div className="p-6 sm:p-8">
                  <div className="flex flex-col sm:flex-row sm:items-start gap-5">
                    {ev.hasPhoto && (
                      <div className="shrink-0 w-full sm:w-28 h-28 rounded-xl overflow-hidden order-first sm:order-none">
                        <img src={eventPhotoUrl(ev.id)} alt={ev.title} className="w-full h-full object-cover" />
                      </div>
                    )}
                    {/* Date block */}
                    <div
                      className="shrink-0 flex flex-col items-center justify-center rounded-xl text-white"
                      style={{ width: '72px', height: '72px', backgroundColor: ev.color, fontFamily: 'Oswald, sans-serif' }}
                    >
                      <span style={{ fontSize: '22px', lineHeight: 1, fontWeight: 700 }}>
                        {ev.date.match(/\d+/)?.[0]}
                      </span>
                      <span style={{ fontSize: '10px', letterSpacing: '0.1em', marginTop: '2px' }}>
                        {ev.date.split(' ')[2]?.toUpperCase().slice(0, 3)}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <TypeBadge type={ev.type} />
                        <span style={{ fontSize: '12px', color: '#9ca3af' }}>{ev.province}</span>
                      </div>
                      <h3 style={{ fontFamily: 'Oswald, sans-serif', fontSize: 'clamp(1.1rem, 2.5vw, 1.4rem)', letterSpacing: '0.03em', color: NAVY, marginBottom: '8px' }}>
                        {ev.title}
                      </h3>
                      <p style={{ fontSize: '14px', color: '#4b5563', lineHeight: 1.7, marginBottom: '12px' }}>{ev.desc}</p>

                      <div className="flex flex-wrap gap-4 text-xs" style={{ color: '#6b7280' }}>
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 shrink-0" style={{ color: ev.color }} />
                          {ev.date}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 shrink-0" style={{ color: ev.color }} />
                          {ev.time}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 shrink-0" style={{ color: ev.color }} />
                          {ev.venue}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 shrink-0" style={{ color: ev.color }} />
                          {ev.seats.toLocaleString()} {ev.type === 'Election Day' ? 'registered voters' : 'capacity'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Link to gallery */}
          <div className="max-w-5xl mx-auto mt-10 text-center">
            <Link
              to="/news/gallery"
              className="inline-flex items-center gap-2 text-sm font-semibold"
              style={{ color: O, fontFamily: 'Oswald, sans-serif', letterSpacing: '0.08em' }}
            >
              VIEW PHOTO & VIDEO GALLERY <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      )}

      {/* Past Events */}
      {tab === 'past' && (
        <section className="py-16 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayPast.map((ev: any) => (
                <div
                  key={ev.id}
                  className="rounded-2xl overflow-hidden"
                  style={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', boxShadow: '0 2px 16px rgba(0,0,0,0.04)' }}
                >
                  <div style={{ height: '4px', backgroundColor: ev.color }} />
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <TypeBadge type={ev.type} />
                      <span style={{ fontSize: '11px', color: '#9ca3af' }}>{ev.date}</span>
                    </div>
                    <h3 style={{ fontFamily: 'Oswald, sans-serif', fontSize: '1rem', letterSpacing: '0.03em', color: NAVY, marginBottom: '8px' }}>{ev.title}</h3>
                    <p style={{ fontSize: '13px', color: '#4b5563', lineHeight: 1.7, marginBottom: '12px' }}>{ev.desc}</p>
                    <div className="flex items-center gap-1.5 text-xs" style={{ color: '#9ca3af' }}>
                      <MapPin className="w-3 h-3 shrink-0" />
                      {ev.venue}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10 text-center">
              <Link
                to="/news/gallery"
                className="inline-flex items-center gap-2 px-6 py-3 rounded text-white font-bold text-sm transition-opacity hover:opacity-90"
                style={{ backgroundColor: O, fontFamily: 'Oswald, sans-serif', letterSpacing: '0.08em' }}
              >
                VIEW FULL PHOTO GALLERY <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

    </div>
  );
}

export { AboutEventsPage as default };
