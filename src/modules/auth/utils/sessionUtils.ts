import { AUTH_STORAGE_KEYS } from '../constants/auth.constants';

export const sessionUtils = {
  getRedirectPath: (): string | null => {
    return localStorage.getItem(AUTH_STORAGE_KEYS.REDIRECT_PATH);
  },

  setRedirectPath: (path: string): void => {
    localStorage.setItem(AUTH_STORAGE_KEYS.REDIRECT_PATH, path);
  },

  clearRedirectPath: (): void => {
    localStorage.removeItem(AUTH_STORAGE_KEYS.REDIRECT_PATH);
  },

  isTokenExpired: (token: string): boolean => {
    try {
      const payload = token.split('.')[1];
      if (!payload) return true;
      const decoded = JSON.parse(window.atob(payload));
      const exp = decoded.exp;
      if (!exp) return false;
      return Date.now() >= exp * 1000;
    } catch {
      return true;
    }
  },
};

export default sessionUtils;
