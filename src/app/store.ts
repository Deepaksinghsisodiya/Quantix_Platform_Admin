import { configureStore } from '@reduxjs/toolkit';
import rootReducer from './rootReducer';
import { baseApi } from '../core/services/baseApi';
import { injectStore } from '../core/services/axiosInstance';

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(baseApi.middleware),
  // 2026-09-04 — ROOT CAUSE of the "RTK results arrive but the page never re-renders"
  // defect chased since Pass 47. configureStore adds RTK's autoBatchEnhancer by default
  // with `type: 'raf'`: RTK Query stamps its pending/fulfilled/rejected actions with
  // meta.RTK_autoBatch, and for those the enhancer does NOT notify store subscribers
  // synchronously — it queues ONE notification via requestAnimationFrame and sets a
  // `notificationQueued` flag. In a document that is not being painted (a background
  // tab, a hidden webview, the embedded browser used for verification) rAF never runs,
  // the flag stays set forever, and every later RTK action skips queueing too — so
  // react-redux never hears about any fetch until some unrelated non-batched action
  // happens to dispatch. Measured directly: 14 RTK dispatches, 0 subscriber calls; one
  // plain dispatch, 1 call; document.visibilityState === 'hidden', rAF never fired.
  // 'tick' queues on a microtask instead, which runs regardless of paint. The batching
  // benefit is kept; the dependency on the page being visible is gone.
  enhancers: (getDefaultEnhancers) =>
    getDefaultEnhancers({ autoBatch: { type: 'tick' } }),
  devTools: import.meta.env.DEV,
});

// Inject store to break circular dependency
injectStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
