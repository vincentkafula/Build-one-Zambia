import { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle2, MinusCircle, ChevronDown, ChevronUp, Scale } from 'lucide-react';
import { getECZFigures, ECZElectionType, ECZLevelType, ECZLevelData } from '../data/eczStore';
import type { Candidate } from '../data/mockData';

interface AgentTotal {
  candidateId: string;
  votes: number;
}

interface ECZComparisonPanelProps {
  levelType: ECZLevelType;
  levelId: string;
  levelName: string;
  electionType: ECZElectionType;
  candidates: Candidate[];
  agentTotals: AgentTotal[];
  agentTotalVotes: number;
  agentRejectedBallots: number;
}

function discrepancyClass(diff: number): string {
  if (diff === 0) return 'text-green-700';
  if (Math.abs(diff) < 10) return 'text-yellow-700';
  return 'text-red-700';
}

function discrepancyBg(diff: number): string {
  if (diff === 0) return 'bg-green-50 border-green-200';
  if (Math.abs(diff) < 10) return 'bg-yellow-50 border-yellow-200';
  return 'bg-red-50 border-red-200';
}

function DiscrepancyBadge({ diff }: { diff: number }) {
  if (diff === 0) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 text-green-800" style={{ fontSize: 11 }}>
        <CheckCircle2 className="w-3 h-3" /> Match
      </span>
    );
  }
  const sign = diff > 0 ? '+' : '';
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full ${Math.abs(diff) < 10 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}
      style={{ fontSize: 11 }}
    >
      <AlertTriangle className="w-3 h-3" />
      {sign}{diff.toLocaleString()}
    </span>
  );
}

