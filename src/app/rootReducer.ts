import { combineReducers } from '@reduxjs/toolkit';
import { baseApi } from '../core/services/baseApi';
import authReducer from '../modules/auth/slices/authSlice';
import settingsReducer from '../modules/settings/slices/settingsSlice';
import rateCardsReducer from '../modules/rateCards/store/rateCardSlice';
import filterReducer from '../lib/store/filterSlice';
import dashboardWidgetsReducer from '../lib/store/dashboardWidgetSlice';

const rootReducer = combineReducers({
  [baseApi.reducerPath]: baseApi.reducer,
  auth: authReducer,
  settings: settingsReducer,
  rateCards: rateCardsReducer,
  filters: filterReducer,
  dashboardWidgets: dashboardWidgetsReducer,
});

export default rootReducer;
export type RootReducerState = ReturnType<typeof rootReducer>;
