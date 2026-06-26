import { useState, useEffect } from 'react';
import { X, TriangleAlert, ChevronDown, ChevronUp } from 'lucide-react';

const STORAGE_KEY = 'dev_disclaimer_dismissed';

export function DevDisclaimer() {
  const [visible, setVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (!sessionStorage.getItem(STORAGE_KEY)) {
      setVisible(true);
    }
  }, []);

  const dismiss = () => {
    sessionStorage.setItem(STORAGE_KEY, '1');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50" style={{ boxShadow: '0 -4px 24px rgba(0,0,0,0.25)' }}>
      <div style={{ backgroundColor: '#0d1117', borderTop: '3px solid #f59e0b' }}>

        {/* Collapsed bar — always visible */}
        <div className="flex items-center gap-3 px-5 py-3">
          <TriangleAlert className="w-4 h-4 shrink-0" style={{ color: '#f59e0b' }} />
          <p style={{ fontFamily: 'Oswald, sans-serif', fontSize: '13px', letterSpacing: '0.1em', color: '#f59e0b' }}>
            DISCLAIMER — Build One Zambia Political Party
          </p>
          <button
            onClick={() => setExpanded(v => !v)}
            className="ml-2 flex items-center gap-1 text-xs px-2 py-1 rounded transition-colors hover:bg-white/10"
            style={{ color: '#94a3b8' }}
          >
            {expanded ? <><ChevronDown className="w-3 h-3" /> Hide</> : <><ChevronUp className="w-3 h-3" /> Read Full Disclaimer</>}
          </button>
          <button
            onClick={dismiss}
            aria-label="Dismiss disclaimer"
            className="ml-auto shrink-0 p-1 rounded transition-colors hover:bg-white/10"
            style={{ color: '#94a3b8' }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Expanded full disclaimer */}
        {expanded && (
          <div
            className="px-5 pb-5 overflow-y-auto"
            style={{ maxHeight: '55vh', borderTop: '1px solid rgba(255,255,255,0.07)' }}
          >
            <div className="max-w-4xl mx-auto pt-4 space-y-4" style={{ fontSize: '12px', color: '#cbd5e1', lineHeight: 1.8 }}>

              <p style={{ color: '#94a3b8', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '12px', fontSize: '11px', letterSpacing: '0.06em' }}>
                Build One Zambia Political Party — Official Website Disclosure
              </p>
              <div style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '4px' }} />

              <section>
                <p className="mb-1" style={{ fontFamily: 'Oswald, sans-serif', fontSize: '12px', letterSpacing: '0.08em', color: '#f59e0b' }}>1. PARTY STATUS</p>
                <p>
                  Build One Zambia is a political party currently undergoing formal registration in accordance with the laws of the Republic of Zambia. As such, all activities, publications, and representations on this website are made in that capacity. The founders of Build One Zambia acknowledge that a political party is distinct in nature and purpose from a private commercial entity — it is a constitutional vehicle through which the development and governance of a nation may be pursued on behalf of its citizens.
                </p>
              </section>

              <section>
                <p className="mb-1" style={{ fontFamily: 'Oswald, sans-serif', fontSize: '12px', letterSpacing: '0.08em', color: '#f59e0b' }}>2. NATURE OF FEATURED INDIVIDUALS</p>
                <p>
                  This website features the names, images, and profiles of certain Zambian citizens, including but not limited to former government ministers, former members of parliament, and youth leaders. These individuals have been identified by the founders of Build One Zambia on the basis of their public conduct, professional experience, and perceived alignment with the values and aspirations of this party.
                </p>
              </section>

              <section>
                <p className="mb-1" style={{ fontFamily: 'Oswald, sans-serif', fontSize: '12px', letterSpacing: '0.08em', color: '#f59e0b' }}>3. NO MEMBERSHIP OR ENDORSEMENT IMPLIED</p>
                <p className="mb-2">The appearance of any individual on this website shall not be construed as evidence that such individual has:</p>
                <ul className="space-y-1 pl-4" style={{ color: '#94a3b8' }}>
                  {[
                    'agreed to join Build One Zambia as a member;',
                    'endorsed the party, its policies, or its candidates in any capacity;',
                    'participated in or contributed to the formulation of the party\'s constitution, manifesto, or policy documents; or',
                    'authorised the use of their name or likeness in connection with this party.',
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span style={{ color: '#f59e0b', marginTop: '2px' }}>•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-2">
                  All featured individuals are included solely to express the party's aspiration to engage them in future consultation and collaboration. Build One Zambia intends to approach these individuals formally and share relevant constitutional, policy, and manifesto documents with them in due course.
                </p>
              </section>

              <section>
                <p className="mb-1" style={{ fontFamily: 'Oswald, sans-serif', fontSize: '12px', letterSpacing: '0.08em', color: '#f59e0b' }}>4. DONATIONS AND FINANCIAL SUPPORT</p>
                <p>
                  Any person choosing to donate to or financially support Build One Zambia does so on the basis of the party's cause, values, and vision for Zambia — and not on the basis of any individual featured on this website. Build One Zambia expressly discourages any donor from making a financial decision premised upon the assumed membership, endorsement, or participation of any featured individual.
                </p>
              </section>

              <section>
                <p className="mb-1" style={{ fontFamily: 'Oswald, sans-serif', fontSize: '12px', letterSpacing: '0.08em', color: '#f59e0b' }}>5. USER ACKNOWLEDGEMENT</p>
                <p>
                  By accessing and using this website, all users acknowledge that they have read, understood, and accepted the terms of this disclaimer in full. This notice governs the interpretation of all individual profiles, images, and references appearing anywhere on this website.
                </p>
              </section>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={dismiss}
                  className="px-5 py-2 rounded-lg text-xs font-bold transition-colors"
                  style={{ backgroundColor: '#f59e0b', color: '#0d1117', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.08em' }}
                >
                  I UNDERSTAND — CLOSE
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
