import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api/apiClient';
import { VerificationRecord } from '../services/verification/verificationService';
import { eventBus } from '../services/realtime/eventBus';

export function useVerifications() {
  const [verifications, setVerifications] = useState<VerificationRecord[]>([]);
  const [pending, setPending] = useState<VerificationRecord[]>([]);
  const [stats, setStats] = useState<Awaited<ReturnType<typeof api.verifications.getStats>>['data']>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const [all, pend, s] = await Promise.all([
      api.verifications.getAll(),
      api.verifications.getPending(),
      api.verifications.getStats(),
    ]);
    setVerifications(all.data ?? []);
    setPending(pend.data ?? []);
    setStats(s.data ?? null);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { return eventBus.on('verification_signed', () => load()); }, [load]);

  const sign = useCallback(async (id: string, signature: string, docs: string[], notes: string) => {
    const res = await api.verifications.sign(id, signature, docs, notes);
    if (!res.error) await load();
    return res;
  }, [load]);

  return { verifications, pending, stats, loading, refresh: load, sign };
}
