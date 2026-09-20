import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { DashboardViewPreset, WidgetConfig } from './dashboardWidgetStore';

export interface DashboardWidgetState {
  activePreset: DashboardViewPreset;
  widgets: WidgetConfig[];
}

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

const isPreset = (value: string): value is DashboardViewPreset =>
  Object.prototype.hasOwnProperty.call(PRESET_CONFIGS, value);

/** What the server stores per user — ids, visibility and order only; labels stay in code. */
export interface SavedDashboardLayout {
  readonly activePreset: string;
  readonly widgets: readonly { readonly id: string; readonly visible: boolean; readonly order: number }[];
}

const loadSavedWidgets = (): DashboardWidgetState => {
  if (typeof window === 'undefined') return { activePreset: 'Default', widgets: [...ALL_WIDGETS] };
  try {
    const saved = localStorage.getItem('quantix-dashboard-widgets');
    if (saved) {
      const parsed = JSON.parse(saved);
      // compatibility from old zustand format
      const activePreset = parsed.activePreset || parsed.state?.activePreset || 'Default';
      const widgets = parsed.widgets || parsed.state?.widgets || [...ALL_WIDGETS];
      return { activePreset, widgets };
    }
  } catch (e) {
    // Ignore
  }
  return { activePreset: 'Default', widgets: [...ALL_WIDGETS] };
};

const initialState: DashboardWidgetState = loadSavedWidgets();

const persistWidgets = (state: DashboardWidgetState) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('quantix-dashboard-widgets', JSON.stringify({
      activePreset: state.activePreset,
      widgets: state.widgets,
    }));
  }
};

const dashboardWidgetSlice = createSlice({
  name: 'dashboardWidgets',
  initialState,
  reducers: {
    setPreset: (state, action: PayloadAction<DashboardViewPreset>) => {
      state.activePreset = action.payload;
      state.widgets = applyPreset(action.payload);
      persistWidgets(state);
    },
    toggleWidget: (state, action: PayloadAction<string>) => {
      state.activePreset = 'Default';
      state.widgets = state.widgets.map((w) =>
        w.id === action.payload ? { ...w, visible: !w.visible } : w
      );
      persistWidgets(state);
    },
    reorderWidget: (state, action: PayloadAction<{ widgetId: string; newOrder: number }>) => {
      const widgets = [...state.widgets];
      const idx = widgets.findIndex((w) => w.id === action.payload.widgetId);
      if (idx !== -1) {
        const [item] = widgets.splice(idx, 1);
        widgets.splice(action.payload.newOrder, 0, item!);
        state.widgets = widgets.map((w, i) => ({ ...w, order: i }));
        persistWidgets(state);
      }
    },
    resetToDefault: (state) => {
      state.activePreset = 'Default';
      state.widgets = [...ALL_WIDGETS];
      persistWidgets(state);
    },
    /**
     * 2026-09-04: apply the layout saved on the user's account (see useDashboardLayoutSync).
     * Ids the code no longer knows are dropped; widgets added since the save go to the end,
     * visible, so a new widget is never silently hidden by an old layout.
     */
    hydrateLayout: (state, action: PayloadAction<SavedDashboardLayout>) => {
      const saved = new Map(action.payload.widgets.map((w) => [w.id, w]));
      const merged = ALL_WIDGETS.map((w) => {
        const s = saved.get(w.id);
        return s
          ? { ...w, visible: s.visible, order: s.order }
          : { ...w, visible: true, order: Number.MAX_SAFE_INTEGER };
      });
      merged.sort((a, b) => a.order - b.order);
      state.widgets = merged.map((w, i) => ({ ...w, order: i }));
      state.activePreset = isPreset(action.payload.activePreset) ? action.payload.activePreset : 'Default';
      persistWidgets(state);
    },
  },
});

export const { setPreset, toggleWidget, reorderWidget, resetToDefault, hydrateLayout } = dashboardWidgetSlice.actions;
export default dashboardWidgetSlice.reducer;
export const selectActivePreset = (state: any) => state.dashboardWidgets.activePreset;
export const selectWidgets = (state: any) => state.dashboardWidgets.widgets;
