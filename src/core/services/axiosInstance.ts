import axios from 'axios';
import { setupAuthInterceptor } from '@/modules/auth/interceptors/authInterceptor';
import { getApiBaseUrl } from '@/lib/config/runtimeConfig';

let store: any;

const axiosInstance = axios.create({
  // 2026-08-31: was the raw build-time VITE_API_BASE_URL, which ignored the runtime
  // /config.js override. This instance backs baseApi (every RTK Query call), so a
  // published build could not be retargeted without a rebuild. config.js is loaded by
  // index.html before this module evaluates, so the runtime value is available here.
  baseURL: getApiBaseUrl(),
  withCredentials: true,
  timeout: 30000,
  headers: {
    'X-Requested-With': 'XMLHttpRequest',
  },
});

export const injectStore = (_store: any) => {
  store = _store;
  setupAuthInterceptor(axiosInstance, store);
};

export default axiosInstance;
