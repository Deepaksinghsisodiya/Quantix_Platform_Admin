import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ---------------------------------------------------------------------------
// FRS-SAP-108: Configurable Dashboard Widgets
// ---------------------------------------------------------------------------

export type DashboardViewPreset = 'Default' | 'Enterprise Focus' | 'Standalone Focus' | 'Revenue' | 'Support';

export interface WidgetConfig {
  readonly id: string;
  readonly label: string;
  readonly visible: boolean;
  readonly order: number;
}

interface DashboardWidgetState {
  activePreset: DashboardViewPreset;
  widgets: WidgetConfig[];

  setPreset: (preset: DashboardViewPreset) => void;
  toggleWidget: (widgetId: string) => void;
  reorderWidget: (widgetId: string, newOrder: number) => void;
  resetToDefault: () => void;
}

// All possible dashboard widgets
const ALL_WIDGETS: WidgetConfig[] = [
  { id: 'kpi-cards', label: 'KPI Cards', visible: true, order: 0 },
  { id: 'revenue-chart', label: 'Revenue Trend', visible: true, order: 1 },
  { id: 'growth-chart', label: 'Merchant Growth', visible: true, order: 2 },
  { id: 'source-attribution', label: 'Source Attribution', visible: true, order: 3 },
  { id: 'active-users', label: 'Active Users & Usage', visible: true, order: 4 },
  { id: 'merchant-heatmap', label: 'Merchant Health Heatmap', visible: true, order: 5 },
  { id: 'token-metrics', label: 'Token Metrics', visible: true, order: 6 },
  { id: 'commission-overview', label: 'Commission Overview', visible: true, order: 7 },
  { id: 'quick-actions', label: 'Quick Actions', visible: true, order: 8 },
  { id: 'system-health', label: 'System Health', visible: true, order: 9 },
  { id: 'revenue-breakdown', label: 'Revenue Breakdown', visible: true, order: 10 },
  { id: 'cohort-retention', label: 'Cohort Retention', visible: true, order: 11 },
];

const PRESET_CONFIGS: Record<DashboardViewPreset, string[]> = {
  Default: ALL_WIDGETS.map((w) => w.id),
  'Enterprise Focus': [
    'kpi-cards', 'revenue-chart', 'growth-chart', 'active-users',
    'merchant-heatmap', 'commission-overview', 'revenue-breakdown', 'system-health',
  ],
  'Standalone Focus': [
    'kpi-cards', 'token-metrics', 'growth-chart', 'merchant-heatmap',
    'quick-actions', 'system-health',
  ],
  Revenue: [
    'kpi-cards', 'revenue-chart', 'revenue-breakdown', 'commission-overview',
    'token-metrics', 'cohort-retention',
  ],
  Support: [
    'kpi-cards', 'merchant-heatmap', 'active-users', 'quick-actions', 'system-health',
  ],
};

function applyPreset(preset: DashboardViewPreset): WidgetConfig[] {
  const visibleIds = new Set(PRESET_CONFIGS[preset]);
  return ALL_WIDGETS.map((w) => ({
    ...w,
    visible: visibleIds.has(w.id),
  }));
}

export const useDashboardWidgetStore = create<DashboardWidgetState>()(
  persist(
    (set) => ({
      activePreset: 'Default',
      widgets: [...ALL_WIDGETS],

      setPreset: (preset) => {
        set({
          activePreset: preset,
          widgets: applyPreset(preset),
        });
      },

      toggleWidget: (widgetId) => {
        set((state) => ({
          activePreset: 'Default' as DashboardViewPreset,
          widgets: state.widgets.map((w) =>
            w.id === widgetId ? { ...w, visible: !w.visible } : w,
          ),
        }));
      },

      reorderWidget: (widgetId, newOrder) => {
        set((state) => {
          const widgets = [...state.widgets];
          const idx = widgets.findIndex((w) => w.id === widgetId);
          if (idx === -1) return state;
          const [item] = widgets.splice(idx, 1);
          widgets.splice(newOrder, 0, item!);
          return {
            widgets: widgets.map((w, i) => ({ ...w, order: i })),
          };
        });
      },

      resetToDefault: () => {
        set({
          activePreset: 'Default',
          widgets: [...ALL_WIDGETS],
        });
      },
    }),
    {
      name: 'quantix-dashboard-widgets',
    },
  ),
);
