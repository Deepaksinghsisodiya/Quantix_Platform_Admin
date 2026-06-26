/** Primary chart colour palette (ordered for sequential use in Recharts / charting). */
export const CHART_COLORS: readonly string[] = [
  '#6366f1', // indigo-500
  '#8b5cf6', // violet-500
  '#ec4899', // pink-500
  '#f43f5e', // rose-500
  '#f97316', // orange-500
  '#eab308', // yellow-500
  '#22c55e', // green-500
  '#14b8a6', // teal-500
  '#06b6d4', // cyan-500
  '#3b82f6', // blue-500
] as const;

/** Secondary / muted chart palette for backgrounds or secondary series. */
export const CHART_COLORS_MUTED: readonly string[] = [
  '#a5b4fc', // indigo-300
  '#c4b5fd', // violet-300
  '#f9a8d4', // pink-300
  '#fda4af', // rose-300
  '#fdba74', // orange-300
  '#fde047', // yellow-300
  '#86efac', // green-300
  '#5eead4', // teal-300
  '#67e8f9', // cyan-300
  '#93c5fd', // blue-300
] as const;

/** Status colour map (Tailwind hex values for chart/badge rendering). */
export const STATUS_CHART_COLORS: Record<string, string> = {
  Active: '#22c55e',
  Pending: '#3b82f6',
  Suspended: '#f59e0b',
  Cancelled: '#ef4444',
  Deleted: '#6b7280',
  Failed: '#dc2626',
  Paid: '#22c55e',
  Overdue: '#ef4444',
  Draft: '#9ca3af',
  Open: '#3b82f6',
  InProgress: '#f59e0b',
  Resolved: '#22c55e',
  Closed: '#6b7280',
} as const;

/** Quantix brand colours. */
export const BRAND_COLORS = {
  primary: '#6366f1',
  primaryLight: '#818cf8',
  primaryDark: '#4f46e5',
  secondary: '#8b5cf6',
  secondaryLight: '#a78bfa',
  secondaryDark: '#7c3aed',
  accent: '#06b6d4',
  accentLight: '#22d3ee',
  accentDark: '#0891b2',
  background: '#f8fafc',
  backgroundDark: '#0f172a',
  surface: '#ffffff',
  surfaceDark: '#1e293b',
  text: '#0f172a',
  textDark: '#f8fafc',
  textMuted: '#64748b',
  border: '#e2e8f0',
  borderDark: '#334155',
} as const;
