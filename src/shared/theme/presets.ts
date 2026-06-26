/**
 * Theme Accent Presets
 * RGB triplets for CSS variable injection.
 * Each shade maps to a Tailwind-compatible accent-{shade} class.
 */

export interface ThemePreset {
  id: string;
  label: string;
  /** Hex preview color for the UI swatch */
  preview: string;
  shades: {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
    950: string;
  };
}

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: 'indigo',
    label: 'Indigo',
    preview: '#6366f1',
    shades: {
      50:  '238 242 255',
      100: '224 231 255',
      200: '199 210 254',
      300: '165 180 252',
      400: '129 140 248',
      500: '99 102 241',
      600: '79 70 229',
      700: '67 56 202',
      800: '55 48 163',
      900: '49 46 129',
      950: '30 27 75',
    },
  },
  {
    id: 'violet',
    label: 'Violet',
    preview: '#8b5cf6',
    shades: {
      50:  '245 243 255',
      100: '237 233 254',
      200: '221 214 254',
      300: '196 181 253',
      400: '167 139 250',
      500: '139 92 246',
      600: '124 58 237',
      700: '109 40 217',
      800: '91 33 182',
      900: '76 29 149',
      950: '46 16 101',
    },
  },
  {
    id: 'blue',
    label: 'Blue',
    preview: '#3b82f6',
    shades: {
      50:  '239 246 255',
      100: '219 234 254',
      200: '191 219 254',
      300: '147 197 253',
      400: '96 165 250',
      500: '59 130 246',
      600: '37 99 235',
      700: '29 78 216',
      800: '30 64 175',
      900: '30 58 138',
      950: '23 37 84',
    },
  },
  {
    id: 'cyan',
    label: 'Cyan',
    preview: '#06b6d4',
    shades: {
      50:  '236 254 255',
      100: '207 250 254',
      200: '165 243 252',
      300: '103 232 249',
      400: '34 211 238',
      500: '6 182 212',
      600: '8 145 178',
      700: '14 116 144',
      800: '21 94 117',
      900: '22 78 99',
      950: '8 51 68',
    },
  },
  {
    id: 'emerald',
    label: 'Emerald',
    preview: '#10b981',
    shades: {
      50:  '236 253 245',
      100: '209 250 229',
      200: '167 243 208',
      300: '110 231 183',
      400: '52 211 153',
      500: '16 185 129',
      600: '5 150 105',
      700: '4 120 87',
      800: '6 95 70',
      900: '6 78 59',
      950: '2 44 34',
    },
  },
  {
    id: 'amber',
    label: 'Amber',
    preview: '#f59e0b',
    shades: {
      50:  '255 251 235',
      100: '254 243 199',
      200: '253 230 138',
      300: '252 211 77',
      400: '251 191 36',
      500: '245 158 11',
      600: '217 119 6',
      700: '180 83 9',
      800: '146 64 14',
      900: '120 53 15',
      950: '69 26 3',
    },
  },
  {
    id: 'rose',
    label: 'Rose',
    preview: '#f43f5e',
    shades: {
      50:  '255 241 242',
      100: '255 228 230',
      200: '254 205 211',
      300: '253 164 175',
      400: '251 113 133',
      500: '244 63 94',
      600: '225 29 72',
      700: '190 18 60',
      800: '159 18 57',
      900: '136 19 55',
      950: '76 5 25',
    },
  },
  {
    id: 'slate',
    label: 'Slate',
    preview: '#64748b',
    shades: {
      50:  '248 250 252',
      100: '241 245 249',
      200: '226 232 240',
      300: '203 213 225',
      400: '148 163 184',
      500: '100 116 139',
      600: '71 85 105',
      700: '51 65 85',
      800: '30 41 59',
      900: '15 23 42',
      950: '2 6 23',
    },
  },
];

/**
 * Apply a theme preset by setting CSS variables on :root.
 */
export const applyThemePreset = (presetId: string) => {
  const preset = THEME_PRESETS.find(p => p.id === presetId);
  if (!preset) return;

  const root = document.documentElement;
  Object.entries(preset.shades).forEach(([shade, value]) => {
    root.style.setProperty(`--accent-${shade}`, value);
  });

  // Persist to localStorage
  localStorage.setItem('theme-accent', presetId);
};

/**
 * Get the currently active accent theme ID.
 */
export const getActiveAccent = (): string => {
  const saved = localStorage.getItem('theme-accent');
  if (saved === 'emerald' || !saved) {
    return 'blue';
  }
  return saved;
};

/**
 * Initialize theme on app startup.
 */
export const initializeAccentTheme = () => {
  const activeId = getActiveAccent();
  applyThemePreset(activeId);
};
