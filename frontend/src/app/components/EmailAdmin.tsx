import { API_BASE } from '@/app/lib/apiBase';
import { useState, useEffect } from 'react';
import { Mail, CheckCircle2, XCircle, Send, Loader2, RefreshCw, Key, AtSign, User, Globe, AlertTriangle } from 'lucide-react';

// Safe fetch wrapper — handles non-JSON responses (e.g. rate limit plain text)
async function safeFetch(url: string, options?: RequestInit) {
  const res = await fetch(url, options);
  const ct = res.headers.get('content-type') || '';
  if (!ct.includes('application/json')) {
    const text = await res.text();
    if (res.status === 429) throw new Error('Rate limit exceeded — please wait a moment and try again.');
    if (!res.ok) throw new Error(text || `HTTP ${res.status}`);
    return { ok: res.ok, status: res.status, json: async () => ({}) };
  }
  return res;
}

const BASE = (() => {
  const id = (window as unknown as Record<string, string>).__SUPABASE_PROJECT_ID__ || 'jpysoquanfnphgvwdzbf';
  return API_BASE;
})();

function getToken() { return sessionStorage.getItem('boz_session_token') || ''; }

async function apiGet(path: string) {
  const res = await safeFetch(`${BASE}${path}`, { headers: { Authorization: `Bearer ${getToken()}` } });
  return res.json();
}

async function apiPost(path: string, body: unknown) {
  const res = await safeFetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
    body: JSON.stringify(body),
  });
  return res.json();
}

interface EmailConfig {
  connected: boolean;
  keyPreview: string | null;
  fromName: string;
  fromEmail: string;
  adminEmail: string;
  siteUrl: string;
}

