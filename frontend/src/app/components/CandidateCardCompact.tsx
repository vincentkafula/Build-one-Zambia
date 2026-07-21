import { Candidate } from '../data/mockData';
import { Award } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { candidatePhotos } from '../data/candidatePhotos';

interface CandidateCardCompactProps {
  candidate: Candidate;
  votes: number;
  totalVotes: number;
  isLeading?: boolean;
}

// Compact, vertically-stacked card meant to sit side-by-side with three
// others in a single row (photo → name → party → % → votes → bar),
// mirroring the reference dashboard's top-4 layout.
export function CandidateCardCompact({ candidate, votes, totalVotes, isLeading }: CandidateCardCompactProps) {
  const ratio = totalVotes > 0 && isFinite(votes / totalVotes) ? (votes / totalVotes) * 100 : 0;
  const percentage = ratio.toFixed(2);

  const initials = candidate.name
    .split(' ')
    .filter(w => /^[A-Z]/.test(w) && !['Mr', 'Ms', 'Dr', 'Mrs'].includes(w))
    .map(n => n[0])
    .join('')
    .slice(0, 2);

  return (
    <div
      className="relative rounded-2xl p-5 transition-all duration-300 hover:-translate-y-0.5"
      style={{
        background: isLeading ? `linear-gradient(160deg, ${candidate.partyColor}12 0%, var(--card) 45%)` : 'var(--card)',
        border: isLeading ? `2px solid ${candidate.partyColor}` : '1.5px solid var(--border)',
        boxShadow: isLeading ? `0 8px 28px ${candidate.partyColor}22` : '0 2px 8px rgba(0,0,0,0.06)',
      }}
    >
      {isLeading && (
        <div
          className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full text-white shadow-md"
          style={{ background: candidate.partyColor }}
        >
          <Award size={10} />
          <span style={{ fontSize: '9px', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.1em' }}>LEADING</span>
        </div>
      )}

      {/* Photo */}
      {candidatePhotos[candidate.id] ? (
        <div
          className="w-16 h-16 rounded-full overflow-hidden shadow-sm mb-3"
          style={{ border: `2.5px solid ${candidate.partyColor}` }}
        >
          <ImageWithFallback
            src={candidatePhotos[candidate.id]}
            alt={candidate.name}
            className="w-full h-full object-cover object-top"
          />
        </div>
      ) : (
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center shadow-sm mb-3"
          style={{ background: `linear-gradient(135deg, ${candidate.partyColor} 0%, ${candidate.partyColor}aa 100%)` }}
        >
          <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: '20px', color: '#fff' }}>{initials}</span>
        </div>
      )}

      {/* Name */}
      <h3
        className="leading-tight mb-1"
        style={{ fontFamily: 'Oswald, sans-serif', fontSize: '17px', fontWeight: 700, color: 'var(--foreground)', minHeight: '44px' }}
      >
        {candidate.name}
      </h3>

      {/* Party */}
      <span
        className="inline-block px-2 py-0.5 rounded-full text-white mb-3"
        style={{ background: candidate.partyColor, fontFamily: 'Oswald, sans-serif', fontSize: '10px', letterSpacing: '0.1em' }}
      >
        {candidate.party}
      </span>

      {/* Percentage + votes */}
      <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: '26px', fontWeight: 700, color: candidate.partyColor, lineHeight: 1 }}>
        {percentage}<span style={{ fontSize: '13px', fontWeight: 400, color: 'var(--muted-foreground)' }}>%</span>
      </div>
      <div className="text-xs mb-3" style={{ color: 'var(--muted-foreground)', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.04em' }}>
        {votes.toLocaleString()} votes
      </div>

      {/* Progress bar */}
      <div className="w-full rounded-full h-2 overflow-hidden" style={{ background: 'var(--muted)' }}>
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{ width: `${Math.max(ratio, ratio > 0 ? 0.5 : 0)}%`, background: candidate.partyColor }}
        />
      </div>
    </div>
  );
}
