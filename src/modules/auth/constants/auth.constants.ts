export const AUTH_STORAGE_KEYS = {
  ACCESS_TOKEN: 'quantix_access_token',
  REFRESH_TOKEN: 'quantix_refresh_token', // fallback if not HTTP-only
  REDIRECT_PATH: 'quantix_auth_redirect',
};

export const AUTH_ROUTES = {
  LOGIN: '/login',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  MFA_SETUP: '/mfa-setup',
  CHANGE_PASSWORD: '/change-password',
  SESSION_EXPIRED: '/session-expired',
  UNAUTHORIZED: '/unauthorized',
  FORBIDDEN: '/forbidden',
  DEFAULT_REDIRECT: '/dashboard',
  MERCHANT_REDIRECT: '/merchant/dashboard',
};

export const MFA_LIMITS = {
  CODE_LENGTH: 6,
  BACKUP_CODE_LENGTH: 8,
};
