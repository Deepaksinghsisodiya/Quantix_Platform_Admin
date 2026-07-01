import axios from 'axios';
import { setupAuthInterceptor } from '@/modules/auth/interceptors/authInterceptor';

let store: any;

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
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
