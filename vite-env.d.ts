/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_MFA_ISSUER: string;
  readonly VITE_APP_NAME: string;
  readonly VITE_MOCK_API: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Runtime configuration injected by /public/config.js before the React bundle
// loads. Takes precedence over the build-time VITE_* env vars so an operator
// can retarget the SPA (apiBaseUrl, mockApi, branding) after a build, without
// rebuilding the bundle. All fields are optional -- absent fields fall back
// to the VITE_* defaults baked at build time.
interface QuantixRuntimeConfig {
  readonly apiBaseUrl?: string;
  readonly mockApi?: boolean;
  readonly appName?: string;
  readonly mfaIssuer?: string;
}

interface Window {
  __QUANTIX_CONFIG__?: QuantixRuntimeConfig;
}
