import { useState, useRef, useEffect } from 'react';
import { getToken } from '../lib/api';
import { projectId } from '../../../utils/supabase/info';
import {
  Search, CheckCircle2, XCircle, AlertTriangle, MapPin,
  UserCheck, Clock, RefreshCw, ShieldCheck, Users, Vote
} from 'lucide-react';

import { API_BASE } from '@/app/lib/apiBase';

async function apiFetch<T>(method: string, path: string, body?: unknown): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || data.details || `HTTP ${res.status}`);
  return data as T;
}

// ─── Types ────────────────────────────────────────────────────────────────────

type VerificationStatus =
  | 'not_registered'
  | 'registered_different_station'
  | 'registered_here'
  | 'already_voted';

interface VoterInfo {
  voterCardNumber: string;
  fullName: string;
  nrc: string;
  dob: string;
  gender: 'M' | 'F';
  province: string;
  district: string;
  constituency: string;
  ward: string;
  pollingStationId: string;
  pollingStationName: string;
}

interface VerificationResult {
  success: boolean;
  status: VerificationStatus;
  voter?: VoterInfo;
  hasVoted?: boolean;
  votedAt?: string;
  message: string;
  pollingStationName?: string;
  ward?: string;
  constituency?: string;
  district?: string;
  province?: string;
}

interface StationStats {
  registered: number;
  voted: number;
  remaining: number;
  turnoutPercent: number;
}

// ─── Config ───────────────────────────────────────────────────────────────────

interface VoterVerificationProps {
  pollingStationId: string;
  pollingStationName: string;
  agentName?: string;
  accentColor?: string;
}

// ─── Status display config ────────────────────────────────────────────────────

const STATUS_CONFIG: Record<VerificationStatus, {
  icon: React.ReactNode;
  bg: string;
  border: string;
  titleColor: string;
  title: string;
  badgeText: string;
  badgeBg: string;
}> = {
  registered_here: {
    icon: <CheckCircle2 size={40} color="#10b981" />,
    bg: 'rgba(16,185,129,0.07)',
    border: '#10b981',
    titleColor: '#10b981',
    title: 'CLEARED TO VOTE',
    badgeText: 'REGISTERED HERE',
    badgeBg: '#10b981',
  },
  not_registered: {
    icon: <XCircle size={40} color="#ef4444" />,
    bg: 'rgba(239,68,68,0.07)',
    border: '#ef4444',
    titleColor: '#ef4444',
    title: 'NOT REGISTERED',
    badgeText: 'NOT IN REGISTER',
    badgeBg: '#ef4444',
  },
  registered_different_station: {
    icon: <MapPin size={40} color="#f59e0b" />,
    bg: 'rgba(245,158,11,0.07)',
    border: '#f59e0b',
    titleColor: '#f59e0b',
    title: 'WRONG STATION',
    badgeText: 'DIFFERENT STATION',
    badgeBg: '#f59e0b',
  },
  already_voted: {
    icon: <AlertTriangle size={40} color="#f97316" />,
    bg: 'rgba(249,115,22,0.07)',
    border: '#f97316',
    titleColor: '#f97316',
    title: 'ALREADY VOTED',
    badgeText: 'DUPLICATE ATTEMPT',
    badgeBg: '#f97316',
  },
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatPill({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div className="flex flex-col items-center rounded-xl px-4 py-3" style={{ backgroundColor: `${color}12`, border: `1px solid ${color}30` }}>
      <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: '1.4rem', color, lineHeight: 1 }}>{value}</span>
      <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.68rem', letterSpacing: '0.08em', fontFamily: 'Oswald, sans-serif', marginTop: 3 }}>{label}</span>
    </div>
  );
}

