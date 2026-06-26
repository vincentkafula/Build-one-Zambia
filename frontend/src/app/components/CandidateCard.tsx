import { Candidate } from '../data/mockData';
import { Award, Star } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { candidatePhotos } from '../data/candidatePhotos';

interface CandidateCardProps {
  candidate: Candidate;
  votes: number;
  totalVotes: number;
  rank?: number;
  isLeading?: boolean;
}

export function CandidateCard({ candidate, votes, totalVotes, rank, isLeading }: CandidateCardProps) {
  const ratio = totalVotes > 0 && isFinite(votes / totalVotes) ? (votes / totalVotes) * 100 : 0;
  const percentage = ratio.toFixed(2);
  const pct = ratio;

  const rankColors: Record<number, { bg: string; text: string; shadow: string }> = {
    1: { bg: 'linear-gradient(135deg,#F59E0B,#D97706)', text: '#fff', shadow: '0 4px 16px #F59E0B55' },
    2: { bg: 'linear-gradient(135deg,#94a3b8,#64748b)', text: '#fff', shadow: '0 4px 16px #94a3b855' },
    3: { bg: 'linear-gradient(135deg,#CD7F32,#A0522D)', text: '#fff', shadow: '0 4px 16px #CD7F3255' },
  };
  const rc = rank && rankColors[rank];

  return (
    <div
      className="relative overflow-hidden rounded-2xl transition-all duration-300 hover:-translate-y-0.5"
      style={{
        background: isLeading
          ? `linear-gradient(135deg, ${candidate.partyColor}18 0%, #ffffff 40%)`
          : 'white',
        border: isLeading
          ? `2px solid ${candidate.partyColor}`
          : '1.5px solid #e5e7eb',
        boxShadow: isLeading
          ? `0 8px 32px ${candidate.partyColor}25, 0 2px 8px rgba(0,0,0,0.06)`
          : '0 2px 8px rgba(0,0,0,0.06)',
      }}
    >
      {/* Top accent bar */}
      <div
        className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl"
        style={{ background: `linear-gradient(90deg, ${candidate.partyColor}, ${candidate.partyColor}88)` }}
      />

      {/* Leading badge */}
      {isLeading && (
        <div
          className="absolute top-3 right-3 flex items-center gap-1 px-3 py-1 rounded-full text-white shadow-lg"
          style={{ background: `linear-gradient(135deg, ${candidate.partyColor}, ${candidate.partyColor}cc)` }}
        >
          <Award size={11} />
          <span style={{ fontSize: '10px', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.1em' }}>LEADING</span>
        </div>
      )}

      <div className="p-5 pt-6">
        <div className="flex items-center gap-4">

          {/* Rank circle */}
          {rank && (
            <div
              className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-md"
              style={{
                background: rc ? rc.bg : '#f3f4f6',
                color: rc ? rc.text : '#6b7280',
                boxShadow: rc ? rc.shadow : undefined,
              }}
            >
              {rank === 1
                ? <Star size={16} fill="white" color="white" />
                : <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: '15px' }}>{rank}</span>
              }
            </div>
          )}

          {/* Avatar */}
          {candidatePhotos[candidate.id] ? (
            <div className="shrink-0 w-16 h-16 rounded-2xl overflow-hidden shadow-md" style={{ border: `2px solid ${candidate.partyColor}55` }}>
              <ImageWithFallback
                src={candidatePhotos[candidate.id]}
                alt={candidate.name}
                className="w-full h-full object-cover object-top"
              />
            </div>
          ) : (
            <div
              className="shrink-0 w-16 h-16 rounded-2xl flex items-center justify-center shadow-md"
              style={{
                background: `linear-gradient(135deg, ${candidate.partyColor} 0%, ${candidate.partyColor}aa 100%)`,
              }}
            >
              <span
                style={{
                  fontFamily: 'Oswald, sans-serif',
                  fontSize: '22px',
                  letterSpacing: '0.05em',
                  color: '#fff',
                }}
              >
                {candidate.name.split(' ').filter(w => /^[A-Z]/.test(w) && !['Mr','Ms','Dr','Mrs'].includes(w)).map(n => n[0]).join('').slice(0, 2)}
              </span>
            </div>
          )}

          {/* Name + party */}
          <div className="flex-1 min-w-0">
            <h3
              className="leading-tight mb-1"
              style={{
                fontFamily: 'Oswald, sans-serif',
                fontSize: '26px',
                fontWeight: 700,
                letterSpacing: '0.02em',
                color: '#1e2d4a',
                lineHeight: 1.15,
              }}
            >
              {candidate.name}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-white shadow-sm"
                style={{
                  background: candidate.partyColor,
                  fontFamily: 'Oswald, sans-serif',
                  fontSize: '11px',
                  letterSpacing: '0.12em',
                }}
              >
                {candidate.party}
              </span>
            </div>
          </div>

          {/* Vote count + percentage */}
          <div className="shrink-0 text-right">
            <div
              style={{
                fontFamily: 'Oswald, sans-serif',
                fontSize: '28px',
                fontWeight: 700,
                color: pct > 0 ? candidate.partyColor : '#9ca3af',
                lineHeight: 1,
              }}
            >
              {percentage}
              <span style={{ fontSize: '14px', fontWeight: 400, color: '#9ca3af', marginLeft: '2px' }}>%</span>
            </div>
            <div className="text-xs text-gray-400 mt-0.5" style={{ fontFamily: 'Oswald, sans-serif', letterSpacing: '0.05em' }}>
              {votes.toLocaleString()} VOTES
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4">
          <div className="w-full rounded-full h-2.5 overflow-hidden" style={{ background: '#f3f4f6' }}>
            <div
              className="h-full rounded-full transition-all duration-700 ease-out"
              style={{
                width: `${Math.max(pct, pct > 0 ? 0.5 : 0)}%`,
                background: `linear-gradient(90deg, ${candidate.partyColor}cc, ${candidate.partyColor})`,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
