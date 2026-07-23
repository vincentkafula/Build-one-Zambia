import { useState, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import { API_BASE } from '../lib/apiBase';

interface HealthResponse {
  persistence?: {
    databaseUrlConfigured: boolean;
    connected: boolean;
    mode: 'postgresql' | 'ephemeral-file';
  };
}

/**
 * Everything posted through the admin panels (news, shop products, uploaded
 * documents, shadow cabinet, leadership, live-stream links, etc.) is only
 * durable if the backend is connected to PostgreSQL. Without it, content is
 * written to Railway's ephemeral filesystem and silently disappears the next
 * time the backend redeploys or restarts — which looks exactly like "nothing
 * I post ever shows up." This banner makes that state impossible to miss.
 */
export function PersistenceStatusBanner() {
  const [status, setStatus] = useState<HealthResponse['persistence'] | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE}/health`)
      .then(res => res.json())
      .then((data: HealthResponse) => setStatus(data.persistence ?? null))
      .catch(() => setStatus(null));
  }, []);

  if (!status || status.mode === 'postgresql' || dismissed) return null;

  return (
    <div className="mb-6 rounded-xl border-2 border-red-400 bg-red-50 p-4 flex items-start gap-3">
      <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
      <div className="flex-1 text-sm">
        <p className="font-bold text-red-900">
          Content you post here is not being saved permanently
        </p>
        <p className="text-red-800 mt-1">
          The backend has no PostgreSQL database connected, so news posts, shop products, uploaded documents,
          shadow cabinet entries, leadership additions, and YouTube/live-stream links are only stored temporarily —
          they will be lost the next time the backend redeploys or restarts. Add a PostgreSQL database in Railway
          and set <code className="px-1 py-0.5 rounded bg-red-100 font-mono text-xs">DATABASE_URL</code> on the
          backend service to fix this permanently.
        </p>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="text-xs text-red-700 underline shrink-0"
      >
        Dismiss for now
      </button>
    </div>
  );
}

export default PersistenceStatusBanner;
