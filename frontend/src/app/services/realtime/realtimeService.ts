import { eventBus, EventType } from './eventBus';
import { db } from '../db/indexedDbService';

export interface Notification {
  id: string;
  userId: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  read: boolean;
  actionUrl?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

function generateId(): string {
  return `notif-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

class RealtimeService {
  private pollingInterval: ReturnType<typeof setInterval> | null = null;
  private simulationInterval: ReturnType<typeof setInterval> | null = null;
  private unsubscribers: (() => void)[] = [];

  // Register cross-service listeners to auto-generate notifications
  init(currentUserId: string): void {
    this.unsubscribers.push(
      eventBus.on('results_updated', async (payload: unknown) => {
        const p = payload as { result: { pollingStationName: string; electionType: string } };
        await this.addNotification({
          userId: currentUserId,
          type: 'success',
          title: 'Results Submitted',
          message: `New ${p.result.electionType} results received from ${p.result.pollingStationName}`,
        });
      }),
      eventBus.on('discrepancy_detected', async (payload: unknown) => {
        const p = payload as { levelName: string; discrepancy: number; discrepancyPercent: number };
        await this.addNotification({
          userId: currentUserId,
          type: 'warning',
          title: 'Discrepancy Detected',
          message: `${p.levelName}: ${p.discrepancy} votes difference (${p.discrepancyPercent}%). Review required.`,
        });
      }),
      eventBus.on('verification_signed', async (payload: unknown) => {
        const p = payload as { verification: { levelName: string; levelType: string } };
        await this.addNotification({
          userId: currentUserId,
          type: 'info',
          title: 'Verification Signed',
          message: `${p.verification.levelType} level verification completed for ${p.verification.levelName}`,
        });
      }),
      eventBus.on('sync_failed', async (payload: unknown) => {
        const p = payload as { failed: number };
        await this.addNotification({
          userId: currentUserId,
          type: 'error',
          title: 'Sync Failed',
          message: `${p.failed} item(s) failed to sync. Check connectivity.`,
        });
      })
    );
  }

  async addNotification(data: Omit<Notification, 'id' | 'read' | 'createdAt'>): Promise<Notification> {
    const notif: Notification = {
      ...data,
      id: generateId(),
      read: false,
      createdAt: new Date().toISOString(),
    };
    await db.put('notifications', notif);
    eventBus.emit('notification_added', { notification: notif });
    return notif;
  }

  async getNotifications(userId: string, limit = 50): Promise<Notification[]> {
    const all = await db.getByIndex<Notification>('notifications', 'by_userId', userId);
    return all
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }

  async getUnreadCount(userId: string): Promise<number> {
    const unread = await db.query<Notification>(
      'notifications',
      (n) => n.userId === userId && !n.read
    );
    return unread.length;
  }

  async markRead(notificationId: string): Promise<void> {
    const n = await db.get<Notification>('notifications', notificationId);
    if (n) await db.put('notifications', { ...n, read: true });
  }

  async markAllRead(userId: string): Promise<void> {
    const all = await db.getByIndex<Notification>('notifications', 'by_userId', userId);
    for (const n of all.filter((x) => !x.read)) {
      await db.put('notifications', { ...n, read: true });
    }
  }

  // Simulate live result trickle for demo purposes
  startLiveSimulation(onUpdate: (event: EventType) => void, intervalMs = 15000): void {
    if (this.simulationInterval) return;
    this.simulationInterval = setInterval(() => {
      const events: EventType[] = ['results_updated', 'verification_signed', 'sync_complete'];
      const event = events[Math.floor(Math.random() * events.length)];
      onUpdate(event);
    }, intervalMs);
  }

  stopLiveSimulation(): void {
    if (this.simulationInterval) {
      clearInterval(this.simulationInterval);
      this.simulationInterval = null;
    }
  }

  destroy(): void {
    this.stopLiveSimulation();
    if (this.pollingInterval) clearInterval(this.pollingInterval);
    this.unsubscribers.forEach((fn) => fn());
    this.unsubscribers = [];
  }
}

export const realtimeService = new RealtimeService();
