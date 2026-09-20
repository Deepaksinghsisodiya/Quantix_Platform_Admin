/**
 * Country-code → display-name via Intl.DisplayNames (2026-08-30, user directive:
 * the platform deploys to ANY country decided at platform setup — no hardcoded
 * country lists/labels anywhere in the portals). Replaces the per-page
 * COUNTRY_OPTIONS / COUNTRY_LABELS maps that only knew a handful of countries.
 */
export function countryName(code: string | null | undefined): string {
  const iso = code?.trim().toUpperCase();
  if (!iso) return '';
  try {
    return new Intl.DisplayNames(undefined, { type: 'region' }).of(iso) ?? iso;
  } catch {
    // Unknown/invalid code — show it raw rather than hiding it.
    return iso;
  }
}
