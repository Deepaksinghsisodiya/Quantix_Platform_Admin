/**
 * FRS-SAP-1306: Multi-Language Support & RTL
 *
 * Basic i18n infrastructure stub. In production, this would be backed by
 * a full i18n library (react-intl, i18next, etc.) with lazy-loaded locale bundles.
 *
 * Currently provides:
 * - Language configuration and switching
 * - RTL detection for Arabic, Hebrew, Persian, Urdu
 * - Translation key lookup with fallback to English
 */

export type SupportedLocale = 'en' | 'ar' | 'fr' | 'de' | 'es' | 'zh' | 'ja' | 'hi';

export interface LocaleConfig {
  readonly code: SupportedLocale;
  readonly name: string;
  readonly nativeName: string;
  readonly direction: 'ltr' | 'rtl';
}

export const SUPPORTED_LOCALES: readonly LocaleConfig[] = [
  { code: 'en', name: 'English', nativeName: 'English', direction: 'ltr' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', direction: 'rtl' },
  { code: 'fr', name: 'French', nativeName: 'Français', direction: 'ltr' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', direction: 'ltr' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', direction: 'ltr' },
  { code: 'zh', name: 'Chinese', nativeName: '中文', direction: 'ltr' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', direction: 'ltr' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', direction: 'ltr' },
];

const RTL_LOCALES = new Set<string>(['ar', 'he', 'fa', 'ur']);

/** Check if a locale uses right-to-left direction. */
export function isRtl(locale: string): boolean {
  return RTL_LOCALES.has(locale);
}

/** Get locale configuration by code. */
export function getLocaleConfig(code: string): LocaleConfig | undefined {
  return SUPPORTED_LOCALES.find((l) => l.code === code);
}

/**
 * Translation function stub.
 * In production, this would look up translations from a loaded locale bundle.
 * For now, returns the key as-is (English is the default).
 */
export function t(key: string, _params?: Record<string, string | number>): string {
  // TODO: Implement actual translation lookup from locale bundles.
  // For alpha, all strings are in English and this is a pass-through.
  return key;
}

/** Get the current document direction based on locale. */
export function applyLocaleDirection(locale: string): void {
  const dir = isRtl(locale) ? 'rtl' : 'ltr';
  document.documentElement.setAttribute('dir', dir);
  document.documentElement.setAttribute('lang', locale);
}
