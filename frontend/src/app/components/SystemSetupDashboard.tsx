import { API_BASE } from '@/app/lib/apiBase';
import { useState, useEffect, useCallback } from 'react';
import {
  CheckCircle2, XCircle, AlertCircle, Loader2, RefreshCw,
  Database, Shield, Users, Vote, Upload, Key, Globe, Server,
  ChevronDown, ChevronUp, Copy, ExternalLink,
} from 'lucide-react';
import { getToken } from '../lib/api';

const BASE = API_BASE;

async function apiFetch<T>(method: string, path: string, body?: unknown): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${BASE}${path}`, {
    method, headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data as T;
}

// ── Types ──────────────────────────────────────────────────────────────────────

type StepStatus = 'ok' | 'warning' | 'error' | 'loading' | 'idle';

interface SetupStep {
  id: string;
  label: string;
  icon: React.ReactNode;
  description: string;
  status: StepStatus;
  detail?: string;
  actionLabel?: string;
  onAction?: () => Promise<void>;
  manual?: boolean; // true = no automated action, just instructions
}

function StatusIcon({ status }: { status: StepStatus }) {
  if (status === 'loading') return <Loader2 className="w-5 h-5 animate-spin text-blue-500" />;
  if (status === 'ok')      return <CheckCircle2 className="w-5 h-5 text-green-600" />;
  if (status === 'warning') return <AlertCircle  className="w-5 h-5 text-amber-500" />;
  if (status === 'error')   return <XCircle      className="w-5 h-5 text-red-500" />;
  return <div className="w-5 h-5 rounded-full border-2 border-muted-foreground/30" />;
}

function CodeBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="relative group mt-2">
      <pre className="bg-gray-900 text-green-300 text-xs rounded-lg px-4 py-3 overflow-x-auto font-mono leading-relaxed">
        {code}
      </pre>
      <button
        onClick={() => { navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
        className="absolute top-2 right-2 p-1.5 rounded bg-gray-700 hover:bg-gray-600 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity"
        title="Copy"
      >
        {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
      </button>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

export function SystemSetupDashboard() {
  const [healthData, setHealthData] = useState<Record<string, string> | null>(null);
  const [candCount, setCandCount] = useState<number | null>(null);
  const [voterRollInfo, setVoterRollInfo] = useState<{ totalRecords: number; uploadedAt: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [actionResults, setActionResults] = useState<Record<string, string>>({});

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [health, candStats, vrMeta] = await Promise.allSettled([
        apiFetch<{ bootstrap: Record<string, string>; setup_complete: boolean }>('GET', '/health'),
        apiFetch<{ stats: { total: number } }>('GET', '/candidates/stats'),
        apiFetch<{ meta: { totalRecords: number; uploadedAt: string } | null }>('GET', '/voter-roll'),
      ]);

      if (health.status === 'fulfilled') setHealthData(health.value.bootstrap);
      if (candStats.status === 'fulfilled') setCandCount(candStats.value.stats.total);
      if (vrMeta.status === 'fulfilled') setVoterRollInfo(vrMeta.value.meta);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const seedCandidates = async () => {
    setSeeding(true);
    try {
      // Seed from the mock presidential candidates defined in the backend
      const res = await apiFetch<{ created: number; skipped: number }>('POST', '/candidates/seed', { candidates: [] });
      setActionResults(prev => ({ ...prev, candidates: `✓ ${res.created} candidates seeded, ${res.skipped} already existed` }));
      await refresh();
    } catch (e) {
      setActionResults(prev => ({ ...prev, candidates: `Error: ${e instanceof Error ? e.message : String(e)}` }));
    } finally {
      setSeeding(false);
    }
  };

  const steps: SetupStep[] = [
    {
      id: 'database',
      label: 'Database Table',
      icon: <Database className="w-5 h-5" />,
      description: 'PostgreSQL KV store table must exist before the backend can save anything.',
      status: healthData ? 'ok' : loading ? 'loading' : 'error',
      detail: healthData ? 'Connected — backend can read and write data.' : 'Cannot reach backend. Run the migration SQL.',
      manual: true,
    },
    {
      id: 'admin',
      label: 'Admin Account Bootstrap',
      icon: <Shield className="w-5 h-5" />,
      description: 'The initial admin account is created automatically on first health check.',
      status: healthData?.admin === 'ready' ? 'ok' : healthData ? 'warning' : loading ? 'loading' : 'error',
      detail: healthData?.admin === 'ready'
        ? 'Admin account exists. Remember to change the default password!'
        : 'Bootstrap pending — hit the health endpoint once.',
    },
    {
      id: 'candidates',
      label: 'Presidential Candidates',
      icon: <Vote className="w-5 h-5" />,
      description: 'Candidate records must be seeded so results can be aggregated.',
      status: (candCount ?? 0) > 0 ? 'ok' : loading ? 'loading' : 'warning',
      detail: (candCount ?? 0) > 0
        ? `${candCount} candidates in database.`
        : 'No candidates seeded. Click the button below to seed from the registered candidate list.',
      actionLabel: (candCount ?? 0) === 0 ? 'Seed Candidates' : 'Re-seed',
      onAction: seedCandidates,
    },
    {
      id: 'voter-roll',
      label: 'ECZ Voter Roll',
      icon: <Users className="w-5 h-5" />,
      description: 'Upload the official ECZ voter roll CSV so agents can verify voters at polling stations.',
      status: voterRollInfo ? 'ok' : loading ? 'loading' : 'warning',
      detail: voterRollInfo
        ? `${voterRollInfo.totalRecords.toLocaleString()} voter records loaded (uploaded ${voterRollInfo.uploadedAt.slice(0, 10)}).`
        : 'No voter roll uploaded. Use the Voter Roll Upload section in this admin panel.',
    },
    {
      id: 'email',
      label: 'Email Service (Resend)',
      icon: <Globe className="w-5 h-5" />,
      description: 'Required for member credentials, OTP, and order confirmations.',
      status: 'idle',
      manual: true,
      detail: 'Set RESEND_API_KEY and EMAIL_FROM_ADDRESS in Supabase Secrets, then verify the sending domain.',
    },
    {
      id: 'sms',
      label: 'SMS / OTP (Twilio)',
      icon: <Key className="w-5 h-5" />,
      description: 'Primary: Twilio. Fallback: Africa\'s Talking (automatic). Set Twilio secrets to enable SMS OTP.',
      status: 'idle',
      manual: true,
      detail: 'Set AFRICAS_TALKING_API_KEY and change AFRICAS_TALKING_USERNAME from "sandbox" to your production username.',
    },
    {
      id: 'payments',
      label: 'Payments (Flutterwave)',
      icon: <Server className="w-5 h-5" />,
      description: 'Required for the BOZ shop and donation pages.',
      status: 'idle',
      manual: true,
      detail: 'Set FLUTTERWAVE_SECRET_KEY, FLUTTERWAVE_PUBLIC_KEY, and FLUTTERWAVE_WEBHOOK_HASH in Supabase Secrets.',
    },
  ];

  const completedCount = steps.filter(s => s.status === 'ok').length;
  const progress = Math.round((completedCount / steps.length) * 100);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Server className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold text-foreground">System Setup</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Complete these steps to make the system fully operational before election day.
          </p>
        </div>
        <button onClick={refresh} disabled={loading} className="p-2 rounded-lg border border-border hover:bg-muted transition-colors">
          <RefreshCw className={`w-4 h-4 text-muted-foreground ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Progress bar */}
      <div className="bg-card border border-border rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-foreground">{completedCount} of {steps.length} steps complete</p>
          <p className="text-sm font-bold text-primary">{progress}%</p>
        </div>
        <div className="h-3 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${progress}%`, background: progress === 100 ? '#16a34a' : '#F47920' }}
          />
        </div>
        {progress === 100 && (
          <p className="text-sm text-green-700 font-semibold mt-2 flex items-center gap-1">
            <CheckCircle2 className="w-4 h-4" /> System fully operational — ready for election day
          </p>
        )}
      </div>

      {/* Step cards */}
      <div className="space-y-3">
        {steps.map(step => {
          const isExpanded = expanded[step.id];
          return (
            <div
              key={step.id}
              className={`rounded-xl border overflow-hidden transition-colors ${
                step.status === 'ok' ? 'border-green-300 bg-green-50/30' :
                step.status === 'warning' ? 'border-amber-300 bg-amber-50/30' :
                step.status === 'error' ? 'border-red-300 bg-red-50/30' :
                'border-border bg-card'
              }`}
            >
              {/* Row */}
              <div
                className="flex items-center gap-4 px-4 py-3.5 cursor-pointer hover:bg-muted/10"
                onClick={() => setExpanded(p => ({ ...p, [step.id]: !p[step.id] }))}
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                  step.status === 'ok' ? 'bg-green-100' :
                  step.status === 'warning' ? 'bg-amber-100' :
                  'bg-muted'
                }`}>
                  {step.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">{step.label}</p>
                  <p className="text-xs text-muted-foreground truncate">{step.description}</p>
                </div>
                <StatusIcon status={step.status} />
                {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />}
              </div>

              {/* Expanded detail */}
              {isExpanded && (
                <div className="border-t border-border px-4 py-4 space-y-3">
                  <p className="text-sm text-foreground">{step.detail}</p>

                  {actionResults[step.id] && (
                    <p className="text-sm text-green-700 bg-green-50 border border-green-200 px-3 py-2 rounded-lg">
                      {actionResults[step.id]}
                    </p>
                  )}

                  {step.onAction && (
                    <button
                      onClick={async () => {
                        await step.onAction!();
                      }}
                      disabled={seeding}
                      className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
                    >
                      {seeding ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                      {step.actionLabel}
                    </button>
                  )}

                  {/* Step-specific instructions */}
                  {step.id === 'database' && (
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground mb-1">Run in Supabase SQL Editor:</p>
                      <CodeBlock code={`-- Paste contents of supabase/migrations/001_initial_setup.sql
-- Found in your project root. Run it once in:
-- dashboard.supabase.com → Project → SQL Editor`} />
                    </div>
                  )}

                  {step.id === 'admin' && (
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground mb-1">Change default password immediately:</p>
                      <CodeBlock code={`POST ${BASE}/security/change-password
Authorization: Bearer <your-token>
{
  "currentPassword": "Wakuca55",
  "newPassword": "<strong-new-password>"
}`} />
                    </div>
                  )}

                  {step.id === 'email' && (
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground mb-1">Set via Supabase CLI:</p>
                      <CodeBlock code={`supabase secrets set \\
  RESEND_API_KEY=re_xxxxxxxxxxxx \\
  EMAIL_FROM_ADDRESS=no-reply@bozplans.org \\
  EMAIL_FROM_NAME="Build One Zambia" \\
  ADMIN_EMAIL=admin@bozplans.org \\
  SITE_URL=https://bozplans.org`} />
                    </div>
                  )}

                  {step.id === 'sms' && (
                    <div className="space-y-3">
                      <p className="text-xs font-semibold text-muted-foreground">Primary — Twilio:</p>
                      <CodeBlock code={`supabase secrets set \\
  TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx \\
  TWILIO_AUTH_TOKEN=your_auth_token \\
  TWILIO_FROM_NUMBER=+12015551234`} />
                      <p className="text-xs font-semibold text-muted-foreground">Optional fallback — Africa's Talking (if Twilio fails):</p>
                      <CodeBlock code={`supabase secrets set \\
  AFRICAS_TALKING_API_KEY=your_production_key \\
  AFRICAS_TALKING_USERNAME=your_production_username \\
  AFRICAS_TALKING_SHORTCODE=BOZPLANS`} />
                      <p className="text-xs text-muted-foreground">Twilio sends first. If it fails, Africa's Talking activates automatically. Only Twilio is required.</p>
                      <a
                        href="https://africastalking.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-2"
                      >
                        Register at Africa's Talking <ExternalLink className="w-3 h-3" />
                      </a>
                      <a
                        href="https://console.twilio.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-1"
                      >
                        Register at Twilio <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}

                  {step.id === 'payments' && (
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground mb-1">Set via Supabase CLI:</p>
                      <CodeBlock code={`supabase secrets set \\
  FLUTTERWAVE_SECRET_KEY=FLWSECK-xxxxxxxxxxxx \\
  FLUTTERWAVE_PUBLIC_KEY=FLWPUBK-xxxxxxxxxxxx \\
  FLUTTERWAVE_WEBHOOK_HASH=a_long_random_secret_string`} />
                      <p className="text-xs text-muted-foreground mt-2">
                        Webhook URL to register in Flutterwave dashboard:{' '}
                        <code className="bg-muted px-1 rounded text-xs">{BASE}/gateway/webhook</code>
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Deployment info */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
          <Server className="w-4 h-4 text-primary" /> Backend Status
        </h3>
        <p className="text-sm text-muted-foreground mb-2">The backend is deployed on Railway and runs automatically. No manual deployment needed.</p>
        <CodeBlock code={`# Check backend health
curl ${BASE}/health

# Backend URL
${BASE.replace('/make-server-8fca9621', '')}`} />
      </div>
    </div>
  );
}
