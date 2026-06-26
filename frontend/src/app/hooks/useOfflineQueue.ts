/**
 * Offline submission queue for polling agents.
 * Persists unsent results to localStorage and retries automatically when connectivity returns.
 */
import { useState, useEffect, useCallback, useRef } from 'react';

const QUEUE_KEY = 'boz_offline_queue';
const MAX_RETRIES = 5;

export interface QueuedSubmission {
  id: string;
  payload: Record<string, unknown>;
  endpoint: string;
  token: string | null;
  queuedAt: string;
  retries: number;
  lastError?: string;
}

function readQueue(): QueuedSubmission[] {
  try {
    return JSON.parse(localStorage.getItem(QUEUE_KEY) ?? '[]');
  } catch {
    return [];
  }
}

function writeQueue(q: QueuedSubmission[]) {
  localStorage.setItem(QUEUE_KEY, JSON.stringify(q));
}

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function useOfflineQueue(baseUrl: string) {
  const [queue, setQueue] = useState<QueuedSubmission[]>(readQueue);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncing, setSyncing] = useState(false);
  const syncRef = useRef(false);

  // Keep online status current
  useEffect(() => {
    const on  = () => setIsOnline(true);
    const off = () => setIsOnline(false);
    window.addEventListener('online',  on);
    window.addEventListener('offline', off);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  }, []);

  const refreshQueue = useCallback(() => {
    setQueue(readQueue());
  }, []);

  /** Add a submission to the offline queue */
  const enqueue = useCallback((
    endpoint: string,
    payload: Record<string, unknown>,
    token: string | null,
  ): string => {
    const item: QueuedSubmission = {
      id: uid(),
      endpoint,
      payload,
      token,
      queuedAt: new Date().toISOString(),
      retries: 0,
    };
    const q = readQueue();
    q.push(item);
    writeQueue(q);
    setQueue([...q]);
    return item.id;
  }, []);

  /** Attempt to send one queued item — returns true on success */
  const trySend = useCallback(async (item: QueuedSubmission): Promise<boolean> => {
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (item.token) headers['Authorization'] = `Bearer ${item.token}`;
      const res = await fetch(`${baseUrl}${item.endpoint}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(item.payload),
      });
      return res.ok || res.status === 409; // 409 = already submitted, treat as success
    } catch {
      return false;
    }
  }, [baseUrl]);

  /** Process entire queue — send each item in order */
  const syncQueue = useCallback(async () => {
    if (syncRef.current || !isOnline) return;
    syncRef.current = true;
    setSyncing(true);

    let q = readQueue();
    const next: QueuedSubmission[] = [];

    for (const item of q) {
      const ok = await trySend(item);
      if (ok) {
        // Successfully sent — drop from queue
        continue;
      }
      const updated = { ...item, retries: item.retries + 1, lastError: 'Network failure' };
      if (updated.retries >= MAX_RETRIES) {
        // Give up on this item after MAX_RETRIES
        updated.lastError = `Dropped after ${MAX_RETRIES} failed attempts`;
        console.warn('[OfflineQueue] Dropped submission:', updated.id);
        continue;
      }
      next.push(updated);
    }

    writeQueue(next);
    setQueue(next);
    syncRef.current = false;
    setSyncing(false);
  }, [isOnline, trySend]);

  // Auto-sync when we come back online
  useEffect(() => {
    if (isOnline && queue.length > 0) {
      syncQueue();
    }
  }, [isOnline, queue.length, syncQueue]);

  // Periodic retry every 30 seconds while online
  useEffect(() => {
    if (!isOnline) return;
    const interval = setInterval(() => {
      if (readQueue().length > 0) syncQueue();
    }, 30_000);
    return () => clearInterval(interval);
  }, [isOnline, syncQueue]);

  const removeItem = useCallback((id: string) => {
    const q = readQueue().filter(i => i.id !== id);
    writeQueue(q);
    setQueue(q);
  }, []);

  return {
    queue,
    enqueue,
    syncQueue,
    syncing,
    isOnline,
    pendingCount: queue.length,
    removeItem,
  };
}
