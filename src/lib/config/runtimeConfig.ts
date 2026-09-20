/**
 * 2026-08-31: ONE resolver for "where is the API?".
 *
 * `/public/config.js` promises the operator they can retarget a PUBLISHED build at a
 * different API "NO REBUILD NEEDED" — but only `lib/api/client.ts` honoured
 * `window.__QUANTIX_CONFIG__`. Every other caller read the build-time `VITE_API_BASE_URL`
 * directly, including `core/services/axiosInstance.ts`, which backs `baseApi` and
 * therefore EVERY RTK Query call in the portal. A distributed build would keep calling
 * whatever URL was baked at build time no matter what config.js said.
 *
 * Precedence: runtime config (config.js) → build-time VITE var → same-origin ('').
 * Same-origin is the honest default: it works when the API is reverse-proxied under the
 * origin serving this SPA, and it never invents a hostname.
 */

/** Base origin of the Quantix Platform API, without a trailing slash. */
export function getApiBaseUrl(): string {
  const runtime =
    typeof window !== 'undefined' ? window.__QUANTIX_CONFIG__?.apiBaseUrl : undefined;
  const baked =
    (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? import.meta.env.VITE_API_URL;

  // Trailing slashes are stripped so callers can always concatenate '/api/v1/...'
  // without producing a double slash.
  return String(runtime || baked || '').replace(/\/+$/, '');
}

/** True when the SPA should serve mocked responses instead of calling the API. */
export function isMockApiEnabled(): boolean {
  const runtime =
    typeof window !== 'undefined' ? window.__QUANTIX_CONFIG__?.mockApi : undefined;
  if (typeof runtime === 'boolean') return runtime;
  return String(import.meta.env.VITE_MOCK_API ?? '') === 'true';
}

/**
 * 2026-09-05 (content Phase 1): turn an API-relative path into an absolute one.
 *
 * The media API returns "/api/v1/media/{id}/file" rather than a full URL, so a stored content
 * row does not bake in whichever host it was created on. Anything that puts a media asset in an
 * <img src> has to resolve it here, against the same base every other call uses.
 */
export function resolveApiUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  const base = getApiBaseUrl();
  return `${base}${path.startsWith('/') ? '' : '/'}${path}`;
}
