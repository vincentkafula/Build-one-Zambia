/**
 * AgentScannerMode
 * Polling agent ballot scanner integration panel.
 * Switch to Scanner Mode and the DS300 feeds results directly —
 * live totals update every 3 seconds and auto-submit when the poll closes.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  ScanLine, Wifi, WifiOff, CheckCircle2, XCircle, AlertTriangle,
  Zap, RefreshCw, Send, BarChart3, Activity, Clock, Shield,
  Loader2, ChevronDown, ChevronUp, Radio
} from 'lucide-react';
import { projectId } from '../../../utils/supabase/info';

const BASE = `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/make-server-8fca9621`;
const POLL_MS = 3000; // 3-second live poll

// ─── Types ────────────────────────────────────────────────────────────────────

interface LiveSession {
  sessionId: string;
  status: 'open' | 'closed' | 'transmitted';
  ballotsScanned: number;
  validBallots: number;
  rejectedBallots: number;
  blankBallots: number;
  overvoteBallots: number;
  voteCounts: Record<string, number>;
  registeredVoters: number;
  turnoutPercentage: number;
  closedAt?: string;
  reportHash?: string;
  candidates: { id: string; name: string; party: string; partyAbbr?: string }[];
  polledAt: string;
}

interface ConnectResponse {
  connected: boolean;
  session: {
    id: string;
    pollingStationName: string;
    pollingStationId: string;
    electionType: string;
    status: string;
    openedAt: string;
    registeredVoters: number;
    ballotsScanned: number;
    validBallots: number;
    rejectedBallots: number;
    blankBallots: number;
    overvoteBallots: number;
    voteCounts: Record<string, number>;
    turnoutPercentage: number;
  } | null;
  candidates: { id: string; name: string; party: string; partyAbbr?: string }[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function fetchLive(sessionId: string): Promise<LiveSession> {
  const res = await fetch(`${BASE}/ballot-scan/agent/sessions/${sessionId}/live`);
  if (!res.ok) throw new Error('Failed to fetch live data');
  return res.json();
}

async function connectSession(stationId: string, electionType: string): Promise<ConnectResponse> {
  const qs = `stationId=${encodeURIComponent(stationId)}&electionType=${encodeURIComponent(electionType)}`;
  const res = await fetch(`${BASE}/ballot-scan/agent/session?${qs}`);
  if (!res.ok) throw new Error('Failed to connect');
  return res.json();
}

async function autoSubmit(sessionId: string, agentName: string): Promise<{ success: boolean; submission?: { id: string } }> {
  const res = await fetch(`${BASE}/ballot-scan/agent/sessions/${sessionId}/auto-submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ agentName }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Auto-submit failed');
  }
  return res.json();
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function PulsingDot({ color }: { color: string }) {
  return (
    <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: '50%', backgroundColor: color, boxShadow: `0 0 0 0 ${color}`, animation: 'scanPulse 1.4s ease-in-out infinite' }} />
  );
}

function VoteBar({ name, party, votes, totalValid, color }: {
  name: string; party: string; votes: number; totalValid: number; color: string;
}) {
  const pct = totalValid > 0 ? (votes / totalValid) * 100 : 0;
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 3 }}>
        <div>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#0f1e35' }}>{name}</span>
          <span style={{ fontSize: 11, color: '#6b7280', marginLeft: 6 }}>{party}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
          <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: 16, color: '#0f1e35' }}>{votes.toLocaleString()}</span>
          <span style={{ fontSize: 11, color: '#9ca3af' }}>{pct.toFixed(1)}%</span>
        </div>
      </div>
      <div style={{ height: 10, backgroundColor: '#f3f4f6', borderRadius: 6, overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          width: `${pct}%`,
          backgroundColor: color,
          borderRadius: 6,
          transition: 'width 0.6s cubic-bezier(0.25,0.46,0.45,0.94)',
        }} />
      </div>
    </div>
  );
}

const CANDIDATE_COLORS = [
  '#dc2626','#2563eb','#16a34a','#9333ea','#f59e0b','#0891b2','#be185d','#65a30d',
];

// ─── Main Component ───────────────────────────────────────────────────────────

interface Props {
  stationId?: string;        // pre-filled from agent's assigned station
  stationName?: string;
  agentName?: string;
  defaultElectionType?: string;
}

export function AgentScannerMode({ stationId = '', stationName = '', agentName = 'Polling Agent', defaultElectionType = 'presidential' }: Props) {
  // Connection state
  const [step, setStep] = useState<'idle' | 'connecting' | 'live' | 'closed' | 'submitted'>('idle');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [live, setLive] = useState<LiveSession | null>(null);
  const [connErr, setConnErr] = useState('');
  const [submitMsg, setSubmitMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [prevBallots, setPrevBallots] = useState(0);
  const [justScanned, setJustScanned] = useState(false);

  // Connect form
  const [inputStation, setInputStation] = useState(stationId);
  const [electionType, setElectionType] = useState(defaultElectionType);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Live polling
  const poll = useCallback(async (sid: string) => {
    try {
      const data = await fetchLive(sid);
      setLive(prev => {
        if (prev && data.ballotsScanned > prev.ballotsScanned) {
          setJustScanned(true);
          setTimeout(() => setJustScanned(false), 600);
        }
        setPrevBallots(prev?.ballotsScanned ?? 0);
        return data;
      });
      setLastUpdated(new Date());
      if (data.status !== 'open') {
        clearInterval(intervalRef.current!);
        setStep('closed');
      }
    } catch { /* network blip — keep polling */ }
  }, []);

  function startPolling(sid: string) {
    poll(sid);
    intervalRef.current = setInterval(() => poll(sid), POLL_MS);
  }

  function stopPolling() {
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
  }

  useEffect(() => () => stopPolling(), []);

  async function handleConnect() {
    if (!inputStation.trim()) { setConnErr('Enter your polling station ID or name'); return; }
    setConnErr(''); setStep('connecting');
    try {
      const res = await connectSession(inputStation.trim(), electionType);
      if (!res.connected || !res.session) {
        setConnErr('No open scanner session found for this polling station. Ask the administrator to open a poll session on the DS300 scanner first.');
        setStep('idle');
        return;
      }
      setSessionId(res.session.id);
      setStep('live');
      startPolling(res.session.id);
    } catch (e) {
      setConnErr(e instanceof Error ? e.message : 'Connection failed');
      setStep('idle');
    }
  }

  function handleDisconnect() {
    stopPolling();
    setStep('idle');
    setSessionId(null);
    setLive(null);
  }

  async function handleAutoSubmit() {
    if (!sessionId) return;
    setSubmitting(true);
    try {
      await autoSubmit(sessionId, agentName);
      setSubmitMsg('Results successfully submitted to the election results system!');
      setStep('submitted');
    } catch (e) {
      setSubmitMsg(e instanceof Error ? e.message : 'Submit failed');
    }
    setSubmitting(false);
  }

  // ── Render idle/connect ──────────────────────────────────────────────────────
  if (step === 'idle' || step === 'connecting') {
    return (
      <div style={{ maxWidth: 580, margin: '0 auto' }}>
        {/* Header card */}
        <div style={{ background: 'linear-gradient(135deg, #0f1e35 0%, #1a3050 100%)', borderRadius: 16, padding: '28px 28px 24px', marginBottom: 20, color: '#fff', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -20, right: -20, width: 120, height: 120, borderRadius: '50%', backgroundColor: 'rgba(14,165,233,0.08)' }} />
          <div style={{ position: 'absolute', bottom: -30, right: 40, width: 80, height: 80, borderRadius: '50%', backgroundColor: 'rgba(14,165,233,0.05)' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14, position: 'relative' }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: 'rgba(14,165,233,0.2)', border: '1px solid rgba(14,165,233,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ScanLine size={22} color="#0ea5e9" />
            </div>
            <div>
              <h3 style={{ fontFamily: 'Oswald, sans-serif', fontSize: '1.15rem', letterSpacing: '0.08em', margin: 0 }}>SCANNER MODE</h3>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', margin: '2px 0 0', letterSpacing: '0.04em' }}>DS300 BALLOT SCANNER INTEGRATION</p>
            </div>
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
              <WifiOff size={14} color="rgba(255,255,255,0.3)" />
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.06em' }}>DISCONNECTED</span>
            </div>
          </div>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', lineHeight: 1.65, margin: 0, position: 'relative' }}>
            When the DS300 optical scanner is active at your polling station, connect here and vote counts will update <strong style={{ color: '#0ea5e9' }}>automatically in real time</strong> as each ballot is scanned — no manual entry required.
          </p>
        </div>

        {/* How it works strip */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 20 }}>
          {[
            { icon: <Radio size={16} color="#0ea5e9" />, label: 'Scanner Active', desc: 'DS300 feeds ballot data' },
            { icon: <Activity size={16} color="#10b981" />, label: 'Live Updates', desc: 'Results every 3 seconds' },
            { icon: <Send size={16} color="#f59e0b" />, label: 'Auto-Submit', desc: 'Push to results at poll close' },
          ].map(s => (
            <div key={s.label} style={{ padding: '12px 14px', backgroundColor: '#f8fafc', border: '1px solid #e5e7eb', borderRadius: 10, textAlign: 'center' }}>
              <div style={{ marginBottom: 6 }}>{s.icon}</div>
              <p style={{ fontFamily: 'Oswald, sans-serif', fontSize: 11, letterSpacing: '0.06em', color: '#0f1e35', margin: '0 0 3px' }}>{s.label}</p>
              <p style={{ fontSize: 10, color: '#9ca3af', margin: 0, lineHeight: 1.4 }}>{s.desc}</p>
            </div>
          ))}
        </div>

        {/* Connect form */}
        <div style={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, padding: '22px 24px' }}>
          <h4 style={{ fontFamily: 'Oswald, sans-serif', fontSize: '0.95rem', letterSpacing: '0.07em', color: '#0f1e35', margin: '0 0 16px' }}>CONNECT TO SCANNER SESSION</h4>

          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 12, color: '#6b7280', marginBottom: 5 }}>Polling Station ID *</label>
            <input
              value={inputStation}
              onChange={e => setInputStation(e.target.value)}
              placeholder={stationName || 'e.g. PS-0042 or station name'}
              style={{ width: '100%', padding: '9px 12px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box', color: '#111' }}
            />
          </div>

          <div style={{ marginBottom: 18 }}>
            <label style={{ display: 'block', fontSize: 12, color: '#6b7280', marginBottom: 5 }}>Election Type *</label>
            <div style={{ position: 'relative' }}>
              <select
                value={electionType}
                onChange={e => setElectionType(e.target.value)}
                style={{ width: '100%', padding: '9px 34px 9px 12px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 13, outline: 'none', appearance: 'none', backgroundColor: '#fff', color: '#111', boxSizing: 'border-box' }}
              >
                <option value="presidential">Presidential</option>
                <option value="mp">Member of Parliament (MP)</option>
                <option value="mayoral">Mayoral</option>
                <option value="councillor">Councillor</option>
              </select>
              <ChevronDown size={15} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', pointerEvents: 'none' }} />
            </div>
          </div>

          {connErr && (
            <div style={{ padding: '10px 14px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, marginBottom: 14, display: 'flex', gap: 8, alignItems: 'flex-start' }}>
              <XCircle size={15} color="#dc2626" style={{ flexShrink: 0, marginTop: 1 }} />
              <p style={{ fontSize: 12, color: '#dc2626', margin: 0, lineHeight: 1.5 }}>{connErr}</p>
            </div>
          )}

          <button
            onClick={handleConnect}
            disabled={step === 'connecting'}
            style={{ width: '100%', padding: '12px 0', backgroundColor: step === 'connecting' ? '#6b7280' : '#0f1e35', color: '#fff', border: 'none', borderRadius: 10, fontFamily: 'Oswald, sans-serif', letterSpacing: '0.1em', fontSize: 14, cursor: step === 'connecting' ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
          >
            {step === 'connecting'
              ? <><Loader2 size={17} style={{ animation: 'spin 1s linear infinite' }} /> CONNECTING…</>
              : <><Wifi size={17} /> CONNECT TO SCANNER</>}
          </button>

          <p style={{ fontSize: 11, color: '#9ca3af', textAlign: 'center', margin: '10px 0 0', lineHeight: 1.5 }}>
            The DS300 scanner must be active and an admin must have opened a poll session for your station first.
          </p>
        </div>
        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
          @keyframes scanPulse { 0%,100%{box-shadow:0 0 0 0 rgba(16,185,129,0.4)} 70%{box-shadow:0 0 0 8px rgba(16,185,129,0)} }
        `}</style>
      </div>
    );
  }

  // ── Render submitted ─────────────────────────────────────────────────────────
  if (step === 'submitted') {
    const totalVotes = live?.ballotsScanned ?? 0;
    return (
      <div style={{ maxWidth: 580, margin: '0 auto', textAlign: 'center' }}>
        <div style={{ padding: '40px 32px', backgroundColor: '#f0fdf4', border: '2px solid #86efac', borderRadius: 16, marginBottom: 20 }}>
          <CheckCircle2 size={52} color="#10b981" style={{ marginBottom: 16 }} />
          <h3 style={{ fontFamily: 'Oswald, sans-serif', fontSize: '1.3rem', letterSpacing: '0.08em', color: '#0f1e35', margin: '0 0 8px' }}>RESULTS SUBMITTED</h3>
          <p style={{ fontSize: 13, color: '#4b5563', lineHeight: 1.6, margin: '0 0 20px' }}>
            {totalVotes.toLocaleString()} ballots from the DS300 scanner have been automatically submitted to the election results system.
          </p>
          {submitMsg && <p style={{ fontSize: 12, color: '#16a34a', margin: 0 }}>{submitMsg}</p>}
        </div>
        {live && (
          <div style={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, padding: '20px 24px', textAlign: 'left' }}>
            <FinalTally live={live} />
          </div>
        )}
      </div>
    );
  }

  // ── Render live / closed ─────────────────────────────────────────────────────
  const isClosed = step === 'closed';
  const totalValid = live?.validBallots ?? 0;

  return (
    <div style={{ maxWidth: 640 }}>
      {/* Status bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', backgroundColor: isClosed ? '#fffbeb' : '#0f1e35', borderRadius: 12, marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {isClosed
            ? <AlertTriangle size={18} color="#d97706" />
            : <PulsingDot color="#10b981" />}
          <div>
            <p style={{ fontFamily: 'Oswald, sans-serif', fontSize: 13, letterSpacing: '0.08em', color: isClosed ? '#92400e' : '#fff', margin: 0 }}>
              {isClosed ? 'POLL CLOSED — SCANNER STOPPED' : 'SCANNER LIVE'}
            </p>
            {lastUpdated && !isClosed && (
              <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', margin: '2px 0 0' }}>
                Last update: {lastUpdated.toLocaleTimeString()}
              </p>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {!isClosed && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', backgroundColor: 'rgba(14,165,233,0.15)', border: '1px solid rgba(14,165,233,0.3)', borderRadius: 20 }}>
              <Radio size={12} color="#0ea5e9" />
              <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: 10, color: '#0ea5e9', letterSpacing: '0.08em' }}>POLLING 3s</span>
            </div>
          )}
          <button onClick={handleDisconnect} style={{ padding: '5px 12px', backgroundColor: isClosed ? '#fef3c7' : 'rgba(255,255,255,0.1)', border: `1px solid ${isClosed ? '#fde68a' : 'rgba(255,255,255,0.15)'}`, borderRadius: 7, fontSize: 11, color: isClosed ? '#92400e' : 'rgba(255,255,255,0.6)', cursor: 'pointer', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.06em' }}>
            DISCONNECT
          </button>
        </div>
      </div>

      {/* Ballot counter — big hero number */}
      <div style={{ background: `linear-gradient(135deg, ${isClosed ? '#fffbeb' : '#0f1e35'} 0%, ${isClosed ? '#fef3c7' : '#1a3050'} 100%)`, borderRadius: 16, padding: '24px 28px', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 11, letterSpacing: '0.12em', color: isClosed ? '#78450a' : 'rgba(255,255,255,0.45)', fontFamily: 'Oswald, sans-serif', margin: '0 0 4px' }}>BALLOTS SCANNED</p>
          <p style={{ fontFamily: 'Oswald, sans-serif', fontSize: '3.5rem', color: isClosed ? '#78450a' : '#fff', margin: '0 0 2px', lineHeight: 1, transition: 'color 0.2s' }}
            key={live?.ballotsScanned}>
            {(live?.ballotsScanned ?? 0).toLocaleString()}
          </p>
          <p style={{ fontSize: 12, color: isClosed ? '#a16207' : 'rgba(255,255,255,0.4)', margin: 0 }}>
            of {(live?.registeredVoters ?? 0).toLocaleString()} registered · <strong style={{ color: isClosed ? '#92400e' : '#10b981' }}>{live?.turnoutPercentage ?? 0}% turnout</strong>
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {[
            { l: 'VALID', v: live?.validBallots ?? 0, c: '#10b981' },
            { l: 'REJECTED', v: live?.rejectedBallots ?? 0, c: '#ef4444' },
            { l: 'BLANK', v: live?.blankBallots ?? 0, c: '#9ca3af' },
            { l: 'OVERVOTE', v: live?.overvoteBallots ?? 0, c: '#f59e0b' },
          ].map(({ l, v, c }) => (
            <div key={l} style={{ textAlign: 'center', padding: '8px 12px', backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 8, minWidth: 72 }}>
              <p style={{ fontFamily: 'Oswald, sans-serif', fontSize: '1.2rem', color: c, margin: '0 0 2px' }}>{v}</p>
              <p style={{ fontSize: 9, letterSpacing: '0.09em', color: isClosed ? '#a16207' : 'rgba(255,255,255,0.35)', margin: 0, fontFamily: 'Oswald, sans-serif' }}>{l}</p>
            </div>
          ))}
        </div>
        {justScanned && !isClosed && (
          <div style={{ position: 'absolute', right: 20, top: 20, padding: '5px 12px', backgroundColor: '#10b981', borderRadius: 20, display: 'flex', alignItems: 'center', gap: 5 }}>
            <Zap size={12} color="#fff" />
            <span style={{ fontSize: 11, color: '#fff', fontFamily: 'Oswald, sans-serif' }}>BALLOT IN</span>
          </div>
        )}
      </div>

      {/* Candidate vote bars */}
      {live && live.candidates.length > 0 && (
        <div style={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, padding: '20px 22px', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <h4 style={{ fontFamily: 'Oswald, sans-serif', fontSize: '0.9rem', letterSpacing: '0.08em', color: '#0f1e35', margin: 0, display: 'flex', alignItems: 'center', gap: 7 }}>
              <BarChart3 size={15} color="#0f1e35" /> LIVE VOTE BREAKDOWN
            </h4>
            <span style={{ fontSize: 10, color: '#9ca3af' }}>{totalValid.toLocaleString()} valid votes counted</span>
          </div>
          {[...live.candidates]
            .sort((a, b) => (live.voteCounts[b.id] || 0) - (live.voteCounts[a.id] || 0))
            .map((c, i) => (
              <VoteBar
                key={c.id}
                name={c.name}
                party={c.party}
                votes={live.voteCounts[c.id] || 0}
                totalValid={totalValid}
                color={CANDIDATE_COLORS[i % CANDIDATE_COLORS.length]}
              />
            ))}
        </div>
      )}

      {/* Turnout progress bar */}
      <div style={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, padding: '16px 22px', marginBottom: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <span style={{ fontSize: 12, color: '#6b7280', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.06em' }}>VOTER TURNOUT</span>
          <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: '1.1rem', color: '#0f1e35' }}>{live?.turnoutPercentage ?? 0}%</span>
        </div>
        <div style={{ height: 14, backgroundColor: '#f3f4f6', borderRadius: 8, overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            width: `${Math.min(live?.turnoutPercentage ?? 0, 100)}%`,
            background: 'linear-gradient(to right, #0ea5e9, #10b981)',
            borderRadius: 8,
            transition: 'width 0.6s ease',
          }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 5 }}>
          <span style={{ fontSize: 10, color: '#9ca3af' }}>0%</span>
          <span style={{ fontSize: 10, color: '#9ca3af' }}>50%</span>
          <span style={{ fontSize: 10, color: '#9ca3af' }}>100%</span>
        </div>
      </div>

      {/* Session info toggle */}
      <button onClick={() => setShowDetails(v => !v)} style={{ width: '100%', padding: '10px 16px', backgroundColor: '#f8fafc', border: '1px solid #e5e7eb', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', marginBottom: 14, fontSize: 12, color: '#6b7280', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.06em' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 7 }}><Shield size={13} /> SESSION INFO &amp; SECURITY HASH</span>
        {showDetails ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>
      {showDetails && sessionId && (
        <div style={{ backgroundColor: '#0f1e35', borderRadius: 10, padding: '14px 18px', marginBottom: 14, fontSize: 11, fontFamily: 'monospace' }}>
          <p style={{ color: 'rgba(255,255,255,0.4)', margin: '0 0 4px' }}>SESSION ID</p>
          <p style={{ color: '#0ea5e9', margin: '0 0 10px', wordBreak: 'break-all' }}>{sessionId}</p>
          {live?.reportHash && (
            <>
              <p style={{ color: 'rgba(255,255,255,0.4)', margin: '0 0 4px' }}>REPORT HASH (SHA-256)</p>
              <p style={{ color: '#10b981', margin: 0, wordBreak: 'break-all' }}>{live.reportHash}</p>
            </>
          )}
          <p style={{ color: 'rgba(255,255,255,0.25)', margin: '10px 0 0', fontSize: 10 }}>Last polled: {live?.polledAt ? new Date(live.polledAt).toLocaleTimeString() : '—'}</p>
        </div>
      )}

      {/* Auto-submit CTA when poll closes */}
      {isClosed && (
        <div style={{ padding: '20px 22px', backgroundColor: '#fffbeb', border: '2px solid #fde68a', borderRadius: 14 }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 16 }}>
            <AlertTriangle size={20} color="#d97706" style={{ flexShrink: 0, marginTop: 2 }} />
            <div>
              <p style={{ fontFamily: 'Oswald, sans-serif', fontSize: '0.95rem', letterSpacing: '0.06em', color: '#92400e', margin: '0 0 5px' }}>POLL CLOSED — SUBMIT RESULTS</p>
              <p style={{ fontSize: 12, color: '#a16207', margin: 0, lineHeight: 1.6 }}>
                The scanner has finished counting. Click below to automatically push all {(live?.ballotsScanned ?? 0).toLocaleString()} scanned ballots from the DS300 into the official election results system.
              </p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, padding: '12px 14px', backgroundColor: 'rgba(255,255,255,0.6)', borderRadius: 10, marginBottom: 16 }}>
            {[
              { l: 'Ballots Scanned', v: (live?.ballotsScanned ?? 0).toLocaleString() },
              { l: 'Valid Votes', v: (live?.validBallots ?? 0).toLocaleString() },
              { l: 'Rejected', v: (live?.rejectedBallots ?? 0).toLocaleString() },
              { l: 'Turnout', v: `${live?.turnoutPercentage ?? 0}%` },
            ].map(({ l, v }) => (
              <div key={l}>
                <p style={{ fontSize: 10, color: '#a16207', margin: '0 0 2px', letterSpacing: '0.05em' }}>{l}</p>
                <p style={{ fontFamily: 'Oswald, sans-serif', fontSize: '1.1rem', color: '#78350f', margin: 0 }}>{v}</p>
              </div>
            ))}
          </div>

          {submitMsg && (
            <div style={{ padding: '8px 12px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, marginBottom: 12, fontSize: 12, color: '#dc2626' }}>
              {submitMsg}
            </div>
          )}

          <button onClick={handleAutoSubmit} disabled={submitting} style={{ width: '100%', padding: '13px 0', backgroundColor: submitting ? '#9ca3af' : '#0f1e35', color: '#fff', border: 'none', borderRadius: 10, fontFamily: 'Oswald, sans-serif', letterSpacing: '0.1em', fontSize: 14, cursor: submitting ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9 }}>
            {submitting
              ? <><Loader2 size={17} style={{ animation: 'spin 1s linear infinite' }} /> SUBMITTING…</>
              : <><Send size={17} /> AUTO-SUBMIT SCANNER RESULTS</>}
          </button>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes scanPulse {
          0%,100% { box-shadow: 0 0 0 0 rgba(16,185,129,0.5); }
          70% { box-shadow: 0 0 0 10px rgba(16,185,129,0); }
        }
      `}</style>
    </div>
  );
}

// ─── Final tally (for submitted state) ───────────────────────────────────────

function FinalTally({ live }: { live: LiveSession }) {
  const totalValid = live.validBallots;
  const sorted = [...live.candidates].sort((a, b) => (live.voteCounts[b.id] || 0) - (live.voteCounts[a.id] || 0));
  return (
    <div>
      <h4 style={{ fontFamily: 'Oswald, sans-serif', fontSize: '0.9rem', letterSpacing: '0.08em', color: '#0f1e35', margin: '0 0 14px' }}>FINAL TALLY</h4>
      {sorted.map((c, i) => (
        <VoteBar key={c.id} name={c.name} party={c.party} votes={live.voteCounts[c.id] || 0} totalValid={totalValid} color={CANDIDATE_COLORS[i % CANDIDATE_COLORS.length]} />
      ))}
      <div style={{ display: 'flex', gap: 20, padding: '12px 0', borderTop: '1px solid #e5e7eb', marginTop: 10 }}>
        {[
          { l: 'Total Scanned', v: live.ballotsScanned },
          { l: 'Turnout', v: `${live.turnoutPercentage}%` },
          { l: 'Rejected', v: live.rejectedBallots },
        ].map(({ l, v }) => (
          <div key={l}>
            <p style={{ fontSize: 10, color: '#9ca3af', margin: '0 0 2px' }}>{l}</p>
            <p style={{ fontFamily: 'Oswald, sans-serif', fontSize: '1.1rem', color: '#0f1e35', margin: 0 }}>{v}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