function ResultCard({ result, onMarkVoted, marking }: {
  result: VerificationResult;
  onMarkVoted: () => void;
  marking: boolean;
}) {
  const cfg = STATUS_CONFIG[result.status];
  const v = result.voter;

  return (
    <div
      className="rounded-2xl p-6 mt-4 transition-all"
      style={{ backgroundColor: cfg.bg, border: `2px solid ${cfg.border}`, background: `linear-gradient(135deg, ${cfg.bg} 0%, rgba(15,31,51,0.9) 100%)` }}
    >
      {/* Status header */}
      <div className="flex items-center gap-4 mb-5">
        <div className="shrink-0">{cfg.icon}</div>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h3 style={{ fontFamily: 'Oswald, sans-serif', fontSize: '1.5rem', color: cfg.titleColor, letterSpacing: '0.05em', lineHeight: 1 }}>
              {cfg.title}
            </h3>
            <span
              className="px-2.5 py-0.5 rounded-full text-white"
              style={{ backgroundColor: cfg.badgeBg, fontFamily: 'Oswald, sans-serif', fontSize: '0.65rem', letterSpacing: '0.1em' }}
            >
              {cfg.badgeText}
            </span>
          </div>
          {v && (
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', marginTop: 4 }}>{v.fullName}</p>
          )}
        </div>
      </div>

      {/* Message */}
      <div className="rounded-xl px-4 py-3 mb-5" style={{ backgroundColor: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.07)' }}>
        <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.88rem', lineHeight: 1.6 }}>{result.message}</p>
      </div>

      {/* Voter details */}
      {v && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-5">
          {[
            { label: 'FULL NAME', value: v.fullName },
            { label: 'NRC / ID', value: v.nrc },
            { label: 'DATE OF BIRTH', value: v.dob },
            { label: 'GENDER', value: v.gender === 'M' ? 'Male' : 'Female' },
            { label: 'WARD', value: v.ward },
            { label: 'CONSTITUENCY', value: v.constituency },
            { label: 'DISTRICT', value: v.district },
            { label: 'PROVINCE', value: v.province },
            { label: 'POLLING STATION', value: v.pollingStationName },
          ].map(f => (
            <div key={f.label}>
              <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.65rem', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.1em', marginBottom: 2 }}>{f.label}</p>
              <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.82rem' }}>{f.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Already voted timestamp */}
      {result.status === 'already_voted' && result.votedAt && (
        <div className="flex items-center gap-2 mb-4 px-3 py-2 rounded-lg" style={{ backgroundColor: 'rgba(249,115,22,0.12)', border: '1px solid rgba(249,115,22,0.3)' }}>
          <Clock size={14} color="#f97316" />
          <p style={{ color: '#f97316', fontSize: '0.8rem', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.05em' }}>
            VOTED AT: {new Date(result.votedAt).toLocaleString('en-ZM', { dateStyle: 'medium', timeStyle: 'short' })}
          </p>
        </div>
      )}

      {/* Redirect info for wrong station */}
      {result.status === 'registered_different_station' && (
        <div className="rounded-xl p-4 mb-4" style={{ backgroundColor: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)' }}>
          <p style={{ color: '#f59e0b', fontFamily: 'Oswald, sans-serif', fontSize: '0.75rem', letterSpacing: '0.08em', marginBottom: 6 }}>REDIRECT VOTER TO:</p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Station', value: result.pollingStationName },
              { label: 'Ward', value: result.ward },
              { label: 'Constituency', value: result.constituency },
              { label: 'District', value: result.district },
            ].map(f => f.value && (
              <div key={f.label}>
                <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.65rem', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.08em' }}>{f.label}</p>
                <p style={{ color: '#fff', fontSize: '0.85rem' }}>{f.value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mark Voted button */}
      {result.status === 'registered_here' && (
        <button
          onClick={onMarkVoted}
          disabled={marking}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white transition-all"
          style={{
            background: marking ? 'rgba(16,185,129,0.4)' : 'linear-gradient(135deg, #10b981, #059669)',
            fontFamily: 'Oswald, sans-serif',
            letterSpacing: '0.08em',
            fontSize: '0.95rem',
            cursor: marking ? 'not-allowed' : 'pointer',
          }}
        >
          {marking ? <><RefreshCw size={16} className="animate-spin" /> RECORDING...</> : <><UserCheck size={16} /> ISSUE BALLOT — MARK AS VOTED</>}
        </button>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function VoterVerification({ pollingStationId, pollingStationName, agentName, accentColor = '#0ea5e9' }: VoterVerificationProps) {
  const [cardNumber, setCardNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [marking, setMarking] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [error, setError] = useState('');
  const [stats, setStats] = useState<StationStats | null>(null);
  const [markedSuccess, setMarkedSuccess] = useState(false);
  const [history, setHistory] = useState<{ card: string; name: string; status: VerificationStatus; time: string }[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadStats();
    inputRef.current?.focus();
  }, [pollingStationId]);

  async function loadStats() {
    try {
      const data = await apiFetch<StationStats & { success: boolean }>('GET', `/voter/stats/${encodeURIComponent(pollingStationId)}`);
      setStats(data);
    } catch {
      // stats optional
    }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = cardNumber.trim();
    if (!trimmed) return;
    setLoading(true);
    setError('');
    setResult(null);
    setMarkedSuccess(false);
    try {
      const data = await apiFetch<VerificationResult>('POST', '/voter/verify', {
        voterCardNumber: trimmed,
        pollingStationId,
      });
      setResult(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleMarkVoted() {
    if (!result?.voter) return;
    setMarking(true);
    try {
      const data = await apiFetch<{ success: boolean; message: string }>('POST', '/voter/mark-voted', {
        voterCardNumber: result.voter.voterCardNumber,
        pollingStationId,
        recordedBy: agentName || 'agent',
      });
      if (data.success) {
        setMarkedSuccess(true);
        setHistory(h => [{ card: result.voter!.voterCardNumber, name: result.voter!.fullName, status: 'registered_here', time: new Date().toLocaleTimeString() }, ...h.slice(0, 9)]);
        setResult(null);
        setCardNumber('');
        await loadStats();
        inputRef.current?.focus();
      } else {
        setError(data.message);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to mark voter.');
    } finally {
      setMarking(false);
    }
  }

  function handleReset() {
    setResult(null);
    setError('');
    setCardNumber('');
    setMarkedSuccess(false);
    inputRef.current?.focus();
  }

  const STATUS_HISTORY_COLORS: Record<string, string> = {
    registered_here: '#10b981',
    not_registered: '#ef4444',
    registered_different_station: '#f59e0b',
    already_voted: '#f97316',
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: accentColor }}>
            <ShieldCheck size={18} color="#fff" />
          </div>
          <h2 style={{ fontFamily: 'Oswald, sans-serif', fontSize: '1.4rem', letterSpacing: '0.04em', color: '#fff' }}>
            Voter Card Verification
          </h2>
        </div>
        <p style={{ color: 'rgba(255,255,255,0.38)', fontSize: '0.82rem', marginTop: 2 }}>
          {pollingStationName} · Verify voter eligibility before issuing ballot
        </p>
      </div>

      {/* Stats bar */}
      {stats && (
        <div className="grid grid-cols-4 gap-3 mb-6">
          <StatPill label="REGISTERED" value={stats.registered.toLocaleString()} color={accentColor} />
          <StatPill label="VOTED" value={stats.voted.toLocaleString()} color="#10b981" />
          <StatPill label="REMAINING" value={stats.remaining.toLocaleString()} color="#f59e0b" />
          <StatPill label="TURNOUT" value={`${stats.turnoutPercent}%`} color="#8b5cf6" />
        </div>
      )}

      {/* Marked success flash */}
      {markedSuccess && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl mb-4" style={{ backgroundColor: 'rgba(16,185,129,0.12)', border: '1px solid #10b981' }}>
          <CheckCircle2 size={18} color="#10b981" />
          <p style={{ color: '#10b981', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.05em', fontSize: '0.9rem' }}>
            BALLOT ISSUED — Voter marked as voted successfully.
          </p>
        </div>
      )}

      {/* Search form */}
      <form onSubmit={handleVerify} className="mb-2">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'rgba(255,255,255,0.3)' }} />
            <input
              ref={inputRef}
              type="text"
              value={cardNumber}
              onChange={e => setCardNumber(e.target.value.toUpperCase())}
              placeholder="Enter Voter Card Number e.g. ZM-2026-001-001234"
              className="w-full pl-9 pr-4 py-3 rounded-xl text-sm"
              style={{
                backgroundColor: 'rgba(255,255,255,0.06)',
                border: `1px solid ${result ? STATUS_CONFIG[result.status].border : 'rgba(255,255,255,0.12)'}`,
                color: '#fff',
                outline: 'none',
                fontFamily: 'monospace',
                letterSpacing: '0.05em',
              }}
              autoComplete="off"
              disabled={loading || marking}
            />
          </div>
          <button
            type="submit"
            disabled={loading || !cardNumber.trim()}
            className="px-6 py-3 rounded-xl text-white text-sm transition-all shrink-0"
            style={{
              background: loading ? 'rgba(255,255,255,0.1)' : accentColor,
              fontFamily: 'Oswald, sans-serif',
              letterSpacing: '0.08em',
              cursor: loading || !cardNumber.trim() ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? <RefreshCw size={16} className="animate-spin" /> : 'VERIFY'}
          </button>
          {(result || markedSuccess) && (
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-3 rounded-xl text-sm shrink-0"
              style={{ backgroundColor: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.06em' }}
            >
              CLEAR
            </button>
          )}
        </div>

        {/* Sample card numbers hint */}
        <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.7rem', marginTop: 6 }}>
          Sample test cards: ZM-2026-001-001234 · ZM-2026-001-001236 (voted) · ZM-2026-002-010010 (different station)
        </p>
      </form>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl mt-3" style={{ backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}>
          <XCircle size={15} color="#ef4444" />
          <p style={{ color: '#ef4444', fontSize: '0.82rem' }}>{error}</p>
        </div>
      )}

      {/* Result */}
      {result && (
        <ResultCard result={result} onMarkVoted={handleMarkVoted} marking={marking} />
      )}

      {/* Recent verifications log */}
      {history.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center gap-2 mb-3">
            <Clock size={13} style={{ color: 'rgba(255,255,255,0.3)' }} />
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.72rem', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.1em' }}>RECENT VERIFICATIONS</p>
          </div>
          <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
            {history.map((h, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-2.5" style={{ borderBottom: i < history.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none', backgroundColor: i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent' }}>
                <div className="w-2 h-2 rounded-full shrink-0" style={{ background: STATUS_HISTORY_COLORS[h.status] || '#9ca3af' }} />
                <p className="flex-1 text-xs" style={{ color: 'rgba(255,255,255,0.7)', fontFamily: 'monospace' }}>{h.card}</p>
                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.55)' }}>{h.name}</p>
                <p className="text-xs shrink-0" style={{ color: 'rgba(255,255,255,0.3)' }}>{h.time}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Instructions */}
      {!result && !markedSuccess && (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              icon: <CheckCircle2 size={18} color="#10b981" />,
              title: 'Registered Here',
              desc: 'Voter is on the register for this polling station. You may issue a ballot and click "Mark as Voted".',
              color: '#10b981',
            },
            {
              icon: <XCircle size={18} color="#ef4444" />,
              title: 'Not Registered',
              desc: 'Voter card number not found in the ECZ electoral register. Do not issue a ballot.',
              color: '#ef4444',
            },
            {
              icon: <MapPin size={18} color="#f59e0b" />,
              title: 'Wrong Station',
              desc: 'Voter is registered at a different polling station. Redirect them to their correct station.',
              color: '#f59e0b',
            },
            {
              icon: <AlertTriangle size={18} color="#f97316" />,
              title: 'Already Voted',
              desc: 'Voter has already been issued a ballot today. Do not issue another ballot.',
              color: '#f97316',
            },
          ].map(c => (
            <div key={c.title} className="flex items-start gap-3 p-4 rounded-xl" style={{ backgroundColor: `${c.color}08`, border: `1px solid ${c.color}20` }}>
              <div className="shrink-0 mt-0.5">{c.icon}</div>
              <div>
                <p style={{ color: c.color, fontFamily: 'Oswald, sans-serif', fontSize: '0.8rem', letterSpacing: '0.06em', marginBottom: 3 }}>{c.title}</p>
                <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.75rem', lineHeight: 1.5 }}>{c.desc}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
