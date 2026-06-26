/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_NAME: string;
  readonly VITE_APP_VERSION: string;
  readonly VITE_APP_YEAR: string;
  readonly VITE_ECZ_API_BASE_URL: string;
  readonly VITE_ECZ_API_KEY: string;
  readonly VITE_ENABLE_LIVE_SIMULATION: string;
  readonly VITE_SYNC_INTERVAL_MS: string;
  readonly VITE_SESSION_DURATION_HOURS: string;
  readonly VITE_ANALYTICS_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Injected by vite.config.ts define block
declare const __APP_VERSION__: string;
declare const __BUILD_TIME__: string;
declare const __APP_NAME__: string;
