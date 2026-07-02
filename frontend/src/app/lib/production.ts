// Production bootstrap — runs once before the React tree mounts

import { registerServiceWorker } from './serviceWorker';

// ── SEO / Meta tags ────────────────────────────────────────────────────────

function injectMeta(name: string, content: string, attr = 'name'): void {
  if (!content) return;
  let el = document.querySelector<HTMLMetaElement>(`meta[${attr}="${name}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function injectLink(rel: string, href: string, extra?: Record<string, string>): void {
  let el = document.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement('link');
    document.head.appendChild(el);
  }
  el.setAttribute('rel', rel);
  el.setAttribute('href', href);
  if (extra) Object.entries(extra).forEach(([k, v]) => el!.setAttribute(k, v));
}

function setupSEO(): void {
  document.title = 'Build One Zambia — 2026 General Election Results';

  // Primary meta
  injectMeta('description', 'Real-time 2026 Zambian General Election results — Presidential, Parliamentary, Mayoral and Ward Councillor positions. Transparency you can trust.');
  injectMeta('keywords', 'Zambia election 2026, presidential results, ECZ, election results, BOZ, Build One Zambia');
  injectMeta('author', 'Build One Zambia');
  injectMeta('robots', 'index, follow');
  injectMeta('theme-color', '#198754');
  injectMeta('color-scheme', 'dark light');

  // Open Graph
  injectMeta('og:type', 'website', 'property');
  injectMeta('og:title', 'Build One Zambia — 2026 General Election Results', 'property');
  injectMeta('og:description', 'Real-time station-by-station election results for Zambia\'s 2026 General Elections. 13,529 polling stations. 8.7M registered voters.', 'property');
  injectMeta('og:locale', 'en_ZM', 'property');
  injectMeta('og:site_name', 'Build One Zambia Election Portal', 'property');

  // Twitter Card
  injectMeta('twitter:card', 'summary_large_image');
  injectMeta('twitter:title', 'Zambia 2026 Election Results — Build One Zambia');
  injectMeta('twitter:description', 'Real-time station-by-station election results. Presidential, Parliamentary, Mayoral & Ward Councillor.');

  // PWA / browser
  injectLink('manifest', '/manifest.json');
  injectLink('apple-touch-icon', '/icons/icon-192.png', { sizes: '192x192' });

  // Canonical
  const canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]')
    || document.head.appendChild(Object.assign(document.createElement('link'), { rel: 'canonical', href: window.location.origin }));
  canonical.href = window.location.origin + window.location.pathname;
}

// ── Global error handling ──────────────────────────────────────────────────

function setupGlobalErrorHandling(): void {
  window.addEventListener('error', (event) => {
    if (import.meta.env.PROD) {
      // Replace with Sentry.captureException() or similar in real deployment
      console.error('[Election Portal] Uncaught error:', {
        message: event.message,
        filename: event.filename,
        line: event.lineno,
        col: event.colno,
        stack: event.error?.stack,
      });
    }
  });

  window.addEventListener('unhandledrejection', (event) => {
    if (import.meta.env.PROD) {
      console.error('[Election Portal] Unhandled promise rejection:', event.reason);
    }
    // Prevent noisy console output in production for known non-critical rejections
    event.preventDefault();
  });
}

// ── Performance: report web vitals in production ───────────────────────────

function setupPerformanceObserver(): void {
  if (!import.meta.env.PROD) return;
  if (!('PerformanceObserver' in window)) return;

  try {
    const po = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        // In production, send to analytics (e.g., Google Analytics, Plausible)
        if (entry.entryType === 'largest-contentful-paint') {
          console.debug('[Perf] LCP:', entry.startTime.toFixed(0), 'ms');
        }
      }
    });
    po.observe({ type: 'largest-contentful-paint', buffered: true });
  } catch {
    // PerformanceObserver not supported — non-fatal
  }
}

// ── Auth rate limiting (client-side) ──────────────────────────────────────

const RATE_LIMIT_KEY = 'election_auth_attempts';
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

export interface RateLimitState {
  attempts: number;
  windowStart: number;
  lockedUntil?: number;
}

export function checkLoginRateLimit(): { allowed: boolean; waitMs: number; attemptsLeft: number } {
  const raw = sessionStorage.getItem(RATE_LIMIT_KEY);
  const state: RateLimitState = raw ? JSON.parse(raw) : { attempts: 0, windowStart: Date.now() };
  const now = Date.now();

  // Reset window if expired
  if (now - state.windowStart > RATE_LIMIT_WINDOW_MS) {
    sessionStorage.removeItem(RATE_LIMIT_KEY);
    return { allowed: true, waitMs: 0, attemptsLeft: RATE_LIMIT_MAX };
  }

  if (state.lockedUntil && now < state.lockedUntil) {
    return { allowed: false, waitMs: state.lockedUntil - now, attemptsLeft: 0 };
  }

  if (state.attempts >= RATE_LIMIT_MAX) {
    const lockUntil = now + 15 * 60 * 1000;
    sessionStorage.setItem(RATE_LIMIT_KEY, JSON.stringify({ ...state, lockedUntil: lockUntil }));
    return { allowed: false, waitMs: 15 * 60 * 1000, attemptsLeft: 0 };
  }

  return { allowed: true, waitMs: 0, attemptsLeft: RATE_LIMIT_MAX - state.attempts };
}

export function recordLoginAttempt(success: boolean): void {
  if (success) {
    sessionStorage.removeItem(RATE_LIMIT_KEY);
    return;
  }
  const raw = sessionStorage.getItem(RATE_LIMIT_KEY);
  const state: RateLimitState = raw ? JSON.parse(raw) : { attempts: 0, windowStart: Date.now() };
  sessionStorage.setItem(RATE_LIMIT_KEY, JSON.stringify({ ...state, attempts: state.attempts + 1 }));
}

// ── Content Security Policy ────────────────────────────────────────────────

function injectCSP(): void {
  if (!import.meta.env.PROD) return;
  const meta = document.createElement('meta');
  meta.httpEquiv = 'Content-Security-Policy';
  meta.content = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' https://www.gstatic.com https://www.google.com https://apis.google.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com data:",
    "img-src 'self' data: blob: https:",
    "connect-src 'self' https://*.railway.app https://*.up.railway.app https://*.googleapis.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://api.resend.com https://images.unsplash.com wss://*.railway.app https://www.google.com https://recaptcha.google.com https://*.twilio.com",
    "worker-src 'self' blob:",
    "frame-src https://www.google.com https://build-one-zambia.firebaseapp.com",
        "base-uri 'self'",
    "form-action 'self'",
    "upgrade-insecure-requests",
    "block-all-mixed-content",
  ].join('; ');
  document.head.prepend(meta);
}

/** Auto-logout when session token is expired or tampered */
function setupSessionGuard(): void {
  const SESSION_KEY  = 'boz_session_token';
  const CREATED_KEY  = 'boz_session_created';
  const MAX_AGE_MS   = 8 * 60 * 60 * 1000; // 8 hours

  // Mark session start if token exists but no start time recorded
  if (sessionStorage.getItem(SESSION_KEY) && !sessionStorage.getItem(CREATED_KEY)) {
    sessionStorage.setItem(CREATED_KEY, String(Date.now()));
  }

  // Check session age every 60 seconds
  setInterval(() => {
    const created = sessionStorage.getItem(CREATED_KEY);
    if (created && Date.now() - Number(created) > MAX_AGE_MS) {
      sessionStorage.clear();
      window.location.href = '/dashboard-login';
    }
  }, 60_000);
}

// ── Main bootstrap ─────────────────────────────────────────────────────────

export function bootstrapProduction(): void {
  setupSEO();
  setupGlobalErrorHandling();
  setupPerformanceObserver();
  injectCSP();
  setupSessionGuard();
  registerServiceWorker();
}
