import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../app/store';

// ─── Font Family Map ──────────────────────────────────────────────────────────
const FONT_FAMILY_MAP: Record<string, string> = {
  'Inter':             "'Inter', system-ui, -apple-system, sans-serif",
  'Outfit':            "'Outfit', system-ui, -apple-system, sans-serif",
  'Roboto':            "'Roboto', system-ui, -apple-system, sans-serif",
  'Plus Jakarta Sans': "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
};

// ─── Theme Mode Map ────────────────────────────────────────────────────────────
const THEME_MODE_MAP: Record<string, string> = {
  'Light':  'light',
  'Dark':   'dark',
  'System': 'system',
};

interface DynamicThemeProviderProps {
  children: React.ReactNode;
}

const DynamicThemeProvider: React.FC<DynamicThemeProviderProps> = ({ children }) => {
  const config = useSelector((state: RootState) => state.settings.config);

  useEffect(() => {
    const root = document.documentElement;

    // ── 1. Primary Color → CSS custom properties ──────────────────────────────
    if (config.PrimaryColor) {
      root.style.setProperty('--primary-color', config.PrimaryColor);

      const rgb = (() => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(config.PrimaryColor);
        if (!result || !result[1] || !result[2] || !result[3]) return [59, 130, 246];
        return [
          parseInt(result[1], 16),
          parseInt(result[2], 16),
          parseInt(result[3], 16)
        ];
      })();

      const interpolate = (target: [number, number, number], factor: number) => {
        const r1 = rgb[0] ?? 59;
        const g1 = rgb[1] ?? 130;
        const b1 = rgb[2] ?? 246;
        const r = Math.round(r1 + factor * (target[0] - r1));
        const g = Math.round(g1 + factor * (target[1] - g1));
        const b = Math.round(b1 + factor * (target[2] - b1));
        return `${r} ${g} ${b}`;
      };

      root.style.setProperty('--accent-50',  interpolate([255, 255, 255], 0.95));
      root.style.setProperty('--accent-100', interpolate([255, 255, 255], 0.9));
      root.style.setProperty('--accent-200', interpolate([255, 255, 255], 0.7));
      root.style.setProperty('--accent-300', interpolate([255, 255, 255], 0.5));
      root.style.setProperty('--accent-400', interpolate([255, 255, 255], 0.3));
      root.style.setProperty('--accent-500', `${rgb[0] ?? 59} ${rgb[1] ?? 130} ${rgb[2] ?? 246}`);
      root.style.setProperty('--accent-600', interpolate([0, 0, 0], 0.15));
      root.style.setProperty('--accent-700', interpolate([0, 0, 0], 0.3));
      root.style.setProperty('--accent-800', interpolate([0, 0, 0], 0.45));
      root.style.setProperty('--accent-900', interpolate([0, 0, 0], 0.6));
      root.style.setProperty('--accent-950', interpolate([0, 0, 0], 0.75));
    }

    // ── 2. Border Radius (only if user hasn't manually overridden) ─────────────
    if (config.BorderRadius) {
      const hasUserRadius = !!localStorage.getItem('theme-radius');
      if (!hasUserRadius) {
        root.style.setProperty('--radius', config.BorderRadius);
      }
    }

    // ── 3. Body Font Preset → Apply actual font family (Bug #8 FIX) ───────────
    // KEY WAS WRONG: was reading config.BodyFont (undefined), now reads config['Theme_BodyFontPreset']
    const hasUserFont = !!localStorage.getItem('theme-font');
    if (!hasUserFont) {
      const fontPreset = config['Theme_BodyFontPreset'] as string | undefined;
      const fontFamily = (fontPreset && FONT_FAMILY_MAP[fontPreset])
        ? FONT_FAMILY_MAP[fontPreset]
        : (FONT_FAMILY_MAP['Inter'] || "'Inter', sans-serif");

      root.style.setProperty('--font-sans', fontFamily);
      document.body.style.fontFamily = fontFamily;
    }

    // ── 4. Default Theme Mode from DB (Bug #9 FIX) ────────────────────────────
    // Only apply if user hasn't manually chosen a theme preference yet
    const hasUserMode = !!localStorage.getItem('theme-mode');
    if (!hasUserMode) {
      const dbMode = config['Theme_DefaultMode'] as string | undefined;
      if (dbMode && THEME_MODE_MAP[dbMode]) {
        const resolvedMode = THEME_MODE_MAP[dbMode];
        // For 'system', detect OS preference
        const effectiveMode = resolvedMode === 'system'
          ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
          : resolvedMode;
        root.classList.remove('light', 'dark');
        root.classList.add(effectiveMode);
      }
    }

    // ── 5. App Title ───────────────────────────────────────────────────────────
    if (config.AppName) {
      document.title = config.AppName;
    }

    // ── 6. Favicon ────────────────────────────────────────────────────────────
    const faviconUrl = config.CompanyFavicon || config.CompanyLogo || config.AppLogo;
    if (faviconUrl) {
      const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
      if (link) link.href = faviconUrl;
    }
  }, [config]);

  return <>{children}</>;
};

export default DynamicThemeProvider;
