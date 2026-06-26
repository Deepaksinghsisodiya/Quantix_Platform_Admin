import { combineReducers } from '@reduxjs/toolkit';
import { baseApi } from '../core/services/baseApi';
import authReducer from '../modules/auth/slices/authSlice';
import settingsReducer from '../modules/settings/slices/settingsSlice';

const rootReducer = combineReducers({
  [baseApi.reducerPath]: baseApi.reducer,
  auth: authReducer,
  settings: settingsReducer,
});

export default rootReducer;
export type RootReducerState = ReturnType<typeof rootReducer>;