export function ECZComparisonPanel({
  levelType,
  levelId,
  levelName,
  electionType,
  candidates,
  agentTotals,
  agentTotalVotes,
  agentRejectedBallots,
}: ECZComparisonPanelProps) {
  const [eczData, setEczData] = useState<ECZLevelData | null>(null);
  const [expanded, setExpanded] = useState(true);

  useEffect(() => {
    setEczData(getECZFigures(levelType, levelId, electionType));
  }, [levelType, levelId, electionType]);

  const agentMap = new Map(agentTotals.map(t => [t.candidateId, t.votes]));

  const rows = candidates.map(c => {
    const agentVotes = agentMap.get(c.id) ?? 0;
    const eczVotes = eczData?.figures.find(f => f.candidateId === c.id)?.votes ?? null;
    const diff = eczVotes !== null ? agentVotes - eczVotes : null;
    return { candidate: c, agentVotes, eczVotes, diff };
  });

  const eczTotalVotes = eczData?.totalVotesCast ?? null;
  const eczRejected = eczData?.rejectedBallots ?? null;
  const totalVotesDiff = eczTotalVotes !== null ? agentTotalVotes - eczTotalVotes : null;
  const rejectedDiff = eczRejected !== null ? agentRejectedBallots - eczRejected : null;

  const hasDiscrepancy = rows.some(r => r.diff !== null && r.diff !== 0) ||
    (totalVotesDiff !== null && totalVotesDiff !== 0) ||
    (rejectedDiff !== null && rejectedDiff !== 0);

  const allMatch = eczData !== null && !hasDiscrepancy;

  return (
    <div className={`rounded-2xl border-2 shadow-sm overflow-hidden ${allMatch ? 'border-green-300' : eczData ? 'border-red-300' : 'border-amber-200'}`}>
      {/* Header */}
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full flex items-center justify-between px-5 py-3 bg-white"
        style={{ outline: 'none' }}
      >
        <div className="flex items-center gap-3">
          <Scale className="w-5 h-5" style={{ color: '#7C3AED' }} />
          <div className="text-left">
            <div className="font-bold text-gray-800" style={{ fontSize: 14 }}>
              Agent vs ECZ Announced Figures
            </div>
            <div className="text-gray-500" style={{ fontSize: 12 }}>
              {levelName} · {electionType.charAt(0).toUpperCase() + electionType.slice(1)}
            </div>
          </div>
          {!eczData && (
            <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-800" style={{ fontSize: 11 }}>
              <MinusCircle className="w-3 h-3" /> ECZ figures not entered
            </span>
          )}
          {allMatch && (
            <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 text-green-800" style={{ fontSize: 11 }}>
              <CheckCircle2 className="w-3 h-3" /> All figures match
            </span>
          )}
          {eczData && hasDiscrepancy && (
            <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-100 text-red-800" style={{ fontSize: 11 }}>
              <AlertTriangle className="w-3 h-3" /> Discrepancies found
            </span>
          )}
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
      </button>

      {expanded && (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse" style={{ fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#F3F4F6', borderTop: '1px solid #E5E7EB', borderBottom: '1px solid #E5E7EB' }}>
                <th className="text-left px-4 py-2.5 font-semibold text-gray-700">Candidate</th>
                <th className="text-left px-3 py-2.5 font-semibold text-gray-700">Party</th>
                <th className="text-right px-4 py-2.5 font-semibold text-blue-700">Agent Total</th>
                <th className="text-right px-4 py-2.5 font-semibold text-purple-700">ECZ Announced</th>
                <th className="text-right px-4 py-2.5 font-semibold text-gray-700">Discrepancy</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr
                  key={row.candidate.id}
                  style={{
                    background: row.diff !== null && row.diff !== 0 ? '#FFF7F7' : i % 2 === 0 ? '#FFFFFF' : '#FAFAFA',
                    borderBottom: '1px solid #F3F4F6',
                  }}
                >
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: row.candidate.partyColor }} />
                      <span className="text-gray-800">{row.candidate.name}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-gray-500">{row.candidate.party}</td>
                  <td className="px-4 py-2.5 text-right font-mono font-semibold text-blue-800">
                    {row.agentVotes.toLocaleString()}
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono font-semibold text-purple-800">
                    {row.eczVotes !== null ? row.eczVotes.toLocaleString() : <span className="text-gray-300 font-normal">—</span>}
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    {row.diff !== null ? (
                      <DiscrepancyBadge diff={row.diff} />
                    ) : (
                      <span className="text-gray-300" style={{ fontSize: 11 }}>—</span>
                    )}
                  </td>
                </tr>
              ))}

              {/* Total Votes row */}
              <tr style={{ background: '#EFF6FF', borderTop: '2px solid #BFDBFE', borderBottom: '1px solid #BFDBFE' }}>
                <td className="px-4 py-2.5 font-bold text-gray-800" colSpan={2}>Total Valid Votes Cast</td>
                <td className="px-4 py-2.5 text-right font-mono font-bold text-blue-800">
                  {agentTotalVotes.toLocaleString()}
                </td>
                <td className="px-4 py-2.5 text-right font-mono font-bold text-purple-800">
                  {eczTotalVotes !== null ? eczTotalVotes.toLocaleString() : <span className="text-gray-300 font-normal">—</span>}
                </td>
                <td className="px-4 py-2.5 text-right">
                  {totalVotesDiff !== null ? <DiscrepancyBadge diff={totalVotesDiff} /> : <span className="text-gray-300">—</span>}
                </td>
              </tr>

              {/* Rejected Ballots row */}
              <tr style={{ background: '#FFF7ED', borderBottom: '1px solid #FED7AA' }}>
                <td className="px-4 py-2.5 font-semibold text-gray-700" colSpan={2}>Rejected Ballots</td>
                <td className="px-4 py-2.5 text-right font-mono font-semibold text-blue-700">
                  {agentRejectedBallots.toLocaleString()}
                </td>
                <td className="px-4 py-2.5 text-right font-mono font-semibold text-purple-700">
                  {eczRejected !== null ? eczRejected.toLocaleString() : <span className="text-gray-300 font-normal">—</span>}
                </td>
                <td className="px-4 py-2.5 text-right">
                  {rejectedDiff !== null ? <DiscrepancyBadge diff={rejectedDiff} /> : <span className="text-gray-300">—</span>}
                </td>
              </tr>
            </tbody>
          </table>

          {/* Legend & ECZ entry link */}
          <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-4 flex-wrap" style={{ fontSize: 11 }}>
              <span className="flex items-center gap-1 text-blue-700 font-semibold">
                <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" /> Agent Total = sum from polling agents
              </span>
              <span className="flex items-center gap-1 text-purple-700 font-semibold">
                <span className="w-2 h-2 rounded-full bg-purple-500 inline-block" /> ECZ Announced = official ECZ figure
              </span>
              <span className="flex items-center gap-1 text-gray-500">
                <span className="w-2 h-2 rounded-full bg-gray-400 inline-block" /> Discrepancy = Agent − ECZ
              </span>
            </div>
            <a
              href="/ecz-entry"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white font-semibold transition"
              style={{ background: '#7C3AED', fontSize: 12 }}
            >
              Enter / Update ECZ Figures →
            </a>
          </div>

          {eczData && (
            <div className="px-5 py-2 bg-gray-50 border-t border-gray-100 text-gray-400" style={{ fontSize: 11 }}>
              ECZ figures entered by <strong>{eczData.enteredBy || 'Unknown'}</strong> on {new Date(eczData.timestamp).toLocaleString()}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
