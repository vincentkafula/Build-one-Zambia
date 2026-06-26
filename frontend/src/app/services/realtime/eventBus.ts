// In-app event bus — pub/sub for cross-service real-time communication

export type EventType =
  | 'results_updated'
  | 'verification_completed'
  | 'verification_signed'
  | 'discrepancy_detected'
  | 'sync_complete'
  | 'sync_failed'
  | 'user_login'
  | 'user_logout'
  | 'ecz_figures_updated'
  | 'notification_added';

type Listener<T = unknown> = (payload: T) => void;

class EventBus {
  private listeners: Map<EventType, Set<Listener>> = new Map();

  on<T = unknown>(event: EventType, listener: Listener<T>): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(listener as Listener);
    // Return unsubscribe function
    return () => this.off(event, listener);
  }

  off<T = unknown>(event: EventType, listener: Listener<T>): void {
    this.listeners.get(event)?.delete(listener as Listener);
  }

  emit<T = unknown>(event: EventType, payload: T): void {
    this.listeners.get(event)?.forEach((listener) => {
      try {
        listener(payload);
      } catch (e) {
        console.error(`EventBus error in listener for "${event}":`, e);
      }
    });
  }

  once<T = unknown>(event: EventType, listener: Listener<T>): void {
    const wrapped: Listener<T> = (payload) => {
      listener(payload);
      this.off(event, wrapped);
    };
    this.on(event, wrapped);
  }

  listenerCount(event: EventType): number {
    return this.listeners.get(event)?.size ?? 0;
  }
}

export const eventBus = new EventBus();
