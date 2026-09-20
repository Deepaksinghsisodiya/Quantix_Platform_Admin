/**
 * useDashboardLayoutSync — 2026-09-04. Keeps the dashboard's "Customize" state on the
 * user's account (GET/PUT /api/v1/dashboard/layout) instead of only in this browser.
 *
 * Until now the API answered 501 to a save the portal never sent, so a layout lived in one
 * browser's localStorage and vanished on another machine. Flow:
 *   1. On mount, fetch the saved layout once. If there is one, hydrate the slice from it
 *      (localStorage keeps acting as the fast cache). If there is none, the current local
 *      layout is pushed on the first tick below — that migrates a browser-only layout to
 *      the account.
 *   2. After that, every change to the slice is saved, debounced, when it differs from what
 *      the server last acknowledged.
 * Failures are said once, not hidden: load failure → "using this browser's copy"; save
 * failure → "kept in this browser only". The dashboard keeps working either way.
 */
import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';
import {
  useGetDashboardLayoutQuery,
  useSaveDashboardLayoutMutation,
  type DashboardLayout,
} from '@/modules/dashboard/services/dashboardApi';
import { apiErrorMessage } from '@/lib/utils/apiError';
import { hydrateLayout, type DashboardWidgetState } from './dashboardWidgetSlice';

const SAVE_DEBOUNCE_MS = 800;

function toPayload(state: DashboardWidgetState): DashboardLayout {
  return {
    activePreset: state.activePreset,
    widgets: [...state.widgets]
      .sort((a, b) => a.order - b.order)
      .map((w, i) => ({ id: w.id, visible: w.visible, order: i })),
  };
}

/** Canonical form for change detection — the same for a payload and for the server's echo. */
function serialize(layout: DashboardLayout): string {
  return JSON.stringify({
    activePreset: layout.activePreset,
    widgets: [...layout.widgets]
      .sort((a, b) => a.order - b.order)
      .map((w, i) => [w.id, w.visible, i]),
  });
}

export function useDashboardLayoutSync(): void {
  const dispatch = useDispatch();
  const state = useSelector((s: { dashboardWidgets: DashboardWidgetState }) => s.dashboardWidgets);
  const query = useGetDashboardLayoutQuery();
  const [save] = useSaveDashboardLayoutMutation();

  // State, not a ref: completing hydration must re-run the save effect below so a layout
  // the server has never seen (null) is pushed once even when the user changes nothing.
  const [hydrated, setHydrated] = useState(false);
  const lastAcknowledged = useRef<string | null>(null);
  const loadWarned = useRef(false);
  const saveWarned = useRef(false);

  useEffect(() => {
    if (hydrated) return;
    if (query.isError) {
      if (!loadWarned.current) {
        loadWarned.current = true;
        toast.error(
          apiErrorMessage(query.error, 'Your saved dashboard layout could not be loaded — using this browser’s copy.'),
        );
      }
      return;
    }
    if (!query.isSuccess) return;
    const saved = query.data?.data?.layout ?? null;
    if (saved) {
      dispatch(hydrateLayout(saved));
      lastAcknowledged.current = serialize(saved);
    }
    setHydrated(true);
  }, [hydrated, query.isSuccess, query.isError, query.data, query.error, dispatch]);

  useEffect(() => {
    if (!hydrated) return;
    const payload = toPayload(state);
    const json = serialize(payload);
    if (json === lastAcknowledged.current) return;

    const timer = setTimeout(() => {
      save(payload)
        .unwrap()
        .then((res) => {
          lastAcknowledged.current = serialize(res.data ?? payload);
        })
        .catch((err) => {
          if (saveWarned.current) return;
          saveWarned.current = true;
          toast.error(
            apiErrorMessage(err, 'Your dashboard layout could not be saved to your account — it is kept in this browser only.'),
          );
        });
    }, SAVE_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [hydrated, state, save]);
}
