import { useSelector, useDispatch } from 'react-redux';
import { store } from '@/app/store';
import * as actions from './dashboardWidgetSlice';

export type DashboardViewPreset = 'Default' | 'Enterprise Focus' | 'Standalone Focus' | 'Revenue' | 'Support';

export interface WidgetConfig {
  readonly id: string;
  readonly label: string;
  readonly visible: boolean;
  readonly order: number;
}

export function useDashboardWidgetStore<T = any>(selector?: (state: any) => T): T {
  const dispatch = useDispatch();
  const dbWidgets = useSelector((state: any) => state.dashboardWidgets);

  const combined = {
    activePreset: dbWidgets.activePreset,
    widgets: dbWidgets.widgets,
    setPreset: (preset: DashboardViewPreset) => dispatch(actions.setPreset(preset)),
    toggleWidget: (widgetId: string) => dispatch(actions.toggleWidget(widgetId)),
    reorderWidget: (widgetId: string, newOrder: number) => dispatch(actions.reorderWidget({ widgetId, newOrder })),
    resetToDefault: () => dispatch(actions.resetToDefault()),
  };

  if (selector) {
    return selector(combined);
  }
  return combined as any;
}

// Support vanilla JS calls (e.g. useDashboardWidgetStore.getState().widgets)
useDashboardWidgetStore.getState = () => {
  const dbWidgets = store.getState().dashboardWidgets;
  return {
    activePreset: dbWidgets.activePreset,
    widgets: dbWidgets.widgets,
    setPreset: (preset: DashboardViewPreset) => store.dispatch(actions.setPreset(preset)),
    toggleWidget: (widgetId: string) => store.dispatch(actions.toggleWidget(widgetId)),
    reorderWidget: (widgetId: string, newOrder: number) => store.dispatch(actions.reorderWidget({ widgetId, newOrder })),
    resetToDefault: () => store.dispatch(actions.resetToDefault()),
  };
};

useDashboardWidgetStore.setState = (update: any) => {
  // Not used in components, but implemented for completeness
};
