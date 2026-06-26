import { db } from '../db/indexedDbService';
import { eventBus } from '../realtime/eventBus';
import { auditService } from '../audit/auditService';

export type SyncStatus = 'pending' | 'in_progress' | 'completed' | 'failed';
export type SyncOperation = 'CREATE' | 'UPDATE' | 'DELETE';

export interface SyncQueueItem {
  id: string;
  operation: SyncOperation;
  entity: string;
  entityId: string;
  payload: unknown;
  status: SyncStatus;
  priority: number; // 1 = highest, 10 = lowest
  retryCount: number;
  maxRetries: number;
  error?: string;
  createdAt: string;
  processedAt?: string;
}

export interface SyncStats {
  pending: number;
  completed: number;
  failed: number;
  lastSyncAt?: string;
}

function generateId(): string {
  return `sync-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

class SyncService {
  private isProcessing = false;
  private syncInterval: ReturnType<typeof setInterval> | null = null;

  // Enqueue an operation for sync when connectivity is restored
  async enqueue(
    operation: SyncOperation,
    entity: string,
    entityId: string,
    payload: unknown,
    priority = 5
  ): Promise<SyncQueueItem> {
    const item: SyncQueueItem = {
      id: generateId(),
      operation,
      entity,
      entityId,
      payload,
      status: 'pending',
      priority,
      retryCount: 0,
      maxRetries: 3,
      createdAt: new Date().toISOString(),
    };
    await db.put('sync_queue', item);
    return item;
  }

  async getQueue(): Promise<SyncQueueItem[]> {
    const all = await db.getAll<SyncQueueItem>('sync_queue');
    return all.sort((a, b) => a.priority - b.priority || new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  async getPending(): Promise<SyncQueueItem[]> {
    return db.getByIndex<SyncQueueItem>('sync_queue', 'by_status', 'pending');
  }

  async getStats(): Promise<SyncStats> {
    const all = await db.getAll<SyncQueueItem>('sync_queue');
    const completed = all.filter((i) => i.status === 'completed');
    const lastSyncAt = completed
      .map((i) => i.processedAt)
      .filter(Boolean)
      .sort()
      .reverse()[0];

    return {
      pending: all.filter((i) => i.status === 'pending' || i.status === 'in_progress').length,
      completed: completed.length,
      failed: all.filter((i) => i.status === 'failed').length,
      lastSyncAt,
    };
  }

  // Simulate processing the sync queue (would call a real API in production)
  async process(userId: string): Promise<{ processed: number; failed: number }> {
    if (this.isProcessing) return { processed: 0, failed: 0 };
    this.isProcessing = true;

    const pending = await this.getPending();
    let processed = 0;
    let failed = 0;

    for (const item of pending) {
      try {
        // Mark as in progress
        await db.put('sync_queue', { ...item, status: 'in_progress' });

        // Simulate network delay (200-800ms)
        await new Promise((resolve) => setTimeout(resolve, 200 + Math.random() * 600));

        // In production, this would POST to a real API endpoint
        // Simulate 95% success rate
        if (Math.random() < 0.95) {
          await db.put('sync_queue', {
            ...item,
            status: 'completed',
            processedAt: new Date().toISOString(),
          });
          processed++;
        } else {
          throw new Error('Simulated network error');
        }
      } catch (err) {
        const newRetryCount = item.retryCount + 1;
        const finalStatus: SyncStatus = newRetryCount >= item.maxRetries ? 'failed' : 'pending';
        await db.put('sync_queue', {
          ...item,
          status: finalStatus,
          retryCount: newRetryCount,
          error: err instanceof Error ? err.message : 'Unknown error',
        });
        failed++;
      }
    }

    this.isProcessing = false;
    await auditService.log('SYNC_PUSHED', 'sync', 'queue', { processed, failed }, userId);

    if (processed > 0 || failed > 0) {
      eventBus.emit(failed === 0 ? 'sync_complete' : 'sync_failed', { processed, failed });
    }

    return { processed, failed };
  }

  startAutoSync(userId: string, intervalMs = 30000): void {
    if (this.syncInterval) return;
    this.syncInterval = setInterval(() => this.process(userId), intervalMs);
  }

  stopAutoSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  async clearCompleted(): Promise<void> {
    const all = await db.getAll<SyncQueueItem>('sync_queue');
    for (const item of all.filter((i) => i.status === 'completed')) {
      await db.delete('sync_queue', item.id);
    }
  }
}

export const syncService = new SyncService();
