// Service Worker registration — runs once on app startup

export function registerServiceWorker(): void {
  if (!('serviceWorker' in navigator)) return;
  if (import.meta.env.DEV) return; // skip in development

  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .then((registration) => {
        // Check for updates every hour
        setInterval(() => registration.update(), 60 * 60 * 1000);

        registration.addEventListener('updatefound', () => {
          const worker = registration.installing;
          if (!worker) return;
          worker.addEventListener('statechange', () => {
            if (worker.state === 'installed' && navigator.serviceWorker.controller) {
              // New version available — could show a toast here
              console.info('[SW] New version available. Refresh to update.');
            }
          });
        });

        // Listen for sync triggers from SW
        navigator.serviceWorker.addEventListener('message', (event) => {
          if (event.data?.type === 'SW_SYNC_TRIGGER') {
            window.dispatchEvent(new CustomEvent('sw-sync-trigger'));
          }
        });
      })
      .catch(() => {
        // SW registration failed — non-fatal, app still works
      });
  });
}

export function unregisterServiceWorker(): void {
  if (!('serviceWorker' in navigator)) return;
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    for (const reg of registrations) reg.unregister();
  });
}

export function requestBackgroundSync(): void {
  if (!('serviceWorker' in navigator)) return;
  navigator.serviceWorker.ready
    .then((reg) => {
      if ('sync' in reg) {
        return (reg as ServiceWorkerRegistration & { sync: { register(tag: string): Promise<void> } }).sync.register('sync-results');
      }
    })
    .catch(() => {});
}
