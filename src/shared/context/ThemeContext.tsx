import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { applyThemePreset, getActiveAccent, THEME_PRESETS, type ThemePreset } from '../theme/presets';

// ─── Types ────────────────────────────────────────────────────────────
type ThemeMode = 'light' | 'dark' | 'system';
type BorderRadius = 'sharp' | 'rounded' | 'pill';
type FontScale = 'px12' | 'px14' | 'px16';
type SidebarStyle = 'dark' | 'accent' | 'transparent';

interface ThemeContextType {
  // Mode
  mode: ThemeMode;
  resolvedTheme: 'light' | 'dark';
  setMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
  // Legacy alias
  theme: 'light' | 'dark';

  // Accent
  accentId: string;
  setAccent: (id: string) => void;
  presets: ThemePreset[];

  // Border Radius
  borderRadius: BorderRadius;
  setBorderRadius: (r: BorderRadius) => void;

  // Font Scale
  fontScale: FontScale;
  setFontScale: (s: FontScale) => void;

  // Sidebar Style
  sidebarStyle: SidebarStyle;
  setSidebarStyle: (s: SidebarStyle) => void;

  // Reset to default settings
  resetToDefaults: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// ─── Helpers ──────────────────────────────────────────────────────────
const RADIUS_MAP: Record<BorderRadius, string> = {
  sharp:   '0.375rem',
  rounded: '1rem',
  pill:    '9999px',
};

const FONT_MAP: Record<FontScale, string> = {
  px12: '12px',
  px14: '14px',
  px16: '16px',
};

const getSystemPreference = (): 'light' | 'dark' => {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const resolveMode = (mode: ThemeMode): 'light' | 'dark' => {
  return mode === 'system' ? getSystemPreference() : mode;
};

// ─── Provider ─────────────────────────────────────────────────────────
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Mode
  const [mode, setModeState] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('theme-mode') as ThemeMode | null;
    if (saved === 'light' || saved === 'dark' || saved === 'system') return saved;
    // Legacy fallback
    const legacy = localStorage.getItem('theme');
    if (legacy === 'light' || legacy === 'dark') return legacy;
    return 'system';
  });
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>(resolveMode(mode));

  // Accent
  const [accentId, setAccentId] = useState<string>(getActiveAccent);

  // Border Radius
  const [borderRadius, setBorderRadiusState] = useState<BorderRadius>(() => {
    return (localStorage.getItem('theme-radius') as BorderRadius) || 'sharp';
  });

  // Font Scale
  const [fontScale, setFontScaleState] = useState<FontScale>(() => {
    const saved = localStorage.getItem('theme-font');
    if (saved === 'px12' || saved === 'px14' || saved === 'px16') return saved as FontScale;
    if (saved === 'small' || saved === 'px10') return 'px12';
    if (saved === 'large') return 'px16';
    return 'px14'; // Default to px14 (Medium)
  });

  // Sidebar Style
  const [sidebarStyle, setSidebarStyleState] = useState<SidebarStyle>(() => {
    return (localStorage.getItem('theme-sidebar') as SidebarStyle) || 'dark';
  });

  // ── Apply Mode ────────────────────────────────────────────────────
  useEffect(() => {
    const resolved = resolveMode(mode);
    setResolvedTheme(resolved);

    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(resolved);
    localStorage.setItem('theme-mode', mode);
    localStorage.setItem('theme', resolved); // Legacy compat
  }, [mode]);

  // Listen for system preference changes when mode === 'system'
  useEffect(() => {
    if (mode !== 'system') return;

    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      setResolvedTheme(e.matches ? 'dark' : 'light');
      const root = window.document.documentElement;
      root.classList.remove('light', 'dark');
      root.classList.add(e.matches ? 'dark' : 'light');
    };
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, [mode]);

  // ── Apply Accent ──────────────────────────────────────────────────
  useEffect(() => {
    applyThemePreset(accentId);
  }, [accentId]);

  // ── Apply Border Radius ───────────────────────────────────────────
  useEffect(() => {
    document.documentElement.style.setProperty('--radius', RADIUS_MAP[borderRadius]);
    localStorage.setItem('theme-radius', borderRadius);
  }, [borderRadius]);

  // ── Apply Font Scale ──────────────────────────────────────────────
  useEffect(() => {
    document.documentElement.style.fontSize = FONT_MAP[fontScale];
    localStorage.setItem('theme-font', fontScale);
  }, [fontScale]);

  // ── Apply Sidebar Style ───────────────────────────────────────────
  useEffect(() => {
    localStorage.setItem('theme-sidebar', sidebarStyle);
  }, [sidebarStyle]);

  // ── Setters ───────────────────────────────────────────────────────
  const setMode = useCallback((m: ThemeMode) => setModeState(m), []);
  const setAccent = useCallback((id: string) => { setAccentId(id); applyThemePreset(id); }, []);
  const setBorderRadius = useCallback((r: BorderRadius) => setBorderRadiusState(r), []);
  const setFontScale = useCallback((s: FontScale) => setFontScaleState(s), []);
  const setSidebarStyle = useCallback((s: SidebarStyle) => setSidebarStyleState(s), []);

  const toggleTheme = useCallback(() => {
    setModeState(prev => {
      const resolved = resolveMode(prev);
      return resolved === 'light' ? 'dark' : 'light';
    });
  }, []);

  const resetToDefaults = useCallback(() => {
    setModeState('system');
    setAccentId('blue');
    setBorderRadiusState('sharp');
    setFontScaleState('px14');
    setSidebarStyleState('dark');
    localStorage.removeItem('theme-mode');
    localStorage.removeItem('theme-radius');
    localStorage.removeItem('theme-font');
    localStorage.removeItem('theme-sidebar');
  }, []);

  return (
    <ThemeContext.Provider value={{
      mode, resolvedTheme, setMode, toggleTheme,
      theme: resolvedTheme,
      accentId, setAccent, presets: THEME_PRESETS,
      borderRadius, setBorderRadius,
      fontScale, setFontScale,
      sidebarStyle, setSidebarStyle,
      resetToDefaults,
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
