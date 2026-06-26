/**
 * Shared chart colour palette — consistent across all dashboard charts.
 * Each colour has a main value and a lighter "fill" variant for area gradients.
 */
export const CHART_COLORS = {
  enterprise: {
    main: '#3b82f6',   // blue-500
    fill: '#3b82f620', // blue-500 12% opacity
    light: '#93c5fd',  // blue-300
  },
  standalone: {
    main: '#22c55e',   // green-500
    fill: '#22c55e20',
    light: '#86efac',
  },
  revenue: {
    main: '#8b5cf6',   // violet-500
    fill: '#8b5cf620',
    light: '#c4b5fd',
  },
  churn: {
    main: '#ef4444',   // red-500
    fill: '#ef444420',
    light: '#fca5a5',
  },
  growth: {
    main: '#06b6d4',   // cyan-500
    fill: '#06b6d420',
    light: '#67e8f9',
  },
  commission: {
    main: '#f59e0b',   // amber-500
    fill: '#f59e0b20',
    light: '#fcd34d',
  },
} as const;

/** Token tier bar colours. */
export const TOKEN_TIER_COLORS: Record<string, string> = {
  Basic: '#94a3b8',     // slate-400
  Standard: '#3b82f6',  // blue-500
  Advance: '#8b5cf6',   // violet-500
  Premium: '#f59e0b',   // amber-500
};

/** Heatmap activity colours. */
export const HEATMAP_COLORS = {
  active: '#22c55e',
  low: '#facc15',
  inactive: '#f97316',
  atRisk: '#ef4444',
} as const;

/**
 * Common tooltip style object for Recharts.
 * Works in both light and dark mode via CSS variable fallbacks.
 */
export const TOOLTIP_STYLE: React.CSSProperties = {
  backgroundColor: 'var(--chart-tooltip-bg, #ffffff)',
  borderColor: 'var(--chart-tooltip-border, #e5e7eb)',
  borderRadius: '8px',
  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
  fontSize: '12px',
};

// Re-export for convenience
import type React from 'react';