export function EmailAdmin() {
  const [config, setConfig] = useState<EmailConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [testEmail, setTestEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const fetchConfig = async () => {
    setLoading(true);
    try {
      const data = await apiGet('/email/config');
      setConfig(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchConfig(); }, []);

  const sendTest = async () => {
    if (!testEmail.trim()) return;
    setSending(true);
    setTestResult(null);
    try {
      const data = await apiPost('/email/test', { to: testEmail.trim() });
      setTestResult({
        success: data.success,
        message: data.success ? `Test email sent successfully (ID: ${data.id})` : `Failed: ${data.error || 'Unknown error'}`,
      });
    } catch {
      setTestResult({ success: false, message: 'Network error — could not reach server' });
    } finally {
      setSending(false);
    }
  };

  const emails = [
    { trigger: 'New order placed', recipient: 'Customer + Admin', active: true },
    { trigger: 'Payment confirmed', recipient: 'Customer', active: true },
    { trigger: 'Order status updated', recipient: 'Customer', active: true },
    { trigger: 'Donation received', recipient: 'Donor + Admin', active: true },
    { trigger: 'Contact form submitted', recipient: 'Submitter + Admin', active: true },
    { trigger: 'Membership application', recipient: 'Admin', active: true },
    { trigger: 'OTP verification', recipient: 'Member (phone/email)', active: true },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Email Management</h2>
          <p className="text-sm text-muted-foreground mt-1">Powered by Resend — transactional emails for orders, donations, and notifications</p>
        </div>
        <button onClick={fetchConfig} className="p-2 hover:bg-muted rounded-lg transition-colors" title="Refresh">
          <RefreshCw className={`w-4 h-4 text-muted-foreground ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Connection status */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : config ? (
        <>
          {/* Status card */}
          <div className={`rounded-xl p-6 border ${config.connected ? 'bg-[#198754]/5 border-[#198754]/30' : 'bg-destructive/5 border-destructive/30'}`}>
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${config.connected ? 'bg-[#198754]/15' : 'bg-destructive/15'}`}>
                {config.connected
                  ? <CheckCircle2 className="w-6 h-6 text-[#198754]" />
                  : <XCircle className="w-6 h-6 text-destructive" />}
              </div>
              <div className="flex-1">
                <h3 className={`font-bold text-lg ${config.connected ? 'text-[#198754]' : 'text-destructive'}`}>
                  {config.connected ? 'Resend Connected ✓' : 'Resend Not Connected'}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {config.connected
                    ? 'Your Resend API key is configured and emails are active.'
                    : 'Set RESEND_API_KEY in your Railway backend service Variables to enable emails.'}
                </p>
                {config.keyPreview && (
                  <div className="mt-3 flex items-center gap-2 bg-background/60 rounded-lg px-3 py-2 w-fit">
                    <Key className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-xs font-mono text-foreground">{config.keyPreview}</span>
                    <span className="text-xs text-muted-foreground">API Key</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {!config.connected && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
              <div className="flex gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-amber-800 mb-1">How to connect Resend</p>
                  <ol className="text-sm text-amber-700 space-y-1 list-decimal list-inside">
                    <li>Go to <strong>Railway Dashboard → Backend service → Variables</strong></li>
                    <li>Add variable: <code className="bg-amber-100 px-1 rounded">RESEND_API_KEY</code> = your Resend API key</li>
                    <li>Optionally add <code className="bg-amber-100 px-1 rounded">EMAIL_FROM_ADDRESS</code> (your verified sender)</li>
                    <li>Redeploy the edge function</li>
                  </ol>
                </div>
              </div>
            </div>
          )}

          {/* Config details */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="font-semibold text-foreground mb-4">Email Configuration</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { icon: User, label: 'Sender Name', value: config.fromName },
                { icon: AtSign, label: 'Sender Address', value: config.fromEmail },
                { icon: Mail, label: 'Admin Email', value: config.adminEmail },
                { icon: Globe, label: 'Site URL', value: config.siteUrl },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-start gap-3 bg-muted/40 rounded-lg p-3">
                  <Icon className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p className="text-sm font-medium text-foreground truncate">{value}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              To change these values, set <code className="bg-muted px-1 rounded">EMAIL_FROM_NAME</code>, <code className="bg-muted px-1 rounded">EMAIL_FROM_ADDRESS</code>, <code className="bg-muted px-1 rounded">ADMIN_EMAIL</code>, or <code className="bg-muted px-1 rounded">SITE_URL</code> in your Railway Backend service Variables.
            </p>
          </div>

          {/* Test email */}
          {config.connected && (
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="font-semibold text-foreground mb-1">Send Test Email</h3>
              <p className="text-sm text-muted-foreground mb-4">Verify your Resend connection is working by sending a test email.</p>
              <div className="flex gap-3">
                <input
                  type="email"
                  placeholder="recipient@example.com"
                  value={testEmail}
                  onChange={e => setTestEmail(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendTest()}
                  className="flex-1 px-3 py-2 bg-input-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <button
                  onClick={sendTest}
                  disabled={sending || !testEmail.trim()}
                  className="flex items-center gap-2 px-4 py-2 bg-[#198754] text-white rounded-lg text-sm font-semibold hover:bg-[#146644] disabled:opacity-50 transition-colors"
                >
                  {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  {sending ? 'Sending…' : 'Send Test'}
                </button>
              </div>
              {testResult && (
                <div className={`mt-3 flex items-start gap-2 p-3 rounded-lg text-sm ${testResult.success ? 'bg-[#198754]/10 border border-[#198754]/30' : 'bg-destructive/10 border border-destructive/30'}`}>
                  {testResult.success
                    ? <CheckCircle2 className="w-4 h-4 text-[#198754] mt-0.5 shrink-0" />
                    : <XCircle className="w-4 h-4 text-destructive mt-0.5 shrink-0" />}
                  <span className={testResult.success ? 'text-[#198754]' : 'text-destructive'}>{testResult.message}</span>
                </div>
              )}
            </div>
          )}

          {/* Triggered emails */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="font-semibold text-foreground mb-4">Automated Email Triggers</h3>
            <div className="space-y-2">
              {emails.map(e => (
                <div key={e.trigger} className="flex items-center justify-between py-2.5 border-b border-border last:border-0">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${config.connected && e.active ? 'bg-[#198754]' : 'bg-muted-foreground'}`} />
                    <div>
                      <p className="text-sm font-medium text-foreground">{e.trigger}</p>
                      <p className="text-xs text-muted-foreground">Sent to: {e.recipient}</p>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${config.connected && e.active ? 'bg-[#198754]/15 text-[#198754]' : 'bg-muted text-muted-foreground'}`}>
                    {config.connected && e.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-12 text-muted-foreground">Failed to load email configuration</div>
      )}
    </div>
  );
}


export { EmailAdmin as default };
